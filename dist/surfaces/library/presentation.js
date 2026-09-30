/* Library surface presentation — SURFACE-SPECIFIC COMPOSITION for `library`.
   Shared mechanics (StructureTree outline kernel, UnifiedEditorCore, ContextLensHost,
   BottomDeepWork owner) are consumed, never re-implemented; everything below is
   Library-local grouping, hierarchy, density and emphasis.
   Owner: W02-LIBRARY. Read before editing: controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md §17. */

import {STRUCTURE_TREE,FIXTURES,LIBRARY_FIXTURE_CLASSIFICATION} from '../../adapters/library-fixtures.js';

const STYLE_ID='librarySurfacePresentationStyle';
const MASTHEAD_ID='libraryDocumentMasthead';

/* ── locale helpers (active language is user-configurable; nothing is baked) ───────────────── */
const locale=()=>String(document?.documentElement?.lang||'').toLowerCase().startsWith('ar')?'ar':'en';
const TEXT={
  ar:{
    paneLeft:'المكتبة',
    source:'المصدر',
    revision:'المراجعة',
    sourceVersion:'إصدار المصدر',
    digest:'بصمة SHA-256',
    units:'وحدة',domains:'نطاق',unitsShort:'وحدات',domainsShort:'نطاقات'
  },
  en:{
    paneLeft:'Library',
    source:'Source',
    revision:'Revision',
    sourceVersion:'Source version',
    digest:'SHA-256 digest',
    units:'unit',domains:'domain',unitsShort:'units',domainsShort:'domains'
  }
};
const t=()=>TEXT[locale()];

const esc=value=>String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const nodeForKu=(ku)=>{
  const walk=list=>{for(const node of list||[]){if(node.ku===ku)return node;const hit=walk(node.children);if(hit)return hit}return null};
  return walk(STRUCTURE_TREE);
};
const countKu=list=>(list||[]).reduce((n,node)=>n+(node.ku?1:countKu(node.children)),0);

/* ── Library-owned stylesheet. Scoped to this surface only; no direction is baked. ─────────── */
const SHEET=`
body[data-consumer="library"] .structure-footer{flex-wrap:wrap;row-gap:5px;column-gap:8px;align-items:center}
body[data-consumer="library"] .structure-footer > div:first-child{display:flex;flex-direction:column;gap:3px;flex:1 1 auto;min-width:0}
body[data-consumer="library"] .structure-footer .active-path{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;text-align:start;unicode-bidi:isolate}
/* an outline node without children must not paint an empty count chip */
body[data-consumer="library"] #structureTree .treecount:empty{display:none}
body[data-consumer="library"] #structureTree .treeitem{padding-block:5px}
body[data-consumer="library"] .tree-scroll{display:flex;flex-direction:column;padding-block-end:8px}
body[data-consumer="library"] .tree-scroll > #structureTree,body[data-consumer="library"] .tree-scroll > .structureempty{flex:0 0 auto}
body[data-consumer="library"] .tree-scroll > .lib-corpus{margin-block-start:auto;flex:0 0 auto}

body[data-consumer="library"] #libraryDocumentMasthead{
  display:flex;flex-direction:column;gap:10px;
  padding-block:2px 10px;margin-block-end:2px;
}
body[data-consumer="library"] .lib-mast-meta{
  display:flex;flex-wrap:wrap;align-items:center;gap:6px 0;
  font-size:12px;line-height:1.4;color:color-mix(in srgb,currentColor 72%,transparent);
}
body[data-consumer="library"] .lib-mast-meta > span{display:inline-flex;align-items:baseline;gap:5px;padding-inline-end:14px}
body[data-consumer="library"] .lib-mast-meta > span:not(:last-child){position:relative}
body[data-consumer="library"] .lib-mast-meta > span:not(:last-child)::after{
  content:"";position:absolute;inset-inline-end:5px;inset-block-start:.35em;
  inline-size:1px;block-size:.85em;background:currentColor;opacity:.28;
}
body[data-consumer="library"] .lib-mast-meta .k{
  font-size:10.5px;letter-spacing:.04em;text-transform:none;opacity:.72;margin-inline-end:5px;
}
body[data-consumer="library"] .lib-mast-meta .v{font-weight:600;color:currentColor;opacity:.95}
body[data-consumer="library"] .lib-mast-meta .tech{font-family:var(--mono,ui-monospace,monospace);font-size:11.5px;direction:ltr;unicode-bidi:isolate}
body[data-consumer="library"] .lib-mast-sep{inline-size:1px;block-size:12px;background:currentColor;opacity:.18}
body[data-consumer="library"] .lib-mast-tags{display:flex;flex-wrap:wrap;gap:6px}
body[data-consumer="library"] .lib-mast-tags .tag{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:600;line-height:1.5;
  border:1px solid color-mix(in srgb,currentColor 22%,transparent);
  background:color-mix(in srgb,currentColor 7%,transparent);
  color:inherit;
}
body[data-consumer="library"] .lib-mast-tags .tag::before{
  content:"";inline-size:5px;block-size:5px;border-radius:50%;
  background:color-mix(in srgb,currentColor 55%,transparent);
}
body[data-consumer="library"] .lib-corpus{
  display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;
  margin-block-start:10px;padding-block-start:10px;
  border-block-start:1px solid color-mix(in srgb,currentColor 10%,transparent);
  font-size:11.5px;color:color-mix(in srgb,currentColor 70%,transparent);
}
body[data-consumer="library"] .lib-corpus strong{color:inherit;opacity:1;font-weight:700}
`;

function ensureSheet(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=SHEET;
  document.head.append(style);
}

/* ── 1. Tree state: the donor seeds `structure.expanded` with node ids from an older tree
       shape, so the Library corpus renders as three collapsed rows. Reseed from the real
       fixture tree so the corpus is browsable at first paint. ────────────────────────────── */
function seedTreeState(bp){
  const state=bp.state;
  if(!state?.structure)return false;
  const activeKu=state.route.activeKu;
  const expanded=new Set();
  for(const root of STRUCTURE_TREE){
    expanded.add(root.id);
    if((root.children||[]).some(child=>child.ku===activeKu))expanded.add(root.id);
  }
  const activeNode=nodeForKu(activeKu);
  if(activeNode){
    expanded.add(activeNode.id);
    state.structure.focusedId=activeNode.id;
  }
  state.structure.expanded=expanded;
  bp.renderStructure?.();
  return true;
}

/* ── 2. Pane identity: the reference states the workspace in the pane heading; the donor
       markup ships a generic "Structure" heading. ──────────────────────────────────────────── */
function paintPaneIdentity(){
  const heading=document.querySelector('#leftPane .phead h2');
  if(!heading)return false;
  const label=t().paneLeft;
  if(heading.textContent!==label){
    heading.textContent=label;
    heading.setAttribute('dir',locale()==='ar'?'rtl':'ltr');
    heading.style.setProperty('unicode-bidi','isolate');
  }
  return true;
}

/* ── 3. Document masthead: reference hierarchy is title → source/revision/status → tags.
       The donor suppresses its own `.docintro`, so Library owns this strip. ─────────────────── */
function mastheadHTML(fixture){
  if(!fixture)return '';
  const L=t();
  const provenance=fixture.provenance||{};
  const source=fixture.sources?.[0]||{};
  const digest=String(provenance.sourceSha256||'');
  const tech=value=>`<bdi class="tech" dir="ltr">${esc(value)}</bdi>`;
  const pair=(label,value)=>`<span><span class="k">${esc(label)}</span><span class="v">${value}</span></span>`;
  const meta=[
    fixture.revision?pair(L.revision,tech(fixture.revision)):'',
    provenance.sourceVersion?pair(L.sourceVersion,tech(provenance.sourceVersion)):'',
    source.title?pair(L.source,tech(source.title)):'',
    digest?pair(L.digest,tech(`${digest.slice(0,12)}…`)):''
  ].filter(Boolean).join('');
  const tags=(fixture.tags||[]).map(tag=>`<span class="tag" dir="auto">${esc(tag)}</span>`).join('');
  if(!meta&&!tags)return '';
  return `<div class="lib-mast-meta">${meta}</div>${tags?`<div class="lib-mast-tags">${tags}</div>`:''}`;
}

function ensureMasthead(bp){
  const host=document.getElementById('editorDocument');
  const groups=document.getElementById('contentGroups');
  if(!host||!groups)return false;
  let mast=document.getElementById(MASTHEAD_ID);
  if(!mast){
    mast=document.createElement('div');
    mast.id=MASTHEAD_ID;
    mast.setAttribute('data-component','LibraryDocumentMasthead');
    mast.setAttribute('data-presentation-owner','W02-LIBRARY');
    host.insertBefore(mast,groups);
  }
  /* the editing canvas keeps the donor's own content direction; this chrome strip follows the
     active product direction so labels and values always read label → value. */
  mast.style.direction=document.documentElement.dir==='rtl'?'rtl':'ltr';
  const fixture=FIXTURES[bp.state?.route?.activeKu];
  mast.innerHTML=mastheadHTML(fixture);
  return true;
}

/* ── 4. Left-pane corpus line: real counts derived from the fixture tree (no invented data). ── */
function ensureCorpusLine(bp){
  const host=document.querySelector('#leftPane .tree-scroll');
  if(!host)return false;
  let line=host.querySelector(':scope > .lib-corpus');
  if(!line){
    line=document.createElement('div');
    line.className='lib-corpus';
    line.setAttribute('data-component','LibraryCorpusSummary');
    line.setAttribute('data-presentation-owner','W02-LIBRARY');
    host.append(line);
  }
  const ku=countKu(STRUCTURE_TREE),dom=STRUCTURE_TREE.length,L=t();
  line.innerHTML=`<span><strong>${esc(String(ku))}</strong> ${esc(ku===1?L.units:L.unitsShort)}</span>
<span aria-hidden="true">·</span>
<span><strong>${esc(String(dom))}</strong> ${esc(dom===1?L.domains:L.domainsShort)}</span>
<span aria-hidden="true">·</span>
<bdi class="tech" dir="ltr">${esc(String(LIBRARY_FIXTURE_CLASSIFICATION||'').split('__')[0]||'')}</bdi>`;
  return true;
}

/* ── entry point ──────────────────────────────────────────────────────────────────────────── */
export function mountLibrarySurfacePresentation({structured=null,workspace=null}={}){
  const bp=globalThis.CEPBlueprint;
  const result={surface:'library',owner:'W02-LIBRARY',presentationOwner:'LibrarySurfacePresentation',mounted:false,steps:[],structuredOwner:structured?.owner||null};
  if(!bp||!bp.state){result.reason='CEP_BLUEPRINT_UNAVAILABLE';return result}
  ensureSheet();
  result.treeSeeded=seedTreeState(bp);
  result.paneIdentity=paintPaneIdentity();
  result.masthead=ensureMasthead(bp);
  result.corpusLine=ensureCorpusLine(bp);
  result.mounted=true;
  result.steps.push('seedTreeState','paintPaneIdentity','ensureMasthead','ensureCorpusLine');

  /* re-apply on language/direction change (active language is user-configurable in Settings) */
  const repaint=()=>{paintPaneIdentity();ensureMasthead(bp);ensureCorpusLine(bp)};
  const langObserver=new MutationObserver(repaint);
  langObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});

  /* the donor re-renders the block list whenever the active KU or the document changes */
  const blockList=document.getElementById('blockList');
  let scheduled=false;
  const bodyObserver=new MutationObserver(()=>{
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;ensureMasthead(bp)});
  });
  if(blockList)bodyObserver.observe(blockList,{childList:true});

  result.locale=locale();
  return result;
}
