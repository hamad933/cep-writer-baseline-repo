import {NoteBindingAdapter} from '../foundation/notes/note-binding.js';
import {StickyNoteWindowOwner} from '../foundation/notes/sticky-note-window.js';
import {libraryNoteBindingInput} from './note-binding-domains.js';
import {StructuredNoteContentAdapter,createStructuredNoteContentDocument} from './structured-note-content.js';

const clone=value=>structuredClone(value);
const COMPOSITION_OWNER='LibraryNoteRuntimeComposition';
const LIBRARY_NOTE_FOCUS_FALLBACK_ID='workspaceViewButton';

/**
 * Controller convergence glue only.
 *
 * This object does not own note semantics. It composes the three accepted Wave 6
 * executable owners for the Library donor and exposes a narrow runtime seam to the
 * legacy presentation layer while that layer is retained as UI glue.
 */
export class LibraryNoteRuntimeComposition {
  constructor({viewport=undefined,platformWindowBridge=undefined,inputDirectionBridge=undefined}={}){
    this.owner=COMPOSITION_OWNER;
    this.semanticOwner=false;
    this.hostGraph={kind:'library-note-runtime-composition'};
    this.bindingOwner=new NoteBindingAdapter();
    this.windowOwner=new StickyNoteWindowOwner({hostGraph:this.hostGraph,...(viewport?{viewport}:{}),...(platformWindowBridge?{capabilityBridge:platformWindowBridge}:{})});
    this.inputDirectionBridge=inputDirectionBridge||null;
    this.adapters=new Map();
  }
  has(noteId){return this.adapters.has(String(noteId));}
  ensure(note,{invokerId=null,focusReturnId=LIBRARY_NOTE_FOCUS_FALLBACK_ID}={}){
    if(!note||!note.id)throw Error('LIBRARY_NOTE_RUNTIME_NOTE_REQUIRED');
    const id=String(note.id);
    if(this.adapters.has(id))return this.adapters.get(id);
    const sourceDocumentId=note.binding?.documentId??note.binding?.kuId;
    const bindingInput=libraryNoteBindingInput({
      noteId:id,
      documentId:sourceDocumentId,
      blockId:note.binding?.blockId??undefined,
      selection:note.binding?.selection??undefined,
      route:note.binding?.route||'PERSONAL:CEP/W02/library',
      availability:{state:'available',evidence:{kind:'CURRENT_LIBRARY_RUNTIME_NOTE'}},
      sourceLabel:note.title||id
    });
    this.bindingOwner.bind(id,bindingInput);
    this.windowOwner.register(id,{
      geometry:{x:note.window?.x,y:note.window?.y,width:note.window?.width,height:note.window?.height},
      open:note.window?.closed!==true,
      pinned:note.window?.pinned===true,
      invokerId,
      focusReturnId
    });
    const document=createStructuredNoteContentDocument(id,{
      title:note.title||'ملاحظة منظّمة',
      blocks:clone(note.working?.blocks||[])
    });
    const adapter=new StructuredNoteContentAdapter({
      noteId:id,
      bindingOwner:this.bindingOwner,
      windowOwner:this.windowOwner,
      document,
      bindingExpectation:{domainKind:'library',surfaceId:'library'}
    });
    if(this.inputDirectionBridge)adapter.documentAdapter.inputDirectionResolver.bridge=this.inputDirectionBridge;
    this.adapters.set(id,adapter);
    return adapter;
  }
  adapter(noteId){const value=this.adapters.get(String(noteId));if(!value)throw Error('UNKNOWN_LIBRARY_NOTE_RUNTIME:'+String(noteId));return value;}
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
  setTitle(noteId,title,{label='Edit Sticky Note title'}={}){const value=String(title??'');const result=this.transact(noteId,label,doc=>{doc.title=value},{source:'Sticky Note title',presentation:{field:'title'}});return {result,title:value};}
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
  windowPresentation(noteId){const binding=this.bindingOwner.descriptor(noteId),source=binding.source||{},presentation=this.windowOwner.presentation(noteId);return {...presentation,source:{documentId:source.documentId??null,blockId:source.blockId??null,sourceRange:source.sourceRange??null,route:binding.route,availability:binding.availability.state},contentOwner:'StructuredNoteContentAdapter',semanticOwner:false};}
  motionBinding(noteId,element,options={}){return this.windowOwner.motionBinding(noteId,element,options);}
  requestSeparateWindow(noteId){return this.windowOwner.requestSeparateWindow(noteId);}
  requestAlwaysOnTop(noteId,requested=true){return this.windowOwner.requestAlwaysOnTop(noteId,requested);}
  descriptor(){return {owner:this.owner,semanticOwner:false,bindingOwner:this.bindingOwner.owner,windowOwner:this.windowOwner.owner,presentationOwner:this.windowOwner.owner,contentOwner:'StructuredNoteContentAdapter',notes:[...this.adapters.keys()]};}
}

export function createLibraryNoteRuntimeComposition(options){return new LibraryNoteRuntimeComposition(options);}
