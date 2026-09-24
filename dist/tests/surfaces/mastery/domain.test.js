import assert from 'node:assert/strict';
import {W04MasteryDomain,MASTERY_JUDGMENTS,MASTERY_FRESHNESS,createMasteryCompareProvider} from '../../../adapters/mastery/domain.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';

const d=new W04MasteryDomain(),r=d.inspect('mastery-crypto');
assert.deepEqual([...MASTERY_JUDGMENTS],['NOT_EVALUATED','INSUFFICIENT_EVIDENCE','INCONCLUSIVE','NOT_MASTERED','MASTERED']);
assert.deepEqual([...MASTERY_FRESHNESS],['CURRENT','REVALIDATION_REQUIRED']);
assert.equal(r.judgment,'MASTERED');assert.equal(r.freshness,'REVALIDATION_REQUIRED');
const before=JSON.stringify(d.snapshot()),historyBefore=d.history.length;
const unavailable=d.reevaluate('mastery-crypto',{basisAvailable:false});assert.equal(unavailable.code,'BASIS_UNAVAILABLE');assert.equal(unavailable.mutated,false);assert.equal(JSON.stringify(d.snapshot()),before);assert.equal(d.history.length,historyBefore);
const providerBlocked=d.reevaluate('mastery-crypto',{conflictingDecisions:true});assert.equal(providerBlocked.code,'BASIS_UNAVAILABLE');assert.equal(providerBlocked.mutated,false);assert.equal(JSON.stringify(d.snapshot()),before);assert.equal(d.history.length,historyBefore);const resolvedBasis={readEvidence:ref=>({state:'RESOLVED',ref}),readDecision:ref=>({state:'RESOLVED',ref}),readPolicy:ref=>({state:'RESOLVED',ref})};const dResolved=new W04MasteryDomain(undefined,{basisResolver:resolvedBasis});const conflict=dResolved.reevaluate('mastery-crypto',{conflictingDecisions:true});assert.equal(conflict.code,'CONFLICT_REQUIRES_GOVERNED_EVALUATION');assert.equal(conflict.action,'REQUEST_REVIEW_OR_EVALUATION');assert.equal(conflict.mutated,false);assert.equal(conflict.record.judgment,'MASTERED');
const ac=new AnalyticalCompareOwner(),p=createMasteryCompareProvider(d);ac.registerProvider(p);const a=d.records[0],b=d.records[1],pair=ac.createPair({left:{providerId:p.descriptor().providerId,ref:{id:a.id,revisionId:a.revisionId}},right:{providerId:p.descriptor().providerId,ref:{id:b.id,revisionId:b.revisionId}}});assert.notEqual(ac.comparePair(pair).state,'ERROR');assert.equal(d.persistence.durable,false);
console.log(JSON.stringify({surface:'mastery',pass:true,history:d.history.length,conflict:conflict.code}));
