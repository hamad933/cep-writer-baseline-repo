import {WINDOW_RESIZE_EDGES} from '../window-motion.js';

const clone=value=>structuredClone(value);
const finite=value=>Number.isFinite(Number(value));
const num=(value,fallback)=>finite(value)?Number(value):fallback;
const round=value=>Math.round(Number(value)*100)/100;
const clamp=(value,min,max)=>Math.min(Math.max(Number(value),min),max);
const EDGE_SET=new Set(WINDOW_RESIZE_EDGES);
const EDGE_ALIASES=Object.freeze({n:'top',s:'bottom',e:'right',w:'left',ne:'top-right',nw:'top-left',se:'bottom-right',sw:'bottom-left'});
const RESIZE_HANDLE_PRESENTATION=Object.freeze([
  {edge:'top',cursor:'ns-resize',style:'inset-inline:10px;top:-4px;height:9px;'},
  {edge:'bottom',cursor:'ns-resize',style:'inset-inline:10px;bottom:-4px;height:9px;'},
  {edge:'left',cursor:'ew-resize',style:'top:10px;bottom:10px;left:-4px;width:9px;'},
  {edge:'right',cursor:'ew-resize',style:'top:10px;bottom:10px;right:-4px;width:9px;'},
  {edge:'top-left',cursor:'nwse-resize',style:'top:-5px;left:-5px;width:14px;height:14px;'},
  {edge:'top-right',cursor:'nesw-resize',style:'top:-5px;right:-5px;width:14px;height:14px;'},
  {edge:'bottom-left',cursor:'nesw-resize',style:'bottom:-5px;left:-5px;width:14px;height:14px;'},
  {edge:'bottom-right',cursor:'nwse-resize',style:'bottom:-5px;right:-5px;width:16px;height:16px;',donorGrip:true}
]);
const normalizeResizeEdge=value=>{if(value===null||value===undefined||value==='')return null;const raw=String(value);const edge=EDGE_ALIASES[raw]||raw;if(!EDGE_SET.has(edge))throw Error('INVALID_STICKY_NOTE_RESIZE_EDGE:'+raw);return edge;};
const HOST_OWNERS=new WeakMap();
const OWNER_BRAND=Symbol('StickyNoteWindowOwner.brand');

export const STICKY_NOTE_WINDOW_OWNER='StickyNoteWindowOwner';
export const STICKY_NOTE_WINDOW_CONTRACT=Object.freeze({
  id:STICKY_NOTE_WINDOW_OWNER,
  version:'1.0.0',
  compatibility:'SEMVER',
  scope:'STICKY_NOTE_PRESENTATION_WINDOW_LIFECYCLE_ONLY',
  structuredContentTruth:false,
  sourceBindingTruth:false,
  persistenceTruth:false,
  platformNativeTruth:'CAPABILITY_BRIDGE_ONLY'
});
export const STICKY_NOTE_WINDOW_POLICY=Object.freeze({
  revision:'sticky-note-window-pw11-r3',
  minWidth:280,minHeight:180,defaultWidth:360,defaultHeight:330,
  defaultX:120,defaultY:120,viewportInset:8,titleReachabilityPx:48,
  keyboardMoveStep:12,keyboardResizeStep:16,baseZ:40,
  overflowStrategy:'WINDOW_INTERNAL_SCROLL_TO_BOTTOM_REGIONS'
});
export const STICKY_NOTE_PLATFORM_CAPABILITY=Object.freeze({UNAVAILABLE:'UNAVAILABLE',AVAILABLE:'AVAILABLE',ACTIVE:'ACTIVE',INACTIVE:'INACTIVE',DENIED:'DENIED'});
export const STICKY_NOTE_WINDOW_PRESENTATION=Object.freeze({
  owner:STICKY_NOTE_WINDOW_OWNER,
  revision:'sticky-note-donor-chrome-pw11-r1',
  donor:{id:'CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE',sha256:'ea66b58ef122bf2f8ca23fd0aa9e461b07da11ea7390c451902e4b1592d396fd'},
  extraction:'ACTUAL_ACCEPTED_LIBRARY_NOTE_CHROME_WITH_OE_004_CORRECTION',
  classes:Object.freeze({window:'stickynote',header:'notehead',source:'sourcechip',titleRow:'note-title-row',body:'notebody',format:'noteformat',status:'notestatus',donorResizeGrip:'resizegrip'}),
  chrome:Object.freeze({internalScroll:true,toolbarReachable:true,statusReachable:true,closeEffect:'HIDE_PRESENTATION_ONLY',pinScope:'CEP_PRESENTATION_ONLY',platformAlwaysOnTop:'CAPABILITY_GATED'}),
  resizeHandles:RESIZE_HANDLE_PRESENTATION
});

const defaultViewport=()=>({width:num(globalThis.innerWidth,1280),height:num(globalThis.innerHeight,720),topInset:8,rightInset:8,bottomInset:8,leftInset:8});
const defaultCapabilityBridge=Object.freeze({
  id:'browser-default-no-native-sticky-window-capability',
  capabilities(){return {alwaysOnTop:false,separateWindow:false};}
});
const presentationId=noteId=>`sticky-note::${encodeURIComponent(String(noteId))}`;

function assertHostGraph(hostGraph){if((typeof hostGraph!=='object'&&typeof hostGraph!=='function')||hostGraph===null)throw Error('STICKY_NOTE_HOST_GRAPH_OBJECT_REQUIRED');}
function assertOwner(owner){if(!owner||owner[OWNER_BRAND]!==true)throw Error('FAKE_STICKY_NOTE_WINDOW_OWNER_REJECTED');return owner;}
function attach(hostGraph,owner){assertHostGraph(hostGraph);assertOwner(owner);const existing=HOST_OWNERS.get(hostGraph);if(existing&&existing!==owner)throw Error('DUPLICATE_STICKY_NOTE_WINDOW_OWNER');HOST_OWNERS.set(hostGraph,owner);return owner;}
export function attachStickyNoteWindowOwner(hostGraph,owner){return attach(hostGraph,owner);}
export function validateStickyNoteWindowOwner(owner){return assertOwner(owner)===owner;}
export function stickyNoteWindowOwnerForHost(hostGraph){return HOST_OWNERS.get(hostGraph)||null;}

function capabilityShape(bridge){
  if(!bridge||typeof bridge.capabilities!=='function')return {bridge:defaultCapabilityBridge,alwaysOnTop:false,separateWindow:false};
  const raw=bridge.capabilities()||{};
  return {bridge,alwaysOnTop:raw.alwaysOnTop===true,separateWindow:raw.separateWindow===true};
}

export class StickyNoteWindowOwner {
  constructor({hostGraph=null,viewport=defaultViewport,policy={},capabilityBridge=defaultCapabilityBridge}={}){
    this.owner=STICKY_NOTE_WINDOW_OWNER;this.contract=STICKY_NOTE_WINDOW_CONTRACT;this[OWNER_BRAND]=true;
    this.hostGraph=hostGraph||{};
    this.viewport=typeof viewport==='function'?viewport:defaultViewport;
    this.policy=Object.freeze({...STICKY_NOTE_WINDOW_POLICY,...policy});
    this.capability=capabilityShape(capabilityBridge);
    this.windows=new Map();this.activePresentationId=null;this.zSequence=this.policy.baseZ;this.sequence=0;this.receipts=[];
    // Publish ownership only after every fallible constructor initialization step has succeeded.
    // A throwing capability bridge therefore cannot leave phantom canonical ownership behind.
    attach(this.hostGraph,this);
    this.platformUnsubscribe=typeof this.capability.bridge?.subscribe==='function'?this.capability.bridge.subscribe(event=>this._onPlatformWindowEvent(event)):null;
  }
  _record(action,detail={}){const receipt={sequence:++this.sequence,owner:this.owner,policyRevision:this.policy.revision,action,...clone(detail)};this.receipts.push(receipt);return clone(receipt);}
  _onPlatformWindowEvent(event={}){const state=[...this.windows.values()].find(item=>item.presentationId===event.presentationId);if(!state)return;if(event.type==='presentation-closed'||event.type==='provider-invalidated'){const separate=state.platform.separateWindow;separate.active=false;separate.requested=false;separate.requestStatus=event.type==='provider-invalidated'?'PROVIDER_LOST':'CLOSED_OBSERVED';separate.availability=event.type==='provider-invalidated'?STICKY_NOTE_PLATFORM_CAPABILITY.UNAVAILABLE:(separate.capabilityAdvertised?STICKY_NOTE_PLATFORM_CAPABILITY.AVAILABLE:STICKY_NOTE_PLATFORM_CAPABILITY.UNAVAILABLE);separate.code=event.code||separate.requestStatus;state.platform.alwaysOnTop.active=false;if(event.type==='provider-invalidated'){state.platform.alwaysOnTop.availability=STICKY_NOTE_PLATFORM_CAPABILITY.UNAVAILABLE;state.platform.alwaysOnTop.requestStatus='PROVIDER_LOST';state.platform.alwaysOnTop.code=event.code||'PLATFORM_WINDOW_PROVIDER_LOST';}this._record('platform.window.lifecycle',{noteId:state.noteId,presentationId:state.presentationId,eventType:event.type,code:event.code||null,contentDeleted:false,bindingDeleted:false,lifecycle:state.lifecycle});}}
  _viewportBounds(){
    const raw=this.viewport()||{},width=Math.max(1,num(raw.width,1280)),height=Math.max(1,num(raw.height,720)),fallback=this.policy.viewportInset;
    const left=Math.max(0,num(raw.leftInset,fallback)),top=Math.max(0,num(raw.topInset,fallback));
    const right=Math.max(left+1,width-Math.max(0,num(raw.rightInset,fallback))),bottom=Math.max(top+1,height-Math.max(0,num(raw.bottomInset,fallback)));
    return {width:round(width),height:round(height),left:round(left),top:round(top),right:round(right),bottom:round(bottom),availableWidth:round(right-left),availableHeight:round(bottom-top)};
  }
  _geometry(value={}){
    for(const key of ['x','y','width','height'])if(value[key]!==undefined&&!finite(value[key]))throw Error('INVALID_STICKY_NOTE_WINDOW_GEOMETRY_NONFINITE:'+key);
    if(value.width!==undefined&&Number(value.width)<=0)throw Error('INVALID_STICKY_NOTE_WINDOW_GEOMETRY_NONPOSITIVE:width');
    if(value.height!==undefined&&Number(value.height)<=0)throw Error('INVALID_STICKY_NOTE_WINDOW_GEOMETRY_NONPOSITIVE:height');
    const bounds=this._viewportBounds(),minWidth=Math.min(bounds.availableWidth,Math.max(1,num(this.policy.minWidth,280))),minHeight=Math.min(bounds.availableHeight,Math.max(1,num(this.policy.minHeight,180)));
    const width=clamp(num(value.width,this.policy.defaultWidth),minWidth,bounds.availableWidth),height=clamp(num(value.height,this.policy.defaultHeight),minHeight,bounds.availableHeight);
    const x=clamp(num(value.x,this.policy.defaultX),bounds.left,Math.max(bounds.left,bounds.right-width)),y=clamp(num(value.y,this.policy.defaultY),bounds.top,Math.max(bounds.top,bounds.bottom-height));
    return {x:round(x),y:round(y),width:round(width),height:round(height)};
  }
  _capabilityProjection(){return {
    alwaysOnTop:{capabilityAdvertised:this.capability.alwaysOnTop,availability:this.capability.alwaysOnTop?STICKY_NOTE_PLATFORM_CAPABILITY.AVAILABLE:STICKY_NOTE_PLATFORM_CAPABILITY.UNAVAILABLE,requested:false,requestStatus:'NOT_REQUESTED',active:false,code:this.capability.alwaysOnTop?'SUPPORTED_BY_BRIDGE':'NO_PLATFORM_BRIDGE_SUPPORT'},
    separateWindow:{capabilityAdvertised:this.capability.separateWindow,availability:this.capability.separateWindow?STICKY_NOTE_PLATFORM_CAPABILITY.AVAILABLE:STICKY_NOTE_PLATFORM_CAPABILITY.UNAVAILABLE,requested:false,requestStatus:'NOT_REQUESTED',active:false,code:this.capability.separateWindow?'SUPPORTED_BY_BRIDGE':'NO_PLATFORM_BRIDGE_SUPPORT'}
  };}
  register(noteId,{geometry={},open=true,pinned=false,invokerId=null,focusReturnId=null}={}){
    const id=String(noteId||'').trim();if(!id)throw Error('STICKY_NOTE_ID_REQUIRED');
    const existing=this.windows.get(id);if(existing)return this.window(id);
    const state={noteId:id,presentationId:presentationId(id),geometry:this._geometry(geometry),lifecycle:open?'open':'hidden',pinned:!!pinned,zOrder:++this.zSequence,focus:{invokerId:invokerId?String(invokerId):null,focusReturnId:focusReturnId?String(focusReturnId):invokerId?String(invokerId):null,lastFocusIntent:open?'WINDOW':'INVOKER'},platform:this._capabilityProjection()};
    this.windows.set(id,state);if(open)this.activePresentationId=state.presentationId;
    this._record('window.register',{noteId:id,presentationId:state.presentationId,lifecycle:state.lifecycle});return this.window(id);
  }
  _state(noteId){const state=this.windows.get(String(noteId));if(!state)throw Error('UNKNOWN_STICKY_NOTE_WINDOW:'+String(noteId));return state;}
  window(noteId){const state=this._state(noteId),active=state.presentationId===this.activePresentationId&&state.lifecycle==='open';return {...clone(state),active,minimized:{supported:false,status:'UNSUPPORTED'},viewport:this._viewportBounds(),owner:this.owner,policyRevision:this.policy.revision};}
  snapshot(){return {owner:this.owner,contract:this.contract,policyRevision:this.policy.revision,activePresentationId:this.activePresentationId,windows:[...this.windows.keys()].map(id=>this.window(id)),lastReceipt:this.receipts.length?clone(this.receipts.at(-1)):null};}
  activate(noteId){const state=this._state(noteId);if(state.lifecycle!=='open')return {ok:false,code:'WINDOW_HIDDEN',window:this.window(noteId)};this.activePresentationId=state.presentationId;state.zOrder=++this.zSequence;this._record('window.activate',{noteId:state.noteId,presentationId:state.presentationId,zOrder:state.zOrder,presentationOnly:true});return {ok:true,code:'ACTIVE',window:this.window(noteId)};}
  setPinned(noteId,pinned){const state=this._state(noteId);state.pinned=!!pinned;this._record('window.pin',{noteId:state.noteId,pinned:state.pinned,scope:'CEP_PRESENTATION_ONLY',osAlwaysOnTop:state.platform.alwaysOnTop.active});return this.window(noteId);}
  hide(noteId,{focusReturnId=null}={}){const state=this._state(noteId);state.lifecycle='hidden';if(this.activePresentationId===state.presentationId)this.activePresentationId=null;const target=focusReturnId?String(focusReturnId):state.focus.focusReturnId;state.focus.lastFocusIntent='INVOKER';this._record('window.hide',{noteId:state.noteId,presentationId:state.presentationId,contentDeleted:false,sourceDeleted:false,bindingDeleted:false,persistenceChanged:false,focusReturnId:target});return {window:this.window(noteId),focusReturnId:target};}
  open(noteId,{focus='window'}={}){const state=this._state(noteId);state.lifecycle='open';Object.assign(state.geometry,this._geometry(state.geometry));state.focus.lastFocusIntent=focus==='invoker'?'INVOKER':'WINDOW';this.activate(noteId);this._record('window.open',{noteId:state.noteId,presentationId:state.presentationId,reopenedIdentityPreserved:true,focusIntent:state.focus.lastFocusIntent});return this.window(noteId);}
  setGeometry(noteId,geometry,{reason='set'}={}){const state=this._state(noteId),before=clone(state.geometry),next=this._geometry({...state.geometry,...geometry});Object.assign(state.geometry,next);this._record('window.geometry',{noteId:state.noteId,reason,before,after:next});return this.window(noteId);}
  reclamp(noteId,{reason='viewport'}={}){const state=this._state(noteId),before=clone(state.geometry),next=this._geometry(state.geometry);Object.assign(state.geometry,next);this._record('window.reclamp',{noteId:state.noteId,reason,before,after:next,reachable:true,titleReachabilityPx:Math.min(this.policy.titleReachabilityPx,next.height)});return this.window(noteId);}
  reclampAll({reason='viewport'}={}){return [...this.windows.keys()].map(id=>this.reclamp(id,{reason}));}
  overflowProjection(noteId,{contentHeight=0,toolbarHeight=42,statusHeight=34,titleHeight=44}={}){const state=this._state(noteId),windowHeight=state.geometry.height,total=Math.max(0,num(contentHeight,0))+Math.max(0,num(toolbarHeight,0))+Math.max(0,num(statusHeight,0))+Math.max(0,num(titleHeight,0)),maxScroll=Math.max(0,total-windowHeight);return {owner:this.owner,noteId:state.noteId,strategy:this.policy.overflowStrategy,overflowY:'auto',internalScrollRequired:maxScroll>0,maxScroll:round(maxScroll),bottomToolbarReachable:true,statusRegionReachable:true};}
  presentation(noteId){const state=this._state(noteId),window=this.window(noteId);return {owner:this.owner,contract:this.contract,presentation:STICKY_NOTE_WINDOW_PRESENTATION,noteId:state.noteId,presentationId:state.presentationId,lifecycle:state.lifecycle,pinned:state.pinned,zOrder:state.zOrder,geometry:clone(state.geometry),platform:clone(state.platform),actions:{pin:{scope:'CEP_PRESENTATION_ONLY',pressed:state.pinned,label:state.pinned?'إلغاء تثبيت الملاحظة داخل CEP':'تثبيت الملاحظة داخل CEP'},separateWindow:{capability:state.platform.separateWindow.availability,scope:'OWNING_SURFACE',focusContext:'STICKY_NOTE',label:'فتح السطح المالك كاملًا في نافذة منفصلة مع إبقاء الملاحظة الحالية مركّزة'},close:{effect:'HIDE_PRESENTATION_ONLY',label:'إخفاء الملاحظة دون حذف محتواها'}},resizeHandles:RESIZE_HANDLE_PRESENTATION.map(handle=>({...handle})),keyboard:this.accessibleActions(noteId),viewport:window.viewport};}
  motionBinding(noteId,element,{edge=null}={}){const state=this._state(noteId);if(state.lifecycle!=='open')return null;const fallbackEdge=normalizeResizeEdge(edge),bounds=this._viewportBounds(),before=clone(state.geometry);return {id:state.presentationId,element,geometry:state.geometry,resizeEdge:fallbackEdge,resolveResizeEdge:target=>{const raw=target?.closest?.('[data-note-resize]')?.dataset?.noteResize;return raw?normalizeResizeEdge(raw):fallbackEdge},bounds:()=>{const b=this._viewportBounds();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom}},minWidth:this.policy.minWidth,minHeight:this.policy.minHeight,maxWidth:bounds.availableWidth,maxHeight:bounds.availableHeight,minimumVisibleTitle:this.policy.titleReachabilityPx,keepFullyVisible:true,commit:receipt=>{Object.assign(state.geometry,this._geometry(state.geometry));this.activate(noteId);this._record(receipt.action==='resize'?'window.pointer.resize':'window.pointer.move',{noteId:state.noteId,edge:receipt.edge,before,after:state.geometry,cancelled:false})},cancel:receipt=>{this._record('window.pointer.cancel',{noteId:state.noteId,edge:receipt.edge,before,after:state.geometry,cancelled:true,rollbackExact:JSON.stringify(before)===JSON.stringify(state.geometry)})}};}
  keyboardGeometry(noteId,event={},options={}){
    const key=String(event.key||'');if(event.altKey!==true||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(key))return {handled:false,code:'WINDOW_KEY_PASSTHROUGH',owner:this.owner};
    const state=this._state(noteId);if(state.lifecycle!=='open')return {handled:false,code:'WINDOW_HIDDEN',owner:this.owner};event.preventDefault?.();
    const resize=event.shiftKey===true,moveStep=Math.max(1,num(options.moveStep,this.policy.keyboardMoveStep)),resizeStep=Math.max(1,num(options.resizeStep,this.policy.keyboardResizeStep)),before=clone(state.geometry),next={...state.geometry};
    if(resize){if(key==='ArrowRight')next.width+=resizeStep;if(key==='ArrowLeft')next.width-=resizeStep;if(key==='ArrowDown')next.height+=resizeStep;if(key==='ArrowUp')next.height-=resizeStep;}else{if(key==='ArrowRight')next.x+=moveStep;if(key==='ArrowLeft')next.x-=moveStep;if(key==='ArrowDown')next.y+=moveStep;if(key==='ArrowUp')next.y-=moveStep;}
    Object.assign(state.geometry,this._geometry(next));this.activate(noteId);this._record(resize?'window.keyboard.resize':'window.keyboard.move',{noteId:state.noteId,key,before,after:state.geometry,globalKeymapShadowed:false});return {handled:true,code:resize?'KEYBOARD_RESIZE':'KEYBOARD_MOVE',window:this.window(noteId)};
  }
  accessibleActions(noteId){const state=this._state(noteId);return {owner:this.owner,noteId:state.noteId,move:{keys:'Alt+Arrow',label:'Move sticky note window',available:state.lifecycle==='open'},resize:{keys:'Alt+Shift+Arrow',label:'Resize sticky note window',available:state.lifecycle==='open',edges:[...WINDOW_RESIZE_EDGES]},close:{label:'Hide sticky note window without deleting note content',effect:'PRESENTATION_ONLY'}};}
  requestAlwaysOnTop(noteId,requested=true){const state=this._state(noteId),projection=state.platform.alwaysOnTop;projection.requested=!!requested;if(!this.capability.alwaysOnTop||typeof this.capability.bridge.requestAlwaysOnTop!=='function'){projection.capabilityAdvertised=false;projection.availability=STICKY_NOTE_PLATFORM_CAPABILITY.UNAVAILABLE;projection.requestStatus='UNAVAILABLE';projection.active=false;projection.code='UNAVAILABLE';const receipt=this._record('platform.always-on-top.request',{noteId:state.noteId,requested:!!requested,attempted:false,ok:false,code:'UNAVAILABLE',requestStatus:'UNAVAILABLE',active:false,capabilityAdvertised:false});return {ok:false,code:'UNAVAILABLE',projection:clone(projection),receipt};}
    let result;try{result=this.capability.bridge.requestAlwaysOnTop({noteId:state.noteId,presentationId:state.presentationId,requested:!!requested})||{};}catch{projection.capabilityAdvertised=true;projection.availability=STICKY_NOTE_PLATFORM_CAPABILITY.AVAILABLE;projection.requestStatus='ERROR';projection.active=false;projection.code='BRIDGE_ERROR';const receipt=this._record('platform.always-on-top.request',{noteId:state.noteId,requested:!!requested,attempted:true,ok:false,code:'BRIDGE_ERROR',requestStatus:'ERROR',active:false,capabilityAdvertised:true,bridgeId:this.capability.bridge.id||null});return {ok:false,code:'BRIDGE_ERROR',projection:clone(projection),receipt};}
    const confirmed=result.ok===true&&typeof result.active==='boolean'&&result.active===!!requested;projection.capabilityAdvertised=true;projection.active=confirmed?!!requested:false;projection.availability=confirmed?(requested?STICKY_NOTE_PLATFORM_CAPABILITY.ACTIVE:STICKY_NOTE_PLATFORM_CAPABILITY.INACTIVE):STICKY_NOTE_PLATFORM_CAPABILITY.DENIED;projection.requestStatus=confirmed?'SUCCEEDED':'DENIED';projection.code=confirmed?'BRIDGE_CONFIRMED':'BRIDGE_NOT_CONFIRMED';const receipt=this._record('platform.always-on-top.request',{noteId:state.noteId,requested:!!requested,attempted:true,ok:confirmed,code:projection.code,requestStatus:projection.requestStatus,active:projection.active,capabilityAdvertised:true,bridgeId:this.capability.bridge.id||null});return {ok:confirmed,code:projection.code,projection:clone(projection),receipt};}
  requestSeparateWindow(noteId){const state=this._state(noteId),projection=state.platform.separateWindow,detachScope='OWNING_SURFACE',focusContext={kind:'STICKY_NOTE',noteId:state.noteId,presentationId:state.presentationId},surfaceIntent={scope:detachScope,preserveRoute:true,preserveObject:true,preserveContext:true,focusedContext:clone(focusContext)};projection.requested=true;if(!this.capability.separateWindow||typeof this.capability.bridge.requestSeparateWindow!=='function'){projection.capabilityAdvertised=false;projection.availability=STICKY_NOTE_PLATFORM_CAPABILITY.UNAVAILABLE;projection.requestStatus='UNAVAILABLE';projection.active=false;projection.code='UNAVAILABLE';const receipt=this._record('platform.separate-window.request',{noteId:state.noteId,detachScope,focusContext,surfaceIntent,attempted:false,ok:false,code:'UNAVAILABLE',requestStatus:'UNAVAILABLE',active:false,capabilityAdvertised:false});return {ok:false,code:'UNAVAILABLE',detachScope,focusContext,surfaceIntent,projection:clone(projection),receipt};}
    let result;try{result=this.capability.bridge.requestSeparateWindow({noteId:state.noteId,presentationId:state.presentationId,detachScope,focusContext,surfaceIntent})||{};}catch{projection.capabilityAdvertised=true;projection.availability=STICKY_NOTE_PLATFORM_CAPABILITY.AVAILABLE;projection.requestStatus='ERROR';projection.active=false;projection.code='BRIDGE_ERROR';const receipt=this._record('platform.separate-window.request',{noteId:state.noteId,detachScope,focusContext,surfaceIntent,attempted:true,ok:false,code:'BRIDGE_ERROR',requestStatus:'ERROR',active:false,capabilityAdvertised:true,bridgeId:this.capability.bridge.id||null});return {ok:false,code:'BRIDGE_ERROR',detachScope,focusContext,surfaceIntent,projection:clone(projection),receipt};}
    const confirmed=result.ok===true&&result.active===true;projection.capabilityAdvertised=true;projection.active=confirmed;projection.availability=confirmed?STICKY_NOTE_PLATFORM_CAPABILITY.ACTIVE:STICKY_NOTE_PLATFORM_CAPABILITY.DENIED;projection.requestStatus=confirmed?'SUCCEEDED':'DENIED';projection.code=confirmed?'BRIDGE_CONFIRMED':'BRIDGE_NOT_CONFIRMED';const receipt=this._record('platform.separate-window.request',{noteId:state.noteId,detachScope,focusContext,surfaceIntent,attempted:true,ok:confirmed,code:projection.code,requestStatus:projection.requestStatus,active:projection.active,capabilityAdvertised:true,bridgeId:this.capability.bridge.id||null});return {ok:confirmed,code:projection.code,detachScope,focusContext,surfaceIntent,projection:clone(projection),receipt};}
}
