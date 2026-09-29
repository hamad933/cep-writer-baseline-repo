import {CollectionTableMatrixPresentationCore,                                       } from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {W04MasteryDomain,MASTERY_AUTHORITY_REF,createMasteryCompareProvider,createMasteryProvenanceProvider} from '../../adapters/mastery/domain.js';

export const MASTERY_SURFACE_ID='mastery';
export function createMasterySurfaceComposition({domain=new W04MasteryDomain(),analyticalCompareOwner=null}={}){
 const tableAdapter                                        ={
  adapterId:'mastery.states',rows:()=>domain.records,rowId:r=>r.id,rowLabel:r=>`${r.capability} ${r.subject}`,searchableText:r=>`${r.capability} ${r.subject} ${r.judgment} ${r.freshness} ${r.policyRef}`,
  columns:[
   {id:'target',label:'Mastery target',cell:r=>({text:r.capability,secondary:r.subject,direction:'ltr'})},
   {id:'judgment',label:'Judgment',cell:r=>({text:r.judgment,tone:r.judgment==='MASTERED'?'success':r.judgment==='NOT_MASTERED'?'danger':r.judgment==='INCONCLUSIVE'?'warning':'default'})},
   {id:'freshness',label:'Freshness',cell:r=>({text:r.freshness,tone:r.freshness==='REVALIDATION_REQUIRED'?'warning':'default'})},
   {id:'policy',label:'Policy',cell:r=>({text:r.policyRef,direction:'ltr'})}
  ],
  actions:()=>[{id:'mastery.inspect',label:'Inspect',enabled:true},{id:'mastery.explain',label:'Explain',enabled:true},{id:'mastery.reevaluate',label:'Request re-evaluation',enabled:true}]
 };
 const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
 const compareProvider=createMasteryCompareProvider(domain);
 const compareOwner=analyticalCompareOwner;
 if(compareOwner){
  if(compareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
  if(!compareOwner.providerIds().includes(compareProvider.descriptor().providerId))compareOwner.registerProvider(compareProvider);
 }
 const provenanceProvider=createMasteryProvenanceProvider(domain),provenance=new AuditProvenanceInteractionCore(provenanceProvider);if(domain.records[0])provenance.refresh({id:domain.records[0].id});
 // RIGHT context lens — the reference's right column (Revalidation Trigger / Last State-Change
 // Cause / Conflict Status / Evaluation Provenance). Everything here is deliberately NOT in the
 // CENTER workbench: authority, persistence, recorded evaluations and the shape of a
 // re-evaluation request are CONTEXT, never a second copy of the record (CEP-VIS-001-FINAL
 // 'ONE INFORMATION ITEM -> ONE AUTHORITATIVE DISPLAY LOCATION').
 const contextProvider=defineContextDescriptorProvider({id:'mastery.context',family:'mastery',owner:domain.owner,describe:({id}    ={})=>{
   const row=domain.records.find(item=>item.id===(id??domain.records[0]?.id));
   const evaluator=domain.evaluatorDescriptor;
   const history=row?domain.history.filter(item=>item.recordId===row.id):[];
   const last=history.length?history[history.length-1]:null;
   const noHistory=[{id:'empty',label:'Recorded evaluations',value:'EMPTY \u2014 no evaluation has been recorded for this target'}];
   return {id:`mastery:${row?.id||'empty'}`,providerId:'mastery.context',family:'mastery',subject:row?`${row.capability} \u00b7 ${row.judgment}`:'No Mastery State selected',eyebrow:'Mastery',summary:row?`${row.judgment} \u00b7 ${row.freshness}`:'No governed competency projection is available.',domainOwner:domain.owner,revisionToken:row?.revisionId||null,lenses:[
     {id:'provenance',label:'Evaluation provenance',tabs:[
       {id:'authority',label:'Authority and truth ceilings',fields:[
         {id:'authority-ref',label:'Authority ref',value:MASTERY_AUTHORITY_REF,technical:true},
         {id:'causal-law',label:'Causal law',value:'EFFECTIVE_DECISIONS+EVIDENCE+VERSIONED_POLICY_ONLY',technical:true},
         {id:'evaluator',label:'Authorized evaluator',value:evaluator?`${evaluator.providerId} @ ${evaluator.revision} \u00b7 ${evaluator.authority}`:'UNBOUND \u2014 re-evaluation is refused with AUTHORIZED_EVALUATOR_UNBOUND',technical:Boolean(evaluator)},
         {id:'writer',label:'Canonical Mastery writer',value:'UNBOUND \u2014 no local Mastery write exists'},
         {id:'persistence',label:'Persistence',value:`${domain.persistence.mode} \u00b7 ${domain.persistence.status} \u00b7 durable ${String(domain.persistence.durable)}`,technical:true}
       ]},
       {id:'history',label:'Last state-change cause',fields:last
         ? [{id:'evaluation',label:'Evaluation id',value:last.evaluationId,technical:true},
            {id:'judgment',label:'Judgment recorded',value:last.judgment,technical:true},
            {id:'freshness',label:'Freshness recorded',value:last.freshness,technical:true},
            {id:'policy',label:'Policy applied',value:last.policyRef,technical:true},
            {id:'count',label:'Recorded evaluations',value:String(history.length),technical:true}]
         : noHistory}
     ]},
     {id:'request',label:'Re-evaluation request',tabs:[
       {id:'shape',label:'What a request carries',fields:[
         {id:'trigger',label:'Trigger',value:'USER_REEVALUATE_REQUEST',technical:true},
         {id:'requested-judgment',label:'Requested judgment',value:'null \u2014 only the authorized evaluator decides'},
         {id:'completion',label:'Completion / activity input',value:'false \u2014 never an input to Mastery'},
         {id:'local-write',label:'Local Mastery write',value:'false \u2014 the request is delegated'},
         {id:'receipts',label:'Provider receipts',value:String(domain.receipts.length),technical:true}
       ]}
     ]}
   ]};}});
 return {surface:MASTERY_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'mastery.workspace',family:'global',domainKind:'mastery',label:'Mastery'}),domain,collection,tableAdapter,compareOwner,compareProvider,provenance,provenanceProvider,contextProvider,toolbarCommandIds:['mastery.inspect','mastery.explain','mastery.reevaluate'],bottomProjection:(id=domain.records[0]?.id)=>id?{history:domain.history.filter(item=>item.recordId===id),provenance:provenanceProvider.read({id}),diagnostics:{canonicalWriterBound:false,reevaluateLocalWrite:false}}:{history:[],provenance:provenanceProvider.read({}),diagnostics:{canonicalWriterBound:false}},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ExplainabilityProjectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'},truth:{masteryFromCompletion:false,canonicalMasteryWriter:'UNBOUND',reevaluate:'ZERO_LOCAL_MASTERY_WRITE'}};
}
