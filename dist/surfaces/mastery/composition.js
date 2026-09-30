import {CollectionTableMatrixPresentationCore,                                       } from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {W04MasteryDomain,MASTERY_AUTHORITY_REF,MASTERY_CAUSAL_LAW,createMasteryCompareProvider,createMasteryProvenanceProvider} from '../../adapters/mastery/domain.js';
import {activeLocale,pickText} from './i18n.js';

export const MASTERY_SURFACE_ID='mastery';

/** Governed judgment vocabulary → a short LEFT-pane status word. The EXACT token stays in the
 *  CENTER status pill and in the record ladder; the pane column is navigation chrome and must
 *  fit the shared 86 px status column without clipping. */
const JUDGMENT_SHORT    ={
 MASTERED:'Mastered',NOT_MASTERED:'Not mastered',INCONCLUSIVE:'Inconclusive',
 INSUFFICIENT_EVIDENCE:'Evidence gap',NOT_EVALUATED:'Not evaluated'
};

export function createMasterySurfaceComposition({domain=new W04MasteryDomain(),analyticalCompareOwner=null}={}){
 const t=pickText(activeLocale());
 const tableAdapter                                        ={
  adapterId:'mastery.states',rows:()=>domain.records,rowId:r=>r.id,rowLabel:r=>r.capability,searchableText:r=>`${r.capability} ${r.path||''} ${r.subject} ${r.judgment} ${r.freshness} ${r.policyRef}`,
  columns:[
   {id:'target',get label(){return pickText(activeLocale()).colTarget},cell:r=>({text:r.capability,secondary:r.path||r.subject,direction:'auto'})},
   {id:'judgment',get label(){return pickText(activeLocale()).colJudgment},cell:r=>({text:JUDGMENT_SHORT[r.judgment]||r.judgment})}
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
    const t=pickText(activeLocale());
    const row=domain.records.find(item=>item.id===(id??domain.records[0]?.id));
    const evaluator=domain.evaluatorDescriptor;
    const history=row?domain.history.filter(item=>item.recordId===row.id):[];
    const last=history.length?history[history.length-1]:null;
    let conflict=false,missingRefs         =[];
    try{const ex=domain.explain(row.id);conflict=ex.conflict;missingRefs=(ex.missingRefs||[])            ;}catch{conflict=false;}
    const noHistory=[{id:'empty',label:t.rowRecorded,value:t.fNoHistory}];
    const blocked=[
      ...(evaluator?[]:[{id:'blocked-evaluator',label:t.fEvaluator,value:t.valueUnbound+' (AUTHORIZED_EVALUATOR_UNBOUND)',technical:true}]),
      ...(missingRefs.length?[{id:'blocked-basis',label:t.rowUnresolved,value:'BASIS_UNAVAILABLE \u00b7 '+missingRefs.join(', '),technical:true}]:[]),
      {id:'blocked-conflict',label:t.rowConflict,value:conflict?t.conflictBlocked:t.conflictNone,technical:true},
      {id:'blocked-persistence',label:t.fLocalWrite,value:domain.persistence.mode+' \u00b7 '+domain.persistence.status+' \u00b7 durable '+String(domain.persistence.durable),technical:true}
    ];
    return {id:'mastery:'+(row?row.id:'empty'),providerId:'mastery.context',family:'mastery',
      subject:row?row.capability+' \u00b7 '+row.judgment:t.ctxSubjectNone,
      eyebrow:t.ctxEyebrow,
      summary:row?row.judgment+' \u00b7 '+row.freshness:t.ctxSummaryNone,
      domainOwner:domain.owner,revisionToken:row?row.revisionId:null,lenses:[
      {id:'provenance',label:t.lensProvenance,tabs:[
        {id:'authority',label:t.tabAuthority,fields:[
          {id:'authority-ref',label:t.fAuthorityRef,value:MASTERY_AUTHORITY_REF,technical:true},
          {id:'causal-law',label:t.fCausalLaw,value:MASTERY_CAUSAL_LAW,technical:true},
          {id:'evaluator',label:t.fEvaluator,value:evaluator?evaluator.providerId+' @ '+evaluator.revision+' \u00b7 '+evaluator.authority:'UNBOUND \u2014 re-evaluation is refused with AUTHORIZED_EVALUATOR_UNBOUND',technical:Boolean(evaluator)},
          {id:'writer',label:t.fWriter,value:'UNBOUND \u2014 no local Mastery write exists'},
          {id:'persistence',label:t.fPersistence,value:domain.persistence.mode+' \u00b7 '+domain.persistence.status+' \u00b7 durable '+String(domain.persistence.durable),technical:true}
        ]},
        {id:'identity',label:t.tabIdentity,fields:row?[
          {id:'record',label:t.fRecordRef,value:row.id+' @ '+row.revisionId,technical:true},
          {id:'policy-set',label:t.rowPolicySet,value:row.capability,technical:false},
          {id:'evaluation',label:t.fEvaluationId,value:last?last.evaluationId:'\u2014',technical:true},
          {id:'evaluated-at',label:t.fEvaluatedAt,value:(last&&last.evaluatedAt)?last.evaluatedAt:t.fNoHistory,technical:false},
          {id:'truth-class',label:t.rowTruthClass,value:row.truthClass||t.truthClassProvider,technical:true}
        ]:noHistory}
      ]},
      {id:'cause',label:t.lensCause,tabs:[
        {id:'cause',label:t.tabCause,fields:last
          ? [{id:'evaluation',label:t.fEvaluationId,value:last.evaluationId,technical:true},
             {id:'judgment',label:t.fJudgmentRecorded,value:last.judgment,technical:true},
             {id:'freshness',label:t.fFreshnessRecorded,value:last.freshness,technical:true},
             {id:'policy',label:t.fPolicyApplied,value:last.policyRef,technical:true},
             {id:'count',label:t.fRecordedCount,value:String(history.length),technical:true}]
          : noHistory},
        {id:'freshness',label:t.tabFreshness,fields:[
          {id:'state',label:t.fFreshness,value:row?row.freshness:'UNAVAILABLE',technical:true},
          {id:'trigger',label:t.fTrigger,value:t.freshnessTrigger},
          {id:'conflict',label:t.rowConflict,value:conflict?t.conflictBlocked:t.conflictNone,technical:true}
        ]}
      ]},
      {id:'request',label:t.lensRequest,tabs:[
        {id:'shape',label:t.tabRequest,fields:[
          {id:'trigger',label:t.fTrigger,value:'USER_REEVALUATE_REQUEST',technical:true},
          {id:'requested-judgment',label:t.fRequestedJudgment,value:t.onlyEvaluatorDecides},
          {id:'completion',label:t.fCompletion,value:t.neverInput,technical:true},
          {id:'local-write',label:t.fLocalWrite,value:t.requestDelegated,technical:true},
          {id:'receipts',label:t.fReceipts,value:String(domain.receipts.length),technical:true}
        ]},
        {id:'availability',label:t.tabAvailability,fields:[
          {id:'basis',label:t.fBasisState,value:missingRefs.length?'BASIS_UNAVAILABLE':'RESOLVED',technical:true},
          ...blocked
        ]}
      ]}
    ]};}});
 return {surface:MASTERY_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'mastery.workspace',family:'global',domainKind:'mastery',label:'Mastery'}),domain,collection,tableAdapter,compareOwner,compareProvider,provenance,provenanceProvider,contextProvider,toolbarCommandIds:['mastery.inspect','mastery.explain','mastery.reevaluate'],bottomProjection:(id=domain.records[0]?.id)=>id?{history:domain.history.filter(item=>item.recordId===id),provenance:provenanceProvider.read({id}),diagnostics:{canonicalWriterBound:false,reevaluateLocalWrite:false}}:{history:[],provenance:provenanceProvider.read({}),diagnostics:{canonicalWriterBound:false}},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ExplainabilityProjectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'},truth:{masteryFromCompletion:false,canonicalMasteryWriter:'UNBOUND',reevaluate:'ZERO_LOCAL_MASTERY_WRITE'}};
}
