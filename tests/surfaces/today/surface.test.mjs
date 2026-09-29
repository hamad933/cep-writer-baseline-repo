import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../dist/foundation/models.js';
import {TodayProjectionDomainAdapter} from '../../../dist/adapters/today/domain.js';
import {bindTodaySurface} from '../../../dist/surfaces/today/surface.js';

const unavailable=new TodayProjectionDomainAdapter();
const empty=unavailable.project();
assert.equal(empty.state,'UNAVAILABLE');
// Mastery is never inferred by the Today projection; the epistemic token is suffixed with its
// authority owner. profiles/today.json invariant "Progress is a projection; Mastery is W04-owned",
// surfaces/today/surface.ts masteryAuthority:'W04_OWNED' and the S07 contract
// (s07-contracts.test.ts: projection.mastery === 'NOT_INFERRED__W04_OWNED') are the bindings;
// the bare 'NOT_INFERRED' token belongs to surface-local Learning progress (W02), not Today.
assert.equal(empty.mastery,'NOT_INFERRED__W04_OWNED');
assert.equal(empty.items.length,0);
assert.equal(unavailable.descriptor().canonicalWrites,false);

// Route-fixture shape follows the current adapter contract proven by the S07 rescue contract
// (s07-contracts.test.ts) and the D07 presentation-authority tests:
//  * an item without a recognized `kind` is not projected at all (`_normalizeItem` drops it);
//  * `today.resume` is availability-gated on a bound continuation resolver — Today may never
//    report CONTINUATION_READY without an authoritative target-resolution proof;
//  * `today.why` is availability-gated on an exact, provenance-matched recommendation selection.
const provider={id:'learn-projection',read:()=>({providerId:'learn-projection',state:'AVAILABLE_DATA',observedAt:'2026-09-17T00:00:00Z',items:[{id:'activity-1',kind:'RECOMMENDATION',title:'Trust boundaries',continuation:{destination:'learn',objectId:'activity-1',bookmark:{blockId:'learn-p1'}},recommendation:{sourceRef:'learn:activity-1',reasonCode:'CONTINUE_IN_PROGRESS',version:'rev-7',observedAt:'2026-09-17T00:00:00Z'}}]})};
const continuationResolver={
  descriptor:()=>({providerId:'today-route-resolver',authority:'ROUTE_TEST_CONTINUATION_RESOLVER'}),
  resolve:({destination,objectId})=>({state:'RESOLVABLE',destination,objectId,providerId:'today-route-resolver',observedAt:'2026-09-17T00:00:00Z',resolutionRef:`route-test:${destination}:${objectId}`})
};
const adapter=new TodayProjectionDomainAdapter({providers:[provider],actorId:'actor-1',continuationResolver});
const commands=new CommandRegistry();
const bound=bindTodaySurface({commands,adapter});
assert.equal(bound.projection.state,'AVAILABLE_DATA');
assert.equal(commands.execute('today.resume',{itemId:'activity-1'}).status,'CONTINUATION_READY');
assert.equal(adapter.selectRecommendation('activity-1','rev-7').ok,true);
assert.equal(commands.execute('today.why',{itemId:'activity-1'}).recommendation.reasonCode,'CONTINUE_IN_PROGRESS');
assert.equal(adapter.project().mastery,'NOT_INFERRED__W04_OWNED');
console.log(JSON.stringify({surface:'today',status:'PASS',cases:9}));
