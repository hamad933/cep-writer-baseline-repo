import {CollectionTableMatrixPresentationCore,type CollectionTableMatrixDomainAdapter} from '../../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createFamilyWorkspaceBinding} from '../../foundation/workspace-host.js';
import {AnalyticalCompareOwner} from '../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {W04MasteryDomain,createMasteryCompareProvider,createMasteryProvenanceProvider} from '../../adapters/mastery/domain.js';

export const MASTERY_SURFACE_ID='mastery';
export function createMasterySurfaceComposition({domain=new W04MasteryDomain(),analyticalCompareOwner=null}={}){
 const tableAdapter:CollectionTableMatrixDomainAdapter<any>={
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
 const contextProvider=defineContextDescriptorProvider({id:'mastery.context',family:'mastery',owner:domain.owner,describe:({id}:any={})=>{const row=domain.records.find(item=>item.id===(id??domain.records[0]?.id));return {id:`mastery:${row?.id||'empty'}`,providerId:'mastery.context',family:'mastery',subject:row?.capability||'No Mastery State selected',eyebrow:'Mastery',summary:row?`${row.judgment} · ${row.freshness}`:'No governed competency projection is available.',domainOwner:domain.owner,revisionToken:row?.revisionId||null,lenses:[{id:'identity',label:'Identity',tabs:[{id:'governed-basis',label:'Governed basis',fields:row?[{id:'subject',label:'Subject',value:row.subject,technical:true},{id:'policy',label:'Policy revision',value:row.policyRef,technical:true},{id:'judgment',label:'Judgment',value:row.judgment},{id:'freshness',label:'Freshness',value:row.freshness},{id:'basis',label:'Basis digest',value:row.basis.digest,technical:true}]:[]}]}]};}});
 return {surface:MASTERY_SURFACE_ID,workspaceBinding:createFamilyWorkspaceBinding({id:'mastery.workspace',family:'global',domainKind:'mastery',label:'Mastery'}),domain,collection,tableAdapter,compareOwner,compareProvider,provenance,provenanceProvider,contextProvider,toolbarCommandIds:['mastery.inspect','mastery.explain','mastery.reevaluate'],bottomProjection:(id=domain.records[0]?.id)=>id?{history:domain.history.filter(item=>item.recordId===id),provenance:provenanceProvider.read({id}),diagnostics:{canonicalWriterBound:false,reevaluateLocalWrite:false}}:{history:[],provenance:provenanceProvider.read({}),diagnostics:{canonicalWriterBound:false}},slots:{TOP:'shared',TOOLBAR:'shared',LEFT:'collection',CENTER:'ExplainabilityProjectionWorkbench',RIGHT:'shared-context-inspector',BOTTOM:'shared-bottom-shell/domain-projection',TRANSIENT:'shared'},truth:{masteryFromCompletion:false,canonicalMasteryWriter:'UNBOUND',reevaluate:'ZERO_LOCAL_MASTERY_WRITE'}};
}
