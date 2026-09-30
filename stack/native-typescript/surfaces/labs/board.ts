/**
 * W03-LABS · the lab task-graph workbench (center + LEFT/RIGHT regions).
 *
 * Surface identity: this workspace exists so a lab author can compose ONE lab as a
 * dependency graph of discrete technical tasks and carry it validate → publish → run handoff.
 * The task graph IS the work surface: it occupies the whole board, and everything else in this
 * module exists to serve it — an authoring palette above it, a relationship legend and state
 * under it, the definition structure to its left, the authored context of the selected node to
 * its right.
 *
 * Anti-cloning: no composition is inherited from Library, Learn or Scenarios. Shared mechanics
 * used here are exactly the shared ones — SpatialInteractionKernel/SpatialView for the graph,
 * workspace.region() for the panes, SemanticCommandBus for the commands, and the global chrome.
 * Everything visible (grouping, hierarchy, density, emphasis, copy) is local to this surface.
 */
import {SpatialView} from '../../foundation/spatial.js';
import {activeLocale,pickText,esc,fill,countText,type LabLocale} from './i18n.js';
import {icon} from './icons.js';
import {ensureLabStyle} from './styles.js';
import {renderStructure} from './structure.js';
import {renderContext} from './context.js';

const foundation=()=>((globalThis as any).CEPFoundation||null);

/**
 * Tool/environment binding used by this workbench.
 *
 * The lab definition declares REQUIRED capabilities and required tools; a binding is a separate,
 * explicitly-labelled truth. This surface binds the local training fixture so Validate → Publish
 * Revision → Prepare Run are genuinely reachable. It never claims provider truth: the provider
 * and classification are rendered verbatim in the context pane, and `labs.handoff` still reports
 * `runCreated:false` — preparing freezes the run input manifest, it never starts a run.
 */
export const LAB_ENVIRONMENT_BINDING=Object.freeze({
  provider:'LOCAL_TRAINING_ENVIRONMENT_FIXTURE',
  classification:'FIXTURE_BINDING__NOT_PROVIDER_TRUTH',
  capabilities:Object.freeze(['SIM_NET','WEB_TIER']),
  revision:'ENV-2'
});
export const LAB_TOOL_CONTEXT=Object.freeze({
  tools:Object.freeze({['tool-browser']:{revision:'1'},['tool-request-inspector']:{revision:'1'}}),
  environmentBinding:Object.freeze({capabilities:[...LAB_ENVIRONMENT_BINDING.capabilities],revision:LAB_ENVIRONMENT_BINDING.revision})
});

/* Reference-shaped node placement: a three-step spine, then task 3 fanning out to the required
 * successor above and the optional branch below — the fan-out is what makes the graph non-linear. */
const LAB_LAYOUT:Record<string,[number,number]>={
  'TASK-1':[36,150],'TASK-2':[226,150],'TASK-3':[416,150],'TASK-4':[556,36],'TASK-5':[556,272]
};
const layoutOf=(id:string,index:number):[number,number]=>
  LAB_LAYOUT[id]||[36+(index%3)*190,150+Math.floor(index/3)*140];

const edgeKind=(type:string)=>/optional/i.test(type)?'optional':/conditional|branch/i.test(type)?'conditional':'linear';

interface LabState{
  facet:string;
  tool:'select'|'connect';
  branchArmed:boolean;
  endpoints:string[];
  menu:string|null;
  status:{tone:'ok'|'warn'|'error'|'accent';text:string}|null;
}

export function mountLabTaskGraphIdentity(composition:any){
  if(typeof document==='undefined'||!composition?.domain)return null;
  const doc=document.querySelector('#centerPane .docscroll');if(!doc)return null;
  let host=document.querySelector('#m0StructuredSpatial') as HTMLElement|null;
  if(!host){host=document.createElement('section');host.id='m0StructuredSpatial';host.className='m0-structured-spatial';doc.prepend(host)}
  host.dataset.m0StructuredStudio='true';

  const domain=composition.domain,bus=composition.bus;
  const state:LabState={facet:'taskGraph',tool:'select',branchArmed:false,endpoints:[],menu:null,status:null};
  let view:SpatialView|null=null;
  let chromeInstalled=false;
  let commandLocale:LabLocale|null=null;
  let paneObserver:MutationObserver|null=null;
  let lastFocus:string|null=null;

  const FOCUS_ATTRS=['data-step','data-facet','data-branch','data-tool','data-action','data-menu'];
  const focusKey=(el:Element|null)=>{
    if(!el||el===document.body)return null;
    for(const attr of FOCUS_ATTRS){const v=el.getAttribute?.(attr);if(v!==null&&v!==undefined)return `[${attr}="${v.replace(/"/g,'\\"')}"]`}
    return null;
  };

  const availability=(id:string)=>{
    try{
      const value=bus.availability(id,LAB_TOOL_CONTEXT);
      if(value===true)return {enabled:true,reason:''};
      if(value===false)return {enabled:false,reason:''};
      return {enabled:value?.enabled!==false,reason:String(value?.reason||value?.code||'')};
    }catch{return {enabled:false,reason:''}}
  };

  const toolNames=(refs:any)=>{
    const list=Array.isArray(refs)?refs:[],tools=composition.domain.graphProjection().requiredTools||[];
    return list.map((ref:any)=>{
      const id=typeof ref==='string'?ref:ref?.id;
      const tool=tools.find((x:any)=>x.id===id);
      return String(tool?.name||id||'—');
    });
  };

  const setStatus=(tone:'ok'|'warn'|'error'|'accent',text:string)=>{state.status={tone,text}};

  const runCommand=(id:string,payload:any,okText:string)=>{
    try{
      const result=bus.execute(id,payload);
      if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
      else if(result?.validation&&result.validation.ok===false)setStatus('error',String(result.code||''));
      else setStatus('ok',okText);
    }catch(error:any){setStatus('error',String(error?.message||error))}
  };

  /* ---------------------------------------------------------------- selection + authoring */

  const selectTask=(id:string)=>{domain.select({kind:'task',id});state.facet='taskGraph';render()};
  const selectBranch=(id:string)=>{domain.select({kind:'edge',id});state.facet='taskGraph';render()};

  const addTask=()=>{
    const projection=domain.graphProjection(),tasks=projection.tasks||[];
    let n=tasks.length+1,id=`TASK-${n}`;
    const ids=new Set(tasks.map((x:any)=>x.id));
    while(ids.has(id))id=`TASK-${++n}`;
    const locale=activeLocale();
    try{
      const result=bus.execute('labs.author',{op:'addTask',task:{
        id,title:locale==='ar'?`مهمة ${n}`:`Task ${n}`,nodeType:'action',
        validation:'Injection-condition rule',expectedSignal:'Expected signal recorded.',
        description:locale==='ar'?'وصف المهمة المألفة.':'Description of the authored task.',
        objectiveType:locale==='ar'?'فحص سلوكي':'Behavior probe',
        requiredCapability:'HTTP interaction',toolRefs:['tool-browser'],completion:'Required'
      },route:'labs-workbench'});
      if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
      else{state.facet='taskGraph';domain.select({kind:'task',id});setStatus('ok',String(pickText(locale).stTaskAdded))}
    }catch(error:any){setStatus('error',String(error?.message||error))}
    render();
  };

  const armConnect=(branch:boolean)=>{
    const t=pickText(activeLocale());
    state.tool='connect';state.branchArmed=branch;state.endpoints=[];
    setStatus('accent',t.connectArmed);render();
  };

  const onNodeClick=(id:string)=>{
    const t=pickText(activeLocale());
    if(state.tool==='connect'){
      if(!state.endpoints.length){state.endpoints=[id];domain.select({kind:'task',id});setStatus('accent',t.connectSource);render();return}
      const source=state.endpoints[0];
      state.endpoints=[];
      if(source===id){setStatus('error',t.connectBlocked.replace({reason:t.select} as any,String(t.select)));render();return}
      try{
        const result=bus.execute('labs.author',{op:'connect',edge:{
          from:source,to:id,type:state.branchArmed?'branch':'depends',
          condition:state.branchArmed?'Optional when generated signals are already explained':'',
          label:state.branchArmed?String(t.addBranch):String(t.linear)
        },route:'labs-workbench'});
        if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
        else{
          const projection=domain.graphProjection(),title=(x:string)=>(projection.tasks||[]).find((p:any)=>p.id===x)?.title||x;
          state.tool='select';state.branchArmed=false;
          setStatus('ok',fill(String(t.connected),{a:title(source),b:title(id)}));
        }
      }catch(error:any){state.tool='select';state.branchArmed=false;setStatus('error',String(error?.message||error))}
      domain.select({kind:'task',id});render();return;
    }
    selectTask(id);
  };

  const exportSummary=()=>{
    const t=pickText(activeLocale()),p=domain.graphProjection();
    const lines=[`${p.title} · ${p.identity.id}@${p.identity.revision} · ${p.lifecycle}`];
    if(p.purpose)lines.push(String(t.purpose)+': '+p.purpose);
    (p.tasks||[]).forEach((task:any,i:number)=>lines.push(`${i+1}. ${task.title||task.id} [${task.nodeType||'task'}] → ${task.expectedSignal||''}`));
    (p.edges||[]).forEach((edge:any)=>lines.push(`   ${edge.from} → ${edge.to} (${edge.type})`));
    const done=(ok:boolean)=>{setStatus(ok?'ok':'error',ok?String(t.stExported):String(t.stExportBlocked));render()};
    try{
      const clip=(navigator as any)?.clipboard;
      if(clip?.writeText)clip.writeText(lines.join('\n')).then(()=>done(true),()=>done(false));
      else done(false);
    }catch{done(false)}
  };

  const action=(name:string)=>{
    const locale=activeLocale(),t=pickText(locale);
    if(name==='validate'){runCommand('labs.preflight',LAB_TOOL_CONTEXT,String(t.stValidated).replace('{n}',String((domain.validate().errors||[]).length===0?(domain.graphProjection().tasks||[]).length:0)));return}
    if(name==='publish'){runCommand('labs.publish',{...LAB_TOOL_CONTEXT,route:'labs-workbench'},String(t.stPublished));return}
    if(name==='prepare'){runCommand('labs.handoff',LAB_TOOL_CONTEXT,String(t.stPrepared));return}
    if(name==='revise'){
      try{
        const result=bus.execute('labs.revise',{expectedVersion:domain.version,route:'labs-workbench'});
        setStatus(result?.snapshot?'ok':'error',result?.snapshot?String(t.stRevised):String(result?.reason||result?.code||''));
      }catch(error:any){setStatus('error',String(error?.message||error))}
      render();return;
    }
    if(name==='export'){exportSummary();return}
    if(name==='clear'){domain.select(null);state.menu=null;setStatus('accent',String(t.stCleared));render()}
  };

  /* ---------------------------------------------------------------- shell chrome */

  const localizeChrome=(t:Record<string,string>)=>{
    const set=(selector:string,value?:string)=>{const node=document.querySelector(selector);if(node&&value)node.textContent=value};
    set('#bottomShelf .bottomtitle',t.bottomTitle);
    set('#bottomSummary',t.bottomSummary);
    set('#leftLocalReveal [data-pane-toggle-label]',t.hideStructure);
    set('#rightLocalReveal [data-pane-toggle-label]',t.showContext);
    const banner=document.querySelector('#topBanner');
    if(banner){set('#topBanner .title',t.banner);set('#topBanner .badge',t.bannerBadge);set('#topBanner .lock span',t.bannerLock)}
  };

  /** This surface owns its command registrations, so their toolbar labels follow the language too. */
  const localizeCommands=(t:Record<string,string>,locale:LabLocale,ws:any)=>{
    if(commandLocale===locale)return;
    commandLocale=locale;
    const labels:Record<string,string>={
      'labs.author':String(t.cmdAuthor),'labs.revise':String(t.cmdRevise),
      'labs.preflight':String(t.cmdPreflight),'labs.handoff':String(t.cmdHandoff),
      'labs.publish':String(t.publish)
    };
    try{
      const write=(map:any)=>{if(!map||typeof map.get!=='function')return;for(const [id,label] of Object.entries(labels)){const c=map.get(id);if(c&&c.owner===domain.owner&&typeof label==='string')c.label=label}};
      write((bus as any)?.commands);
      write(ws?.commands?.commands);
      ws?.refreshToolbar?.();
    }catch(error){if(typeof console!=='undefined')console.warn('lab command labels',error)}
  };

  /** Shared code can re-reveal generic donor panes after a region call; suppress them for labs only. */
  const suppressPaneSiblings=()=>{
    document.querySelectorAll('#leftPane .pbody > :not(#domainLeftRegion),#rightPane .pbody > :not(#domainContext)').forEach(node=>{
      if(node.hidden&&node.getAttribute('aria-hidden')==='true')return;
      node.hidden=true;node.inert=true;node.setAttribute('aria-hidden','true');(node as HTMLElement).dataset.donorSemantic='suppressed';
    });
    const donor=document.querySelector('#editorDocument');
    if(donor&&!donor.hidden){donor.hidden=true;donor.setAttribute('aria-hidden','true');(donor as HTMLElement).dataset.donorSemantic='suppressed'}
  };

  const projectionOf=()=>domain.graphProjection();
  const validationOf=()=>domain.validate();
  const preflightOf=()=>{try{return domain.preflight(LAB_TOOL_CONTEXT)}catch{return null}};

  const renderRegions=()=>{
    const ws=foundation()?.workspace;
    if(!ws)return;
    const locale=activeLocale(),t=pickText(locale) as Record<string,string>;
    const projection=projectionOf(),selection=domain.selectionContext(),validation=validationOf(),preflight=preflightOf();
    try{
      ws.region('LEFT',{html:renderStructure({t,locale,projection,facet:state.facet,
        selectedId:selection?.id&&selection?.kind!=='lab'?String(selection.id):null,
        selectedKind:String(selection?.kind||''),validation}),label:String(t.structure)});
      ws.region('RIGHT',{html:renderContext({t,locale,projection,facet:state.facet,selection,validation,preflight,toolNames}),
        label:String(t.context)});
      /* Ownership is stamped on the region HOSTS, so the observer can tell "already mine"
         from "shared code re-rendered the pane" without ever re-entering a render loop. */
      document.querySelector('#domainLeftRegion')?.setAttribute('data-lab-region-owner','W03-LABS');
      document.querySelector('#domainContext')?.setAttribute('data-lab-region-owner','W03-LABS');
    }catch(error){if(typeof console!=='undefined')console.warn('lab region projection',error)}
    suppressPaneSiblings();
    localizeChrome(t);
    localizeCommands(t,locale,ws);
  };

  let asserting=false;
  const assertRegions=()=>{
    if(asserting)return;
    const left=document.querySelector('#domainLeftRegion'),right=document.querySelector('#domainContext');
    if(left?.getAttribute('data-lab-region-owner')==='W03-LABS'&&right?.getAttribute('data-lab-region-owner')==='W03-LABS')return;
    asserting=true;
    try{renderRegions()}finally{asserting=false}
  };

  const observePanes=()=>{
    if(paneObserver||typeof MutationObserver==='undefined')return;
    paneObserver=new MutationObserver(()=>assertRegions());
    ['#leftPane .pbody','#rightPane .pbody'].forEach(sel=>{
      const pbody=document.querySelector(sel);if(!pbody)return;
      paneObserver?.observe(pbody,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','aria-hidden','inert']});
    });
  };

  /* ---------------------------------------------------------------- center render */

  const graphModel=(tasks:any[],edges:any[])=>{
    const nodes=tasks.map((task:any,index:number)=>{
      const pt=layoutOf(String(task.id),index);
      return {
        id:String(task.id),label:String(task.title||task.id),
        status:String(task.completion||'Required'),
        subtitle:String(task.description||task.expectedSignal||''),
        iconKey:String(index+1),idChip:String(task.id),
        kind:String(task.nodeType||'task'),type:String(task.nodeType||'task'),
        tags:[String(task.nodeType||'task')],
        x:pt[0],y:pt[1]
      };
    });
    const relations=edges.map((edge:any)=>{
      const kindLabel=edgeKind(String(edge.type||'depends'));
      const type=kindLabel==='linear'?String(pickText(activeLocale()).linear)
        :kindLabel==='conditional'?String(pickText(activeLocale()).conditional)
        :String(pickText(activeLocale()).optional);
      return {id:`edge:${edge.id}`,source:String(edge.from),target:String(edge.to),type,direction:'directed',kind:'representation'};
    });
    return {nodes,relations};
  };

  const render=()=>{
    const active=document.activeElement as Element|null;
    if(active&&active!==document.body&&active.closest('#m0StructuredSpatial,#domainLeftRegion,#domainContext'))lastFocus=focusKey(active);
    const locale=activeLocale(),t=pickText(locale) as Record<string,string>;
    const projection=projectionOf(),tasks=projection.tasks||[],edges=projection.edges||[];
    const selection=domain.selectionContext(),validation=validationOf(),preflight=preflightOf();
    const published=projection.lifecycle==='PUBLISHED';
    const errors=validation?.errors||[];
    const branches=edges.filter((e:any)=>['optional','conditional','branch'].includes(e.type));

    const handoffA=availability('labs.handoff'),publishA=availability('labs.publish'),preflightA=availability('labs.preflight');
    const palette=[['select','select',t.select,true],['addTask','plus',t.addTask,false],['connect','connect',t.connect,true],['addBranch','branch',t.addBranch,true]] as const;
    const paletteHtml=palette.map(([id,glyph,label,toggle])=>
      `<button type="button" class="w03l-btn" data-tool="${id}"${toggle?` aria-pressed="${id==='select'?state.tool==='select':id==='connect'?(state.tool==='connect'&&!state.branchArmed):state.branchArmed}"`:''}>${icon(glyph)}<span>${esc(String(label))}</span></button>`).join('');

    const lifecycle=[['validate','shieldCheck',t.validate,preflightA],['publish','publish',t.publish,publishA],['prepare','run',t.prepare,handoffA]] as const;
    const lifecycleHtml=lifecycle.map(([id,glyph,label,a])=>
      `<button type="button" class="w03l-btn" data-action="${id}" data-primary="${id==='prepare'}" ${a.enabled?'':'disabled'} title="${esc(a.reason||'')}">${icon(glyph)}<span>${esc(String(label))}</span></button>`).join('');

    const statusTone=state.status?state.status.tone:(errors.length?'error':published?'ok':'warn');
    const statusText=state.status?state.status.text
      :errors.length?fill(String(t.stValidationFailed),{n:String(errors.length)})
      :published?String(t.stReady)
      :String(pickText(locale).stDraft||t.lifecycle);

    /* Fill the workspace viewport (not merely its content): the graph board is the work surface,
       so it takes the pane height instead of leaving a dead strip under the legend. */
    const scrollBox=doc as HTMLElement|null,available=scrollBox?.clientHeight||0;
    host!.style.minHeight=available?`${Math.max(440,available-24)}px`:'';
    host!.innerHTML=`<div class="w03l" data-w03-surface="labs" aria-label="${esc(t.boardAria)}">
      <div class="w03l-actions" role="toolbar" aria-label="${esc(t.boardAria)}">
        <div class="w03l-group">${paletteHtml}</div>
        <span class="w03l-sep" aria-hidden="true"></span>
        <div class="w03l-group w03l-group-end">
          ${lifecycleHtml}
          <div class="w03l-menuwrap">
            <button type="button" class="w03l-btn" data-menu="more" aria-haspopup="true" aria-expanded="${state.menu==='more'}" aria-label="${esc(t.more)}" title="${esc(t.more)}">${icon('more')}</button>
            <div class="w03l-menu" data-menu-panel="more" role="menu" ${state.menu==='more'?'':'hidden'}>
              <button type="button" role="menuitem" data-action="revise">${icon('save')}${esc(t.newRevision)}</button>
              <button type="button" role="menuitem" data-action="export">${icon('publish')}${esc(t.exportSummary)}</button>
              <button type="button" role="menuitem" data-action="clear">${icon('close')}${esc(t.clearSelection)}</button>
            </div>
          </div>
        </div>
      </div>
      <article class="w03l-board">
        <header class="w03l-head">
          <h2><bdi dir="auto">${esc(projection.title||'Untitled Lab')}</bdi></h2>
          <span class="w03l-pill" data-tone="ok">${esc(t.draftRevision)} <bdi dir="ltr">${esc(projection.identity?.revision||'1')}</bdi></span>
          <span class="w03l-pill" data-tone="${published?'accent':'warn'}"><bdi dir="ltr">${esc(projection.lifecycle||'DRAFT')}</bdi></span>
          <span class="w03l-headmeta">${esc(countText(tasks.length,'tasks',locale))} · ${esc(countText(edges.length,'edges',locale))} · ${esc(t.nonLinear)} ${validation?.graph?.nonLinear?'✓':''}</span>
        </header>
        <p class="w03l-purpose"><b>${esc(t.purpose)}:</b> ${esc(projection.purpose||'—')}</p>
        <div class="w03l-canvas" data-lab-graph aria-label="${esc(t.graphAria)}"></div>
        <footer class="w03l-foot">
          <div class="w03l-legend" role="list">
            <span class="w03l-legend-title">${esc(t.legend)}</span>
            <span class="w03l-key" role="listitem"><i aria-hidden="true"></i>${esc(t.linear)}</span>
            <span class="w03l-key" role="listitem"><i class="dash" aria-hidden="true"></i>${esc(t.conditional)}</span>
            <span class="w03l-key" role="listitem"><i class="dash dot" aria-hidden="true"></i>${esc(t.optional)}</span>
          </div>
          <span class="w03l-status" data-tone="${statusTone}" role="status">${esc(statusText)}</span>
        </footer>
      </article>
    </div>`;
    ensureLabStyle(host!);
    bind(host!,locale);
    renderRegions();

    const graphHost=host!.querySelector('[data-lab-graph]') as HTMLElement|null;
    if(graphHost){
      const {nodes,relations}=graphModel(tasks,edges);
      if(!nodes.length){
        graphHost.innerHTML=`<p class="w03l-hint" style="margin:24px">${esc(t.emptyGraph)} — ${esc(t.emptyGraphHint)}</p>`;
      }else{
        view=new SpatialView(graphHost,nodes,relations,{
          select:(ids:string[])=>{const id=ids.at(-1);if(!id)return;onNodeClick(String(id))},
          edgeSelect:(id:any)=>{if(!id)return;selectBranch(String(id).replace(/^edge:/,''))},
          open:(id:any)=>{if(!id)return;onNodeClick(String(id))}
        });
        view.setActiveMode(published?'review':'author');
        const focusId=selection?.kind==='task'?String(selection.id):null;
        if(focusId&&nodes.some((n:any)=>n.id===focusId)){try{view.model.select?.(focusId);view.render?.()}catch{}}
        requestAnimationFrame(()=>{try{view?.fit?.()}catch{}});
        setTimeout(()=>{try{view?.fit?.()}catch{}},140);
      }
    }
    if(lastFocus){
      const target=document.querySelector(lastFocus) as HTMLElement|null;
      if(target&&target!==document.activeElement&&typeof target.focus==='function')target.focus({preventScroll:true});
      lastFocus=null;
    }
  };

  /* ---------------------------------------------------------------- binding */

  const closeMenus=(root:ParentNode)=>{
    root.querySelectorAll('.w03l-menu[data-menu-panel]').forEach(p=>p.setAttribute('hidden',''));
    root.querySelectorAll('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));
  };

  const bind=(root:HTMLElement,locale:LabLocale)=>{
    const t=pickText(locale) as Record<string,string>;
    root.querySelectorAll<HTMLElement>('[data-tool]').forEach(node=>node.onclick=()=>{
      const tool=node.dataset.tool;
      if(tool==='select'){state.tool='select';state.branchArmed=false;state.endpoints=[];setStatus('accent',String(t.toolActive).replace('{tool}',String(t.select)));render();return}
      if(tool==='connect'){state.tool='connect';state.branchArmed=false;state.endpoints=[];setStatus('accent',String(t.connectArmed));render();return}
      if(tool==='addBranch'){armConnect(true);return}
      if(tool==='addTask'){state.tool='select';addTask()}
    });
    root.querySelectorAll<HTMLElement>('[data-action]').forEach(node=>node.onclick=()=>{state.menu=null;action(String(node.dataset.action))});
    root.querySelectorAll<HTMLElement>('[data-menu]').forEach(node=>node.onclick=event=>{
      event.stopPropagation();
      const panel=root.querySelector(`[data-menu-panel="${node.dataset.menu}"]`) as HTMLElement|null;
      const open=panel?.hasAttribute('hidden')!==false;
      closeMenus(root);
      if(panel&&open){panel.removeAttribute('hidden');node.setAttribute('aria-expanded','true');state.menu=String(node.dataset.menu)}
      else state.menu=null;
    });
    const struct=document.querySelector('#domainLeftRegion');
    struct?.querySelectorAll<HTMLElement>('[data-facet]').forEach(node=>node.onclick=()=>{
      state.facet=node.dataset.facet||'taskGraph';render();
    });
    struct?.querySelectorAll<HTMLElement>('[data-step]').forEach(node=>node.onclick=()=>selectTask(String(node.dataset.step)));
    struct?.querySelectorAll<HTMLElement>('[data-branch]').forEach(node=>node.onclick=()=>selectBranch(String(node.dataset.branch)));
    const ctx=document.querySelector('#domainContext');
    ctx?.querySelectorAll<HTMLElement>('[data-lab-close]').forEach(node=>node.onclick=()=>{
      const toggle=document.querySelector('#rightPane .phead [data-pane-toggle-label]')?.closest('button')
        ||document.querySelector('#rightLocalReveal');
      (toggle as HTMLElement|null)?.click?.();
    });
  };

  /* ---------------------------------------------------------------- boot */

  const installChrome=()=>{
    const ws=foundation()?.workspace;
    if(!ws)return false;
    if(!chromeInstalled){
      try{
        ws.toolbar(['labs.author','labs.revise','labs.preflight','labs.handoff']);
        ws.bindToolbarContext?.({contextProvider:()=>({route:'labs-workbench'})});
      }catch(error){if(typeof console!=='undefined')console.warn('lab toolbar binding',error)}
      chromeInstalled=true;
      try{
        const inspector=foundation()?.wave3Assembly?.contextInspector;
        if(inspector?.snapshot?.().open)inspector.close('labs-local-inspector',{restore:false});
      }catch{}
      observePanes();
    }
    const original=ws.onPreferences;
    ws.onPreferences=(preferences:any)=>{try{original?.(preferences)}catch{};commandLocale=null;render()};
    return true;
  };

  let retries=0;
  const boot=()=>{
    if(!foundation()?.workspace){if(++retries<60){setTimeout(boot,40)}else{render()}return}
    if(installChrome())render();else if(++retries<60)setTimeout(boot,40);
  };

  document.addEventListener('click',event=>{
    if(!(event.target as Element)?.closest?.('.w03l-menuwrap')){if(state.menu){state.menu=null;closeMenus(host!);render()}}
  });

  render();
  setTimeout(boot,0);
  return {host,refresh:render,owner:'LabTaskGraphIdentity'};
}
