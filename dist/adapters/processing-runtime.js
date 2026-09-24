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
    this.state={jobs:[],selectedJobId:null,lastReceipt:null,lastError:null,refreshPhase:'IDLE'};
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
  async refresh(){this.state.refreshPhase='FETCHING';const r=await this.transport.request('GET','/v1/processing/jobs');this.state.refreshPhase='IDLE';if(r.ok){this.state.jobs=(r.jobs||[]).map(clone);if(!this.state.selectedJobId||!this.state.jobs.some(job=>job.jobId===this.state.selectedJobId))this.state.selectedJobId=this.state.jobs.at(-1)?.jobId||null;this.state.lastError=null;}else this.state.lastError=clone(r);return r;}
  inspect({jobId}={}){const id=jobId??this.state.selectedJobId??this.state.jobs.at(-1)?.jobId;if(!id)return {ok:false,code:'PROCESSING_JOB_REQUIRED'};const job=this.state.jobs.find(item=>item.jobId===id);if(!job)return {ok:false,code:'PROCESSING_JOB_UNKNOWN'};this.state.selectedJobId=id;this.collection.selectOnly(id);return {ok:true,job:clone(job),providerTruth:safeProviderProof(job),cancellationTruth:safeCancelTruth(job),validationTruth:safeValidationTruth(job)};}
  async retry(){const job=this.selected();if(!job)return {ok:false,code:'JOB_REQUIRED'};const retryBase=job.currentAttemptId||job.attempts?.at(-1)?.attemptId||'unknown-attempt';const idempotencyKey=`retry:${job.jobId}:${retryBase}`;return this.#record(await this.transport.request('POST',`/v1/processing/jobs/${encodeURIComponent(job.jobId)}/retry`,{idempotencyKey}));}
  async requestCancel(){const job=this.selected();return job?this.#record(await this.transport.request('POST',`/v1/processing/jobs/${encodeURIComponent(job.jobId)}/cancel-request`,{requestId:`cancel-${Date.now()}`})):{ok:false,code:'JOB_REQUIRED'};}
  async validationHandoff(){const job=this.selected();return job?this.#record(await this.transport.request('POST',`/v1/processing/jobs/${encodeURIComponent(job.jobId)}/validation-handoff`,{consumerId:'processing-safety-validator'})):{ok:false,code:'JOB_REQUIRED'};}
  availability(id,payload={}){
    const job=payload.jobId?this.state.jobs.find(item=>item.jobId===payload.jobId):this.selected();
    if(id==='processing.inspect')return Boolean(job)||'Select a Job';
    if(id==='processing.retry')return ['FAILED','TIMED_OUT'].includes(job?.state)||'Retry requires FAILED or TIMED_OUT Job';
    if(id==='processing.requestCancel')return Boolean(job)&&!terminalStates.has(job.state)||'Select a non-terminal Job';
    if(id==='processing.validationHandoff')return job?.state==='COMPLETED'||'A COMPLETED Job is required';
    return 'Unknown Processing command';
  }
  mount({stage,registry,workspace,button,esc}){
    const render=()=>{
      const state=this.snapshot(),jobs=this.collection.snapshot().visibleRows,job=this.selected(),provider=safeProviderProof(job),cancel=safeCancelTruth(job),validation=safeValidationTruth(job),attempts=job?.attempts||[];
      stage.innerHTML=`<style>
      [data-w05-surface="processing"]{display:grid;gap:14px;min-width:0}.w05-processing-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}.w05-processing-head h1{margin:0}.w05-processing-grid{display:grid;grid-template-columns:minmax(240px,.8fr) minmax(380px,1.5fr);gap:12px}.w05-processing-panel{border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 94%,transparent);padding:12px;min-width:0}.w05-job-list{display:grid;gap:7px}.w05-job-row{display:grid;gap:3px;text-align:start;border:1px solid var(--line);border-radius:9px;background:transparent;color:inherit;padding:10px;cursor:pointer}.w05-job-row[aria-pressed="true"]{outline:2px solid var(--accent);outline-offset:1px}.w05-job-row small{color:var(--text3);overflow-wrap:anywhere}.w05-job-truth{display:flex;flex-wrap:wrap;gap:7px;margin-block:8px 12px}.w05-job-token{border:1px solid var(--line);border-radius:999px;padding:5px 9px;font:600 11px var(--mono)}.w05-attempts{width:100%;border-collapse:collapse;font-size:12px}.w05-attempts th,.w05-attempts td{padding:7px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top;overflow-wrap:anywhere}.w05-attempts bdi{overflow-wrap:anywhere}.w05-attempt-meta{display:block;color:var(--text3);margin-top:3px}.w05-processing-actions{display:flex;gap:7px;flex-wrap:wrap}.w05-processing-bottom{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:12px}.w05-processing-bottom pre{max-height:240px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}@media(max-width:1100px){.w05-processing-grid,.w05-processing-bottom{grid-template-columns:1fr}.w05-processing-bottom{grid-column:auto}}</style>
      <div data-w05-surface="processing">
        <header class="w05-processing-head" dir="ltr"><div><div class="m0-eyebrow">W05 · Pipeline lifecycle</div><h1>Processing</h1><p>Job, Attempt, retry, cancellation and validation-handoff state are shown separately. No provider or consumer success is inferred.</p></div><span class="state-token" data-state="${esc(state.refreshPhase.toLowerCase())}">${esc(state.refreshPhase==='FETCHING'?'REFRESHING':'OBSERVING')}</span></header>
        <div class="w05-processing-grid">
          <section class="w05-processing-panel" dir="ltr"><h2>Jobs</h2><div class="w05-job-list">${jobs.length?jobs.map(row=>`<button class="w05-job-row" type="button" data-processing-job="${esc(row.jobId)}" aria-pressed="${row.jobId===job?.jobId}"><strong>${esc(row.jobId)}</strong><span>${esc(row.state)} · ${row.attempts?.length||0} attempt(s)</span><small>${esc(row.requestId)}</small></button>`).join(''):'<p class="state-token" data-state="empty">No Jobs observed. This is not a provider-success claim.</p>'}</div></section>
          <section class="w05-processing-panel" dir="ltr"><h2>Selected lifecycle</h2>${job?`<p><bdi dir="ltr">${esc(job.jobId)}</bdi> · <strong data-processing-state="${esc(job.state)}">${esc(job.state)}</strong></p><div class="w05-job-truth"><span class="w05-job-token" data-provider-proof="${provider.proven}">Provider execution · ${provider.proven?'PROVEN':'NOT PROVEN'}</span><span class="w05-job-token" data-cancel-ack="${cancel.acknowledged}">Cancel ACK · ${cancel.acknowledged?'ACKNOWLEDGED':'NOT ACKNOWLEDGED'}</span><span class="w05-job-token" data-validation-ack="${validation.acknowledged}">Validation · ${esc(validation.state)}</span></div><div class="w05-processing-actions">${button('processing.inspect','Inspect lifecycle')}${button('processing.retry','Retry → new Attempt')}${button('processing.requestCancel','Request cancel')}${button('processing.validationHandoff','Request validation handoff')}</div><h3>Attempt history</h3><div style="overflow:auto"><table class="w05-attempts"><thead><tr><th>#</th><th>Attempt / state</th><th>Provider</th></tr></thead><tbody>${attempts.map(a=>`<tr><td>${esc(a.number)}</td><td><bdi dir="ltr">${esc(a.attemptId)}</bdi><span class="w05-attempt-meta">${esc(a.state)} · worker ${esc(a.workerId||'NONE')} · lease ${esc(a.leaseId||'NONE')}</span></td><td>${a?.providerEvidence?.evidence?.actualProviderExecution===true?'PROVEN · actual execution':'NOT_PROVEN'}</td></tr>`).join('')}</tbody></table></div>`:'<p>Select a Job after refresh.</p>'}</section>
          <section class="w05-processing-panel w05-processing-bottom" dir="ltr"><div><h2>Cancellation / validation truth</h2><p><bdi dir="ltr">CANCEL_REQUESTED</bdi> is not <bdi dir="ltr">CANCELLED</bdi>. Cancellation is final only with actual provider ACK. Validation remains <bdi dir="ltr">PENDING</bdi> until an actual consumer receipt arrives.</p><pre>${esc(JSON.stringify({cancellation:job?.cancellation||null,validationHandoff:job?.validationHandoff||null},null,2))}</pre></div><div><h2>Latest receipt</h2><pre data-w05-receipt>${esc(JSON.stringify(state.lastReceipt||{status:'NO_MUTATION_RECEIPT'},null,2))}</pre></div></section>
        </div>
        <section class="w05-processing-panel"><h2>Status meaning</h2><p dir="ltr">Provider success requires <bdi dir="ltr">actualProviderExecution=true</bdi>. Validation handoff never means technically valid; it is a separate downstream acknowledgement lifecycle.</p><p dir="rtl">لا يتم تحويل طلب الإلغاء أو طلب التسليم إلى نجاح نهائي من دون إقرار فعلي من الجهة المالكة.</p></section>
      </div>`;
      stage.querySelectorAll('[data-processing-job]').forEach(element=>element.addEventListener('click',()=>{this.inspect({jobId:element.dataset.processingJob});workspace.inspectorDescriptor(this.contextProvider);render();}));
      workspace.inspectorDescriptor(this.contextProvider);
      const jobsPanel=stage.querySelector('.w05-processing-grid > .w05-processing-panel:first-child'),bottomPanel=stage.querySelector('.w05-processing-bottom');
      if(jobsPanel)workspace.region('LEFT',{node:jobsPanel,label:'Processing Jobs'});
      if(bottomPanel)workspace.region('BOTTOM',{node:bottomPanel,label:'Processing lifecycle detail',summary:'Cancellation, validation-handoff and receipt truth remain separate.'});
      workspace.refreshToolbar?.();
      return state;
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
