import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createW04RescueComposition,W04_CAUSAL_CHAIN,W04_ROUTE_BINDINGS} from '../../../surfaces/composition/w04-rescue.js';
import {W04EvidenceDomain,createW04EvidenceDemoRecords} from '../../../adapters/evidence/domain.js';
import {W04ReviewDomain,createW04ReviewDemoRecords} from '../../../adapters/reviews/domain.js';
import {W04MasteryDomain,MASTERY_JUDGMENTS,MASTERY_FRESHNESS,createW04MasteryDemoRecords} from '../../../adapters/mastery/domain.js';
import {W04PortfolioDomain,createW04PortfolioDemoRecords} from '../../../adapters/portfolio/domain.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';

const composition=createW04RescueComposition({evidenceDomain:new W04EvidenceDomain(createW04EvidenceDemoRecords()),reviewsDomain:new W04ReviewDomain(createW04ReviewDemoRecords()),masteryDomain:new W04MasteryDomain(createW04MasteryDemoRecords()),portfolioDomain:new W04PortfolioDomain(createW04PortfolioDemoRecords()),analyticalCompareOwner:new AnalyticalCompareOwner()});
assert.deepEqual([...W04_CAUSAL_CHAIN],['Candidate Evidence','Evidence','Review','Decision','Mastery State']);
assert.deepEqual(composition.shared.analyticalProviderIds,['w04.evidence.analysis','w04.mastery.analysis','w04.portfolio.analysis','w04.reviews.analysis']);
assert.equal(composition.evidence.compareOwner,'AnalyticalCompareOwner');assert.equal(composition.reviews.compareOwner,'AnalyticalCompareOwner');
assert.equal(composition.mastery.compareOwner,composition.shared.analyticalCompareOwner);assert.equal(composition.portfolio.compareOwner,composition.shared.analyticalCompareOwner);
assert.equal(composition.evidence.collectionCore.adapter.adapterId,'w04.evidence.collection');assert.equal(composition.reviews.collectionCore.adapter.adapterId,'w04.reviews.collection');
assert.equal(composition.evidence.auditProvenance.boundaryReceipt().mutationApiExposed,false);assert.equal(composition.reviews.auditProvenance.boundaryReceipt().reviewDecisionApiExposed,false);
assert.equal(composition.invariants.finalRouteWiring,'R6_REQUIRED');assert.equal(W04_ROUTE_BINDINGS.mastery.route,'/progress/mastery');

const mastery=new W04MasteryDomain(createW04MasteryDemoRecords());assert.deepEqual([...MASTERY_JUDGMENTS],['NOT_EVALUATED','INSUFFICIENT_EVIDENCE','INCONCLUSIVE','NOT_MASTERED','MASTERED']);assert.deepEqual([...MASTERY_FRESHNESS],['CURRENT','REVALIDATION_REQUIRED']);
const masteryBefore=JSON.stringify(mastery.snapshot()),historyBefore=mastery.history.length;const unbound=mastery.reevaluate('mastery-crypto',{conflictingDecisions:true});assert.equal(unbound.code,'BASIS_UNAVAILABLE');assert.equal(unbound.mutated,false);assert.equal(JSON.stringify(mastery.snapshot()),masteryBefore);assert.equal(mastery.history.length,historyBefore);const resolvedBasis={readEvidence:ref=>({state:'RESOLVED',ref}),readDecision:ref=>({state:'RESOLVED',ref}),readPolicy:ref=>({state:'RESOLVED',ref})};const governedMastery=new W04MasteryDomain(createW04MasteryDemoRecords(),{basisResolver:resolvedBasis});const conflict=governedMastery.reevaluate('mastery-crypto',{conflictingDecisions:true});assert.equal(conflict.code,'CONFLICT_REQUIRES_GOVERNED_EVALUATION');assert.equal(conflict.mutated,false);

const portfolio=new W04PortfolioDomain(createW04PortfolioDemoRecords());const member=portfolio.get('member-1'),before=JSON.stringify(member);const unresolved=portfolio.group(member.id,'project:unresolved',{expectedRevisionId:member.revisionId});assert.equal(unresolved.code,'AUTHORITY_DECISION_REQUIRED');assert.equal(JSON.stringify(portfolio.get(member.id)),before);
const removed=portfolio.curate({action:'remove',id:member.id,expectedRevisionId:member.revisionId});assert.equal(removed.ok,true);assert.equal(removed.sourcePreserved,true);assert.equal(removed.receipt.canonicalSourceWrite,false);

const profile=JSON.parse(readFileSync('profiles/mastery.json','utf8'));assert.deepEqual(profile.state_dimensions.judgment,['NOT_EVALUATED','INSUFFICIENT_EVIDENCE','INCONCLUSIVE','NOT_MASTERED','MASTERED']);assert.deepEqual(profile.state_dimensions.freshness,['CURRENT','REVALIDATION_REQUIRED']);assert.equal(JSON.stringify(profile.state_dimensions).includes('CONFLICTED'),false);assert.equal(JSON.stringify(profile.state_dimensions).includes('STALE'),false);assert.equal(JSON.stringify(profile.state_dimensions).includes('UNKNOWN'),false);
console.log(JSON.stringify({lane:'CG5_W04_COVERAGE',pass:true,providers:composition.shared.analyticalProviderIds,routeWiring:composition.invariants.finalRouteWiring,grouping:composition.invariants.groupingAuthority}));
