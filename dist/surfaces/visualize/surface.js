import {VISUALIZE_DOMAIN_OWNER,VISUALIZE_VIEW_MODES} from '../../adapters/visualize/domain.js';
import {renderStructuredOutline,resolveStructuredOutlineKeyboardIntent} from '../../foundation/structured/outline-host.js';
import {createStructuredOutlinePresentationDescriptor} from '../../foundation/structured/outline-descriptor.js';
const hasCommand=(registry,id)=>registry?.commands instanceof Map&&registry.commands.has(id);
const register=(registry,id,label,run,available=()=>true)=>{if(!hasCommand(registry,id))registry.register(id,VISUALIZE_DOMAIN_OWNER,label,run,available);return id;};
const SHARED_SPATIAL_COMMANDS=Object.freeze(['spatial.connect','spatial.relation.commit','relation.edit','relation.undo','relation.redo','spatial.fit','spatial.align','spatial.distribute','spatial.undo','spatial.redo']);
const VIEW_COMMANDS=Object.freeze(Object.fromEntries(VISUALIZE_VIEW_MODES.map(mode=>[mode,`visualize.view.${mode.toLowerCase()}`])));
const normalizeMode=value=>VISUALIZE_VIEW_MODES.includes(String(value||'').toUpperCase())?String(value).toUpperCase():null;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groupKey=row=>{const id=String(row?.canonicalRef?.objectId||'');return id.match(/^KU-(D\d+)-/)?.[1]||'LOCAL';};
const selectedSet=adapter=>new Set([...adapter.model.selection]);
const selectedRecords=adapter=>{const ids=selectedSet(adapter);return adapter.representationProjection().representations.filter(item=>ids.has(item.representationId));};

/* ── VISUALIZE presentation copy — Arabic and English are BOTH first-class; the active language
   is the Settings-owned document language. Direction is never baked into structure: it follows
   the active preference, and technical tokens are isolated with <bdi dir="ltr">. ───────────── */
const VIS_TEXT=Object.freeze({
  en:{
    eyebrow:'VISUALIZE TREE-VIEW',title:'Visualize tree-view',subtitle:'Spatial representation workspace',
    switcherLabel:'Representation view',
    views:{TREE:'Tree',PATH:'Path',GRAPH:'Graph',CANVAS:'Canvas'},
    viewDesc:{TREE:'Hierarchical structure of the knowledge graph',PATH:'Ordered display lanes by source domain',GRAPH:'Focused relationship projection around the selection',CANVAS:'Freeform spatial canvas for presentation layout'},
    metaSelection:'Selected',metaNone:'none',metaObjects:'objects',metaRelations:'relations',
    leftTitle:'Structure navigator',scopeTitle:'Active graph',statObjects:'Objects',statRelations:'Relations',statDomains:'Domains',
    domainsTitle:'Source domains',objectsTitle:'Graph objects',noSelection:'No object selected',selectHint:'Select an object to inspect its relationships.',
    treeTitle:'Tree structure',auxTitle:'Auxiliary source-family navigation — not hierarchy',
    hierarchyUnavailable:'Hierarchy unavailable',hierarchyUnavailableBody:'No admitted canonical containment hierarchy is observed from the bound Visualize provider.',
    sourceTruth:'Source truth',mutation:'Containment mutation',
    colObject:'Object',colKind:'Kind',colRelations:'Relations',colSource:'Source',
    pathTitle:'Path representation',pathBody:'Lane order is a display projection only; it does not assert canonical prerequisites, progress or Mastery.',pathStep:'Step',pathLanes:'lanes',
    legendTitle:'Edge types',legendCanonical:'Canonical',legendRelated:'Related',legendCurrentPath:'Current path',legendCanvasOnly:'Canvas only',
    rightTitle:'Selection context',rightObject:'Object',rightRelations:'Relationships',rightProvenance:'Provenance',
    noRelations:'No projected relationships for this object.',incoming:'Incoming',outgoing:'Outgoing',
    fieldKind:'Kind',fieldIdentifier:'Identifier',fieldDomain:'Source domain',fieldVersion:'Source version',fieldCanvas:'Canvas position',fieldViews:'Views in',fieldDigest:'Source digest',
    canvasStatusTitle:'Canvas representation status',canvasStatusBody:'Canvas presentation state only. These actions do not create or delete canonical objects, change canonical relationships, or persist a Saved Map.',
    actionHome:'Authoritative action home: Canvas Toolbar',truthLabel:'Provider truth'
  },
  ar:{
    eyebrow:'تصوّر شجرة المعرفة',title:'تصوّر — شجرة المعرفة',subtitle:'مساحة عمل التمثيلات المكانية',
    switcherLabel:'طريقة عرض التمثيل',
    views:{TREE:'شجرة',PATH:'مسار',GRAPH:'شبكة',CANVAS:'لوحة'},
    viewDesc:{TREE:'البنية الهرمية لرسم المعرفة',PATH:'مسارات عرض مرتبة حسب مجال المصدر',GRAPH:'إسقاط العلاقات المركّز حول التحديد',CANVAS:'لوحة مكانية حرة لتنسيق العرض'},
    metaSelection:'التحديد',metaNone:'لا شيء',metaObjects:'كائن',metaRelations:'علاقة',
    leftTitle:'مستكشف البنية',scopeTitle:'المخطط النشط',statObjects:'كائنات',statRelations:'علاقات',statDomains:'مجالات',
    domainsTitle:'مجالات المصدر',objectsTitle:'كائنات المخطط',noSelection:'لا يوجد كائن محدد',selectHint:'حدّد كائنًا لفحص علاقاته.',
    treeTitle:'الهيكل الشجري',auxTitle:'تنقّل عائلات المصدر المساعد — ليس شجرة هرمية',
    hierarchyUnavailable:'الشجرة الهرمية غير متاحة',hierarchyUnavailableBody:'لا تُرصد شجرة احتواء كانونية معتمدة لدى مزوّد التصوّر المربوط.',
    sourceTruth:'مصدر الحقيقة',mutation:'صلاحية تعديل الاحتواء',
    colObject:'الكائن',colKind:'النوع',colRelations:'العلاقات',colSource:'المصدر',
    pathTitle:'عرض المسار',pathBody:'ترتيب المسارات هو إسقاط عرض فقط؛ لا يزعم ترتيبًا كانونيًا للمتطلبات أو تقدّمًا أو إتقانًا.',pathStep:'الخطوة',pathLanes:'مسار',
    legendTitle:'أنواع العلاقات',legendCanonical:'كانوني',legendRelated:'مرتبط',legendCurrentPath:'المسار الحالي',legendCanvasOnly:'للّوحة فقط',
    rightTitle:'سياق التحديد',rightObject:'الكائن',rightRelations:'العلاقات',rightProvenance:'المصدرية',
    noRelations:'لا توجد علاقات مُسقَطة لهذا الكائن.',incoming:'وارد',outgoing:'صادر',
    fieldKind:'النوع',fieldIdentifier:'المعرّف',fieldDomain:'مجال المصدر',fieldVersion:'إصدار المصدر',fieldCanvas:'موضع اللوحة',fieldViews:'حضور في',fieldDigest:'بصمة المصدر',
    canvasStatusTitle:'حالة تمثيل اللوحة',canvasStatusBody:'حالة عرض اللوحة فقط. هذه الإجراءات لا تنشئ كائنات كانونية ولا تحذفها ولا تغيّر علاقات كانونية ولا تحفظ خريطة.',
    actionHome:'المكان المرجعي للإجراء: شريط أدوات اللوحة',truthLabel:'حقيقة المزوّد'
  }
});
const visDir=()=>String(document?.documentElement?.getAttribute?.('dir')||'').toLowerCase()==='rtl'?'rtl':'ltr';const visLang=()=>String(document?.documentElement?.getAttribute?.('lang')||'').toLowerCase().startsWith('ar')?'ar':'en';
const T=key=>{const table=VIS_TEXT[visLang()]||VIS_TEXT.en;const value=key.split('.').reduce((node,part)=>node&&node[part],table);return value===undefined||value===null?VIS_TEXT.en[key.split('.')[0]]??key:value};
const bdi=(value,dir='ltr')=>`<bdi dir="${dir}">${esc(value)}</bdi>`;
const visDomainKey=row=>groupKey(row);
const visRelationCounts=adapter=>{const counts=new Map();for(const edge of adapter.model.edges||[]){const source=String(edge?.source??''),target=String(edge?.target??'');if(counts.has(source))counts.get(source).out+=1;else counts.set(source,{in:0,out:1});if(counts.has(target))counts.get(target).in+=1;else counts.set(target,{in:1,out:0});}return counts;};
const visRelationTotal=adapter=>(adapter.model.edges||[]).length;

export function renderVisualizeHierarchyTree(nodes=[],selection=new Set()){
  const renderNode=node=>{const id=String(node?.representationId||node?.id||''),children=Array.isArray(node?.children)?node.children:[],label=node?.label||node?.title||id;return `<li data-visualize-hierarchy-node="${esc(id)}"><button type="button" class="visualize-tree-row" data-visualize-select="${esc(id)}" aria-pressed="${selection.has(id)}"><span>${esc(label)}</span><small>${esc(node?.kind||node?.canonicalRef?.objectId||id)}</small></button>${children.length?`<ul>${children.map(renderNode).join('')}</ul>`:''}</li>`;};
  return `<ul class="visualize-tree-hierarchy">${(nodes||[]).map(renderNode).join('')}</ul>`;
}

const VISUALIZE_OUTLINE_ICONS=Object.freeze({
  'i-chev':'<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><path d="M2 1l4 3-4 3z" fill="currentColor"/></svg>',
  'i-folder':'<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 3h3l1 1.4h5V10H1z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  'i-ku':'<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5h5l2 2v7h-7z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M4 6h4M4 8h4" stroke="currentColor" stroke-width="1.1"/></svg>',
  'i-rep':'<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>'
});
const visualizeOutlineIcon=key=>VISUALIZE_OUTLINE_ICONS[key]||VISUALIZE_OUTLINE_ICONS['i-rep'];
const visualizeOutlineKind=row=>{const id=String(row?.canonicalRef?.objectId||row?.representationId||row?.id||'');return /^KU[-_]/i.test(id)?'ku':String(row?.kind||row?.type||'representation')};
const visualizeOutlineNode=(node,selection)=>{
  const id=String(node?.representationId||node?.id||''),children=Array.isArray(node?.children)?node.children:[],label=String(node?.label||node?.title||id),kind=visualizeOutlineKind(node),objectId=String(node?.canonicalRef?.objectId||node?.kind||kind);
  return {id,kind,label,iconKey:kind==='ku'?'i-ku':'i-rep',secondary:[{text:objectId,direction:'ltr',element:'bdi'}],statusText:'',countText:children.length?String(children.length):null,selected:selection.has(id),current:selection.has(id),onActivePath:false,expanded:children.length>0,forceExpanded:children.length>0,focused:false,variantClass:'visualize-outline-row',activationDataset:{visualizeSelect:id,representationId:id},children:children.map(child=>visualizeOutlineNode(child,selection))};
};
export function createVisualizeHierarchyOutlineDescriptor(nodes=[],selection=new Set()){
  return createStructuredOutlinePresentationDescriptor({mode:'hierarchy',ariaLabel:'Visualize representation hierarchy',query:'',nodes:(nodes||[]).map(node=>visualizeOutlineNode(node,selection)),summary:{kind:'count',text:`${(nodes||[]).length} admitted hierarchy root(s)`}});
}
export function createVisualizeSourceFamilyOutlineDescriptor(groups=new Map(),selection=new Set()){
  const roots=[...groups].map(([key,items])=>({id:`source-family-${key}`,kind:'source-family',label:`${key} source-family group`,iconKey:'i-folder',secondary:[],statusText:'',countText:String(items.length),selected:false,current:false,onActivePath:false,expanded:true,forceExpanded:true,focused:false,variantClass:'visualize-source-family',activationDataset:{sourceFamily:key},children:items.map(row=>visualizeOutlineNode(row,selection))}));
  const count=[...groups.values()].reduce((total,items)=>total+items.length,0);
  return createStructuredOutlinePresentationDescriptor({mode:'hierarchy',ariaLabel:'Visualize source-family auxiliary navigation (not hierarchy)',query:'',nodes:roots,summary:{kind:'count',text:`${count} representation(s) in ${groups.size} source-family group(s)`}});
}
function mountVisualizeOutline(host,{descriptor}={}){
  if(!host)return null;
  const receipt=renderStructuredOutline(host,descriptor,{document:host.ownerDocument,iconRenderer:visualizeOutlineIcon});
  host.onkeydown=event=>{
    const item=event.target?.closest?.('.treeitem');if(!item)return;
    const items=[...host.querySelectorAll('.treeitem')],branch=item.closest('.treebranch'),children=branch?.querySelector(':scope > .treechildren'),parentBranch=branch?.parentElement?.closest?.('.treebranch'),parentId=parentBranch?.querySelector(':scope > .treeitem')?.dataset?.treeId||null;
    const intent=resolveStructuredOutlineKeyboardIntent({key:event.key,item,items,hasChildren:!!children,expanded:item.getAttribute('aria-expanded')==='true',parentId});
    if(!intent.handled)return;event.preventDefault();
    if(intent.action==='focus')intent.target?.focus();
    else if(intent.action==='focus-id')host.querySelector(`[data-tree-id="${CSS.escape(intent.targetId)}"]`)?.focus();
    else if(intent.action==='activate')item.click();
  };
  return receipt;
}

/* Surface command labels are registered once per app lifetime, so each label is a single static
   bilingual string (EN / AR) — the exact convention shared commands already use
   ('New linked note / ملاحظة مرتبطة', 'Focus / التركيز'). Neither language is privileged. */
const VIS_CMD=Object.freeze({
  tree:['Tree','شجرة'],path:['Path','مسار'],graph:['Graph','شبكة'],canvas:['Canvas','لوحة'],
  select:['Select representation','تحديد التمثيل'],
  link:['Link canonical objects','ربط كائنات كانونية'],
  move:['Move representations','تحريك التمثيلات'],
  edit:['Edit canonical object','تحرير كائن كانوني'],
  viewport:['Fit active spatial view','ملاءمة العرض المكاني النشط'],
  duplicate:['Duplicate representation','تكرار التمثيل'],
  remove:['Remove from Canvas','إزالة من اللوحة'],
  canvasLink:['Create Canvas-only link','إنشاء رابط للّوحة فقط'],
  undo:['Undo Canvas presentation','تراجع عن عرض اللوحة'],
  redo:['Redo Canvas presentation','إعادة عرض اللوحة']
});
const visCmdLabel=key=>`${VIS_CMD[key][0]} / ${VIS_CMD[key][1]}`;

export function bindVisualizeSurface({commands,adapter,workspace=null,initialView='TREE',contextProvider=null,onViewChange=null,onRepresentationChange=null}={}){
  if(!commands||!adapter)throw Error('VISUALIZE_SURFACE_BINDING_REQUIRED');
  let activeView=normalizeMode(initialView)||'TREE';
  const baseContext=()=>{try{const value=typeof contextProvider==='function'?contextProvider():{};return value&&typeof value==='object'?value:{}}catch{return {}}};
  const payloadWithView=(payload={})=>{const explicit=String(payload?.mode||'').trim();return {...baseContext(),...(payload||{}),mode:explicit?explicit.toUpperCase():activeView};};
  const setView=(mode,{route='view-selector'}={})=>{const next=normalizeMode(mode);if(!next)return {ok:false,status:'VISUALIZE_VIEW_MODE_REQUIRED',canonicalMutation:false};const activated=adapter.activateView(next);if(activated.ok!==true)return activated;activeView=next;workspace?.refreshToolbar?.();onViewChange?.({...activated,route});return {...activated,route};};
  const notify=(id,result,payload)=>{onRepresentationChange?.({id,result,payload:payloadWithView(payload)});return result};
  const viewIds=VISUALIZE_VIEW_MODES.map(mode=>register(commands,VIEW_COMMANDS[mode],visCmdLabel(mode.toLowerCase()),payload=>setView(mode,{route:payload?.route||'view-command'})));
  const ids=[
    register(commands,'visualize.select',visCmdLabel('select'),payload=>{const p=payloadWithView(payload);return notify('visualize.select',adapter.select(p),p)},payload=>adapter.selectionAvailability(payloadWithView(payload))),
    register(commands,'visualize.link',visCmdLabel('link'),payload=>adapter.link(payload),payload=>adapter.linkAvailability(payload)),
    register(commands,'visualize.move',visCmdLabel('move'),payload=>{const p=payloadWithView(payload);return notify('visualize.move',adapter.view(p.mode).move(p),p)},payload=>adapter.moveAvailability(payloadWithView(payload))),
    register(commands,'visualize.edit',visCmdLabel('edit'),payload=>adapter.edit(payload),payload=>adapter.editAvailability(payload)),
    register(commands,'visualize.viewport',visCmdLabel('viewport'),payload=>{const p=payloadWithView(payload);return notify('visualize.viewport',adapter.view(p.mode).viewport(p),p)},payload=>adapter.viewportAvailability(payloadWithView(payload))),
    register(commands,'visualize.duplicateRepresentation',visCmdLabel('duplicate'),payload=>{const p=payloadWithView(payload);return notify('visualize.duplicateRepresentation',adapter.duplicateRepresentation(p),p)},payload=>adapter.duplicateRepresentationAvailability(payloadWithView(payload))),
    register(commands,'visualize.removeRepresentation',visCmdLabel('remove'),payload=>{const p=payloadWithView(payload);return notify('visualize.removeRepresentation',adapter.removeRepresentation(p),p)},payload=>adapter.removeRepresentationAvailability(payloadWithView(payload))),
    register(commands,'visualize.canvasLink',visCmdLabel('canvasLink'),payload=>{const p=payloadWithView(payload);return notify('visualize.canvasLink',adapter.createCanvasOnlyLink(p),p)},payload=>adapter.canvasLinkAvailability(payloadWithView(payload))),
    register(commands,'visualize.undoPresentation',visCmdLabel('undo'),payload=>notify('visualize.undoPresentation',adapter.undoPresentation(),payloadWithView(payload)),()=>adapter.presentationHistoryAvailability({action:'undo'})),
    register(commands,'visualize.redoPresentation',visCmdLabel('redo'),payload=>notify('visualize.redoPresentation',adapter.redoPresentation(),payloadWithView(payload)),()=>adapter.presentationHistoryAvailability({action:'redo'}))
  ];
  setView(activeView,{route:'surface-bind'});
  const canonical=adapter.canonicalProjection(),providerTruth=adapter.providerTruth(),sharedCommandOwners=Object.fromEntries(SHARED_SPATIAL_COMMANDS.filter(id=>hasCommand(commands,id)).map(id=>[id,commands.commands.get(id).owner])),missingSharedCommands=SHARED_SPATIAL_COMMANDS.filter(id=>!hasCommand(commands,id));
  workspace?.status?.(canonical.ok?(canonical.canonical===true?'Visualize · canonical provider bound · one shared Spatial engine':`Visualize · ${providerTruth.authority} · canonical:false · READ_ONLY · one shared Spatial engine`):'Visualize · canonical data unavailable · local graph is SYNTHETIC representation only');
  return {surface:'visualize',owner:adapter.owner,registeredCommands:ids,viewCommands:viewIds,viewCommandIds:{...VIEW_COMMANDS},activeView:()=>activeView,setView,context:(payload={})=>payloadWithView(payload),requiredSharedCommands:[...SHARED_SPATIAL_COMMANDS],sharedCommandOwners,missingSharedCommands,spatialOwner:adapter.model.interactionKernel.ownerId,viewAdapters:adapter.viewDescriptors(),providerId:providerTruth.providerId,providerAuthority:providerTruth.authority,providerEditability:providerTruth.editability,relationMutation:providerTruth.relationMutation,objectEdit:providerTruth.objectEdit,canonical:providerTruth.canonical,canonicalDataProvider:canonical.ok?(canonical.canonical===true?'BOUND_CANONICAL':'BOUND_LOCAL_ACCEPTANCE_PROJECTION'):'UNAVAILABLE',canonicalTruth:canonical.ok?(canonical.canonical===true?'PROVIDER_BOUND_CANONICAL':'LOCAL_ACCEPTANCE_PROJECTION_ONLY'):'UNAVAILABLE',localGraphTruth:canonical.ok?(canonical.canonical===true?'REPRESENTATION_ONLY':'LOCAL_ACCEPTANCE_REPRESENTATION_ONLY'):'SYNTHETIC_REPRESENTATION_ONLY',fixtureIsCanonical:false,universalVirtualizationOwner:false};
}

function ensureVisualizeStyle(){
  if(document.querySelector('#visualizeFourViewStyle'))return;
  const style=document.createElement('style');style.id='visualizeFourViewStyle';style.textContent=`
  /* ── VISUALIZE TREE-VIEW · surface presentation system ───────────────────────────────────
     Surface-owned: composition, hierarchy, density, grouping, emphasis, inline presentation.
     Direction is NEVER baked: every container inherits the active preference; technical tokens
     are isolated with <bdi dir="ltr"> or scoped .vis-mono { direction:ltr; unicode-bidi:isolate }. */
  .m0-visualize-four-view{display:grid;grid-template-rows:auto auto minmax(0,1fr);gap:10px;overflow:hidden;padding:12px 14px 14px!important;background:var(--bg0)}
  .m0-visualize-four-view .domain-heading{direction:inherit;align-items:center;gap:14px;flex-wrap:wrap;padding:11px 14px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(180deg,color-mix(in srgb,var(--elev) 92%,transparent),color-mix(in srgb,var(--bg1) 92%,transparent));min-width:0}
  .vis-headid{display:grid;gap:2px;min-width:0;margin-inline-end:auto}
  .vis-eyebrow{font:600 9.5px/1.2 var(--mono);letter-spacing:.14em;color:var(--accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .vis-headid strong{font-size:15px;font-weight:700;line-height:1.25;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .vis-headid small{font-size:11.5px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .vis-switcher{display:flex;gap:2px;padding:3px;border:1px solid var(--line2);border-radius:10px;background:color-mix(in srgb,var(--bg0) 70%,transparent);min-width:0;flex-wrap:wrap}
  .vis-switcher .btn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--text2);font-size:12.5px;font-weight:600;white-space:nowrap;transition:background .12s,color .12s,border-color .12s}
  .vis-switcher .btn:hover{background:color-mix(in srgb,var(--accent) 12%,transparent);color:var(--text)}
  .vis-switcher .btn[aria-selected="true"]{border-color:color-mix(in srgb,var(--accent) 55%,transparent);background:var(--as);color:var(--accent2);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 18%,transparent)}
  .vis-switcher .btn:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
  .vis-switcher .btn svg{flex:none;opacity:.9}
  .vis-headtruth{display:grid;gap:4px;justify-items:end;min-width:0}
  .vis-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border:1px solid var(--line2);border-radius:999px;background:color-mix(in srgb,var(--bg1) 80%,transparent);font-size:10.5px;color:var(--text2);white-space:nowrap;max-width:100%;overflow:hidden}
  .vis-chip b{font-weight:700;color:var(--text)}
  .vis-chip[data-tone="accent"]{border-color:color-mix(in srgb,var(--accent) 45%,transparent);background:var(--as);color:var(--accent2)}
  .vis-chip[data-tone="warn"]{border-color:color-mix(in srgb,var(--warn) 45%,transparent);background:var(--warns);color:var(--warn)}
  .vis-chip .vis-mono,.vis-mono{direction:ltr;unicode-bidi:isolate;font-family:var(--mono);font-size:10px;letter-spacing:.02em}
  .vis-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}

  /* view context strip */
  #visualizeViewMeta{display:flex;align-items:center;gap:8px 14px;flex-wrap:wrap;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--panel) 78%,transparent);font-size:12px;color:var(--text2);min-width:0}
  #visualizeViewMeta .vis-stripview{display:inline-flex;align-items:center;gap:7px;font-weight:700;color:var(--text);font-size:12.5px;white-space:nowrap}
  #visualizeViewMeta .vis-stripview::before{content:"";width:3px;height:14px;border-radius:2px;background:var(--accent);flex:none}
  #visualizeViewMeta .vis-stripdesc{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 220px}
  #visualizeViewMeta .vis-striptruth{margin-inline-start:auto;display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
  #visualizeViewMeta .vis-striptruth .vis-mono{color:var(--text3)}
  #visualizeViewMeta .vis-striptruth .vis-mono[data-flag="false"]{color:var(--warn)}

  /* center body */
  .m0-visualize-four-view #spatialHost,.m0-visualize-four-view #domainView{min-height:0;height:100%;overflow:auto;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--bg1) 60%,transparent)}
  .m0-visualize-four-view #domainView.domain-readonly{direction:inherit;padding:0}
  /* Both representation hosts share the single 1fr content track (rows: heading / view strip /
     content). Exactly one host is visible in normal use; if a host is revealed while the other is
     still visible, both stay in the content row instead of the revealed host collapsing into a
     zero-height implicit row (revealed-host must never have zero bounds). */
  .m0-visualize-four-view #spatialHost,.m0-visualize-four-view #domainView{grid-row:3;grid-column:1}
  .m0-visualize-four-view #spatialHost{position:relative;overflow:hidden;background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--accent) 7%,transparent),transparent 55%),color-mix(in srgb,var(--bg0) 92%,transparent)}
  .m0-visualize-four-view #spatialHost[data-visualize-view="CANVAS"]{background:color-mix(in srgb,var(--bg1) 88%,transparent)}

  /* shared spatial node cards — inline presentation inside a shared component (surface-owned) */
  .m0-visualize-four-view .spatial-canvas .spatial-node-card .node-surface{fill:var(--bg2)}
  .m0-visualize-four-view .spatial-canvas .spatial-node-card:hover .node-surface{stroke:color-mix(in srgb,var(--accent) 55%,var(--line2))}
  .m0-visualize-four-view .spatial-canvas .node-title{font-family:var(--ui)}
  .m0-visualize-four-view .spatial-canvas .relation-label{font-family:var(--ui);paint-order:stroke;stroke:color-mix(in srgb,var(--bg0) 85%,transparent);stroke-width:3px;stroke-linejoin:round}
  .vis-spatial-overlay{position:absolute;inset-block-start:10px;inset-inline-start:10px;display:grid;gap:8px;max-width:246px;pointer-events:none;z-index:2}
  .vis-legend{display:grid;gap:6px;padding:9px 11px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--elev) 92%,transparent);box-shadow:0 6px 18px rgba(0,0,0,.28)}
  .vis-legend h4{margin:0 0 1px;font-size:10.5px;font-weight:700;color:var(--text3);letter-spacing:.06em}
  html[lang^="en"] .vis-legend h4{text-transform:uppercase}
  .vis-legend ul{list-style:none;margin:0;padding:0;display:grid;gap:5px}
  .vis-legend li{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--text2)}
  .vis-swatch{display:inline-block;width:22px;height:0;border-top-width:2px;border-top-style:solid;flex:none;border-radius:2px}
  .vis-swatch.k-canonical{border-top-color:color-mix(in srgb,var(--accent) 45%,#10b981);border-top-style:solid}
  .vis-swatch.k-related{border-top-color:color-mix(in srgb,var(--accent) 60%,#3b82f6);border-top-style:dashed}
  .vis-swatch.k-currentPath{border-top-color:color-mix(in srgb,var(--accent) 55%,#a78bfa);border-top-style:solid}
  .vis-swatch.k-canvasOnly{border-top-color:color-mix(in srgb,var(--accent) 70%,#f59e0b);border-top-style:dashed}
  .vis-spacer{}

  /* ── CENTER · TREE (reference-shaped hierarchy table) ───────────────────────────────── */
  .visualize-tree,.visualize-path{display:grid;gap:10px;align-content:start;padding:12px;min-height:100%;box-sizing:border-box}
  .vis-panel{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 90%,transparent);overflow:hidden}
  .vis-panelhead{display:flex;align-items:center;gap:9px;padding:10px 13px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--elev) 70%,transparent)}
  .vis-panelhead .vis-phicon{display:grid;place-items:center;width:22px;height:22px;border-radius:6px;background:var(--as);color:var(--accent2);flex:none}
  .vis-panelhead h3{margin:0;font-size:13px;font-weight:700;color:var(--text);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vis-panelhead .vis-phmeta{margin-inline-start:auto;display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
  .vis-truthstrip{display:flex;gap:8px 12px;flex-wrap:wrap;align-items:baseline;padding:8px 13px;border-bottom:1px solid var(--line);border-inline-start:3px solid var(--warn);background:color-mix(in srgb,var(--warn) 8%,transparent);font-size:11.5px;color:var(--text2)}
  .vis-truthstrip b{color:var(--text);font-size:12px}
  .vis-truthstrip .vis-mono{color:var(--text3)}
  .vis-colhead,.visualize-tree-row{display:grid;grid-template-columns:16px minmax(0,1fr) 96px 76px 104px;gap:10px;align-items:center}
  .vis-colhead{padding:7px 13px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--bg0) 65%,transparent);font-size:10.5px;font-weight:700;color:var(--text3);letter-spacing:.04em}
  html[lang^="en"] .vis-colhead{text-transform:uppercase}
  .vis-colhead span:not(:first-child){text-align:start}
  .vis-exp{display:grid;place-items:center;width:16px;height:16px;border-radius:4px;color:var(--text3);flex:none}
  [data-vis-toggle]{cursor:pointer}
  [data-vis-toggle]:hover{color:var(--accent2);background:color-mix(in srgb,var(--accent) 14%,transparent)}
  [data-vis-toggle][aria-expanded="false"] svg,[data-vis-toggle][data-collapsed="true"] svg{transform:rotate(-90deg)}
  .vis-exp svg{transition:transform .14s}
  .visualize-tree-row>span.vis-exp:empty{visibility:hidden}
  .vis-rows{display:grid;padding:5px}
  .vis-group{border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent)}
  .vis-group:last-child{border-bottom:0}
  .vis-grouphead{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:start;cursor:pointer}
  .vis-grouphead:hover{background:rgba(255,255,255,.04)}
  .vis-grouphead .vis-gicon{color:var(--accent2);display:grid;place-items:center;flex:none}
  .vis-grouphead strong{font-size:12.5px;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vis-grouphead .vis-badge{margin-inline-start:auto;display:inline-flex;gap:6px;align-items:center;font:600 10.5px var(--mono);color:var(--text3);direction:ltr;unicode-bidi:isolate}
  .visualize-tree-row{display:grid;width:100%;padding:7px 10px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;cursor:pointer;text-align:start;font-size:12.5px}
  .visualize-tree-row:hover{background:rgba(255,255,255,.045);border-color:var(--line)}
  .visualize-tree-row[aria-pressed="true"]{border-color:color-mix(in srgb,var(--accent) 55%,transparent);background:var(--as)}
  .visualize-tree-row:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
  .visualize-tree-row .vis-label{display:flex;gap:8px;align-items:center;min-width:0}
  .visualize-tree-row .vis-label .vis-li{color:var(--text3);display:grid;place-items:center;flex:none}
  .visualize-tree-row .vis-label .vis-lt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .visualize-tree-row .vis-label small{color:var(--text3);font-size:10.5px}
  .visualize-tree-row .vis-cell{min-width:0;font-size:11.5px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .visualize-tree-row .vis-cell.vis-mono{font-size:10.5px;color:var(--text3)}
  .visualize-tree-row .vis-rel{display:inline-flex;gap:5px;align-items:center;font:600 11px var(--mono);direction:ltr;unicode-bidi:isolate}
  .visualize-tree-row .vis-rel[data-zero="true"]{color:var(--text3);opacity:.75}
  .visualize-tree-row .vis-rel:not([data-zero="true"]){color:var(--accent2)}
  .vis-children{display:grid;gap:0;padding-inline-start:27px;border-inline-start:1px solid color-mix(in srgb,var(--line2) 55%,transparent);margin-inline-start:8px;margin-block:1px}
  .vis-children .visualize-tree-row{position:relative}
  .vis-children .visualize-tree-row::before{content:"";position:absolute;inset-inline-start:-27px;top:50%;width:27px;height:1px;background:color-mix(in srgb,var(--line2) 55%,transparent)}
  .visualize-tree-row[data-vis-kind="domain"]{background:color-mix(in srgb,var(--elev) 68%,transparent);border-color:color-mix(in srgb,var(--line) 85%,transparent);border-radius:8px}
  .visualize-tree-row[data-vis-kind="domain"] .vis-lt{font-weight:700;color:var(--text)}
  .visualize-tree-row[data-vis-kind="domain"] .vis-lt small{color:var(--accent2)}
  .visualize-tree-row[data-vis-kind="domain"] .vis-li{color:var(--accent2)}
  .vis-statechip{display:inline-flex;align-items:center;gap:5px;padding:2px 7px;border-radius:999px;font-size:10.5px;font-weight:600;border:1px solid}
  .vis-statechip[data-tone="ok"]{color:var(--ok);border-color:color-mix(in srgb,var(--ok) 45%,transparent);background:var(--oks)}
  .vis-statechip[data-tone="muted"]{color:var(--text3);border-color:var(--line2);background:color-mix(in srgb,var(--bg1) 70%,transparent)}

  /* ── CENTER · PATH ─────────────────────────────────────────────────────────────────── */
  .vis-pathlegend{display:flex;gap:8px 16px;flex-wrap:wrap;align-items:center;padding:9px 13px;border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--elev) 72%,transparent);font-size:11.5px;color:var(--text2)}
  .vis-pathlegend span{display:inline-flex;gap:7px;align-items:center}
  .visualize-path-lanes{display:grid;gap:12px}
  .visualize-path-lane{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 88%,transparent);overflow:hidden}
  .visualize-path-lane>header{display:flex;align-items:center;gap:9px;padding:9px 13px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--elev) 65%,transparent)}
  .visualize-path-lane>header .vis-lanetoken{display:inline-grid;place-items:center;min-width:34px;height:20px;padding:0 7px;border-radius:6px;background:var(--as);color:var(--accent2);font:700 10.5px var(--mono);direction:ltr;unicode-bidi:isolate}
  .visualize-path-lane>header strong{font-size:12.5px;font-weight:700}
  .visualize-path-lane>header .vis-lanemeta{margin-inline-start:auto;font-size:11px;color:var(--text3)}
  .visualize-path-track{display:flex;flex-wrap:wrap;gap:10px 0;align-items:stretch;padding:12px;overflow-x:auto}
  .visualize-path-node{display:grid;gap:4px;align-content:start;width:176px;flex:none;padding:10px 11px;text-align:start;border:1px solid var(--line2);border-radius:10px;background:var(--bg2);color:inherit;cursor:pointer;position:relative}
  .visualize-path-node:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line2))}
  .visualize-path-node:focus-visible{outline:2px solid var(--focus);outline-offset:1px}
  .visualize-path-node[aria-pressed="true"]{border-color:var(--accent);background:var(--as);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 35%,transparent)}
  .visualize-path-node .vis-step{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:color-mix(in srgb,var(--accent) 22%,transparent);color:var(--accent2);font:700 10px var(--mono)}
  .visualize-path-node strong{font-size:12.5px;font-weight:650;line-height:1.35;color:var(--text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .visualize-path-node small{font-size:10.5px;color:var(--text3);font-family:var(--mono);direction:ltr;unicode-bidi:isolate;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .visualize-path-node .vis-nodefoot{display:flex;gap:6px;align-items:center;margin-top:2px}
  .vis-connector{display:grid;place-items:center;flex:none;width:34px;color:color-mix(in srgb,var(--accent) 65%,var(--text3))}
  .vis-connector svg{transition:transform .12s}
  html[dir="rtl"] .vis-connector svg{transform:scaleX(-1)}
  .vis-laneempty{padding:14px;color:var(--text3);font-size:12px}
  .vis-pathnote{margin:0;padding:9px 13px;border-top:1px solid var(--line);font-size:11.5px;color:var(--text2);line-height:1.55}
  .vis-pathlegend b{color:var(--text);font-size:11px}
  .visualize-path-node .vis-rel{font:600 10.5px var(--mono);color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .visualize-path-node .vis-rel[data-zero="false"]{color:var(--accent2)}

  /* ── LEFT · structure navigator ───────────────────────────────────────────────────── */
  .visualize-left{display:grid;gap:12px;align-content:start}
  .vis-card{border:1px solid var(--line);border-radius:10px;background:color-mix(in srgb,var(--panel) 88%,transparent);overflow:hidden}
  .vis-card>header{display:flex;align-items:center;gap:8px;padding:8px 11px;border-bottom:1px solid var(--line)}
  .vis-card>header h3{margin:0;font-size:11.5px;font-weight:700;color:var(--text2);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  html[lang^="en"] .vis-card>header h3{text-transform:uppercase;letter-spacing:.05em;font-size:10.5px}
  .vis-card>header .vis-badge{margin-inline-start:auto;font:600 10.5px var(--mono);color:var(--text3);direction:ltr;unicode-bidi:isolate}
  .vis-scope{display:grid;gap:8px;padding:11px}
  .vis-scope .vis-scopetop{display:flex;gap:8px;align-items:flex-start}
  .vis-scope .vis-scopeicon{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--as);color:var(--accent2);flex:none}
  .vis-scope .vis-scopename{display:grid;gap:2px;min-width:0}
  .vis-scope .vis-scopename strong{font-size:13px;font-weight:700;line-height:1.3}
  .vis-scope .vis-scopename small{font-size:11px;color:var(--text3);overflow-wrap:anywhere}
  .vis-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
  .vis-stat{display:grid;gap:1px;padding:7px 6px;border:1px solid var(--line);border-radius:8px;background:color-mix(in srgb,var(--bg1) 70%,transparent);text-align:center}
  .vis-stat b{font-size:15px;font-weight:700;color:var(--accent2);line-height:1.1}
  .vis-stat span{font-size:10px;color:var(--text3)}
  .vis-domains{display:grid;gap:2px;padding:6px}
  .vis-domainrow{display:flex;gap:8px;align-items:center;padding:7px 8px;border-radius:8px;font-size:12px;color:var(--text2)}
  .vis-domainrow .vis-dtoken{display:inline-grid;place-items:center;min-width:30px;height:18px;padding:0 6px;border-radius:5px;background:color-mix(in srgb,var(--violet) 22%,transparent);color:color-mix(in srgb,var(--violet) 70%,var(--text));font:700 10px var(--mono);direction:ltr;unicode-bidi:isolate;flex:none}
  .vis-domainrow .vis-dcount{margin-inline-start:auto;font:600 10.5px var(--mono);color:var(--text3);direction:ltr;unicode-bidi:isolate}
  .vis-domainrow .vis-dlabel{font-size:11px;color:var(--text3);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vis-objectlist{display:grid;gap:2px;padding:6px}
  .vis-objectrow{display:grid;gap:2px;width:100%;padding:7px 9px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;text-align:start;cursor:pointer}
  .vis-objectrow:hover{background:rgba(255,255,255,.045);border-color:var(--line)}
  .vis-objectrow[aria-pressed="true"]{border-color:color-mix(in srgb,var(--accent) 55%,transparent);background:var(--as)}
  .vis-objectrow:focus-visible{outline:2px solid var(--focus);outline-offset:-2px}
  .vis-objectrow .vis-orow{display:flex;gap:7px;align-items:flex-start;min-width:0}
  .vis-objectrow .vis-orow span{font-size:12.5px;font-weight:600;min-width:0;display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4}
  .vis-objectrow .vis-orow .vis-rel{margin-inline-start:auto;margin-block-start:3px;font:600 10.5px var(--mono);color:var(--text3);direction:ltr;unicode-bidi:isolate;flex:none}
  .vis-objectrow .vis-orow .vis-rel[data-zero="false"]{color:var(--accent2)}
  .vis-objectrow small{font-size:10.5px;color:var(--text3);font-family:var(--mono);direction:ltr;unicode-bidi:isolate;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vis-emptystate{display:grid;gap:5px;padding:12px 11px;color:var(--text2);font-size:12px;text-align:center}
  .vis-emptystate strong{color:var(--text);font-size:12.5px}
  .vis-emptystate span{color:var(--text3);font-size:11.5px}

  /* ── RIGHT · selection context ────────────────────────────────────────────────────── */
  .visualize-selection{display:grid;gap:0;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 90%,transparent);overflow:hidden;margin-bottom:12px}
  .visualize-selection>header{display:flex;gap:9px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--elev) 70%,transparent)}
  .visualize-selection>header .vis-selicon{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:var(--as);color:var(--accent2);flex:none}
  .visualize-selection>header h2{margin:0;font-size:13px;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .visualize-selection>header .vis-badge{margin-inline-start:auto;font:600 10px var(--mono);color:var(--text3);direction:ltr;unicode-bidi:isolate}
  .vis-selbody{display:grid;gap:11px;padding:11px 12px}
  .vis-seltitle{display:grid;gap:3px}
  .vis-seltitle strong{font-size:14px;font-weight:700;line-height:1.35;overflow-wrap:anywhere}
  .vis-seltitle .vis-selid{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
  .vis-sectitle{display:flex;gap:7px;align-items:center;margin:0;font-size:10.5px;font-weight:700;color:var(--text3);letter-spacing:.05em}
  html[lang^="en"] .vis-sectitle{text-transform:uppercase}
  .vis-sectitle::after{content:"";flex:1;height:1px;background:var(--line)}
  .vis-dl{display:grid;gap:7px;margin:0}
  .vis-dl>div{display:grid;grid-template-columns:minmax(84px,.42fr) minmax(0,1fr);gap:8px;align-items:baseline}
  .vis-dl dt{font-size:11px;color:var(--text3)}
  .vis-dl dd{margin:0;font-size:12px;color:var(--text);overflow-wrap:anywhere;min-width:0}
  .vis-rellist{display:grid;gap:5px}
  .vis-relrow{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:center;padding:7px 8px;border:1px solid var(--line);border-radius:8px;background:color-mix(in srgb,var(--bg1) 65%,transparent);font-size:11.5px}
  .vis-relrow .vis-reldir{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:5px;font:700 11px var(--mono);background:color-mix(in srgb,var(--accent) 18%,transparent);color:var(--accent2)}
  .vis-relrow .vis-relbody{display:grid;gap:1px;min-width:0}
  .vis-relrow .vis-relbody span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .vis-relrow .vis-relbody small{font-size:10px;color:var(--text3);font-family:var(--mono);direction:ltr;unicode-bidi:isolate}
  .vis-relrow[data-kind="canvas-presentation"]{border-style:dashed;border-color:color-mix(in srgb,var(--warn) 40%,var(--line))}
  .visualize-representation-actions{display:grid;gap:7px;padding:11px 12px;border-top:1px solid var(--line);background:color-mix(in srgb,var(--bg0) 55%,transparent)}
  .visualize-representation-actions h3{margin:0;font-size:12px}
  .visualize-representation-actions p{margin:0;color:var(--text2);font-size:11.5px;line-height:1.5}
  .visualize-representation-actions .vis-actionhome{font-weight:700;color:var(--accent2)}
  .visualize-selection-truth{font:10.5px var(--mono);direction:ltr;unicode-bidi:isolate;overflow-wrap:anywhere;color:var(--text3)}
  .visualize-context>*:first-child{margin-top:0}

  /* responsive */
  @media(max-width:1180px){.vis-colhead,.visualize-tree-row{grid-template-columns:16px minmax(0,1fr) 96px 76px}.vis-colhead span:nth-child(4),.visualize-tree-row>span:nth-child(5){display:none}}
  @media(max-width:1024px){#visualizeViewMeta .vis-stripdesc{flex-basis:100%;order:3}}
  @media(max-width:760px){.m0-visualize-four-view{padding:8px!important;gap:8px}.m0-visualize-four-view .domain-heading{padding:9px 11px;gap:10px}.vis-headtruth{display:none}.vis-switcher{width:100%}.vis-switcher .btn{flex:1 1 auto;justify-content:center;padding:0 8px}.vis-colhead,.visualize-tree-row{grid-template-columns:16px minmax(0,1fr) 76px}.vis-colhead span:nth-child(2),.visualize-tree-row>span:nth-child(3){display:none}.vis-stats{grid-template-columns:repeat(3,minmax(0,1fr))}.visualize-path-node{width:168px}.vis-dl>div{grid-template-columns:1fr;gap:1px}}
  @media(prefers-reduced-motion:reduce){.m0-visualize-four-view *{transition:none!important}}
  `;document.head.append(style);
}

export function mountVisualizeFourViewComposition({stage,workspace,registry,adapter,binding,spatialView,providerTruth=null,refreshContext=null}={}){
  if(!stage||!workspace||!registry||!adapter||!binding||!spatialView)throw Error('VISUALIZE_FOUR_VIEW_COMPOSITION_REQUIRED');
  if(spatialView.model!==adapter.model)throw Error('VISUALIZE_SHARED_SPATIAL_ENGINE_REQUIRED');
  ensureVisualizeStyle();stage.classList.add('m0-visualize-four-view');stage.dataset.visualizeSharedSpatialOwner=adapter.model.interactionKernel.ownerId;
  const heading=stage.querySelector('.domain-heading'),spatialHost=stage.querySelector('#spatialHost'),body=stage.querySelector('#domainView');if(!heading||!spatialHost||!body)throw Error('VISUALIZE_CARRIER_STAGE_REQUIRED');
  const VIEW_ICON=Object.freeze({
    TREE:'<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2.5 2.5v6a1 1 0 0 0 1 1h2M2.5 5.5h4M7.5 4.5h4M7.5 4.5v4h3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="9.5" y="2.5" width="3.5" height="3.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="8" width="3.5" height="3.5" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="1" width="3" height="3" rx="1" fill="currentColor"/></svg>',
    PATH:'<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M1.5 7h11M9.5 4.5 12.5 7l-3 2.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="3" cy="7" r="1.8" fill="currentColor"/></svg>',
    GRAPH:'<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 4.2 10 3m0 0-1.6 4.4M10 3 6.4 9.6" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="3.4" cy="3.9" r="2" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="10.6" cy="2.8" r="1.8" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="6.6" cy="10.4" r="2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
    CANVAS:'<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 2"/><rect x="4" y="4" width="3.4" height="3.4" rx="1" fill="currentColor"/></svg>'
  });
  heading.innerHTML=`<div class="vis-headid"><span class="vis-eyebrow">${esc(T('eyebrow'))}</span><strong>${esc(T('title'))}</strong><small>${esc(T('subtitle'))}</small></div><nav class="vis-switcher" role="tablist" aria-label="${esc(T('switcherLabel'))}">${VISUALIZE_VIEW_MODES.map(mode=>`<button type="button" class="btn" role="tab" aria-selected="false" aria-controls="domainView" data-foundation-command="${binding.viewCommandIds[mode]}" data-visualize-view-tab="${mode}">${VIEW_ICON[mode]}<span>${esc(T('views.'+mode))}</span></button>`).join('')}</nav><div class="vis-headtruth"><span class="vis-chip" data-vis-truth-chip><span class="vis-dot" style="color:var(--warn)"></span><span class="vis-mono" data-vis-truth>…</span></span></div>`;
  let meta=stage.querySelector('#visualizeViewMeta');if(!meta){meta=document.createElement('div');meta.id='visualizeViewMeta';meta.className='visualize-view-meta';heading.insertAdjacentElement('afterend',meta)}
  const truth=providerTruth||adapter.providerTruth(),projectionFor=mode=>adapter.representationProjection(mode).representations,selectionText=()=>{const rows=selectedRecords(adapter);return rows.length?rows.map(row=>row.label||row.representationId).join(' · '):'No representation selected';};
  const commandPayload=()=>binding.context({representationIds:[...adapter.model.selection],primaryRepresentationId:adapter.selectionTruth(binding.activeView()).primaryRepresentationId,width:spatialView.svg?.clientWidth||0,height:spatialView.svg?.clientHeight||0,action:'fit'});
  const renderMeta=()=>{const mode=binding.activeView(),descriptor=adapter.view(mode).descriptor(),hierarchy=adapter.hierarchyProjection(),objects=adapter.representationProjection(mode).representations.length,relations=visRelationTotal(adapter),selected=adapter.model.selection.size;meta.innerHTML=`<span class="vis-stripview">${esc(T('views.'+mode))}</span><span class="vis-stripdesc">${esc(T('viewDesc.'+mode))}</span><span class="vis-chip">${esc(T('metaSelection'))}&nbsp;<b>${selected?selected:esc(T('metaNone'))}</b></span><span class="vis-chip"><b>${objects}</b>&nbsp;${esc(T('metaObjects'))}</span><span class="vis-chip"><b>${relations}</b>&nbsp;${esc(T('metaRelations'))}</span>${mode==='TREE'&&!hierarchy.ok?`<span class="vis-chip" data-tone="warn"><span class="vis-dot"></span>${esc(T('hierarchyUnavailable'))}</span>`:''}<span class="vis-striptruth"><span class="vis-mono" data-flag="false">canonical:false</span><span class="vis-mono">${esc(truth.authority)}</span><span class="vis-mono">${esc(descriptor.engineOwner)}</span></span>`;const chip=heading.querySelector('[data-vis-truth]');if(chip)chip.textContent=`${truth.authority} · canonical:false`;};
  const selectionPanelHTML=()=>{const mode=binding.activeView(),view=adapter.view(mode).descriptor(),selection=adapter.selectionTruth(mode),rows=selectedRecords(adapter),primary=rows.find(row=>row.representationId===selection.primaryRepresentationId)||rows[0]||null,relCounts=visRelationCounts(adapter);const edges=(adapter.model.edges||[]).filter(edge=>primary&&(String(edge.source)===primary.representationId||String(edge.target)===primary.representationId));const relList=edges.length?`<div class="vis-rellist">${edges.map(edge=>{const outgoing=String(edge.source)===primary.representationId,peerId=String(outgoing?edge.target:edge.source),peer=adapter.representationRecord(peerId),label=String(peer?.label||peerId);return `<div class="vis-relrow" data-kind="${esc(edge.kind||edge.type||'')}"><span class="vis-reldir" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 12 12"><circle cx="3" cy="4" r="1.8" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="9" cy="8" r="1.8" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M4.4 5.1 7.6 6.9" stroke="currentColor" stroke-width="1.3"/></svg></span><span class="vis-relbody"><span dir="auto">${esc(T(outgoing?'outgoing':'incoming'))}: ${esc(label)}</span><small>${bdi(edge.type||edge.kind||'relation')}</small></span></div>`}).join('')}</div>`:`<div class="vis-emptystate"><span>${esc(T('noRelations'))}</span></div>`;const rel=primary?visRelOf(relCounts,primary.representationId):0;const body=primary?`<div class="vis-seltitle"><strong dir="auto">${esc(primary.label||primary.representationId)}</strong><span class="vis-selid"><span class="vis-chip" data-tone="accent">${esc(visKindLabel(visKindOf(primary)))}</span><span class="vis-chip"><bdi>${esc(primary.canonicalRef?.objectId||primary.representationId)}</bdi></span><span class="vis-chip"><b>${rel}</b>&nbsp;${esc(T('metaRelations'))}</span></span></div><div><p class="vis-sectitle">${esc(T('rightRelations'))}</p>${relList}</div><div><p class="vis-sectitle">${esc(T('rightObject'))}</p><dl class="vis-dl"><div><dt>${esc(T('fieldDomain'))}</dt><dd>${bdi(visDomainKey(primary))}</dd></div><div><dt>${esc(T('fieldVersion'))}</dt><dd>${bdi(primary.canonicalRef?.sourceVersion||'—')}</dd></div><div><dt>${esc(T('fieldCanvas'))}</dt><dd>${bdi(`x=${primary.x} · y=${primary.y}`)}</dd></div><div><dt>${esc(T('fieldViews'))}</dt><dd>${(primary.views||[]).map(v=>bdi(v)).join(' · ')||'—'}</dd></div><div><dt>${esc(T('fieldIdentifier'))}</dt><dd>${bdi(primary.representationId)}</dd></div><div><dt>${esc(T('fieldDigest'))}</dt><dd>${bdi(String(primary.canonicalRef?.sourceSha256||'—').slice(0,16))}…</dd></div></dl></div>`:`<div class="vis-emptystate"><strong>${esc(T('noSelection'))}</strong><span>${esc(T('selectHint'))}</span></div><div class="vis-stats"><div class="vis-stat"><b>${adapter.representationProjection(mode).representations.length}</b><span>${esc(T('statObjects'))}</span></div><div class="vis-stat"><b>${visRelationTotal(adapter)}</b><span>${esc(T('statRelations'))}</span></div><div class="vis-stat"><b>${selection.selectedIds?.length||0}</b><span>${esc(T('metaSelection'))}</span></div></div>`;return `<section class="visualize-selection" aria-label="${esc(T('rightTitle'))}"><header><span class="vis-selicon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="1.8" fill="currentColor"/><path d="M7 .8v2.4M7 10.8v2.4M.8 7h2.4M10.8 7h2.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg></span><h2>${esc(T('rightTitle'))}</h2><span class="vis-badge">${bdi(mode)}</span></header><div class="vis-selbody">${body}</div></section>`;};
  const renderRightSelection=()=>{const host=document.querySelector('#wave3ContextInspectorHost:not([hidden])')||workspace.regionHosts?.get?.('RIGHT');if(!host)return;host.querySelectorAll(':scope > .visualize-selection').forEach(node=>node.remove());host.insertAdjacentHTML('afterbegin',selectionPanelHTML());};
  const fallbackRight=()=>{workspace.region('RIGHT',{html:`<section class="visualize-context">${selectionPanelHTML()}</section>`,label:T('rightTitle')});};
  const renderRightActions=()=>{const host=document.querySelector('#wave3ContextInspectorHost:not([hidden])')||workspace.regionHosts?.get?.('RIGHT');if(!host)return;host.querySelector('.visualize-representation-actions')?.remove();if(binding.activeView()!=='CANVAS')return;const selection=adapter.selectionTruth('CANVAS'),panel=document.createElement('section');panel.className='visualize-representation-actions';panel.setAttribute('aria-label',T('canvasStatusTitle'));panel.innerHTML=`<h3>${esc(T('canvasStatusTitle'))}</h3><p>${esc(T('canvasStatusBody'))}</p><p class="visualize-action-home-truth vis-actionhome">${esc(T('actionHome'))}</p><div class="visualize-selection-truth">selected=[${bdi(selection.selectedIds.join(', '))}] · primary=${bdi(selection.primaryRepresentationId||'none')} · focus=${bdi(selection.focusId||'none')}</div>`;const anchor=host.querySelector(':scope > .visualize-selection');if(anchor)anchor.insertAdjacentElement('afterend',panel);else host.append(panel);};
  const bindSelectionHost=host=>{if(!host)return;host.onclick=event=>{const toggle=event.target?.closest?.('[data-vis-toggle]');if(toggle){event.preventDefault();const id=toggle.dataset.visToggle;if(!id)return;if(collapsedGroups.has(id))collapsedGroups.delete(id);else collapsedGroups.add(id);renderTree();body.querySelector(`[data-vis-row="${CSS.escape(id)}"]`)?.focus();return}const button=event.target?.closest?.('[data-visualize-select]');if(!button)return;event.preventDefault();const id=button.dataset.visualizeSelect,action=(event.ctrlKey||event.metaKey)?'toggle':event.shiftKey?'add':'replace';registry.execute('visualize.select',{representationIds:[id],action,route:`${binding.activeView().toLowerCase()}-projection`});spatialView.render({focusId:adapter.selectionTruth(binding.activeView()).focusId});refreshSelection();};};
  const renderLeft=()=>{const mode=binding.activeView(),rows=projectionFor(mode),selection=selectedSet(adapter),relCounts=visRelationCounts(adapter),groups=new Map();for(const row of rows){const key=groupKey(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row)}const totalRel=visRelationTotal(adapter);const structure=[...groups].map(([key,items])=>{const memberIds=new Set(items.map(row=>row.representationId));const groupRel=(adapter.model.edges||[]).filter(edge=>memberIds.has(String(edge.source))).length;return `<div class="vis-domainrow"><span class="vis-dtoken">${bdi(key)}</span><span class="vis-dlabel">${items.length}&nbsp;${esc(T('metaObjects'))} · ${groupRel}&nbsp;${esc(T('metaRelations'))}</span></div>${items.map(row=>{const id=row.representationId,count=relCounts.get(id),rel=count?count.in+count.out:0;return `<button type="button" class="vis-objectrow" data-visualize-select="${esc(id)}" aria-pressed="${selection.has(id)}"><span class="vis-orow"><span>${esc(row.label||id)}</span><span class="vis-rel" data-zero="${rel===0}" title="${rel} ${esc(T('metaRelations'))}">${rel}</span></span><small>${esc(row.canonicalRef?.objectId||id)}</small></button>`}).join('')}`}).join('');const previousLeft=workspace.regionHosts?.get?.('LEFT'),activeEl=document.activeElement,restoreId=previousLeft&&activeEl&&previousLeft.contains(activeEl)?activeEl.dataset?.visualizeSelect||activeEl.dataset?.visToggle||null:null;const host=workspace.region('LEFT',{html:`<section class="visualize-left" aria-label="${esc(T('leftTitle'))}"><div class="vis-card"><header><h3>${esc(T('scopeTitle'))}</h3><span class="vis-badge">${bdi(truth.authority)}</span></header><div class="vis-scope"><div class="vis-scopetop"><span class="vis-scopeicon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16"><circle cx="4" cy="4" r="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="6.5" r="2.1" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6.5" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 5.2 10.2 6M5.4 6.2 6.4 9.7M10.8 8.3 8.2 10.6" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></span><span class="vis-scopename"><strong>${bdi(truth.providerId)}</strong><small>${esc(T('leftTitle'))} · <bdi>canonical:false</bdi></small></span></div><div class="vis-stats"><div class="vis-stat"><b>${rows.length}</b><span>${esc(T('statObjects'))}</span></div><div class="vis-stat"><b>${totalRel}</b><span>${esc(T('statRelations'))}</span></div><div class="vis-stat"><b>${groups.size}</b><span>${esc(T('statDomains'))}</span></div></div></div></div><div class="vis-card"><header><h3>${esc(T('objectsTitle'))}</h3><span class="vis-badge">${rows.length}</span></header><div class="vis-objectlist visualize-object-list">${structure||`<div class="vis-emptystate"><strong>${esc(T('noSelection'))}</strong><span>${esc(T('selectHint'))}</span></div>`}</div></div></section>`,label:T('leftTitle')});bindSelectionHost(host);if(restoreId&&host)host.querySelector(`[data-visualize-select="${CSS.escape(restoreId)}"]`)?.focus();};
  const visReps=new Set(adapter.representationProjection('TREE').representations.map(item=>item.representationId));
  const collapsedGroups=new Set();
  const KIND_ICON=Object.freeze({
    domain:'<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 3.6h3.2l1 1.4h6.8v6.4H1.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M1.5 6.4h11.5" stroke="currentColor" stroke-width="1.1"/></svg>',
    ku:'<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><rect x="2.6" y="1.8" width="7.4" height="10.4" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M4.8 4.8h4M4.8 7.2h4M4.8 9.6h2.6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>',
    representation:'<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="1.6" fill="currentColor"/></svg>',
    chevron:'<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2.4 3.6 5 6.4l2.6-2.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  });
  const visKindOf=node=>{const id=String(node?.canonicalRef?.objectId||node?.representationId||node?.id||''),raw=String(node?.kind||node?.type||'');if(raw==='domain'||node?.__group)return 'domain';if(/^KU[-_]/i.test(id)||/^ku$/i.test(raw))return 'ku';return raw||'representation'};
  const visKindLabel=kind=>({domain:['Domain','مجال'],ku:['Knowledge unit','وحدة معرفة'],representation:['Representation','تمثيل']}[kind]||[kind,kind])[visLang()==='ar'?1:0];
  const visRelOf=(relCounts,id)=>{const c=relCounts.get(id);return c?c.in+c.out:0};
  const visRowMarkup=(node,level,selection,relCounts)=>{
    const id=String(node?.representationId||node?.id||''),label=String(node?.label||node?.title||id),kind=visKindOf(node),isGroup=Boolean(node?.__group),kids=Array.isArray(node?.children)?node.children:[],selectable=!isGroup&&visReps.has(id),selected=selectable&&selection.has(id),rel=isGroup?Number(node?.__rel||0):visRelOf(relCounts,id),objectId=isGroup?'—':String(node?.canonicalRef?.objectId||node?.objectId||id),collapsed=kids.length?collapsedGroups.has(id):false;
    const controls=`<span class="vis-exp" aria-hidden="true" data-vis-toggle="${esc(id)}" data-collapsed="${collapsed}">${KIND_ICON.chevron}</span>`;
    const attrs=selectable?`data-visualize-select="${esc(id)}" aria-pressed="${selected}"`:`data-vis-toggle="${esc(id)}" aria-expanded="${!collapsed}" aria-disabled="false"`;
    return `<button type="button" class="visualize-tree-row" ${attrs} aria-level="${level}" data-vis-row="${esc(id)}" data-vis-kind="${esc(kind)}">${kids.length?controls:`<span class="vis-exp" aria-hidden="true"></span>`}<span class="vis-label"><span class="vis-li" aria-hidden="true">${KIND_ICON[kind]||KIND_ICON.representation}</span><span class="vis-lt" dir="auto">${esc(label)}${isGroup?`<small>&nbsp;·&nbsp;${kids.length}</small>`:''}</span></span><span class="vis-cell">${esc(visKindLabel(kind))}</span><span class="vis-cell"><span class="vis-rel" data-zero="${rel===0}" title="${rel} ${esc(T('metaRelations'))}"><svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><circle cx="3" cy="4" r="1.7" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="9" cy="8" r="1.7" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M4.4 5.1 7.6 6.9" stroke="currentColor" stroke-width="1.2"/></svg>${rel}</span></span><span class="vis-cell vis-mono">${isGroup?'—':bdi(objectId)}</span></button>`;
  };
  const visBranchMarkup=(node,level,selection,relCounts)=>{
    const kids=Array.isArray(node?.children)?node.children:[],collapsed=kids.length?collapsedGroups.has(String(node?.representationId||node?.id||'')):false;
    return `${visRowMarkup(node,level,selection,relCounts)}${kids.length?`<div class="vis-children" ${collapsed?'hidden':''}>${kids.map(child=>visBranchMarkup(child,level+1,selection,relCounts)).join('')}</div>`:''}`;
  };
  const visTreeKeydown=event=>{if(!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const row=event.target?.closest?.('.visualize-tree-row');if(!row)return;const all=[...body.querySelectorAll('.visualize-tree-row')].filter(el=>!el.closest('[hidden]')),index=all.indexOf(row);if(index<0)return;const toggle=row.querySelector('[data-vis-toggle]'),expanded=toggle?(toggle.getAttribute('aria-expanded')==='true'):null;const hop=next=>{if(next){event.preventDefault();next.focus()}};if(event.key==='ArrowDown')return hop(all[index+1]);if(event.key==='ArrowUp')return hop(all[index-1]);if(event.key==='Home')return hop(all[0]);if(event.key==='End')return hop(all.at(-1));if(!toggle)return;if(event.key==='ArrowRight'){event.preventDefault();if(expanded===false)toggle.click();else hop(all[index+1]);return}if(event.key==='ArrowLeft'){event.preventDefault();if(expanded===true)toggle.click();else{const parent=row.parentElement?.classList?.contains('vis-children')?row.parentElement.previousElementSibling:null;hop(parent)}}};
  const renderTree=()=>{const rows=projectionFor('TREE'),selection=selectedSet(adapter),hierarchy=adapter.hierarchyProjection(),relCounts=visRelationCounts(adapter),groups=new Map();for(const row of rows){const key=groupKey(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row)}const branchMarkup=hierarchy.ok?hierarchy.nodes.map(node=>visBranchMarkup(node,1,selection,relCounts)).join(''):[...groups].map(([key,items])=>{const memberIds=new Set(items.map(row=>row.representationId));const groupRel=(adapter.model.edges||[]).filter(edge=>memberIds.has(String(edge.source))).length;return visBranchMarkup({id:`domain-${key}`,kind:'domain',label:key,__group:true,__rel:groupRel,children:items.map(row=>({id:row.representationId,representationId:row.representationId,kind:row.kind||row.type,label:row.label,canonicalRef:row.canonicalRef}))},1,selection,relCounts)}).join('');const totalRel=visRelationTotal(adapter);body.innerHTML=`<section class="visualize-tree" data-visualize-projection="TREE" ${hierarchy.ok?'data-tree-hierarchy-status="AVAILABLE"':'data-tree-hierarchy-status="UNAVAILABLE_NOT_OBSERVED"'}><div class="vis-panel"><div class="vis-panelhead"><span class="vis-phicon" aria-hidden="true">${KIND_ICON.domain}</span><h3>${esc(hierarchy.ok?T('treeTitle'):T('auxTitle'))}</h3><div class="vis-phmeta"><span class="vis-chip"><b>${rows.length}</b>&nbsp;${esc(T('metaObjects'))}</span><span class="vis-chip"><b>${totalRel}</b>&nbsp;${esc(T('metaRelations'))}</span><span class="vis-chip" data-tone="accent"><span class="vis-dot"></span>${esc(T('views.TREE'))}</span></div></div>${hierarchy.ok?'':`<div class="vis-truthstrip" role="status"><b>${esc(T('hierarchyUnavailable'))}</b><span>${esc(T('hierarchyUnavailableBody'))}</span><span>${esc(T('sourceTruth'))}: <bdi>${esc(hierarchy.source)}</bdi></span><span>${esc(T('mutation'))}: <bdi>${esc(hierarchy.mutation)}</bdi></span></div>`}<div class="vis-colhead" aria-hidden="true"><span></span><span>${esc(T('colObject'))}</span><span>${esc(T('colKind'))}</span><span>${esc(T('colRelations'))}</span><span>${esc(T('colSource'))}</span></div><div class="vis-rows" role="group" aria-label="${esc(T('treeTitle'))}">${branchMarkup||`<div class="vis-emptystate"><strong>${esc(T('noSelection'))}</strong><span>${esc(T('selectHint'))}</span></div>`}</div></div></section>`;bindSelectionHost(body);body.onkeydown=visTreeKeydown;};
  const renderPath=()=>{const rows=projectionFor('PATH'),selection=selectedSet(adapter),relCounts=visRelationCounts(adapter),groups=new Map();for(const row of rows){const key=groupKey(row);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row)}const chevron='<svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true"><path d="M1 5h10M8.4 1.8 11.8 5 8.4 8.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';const lanes=[...groups].map(([key,items])=>{const memberIds=new Set(items.map(row=>row.representationId));const laneRel=(adapter.model.edges||[]).filter(edge=>memberIds.has(String(edge.source))).length;const nodes=items.map((row,index)=>{const id=row.representationId,c=relCounts.get(id),rel=c?c.in+c.out:0;return `${index?`<span class="vis-connector" aria-hidden="true">${chevron}</span>`:''}<button type="button" class="visualize-path-node" data-visualize-select="${esc(id)}" aria-pressed="${selection.has(id)}"><span class="vis-step" aria-hidden="true">${index+1}</span><strong dir="auto">${esc(row.label||id)}</strong><small>${esc(row.canonicalRef?.objectId||id)}</small><span class="vis-nodefoot"><span class="vis-rel" data-zero="${rel===0}" title="${rel} ${esc(T('metaRelations'))}">${rel}&nbsp;${esc(T('metaRelations'))}</span></span></button>`}).join('');return `<section class="visualize-path-lane"><header><span class="vis-lanetoken">${bdi(key)}</span><strong>${esc(T('domainsTitle'))}</strong><span class="vis-lanemeta">${items.length}&nbsp;${esc(T('metaObjects'))} · ${laneRel}&nbsp;${esc(T('metaRelations'))}</span></header><div class="visualize-path-track">${nodes||`<p class="vis-laneempty">${esc(T('noSelection'))}</p>`}</div></section>`}).join('');body.innerHTML=`<section class="visualize-path" data-visualize-projection="PATH"><div class="vis-panel"><div class="vis-panelhead"><span class="vis-phicon" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 14 14"><path d="M1.5 7h11M9.5 4.5 12.5 7l-3 2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="3" cy="7" r="1.9" fill="currentColor"/></svg></span><h3>${esc(T('pathTitle'))}</h3><div class="vis-phmeta"><span class="vis-chip"><b>${rows.length}</b>&nbsp;${esc(T('metaObjects'))}</span><span class="vis-chip"><b>${groups.size}</b>&nbsp;${esc(T('pathLanes'))}</span></div></div><p class="vis-pathnote">${esc(T('pathBody'))}</p></div><div class="vis-pathlegend"><span><b>${esc(T('legendTitle'))}</b></span><span><i class="vis-swatch k-canonical"></i>${esc(T('legendCanonical'))}</span><span><i class="vis-swatch k-related"></i>${esc(T('legendRelated'))}</span><span><i class="vis-swatch k-currentPath"></i>${esc(T('legendCurrentPath'))}</span><span><i class="vis-swatch k-canvasOnly"></i>${esc(T('legendCanvasOnly'))}</span></div><div class="visualize-path-lanes">${lanes}</div></section>`;bindSelectionHost(body);};
  const fitSpatialLabels=()=>{const svg=spatialView.svg;if(!svg)return;const fit=(el,limit)=>{if(!el)return;const full=el.dataset.visFull??(el.dataset.visFull=el.textContent);el.textContent=full;if(typeof el.getComputedTextLength!=='function')return;if(el.getComputedTextLength()<=limit)return;let text=full;while(text.length>3){text=text.slice(0,-2);el.textContent=`${text}…`;if(el.getComputedTextLength()<=limit)break}const title=el.ownerDocument.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=full;el.append(title)};svg.querySelectorAll('.spatial-node-card .node-title').forEach(el=>fit(el,96));svg.querySelectorAll('.spatial-node-card .node-secondary-line').forEach(el=>fit(el,96));svg.querySelectorAll('.relation-label').forEach(el=>fit(el,150));/* presentation guard: an edge label must never sit on top of a node card or on top of another edge label (the edge keeps its aria-label + <title>; the legend carries the type vocabulary). */const cards=[...svg.querySelectorAll('.spatial-node-card')].map(el=>el.getBoundingClientRect()),placed=[];const hit=(a,b)=>!(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);svg.querySelectorAll('.relation-label').forEach(el=>{const box=el.getBoundingClientRect(),blocked=cards.some(card=>hit(box,card))||placed.some(other=>hit(box,other));el.style.visibility=blocked?'hidden':'';if(!blocked)placed.push(box)})};
  const syncSpatialOverlay=()=>{const mode=binding.activeView(),existing=spatialHost.querySelector(':scope > .vis-spatial-overlay');if(mode!=='GRAPH'&&mode!=='CANVAS'){existing?.remove();return}const locale=visLang();if(existing&&existing.dataset.visLocale===locale)return;existing?.remove();spatialHost.insertAdjacentHTML('beforeend',`<div class="vis-spatial-overlay" data-vis-locale="${locale}"><div class="vis-legend"><h4>${esc(T('legendTitle'))}</h4><ul><li><i class="vis-swatch k-canonical"></i>${esc(T('legendCanonical'))}</li><li><i class="vis-swatch k-related"></i>${esc(T('legendRelated'))}</li><li><i class="vis-swatch k-currentPath"></i>${esc(T('legendCurrentPath'))}</li><li><i class="vis-swatch k-canvasOnly"></i>${esc(T('legendCanvasOnly'))}</li></ul></div></div>`);};
  const syncSpatialVisibility=()=>{fitSpatialLabels();const mode=binding.activeView();if(mode!=='GRAPH'&&mode!=='CANVAS')return;const allowed=new Set(adapter.view(mode).representationIds());spatialView.svg?.querySelectorAll?.('[data-node]')?.forEach(node=>{const visible=allowed.has(node.dataset.node);node.style.display=visible?'':'none';node.setAttribute('aria-hidden',String(!visible));});spatialView.navigatorElement?.querySelectorAll?.('[data-nav-object]')?.forEach(node=>{node.hidden=!allowed.has(node.dataset.navObject)});spatialView.svg?.querySelectorAll?.('[data-edge]')?.forEach(element=>{const edge=adapter.model.edges.find(item=>String(item.id)===String(element.dataset.edge)),visible=edge&&allowed.has(String(edge.source))&&allowed.has(String(edge.target))&&(!(edge.views?.length)||edge.views.includes(mode));element.style.display=visible?'':'none';element.setAttribute('aria-hidden',String(!visible));});};
  const updateSelectionStyles=()=>{const selection=selectedSet(adapter),sync=button=>{const on=String(selection.has(button.dataset.visualizeSelect));button.setAttribute('aria-pressed',on);if(button.getAttribute('role')==='treeitem')button.setAttribute('aria-selected',on)};stage.querySelectorAll('[data-visualize-select]').forEach(sync);const left=workspace.regionHosts?.get?.('LEFT');left?.querySelectorAll?.('[data-visualize-select]').forEach(sync);};
  const refreshSelection=()=>{renderMeta();renderLeft();if(refreshContext)refreshContext();else fallbackRight();renderRightSelection();renderRightActions();updateSelectionStyles();syncSpatialVisibility();workspace.refreshToolbar?.();return {mode:binding.activeView(),selection:[...adapter.model.selection],selectionTruth:adapter.selectionTruth(binding.activeView()),selectionText:selectionText()};};
  let lastRenderedMode=null;
  const render=()=>{const mode=binding.activeView(),enteringSpatial=(mode==='GRAPH'||mode==='CANVAS')&&!(lastRenderedMode==='GRAPH'||lastRenderedMode==='CANVAS');stage.dataset.visualizeActiveView=mode;stage.querySelectorAll('[data-visualize-view-tab]').forEach(button=>{const active=button.dataset.visualizeViewTab===mode;button.setAttribute('aria-selected',String(active));button.setAttribute('aria-pressed',String(active));button.tabIndex=active?0:-1});const spatialMode=mode==='GRAPH'||mode==='CANVAS';spatialHost.hidden=!spatialMode;body.hidden=spatialMode;spatialHost.dataset.visualizeView=mode;syncSpatialOverlay();spatialView.grid=mode==='CANVAS';spatialView.minimap=mode==='CANVAS';if(mode==='TREE')renderTree();else if(mode==='PATH')renderPath();else{spatialView.render({focusId:adapter.selectionTruth(mode).focusId});syncSpatialVisibility();}if(enteringSpatial)requestAnimationFrame(()=>{if(spatialView.svg?.clientWidth>0&&spatialView.svg?.clientHeight>0){spatialView.fit();syncSpatialVisibility();refreshSelection();}});lastRenderedMode=mode;const toolbar=mode==='CANVAS'?['visualize.viewport','visualize.duplicateRepresentation','visualize.removeRepresentation','visualize.canvasLink','visualize.undoPresentation','visualize.redoPresentation','foundation.note']:mode==='GRAPH'?['visualize.viewport','foundation.note']:['foundation.note'];workspace.toolbar(toolbar,{contextProvider:commandPayload});refreshSelection();return {mode,engineOwner:adapter.model.interactionKernel.ownerId,selection:[...adapter.model.selection],canonical:false,providerAuthority:truth.authority};};
  if(!spatialView.__visualizeFourViewCallbacks){const originalSelect=spatialView.callbacks.select,originalChange=spatialView.callbacks.change,originalContext=spatialView.callbacks.context;spatialView.callbacks.select=ids=>{const result=originalSelect?.(ids);try{registry.execute('visualize.select',{representationIds:[...(ids||[])],action:'replace',route:`${binding.activeView().toLowerCase()}-shared-spatial`})}catch{}refreshSelection();return result};spatialView.callbacks.change=(...args)=>{const result=originalChange?.(...args);refreshSelection();return result};spatialView.callbacks.context=(x,y)=>binding.activeView()==='CANVAS'?workspace.menu(['visualize.duplicateRepresentation','visualize.removeRepresentation','visualize.canvasLink','visualize.undoPresentation','visualize.redoPresentation','visualize.viewport','foundation.note'],x,y):originalContext?.(x,y);spatialView.__visualizeFourViewCallbacks=true;}
  if(!stage.__visualizeCanvasKeyboard){stage.addEventListener('keydown',event=>{if(binding.activeView()!=='CANVAS'||event.isComposing)return;const target=event.target,tag=String(target?.tagName||'').toLowerCase();if(['input','textarea','select'].includes(tag)||target?.isContentEditable)return;const mod=event.ctrlKey||event.metaKey;let id=null;if(mod&&String(event.key).toLowerCase()==='d')id='visualize.duplicateRepresentation';else if(event.key==='Delete'||event.key==='Backspace')id='visualize.removeRepresentation';else if(mod&&String(event.key).toLowerCase()==='z')id=event.shiftKey?'visualize.redoPresentation':'visualize.undoPresentation';else if(mod&&String(event.key).toLowerCase()==='y')id='visualize.redoPresentation';if(!id)return;const availability=registry.availability(id,commandPayload());if(!availability.enabled)return;event.preventDefault();registry.execute(id,{...commandPayload(),route:'keyboard'});});stage.__visualizeCanvasKeyboard=true;}
  render();
  return {render,refresh:refreshSelection,activeView:binding.activeView,sharedSpatialOwner:adapter.model.interactionKernel.ownerId,spatialViewId:spatialView.instanceId};
}
