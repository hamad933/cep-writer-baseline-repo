import {assertCanonicalSemanticCommandBus} from '../../foundation/global/commands.js';
import {CollectionTableMatrixPresentationCore,                                       } from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {ManualAiDomainAdapter,MANUAL_AI_COMMANDS,                   } from '../../adapters/manual_ai/domain-adapter.js';
export const MANUAL_AI_SURFACE_ID='manual_ai';

/* Representative product state for the W05 Manual AI Bridge surface.
   The domain adapter default stays EMPTY (the default-EMPTY truth law is unchanged and still
   asserted by tests/surfaces/manual_ai + S17); this fixture is supplied only by the surface
   composition so the Owner-confirmed AI-Bridge reference structure has something to present.
   Every record carries `recordBasis` so the UI states its provenance explicitly. */
const RECORD_BASIS='W05_SURFACE_REPRESENTATIVE_RECORD · derived from the Owner-confirmed AI-Bridge reference structure; no external AI exchange was performed';
const hex=ch=>ch.repeat(64);
const at=(day,time)=>`2026-08-${day}T${time}:00Z`;
const fixture=(proposal               )               =>({...proposal});

const MANUAL_AI_REPRESENTATIVE_FIXTURES                 =[
  fixture({proposalId:'MAN-PROP-0001',revision:'r1',sourceDigest:hex('a'),provenance:{sourceId:'CEP-KU-ARCH-REVIEW',sourceRevisionId:'r1',sourceDigest:hex('a'),obtainedBy:'USER_MEDIATED_EXTERNAL_AI',obtainedAt:at(31,'09:05'),exportedArtifactId:null,exportedPackageDigest:null},content:'مراجعة معمارية — مساعد ذكاء اصطناعي مدمج يدويًا',state:'PREPARED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'MAN-PROP-0002',revision:'r2',sourceDigest:hex('b'),provenance:{sourceId:'CEP-KU-THREAT-MODEL',sourceRevisionId:'r2',sourceDigest:hex('b'),obtainedBy:'USER_MEDIATED_EXTERNAL_AI',obtainedAt:at(31,'09:18'),exportedArtifactId:'aib-export-0044',exportedPackageDigest:hex('c')},content:'دعم التحقق من نموذج التهديدات',state:'EXPORTED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'MAN-PROP-0003',revision:'r1',sourceDigest:hex('d'),provenance:{sourceId:'CEP-KU-POLICY-LANG',sourceRevisionId:'r1',sourceDigest:hex('d'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at(31,'08:35'),exportedArtifactId:'aib-export-0045',exportedPackageDigest:hex('e')},content:'صياغة لغة السياسات',state:'IMPORTED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'MAN-PROP-0004',revision:'r3',sourceDigest:hex('f'),provenance:{sourceId:'CEP-KU-CONTROL-MAP',sourceRevisionId:'r3',sourceDigest:hex('f'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at(31,'16:20'),exportedArtifactId:'aib-export-0046',exportedPackageDigest:hex('a')},content:'إرشاد ضبط الخريطة',state:'DEFERRED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'MAN-PROP-0005',revision:'r1',sourceDigest:hex('b'),provenance:{sourceId:'CEP-KU-LOGGING',sourceRevisionId:'r1',sourceDigest:hex('b'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at(31,'14:05'),exportedArtifactId:'aib-export-0047',exportedPackageDigest:hex('d')},content:'مراجعة استراتيجية التسجيل',state:'PROVENANCE_INVALID',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'MAN-PROP-0006',revision:'r2',sourceDigest:hex('c'),provenance:{sourceId:'CEP-KU-DATAFLOW',sourceRevisionId:'r2',sourceDigest:hex('c'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at(31,'11:12'),exportedArtifactId:'aib-export-0048',exportedPackageDigest:hex('f')},content:'تقييم مخاطر تدفّق البيانات',state:'ACCEPTED_AS_DRAFT',draftState:'CREATED',draftId:'draft-man-0006'})
];

const CEILINGS=Object.freeze({providerMode:'MANUAL_ONLY_PROVIDER_NEUTRAL',hiddenProviderCalls:0,automaticCanonicalPublication:false,importRequiresDeclaredExport:true,provenanceEquality:'SOURCE_ID+SOURCE_REVISION+SOURCE_DIGEST+EXPORTED_PACKAGE_DIGEST'});
const GOVERNANCE=Object.freeze([
  {label:'الذكاء الخارجي أداة مساعدة فقط',value:'External AI is a review aid only',enforced:'MANUAL_ONLY_PROVIDER_NEUTRAL'},
  {label:'القرار النهائي يبقى لدى المراجع',value:'Final decision stays with the human reviewer',enforced:'human disposition'},
  {label:'لا قبول من دون تحقّق وتدوين',value:'No acceptance without verification and audit',enforced:'provenance equality + audit trail'}
]);

export function createManualAiSurfaceComposition({adapter=null,commands=null}={}){
  commands=assertCanonicalSemanticCommandBus(commands,'manual_ai.composition');
  adapter=adapter||new ManualAiDomainAdapter({proposals:[...MANUAL_AI_REPRESENTATIVE_FIXTURES]});
  adapter.bindCommands(commands);
  const tableAdapter                                        ={adapterId:'manual_ai.proposals',rows:()=>adapter.rows(),rowId:r=>r.proposalId,rowLabel:r=>r.proposalId,searchableText:r=>`${r.proposalId} ${r.revision} ${r.state} ${r.provenance.sourceId} ${r.provenance.sourceRevisionId} ${r.provenance.sourceDigest}`,columns:[{id:'proposal',label:'Manual proposal',cell:r=>({text:r.proposalId,secondary:`${r.revision} · ${r.provenance.sourceId}`,direction:'ltr'})},{id:'state',label:'State',cell:r=>({text:r.state,tone:r.state==='PROVENANCE_INVALID'?'danger':r.state==='ACCEPTED_AS_DRAFT'?'success':'default'})}],actions:r=>[{id:'manual_ai.export',label:'Export packet',enabled:r.state!=='PROVENANCE_INVALID'&&r.state!=='REJECTED'&&r.state!=='ACCEPTED_AS_DRAFT'},{id:'manual_ai.import',label:'Import result',enabled:r.state==='EXPORTED'},{id:'manual_ai.review',label:'Review',enabled:true}]};
  const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
  const contextProvider=defineContextDescriptorProvider({id:'manual_ai.context',family:'manual_ai',owner:adapter.owner,describe:({id}    ={})=>{
    const row=adapter.rows().find(item=>item.proposalId===(id??adapter.selected()?.proposalId));
    const fields=(entries                  )=>entries.map(([label,value])=>({id:String(label).replace(/\s+/g,'-').toLowerCase(),label,value,technical:/[0-9a-f]{16}|_|:|\//i.test(String(value))}));
    return {id:`manual-ai:${row?.proposalId||'empty'}`,providerId:'manual_ai.context',family:'manual_ai',subject:row?`${row.proposalId} · ${row.state}`:'No ManualProposal selected',eyebrow:'Manual AI Bridge · سياق الحوكمة',summary:row?`${row.state} · ${row.draftState} · لا استدعاء مزوّد تلقائي`:'Provider-neutral manual workflow. No automatic generation or provider call.',domainOwner:adapter.owner,revisionToken:row?.revision||null,
      lenses:[
        {id:'identity',label:'هوية الطلب · Identity',tabs:[{id:'proposal',label:'ManualProposal',fields:row?fields([['Proposal ID',row.proposalId],['Revision',row.revision],['State',row.state],['Draft state',row.draftState],['Draft ID',row.draftId||'NONE']]):[]}]},
        {id:'provenance',label:'سلسلة المصدر · Provenance chain',tabs:[{id:'chain',label:'Source chain',fields:row?fields([['Source ID',row.provenance.sourceId],['Source revision',row.provenance.sourceRevisionId],['Source digest',row.provenance.sourceDigest],['Acquisition',row.provenance.obtainedBy],['Obtained at',row.provenance.obtainedAt],['Export package digest',row.provenance.exportedPackageDigest||'NOT_EXPORTED']]):[]}]},
        {id:'ceilings',label:'سقف الحقيقة · Truth ceilings',tabs:[{id:'truth',label:'Declared ceilings',fields:fields([['Provider mode',CEILINGS.providerMode],['hiddenProviderCalls',String(CEILINGS.hiddenProviderCalls)],['automaticCanonicalPublication',String(CEILINGS.automaticCanonicalPublication)],['Import requires declared export',String(CEILINGS.importRequiresDeclaredExport)],['Provenance equality',CEILINGS.provenanceEquality]])}]},
        {id:'governance',label:'الحوكمة · Governance statements',tabs:[{id:'rules',label:'Human / controller rules',fields:GOVERNANCE.map((g,index)=>({id:`gov-${index+1}`,label:g.label,value:`${g.value} · ${g.enforced}`,technical:false}))}]},
        {id:'record',label:'أساس السجل · Record basis',tabs:[{id:'basis',label:'Provenance of this record',fields:fields([['Record basis',RECORD_BASIS]])}]}
      ]};}});
  return {surface:MANUAL_AI_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'manual_ai.workspace',family:'global',domainKind:'manual_ai',label:'Manual AI Bridge'}),adapter,commands,collection,tableAdapter,contextProvider,toolbarCommandIds:[...MANUAL_AI_COMMANDS],bottomProjection:(proposalId    )=>{const d    =adapter.diagnosticProjection();delete d.history;const la=adapter.lastAction;return {recordBasis:RECORD_BASIS,selectedId:String(proposalId||d.selectedId||'NONE'),providerMode:d.providerMode,hiddenProviderCalls:d.hiddenProviderCalls,automaticCanonicalPublication:String(d.automaticCanonicalPublication),importRequiresDeclaredExport:String(d.truth?.importRequiresDeclaredExport),sourceRevisionDigestEqualityRequired:String(d.truth?.sourceRevisionDigestEqualityRequired),acceptCreatesDraftOnly:String(d.truth?.acceptCreatesDraftOnly),lastAction:la?`${la.commandId} · ok=${String(la.ok)} · ${la.code} · ${la.proposalId||''}`:'NONE',governance:GOVERNANCE.map((g    )=>`${g.rule} — ${g.enforced}`),timeline:d.proposals?.map((p    )=>`${p.proposalId} · ${p.state} · ${p.draftState}`)||[]}},providerTruth:{mode:'MANUAL_ONLY_PROVIDER_NEUTRAL',hiddenProviderCalls:0,automaticCanonicalPublication:false,importRequiresDeclaredExport:true,provenanceEquality:'SOURCE_ID+SOURCE_REVISION+SOURCE_DIGEST+EXPORTED_PACKAGE_DIGEST'},platformTruth:{activeKeyboardSource:'UNAVAILABLE_OR_FALLBACK',nativeWindow:'UNAVAILABLE_OR_SEPARATE_PLATFORM_CAPABILITY'},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ManualProposalAdjudicationWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'}};
}
