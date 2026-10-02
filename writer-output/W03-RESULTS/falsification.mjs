/**
 * RES-1 lane falsification — W03-RESULTS (results surface / adapters/results).
 * Runs against dist/ (built from stack/native-typescript by npm run build:runtime).
 *
 * N1 non-owned route refuses · N2 boundary input safe · N3 provider absent -> truthful unavailable
 * N4 duplicate mechanics (tools/check-duplicate-mechanics.mjs) · N5 suite twice identical (npm test x2)
 * L1 replay mutates nothing (canonical hash before/after scrub) · L2 TimelineReplayOwner count = 1
 * L3 Results acquires NO Review authority · L4 analytical compare uses the INJECTED shared owner.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {W03ResultsDomain} from '../../dist/adapters/results/domain.js';
import {composeResultsSurface} from '../../dist/surfaces/results/index.js';
import {TimelineReplayOwner} from '../../dist/foundation/timeline/replay.js';
import {AnalyticalCompareOwner} from '../../dist/foundation/analytical/compare.js';
import {SemanticCommandBus} from '../../dist/foundation/global/commands.js';

const rows=[];
const run=async(id,fn)=>{try{const detail=await fn();rows.push({id,status:'PASS',detail:detail??true})}catch(error){rows.push({id,status:'FAIL',error:String(error?.stack||error)})}};
const throws=(fn,regexp)=>{let message=null;try{fn()}catch(error){message=String(error?.message||error)}assert(message,'expected a refusal, got success');if(regexp)assert(regexp.test(message),`expected ${regexp}, got ${message}`);return message};
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const newBus=()=>new SemanticCommandBus();

const records=[
  {resultId:'FZ-A',revisionId:'r1',manifestDigest:'sha256:fa',sealed:true,label:'falsification A',schemaVersion:'results/v1',comparatorVersion:'results-compare/1.0.0',comparable:{status:{label:'Status',type:'string',value:'UP'}},
   recordedEvents:[{seq:1,id:'ev-1',type:'START',timestamp:'2026-10-01T00:00:00Z'},{seq:2,id:'ev-2',type:'STOP',timestamp:'2026-10-01T00:00:05Z'}],
   provenanceRefs:['prov:fz-a'],sourceRunInputRef:{runId:'RUN-FZ-A',revisionId:'ri-1'},historicalTerminalBytes:'[OK] recorded only'},
  {resultId:'FZ-B',revisionId:'r1',manifestDigest:'sha256:fb',sealed:true,label:'falsification B',schemaVersion:'results/v1',comparatorVersion:'results-compare/1.0.0',comparable:{status:{label:'Status',type:'string',value:'DOWN'}},
   recordedEvents:[{seq:1,id:'ev-1',type:'START',timestamp:'2026-10-01T01:00:00Z'}],provenanceRefs:['prov:fz-b']}
];
const refA={resultId:'FZ-A',revisionId:'r1',manifestDigest:'sha256:fa'};
const refB={resultId:'FZ-B',revisionId:'r1',manifestDigest:'sha256:fb'};
const make=()=>{const replayOwner=new TimelineReplayOwner(),analyticalCompareOwner=new AnalyticalCompareOwner();
  const domain=new W03ResultsDomain({records,timelineReplayOwner:replayOwner,analyticalCompareOwner});
  const surface=composeResultsSurface({domain,bus:newBus(),shared:{spatialRelation:{owner:'RelationInteractionOwner'},timelineReplayOwner:replayOwner,analyticalCompareOwner}});
  return {domain,surface,replayOwner,analyticalCompareOwner}};

/* ------------------------------------------------------------------ N1 */
await run('N1.non-owned-route-commands-refused',()=>{
  const {surface}=make();
  const ids=['reviews.decide','reviews.supersede','evidence.admission','mastery.record','releases.compare','rq.compare'];
  const refused=ids.map(id=>({id,availability:surface.bus.availability(id,{}),execution:surface.bus.execute(id,{})}));
  for(const item of refused){
    assert.equal(item.availability.enabled,false,`${item.id} must not be available on the Results bus`);
    assert.equal(item.availability.code,'UNKNOWN_COMMAND',`${item.id} must be unknown to the Results bus`);
    assert.equal(item.execution.ok,false,`${item.id} must be refused on execution`);
  }
  return {refusedCommands:refused.length,ids};
});

/* ------------------------------------------------------------------ N2 */
await run('N2.boundary-input-safe',()=>{
  const {domain,surface,replayOwner}=make();
  throws(()=>domain.replayResult({resultId:'',revisionId:'r1',manifestDigest:'x'}),/RESULT_ID_REQUIRED/);
  throws(()=>domain.replayResult({resultId:'FZ-A',revisionId:'r1',manifestDigest:'WRONG'}),/RESULT_MANIFEST_DIGEST_REVISION_CONTRADICTION/);
  throws(()=>domain.replayResult({resultId:'NOPE',revisionId:'r9',manifestDigest:'sha256:x'}),/RESULT_REVISION_ABSENT/);
  throws(()=>domain.annotate({ref:refA,text:'x',expectedRevision:-1,state:'SAVED'}),/RESULT_AAR_EXPECTED_REVISION_INVALID/);
  throws(()=>domain.annotate({ref:refA,text:'x',expectedRevision:0,state:'PUBLISHED'}),/RESULT_AAR_STATE_INVALID/);
  throws(()=>domain.annotate({ref:refA,text:'x',expectedRevision:0,state:'SAVED',anchoredEventRefs:['not-recorded']}),/RESULT_AAR_EVENT_REF_ABSENT/);
  throws(()=>new W03ResultsDomain({records:[{...records[0],sealed:false}],timelineReplayOwner:replayOwner,analyticalCompareOwner:new AnalyticalCompareOwner()}),/RESULT_REVISION_NOT_SEALED/);
  throws(()=>new W03ResultsDomain({records,providerState:'SOMETIMES',timelineReplayOwner:replayOwner,analyticalCompareOwner:new AnalyticalCompareOwner()}),/RESULTS_PROVIDER_STATE_INVALID/);
  domain.replayResult(refA);
  const zero=domain.step(0),nan=domain.step(Number('not-a-number'));
  assert.equal(zero.accepted,false);assert.equal(zero.code,'TIMELINE_STEP_INVALID');
  assert.equal(nan.accepted,false);assert.equal(nan.code,'TIMELINE_STEP_INVALID');
  assert.equal(domain.replayState().index,0,'boundary steps must not move the cursor');
  assert.equal(surface.bus.availability('results.compare',{left:refA}).code,'RESULT_PAIR_REQUIRED');
  assert.equal(surface.bus.availability('results.step',{}).enabled,true);
  return {boundaryRefusals:true,cursorPreserved:domain.replayState().index};
});

/* ------------------------------------------------------------------ N3 */
await run('N3.provider-absent-truthful-no-synthetic-timeline',()=>{
  const replayOwner=new TimelineReplayOwner(),analyticalCompareOwner=new AnalyticalCompareOwner();
  const domain=new W03ResultsDomain({records:[],timelineReplayOwner:replayOwner,analyticalCompareOwner});
  const surface=composeResultsSurface({domain,bus:newBus(),shared:{spatialRelation:{owner:'RelationInteractionOwner'},timelineReplayOwner:replayOwner,analyticalCompareOwner}});
  assert.equal(domain.providerAvailability().state,'UNAVAILABLE');
  assert.equal(domain.providerAvailability().enabled,false);
  assert.deepEqual(domain.listResults(),[]);
  assert.equal(domain.replayState().state,'IDLE');
  assert.equal(domain.replayState().timelineStatus,'UNAVAILABLE');
  assert.equal(domain.replayState().total,0);
  assert.equal(replayOwner.project().timeline.status,'UNAVAILABLE','no timeline data may exist without a provider');
  assert.equal(replayOwner.project().events.length,0);
  throws(()=>domain.recordedTimeline(refA),/RESULT_REVISION_ABSENT/);
  throws(()=>domain.aarProjection(refA),/RESULT_REVISION_ABSENT/);
  const replay=surface.bus.execute('results.replay',{ref:refA});
  assert.equal(replay.ok,false,`unavailable provider must refuse, got ${JSON.stringify(replay)}`);
  assert.equal(replay.code,'RESULTS_PROVIDER_UNAVAILABLE');
  assert.equal(domain.replayState().state,'IDLE','a refused replay must leave no timeline state');
  return {providerState:'UNAVAILABLE',syntheticEvents:0,refusedWith:replay.code};
});

/* ------------------------------------------------------------------ L1 */
await run('L1.replay-mutates-nothing-canonical-hash',()=>{
  const {domain,surface,replayOwner}=make();
  const canonicalBefore=sha({records:domain.records,list:domain.listResults(),aar:[...domain.aar.entries()]});
  const rawBefore=JSON.stringify(records);
  surface.bus.execute('results.replay',{ref:refA});
  for(let i=0;i<5;i++)surface.bus.execute('results.step',{delta:1});
  surface.bus.execute('results.step',{delta:-1});
  replayOwner.scrubToFraction(0.5);
  replayOwner.selectEvent('ev-2');
  surface.bus.execute('results.compare',{left:refA,right:refB});
  const canonicalAfter=sha({records:domain.records,list:domain.listResults(),aar:[...domain.aar.entries()]});
  assert.equal(canonicalBefore,canonicalAfter,'replay/scrub/compare changed canonical Results truth');
  assert.equal(JSON.stringify(records),rawBefore,'replay mutated the source records');
  assert.equal(domain.replayState().replayExecutesRuntime,false);
  assert.equal(domain.replayState().historicalTerminalBytesInert,true);
  return {canonicalHash:canonicalBefore,identical:true};
});

/* ------------------------------------------------------------------ L2 */
await run('L2.timeline-replay-owner-single-instance',async()=>{
  const srcRoot=new URL('../../stack/native-typescript/',import.meta.url);
  const files=[];
  const walk=async dir=>{for(const entry of await readdir(dir,{withFileTypes:true})){
    if(entry.name==='node_modules')continue;
    if(entry.isDirectory())await walk(new URL(`${entry.name}/`,dir));
    else if(entry.name.endsWith('.ts'))files.push(new URL(entry.name,dir));
  }};
  await walk(srcRoot);
  const instantiations=[];
  for(const file of files.filter(file=>!file.pathname.includes('/tests/'))){
    const text=await readFile(file,'utf8');
    for(const match of text.matchAll(/new\s+TimelineReplayOwner\s*\(/g))instantiations.push(file.pathname.replace(srcRoot.pathname,''));
  }
  assert.equal(instantiations.length,1,`exactly one production TimelineReplayOwner instantiation expected, found ${instantiations.join(', ')}`);
  assert.match(instantiations[0],/main\.ts$/);
  const domain=new W03ResultsDomain({records,timelineReplayOwner:new TimelineReplayOwner(),analyticalCompareOwner:new AnalyticalCompareOwner()});
  assert.equal('replay' in domain,false,'no second local replay engine');
  return {count:instantiations.length,instantiations};
});

/* ------------------------------------------------------------------ L3 */
await run('L3.no-review-authority-acquired',()=>{
  const {domain,surface}=make();
  for(const method of ['decide','reviewDecision','issueDecision','admit','recordMastery']){
    assert.equal(typeof domain[method],'undefined',`Results domain must not expose ${method}()`);
  }
  const attempt=surface.bus.execute('reviews.decide',{decision:{outcome:'ACCEPTED'}});
  assert.equal(attempt.ok,false);assert.equal(attempt.code,'UNKNOWN_COMMAND');
  const handoff=surface.bus.execute('results.handoff',{ref:refA});
  assert.equal(handoff.reviewDecisionPerformed,false);
  assert.equal(handoff.formalAdmissionPerformed,false);
  assert.equal(surface.truthCeiling.reviewDecision,false);
  assert.equal(surface.truthCeiling.evidenceAdmission,false);
  assert.equal(surface.truthCeiling.auditAuthority,false);
  assert.equal(surface.truthCeiling.masteryMutation,false);
  return {reviewAuthority:false,refusedWith:attempt.code};
});

/* ------------------------------------------------------------------ L4 */
await run('L4.analytical-compare-uses-injected-owner-never-local-fallback',()=>{
  const injected=new AnalyticalCompareOwner(),replayOwner=new TimelineReplayOwner();
  throws(()=>new W03ResultsDomain({records,timelineReplayOwner:replayOwner}),/RESULTS_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED/);
  throws(()=>new W03ResultsDomain({records,analyticalCompareOwner:injected}),/RESULTS_SHARED_TIMELINE_REPLAY_OWNER_REQUIRED/);
  const domain=new W03ResultsDomain({records,timelineReplayOwner:replayOwner,analyticalCompareOwner:injected});
  assert.equal(domain.compareOwner,injected,'domain must keep the injected compare owner instance');
  assert.equal(domain.replayOwner,replayOwner,'domain must keep the injected replay owner instance');
  assert.equal(injected.providerIds().includes('results.sealed-result.compare'),true,'provider registered on the injected owner');
  const surface=composeResultsSurface({domain,bus:newBus(),shared:{spatialRelation:{owner:'RelationInteractionOwner'},timelineReplayOwner:replayOwner,analyticalCompareOwner:injected}});
  const compare=surface.bus.execute('results.compare',{left:refA,right:refB});
  assert.equal(compare.receipt.owner,'AnalyticalCompareOwner');
  assert.equal(compare.receipt.ownerToken,'AnalyticalCompare');
  const shared={spatialRelation:{owner:'RelationInteractionOwner'}};
  throws(()=>composeResultsSurface({domain,bus:newBus(),shared:{...shared,timelineReplayOwner:new TimelineReplayOwner(),analyticalCompareOwner:injected}}),/RESULTS_TIMELINE_REPLAY_OWNER_SPLIT/);
  throws(()=>composeResultsSurface({domain,bus:newBus(),shared:{...shared,timelineReplayOwner:replayOwner,analyticalCompareOwner:new AnalyticalCompareOwner()}}),/RESULTS_ANALYTICAL_COMPARE_OWNER_SPLIT/);
  return {injectedInstance:true,splitRefused:true,compareOwner:compare.receipt.owner};
});

const report={lane:'RES-1',surface:'results',pass:rows.filter(r=>r.status==='PASS').length,fail:rows.filter(r=>r.status==='FAIL').length,rows};
console.log(JSON.stringify(report,null,2));
if(report.fail)process.exitCode=1;
