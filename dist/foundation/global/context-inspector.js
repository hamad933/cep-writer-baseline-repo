import {CONTEXT_DESCRIPTOR_CONTRACT,describeContextProvider} from './context-descriptor-contract.js';

export const CONTEXT_INSPECTOR_OWNER_ID='ContextInspectorHost';
export const CONTEXT_INSPECTOR_CONTRACT=Object.freeze({
  id:CONTEXT_INSPECTOR_OWNER_ID,
  version:'1.0.0',
  compatibility:'SEMVER',
  descriptorContract:CONTEXT_DESCRIPTOR_CONTRACT.id,
  focusOwner:'TransientFocusOwner',
  stateClass:'PRESENTATION_ONLY',
  presentation:'DONOR_DERIVED_SHARED_PROJECTOR',
  policyTag:'context-inspector-host-v1'
});

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const clone=value=>structuredClone(value);
const POLICY_KEYS=Object.freeze(['density','showDomainOwner','showRevision','emptyValue']);
const DEFAULT_POLICY=Object.freeze({density:'comfortable',showDomainOwner:false,showRevision:true,emptyValue:'—'});
const PRESENTATION_STATE_KEYS=Object.freeze(['ownerId','open','activeProviderId','activeDescriptorId','activeLensId','activeTabId','pinned','lastTransition','policyTag']);
const PRESENTATION_BRIDGE_KEY='__CEP_CONTEXT_INSPECTOR_PRESENTATION__';

const policyTag=policy=>`density=${policy.density};owner=${policy.showDomainOwner?'1':'0'};revision=${policy.showRevision?'1':'0'};empty=${policy.emptyValue}`;
const validatePolicy=policy=>{
  if(!['comfortable','compact'].includes(policy.density))throw Error('CONTEXT_POLICY_DENSITY_INVALID');
  if(typeof policy.showDomainOwner!=='boolean'||typeof policy.showRevision!=='boolean')throw Error('CONTEXT_POLICY_BOOLEAN_INVALID');
  if(typeof policy.emptyValue!=='string')throw Error('CONTEXT_POLICY_EMPTY_VALUE_INVALID');
  return Object.freeze({...policy});
};
const focusOwnerCompatible=owner=>owner&&typeof owner.open==='function'&&typeof owner.close==='function'&&typeof owner.record==='function';
const normalizedLenses=lenses=>(Array.isArray(lenses)?lenses:[]).filter(lens=>lens&&typeof lens.id==='string'&&typeof lens.label==='string');

class ContextInspectorPresentation {
  constructor(){this.ownerId=CONTEXT_INSPECTOR_OWNER_ID;this.semanticHost=null;this.policyTag='accepted-library-donor-context-presentation-v1';}
  attachSemanticHost(host){if(!host||host.ownerId!==this.ownerId)throw Error('CONTEXT_PRESENTATION_HOST_INVALID');this.semanticHost=host;return this;}
  activeDescriptor(context={}){
    const host=this.semanticHost,state=host?.snapshot?.();if(!host||!state?.activeProviderId)return null;
    const result=host.inspect(state.activeProviderId,context);return result?.ok?result.descriptor:null;
  }
  syncSemanticState({lensId=null,pinned=false,context={}}={}){
    const host=this.semanticHost,state=host?.snapshot?.();if(!host||!state?.activeProviderId)return null;
    const activated=host.activate(state.activeProviderId,context);if(!activated?.ok)return activated;
    const descriptor=host.inspect(state.activeProviderId,context)?.descriptor;
    if(lensId&&descriptor?.lenses?.some(lens=>lens.id===lensId))host.selectLens(lensId,context);
    host.setPinned(pinned===true);return host.snapshot();
  }
  renderLensTabs(lenses,activeLensId,{iconHTML=()=>'',controlsId='inspectorContent'}={}){
    return normalizedLenses(lenses).map(item=>{const on=item.id===activeLensId,icon=iconHTML(item.id)||'';return `<button class="lensbtn${on?' active':''}" id="context-tab-${esc(item.id)}" type="button" role="tab" data-lens="${esc(item.id)}" data-context-host-action="inspector.lens" data-context-lens="${esc(item.id)}" aria-selected="${on}" aria-controls="${esc(controlsId)}" aria-label="${esc(item.label)}" title="${esc(item.label)}" tabindex="${on?0:-1}">${icon}<span class="lenslabel">${esc(item.label)}</span></button>`}).join('');
  }
  syncScopeButtons(buttons,{activeScope='ku',blockAvailable=false,selectionAvailable=false}={}){
    for(const button of Array.from(buttons||[])){const value=button?.dataset?.value,on=value===activeScope;button.classList?.toggle('active',on);button.setAttribute?.('aria-pressed',String(on));if(value==='block')button.disabled=!blockAvailable;if(value==='selection')button.disabled=!selectionAvailable;}
    return true;
  }
  renderIdentity({lensLabel='',scopeLabel='',subjectHTML='',intro='',pinned=false,pinIconHTML='',showClose=false}={}){
    const close=showClose?`<button type="button" class="btn iconbtn context-close-control" data-context-host-action="inspector.close" aria-label="Close context inspector">×</button>`:'';
    return `<header class="context-identity" data-context-presentation-owner="${esc(this.ownerId)}"><div class="context-eyebrow"><span>${esc(lensLabel)}</span><span class="scopechip">${esc(scopeLabel)}</span><span class="context-host-actions"><button type="button" class="context-pin-control" data-context-pin data-context-host-action="inspector.toggle-pin" aria-pressed="${pinned}" aria-label="${pinned?'Unpin context':'Pin context'}">${pinIconHTML}</button>${close}</span></div><strong dir="auto">${subjectHTML}</strong><span class="lenssubject">${pinned?'مثبت · ':''}${esc(intro)}</span></header>`;
  }
  applyDonorPanel(host,{scope='ku',lensId='overview',identityHTML='',bodyHTML=''}={}){
    if(!host)return false;host.dataset.contextScope=scope;host.dataset.lens=lensId;host.dataset.contextPresentationOwner=this.ownerId;host.dataset.contextPresentationProvenance='AcceptedLibraryDonor';host.setAttribute('role','tabpanel');host.setAttribute('tabindex','0');host.setAttribute('aria-labelledby',`context-tab-${lensId}`);host.innerHTML=identityHTML+bodyHTML;return true;
  }
  renderDescriptor({descriptor,lens,tab,state,policy,ownerId=this.ownerId}={}){
    if(!descriptor||!lens||!tab)return `<aside class="context-inspector" data-context-inspector-owner="${esc(ownerId)}" data-context-status="NO_ACTIVE_DESCRIPTOR" aria-label="Context inspector"></aside>`;
    const lensTabs=this.renderLensTabs(descriptor.lenses,lens.id,{controlsId:'context-inspector-panel'});
    const detailTabs=lens.tabs.map(item=>`<button class="btn${item.id===tab.id?' active':''}" type="button" role="tab" data-context-host-action="inspector.tab" data-context-tab="${esc(item.id)}" aria-selected="${item.id===tab.id}">${esc(item.label)}</button>`).join('');
    const fields=tab.fields.length?`<dl class="context-fields context-section">${tab.fields.map(field=>`<div class="context-row" data-context-field="${esc(field.id)}"><dt>${esc(field.label)}</dt><dd dir="${esc(field.direction)}">${esc(field.value===null||field.value===''?policy.emptyValue:field.value)}</dd></div>`).join('')}</dl>`:`<div class="contextempty" data-context-empty><strong>${esc(tab.emptyMessage||policy.emptyValue)}</strong></div>`;
    const owner=policy.showDomainOwner?`<div class="context-boundary">Canonical owner: <bdi dir="ltr">${esc(descriptor.domainOwner)}</bdi></div>`:'';
    const revision=policy.showRevision&&descriptor.revisionToken!==null?`<div class="context-boundary">Revision: <bdi dir="ltr">${esc(descriptor.revisionToken)}</bdi></div>`:'';
    const identity=this.renderIdentity({lensLabel:lens.label,scopeLabel:descriptor.eyebrow,subjectHTML:esc(descriptor.subject),intro:descriptor.summary,pinned:state.pinned,showClose:true});
    return `<aside class="context-inspector" role="complementary" aria-label="Context inspector" data-context-inspector-owner="${esc(ownerId)}" data-context-presentation-owner="${esc(this.ownerId)}" data-context-provider="${esc(descriptor.providerId)}" data-context-descriptor="${esc(descriptor.id)}" data-context-lens-active="${esc(lens.id)}" data-context-tab-active="${esc(tab.id)}" data-density="${esc(policy.density)}"><nav class="context-lenses context-tabs" role="tablist" aria-label="Context lenses">${lensTabs}</nav>${identity}<nav class="contextscope" role="tablist" aria-label="Context details">${detailTabs}</nav><section id="context-inspector-panel" role="tabpanel" aria-label="${esc(tab.label)}">${fields}${owner}${revision}</section></aside>`;
  }
}

const existingPresentation=globalThis[PRESENTATION_BRIDGE_KEY];
if(existingPresentation&&existingPresentation.ownerId!==CONTEXT_INSPECTOR_OWNER_ID)throw Error('CONTEXT_INSPECTOR_PRESENTATION_OWNER_CONFLICT');
export const CONTEXT_INSPECTOR_PRESENTATION=existingPresentation||new ContextInspectorPresentation();
globalThis[PRESENTATION_BRIDGE_KEY]=CONTEXT_INSPECTOR_PRESENTATION;

export class ContextInspectorHost {
  constructor({transientOwner,fallbackFocus=null,policy={}}={}){
    if(!focusOwnerCompatible(transientOwner))throw Error('TRANSIENT_FOCUS_OWNER_REQUIRED');
    this.ownerId=CONTEXT_INSPECTOR_OWNER_ID;
    this.contract=CONTEXT_INSPECTOR_CONTRACT;
    this.transientOwner=transientOwner;
    this.fallbackFocus=fallbackFocus;
    this.transientId='context-inspector-host';
    this.providers=new Map();
    this.policy=validatePolicy({...DEFAULT_POLICY,...policy});
    this.state={ownerId:this.ownerId,open:false,activeProviderId:null,activeDescriptorId:null,activeLensId:null,activeTabId:null,pinned:false,lastTransition:'initialize',policyTag:policyTag(this.policy)};
    this.presentation=CONTEXT_INSPECTOR_PRESENTATION.attachSemanticHost(this);
    this.assertPresentationOnlyState();
  }
  registerProvider(provider){
    if(!provider||provider.contract!==CONTEXT_DESCRIPTOR_CONTRACT)throw Error('CONTEXT_PROVIDER_CONTRACT_REQUIRED');
    if(this.providers.has(provider.id))throw Error('DUPLICATE_CONTEXT_PROVIDER:'+provider.id);
    if(provider.owner===this.ownerId)throw Error('PROVIDER_CANNOT_OWN_CONTEXT_HOST_SEMANTICS');
    this.providers.set(provider.id,provider);return provider.id;
  }
  unregisterProvider(id){
    if(!this.providers.has(id))return false;
    if(this.state.activeProviderId===id)this.reconcileActiveInvalidation(Object.freeze({ok:false,code:'PROVIDER_UNREGISTERED',providerId:id}),'unregister');
    return this.providers.delete(id);
  }
  providerIds(){return [...this.providers.keys()];}
  snapshot(){return clone(this.state);}
  snapshotPolicy(){return clone(this.policy);}
  setPolicy(patch={}){
    const unknown=Object.keys(patch).filter(key=>!POLICY_KEYS.includes(key));if(unknown.length)throw Error('CONTEXT_POLICY_KEY_INVALID:'+unknown.join(','));
    this.policy=validatePolicy({...this.policy,...patch});this.state.policyTag=policyTag(this.policy);this.state.lastTransition='policy';return this.snapshotPolicy();
  }
  assertPresentationOnlyState(){
    const keys=Object.keys(this.state);if(keys.some(key=>!PRESENTATION_STATE_KEYS.includes(key)))throw Error('CONTEXT_HOST_DOMAIN_STATE_FORBIDDEN:'+keys.filter(key=>!PRESENTATION_STATE_KEYS.includes(key)).join(','));
    for(const forbidden of ['document','metadata','relations','records','runtime','device','selection','save','blocks','nodes'])if(forbidden in this.state)throw Error('CONTEXT_HOST_DOMAIN_STATE_FORBIDDEN:'+forbidden);
    return true;
  }
  inspect(providerId,context={}){
    const provider=this.providers.get(providerId);if(!provider)return Object.freeze({ok:false,code:'UNKNOWN_CONTEXT_PROVIDER',providerId});
    return describeContextProvider(provider,context);
  }
  activate(providerId,context={}){
    const result=this.inspect(providerId,context);if(!result.ok)return result;
    const descriptor=result.descriptor,previous=this.snapshot(),sameProvider=previous.activeProviderId===providerId;
    const preferredLens=sameProvider?previous.activeLensId:null,lens=descriptor.lenses.find(item=>item.id===preferredLens)||descriptor.lenses[0];
    const preferredTab=sameProvider?previous.activeTabId:null,tab=lens.tabs.find(item=>item.id===preferredTab)||lens.tabs[0];
    this.state.activeProviderId=providerId;this.state.activeDescriptorId=descriptor.id;this.state.activeLensId=lens.id;this.state.activeTabId=tab.id;this.state.lastTransition=sameProvider&&previous.activeDescriptorId!==descriptor.id?'descriptor-refresh':'activate';
    this.assertPresentationOnlyState();return Object.freeze({ok:true,code:'ACTIVE',descriptorId:descriptor.id,providerId,lensId:lens.id,tabId:tab.id});
  }
  deactivate(reason='deactivate'){
    this.state.activeProviderId=null;this.state.activeDescriptorId=null;this.state.activeLensId=null;this.state.activeTabId=null;this.state.pinned=false;this.state.lastTransition=reason;this.assertPresentationOnlyState();return this.snapshot();
  }
  reconcileActiveInvalidation(result,source='project'){
    const code=String(result?.code||'DESCRIPTOR_INVALID'),reason=code.toLowerCase().replaceAll('_','-'),wasOpen=this.state.open,hadTransient=Boolean(this.transientOwner.record(this.transientId));
    if(hadTransient)this.transientOwner.close(this.transientId,{restore:true,reason:`context-reconcile:${reason}`});
    this.state.open=false;
    this.deactivate(`reconcile:${source}:${reason}:${wasOpen||hadTransient?'closed':'inactive'}`);
    const focusReceipt=typeof this.transientOwner.snapshot==='function'?this.transientOwner.snapshot().lastDismissal:null;
    return Object.freeze({...result,reconciled:true,reconciliation:wasOpen||hadTransient?'CLOSED_NO_REPLACEMENT':'DEACTIVATED_NO_REPLACEMENT',reason,hostState:this.snapshot(),transientActive:Boolean(this.transientOwner.record(this.transientId)),focusReturn:focusReceipt?Object.freeze({...focusReceipt}):null});
  }
  open(providerId,context={},options={}){
    const activated=this.activate(providerId,context);if(!activated.ok)return activated;
    if(!this.transientOwner.record(this.transientId))this.transientOwner.open(this.transientId,{invoker:options.invoker||null,element:options.element||null,kind:'context-inspector',modal:false,outsideDismiss:false,escapeDismiss:true,fallbackFocus:options.fallbackFocus||this.fallbackFocus});
    this.state.open=true;this.state.lastTransition='open';return Object.freeze({...activated,open:true});
  }
  close(reason='explicit',{restore=true}={}){
    if(this.transientOwner.record(this.transientId))this.transientOwner.close(this.transientId,{restore,reason});
    this.state.open=false;this.state.lastTransition=`close:${reason}`;return this.snapshot();
  }
  selectLens(id,context={}){
    const projection=this.project(context);if(!projection.ok)throw Error('CONTEXT_DESCRIPTOR_NOT_ACTIVE');
    const lens=projection.descriptor.lenses.find(item=>item.id===id);if(!lens)throw Error('UNKNOWN_CONTEXT_LENS:'+id);
    this.state.activeLensId=id;this.state.activeTabId=lens.tabs[0].id;this.state.lastTransition='lens';return this.snapshot();
  }
  selectTab(id,context={}){
    const projection=this.project(context);if(!projection.ok)throw Error('CONTEXT_DESCRIPTOR_NOT_ACTIVE');
    const lens=projection.descriptor.lenses.find(item=>item.id===this.state.activeLensId)||projection.descriptor.lenses[0],tab=lens.tabs.find(item=>item.id===id);if(!tab)throw Error('UNKNOWN_CONTEXT_TAB:'+id);
    this.state.activeLensId=lens.id;this.state.activeTabId=tab.id;this.state.lastTransition='tab';return this.snapshot();
  }
  setPinned(value=true){this.state.pinned=value===true;this.state.lastTransition=this.state.pinned?'pin':'unpin';return this.snapshot();}
  hostAction(action,payload={},context={}){
    if(action==='inspector.pin')return this.setPinned(true);
    if(action==='inspector.unpin')return this.setPinned(false);
    if(action==='inspector.toggle-pin')return this.setPinned(!this.state.pinned);
    if(action==='inspector.close')return this.close(payload.reason||'explicit',{restore:payload.restore!==false});
    if(action==='inspector.lens')return this.selectLens(payload.id,context);
    if(action==='inspector.tab')return this.selectTab(payload.id,context);
    throw Error('UNKNOWN_CONTEXT_HOST_ACTION:'+action);
  }
  project(context={}){
    const providerId=this.state.activeProviderId;if(!providerId)return Object.freeze({ok:false,code:'NO_ACTIVE_DESCRIPTOR'});
    const result=this.inspect(providerId,context);
    if(!result.ok)return this.reconcileActiveInvalidation(result,'project');
    const descriptor=result.descriptor;
    const lens=descriptor.lenses.find(item=>item.id===this.state.activeLensId)||descriptor.lenses[0],tab=lens.tabs.find(item=>item.id===this.state.activeTabId)||lens.tabs[0];
    this.state.activeDescriptorId=descriptor.id;this.state.activeLensId=lens.id;this.state.activeTabId=tab.id;this.state.lastTransition='project';this.assertPresentationOnlyState();
    return Object.freeze({ok:true,descriptor,lens,tab,policy:this.policy,state:this.snapshot()});
  }
  renderHTML(context={}){
    const projection=this.project(context);if(!projection.ok)return `<aside class="context-inspector" data-context-inspector-owner="${esc(this.ownerId)}" data-context-status="${esc(projection.code)}" aria-label="Context inspector"></aside>`;
    return this.presentation.renderDescriptor({...projection,ownerId:this.ownerId});
  }
}
