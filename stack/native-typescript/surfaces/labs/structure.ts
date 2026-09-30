/**
 * W03-LABS · LEFT region — Lab Structure.
 *
 * This pane answers "what is this lab made of?" for the lab-authoring task: the eleven
 * definition facets the author steps through, then the graph itself as a numbered task rail
 * plus its authored branches. It is a structure pane for ONE lab definition — not a document
 * collection, not a course tree, not a borrowed Library/Learn composition.
 */
import {esc,countText,type LabLocale} from './i18n.js';
import {icon} from './icons.js';

export const FACETS=[
  {id:'overview',icon:'overview'},
  {id:'knowledge',icon:'knowledge'},
  {id:'environment',icon:'environment'},
  {id:'initial',icon:'initial'},
  {id:'taskGraph',icon:'graph'},
  {id:'tools',icon:'tools'},
  {id:'signals',icon:'signals'},
  {id:'validation',icon:'validation'},
  {id:'safety',icon:'safety'},
  {id:'result',icon:'result'},
  {id:'completion',icon:'completion'}
] as const;

export interface StructureContext{
  t:Record<string,string>;
  locale:LabLocale;
  projection:any;
  facet:string;
  selectedId:string|null;
  selectedKind:string;
  validation:any;
}

export function renderStructure(ctx:StructureContext){
  const {t,projection,facet,selectedId,selectedKind,validation}=ctx;
  const tasks=projection.tasks||[],edges=projection.edges||[];
  const branches=edges.filter((e:any)=>['branch','conditional','optional'].includes(e.type));
  const toolCount=(projection.requiredTools||[]).length;
  const counts:Record<string,number|null>={taskGraph:tasks.length,tools:toolCount,signals:tasks.filter((x:any)=>x.expectedSignal).length,completion:tasks.length,validation:(validation?.errors||[]).length,knowledge:(projection.knowledgeLinks||[]).length};
  const facetItem=(f:{id:string;icon:string})=>{
    const label=t[f.id]||f.id;
    const n=counts[f.id];
    return `<button type="button" class="w03l-navitem" data-facet="${esc(f.id)}" aria-current="${facet===f.id}">${icon(f.icon)}<span>${esc(label)}</span>${n===undefined||n===null?'':`<small>${n}</small>`}</button>`;
  };
  const step=(task:any,index:number)=>`<button type="button" class="w03l-step" data-step="${esc(task.id)}" data-selected="${selectedKind==='task'&&selectedId===task.id}" aria-pressed="${selectedKind==='task'&&selectedId===task.id}">
      <span class="num" aria-hidden="true">${index+1}</span>
      <span class="lbl">${esc(task.title||task.id)}${String(task.completion||'')==='Optional'?`<span class="opt" style="margin-inline-start:6px">${esc(t.optionalCompletion)}</span>`:''}</span>
    </button>`;
  const branchItem=(edge:any)=>`<button type="button" class="w03l-step" data-branch="${esc(edge.id)}" data-selected="${selectedKind==='branch'&&selectedId===edge.id}" aria-pressed="${selectedKind==='branch'&&selectedId===edge.id}">
      <span class="num" aria-hidden="true">${icon('branch',11)}</span>
      <span class="lbl">${esc(edge.label||edge.condition||t[edge.type]||edge.type)} <bdi dir="ltr">${esc(edge.from)}→${esc(edge.to)}</bdi></span>
    </button>`;
  return `<section class="w03l-struct" data-lab-region-owner="W03-LABS" aria-label="${esc(t.structureAria)}">
    <header class="w03l-struct-head">${icon('graph',15)}<h3>${esc(t.structure)}</h3><span class="w03l-count" title="${esc(countText(tasks.length,'tasks',ctx.locale))}">${tasks.length}</span></header>
    <nav class="w03l-nav" aria-label="${esc(t.structureAria)}">${FACETS.map(facetItem).join('')}</nav>
    <div class="w03l-rule" role="separator"></div>
    <div class="w03l-group">${esc(t.taskGraph)}<span class="n">${tasks.length}</span></div>
    <div class="w03l-steps">${tasks.map(step).join('')||`<p class="w03l-empty">${esc(t.emptyGraph)} — ${esc(t.emptyGraphHint)}</p>`}</div>
    <div class="w03l-rule" role="separator"></div>
    <div class="w03l-group">${esc(t.branches)}<span class="n">${branches.length}</span></div>
    <div class="w03l-steps">${branches.map(branchItem).join('')||`<p class="w03l-empty">${esc(t.noBranches)}</p>`}</div>
  </section>`;
}
