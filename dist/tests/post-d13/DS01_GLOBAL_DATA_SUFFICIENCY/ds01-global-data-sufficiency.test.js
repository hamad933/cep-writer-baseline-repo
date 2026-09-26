import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DS01_CLASSIFICATION,DS01_TEST_CLASSIFICATION,DS01_TARGET_SURFACES,createDs01GlobalAcceptanceProfile,describeDs01GlobalAcceptanceProfile} from '../../../fixtures/acceptance-data/ds01-global/index.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {TodayProjectionDomainAdapter} from '../../../adapters/today/domain.js';
import {LearnAdapter} from '../../../adapters/learn.js';
import {RQDomainAdapter} from '../../../adapters/rq/domain.js';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {W04EvidenceDomain} from '../../../adapters/evidence/domain.js';
import {W04ReviewDomain} from '../../../adapters/reviews/domain.js';
import {W04MasteryDomain} from '../../../adapters/mastery/domain.js';
import {W04PortfolioDomain} from '../../../adapters/portfolio/domain.js';

const checks=[];
const check=(name,fn)=>checks.push({name,fn});
const owners=()=>({analyticalCompareOwner:new AnalyticalCompareOwner(),timelineReplayOwner:new TimelineReplayOwner()});

check('descriptor is deterministic and exact 13-target non-production classification',()=>{
  const a=describeDs01GlobalAcceptanceProfile(),b=describeDs01GlobalAcceptanceProfile();
  assert.deepEqual(a,b);assert.equal(a.classification,DS01_CLASSIFICATION);assert.deepEqual(a.targetSurfaces,[...DS01_TARGET_SURFACES]);assert.equal(a.targetSurfaces.length,13);assert.equal(a.defaultProductActivation,false);assert.equal(a.canonicalUserData,false);assert.equal(a.providerAuthority,false);assert.equal(a.persistenceAuthority,false);
});

check('normal defaults remain unseeded/unavailable without DS01 activation',()=>{
  const compare=new AnalyticalCompareOwner(),timeline=new TimelineReplayOwner();
  assert.equal(new TodayProjectionDomainAdapter().project().items.length,0);
  assert.equal(new LearnAdapter().sourceAvailable,false);
  assert.equal(new RQDomainAdapter([],{analyticalCompareOwner:compare,providerAdmitted:false,providerClassification:'UNAVAILABLE'}).providerAvailability().enabled,false);
  assert.equal(new W03ResultsDomain({timelineReplayOwner:timeline,analyticalCompareOwner:compare}).listResults().length,0);
  assert.equal(new W04EvidenceDomain().records.length,0);assert.equal(new W04ReviewDomain().records.length,0);assert.equal(new W04MasteryDomain().records.length,0);assert.equal(new W04PortfolioDomain().records.length,0);
});

check('Today uses source-grounded Balanced6 acceptance providers without canonical writes',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'today',...owners()});
  const adapter=new TodayProjectionDomainAdapter({providers:p.bindings.todayProviders,allowFixtureProviders:true});const projection=adapter.project();
  assert.ok(projection.items.length>=3);assert.notEqual(projection.state,'UNAVAILABLE');assert.equal(p.bindings.todayProviders.every(provider=>provider.descriptor().authority==='LOCAL_ACCEPTANCE_PROJECTION_ONLY'),true);
});

check('Library uses real structured adapter with source-grounded Balanced6 content',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'library',...owners()}),s=p.bindings.library.structured;
  assert.equal(s.owner,'LibraryDomainAdapter');assert.ok(s.snapshot().blocks.length>0);assert.equal(p.bindings.library.classification.includes('NON_PRODUCTION'),true);
});

check('Learn accepts only explicit test source and never infers Mastery',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'learn',...owners()}),learn=p.bindings.learn.learn;
  assert.equal(learn.sourceAvailable,true);assert.equal(learn.learningProgress().mastery,'NOT_INFERRED');assert.equal(learn.practiceAvailability().enabled,true);assert.equal(p.bindings.learn.descriptor.explicitTestSource,true);
});

check('RQ has exact SourceRevision pair and working compare only',async()=>{
  const compare=new AnalyticalCompareOwner();const p=await createDs01GlobalAcceptanceProfile({consumer:'rq',analyticalCompareOwner:compare,timelineReplayOwner:new TimelineReplayOwner()}),d=p.bindings.rqDomain;
  assert.equal(d.records.length,2);const [a,b]=d.records;const r=d.compare({workingAnalysisId:'ds01-rq-analysis',scope:['claim.boundary','claim.scope'],left:{sourceId:a.sourceId,revision:a.revision,digest:a.digest,locator:a.locator},right:{sourceId:b.sourceId,revision:b.revision,digest:b.digest,locator:b.locator}});
  assert.equal(r.ok,true);assert.equal(r.persisted,false);assert.equal(r.formalReview,false);assert.equal(d.saveAnalysisSession('ds01-rq-analysis').persisted,false);assert.equal(d.providerClassification,DS01_TEST_CLASSIFICATION);
});

check('Results exposes two sealed deterministic records, replay/AAR/compare, no runtime execution',async()=>{
  const compare=new AnalyticalCompareOwner(),timeline=new TimelineReplayOwner();const p=await createDs01GlobalAcceptanceProfile({consumer:'results',analyticalCompareOwner:compare,timelineReplayOwner:timeline}),d=p.bindings.resultsDomain,list=d.listResults();
  assert.equal(list.length,2);const replay=d.replayState();assert.equal(replay.replayExecutesRuntime,false);assert.equal(d.aarProjection(list[0].ref).state,'SAVED');const compared=d.compare({left:list[0].ref,right:list[1].ref});assert.notEqual(compared.state,'ERROR');assert.equal(d.handoff({ref:list[0].ref}).candidateEvidenceOnly,true);
});

check('W04 causal family separates Candidate/Evidence/Review/Decision/Mastery/Portfolio truth',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'evidence',...owners()}),w=p.bindings.w04;
  assert.equal(w.evidenceDomain.inspect('ds01-ev-candidate').status,'CANDIDATE');assert.equal(w.evidenceDomain.evidenceRevisions.length,2);
  assert.equal(w.reviewsDomain.get('ds01-review-active').state,'IN_REVIEW');assert.equal(w.reviewsDomain.get('ds01-review-closed').state,'CLOSED');assert.equal(w.reviewsDomain.get('ds01-review-closed').decision.decisionId,'ds01-decision-001');assert.equal(w.reviewAuthorityRegistry.testOnly,true);
  assert.equal(w.masteryDomain.get('ds01-mastery-auth').judgment,'MASTERED');assert.equal(w.masteryDomain.get('ds01-mastery-auth').freshness,'REVALIDATION_REQUIRED');const re=w.masteryDomain.reevaluate('ds01-mastery-auth');assert.equal(re.ok,false);assert.equal(re.code,'AUTHORIZED_EVALUATOR_UNBOUND');
  const pending=w.portfolioDomain.group('ds01-member-evidence','project:fake',{expectedRevisionId:'ds01-pm-001'});assert.equal(pending.code,'AUTHORITY_DECISION_REQUIRED');
  const before=w.portfolioDomain.records.length,removed=w.portfolioDomain.curate({action:'remove',id:'ds01-member-evidence',expectedRevisionId:'ds01-pm-001'});assert.equal(removed.ok,true);assert.equal(removed.sourcePreserved,true);assert.equal(w.portfolioDomain.records.length,before-1);
});

check('Validation uses real adapter and keeps TechnicalFinding separate from formal Review',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'validation',...owners()}),v=p.bindings.w05.overrides.validation,last=v.state.last;
  assert.ok(last);assert.equal(last.status,'TECHNICALLY_INVALID');assert.ok(last.technicalFindings.length>=1);assert.equal(last.technicalFindings.every(x=>x.formalReviewFinding===false),true);assert.equal(v.truth().formalReviewAuthority,false);
});

check('Backup executes package-plan-preview-stage-drill with authority-pending activation only',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'backup',...owners()}),b=p.bindings.w05.overrides.backup,s=b.snapshot(),truth=b.truth();
  assert.equal(s.packages.length,1);assert.equal(s.plan.state,'PLANNED');assert.ok(s.preview.providerReceipt?.ok);assert.ok(s.stage.providerReceipt?.ok);assert.equal(s.lastDrill.status,'STAGED_AND_VERIFIED');assert.equal(s.lastDrill.liveRestored,false);assert.equal(s.lastActivation.status,'AUTHORITY_PENDING');assert.equal(truth.productionDatabaseMutated,false);assert.equal(truth.liveRestored,false);
});

check('Audit uses real W05 hash-chain semantics and keeps annotation separate',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'audit',...owners()}),a=p.bindings.w05.overrides.audit,s=a.snapshot(),truth=a.truth();
  assert.equal(s.events.length,3);assert.equal(s.integrity.status,'VALID_CHAIN');assert.equal(s.annotations.length,1);assert.equal(truth.hashChain,'SHA-256');assert.equal(truth.hashIsEncryption,false);assert.equal(truth.commandReceiptsAreAuditTruth,false);
});

check('Configuration has three observations, validated proposal, no apply authority',async()=>{
  const p=await createDs01GlobalAcceptanceProfile({consumer:'configuration',...owners()}),c=p.bindings.w05.overrides.configuration;
  assert.equal(c.rows().length,3);assert.equal(c.proposal('runtime.retentionDays').state,'VALIDATED');const r=c.requestApply('runtime.retentionDays');assert.equal(r.ok,false);assert.equal(r.code,'AUTHORITY_PENDING');assert.equal(c.diagnosticProjection().settingsBoundary.canDispatchOperationalConfigApply,false);
});

check('profile rebuild is deterministic for stable data identities',async()=>{
  const a=await createDs01GlobalAcceptanceProfile({consumer:'backup',...owners()}),b=await createDs01GlobalAcceptanceProfile({consumer:'backup',...owners()});
  assert.deepEqual(a.bindings.w05.overrides.backup.snapshot(),b.bindings.w05.overrides.backup.snapshot());
  const x=await createDs01GlobalAcceptanceProfile({consumer:'evidence',...owners()}),y=await createDs01GlobalAcceptanceProfile({consumer:'evidence',...owners()});assert.deepEqual(x.bindings.w04.evidenceDomain.snapshot(),y.bindings.w04.evidenceDomain.snapshot());
});

check('activation seam is explicit global test marker, not query/default startup seed',()=>{
  const src=fs.readFileSync(process.cwd()+'/stack/native-typescript/surfaces/m0-controller-composition.ts','utf8');
  assert.ok(src.includes('__CEP_DS01_GLOBAL_ACCEPTANCE__'));assert.ok(src.includes('DS01_CLASSIFICATION'));assert.equal(/URLSearchParams\([^)]*\).*DS01|ds01[^\n]*location\.search/i.test(src),false);assert.equal(src.includes("globalThis.__CEP_DS01_GLOBAL_ACCEPTANCE__="),false);
});

let failed=0;
for(const t of checks){try{await t.fn();console.log('PASS',t.name)}catch(error){failed++;console.error('FAIL',t.name,error?.stack||error)}}
console.log(JSON.stringify({suite:'DS01_GLOBAL_DATA_SUFFICIENCY',pass:checks.length-failed,fail:failed,total:checks.length,classification:DS01_CLASSIFICATION}));
if(failed)process.exit(1);
