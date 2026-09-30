/**
 * W03-RUNS view renderers — pure functions returning HTML for the centre workbench and the
 * two contextual regions. Every projection is derived from `domain.workspace()` (v3.4 fixture +
 * live adapter state): no invented facts, no fabricated run/terminal/persistence success.
 */
import {esc,ltr,sevTone,stateTone,pill,tag,icon} from './util.js';

const el=(html,cls='')=>cls?`<div class="${cls}">${html}</div>`:html;
export const RUN_STRUCTURE=state=>[
  {id:'overview',key:'overview',icon:'grid'},
  {id:'timeline',key:'timeline',icon:'clock'},
  {id:'tasks',key:'tasks',icon:'tasks',count:w=>w.counts.tasks},
  {id:'devices',key:'devices',icon:'box',count:w=>w.counts.devices},
  {id:'events',key:'events',icon:'activity',count:w=>w.counts.events},
  {id:'telemetry',key:'telemetry',icon:'target',count:w=>w.counts.alerts},
  {id:'observations',key:'observations',icon:'eye',count:w=>w.counts.observations},
  {id:'artifacts',key:'artifacts',icon:'archive',count:w=>w.counts.artifacts}
];

/* ------------------------------------------------------------------ OPERATIONS (alerts workbench) */
function filteredAlerts(w,state){
  let rows=w.alerts;
  if(state.source&&state.source!=='ALL')rows=rows.filter(alert=>alert.source===state.source);
  if(state.highOnly)rows=rows.filter(alert=>alert.sev==='High');
  return rows;
}
function alertRow(alert,selected,highlight,query){
  const hit=query&&alert.title.toLowerCase().includes(query);
  return `<tr data-select="${esc(alert.id)}" aria-selected="${selected?'true':'false'}" tabindex="0">
    <td><span class="runs-dot" data-sev="${esc(alert.sev)}"></span><bdi dir="ltr">${esc(alert.time)}</bdi></td>
    <td><strong>${hit?`<span class="runs-hl">${esc(alert.title)}</span>`:esc(alert.title)}</strong><span class="runs-sub">${esc(alert.sub)}</span></td>
    <td>${pill(alert.sev,sevTone(alert.sev))}</td>
    <td>${tag(alert.status,alert.status==='New'?'info':'neutral')}</td></tr>`;
}
function eventTable(w,c,limit=0){
  const {state,t}=c;const query=(state.query||'').trim().toLowerCase();
  let rows=w.events;
  if(state.source&&state.source!=='ALL')rows=rows.filter(event=>event.source===state.source);
  const total=rows.length;
  if(limit)rows=rows.slice(0,limit);
  if(!rows.length)return `<div class="runs-empty">${icon('filter',16)}<strong>${esc(t.detail.matches(0))}</strong><span>${esc(t.alerts.none)}</span></div>`;
  return `<div class="runs-tablewrap"><table class="runs-table"><thead><tr>
      <th>${esc(t.detail.cols.t)}</th><th>${esc(t.detail.cols.s)}</th><th>${esc(t.detail.cols.e)}</th><th>${esc(t.detail.cols.d)}</th></tr></thead>
    <tbody>${rows.map(event=>{
      const hit=query&&`${event.type} ${event.detail}`.toLowerCase().includes(query);
      return `<tr data-noop="1"><td><bdi dir="ltr">${esc(event.time)}</bdi></td><td>${esc(event.source)}</td>
      <td><strong>${hit?`<span class="runs-hl">${esc(event.type)}</span>`:esc(event.type)}</strong></td>
      <td>${hit&&query?highlightText(event.detail,query):esc(event.detail)}</td></tr>`}).join('')}</tbody></table>
    ${total>rows.length?`<div class="runs-pager">${esc(t.detail.matches(total-rows.length))} hidden</div>`:''}</div>`;
}
const highlightText=(text,query)=>{const idx=String(text).toLowerCase().indexOf(query);if(idx<0)return esc(text);
  return `${esc(text.slice(0,idx))}<span class="runs-hl">${esc(text.slice(idx,idx+query.length))}</span>${esc(text.slice(idx+query.length))}`};

function detailPanel(w,c){
  const {t,state}=c;const alert=c.selected;
  if(!alert)return `<div class="runs-panehead"><h2>${esc(t.detail.title)}</h2></div>
    <div class="runs-empty">${icon('target',18)}<strong>${esc(t.right.noSelection)}</strong></div>`;
  const tabs=[['timeline',t.detail.tabs.timeline],['rule',t.detail.tabs.rule],['attributes',t.detail.tabs.attributes],['artifacts',t.detail.tabs.artifacts]];
  const body=state.detailTab==='rule'
    ? `<div class="runs-ledger"><dl class="runs-kv">
        <dt>${esc(t.detail.rule)}</dt><dd>${ltr(alert.rule)}</dd>
        <dt>${esc(t.detail.technique)}</dt><dd>${esc(alert.technique)}</dd>
        <dt>${esc(t.detail.source)}</dt><dd>${esc(alert.source)}</dd>
        <dt>${esc(t.alerts.severity)}</dt><dd>${pill(alert.sev,sevTone(alert.sev))}</dd></dl>
       <div class="runs-note" data-tone="info">${esc(alert.detail)}</div></div>`
    : state.detailTab==='attributes'
      ? `<div class="runs-ledger"><dl class="runs-kv">
          <dt>${esc(t.detail.source)}</dt><dd>${esc(alert.source)}</dd>
          <dt>${esc(t.detail.ip)}</dt><dd>${ltr(alert.ip)}</dd>
          <dt>${esc(t.detail.uri)}</dt><dd>${ltr(alert.uri)}</dd>
          <dt>${esc(t.detail.method)}</dt><dd>${ltr(alert.method)}</dd>
          <dt>${esc(t.detail.status)}</dt><dd>${esc(alert.status)}</dd>
          <dt>${esc(t.detail.run)}</dt><dd>${ltr(w.identity.runId)}</dd></dl>
         <p class="runs-terminalhint">${esc(t.readiness.noWrite)}</p></div>`
      : state.detailTab==='artifacts'
        ? artifactTable(w,c)
        : eventTable(w,c);
  return `<div class="runs-panehead"><h2>${esc(t.detail.title)}</h2>${pill(alert.sev,sevTone(alert.sev))}${tag(alert.status,'info')}
      <span class="runs-scope">${ltr(alert.id)}</span></div>
    <dl class="runs-detailgrid">
      <dt>${esc(t.detail.source)}</dt><dd>${esc(alert.source)}</dd>
      <dt>${esc(t.detail.id)}</dt><dd>${ltr(alert.id)}</dd>
      <dt>${esc(t.detail.ip)}</dt><dd>${ltr(alert.ip)}</dd>
      <dt>${esc(t.detail.rule)}</dt><dd>${ltr(alert.rule)}</dd>
      <dt>${esc(t.detail.uri)}</dt><dd>${ltr(alert.method+' '+alert.uri)}</dd>
      <dt>${esc(t.detail.technique)}</dt><dd>${esc(alert.technique)}</dd>
      <dt>${esc(t.detail.first)}</dt><dd>${ltr(alert.time+' UTC')}</dd>
      <dt>${esc(t.detail.run)}</dt><dd>${ltr(w.identity.runId)}</dd>
    </dl>
    <div class="runs-subtabs" role="tablist">${tabs.map(([id,label])=>`<button class="runs-subtab" type="button" role="tab" data-detail-tab="${id}" aria-selected="${state.detailTab===id?'true':'false'}">${esc(label)}${id==='artifacts'?` (${w.counts.artifacts})`:''}</button>`).join('')}</div>
    <div class="runs-pane" style="flex:1">${body}</div>
    <div class="runs-detailfoot">
      <label class="runs-search">${icon('search',12)}<input type="search" data-event-filter placeholder="${esc(t.detail.filter)}" value="${esc(state.query||'')}" aria-label="${esc(t.detail.filter)}"></label>
      <button class="runs-toggle" type="button" data-highlight aria-pressed="${state.highlight?'true':'false'}"><span class="runs-switch"></span>${esc(t.detail.highlight)}</button>
      <button class="runs-btn" type="button" data-export data-icon>${icon('download',12)}${esc(t.detail.export)}</button>
    </div>`;
}
function alertList(w,c){
  const {t,state}=c;const rows=filteredAlerts(w,state);
  const chips=[
    `<button class="runs-chipbtn" type="button" data-filter-high aria-pressed="${state.highOnly?'true':'false'}">${icon('filter',11)}${esc(t.alerts.severity)}: High</button>`,
    `<span class="runs-scope">${esc(t.alerts.range('10:18:09 – 10:24:31 UTC'))}</span>`
  ].join('');
  return `<div class="runs-panehead"><h2>${esc(t.alerts.title)}</h2><span class="runs-count">${rows.length}</span>
      <button class="runs-chipbtn" type="button" data-refresh aria-label="${esc(t.alerts.refresh)}" title="${esc(t.alerts.refresh)}">${icon('refresh',11)}</button>
      <span style="flex:1"></span>${chips}</div>
    ${rows.length?`<div class="runs-tablewrap"><table class="runs-table"><thead><tr>
        <th>${esc(t.alerts.time)}</th><th>${esc(t.alerts.alert)}</th><th>${esc(t.alerts.severity)}</th><th>${esc(t.alerts.status)}</th></tr></thead>
      <tbody>${rows.map(alert=>alertRow(alert,alert.id===state.selectedId,state.highlight,state.query?.trim().toLowerCase())).join('')}</tbody></table></div>
      <div class="runs-pager"><button class="runs-pagebtn" type="button" disabled aria-label="previous">‹</button>
        <span>1–${rows.length} of ${rows.length}</span>
        <button class="runs-pagebtn" type="button" disabled aria-label="next">›</button></div>`
    :`<div class="runs-empty">${icon('filter',16)}<strong>${esc(t.alerts.none)}</strong><span>${esc(t.alerts.filters)}</span></div>`}`;
}
export function renderOperations(w,c){
  const sourceTabs=[{id:'ALL',label:c.t.sourceTabs.all,count:w.counts.alerts},...w.sources.map(s=>({id:s.id,label:s.label,count:s.alerts+s.events}))];
  return `<div class="runs-panehead" style="position:static">
      <div class="runs-tabs" role="tablist">${sourceTabs.map(tab=>`<button class="runs-tab" type="button" role="tab" data-source="${esc(tab.id)}" aria-selected="${(c.state.source||'ALL')===tab.id?'true':'false'}" style="min-height:34px">${esc(tab.label)}<span class="runs-navcount">${tab.count}</span></button>`).join('')}</div>
      <span class="runs-scope">${esc(c.t.status.truth)}</span></div>
    <div class="runs-split"><div class="runs-pane">${alertList(w,c)}</div><div class="runs-pane">${detailPanel(w,c)}</div></div>`;
}

/* ------------------------------------------------------------------ PREFLIGHT (preparation state) */
export function renderPreflight(w,c){
  const {t}=c;const p=w.preflight,src=p.source||{},m=w.manifest;
  const pass=p.checks.filter(check=>check.status==='PASS').length;
  const blocked=p.checks.filter(check=>check.status==='BLOCKED').length;
  const advisory=p.checks.filter(check=>check.status==='ADVISORY'||check.status==='WARNING').length;
  const ready=p.status==='READY';
  const terminal=['STOPPED','COMPLETED','FAILED'].includes(w.run.lifecycle);
  const active=['RUNNING','PAUSED'].includes(w.run.lifecycle);
  const verdictState=active?'ACTIVE':terminal?'CLOSED':p.status;
  const verdictTitle=active?t.banner.active:terminal?t.banner.closed:ready?t.banner.ready:t.banner.blocked;
  const verdictWhy=active?t.banner.activeWhy:terminal?t.banner.closedWhy:ready?t.banner.readyWhy:t.banner.blockedWhy;
  const verdictTone=active||ready?'ok':'info';
  const card=(n,head,body,cls='')=>`<section class="runs-card ${cls}"><div class="runs-cardhead"><span class="runs-step">${n}</span><h3>${head}</h3></div>${body}</section>`;
  const kv=(pairs)=>`<dl class="runs-kv">${pairs.filter(Boolean).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
  return `<div class="runs-preflight">
    ${card(1,esc(t.panels.preflight.source),kv([
      [t.detail.run,`<bdi dir="ltr">${esc(src.definitionId||'—')}</bdi>`],
      [t.panels.preflight.revision,`<bdi dir="ltr">${esc(src.definitionRevision||'—')}</bdi>`],
      ['Baseline',`<bdi dir="ltr">${esc(src.baselineId||'—')}</bdi>`],
      ['Digital Twin',`<bdi dir="ltr">${esc(src.twinRevision||'—')}</bdi>`],
      [t.identity.run,esc(src.runType||w.identity.runType)],
      ['Enterprise',esc(w.identity.enterprise||'—')]
    ]))}
    ${card(2,esc(t.panels.preflight.manifest),kv([
      [t.panels.overview.manifest,`<bdi dir="ltr">${esc(m.id)}</bdi>`],
      [t.panels.overview.digest,`<bdi dir="ltr">${esc(String(m.inputDigest).slice(0,26))}…</bdi>`],
      [t.panels.overview.seed,`<bdi dir="ltr">${esc(m.seed)}</bdi>`],
      [t.panels.overview.engine,`<bdi dir="ltr">${esc(m.engine)}</bdi>`],
      [t.panels.overview.isolation,`<bdi dir="ltr">${esc(m.isolationScope)}</bdi>`],
      [t.panels.overview.createdAt,`<bdi dir="ltr">${esc(String(m.createdAt).replace('T',' ').replace(/\.\d+Z$/,' UTC'))}</bdi>`]
    ]))}
    ${card(3,esc(t.identity.run)+` · ${esc(w.identity.runType)}`,kv([
      [t.tabs.operations,esc(w.run.lifecycle)],
      [t.identity.phase,esc(w.identity.phase)],
      [t.identity.role,esc(w.identity.role)],
      [t.identity.health,pill(w.identity.health,stateTone(w.identity.health))]
    ]))}
    ${card(4,'Mode / Policy',kv([
      ['Guidance Mode',esc(w.mode.guidance)],
      ['Participation Mode',esc(w.mode.participation)],
      ['Role Policy',esc(w.mode.rolePolicy)],
      [t.right.provenance,esc(w.identity.provenance)]
    ]))}
    ${card(5,esc(t.structure.tasks)+' / '+esc(t.identity.role),`<div class="runs-modules">
      ${w.tasks.map(task=>`<div class="runs-module">${icon('tasks',12)}<span>${esc(task.label)}</span>${tag(task.status,task.status==='DONE'?'success':task.status==='ACTIVE'?'warning':'neutral')}</div>`).join('')}
    </div>`)}
    ${card(6,`${esc(t.panels.preflight.checks)} ${pill(p.status,stateTone(p.status))}`,
      `<div>${p.checks.map(check=>`<div class="runs-check">
        <span class="runs-checkico" style="color:${check.status==='PASS'?'var(--runs-ok)':check.status==='BLOCKED'?'var(--runs-bad)':'var(--runs-warn)'}">${icon(check.status==='PASS'?'check':check.status==='BLOCKED'?'lock':'alert',14)}</span>
        <span><strong>${esc(check.label)}</strong><small>${esc(check.detail)}</small></span>
        ${pill(check.status,check.status==='PASS'?'success':check.status==='BLOCKED'?'danger':'warning')}</div>`).join('')}</div>
      <div class="runs-note" data-tone="${ready?'ok':'info'}">${esc(t.readiness.noWrite)} ${esc(t.panels.preflight.immutability)}</div>`,
      'runs-card--wide')}
    <div class="runs-verdict" data-state="${verdictState}">
      <span class="runs-verdictico">${icon(active?'activity':terminal?'archive':ready?'play':'lock',20)}</span>
      <div class="runs-verdictcopy">
        <h3>${esc(verdictTitle)}${!ready&&!active&&!terminal?` — ${String(blocked)} ${esc(t.readiness.check.toLowerCase())}`:''}</h3>
        <p>${esc(verdictWhy)}</p>
        <p class="runs-summary" style="color:${verdictTone==='ok'?'#9df3d1':'#ffd9a6'}">${esc(t.banner.summary(pass,blocked,advisory))}</p>
      </div>
      <div class="runs-verdictact">
        <button class="runs-btn" type="button" data-command="runs.start" data-kind="primary" ${c.can.start?'':`disabled title="${esc(verdictWhy)}"`}>${icon('play',12)}${esc(t.actions.start)}</button>
        <small>${esc(c.can.start?t.banner.readyWhy:(p.checks.find(x=>x.status==='BLOCKED')?.detail||verdictWhy))}</small>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ TIMELINE / TOPOLOGY / PANELS */
export function renderTimeline(w,c){
  const {t}=c;
  return `<div class="runs-ledger">
    <div class="runs-ledgerhead">${icon('clock',15)}<h2>${esc(t.panels.timeline.title)}</h2>
      <p>${esc(t.panels.events.ordering)}</p><span class="runs-scope">${w.counts.events} events · ${ltr(w.run.lifecycle)}</span></div>
    <div class="runs-flow">${w.events.map((event,index)=>{
      const prev=w.events[index-1];const gap=prev&&Number(prev.seq)-Number(event.seq)>1;
      return `${gap?`<div class="runs-gap">${icon('alert',12)}${esc(t.panels.events.gaps(1))}: <bdi dir="ltr">${esc(Number(event.seq)+1)}..${esc(Number(prev.seq)-1)}</bdi></div>`:''}
      <div class="runs-flowrow"><span class="runs-seq">${ltr('#'+event.seq)}</span><span class="runs-when">${ltr(event.time)}</span>
        <span><strong>${esc(event.type)}</strong><small>${esc(event.detail)}</small></span><span class="runs-who">${ltr(event.actor)}</span></div>`}).join('')}
    </div>
    <div class="runs-note" data-tone="info">${esc(t.panels.events.gaps(w.gaps.length))} — ${esc(t.panels.events.ordering)}</div>
  </div>`;
}
function artifactTable(w,c,bare=false){
  const {t}=c;
  if(!w.artifacts.length)return `<div class="runs-empty">${icon('archive',16)}<strong>${esc(t.panels.artifacts.title)}</strong></div>`;
  const table=`<table class="runs-table"><thead><tr>
    <th>${esc(t.panels.artifacts.id)}</th><th>${esc(t.panels.artifacts.kind)}</th><th>${esc(t.panels.artifacts.seq)}</th><th>${esc(t.panels.artifacts.time)}</th><th>${esc(t.panels.artifacts.digest)}</th></tr></thead>
    <tbody>${w.artifacts.map(item=>`<tr data-noop="1"><td>${ltr(item.id)}</td><td>${tag(item.kind,'neutral')}</td><td>${ltr('#'+item.seq)}</td><td>${ltr(item.time)}</td><td>${ltr(String(item.digest).slice(0,20))}…</td></tr>`).join('')}</tbody></table>`;
  return bare?table:`<div class="runs-tablewrap">${table}</div>`;
}
export function renderTopology(w,c){
  const {t}=c;const sessions=w.openSessions();
  return `<div class="runs-ledger">
    <div class="runs-ledgerhead">${icon('box',15)}<h2>${esc(t.panels.topology.title)}</h2>
      <p>${esc(t.panels.devices.terminal)}: ${esc(t.status.truth)}</p><span class="runs-scope">${w.counts.devices} objects</span></div>
    <div class="runs-tablewrap" style="border:1px solid var(--runs-line);border-radius:10px;overflow:hidden">
    <table class="runs-table"><thead><tr><th>${esc(t.panels.devices.name)}</th><th>${esc(t.panels.devices.id)}</th>
      <th>${esc(t.panels.devices.type)}</th><th>${esc(t.panels.devices.state)}</th><th>${esc(t.panels.devices.session)}</th><th>${esc(t.panels.devices.action)}</th></tr></thead>
    <tbody>${w.devices.map(device=>{const up=device.up!==false&&device.state!=='DOWN';
      const open=sessions.find(session=>session.deviceId===device.id);
      const av=c.avail?c.avail('OPEN_TERMINAL',{deviceId:device.id}):{enabled:false,reason:'Unavailable'};
      return `<tr data-noop="1"><td><strong>${esc(device.name)}</strong><span class="runs-sub">${esc(device.id)}</span></td>
        <td>${ltr(device.id)}</td><td>${ltr(device.type||device.kind||'SIMULATED_DEVICE')}</td>
        <td>${pill(up?t.panels.devices.up:t.panels.devices.down,up?'success':'danger')}</td>
        <td>${open?tag(t.panels.devices.session,'success'):tag(t.panels.devices.none,'neutral')}</td>
        <td><button class="runs-btn" type="button" data-command="OPEN_TERMINAL" data-device="${esc(device.id)}" ${av.enabled?'':`disabled title="${esc(av.reason||'')}"`}>${icon('terminal',12)}${esc(t.panels.devices.open)}</button></td></tr>`}).join('')}
    </tbody></table></div>
    <div class="runs-note" data-tone="info">${esc(t.status.terminalBound)} — ${esc(t.right.platformNote)}</div>
  </div>`;
}
export function renderOverview(w,c){
  const {t}=c;const o=t.panels.overview,m=w.manifest;
  return `<div class="runs-ledger">
    <div class="runs-ledgerhead">${icon('grid',15)}<h2>${esc(o.title)}</h2>
      <p>${esc(w.identity.title)}</p><span class="runs-scope">${ltr(w.identity.runId)} · ${ltr(w.run.lifecycle)}</span></div>
    <section class="runs-card"><div class="runs-cardhead">${icon('layers',14)}<h3>${esc(o.manifest)}</h3>${pill(w.run.lifecycle,stateTone(w.run.lifecycle))}</div>
      <dl class="runs-kv">
        <dt>${esc(o.manifest)}</dt><dd>${ltr(m.id)}</dd>
        <dt>${esc(o.digest)}</dt><dd>${ltr(String(m.inputDigest).slice(0,34))}…</dd>
        <dt>${esc(o.seed)}</dt><dd>${ltr(m.seed)}</dd>
        <dt>${esc(o.engine)}</dt><dd>${ltr(m.engine)}</dd>
        <dt>${esc(o.isolation)}</dt><dd>${ltr(m.isolationScope)}</dd>
        <dt>${esc(o.createdAt)}</dt><dd>${ltr(String(m.createdAt).replace('T',' ').replace(/\.\d+Z$/,' UTC'))}</dd>
        <dt>${esc(o.provenance)}</dt><dd>${pill(w.identity.provenance,'info')}</dd>
        <dt>${esc(t.panels.preflight.source)}</dt><dd>${ltr(w.identity.definitionId)} · ${ltr(w.identity.definitionRevision)}</dd>
      </dl></section>
    <section class="runs-card"><div class="runs-cardhead">${icon('activity',14)}<h3>${esc(o.receipts)}</h3>
      <span class="runs-scope">${w.lifecycleReceipts.length}</span></div>
      ${w.lifecycleReceipts.length?`<div class="runs-flow">${w.lifecycleReceipts.slice().reverse().map(r=>`<div class="runs-flowrow">
        <span class="runs-seq">${ltr('v'+r.version)}</span><span class="runs-when">${pill(r.after,stateTone(r.after))}</span>
        <span><strong>${esc(r.action)}</strong><small>${esc(t.panels.overview.lifecycle)} → ${esc(r.after)}</small></span>
        <span class="runs-who">${ltr(r.invocationId)}</span></div>`).join('')}</div>`
      :`<div class="runs-note">${esc(t.readiness.noWrite)} — ${esc(t.panels.overview.receipts)}: 0.</div>`}
    </section></div>`;
}
export function renderTasks(w,c){
  const {t}=c;const p=t.panels.tasks;
  return `<div class="runs-ledger"><div class="runs-ledgerhead">${icon('tasks',15)}<h2>${esc(p.title)}</h2>
    <p>${w.counts.done}/${w.counts.tasks} · ${esc(w.identity.task)}</p><span class="runs-scope">${ltr(w.identity.phase)}</span></div>
    <div class="runs-tablewrap" style="border:1px solid var(--runs-line);border-radius:10px;overflow:hidden">
    <table class="runs-table"><thead><tr><th>${esc(p.id)}</th><th>${esc(p.label)}</th><th>${esc(p.state)}</th><th style="width:34%">${esc(p.progress)}</th></tr></thead>
    <tbody>${w.tasks.map(task=>`<tr data-noop="1"><td>${ltr(task.id)}</td>
      <td><strong>${esc(task.label)}</strong>${task.status==='ACTIVE'?`<span class="runs-sub">${esc(w.identity.task)}</span>`:''}</td>
      <td>${pill(task.status,task.status==='DONE'?'success':task.status==='ACTIVE'?'warning':'neutral')}</td>
      <td><div class="runs-bar-progress"><i style="width:${Number(task.progress)||0}%"></i></div><span class="runs-sub">${ltr(String(task.progress)+'%')}</span></td></tr>`).join('')}
    </tbody></table></div></div>`;
}
export function renderEvents(w,c){
  const {t}=c;
  return `<div class="runs-ledger"><div class="runs-ledgerhead">${icon('activity',15)}<h2>${esc(t.panels.events.title)}</h2>
    <p>${esc(t.panels.events.ordering)}</p><span class="runs-scope">${w.counts.events} · ${w.gaps.length?esc(t.panels.events.gaps(w.gaps.length)):'0 gaps'}</span></div>
    <div class="runs-flow">${w.events.map(event=>`<div class="runs-flowrow"><span class="runs-seq">${ltr('#'+event.seq)}</span>
      <span class="runs-when">${ltr(event.time)}</span><span><strong>${esc(event.type)}</strong><small>${esc(event.detail)}</small></span>
      <span class="runs-who">${ltr(event.actor)}</span></div>`).join('')}</div></div>`;
}
export function renderObservations(w,c){
  const {t}=c;
  return `<div class="runs-ledger"><div class="runs-ledgerhead">${icon('eye',15)}<h2>${esc(t.panels.observations.title)}</h2>
    <p>${esc(t.panels.observations.note)}</p><span class="runs-scope">${w.counts.observations}</span></div>
    <div class="runs-flow" style="font-family:var(--mono,monospace)">${w.observations.map(line=>`<div class="runs-flowrow" style="grid-template-columns:minmax(0,1fr)">
      <span><bdi dir="ltr" style="font-size:11.6px">${esc(line)}</bdi></span></div>`).join('')}</div></div>`;
}
export function renderArtifacts(w,c){
  const {t}=c;
  return `<div class="runs-ledger"><div class="runs-ledgerhead">${icon('archive',15)}<h2>${esc(t.panels.artifacts.title)}</h2>
    <p>${esc(t.readiness.noWrite)}</p><span class="runs-scope">${w.counts.artifacts}</span></div>
    <div class="runs-tablewrap" style="border:1px solid var(--runs-line);border-radius:10px;overflow:hidden">${artifactTable(w,c,true)}</div>
    <div class="runs-note" data-tone="info">${esc(t.panels.observations.note)}</div></div>`;
}

export function renderView(view,w,c){
  switch(view){
    case 'preflight':return renderPreflight(w,c);
    case 'timeline':return renderTimeline(w,c);
    case 'devices':return renderTopology(w,c);
    case 'overview':return renderOverview(w,c);
    case 'tasks':return renderTasks(w,c);
    case 'events':return renderEvents(w,c);
    case 'observations':return renderObservations(w,c);
    case 'artifacts':return renderArtifacts(w,c);
    default:return renderOperations(w,c);
  }
}
