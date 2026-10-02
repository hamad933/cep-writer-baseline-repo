import {assertCanonicalSemanticCommandBus} from '../../foundation/global/commands.js';
import {CollectionTableMatrixPresentationCore,type CollectionTableMatrixDomainAdapter} from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {ReleasesDomainAdapter,RELEASES_COMMANDS} from '../../adapters/releases/domain-adapter.js';
import {RECORD_BASIS,domainCandidates,releaseRecord} from './records.js';
import {createReleasesSurfaceRuntime} from './runtime.js';
export const RELEASES_SURFACE_ID='releases';

/* Representative product state for the W05 Releases surface. The domain adapter default stays
   EMPTY (releases.empty-is-not-green-readiness is unchanged); the composition supplies records so
   the Owner-confirmed releases reference structure (release identity strip, three separated
   truths, gates/verification, deployment stages, rollback readiness, approvers) has something
   authoritative to present. Exact SHAs/digests are visibly synthetic fixture values and every
   record states that basis in the UI. */
const RELEASE_REPRESENTATIVE_FIXTURES:any[]=domainCandidates();
/* Runtime-measured: a default (unseeded) ReleasesDomainAdapter carries no candidates.
   The empty-set-not-green truth law is asserted against THIS value, not against the
   composition's representative records. */
const DOMAIN_DEFAULT_CANDIDATE_COUNT=new ReleasesDomainAdapter().rows().length;
const THREE_TRUTHS=Object.freeze([
  {axis:'الجاهزية التقنية',en:'Technical readiness',owner:'candidate-bound evidence',ceiling:'ciPassIsAcceptance = false'},
  {axis:'تخويل المالك',en:'Owner authorization',owner:'explicit authority record',ceiling:'technicalReadinessIsAuthorization = false'},
  {axis:'مراقبة النشر',en:'Deployment observation',owner:'separate deployment provider',ceiling:'ownerAuthorizationIsDeployment = false'}
]);

/* ── Bottom-shelf deep projection (surface-owned; feeds the SHARED BottomDeepWork shelf) ────
   The shared shelf renders this projection read-only: it shows the candidate-bound revision plus
   the LAST FOUR frames of the projection inside its "details" list. This therefore declares
   exactly four release-meaningful sections — selected candidate identity · three separated
   truths · gates/verification/rollback/approvers · recorded verification events — instead of
   the raw diagnostics/`lastAction · ok=… · differences=…` string (defect D-06).
   `sections`/`currentRevisionId` are LIVE GETTERS: the shared provider reads them on every
   shelf render, so the section language always follows the CURRENT active language (a locale
   flip re-localises the shelf without any shared-file write and without re-rendering the stage),
   and the values are always re-derived from domain truth. Nothing here claims an approval, a
   publication or a deployment the domain does not hold; the truth ceilings are stated
   explicitly and stay false. */
function releasesDeepProjection(adapter:any,candidateId:any){
  const build=()=>{
    const id=String(candidateId||adapter.selected()?.candidateId||'NONE');
    let rows:any[]=[];try{rows=adapter.rows()}catch{rows=[]}
    const domain=rows.find((item:any)=>item.candidateId===id)||null;
    const record=domain?releaseRecord(id,domain):null;
    const ar=(typeof document!=='undefined'&&document.documentElement.lang!=='en');
    const short=(value:any)=>String(value||'NONE').slice(0,12);
    const tally=(list:any[],keys:string[])=>keys.map(k=>`${list.filter(x=>x&&x.state===k).length} ${k}`).join(' · ');
    const gatesSummary=!record
      ?`${ar?'لا تتوفر بوابات عرض':'no presentation gates'} · ${ar?'غير متاح':'UNAVAILABLE'}`
      :record.gates.length
        ?`${ar?'البوابات ':'gates '}${tally(record.gates,['pass','warn','fail','pending'])} · ${ar?'النتائج ':'results '}${tally(record.results,['pass','warn','fail','pending'])} · ${ar?'التراجع ':'rollback '}${record.rollback.state} (${record.rollback.previous}) · ${ar?'الحزمة ':'package '}${record.packageState.key} · ${ar?'الموقّعون ':'approvers '}${['granted','pending','missing'].map(k=>`${record.approvers.filter(a=>a.state===k).length} ${k}`).join(' · ')}`
        :`${ar?'لا توجد بوابات معرّفة لهذا المرشح — تفاصيل العرض غير متاحة':'no gates defined for this candidate — presentation detail UNAVAILABLE'}`;
    const eventsSummary=record&&record.events.length
      ?record.events.slice(-4).map(e=>`${e.at} ${e.key} ${e.ok?(ar?'ناجح':'ok'):(ar?'فشل':'failed')}`).join(' · ')
      :(ar?'لا توجد أحداث تحقق مسجّلة لهذا المرشح':'no verification events recorded for this candidate');
    const identity=domain
      ?`${id} · ${record?`${record.version} · ${record.channel}/${record.environment} · build ${record.build.id}`:`${ar?'تفاصيل العرض غير متاحة':'presentation detail UNAVAILABLE'}`} · commit ${short(domain.commitSHA)} · artifact ${short(domain.artifactDigest)} · ${ar?'أساس السجل: قيم تمثيلية مُثبّتة على هذا المرشح':'record basis: representative fixture values pinned to this candidate'}`
      :`${id} · ${ar?'لا يوجد مرشح مطابق في النطاق — لا تُستنتج جاهزية':'no matching candidate in the domain — no readiness is inferred'}`;
    const truths=domain
      ?THREE_TRUTHS.map((t:any)=>{
          const value=t.en==='Technical readiness'?domain.state:t.en==='Owner authorization'?domain.authorization:domain.deployment;
          return `${ar?t.axis:t.en}=${value} (${t.owner} · ${t.ceiling})`;
        }).join(' · ')
      :`${ar?'لا يوجد مرشح محدد':'no candidate bound'} · ${ar?'حقائق الجاهزية والتخويل والنشر غير متاحة':'readiness / authorization / deployment truths unavailable'}`;
    return {id,domain,sections:[
      {id:'events',label:ar?'سجل أحداث التحقق':'Verification events',value:eventsSummary},
      {id:'gates',label:ar?'البوابات والتحقق والتراجع':'Gates, verification & rollback',value:gatesSummary},
      {id:'truths',label:ar?'ثلاث حقائق منفصلة':'Three separated truths',value:truths},
      {id:'candidate',label:ar?'المرشّح المحدد':'Selected release candidate',value:identity}
    ]};
  };
  return {
    get selectedId(){return build().id},
    get currentRevisionId(){const b=build();return b.domain?String(b.domain.artifactDigest||'NONE').slice(0,12):'NONE'},
    recordBasis:RECORD_BASIS,
    get sections(){return build().sections}
  };
}

export function createReleasesSurfaceComposition({adapter=null,commands=null,analyticalCompareOwner=null}={}){
  commands=assertCanonicalSemanticCommandBus(commands,'releases.composition');
  adapter=adapter||new ReleasesDomainAdapter({candidates:[...RELEASE_REPRESENTATIVE_FIXTURES],analyticalCompareOwner});
  adapter.bindCommands(commands);
  const tableAdapter:CollectionTableMatrixDomainAdapter<any>={adapterId:'releases.candidates',rows:()=>adapter.rows(),rowId:r=>r.candidateId,rowLabel:r=>r.candidateId,searchableText:r=>`${r.candidateId} ${r.commitSHA} ${r.treeSHA} ${r.artifactDigest} ${r.state} ${r.authorization} ${r.deployment}`,columns:[{id:'candidate',label:'Release candidate',cell:r=>({text:r.candidateId,secondary:`${r.state} · auth ${r.authorization} · deployment ${r.deployment}`,direction:'ltr'})},{id:'readiness',label:'Readiness',cell:r=>({text:r.state,tone:r.state==='TECHNICALLY_READY'?'success':r.state==='NOT_READY'?'danger':'warning'})}],actions:()=>[{id:'releases.inspect',label:'Inspect'},{id:'releases.compare',label:'Compare exact pair'},{id:'releases.plan',label:'Plan'}]};
  const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
  const contextProvider=defineContextDescriptorProvider({id:'releases.context',family:'releases',owner:adapter.owner,describe:({id}:any={})=>{
    const row=adapter.rows().find(item=>item.candidateId===(id??adapter.selected()?.candidateId));
    const fields=(entries:[string,string,boolean? ][])=>entries.map(([label,value,technical])=>({id:label.replace(/\s+/g,'-').toLowerCase(),label,value,technical:technical===true}));
    return {id:`releases:${row?.candidateId||'empty'}`,providerId:'releases.context',family:'releases',subject:row?row.candidateId:'No ReleaseCandidate selected',eyebrow:'Releases · حوكمة الإصدار',summary:row?`${row.state} · authorization ${row.authorization} · deployment ${row.deployment}`:'No candidate means no green readiness.',domainOwner:adapter.owner,revisionToken:row?.artifactDigest||null,
      lenses:[
        {id:'identity',label:'المرشّح المطابق · Exact candidate',tabs:[{id:'candidate',label:'Identity',fields:row?fields([['Commit SHA',row.commitSHA,true],['Tree SHA',row.treeSHA,true],['Artifact digest',row.artifactDigest,true],['Evidence digest',row.evidenceDigest||'MISSING',true]]):[]}]},
        {id:'truths',label:'ثلاث حقائق منفصلة · Three separated truths',tabs:[{id:'axes',label:'Readiness / Authorization / Deployment',fields:row?fields([['Technical readiness',row.state,false],['Owner authorization',row.authorization,false],['Deployment observation',row.deployment,false],['Deployment observed at',row.deploymentObservedAt||'UNOBSERVED',true]]):[]}]},
        {id:'ceilings',label:'سقوبات الحقيقة · Truth ceilings',tabs:[{id:'ceilings',label:'Declared ceilings',fields:fields([['ciPassIsAcceptance','false',true],['technicalReadinessIsOwnerAuthorization','false',true],['ownerAuthorizationIsDeployment','false',true],['readinessExecutesDeployment','false',true],['deploymentExecution','NOT_OWNED',true]])}]},
        {id:'invariants',label:'الحقائق الثابتة · Invariants',tabs:[{id:'rules',label:'Design invariants',fields:[{id:'inv1',label:'التقنية',value:'PUSH/CI PASS is not acceptance',technical:false},{id:'inv2',label:'التخويل',value:'Authorization is not deployment',technical:false},{id:'inv3',label:'ربط الأدلة',value:'Candidate A evidence cannot authorize B',technical:false},{id:'inv4',label:'حدود التنفيذ',value:'No release/deploy execution is authorised by this design packet',technical:false}]}]},
        {id:'record',label:'أساس السجل · Record basis',tabs:[{id:'basis',label:'Provenance of this record',fields:fields([['Record basis',RECORD_BASIS]])}]}
      ]};}});
  const runtime=createReleasesSurfaceRuntime({adapter,commands});
  runtime.installGovernor();
  const composition:any={surface:RELEASES_SURFACE_ID,domainDefaultCandidateCount:DOMAIN_DEFAULT_CANDIDATE_COUNT,representativeRecordBasis:RECORD_BASIS,workspaceBinding:createFamilyWorkspaceBinding({id:'releases.workspace',family:'global',domainKind:'releases',label:'Releases'}),adapter,commands,collection,tableAdapter,contextProvider,toolbarCommandIds:[...RELEASES_COMMANDS],bottomProjection:(candidateId:any)=>releasesDeepProjection(adapter,candidateId),compareBinding:{owner:'AnalyticalCompareOwner',providerId:'releases.exact-candidate.v1',pairSemantics:'TWO_EXACT_PINNED_RELEASE_CANDIDATES'},truthCeiling:{technicalReadinessIsOwnerAuthorization:false,ownerAuthorizationIsDeployment:false,readinessExecutesDeployment:false,authorizationExecutesDeployment:false},providerTruth:{deploymentExecution:'NOT_OWNED',deploymentObservationMayBe:'UNKNOWN'},platformTruth:{activeKeyboardSource:'UNAVAILABLE_OR_FALLBACK',nativeWindow:'UNAVAILABLE_OR_SEPARATE_PLATFORM_CAPABILITY'},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ReleaseGovernanceWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'}};
  composition.runtime=runtime;
  return composition;
}
