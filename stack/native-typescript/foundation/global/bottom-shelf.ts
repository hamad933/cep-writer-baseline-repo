import {validateBottomDeepWorkProvider,readBottomDeepWorkProvider} from './bottom-provider-contract.js';

export const BOTTOM_DEEP_WORK_OWNER='BottomDeepWorkOwner';
export const BOTTOM_DEEP_WORK_CONTRACT=Object.freeze({
  id:BOTTOM_DEEP_WORK_OWNER,
  version:'1.0.0',
  compatibility:'SEMVER',
  scope:'GLOBAL_PRESENTATION_ONLY',
  policyRevision:'bottom-deep-work-w3d-r1'
});
export const BOTTOM_DEEP_WORK_LIFECYCLE_POLICY=Object.freeze({
  revision:'bottom-deep-work-w3d-r1',
  closed:Object.freeze({hidden:true,inert:true,interactive:false,ariaHidden:'true'}),
  open:Object.freeze({hidden:false,inert:false,interactive:true,ariaHidden:'false'}),
  preserveActiveProviderOnClose:true,
  focusEntry:'ACTIVE_PROVIDER_ENTRY',
  focusReturn:'OPEN_INVOKER_THEN_CAPTURED_FOCUS_THEN_FALLBACK',
  providerSwitch:'PRESERVE_RETURN_TARGET_AND_REFLOW_ENTRY_FOCUS'
});
export const BOTTOM_DEEP_WORK_TABS=Object.freeze(['history','compare','recovery']);
export const BOTTOM_DEEP_WORK_ACTIONS=Object.freeze([
  'bottom.open','bottom.close','bottom.toggle','bottom.provider.select','bottom.tab.select'
]);

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const safeTab=value=>BOTTOM_DEEP_WORK_TABS.includes(value)?value:'history';
const tabLabel=tab=>({history:'السجل',compare:'المقارنة',recovery:'الاسترداد'})[safeTab(tab)];
const truthFlag=value=>value===true?'ON':value===false?'OFF':'غير متاح';
const historyLabel=frame=>esc(frame?.label||'تغيير');

function structuredPresentation(projection,{tab='history',actionCapabilities={},preferences={}}={}){
  const currentTab=safeTab(tab),history=Array.isArray(projection.history)?projection.history:[],recovery=Array.isArray(projection.recovery)?projection.recovery:[];
  const committed=projection.committedRevision??'غير متاح',documentId=projection.documentId??'structured-document',working=projection.workingRevision??'?';
  if(currentTab==='history'){
    const restore=history.length>1&&actionCapabilities.historyRestoreAsNew===true
      ? `<button class="rev" data-history-restore-index="0"><strong>استعادة أقدم snapshot كمسودة جديدة</strong><div class="revid">history[0] · لا rewrite</div></button>`
      : history.length>1?`<div class="rev" data-action-unavailable="history.restoreAsNew"><strong>أقدم snapshot محفوظ</strong><div class="revid">history[0] · الاستعادة غير مربوطة في هذا المستهلك</div></div>`:'';
    return {tab:currentTab,summary:`${tabLabel(currentTab)} · ${documentId}`,html:`<div class="deepgrid"><div class="revlist"><div class="rev" aria-current="true"><strong>المراجعة الحالية</strong><div class="revid">${esc(committed)}</div></div><div class="rev"><strong>المسودة المحلية</strong><div class="revid">working ${esc(working)} · history ${Math.max(0,(projection.historyIndex??-1)+1)}/${projection.historyLength??history.length}</div></div>${restore}</div><div class="diff"><strong>تفاصيل السجل</strong><p class="subtle">${history.slice(-4).reverse().map(historyLabel).join(' · ')||'لا توجد معاملات محلية إضافية.'}</p><p class="subtle">السجل مملوك لـ <bdi dir="ltr">${esc(projection.sourceOwner)}</bdi>. العرض هنا read-only؛ والاستعادة، عند توفر مسارها، تُنشئ مسودة جديدة ولا تعيد كتابة التاريخ.</p></div></div>`};
  }
  if(currentTab==='compare')return {tab:currentTab,summary:`${tabLabel(currentTab)} · ${documentId}`,html:`<div class="diff"><strong>المقارنة</strong><p><span class="del">${esc(committed)}</span> → <span class="add">مسودة <bdi dir="ltr">${esc(documentId)}</bdi> · working ${esc(working)}</span></p><p class="subtle">مقارنة محلية صادقة بين المراجعة الملتزم بها وحالة العمل. لا تدعي سلطة revision backend، ولا تنشئ owner جديدًا للتاريخ.</p></div>`};
  const rows=recovery.length?recovery.map(record=>{const button=actionCapabilities.recoveryRestoreAsNew===true?`<button class="btn" data-recovery-restore="${esc(record.id)}">استعادة كمسودة جديدة</button>`:`<span class="subtle" data-action-unavailable="recovery.restoreAsNew">عرض فقط في هذا المستهلك</span>`;return `<article class="recovery-row"><div><strong dir="auto">${esc(record.reason||'Recovery point')}</strong><small><bdi dir="ltr">${esc(record.id)}</bdi> · history ${esc(record.sourceHistoryIndex??record.historyIndex??'?')}${record.stale?' · STALE retained':''}</small></div>${button}</article>`}).join(''):'<div class="context-warning">لا توجد نقطة Recovery لهذا المستند بعد.</div>';
  return {tab:currentTab,summary:`${tabLabel(currentTab)} · ${documentId}`,html:`<div class="recovery-owner"><div class="context-warning"><strong>Recovery معزول لـ <bdi dir="ltr">${esc(documentId)}</bdi></strong><br>Autosave: ${truthFlag(preferences.autosave)} · Recovery: ${truthFlag(preferences.recoveryEnabled)}. <bdi dir="ltr">AUTOSAVE != EXPLICIT SAVE != RECOVERY</bdi>. إيقاف Autosave لا يمسح نقاط Recovery الموجودة.</div><div class="recovery-list">${rows}</div></div>`};
}

function operationalPresentation(projection,{tab='history'}={}){
  const currentTab=safeTab(tab),sessions=Array.isArray(projection.sessions)?projection.sessions:[],events=Array.isArray(projection.events)?projection.events:[],runId=projection.runId??'runtime';
  if(currentTab==='history')return {tab:currentTab,summary:`${tabLabel(currentTab)} · ${runId}`,html:`<div class="deepgrid"><div class="revlist"><div class="rev" aria-current="true"><strong>Runtime evidence</strong><div class="revid">${esc(runId)} · ${events.length} event(s)</div></div>${sessions.slice(-3).map(session=>`<div class="rev"><strong>${esc(session.deviceId||session.id)}</strong><div class="revid">${esc(session.id)} · ${Array.isArray(session.lines)?session.lines.length:0} line(s)</div></div>`).join('')}</div><div class="diff"><strong>أحدث الأحداث</strong><p class="subtle">${events.slice(-4).map(event=>esc(event.output||event.command||event.type||event.id||'runtime event')).join(' · ')||'لا توجد أحداث مسجلة.'}</p><p class="subtle">Projection للقراءة فقط من <bdi dir="ltr">${esc(projection.sourceOwner)}</bdi>.</p></div></div>`};
  if(currentTab==='compare')return {tab:currentTab,summary:`${tabLabel(currentTab)} · ${runId}`,html:`<div class="diff"><strong>مقارنة حالة Runtime</strong><p><span class="del">Recorded / lineage ${esc(projection.lineage??'غير متاح')}</span> → <span class="add">${projection.connected===false?'Disconnected':'Connected'} · epoch ${esc(projection.epoch??'غير متاح')}</span></p><p class="subtle">هذه مقارنة evidence read-only؛ لا تنفذ أوامر ولا تغيّر session state.</p></div>`};
  return {tab:currentTab,summary:`${tabLabel(currentTab)} · ${runId}`,html:`<div class="recovery-owner"><div class="context-warning"><strong>Recovery غير متاح لهذا provider التشغيلي.</strong><br>Recorded evidence ليس Recovery، ولا يتم عرض زر استعادة وهمي. أي استرداد حقيقي يتطلب owner/capability مستقلًا ومثبتًا.</div></div>`};
}


const clone=value=>structuredClone(value);
const callable=(value,fallback)=>typeof value==='function'?value:fallback;

/**
 * Reusable Global presentation owner for the bottom/deep-work shell.
 * Canonical provider content is never cached here; readActiveProvider() delegates
 * to the active read-only provider on every call.
 */
export class BottomDeepWorkOwner {
  constructor({providers=[],focusBridge={},policy=BOTTOM_DEEP_WORK_LIFECYCLE_POLICY}={}){
    this.owner=BOTTOM_DEEP_WORK_OWNER;
    this.contract=BOTTOM_DEEP_WORK_CONTRACT;
    this.policy=policy;
    this.providers=new Map();
    this.isOpen=false;
    this.activeProviderId=null;
    this.returnFocusInvoker=null;
    this.capturedFocusTarget=null;
    this.sequence=0;
    this.lastTransition=null;
    this.activeTab='history';
    this.focusBridge={
      captureCurrent:callable(focusBridge.captureCurrent,()=>null),
      enter:callable(focusBridge.enter,()=>false),
      restore:callable(focusBridge.restore,target=>{if(target&&typeof target.focus==='function'){target.focus();return true}return false}),
      fallback:callable(focusBridge.fallback,()=>null)
    };
    for(const provider of providers)this.registerProvider(provider);
  }
  registerProvider(provider){
    const descriptor=validateBottomDeepWorkProvider(provider);
    if(this.providers.has(descriptor.id))throw Error('DUPLICATE_BOTTOM_PROVIDER:'+descriptor.id);
    this.providers.set(descriptor.id,{provider,descriptor});
    if(this.activeProviderId===null)this.activeProviderId=descriptor.id;
    return clone(descriptor);
  }
  providerDescriptor(id=this.activeProviderId){return this.providers.get(id)?.descriptor?clone(this.providers.get(id).descriptor):null;}
  providerDescriptors(){return [...this.providers.values()].map(entry=>clone(entry.descriptor));}
  _requireProvider(id=this.activeProviderId){const entry=this.providers.get(id);if(!entry)throw Error('UNKNOWN_BOTTOM_PROVIDER:'+String(id));return entry;}
  _record(action,extra={}){this.lastTransition={sequence:++this.sequence,action,owner:this.owner,policyRevision:this.policy.revision,open:this.isOpen,activeProviderId:this.activeProviderId,...clone(extra)};return clone(this.lastTransition);}
  _enterActive(reason){const entry=this._requireProvider();const entered=this.focusBridge.enter(this.activeProviderId,clone(entry.descriptor),reason)===true;return {entered,providerId:this.activeProviderId};}
  open(providerId=this.activeProviderId,{invoker=null,reason='explicit'}={}){
    const targetId=providerId??this.activeProviderId;
    this._requireProvider(targetId);
    if(!this.isOpen){
      this.returnFocusInvoker=invoker||null;
      this.capturedFocusTarget=this.focusBridge.captureCurrent()||null;
    }
    this.isOpen=true;this.activeProviderId=targetId;
    const focus=this._enterActive(reason);
    this._record('bottom.open',{reason,focusEntered:focus.entered});
    return this.snapshot();
  }
  _restoreFocus(reason){
    const attempts=[];
    const attempt=(kind,target)=>{
      if(!target){attempts.push({kind,available:false,attempted:false,succeeded:false});return false}
      try{
        const succeeded=this.focusBridge.restore(target,reason)===true;
        attempts.push({kind,available:true,attempted:true,succeeded});
        return succeeded;
      }catch(error){
        attempts.push({kind,available:true,attempted:true,succeeded:false,error:String(error?.message||error)});
        return false;
      }
    };
    if(attempt('invoker',this.returnFocusInvoker))return {restored:true,returnKind:'invoker',attempts};
    if(attempt('captured',this.capturedFocusTarget))return {restored:true,returnKind:'captured',attempts};
    let fallback=null,fallbackResolveError=null;
    try{fallback=this.focusBridge.fallback()||null}catch(error){fallbackResolveError=String(error?.message||error)}
    if(fallbackResolveError){
      attempts.push({kind:'fallback',available:false,attempted:false,succeeded:false,error:fallbackResolveError});
      return {restored:false,returnKind:'none',attempts};
    }
    if(attempt('fallback',fallback))return {restored:true,returnKind:'fallback',attempts};
    return {restored:false,returnKind:'none',attempts};
  }
  close({reason='explicit',restoreFocus=true}={}){
    if(!this.isOpen){
      this._record('bottom.close.noop',{reason,restored:false,returnKind:'none',focusReturn:{requested:restoreFocus,restored:false,returnKind:'none',attempts:[]}});
      return this.snapshot();
    }
    this.isOpen=false;
    const focusReturn=restoreFocus?this._restoreFocus(reason):{restored:false,returnKind:'none',attempts:[]};
    this.returnFocusInvoker=null;
    this.capturedFocusTarget=null;
    if(!this.policy.preserveActiveProviderOnClose)this.activeProviderId=null;
    this._record('bottom.close',{reason,restored:focusReturn.restored,returnKind:focusReturn.returnKind,focusReturn:{requested:restoreFocus,...focusReturn}});
    return this.snapshot();
  }
  switchProvider(providerId,{reason='provider-select'}={}){
    this._requireProvider(providerId);this.activeProviderId=providerId;
    const entered=this.isOpen?this._enterActive(reason).entered:false;
    this._record('bottom.provider.select',{reason,focusEntered:entered});
    return this.snapshot();
  }
  toggle(providerId=this.activeProviderId,{invoker=null,reason='toggle'}={}){
    if(this.isOpen){if(providerId&&providerId!==this.activeProviderId)return this.switchProvider(providerId,{reason});return this.close({reason,restoreFocus:true})}
    return this.open(providerId,{invoker,reason});
  }
  selectTab(tab,{reason='tab-select'}={}){this.activeTab=safeTab(tab);this._record('bottom.tab.select',{reason,tab:this.activeTab});return this.snapshot();}
  executeAction(action,payload={}){
    if(!BOTTOM_DEEP_WORK_ACTIONS.includes(action))throw Error('BOTTOM_ACTION_OUT_OF_SCOPE:'+action);
    if(action==='bottom.open')return this.open(payload.providerId??this.activeProviderId,payload);
    if(action==='bottom.close')return this.close(payload);
    if(action==='bottom.toggle')return this.toggle(payload.providerId??this.activeProviderId,payload);
    if(action==='bottom.tab.select')return this.selectTab(payload.tab,payload);
    return this.switchProvider(payload.providerId,payload);
  }
  presentationModel({tab=this.activeTab,actionCapabilities={},preferences={}}={}){
    const currentTab=safeTab(tab),snapshot=this.snapshot();
    if(!snapshot.providerCount)return {owner:this.owner,tab:currentTab,status:'UNAVAILABLE',code:'BOTTOM_PROVIDER_UNAVAILABLE',summary:'Deep work unavailable',html:'<div class="context-warning" role="status" data-bottom-unavailable>No compatible bottom/deep-work provider is registered for this surface.</div>',sourceOwner:null,readOnly:true,ownsCanonicalContent:false};
    const projection=this.readActiveProvider();
    const view=projection.family==='structured'?structuredPresentation(projection,{tab:currentTab,actionCapabilities,preferences}):operationalPresentation(projection,{tab:currentTab});
    return {owner:this.owner,providerId:projection.providerId,sourceOwner:projection.sourceOwner,readOnly:true,ownsCanonicalContent:false,...view};
  }
  renderPresentation({root=globalThis.document,tab=this.activeTab,actionCapabilities={},preferences={},presentationOwner=BOTTOM_DEEP_WORK_OWNER}={}){
    if(!root)return false;const shelf=root.querySelector?.('#bottomShelf'),content=root.querySelector?.('#bottomContent'),toggle=root.querySelector?.('#bottomToggle'),summary=root.querySelector?.('#bottomSummary'),snapshot=this.snapshot();
    if(!shelf||!content)return false;const presentation=snapshot.presentation,model=this.presentationModel({tab,actionCapabilities,preferences});
    shelf.dataset.state=snapshot.open?'open':'closed';shelf.dataset.bottomOwner=snapshot.owner;shelf.dataset.bottomPresentationOwner=presentationOwner;shelf.dataset.bottomProviderOwner=model.sourceOwner||'';shelf.dataset.bottomPresentationSource='ACCEPTED_LIBRARY_DONOR_EXTRACTED';
    shelf.dataset.bottomAvailability=snapshot.availability.status;
    if(toggle){toggle.setAttribute('aria-expanded',String(snapshot.open));toggle.disabled=!snapshot.providerCount;toggle.setAttribute('aria-disabled',String(!snapshot.providerCount));}
    content.hidden=presentation.hidden;content.inert=presentation.inert;content.setAttribute('aria-hidden',presentation.ariaHidden);
    root.querySelectorAll?.('.bottomtabs [data-action=bottom-tab]')?.forEach(button=>{const on=button.dataset.value===model.tab;button.classList.toggle('active',on);button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;});
    if(!snapshot.providerCount){content.innerHTML='';if(summary)summary.textContent=model.summary;return {snapshot,model};}
    if(!snapshot.open){content.innerHTML='';if(summary)summary.textContent='مغلق — افتحه للسجل أو المقارنة أو الاسترداد';return {snapshot,model};}
    content.innerHTML=model.html;if(summary)summary.textContent=model.summary;return {snapshot,model};
  }
  presentationState(){return clone(this.isOpen?this.policy.open:this.policy.closed);}
  readActiveProvider(){const entry=this._requireProvider();return readBottomDeepWorkProvider(entry.provider);}
  snapshot(){
    const presentation=this.presentationState();
    return {
      owner:this.owner,contract:this.contract,policyRevision:this.policy.revision,
      open:this.isOpen,activeProviderId:this.activeProviderId,
      activeProvider:this.providerDescriptor(),providerCount:this.providers.size,
      availability:this.providers.size?{status:'AVAILABLE',code:'BOTTOM_PROVIDER_AVAILABLE',enabled:true}:{status:'UNAVAILABLE',code:'BOTTOM_PROVIDER_UNAVAILABLE',enabled:false},
      presentation,activeTab:this.activeTab,lastTransition:this.lastTransition?clone(this.lastTransition):null,
      actions:[...BOTTOM_DEEP_WORK_ACTIONS]
    };
  }
}
