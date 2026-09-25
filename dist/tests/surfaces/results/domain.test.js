import assert from 'node:assert/strict';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {composeResultsSurface} from '../../../surfaces/results/index.js';
const records=[
 {resultId:'R1',revisionId:'1',manifestDigest:'m1',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',comparable:{status:{label:'Status',type:'string',value:'UP'}},recordedEvents:[{seq:1,type:'START'},{seq:2,type:'STOP'}],historicalTerminalBytes:'immutable'},
 {resultId:'R2',revisionId:'1',manifestDigest:'m2',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',comparable:{status:{label:'Status',type:'string',value:'DOWN'}},recordedEvents:[{seq:1,type:'START'}]}
];
const replayOwner=new TimelineReplayOwner(),compareOwner=new AnalyticalCompareOwner();
const domain=new W03ResultsDomain({records,timelineReplayOwner:replayOwner,analyticalCompareOwner:compareOwner});const surface=composeResultsSurface({domain,shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});
const ref1={resultId:'R1',revisionId:'1',manifestDigest:'m1'},ref2={resultId:'R2',revisionId:'1',manifestDigest:'m2'};
assert.equal(surface.bus.execute('results.replay',ref1).replayExecutesRuntime,false);assert.equal(surface.bus.execute('results.step',{delta:1}).event.seq,2);
const compare=surface.bus.execute('results.compare',{left:ref1,right:ref2});assert.equal(compare.state,'DIFFERENT');assert.equal(compare.receipt.owner,'AnalyticalCompareOwner');
const annotation=surface.bus.execute('results.annotate',{ref:ref1,text:'ملاحظة / note'});assert.equal(annotation.factMutation,false);
const handoff=surface.bus.execute('results.handoff',{ref:ref1});assert.equal(handoff.formalAdmissionPerformed,false);assert.equal(handoff.reviewDecisionPerformed,false);
const receiptsBefore=surface.bus.receipts.length;const unavailable=surface.bus.execute('results.verifyDeterminism',{ref:ref1});assert.equal(unavailable.ok,false);assert.equal(unavailable.code,'DETERMINISM_PROVIDER_UNAVAILABLE');assert.equal(surface.bus.receipts.length,receiptsBefore);
assert.equal(surface.truthCeiling.auditAuthority,false);console.log('results surface: PASS');
