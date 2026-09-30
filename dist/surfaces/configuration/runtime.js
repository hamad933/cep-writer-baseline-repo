/* CONFIGURATION SURFACE RUNTIME — owns the surface's view state, semantic revision commands and
 * the presentation governor that keeps the composed surface in place.
 *
 * Architecture: SHARED MECHANICS (SemanticCommandBus, WorkspaceFoundation regions/toolbar, shared
 * dialog) + SURFACE-SPECIFIC COMPOSITION (revision workspace) + SURFACE-SPECIFIC PRESENTATION
 * (this file + presentation.ts). The shared W05 mount renders a generic typed-collection stage;
 * the governor re-asserts the surface-owned composition whenever shared code rewrites a host, so
 * the surface never degrades into the generic workbench and never fights a re-render loop.
 */

import {SemanticCommandBus} from '../../foundation/global/commands.js';
import {PREFERENCE_DEFINITIONS} from '../../foundation/global/preferences/schema.js';
import {applyDocumentShellLanguage,resolveActiveLocale,resolveActiveDirection} from '../../foundation/global/preferences/language-policy.js';
import {
  projectDraftChanges,summarizeDraft,CONFIGURATION_DOMAINS,DRAFT_OPERATIONAL_PROPOSALS,
  REVISION_TABS,                                                   
} from './revision-model.js';
import {
  injectConfigurationStyle,renderCenter,renderLeft,renderRight,localizeToolbar,toolbarLabelFor,bannerCopy,
  TOOLBAR_COMMANDS,initialViewState,BASE_REVISION,DRAFT_REVISION,NEXT_REVISION,                                       
} from './presentation.js';

                      
const OWNER='ConfigurationRevisionOwner';
const $=(selector       )=>typeof document==='undefined'?null:document.querySelector(selector);
const coerceToPreferenceType=(key       ,value       )=>{
  const definition=(PREFERENCE_DEFINITIONS       )[key];
  if(!definition)return value;
  if(typeof definition.safeDefault==='boolean')return value==='true';
  if(typeof definition.safeDefault==='number')return Number(value);
  return value;
};
const localeNow=()       =>(typeof document!=='undefined'&&document.documentElement.lang==='en')?'en':'ar';

let activeRuntime    =null;

export function createConfigurationRevisionRuntime({adapter,commands}                                          ){
  const id=`w05-configuration-${Math.random().toString(36).slice(2,9)}`;
  const view=initialViewState();
  const validatedKeys=new Set        ();
  const dismissed=new Set        ();
  let lastReceipt            =null;
  let renderedLocale            =null;
  let renderedDir            =null;
  let discardGuard            =null;
  let toolbarSignature='';
  let pending=false;
  let governorPending=false;
  let observerInstalled=false;

  const preferences=()=>{
    const owner=(globalThis       ).CEPFoundation?.preferences;
    return owner&&typeof owner.resolve==='function'?owner:null;
  };
  const workspace=()=>(globalThis       ).CEPFoundation?.workspace||null;

  const allChanges=()              =>projectDraftChanges({preferences:preferences(),adapter,validatedKeys})
    .filter(change=>!dismissed.has(change.key));
  const liveChanges=()=>allChanges().filter(change=>change.kind!=='NO_OP');
  const summary=()             =>summarizeDraft(allChanges());
  const observations=()                  =>{
    try{return adapter.rows().map((row    )=>({key:row.key,presentVersion:row.presentVersion,redactedValue:row.redactedValue,source:row.source,observedAt:row.observedAt,restartRequired:row.restartRequired,state:row.state}))}
    catch{return []}
  };
  const values=()=>{
    const map                      ={};
    const owner=preferences();
    for(const domain of CONFIGURATION_DOMAINS){
      if(domain.kind!=='preference')continue;
      for(const key of domain.keys){
        if(owner){const resolved=owner.resolve(key);map[key]=String(resolved.preferredValue)}
        else{const definition=(PREFERENCE_DEFINITIONS       )[key];map[key]=String(definition?.safeDefault??'—')}
      }
    }
    for(const row of observations())map[row.key]=row.redactedValue;
    return map;
  };
  const validatedCount=()=>liveChanges().filter(change=>change.state==='VALIDATED').length;
  const authorityParked=()=>liveChanges().filter(change=>change.scope==='operational').length;
  const readiness=()=>{
    const total=summary().total;
    if(!total)return 0;
    return Math.min(100,Math.round(100*(validatedCount()+authorityParked())/total));
  };
  const context=()              =>({
    locale:localeNow(),changes:allChanges(),summary:summary(),view,values:values(),observations:observations(),
    readiness:readiness(),validatedCount:validatedCount(),lastReceipt
  });

  /* ── semantic commands (canonical bus) ── */
  const log=(kind       ,text                      )=>{
    const now=new Date();
    view.log=[...view.log,{at:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,kind,text}];
  };
  const applyShell=()=>{const owner=preferences();if(owner)applyDocumentShellLanguage(owner)};
  const requestRender=()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;try{renderAll()}catch(error){console.warn('[W05-CONFIGURATION] render failed',error)}})};

  /** The actual destructive step. Reached only after shared-dialog confirmation. */
  const runDiscard=()=>{
    dismissed.clear();
    for(const change of allChanges())if(change.kind!=='NO_OP')dismissed.add(change.key);
    validatedKeys.clear();
    try{for(const entry of DRAFT_OPERATIONAL_PROPOSALS)adapter.reset(entry.key)}catch{}
    lastReceipt='CHANGES_DISCARDED';
    log('CHANGES_DISCARDED',{ar:'أُلغيت تغييرات المسودة — لا يُعاد ضبط أي إعداد تشغيلي ولا تفضيل',en:'Draft changes discarded — no operational configuration or preference was reset'});
    return {ok:true,code:'CHANGES_DISCARDED',liveConfigMutation:false,factoryReset:false};
  };

  const actions={
    saveDraft(){
      lastReceipt='DRAFT_SAVED';
      log('DRAFT_SAVED',{ar:`حُفظت ${DRAFT_REVISION} محليًا — المسودة غير منشورة حتى الآن`,en:`${DRAFT_REVISION} saved locally — the draft is still unpublished`});
      return {ok:true,code:'DRAFT_SAVED',revision:DRAFT_REVISION,published:false};
    },
    validate(){
      let operationalOk=0,operationalInvalid=0;
      for(const entry of DRAFT_OPERATIONAL_PROPOSALS){
        if(dismissed.has(entry.key))continue;
        try{const proposal=adapter.validate(entry.key);if(proposal?.state==='VALIDATED')operationalOk++;else operationalInvalid++}
        catch{operationalInvalid++}
      }
      for(const change of allChanges())if(change.scope==='preference'&&change.kind!=='NO_OP')validatedKeys.add(change.key);
      const total=summary().total;
      lastReceipt=operationalInvalid?`VALIDATED_WITH_FINDINGS`:`VALIDATED`;
      log('REVISION_VALIDATED',{ar:`تم التحقق من ${validatedCount()} من ${total} تغييرًا — التحقق لا يطابق أبدًا`,en:`Validated ${validatedCount} of ${total} change(s) — validate never applies`});
      return {ok:true,code:lastReceipt,validatedPreference:validatedCount(),operationalOk,operationalInvalid,total};
    },
    compare(){view.tab='diff';return {ok:true,code:'DIFF_OPENED',tab:'diff'}},
    publish(){
      const owner=preferences();
      if(!owner)return {ok:false,code:'PREFERENCES_OWNER_UNAVAILABLE'};
      if(!validatedKeys.size)return {ok:false,code:'VALIDATION_REQUIRED',reason:'Validate the revision before publishing'};
      const applied         =[],rejected         =[];
      for(const change of allChanges()){
        if(change.scope!=='preference'||change.kind==='NO_OP')continue;
        try{owner.set(change.key,coerceToPreferenceType(change.key,change.to),'global');applied.push(change.key)}
        catch{rejected.push(change.key)}
      }
      let authorityPending=0;
      for(const entry of DRAFT_OPERATIONAL_PROPOSALS){
        if(dismissed.has(entry.key))continue;
        try{const result=adapter.requestApply(entry.key);if(!result?.ok)authorityPending++}catch{authorityPending++}
      }
      validatedKeys.clear();
      (globalThis       ).CEPFoundation?.workspace?.applyPreferences?.();
      applyShell();
      lastReceipt=applied.length?`PUBLISHED_${applied.length}`:'NOTHING_PUBLISHED';
      log('REVISION_PUBLISHED',{ar:`نُشر ${NEXT_REVISION}: ${applied.length} تفضيلًا عبر ScopedPreferencesOwner · ${authorityPending} تشغيليًا بقي خلف السلطة`,en:`Published ${NEXT_REVISION}: ${applied.length} preference(s) through ScopedPreferencesOwner · ${authorityPending} operational change(s) stayed authority-parked`});
      return {ok:applied.length>0,code:lastReceipt,applied,rejected,authorityPending,operationalApplied:false};
    },
    discard(){
      const live=liveChanges();
      if(live.length&&discardGuard!=='confirmed'){
        const ws=workspace();
        if(ws&&typeof ws.dialog==='function'){
          const locale=localeNow();
          try{
            const title=locale==='ar'?'إلغاء تغييرات المسودة':'Discard draft changes';
            const body=`<p>${locale==='ar'
              ?`سيُزال ${live.length} تغييرًا من ${DRAFT_REVISION}. لا يُعاد ضبط أي إعداد تشغيلي ولا أي تفضيل منشور — الإلغاء يمسّ المسودة فقط.`
              :`${live.length} change(s) will be removed from ${DRAFT_REVISION}. No operational configuration and no published preference is reset — discarding touches the draft only.`}</p>`
              +`<div class="dialogfoot"><button type="button" class="btn" data-cfg-discard-cancel>${locale==='ar'?'تراجع':'Cancel'}</button>`
              +`<button type="button" class="btn" data-cfg-discard-confirm>${locale==='ar'?'إلغاء التغييرات':'Discard changes'}</button></div>`;
            ws.dialog(title,body,{onMount:(backdrop)=>{
              backdrop.querySelector('[data-cfg-discard-cancel]')?.addEventListener('click',event=>{event.preventDefault();ws.closeDialog('discard-cancelled')});
              backdrop.querySelector('[data-cfg-discard-confirm]')?.addEventListener('click',event=>{
                event.preventDefault();
                ws.closeDialog('discard-confirmed');
                discardGuard='confirmed';
                const result=actions.discard();
                discardGuard=null;
                ws.status?.(locale==='ar'?'أُلغيت تغييرات المسودة — لا تفضيل ولا إعداد تشغيلي أُعيد ضبطه':'Draft changes discarded — no preference or operational configuration was reset','info');
                requestRender();
                return result;
              });
            }});
            return {ok:false,code:'CONFIRMATION_REQUIRED',pendingChanges:live.length,destructive:true};
          }catch(error){/* fall through to the unguarded path if the shared dialog is unavailable */}
        }
      }
      return runDiscard();
    },
    selectDomain(domainId       ){if(!CONFIGURATION_DOMAINS.some(domain=>domain.id===domainId))return false;view.selectedDomain=domainId;return true},
    setTab(tab            ){if(!REVISION_TABS.includes(tab))return false;view.tab=tab;return true},
    setFilter(filter                                 ){view.filter=filter;return true},
    setQuery(query       ){view.query=String(query||'');return true},
    gotoLog(){view.tab='log';return true}
  };

  const register=()=>{
    const def=(id       ,label       ,run        ,available                   )=>{
      try{commands.registerCommand(id,OWNER,label,()=>{const result=run();requestRender();return result},available)}catch{/* already registered */}
    };
    def('configuration.saveDraft','Save draft',actions.saveDraft,()=>true);
    def('configuration.validateRevision','Validate revision',actions.validate,()=>liveChanges().length?true:'No draft changes to validate');
    def('configuration.compare','Compare revisions',actions.compare,()=>true);
    def('configuration.publish','Publish revision',actions.publish,()=>validatedKeys.size?true:'Validate the revision before publishing');
    def('configuration.discardRevision','Discard changes',actions.discard,()=>liveChanges().length?true:'No draft changes to discard');
  };
  register();

  /* ── rendering ── */
  const mark=(host             )=>{
    const element=host?.firstElementChild||null;
    if(!element)return false;
    element.setAttribute('data-w05-owned','configuration');
    (element       ).__w05Runtime=id;
    return true;
  };
  const owned=(host             )=>{
    const element=host?.firstElementChild||null;
    return Boolean(element&&element.getAttribute('data-w05-owned')==='configuration'&&(element       ).__w05Runtime===id);
  };
  const ensureStyle=()=>{try{injectConfigurationStyle()}catch{}};

  const toolbarNeedsWork=(ctx              )=>{
    const host=$('#domainToolbar');
    if(!host)return true;
    const nodes=[...host.querySelectorAll('[data-foundation-command]')]                 ;
    for(const command of TOOLBAR_COMMANDS){
      const node=nodes.find(item=>item.dataset.foundationCommand===command);
      if(!node)return true;
      const label=toolbarLabelFor(command,ctx.locale);
      if(label&&node.textContent!==label)return true;
    }
    return false;
  };
  const ensureToolbar=(ws    ,ctx              )=>{
    const host=$('#domainToolbar');
    if(!host)return;
    /* Re-render the toolbar only when its command set is foreign or when the draft state that the
       enable/disable depends on has changed. Re-rendering on every check would un-localise the
       labels, which mutates the DOM, which re-runs the governor — an infinite loop. */
    const signature=`${ctx.locale}|${ctx.validatedCount}|${ctx.summary.total}|${ctx.summary.publishable}|${view.selectedDomain}`;
    if(signature!==toolbarSignature||toolbarNeedsWork(ctx)){
      try{ws.toolbar([...TOOLBAR_COMMANDS],{contextProvider:()=>({surface:'configuration',revision:DRAFT_REVISION,domain:view.selectedDomain})})}catch{}
      toolbarSignature=signature;
    }
    localizeToolbar(host,ctx.locale);
  };
  const ensureBanner=(ctx              )=>{
    const copy=bannerCopy(ctx.locale);
    const title=$('#topBanner .title');
    if(title&&title.textContent!==copy.title)title.textContent=copy.title;
    const lock=$('#topBanner .lock span');
    if(lock&&lock.textContent!==copy.detail)lock.textContent=copy.detail;
    const badge=$('#topBanner .badge');
    if(badge&&badge.textContent!==copy.badge)badge.textContent=copy.badge;
  };

  const bindCenter=(ctx              )=>{
    const stage=$('#foundationStage');
    if(!stage)return;
    stage.querySelectorAll('[data-cfg-domain]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      if(actions.selectDomain((node               ).dataset.cfgDomain||''))renderAll();
    }));
    stage.querySelectorAll('[data-cfg-tab]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      if(actions.setTab(((node               ).dataset.cfgTab||'diff')               ))renderCenterOnly();
    }));
    stage.querySelectorAll('[data-cfg-goto]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      if(actions.gotoLog())renderCenterOnly();
    }));
    const filter=stage.querySelector('[data-cfg-filter]')                          ;
    filter?.addEventListener('change',event=>{
      event.preventDefault();
      actions.setFilter(((event.target                     ).value||'all')       );
      renderCenterOnly();
    });
    const search=stage.querySelector('[data-cfg-search]')                         ;
    search?.addEventListener('input',event=>{
      actions.setQuery((event.target                    ).value);
      renderCenterOnly();
      const next=($('#foundationStage')                    )?.querySelector('[data-cfg-search]')                         ;
      if(next){next.focus();try{next.setSelectionRange(next.value.length,next.value.length)}catch{}}
    });
  };

  const renderCenterOnly=()=>{
    const stage=$('#foundationStage');
    const ws=workspace();
    if(!stage||!ws||stage.dataset.m0Composition!=='configuration')return false;
    ensureStyle();
    const ctx=context();
    stage.classList.add('cfg-stage');
    stage.innerHTML=renderCenter(ctx);
    mark(stage);
    renderedLocale=ctx.locale;renderedDir=(globalThis       ).document?.documentElement?.dir||'';
    bindCenter(ctx);
    return true;
  };

  const renderAll=()=>{
    const stage=$('#foundationStage');
    const ws=workspace();
    if(!stage||!ws||stage.dataset.m0Composition!=='configuration')return false;
    ensureStyle();
    const ctx=context();
    stage.classList.add('cfg-stage');
    stage.innerHTML=renderCenter(ctx);
    mark(stage);
    const leftLabel=ctx.locale==='ar'?'الإعداد التشغيلي':'Configuration';
    const rightLabel=ctx.locale==='ar'?'مسودة الإصدار':'Revision draft';
    try{mark(ws.region('LEFT',{html:renderLeft(ctx),label:leftLabel}))}catch(error){console.warn('[W05-CONFIGURATION] left region failed',error)}
    try{mark(ws.region('RIGHT',{html:renderRight(ctx),label:rightLabel}))}catch(error){console.warn('[W05-CONFIGURATION] right region failed',error)}
    ensureToolbar(ws,ctx);
    ensureBanner(ctx);
    renderedLocale=ctx.locale;
    renderedDir=(globalThis       ).document?.documentElement?.dir||'';
    bindCenter(ctx);
    bindLeft();
    return true;
  };
  const bindLeft=()=>{
    const host=$('#domainLeftRegion');
    host?.querySelectorAll('[data-cfg-domain]').forEach(node=>node.addEventListener('click',event=>{
      event.preventDefault();
      if(actions.selectDomain((node               ).dataset.cfgDomain||''))renderAll();
    }));
  };

  const isStale=()=>{
    const ws=workspace();
    if(!ws)return false;
    const stage=$('#foundationStage');
    if(!stage||stage.dataset.m0Composition!=='configuration')return false;
    if(!owned(stage))return true;
    if(!owned($('#domainLeftRegion')))return true;
    if(!owned($('#domainContext')))return true;
    const locale=localeNow();
    if(renderedLocale!==locale)return true;
    const dir=(globalThis       ).document?.documentElement?.dir||'';
    if(renderedDir!==dir)return true;
    if(toolbarNeedsWork(context()))return true;
    return false;
  };
  /** Diagnostic breakdown used by the burst guard and by evidence. */
  const staleBreakdown=()=>{
    const stage=$('#foundationStage');
    return {stageOwned:!!owned(stage),leftOwned:!!owned($('#domainLeftRegion')),rightOwned:!!owned($('#domainContext')),
      composition:stage?.dataset?.m0Composition||null,renderedLocale,renderedLocaleNow:localeNow(),
      renderedDir,dirNow:(globalThis       ).document?.documentElement?.dir||'',
      toolbarNeedsWork:toolbarNeedsWork(context()),signature:toolbarSignature};
  };
  /* Burst guard: a governor that re-renders on every mutation would starve the event loop
     (microtask chains never yield). Cap consecutive renders inside one macrotask turn; when the
     cap trips, stop, record WHY the surface still looked stale, and let the loop recover. */
  let burst=0,burstReset    =null,suspended=false;
  const spendBudget=()=>{
    burst+=1;
    if(!burstReset)burstReset=setTimeout(()=>{burst=0;burstReset=null},300);
    if(burst<=16)return true;
    suspended=true;
    const breakdown=staleBreakdown();
    (globalThis       ).__w05Governor={suspended:true,burst,breakdown,at:new Date().toISOString()};
    console.warn('[W05-CONFIGURATION] governor burst guard',JSON.stringify(breakdown));
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
    }catch(error){console.warn('[W05-CONFIGURATION] governor pass failed',error)}
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

  const runtime={
    id,view,actions,
    get changes(){return allChanges()},
    get summary(){return summary()},
    context,renderAll,installGovernor,
    preferenceAuthority:()=>{const owner=preferences();return owner?{locale:resolveActiveLocale(owner),direction:resolveActiveDirection(owner)}:null}
  };
  return runtime;
}
