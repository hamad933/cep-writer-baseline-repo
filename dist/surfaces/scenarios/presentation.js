import {SpatialView} from '../../foundation/spatial.js';
import {activeLocale,pickText} from './i18n.js';
                                              
import {ensureScenarioStyle} from './styles.js';
import {renderStructure} from './structure.js';
import {renderInspector} from './inspector.js';
import {renderBoardBody,topologyGraph} from './views.js';
import {countText,esc,icon,kindLabel,nextId,phaseNumber,stateBlock} from './util.js';

/* ------------------------------------------------------------------ truth objects */

/**
 * Environment binding used by this workbench.
 *
 * The scenario definition declares REQUIRED capabilities (`environment.capabilities`); a
 * binding is a separate, explicitly-labelled truth (`environmentRequirementsDistinctFromBinding`).
 * This surface binds the local training environment that ships with the representative draft
 * scenario, so Validate → Publish Revision → Prepare Run are genuinely reachable. It never
 * claims provider truth: `provider` and `classification` are rendered verbatim in the
 * inspector, and `scenarios.prepare` still reports `runStarted:false` — preparing freezes the
 * run input manifest, it never starts a run.
 */
export const SCENARIO_ENVIRONMENT_BINDING=Object.freeze({
  provider:'LOCAL_TRAINING_ENVIRONMENT_FIXTURE',
  classification:'FIXTURE_BINDING__NOT_PROVIDER_TRUTH',
  capabilities:Object.freeze(['SIM_NET','WEB_TIER','SIEM_FEED']),
  labRevision:'LAB-SQLI-01@2'
});

export const scenarioValidationContext=()=>{
  const capabilities=[...SCENARIO_ENVIRONMENT_BINDING.capabilities];
  return {
    binding:{capabilities,provider:SCENARIO_ENVIRONMENT_BINDING.provider,classification:SCENARIO_ENVIRONMENT_BINDING.classification},
    availableCapabilities:capabilities,
    resolveLab:(ref    )=>String(ref?.id||'')==='LAB-SQLI-01'&&String(ref?.revision||'')==='2'
  };
};

/** Scenario-level references (real corpus Knowledge Units linked by this draft scenario). */
const SCENARIO_KNOWLEDGE_UNITS=[
  {id:'KU-D03-0001',title:'Authentication Protocol Ceremonies and Trust Boundaries',relation:'Detection · trust-boundary rationale'},
  {id:'KU-D09-0002',title:'KU-D09-0002 — Incident identification and scoping',relation:'Response · scoping and containment'}
];

const VIEWS=['timeline','flow','topology','canvas']         ;
const EXTRA_TOOLS=['task','rule','observability','completion']         ;

                     
                              
              
               
                        
                        
                     
                                        
                            
 

const foundation=()=>(globalThis       ).CEPFoundation||null;

/* ------------------------------------------------------------------ mount */

export function mountScenarioTimelineIdentity(composition    ){
  if(typeof document==='undefined'||!composition?.domain)return null;
  const doc=document.querySelector('#centerPane .docscroll');if(!doc)return null;
  let host=document.querySelector('#m0StructuredSpatial')                    ;
  if(!host){host=document.createElement('section');host.id='m0StructuredSpatial';host.className='m0-structured-spatial';doc.prepend(host)}
  host.dataset.m0StructuredStudio='true';

  const domain=composition.domain,bus=composition.bus;
  const validationContext=scenarioValidationContext();
  const state           ={view:'timeline',tool:'select',facet:'overview',facetItem:null,
    collapsed:new Set(['injects','decisions','modules','tasks','rules','observability','completion','knowledge','labs']),
    endpoints:[],status:null,scrollToPhase:null};
  let topology                 =null;
  let chromeInstalled=false;
  let commandLocale                    =null;
  let documentBound=false;

  const relations=()=>{try{return composition?.shared?.spatialRelation?.project?.()||[]}catch{return []}};
  const availability=(id       )=>{
    try{
      const value=bus.availability(id,validationContext);
      if(value===true)return {enabled:true,reason:''};
      if(value===false)return {enabled:false,reason:''};
      return {enabled:value?.enabled!==false,reason:String(value?.reason||value?.code||'')};
    }catch{return {enabled:false,reason:''}}
  };
  const setStatus=(tone       ,text       )=>{state.status={tone,text}};

  const targetPhase=(projection    )=>{
    const phases=projection.phases||[];
    const selected=domain.selectionContext();
    const fromSelection=selected?.kind==='phase'?selected.id:selected?.phaseId;
    return phases.find((p    )=>p.id===fromSelection)||phases[0]||null;
  };

  const addElement=(kind       ,phaseId            )=>{
    const projection=domain.studioProjection();
    const phase=phaseId||(targetPhase(projection)?.id||null);
    if(!phase){setStatus('error',pickText(activeLocale()).emptyHint);render();return}
    const phases=projection.phases||[];
    const bucket=phases.flatMap((p    )=>p.elements||[]);
    const id=nextId(String(kind).toUpperCase().slice(0,3),bucket);
    const title=`${kindLabel(kind,pickText(activeLocale()))} ${bucket.filter((e    )=>e.kind===kind).length+1}`;
    const element    ={id,kind,title};
    if(kind==='decision')element.condition=pickText(activeLocale()).condition;
    if(kind==='lab')element.labRef={id:'LAB-SQLI-01',revision:'2'};
    if(kind==='observability')element.channel='Simulated SIEM';
    try{
      const result=bus.execute('scenarios.author',{op:'addElement',phaseId:phase,element,route:'scenarios-workbench'});
      if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
      else{
        const phaseName=String(phases.find((p    )=>p.id===phase)?.name||phase).replace(/^\d+\s*/,'');
        setStatus('ok',pickText(activeLocale()).stElementAdded.replace('{kind}',kindLabel(kind,pickText(activeLocale()))).replace('{phase}',phaseName));
      }
    }catch(error    ){setStatus('error',String(error?.message||error))}
    state.facet='selection';state.facetItem=null;render();
  };

  const addPhase=()=>{
    const projection=domain.studioProjection();
    const id=nextId('PHASE',projection.phases||[]);
    const number=(projection.phases||[]).length+1;
    const name=activeLocale()==='ar'?`مرحلة ${number}`:`Phase ${number}`;
    try{
      const result=bus.execute('scenarios.author',{op:'addPhase',phase:{id,name,elements:[]},route:'scenarios-workbench'});
      if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
      else setStatus('ok',pickText(activeLocale()).stPhaseAdded);
    }catch(error    ){setStatus('error',String(error?.message||error))}
    state.scrollToPhase=id;render();
  };

  const selectPhase=(id       )=>{domain.select({kind:'phase',id});state.facet='selection';state.facetItem=null;state.scrollToPhase=id;render()};
  const selectElement=(id       )=>{domain.select({kind:'element',id});state.facet='selection';state.facetItem=null;render()};

  const nodeClick=(id       )=>{
    if(state.tool==='connect'){
      if(!state.endpoints.length){state.endpoints=[id];selectElement(id);setStatus('accent',pickText(activeLocale()).stConnectSource);render();return}
      const [source]=state.endpoints;
      if(source===id){state.endpoints=[];setStatus('error',pickText(activeLocale()).stConnectBlocked.replace('{reason}',pickText(activeLocale()).select));render();return}
      commitRelation(source,id);
      return;
    }
    selectElement(id);
  };

  const commitRelation=(source       ,target       )=>{
    const adapter=composition?.shared?.spatialRelation;
    const t=pickText(activeLocale());
    if(!adapter){state.endpoints=[];setStatus('error',t.stConnectBlocked.replace('{reason}','UNBOUND'));render();return}
    try{
      const projection=domain.studioProjection();
      adapter.nodes=(projection.phases||[]).flatMap((p    )=>(p.elements||[]).map((e    )=>({id:e.id,label:e.title||e.id})));
      const check=adapter.connectionAvailability([source,target],'author');
      if(check.enabled===false){state.endpoints=[];setStatus('error',t.stConnectBlocked.replace('{reason}',String(check.reason||check.code||'')));render();return}
      adapter.commit({source,target,type:'connects',direction:'directed',expectedVersion:adapter.version});
      const label=(pid       )=>{for(const p of projection.phases||[])for(const e of p.elements||[])if(e.id===pid)return e.title||pid;return pid};
      state.endpoints=[];
      setStatus('ok',t.stConnected.replace('{a}',label(source)).replace('{b}',label(target)));
    }catch(error    ){state.endpoints=[];setStatus('error',t.stConnectBlocked.replace('{reason}',String(error?.message||error)))}
    render();
  };

  const runCommand=(id       ,payload    ,okText       )=>{
    try{
      const result=bus.execute(id,payload);
      if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
      else if(result?.validation&&result.validation.ok===false)setStatus('error',result.code||'');
      else setStatus('ok',okText);
    }catch(error    ){setStatus('error',String(error?.message||error))}
    render();
  };

  const exportSummary=()=>{
    const t=pickText(activeLocale()),p=domain.studioProjection();
    const lines=[`${p.title} · ${p.identity.id}@${p.identity.revision} · ${p.lifecycle}`];
    (p.phases||[]).forEach((phase    ,i       )=>{
      lines.push(`${phaseNumber(phase,i)} ${String(phase.name||phase.id).replace(/^\d+\s*/,'')}`);
      (phase.elements||[]).forEach((e    )=>lines.push(`   · [${kindLabel(String(e.kind||'event'),t)}] ${e.title||e.id}`));
    });
    const text=lines.join('\n');
    const done=(ok        )=>{setStatus(ok?'ok':'error',ok?t.stExported:t.stExportBlocked);render()};
    try{
      const clip=(navigator       )?.clipboard;
      if(clip?.writeText)clip.writeText(text).then(()=>done(true),()=>done(false));
      else{setStatus('error',t.stExportBlocked);render()}
    }catch{setStatus('error',t.stExportBlocked);render()}
  };

  const action=(name       )=>{
    const t=pickText(activeLocale());
    if(name==='validate'){
      const result=bus.execute('scenarios.validate',validationContext);
      const passed=(result?.requirements||[]).filter((r    )=>r.status==='PASS').length;
      setStatus(result?.ok===false?'error':'ok',result?.ok===false?t.stValidationFailed.replace('{n}',String((result?.requirements||[]).length-passed)):t.stValidated.replace('{n}',String(passed)));
      render();return;
    }
    if(name==='publish')return runCommand('scenarios.publish',{validationContext,route:'scenarios-workbench'},t.stPublished);
    if(name==='prepare')return runCommand('scenarios.prepare',{...validationContext,route:'scenarios-workbench'},t.stPrepared);
    if(name==='revise')return runCommand('scenarios.revise',{expectedVersion:domain.version,route:'scenarios-workbench'},t.stRevised);
    if(name==='export')return exportSummary();
    if(name==='clear'){domain.select(null);state.facet='overview';state.facetItem=null;state.endpoints=[];setStatus('accent',t.stCleared);render();return}
  };

  /* ---------------------------------------------------------------- panes + shell chrome */

  const localizeChrome=(t    )=>{
    const set=(selector       ,value       )=>{const node=document.querySelector(selector);if(node&&value)node.textContent=value};
    set('#bottomShelf .bottomtitle',t.bottomTitle);
    set('#bottomSummary',t.bottomSummary);
    set('#leftLocalReveal [data-pane-toggle-label]',t.hideStructure);
    set('#rightLocalReveal [data-pane-toggle-label]',t.showContext);
    const banner=document.querySelector('#topBanner');
    if(banner){
      set('#topBanner .title',t.banner);
      set('#topBanner .badge',t.bannerBadge);
      set('#topBanner .lock span',t.bannerLock);
    }
  };

  /**
   * The shell's LEFT/RIGHT region hosts hide their siblings once (workspace.region). Shared
   * code can re-reveal the generic donor panes afterwards (context-inspector re-render,
   * inspector restore), which would leak Library donor semantics and a second, generic
   * composition into this surface. Re-apply the product's own neutral carrier policy for
   * SCENARIOS only, and keep it asserted with a terminating MutationObserver. No shared file
   * is modified; only this surface's pane siblings are suppressed.
   */
  const suppressPaneSiblings=()=>{
    if(typeof document==='undefined')return;
    document.querySelectorAll('#rightPane .pbody > :not(#domainContext),#leftPane .pbody > :not(#domainLeftRegion)').forEach(node=>{
      if(node.hidden&&node.getAttribute('aria-hidden')==='true')return;
      node.hidden=true;node.inert=true;node.setAttribute('aria-hidden','true');(node               ).dataset.donorSemantic='suppressed';
    });
  };
  const paneObservers                   =[];   /* strong refs: observers must not be collected */
  const observePanes=()=>{
    if(paneObservers.length||typeof MutationObserver==='undefined')return;
    ['#rightPane .pbody','#leftPane .pbody'].forEach(selector=>{
      const pbody=document.querySelector(selector);if(!pbody)return;
      const observer=new MutationObserver(()=>suppressPaneSiblings());
      observer.observe(pbody,{subtree:true,attributes:true,attributeFilter:['hidden','aria-hidden','inert','style','class']});
      paneObservers.push(observer);
    });
  };

  const renderPanes=(projection    ,selection    ,validation    ,t    ,locale       )=>{
    const ws=foundation()?.workspace;
    if(!ws)return;
    const knowledge=SCENARIO_KNOWLEDGE_UNITS;
    const labRefs      =[];
    (projection.phases||[]).forEach((phase    )=>(phase.elements||[]).forEach((e    )=>{
      if(e.labRef&&!labRefs.some(l=>l.id===e.labRef.id&&l.revision===e.labRef.revision))
        labRefs.push({id:e.labRef.id,revision:e.labRef.revision,available:Boolean(validationContext.resolveLab(e.labRef))});
    }));
    const structureCtx={t,projection,locale,facet:state.facet,collapsed:state.collapsed,
      selectedId:selection?.id&&selection?.kind!=='scenario'?selection.id:null,
      selectedPhaseId:selection?.kind==='phase'?selection.id:selection?.phaseId||null,
      knowledgeUnits:knowledge,labRefs};
    const inspectorCtx={t,projection,selection,facet:state.facet,facetItem:state.facetItem,validation,
      validationStatus:String(domain.validationStatus||'UNVALIDATED'),
      binding:SCENARIO_ENVIRONMENT_BINDING,locale,knowledgeUnits:knowledge,labRefs,
      selectedPhaseId:selection?.kind==='phase'?selection.id:selection?.phaseId||null};
    try{
      ws.region('LEFT',{html:renderStructure(structureCtx),label:t.structure});
      ws.region('RIGHT',{html:renderInspector(inspectorCtx),label:t.inspector});
    }catch(error){if(typeof console!=='undefined')console.warn('scenario region projection',error)}
    suppressPaneSiblings();
    const donor=document.querySelector('#editorDocument');
    if(donor&&!donor.hidden){donor.hidden=true;donor.setAttribute('aria-hidden','true');donor.dataset.donorSemantic='suppressed'}
    localizeChrome(t);
    localizeCommandLabels(t,locale,ws);
  };

  /**
   * This surface OWNS its semantic command registrations, so their labels are localized too:
   * no English-only button survives in an Arabic session. Labels are mutated on the commands
   * this domain owns (never another surface's), and the shell toolbar is refreshed only when
   * the active locale actually changed.
   */
  const localizeCommandLabels=(t    ,locale               ,ws    )=>{
    if(commandLocale===locale)return;
    commandLocale=locale;
    try{
      const map=(bus       )?.commands;
      if(map&&typeof map.get==='function'){
        const labels    ={ 'scenarios.author':t.cmdAuthor,'scenarios.revise':t.cmdRevise,'scenarios.validate':t.cmdValidate,'scenarios.publish':t.cmdPublish,'scenarios.prepare':t.cmdPrepare };
        for(const [id,label] of Object.entries(labels)){
          const command=map.get(id);
          if(command&&command.owner===domain.owner&&typeof label==='string')command.label=label;
        }
      }
      ws?.refreshToolbar?.();
    }catch(error){if(typeof console!=='undefined')console.warn('scenario command labels',error)}
  };

  const installShell=()=>{
    const ws=foundation()?.workspace;
    if(!ws){return false}
    if(!chromeInstalled){
      try{
        ws.toolbar(['scenarios.author','scenarios.revise']);
        ws.bindToolbarContext({contextProvider:()=>validationContext});
      }catch(error){if(typeof console!=='undefined')console.warn('scenario toolbar binding',error)}
      chromeInstalled=true;
      try{
        const inspector=foundation()?.wave3Assembly?.contextInspector;
        if(inspector?.snapshot?.().open)inspector.close('scenarios-local-inspector',{restore:false});
        foundation()?.wave3Assembly?.renderContext?.();
      }catch(error){if(typeof console!=='undefined')console.warn('scenario context handover',error)}
      observePanes();
      try{
        const donor=document.querySelector('#editorDocument');
        if(donor){donor.hidden=true;donor.setAttribute('aria-hidden','true');donor.dataset.donorSemantic='suppressed'}
      }catch{}
    }
    const original=ws.onPreferences;
    ws.onPreferences=(preferences    )=>{try{original?.(preferences)}catch{};render()};
    return true;
  };

  /* ---------------------------------------------------------------- board render */

  /** Keyboard focus must survive a re-render (R7: focus is always visible and follows order). */
  const FOCUS_ATTRS=['data-node','data-element','data-facet-item','data-phase','data-view','data-tool','data-action','data-menu','data-add-to','data-group','data-facet'];
  const focusKey=(element             )=>{
    if(!element||element===document.body)return null;
    for(const attr of FOCUS_ATTRS){
      const value=element.getAttribute?.(attr);
      if(value!==null&&value!==undefined)return `[${attr}="${value.replace(/"/g,'\\\"')}"]`;
    }
    return null;
  };

  const render=()=>{
    const active=document.activeElement                ;
    const restoreKey=(active&&active!==document.body&&(active.closest('#m0StructuredSpatial,#domainLeftRegion,#domainContext')))?focusKey(active):null;
    const locale=activeLocale(),t=pickText(locale);
    const projection=domain.studioProjection();
    const selection=domain.selectionContext();
    const validation=domain.validate(validationContext);
    const phases=projection.phases||[];
    const elementCount=phases.reduce((n       ,p    )=>n+(p.elements?.length||0),0);
    const selectedPhaseId=selection?.kind==='phase'?selection.id:selection?.phaseId||null;
    const relationList=relations();
    const published=projection.lifecycle==='PUBLISHED';
    const passedChecks=(validation.requirements||[]).filter((r    )=>r.status==='PASS').length;
    const lifecycleStatus=domain.validationStatus;
    const statusText=state.status?state.status.text:
      lifecycleStatus==='VALIDATED'?t.stValidated.replace('{n}',String(passedChecks)):
      lifecycleStatus==='VALIDATION_FAILED'?t.stValidationFailed.replace('{n}',String((validation.requirements||[]).length-passedChecks)):t.notStarted;
    const statusTone=state.status?state.status.tone:(lifecycleStatus==='VALIDATED'?'ok':lifecycleStatus==='VALIDATION_FAILED'?'error':'');

    const viewCtx={t,projection,selectedId:selection?.kind!=='scenario'&&selection?.kind!=='phase'?selection?.id:null,
      selectedPhaseId,relations:relationList,locale};

    const tabs=VIEWS.map(view=>`<button type="button" class="w03-tab" role="tab" data-view="${view}" aria-selected="${state.view===view}">${esc(t[view])}</button>`).join('');
    const lifecycleActions=[['validate','shield',t.validate],['publish','check',t.publish],['prepare','lab',t.prepare]].map(([id,glyph,label])=>{
      const a=availability(`scenarios.${id}`);
      /* published revisions are immutable: publish is a completed action, not a live one */
      const enabled=a.enabled&&!(id==='publish'&&published);
      const reason=id==='publish'&&published?t.alreadyPublished:a.reason;
      return `<button type="button" class="w03-btn" data-action="${id}" ${enabled?'':'disabled'} title="${esc(reason)}">${icon(glyph)}${esc(label)}</button>`;
    }).join('');
    const palette=[['select','focus',t.select],['phase','plus',t.addPhase],['event','note',t.addEvent],['inject','edit',t.addInject],
      ['decision','move',t.addDecision],['lab','lab',t.addLab]].map(([id,glyph,label])=>
      `<button type="button" class="w03-btn" data-tool="${id}" ${id==='select'?`aria-pressed="${state.tool==='select'}"`:''}>${icon(glyph)}${esc(label)}</button>`).join('');

    host.innerHTML=`<section class="w03-scen" data-w03-surface="scenarios" aria-label="${esc(t.ariaBoard)}">
      <div class="w03-bar">
        <div class="w03-tabs" role="tablist" aria-label="${esc(t.ariaToolbar)}">${tabs}</div>
        <div class="w03-bar-actions">
          ${lifecycleActions}
          <div class="w03-menuwrap">
            <button type="button" class="w03-btn" data-shape="icon" data-menu="lifecycle" aria-haspopup="true" aria-expanded="false" aria-label="${esc(t.more)}" title="${esc(t.more)}">${icon('more')}</button>
            <div class="w03-menu" data-menu-panel="lifecycle" role="menu" hidden>
              <button type="button" role="menuitem" data-action="revise">${icon('redo')}${esc(t.revise)}</button>
              <button type="button" role="menuitem" data-action="export">${icon('copy')}${esc(t.exportSummary)}</button>
              <button type="button" role="menuitem" data-action="clear">${icon('close')}${esc(t.clearSelection)}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="w03-palette" role="toolbar" aria-label="${esc(t.ariaPalette)}">
        ${palette}
        <span class="w03-sep" aria-hidden="true"></span>
        <button type="button" class="w03-btn" data-tool="connect" aria-pressed="${state.tool==='connect'}">${icon('link')}${esc(t.connect)}</button>
        <span class="w03-sep" aria-hidden="true"></span>
        <div class="w03-menuwrap">
          <button type="button" class="w03-btn" data-shape="icon" data-menu="authoring" aria-haspopup="true" aria-expanded="false" aria-label="${esc(t.more)}" title="${esc(t.more)}">${icon('more')}</button>
          <div class="w03-menu" data-menu-panel="authoring" role="menu" hidden>
            ${EXTRA_TOOLS.map(kind=>`<button type="button" role="menuitem" data-tool="${kind}">${icon(kind==='task'?'list':kind==='rule'?'shield':kind==='observability'?'focus':'check')}${esc(({task:t.addTask,rule:t.addRule,observability:t.addObservability,completion:t.addCompletion}       )[kind])}</button>`).join('')}
          </div>
        </div>
      </div>
      <article class="w03-board" aria-label="${esc(t.ariaBoard)}">
        <header class="w03-board-head">
          <h2><bdi dir="auto">${esc(projection.title||'Untitled Scenario')}</bdi></h2>
          <span class="w03-pill" data-tone="ok">${esc(published?t.revision:t.draftRevision)} <bdi dir="ltr">${esc(projection.identity?.revision||'1')}</bdi></span>
          <span class="w03-pill" data-tone="${published?'accent':'warn'}"><bdi dir="ltr">${esc(projection.lifecycle||'DRAFT')}</bdi></span>
          <div class="w03-board-meta"><span><b>${esc(countText(phases.length,'phase',locale))}</b> · <b>${esc(countText(elementCount,'element',locale))}</b> · ${esc(`${relationList.length} ${t.links}`)}</span></div>
        </header>
        ${renderBoardBody(state.view,{t,projection,selectedId:viewCtx.selectedId,selectedPhaseId,relations:relationList,locale})}
        <footer class="w03-legend">
          <strong>${esc(t.legend)}</strong>
          <span class="w03-key"><span class="line" aria-hidden="true"></span>${esc(t.sequence)}</span>
          <span class="w03-key"><span class="line dash" aria-hidden="true"></span>${esc(t.conditional)}</span>
          <span class="w03-status" data-tone="${esc(statusTone)}" role="status">${esc(statusText)}</span>
        </footer>
      </article>
    </section>`;
    ensureScenarioStyle(host);
    renderPanes(projection,selection,validation,t,locale);
    bind(host,projection,locale);
    mountTopology(host,projection,relationList);
    if(state.scrollToPhase){
      const row=host.querySelector(`[data-phase-row="${CSS.escape(state.scrollToPhase)}"]`);
      row?.scrollIntoView({block:'nearest'});
      state.scrollToPhase=null;
    }
    if(restoreKey){
      const target=document.querySelector(restoreKey)                    ;
      if(target&&target!==document.activeElement&&typeof target.focus==='function')target.focus({preventScroll:true});
    }
  };

  const mountTopology=(root            ,projection    ,relationList      )=>{
    topology=null;
    if(state.view!=='topology')return;
    const target=root.querySelector('[data-topology]')                    ;
    if(!target)return;
    const {nodes,edges}=topologyGraph(projection,relationList);
    if(!nodes.length){target.innerHTML=stateBlock(pickText(activeLocale()).empty,pickText(activeLocale()).emptyHint);return}
    topology=new SpatialView(target,nodes,edges,{
      select:(ids         )=>{const raw=ids.at(-1);if(!raw)return;if(raw.startsWith('phase:'))domain.select({kind:'phase',id:raw.slice(6)});else domain.select({kind:'element',id:raw});state.facet='selection';state.facetItem=null;renderPanesOnly()},
      open:(id       )=>{if(String(id).startsWith('phase:'))domain.select({kind:'phase',id:String(id).slice(6)});else domain.select({kind:'element',id:String(id)});state.facet='selection';state.facetItem=null;renderPanesOnly()}
    });
    topology.setActiveMode(projection.lifecycle==='PUBLISHED'?'review':'author');
    const selection=domain.selectionContext();
    if(selection?.id&&nodes.some((n    )=>n.id===selection.id)){try{topology.model.select(selection.id);topology.render()}catch{}}
    requestAnimationFrame(()=>topology?.fit?.());
  };

  let renderPanesOnly=()=>{
    const locale=activeLocale(),t=pickText(locale);
    renderPanes(domain.studioProjection(),domain.selectionContext(),domain.validate(validationContext),t,locale);
  };

  /* ---------------------------------------------------------------- binding */

  const bind=(root            ,projection    ,locale       )=>{
    const t=pickText(locale);
    root.querySelectorAll             ('[data-view]').forEach(node=>node.onclick=()=>{state.view=node.dataset.view       ;render()});
    root.querySelectorAll             ('[data-menu]').forEach(node=>node.onclick=event=>{
      event.stopPropagation();
      const panel=root.querySelector(`[data-menu-panel="${node.dataset.menu}"]`)                    ;
      const open=panel?.hidden!==false;
      root.querySelectorAll             ('[data-menu-panel]').forEach(p=>{p.hidden=true});
      root.querySelectorAll             ('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));
      if(panel){panel.hidden=!open;node.setAttribute('aria-expanded',String(open))}
    });
    root.querySelectorAll             ('[data-tool]').forEach(node=>node.onclick=()=>{
      const tool=node.dataset.tool ;
      if(tool==='select'){state.tool='select';state.endpoints=[];setStatus('accent',t.stTool.replace('{tool}',t.select));render();return}
      if(tool==='phase'){state.tool='select';addPhase();return}
      if(tool==='connect'){state.tool='connect';state.endpoints=[];setStatus('accent',t.stConnectArmed);render();return}
      state.tool=tool;
      addElement(tool,targetPhase(projection)?.id||null);
    });
    root.querySelectorAll             ('[data-action]').forEach(node=>node.onclick=()=>{closeMenus(root);action(node.dataset.action )});
    root.querySelectorAll             ('[data-node]').forEach(node=>node.onclick=()=>nodeClick(node.dataset.node ));
    root.querySelectorAll             ('[data-phase]').forEach(node=>node.onclick=()=>selectPhase(node.dataset.phase ));
    root.querySelectorAll             ('[data-add-to]').forEach(node=>node.onclick=()=>{
      const kind=state.tool==='select'||state.tool==='connect'?'event':state.tool;
      addElement(kind,node.dataset.addTo );
    });
    const structure=root.ownerDocument.querySelector('[data-scenario-structure]');
    structure?.querySelectorAll             ('button').forEach(node=>node.onclick=()=>{
      const group=node.dataset.group;
      if(group){if(state.collapsed.has(group))state.collapsed.delete(group);else state.collapsed.add(group)}
      if(node.dataset.facetItem){state.facetItem=node.dataset.facetItem;state.facet=node.dataset.facet||state.facet}
      else if(node.dataset.facet&&!node.dataset.element&&!node.dataset.phase){state.facet=node.dataset.facet;state.facetItem=null}
      if(node.dataset.phase)return selectPhase(node.dataset.phase);
      if(node.dataset.element)return selectElement(node.dataset.element);
      render();
    });
  };

  const closeMenus=(root            )=>{
    root.querySelectorAll             ('[data-menu-panel]').forEach(p=>p.hidden=true);
    root.querySelectorAll             ('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));
  };

  if(!documentBound){
    documentBound=true;
    document.addEventListener('click',event=>{
      if(!(event.target           )?.closest?.('.w03-menuwrap'))closeMenus(host               );
    });
  }

  let retries=0;
  const boot=()=>{
    if(!foundation()?.workspace){if(++retries<50){setTimeout(boot,40)}else{render()}return}
    if(installShell())render();else if(++retries<50)setTimeout(boot,40);
  };
  render();
  setTimeout(boot,0);
  return {host,refresh:render,owner:'ScenarioTimelineIdentity'};
}
