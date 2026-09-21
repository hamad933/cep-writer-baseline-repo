import assert from 'node:assert/strict';
import {W03ScenarioDomain} from '../../../adapters/scenarios/domain.js';
import {composeScenariosSurface} from '../../../surfaces/scenarios/index.js';

const shared={structuredHost:{owner:'StructuredSurfaceHost'},spatialRelation:{owner:'RelationInteractionOwner'}};
const domain=new W03ScenarioDomain({definition:{id:'SC-S11',revision:'7',title:'Scenario Studio',roles:[{id:'SOC'}],environment:{capabilities:['SIM_NET'],contractDigest:'env-contract-7'},phases:[{id:'P1',name:'Observe',elements:[{id:'EV-1',kind:'event',title:'Alert'}]},{id:'P2',name:'Contain',elements:[]}]}});
const surface=composeScenariosSurface({domain,shared});
const idsBefore=domain.studioProjection().phases.map(x=>x.id);
surface.bus.execute('scenarios.author',{op:'addElement',phaseId:'P1',element:{id:'INJ-1',kind:'inject',title:'Credential leak'}});
surface.bus.execute('scenarios.author',{op:'addElement',phaseId:'P1',element:{id:'DEC-1',kind:'decision',title:'Escalate',condition:'severity>=high'}});
surface.bus.execute('scenarios.author',{op:'addElement',phaseId:'P2',element:{id:'LAB-1-MOD',kind:'lab',title:'Containment Lab',labRef:{id:'LAB-42',revision:'5'}}});
surface.bus.execute('scenarios.author',{op:'reorderPhase',phaseId:'P2',toIndex:0});
const projected=domain.studioProjection();assert.deepEqual(new Set(projected.phases.map(x=>x.id)),new Set(idsBefore));assert.deepEqual(projected.facets.modules[0].labRef,{id:'LAB-42',revision:'5'});assert.equal(projected.facets.injects.length,1);assert.equal(projected.facets.decisions.length,1);

const resolverUnbound=new W03ScenarioDomain({definition:{id:'SC-UNBOUND',revision:'1',title:'Unbound Lab ref',environment:{capabilities:[]},phases:[{id:'P1',name:'One',elements:[{id:'LM1',kind:'lab',title:'Lab',labRef:{id:'LAB-GHOST',revision:'9'}}]}]}}).validate();assert.equal(resolverUnbound.ok,false);assert(resolverUnbound.requirements.some(x=>x.code==='LAB_REVISION_RESOLVER_UNBOUND'));
const missing=domain.validate({availableCapabilities:[],resolveLab:()=>true,binding:{capabilities:[],contractDigest:'env-contract-7'}});assert.equal(missing.ok,false);assert.equal(missing.bindingStatus,'INCOMPATIBLE');assert(missing.requirements.some(x=>x.id==='environment.capability.SIM_NET'&&x.code==='MISSING_REQUIRED_CAPABILITY'));
const mismatch=domain.validate({availableCapabilities:['SIM_NET'],resolveLab:()=>true,binding:{capabilities:['SIM_NET'],contractDigest:'wrong'}});assert(mismatch.requirements.some(x=>x.id==='environment.contractDigest'&&x.code==='ENVIRONMENT_CONTRACT_DIGEST_MISMATCH'));
const readyContext={availableCapabilities:['SIM_NET'],resolveLab:ref=>ref.id==='LAB-42'&&ref.revision==='5',binding:{capabilities:['SIM_NET'],contractDigest:'env-contract-7',provider:'InternalSimulationAdapter'}};assert.equal(surface.bus.execute('scenarios.validate',readyContext).ok,true);
const draftPrepare=surface.bus.execute('scenarios.prepare',readyContext);assert.equal(draftPrepare.ok,false);assert.equal(draftPrepare.code,'SCENARIO_REVISION_NOT_PUBLISHED');domain.publish({digest:'scenario-digest-7',validationContext:readyContext});
const beforePrepare=JSON.stringify(domain.snapshot().definition),prepared=surface.bus.execute('scenarios.prepare',readyContext);assert.equal(prepared.ok,true);assert.equal(prepared.runStarted,false);assert.equal(prepared.deploymentMutated,false);assert.deepEqual(prepared.inputManifest.labRefs,[{id:'LAB-42',revision:'5'}]);assert(Object.isFrozen(prepared.inputManifest));const changedLatest={id:'LAB-42',revision:'99'};assert.notEqual(changedLatest.revision,prepared.inputManifest.labRefs[0].revision);assert.equal(JSON.stringify(domain.snapshot().definition),beforePrepare);

const selectVersion=domain.version;domain.select({kind:'decision',id:'DEC-1'});assert.equal(domain.selectionContext().id,'DEC-1');assert.equal(domain.version,selectVersion);

const published=new W03ScenarioDomain({status:'PUBLISHED',definition:{id:'SC-PUB',revision:'4',digest:'sha-pub',title:'Published',environment:{capabilities:[]},phases:[{id:'P1',name:'One',elements:[]}]}});const pubSurface=composeScenariosSurface({domain:published,shared});const publishedSource=JSON.stringify(published.snapshot().definition);const denied=pubSurface.bus.execute('scenarios.author',{title:'mutate'});assert.equal(denied.ok,false);assert.equal(denied.code,'PUBLISHED_REVISION_IMMUTABLE');const revised=pubSurface.bus.execute('scenarios.revise',{expectedVersion:published.version});assert.equal(revised.snapshot.lifecycle,'DRAFT');assert.deepEqual(revised.snapshot.sourceLineage,{id:'SC-PUB',revision:'4',digest:'sha-pub',lifecycle:'PUBLISHED'});assert.equal(JSON.stringify(revised.source),publishedSource);assert.equal(revised.snapshot.definition.revision,'5');assert.equal(revised.snapshot.definition.digest,null);

console.log('S11 scenario studio: PASS');
