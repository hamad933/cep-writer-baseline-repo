import {readFileSync} from 'node:fs';
import {StructuredStickyNoteRuntimeComposition,createLibraryNoteRuntimeComposition,createStructuredStickyNoteRuntimeComposition} from '../../../adapters/library-note-runtime-composition.js';
import {createLearnRuntimeComposition} from '../../../adapters/learn.js';
import {BALANCED6_LEARN_SOURCE} from '../../../adapters/balanced6-acceptance-data.js';
import {bindStructuredPersistence,createStructuredConsumerAdapter} from '../../../adapters/structured-documents.js';
import {resolveStickyTitleDirection} from '../../../foundation/notes/sticky-note-window.js';

const rows=[];
const assert=(condition,message='assertion failed')=>{if(!condition)throw Error(message)};
const test=async(id,run)=>{try{rows.push({id,status:'PASS',detail:await run()})}catch(error){rows.push({id,status:'FAIL',error:String(error?.stack||error)})}};
const note=(id,surface='library')=>({id,title:'',titleDirection:'auto',binding:{documentId:`${surface}-document`,objectId:`${surface}-object`,blockId:`${surface}-block`,selection:{anchorOffset:2,focusOffset:5},route:`PERSONAL:CEP/W02/${surface}`,domainRef:{surface,objectId:`${surface}-object`}},working:{blocks:[{id:`${id}-p1`,type:'paragraph',html:'Working note'}],history:[],historyIndex:-1,selectedBlock:null,dirty:true},window:{x:40,y:70,width:360,height:300,closed:false,pinned:false}});
const documentFixture=()=>({id:'D05-DOC-1',revision:'base-r1',title:'D05 persistence',blocks:[{id:'b1',type:'paragraph',html:'baseline',children:[]}]});
const persistenceFixture=({autosavePreference=()=>false,recoveryPreference=()=>false,provider={}}={})=>{const calls=[],client={
  autosave:provider.autosave||((document,context)=>{calls.push({operation:'AUTOSAVE_DRAFT_ONLY',document,context});return {ok:true,status:'AUTOSAVE_DRAFT_STORED'}}),
  explicitSave:provider.explicitSave||((document,context)=>{calls.push({operation:'EXPLICIT_SAVE',document,context});return {ok:true,committed:true,revision:'persisted-r2'}}),
  captureRecovery:provider.captureRecovery||((document,context)=>{calls.push({operation:'RECOVERY_POINT_ONLY',document,context});return {ok:true,status:'RECOVERY_RECORDED'}})
};const adapter=createStructuredConsumerAdapter('learn',null,{document:documentFixture()});bindStructuredPersistence(adapter,client,{autosaveDelayMs:60000,autosavePreference,recoveryPreference});return {adapter,calls,client}};

await test('d05.shared-family-library-and-learn-use-one-composition-class',()=>{
  const library=createLibraryNoteRuntimeComposition(),learnComposition=createLearnRuntimeComposition({source:BALANCED6_LEARN_SOURCE}),learn=learnComposition.learn;
  library.ensure(note('library-note','library'));
  const created=learn.createLinkedNote({noteId:'learn-note',title:'Learn note',blockId:BALANCED6_LEARN_SOURCE.document.blocks[0].id,sourceRange:{anchorOffset:1,focusOffset:3}});
  assert(created.ok&&created.status==='D05_FAMILY_CAPABILITY_IMPLEMENTED_AND_FALSIFIED');
  assert(library.owner==='StructuredStickyNoteRuntimeComposition'&&learnComposition.noteRuntime.owner===library.owner);
  assert(library instanceof StructuredStickyNoteRuntimeComposition&&learnComposition.noteRuntime instanceof StructuredStickyNoteRuntimeComposition);
  assert(library.documentAdapter('library-note').constructor===learnComposition.noteRuntime.documentAdapter('learn-note').constructor);
  return {owner:library.owner,libraryConsumer:library.domainKind,learnConsumer:learnComposition.noteRuntime.domainKind,engineClass:library.documentAdapter('library-note').constructor.name,classification:created.classification};
});

await test('d05.learn-capability-family-ready-final-route-pending',()=>{
  const composition=createLearnRuntimeComposition({source:BALANCED6_LEARN_SOURCE,noteRouteBound:false}),pending=composition.learn.noteCapability(),family=composition.learn.noteCapability({routeBound:true});
  assert(!pending.enabled&&pending.familyAvailable&&pending.code==='FINAL_PRODUCT_ROUTE_BINDING_PENDING_D13'&&pending.finalRouteBound===false);
  assert(family.enabled&&family.code==='AVAILABLE');
  return {familyCapability:'D05_FAMILY_CAPABILITY_IMPLEMENTED_AND_FALSIFIED',productRoute:pending.code,routeBoundCapability:family.code};
});

await test('d05.private-document-command-input-instances-never-leak-or-collide',()=>{
  const runtime=createLibraryNoteRuntimeComposition(),first=runtime.ensure(note('scope-a')),second=runtime.ensure(note('scope-b'));
  const a=first.engineIdentity(),b=second.engineIdentity();
  for(const identity of [a,b]){assert(identity.executionScope.kind==='PRIVATE_DOCUMENT_SCOPED_EXECUTION_INSTANCES');assert(identity.executionScope.publishedToApplicationCommandRegistry===false);assert(identity.executionScope.applicationGlobalListenerOwnership===false);assert(identity.executionScope.listenerOwner==='NONE')}
  assert(first.commands!==second.commands&&first.globalInputKeymapOwner!==second.globalInputKeymapOwner);
  const beforeB=JSON.stringify(second.snapshot());first.documentAdapter.updateBlock('scope-a-p1',{html:'A only'});assert(JSON.stringify(second.snapshot())===beforeB);
  return {scope:a.executionScope.kind,applicationRegistryPublication:false,globalListenerOwnership:false,commandInstancesDistinct:true,crossNoteMutation:false};
});

await test('d05.detached-owning-surface-context-is-not-library-hardcoded',()=>{
  const bridge={id:'d05-test-platform-window',capabilities:()=>({alwaysOnTop:true,separateWindow:true}),requestSeparateWindow:request=>({ok:true,active:true,request}),requestAlwaysOnTop:request=>({ok:true,active:request.requested})};
  const runtime=createStructuredStickyNoteRuntimeComposition({domainKind:'learn',surfaceId:'learn',platformWindowBridge:bridge,finalRouteBound:false}),value=note('learn-detached','learn');
  runtime.ensure(value,{focusReturnId:'learn-object',owningSurfaceContext:{contextLens:'activity-notes',selectionFocus:{blockId:'learn-block',sourceRange:{anchorOffset:2,focusOffset:5}}}});
  const detached=runtime.requestSeparateWindow(value.id),serialized=JSON.stringify(detached.surfaceIntent);
  assert(detached.ok&&detached.surfaceIntent.scope==='OWNING_SURFACE');assert(detached.surfaceIntent.preserveRoute&&detached.surfaceIntent.preserveObject&&detached.surfaceIntent.preserveContext&&detached.surfaceIntent.preserveSelection&&detached.surfaceIntent.preserveFocus);
  assert(detached.surfaceIntent.owningSurfaceContext.surfaceId==='learn'&&detached.surfaceIntent.owningSurfaceContext.objectId==='learn-object'&&!serialized.includes('"surfaceId":"library"'));
  return {noteId:value.id,surfaceId:'learn',objectId:'learn-object',contextLens:'activity-notes',selectionPreserved:true,focusPreserved:true};
});

await test('d05.platform-unavailable-is-pending-and-pin-is-not-topmost',()=>{
  const runtime=createLibraryNoteRuntimeComposition(),value=note('platform-note');runtime.ensure(value);const pinned=runtime.setPinned(value.id,true),topmost=runtime.requestAlwaysOnTop(value.id,true),detached=runtime.requestSeparateWindow(value.id);
  assert(pinned.pinned===true&&pinned.platform.alwaysOnTop.active===false);assert(topmost.code==='TARGET_PLATFORM_PENDING'&&!topmost.ok);assert(detached.code==='TARGET_PLATFORM_PENDING'&&!detached.ok);
  return {internalPin:pinned.pinned,osAlwaysOnTop:pinned.platform.alwaysOnTop.active,alwaysOnTop:topmost.code,separateWindow:detached.code};
});

const directionCases=[
  ['arabic-first-ltr-environment',{title:'مرحبا TCP/IP',platformDirection:'ltr'},'rtl','NON_EMPTY_AUTO_FIRST_STRONG'],
  ['english-first-rtl-environment',{title:'Policy حدود',platformDirection:'rtl'},'ltr','NON_EMPTY_AUTO_FIRST_STRONG'],
  ['mixed-arabic-technical',{title:'تحقق policy.can()',platformDirection:'ltr'},'rtl','NON_EMPTY_AUTO_FIRST_STRONG'],
  ['mixed-english-arabic',{title:'Verify الثقة',platformDirection:'rtl'},'ltr','NON_EMPTY_AUTO_FIRST_STRONG'],
  ['empty-rtl-input',{title:'',inputDirection:'rtl',platformDirection:'ltr'},'rtl','EMPTY_ACTIVE_INPUT_PLATFORM_HINT'],
  ['empty-ltr-input',{title:'',inputDirection:'ltr',platformDirection:'rtl'},'ltr','EMPTY_ACTIVE_INPUT_PLATFORM_HINT'],
  ['explicit-rtl',{title:'English first',persistedDirection:'rtl',inputDirection:'ltr'},'rtl','EXPLICIT_PERSISTED_DIRECTION'],
  ['explicit-ltr',{title:'العربية أولاً',persistedDirection:'ltr',inputDirection:'rtl'},'ltr','EXPLICIT_PERSISTED_DIRECTION']
];
for(const [name,input,expected,source] of directionCases)await test(`d05.title-direction.${name}`,()=>{const receipt=resolveStickyTitleDirection(input);assert(receipt.direction===expected&&receipt.source===source&&receipt.technicalTokenDirection==='ltr'&&receipt.physicalReorder===false);return receipt});

await test('d05.autosave-off-edit-zero-provider-autosave',async()=>{const fixture=persistenceFixture({autosavePreference:()=>false});fixture.adapter.transact('off-edit',doc=>{doc.title='dirty'});const receipt=await fixture.adapter.persistence.lastAutosave();assert(fixture.calls.length===0&&receipt.operation==='AUTOSAVE_DRAFT_ONLY'&&receipt.status==='AUTOSAVE_DISABLED'&&receipt.attempted===false);return {providerCalls:fixture.calls.length,...receipt}});
await test('d05.autosave-on-edit-only-autosave',async()=>{const fixture=persistenceFixture({autosavePreference:()=>true});fixture.adapter.transact('on-edit',doc=>{doc.title='autosave draft'});const receipt=await fixture.adapter.persistence.flushAutosave();assert(fixture.calls.length===1&&fixture.calls[0].operation==='AUTOSAVE_DRAFT_ONLY'&&receipt.operation==='AUTOSAVE_DRAFT_ONLY'&&receipt.persisted===false&&receipt.durableCommit===false);return {providerOperations:fixture.calls.map(row=>row.operation),receipt}});
await test('d05.explicit-save-only-explicit-operation',async()=>{const fixture=persistenceFixture();fixture.adapter.transact('explicit-edit',doc=>{doc.title='explicit'});const receipt=await fixture.adapter.commit({reason:'test-explicit'});assert(fixture.calls.length===1&&fixture.calls[0].operation==='EXPLICIT_SAVE'&&receipt.operation==='EXPLICIT_SAVE'&&receipt.persisted===true&&receipt.durableCommit===true);return {providerOperations:fixture.calls.map(row=>row.operation),receipt}});
await test('d05.recovery-off-does-not-call-provider',async()=>{const fixture=persistenceFixture({recoveryPreference:()=>false});fixture.adapter.captureRecovery('recovery-off');const receipt=await fixture.adapter.persistence.lastRecovery();assert(fixture.calls.length===0&&receipt.operation==='RECOVERY_POINT_ONLY'&&receipt.status==='RECOVERY_DISABLED');return {providerCalls:0,receipt}});
await test('d05.recovery-on-only-recovery-operation',async()=>{const fixture=persistenceFixture({recoveryPreference:()=>true});fixture.adapter.captureRecovery('recovery-on');const receipt=await fixture.adapter.persistence.lastRecovery();assert(fixture.calls.length===1&&fixture.calls[0].operation==='RECOVERY_POINT_ONLY'&&receipt.operation==='RECOVERY_POINT_ONLY'&&receipt.persisted===false);return {providerOperations:fixture.calls.map(row=>row.operation),receipt}});
await test('d05.autosave-failure-never-claims-persisted',async()=>{const calls=[],fixture=persistenceFixture({autosavePreference:()=>true,provider:{autosave:()=>{calls.push('AUTOSAVE_DRAFT_ONLY');throw Object.assign(Error('draft offline'),{code:'DRAFT_OFFLINE'})}}});fixture.adapter.transact('autosave-failure',doc=>{doc.title='failed draft'});const receipt=await fixture.adapter.persistence.flushAutosave();assert(calls.length===1&&!receipt.ok&&receipt.operation==='AUTOSAVE_DRAFT_ONLY'&&receipt.persisted===false&&receipt.durableCommit===false);return {providerOperations:calls,receipt}});
await test('d05.provider-unavailable-is-explicit-per-operation',async()=>{const adapter=createStructuredConsumerAdapter('learn',null,{document:documentFixture()});bindStructuredPersistence(adapter,{},{});adapter.transact('unavailable-edit',doc=>{doc.title='local only'});const autosave=await adapter.persistence.autosave({enabled:true}),explicit=await adapter.commit(),recovery=await adapter.persistence.captureRecovery('unavailable');assert([autosave,explicit,recovery].every(receipt=>receipt.persisted===false));assert(autosave.operation==='AUTOSAVE_DRAFT_ONLY'&&explicit.operation==='EXPLICIT_SAVE'&&recovery.operation==='RECOVERY_POINT_ONLY');return {autosave,explicit,recovery}});
await test('d05.explicit-save-failure-remains-dirty',async()=>{const fixture=persistenceFixture({provider:{explicitSave:()=>({ok:false,committed:false,code:'WRITE_FAILED'})}});fixture.adapter.transact('failed-explicit',doc=>{doc.title='not durable'});const receipt=await fixture.adapter.commit();assert(!receipt.ok&&!receipt.persisted&&receipt.operation==='EXPLICIT_SAVE'&&receipt.durableCommit===false&&fixture.adapter.dirty===true);return {receipt,dirty:fixture.adapter.dirty}});
await test('d05.false-provider-success-without-durable-proof-is-rejected',async()=>{const fixture=persistenceFixture({provider:{explicitSave:()=>({ok:true,status:'AMBIGUOUS_OK'})}});fixture.adapter.transact('ambiguous-explicit',doc=>{doc.title='not proven'});const receipt=await fixture.adapter.commit();assert(!receipt.ok&&!receipt.persisted&&receipt.operation==='EXPLICIT_SAVE'&&fixture.adapter.dirty===true);return {receipt,dirty:fixture.adapter.dirty}});

await test('d05.workspace-projection-carries-pending-route-truth',()=>{const workspace=readFileSync(new URL('../../../../stack/native-typescript/foundation/workspace.ts',import.meta.url),'utf8'),host=readFileSync(new URL('../../../../stack/native-typescript/foundation/workspace-host.ts',import.meta.url),'utf8');assert(workspace.includes('data-note-capability')&&workspace.includes('applyNoteCapability'));assert(host.includes('FINAL_PRODUCT_ROUTE_BINDING_PENDING_D13'));return {noteButtonsCapabilityGated:true,learnPendingCode:'FINAL_PRODUCT_ROUTE_BINDING_PENDING_D13'}});

const fail=rows.filter(row=>row.status==='FAIL').length;
console.log(JSON.stringify({suite:'D05_STRUCTURED_STICKY_PERSISTENCE',classification:'D05_FAMILY_CAPABILITY_IMPLEMENTED_AND_FALSIFIED',finalProductRouteBinding:'FINAL_PRODUCT_ROUTE_BINDING_PENDING_D13',pass:rows.length-fail,fail,rows},null,2));
if(fail)process.exitCode=1;
