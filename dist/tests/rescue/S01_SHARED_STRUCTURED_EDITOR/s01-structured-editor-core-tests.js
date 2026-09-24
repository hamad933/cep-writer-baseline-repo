import {createStructuredConsumerAdapter} from '../../../adapters/structured-documents.js';
import {FIXTURES,STRUCTURE_TREE,NOTE_FIXTURES} from '../../../adapters/library-fixtures.js';
import {SemanticCommandBus} from '../../../foundation/global/commands.js';
import {GlobalInputKeymapOwner} from '../../../foundation/global/input-keymap.js';
import {StructuredSurfaceHost} from '../../../foundation/structured/surface-host.js';
import {StructuredNoteContentAdapter,createStructuredNoteContentDocument} from '../../../adapters/structured-note-content.js';
import {NoteBindingAdapter} from '../../../foundation/notes/note-binding.js';
import {libraryNoteBindingInput} from '../../../adapters/note-binding-domains.js';
import {StickyNoteWindowOwner} from '../../../foundation/notes/sticky-note-window.js';

const assert=(condition,message)=>{if(!condition)throw Error(message)};
const stable=value=>JSON.stringify(value);
const run=(id,fn)=>{try{return {id,status:'PASS',evidence:fn()}}catch(error){return {id,status:'FAIL',error:String(error?.stack||error)}}};
const libraryBundle={initialDocumentId:'KU-D05-0021',FIXTURES,STRUCTURE_TREE,NOTE_FIXTURES};

function makeMain(kind){
  const adapter=kind==='library'?createStructuredConsumerAdapter('library',libraryBundle):createStructuredConsumerAdapter('learn');
  const commands=new SemanticCommandBus(),globalInputKeymapOwner=new GlobalInputKeymapOwner({commands}),host=new StructuredSurfaceHost({adapter,commands,globalInputKeymapOwner});
  return {kind,adapter,host};
}
function makeNote(){
  const noteId='s01-sticky-note',bindingOwner=new NoteBindingAdapter();
  bindingOwner.bind(noteId,libraryNoteBindingInput({noteId,documentId:'KU-D05-0021',blockId:'blk-d05-p1',route:'PERSONAL:CEP/S01/library',availability:{state:'available',evidence:{kind:'S01'}}}));
  const windowOwner=new StickyNoteWindowOwner({hostGraph:{}});windowOwner.register(noteId,{geometry:{x:80,y:90,width:420,height:320},open:true,pinned:false});
  const document=createStructuredNoteContentDocument(noteId,{blocks:[
    {id:'s01-note-p1',type:'paragraph',html:'محتوى عربي · <bdi dir="ltr">TCP/IP</bdi>',dir:'auto'},
    {id:'s01-note-p2',type:'paragraph',html:'Second block',dir:'auto'}
  ]});
  const content=new StructuredNoteContentAdapter({noteId,document,bindingOwner,windowOwner,mode:'edit'});
  return {kind:'sticky',adapter:content.documentAdapter,host:content.surfaceHost,content};
}
function rootGap(host,index=1){
  const projection=host.project(),key=`ROOT::${index}::0`,state=projection.interaction.gaps[key];
  assert(state?.target,`missing canonical root gap ${key}`);return structuredClone(state.target);
}
function fakeGapDOM(host,index=1){
  const target=rootGap(host,index),attrs={
    'data-structured-gap-key':`ROOT::${index}::0`,
    'data-structured-parent-id':target.parentId||'',
    'data-structured-index':String(target.index),
    'data-structured-depth':String(target.depth),
    'data-structured-after-block-id':target.afterBlockId||'',
    'data-structured-before-block-id':target.beforeBlockId||''
  },listeners={},requests=[];
  const gap={getAttribute:name=>attrs[name]??null,closest:selector=>selector==='[data-structured-gap-key]'?gap:null};
  const trigger={disabled:false,isConnected:true,getAttribute:name=>attrs[name]??null,focus(){this.focused=true},closest(selector){if(selector==='[data-structured-insertion-trigger="true"]')return this;if(selector==='[data-structured-gap-key]')return gap;return null}};
  class TestCustomEvent{constructor(type,options={}){this.type=type;this.detail=options.detail;this.bubbles=!!options.bubbles;this.cancelable=!!options.cancelable}}
  const root={innerHTML:'',ownerDocument:{defaultView:{CustomEvent:TestCustomEvent}},addEventListener(type,fn){(listeners[type]??=[]).push(fn)},dispatchEvent(event){requests.push(event);return true},querySelectorAll(){return []}};
  host.renderInto(root);
  const fire=(type,extra={})=>{const event={type,target:trigger,key:null,shiftKey:false,button:0,defaultPrevented:false,propagationStopped:false,preventDefault(){this.defaultPrevented=true},stopPropagation(){this.propagationStopped=true},...extra};for(const fn of listeners[type]||[])fn(event);return event};
  return {root,trigger,target,requests,fire};
}

function verifyDirectParagraph(bundle,index=1){
  const {adapter,host}=bundle,target=rootGap(host,index),before=adapter.snapshot(),beforeTx=adapter.transactionDescriptor(),beforeIds=before.blocks.map(block=>block.id);
  const result=host.routeInsertionGapDirectParagraph(target),after=adapter.snapshot(),afterTx=adapter.transactionDescriptor();
  assert(result.ok&&result.changed&&result.interaction==='SECONDARY_DIRECT_PARAGRAPH'&&result.chooserRequested===false,'secondary route did not directly insert');
  assert(result.insertedBlockType==='paragraph'&&after.blocks[index]?.id===result.insertedBlockId&&after.blocks[index]?.type==='paragraph','paragraph not inserted at exact gap');
  assert(after.blocks[index]?.html===''&&after.blocks[index]?.dir==='auto','direct paragraph defaults drifted');
  assert(after.blocks.slice(0,index).map(block=>block.id).join('|')===beforeIds.slice(0,index).join('|')&&after.blocks.slice(index+1).map(block=>block.id).join('|')===beforeIds.slice(index).join('|'),'neighbour identities/order changed');
  assert(afterTx.historyLength===beforeTx.historyLength+1&&afterTx.workingRevision===beforeTx.workingRevision+1,'direct paragraph was not one atomic transaction');
  const undo=adapter.undo();assert(undo.changed&&stable(adapter.snapshot())===stable(before),'direct paragraph undo was not exact');
  return {target,insertedBlockId:result.insertedBlockId,insertedType:result.insertedBlockType,historyDelta:1,workingRevisionDelta:1,undoExact:true,mutationOwner:result.mutationOwner,transactionOwner:result.transactionOwner};
}

export function runS01StructuredEditorCoreProof(){
  const cases=[];
  cases.push(run('s01.od054.primary-click-contract-is-chooser-only',()=>{const b=makeMain('library'),target=rootGap(b.host),before=stable(b.adapter.snapshot()),tx=b.adapter.transactionDescriptor(),request=b.host.routeInsertionGap(target),afterTx=b.adapter.transactionDescriptor();assert(request.ok&&request.status==='INSERTION_REQUEST'&&request.code==='INSERTION_PAYLOAD_REQUIRED'&&request.mutationDelegated===false,'primary route no longer projects chooser request');assert(before===stable(b.adapter.snapshot())&&afterTx.historyLength===tx.historyLength&&afterTx.workingRevision===tx.workingRevision,'chooser request mutated document');return {status:request.status,code:request.code,mutationDelegated:false,documentUnchanged:true};}));
  cases.push(run('s01.od054.dom-routing-left-keyboard-chooser-right-direct',()=>{
    const left=makeMain('library'),leftDom=fakeGapDOM(left.host),leftBefore=stable(left.adapter.snapshot()),leftTx=left.adapter.transactionDescriptor(),leftEvent=leftDom.fire('click',{button:0}),leftAfterTx=left.adapter.transactionDescriptor();
    assert(leftEvent.defaultPrevented&&leftDom.requests.filter(event=>event.type==='structured-insertion-request').length===1&&leftBefore===stable(left.adapter.snapshot())&&leftAfterTx.historyLength===leftTx.historyLength,'left-click DOM route drifted');
    const keyboard=makeMain('library'),keyDom=fakeGapDOM(keyboard.host),keyBefore=stable(keyboard.adapter.snapshot()),keyTx=keyboard.adapter.transactionDescriptor(),keyEvent=keyDom.fire('keydown',{key:'Enter'}),keyAfterTx=keyboard.adapter.transactionDescriptor();
    assert(keyEvent.defaultPrevented&&keyDom.requests.filter(event=>event.type==='structured-insertion-request').length===1&&keyBefore===stable(keyboard.adapter.snapshot())&&keyAfterTx.historyLength===keyTx.historyLength,'keyboard DOM route drifted');
    const right=makeMain('library'),rightDom=fakeGapDOM(right.host),rightBefore=right.adapter.snapshot(),rightTx=right.adapter.transactionDescriptor(),rightEvent=rightDom.fire('contextmenu',{button:2}),rightAfter=right.adapter.snapshot(),rightAfterTx=right.adapter.transactionDescriptor();
    assert(rightEvent.defaultPrevented&&rightEvent.propagationStopped&&rightDom.requests.filter(event=>event.type==='structured-insertion-request').length===0,'secondary DOM route opened chooser');
    assert(rightAfter.blocks.length===rightBefore.blocks.length+1&&rightAfter.blocks[1]?.type==='paragraph'&&rightAfter.blocks[0]?.id===rightBefore.blocks[0]?.id&&rightAfter.blocks[2]?.id===rightBefore.blocks[1]?.id,'secondary DOM route did not insert exact-gap paragraph');
    assert(rightAfterTx.historyLength===rightTx.historyLength+1,'secondary DOM route was not one transaction');
    return {left:{defaultPrevented:leftEvent.defaultPrevented,chooserRequests:1,historyDelta:0},keyboard:{key:'Enter',defaultPrevented:keyEvent.defaultPrevented,chooserRequests:1,historyDelta:0},right:{button:2,defaultPrevented:rightEvent.defaultPrevented,propagationStopped:rightEvent.propagationStopped,chooserRequests:0,insertedType:rightAfter.blocks[1].type,exactGap:true,historyDelta:1}};
  }));
  cases.push(run('s01.od054.library-secondary-direct-paragraph',()=>verifyDirectParagraph(makeMain('library'))));
  cases.push(run('s01.od054.learn-secondary-direct-paragraph',()=>verifyDirectParagraph(makeMain('learn'))));
  cases.push(run('s01.od054.sticky-secondary-direct-paragraph-same-engine',()=>{const note=makeNote(),main=makeMain('library');assert(Object.getPrototypeOf(note.host)===StructuredSurfaceHost.prototype&&Object.getPrototypeOf(main.host)===StructuredSurfaceHost.prototype,'Sticky forked StructuredSurfaceHost');assert(note.host.routeInsertionGapDirectParagraph===main.host.routeInsertionGapDirectParagraph,'Sticky does not inherit canonical OD-054 route');const proof=verifyDirectParagraph(note);return {...proof,sameHostPrototype:true,sameRouteFunction:true,alwaysEditableDefault:note.host.mode==='edit'};}));
  cases.push(run('s01.od054.read-mode-denies-secondary-with-zero-mutation',()=>{const b=makeMain('learn'),target=rootGap(b.host),before=stable(b.adapter.snapshot()),tx=b.adapter.transactionDescriptor();b.host.setMode('read');const result=b.host.routeInsertionGapDirectParagraph(target),afterTx=b.adapter.transactionDescriptor();assert(!result.ok&&result.code==='EDIT_MODE_REQUIRED'&&result.interaction==='SECONDARY_DIRECT_PARAGRAPH','read mode did not deny direct insertion');assert(before===stable(b.adapter.snapshot())&&afterTx.historyLength===tx.historyLength&&afterTx.workingRevision===tx.workingRevision,'read denial mutated canonical truth');return {code:result.code,documentUnchanged:true,historyDelta:0,workingRevisionDelta:0};}));
  cases.push(run('s01.od054.forged-gap-denied-before-mutation',()=>{const b=makeMain('library'),target=rootGap(b.host),before=stable(b.adapter.snapshot()),tx=b.adapter.transactionDescriptor(),forged={...target,index:target.index+1};const result=b.host.routeInsertionGapDirectParagraph(forged),afterTx=b.adapter.transactionDescriptor();assert(!result.ok&&result.code==='FORGED_STRUCTURED_GAP_METADATA','forged gap was accepted');assert(before===stable(b.adapter.snapshot())&&afterTx.historyLength===tx.historyLength&&afterTx.workingRevision===tx.workingRevision,'forged gap changed document');return {code:result.code,documentUnchanged:true,historyDelta:0,workingRevisionDelta:0};}));
  cases.push(run('s01.od054.presentation-route-metadata-centralized',()=>{for(const b of [makeMain('library'),makeMain('learn'),makeNote()]){const html=b.host.project().html;assert(html.includes('data-structured-primary-action="chooser"')&&html.includes('data-structured-keyboard-action="chooser"')&&html.includes('data-structured-secondary-action="insert-paragraph"'),'OD-054 interaction metadata missing from central presentation');}return {library:true,learn:true,sticky:true,primary:'chooser',keyboard:'chooser',secondary:'insert-paragraph'};}));
  cases.push(run('s01.od051.selection-clipboard-undo-bidi-ime-parity-preserved',()=>{const note=makeNote(),host=note.host,adapter=note.adapter;const select=host.routePointerSelection('s01-note-p1'),add=host.routePointerSelection('s01-note-p2',{additive:true});assert(select.blockIds.includes('s01-note-p1')&&add.blockIds.includes('s01-note-p1')&&add.blockIds.includes('s01-note-p2'),'additive selection regressed');const copy=host.routeClipboard('document.copy');assert(copy.ok&&copy.owner==='StructuredClipboardTrustOwner','clipboard owner regressed');const compositionStart=host.routeComposition('start',{data:'م'},{target:{isContentEditable:true}}),compositionEnd=host.routeComposition('end',{data:'مرحبا'},{target:{isContentEditable:true}});assert(compositionStart.owner==='StructuredInputKeymapOwner'&&compositionEnd.owner==='StructuredInputKeymapOwner','IME route owner regressed');const direction=adapter.projectRichBlock('s01-note-p1');assert(direction.directionResolution?.owner==='InputDirectionResolver','Bidi direction owner regressed');return {selectionOwner:select.owner,additiveCount:add.blockIds.length,clipboardOwner:copy.owner,imeOwner:compositionStart.owner,directionOwner:direction.directionResolution.owner};}));
  cases.push(run('s01.scope.no-global-read-edit-authority',()=>{const library=makeMain('library'),learn=makeMain('learn'),note=makeNote();assert(library.host.contract.owner==='Structured Family Presentation/Orchestration'&&learn.host.contract.owner===library.host.contract.owner&&note.host.contract.owner===library.host.contract.owner,'Structured host owner drifted');assert(note.adapter.readOnly===false,'Sticky became read-only');return {scope:'Structured document/editor transaction only',libraryDomain:library.adapter.domainKind,learnDomain:learn.adapter.domainKind,stickyDomain:note.adapter.domainKind,stickyReadOnly:false};}));
  const failed=cases.filter(item=>item.status!=='PASS');
  return {schemaVersion:1,kind:'OD057_S01_SHARED_STRUCTURED_EDITOR_CORE_PROOF',classification:'CANDIDATE_ONLY_SPECIALIST_EVIDENCE',status:failed.length?'FAIL':'PASS',caseCount:cases.length,passCount:cases.length-failed.length,failCount:failed.length,cases};
}
