/**
 * W03-RUNS presentation orchestrator.
 *
 * Composes the Run operations workspace: lifecycle action bar, run identity strip, the
 * operational telemetry workbench (or preparation / timeline / topology projections), the
 * terminal deep-work tray and the runtime-truth status line — plus the shell LEFT "Run
 * Structure" and RIGHT context regions when a workspace handle is supplied.
 *
 * Composition, hierarchy, density and emphasis are surface-specific; only mechanics (command
 * bus, panes, terminal host) are shared. Nothing here fabricates run, terminal or persistence
 * success — unavailable platform capability is reported as UNVERIFIED_PLATFORM_GATE.
 */
import {RUNS_STYLE} from './styles.js';
import {runsT,runsLocale} from './i18n.js';
import {esc,ltr,pill,icon,stateTone} from './util.js';
import {renderView} from './views.js';
import {runsLeftRegion,runsRightRegion} from './regions.js';

const MODES=[['operations','operations'],['preflight','preflight'],['timeline','timeline'],['topology','topology']];
const MODE_DEFAULT_VIEW={operations:'telemetry',preflight:'preflight',timeline:'timeline',topology:'devices'};
const VIEW_MODE={telemetry:'operations',tasks:'operations',events:'operations',observations:'operations',artifacts:'operations',overview:'operations',preflight:'preflight',timeline:'timeline',devices:'topology'};
const mounts=new WeakMap();
let activeController=null;
let delegated=false;

const ensureStyle=doc=>{
  if(doc.getElementById('runs-local-style'))return;
  const holder=doc.createElement('div');holder.innerHTML=RUNS_STYLE;
  const node=holder.firstElementChild;if(node){node.id='runs-local-style';doc.head.appendChild(node)}
};

function collectPreserved(root){
  const box=root.__runsPreserved||(root.__runsPreserved={});
  if(!box.spatial){box.heading=root.querySelector('.domain-heading');box.spatial=root.querySelector('#spatialHost');box.domainView=root.querySelector('#domainView');box.terminal=root.querySelector('#operationalHost')}
  return box;
}
function detachPreserved(root){
  const box=collectPreserved(root);
  for(const node of [box.heading,box.spatial,box.domainView,box.terminal])if(node&&node.parentNode===root)root.removeChild(node);
  return box;
}
function restorePreserved(root,box,terminalTray){
  for(const node of [box.heading,box.spatial,box.domainView]){
    if(!node)continue;
    node.style.display='none';node.setAttribute('aria-hidden','true');node.inert=true;node.hidden=true;
    if(node.parentNode!==root)root.appendChild(node);
  }
  if(box.terminal){
    if(terminalTray&&box.terminal.parentNode!==terminalTray)terminalTray.appendChild(box.terminal);
    else if(box.terminal.parentNode!==root)root.appendChild(box.terminal);
  }
}

export function renderRunsSurface(root,composition,{dir=null,locale=null,initialMode='operations',initialView=null,regions='shell',workspace=null}={}){
  if(!root||!composition)throw Error('RUNS_PRESENTATION_INPUT_REQUIRED');
  const domain=composition.domain;
  const prior=mounts.get(root);
  if(prior&&prior.composition===composition){prior.api.rebind({dir,locale,regions,workspace});prior.draw();return prior.api}
  ensureStyle(root.ownerDocument||document);

  let boundDir=dir,boundLocale=locale,boundRegions=regions,boundWorkspace=workspace;
  const state={
    mode:MODES.some(([id])=>id===initialMode)?initialMode:'operations',
    view:initialView||MODE_DEFAULT_VIEW[initialMode==='operations'?'operations':initialMode]||'telemetry',
    source:'ALL',highOnly:false,selectedId:null,detailTab:'timeline',query:'',highlight:false,overflow:false
  };
  let statusMessage='';
  let statusTone='';

  const dirOf=()=>{
    const doc=root.ownerDocument||document;
    if(boundDir)return boundDir;
    return doc.documentElement.dir||doc.body.dir||'ltr';
  };
  const localeOf=()=>boundLocale||runsLocale(root.ownerDocument||document);
  const avail=(id,payload={})=>{try{return composition.bus.availability(id,payload)}catch{return {enabled:false,reason:'Command unavailable',code:'ERROR'}}};
  const execute=(id,payload={})=>{
    try{
      const result=composition.bus.execute(id,payload);
      if(result&&result.ok===false){statusMessage=`${result.code||id}: ${result.reason||'Command refused.'}`;statusTone='error';return result}
      statusMessage=`${id} · ${result?.after||result?.status||result?.runtimeTruth||'receipt recorded'} · ${domain.owner}`;
      statusTone='ok';return result;
    }catch(error){statusMessage=`${error?.code||'ERROR'}: ${error?.message||String(error)}`;statusTone='error';return {ok:false,error}}
  };

  const facts=w=>{
    const t=runsT(localeOf());
    return `<dl class="runs-facts">
      <div class="runs-fact"><dt>${esc(t.identity.phase)}</dt><dd>${esc(w.identity.phase)}</dd></div>
      <div class="runs-fact"><dt>${esc(t.identity.role)}</dt><dd>${esc(w.identity.role)}</dd></div>
      <div class="runs-fact" data-emphasis="on"><dt>${esc(t.identity.task)}</dt><dd title="${esc(w.identity.task)}">${esc(w.identity.task)}</dd></div>
      <div class="runs-fact"><dt>${esc(t.identity.health)}</dt><dd>${pill(w.identity.health,stateTone(w.identity.health))}</dd></div>
    </dl>`;
  };
  const actions=(w,t)=>{
    const lifecycle=w.run.lifecycle;
    const running=lifecycle==='RUNNING',paused=lifecycle==='PAUSED',active=running||paused;
    const start=avail('runs.start'),prepare=avail('runs.prepare');
    const buttons=active
      ? [
          `<button class="runs-btn" type="button" data-command="${running?'runs.pause':'runs.resume'}" data-icon>${icon(running?'pause':'play',12)}${esc(running?t.actions.pause:t.actions.resume)}</button>`,
          `<button class="runs-btn" type="button" data-kind="danger" data-command="runs.stop" data-icon>${icon('stop',12)}${esc(t.actions.stop)}</button>`,
          `<button class="runs-btn" type="button" data-command="runs.captureSnapshot" data-icon>${icon('camera',12)}${esc(t.actions.snapshot)}</button>`
        ]
      : [
          `<button class="runs-btn" type="button" data-kind="primary" data-command="runs.start" data-icon ${start.enabled?'':'disabled title="'+esc(start.reason||'')+'"'}>${icon('play',12)}${esc(t.actions.start)}</button>`,
          `<button class="runs-btn" type="button" data-command="runs.prepare" data-icon ${prepare.enabled?'':'disabled title="'+esc(prepare.reason||'')+'"'}>${icon('layers',12)}${esc(t.actions.prepare)}</button>`,
          `<button class="runs-btn" type="button" data-command="runs.preflight" data-icon>${icon('shield',12)}${esc(t.actions.preflight)}</button>`
        ];
    buttons.push(`<button class="runs-btn" type="button" data-overflow data-icon aria-haspopup="menu" aria-expanded="${state.overflow?'true':'false'}" aria-label="${esc(t.actions.more)}">${icon('list',12)}</button>`);
    const overflow=`<div class="runs-menu" role="menu" ${state.overflow?'':'hidden'}>
      <button class="runs-menuitem" role="menuitem" type="button" data-view="preflight">${icon('shield',12)}${esc(t.actions.preflight)}</button>
      <button class="runs-menuitem" role="menuitem" type="button" data-command="runs.captureSnapshot" ${active?'':'disabled'}>${icon('camera',12)}${esc(t.actions.snapshot)}</button>
      <button class="runs-menuitem" role="menuitem" type="button" data-command="runs.seal">${icon('archive',12)}${esc(localeOf()==='ar'?'معاينة الختم':'Seal handoff preview')}</button>
      <button class="runs-menuitem" role="menuitem" type="button" data-command="view.recorded">${icon('eye',12)}${esc(localeOf()==='ar'?'عرض الحقيقة المسجّلة':'View recorded truth')}</button>
      <div class="runs-menuhint">${esc(t.right.platformNote)}</div></div>`;
    return `<div class="runs-actions">${buttons.join('')}${overflow}</div>`;
  };
  const identity=w=>{
    const t=runsT(localeOf());
    const title=localeOf()==='ar'&&w.identity.titleAr?w.identity.titleAr:w.identity.title;
    return `<header class="runs-identity">
      <span class="runs-idmark">${icon('activity',17)}</span>
      <div class="runs-idmain"><h1>${esc(title)}</h1>
        <div class="runs-idsub">${ltr(w.identity.runId)} · ${esc(w.identity.runType)} ${pill(w.run.lifecycle,stateTone(w.run.lifecycle))}</div></div>
      ${facts(w)}
    </header>`;
  };
  const tabBar=t=>`<div class="runs-tabs" role="tablist" aria-label="${esc(t.workspace)}">
    ${MODES.map(([id,key])=>`<button class="runs-tab" type="button" role="tab" data-runs-tab="${id}" aria-selected="${state.mode===id?'true':'false'}">${esc(t.tabs[key])}</button>`).join('')}</div>`;
  const statusLine=(w,t)=>`<div class="runs-status">
      ${pill(w.provider.connected?t.status.connected:t.status.disconnected,w.provider.connected?'success':'danger')}
      ${pill(t.status.truth,'info',true)}${pill(t.status.unverified,'warning',true)}
      <bdi dir="ltr" class="runs-mono">${esc(w.provider.id)} · epoch ${esc(w.provider.epoch)}</bdi>
      <span class="runs-spacer"></span>
      <span class="runs-statusmsg" data-tone="${statusTone}">${esc(statusMessage||t.readiness.noWrite)}</span>
    </div>`;

  const draw=()=>{
    const w=domain.workspace();
    const t=runsT(localeOf());
    const preserved=detachPreserved(root);
    const rows=state.source==='ALL'?w.alerts:w.alerts.filter(a=>a.source===state.source);
    const filtered=state.highOnly?rows.filter(a=>a.sev==='High'):rows;
    const selected=w.alerts.find(a=>a.id===state.selectedId)||filtered[0]||w.alerts[0]||null;
    state.selectedId=selected?selected.id:null;
    const ctx={t,locale:localeOf(),state,selected,composition,avail,
      can:{start:avail('runs.start').enabled,terminal:avail('OPEN_TERMINAL').enabled}};

    const shellRegions=boundRegions==='shell'&&boundWorkspace;
    if(shellRegions){
      try{
        boundWorkspace.region('LEFT',{html:runsLeftRegion(w,ctx),label:t.structure.title});
        boundWorkspace.region('RIGHT',{html:runsRightRegion(w,ctx),label:t.right.rationale});
      }catch(error){
        boundRegions='embedded';
        statusMessage=`Region binding unavailable: ${error?.message||error}; rendering embedded regions.`;
        statusTone='error';
      }
    }
    const embedded=boundRegions!=='shell'||!boundWorkspace;
    const rails=embedded?`<aside class="runs-rail" data-side="start" aria-label="${esc(t.nav.label)}">${runsLeftRegion(w,ctx)}</aside>`:'';
    const endRail=embedded?`<aside class="runs-rail" data-side="end" aria-label="${esc(t.workspace)}">${runsRightRegion(w,ctx)}</aside>`:'';

    root.setAttribute('data-runs-root','1');
    root.setAttribute('dir',dirOf());
    root.setAttribute('aria-label',t.workspace);
    root.innerHTML=`<section class="runs-workspace" dir="${dirOf()}">
      <div class="runs-bar">${tabBar(t)}${actions(w,t)}</div>
      ${identity(w)}
      <div class="runs-body">${rails}<div class="runs-pane" data-runs-center tabindex="-1" style="min-width:0">${renderView(state.view,w,ctx)}</div>${endRail}</div>
      <div class="runs-terminal" data-runs-terminal>
        <div class="runs-terminalbar"><span class="runs-terminallabel">${icon('terminal',13)}${esc(t.status.terminal)}</span>
          <span class="runs-terminalhint">${esc(t.status.terminalIdle)}</span>
          <button class="runs-chipbtn" type="button" data-view="devices">${icon('box',11)}${esc(t.structure.devices)}</button></div>
      </div>
      ${statusLine(w,t)}
    </section>`;
    restorePreserved(root,preserved,root.querySelector('[data-runs-terminal]'));
    wire();
  };

  const rerender=()=>{
    const doc=root.ownerDocument||document;
    const active=doc.activeElement;
    const hadFilter=active&&active.matches&&active.matches('[data-event-filter]');
    const caret=hadFilter?active.selectionStart:null;
    draw();
    if(hadFilter){const next=doc.querySelector('[data-event-filter]');if(next){next.focus();try{next.setSelectionRange(caret,caret)}catch{}}}
  };

  const setSelection=id=>{state.selectedId=id;state.detailTab='timeline'};
  const exportEvents=w=>{
    const doc=root.ownerDocument||document;
    const t=runsT(localeOf());
    const rows=(state.source==='ALL'?w.events:w.events.filter(e=>e.source===state.source));
    try{
      const header=['sequence','time_utc','source','event_type','details','actor'];
      const csv=[header.join(',')].concat(rows.map(e=>[e.seq,e.time,e.source,e.type,e.detail,e.actor].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))).join('\n');
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
      const url=URL.createObjectURL(blob);const a=doc.createElement('a');
      a.href=url;a.download=`${w.identity.runId}-observed-events.csv`;doc.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),2000);
      statusMessage=t.detail.exported(rows.length);statusTone='ok';
    }catch(error){statusMessage=t.detail.exportFail;statusTone='error'}
  };

  const controller={
    composition,state,draw,
    api:{
      refresh:draw,
      focus:()=>root.querySelector('[data-runs-center]')?.focus(),
      state:()=>({mode:state.mode,view:state.view,selectedId:state.selectedId,locale:localeOf(),dir:dirOf()}),
      setMode:value=>{if(MODES.some(([id])=>id===value)){state.mode=value;state.view=MODE_DEFAULT_VIEW[value];draw()}},
      setView:value=>{state.view=value;state.mode=VIEW_MODE[value]||state.mode;draw()},
      mode:()=>state.mode,
      rebind:patch=>{if(!patch)return;if('dir' in patch)boundDir=patch.dir;if('locale' in patch)boundLocale=patch.locale;if('regions' in patch)boundRegions=patch.regions||'shell';if('workspace' in patch)boundWorkspace=patch.workspace||null},
      execute
    }
  };
  mounts.set(root,controller);activeController=controller;

  function wire(){
    if(delegated)return;
    delegated=true;
    const resolve=event=>{
      const el=event.target?.closest?.('[data-view],[data-source],[data-select],[data-detail-tab],[data-command],[data-highlight],[data-export],[data-refresh],[data-filter-high],[data-runs-tab],[data-overflow]');
      if(!el||el.disabled)return null;
      if(el.closest('[data-runs-root]')||el.closest('[data-runs-region]'))return el;
      return null;
    };
    document.addEventListener('click',event=>{
      const el=resolve(event);if(!el)return;
      const ctl=activeController;if(!ctl)return;
      const {state:s,composition:comp}=ctl;const w=comp.domain.workspace();const t=runsT(runsLocale(document));
      if(el.dataset.runsTab){state.mode=el.dataset.runsTab;state.view=MODE_DEFAULT_VIEW[state.mode];state.overflow=false;ctl.draw();return}
      if(el.dataset.view){state.view=el.dataset.view;state.mode=VIEW_MODE[state.view]||state.mode;state.overflow=false;ctl.draw();return}
      if(el.hasAttribute('data-overflow')){state.overflow=!state.overflow;ctl.draw();return}
      if(el.dataset.source){state.source=el.dataset.source;state.selectedId=null;ctl.draw();return}
      if(el.dataset.select){setSelection(el.dataset.select);ctl.draw();return}
      if(el.dataset.detailTab){state.detailTab=el.dataset.detailTab;ctl.draw();return}
      if(el.hasAttribute('data-highlight')){state.highlight=!state.highlight;ctl.draw();return}
      if(el.hasAttribute('data-filter-high')){state.highOnly=!state.highOnly;state.selectedId=null;ctl.draw();return}
      if(el.hasAttribute('data-refresh')){statusMessage=`${t.alerts.refresh} · ${w.counts.alerts}/${w.counts.events} observed · ${w.provider.id}`;statusTone='ok';ctl.draw();return}
      if(el.hasAttribute('data-export')){exportEvents(w);ctl.draw();return}
      if(el.dataset.command){
        const payload={};if(el.dataset.device)payload.deviceId=el.dataset.device;
        if(['runs.pause','runs.resume','runs.stop'].includes(el.dataset.command))payload.invocationId=`ui-${el.dataset.command}-${Date.now()}`;
        execute(el.dataset.command,payload);
        if(['runs.preflight'].includes(el.dataset.command)){state.mode='preflight';state.view='preflight'}
        ctl.draw();return;
      }
    },false);
    document.addEventListener('input',event=>{
      if(!event.target?.matches?.('[data-event-filter]'))return;
      state.query=event.target.value;rerender();
    },false);
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&state.overflow){state.overflow=false;activeController?.draw();return}
      if((event.key==='Enter'||event.key===' ')&&event.target?.matches?.('tr[data-select]')){event.preventDefault();setSelection(event.target.dataset.select);activeController?.draw()}
    },false);
  }
  draw();
  return controller.api;
}
