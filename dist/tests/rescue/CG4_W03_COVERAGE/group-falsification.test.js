import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {TimelineReplayOwner} from '../../../foundation/timeline/replay.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';
import {OperationalSessionOwner} from '../../../foundation/operational/session-owner.js';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {W03EnterpriseDomain} from '../../../adapters/enterprise/domain.js';
import {W03ScenarioDomain} from '../../../adapters/scenarios/domain.js';
import {W03LabDomain} from '../../../adapters/labs/domain.js';
import {composeW03RescueGroup} from '../../../surfaces/composition/w03-rescue.js';

const shared={structuredHost:{owner:'StructuredSurfaceHost'},spatialRelation:{owner:'RelationInteractionOwner'},timelineReplayOwner:new TimelineReplayOwner(),analyticalCompareOwner:new AnalyticalCompareOwner(),operationalSessionOwner:new OperationalSessionOwner()};
const enterpriseAdapter=createEnterpriseAdapter();const enterpriseDomain=new W03EnterpriseDomain({relationAdapter:enterpriseAdapter,authoring:'PUBLISHED',revisionId:'ENT-PUBLISHED',baseline:{status:'AVAILABLE',id:'BL-1',revision:'1',digest:'sha256:baseline'}});
const scenarioDomain=new W03ScenarioDomain({definition:{id:'SC-PUB',revision:'1',title:'Published',roles:[],environment:{capabilities:[]},phases:[],rules:[],observability:[],completion:[]},status:'PUBLISHED'});
const labDomain=new W03LabDomain({definition:{id:'LAB-PUB',revision:'1',title:'Published',tasks:[],dependencies:[],requiredTools:[],environment:{capabilities:[]}},status:'PUBLISHED'});
const group=composeW03RescueGroup({shared,enterprise:{domain:enterpriseDomain,relationAdapter:enterpriseAdapter},scenarios:{domain:scenarioDomain},labs:{domain:labDomain},results:{domainOptions:{records:[{resultId:'SEALED',revisionId:'1',manifestDigest:'sha256:sealed',sealed:true,schemaVersion:'1',comparatorVersion:'results-compare/1.0.0',recordedEvents:[{seq:1,type:'START'}],comparable:{state:{label:'State',type:'string',value:'SEALED'}}}]}}});

assert.equal(group.commandState('enterprise','enterprise.edit').enabled,false);assert.equal(group.execute('enterprise','enterprise.inspect',{id:'APP-WEB-01'}).selection.id,'APP-WEB-01');assert.equal(group.execute('enterprise','enterprise.revise',{expectedVersion:1}).snapshot.authoring,'DRAFT');
assert.equal(group.commandState('scenarios','scenarios.author').enabled,false);assert.equal(group.execute('scenarios','scenarios.revise',{}).snapshot.lifecycle,'DRAFT');
assert.equal(group.commandState('labs','labs.author').enabled,false);assert.equal(group.execute('labs','labs.revise',{}).snapshot.lifecycle,'DRAFT');
const resultRef={resultId:'SEALED',revisionId:'1',manifestDigest:'sha256:sealed'};const replay=group.execute('results','results.replay',resultRef);assert.equal(replay.replayExecutesRuntime,false);assert.equal(group.surfaces.results.truthCeiling.sealedFactsMutable,false);assert.equal(group.surfaces.results.truthCeiling.workspaceReadOnly,false);
const src=fs.readFileSync(path.join(process.cwd(),'stack/native-typescript/surfaces/composition/w03-rescue.ts'),'utf8');for(const ownerName of ['TimelineReplayOwner','AnalyticalCompareOwner','SpatialInteractionKernel','WorkspacePaneLayoutOwner','OperationalSessionOwner']){const forbidden=`class ${ownerName}`;assert.equal(src.includes(forbidden),false,forbidden);}
const main=fs.readFileSync(path.join(process.cwd(),'stack/native-typescript/main.ts'),'utf8'),m0=fs.readFileSync(path.join(process.cwd(),'stack/native-typescript/surfaces/m0-controller-composition.ts'),'utf8');assert.ok(main.length>0&&m0.length>0);
console.log('CG4 W03 falsification: PASS');
