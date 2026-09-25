import {NoteBindingAdapter} from '../foundation/notes/note-binding.js';
import {StickyNoteWindowOwner} from '../foundation/notes/sticky-note-window.js';
import {libraryNoteBindingInput,learnNoteBindingInput} from './note-binding-domains.js';
import {StructuredNoteContentAdapter,createStructuredNoteContentDocument} from './structured-note-content.js';

const clone=value=>structuredClone(value);
const COMPOSITION_OWNER='StructuredStickyNoteRuntimeComposition';
const LIBRARY_NOTE_FOCUS_FALLBACK_ID='workspaceViewButton';

/**
 * Controller convergence glue only.
 *
 * This object does not own note semantics. It composes the three accepted Wave 6
 * executable owners for the Library donor and exposes a narrow runtime seam to the
 * legacy presentation layer while that layer is retained as UI glue.
 */
export class StructuredStickyNoteRuntimeComposition {
  constructor({domainKind='library',surfaceId=domainKind,bindingInputFactory=domainKind==='learn'?learnNoteBindingInput:libraryNoteBindingInput,routePrefix=`PERSONAL:CEP/W02/${surfaceId}`,viewport=undefined,platformWindowBridge=undefined,inputDirectionBridge=undefined,focusFallbackId=LIBRARY_NOTE_FOCUS_FALLBACK_ID,finalRouteBound=domainKind==='library'}={}){
    if(typeof bindingInputFactory!=='function')throw Error('STRUCTURED_STICKY_BINDING_INPUT_FACTORY_REQUIRED');
    this.owner=COMPOSITION_OWNER;
    this.semanticOwner=false;
    this.domainKind=String(domainKind);this.surfaceId=String(surfaceId);this.bindingInputFactory=bindingInputFactory;this.routePrefix=String(routePrefix);this.focusFallbackId=String(focusFallbackId);this.finalRouteBound=finalRouteBound===true;
    this.hostGraph={kind:'structured-sticky-note-runtime-composition',domainKind:this.domainKind,surfaceId:this.surfaceId};
    this.bindingOwner=new NoteBindingAdapter();
    this.windowOwner=new StickyNoteWindowOwner({hostGraph:this.hostGraph,...(viewport?{viewport}:{}),...(platformWindowBridge?{capabilityBridge:platformWindowBridge}:{})});
    this.inputDirectionBridge=inputDirectionBridge||null;
    this.adapters=new Map();
  }
  has(noteId){return this.adapters.has(String(noteId));}
  ensure(note,{invokerId=null,focusReturnId=this.focusFallbackId,owningSurfaceContext={}}={}){
    if(!note||!note.id)throw Error('STRUCTURED_STICKY_RUNTIME_NOTE_REQUIRED');
    const id=String(note.id);
    if(this.adapters.has(id))return this.adapters.get(id);
    const sourceDocumentId=note.binding?.documentId??note.binding?.kuId;
    const sourceObjectId=note.binding?.objectId??note.binding?.domainRef?.objectId??sourceDocumentId;
    const sourceRange=note.binding?.sourceRange??note.binding?.selection??undefined;
    const route=note.binding?.route||this.routePrefix;
    const bindingInput=this.bindingInputFactory({
      noteId:id,
      documentId:sourceDocumentId,
      objectId:sourceObjectId,
      blockId:note.binding?.blockId??undefined,
      selection:sourceRange,
      sourceRange,
      route,
      availability:note.binding?.availability||{state:'available',evidence:{kind:`CURRENT_${this.surfaceId.toUpperCase()}_STRUCTURED_STICKY_RUNTIME_NOTE`}},
      sourceLabel:note.title||id
    });
    this.bindingOwner.bind(id,bindingInput);
    const context={surfaceId:this.surfaceId,domainKind:this.domainKind,route,documentId:sourceDocumentId??null,objectId:sourceObjectId??null,blockId:note.binding?.blockId??null,sourceRange:sourceRange??null,contextLens:owningSurfaceContext.contextLens??note.contextLens??'notes',selectionFocus:owningSurfaceContext.selectionFocus??{blockId:note.binding?.blockId??null,sourceRange:sourceRange??null},focusReturnId,...owningSurfaceContext};
    this.windowOwner.register(id,{
      geometry:{x:note.window?.x,y:note.window?.y,width:note.window?.width,height:note.window?.height},
      open:note.window?.closed!==true,
      pinned:note.window?.pinned===true,
      invokerId,
      focusReturnId,
      surfaceContext:context
    });
    const document=createStructuredNoteContentDocument(id,{
      title:note.title||'ملاحظة منظّمة',
      titleDirection:note.titleDirection??note.working?.titleDirection??'auto',
      blocks:clone(note.working?.blocks||[])
    });
    const adapter=new StructuredNoteContentAdapter({
      noteId:id,
      bindingOwner:this.bindingOwner,
      windowOwner:this.windowOwner,
      document,
      bindingExpectation:{domainKind:this.domainKind,surfaceId:this.surfaceId}
    });
    if(this.inputDirectionBridge)adapter.documentAdapter.inputDirectionResolver.bridge=this.inputDirectionBridge;
    this.adapters.set(id,adapter);
    return adapter;
  }
  adapter(noteId){const value=this.adapters.get(String(noteId));if(!value)throw Error('UNKNOWN_STRUCTURED_STICKY_NOTE_RUNTIME:'+String(noteId));return value;}
  documentAdapter(noteId){return this.adapter(noteId).documentAdapter;}
  snapshot(noteId){return this.adapter(noteId).snapshot();}
  transactionDescriptor(noteId){return this.documentAdapter(noteId).transactionDescriptor();}
  historyProjection(noteId){return this.documentAdapter(noteId).historyProjection();}
  selectionDescriptor(noteId){return this.documentAdapter(noteId).selectedFragmentIdentity();}
  bindSelection(noteId,ids,options={}){return this.documentAdapter(noteId).selectBlocks(ids,options);}
  toggleSelection(noteId,blockId){return this.documentAdapter(noteId).toggleSelectedBlock(blockId);}
  selectRange(noteId,anchorId,targetId,options={}){return this.documentAdapter(noteId).selectBlockRange(anchorId,targetId,options);}
  clearSelection(noteId){return this.documentAdapter(noteId).clearSelection();}
  surfaceHost(noteId){return this.adapter(noteId).surfaceHost;}
  actionDescriptors(noteId,surface='block-menu',context={}){return this.documentAdapter(noteId).actionDescriptors(surface,{...context,mode:'edit'});}
  executeAction(noteId,actionId,context={}){return this.documentAdapter(noteId).executeStructuredAction(actionId,{...context,mode:'edit'});}
  routeKeydown(noteId,event={},context={}){return this.surfaceHost(noteId).routeKeydown(event,context);}
  routeComposition(noteId,kind,event={},context={}){return this.surfaceHost(noteId).routeComposition(kind,event,context);}
  routeClipboard(noteId,command,payload={}){return this.surfaceHost(noteId).routeClipboard(command,payload);}
  beginPointerDrag(noteId,payload={}){return this.surfaceHost(noteId).beginPointerDrag(payload);}
  updatePointerDrag(noteId,payload={}){return this.surfaceHost(noteId).updatePointerDrag(payload);}
  commitPointerDrag(noteId,payload={}){return this.surfaceHost(noteId).commitPointerDrag(payload);}
  cancelPointerDrag(noteId,reason='cancelled'){return this.surfaceHost(noteId).cancelPointerDrag(reason);}
  setTitle(noteId,title,{label='Edit Sticky Note title',persistedDirection=undefined}={}){const value=String(title??'');if(persistedDirection!==undefined&&!['auto','rtl','ltr'].includes(persistedDirection))throw Error('INVALID_STRUCTURED_NOTE_TITLE_DIRECTION');const result=this.transact(noteId,label,doc=>{doc.title=value;if(persistedDirection!==undefined)doc.titleDirection=persistedDirection},{source:'Sticky Note title',presentation:{field:'title',persistedDirection:persistedDirection??this.snapshot(noteId).titleDirection??'auto'}});return {result,title:value,titleDirection:this.snapshot(noteId).titleDirection};}
  activate(noteId){return this.windowOwner.activate(noteId);}
  mutate(noteId,intent,options={}){return this.documentAdapter(noteId).mutateStructure(intent,options);}
  updateBlock(noteId,blockId,patch){return this.documentAdapter(noteId).updateBlock(blockId,patch);}
  transact(noteId,label,mutator,options={}){return this.documentAdapter(noteId).transact(label,mutator,options);}
  command(noteId,command,context={}){return this.documentAdapter(noteId).executeSharedCommand(command,context);}
  undo(noteId){return this.documentAdapter(noteId).undo();}
  redo(noteId){return this.documentAdapter(noteId).redo();}
  legacyBinding(noteId){
    const d=this.bindingOwner.descriptor(noteId),source=d.source||{};
    return {
      documentId:source.documentId??null,
      kuId:source.documentId??null,
      blockId:source.blockId??null,
      selection:source.sourceRange??null,
      route:d.route,
      domainRef:{surface:d.domain.surfaceId,objectId:source.objectId??source.documentId??null},
      canonicalOwner:d.owner,
      canonicalAvailability:d.availability.state
    };
  }
  legacyWindow(noteId){
    const w=this.windowOwner.window(noteId);
    return {
      x:w.geometry.x,y:w.geometry.y,width:w.geometry.width,height:w.geometry.height,
      floating:true,minimized:false,pinned:w.pinned,closed:w.lifecycle!=='open',
      presentationId:w.presentationId,zOrder:w.zOrder,canonicalOwner:w.owner
    };
  }
  projection(noteId){
    const adapter=this.adapter(noteId),document=adapter.snapshot(),transaction=adapter.transactionDescriptor(),history=adapter.documentAdapter.historyProjection(),selection=adapter.documentAdapter.selectedFragmentIdentity(),binding=this.bindingOwner.descriptor(noteId),window=this.windowOwner.window(noteId);
    return {adapter,document,transaction,history,selection,binding,window};
  }
  open(noteId,options={}){return this.windowOwner.open(noteId,options);}
  hide(noteId,options={}){return this.windowOwner.hide(noteId,options);}
  setPinned(noteId,pinned){return this.windowOwner.setPinned(noteId,pinned);}
  reclamp(noteId,options={}){return this.windowOwner.reclamp(noteId,options);}
  keyboardGeometry(noteId,event,options={}){return this.windowOwner.keyboardGeometry(noteId,event,options);}
  windowPresentation(noteId){const binding=this.bindingOwner.descriptor(noteId),source=binding.source||{},presentation=this.windowOwner.presentation(noteId);return {...presentation,source:{surfaceId:binding.domain.surfaceId,domainKind:binding.domain.kind,documentId:source.documentId??null,objectId:source.objectId??source.documentId??null,blockId:source.blockId??null,sourceRange:source.sourceRange??null,route:binding.route,availability:binding.availability.state},contentOwner:'StructuredNoteContentAdapter',semanticOwner:false};}
  motionBinding(noteId,element,options={}){return this.windowOwner.motionBinding(noteId,element,options);}
  requestSeparateWindow(noteId){const result=this.windowOwner.requestSeparateWindow(noteId);return result?.code==='UNAVAILABLE'?{...result,code:'TARGET_PLATFORM_PENDING',targetPlatformStatus:'TARGET_PLATFORM_PENDING'}:result;}
  requestAlwaysOnTop(noteId,requested=true){const result=this.windowOwner.requestAlwaysOnTop(noteId,requested);return result?.code==='UNAVAILABLE'?{...result,code:'TARGET_PLATFORM_PENDING',targetPlatformStatus:'TARGET_PLATFORM_PENDING'}:result;}
  capability({sourceAvailable=true,routeBound=this.finalRouteBound}={}){const familyAvailable=sourceAvailable===true&&!!this.bindingOwner&&!!this.windowOwner;return {enabled:familyAvailable&&routeBound===true,code:!sourceAvailable?'STRUCTURED_NOTE_SOURCE_UNAVAILABLE':!familyAvailable?'STRUCTURED_STICKY_RUNTIME_UNAVAILABLE':routeBound!==true?'FINAL_PRODUCT_ROUTE_BINDING_PENDING_D13':'AVAILABLE',reason:!sourceAvailable?'Canonical source unavailable.':!familyAvailable?'Shared Structured Sticky runtime unavailable.':routeBound!==true?'Shared Sticky family is implemented; final Product route binding remains reserved to D13.':'',availabilityOwner:this.owner,familyAvailable,finalRouteBound:routeBound===true};}
  descriptor(){return {owner:this.owner,semanticOwner:false,domainKind:this.domainKind,surfaceId:this.surfaceId,finalRouteBound:this.finalRouteBound,bindingOwner:this.bindingOwner.owner,windowOwner:this.windowOwner.owner,presentationOwner:this.windowOwner.owner,contentOwner:'StructuredNoteContentAdapter',notes:[...this.adapters.keys()],capability:this.capability()};}
}

export class LibraryNoteRuntimeComposition extends StructuredStickyNoteRuntimeComposition {
  constructor(options={}){super({domainKind:'library',surfaceId:'library',bindingInputFactory:libraryNoteBindingInput,routePrefix:'PERSONAL:CEP/W02/library',finalRouteBound:true,...options});}
}

export function createStructuredStickyNoteRuntimeComposition(options){return new StructuredStickyNoteRuntimeComposition(options);}
export function createLibraryNoteRuntimeComposition(options){return new LibraryNoteRuntimeComposition(options);}
