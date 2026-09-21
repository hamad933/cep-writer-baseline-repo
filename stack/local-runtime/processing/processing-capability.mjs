import {mkdirSync,readFileSync,renameSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';

const canonical=value=>JSON.stringify(canonicalize(value));
function canonicalize(value){if(Array.isArray(value))return value.map(canonicalize);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalize(value[key])]));return value}
const sha256=value=>createHash('sha256').update(value).digest('hex');
const iso=ms=>new Date(ms).toISOString();
const terminal=new Set(['COMPLETED','FAILED','CANCELLED']);
const stateSchema='CEP_PROCESSING_STATE_V2';

export class ProcessingCapability{
  constructor({statePath,clock=()=>Date.now(),provider=null,validationConsumers=['processing-safety-validator'],auditProvider=null}={}){
    if(!statePath)throw Error('PROCESSING_STATE_PATH_REQUIRED');
    this.owner='ProcessingCapability';this.version='1.1.0';this.statePath=resolve(statePath);this.clock=clock;this.provider=provider||this.#defaultProvider();this.validationConsumers=new Set(validationConsumers);this.auditProvider=auditProvider;
    mkdirSync(dirname(this.statePath),{recursive:true});this.state=this.#load();this.reconcileExpiredLeases();
  }
  #empty(){return {schema:stateSchema,jobs:{},attempts:{},retryRequests:{},cancellationRequests:{},validationHandoffs:{},workers:{},events:[]}}
  #load(){
    try{
      const parsed=JSON.parse(readFileSync(this.statePath,'utf8'));
      if(parsed?.schema===stateSchema)return {...this.#empty(),...parsed,retryRequests:parsed.retryRequests||{}};
      if(parsed?.schema==='CEP_PROCESSING_STATE_V1')return {...this.#empty(),...parsed,schema:stateSchema,retryRequests:{},jobs:Object.fromEntries(Object.entries(parsed.jobs||{}).map(([id,job])=>[id,{...job,correlationId:job.correlationId??null}]))};
      return this.#empty();
    }catch{return this.#empty()}
  }
  #save(){const tmp=`${this.statePath}.tmp-${process.pid}-${this.clock()}`;writeFileSync(tmp,JSON.stringify(this.state,null,2),'utf8');renameSync(tmp,this.statePath)}
  #event(type,data){const event={eventId:`evt-${randomUUID()}`,type,at:iso(this.clock()),...data};this.state.events.push(event);if(this.state.events.length>500)this.state.events.splice(0,this.state.events.length-500);return event}
  #audit({actor=this.owner,action,target,outcome,correlationId=null,details=null}={}){if(!this.auditProvider)return null;const result=this.auditProvider.append({actor,action,target,outcome,correlationId,details});return result?.ok?result.event:null}
  #defaultProvider(){return {id:'LocalDigestProcessingProvider',version:'1.0.0',run:async({taskKind,input})=>{if(taskKind!=='SHA256_JSON')throw Object.assign(Error('TASK_KIND_NOT_SUPPORTED'),{code:'TASK_KIND_NOT_SUPPORTED'});const canonicalInput=canonical(input);return {providerRunId:`run-${randomUUID()}`,taskKind,output:{sha256:sha256(canonicalInput),bytes:Buffer.byteLength(canonicalInput)},evidence:{actualProviderExecution:true,providerId:'LocalDigestProcessingProvider'}}}}}
  descriptor(){return {owner:this.owner,version:this.version,availability:'AVAILABLE',providerId:this.provider.id,providerVersion:this.provider.version,executionKinds:['SHA256_JSON'],genericProcessExecution:false,shellExecution:false,durableCorrelationId:true,durableRetryIdempotency:true};}
  createJob({requestId,correlationId,input,taskKind='SHA256_JSON'}={}){
    const rid=String(requestId||'');if(!rid)return {ok:false,code:'REQUEST_ID_REQUIRED'};
    const duplicate=Object.values(this.state.jobs).find(job=>job.requestId===rid);if(duplicate)return {ok:true,duplicateReplay:true,job:this.readJob(duplicate.jobId)};
    if(taskKind!=='SHA256_JSON')return {ok:false,code:'TASK_KIND_NOT_SUPPORTED'};
    const jobId=`job-${randomUUID()}`,attemptId=`attempt-${randomUUID()}`,createdAt=iso(this.clock()),inputDigest=sha256(canonical(input)),cid=String(correlationId||`corr-${randomUUID()}`);
    if(!cid)return {ok:false,code:'CORRELATION_ID_REQUIRED'};
    if(new Set([rid,jobId,attemptId,inputDigest]).has(cid))return {ok:false,code:'CORRELATION_ID_COLLISION'};
    this.state.jobs[jobId]={jobId,requestId:rid,correlationId:cid,inputDigest,taskKind,input,state:'PENDING',lifecycleVersion:1,createdAt,updatedAt:createdAt,currentAttemptId:attemptId,attemptIds:[attemptId],cancelRequestId:null,validationHandoffId:null};
    this.state.attempts[attemptId]={attemptId,jobId,correlationId:cid,number:1,state:'QUEUED',createdAt,updatedAt:createdAt,workerId:null,leaseId:null,leaseExpiresAt:null,providerEvidence:null,error:null,retryOfAttemptId:null,retryIdempotencyKey:null};
    const event=this.#event('JOB_CREATED',{jobId,attemptId,requestId:rid,correlationId:cid,inputDigest});this.#save();
    const auditEvent=this.#audit({action:'processing.job.created',target:jobId,outcome:'QUEUED',correlationId:cid,details:{requestId:rid,attemptId}});
    return {ok:true,job:this.readJob(jobId),causalEvent:event,auditEvent};
  }
  readJob(jobId){const job=this.state.jobs[String(jobId||'')];if(!job)return null;return structuredClone({...job,attempts:job.attemptIds.map(id=>this.state.attempts[id]),retryRequests:Object.values(this.state.retryRequests).filter(item=>item.jobId===job.jobId),cancellation:job.cancelRequestId?this.state.cancellationRequests[job.cancelRequestId]:null,validationHandoff:job.validationHandoffId?this.state.validationHandoffs[job.validationHandoffId]:null})}
  listJobs(){return Object.keys(this.state.jobs).map(id=>this.readJob(id)).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))}
  heartbeat(workerId='local-processing-worker'){const at=iso(this.clock());this.state.workers[workerId]={workerId,lastHeartbeatAt:at,providerId:this.provider.id};this.#event('WORKER_HEARTBEAT',{workerId});this.#save();return this.state.workers[workerId]}
  reconcileExpiredLeases(){const now=this.clock();let changed=false;for(const attempt of Object.values(this.state.attempts)){if(['LEASED','RUNNING'].includes(attempt.state)&&attempt.leaseExpiresAt&&Date.parse(attempt.leaseExpiresAt)<=now){attempt.state='TIMED_OUT';attempt.updatedAt=iso(now);attempt.error='LEASE_EXPIRED';const job=this.state.jobs[attempt.jobId];if(job&&!terminal.has(job.state)){job.state='TIMED_OUT';job.lifecycleVersion+=1;job.updatedAt=iso(now)}this.#event('ATTEMPT_LEASE_EXPIRED',{attemptId:attempt.attemptId,jobId:attempt.jobId,correlationId:job?.correlationId??null});changed=true}}if(changed)this.#save();return changed}
  async runOnce({workerId='local-processing-worker',leaseMs=5000}={}){
    this.reconcileExpiredLeases();this.heartbeat(workerId);
    const cancelJob=Object.values(this.state.jobs).find(job=>job.state==='CANCEL_REQUESTED'&&job.cancelRequestId&&this.state.cancellationRequests[job.cancelRequestId]?.state==='REQUESTED');
    if(cancelJob){const req=this.state.cancellationRequests[cancelJob.cancelRequestId],at=iso(this.clock());req.state='ACKNOWLEDGED';req.acknowledgedAt=at;req.providerEvidence={providerId:this.provider.id,ackId:`cancel-ack-${randomUUID()}`,actualProviderAck:true,correlationId:cancelJob.correlationId};cancelJob.state='CANCELLED';cancelJob.lifecycleVersion+=1;cancelJob.updatedAt=at;const attempt=this.state.attempts[cancelJob.currentAttemptId];if(attempt&&['QUEUED','LEASED','RUNNING'].includes(attempt.state)){attempt.state='FAILED';attempt.error='CANCELLED_BY_PROVIDER_ACK';attempt.updatedAt=at}const event=this.#event('CANCEL_ACKNOWLEDGED',{jobId:cancelJob.jobId,cancellationRequestId:req.requestId,correlationId:cancelJob.correlationId});this.#save();const auditEvent=this.#audit({action:'processing.cancel.acknowledged',target:cancelJob.jobId,outcome:'CANCELLED',correlationId:cancelJob.correlationId,details:{cancellationRequestId:req.requestId,actualProviderAck:true}});return {ok:true,kind:'CANCEL_ACK',job:this.readJob(cancelJob.jobId),causalEvent:event,auditEvent}}
    const attempt=Object.values(this.state.attempts).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).find(item=>item.state==='QUEUED');if(!attempt)return {ok:true,kind:'IDLE',queueDepth:0};
    const job=this.state.jobs[attempt.jobId],now=this.clock(),leaseId=`lease-${randomUUID()}`;attempt.state='LEASED';attempt.workerId=workerId;attempt.leaseId=leaseId;attempt.leaseExpiresAt=iso(now+Math.max(250,Number(leaseMs)||5000));attempt.updatedAt=iso(now);job.state='RUNNING';job.lifecycleVersion+=1;job.updatedAt=iso(now);this.#event('ATTEMPT_LEASED',{jobId:job.jobId,attemptId:attempt.attemptId,leaseId,workerId,correlationId:job.correlationId});this.#save();
    attempt.state='RUNNING';attempt.updatedAt=iso(this.clock());this.#event('ATTEMPT_RUNNING',{jobId:job.jobId,attemptId:attempt.attemptId,leaseId,correlationId:job.correlationId});this.#save();
    try{
      const result=await this.provider.run({jobId:job.jobId,attemptId:attempt.attemptId,correlationId:job.correlationId,taskKind:job.taskKind,input:job.input,inputDigest:job.inputDigest,leaseId,workerId});
      if(!result?.providerRunId||result?.evidence?.actualProviderExecution!==true)throw Object.assign(Error('PROVIDER_EVIDENCE_REQUIRED'),{code:'PROVIDER_EVIDENCE_REQUIRED'});
      const at=iso(this.clock());attempt.state='SUCCEEDED';attempt.updatedAt=at;attempt.providerEvidence={...result,correlationId:job.correlationId,completedAt:at,workerId,leaseId};job.state='COMPLETED';job.lifecycleVersion+=1;job.updatedAt=at;job.outputDigest=sha256(canonical(result.output));const event=this.#event('ATTEMPT_SUCCEEDED',{jobId:job.jobId,attemptId:attempt.attemptId,providerRunId:result.providerRunId,correlationId:job.correlationId});this.#save();const auditEvent=this.#audit({action:'processing.attempt.succeeded',target:job.jobId,outcome:'SUCCESS',correlationId:job.correlationId,details:{attemptId:attempt.attemptId,providerRunId:result.providerRunId}});return {ok:true,kind:'COMPLETION',job:this.readJob(job.jobId),providerEvidence:attempt.providerEvidence,causalEvent:event,auditEvent};
    }catch(error){
      const at=iso(this.clock());attempt.state='FAILED';attempt.error=String(error?.code||error?.message||error);attempt.updatedAt=at;job.state='FAILED';job.lifecycleVersion+=1;job.updatedAt=at;const event=this.#event('ATTEMPT_FAILED',{jobId:job.jobId,attemptId:attempt.attemptId,error:attempt.error,correlationId:job.correlationId});this.#save();const auditEvent=this.#audit({action:'processing.attempt.failed',target:job.jobId,outcome:'FAILURE',correlationId:job.correlationId,details:{attemptId:attempt.attemptId,error:attempt.error}});return {ok:false,code:attempt.error,kind:'FAILURE',job:this.readJob(job.jobId),causalEvent:event,auditEvent};
    }
  }
  retry(jobId,{idempotencyKey}={}){
    this.reconcileExpiredLeases();const job=this.state.jobs[String(jobId||'')];if(!job)return {ok:false,code:'JOB_NOT_FOUND'};
    const key=String(idempotencyKey||'');if(!key)return {ok:false,code:'RETRY_IDEMPOTENCY_KEY_REQUIRED'};
    const requestKey=sha256(`${job.jobId}\n${key}`),priorReceipt=this.state.retryRequests[requestKey];
    if(priorReceipt){return {ok:true,duplicateReplay:true,retryReceipt:structuredClone(priorReceipt),job:this.readJob(job.jobId)}}
    if(!['FAILED','TIMED_OUT'].includes(job.state))return {ok:false,code:'RETRY_NOT_ALLOWED',state:job.state};
    const previous=this.state.attempts[job.currentAttemptId],attemptId=`attempt-${randomUUID()}`,number=Math.max(0,...job.attemptIds.map(id=>Number(this.state.attempts[id]?.number)||0))+1,at=iso(this.clock());
    this.state.attempts[attemptId]={attemptId,jobId:job.jobId,correlationId:job.correlationId,number,state:'QUEUED',createdAt:at,updatedAt:at,workerId:null,leaseId:null,leaseExpiresAt:null,providerEvidence:null,error:null,retryOfAttemptId:previous?.attemptId||null,retryIdempotencyKey:key};
    const retryReceipt={requestKey,idempotencyKey:key,jobId:job.jobId,correlationId:job.correlationId,attemptId,retryOfAttemptId:previous?.attemptId||null,createdAt:at,outcome:'RETRY_QUEUED'};
    this.state.retryRequests[requestKey]=retryReceipt;job.currentAttemptId=attemptId;job.attemptIds.push(attemptId);job.state='PENDING';job.lifecycleVersion+=1;job.updatedAt=at;const event=this.#event('JOB_RETRY_QUEUED',{jobId:job.jobId,attemptId,retryOfAttemptId:previous?.attemptId||null,idempotencyKey:key,correlationId:job.correlationId});this.#save();const auditEvent=this.#audit({action:'processing.retry.queued',target:job.jobId,outcome:'QUEUED',correlationId:job.correlationId,details:{attemptId,retryOfAttemptId:previous?.attemptId||null,idempotencyKey:key}});return {ok:true,retryReceipt:structuredClone(retryReceipt),job:this.readJob(job.jobId),causalEvent:event,auditEvent};
  }
  requestCancel(jobId,{requestId}={}){
    const job=this.state.jobs[String(jobId||'')];if(!job)return {ok:false,code:'JOB_NOT_FOUND'};if(terminal.has(job.state))return {ok:false,code:'CANCEL_NOT_ALLOWED',state:job.state};
    if(job.cancelRequestId){const prior=this.state.cancellationRequests[job.cancelRequestId];return {ok:true,duplicateReplay:true,cancellation:structuredClone(prior),job:this.readJob(job.jobId)}}
    const id=String(requestId||`cancel-${randomUUID()}`),at=iso(this.clock());const receipt={requestId:id,jobId:job.jobId,correlationId:job.correlationId,state:'REQUESTED',requestedAt:at,acknowledgedAt:null,providerEvidence:null};this.state.cancellationRequests[id]=receipt;job.cancelRequestId=id;job.state='CANCEL_REQUESTED';job.lifecycleVersion+=1;job.updatedAt=at;const event=this.#event('CANCEL_REQUESTED',{jobId:job.jobId,cancellationRequestId:id,correlationId:job.correlationId});this.#save();const auditEvent=this.#audit({action:'processing.cancel.requested',target:job.jobId,outcome:'REQUESTED',correlationId:job.correlationId,details:{cancellationRequestId:id}});return {ok:true,cancellation:structuredClone(receipt),job:this.readJob(job.jobId),causalEvent:event,auditEvent};
  }
  requestValidationHandoff(jobId,{consumerId='processing-safety-validator'}={}){
    const job=this.state.jobs[String(jobId||'')];if(!job)return {ok:false,code:'JOB_NOT_FOUND'};if(job.state!=='COMPLETED')return {ok:false,code:'COMPLETED_JOB_REQUIRED',state:job.state};
    if(job.validationHandoffId)return {ok:true,duplicateReplay:true,handoff:structuredClone(this.state.validationHandoffs[job.validationHandoffId]),job:this.readJob(job.jobId)};
    if(!this.validationConsumers.has(consumerId))return {ok:false,code:'VALIDATION_CONSUMER_NOT_REGISTERED'};
    const handoffId=`handoff-${randomUUID()}`,at=iso(this.clock()),handoff={handoffId,jobId:job.jobId,correlationId:job.correlationId,consumerId,state:'PENDING',requestedAt:at,acknowledgedAt:null,consumerReceipt:null};this.state.validationHandoffs[handoffId]=handoff;job.validationHandoffId=handoffId;job.lifecycleVersion+=1;job.updatedAt=at;const event=this.#event('VALIDATION_HANDOFF_REQUESTED',{jobId:job.jobId,handoffId,consumerId,correlationId:job.correlationId});this.#save();const auditEvent=this.#audit({action:'processing.validation-handoff.requested',target:job.jobId,outcome:'PENDING',correlationId:job.correlationId,details:{handoffId,consumerId}});return {ok:true,handoff:structuredClone(handoff),job:this.readJob(job.jobId),causalEvent:event,auditEvent};
  }
  acknowledgeValidation({handoffId,consumerId='processing-safety-validator',accepted=true}={}){
    const handoff=this.state.validationHandoffs[String(handoffId||'')];if(!handoff)return {ok:false,code:'HANDOFF_NOT_FOUND'};if(!this.validationConsumers.has(consumerId)||handoff.consumerId!==consumerId)return {ok:false,code:'VALIDATION_CONSUMER_NOT_REGISTERED'};if(handoff.state!=='PENDING')return {ok:true,duplicateReplay:true,handoff:structuredClone(handoff)};
    const at=iso(this.clock()),receipt={receiptId:`validation-receipt-${randomUUID()}`,consumerId,correlationId:handoff.correlationId,accepted:!!accepted,acknowledgedAt:at,actualConsumerAck:true};handoff.state=accepted?'ACKNOWLEDGED':'FAILED';handoff.acknowledgedAt=at;handoff.consumerReceipt=receipt;const event=this.#event('VALIDATION_HANDOFF_ACK',{jobId:handoff.jobId,handoffId:handoff.handoffId,accepted:!!accepted,correlationId:handoff.correlationId});this.#save();const auditEvent=this.#audit({action:'processing.validation-handoff.acknowledged',target:handoff.jobId,outcome:accepted?'ACKNOWLEDGED':'FAILURE',correlationId:handoff.correlationId,details:{handoffId:handoff.handoffId,consumerId,actualConsumerAck:true}});return {ok:true,handoff:structuredClone(handoff),consumerReceipt:receipt,job:this.readJob(handoff.jobId),causalEvent:event,auditEvent};
  }
  healthFacts({freshnessMs=5000}={}){this.reconcileExpiredLeases();const now=this.clock(),workers=Object.values(this.state.workers).map(worker=>{const ageMs=Math.max(0,now-Date.parse(worker.lastHeartbeatAt));return {...worker,observedAt:worker.lastHeartbeatAt,freshnessMs,ageMs,state:ageMs<=freshnessMs?'ALIVE':'EXPIRED'}});const queueDepth=Object.values(this.state.attempts).filter(attempt=>attempt.state==='QUEUED').length;return {sourceId:'processing.local-digest-provider',observedAt:iso(now),workers,queue:{queueId:'processing.default',depth:queueDepth,observedAt:iso(now)},provider:{id:this.provider.id,version:this.provider.version}}}
}
