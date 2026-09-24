export const TRANSIENT_FOCUS_OWNER='TransientFocusOwner';
export const TRANSIENT_FOCUS_CONTRACT=Object.freeze({id:TRANSIENT_FOCUS_OWNER,version:'1.2.0',dismissalPolicyTag:'topmost-first-v3',presentationPolicyTag:'donor-modal-focus-v2'});

const focusable=target=>Boolean(target&&typeof target.focus==='function'&&target.isConnected!==false&&target.disabled!==true&&target.getAttribute?.('aria-hidden')!=='true');
const visible=element=>Boolean(element&&element.hidden!==true&&element.getAttribute?.('aria-hidden')!=='true'&&element.offsetParent!==null);
const focusableElements=root=>root?.querySelectorAll?[...root.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(visible):[];
const defer=callback=>typeof globalThis.requestAnimationFrame==='function'?globalThis.requestAnimationFrame(callback):setTimeout(callback,0);

const invokerIdentity=target=>{
  if(!target?.tagName)return null;
  const tag=String(target.tagName).toLowerCase(),id=target.id||'';
  if(id)return {id,kind:'id'};
  for(const name of ['data-foundation-command','data-shell-destination','data-shell-history','data-action','data-region']){
    const value=target.getAttribute?.(name);if(value)return {tag,name,value,kind:name};
  }
  return null;
};
const invokerAncestors=target=>{const list=[];let current=target?.parentElement||null;while(current){list.push(current);current=current.parentElement;}return list;};
const contains=(scope,candidate,doc)=>scope===doc||scope===candidate||scope?.contains?.(candidate)===true;
const resolveInvokerIdentity=(identity,scope,doc,{requireUnique=false}={})=>{
  if(!identity||!scope?.querySelectorAll&&!scope?.querySelector)return null;
  if(identity.id){const candidate=doc?.getElementById?.(identity.id)||null;return candidate&&contains(scope,candidate,doc)?candidate:null;}
  if(!identity.tag||!identity.name)return null;
  const matches=[...(scope.querySelectorAll?.(`${identity.tag}[${identity.name}]`)||[])].filter(candidate=>candidate.getAttribute?.(identity.name)===identity.value);
  if(requireUnique&&matches.length!==1)return null;
  return matches[0]||null;
};
const attributeSnapshot=element=>({
  inert:element?.inert===true,
  hadAriaHidden:element?.hasAttribute?.('aria-hidden')===true,
  ariaHidden:element?.getAttribute?.('aria-hidden')??null
});
const restoreAttributeSnapshot=(element,snapshot)=>{
  if(!element||!snapshot)return;
  element.inert=snapshot.inert===true;
  if(snapshot.hadAriaHidden)element.setAttribute?.('aria-hidden',snapshot.ariaHidden??'');
  else element.removeAttribute?.('aria-hidden');
};

/** Canonical Global owner for transient ordering, donor-grade modal isolation, focus containment and deterministic focus return. */
export class TransientFocusOwner {
  constructor({fallbackFocus=null,document:doc=globalThis.document,isolationRoot='.app',stickyHost='#stickyNoteHost',modalExemptClass='backdrop'}={}){
    this.records=new Map();this.stack=[];this.fallbackFocus=fallbackFocus;this.lastDismissal=null;this.document=doc||null;this.isolationRoot=isolationRoot;this.stickyHost=stickyHost;this.modalExemptClass=modalExemptClass;this.focusBindings=new WeakMap();this.modalIsolationSnapshots=new Map();
  }
  open(id,invokerOrOptions=null,options={}){
    if(!id)throw Error('TRANSIENT_ID_REQUIRED');
    if(this.records.has(id))throw Error('DUPLICATE_TRANSIENT_ID:'+id);
    const structured=invokerOrOptions&&typeof invokerOrOptions==='object'&&('invoker' in invokerOrOptions||'modal' in invokerOrOptions||'outsideDismiss' in invokerOrOptions||'escapeDismiss' in invokerOrOptions||'kind' in invokerOrOptions||'element' in invokerOrOptions);
    const config=structured?invokerOrOptions:{...options,invoker:invokerOrOptions};
    const record={id,kind:config.kind||'transient',invoker:config.invoker||null,element:config.element||null,modal:config.modal===true,outsideDismiss:config.outsideDismiss!==false,escapeDismiss:config.escapeDismiss!==false,fallbackFocus:config.fallbackFocus||null,onClose:typeof config.onClose==='function'?config.onClose:null,invokerIdentity:invokerIdentity(config.invoker),invokerAncestors:invokerAncestors(config.invoker)};
    this.records.set(id,record);this.stack.push(id);this.present(record);return id;
  }
  active(){return [...this.stack];}
  top(){const id=this.stack.at(-1);return id?this.records.get(id)||null:null;}
  record(id){return this.records.get(id)||null;}
  canDismiss(id,reason='explicit'){
    const record=this.records.get(id);if(!record)return false;
    if((reason==='escape'||reason==='outside')&&this.stack.at(-1)!==id)return false;
    if(reason==='escape'&&!record.escapeDismiss)return false;
    if(reason==='outside'&&!record.outsideDismiss)return false;
    return true;
  }
  isolationTargets(){
    const doc=this.document;if(!doc?.querySelector)return [];
    const targets=[],app=doc.querySelector(this.isolationRoot),notes=doc.querySelector(this.stickyHost);
    if(app?.children)for(const child of [...app.children])if(!child.classList?.contains(this.modalExemptClass))targets.push(child);
    if(notes&&!targets.includes(notes))targets.push(notes);
    return targets;
  }
  setModalIsolation(on){
    const targets=this.isolationTargets();
    if(on){
      for(const target of targets){
        if(!this.modalIsolationSnapshots.has(target))this.modalIsolationSnapshots.set(target,attributeSnapshot(target));
        target.inert=true;target.setAttribute?.('aria-hidden','true');
      }
      return targets.length>0;
    }
    for(const [target,snapshot] of this.modalIsolationSnapshots){restoreAttributeSnapshot(target,snapshot);}
    this.modalIsolationSnapshots.clear();return targets.length>0;
  }
  syncModalIsolation(){const active=this.stack.some(id=>this.records.get(id)?.modal===true);this.setModalIsolation(active);return active;}
  focusInitial(root){
    const first=focusableElements(root)[0]||root?.querySelector?.('.dialog');
    if(first&&first.matches?.('.dialog')&&!first.hasAttribute?.('tabindex'))first.tabIndex=-1;
    first?.focus?.();return first||null;
  }
  trapFocusWithin(event,root){
    if(event?.key!=='Tab'||!root)return false;
    const list=focusableElements(root);
    if(!list.length){event.preventDefault?.();this.focusInitial(root);return true;}
    const first=list[0],last=list.at(-1),active=this.document?.activeElement||globalThis.document?.activeElement;
    if(event.shiftKey&&active===first){event.preventDefault?.();last.focus?.();defer(()=>last.focus?.());return true;}
    if(!event.shiftKey&&active===last){event.preventDefault?.();first.focus?.();defer(()=>first.focus?.());return true;}
    if(!root.contains?.(active)){event.preventDefault?.();first.focus?.();return true;}
    return false;
  }
  unbindFocusContainment(recordOrRoot){
    const root=recordOrRoot?.element||recordOrRoot;if(!root)return false;
    const binding=this.focusBindings.get(root);if(!binding)return false;
    root.removeEventListener?.('keydown',binding.keydown);root.removeEventListener?.('focusout',binding.focusout);this.focusBindings.delete(root);return true;
  }
  bindFocusContainment(record){
    const root=record?.element;if(!record?.modal||!root?.addEventListener)return false;
    const existing=this.focusBindings.get(root);
    if(existing?.recordId===record.id)return false;
    if(existing)this.unbindFocusContainment(root);
    const keydown=event=>{const live=this.record(record.id);if(live?.element===root)this.trapFocusWithin(event,root);};
    const focusout=()=>defer(()=>{const live=this.record(record.id);if(!live||live.element!==root||root.hidden||root.contains?.(this.document?.activeElement))return;this.focusInitial(root);});
    root.addEventListener('keydown',keydown);root.addEventListener('focusout',focusout);this.focusBindings.set(root,{recordId:record.id,keydown,focusout});return true;
  }
  present(recordOrId){
    const record=typeof recordOrId==='string'?this.record(recordOrId):recordOrId;if(!record)return false;
    if(record.element)record.element.hidden=false;
    if(record.modal){this.syncModalIsolation();this.bindFocusContainment(record);this.focusInitial(record.element);}
    return true;
  }
  reboundInvoker(record){
    if(!record?.invokerIdentity)return null;
    for(const scope of record.invokerAncestors||[]){
      if(scope?.isConnected===false||!scope?.querySelectorAll)continue;
      const rebound=resolveInvokerIdentity(record.invokerIdentity,scope,this.document);
      if(focusable(rebound))return {target:rebound,kind:'invoker-rebound'};
    }
    const liveRoot=this.document?.querySelector?.(this.isolationRoot)||null;
    if(liveRoot?.isConnected!==false){
      const rebound=resolveInvokerIdentity(record.invokerIdentity,liveRoot,this.document,{requireUnique:true});
      if(focusable(rebound))return {target:rebound,kind:'invoker-rebound-live-root'};
    }
    const rebound=resolveInvokerIdentity(record.invokerIdentity,this.document,this.document,{requireUnique:true});
    return focusable(rebound)?{target:rebound,kind:'invoker-rebound-document'}:null;
  }
  close(id,{restore=true,reason='explicit',force=false}={}){
    const record=this.records.get(id);if(!record)return false;
    if(!force&&!this.canDismiss(id,reason))return false;
    this.records.delete(id);this.stack=this.stack.filter(value=>value!==id);this.unbindFocusContainment(record);
    if(record.element)record.element.hidden=true;
    const modalStillOpen=this.syncModalIsolation();record.onClose?.({id,reason});
    let focusTarget=null,focusTargetKind='none';
    if(restore&&!modalStillOpen){
      if(focusable(record.invoker)){focusTarget=record.invoker;focusTargetKind='invoker';}
      else {const rebound=this.reboundInvoker(record);if(rebound){focusTarget=rebound.target;focusTargetKind=rebound.kind;}}
      if(!focusTarget){const fallback=typeof record.fallbackFocus==='function'?record.fallbackFocus():record.fallbackFocus||(typeof this.fallbackFocus==='function'?this.fallbackFocus(record):this.fallbackFocus);if(focusable(fallback)){focusTarget=fallback;focusTargetKind='fallback';}}
      focusTarget?.focus?.();
    }
    this.lastDismissal={id,reason,restored:!!focusTarget,focusTargetKind,owner:TRANSIENT_FOCUS_OWNER,policyTag:TRANSIENT_FOCUS_CONTRACT.dismissalPolicyTag};return true;
  }
  dismiss(reason='escape',{restore=true}={}){const record=this.top();if(!record||!this.canDismiss(record.id,reason))return false;return this.close(record.id,{restore,reason});}
  closeAll({restore=false,reason='close-all'}={}){const ids=[...this.stack].reverse();for(const id of ids)this.close(id,{restore,reason,force:true});return ids;}
  snapshot(){return {owner:TRANSIENT_FOCUS_OWNER,active:this.active(),top:this.top()?.id||null,modal:this.top()?.modal===true,lastDismissal:this.lastDismissal?{...this.lastDismissal}:null,presentationPolicyTag:TRANSIENT_FOCUS_CONTRACT.presentationPolicyTag,isolationSnapshotCount:this.modalIsolationSnapshots.size};}
}
