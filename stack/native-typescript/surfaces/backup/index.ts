export const BACKUP_COMMANDS=Object.freeze(['backup.plan','backup.preview','backup.stage','backup.drill','backup.activationRequest']);

const safe=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const B=value=>`<bdi dir="ltr">${safe(value)}</bdi>`;
export function backupAttemptProjection(adapter){const snapshot=adapter?.snapshot?.()||{};const durable=Array.isArray(snapshot.durableAttempts)?snapshot.durableAttempts:null;return Object.freeze({source:durable?'PROVIDER_DURABLE_ATTEMPT_JOURNAL':'CURRENT_UI_SESSION',durable:!!durable,rows:structuredClone(durable||snapshot.attemptHistory||[])});}

const STYLE=`
.s18-backup{display:grid;gap:14px;min-width:0}
.b-head{display:grid;gap:4px};margin-block-start:26px.b-head h1{margin:0;font-size:clamp(20px,2vw,27px);display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.b-head h1 small{font-size:13px;font-weight:600;color:var(--text3)}
.b-lead{margin:0;color:var(--text2);max-width:78ch;line-height:1.6}
.b-warn{border:1px solid #8c6a2f;background:rgba(240,180,41,.08);border-radius:11px;padding:10px 12px;font-size:12px;line-height:1.6;color:var(--text2)}
.b-warn bdi{font-family:var(--mono)}
.b-sec{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);padding:12px;min-width:0}
.b-sec>h2{margin:0 0 3px;font-size:15px}.b-sub{display:block;font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px}
.b-stepper{display:flex;flex-wrap:wrap;gap:6px;align-items:stretch}
.b-step{border:1px solid var(--line);border-radius:9px;background:#0d1622;padding:8px 10px;min-width:0;flex:1 1 130px;display:grid;gap:3px}
.b-step .b-step-n{font:700 10px var(--mono);color:var(--text3)}
.b-step strong{font-size:12px;overflow-wrap:anywhere}
.b-step span[data-tone]{font:700 10.5px var(--mono);overflow-wrap:anywhere}
.b-arrow{align-self:center;color:var(--text3);font-size:11px}
.b-drillhead{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.b-drillhead h3{margin:0;font-size:16px}
.b-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 11px;font:700 11px var(--mono);border:1px solid currentColor}
.b-meta{display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:var(--text3);margin-bottom:10px}
.b-meta span b{display:block;color:var(--text2);font-weight:650;font-size:11.5px}
.b-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px}
.b-card{border:1px solid var(--line);border-radius:10px;background:#0d1622;padding:10px;display:grid;gap:4px;min-width:0;align-content:start}
.b-card h4{margin:0;font-size:12px;display:flex;gap:7px;align-items:center}
.b-card p{margin:0;font-size:11.5px;color:var(--text2);overflow-wrap:anywhere}
.b-card bdi{font-family:var(--mono);font-size:11px}
.b-cmp{width:100%;border-collapse:collapse;table-layout:fixed}
.b-cmp th,.b-cmp td{padding:8px 7px;border-bottom:1px solid var(--line);text-align:start;font-size:11.5px;overflow-wrap:anywhere}
.b-cmp th{font-size:10.5px;color:var(--text3);background:color-mix(in srgb,var(--panel) 96%,transparent)}
.b-cmp th strong{display:block;color:var(--text2);font-size:11.5px}
.b-cmp th em{font-style:normal;font:600 9px var(--mono);opacity:.75}
.b-cmp td bdi{font-family:var(--mono);font-size:11px}
.b-attempts{max-height:170px;overflow:auto;font-size:11.5px;display:grid;gap:5px}
.b-attempts p{margin:0;overflow-wrap:anywhere}
.b-empty{color:var(--text3);font-size:12px}
.b-actions{display:flex;gap:7px;flex-wrap:wrap}
.b-actions .btn{padding:7px 11px;font-size:12px}
[data-tone="ok"]{color:#37d67a}[data-tone="warn"]{color:#f0b429}[data-tone="bad"]{color:#ff6b6b}[data-tone="muted"]{color:#9fb0c6}[data-tone="info"]{color:#4aa3ff}
@media(max-width:760px){.b-sec{padding:10px}}
`;

export function mountBackupSurface({stage,registry,workspace,button,adapter}={}){
  if(!stage||!registry||!adapter)throw Error('BACKUP_PRODUCT_COMPOSITION_REQUIRED');
  const exec=(id,fn)=>async()=>{const result=await fn();workspace?.status?.(result?.ok?`${id} completed truthfully`:`${id} unavailable/failed · ${result?.code||'UNKNOWN'}`,result?.ok?'info':'error');render();return result;};
  registry.register('backup.package',adapter.owner,'Create verified BackupPackage',exec('backup.package',()=>adapter.createPackage()));
  registry.register('backup.plan',adapter.owner,'Plan restore drill',exec('backup.plan',()=>adapter.plan()),()=>adapter.availability('backup.plan'));
  registry.register('backup.preview',adapter.owner,'Preview exact package/plan',exec('backup.preview',()=>adapter.preview()),()=>adapter.availability('backup.preview'));
  registry.register('backup.stage',adapter.owner,'Stage isolated drill intent',exec('backup.stage',()=>adapter.stage()),()=>adapter.availability('backup.stage'));
  registry.register('backup.drill',adapter.owner,'Run isolated restore drill',exec('backup.drill',()=>adapter.drill()),()=>adapter.availability('backup.drill'));
  registry.register('backup.activationRequest',adapter.owner,'Request activation authority',exec('backup.activationRequest',()=>adapter.requestActivation()),()=>adapter.availability('backup.activationRequest'));
  const cmd=(id,label)=>typeof button==='function'?button(id,label):`<button type="button" data-command="${safe(id)}">${safe(label)}</button>`;

  const stateOf=token=>!token||/NOT_|UNAVAILABLE|NONE|IDLE|ABSENT/.test(String(token))?'muted':/FAILED|BLOCKED|INVALID/.test(String(token))?'bad':/PENDING|STAGED|PLANNED|PREVIEW|REQUEST/.test(String(token))?'warn':'ok';

  const render=()=>{
    const s=adapter.snapshot(),pkg=s.packages.find(row=>row.packageId===s.selectedPackageId)||s.packages.at(-1)||null,truth=adapter.truth();
    const steps=[
      ['1','الحزمة','BackupPackage',pkg?pkg.status||'CREATED':'NOT_CREATED'],
      ['2','التخطيط','RestorePlan',s.plan?.state||'NOT_PLANNED'],
      ['3','المعاينة','Preview',s.preview?.state||'NOT_PREVIEWED'],
      ['4','التجهيز','Stage',s.stage?.state||'NOT_STAGED'],
      ['5','اختبار الاستعادة','RestoreDrill',s.lastDrill?.status||'NOT_RUN'],
      ['6','طلب التفعيل','Activation',s.lastActivation?.status||'NOT_REQUESTED']
    ];
    const drill=s.lastDrill,verification=[
      ['🧾','بصمة البيان',pkg?.manifestSha256||null,'PENDING'],
      ['🧊','بصمة اللقطة',pkg?.snapshotSha256||null,drill?'VERIFIED':'PENDING'],
      ['🗄','بصمة مخطط البيانات',pkg?.schemaArtifactSha256||null,s.preview?.schemaComparison?.status||'DEFERRED'],
      ['⚖️','مقارنة المخطط',s.preview?.schemaComparison?(s.preview.schemaComparison.conflict?'CONFLICT':String(s.preview.schemaComparison.status)):'NOT_PREVIEWED',s.preview?.schemaComparison?.conflict?'FAILED':(s.preview?'PASS':'PENDING')],
      ['✍️','عمليات كتابة الاستعادة',s.preview?.restoreWritesPerformed??s.stage?.restoreWritesPerformed??null,(s.preview?.restoreWritesPerformed||s.stage?.restoreWritesPerformed)?'FAILED':'VERIFIED'],
      ['🏝','بيئة معزولة حقيقية',s.stage?.target?`${s.stage.target.kind} · live=${String(s.stage.target.live)} · trueEmpty=${String(s.stage.target.trueEmptyRequired)}`:'NOT_STAGED',s.stage?.target?(s.stage.target.live===false&&s.stage.target.trueEmptyRequired===true?'VERIFIED':'FAILED'):'PENDING'],
      ['🚫','عدم تغيير قاعدة الإنتاج',truth.productionDatabaseMutated,truth.productionDatabaseMutated?'FAILED':'VERIFIED'],
      ['♻️','استعادة مباشرة',truth.drillLiveRestored,truth.drillLiveRestored?'FAILED':'VERIFIED'],
      ['✅','الحكم النهائي',drill?drill.status:'NOT_RUN',drill&&drill.status==='STAGED_AND_VERIFIED'&&drill.liveRestored!==true?'VERIFIED':(drill?'FAILED':'PENDING')]
    ];
    const comparison=[
      ['استعادة مباشرة على الإنتاج','<bdi dir="ltr">live = false (بلا طلب)</bdi>','<bdi dir="ltr">liveRestored = '+safe(String(truth.drillLiveRestored))+'</bdi>',truth.drillLiveRestored===false],
      ['عدم تغيير قاعدة الإنتاج','<bdi dir="ltr">productionDatabaseMutated = false</bdi>','<bdi dir="ltr">productionDatabaseMutated = '+safe(String(truth.productionDatabaseMutated))+'</bdi>',truth.productionDatabaseMutated===false],
      ['تجهيز مُتحقق ≠ استعادة فعلية','<bdi dir="ltr">stagedVerifiedIsLiveRestored = false</bdi>','<bdi dir="ltr">stagedVerifiedIsLiveRestored = '+safe(String(truth.stagedVerifiedIsLiveRestored))+'</bdi>',truth.stagedVerifiedIsLiveRestored===false],
      ['سلطة التفعيل','<bdi dir="ltr">AUTHORITY_PENDING أو NOT_REQUESTED</bdi>','<bdi dir="ltr">'+safe(truth.activationAuthority)+'</bdi>',truth.activationAuthority!=='APPLIED'&&truth.activationAuthority!=='LIVE'],
      ['كتابة الاستعادة','<bdi dir="ltr">restoreWritesPerformed = false</bdi>','<bdi dir="ltr">'+safe(String(s.preview?.restoreWritesPerformed??s.stage?.restoreWritesPerformed??false))+'</bdi>',(s.preview?.restoreWritesPerformed||s.stage?.restoreWritesPerformed)!==true],
      ['مالك التخزين','<bdi dir="ltr">persistenceOwnerMutated = false</bdi>','<bdi dir="ltr">persistenceOwnerMutated = '+safe(String(truth.persistenceOwnerMutated))+'</bdi>',truth.persistenceOwnerMutated===false]
    ];
    const attempts=backupAttemptProjection(adapter).rows;

    stage.innerHTML=`<style>${STYLE}</style>
    <div data-w05-surface="backup" data-domain-owner="${safe(adapter.owner)}">
      <header class="b-head"><div class="m0-eyebrow"><bdi dir="ltr">W05 · BACKUP &amp; RESTORE</bdi></div><h1>النسخ الاحتياطي والاستعادة <small>Recovery Safety</small></h1><p class="b-lead">إدارة النسخ الاحتياطية المُتحقق منها والاستعادة المعزولة، وتنفيذ الاختبارات وتقارير الاستعادة من بيئة غير الإنتاج.</p></header>
      <p class="b-warn">⚠ لا يمتلك أي أمر على هذه السطح نقطة استعادة في الإنتاج. <bdi dir="ltr">STAGED_AND_VERIFIED ≠ LIVE_RESTORED</bdi> · <bdi dir="ltr">productionDatabaseMutated = ${safe(String(truth.productionDatabaseMutated))}</bdi> · التفعيل في انتظار السلطة فقط.</p>

      <section class="b-sec"><h2>سير دورة الاستعادة</h2><span class="b-sub">Recovery lifecycle stepper</span>
        <div class="b-stepper">${steps.map((step,index)=>`${index?'<span class="b-arrow" aria-hidden="true">←</span>':''}<article class="b-step"><span class="b-step-n">الخطوة ${step[0]}</span><strong dir="auto">${step[1]}</strong><small style="color:var(--text3);font-size:10px">${B(step[2])}</small><span data-tone="${stateOf(step[3])}">${B(step[3])}</span></article>`).join('')}</div>
        <div class="b-actions" style="margin-top:10px">${cmd('backup.package','إنشاء حزمة مُتحقق منها')}${cmd('backup.plan','تخطيط')}${cmd('backup.preview','معاينة')}${cmd('backup.stage','تجهيز')}${cmd('backup.drill','اختبار استعادة')}${cmd('backup.activationRequest','طلب سلطة التفعيل')}</div>
      </section>

      <section class="b-sec"><h2>تقرير اختبار الاستعادة</h2><span class="b-sub">Restore drill report</span>
        ${drill?`<div class="b-drillhead"><h3>${B(`Restore Drill: ${drill.drillId||'—'}`)}</h3><span class="b-pill" data-tone="${drill.status==='STAGED_AND_VERIFIED'&&drill.liveRestored!==true?'ok':'bad'}" data-backup-drill-status="${safe(drill.status)}">${B(drill.status)} · ${drill.liveRestored===true?'LIVE RESTORED':'VERIFIED ONLY'}</span></div>
        <div class="b-meta"><span>النسخة المصدر<b>${B(drill.packageId||pkg?.packageId||'—')}</b></span><span>بصمة اللقطة<b>${B((drill.snapshotSha256||pkg?.snapshotSha256||'—').slice(0,24))}…</b></span><span>بيئة التنفيذ<b>${B(s.stage?.target?.kind||'ISOLATED_RESTORE_DRILL')}</b></span><span>وقت التجهيز<b>${B(s.stage?.stagedAt||s.plan?.createdAt||'—')}</b></span><span>التفعيل<b>${B(truth.activationAuthority)}</b></span></div>`
        :`<p class="state-token" data-state="unavailable"><strong>لم يُنفَّذ اختبار استعادة</strong> · No isolated RestoreDrill has run yet. Not-run is never reported as restored.</p>`}
        <div class="b-cards">${verification.map(([icon,label,value,status])=>`<article class="b-card"><h4><span aria-hidden="true">${icon}</span> ${safe(label)} <span data-tone="${stateOf(status)}" style="font:700 10px var(--mono)">${B(status)}</span></h4><p>${value===null||value===undefined?'<span class="b-empty">غير مُتاح بعد</span>':`<bdi dir="ltr">${safe(String(value))}</bdi>`}</p></article>`).join('')}</div>
      </section>

      <section class="b-sec"><h2>المتوقّع مقابل الفعلي</h2><span class="b-sub">Expected vs actual</span>
        <table class="b-cmp"><thead><tr><th scope="col" style="width:34%"><strong>الحقيقة</strong><em>TRUTH</em></th><th scope="col" style="width:34%"><strong>المتوقّع</strong><em>EXPECTED</em></th><th scope="col" style="width:24%"><strong>الفعلي</strong><em>ACTUAL</em></th><th scope="col" style="width:8%"><strong>مطابق</strong><em>OK</em></th></tr></thead><tbody>${comparison.map(([label,expected,actual,ok])=>`<tr><td dir="auto">${safe(label)}</td><td>${expected}</td><td>${actual}</td><td><span data-tone="${ok?'ok':'bad'}">${ok?'✓':'✕'}</span></td></tr>`).join('')}</tbody></table>
        <p class="b-empty" style="margin:8px 0 0">سجل الإخفاق والتعويض الدائم: <bdi dir="ltr">${safe(truth.durableFailureCompensationHistory)}</bdi> · إيصالات النجاح: <bdi dir="ltr">${safe(truth.durableSuccessReceipts)}</bdi></p>
      </section>

      <section class="b-sec"><h2>سجل المحاولات</h2><span class="b-sub">Attempt history</span>
        <div class="b-attempts">${attempts.length?attempts.slice().reverse().map(row=>`<p>${B(row.attemptId||'—')} · ${B(row.operation||row.action||'—')} · <span data-tone="${/FAIL/.test(String(row.status))?'bad':'ok'}">${B(row.status||'OBSERVED')}</span>${row.packageId?` · ${B(row.packageId)}`:''}${row.liveRestored!==undefined?` · liveRestored=${B(String(row.liveRestored))}`:''}</p>`).join(''):'<p class="b-empty">لا محاولات مسجّلة في هذه الجلسة.</p>'}</div>
      </section>
    </div>`;

    /* ---- LEFT: restore-point queue + lifecycle groups (structure/navigation only) ---- */
    const left=document.createElement('section');left.className='b-nav';
    left.innerHTML=`<style>.b-nav{display:grid;gap:10px;min-width:0}.b-nav h3{margin:0;font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em}.b-nav ul{list-style:none;margin:0 0 8px;padding:0;display:grid;gap:5px}.b-nav li>button{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;width:100%;text-align:start;border:1px solid var(--line);border-radius:9px;background:transparent;color:inherit;padding:9px;cursor:pointer;font-size:12px}.b-nav li>button[aria-pressed="true"]{border-color:var(--accent);background:rgba(255,255,255,.05)}.b-nav li>button strong{display:block;overflow-wrap:anywhere;font-size:12.5px}.b-nav li>button small{display:block;color:var(--text3);font-size:10.5px;overflow-wrap:anywhere}.b-nav .b-count{font:700 11px var(--mono);align-self:center}.b-nav .b-group{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:11.5px}.b-nav .b-group bdi{font-family:var(--mono);font-size:10.5px}</style>
      <h3>نقاط الاستعادة (${s.packages.length})</h3>
      <ul>${s.packages.length?s.packages.map(row=>`<li><button type="button" data-b-pkg="${safe(row.packageId)}" aria-pressed="${row.packageId===pkg?.packageId}"><span><strong>${B(row.packageId)}</strong><small>${B(String(row.capturedAt||row.createdAt||'—'))}</small><small>${B(String(row.manifestSha256||'').slice(0,20))}…</small></span><span class="b-count" data-tone="${row.status==='PACKAGE_VERIFIED'?'ok':'warn'}">${B(row.status||'CREATED')}</span></button></li>`).join(''):'<li><p class="state-token" data-state="empty"><strong>لا حزم بعد</strong> · No verified BackupPackage exists.</p></li>'}</ul>
      <h3>مراحل الاستعادة</h3>
      ${steps.slice(1).map(step=>`<div class="b-group"><span>${safe(step[1])}</span><bdi data-tone="${stateOf(step[3])}">${safe(step[3])}</bdi></div>`).join('')}
      <div class="b-actions" style="margin-top:8px">${cmd('backup.package','إنشاء حزمة')}</div>`;
    const leftHost=workspace?.region?.('LEFT',{node:left,label:'نقاط الاستعادة'})||null;
    leftHost?.querySelectorAll?.('[data-b-pkg]').forEach(btn=>btn.addEventListener('click',()=>{adapter.selectPackage?.(btn.dataset.bPkg);render()}));

    /* ---- RIGHT: backup context (unique contextual information only) ---- */
    const availability=['backup.plan','backup.preview','backup.stage','backup.drill','backup.activationRequest'].map(id=>{let a='';try{a=String(adapter.availability(id))}catch(e){a='ERROR'}return [id,a==='true'?'AVAILABLE':a]});
    const right=document.createElement('aside');right.className='b-ctx';
    right.innerHTML=`<style>.b-ctx{display:grid;gap:9px;min-width:0}.b-ctx-block{border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:10px 11px;min-width:0;display:grid;gap:4px}.b-ctx-block h3{margin:0;font-size:12.5px}.b-ctx-block dl{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 8px;font-size:11.5px}.b-ctx-block dt{color:var(--text3);white-space:nowrap}.b-ctx-block dd{margin:0;overflow-wrap:anywhere;text-align:end}.b-ctx-block ul{list-style:none;margin:0;padding:0;display:grid;gap:5px;font-size:11.5px;color:var(--text2);overflow-wrap:anywhere}.b-ctx-block bdi{font-family:var(--mono);font-size:10.5px}</style>
      <section class="b-ctx-block"><h3>الهوية والبصمات</h3>${pkg?`<dl><dt>الحزمة</dt><dd>${B(pkg.packageId)}</dd><dt>البيان</dt><dd>${B(String(pkg.manifestSha256||'—').slice(0,24))}…</dd><dt>اللقطة</dt><dd>${B(String(pkg.snapshotSha256||'—').slice(0,24))}…</dd><dt>المخطط</dt><dd>${B(String(pkg.schemaArtifactSha256||'—').slice(0,24))}…</dd></dl>`:'<ul><li>لا حزمة محددة.</li></ul>'}</section>
      <section class="b-ctx-block"><h3>جاهزية الاستعادة</h3><ul>${availability.map(([id,reason])=>`<li>${B(id)} · <bdi data-tone="${reason==='AVAILABLE'?'ok':'warn'}">${safe(reason)}</bdi></li>`).join('')}</ul></section>
      <section class="b-ctx-block"><h3>البيئة المعزولة</h3><ul><li>النوع: <bdi>${B(s.stage?.target?.kind||'NOT_STAGED')}</bdi></li><li>حية: <bdi>${B(String(s.stage?.target?.live??'—'))}</bdi></li><li>تتطلّب فراغًا حقيقيًا: <bdi>${B(String(s.stage?.target?.trueEmptyRequired??'—'))}</bdi></li><li>الاستباقي الوحيد المسموح به معزول عن الإنتاج.</li></ul></section>
      <section class="b-ctx-block"><h3>تحذير المخاطر</h3><ul><li>ممنوع التنفيذ المباشر على الإنتاج.</li><li>التجهيز المُتحقق ليس استعادة فعلية.</li><li>التفعيل يبقى في انتظار السلطة: <bdi>${B(truth.activationAuthority)}</bdi></li></ul></section>
      <section class="b-ctx-block"><h3>الملكية والحدود</h3><ul><li>المالك: <bdi>${B(truth.owner)}</bdi></li><li>القدرة: <bdi>${B(truth.capabilityOwner)}</bdi></li><li>أيصالات النجاح: <bdi>${B(truth.durableSuccessReceipts)}</bdi></li><li>الملكية التخزينية متغيّرة: <bdi>${B(String(truth.persistenceOwnerMutated))}</bdi></li></ul></section>`;
    workspace?.region?.('RIGHT',{node:right,label:'سياق النسخة'});

    /* ---- BOTTOM: deep workspace (durable receipts) ---- */
    const bottom=document.createElement('section');bottom.className='b-bottom';
    bottom.innerHTML=`<style>.b-bottom pre{max-height:240px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11.5px;background:#070d16;border:1px solid var(--line);border-radius:9px;padding:10px}.b-bottom .b-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}.b-bottom h3{margin:0 0 6px;font-size:13px}</style>
      <div class="b-grid"><div><h3>إيصال آخر عملية</h3><pre dir="ltr" data-w05-receipt>${safe(JSON.stringify(s.lastActivation||s.lastDrill||s.stage||s.preview||s.plan||{state:'IDLE'},null,2))}</pre></div><div><h3>حقيقة المزوّد</h3><pre dir="ltr">${safe(JSON.stringify(truth,null,2))}</pre></div></div>`;
    workspace?.region?.('BOTTOM',{node:bottom,label:'إيصالات الاستعادة',summary:'إيصالات خام؛ التجهيز والتفعيل والاستعادة الفعلية حقائق منفصلة.'});
    workspace?.refreshToolbar?.();
  };
  stage.dataset.surfaceComposition='backup-recovery-safety-workbench';render();workspace?.toolbar?.(['backup.package',...BACKUP_COMMANDS,'foundation.settings']);
  return Object.freeze({owner:'RecoverySafetyWorkbench',render,adapter,slots:{CENTER:'RecoverySafetyWorkbench',LEFT:'restore-point-queue',RIGHT:'backup-context',BOTTOM:'shared-bottom-shell/domain-projection'}});
}
