import {AuditProvenanceHost} from '../../foundation/audit/provenance-host.js';
import {AuditProvenanceInteractionCore} from '../../foundation/audit/provenance.js';
import {createAuditConsumerAdapter,AUDIT_COMMANDS} from '../../adapters/audit.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const STYLE=`
.s18-audit{display:grid;gap:14px;min-width:0}
.a-head{display:grid;gap:4px};margin-block-start:26px.a-head h1{margin:0;font-size:clamp(20px,2vw,27px);display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.a-head h1 small{font-size:13px;font-weight:600;color:var(--text3)}
.a-lead{margin:0;color:var(--text2);max-width:78ch;line-height:1.6}
.a-sec{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);padding:12px;min-width:0}
.a-sec>h2{margin:0 0 3px;font-size:15px}.a-sub{display:block;font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px}
.a-filters{display:flex;gap:7px;flex-wrap:wrap;align-items:end;margin-bottom:10px}
.a-filters label{display:grid;gap:3px;font-size:10.5px;color:var(--text3);min-width:0}
.a-filters input,.a-filters select{min-width:0;border:1px solid var(--line);border-radius:8px;background:#0d131b;color:inherit;padding:7px 8px;font-size:12px}
.a-filters .btn{padding:7px 11px;font-size:12px}
.a-table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;max-width:100%}
table.a-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:600px}
.a-table th,.a-table td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top;overflow-wrap:anywhere;font-size:11.5px}
.a-table th{font-size:10.5px;color:var(--text3);background:color-mix(in srgb,var(--panel) 96%,transparent)}
.a-table th strong{display:block;color:var(--text2);font-size:11.5px}
.a-table th em{font-style:normal;font:600 9px var(--mono);opacity:.75}
.a-table td bdi{font-family:var(--mono);font-size:10.5px}
.a-table tr[data-selected="true"]{background:rgba(255,255,255,.05);outline:2px solid var(--accent);outline-offset:-2px}
.a-table tbody tr{cursor:pointer}
.a-chain{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.a-node{border:1px solid var(--line);border-radius:10px;background:#0d1622;padding:9px 10px;min-width:0;flex:1 1 190px;display:grid;gap:4px;position:relative}
.a-node .a-node-n{position:absolute;top:-9px;inset-inline-end:10px;width:20px;height:20px;border-radius:50%;border:1px solid var(--accent);background:#0b131e;display:grid;place-items:center;font:700 10px var(--mono);color:var(--accent)}
.a-node strong{font-size:12px;overflow-wrap:anywhere}.a-node small{color:var(--text3);font-size:10.5px;display:block;overflow-wrap:anywhere}
.a-node bdi{font-family:var(--mono);font-size:10.5px}
.a-arrow{align-self:center;color:var(--text3)}
.a-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}
.a-card{border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:11px;min-width:0;display:grid;gap:7px;align-content:start}
.a-card>h3{margin:0;font-size:13px}.a-card p{margin:0;font-size:12px;line-height:1.55;color:var(--text2)}
.a-tokens{display:flex;gap:7px;flex-wrap:wrap}.a-token{border:1px solid var(--line);border-radius:999px;padding:4px 9px;font:600 11px var(--mono)}
.a-token[data-tone="bad"]{border-color:#8c4650}.a-token[data-tone="ok"]{border-color:#2f7d52}
.a-form{display:grid;grid-template-columns:minmax(0,.4fr) minmax(0,1fr) auto;gap:8px}
.a-form input{min-width:0;border:1px solid var(--line);border-radius:9px;background:#0d131b;color:inherit;padding:9px 10px}
.a-form .btn{padding:9px 12px}
.a-settle{border:1px dashed var(--line);border-radius:11px;padding:11px 13px;font-size:12.5px;display:grid;gap:4px;background:#0b131e}
.a-settle[data-state="SUCCESS"]{border-color:#2f7d52}.a-settle[data-state="FAILURE"]{border-color:#8c4650}
.a-settle bdi{font-family:var(--mono)}
.a-notes{font-size:12px;color:var(--text2);max-height:150px;overflow:auto;display:grid;gap:5px}
.a-empty{color:var(--text3);font-size:12px}
[data-tone="ok"]{color:#37d67a}[data-tone="warn"]{color:#f0b429}[data-tone="bad"]{color:#ff6b6b}[data-tone="muted"]{color:#9fb0c6}[data-tone="info"]{color:#4aa3ff}
@media(max-width:1024px){.a-form{grid-template-columns:1fr}.a-form .btn{justify-self:start}}
`;

export async function settleAuditAnnotation(effect,project=()=>{}){
  if(typeof effect!=='function')throw Error('AUDIT_ANNOTATION_EFFECT_REQUIRED');
  project(Object.freeze({state:'PENDING',code:'AUDIT_ANNOTATION_PENDING',settled:false}));
  try{
    const result=await effect(),success=result?.ok===true,state=success?'SUCCESS':'FAILURE',code=success?(result.status||result.code||'AUDIT_ANNOTATION_RECORDED'):(result?.code||result?.status||'AUDIT_ANNOTATION_FAILED');
    const settlement=Object.freeze({state,code:String(code),settled:true,result:result||null});project(settlement);return settlement;
  }catch(error){const settlement=Object.freeze({state:'FAILURE',code:String(error?.code||error?.message||'AUDIT_ANNOTATION_REJECTED'),settled:true,error:String(error?.message||error)});project(settlement);return settlement;}
}

export function mountAuditSurface({stage,registry,workspace,runtimeAdapter=null}={}){
  if(!stage||!registry)throw Error('AUDIT_PRODUCT_COMPOSITION_REQUIRED');
  const adapter=runtimeAdapter?(()=>{
    const provider={
      descriptor:()=>({providerId:'W05AuditEventProvider',domainKind:'cep-audit-events',schemaVersion:'1.0.0',authorityRef:'AuditEventProvider',label:'Durable application AuditEvents'}),
      read:()=>{const state=runtimeAdapter.snapshot(),events=state.events||[],observedAt=new Date().toISOString(),error=state.lastError;return {state:error?'ERROR':events.length?'READY':'EMPTY',identity:{id:'w05-durable-audit-events',label:'Durable application AuditEvents',revision:String(events.at(-1)?.sequence||0),correlationIds:[],provenanceRefs:['AuditEventProvider','W05AuditDomain']},entries:events.map(row=>({id:`audit-event-${row.sequence}`,label:`#${row.sequence} · ${row.action}`,kind:'AUDIT_EVENT',timestamp:row.time||row.timestamp||null,actorLabel:row.actor||'Local product user',summary:`${row.outcome||'OBSERVED'} · ${row.target||'application'}`,parentIds:row.previousHash&&row.previousHash!=='GENESIS'?[row.previousHash]:[],correlationIds:[row.correlationId].filter(Boolean),provenanceRefs:[row.recordHash].filter(Boolean),attributes:{sequence:row.sequence,recordHash:row.recordHash,previousHash:row.previousHash,outcome:row.outcome,hashAlgorithm:'SHA-256',hashIsEncryption:false,databaseImmutabilityClaim:false}})),message:error?`AuditEventProvider unavailable: ${error.code||error.error||'ERROR'}`:events.length?'Durable AuditEvents from the bounded local runtime provider.':'No durable AuditEvents observed.',observedAt,freshness:{source:'AUDIT_EVENT_PROVIDER_DURABLE_JSONL',observedAt,stale:false},truth:{domainSource:'W05AuditDomain',providerSource:'AuditEventProvider',commandReceiptSource:false,databaseImmutabilityClaim:false}};}
    };
    const provenance=new AuditProvenanceInteractionCore(provider);provenance.refresh();
    return {owner:'W05AuditDomain',runtimeAdapter,provider,provenance,search:async(filters={})=>{const result=await runtimeAdapter.search(typeof filters==='string'?{action:filters}:filters);provenance.refresh();return result},verify:async()=>{const result=await runtimeAdapter.verify();provenance.refresh();return result},annotate:async payload=>{const result=await runtimeAdapter.annotate(payload);provenance.refresh();return result},refresh:()=>provenance.refresh(),integrity:()=>runtimeAdapter.snapshot().integrity||{status:'UNVERIFIED',firstInvalidSequence:null,scope:null},annotations:()=>runtimeAdapter.snapshot().annotations||[],truth:()=>runtimeAdapter.truth()};
  })():createAuditConsumerAdapter();

  /* Surface-local presentation state. It is deliberately NOT cleared by render(): a settlement
     (success or fail-closed) must survive the next projection pass (defect A-2). */
  let filter={query:'',action:'',actor:'',outcome:''};
  let selectedSequence=null;
  let settlement=null;

  const allEvents=()=>{
    const rows=runtimeAdapter?(runtimeAdapter.snapshot().events||[]):(adapter.domain?adapter.domain.rows():[]);
    const notes=adapter.annotations?adapter.annotations():[];
    return rows.map(row=>({...row,annotationRevisions:notes.filter(note=>String(note.eventId)===String(row.eventId)).length}));
  };
  const matches=row=>(!filter.query||JSON.stringify(row).toLowerCase().includes(filter.query.toLowerCase()))
    &&(!filter.action||row.action===filter.action)&&(!filter.actor||row.actor===filter.actor)&&(!filter.outcome||row.outcome===filter.outcome);
  const visible=()=>allEvents().filter(matches).sort((a,b)=>(b.sequence||0)-(a.sequence||0));
  const selected=()=>{const rows=allEvents();return rows.find(row=>row.sequence===selectedSequence)||visible()[0]||rows.at(-1)||null;};
  const chainOf=(row,limit=3)=>{if(!row)return[];const rows=allEvents(),byHash=new Map(rows.map(r=>[r.recordHash,r]));const out=[row];let cursor=row;while(out.length<limit&&cursor.previousHash&&cursor.previousHash!=='GENESIS'){const prev=byHash.get(cursor.previousHash);if(!prev)break;out.push(prev);cursor=prev;}return out.reverse();};
  const toneFor=outcome=>/FAIL|ERROR|DENY|REFUSE/i.test(String(outcome||''))?'bad':/WARN|PARTIAL/i.test(String(outcome||''))?'warn':'ok';

  stage.innerHTML=`<section class="s18-audit" data-w05-surface="audit" data-domain-owner="W05AuditDomain"><style>${STYLE}</style>
    <header class="a-head"><div class="m0-eyebrow"><bdi dir="ltr">W05 · DURABLE EVENT TRACE</bdi></div><h1>السجل الدائم <small>Audit &amp; Traceability</small></h1><p class="a-lead">تاريخ الأحداث وعن النشاط عبر النظام والعمليات. سلسلة التجزئة قابلة للفحص وليست تشفيرًا؛ الالتزامات مخزنة كتعديلات منفصلة ولا تتغيّر أبدًا.</p></header>
    <div data-a-settle-host></div>
    <section class="a-sec"><h2>جدول الأحداث</h2><span class="a-sub">Audit event table</span>
      <div class="a-filters">
        <label style="flex:1 1 180px">بحث<input data-a-search dir="auto" type="search" placeholder="actor / action / target / hash" autocomplete="off"></label>
        <label>الفاعل<select data-a-actor dir="ltr"></select></label>
        <label>الإجراء<select data-a-action dir="ltr"></select></label>
        <label>النتيجة<select data-a-outcome dir="ltr"></select></label>
        <button type="button" class="btn" data-a-reset>إعادة ضبط</button>
        <button type="button" class="btn" data-a-verify>فحص السلسلة</button>
      </div>
      <div data-a-table></div>
      <div data-a-chain></div>
    </section>
    <div class="a-cards">
      <article class="a-card" data-integrity></article>
      <article class="a-card"><h3>معنى الحالة</h3><p><bdi dir="ltr">AuditEvent != SemanticCommandBus receipt</bdi> · التجزئة <bdi dir="ltr">SHA-256</bdi> للتحقق لا للتخزين المشفّر · لا يُدّعى إثبات تغيّر قاعدة البيانات · الالتزامات تعديلات منفصلة.</p></article>
    </div>
    <section class="a-sec"><h2>الالتزامات المنفصلة</h2><span class="a-sub">Separate annotation revisions</span>
      <form class="a-form" data-annotation-form><input data-event-id inputmode="numeric" dir="ltr" placeholder="AuditEvent id (eventId)" aria-label="AuditEvent id"><input data-note dir="auto" placeholder="Annotation — stored separately from the AuditEvent" aria-label="Audit annotation"><button type="submit" class="btn">Annotate</button></form>
      <p class="a-empty" data-annotation-status role="status" aria-live="polite" style="margin:8px 0 0"></p>
      <div class="a-notes" data-annotations style="margin-top:8px"></div>
    </section>
    <section class="a-sec" data-provenance></section>
  </section>`;

  const root=stage.querySelector('[data-provenance]'),hostRoot=new AuditProvenanceHost(root,adapter.provenance);

  const fillSelect=(element,values,current,allLabel)=>{element.innerHTML=[`<option value="">${allLabel}</option>`,...values.map(value=>`<option value="${esc(value)}"${value===current?' selected':''}>${esc(value)}</option>`)].join('')};
  const renderTable=()=>{
    const rows=visible(),wrap=stage.querySelector('[data-a-table]');
    wrap.innerHTML=rows.length?`<div class="a-table-wrap"><table class="a-table"><thead><tr><th scope="col" style="width:12%"><strong>الوقت</strong><em>TIME</em></th><th scope="col" style="width:13%"><strong>الفاعل</strong><em>ACTOR</em></th><th scope="col" style="width:27%"><strong>الإجراء</strong><em>ACTION</em></th><th scope="col" style="width:20%"><strong>الهدف</strong><em>TARGET</em></th><th scope="col" style="width:12%"><strong>النتيجة</strong><em>RESULT</em></th><th scope="col" style="width:16%"><strong>التتبّع</strong><em>TRACE</em></th></tr></thead><tbody>${rows.slice(0,40).map(row=>`<tr data-a-row="${esc(String(row.sequence))}" data-selected="${row.sequence===selected()?.sequence}"><td><bdi dir="ltr">${esc(String(row.time||row.occurredAt||'').slice(11,19)||'—')}</bdi></td><td dir="auto">${esc(row.actor)}</td><td><bdi dir="ltr">${esc(row.action)}</bdi></td><td dir="auto">${esc(row.target)}</td><td><span data-tone="${toneFor(row.outcome)}">${esc(row.outcome)}</span></td><td><bdi dir="ltr">${esc(row.correlationId||'—')}</bdi></td></tr>`).join('')}</tbody></table></div><p class="a-empty" style="margin:6px 0 0">${rows.length} من ${allEvents().length} حدثًا مطابقًا.</p>`:`<p class="state-token" data-state="empty"><strong>لا توجد أحداث مطابقة</strong> · No observed AuditEvent matches the current filter. Zero matches is not a coverage claim.</p>`;
    wrap.querySelectorAll('tr[data-a-row]').forEach(node=>node.addEventListener('click',()=>{selectedSequence=Number(node.dataset.aRow);render();}));
    const chain=stage.querySelector('[data-a-chain]'),sel=selected(),links=chainOf(sel);
    chain.innerHTML=`<p class="a-empty" style="margin:12px 0 6px">سلسلة التتبّع — <bdi dir="ltr">${esc(sel?String(sel.correlationId||sel.recordHash||'—'):'—')}</bdi> · ${links.length} حدث</p>${links.length?`<div class="a-chain">${links.map((row,index)=>`${index?'<span class="a-arrow" aria-hidden="true">←</span>':''}<article class="a-node"><span class="a-node-n">${index+1}</span><small><bdi dir="ltr">${esc(String(row.time||row.occurredAt||'').slice(11,19)||'—')}</bdi></small><strong dir="auto">${esc(row.actor)} · ${esc(row.action)}</strong><small dir="auto">${esc(row.target)}</small><small><bdi dir="ltr">${esc(String(row.recordHash||'').slice(0,16))}…</bdi></small><small>النتيجة: <span data-tone="${toneFor(row.outcome)}">${esc(row.outcome)}</span></small></article>`).join('')}</div>`:''}`;
  };
  const renderIntegrity=()=>{
    const i=adapter.integrity(),t=adapter.truth(),el=stage.querySelector('[data-integrity]'),scope=i.scope||{},watermark=scope.watermark||scope.toHash||scope.toSequence||'unobserved',lastError=runtimeAdapter?runtimeAdapter.snapshot().lastError:null;
    el.innerHTML=`<h3>فحص السلسلة</h3><div class="a-tokens"><span class="a-token" data-tone="${i.status==='VALID_CHAIN'?'ok':'bad'}">${esc(i.status||'UNVERIFIED')}</span><span class="a-token"><bdi dir="ltr">events ${t.eventCount||0}</bdi></span><span class="a-token"><bdi dir="ltr">${esc(t.persistence||'SESSION_LOCAL')}</bdi></span><span class="a-token"><bdi dir="ltr">annotations ${t.annotationCount??adapter.annotations().length}</bdi></span></div><p class="a-empty">أول تسلسل غير صالح: <bdi dir="ltr">${esc(i.firstInvalidSequence??'none')}</bdi> · علامة المائية <bdi dir="ltr">${esc(watermark)}</bdi></p>${lastError?`<p class="a-settle" data-state="FAILURE" style="margin:0"><strong data-tone="bad">خطأ المزوّد</strong><bdi dir="ltr">${esc(lastError.code||lastError.error||'ERROR')}</bdi></p>`:''}`;
  };
  const renderSettle=()=>{
    const host=stage.querySelector('[data-a-settle-host]');
    if(!settlement){host.innerHTML='<span class="a-empty">لم يُنفَّذ أي إجراء تعليق بعد. النتيجة — نجاحًا أو رفضًا — تُعرض هنا وتبقى بعد إعادة الرسم.</span>';return}
    const failed=settlement.state==='FAILURE';
    host.innerHTML=`<div class="a-settle" data-state="${esc(settlement.state)}"><strong data-tone="${failed?'bad':'ok'}">${failed?'فشل مُغلق':'تم'} · ${esc(settlement.state)}</strong><bdi dir="ltr">${esc(settlement.code)}</bdi>${settlement.error?`<span>${esc(settlement.error)}</span>`:''}${settlement.result?.reason?`<span>${esc(settlement.result.reason)}</span>`:''}</div>`;
  };
  const renderNotes=()=>{
    const rows=adapter.annotations(),el=stage.querySelector('[data-annotations]');
    el.innerHTML=rows.length?rows.map(row=>`<p style="margin:0"><bdi dir="ltr">event ${esc(row.eventId)} · rev ${esc(row.revision)}</bdi> — <span dir="auto">${esc(row.note)}</span></p>`).join(''):'<span class="a-empty">لا توجد تعديلات ملاحظة بعد؛ أبدًا لا تتغيّر أبدًا.</span>';
    const status=stage.querySelector('[data-annotation-status]');
    status.textContent=settlement?(settlement.state==='PENDING'?'قيد الانتظار…':settlement.state==='SUCCESS'?'سُجّلت التعديلات منفصلة':'تعذّر التعليق · '+settlement.code):'';
  };

  const render=()=>{
    adapter.refresh();
    const rows=allEvents(),sel=selected();
    fillSelect(stage.querySelector('[data-a-actor]'),[...new Set(rows.map(r=>r.actor))].sort(),filter.actor,'كل الفاعلين');
    fillSelect(stage.querySelector('[data-a-action]'),[...new Set(rows.map(r=>r.action))].sort(),filter.action,'كل الإجراءات');
    fillSelect(stage.querySelector('[data-a-outcome]'),[...new Set(rows.map(r=>r.outcome))].sort(),filter.outcome,'كل النتائج');
    stage.querySelector('[data-a-search]').value=filter.query;
    renderTable();renderIntegrity();renderSettle();renderNotes();hostRoot.render();

    const counts=rows.reduce((acc,row)=>(acc[row.action]=(acc[row.action]||0)+1,acc),{});
    const outcomeCounts=rows.reduce((acc,row)=>(acc[row.outcome]=(acc[row.outcome]||0)+1,acc),{});
    const left=document.createElement('section');left.className='a-nav';
    left.innerHTML=`<style>.a-nav{display:grid;gap:10px;min-width:0}.a-nav h3{margin:0;font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em}.a-nav ul{list-style:none;margin:0 0 6px;padding:0;display:grid;gap:5px}.a-nav button{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;width:100%;text-align:start;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;padding:8px 9px;cursor:pointer;font-size:12.5px}.a-nav button:hover,.a-nav button[aria-pressed="true"]{border-color:var(--line);background:rgba(255,255,255,.05)}.a-nav .a-count{font:600 11px var(--mono);color:var(--text3)}.a-nav .a-all{font-weight:650}</style>
      <h3>مُصفّيات الأحداث</h3>
      <ul><li><button type="button" class="a-all" data-a-cat="" aria-pressed="${filter.action===''}"><span>كل الأحداث</span><span class="a-count">${rows.length}</span></button></li>
      ${Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([action,count])=>`<li><button type="button" data-a-cat="${esc(action)}" aria-pressed="${filter.action===action}"><span><bdi dir="ltr">${esc(action)}</bdi></span><span class="a-count">${count}</span></button></li>`).join('')}</ul>
      <h3>النتائج</h3>
      <ul>${Object.entries(outcomeCounts).sort((a,b)=>b[1]-a[1]).map(([outcome,count])=>`<li><button type="button" data-a-out="${esc(outcome)}" aria-pressed="${filter.outcome===outcome}"><span data-tone="${toneFor(outcome)}">${esc(outcome)}</span><span class="a-count">${count}</span></button></li>`).join('')||'<li><span class="a-empty">لا نتائج مرصودة.</span></li>'}</ul>`;
    const leftHost=workspace.region('LEFT',{node:left,label:'مُصنّفات الأحداث'});
    leftHost?.querySelectorAll?.('[data-a-cat]').forEach(btn=>btn.addEventListener('click',()=>{filter={...filter,action:btn.dataset.aCat};registry.execute('audit.search',{filters:{action:filter.action,route:'audit.category-filter'}});render()}));
    leftHost?.querySelectorAll?.('[data-a-out]').forEach(btn=>btn.addEventListener('click',()=>{filter={...filter,outcome:btn.dataset.aOut};render()}));

    const integrity=adapter.integrity(),truth=adapter.truth(),notes=adapter.annotations();
    const right=document.createElement('aside');right.className='a-ctx';
    right.innerHTML=`<style>.a-ctx{display:grid;gap:10px;min-width:0}.a-ctx-block{border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:11px;min-width:0;display:grid;gap:6px}.a-ctx-block h3{margin:0;font-size:13px}.a-ctx-block dl{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 8px;font-size:11.5px}.a-ctx-block dt{color:var(--text3);white-space:nowrap}.a-ctx-block dd{margin:0;overflow-wrap:anywhere;text-align:end}.a-ctx-block ul{list-style:none;margin:0;padding:0;display:grid;gap:5px;font-size:11.5px;color:var(--text2)}.a-ctx-block li{overflow-wrap:anywhere}</style>
      ${sel?`<section class="a-ctx-block"><h3>الفاعل</h3><dl><dt>الاسم</dt><dd dir="auto">${esc(sel.actor)}</dd><dt>المعرّف (للتسمية)</dt><dd><bdi dir="ltr">${esc(sel.eventId)}</bdi></dd><dt>التسلسل</dt><dd><bdi dir="ltr">${esc(String(sel.sequence))}</bdi></dd></dl></section>
      <section class="a-ctx-block"><h3>سياق الجلسة والهدف</h3><dl><dt>الهدف</dt><dd dir="auto">${esc(sel.target)}</dd><dt>ارتباط</dt><dd><bdi dir="ltr">${esc(sel.correlationId||'—')}</bdi></dd><dt>الوقت</dt><dd><bdi dir="ltr">${esc(String(sel.occurredAt||sel.time||'—'))}</bdi></dd></dl></section>
      <section class="a-ctx-block"><h3>تفاصيل الإجراء</h3><dl><dt>النتيجة</dt><dd><span data-tone="${toneFor(sel.outcome)}">${esc(sel.outcome)}</span></dd><dt>السابق</dt><dd><bdi dir="ltr">${esc(String(sel.previousHash||'GENESIS').slice(0,20))}…</bdi></dd><dt>السجل</dt><dd><bdi dir="ltr">${esc(String(sel.recordHash||'').slice(0,20))}…</bdi></dd><dt>خوارزمية التجزئة</dt><dd><bdi dir="ltr">SHA-256</bdi></dd></dl></section>
      <section class="a-ctx-block"><h3>المرجعيات المرتبطة</h3><ul><li>ملاحظات التعليق: <bdi dir="ltr">${esc(String(sel.annotationRevisions||0))}</bdi></li><li>السلسلة: <bdi dir="ltr">${esc(String(chainOf(sel).length))}</bdi> حدث متتالٍ</li><li>النتيجة العامة: <bdi dir="ltr">${esc(integrity.status||'UNVERIFIED')}</bdi></li></ul></section>`:'<section class="a-ctx-block"><h3>لا يوجد حدث محدد</h3><p class="a-empty" style="margin:0">اختر حدثًا من الجدول.</p></section>'}
      <section class="a-ctx-block"><h3>أساس السياسة</h3><ul><li><bdi dir="ltr">AuditEvent ≠ SemanticCommandBus receipt</bdi></li><li><bdi dir="ltr">hashIsEncryption = false</bdi></li><li><bdi dir="ltr">databaseImmutabilityClaim = ${esc(String(truth.databaseImmutabilityClaim??false))}</bdi></li><li><bdi dir="ltr">annotationsSeparate = true</bdi> · ${notes.length} تعديل</li></ul></section>
      <section class="a-ctx-block"><h3>تنبيه التغطية</h3><ul><li>التغطية المُعلنة: <bdi dir="ltr">${esc(truth.coverage||'PARTIAL_OBSERVED')}</bdi> — عدم وجود حدث لا تُثبت تغطية كاملة.</li><li>المالك: <bdi dir="ltr">${esc(truth.owner||'W05AuditDomain')}</bdi></li></ul></section>`;
    workspace.region('RIGHT',{node:right,label:'تفاصيل الحدث'});

    const bottom=document.createElement('section');bottom.className='a-bottom';
    bottom.innerHTML=`<style>.a-bottom pre{max-height:230px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11.5px;background:#070d16;border:1px solid var(--line);border-radius:9px;padding:10px}.a-bottom .a-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}.a-bottom h3{margin:0 0 6px;font-size:13px}</style>
      <div class="a-grid"><div><h3>الحدث الخام</h3><pre dir="ltr">${esc(JSON.stringify(sel||{state:'NO_EVENT'},null,2))}</pre></div><div><h3>الالتزامات (${notes.length})</h3><pre dir="ltr">${esc(JSON.stringify(notes,null,2))}</pre></div><div><h3>نطاق التحقق</h3><pre dir="ltr">${esc(JSON.stringify({integrity,truth},null,2))}</pre></div></div>`;
    workspace.region('BOTTOM',{node:bottom,label:'مساحة العمل التفصيلية',summary:'الحدث الخام والالتزامات المنفصلة ونطاق التحقق؛ الإيصالات ليست أحداثًا.'});

    stage.querySelectorAll('[data-a-verify]').forEach(btn=>btn.addEventListener('click',()=>registry.execute('audit.verify',{route:'audit.verify-button'})));
    stage.querySelectorAll('[data-a-reset]').forEach(btn=>btn.addEventListener('click',()=>{filter={query:'',action:'',actor:'',outcome:''};render()}));
    const searchInput=stage.querySelector('[data-a-search]');
    searchInput.addEventListener('input',()=>{filter.query=searchInput.value;renderTable()});
    searchInput.addEventListener('change',()=>{registry.execute('audit.search',{filters:{query:filter.query},route:'audit.search-input'});render()});
    [['[data-a-actor]','actor'],['[data-a-action]','action'],['[data-a-outcome]','outcome']].forEach(([sel2,key])=>stage.querySelector(sel2)?.addEventListener('change',event=>{filter={...filter,[key]:event.target.value};registry.execute('audit.search',{filters:{[key]:filter[key]},route:`audit.filter-${key}`});render()}));
    workspace.status?.(`AuditEvent chain · ${truth.eventCount} events · ${integrity.status}`,'info');
    workspace.refreshToolbar?.();
    return truth;
  };

  registry.register('audit.search',adapter.owner,'Search AuditEvents',async payload=>{const r=await adapter.search(payload?.filters||payload?.query||{});render();return r},()=>true);
  registry.register('audit.verify',adapter.owner,'Verify AuditEvent hash chain',async()=>{const r=await adapter.verify();render();return r},()=>true);
  registry.register('audit.annotate',adapter.owner,'Annotate AuditEvent',async payload=>{const r=await adapter.annotate(payload||{});render();return r},payload=>payload?.eventId&&String(payload?.note||'').trim()?true:'AuditEvent sequence and annotation text required');
  stage.querySelector('[data-annotation-form]').addEventListener('submit',async event=>{
    event.preventDefault();
    const eventId=stage.querySelector('[data-event-id]').value,noteField=stage.querySelector('[data-note]'),note=noteField.value,buttonEl=event.currentTarget.querySelector('button[type=submit]');
    buttonEl.disabled=true;
    const result=await settleAuditAnnotation(()=>registry.execute('audit.annotate',{eventId,note,route:'audit.annotation-form'}),state=>{settlement=state;render()});
    settlement=result;buttonEl.disabled=false;if(result.state==='SUCCESS')noteField.value='';render();
  });
  stage.dataset.surfaceComposition='audit-trace-workbench';
  render();
  if(runtimeAdapter)Promise.allSettled([runtimeAdapter.search({limit:100}),runtimeAdapter.verify()]).then(()=>render());
  workspace.toolbar([...AUDIT_COMMANDS,'foundation.settings']);
  return Object.freeze({owner:'AuditTraceWorkbench',adapter,host:hostRoot,render,realProductConsumer:true,slots:{CENTER:'AuditTraceWorkbench',BOTTOM:'shared-bottom-shell/domain-projection'}});
}
