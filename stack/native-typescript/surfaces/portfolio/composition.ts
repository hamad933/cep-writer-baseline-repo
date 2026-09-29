import {CollectionTableMatrixPresentationCore,type CollectionTableMatrixDomainAdapter} from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {W04PortfolioDomain,PORTFOLIO_AUTHORITY_REF,createPortfolioCompareProvider,createPortfolioProvenanceProvider} from '../../adapters/portfolio/domain.js';

export const PORTFOLIO_SURFACE_ID='portfolio';
export function createPortfolioSurfaceComposition({domain=new W04PortfolioDomain(),analyticalCompareOwner=null}={}){
 const tableAdapter:CollectionTableMatrixDomainAdapter<any>={
  adapterId:'portfolio.memberships',rows:()=>domain.records,rowId:r=>r.id,rowLabel:r=>r.title,searchableText:r=>`${r.title} ${r.refType} ${r.sourceRef} ${r.state} ${r.groupingRef||''} ${r.groupingState}`,
  columns:[
   {id:'member',label:'Curated item',cell:r=>({text:r.title,secondary:r.sourceRef,direction:'auto'})},
   {id:'type',label:'Reference type',cell:r=>({text:r.refType})},
   {id:'source',label:'Source state',cell:r=>({text:r.state,tone:r.state==='RESOLVABLE'?'success':r.state==='UNAVAILABLE'?'danger':'warning'})},
   {id:'grouping',label:'Grouping',cell:r=>({text:r.groupingRef||'Ungrouped',secondary:r.groupingState,tone:r.groupingState==='AUTHORITY_PENDING'?'warning':'default'})}
  ],
  actions:()=>[{id:'portfolio.curate',label:'Curate',enabled:true},{id:'portfolio.group',label:'Group',enabled:true},{id:'portfolio.export',label:'Export references',enabled:true}]
 };
 const collection=new CollectionTableMatrixPresentationCore(tableAdapter);
 const compareProvider=createPortfolioCompareProvider(domain);
 const compareOwner=analyticalCompareOwner;
 if(compareOwner){
  if(compareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');
  if(!compareOwner.providerIds().includes(compareProvider.descriptor().providerId))compareOwner.registerProvider(compareProvider);
 }
 const provenanceProvider=createPortfolioProvenanceProvider(domain),provenance=new AuditProvenanceInteractionCore(provenanceProvider);if(domain.records[0])provenance.refresh({id:domain.records[0].id});
 // RIGHT context lens — curation TRUTH CEILINGS and the receipt ledger. Deliberately distinct
 // from the CENTER workbench (identity / source integrity / export preparation), so no
 // information item has two authoritative display locations (CEP-VIS-001-FINAL).
 const contextProvider=defineContextDescriptorProvider({id:'portfolio.context',family:'portfolio',owner:domain.owner,describe:({id}:any={})=>{
   const row=domain.records.find(item=>item.id===(id??domain.records[0]?.id));
   const receipts=domain.receipts;
   const receiptFields=receipts.length
     ? receipts.map((item,index)=>({id:`r${index}`,label:`${item.sequence} \u00b7 ${item.command}`,value:`${item.action||'curate'} ${item.id} \u00b7 canonicalWrite ${String(item.canonicalSourceWrite===true)} \u00b7 sourcePreserved ${String(item.sourcePreserved!==false)}`,technical:true}))
     : [{id:'r0',label:'Recorded mutations',value:'EMPTY \u2014 no curation mutation has been executed in this workspace'}];
   return {id:`portfolio:${row?.id||'empty'}`,providerId:'portfolio.context',family:'portfolio',subject:row?`${row.title} \u00b7 ${row.state}`:'No Portfolio member selected',eyebrow:'Portfolio',summary:row?`${row.refType} \u00b7 ${row.state} \u00b7 ${row.groupingState}`:'Curated projection over canonical references.',domainOwner:domain.owner,revisionToken:row?.revisionId||null,lenses:[
     {id:'authority',label:'Curation authority',tabs:[{id:'ceilings',label:'Truth ceilings',fields:[
       {id:'copies',label:'Canonical copies',value:'0 \u2014 Portfolio never copies canonical truth'},
       {id:'delete',label:'Canonical delete authority',value:'false \u2014 removing a membership never deletes Evidence/Mastery'},
       {id:'grouping',label:'Grouping authority',value:domain.groupingAuthorityDescriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED (Q-5 open)'},
       {id:'authority-ref',label:'Authority ref',value:PORTFOLIO_AUTHORITY_REF,technical:true},
       {id:'persistence',label:'Persistence',value:`${domain.persistence.mode} \u00b7 ${domain.persistence.status} \u00b7 durable ${String(domain.persistence.durable)}`,technical:true},
       {id:'filter',label:'Active filter',value:domain.filterText?`\`${domain.filterText}\``:'none'}
     ]}]},
     {id:'receipts',label:'Curation receipts',tabs:[{id:'ledger',label:'Recorded mutations',fields:receiptFields}]}
   ]};}});
 return {surface:PORTFOLIO_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'portfolio.workspace',family:'global',domainKind:'portfolio',label:'Portfolio'}),domain,collection,tableAdapter,compareOwner,compareProvider,provenance,provenanceProvider,contextProvider,toolbarCommandIds:['portfolio.curate','portfolio.filter','portfolio.export','portfolio.group'],bottomProjection:(id=domain.records[0]?.id)=>id?{inspection:domain.get(id),provenance:provenanceProvider.read({id}),exportPreparation:domain.export()}:{inspection:null,provenance:provenanceProvider.read({}),exportPreparation:domain.export()},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'CurationProjectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'},truth:{canonicalSourceCopies:0,canonicalSourceDeleteAuthority:false,groupingAuthority:domain.groupingAuthorityDescriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED'}};
}
