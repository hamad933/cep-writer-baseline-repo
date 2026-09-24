import test from 'node:test';
import assert from 'node:assert/strict';
import {createReviewDecisionPresentationSnapshot,REVIEW_DECISION_FAMILY_STATUS,REVIEW_DECISION_PRESENTATION_CONTRACT} from '../../../foundation/review/decision.js';
import {assertCandidateReviewAuditConsumer,assertGenuineReviewAuditConsumer,REVIEW_AUDIT_FAMILY_CONTRACT} from '../../../foundation/review/family-admission.js';

test('canonical review/decision presentation API is neutral sections/outcomes',()=>{
  const snapshot=createReviewDecisionPresentationSnapshot({
    id:'neutral-1',title:'Neutral inspection',state:'READ_ONLY',stateLabel:'Read only',direction:'rtl',locale:'ar',
    labels:{family:'فحص مشترك',unavailable:'غير متاح'},
    sections:[{id:'inputs',label:'المدخلات',entries:[{id:'i1',label:'سجل 1',detail:'تفصيل',tone:'info'}]}],
    outcomes:[{id:'projection',label:'الإسقاط',entry:{id:'o1',label:'حالة معروضة',tone:'neutral'}}]
  });
  assert.equal(REVIEW_DECISION_FAMILY_STATUS,'CONCEPT_CONTRACT_ONLY');
  assert.equal(REVIEW_DECISION_PRESENTATION_CONTRACT.claimsRealConsumerReuse,false);
  assert.equal(REVIEW_DECISION_PRESENTATION_CONTRACT.ownsCriterionVocabulary,false);
  assert.equal(snapshot.adapterVocabularyMode,'NEUTRAL_SECTION_API');
  assert.equal(snapshot.sections[0].id,'inputs');
  assert.equal(Object.hasOwn(snapshot,'criteria'),false);
  assert.equal(Object.hasOwn(snapshot,'decision'),false);
});

test('legacy adapter vocabulary is transport-only and normalizes into neutral slots',()=>{
  const snapshot=createReviewDecisionPresentationSnapshot({
    id:'legacy-1',title:'Legacy adapter transport',state:'AVAILABLE',stateLabel:'Available',labels:{family:'Adapter',criteria:'Adapter A',findings:'Adapter B',decision:'Adapter C',supersession:'Adapter D',unavailable:'Unavailable'},
    criteria:[{id:'a',label:'Alpha'}],findings:[{id:'b',label:'Beta'}],decision:{id:'c',label:'Gamma'},supersession:null
  });
  assert.equal(snapshot.adapterVocabularyMode,'LEGACY_ADAPTER_VOCABULARY_TRANSPORT_ONLY');
  assert.deepEqual(snapshot.sections.map(s=>s.label),['Adapter A','Adapter B']);
  assert.deepEqual(snapshot.outcomes.map(s=>s.label),['Adapter C','Adapter D']);
  assert.equal(snapshot.vocabularyOwner,'DOMAIN_ADAPTER');
});

test('family admission validates candidate evidence but owns no domain surface allowlist',()=>{
  const descriptor={surface:'arbitrary-domain',routeKind:'PRODUCT',consumerKind:'GENUINE_REAL_PRODUCT',domainImplementation:'REAL_PRODUCT_COMPOSITION',proofConsumer:true,synthetic:false,fixture:false,contractOnly:false,profileUse:'READ_ONLY_EVIDENCE_NOT_PROOF'};
  const result=assertCandidateReviewAuditConsumer(descriptor);
  assert.equal(result.realConsumerAccepted,false);
  assert.equal(result.controllerAdmissionRequired,true);
  assert.equal(REVIEW_AUDIT_FAMILY_CONTRACT.authorizedSurfaces,'NOT_OWNED_BY_SHARED_FAMILY');
  assert.equal(REVIEW_AUDIT_FAMILY_CONTRACT.ownsAuditEventDomain,false);
  assert.equal(REVIEW_AUDIT_FAMILY_CONTRACT.ownsFormalReviewDecisionAuthority,false);
  assert.equal(assertGenuineReviewAuditConsumer(descriptor).realConsumerAccepted,false);
  assert.throws(()=>assertCandidateReviewAuditConsumer({...descriptor,synthetic:true}),/REVIEW_AUDIT_REAL_CONSUMER_CANDIDATE_REQUIRED/);
});
