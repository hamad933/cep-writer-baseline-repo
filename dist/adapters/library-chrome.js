import {
  WORKSPACE_PANE_LAYOUT_OWNER,
  WORKSPACE_PANE_BRIDGE_SYMBOL
} from '../foundation/global/pane-layout.js';
import {
  TOOLBAR_TEMPLATE_OWNER,
  projectSaveStatus,
  projectToolbarHistoryState
} from '../foundation/global/toolbar-template.js';
import {
  TOP_REGION_PRESENTATION_OWNER,
  projectQuickJumpVisibility,
  projectReferenceReturnControls,
  renderQuickJumpPresentation
} from '../foundation/global/top-region.js';
import {
  CONTEXT_INSPECTOR_OWNER_ID,
  CONTEXT_INSPECTOR_PRESENTATION
} from '../foundation/global/context-inspector.js';
import {ACCESSIBILITY_FEEDBACK_OWNER} from '../foundation/global/feedback-contract.js';
import {BOTTOM_DEEP_WORK_OWNER} from '../foundation/global/bottom-shelf.js';

export const LIBRARY_CHROME_ADAPTER_OWNER='LibraryChromeAdapter';

function requireFunction(value,code){if(typeof value!=='function')throw Error(code);return value;}
function requirePaneBridge(scope=globalThis){const bridge=scope[Symbol.for(WORKSPACE_PANE_BRIDGE_SYMBOL)];if(bridge?.owner!==WORKSPACE_PANE_LAYOUT_OWNER)throw Error('WORKSPACE_PANE_LAYOUT_OWNER_REQUIRED');return bridge;}

export function createLibraryChromeAdapter({extension={},root=globalThis.document,scope=globalThis}={}){
  if(extension.domainKind!=='library')throw Error('LIBRARY_CHROME_ADAPTER_REQUIRES_LIBRARY_DOMAIN');
  if(!root)throw Error('LIBRARY_CHROME_ADAPTER_DOCUMENT_REQUIRED');
  const feedbackPublish=requireFunction(extension.feedbackPublish,'ACCESSIBILITY_FEEDBACK_OWNER_REQUIRED');
  const bottomSet=requireFunction(extension.bottomSet,'BOTTOM_DEEP_WORK_OWNER_BINDING_REQUIRED');
  const paneSnapshot=input=>({
    viewportWidth:Number(input.viewportWidth),focusMode:Boolean(input.focusMode),
    preferred:{left:input.preferred?.left,right:input.preferred?.right},
    widths:{left:Number(input.widths?.left),right:Number(input.widths?.right)},
    overrides:input.overrides
  });
  const adapter={
    owner:LIBRARY_CHROME_ADAPTER_OWNER,
    semanticOwner:false,presentationOwner:false,domainKind:'library',
    panes:{
      owner:WORKSPACE_PANE_LAYOUT_OWNER,
      effectiveState:(input,side)=>requirePaneBridge(scope).effectiveState(paneSnapshot(input),side),
      transition:(input,side,next,options={})=>requirePaneBridge(scope).transition(paneSnapshot(input),side,next,options),
      paneLimits:(input,side)=>requirePaneBridge(scope).paneLimits(paneSnapshot(input),side),
      effectiveWidths:input=>requirePaneBridge(scope).effectiveWidths(paneSnapshot(input)),
      resolveBand:input=>requirePaneBridge(scope).resolveBand(paneSnapshot(input)),
      resizeAvailable:(input,side)=>requirePaneBridge(scope).resizeAvailable(paneSnapshot(input),side),
      overlayPane:input=>requirePaneBridge(scope).overlayPane(paneSnapshot(input))
    },
    toolbar:{owner:TOOLBAR_TEMPLATE_OWNER,projectSaveStatus:(input={})=>projectSaveStatus(root,input),projectHistory:(input={})=>projectToolbarHistoryState(root,input)},
    top:{owner:TOP_REGION_PRESENTATION_OWNER,projectQuickJumpVisibility:(button,input={})=>projectQuickJumpVisibility(button,input),projectReferenceReturnControls:(controls,input={})=>projectReferenceReturnControls(controls,input),renderQuickJump:(host,input={})=>renderQuickJumpPresentation(host,input)},
    feedback:{owner:ACCESSIBILITY_FEEDBACK_OWNER,publish:input=>feedbackPublish(input)},
    context:{owner:CONTEXT_INSPECTOR_OWNER_ID,presentation:()=>{if(CONTEXT_INSPECTOR_PRESENTATION?.ownerId!==CONTEXT_INSPECTOR_OWNER_ID)throw Error('CONTEXT_INSPECTOR_PRESENTATION_OWNER_REQUIRED');return CONTEXT_INSPECTOR_PRESENTATION;}},
    bottom:{
      owner:BOTTOM_DEEP_WORK_OWNER,
      setOpen:(open,options={})=>bottomSet(Boolean(open),options),
      renderer:()=>typeof scope.CEPBlueprint?.bottomPresentationRenderer==='function'?scope.CEPBlueprint.bottomPresentationRenderer:null,
      render:options=>{const renderer=adapter.bottom.renderer();return renderer?renderer(options):false;},
      ready:()=>Boolean(adapter.bottom.renderer())
    },
    markConsumer(){const html=root.documentElement,body=root.body;if(html){html.dataset.libraryChromeAdapter=LIBRARY_CHROME_ADAPTER_OWNER;html.dataset.libraryChromeConsumer='library';}if(body)body.dataset.libraryChromeConsumer='library';return true;},
    descriptor(){return Object.freeze({owner:LIBRARY_CHROME_ADAPTER_OWNER,domainKind:'library',semanticOwner:false,presentationOwner:false,bindings:Object.freeze({panes:WORKSPACE_PANE_LAYOUT_OWNER,toolbar:TOOLBAR_TEMPLATE_OWNER,top:TOP_REGION_PRESENTATION_OWNER,feedback:ACCESSIBILITY_FEEDBACK_OWNER,context:CONTEXT_INSPECTOR_OWNER_ID,bottom:BOTTOM_DEEP_WORK_OWNER}),domainTruth:'LIBRARY_LOCAL__NO_GLOBAL_DOMAIN_STATE'});}
  };
  adapter.markConsumer();
  return Object.freeze(adapter);
}
