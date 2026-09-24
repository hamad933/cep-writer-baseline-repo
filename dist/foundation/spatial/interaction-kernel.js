export const SPATIAL_INTERACTION_OWNER_ID='SpatialInteractionKernel';
export const SPATIAL_INTERACTION_CONTRACT=Object.freeze({
  id:'SpatialInteractionKernel',
  version:'1.0.0',
  owner:SPATIAL_INTERACTION_OWNER_ID,
  compatibility:'SEMVER',
  responsibilities:Object.freeze(['camera','pointer-gesture','marquee-handoff','geometry-mutation','geometry-history','mutation-mode-guard'])
});

const clone=x=>structuredClone(x);
const clampValue=(x,a,b)=>Math.min(b,Math.max(a,x));
const finiteNumber=value=>Number.isFinite(value);
const finitePoint=point=>!!point&&finiteNumber(point.x)&&finiteNumber(point.y);
const finiteCamera=camera=>!!camera&&finiteNumber(camera.x)&&finiteNumber(camera.y)&&finiteNumber(camera.zoom);
const finiteNode=node=>!!node&&finiteNumber(node.x)&&finiteNumber(node.y);
const finiteNodes=nodes=>Array.isArray(nodes)&&nodes.every(finiteNode);
const finiteSnapshot=snapshot=>!!snapshot&&Array.isArray(snapshot.nodes)&&Array.isArray(snapshot.edges)&&finiteNodes(snapshot.nodes)&&finiteCamera(snapshot.camera);
const preparedSnapshot=snapshot=>{
  if(!finiteSnapshot(snapshot))return false;
  try{return {nodes:clone(snapshot.nodes),edges:clone(snapshot.edges),camera:clone(snapshot.camera)}}catch{return false}
};

export function gestureIntent({button,ctrlKey,space,onNode}){
  if(button===1||(button===0&&space))return 'pan';
  if(button===2&&ctrlKey)return 'pending-pan';
  if(button===2)return 'context';
  return onNode?'move':'marquee';
}

/**
 * Family owner for reusable Spatial presentation interaction mechanics.
 * Selection/focus/navigation remain owned by SpatialSelectionNavigationKernel;
 * canonical relation/runtime truth is never stored here.
 */
export class SpatialInteractionKernel {
  constructor(model){this.model=model;this.ownerId=SPATIAL_INTERACTION_OWNER_ID;this.contract=SPATIAL_INTERACTION_CONTRACT;}

  setActiveMode(mode='author'){
    if(!['author','live','recorded','review'].includes(mode))throw Error('INVALID_SPATIAL_ACTIVE_MODE:'+mode);
    this.model.activeMode=mode;
    return this.model.syncSelectionProjection();
  }

  geometryMutationAvailability({minimumSelection=0,action='spatial.geometry'}={}){
    const activeMode=this.model.activeMode;
    if(!['author','live'].includes(activeMode))return {enabled:false,reason:'Recorded spatial projection is read only',code:'MODE_FORBIDS_ACTION',activeMode,action};
    if(this.model.selection.size<minimumSelection)return {enabled:false,reason:`Select at least ${minimumSelection} object${minimumSelection===1?'':'s'}`,code:'SELECTION_COUNT',activeMode,action};
    return {enabled:true,reason:'',code:'AVAILABLE',activeMode,action};
  }

  canMutateGeometry(){return this.geometryMutationAvailability().enabled;}

  snapshot(){return {nodes:clone(this.model.nodes),edges:clone(this.model.edges),camera:clone(this.model.camera)};}
  checkpoint(){const frame=this.snapshot();if(!finiteSnapshot(frame))return false;this.model.history.push(frame);this.model.future=[];}
  restore(snapshot){const next=preparedSnapshot(snapshot);if(!next)return false;this.model.nodes=next.nodes;this.model.edges=next.edges;this.model.camera=next.camera;this.model.syncSelectionProjection();}
  undo(){
    if(!this.canMutateGeometry())return false;
    const frame=preparedSnapshot(this.model.history.at(-1));
    if(!frame)return false;
    const current=preparedSnapshot(this.snapshot());
    if(!current)return false;
    this.model.history.pop();
    this.model.future.push(current);
    this.model.nodes=frame.nodes;this.model.edges=frame.edges;this.model.camera=frame.camera;this.model.syncSelectionProjection();
    return true;
  }
  redo(){
    if(!this.canMutateGeometry())return false;
    const frame=preparedSnapshot(this.model.future.at(-1));
    if(!frame)return false;
    const current=preparedSnapshot(this.snapshot());
    if(!current)return false;
    this.model.future.pop();
    this.model.history.push(current);
    this.model.nodes=frame.nodes;this.model.edges=frame.edges;this.model.camera=frame.camera;this.model.syncSelectionProjection();
    return true;
  }

  world(x,y){
    if(!finiteNumber(x)||!finiteNumber(y)||!finiteCamera(this.model.camera))return false;
    const point={x:(x-this.model.camera.x)/this.model.camera.zoom,y:(y-this.model.camera.y)/this.model.camera.zoom};
    return finitePoint(point)?point:false;
  }
  pan(dx,dy){
    if(!finiteNumber(dx)||!finiteNumber(dy)||!finiteCamera(this.model.camera))return false;
    const next={x:this.model.camera.x+dx,y:this.model.camera.y+dy,zoom:this.model.camera.zoom};
    if(!finiteCamera(next))return false;
    this.model.camera.x=next.x;this.model.camera.y=next.y;
    return clone(this.model.camera);
  }
  zoomAt(f,x,y){
    if(!finiteNumber(f)||!finiteNumber(x)||!finiteNumber(y)||!finiteCamera(this.model.camera))return false;
    const p=this.world(x,y);if(!p)return false;
    const zoom=clampValue(this.model.camera.zoom*f,.15,4),next={x:x-p.x*zoom,y:y-p.y*zoom,zoom};
    if(!finiteCamera(next))return false;
    this.model.camera=next;
    return clone(this.model.camera);
  }
  fit(w,h){
    const nodes=this.model.nodes;
    if(!nodes.length)return false;
    if(!finiteNumber(w)||!finiteNumber(h)||!finiteNodes(nodes)||!finiteCamera(this.model.camera))return false;
    const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);
    const minX=Math.min(...xs),minY=Math.min(...ys),maxX=Math.max(...xs)+132,maxY=Math.max(...ys)+62;
    if(![minX,minY,maxX,maxY].every(finiteNumber))return false;
    const z=clampValue(Math.min((w-60)/(maxX-minX),(h-60)/(maxY-minY)),.15,2);
    const next={x:(w-(maxX-minX)*z)/2-minX*z,y:(h-(maxY-minY)*z)/2-minY*z,zoom:z};
    if(!finiteCamera(next))return false;
    this.model.camera=next;
    return true;
  }

  move(ids,dx,dy){
    if(!this.canMutateGeometry())return false;
    if(!finiteNumber(dx)||!finiteNumber(dy))return false;
    const targets=this.model.nodes.filter(node=>ids.includes(node.id));
    const next=targets.map(node=>({node,x:node.x+dx,y:node.y+dy}));
    if(!targets.every(finiteNode)||!next.every(item=>finiteNumber(item.x)&&finiteNumber(item.y)))return false;
    for(const item of next){item.node.x=item.x;item.node.y=item.y}
    this.model.syncSelectionProjection();
    return true;
  }
  snapSelection(){
    if(!this.canMutateGeometry())return false;
    if(!this.model.snap){this.model.syncSelectionProjection();return true}
    if(!finiteNumber(this.model.grid))return false;
    const targets=this.model.nodes.filter(node=>this.model.selection.has(node.id));
    const next=targets.map(node=>({node,x:Math.round(node.x/this.model.grid)*this.model.grid,y:Math.round(node.y/this.model.grid)*this.model.grid}));
    if(!targets.every(finiteNode)||!next.every(item=>finiteNumber(item.x)&&finiteNumber(item.y)))return false;
    for(const item of next){item.node.x=item.x;item.node.y=item.y}
    this.model.syncSelectionProjection();
    return true;
  }
  align(axis){
    if(!this.canMutateGeometry())return false;
    if(!['x','y'].includes(axis))return false;
    const nodes=this.model.nodes.filter(node=>this.model.selection.has(node.id));
    if(nodes.length<2||!nodes.every(finiteNode))return false;
    const value=Math.min(...nodes.map(node=>node[axis]));
    if(!finiteNumber(value))return false;
    if(this.checkpoint()===false)return false;
    for(const node of nodes)node[axis]=value;
    this.model.syncSelectionProjection();
    return true;
  }
  distribute(axis){
    if(!this.canMutateGeometry())return false;
    if(!['x','y'].includes(axis))return false;
    const nodes=this.model.nodes.filter(node=>this.model.selection.has(node.id));
    if(nodes.length<3||!nodes.every(finiteNode))return false;
    const ordered=[...nodes].sort((a,b)=>a[axis]-b[axis]),step=(ordered.at(-1)[axis]-ordered[0][axis])/(ordered.length-1),start=ordered[0][axis];
    const next=ordered.map((node,index)=>({node,value:start+index*step}));
    if(!finiteNumber(step)||!next.every(item=>finiteNumber(item.value)))return false;
    if(this.checkpoint()===false)return false;
    for(const item of next)item.node[axis]=item.value;
    this.model.syncSelectionProjection();
    return true;
  }

  marquee(a,b,add=false){
    if(!finitePoint(a)||!finitePoint(b)||!finiteNodes(this.model.nodes))return false;
    const x1=Math.min(a.x,b.x),x2=Math.max(a.x,b.x),y1=Math.min(a.y,b.y),y2=Math.max(a.y,b.y);
    if(![x1,x2,y1,y2].every(finiteNumber))return false;
    const ids=[];
    for(const node of this.model.nodes){
      const right=node.x+132,bottom=node.y+62;
      if(!finiteNumber(right)||!finiteNumber(bottom))return false;
      if(right>=x1&&node.x<=x2&&bottom>=y1&&node.y<=y2)ids.push(node.id);
    }
    this.model.selectionKernel.project(ids,{mode:add?'add':'replace',source:'marquee'});
    return this.model.selectionReceipt('marquee');
  }

  beginPointerGesture({button,ctrlKey,space,node,start,before,selection,add,pointerId}){
    if(!finitePoint(start)||!finiteSnapshot(before))return false;
    const kind=gestureIntent({button,ctrlKey,space,onNode:!!node});
    return {kind,start,last:start,node,moved:false,before,selection:[...selection],add:!!add,ctrlRight:kind==='pending-pan',pointerId};
  }

  advancePointerGesture(gesture,point){
    if(!gesture||!finitePoint(point)||!finitePoint(gesture.last)||!finitePoint(gesture.start))return false;
    const dx=point.x-gesture.last.x,dy=point.y-gesture.last.y,distance=Math.hypot(point.x-gesture.start.x,point.y-gesture.start.y);
    if(!finiteNumber(dx)||!finiteNumber(dy)||!finiteNumber(distance))return false;
    if(distance>5)gesture.moved=true;
    const becamePan=gesture.kind==='pending-pan'&&gesture.moved;
    if(becamePan)gesture.kind='pan';
    gesture.last=point;
    return {dx,dy,becamePan,kind:gesture.kind,moved:gesture.moved};
  }

  finalizeMoveGesture(before){
    if(!this.canMutateGeometry()||!finiteSnapshot(before))return false;
    if(this.snapSelection()===false)return false;
    this.model.history.push(before);
    this.model.future=[];
    return true;
  }
}
