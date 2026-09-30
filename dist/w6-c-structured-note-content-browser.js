import {StructuredNoteContentAdapter,createStructuredNoteContentDocument} from './adapters/structured-note-content.js';
import {NoteBindingAdapter} from './foundation/notes/note-binding.js';
import {libraryNoteBindingInput,learnNoteBindingInput} from './adapters/note-binding-domains.js';
import {StickyNoteWindowOwner} from './foundation/notes/sticky-note-window.js';

const root=document.querySelector('#w6cRoot'),status=document.querySelector('#proofStatus');
const steps=[];const assert=(condition,message)=>{if(!condition)throw Error(message)};const stable=value=>JSON.stringify(value);
const record=(id,evidence)=>steps.push({id,status:'PASS',evidence});
const available=kind=>({state:'available',evidence:{kind}});
const eventFor=(key,extra={})=>({key,code:extra.code||key,defaultPrevented:false,preventDefault(){this.defaultPrevented=true},stopPropagation(){this.stopped=true},...extra});
const documentFor=noteId=>createStructuredNoteContentDocument(noteId,{title:`ملاحظة ${noteId}`,blocks:[
  {id:`${noteId}-p1`,type:'paragraph',html:'مرحبا بالعالم · <bdi dir="ltr">TCP/IP</bdi>'},
  {id:`${noteId}-p2`,type:'paragraph',html:'Second block'},
  {id:`${noteId}-toggle`,type:'toggle',title:'تفاصيل',titleHtml:'<strong>تفاصيل</strong>',open:true,children:[]}
]});
function createNote({noteId,kind='library',bindingOwner,windowOwner}){
  if(kind==='library')bindingOwner.bind(noteId,libraryNoteBindingInput({noteId,documentId:'KU-D05-0021',blockId:'blk-d05-p1',route:'PERSONAL:CEP/W06/library',availability:available('W6C_BROWSER')}));
  else bindingOwner.bind(noteId,learnNoteBindingInput({noteId,documentId:'learn-runtime-doc',blockId:'learn-p1',objectId:'activity-1',route:'PERSONAL:CEP/W06/learn',availability:available('W6C_BROWSER')}));
  windowOwner.register(noteId,{geometry:{x:80,y:90,width:420,height:320},open:true,pinned:false});
  return new StructuredNoteContentAdapter({noteId,document:documentFor(noteId),bindingOwner,windowOwner,mode:'edit'});
}
try{
  const hostGraph={},bindingOwner=new NoteBindingAdapter(),windowOwner=new StickyNoteWindowOwner({hostGraph}),noteA=createNote({noteId:'w6c-browser-A',kind:'library',bindingOwner,windowOwner}),noteB=createNote({noteId:'w6c-browser-B',kind:'learn',bindingOwner,windowOwner});
  const aRoot=document.createElement('section'),bRoot=document.createElement('section');aRoot.className='note-card';bRoot.className='note-card';aRoot.dataset.noteId=noteA.noteId;bRoot.dataset.noteId=noteB.noteId;root.append(aRoot,bRoot);
  const rendered=noteA.surfaceHost.renderInto(aRoot);noteB.surfaceHost.renderInto(bRoot);assert(rendered.projection.documentId===noteA.documentAdapter.identity().id&&aRoot.querySelector('[data-structured-block-id]'),'final Structured host did not render canonical note');record('browser.render-final-host',{host:rendered.hostOwner,documentId:rendered.projection.documentId});

  const beforeEdit=noteA.documentAdapter.transactionDescriptor();const edit=noteA.surfaceHost.updateContent('w6c-browser-A-p1',{html:'مرحبا · <bdi dir="ltr">API/TCP</bdi> · edited'}),afterEdit=noteA.documentAdapter.transactionDescriptor();assert(edit.ok&&afterEdit.historyLength===beforeEdit.historyLength+1,'edit did not route accepted mutation/history');noteA.surfaceHost.renderInto(aRoot);record('browser.edit-through-accepted-mutation',{mutationOwner:edit.semanticOwner||edit.owner,historyOwner:noteA.documentAdapter.transactionOwner.owner});

  noteA.surfaceHost.routePointerSelection('w6c-browser-A-p1');const copy=noteA.surfaceHost.routeClipboard('document.copy'),beforePaste=noteA.documentAdapter.transactionDescriptor(),paste=noteA.surfaceHost.routeClipboard('document.paste',{payload:copy.payload,index:noteA.documentAdapter.snapshot().blocks.length}),afterPaste=noteA.documentAdapter.transactionDescriptor();assert(copy.ok&&paste.inserted?.length===1&&afterPaste.historyLength===beforePaste.historyLength+1,'clipboard path failed');const undo=noteA.documentAdapter.undo();assert(undo.changed,'clipboard undo failed');record('browser.selection-copy-paste-undo',{selectionOwner:noteA.documentAdapter.selection.owner,clipboardOwner:noteA.documentAdapter.clipboardOwner.owner,transactionOwner:noteA.documentAdapter.transactionOwner.owner});

  const bidi=noteA.surfaceHost.renderer.find(noteA.surfaceHost.project().render,'w6c-browser-A-p1');assert(bidi.directionOwner==='InputDirectionResolver'&&bidi.richContentOwner==='StructuredRichContentOwner'&&bidi.html.includes('API/TCP'),'Bidi/technical token projection failed');record('browser.bidi-technical-token',{direction:bidi.direction,directionOwner:bidi.directionOwner,richOwner:bidi.richContentOwner});

  const docId=noteA.documentAdapter.identity().id,bindingBefore=stable(noteA.bindingDescriptor()),contentBeforeHide=stable(noteA.snapshot()),historyBeforeHide=stable(noteA.transactionDescriptor());windowOwner.hide(noteA.noteId);assert(noteA.windowDescriptor().lifecycle==='hidden'&&stable(noteA.snapshot())===contentBeforeHide,'hide mutated content');windowOwner.open(noteA.noteId);assert(noteA.documentAdapter.identity().id===docId&&stable(noteA.bindingDescriptor())===bindingBefore&&stable(noteA.snapshot())===contentBeforeHide&&stable(noteA.transactionDescriptor())===historyBeforeHide,'reopen identity/history/binding drift');record('browser.hide-reopen-identity',{documentId:docId,bindingStable:true,historyStable:true});

  const contentBeforeWindow=stable(noteA.snapshot()),windowBefore=windowOwner.window(noteA.noteId);windowOwner.setGeometry(noteA.noteId,{x:130,y:140,width:460,height:350},{reason:'w6c-browser'});windowOwner.setPinned(noteA.noteId,true);windowOwner.activate(noteA.noteId);const windowAfter=windowOwner.window(noteA.noteId);assert(stable(noteA.snapshot())===contentBeforeWindow&&windowAfter.pinned===true&&stable(windowAfter.geometry)!==stable(windowBefore.geometry),'window operation mutated content or did not project');record('browser.window-geometry-pin-content-isolation',{windowOwner:windowAfter.owner,contentUnchanged:true,pinned:windowAfter.pinned});

  const bBefore={doc:stable(noteB.snapshot()),tx:stable(noteB.transactionDescriptor()),selection:stable(noteB.documentAdapter.selectedFragmentIdentity()),binding:stable(noteB.bindingDescriptor()),window:stable(windowOwner.window(noteB.noteId))};noteA.surfaceHost.routePointerSelection('w6c-browser-A-p2');noteA.surfaceHost.routeKeydown(eventFor('Enter'),{caret:{blockId:'w6c-browser-A-p2',beforeText:'Second block',afterText:'',beforeHtml:'Second block',afterHtml:'',atStart:false,atEnd:true},allocateBlockId:()=> 'w6c-browser-A-enter'});assert(noteA.documentAdapter!==noteB.documentAdapter&&stable(noteB.snapshot())===bBefore.doc&&stable(noteB.transactionDescriptor())===bBefore.tx&&stable(noteB.documentAdapter.selectedFragmentIdentity())===bBefore.selection&&stable(noteB.bindingDescriptor())===bBefore.binding&&stable(windowOwner.window(noteB.noteId))===bBefore.window,'two-note isolation failed');record('browser.two-note-isolation',{documents:[noteA.documentId,noteB.documentId],bindingA:noteA.noteId,bindingB:noteB.noteId});

  const staleBefore=stable(noteA.snapshot()),staleTx=stable(noteA.transactionDescriptor());bindingOwner.projectAvailability(noteA.noteId,{availability:{state:'stale',reason:'browser-resolver-offline'}});bindingOwner.projectAvailability(noteA.noteId,{availability:{state:'unresolved',reason:'browser-resolver-pending'}});assert(noteA.bindingDescriptor().availability.state==='unresolved'&&stable(noteA.snapshot())===staleBefore&&stable(noteA.transactionDescriptor())===staleTx,'stale/unresolved binding altered content');record('browser.stale-binding-preserves-content',{availability:'unresolved',contentUnchanged:true,historyUnchanged:true});

  noteA.surfaceHost.renderInto(aRoot);noteB.surfaceHost.renderInto(bRoot);const metadata=document.createElement('aside');metadata.className='proof-meta';metadata.innerHTML=`<strong>${noteA.owner}</strong><br><code>${noteA.documentId}</code><br><span>${noteA.bindingDescriptor().availability.state}</span>`;aRoot.prepend(metadata);
  status.textContent='PASS';status.dataset.status='PASS';globalThis.W6CStructuredNoteContentBrowserProof={status:'PASS',steps,documentIds:[noteA.documentId,noteB.documentId],owner:noteA.owner,engineIdentity:noteA.engineIdentity(),bindingAvailability:noteA.bindingDescriptor().availability.state};
}catch(error){status.textContent='FAIL';status.dataset.status='FAIL';globalThis.W6CStructuredNoteContentBrowserProof={status:'FAIL',steps,errors:[String(error?.stack||error)]};}
