import {HealthRuntimeAdapter,normalizeHealthObservation,HEALTH_COMMANDS} from '../../../adapters/health-runtime.js';
import {ProcessingRuntimeAdapter,PROCESSING_COMMANDS} from '../../../adapters/processing-runtime.js';

const assert=(condition,message)=>{if(!condition)throw Error(message)};
class QueueTransport{
  constructor(responses=[]){this.responses=[...responses];this.calls=[];}
  descriptor(){return {id:'S16FakeTransport',semanticOwnership:false};}
  async request(method,path,body){this.calls.push({method,path,body});const next=this.responses.shift();if(typeof next==='function')return next({method,path,body});return structuredClone(next??{ok:false,code:'NO_FAKE_RESPONSE'});}
}
const attempt=(number,state,providerEvidence=null)=>({attemptId:`attempt-${number}`,jobId:'job-1',number,state,createdAt:`2026-09-18T00:00:0${number}Z`,updatedAt:`2026-09-18T00:00:0${number}Z`,workerId:state==='SUCCEEDED'?'worker-1':null,leaseId:state==='SUCCEEDED'?'lease-1':null,providerEvidence,error:state==='FAILED'?'TEST_FAILURE':null});
const job=(state='FAILED',attempts=[attempt(1,'FAILED')],extra={})=>({jobId:'job-1',requestId:'request-1',inputDigest:'digest-1',taskKind:'SHA256_JSON',state,lifecycleVersion:attempts.length,createdAt:'2026-09-18T00:00:00Z',updatedAt:'2026-09-18T00:00:09Z',currentAttemptId:attempts.at(-1).attemptId,attemptIds:attempts.map(a=>a.attemptId),attempts,cancellation:null,validationHandoff:null,...extra});
const tests=[];
async function test(id,fn){try{await fn();tests.push({id,status:'PASS'});}catch(error){tests.push({id,status:'FAIL',error:String(error?.message||error)});}}

await test('health.empty-queue-does-not-imply-worker-alive',async()=>{
  const queue=normalizeHealthObservation({observationId:'q1',sourceId:'health.processing.queue',kind:'QueueMetric',status:'AVAILABLE',observedAt:'2026-09-18T00:00:00Z',freshnessMs:5000,value:{depth:0}});
  const worker=normalizeHealthObservation({observationId:'w1',sourceId:'health.processing.worker',kind:'WorkerLiveness',status:'STALE',observedAt:'2026-09-17T23:59:00Z',freshnessMs:5000,value:{state:'EXPIRED'}});
  assert(queue.state==='AVAILABLE_EMPTY','zero queue must become AVAILABLE_EMPTY');assert(worker.workerState==='EXPIRED'&&worker.state==='STALE','expired worker must remain stale/expired');
});
await test('health.unavailable-never-green-and-observed-at-not-invented',async()=>{
  const row=normalizeHealthObservation({sourceId:'health.unknown',kind:'Observation',status:'UNAVAILABLE',value:null,error:'MISSING'});
  assert(row.state==='UNAVAILABLE','unavailable source changed state');assert(row.observedAt===null,'observedAt fabricated');
});
await test('health.refresh-does-not-create-diagnostic',async()=>{
  const transport=new QueueTransport([{ok:true,observations:[{observationId:'q1',sourceId:'health.processing.queue',kind:'QueueMetric',status:'AVAILABLE',observedAt:'2026-09-18T00:00:00Z',freshnessMs:5000,value:{depth:0}}]}]);
  const adapter=new HealthRuntimeAdapter({transport});await adapter.refresh();assert(adapter.snapshot().lastDiagnostic===null,'refresh fabricated diagnostic history');
});
await test('health.diagnose-is-distinct-durable-request',async()=>{
  const transport=new QueueTransport([{ok:true,diagnostic:{diagnosticId:'diag-1',durable:true},observations:[]}]);const adapter=new HealthRuntimeAdapter({transport});await adapter.diagnose();assert(adapter.snapshot().lastDiagnostic.diagnostic.diagnosticId==='diag-1','diagnostic receipt not retained');assert(transport.calls[0].path==='/v1/health/diagnostic','diagnose used wrong endpoint');
});
await test('health.transport-failure-preserves-last-known-observation',async()=>{
  const transport=new QueueTransport([{ok:true,observations:[{observationId:'o1',sourceId:'health.local-runtime',kind:'Observation',status:'AVAILABLE',observedAt:'2026-09-18T00:00:00Z',freshnessMs:5000,value:{node:'v22'}}]},{ok:false,code:'RUNTIME_UNAVAILABLE'}]);const adapter=new HealthRuntimeAdapter({transport});await adapter.refresh();await adapter.refresh();assert(adapter.rows().length===1,'last known observation erased on unavailable runtime');assert(adapter.snapshot().lastError.code==='RUNTIME_UNAVAILABLE','runtime failure not retained');
});
await test('health.command-vocabulary-exact',async()=>assert(JSON.stringify(HEALTH_COMMANDS)===JSON.stringify(['health.refresh','health.inspect','health.diagnose']),'Health command drift'));

await test('processing.retry-retains-failed-attempt-and-adds-new-attempt',async()=>{
  const before=job('FAILED',[attempt(1,'FAILED')]);const after=job('PENDING',[attempt(1,'FAILED'),attempt(2,'QUEUED')]);const transport=new QueueTransport([{ok:true,jobs:[before]},{ok:true,job:after}]);const adapter=new ProcessingRuntimeAdapter({transport});await adapter.refresh();await adapter.retry();const row=adapter.selected();assert(row.attempts.length===2,'retry did not add attempt');assert(row.attempts[0].state==='FAILED','failed attempt was overwritten');assert(row.attempts[1].attemptId!==row.attempts[0].attemptId,'attempt identity reused');
});
await test('processing.replayed-retry-does-not-fabricate-second-attempt',async()=>{
  const before=job('FAILED',[attempt(1,'FAILED')]);const after=job('PENDING',[attempt(1,'FAILED'),attempt(2,'QUEUED')]);const transport=new QueueTransport([{ok:true,jobs:[before]},{ok:true,job:after},{ok:false,code:'RETRY_NOT_ALLOWED',state:'PENDING'}]);const adapter=new ProcessingRuntimeAdapter({transport});await adapter.refresh();await adapter.retry();const second=await adapter.retry();assert(second.ok===false&&second.code==='RETRY_NOT_ALLOWED','replayed retry must remain provider-denied without a second attempt');assert(adapter.selected().attempts.length===2,'replayed retry fabricated an extra attempt');
});
await test('processing.cancel-request-is-not-cancelled-without-provider-ack',async()=>{
  const pending=job('PENDING',[attempt(1,'QUEUED')]);const requested=job('CANCEL_REQUESTED',[attempt(1,'QUEUED')],{cancellation:{requestId:'cancel-1',jobId:'job-1',state:'REQUESTED',requestedAt:'2026-09-18T00:01:00Z',acknowledgedAt:null,providerEvidence:null}});const transport=new QueueTransport([{ok:true,jobs:[pending]},{ok:true,job:requested,cancellation:requested.cancellation}]);const adapter=new ProcessingRuntimeAdapter({transport});await adapter.refresh();await adapter.requestCancel();const truth=adapter.inspect({jobId:'job-1'}).cancellationTruth;assert(truth.requested===true&&truth.acknowledged===false&&truth.cancelled===false,'cancel request fabricated cancellation');
});
await test('processing.validation-handoff-pending-is-not-consumer-success',async()=>{
  const proof={providerRunId:'run-1',evidence:{actualProviderExecution:true}};const completed=job('COMPLETED',[attempt(1,'SUCCEEDED',proof)]);const pending=job('COMPLETED',[attempt(1,'SUCCEEDED',proof)],{validationHandoff:{handoffId:'handoff-1',jobId:'job-1',consumerId:'processing-safety-validator',state:'PENDING',requestedAt:'2026-09-18T00:02:00Z',acknowledgedAt:null,consumerReceipt:null}});const transport=new QueueTransport([{ok:true,jobs:[completed]},{ok:true,job:pending,handoff:pending.validationHandoff}]);const adapter=new ProcessingRuntimeAdapter({transport});await adapter.refresh();await adapter.validationHandoff();const truth=adapter.inspect({jobId:'job-1'}).validationTruth;assert(truth.state==='PENDING'&&truth.acknowledged===false,'pending handoff fabricated consumer ACK');
});
await test('processing.completed-without-provider-evidence-is-not-proven',async()=>{
  const completed=job('COMPLETED',[attempt(1,'SUCCEEDED',null)]);const adapter=new ProcessingRuntimeAdapter({transport:new QueueTransport([{ok:true,jobs:[completed]}])});await adapter.refresh();const truth=adapter.inspect({jobId:'job-1'}).providerTruth;assert(truth.proven===false,'completion without provider evidence was marked proven');
});
await test('processing.inspect-preserves-three-attempt-history',async()=>{
  const three=job('PENDING',[attempt(1,'FAILED'),attempt(2,'FAILED'),attempt(3,'QUEUED')]);const adapter=new ProcessingRuntimeAdapter({transport:new QueueTransport([{ok:true,jobs:[three]}])});await adapter.refresh();const receipt=adapter.inspect({jobId:'job-1'});assert(receipt.job.attempts.length===3,'inspect lost attempts');assert(new Set(receipt.job.attempts.map(a=>a.attemptId)).size===3,'attempt identities collapsed');
});
await test('processing-command-vocabulary-exact',async()=>assert(JSON.stringify(PROCESSING_COMMANDS)===JSON.stringify(['processing.inspect','processing.retry','processing.requestCancel','processing.validationHandoff']),'Processing command drift'));
await test('processing-provider-and-correlation-identities-remain-distinct',async()=>{
  const row=job('FAILED',[attempt(1,'FAILED')]);assert(row.requestId!==row.jobId&&row.currentAttemptId!==row.jobId&&row.currentAttemptId!==row.requestId,'request/job/attempt identities collapsed');
});

const summary={total:tests.length,pass:tests.filter(test=>test.status==='PASS').length,fail:tests.filter(test=>test.status==='FAIL').length};
globalThis.S16HealthProcessingTests={status:summary.fail?'FAIL':'PASS',summary,tests};
if(typeof process!=='undefined'&&process?.argv?.[1]?.includes('s16-health-processing-tests')){console.log(JSON.stringify(globalThis.S16HealthProcessingTests,null,2));if(summary.fail)process.exitCode=1;}
