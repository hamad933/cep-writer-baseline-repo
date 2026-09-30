import {StructuredBlockRenderer} from './block-renderer.js';
import {applyStructuredCodeViewPreferences} from './code-block.js';
const escapeAttribute=value=>String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

export const STRUCTURED_PRESENTATION_BRIDGE_CONTRACT=Object.freeze({
  id:'StructuredPresentationBridge',
  version:'1.2.0',
  compatibility:'SEMVER',
  owner:'Structured Surface Presentation',
  policyRevision:'structured-presentation-p03b-donor-interaction-r3',
  canonicalTruthOwnership:false,
  donorCompatibility:'W02_LIBRARY_EDITOR_v1.2.17'
});

export const STRUCTURED_INTERACTION_PRESENTATION_CONTRACT=Object.freeze({
  id:'StructuredInteractionPresentation',
  version:'1.1.0',
  compatibility:'SEMVER',
  owner:'StructuredPresentationBridge',
  donorAnchor:'W02_LIBRARY_EDITOR_v1.2.17::gapplus::primary+keyboard chooser / secondary direct Paragraph',
  canonicalTruthOwnership:false
});

export const structuredInteractionGapKey=({parentId=null,index=0,depth=0}={})=>`${parentId??'ROOT'}::${Number(index)||0}::${Number(depth)||0}`;

const gripIcon='<svg class="icon structured-grip-icon" aria-hidden="true" viewBox="0 0 12 18" fill="currentColor"><circle cx="4" cy="4" r="1.1"/><circle cx="8" cy="4" r="1.1"/><circle cx="4" cy="9" r="1.1"/><circle cx="8" cy="9" r="1.1"/><circle cx="4" cy="14" r="1.1"/><circle cx="8" cy="14" r="1.1"/></svg>';
const plusIcon='<svg class="icon structured-plus-icon" aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>';

export const STRUCTURED_INTERACTION_PRESENTATION_CSS=`
.structured-surface[data-presentation-owner="StructuredPresentationBridge"]{
  --structured-editor-gutter:46px;
  --structured-rail-line:rgba(91,147,173,.34);
  --structured-rail-line-active:rgba(104,171,201,.58);
  --structured-rail-dot:rgba(168,205,223,.78);
  --structured-accent:var(--accent,#38c7ff);
  --structured-focus:var(--focus,#78dcff);
  --structured-control-bg:#091a29;
  --structured-control-border:#28516a;
  --structured-control-fg:#8ba8b9;
  --structured-control-fg-active:#cbeeff;
  min-width:0;
}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-blockarray{min-width:0;unicode-bidi:isolate}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block{position:relative;display:grid!important;grid-template-columns:var(--structured-editor-gutter) minmax(0,1fr)!important;align-items:start;min-width:0;width:100%!important;margin-inline-start:var(--structured-indent,0px)!important;margin-inline-end:0!important;padding:0!important;gap:0!important;direction:inherit!important}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block-main{grid-column:2!important;grid-row:1!important;min-width:0;width:auto!important}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block-content{grid-column:auto!important;min-width:0!important;width:auto!important}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-children{min-width:0;unicode-bidi:isolate}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .handlecol{grid-column:1!important;grid-row:1!important;position:relative;width:var(--structured-editor-gutter)!important;min-width:var(--structured-editor-gutter)!important;margin:0!important;padding-inline:0!important;min-height:34px;align-self:stretch;opacity:0;transition:opacity .1s;direction:ltr!important}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:hover>.handlecol,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block[data-selected="true"]>.handlecol,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:focus-within>.handlecol{opacity:1}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .handlecol:focus-within{opacity:1}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockrailhit{position:absolute;inset-block:4px;inset-inline-start:50%;transform:translateX(-50%);width:22px;border-radius:0;background:transparent;opacity:1;pointer-events:none}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockrailhit::before{content:"";position:absolute;inset-block:0;inset-inline-start:50%;width:2px;border-radius:999px;background:var(--structured-rail-line);transform:translateX(-50%);opacity:.72;transition:background-color .11s ease,opacity .11s ease,box-shadow .11s ease}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockrailhit::after{content:"";position:absolute;inset-block-start:50%;inset-inline-start:50%;width:2px;height:2px;border-radius:50%;background:var(--structured-rail-dot);box-shadow:0 -5px 0 var(--structured-rail-dot),0 5px 0 var(--structured-rail-dot);transform:translate(-50%,-50%);opacity:.42;transition:opacity .11s ease,background-color .11s ease}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:hover>.handlecol .blockrailhit::before,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:focus-within>.handlecol .blockrailhit::before,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block[data-selected="true"]>.handlecol .blockrailhit::before{background:var(--structured-rail-line-active);opacity:.9}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:hover>.handlecol .blockrailhit::after,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:focus-within>.handlecol .blockrailhit::after,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block[data-selected="true"]>.handlecol .blockrailhit::after{opacity:.72}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:has(.blockhandle:hover)>.handlecol .blockrailhit::before,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:has(.blockhandle:focus-visible)>.handlecol .blockrailhit::before{background:var(--structured-focus);opacity:1;box-shadow:0 0 0 1px rgba(56,199,255,.08)}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:has(.blockhandle:hover)>.handlecol .blockrailhit::after,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block:has(.blockhandle:focus-visible)>.handlecol .blockrailhit::after{opacity:1}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockhandle{position:absolute;z-index:2;inset-block:4px;inset-inline-start:50%;transform:translateX(-50%);width:22px;height:auto;margin:0;padding:0;border:0;border-radius:999px;background:transparent;box-shadow:none;display:flex;align-items:center;justify-content:center;color:#86a6b8;cursor:grab;touch-action:none;user-select:none}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockhandle:hover,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockhandle:focus-visible{color:#d8eef8;background:transparent;outline:0;box-shadow:none}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockhandle:active{cursor:grabbing}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockhandle .icon{width:8px;height:18px;opacity:0}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block[data-dragging="true"]>.handlecol .blockhandle{color:var(--structured-accent);cursor:grabbing}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block[data-selected="true"]>.structured-block-main>.structured-block-content{background:rgba(56,199,255,.045);box-shadow:inset 2px 0 0 rgba(56,199,255,.42)}
[dir="rtl"] .structured-surface[data-presentation-owner="StructuredPresentationBridge"] .structured-block[data-selected="true"]>.structured-block-main>.structured-block-content{box-shadow:inset -2px 0 0 rgba(56,199,255,.42)}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gap{position:relative;height:12px;display:grid!important;grid-template-columns:var(--structured-editor-gutter) minmax(0,1fr)!important;align-items:center;z-index:3;min-width:0;width:100%!important;margin-inline:0!important;padding-inline:0!important;direction:inherit!important;isolation:isolate;overflow:visible}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gaprail{grid-column:2!important;grid-row:1!important;height:1px;background:transparent;transition:background .1s}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gapplus{grid-column:1!important;grid-row:1!important;position:relative;width:28px;height:28px;min-width:28px;min-height:28px;justify-self:end;margin-inline-end:1px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;background:transparent;color:var(--structured-control-fg);opacity:0;transform:scale(.82);cursor:pointer;transition:opacity .1s,transform .1s,color .1s;z-index:4}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gapplus::before{content:"";position:absolute;width:20px;height:20px;inset:50% auto auto 50%;transform:translate(-50%,-50%);border:1px solid rgba(93,172,210,.28);border-radius:50%;background:#0a2031;opacity:.82;transition:background-color .12s,border-color .12s,opacity .12s}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gap:hover .gaprail,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gap:focus-within .gaprail{background:linear-gradient(90deg,rgba(56,199,255,.03),rgba(56,199,255,.34),rgba(56,199,255,.03))}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gap:hover .gapplus,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gap:focus-within .gapplus{opacity:1;transform:scale(1);color:var(--structured-control-fg-active)}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gapplus:hover::before,
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gapplus:focus-visible::before{border-color:rgba(56,199,255,.72);background:#0d2b40;opacity:1}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gapplus:focus-visible{opacity:1;transform:scale(1);outline:0}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gapplus .icon{position:relative;z-index:1;width:13px;height:13px}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"][data-structured-mode="read"] .handlecol{opacity:0!important;pointer-events:none!important}
.structured-surface[data-presentation-owner="StructuredPresentationBridge"] [aria-disabled="true"]{cursor:not-allowed}
@media(prefers-reduced-motion:reduce){.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .handlecol,.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gaprail,.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .gapplus,.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockrailhit::before,.structured-surface[data-presentation-owner="StructuredPresentationBridge"] .blockrailhit::after{transition:none!important}}
`;

const interactionMap=(interaction,key)=>interaction&&typeof interaction==='object'&&interaction[key]&&typeof interaction[key]==='object'?interaction[key]:Object.freeze({});

export class StructuredPresentationBridge{
  constructor({renderer}={}){
    if(!(renderer instanceof StructuredBlockRenderer)||renderer.owner!=='StructuredBlockRenderer')throw Error('STRUCTURED_BLOCK_RENDERER_REQUIRED');
    this.owner='StructuredPresentationBridge';this.contract=STRUCTURED_PRESENTATION_BRIDGE_CONTRACT;this.renderer=renderer;
  }
  descriptor(){return {owner:this.owner,contract:this.contract,interactionPresentation:STRUCTURED_INTERACTION_PRESENTATION_CONTRACT,rendererOwner:this.renderer.owner,canonicalTruthOwnership:false,donorCompatibility:this.contract.donorCompatibility};}
  blockIdFromTarget(target){return target?.closest?.('[data-structured-block-id],[data-block-id]')?.getAttribute?.('data-structured-block-id')||target?.closest?.('[data-block-id]')?.getAttribute?.('data-block-id')||null;}
  _gapDescriptor(nodes,parentId,depth,index){
    const before=nodes?.[index]?.canonicalBlockId||null,after=index>0?nodes?.[index-1]?.canonicalBlockId||null:null;
    return Object.freeze({kind:'gap',parentId:parentId||null,index,depth,beforeBlockId:before,afterBlockId:after,key:structuredInteractionGapKey({parentId,index,depth})});
  }
  gapHTML(nodes,parentId,depth,index,mode,interaction){
    const gap=this._gapDescriptor(nodes,parentId,depth,index),state=interactionMap(interaction?.gaps,gap.key),enabled=mode==='edit'&&state.enabled===true,relation=gap.afterBlockId&&gap.beforeBlockId?'between':gap.afterBlockId?'after':'before';
    const targetAttrs=`data-structured-target-kind="gap" data-structured-parent-id="${escapeAttribute(gap.parentId||'')}" data-structured-index="${gap.index}" data-structured-depth="${gap.depth}" data-structured-after-block-id="${escapeAttribute(gap.afterBlockId||'')}" data-structured-before-block-id="${escapeAttribute(gap.beforeBlockId||'')}" data-structured-gap-key="${escapeAttribute(gap.key)}"`;
    const button=enabled?`<button type="button" class="gapplus structured-gapplus" data-structured-insertion-trigger="true" data-structured-primary-action="chooser" data-structured-keyboard-action="chooser" data-structured-secondary-action="insert-paragraph" data-insert-gap="${gap.index}" ${targetAttrs} aria-label="Insert block at ${relation} structural boundary, level ${gap.depth}" title="Insert block here">${plusIcon}</button>`:'';
    return `<div class="gap structured-insertion-gap" data-component="StructuredGapInserter" data-presentation-owner="StructuredPresentationBridge" data-interaction-owner="StructuredSurfaceHost" data-insertion-owner="${escapeAttribute(state.insertionOwner||'StructuredInsertionTargetOwner')}" data-action-owner="${escapeAttribute(state.actionOwner||'StructuredActionDescriptorOwner')}" data-availability-owner="${escapeAttribute(state.availabilityOwner||'StructuredCommandAvailabilityOwner')}" data-interactive="${enabled?'true':'false'}" data-availability-code="${escapeAttribute(state.code||'UNPROJECTED')}" ${targetAttrs} role="presentation">${button}<span class="gaprail" aria-hidden="true"></span></div>`;
  }
  _levelHTML(nodes,parentId,depth,mode,interaction,{root=false}={}){
    const list=Array.isArray(nodes)?nodes:[],body=[];
    for(let index=0;index<=list.length;index++){
      body.push(this.gapHTML(list,parentId,depth,index,mode,interaction));
      if(index<list.length)body.push(this.nodeHTML(list[index],interaction));
    }
    const cls=root?'structured-blockarray blockarray':'structured-children structured-blockarray blockarray';
    const parentAttr=parentId?escapeAttribute(parentId):'';
    return `<div class="${cls}" data-parent-block-id="${parentAttr}" data-depth="${depth}" data-children-visible="true" data-presentation-owner="StructuredPresentationBridge">${body.join('')}</div>`;
  }
  nodeHTML(node,interaction=null){
    const blockState=interactionMap(interaction?.blocks,node.canonicalBlockId),childrenVisible=node.childrenVisible!==false;
    const children=(childrenVisible&&(node.children?.length||node.isToggle))?this._levelHTML(node.children||[],node.canonicalBlockId,node.depth+1,node.mode,interaction):'';
    const editable=node.editable?'true':'false',selected=node.selected?'true':'false';
    const toggle=node.isToggle?'true':'false',open=node.open?'true':'false',background=node.background==='soft'?'soft':'none',align=['start','center','end'].includes(node.align)?node.align:'start';
    const classes=['structured-block','block',`structured-block-${escapeAttribute(node.type)}`,node.isToggle?'toggle-block':'',node.selected?'is-selected':'',node.isToggle?(node.open?'is-open':'is-collapsed'):'',`is-align-${align}`,background==='soft'?'has-background-soft':''].filter(Boolean).join(' ');
    const toggleAria=node.isToggle?` aria-expanded="${open}"`:'';
    const handleEnabled=node.mode==='edit'&&blockState.handleEnabled===true,dragEnabled=handleEnabled&&blockState.dragEnabled!==false;
    const handleDisabled=handleEnabled?'':` disabled aria-disabled="true" tabindex="-1"`;
    const gutter=`<div class="handlecol structured-handle-column" aria-label="Block ownership rail"><span class="blockrailhit" data-block-rail="${escapeAttribute(node.canonicalBlockId)}" aria-hidden="true"></span><button type="button" class="blockhandle structured-block-handle" data-structured-block-handle="true" data-block-handle="${escapeAttribute(node.canonicalBlockId)}" data-structured-action-target="${escapeAttribute(node.canonicalBlockId)}" data-structured-drag-enabled="${dragEnabled?'true':'false'}" aria-label="Block actions; activate for actions or drag to reorder" aria-haspopup="menu" aria-keyshortcuts="Shift+F10"${handleDisabled}>${gripIcon}</button></div>`;
    return `<section class="${classes}" data-structured-block-id="${escapeAttribute(node.canonicalBlockId)}" data-block-id="${escapeAttribute(node.canonicalBlockId)}" data-type="${escapeAttribute(node.type)}" data-canonical-path="${escapeAttribute(node.canonicalPath.join('/'))}" data-parent-block-id="${escapeAttribute(node.parentBlockId||'')}" data-index="${node.index}" data-depth="${node.depth}" data-tree-depth="${node.depth}" data-mode="${escapeAttribute(node.mode)}" data-selected="${selected}" data-structured-toggle="${toggle}" data-toggle-open="${open}" data-children-visible="${childrenVisible?'true':'false'}" data-align="${align}" data-background="${background}" data-renderer-owner="${escapeAttribute(node.owner)}" data-rich-content-owner="${escapeAttribute(node.richContentOwner)}" data-direction-owner="${escapeAttribute(node.directionOwner)}" data-presentation-owner="StructuredPresentationBridge" data-selection-owner="${escapeAttribute(blockState.selectionOwner||'StructuredSelectionKernel')}" data-action-owner="${escapeAttribute(blockState.actionOwner||'StructuredActionDescriptorOwner')}" data-drag-drop-owner="${escapeAttribute(blockState.dragDropOwner||'StructuredDragDropOwner')}"${toggleAria} style="--structured-block-gap:${node.presentation.blockGapPx}px;--structured-indent:${node.presentation.indentPx}px;margin-inline-start:${node.presentation.indentPx}px;margin-block-end:${node.presentation.blockGapPx}px;text-align:${align};background-color:${background==='soft'?'#eef6fa':'transparent'}">${gutter}<div class="structured-block-main"><div class="structured-block-content blockcontent" dir="${escapeAttribute(node.direction)}" data-structured-editable="${editable}" contenteditable="${editable}" aria-readonly="${node.editable?'false':'true'}">${node.html}</div>${children}</div></section>`;
  }
  toHTML(projection,{interaction=null}={}){
    if(projection?.owner!=='StructuredBlockRenderer')throw Error('STRUCTURED_RENDER_PROJECTION_REQUIRED');
    const root=`<div class="structured-surface" data-structured-document-id="${escapeAttribute(projection.documentId)}" data-structured-mode="${escapeAttribute(projection.mode)}" data-renderer-policy="${escapeAttribute(projection.policy.revision)}" data-renderer-owner="${escapeAttribute(projection.owner)}" data-presentation-owner="StructuredPresentationBridge" data-interaction-presentation="${escapeAttribute(STRUCTURED_INTERACTION_PRESENTATION_CONTRACT.id)}">${this._levelHTML(projection.blocks,null,0,projection.mode,interaction,{root:true})}</div>`;
    return `<style data-structured-interaction-presentation-style="${escapeAttribute(STRUCTURED_INTERACTION_PRESENTATION_CONTRACT.version)}">${STRUCTURED_INTERACTION_PRESENTATION_CSS}</style>${root}`;
  }
  renderInto(root,projection,{interaction=null}={}){if(!root||typeof root.innerHTML!=='string')throw Error('STRUCTURED_PRESENTATION_ROOT_REQUIRED');root.innerHTML=this.toHTML(projection,{interaction});return {owner:this.owner,rendered:true,documentId:projection.documentId,mode:projection.mode,blockCount:projection.blockCount,canonicalTruthOwnership:false,interactionPresentation:STRUCTURED_INTERACTION_PRESENTATION_CONTRACT.id,donorCompatibility:this.contract.donorCompatibility};}
}

const requiredFunction=(env,name)=>{if(typeof env?.[name]!=='function')throw Error(`STRUCTURED_DONOR_PRESENTATION_ENV_REQUIRED:${name}`);return env[name];};

/**
 * Compatibility projector for the accepted Library runtime. It is deliberately
 * presentation-only: callers retain canonical Structured document, command,
 * mutation, history, selection, and provider truth. The DOM shape is extracted
 * from the accepted W02 Library donor rather than recreated as a lookalike.
 */
export function createAcceptedRuntimeStructuredPresentationOwner(environment={}){
  const doc=environment.document||globalThis.document;
  if(!doc?.createElement)throw Error('STRUCTURED_DONOR_PRESENTATION_DOCUMENT_REQUIRED');
  const esc=requiredFunction(environment,'escape');
  const svg=requiredFunction(environment,'svg');
  const typeLabel=requiredFunction(environment,'typeLabel');
  const selectedBlock=requiredFunction(environment,'selectedBlock');
  const editableForSurface=requiredFunction(environment,'editableForSurface');
  const resolvedDirection=requiredFunction(environment,'resolvedDirection');
  const localIndent=requiredFunction(environment,'localIndent');
  const blockText=requiredFunction(environment,'blockText');
  const placeholder=requiredFunction(environment,'placeholder');
  const renderGap=requiredFunction(environment,'renderGap');
  const renderCodeMarkup=requiredFunction(environment,'renderCodeMarkup');
  const codeRaw=requiredFunction(environment,'codeRaw');
  const inferCodeLanguage=requiredFunction(environment,'inferCodeLanguage');
  const canOwnChildren=requiredFunction(environment,'canOwnChildren');
  const preferences=requiredFunction(environment,'preferences');
  const resolveBlockForRow=requiredFunction(environment,'resolveBlockForRow');

  const owner={
    owner:'StructuredPresentationBridge',
    contract:STRUCTURED_PRESENTATION_BRIDGE_CONTRACT,
    canonicalTruthOwnership:false,
    donorCompatibility:STRUCTURED_PRESENTATION_BRIDGE_CONTRACT.donorCompatibility,
    renderBlockArray(blocks,surfaceKey,parentId,depth){
      const wrap=doc.createElement('div');
      wrap.className='blockarray';
      wrap.dataset.depth=String(depth);
      wrap.dataset.parentId=parentId||'';
      wrap.dataset.presentationOwner=this.owner;
      wrap.setAttribute('role','list');
      const list=Array.isArray(blocks)?blocks:[];
      for(let index=0;index<=list.length;index++){
        wrap.append(renderGap(surfaceKey,parentId,depth,index,list));
        if(index<list.length)wrap.append(this.renderBlock(list[index],surfaceKey,parentId,depth,index));
      }
      return wrap;
    },
    renderBlock(block,surfaceKey,parentId,depth,index){
      const row=doc.createElement('div');
      row.className=`block ${block.type==='toggle'?'toggle-block':''}`;
      row.dataset.blockId=block.id;
      row.dataset.type=block.type;
      row.dataset.depth=String(depth);
      row.dataset.treeDepth=String(depth);
      row.dataset.parentId=parentId||'';
      row.dataset.surface=surfaceKey;
      row.dataset.selected=String(selectedBlock(surfaceKey)===block.id);
      row.dataset.presentationOwner=this.owner;
      row.setAttribute('role','listitem');
      if(block.type==='toggle')row.dataset.open=String(block.open!==false);
      const editable=editableForSurface(surfaceKey),resolved=resolvedDirection(block),direction=block.type==='code'?'ltr':resolved;
      const gutter=`<div class="handlecol" aria-label="مسار ملكية العنصر"><span class="blockrailhit" data-block-rail="${esc(block.id)}"></span><button class="blockhandle" data-block-handle="${esc(block.id)}" aria-label="أوامر ${esc(typeLabel(block.type))}؛ انقر للقائمة واسحب لنقل الفرع" aria-haspopup="dialog" aria-keyshortcuts="Shift+F10">${svg('i-grip')}</button></div>`;
      const content=doc.createElement('div');content.className='blockcontent';
      const indent=localIndent(block);row.dataset.indent=String(indent);
      if(indent){const px=`${indent*24}px`;if(direction==='rtl')content.style.paddingRight=px;else content.style.paddingLeft=px;}
      row.innerHTML=gutter;row.append(content);
      if(block.type==='toggle'){
        const childCount=block.children?.length||0;
        content.innerHTML=`<div class="blockbody toggle-shell" data-align="${esc(block.align||'start')}" data-dir="${esc(block.dir||'auto')}" data-resolved-dir="${direction}" style="direction:${direction}"><div class="toggle-head"><button class="toggle-trigger" data-toggle-block="${esc(block.id)}" aria-expanded="${block.open!==false}" aria-controls="toggle-children-${esc(block.id)}" aria-label="${block.open!==false?'طي':'توسيع'} القسم">${svg('i-chev')}</button><div class="toggle-title" role="textbox" aria-multiline="false" aria-label="عنوان القسم القابل للطي" data-editable-block="${esc(block.id)}" data-editability="${editable?'editable':'read-only'}" data-authority="user-content" data-align="${esc(block.align||'start')}" data-dir="${esc(block.dir||'auto')}" data-resolved-dir="${direction}" data-empty="${String(!blockText(block).trim())}" data-placeholder="${esc(placeholder('toggle'))}" dir="${direction}" style="direction:${direction}" contenteditable="${editable}" spellcheck="false">${block.titleHtml??esc(block.title||'')}</div>${childCount?`<span class="toggle-count" aria-label="${childCount} عناصر داخلية">${childCount}</span>`:''}</div><div class="toggle-children" id="toggle-children-${esc(block.id)}" data-toggle-children="${esc(block.id)}"></div></div>`;
        const children=content.querySelector('.toggle-children');
        if(block.open!==false){if(childCount)children.append(this.renderBlockArray(block.children||[],surfaceKey,block.id,depth+1));else children.innerHTML='<div class="toggle-empty">القسم فارغ · Shift+Enter للدخول وإنشاء أول فقرة.</div>';}
      }else{
        const contentHTML=block.type==='code'?renderCodeMarkup(block):(block.html||'');
        content.innerHTML=`<div class="blockbody" role="textbox" aria-multiline="true" aria-label="تحرير ${esc(typeLabel(block.type))}" data-editable-block="${esc(block.id)}" data-editability="${editable?'editable':'read-only'}" data-authority="user-content" data-align="${esc(block.align||'start')}" data-dir="${esc(block.dir||'auto')}" data-resolved-dir="${direction}" data-bg="${esc(block.bg||'none')}" data-empty="${String(!blockText(block).trim())}" data-placeholder="${esc(placeholder(block.type))}" ${block.type==='number'?`data-list-number="${index+1}"`:''} dir="${direction}" style="direction:${direction}" contenteditable="${editable}" spellcheck="false">${contentHTML}</div>`;
        if(block.type==='code'){
          const language=block.language||inferCodeLanguage(codeRaw(block));
          content.insertAdjacentHTML('afterbegin',`<div class="codebar" contenteditable="false"><span class="codelang"><bdi dir="ltr">${esc(language)}</bdi></span><span class="codeauthority">syntax = render-only</span><button type="button" class="codecopy" data-code-copy="${esc(block.id)}" data-surface="${esc(surfaceKey)}" aria-label="نسخ الكود حسب تفضيل الحافظة">${svg('i-copy')}<span>نسخ</span></button></div>`);
          applyStructuredCodeViewPreferences(content.querySelector('.blockbody'),block,{preferences:preferences(),rawCode:codeRaw});
        }
        if(canOwnChildren(block.type)){
          const children=doc.createElement('div');children.className='block-children';children.dataset.childrenOf=block.id;
          if(block.children?.length)children.append(this.renderBlockArray(block.children,surfaceKey,block.id,depth+1));
          content.append(children);
        }
      }
      return row;
    },
    applyCodeViewPreferences(root=doc){
      root.querySelectorAll?.('.block[data-type="code"] > .blockcontent > .blockbody').forEach(element=>{
        const row=element.closest('.block'),block=row?resolveBlockForRow(row):null;
        if(block)applyStructuredCodeViewPreferences(element,block,{preferences:preferences(),rawCode:codeRaw});
      });
      root.querySelectorAll?.('.codebar').forEach(bar=>{bar.dataset.copyControls=String(preferences().codeShowCopyControls!==false);});
      return true;
    }
  };
  return Object.freeze(owner);
}
