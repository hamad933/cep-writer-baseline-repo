import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../dist/foundation/models.js';
import {createLearnRuntimeComposition} from '../../../dist/adapters/learn.js';
import {bindLearnSurface} from '../../../dist/surfaces/learn/surface.js';

const seedSource=({testOnly=true,truth='ACCEPTANCE_SEED',classification='ACCEPTANCE_SEED'}={})=>({
  testOnly,
  truth,
  classification,
  providerRef:'test://learn-seed',
  journey:{id:'journey-webapp',version:'v3',title:'Web Application Security'},
  activity:{id:'act-sqli',revision:'activity-r3',title:'SQL Injection',kind:'lesson',editable:true,prerequisiteState:'SATISFIED'},
  document:{
    id:'doc-sqli',revision:'document-r3',title:'SQL Injection',tags:['Web','Injection'],
    blocks:[
      {id:'p1',type:'paragraph',html:'Understand the request boundary.'},
      {id:'p2',type:'paragraph',html:'Practice follows the learning content.'}
    ]
  }
});

let cases=0;
const check=(actual,expected,message)=>{assert.deepEqual(actual,expected,message);cases+=1;};

// Normal Product truth: no provider is bound and no fixture fallback is invented.
{
  const {learn,structured,descriptor}=createLearnRuntimeComposition();
  const commands=new CommandRegistry();
  const bound=bindLearnSurface({commands,learn,structured});
  check(learn.sourceAvailability().enabled,false,'normal unbound Learn must remain unavailable');
  check(bound.sourceAvailability,'UNAVAILABLE');
  check(descriptor.fixtureFallback,false);
  check(descriptor.explicitTestSource,false);
  check(descriptor.journeyBound,false);
  check(learn.learningProgress().attemptTruth,'SOURCE_UNAVAILABLE');
  check(learn.learningProgress().mastery,'NOT_INFERRED');
  check(bound.workbench,'LearningWorkbench');
  check(bound.practicePlacement,{placement:'GOVERNED_ACTIVITY_TOGGLE',prominent:false,firstFocus:false});
}

// A test-only source cannot mask Product truth unless the caller explicitly admits test data.
{
  const {learn,descriptor}=createLearnRuntimeComposition({source:seedSource()});
  check(learn.sourceAvailability().enabled,false);
  check(learn.source.rejectionReason,'LEARN_TEST_ONLY_SOURCE_REQUIRES_EXPLICIT_ADMISSION');
  check(descriptor.explicitTestSource,false);
}

// DS01/test-only data is explicit, bounded and never promoted to a real consumer.
const {learn,structured,descriptor}=createLearnRuntimeComposition({source:seedSource(),allowTestSource:true});
const commands=new CommandRegistry();
const bound=bindLearnSurface({commands,learn,structured});
check(learn.sourceAvailability().enabled,true);
check(descriptor.explicitTestSource,true);
check(descriptor.journeyBound,true);
check(descriptor.realConsumer,false);
check(descriptor.fixtureFallback,false);
check(structured.metadata.libraryIndependent,true);
check(structured.metadata.librarySemanticsInherited,false);
check(structured.metadata.sharedStructuredMechanics,true);
check(structured.owner,'LearnAdapter');
check(structured.transactionOwner.owner,'StructuredTransactionHistoryRecoveryOwner');
check(bound.owner,'LearnDomainAdapter');
check(bound.transactionOwner,'StructuredTransactionHistoryRecoveryOwner');
check(bound.commands,['learn.open','learn.edit','learn.practice','learn.review']);
check(Object.keys(bound.actionHomes).every(id=>id.startsWith('learn.')),true);
check(bound.actionHomes['learn.practice'],'CENTER_GOVERNED_ACTIVITY_TOGGLE');

const workbench=bound.describeWorkbench();
check(workbench.kind,'LearningWorkbench');
check(workbench.primaryFocus,'LEARNING_CONTENT');
check(workbench.structured.librarySemantics,false);
check(workbench.structured.sharedMechanics,true);
check(workbench.mastery,'NOT_INFERRED');
check(workbench.labRuntimeCreated,false);
check(workbench.librarySemanticActions,[]);
check(workbench.journey.journey.id,'journey-webapp');
check(workbench.journey.prerequisiteNavigationLocked,false);
const practiceToggle=workbench.toggles.find(row=>row.id==='practice');
check(practiceToggle.placement,'GOVERNED_ACTIVITY_TOGGLE');
check(practiceToggle.prominent,false);
check(practiceToggle.firstFocus,false);
check(workbench.toggles.map(row=>row.id),['practice','assessment','lab']);

const opened=commands.execute('learn.open',{});
check(opened.status,'LEARNING_ACTIVITY_OPEN');
check(opened.prerequisiteNavigationLocked,false);
check(opened.masteryWrite,false);

const edited=commands.execute('learn.edit',{blockId:'p1',patch:{html:'Edited through the shared Structured owner.'}});
check(edited.status,'LEARNING_DOCUMENT_EDITED');
check(structured.snapshot().blocks[0].html,'Edited through the shared Structured owner.');

const practice=commands.execute('learn.practice',{});
check(practice.status,'PRACTICE_STARTED');
check(practice.masteryWrite,false);
check(learn.learningProgress().state,'INCOMPLETE');
const submitted=commands.execute('learn.practice',{action:'submit',answer:'Boundary crossed at the request parser.'});
check(submitted.status,'PRACTICE_SUBMITTED');
check(submitted.masteryWrite,false);
check(learn.learningProgress().state,'COMPLETE');
check(learn.learningProgress().mastery,'NOT_INFERRED');
const review=commands.execute('learn.review',{});
check(review.status,'LOCAL_LEARNING_REVIEW');
check(review.masteryWrite,false);
check(review.formalReviewCreated,false);
check(review.w04DecisionCreated,false);
check(review.assessment.gradingProvider,'UNAVAILABLE');
check(review.assessment.masteryWrite,false);
check(learn.labDescriptor().w03RuntimeCreated,false);

// A revision change makes the previous completion stale without rewriting or inferring Mastery.
learn.activity.revision='activity-r4';
const stale=learn.learningProgress();
check(stale.state,'INCOMPLETE');
check(stale.attemptTruth,'STALE_REVISION_ATTEMPT');
check(stale.attempt.countsForCurrentCompletion,false);
check(stale.mastery,'NOT_INFERRED');

// Real-looking canonical Product input stays separate from DS01 admission markers.
{
  const source=seedSource({testOnly:false,truth:'BOUND_CANONICAL_LEARNING_SOURCE',classification:'PRODUCT_RUNTIME_BOUND_SOURCE'});
  delete source.testOnly;
  source.providerRef='provider://canonical-learning';
  const runtime=createLearnRuntimeComposition({source});
  check(runtime.descriptor.realConsumer,true);
  check(runtime.descriptor.explicitTestSource,false);
  check(runtime.learn.learningWorkbenchDescriptor().sourceClassification,'PRODUCT_RUNTIME_BOUND_SOURCE');
}

// CBF-001 is not locally papered over: unsupported Structured content is escalated to the shared owner.
{
  const source=seedSource({testOnly:false,truth:'BOUND_CANONICAL_LEARNING_SOURCE',classification:'PRODUCT_RUNTIME_BOUND_SOURCE'});
  delete source.testOnly;
  source.document.blocks=[{id:'s1',type:'section',html:'Unsupported shared Structured shape'}];
  assert.throws(()=>createLearnRuntimeComposition({source}),/SHARED_OWNER_ESCALATION:UnifiedEditor:INVALID_STRUCTURED_TREE:UNSUPPORTED_BLOCK_TYPE/);
  cases+=1;
}

console.log(JSON.stringify({surface:'learn',status:'PASS',cases,masteryWrite:false,workbench:'LearningWorkbench',practicePlacement:'GOVERNED_ACTIVITY_TOGGLE',testTruthSeparated:true,sharedOwnerEscalation:'UnifiedEditor'}));
