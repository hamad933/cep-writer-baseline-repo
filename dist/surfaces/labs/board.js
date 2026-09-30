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
import {activeLocale,pickText,esc,fill,countText,              } from './i18n.js';
import {icon} from './icons.js';
import {ensureLabStyle} from './styles.js';
import {renderStructure} from './structure.js';
import {renderContext} from './context.js';

const foundation=()=>((globalThis       ).CEPFoundation||null);

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
 * successor above and the optional branch below — the fan-out is what makes the graph non-linear.
 * Column pitch (210) is derived from the Labs node card width so neighbouring cards never touch. */
const LAB_LAYOUT                               ={
  'TASK-1':[20,150],'TASK-2':[236,150],'TASK-3':[452,150],'TASK-4':[630,20],'TASK-5':[630,284]
};
const layoutOf=(id       ,index       )                =>
  LAB_LAYOUT[id]||[20+(index%3)*216,150+Math.floor(index/3)*164];

const edgeKind=(type       )=>/optional/i.test(type)?'optional':/conditional|branch/i.test(type)?'conditional':'linear';

                   
               
                          
                      
                     
                   
                                                              
 

export function mountLabTaskGraphIdentity(composition    ){
  if(typeof document==='undefined'||!composition?.domain)return null;
  const doc=document.querySelector('#centerPane .docscroll');if(!doc)return null;
  let host=document.querySelector('#m0StructuredSpatial')                    ;
  if(!host){host=document.createElement('section');host.id='m0StructuredSpatial';host.className='m0-structured-spatial';doc.prepend(host)}
  host.dataset.m0StructuredStudio='true';

  const domain=composition.domain,bus=composition.bus;
  const state         ={facet:'taskGraph',tool:'select',branchArmed:false,endpoints:[],menu:null,status:null};
  /* The reference inspects a task's authoring context by default. Seed the first task when the
     domain has no selection yet; Clear selection deliberately falls back to the lab-level context. */
  try{
    const seed=domain.graphProjection()?.tasks||[];
    if(!domain.selection&&seed.length)domain.select({kind:'task',id:String(seed[0].id)});
  }catch{}
  let view                 =null;
  let chromeInstalled=false;
  let commandLocale               =null;
  let paneObserver                      =null;
  let lastFocus            =null;

  const FOCUS_ATTRS=['data-step','data-facet','data-branch','data-tool','data-action','data-menu'];
  const focusKey=(el             )=>{
    if(!el||el===document.body)return null;
    for(const attr of FOCUS_ATTRS){const v=el.getAttribute?.(attr);if(v!==null&&v!==undefined)return `[${attr}="${v.replace(/"/g,'\\"')}"]`}
    return null;
  };

  const availability=(id       )=>{
    try{
      const value=bus.availability(id,LAB_TOOL_CONTEXT);
      if(value===true)return {enabled:true,reason:''};
      if(value===false)return {enabled:false,reason:''};
      return {enabled:value?.enabled!==false,reason:String(value?.reason||value?.code||'')};
    }catch{return {enabled:false,reason:''}}
  };

  const toolNames=(refs    )=>{
    const list=Array.isArray(refs)?refs:[],tools=composition.domain.graphProjection().requiredTools||[];
    return list.map((ref    )=>{
      const id=typeof ref==='string'?ref:ref?.id;
      const tool=tools.find((x    )=>x.id===id);
      return String(tool?.name||id||'—');
    });
  };

  const setStatus=(tone                             ,text       )=>{state.status={tone,text}};

  const runCommand=(id       ,payload    ,okText       )=>{
    try{
      const result=bus.execute(id,payload);
      if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
      else if(result?.validation&&result.validation.ok===false)setStatus('error',String(result.code||''));
      else setStatus('ok',okText);
    }catch(error    ){setStatus('error',String(error?.message||error))}
  };

  /* ---------------------------------------------------------------- selection + authoring */

  const selectTask=(id       )=>{domain.select({kind:'task',id});state.facet='taskGraph';render()};
  const selectBranch=(id       )=>{domain.select({kind:'edge',id});state.facet='taskGraph';render()};

  const addTask=()=>{
    const projection=domain.graphProjection(),tasks=projection.tasks||[];
    let n=tasks.length+1,id=`TASK-${n}`;
    const ids=new Set(tasks.map((x    )=>x.id));
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
    }catch(error    ){setStatus('error',String(error?.message||error))}
    render();
  };

  const armConnect=(branch        )=>{
    const t=pickText(activeLocale());
    state.tool='connect';state.branchArmed=branch;state.endpoints=[];
    setStatus('accent',t.connectArmed);render();
  };

  const onNodeClick=(id       )=>{
    const t=pickText(activeLocale());
    if(state.tool==='connect'){
      if(!state.endpoints.length){state.endpoints=[id];domain.select({kind:'task',id});setStatus('accent',t.connectSource);render();return}
      const source=state.endpoints[0];
      state.endpoints=[];
      if(source===id){setStatus('error',t.connectBlocked.replace({reason:t.select}       ,String(t.select)));render();return}
      try{
        const result=bus.execute('labs.author',{op:'connect',edge:{
          from:source,to:id,type:state.branchArmed?'branch':'depends',
          condition:state.branchArmed?'Optional when generated signals are already explained':'',
          label:state.branchArmed?String(t.addBranch):String(t.linear)
        },route:'labs-workbench'});
        if(result?.ok===false)setStatus('error',String(result.reason||result.code||''));
        else{
          const projection=domain.graphProjection(),title=(x       )=>(projection.tasks||[]).find((p    )=>p.id===x)?.title||x;
          state.tool='select';state.branchArmed=false;
          setStatus('ok',fill(String(t.connected),{a:title(source),b:title(id)}));
        }
      }catch(error    ){state.tool='select';state.branchArmed=false;setStatus('error',String(error?.message||error))}
      domain.select({kind:'task',id});render();return;
    }
    selectTask(id);
  };

  const exportSummary=()=>{
    const t=pickText(activeLocale()),p=domain.graphProjection();
    const lines=[`${p.title} · ${p.identity.id}@${p.identity.revision} · ${p.lifecycle}`];
    if(p.purpose)lines.push(String(t.purpose)+': '+p.purpose);
    (p.tasks||[]).forEach((task    ,i       )=>lines.push(`${i+1}. ${task.title||task.id} [${task.nodeType||'task'}] → ${task.expectedSignal||''}`));
    (p.edges||[]).forEach((edge    )=>lines.push(`   ${edge.from} → ${edge.to} (${edge.type})`));
    const done=(ok        )=>{setStatus(ok?'ok':'error',ok?String(t.stExported):String(t.stExportBlocked));render()};
    try{
      const clip=(navigator       )?.clipboard;
      if(clip?.writeText)clip.writeText(lines.join('\n')).then(()=>done(true),()=>done(false));
      else done(false);
    }catch{done(false)}
  };

  const action=(name       )=>{
    const locale=activeLocale(),t=pickText(locale);
    if(name==='validate'){runCommand('labs.preflight',LAB_TOOL_CONTEXT,String(t.stValidated).replace('{n}',String((domain.validate().errors||[]).length===0?(domain.graphProjection().tasks||[]).length:0)));return}
    if(name==='publish'){runCommand('labs.publish',{...LAB_TOOL_CONTEXT,route:'labs-workbench'},String(t.stPublished));return}
    if(name==='prepare'){runCommand('labs.handoff',LAB_TOOL_CONTEXT,String(t.stPrepared));return}
    if(name==='revise'){
      try{
        const result=bus.execute('labs.revise',{expectedVersion:domain.version,route:'labs-workbench'});
        setStatus(result?.snapshot?'ok':'error',result?.snapshot?String(t.stRevised):String(result?.reason||result?.code||''));
      }catch(error    ){setStatus('error',String(error?.message||error))}
      render();return;
    }
    if(name==='export'){exportSummary();return}
    if(name==='clear'){domain.select(null);state.menu=null;setStatus('accent',String(t.stCleared));render()}
  };

  /* ---------------------------------------------------------------- shell chrome */

  const localizeChrome=(t                      )=>{
    const set=(selector       ,value        )=>{const node=document.querySelector(selector);if(node&&value)node.textContent=value};
    set('#bottomShelf .bottomtitle',t.bottomTitle);
    set('#bottomSummary',t.bottomSummary);
    set('#leftLocalReveal [data-pane-toggle-label]',t.hideStructure);
    set('#rightLocalReveal [data-pane-toggle-label]',t.showContext);
    const banner=document.querySelector('#topBanner');
    if(banner){set('#topBanner .title',t.banner);set('#topBanner .badge',t.bannerBadge);set('#topBanner .lock span',t.bannerLock)}
  };

  /** This surface owns its command registrations, so their toolbar labels follow the language too. */
  const localizeCommands=(t                      ,locale          ,ws    )=>{
    if(commandLocale===locale)return;
    commandLocale=locale;
    const labels                      ={
      'labs.author':String(t.cmdAuthor),'labs.revise':String(t.cmdRevise),
      'labs.preflight':String(t.cmdPreflight),'labs.handoff':String(t.cmdHandoff),
      'labs.publish':String(t.publish)
    };
    try{
      const write=(map    )=>{if(!map||typeof map.get!=='function')return;for(const [id,label] of Object.entries(labels)){const c=map.get(id);if(c&&c.owner===domain.owner&&typeof label==='string')c.label=label}};
      write((bus       )?.commands);
      write(ws?.commands?.commands);
      ws?.refreshToolbar?.();
    }catch(error){if(typeof console!=='undefined')console.warn('lab command labels',error)}
  };

  /** Shared code can re-reveal generic donor panes after a region call; suppress them for labs only.
   *  `[hidden]` is not enough — some donor hosts force their own `display`, which leaves a dead
   *  strip of foreign chrome above the context region. Inline `display:none!important` is applied
   *  to this surface's pane siblings only; no shared file is modified. */
  const suppressPaneSiblings=()=>{
    document.querySelectorAll('#leftPane .pbody > :not(#domainLeftRegion),#rightPane .pbody > :not(#domainContext)').forEach(node=>{
      if(node.hidden&&node.getAttribute('aria-hidden')==='true'&&getComputedStyle(node).display==='none')return;
      node.hidden=true;node.inert=true;node.setAttribute('aria-hidden','true');
      (node               ).style.setProperty('display','none','important');
      (node               ).dataset.donorSemantic='suppressed';
    });
    const donor=document.querySelector('#editorDocument');
    if(donor&&!donor.hidden){donor.hidden=true;donor.setAttribute('aria-hidden','true');(donor               ).dataset.donorSemantic='suppressed'}
  };

  const projectionOf=()=>domain.graphProjection();
  const validationOf=()=>domain.validate();
  const preflightOf=()=>{try{return domain.preflight(LAB_TOOL_CONTEXT)}catch{return null}};

  const renderRegions=()=>{
    const ws=foundation()?.workspace;
    if(!ws)return;
    const locale=activeLocale(),t=pickText(locale)                         ;
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

  const graphModel=(tasks      ,edges      )=>{
    const nodes=tasks.map((task    ,index       )=>{
      const pt=layoutOf(String(task.id),index);
      return {
        id:String(task.id),label:String(task.title||task.id),
        /* completion is carried by the tag row instead of the status chip: a 200px Labs card has
           room for two chips (kind + completion) and the chip column would sit mid-card. */
        status:'',
        subtitle:String(task.description||task.expectedSignal||''),
        iconKey:String(index+1),idChip:String(task.id),
        kind:String(task.nodeType||'task'),type:String(task.nodeType||'task'),
        tags:[String(task.nodeType||'task'),String(task.completion||'Required')],
        x:pt[0],y:pt[1]
      };
    });
    const relations=edges.map((edge    )=>{
      const kindLabel=edgeKind(String(edge.type||'depends'));
      const type=kindLabel==='linear'?String(pickText(activeLocale()).linear)
        :kindLabel==='conditional'?String(pickText(activeLocale()).conditional)
        :String(pickText(activeLocale()).optional);
      return {id:`edge:${edge.id}`,source:String(edge.from),target:String(edge.to),type,direction:'directed',kind:'representation'};
    });
    return {nodes,relations};
  };

  /**
   * Post-render correction pass, run through the shared SpatialView `change` hook (called at the
   * end of every shared render, so it survives pan/zoom/select/keyboard).
   *
   * Two reference-fidelity corrections the shared presentation cannot express itself:
   *  1. relation endpoints are authored at the node *centre* (`x+half`), so arrowheads and line
   *     ends were painted underneath the opaque card. They are re-seated onto the card border,
   *     which is where the reference puts them.
   *  2. SVG `<text>` does not wrap, so long authored titles/descriptions must be ellipsised to the
   *     card's inner width instead of spilling over the neighbour. The full string stays on the
   *     node's accessible name, the structure pane and the context pane.
   */
  const paintGraph=(instance                 )=>{
    const svg=instance?.svg;if(!svg)return;
    const model=(instance       )?.model;
    const zoom=Number(model?.camera?.zoom)||1;
    const surface=svg.querySelector('.node-surface')                       ;
    let halfW=100,halfH=38;
    if(surface){const r=surface.getBoundingClientRect();if(r.width>0&&r.height>0){halfW=r.width/zoom/2;halfH=r.height/zoom/2}}
    const nodes=new Map            ((model?.nodes||[]).map((n    )=>[String(n.id),n]));
    const edges=(model?.edges||[])         ;
    svg.querySelectorAll('[data-edge]').forEach(group=>{
      const edge=edges.find(e=>String(e.id)===group.getAttribute('data-edge'));
      const s=edge?nodes.get(String(edge.source)):null,t=edge?nodes.get(String(edge.target)):null;
      const line=group.querySelector('line.relation-line')                       ;
      if(!s||!t||!line)return;
      const ax=s.x+halfW,ay=s.y+halfH,bx=t.x+halfW,by=t.y+halfH,dx=bx-ax,dy=by-ay;
      if(!Number.isFinite(dx)||!Number.isFinite(dy)||(!dx&&!dy))return;
      const k=Math.min(Math.abs(dx)>0.01?halfW/Math.abs(dx):Infinity,Math.abs(dy)>0.01?halfH/Math.abs(dy):Infinity,0.49);
      line.setAttribute('x1',String(ax+dx*k));line.setAttribute('y1',String(ay+dy*k));
      line.setAttribute('x2',String(bx-dx*k));line.setAttribute('y2',String(by-dy*k));
    });
    const NS='http://www.w3.org/2000/svg';
    /* 2px tolerance: sub-pixel glyph advance must not trigger a wrap. */
    const available=Math.max(48,2*halfW-31-6)+2;
    const widthOf=(el               ,s       )=>{el.textContent=s;return el.getComputedTextLength()};
    const fits=(el               ,s       )=>widthOf(el,s)<=available;
    /** Longest word-aligned prefix that fits; hard-cuts only when a single word cannot fit. */
    const clipToWidth=(el               ,text       )=>{
      const words=text.trim().split(/\s+/);
      let line='';
      for(const w of words){
        const trial=line?`${line} ${w}`:w;
        if(fits(el,trial)){line=trial;continue}
        if(line)break;
        let single='';
        for(const ch of w){if(widthOf(el,`${single}${ch}…`)<=available)single+=ch;else break}
        return single||w.slice(0,1);
      }
      return line||text.slice(0,1);
    };
    /** Split into at most two lines, preferring the split that leaves both lines balanced. */
    const wrapToTwo=(el               ,text       )         =>{
      const full=text.trim();
      if(fits(el,full))return [full];
      const words=full.split(/\s+/);
      for(let i=words.length-1;i>=1;i--){
        const first=words.slice(0,i).join(' '),rest=words.slice(i).join(' ');
        if(fits(el,first)&&fits(el,rest))return [first,rest];
      }
      const first=clipToWidth(el,full);
      const rest=full.slice(first.length).trim();
      if(!rest)return [first];
      return [first,fits(el,rest)?rest:`${clipToWidth(el,rest)}…`];
    };
    const putLines=(el               ,lines         ,ySingle       ,yFirst       ,ySecond       )=>{
      if(lines.length<2){el.textContent=lines[0];el.setAttribute('y',String(ySingle));return}
      el.textContent='';
      for(let i=0;i<lines.length;i++){
        const ts=document.createElementNS(NS,'tspan');
        ts.setAttribute('x','31');ts.setAttribute('y',String(i===0?yFirst:ySecond));
        ts.textContent=lines[i];el.appendChild(ts);
      }
    };
    svg.querySelectorAll                ('.node-title,.node-secondary-line').forEach(el=>{
      const full=el.getAttribute('data-full')??String(el.textContent||'');
      if(!el.hasAttribute('data-full'))el.setAttribute('data-full',full);
      const lines=wrapToTwo(el,full);
      if(el.classList.contains('node-title'))putLines(el,lines,38,30,42);
      else putLines(el,lines,58,58,69);
    });
    const readable=(id       )=>{
      const n=nodes.get(id);if(!n)return id;
      const tags=(n.tags||[]).filter(Boolean).join(' · ');
      return `${n.label||id}${n.subtitle?` — ${n.subtitle}`:''}${tags?` [${tags}]`:''}`;
    };
    svg.querySelectorAll             ('[data-node]').forEach(g=>{
      const id=g.getAttribute('data-node')||'';
      g.setAttribute('aria-label',readable(id));
      if(!g.querySelector(':scope > title')){
        const tip=document.createElementNS('http://www.w3.org/2000/svg','title');
        tip.textContent=String(nodes.get(id)?.label||id);
        g.insertBefore(tip,g.firstChild);
      }
    });
  };

  /**
   * The shared `fit()` bounds a node at the shared default 132×62 card size with 30px padding.
   * Labs cards are bigger, so a shared fit would clip the last card against the canvas edge.
   * This is the same camera maths with the Labs card box read back from the rendered card.
   */
  const fitToBox=(instance                 )=>{
    const svg=instance?.svg;if(!svg)return;
    const model=(instance       )?.model,nodes=model?.nodes||[];
    if(!nodes.length)return;
    const w=svg.clientWidth||svg.getBoundingClientRect().width;
    const h=svg.clientHeight||svg.getBoundingClientRect().height;
    if(!w||!h)return;
    const zoom0=Number(model.camera?.zoom)||1;
    const surface=svg.querySelector('.node-surface')                       ;
    let cw=156,ch=104;
    if(surface){const r=surface.getBoundingClientRect();if(r.width>0&&r.height>0){cw=r.width/zoom0;ch=r.height/zoom0}}
    const xs=nodes.map((n    )=>Number(n.x)),ys=nodes.map((n    )=>Number(n.y));
    const minX=Math.min(...xs),minY=Math.min(...ys),maxX=Math.max(...xs)+cw,maxY=Math.max(...ys)+ch;
    const bw=maxX-minX,bh=maxY-minY,pad=18;
    if(![bw,bh].every(v=>Number.isFinite(v)&&v>0))return;
    const z=Math.max(0.15,Math.min(2,Math.min((w-2*pad)/bw,(h-2*pad)/bh)));
    model.camera={x:(w-bw*z)/2-minX*z,y:(h-bh*z)/2-minY*z,zoom:z};
    instance?.render();
  };

  const render=()=>{
    const active=document.activeElement                ;
    if(active&&active!==document.body&&active.closest('#m0StructuredSpatial,#domainLeftRegion,#domainContext'))lastFocus=focusKey(active);
    const locale=activeLocale(),t=pickText(locale)                         ;
    const projection=projectionOf(),tasks=projection.tasks||[],edges=projection.edges||[];
    const selection=domain.selectionContext(),validation=validationOf(),preflight=preflightOf();
    const published=projection.lifecycle==='PUBLISHED';
    const errors=validation?.errors||[];
    const branches=edges.filter((e    )=>['optional','conditional','branch'].includes(e.type));

    const handoffA=availability('labs.handoff'),publishA=availability('labs.publish'),preflightA=availability('labs.preflight');
    const palette=[['select','select',t.select,true],['addTask','plus',t.addTask,false],['connect','connect',t.connect,true],['addBranch','branch',t.addBranch,true]]         ;
    const paletteHtml=palette.map(([id,glyph,label,toggle])=>
      `<button type="button" class="w03l-btn" data-tool="${id}"${toggle?` aria-pressed="${id==='select'?state.tool==='select':id==='connect'?(state.tool==='connect'&&!state.branchArmed):state.branchArmed}"`:''}>${icon(glyph)}<span>${esc(String(label))}</span></button>`).join('');

    const lifecycle=[['validate','shieldCheck',t.validate,preflightA],['publish','publish',t.publish,publishA],['prepare','run',t.prepare,handoffA]]         ;
    const lifecycleHtml=lifecycle.map(([id,glyph,label,a])=>
      `<button type="button" class="w03l-btn" data-action="${id}" data-primary="${id==='prepare'}" ${a.enabled?'':'disabled'} title="${esc(a.reason||'')}">${icon(glyph)}<span>${esc(String(label))}</span></button>`).join('');

    const statusTone=state.status?state.status.tone:(errors.length?'error':published?'ok':'warn');
    const statusText=state.status?state.status.text
      :errors.length?fill(String(t.stValidationFailed),{n:String(errors.length)})
      :published?String(t.stReady)
      :String(pickText(locale).stDraft||t.lifecycle);

    /* Fill the workspace viewport (not merely its content): the graph board is the work surface,
       so it takes the pane height instead of leaving a dead strip under the legend. */
    const scrollBox=doc                    ,available=scrollBox?.clientHeight||0;
    host .style.minHeight=available?`${Math.max(440,available-24)}px`:'';
    host .innerHTML=`<div class="w03l" data-w03-surface="labs" aria-label="${esc(t.boardAria)}">
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
    ensureLabStyle(host );
    /* Regions first, then bind: renderRegions() replaces the pane subtrees, so binding before it
       would attach handlers to nodes that are immediately discarded (dead pane clicks). */
    renderRegions();
    bind(host ,locale);

    const graphHost=host .querySelector('[data-lab-graph]')                    ;
    if(graphHost){
      const {nodes,relations}=graphModel(tasks,edges);
      if(!nodes.length){
        graphHost.innerHTML=`<p class="w03l-hint" style="margin:24px">${esc(t.emptyGraph)} — ${esc(t.emptyGraphHint)}</p>`;
      }else{
        const holder                           ={current:null};
        view=new SpatialView(graphHost,nodes,relations,{
          change:()=>paintGraph(holder.current),
          select:(ids         )=>{const id=ids.at(-1);if(!id)return;onNodeClick(String(id))},
          edgeSelect:(id    )=>{if(!id)return;selectBranch(String(id).replace(/^edge:/,''))},
          open:(id    )=>{if(!id)return;onNodeClick(String(id))}
        });
        holder.current=view;
        view.setActiveMode(published?'review':'author');
        const focusId=selection?.kind==='task'?String(selection.id):null;
        if(focusId&&nodes.some((n    )=>n.id===focusId)){try{view.model.select?.(focusId);view.render?.()}catch{}}
        fitToBox(view);
        paintGraph(view);
        requestAnimationFrame(()=>{fitToBox(view);paintGraph(view)});
        setTimeout(()=>{fitToBox(view);paintGraph(view)},140);
      }
    }
    if(lastFocus){
      const target=document.querySelector(lastFocus)                    ;
      if(target&&target!==document.activeElement&&typeof target.focus==='function')target.focus({preventScroll:true});
      lastFocus=null;
    }
  };

  /* ---------------------------------------------------------------- binding */

  const closeMenus=(root           )=>{
    root.querySelectorAll('.w03l-menu[data-menu-panel]').forEach(p=>p.setAttribute('hidden',''));
    root.querySelectorAll('[data-menu]').forEach(b=>b.setAttribute('aria-expanded','false'));
  };

  const bind=(root            ,locale          )=>{
    const t=pickText(locale)                         ;
    root.querySelectorAll             ('[data-tool]').forEach(node=>node.onclick=()=>{
      const tool=node.dataset.tool;
      if(tool==='select'){state.tool='select';state.branchArmed=false;state.endpoints=[];setStatus('accent',String(t.toolActive).replace('{tool}',String(t.select)));render();return}
      if(tool==='connect'){state.tool='connect';state.branchArmed=false;state.endpoints=[];setStatus('accent',String(t.connectArmed));render();return}
      if(tool==='addBranch'){armConnect(true);return}
      if(tool==='addTask'){state.tool='select';addTask()}
    });
    root.querySelectorAll             ('[data-action]').forEach(node=>node.onclick=()=>{state.menu=null;action(String(node.dataset.action))});
    root.querySelectorAll             ('[data-menu]').forEach(node=>node.onclick=event=>{
      event.stopPropagation();
      const panel=root.querySelector(`[data-menu-panel="${node.dataset.menu}"]`)                    ;
      const open=panel?.hasAttribute('hidden')!==false;
      closeMenus(root);
      if(panel&&open){panel.removeAttribute('hidden');node.setAttribute('aria-expanded','true');state.menu=String(node.dataset.menu)}
      else state.menu=null;
    });
    const struct=document.querySelector('#domainLeftRegion');
    struct?.querySelectorAll             ('[data-facet]').forEach(node=>node.onclick=()=>{
      state.facet=node.dataset.facet||'taskGraph';render();
    });
    struct?.querySelectorAll             ('[data-step]').forEach(node=>node.onclick=()=>selectTask(String(node.dataset.step)));
    struct?.querySelectorAll             ('[data-branch]').forEach(node=>node.onclick=()=>selectBranch(String(node.dataset.branch)));
    const ctx=document.querySelector('#domainContext');
    ctx?.querySelectorAll             ('[data-lab-close]').forEach(node=>node.onclick=()=>{
      const toggle=document.querySelector('#rightPane .phead [data-pane-toggle-label]')?.closest('button')
        ||document.querySelector('#rightLocalReveal');
      (toggle                    )?.click?.();
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
    ws.onPreferences=(preferences    )=>{try{original?.(preferences)}catch{};commandLocale=null;render()};
    return true;
  };

  let retries=0;
  const boot=()=>{
    if(!foundation()?.workspace){if(++retries<60){setTimeout(boot,40)}else{render()}return}
    if(installChrome())render();else if(++retries<60)setTimeout(boot,40);
  };

  document.addEventListener('click',event=>{
    if(!(event.target           )?.closest?.('.w03l-menuwrap')){if(state.menu){state.menu=null;closeMenus(host );render()}}
  });

  render();
  setTimeout(boot,0);
  return {host,refresh:render,owner:'LabTaskGraphIdentity'};
}
