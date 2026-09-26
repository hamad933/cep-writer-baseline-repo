import {CollectionTableMatrixPresentationCore,type CollectionTableMatrixDomainAdapter} from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {isReviewDecisionPresentationSnapshot} from '../../foundation/review/decision.js';
import {W04PortfolioDomain,createPortfolioCompareProvider,createPortfolioProvenanceProvider} from '../../adapters/portfolio/domain.js';

export const PORTFOLIO_SURFACE_ID='portfolio';
export const PORTFOLIO_PRESENTATION_DEFAULTS=Object.freeze({locale:'ar',direction:'rtl',theme:'dark',layout:'evidence-dashboard'});
const DIRECTIONS=new Set(['ltr','rtl','auto']);
const textOr=(value,fallback)=>String(value??'').trim()||fallback;
const presentationProjection=(input={})=>{
 const direction=DIRECTIONS.has(input.direction)?input.direction:PORTFOLIO_PRESENTATION_DEFAULTS.direction;
 const effective=Object.freeze({
  locale:textOr(input.locale,PORTFOLIO_PRESENTATION_DEFAULTS.locale),
  direction,
  theme:textOr(input.theme,PORTFOLIO_PRESENTATION_DEFAULTS.theme),
  layout:textOr(input.layout,PORTFOLIO_PRESENTATION_DEFAULTS.layout)
 });
 return Object.freeze({
  defaults:PORTFOLIO_PRESENTATION_DEFAULTS,
  effective,
  customizable:Object.freeze(['locale','direction','theme','layout']),
  immutableProductLaw:false,
  persistenceOwner:'GlobalPreferenceCore',
  note:'Arabic/RTL/dark/dashboard values are safe starting defaults and reference-aligned examples, not immutable Product law.'
 });
};

export function createPortfolioSurfaceComposition({domain=new W04PortfolioDomain(),analyticalCompareOwner=null,reviewDecisionProjection=null,presentationPreferences={}}={}){
 if(reviewDecisionProjection!==null&&!isReviewDecisionPresentationSnapshot(reviewDecisionProjection))throw Error('PORTFOLIO_REVIEW_DECISION_PROJECTION_INVALID');
 const tableAdapter:CollectionTableMatrixDomainAdapter<any>={
  adapterId:'portfolio.memberships',rows:()=>domain.records,rowId:r=>r.id,rowLabel:r=>r.title,searchableText:r=>`${r.title} ${r.refType} ${r.sourceRef} ${r.state} ${r.groupingRef||''} ${r.groupingState}`,
  columns:[
   {id:'member',label:'Curated item',cell:r=>({text:r.title,secondary:r.sourceRef,direction:'auto'})},
   {id:'type',label:'Reference type',cell:r=>({text:r.refType})},
   {id:'source',label:'Source disposition',cell:r=>({text:r.state,tone:r.state==='RESOLVABLE'?'success':r.state==='UNAVAILABLE'?'danger':'warning'})},
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
 const contextProvider=defineContextDescriptorProvider({id:'portfolio.context',family:'portfolio',owner:domain.owner,describe:({id}:any={})=>{const row=domain.records.find(item=>item.id===(id??domain.records[0]?.id));return {id:`portfolio:${row?.id||'empty'}`,providerId:'portfolio.context',family:'portfolio',subject:row?.title||'No Portfolio member selected',eyebrow:'Portfolio',summary:row?`${row.refType} · ${row.state} · ${row.groupingState}`:'Curated projection over canonical references.',domainOwner:domain.owner,revisionToken:row?.revisionId||null,lenses:[{id:'identity',label:'Identity',tabs:[{id:'curation',label:'Curation metadata',fields:row?[{id:'source',label:'Canonical source ref',value:row.sourceRef,technical:true},{id:'sourceState',label:'Source disposition',value:row.state},{id:'grouping',label:'Grouping ref',value:row.groupingRef||'UNGROUPED',technical:true},{id:'groupingState',label:'Grouping authority state',value:row.groupingState},{id:'order',label:'Curation order',value:String(row.curation?.order??0)}]:[]}]}]};}});
 const presentation=presentationProjection(presentationPreferences);
 return {surface:PORTFOLIO_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'portfolio.workspace',family:'global',domainKind:'portfolio',label:'Portfolio'}),domain,collection,tableAdapter,compareOwner,compareProvider,provenance,provenanceProvider,reviewDecisionProjection,contextProvider,presentation,toolbarCommandIds:['portfolio.curate','portfolio.filter','portfolio.export','portfolio.group'],bottomProjection:(id=domain.records[0]?.id)=>id?{inspection:domain.get(id),provenance:provenanceProvider.read({id}),reviewDecision:reviewDecisionProjection,exportPreparation:domain.export()}:{inspection:null,provenance:provenanceProvider.read({}),reviewDecision:reviewDecisionProjection,exportPreparation:domain.export()},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'CurationProjectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'},truth:{canonicalSourceCopies:0,canonicalSourceDeleteAuthority:false,canonicalReviewDecisionWriteAuthority:false,groupingAuthority:domain.groupingAuthorityDescriptor?'REGISTRY_BOUND':'AUTHORITY_DECISION_REQUIRED',reviewDecisionProjection:reviewDecisionProjection?'READ_ONLY_SHARED_PROJECTION':'UNBOUND_READ_ONLY_OPTIONAL',presentationDefaultsAreProductLaw:false}};
}
