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
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation{cursor:default}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation .relation-line{transition:stroke-width .14s ease,stroke .14s ease}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation:hover .relation-line,[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation:focus-visible .relation-line{stroke:var(--accent);stroke-width:2.2}
[data-spatial-presentation-owner="SpatialPresentationOwner"] .spatial-relation[aria-pressed="true"] .relation-line{stroke:var(--accent);stroke-width:3}
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
  const aria=`${source.label||source.id} to ${target.label||target.id}: ${edge.type}${edge.direction==='bidirectional'?', bidirectional':''}`;
  return `<g class="spatial-relation" data-edge="${esc(edge.id)}" tabindex="${tabbable?'0':'-1'}" role="button" aria-pressed="${selected}" aria-label="${esc(aria)}" aria-keyshortcuts="F2 Shift+R"><line class="relation-hit-target" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="transparent" stroke-width="18"/><line class="relation-line" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${selected?'var(--accent)':'var(--text3)'}" stroke-width="${selected?3:1.4}" marker-end="url(#${markerId})" ${edge.direction==='bidirectional'?`marker-start="url(#${markerId})"`:''}/><text class="relation-label" data-relation-label="${esc(edge.id)}" x="${labelX}" y="${labelY}" fill="var(--text)" text-anchor="middle" font-size="12" direction="ltr">${esc(edge.type)}</text></g>`;
}

export function renderSpatialNode({node,selected=false,tabbable=false}){
  const status=node.status||node.id,statusFill=node.status==='DOWN'?'var(--bad)':'var(--text3)';
  return `<g class="spatial-node-card" data-node="${esc(node.id)}" transform="translate(${node.x},${node.y})" tabindex="${tabbable?'0':'-1'}" role="button" aria-pressed="${selected}" aria-label="${esc(`${node.label} ${status}`)}"><rect class="node-surface" width="132" height="62" rx="10" fill="var(--bg2)" stroke="${selected?'var(--accent)':'var(--line2)'}" stroke-width="${selected?3:1}"/><text x="12" y="26" fill="var(--text)" font-size="13" font-weight="600" direction="ltr">${esc(node.label)}</text><text x="12" y="47" fill="${statusFill}" font-size="10" direction="ltr">${esc(status)}</text></g>`;
}

export function spatialReadout({zoom,selectionCount,nodeCount,relationSelected=false}){
  return `${Math.round(zoom*100)}% · ${selectionCount} selected · ${nodeCount} objects${relationSelected?' · relation selected':''}`;
}
