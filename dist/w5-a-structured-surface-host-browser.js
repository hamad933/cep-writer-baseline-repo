import {createStructuredConsumerAdapter} from './adapters/structured-documents.js';
import {FIXTURES,STRUCTURE_TREE,NOTE_FIXTURES} from './adapters/library-fixtures.js';
import {SemanticCommandBus} from './foundation/global/commands.js';
import {GlobalInputKeymapOwner} from './foundation/global/input-keymap.js';
import {StructuredSurfaceHost} from './foundation/structured/surface-host.js';
import {structuredBlockRendererPresentationPolicy,setStructuredBlockRendererPresentationPolicy} from './foundation/structured/block-renderer.js';
import {runW5AStructuredSurfaceHostProof} from './w5-a-structured-surface-host-tests.js';

const bundle={initialDocumentId:'KU-D05-0021',FIXTURES,STRUCTURE_TREE,NOTE_FIXTURES};
const make=(surface)=>{const adapter=surface==='library'?createStructuredConsumerAdapter('library',bundle):createStructuredConsumerAdapter('learn'),commands=new SemanticCommandBus(),globalInputKeymapOwner=new GlobalInputKeymapOwner({commands}),host=new StructuredSurfaceHost({adapter,commands,globalInputKeymapOwner});return {adapter,commands,host};};
const library=make('library'),learn=make('learn');
const libRoot=document.querySelector('#librarySurface'),learnRoot=document.querySelector('#learnSurface'),status=document.querySelector('#proofStatus');
const render=()=>{library.host.renderInto(libRoot);learn.host.renderInto(learnRoot);};
const browserEvidence={steps:[],executable:null,owners:{library:library.host.descriptor(),learn:learn.host.descriptor()},errors:[]};
const record=(id,evidence)=>browserEvidence.steps.push({id,status:'PASS',evidence});

try{
  render();
  const nested=libRoot.querySelector('[data-structured-block-id="blk-d05-li1a"] .structured-block-content');
  nested.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  const selected=library.host.routePointerSelection(library.host.presentationBridge.blockIdFromTarget(nested));
  render();
  record('browser.pointer-selection',{owner:selected.owner,selected:selected.blockIds,domSelected:libRoot.querySelector('[data-structured-block-id="blk-d05-li1a"]')?.getAttribute('data-selected')});

  const beforeLearn=learn.adapter.snapshot(),beforeTx=learn.adapter.transactionDescriptor(),event={key:'Enter',code:'Enter',defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;}},keyboard=learn.host.routeKeydown(event,{caret:{blockId:'learn-p1',beforeText:'Browser host route',afterText:'',beforeHtml:'Browser host route',afterHtml:'',atStart:false,atEnd:true},allocateBlockId:()=> 'learn-browser-enter'}),afterTx=learn.adapter.transactionDescriptor();
  if(!keyboard.result.handled||keyboard.result.owner!=='StructuredInputKeymapOwner'||afterTx.historyLength!==beforeTx.historyLength+1)throw Error('BROWSER_KEYBOARD_ROUTE_FAILED');
  learn.adapter.undo();if(JSON.stringify(learn.adapter.snapshot())!==JSON.stringify(beforeLearn))throw Error('BROWSER_KEYBOARD_UNDO_NOT_EXACT');
  record('browser.keyboard-enter',{globalOwner:keyboard.globalResult.owner,inputOwner:keyboard.result.owner,command:keyboard.result.command,prevented:event.defaultPrevented,transactionOwner:learn.adapter.transactionOwner.owner,undoExact:true});

  const canonicalBefore={library:JSON.stringify(library.adapter.snapshot()),learn:JSON.stringify(learn.adapter.snapshot())};
  library.host.setMode('read');learn.host.setMode('read');render();
  const readParity={library:libRoot.querySelector('.structured-surface')?.getAttribute('data-structured-mode'),learn:learnRoot.querySelector('.structured-surface')?.getAttribute('data-structured-mode'),editableLibrary:libRoot.querySelector('.structured-block-content')?.getAttribute('contenteditable'),editableLearn:learnRoot.querySelector('.structured-block-content')?.getAttribute('contenteditable')};
  if(readParity.library!=='read'||readParity.learn!=='read'||readParity.editableLibrary!=='false'||readParity.editableLearn!=='false')throw Error('BROWSER_READ_MODE_PARITY_FAILED');
  record('browser.read-mode-parity',readParity);

  const readKeyboard=make('learn'),readKeyboardBefore=JSON.stringify(readKeyboard.adapter.snapshot()),readKeyboardTx=readKeyboard.adapter.transactionDescriptor();readKeyboard.host.setMode('read');const readKeyboardResult=readKeyboard.host.reorderKeyboard('learn-p1','down'),readKeyboardAfter=readKeyboard.adapter.transactionDescriptor();if(readKeyboardResult.ok||readKeyboardResult.changed||readKeyboardResult.code!=='EDIT_MODE_REQUIRED'||readKeyboardBefore!==JSON.stringify(readKeyboard.adapter.snapshot())||readKeyboardAfter.historyLength!==readKeyboardTx.historyLength||readKeyboardAfter.workingRevision!==readKeyboardTx.workingRevision)throw Error('BROWSER_READ_KEYBOARD_REORDER_MUTATED');record('browser.read-mode-keyboard-reorder-zero-mutation',{code:readKeyboardResult.code,historyDelta:readKeyboardAfter.historyLength-readKeyboardTx.historyLength,workingRevisionDelta:readKeyboardAfter.workingRevision-readKeyboardTx.workingRevision,canonicalUnchanged:true});

  const readPointer=make('learn'),readPointerBefore=JSON.stringify(readPointer.adapter.snapshot()),readPointerTx=readPointer.adapter.transactionDescriptor();readPointer.host.setMode('read');const readPointerBegin=readPointer.host.beginPointerDrag({sourceBlockId:'learn-p1',pointerId:201,startX:0,startY:0}),readPointerUpdate=readPointer.host.updatePointerDrag({clientX:20,clientY:20,target:{kind:'gap',parentId:null,index:3,depth:0},viewportTop:0,viewportBottom:600}),readPointerCommit=readPointer.host.commitPointerDrag(),readPointerAfter=readPointer.adapter.transactionDescriptor();if([readPointerBegin,readPointerUpdate,readPointerCommit].some(result=>result.ok||result.changed||result.code!=='EDIT_MODE_REQUIRED')||readPointerBefore!==JSON.stringify(readPointer.adapter.snapshot())||readPointerAfter.historyLength!==readPointerTx.historyLength||readPointerAfter.workingRevision!==readPointerTx.workingRevision)throw Error('BROWSER_READ_POINTER_DRAG_MUTATED');record('browser.read-mode-pointer-drag-zero-mutation',{begin:readPointerBegin.code,update:readPointerUpdate.code,commit:readPointerCommit.code,historyDelta:0,workingRevisionDelta:0,canonicalUnchanged:true});

  const switchedDrag=make('learn'),switchedBefore=JSON.stringify(switchedDrag.adapter.snapshot()),switchedTx=switchedDrag.adapter.transactionDescriptor(),switchedBegin=switchedDrag.host.beginPointerDrag({sourceBlockId:'learn-p1',pointerId:202,startX:0,startY:0}),switchedUpdate=switchedDrag.host.updatePointerDrag({clientX:20,clientY:20,target:{kind:'gap',parentId:null,index:3,depth:0},viewportTop:0,viewportBottom:600});if(!switchedBegin.ok||!switchedUpdate.active)throw Error('BROWSER_EDIT_DRAG_NOT_ACTIVE');const switchedMode=switchedDrag.host.setMode('read'),switchedCommit=switchedDrag.host.commitPointerDrag(),switchedAfter=switchedDrag.adapter.transactionDescriptor();if(!switchedMode.cancelledPointerDrag||switchedCommit.ok||switchedCommit.changed||switchedCommit.code!=='EDIT_MODE_REQUIRED'||switchedBefore!==JSON.stringify(switchedDrag.adapter.snapshot())||switchedAfter.historyLength!==switchedTx.historyLength||switchedAfter.workingRevision!==switchedTx.workingRevision)throw Error('BROWSER_EDIT_TO_READ_DRAG_MUTATED');record('browser.edit-drag-switch-read-commit-zero-mutation',{modeCancelledPointerDrag:switchedMode.cancelledPointerDrag,commitCode:switchedCommit.code,historyDelta:0,workingRevisionDelta:0,canonicalUnchanged:true});

  const beforeHTML={library:libRoot.innerHTML,learn:learnRoot.innerHTML},policyBefore=structuredBlockRendererPresentationPolicy(),change=setStructuredBlockRendererPresentationPolicy({blockGapPx:policyBefore.blockGapPx+4});render();const changedHTML={library:libRoot.innerHTML,learn:learnRoot.innerHTML};change.revert();render();const afterHTML={library:libRoot.innerHTML,learn:learnRoot.innerHTML};
  if(beforeHTML.library===changedHTML.library||beforeHTML.learn===changedHTML.learn||beforeHTML.library!==afterHTML.library||beforeHTML.learn!==afterHTML.learn)throw Error('BROWSER_CENTRAL_RENDERER_REVERT_FAILED');
  if(canonicalBefore.library!==JSON.stringify(library.adapter.snapshot())||canonicalBefore.learn!==JSON.stringify(learn.adapter.snapshot()))throw Error('BROWSER_PRESENTATION_MUTATED_DOMAIN_TRUTH');
  record('browser.central-change-exact-revert',{policyBefore,policyChanged:change.current,libraryReached:true,learnReached:true,libraryExactRevert:true,learnExactRevert:true,canonicalTruthUnchanged:true});

  browserEvidence.executable=runW5AStructuredSurfaceHostProof();
  if(browserEvidence.executable.status!=='PASS')throw Error('BROWSER_EXECUTABLE_SUITE_FAILED');
  browserEvidence.status='PASS';
  status.textContent='PASS · StructuredSurfaceHost · Library + Learn';status.dataset.status='PASS';
}catch(error){browserEvidence.status='FAIL';browserEvidence.errors.push(String(error?.stack||error));status.textContent='FAIL · '+String(error?.message||error);status.dataset.status='FAIL';}

const proofNode=document.querySelector('#w5aBrowserProof');
proofNode.textContent=JSON.stringify(browserEvidence);
globalThis.W5AStructuredSurfaceBrowserProof=browserEvidence;
