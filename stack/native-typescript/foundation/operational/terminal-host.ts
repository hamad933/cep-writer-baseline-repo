import {XtermOperationalTerminalRenderer} from './xterm-renderer.js';
import {TERMINAL_RENDERER_PORT_CONTRACT} from './terminal-renderer-port.js';
export {TERMINAL_RENDERER_PORT_CONTRACT} from './terminal-renderer-port.js';
import {normalizeOperationalTerminalState,operationalInputAvailability,operationalStateData} from './presentation.js';
const html=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export const OPERATIONAL_TERMINAL_HOST_CONTRACT=Object.freeze({
  id:'OperationalTerminalPresentationHost',version:'1.0.0',compatibility:'SEMVER',
  scope:'PRESENTATION_AND_INPUT_FORWARDING_ONLY',commandInterpretation:false,outputFabrication:false
});
export class DomOperationalTerminalRenderer {
  constructor(){this.id='DomOperationalTerminalRenderer';this.contract=TERMINAL_RENDERER_PORT_CONTRACT;this.kind='DOM_FALLBACK';}
  descriptor(){return {id:this.id,kind:this.kind,contract:this.contract};}
  render({session,provider,prompt}){
    const state=normalizeOperationalTerminalState(provider,session),lines=Array.isArray(session?.lines)?session.lines:[];
    const log=lines.length?lines.map(line=>`<div class="terminal-entry"><div class="terminal-command">${html(prompt)} ${html(line.command)}</div><pre>${html(line.output)}</pre></div>`).join(''):`<p class="terminal-help">${html(provider.help||'No provider output yet.')}</p>`;
    return `<div class="terminal-state"><span class="state-token" data-state="${html(operationalStateData(state.state))}" role="status" aria-live="polite">${html(state.label)}</span>${state.detail?`<span>${html(state.detail)}</span>`:''}</div><div class="terminal-output" role="log" aria-label="${html(provider.label||provider.id||'Runtime')} output" tabindex="0" dir="ltr" data-terminal-state="${html(state.state)}">${log}</div>`;
  }
}

const resizeHandle=(edge,style,cursor,visual=false)=>`<div ${visual?'class="window-resize" ':''}data-operational-resize="${edge}" role="separator" tabindex="0" aria-label="Resize operational window ${edge}" style="${style};cursor:${cursor};touch-action:none;z-index:6"></div>`;
const resizeHandles=()=>[
  resizeHandle('left','position:absolute;left:0;top:12px;bottom:12px;width:8px','ew-resize'),
  resizeHandle('right','position:absolute;right:0;top:12px;bottom:12px;width:8px','ew-resize'),
  resizeHandle('top','position:absolute;top:0;left:12px;right:12px;height:8px','ns-resize'),
  resizeHandle('bottom','position:absolute;bottom:0;left:12px;right:12px;height:8px','ns-resize'),
  resizeHandle('top-left','position:absolute;left:0;top:0;width:14px;height:14px','nwse-resize'),
  resizeHandle('top-right','position:absolute;right:0;top:0;width:14px;height:14px','nesw-resize'),
  resizeHandle('bottom-left','position:absolute;left:0;bottom:0;width:14px;height:14px','nesw-resize'),
  resizeHandle('bottom-right','position:absolute;right:0;bottom:0;width:18px;height:18px','nwse-resize',true)
].join('');

/**
 * Visible host for OperationalSessionOwner. It owns no command semantics or runtime
 * truth. Raw input is forwarded unchanged to the injected RuntimeAdapter route and
 * output is always re-read from OperationalSessionOwner -> RuntimeAdapter.
 */
export class OperationalTerminalHost {
  constructor(root,owner,{routeInput=null,routeResize=null,routeRestart=null,onError=null,onGeometryRequest=null,onDetachRequest=null,renderer=null}={}){
    if(!root||typeof root!=='object')throw Error('TERMINAL_HOST_ROOT_REQUIRED');
    if(!owner||owner.owner!=='OperationalSessionOwner')throw Error('TERMINAL_HOST_OWNER_REQUIRED');
    this.root=root;this.owner=owner;this.routeInput=typeof routeInput==='function'?routeInput:null;this.routeResize=typeof routeResize==='function'?routeResize:null;this.routeRestart=typeof routeRestart==='function'?routeRestart:null;this.onError=typeof onError==='function'?onError:()=>{};this.onGeometryRequest=typeof onGeometryRequest==='function'?onGeometryRequest:null;this.onDetachRequest=typeof onDetachRequest==='function'?onDetachRequest:null;
    this.renderer=renderer||new XtermOperationalTerminalRenderer();if(typeof this.renderer.render!=='function')throw Error('TERMINAL_RENDERER_PORT_REQUIRED');
    this.invocation=0;this.lastError='';this.readOnly=false;this.returnFocus=null;
  }
  rendererDescriptor(){return this.renderer.descriptor?.()||{id:this.renderer.id||'TerminalRenderer',kind:'CUSTOM',contract:TERMINAL_RENDERER_PORT_CONTRACT};}
  captureReturnFocus(target=globalThis.document?.activeElement){if(target&&target!==globalThis.document?.body)this.returnFocus=target;return this.returnFocus;}
  _restoreFocus(){const target=this.returnFocus;if(target?.isConnected)queueMicrotask(()=>target.focus());}
  setReadOnly(readOnly,{render=true}={}){this.readOnly=!!readOnly;if(render)this.render();return this.readOnly;}
  _sessionPanel(tab){
    let session,unavailable='';
    try{session=this.owner.readRuntimeSession(tab.presentationId)}catch(error){unavailable=String(error?.message||error)}
    const provider=this.owner.providerDescriptor(tab.providerId)||{},identity=tab.runtimeIdentity||{};
    if(!session)return `<section class="terminal-session" data-session-panel="${html(tab.presentationId)}"><p class="state-token" data-state="error" role="status" data-runtime-unavailable>Unavailable · ${html(unavailable||'Runtime session unavailable')}</p></section>`;
    const prompt=this.owner.runtimePrompt(tab.presentationId),availability=this.readOnly?{enabled:false,reason:'Recorded Results are read only.'}:operationalInputAvailability(provider,session);
    const presentation=this.renderer.render({session,provider,prompt,presentationId:tab.presentationId,identity,readOnly:this.readOnly});
    const restart=Array.isArray(provider.capabilities)&&provider.capabilities.includes('runtime.restart')?`<button class="btn" type="button" data-terminal-restart="${html(tab.presentationId)}">Restart session</button>`:'';
    const legacyForm=this.renderer.kind==='XTERM_JS'?'':`<form data-terminal-form="${html(tab.presentationId)}"><label>${html(provider.inputLabel||'Input')} <input name="command" aria-label="Command for ${html(identity.deviceOrToolId||tab.runtimeSessionId)}" autocomplete="off" spellcheck="false" dir="ltr" ${availability.enabled?'':'disabled'}></label><button class="btn" type="submit" ${availability.enabled?'':'disabled'}>Run</button>${availability.enabled?'':`<span role="status" data-input-unavailable>${html(availability.reason)}</span>`}</form>`;
    return `<section class="terminal-session" data-session-panel="${html(tab.presentationId)}" data-runtime-session="${html(identity.sessionId||tab.runtimeSessionId)}" data-run-id="${html(identity.runId||'')}" data-device-id="${html(identity.deviceOrToolId||'')}" data-epoch="${html(identity.epoch??'')}">${presentation}${restart}${legacyForm}</section>`;
  }
  _focusTab(presentationId){queueMicrotask(()=>this.root.querySelector(`[data-tab="${CSS.escape(presentationId)}"]`)?.focus());}
  _focusInput(presentationId){queueMicrotask(()=>this.root.querySelector(`[data-terminal-form="${CSS.escape(presentationId)}"] input`)?.focus());}
  _visibleTabs(snapshot){if(snapshot.chrome.layout==='split')return snapshot.tabs.slice(0,2);return snapshot.tabs.filter(tab=>tab.presentationId===snapshot.activePresentationId);}
  _keyboardResize(edge,key){
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))return false;
    const step=20,g=this.owner.snapshot().chrome.geometry,next={...g};
    if(key==='ArrowLeft'){if(edge.includes('left')){next.x-=step;next.width+=step}else if(edge.includes('right'))next.width-=step;else return false;}
    if(key==='ArrowRight'){if(edge.includes('left')){next.x+=step;next.width-=step}else if(edge.includes('right'))next.width+=step;else return false;}
    if(key==='ArrowUp'){if(edge.includes('top')){next.y-=step;next.height+=step}else if(edge.includes('bottom'))next.height-=step;else return false;}
    if(key==='ArrowDown'){if(edge.includes('top')){next.y+=step;next.height-=step}else if(edge.includes('bottom'))next.height+=step;else return false;}
    this.owner.setGeometry(next);this.render();return true;
  }
  closePresentation(){this.owner.closeChrome();this.render();this._restoreFocus();return this.owner.snapshot();}
  render({focusTab=null,focusInput=null}={}){
    const snapshot=this.owner.snapshot(),active=snapshot.tabs.find(tab=>tab.presentationId===snapshot.activePresentationId)||null,minimized=snapshot.chrome.lifecycle==='minimized',floating=snapshot.chrome.placement==='floating';
    this.root.className='operational-host';this.root.hidden=snapshot.chrome.lifecycle==='closed';this.root.dataset.lifecycle=snapshot.chrome.lifecycle;this.root.dataset.placement=snapshot.chrome.placement;this.root.dataset.layout=snapshot.chrome.layout;this.root.dataset.mode=floating?'float':snapshot.chrome.layout==='split'?'split':'dock';this.root.dataset.readOnly=String(this.readOnly);this.root.dataset.sessionOwner=this.owner.owner;this.root.dataset.renderer=this.rendererDescriptor().id;
    if(floating)Object.assign(this.root.style,{left:`${snapshot.chrome.geometry.x}px`,top:`${snapshot.chrome.geometry.y}px`,width:`${snapshot.chrome.geometry.width}px`,height:`${snapshot.chrome.geometry.height}px`});else this.root.removeAttribute('style');
    const visible=this._visibleTabs(snapshot);
    this.root.innerHTML=`<header class="operational-head" data-operational-drag><strong>Operational sessions</strong><span data-provider-count>${snapshot.providerAttachments.length} provider attachment(s)</span>${this.readOnly?'<span class="state-token" data-state="read-only" role="status">Read only</span>':''}<button class="btn" type="button" data-placement="bottom" aria-pressed="${!floating&&snapshot.chrome.layout==='single'}">Dock</button><button class="btn" type="button" data-placement="floating" aria-pressed="${floating&&snapshot.chrome.layout==='single'}">Float</button><button class="btn" type="button" data-layout="split" aria-pressed="${snapshot.chrome.layout==='split'}">Split</button><button class="btn" type="button" data-geometry>Move / Resize</button><button class="btn" type="button" data-pin aria-pressed="${snapshot.chrome.pinned===true}">Pin</button><button class="btn" type="button" data-detach-window aria-label="Open the owning Runs surface in a separate window while preserving this terminal context">Separate</button><button class="btn" type="button" data-chrome="minimize">${minimized?'Restore':'Minimize'}</button><button class="btn" type="button" data-chrome="close" aria-label="Close session presentation">×</button></header><div role="tablist" class="session-tabs" aria-label="Operational session tabs">${snapshot.tabs.map(tab=>{const identity=tab.runtimeIdentity||{};return `<span class="session-tab"><button class="btn" type="button" role="tab" tabindex="${tab.presentationId===snapshot.activePresentationId?'0':'-1'}" aria-selected="${tab.presentationId===snapshot.activePresentationId}" data-tab="${html(tab.presentationId)}">${html(identity.deviceOrToolId||tab.runtimeSessionId)} · ${html(identity.sessionId||tab.runtimeSessionId)}</button><button class="btn" type="button" data-close-tab="${html(tab.presentationId)}" aria-label="Close ${html(identity.deviceOrToolId||tab.runtimeSessionId)} tab">×</button></span>`}).join('')}<button class="btn" type="button" data-reorder="-1" aria-label="Move selected tab left">←</button><button class="btn" type="button" data-reorder="1" aria-label="Move selected tab right">→</button></div>${this.lastError?`<p class="state-token" data-state="error" role="alert" data-runtime-error>${html(this.lastError)}</p>`:''}<div class="session-body" ${minimized?'hidden':''}>${visible.length?visible.map(tab=>this._sessionPanel(tab)).join(''):'<p>No attached session.</p>'}</div>${floating&&active?resizeHandles():''}`;
    this.root.querySelectorAll('[data-tab]').forEach(button=>{button.onclick=()=>{this.owner.selectTab(button.dataset.tab);this.render({focusTab:button.dataset.tab})};button.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=this.owner.tabsSnapshot(),current=tabs.findIndex(tab=>tab.presentationId===button.dataset.tab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;this.owner.selectTab(tabs[next].presentationId);this.render({focusTab:tabs[next].presentationId})}});
    this.root.querySelectorAll('[data-close-tab]').forEach(button=>button.onclick=()=>{this.owner.closeTab(button.dataset.closeTab);const next=this.owner.activeTab()?.presentationId||null;this.render({focusTab:next});if(!next)this._restoreFocus()});
    this.root.querySelectorAll('[data-reorder]').forEach(button=>button.onclick=()=>{const id=this.owner.activeTab()?.presentationId;if(id)this.owner.reorderTab(id,Number(button.dataset.reorder));this.render({focusTab:id})});
    this.root.querySelector('[data-chrome="minimize"]')?.addEventListener('click',()=>{if(this.owner.snapshot().chrome.lifecycle==='minimized')this.owner.restoreChrome();else this.owner.minimizeChrome();this.render({focusTab:this.owner.activeTab()?.presentationId||null})});
    this.root.querySelector('[data-chrome="close"]')?.addEventListener('click',()=>this.closePresentation());
    this.root.querySelectorAll('[data-placement]').forEach(button=>button.onclick=()=>{this.owner.setLayout('single');this.owner.setPlacement(button.dataset.placement);this.render({focusTab:this.owner.activeTab()?.presentationId||null})});
    this.root.querySelector('[data-layout="split"]')?.addEventListener('click',()=>{try{this.owner.setPlacement('bottom');this.owner.setLayout('split');this.lastError=''}catch(error){this.lastError=String(error?.message||error);this.onError(error)}this.render({focusTab:this.owner.activeTab()?.presentationId||null})});
    this.root.querySelector('[data-geometry]')?.addEventListener('click',()=>this.onGeometryRequest?.(this.owner.snapshot().chrome.geometry));
    this.root.querySelector('[data-pin]')?.addEventListener('click',()=>{this.owner.setPinned(!this.owner.snapshot().chrome.pinned);this.render({focusTab:this.owner.activeTab()?.presentationId||null})});
    this.root.querySelector('[data-detach-window]')?.addEventListener('click',()=>{try{const result=this.onDetachRequest?this.onDetachRequest(this.owner.activeTab()):this.owner.detachWindow();if(result?.ok===false)this.onError(Error(result.code||'DETACH_UNAVAILABLE'));this.render({focusTab:this.owner.activeTab()?.presentationId||null})}catch(error){this.onError(error)}});
    this.root.querySelectorAll('[data-terminal-restart]').forEach(button=>button.onclick=async()=>{const presentationId=button.dataset.terminalRestart,tab=this.owner.tab(presentationId);try{if(!this.routeRestart)throw Error('TERMINAL_RESTART_ROUTE_UNAVAILABLE');await this.routeRestart({presentationId,runtimeSessionId:tab?.runtimeSessionId,providerId:tab?.providerId});this.lastError='';this.render({focusTab:presentationId})}catch(error){this.lastError=String(error?.message||error);this.onError(error);this.render({focusTab:presentationId})}});
    this.root.querySelectorAll('form[data-terminal-form]').forEach(form=>form.onsubmit=event=>{event.preventDefault();const input=form.elements.command,raw=String(input.value??''),tab=this.owner.tab(form.dataset.terminalForm);if(!raw.trim())return;try{if(!this.routeInput)throw Error('TERMINAL_INPUT_ROUTE_UNAVAILABLE');this.routeInput({presentationId:form.dataset.terminalForm,runtimeSessionId:tab?.runtimeSessionId,runtimeIdentity:tab?.runtimeIdentity,rawInput:raw,invocationId:`operational-ui-${++this.invocation}`});this.lastError='';input.value='';this.render({focusInput:form.dataset.terminalForm})}catch(error){this.lastError=String(error?.message||error);this.onError(error);this.render({focusTab:form.dataset.terminalForm})}});
    this.root.querySelectorAll('[data-operational-resize]').forEach(handle=>handle.addEventListener('keydown',event=>{if(this._keyboardResize(handle.dataset.operationalResize,event.key)){event.preventDefault();event.stopPropagation()}}));
    for(const tab of visible){let session=null;try{session=this.owner.readRuntimeSession(tab.presentationId)}catch{}const provider=this.owner.providerDescriptor(tab.providerId)||{};if(session&&typeof this.renderer.mount==='function')this.renderer.mount({root:this.root,session,provider,providerRuntime:this.owner.providerRuntime?.(tab.providerId)||null,presentationId:tab.presentationId,readOnly:this.readOnly,routeInput:input=>{if(this.readOnly)return {ok:false,code:'READ_ONLY_PRESENTATION'};const t=this.owner.tab(input.presentationId);return this.routeInput?.({...input,runtimeSessionId:t?.runtimeSessionId,runtimeIdentity:t?.runtimeIdentity,invocationId:`operational-xterm-${++this.invocation}`})},routeResize:size=>{const t=this.owner.tab(size.presentationId);return this.routeResize?.({...size,runtimeSessionId:t?.runtimeSessionId})}}).catch(error=>{this.lastError=String(error?.message||error);this.onError(error)})}
    if(focusTab)this._focusTab(focusTab);if(focusInput)this._focusInput(focusInput);
    return snapshot;
  }
}
