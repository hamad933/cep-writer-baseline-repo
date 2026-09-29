import {assertCanonicalSemanticCommandBus} from '../../foundation/global/commands.js';
import {CollectionTableMatrixPresentationCore,                                       } from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {ReleasesDomainAdapter,RELEASES_COMMANDS} from '../../adapters/releases/domain-adapter.js';
export const RELEASES_SURFACE_ID='releases';

/* Representative product state for the W05 Releases surface. The domain adapter default stays
   EMPTY (releases.empty-is-not-green-readiness is unchanged); the composition supplies records so
   the Owner-confirmed releases reference structure (release info strip, three separated truths,
   history) has something authoritative to present. Exact SHAs/digests are visibly synthetic
   fixture values and every record states that basis in the UI. */
const RECORD_BASIS='W05_SURFACE_REPRESENTATIVE_RECORD · exact commit/tree/artifact digests are synthetic fixture values, not a built artifact';
const rep=(ch       )=>ch.repeat(64);
const RELEASE_REPRESENTATIVE_FIXTURES      =[
  {candidateId:'REL-2026.08.31-RC2',commitSHA:rep('a'),treeSHA:rep('1'),artifactDigest:rep('b'),state:'TECHNICALLY_READY',evidenceDigest:rep('2'),authorization:'NONE',deployment:'NOT_DEPLOYED',deploymentObservedAt:null},
  {candidateId:'REL-2026.08.30-RC1',commitSHA:rep('c'),treeSHA:rep('3'),artifactDigest:rep('d'),state:'TECHNICALLY_READY',evidenceDigest:rep('4'),authorization:'GRANTED',deployment:'DEPLOYED',deploymentObservedAt:'2026-08-30T09:20:00Z'},
  {candidateId:'REL-2026.08.29-RC3',commitSHA:rep('e'),treeSHA:rep('5'),artifactDigest:rep('f'),state:'NOT_READY',evidenceDigest:rep('6'),authorization:'REVOKED',deployment:'NOT_DEPLOYED',deploymentObservedAt:null},
  {candidateId:'REL-2026.08.27-RC2',commitSHA:rep('0'),treeSHA:rep('7'),artifactDigest:rep('8'),state:'ASSEMBLED',evidenceDigest:rep('9'),authorization:'NONE',deployment:'UNKNOWN',deploymentObservedAt:null},
  {candidateId:'REL-2026.08.25-RC1',commitSHA:rep('1'),treeSHA:rep('2'),artifactDigest:rep('3'),state:'ASSEMBLED',evidenceDigest:rep('5'),authorization:'NONE',deployment:'UNKNOWN',deploymentObservedAt:null}
].map(row=>({...row,recordBasis:RECORD_BASIS}));
/* Runtime-measured: a default (unseeded) ReleasesDomainAdapter carries no candidates.
   The empty-set-not-green truth law is asserted against THIS value, not against the
   composition's representative records. */
const DOMAIN_DEFAULT_CANDIDATE_COUNT=new ReleasesDomainAdapter().rows().length;
const THREE_TRUTHS=Object.freeze([
  {axis:'الجاهزية التقنية',en:'Technical readiness',owner:'candidate-bound evidence',ceiling:'ciPassIsAcceptance = false'},
  {axis:'تخويل المالك',en:'Owner authorization',owner:'explicit authority record',ceiling:'technicalReadinessIsAuthorization = false'},
  {axis:'مراقبة النشر',en:'Deployment observation',owner:'separate deployment provider',ceiling:'ownerAuthorizationIsDeployment = false'}
]);

export function createReleasesSurfaceComposition({adapter=null,commands=null,analyticalCompareOwner=null}={}){
  commands=assertCanonicalSemanticCommandBus(commands,'releases.composition');
  adapter=adapter||new ReleasesDomainAdapter({candidates:[...RELEASE_REPRESENTATIVE_FIXTURES],analyticalCompareOwner});
  adapter.bindCommands(commands);
  const tableAdapter                                        ={adapterId:'releases.candidates',rows:()=>adapter.rows(),rowId:r=>r.candidateId,rowLabel:r=>r.candidateId,searchableText:r=>`${r.candidateId} ${r.commitSHA} ${r.treeSHA} ${r.artifactDigest} ${r.state} ${r.authorization} ${r.deployment}`,columns:[{id:'candidate',label:'Release candidate',cell:r=>({text:r.candidateId,secondary:`${r.state} · auth ${r.authorization} · deployment ${r.deployment}`,direction:'ltr'})},{id:'readiness',label:'Readiness',cell:r=>({text:r.state,tone:r.state==='TECHNICALLY_READY'?'success':r.state==='NOT_READY'?'danger':'warning'})}],actions:()=>[{id:'releases.inspect',label:'Inspect'},{id:'releases.compare',label:'Compare exact pair'},{id:'releases.plan',label:'Plan'}]};
  const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
  const contextProvider=defineContextDescriptorProvider({id:'releases.context',family:'releases',owner:adapter.owner,describe:({id}    ={})=>{
    const row=adapter.rows().find(item=>item.candidateId===(id??adapter.selected()?.candidateId));
    const fields=(entries                            )=>entries.map(([label,value,technical])=>({id:label.replace(/\s+/g,'-').toLowerCase(),label,value,technical:technical===true}));
    return {id:`releases:${row?.candidateId||'empty'}`,providerId:'releases.context',family:'releases',subject:row?row.candidateId:'No ReleaseCandidate selected',eyebrow:'Releases · حوكمة الإصدار',summary:row?`${row.state} · authorization ${row.authorization} · deployment ${row.deployment}`:'No candidate means no green readiness.',domainOwner:adapter.owner,revisionToken:row?.artifactDigest||null,
      lenses:[
        {id:'identity',label:'المرشّح المطابق · Exact candidate',tabs:[{id:'candidate',label:'Identity',fields:row?fields([['Commit SHA',row.commitSHA,true],['Tree SHA',row.treeSHA,true],['Artifact digest',row.artifactDigest,true],['Evidence digest',row.evidenceDigest||'MISSING',true]]):[]}]},
        {id:'truths',label:'ثلاث حقائق منفصلة · Three separated truths',tabs:[{id:'axes',label:'Readiness / Authorization / Deployment',fields:row?fields([['Technical readiness',row.state,false],['Owner authorization',row.authorization,false],['Deployment observation',row.deployment,false],['Deployment observed at',row.deploymentObservedAt||'UNOBSERVED',true]]):[]}]},
        {id:'ceilings',label:'سقوبات الحقيقة · Truth ceilings',tabs:[{id:'ceilings',label:'Declared ceilings',fields:fields([['ciPassIsAcceptance','false',true],['technicalReadinessIsOwnerAuthorization','false',true],['ownerAuthorizationIsDeployment','false',true],['readinessExecutesDeployment','false',true],['deploymentExecution','NOT_OWNED',true]])}]},
        {id:'invariants',label:'الحقائق الثابتة · Invariants',tabs:[{id:'rules',label:'Design invariants',fields:[{id:'inv1',label:'التقنية',value:'PUSH/CI PASS is not acceptance',technical:false},{id:'inv2',label:'التخويل',value:'Authorization is not deployment',technical:false},{id:'inv3',label:'ربط الأدلة',value:'Candidate A evidence cannot authorize B',technical:false},{id:'inv4',label:'حدود التنفيذ',value:'No release/deploy execution is authorised by this design packet',technical:false}]}]},
        {id:'record',label:'أساس السجل · Record basis',tabs:[{id:'basis',label:'Provenance of this record',fields:fields([['Record basis',RECORD_BASIS]])}]}
      ]};}});
  return {surface:RELEASES_SURFACE_ID,domainDefaultCandidateCount:DOMAIN_DEFAULT_CANDIDATE_COUNT,representativeRecordBasis:RECORD_BASIS,workspaceBinding:createFamilyWorkspaceBinding({id:'releases.workspace',family:'global',domainKind:'releases',label:'Releases'}),adapter,commands,collection,tableAdapter,contextProvider,toolbarCommandIds:[...RELEASES_COMMANDS],bottomProjection:(candidateId    )=>{const d    =adapter.diagnosticProjection();delete d.history;const la=adapter.lastAction;return {recordBasis:RECORD_BASIS,selectedId:String(candidateId||d.selectedId||'NONE'),lastAction:la?`${la.commandId} · ok=${String(la.ok)} · ${la.code||''} · ${la.pairId||la.candidateId||''} · differences=${String(la.differences??'')}`:'NONE',deploymentExecutionCapability:d.deploymentExecutionCapability,deploymentProviderMayBeUnavailable:String(d.deploymentProviderMayBeUnavailable),technicalReadinessIsOwnerAuthorization:'false',ownerAuthorizationIsDeployment:'false',readinessExecutesDeployment:'false',threeTruths:THREE_TRUTHS.map((t    )=>`${t.axis} (${t.en}) · owner=${t.owner} · ${t.ceiling}`),timeline:(d.candidates||[]).map((c    )=>`${c.candidateId} · ${c.state} · auth ${c.authorization} · deployment ${c.deployment}`)}},compareBinding:{owner:'AnalyticalCompareOwner',providerId:'releases.exact-candidate.v1',pairSemantics:'TWO_EXACT_PINNED_RELEASE_CANDIDATES'},truthCeiling:{technicalReadinessIsOwnerAuthorization:false,ownerAuthorizationIsDeployment:false,readinessExecutesDeployment:false,authorizationExecutesDeployment:false},providerTruth:{deploymentExecution:'NOT_OWNED',deploymentObservationMayBe:'UNKNOWN'},platformTruth:{activeKeyboardSource:'UNAVAILABLE_OR_FALLBACK',nativeWindow:'UNAVAILABLE_OR_SEPARATE_PLATFORM_CAPABILITY'},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ReleaseGovernanceWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'}};
}
