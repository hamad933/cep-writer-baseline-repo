import assert from 'node:assert/strict';
import {CommandRegistry} from '../../../dist/foundation/models.js';
import {AnalyticalCompareOwner} from '../../../dist/foundation/analytical/compare.js';
import {RQDomainAdapter} from '../../../dist/adapters/rq/domain.js';
import {bindRqSurface} from '../../../dist/surfaces/rq/surface.js';
/* CKPT-B adjudication (W02): RQDomainAdapter MUST fail closed without the controller-injected
   shared AnalyticalCompareOwner. Bindings: post-c03/D03C `d03c.production-domains-fail-closed-without-shared-owners`
   expects `RQ_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED`; surfaces/m0-controller-composition.ts
   `R6_CENTRAL_ANALYTICAL_COMPARE_REQUIRED`; surfaces/composition/w01-w02-rescue.ts injects the owner;
   shared_ownership_map.md #6 (one AnalyticalCompareOwner, constructed once in main.ts);
   W02 packet §4 (Analytical compare = foundation analytical/compare.ts, W02 owns the rq provider policy).
   The baseline construction without an owner was wrong, not the source. The rq.compare payload also
   needs an explicit non-empty scope (compareAvailability `RQ_COMPARE_SCOPE_REQUIRED`). */
const record=(revision,digest,value,extra={})=>({sourceId:'source-1',revision,digest,locator:`local://source-1/${revision}`,schemaVersion:'rq-source/1',comparable:{title:{label:'Title',type:'string',value}},provenanceRefs:[`rq:${revision}`],...extra});
const left=record('r1','sha-r1','Alpha');
const right=record('r2','sha-r2','Beta',{workingConflict:{classification:'WORKING_DIFFERENCE',rationale:'Analyst comparison only'}});
let ownerRequired=false;
try{new RQDomainAdapter([left,right])}catch(error){ownerRequired=String(error.message).includes('RQ_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED')}
assert.equal(ownerRequired,true,'RQDomainAdapter must fail closed without the shared AnalyticalCompareOwner');
const adapter=new RQDomainAdapter([left,right],{analyticalCompareOwner:new AnalyticalCompareOwner()});
assert.equal(adapter.compareOwner.ownerToken,'AnalyticalCompare');
assert.equal(adapter.compareOwner.owner,'AnalyticalCompareOwner');
const commands=new CommandRegistry();bindRqSurface({commands,adapter});
const ref=x=>({sourceId:x.sourceId,revision:x.revision,digest:x.digest,locator:x.locator});
const payload={sessionId:'s1',scope:['claims'],left:ref(left),right:ref(right)};
const availability=commands.availability('rq.compare',payload);
assert.equal(availability.enabled,true);
const result=commands.execute('rq.compare',payload);
assert.equal(result.status,'DIFFERENT');
assert.equal(result.formalReview,false);
assert.equal(result.persisted,false);
assert.equal(adapter.review('s1').reviewDecisionAuthority,false);
assert.equal(adapter.saveAnalysisSession('s1').status,'RQ_ANALYSIS_SESSION_PERSISTENCE_UNAVAILABLE');
assert.equal(adapter.saveAnalysisSession('s1').persisted,false);
const missing=adapter.compareOwner.createPair({left:{providerId:adapter.providerId,ref:ref(left)},right:{providerId:adapter.providerId,ref:{sourceId:'missing',revision:'r1',digest:'x',locator:'local://missing'}}});
assert.equal(adapter.compareOwner.comparePair(missing).state,'MISSING_RIGHT');
let contradiction=false;try{adapter.compareOwner.createPair({left:{providerId:adapter.providerId,ref:{...ref(left),digest:''}},right:{providerId:adapter.providerId,ref:ref(right)}})}catch{contradiction=true}assert.equal(contradiction,true);
assert.equal(adapter.descriptor().visualReferenceCeiling,'REVIEWED_FINAL_CANDIDATE');
assert.equal(adapter.descriptor().formalReviewAuthority,false);
console.log(JSON.stringify({surface:'rq',status:'PASS',cases:12,persistence:'UNAVAILABLE',formalReviewAuthority:false,sharedCompareOwner:'AnalyticalCompareOwner'}));
