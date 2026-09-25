import assert from 'node:assert/strict';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {AuditProvenanceInteractionCore} from '../../../foundation/audit/provenance.js';
import {W04MasteryDomain,MASTERY_JUDGMENTS,MASTERY_FRESHNESS,createMasteryCompareProvider,createW04MasteryDemoRecords} from '../../../adapters/mastery/domain.js';
import {W04PortfolioDomain,createPortfolioCompareProvider,createW04PortfolioDemoRecords} from '../../../adapters/portfolio/domain.js';
import {createMasterySurfaceComposition} from '../../../surfaces/mastery/composition.js';
import {createPortfolioSurfaceComposition} from '../../../surfaces/portfolio/composition.js';

const snapshot=value=>JSON.stringify(value);

// Mastery: A03 causal law, vocabulary and immutable local projection.
const basisResolver={readEvidence:ref=>ref==='ev-missing@r9'?null:{state:'RESOLVED'},readDecision:()=>({state:'RESOLVED'}),readPolicy:()=>({state:'RESOLVED'})};
const mastery=new W04MasteryDomain(createW04MasteryDemoRecords(),{basisResolver});
for(const row of mastery.records){assert.ok(MASTERY_JUDGMENTS.includes(row.judgment));assert.ok(MASTERY_FRESHNESS.includes(row.freshness));}
const beforeMastery=snapshot(mastery.snapshot());
const noEvaluator=mastery.reevaluate('mastery-crypto',{completionPercent:100,activityCount:999,nextJudgment:'NOT_MASTERED'});
assert.equal(noEvaluator.code,'AUTHORIZED_EVALUATOR_UNBOUND');assert.equal(noEvaluator.mutated,false);assert.equal(snapshot(mastery.snapshot()),beforeMastery);
const conflict=mastery.reevaluate('mastery-crypto',{conflictingDecisions:true});assert.equal(conflict.code,'CONFLICT_REQUIRES_GOVERNED_EVALUATION');assert.equal(conflict.mutated,false);assert.equal(snapshot(mastery.snapshot()),beforeMastery);
const blockedFreshness=mastery.setFreshness('mastery-crypto','CURRENT');assert.equal(blockedFreshness.code,'CANONICAL_MASTERY_WRITE_FORBIDDEN');assert.equal(snapshot(mastery.snapshot()),beforeMastery);
const missingDomain=new W04MasteryDomain([{id:'m-missing',revisionId:'mr-9',subject:'user:self',capability:'forensics',judgment:'INSUFFICIENT_EVIDENCE',freshness:'CURRENT',policyRef:'policy:v9',basis:{evidenceRefs:['ev-missing@r9'],decisionRefs:['decision-9'],digest:'basis:missing'}}],{basisResolver});
const explanation=missingDomain.explain('m-missing');assert.deepEqual(explanation.missingRefs,['ev-missing@r9']);assert.equal(explanation.completionOrActivityUsed,false);
let evaluatorRequests=0;const evaluator={descriptor:()=>({providerId:'authorized.mastery.evaluator',revision:'eval-policy-r4',authority:'AUTHORIZED_MASTERY_EVALUATOR'}),requestEvaluation:req=>{evaluatorRequests++;return {accepted:true,requestId:req.requestId};}};
const delegated=new W04MasteryDomain(createW04MasteryDemoRecords(),{basisResolver,evaluator});const delegatedBefore=snapshot(delegated.records);const request=delegated.reevaluate('mastery-crypto',{trigger:'OWNER_REQUEST'});assert.equal(request.code,'EVALUATION_REQUESTED');assert.equal(request.mutated,false);assert.equal(evaluatorRequests,1);assert.equal(snapshot(delegated.records),delegatedBefore);assert.equal(request.request.completionOrActivityInputsAccepted,false);

// Mastery shared-family consumer contracts: compare + provenance + typed composition.
const masteryComposition=createMasterySurfaceComposition({domain:mastery});assert.equal(masteryComposition.slots.CENTER,'ExplainabilityProjectionWorkbench');assert.equal(masteryComposition.truth.masteryFromCompletion,false);assert.equal(masteryComposition.compareProvider.descriptor().providerId,'w04.mastery.analysis');
const masteryProvenance=new AuditProvenanceInteractionCore(masteryComposition.provenanceProvider);const mp=masteryProvenance.refresh({id:'mastery-crypto'});assert.equal(mp.state,'READY');assert.ok(mp.entries.some(e=>e.kind==='EVIDENCE_REVISION_REF'));assert.ok(mp.entries.some(e=>e.kind==='REVIEW_DECISION_REF'));
const masteryCompareOwner=new AnalyticalCompareOwner(),masteryProvider=createMasteryCompareProvider(mastery);masteryCompareOwner.registerProvider(masteryProvider);const [ma,mb]=mastery.records;const masteryPair=masteryCompareOwner.createPair({left:{providerId:masteryProvider.descriptor().providerId,ref:{id:ma.id,revisionId:ma.revisionId}},right:{providerId:masteryProvider.descriptor().providerId,ref:{id:mb.id,revisionId:mb.revisionId}}});assert.notEqual(masteryCompareOwner.comparePair(masteryPair).state,'ERROR');

// Portfolio: curation only, canonical source preservation, CAS and unresolved grouping authority.
const sourceStore=new Map([['ev-beta@evr-002',{digest:'sha256:evidence-beta',rowCount:17}],['mastery-crypto@mr-001',{digest:'sha256:mastery-crypto',rowCount:1}]]);const sourceResolver={inspect:ref=>structuredClone(sourceStore.get(ref))};
const portfolio=new W04PortfolioDomain(createW04PortfolioDemoRecords(),{sourceResolver});assert.ok(portfolio.records.every(r=>r.groupingRef===null));assert.ok(portfolio.records.every(r=>r.groupingState==='AUTHORITY_PENDING'));
const member=portfolio.get('member-1'),beforeGroup=snapshot(member);const lockedCallerShape=portfolio.group(member.id,'grp-evidence');assert.equal(lockedCallerShape.code,'AUTHORITY_DECISION_REQUIRED');const unresolved=portfolio.group(member.id,'grp-project-example',{expectedRevisionId:member.revisionId});assert.equal(unresolved.code,'AUTHORITY_DECISION_REQUIRED');assert.equal(snapshot(portfolio.get(member.id)),beforeGroup);
const wrongCas=portfolio.curate({action:'remove',id:'member-1',expectedRevisionId:'wrong'});assert.equal(wrongCas.code,'REVISION_CONFLICT');assert.equal(sourceStore.size,2);
const sourceBefore=snapshot(sourceStore.get('ev-beta@evr-002'));const removed=portfolio.curate({action:'remove',id:'member-1',expectedRevisionId:'pm-001'});assert.equal(removed.sourcePreserved,true);assert.equal(removed.verifiedUnchanged,true);assert.equal(snapshot(sourceStore.get('ev-beta@evr-002')),sourceBefore);
const exported=portfolio.export();assert.equal(exported.canonicalPublication,false);assert.ok(exported.members.every(x=>'sourceRef'in x));assert.equal(JSON.stringify(exported).includes('canonicalEvidence'),false);
const filterBefore=snapshot(portfolio.records);const filtered=portfolio.filter('mastery');assert.equal(filtered.taxonomyCreated,false);assert.equal(snapshot(portfolio.records),filterBefore);

// Grouping becomes writable only through an exact approved registry provider and revision envelope.
const groupingAuthority={descriptor:()=>({providerId:'approved.grouping.registry',registryId:'portfolio-groups',revision:'r7',authority:'APPROVED_GROUPING_REGISTRY'}),resolve:id=>id==='grp-approved-capability'?{state:'APPROVED',id,kind:'Capability'}:{state:'UNKNOWN',id}};
const authorizedPortfolio=new W04PortfolioDomain(createW04PortfolioDemoRecords(),{groupingAuthority,sourceResolver});const target=authorizedPortfolio.get('member-2');const unknown=authorizedPortfolio.group(target.id,'grp-project-example',{expectedRevisionId:target.revisionId});assert.equal(unknown.code,'GROUPING_AUTHORITY_UNAVAILABLE');const grouped=authorizedPortfolio.group(target.id,'grp-approved-capability',{expectedRevisionId:target.revisionId});assert.equal(grouped.ok,true);assert.equal(grouped.record.groupingState,'REGISTRY_BOUND');assert.equal(grouped.receipt.registryRevision,'r7');

// Portfolio shared-family consumers: exact compare + provenance + typed composition without local shared-owner fork.
const portfolioComposition=createPortfolioSurfaceComposition({domain:authorizedPortfolio});assert.equal(portfolioComposition.slots.CENTER,'CurationProjectionWorkbench');assert.equal(portfolioComposition.truth.canonicalSourceCopies,0);assert.equal(portfolioComposition.truth.canonicalSourceDeleteAuthority,false);
const portfolioProvenance=new AuditProvenanceInteractionCore(portfolioComposition.provenanceProvider);assert.equal(portfolioProvenance.refresh({id:'member-2'}).state,'READY');
const portfolioCompareOwner=new AnalyticalCompareOwner(),portfolioProvider=createPortfolioCompareProvider(authorizedPortfolio);portfolioCompareOwner.registerProvider(portfolioProvider);const [pa,pb]=authorizedPortfolio.records;const portfolioPair=portfolioCompareOwner.createPair({left:{providerId:portfolioProvider.descriptor().providerId,ref:{id:pa.id,revisionId:pa.revisionId}},right:{providerId:portfolioProvider.descriptor().providerId,ref:{id:pb.id,revisionId:pb.revisionId}}});assert.notEqual(portfolioCompareOwner.comparePair(portfolioPair).state,'ERROR');

console.log(JSON.stringify({lane:'S15_W04_MASTERY_PORTFOLIO',pass:true,mastery:{localWrites:0,evaluatorRequests,missingRefs:explanation.missingRefs},portfolio:{canonicalSourceWrites:0,unresolvedGrouping:unresolved.code,authorizedGrouping:grouped.receipt.registryRevision},sharedConsumers:{collection:true,analyticalCompare:true,auditProvenance:true,context:true}},null,2));
