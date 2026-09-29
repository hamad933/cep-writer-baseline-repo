import {ReviewAuditFamilyHost} from '../../foundation/review/family-host.js';
import {createValidationConsumerAdapter,VALIDATION_RULESET_IDENTITY,VALIDATION_VALIDATOR_IDENTITY} from '../../adapters/validation.js';

const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const B=value=>`<bdi dir="ltr">${escape(value)}</bdi>`;
const sample=JSON.stringify({artifactRef:'artifact-local-001',artifactDigest:'a'.repeat(64),ruleset:VALIDATION_RULESET_IDENTITY,validator:VALIDATION_VALIDATOR_IDENTITY,payload:{note:'تحقّق TCP/IP من العربية'}},null,2);

const STATUS_AR={'TECHNICALLY_VALID':'سليم تقنيًا','TECHNICALLY_INVALID':'غير سليم تقنيًا','UNAVAILABLE':'المتحقّق غير متاح','RUNNING':'قيد التشغيل','QUEUED':'في الانتظار','ERROR':'خطأ'};
const statusTone=status=>status==='TECHNICALLY_VALID'?'ok':status==='UNAVAILABLE'?'warn':status==='RUNNING'?'info':'bad';
/* The declared rule set the bounded validator actually evaluates (adapters/validation.ts).
   It is the source material for the session's rule-outcome table: every rule that ran and was not
   violated is a PASS; violations are the run's TechnicalFindings. Nothing else is inferred. */
const RULES=[
  {ruleId:'JSON_PARSE',code:'INVALID_JSON',label:'المُدخل نص JSON صالح',en:'Input parses as JSON'},
  {ruleId:'ARTIFACT_REF_REQUIRED',code:'ARTIFACT_REF_MISSING',label:'المرجع الدقيق للمُنتَج مُصرَّح',en:'Exact artifactRef declared'},
  {ruleId:'ARTIFACT_DIGEST_REQUIRED',code:'ARTIFACT_DIGEST_MISSING',label:'بصمة SHA-256 للمُنتَج صحيحة',en:'Artifact SHA-256 present'},
  {ruleId:'RULESET_IDENTITY_REQUIRED',code:'RULESET_IDENTITY_MISSING',label:'هوية مجموعة القواعد كاملة',en:'Exact ruleset identity present'},
  {ruleId:'VALIDATOR_IDENTITY_REQUIRED',code:'VALIDATOR_IDENTITY_MISSING',label:'هوية المُتحقّق كاملة',en:'Exact validator identity present'},
  {ruleId:'VALIDATOR_UNAVAILABLE',code:'VALIDATOR_UNAVAILABLE',label:'المُتحقّق المُصرَّح متاح محليًا',en:'Declared validator available locally'},
  {ruleId:'RULESET_UNAVAILABLE',code:'RULESET_UNAVAILABLE',label:'مجموعة القواعد المُصرَّحة متاحة',en:'Declared ruleset available locally'},
  {ruleId:'PAYLOAD_OBJECT_REQUIRED',code:'PAYLOAD_INVALID',label:'الحمولة كائن JSON',en:'payload is a JSON object'},
  {ruleId:'ROOT_OBJECT_REQUIRED',code:'ROOT_NOT_OBJECT',label:'الجذر كائن وليس مصفوفة',en:'root is an object, not an array'}
];
const outcomesOf=(found=[])=>RULES.map(rule=>{const hit=found.find(f=>f.code===rule.code||f.ruleId===rule.ruleId)||null;return {...rule,status:hit?'FAIL':'PASS',finding:hit}});
const durationOf=run=>{const a=Date.parse(run?.requestedAt||''),b=Date.parse(run?.completedAt||'');if(!Number.isFinite(a)||!Number.isFinite(b)||b<a)return '—';const ms=b-a,m=Math.floor(ms/1000);return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`};

export function mountValidationSurface({stage,registry,workspace,adapter=createValidationConsumerAdapter()}={}){
  if(!stage||!registry)throw Error('VALIDATION_PRODUCT_COMPOSITION_REQUIRED');
  let host=null;
  /* Feedback must survive render(): a projection pass must never swallow an action's result (V-2). */
  let feedback=null;
  let selectedFinding=null;
  let selectedRequest=null;

  const shell=document.createElement('section');shell.className='validation-product';
  shell.innerHTML=`<style>
  .validation-product{display:grid;gap:14px;min-width:0}
  .v-head{display:grid;gap:4px};margin-block-start:26px.v-head h1{margin:0;font-size:clamp(20px,2vw,27px);display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.v-head h1 small{font-size:13px;font-weight:600;color:var(--text3)}
  .v-lead{margin:0;color:var(--text2);max-width:78ch;line-height:1.6}
  .v-sec{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);padding:12px;min-width:0}
  .v-sec>h2{margin:0 0 3px;font-size:15px}.v-sub{display:block;font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px}
  .v-session{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.v-session h3{margin:0;font-size:17px}
  .v-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 11px;font:700 11px var(--mono);border:1px solid currentColor}
  .v-meta{display:flex;gap:16px;flex-wrap:wrap;font-size:11.5px;color:var(--text3);margin-bottom:10px}
  .v-meta b{display:block;color:var(--text2);font-weight:650;font-size:12px}
  .v-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px;margin-bottom:12px}
  .v-tile{border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:11px;display:grid;gap:2px;min-width:0}
  .v-tile b{font-size:11.5px;color:var(--text3);font-weight:600}.v-tile strong{font-size:24px;line-height:1.15}.v-tile small{font:600 10px var(--mono);color:var(--text3)}
  .v-table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;max-width:100%}
  table.v-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:560px}
  .v-table th,.v-table td{padding:8px 7px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top;overflow-wrap:anywhere;font-size:11.5px}
  .v-table th{font-size:10.5px;color:var(--text3);background:color-mix(in srgb,var(--panel) 96%,transparent)}
  .v-table th strong{display:block;color:var(--text2);font-size:11.5px}
  .v-table th em{font-style:normal;font:600 9px var(--mono);opacity:.75}
  .v-table tbody tr[data-sev="ERROR"]{background:rgba(255,90,90,.07)}
  .v-table tbody tr[data-sev="ERROR"] td:first-child{box-shadow:inset 3px 0 0 #ff6b6b}
  .v-table tbody tr[data-selected="true"]{outline:2px solid var(--accent);outline-offset:-2px}
  .v-table tbody tr{cursor:pointer}
  .v-feedback{border:1px dashed var(--line);border-radius:10px;padding:10px 12px;display:grid;gap:4px;background:#0b131e}
  .v-feedback[data-ok="true"]{border-color:#2f7d52}.v-feedback[data-ok="false"]{border-color:#8c4650}
  .v-feedback strong{font-size:12.5px}.v-feedback p{margin:0;font-size:12px;color:var(--text2);line-height:1.55}
  .v-feedback bdi{font-family:var(--mono)}
  .v-runner summary{cursor:pointer;font-size:12.5px;color:var(--text2)}
  .v-runner textarea{width:100%;min-height:150px;box-sizing:border-box;margin-top:9px;resize:vertical;border:1px solid var(--line);border-radius:10px;background:#07101b;color:inherit;padding:11px;font:12.5px/1.5 ui-monospace,monospace}
  .v-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
  .v-actions .btn{padding:8px 12px;font-size:12.5px}
  [data-tone="ok"]{color:#37d67a}[data-tone="warn"]{color:#f0b429}[data-tone="bad"]{color:#ff6b6b}[data-tone="muted"]{color:#9fb0c6}[data-tone="info"]{color:#4aa3ff}
  @media(max-width:760px){.v-sec{padding:10px}}
  </style>
  <header class="v-head"><div class="m0-eyebrow"><bdi dir="ltr">W05 · LOCAL BOUNDED RULES</bdi></div><h1>جلسة التحقق <small>Technical Validation</small></h1><p class="v-lead">تحقّق مقيّد على هويات التجزئة ومجموعة القواعد والتحقّق الدقيقة. TechnicalFinding يبقى في W05 ولا يصبح W04 Review Finding أبدًا.</p></header>
  <section class="v-sec" data-v-feedback-host></section>
  <section class="v-sec" data-v-session></section>
  <details class="v-sec v-runner" data-v-runner><summary>مدخل التحقق — Validation input</summary><textarea id="validationInput" dir="auto" aria-label="Validation JSON input"></textarea><div class="v-actions"><button type="button" class="btn" data-validation-run>Validate</button><button type="button" class="btn" data-validation-inspect>Inspect result</button><button type="button" class="btn" data-validation-findings>Technical findings</button></div></details>
  <div class="validation-family-host" data-validation-family-host hidden></div>`;
  stage.replaceChildren(shell);

  const familyRoot=shell.querySelector('[data-validation-family-host]');
  const stateNode=shell.querySelector('[data-v-feedback-host]');
  const input=shell.querySelector('#validationInput');
  input.value=sample;
  const runButton=shell.querySelector('[data-validation-run]'),inspectButton=shell.querySelector('[data-validation-inspect]'),findingsButton=shell.querySelector('[data-validation-findings]');

  const runs=()=>adapter.state.runs||[];
  const currentRun=()=>adapter.state.last||runs().at(-1)||null;
  const runOf=id=>runs().find(r=>r.requestId===id||r.resultId===id)||currentRun();
  const findingsOf=run=>run?run.technicalFindings||[]:[];
  const selRun=()=>runOf(selectedRequest)||currentRun();
  const selFinding=()=>{const list=findingsOf(selRun());return list.find(f=>f.id===selectedFinding)||list[0]||null;};

  const renderSession=()=>{
    const run=selRun(),list=findingsOf(run),node=shell.querySelector('[data-v-session]');
    const totalFindings=runs().reduce((sum,r)=>sum+findingsOf(r).length,0);
    const valid=runs().filter(r=>r.status==='TECHNICALLY_VALID').length;
    const invalid=runs().filter(r=>r.status==='TECHNICALLY_INVALID').length;
    const unavailable=runs().filter(r=>r.status==='UNAVAILABLE').length;
    const outcomes=outcomesOf(findingsOf(run)),passed=outcomes.filter(o=>o.status==='PASS').length,failed=outcomes.length-passed;
    node.innerHTML=`<h2>جلسة التحقق</h2><span class="v-sub">Validation session</span>
      ${run?`<div class="v-session"><h3>${B(run.requestId)}</h3><span class="v-pill" data-tone="${statusTone(run.status)}" data-validation-status="${escape(run.status)}">${escape(STATUS_AR[run.status]||run.status)} · ${B(run.status)}</span></div>
      <div class="v-meta"><span>تاريخ البدء<bdi dir="ltr">${escape(String(run.requestedAt||'—'))}</bdi></span><span>تاريخ الانتهاء<bdi dir="ltr">${escape(String(run.completedAt||'—'))}</bdi></span><span>المدة<bdi dir="ltr">${escape(durationOf(run))}</bdi></span><span>النتيجة<bdi dir="ltr">${escape(run.resultId||'—')}</bdi></span></div>
      <div class="v-tiles">
        <div class="v-tile"><b>إجمالي الفحوص</b><strong>${outcomes.length}</strong><small>CHECKS EXECUTED · ${runs().length} RUNS</small></div>
        <div class="v-tile"><b>نجاح</b><strong data-tone="ok">${passed}</strong><small>PASS · VALID ${valid}</small></div>
        <div class="v-tile"><b>تحذير</b><strong data-tone="muted">0</strong><small>WARNING · 0</small></div>
        <div class="v-tile"><b>فشل</b><strong data-tone="${failed?'bad':'muted'}">${failed}</strong><small>FAIL · INVALID ${invalid} · UNAVAILABLE ${unavailable}</small></div>
      </div>
      <h3 style="margin:0 0 6px;font-size:12px">نتائج الفحص <span class="v-sub" style="display:inline;margin-inline-start:6px">Rule outcomes</span></h3>
      <div class="v-table-wrap"><table class="v-table"><thead><tr><th scope="col" style="width:7%"><strong>الحالة</strong><em>STATUS</em></th><th scope="col" style="width:20%"><strong>القاعدة</strong><em>RULE</em></th><th scope="col" style="width:18%"><strong>الرمز</strong><em>CODE</em></th><th scope="col" style="width:30%"><strong>الفحص</strong><em>CHECK</em></th><th scope="col" style="width:25%"><strong>النتيجة التفصيلية</strong><em>OUTCOME</em></th></tr></thead><tbody>${outcomes.map(o=>`<tr data-v-finding="${escape(o.finding?.id||o.code)}" data-sev="${o.status==='FAIL'?'ERROR':'PASS'}" data-selected="${o.finding?.id===selFinding()?.id}"><td><span data-tone="${o.status==='FAIL'?'bad':'ok'}">${o.status==='FAIL'?'✕ FAIL':'✓ PASS'}</span></td><td>${B(o.ruleId)}</td><td>${B(o.code)}</td><td dir="auto">${escape(o.label)}<small>${escape(o.en)}</small></td><td>${o.finding?`${B(o.finding.locator||'—')}<small dir="auto">${escape(o.finding.message)}</small>`:'<small>مخالفة غير مسجّلة في هذه الجلسة.</small>'}</td></tr>`).join('')}</tbody></table></div>
      <p class="v-lead" style="margin-top:9px;font-size:12px"><bdi dir="ltr">TechnicalFinding ≠ W04 Review Finding</bdi> · <bdi dir="ltr">formalReviewAuthority = false</bdi></p>`
      :`<p class="state-token" data-state="empty"><strong>لا جلسة تحقق بعد</strong> · No validation session has been run. Not-run is not technically valid.</p>`}`;
    shell.querySelectorAll('tr[data-v-finding]').forEach(row=>row.addEventListener('click',()=>{selectedFinding=row.dataset.vFinding;render()}));
  };
  const renderFeedback=()=>{
    const node=stateNode;
    if(!feedback){node.innerHTML='<span class="v-sub" style="margin:0 0 6px">آخر نتيجة إجراء · Last action result</span><p class="v-lead" style="margin:0;font-size:12px">لم يُنفَّذ إجراء بعد. نتيجة الفحص أو استعراض TechnicalFindings ستُعرض هنا وتبقى بعد إعادة الرسم.</p>';return}
    node.innerHTML=`<span class="v-sub" style="margin:0 0 6px">آخر نتيجة إجراء · Last action result</span><div class="v-feedback" data-ok="${feedback.ok?'true':'false'}"><strong data-tone="${feedback.ok?'ok':'bad'}">${feedback.title}</strong>${feedback.lines.map(line=>`<p>${line}</p>`).join('')}</div>`;
  };

  const render=()=>{
    adapter.refresh();renderSession();renderFeedback();
    const run=selRun(),finding=selFinding();
    const left=document.createElement('section');left.className='v-nav';
    left.innerHTML=`<style>.v-nav{display:grid;gap:10px;min-width:0}.v-nav h3{margin:0;font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em}.v-nav ul{list-style:none;margin:0 0 8px;padding:0;display:grid;gap:5px}.v-nav button{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;text-align:start;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;padding:8px 9px;cursor:pointer;font-size:12.5px}.v-nav button:hover,.v-nav button[aria-pressed="true"]{border-color:var(--line);background:rgba(255,255,255,.05)}.v-nav .v-dot{width:10px;height:10px;border-radius:50%;background:currentColor}.v-nav .v-count{font:600 11px var(--mono);color:var(--text3)}.v-nav dl{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 8px;font-size:11px}.v-nav dt{color:var(--text3)}.v-nav dd{margin:0;overflow-wrap:anywhere;text-align:end}.v-nav bdi{font-family:var(--mono);font-size:10.5px}</style>
      <h3>جلسات التحقق</h3>
      <ul>${runs().length?[...runs()].reverse().map(r=>`<li><button type="button" data-v-run="${escape(r.requestId)}" aria-pressed="${r.requestId===run?.requestId}"><span class="v-dot" data-tone="${statusTone(r.status)}"></span><span>${B(r.requestId)}<br><small style="color:var(--text3)">${escape(STATUS_AR[r.status]||r.status)} · ${findingsOf(r).length} finding</small></span><span class="v-count">${escape(String(r.completedAt||'').slice(11,19)||'—')}</span></button></li>`).join(''):'<li><p class="state-token" data-state="empty"><strong>لا جلسات</strong> · No session yet.</p></li>'}</ul>
      <h3>بنية التحقق</h3>
      <dl><dt>التحقّق</dt><dd>${B(VALIDATION_VALIDATOR_IDENTITY.id)}@${B(VALIDATION_VALIDATOR_IDENTITY.version)}</dd><dt>مجموعة القواعد</dt><dd>${B(VALIDATION_RULESET_IDENTITY.id)}@${B(VALIDATION_RULESET_IDENTITY.revision)}</dd><dt>الجلسات</dt><dd>${runs().length}</dd><dt>التقيّم</dt><dd>مقيّد محليًا</dd></dl>`;
    const leftHost=workspace?.region?.('LEFT',{node:left,label:'جلسات التحقق'})||null;
    leftHost?.querySelectorAll?.('[data-v-run]').forEach(btn=>btn.addEventListener('click',()=>{selectedRequest=btn.dataset.vRun;selectedFinding=null;render()}));

    const right=document.createElement('aside');right.className='v-ctx';
    const artifact=run?.identity?.artifact,ruleset=run?.identity?.ruleset,validator=run?.identity?.validator;
    const sections=[
      ['لماذا؟',finding?`${escape(finding.message)}`:(run?`${escape(STATUS_AR[run.status]||run.status)} · ${findingsOf(run).length} TechnicalFinding`:'لا جلسة بعد')],
      ['النطاق المتأثر',`${B(artifact?.ref||'—')}${finding?.locator?` · ${B(finding.locator)}`:''}`],
      ['التبعية',`${B(ruleset?`${ruleset.id}@${ruleset.revision}`:'—')} · ${B(validator?`${validator.id}@${validator.version}`:'—')}`],
      ['التفسير',finding?`${B(finding.code)} · ${escape(finding.severity)} — دلالة تقنية فقط على مخالفة قاعدة`:'لا مخالفة مسجّلة في الجلسة المحددة'],
      ['إعادة التشغيل','متاحة · <bdi dir="ltr">validation.validate</bdi> متاح دائمًا ولا يحتاج سلطة'],
      ['المصدر',`${B(run?.requestId||'—')} · ${B(run?.inputDigest||'—')}`],
      ['الحدود',(run?.limitations||['Technical validation only','No admission/review/mastery authority']).map(x=>escape(x)).join(' · ')],
      ['حدود السلطة','<bdi dir="ltr">formalReviewFinding = false</bdi> · <bdi dir="ltr">formalReviewAuthority = false</bdi> · <bdi dir="ltr">acceptanceAuthority = false</bdi>']
    ];
    right.innerHTML=`<style>.v-ctx{display:grid;gap:9px;min-width:0}.v-ctx-block{border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:10px 11px;min-width:0;display:grid;gap:4px}.v-ctx-block h3{margin:0;font-size:12.5px;display:flex;gap:7px;align-items:center}.v-ctx-block h3 span{font:600 9.5px var(--mono);color:var(--text3);opacity:.85}.v-ctx-block p{margin:0;font-size:11.5px;line-height:1.55;color:var(--text2);overflow-wrap:anywhere}.v-ctx-notice{border-color:#8c6a2f;background:rgba(240,180,41,.07)}</style>
      ${run&&run.status!=='TECHNICALLY_VALID'?`<div class="v-ctx-block v-ctx-notice"><h3><span aria-hidden="true">⚠</span> تنبيه الجلسة</h3><p>${escape(STATUS_AR[run.status]||run.status)} — النتيجة ليست سليمة تقنيًا؛ لا يُستنتج قبول أو قرار مراجعة.</p></div>`:''}
      ${sections.map(([title,body],index)=>`<section class="v-ctx-block"><h3>${escape(title)} <span>${String(index+1).padStart(2,'0')}</span></h3><p>${body}</p></section>`).join('')}`;
    workspace?.region?.('RIGHT',{node:right,label:'سياق التحقق المحدد'});

    if(!host){
      host=new ReviewAuditFamilyHost({consumer:adapter.consumerInput||adapter.consumer,onRefresh:async()=>{adapter.refresh();render()}});
      host.mount(familyRoot,{provenanceCore:adapter.provenance,reviewSnapshot:adapter.reviewSnapshot(),title:'Validation · Audit/Provenance inspection',summary:'Actual validation runs feed shared provenance inspection. Formal review findings remain a separate W04 governed domain.'});
    }else host.update({provenanceCore:adapter.provenance,reviewSnapshot:adapter.reviewSnapshot()});

    const bottom=document.createElement('section');bottom.className='v-bottom';
    const snapshot=adapter.collection.snapshot();
    bottom.innerHTML=`<style>.v-bottom{display:grid;gap:10px}.v-bottom h3{margin:0 0 6px;font-size:13px}.v-bottom .technical-finding{border:1px solid var(--line);border-radius:9px;background:#0d1622;padding:9px 10px;display:grid;gap:3px}.v-bottom .technical-finding bdi{font-family:var(--mono);font-size:11px}.v-bottom .technical-finding small{color:var(--text3)}</style>
      <div><h3>TechnicalFindings (${snapshot.visibleRows.length})</h3>${snapshot.visibleRows.length?snapshot.visibleRows.map(f=>`<article class="technical-finding" data-technical-finding="${escape(f.id)}"><strong dir="auto">${escape(f.message)}</strong><div>${B(f.code)} · ${B(f.locator||'')}</div><small>TechnicalFinding only · formalReviewFinding=false</small></article>`).join(''):'<p class="state-token" data-state="ok"><strong>لا TechnicalFindings</strong> · صفر فحوص فنية مخالفة · صفر formalReviewFinding.</p>'}</div>`;
    bottom.appendChild(familyRoot);familyRoot.hidden=false;familyRoot.style.minWidth='0';
    workspace?.region?.('BOTTOM',{node:bottom,label:'Technical findings',summary:'TechnicalFinding يبقى منفصلًا عن W04 Review Finding.'});
    workspace?.refreshToolbar?.();
    return run;
  };

  const run=async payload=>{runButton.disabled=true;stateNode.textContent='Running technical validation…';try{const result=await adapter.validate(payload?.raw??input.value);feedback={ok:result.status==='TECHNICALLY_VALID',title:`${STATUS_AR[result.status]||result.status} · ${B(result.resultId||result.requestId)}`,lines:[`النتيجة: <bdi dir="ltr">${escape(result.status)}</bdi> · ${result.technicalFindings.length} TechnicalFinding · 0 formalReviewFinding`,result.identity?`الهوية: <bdi dir="ltr">${escape(result.identity.artifact.ref)}</bdi> · <bdi dir="ltr">${escape(result.identity.ruleset.id)}@${escape(result.identity.ruleset.revision)}</bdi>`:'الهوية الدقيقة غير مكتملة.']};selectedRequest=result.requestId;selectedFinding=null;return result}finally{runButton.disabled=false;render()}};
  registry.register('validation.validate','ValidationConsumerAdapter','Validate exact artifact',run,()=>!adapter.state.processing||'Validation already processing');
  registry.register('validation.inspect','ValidationConsumerAdapter','Inspect validation result',payload=>{const result=adapter.inspect(payload||{});feedback=result.ok?{ok:true,title:`${escape(result.code)} · لا سلطة قبول أو مراجعة`,lines:[`الجلسة: <bdi dir="ltr">${escape(result.result?.requestId||'—')}</bdi> · <bdi dir="ltr">${escape(result.result?.status||'—')}</bdi>`,`تطابق الهوية الحالية: <bdi dir="ltr">${String(result.currentIdentityMatches)}</bdi>`,...(result.limitations||[]).map(x=>escape(x))]}:{ok:false,title:`${escape(result.code)}`,lines:['لا نتيجة تحقق لاستعراضها.']};render();return result},()=>adapter.state.last?true:'No validation result');
  registry.register('validation.findings','ValidationConsumerAdapter','Inspect TechnicalFindings',payload=>{const result=adapter.findings(payload||{});feedback=result.ok?{ok:true,title:`${result.technicalFindings.length} TechnicalFinding · 0 W04 Finding`,lines:result.technicalFindings.length?result.technicalFindings.map(f=>`${B(f.code)} · <span dir="auto">${escape(f.message)}</span>`):['لا TechnicalFindings — وهذا ليس دليلًا على نجاح المراجعة.'] }:{ok:false,title:`${escape(result.code)}`,lines:['لا نتيجة تحقق.']};selectedFinding=null;render();return result},()=>adapter.state.last?true:'No validation result');
  registry.register('validation.run','ValidationConsumerAdapter','Legacy alias · validate exact artifact',run,()=>!adapter.state.processing||'Validation already processing');
  runButton.addEventListener('click',()=>Promise.resolve(registry.execute('validation.validate',{raw:input.value,route:'validation-validate-button'})).catch(error=>{feedback={ok:false,title:'ERROR',lines:[escape(String(error?.message||error))]},render()}));
  inspectButton.addEventListener('click',()=>registry.execute('validation.inspect',{route:'validation-inspect-button'}));
  findingsButton.addEventListener('click',()=>registry.execute('validation.findings',{route:'validation-findings-button'}));
  stage.dataset.surfaceComposition='validation-session-dashboard';
  render();
  workspace?.toolbar?.(['validation.validate','validation.inspect','validation.findings','foundation.settings']);
  return Object.freeze({owner:'ValidationProductComposition',adapter,host:()=>host,render,realProductConsumer:true,slots:{CENTER:'TechnicalValidationWorkbench',LEFT:'shared-collection',RIGHT:'shared-context/audit',BOTTOM:'shared-audit-provenance'}});
}
