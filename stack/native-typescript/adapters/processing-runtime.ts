import {createBoundedLocalRuntimeTransport} from './runtime/local-runtime-transport.js';
import {CollectionTableMatrixPresentationCore} from '../foundation/collection/table-matrix.js';
import {defineContextDescriptorProvider} from '../foundation/global/context-descriptor-contract.js';

export const PROCESSING_COMMANDS=Object.freeze(['processing.inspect','processing.retry','processing.requestCancel','processing.validationHandoff']);
const clone=value=>structuredClone(value);
const terminalStates=new Set(['COMPLETED','FAILED','TIMED_OUT','CANCELLED']);
const safeProviderProof=job=>{
  const attempts=Array.isArray(job?.attempts)?job.attempts:[];
  const successful=attempts.find(attempt=>attempt.state==='SUCCEEDED'&&attempt?.providerEvidence?.evidence?.actualProviderExecution===true&&attempt?.providerEvidence?.providerRunId);
  return successful?{proven:true,providerRunId:successful.providerEvidence.providerRunId,attemptId:successful.attemptId}:{proven:false,providerRunId:null,attemptId:null};
};
const safeCancelTruth=job=>({requested:job?.state==='CANCEL_REQUESTED'||Boolean(job?.cancellation),acknowledged:job?.cancellation?.state==='ACKNOWLEDGED'&&job?.cancellation?.providerEvidence?.actualProviderAck===true,cancelled:job?.state==='CANCELLED'&&job?.cancellation?.state==='ACKNOWLEDGED'&&job?.cancellation?.providerEvidence?.actualProviderAck===true});
const safeValidationTruth=job=>({state:job?.validationHandoff?.state||'NONE',acknowledged:job?.validationHandoff?.state==='ACKNOWLEDGED'&&job?.validationHandoff?.consumerReceipt?.actualConsumerAck===true,receiptId:job?.validationHandoff?.consumerReceipt?.receiptId||null});

export class ProcessingRuntimeAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport()}={}){
    this.owner='W05ProcessingDomainAdapter';
    this.transport=transport;
    this.state={jobs:[],selectedJobId:null,lastReceipt:null,lastError:null,refreshPhase:'IDLE',providerState:'UNAVAILABLE',actionLog:[]};
    this.tableAdapter={
      adapterId:'processing.jobs',rows:()=>this.rows(),rowId:row=>row.jobId,rowLabel:row=>row.jobId,
      searchableText:row=>`${row.jobId} ${row.requestId} ${row.state} ${(row.attempts||[]).map(a=>a.attemptId).join(' ')}`,
      columns:[
        {id:'job',label:'Job',cell:row=>({text:row.jobId,secondary:row.requestId,direction:'ltr'})},
        {id:'state',label:'Lifecycle',cell:row=>({text:row.state,tone:row.state==='COMPLETED'?'success':row.state==='FAILED'||row.state==='TIMED_OUT'?'danger':row.state==='CANCEL_REQUESTED'?'warning':'default'})},
        {id:'attempts',label:'Attempts',cell:row=>({text:String(row.attempts?.length||0),secondary:row.currentAttemptId||'NONE',direction:'ltr'})},
        {id:'handoff',label:'Validation handoff',cell:row=>({text:row.validationHandoff?.state||'NONE',tone:row.validationHandoff?.state==='ACKNOWLEDGED'?'success':row.validationHandoff?.state==='PENDING'?'warning':'default'})}
      ],
      actions:row=>[{id:'processing.inspect',label:'Inspect',enabled:true},{id:'processing.retry',label:'Retry',enabled:['FAILED','TIMED_OUT'].includes(row.state)},{id:'processing.requestCancel',label:'Request cancel',enabled:!terminalStates.has(row.state)},{id:'processing.validationHandoff',label:'Validation handoff',enabled:row.state==='COMPLETED'}]
    };
    this.collection=new CollectionTableMatrixPresentationCore(this.tableAdapter);
    this.contextProvider=defineContextDescriptorProvider({
      id:'processing.context',family:'processing',owner:this.owner,
      describe:()=>{const row=this.selected(),provider=safeProviderProof(row),cancel=safeCancelTruth(row),validation=safeValidationTruth(row);return {id:`processing:${row?.jobId||'empty'}`,providerId:'processing.context',family:'processing',subject:row?.jobId||'No Job selected',eyebrow:'Processing lifecycle',summary:row?`${row.state} · ${row.attempts?.length||0} attempt(s)`:'Refresh Jobs to inspect exact lifecycle truth.',domainOwner:this.owner,revisionToken:row?String(row.lifecycleVersion||row.updatedAt||'current'):null,lenses:[{id:'identity',label:'Job truth',tabs:[{id:'current',label:'Current',fields:row?[{id:'request',label:'Request ID',value:row.requestId,technical:true},{id:'job',label:'Job ID',value:row.jobId,technical:true},{id:'input',label:'Input digest',value:row.inputDigest||'UNKNOWN',technical:true},{id:'state',label:'Job state',value:row.state},{id:'attempts',label:'Attempts',value:row.attempts?.length||0},{id:'provider',label:'Provider execution',value:provider.proven?'PROVEN':'NOT_PROVEN'},{id:'cancel',label:'Cancellation ACK',value:cancel.acknowledged?'ACKNOWLEDGED':'NOT_ACKNOWLEDGED'},{id:'validation',label:'Validation handoff',value:validation.state}]:[]}]}]};}
    });
  }
  descriptor(){return {owner:this.owner,semanticOwner:'W05ProcessingDomain',capabilityOwner:'ProcessingCapability',collectionOwner:'CollectionTableMatrixPresentationCore',contextOwner:'ContextInspectorHost',transport:this.transport.descriptor(),genericProcessExecution:false,canonicalCommands:[...PROCESSING_COMMANDS]};}
  snapshot(){return clone(this.state);}
  rows(){return this.state.jobs.map(clone);}
  selected(){return this.state.jobs.find(job=>job.jobId===this.state.selectedJobId)||this.state.jobs.at(-1)||null;}
  select(jobId){if(jobId!=null&&!this.state.jobs.some(job=>job.jobId===jobId))throw Error('PROCESSING_JOB_UNKNOWN');this.state.selectedJobId=jobId;return this.selected();}
  #record(r){
    this.state.lastReceipt=clone(r);this.state.lastError=r.ok?null:clone(r);
    if(r.job){const i=this.state.jobs.findIndex(job=>job.jobId===r.job.jobId);if(i>=0)this.state.jobs[i]=clone(r.job);else this.state.jobs.push(clone(r.job));this.state.selectedJobId=r.job.jobId;}
    return r;
  }
  /* A visible receipt log so every enacted command changes the projected product state
     (governance §22: a state transition must be legible, not only true at the API boundary). */
  #note(code,detail={}){
    const entry=Object.freeze({seq:this.state.actionLog.length+1,at:new Date().toISOString(),code:String(code),jobId:detail.jobId??this.state.selectedJobId??null,...clone(detail)});
    this.state.actionLog.push(entry);if(this.state.actionLog.length>40)this.state.actionLog.shift();return entry;
  }
  async refresh(){this.state.refreshPhase='FETCHING';const r=await this.transport.request('GET','/v1/processing/jobs');this.state.refreshPhase='IDLE';if(r.ok){this.state.jobs=(r.jobs||[]).map(clone);if(!this.state.selectedJobId||!this.state.jobs.some(job=>job.jobId===this.state.selectedJobId))this.state.selectedJobId=this.state.jobs.at(-1)?.jobId||null;this.state.lastError=null;this.state.providerState='AVAILABLE';}else{this.state.lastError=clone(r);this.state.providerState=/ERROR|FAILED/.test(String(r.code||r.reason||''))?'ERROR':'UNAVAILABLE';}return r;}
  inspect({jobId}={}){const id=jobId??this.state.selectedJobId??this.state.jobs.at(-1)?.jobId;if(!id)return {ok:false,code:'PROCESSING_JOB_REQUIRED'};const job=this.state.jobs.find(item=>item.jobId===id);if(!job)return {ok:false,code:'PROCESSING_JOB_UNKNOWN'};this.state.selectedJobId=id;this.collection.selectOnly(id);this.#note('INSPECTED',{jobId:id,state:job.state,attempts:job.attempts?.length||0});return {ok:true,job:clone(job),providerTruth:safeProviderProof(job),cancellationTruth:safeCancelTruth(job),validationTruth:safeValidationTruth(job)};}
  async retry(){if(this.state.providerState!=='AVAILABLE'){this.#note('RETRY_BLOCKED',{detail:'PROCESSING_PROVIDER_UNAVAILABLE'});return {ok:false,code:'PROCESSING_PROVIDER_UNAVAILABLE',mutated:false}}const job=this.selected();if(!job){this.#note('RETRY_BLOCKED',{detail:'JOB_REQUIRED'});return {ok:false,code:'JOB_REQUIRED'}}if(!['FAILED','TIMED_OUT'].includes(job.state)){this.#note('RETRY_BLOCKED',{detail:'RETRY_NOT_ALLOWED',jobId:job.jobId,jobState:job.state,reason:'Retry requires FAILED or TIMED_OUT Job'});return {ok:false,code:'RETRY_NOT_ALLOWED',reason:'Retry requires FAILED or TIMED_OUT Job'}}const retryBase=job.currentAttemptId||job.attempts?.at(-1)?.attemptId||'unknown-attempt';const idempotencyKey=`retry:${job.jobId}:${retryBase}`;const result=await this.#record(await this.transport.request('POST',`/v1/processing/jobs/${encodeURIComponent(job.jobId)}/retry`,{idempotencyKey}));this.#note(result.ok?'RETRY_ACCEPTED':'RETRY_REJECTED',{detail:result.code||null,jobId:job.jobId,newAttemptId:result.job?.currentAttemptId||null});return result;}
  async requestCancel(){if(this.state.providerState!=='AVAILABLE'){this.#note('CANCEL_BLOCKED',{detail:'PROCESSING_PROVIDER_UNAVAILABLE'});return {ok:false,code:'PROCESSING_PROVIDER_UNAVAILABLE',mutated:false}}const job=this.selected();if(!job){this.#note('CANCEL_BLOCKED',{detail:'JOB_REQUIRED'});return {ok:false,code:'JOB_REQUIRED'}}const result=await this.#record(await this.transport.request('POST',`/v1/processing/jobs/${encodeURIComponent(job.jobId)}/cancel-request`,{requestId:`cancel-${Date.now()}`}));this.#note(result.ok?'CANCEL_REQUESTED':'CANCEL_REJECTED',{detail:result.code||null,jobId:job.jobId,jobState:result.job?.state||null,cancellationState:result.cancellation?.state||null});return result;}
  async validationHandoff(){if(this.state.providerState!=='AVAILABLE'){this.#note('HANDOFF_BLOCKED',{detail:'PROCESSING_PROVIDER_UNAVAILABLE'});return {ok:false,code:'PROCESSING_PROVIDER_UNAVAILABLE',mutated:false}}const job=this.selected();if(!job){this.#note('HANDOFF_BLOCKED',{detail:'JOB_REQUIRED'});return {ok:false,code:'JOB_REQUIRED'}}const result=await this.#record(await this.transport.request('POST',`/v1/processing/jobs/${encodeURIComponent(job.jobId)}/validation-handoff`,{consumerId:'processing-safety-validator'}));this.#note(result.ok?'HANDOFF_REQUESTED':'HANDOFF_REJECTED',{detail:result.code||null,jobId:job.jobId,jobState:result.job?.state||null,handoffState:result.handoff?.state||result.job?.validationHandoff?.state||null,consumerId:'processing-safety-validator'});return result;}
  availability(id,payload={}){
    const job=payload.jobId?this.state.jobs.find(item=>item.jobId===payload.jobId):this.selected();
    if(id==='processing.inspect')return Boolean(job)||'Select a Job';
    if(this.state.providerState!=='AVAILABLE')return {enabled:false,code:'PROCESSING_PROVIDER_UNAVAILABLE',reason:'Processing provider is unavailable; retained historical jobs are inspection-only.',availabilityOwner:this.owner};
    if(id==='processing.retry')return ['FAILED','TIMED_OUT'].includes(job?.state)||'Retry requires FAILED or TIMED_OUT Job';
    if(id==='processing.requestCancel')return Boolean(job)&&!terminalStates.has(job.state)||'Select a non-terminal Job';
    if(id==='processing.validationHandoff')return job?.state==='COMPLETED'||'A COMPLETED Job is required';
    return 'Unknown Processing command';
  }
  mount({stage,registry,workspace,button,esc}){
    /* Contract-derived surface (no visual reference: INTENTIONALLY_NOT_GENERATED).
       The four mandated lifecycle states — running/observing, retry, cancel-requested and
       validation-handoff — each get an explicit, labelled display location. Arabic-first copy
       (CEP-VIS-001-FINAL §2.2); identifiers and timestamps stay in isolated LTR spans (§12). */
    const E=value=>typeof esc==='function'?esc(value):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const B=value=>`<bdi dir="ltr">${E(value)}</bdi>`;
    const JOB_STATES=['PENDING','RUNNING','RETRY_WAIT','TIMED_OUT','CANCEL_REQUESTED','CANCELLED','COMPLETED','FAILED'];
    const JOB_AR={PENDING:'في الانتظار',RUNNING:'قيد التشغيل',RETRY_WAIT:'انتظار إعادة المحاولة',TIMED_OUT:'انتهت المهلة',CANCEL_REQUESTED:'طلب إلغاء مفتوح',CANCELLED:'ملغى',COMPLETED:'مكتمل',FAILED:'فاشل'};
    const TONE=s=>s==='COMPLETED'?'ok':(s==='FAILED'||s==='TIMED_OUT'||s==='CANCELLED')?'bad':(s==='CANCEL_REQUESTED'||s==='RETRY_WAIT')?'warn':(s==='RUNNING')?'info':'muted';
    const HANDOFF_STATES=['NONE','PENDING','ACKNOWLEDGED','FAILED'];
    const stamp=iso=>String(iso||'').replace('T',' ').slice(0,23);
    const render=()=>{
      const snap=this.snapshot(),jobs=this.collection.snapshot().visibleRows,job=this.selected();
      const provider=safeProviderProof(job),cancel=safeCancelTruth(job),validation=safeValidationTruth(job),attempts=job?.attempts||[];
      const retryAllowed=['FAILED','TIMED_OUT'].includes(job?.state),retryReason=retryAllowed?'متاح · يتطلب <bdi dir="ltr">FAILED</bdi> أو <bdi dir="ltr">TIMED_OUT</bdi>':'غير متاح · يتطلب <bdi dir="ltr">FAILED</bdi> أو <bdi dir="ltr">TIMED_OUT</bdi>، والحالة الحالية '+B(job?.state||'—');
      const handoffAllowed=job?.state==='COMPLETED';
      const counts=jobs.reduce((acc,row)=>(acc[row.state]=(acc[row.state]||0)+1,acc),{});
      const log=[...(snap.actionLog||[])].reverse();

      /* ---- CENTER: pipeline lifecycle workbench ---- */
      stage.innerHTML=`<style>
      [data-w05-surface="processing"]{display:grid;gap:14px;min-width:0}
      .p-head{display:grid;gap:4px};margin-block-start:26px.p-head h1{margin:0;font-size:clamp(20px,2vw,27px);display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.p-head h1 small{font-size:13px;font-weight:600;color:var(--text3)}
      .p-lead{margin:0;color:var(--text2);max-width:78ch;line-height:1.6}
      .p-sec{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);padding:12px;min-width:0}
      .p-sec>h2{margin:0 0 3px;font-size:15px}.p-sub{display:block;font:600 10px var(--mono);text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px}
      .p-idbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}.p-idbar h3{margin:0;font-size:16px}
      .p-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 11px;font:700 11px var(--mono);border:1px solid currentColor}
      .p-tokens{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin-bottom:12px}
      .p-token{border:1px solid var(--line);border-radius:10px;background:#0d1622;padding:9px 10px;display:grid;gap:3px;min-width:0}
      .p-token b{font-size:11.5px;color:var(--text3);font-weight:600}
      .p-token span{font:700 12px var(--mono);overflow-wrap:anywhere}
      .p-token small{font-size:10.5px;color:var(--text3);line-height:1.45}
      .p-flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
      .p-step{border:1px solid var(--line);border-radius:8px;padding:5px 9px;font:600 10.5px var(--mono);color:var(--text3);background:#0b131e;white-space:nowrap}
      .p-step[data-current="true"]{border-color:currentColor;font-weight:800}
      .p-step[data-done="true"]{color:#37d67a;border-color:color-mix(in srgb,#37d67a 45%,transparent)}
      .p-arrow{color:var(--text3);font-size:11px}
      .p-table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px;max-width:100%}
      table.p-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:560px}
      .p-table th,.p-table td{padding:8px 7px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top;overflow-wrap:anywhere;font-size:11.5px}
      .p-table th{font-size:10.5px;color:var(--text3);background:color-mix(in srgb,var(--panel) 96%,transparent)}
      .p-table th strong{display:block;color:var(--text2);font-size:12px}
      .p-table th em{font-style:normal;font:600 9.5px var(--mono);opacity:.75}
      .p-table td small{display:block;color:var(--text3);font-size:10.5px;margin-top:2px}
      .p-log{list-style:none;margin:0;padding:0;display:grid;gap:6px;max-height:230px;overflow:auto}
      .p-log li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;border:1px solid var(--line);border-radius:9px;padding:7px 9px;background:#0d1622;font-size:11.5px}
      .p-log .p-log-code{font:700 10.5px var(--mono);align-self:start}
      .p-log .p-log-body{min-width:0;overflow-wrap:anywhere}
      .p-log time{display:block;color:var(--text3);font:600 10px var(--mono)}
      [data-tone="ok"]{color:#37d67a}[data-tone="warn"]{color:#f0b429}[data-tone="bad"]{color:#ff6b6b}[data-tone="muted"]{color:#9fb0c6}[data-tone="info"]{color:#4aa3ff}
      .p-empty{color:var(--text3);font-size:12px}
      </style>
      <div data-w05-surface="processing">
        <header class="p-head"><div class="m0-eyebrow"><bdi dir="ltr">W05 · PIPELINE LIFECYCLE</bdi></div><h1>معالجة المهام <small>Processing</small></h1><p class="p-lead">دورة حياة المهمة والمحاولة والإلغاء والتسليم إلى التحقق تُعرض كحقائق منفصلة: طلب الإلغاء ليس إلغاءً ناجحًا، وطلب التسليم ليس إقرارًا من مستهلك فعلي.</p></header>
        <section class="p-sec"><h2>دورة حياة المهمة المحددة</h2><span class="p-sub">Selected job lifecycle</span>
        ${job?`
          <div class="p-idbar"><h3>${B(job.jobId)}</h3><span class="p-pill" data-tone="${TONE(job.state)}" data-processing-state="${E(job.state)}">${E(JOB_AR[job.state]||job.state)} · ${B(job.state)}</span></div>
          <div class="p-tokens">
            <div class="p-token"><b>تنفيذ المزوّد</b><span data-tone="${provider.proven?'ok':'warn'}" data-provider-proof="${provider.proven}">${provider.proven?'PROVEN':'NOT PROVEN'}</span><small>${provider.proven?`تنفيذ فعلي مثبت · ${B(provider.providerRunId||'')}`:'لا يُستنتج تنفيذ مزوّد فعلي من الحالة وحدها.'}</small></div>
            <div class="p-token"><b>إقرار الإلغاء</b><span data-tone="${cancel.acknowledged?'ok':'warn'}" data-cancel-ack="${cancel.acknowledged}">${cancel.acknowledged?'ACKNOWLEDGED':'NOT ACKNOWLEDGED'}</span><small>${cancel.cancelled?'اكتمل الإلغاء بعد إقرار المزوّد.':cancel.requested?'الطلب مفتوح؛ الإلغاء غير مكتمل حتى إقرار المزوّد الفعلي.':'لم يُطلب إلغاء.'}</small></div>
            <div class="p-token"><b>تسليم التحقق</b><span data-tone="${validation.acknowledged?'ok':validation.state==='PENDING'?'warn':'muted'}" data-validation-ack="${validation.acknowledged}">${B(validation.state)}</span><small>${validation.acknowledged?`إقرار مستهلك فعلي · ${B(validation.receiptId||'')}`:validation.state==='PENDING'?'بانتظار إقرار مستهلك فعلي؛ التسليم ليس تحققًا تقنيًا.':'لا تسليم مطلوب لهذه المهمة بعد.'}</small></div>
            <div class="p-token"><b>أهلية إعادة المحاولة</b><span data-tone="${retryAllowed?'ok':'muted'}">${retryAllowed?'ELIGIBLE':'NOT ELIGIBLE'}</span><small>${retryReason}</small></div>
          </div>
          <h3 style="margin:0 0 6px;font-size:12px">مسار دورة الحياة <span class="p-sub" style="display:inline;margin-inline-start:6px">Declared lifecycle</span></h3>
          <div class="p-flow">${JOB_STATES.map(s=>`${s===job.state?'':'<span class="p-arrow" aria-hidden="true">←</span>'}<span class="p-step" data-tone="${TONE(s)}" data-current="${s===job.state}">${E(JOB_AR[s])}<br><bdi dir="ltr">${E(s)}</bdi></span>`).join('')}</div>
          <p class="p-empty" style="margin:8px 0 0">الحالة الحالية معلّمة أعلاه؛ بقية الحالات تبقى معلّمة كمسار معلن وليست حالة محققة.</p>
          <h3 style="margin:14px 0 6px;font-size:12px">سجل المحاولات <span class="p-sub" style="display:inline;margin-inline-start:6px">Attempt history</span></h3>
          <div class="p-table-wrap"><table class="p-table"><thead><tr><th scope="col" style="width:8%"><strong>#</strong><em>NO</em></th><th scope="col" style="width:34%"><strong>المحاولة</strong><em>ATTEMPT / STATE</em></th><th scope="col" style="width:26%"><strong>العامل والإيجار</strong><em>WORKER / LEASE</em></th><th scope="col" style="width:32%"><strong>تنفيذ المزوّد</strong><em>PROVIDER EVIDENCE</em></th></tr></thead><tbody>${attempts.length?attempts.map(a=>`<tr><td>${E(String(a.number))}</td><td>${B(a.attemptId)}<small>${B(a.state)}</small></td><td>${B(a.workerId||'NONE')}<small>lease ${B(a.leaseId||'NONE')}</small></td><td>${a?.providerEvidence?.evidence?.actualProviderExecution===true?'<span data-tone="ok">PROVEN · تنفيذ فعلي</span>':'<span data-tone="warn">NOT_PROVEN</span>'}<small>${B(a.providerEvidence?.providerRunId||'—')}</small></td></tr>`).join(''):`<tr><td colspan="4"><span class="p-empty">لا توجد محاولات مسجلة لهذه المهمة بعد.</span></td></tr>`}</tbody></table></div>
        `:`<p class="state-token" data-state="empty"><strong>لا توجد مهمة محددة</strong> · Refresh the processing provider to observe an exact Job. This is an explicit empty state, not a provider-success claim.</p>`}
        </section>
        <section class="p-sec"><h2>سجل الإجراءات والإيصالات</h2><span class="p-sub">Action receipts</span>
          <p class="p-empty" style="margin:0 0 8px">كل إجراء يُنفَّذ على هذه الوظيفة يسجَّل هنا برمزه ونتيجته؛ الفشل يُسجَّل برمزه الصريح ولا يُحوَّل إلى نجاح.</p>
          ${log.length?`<ol class="p-log">${log.map(row=>`<li><span class="p-log-code" data-tone="${/BLOCKED|REJECTED/.test(row.code)?'bad':'ok'}">${E(row.code)}</span><span class="p-log-body">${row.jobId?`${B(row.jobId)} · `:''}${row.jobState?`state=${B(row.jobState)} · `:''}${row.handoffState?`handoff=${B(row.handoffState)} · `:''}${row.cancellationState?`cancellation=${B(row.cancellationState)} · `:''}${row.newAttemptId?`attempt=${B(row.newAttemptId)} · `:''}${row.detail?`${B(row.detail)} · `:''}${row.reason?`${E(row.reason)} · `:''}<time>${B(stamp(row.at))}</time></span></li>`).join('')}</ol>`:`<p class="state-token" data-state="empty"><strong>لا إجراءات بعد</strong> · No command has been executed in this session.</p>`}
        </section>
      </div>`;

      /* ---- LEFT: job structure / queue navigation ---- */
      const left=document.createElement('section');left.className='p-nav';
      left.innerHTML=`<style>.p-nav{display:grid;gap:10px;min-width:0}.p-nav-sum{display:flex;flex-wrap:wrap;gap:6px}.p-nav-chip{border:1px solid var(--line);border-radius:999px;padding:4px 8px;font:600 10.5px var(--mono);white-space:nowrap}.p-nav-list{list-style:none;margin:0;padding:0;display:grid;gap:6px}.p-nav-item{display:grid;grid-template-columns:auto minmax(0,1fr);gap:9px;align-items:center;width:100%;text-align:start;border:1px solid var(--line);border-radius:9px;background:transparent;color:inherit;padding:9px;cursor:pointer}.p-nav-item[aria-pressed="true"]{border-color:var(--accent);background:rgba(255,255,255,.05)}.p-nav-dot{width:11px;height:11px;border-radius:50%;background:currentColor;flex:none}.p-nav-item strong{display:block;overflow-wrap:anywhere;font-size:12.5px}.p-nav-item small{display:block;color:var(--text3);font-size:11px;overflow-wrap:anywhere}</style>
      <div class="p-nav-sum" dir="ltr">${Object.entries(counts).map(([k,v])=>`<span class="p-nav-chip" data-tone="${TONE(k)}">${E(k)} · ${v}</span>`).join('')||'<span class="p-nav-chip" data-tone="muted">EMPTY · 0</span>'}</div>
      <ul class="p-nav-list">${jobs.length?jobs.map(row=>`<li><button type="button" class="p-nav-item" data-processing-job="${E(row.jobId)}" aria-pressed="${row.jobId===job?.jobId}"><span class="p-nav-dot" data-tone="${TONE(row.state)}" aria-hidden="true"></span><span><strong>${B(row.jobId)}</strong><small>${E(JOB_AR[row.state]||row.state)} · ${B(row.state)}</small><small>${(row.attempts?.length||0)} محاولة · تسليم ${B(row.validationHandoff?.state||'NONE')}</small></span></button></li>`).join(''):`<li><p class="state-token" data-state="empty"><strong>لا توجد مهام</strong> · No Job observed; this is not a worker-success claim.</p></li>`}</ul>`;
      const leftHost=workspace.region('LEFT',{node:left,label:'مهام المعالجة'});

      /* ---- RIGHT: unique context for the active object ---- */
      const right=document.createElement('aside');right.className='p-ctx';
      right.innerHTML=`<style>.p-ctx{display:grid;gap:10px;min-width:0}.p-ctx-block{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;border:1px solid var(--line);border-radius:11px;background:#0d1622;padding:11px;min-width:0}.p-ctx-block h3{margin:0 0 6px;font-size:13px}.p-ctx-block dl{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 8px;font-size:11.5px}.p-ctx-block dt{color:var(--text3);white-space:nowrap}.p-ctx-block dd{margin:0;overflow-wrap:anywhere;text-align:end}.p-ctx-block ul{list-style:none;margin:0;padding:0;display:grid;gap:5px;font-size:11.5px;color:var(--text2)}.p-ctx-block li{overflow-wrap:anywhere}.p-ctx-block .p-ico{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;border:1px solid var(--line);font-size:14px}</style>
      <section class="p-ctx-block"><div><h3>هوية الطلب والمهمة</h3>${job?`<dl><dt>معرّف الطلب</dt><dd>${B(job.requestId)}</dd><dt>معرّف المهمة</dt><dd>${B(job.jobId)}</dd><dt>بصمة المدخل</dt><dd>${B(job.inputDigest||'UNKNOWN')}</dd><dt>إصدار الدورة</dt><dd>${B(String(job.lifecycleVersion??job.updatedAt??'—'))}</dd></dl>`:'<ul><li>لا توجد مهمة محددة.</li></ul>'}</div><span class="p-ico" aria-hidden="true">⌗</span></section>
      <section class="p-ctx-block"><div><h3>حقيقة تنفيذ المزوّد</h3><ul><li>البرهان: <bdi dir="ltr">${provider.proven?'PROVEN':'NOT_PROVEN'}</bdi></li><li>معرّف تشغيل المزوّد: <bdi dir="ltr">${E(provider.providerRunId||'none')}</bdi></li><li>محاولة البرهان: <bdi dir="ltr">${E(provider.attemptId||'none')}</bdi></li><li>النجاح المكتمل يتطلب دليل مزوّد فعلي.</li></ul></div><span class="p-ico" aria-hidden="true">⚙</span></section>
      <section class="p-ctx-block"><div><h3>حقيقة الإلغاء</h3><ul><li>طُلب: <bdi dir="ltr">${cancel.requested?'true':'false'}</bdi></li><li>أُقرّ: <bdi dir="ltr">${cancel.acknowledged?'true':'false'}</bdi></li><li>اكتمل الإلغاء: <bdi dir="ltr">${cancel.cancelled?'true':'false'}</bdi></li><li><bdi dir="ltr">CANCEL_REQUESTED ≠ CANCELLED</bdi></li></ul></div><span class="p-ico" aria-hidden="true">⊘</span></section>
      <section class="p-ctx-block"><div><h3>حقيقة تسليم التحقق</h3><ul><li>الحالة: <bdi dir="ltr">${E(validation.state)}</bdi></li><li>إقرار مستهلك فعلي: <bdi dir="ltr">${validation.acknowledged?'true':'false'}</bdi></li><li>إيصال: <bdi dir="ltr">${E(validation.receiptId||'none')}</bdi></li><li>التسليم لا يعني تحققًا تقنيًا.</li></ul></div><span class="p-ico" aria-hidden="true">⇄</span></section>
      <section class="p-ctx-block"><div><h3>أهلية الأوامر</h3><ul>${['processing.inspect','processing.retry','processing.requestCancel','processing.validationHandoff'].map(id=>{let a='';try{a=String(this.availability(id,{}))}catch(e){a='ERROR'}const ok=a==='true';return `<li>${B(id)} · <bdi dir="ltr" data-tone="${ok?'ok':'warn'}">${ok?'AVAILABLE':E(a)}</bdi></li>`}).join('')}</ul></div><span class="p-ico" aria-hidden="true">✓</span></section>`;
      workspace.region('RIGHT',{node:right,label:'سياق المهمة'});

      /* ---- BOTTOM: deep lifecycle receipts ---- */
      const bottom=document.createElement('section');bottom.className='p-bottom';
      bottom.innerHTML=`<style>.p-bottom pre{max-height:230px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11.5px;background:#070d16;border:1px solid var(--line);border-radius:9px;padding:10px}.p-bottom h3{margin:0 0 6px;font-size:13px}.p-bottom .p-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}</style>
      <div class="p-grid"><div><h3>إيصال الإلغاء والتسليم</h3><pre dir="ltr">${E(JSON.stringify({cancellation:job?.cancellation||null,validationHandoff:job?.validationHandoff||null},null,2))}</pre></div><div><h3>آخر إيصال نقل</h3><pre dir="ltr" data-w05-receipt>${E(JSON.stringify(snap.lastReceipt||snap.lastError||{status:'NO_MUTATION_RECEIPT'},null,2))}</pre></div></div>`;
      workspace.region('BOTTOM',{node:bottom,label:'دورة حياة المعالجة',summary:'إيصالات الإلغاء والتسليم والنقل الخام؛ الحقيقة الفعلية للمزوّد والمستهلك منفصلة عن الإيصالات.'});

      (leftHost||stage).querySelectorAll?.('[data-processing-job]').forEach(element=>element.addEventListener('click',()=>{this.inspect({jobId:element.dataset.processingJob});render();}));
      stage.querySelectorAll('tr[data-processing-row]').forEach(element=>element.addEventListener('click',()=>{this.inspect({jobId:element.dataset.processingRow});render();}));
      workspace.refreshToolbar?.();
      return snap;
    };
    const run=fn=>async payload=>{const r=await fn(payload||{});workspace.status(r.ok?'Processing lifecycle receipt recorded':`Processing action failed · ${r.code||r.reason}`,r.ok?'info':'error');render();return r;};
    registry.register('processing.inspect',this.owner,'Inspect Job lifecycle',run(payload=>Promise.resolve(this.inspect(payload))),payload=>this.availability('processing.inspect',payload));
    registry.register('processing.retry',this.owner,'Retry as new Attempt',run(()=>this.retry()),payload=>this.availability('processing.retry',payload));
    registry.register('processing.requestCancel',this.owner,'Request cancellation',run(()=>this.requestCancel()),payload=>this.availability('processing.requestCancel',payload));
    registry.register('processing.validationHandoff',this.owner,'Request validation handoff',run(()=>this.validationHandoff()),payload=>this.availability('processing.validationHandoff',payload));
    render();
    queueMicrotask(async()=>{await this.refresh();render();});
    return {owner:this.owner,collectionOwner:'CollectionTableMatrixPresentationCore',contextOwner:'ContextInspectorHost',render};
  }
}
export function createProcessingRuntimeAdapter(options={}){return new ProcessingRuntimeAdapter(options)}
