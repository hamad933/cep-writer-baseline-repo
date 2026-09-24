export const SPATIAL_ACCESSIBLE_NAVIGATOR_CONTRACT=Object.freeze({id:'SpatialAccessibleNavigator',version:'1.0.0',owner:'SpatialSelectionNavigationKernel'});
const DIRECTIONS=Object.freeze({left:[-1,0],right:[1,0],up:[0,-1],down:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]});

export class SpatialAccessibleNavigator {
  constructor(descriptor,policy){this.descriptor=descriptor;this.policy=policy;}
  setDescriptor(descriptor){this.descriptor=descriptor;return this;}
  setPolicy(policy){this.policy=policy;return this;}
  index(id){return this.descriptor.order.indexOf(id);}
  linear(currentId,delta){const order=this.descriptor.order;if(!order.length)return null;const current=this.index(currentId);const start=current<0?0:current;return order[Math.max(0,Math.min(order.length-1,start+delta))];}
  first(){return this.descriptor.order[0]||null;}
  last(){return this.descriptor.order.at(-1)||null;}
  neighbor(currentId,direction){const vector=DIRECTIONS[direction],order=this.descriptor.order;if(!vector||!order.length)return {targetId:currentId||order[0]||null,reason:'INVALID_DIRECTION'};const current=order.includes(currentId)?currentId:order[0],origin=this.descriptor.points[current];if(!origin)return {targetId:current,reason:'NO_ORIGIN'};const candidates=order.filter(id=>id!==current&&this.descriptor.points[id]).map(id=>{const point=this.descriptor.points[id],dx=point.x-origin.x,dy=point.y-origin.y,forward=dx*vector[0]+dy*vector[1],side=Math.abs(dx*vector[1]-dy*vector[0]),distance=Math.hypot(dx,dy),canonicalIndex=order.indexOf(id),score=forward+side*this.policy.sideWeight;return {id,forward,side,distance,canonicalIndex,score};}).filter(item=>item.forward>0).sort((a,b)=>a.score-b.score||a.forward-b.forward||a.side-b.side||a.distance-b.distance||(this.policy.tieBreak==='reverse-canonical'?b.canonicalIndex-a.canonicalIndex:a.canonicalIndex-b.canonicalIndex));
    if(candidates.length)return {targetId:candidates[0].id,reason:'GEOMETRIC_NEIGHBOR',candidate:candidates[0]};
    if(this.policy.noNeighbor==='wrap-canonical'){const sign=vector[0]+vector[1];return {targetId:sign>=0?order[0]:order.at(-1),reason:'WRAP_CANONICAL'};}
    return {targetId:current,reason:'STAY'};
  }
}
