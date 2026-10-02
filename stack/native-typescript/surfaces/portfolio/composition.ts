import {CollectionTableMatrixPresentationCore,type CollectionTableMatrixDomainAdapter} from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {W04PortfolioDomain,PORTFOLIO_AUTHORITY_REF,createPortfolioCompareProvider,createPortfolioProvenanceProvider} from '../../adapters/portfolio/domain.js';
import {installPortfolioPresentationStyle} from './presentation-style.js';
import {installPortfolioLeftComposition} from './left-views.js';
import {portfolioCopy} from './i18n.js';

export const PORTFOLIO_SURFACE_ID='portfolio';

/**
 * Portfolio surface composition — SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION +
 * SURFACE-SPECIFIC PRESENTATION (governance §4).
 *
 * LEFT  · reference index (2 columns: exact reference · source state) under a surface-owned
 *        saved-view navigation; every view entry is a live filter, never a dead control.
 * CENTER· assembled claim/evidence dossier, declared as data by `presentation.ts` and
 *        projected by the one shared W04 renderer.
 * RIGHT · five context cards (scope · organization · active filters · customization & export ·
 *        curation receipts) — the reference's right pane, with no field duplicated in CENTER.
 *
 * No grouping structure is composed anywhere: Q-5 (Portfolio grouping authority) is an open
 * Owner question, so `groupingRef` stays null and `portfolio.group` keeps refusing.
 */
export function createPortfolioSurfaceComposition({domain=new W04PortfolioDomain(),analyticalCompareOwner=null}={}){
 const tableAdapter:CollectionTableMatrixDomainAdapter<any>={
  adapterId:'portfolio.memberships',rows:()=>domain.records,rowId:r=>r.id,rowLabel:r=>r.title,searchableText:r=>`${r.title} ${r.refType} ${r.sourceRef} ${r.state} ${r.groupingRef||''} ${r.groupingState}`,
  // `columns` is a getter so the pane headers follow the ACTIVE language on every render —
  // the shared core reads `adapter.columns` at render time, not once at construction.
  get columns(){const T:any=portfolioCopy();return [
   {id:'member',label:T.colIndexReference,cell:(r:any)=>({text:r.title,secondary:r.sourceRef,direction:'auto'})},
   {id:'source',label:T.colIndexState,cell:(r:any)=>({text:r.state,direction:'ltr'})}
  ]},
  actions:()=>[{id:'portfolio.curate',label:'Curate',enabled:true},{id:'portfolio.group',label:'Group',enabled:true},{id:'portfolio.export',label:'Export references',enabled:true}]
 };
 const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
 installPortfolioPresentationStyle();
 const compareProvider=createPortfolioCompareProvider(domain);
 const compareOwner=analyticalCompareOwner;
 if(compareOwner){
  if(compareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
  if(!compareOwner.providerIds().includes(compareProvider.descriptor().providerId))compareOwner.registerProvider(compareProvider);
 }
 const provenanceProvider=createPortfolioProvenanceProvider(domain),provenance=new AuditProvenanceInteractionCore(provenanceProvider);if(domain.records[0])provenance.refresh({id:domain.records[0].id});
 if(typeof document!=='undefined')installPortfolioLeftComposition(domain as any,collection as any);
 // RIGHT context lens — five cards. No field here repeats a CENTER field (CEP-VIS-001-FINAL).
 const contextProvider=defineContextDescriptorProvider({id:'portfolio.context',family:'portfolio',owner:domain.owner,describe:({id}:any={})=>{
   const T:any=portfolioCopy();
   const view=typeof domain.view==='function'?domain.view():{query:'',records:domain.records,counts:{references:domain.records.length,exportMembers:domain.records.length}};
   const row=domain.records.find(item=>item.id===(id??domain.records[0]?.id))||null;
   let exportProjection:any={members:[],limitations:[],canonicalPublication:false,note:''};
   try{exportProjection=domain.export();}catch{/* export truth stays at its safe defaults */}
   const receipts=domain.receipts;
   const receiptFields=receipts.length
     ? receipts.map((item,index)=>({id:`r${index}`,label:`${item.sequence} \u00b7 ${item.command}`,value:`${item.action||'curate'} ${item.id} \u00b7 canonicalWrite ${String(item.canonicalSourceWrite===true)} \u00b7 sourcePreserved ${String(item.sourcePreserved!==false)}`,technical:true}))
     : [{id:'r0',label:T.fRecordedMutations,value:T.fReceiptsNone}];
   const last=receipts[receipts.length-1]||null;
   const descriptor=domain.groupingAuthorityDescriptor;
   const outsideView=Math.max(0,domain.records.length-view.counts.references);
   // Domain-supplied projection text is localized at the presentation boundary (i18n.domainCopy);
   // an unmapped string is shown verbatim so the projection never diverges from domain truth.
   const fromDomain=text=>(T.domainCopy&&T.domainCopy[text])||text;
   return {id:`portfolio:${row?.id||'empty'}`,providerId:'portfolio.context',family:'portfolio',subject:row?`${row.title} \u00b7 ${row.state}`:T.subjectNone,eyebrow:T.eyebrow,summary:row?`${row.refType} \u00b7 ${row.state} \u00b7 ${row.groupingState}`:T.summaryEmpty,domainOwner:domain.owner,revisionToken:row?.revisionId||null,lenses:[
     {id:'scope',label:T.lensScope,tabs:[{id:'scope',label:T.lensScopeTab,fields:[
       {id:'view',label:T.fView,value:T.emptyTitle},
       {id:'selected',label:T.fSelected,value:row?`${row.id} @ ${row.revisionId}`:T.fGroupingNoneSelected,technical:true},
       {id:'references',label:T.fRefsInView,value:`${view.counts.references} / ${domain.records.length}`},
       {id:'owner',label:T.fOwner,value:domain.owner,technical:true},
       {id:'authority-ref',label:T.fAuthorityRef,value:PORTFOLIO_AUTHORITY_REF,technical:true}
     ]}]},
     {id:'organization',label:T.lensOrganization,tabs:[{id:'ordering',label:T.lensOrganizationTab,fields:[
       {id:'ordering',label:T.fOrdering,value:T.fOrderingValue},
       {id:'grouping-authority',label:T.fGroupingAuthority,value:descriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED (Q-5 open)'},
       {id:'grouping-registry',label:T.fGroupingRegistry,value:descriptor?`${descriptor.providerId} \u00b7 ${descriptor.registryId} \u00b7 ${descriptor.revision}`:T.fRegistryEmpty},
       {id:'selected-grouping',label:T.fSelectedGrouping,value:row?(row.groupingRef||T.fGroupingUngrouped):T.fGroupingNoneSelected,technical:true},
       {id:'grouping-subject',label:T.fGroupingSubject,value:T.fGroupingSubjectValue}
     ]}]},
     {id:'filters',label:T.lensFilters,tabs:[{id:'filter',label:T.lensFiltersTab,fields:[
       {id:'active',label:T.fActiveFilter,value:view.query?`\`${view.query}\``:T.fFilterNone},
       {id:'admitted',label:T.fAdmitted,value:String(view.counts.references)},
       {id:'outside',label:T.fOutside,value:String(outsideView)},
       {id:'search',label:T.fSearchable,value:T.fSearchableValue},
       {id:'last-receipt',label:T.fLastReceipt,value:last?`${last.sequence} \u00b7 ${last.command} \u00b7 ${last.action||'curate'} \u00b7 ${last.id}`:T.fLastReceiptNone}
     ]}]},
     {id:'customization',label:T.lensExport,tabs:[{id:'export',label:T.lensExportTab,fields:[
       {id:'members',label:T.fExportMembers,value:String(exportProjection.members?.length??0)},
       {id:'canonical',label:T.fCanonicalPublication,value:String(exportProjection.canonicalPublication===true)},
       {id:'limitations',label:T.fLimitations,value:(exportProjection.limitations||[]).map(fromDomain).join(' \u00b7 ')||T.fLastReceiptNone},
       {id:'persistence',label:T.fPersistence,value:`${domain.persistence?.mode||'EMPTY'} \u00b7 durable ${String(domain.persistence?.durable===true)}`,technical:true},
       {id:'note',label:T.fExportNote,value:fromDomain(exportProjection.note)||T.fExportNoteNone}
     ]}]},
     {id:'receipts',label:T.lensReceipts,tabs:[{id:'ledger',label:T.lensReceiptsTab,fields:receiptFields}]}
   ]};}});
 return {surface:PORTFOLIO_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'portfolio.workspace',family:'global',domainKind:'portfolio',label:'Portfolio'}),domain,collection,tableAdapter,compareOwner,compareProvider,provenance,provenanceProvider,contextProvider,toolbarCommandIds:['portfolio.curate','portfolio.filter','portfolio.export','portfolio.group'],bottomProjection:(id=domain.records[0]?.id)=>id?{inspection:domain.get(id),provenance:provenanceProvider.read({id}),exportPreparation:domain.export()}:{inspection:null,provenance:provenanceProvider.read({}),exportPreparation:domain.export()},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'CurationProjectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'},truth:{canonicalSourceCopies:0,canonicalSourceDeleteAuthority:false,groupingAuthority:domain.groupingAuthorityDescriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED'}};
}
