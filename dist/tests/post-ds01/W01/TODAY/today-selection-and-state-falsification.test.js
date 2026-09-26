import assert from 'node:assert/strict';
import {TodayProjectionDomainAdapter} from '../../../../adapters/today/domain.js';
import {createBalanced6TodayProviders} from '../../../../adapters/today/acceptance-data.js';

const unbound=new TodayProjectionDomainAdapter();
const unavailable=unbound.project();
assert.equal(unavailable.state,'UNAVAILABLE');
assert.equal(unavailable.sourceTotalCount,0);
assert.equal(unavailable.visibleCount,0);
assert.equal(unavailable.canonicalWrites,false);
assert.equal(unavailable.mastery,'NOT_INFERRED__W04_OWNED');
assert.equal(unavailable.accessAuthority,'NOT_OWNED_BY_TODAY');

const adapter=new TodayProjectionDomainAdapter({providers:createBalanced6TodayProviders(),allowFixtureProviders:true});
const populated=adapter.project();
assert.equal(populated.state,'AVAILABLE_DATA');
assert.equal(populated.sourceTotalCount,16);
assert.equal(adapter.selectedRecommendation,null,'render-independent adapter state must not preselect a recommendation');

const recommendation=populated.items.find(item=>item.kind==='RECOMMENDATION');
assert.ok(recommendation?.recommendation?.version);
assert.equal(adapter.canExplain(recommendation.id,recommendation.recommendation.version).code,'RECOMMENDATION_NOT_SELECTED');
assert.deepEqual(adapter.selectRecommendation(recommendation.id,'wrong-version'),{ok:false,status:'RECOMMENDATION_PROVENANCE_UNRESOLVED',mutated:false});
assert.equal(adapter.selectedRecommendation,null);

const selected=adapter.selectRecommendation(recommendation.id,recommendation.recommendation.version);
assert.equal(selected.ok,true);
assert.equal(selected.mutated,false);
assert.equal(adapter.canExplain(recommendation.id,recommendation.recommendation.version).enabled,true);
assert.equal(adapter.canExplain(recommendation.id,'wrong-version').code,'RECOMMENDATION_VERSION_UNRESOLVED');
const rationale=adapter.why(recommendation.id,recommendation.recommendation.version);
assert.equal(rationale.ok,true);
assert.equal(rationale.mutated,false);
assert.equal(rationale.unlockLogicFabricated,false);
assert.equal(rationale.accessDecisionMade,false);
assert.equal(rationale.sourceBinding.providerId,recommendation.providerId);
assert.equal(rationale.sourceBinding.sourceRef,recommendation.recommendation.sourceRef);
assert.equal(rationale.sourceBinding.version,recommendation.recommendation.version);
assert.equal(rationale.sourceBinding.observedAt,recommendation.recommendation.observedAt);

const oneRecommendationProvider={
  id:'today.test.filtered-empty-provider',
  read:()=>({
    providerId:'today.test.filtered-empty-provider',
    state:'AVAILABLE_DATA',
    observedAt:'2026-09-26T12:00:00Z',
    items:[{
      id:'only-rec',kind:'RECOMMENDATION',title:'Only recommendation',
      recommendation:{sourceRef:'test:only-rec',version:'v-test',reasonCode:'TEST_ONLY',rationale:'Test-only rationale'}
    }]
  }),
  descriptor:()=>({providerId:'today.test.filtered-empty-provider',authority:'TEST_ONLY_FALSIFICATION'})
};
const filteredAdapter=new TodayProjectionDomainAdapter({providers:[oneRecommendationProvider]});
const beforeFilter=filteredAdapter.project();
assert.equal(beforeFilter.sourceTotalCount,1);
filteredAdapter.setFilter('ATTENTION');
const filteredEmpty=filteredAdapter.project();
assert.equal(filteredEmpty.state,'AVAILABLE_DATA');
assert.equal(filteredEmpty.viewState,'FILTERED_EMPTY');
assert.equal(filteredEmpty.filteredEmpty,true);
assert.equal(filteredEmpty.sourceTotalCount,1,'filtering must not rewrite source totals');
assert.equal(filteredEmpty.visibleCount,0);
assert.equal(filteredEmpty.canonicalWrites,false);

console.log('TODAY_SELECTION_AND_STATE_FALSIFICATION_PASS');
