import test from 'node:test';
import assert from 'node:assert/strict';
import {AuditProvenanceInteractionCore,AUDIT_PROVENANCE_PRESENTATION_CONTRACT} from '../../../foundation/audit/provenance.js';

const descriptor=()=>({providerId:'s06.provider',domainKind:'ArbitraryDomainTrace',schemaVersion:'1',authorityRef:'domain-owned'});

test('audit/provenance carries provider states without becoming W05 AuditEvent authority',()=>{
  const provider={descriptor,read:()=>({state:'CONFLICT',identity:{id:'obj-1',label:'Object'},entries:[{id:'e1',label:'Earlier'},{id:'e2',label:'Later'}],message:'Provider reports a conflict.'})};
  const core=new AuditProvenanceInteractionCore(provider);const view=core.refresh();
  assert.ok(AUDIT_PROVENANCE_PRESENTATION_CONTRACT.states.includes('UNAVAILABLE'));
  assert.ok(AUDIT_PROVENANCE_PRESENTATION_CONTRACT.states.includes('CONFLICT'));
  assert.equal(view.state,'CONFLICT');
  assert.equal(core.relativeId('missing',1),'e1');
  assert.equal(core.relativeId('missing',-1),'e2');
  const receipt=core.boundaryReceipt();
  assert.equal(receipt.mutationApiExposed,false);
  assert.ok(receipt.doesNotOwn.includes('W05_AUDIT_EVENT_DOMAIN'));
  assert.ok(receipt.doesNotOwn.includes('FORMAL_REVIEW_AUTHORITY'));
});

test('audit/provenance falsifies unavailable state without provider explanation',()=>{
  const provider={descriptor,read:()=>({state:'UNAVAILABLE',identity:{id:'obj-1',label:'Object'},entries:[]})};
  const core=new AuditProvenanceInteractionCore(provider);const view=core.refresh();
  assert.equal(view.state,'ERROR');
  assert.match(view.truth.providerErrorCode,/AUDIT_PROVENANCE_UNAVAILABLE_MESSAGE_REQUIRED/);
});
