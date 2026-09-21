import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createReviewsCompareProvider,REVIEW_DOMAIN_OWNER} from '../../adapters/reviews/domain.js';

export const REVIEWS_SURFACE_CONTRACT=Object.freeze({
  id:'reviews',workspace:'W04',domainOwner:REVIEW_DOMAIN_OWNER,center:'FormalReviewDecisionWorkbench',
  regionRoles:Object.freeze({LEFT:'Review Queue/Assigned/In Review/Closed collection',CENTER:'Pinned Evidence + Criteria + Findings + Decision work',RIGHT:'Reviewer scope/prior review/criterion authority/provenance conflict context',BOTTOM:'Deep artifact/source/prior Evidence/raw provenance projection',TRANSIENT:'Shared transient/focus host only'}),
  requiredSharedOwners:Object.freeze(['CollectionTableMatrixPresentationCore','CollectionTableMatrixHost','AnalyticalCompareOwner','ReviewDecisionPresentationOwner','AuditProvenancePresentationOwner','ContextInspectorHost','BottomDeepWorkOwner','TransientHostOwner']),
  localSharedOwnerCreation:false,centralWiring:'CG5_OR_GLOBAL_CONVERGENCE_REQUIRED'
});

export function createReviewsCollectionAdapter(domain){
  if(!domain||domain.owner!==REVIEW_DOMAIN_OWNER)throw Error('REVIEWS_DOMAIN_REQUIRED');
  return Object.freeze({adapterId:'w04.reviews.collection',rows:()=>domain.snapshot().records,rowId:row=>row.id,rowLabel:row=>`Review ${row.id}`,searchableText:row=>[row.id,row.revisionId,row.state,row.rereview,...(row.evidenceRefs||[]),...(row.criteriaRefs||[]),row.decision?.outcome].filter(Boolean).join(' '),columns:Object.freeze([
    {id:'review',label:'Review',minWidth:190,cell:row=>({text:`Review ${row.id}`,secondary:row.revisionId,direction:'ltr'}),compareRows:(a,b)=>a.id.localeCompare(b.id,'en')},
    {id:'state',label:'Workflow',minWidth:130,cell:row=>({text:row.state,secondary:row.rereview==='OPEN'?'Re-review open':'',direction:'ltr',tone:row.rereview==='OPEN'?'warning':'default'})},
    {id:'evidence',label:'Pinned Evidence',minWidth:180,cell:row=>({text:(row.evidenceRefs||[]).join(', '),secondary:'Exact revision basis',direction:'ltr'})},
    {id:'decision',label:'Effective Decision',minWidth:180,cell:row=>({text:row.decision?.outcome||'NONE',secondary:row.effectiveDecisionId||'No issued decision',direction:'ltr'})}
  ]),actions:row=>Object.freeze([{id:'reviews.review',label:'Start / resume review',enabled:['REQUESTED','ASSIGNED','IN_REVIEW','READY_FOR_DECISION'].includes(row.state)},{id:'reviews.finding',label:'Add finding',enabled:row.state==='IN_REVIEW'},{id:'reviews.compare',label:'Compare exact revisions',enabled:['IN_REVIEW','READY_FOR_DECISION','CLOSED'].includes(row.state)},{id:'reviews.supersede',label:'Issue superseding decision',enabled:row.state==='READY_FOR_DECISION'}])});
}

export function createReviewsContextProvider(domain){
  if(!domain||domain.owner!==REVIEW_DOMAIN_OWNER)throw Error('REVIEWS_DOMAIN_REQUIRED');
  return defineContextDescriptorProvider({id:'w04.reviews.context',family:'reviews',owner:REVIEW_DOMAIN_OWNER,isApplicable:context=>typeof context?.selectedId==='string'&&domain.records.some(row=>row.id===context.selectedId),describe:context=>{const row=domain.inspect(context.selectedId);return {id:`reviews-context:${row.id}:${row.revisionId}`,providerId:'w04.reviews.context',family:'reviews',subject:`Review ${row.id}`,eyebrow:'Formal Review context',summary:`${row.state} · ${row.decision?.outcome||'NO DECISION'}`,domainOwner:REVIEW_DOMAIN_OWNER,revisionToken:row.revisionId,lenses:[{id:'review-governance',label:'Review governance',tabs:[{id:'scope',label:'Pinned scope',fields:[{id:'evidence',label:'Pinned Evidence revisions',value:row.evidenceRefs.join(', '),technical:true},{id:'criteria',label:'Pinned criteria',value:row.criteriaRefs.join(', '),technical:true},{id:'reviewer',label:'Reviewer actor',value:row.reviewer.identity||'UNAVAILABLE',technical:true},{id:'authority',label:'Authority proof',value:row.reviewer.authorityAvailable?row.reviewer.permissionProofRef||'MISSING':'UNAVAILABLE',technical:true}]},{id:'lineage',label:'Decision lineage',fields:[{id:'effective',label:'Effective Decision',value:row.effectiveDecisionId||'NONE',technical:true},{id:'decision-count',label:'Issued Decisions retained',value:row.decisionHistory.length},{id:'rereview',label:'Re-review',value:row.rereview,technical:true},{id:'finding-count',label:'Findings',value:row.findings.length}]}]}]};}});
}


export function reviewsCenterProjection(domain,selectedId){
  const row=domain.inspect(selectedId);
  return Object.freeze({
    kind:'FormalReviewDecisionWorkbench',domainOwner:REVIEW_DOMAIN_OWNER,selectedId:row.id,
    request:Object.freeze({reviewRevisionId:row.revisionId,state:row.state,rereview:row.rereview,pinnedEvidenceRefs:Object.freeze([...row.evidenceRefs]),pinnedCriteriaRefs:Object.freeze([...row.criteriaRefs])}),
    reviewer:Object.freeze({identity:row.reviewer.identity,authorityAvailable:row.reviewer.authorityAvailable===true,assignmentPermissionAvailable:row.reviewer.assignmentPermissionAvailable===true,permissionProofRef:row.reviewer.permissionProofRef||null}),
    findings:Object.freeze(row.findings.map(item=>Object.freeze({...item}))),
    decision:Object.freeze({effectiveDecisionId:row.effectiveDecisionId||null,effectiveOutcome:row.decision?.outcome||'NONE',historyCount:row.decisionHistory.length,history:Object.freeze(row.decisionHistory.map(item=>Object.freeze({decisionId:item.decisionId,outcome:item.outcome,supersedesDecisionRef:item.supersedesDecisionRef,issuedAt:item.issuedAt,correctionReason:item.correctionReason})))}),
    actions:Object.freeze({review:row.reviewer.authorityAvailable===true,finding:row.reviewer.authorityAvailable===true&&row.state==='IN_REVIEW',compare:['IN_REVIEW','READY_FOR_DECISION','CLOSED'].includes(row.state),supersede:row.reviewer.authorityAvailable===true&&row.state==='READY_FOR_DECISION'})
  });
}

export function reviewsBottomProjection(domain,selectedId){const row=domain.inspect(selectedId);return Object.freeze({owner:REVIEW_DOMAIN_OWNER,readOnly:true,selectedId:row.id,sections:Object.freeze([{id:'evidence-basis',label:'Pinned Evidence basis',value:Object.freeze([...row.evidenceRefs])},{id:'criteria-basis',label:'Pinned criteria',value:Object.freeze([...row.criteriaRefs])},{id:'prior-decisions',label:'Immutable Decision lineage',value:Object.freeze(row.decisionHistory.map(item=>Object.freeze({decisionId:item.decisionId,outcome:item.outcome,supersedesDecisionRef:item.supersedesDecisionRef,issuedAt:item.issuedAt,correctionReason:item.correctionReason})))},{id:'compare-working-state',label:'Analytical compare working state',value:domain.compareWorkingState.get(row.id)||null}])});}

export function composeReviewsSurface({domain,analyticalCompareOwner=null}={}){
  if(!domain||domain.owner!==REVIEW_DOMAIN_OWNER)throw Error('REVIEWS_DOMAIN_REQUIRED');
  const compareProvider=createReviewsCompareProvider(domain);
  if(analyticalCompareOwner){if(analyticalCompareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');if(!analyticalCompareOwner.providerIds().includes(compareProvider.descriptor().providerId))analyticalCompareOwner.registerProvider(compareProvider);}
  return Object.freeze({contract:REVIEWS_SURFACE_CONTRACT,domain,collection:createReviewsCollectionAdapter(domain),center:selectedId=>reviewsCenterProjection(domain,selectedId),context:createReviewsContextProvider(domain),bottom:selectedId=>reviewsBottomProjection(domain,selectedId),compareProvider,slots:Object.freeze({LEFT:'w04.reviews.collection',CENTER:'FormalReviewDecisionWorkbench',RIGHT:'w04.reviews.context',BOTTOM:'reviewsBottomProjection',TRANSIENT:'SHARED_TRANSIENT_HOST_ONLY'}),commands:Object.freeze(['reviews.review','reviews.finding','reviews.compare','reviews.supersede']),compareOwner:analyticalCompareOwner?.owner||'INTEGRATION_REQUIRED'});
}
