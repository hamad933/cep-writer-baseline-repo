import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {createReleaseCompareProvider,releaseCandidateRef,RELEASE_COMPARE_PROVIDER_ID} from './release-compare-provider.js';

export const RELEASES_DOMAIN_OWNER='ReleasesDomainAdapter';
export const RELEASES_COMMANDS=Object.freeze(['releases.inspect','releases.compare','releases.plan','releases.requestAuthorization']);
export type CandidateState='ASSEMBLED'|'TECHNICALLY_READY'|'NOT_READY';
export type AuthorizationState='NONE'|'REQUESTED'|'GRANTED'|'REVOKED';
export type DeploymentState='NOT_DEPLOYED'|'IN_PROGRESS'|'DEPLOYED'|'FAILED'|'UNKNOWN';
export type ReleaseCandidateRef={candidateId:string;commitSHA:string;treeSHA:string;artifactDigest:string};
export type ReleaseEvidenceResult='PASS'|'WARN'|'FAIL'|'UNKNOWN';
export type ReleaseEvidenceItem={
  evidenceId:string;
  candidateRef:ReleaseCandidateRef;
  kind:string;
  producer:string;
  check:string;
  observedAt:string;
  artifactDigest:string;
  result:ReleaseEvidenceResult;
  reviewerDecisionRef?:string|null;
  evidenceRefs?:string[];
};
export type ReleaseEvidenceBinding={
  digest:string;
  candidateRef:ReleaseCandidateRef;
  method:string;
  evidenceRefs?:string[];
  packages?:ReleaseEvidenceItem[];
};
export type ReleaseDeploymentObservation={
  providerId:string;
  candidateRef:ReleaseCandidateRef;
  state:DeploymentState;
  observedAt:string;
};
export type ReleaseCandidate={
  candidateId:string;
  commitSHA:string;
  treeSHA:string;
  artifactDigest:string;
  state:CandidateState;
  evidenceDigest:string|null;
  evidenceBinding?:ReleaseEvidenceBinding|null;
  authorization:AuthorizationState;
  deployment:DeploymentState;
  deploymentObservedAt:string|null;
  deploymentObservation?:ReleaseDeploymentObservation|null;
};
export type AuthorizationRequester={request:(candidate:ReleaseCandidate)=>{requestId:string;state:'REQUESTED'}};

const clone=<T>(value:T):T=>structuredClone(value);
const hex=(value:any)=>/^[a-f0-9]{32,128}$/i.test(value||'');
const nonEmpty=(value:any)=>typeof value==='string'&&Boolean(value.trim());
const exactRefMatches=(row:ReleaseCandidate,ref:ReleaseCandidateRef)=>row.candidateId===ref.candidateId&&row.commitSHA===ref.commitSHA&&row.treeSHA===ref.treeSHA&&row.artifactDigest===ref.artifactDigest;
const exactRefEquals=(left:ReleaseCandidateRef,right:ReleaseCandidateRef)=>left.candidateId===right.candidateId&&left.commitSHA===right.commitSHA&&left.treeSHA===right.treeSHA&&left.artifactDigest===right.artifactDigest;

const normalizeEvidenceItem=(row:ReleaseCandidate,item:ReleaseEvidenceItem):ReleaseEvidenceItem=>{
  const normalized=clone(item);
  if(!nonEmpty(normalized?.evidenceId)||!nonEmpty(normalized.kind)||!nonEmpty(normalized.producer)||!nonEmpty(normalized.check)||!nonEmpty(normalized.observedAt))throw Error('RELEASE_EVIDENCE_PACKAGE_FIELDS_REQUIRED');
  if(!hex(normalized.artifactDigest))throw Error('RELEASE_EVIDENCE_PACKAGE_DIGEST_INVALID');
  if(!['PASS','WARN','FAIL','UNKNOWN'].includes(normalized.result))throw Error('RELEASE_EVIDENCE_PACKAGE_RESULT_INVALID');
  if(!normalized.candidateRef||!exactRefMatches(row,normalized.candidateRef))throw Error('RELEASE_EVIDENCE_PACKAGE_CANDIDATE_BINDING_MISMATCH');
  if(normalized.evidenceRefs!==undefined&&!Array.isArray(normalized.evidenceRefs))throw Error('RELEASE_EVIDENCE_PACKAGE_REFS_INVALID');
  if(normalized.reviewerDecisionRef!==undefined&&normalized.reviewerDecisionRef!==null&&!nonEmpty(normalized.reviewerDecisionRef))throw Error('RELEASE_EVIDENCE_REVIEWER_DECISION_REF_INVALID');
  return normalized;
};

const normalizeEvidence=(row:ReleaseCandidate):ReleaseEvidenceBinding|null=>{
  if(!row.evidenceDigest)return null;
  if(!hex(row.evidenceDigest))throw Error('RELEASE_EVIDENCE_DIGEST_INVALID');
  const supplied=row.evidenceBinding;
  const binding:satisfies<ReleaseEvidenceBinding>=supplied?clone(supplied):{
    digest:row.evidenceDigest,
    candidateRef:{candidateId:row.candidateId,commitSHA:row.commitSHA,treeSHA:row.treeSHA,artifactDigest:row.artifactDigest},
    method:'INLINE_EXACT_CANDIDATE_RECORD',
    evidenceRefs:[],
    packages:[]
  };
  if(binding.digest!==row.evidenceDigest||!exactRefMatches(row,binding.candidateRef))throw Error('RELEASE_EVIDENCE_CANDIDATE_BINDING_MISMATCH');
  if(!nonEmpty(binding.method))throw Error('RELEASE_EVIDENCE_METHOD_REQUIRED');
  if(binding.evidenceRefs!==undefined&&!Array.isArray(binding.evidenceRefs))throw Error('RELEASE_EVIDENCE_REFS_INVALID');
  if(binding.packages!==undefined&&!Array.isArray(binding.packages))throw Error('RELEASE_EVIDENCE_PACKAGES_INVALID');
  binding.packages=(binding.packages||[]).map(item=>normalizeEvidenceItem(row,item));
  return binding;
};

const normalizeDeploymentObservation=(row:ReleaseCandidate):ReleaseDeploymentObservation|null=>{
  const supplied=row.deploymentObservation;
  if(!supplied)return null;
  const observation=clone(supplied);
  if(!nonEmpty(observation.providerId)||!nonEmpty(observation.observedAt))throw Error('DEPLOYMENT_OBSERVATION_PROVIDER_FIELDS_REQUIRED');
  if(!['NOT_DEPLOYED','IN_PROGRESS','DEPLOYED','FAILED','UNKNOWN'].includes(observation.state))throw Error('DEPLOYMENT_STATE_INVALID');
  if(!observation.candidateRef||!exactRefMatches(row,observation.candidateRef))throw Error('DEPLOYMENT_OBSERVATION_CANDIDATE_BINDING_MISMATCH');
  if(observation.state!==row.deployment)throw Error('DEPLOYMENT_OBSERVATION_STATE_MISMATCH');
  if(row.deploymentObservedAt!==null&&row.deploymentObservedAt!==observation.observedAt)throw Error('DEPLOYMENT_OBSERVATION_TIMESTAMP_MISMATCH');
  row.deploymentObservedAt=observation.observedAt;
  return observation;
};

export class ReleasesDomainAdapter{
  readonly owner=RELEASES_DOMAIN_OWNER;
  private candidates=new Map<string,ReleaseCandidate>();
  private selectedId:string|null=null;
  private requester:AuthorizationRequester|null;
  private history:any[]=[];
  private _compareOwner:AnalyticalCompareOwner|null=null;
  private compareProvider:any;

  constructor({candidates=[],requester=null,analyticalCompareOwner=null}:{candidates?:ReleaseCandidate[];requester?:AuthorizationRequester|null;analyticalCompareOwner?:AnalyticalCompareOwner|null}={}){
    this.requester=requester;
    for(const row of candidates)this.put(row);
    this.compareProvider=createReleaseCompareProvider(ref=>this.resolveExact(ref));
    if(analyticalCompareOwner)this.bindAnalyticalCompareOwner(analyticalCompareOwner);
  }

  get compareOwner(){return this._compareOwner;}

  bindAnalyticalCompareOwner(owner:AnalyticalCompareOwner){
    if(!owner||owner.ownerToken!=='AnalyticalCompare'||owner.owner!=='AnalyticalCompareOwner')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
    if(this._compareOwner&&this._compareOwner!==owner)throw Error('ANALYTICAL_COMPARE_OWNER_MISMATCH');
    if(!owner.providerIds().includes(this.compareProvider.descriptor().providerId))owner.registerProvider(this.compareProvider);
    else if(this._compareOwner!==owner)throw Error('RELEASE_COMPARE_PROVIDER_ALREADY_BOUND_TO_DIFFERENT_ADAPTER');
    this._compareOwner=owner;
    return owner;
  }

  private put(input:ReleaseCandidate){
    const row=clone(input);
    if(!row?.candidateId||!hex(row.commitSHA)||!hex(row.treeSHA)||!hex(row.artifactDigest))throw Error('RELEASE_CANDIDATE_IDENTITY_INVALID');
    if(!['ASSEMBLED','TECHNICALLY_READY','NOT_READY'].includes(row.state)||!['NONE','REQUESTED','GRANTED','REVOKED'].includes(row.authorization)||!['NOT_DEPLOYED','IN_PROGRESS','DEPLOYED','FAILED','UNKNOWN'].includes(row.deployment))throw Error('RELEASE_CANDIDATE_STATE_INVALID');
    row.evidenceBinding=normalizeEvidence(row);
    row.deploymentObservation=normalizeDeploymentObservation(row);
    this.candidates.set(row.candidateId,row);
  }

  private resolveExact(ref:ReleaseCandidateRef){
    const row=this.candidates.get(ref.candidateId);
    return row&&exactRefMatches(row,ref)?clone(row):null;
  }

  private deploymentTruthFor(row:ReleaseCandidate){
    const observation=row.deploymentObservation??null;
    return {
      state:observation?.state??'UNKNOWN' as DeploymentState,
      observedAt:observation?.observedAt??null,
      providerId:observation?.providerId??null,
      providerState:observation?'OBSERVED':'UNAVAILABLE_OR_UNBOUND',
      attributionAllowed:Boolean(observation),
      rawCandidateClaim:row.deployment,
      inferred:false
    };
  }

  private evidenceCoverageFor(row:ReleaseCandidate){
    const binding=row.evidenceBinding??null;
    if(!binding)return {state:'DATA_COVERAGE_BLOCKER',bound:false,packageCount:0,blockingReasons:['EXACT_CANDIDATE_EVIDENCE_MISSING']};
    const packages=binding.packages||[];
    const negative=packages.filter(item=>item.result==='FAIL'||item.result==='UNKNOWN').map(item=>`${item.evidenceId}:${item.result}`);
    return {state:negative.length?'BOUND_WITH_BLOCKERS':'BOUND',bound:true,packageCount:packages.length,blockingReasons:negative};
  }

  rows(){return [...this.candidates.values()].map(clone);}
  select(id:string|null){if(id!==null&&!this.candidates.has(id))throw Error('RELEASE_CANDIDATE_UNKNOWN');this.selectedId=id;return this.selected();}
  selected(){return this.selectedId?clone(this.candidates.get(this.selectedId)!):null;}
  exactRef(id:string){const row=this.candidates.get(id);if(!row)throw Error('RELEASE_CANDIDATE_UNKNOWN');return releaseCandidateRef(row);}

  evidenceCoverage(id:string){const row=this.candidates.get(id);if(!row)throw Error('RELEASE_CANDIDATE_UNKNOWN');return clone(this.evidenceCoverageFor(row));}
  deploymentTruth(id:string){const row=this.candidates.get(id);if(!row)throw Error('RELEASE_CANDIDATE_UNKNOWN');return clone(this.deploymentTruthFor(row));}

  inspect(id=this.selectedId){
    const row=id?this.candidates.get(id):null;
    if(!row)return {ok:false,code:'NO_CANDIDATE',dataCoverage:'DATA_COVERAGE_BLOCKER',requirements:['candidateId','commitSHA','treeSHA','artifactDigest']};
    const evidenceCoverage=this.evidenceCoverageFor(row),deploymentTruth=this.deploymentTruthFor(row);
    return {
      ok:true,
      candidate:clone(row),
      candidateRef:releaseCandidateRef(row),
      evidenceBinding:clone(row.evidenceBinding??null),
      evidenceCoverage:clone(evidenceCoverage),
      deploymentTruth:clone(deploymentTruth),
      truth:{
        ciPassIsAcceptance:false,
        technicalReadinessIsAuthorization:false,
        authorizationIsDeployment:false,
        readinessExecutesDeployment:false,
        authorizationExecutesDeployment:false,
        unknownDeploymentRemainsUnknown:deploymentTruth.state==='UNKNOWN',
        deploymentWithoutBoundObservationIsUnknown:deploymentTruth.state==='UNKNOWN'&&!deploymentTruth.attributionAllowed,
        technicalReadinessAttributionAllowed:row.state!=='TECHNICALLY_READY'||evidenceCoverage.bound
      }
    };
  }

  compareExactPair({leftId,rightId}:{leftId:string;rightId:string}){
    if(!this._compareOwner)return {ok:false,code:'ANALYTICAL_COMPARE_INTEGRATION_REQUIRED',mutated:false,evidenceAttributionAllowed:false};
    if(!leftId||!rightId)throw Error('RELEASE_COMPARE_PAIR_REQUIRED');
    if(leftId===rightId)throw Error('RELEASE_COMPARE_DISTINCT_CANDIDATES_REQUIRED');
    const left=this.candidates.get(leftId),right=this.candidates.get(rightId);
    if(!left||!right)throw Error('RELEASE_COMPARE_CANDIDATE_UNKNOWN');
    const pair=this._compareOwner.createPair({left:{providerId:RELEASE_COMPARE_PROVIDER_ID,ref:releaseCandidateRef(left)},right:{providerId:RELEASE_COMPARE_PROVIDER_ID,ref:releaseCandidateRef(right)}});
    const result=this._compareOwner.comparePair(pair);
    return {ok:result.state!=='ERROR',mode:'EXACT_PAIR',pairId:pair.pairId,pinned:true,mutable:false,leftRef:clone(pair.left.ref),rightRef:clone(pair.right.ref),state:result.state,differences:clone(result.differences),provenance:clone(result.provenance),receipt:clone(result.receipt),evidenceAttributionAllowed:result.state!=='ERROR'};
  }

  compare(payload:{leftId?:string;rightId?:string;id?:string|null;currentHeadCommitSHA?:string}){
    if(payload?.leftId||payload?.rightId)return this.compareExactPair({leftId:String(payload.leftId||''),rightId:String(payload.rightId||'')});
    const row=payload?.id?this.candidates.get(payload.id):this.selectedId?this.candidates.get(this.selectedId):null;
    if(!row)throw Error('RELEASE_CANDIDATE_REQUIRED');
    const currentHeadCommitSHA=String(payload?.currentHeadCommitSHA||''),stale=Boolean(currentHeadCommitSHA&&currentHeadCommitSHA!==row.commitSHA),coverage=this.evidenceCoverageFor(row);
    return {ok:true,mode:'HEAD_STALENESS_COMPAT',candidateId:row.candidateId,pinnedCommitSHA:row.commitSHA,currentHeadCommitSHA,stale,evidenceAttributionAllowed:!stale&&row.state==='TECHNICALLY_READY'&&coverage.bound,doesNotReplaceExactPairCompare:true};
  }

  plan(id=this.selectedId){
    const row=id?this.candidates.get(id):null;
    if(!row)return {ok:false,code:'NO_CANDIDATE',dataCoverage:'DATA_COVERAGE_BLOCKER',steps:['assemble exact candidate','bind evidence','request explicit authorization','observe deployment separately']};
    return {
      ok:true,
      candidateId:row.candidateId,
      candidateRef:releaseCandidateRef(row),
      technicalEvidence:clone(row.evidenceBinding??null),
      evidenceCoverage:clone(this.evidenceCoverageFor(row)),
      authorization:row.authorization,
      deploymentTruth:clone(this.deploymentTruthFor(row)),
      steps:['verify exact commit/tree/artifact identity','bind technical evidence to same candidate','request explicit Owner/Parent authorization','observe deployment through a separate bound provider'],
      executesAuthorization:false,
      executesDeployment:false,
      grantsDeploymentAuthorization:false
    };
  }

  requestAuthorization(id=this.selectedId){
    const row=id?this.candidates.get(id):null;
    if(!row)throw Error('RELEASE_CANDIDATE_REQUIRED');
    if(row.state!=='TECHNICALLY_READY'||!row.evidenceDigest||!row.evidenceBinding)return {ok:false,code:'TECHNICAL_READINESS_REQUIRED'};
    if(!exactRefMatches(row,row.evidenceBinding.candidateRef))return {ok:false,code:'EVIDENCE_CANDIDATE_MISMATCH'};
    if(!this.requester)return {ok:false,code:'AUTHORIZATION_REQUEST_PROVIDER_UNAVAILABLE',authorization:row.authorization,deployment:row.deployment,deploymentTruth:this.deploymentTruthFor(row)};
    const result=this.requester.request(clone(row));
    row.authorization=result.state;
    this.history.push({type:'AUTHORIZATION_REQUESTED',candidateId:row.candidateId,candidateRef:releaseCandidateRef(row),evidenceDigest:row.evidenceDigest,requestId:result.requestId});
    return {ok:true,code:'AUTHORIZATION_REQUESTED',requestId:result.requestId,authorization:row.authorization,deployment:row.deployment,deploymentTruth:this.deploymentTruthFor(row),technicalReadiness:row.state,executesAuthorizationDecision:false,executesDeployment:false,grantsDeploymentAuthorization:false};
  }

  observeDeployment(id:string,observation:ReleaseDeploymentObservation){
    const row=this.candidates.get(id);
    if(!row)throw Error('RELEASE_CANDIDATE_UNKNOWN');
    if(!observation?.candidateRef||!exactRefMatches(row,observation.candidateRef))throw Error('DEPLOYMENT_OBSERVATION_CANDIDATE_BINDING_MISMATCH');
    if(!nonEmpty(observation.providerId)||!nonEmpty(observation.observedAt))throw Error('DEPLOYMENT_OBSERVATION_PROVIDER_FIELDS_REQUIRED');
    if(!['NOT_DEPLOYED','IN_PROGRESS','DEPLOYED','FAILED','UNKNOWN'].includes(observation.state))throw Error('DEPLOYMENT_STATE_INVALID');
    row.deployment=observation.state;
    row.deploymentObservedAt=observation.observedAt;
    row.deploymentObservation=clone(observation);
    this.history.push({type:'DEPLOYMENT_OBSERVED',candidateId:id,candidateRef:releaseCandidateRef(row),providerId:observation.providerId,state:observation.state,observedAt:observation.observedAt});
    return {candidate:clone(row),deploymentTruth:clone(this.deploymentTruthFor(row))};
  }

  availability(id:string,payload:any={}){
    const row=this.candidates.get(payload.id??this.selectedId??'');
    if(id==='releases.inspect')return true;
    if(id==='releases.compare'){
      if(!this._compareOwner)return {enabled:false,code:'ANALYTICAL_COMPARE_INTEGRATION_REQUIRED',reason:'Releases requires the controller-injected AnalyticalCompareOwner.',availabilityOwner:this.owner};
      if(!payload.leftId||!payload.rightId)return 'Select two exact ReleaseCandidates';
      if(payload.leftId===payload.rightId)return 'Select two distinct exact ReleaseCandidates';
      if(!this.candidates.has(payload.leftId)||!this.candidates.has(payload.rightId))return 'Resolve both exact ReleaseCandidate identities before compare';
      return true;
    }
    if(id==='releases.plan')return row?true:'Select a ReleaseCandidate';
    if(id==='releases.requestAuthorization'){
      if(!row)return 'Select a ReleaseCandidate';
      if(row.state!=='TECHNICALLY_READY'||!row.evidenceDigest||!row.evidenceBinding)return 'Exact candidate technical readiness evidence required';
      if(!this.requester)return 'Authorization request provider unavailable';
      return true;
    }
    return 'Unknown Releases command';
  }

  bindCommands(bus:SemanticCommandBus){
    for(const id of RELEASES_COMMANDS)bus.registerCommand(id,this.owner,id.split('.').at(-1)!,p=>{
      if(id==='releases.inspect')return this.inspect(p.id??this.selectedId);
      if(id==='releases.compare')return this.compareExactPair({leftId:p.leftId,rightId:p.rightId});
      if(id==='releases.plan')return this.plan(p.id??this.selectedId);
      return this.requestAuthorization(p.id??this.selectedId);
    },p=>this.availability(id,p));
    return bus;
  }

  diagnosticProjection(){
    const candidates=this.rows().map(row=>({
      ...row,
      evidenceCoverage:this.evidenceCoverageFor(row),
      deploymentTruth:this.deploymentTruthFor(row)
    }));
    return {
      owner:this.owner,
      selectedId:this.selectedId,
      candidates,
      history:clone(this.history),
      dataCoverage:candidates.length?'CANDIDATE_DATA_PRESENT':'DATA_COVERAGE_BLOCKER',
      compareOwner:this._compareOwner?.owner||null,
      compareProviderId:this._compareOwner?RELEASE_COMPARE_PROVIDER_ID:null,
      authorizationRequestProvider:this.requester?'AVAILABLE':'UNAVAILABLE',
      truthCeiling:{technicalReadinessIsOwnerAuthorization:false,ownerAuthorizationIsDeployment:false,deploymentExecutionCapability:'NOT_OWNED',deploymentAuthorizationCapability:'NOT_OWNED'},
      deploymentExecutionCapability:'NOT_OWNED',
      deploymentObservationRequiresExactCandidateProviderBinding:true,
      deploymentProviderMayBeUnavailable:true
    };
  }
}
