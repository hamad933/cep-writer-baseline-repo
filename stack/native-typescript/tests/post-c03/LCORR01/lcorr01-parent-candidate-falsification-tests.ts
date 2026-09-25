import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createLibraryRuntimeComposition} from '../../../surfaces/library/runtime-composition.js';
import {createLearnRuntimeComposition} from '../../../adapters/learn.js';
import {W04EvidenceDomain} from '../../../adapters/evidence/domain.js';
import {W04ReviewDomain,ReviewAuthorityRegistry} from '../../../adapters/reviews/domain.js';
import {W04MasteryDomain} from '../../../adapters/mastery/domain.js';
import {W04PortfolioDomain} from '../../../adapters/portfolio/domain.js';
import {createW04RescueComposition} from '../../../surfaces/composition/w04-rescue.js';
import {composeReviewsSurface} from '../../../surfaces/reviews/index.js';
import {SemanticCommandBus} from '../../../foundation/global/commands.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {W03EnterpriseDomain} from '../../../adapters/enterprise/domain.js';
import {composeEnterpriseSurface} from '../../../surfaces/enterprise/index.js';
import {W03ScenarioDomain} from '../../../adapters/scenarios/domain.js';
import {composeScenariosSurface} from '../../../surfaces/scenarios/index.js';
import {W03LabDomain} from '../../../adapters/labs/domain.js';
import {composeLabsSurface} from '../../../surfaces/labs/index.js';
import {createW05RescueComposition} from '../../../surfaces/composition/w05-rescue.js';
import {HealthRuntimeAdapter} from '../../../adapters/health-runtime.js';
import {ProcessingRuntimeAdapter} from '../../../adapters/processing-runtime.js';
import {AuditEventDomain,createAuditConsumerAdapter} from '../../../adapters/audit.js';
import {ReleasesDomainAdapter} from '../../../adapters/releases/domain-adapter.js';
import {OperationalSessionOwner,OPERATIONAL_SESSION_CONTRACT} from '../../../foundation/operational/session-owner.js';
import {WindowsTerminalRuntimeAdapter} from '../../../adapters/windows-terminal-runtime.js';
import {StickyNoteWindowOwner} from '../../../foundation/notes/sticky-note-window.js';
import * as visualizeSurface from '../../../surfaces/visualize/surface.js';
import {XtermOperationalTerminalRenderer} from '../../../foundation/operational/xterm-renderer.js';

const rows: Array<{id:string;status:'PASS'|'FAIL';detail?:unknown;error?:string}> = [];
const test=async(id:string,run:()=>unknown|Promise<unknown>)=>{
  try{rows.push({id,status:'PASS',detail:await run()});}
  catch(error:any){rows.push({id,status:'FAIL',error:String(error?.stack||error)});}
};
class QueueTransport{
  responses:any[];calls:any[]=[];
  constructor(responses:any[]=[]){this.responses=[...responses];}
  descriptor(){return {id:'LCORR01QueueTransport',semanticOwnership:false};}
  async request(method:string,path:string,body:any){this.calls.push({method,path,body});return structuredClone(this.responses.shift()??{ok:false,code:'NO_RESPONSE'});}
}
const sharedStudio={structuredHost:{owner:'StructuredSurfaceHost'},spatialRelation:{owner:'RelationInteractionOwner'}};

await test('A12-PF-001.library-rejected-source-fails-closed-without-crash',()=>{
  const composition=createLibraryRuntimeComposition({source:{classification:'NON_PRODUCTION',truth:'ACCEPTANCE_SEED',document:{id:'fixture',revision:'1',blocks:[]}}});
  assert.equal(composition.sourceAvailability().enabled,false);
  assert.equal(composition.descriptor().sourceState,'UNAVAILABLE');
  assert.match(composition.descriptor().sourceReason,/FORBIDDEN|REJECTED|NON_PRODUCTION/);
  return composition.descriptor();
});

await test('A12-PF-002.learn-rejected-source-fails-closed-without-crash',()=>{
  const composition=createLearnRuntimeComposition({source:{classification:'PRODUCT_RUNTIME_BOUND_SOURCE',truth:'ACCEPTANCE_SEED',activity:{id:'fixture',revision:1},document:{id:'fixture-doc',revision:'1',blocks:[]}}});
  assert.equal(composition.learn.sourceAvailability().enabled,false);
  assert.equal(composition.descriptor.sourceAvailability,'UNAVAILABLE');
  assert.match(composition.learn.source.rejectionReason,/FORBIDDEN|REJECTED|ACCEPTANCE/);
  return composition.descriptor;
});

await test('RC-01.w04-product-defaults-are-truthful-empty',()=>{
  assert.equal(new W04EvidenceDomain().records.length,0);
  assert.equal(new W04ReviewDomain().records.length,0);
  assert.equal(new W04MasteryDomain().records.length,0);
  assert.equal(new W04PortfolioDomain().records.length,0);
  return {defaults:'EMPTY'};
});

await test('A15-PF-001.evidence-caller-fields-cannot-self-grant-admission',()=>{
  const domain=new W04EvidenceDomain([{
    id:'candidate-1',evidenceId:'evidence-1',revisionId:'candidate-r1',title:'Candidate',status:'CANDIDATE',candidateState:'SUBMITTED_FOR_INTAKE',candidateRevision:1,
    intakeValidation:{status:'VALIDATED',proofRef:'caller-validation'},sourceStatus:'CURRENT',digest:'sha256:test',schemaValid:true,sourceBytesAvailable:true,
    verification:{status:'VERIFIED',providerId:'caller',proofRef:'caller-proof',digest:'sha256:test',schemaValid:true,sourceBytesAvailable:true},
    subject:'subject',evidenceClaim:'claim',criterionRefs:['criterion:v1'],governedPurpose:'formal evidence',selectedMaterialRefs:['source@r1'],sourceId:'source',sourceRevision:'r1',
    admissionAuthority:{available:true,proofRef:'caller-self-assertion'}
  }]);
  const result=domain.admit('candidate-1');
  assert.equal(result.ok,false);
  assert.equal(result.code,'ADMISSION_AUTHORITY_UNAVAILABLE');
  return result;
});

await test('A15-PF-002.reviewer-fields-cannot-self-grant-authority',()=>{
  const domain=new W04ReviewDomain([{id:'review-1',revisionId:'r1',evidenceRefs:['e@r1'],criteriaRefs:['c@r1'],reviewer:{identity:'caller',authorityAvailable:true,assignmentPermissionAvailable:true,permissionProofRef:'caller-proof'},state:'ASSIGNED',findings:[],decision:null}]);
  const result=domain.review('review-1',{action:'start'});
  assert.equal(result.ok,false);
  assert.equal(result.code,'REVIEWER_AUTHORITY_UNAVAILABLE');
  return result;
});

await test('A15-PF-003.reviews-complete-lifecycle-is-command-reachable',()=>{
  const domain=new W04ReviewDomain([],{evidenceResolver:()=>({state:'RESOLVED',immutable:true}),reviewAuthorityRegistry:{resolveReviewerAuthority:(identity:string)=>({identity,authorized:true,canAssign:true,permissionProofRef:`proof:${identity}`,testOnly:false})}});
  const bus=new SemanticCommandBus();
  composeReviewsSurface({domain,analyticalCompareOwner:new AnalyticalCompareOwner(),commands:bus});
  const required=['reviews.request','reviews.assign','reviews.start','reviews.finding','reviews.ready','reviews.continue','reviews.cancel','reviews.supersede','reviews.rereview'];
  for(const id of required)assert.equal(bus.commands.has(id),true,id);
  assert.equal(bus.execute('reviews.request',{id:'review-1',evidenceRefs:['e@r1'],criteriaRefs:['c@r1'],reviewer:{identity:'reviewer'}}).ok,true);
  assert.equal(bus.execute('reviews.assign',{id:'review-1'}).record.state,'ASSIGNED');
  assert.equal(bus.execute('reviews.start',{id:'review-1'}).record.state,'IN_REVIEW');
  assert.equal(bus.execute('reviews.finding',{id:'review-1',findingId:'f1',text:'Finding',criterionRef:'c@r1',state:'SATISFIED'}).ok,true);
  assert.equal(bus.execute('reviews.ready',{id:'review-1'}).record.state,'READY_FOR_DECISION');
  assert.equal(bus.execute('reviews.supersede',{id:'review-1',expectedDecisionId:null,newDecision:{decisionId:'d1',outcome:'ACCEPT'}}).record.state,'CLOSED');
  return {commands:required,state:domain.inspect('review-1').state};
});

await test('A15-PF-004.empty-portfolio-adds-exact-reference-without-copy',()=>{
  const domain=new W04PortfolioDomain([],{sourceResolver:{inspect:(ref:string)=>ref==='evidence-1@r1'?{digest:'sha256:source',rowCount:1}:null}});
  const result=domain.curate({action:'add',member:{id:'member-1',revisionId:'m1',refType:'Evidence',sourceRef:'evidence-1@r1',title:'Evidence'}});
  assert.equal(result.ok,true);
  assert.equal(result.receipt.canonicalSourceWrite,false);
  assert.equal(domain.records.length,1);
  return result;
});

await test('A15-PF-006.w04-requires-injected-analytical-owner',()=>{
  const result=createW04RescueComposition();
  assert.equal(result.integration.state,'INTEGRATION_REQUIRED');
  assert.equal(result.shared.analyticalCompareOwner,null);
  return result.integration;
});

await test('A14-PF-004.results-provider-unavailable-empty-available-error-distinct',()=>{
  const owners=()=>({timelineReplayOwner:new TimelineReplayOwner(),analyticalCompareOwner:new AnalyticalCompareOwner()});
  const unavailable=new W03ResultsDomain({...owners()});
  const empty=new W03ResultsDomain({...owners(),records:[],providerState:'AVAILABLE'});
  const available=new W03ResultsDomain({...owners(),records:[{resultId:'R1',revisionId:'1',manifestDigest:'m1',sealed:true,schemaVersion:'results/v1',comparatorVersion:'results-compare/1.0.0',comparable:{},recordedEvents:[]}],providerState:'AVAILABLE'});
  const error=new W03ResultsDomain({...owners(),providerState:'ERROR',providerError:{code:'RESULT_PROVIDER_FAILED'}});
  assert.equal(unavailable.providerAvailability().state,'UNAVAILABLE');
  assert.equal(empty.providerAvailability().state,'EMPTY');
  assert.equal(available.providerAvailability().state,'AVAILABLE');
  assert.equal(error.providerAvailability().state,'ERROR');
  assert.equal(unavailable.listResults().length,0);
  return {unavailable:unavailable.providerAvailability(),empty:empty.providerAvailability(),available:available.providerAvailability(),error:error.providerAvailability()};
});

await test('A13-PF-001.enterprise-create-validate-publish-baseline-command-path',()=>{
  const productSource=createEnterpriseAdapter();assert.equal(productSource.nodes.length,0);assert.equal(productSource.sourceClassification,'UNAVAILABLE');assert.equal(productSource.sourceDigest,null);
  const adapter=createEnterpriseAdapter({fixture:true}),domain=new W03EnterpriseDomain({relationAdapter:adapter}),bus=new SemanticCommandBus(),surface=composeEnterpriseSurface({relationAdapter:adapter,domain,bus});
  for(const id of ['enterprise.create','enterprise.baseline','enterprise.validate','enterprise.publish','enterprise.handoff'])assert.equal(bus.commands.has(id),true,id);
  assert.equal(bus.execute('enterprise.baseline',{baseline:{status:'AVAILABLE',id:'BL-EXACT',revision:'1',digest:'digest-exact'}}).ok,true);
  assert.equal(bus.execute('enterprise.validate',{}).ok,true);
  assert.equal(bus.execute('enterprise.publish',{}).ok,true);
  assert.equal(surface.domain.snapshot().authoring,'PUBLISHED');
  assert.equal(bus.execute('enterprise.handoff',{}).ok,true);
  return surface.domain.snapshot();
});

await test('A13-PF-004.scenario-publish-command-reachable-and-resolver-gated',()=>{
  const domain=new W03ScenarioDomain({definition:{id:'SC',revision:'1',title:'Scenario',environment:{capabilities:[]},phases:[{id:'P1',name:'Phase',elements:[{id:'L1',kind:'lab',title:'Lab',labRef:{id:'LAB',revision:'1'}}]}]}}),bus=new SemanticCommandBus();
  composeScenariosSurface({domain,bus,shared:sharedStudio});
  assert.equal(bus.commands.has('scenarios.publish'),true);
  assert.equal(bus.execute('scenarios.publish',{digest:'d'}).ok,false);
  const context={resolveLab:(ref:any)=>ref.id==='LAB'&&ref.revision==='1',availableCapabilities:[],binding:{capabilities:[]}};
  assert.equal(bus.execute('scenarios.publish',{digest:'d',validationContext:context}).ok,true);
  return domain.snapshot();
});

await test('A13-PF-005.lab-publish-command-reachable-and-provider-gated',()=>{
  const domain=new W03LabDomain({definition:{id:'LAB',revision:'1',title:'Lab',environment:{capabilities:['shell'],revision:'7'},requiredTools:[{id:'terminal',revision:'2'}],tasks:[{id:'T1',title:'Task',validation:'event',expectedSignal:'ok',toolRefs:['terminal']}],dependencies:[]}}),bus=new SemanticCommandBus();
  composeLabsSurface({domain,bus,shared:sharedStudio});
  assert.equal(bus.commands.has('labs.publish'),true);
  const blocked=bus.execute('labs.publish',{digest:'lab-digest'});assert.equal(blocked.ok,false);assert.equal(blocked.code,'LAB_PROVIDER_PREFLIGHT_REQUIRED_BEFORE_PUBLISH');
  assert.equal(bus.execute('labs.publish',{digest:'lab-digest',tools:{terminal:{revision:'2'}},environmentBinding:{capabilities:['shell'],revision:'7'}}).ok,true);
  assert.equal(domain.snapshot().lifecycle,'PUBLISHED');
  return domain.snapshot();
});

await test('RC-02.run-recorded-view-is-not-sealed-result-vocabulary',()=>{
  const source=readFileSync('stack/native-typescript/surfaces/runs/index.ts','utf8');
  assert.match(source,/recorded runtime|recorded simulation truth/i);
  assert.doesNotMatch(source,/View recorded Result/i);
  return {recordedRuntimeVocabulary:true};
});

await test('RC-04.w05-missing-command-bus-is-integration-required',()=>{
  const composition=createW05RescueComposition({transport:new QueueTransport()});
  assert.equal(composition.integration.state,'INTEGRATION_REQUIRED');
  assert.equal(composition.commands,null);
  return composition.integration;
});

await test('A16-PF-001.health-outage-separates-current-from-last-known',async()=>{
  const transport=new QueueTransport([{ok:true,observations:[{observationId:'o1',sourceId:'runtime',kind:'WorkerLiveness',status:'AVAILABLE',observedAt:'2026-09-25T18:00:00Z',freshnessMs:3600000,value:{state:'ALIVE'}}]},{ok:false,code:'RUNTIME_UNAVAILABLE'}]);
  const adapter=new HealthRuntimeAdapter({transport,clock:()=>Date.parse('2026-09-25T18:30:00Z')});
  await adapter.refresh();await adapter.refresh();
  const row=adapter.rows()[0];
  assert.equal(row.state,'UNAVAILABLE');
  assert.equal(row.workerState,'UNKNOWN');
  assert.equal(row.lastKnownState,'AVAILABLE_DATA');
  assert.equal(row.lastKnownWorkerState,'ALIVE');
  return row;
});

await test('A16-PF-002.processing-outage-disables-retry-despite-historical-failure',async()=>{
  const failed={jobId:'job-1',requestId:'req-1',state:'FAILED',currentAttemptId:'a1',attempts:[{attemptId:'a1',state:'FAILED'}]};
  const transport=new QueueTransport([{ok:true,jobs:[failed]},{ok:false,code:'RUNTIME_UNAVAILABLE'}]);
  const adapter=new ProcessingRuntimeAdapter({transport});await adapter.refresh();await adapter.refresh();
  const availability=adapter.availability('processing.retry');
  assert.equal(availability.enabled,false);
  assert.equal(availability.code,'PROCESSING_PROVIDER_UNAVAILABLE');
  const callsBefore=transport.calls.length,result=await adapter.retry();
  assert.equal(result.ok,false);assert.equal(result.code,'PROCESSING_PROVIDER_UNAVAILABLE');assert.equal(transport.calls.length,callsBefore);
  return {availability,result};
});

await test('A17-PF-004-005.audit-projects-canonical-event-identity-and-provenance',()=>{
  const domain=new AuditEventDomain({seed:false,clock:()=> '2026-09-25T18:00:00Z'});
  const first=domain.append({eventId:'event-1',occurredAt:'2026-09-25T18:00:01Z',action:'ONE'}),second=domain.append({eventId:'event-2',occurredAt:'2026-09-25T18:00:02Z',action:'TWO'});
  const adapter=createAuditConsumerAdapter({domain}),projection=adapter.provider.read(),[p1,p2]=projection.entries;
  assert.equal(p1.id,'event-1');assert.equal(p1.timestamp,'2026-09-25T18:00:01Z');
  assert.deepEqual(p2.parentIds,['event-1']);
  assert.equal(p2.attributes.eventId,'event-2');assert.equal(p2.attributes.occurredAt,'2026-09-25T18:00:02Z');
  assert.equal(p2.attributes.hash,second.recordHash);assert.equal(p2.attributes.previousHash,first.recordHash);
  const note=domain.annotate({eventId:'event-2',note:'canonical'});assert.equal(note.annotation.eventId,'event-2');
  return {p1,p2,note};
});

await test('A17-PF-006.releases-does-not-create-local-compare-owner',()=>{
  const adapter=new ReleasesDomainAdapter();
  assert.equal(adapter.compareOwner,null);
  assert.equal(adapter.availability('releases.compare',{leftId:'a',rightId:'b'}).code,'ANALYTICAL_COMPARE_INTEGRATION_REQUIRED');
  return adapter.diagnosticProjection();
});

await test('A07-PF-001.detach-requires-provider-reattach-capability',()=>{
  const runtime={descriptor:()=>({contract:{id:'RuntimeAdapter',version:'1.0.0'},id:'NoReattachRuntime',label:'No reattach',sessionOwner:'RuntimeOwner',capabilities:[]}),session:(id:string)=>({id,deviceId:'device',epoch:'e1',lines:[],presentation:{state:'running',detail:'',sequence:1,transitions:[]}}),prompt:()=>''};
  const owner=new OperationalSessionOwner({platformWindowBridge:{requestSeparateWindow:()=>({ok:true,active:true,code:'OPEN'})}});owner.attachProviderSession(runtime,'session-1');
  const result=owner.detachWindow();assert.equal(result.ok,false);assert.equal(result.code,'PROVIDER_REATTACH_UNAVAILABLE');
  return result;
});

await test('A07-PF-004.sticky-native-open-requires-valid-context-handoff',()=>{
  const bridge={capabilities:()=>({alwaysOnTop:false,separateWindow:true}),requestSeparateWindow:()=>({ok:true,active:true,code:'OPEN'})};
  const owner=new StickyNoteWindowOwner({capabilityBridge:bridge});owner.register('note-1',{surfaceContext:{surfaceId:'library',route:'PERSONAL:CEP/W02/library',documentId:'doc-1'}});
  const result=owner.requestSeparateWindow('note-1');assert.equal(result.ok,false);assert.equal(result.code,'DETACH_CONTEXT_HANDOFF_REQUIRED');
  return result;
});

await test('A09-PF-002.profile-availability-never-uses-headless-node-fallback',()=>{
  const descriptor=new WindowsTerminalRuntimeAdapter({connected:true}).descriptor();
  assert.equal(descriptor.powershell,false);assert.equal(descriptor.ssh,false);assert.equal(descriptor.profileCapabilityState,'UNAVAILABLE');
  return descriptor;
});

await test('A09-PF-003.implementation-maturity-separated-from-final-proof',()=>{
  assert.doesNotMatch(OPERATIONAL_SESSION_CONTRACT.maturity,/BOUNDARY_ONLY_BELOW_M6/);
  assert.match(OPERATIONAL_SESSION_CONTRACT.maturity,/FINAL_TARGET_PROOF_PENDING/);
  return OPERATIONAL_SESSION_CONTRACT;
});

await test('A09-PF-001.xterm-source-subscribes-before-async-module-load',()=>{
  const source=readFileSync('stack/native-typescript/foundation/operational/xterm-renderer.ts','utf8');
  const subscribeIndex=source.indexOf('providerRuntime.subscribe');
  const awaitIndex=source.indexOf('await this.moduleLoader()');
  assert(subscribeIndex>=0&&awaitIndex>=0&&subscribeIndex<awaitIndex,`subscribe=${subscribeIndex}, await=${awaitIndex}`);
  assert.match(source,/reconcile|buffered/i);
  return {subscribeIndex,awaitIndex};
});

await test('A12-PF-007.visualize-available-hierarchy-renders-provider-nodes',()=>{
  assert.equal(typeof (visualizeSurface as any).renderVisualizeHierarchyTree,'function');
  const html=(visualizeSurface as any).renderVisualizeHierarchyTree([{id:'root',label:'Root',children:[{id:'child',label:'Child'}]}],new Set(['child']));
  assert.match(html,/Root/);assert.match(html,/Child/);assert.match(html,/data-visualize-hierarchy-node="child"/);
  return {html};
});

await test('CORR-01.enterprise-create-truth-and-immutability',()=>{
  const adapter=createEnterpriseAdapter({fixture:true});
  const domain=new W03EnterpriseDomain({relationAdapter:adapter});
  const res1=domain.create({enterpriseId:'ENT-TEST-01',twinId:'TWIN-TEST-01',revisionId:'REV-TEST-01'});
  assert.equal(res1.ok,true);
  assert.equal(res1.mutated,true);
  assert.equal(res1.receipt.action,'enterprise.create');
  assert.equal(res1.receipt.enterpriseId,'ENT-TEST-01');
  assert.equal(res1.receipt.twinId,'TWIN-TEST-01');
  assert.equal(res1.receipt.revisionId,'REV-TEST-01');
  assert.equal(domain.snapshot().enterpriseId,'ENT-TEST-01');
  assert.equal(domain.snapshot().twinId,'TWIN-TEST-01');
  assert.equal(domain.snapshot().revisionId,'REV-TEST-01');

  const res2=domain.create({enterpriseId:''});
  assert.equal(res2.ok,false);
  assert.equal(res2.code,'ENTERPRISE_ID_REQUIRED');
  assert.equal(res2.mutated,false);
  assert.equal(domain.snapshot().enterpriseId,'ENT-TEST-01');

  const pubDomain=new W03EnterpriseDomain({relationAdapter:adapter,authoring:'PUBLISHED',revisionId:'ENT-PUB-01'});
  const res3=pubDomain.create({enterpriseId:'ENT-FORBIDDEN'});
  assert.equal(res3.ok,false);
  assert.equal(res3.code,'PUBLISHED_REVISION_IMMUTABLE__CREATE_SUCCESSOR_REVISION');
  assert.equal(res3.mutated,false);
  assert.equal(pubDomain.snapshot().enterpriseId,adapter.enterpriseId);

  return {created:res1,rejectedMissing:res2,rejectedPublished:res3};
});

await test('CORR-02.reviews-lifecycle-command-availability-truth',()=>{
  const unauthDomain=new W04ReviewDomain([]);
  const unauthBus=new SemanticCommandBus();
  composeReviewsSurface({domain:unauthDomain,commands:unauthBus});
  const reqAvail=unauthBus.availability('reviews.request',{id:'r-test'});
  assert.equal(reqAvail.enabled,false);
  assert.equal(reqAvail.code,'REVIEWER_AUTHORITY_UNAVAILABLE');

  const registry=new ReviewAuthorityRegistry([
    {identity:'reviewer:alice',authorized:true,canAssign:true,permissionProofRef:'perm:alice'},
    {identity:'reviewer:bob',authorized:false,canAssign:false,permissionProofRef:'perm:bob'}
  ],{testOnly:true});
  const authDomain=new W04ReviewDomain([],{
    reviewAuthorityRegistry:registry,
    allowTestAuthority:true,
    evidenceResolver:()=>({state:'RESOLVED',immutable:true})
  });
  const authBus=new SemanticCommandBus();
  const compareOwner=new AnalyticalCompareOwner();
  composeReviewsSurface({domain:authDomain,analyticalCompareOwner:compareOwner,commands:authBus});

  const bobReq=authBus.availability('reviews.request',{id:'r1',reviewer:{identity:'reviewer:bob'}});
  assert.equal(bobReq.enabled,false);
  assert.equal(bobReq.code,'REVIEWER_AUTHORITY_UNAVAILABLE');

  assert.equal(authBus.availability('reviews.assign',{id:'ghost'}).enabled,false);
  assert.equal(authBus.availability('reviews.assign',{id:'ghost'}).code,'REVIEW_RECORD_REQUIRED');

  const reqRes=authBus.execute('reviews.request',{id:'r1',evidenceRefs:['e@r1'],criteriaRefs:['c@r1'],reviewer:{identity:'reviewer:alice'}});
  assert.equal(reqRes.ok,true);

  assert.equal(authBus.availability('reviews.start',{id:'r1'}).enabled,false);
  assert.equal(authBus.availability('reviews.start',{id:'r1'}).code,'REVIEW_STATE_ACTION_INVALID');
  assert.equal(authBus.availability('reviews.assign',{id:'r1'}).enabled,true);
  authBus.execute('reviews.assign',{id:'r1'});

  assert.equal(authBus.availability('reviews.ready',{id:'r1'}).enabled,false);
  assert.equal(authBus.availability('reviews.ready',{id:'r1'}).code,'REVIEW_STATE_ACTION_INVALID');
  assert.equal(authBus.availability('reviews.start',{id:'r1'}).enabled,true);
  authBus.execute('reviews.start',{id:'r1'});

  assert.equal(authBus.availability('reviews.ready',{id:'r1'}).enabled,false);
  assert.equal(authBus.availability('reviews.ready',{id:'r1'}).code,'REVIEW_FINDINGS_REQUIRED');
  assert.equal(authBus.availability('reviews.finding',{id:'r1'}).enabled,true);
  authBus.execute('reviews.finding',{id:'r1',findingId:'f1',text:'Finding text',criterionRef:'c@r1',state:'SATISFIED'});

  assert.equal(authBus.availability('reviews.ready',{id:'r1'}).enabled,true);
  authBus.execute('reviews.ready',{id:'r1'});

  assert.equal(authBus.availability('reviews.supersede',{id:'r1'}).enabled,true);
  authBus.execute('reviews.supersede',{id:'r1',expectedDecisionId:null,newDecision:{decisionId:'dec-1',outcome:'ACCEPT_WITH_LIMITATIONS'}});

  assert.equal(authBus.availability('reviews.supersede',{id:'r1'}).enabled,false);
  assert.equal(authBus.availability('reviews.supersede',{id:'r1'}).code,'REVIEW_NOT_READY_FOR_DECISION');
  assert.equal(authBus.availability('reviews.rereview',{id:'r1'}).enabled,true);

  return {lifecycleValidated:true,finalState:authDomain.inspect('r1').state};
});

await test('CORR-03.scenarios-publish-availability-truth',()=>{
  const domain=new W03ScenarioDomain({
    definition:{
      id:'SC-AVAIL',revision:'1',title:'Scenario',
      environment:{capabilities:['shell']},
      phases:[{id:'P1',name:'Phase 1',elements:[{id:'EL1',kind:'lab',title:'Lab',labRef:{id:'LAB-REQ',revision:'1'}}]}]
    }
  });
  const bus=new SemanticCommandBus();
  composeScenariosSurface({domain,bus,shared:sharedStudio});

  const availBlocked=bus.availability('scenarios.publish',{digest:'d'});
  assert.equal(availBlocked.enabled,false);
  assert.equal(availBlocked.code,'SCENARIO_VALIDATION_REQUIRED_BEFORE_PUBLISH');

  const validContext={
    resolveLab:(ref:any)=>ref.id==='LAB-REQ'&&ref.revision==='1',
    availableCapabilities:['shell'],
    binding:{capabilities:['shell']}
  };
  const availReady=bus.availability('scenarios.publish',{digest:'d',validationContext:validContext});
  assert.equal(availReady.enabled,true);

  const pubRes=bus.execute('scenarios.publish',{digest:'d',validationContext:validContext});
  assert.equal(pubRes.ok,true);
  assert.equal(domain.snapshot().lifecycle,'PUBLISHED');

  assert.equal(bus.availability('scenarios.publish').enabled,true);
  return domain.snapshot();
});

await test('CORR-04.labs-publish-availability-truth',()=>{
  const domain=new W03LabDomain({
    definition:{
      id:'LAB-AVAIL',revision:'1',title:'Lab Title',
      environment:{capabilities:['network'],revision:'3'},
      requiredTools:[{id:'scanner',revision:'1'}],
      tasks:[{id:'T1',title:'Task 1',validation:'ok',expectedSignal:'sig',toolRefs:['scanner']}],
      dependencies:[]
    }
  });
  const bus=new SemanticCommandBus();
  composeLabsSurface({domain,bus,shared:sharedStudio});

  const availBlocked=bus.availability('labs.publish',{digest:'lab-d'});
  assert.equal(availBlocked.enabled,false);
  assert.equal(availBlocked.code,'LAB_PROVIDER_PREFLIGHT_REQUIRED_BEFORE_PUBLISH');

  const validPayload={
    digest:'lab-d',
    tools:{scanner:{revision:'1'}},
    environmentBinding:{capabilities:['network'],revision:'3'}
  };
  assert.equal(bus.availability('labs.publish',validPayload).enabled,true);

  const pubRes=bus.execute('labs.publish',validPayload);
  assert.equal(pubRes.ok,true);
  assert.equal(domain.snapshot().lifecycle,'PUBLISHED');

  assert.equal(bus.availability('labs.publish').enabled,true);
  return domain.snapshot();
});

await test('RC-05.xterm-reconciliation-ten-contracts',async()=>{
  class MockTerminal{
    written='';
    resets=0;
    element={isConnected:true};
    options:any={};
    open(host:any){}
    write(data:any){this.written+=typeof data==='string'?data:Buffer.from(data).toString();}
    writeln(data:any){this.written+=String(data)+'\n';}
    reset(){this.resets++;this.written='';}
    dispose(){}
    onData(cb:any){return {dispose(){}};}
    onResize(cb:any){return {dispose(){}};}
    focus(){}
  }
  let currentMockTerm:MockTerminal|null=null;
  const mockLoader=async()=>{
    currentMockTerm=new MockTerminal();
    return {Terminal:function(){return currentMockTerm;}};
  };
  const renderer=new XtermOperationalTerminalRenderer({moduleLoader:mockLoader as any});

  const mockHost={
    setAttribute(k:string,v:string){},
    getAttribute(k:string){return null;}
  };
  const mockRoot={
    querySelector:(sel:string)=>mockHost
  };
  const provider={conpty:true,label:'Test Terminal'};

  let subscribeHandler:any=null;
  let sessionState={
    id:'sess-1',
    rawOutputBase64:Buffer.from('INITIAL_RAW_OUTPUT ').toString('base64'),
    outputCursor:19,
    outputGeneration:1,
    restartCount:1
  };
  const providerRuntime={
    subscribe:(id:string,handler:any)=>{
      subscribeHandler=handler;
      handler({type:'output',data:'BUFFERED_OVERLAPPING ',cursor:15,generation:1});
      handler({type:'output',data:'BUFFERED_FRESH ',cursor:25,generation:1});
      handler({type:'output',data:'OLD_GEN_LEAK ',cursor:5,generation:0});
      return {dispose(){}};
    },
    session:(id:string)=>sessionState
  };

  await renderer.mount({
    root:mockRoot as any,
    session:sessionState as any,
    provider,
    providerRuntime:providerRuntime as any,
    presentationId:'pres-1',
    routeInput:()=>{},
    routeResize:()=>{}
  });

  const term=currentMockTerm!;
  assert.match(term.written,/INITIAL_RAW_OUTPUT/);
  assert.match(term.written,/BUFFERED_FRESH/);
  const occurrences=(term.written.match(/BUFFERED_OVERLAPPING/g)||[]).length;
  assert.equal(occurrences,0);
  assert.doesNotMatch(term.written,/OLD_GEN_LEAK/);

  subscribeHandler({type:'reset',generation:2});
  assert.equal(term.resets,1);
  assert.equal(term.written,'');
  subscribeHandler({type:'output',data:'NEW_GEN_DATA',cursor:5,generation:2});
  assert.equal(term.written,'NEW_GEN_DATA');

  subscribeHandler({type:'output',data:'STALE_GEN1_DATA',cursor:30,generation:1});
  assert.equal(term.written,'NEW_GEN_DATA');

  return {tenContractsVerified:true,written:term.written};
});

const fail=rows.filter(row=>row.status==='FAIL').length;
console.log(JSON.stringify({suite:'LCORR01_PARENT_CANDIDATE_FALSIFICATION',classification:fail?'PARENT_FAIL_OR_CANDIDATE_REGRESSION':'CANDIDATE_PASS',pass:rows.length-fail,fail,rows},null,2));
if(fail)process.exitCode=1;
