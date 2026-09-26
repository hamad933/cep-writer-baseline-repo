import {HealthRuntimeAdapter,normalizeHealthObservation,HEALTH_COMMANDS} from '../../../adapters/health-runtime.js';

const assert=(condition,message)=>{if(!condition)throw Error(message)};
const tests=[];
async function test(id,fn){try{await fn();tests.push({id,status:'PASS'})}catch(error){tests.push({id,status:'FAIL',error:String(error?.message||error)})}}
class ScriptedTransport{
  constructor(responses=[]){this.responses=[...responses];this.calls=[];}
  descriptor(){return {id:'HealthSurfaceRestorationTransport',semanticOwnership:false};}
  async request(method,path,body){this.calls.push({method,path,body});const next=this.responses.shift();if(next instanceof Error)throw next;if(typeof next==='function')return next({method,path,body});return structuredClone(next??{ok:false,code:'NO_RESPONSE'});}
}
const available=(extra={})=>({observationId:'obs-available',sourceId:'health.node',sourceIdentity:'node-provider',kind:'Observation',status:'AVAILABLE',observedAt:'2026-09-26T10:00:00.000Z',freshnessMs:5000,ageMs:0,value:{version:'v22'},...extra});
const queue=(depth=0)=>({observationId:'obs-queue',sourceId:'health.queue',sourceIdentity:'queue-provider',kind:'QueueMetric',status:'AVAILABLE',observedAt:'2026-09-26T10:00:00.000Z',freshnessMs:5000,ageMs:0,value:{depth}});
const worker=(state='ALIVE')=>({observationId:'obs-worker',sourceId:'health.worker',sourceIdentity:'worker-provider',kind:'WorkerLiveness',status:'AVAILABLE',observedAt:'2026-09-26T10:00:00.000Z',freshnessMs:5000,ageMs:0,value:{state}});

await test('health.available-data-and-empty-remain-distinct-with-exact-provenance',()=>{
  const data=normalizeHealthObservation(available()),empty=normalizeHealthObservation(queue(0));
  assert(data.state==='AVAILABLE_DATA','available observation did not project AVAILABLE_DATA');
  assert(empty.state==='AVAILABLE_EMPTY','zero queue did not project AVAILABLE_EMPTY');
  assert(data.observedAt==='2026-09-26T10:00:00.000Z'&&data.freshUntil==='2026-09-26T10:00:05.000Z','observedAt/freshUntil drifted');
  assert(data.sourceIdentity==='node-provider','source identity drifted');
});

await test('health.expired-freshness-projects-stale-and-never-reuses-worker-alive',async()=>{
  let now=Date.parse('2026-09-26T10:00:00.000Z');
  const adapter=new HealthRuntimeAdapter({clock:()=>now,transport:new ScriptedTransport([{ok:true,observations:[queue(0),worker('ALIVE')]}])});
  await adapter.refresh();
  now=Date.parse('2026-09-26T10:00:06.000Z');
  const rows=adapter.rows(),q=rows.find(row=>row.sourceId==='health.queue'),w=rows.find(row=>row.sourceId==='health.worker');
  assert(q.state==='STALE','expired queue did not become STALE');
  assert(w.state==='STALE'&&w.workerState==='UNKNOWN','expired worker remained ALIVE or non-stale');
  assert(w.lastKnownWorkerState==='ALIVE','last-known worker evidence was lost');
});

await test('health.provider-failure-retains-value-but-projects-current-unavailable',async()=>{
  const transport=new ScriptedTransport([{ok:true,observations:[available()]},{ok:false,code:'RUNTIME_UNAVAILABLE',reason:'provider offline'}]);
  const adapter=new HealthRuntimeAdapter({transport,clock:()=>Date.parse('2026-09-26T10:00:01.000Z')});
  await adapter.refresh();const fail=await adapter.refresh();const row=adapter.rows()[0];
  assert(fail.ok===false&&row.state==='UNAVAILABLE','provider failure did not project UNAVAILABLE');
  assert(row.current===false&&row.retained===true,'retained row remained apparently current');
  assert(row.lastKnownState==='AVAILABLE_DATA','last known state was not preserved separately');
  assert(row.currentFailureCode==='RUNTIME_UNAVAILABLE','provider failure code was not projected');
  assert(row.value.version==='v22','last known value was erased instead of retained as context');
});

await test('health.thrown-transport-error-fails-closed-and-refresh-phase-recovers',async()=>{
  const adapter=new HealthRuntimeAdapter({transport:new ScriptedTransport([new Error('socket closed')])});
  const result=await adapter.refresh(),state=adapter.snapshot();
  assert(result.ok===false&&result.code==='HEALTH_TRANSPORT_ERROR','thrown transport error did not become bounded failure receipt');
  assert(['UNAVAILABLE','ERROR'].includes(state.currentProviderState),'thrown transport error did not fail closed');
  assert(state.refreshPhase==='IDLE','refresh phase remained stuck in FETCHING after exception');
});

await test('health.malformed-success-does-not-fabricate-empty-success',async()=>{
  const adapter=new HealthRuntimeAdapter({transport:new ScriptedTransport([{ok:true,observations:[available()]},{ok:true,owner:'HealthCapability'}])});
  await adapter.refresh();const result=await adapter.refresh(),row=adapter.rows()[0];
  assert(result.ok===false&&result.code==='HEALTH_OBSERVATIONS_MISSING','missing observations were accepted as success');
  assert(row.state==='ERROR'&&row.current===false,'malformed success left retained rows current');
});

await test('health.refresh-and-diagnostic-history-remain-separate',async()=>{
  const transport=new ScriptedTransport([{ok:true,observations:[available()]},{ok:true,diagnostic:{diagnosticId:'diag-1',durable:true},observations:[available()]}]);
  const adapter=new HealthRuntimeAdapter({transport});
  await adapter.refresh();assert(adapter.snapshot().lastDiagnostic===null,'refresh created diagnostic history');
  await adapter.diagnose();assert(adapter.snapshot().lastDiagnostic.diagnostic.diagnosticId==='diag-1','diagnostic receipt missing');
  assert(transport.calls[0].path==='/v1/health/refresh'&&transport.calls[1].path==='/v1/health/diagnostic','refresh/diagnose endpoints collapsed');
});

await test('health.diagnostic-transport-failure-cannot-leave-old-observation-apparently-current',async()=>{
  const transport=new ScriptedTransport([{ok:true,observations:[available()]},new Error('diagnostic transport failed')]);
  const adapter=new HealthRuntimeAdapter({transport});
  await adapter.refresh();const result=await adapter.diagnose(),row=adapter.rows()[0];
  assert(result.ok===false&&row.current===false,'diagnostic transport failure left old observation current');
  assert(row.state==='UNAVAILABLE'||row.state==='ERROR','diagnostic transport failure did not project unavailable/error');
  assert(adapter.snapshot().lastDiagnostic===null,'failed diagnostic fabricated durable history');
});

await test('health.refresh-fetching-is-explicit-and-blocks-overlapping-health-work',async()=>{
  let resolve;const deferred=new Promise(r=>{resolve=r});
  const adapter=new HealthRuntimeAdapter({transport:{descriptor:()=>({id:'deferred'}),request:()=>deferred}});
  const pending=adapter.refresh();
  assert(adapter.snapshot().refreshPhase==='FETCHING','refresh did not enter FETCHING');
  assert(adapter.availability('health.refresh')==='Refresh already in progress','overlapping refresh remained available');
  assert(adapter.availability('health.diagnose')==='Wait for the current observation refresh','diagnostic remained available during refresh');
  resolve({ok:true,observations:[]});await pending;
  assert(adapter.snapshot().refreshPhase==='IDLE','refresh did not return to IDLE');
});

await test('health.command-vocabulary-remains-exact',()=>assert(JSON.stringify(HEALTH_COMMANDS)===JSON.stringify(['health.refresh','health.inspect','health.diagnose']),'Health command vocabulary drift'));

const summary={total:tests.length,pass:tests.filter(item=>item.status==='PASS').length,fail:tests.filter(item=>item.status==='FAIL').length};
globalThis.HealthSurfaceRestorationTests={status:summary.fail?'FAIL':'PASS',summary,tests};
if(typeof process!=='undefined'&&process?.argv?.[1]?.includes('health-runtime-restoration-tests')){console.log(JSON.stringify(globalThis.HealthSurfaceRestorationTests,null,2));if(summary.fail)process.exitCode=1;}
