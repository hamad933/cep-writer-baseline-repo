import {STRUCTURED_SELECTION_CONTRACT,STRUCTURED_SELECTION_POLICY} from './structured/selection-contract.js';
import {StructuredSelectionKernel} from './structured/selection-kernel.js';
import {StructuredSelectionDOMBridge,STRUCTURED_SELECTION_DOM_BRIDGE} from './structured/selection-dom-bridge.js';
import {StructuredClipboardTrustOwner,CLIPBOARD_TRUST_CONTRACT,CLIPBOARD_TRUST_POLICY} from './structured/clipboard-owner.js';
import {StructuredActionDescriptorOwner,STRUCTURED_ACTION_DESCRIPTOR_CONTRACT,STRUCTURED_ACTION_DESCRIPTOR_POLICY,structuredActionDescriptorPolicy,setStructuredSubtreeConfirmThreshold,requiresStructuredSubtreeConfirmation} from './structured/action-descriptors.js';
import {StructuredInsertionTargetOwner,STRUCTURED_INSERTION_TARGET_CONTRACT} from './structured/insertion-targets.js';
import {InputDirectionResolver,INPUT_DIRECTION_RESOLVER_CONTRACT,INPUT_DIRECTION_POLICY} from './global/input-direction.js';
import {StructuredRichContentOwner,STRUCTURED_RICH_CONTENT_CONTRACT,STRUCTURED_RICH_CONTENT_POLICY} from './structured/rich-content.js';
import {StructuredDropTargetPolicyOwner,STRUCTURED_DROP_TARGET_CONTRACT,STRUCTURED_DROP_TARGET_POLICY} from './structured/drop-target.js';
import {StructuredDragDropOwner,STRUCTURED_DRAG_DROP_CONTRACT,STRUCTURED_DRAG_DROP_POLICY} from './structured/drag-drop.js';
import {StructuredInputKeymapOwner,STRUCTURED_INPUT_KEYMAP_CONTRACT} from './structured/input-keymap.js';
// StructuredClipboardContract remains the public compatibility name; execution is owned by StructuredClipboardTrustOwner.
export const STRUCTURED_CLIPBOARD_CONTRACT=CLIPBOARD_TRUST_CONTRACT;
export const STRUCTURED_CLIPBOARD_POLICY=CLIPBOARD_TRUST_POLICY;
export {STRUCTURED_SELECTION_CONTRACT,STRUCTURED_SELECTION_POLICY,StructuredSelectionKernel,StructuredSelectionDOMBridge,STRUCTURED_SELECTION_DOM_BRIDGE,StructuredClipboardTrustOwner,StructuredActionDescriptorOwner,STRUCTURED_ACTION_DESCRIPTOR_CONTRACT,STRUCTURED_ACTION_DESCRIPTOR_POLICY,structuredActionDescriptorPolicy,setStructuredSubtreeConfirmThreshold,requiresStructuredSubtreeConfirmation,StructuredInsertionTargetOwner,STRUCTURED_INSERTION_TARGET_CONTRACT,InputDirectionResolver,INPUT_DIRECTION_RESOLVER_CONTRACT,INPUT_DIRECTION_POLICY,StructuredRichContentOwner,STRUCTURED_RICH_CONTENT_CONTRACT,STRUCTURED_RICH_CONTENT_POLICY,StructuredDropTargetPolicyOwner,STRUCTURED_DROP_TARGET_CONTRACT,STRUCTURED_DROP_TARGET_POLICY,StructuredDragDropOwner,STRUCTURED_DRAG_DROP_CONTRACT,STRUCTURED_DRAG_DROP_POLICY,StructuredInputKeymapOwner,STRUCTURED_INPUT_KEYMAP_CONTRACT};

const clone = value => structuredClone(value);

export const STRUCTURED_DOCUMENT_CONTRACT = Object.freeze({
  id: 'StructuredDocumentDomainAdapter',
  version: '1.1.0',
  compatibility: 'SEMVER',
  changePolicy: 'Compatible extensions may add optional capabilities; breaking changes require consumer migration records.'
});

export const STRUCTURED_TREE_CONTRACT = Object.freeze({
  id: 'StructuredTreeKernel',
  version: '1.0.0',
  compatibility: 'SEMVER',
  owner: 'Structured Family',
  policyRevision: 'structured-tree-vs01-r1'
});

export const STRUCTURED_BLOCK_TYPES = Object.freeze([
  Object.freeze({type:'paragraph',label:'فقرة',icon:'i-text',container:false,splittable:true}),
  Object.freeze({type:'h2',label:'عنوان رئيسي',icon:'i-type',container:false,splittable:true}),
  Object.freeze({type:'h3',label:'عنوان فرعي',icon:'i-type',container:false,splittable:true}),
  Object.freeze({type:'bullet',label:'عنصر قائمة نقطية',icon:'i-list',container:true,list:true,splittable:true}),
  Object.freeze({type:'number',label:'عنصر قائمة مرقمة',icon:'i-list',container:true,list:true,splittable:true}),
  Object.freeze({type:'toggle',label:'قسم قابل للطي',icon:'i-chev',container:true,toggle:true,splittable:false}),
  Object.freeze({type:'callout',label:'تنبيه',icon:'i-info',container:false,splittable:true}),
  Object.freeze({type:'quote',label:'اقتباس',icon:'i-quote',container:false,splittable:true}),
  Object.freeze({type:'code',label:'كتلة كود',icon:'i-code',container:false,splittable:false}),
  Object.freeze({type:'reference',label:'مرجع',icon:'i-ref',container:false,splittable:false})
]);

export const STRUCTURED_CAPABILITIES = Object.freeze(Object.fromEntries(
  STRUCTURED_BLOCK_TYPES.map(item=>[item.type,Object.freeze({
    container:!!item.container,
    list:!!item.list,
    toggle:!!item.toggle,
    splittable:!!item.splittable
  })])
));

export const STRUCTURED_ALLOWED_CHILDREN = Object.freeze({
  toggle:Object.freeze(STRUCTURED_BLOCK_TYPES.map(item=>item.type)),
  bullet:Object.freeze(['paragraph','bullet','number','toggle','callout','quote','code','reference']),
  number:Object.freeze(['paragraph','bullet','number','toggle','callout','quote','code','reference'])
});

export const STRUCTURED_TREE_SCHEMA = Object.freeze({
  id:'cep.structured-blocks.v1',
  version:1,
  blockTypes:Object.freeze(STRUCTURED_BLOCK_TYPES.map(item=>item.type)),
  maxDepth:6
});

const DEFAULT_SCHEMA = STRUCTURED_TREE_SCHEMA;
const DEFAULT_LOCAL_INDENT_LIMIT = 6;
const STRUCTURED_NON_STRUCTURAL_PATCH_FIELDS = Object.freeze(['html','title','titleHtml','open','align','dir','bg','background','codeText','annotations']);

export class StructuredTreeKernel {
  constructor(){
    this.contract=STRUCTURED_TREE_CONTRACT;
    this.schema=STRUCTURED_TREE_SCHEMA;
    this.blockTypes=STRUCTURED_BLOCK_TYPES;
    this.capabilities=STRUCTURED_CAPABILITIES;
    this.allowedChildren=STRUCTURED_ALLOWED_CHILDREN;
    this.owner='StructuredTreeKernel';
  }
  typeDefinition(type,{fallback=false}={}){
    const found=this.blockTypes.find(item=>item.type===type);
    return found||(fallback?this.blockTypes[0]:null);
  }
  hasType(type){return !!this.typeDefinition(type);}
  capabilitiesFor(type){return this.capabilities[type]||null;}
  canOwnChildren(type){return !!this.capabilitiesFor(type)?.container;}
  canContain(parentType,childType){
    if(parentType==null)return true;
    return !!this.allowedChildren[parentType]?.includes(childType);
  }
  walk(blocks,visitor,parent=null,depth=0){
    if(!Array.isArray(blocks))return true;
    for(let index=0;index<blocks.length;index++){
      const block=blocks[index];
      if(visitor(block,{parent,depth,index,array:blocks})===false)return false;
      if(block?.children?.length&&this.walk(block.children,visitor,block,depth+1)===false)return false;
    }
    return true;
  }
  findRef(blocks,id){
    let found=null;
    this.walk(blocks,(block,context)=>{
      if(block?.id===id){found={block,...context};return false}
    });
    return found;
  }
  maxBlockDepth(blocks){
    let maxDepth=0;
    this.walk(blocks,(_block,{depth})=>{maxDepth=Math.max(maxDepth,depth)});
    return maxDepth;
  }
  containsId(block,id){
    let contains=false;
    this.walk([block],candidate=>{if(candidate?.id===id){contains=true;return false}});
    return contains;
  }
  pathFor(blocks,id){
    let current=this.findRef(blocks,id);
    if(!current)return [];
    const path=[];
    while(current){
      path.unshift(current.block);
      current=current.parent?this.findRef(blocks,current.parent.id):null;
    }
    return path;
  }
  serializeBlocks(blocks){
    return (blocks||[]).map(block=>({
      id:block.id,
      type:block.type,
      title:block.title??null,
      titleHtml:block.titleHtml??null,
      open:block.open??null,
      align:block.align||'start',
      dir:block.dir||'auto',
      indent:Math.max(0,Math.min(DEFAULT_LOCAL_INDENT_LIMIT,Number(block?.indent)||0)),
      children:block.children?this.serializeBlocks(block.children):undefined
    }));
  }
  deserializeBlocks(value){
    const blocks=clone(value);
    const validation=this.validate(blocks);
    if(!validation.ok)throw Error(`INVALID_STRUCTURED_TREE:${validation.issues[0]?.code||'UNKNOWN'}`);
    return blocks;
  }
  validate(blocks){
    const issues=[];
    if(!Array.isArray(blocks))return {ok:false,owner:this.owner,contract:this.contract,issues:[{code:'BLOCK_ARRAY_REQUIRED'}],maxDepth:0};
    this.walk(blocks,(block,{parent,depth})=>{
      if(!block||typeof block.id!=='string'||!block.id)issues.push({code:'BLOCK_ID_REQUIRED',id:block?.id??null,depth});
      if(!this.hasType(block?.type))issues.push({code:'UNSUPPORTED_BLOCK_TYPE',id:block?.id??null,type:block?.type??null,depth});
      if(parent&&!this.canContain(parent.type,block?.type))issues.push({code:'INVALID_CHILD_CONTAINMENT',id:block?.id??null,type:block?.type??null,parentId:parent.id,parentType:parent.type,depth});
      if(depth>this.schema.maxDepth)issues.push({code:'MAX_DEPTH_EXCEEDED',id:block?.id??null,depth,maxDepth:this.schema.maxDepth});
    });
    return {ok:issues.length===0,owner:this.owner,contract:this.contract,issues,maxDepth:this.maxBlockDepth(blocks)};
  }
  validTree(blocks){return this.validate(blocks).ok;}
  receipt(blocks){
    const validation=this.validate(blocks);
    return {
      owner:this.owner,
      contract:this.contract,
      schema:{id:this.schema.id,version:this.schema.version,maxDepth:this.schema.maxDepth},
      valid:validation.ok,
      maxDepth:validation.maxDepth,
      blockCount:(()=>{let count=0;this.walk(blocks,()=>{count++});return count})()
    };
  }
}

export const STRUCTURED_TREE_KERNEL = Object.freeze(new StructuredTreeKernel());


export const STRUCTURED_MUTATION_CONTRACT = Object.freeze({
  id:'StructuredMutationKernel',
  version:'1.0.0',
  compatibility:'SEMVER',
  owner:'Structured Family',
  policyRevision:'structured-mutation-vs03-r1'
});

export const STRUCTURED_MUTATION_POLICY = Object.freeze({
  maxLocalIndent:6,
  moveToGapEnabled:true
});

const clampIndex=(value,length)=>Math.max(0,Math.min(Number.isFinite(Number(value))?Number(value):0,length));
const escapeStructuredHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

/**
 * Canonical deterministic Structured data-mutation owner.
 *
 * The kernel is deliberately DOM/history/selection agnostic. Every operation is
 * performed against a detached clone, validated against StructuredTreeKernel,
 * and committed only by the consumer after an OK receipt. A rejected mutation
 * therefore cannot partially mutate the caller's input tree.
 */
export class StructuredMutationKernel {
  constructor(treeKernel=STRUCTURED_TREE_KERNEL,policy=STRUCTURED_MUTATION_POLICY){
    this.owner='StructuredMutationKernel';this.contract=STRUCTURED_MUTATION_CONTRACT;this.treeKernel=treeKernel;this.policy=policy;
  }
  _ids(blocks){const seen=new Set(),duplicates=[];this.treeKernel.walk(blocks,block=>{if(seen.has(block?.id))duplicates.push(block?.id);else if(block?.id)seen.add(block.id)});return {seen,duplicates};}
  _validate(blocks){
    const tree=this.treeKernel.validate(blocks),identity=this._ids(blocks);
    const issues=[...tree.issues,...identity.duplicates.map(id=>({code:'DUPLICATE_BLOCK_ID',id}))];
    return {ok:issues.length===0,issues,maxDepth:tree.maxDepth};
  }
  _reject(original,intent,code,reason,meta={}){return {ok:false,changed:false,owner:this.owner,contract:this.contract,policy:this.policy,intent:clone(intent),code,reason,blocks:clone(original),meta:clone(meta)};}
  _complete(original,next,intent,meta={}){
    const validation=this._validate(next);
    if(!validation.ok)return this._reject(original,intent,validation.issues[0]?.code||'INVALID_STRUCTURED_TREE','Mutation would produce an invalid Structured tree',{...meta,issues:validation.issues});
    return {ok:true,changed:true,owner:this.owner,contract:this.contract,policy:this.policy,intent:clone(intent),code:'APPLIED',reason:'',blocks:next,meta:{...clone(meta),maxDepth:validation.maxDepth}};
  }
  _noChange(original,intent,code='NO_CHANGE',meta={}){return {ok:true,changed:false,owner:this.owner,contract:this.contract,policy:this.policy,intent:clone(intent),code,reason:'',blocks:clone(original),meta:clone(meta)};}
  _resolveGap(blocks,target,childType,subtree=null){
    if(!target||target.kind!=='gap')return {ok:false,code:'INVALID_TARGET',reason:'Structural target must be a gap'};
    if(!target.parentId)return {ok:true,array:blocks,parent:null,parentRef:null,depth:0,index:clampIndex(target.index,blocks.length)};
    const parentRef=this.treeKernel.findRef(blocks,target.parentId);
    if(!parentRef)return {ok:false,code:'INVALID_CONTAINER',reason:'Target parent is not a valid Structured container'};
    if(subtree&&this.treeKernel.containsId(subtree,parentRef.block.id))return {ok:false,code:'SELF_DESCENDANT_TARGET',reason:'Cannot move a subtree inside itself'};
    if(!this.treeKernel.canOwnChildren(parentRef.block.type))return {ok:false,code:'INVALID_CONTAINER',reason:'Target parent is not a valid Structured container'};
    if(!this.treeKernel.canContain(parentRef.block.type,childType))return {ok:false,code:'INVALID_CHILD_CONTAINMENT',reason:`${parentRef.block.type} cannot contain ${childType}`};
    const depth=parentRef.depth+1,subtreeDepth=subtree?this.treeKernel.maxBlockDepth([subtree]):0;
    if(depth+subtreeDepth>this.treeKernel.schema.maxDepth)return {ok:false,code:'MAX_DEPTH_EXCEEDED',reason:`Maximum structural depth is ${this.treeKernel.schema.maxDepth}`};
    if(!Array.isArray(parentRef.block.children))parentRef.block.children=[];
    return {ok:true,array:parentRef.block.children,parent:parentRef.block,parentRef,depth,index:clampIndex(target.index,parentRef.block.children.length)};
  }
  inspectIndent(blocks,id){
    const ref=this.treeKernel.findRef(blocks,id);
    if(!ref)return {ok:false,code:'UNKNOWN_BLOCK',reason:'Unknown Structured block'};
    if(ref.index>0){
      const parent=ref.array[ref.index-1],subtreeDepth=this.treeKernel.maxBlockDepth([ref.block]);
      if(parent&&this.treeKernel.canOwnChildren(parent.type)&&this.treeKernel.canContain(parent.type,ref.block.type)&&ref.depth+1+subtreeDepth<=this.treeKernel.schema.maxDepth)return {ok:true,mode:'structural',parentId:parent.id};
    }
    const indent=Math.max(0,Number(ref.block.indent)||0);
    if(indent<this.policy.maxLocalIndent)return {ok:true,mode:'local',indent};
    return {ok:false,code:'MAX_INDENT_REACHED',reason:'Maximum structural/local indent reached'};
  }
  inspectOutdent(blocks,id){
    const ref=this.treeKernel.findRef(blocks,id);
    if(!ref)return {ok:false,code:'UNKNOWN_BLOCK',reason:'Unknown Structured block'};
    const indent=Math.max(0,Number(ref.block.indent)||0);
    if(indent>0)return {ok:true,mode:'local',indent};
    if(!ref.parent)return {ok:false,code:'ROOT_OUTDENT',reason:'Root block cannot be structurally outdented'};
    const parentRef=this.treeKernel.findRef(blocks,ref.parent.id),grand=parentRef?.parent||null;
    if(!parentRef)return {ok:false,code:'PARENT_NOT_FOUND',reason:'Parent container cannot be resolved'};
    if(grand&&!this.treeKernel.canContain(grand.type,ref.block.type))return {ok:false,code:'INVALID_CHILD_CONTAINMENT',reason:`${grand.type} cannot contain ${ref.block.type}`};
    return {ok:true,mode:'structural',parentId:ref.parent.id,grandParentId:grand?.id||null};
  }
  canConvert(blocks,id,to){
    const ref=this.treeKernel.findRef(blocks,id);
    if(!ref)return {ok:false,code:'UNKNOWN_BLOCK',reason:'Unknown Structured block'};
    if(!this.treeKernel.hasType(to))return {ok:false,code:'UNSUPPORTED_BLOCK_TYPE',reason:`Unsupported Structured block type: ${to}`};
    if(ref.block.type===to)return {ok:true,changed:false,code:'NO_CHANGE'};
    if(ref.block.children?.length&&!this.treeKernel.canOwnChildren(to))return {ok:false,code:'CHILDREN_WOULD_BE_LOST',reason:'Target block type cannot contain the existing subtree'};
    if(ref.parent&&!this.treeKernel.canContain(ref.parent.type,to))return {ok:false,code:'INVALID_CHILD_CONTAINMENT',reason:`${ref.parent.type} cannot contain ${to}`};
    return {ok:true,changed:true,code:'AVAILABLE'};
  }
  validateMoveTarget(blocks,id,target){
    const src=this.treeKernel.findRef(blocks,id);
    if(!src)return {ok:false,code:'UNKNOWN_BLOCK',reason:'Unknown Structured block'};
    if(!this.policy.moveToGapEnabled)return {ok:false,code:'MOVE_TO_GAP_POLICY_DISABLED',reason:'Structural move-to-gap is disabled by the canonical mutation policy'};
    const resolved=this._resolveGap(blocks,target,src.block.type,src.block);
    if(!resolved.ok)return resolved;
    return {ok:true,code:'AVAILABLE',reason:'',parent:resolved.parent,parentId:resolved.parent?.id||null,index:resolved.index,depth:resolved.depth};
  }
  apply(blocks,intent,options={}){
    const original=clone(blocks||[]),baseline=this._validate(original);
    if(!baseline.ok)return this._reject(original,intent,'INVALID_INPUT_TREE','Input Structured tree is invalid',{issues:baseline.issues});
    if(!intent||typeof intent.type!=='string')return this._reject(original,intent,'MUTATION_INTENT_REQUIRED','Structured mutation intent is required');
    const next=clone(original),type=intent.type;
    if(type==='insert'){
      const block=clone(intent.block),known=this._ids(next).seen;
      if(!block?.id||!this.treeKernel.hasType(block.type))return this._reject(original,intent,'INVALID_STRUCTURED_BLOCK','Inserted block requires a valid id and type');
      if(known.has(block.id))return this._reject(original,intent,'DUPLICATE_BLOCK_ID','Inserted block identity already exists');
      const target=this._resolveGap(next,intent.target,block.type,block);if(!target.ok)return this._reject(original,intent,target.code,target.reason);
      target.array.splice(target.index,0,block);if(target.parent?.type==='toggle')target.parent.open=true;
      return this._complete(original,next,intent,{operation:'insert',focusId:block.id,parentId:target.parent?.id||null,index:target.index});
    }
    if(type==='replace'){
      const ref=this.treeKernel.findRef(next,intent.blockId),block=clone(intent.block);
      if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      if(!block?.id||block.id!==ref.block.id||!this.treeKernel.hasType(block.type))return this._reject(original,intent,'INVALID_REPLACEMENT','Replacement must preserve identity and use a supported type');
      if(ref.parent&&!this.treeKernel.canContain(ref.parent.type,block.type))return this._reject(original,intent,'INVALID_CHILD_CONTAINMENT',`${ref.parent.type} cannot contain ${block.type}`);
      ref.array[ref.index]=block;return this._complete(original,next,intent,{operation:'replace',focusId:block.id});
    }
    if(type==='duplicate'){
      const ref=this.treeKernel.findRef(next,intent.blockId),allocateId=options.allocateId;
      if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      if(typeof allocateId!=='function')return this._reject(original,intent,'IDENTITY_PROVIDER_REQUIRED','Duplicate requires an explicit identity provider');
      const known=this._ids(next).seen,created=[];
      const reseed=block=>{const copy=clone(block),id=String(allocateId({sourceId:block.id,created:[...created]})||'');if(!id||known.has(id))throw Object.assign(Error('DUPLICATE_IDENTITY_PROVIDER'),{code:'DUPLICATE_IDENTITY_PROVIDER'});known.add(id);created.push(id);copy.id=id;if(copy.children)copy.children=copy.children.map(reseed);return copy;};
      let duplicate;try{duplicate=reseed(ref.block)}catch(error){return this._reject(original,intent,error.code||'IDENTITY_PROVIDER_FAILED',error.message||'Identity provider failed')}
      ref.array.splice(ref.index+1,0,duplicate);return this._complete(original,next,intent,{operation:'duplicate',focusId:duplicate.id,createdIds:created,sourceId:intent.blockId});
    }
    if(type==='remove'||type==='removeMany'){
      const ids=new Set(type==='remove'?[intent.blockId]:(intent.blockIds||[]));if(!ids.size)return this._reject(original,intent,'BLOCK_ID_REQUIRED','Remove requires at least one block identity');
      let removed=0;const prune=array=>{for(let index=array.length-1;index>=0;index--){if(ids.has(array[index]?.id)){array.splice(index,1);removed++;continue}if(array[index]?.children?.length)prune(array[index].children)}};prune(next);
      if(!removed)return this._reject(original,intent,'UNKNOWN_BLOCK','No requested Structured block exists');
      return this._complete(original,next,intent,{operation:type,removedCount:removed,requestedIds:[...ids]});
    }
    if(type==='moveSibling'){
      const ref=this.treeKernel.findRef(next,intent.blockId);if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      const target=ref.index+Number(intent.delta||0);if(target<0||target>=ref.array.length)return this._noChange(original,intent,'EDGE_REACHED',{operation:'moveSibling'});
      const [block]=ref.array.splice(ref.index,1);ref.array.splice(target,0,block);return this._complete(original,next,intent,{operation:'moveSibling',focusId:block.id,index:target});
    }
    if(type==='moveSiblingToEdge'){
      const ref=this.treeKernel.findRef(next,intent.blockId);if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      if(!['start','end'].includes(intent.edge))return this._reject(original,intent,'INVALID_EDGE','Edge must be start or end');
      const target=intent.edge==='start'?0:ref.array.length-1;if(ref.index===target)return this._noChange(original,intent,'EDGE_REACHED',{operation:'moveSiblingToEdge'});
      const [block]=ref.array.splice(ref.index,1);ref.array.splice(intent.edge==='start'?0:ref.array.length,0,block);return this._complete(original,next,intent,{operation:'moveSiblingToEdge',focusId:block.id,edge:intent.edge});
    }
    if(type==='moveToGap'){
      const src=this.treeKernel.findRef(next,intent.blockId);if(!src)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      const validation=this.validateMoveTarget(next,intent.blockId,intent.target);if(!validation.ok)return this._reject(original,intent,validation.code,validation.reason);
      let target=this._resolveGap(next,intent.target,src.block.type,src.block);if(!target.ok)return this._reject(original,intent,target.code,target.reason);
      let index=target.index;const same=target.array===src.array;if(same&&src.index<index)index--;if(same&&index===src.index)return this._noChange(original,intent,'NO_CHANGE',{operation:'moveToGap',focusId:src.block.id});
      const [block]=src.array.splice(src.index,1);target=this._resolveGap(next,{...intent.target,index},block.type,block);if(!target.ok)return this._reject(original,intent,target.code,target.reason);
      target.array.splice(target.index,0,block);if(target.parent?.type==='toggle')target.parent.open=true;
      return this._complete(original,next,intent,{operation:'moveToGap',focusId:block.id,parentId:target.parent?.id||null,index:target.index,depth:target.depth});
    }
    if(type==='indent'){
      const inspection=this.inspectIndent(next,intent.blockId);if(!inspection.ok)return this._reject(original,intent,inspection.code,inspection.reason);
      const ref=this.treeKernel.findRef(next,intent.blockId);
      if(inspection.mode==='local'){ref.block.indent=Math.max(0,Number(ref.block.indent)||0)+1;return this._complete(original,next,intent,{operation:'indent',mode:'local',focusId:ref.block.id});}
      const parent=ref.array[ref.index-1],[block]=ref.array.splice(ref.index,1);block.indent=0;parent.children=Array.isArray(parent.children)?parent.children:[];parent.children.push(block);if(parent.type==='toggle')parent.open=true;
      return this._complete(original,next,intent,{operation:'indent',mode:'structural',focusId:block.id,parentId:parent.id});
    }
    if(type==='outdent'){
      const inspection=this.inspectOutdent(next,intent.blockId);if(!inspection.ok)return this._reject(original,intent,inspection.code,inspection.reason);
      const ref=this.treeKernel.findRef(next,intent.blockId);
      if(inspection.mode==='local'){ref.block.indent=Math.max(0,(Number(ref.block.indent)||0)-1);return this._complete(original,next,intent,{operation:'outdent',mode:'local',focusId:ref.block.id});}
      const parentRef=this.treeKernel.findRef(next,ref.parent.id),[block]=ref.array.splice(ref.index,1);parentRef.array.splice(parentRef.index+1,0,block);
      return this._complete(original,next,intent,{operation:'outdent',mode:'structural',focusId:block.id,parentId:parentRef.parent?.id||null});
    }
    if(type==='split'||type==='splitInsert'){
      const ref=this.treeKernel.findRef(next,intent.blockId);if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      if(!this.treeKernel.capabilitiesFor(ref.block.type)?.splittable||ref.block.type==='code')return this._reject(original,intent,'BLOCK_NOT_SPLITTABLE','Block does not support structural split');
      ref.block.html=String(intent.before??'');
      const additions=type==='split'?[clone(intent.newBlock)]:[clone(intent.insertedBlock),...(intent.tailBlock?[clone(intent.tailBlock)]:[])];
      const known=this._ids(next).seen;
      for(const block of additions){if(!block?.id||!this.treeKernel.hasType(block.type))return this._reject(original,intent,'INVALID_STRUCTURED_BLOCK','Split result requires valid block identities/types');if(known.has(block.id))return this._reject(original,intent,'DUPLICATE_BLOCK_ID','Split-generated identity already exists');if(ref.parent&&!this.treeKernel.canContain(ref.parent.type,block.type))return this._reject(original,intent,'INVALID_CHILD_CONTAINMENT',`${ref.parent.type} cannot contain ${block.type}`);known.add(block.id)}
      ref.array.splice(ref.index+1,0,...additions);return this._complete(original,next,intent,{operation:type,focusId:additions[0]?.id||ref.block.id,createdIds:additions.map(block=>block.id)});
    }
    if(type==='mergeBackward'){
      const ref=this.treeKernel.findRef(next,intent.blockId);if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      const text=String(intent.plainText??'');
      if(ref.parent?.type==='toggle'&&ref.index===0&&!text.trim()){const parentId=ref.parent.id;ref.array.splice(ref.index,1);return this._complete(original,next,intent,{operation:'mergeBackward',mode:'remove-empty-toggle-child',focusId:parentId});}
      if(ref.index===0){
        if(ref.parent){const out=this.inspectOutdent(next,intent.blockId);if(out.ok){if(out.mode==='local'){ref.block.indent=Math.max(0,(Number(ref.block.indent)||0)-1);return this._complete(original,next,intent,{operation:'mergeBackward',mode:'local-outdent',focusId:ref.block.id});}const parentRef=this.treeKernel.findRef(next,ref.parent.id),[block]=ref.array.splice(ref.index,1);parentRef.array.splice(parentRef.index+1,0,block);return this._complete(original,next,intent,{operation:'mergeBackward',mode:'outdent',focusId:block.id});}}
        if(ref.block.type==='bullet'||ref.block.type==='number'){ref.block.type='paragraph';ref.block.html='';delete ref.block.children;return this._complete(original,next,intent,{operation:'mergeBackward',mode:'list-exit',focusId:ref.block.id});}
        return this._noChange(original,intent,'NO_MERGE_TARGET',{operation:'mergeBackward'});
      }
      const previous=ref.array[ref.index-1];if(!previous||this.treeKernel.canOwnChildren(previous.type)||this.treeKernel.canOwnChildren(ref.block.type)||!this.treeKernel.capabilitiesFor(previous.type)?.splittable||!this.treeKernel.capabilitiesFor(ref.block.type)?.splittable)return this._noChange(original,intent,'NO_MERGE_TARGET',{operation:'mergeBackward'});
      previous.html=(previous.html||'')+(ref.block.html||'');ref.array.splice(ref.index,1);return this._complete(original,next,intent,{operation:'mergeBackward',mode:'merge',focusId:previous.id});
    }
    if(type==='mergeForward'){
      const ref=this.treeKernel.findRef(next,intent.blockId);if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      if(ref.index>=ref.array.length-1||this.treeKernel.canOwnChildren(ref.block.type)||!this.treeKernel.capabilitiesFor(ref.block.type)?.splittable)return this._noChange(original,intent,'NO_MERGE_TARGET',{operation:'mergeForward'});
      const following=ref.array[ref.index+1];if(this.treeKernel.canOwnChildren(following.type)||!this.treeKernel.capabilitiesFor(following.type)?.splittable)return this._noChange(original,intent,'NO_MERGE_TARGET',{operation:'mergeForward'});
      ref.block.html=(ref.block.html||'')+(following.html||'');ref.array.splice(ref.index+1,1);return this._complete(original,next,intent,{operation:'mergeForward',mode:'merge',focusId:ref.block.id});
    }
    if(type==='convertPlainText'){
      const ref=this.treeKernel.findRef(next,intent.blockId);if(!ref)return this._reject(original,intent,'UNKNOWN_BLOCK','Unknown Structured block');
      const from=ref.block.type,sourceText=String(intent.sourceText??''),sourceHtml=String(intent.sourceHtml??''),children=Array.isArray(ref.block.children)?ref.block.children.map(clone):[],grand=ref.parent||null;
      if(grand&&children.some(child=>!this.treeKernel.canContain(grand.type,child.type)))return this._reject(original,intent,'INVALID_CHILD_PROMOTION','One or more child blocks cannot be promoted into the parent container');
      const plain={id:ref.block.id,type:'paragraph',html:from==='code'?escapeStructuredHTML(sourceText):sourceHtml,align:ref.block.align||'start',dir:from==='code'?'auto':(ref.block.dir||'auto'),bg:'none',indent:Math.max(0,Number(ref.block.indent)||0)};
      ref.array.splice(ref.index,1,plain,...children);
      return this._complete(original,next,intent,{operation:'convertPlainText',focusId:plain.id,from,promotedChildIds:children.map(child=>child.id)});
    }
    if(type==='convert'){
      const availability=this.canConvert(next,intent.blockId,intent.to);if(!availability.ok)return this._reject(original,intent,availability.code,availability.reason);if(availability.changed===false)return this._noChange(original,intent,'NO_CHANGE',{operation:'convert'});
      const ref=this.treeKernel.findRef(next,intent.blockId),block=ref.block,from=block.type,to=intent.to,sourceHtml=String(intent.sourceHtml??(from==='toggle'?(block.titleHtml??block.title??''):(block.html??''))),sourceText=String(intent.sourceText??(from==='code'?(block.codeText??''):(block.title??''))),children=Array.isArray(block.children)?block.children:undefined,indent=Math.max(0,Number(block.indent)||0);
      block.type=to;block.indent=indent;
      if(to==='toggle'){block.title=sourceText;block.titleHtml=from==='code'?escapeStructuredHTML(sourceText):sourceHtml;block.children=children||[];block.open=true;delete block.html;if(block.dir==='ltr'&&from==='code')block.dir='auto'}
      else{if(to==='code'){block.codeText=sourceText;block.annotations=[];delete block.html;block.dir='ltr'}else{block.html=from==='code'?escapeStructuredHTML(sourceText):sourceHtml;if(from==='code')block.dir='auto'}if(from==='toggle'){delete block.title;delete block.titleHtml;delete block.open}if(this.treeKernel.canOwnChildren(to))block.children=children||[];else delete block.children}
      return this._complete(original,next,intent,{operation:'convert',focusId:block.id,from,to,lossAccepted:!!intent.lossAccepted});
    }
    return this._reject(original,intent,'UNKNOWN_MUTATION_INTENT',`Unknown Structured mutation intent: ${type}`);
  }
  receipt(blocks){const validation=this._validate(blocks);return {owner:this.owner,contract:this.contract,policy:clone(this.policy),treeOwner:this.treeKernel.owner,treePolicyRevision:this.treeKernel.contract.policyRevision,valid:validation.ok,issues:validation.issues};}
}

export const STRUCTURED_MUTATION_KERNEL = Object.freeze(new StructuredMutationKernel());

export const STRUCTURED_COMMAND_AVAILABILITY_CONTRACT = Object.freeze({
  id:'StructuredCommandAvailabilityOwner',version:'1.0.1',compatibility:'SEMVER',owner:'Structured Family',policyRevision:'structured-command-availability-vs05-r2-read-mode'
});

export const STRUCTURED_SHARED_COMMANDS = Object.freeze([
  ['history.undo','Undo / تراجع'],['history.redo','Redo / إعادة'],
  ['block.insert','Insert block / إدراج'],['block.duplicate','Duplicate block / تكرار'],['block.delete','Delete block / حذف'],['block.deleteMany','Delete selected blocks / حذف المحدد'],
  ['block.moveUp','Move up / تحريك لأعلى'],['block.moveDown','Move down / تحريك لأسفل'],['block.moveStart','Move to start / إلى البداية'],['block.moveEnd','Move to end / إلى النهاية'],['block.moveToGap','Move to structural target / نقل بنيوي'],
  ['block.indent','Indent / إدخال مستوى'],['block.outdent','Outdent / إخراج مستوى'],
  ['block.split','Split block / تقسيم'],['block.mergeBackward','Merge backward / دمج للخلف'],['block.mergeForward','Merge forward / دمج للأمام'],
  ['block.convert','Convert block / تحويل'],['block.plainText','Convert to plain text / نص عادي'],
  ['block.align','Block alignment / محاذاة'],['block.direction','Block direction / اتجاه'],['block.background','Block background / خلفية'],['block.clearStyle','Clear block style / مسح التنسيق'],
  ['document.commit','Save / حفظ'],['document.recoverAsNew','Recover as new / استرداد كنسخة جديدة']
].map(([id,label])=>Object.freeze({id,label})));
export const STRUCTURED_SHARED_COMMAND_IDS = Object.freeze(STRUCTURED_SHARED_COMMANDS.map(item=>item.id));
const STRUCTURED_SHARED_COMMAND_ID_SET = new Set(STRUCTURED_SHARED_COMMAND_IDS);
export const STRUCTURED_COMMAND_MUTABILITY_POLICY = Object.freeze(Object.fromEntries(STRUCTURED_SHARED_COMMAND_IDS.map(id=>[id,Object.freeze({
  class:id==='document.commit'?'checkpoint-persistence':id.startsWith('history.')?'history-document-mutation':id==='document.recoverAsNew'?'recovery-document-mutation':'document-mutation',
  persistentDocumentMutation:id!=='document.commit',
  readModeAllowed:id==='document.commit'
})])));
export const STRUCTURED_PERSISTENT_MUTATION_COMMAND_IDS = Object.freeze(STRUCTURED_SHARED_COMMAND_IDS.filter(id=>STRUCTURED_COMMAND_MUTABILITY_POLICY[id].persistentDocumentMutation));
const structuredBlockText = block => String(block?.html??block?.titleHtml??block?.title??block?.codeText??'').replace(/<[^>]*>/g,'').trim();

/** One Structured-family availability owner used by presentation projections and command preflight. */
export class StructuredCommandAvailabilityOwner {
  constructor(adapter){this.owner='StructuredCommandAvailabilityOwner';this.contract=STRUCTURED_COMMAND_AVAILABILITY_CONTRACT;this.adapter=adapter;}
  _no(code,reason,extra={}){return {enabled:false,code,reason,owner:this.owner,policyRevision:this.contract.policyRevision,...extra};}
  _yes(code='AVAILABLE',extra={}){return {enabled:true,code,reason:'',owner:this.owner,policyRevision:this.contract.policyRevision,...extra};}
  inspect(command,context={}){
    if(!STRUCTURED_SHARED_COMMAND_ID_SET.has(command))return this._no('UNKNOWN_COMMAND','Unknown structured command');
    const adapter=this.adapter,mode=context.mode||'edit',document=adapter.snapshot(),blockId=context.blockId||context.block?.id||null,ref=blockId?adapter.treeKernel.findRef(document.blocks,blockId):null;
    if(adapter.readOnly)return this._no('READ_ONLY','Structured document is read only');
    const mutability=STRUCTURED_COMMAND_MUTABILITY_POLICY[command];
    if(mode!=='edit'&&mutability.persistentDocumentMutation)return this._no('EDIT_MODE_REQUIRED','وضع القراءة غير قابل للتحرير؛ يتطلب هذا الأمر وضع التحرير.',{mutabilityClass:mutability.class,readModeAllowed:false});
    if(command==='history.undo'){const d=adapter.transactionDescriptor();return d.canUndo?this._yes('AVAILABLE',{historyIndex:d.historyIndex,historyLength:d.historyLength}):this._no('HISTORY_START','لا توجد معاملة سابقة للتراجع عنها',{historyIndex:d.historyIndex,historyLength:d.historyLength});}
    if(command==='history.redo'){const d=adapter.transactionDescriptor();return d.canRedo?this._yes('AVAILABLE',{historyIndex:d.historyIndex,historyLength:d.historyLength}):this._no('HISTORY_END','لا توجد معاملة لاحقة لإعادتها',{historyIndex:d.historyIndex,historyLength:d.historyLength});}
    if(command==='document.commit')return this._yes('AVAILABLE',{dirty:adapter.transactionDescriptor().dirty,persistedBoundaryConfigured:adapter.transactionDescriptor().persistedBoundaryConfigured});
    if(command==='document.recoverAsNew'){
      if(!context.recoveryId)return this._no('RECOVERY_REQUIRED','اختر نقطة استرداد صالحة أولًا');
      return adapter.listRecovery().some(item=>item.id===context.recoveryId)?this._yes():this._no('UNKNOWN_RECOVERY','نقطة الاسترداد غير موجودة');
    }
    if(command==='block.deleteMany'){
      const ids=[...new Set((context.blockIds||[]).map(String))];
      if(!ids.length)return this._no('SELECTION_REQUIRED','اختر كتلة واحدة على الأقل للحذف الجماعي');
      const missing=ids.filter(id=>!adapter.treeKernel.findRef(document.blocks,id));
      if(missing.length)return this._no('UNKNOWN_BLOCK','تتضمن المجموعة كتلة غير موجودة',{missingBlockIds:missing});
      return this._yes('AVAILABLE',{blockIds:ids,count:ids.length});
    }
    if(command==='block.insert'){
      const target=context.target;
      if(!target)return this._no('STRUCTURAL_TARGET_REQUIRED','يتطلب الإدراج هدفًا بنيويًا صالحًا');
      if(target.kind==='replace-empty'){
        const targetRef=adapter.treeKernel.findRef(document.blocks,target.blockId||blockId);
        if(!targetRef)return this._no('UNKNOWN_BLOCK','لا توجد كتلة مستهدفة');
        if(structuredBlockText(targetRef.block))return this._no('REPLACE_REQUIRES_EMPTY_BLOCK','الاستبدال في الموضع متاح فقط لعنصر فارغ');
        return this._yes('AVAILABLE',{targetKind:'replace-empty'});
      }
      if(target.kind==='caret')return context.intent?this._yes('AVAILABLE',{targetKind:'caret'}):this._no('SPLIT_INSERT_PAYLOAD_REQUIRED','يتطلب الإدراج عند موضع المؤشر حمولة split-insert صالحة');
      if(target.kind!=='gap')return this._no('INVALID_TARGET','Structural target must be a gap');
      const type=context.block?.type||context.type||'paragraph',probe={id:'__vs05_availability_probe__',type,html:''};
      const preview=adapter.mutationKernel.apply(document.blocks,{type:'insert',target,block:probe});
      return preview.ok?this._yes('AVAILABLE',{targetKind:'gap'}):this._no(preview.code,preview.reason);
    }
    if(!ref)return this._no('BLOCK_REQUIRED','لا توجد كتلة مستهدفة');
    if(command==='block.moveUp'||command==='block.moveStart')return ref.index>0?this._yes():this._no('LEVEL_START','العنصر في بداية المستوى',{index:ref.index});
    if(command==='block.moveDown'||command==='block.moveEnd')return ref.index<ref.array.length-1?this._yes():this._no('LEVEL_END','العنصر في نهاية المستوى',{index:ref.index,length:ref.array.length});
    if(command==='block.moveToGap'){
      if(!context.target)return this._no('STRUCTURAL_TARGET_REQUIRED','يتطلب النقل هدفًا بنيويًا صالحًا');
      const result=adapter.mutationKernel.validateMoveTarget(document.blocks,blockId,context.target);
      return result.ok?this._yes('AVAILABLE',{target:clone(context.target)}):this._no(result.code,result.reason);
    }
    if(command==='block.indent'){const result=adapter.mutationKernel.inspectIndent(document.blocks,blockId);return result.ok?this._yes('AVAILABLE',{mode:result.mode}):this._no(result.code,result.reason||'وصل العنصر إلى أقصى مستوى تداخل/إزاحة');}
    if(command==='block.outdent'){const result=adapter.mutationKernel.inspectOutdent(document.blocks,blockId);return result.ok?this._yes('AVAILABLE',{mode:result.mode}):this._no(result.code,result.reason||'العنصر عند الجذر ومن دون إزاحة محلية');}
    if(command==='block.delete'){
      let count=0;adapter.treeKernel.walk([ref.block],()=>count++);
      return this._yes('AVAILABLE',{destructive:true,subtreeCount:count,requiresStructuralConfirmation:requiresStructuredSubtreeConfirmation(count),confirmationThreshold:structuredActionDescriptorPolicy().subtreeConfirmThreshold});
    }
    if(command==='block.split'){
      if(!STRUCTURED_CAPABILITIES[ref.block.type]?.splittable)return this._no('BLOCK_NOT_SPLITTABLE','نوع الكتلة الحالي لا يدعم التقسيم');
      if(!context.newBlock&&!context.convertEmptyList)return this._no('SPLIT_PAYLOAD_REQUIRED','يتطلب التقسيم هوية ومحتوى الكتلة الجديدة');
      return this._yes();
    }
    if(command==='block.mergeBackward'){
      const preview=adapter.mutationKernel.apply(document.blocks,{type:'mergeBackward',blockId,plainText:context.plainText??structuredBlockText(ref.block)});
      return preview.ok&&preview.changed?this._yes('AVAILABLE',{previewMode:preview.meta?.mode}):this._no(preview.code||'MERGE_UNAVAILABLE',preview.reason||'لا توجد كتلة صالحة للدمج للخلف');
    }
    if(command==='block.mergeForward'){
      const preview=adapter.mutationKernel.apply(document.blocks,{type:'mergeForward',blockId});
      return preview.ok&&preview.changed?this._yes():this._no(preview.code||'MERGE_UNAVAILABLE',preview.reason||'لا توجد كتلة صالحة للدمج للأمام');
    }
    if(command==='block.convert'){
      const targetType=context.to||context.type;if(!targetType)return this._no('TARGET_BLOCK_TYPE_REQUIRED','اختر نوع الكتلة الهدف');
      const result=adapter.mutationKernel.canConvert(document.blocks,blockId,targetType);
      return result.ok?(result.changed===false?this._no('NO_CHANGE','الكتلة بالفعل من النوع المطلوب'):this._yes()):this._no(result.code,result.reason);
    }
    if(command==='block.align'&&!['start','center','end'].includes(context.value))return this._no('INVALID_ALIGNMENT','قيمة المحاذاة غير مدعومة');
    if(command==='block.direction'&&!['auto','rtl','ltr'].includes(context.value))return this._no('INVALID_DIRECTION','قيمة اتجاه النص غير مدعومة');
    if(command==='block.background'&&!['none','soft'].includes(context.value))return this._no('INVALID_BACKGROUND','قيمة الخلفية غير مدعومة');
    return this._yes();
  }
}

const DEFAULT_COMMANDS = Object.freeze([
  'document.updateTitle','document.insertBlock','document.updateBlock','document.removeBlock',
  'document.undo','document.redo','document.commit','document.recoverAsNew',
  'document.copy','document.cut','document.paste'
]);

function assertDocument(document){
  if(!document?.id||typeof document.id!=='string')throw Error('STRUCTURED_DOCUMENT_ID_REQUIRED');
  if(!document.revision||typeof document.revision!=='string')throw Error('STRUCTURED_DOCUMENT_REVISION_REQUIRED');
  if(typeof document.title!=='string'||!Array.isArray(document.blocks))throw Error('INVALID_STRUCTURED_DOCUMENT');
}
function walkKeys(value,path='',out=[]){
  if(!value||typeof value!=='object')return out;
  for(const [key,child] of Object.entries(value)){
    const next=path?`${path}.${key}`:key;
    if(/^(library|libraryState|knowledgeUniverse|kuTree|searchState)$/i.test(key))out.push(next);
    walkKeys(child,next,out);
  }
  return out;
}
/** Compatibility constructor only. All behavior is owned by StructuredSelectionKernel. */
export class StructuredSelectionModel extends StructuredSelectionKernel {
  constructor(readDocument,{readRevision=()=>null,treeKernel=STRUCTURED_TREE_KERNEL}={}){super({readDocument,readRevision,treeKernel});}
}

export const STRUCTURED_TRANSACTION_HISTORY_RECOVERY_CONTRACT = Object.freeze({
  id:'StructuredTransactionHistoryRecoveryOwner',version:'1.0.0',compatibility:'SEMVER',owner:'Structured Family',policyRevision:'structured-transaction-history-recovery-vs04-r1'
});
export const STRUCTURED_TRANSACTION_HISTORY_RECOVERY_POLICY = Object.freeze({recoveryRetentionLimit:5});

const sameDocument=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/** Canonical Structured-family owner for working state, history, recovery and durable-save truth. */
export class StructuredTransactionHistoryRecoveryOwner {
  constructor({document,treeKernel=STRUCTURED_TREE_KERNEL,saveBoundary=null,policy=STRUCTURED_TRANSACTION_HISTORY_RECOVERY_POLICY}={}){
    assertDocument(document);this.owner='StructuredTransactionHistoryRecoveryOwner';this.contract=STRUCTURED_TRANSACTION_HISTORY_RECOVERY_CONTRACT;this.policy=policy;this.treeKernel=treeKernel;this.saveBoundary=saveBoundary;this.documents=new Map();this.sequence=0;this.receipts=[];this.activeDocumentId=null;this.activate(document);
  }
  _validate(document){assertDocument(document);const v=this.treeKernel.validate(document.blocks);if(!v.ok)throw Error(`INVALID_STRUCTURED_TREE:${v.issues[0]?.code||'UNKNOWN'}`);return document;}
  _newState(document){const working=clone(this._validate(clone(document)));return {working,committedDocument:clone(working),workingRevision:1,committedRevision:document.revision,dirty:false,history:[this._frame('baseline',working,1,null)],historyIndex:0,recovery:[],commitInFlight:null};}
  _frame(label,document,workingRevision,presentation){return {id:`structured-history-${++this.sequence}`,label,document:clone(document),workingRevision,presentation:clone(presentation??null)};}
  _state(documentId=this.activeDocumentId){const state=this.documents.get(documentId);if(!state)throw Error('UNKNOWN_STRUCTURED_DOCUMENT');return state;}
  _receipt(command,documentId,extra={}){const receipt={sequence:++this.sequence,command,owner:this.owner,policyRevision:this.contract.policyRevision,documentId,...clone(extra)};this.receipts.push(receipt);return clone(receipt);}
  activate(document){this._validate(document);if(!this.documents.has(document.id))this.documents.set(document.id,this._newState(document));this.activeDocumentId=document.id;return this.projection(document.id);}
  hydrateCommitted(document,{documentId=document.id}={}){this._validate(document);const current=this._state(documentId);if(current.dirty||current.historyIndex!==0||current.history.length!==1)return {ok:false,status:'HYDRATION_REJECTED_DIRTY_OR_MUTATED',projection:this.projection(documentId)};const next=clone(document);next.id=documentId;this.documents.set(documentId,this._newState(next));this.activeDocumentId=documentId;const receipt=this._receipt('document.persistence.hydrate',documentId,{ok:true,status:'HYDRATED_COMMITTED_BASELINE',committedRevision:String(next.revision)});return {ok:true,status:'HYDRATED_COMMITTED_BASELINE',receipt,projection:this.projection(documentId)};}
  identity(documentId=this.activeDocumentId){const s=this._state(documentId);return {id:documentId,committedRevision:s.committedRevision,workingRevision:s.workingRevision,dirty:s.dirty,owner:this.owner};}
  snapshot(documentId=this.activeDocumentId){return clone(this._state(documentId).working);}
  descriptor(documentId=this.activeDocumentId){const s=this._state(documentId);return {contract:this.contract,owner:this.owner,policy:clone(this.policy),documentId,workingRevision:s.workingRevision,committedRevision:s.committedRevision,dirty:s.dirty,historyLength:s.history.length,historyIndex:s.historyIndex,canUndo:s.historyIndex>0,canRedo:s.historyIndex<s.history.length-1,recoveryCount:s.recovery.length,persistedBoundaryConfigured:typeof this.saveBoundary==='function'};}
  historyProjection(documentId=this.activeDocumentId){const s=this._state(documentId);return s.history.map(frame=>clone(frame));}
  projection(documentId=this.activeDocumentId){return {document:this.snapshot(documentId),history:this.historyProjection(documentId),descriptor:this.descriptor(documentId),recovery:this.listRecovery(documentId)};}
  record(document,label,{presentation=null,source='structured'}={}){const next=clone(this._validate(document)),documentId=next.id,s=this._state(documentId);if(sameDocument(next,s.working))return {ok:true,changed:false,status:'NO_CHANGE',projection:this.projection(documentId)};s.history=s.history.slice(0,s.historyIndex+1);s.working=next;s.workingRevision++;s.dirty=!sameDocument(s.working,s.committedDocument);const frame=this._frame(label,next,s.workingRevision,presentation);s.history.push(frame);s.historyIndex=s.history.length-1;const receipt=this._receipt('document.transaction',documentId,{label,source,workingRevision:s.workingRevision,historyFrameId:frame.id});return {ok:true,changed:true,status:'COMMITTED_WORKING_TRANSACTION',document:this.snapshot(documentId),frame:clone(frame),receipt,projection:this.projection(documentId)};}
  transact(label,mutator,options={}){const next=this.snapshot();mutator(next);return this.record(next,label,options);}
  undo(documentId=this.activeDocumentId){const s=this._state(documentId);if(s.historyIndex<=0)return {ok:true,changed:false,status:'AT_HISTORY_START',projection:this.projection(documentId)};s.historyIndex--;const frame=s.history[s.historyIndex];s.working=clone(frame.document);s.workingRevision++;s.dirty=!sameDocument(s.working,s.committedDocument);const receipt=this._receipt('document.undo',documentId,{workingRevision:s.workingRevision,historyFrameId:frame.id});return {ok:true,changed:true,status:'UNDONE',document:this.snapshot(documentId),frame:clone(frame),receipt,projection:this.projection(documentId)};}
  redo(documentId=this.activeDocumentId){const s=this._state(documentId);if(s.historyIndex>=s.history.length-1)return {ok:true,changed:false,status:'AT_HISTORY_END',projection:this.projection(documentId)};s.historyIndex++;const frame=s.history[s.historyIndex];s.working=clone(frame.document);s.workingRevision++;s.dirty=!sameDocument(s.working,s.committedDocument);const receipt=this._receipt('document.redo',documentId,{workingRevision:s.workingRevision,historyFrameId:frame.id});return {ok:true,changed:true,status:'REDONE',document:this.snapshot(documentId),frame:clone(frame),receipt,projection:this.projection(documentId)};}
  captureRecovery(reason='working-change',documentId=this.activeDocumentId){const s=this._state(documentId),record={id:`structured-recovery-${++this.sequence}`,documentId,reason,workingRevision:s.workingRevision,sourceHistoryIndex:s.historyIndex,sourceHistoryFrameId:s.history[s.historyIndex]?.id||null,document:this.snapshot(documentId)};s.recovery.unshift(record);const limit=Math.max(1,Number(this.policy.recoveryRetentionLimit)||1);if(s.recovery.length>limit)s.recovery.length=limit;this._receipt('document.recovery.capture',documentId,{recoveryId:record.id,reason,workingRevision:s.workingRevision});return clone({...record,document:undefined,stale:false});}
  listRecovery(documentId=this.activeDocumentId){const s=this._state(documentId);return s.recovery.map(r=>({id:r.id,documentId:r.documentId,reason:r.reason,workingRevision:r.workingRevision,sourceHistoryIndex:r.sourceHistoryIndex,sourceHistoryFrameId:r.sourceHistoryFrameId,stale:r.sourceHistoryIndex!==s.historyIndex}));}
  recoveryCounts(){return Object.fromEntries([...this.documents.entries()].map(([id,s])=>[id,s.recovery.length]));}
  restoreRecoveryAsNew(id,documentId=this.activeDocumentId){const s=this._state(documentId),record=s.recovery.find(item=>item.id===id);if(!record)throw Error('UNKNOWN_STRUCTURED_RECOVERY');const next=clone(record.document);next.id=documentId;next.revision=s.committedRevision;return this.record(next,'document.recoverAsNew',{source:'recovery'});}
  restoreHistoryAsNew(index,documentId=this.activeDocumentId){const s=this._state(documentId),frame=s.history[Number(index)];if(!frame)throw Error('UNKNOWN_STRUCTURED_HISTORY_FRAME');const next=clone(frame.document);next.id=documentId;next.revision=s.committedRevision;return this.record(next,'document.restoreHistoryAsNew',{source:'history-restore',presentation:frame.presentation});}
  commit({expectedWorkingRevision=this._state().workingRevision,reason='explicit-save',documentId=this.activeDocumentId}={}){
    const s=this._state(documentId);if(expectedWorkingRevision!==s.workingRevision)throw Error('STALE_STRUCTURED_WORKING_REVISION');
    if(s.commitInFlight){if(s.commitInFlight.workingRevision===expectedWorkingRevision)return s.commitInFlight.promise;return Promise.resolve(this._receipt('document.commit',documentId,{ok:false,status:'SAVE_IN_FLIGHT',persisted:false,reason,workingRevision:s.workingRevision,committedRevision:s.committedRevision}));}
    const beforeCommitted=s.committedRevision,workingRevision=s.workingRevision,snapshot=this.snapshot(documentId);
    if(typeof this.saveBoundary!=='function')return this._receipt('document.commit',documentId,{ok:false,status:'SAVE_BOUNDARY_UNAVAILABLE',persisted:false,reason,workingRevision,committedRevision:s.committedRevision});
    const failed=(failure='STRUCTURED_COMMIT_FAILED')=>{
      const providerFailure=failure&&typeof failure==='object'?clone(failure):null;
      const error=providerFailure?.error||providerFailure?.reason||providerFailure?.code||failure||'STRUCTURED_COMMIT_FAILED';
      const currentRevision=providerFailure?.currentRevision??providerFailure?.serverRevision??providerFailure?.conflict?.currentRevision??providerFailure?.server?.revision??null;
      const serverReference=providerFailure?.serverReference??providerFailure?.conflict?.serverReference??providerFailure?.server?.reference??null;
      return this._receipt('document.commit',documentId,{ok:false,status:'SAVE_FAILED',persisted:false,reason,error:String(error),workingRevision,committedRevision:s.committedRevision,currentRevision,serverReference,providerFailure});
    };
    const finalize=result=>{if(!result||result.ok!==true)return failed(result||'STRUCTURED_COMMIT_FAILED');s.committedRevision=String(result.revision||s.committedRevision);s.committedDocument=clone(snapshot);s.dirty=!sameDocument(s.working,s.committedDocument);return this._receipt('document.commit',documentId,{ok:true,status:'PERSISTED',persisted:true,reason,workingRevision,previousCommittedRevision:beforeCommitted,committedRevision:s.committedRevision,dirtyAfterCommit:s.dirty});};
    let result;try{result=this.saveBoundary(clone(snapshot),{reason,expectedRevision:beforeCommitted,workingRevision,documentId,committedDocument:clone(s.committedDocument)})}catch(error){return failed(error)}
    if(result&&typeof result.then==='function'){const promise=Promise.resolve(result).then(finalize,error=>failed(error)).finally(()=>{if(s.commitInFlight?.promise===promise)s.commitInFlight=null});s.commitInFlight={workingRevision,promise};return promise}
    return finalize(result);
  }
}

/** Canonical, domain-neutral structured document boundary. */
export class StructuredDocumentDomainAdapter {
  constructor({owner,domainKind='structured',document,schema=DEFAULT_SCHEMA,capabilities={},metadata={},sourceBinding=null,noteBinding=null,commit=null,readOnly=false}){
    assertDocument(document);this.owner=owner;this.domainKind=domainKind;this.treeKernel=STRUCTURED_TREE_KERNEL;this.mutationKernel=STRUCTURED_MUTATION_KERNEL;this.schema=clone(schema);if(this.schema.id!==STRUCTURED_TREE_SCHEMA.id||this.schema.version!==STRUCTURED_TREE_SCHEMA.version)throw Error('UNSUPPORTED_STRUCTURED_TREE_SCHEMA');const validation=this.treeKernel.validate(document.blocks);if(!validation.ok)throw Error(`INVALID_STRUCTURED_TREE:${validation.issues[0]?.code||'UNKNOWN'}`);this.treeValidation=validation;this.capabilitySet={edit:!readOnly,history:true,recovery:true,notes:true,sources:true,selection:true,clipboard:true,...capabilities};this.metadata=clone(metadata);this.sourceBinding=clone(sourceBinding);this.noteBinding=clone(noteBinding);this.readOnly=readOnly;this.presentationBridge=null;this.receipts=[];this.sequence=0;this.commandIdentitySequence=0;this.commandIds=[...new Set([...DEFAULT_COMMANDS,...STRUCTURED_SHARED_COMMAND_IDS])];this.transactionOwner=new StructuredTransactionHistoryRecoveryOwner({document,treeKernel:this.treeKernel,saveBoundary:commit});this.selection=new StructuredSelectionKernel({readDocument:()=>this.snapshot(),readRevision:()=>this.transactionOwner.descriptor().workingRevision,treeKernel:this.treeKernel});this.selectionDOMBridge=STRUCTURED_SELECTION_DOM_BRIDGE;this.commandAvailabilityOwner=new StructuredCommandAvailabilityOwner(this);this.actionDescriptorOwner=new StructuredActionDescriptorOwner(this);this.clipboardOwner=new StructuredClipboardTrustOwner({readDocument:()=>this.snapshot(),schema:this.schema,domainKind:this.domainKind,consumerOwner:this.owner,treeKernel:this.treeKernel,mutationKernel:this.mutationKernel,transactionOwner:this.transactionOwner,selection:this.selection,commandAvailabilityOwner:this.commandAvailabilityOwner,readOnly:()=>this.readOnly,transact:(label,mutator,options)=>this.transact(label,mutator,options)});this.inputDirectionResolver=new InputDirectionResolver();this.richContentOwner=new StructuredRichContentOwner({directionResolver:this.inputDirectionResolver,clipboardOwner:this.clipboardOwner});this.dropTargetOwner=new StructuredDropTargetPolicyOwner({readDocument:()=>this.snapshot(),treeKernel:this.treeKernel,mutationKernel:this.mutationKernel,commandAvailabilityOwner:this.commandAvailabilityOwner});this.dragDropOwner=new StructuredDragDropOwner({readDocument:()=>this.snapshot(),readTransaction:()=>this.transactionDescriptor(),targetPolicyOwner:this.dropTargetOwner,executeMove:({sourceBlockId,target,route,transactionLabel})=>this.executeSharedCommand('block.moveToGap',{mode:'edit',blockId:sourceBlockId,target,route,transactionLabel})});this.inputKeymapOwner=null;if(domainKind!=='library')this.assertDomainIsolation();
  }
  get workingRevision(){return this.transactionOwner.descriptor().workingRevision}get committedRevision(){return this.transactionOwner.descriptor().committedRevision}get history(){return this.transactionOwner.historyProjection()}get historyIndex(){return this.transactionOwner.descriptor().historyIndex}get recovery(){return this.transactionOwner.listRecovery()}get dirty(){return this.transactionOwner.descriptor().dirty}
  identity(){return {...this.transactionOwner.identity(),owner:this.owner,transactionOwner:this.transactionOwner.owner};}
  assertCanonicalMutationOwner(){if(this.mutationKernel!==STRUCTURED_MUTATION_KERNEL)throw Error('SECOND_STRUCTURED_MUTATION_OWNER_DETECTED');return true;}
  assertCanonicalTransactionOwner(){if(!(this.transactionOwner instanceof StructuredTransactionHistoryRecoveryOwner)||this.transactionOwner.owner!=='StructuredTransactionHistoryRecoveryOwner')throw Error('SECOND_STRUCTURED_TRANSACTION_HISTORY_RECOVERY_OWNER_DETECTED');return true;}
  assertCanonicalClipboardOwner(){if(!(this.clipboardOwner instanceof StructuredClipboardTrustOwner)||this.clipboardOwner.owner!=='StructuredClipboardTrustOwner'||this.clipboardOwner.selection!==this.selection||this.clipboardOwner.mutationKernel!==this.mutationKernel||this.clipboardOwner.transactionOwner!==this.transactionOwner||this.clipboardOwner.commandAvailabilityOwner!==this.commandAvailabilityOwner)throw Error('SECOND_STRUCTURED_CLIPBOARD_OWNER_DETECTED');return true;}
  assertCanonicalActionDescriptorOwner(){if(!(this.actionDescriptorOwner instanceof StructuredActionDescriptorOwner)||this.actionDescriptorOwner.owner!=='StructuredActionDescriptorOwner'||this.actionDescriptorOwner.adapter!==this||this.actionDescriptorOwner.insertionTargets?.adapter!==this)throw Error('SECOND_STRUCTURED_ACTION_DESCRIPTOR_OWNER_DETECTED');this.actionDescriptorOwner.assertDelegation();return true;}
  assertCanonicalDragDropOwner(){if(!(this.dropTargetOwner instanceof StructuredDropTargetPolicyOwner)||this.dropTargetOwner.owner!=='StructuredDropTargetPolicyOwner'||this.dropTargetOwner.mutationKernel!==this.mutationKernel||this.dropTargetOwner.commandAvailabilityOwner!==this.commandAvailabilityOwner||!(this.dragDropOwner instanceof StructuredDragDropOwner)||this.dragDropOwner.owner!=='StructuredDragDropOwner'||this.dragDropOwner.targetPolicyOwner!==this.dropTargetOwner)throw Error('SECOND_STRUCTURED_DRAG_DROP_OWNER_DETECTED');return true;}
  attachInputKeymap({commands,globalInputKeymapOwner,policy=undefined,allocateBlockId=null}={}){if(this.inputKeymapOwner){if(this.inputKeymapOwner.globalInputKeymapOwner!==globalInputKeymapOwner||this.inputKeymapOwner.commands!==commands)throw Error('SECOND_STRUCTURED_INPUT_KEYMAP_OWNER_DETECTED');return this.inputKeymapOwner;}this.inputKeymapOwner=new StructuredInputKeymapOwner({commands,globalInputKeymapOwner,selection:this.selection,clipboard:this.clipboardOwner,commandAvailability:this.commandAvailabilityOwner,mutationKernel:this.mutationKernel,transactionOwner:this.transactionOwner,readDocument:()=>this.snapshot(),treeKernel:this.treeKernel,policy,allocateBlockId});return this.inputKeymapOwner;}
  assertCanonicalInputKeymapOwner(){if(!this.inputKeymapOwner||!(this.inputKeymapOwner instanceof StructuredInputKeymapOwner)||this.inputKeymapOwner.owner!=='StructuredInputKeymapOwner'||this.inputKeymapOwner.selection!==this.selection||this.inputKeymapOwner.clipboard!==this.clipboardOwner||this.inputKeymapOwner.commandAvailability!==this.commandAvailabilityOwner||this.inputKeymapOwner.mutationKernel!==this.mutationKernel||this.inputKeymapOwner.transactionOwner!==this.transactionOwner)throw Error('SECOND_STRUCTURED_INPUT_KEYMAP_OWNER_DETECTED');return true;}
  descriptor(){this.assertCanonicalMutationOwner();this.assertCanonicalTransactionOwner();this.assertCanonicalClipboardOwner();this.assertCanonicalActionDescriptorOwner();this.assertCanonicalDragDropOwner();return {contract:STRUCTURED_DOCUMENT_CONTRACT,treeContract:STRUCTURED_TREE_CONTRACT,treeOwner:this.treeKernel.owner,treePolicyRevision:this.treeKernel.contract.policyRevision,mutationContract:STRUCTURED_MUTATION_CONTRACT,mutationOwner:this.mutationKernel.owner,mutationPolicyRevision:this.mutationKernel.contract.policyRevision,transactionContract:STRUCTURED_TRANSACTION_HISTORY_RECOVERY_CONTRACT,transactionOwner:this.transactionOwner.owner,transactionPolicyRevision:this.transactionOwner.contract.policyRevision,transactionState:this.transactionOwner.descriptor(),commandAvailabilityContract:STRUCTURED_COMMAND_AVAILABILITY_CONTRACT,commandAvailabilityOwner:this.commandAvailabilityOwner.owner,commandAvailabilityPolicyRevision:this.commandAvailabilityOwner.contract.policyRevision,actionDescriptorContract:STRUCTURED_ACTION_DESCRIPTOR_CONTRACT,actionDescriptorOwner:this.actionDescriptorOwner.owner,actionDescriptorPolicy:structuredActionDescriptorPolicy(),insertionTargetContract:STRUCTURED_INSERTION_TARGET_CONTRACT,selectionContract:STRUCTURED_SELECTION_CONTRACT,clipboardContract:STRUCTURED_CLIPBOARD_CONTRACT,clipboardPolicyRevision:this.clipboardOwner.contract.policyRevision,owner:this.owner,domainKind:this.domainKind,identity:this.identity(),schema:clone(this.schema),capabilities:clone(this.capabilitySet),historyOwner:this.transactionOwner.owner,selectionOwner:this.selection.owner,clipboardOwner:this.clipboardOwner.owner,inputKeymapOwner:this.inputKeymapOwner?.owner||null,inputKeymapContract:this.inputKeymapOwner?.contract||STRUCTURED_INPUT_KEYMAP_CONTRACT,inputDirectionOwner:this.inputDirectionResolver.owner,richContentOwner:this.richContentOwner.owner,dropTargetOwner:this.dropTargetOwner.owner,dragDropOwner:this.dragDropOwner.owner,dropTargetContract:STRUCTURED_DROP_TARGET_CONTRACT,dragDropContract:STRUCTURED_DRAG_DROP_CONTRACT,recoveryOwner:this.transactionOwner.owner,commitOwner:this.transactionOwner.owner,sourceBinding:clone(this.sourceBinding),noteBinding:clone(this.noteBinding),metadata:clone(this.metadata),commands:[...this.commandIds],sharedCommands:[...STRUCTURED_SHARED_COMMAND_IDS]};}
  _project(projection=this.transactionOwner.projection()){const selection=this.selection.reconcile({reason:'transaction-projection'});const projected={...clone(projection),selection};this.presentationBridge?.project?.(projected);return projected;}
  bindExternal({read=null,project=null,markSaved=null}={}){if(read!=null&&typeof read!=='function')throw Error('STRUCTURED_EXTERNAL_READ_INVALID');if(project!=null&&typeof project!=='function')throw Error('STRUCTURED_EXTERNAL_PROJECT_INVALID');this.presentationBridge={read,project,markSaved};if(read){const supplied=read();if(supplied){assertDocument(supplied);this.transactionOwner.activate(supplied)}}this._project();return this;}
  activateExternalDocument(document){const projection=this.transactionOwner.activate(document);this._project(projection);return projection;}
  acceptExternalTransaction({document,label,presentation=null,source='library-donor-presentation'}={}){if(this.readOnly)throw Error('STRUCTURED_DOCUMENT_READ_ONLY');this.transactionOwner.activate(document);const result=this.transactionOwner.record(document,label,{presentation,source});this._project(result.projection);return result;}
  markWorkingChange(){throw Error('DIRECT_WORKING_REVISION_MUTATION_FORBIDDEN_USE_TRANSACTION_OWNER');}
  snapshot(){return this.transactionOwner.snapshot();}
  treeReceipt(blocks=this.snapshot().blocks){return this.treeKernel.receipt(blocks)}validateTree(blocks=this.snapshot().blocks){return this.treeKernel.validate(blocks)}findBlockRef(id,blocks=this.snapshot().blocks){return this.treeKernel.findRef(blocks,id)}structurePath(id,blocks=this.snapshot().blocks){return this.treeKernel.pathFor(blocks,id)}serializeTree(blocks=this.snapshot().blocks){return this.treeKernel.serializeBlocks(blocks)}canContain(parentType,childType){return this.treeKernel.canContain(parentType,childType)}mutationReceipt(blocks=this.snapshot().blocks){return this.mutationKernel.receipt(blocks)}previewMutation(intent,options={}){this.assertCanonicalMutationOwner();return this.mutationKernel.apply(this.snapshot().blocks,intent,options)}
  mutateStructure(intent,options={}){this.assertCanonicalMutationOwner();this.assertCanonicalTransactionOwner();if(this.readOnly)throw Error('STRUCTURED_DOCUMENT_READ_ONLY');const result=this.mutationKernel.apply(this.snapshot().blocks,intent,options);if(!result.ok||!result.changed)return result;const presentation=options.presentation??{bookmark:{blockId:result.meta?.focusId||intent.blockId||null,offset:Number(options.offset)||0}},label=options.transactionLabel||`structured.mutation.${intent.type}`;const tx=this.transact(label,doc=>{doc.blocks=clone(result.blocks)},{source:'StructuredMutationKernel',presentation});const receipt={sequence:++this.sequence,command:'structured.mutation',owner:this.mutationKernel.owner,policyRevision:this.mutationKernel.contract.policyRevision,intent:intent.type,code:result.code,meta:clone(result.meta),historyFrameId:tx.frame?.id||null};this.receipts.push(receipt);return {...result,document:this.snapshot(),receipt:clone(receipt),transaction:tx};}
  selectBlocks(ids,options={}){return this.selection.select(ids,options)}
  selectBlockRange(anchorBlockId,focusBlockId,options={}){return this.selection.selectRange(anchorBlockId,focusBlockId,options)}
  toggleSelectedBlock(blockId){return this.selection.toggle(blockId)}
  selectInlineRange(descriptor){return this.selection.selectInlineRange(descriptor)}
  selectionDescriptorFromDOM(selection,options={}){return this.selectionDOMBridge.descriptorFromDOMSelection(selection,options)}
  projectInlineSelectionToDOM(descriptor,options={}){return this.selectionDOMBridge.projectInlineRange(descriptor,options)}
  clearInlineSelection(){return this.selection.clearInlineRange()}
  clearSelection(){return this.selection.clear()}
  selectionBookmark(){return this.selection.bookmark()}
  projectSelectionBookmark(bookmark){return this.selection.projectBookmark(bookmark)}
  selectionReceipts(){return this.selection.receipts()}
  selectedFragmentIdentity(){return this.selection.descriptor()}
  clipboardCompatibility(payload){this.assertCanonicalClipboardOwner();return this.clipboardOwner.compatibility(payload);}
  actionDescriptors(surface,context={}){this.assertCanonicalActionDescriptorOwner();return this.actionDescriptorOwner.project(surface,context);}
  executeStructuredAction(actionId,context={}){this.assertCanonicalActionDescriptorOwner();return this.actionDescriptorOwner.execute(actionId,context);}
  insertionTarget(position,context={}){this.assertCanonicalActionDescriptorOwner();return this.actionDescriptorOwner.insertionTargets.inspect(position,context);}
  projectRichBlock(blockOrId,options={}){const block=typeof blockOrId==='string'?this.treeKernel.findRef(this.snapshot().blocks,blockOrId)?.block:blockOrId;if(!block)throw Error('UNKNOWN_STRUCTURED_BLOCK');return this.richContentOwner.projectBlock(block,options);}
  copySelectionPortable(context={}){this.assertCanonicalClipboardOwner();return this.richContentOwner.portableFromCanonicalClipboard(this.copySelection(context));}
  pastePortableRich(portable,targetOrIndex=this.snapshot().blocks.length,context={}){this.assertCanonicalClipboardOwner();const converted=this.richContentOwner.canonicalClipboardFromPortable(portable,{documentId:'portable-rich-source',domainKind:this.domainKind});return this.pasteStructured(converted.payload,targetOrIndex,context);}
  availability(command,context={}){if(STRUCTURED_SHARED_COMMAND_ID_SET.has(command))return this.commandAvailabilityOwner.inspect(command,context);if(!this.commandIds.includes(command))return {enabled:false,reason:'Unknown structured command',code:'UNKNOWN_COMMAND'};if(['document.copy','document.cut','document.paste'].includes(command)){this.assertCanonicalClipboardOwner();return this.clipboardOwner.availability(command,context)}if(this.readOnly&&/update|insert|remove|undo|redo|commit|recover/i.test(command))return {enabled:false,reason:'Structured document is read only',code:'READ_ONLY'};return {enabled:true,reason:'',code:'AVAILABLE'};}
  transact(label,mutator,options={}){if(this.readOnly)throw Error('STRUCTURED_DOCUMENT_READ_ONLY');this.assertCanonicalTransactionOwner();const result=this.transactionOwner.transact(label,mutator,options);this._project(result.projection);return result;}
  updateTitle(title){const r=this.transact('document.updateTitle',doc=>{doc.title=String(title)});return r.document??this.snapshot();}
  insertBlock(block,index=this.snapshot().blocks.length){const result=this.mutateStructure({type:'insert',target:{kind:'gap',parentId:null,index,depth:0},block:clone(block)});if(!result.ok)throw Error(result.code);return result.document??this.snapshot();}
  updateBlock(id,patch){const value=clone(patch??{});if(!value||Array.isArray(value)||typeof value!=='object')throw Error('INVALID_STRUCTURED_BLOCK_PATCH');const structural=Object.keys(value).filter(key=>!STRUCTURED_NON_STRUCTURAL_PATCH_FIELDS.includes(key));if(structural.length)throw Error(`STRUCTURAL_UPDATE_REQUIRES_MUTATION_KERNEL:${structural.sort().join(',')}`);const r=this.transact('document.updateBlock',doc=>{const ref=this.treeKernel.findRef(doc.blocks,id);if(!ref)throw Error('UNKNOWN_STRUCTURED_BLOCK');Object.assign(ref.block,value)});return r.document??this.snapshot();}
  removeBlock(id){const result=this.mutateStructure({type:'remove',blockId:id});if(!result.ok)throw Error(result.code==='UNKNOWN_BLOCK'?'UNKNOWN_STRUCTURED_BLOCK':result.code);return result.document??this.snapshot();}
  copySelection(context={}){this.assertCanonicalClipboardOwner();return this.clipboardOwner.copy(context);}
  cutSelection(context={}){this.assertCanonicalClipboardOwner();return this.clipboardOwner.cut(context);}
  pasteStructured(payload,targetOrIndex=this.snapshot().blocks.length,context={}){this.assertCanonicalClipboardOwner();return this.clipboardOwner.paste(payload,targetOrIndex,context);}
  clipboardReceipts(){this.assertCanonicalClipboardOwner();return this.clipboardOwner.receipts();}
  _allocateCommandBlockId(sourceId='block'){let id;do{id=`${sourceId}-copy-${++this.commandIdentitySequence}`}while(this.treeKernel.findRef(this.snapshot().blocks,id));return id;}
  executeSharedCommand(command,context={}){
    const availability=this.availability(command,context);if(!availability.enabled)return {ok:false,command,...availability};
    const txOptions={transactionLabel:context.transactionLabel,presentation:context.presentation,offset:context.offset};
    let result;
    if(command==='history.undo')result=this.undo();
    else if(command==='history.redo')result=this.redo();
    else if(command==='document.commit')return this.commit(context);
    else if(command==='document.recoverAsNew')return {ok:true,command,document:this.recoverAsNew(context.recoveryId),semanticOwner:this.transactionOwner.owner};
    else if(command==='block.insert'){
      if(context.intent)result=this.mutateStructure(context.intent,txOptions);
      else if(context.target?.kind==='replace-empty')result=this.mutateStructure({type:'replace',blockId:context.target.blockId||context.blockId,block:clone(context.block)},txOptions);
      else result=this.mutateStructure({type:'insert',target:clone(context.target),block:clone(context.block)},txOptions);
    }
    else if(command==='block.duplicate')result=this.mutateStructure({type:'duplicate',blockId:context.blockId},{...txOptions,allocateId:context.allocateId||(()=>this._allocateCommandBlockId(context.blockId||'block'))});
    else if(command==='block.delete')result=this.mutateStructure({type:'remove',blockId:context.blockId},txOptions);
    else if(command==='block.deleteMany')result=this.mutateStructure({type:'removeMany',blockIds:[...new Set((context.blockIds||[]).map(String))]},txOptions);
    else if(command==='block.moveUp')result=this.mutateStructure({type:'moveSibling',blockId:context.blockId,delta:-1},txOptions);
    else if(command==='block.moveDown')result=this.mutateStructure({type:'moveSibling',blockId:context.blockId,delta:1},txOptions);
    else if(command==='block.moveStart')result=this.mutateStructure({type:'moveSiblingToEdge',blockId:context.blockId,edge:'start'},txOptions);
    else if(command==='block.moveEnd')result=this.mutateStructure({type:'moveSiblingToEdge',blockId:context.blockId,edge:'end'},txOptions);
    else if(command==='block.moveToGap')result=this.mutateStructure({type:'moveToGap',blockId:context.blockId,target:clone(context.target)},txOptions);
    else if(command==='block.indent')result=this.mutateStructure({type:'indent',blockId:context.blockId},txOptions);
    else if(command==='block.outdent')result=this.mutateStructure({type:'outdent',blockId:context.blockId},txOptions);
    else if(command==='block.split')result=context.convertEmptyList?this.mutateStructure({type:'convert',blockId:context.blockId,to:'paragraph',sourceHtml:'',sourceText:'',lossAccepted:false},txOptions):this.mutateStructure({type:'split',blockId:context.blockId,before:context.before,newBlock:clone(context.newBlock)},txOptions);
    else if(command==='block.mergeBackward')result=this.mutateStructure({type:'mergeBackward',blockId:context.blockId,plainText:context.plainText},txOptions);
    else if(command==='block.mergeForward')result=this.mutateStructure({type:'mergeForward',blockId:context.blockId},txOptions);
    else if(command==='block.convert')result=this.mutateStructure({type:'convert',blockId:context.blockId,to:context.to||context.type,sourceHtml:context.sourceHtml,sourceText:context.sourceText,lossAccepted:!!context.lossAccepted},txOptions);
    else if(command==='block.plainText')result=this.mutateStructure({type:'convertPlainText',blockId:context.blockId,sourceText:context.sourceText,sourceHtml:context.sourceHtml},txOptions);
    else if(command==='block.align'||command==='block.direction'||command==='block.background'||command==='block.clearStyle'){
      const key=command==='block.align'?'align':command==='block.direction'?'dir':command==='block.background'?'bg':null,patch=command==='block.clearStyle'?{align:'start',dir:'auto',bg:'none'}:{[key]:context.value},document=this.updateBlock(context.blockId,patch);
      result={ok:true,changed:true,code:'APPLIED',document,meta:{operation:key||'clearStyle',focusId:context.blockId},owner:this.transactionOwner.owner};
    }
    else return {ok:false,command,enabled:false,code:'UNKNOWN_COMMAND',reason:'Unknown structured command'};
    return {...result,ok:result?.ok!==false,command,availability,commandOwner:'StructuredDocumentDomainAdapter',availabilityOwner:this.commandAvailabilityOwner.owner,semanticOwner:result?.owner||this.transactionOwner.owner};
  }
  bindSharedCommands(registry){
    for(const definition of STRUCTURED_SHARED_COMMANDS)registry.register(definition.id,'StructuredDocumentDomainAdapter',definition.label,p=>this.executeSharedCommand(definition.id,p),p=>this.availability(definition.id,p));
    return {owner:'StructuredDocumentDomainAdapter',availabilityOwner:this.commandAvailabilityOwner.owner,policyRevision:this.commandAvailabilityOwner.contract.policyRevision,commands:[...STRUCTURED_SHARED_COMMAND_IDS]};
  }
  bindSemanticCommands(registry,{clipboardStore={value:null},transport=null}={}){this.assertCanonicalClipboardOwner();const owner=this.clipboardOwner.owner;registry.register('document.copy',owner,'Copy structured selection',p=>{const payload=this.copySelection(p);if(transport?.write)transport.write(clone(payload));clipboardStore.value=clone(payload);return {ok:true,payload,owner}},p=>this.availability('document.copy',p));registry.register('document.cut',owner,'Cut structured selection',p=>{const bridge=p.transport||transport||null,payload=this.cutSelection({...p,transport:bridge});clipboardStore.value=clone(payload);return {ok:true,payload,owner}},p=>this.availability('document.cut',p));registry.register('document.paste',owner,'Paste structured fragment',p=>this.pasteStructured(p.payload??clipboardStore.value,p.target??p.index,{...p,payload:undefined}),p=>this.availability('document.paste',{...p,payload:p.payload??clipboardStore.value}));return {registry,clipboardStore,owner,contract:this.clipboardOwner.contract,commands:['document.copy','document.cut','document.paste']};}
  undo(){const result=this.transactionOwner.undo();this._project(result.projection);return result;}
  redo(){const result=this.transactionOwner.redo();this._project(result.projection);return result;}
  historyProjection(){return this.transactionOwner.historyProjection()}
  transactionDescriptor(){return this.transactionOwner.descriptor()}
  captureRecovery(reason='working-change',{documentId=this.identity().id}={}){const record=this.transactionOwner.captureRecovery(reason,documentId);this._project(this.transactionOwner.projection(documentId));return record;}
  listRecovery(documentId=this.identity().id){return this.transactionOwner.listRecovery(documentId)}
  recoveryCounts(){return this.transactionOwner.recoveryCounts()}
  recoverAsNew(id){const result=this.transactionOwner.restoreRecoveryAsNew(id);this._project(result.projection);return result.document??this.snapshot();}
  restoreHistoryAsNew(index){const result=this.transactionOwner.restoreHistoryAsNew(index);this._project(result.projection);return result.document??this.snapshot();}
  hydratePersistenceBaseline(document){const result=this.transactionOwner.hydrateCommitted(document);if(result.ok)this._project(result.projection);return result;}
  commit(options={}){if(this.readOnly)throw Error('STRUCTURED_DOCUMENT_READ_ONLY');const result=this.transactionOwner.commit(options);const finalize=receipt=>{if(receipt.persisted)this.presentationBridge?.markSaved?.(receipt.committedRevision);this._project();this.receipts.push(clone(receipt));return receipt};return result&&typeof result.then==='function'?result.then(finalize):finalize(result);}
  bindNote({blockId=null,selection=null,route=null}={}){return {documentId:this.identity().id,blockId,selection,route:route||`PERSONAL:CEP/${this.domainKind}`,sourceBinding:clone(this.sourceBinding)};}
  assertDomainIsolation(){const leaked=walkKeys({working:this.snapshot(),metadata:this.metadata,sourceBinding:this.sourceBinding,noteBinding:this.noteBinding});if(leaked.length)throw Error('NON_LIBRARY_STATE_LEAK:'+leaked.join(','));return {ok:true,forbiddenKeys:[],domainKind:this.domainKind};}
  fixtureBundle(){const document=this.snapshot(),fixture={...clone(document),sources:clone(this.sourceBinding?.sources||[]),relations:[],labs:[],projects:[],evidence:[]};return {initialDocumentId:document.id,STRUCTURE_TREE:[{id:`outline-${document.id}`,kind:'document',label:'مخطط المستند',meta:'Structured document',children:[{id:`outline-leaf-${document.id}`,kind:'document',ku:document.id,label:document.title,meta:document.id}]}],FIXTURES:{[document.id]:fixture},NOTE_FIXTURES:[]};}
}
