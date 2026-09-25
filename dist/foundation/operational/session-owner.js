import {RuntimeAdapterPresentationBoundary,OPERATIONAL_RUNTIME_PRESENTATION_BOUNDARY} from '../contracts/runtime-adapter.js';
import {BOTTOM_DEEP_WORK_PROVIDER_CONTRACT} from '../global/bottom-provider-contract.js';
import {constrainWindowGeometry} from '../window-motion.js';
import {normalizeOperationalTerminalState} from './presentation.js';

const clone=value=>value==null?value:structuredClone(value);
const finite=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
const normalizeGeometry=(value,bounds=null)=>constrainWindowGeometry({
  x:finite(value?.x,120),y:finite(value?.y,140),
  width:Math.max(320,finite(value?.width,720)),height:Math.max(200,finite(value?.height,420))
},{bounds,minWidth:320,minHeight:200,keepFullyVisible:true});

export const OPERATIONAL_SESSION_OWNER='OperationalSessionOwner';
export const OPERATIONAL_SESSION_CONTRACT=Object.freeze({
  id:OPERATIONAL_SESSION_OWNER,
  version:'1.0.0',
  compatibility:'SEMVER',
  scope:'OPERATIONAL_PRESENTATION_ONLY',
  runtimeTruth:'RuntimeAdapter',
  maturity:'IMPLEMENTATION_PROVIDER_NEUTRAL__FINAL_TARGET_PROOF_PENDING'
});
export const OPERATIONAL_SESSION_TAB_POLICY=Object.freeze({
  revision:'operational-session-tabs-w4f-r1',
  duplicateAttachment:'REUSE_AND_ACTIVATE',
  activateOnAttach:true,
  closeSelection:'RIGHT_THEN_LEFT',
  reorder:'CLAMPED'
});
export const OPERATIONAL_PRESENTATION_ROUTES=Object.freeze([
  'session.attach','session.select','session.close-tab','session.reorder',
  'session.chrome.open','session.chrome.close','session.chrome.minimize','session.chrome.restore',
  'session.chrome.bottom','session.chrome.floating','session.chrome.single','session.chrome.split','session.geometry','session.geometry.cancel','session.pin','session.detach-window'
]);

const identity=(providerId,sessionId)=>`ops-tab::${encodeURIComponent(providerId)}::${encodeURIComponent(sessionId)}`;

/**
 * Provider-neutral Operational presentation owner.
 * It stores only stable presentation/provider/session references. Runtime identity and
 * output are re-read live from RuntimeAdapterPresentationBoundary on every projection.
 */
export class OperationalSessionOwner {
  constructor({tabPolicy=OPERATIONAL_SESSION_TAB_POLICY,platformWindowBridge=null,viewport=null}={}){
    this.owner=OPERATIONAL_SESSION_OWNER;
    this.contract=OPERATIONAL_SESSION_CONTRACT;
    this.runtimeBoundary=OPERATIONAL_RUNTIME_PRESENTATION_BOUNDARY;
    this.tabPolicy=Object.freeze({...OPERATIONAL_SESSION_TAB_POLICY,...tabPolicy});
    this.providers=new Map();
    this.tabs=[];
    this.activePresentationId=null;
    this.viewport=typeof viewport==='function'?viewport:null;
    this.chrome={lifecycle:'closed',placement:'bottom',layout:'single',geometry:this._geometry(),pinned:false,detached:false,detachedPresentationId:null};
    this.platformWindowBridge=platformWindowBridge;
    this.sequence=0;
    this.lastTransition=null;
    this.platformUnsubscribe=typeof this.platformWindowBridge?.subscribe==='function'?this.platformWindowBridge.subscribe(event=>this._onPlatformWindowEvent(event)):null;
  }
  _bounds(){const raw=this.viewport?.();if(!raw)return null;const left=finite(raw.left,finite(raw.leftInset,0)),top=finite(raw.top,finite(raw.topInset,0)),width=Math.max(1,finite(raw.width,1280)),height=Math.max(1,finite(raw.height,720)),right=finite(raw.right,width-finite(raw.rightInset,0)),bottom=finite(raw.bottom,height-finite(raw.bottomInset,0));return {left,top,right,bottom};}
  _geometry(value={}){return normalizeGeometry(value,this._bounds());}
  registerProvider(provider,options={}){
    const boundary=new RuntimeAdapterPresentationBoundary(provider),descriptor=boundary.descriptor();
    const existing=this.providers.get(descriptor.id);
    if(existing){if(existing.provider!==provider)throw Error('DUPLICATE_OPERATIONAL_PROVIDER:'+descriptor.id);return {...existing.boundary.descriptor(),classification:existing.classification,evidenceRole:existing.evidenceRole}}
    const classification=options.classification||'REAL_RUNTIME_PROVIDER',evidenceRole=options.evidenceRole||'presentation-provider';
    this.providers.set(descriptor.id,{provider,boundary,classification,evidenceRole});
    return {...descriptor,classification,evidenceRole};
  }
  providerDescriptor(providerId){
    const entry=this.providers.get(providerId);if(!entry)return null;
    const raw=entry.provider?.descriptor?.()||{};
    return {...entry.boundary.descriptor(),runtimeTruth:raw.runtimeTruth??null,nativeTerminal:raw.nativeTerminal===true,rawTerminal:raw.rawTerminal===true,pty:raw.pty===true,conpty:raw.conpty===true,powershell:raw.powershell===true,ssh:raw.ssh===true,classification:entry.classification,evidenceRole:entry.evidenceRole};
  }
  providerDescriptors(){return [...this.providers.keys()].map(id=>this.providerDescriptor(id));}
  _record(action,extra={}){this.lastTransition={sequence:++this.sequence,action,owner:this.owner,tabPolicyRevision:this.tabPolicy.revision,...clone(extra)};return clone(this.lastTransition);}
  _onPlatformWindowEvent(event={}){if(event.presentationId!==this.chrome.detachedPresentationId)return;if(event.type!=='presentation-closed'&&event.type!=='provider-invalidated')return;const detachedPresentationId=this.chrome.detachedPresentationId;this.chrome.detached=false;this.chrome.detachedPresentationId=null;this._record('session.detach-window.lifecycle',{presentationId:detachedPresentationId,eventType:event.type,code:event.code||null,providerSessionPreserved:true,runtimeTabsPreserved:this.tabs.length});}
  _provider(providerId){const entry=this.providers.get(providerId);if(!entry)throw Error('UNKNOWN_OPERATIONAL_PROVIDER:'+providerId);return entry;}
  providerRuntime(providerId){return this.providers.get(providerId)?.provider||null;}
  _tabRef(presentationId){return this.tabs.find(item=>item.presentationId===presentationId)||null;}
  attachProviderSession(provider,sessionId,options={}){
    const descriptor=this.registerProvider(provider,options),entry=this._provider(descriptor.id),session=entry.boundary.readSession(sessionId),presentationId=identity(descriptor.id,session.id);
    let tab=this._tabRef(presentationId),reused=!!tab;
    if(!tab){tab={presentationId,providerId:descriptor.id,runtimeSessionId:session.id,providerSessionOwner:descriptor.sessionOwner,attachedAtSequence:this.sequence+1};this.tabs.push(tab)}
    if(this.tabPolicy.activateOnAttach||this.tabPolicy.duplicateAttachment==='REUSE_AND_ACTIVATE')this.activePresentationId=presentationId;
    this.chrome.lifecycle='open';
    this._record('session.attach',{presentationId,providerId:descriptor.id,runtimeSessionId:session.id,reused});
    return this.tab(presentationId);
  }
  runtimeIdentity(presentationId=this.activePresentationId){
    const tab=this._tabRef(presentationId);if(!tab)throw Error('UNKNOWN_OPERATIONAL_TAB:'+String(presentationId));
    const session=this._provider(tab.providerId).boundary.readSession(tab.runtimeSessionId);
    const deviceId=session?.deviceId??null,toolId=session?.toolId??null;
    return {
      source:'RuntimeAdapterReference',providerId:tab.providerId,runtimeSessionId:tab.runtimeSessionId,
      sessionId:session?.id??tab.runtimeSessionId,runId:session?.runId??null,deviceId,toolId,
      deviceOrToolId:deviceId??toolId,epoch:session?.epoch??null
    };
  }
  _projectTab(tab){
    const projected=clone(tab);let runtimeIdentity;
    try{runtimeIdentity=this.runtimeIdentity(tab.presentationId)}catch(error){runtimeIdentity={source:'RuntimeAdapterReference',providerId:tab.providerId,runtimeSessionId:tab.runtimeSessionId,sessionId:tab.runtimeSessionId,runId:null,deviceId:null,toolId:null,deviceOrToolId:null,epoch:null,error:String(error?.message||error)}}
    return {...projected,deviceId:runtimeIdentity.deviceId,runId:runtimeIdentity.runId,epoch:runtimeIdentity.epoch,runtimeIdentity};
  }
  tab(presentationId){const tab=this._tabRef(presentationId);return tab?this._projectTab(tab):null;}
  tabsSnapshot(){return this.tabs.map(tab=>this._projectTab(tab));}
  activeTab(){return this.tab(this.activePresentationId);}
  readRuntimeSession(presentationId=this.activePresentationId){
    const tab=this._tabRef(presentationId);if(!tab)throw Error('UNKNOWN_OPERATIONAL_TAB:'+String(presentationId));
    return this._provider(tab.providerId).boundary.readSession(tab.runtimeSessionId);
  }
  runtimePrompt(presentationId=this.activePresentationId){
    const tab=this._tabRef(presentationId);if(!tab)throw Error('UNKNOWN_OPERATIONAL_TAB:'+String(presentationId));
    return this._provider(tab.providerId).boundary.prompt(tab.runtimeSessionId);
  }
  tabPresentationState(presentationId=this.activePresentationId){
    const tab=this._tabRef(presentationId);if(!tab)throw Error('UNKNOWN_OPERATIONAL_TAB:'+String(presentationId));
    const descriptor=this.providerDescriptor(tab.providerId)||{};
    try{return normalizeOperationalTerminalState(descriptor,this.readRuntimeSession(presentationId))}catch(error){return {state:'unavailable',label:'Unavailable',detail:String(error?.message||error),sequence:0,transitions:[]}}
  }
  selectTab(presentationId){if(!this._tabRef(presentationId))throw Error('UNKNOWN_OPERATIONAL_TAB:'+presentationId);this.activePresentationId=presentationId;this._record('session.select',{presentationId});return this.snapshot();}
  closeTab(presentationId){
    const index=this.tabs.findIndex(tab=>tab.presentationId===presentationId);if(index<0)throw Error('UNKNOWN_OPERATIONAL_TAB:'+presentationId);
    const [closed]=this.tabs.splice(index,1);let next=this.activePresentationId;
    if(this.activePresentationId===presentationId){
      if(this.tabPolicy.closeSelection==='LEFT_THEN_RIGHT')next=this.tabs[index-1]?.presentationId||this.tabs[index]?.presentationId||null;
      else next=this.tabs[index]?.presentationId||this.tabs[index-1]?.presentationId||null;
      this.activePresentationId=next;
    }
    if(this.tabs.length<2)this.chrome.layout='single';
    if(!this.tabs.length)this.chrome.lifecycle='closed';
    this._record('session.close-tab',{presentationId,providerId:closed.providerId,runtimeSessionId:closed.runtimeSessionId,nextPresentationId:this.activePresentationId,providerSessionPreserved:true});
    return this.snapshot();
  }
  reorderTab(presentationId,delta){
    const index=this.tabs.findIndex(tab=>tab.presentationId===presentationId);if(index<0)throw Error('UNKNOWN_OPERATIONAL_TAB:'+presentationId);
    const target=Math.max(0,Math.min(this.tabs.length-1,index+Number(delta||0)));const [tab]=this.tabs.splice(index,1);this.tabs.splice(target,0,tab);
    this._record('session.reorder',{presentationId,from:index,to:target});return this.snapshot();
  }
  openChrome(){if(!this.tabs.length)throw Error('OPERATIONAL_CHROME_REQUIRES_TAB');this.chrome.lifecycle='open';this._record('session.chrome.open');return this.snapshot();}
  closeChrome(){this.chrome.lifecycle='closed';this._record('session.chrome.close',{sessionsRetained:this.tabs.length});return this.snapshot();}
  minimizeChrome(){if(!this.tabs.length)throw Error('OPERATIONAL_CHROME_REQUIRES_TAB');this.chrome.lifecycle='minimized';this._record('session.chrome.minimize');return this.snapshot();}
  restoreChrome(){if(!this.tabs.length)throw Error('OPERATIONAL_CHROME_REQUIRES_TAB');this.chrome.lifecycle='open';this._record('session.chrome.restore');return this.snapshot();}
  setPlacement(placement){if(!['bottom','floating'].includes(placement))throw Error('OPERATIONAL_PLACEMENT_OUT_OF_SCOPE:'+placement);this.chrome.placement=placement;this._record('session.chrome.'+placement);return this.snapshot();}
  setLayout(layout){if(!['single','split'].includes(layout))throw Error('OPERATIONAL_LAYOUT_OUT_OF_SCOPE:'+layout);if(layout==='split'&&this.tabs.length<2)throw Error('OPERATIONAL_SPLIT_REQUIRES_SECOND_TAB');this.chrome.layout=layout;this._record('session.chrome.'+layout);return this.snapshot();}
  setGeometry(geometry){this.chrome.geometry=this._geometry({...this.chrome.geometry,...geometry});this._record('session.geometry',{geometry:this.chrome.geometry,viewportContained:true});return this.snapshot();}
  setPinned(pinned){this.chrome.pinned=!!pinned;this._record('session.pin',{pinned:this.chrome.pinned,scope:'CEP_PRESENTATION_ONLY'});return this.snapshot();}
  detachWindow({url=null}={}){const tab=this.activeTab();if(!tab)throw Error('OPERATIONAL_DETACH_REQUIRES_TAB');const presentationId=tab.presentationId,runtimeSessionId=tab.runtimeSessionId,providerId=tab.providerId,detachScope='OWNING_SURFACE',focusContext={kind:'OPERATIONAL_TERMINAL',presentationId,runtimeSessionId,providerId},surfaceIntent={scope:detachScope,preserveRoute:true,preserveObject:true,preserveContext:true,focusedContext:clone(focusContext)},capabilities=this.providerDescriptor(providerId)?.capabilities||[];if(!capabilities.includes('runtime.reattach')){this._record('session.detach-window',{presentationId,runtimeSessionId,providerId,detachScope,focusContext,surfaceIntent,ok:false,code:'PROVIDER_REATTACH_UNAVAILABLE',providerSessionPreserved:true});return {ok:false,code:'PROVIDER_REATTACH_UNAVAILABLE',presentationId,runtimeSessionId,providerId,detachScope,focusContext,surfaceIntent,providerSessionPreserved:true}}if(!this.platformWindowBridge?.requestSeparateWindow){this._record('session.detach-window',{presentationId,runtimeSessionId,providerId,detachScope,focusContext,surfaceIntent,ok:false,code:'PLATFORM_WINDOW_UNAVAILABLE',providerSessionPreserved:true});return {ok:false,code:'PLATFORM_WINDOW_UNAVAILABLE',presentationId,runtimeSessionId,providerId,detachScope,focusContext,surfaceIntent,providerSessionPreserved:true}}const result=this.platformWindowBridge.requestSeparateWindow({presentationId,runtimeSessionId,providerId,url,detachScope,focusContext,surfaceIntent});const ok=result?.ok===true&&result?.active===true&&result?.contextHandoffValid===true;this.chrome.detached=ok;this.chrome.detachedPresentationId=ok?presentationId:null;const code=ok?(result?.code||'BRIDGE_CONFIRMED'):'DETACH_CONTEXT_HANDOFF_REQUIRED';this._record('session.detach-window',{presentationId,runtimeSessionId,providerId,detachScope,focusContext,surfaceIntent,ok,code,providerSessionPreserved:true});return {...result,ok,code,presentationId,runtimeSessionId,providerId,detachScope,focusContext,surfaceIntent,providerSessionPreserved:true}}
  motionBinding(presentationId,element,{resize=false,resizeSign=1,resizeEdge=null}={}){
    if(this.chrome.placement!=='floating'||this.chrome.lifecycle==='closed')return null;
    if(!this._tabRef(presentationId))return null;
    const edge=resizeEdge==null?null:String(resizeEdge);
    return {
      id:presentationId,element,geometry:this.chrome.geometry,resize:edge?false:!!resize,resizeSign,resizeEdge:edge,bounds:this.viewport||undefined,minWidth:320,minHeight:200,keepFullyVisible:true,
      commit:receipt=>{
        if(receipt?.cancelled)return this._record('session.geometry.cancel',{presentationId,edge:receipt?.edge||edge,geometry:this.chrome.geometry,reason:receipt?.reason||'cancel'});
        return this._record(receipt?.action==='resize'?'session.geometry.resize':'session.geometry.move',{presentationId,edge:receipt?.edge||edge,geometry:this.chrome.geometry});
      },
      cancel:receipt=>this._record('session.geometry.cancel',{presentationId,edge:receipt?.edge||edge,geometry:this.chrome.geometry,reason:receipt?.reason||'cancel'})
    };
  }
  route(action,payload={}){
    if(!OPERATIONAL_PRESENTATION_ROUTES.includes(action))throw Error('OPERATIONAL_PRESENTATION_ROUTE_OUT_OF_SCOPE:'+action);
    if(action==='session.select')return this.selectTab(payload.presentationId);
    if(action==='session.close-tab')return this.closeTab(payload.presentationId);
    if(action==='session.reorder')return this.reorderTab(payload.presentationId,payload.delta);
    if(action==='session.chrome.open')return this.openChrome();
    if(action==='session.chrome.close')return this.closeChrome();
    if(action==='session.chrome.minimize')return this.minimizeChrome();
    if(action==='session.chrome.restore')return this.restoreChrome();
    if(action==='session.chrome.bottom')return this.setPlacement('bottom');
    if(action==='session.chrome.floating')return this.setPlacement('floating');
    if(action==='session.chrome.single')return this.setLayout('single');
    if(action==='session.chrome.split')return this.setLayout('split');
    if(action==='session.geometry')return this.setGeometry(payload.geometry);
    if(action==='session.pin')return this.setPinned(payload.pinned);
    if(action==='session.detach-window')return this.detachWindow(payload);
    throw Error('SESSION_ATTACH_REQUIRES_PROVIDER_REFERENCE');
  }
  asBottomDeepWorkProvider({id='operational.session-presentation',label='Operational sessions'}={}){
    const owner=this;
    return {
      descriptor(){return {contract:BOTTOM_DEEP_WORK_PROVIDER_CONTRACT,id,label,family:'operational',contentKind:'session-presentation',sourceOwner:OPERATIONAL_SESSION_OWNER,readOnly:true,ownsCanonicalContent:false};},
      read(){return {providerId:id,family:'operational',contentKind:'session-presentation',sourceOwner:OPERATIONAL_SESSION_OWNER,readOnly:true,ownsCanonicalContent:false,presentation:owner.snapshot()};}
    };
  }
  snapshot(){const tabs=this.tabsSnapshot().map(tab=>({...tab,presentationState:this.tabPresentationState(tab.presentationId)}));return {owner:this.owner,contract:this.contract,runtimeBoundary:this.runtimeBoundary,tabPolicyRevision:this.tabPolicy.revision,tabs,activePresentationId:this.activePresentationId,chrome:clone(this.chrome),providerAttachments:this.providerDescriptors(),lastTransition:this.lastTransition?clone(this.lastTransition):null};}
}
