import {GlobalInputKeymapOwner} from './global/input-keymap.js';
import {createRegionCycleDescriptor} from './global/region-cycle.js';
import {WORKSPACE_REGION_CONTRACT} from './global/region-contract.js';
import {AccessibilityFeedbackOwner,AccessibilityFeedbackProjector} from './global/feedback.js';
import {ContextInspectorHost} from './global/context-inspector.js';
import {BottomDeepWorkOwner} from './global/bottom-shelf.js';
import {UIScalePolicyOwner} from './global/preferences/ui-scale.js';
import {createLibraryStructuredContextProvider} from '../adapters/context-library-structured.js';
import {createLearnStructuredContextProvider} from '../adapters/context-learn-structured.js';
import {createSpatialContextProvider} from '../adapters/context-spatial.js';
import {StructuredBottomProvider} from '../adapters/structured-bottom-provider.js';
import {OperationalBottomProvider} from '../adapters/operational-bottom-provider.js';

export const WAVE3_GLOBAL_ASSEMBLY_CONTRACT=Object.freeze({
  id:'Wave3GlobalAssembly',version:'1.0.0',owner:'ControllerIntegrationHost',
  owners:Object.freeze(['GlobalInputKeymapOwner','AccessibilityFeedbackOwner','ContextInspectorHost','BottomDeepWorkOwner','UIScalePolicyOwner']),
  convergenceOrder:Object.freeze(['input','feedback','context','bottom','scale'])
});

const firstFocusable=element=>element?.matches?.('button,input,textarea,select,a[href],[tabindex]:not([tabindex="-1"])')?element:element?.querySelector?.('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])');
const elementVisible=element=>Boolean(element&&!element.hidden&&element.getAttribute?.('aria-hidden')!=='true');
const toneOutcome=tone=>tone==='error'?'error':tone==='success'?'success':tone==='warning'?'warning':'info';
const truthForOutcome=outcome=>outcome==='error'||outcome==='failure'?{ok:false,status:'ERROR'}:outcome==='success'?{ok:true,status:'SUCCESS'}:{status:outcome.toUpperCase()};

export class Wave3GlobalAssembly{
  constructor({commandBus,transientOwner,preferences,api,workspace,consumer,family,structured=null,learn=null,spatial=null,relations=null,simulation=null,bottomProviders=[],feedbackOwner=null,document:doc=globalThis.document}={}){
    if(!commandBus||!transientOwner||!preferences||!api||!workspace||!doc)throw Error('WAVE3_ASSEMBLY_DEPENDENCY_REQUIRED');
    if(!Array.isArray(bottomProviders))throw Error('WAVE3_BOTTOM_PROVIDERS_ARRAY_REQUIRED');
    this.contract=WAVE3_GLOBAL_ASSEMBLY_CONTRACT;this.commandBus=commandBus;this.transientOwner=transientOwner;this.preferences=preferences;this.api=api;this.workspace=workspace;this.consumer=consumer;this.family=family;this.structured=structured;this.learn=learn;this.spatial=spatial;this.relations=relations;this.simulation=simulation;this.bottomProviders=[...bottomProviders];this.document=doc;
    this.feedbackOwner=feedbackOwner||new AccessibilityFeedbackOwner();this.feedbackProjector=null;this.contextInspector=null;this.contextContainer=null;this.contextPresentationMode='foundation-host';this.bottomOwner=null;this.bottomPresentationMode='foundation-host';this.uiScale=new UIScalePolicyOwner(preferences);this.inputOwner=null;this.inputListener=null;this.originalWorkspaceStatus=workspace.status.bind(workspace);this.originalApplyPreferences=workspace.applyPreferences.bind(workspace);
  }
  mount(){this.mountInput();this.mountFeedback();this.mountContext();this.mountBottom();this.mountScale();return this;}
  regionDescriptor(id){
    const selector=WORKSPACE_REGION_CONTRACT.selectors[id];
    const element=()=>this.document.querySelector(selector);
    return createRegionCycleDescriptor({id,available:()=>Boolean(element())&&(id!=='LEFT'&&id!=='RIGHT'||this.api.effectivePaneState(id.toLowerCase())!=='collapsed'),hidden:()=>!elementVisible(element()),containsFocus:()=>{const el=element(),active=this.document.activeElement;return Boolean(el&&active&&el.contains(active));},focus:()=>{const el=element(),target=firstFocusable(el)||el;if(!target?.focus)return false;target.focus();return this.document.activeElement===target||el?.contains?.(this.document.activeElement);}});
  }
  dismissTopTransient(reason='escape',{restore=true}={}){
    const top=this.transientOwner.top?.();if(!top)return false;
    if(top.id==='foundationDialog'){this.workspace.closeDialog(reason);return true}
    if(top.id==='foundationMenu'){this.workspace.closeMenu(true,reason);return true}
    if(top.id==='commandBackdrop'){this.workspace.closeCommandPalette(reason);return true}
    if(top.id==='context-inspector-host'&&this.contextInspector){this.contextInspector.close(reason,{restore});this.renderContext();return true}
    return this.transientOwner.dismiss(reason,{restore})===true;
  }
  mountInput(){
    const transientAdapter={dismiss:(reason,options)=>this.dismissTopTransient(reason,options)};
    const regions=['TOP','TOOLBAR','LEFT','CENTER','RIGHT','BOTTOM'].map(id=>this.regionDescriptor(id));
    this.inputOwner=new GlobalInputKeymapOwner({commands:this.commandBus,transientFocus:transientAdapter,regions,globalBindings:[
      {id:'global.command-palette',chord:'Ctrl+KeyK',commandId:'foundation.palette',priority:100,allow:true},
      {id:'global.settings',chord:'Ctrl+Comma',commandId:'foundation.settings',priority:90,allow:true}
    ]});
    this.inputListener=event=>{const result=this.inputOwner.handleKeydown(event,{target:event.target,family:this.family,regionContext:{document:this.document},commandPayload:{surface:this.consumer}});if(result?.handled)this.document.documentElement.dataset.lastGlobalInputCode=result.code||'';};
    globalThis.addEventListener?.('keydown',this.inputListener,true);return this.inputOwner;
  }
  mountFeedback(){
    this.feedbackProjector=new AccessibilityFeedbackProjector(this.feedbackOwner,{document:this.document,root:this.document.body}).mount();
    const legacy=this.document.querySelector('#foundationStatus');if(legacy)legacy.dataset.feedbackCompatibilitySink='AccessibilityFeedbackOwner';
    this.workspace.status=(message,tone='info')=>this.publishFeedback({message,tone,sourceOwner:'WorkspaceFoundation'});
    return this.feedbackOwner;
  }
  publishFeedback({message,tone='info',channel='status',sourceOwner='ControllerIntegrationHost',sourceFamily=this.family||'global',sourceTruth=null}={}){
    const outcome=toneOutcome(tone);return this.feedbackOwner.publish({message,channel,outcome,sourceOwner,sourceFamily,sourceTruth:sourceTruth||truthForOutcome(outcome),presentationTone:tone});
  }
  usesDonorNativeContextPresentation(){return this.consumer==='library'&&Boolean(this.document.querySelector('#rightPane[data-component="ContextInspector"] #inspectorContent'));}
  mountContext(){
    this.contextInspector=new ContextInspectorHost({transientOwner:this.transientOwner,fallbackFocus:()=>this.document.querySelector('#centerPane')});
    if(this.structured?.domainKind==='library')this.contextInspector.registerProvider(createLibraryStructuredContextProvider(this.structured));
    if(this.consumer==='learn'&&this.structured?.domainKind==='learn'&&this.learn)this.contextInspector.registerProvider(createLearnStructuredContextProvider({learn:this.learn,structured:this.structured,recommendation:()=>this.learn.recommendation?.(),assessment:()=>this.learn.assessmentDescriptor?.(),lab:()=>this.learn.labDescriptor?.()}));
    if(this.spatial&&this.relations)this.contextInspector.registerProvider(createSpatialContextProvider({spatialModel:this.spatial.model,relationAdapter:this.relations}));
    if(this.usesDonorNativeContextPresentation()){
      this.contextPresentationMode='donor-native';
      const pane=this.document.querySelector('#rightPane');pane.dataset.contextSemanticOwner='ContextInspectorHost';pane.dataset.contextPresentationOwner='ContextInspectorHost';pane.dataset.contextPresentationProvenance='AcceptedLibraryDonor';
      this.refreshContext();return this.contextInspector;
    }
    const body=this.document.querySelector('#rightPane .pbody');if(body){const host=this.document.createElement('section');host.id='wave3ContextInspectorHost';host.dataset.controllerAssembly='ContextInspectorHost';host.hidden=true;body.prepend(host);this.contextContainer=host;}
    this.refreshContext();return this.contextInspector;
  }
  preferredContextProvider(){if(this.consumer==='learn'&&this.contextInspector.providerIds().includes('learn-structured-context'))return 'learn-structured-context';if(this.contextInspector.providerIds().includes('spatial-context'))return 'spatial-context';if(this.contextInspector.providerIds().includes('library-structured-context'))return 'library-structured-context';return null;}
  refreshContext(){
    if(!this.contextInspector)return false;const providerId=this.preferredContextProvider();if(!providerId){if(this.contextContainer)this.contextContainer.hidden=true;return false}
    const inspected=this.contextInspector.inspect(providerId,{});
    if(!inspected.ok){if(this.contextInspector.snapshot().activeProviderId===providerId)this.contextInspector.project({});this.renderContext();return false}
    if(this.contextPresentationMode==='donor-native'){
      const activated=this.contextInspector.activate(providerId,{});if(!activated.ok)return false;
      const lensId=this.api?.state?.surface?.contextLens,pinned=Boolean(this.api?.state?.surface?.contextPin),descriptor=this.contextInspector.inspect(providerId,{})?.descriptor;
      if(lensId&&descriptor?.lenses?.some(lens=>lens.id===lensId))this.contextInspector.selectLens(lensId,{});this.contextInspector.setPinned(pinned);this.api?.renderInspector?.();return true;
    }
    if(!this.contextContainer)return false;
    const state=this.contextInspector.snapshot();if(!state.open||state.activeProviderId!==providerId)this.contextInspector.open(providerId,{}, {invoker:this.document.activeElement,element:this.contextContainer,fallbackFocus:()=>this.document.querySelector('#centerPane')});else this.contextInspector.activate(providerId,{});
    this.renderContext();return true;
  }
  renderContext(){
    if(this.contextPresentationMode==='donor-native'){this.api?.renderInspector?.();return true}
    if(!this.contextContainer||!this.contextInspector)return false;const state=this.contextInspector.snapshot();if(!state.open){this.contextContainer.hidden=true;this.contextContainer.innerHTML='';return false}
    this.contextContainer.hidden=false;this.contextContainer.innerHTML=this.contextInspector.renderHTML({});
    this.contextContainer.querySelectorAll('[data-context-host-action]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.contextHostAction,payload=action==='inspector.lens'?{id:button.dataset.contextLens}:action==='inspector.tab'?{id:button.dataset.contextTab}:{};this.contextInspector.hostAction(action,payload,{});this.renderContext();}));return true;
  }
  usesDonorNativeBottomPresentation(){return this.consumer==='library'&&Boolean(this.document.querySelector('#bottomShelf'))&&typeof this.api?.renderBottom==='function';}
  mountBottom(){
    const providers=[...this.bottomProviders];if(this.structured&&typeof this.structured.transactionDescriptor==='function')providers.push(new StructuredBottomProvider(this.structured));if(this.simulation)providers.push(new OperationalBottomProvider(this.simulation));
    this.bottomOwner=new BottomDeepWorkOwner({providers,focusBridge:{captureCurrent:()=>this.document.activeElement,enter:()=>{const shelf=this.document.querySelector('#bottomShelf'),toggle=this.document.querySelector('#bottomToggle'),content=this.document.querySelector('#bottomContent');if(!content)return false;if(shelf)shelf.dataset.state='open';if(toggle)toggle.setAttribute('aria-expanded','true');content.hidden=false;content.inert=false;content.removeAttribute('aria-hidden');content.tabIndex=-1;const entry=this.document.querySelector('.bottomtabs [data-action=bottom-tab][aria-selected="true"]')||this.document.querySelector('.bottomtabs [data-action=bottom-tab]')||content;entry?.focus?.();return this.document.activeElement===entry},restore:target=>{if(!target?.focus)return false;target.focus();return this.document.activeElement===target},fallback:()=>this.document.querySelector('#centerPane')}});
    this.bottomPresentationMode=this.usesDonorNativeBottomPresentation()?'donor-native':'foundation-host';
    this.api.bottomPresentationRenderer=(options={})=>this.bottomOwner?.renderPresentation({root:this.document,presentationOwner:'BottomDeepWorkOwner',...options})||false;
    if(this.bottomPresentationMode!=='donor-native')this.api.renderBottom=()=>this.renderBottom();
    const toggle=this.document.querySelector('#bottomToggle');if(toggle){toggle.dataset.bottomOwner='BottomDeepWorkOwner';if(this.bottomPresentationMode!=='donor-native')toggle.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();this.toggleBottom({invoker:toggle,reason:'bottom-toggle'});});}
    if(this.bottomPresentationMode!=='donor-native')this.document.querySelectorAll('.bottomtabs [data-action=bottom-tab]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();this.bottomOwner.selectTab(button.dataset.value,{reason:'bottom-tab'});this.renderBottom();}));
    const shelf=this.document.querySelector('#bottomShelf');if(shelf){shelf.dataset.bottomPresentationOwner='BottomDeepWorkOwner';shelf.dataset.bottomPresentationSource='ACCEPTED_LIBRARY_DONOR_EXTRACTED';}
    this.renderBottom();return this.bottomOwner;
  }
  registerBottomProvider(provider){if(!this.bottomOwner)throw Error('WAVE3_BOTTOM_OWNER_NOT_MOUNTED');const descriptor=this.bottomOwner.registerProvider(provider);this.renderBottom();return descriptor;}
  setBottomOpen(open,{invoker=this.document.activeElement,reason='controller-set',restoreFocus=true}={}){if(!this.bottomOwner)return false;if(!this.bottomOwner.providerDescriptors().length){this.renderBottom();return this.bottomOwner.snapshot();}const state=this.bottomOwner.snapshot();if(open&&!state.open)this.bottomOwner.open(undefined,{invoker,reason});else if(!open&&state.open)this.bottomOwner.close({reason,restoreFocus});this.renderBottom();return this.bottomOwner.snapshot();}
  toggleBottom({invoker=this.document.activeElement,reason='command'}={}){if(!this.bottomOwner)return false;if(!this.bottomOwner.providerDescriptors().length){this.renderBottom();return this.bottomOwner.snapshot();}this.bottomOwner.toggle(undefined,{invoker,reason});this.renderBottom();return this.bottomOwner.snapshot();}
  renderBottom(){
    if(!this.bottomOwner)return false;const snapshot=this.bottomOwner.snapshot();
    if(this.api.state?.surface)this.api.state.surface.bottomOpen=snapshot.open;
    const tab=this.bottomPresentationMode==='donor-native'?(this.api.state?.surface?.bottomTab||snapshot.activeTab):snapshot.activeTab;
    const preferences=this.api.state?.preferences||{};
    const actionCapabilities=this.bottomPresentationMode==='donor-native'?{historyRestoreAsNew:true,recoveryRestoreAsNew:true}:{historyRestoreAsNew:false,recoveryRestoreAsNew:false};
    const rendered=this.api.bottomPresentationRenderer?.({tab,preferences,actionCapabilities});
    return rendered?.snapshot||snapshot;
  }
  mountScale(){
    const app=this.document.querySelector('.app')||this.document.body;app.dataset.cepUiScaleScope='';this.document.querySelectorAll('.toolbar,.foundation-shell').forEach(el=>el.dataset.cepUiToolbar='');this.document.querySelectorAll('#leftPane,#rightPane').forEach(el=>el.dataset.cepUiPane=el.id==='leftPane'?'left':'right');this.document.querySelectorAll('#leftResizer,#rightResizer').forEach(el=>el.dataset.cepUiResizeHandle='');this.document.querySelectorAll('.foundation-shell .btn,.toolbar .btn,#leftPane .btn,#rightPane .btn,#bottomShelf .btn').forEach(el=>el.dataset.cepUiControl='');
    this.workspace.applyPreferences=(...args)=>{const result=this.originalApplyPreferences(...args);this.applyScale();return result};this.applyScale();return this.uiScale;
  }
  applyScale(){const target=this.document.documentElement;this.document.querySelectorAll('.toolbar,.foundation-shell,.settings-center').forEach(el=>el.dataset.cepUiToolbar='');this.document.querySelectorAll('#leftPane,#rightPane').forEach(el=>el.dataset.cepUiPane=el.id==='leftPane'?'left':'right');this.document.querySelectorAll('#leftResizer,#rightResizer').forEach(el=>el.dataset.cepUiResizeHandle='');this.document.querySelectorAll('.foundation-shell .btn,.toolbar .btn,#leftPane .btn,#rightPane .btn,#bottomShelf .btn,.settings-center button,.settings-center input,.settings-center select').forEach(el=>el.dataset.cepUiControl='');const projection=this.uiScale.applyToElement(target,{paneLayout:this.api.panes,viewportWidth:globalThis.innerWidth||1440});this.document.documentElement.style.setProperty('--foundation-scale',String(projection.scale));return projection;}
  snapshot(){return {contract:this.contract,input:this.inputOwner?.descriptor?.()||null,feedback:this.feedbackOwner.snapshot(),context:this.contextInspector?.snapshot()||null,bottom:this.bottomOwner?.snapshot()||null,scale:this.uiScale.projection()};}
}

export function mountWave3GlobalAssembly(options){return new Wave3GlobalAssembly(options).mount();}
