import {StructuredNoteContentAdapter,createStructuredNoteContentDocument,structuredNoteContentAdapterPublicationCount} from './adapters/structured-note-content.js';
import {NoteBindingAdapter} from './foundation/notes/note-binding.js';
import {libraryNoteBindingInput} from './adapters/note-binding-domains.js';
import {StickyNoteWindowOwner} from './foundation/notes/sticky-note-window.js';

const status=document.querySelector('#proofStatus'),root=document.querySelector('#w6cCorrectionRoot');
const steps=[];const assert=(c,m)=>{if(!c)throw Error(m)};const stable=v=>JSON.stringify(v);const record=(id,evidence)=>steps.push({id,status:'PASS',evidence});
const rejects=(fn,token)=>{try{fn()}catch(error){const message=String(error?.message||error);assert(message.includes(token),`expected ${token}, got ${message}`);return message}throw Error(`expected rejection ${token}`)};
const available=kind=>({state:'available',evidence:{kind}});
const bridge={id:'w6c-correction-browser-bridge',capabilities:()=>({alwaysOnTop:false,separateWindow:true}),requestSeparateWindow:()=>({ok:true,active:true})};
function bind(owner,noteId){owner.bind(noteId,libraryNoteBindingInput({noteId,documentId:`source-${noteId}`,blockId:`source-block-${noteId}`,route:`PERSONAL:CEP/W06/correction-browser/${noteId}`,availability:available('W6C_CORRECTION_BROWSER')}))}
function doc(noteId,documentId){return createStructuredNoteContentDocument(noteId,{documentId,title:`ملاحظة ${noteId}`,blocks:[{id:`${noteId}-p1`,type:'paragraph',html:`browser:${noteId}`}]})}
function prepare(bindingOwner,windowOwner,noteId){bind(bindingOwner,noteId);windowOwner.register(noteId,{geometry:{x:80,y:90,width:420,height:320},open:true,pinned:false})}
function create(bindingOwner,windowOwner,noteId,documentId){return new StructuredNoteContentAdapter({noteId,document:doc(noteId,documentId),bindingOwner,windowOwner,mode:'edit'})}
try{
  const bindingOwner=new NoteBindingAdapter(),windowOwner=new StickyNoteWindowOwner({hostGraph:{},capabilityBridge:bridge}),noteId='w6c-correction-browser-A';prepare(bindingOwner,windowOwner,noteId);
  const before=structuredNoteContentAdapterPublicationCount(),a=create(bindingOwner,windowOwner,noteId,'w6c-correction-browser-doc-A'),card=document.createElement('section');root.append(card);a.surfaceHost.renderInto(card);assert(structuredNoteContentAdapterPublicationCount()===before+1,'first publication count wrong');record('browser.first-canonical-publication',{documentId:a.documentId});

  const count=structuredNoteContentAdapterPublicationCount(),host=a.surfaceHost,documentAdapter=a.documentAdapter,message=rejects(()=>create(bindingOwner,windowOwner,noteId,'w6c-correction-browser-doc-A'),'DUPLICATE_STRUCTURED_NOTE_CONTENT_ADAPTER');assert(structuredNoteContentAdapterPublicationCount()===count&&a.surfaceHost===host&&a.documentAdapter===documentAdapter,'duplicate altered canonical publication');a.surfaceHost.updateContent(`${noteId}-p1`,{html:'canonical still usable'});assert(a.snapshot().blocks[0].html==='canonical still usable','canonical adapter unusable after duplicate');record('browser.duplicate-rejected-first-remains-usable',{message,publicationCountUnchanged:true});

  const docId=a.documentId,binding=stable(a.bindingDescriptor());windowOwner.hide(noteId);windowOwner.open(noteId);assert(a.documentId===docId&&stable(a.bindingDescriptor())===binding,'hide/reopen identity drift');const request=windowOwner.requestSeparateWindow(noteId),projection=a.presentationBinding({windowInstanceId:'w6c-native-correction'});assert(request.ok&&projection.presentation.hostKind==='separate-window'&&a.documentId===docId&&a.surfaceHost===host,'separate window replaced engine');rejects(()=>create(bindingOwner,windowOwner,noteId,'w6c-correction-browser-doc-A'),'DUPLICATE_STRUCTURED_NOTE_CONTENT_ADAPTER');record('browser.reopen-and-separate-window-reuse-first-adapter',{documentId:docId,sameHost:true,sameBinding:true});

  const noteB='w6c-correction-browser-B';prepare(bindingOwner,windowOwner,noteB);const collisionCount=structuredNoteContentAdapterPublicationCount(),collision=rejects(()=>create(bindingOwner,windowOwner,noteB,docId),'STRUCTURED_NOTE_CONTENT_DOCUMENT_ID_COLLISION');assert(structuredNoteContentAdapterPublicationCount()===collisionCount,'document collision published phantom');const b=create(bindingOwner,windowOwner,noteB,'w6c-correction-browser-doc-B');assert(b.documentId!==a.documentId&&b.documentAdapter!==a.documentAdapter,'legal second note not isolated');record('browser.document-collision-fail-atomic-then-legal-retry',{collision,documents:[a.documentId,b.documentId]});

  const bindingOwner2=new NoteBindingAdapter(),windowOwner2=new StickyNoteWindowOwner({hostGraph:{}});prepare(bindingOwner2,windowOwner2,noteId);const independent=create(bindingOwner2,windowOwner2,noteId,docId);assert(independent!==a&&independent.documentId===a.documentId,'independent graph incorrectly collided');record('browser.independent-graph-textual-identity-reuse',{sameNoteId:true,sameDocumentId:true,independentCanonicalOwners:true});

  status.textContent='PASS';status.dataset.status='PASS';globalThis.W6CStructuredNoteContentCorrectionBrowserProof={status:'PASS',steps,canonicalDocumentId:a.documentId,secondDocumentId:b.documentId};
}catch(error){status.textContent='FAIL';status.dataset.status='FAIL';globalThis.W6CStructuredNoteContentCorrectionBrowserProof={status:'FAIL',steps,errors:[String(error?.stack||error)]};}
