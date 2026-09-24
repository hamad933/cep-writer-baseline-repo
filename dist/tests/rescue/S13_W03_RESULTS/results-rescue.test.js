import assert from 'node:assert/strict';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {composeResultsSurface} from '../../../surfaces/results/index.js';

let runtimeExecutions=0;
const records=[
 {resultId:'R1',revisionId:'1',manifestDigest:'m1',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',label:'Result One',sourceRunInputRef:{runId:'RUN-1',revisionId:'ri-1'},provenanceRefs:['prov:R1'],comparable:{status:{label:'Status',type:'string',value:'UP'}},recordedEvents:[{seq:1,type:'START',timestamp:'10:00:00'},{seq:2,type:'GAP',gap:true,summary:'Recorder unavailable'},{seq:3,type:'STOP'}],historicalTerminalBytes:'rm -rf / recorded only'},
 {resultId:'R2',revisionId:'1',manifestDigest:'m2',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',label:'Result Two',sourceRunInputRef:{runId:'RUN-2',revisionId:'ri-2'},provenanceRefs:['prov:R2'],comparable:{status:{label:'Status',type:'string',value:'DOWN'}},recordedEvents:[{seq:1,type:'START'}]}
];
const replayOwner=new TimelineReplayOwner(),compareOwner=new AnalyticalCompareOwner();
const domain=new W03ResultsDomain({records,timelineReplayOwner:replayOwner,analyticalCompareOwner:compareOwner});
const surface=composeResultsSurface({domain,shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});
const ref1={resultId:'R1',revisionId:'1',manifestDigest:'m1'},ref2={resultId:'R2',revisionId:'1',manifestDigest:'m2'};

assert.equal(domain.replayOwner,replayOwner);assert.equal(domain.replayOwner.owner,'TimelineReplayOwner');assert.equal('replay' in domain,false,'no second local replay state engine');
const first=surface.bus.execute('results.replay',ref1);assert.equal(first.replayOwner,'TimelineReplayOwner');assert.equal(first.event.seq,1);assert.equal(first.replayExecutesRuntime,false);assert.equal(runtimeExecutions,0);
const gap=surface.bus.execute('results.step',{delta:1});assert.equal(gap.state,'GAP');assert.equal(gap.event.seq,2);assert.equal(runtimeExecutions,0,'recorded replay never executes runtime');
const afterGap=surface.bus.execute('results.step',{delta:1});assert.equal(afterGap.event.seq,3);assert.equal(runtimeExecutions,0);
assert.equal(domain.replayOwner.project().presentationTruth.canonicalHistoryClaim,false,'generic owner never claims canonical history');assert.equal(domain.replayOwner.project().provider.providerCanonicalClaim,true,'thin domain provider supplies sealed-history identity');

const before=domain.resultProjection(ref1);assert.throws(()=>domain.annotate({ref:ref1,text:'ghost anchor',anchoredEventRefs:['ghost-event']}),/RESULT_AAR_EVENT_REF_ABSENT/);const a1=surface.bus.execute('results.annotate',{ref:ref1,text:'first AAR',expectedRevision:0,state:'SAVED',anchoredEventRefs:['seq:1']});assert.equal(a1.revision,1);assert.equal(a1.factMutation,false);const a2=surface.bus.execute('results.annotate',{ref:ref1,text:'second AAR',analysisId:a1.analysisId,expectedRevision:1,state:'SAVED'});assert.equal(a2.revision,2);assert.notEqual(a1.analysisDigest,a2.analysisDigest);const conflict=surface.bus.execute('results.annotate',{ref:ref1,text:'stale edit',analysisId:a1.analysisId,expectedRevision:1,state:'SAVED'});assert.equal(conflict.state,'CONFLICT');assert.equal(domain.aarProjection(ref1).revision,2);const after=domain.resultProjection(ref1);assert.deepEqual(after.ref,before.ref,'AAR revisions cannot rewrite sealed Result identity');

const compare=surface.bus.execute('results.compare',{left:ref1,right:ref2});assert.equal(compare.receipt.owner,'AnalyticalCompareOwner');assert.equal(compare.receipt.leftRef.manifestDigest,'m1');assert.equal(compare.receipt.rightRef.manifestDigest,'m2');
const handoff=surface.bus.execute('results.handoff',{ref:ref1});assert.equal(handoff.resultRef.manifestDigest,'m1');assert.equal(handoff.sourceRunInputRef.runId,'RUN-1');assert.equal(handoff.provenanceRefs[0],'prov:R1');assert.equal(handoff.formalAdmissionPerformed,false);assert.equal(handoff.reviewDecisionPerformed,false);
assert.equal(surface.truthCeiling.workspaceReadOnly,false);assert.equal(surface.truthCeiling.sealedFactsMutable,false);assert.ok(surface.ownerBindings.includes('TimelineReplayOwner'));assert.ok(surface.ownerBindings.includes('AnalyticalCompareOwner'));
assert.equal(Object.isFrozen(domain.records[0]),true);assert.throws(()=>{domain.records[0].manifestDigest='changed'},/read only|Cannot assign|object is not extensible/i);
assert.equal(runtimeExecutions,0);
console.log('S13 W03 Results rescue: PASS');
