import assert from 'node:assert/strict';
import {TodayProjectionDomainAdapter,TODAY_PROJECTION_STATES,TODAY_CONTINUATION_STATES} from '../../dist/adapters/today/domain.js';
import {createBalanced6TodayProviders} from '../../dist/adapters/today/acceptance-data.js';

const results=[];
const test=(id,fn)=>{try{fn();results.push({id,status:'PASS'});}catch(error){results.push({id,status:'FAIL',error:String(error?.stack||error)});}};
const observedAt='2026-09-22T05:30:00Z';
const baseItem=(overrides={})=>({
  id:'session-current-1',kind:'CONTINUE_SESSION',title:'Current session',
  continuation:{destination:'learn',objectId:'lesson-current-1',exists:true,readable:true,targetState:'RESOLVABLE'},
  ...overrides
});
const provider=({id='current.today.provider',state='AVAILABLE_DATA',items=[baseItem()],at=observedAt,reason='CURRENT_OBSERVATION',read=null}={})=>({
  id,
  read:read||(()=>({providerId:id,state,observedAt:at,reason,items:structuredClone(items)})),
  descriptor:()=>({providerId:id,authority:'ADMITTED_CURRENT_PROVIDER_HARNESS'})
});
const resolver=({state='RESOLVABLE',destination='learn',objectId='lesson-current-1',providerId='current.target.resolver',at=observedAt,resolutionRef='resolution:1',authority='ADMITTED_CURRENT_RESOLVER_HARNESS'}={})=>({
  resolve:()=>({state,destination,objectId,providerId,observedAt:at,resolutionRef}),
  descriptor:()=>({providerId,authority})
});

test('F006.normal-default-provider-unbound',()=>{
  const a=new TodayProjectionDomainAdapter(); const p=a.project();
  assert.equal(p.state,'UNAVAILABLE'); assert.equal(p.items.length,0); assert.equal(p.sources.length,1);
  assert.equal(p.sources[0].reason,'TODAY_PROVIDER_UNBOUND');
});

test('F006.acceptance-provider-rejected-by-default',()=>{
  const a=new TodayProjectionDomainAdapter({providers:createBalanced6TodayProviders()}); const p=a.project();
  assert.equal(p.state,'UNAVAILABLE'); assert.equal(p.items.length,0);
  assert.equal(p.sources[0].reason,'TODAY_FIXTURE_PROVIDER_NOT_ADMITTED');
  assert.equal(a.descriptor().providerCount,0); assert.equal(a.descriptor().rejectedProviderIds.length,1);
});

test('F007.fixture-resolvable-assertions-cannot-enable-resume',()=>{
  const a=new TodayProjectionDomainAdapter({providers:createBalanced6TodayProviders(),allowFixtureProviders:true}); const p=a.project();
  const item=p.items.find(x=>x.continuation);
  assert.ok(item); assert.equal(item.continuation.exists,true); assert.equal(item.continuation.readable,true); assert.equal(item.continuation.targetState,'RESOLVABLE');
  const avail=a.canResume(item.id); assert.equal(avail.enabled,false); assert.equal(avail.code,'CONTINUATION_RESOLVER_UNBOUND');
  const handoff=a.resume(item.id); assert.equal(handoff.ok,false); assert.equal(handoff.mutated,false); assert.equal(handoff.progressMutation,false); assert.equal(handoff.masteryMutation,false); assert.equal(handoff.accessDecisionMade,false);
});

test('F007.fixture-resolver-rejected-by-default',()=>{
  const fake=resolver({authority:'LOCAL_ACCEPTANCE_PROJECTION_ONLY'});
  const a=new TodayProjectionDomainAdapter({providers:[provider()],continuationResolver:fake}); a.project();
  const avail=a.canResume('session-current-1'); assert.equal(avail.enabled,false); assert.equal(avail.code,'CONTINUATION_FIXTURE_RESOLVER_NOT_ADMITTED');
});

test('F007.removed-target-disabled-with-proof',()=>{
  const a=new TodayProjectionDomainAdapter({providers:[provider()],continuationResolver:resolver({state:'TARGET_REMOVED'})}); a.project();
  const avail=a.canResume('session-current-1'); assert.equal(avail.enabled,false); assert.equal(avail.code,'CONTINUATION_TARGET_REMOVED');
});

test('F007.forbidden-target-disabled-with-proof',()=>{
  const a=new TodayProjectionDomainAdapter({providers:[provider()],continuationResolver:resolver({state:'TARGET_FORBIDDEN'})}); a.project();
  const avail=a.canResume('session-current-1'); assert.equal(avail.enabled,false); assert.equal(avail.code,'CONTINUATION_TARGET_FORBIDDEN');
});

test('F007.missing-resolution-proof-disabled',()=>{
  const a=new TodayProjectionDomainAdapter({providers:[provider()],continuationResolver:resolver({resolutionRef:''})}); a.project();
  const avail=a.canResume('session-current-1'); assert.equal(avail.enabled,false); assert.equal(avail.code,'CONTINUATION_RESOLUTION_PROOF_INCOMPLETE');
});

test('F007.exact-current-resolution-enables-handoff-only',()=>{
  const a=new TodayProjectionDomainAdapter({providers:[provider()],continuationResolver:resolver()}); a.project();
  const avail=a.canResume('session-current-1'); assert.equal(avail.enabled,true); assert.equal(avail.resolution.resolutionRef,'resolution:1');
  const out=a.resume('session-current-1'); assert.equal(out.ok,true); assert.equal(out.status,'CONTINUATION_READY'); assert.equal(out.mutated,false); assert.equal(out.progressMutation,false); assert.equal(out.masteryMutation,false); assert.equal(out.accessDecisionMade,false);
});

test('F007.exact-target-mismatch-disabled',()=>{
  const a=new TodayProjectionDomainAdapter({providers:[provider()],continuationResolver:resolver({objectId:'different-target'})}); a.project();
  const avail=a.canResume('session-current-1'); assert.equal(avail.enabled,false); assert.equal(avail.code,'CONTINUATION_TARGET_MISMATCH');
});

test('F008.recommendation-provenance-source-version-observedAt-bound',()=>{
  let version='v1',sourceRef='source:one';
  const id='current.rec.provider';
  const p=provider({id,read:()=>({providerId:id,state:'AVAILABLE_DATA',observedAt,items:[{id:'rec-1',kind:'RECOMMENDATION',title:'Bound recommendation',recommendation:{sourceRef,version,reasonCode:'NEXT_BOUND_STEP'}}]})});
  const a=new TodayProjectionDomainAdapter({providers:[p]}); a.project();
  const selected=a.selectRecommendation('rec-1','v1'); assert.equal(selected.ok,true); assert.equal(selected.sourceRef,'source:one'); assert.equal(selected.providerId,id); assert.equal(selected.observedAt,observedAt);
  const why=a.why('rec-1','v1'); assert.equal(why.ok,true); assert.deepEqual(why.sourceBinding,{providerId:id,sourceRef:'source:one',version:'v1',observedAt}); assert.equal(why.accessDecisionMade,false);
  version='v2'; sourceRef='source:two'; a.refresh();
  const old=a.why('rec-1','v1'); assert.equal(old.ok,false); assert.ok(['RECOMMENDATION_NOT_SELECTED','RECOMMENDATION_VERSION_UNRESOLVED','RECOMMENDATION_PROVENANCE_MISMATCH'].includes(old.status));
});

test('F008.missing-recommendation-provenance-disables-why',()=>{
  const p=provider({items:[{id:'rec-missing',kind:'RECOMMENDATION',recommendation:{version:'v1',reasonCode:'X'}}]});
  const a=new TodayProjectionDomainAdapter({providers:[p]}); a.project();
  assert.equal(a.selectRecommendation('rec-missing','v1').ok,false); assert.equal(a.why('rec-missing','v1').ok,false);
});

test('F009.profile-vocabulary-exact',()=>{
  assert.deepEqual([...TODAY_PROJECTION_STATES],['FETCHING','AVAILABLE_DATA','AVAILABLE_EMPTY','PARTIAL','STALE','UNAVAILABLE','ERROR']);
  assert.deepEqual([...TODAY_CONTINUATION_STATES],['RESOLVABLE','TARGET_REMOVED','TARGET_FORBIDDEN']);
  assert.deepEqual([...new TodayProjectionDomainAdapter().descriptor().states],[...TODAY_PROJECTION_STATES]);
});

test('F009.legacy-state-is-not-silently-normalized',()=>{
  const legacy=provider({read:()=>({providerId:'legacy.provider',state:'OBSERVED_DATA',observedAt,items:[baseItem()]})});
  legacy.id='legacy.provider';
  const a=new TodayProjectionDomainAdapter({providers:[legacy]}); const p=a.project();
  assert.equal(p.state,'ERROR'); assert.equal(p.sources[0].reason,'TODAY_PROVIDER_STATE_INVALID'); assert.equal(p.items.length,0);
});

test('F010.failed-refresh-retains-last-success',()=>{
  let fail=false; const id='current.mutable.provider';
  const p=provider({id,read:()=>{if(fail)throw Error('sensitive upstream detail'); return {providerId:id,state:'AVAILABLE_DATA',observedAt,items:[baseItem()]};}});
  const a=new TodayProjectionDomainAdapter({providers:[p]}); const first=a.project(); assert.equal(first.state,'AVAILABLE_DATA'); assert.equal(first.items.length,1);
  fail=true; const second=a.refresh(); assert.equal(second.state,'ERROR'); assert.equal(second.retainedFromLastSuccess,true); assert.equal(second.items.length,1); assert.equal(second.items[0].retainedStale,true); assert.equal(second.sources[0].state,'ERROR'); assert.ok(second.sources[0].errorRef.startsWith('today-error:')); assert.equal(second.errorRefs.length,1); assert.equal(second.retainedSources[0].observedAt,observedAt);
});

test('F010.partial-provider-failure-retains-failed-provider-last-success',()=>{
  let failA=false; const aId='provider.a',bId='provider.b';
  const pa=provider({id:aId,read:()=>{if(failA)throw Error('x'); return {providerId:aId,state:'AVAILABLE_DATA',observedAt,items:[baseItem({id:'a-item'})]};}});
  const pb=provider({id:bId,items:[{id:'b-item',kind:'RECENT_CONTEXT',title:'B'}]});
  const a=new TodayProjectionDomainAdapter({providers:[pa,pb]}); a.project(); failA=true; const p=a.refresh();
  assert.equal(p.state,'PARTIAL'); assert.ok(p.items.some(x=>x.id==='a-item'&&x.retainedStale)); assert.ok(p.items.some(x=>x.id==='b-item')); assert.deepEqual(p.retainedSourceProviderIds,[aId]);
});

test('F011.stale-unavailable-error-distinguishable-source-specific',()=>{
  const stale=provider({id:'stale.provider',state:'STALE',at:'2026-09-21T08:00:00Z',items:[{id:'stale-ctx',kind:'RECENT_CONTEXT',title:'Old'}]});
  const unavailable=provider({id:'unavailable.provider',state:'UNAVAILABLE',at:'2026-09-22T05:20:00Z',items:[],reason:'AUTH_UNAVAILABLE'});
  const failed=provider({id:'error.provider',read:()=>{throw Error('private provider exception')}});
  const a=new TodayProjectionDomainAdapter({providers:[stale,unavailable,failed]}); const p=a.project();
  const byId=Object.fromEntries(p.sources.map(x=>[x.providerId,x]));
  assert.equal(byId['stale.provider'].state,'STALE'); assert.equal(byId['stale.provider'].observedAt,'2026-09-21T08:00:00Z');
  assert.equal(byId['unavailable.provider'].state,'UNAVAILABLE'); assert.equal(byId['unavailable.provider'].reason,'AUTH_UNAVAILABLE'); assert.equal(byId['unavailable.provider'].observedAt,'2026-09-22T05:20:00Z');
  assert.equal(byId['error.provider'].state,'ERROR'); assert.ok(byId['error.provider'].errorRef); assert.equal(byId['error.provider'].reason,'TODAY_PROVIDER_READ_FAILED');
  assert.equal(p.state,'PARTIAL');
});

test('F011.stale-without-observedAt-is-not-admitted-as-stale',()=>{
  const missingTime=provider({id:'stale.no-time',state:'STALE',at:null,items:[{id:'stale-no-time-item',kind:'RECENT_CONTEXT',title:'Should not be admitted'}]});
  const a=new TodayProjectionDomainAdapter({providers:[missingTime]}); const p=a.project();
  assert.equal(p.state,'ERROR'); assert.equal(p.items.length,0); assert.equal(p.sources.length,1);
  assert.equal(p.sources[0].state,'ERROR'); assert.equal(p.sources[0].reason,'TODAY_STALE_OBSERVED_AT_REQUIRED'); assert.equal(p.sources[0].observedAt,null); assert.ok(p.sources[0].errorRef?.startsWith('today-error:'));
});

test('F044.no-canonical-write-access-mastery-or-progress-fabrication',()=>{
  const a=new TodayProjectionDomainAdapter({providers:[provider()],continuationResolver:resolver()}); const p=a.project(),d=a.descriptor(),r=a.resume('session-current-1');
  assert.equal(d.canonicalWrites,false); assert.equal(d.masteryWrites,false); assert.equal(d.recommendationJudgment,false); assert.equal(d.accessDecisionOwner,false);
  assert.equal(p.canonicalWrites,false); assert.equal(p.progress,'PROJECTED_NOT_OWNED'); assert.equal(p.mastery,'NOT_INFERRED__W04_OWNED'); assert.equal(p.accessAuthority,'NOT_OWNED_BY_TODAY');
  assert.equal(r.mutated,false); assert.equal(r.progressMutation,false); assert.equal(r.masteryMutation,false); assert.equal(r.accessDecisionMade,false);
});

const failed=results.filter(x=>x.status==='FAIL');
console.log(JSON.stringify({verdict:failed.length?'FAIL':'PASS',pass:results.length-failed.length,fail:failed.length,results},null,2));
if(failed.length)process.exit(1);
