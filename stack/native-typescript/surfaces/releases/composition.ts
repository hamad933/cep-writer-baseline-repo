import {assertCanonicalSemanticCommandBus} from '../../foundation/global/commands.js';
import {CollectionTableMatrixPresentationCore,type CollectionTableMatrixDomainAdapter} from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {ReleasesDomainAdapter,RELEASES_COMMANDS} from '../../adapters/releases/domain-adapter.js';

export const RELEASES_SURFACE_ID='releases';

export function createReleasesSurfaceComposition({adapter=null,commands=null,analyticalCompareOwner=null}={}){
  commands=assertCanonicalSemanticCommandBus(commands,'releases.composition');
  adapter=adapter||new ReleasesDomainAdapter();
  if(analyticalCompareOwner)adapter.bindAnalyticalCompareOwner(analyticalCompareOwner);
  adapter.bindCommands(commands);

  const tableAdapter:CollectionTableMatrixDomainAdapter<any>={
    adapterId:'releases.candidates',
    rows:()=>adapter.rows(),
    rowId:r=>r.candidateId,
    rowLabel:r=>r.candidateId,
    searchableText:r=>`${r.candidateId} ${r.commitSHA} ${r.treeSHA} ${r.artifactDigest} ${r.state} ${r.authorization} ${adapter.deploymentTruth(r.candidateId).state}`,
    columns:[
      {id:'candidate',label:'Candidate',cell:r=>({text:r.candidateId,secondary:r.commitSHA,direction:'ltr'})},
      {id:'readiness',label:'Technical readiness',cell:r=>{const coverage=adapter.evidenceCoverage(r.candidateId);return {text:coverage.bound?r.state:'DATA COVERAGE BLOCKER',secondary:coverage.bound?`${coverage.packageCount} evidence package(s)`:'Exact candidate evidence missing',tone:coverage.bound?(r.state==='TECHNICALLY_READY'?'success':r.state==='NOT_READY'?'danger':'warning'):'warning'};}},
      {id:'evidence',label:'Candidate evidence',cell:r=>{const coverage=adapter.evidenceCoverage(r.candidateId);return {text:coverage.bound?'BOUND':'MISSING',secondary:r.evidenceDigest||'No candidate-bound evidence',tone:coverage.bound?'success':'warning',direction:'ltr'};}},
      {id:'authorization',label:'Owner authorization',cell:r=>({text:r.authorization,secondary:'Independent human authority plane'})},
      {id:'deployment',label:'Deployment observation',cell:r=>{const truth=adapter.deploymentTruth(r.candidateId);return {text:truth.state,secondary:truth.attributionAllowed?`${truth.providerId} · ${truth.observedAt}`:'Provider unavailable or unbound; UNKNOWN is the effective truth',tone:truth.state==='DEPLOYED'?'success':truth.state==='FAILED'?'danger':'warning',direction:'ltr'};}}
    ],
    actions:()=>[
      {id:'releases.inspect',label:'Inspect'},
      {id:'releases.compare',label:'Compare exact pair'},
      {id:'releases.plan',label:'Plan'},
      {id:'releases.requestAuthorization',label:'Request authorization'}
    ]
  };

  const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
  const contextProvider=defineContextDescriptorProvider({
    id:'releases.context',
    family:'releases',
    owner:adapter.owner,
    describe:({id}:any={})=>{
      const row=adapter.rows().find(item=>item.candidateId===(id??adapter.selected()?.candidateId));
      const evidenceCoverage=row?adapter.evidenceCoverage(row.candidateId):null;
      const deploymentTruth=row?adapter.deploymentTruth(row.candidateId):null;
      return {
        id:`releases:${row?.candidateId||'empty'}`,
        providerId:'releases.context',
        family:'releases',
        subject:row?.candidateId||'No ReleaseCandidate selected',
        eyebrow:'Releases',
        summary:row?`${row.state} · evidence ${evidenceCoverage?.state} · authorization ${row.authorization} · deployment ${deploymentTruth?.state}`:'No lawful candidate data means no green readiness.',
        domainOwner:adapter.owner,
        revisionToken:row?.artifactDigest||null,
        lenses:[{
          id:'identity',
          label:'Exact candidate',
          tabs:[{
            id:'candidate',
            label:'Candidate',
            fields:row?[
              {id:'commit',label:'Commit SHA',value:row.commitSHA,technical:true},
              {id:'tree',label:'Tree SHA',value:row.treeSHA,technical:true},
              {id:'artifact',label:'Artifact digest',value:row.artifactDigest,technical:true},
              {id:'evidence',label:'Evidence digest',value:row.evidenceDigest||'MISSING',technical:true},
              {id:'coverage',label:'Evidence coverage',value:evidenceCoverage?.state||'DATA_COVERAGE_BLOCKER'},
              {id:'authorization',label:'Owner authorization',value:row.authorization},
              {id:'deployment',label:'Deployment observation',value:deploymentTruth?.state||'UNKNOWN'},
              {id:'deploymentProvider',label:'Deployment provider',value:deploymentTruth?.providerId||'UNAVAILABLE_OR_UNBOUND',technical:true},
              {id:'deploymentObservedAt',label:'Deployment observed at',value:deploymentTruth?.observedAt||'UNOBSERVED',technical:true}
            ]:[]
          }]
        }]
      };
    }
  });

  const releaseWorkbenchProjection=()=>{
    const rows=adapter.rows();
    const selected=adapter.selected();
    return {
      owner:adapter.owner,
      classification:'RELEASE_GOVERNANCE__CANDIDATE_ONLY__NO_DEPLOYMENT_AUTHORITY',
      dataCoverage:rows.length?'CANDIDATE_DATA_PRESENT':'DATA_COVERAGE_BLOCKER',
      selectedCandidate:selected?adapter.inspect(selected.candidateId):null,
      candidates:rows.map(row=>({candidateRef:adapter.exactRef(row.candidateId),technicalReadiness:row.state,evidenceCoverage:adapter.evidenceCoverage(row.candidateId),ownerAuthorization:row.authorization,deploymentObservation:adapter.deploymentTruth(row.candidateId)})),
      planes:{technicalReadiness:'INDEPENDENT',ownerAuthorization:'INDEPENDENT',deploymentObservation:'INDEPENDENT',deploymentExecution:'NOT_OWNED'},
      exactPairCompare:{owner:'AnalyticalCompareOwner',providerId:'releases.exact-candidate.v1',available:Boolean(adapter.compareOwner),injectionRequired:true,fallbackOwnerConstruction:false},
      actions:{inspect:'NON_MUTATING',compare:'NON_MUTATING_EXACT_PAIR',plan:'NON_EXECUTING',requestAuthorization:'REQUEST_ONLY__NO_DECISION__NO_DEPLOYMENT'}
    };
  };

  return {
    surface:RELEASES_SURFACE_ID,
    workspaceBinding:createFamilyWorkspaceBinding({id:'releases.workspace',family:'global',domainKind:'releases',label:'Releases'}),
    adapter,
    commands,
    collection,
    tableAdapter,
    contextProvider,
    toolbarCommandIds:[...RELEASES_COMMANDS],
    centerProjection:releaseWorkbenchProjection,
    bottomProjection:()=>adapter.diagnosticProjection(),
    compareBinding:{owner:'AnalyticalCompareOwner',providerId:'releases.exact-candidate.v1',pairSemantics:'TWO_EXACT_PINNED_RELEASE_CANDIDATES',injectionRequired:true,fallbackOwnerConstruction:false,available:Boolean(adapter.compareOwner)},
    truthCeiling:{technicalReadinessIsOwnerAuthorization:false,ownerAuthorizationIsDeployment:false,readinessExecutesDeployment:false,authorizationExecutesDeployment:false,deploymentAuthorizationOwned:false,deploymentExecutionOwned:false},
    providerTruth:{authorizationRequestProvider:adapter.diagnosticProjection().authorizationRequestProvider,deploymentExecution:'NOT_OWNED',deploymentObservationRequiresExactCandidateProviderBinding:true,deploymentProviderUnavailableEffectiveState:'UNKNOWN'},
    dataTruth:{emptyCandidates:'DATA_COVERAGE_BLOCKER',ds01Target:false,fabricatedReleaseSuccess:false},
    platformTruth:{activeKeyboardSource:'UNAVAILABLE_OR_FALLBACK',nativeWindow:'UNAVAILABLE_OR_SEPARATE_PLATFORM_CAPABILITY'},
    slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ReleaseGovernanceWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'}
  };
}
