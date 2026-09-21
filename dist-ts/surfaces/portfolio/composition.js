import {CollectionTableMatrixPresentationCore,                                       } from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {W04PortfolioDomain,createPortfolioCompareProvider,createPortfolioProvenanceProvider} from '../../adapters/portfolio/domain.js';

export const PORTFOLIO_SURFACE_ID='portfolio';
export function createPortfolioSurfaceComposition({domain=new W04PortfolioDomain(),analyticalCompareOwner=null}={}){
 const tableAdapter                                        ={
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
 const compareProvider=createPortfolioCompareProvider(domain),compareOwner=analyticalCompareOwner||new AnalyticalCompareOwner();if(compareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');if(!compareOwner.providerIds().includes(compareProvider.descriptor().providerId))compareOwner.registerProvider(compareProvider);
 const provenanceProvider=createPortfolioProvenanceProvider(domain),provenance=new AuditProvenanceInteractionCore(provenanceProvider);if(domain.records[0])provenance.refresh({id:domain.records[0].id});
 const contextProvider=defineContextDescriptorProvider({id:'portfolio.context',family:'portfolio',owner:domain.owner,describe:({id}    ={})=>{const row=domain.records.find(item=>item.id===(id??domain.records[0]?.id));return {id:`portfolio:${row?.id||'empty'}`,providerId:'portfolio.context',family:'portfolio',subject:row?.title||'No Portfolio member selected',eyebrow:'Portfolio',summary:row?`${row.refType} · ${row.state} · ${row.groupingState}`:'Curated projection over canonical references.',domainOwner:domain.owner,revisionToken:row?.revisionId||null,lenses:[{id:'identity',label:'Identity',tabs:[{id:'curation',label:'Curation metadata',fields:row?[{id:'source',label:'Canonical source ref',value:row.sourceRef,technical:true},{id:'sourceState',label:'Source state',value:row.state},{id:'grouping',label:'Grouping ref',value:row.groupingRef||'UNGROUPED',technical:true},{id:'groupingState',label:'Grouping authority state',value:row.groupingState}]:[]}]}]};}});
 return {surface:PORTFOLIO_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'portfolio.workspace',family:'global',domainKind:'portfolio',label:'Portfolio'}),domain,collection,tableAdapter,compareOwner,compareProvider,provenance,provenanceProvider,contextProvider,toolbarCommandIds:['portfolio.curate','portfolio.filter','portfolio.export','portfolio.group'],bottomProjection:(id=domain.records[0]?.id)=>id?{inspection:domain.get(id),provenance:provenanceProvider.read({id}),exportPreparation:domain.export()}:{inspection:null,provenance:provenanceProvider.read({}),exportPreparation:domain.export()},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'CurationProjectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'},truth:{canonicalSourceCopies:0,canonicalSourceDeleteAuthority:false,groupingAuthority:domain.groupingAuthorityDescriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED'}};
}
