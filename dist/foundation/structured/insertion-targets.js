const clone=value=>structuredClone(value);

export const STRUCTURED_INSERTION_TARGET_CONTRACT=Object.freeze({
  id:'StructuredInsertionTargetOwner',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  policyRevision:'structured-insertion-target-w4b-r1'
});

const unavailable=(code,reason,extra={})=>({ok:false,code,reason,owner:'StructuredInsertionTargetOwner',...extra});
const available=(target,extra={})=>({ok:true,code:'AVAILABLE',reason:'',owner:'StructuredInsertionTargetOwner',target:clone(target),...extra});

/**
 * Read-only resolver for canonical Structured insertion gaps.
 * It derives parent/index/depth from StructuredTreeKernel truth and never mutates domain state.
 */
export class StructuredInsertionTargetOwner{
  constructor(adapter){
    if(!adapter?.treeKernel||!adapter?.commandAvailabilityOwner)throw Error('STRUCTURED_INSERTION_TARGET_ADAPTER_REQUIRED');
    this.owner='StructuredInsertionTargetOwner';
    this.contract=STRUCTURED_INSERTION_TARGET_CONTRACT;
    this.adapter=adapter;
  }
  _document(){return this.adapter.snapshot();}
  _ref(blockId){return blockId?this.adapter.treeKernel.findRef(this._document().blocks,blockId):null;}
  _decorate(target,{position,anchorBlockId=null}={}){
    const document=this._document(),parentId=target.parentId||null,parentRef=parentId?this.adapter.treeKernel.findRef(document.blocks,parentId):null,array=parentRef?.block?.children||document.blocks,index=Math.max(0,Math.min(Number(target.index)||0,array.length));
    return Object.freeze({
      kind:'gap',
      parentId,
      index,
      depth:parentRef?parentRef.depth+1:0,
      beforeBlockId:array[index]?.id||null,
      afterBlockId:index>0?array[index-1]?.id||null:null,
      anchorBlockId,
      position
    });
  }
  documentStart(){return available(this._decorate({parentId:null,index:0},{position:'document-start'}));}
  documentEnd(){const blocks=this._document().blocks;return available(this._decorate({parentId:null,index:blocks.length},{position:'document-end'}));}
  before(blockId){
    const ref=this._ref(blockId);if(!ref)return unavailable('UNKNOWN_BLOCK','Unknown Structured block',{blockId});
    return available(this._decorate({parentId:ref.parent?.id||null,index:ref.index},{position:'before',anchorBlockId:blockId}));
  }
  after(blockId){
    const ref=this._ref(blockId);if(!ref)return unavailable('UNKNOWN_BLOCK','Unknown Structured block',{blockId});
    return available(this._decorate({parentId:ref.parent?.id||null,index:ref.index+1},{position:'after',anchorBlockId:blockId}));
  }
  firstChild(blockId){
    const ref=this._ref(blockId);if(!ref)return unavailable('UNKNOWN_BLOCK','Unknown Structured block',{blockId});
    if(!this.adapter.treeKernel.canOwnChildren(ref.block.type))return unavailable('INVALID_CONTAINER','Target block cannot own Structured children',{blockId,blockType:ref.block.type});
    return available(this._decorate({parentId:blockId,index:0},{position:'first-child',anchorBlockId:blockId}));
  }
  lastChild(blockId){
    const ref=this._ref(blockId);if(!ref)return unavailable('UNKNOWN_BLOCK','Unknown Structured block',{blockId});
    if(!this.adapter.treeKernel.canOwnChildren(ref.block.type))return unavailable('INVALID_CONTAINER','Target block cannot own Structured children',{blockId,blockType:ref.block.type});
    return available(this._decorate({parentId:blockId,index:Array.isArray(ref.block.children)?ref.block.children.length:0},{position:'last-child',anchorBlockId:blockId}));
  }
  resolve(position,{blockId=null}={}){
    if(position==='document-start')return this.documentStart();
    if(position==='document-end')return this.documentEnd();
    if(position==='before')return this.before(blockId);
    if(position==='after')return this.after(blockId);
    if(position==='first-child')return this.firstChild(blockId);
    if(position==='last-child')return this.lastChild(blockId);
    return unavailable('UNKNOWN_INSERTION_POSITION','Unknown Structured insertion position',{position,blockId});
  }
  inspect(position,context={}){
    const resolved=this.resolve(position,context);if(!resolved.ok)return resolved;
    const commandContext={mode:context.mode||'edit',target:resolved.target,type:context.type||context.block?.type||'paragraph'};
    if(context.block)commandContext.block=clone(context.block);
    const availability=this.adapter.commandAvailabilityOwner.inspect('block.insert',commandContext);
    return {...resolved,enabled:!!availability.enabled,availability:clone(availability),availabilityOwner:availability.owner||this.adapter.commandAvailabilityOwner.owner};
  }
}
