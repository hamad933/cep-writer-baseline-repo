/* MANUAL AI BRIDGE — RUNTIME + PRESENTATION GOVERNOR (W05-MANUAL-AI)
 *
 * The shared W05 mount (`mountW05Collection` → `renderTypedCollectionStage`, in the writer-forbidden
 * `surfaces/m0-controller-composition.ts`) writes a generic typed-collection stage into the CENTER,
 * LEFT, RIGHT and TOOLBAR hosts. This runtime owns the surface's view state and re-asserts the
 * surface-owned composition whenever shared code rewrites a host, so the surface never degrades
 * into the generic workbench and never fights a re-render loop (burst guard).
 *
 * Shared mechanics used: SemanticCommandBus, WorkspaceFoundation regions/toolbar/banner, the
 * BottomDeepWorkOwner shelf. Everything below the host boundary is surface-specific presentation.
 */
import {injectManualAiStyle} from './style.js';
import {manualAiWorkbenchContext,renderCenter,type WorkbenchContext} from './workbench.js';
import {bottomProjectionFor,renderLeft,renderRight} from './panes.js';
import {BANNER,LEFT_LABEL,RIGHT_LABEL,TOOLBAR_LABELS,esc,L,localeNow} from './presentation.js';
import type {ManualAiLocale} from './presentation.js';

const OWNER='W05ManualAiSurfaceComposition';
const BOTTOM_COPY={
  title:{ar:'مساحة عمل مؤقتة',en:'Temporary workspace'},
  summary:{ar:'مغلقة — تُفتح للحمولة الكاملة والاستجابة الخفية والملفات والبصمات',en:'Closed — opens for the full payload, the hidden response, the files and the digests'}
};
/** Declared source the "Prepare manual packet" action prepares from. The declaration is part of the
 *  representative fixture set (surface-owned), so the action never invents a source revision. */
export const NEXT_REQUEST_DECLARATION=Object.freeze({
  proposalId:'AIB-REQ-0052',revision:'r1',sourceId:'CEP-KU-ACCESS-REVIEW',sourceDigest:'e1f0a9c7d3b65248f0a1c7d3b65248e1f0a9c7d3b65248f0a1c7d3b652489c2d',
  content:'',declaredBy:'W05_SURFACE_REPRESENTATIVE_RECORD'
});
const TOOLBAR_COMMANDS=['manual_ai.draft','manual_ai.export','manual_ai.import','foundation.settings'];
const DISPOSITIONS=['ACCEPT','EDIT','REJECT','DEFER','REQUEST_EVIDENCE'] as const;

let activeRuntime:any=null;
const $=(selector:string):Element|null=>typeof document==='undefined'?null:document.querySelector(selector);

export function createManualAiRuntime({adapter,commands}:{adapter:any;commands:any}){
  const runtimeId=`w05-manual-ai-${Math.random().toString(36).slice(2,9)}`;
  const view={facet:'ALL',query:'',selectedId:null as string|null,response:''};
  let renderedLocale:ManualAiLocale|null=null,renderedDir='',renderedSignature='',toolbarSignature='',governorPending=false,observerInstalled=false,pending=false;
  let suspended=false,burst=0,burstReset:any=null;

  const ctx=():WorkbenchContext=>{
    const base=manualAiWorkbenchContext({adapter,locale:localeNow()});
    const row=(view.selectedId&&base.rows.find(item=>item.proposalId===view.selectedId))||base.row;
    const inspected=row&&row!==base.row?(()=>{try{return adapter.inspect(row.proposalId)}catch{return null}})():base.inspected;
    return {...base,row,inspected};
  };
  const selected=()=>ctx().row;
  const mark=(host:Element|null)=>{if(host)host.setAttribute('data-ma-owned','manual_ai');return host};
  const owned=(selector:string)=>Boolean($(selector)?.getAttribute('data-ma-owned')==='manual_ai');
  const workspace=()=>(globalThis as any).CEPFoundation?.workspace||null;

  /* ── toolbar: the surface's global action strip ──────────────────────────────────────── */
  const toolbarPayload=()=>{
    const row=selected(),p=row?.provenance;
    return {
      route:'r6-manual_ai',id:row?.proposalId??null,requireResponse:true,
      proposalId:NEXT_REQUEST_DECLARATION.proposalId,revision:NEXT_REQUEST_DECLARATION.revision,
      sourceId:NEXT_REQUEST_DECLARATION.sourceId,sourceDigest:NEXT_REQUEST_DECLARATION.sourceDigest,content:NEXT_REQUEST_DECLARATION.content,
      input:row?{proposalId:row.proposalId,sourceId:p.sourceId,sourceRevisionId:p.sourceRevisionId,sourceDigest:p.sourceDigest,packageDigest:p.exportedPackageDigest,content:view.response}:null
    };
  };
  const toolbarLabelNodes=()=>[...(($('#domainToolbar') as HTMLElement|null)?.querySelectorAll('[data-foundation-command]')||[])] as HTMLElement[];
  const toolbarNeedsWork=(locale:ManualAiLocale)=>toolbarLabelNodes().some(node=>{
    const id=node.dataset.foundationCommand||'',copy=TOOLBAR_LABELS[id];if(!copy)return false;
    const expected=L(copy,locale);return node.textContent!==expected&&!node.textContent.startsWith(expected)
  });
  const toolbarPrimaryId=()=>{
    const availability=['draft','export','import'].map(key=>({key,ok:adapter.availability(`manual_ai.${key}`,toolbarPayload())===true}));
    return `manual_ai.${(availability.find(item=>item.ok)||availability[0]).key}`;
  };
  const applyToolbarLabels=(locale:ManualAiLocale)=>{
    const primary=toolbarPrimaryId();
    for(const node of toolbarLabelNodes()){
      const id=node.dataset.foundationCommand||'',copy=TOOLBAR_LABELS[id];
      if(copy){const expected=L(copy,locale);if(node.textContent!==expected&&!node.textContent.startsWith(expected))node.textContent=expected}
      if(id.startsWith('manual_ai.'))node.setAttribute('data-ma-primary',String(id===primary));
      else node.removeAttribute('data-ma-primary');
      node.setAttribute('data-ma-danger',String(id==='manual_ai.review'));
    }
  };
  /** Re-read availability without a full re-render (keeps focus inside the intake field). */
  const refreshToolbarAvailability=()=>{
    const ws=workspace();if(!ws)return;
    try{ws.refreshToolbar()}catch{return}
    applyToolbarLabels(localeNow());
  };
  const ensureToolbar=(ws:any,locale:ManualAiLocale)=>{
    const host=$('#domainToolbar');if(!host||!ws)return;
    mark(host);
    const signature=`${locale}|${view.selectedId||'none'}|${view.facet}`;
    if(signature!==toolbarSignature){
      try{ws.toolbar([...TOOLBAR_COMMANDS],{contextProvider:toolbarPayload})}catch{}
      toolbarSignature=signature;
    }else{
      /* Availability depends on the selected record, so refresh — then immediately re-localise
         below, because the shared renderer writes English labels. */
      try{ws.refreshToolbar()}catch{}
    }
    applyToolbarLabels(locale);
  };

  const ensureBanner=(locale:ManualAiLocale)=>{
    const title=$('#topBanner .title'),badge=$('#topBanner .badge'),lock=$('#topBanner .lock span');
    const next=L(BANNER.title,locale);
    if(title&&title.textContent!==next)title.textContent=next;
    if(badge&&badge.textContent!==BANNER.badge)badge.textContent=BANNER.badge;
    const detail=L(BANNER.detail,locale);
    if(lock&&lock.textContent!==detail)lock.textContent=detail;
  };
  const ensureBottomCopy=(locale:ManualAiLocale)=>{
    const title=$('#bottomShelf .bottomtitle'),summary=$('#bottomSummary');
    const t=L(BOTTOM_COPY.title,locale),s=L(BOTTOM_COPY.summary,locale);
    if(title&&title.textContent!==t)title.textContent=t;
    if(summary&&summary.textContent!==s)summary.textContent=s;
  };

  /* ── render ─────────────────────────────────────────────────────────────────────────── */
  const bindCenter=(locale:ManualAiLocale)=>{
    const stage=$('#foundationStage');if(!stage)return;
    stage.querySelectorAll('[data-ma-disposition]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      const disposition=(node as HTMLElement).dataset.maDisposition||'';
      const row=selected();if(!row)return;
      let result:any=null;try{result=commands.execute('manual_ai.review',{id:row.proposalId,disposition,route:'manual-ai-human-gate',invoker:node})}catch(error){result={ok:false,code:String((error as any)?.message||error)}}
      try{(globalThis as any).CEPFoundation?.workspace?.status?.(`${disposition} · ${result?.code||'RECORDED'}`,result?.ok===false?'error':'info')}catch{}
      renderAll();
    }));
    const intake=stage.querySelector('[data-ma-intake]') as HTMLTextAreaElement|null;
    if(intake){intake.value=view.response;intake.addEventListener('input',()=>{view.response=intake.value;refreshToolbarAvailability()})}
  };
  const bindLeft=(locale:ManualAiLocale)=>{
    const host=$('#domainLeftRegion');if(!host)return;
    host.querySelectorAll('[data-ma-facet]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();view.facet=(node as HTMLElement).dataset.maFacet||'ALL';renderAll();
    }));
    host.querySelectorAll('[data-ma-record]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      view.selectedId=(node as HTMLElement).dataset.maRecord||null;
      try{adapter.select(view.selectedId)}catch{}
      renderAll();
    }));
    const search=host.querySelector('[data-ma-search]') as HTMLInputElement|null;
    search?.addEventListener('input',()=>{
      view.query=search.value;
      renderAll();
      const next=$('#domainLeftRegion [data-ma-search]') as HTMLInputElement|null;
      if(next){next.focus();try{next.setSelectionRange(next.value.length,next.value.length)}catch{}}
    });
  };

  const renderAll=()=>{
    const stage=$('#foundationStage'),ws=workspace();
    if(!stage||!ws||stage.dataset.m0Composition!=='manual_ai')return false;
    try{injectManualAiStyle()}catch{}
    const locale=localeNow(),context=ctx();
    stage.classList.add('ma-stage');mark(stage);
    stage.innerHTML=renderCenter(context);
    bindCenter(locale);
    try{
      const left=ws.region('LEFT',{html:renderLeft({locale,rows:context.rows,facet:view.facet,query:view.query,selectedId:context.row?.proposalId||null}),label:L(LEFT_LABEL,locale)});
      mark(left);bindLeft(locale);
    }catch(error){console.warn('[W05-MANUAL-AI] left region failed',error)}
    try{
      const right=ws.region('RIGHT',{html:renderRight({locale,row:context.row,adapter}),label:L(RIGHT_LABEL,locale)});
      mark(right);
    }catch(error){console.warn('[W05-MANUAL-AI] right region failed',error)}
    const bottomHost=$('#domainBottomRegion');
    if(bottomHost&&!owned('#domainBottomRegion')){
      try{mark(ws.region('BOTTOM',{html:renderBottomRegion(context,locale),label:L(BOTTOM_COPY.title,locale),summary:L(BOTTOM_COPY.summary,locale)}))}catch{}
    }
    ensureToolbar(ws,locale);ensureBanner(locale);ensureBottomCopy(locale);
    renderedLocale=locale;renderedDir=(globalThis as any).document?.documentElement?.dir||'';
    renderedSignature=stateSignature();
    return true;
  };
  const renderBottomRegion=(context:WorkbenchContext,locale:ManualAiLocale)=>{
    const projection=bottomProjectionFor({row:context.row,locale,adapter});
    return `<section class="ma-bottom" data-ma-owned="manual_ai" style="display:grid;gap:7px">
      <strong style="font-size:12.5px">${esc(L(BOTTOM_COPY.title,locale))} · <span style="color:var(--text3);font-weight:600">${esc(L(BOTTOM_COPY.summary,locale))}</span></strong>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px">
        ${(projection.sections||[]).map((section:any)=>`<div style="border:1px solid var(--line);border-radius:9px;background:var(--bg1);padding:8px 10px;display:grid;gap:3px;min-width:0">
          <span style="font:600 9.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--text3)">${esc(section.label)}</span>
          <span style="font-size:12px;line-height:1.5;overflow-wrap:anywhere" dir="auto">${esc(String(section.value))}</span></div>`).join('')}
      </div></section>`;
  };

  const requestRender=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;try{renderAll()}catch(error){console.warn('[W05-MANUAL-AI] render failed',error)}})};

  /* ── staleness + burst guard ───────────────────────────────────────────────────────── */
  /** Domain-state signature: any command that changes a record must re-render the workbench. */
  const stateSignature=()=>{
    try{
      const rows=adapter&&typeof adapter.rows==='function'?adapter.rows():[];
      return `${rows.map((r:any)=>`${r.proposalId}:${r.state}:${r.draftState}:${r.draftId||''}:${r.provenance?.exportedArtifactId||''}`).join('|')}#${view.selectedId||''}#${view.facet}#${view.query}#${adapter?.lastAction?.at||''}`;
    }catch{return 'UNAVAILABLE'}
  };
  const isStale=()=>{
    const stage=$('#foundationStage');
    if(!stage||stage.dataset.m0Composition!=='manual_ai')return false;
    if(!owned('#foundationStage'))return true;
    if(!owned('#domainLeftRegion'))return true;
    if(!owned('#domainContext'))return true;
    if(renderedSignature!==stateSignature())return true;
    const locale=localeNow();
    if(renderedLocale!==locale)return true;
    const dir=(globalThis as any).document?.documentElement?.dir||'';
    if(renderedDir!==dir)return true;
    if(toolbarNeedsWork(locale))return true;
    const search=$('#domainLeftRegion [data-ma-search]') as HTMLInputElement|null;
    if(search&&search.value!==view.query)return true;
    return false;
  };
  const staleBreakdown=()=>{
    const stage=$('#foundationStage');
    return {stageOwned:owned('#foundationStage'),leftOwned:owned('#domainLeftRegion'),rightOwned:owned('#domainContext'),
      composition:stage?.dataset?.m0Composition||null,renderedLocale,renderedLocaleNow:localeNow(),
      renderedDir,dirNow:(globalThis as any).document?.documentElement?.dir||'',toolbarNeedsWork:toolbarNeedsWork(localeNow()),signature:toolbarSignature};
  };
  const spendBudget=()=>{
    burst+=1;
    if(!burstReset)burstReset=setTimeout(()=>{burst=0;burstReset=null},300);
    if(burst<=16)return true;
    suspended=true;
    const breakdown=staleBreakdown();
    (globalThis as any).__w05ManualAiGovernor={suspended:true,burst,breakdown,at:new Date().toISOString()};
    console.warn('[W05-MANUAL-AI] governor burst guard',JSON.stringify(breakdown));
    setTimeout(()=>{suspended=false;burst=0},2000);
    return false;
  };
  const self={id:runtimeId};
  const run=()=>{
    if(activeRuntime!==self)return;
    if(suspended)return;
    try{
      if(!isStale()){burst=0;return}
      if(!spendBudget())return;
      renderAll();
    }catch(error){console.warn('[W05-MANUAL-AI] governor pass failed',error)}
  };
  const schedule=()=>{if(governorPending)return;governorPending=true;queueMicrotask(()=>{governorPending=false;run()})};

  const installGovernor=()=>{
    if(typeof document==='undefined'||observerInstalled)return;
    observerInstalled=true;activeRuntime=self;
    /* A toolbar/command action may change domain state without mutating any host this governor
       watches, so schedule an explicit re-check after every command invocation. */
    try{
      document.addEventListener('click',event=>{
        const target=(event as Event).target as Element|null;
        if(!target||typeof target.closest!=='function'||!target.closest('[data-foundation-command]'))return;
        setTimeout(()=>{try{run()}catch{}},90);
        setTimeout(()=>{try{run()}catch{}},360);
      },true);
    }catch{}
    try{
      const observer=new MutationObserver(schedule);
      observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['lang','dir','data-m0-composition']});
    }catch{}
    setTimeout(run,0);setTimeout(run,150);setTimeout(run,450);
    try{run()}catch{}
  };

  return {
    id:runtimeId,view,installGovernor,renderAll,requestRender,
    context:ctx,
    disposition:(disposition:string)=>{const row=selected();if(!row)return {ok:false,code:'NO_REQUEST'};
      try{return commands.execute('manual_ai.review',{id:row.proposalId,disposition,route:'manual-ai-runtime'})}catch(error){return {ok:false,code:String((error as any)?.message||error)}}},
    diagnostics:()=>({owner:OWNER,renderedLocale,renderedDir,toolbarSignature,stale:staleBreakdown(),
      declaration:NEXT_REQUEST_DECLARATION,dispositions:[...DISPOSITIONS],toolbarCommands:[...TOOLBAR_COMMANDS]})
  };
}
