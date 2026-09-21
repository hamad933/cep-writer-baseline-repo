import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../dist/foundation/models.js';
import {TodayProjectionDomainAdapter} from '../../../dist/adapters/today/domain.js';
import {bindTodaySurface} from '../../../dist/surfaces/today/surface.js';

const unavailable=new TodayProjectionDomainAdapter();
const empty=unavailable.project();
assert.equal(empty.state,'UNAVAILABLE');
assert.equal(empty.mastery,'NOT_INFERRED');
assert.equal(empty.items.length,0);
assert.equal(unavailable.descriptor().canonicalWrites,false);

const provider={id:'learn-projection',read:()=>({providerId:'learn-projection',state:'AVAILABLE_DATA',observedAt:'2026-09-17T00:00:00Z',items:[{id:'activity-1',title:'Trust boundaries',continuation:{destination:'learn',objectId:'activity-1',bookmark:{blockId:'learn-p1'}},recommendation:{sourceRef:'learn:activity-1',reasonCode:'CONTINUE_IN_PROGRESS',observedAt:'2026-09-17T00:00:00Z'}}]})};
const adapter=new TodayProjectionDomainAdapter({providers:[provider],actorId:'actor-1'});
const commands=new CommandRegistry();
const bound=bindTodaySurface({commands,adapter});
assert.equal(bound.projection.state,'AVAILABLE_DATA');
assert.equal(commands.execute('today.resume',{itemId:'activity-1'}).status,'CONTINUATION_READY');
assert.equal(commands.execute('today.why',{itemId:'activity-1'}).recommendation.reasonCode,'CONTINUE_IN_PROGRESS');
assert.equal(adapter.project().mastery,'NOT_INFERRED');
console.log(JSON.stringify({surface:'today',status:'PASS',cases:8}));
