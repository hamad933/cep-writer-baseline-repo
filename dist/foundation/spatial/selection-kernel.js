import {SpatialFocusContract,SPATIAL_FOCUS_CONTRACT} from './focus-contract.js';
import {SpatialAccessibleNavigator,SPATIAL_ACCESSIBLE_NAVIGATOR_CONTRACT} from './accessible-navigator.js';

export const SPATIAL_SELECTION_OWNER_ID='SpatialSelectionNavigationKernel';
export const SPATIAL_SELECTION_CONTRACT=Object.freeze({id:'SpatialSelectionNavigationKernel',version:'1.0.0',owner:SPATIAL_SELECTION_OWNER_ID,receiptSchema:'SpatialSelectionReceipt@1'});
export const SPATIAL_NEIGHBOR_POLICY=Object.freeze({id:'SpatialNeighborPolicy',revision:'FW-C-NEIGHBOR-01',sideWeight:.45,tieBreak:'canonical-order',noNeighbor:'stay'});

function unique(values){return [...new Set(values)];}
function canonicalIds(ids,order){const known=new Set(order),requested=unique(ids);for(const id of requested)if(!known.has(id))throw Error('UNKNOWN_SPATIAL_ENDPOINT:'+id);const selected=new Set(requested);return order.filter(id=>selected.has(id));}
export function createSpatialProjectionDescriptor(nodes,{id='spatial-projection',owner='SpatialFamilyProjection',activeMode='author',point=(node)=>({x:Number(node.x||0)+66,y:Number(node.y||0)+31})}={}){const records=nodes.map(node=>({id:String(node.id),point:point(node)})),order=records.map(record=>record.id);if(new Set(order).size!==order.length)throw Error('DUPLICATE_SPATIAL_OBJECT_ID');const points=Object.fromEntries(records.map(record=>[record.id,{x:Number(record.point.x),y:Number(record.point.y)}]));return Object.freeze({id,owner,activeMode,order:Object.freeze([...order]),points:Object.freeze(points)});}

class KernelSelectionSet extends Set {
  constructor(kernel){super();this.kernel=kernel;this.internal=false;}
  _replace(ids){this.internal=true;super.clear();for(const id of ids)super.add(id);this.internal=false;return this;}
  add(id){if(this.internal)return super.add(id);this.kernel.add(id,{source:'compat-set.add'});return this;}
  delete(id){if(this.internal)return super.delete(id);const had=this.has(id);if(had)this.kernel.remove(id,{source:'compat-set.delete'});return had;}
  clear(){if(this.internal)return super.clear();this.kernel.clear({source:'compat-set.clear'});}
}

export class SpatialSelectionNavigationKernel {
  constructor(descriptor,policy=SPATIAL_NEIGHBOR_POLICY){this.ownerId=SPATIAL_SELECTION_OWNER_ID;this.contract=SPATIAL_SELECTION_CONTRACT;this.policy=policy;this.focusContract=new SpatialFocusContract();this.selected=new KernelSelectionSet(this);this.revision=0;this.lastAction='initialize';this.setDescriptor(descriptor,{emit:false});}
  setDescriptor(descriptor,{emit=true}={}){if(!descriptor?.order||!descriptor?.points)throw Error('SPATIAL_PROJECTION_DESCRIPTOR_REQUIRED');this.descriptor=descriptor;const kept=[...this.selected].filter(id=>descriptor.order.includes(id));this.selected._replace(canonicalIds(kept,descriptor.order));this.focusContract.reconcile(descriptor.order,[...this.selected]);this.navigator=new SpatialAccessibleNavigator(descriptor,this.policy);if(emit)this.touch('projection-reconcile');return this.receipt('projection-reconcile');}
  setPolicy(policy){this.policy=policy;this.navigator.setPolicy(policy);return this;}
  touch(action){this.lastAction=action;this.revision++;return this.receipt(action);}
  assertKnown(id){if(!this.descriptor.order.includes(id))throw Error('UNKNOWN_SPATIAL_ENDPOINT:'+id);return id;}
  replace(ids,{focus=true,anchor=true,source='replace'}={}){const ordered=canonicalIds(ids,this.descriptor.order);this.selected._replace(ordered);if(ordered.length){if(focus)this.focusContract.focus(ordered.at(-1),this.descriptor.order);if(anchor)this.focusContract.anchor(ordered[0],this.descriptor.order);}else this.focusContract.reconcile(this.descriptor.order,[]);return this.touch(source);}
  add(id,{focus=true,anchor=false,source='add'}={}){this.assertKnown(id);const ordered=canonicalIds([...this.selected,id],this.descriptor.order);this.selected._replace(ordered);if(focus)this.focusContract.focus(id,this.descriptor.order);if(anchor||!this.focusContract.anchorId)this.focusContract.anchor(id,this.descriptor.order);return this.touch(source);}
  remove(id,{source='remove'}={}){this.assertKnown(id);const ordered=[...this.selected].filter(item=>item!==id);this.selected._replace(ordered);this.focusContract.reconcile(this.descriptor.order,ordered);return this.touch(source);}
  toggle(id,{source='toggle'}={}){this.assertKnown(id);if(this.selected.has(id))return this.remove(id,{source});return this.add(id,{focus:true,anchor:!this.selected.size,source});}
  clear({source='clear'}={}){this.selected._replace([]);this.focusContract.reconcile(this.descriptor.order,[]);return this.touch(source);}
  project(ids,{mode='replace',source='projection'}={}){if(mode==='replace')return this.replace(ids,{source});if(mode==='add'){const ordered=canonicalIds([...this.selected,...ids],this.descriptor.order);return this.replace(ordered,{source,focus:false,anchor:false});}if(mode==='toggle'){for(const id of ids)this.toggle(id,{source});return this.receipt(source);}throw Error('UNKNOWN_SPATIAL_SELECTION_MODE:'+mode);}
  focus(id,{source='focus'}={}){this.assertKnown(id);this.focusContract.focus(id,this.descriptor.order);return this.touch(source);}
  focusNext({extend=false,source='keyboard-next'}={}){return this.focusLinear(1,{extend,source});}
  focusPrevious({extend=false,source='keyboard-previous'}={}){return this.focusLinear(-1,{extend,source});}
  focusLinear(delta,{extend=false,source='keyboard-linear'}={}){const targetId=this.navigator.linear(this.focusContract.focusId,delta);if(targetId===null)return this.receipt(source);this.focusContract.focus(targetId,this.descriptor.order);if(extend)this.add(targetId,{focus:false,source});else this.touch(source);return this.receipt(source,{targetId,navigation:'linear'});}
  focusNeighbor(direction,{extend=false,source='keyboard-neighbor'}={}){const before=this.focusContract.focusId,result=this.navigator.neighbor(before,direction),targetId=result.targetId;this.focusContract.focus(targetId,this.descriptor.order);if(extend)this.add(targetId,{focus:false,source});else this.touch(source);return this.receipt(source,{targetId,fromId:before,direction,navigation:result.reason,policyRevision:this.policy.revision});}
  first({source='keyboard-first'}={}){const targetId=this.navigator.first();if(targetId!==null){this.focusContract.focus(targetId,this.descriptor.order);this.touch(source);}return this.receipt(source,{targetId,navigation:'first'});}
  last({source='keyboard-last'}={}){const targetId=this.navigator.last();if(targetId!==null){this.focusContract.focus(targetId,this.descriptor.order);this.touch(source);}return this.receipt(source,{targetId,navigation:'last'});}
  reconcile(nodesOrDescriptor){const descriptor=Array.isArray(nodesOrDescriptor)?createSpatialProjectionDescriptor(nodesOrDescriptor,{id:this.descriptor.id,owner:this.descriptor.owner,activeMode:this.descriptor.activeMode}):nodesOrDescriptor;return this.setDescriptor(descriptor,{emit:false});}
  receipt(action=this.lastAction,extra={}){const selectedIds=this.descriptor.order.filter(id=>this.selected.has(id));return Object.freeze({schema:this.contract.receiptSchema,ownerId:this.ownerId,contractVersion:this.contract.version,projectionId:this.descriptor.id,projectionOwner:this.descriptor.owner,activeMode:this.descriptor.activeMode,policyRevision:this.policy.revision,revision:this.revision,action,selectedIds:Object.freeze([...selectedIds]),selectionCount:selectedIds.length,focusId:this.focusContract.focusId,anchorId:this.focusContract.anchorId,...extra});}
  descriptorReceipt(){return this.receipt('descriptor');}
}

export const SPATIAL_SELECTION_SUBCONTRACTS=Object.freeze({focus:SPATIAL_FOCUS_CONTRACT,accessibleNavigator:SPATIAL_ACCESSIBLE_NAVIGATOR_CONTRACT});
