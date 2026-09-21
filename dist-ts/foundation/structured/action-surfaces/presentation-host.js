import {TransientHostOwner,TRANSIENT_HOST_OWNER} from '../../global/transient-host.js';
import {TRANSIENT_FOCUS_OWNER} from '../../global/transient-focus.js';

export const STRUCTURED_ACTION_SURFACE_PRESENTATION_HOST='StructuredActionSurfacePresentationHost';
export const STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT=Object.freeze({
  id:STRUCTURED_ACTION_SURFACE_PRESENTATION_HOST,
  version:'1.0.0',
  layer:'STRUCTURED_PRESENTATION_BINDING',
  semanticOwner:false,
  actionOwner:'StructuredActionDescriptorOwner',
  insertionOwner:'StructuredInsertionTargetOwner',
  selectionOwner:'StructuredSelectionKernel',
  transientOwner:TRANSIENT_HOST_OWNER,
  focusOwner:TRANSIENT_FOCUS_OWNER,
  confirmationOwner:'ConfirmationSafetyHost',
  donorPresentation:'W02_LIBRARY_EDITOR_v1.2.17'
});

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const viewport=win=>{const vv=win?.visualViewport;return {left:vv?.offsetLeft||0,top:vv?.offsetTop||0,width:vv?.width||win?.innerWidth||1440,height:vv?.height||win?.innerHeight||900};};
const focusable=element=>element?.querySelector?.('button:not([disabled]):not([hidden]),summary:not([hidden]),input:not([disabled]):not([hidden]),[tabindex]:not([tabindex="-1"])')||null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

/**
 * Bounded Structured Presentation host. It owns no action, selection, insertion,
 * confirmation, mutation, transaction, command-availability or focus semantics.
 * It reuses G2 TransientHostOwner/TransientFocusOwner for lifecycle + focus return
 * and only preserves the accepted Library donor's surface placement/presentation.
 */
export class StructuredActionSurfacePresentationHost{
  constructor({transientFocus,document:doc=globalThis.document,window:win=globalThis.window}={}){
    if(!transientFocus||transientFocus.constructor?.name!=='TransientFocusOwner')throw Error('PW08_G2_TRANSIENT_FOCUS_OWNER_REQUIRED');
    this.owner=STRUCTURED_ACTION_SURFACE_PRESENTATION_HOST;
    this.contract=STRUCTURED_ACTION_SURFACE_PRESENTATION_CONTRACT;
    this.document=doc;this.window=win;
    this.transient=new TransientHostOwner({transientFocus,document:doc});
    this.records=new Map();
  }
  annotate(element,surface,{actionOwner='StructuredActionDescriptorOwner',selectionOwner=null,insertionOwner=null,confirmationOwner=null}={}){
    if(!element)return element;
    element.dataset.structuredActionPresentation=STRUCTURED_ACTION_SURFACE_PRESENTATION_HOST;
    element.dataset.structuredActionSurface=surface;
    element.dataset.transientOwner=TRANSIENT_HOST_OWNER;
    element.dataset.focusOwner=TRANSIENT_FOCUS_OWNER;
    if(actionOwner)element.dataset.actionDescriptorOwner=actionOwner;
    if(selectionOwner)element.dataset.selectionOwner=selectionOwner;
    if(insertionOwner)element.dataset.insertionOwner=insertionOwner;
    if(confirmationOwner)element.dataset.confirmationOwner=confirmationOwner;
    return element;
  }
  _fallback(invoker,fallback){return ()=>{if(invoker?.isConnected)return invoker;const value=typeof fallback==='function'?fallback():fallback;return value?.isConnected?value:null;};}
  _release(id,{reason='external'}={}){const record=this.records.get(id);if(!record)return false;this.records.delete(id);record.onClose?.({id,reason});return true;}
  _register(id,{element,invoker=null,kind='structured-action-surface',modal=false,outsideDismiss=true,escapeDismiss=true,fallbackFocus=null,onClose=null}={}){
    if(!element)return false;
    const existing=this.records.get(id),live=this.transient.transients.record?.(id);
    if(existing&&!live)this._release(id,{reason:'canonical-owner-closed'});
    const current=this.records.get(id);
    if(current?.element===element){current.invoker=invoker||current.invoker;current.onClose=onClose||current.onClose;return true;}
    if(current)this.close(id,{restore:false,reason:'replace'});
    this.records.set(id,{id,element,invoker,onClose});
    this.transient.open({id,element,invoker,kind,modal,outsideDismiss,escapeDismiss,fallbackFocus:this._fallback(invoker,fallbackFocus)});
    const canonicalRecord=this.transient.transients.record?.(id);
    if(canonicalRecord)canonicalRecord.onClose=event=>this._release(id,{reason:event?.reason||'canonical-owner-close'});
    return true;
  }
  placeAnchored(element,rect,{gap=6,padding=8,center=false}={}){
    if(!element||!rect)return false;
    const vp=viewport(this.window),width=Math.min(element.offsetWidth||300,Math.max(1,vp.width-padding*2)),height=Math.min(element.offsetHeight||260,Math.max(1,vp.height-padding*2));
    const left=center?rect.left+((rect.width??(rect.right-rect.left))-width)/2:rect.left;
    let x=clamp(left,vp.left+padding,Math.max(vp.left+padding,vp.left+vp.width-width-padding));
    let y=rect.bottom+gap;
    if(y+height>vp.top+vp.height-padding)y=Math.max(vp.top+padding,rect.top-height-gap);
    y=clamp(y,vp.top+padding,Math.max(vp.top+padding,vp.top+vp.height-height-padding));
    element.style.left=`${Math.round(x)}px`;element.style.top=`${Math.round(y)}px`;return true;
  }
  placeSelection(element,rect){
    if(!element||!rect)return false;
    const vp=viewport(this.window),width=element.offsetWidth||330,height=element.offsetHeight||40;
    if(rect.bottom<vp.top||rect.top>vp.top+vp.height||rect.right<vp.left||rect.left>vp.left+vp.width){element.hidden=true;return false;}
    let x=clamp(rect.left+((rect.width??(rect.right-rect.left))-width)/2,vp.left+6,Math.max(vp.left+6,vp.left+vp.width-width-6));
    let y=rect.top-height-8;if(y<vp.top+6)y=rect.bottom+8;
    y=clamp(y,vp.top+6,Math.max(vp.top+6,vp.top+vp.height-height-6));
    element.style.left=`${Math.round(x)}px`;element.style.top=`${Math.round(y)}px`;return true;
  }
  renderGenericMenu({title='Context actions',items=[],dismissLabel='Close'}={}){
    return `<div class="menutitle">${esc(title)}</div>${items.map(item=>`<button class="menuitem" role="menuitem" data-foundation-command="${esc(item.id)}" ${item.enabled===false?'disabled':''} title="${esc(item.reason||'')}"><span aria-hidden="true">•</span><span>${esc(item.label||item.id)}${item.reason?`<small>${esc(item.reason)}</small>`:''}</span></button>`).join('')}<button class="menuitem" type="button" data-menu-dismiss>${esc(dismissLabel)}</button>`;
  }
  openGenericMenu({element,invoker,anchorRect,fallbackFocus=null,onClose=null,actionOwner='SemanticCommandBus'}={}){
    this.annotate(element,'generic-action-menu',{actionOwner});
    this._register('pw08:generic-action-menu',{element,invoker,kind:'menu',fallbackFocus,onClose});
    this.placeAnchored(element,anchorRect||invoker?.getBoundingClientRect?.());
    return true;
  }
  openBlockMenu({element,invoker,anchorRect,fallbackFocus=null,onClose=null}={}){
    this.annotate(element,'block-menu');
    this._register('pw08:block-menu',{element,invoker,kind:'menu',fallbackFocus,onClose});
    this.placeAnchored(element,anchorRect||invoker?.getBoundingClientRect?.());
    return true;
  }
  openInsertionPalette({element,invoker,anchorRect,fallbackFocus=null,onClose=null}={}){
    this.annotate(element,'insertion-palette',{insertionOwner:'StructuredInsertionTargetOwner'});
    this._register('pw08:insertion-palette',{element,invoker,kind:'palette',fallbackFocus,onClose});
    this.placeAnchored(element,anchorRect||invoker?.getBoundingClientRect?.());
    return true;
  }
  syncSelectionToolbar({element,anchorRect,invoker=null,onClose=null}={}){
    this.annotate(element,'selection-toolbar',{selectionOwner:'StructuredSelectionKernel'});
    this._register('pw08:selection-toolbar',{element,invoker,kind:'selection-toolbar',outsideDismiss:true,escapeDismiss:true,onClose});
    if(this.placeSelection(element,anchorRect))return true;
    this.close('pw08:selection-toolbar',{restore:false,reason:'selection-outside-viewport'});
    return false;
  }
  syncBlockSelectionToolbar({element,anchorRect,invoker=null,onClose=null}={}){
    this.annotate(element,'block-selection-toolbar',{selectionOwner:'StructuredSelectionKernel'});
    this._register('pw08:block-selection-toolbar',{element,invoker,kind:'selection-toolbar',outsideDismiss:true,escapeDismiss:true,onClose});
    if(this.placeSelection(element,anchorRect))return true;
    this.close('pw08:block-selection-toolbar',{restore:false,reason:'selection-outside-viewport'});
    return false;
  }
  bindConfirmation({element,invoker=null,onClose=null}={}){
    if(!element)return false;
    this.annotate(element,'destructive-confirmation',{confirmationOwner:'ConfirmationSafetyHost'});
    this._register('pw08:destructive-confirmation',{element,invoker,kind:'confirmation',modal:true,outsideDismiss:false,escapeDismiss:false,onClose});
    this.placeAnchored(element,invoker?.getBoundingClientRect?.()||{left:(this.window?.innerWidth||1440)/2,top:(this.window?.innerHeight||900)/2,right:(this.window?.innerWidth||1440)/2,bottom:(this.window?.innerHeight||900)/2},{gap:7});
    return true;
  }
  close(id,{restore=true,reason='explicit'}={}){
    const record=this.records.get(id);if(!record)return false;
    const closed=this.transient.close(id,{restore,reason,force:true});
    if(!closed)this._release(id,{reason});
    return closed;
  }
  closeSurface(surface,options={}){return this.close(`pw08:${surface}`,options);}
  topRecord(){const top=this.transient.transients.top?.();return top&&String(top.id).startsWith('pw08:')?top:null;}
  blocksDismissal(reason='escape'){const top=this.topRecord();return !!top&&!this.transient.canDismiss(top.id,reason);}
  dismissTop(reason='escape',{restore=true}={}){
    const top=this.topRecord();if(!top)return false;
    if(!this.transient.canDismiss(top.id,reason))return false;
    return this.close(top.id,{restore,reason});
  }
  outsidePointer(target,{restore=false}={}){
    const top=this.transient.transients.top?.();if(!top||!String(top.id).startsWith('pw08:')||!this.transient.canDismiss(top.id,'outside'))return false;
    if(top.element?.contains?.(target)||top.invoker?.contains?.(target))return false;
    return this.close(top.id,{restore,reason:'outside'});
  }
  focusFirst(surface){const record=this.records.get(`pw08:${surface}`),target=focusable(record?.element);target?.focus?.({preventScroll:true});return target||null;}
  snapshot(){return Object.freeze({owner:this.owner,contract:this.contract,transient:this.transient.snapshot(),active:[...this.records.keys()]});}
}
