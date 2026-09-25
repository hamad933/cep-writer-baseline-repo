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
    actions:Object.freeze({
      review:row.reviewer.authorityAvailable===true,
      request:true,
      assign:row.reviewer.authorityAvailable===true&&row.reviewer.assignmentPermissionAvailable!==false&&row.state==='REQUESTED',
      start:row.reviewer.authorityAvailable===true&&row.state==='ASSIGNED',
      finding:row.reviewer.authorityAvailable===true&&row.state==='IN_REVIEW',
      ready:row.reviewer.authorityAvailable===true&&row.state==='IN_REVIEW'&&row.findings.length>0,
      continue:['IN_REVIEW','READY_FOR_DECISION'].includes(row.state),
      cancel:row.reviewer.authorityAvailable===true&&['REQUESTED','ASSIGNED','IN_REVIEW'].includes(row.state),
      supersede:row.reviewer.authorityAvailable===true&&row.state==='READY_FOR_DECISION'&&row.findings.length>0,
      rereview:row.state==='CLOSED'&&!!row.effectiveDecisionId,
      compare:['IN_REVIEW','READY_FOR_DECISION','CLOSED'].includes(row.state),
      canAssign:row.reviewer.authorityAvailable===true&&row.reviewer.assignmentPermissionAvailable!==false&&row.state==='REQUESTED',
      canStart:row.reviewer.authorityAvailable===true&&row.state==='ASSIGNED',
      canAddFinding:row.reviewer.authorityAvailable===true&&row.state==='IN_REVIEW',
      canMarkReady:row.reviewer.authorityAvailable===true&&row.state==='IN_REVIEW'&&row.findings.length>0,
      canContinue:['IN_REVIEW','READY_FOR_DECISION'].includes(row.state),
      canCancel:row.reviewer.authorityAvailable===true&&['REQUESTED','ASSIGNED','IN_REVIEW'].includes(row.state),
      canSupersede:row.reviewer.authorityAvailable===true&&row.state==='READY_FOR_DECISION'&&row.findings.length>0,
      canRereview:row.state==='CLOSED'&&!!row.effectiveDecisionId
    })
  });
}

export function reviewsBottomProjection(domain,selectedId){const row=domain.inspect(selectedId);return Object.freeze({owner:REVIEW_DOMAIN_OWNER,readOnly:true,selectedId:row.id,sections:Object.freeze([{id:'evidence-basis',label:'Pinned Evidence basis',value:Object.freeze([...row.evidenceRefs])},{id:'criteria-basis',label:'Pinned criteria',value:Object.freeze([...row.criteriaRefs])},{id:'prior-decisions',label:'Immutable Decision lineage',value:Object.freeze(row.decisionHistory.map(item=>Object.freeze({decisionId:item.decisionId,outcome:item.outcome,supersedesDecisionRef:item.supersedesDecisionRef,issuedAt:item.issuedAt,correctionReason:item.correctionReason})))},{id:'compare-working-state',label:'Analytical compare working state',value:domain.compareWorkingState.get(row.id)||null}])});}

export function composeReviewsSurface({domain,analyticalCompareOwner=null,commands=null}={}){
  if(!domain||domain.owner!==REVIEW_DOMAIN_OWNER)throw Error('REVIEWS_DOMAIN_REQUIRED');
  const compareProvider=createReviewsCompareProvider(domain);
  if(analyticalCompareOwner){if(analyticalCompareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');if(!analyticalCompareOwner.providerIds().includes(compareProvider.descriptor().providerId))analyticalCompareOwner.registerProvider(compareProvider);}
  if(commands){
    const getRecord=p=>p?.id?domain.records.find(x=>x.id===p.id):null;
    const register=(id,label,run,available=()=>true)=>{if(!(commands.commands instanceof Map&&commands.commands.has(id)))commands.registerCommand(id,domain.owner,label,run,available);};
    register('reviews.request','Request formal Review',p=>domain.review(p.id,{...p,action:'request'}),p=>{
      if(!domain.reviewAuthorityRegistry&&!domain.allowTestAuthority)return {enabled:false,code:'REVIEWER_AUTHORITY_UNAVAILABLE',reason:'Reviewer authority registry is not bound; caller-supplied fields are not authoritative.',availabilityOwner:domain.owner};
      if(p?.id&&domain.records.some(x=>x.id===p.id))return {enabled:false,code:'REVIEW_ID_CONFLICT',reason:'Review record already exists.',availabilityOwner:domain.owner};
      if(p?.reviewer?.identity){
        const auth=domain.resolveReviewerAuthority(p.reviewer.identity);
        if(!auth||!auth.authorized)return {enabled:false,code:'REVIEWER_AUTHORITY_UNAVAILABLE',reason:auth?.reason||'Reviewer not in authority registry',availabilityOwner:domain.owner};
        if(auth.testOnly&&!domain.allowTestAuthority)return {enabled:false,code:'TEST_AUTHORITY_NOT_ALLOWED_IN_PRODUCT',reason:'Test authority not allowed in product',availabilityOwner:domain.owner};
      }
      return true;
    });
    register('reviews.assign','Assign formal Review',p=>domain.review(p.id,{...p,action:'assign'}),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(r.state!=='REQUESTED')return {enabled:false,code:'REVIEW_STATE_ACTION_INVALID',reason:'Review must be in REQUESTED state to assign.',availabilityOwner:domain.owner};
      const failure=domain.authorityFailure(r,{assignment:true});if(failure)return {enabled:false,code:failure.code,reason:failure.reason||failure.code,availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.start','Start formal Review',p=>domain.review(p.id,{...p,action:'start'}),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(r.state!=='ASSIGNED')return {enabled:false,code:'REVIEW_STATE_ACTION_INVALID',reason:'Review must be in ASSIGNED state to start.',availabilityOwner:domain.owner};
      const failure=domain.authorityFailure(r,{assignment:true});if(failure)return {enabled:false,code:failure.code,reason:failure.reason||failure.code,availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.finding','Add Review finding',p=>domain.finding(p.id,p),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(r.state!=='IN_REVIEW')return {enabled:false,code:'REVIEW_NOT_FINDING_EDITABLE',reason:'Review must be in IN_REVIEW state to add findings.',availabilityOwner:domain.owner};
      const failure=domain.authorityFailure(r);if(failure)return {enabled:false,code:failure.code,reason:failure.reason||failure.code,availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.ready','Mark Review ready for Decision',p=>domain.review(p.id,{...p,action:'ready'}),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(r.state!=='IN_REVIEW')return {enabled:false,code:'REVIEW_STATE_ACTION_INVALID',reason:'Review must be in IN_REVIEW state to mark ready.',availabilityOwner:domain.owner};
      if(!r.findings.length)return {enabled:false,code:'REVIEW_FINDINGS_REQUIRED',reason:'Review findings required before marking ready.',availabilityOwner:domain.owner};
      const failure=domain.authorityFailure(r);if(failure)return {enabled:false,code:failure.code,reason:failure.reason||failure.code,availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.continue','Continue formal Review',p=>domain.review(p.id,{...p,action:'continue'}),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(!['IN_REVIEW','READY_FOR_DECISION'].includes(r.state))return {enabled:false,code:'REVIEW_STATE_ACTION_INVALID',reason:'Review must be IN_REVIEW or READY_FOR_DECISION to continue.',availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.cancel','Cancel formal Review',p=>domain.review(p.id,{...p,action:'cancel'}),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(!['REQUESTED','ASSIGNED','IN_REVIEW'].includes(r.state))return {enabled:false,code:'REVIEW_STATE_ACTION_INVALID',reason:'Review can only be cancelled from REQUESTED, ASSIGNED, or IN_REVIEW.',availabilityOwner:domain.owner};
      const failure=domain.authorityFailure(r);if(failure)return {enabled:false,code:failure.code,reason:failure.reason||failure.code,availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.supersede','Issue superseding Decision',p=>domain.supersede(p.id,p),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(r.state!=='READY_FOR_DECISION')return {enabled:false,code:'REVIEW_NOT_READY_FOR_DECISION',reason:'Review must be in READY_FOR_DECISION state to issue decision.',availabilityOwner:domain.owner};
      if(!r.findings.length)return {enabled:false,code:'REVIEW_FINDINGS_REQUIRED',reason:'Review findings required before issuing decision.',availabilityOwner:domain.owner};
      const failure=domain.authorityFailure(r);if(failure)return {enabled:false,code:failure.code,reason:failure.reason||failure.code,availabilityOwner:domain.owner};
      const current=r.effectiveDecisionId||r.priorDecisionRef||null;
      if(p?.expectedDecisionId!==undefined&&p.expectedDecisionId!==current)return {enabled:false,code:'STALE_EXPECTED_DECISION',reason:'Expected decision CAS mismatch.',availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.rereview','Request re-review',p=>domain.review(p.id,{...p,action:'rereview'}),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(r.state!=='CLOSED'||!r.effectiveDecisionId)return {enabled:false,code:'CLOSED_DECIDED_REVIEW_REQUIRED_FOR_REREVIEW',reason:'Re-review requires a CLOSED review with an effective Decision.',availabilityOwner:domain.owner};
      return true;
    });
    register('reviews.compare','Compare exact Review revisions',p=>domain.compare(p.id,{...p,compareOwner:analyticalCompareOwner,provider:compareProvider}),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(!analyticalCompareOwner)return {enabled:false,code:'CENTRAL_ANALYTICAL_COMPARE_REQUIRED',reason:'Central analytical compare owner required.',availabilityOwner:domain.owner};
      if(!['IN_REVIEW','READY_FOR_DECISION','CLOSED'].includes(r.state))return {enabled:false,code:'REVIEW_STATE_ACTION_INVALID',reason:'Review comparison requires IN_REVIEW, READY_FOR_DECISION, or CLOSED state.',availabilityOwner:domain.owner};
      return true;
    });
  }
  return Object.freeze({contract:REVIEWS_SURFACE_CONTRACT,domain,collection:createReviewsCollectionAdapter(domain),center:selectedId=>reviewsCenterProjection(domain,selectedId),context:createReviewsContextProvider(domain),bottom:selectedId=>reviewsBottomProjection(domain,selectedId),compareProvider,slots:Object.freeze({LEFT:'w04.reviews.collection',CENTER:'FormalReviewDecisionWorkbench',RIGHT:'w04.reviews.context',BOTTOM:'reviewsBottomProjection',TRANSIENT:'SHARED_TRANSIENT_HOST_ONLY'}),commandIds:Object.freeze(['reviews.request','reviews.assign','reviews.start','reviews.finding','reviews.ready','reviews.continue','reviews.cancel','reviews.compare','reviews.supersede','reviews.rereview']),commands,compareOwner:analyticalCompareOwner?.owner||'INTEGRATION_REQUIRED'});
}
