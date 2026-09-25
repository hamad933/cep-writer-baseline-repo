import assert from 'node:assert/strict';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {W03EnterpriseDomain} from '../../../adapters/enterprise/domain.js';
import {W03ScenarioDomain} from '../../../adapters/scenarios/domain.js';
import {W03LabDomain} from '../../../adapters/labs/domain.js';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {composeScenariosSurface} from '../../../surfaces/scenarios/index.js';
import {composeLabsSurface} from '../../../surfaces/labs/index.js';
import {composeResultsSurface} from '../../../surfaces/results/index.js';

const shared={structuredHost:{owner:'StructuredSurfaceHost'},spatialRelation:{owner:'RelationInteractionOwner'}};

const ent=new W03EnterpriseDomain({relationAdapter:createEnterpriseAdapter({fixture:true}),authoring:'PUBLISHED',revisionId:'ENT-PUBLISHED',baseline:{status:'AVAILABLE',id:'BL-1',revision:'1',digest:'d1'}});
const entBefore=ent.snapshot();const publishedRebase=ent.setTwinBinding({action:'rebaseTwin',overlayRefs:entBefore.objects.map(x=>({id:x.id,classification:x.classification})),conflictsResolved:true,targetBaseline:{id:'BL-2',revision:'2',digest:'d2'}});assert.equal(publishedRebase.ok,false);assert.match(publishedRebase.code,/PUBLISHED_REVISION_IMMUTABLE/);assert.deepEqual(ent.snapshot().baseline,entBefore.baseline);const statusOnly=ent.setTwinBinding({baselineStatus:'STALE'});assert.equal(statusOnly.baseline.status,'STALE');assert.equal(statusOnly.baseline.id,'BL-1');assert.equal(statusOnly.baseline.revision,'1');assert.equal(statusOnly.baseline.digest,'d1');

const scenario=new W03ScenarioDomain({definition:{id:'SC',revision:'1',title:'Scenario',environment:{capabilities:[]},phases:[{id:'P1',name:'Phase',elements:[{id:'LM1',kind:'lab',title:'Lab',labRef:{id:'LAB-X',revision:'2'}}]}]}});const scenarioSurface=composeScenariosSurface({domain:scenario,shared});
const noResolver=scenario.validate();assert.equal(noResolver.ok,false);assert(noResolver.requirements.some(x=>x.code==='LAB_REVISION_RESOLVER_UNBOUND'));
const ctx={resolveLab:ref=>ref.id==='LAB-X'&&ref.revision==='2',availableCapabilities:[],binding:{capabilities:[]}};assert.equal(scenarioSurface.bus.availability('scenarios.prepare',ctx).enabled,false);assert.equal(scenario.prepare(ctx).code,'SCENARIO_REVISION_NOT_PUBLISHED');scenario.publish({digest:'sc-digest',validationContext:ctx});assert.equal(scenarioSurface.bus.availability('scenarios.prepare',ctx).enabled,true);assert.equal(scenario.prepare(ctx).ok,true);const publishedScenarioCount=scenario.snapshot().publishedRevisions.length;scenario.revise({expectedVersion:scenario.version});assert.equal(scenario.snapshot().publishedRevisions.length,publishedScenarioCount);
const draftScenario=new W03ScenarioDomain({definition:{id:'SC-D',revision:'1',title:'Draft',environment:{capabilities:[]},phases:[{id:'P',name:'P',elements:[]}]}});draftScenario.revise({expectedVersion:draftScenario.version});assert.equal(draftScenario.snapshot().publishedRevisions.length,0);

const lab=new W03LabDomain({definition:{id:'LAB',revision:'1',title:'Lab',environment:{capabilities:[]},requiredTools:[],tasks:[{id:'T',title:'Task',validation:'ok',expectedSignal:'sig'}],dependencies:[]}});const labSurface=composeLabsSurface({domain:lab,shared});const lc={tools:{},environmentBinding:{capabilities:[]}};assert.equal(lab.preflight(lc).status,'BLOCKED');assert.equal(lab.preflight(lc).runStartAllowed,false);assert.equal(labSurface.bus.availability('labs.handoff',lc).enabled,false);assert.equal(lab.handoff(lc).code,'LAB_REVISION_NOT_PUBLISHED');lab.publish({digest:'lab-digest'});assert.equal(lab.preflight(lc).status,'READY');assert.equal(lab.handoff(lc).ok,true);const publishedLabCount=lab.snapshot().publishedRevisions.length;lab.revise({expectedVersion:lab.version});assert.equal(lab.snapshot().publishedRevisions.length,publishedLabCount);
const draftLab=new W03LabDomain({definition:{id:'LAB-D',revision:'1',title:'Draft',environment:{capabilities:[]},requiredTools:[],tasks:[{id:'T',title:'Task',validation:'ok',expectedSignal:'sig'}],dependencies:[]}});draftLab.revise({expectedVersion:draftLab.version});assert.equal(draftLab.snapshot().publishedRevisions.length,0);

const replayOwner=new TimelineReplayOwner(),compareOwner=new AnalyticalCompareOwner();
const results=new W03ResultsDomain({records:[{resultId:'R',revisionId:'1',manifestDigest:'m',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',comparable:{x:{label:'x',type:'string',value:'v'}},recordedEvents:[{seq:1,id:'EV1',type:'START'}]}],timelineReplayOwner:replayOwner,analyticalCompareOwner:compareOwner});const resultSurface=composeResultsSurface({domain:results,shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});const ref={resultId:'R',revisionId:'1',manifestDigest:'m'};assert.throws(()=>results.annotate({ref,text:'bad',anchoredEventRefs:['ghost']}),/RESULT_AAR_EVENT_REF_ABSENT/);assert.equal(results.annotate({ref,text:'good',anchoredEventRefs:['EV1']}).revision,1);assert.equal(resultSurface.bus.availability('results.annotate',{ref:{resultId:'R'}}).enabled,false);assert.equal(resultSurface.bus.availability('results.annotate',{ref}).enabled,true);
console.log('CG4_CONTROLLER_CORR01_W03_LIFECYCLE_TRUTH: PASS');
