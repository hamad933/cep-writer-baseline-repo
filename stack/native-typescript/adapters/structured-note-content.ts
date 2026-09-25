import {StructuredDocumentDomainAdapter} from '../foundation/structured.js';
import {SemanticCommandBus} from '../foundation/global/commands.js';
import {GlobalInputKeymapOwner} from '../foundation/global/input-keymap.js';
import {StructuredSurfaceHost} from '../foundation/structured/surface-host.js';
import {assertCanonicalNoteBindingOwner} from '../foundation/notes/note-binding.js';
import {validateStickyNoteWindowOwner} from '../foundation/notes/sticky-note-window.js';

const clone=value=>structuredClone(value);
const isObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const OWNER_INSTANCES=new WeakSet();
const COMPOSITION_REGISTRIES=new WeakMap();
let publicationCount=0;

function compositionRegistry(bindingOwner,windowOwner,{create=false}={}){
  let byWindow=COMPOSITION_REGISTRIES.get(bindingOwner);
  if(!byWindow){
    if(!create)return null;
    byWindow=new WeakMap();
    COMPOSITION_REGISTRIES.set(bindingOwner,byWindow);
  }
  let registry=byWindow.get(windowOwner);
  if(!registry&&create){
    registry={byNoteId:new Map(),byDocumentId:new Map()};
    byWindow.set(windowOwner,registry);
  }
  return registry||null;
}

function assertPublicationSlotAvailable(bindingOwner,windowOwner,noteId,documentId){
  const registry=compositionRegistry(bindingOwner,windowOwner);
  if(!registry)return true;
  const existingNote=registry.byNoteId.get(noteId);
  if(existingNote)throw Error(`DUPLICATE_STRUCTURED_NOTE_CONTENT_ADAPTER:${noteId}`);
  const existingDocument=registry.byDocumentId.get(documentId);
  if(existingDocument)throw Error(`STRUCTURED_NOTE_CONTENT_DOCUMENT_ID_COLLISION:${documentId}:${existingDocument.noteId}!=${noteId}`);
  return true;
}

function publishCanonicalAdapter(adapter){
  // Construction is synchronous. Re-check immediately before the only publication mutation
  // so a failed constructor never reserves note/document identity.
  assertPublicationSlotAvailable(adapter.bindingOwner,adapter.windowOwner,adapter.noteId,adapter.documentId);
  const registry=compositionRegistry(adapter.bindingOwner,adapter.windowOwner,{create:true});
  registry.byNoteId.set(adapter.noteId,adapter);
  registry.byDocumentId.set(adapter.documentId,adapter);
  OWNER_INSTANCES.add(adapter);
  publicationCount++;
}


export const STRUCTURED_NOTE_CONTENT_ADAPTER_OWNER='StructuredNoteContentAdapter';
export const STRUCTURED_NOTE_CONTENT_ADAPTER_CONTRACT=Object.freeze({
  id:STRUCTURED_NOTE_CONTENT_ADAPTER_OWNER,
  version:'1.0.0',
  compatibility:'SEMVER',
  scope:'THIN_NOTE_CONTENT_TO_ACCEPTED_STRUCTURED_ENGINE_ADAPTATION_ONLY',
  semanticOwner:false,
  owns:Object.freeze(['note-content-identity-adaptation','canonical-structured-note-document-construction','composition-projection','non-persistent-lifecycle-receipts']),
  delegates:Object.freeze({
    structuredEngine:'StructuredDocumentDomainAdapter',
    surfaceHost:'StructuredSurfaceHost',
    noteBinding:'NoteBindingAdapter',
    stickyWindow:'StickyNoteWindowOwner',
    commands:'SemanticCommandBus',
    globalInput:'GlobalInputKeymapOwner'
  }),
  excludedOwnership:Object.freeze([
    'sticky-note-window-geometry','sticky-note-window-z-order','sticky-note-window-pin','sticky-note-window-lifecycle','os-native-always-on-top',
    'note-to-source-binding-truth','source-domain-mutation','source-deletion','persistence-storage','structured-tree-semantics','structured-mutation-semantics',
    'structured-transaction-history','structured-selection','structured-clipboard','structured-input','structured-rich-content','structured-drag-drop','dom-identity'
  ])
});

function text(value,label){
  if(typeof value!=='string'||!value.length||value.trim()!==value||/[\u0000-\u001f\u007f]/.test(value))throw Error(`MALFORMED_STRUCTURED_NOTE_CONTENT_IDENTITY:${label}`);
  return value;
}

function documentShape(document,noteId){
  if(document===undefined||document===null)return {
    id:`structured-note-content::${encodeURIComponent(noteId)}`,
    revision:'structured-note-content-r1',
    titleDirection:'auto',
    title:'ملاحظة منظّمة',
    tags:['Structured note content'],
    blocks:[]
  };
  if(!isObject(document))throw Error('MALFORMED_STRUCTURED_NOTE_DOCUMENT');
  const next=clone(document);
  text(next.id,'document.id');
  text(next.revision,'document.revision');
  if(typeof next.title!=='string'||!Array.isArray(next.blocks))throw Error('MALFORMED_STRUCTURED_NOTE_DOCUMENT');
  if(next.titleDirection!==undefined&&!['auto','rtl','ltr'].includes(next.titleDirection))throw Error('INVALID_STRUCTURED_NOTE_TITLE_DIRECTION');
  next.titleDirection=next.titleDirection||'auto';
  return next;
}

function assertNoParallelInjection(options){
  const forbidden=['structuredAdapter','documentAdapter','surfaceHost','host','commands','globalInputKeymapOwner','inputKeymapOwner','selectionOwner','clipboardOwner','transactionOwner','mutationOwner','richContentOwner','dragDropOwner'];
  const present=forbidden.filter(key=>own(options,key)&&options[key]!=null);
  if(present.length)throw Error(`PARALLEL_STRUCTURED_ENGINE_INJECTION_FORBIDDEN:${present.sort().join(',')}`);
  if(own(options,'persistenceOwner')&&options.persistenceOwner!=null)throw Error('STRUCTURED_NOTE_PERSISTENCE_OWNER_NOT_ACCEPTED');
}

function assertExpectation(binding,expectation){
  if(expectation==null)return;
  if(!isObject(expectation))throw Error('MALFORMED_NOTE_BINDING_EXPECTATION');
  if(own(expectation,'domainKind')&&expectation.domainKind!==binding.domain.kind)throw Error(`NOTE_BINDING_DOMAIN_CONTRADICTION:${expectation.domainKind}!=${binding.domain.kind}`);
  if(own(expectation,'surfaceId')&&expectation.surfaceId!==binding.domain.surfaceId)throw Error(`NOTE_BINDING_SURFACE_CONTRADICTION:${expectation.surfaceId}!=${binding.domain.surfaceId}`);
}

function assertPresentationNotCanonicalIdentity({document,binding,window}){
  const presentationIds=new Set([window.presentationId].filter(Boolean));
  if(presentationIds.has(document.id))throw Error('PRESENTATION_IDENTITY_CANNOT_BECOME_NOTE_DOCUMENT_IDENTITY');
  for(const [key,value] of Object.entries(binding.source||{})){
    if(typeof value==='string'&&presentationIds.has(value))throw Error(`PRESENTATION_IDENTITY_CANNOT_BECOME_NOTE_SOURCE_IDENTITY:${key}`);
  }
}

export function isCanonicalStructuredNoteContentAdapter(value){return !!value&&OWNER_INSTANCES.has(value)}
export function structuredNoteContentAdapterPublicationCount(){return publicationCount}
export function structuredNoteContentDocumentId(noteId){return `structured-note-content::${encodeURIComponent(text(noteId,'noteId'))}`}
export function createStructuredNoteContentDocument(noteId,{documentId=structuredNoteContentDocumentId(noteId),revision='structured-note-content-r1',title='ملاحظة منظّمة',titleDirection='auto',tags=['Structured note content'],blocks=[]}={}){
  return documentShape({id:documentId,revision,title,titleDirection,tags:clone(tags),blocks:clone(blocks)},text(noteId,'noteId'));
}

export class StructuredNoteContentAdapter{
  constructor(options={}){
    if(!isObject(options))throw Error('STRUCTURED_NOTE_CONTENT_OPTIONS_REQUIRED');
    assertNoParallelInjection(options);
    const noteId=text(options.noteId,'noteId');
    const bindingNoteId=text(options.bindingNoteId??noteId,'bindingNoteId');
    const windowNoteId=text(options.windowNoteId??noteId,'windowNoteId');
    if(bindingNoteId!==noteId)throw Error(`STRUCTURED_NOTE_CONTENT_BINDING_NOTE_ID_MISMATCH:${bindingNoteId}!=${noteId}`);
    if(windowNoteId!==noteId)throw Error(`STRUCTURED_NOTE_CONTENT_WINDOW_NOTE_ID_MISMATCH:${windowNoteId}!=${noteId}`);

    const bindingOwner=assertCanonicalNoteBindingOwner(options.bindingOwner);
    validateStickyNoteWindowOwner(options.windowOwner);const windowOwner=options.windowOwner;
    const binding=bindingOwner.descriptor(bindingNoteId);
    const window=windowOwner.window(windowNoteId);
    if(binding.noteId!==noteId)throw Error('STRUCTURED_NOTE_CONTENT_BINDING_NOTE_ID_MISMATCH');
    if(window.noteId!==noteId)throw Error('STRUCTURED_NOTE_CONTENT_WINDOW_NOTE_ID_MISMATCH');
    assertExpectation(binding,options.bindingExpectation);

    const document=documentShape(options.document,noteId);
    assertPresentationNotCanonicalIdentity({document,binding,window});
    // Reject duplicate note/document identity before constructing any second Structured engine graph.
    assertPublicationSlotAvailable(bindingOwner,windowOwner,noteId,document.id);

    // Build the accepted Structured engine only after all external composition truth is validated.
    // These instances are private to this note document and are not published until construction completes.
    const commands=new SemanticCommandBus();
    const globalInputKeymapOwner=new GlobalInputKeymapOwner({commands});
    const documentAdapter=new StructuredDocumentDomainAdapter({
      owner:STRUCTURED_NOTE_CONTENT_ADAPTER_OWNER,
      domainKind:'note-content',
      document,
      metadata:{surface:'note-content',noteId,finalStructuredNoteContentAdapter:true,persistenceTruth:'UNPROVEN_NO_OWNER'},
      sourceBinding:null,
      noteBinding:{noteId,owner:'NoteBindingAdapter',truthDelegated:true},
      commit:null,
      readOnly:false
    });
    const surfaceHost=new StructuredSurfaceHost({adapter:documentAdapter,commands,globalInputKeymapOwner,mode:options.mode??'edit'});

    this.owner=STRUCTURED_NOTE_CONTENT_ADAPTER_OWNER;
    this.contract=STRUCTURED_NOTE_CONTENT_ADAPTER_CONTRACT;
    this.noteId=noteId;
    this.bindingOwner=bindingOwner;
    this.windowOwner=windowOwner;
    this.documentAdapter=documentAdapter;
    this.surfaceHost=surfaceHost;
    this.commands=commands;
    this.globalInputKeymapOwner=globalInputKeymapOwner;
    this.executionScope=Object.freeze({kind:'PRIVATE_DOCUMENT_SCOPED_EXECUTION_INSTANCES',noteId,documentId:documentAdapter.identity().id,publishedToApplicationCommandRegistry:false,applicationGlobalListenerOwnership:false,listenerOwner:'NONE'});
    this.sequence=0;
    this.receipts=[];
    this.documentId=documentAdapter.identity().id;
    this._receipt('adapter.publish',{documentId:this.documentId,bindingOwner:bindingOwner.owner,windowOwner:windowOwner.owner,executionScope:this.executionScope,persistenceOwned:false,sourceBindingOwned:false,windowLifecycleOwned:false});
    publishCanonicalAdapter(this);
  }
  _receipt(action,detail={}){
    const receipt={sequence:++this.sequence,owner:this.owner,action,noteId:this.noteId,...clone(detail)};
    this.receipts.push(receipt);return clone(receipt);
  }
  assertCanonicalComposition(){
    if(!OWNER_INSTANCES.has(this))throw Error('NON_CANONICAL_STRUCTURED_NOTE_CONTENT_ADAPTER');
    assertCanonicalNoteBindingOwner(this.bindingOwner);
    validateStickyNoteWindowOwner(this.windowOwner);
    const binding=this.bindingOwner.descriptor(this.noteId),window=this.windowOwner.window(this.noteId);
    if(binding.noteId!==this.noteId)throw Error('STRUCTURED_NOTE_CONTENT_BINDING_NOTE_ID_MISMATCH');
    if(window.noteId!==this.noteId)throw Error('STRUCTURED_NOTE_CONTENT_WINDOW_NOTE_ID_MISMATCH');
    if(Object.getPrototypeOf(this.documentAdapter)!==StructuredDocumentDomainAdapter.prototype)throw Error('PARALLEL_STRUCTURED_DOCUMENT_OWNER_DETECTED');
    if(Object.getPrototypeOf(this.surfaceHost)!==StructuredSurfaceHost.prototype||this.surfaceHost.adapter!==this.documentAdapter)throw Error('PARALLEL_STRUCTURED_SURFACE_HOST_DETECTED');
    if(this.documentAdapter.owner!==this.owner||this.documentAdapter.domainKind!=='note-content')throw Error('STRUCTURED_NOTE_CONTENT_DOMAIN_OWNER_DRIFT');
    if(this.surfaceHost.commands!==this.commands||this.surfaceHost.globalInputKeymapOwner!==this.globalInputKeymapOwner)throw Error('STRUCTURED_NOTE_CONTENT_INPUT_COMMAND_GRAPH_DRIFT');
    if(this.executionScope.kind!=='PRIVATE_DOCUMENT_SCOPED_EXECUTION_INSTANCES'||this.executionScope.publishedToApplicationCommandRegistry!==false||this.executionScope.applicationGlobalListenerOwnership!==false)throw Error('STRUCTURED_NOTE_PRIVATE_EXECUTION_SCOPE_DRIFT');
    if(this.documentAdapter.identity().id!==this.documentId)throw Error('STRUCTURED_NOTE_CONTENT_DOCUMENT_IDENTITY_DRIFT');
    const publication=compositionRegistry(this.bindingOwner,this.windowOwner);
    if(!publication||publication.byNoteId.get(this.noteId)!==this)throw Error('STRUCTURED_NOTE_CONTENT_CANONICAL_PUBLICATION_DRIFT');
    if(publication.byDocumentId.get(this.documentId)!==this)throw Error('STRUCTURED_NOTE_CONTENT_DOCUMENT_PUBLICATION_DRIFT');
    this.documentAdapter.assertCanonicalMutationOwner();this.documentAdapter.assertCanonicalTransactionOwner();this.documentAdapter.assertCanonicalClipboardOwner();this.documentAdapter.assertCanonicalActionDescriptorOwner();this.documentAdapter.assertCanonicalDragDropOwner();this.documentAdapter.assertCanonicalInputKeymapOwner();
    assertPresentationNotCanonicalIdentity({document:this.documentAdapter.snapshot(),binding,window});
    if(this.documentAdapter.transactionOwner.saveBoundary!==null)throw Error('FABRICATED_STRUCTURED_NOTE_PERSISTENCE_OWNER');
    return true;
  }
  bindingDescriptor(){this.assertCanonicalComposition();return this.bindingOwner.descriptor(this.noteId)}
  windowDescriptor(){this.assertCanonicalComposition();return this.windowOwner.window(this.noteId)}
  snapshot(){this.assertCanonicalComposition();return this.documentAdapter.snapshot()}
  transactionDescriptor(){this.assertCanonicalComposition();return this.documentAdapter.transactionDescriptor()}
  engineIdentity(){
    this.assertCanonicalComposition();const d=this.surfaceHost.descriptor();
    return {adapterClass:this.documentAdapter.constructor.name,hostClass:this.surfaceHost.constructor.name,tree:d.treeOwner,mutation:d.mutationOwner,transaction:d.transactionOwner,selection:d.selectionOwner,clipboard:d.clipboardOwner,input:d.inputKeymapOwner,action:d.actionOwner,direction:d.directionOwner,rich:d.richContentOwner,drag:d.dragDropOwner,renderer:d.rendererOwner,presentation:d.presentationBridgeOwner,commands:d.commands,globalInput:d.globalInputOwner,executionScope:this.executionScope};
  }
  presentationBinding({windowInstanceId=null,hostKind=null,visibility=null,metadata=undefined}={}){
    this.assertCanonicalComposition();const window=this.windowOwner.window(this.noteId),separate=window.platform?.separateWindow?.active===true;
    const context={presentationId:window.presentationId,hostKind:hostKind??(separate?'separate-window':'in-page'),visibility:visibility??(window.lifecycle==='open'?'visible':'hidden')};
    if(windowInstanceId!=null)context.windowInstanceId=text(windowInstanceId,'windowInstanceId');
    if(metadata!==undefined)context.metadata=clone(metadata);
    return this.bindingOwner.projectForPresentation(this.noteId,context);
  }
  project(){
    this.assertCanonicalComposition();const before=JSON.stringify(this.documentAdapter.snapshot()),content=this.surfaceHost.project(),binding=this.presentationBinding(),window=this.windowOwner.window(this.noteId),after=JSON.stringify(this.documentAdapter.snapshot());
    if(before!==after)throw Error('STRUCTURED_NOTE_CONTENT_PROJECTION_MUTATED_DOCUMENT');
    return Object.freeze({owner:this.owner,contract:this.contract,noteId:this.noteId,documentId:this.documentId,content,binding,window,persistenceOwned:false,sourceBindingOwned:false,windowLifecycleOwned:false});
  }
  observeLifecycle(action){
    this.assertCanonicalComposition();const window=this.windowOwner.window(this.noteId),binding=this.bindingOwner.descriptor(this.noteId),document=this.documentAdapter.identity();
    return this._receipt('lifecycle.observe',{observedAction:String(action||'projection'),documentId:document.id,workingRevision:document.workingRevision,bindingAvailability:binding.availability.state,presentationId:window.presentationId,lifecycle:window.lifecycle,persistenceOwned:false,sourceBindingOwned:false,windowLifecycleOwned:false});
  }
}

export function createStructuredNoteContentAdapter(options){return new StructuredNoteContentAdapter(options)}
