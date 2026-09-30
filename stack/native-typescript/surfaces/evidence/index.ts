import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createEvidenceCompareProvider,EVIDENCE_DOMAIN_OWNER} from '../../adapters/evidence/domain.js';

/** Abbreviated digest for the RIGHT lens — the full digest lives in the BOTTOM deep artifact
 *  projection (ONE INFORMATION ITEM -> ONE LOCATION); the ellipsis marks the truncation. */
const shortDigest = value => {
  const text = String(value || '');
  if (!text) return '';
  return text.length > 34 ? `${text.slice(0, 22)}…${text.slice(-8)}` : text;
};

export const EVIDENCE_SURFACE_CONTRACT=Object.freeze({
  id:'evidence',workspace:'W04',domainOwner:EVIDENCE_DOMAIN_OWNER,center:'GovernedEvidenceWorkbench',
  regionRoles:Object.freeze({LEFT:'Candidate/Evidence collection navigation',CENTER:'Selected Candidate or immutable Evidence revision workbench',RIGHT:'Unique provenance/criterion/source/revision context',BOTTOM:'Deep artifact/source-diff/integrity/raw-provenance projection',TRANSIENT:'Shared transient/focus host only'}),
  requiredSharedOwners:Object.freeze(['CollectionTableMatrixPresentationCore','CollectionTableMatrixHost','AnalyticalCompareOwner','AuditProvenancePresentationOwner','ContextInspectorHost','BottomDeepWorkOwner','TransientHostOwner']),
  localSharedOwnerCreation:false,centralWiring:'CG5_OR_GLOBAL_CONVERGENCE_REQUIRED'
});

/* Intake queue vocabulary — human labels instead of raw protocol tokens (the queue is the
 * surface's LEFT triage list; the exact tokens stay on the record and in the context lens). */
const INTAKE_STATE_LABEL=Object.freeze({RECEIVED:'Received',DRAFT:'Draft',PREPARED:'Prepared',SUBMITTED_FOR_INTAKE:'Submitted',RETURNED_FOR_CONTEXT:'Returned',DECLINED:'Declined',WITHDRAWN:'Withdrawn',ADMITTED:'Admitted'});
const INTAKE_STATE_TONE=Object.freeze({ADMITTED:'success',SUBMITTED_FOR_INTAKE:'info',RETURNED_FOR_CONTEXT:'warning',DECLINED:'danger',WITHDRAWN:'danger',PREPARED:'neutral',DRAFT:'neutral',RECEIVED:'neutral'});
export const intakeStateOf=row=>row?.status==='ADMITTED'?'ADMITTED':String(row?.candidateState||'RECEIVED');
export const intakeStateLabel=row=>INTAKE_STATE_LABEL[intakeStateOf(row)]||intakeStateOf(row);
export const intakeStateTone=row=>INTAKE_STATE_TONE[intakeStateOf(row)]||'neutral';

export function createEvidenceCollectionAdapter(domain){
  if(!domain||domain.owner!==EVIDENCE_DOMAIN_OWNER)throw Error('EVIDENCE_DOMAIN_REQUIRED');
  return Object.freeze({
    adapterId:'w04.evidence.collection',
    rows:()=>domain.records.map(row=>domain.inspect(row.id)),
    rowId:row=>row.id,
    rowLabel:row=>row.title||row.id,
    searchableText:row=>[row.id,row.evidenceId,row.revisionId,row.title,row.status,row.candidateState,row.sourceStatus,row.reviewStatus,row.effectiveDecision,...(row.criterionRefs||[])].filter(Boolean).join(' '),
    // Two columns fit the 278 px structure pane; four columns scrolled two of them out of view.
    columns:Object.freeze([
      {id:'record',label:'Intake queue',minWidth:150,cell:row=>({text:row.title||row.id,secondary:`${row.evidenceId||row.id} · ${row.sourceStatus}`,direction:'auto',tone:intakeStateTone(row)}),compareRows:(a,b)=>String(a.title||a.id).localeCompare(String(b.title||b.id),'en')},
      {id:'state',label:'State',minWidth:84,cell:row=>({text:intakeStateLabel(row),secondary:row.status==='ADMITTED'?(row.lineage?.lifecycle||'ACTIVE'):(row.reviewStatus&&row.reviewStatus!=='UNREVIEWED'?row.reviewStatus:''),direction:'auto',tone:intakeStateTone(row)}),compareRows:(a,b)=>intakeStateOf(a).localeCompare(intakeStateOf(b),'en')}
    ]),
    actions:row=>Object.freeze([
      {id:'evidence.inspect',label:'Inspect exact record',enabled:true},
      {id:'evidence.amend',label:'Prepare amendment',enabled:row.status==='ADMITTED'},
      {id:'evidence.admit',label:'Admit candidate',enabled:row.status==='CANDIDATE'&&row.candidateState==='SUBMITTED_FOR_INTAKE'&&row.intakeValidation?.status==='VALIDATED'},
      {id:'evidence.sourceChoice',label:'Resolve superseded source',enabled:row.sourceStatus==='SUPERSEDED'}
    ])
  });
}

export function createEvidenceContextProvider(domain){
  if(!domain||domain.owner!==EVIDENCE_DOMAIN_OWNER)throw Error('EVIDENCE_DOMAIN_REQUIRED');
  // RIGHT context lens — the reference's right column (source integrity · criterion/standardization
  // · duplicate search · source state · lineage completeness + a truth notice). The record content,
  // the lifecycle state pill and the queue live in CENTER/LEFT (CEP-VIS-001-FINAL 'ONE INFORMATION
  // ITEM -> ONE LOCATION'); every value below is derived from the live domain record — nothing is
  // invented, and a gate that does not hold is stated as OPEN/HOLD, never as a pass.
  return defineContextDescriptorProvider({id:'w04.evidence.context',family:'evidence',owner:EVIDENCE_DOMAIN_OWNER,isApplicable:context=>typeof context?.selectedId==='string'&&domain.records.some(row=>row.id===context.selectedId),describe:context=>{
    const row=domain.inspect(context.selectedId),revision=row.currentRevision;
    // excludeId = this record: without it the scan matched the record ITSELF and reported a
    // false HOLD duplicate (self-match is not a duplicate).
    let duplicate=null;try{duplicate=domain.duplicateCandidate?domain.duplicateCandidate(row,row.id):null}catch{duplicate=null}
    const admitted=row.status==='ADMITTED';
    const verified=row.verification?.status==='VERIFIED';
    const bytes=row.sourceBytesAvailable,schema=row.schemaValid;
    const validated=row.intakeValidation?.status==='VALIDATED';
    const authority=row.admissionAuthority?.available===true;
    const digest=revision?.source?.digest||row.digest||null;
    const refs=[...(row.criterionRefs||[])];
    // Gate vocabulary: PASS (holds) · OPEN (not yet true) · HOLD (blocks admission) · INFO (fact).
    const gate=(value,passText,openText,holdText)=>value===true?`PASS · ${passText}`:value===false?`HOLD · ${holdText}`:`OPEN · ${openText}`;
    const notice=admitted
      ? 'Admission created an immutable Evidence revision only. Admission is not acceptance, Review, Decision or Mastery, and this record is not a Mastery claim.'
      : 'This Candidate has not been admitted as Evidence yet and is not a trusted source until Admission. Import never implies Admission, Review, Decision or Mastery.';
    return {id:`evidence-context:${row.id}:${row.revisionId}`,providerId:'w04.evidence.context',family:'evidence',subject:row.title||row.id,eyebrow:'Evidence context',summary:notice,domainOwner:EVIDENCE_DOMAIN_OWNER,revisionToken:revision?.revisionId||row.revisionId,lenses:[
      {id:'provenance',label:'Source integrity',tabs:[
        {id:'gates',label:'Intake gates',fields:[
          {id:'source-bytes',label:'Source bytes',value:gate(bytes,'available for hashing','not asserted by the producer','unavailable — admission refuses')},
          {id:'schema',label:'Schema validity',value:gate(schema,'valid against the evidence schema','not checked yet','rejected — admission refuses')},
          {id:'digest',label:'Digest',value:digest?(verified?`PASS · ${shortDigest(digest)}`:`INFO · ${shortDigest(digest)}`):'OPEN · no digest is recorded yet',technical:!!digest},
          {id:'verification',label:'Source verification',value:verified?`PASS · ${row.verification.providerId} · ${row.verification.proofRef}`:'HOLD · source is not verified — admission refuses'},
          {id:'intake-validation',label:'Intake validation',value:validated?`PASS · ${row.intakeValidation.validator} · ${row.intakeValidation.proofRef}`:'OPEN · candidate is not validated for intake'},
          {id:'admission-authority',label:'Admission authority',value:authority?`PASS · ${row.admissionAuthority.proofRef}`:'HOLD · not bound — admission refuses'}
        ]},
        {id:'source-state',label:'Source state',fields:[
          {id:'source-status',label:'Source status',value:row.sourceStatus==='SUPERSEDED'?'HOLD · superseded — choose update, retain or withdraw':`PASS · ${row.sourceStatus||'CURRENT'} source revision`},
          {id:'import-assurance',label:'Import assurance',value:`INFO · recorded at import as ${row.importAssurance||'UNVERIFIED'}`},
          {id:'identity',label:'Evidence identity',value:`${row.evidenceId||row.id} · ${revision?.revisionId||row.revisionId}`,technical:true}
        ]},
        {id:'criteria',label:'Criterion and purpose',fields:[
          {id:'criterion-pinned',label:'Criterion pinned',value:refs.length?`PASS · ${refs.length} canonical criterion reference(s)`:'OPEN · no criterion is pinned'},
          {id:'criterion-scope',label:'Canonical scope',value:refs.length?refs.join(' · '):'OPEN — no canonical scope is pinned'},
          {id:'governed-purpose',label:'Governed purpose',value:row.governedPurpose?'PASS · governed purpose is recorded':'OPEN · no governed purpose is recorded'}
        ]}
      ]},
      {id:'lineage',label:'Lineage completeness',tabs:[{id:'revisions',label:'Revisions',fields:[
        {id:'current',label:'Current revision',value:revision?.revisionId||row.revisionId,technical:true},
        {id:'retained',label:'Revisions retained',value:String((row.lineage?.revisionIds||[]).length),technical:true},
        {id:'previous',label:'Previous revision',value:revision?.previousRevisionRef||'None — first revision'},
        {id:'base',label:'Base Evidence revision',value:row.baseEvidenceRevisionId||'None — not an amendment'},
        {id:'immutable',label:'Immutable',value:revision?.immutable===true?'PASS · immutable — supersedes by new revision only':'OPEN · candidate record — not immutable yet'},
        {id:'lifecycle',label:'Lifecycle',value:row.lineage?.lifecycle||'NO_ADMISSION_LINEAGE',technical:true}
      ]}]},
      {id:'duplicate',label:'Duplicate search',tabs:[{id:'scan',label:'Scan result',fields:[
        {id:'scan',label:'Duplicate Candidate scan',value:duplicate?`HOLD · ${duplicate.id} carries the same claim and source fingerprint`:'PASS · no other candidate matches this claim and source fingerprint'},
        {id:'method',label:'Method',value:'claim + subject + source ref + criterion refs + governed purpose fingerprint'}
      ]}]}
    ]};}});
}


export function evidenceCenterProjection(domain,selectedId){
  const row=domain.inspect(selectedId),revision=row.currentRevision;
  return Object.freeze({
    kind:'GovernedEvidenceWorkbench',domainOwner:EVIDENCE_DOMAIN_OWNER,selectedId:row.id,
    identity:Object.freeze({recordKind:row.status==='ADMITTED'?'ADMITTED_EVIDENCE':'CANDIDATE_EVIDENCE',evidenceId:row.evidenceId||row.id,revisionId:revision?.revisionId||row.revisionId,baseEvidenceRevisionId:row.baseEvidenceRevisionId||null}),
    claim:Object.freeze({title:row.title,evidenceClaim:revision?.evidenceClaim||row.evidenceClaim||row.title,subject:revision?.subject||row.subject||'owner:local',criterionRefs:Object.freeze([...(row.criterionRefs||[])])}),
    state:Object.freeze({candidateState:row.candidateState||null,evidenceLifecycle:row.lineage?.lifecycle||(row.status==='WITHDRAWN'?'WITHDRAWN':row.status==='ADMITTED'?'ACTIVE':null),reviewStatus:row.reviewStatus||'UNREVIEWED',effectiveReviewDecision:row.effectiveDecision||'NONE',sourceStatus:row.sourceStatus}),
    provenance:Object.freeze({sourceRef:revision?`${revision.source.sourceId}@${revision.source.sourceRevision}`:`${row.sourceId||row.id}@${row.sourceRevision||row.revisionId}`,digest:revision?.source.digest||row.digest,immutableRevision:revision?.immutable===true,admissionAuthorityAvailable:row.admissionAuthority?.available===true}),
    actions:Object.freeze({inspect:true,amend:row.status==='ADMITTED'&&row.lineage?.lifecycle!=='WITHDRAWN',admit:row.status==='CANDIDATE'&&row.candidateState==='SUBMITTED_FOR_INTAKE'&&row.intakeValidation?.status==='VALIDATED'&&row.sourceBytesAvailable===true&&row.schemaValid===true&&row.admissionAuthority?.available===true,sourceChoice:row.sourceStatus==='SUPERSEDED'})
  });
}

export function evidenceBottomProjection(domain,selectedId){
  const row=domain.inspect(selectedId),revision=row.currentRevision;
  return Object.freeze({owner:EVIDENCE_DOMAIN_OWNER,readOnly:true,selectedId:row.id,sections:Object.freeze([
    {id:'artifact',label:'Deep artifact inspection',value:Object.freeze({sourceRef:revision?`${revision.source.sourceId}@${revision.source.sourceRevision}`:`${row.sourceId||row.id}@${row.sourceRevision||row.revisionId}`,bytesAvailable:row.sourceBytesAvailable,digest:revision?.source.digest||row.digest})},
    {id:'lineage',label:'Evidence revision lineage',value:Object.freeze({currentRevisionId:row.lineage?.currentRevisionId||null,revisionIds:Object.freeze([...(row.lineage?.revisionIds||[])]),baseEvidenceRevisionId:row.baseEvidenceRevisionId||null})},
    {id:'raw-provenance',label:'Raw provenance',value:revision?.provenance||Object.freeze({candidate:true,producerIdentity:row.producerIdentity||null,handoffReceiptRef:row.handoffReceiptRef||null})}
  ])});
}

export function composeEvidenceSurface({domain,analyticalCompareOwner=null}={}){
  if(!domain||domain.owner!==EVIDENCE_DOMAIN_OWNER)throw Error('EVIDENCE_DOMAIN_REQUIRED');
  const compareProvider=createEvidenceCompareProvider(domain);
  if(analyticalCompareOwner){if(analyticalCompareOwner.ownerToken!=='AnalyticalCompare')throw Error('CENTRAL_ANALYTICAL_COMPARE_REQUIRED');if(!analyticalCompareOwner.providerIds().includes(compareProvider.descriptor().providerId))analyticalCompareOwner.registerProvider(compareProvider);}
  return Object.freeze({contract:EVIDENCE_SURFACE_CONTRACT,domain,collection:createEvidenceCollectionAdapter(domain),center:selectedId=>evidenceCenterProjection(domain,selectedId),context:createEvidenceContextProvider(domain),bottom:selectedId=>evidenceBottomProjection(domain,selectedId),compareProvider,slots:Object.freeze({LEFT:'w04.evidence.collection',CENTER:'GovernedEvidenceWorkbench',RIGHT:'w04.evidence.context',BOTTOM:'evidenceBottomProjection',TRANSIENT:'SHARED_TRANSIENT_HOST_ONLY'}),commands:Object.freeze(['evidence.inspect','evidence.import','evidence.amend','evidence.admit','evidence.sourceChoice']),compareOwner:analyticalCompareOwner?.owner||'INTEGRATION_REQUIRED'});
}
