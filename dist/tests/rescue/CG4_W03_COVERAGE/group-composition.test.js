import assert from 'node:assert/strict';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {OperationalSessionOwner} from '../../../foundation/operational/session-owner.js';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {W03ScenarioDomain} from '../../../adapters/scenarios/domain.js';
import {W03LabDomain} from '../../../adapters/labs/domain.js';
import {composeW03RescueGroup,W03_RESCUE_GROUP_CONTRACT} from '../../../surfaces/composition/w03-rescue.js';

const replay=new TimelineReplayOwner(),compare=new AnalyticalCompareOwner(),operational=new OperationalSessionOwner();
const shared={structuredHost:Object.freeze({owner:'StructuredSurfaceHost'}),spatialRelation:Object.freeze({owner:'RelationInteractionOwner'}),timelineReplayOwner:replay,analyticalCompareOwner:compare,operationalSessionOwner:operational};
const scenarioDomain=new W03ScenarioDomain({definition:{id:'SC-CG4',revision:'7',title:'Incident orchestration',roles:['analyst'],environment:{capabilities:['net']},phases:[{id:'P1',name:'Detect',elements:[{id:'E1',kind:'event',title:'Alert'},{id:'I1',kind:'inject',title:'Credential burst'},{id:'D1',kind:'decision',title:'Contain?',condition:'severity >= high'},{id:'M1',kind:'lab',title:'Pivot lab',labRef:{id:'LAB-CG4',revision:'3'}},{id:'T1',kind:'task',title:'Triage'}]}],rules:['preserve evidence'],observability:['alert'],completion:['closed']}});
const labDomain=new W03LabDomain({definition:{id:'LAB-CG4',revision:'3',title:'Branching investigation',tasks:[{id:'T1',title:'Acquire',nodeType:'action',validation:'artifact exists',expectedSignal:'hash'},{id:'T2',title:'Investigate',nodeType:'interpret',validation:'finding',expectedSignal:'finding'},{id:'T3',title:'Escalate',nodeType:'action',validation:'ticket',expectedSignal:'ticket'}],dependencies:[{id:'E1',from:'T1',to:'T2',type:'depends'},{id:'E2',from:'T2',to:'T3',type:'branch',condition:'critical'}],requiredTools:[],environment:{capabilities:[]}}});
const records=[{resultId:'R-CG4-A',revisionId:'1',manifestDigest:'sha256:aaa',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',comparable:{status:{label:'Status',type:'string',value:'UP'}},recordedEvents:[{seq:1,type:'START'},{seq:2,type:'STOP'}]},{resultId:'R-CG4-B',revisionId:'1',manifestDigest:'sha256:bbb',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',comparable:{status:{label:'Status',type:'string',value:'DOWN'}},recordedEvents:[{seq:1,type:'START'}]}];
const group=composeW03RescueGroup({shared,enterprise:{relationAdapter:createEnterpriseAdapter()},scenarios:{domain:scenarioDomain},labs:{domain:labDomain},results:{domainOptions:{records}}});

assert.equal(W03_RESCUE_GROUP_CONTRACT.globalReadEditMode,false);
assert.deepEqual(group.surfaceIds,['enterprise','scenarios','labs','runs','results']);
assert.equal(group.truth.workspaceFirst,true);assert.equal(group.truth.objectImmutabilityDoesNotMakeSurfaceReadOnly,true);
assert.equal(group.truth.timelineReplayOwnerInstancesInGroup,1);assert.equal(group.surfaces.results.domain.replayOwner,replay);assert.equal(group.surfaces.results.domain.compareOwner,compare);assert.equal(group.surfaces.runs.domain.sessionOwner,operational);
for(const id of group.surfaceIds){const p=group.project(id);assert.equal(p.globalReadEditMode,false,id);assert.deepEqual(Object.keys(p.slots).sort(),['BOTTOM','CENTER','LEFT','RIGHT','TOOLBAR','TOP','TRANSIENT'].sort(),id);assert.ok(p.commands.length>0,id);}

const scenario=group.surfaces.scenarios.domain.studioProjection();assert.equal(scenario.facets.events.length,1);assert.equal(scenario.facets.injects.length,1);assert.equal(scenario.facets.decisions.length,1);assert.equal(scenario.facets.modules.length,1);assert.equal(scenario.facets.tasks.length,1);
const graph=group.surfaces.labs.domain.graphProjection();assert.equal(group.surfaces.labs.domain.validate().graph.nonLinear,true);assert.equal(graph.edges.some(e=>e.type==='branch'),true);
const runsTruth=group.surfaces.runs.domain.truth();assert.equal(runsTruth.runtimeTruth,'INTERNAL_SIMULATION');assert.equal(group.truth.realTerminalPass,false);assert.equal(group.truth.windowsConptyPass,false);assert.equal(group.truth.nativeWindowPass,false);
const refA={resultId:'R-CG4-A',revisionId:'1',manifestDigest:'sha256:aaa'},refB={resultId:'R-CG4-B',revisionId:'1',manifestDigest:'sha256:bbb'};
const first=group.execute('results','results.replay',refA);assert.equal(first.replayOwner,'TimelineReplayOwner');assert.equal(first.replayExecutesRuntime,false);const cmp=group.execute('results','results.compare',{left:refA,right:refB});assert.equal(cmp.receipt.owner,'AnalyticalCompareOwner');
assert.equal(group.truth.centralWiringPerformed,false);
console.log('CG4 W03 group composition: PASS');
