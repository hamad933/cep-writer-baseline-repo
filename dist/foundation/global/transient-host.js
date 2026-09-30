import {TRANSIENT_FOCUS_OWNER} from './transient-focus.js';
import {SEMANTIC_COMMAND_BUS_OWNER} from './commands.js';

export const TRANSIENT_HOST_OWNER='TransientHostOwner';
export const TRANSIENT_HOST_CONTRACT=Object.freeze({id:TRANSIENT_HOST_OWNER,version:'1.0.0',layer:'GLOBAL_FOUNDATION',focusOwner:TRANSIENT_FOCUS_OWNER,commandOwner:SEMANTIC_COMMAND_BUS_OWNER,semanticBoundary:'PRESENTATION_INTERACTION_ONLY'});

/** Generic executable host for menu/popover/modal/palette presentation. Command semantics remain in SemanticCommandBus/domain owners. */
export class TransientHostOwner {
  constructor({transientFocus,commands=null,document:doc=globalThis.document}={}){if(!transientFocus)throw Error('TRANSIENT_FOCUS_OWNER_REQUIRED');this.transients=transientFocus;this.commands=commands;this.document=doc||null;this.owner=TRANSIENT_HOST_OWNER;}
  open({id,element,invoker=null,kind='transient',modal=false,outsideDismiss=true,escapeDismiss=true,fallbackFocus=null}={}){
    if(!id||!element)throw Error('TRANSIENT_HOST_ID_ELEMENT_REQUIRED');
    if(this.transients.record(id))this.transients.close(id,{restore:false,reason:'replace',force:true});
    return this.transients.open(id,{invoker:invoker||this.document?.activeElement||null,element,kind,modal,outsideDismiss,escapeDismiss,fallbackFocus});
  }
  close(id,{restore=true,reason='explicit',force=false}={}){return this.transients.close(id,{restore,reason,force});}
  dismissTop(reason='escape',{restore=true}={}){return this.transients.dismiss(reason,{restore});}
  canDismiss(id,reason){return this.transients.canDismiss(id,reason);}
  queryCommands(query='',payload={}){return this.commands?.queryItems?.(query,payload)||[];}
  snapshot(){return {owner:TRANSIENT_HOST_OWNER,focus:this.transients.snapshot(),commands:this.commands?SEMANTIC_COMMAND_BUS_OWNER:null,semanticBoundary:TRANSIENT_HOST_CONTRACT.semanticBoundary};}
}
