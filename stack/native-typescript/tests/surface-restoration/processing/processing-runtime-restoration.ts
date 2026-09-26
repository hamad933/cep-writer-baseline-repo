// @ts-nocheck
import {PROCESSING_COMMANDS,ProcessingRuntimeAdapter} from '../../../adapters/processing-runtime.js';

const tests=[];
const assert=(value,message)=>{if(!value)throw Error(message)};
const run=async(id,fn)=>{try{tests.push({id,status:'PASS',evidence:await fn()})}catch(error){tests.push({id,status:'FAIL',error:String(error?.stack||error)})}};
const attempt=(jobId,n,state,providerEvidence=null)=>({attemptId:jobId+'-attempt-'+n,number:n,state,workerId:'worker-'+n,leaseId:'lease-'+n,providerEvidence});
const job=(jobId,state,extra={})=>({jobId,requestId:'request-'+jobId,inputDigest:'a'.repeat(64),state,currentAttemptId:(extra.attempts||[]).at(-1)?.attemptId||null,lifecycleVersion:1,attempts:[],...extra});
const providerProof={providerRunId:'provider-run-1',evidence:{actualProviderExecution:true,providerId:'test-provider'}};
const mutationIds=new Set(['processing.retry','processing.requestCancel','processing.validationHandoff']);
class QueueTransport{
  constructor(responses){this.responses=[...responses];this.calls=[]}
  descriptor(){return {id:'ProcessingRestorationTransport',testOnly:true}}
  async request(method,path,body){this.calls.push({method,path,body});const next=this.responses.shift();return typeof next==='function'?next({method,path,body}):next||{ok:false,code:'NO_TEST_RESPONSE'}}
}

await run('processing.provider-unavailable-retains-history-but-disables-all-mutations',async()=>{
  const failed=job('job-failed','FAILED',{attempts:[attempt('job-failed',1,'FAILED')]});
  const transport=new QueueTransport([{ok:true,jobs:[failed]},{ok:false,code:'RUNTIME_UNAVAILABLE'}]);
  const adapter=new ProcessingRuntimeAdapter({transport});await adapter.refresh();await adapter.refresh();
  const actions=adapter.collection.rowActions(failed.jobId);
  assert(adapter.snapshot().providerState==='UNAVAILABLE','provider state must be UNAVAILABLE');
  assert(adapter.rows().length===1&&adapter.rows()[0].jobId===failed.jobId,'retained history was lost');
  assert(actions.find(a=>a.id==='processing.inspect')?.enabled===true,'inspection must remain enabled');
  assert(actions.filter(a=>mutationIds.has(a.id)).every(a=>a.enabled===false),'mutation leaked while provider unavailable');
  for(const result of [await adapter.retry(),await adapter.requestCancel(),await adapter.validationHandoff()])assert(result.code==='PROCESSING_PROVIDER_UNAVAILABLE'&&result.mutated===false,'unavailable mutation was not fail-closed');
  assert(transport.calls.every(c=>c.method==='GET'),'unavailable mutation reached transport');
  return {providerState:adapter.snapshot().providerState,actions};
});

await run('processing.provider-error-remains-distinct-and-fail-closed',async()=>{
  const running=job('job-running','RUNNING',{attempts:[attempt('job-running',1,'RUNNING')]});
  const adapter=new ProcessingRuntimeAdapter({transport:new QueueTransport([{ok:true,jobs:[running]},{ok:false,code:'PROVIDER_ERROR'}])});
  await adapter.refresh();await adapter.refresh();
  assert(adapter.snapshot().providerState==='ERROR','provider ERROR collapsed into another state');
  const actions=adapter.collection.rowActions(running.jobId);
  assert(actions.filter(a=>mutationIds.has(a.id)).every(a=>a.enabled===false),'provider error leaked mutation availability');
  return {providerState:adapter.snapshot().providerState,actions};
});

await run('processing.lifecycle-states-remain-distinct',async()=>{
  const states=['PENDING','RUNNING','RETRY_WAIT','TIMED_OUT','CANCEL_REQUESTED','CANCELLED','COMPLETED','FAILED'];
  const jobs=states.map((state,i)=>job('job-'+(i+1),state,{attempts:[attempt('job-'+(i+1),1,state==='COMPLETED'?'SUCCEEDED':state)]}));
  const adapter=new ProcessingRuntimeAdapter({transport:new QueueTransport([{ok:true,jobs}])});await adapter.refresh();
  const observed=adapter.rows().map(row=>row.state);assert(JSON.stringify(observed)===JSON.stringify(states),'lifecycle states collapsed');
  const stateColumn=adapter.tableAdapter.columns.find(c=>c.id==='state');for(const row of adapter.rows())assert(stateColumn.cell(row).text===row.state,'state projection relabelled '+row.state);
  return {states:observed};
});

await run('processing.provider-success-requires-execution-evidence-and-run-id',async()=>{
  const noEvidence=job('job-no-evidence','COMPLETED',{attempts:[attempt('job-no-evidence',1,'SUCCEEDED')]});
  const missingRun=job('job-missing-run','COMPLETED',{attempts:[attempt('job-missing-run',1,'SUCCEEDED',{evidence:{actualProviderExecution:true}})]});
  const proven=job('job-proven','COMPLETED',{attempts:[attempt('job-proven',1,'SUCCEEDED',providerProof)]});
  const adapter=new ProcessingRuntimeAdapter({transport:new QueueTransport([{ok:true,jobs:[noEvidence,missingRun,proven]}])});await adapter.refresh();
  assert(adapter.inspect({jobId:noEvidence.jobId}).providerTruth.proven===false,'completion invented provider evidence');
  assert(adapter.inspect({jobId:missingRun.jobId}).providerTruth.proven===false,'missing providerRunId counted as proof');
  const truth=adapter.inspect({jobId:proven.jobId}).providerTruth;assert(truth.proven===true&&truth.providerRunId==='provider-run-1','actual provider evidence not recognized');
  return {proven:truth};
});

await run('processing.cancel-and-validation-ack-truth-remain-distinct',async()=>{
  const requested=job('job-cancel-requested','CANCEL_REQUESTED',{attempts:[attempt('job-cancel-requested',1,'RUNNING')],cancellation:{state:'REQUESTED',providerEvidence:null}});
  const cancelled=job('job-cancelled','CANCELLED',{attempts:[attempt('job-cancelled',1,'FAILED')],cancellation:{state:'ACKNOWLEDGED',providerEvidence:{actualProviderAck:true}}});
  const pending=job('job-handoff-pending','COMPLETED',{attempts:[attempt('job-handoff-pending',1,'SUCCEEDED',providerProof)],validationHandoff:{state:'PENDING',consumerReceipt:null}});
  const ack=job('job-handoff-ack','COMPLETED',{attempts:[attempt('job-handoff-ack',1,'SUCCEEDED',providerProof)],validationHandoff:{state:'ACKNOWLEDGED',consumerReceipt:{receiptId:'receipt-1',actualConsumerAck:true}}});
  const adapter=new ProcessingRuntimeAdapter({transport:new QueueTransport([{ok:true,jobs:[requested,cancelled,pending,ack]}])});await adapter.refresh();
  const before=adapter.inspect({jobId:requested.jobId}).cancellationTruth;assert(before.requested===true&&before.acknowledged===false&&before.cancelled===false,'CANCEL_REQUESTED collapsed to CANCELLED');
  assert(adapter.collection.rowActions(requested.jobId).find(a=>a.id==='processing.requestCancel')?.enabled===false,'duplicate cancel remained enabled');
  const after=adapter.inspect({jobId:cancelled.jobId}).cancellationTruth;assert(after.acknowledged===true&&after.cancelled===true,'provider ACK did not establish cancellation');
  const pendingTruth=adapter.inspect({jobId:pending.jobId}).validationTruth;assert(pendingTruth.state==='PENDING'&&pendingTruth.acknowledged===false,'pending handoff invented consumer ACK');
  assert(adapter.collection.rowActions(pending.jobId).find(a=>a.id==='processing.validationHandoff')?.enabled===false,'duplicate handoff remained enabled');
  const ackTruth=adapter.inspect({jobId:ack.jobId}).validationTruth;assert(ackTruth.acknowledged===true&&ackTruth.receiptId==='receipt-1','consumer ACK receipt not preserved');
  return {before,after,pending:pendingTruth,acknowledged:ackTruth};
});

await run('processing.retry-idempotency-key-binds-job-and-failed-attempt',async()=>{
  const failed=job('job-retry','FAILED',{attempts:[attempt('job-retry',3,'FAILED')]});
  const transport=new QueueTransport([{ok:true,jobs:[failed]},({body})=>({ok:true,duplicateReplay:true,retryReceipt:{idempotencyKey:body.idempotencyKey},job:failed})]);
  const adapter=new ProcessingRuntimeAdapter({transport});await adapter.refresh();const receipt=await adapter.retry();const call=transport.calls.at(-1);
  assert(call.body.idempotencyKey==='retry:'+failed.jobId+':'+failed.currentAttemptId,'retry key is not bound to exact failed attempt');
  assert(receipt.duplicateReplay===true&&adapter.selected().attempts.length===1,'duplicate retry fabricated a local Attempt');
  return {idempotencyKey:call.body.idempotencyKey,duplicateReplay:receipt.duplicateReplay};
});

await run('processing-command-vocabulary-remains-exact',async()=>{const expected=['processing.inspect','processing.retry','processing.requestCancel','processing.validationHandoff'];assert(JSON.stringify(PROCESSING_COMMANDS)===JSON.stringify(expected),'Processing command vocabulary drift');return {commands:[...PROCESSING_COMMANDS]}});
const summary={total:tests.length,pass:tests.filter(t=>t.status==='PASS').length,fail:tests.filter(t=>t.status==='FAIL').length};
const result={suite:'SWR_W05_PROCESSING_SURFACE_RESTORATION',status:summary.fail?'FAIL':'PASS',summary,tests};console.log(JSON.stringify(result,null,2));if(summary.fail)process.exitCode=1;
