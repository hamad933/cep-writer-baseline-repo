import {clamp} from './models.js';

export const WINDOW_MOTION_OWNER='WindowMotion';
export const WINDOW_RESIZE_EDGES=Object.freeze(['left','right','top','bottom','top-left','top-right','bottom-left','bottom-right']);
const EDGE_SET=new Set(WINDOW_RESIZE_EDGES);
const finite=value=>Number.isFinite(Number(value));
const number=(value,fallback)=>finite(value)?Number(value):fallback;
const snapshot=geometry=>({x:Number(geometry.x),y:Number(geometry.y),width:Number(geometry.width),height:Number(geometry.height)});
const validGeometry=geometry=>geometry&&['x','y','width','height'].every(key=>finite(geometry[key]))&&Number(geometry.width)>0&&Number(geometry.height)>0;
const viewport=()=>({left:0,top:0,right:Math.max(1,number(globalThis.innerWidth,1280)),bottom:Math.max(1,number(globalThis.innerHeight,720))});
const resolveBounds=binding=>{
  const raw=typeof binding.bounds==='function'?binding.bounds():binding.bounds;
  if(!raw)return viewport();
  const left=number(raw.left,0),top=number(raw.top,0);
  const right=finite(raw.right)?Number(raw.right):left+Math.max(1,number(raw.width,number(globalThis.innerWidth,1280)));
  const bottom=finite(raw.bottom)?Number(raw.bottom):top+Math.max(1,number(raw.height,number(globalThis.innerHeight,720)));
  return {left,top,right:Math.max(left+1,right),bottom:Math.max(top+1,bottom)};
};
const limits=(binding,bounds)=>{
  const availableWidth=Math.max(1,bounds.right-bounds.left),availableHeight=Math.max(1,bounds.bottom-bounds.top);
  const minWidth=Math.min(availableWidth,Math.max(1,number(binding.minWidth,280)));
  const minHeight=Math.min(availableHeight,Math.max(1,number(binding.minHeight,180)));
  const maxWidth=Math.max(minWidth,Math.min(availableWidth,number(binding.maxWidth,availableWidth)));
  const maxHeight=Math.max(minHeight,Math.min(availableHeight,number(binding.maxHeight,availableHeight)));
  return {minWidth,minHeight,maxWidth,maxHeight};
};
const styleGeometry=(element,geometry)=>{if(!element?.style)return;Object.assign(element.style,{left:`${geometry.x}px`,top:`${geometry.y}px`,width:`${geometry.width}px`,height:`${geometry.height}px`});};
const normalizedMove=(before,dx,dy,binding)=>{
  const bounds=resolveBounds(binding),limit=limits(binding,bounds),width=clamp(before.width,limit.minWidth,limit.maxWidth),height=clamp(before.height,limit.minHeight,limit.maxHeight);
  const titleVisible=Math.max(1,number(binding.minimumVisibleTitle,60));
  // Preserve the accepted legacy move contract by default: the window stays fully
  // reachable horizontally while a title/drag region remains reachable vertically.
  // StickyNoteWindowOwner opts into full containment explicitly.
  const xMax=Math.max(bounds.left,bounds.right-width);
  const yMax=binding.keepFullyVisible===true?Math.max(bounds.top,bounds.bottom-height):bounds.bottom-Math.min(titleVisible,height);
  return {x:clamp(before.x+dx,bounds.left,Math.max(bounds.left,xMax)),y:clamp(before.y+dy,bounds.top,Math.max(bounds.top,yMax)),width,height};
};
const edgeResize=(before,dx,dy,edge,binding)=>{
  const bounds=resolveBounds(binding),limit=limits(binding,bounds);
  let left=before.x,top=before.y,right=before.x+before.width,bottom=before.y+before.height;
  if(edge.includes('left'))left=clamp(before.x+dx,Math.max(bounds.left,right-limit.maxWidth),right-limit.minWidth);
  if(edge.includes('right'))right=clamp(before.x+before.width+dx,left+limit.minWidth,Math.min(bounds.right,left+limit.maxWidth));
  if(edge.includes('top'))top=clamp(before.y+dy,Math.max(bounds.top,bottom-limit.maxHeight),bottom-limit.minHeight);
  if(edge.includes('bottom'))bottom=clamp(before.y+before.height+dy,top+limit.minHeight,Math.min(bounds.bottom,top+limit.maxHeight));
  return {x:left,y:top,width:right-left,height:bottom-top};
};
const legacyResize=(before,dx,dy,binding)=>{
  const widthMax=Math.max(280,number(globalThis.innerWidth,1280)-12),heightMax=Math.max(180,number(globalThis.innerHeight,720)-12);
  return {x:before.x,y:before.y,width:clamp(before.width+dx*(binding.resizeSign||1),280,widthMax),height:clamp(before.height+dy,180,heightMax)};
};

/**
 * Generic geometry normalization used by floating presentation owners for
 * non-pointer changes (keyboard/dialog/restore).  Semantic window lifecycle,
 * pinning and detach routing deliberately stay with their owning presentation
 * owners; WindowMotion remains geometry-only.
 */
export function constrainWindowGeometry(geometry,binding={}){
  if(!validGeometry(geometry))throw Error('WINDOW_GEOMETRY_INVALID');
  const bounds=resolveBounds(binding),limit=limits(binding,bounds);
  const width=clamp(Number(geometry.width),limit.minWidth,limit.maxWidth),height=clamp(Number(geometry.height),limit.minHeight,limit.maxHeight);
  const titleVisible=Math.max(1,number(binding.minimumVisibleTitle,60));
  const xMax=Math.max(bounds.left,bounds.right-width);
  const yMax=binding.keepFullyVisible===true?Math.max(bounds.top,bounds.bottom-height):bounds.bottom-Math.min(titleVisible,height);
  return {x:clamp(Number(geometry.x),bounds.left,xMax),y:clamp(Number(geometry.y),bounds.top,Math.max(bounds.top,yMax)),width,height};
}

/**
 * The single generic pointer geometry owner shared by Sticky Notes and Operational windows.
 * Existing {resize, resizeSign} callers remain supported; new callers may provide resizeEdge.
 */
export class WindowMotion {
  constructor(resolve){this.resolve=resolve;this.active=null;this.receipts=[];}
  down(e){
    if(e.button!==0)return false;
    const binding=this.resolve(e.target);if(!binding||!validGeometry(binding.geometry))return false;
    const resolved=typeof binding.resolveResizeEdge==='function'?binding.resolveResizeEdge(e.target,e):binding.resizeEdge;
    const edge=resolved==null?null:String(resolved);
    if(edge&&!EDGE_SET.has(edge))return false;
    if(e.target?.closest?.('button')&&!binding.resize&&!edge)return false;
    e.preventDefault?.();
    const before=snapshot(binding.geometry);
    this.active={...binding,resizeEdge:edge,start:{x:number(e.clientX,0),y:number(e.clientY,0)},before,pointerId:e.pointerId};
    binding.element?.setPointerCapture?.(e.pointerId);
    return true;
  }
  move(e){
    const a=this.active;if(!a)return false;
    const dx=number(e.clientX,a.start.x)-a.start.x,dy=number(e.clientY,a.start.y)-a.start.y;
    let next;
    if(a.resizeEdge)next=edgeResize(a.before,dx,dy,a.resizeEdge,a);
    else if(a.resize)next=legacyResize(a.before,dx,dy,a);
    else next=normalizedMove(a.before,dx,dy,a);
    if(!validGeometry(next))return false;
    Object.assign(a.geometry,next);styleGeometry(a.element,next);a.preview?.(snapshot(next));return true;
  }
  up(){
    const a=this.active;if(!a)return false;
    const after=snapshot(a.geometry);this.active=null;a.element?.releasePointerCapture?.(a.pointerId);
    const receipt={owner:WINDOW_MOTION_OWNER,id:a.id,action:a.resizeEdge||a.resize?'resize':'move',edge:a.resizeEdge||null,cancelled:false,before:a.before,after};
    this.receipts.push(receipt);a.commit?.(receipt);return true;
  }
  cancel(reason='cancel'){
    const a=this.active;if(!a)return false;
    Object.assign(a.geometry,a.before);styleGeometry(a.element,a.before);this.active=null;a.element?.releasePointerCapture?.(a.pointerId);
    const receipt={owner:WINDOW_MOTION_OWNER,id:a.id,action:a.resizeEdge||a.resize?'resize':'move',edge:a.resizeEdge||null,cancelled:true,reason,before:a.before,after:snapshot(a.before)};
    this.receipts.push(receipt);
    // New callers may own an explicit rollback receipt. Legacy callers did not expose
    // cancel and historically received commit on pointer cancellation, so retain it.
    if(a.cancel)a.cancel(receipt);else a.commit?.(receipt);
    return true;
  }
}
