import {defineContextDescriptorProvider} from '../../foundation/global/context-descriptor-contract.js';
import {createEvidenceCompareProvider,EVIDENCE_DOMAIN_OWNER} from '../../adapters/evidence/domain.js';

export const EVIDENCE_SURFACE_CONTRACT=Object.freeze({
  id:'evidence',workspace:'W04',domainOwner:EVIDENCE_DOMAIN_OWNER,center:'GovernedEvidenceWorkbench',
  regionRoles:Object.freeze({LEFT:'Candidate/Evidence collection navigation',CENTER:'Selected Candidate or immutable Evidence revision workbench',RIGHT:'Unique provenance/criterion/source/revision context',BOTTOM:'Deep artifact/source-diff/integrity/raw-provenance projection',TRANSIENT:'Shared transient/focus host only'}),
  requiredSharedOwners:Object.freeze(['CollectionTableMatrixPresentationCore','CollectionTableMatrixHost','AnalyticalCompareOwner','AuditProvenancePresentationOwner','ContextInspectorHost','BottomDeepWorkOwner','TransientHostOwner']),
  localSharedOwnerCreation:false,centralWiring:'CG5_OR_GLOBAL_CONVERGENCE_REQUIRED'
});

export function createEvidenceCollectionAdapter(domain){
  if(!domain||domain.owner!==EVIDENCE_DOMAIN_OWNER)throw Error('EVIDENCE_DOMAIN_REQUIRED');
  return Object.freeze({
    adapterId:'w04.evidence.collection',
    rows:()=>domain.records.map(row=>domain.inspect(row.id)),
    rowId:row=>row.id,
    rowLabel:row=>row.title||row.id,
    searchableText:row=>[row.id,row.evidenceId,row.revisionId,row.title,row.status,row.candidateState,row.sourceStatus,row.reviewStatus,row.effectiveDecision,...(row.criterionRefs||[])].filter(Boolean).join(' '),
    columns:Object.freeze([
      {id:'record',label:'Evidence record',minWidth:220,cell:row=>({text:row.title||row.id,secondary:`${row.id} · ${row.revisionId}`,direction:'auto'}),compareRows:(a,b)=>String(a.title||a.id).localeCompare(String(b.title||b.id),'en')},
      {id:'lifecycle',label:'Lifecycle',minWidth:130,cell:row=>({text:row.status,secondary:row.candidateState||'',direction:'ltr',tone:row.status==='WITHDRAWN'?'warning':row.status==='ADMITTED'?'success':'default'})},
      {id:'source',label:'Source',minWidth:150,cell:row=>({text:row.sourceStatus,secondary:`${row.sourceId||row.id}@${row.sourceRevision||row.revisionId}`,direction:'ltr',tone:row.sourceStatus==='SUPERSEDED'?'warning':'default'})},
      {id:'review',label:'Review',minWidth:170,cell:row=>({text:row.reviewStatus||'UNREVIEWED',secondary:row.effectiveDecision||'NONE',direction:'ltr'})}
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
  // RIGHT context lens — the reference's right column (source integrity · reference review ·
  // duplicate search · source status · lineage completeness + a truth notice). Only PROVENANCE and
  // LINEAGE live here: the record content, the lifecycle state pill and the admission gates are
  // CENTER's authoritative display (CEP-VIS-001-FINAL 'ONE INFORMATION ITEM -> ONE LOCATION').
  return defineContextDescriptorProvider({id:'w04.evidence.context',family:'evidence',owner:EVIDENCE_DOMAIN_OWNER,isApplicable:context=>typeof context?.selectedId==='string'&&domain.records.some(row=>row.id===context.selectedId),describe:context=>{
    const row=domain.inspect(context.selectedId),revision=row.currentRevision;
    let duplicate=null;try{duplicate=domain.duplicateCandidate?domain.duplicateCandidate(row):null}catch{duplicate=null}
    const notice=row.status==='ADMITTED'
      ? 'Admission created an immutable Evidence revision only. Admission is not acceptance, Review, Decision or Mastery, and this record is not a Mastery claim.'
      : 'This Candidate has not been admitted as Evidence yet and is not a trusted source until Admission. Import never implies Admission, Review, Decision or Mastery.';
    return {id:`evidence-context:${row.id}:${row.revisionId}`,providerId:'w04.evidence.context',family:'evidence',subject:row.title||row.id,eyebrow:'Evidence context',summary:notice,domainOwner:EVIDENCE_DOMAIN_OWNER,revisionToken:revision?.revisionId||row.revisionId,lenses:[
      {id:'provenance',label:'Source integrity and provenance',tabs:[{id:'provenance',label:'Provenance',fields:[
        {id:'evidence-id',label:'Evidence ID',value:row.evidenceId||row.id,technical:true},
        {id:'revision-id',label:'Revision',value:revision?.revisionId||row.revisionId,technical:true},
        {id:'digest',label:'Digest',value:revision?.source?.digest||row.digest||'EMPTY \u2014 no digest is recorded yet',technical:true},
        {id:'criterion',label:'Criterion relevance',value:(row.criterionRefs||[]).length?(row.criterionRefs||[]).join(', '):'EMPTY \u2014 no criterion is pinned',technical:true},
        {id:'producer',label:'Producer identity',value:row.producerIdentity||'EMPTY \u2014 not recorded',technical:true},
        {id:'handoff',label:'Handoff receipt',value:row.handoffReceiptRef||'EMPTY \u2014 not recorded',technical:true}
      ]}]},
      {id:'lineage',label:'Lineage completeness',tabs:[{id:'lineage',label:'Revisions',fields:[
        {id:'current',label:'Current revision',value:revision?.revisionId||row.revisionId,technical:true},
        {id:'retained',label:'Revisions retained',value:String((row.lineage?.revisionIds||[]).length),technical:true},
        {id:'previous',label:'Previous revision',value:revision?.previousRevisionRef||'None \u2014 first revision',technical:true},
        {id:'base',label:'Base Evidence revision',value:row.baseEvidenceRevisionId||'None \u2014 not an amendment',technical:true},
        {id:'immutable',label:'Immutable',value:revision?.immutable===true?'true \u2014 supersedes by new revision only':'false \u2014 Candidate record'},
        {id:'lifecycle',label:'Lifecycle',value:row.lineage?.lifecycle||'NO_ADMISSION_LINEAGE',technical:true}
      ]}]},
      {id:'duplicate',label:'Duplicate search',tabs:[{id:'duplicate',label:'Scan result',fields:[
        {id:'scan',label:'Duplicate Candidate scan',value:duplicate?`DUPLICATE \u2014 ${duplicate.id} carries the same claim/source fingerprint`:'NO DUPLICATE CANDIDATE \u2014 no other record matches this claim and source fingerprint'},
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
