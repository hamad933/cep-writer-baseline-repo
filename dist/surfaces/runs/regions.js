/**
 * W03-RUNS shell-region projections — LEFT "Run Structure" and RIGHT contextual readout.
 * These are the surface's own composition of the shell's LEFT/RIGHT panes (shared mechanics,
 * surface-specific presentation). Exported so the mount seam can call them without the
 * composition logic ever leaving this surface root.
 */
import {esc,ltr,pill,tag,icon,stateTone} from './util.js';
import {RUN_STRUCTURE} from './views.js';

export function runsLeftRegion(w,c){
  const {t,state}=c;
  return `<section class="runs-shell-left" data-runs-region="left" aria-label="${esc(t.nav.label)}">
    <div class="runs-railhead" style="padding:2px 6px 8px"><span>${esc(t.structure.title)}</span>${icon('chevron',11)}</div>
    <div class="runs-structure" role="list">${RUN_STRUCTURE(state).map(item=>{
      const count=item.count?item.count(w):null;
      return `<button class="runs-navitem" type="button" role="listitem" data-view="${item.id}" aria-current="${state.view===item.id?'true':'false'}">
        <span class="runs-navico">${icon(item.icon,14)}</span>
        <span class="runs-navlabel">${esc(t.structure[item.key])}</span>
        ${count==null?'':`<span class="runs-navcount">${count}</span>`}</button>`}).join('')}</div>
    <div style="margin-top:auto;display:grid;gap:6px;padding-top:12px">
      <div class="runs-note" data-tone="info" style="font-size:11.2px">${esc(t.identity.phase)}: <bdi dir="ltr">${esc(w.identity.phase)}</bdi> · ${esc(t.identity.role)}: ${esc(w.identity.role)}</div>
      ${pill(w.run.lifecycle,stateTone(w.run.lifecycle))}
    </div>
  </section>`;
}

export function runsRightRegion(w,c){
  const {t,state}=c;
  const item=(ico,head,body)=>`<div class="runs-ctxitem"><span class="runs-ctxico">${icon(ico,12)}</span><div><h4>${esc(head)}</h4><p>${body}</p></div></div>`;
  const provider=pill(w.provider.connected?t.status.connected:t.status.disconnected,w.provider.connected?'success':'danger');
  const truth=`<div class="runs-note" data-tone="info" style="margin-top:4px">
      <dl class="runs-kv"><dt>${esc(t.right.provider)}</dt><dd>${ltr(w.provider.id)}</dd>
      <dt>${esc(t.right.runtimeTruth)}</dt><dd>${ltr(w.provider.runtimeTruth)}</dd>
      <dt>${esc(t.right.epoch)}</dt><dd>${ltr(String(w.provider.epoch))}</dd></dl>
      <div style="margin-top:6px">${provider} ${pill(t.status.unverified,'warning',true)}</div></div>`;

  if(state.view==='preflight'){
    const blocked=w.preflight.checks.find(check=>check.status==='BLOCKED');
    const advisory=w.preflight.checks.find(check=>check.status==='ADVISORY');
    return `<section class="runs-shell-right" data-runs-region="right" aria-label="${esc(t.workspace)}">
      <div class="runs-railhead" style="padding:2px 6px 2px"><span>${esc(t.right.preflightTruth)}</span></div>
      <div class="runs-context">
        ${item('link',t.right.preflightSource,`${esc(w.identity.title)} · <bdi dir="ltr">${esc(w.identity.definitionId)}@${esc(w.identity.definitionRevision)}</bdi>`)}
        ${item('shield',t.right.preflightWhy,esc(blocked?.detail||w.manifest.inputDigest.slice(0,26)+'…'))}
        ${item('info',t.right.observation,esc(advisory?.detail||t.readiness.noWrite))}
        ${item('target',t.right.preflightAdvice,esc(t.banner.blockedWhy))}
      </div>${truth}
      <div class="runs-note">${esc(t.right.platformNote)}</div>
    </section>`;
  }
  const alert=c.selected;
  const body=alert?`
    <div class="runs-context">
      ${item('target',t.right.rationale,esc(alert.detail))}
      ${item('link',t.right.scope,`${esc(alert.sub)} · <bdi dir="ltr">${esc(alert.ip)}</bdi> · ${esc(alert.source)}`)}
      ${item('activity',t.right.implication,`${esc(alert.technique)} · <bdi dir="ltr">${esc(alert.rule)}</bdi>`)}
      ${item('eye',t.right.observation,`${pill(alert.sev,alert.sev==='High'?'danger':alert.sev==='Medium'?'warning':'success')} ${tag(alert.status,'info')}`)}
      ${item('tasks',t.right.recommendation,esc(w.activeTask?w.activeTask.label:t.right.noSelection))}
    </div>`
    :`<div class="runs-empty">${icon('target',16)}<strong>${esc(t.right.noSelection)}</strong></div>`;
  return `<section class="runs-shell-right" data-runs-region="right" aria-label="${esc(t.workspace)}">
    <div class="runs-railhead" style="padding:2px 6px 2px"><span>${esc(t.right.rationale)}</span>${icon('info',11)}</div>
    ${body}${truth}
    <div class="runs-note">${esc(t.right.platformNote)}</div>
  </section>`;
}
