import {STRUCTURED_TREE_KERNEL} from '../structured.js';
import {InputDirectionResolver} from '../global/input-direction.js';
import {StructuredRichContentOwner} from './rich-content.js';

const clone=value=>structuredClone(value);
const escapePlain=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

export const STRUCTURED_BLOCK_RENDERER_CONTRACT=Object.freeze({
  id:'StructuredBlockRenderer',
  version:'1.0.1',
  compatibility:'SEMVER',
  owner:'Structured Surface Presentation',
  policyRevision:'structured-block-renderer-w5a-r3',
  canonicalTruthOwnership:false
});

const policyState={blockGapPx:8,indentUnitPx:20};
export const structuredBlockRendererPresentationPolicy=()=>Object.freeze({
  revision:STRUCTURED_BLOCK_RENDERER_CONTRACT.policyRevision,
  blockGapPx:policyState.blockGapPx,
  indentUnitPx:policyState.indentUnitPx
});
export function setStructuredBlockRendererPresentationPolicy(patch={}){
  if(!patch||typeof patch!=='object'||Array.isArray(patch))throw Error('INVALID_STRUCTURED_RENDERER_POLICY_PATCH');
  const previous={blockGapPx:policyState.blockGapPx,indentUnitPx:policyState.indentUnitPx};
  const proposed={...previous};
  if('blockGapPx' in patch){const value=patch.blockGapPx;if(typeof value!=='number'||!Number.isFinite(value))throw Error('INVALID_STRUCTURED_RENDERER_BLOCK_GAP_TYPE');if(value<0||value>96)throw Error('INVALID_STRUCTURED_RENDERER_BLOCK_GAP');proposed.blockGapPx=value;}
  if('indentUnitPx' in patch){const value=patch.indentUnitPx;if(typeof value!=='number'||!Number.isFinite(value))throw Error('INVALID_STRUCTURED_RENDERER_INDENT_UNIT_TYPE');if(value<0||value>120)throw Error('INVALID_STRUCTURED_RENDERER_INDENT_UNIT');proposed.indentUnitPx=value;}
  policyState.blockGapPx=proposed.blockGapPx;policyState.indentUnitPx=proposed.indentUnitPx;
  const current=structuredBlockRendererPresentationPolicy();
  return Object.freeze({previous:Object.freeze(previous),current,revert(){policyState.blockGapPx=previous.blockGapPx;policyState.indentUnitPx=previous.indentUnitPx;return structuredBlockRendererPresentationPolicy();}});
}

const selectedSet=selection=>new Set([...(selection?.blockIds||[]),...(selection?.coveredBlockIds||[])]);

/**
 * Presentation-only Structured renderer. It reads canonical block identity and delegates
 * rich content and direction projection to the already accepted owners.
 */
export class StructuredBlockRenderer{
  constructor({treeKernel,richContentOwner}={}){
    if(treeKernel!==STRUCTURED_TREE_KERNEL)throw Error('CANONICAL_STRUCTURED_TREE_KERNEL_REQUIRED');
    if(!(richContentOwner instanceof StructuredRichContentOwner)||!(richContentOwner.directionResolver instanceof InputDirectionResolver)||richContentOwner.directionAdapter?.resolver!==richContentOwner.directionResolver)throw Error('CANONICAL_STRUCTURED_RICH_CONTENT_OWNER_REQUIRED');
    this.owner='StructuredBlockRenderer';this.contract=STRUCTURED_BLOCK_RENDERER_CONTRACT;this.treeKernel=treeKernel;this.richContentOwner=richContentOwner;
  }
  descriptor(){return {owner:this.owner,contract:this.contract,canonicalTruthOwnership:false,treeOwner:this.treeKernel.owner,richContentOwner:this.richContentOwner.owner,directionOwner:this.richContentOwner.directionResolver.owner,policy:structuredBlockRendererPresentationPolicy()};}
  _richProjection(block){
    if(block.type!=='toggle')return this.richContentOwner.projectBlock(block);
    const hasRich=block.titleHtml!==undefined&&block.titleHtml!==null;
    const html=hasRich?String(block.titleHtml):escapePlain(block.title??'');
    const projected=this.richContentOwner.projectBlock({...block,html});
    return {...projected,copyText:String(block.title??projected.copyText??''),contentSource:hasRich?'titleHtml':'title'};
  }
  project(document,{mode='read',selection=null,surface='structured'}={}){
    if(!document?.id||!Array.isArray(document.blocks))throw Error('STRUCTURED_RENDER_DOCUMENT_REQUIRED');
    if(!['read','edit'].includes(mode))throw Error('INVALID_STRUCTURED_SURFACE_MODE');
    const validation=this.treeKernel.validate(document.blocks);if(!validation.ok)throw Error(`INVALID_STRUCTURED_TREE:${validation.issues[0]?.code||'UNKNOWN'}`);
    const selected=selectedSet(selection),policy=structuredBlockRendererPresentationPolicy();
    const renderLevel=(blocks,parentId=null,depth=0)=>(blocks||[]).map((block,index)=>{
      const canonicalPath=this.treeKernel.pathFor(document.blocks,block.id).map(item=>item.id);
      const rich=this._richProjection(block);
      const isToggle=block.type==='toggle',open=block.open!==false,align=['start','center','end'].includes(block.align)?block.align:'start',background=['none','soft'].includes(block.bg??block.background)?(block.bg??block.background):'none';
      const node={
        owner:this.owner,
        canonicalTruthOwnership:false,
        canonicalBlockId:block.id,
        documentId:document.id,
        type:block.type,
        parentBlockId:parentId,
        depth,
        index,
        canonicalPath,
        mode,
        editable:mode==='edit',
        selected:selected.has(block.id),
        isToggle,
        open,
        collapsed:isToggle&&!open,
        childrenVisible:!isToggle||open,
        align,
        background,
        direction:rich.direction,
        directionOwner:rich.directionResolution?.owner||this.richContentOwner.directionResolver.owner,
        richContentOwner:rich.owner,
        contentSource:rich.contentSource||(block.type==='code'?'codeText':'html'),
        html:rich.html,
        copyText:rich.copyText,
        presentation:Object.freeze({blockGapPx:policy.blockGapPx,indentPx:depth*policy.indentUnitPx,policyRevision:policy.revision,align,background,childrenVisible:!isToggle||open}),
        children:[]
      };
      node.children=renderLevel(block.children||[],block.id,depth+1);
      return Object.freeze(node);
    });
    const blocks=renderLevel(document.blocks);
    return Object.freeze({
      owner:this.owner,
      contract:this.contract,
      canonicalTruthOwnership:false,
      documentId:document.id,
      revision:document.revision??null,
      surface,
      mode,
      policy,
      treeOwner:this.treeKernel.owner,
      richContentOwner:this.richContentOwner.owner,
      directionOwner:this.richContentOwner.directionResolver.owner,
      blockCount:(()=>{let count=0;this.treeKernel.walk(document.blocks,()=>{count++});return count;})(),
      blocks:Object.freeze(blocks)
    });
  }
  flatten(projection){const rows=[];const walk=nodes=>{for(const node of nodes||[]){rows.push(node);walk(node.children)}};walk(projection?.blocks||[]);return rows;}
  find(projection,blockId){return this.flatten(projection).find(node=>node.canonicalBlockId===blockId)||null;}
}
