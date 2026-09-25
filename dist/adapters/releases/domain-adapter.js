import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {createReleaseCompareProvider,releaseCandidateRef,RELEASE_COMPARE_PROVIDER_ID} from './release-compare-provider.js';

export const RELEASES_DOMAIN_OWNER='ReleasesDomainAdapter';
export const RELEASES_COMMANDS=Object.freeze(['releases.inspect','releases.compare','releases.plan','releases.requestAuthorization']);
                                                                       
                                                                      
                                                                                       
                                                                                                           
                                                                                                                         
                                                                                                                                                                                                                                                                                                  
                                                                                                                
const clone=   (value  )  =>structuredClone(value);
const hex=(value    )=>/^[a-f0-9]{32,128}$/i.test(value||'');
const exactRefMatches=(row                 ,ref                    )=>row.candidateId===ref.candidateId&&row.commitSHA===ref.commitSHA&&row.treeSHA===ref.treeSHA&&row.artifactDigest===ref.artifactDigest;
const normalizeEvidence=(row                 )                            =>{
  if(!row.evidenceDigest)return null;
  if(!hex(row.evidenceDigest))throw Error('RELEASE_EVIDENCE_DIGEST_INVALID');
  const supplied=row.evidenceBinding;
  const binding                                  =supplied?clone(supplied):{digest:row.evidenceDigest,candidateRef:{candidateId:row.candidateId,commitSHA:row.commitSHA,treeSHA:row.treeSHA,artifactDigest:row.artifactDigest},method:'INLINE_EXACT_CANDIDATE_RECORD',evidenceRefs:[]};
  if(binding.digest!==row.evidenceDigest||!exactRefMatches(row,binding.candidateRef))throw Error('RELEASE_EVIDENCE_CANDIDATE_BINDING_MISMATCH');
  if(typeof binding.method!=='string'||!binding.method.trim())throw Error('RELEASE_EVIDENCE_METHOD_REQUIRED');
  if(binding.evidenceRefs!==undefined&&!Array.isArray(binding.evidenceRefs))throw Error('RELEASE_EVIDENCE_REFS_INVALID');
  return binding;
};
export class ReleasesDomainAdapter{
           owner=RELEASES_DOMAIN_OWNER;        candidates=new Map                         ();        selectedId            =null;        requester                            ;        history      =[];         compareOwner                       ;        compareProvider    ;
  constructor({candidates=[],requester=null,analyticalCompareOwner=null}                                                                                                                            ={}){
    this.requester=requester;for(const row of candidates)this.put(row);
    this.compareOwner=analyticalCompareOwner||new AnalyticalCompareOwner();
    if(this.compareOwner?.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
    this.compareProvider=createReleaseCompareProvider(ref=>this.resolveExact(ref));
    if(!this.compareOwner.providerIds().includes(this.compareProvider.descriptor().providerId)){
      this.compareOwner.registerProvider(this.compareProvider);
    }
  }
          put(input                 ){const row=clone(input);if(!row?.candidateId||!hex(row.commitSHA)||!hex(row.treeSHA)||!hex(row.artifactDigest))throw Error('RELEASE_CANDIDATE_IDENTITY_INVALID');if(!['ASSEMBLED','TECHNICALLY_READY','NOT_READY'].includes(row.state)||!['NONE','REQUESTED','GRANTED','REVOKED'].includes(row.authorization)||!['NOT_DEPLOYED','IN_PROGRESS','DEPLOYED','FAILED','UNKNOWN'].includes(row.deployment))throw Error('RELEASE_CANDIDATE_STATE_INVALID');row.evidenceBinding=normalizeEvidence(row);this.candidates.set(row.candidateId,row);}
          resolveExact(ref                    ){const row=this.candidates.get(ref.candidateId);return row&&exactRefMatches(row,ref)?clone(row):null;}
  rows(){return [...this.candidates.values()].map(clone);}
  select(id            ){if(id!==null&&!this.candidates.has(id))throw Error('RELEASE_CANDIDATE_UNKNOWN');this.selectedId=id;return this.selected();}
  selected(){return this.selectedId?clone(this.candidates.get(this.selectedId) ):null;}
  exactRef(id       ){const row=this.candidates.get(id);if(!row)throw Error('RELEASE_CANDIDATE_UNKNOWN');return releaseCandidateRef(row);}
  inspect(id=this.selectedId){const row=id?this.candidates.get(id):null;if(!row)return {ok:false,code:'NO_CANDIDATE',requirements:['candidateId','commitSHA','treeSHA','artifactDigest']};return {ok:true,candidate:clone(row),evidenceBinding:clone(row.evidenceBinding??null),truth:{ciPassIsAcceptance:false,technicalReadinessIsAuthorization:false,authorizationIsDeployment:false,readinessExecutesDeployment:false,unknownDeploymentRemainsUnknown:row.deployment==='UNKNOWN'}};}
  compareExactPair({leftId,rightId}                               ){if(!leftId||!rightId)throw Error('RELEASE_COMPARE_PAIR_REQUIRED');if(leftId===rightId)throw Error('RELEASE_COMPARE_DISTINCT_CANDIDATES_REQUIRED');const left=this.candidates.get(leftId),right=this.candidates.get(rightId);if(!left||!right)throw Error('RELEASE_COMPARE_CANDIDATE_UNKNOWN');const pair=this.compareOwner.createPair({left:{providerId:RELEASE_COMPARE_PROVIDER_ID,ref:releaseCandidateRef(left)},right:{providerId:RELEASE_COMPARE_PROVIDER_ID,ref:releaseCandidateRef(right)}}),result=this.compareOwner.comparePair(pair);return {ok:result.state!=='ERROR',mode:'EXACT_PAIR',pairId:pair.pairId,pinned:true,mutable:false,leftRef:clone(pair.left.ref),rightRef:clone(pair.right.ref),state:result.state,differences:clone(result.differences),provenance:clone(result.provenance),receipt:clone(result.receipt),evidenceAttributionAllowed:result.state!=='ERROR'};}
  compare(payload                                                                              ){
    if(payload?.leftId||payload?.rightId)return this.compareExactPair({leftId:String(payload.leftId||''),rightId:String(payload.rightId||'')});
    const row=payload?.id?this.candidates.get(payload.id):this.selectedId?this.candidates.get(this.selectedId):null;if(!row)throw Error('RELEASE_CANDIDATE_REQUIRED');const currentHeadCommitSHA=String(payload?.currentHeadCommitSHA||''),stale=Boolean(currentHeadCommitSHA&&currentHeadCommitSHA!==row.commitSHA);return {ok:true,mode:'HEAD_STALENESS_COMPAT',candidateId:row.candidateId,pinnedCommitSHA:row.commitSHA,currentHeadCommitSHA,stale,evidenceAttributionAllowed:!stale&&row.state==='TECHNICALLY_READY',doesNotReplaceExactPairCompare:true};
  }
  plan(id=this.selectedId){const row=id?this.candidates.get(id):null;if(!row)return {ok:false,code:'NO_CANDIDATE',steps:['assemble exact candidate','bind evidence','request explicit authorization','observe deployment separately']};return {ok:true,candidateId:row.candidateId,candidateRef:releaseCandidateRef(row),technicalEvidence:clone(row.evidenceBinding??null),authorization:row.authorization,deployment:row.deployment,steps:['verify exact commit/tree/artifact identity','bind technical evidence to same candidate','request explicit Owner/Parent authorization','observe deployment through separate provider'],executesAuthorization:false,executesDeployment:false};}
  requestAuthorization(id=this.selectedId){const row=id?this.candidates.get(id):null;if(!row)throw Error('RELEASE_CANDIDATE_REQUIRED');if(row.state!=='TECHNICALLY_READY'||!row.evidenceDigest||!row.evidenceBinding)return {ok:false,code:'TECHNICAL_READINESS_REQUIRED'};if(!exactRefMatches(row,row.evidenceBinding.candidateRef))return {ok:false,code:'EVIDENCE_CANDIDATE_MISMATCH'};if(!this.requester)return {ok:false,code:'AUTHORIZATION_REQUEST_PROVIDER_UNAVAILABLE',authorization:row.authorization,deployment:row.deployment};const result=this.requester.request(clone(row));row.authorization=result.state;this.history.push({type:'AUTHORIZATION_REQUESTED',candidateId:row.candidateId,candidateRef:releaseCandidateRef(row),evidenceDigest:row.evidenceDigest,requestId:result.requestId});return {ok:true,code:'AUTHORIZATION_REQUESTED',requestId:result.requestId,authorization:row.authorization,deployment:row.deployment,technicalReadiness:row.state,executesAuthorizationDecision:false,executesDeployment:false};}
  observeDeployment(id       ,observation                                          ){const row=this.candidates.get(id);if(!row)throw Error('RELEASE_CANDIDATE_UNKNOWN');if(!['NOT_DEPLOYED','IN_PROGRESS','DEPLOYED','FAILED','UNKNOWN'].includes(observation.state))throw Error('DEPLOYMENT_STATE_INVALID');row.deployment=observation.state;row.deploymentObservedAt=observation.observedAt;this.history.push({type:'DEPLOYMENT_OBSERVED',candidateId:id,state:observation.state,observedAt:observation.observedAt});return clone(row);}
  availability(id       ,payload    ={}){const row=this.candidates.get(payload.id??this.selectedId??'');if(id==='releases.inspect')return true;if(id==='releases.compare'){if(!payload.leftId||!payload.rightId)return 'Select two exact ReleaseCandidates';if(payload.leftId===payload.rightId)return 'Select two distinct exact ReleaseCandidates';if(!this.candidates.has(payload.leftId)||!this.candidates.has(payload.rightId))return 'Resolve both exact ReleaseCandidate identities before compare';return true;}if(id==='releases.plan')return row?true:'Select a ReleaseCandidate';if(id==='releases.requestAuthorization'){if(!row)return 'Select a ReleaseCandidate';if(row.state!=='TECHNICALLY_READY'||!row.evidenceDigest||!row.evidenceBinding)return 'Exact candidate technical readiness evidence required';if(!this.requester)return 'Authorization request provider unavailable';return true;}return 'Unknown Releases command';}
  bindCommands(bus                   ){for(const id of RELEASES_COMMANDS)bus.registerCommand(id,this.owner,id.split('.').at(-1) ,p=>{if(id==='releases.inspect')return this.inspect(p.id??this.selectedId);if(id==='releases.compare')return this.compareExactPair({leftId:p.leftId,rightId:p.rightId});if(id==='releases.plan')return this.plan(p.id??this.selectedId);return this.requestAuthorization(p.id??this.selectedId);},p=>this.availability(id,p));return bus;}
  diagnosticProjection(){return {owner:this.owner,selectedId:this.selectedId,candidates:this.rows(),history:clone(this.history),compareOwner:this.compareOwner.owner,compareProviderId:RELEASE_COMPARE_PROVIDER_ID,truthCeiling:{technicalReadinessIsOwnerAuthorization:false,ownerAuthorizationIsDeployment:false,deploymentExecutionCapability:'NOT_OWNED'},deploymentExecutionCapability:'NOT_OWNED',deploymentProviderMayBeUnavailable:true};}
}
