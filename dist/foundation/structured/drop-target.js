const clone=value=>structuredClone(value);

export const STRUCTURED_DROP_TARGET_CONTRACT=Object.freeze({
  id:'StructuredDropTargetPolicyOwner',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  policyRevision:'structured-drop-target-w4d-r1'
});

export const STRUCTURED_DROP_TARGET_POLICY=Object.freeze({
  targetKind:'gap',
  rootDropAllowed:true,
  strictIndexIdentity:true,
  strictDepthIdentity:true,
  mutationValidationOwner:'StructuredMutationKernel',
  availabilityOwner:'StructuredCommandAvailabilityOwner'
});

const deny=(owner,code,reason,target=null,extra={})=>({
  ok:false,enabled:false,owner,policyRevision:STRUCTURED_DROP_TARGET_CONTRACT.policyRevision,
  code,reason,target:target?clone(target):null,...clone(extra)
});

export class StructuredDropTargetPolicyOwner{
  constructor({readDocument,treeKernel,mutationKernel,commandAvailabilityOwner,policy=STRUCTURED_DROP_TARGET_POLICY}={}){
    if(typeof readDocument!=='function')throw Error('STRUCTURED_DROP_TARGET_DOCUMENT_READER_REQUIRED');
    if(!treeKernel?.findRef||!treeKernel?.containsId)throw Error('STRUCTURED_DROP_TARGET_TREE_KERNEL_REQUIRED');
    if(!mutationKernel?.validateMoveTarget)throw Error('STRUCTURED_DROP_TARGET_MUTATION_KERNEL_REQUIRED');
    if(!commandAvailabilityOwner?.inspect)throw Error('STRUCTURED_DROP_TARGET_AVAILABILITY_OWNER_REQUIRED');
    this.owner='StructuredDropTargetPolicyOwner';
    this.contract=STRUCTURED_DROP_TARGET_CONTRACT;
    this.policy=policy;
    this.readDocument=readDocument;
    this.treeKernel=treeKernel;
    this.mutationKernel=mutationKernel;
    this.commandAvailabilityOwner=commandAvailabilityOwner;
  }
  descriptor(){return {owner:this.owner,contract:this.contract,policy:clone(this.policy),mutationValidationOwner:this.mutationKernel.owner,availabilityOwner:this.commandAvailabilityOwner.owner};}
  _targetArray(document,parentId){
    if(parentId==null)return {ok:true,array:document.blocks,parent:null,depth:0,path:[]};
    const ref=this.treeKernel.findRef(document.blocks,parentId);
    if(!ref)return {ok:false,code:'INVALID_CONTAINER',reason:'Target parent is not present in the Structured document'};
    if(!this.treeKernel.canOwnChildren(ref.block.type))return {ok:false,code:'INVALID_CONTAINER',reason:'Target parent cannot own Structured children'};
    return {ok:true,array:Array.isArray(ref.block.children)?ref.block.children:[],parent:ref.block,depth:ref.depth+1,path:this.treeKernel.pathFor(document.blocks,parentId).map(block=>block.id)};
  }
  _normalize(document,target){
    if(!target||target.kind!==this.policy.targetKind)return {ok:false,code:'INVALID_TARGET',reason:'Structured drop targets must be canonical gap descriptors'};
    const parentId=target.parentId??null;
    if(parentId==null&&this.policy.rootDropAllowed===false)return {ok:false,code:'ROOT_DROP_DISABLED',reason:'Root-level drop targets are disabled by the central Structured drop-target policy'};
    const location=this._targetArray(document,parentId);if(!location.ok)return location;
    const index=Number(target.index);
    if(this.policy.strictIndexIdentity&&(!Number.isInteger(index)||index<0||index>location.array.length))return {ok:false,code:'INVALID_TARGET_INDEX',reason:'Drop target index is outside the canonical sibling boundary'};
    const resolvedIndex=Math.max(0,Math.min(Number.isFinite(index)?index:0,location.array.length));
    if(this.policy.strictDepthIdentity&&target.depth!=null&&Number(target.depth)!==location.depth)return {ok:false,code:'TARGET_DEPTH_MISMATCH',reason:'Drop target depth does not match the canonical parent path'};
    const expectedAfter=location.array[resolvedIndex-1]?.id??null,expectedBefore=location.array[resolvedIndex]?.id??null;
    if(target.afterBlockId!=null&&target.afterBlockId!==expectedAfter)return {ok:false,code:'STALE_TARGET_IDENTITY',reason:'Drop target afterBlockId no longer matches canonical sibling identity'};
    if(target.beforeBlockId!=null&&target.beforeBlockId!==expectedBefore)return {ok:false,code:'STALE_TARGET_IDENTITY',reason:'Drop target beforeBlockId no longer matches canonical sibling identity'};
    const normalized={kind:'gap',parentId,index:resolvedIndex,depth:location.depth,afterBlockId:expectedAfter,beforeBlockId:expectedBefore};
    return {ok:true,target:normalized,targetIdentity:`${parentId??'ROOT'}::${resolvedIndex}::${location.depth}`,parentPathIds:location.path,expectedAfterBlockId:expectedAfter,expectedBeforeBlockId:expectedBefore};
  }
  validate(sourceBlockId,target,{mode='edit',route='structured-reorder'}={}){
    const document=this.readDocument(),source=this.treeKernel.findRef(document.blocks,sourceBlockId);
    if(!source)return deny(this.owner,'UNKNOWN_BLOCK','Unknown Structured drag source',target);
    const normalized=this._normalize(document,target);if(!normalized.ok)return deny(this.owner,normalized.code,normalized.reason,target);
    const parentId=normalized.target.parentId;
    if(parentId===sourceBlockId)return deny(this.owner,'SELF_DROP','A Structured subtree cannot be dropped into itself',normalized.target,{targetIdentity:normalized.targetIdentity,parentPathIds:normalized.parentPathIds});
    if(parentId){const parentRef=this.treeKernel.findRef(document.blocks,parentId);if(parentRef&&this.treeKernel.containsId(source.block,parentRef.block.id))return deny(this.owner,'ILLEGAL_DESCENDANT_DROP','A Structured subtree cannot be dropped into one of its descendants',normalized.target,{targetIdentity:normalized.targetIdentity,parentPathIds:normalized.parentPathIds});}
    const availability=this.commandAvailabilityOwner.inspect('block.moveToGap',{mode,blockId:sourceBlockId,target:normalized.target,route});
    if(!availability.enabled)return deny(this.owner,availability.code,availability.reason,normalized.target,{targetIdentity:normalized.targetIdentity,parentPathIds:normalized.parentPathIds,availabilityOwner:availability.owner});
    return {ok:true,enabled:true,owner:this.owner,policyRevision:this.contract.policyRevision,code:'AVAILABLE',reason:'',target:clone(normalized.target),targetIdentity:normalized.targetIdentity,parentPathIds:[...normalized.parentPathIds],sourceBlockId,availabilityOwner:availability.owner,mutationValidationOwner:this.mutationKernel.owner};
  }
  targetFromBlock(sourceBlockId,targetBlockId,position='before'){
    const document=this.readDocument(),destination=this.treeKernel.findRef(document.blocks,targetBlockId);
    if(!destination)return deny(this.owner,'UNKNOWN_TARGET_BLOCK','Unknown Structured destination block',null);
    if(targetBlockId===sourceBlockId)return deny(this.owner,'SELF_DROP','A Structured block cannot be used as its own block target',null);
    const index=destination.index+(position==='after'?1:0),array=destination.array,target={kind:'gap',parentId:destination.parent?.id??null,index,depth:destination.depth,afterBlockId:array[index-1]?.id??null,beforeBlockId:array[index]?.id??null};
    return this.validate(sourceBlockId,target,{route:'block-target'});
  }
  keyboardTarget(sourceBlockId,direction){
    const document=this.readDocument(),source=this.treeKernel.findRef(document.blocks,sourceBlockId);
    if(!source)return deny(this.owner,'UNKNOWN_BLOCK','Unknown Structured keyboard reorder source',null);
    if(direction!=='up'&&direction!=='down')return deny(this.owner,'INVALID_KEYBOARD_DIRECTION','Keyboard reorder direction must be up or down',null);
    if(direction==='up'&&source.index===0)return deny(this.owner,'LEVEL_START','Source is already at the start of its structural level',null);
    if(direction==='down'&&source.index===source.array.length-1)return deny(this.owner,'LEVEL_END','Source is already at the end of its structural level',null);
    const index=direction==='up'?source.index-1:source.index+2,target={kind:'gap',parentId:source.parent?.id??null,index,depth:source.depth,afterBlockId:source.array[index-1]?.id??null,beforeBlockId:source.array[index]?.id??null};
    return this.validate(sourceBlockId,target,{route:`keyboard-${direction}`});
  }
}
