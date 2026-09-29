import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../dist/foundation/models.js';
import {createLearnRuntimeComposition} from '../../../dist/adapters/learn.js';
import {bindLearnSurface} from '../../../dist/surfaces/learn/surface.js';
/* CKPT-B adjudication (W02) — two truth lanes, both product-faithful:
   1) UNBOUND lane: the product calls createLearnRuntimeComposition() unbound
      (main.ts, proven by post-c03/LCORR03 C5-003 "createLearnRuntimeComposition called unbound").
      CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH (dispatch-routed to W02) binds: source truth
      UNAVAILABLE_PROVIDER_UNBOUND, learn.edit and learn.practice availability both disabled.
      SemanticCommandBus.execute refuses a disabled command, so the unbound lane can never start an
      attempt — that refusal is the truth, not a defect.
   2) BOUND lane: practice -> submit -> review mechanics require a canonical learning source
      (S08_W01_W02_LIBRARY_LEARN uses the identical source shape). The source is test-supplied, so
      this lane proves the ROUTE and the mastery/progress separation only — it is not a PW-20
      real-consumer binding and is never claimed as one. */
const unbound=createLearnRuntimeComposition();
const unboundCommands=new CommandRegistry();
const unboundBinding=bindLearnSurface({commands:unboundCommands,learn:unbound.learn,structured:unbound.structured});
assert.equal(unboundBinding.owner,'LearnDomainAdapter');
assert.equal(unboundBinding.transactionOwner,'StructuredTransactionHistoryRecoveryOwner');
assert.equal(unbound.descriptor.realConsumer,false);
assert.equal(unbound.descriptor.fixtureFallback,false);
assert.equal(unbound.structured.sourceBinding.truth,'UNAVAILABLE_PROVIDER_UNBOUND');
assert.equal(unboundCommands.availability('learn.edit',{blockId:'learn-unavailable-p1',patch:{html:'x'}}).enabled,false);
assert.equal(unboundCommands.availability('learn.practice',{}).enabled,false);
const refused=unboundCommands.execute('learn.practice',{});
assert.equal(refused.ok,false);
assert.equal(refused.code,'LEARN_CANONICAL_SOURCE_UNAVAILABLE');
assert.equal(refused.masteryWrite,undefined);
assert.equal(unboundBinding.masteryWrite,false);

const source={classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'BOUND_CANONICAL_LEARNING_SOURCE',providerRef:'w02-surface-route',activity:{id:'activity-identity-01',revision:1,title:'Trust boundaries',kind:'practice',editable:true,prerequisiteState:'INCOMPLETE'},document:{id:'learn-doc-1',revision:'r1',title:'Trust boundaries',blocks:[{id:'learn-h1',type:'h2',html:'Trust boundaries'},{id:'learn-p1',type:'paragraph',html:'Explain the trust boundary.'}]}};
const composition=createLearnRuntimeComposition({source});
const learn=composition.learn,structured=composition.structured;
const commands=new CommandRegistry();
const bound=bindLearnSurface({commands,learn,structured});
assert.equal(bound.owner,'LearnDomainAdapter');
assert.equal(bound.transactionOwner,'StructuredTransactionHistoryRecoveryOwner');
assert.equal(bound.commands.join(),'learn.open,learn.edit,learn.practice,learn.review');
assert.equal(composition.descriptor.realConsumer,true);
assert.equal(composition.descriptor.fixtureFallback,false);
assert.equal(bound.fixtureClaimed,false);
const practice=commands.execute('learn.practice',{});
assert.equal(practice.masteryWrite,false);
learn.submit('Boundary crossed at the request parser.');
const review=commands.execute('learn.review',{});
assert.equal(review.masteryWrite,false);
assert.equal(review.progress.mastery,'NOT_INFERRED');
assert.equal(review.assessment.gradingProvider,'UNAVAILABLE');
assert.equal(review.formalReviewCreated,false);
assert.equal(bound.labRuntimeCreated,false);
console.log(JSON.stringify({surface:'learn',status:'PASS',cases:22,masteryWrite:false,unboundTruth:'UNAVAILABLE_PROVIDER_UNBOUND',boundRoute:'test-supplied-source-route-only'}));
