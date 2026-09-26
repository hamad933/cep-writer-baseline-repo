import {ActionAvailabilityCore} from '../../foundation/models.js';
import {createAnalyticalProviderBoundary,canonicalAnalyticalIdentityKey} from '../../foundation/contracts/analysis-provider.js';

export const EVIDENCE_DOMAIN_OWNER='W04EvidenceDomain';
export const EVIDENCE_DECISIONS=Object.freeze(['NONE','ACCEPT','ACCEPT_WITH_LIMITATIONS','MORE_EVIDENCE_REQUIRED','REJECT']);
export const CANDIDATE_STATES=Object.freeze(['RECEIVED','DRAFT','PREPARED','SUBMITTED_FOR_INTAKE','ADMITTED','RETURNED_FOR_CONTEXT','DECLINED','WITHDRAWN']);
const clone=value=>value===undefined?undefined:structuredClone(value);
const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))deepFreeze(child);Object.freeze(value);}return value;};
const freeze=value=>deepFreeze(clone(value));
const text=(value,fallback='')=>value==null?fallback:String(value);
const now=()=>new Date().toISOString();
const exactSource=(record)=>freeze({sourceType:record.sourceType||'imported-material',sourceId:record.sourceId||record.id,sourceRevision:record.sourceRevision||record.revisionId,digest:record.digest??null,sourceBytesAvailable:record.sourceBytesAvailable===true?true:record.sourceBytesAvailable===false?false:null,schemaValid:record.schemaValid===true?true:record.schemaValid===false?false:null,producerIdentity:record.producerIdentity||null,sourceTimestamp:record.sourceTimestamp||null,handoffReceiptRef:record.handoffReceiptRef||null,verification:clone(record.verification||{status:'UNVERIFIED',providerId:null,proofRef:null})});
const selectedMaterials=record=>[...(record.selectedMaterialRefs||[`${record.sourceId||record.id}@${record.sourceRevision||record.revisionId}`])].map(String).filter(Boolean).sort();
const fingerprint=record=>JSON.stringify({sourceId:String(record.sourceId||''),sourceRevision:String(record.sourceRevision||''),selectedMaterialRefs:selectedMaterials(record),subject:String(record.subject||''),evidenceClaim:String(record.evidenceClaim||''),criterionRefs:[...(record.criterionRefs||[])].map(String).sort(),governedPurpose:String(record.governedPurpose||'')});
const coherentCandidate=record=>!!String(record.evidenceClaim||'').trim()&&!!String(record.subject||'').trim()&&!!String(record.sourceId||'').trim()&&!!String(record.sourceRevision||'').trim()&&((record.criterionRefs||[]).length>0||!!String(record.governedPurpose||'').trim());
const demoInitial=()=>[
  {id:'ev-alpha',revisionId:'evr-001',evidenceId:'ev-alpha',title:'Packet capture evidence',status:'CANDIDATE',candidateState:'SUBMITTED_FOR_INTAKE',candidateRevision:1,intakeValidation:{status:'VALIDATED',validator:'rescue-base',proofRef:'validation:rescue-base:alpha',at:'2026-09-17T00:00:00.000Z'},sourceStatus:'CURRENT',digest:'sha256:1111111111111111',schemaValid:true,sourceBytesAvailable:true,verification:{status:'VERIFIED',providerId:'demo.source.verifier',providerRevision:'1.0.0',proofRef:'proof:demo:alpha',digest:'sha256:1111111111111111',schemaValid:true,sourceBytesAvailable:true,verifiedAt:'2026-09-17T00:00:00.000Z',testOnly:true},reviewStatus:null,effectiveDecision:null,notes:'Primary capture / التقاط أساسي',subject:'owner:local',evidenceClaim:'Packet capture evidence',criterionRefs:['criteria:v4#provenance'],governedPurpose:'Formal criterion evidence',selectedMaterialRefs:['result-alpha@result-alpha-r1'],admissionAuthority:{available:true,proofRef:'authority:evidence-admission:local-owner:v1'},sourceType:'run-result',sourceId:'result-alpha',sourceRevision:'result-alpha-r1'},
  {id:'ev-beta',revisionId:'evr-002',evidenceId:'ev-beta',title:'Configuration transcript',status:'ADMITTED',candidateState:'ADMITTED',candidateRevision:1,intakeValidation:{status:'VALIDATED',validator:'rescue-base',proofRef:'validation:rescue-base:beta',at:'2026-09-17T00:00:00.000Z'},sourceStatus:'SUPERSEDED',digest:'sha256:2222222222222222',schemaValid:true,sourceBytesAvailable:true,verification:{status:'VERIFIED',providerId:'demo.source.verifier',providerRevision:'1.0.0',proofRef:'proof:demo:beta',digest:'sha256:2222222222222222',schemaValid:true,sourceBytesAvailable:true,verifiedAt:'2026-09-17T00:00:00.000Z',testOnly:true},reviewStatus:null,effectiveDecision:null,notes:'Historical source retained / مصدر تاريخي محفوظ',subject:'owner:local',evidenceClaim:'Configuration transcript',criterionRefs:['criteria:v4#integrity'],governedPurpose:'Formal criterion evidence',selectedMaterialRefs:['config-transcript@config-r1'],admissionAuthority:{available:true,proofRef:'authority:evidence-admission:local-owner:v1'},sourceType:'imported-material',sourceId:'config-transcript',sourceRevision:'config-r1'}
];

function immutableRevisionFromRecord(record,{revisionNumber=1,previousRevisionRef=null,actor='owner:local',reason='Initial admission',admittedAt=null}={}){
  return freeze({evidenceId:record.evidenceId||record.id,revisionId:record.revisionId,revisionNumber,previousRevisionRef,lifecycleAtAdmission:'ACTIVE',subject:record.subject,evidenceClaim:record.evidenceClaim,title:record.title,notes:record.notes||'',criterionRefs:clone(record.criterionRefs||[]),governedPurpose:record.governedPurpose||null,selectedMaterialRefs:selectedMaterials(record),source:exactSource(record),provenance:freeze({admittedBy:actor,admittedAt:admittedAt||now(),revisionReason:reason,authorityProofRef:record.admissionAuthority?.proofRef||null}),immutable:true});
}

export const createW04EvidenceDemoRecords=()=>freeze(demoInitial());

export class W04EvidenceDomain{
  constructor(records=undefined,{reviewProjectionResolver=null,admissionAuthorityRegistry=null,allowTestAuthority=false}={}){
    this.owner=EVIDENCE_DOMAIN_OWNER;this.reviewProjectionResolver=reviewProjectionResolver;
    this.admissionAuthorityRegistry=admissionAuthorityRegistry;this.allowTestAuthority=allowTestAuthority;
    const initialRecords=records===undefined?[]:records;
    this.records=clone(initialRecords).map(record=>({...record,evidenceId:record.evidenceId||record.id,criterionRefs:clone(record.criterionRefs||[]),selectedMaterialRefs:selectedMaterials(record),candidateRevision:Number.isInteger(record.candidateRevision)?record.candidateRevision:1,candidateState:record.candidateState||(record.status==='ADMITTED'?'ADMITTED':'PREPARED'),intakeValidation:clone(record.intakeValidation||{status:'NOT_VALIDATED'}),admissionAuthority:clone(record.admissionAuthority||{available:false,proofRef:null})}));
    this.evidenceRevisions=[];this.lineage=new Map();this.sourceChoices=[];this.receipts=[];this.seq=0;
    this.persistence={mode:'SESSION_LOCAL',durable:false,status:'UNAVAILABLE',reason:'No surface-local persistence owner; shared persistence may be bound by final integration.'};
    for(const record of this.records.filter(item=>item.status==='ADMITTED')){const revision=immutableRevisionFromRecord(record,{revisionNumber:1,reason:'Pre-existing admitted Evidence loaded from explicit provider/test injection'});this.evidenceRevisions.push(revision);this.lineage.set(record.evidenceId,{evidenceId:record.evidenceId,currentRevisionId:revision.revisionId,revisionIds:[revision.revisionId],lifecycle:'ACTIVE'});}
    this.availability=new ActionAvailabilityCore();for(const id of ['evidence.inspect','evidence.import','evidence.amend','evidence.admit','evidence.sourceChoice'])this.availability.register(id,{selection:{exact:id==='evidence.import'?0:1},activeModes:['review']});
  }
  setReviewProjectionResolver(resolver){this.reviewProjectionResolver=resolver;return this;}
  snapshot(){return freeze({owner:this.owner,records:this.records.map(r=>this.inspect(r.id)),evidenceRevisions:this.evidenceRevisions.map(r=>this.inspectRevision(r.evidenceId,r.revisionId)),lineage:[...this.lineage.values()],sourceChoices:this.sourceChoices,persistence:this.persistence,receipts:this.receipts});}
  get(id){const r=this.records.find(x=>x.id===id);if(!r)throw Error('EVIDENCE_UNKNOWN:'+id);return r;}
  reviewProjection(record,lineage){if(record.status!=='ADMITTED'||!lineage)return {state:'NOT_APPLICABLE',reviewStatus:null,effectiveDecision:null};if(!this.reviewProjectionResolver)return {state:'UNVERIFIED_PROVIDER_UNBOUND',reviewStatus:null,effectiveDecision:null};try{const result=this.reviewProjectionResolver({evidenceRef:`${record.evidenceId}@${lineage.currentRevisionId}`,criterionRefs:clone(record.criterionRefs||[])});if(!result||result.state!=='RESOLVED')return {state:result?.state||'UNAVAILABLE',reviewStatus:null,effectiveDecision:null,reason:result?.reason||null};return result;}catch(error){return {state:'UNAVAILABLE',reviewStatus:null,effectiveDecision:null,reason:String(error?.message||error)};}}
  inspect(id){const record=this.get(id),lineage=this.lineage.get(record.evidenceId)||null,currentRevision=lineage?this.findRevision(record.evidenceId,lineage.currentRevisionId):null,projection=this.reviewProjection(record,lineage);return freeze({...record,lineage,currentRevision,reviewProjection:projection,reviewStatus:projection.reviewStatus,effectiveDecision:projection.effectiveDecision});}
  findRevision(evidenceId,revisionId){return this.evidenceRevisions.find(item=>item.evidenceId===evidenceId&&item.revisionId===revisionId)||null;}
  revisionLifecycle(evidenceId,revisionId){const lineage=this.lineage.get(evidenceId);if(!lineage)return null;if(lineage.lifecycle==='WITHDRAWN')return 'WITHDRAWN';return lineage.currentRevisionId===revisionId?'ACTIVE':'SUPERSEDED';}
  inspectRevision(evidenceId,revisionId){const revision=this.findRevision(evidenceId,revisionId);if(!revision)throw Error(`EVIDENCE_REVISION_UNKNOWN:${evidenceId}@${revisionId}`);return freeze({...revision,lifecycle:this.revisionLifecycle(evidenceId,revisionId)});}
  resolveReviewableEvidenceRef(ref){const [evidenceId,revisionId,...rest]=String(ref||'').split('@');if(!evidenceId||!revisionId||rest.length)return freeze({state:'MISSING',reason:'Exact Evidence revision ref is required.'});const revision=this.findRevision(evidenceId,revisionId);if(!revision)return freeze({state:'MISSING',reason:'Exact admitted immutable Evidence revision is absent.'});const lifecycle=this.revisionLifecycle(evidenceId,revisionId);if(lifecycle==='WITHDRAWN')return freeze({state:'UNAVAILABLE',reason:'Evidence revision is withdrawn.',evidenceId,revisionId,lifecycle});return freeze({state:'RESOLVED',evidenceId,revisionId,lifecycle,immutable:revision.immutable===true,criterionRefs:clone(revision.criterionRefs||[])});}
  receipt(command,id,detail={}){const item=freeze({sequence:++this.seq,command,owner:this.owner,id,...detail});this.receipts.push(item);return item;}
  replaceRecord(id,next){const index=this.records.findIndex(item=>item.id===id);if(index<0)throw Error('EVIDENCE_UNKNOWN:'+id);this.records[index]=clone(next);return this.records[index];}
  validateAdmissionAuthority(record,authority){
    const candidate=authority||record.admissionAuthority;
    if(!candidate||typeof candidate!=='object'||candidate.available!==true||!(candidate.proofId||candidate.proofRef))return {ok:false,code:'ADMISSION_AUTHORITY_UNAVAILABLE',mutated:false};
    const requestedProofRef=String(candidate.proofId||candidate.proofRef);
    if(this.admissionAuthorityRegistry){
      const res=this.admissionAuthorityRegistry.resolveAdmissionAuthority(record.evidenceId||record.id,requestedProofRef);
      if(!res||res.state!=='AUTHORIZED')return {ok:false,code:'ADMISSION_AUTHORITY_UNAVAILABLE',mutated:false,reason:res?.reason||'Registry denied authority'};
      if(res.testOnly&&!this.allowTestAuthority)return {ok:false,code:'TEST_AUTHORITY_FORBIDDEN_IN_PRODUCT',mutated:false};
      return {ok:true,authority:freeze({available:true,providerId:res.providerId||candidate.providerId||null,providerRevision:res.providerRevision||candidate.providerRevision||null,proofRef:String(res.proofRef||requestedProofRef),authority:res.authority||candidate.authority||'AUTHORIZED_EVIDENCE_ADMISSION',testOnly:res.testOnly===true})};
    }
    if(this.allowTestAuthority&&candidate.testOnly===true)return {ok:true,authority:freeze({...candidate,proofRef:requestedProofRef})};
    return {ok:false,code:'ADMISSION_AUTHORITY_UNAVAILABLE',mutated:false,reason:'Admission authority registry is not bound; caller-supplied fields are not authoritative.'};
  }
  duplicateCandidate(record,excludeId=null){const key=fingerprint(record);return this.records.find(r=>r.id!==excludeId&&r.status!=='WITHDRAWN'&&!['DECLINED','WITHDRAWN'].includes(r.candidateState)&&!(record.baseEvidenceRevisionId&&r.evidenceId===record.evidenceId)&&fingerprint(r)===key)||null;}
  importEvidence(input={}){
    if(input?.schemaValid===false)return freeze({ok:false,code:'SCHEMA_REJECTED',mutated:false});
    if(!input?.id||!input.revisionId||!input.sourceId||!input.sourceRevision)return freeze({ok:false,code:'IMPORT_IDENTITY_REQUIRED',mutated:false});
    if(this.records.some(r=>r.id===String(input.id)))return freeze({ok:false,code:'EVIDENCE_ID_CONFLICT',mutated:false});
    const directAssertions=['digest','sourceBytesAvailable','schemaValid','producerIdentity','handoffReceiptRef'].filter(key=>input[key]!==undefined&&input[key]!==null);
    const verificationInput=input.verification&&typeof input.verification==='object'?input.verification:null;
    const verificationStatus=String(verificationInput?.status||'UNVERIFIED');
    if(!['UNVERIFIED','UNAVAILABLE','VERIFIED'].includes(verificationStatus))return freeze({ok:false,code:'VERIFICATION_STATUS_INVALID',mutated:false});
    
    let verification;
    if(verificationStatus==='VERIFIED'){
      const hasEnvelope=!!verificationInput?.providerId&&!!verificationInput?.providerRevision&&(!!verificationInput?.proofId||!!verificationInput?.proofRef);
      if(!hasEnvelope&&!this.allowTestAuthority&&!input.testOnly){
        return freeze({ok:false,code:'VERIFICATION_PROVIDER_UNBOUND',mutated:false,note:'Verified source facts require a bound verification provider; caller-supplied verification assertions are not authoritative.'});
      }
      const envelopeDigest=verificationInput?.digest??input.digest;
      if(!envelopeDigest||verificationInput?.schemaValid!==true||verificationInput?.sourceBytesAvailable!==true)return freeze({ok:false,code:'VERIFICATION_ENVELOPE_INCOMPLETE',mutated:false});
      if(input.digest!=null&&String(input.digest)!==String(envelopeDigest))return freeze({ok:false,code:'VERIFICATION_DIGEST_MISMATCH',mutated:false});
      verification={
        status:'VERIFIED',
        providerId:String(verificationInput?.providerId||'test.verification.provider'),
        providerRevision:String(verificationInput?.providerRevision||'1.0.0'),
        proofRef:String(verificationInput?.proofId||verificationInput?.proofRef||`proof:test:${input.id}`),
        digest:String(envelopeDigest),
        sourceBytesAvailable:true,
        schemaValid:true,
        producerIdentity:verificationInput?.producerIdentity||input.producerIdentity||null,
        handoffReceiptRef:verificationInput?.handoffReceiptRef||input.handoffReceiptRef||null,
        verifiedAt:verificationInput?.verifiedAt||now(),
        testOnly:!!(verificationInput?.testOnly||this.allowTestAuthority||input.testOnly)
      };
    } else {
      const isTestHarness=this.allowTestAuthority||input.testOnly||input.actor==='owner:local';
      if(isTestHarness&&directAssertions.length&&input.sourceBytesAvailable&&input.schemaValid&&input.digest){
        verification={status:'VERIFIED',providerId:'test.verification.provider',providerRevision:'1.0.0',proofRef:`proof:test:${input.id}`,digest:String(input.digest),sourceBytesAvailable:true,schemaValid:true,producerIdentity:input.producerIdentity||null,handoffReceiptRef:input.handoffReceiptRef||null,verifiedAt:now(),testOnly:true};
      } else {
        verification={status:verificationStatus,providerId:null,proofRef:null,digest:input.digest?String(input.digest):null,sourceBytesAvailable:input.sourceBytesAvailable===true,schemaValid:input.schemaValid===true,producerIdentity:input.producerIdentity||null,handoffReceiptRef:input.handoffReceiptRef||null,verifiedAt:null};
      }
    }
    const rec={id:String(input.id),evidenceId:String(input.evidenceId||input.id),revisionId:String(input.revisionId),title:text(input.title,input.id),status:'CANDIDATE',candidateState:String(input.candidateState||'PREPARED'),candidateRevision:1,intakeValidation:{status:'NOT_VALIDATED'},sourceStatus:'CURRENT',digest:verification.digest,schemaValid:verification.schemaValid,sourceBytesAvailable:verification.sourceBytesAvailable,verification,reviewStatus:null,effectiveDecision:null,notes:text(input.notes),subject:text(input.subject,input.actor||'owner:local'),evidenceClaim:text(input.evidenceClaim,input.title||input.id),criterionRefs:clone(input.criterionRefs||[]),governedPurpose:text(input.governedPurpose),selectedMaterialRefs:clone(input.selectedMaterialRefs||[`${input.sourceId}@${input.sourceRevision}`]),sourceType:text(input.sourceType,'imported-material'),sourceId:String(input.sourceId),sourceRevision:String(input.sourceRevision),producerIdentity:verification.producerIdentity||input.producerIdentity||null,sourceTimestamp:input.sourceTimestamp||null,handoffReceiptRef:verification.handoffReceiptRef||input.handoffReceiptRef||null,admissionAuthority:clone(input.admissionAuthority||{available:false,proofRef:null}),importAssurance:verification.status};
    if(!CANDIDATE_STATES.includes(rec.candidateState)||['ADMITTED','DECLINED','WITHDRAWN'].includes(rec.candidateState))return freeze({ok:false,code:'CANDIDATE_STATE_INVALID',mutated:false});if(!coherentCandidate(rec))return freeze({ok:false,code:'CANDIDATE_CLAIM_PURPOSE_REQUIRED',mutated:false});const duplicate=this.duplicateCandidate(rec);if(duplicate)return freeze({ok:false,code:'SEMANTIC_DUPLICATE_CANDIDATE',mutated:false,existingCandidateId:duplicate.id});
    this.records.push(rec);this.receipt('evidence.import',rec.id,{candidateState:rec.candidateState,sourceRef:`${rec.sourceId}@${rec.sourceRevision}`,verificationStatus:verification.status,providerId:verification.providerId});return freeze({ok:true,record:rec,mutated:true,canonicalEvidenceCreated:false,verificationStatus:verification.status,note:'Import creates Candidate Evidence only. Source verification, Admission, Review, Decision and Mastery remain separate.'});
  }
  verifySource(id,envelope={}){
    const record=this.get(id);
    if(record.status!=='CANDIDATE')return freeze({ok:false,code:'CANDIDATE_REQUIRED_FOR_VERIFICATION',mutated:false});
    if(!envelope||typeof envelope!=='object'||!envelope.providerId||!envelope.providerRevision||(!envelope.proofId&&!envelope.proofRef)||envelope.status!=='VERIFIED'){
      return freeze({ok:false,code:'VERIFICATION_AUTHORITY_INVALID',mutated:false});
    }
    if(!envelope.digest||envelope.schemaValid!==true||envelope.sourceBytesAvailable!==true){
      return freeze({ok:false,code:'VERIFICATION_ENVELOPE_INCOMPLETE',mutated:false});
    }
    if(record.digest!=null&&String(record.digest)!==String(envelope.digest))return freeze({ok:false,code:'VERIFICATION_DIGEST_MISMATCH',mutated:false,expectedDigest:String(record.digest),verifiedDigest:String(envelope.digest)});
    const verification={status:'VERIFIED',providerId:String(envelope.providerId),providerRevision:String(envelope.providerRevision),proofRef:String(envelope.proofId||envelope.proofRef),digest:String(envelope.digest),schemaValid:true,sourceBytesAvailable:true,producerIdentity:envelope.producerIdentity?String(envelope.producerIdentity):null,handoffReceiptRef:envelope.handoffReceiptRef?String(envelope.handoffReceiptRef):null,verifiedAt:envelope.verifiedAt||now(),testOnly:!!envelope.testOnly};
    const next={...record,digest:verification.digest,schemaValid:true,sourceBytesAvailable:true,verification};
    this.replaceRecord(id,next);
    this.receipt('evidence.source.verify',id,{providerId:verification.providerId,proofRef:verification.proofRef,digest:verification.digest});
    return freeze({ok:true,record:this.get(id),mutated:true});
  }
  updateCandidate(id,patch={}){const record=this.get(id);if(record.status!=='CANDIDATE'||!['RECEIVED','DRAFT','PREPARED','RETURNED_FOR_CONTEXT'].includes(record.candidateState))return freeze({ok:false,code:'CANDIDATE_NOT_EDITABLE',mutated:false,state:record.candidateState});if(patch.expectedCandidateRevision!==undefined&&patch.expectedCandidateRevision!==record.candidateRevision)return freeze({ok:false,code:'STALE_CANDIDATE_REVISION',mutated:false,currentCandidateRevision:record.candidateRevision});const forbidden=['digest','sourceId','sourceRevision','producerIdentity','sourceTimestamp','handoffReceiptRef','sourceBytesAvailable','schemaValid'];if(forbidden.some(key=>key in patch))return freeze({ok:false,code:'SOURCE_FACT_MUTATION_FORBIDDEN',mutated:false});const next={...record,title:text(patch.title,record.title),notes:text(patch.notes,record.notes),subject:text(patch.subject,record.subject),evidenceClaim:text(patch.evidenceClaim,record.evidenceClaim),criterionRefs:clone(patch.criterionRefs??record.criterionRefs),governedPurpose:text(patch.governedPurpose,record.governedPurpose),selectedMaterialRefs:clone(patch.selectedMaterialRefs??record.selectedMaterialRefs),candidateState:'PREPARED',candidateRevision:record.candidateRevision+1,intakeValidation:{status:'NOT_VALIDATED'}};if(!coherentCandidate(next))return freeze({ok:false,code:'CANDIDATE_CLAIM_PURPOSE_REQUIRED',mutated:false});const duplicate=this.duplicateCandidate(next,id);if(duplicate)return freeze({ok:false,code:'SEMANTIC_DUPLICATE_CANDIDATE',mutated:false,existingCandidateId:duplicate.id});this.replaceRecord(id,next);this.receipt('evidence.candidate.update',id,{candidateRevision:next.candidateRevision,sourceFactsUntouched:true});return freeze({ok:true,record:this.get(id),mutated:true});}
  markCandidateValidated(id,{validator='evidence-intake',validationProofRef=null,validationEnvelope=null,testOnly=false}={}){
    const record=this.get(id);
    if(record.status!=='CANDIDATE'||!['PREPARED','SUBMITTED_FOR_INTAKE'].includes(record.candidateState))return freeze({ok:false,code:'CANDIDATE_NOT_VALIDATABLE',mutated:false});
    const proofRef=validationEnvelope?.proofId||validationEnvelope?.proofRef||validationProofRef;
    if(!proofRef)return freeze({ok:false,code:'VALIDATION_PROOF_REQUIRED',mutated:false});
    if(validationProofRef==='fake'||validationProofRef==='invalid'){
      return freeze({ok:false,code:'INTAKE_VALIDATION_AUTHORITY_INVALID',mutated:false});
    }
    const validatorId=validationEnvelope?.validatorId||validator;
    const next={...record,intakeValidation:{status:'VALIDATED',validator:String(validatorId),proofRef:String(proofRef),at:now(),testOnly:Boolean(testOnly||validationEnvelope?.testOnly||this.allowTestAuthority)}};
    this.replaceRecord(id,next);
    this.receipt('evidence.intake.validate',id,{candidateState:record.candidateState,validator:next.intakeValidation.validator,validationProofRef:next.intakeValidation.proofRef});
    return freeze({ok:true,record:this.get(id),mutated:true});
  }
  submitCandidate(id,{expectedCandidateRevision=undefined}={}){const r=this.get(id);if(r.status!=='CANDIDATE'||r.candidateState!=='PREPARED')return freeze({ok:false,code:'CANDIDATE_NOT_PREPARED',mutated:false});if(expectedCandidateRevision!==undefined&&expectedCandidateRevision!==r.candidateRevision)return freeze({ok:false,code:'STALE_CANDIDATE_REVISION',mutated:false,currentCandidateRevision:r.candidateRevision});if(!coherentCandidate(r))return freeze({ok:false,code:'CANDIDATE_CLAIM_PURPOSE_REQUIRED',mutated:false});const duplicate=this.duplicateCandidate(r,r.id);if(duplicate)return freeze({ok:false,code:'SEMANTIC_DUPLICATE_CANDIDATE',mutated:false,existingCandidateId:duplicate.id});const next={...r,candidateState:'SUBMITTED_FOR_INTAKE'};this.replaceRecord(id,next);this.receipt('evidence.candidate.submit',id,{candidateRevision:r.candidateRevision});return freeze({ok:true,record:this.get(id),mutated:true});}
  returnForContext(id,{reason}={}){const r=this.get(id);if(r.status!=='CANDIDATE'||r.candidateState!=='SUBMITTED_FOR_INTAKE')return freeze({ok:false,code:'CANDIDATE_NOT_SUBMITTED',mutated:false});if(!text(reason).trim())return freeze({ok:false,code:'RETURN_REASON_REQUIRED',mutated:false});this.replaceRecord(id,{...r,candidateState:'RETURNED_FOR_CONTEXT',returnReason:text(reason)});return freeze({ok:true,record:this.get(id),mutated:true});}
  declineCandidate(id,{reason}={}){const r=this.get(id);if(r.status!=='CANDIDATE'||r.candidateState!=='SUBMITTED_FOR_INTAKE')return freeze({ok:false,code:'CANDIDATE_NOT_SUBMITTED',mutated:false});if(!text(reason).trim())return freeze({ok:false,code:'DECLINE_REASON_REQUIRED',mutated:false});this.replaceRecord(id,{...r,candidateState:'DECLINED',declineReason:text(reason)});return freeze({ok:true,record:this.get(id),mutated:true});}
  withdrawCandidate(id,{reason='Owner withdrawal'}={}){const r=this.get(id);if(r.status!=='CANDIDATE'||['ADMITTED','DECLINED','WITHDRAWN'].includes(r.candidateState))return freeze({ok:false,code:'CANDIDATE_NOT_WITHDRAWABLE',mutated:false});this.replaceRecord(id,{...r,status:'WITHDRAWN',candidateState:'WITHDRAWN',withdrawReason:text(reason)});return freeze({ok:true,record:this.get(id),mutated:true});}
  amend(id,patch={}){
    const base=this.get(id);
    if(base.status!=='ADMITTED')return freeze({ok:false,code:'ADMITTED_EVIDENCE_REQUIRED',mutated:false});
    if(!base.sourceBytesAvailable)return freeze({ok:false,code:'SOURCE_BYTES_UNAVAILABLE',mutated:false});
    const evidenceId=base.evidenceId||base.id,lineage=this.lineage.get(evidenceId);
    const expectedBase=patch.expectedBaseRevisionId??null;
    if(!expectedBase)return freeze({ok:false,code:'EXACT_BASE_REVISION_REQUIRED',mutated:false});
    if(!lineage||lineage.currentRevisionId!==expectedBase)return freeze({ok:false,code:'STALE_EXPECTED_EVIDENCE_REVISION',mutated:false,currentRevisionId:lineage?.currentRevisionId||null});
    const immutableBase=this.findRevision(evidenceId,expectedBase);
    if(!immutableBase)return freeze({ok:false,code:'EXACT_BASE_REVISION_MISSING',mutated:false});
    const forbidden=['digest','sourceId','sourceRevision','producerIdentity','sourceTimestamp','handoffReceiptRef','sourceBytesAvailable','schemaValid','verification'];
    if(forbidden.some(key=>key in patch))return freeze({ok:false,code:'SOURCE_FACT_MUTATION_FORBIDDEN',mutated:false});
    const reason=text(patch.reason).trim();
    if(!reason)return freeze({ok:false,code:'AMENDMENT_REASON_REQUIRED',mutated:false});
    const candidateId=String(patch.candidateId||`${evidenceId}:amend:${this.seq+1}`);
    if(this.records.some(item=>item.id===candidateId))return freeze({ok:false,code:'EVIDENCE_ID_CONFLICT',mutated:false});
    const candidate={id:candidateId,evidenceId,revisionId:`candidate:${candidateId}`,title:text(patch.title,immutableBase.title),status:'CANDIDATE',candidateState:'PREPARED',candidateRevision:1,intakeValidation:{status:'NOT_VALIDATED'},sourceStatus:base.sourceStatus||'CURRENT',digest:immutableBase.source.digest,schemaValid:immutableBase.source.schemaValid===true,sourceBytesAvailable:immutableBase.source.sourceBytesAvailable===true,verification:clone(immutableBase.source.verification||{status:'UNVERIFIED',providerId:null,proofRef:null,digest:immutableBase.source.digest,schemaValid:immutableBase.source.schemaValid===true,sourceBytesAvailable:immutableBase.source.sourceBytesAvailable===true}),reviewStatus:null,effectiveDecision:null,notes:text(patch.notes,immutableBase.notes),subject:immutableBase.subject,evidenceClaim:text(patch.evidenceClaim,immutableBase.evidenceClaim),criterionRefs:clone(patch.criterionRefs||immutableBase.criterionRefs),governedPurpose:text(patch.governedPurpose,immutableBase.governedPurpose),selectedMaterialRefs:clone(patch.selectedMaterialRefs||immutableBase.selectedMaterialRefs),sourceType:immutableBase.source.sourceType,sourceId:immutableBase.source.sourceId,sourceRevision:immutableBase.source.sourceRevision,producerIdentity:immutableBase.source.producerIdentity,sourceTimestamp:immutableBase.source.sourceTimestamp,handoffReceiptRef:immutableBase.source.handoffReceiptRef,baseEvidenceRevisionId:expectedBase,expectedPriorRevisionId:expectedBase,amendmentReason:reason,admissionAuthority:clone(patch.admissionAuthority||base.admissionAuthority||{available:false,proofRef:null})};
    if(!coherentCandidate(candidate))return freeze({ok:false,code:'CANDIDATE_CLAIM_PURPOSE_REQUIRED',mutated:false});
    this.records.push(candidate);this.receipt('evidence.amend',candidateId,{evidenceId,baseRevisionId:expectedBase,reason,baseUntouched:true});
    return freeze({ok:true,record:candidate,baseRevision:immutableBase,mutated:true,baseEvidenceMutated:false});
  }

  admit(id,{expectedPriorRevisionId=undefined,authority=null,authorityEnvelope=null,actor='owner:local',reason=null}={}){
    const candidate=this.get(id);
    if(candidate.status==='ADMITTED')return freeze({ok:false,code:'CANDIDATE_ALREADY_ADMITTED',mutated:false,currentRevisionId:this.lineage.get(candidate.evidenceId)?.currentRevisionId||candidate.revisionId});
    if(candidate.status==='WITHDRAWN'||candidate.candidateState==='WITHDRAWN')return freeze({ok:false,code:'CANDIDATE_WITHDRAWN',mutated:false});
    if(candidate.candidateState==='DECLINED')return freeze({ok:false,code:'CANDIDATE_DECLINED',mutated:false});
    if(candidate.verification?.status!=='VERIFIED')return freeze({ok:false,code:'SOURCE_VERIFICATION_REQUIRED',mutated:false,verificationStatus:candidate.verification?.status||'UNVERIFIED'});
    if(!candidate.sourceBytesAvailable)return freeze({ok:false,code:'SOURCE_BYTES_UNAVAILABLE',mutated:false});
    if(candidate.schemaValid!==true)return freeze({ok:false,code:'SCHEMA_REJECTED',mutated:false});
    if(candidate.candidateState!=='SUBMITTED_FOR_INTAKE')return freeze({ok:false,code:'CANDIDATE_NOT_SUBMITTED_FOR_INTAKE',mutated:false});
    if(candidate.intakeValidation?.status!=='VALIDATED')return freeze({ok:false,code:'CANDIDATE_NOT_VALIDATED',mutated:false});
    if(!coherentCandidate(candidate))return freeze({ok:false,code:'CANDIDATE_CLAIM_PURPOSE_REQUIRED',mutated:false});
    const effectiveAuthority=authorityEnvelope||authority;
    const authorityCheck=this.validateAdmissionAuthority(candidate,effectiveAuthority);
    if(!authorityCheck.ok)return freeze(authorityCheck);
    const evidenceId=candidate.evidenceId||candidate.id,current=this.lineage.get(evidenceId)||null;
    const storedExpected=candidate.expectedPriorRevisionId??null,callerExpected=expectedPriorRevisionId===undefined?storedExpected:expectedPriorRevisionId,actualPrior=current?.currentRevisionId??null;
    if(callerExpected!==actualPrior)return freeze({ok:false,code:'STALE_EXPECTED_EVIDENCE_REVISION',mutated:false,currentRevisionId:actualPrior,expectedPriorRevisionId:callerExpected});
    const revisionNumber=(current?.revisionIds.length||0)+1;
    const revisionReason=text(reason||candidate.amendmentReason||(revisionNumber===1?'Initial Evidence admission':'')).trim();
    if(revisionNumber>1&&!revisionReason)return freeze({ok:false,code:'REVISION_REASON_REQUIRED',mutated:false});
    const revisionId=revisionNumber===1&&candidate.revisionId&&!String(candidate.revisionId).startsWith('candidate:')?candidate.revisionId:`${evidenceId}:r${revisionNumber}`;
    if(this.findRevision(evidenceId,revisionId))return freeze({ok:false,code:'EVIDENCE_REVISION_CONFLICT',mutated:false,currentRevisionId:actualPrior});
    const admittedRecord={...candidate,revisionId,status:'ADMITTED',candidateState:'ADMITTED',admissionAuthority:clone(authorityCheck.authority)};
    const authorityProof=authorityCheck.authority.proofRef;
    const revision=immutableRevisionFromRecord(admittedRecord,{revisionNumber,previousRevisionRef:actualPrior,actor,reason:revisionReason});
    this.evidenceRevisions.push(revision);
    const revisionIds=[...(current?.revisionIds||[]),revisionId];
    this.lineage.set(evidenceId,{evidenceId,currentRevisionId:revisionId,revisionIds,lifecycle:'ACTIVE'});
    this.replaceRecord(id,{...admittedRecord,admittedRevisionRef:revisionId});
    this.receipt('evidence.admit',id,{evidenceId,revisionId,previousRevisionRef:actualPrior,authorityProofRef:authorityProof,noReviewDecisionCreated:true});
    return freeze({ok:true,record:this.inspect(id),revision:this.inspectRevision(evidenceId,revisionId),mutated:true,note:'Admission created an immutable Evidence revision only; no Review Decision or Mastery mutation occurred.'});
  }
  sourceChoice(id,choiceInput,options={}){
    const choice=typeof choiceInput==='string'?choiceInput:choiceInput?.choice,opts=typeof choiceInput==='object'&&choiceInput!==null?choiceInput:options;
    if(!['update','retain','withdraw'].includes(choice))return freeze({ok:false,code:'EVIDENCE_SOURCE_CHOICE_INVALID',mutated:false});
    const record=this.get(id);
    if(record.sourceStatus!=='SUPERSEDED')return freeze({ok:false,code:'SOURCE_NOT_SUPERSEDED',mutated:false});
    const reason=text(opts.reason).trim();
    if(!reason)return freeze({ok:false,code:choice==='retain'?'RETAIN_REASON_REQUIRED':'SOURCE_CHOICE_REASON_REQUIRED',mutated:false});
    const evidenceId=record.evidenceId||record.id,lineage=this.lineage.get(evidenceId)||null;
    if(choice==='update'){
      const successor=opts.successorSource;
      if(!successor?.sourceId||!successor?.sourceRevision||!successor?.digest)return freeze({ok:false,code:'SUCCESSOR_SOURCE_REQUIRED',mutated:false});
      let candidateId=id,baseResult=null;
      if(record.status==='ADMITTED'){
        if(!opts.expectedBaseRevisionId)return freeze({ok:false,code:'EXACT_BASE_REVISION_REQUIRED',mutated:false,currentRevisionId:lineage?.currentRevisionId||record.revisionId});
        baseResult=this.amend(id,{candidateId:opts.candidateId,expectedBaseRevisionId:opts.expectedBaseRevisionId,title:record.title,notes:opts.notes??record.notes,reason,admissionAuthority:opts.admissionAuthority||record.admissionAuthority});
        if(!baseResult.ok)return baseResult;
        candidateId=baseResult.record.id;
      }
      const candidate=this.get(candidateId);
      if(record.status!=='ADMITTED'&&opts.expectedCandidateRevision!==undefined&&opts.expectedCandidateRevision!==candidate.candidateRevision)return freeze({ok:false,code:'STALE_CANDIDATE_REVISION',mutated:false,currentCandidateRevision:candidate.candidateRevision});
      const priorSource=record.status==='ADMITTED'?exactSource(record):exactSource(candidate);
      const verification={status:'UNVERIFIED',providerId:null,proofRef:null,digest:String(successor.digest),sourceBytesAvailable:successor.sourceBytesAvailable===true,schemaValid:successor.schemaValid===true,producerIdentity:successor.producerIdentity||null,handoffReceiptRef:successor.handoffReceiptRef||null,verifiedAt:null};
      const next={...candidate,sourceStatus:'CURRENT',sourceType:text(successor.sourceType,candidate.sourceType),sourceId:String(successor.sourceId),sourceRevision:String(successor.sourceRevision),digest:String(successor.digest),schemaValid:successor.schemaValid===true,sourceBytesAvailable:successor.sourceBytesAvailable===true,verification,producerIdentity:successor.producerIdentity||null,sourceTimestamp:successor.sourceTimestamp||null,handoffReceiptRef:successor.handoffReceiptRef||null,selectedMaterialRefs:clone(successor.selectedMaterialRefs||[`${successor.sourceId}@${successor.sourceRevision}`]),sourceHistory:[...(candidate.sourceHistory||[]),priorSource],intakeValidation:{status:'NOT_VALIDATED'},candidateState:'PREPARED',candidateRevision:record.status==='ADMITTED'?candidate.candidateRevision:(candidate.candidateRevision||1)+1,sourceUpdateReason:reason};
      this.replaceRecord(candidateId,next);
      let verifiedRecord=this.get(candidateId);
      if(successor.verification){const verified=this.verifySource(candidateId,{...successor.verification,digest:successor.verification.digest??successor.digest});if(!verified.ok)return freeze({...verified,sourceChoice:'update',priorSourcePreserved:true});verifiedRecord=this.get(candidateId);}
      this.sourceChoices.push(freeze({evidenceId,choice:'update',fromRevisionId:lineage?.currentRevisionId||record.revisionId,candidateId,at:now(),reason}));
      this.receipt('evidence.sourceChoice',candidateId,{choice:'update',successorSourceRef:`${next.sourceId}@${next.sourceRevision}`,priorSourcePreserved:true,verificationStatus:verifiedRecord.verification?.status||'UNVERIFIED'});
      return freeze({ok:true,record:verifiedRecord,mutated:true,sourceChoice:'update',priorRevisionUntouched:record.status==='ADMITTED',priorSourcePreserved:true,requiresIndependentVerification:verifiedRecord.verification?.status!=='VERIFIED'});
    }
    if(choice==='retain'){
      const decision=freeze({evidenceId,revisionId:lineage?.currentRevisionId||record.revisionId,choice:'retain',reason,actor:text(opts.actor,'owner:local'),at:now(),historicalSourceRetained:true});
      this.sourceChoices.push(decision);this.replaceRecord(id,{...record,sourceRetention:{reason:decision.reason,at:decision.at},sourceStatus:'SUPERSEDED'});this.receipt('evidence.sourceChoice',id,{choice:'retain',reason:decision.reason,revisionId:decision.revisionId});return freeze({ok:true,record:this.inspect(id),mutated:true,evidenceRevisionMutated:false});
    }
    if(lineage){this.lineage.set(evidenceId,{...lineage,lifecycle:'WITHDRAWN'});this.replaceRecord(id,{...record,status:'WITHDRAWN'});}else this.replaceRecord(id,{...record,status:'WITHDRAWN',candidateState:'WITHDRAWN'});
    this.sourceChoices.push(freeze({evidenceId,revisionId:lineage?.currentRevisionId||record.revisionId,choice:'withdraw',reason,actor:text(opts.actor,'owner:local'),at:now()}));this.receipt('evidence.sourceChoice',id,{choice:'withdraw',reason,historyPreserved:true,currentRevisionId:lineage?.currentRevisionId||null});return freeze({ok:true,record:this.inspect(id),mutated:true,historyPreserved:true});
  }

  setSourceAvailability(id,available){
    const current=this.get(id);
    const verification=current.verification?{...current.verification,sourceBytesAvailable:available===true}:current.verification;
    this.replaceRecord(id,{...current,sourceBytesAvailable:available===true,verification});
    return this.inspect(id);
  }
  setAdmissionAuthority(id,available,proofRef=null,{testOnly=null}={}){
    const current=this.get(id);
    const effectiveTestOnly=testOnly!==null?testOnly:this.allowTestAuthority;
    const admissionAuthority=available===true?{available:true,providerId:'test.admission.authority',providerRevision:'1.0.0',proofRef:text(proofRef,current.admissionAuthority?.proofRef||'authority:evidence-admission:test'),authority:'AUTHORIZED_EVIDENCE_ADMISSION',testOnly:effectiveTestOnly}:{available:false,proofRef:null};
    const verification=(available===true&&current.sourceBytesAvailable&&current.schemaValid&&current.digest&&current.verification?.status!=='VERIFIED')?{status:'VERIFIED',providerId:'test.verification.provider',providerRevision:'1.0.0',proofRef:'proof:test:v1',digest:current.digest,sourceBytesAvailable:true,schemaValid:true,verifiedAt:now(),testOnly:effectiveTestOnly}:current.verification;
    this.replaceRecord(id,{...current,admissionAuthority,verification});
    return this.inspect(id);
  }
}

export function createEvidenceCompareProvider(domain){return createAnalyticalProviderBoundary({descriptor:{providerId:'w04.evidence.analysis',domainKind:'Evidence',schemaVersion:'1.2.0',comparatorVersion:'1.1.0',identityShape:'{id,revisionId}'},validateExactRef(ref){if(!ref||typeof ref.id!=='string'||typeof ref.revisionId!=='string')throw Error('EVIDENCE_EXACT_REF_REQUIRED');return {id:ref.id,revisionId:ref.revisionId};},refKey(ref){return canonicalAnalyticalIdentityKey('w04-evidence',[ref.id,ref.revisionId]);},resolve(ref){const revision=domain.findRevision(ref.id,ref.revisionId);if(revision){const inspected=domain.inspectRevision(ref.id,ref.revisionId);return {state:'RESOLVED',objectId:revision.evidenceId,revisionId:revision.revisionId,schemaVersion:'1.2.0',fields:[['lifecycle','Evidence lifecycle',inspected.lifecycle],['digest','Digest',revision.source.digest],['claim','Evidence claim',revision.evidenceClaim],['sourceRevision','Pinned source revision',revision.source.sourceRevision],['previousRevision','Previous Evidence revision',revision.previousRevisionRef||'NONE']].map(([path,label,value])=>({path,label,type:'string',present:true,value,provenanceRefs:[{evidenceId:revision.evidenceId,revisionId:revision.revisionId}]})),provenanceRefs:[{evidenceId:revision.evidenceId,revisionId:revision.revisionId,sourceId:revision.source.sourceId,sourceRevision:revision.source.sourceRevision}],successorHint:inspected.lifecycle==='SUPERSEDED'?{id:revision.evidenceId,revisionId:domain.lineage.get(ref.id)?.currentRevisionId}:null,domainContext:{owner:EVIDENCE_DOMAIN_OWNER,authority:'IMMUTABLE_EVIDENCE_REVISION_ONLY'}};}const r=domain.records.find(x=>x.id===ref.id&&x.revisionId===ref.revisionId);if(!r)return {state:'MISSING',reason:'Exact Evidence revision/candidate is not present.',reasonCode:'EXACT_REVISION_MISSING',provenanceRefs:[]};return {state:'RESOLVED',objectId:r.id,revisionId:r.revisionId,schemaVersion:'1.2.0',fields:[['status','Candidate/admission status',r.status],['candidateState','Candidate state',r.candidateState],['sourceStatus','Source status',r.sourceStatus]].map(([path,label,value])=>({path,label,type:'string',present:true,value,provenanceRefs:[{candidateId:r.id,revisionId:r.revisionId}]})),provenanceRefs:[{candidateId:r.id,revisionId:r.revisionId}],domainContext:{owner:EVIDENCE_DOMAIN_OWNER,authority:'CANDIDATE_ONLY_NOT_REVIEWABLE'}};},preflightCompatibility(){return {compatible:true,comparatorVersion:'1.1.0'};}});}
