/**
 * W03-LABS · RIGHT region — Lab Context.
 *
 * The reference's right pane is an inspector of the subject currently being authored: an icon,
 * a label and a value per row, separated by hairlines, with a factual block underneath. This
 * module renders exactly that shape for whatever subject the structure pane or the graph has
 * selected — a task, a branch, or the lab itself — plus the always-present preflight facts.
 */
import {esc,countText,type LabLocale} from './i18n.js';
import {icon,bdi} from './icons.js';

interface RowSpec{
  icon:string;label:string;value?:string;plain?:boolean;tone?:'ok'|'warn'|'error';
  chips?:string[];hint?:string;
}

const row=(r:RowSpec)=>`<div class="w03l-row">
    <span class="w03l-rowicon">${icon(r.icon,16)}</span>
    <div>
      <div class="w03l-rowlabel">${esc(r.label)}</div>
      ${r.chips?.length?`<div class="w03l-chips">${r.chips.map(c=>`<span class="w03l-chip">${c}</span>`).join('')}</div>`
        :r.value!==undefined?`<div class="w03l-rowvalue${r.plain?' plain':''}"${r.tone?` data-tone="${r.tone}"`:''}>${r.value}</div>`:''}
      ${r.hint?`<div class="w03l-rowlabel" style="margin-block-start:4px">${esc(r.hint)}</div>`:''}
    </div>
  </div>`;

const kv=(label:string,value:string,tone?:'ok'|'warn'|'error')=>`<div class="w03l-kv"><span>${esc(label)}</span><b${tone?` data-tone="${tone}"`:''}>${value}</b></div>`;

export interface ContextContext{
  t:Record<string,string>;
  locale:LabLocale;
  projection:any;
  facet:string;
  selection:any;
  validation:any;
  preflight:any;
  toolNames:(refs:any)=>string[];
}

export function renderContext(ctx:ContextContext){
  const {t,projection,facet,selection,validation,preflight}=ctx;
  const tasks=projection.tasks||[],edges=projection.edges||[];
  const task=selection?.kind==='task'?selection.object:null;
  const branch=selection?.kind==='branch'?selection.object:null;
  const published=projection.lifecycle==='PUBLISHED';
  const errors=validation?.errors||[];
  const blockedChecks=(preflight?.checks||[]).filter((c:any)=>['UNAVAILABLE','STALE','BLOCKED'].includes(c.status)).length;
  const caps=(projection.environment?.capabilities||[]).map(String);
  const required=String(t.required||'Required'),optionalLbl=String(t.optionalCompletion||'Optional');

  let subjectTitle='',subjectSub='',rows:RowSpec[]=[];

  if(branch){
    subjectTitle=String(branch.label||branch.condition||t[branch.type]||branch.type||t.branches);
    subjectSub=`${branch.type} · ${branch.from} → ${branch.to}`;
    rows=[
      {icon:'branch',label:t.edgeType||t.branches,value:esc(String(branch.type||'depends'))},
      {icon:'connect',label:t.source||'From',value:bdi(branch.from)},
      {icon:'connect',label:t.target||'To',value:bdi(branch.to)},
      {icon:'validation',label:t.condition||'Condition',value:esc(branch.condition||branch.label||'—'),plain:true},
      {icon:'completion',label:t.completionContribution,value:esc(/optional/i.test(String(branch.type||''))?optionalLbl:required)}
    ];
  }else if(task){
    subjectTitle=String(task.title||task.id);
    subjectSub=`${task.id} · ${task.nodeType||'task'}`;
    if(facet==='taskGraph'||facet==='signals'||facet==='completion'){
      rows=[
        {icon:'target',label:t.objectiveType,value:esc(task.objectiveType||task.nodeType||'—')},
        {icon:'capability',label:t.requiredCapability,value:esc(task.requiredCapability||'—')},
        {icon:'tools',label:t.permittedTools,chips:ctx.toolNames(task.toolRefs).map(esc),hint:ctx.toolNames(task.toolRefs).length?undefined:t.noTools},
        {icon:'signals',label:t.expectedSignal,value:esc(task.expectedSignal||'—'),plain:true},
        {icon:'link',label:t.validationLink,value:esc(task.validation||'—')},
        {icon:'completion',label:t.completionContribution,value:esc(task.completion||required),tone:/optional/i.test(String(task.completion||''))?'warn':'ok'}
      ];
    }else if(facet==='validation'){
      rows=[
        {icon:'validation',label:t.validationResult,value:esc(task.validation||'—')},
        {icon:'signals',label:t.expectedSignal,value:esc(task.expectedSignal||'—'),plain:true},
        {icon:'info',label:t.nodeType,value:esc(task.nodeType||'—')},
        {icon:'graph',label:t.taskId,value:bdi(task.id)}
      ];
    }
  }

  if(!rows.length){
    /* lab-level subject: the facet decides which projection of the definition is inspected */
    subjectTitle=String(projection.title||t.labContext);
    subjectSub=`${projection.identity?.id||''}@${projection.identity?.revision||''}`;
    if(facet==='environment'||facet==='initial'){
      rows=[
        {icon:'environment',label:t.boundEnvironment,chips:caps.map(esc),hint:esc(String(projection.environment?.provider||'LOCAL_TRAINING_ENVIRONMENT_FIXTURE'))},
        {icon:'initial',label:t.initial,value:bdi(String(projection.environment?.revision||'ENV-2'))},
        {icon:'graph',label:t.taskId,value:tasks[0]?bdi(tasks[0].id):'—'}
      ];
    }else if(facet==='tools'){
      rows=(projection.requiredTools||[]).map((tool:any)=>({icon:'tools',label:String(tool.name||tool.id),value:bdi(`${tool.id} · r${tool.revision||'1'}`),plain:true}));
      if(!rows.length)rows=[{icon:'tools',label:t.requiredTools,hint:t.noTools}];
    }else if(facet==='signals'){
      rows=tasks.map((x:any)=>({icon:'signals',label:String(x.title||x.id),value:esc(x.expectedSignal||'—'),plain:true}) as RowSpec);
      if(!rows.length)rows=[{icon:'signals',label:t.signals,hint:t.emptyGraphHint}];
    }else if(facet==='completion'){
      rows=tasks.map((x:any)=>({icon:'completion',label:String(x.title||x.id),value:esc(x.completion||required),tone:/optional/i.test(String(x.completion||''))?'warn':'ok'}) as RowSpec);
      if(!rows.length)rows=[{icon:'completion',label:t.completion,hint:t.emptyGraphHint}];
    }else if(facet==='knowledge'){
      const links=projection.knowledgeLinks||[];
      rows=links.map((l:any)=>({icon:'knowledge',label:String(l.title||l.id),value:bdi(String(l.id||'')),plain:true}) as RowSpec);
      if(!rows.length)rows=[{icon:'knowledge',label:t.knowledge,hint:String(t.noKnowledge)}];
    }else if(facet==='validation'){
      rows=[
        {icon:'validation',label:t.validationResult,value:validation?.ok?String(t.passed):String(t.blocked),tone:validation?.ok?'ok':'error'},
        {icon:'info',label:t.checks,value:bdi(`${errors.length}`),tone:errors.length?'error':'ok'},
        ...errors.slice(0,5).map((e:string)=>({icon:'info',label:t.failed,value:bdi(e),plain:true}))
      ];
      if(!errors.length)rows.push({icon:'check',label:t.stValidated.replace('{n}',String(tasks.length)),value:esc(t.passed),tone:'ok'});
    }else if(facet==='safety'){
      rows=[{icon:'safety',label:t.safety,value:esc(String(projection.safety||'—')),plain:true},
        {icon:'info',label:t.state,value:esc(published?String(t.revision):'DRAFT'),tone:published?'ok':'warn'}];
    }else if(facet==='result'){
      rows=[{icon:'result',label:t.result,value:esc(String(projection.resultSchema||'—')),plain:true},
        {icon:'signals',label:t.expectedSignal,value:esc(`${tasks.filter((x:any)=>x.expectedSignal).length}/${tasks.length}`),tone:'ok'}];
    }else{
      rows=[
        {icon:'overview',label:t.purpose,value:esc(projection.purpose||'—'),plain:true},
        {icon:'info',label:t.identity,value:bdi(`${projection.identity?.id||''} @ ${projection.identity?.revision||''}`)},
        {icon:'graph',label:t.taskGraph,value:`${countText(tasks.length,'tasks',ctx.locale)} · ${countText(edges.length,'edges',ctx.locale)}`},
        {icon:'environment',label:t.boundEnvironment,chips:caps.map(esc)},
        {icon:'tools',label:t.requiredTools,chips:(projection.requiredTools||[]).map((x:any)=>esc(String(x.name||x.id)))}
      ];
    }
  }

  const facts=`<div class="w03l-facts">
      <h4>${esc(t.preflightResult)}</h4>
      ${kv(t.state,esc(projection.lifecycle||'DRAFT'),published?'ok':'warn')}
      ${kv(t.validationResult,errors.length?bdi(`${errors.length} ${t.failed}`):esc(String(t.passed)),errors.length?'error':'ok')}
      ${kv(t.preflightResult,preflight?.status==='READY'?esc(String(t.ready)):esc(String(t.blocked)),preflight?.status==='READY'?'ok':'error')}
      ${kv(t.checks,blockedChecks?bdi(`${blockedChecks}`):bdi('0'),blockedChecks?'warn':'ok')}
      ${kv(t.nonLinear,validation?.graph?.nonLinear?esc(String(t.nonLinearTrue)):esc(String(t.nonLinearFalse)))}
    </div>`;

  const hint=(!task&&!branch)?`<p class="w03l-hint">${esc(t.noSelectionHint)}</p>`:'';

  return `<section class="w03l-ctx" data-lab-region-owner="W03-LABS" aria-label="${esc(t.contextAria)}">
    <header class="w03l-ctx-head">${icon(facet==='taskGraph'?'target':'info',17)}
      <div><h3>${esc(facet==='taskGraph'&&task?String(t.context):String(t[facet]||t.context))}</h3><p class="sub">${esc(subjectTitle)}${subjectSub?` · <bdi dir="ltr">${esc(subjectSub)}</bdi>`:''}</p></div>
      <button type="button" class="w03l-close" data-lab-close aria-label="${esc(String(t.showContext))}" title="${esc(String(t.showContext))}">${icon('close',14)}</button>
    </header>
    <div class="w03l-rows">${rows.map(row).join('')}</div>
    ${facts}
    ${hint}
  </section>`;
}
