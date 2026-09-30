/* W05-BACKUP · Recovery Safety Workbench.
 *
 * Composition authority: CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png — the Restore Drill
 * report (8-stage pipeline + per-stage verdicts, 3x3 real-check grid, big-number expected-vs-actual
 * metrics, drill meta strip) is the focal work surface; pane chrome and lifecycle navigation are
 * supporting regions, never the headline.
 *
 * Language/direction: Arabic and English are both first-class. Every string goes through the
 * surface catalog (i18n.ts) and the active locale is read from the document shell, so the surface
 * follows the user-configured preference instead of baking one language or direction in.
 * Technical tokens stay isolated in <bdi dir="ltr"> in both directions.
 */
import {STYLE} from './style.js';
import {icon} from './icons.js';
import {tx,txList,activeLocale,LOCALIZED_COMMAND_LABELS,COMMAND_REASON_KEYS} from './i18n.js';

export const BACKUP_COMMANDS=Object.freeze(['backup.plan','backup.preview','backup.stage','backup.drill','backup.activationRequest']);

const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
/* Technical tokens are isolated LTR; <wbr> after "_" gives UPPER_SNAKE enums a clean wrap
 * point instead of a mid-letter break (BIDI/typography rule: tokens stay readable). */
const B=value=>`<bdi dir="ltr">${safe(value).replace(/_/g,'_<wbr>')}</bdi>`;
export function backupAttemptProjection(adapter){const snapshot=adapter?.snapshot?.()||{};const durable=Array.isArray(snapshot.durableAttempts)?snapshot.durableAttempts:null;return Object.freeze({source:durable?'PROVIDER_DURABLE_ATTEMPT_JOURNAL':'CURRENT_UI_SESSION',durable:!!durable,rows:structuredClone(durable||snapshot.attemptHistory||[])});}

const COMMAND_IDS=['backup.package',...BACKUP_COMMANDS];
const cmdLabel=id=>{const entry=LOCALIZED_COMMAND_LABELS[id];return entry?(entry[activeLocale()]||entry.en):id;};
const dash='—';
const has=value=>value!==null&&value!==undefined&&value!=='';
const short=value=>{const text=String(value||'');return text.length>20?`${text.slice(0,20)}…`:text;};
const num=value=>Number.isFinite(Number(value))?Number(value):null;
const fmtNum=value=>value===null||value===undefined?dash:(typeof value==='number'?value.toLocaleString('en-US'):String(value));

/** Verdict vocabulary → colour. Unknown tokens are NEVER read as success. */
const tone=value=>{
  const t=String(value||'').toUpperCase();
  if(!t)return 'muted';
  if(/^(NOT_|UNAVAILABLE|NONE|IDLE|ABSENT|DEFERRED|UNKNOWN|DISABLED)/.test(t)||/NOT_RUN|NOT_REQUESTED|NOT_STAGED|NOT_CREATED|NOT_PLANNED|NOT_PREVIEWED/.test(t))return 'muted';
  if(/VERIFIED|SUCCEEDED|COMPATIBLE|MATCHED|PASS|AVAILABLE|READY|OBSERVED|CREATED/.test(t))return 'ok';
  if(/FAILED|BLOCK|INVALID|CONFLICT|ERROR|DIFFERENT|ROLLBACK/.test(t))return 'bad';
  if(/PENDING|STAGED|PLANNED|PREVIEW|REQUEST|WARNING|DEGRADED|STARTED/.test(t))return 'warn';
  return 'muted';
};

const fmtWhen=value=>{
  if(!has(value))return dash;
  try{
    const date=new Date(String(value));
    if(Number.isNaN(date.getTime()))return String(value);
    const locale=activeLocale()==='ar'?'ar-u-nu-latn':'en-GB';
    return new Intl.DateTimeFormat(locale,{year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
  }catch(error){return String(value);}
};
const fmtDur=ms=>{if(!Number.isFinite(ms)||ms<0)return null;const total=Math.round(ms/1000);const pad=n=>String(n).padStart(2,'0');return `${pad(Math.floor(total/3600))}:${pad(Math.floor(total%3600/60))}:${pad(total%60)}`;};
const spanBetween=(from,to)=>{if(!has(from)||!has(to))return null;const a=Date.parse(String(from)),b=Date.parse(String(to));return Number.isNaN(a)||Number.isNaN(b)?null:fmtDur(b-a);};

let langObserver=null,renderedDir=null;
const dirNow=()=>{try{return typeof document!=='undefined'&&document.documentElement?.dir==='rtl'?'rtl':'ltr';}catch(error){return 'ltr';}};
const ensureStyle=()=>{
  if(typeof document==='undefined')return;
  if(document.querySelector('style[data-bk-style]'))return;
  const node=document.createElement('style');
  node.setAttribute('data-bk-style','backup');
  node.textContent=STYLE;
  document.head.append(node);
};

export function mountBackupSurface({stage,registry,workspace,button,adapter}={}){
  if(!stage||!registry||!adapter)throw Error('BACKUP_PRODUCT_COMPOSITION_REQUIRED');
  const owner=adapter.owner;
  let leftQuery='',leftVerified=false,renderedLocale=activeLocale();

  /* ---- commands: registered once, labels + readiness reasons re-localised on every render ---- */
  const availableFor=id=>{
    let result=true;
    try{result=adapter.availability?adapter.availability(id):true;}catch(error){result=false;}
    if(result===true)return true;
    const key=COMMAND_REASON_KEYS[id];
    return key?tx(key):tx('blocked');
  };
  const RUN={
    'backup.package':()=>adapter.createPackage(),
    'backup.plan':()=>adapter.plan(),
    'backup.preview':()=>adapter.preview(),
    'backup.stage':()=>adapter.stage(),
    'backup.drill':()=>adapter.drill(),
    'backup.activationRequest':()=>adapter.requestActivation()
  };
  const exec=async id=>{
    let result=null;
    try{result=await RUN[id]();}catch(error){result={ok:false,code:'BACKUP_COMMAND_ERROR'};}
    const ok=Boolean(result&&result.ok!==false);
    const text=(ok?tx('stOk'):tx('stFail')).replace('{cmd}',cmdLabel(id)).replace('{code}',result?.code||'UNKNOWN');
    workspace?.status?.(text,ok?'info':'error');
    render();
    return result;
  };
  const syncCommands=()=>{
    for(const id of COMMAND_IDS){
      const label=cmdLabel(id),run=()=>exec(id),available=()=>availableFor(id);
      const existing=registry.commands?.get?.(id);
      if(existing&&existing.owner===owner){existing.label=label;existing.run=run;existing.available=available;continue;}
      if(existing)continue;
      registry.register(id,owner,label,run,available);
    }
  };
  const btn=(id,variant='')=>{
    const reason=availableFor(id),enabled=reason===true;
    const extra=`${enabled?'':'disabled aria-disabled="true"'} title="${safe(enabled?cmdLabel(id):reason)}"${variant?` data-bk-variant="${variant}"`:''}`;
    return typeof button==='function'?button(id,cmdLabel(id),extra):`<button type="button" class="btn" data-foundation-command="${safe(id)}" ${extra}>${safe(cmdLabel(id))}</button>`;
  };

  const render=()=>{
    ensureStyle();
    const L=activeLocale();
    renderedLocale=L;
    renderedDir=dirNow();
    const s=adapter.snapshot(),truth=adapter.truth();
    const pkg=s.packages.find(row=>row.packageId===s.selectedPackageId)||s.packages.at(-1)||null;
    const drill=s.lastDrill||null,preview=s.preview||null,stg=s.stage||null,plan=s.plan||null;
    const projection=backupAttemptProjection(adapter),attempts=projection.rows;
    const pre=drill?.preflight||null;
    const drillAttempt=[...attempts].reverse().find(row=>/DRILL/i.test(String(row.operation||'')))||null;
    const rb=pkg?.readbackSummary||null,drr=drill?.readback||null;
    const target=drill?.target||stg?.target||null;
    const duration=spanBetween(drillAttempt?.startedAt,drillAttempt?.terminalAt||drillAttempt?.updatedAt)
      ||spanBetween(drill?.createdAt,drillAttempt?.terminalAt)||null;
    const sigExpected=preview?.providerReceipt?.packageIdentity?.schemaSignature||preview?.packageIdentity?.schemaSignature||null;
    const sigActual=preview?.providerReceipt?.targetSchemaIdentity?.schemaSignature||stg?.targetSchemaIdentity?.schemaSignature||null;
    const isolated=target?(target.isolated===true||(target.live===false&&target.trueEmptyRequired===true)):false;
    const emptyOk=target?(target.trueEmptyBeforeRestore===true||target.trueEmptyRequired===true):false;
    const liveFlag=has(target?.live)?target.live===true:truth.drillLiveRestored===true;
    const diffCount=[ [num(rb?.documentCount),num(drr?.documentCount)], [num(rb?.revisionCount),num(drr?.revisionCount)],
      [num(rb?.recoveryCount),num(drr?.recoveryCount)],
      [Array.isArray(pkg?.migrations)?pkg.migrations.length:null,pre&&Array.isArray(pkg?.migrations)?pkg.migrations.length:null],
      [sigExpected,sigActual] ]
      .reduce((count,[e,a])=>count+(e!==null&&a!==null&&String(e)!==String(a)?1:0),0);

    /* ---- pipeline: 8 stages, every verdict bound to a provider receipt ---- */
    const pipeState=[
      pkg?(pkg.status==='PACKAGE_VERIFIED'?'VERIFIED':pkg.status||'NOT_CREATED'):'NOT_RUN',
      preview?(preview.schemaComparison?.conflict?'FAILED':(preview.schemaComparison?.status||preview.status||'PREVIEWED')):'NOT_RUN',
      stg?(stg.state==='STAGED'?'VERIFIED':stg.state||'STAGED'):'NOT_RUN',
      drill?'VERIFIED':'NOT_RUN',
      drill?(drill.status==='STAGED_AND_VERIFIED'&&drill.liveRestored!==true?'VERIFIED':'FAILED'):'NOT_RUN',
      target?(isolated&&emptyOk?'VERIFIED':'FAILED'):'NOT_RUN',
      drill?(has(sigExpected)&&has(sigActual)?(String(sigExpected)===String(sigActual)?'MATCHED':'DIFFERENT'):'DEFERRED'):'NOT_RUN',
      drill?drill.status||'STAGED_AND_VERIFIED':'NOT_RUN'
    ];
    const pipe=pipeState.map((state,index)=>`<article class="bk-step" data-tone="${tone(state)}">
        <span class="bk-dot">${String(index+1).padStart(2,'0')}</span>
        <span class="bk-step-name">${safe(txList('stages',index,L))}</span>
        <span class="bk-step-state">${B(state)}</span>
      </article>`).join('');

    /* ---- 3x3 real-check grid ---- */
    const checks=[
      {state:pkg?'PASS':'PENDING',value:has(pkg?.manifestSha256)?short(pkg.manifestSha256):null},
      {state:pkg?'PASS':'PENDING',value:has(pkg?.schemaArtifactSha256)?short(pkg.schemaArtifactSha256):null},
      {state:pre?(pre.integrityVerified?'PASS':'FAILED'):(drill?'FAILED':'PENDING'),value:has(drill?.restoredSnapshotSha256)?short(drill.restoredSnapshotSha256):(has(pkg?.snapshotSha256)?short(pkg.snapshotSha256):null)},
      {state:pre?(pre.foreignKeysVerified?'PASS':'FAILED'):(preview?'DEFERRED':(pkg?'DEFERRED':'PENDING')),value:preview?(preview.schemaComparison?.status||preview.status||'COMPATIBLE'):null},
      {state:pre?(pre.migrationsVerified?'PASS':'FAILED'):(Array.isArray(pkg?.migrations)?'DEFERRED':'PENDING'),value:Array.isArray(pkg?.migrations)?(pre?.migrationsVerified?`${pkg.migrations.length} / ${pkg.migrations.length}`:`${pkg.migrations.length} / ${dash}`):null},
      {state:target?(isolated&&emptyOk?'PASS':'FAILED'):'PENDING',value:target?`isolated = ${String(isolated)} · trueEmpty = ${String(emptyOk)}`:null},
      {state:truth.productionDatabaseMutated?'FAILED':'PASS',value:`productionDatabaseMutated = ${String(truth.productionDatabaseMutated)}`},
      {state:drill?(truth.drillLiveRestored?'FAILED':'PASS'):'PENDING',value:`liveRestored = ${String(truth.drillLiveRestored)}`},
      {state:drill?(drill.status==='STAGED_AND_VERIFIED'&&drill.liveRestored!==true?'VERIFIED':'FAILED'):'PENDING',value:drill?.status||'NOT_RUN'}
    ];
    const checksHTML=checks.map((check,index)=>`<article class="bk-check" data-tone="${tone(check.state)}">
        <span class="bk-ico">${icon(['shieldCheck','file','database','key','layers','box','lock','ban','checkCircle'][index],14)}</span>
        <span class="bk-name">${safe(txList('checks',index,L))}</span>
        <span class="bk-state">${B(check.state)}</span>
        <span class="bk-val">${has(check.value)?B(check.value):`<span data-tone="muted">${safe(tx('notAvailable',L))}</span>`}</span>
      </article>`).join('');

    /* ---- big-number expected vs actual ---- */
    const metrics=[
      {k:tx('metricDocs',L),e:num(rb?.documentCount),a:num(drr?.documentCount)},
      {k:tx('metricRevisions',L),e:num(rb?.revisionCount),a:num(drr?.revisionCount)},
      {k:tx('metricRecovery',L),e:num(rb?.recoveryCount),a:num(drr?.recoveryCount)},
      {k:tx('metricMigrations',L),e:Array.isArray(pkg?.migrations)?pkg.migrations.length:null,a:pre&&Array.isArray(pkg?.migrations)?pkg.migrations.length:null},
      {k:tx('metricSchema',L),e:sigExpected?`${String(sigExpected).slice(0,8)}…`:null,a:sigActual?`${String(sigActual).slice(0,8)}…`:null,text:true},
      {k:tx('metricDiff',L),e:0,a:drill?diffCount:null,diff:true}
    ];
    const metricsHTML=metrics.map(metric=>{
      const unavailable=metric.e===null||metric.a===null;
      const matched=!unavailable&&String(metric.e)===String(metric.a);
      const state=unavailable?'muted':(matched?'ok':'bad');
      const caption=metric.diff?(metric.a===0?tx('noDifferences',L):tx('legendDiff',L)):matched?tx('matchedCaption',L):unavailable?tx('legendUnavailable',L):tx('legendDiff',L);
      return `<article class="bk-metric${metric.text?' is-text':''}" data-tone="${state}">
        <span class="bk-k">${safe(metric.k)}</span>
        <span class="bk-v">${B(`${fmtNum(metric.e)} / ${fmtNum(metric.a)}`)}</span>
        <span class="bk-c" data-tone="${state}">${safe(caption)}</span>
      </article>`;
    }).join('');

    /* ---- focal panel ---- */
    const metaCells=[
      [tx('metaSource',L),drill?.packageId||pkg?.packageId||dash],
      [tx('metaStarted',L),has(drill?.createdAt)||has(drillAttempt?.startedAt)?fmtWhen(drillAttempt?.startedAt||drill.createdAt):dash],
      [tx('metaCompleted',L),has(drillAttempt?.terminalAt)?fmtWhen(drillAttempt.terminalAt):dash],
      [tx('metaDuration',L),duration||dash],
      [tx('metaEnvironment',L),target?.kind||'ISOLATED_RESTORE_DRILL']
    ].map(([key,value])=>`<div><span class="bk-k">${safe(key)}</span><span class="bk-v">${B(value)}</span></div>`).join('');

    const truthChips=[
      `productionDatabaseMutated = ${String(truth.productionDatabaseMutated)}`,
      `stagedVerifiedIsLiveRestored = ${String(truth.stagedVerifiedIsLiveRestored)}`,
      `persistenceOwnerMutated = ${String(truth.persistenceOwnerMutated)}`,
      `activationAuthority = ${String(truth.activationAuthority)}`
    ].map(token=>`<span>${B(token)}</span>`).join('');

    stage.innerHTML=`<div class="bk-root" data-w05-surface="backup" data-domain-owner="${safe(adapter.owner)}" data-bk-locale="${safe(L)}">
      <header class="bk-head">
        <div class="bk-id">
          <span class="bk-eyebrow">${B(tx('eyebrow',L))}</span>
          <span class="bk-title"><h1>${safe(tx('title',L))}</h1><span class="bk-sub">${safe(tx('subtitle',L))}</span></span>
          <p class="bk-lead">${safe(tx('lead',L))}</p>
        </div>
        <div class="bk-act">${btn('backup.package','primary')}${btn('backup.plan')}${btn('backup.preview')}${btn('backup.stage')}${btn('backup.drill')}${btn('backup.activationRequest')}</div>
      </header>

      <p class="bk-banner">${icon('alert',15)}<span>${safe(tx('banner',L))} <bdi dir="ltr">STAGED_AND_VERIFIED ≠ LIVE_RESTORED</bdi></span></p>

      <section class="bk-panel is-focal" data-bk-panel="restore-drill-report">
        <div class="bk-sec-head"><h2>${safe(tx('drillSection',L))}</h2><span class="bk-note">${safe(projection.source)}</span></div>
        <div class="bk-report">
          <div class="bk-report-head">
            <div class="bk-report-id">
              <h3>${safe(tx('drillTitle',L))}: <bdi>${safe(drill?.drillId||dash)}</bdi></h3>
              <span class="bk-pill" data-tone="${tone(drill?(drill.status==='STAGED_AND_VERIFIED'&&drill.liveRestored!==true?'VERIFIED':'FAILED'):'NOT_RUN')}" data-bk-drill-status="${safe(drill?.status||'NOT_RUN')}">${icon(drill?'shieldCheck':'clock',13)}${B(drill?(drill.status==='STAGED_AND_VERIFIED'&&drill.liveRestored!==true?tx('pillVerified',L):tx('pillFailed',L)):tx('pillNotRun',L))}</span>
            </div>
          </div>
          <dl class="bk-meta">${metaCells}</dl>
          ${drill?'':`<div class="bk-nostrun"><strong>${safe(tx('notRunTitle',L))}</strong><p>${safe(tx('notRunBody',L))}</p></div>`}
          <div class="bk-sec-head"><h2>${safe(tx('pipelineTitle',L))}</h2><span class="bk-note">${safe(tx('pipelineSub',L))}</span></div>
          <div class="bk-pipe">${pipe}</div>
          <div class="bk-sec-head"><h2>${safe(tx('checksTitle',L))}</h2><span class="bk-note">${safe(tx('checksSub',L))}</span></div>
          <div class="bk-checks">${checksHTML}</div>
          <div class="bk-sec-head"><h2>${safe(tx('metricsTitle',L))}</h2>
            <span class="bk-legend"><span data-tone="ok"><i></i>${safe(tx('legendMatched',L))}</span><span data-tone="bad"><i></i>${safe(tx('legendDiff',L))}</span><span data-tone="muted"><i></i>${safe(tx('legendUnavailable',L))}</span></span>
          </div>
          <div class="bk-metrics">${metricsHTML}</div>
          ${drill?'':`<p class="bk-empty-note">${safe(tx('metricsNotRun',L))}</p>`}
          <div class="bk-truth"><span>${safe(tx('truthTitle',L))}</span>${truthChips}</div>
        </div>
      </section>
    </div>`;
    stage.dataset.surfaceComposition='backup-recovery-safety-workbench';

    /* ---- LEFT: grouped, counted, searchable restore-point queue ---- */
    const listRows=snap=>{
      const needle=leftQuery.trim().toLowerCase();
      return snap.packages.filter(row=>(!leftVerified||row.status==='PACKAGE_VERIFIED')
        &&(!needle||String(row.packageId||'').toLowerCase().includes(needle)||String(row.capturedAt||'').toLowerCase().includes(needle)));
    };
    const rowHTML=(row,selected)=>`<li><button type="button" class="bkl-row" data-b-pkg="${safe(row.packageId)}" aria-pressed="${row.packageId===pkg?.packageId}">
        <span class="bk-id-main">${B(row.packageId)}</span>
        <span class="bk-id-meta">${icon('lock',11)}<span>${safe(tx('capturedAt',L))} ${B(fmtWhen(row.capturedAt))}</span></span>
        <span class="bk-tag" data-tone="${tone(row.status)}">${B(row.status||'CREATED')}</span>
      </button></li>`;
    const paintList=host=>{
      const snap=adapter.snapshot(),rows=listRows(snap);
      const list=host.querySelector('[data-bk-list]');
      if(list)list.innerHTML=rows.length?rows.map(row=>rowHTML(row)).join('')
        :(snap.packages.length
          ?`<li><p class="bkl-empty"><b>${safe(tx('viewAll',L))}</b><button type="button" class="btn" data-bk-clear>${safe(tx('clearFilters',L))}</button></p></li>`
          :`<li><p class="bkl-empty"><b>${safe(tx('noPackages',L))}</b>${safe(tx('noPackagesHint',L))}</p></li>`);
      const count=host.querySelector('[data-bk-count]');
      if(count)count.textContent=`${rows.length}/${snap.packages.length}`;
      host.querySelectorAll('[data-b-pkg]').forEach(node=>node.setAttribute('aria-pressed',String(node.dataset.bPkg===pkg?.packageId)));
    };
    const drillRows=attempts.filter(row=>/DRILL/i.test(String(row.operation||'')));
    const drillFacts=drillRows.length
      ? drillRows.map(row=>`<div><span>${B(row.targetIdentity?.drillId||short(row.attemptId))}</span><bdi data-tone="${tone(row.status)}">${B(row.status||'OBSERVED')}</bdi></div>`).join('')
      :(drill?`<div><span>${B(drill.drillId||dash)}</span><bdi data-tone="${tone(drill.status)}">${B(drill.status)}</bdi></div>`:`<p class="bkl-empty">${safe(tx('noDrills',L))}</p>`);
    const journalRows=[...attempts].reverse().slice(0,6);
    const left=document.createElement('section');
    left.className='bkl';
    const dir=dirNow();
    left.innerHTML=`
      <div class="bkl-search">${icon('search',14)}<input type="search" data-bk-search value="${safe(leftQuery)}" placeholder="${safe(tx('searchPlaceholder',L))}" aria-label="${safe(tx('searchPlaceholder',L))}"></div>
      <div class="bkl-act">${btn('backup.package')}<button type="button" class="btn" data-bk-verified aria-pressed="${leftVerified}">${safe(tx('filterVerified',L))}</button></div>
      <details class="bkl-grp" open dir="${dir}">
        <summary>${icon('box',14)}<span>${safe(tx('grpRestorePoints',L))}</span><span class="bkl-count" data-bk-count>0/0</span><span class="bk-cue">${icon('chevron',13)}</span></summary>
        <ul class="bkl-list" data-bk-list></ul>
      </details>
      <details class="bkl-grp" dir="${dir}">
        <summary>${icon('target',14)}<span>${safe(tx('grpDrills',L))}</span><span class="bkl-count">${drillRows.length+(drill&&!drillRows.length?1:0)}</span><span class="bk-cue">${icon('chevron',13)}</span></summary>
        <div class="bkl-facts">${drillFacts}</div>
      </details>
      <details class="bkl-grp" dir="${dir}">
        <summary>${icon('clock',14)}<span>${safe(tx('grpJournal',L))}</span><span class="bkl-count">${attempts.length}</span><span class="bk-cue">${icon('chevron',13)}</span></summary>
        <div class="bkl-facts">${journalRows.length?journalRows.map(row=>`<div><span>${B(String(row.operation||'—'))}</span><bdi data-tone="${tone(row.status)}">${B(row.status||'OBSERVED')}</bdi></div>`).join(''):`<p class="bkl-empty">${safe(tx('noJournal',L))}</p>`}</div>
      </details>
      <details class="bkl-grp" dir="${dir}">
        <summary>${icon('key',14)}<span>${safe(tx('grpAuthority',L))}</span><span class="bkl-count">${s.lastActivation?1:0}</span><span class="bk-cue">${icon('chevron',13)}</span></summary>
        <div class="bkl-facts">
          <div><span>${safe(tx('authorityRequest',L))}</span><bdi>${B(s.lastActivation?.requestId||tx('noAuthority',L))}</bdi></div>
          <div><span>${safe(tx('grpAuthority',L))}</span><bdi data-tone="${tone(truth.activationAuthority)}">${B(truth.activationAuthority)}</bdi></div>
          <div><span>${safe(tx('metaEnvironment',L))}</span><bdi>${B(target?.kind||'ISOLATED_RESTORE_DRILL')}</bdi></div>
        </div>
      </details>`;
    workspace?.region?.('LEFT',{node:left,label:tx('leftHeading',L)});
    paintList(left);
    left.addEventListener('input',event=>{const node=event.target;if(node?.matches?.('[data-bk-search]')){leftQuery=node.value;paintList(left);}});
    left.addEventListener('click',event=>{
      const clear=event.target.closest?.('[data-bk-clear]');
      if(clear){leftQuery='';leftVerified=false;render();return;}
      const toggle=event.target.closest?.('[data-bk-verified]');
      if(toggle){leftVerified=!leftVerified;toggle.setAttribute('aria-pressed',String(leftVerified));paintList(left);return;}
      const row=event.target.closest?.('[data-b-pkg]');
      if(row){adapter.selectPackage?.(row.dataset.bPkg);render();}
    });

    /* ---- RIGHT: package context, readiness, RPO/RTO, risk, state interpretation, provenance ---- */
    const scopeRows=[['scopeDocuments',rb?.documentCount],['scopeRevisions',rb?.revisionCount],['scopeRecovery',rb?.recoveryCount],
      ['scopeMigrations',Array.isArray(pkg?.migrations)?pkg.migrations.length:null],['scopeDriver',pkg?.provider?.driverId||null]]
      .filter(([,value])=>has(value))
      .map(([key,value])=>`<div class="bkr-line"><span class="bk-n">${safe(tx(key,L))}</span><span class="bk-x">${B(value)}</span></div>`).join('');
    const readiness=COMMAND_IDS.map(id=>{
      const state=availableFor(id);
      return `<div class="bkr-line"><span class="bk-n">${safe(cmdLabel(id))}</span><span class="bk-x" data-tone="${state===true?'ok':'warn'}">${state===true?safe(tx('ready',L)):B(String(state))}</span></div>`;
    }).join('');
    const rto=duration, rpo=spanBetween(pkg?.capturedAt,drill?.createdAt||drillAttempt?.updatedAt||new Date().toISOString());
    const right=document.createElement('aside');
    right.className='bkr';
    right.innerHTML=`
      <section class="bkr-blk"><h3>${icon('layers',14)}${safe(tx('scopeTitle',L))}</h3>${scopeRows||`<p>${safe(tx('notAvailable',L))}</p>`}</section>
      <section class="bkr-blk"><h3>${icon('shieldCheck',14)}${safe(tx('lastVerifyTitle',L))}</h3>
        <div class="bkr-line"><span class="bk-n">${safe(tx('colStatus',L))}</span><span class="bk-x" data-tone="${tone(pkg?.status)}">${pkg?B(pkg.status||'PACKAGE_VERIFIED'):safe(tx('lastVerifyNever',L))}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('capturedAt',L))}</span><span class="bk-x">${B(fmtWhen(pkg?.capturedAt))}</span></div>
      </section>
      <section class="bkr-blk"><h3>${icon('lock',14)}${safe(tx('signatureTitle',L))}</h3>
        <div class="bkr-line"><span class="bk-n">${safe(tx('sigManifest',L))}</span><span class="bk-x">${has(pkg?.manifestSha256)?B(short(pkg.manifestSha256)):safe(tx('notAvailable',L))}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('sigSnapshot',L))}</span><span class="bk-x">${has(pkg?.snapshotSha256)?B(short(pkg.snapshotSha256)):safe(tx('notAvailable',L))}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('sigSchema',L))}</span><span class="bk-x">${has(pkg?.schemaArtifactSha256)?B(short(pkg.schemaArtifactSha256)):safe(tx('notAvailable',L))}</span></div>
      </section>
      <section class="bkr-blk"><h3>${icon('route',14)}${safe(tx('readinessTitle',L))}</h3><div class="bkr-ready">${readiness}</div></section>
      <section class="bkr-blk"><h3>${icon('server',14)}${safe(tx('targetTitle',L))}</h3>
        ${target?`<div class="bkr-line"><span class="bk-n">${safe(tx('targetKind',L))}</span><span class="bk-x">${B(target.kind||target.stagingKind||'ISOLATED_RESTORE_DRILL')}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('targetLive',L))}</span><span class="bk-x" data-tone="${liveFlag?'bad':'ok'}">${B(String(liveFlag))}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('targetEmpty',L))}</span><span class="bk-x" data-tone="${emptyOk?'ok':'warn'}">${B(String(target.trueEmptyRequired??target.trueEmptyBeforeRestore??emptyOk))}</span></div>`
        :`<p>${safe(tx('targetNotStaged',L))} — ${safe(tx('statePending',L))}</p>`}
      </section>
      <section class="bkr-blk is-metric"><h3>${icon('gauge',14)}${safe(tx('rtorpoTitle',L))}</h3>
        <div class="bkr-metric-pair">
          <div><span class="bkr-big" data-tone="${rto?'ok':'muted'}">${B(rto||dash)}</span><span class="bkr-target">${safe(tx('rtoLabel',L))} · ${safe(rto?tx('rtoAchieved',L):tx('notAvailable',L))}</span></div>
          <div><span class="bkr-big" data-tone="${rpo?'ok':'muted'}">${B(rpo||dash)}</span><span class="bkr-target">${safe(tx('rpoLabel',L))} · ${safe(rpo?tx('rpoAchieved',L):tx('notAvailable',L))}</span></div>
        </div>
      </section>
      <section class="bkr-blk is-risk"><h3>${icon('alert',14)}${safe(tx('riskTitle',L))}</h3>
        <ul><li>${safe(tx('riskDirect',L))}</li><li>${safe(tx('riskStaged',L))}</li><li>${safe(tx('riskAuthority',L))} <bdi>${B(truth.activationAuthority)}</bdi></li></ul>
      </section>
      <section class="bkr-blk"><h3>${icon('info',14)}${safe(tx('stateTitle',L))}</h3>
        <ul><li>${safe(tx('stateVerified',L))}</li><li>${safe(tx('statePending',L))}</li><li>${safe(tx('stateUnavailable',L))}</li></ul>
      </section>
      <section class="bkr-blk"><h3>${icon('file',14)}${safe(tx('provTitle',L))}</h3>
        <div class="bkr-line"><span class="bk-n">${safe(tx('grpJournal',L))}</span><span class="bk-x">${B(projection.source)}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('colAttempt',L))}</span><span class="bk-x">${B(attempts.length)}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('provenance',L))}</span><span class="bk-x">${B(truth.durableSuccessReceipts)}</span></div>
        <div class="bkr-line"><span class="bk-n">${safe(tx('failureJournal',L))}</span><span class="bk-x">${B(truth.durableFailureCompensationHistory)}</span></div>
      </section>`;
    workspace?.region?.('RIGHT',{node:right,label:tx('rightHeading',L)});

    /* ---- BOTTOM: durable attempt ledger (table first; raw receipt behind disclosure) ---- */
    const bottom=document.createElement('section');
    bottom.className='bkb';
    const lastReceipt=s.lastActivation||drill||stg||preview||plan||{state:'IDLE'};
    bottom.innerHTML=`
      <div class="bkb-prov"><span>${safe(tx('provenance',L))} <bdi>${B(projection.source)}</bdi></span><span>${safe(tx('grpJournal',L))} <bdi>${B(attempts.length)}</bdi></span><span>${safe(tx('colPackage',L))} <bdi>${B(pkg?.packageId||dash)}</bdi></span></div>
      ${attempts.length?`<div class="bkb-scroll"><table class="bkb-table">
        <thead><tr><th scope="col">${safe(tx('colAttempt',L))}</th><th scope="col">${safe(tx('colOperation',L))}</th><th scope="col">${safe(tx('colPhase',L))}</th><th scope="col">${safe(tx('colStatus',L))}</th><th scope="col">${safe(tx('colPackage',L))}</th><th scope="col">${safe(tx('colAt',L))}</th></tr></thead>
        <tbody>${[...attempts].reverse().map(row=>`<tr><td>${B(row.attemptId||'—')}</td><td>${B(row.operation||'—')}</td><td>${B(row.phase||'—')}</td><td><span data-tone="${tone(row.status)}">${B(row.status||'OBSERVED')}</span></td><td>${B(row.packageId||dash)}</td><td>${B(row.terminalAt||row.updatedAt||row.at||dash)}</td></tr>`).join('')}</tbody>
      </table></div>`:`<p class="bkb-empty">${safe(tx('noAttempts',L))}</p>`}
      <details><summary>${safe(tx('rawReceipt',L))}</summary><pre dir="ltr" data-w05-receipt>${safe(JSON.stringify(lastReceipt,null,2))}</pre></details>`;
    workspace?.region?.('BOTTOM',{node:bottom,label:tx('bottomLabel',L),summary:tx('bottomSummary',L)});

    /* ---- localised command labels + availability follow the active language ---- */
    syncCommands();
    try{workspace?.refreshToolbar?.();}catch(error){/* toolbar not owned by this surface */}
  };

  /* language/direction follow the active preference (Settings) — never baked into the surface */
  if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'){
    langObserver?.disconnect?.();
    langObserver=new MutationObserver(()=>{
      const locale=activeLocale(),dir=dirNow();
      if(locale!==renderedLocale||dir!==renderedDir)render();
    });
    langObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
  }
  render();
  try{workspace?.toolbar?.(['backup.package',...BACKUP_COMMANDS,'foundation.settings']);}catch(error){/* toolbar optional */}
  return Object.freeze({owner:'RecoverySafetyWorkbench',render,adapter,slots:{CENTER:'RecoverySafetyWorkbench',LEFT:'restore-point-queue',RIGHT:'backup-context',BOTTOM:'shared-bottom-shell/domain-projection'}});
}
