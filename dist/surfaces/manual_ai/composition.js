import {assertCanonicalSemanticCommandBus} from '../../foundation/global/commands.js';
import {CollectionTableMatrixPresentationCore,                                       } from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {ManualAiDomainAdapter,                   } from '../../adapters/manual_ai/domain-adapter.js';
import {RECORD_BASIS} from './presentation.js';
import {bottomProjectionFor} from './panes.js';
import {createManualAiRuntime} from './runtime.js';
export const MANUAL_AI_SURFACE_ID='manual_ai';

/* Representative product state for the W05 Manual AI Bridge surface.
   The domain adapter default stays EMPTY (the default-EMPTY truth law is unchanged and still
   asserted by tests/surfaces/manual_ai + S17); this fixture is supplied only by the surface
   composition so the Owner-confirmed AI-Bridge reference structure has something to present.
   Every record carries `recordBasis` so the UI states its provenance explicitly, and no record
   claims an AI completion that CEP never performed. */
const hex=(ch       )=>ch.repeat(64);
const at=(day       ,time       )=>`2026-08-${day}T${time}:00Z`;
const fixture=(proposal               )               =>({...proposal});

const MANUAL_AI_REPRESENTATIVE_FIXTURES                 =[
  fixture({proposalId:'AIB-REQ-0048',revision:'r3',sourceDigest:hex('a'),provenance:{sourceId:'CEP-KU-ARCH-REVIEW',sourceRevisionId:'r3',sourceDigest:hex('a'),obtainedBy:'USER_MEDIATED_EXTERNAL_AI',obtainedAt:at('31','10:42'),exportedArtifactId:'aib-export-0051',exportedPackageDigest:hex('c')},content:'Scope: pointed architecture review of the workspace host and pane contract. Inputs: ARCH_REVIEW_SCOPE.md, CURRENT_STATE_NOTES.json. Instruction: return findings only; do not rewrite source.',state:'EXPORTED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'AIB-REQ-0044',revision:'r2',sourceDigest:hex('b'),provenance:{sourceId:'CEP-KU-THREAT-MODEL',sourceRevisionId:'r2',sourceDigest:hex('b'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at('31','09:18'),exportedArtifactId:'aib-export-0047',exportedPackageDigest:hex('b')},content:'External response (imported by the operator): two threat-model assertions need human verification — TM-14 assumes an unauthenticated loopback channel, TM-27 omits revocation of the export token. Both are unverified input, not accepted findings.',state:'IMPORTED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'AIB-REQ-0045',revision:'r1',sourceDigest:hex('e'),provenance:{sourceId:'CEP-KU-POLICY-LANG',sourceRevisionId:'r1',sourceDigest:hex('e'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at('31','08:35'),exportedArtifactId:'aib-export-0045',exportedPackageDigest:hex('e')},content:'External response (imported by the operator): three alternative phrasings for the retention clause. Reviewer deferred pending legal review — none of the phrasings is adopted.',state:'DEFERRED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'AIB-REQ-0046',revision:'r4',sourceDigest:hex('f'),provenance:{sourceId:'CEP-KU-CONTROL-MAP',sourceRevisionId:'r4',sourceDigest:hex('f'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at('30','16:20'),exportedArtifactId:'aib-export-0043',exportedPackageDigest:hex('a')},content:'External response (imported by the operator): proposed ISO 27001 control-to-audit-log bindings, rewritten by the reviewer before acceptance. Accepted as a working draft only; nothing was published canonically.',state:'ACCEPTED_AS_DRAFT',draftState:'CREATED',draftId:'draft-aib-0046'}),
  fixture({proposalId:'AIB-REQ-0047',revision:'r2',sourceDigest:'NOT-A-SHA256-DIGEST',provenance:{sourceId:'CEP-KU-LOGGING',sourceRevisionId:'r2',sourceDigest:'NOT-A-SHA256-DIGEST',obtainedBy:'MANUAL_IMPORT',obtainedAt:at('30','14:05'),exportedArtifactId:'aib-export-0044',exportedPackageDigest:hex('d')},content:'External response (imported by the operator): retention recommendations arrived against a declared source digest that does not validate, so the import was quarantined and no disposition is possible.',state:'PROVENANCE_INVALID',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'AIB-REQ-0049',revision:'r1',sourceDigest:hex('d'),provenance:{sourceId:'CEP-KU-DATAFLOW',sourceRevisionId:'r1',sourceDigest:hex('d'),obtainedBy:'USER_MEDIATED_EXTERNAL_AI',obtainedAt:at('31','11:12'),exportedArtifactId:null,exportedPackageDigest:null},content:'Packet body: enumerate personal-data transit paths for the review workspace. Inputs: DATAFLOW_MAP_r1.json. Instruction: list paths and retention windows only; no data values.',state:'PREPARED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'AIB-REQ-0050',revision:'r2',sourceDigest:hex('7'),provenance:{sourceId:'CEP-KU-CRYPTO-BASELINE',sourceRevisionId:'r2',sourceDigest:hex('7'),obtainedBy:'MANUAL_IMPORT',obtainedAt:at('30','11:47'),exportedArtifactId:'aib-export-0042',exportedPackageDigest:hex('f')},content:'External response (imported by the operator): key-escrow option comparison. The reviewer could not verify two cited benchmarks, so the recommendation was rejected outright.',state:'REJECTED',draftState:'ABSENT',draftId:null}),
  fixture({proposalId:'AIB-REQ-0051',revision:'r1',sourceDigest:hex('c'),provenance:{sourceId:'CEP-KU-RETENTION',sourceRevisionId:'r1',sourceDigest:hex('c'),obtainedBy:'USER_MEDIATED_EXTERNAL_AI',obtainedAt:at('31','12:05'),exportedArtifactId:'aib-export-0049',exportedPackageDigest:hex('b')},content:'Packet body: first draft of the retention schedule for operational logs. Inputs: RETENTION_SCHEDULE_v0.md. Instruction: propose windows only; do not infer legal bases.',state:'EXPORTED',draftState:'ABSENT',draftId:null})
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
  const tableAdapter                                        ={adapterId:'manual_ai.proposals',rows:()=>adapter.rows(),rowId:r=>r.proposalId,rowLabel:r=>r.proposalId,searchableText:r=>`${r.proposalId} ${r.revision} ${r.state} ${r.provenance.sourceId} ${r.provenance.sourceRevisionId} ${r.provenance.sourceDigest}`,columns:[{id:'proposal',label:'Request',cell:r=>({text:r.proposalId,secondary:`${r.revision} · ${r.provenance.sourceId}`,direction:'ltr'})},{id:'state',label:'State',cell:r=>({text:r.state,tone:r.state==='PROVENANCE_INVALID'?'danger':r.state==='ACCEPTED_AS_DRAFT'?'success':'default'})}],actions:r=>[{id:'manual_ai.export',label:'Export packet',enabled:r.state!=='PROVENANCE_INVALID'&&r.state!=='REJECTED'&&r.state!=='ACCEPTED_AS_DRAFT'},{id:'manual_ai.import',label:'Import result',enabled:r.state==='EXPORTED'},{id:'manual_ai.review',label:'Review',enabled:true}]};
  const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
  const contextProvider=defineContextDescriptorProvider({id:'manual_ai.context',family:'manual_ai',owner:adapter.owner,describe:({id}    ={})=>{
    const row=adapter.rows().find(item=>item.proposalId===(id??adapter.selected()?.proposalId));
    const fields=(entries                  )=>entries.map(([label,value])=>({id:String(label).replace(/\s+/g,'-').toLowerCase(),label,value,technical:/[0-9a-f]{16}|_|:|\//i.test(String(value))}));
    return {id:`manual-ai:${row?.proposalId||'empty'}`,providerId:'manual_ai.context',family:'manual_ai',subject:row?`${row.proposalId} · ${row.state}`:'No ManualProposal selected',eyebrow:'Manual AI Bridge · سياق الحوكمة',summary:row?`${row.state} · ${row.draftState} · لا استدعاء مزوّد تلقائي`:'Provider-neutral manual workflow. No automatic generation or provider call.',domainOwner:adapter.owner,revisionToken:row?.revision||null,
      lenses:[
        {id:'identity',label:'هوية الطلب · Request identity',tabs:[{id:'proposal',label:'ManualProposal',fields:row?fields([['Proposal ID',row.proposalId],['Revision',row.revision],['State',row.state],['Draft state',row.draftState],['Draft ID',row.draftId||'NONE']]):[]}]},
        {id:'provenance',label:'سلسلة المصدر · Provenance chain',tabs:[{id:'chain',label:'Source chain',fields:row?fields([['Source ID',row.provenance.sourceId],['Source revision',row.provenance.sourceRevisionId],['Source digest',row.provenance.sourceDigest],['Acquisition',row.provenance.obtainedBy],['Obtained at',row.provenance.obtainedAt],['Export package digest',row.provenance.exportedPackageDigest||'NOT_EXPORTED']]):[]}]},
        {id:'ceilings',label:'سقوف الحقيقة · Truth ceilings',tabs:[{id:'truth',label:'Declared ceilings',fields:fields([['Provider mode',CEILINGS.providerMode],['hiddenProviderCalls',String(CEILINGS.hiddenProviderCalls)],['automaticCanonicalPublication',String(CEILINGS.automaticCanonicalPublication)],['Import requires declared export',String(CEILINGS.importRequiresDeclaredExport)],['Provenance equality',CEILINGS.provenanceEquality]])}]},
        {id:'governance',label:'الحوكمة · Governance statements',tabs:[{id:'rules',label:'Human / controller rules',fields:GOVERNANCE.map((g,index)=>({id:`gov-${index+1}`,label:g.label,value:`${g.value} · ${g.enforced}`,technical:false}))}]},
        {id:'record',label:'أساس السجل · Record basis',tabs:[{id:'basis',label:'Provenance of this record',fields:fields([['Record basis',RECORD_BASIS]])}]}
      ]};}});
  const composition    ={surface:MANUAL_AI_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'manual_ai.workspace',family:'global',domainKind:'manual_ai',label:'Manual AI Bridge'}),adapter,commands,collection,tableAdapter,contextProvider,
    /* The global action strip carries the transfer-level commands; the human dispositions live in
       section E of the workbench, where the reviewer sees the evidence they decide on. */
    toolbarCommandIds:['manual_ai.draft','manual_ai.export','manual_ai.import'],
    bottomProjection:(proposalId    )=>bottomProjectionFor({row:adapter.rows().find((r    )=>r.proposalId===(proposalId||adapter.selected()?.proposalId))||null,locale:typeof document!=='undefined'&&document.documentElement.lang==='ar'?'ar':'en',adapter}),
    providerTruth:{mode:'MANUAL_ONLY_PROVIDER_NEUTRAL',hiddenProviderCalls:0,automaticCanonicalPublication:false,importRequiresDeclaredExport:true,provenanceEquality:'SOURCE_ID+SOURCE_REVISION+SOURCE_DIGEST+EXPORTED_PACKAGE_DIGEST'},
    platformTruth:{activeKeyboardSource:'UNAVAILABLE_OR_FALLBACK',nativeWindow:'UNAVAILABLE_OR_SEPARATE_PLATFORM_CAPABILITY'},
    slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ManualProposalAdjudicationWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'}};
  /* SURFACE-SPECIFIC PRESENTATION: the shared W05 mount writes a generic typed-collection stage;
     the governor re-asserts the A…E adjudication workbench whenever shared code rewrites a host. */
  const runtime=createManualAiRuntime({adapter,commands});
  composition.runtime=runtime;
  composition.mount=()=>runtime.renderAll();
  runtime.installGovernor();
  return composition;
}
