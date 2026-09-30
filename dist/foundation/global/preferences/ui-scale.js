import {SCOPED_PREFERENCES_OWNER} from './store.js';
import {WORKSPACE_PANE_LAYOUT_OWNER} from '../pane-layout.js';

export const UI_SCALE_POLICY_OWNER='UIScalePolicyOwner';
export const UI_SCALE_PREFERENCE_KEY='scale';
export const UI_SCALE_LIMITS=Object.freeze({min:0.8,max:2,step:0.05,safeDefault:1});
export const UI_SCALE_POLICY_CONTRACT=Object.freeze({
  id:UI_SCALE_POLICY_OWNER,
  version:'1.0.0',
  scope:'application-chrome',
  preferenceKey:UI_SCALE_PREFERENCE_KEY,
  preferenceValueOwner:SCOPED_PREFERENCES_OWNER,
  paneStateOwner:WORKSPACE_PANE_LAYOUT_OWNER,
  affects:Object.freeze(['application-chrome','pane-presentation-geometry','controls','spacing','typography','icons']),
  excludes:Object.freeze(['document-zoom','spatial-camera-zoom','information-density','browser-zoom','responsive-breakpoints','domain-state']),
  surfaceLocalPolicy:'FORBIDDEN'
});

export const UI_SCALE_TOKEN_BASES=Object.freeze({
  controlHeight:32,
  toolbarHeight:44,
  gap:8,
  inlinePadding:12,
  blockPadding:10,
  radius:8,
  fontSize:14,
  iconSize:18,
  paneGutter:12,
  paneResizeHandle:6
});

const CSS_VARIABLES=Object.freeze({
  controlHeight:'--cep-ui-control-height',
  toolbarHeight:'--cep-ui-toolbar-height',
  gap:'--cep-ui-gap',
  inlinePadding:'--cep-ui-inline-padding',
  blockPadding:'--cep-ui-block-padding',
  radius:'--cep-ui-radius',
  fontSize:'--cep-ui-font-size',
  iconSize:'--cep-ui-icon-size',
  paneGutter:'--cep-ui-pane-gutter',
  paneResizeHandle:'--cep-ui-pane-resize-handle'
});

const round=(value,places=4)=>Number(Number(value).toFixed(places));
const px=value=>`${round(value)}px`;

export function normalizeUIScale(value){
  const numeric=Number(value);
  if(!Number.isFinite(numeric))return UI_SCALE_LIMITS.safeDefault;
  const clamped=Math.min(UI_SCALE_LIMITS.max,Math.max(UI_SCALE_LIMITS.min,numeric));
  const stepped=Math.round(clamped/UI_SCALE_LIMITS.step)*UI_SCALE_LIMITS.step;
  return round(Math.min(UI_SCALE_LIMITS.max,Math.max(UI_SCALE_LIMITS.min,stepped)),2);
}

export function projectUIScaleTokens(scaleValue){
  const scale=normalizeUIScale(scaleValue),tokens={};
  for(const [key,base] of Object.entries(UI_SCALE_TOKEN_BASES))tokens[key]=round(base*scale);
  const cssVariables={'--cep-ui-scale':String(scale)};
  for(const [key,variable] of Object.entries(CSS_VARIABLES))cssVariables[variable]=px(tokens[key]);
  return Object.freeze({owner:UI_SCALE_POLICY_OWNER,scale,baseTokens:UI_SCALE_TOKEN_BASES,tokens:Object.freeze(tokens),cssVariables:Object.freeze(cssVariables)});
}

function assertPreferences(preferences){
  if(!preferences||typeof preferences.resolve!=='function'||typeof preferences.set!=='function'||typeof preferences.applicability!=='function')throw Error('SCOPED_PREFERENCES_OWNER_REQUIRED');
  const applicability=preferences.applicability(UI_SCALE_PREFERENCE_KEY);
  if(!applicability?.applicable||applicability.policyTag===undefined)throw Error('UI_SCALE_PREFERENCE_NOT_APPLICABLE');
  return preferences;
}

function assertPaneLayout(paneLayout){
  if(!paneLayout||typeof paneLayout.snapshot!=='function')throw Error('WORKSPACE_PANE_LAYOUT_OWNER_REQUIRED');
  return paneLayout;
}

function assertConsumerDescriptor(descriptor){
  if(!descriptor||typeof descriptor.id!=='string'||!descriptor.id||typeof descriptor.family!=='string'||!descriptor.family)throw Error('UI_SCALE_CONSUMER_DESCRIPTOR_REQUIRED');
  for(const key of ['scale','uiScale','scalePolicy','tokenOverrides','scaleTokens'])if(Object.hasOwn(descriptor,key))throw Error('SURFACE_LOCAL_SCALE_POLICY_FORBIDDEN:'+key);
  return descriptor;
}

/**
 * Reusable Global application-chrome scale projection.
 * Preferred scale value and persistence stay exclusively in ScopedPreferencesOwner.
 * Domain/document/canvas state is intentionally outside this owner's API.
 */
export class UIScalePolicyOwner{
  constructor(preferences){this.preferences=assertPreferences(preferences);}
  preferred(){
    const resolved=this.preferences.resolve(UI_SCALE_PREFERENCE_KEY);
    return Object.freeze({
      owner:UI_SCALE_POLICY_OWNER,
      preferenceOwner:resolved.persistenceOwner||SCOPED_PREFERENCES_OWNER,
      preferenceKey:UI_SCALE_PREFERENCE_KEY,
      preferredValue:resolved.preferredValue,
      scale:normalizeUIScale(resolved.preferredValue),
      sourceScope:resolved.sourceScope,
      applicable:resolved.applicable
    });
  }
  setPreferredScale(value,scope='global'){
    const scale=normalizeUIScale(value);
    const persistence=this.preferences.set(UI_SCALE_PREFERENCE_KEY,scale,scope);
    return Object.freeze({owner:UI_SCALE_POLICY_OWNER,scale,persistenceOwner:SCOPED_PREFERENCES_OWNER,persistence,projection:this.projection()});
  }
  projection(){
    const preferred=this.preferred(),tokenProjection=projectUIScaleTokens(preferred.scale);
    return Object.freeze({...preferred,contract:UI_SCALE_POLICY_CONTRACT,tokens:tokenProjection.tokens,baseTokens:tokenProjection.baseTokens,cssVariables:tokenProjection.cssVariables});
  }
  paneGeometry(paneLayout,viewportWidth){
    const panes=assertPaneLayout(paneLayout).snapshot(viewportWidth),projection=this.projection(),scale=projection.scale;
    const projectSide=side=>Object.freeze({
      side,
      preferredState:panes[side].preferredState,
      effectiveState:panes[side].effectiveState,
      mode:panes[side].mode,
      responsiveSuppressed:panes[side].responsiveSuppressed,
      resizeAvailability:panes[side].resizeAvailability,
      basePreferredWidth:panes[side].preferredWidth,
      baseEffectiveWidth:panes[side].effectiveWidth,
      scaledPreferredWidth:round(panes[side].preferredWidth*scale),
      scaledEffectiveWidth:round(panes[side].effectiveWidth*scale)
    });
    return Object.freeze({
      owner:UI_SCALE_POLICY_OWNER,
      paneStateOwner:WORKSPACE_PANE_LAYOUT_OWNER,
      scale,
      viewportWidth:panes.viewportWidth,
      responsiveBand:panes.responsiveBand,
      focusMode:panes.focusMode,
      left:projectSide('left'),
      right:projectSide('right')
    });
  }
  consumerProjection(descriptor,paneLayout,viewportWidth){
    const consumer=assertConsumerDescriptor(descriptor),projection=this.projection(),panes=this.paneGeometry(paneLayout,viewportWidth);
    return Object.freeze({
      owner:UI_SCALE_POLICY_OWNER,
      consumer:Object.freeze({id:consumer.id,family:consumer.family,chromeContract:consumer.chromeContract||'application-chrome'}),
      scale:projection.scale,
      tokens:projection.tokens,
      cssVariables:projection.cssVariables,
      panes
    });
  }
  applyToElement(element,{paneLayout=null,viewportWidth=undefined}={}){
    if(!element?.style||typeof element.style.setProperty!=='function')throw Error('STYLE_TARGET_REQUIRED');
    const projection=this.projection();
    for(const [name,value] of Object.entries(projection.cssVariables))element.style.setProperty(name,value);
    element.setAttribute?.('data-cep-ui-scale-scope','');
    element.setAttribute?.('data-cep-ui-scale',String(projection.scale));
    if(paneLayout){
      const panes=this.paneGeometry(paneLayout,viewportWidth);
      element.style.setProperty('--cep-ui-left-pane-width',px(panes.left.scaledEffectiveWidth));
      element.style.setProperty('--cep-ui-right-pane-width',px(panes.right.scaledEffectiveWidth));
    }
    return projection;
  }
}
