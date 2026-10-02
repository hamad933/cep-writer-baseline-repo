import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createReviewsCompareProvider,REVIEW_DOMAIN_OWNER} from '../../adapters/reviews/domain.js';
import {activeLocale, pickText, fill, REVIEW_STATE_TONE, reviewStateLabel, reviewDecisionLabel} from './i18n.js';
export {REVIEW_STATE_TONE, reviewStateLabel, reviewDecisionLabel} from './i18n.js';
import {installReviewsPresentation} from './presentation-surface.js';
export const REVIEWS_SURFACE_CONTRACT=Object.freeze({
  id:'reviews',workspace:'W04',domainOwner:REVIEW_DOMAIN_OWNER,center:'FormalReviewDecisionWorkbench',
  regionRoles:Object.freeze({LEFT:'Review Queue/Assigned/In Review/Closed collection',CENTER:'Pinned Evidence + Criteria + Findings + Decision work',RIGHT:'Reviewer scope/prior review/criterion authority/provenance conflict context',BOTTOM:'Deep artifact/source/prior Evidence/raw provenance projection',TRANSIENT:'Shared transient/focus host only'}),
  requiredSharedOwners:Object.freeze(['CollectionTableMatrixPresentationCore','CollectionTableMatrixHost','AnalyticalCompareOwner','ReviewDecisionPresentationOwner','AuditProvenancePresentationOwner','ContextInspectorHost','BottomDeepWorkOwner','TransientHostOwner']),
  localSharedOwnerCreation:false,centralWiring:'CG5_OR_GLOBAL_CONVERGENCE_REQUIRED'
});

export function createReviewsCollectionAdapter(domain){
  if(!domain||domain.owner!==REVIEW_DOMAIN_OWNER)throw Error('REVIEWS_DOMAIN_REQUIRED');
  return Object.freeze({adapterId:'w04.reviews.collection',rows:()=>domain.snapshot().records,rowId:row=>row.id,rowLabel:row=>`Review ${row.id}`,searchableText:row=>[row.id,row.revisionId,row.state,row.rereview,...(row.evidenceRefs||[]),...(row.criteriaRefs||[]),row.decision?.outcome].filter(Boolean).join(' '),/* Two columns fit the 278 px structure pane; four columns wrapped every header and value
     * mid-word (`WORKF LOW`, `PINNED EVIDEN CE`, `Revie w rev-0084`). Identity + Decision is the
     * scannable pair a queue actually needs — the reference's left pane is a queue, not a grid.
     * `label` is a GETTER so the header follows a Settings language change on the next render. */
    columns:Object.freeze([
      {id:'review',get label(){return pickText(activeLocale()).colQueue;},minWidth:150,cell:row=>({text:`Review ${row.id}`,secondary:`${reviewStateLabel(row)} · ${row.evidenceRefs.length} evidence · ${row.findings.length} finding${row.findings.length===1?'':'s'}`,direction:'ltr'}),compareRows:(a,b)=>a.state.localeCompare(b.state,'en')||a.id.localeCompare(b.id,'en')},
      {id:'decision',get label(){return pickText(activeLocale()).colDecision;},minWidth:84,cell:row=>({text:reviewDecisionLabel(row),secondary:row.effectiveDecisionId||row.revisionId,direction:'ltr'})}
    ]),actions:row=>{const tx=pickText(activeLocale());return Object.freeze([{id:'reviews.review',label:tx.cmdReview,enabled:['REQUESTED','ASSIGNED','IN_REVIEW','READY_FOR_DECISION'].includes(row.state)},{id:'reviews.finding',label:tx.cmdFinding,enabled:row.state==='IN_REVIEW'},{id:'reviews.compare',label:tx.cmdCompare,enabled:['IN_REVIEW','READY_FOR_DECISION','CLOSED'].includes(row.state)},{id:'reviews.supersede',label:tx.cmdSupersede,enabled:row.state==='READY_FOR_DECISION'}]);}});
}

/* ── RIGHT context lens ────────────────────────────────────────────────────────────────────
 * Mirrors the reference's right column as SIX sections under the three lens identities the
 * surface contract pins (Review scope · Reviewer authority · Prior Review context):
 *   Scope            → Scope              + Criterion authority
 *   Reviewer authority → Actor vs authority + Decision issuance (the reference's conflict card)
 *   Prior Review context → Lineage         + Provenance & integrity
 * Deliberately NOT a copy of the CENTER workbench: counts, authority, gates and lineage live
 * here; findings, rationale and Decision preparation live in CENTER (ONE LOCATION).
 * Gate fields are prefixed PASS/HOLD/OPEN so the shared W04 lens presenter derives a truthful
 * status chip from values this provider actually computed — nothing decorative is emitted. */
function reviewIssuanceGate(row,t){
  const authority=row.reviewer?.authorityAvailable===true;
  if(row.decision)return t.gatePassIssued;
  if(!authority)return t.gateHoldAuthority;
  if(row.state==='READY_FOR_DECISION')return t.gatePassReady;
  if(row.state==='IN_REVIEW')return row.findings.length?fill(t.gateOpenInProgress,{n:row.findings.length}):t.gateHoldFindings;
  if(row.state==='ASSIGNED')return t.gateOpenAssigned;
  if(row.state==='REQUESTED')return t.gateOpenRequested;
  return t.gateOpenRequested;
}
function reviewConflict(row,t){
  if(row.decision)return fill(t.conflictClosed,{id:row.decision.decisionId});
  if(row.reviewer?.authorityAvailable!==true)return t.conflictAuthority;
  if(row.state==='CLOSED'||row.state==='CANCELLED')return t.conflictNone;
  const covered=row.criteriaRefs.filter(ref=>row.findings.some(f=>f.criterionRef===ref)).length;
  if(covered<row.criteriaRefs.length)return t.conflictOpen;
  return t.conflictNone;
}
function reviewRationaleGap(row,t){
  const missing=row.criteriaRefs.filter(ref=>!row.findings.some(f=>f.criterionRef===ref)).length;
  return missing?fill(t.gapOpen,{n:missing,t:row.criteriaRefs.length}):t.gapClosed;
}

export function createReviewsContextProvider(domain){
  if(!domain||domain.owner!==REVIEW_DOMAIN_OWNER)throw Error('REVIEWS_DOMAIN_REQUIRED');
  return defineContextDescriptorProvider({id:'w04.reviews.context',family:'reviews',owner:REVIEW_DOMAIN_OWNER,isApplicable:context=>typeof context?.selectedId==='string'&&domain.records.some(row=>row.id===context.selectedId),describe:context=>{
    const row=domain.inspect(context.selectedId);
    const t=pickText(activeLocale());
    const authority=row.reviewer?.authorityAvailable===true;
    const covered=row.criteriaRefs.filter(ref=>row.findings.some(f=>f.criterionRef===ref)).length;
    const persistence=domain.persistence||{mode:'SESSION_LOCAL',status:'UNAVAILABLE',reason:''};
    return {id:`reviews-context:${row.id}:${row.revisionId}`,providerId:'w04.reviews.context',family:'reviews',subject:`Review ${row.id}`,eyebrow:t.ctxEyebrow,summary:row.decision?`Decision ${row.decision.decisionId} \u00b7 ${row.decision.outcome}`:t.ctxSummaryNone,domainOwner:REVIEW_DOMAIN_OWNER,revisionToken:row.revisionId,lenses:[
      {id:'scope',label:t.lensScope,tabs:[
        {id:'scope',label:t.tabScope,fields:[
          {id:'scope-summary',label:t.fScopeSummary,value:fill(t.fScopeSummaryValue,{c:row.criteriaRefs.length,e:row.evidenceRefs.length})},
          {id:'evidence-count',label:t.fEvidenceCount,value:String(row.evidenceRefs.length),technical:true},
          {id:'criteria-count',label:t.fCriteriaCount,value:String(row.criteriaRefs.length),technical:true},
          {id:'requester',label:t.fRequester,value:String(row.requester||'owner:local'),technical:true},
          {id:'purpose',label:t.fPurpose,value:String(row.purpose||'Formal Evidence Review')},
          {id:'requested-at',label:t.fRequestedAt,value:String(row.requestedAt||t.fNotRecorded),technical:true}
        ]},
        {id:'criterion',label:t.tabCriterion,fields:[
          {id:'criterion-refs',label:t.fCriterionRefs,value:row.criteriaRefs.join(', ')||'EMPTY',technical:true},
          {id:'criterion-coverage',label:t.fCriterionCoverage,value:row.criteriaRefs.length?(row.criteriaRefs.length>covered?fill(t.coverageSome,{n:covered,t:row.criteriaRefs.length}):fill(t.coverageSome,{n:covered,t:row.criteriaRefs.length})):t.coverageNone},
          {id:'findings-count',label:t.fFindings,value:String(row.findings.length),technical:true},
          {id:'scope-rule',label:t.fScopeRule,value:t.scopeRuleValue}
        ]}
      ]},
      {id:'authority',label:t.lensAuthority,tabs:[
        {id:'authority',label:t.tabActor,fields:[
          {id:'reviewer',label:t.fReviewer,value:String(row.reviewer?.identity||'EMPTY'),technical:true},
          {id:'authority-proof',label:t.fAuthorityProof,value:authority?String(row.reviewer?.permissionProofRef||'MISSING'):t.authorityUnavailable,technical:true},
          {id:'assignment',label:t.fAssignment,value:row.reviewer?.assignmentPermissionAvailable===true?t.granted:t.notGranted},
          {id:'invariant',label:t.fAuthorityLaw,value:t.authorityLawValue}
        ]},
        {id:'issuance',label:t.tabIssuance,fields:[
          {id:'effective-decision',label:t.fEffectiveDecision,value:String(row.decision?.outcome||'NONE'),technical:true},
          {id:'issuance-gate',label:t.fIssuanceGate,value:reviewIssuanceGate(row,t)},
          {id:'authority-gate',label:t.fAuthorityLaw,value:authority?t.gatePassAuthority:t.gateHoldAuthority},
          {id:'conflict',label:t.fConflict,value:reviewConflict(row,t)},
          {id:'rationale-gap',label:t.fRationaleGap,value:reviewRationaleGap(row,t)}
        ]}
      ]},
      {id:'prior',label:t.lensPrior,tabs:[
        {id:'lineage',label:t.tabLineage,fields:[
          {id:'previous',label:t.fPrevious,value:String(row.previousReviewRef||t.fNoPrevious),technical:true},
          {id:'prior-decision',label:t.fPriorDecision,value:String(row.priorDecisionRef||'NONE'),technical:true},
          {id:'effective-id',label:t.fEffectiveId,value:String(row.effectiveDecisionId||'NONE'),technical:true},
          {id:'decisions',label:t.fDecisions,value:String(row.decisionHistory.length),technical:true},
          {id:'findings',label:t.fFindings,value:String(row.findings.length),technical:true},
          {id:'review-revision',label:t.fReviewRevision,value:String(row.revisionId),technical:true}
        ]},
        {id:'provenance',label:t.tabProvenance,fields:[
          {id:'evidence-basis',label:t.fEvidenceBasis,value:row.evidenceRefs.join(', ')||'EMPTY',technical:true},
          {id:'decision-count',label:t.fDecisionCount,value:String(row.decisionHistory.length),technical:true},
          {id:'decision-lineage',label:t.fDecisionLineage,value:row.decisionHistory.length?`${row.decisionHistory.map(d=>d.decisionId).join(', ')} — immutable`:'EMPTY',technical:true},
          {id:'lineage-rule',label:t.fLineageRule,value:t.lineageRuleValue},
          {id:'artifact-integrity',label:t.fArtifactIntegrity,value:row.evidenceRefs.length?t.integrityPinned:t.integrityNone},
          {id:'persistence',label:t.fPersistence,value:`${String(persistence.mode)} \u00b7 ${String(persistence.status)}${persistence.reason?` \u00b7 ${String(persistence.reason)}`:''}`,technical:true},
          {id:'receipts',label:t.fReceipts,value:String((domain.receipts||[]).length),technical:true}
        ]}
      ]}
    ]};}});
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
    /* Payload-shape bridge for `reviews.supersede`.
     * The command-bus contract is `{id, expectedDecisionId, newDecision:{…}}`, but the controller's
     * governed-input form posts `{id, decision:{…}}`. The surface registers this command BEFORE the
     * controller composition gets a chance to, so this registration is the one that binds — and it
     * was forwarding the form payload verbatim. The form never sets a top-level `expectedDecisionId`,
     * so the domain compared `current !== undefined`, reported a stale CAS and refused EVERY verdict
     * (including the first one): the Issue Decision button could not record a decision in any state.
     * Normalize both shapes here; availability and execution read the SAME normalized payload so a
     * verdict can never be enabled under one contract and executed under another. */
    const supersedeOpts=p=>{
      if(!p||p.newDecision||!p.decision?.decisionId)return p;
      const d=p.decision,r=getRecord(p);
      const expected=d.expectedDecisionId!==undefined?d.expectedDecisionId:(p.expectedDecisionId!==undefined?p.expectedDecisionId:(r?.effectiveDecisionId??r?.priorDecisionRef??null));
      return {...p,expectedDecisionId:expected,
        newDecision:{decisionId:d.decisionId,outcome:d.outcome,correctionReason:d.correctionReason,affectedScope:d.affectedScope,issuedAt:d.issuedAt,provenance:d.provenance},
        correctionReason:d.correctionReason??p.correctionReason};
    };
    register('reviews.supersede','Issue superseding Decision',p=>domain.supersede(p.id,supersedeOpts(p)),p=>{
      const r=getRecord(p);if(!r)return {enabled:false,code:'REVIEW_RECORD_REQUIRED',reason:'Review record required.',availabilityOwner:domain.owner};
      if(r.state!=='READY_FOR_DECISION')return {enabled:false,code:'REVIEW_NOT_READY_FOR_DECISION',reason:'Review must be in READY_FOR_DECISION state to issue decision.',availabilityOwner:domain.owner};
      if(!r.findings.length)return {enabled:false,code:'REVIEW_FINDINGS_REQUIRED',reason:'Review findings required before issuing decision.',availabilityOwner:domain.owner};
      const failure=domain.authorityFailure(r);if(failure)return {enabled:false,code:failure.code,reason:failure.reason||failure.code,availabilityOwner:domain.owner};
      const current=r.effectiveDecisionId||r.priorDecisionRef||null;
      const expected=supersedeOpts(p)?.expectedDecisionId;
      if(expected!==undefined&&expected!==current)return {enabled:false,code:'STALE_EXPECTED_DECISION',reason:'Expected decision CAS mismatch.',availabilityOwner:domain.owner};
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
  /* Mount the surface-specific PRESENTATION layer (documented as installed from here).
   * `presentation-surface.ts` owns what the shared W04 renderer cannot know: the REVIEW QUEUE
   * sections (the shared head carries EVIDENCE intake vocabulary — Submitted/Returned/Prepared/
   * Admitted — which is wrong on a Review surface), the per-row state/decision attributes its CSS
   * colours, and the surface-owned command labels for the active language. Without this
   * call the whole layer is dead code: the LEFT/RIGHT pane identity and the toolbar stay English
   * under an Arabic session and the queue shows another family's vocabulary.
   * It is idempotent, scoped to `body[data-consumer=reviews]` and a no-op without a document.
   * `applyStyle:false` — only the projection is installed; see installReviewsPresentation. */
  installReviewsPresentation({commandBus:commands,applyStyle:false});
  return Object.freeze({contract:REVIEWS_SURFACE_CONTRACT,domain,collection:createReviewsCollectionAdapter(domain),center:selectedId=>reviewsCenterProjection(domain,selectedId),context:createReviewsContextProvider(domain),bottom:selectedId=>reviewsBottomProjection(domain,selectedId),compareProvider,slots:Object.freeze({LEFT:'w04.reviews.collection',CENTER:'FormalReviewDecisionWorkbench',RIGHT:'w04.reviews.context',BOTTOM:'reviewsBottomProjection',TRANSIENT:'SHARED_TRANSIENT_HOST_ONLY'}),commandIds:Object.freeze(['reviews.request','reviews.assign','reviews.start','reviews.finding','reviews.ready','reviews.continue','reviews.cancel','reviews.compare','reviews.supersede','reviews.rereview']),
  /** Toolbar id list for the controller composition. The `commands` slot below carries the
   *  semantic command BUS (an object, not an id list); the toolbar must never receive it. */
  toolbarCommandIds:Object.freeze(['reviews.review','reviews.finding','reviews.compare','reviews.supersede']),
  commandBus:commands,
  commands:Object.freeze(['reviews.review','reviews.finding','reviews.compare','reviews.supersede']),compareOwner:analyticalCompareOwner?.owner||'INTEGRATION_REQUIRED'});
}
