import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuditConsumerAdapter} from '../../../adapters/audit.js';
import {createValidationConsumerAdapter} from '../../../adapters/validation.js';

test('existing audit adapter remains compatible without granting W05 AuditEvent authority',()=>{
  const bus={sequence:1,receipts:[{sequence:1,id:'demo.command',owner:'DomainOwner',route:'demo',policyTag:'candidate',commandOwner:'DomainOwner',availabilityOwner:'DomainOwner'}]};
  const adapter=createAuditConsumerAdapter({commandBus:bus});
  const snapshot=adapter.reviewSnapshot();
  assert.equal(adapter.consumer.realConsumerAccepted,false);
  assert.equal(snapshot.familyStatus,'CONCEPT_CONTRACT_ONLY');
  assert.equal(snapshot.adapterVocabularyMode,'LEGACY_ADAPTER_VOCABULARY_TRANSPORT_ONLY');
  assert.equal(snapshot.sections.length,2);
  assert.equal(adapter.provenance.boundaryReceipt().doesNotOwn.includes('W05_AUDIT_EVENT_DOMAIN'),true);
});

test('existing validation adapter keeps TechnicalFinding outside formal review authority',async()=>{
  const adapter=createValidationConsumerAdapter();
  await adapter.validate('{"artifactRef":"artifact-1"}');
  const snapshot=adapter.reviewSnapshot();
  assert.equal(adapter.consumer.realConsumerAccepted,false);
  assert.equal(snapshot.familyStatus,'CONCEPT_CONTRACT_ONLY');
  assert.equal(adapter.truth().technicalFindingConvertedToFormalReviewFinding,false);
  assert.equal(snapshot.sections[1].entries.length,0);
});
