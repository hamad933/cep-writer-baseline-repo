export const SPATIAL_PRESENTATION_OWNER_ID='SpatialPresentationOwner';
export const SPATIAL_PRESENTATION_CONTRACT=Object.freeze({
  id:'SpatialPresentationOwner',
  version:'1.0.0',
  owner:SPATIAL_PRESENTATION_OWNER_ID,
  compatibility:'SEMVER',
  responsibilities:Object.freeze(['canvas-shell','node-presentation','relation-presentation','selection-and-focus-state','spatial-status','reduced-motion-presentation'])
});

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const token=value=>String(value??'').replace(/[^a-zA-Z0-9_-]/g,'-');
const STYLE=`
[data-spatial-presentation-owner="SpatialPresentationOwner"]{position:relative;isolation:isolate}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-canvas{background:radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--accent) 10%,transparent),transparent 34%),var(--bg);border-radius:12px}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-node-card{cursor:default}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-node-card .node-surface{transition:stroke-width .14s ease,stroke .14s ease,filter .14s ease}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-node-card:hover .node-surface{stroke:color-mix(in srgb,var(--accent) 62%,var(--line2));filter:drop-shadow(0 6px 10px rgba(0,0,0,.12))}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-node-card:focus-visible .node-surface{stroke:var(--accent);stroke-width:3;filter:drop-shadow(0 0 0 3px color-mix(in srgb,var(--accent) 24%,transparent))}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-node-duplicate .node-surface{stroke-dasharray:5 3;stroke:color-mix(in srgb,var(--accent) 75%,var(--line2))}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-multi-selection-group .group-boundary{stroke:var(--accent);stroke-dasharray:6 4;stroke-width:1.5px;fill:color-mix(in srgb,var(--accent) 6%,transparent);pointer-events:none}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-multi-selection-group .group-label{font-family:var(--mono);font-size:11px;font-weight:700;fill:var(--accent);pointer-events:none}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation{cursor:default}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation .relation-line{transition:stroke-width .14s ease,stroke .14s ease}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation:hover .relation-line,[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation:focus-visible .relation-line{stroke:var(--accent);stroke-width:2.2}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation[aria-pressed="true"] .relation-line{stroke:var(--accent);stroke-width:3}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation-canvas-only .relation-line{stroke:color-mix(in srgb,var(--accent) 70%,#f59e0b);stroke-dasharray:6 3}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation-canvas-only .relation-label{fill:color-mix(in srgb,var(--accent) 85%,#f59e0b);font-weight:600}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-readout{backdrop-filter:blur(8px)}
@media (prefers-reduced-motion:reduce){[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-node-card .node-surface,[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation .relation-line{transition:none}}
`;

export function mountSpatialPresentation(host){
  host.dataset.spatialPresentationOwner=SPATIAL_PRESENTATION_OWNER_ID;
  host.dataset.spatialPresentationContract=SPATIAL_PRESENTATION_CONTRACT.version;
  if(!host.querySelector('style[data-spatial-presentation-style]')){
    const style=document.createElement('style');
    style.dataset.spatialPresentationStyle=SPATIAL_PRESENTATION_OWNER_ID;
    style.textContent=STYLE;
    host.prepend(style);
  }
  return SPATIAL_PRESENTATION_CONTRACT;
}

export function spatialShellMarkup(instanceId){
  const id=token(instanceId);
  return `<svg class="spatial-canvas" data-spatial-instance="${id}" tabindex="0" role="group" aria-label="Spatial workspace" aria-describedby="${id}-spatial-help" aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown Control+ArrowLeft Control+ArrowRight Control+ArrowUp Control+ArrowDown Shift+F10 F2 Shift+R Escape" xmlns="http://www.w3.org/2000/svg"></svg><p id="${id}-spatial-help" class="spatial-accessible-help" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0">Arrow keys move spatial focus. Shift extends selection. Alt pans. Control or Command moves selected objects. F2 edits the focused relation. Shift R reverses an editable relation. Shift F10 opens context actions. Escape cancels the active spatial gesture or clears selection.</p><div class="spatial-readout" aria-live="polite" aria-atomic="true"></div><div class="spatial-accessible-nav" role="listbox" aria-label="Spatial object navigator" aria-multiselectable="true" tabindex="0" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0"></div><svg class="minimap" aria-label="Map overview" role="img"></svg>`;
}

export function renderSpatialRelation({edge,source,target,selected=false,tabbable=false,markerId}){
  const ax=source.x+66,ay=source.y+31,bx=target.x+66,by=target.y+31,labelX=(source.x+target.x)/2+66,labelY=(source.y+target.y)/2+25;
  const isCanvasOnly=Boolean(edge.presentationOnly||edge.kind==='canvas-presentation'||edge.type==='canvas-only'||edge.type?.startsWith('canvas'));
  const strokeColor=selected?'var(--accent)':isCanvasOnly?'color-mix(in srgb,var(--accent) 70%,#f59e0b)':'var(--text3)';
  const strokeDash=isCanvasOnly?'stroke-dasharray="6 3"':'';
  const strokeWidth=selected?3:(isCanvasOnly?1.8:1.4);
  const aria=isCanvasOnly?`Canvas-only presentation link (non-canonical): ${source.label||source.id} to ${target.label||target.id}: ${edge.type}`:`${source.label||source.id} to ${target.label||target.id}: ${edge.type}${edge.direction==='bidirectional'?', bidirectional':''}`;
  const labelText=isCanvasOnly?`[Canvas] ${edge.type}`:edge.type;
  return `<g class="spatial-relation ${isCanvasOnly?'spatial-relation-canvas-only':''}" data-edge="${esc(edge.id)}" data-presentation-only="${isCanvasOnly}" tabindex="${tabbable?'0':'-1'}" role="button" aria-pressed="${selected}" aria-label="${esc(aria)}" aria-keyshortcuts="F2 Shift+R"><line class="relation-hit-target" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="transparent" stroke-width="18"/><line class="relation-line" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${strokeColor}" stroke-width="${strokeWidth}" ${strokeDash} marker-end="url(#${markerId})" ${edge.direction==='bidirectional'?`marker-start="url(#${markerId})"`:''}/><text class="relation-label ${isCanvasOnly?'relation-label-canvas-only':''}" data-relation-label="${esc(edge.id)}" x="${labelX}" y="${labelY}" fill="${isCanvasOnly?'color-mix(in srgb,var(--accent) 85%,#f59e0b)':'var(--text)'}" text-anchor="middle" font-size="11" font-weight="${isCanvasOnly?'600':'400'}" direction="ltr">${esc(labelText)}</text></g>`;
}

export function renderSpatialNode({node,selected=false,tabbable=false}){
  const status=node.status||node.id,statusFill=node.status==='DOWN'?'var(--bad)':'var(--text3)';
  const isDuplicate=Boolean(node.presentationState?.duplicateOf||node.duplicateOf||String(node.id).includes('--canvas-rep-'));
  const strokeColor=selected?'var(--accent)':isDuplicate?'color-mix(in srgb,var(--accent) 75%,var(--line2))':'var(--line2)';
  const strokeDash=isDuplicate?'stroke-dasharray="5 3"':'';
  const duplicateBadge=isDuplicate?`<rect x="12" y="44" width="70" height="13" rx="3" fill="color-mix(in srgb,var(--accent) 15%,var(--bg2))" stroke="var(--accent)" stroke-width="0.8"/><text class="duplicate-badge" x="16" y="53" fill="var(--accent)" font-size="8.5" font-weight="700" font-family="var(--mono)" direction="ltr">[DUPLICATE]</text>`:'';
  const ariaLabel=isDuplicate?`${node.label} ${status} [Duplicate of ${node.presentationState?.duplicateOf||'source'}]`:`${node.label} ${status}`;
  return `<g class="spatial-node-card ${isDuplicate?'spatial-node-duplicate':''}" data-node="${esc(node.id)}" data-duplicate="${isDuplicate}" transform="translate(${node.x},${node.y})" tabindex="${tabbable?'0':'-1'}" role="button" aria-pressed="${selected}" aria-label="${esc(ariaLabel)}"><rect class="node-surface" width="132" height="62" rx="10" fill="var(--bg2)" stroke="${strokeColor}" stroke-width="${selected?3:(isDuplicate?1.8:1)}" ${strokeDash}/><text x="12" y="26" fill="var(--text)" font-size="13" font-weight="600" direction="ltr">${esc(node.label)}</text><text x="${isDuplicate?86:12}" y="47" fill="${statusFill}" font-size="10" direction="ltr">${esc(status)}</text>${duplicateBadge}</g>`;
}

export function renderMultiSelectionGroupBoundary({nodes,selectedIds}){
  if(!selectedIds||selectedIds.size<=1)return '';
  const selectedNodes=nodes.filter(n=>selectedIds.has(n.id)&&Number.isFinite(n.x)&&Number.isFinite(n.y));
  if(selectedNodes.length<=1)return '';
  const pad=16,nodeW=132,nodeH=62;
  const minX=Math.min(...selectedNodes.map(n=>n.x))-pad;
  const minY=Math.min(...selectedNodes.map(n=>n.y))-pad;
  const maxX=Math.max(...selectedNodes.map(n=>n.x+nodeW))+pad;
  const maxY=Math.max(...selectedNodes.map(n=>n.y+nodeH))+pad;
  const width=maxX-minX,height=maxY-minY;
  return `<g class="spatial-multi-selection-group" data-selection-count="${selectedNodes.length}"><rect class="group-boundary" x="${minX}" y="${minY}" width="${width}" height="${height}" fill="color-mix(in srgb,var(--accent) 6%,transparent)" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="6 4" rx="10"/><text class="group-label" x="${minX+10}" y="${minY-6}" font-size="11" font-weight="700" font-family="var(--mono)" fill="var(--accent)">GROUP BOUNDARY (${selectedNodes.length} selected)</text></g>`;
}

export function spatialReadout({zoom,selectionCount,nodeCount,relationSelected=false}){
  return `${Math.round(zoom*100)}% · ${selectionCount} selected · ${nodeCount} objects${relationSelected?' · relation selected':''}`;
}
