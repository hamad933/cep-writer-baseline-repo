/**
 * W03-SCENARIOS · LEFT structure pane.
 *
 * Reference authority shows a "Scenario Structure" navigation pane: scenario-level facets
 * (Overview / Environment / Roles), an expandable Phases branch with numbered children, the
 * typed element facets (Events / Injects / Decision Points / Lab Modules / Tasks / Rules /
 * Observability / Completion Criteria) and a References group (Knowledge Units / Lab Library).
 *
 * This pane is composed for SCENARIOS' purpose — navigating a time-ordered scenario
 * definition. Tree mechanics are shared-product mechanics; the composition, grouping, counts
 * and selection semantics are surface-specific and are not inherited from Library or Learn.
 */
import {esc,icon,kindColor,kindIcon} from './util.js';

export interface StructureContext{
  t:Record<string,string>;
  projection:any;
  locale:string;
  facet:string;
  collapsed:Set<string>;
  selectedId:string|null;
  selectedPhaseId:string|null;
  knowledgeUnits:Array<{id:string;title:string;relation?:string}>;
  labRefs:Array<{id:string;revision:string;available:boolean}>;
}

const itemLabel=(value:any)=>{
  if(value===null||value===undefined)return '';
  if(typeof value==='string')return value;
  return String(value.name||value.title||value.label||value.id||'');
};
const itemId=(value:any,index:number)=>typeof value==='string'?`ref-${index+1}`:String(value.id||`ref-${index+1}`);

const FACETS=[
  {key:'events',label:(t:any)=>t.events,icon:'history',facet:'events'},
  {key:'injects',label:(t:any)=>t.injects,icon:'edit',facet:'injects'},
  {key:'decisions',label:(t:any)=>t.decisions,icon:'move',facet:'decisions'},
  {key:'modules',label:(t:any)=>t.modules,icon:'lab',facet:'modules'},
  {key:'tasks',label:(t:any)=>t.tasks,icon:'list',facet:'tasks'},
  {key:'rules',label:(t:any)=>t.rules,icon:'shield',facet:'rules'},
  {key:'observability',label:(t:any)=>t.observability,icon:'focus',facet:'observability'},
  {key:'completion',label:(t:any)=>t.completion,icon:'check',facet:'completion'}
] as const;

export const renderStructure=(ctx:StructureContext)=>{
  const {t,projection,facet,collapsed,selectedId,selectedPhaseId}=ctx;
  const phases=projection.phases||[];
  const facets:any=projection.facets||{};
  const phasesOpen=!collapsed.has('phases');

  const phaseRows=phases.map((phase:any,index:number)=>{
    const active=selectedPhaseId===phase.id&&facet==='selection';
    const num=String(index+1).padStart(2,'0');
    const name=String(phase.name||phase.id||'').replace(/^\d+\s*/,'');
    return `<button type="button" class="w03-srow" data-phase="${esc(phase.id)}" aria-current="${active}"><span class="ic">${icon('list')}</span><span class="w03-snum"><bdi dir="ltr">${num}</bdi></span><span>${esc(name)}</span></button>`;
  }).join('');

  const facetRows=FACETS.map(entry=>{
    const items=facets[entry.key]||[];
    const open=!collapsed.has(entry.key);
    const hasChildren=items.length>0;
    const active=facet===entry.facet;
    const row=`<button type="button" class="w03-srow" data-group="${entry.key}" data-facet="${entry.facet}" aria-current="${active}" ${hasChildren?`aria-expanded="${open}"`:''}><span class="ic">${icon(entry.icon)}</span><span>${esc(entry.label(t))}</span><span class="ct">${items.length}</span></button>`;
    if(!hasChildren||!open)return row;
    const children=items.map((item:any,i:number)=>{
      const id=itemId(item,i),label=itemLabel(item)||id;
      const isElement=Boolean(item&&typeof item==='object'&&item.kind);
      const activeChild=isElement&&selectedId===id&&facet==='selection';
      const colour=isElement?kindColor(String(item.kind)):'var(--text3)';
      const glyph=isElement?icon(kindIcon(String(item.kind))):icon('ref');
      return `<button type="button" class="w03-srow" ${isElement?`data-element="${esc(id)}"`:`data-facet-item="${esc(entry.facet)}:${esc(id)}"`} data-facet="${esc(entry.facet)}" aria-current="${activeChild}"><span class="ic" style="color:${colour}">${glyph}</span><span></span><span>${esc(label)}</span></button>`;
    }).join('');
    return `${row}<div class="w03-sgroup">${children}</div>`;
  }).join('');

  const knowledge=ctx.knowledgeUnits||[];
  const labs=ctx.labRefs||[];
  const references=`<div class="w03-ssection">${esc(t.references)}</div>
    <button type="button" class="w03-srow" data-group="knowledge" data-facet="references-knowledge" aria-current="${facet==='references-knowledge'}" aria-expanded="${!collapsed.has('knowledge')}"><span class="ic">${icon('book')}</span><span>${esc(t.knowledgeUnits)}</span><span class="ct">${knowledge.length}</span></button>
    ${collapsed.has('knowledge')?'':`<div class="w03-sgroup">${knowledge.length?knowledge.map(ku=>`<button type="button" class="w03-srow" data-facet="references-knowledge" data-facet-item="knowledge:${esc(ku.id)}" aria-current="${facet==='references-knowledge'&&selectedId===ku.id}"><span class="ic">${icon('ref')}</span><span></span><span>${esc(ku.title)}</span></button>`).join(''):`<p class="w03-snote">${esc(t.knowledgeEmpty)}</p>`}</div>`}
    <button type="button" class="w03-srow" data-group="labs" data-facet="references-labs" aria-current="${facet==='references-labs'}" aria-expanded="${!collapsed.has('labs')}"><span class="ic">${icon('lab')}</span><span>${esc(t.labLibrary)}</span><span class="ct">${labs.length}</span></button>
    ${collapsed.has('labs')?'':`<div class="w03-sgroup">${labs.length?labs.map(lab=>`<button type="button" class="w03-srow" data-facet="references-labs" data-facet-item="lab:${esc(lab.id)}" aria-current="${facet==='references-labs'&&selectedId===lab.id}"><span class="ic">${icon('ref')}</span><span></span><span><bdi dir="ltr">${esc(lab.id)}@${esc(lab.revision)}</bdi></span></button>`).join(''):`<p class="w03-snote">${esc(t.labEmpty)}</p>`}</div>`}`;

  return `<nav class="w03-struct" aria-label="${esc(t.ariaStructure)}" data-scenario-structure>
    <button type="button" class="w03-srow" data-facet="overview" aria-current="${facet==='overview'}"><span class="ic">${icon('info')}</span><span>${esc(t.overview)}</span><span></span></button>
    <button type="button" class="w03-srow" data-facet="environment" aria-current="${facet==='environment'}"><span class="ic">${icon('lab')}</span><span>${esc(t.environment)}</span><span class="ct">${(projection.environment?.capabilities||[]).length}</span></button>
    <button type="button" class="w03-srow" data-facet="roles" aria-current="${facet==='roles'}"><span class="ic">${icon('list')}</span><span>${esc(t.roles)}</span><span class="ct">${(projection.roles||[]).length}</span></button>
    <button type="button" class="w03-srow" data-group="phases" data-facet="phases" aria-expanded="${phasesOpen}" aria-current="${facet==='phases'}"><span class="ic">${icon('layout')}</span><span>${esc(t.phases)}</span><span class="ct">${phases.length}</span></button>
    ${phasesOpen?`<div class="w03-sgroup">${phaseRows||`<p class="w03-snote">${esc(t.emptyFacet)}</p>`}</div>`:''}
    ${facetRows}
    ${references}
  </nav>`;
};
