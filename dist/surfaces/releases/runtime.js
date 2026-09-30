/* RELEASES SURFACE RUNTIME — owns the surface's view state and the presentation governor that
 * keeps the surface-owned composition in place.
 *
 * Architecture: SHARED MECHANICS (SemanticCommandBus, WorkspaceFoundation regions/toolbar) +
 * SURFACE-SPECIFIC COMPOSITION (presentation.ts) + this governor. The shared W05 mount renders a
 * generic typed-collection stage ("Releases workbench"); the governor re-asserts the
 * surface-owned composition whenever shared code rewrites a host, so the surface never degrades
 * into the generic workbench and never fights a re-render loop (burst guard records WHY it would
 * have looped instead of starving the event loop).
 */
import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {RELEASE_RECORDS,releaseRecord} from './records.js';
import {
  initialViewState,injectReleasesStyle,renderCenter,renderLeft,renderRight,displayState,relativeAge,
  localizeToolbar,localizePaneToggles,PANE_TOGGLE_LABELS,toolbarLabelFor,bannerCopy,TOOLBAR_COMMANDS,matchesState,                     
                                                       
} from './presentation.js';

const OWNER='ReleasesSurfacePresentationOwner';
const $=(selector       )=>typeof document==='undefined'?null:document.querySelector(selector);
const STATE_KEYS=['draft','candidate','ready','held','released','rolledBack'];
const STATE_ORDER                      ={readyWarning:0,ready:1,held:2,draft:3,released:4,rolledBack:5};

let activeRuntime    =null;

export function createReleasesSurfaceRuntime({adapter,commands}                                          ){
  const id=`w05-releases-${Math.random().toString(36).slice(2,9)}`;
  const view                  =initialViewState();
  let renderedLocale            =null;
  let renderedDir            =null;
  let toolbarSignature='';
  let pending=false,governorPending=false,observerInstalled=false;

  const locale=()    =>(typeof document!=='undefined'&&document.documentElement.lang==='en')?'en':'ar';
  const workspace=()=>(globalThis       ).CEPFoundation?.workspace||null;

  /* ── view model ── */
  const domainRows=()      =>{try{return adapter.rows()}catch{return []}};
  const candidateViews=()                =>{
    const L=locale();
    return domainRows().map(domain=>{
      const record=releaseRecord(String(domain.candidateId),domain);
      return {record,domain,state:displayState(record,domain),age:relativeAge(record.ageMinutes,L)};
    });
  };
  const sorted=(list                )=>{
    const copy=[...list];
    if(view.sort==='newest')copy.sort((a,b)=>a.record.ageMinutes-b.record.ageMinutes);
    else if(view.sort==='oldest')copy.sort((a,b)=>b.record.ageMinutes-a.record.ageMinutes);
    else copy.sort((a,b)=>(STATE_ORDER[a.state]??9)-(STATE_ORDER[b.state]??9)||a.record.ageMinutes-b.record.ageMinutes);
    return copy;
  };
  const filteredOf=(list                )=>list.filter(item=>{
    if(!matchesState(item.state,view.stateFilter))return false;
    if(view.channels.size&&!view.channels.has(item.record.channel))return false;
    if(view.query){
      const haystack=`${item.record.candidateId} ${item.record.version} ${item.record.channel} ${item.record.environment} ${item.record.build.branch} ${item.record.build.id}`.toLowerCase();
      if(!haystack.includes(view.query.trim().toLowerCase()))return false;
    }
    return true;
  });
  const compareTruth=(selected                   )=>{
    const rows=domainRows();
    const left=selected?selected.record.candidateId:(rows[0]?.candidateId||null);
    const right=(rows.find(r=>r.candidateId!==left)?.candidateId)||null;
    let availability    ='UNAVAILABLE';
    try{availability=adapter.availability('releases.compare',{leftId:left,rightId:right})}catch(error){availability={reason:String((error       )?.message||error)}}
    const available=availability===true;
    const reason=available
      ?`two exact ReleaseCandidate identities pinned · ${left} ↔ ${right} · AnalyticalCompareOwner`
      :(typeof availability==='string'?availability:(availability?.reason||availability?.code||'UNAVAILABLE'));
    return {available,reason,leftId:left,rightId:right,last:adapter.lastAction?.commandId==='releases.compare'?adapter.lastAction:null};
  };
  const buildContext=()                =>{
    const L=locale();
    const all=candidateViews(),filtered=sorted(filteredOf(all));
    if(!filtered.some(item=>item.record.candidateId===view.selectedId))view.selectedId=filtered[0]?.record.candidateId??null;
    const selected=filtered.find(item=>item.record.candidateId===view.selectedId)||null;
    const countState=(key       )=>all.filter(item=>matchesState(item.state,key==='candidate'?'candidate':key==='ready'?'ready':key)).length;
    const channels=(['internal','beta','production']         ).map(key=>({key,count:all.filter(i=>i.record.channel===key).length}));
    const environments=(['staging','preProd','production']         ).map(key=>({key,count:all.filter(i=>i.record.environment===key).length}));
    return {
      locale:L,view,all,filtered,selected,
      counts:{
        states:STATE_KEYS.map(key=>({key,count:key==='candidate'?all.filter(i=>matchesState(i.state,'candidate')).length:key==='ready'?all.filter(i=>matchesState(i.state,'ready')).length:countState(key)})),
        channels,environments,visible:filtered.length,total:all.length
      },
      compare:compareTruth(selected),authAvailability:null
    };
  };

  /* ── rendering ── */
  const mark=(host             )=>{
    const element=host?.firstElementChild||null;
    if(!element)return false;
    element.setAttribute('data-w05-owned','releases');
    (element       ).__w05Runtime=id;
    return true;
  };
  const owned=(host             )=>{
    const element=host?.firstElementChild||null;
    if(!element||element.getAttribute('data-w05-owned')!=='releases'||(element       ).__w05Runtime!==id)return false;
    /* Shared code (reference-return control / context inspector) APPENDS donor nodes inside the
       region host after the surface rendered, so firstElementChild stays ours while a foreign
       control sits under it. The surface owns the whole region host: any extra child = stale. */
    return host .children.length===1;
  };
  const ensureStyle=()=>{try{injectReleasesStyle()}catch{}};

  const toolbarNeedsWork=()=>{
    const host=$('#domainToolbar');
    if(!host)return true;
    const nodes=[...host.querySelectorAll('[data-foundation-command]')]                 ;
    for(const command of TOOLBAR_COMMANDS){
      const node=nodes.find(item=>item.dataset.foundationCommand===command);
      if(!node)return true;
      const label=toolbarLabelFor(command,locale());
      if(label&&node.textContent!==label)return true;
    }
    return false;
  };
  const ensureToolbar=(ws    ,ctx                )=>{
    const host=$('#domainToolbar');
    if(!host)return;
    const signature=`${ctx.locale}|${view.selectedId}|${String(ctx.compare.available)}|${view.stateFilter}|${view.channels.size}|${view.query}`;
    if(signature!==toolbarSignature||toolbarNeedsWork()){
      try{
        ws.toolbar([...TOOLBAR_COMMANDS],{contextProvider:()=>({
          id:view.selectedId,route:'r6-releases',
          leftId:ctx.compare.leftId,rightId:ctx.compare.rightId,
          candidateId:view.selectedId
        })});
      }catch{}
      toolbarSignature=signature;
    }
    localizeToolbar(host,ctx.locale);
    try{localizePaneToggles(ctx.locale)}catch{}
  };
  const ensureBanner=(ctx                )=>{
    const copy=bannerCopy(ctx.locale);
    const title=$('#topBanner .title');
    if(title&&title.textContent!==copy.title)title.textContent=copy.title;
    const lock=$('#topBanner .lock span');
    if(lock&&lock.textContent!==copy.detail)lock.textContent=copy.detail;
    const badge=$('#topBanner .badge');
    if(badge&&badge.textContent!==copy.badge)badge.textContent=copy.badge;
  };

  const bindCommon=(root             )=>{
    if(!root)return;
    root.querySelectorAll('[data-rel-cand]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      const next=(node               ).dataset.relCand||null;
      view.selectedId=next;
      try{if(next)adapter.select(next)}catch{/* domain keeps its own truth; presentation never invents selection */}
      renderAll();
    }));
    root.querySelectorAll('[data-rel-state]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      const key=(node               ).dataset.relState||null;
      view.stateFilter=view.stateFilter===key?null:key;
      renderAll();
    }));
    root.querySelectorAll('[data-rel-chan]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      const key=(node               ).dataset.relChan       ;
      if(!key)return;
      if(view.channels.has(key))view.channels.delete(key);else view.channels.add(key);
      renderAll();
    }));
    root.querySelectorAll('[data-rel-clear]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      view.query='';view.stateFilter=null;view.channels.clear();
      renderAll();
    }));
    const search=root.querySelector('[data-rel-search]')                         ;
    search?.addEventListener('input',event=>{
      view.query=(event.target                    ).value;
      renderAll();
      const next=($('#domainLeftRegion')                    )?.querySelector('[data-rel-search]')                         ;
      if(next){next.focus();try{next.setSelectionRange(next.value.length,next.value.length)}catch{}}
    });
    const sort=root.querySelector('[data-rel-sort]')                          ;
    sort?.addEventListener('change',event=>{
      event.preventDefault();
      view.sort=((event.target                     ).value||'newest')       ;
      renderAll();
    });
  };
  /** The shared pane hosts keep donor siblings next to the surface region (context lens tabs,
   *  tree furniture). workspace.region() is supposed to neutralise them; when it does not, the
   *  surface hides them directly so no foreign control sits inside this surface's panes. */
  const hideForeignRegionSiblings=()=>{
    const neutralise=(paneId,keepId)=>{
      document.querySelectorAll(`#${paneId} .pbody > *`).forEach(node=>{
        const element=node               ;
        if(element.id===keepId){
          element.hidden=false;
          element.style.removeProperty('display');
          return;
        }
        /* Donor CSS wins over the [hidden] attribute on some siblings (observed on
           #rightPane .contextscope, which renders display:grid while hidden=true), so the
           surface forces the display off as well as the shared hidden/inert intent. */
        element.hidden=true;
        element.style.setProperty('display','none','important');
        element.inert=true;
        element.setAttribute('aria-hidden','true');
      });
    };
    try{neutralise('leftPane','domainLeftRegion');neutralise('rightPane','domainContext')}catch{}
  };
  const bindCenter=()=>{
    const stage=$('#foundationStage');
    if(!stage)return;
    stage.querySelectorAll('[data-rel-tab]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      view.recordsTab=((node               ).dataset.relTab||'files')       ;
      renderCenterOnly();
    }));
    stage.querySelectorAll('[data-rel-problems]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      view.problemsOnly=!view.problemsOnly;
      renderCenterOnly();
    }));
    bindCommon(stage);
  };

  const renderCenterOnly=()=>{
    const stage=$('#foundationStage');
    if(!stage||stage.dataset.m0Composition!=='releases')return false;
    ensureStyle();
    const ctx=buildContext();
    stage.classList.add('rel-stage');
    stage.innerHTML=renderCenter(ctx);
    mark(stage);
    renderedLocale=ctx.locale;
    renderedDir=(globalThis       ).document?.documentElement?.dir||'';
    bindCenter();
    return true;
  };

  const renderAll=()=>{
    const stage=$('#foundationStage'),ws=workspace();
    if(!stage||!ws||stage.dataset.m0Composition!=='releases')return false;
    ensureStyle();
    const ctx=buildContext();
    stage.classList.add('rel-stage');
    stage.innerHTML=renderCenter(ctx);
    mark(stage);
    try{mark(ws.region('LEFT',{html:renderLeft(ctx),label:ctx.locale==='ar'?'الإصدارات':'Releases'}))}catch(error){console.warn('[W05-RELEASES] left region failed',error)}
    try{mark(ws.region('RIGHT',{html:renderRight(ctx),label:ctx.locale==='ar'?'سياق الإصدار الحالي':'Current release context'}))}catch(error){console.warn('[W05-RELEASES] right region failed',error)}
    hideForeignRegionSiblings();
    ensureToolbar(ws,ctx);
    ensureBanner(ctx);
    renderedLocale=ctx.locale;
    renderedDir=(globalThis       ).document?.documentElement?.dir||'';
    bindCenter();
    bindCommon($('#domainLeftRegion'));
    return true;
  };

  const foreignVisible=()=>{
    let found=false;
    document.querySelectorAll('#leftPane .pbody > *,#rightPane .pbody > *').forEach(node=>{
      const keep=node.id==='domainLeftRegion'||node.id==='domainContext';
      const element=node               ;
      if(!keep&&(!element.hidden||getComputedStyle(element).display!=='none'))found=true;
    });
    return found;
  };
  const isStale=()=>{
    const stage=$('#foundationStage');
    if(!stage||stage.dataset.m0Composition!=='releases')return false;
    if(!owned(stage))return true;
    if(!owned($('#domainLeftRegion')))return true;
    if(!owned($('#domainContext')))return true;
    if(foreignVisible())return true;
    if(renderedLocale!==locale())return true;
    const dir=(globalThis       ).document?.documentElement?.dir||'';
    if(renderedDir!==dir)return true;
    if(toolbarNeedsWork())return true;
    if(paneTogglesNeedWork())return true;
    return false;
  };
  /** Shared pane toggles are rewritten by shared syncPaneCSS() in hardcoded Arabic. */
  const paneTogglesNeedWork=()=>{
    try{
      for(const side of ['left','right']         ){
        const dock=document.querySelector(`#${side}LocalReveal`);
        if(!dock)continue;
        const state=(dock               ).dataset.paneState==='collapsed'?'collapsed':'open';
        const span=dock.querySelector('[data-pane-toggle-label]');
        const expected=PANE_TOGGLE_LABELS[side][state][locale()];
        if(span&&span.textContent!==expected)return true;
        if(dock.getAttribute('title')!==expected)return true;
      }
    }catch{}
    return false;
  };
  const staleBreakdown=()=>{
    const stage=$('#foundationStage');
    return {stageOwned:owned(stage),leftOwned:owned($('#domainLeftRegion')),rightOwned:owned($('#domainContext')),foreign:foreignVisible(),
      composition:stage?.dataset?.m0Composition||null,renderedLocale,renderedLocaleNow:locale(),
      renderedDir,dirNow:(globalThis       ).document?.documentElement?.dir||'',toolbarNeedsWork:toolbarNeedsWork(),signature:toolbarSignature};
  };

  let burst=0,burstReset    =null,suspended=false;
  const spendBudget=()=>{
    burst+=1;
    if(!burstReset)burstReset=setTimeout(()=>{burst=0;burstReset=null},300);
    if(burst<=16)return true;
    suspended=true;
    (globalThis       ).__w05ReleaseGovernor={suspended:true,burst,breakdown:staleBreakdown(),at:new Date().toISOString()};
    console.warn('[W05-RELEASES] governor burst guard',JSON.stringify(staleBreakdown()));
    setTimeout(()=>{suspended=false;burst=0},2000);
    return false;
  };
  const run=()=>{
    if(activeRuntime!==self)return;
    if(suspended)return;
    try{
      if(!isStale()){burst=0;return}
      if(!spendBudget())return;
      renderAll();
    }catch(error){console.warn('[W05-RELEASES] governor pass failed',error)}
  };
  const self={id};
  const schedule=()=>{if(governorPending)return;governorPending=true;queueMicrotask(()=>{governorPending=false;run()})};

  const installGovernor=()=>{
    if(typeof document==='undefined'||observerInstalled)return;
    observerInstalled=true;
    activeRuntime=self;
    try{
      const observer=new MutationObserver(schedule);
      observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['lang','dir','data-m0-composition']});
    }catch{}
    setTimeout(run,0);setTimeout(run,150);setTimeout(run,450);
    try{run()}catch{}
  };

  const requestRender=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;try{renderAll()}catch(error){console.warn('[W05-RELEASES] render failed',error)}})};

  return {
    id,view,owner:OWNER,
    get context(){return buildContext()},
    records:()=>RELEASE_RECORDS,
    renderAll,renderCenterOnly,installGovernor,requestRender,
    selectedCandidateId:()=>view.selectedId,
    staleBreakdown
  };
}
