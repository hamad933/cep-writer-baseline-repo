import assert from 'node:assert/strict';
import {W03LabDomain} from '../../../adapters/labs/domain.js';
import {composeLabsSurface} from '../../../surfaces/labs/index.js';
const domain=new W03LabDomain({definition:{id:'LAB-1',revision:'3',title:'تحليل ويب / Web analysis',tasks:[{id:'T1',title:'Observe',validation:'event',expectedSignal:'signal'}],dependencies:[],requiredTools:[{id:'proxy',revision:'2',simulated:true}]}});
const surface=composeLabsSurface({domain,shared:{structuredHost:{owner:'StructuredSurfaceHost'},spatialRelation:{owner:'RelationInteractionOwner'}}});
const ready=surface.bus.execute('labs.preflight',{tools:{proxy:{revision:'2'}}});assert.equal(ready.status,'READY');assert.equal(ready.simulationExplicit,true);
const handoff=surface.bus.execute('labs.handoff',{tools:{proxy:{revision:'2'}}});assert.equal(handoff.ok,true);assert.equal(handoff.runCreated,false);assert.equal(handoff.runtimeStateCreated,false);
const before=domain.version;const blocked=surface.bus.execute('labs.handoff',{tools:{}});assert.equal(blocked.ok,false);assert.equal(blocked.code,'LAB_PREFLIGHT_BLOCKED');assert.equal(domain.version,before);
domain.author({tasks:[{id:'T1',title:'Observe',validation:'UNBOUND',expectedSignal:''}]});assert.equal(domain.validate().ok,false);assert.equal(domain.snapshot().persistence.status,'UNAVAILABLE');console.log('labs surface: PASS');
