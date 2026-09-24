import assert from 'node:assert/strict';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {composeEnterpriseSurface} from '../../../surfaces/enterprise/index.js';
import {composeLabsSurface} from '../../../surfaces/labs/index.js';
import {W03ResultsDomain} from '../../../adapters/results/domain.js';
import {composeResultsSurface} from '../../../surfaces/results/index.js';
import {composeRunsSurface} from '../../../surfaces/runs/index.js';
import {composeScenariosSurface} from '../../../surfaces/scenarios/index.js';
const sharedSpatial={owner:'RelationInteractionOwner'},sharedStructured={owner:'StructuredSurfaceHost'};
const enterprise=composeEnterpriseSurface({relationAdapter:createEnterpriseAdapter()});
const labs=composeLabsSurface({shared:{structuredHost:sharedStructured,spatialRelation:sharedSpatial}});
const results=composeResultsSurface({domain:new W03ResultsDomain({records:[]}),shared:{spatialRelation:sharedSpatial}});
const runs=composeRunsSurface({shared:{spatialRelation:sharedSpatial}});
const scenarios=composeScenariosSurface({shared:{structuredHost:sharedStructured,spatialRelation:sharedSpatial}});
assert.deepEqual([enterprise.contract.id,labs.contract.id,results.contract.id,runs.contract.id,scenarios.contract.id],['enterprise','labs','results','runs','scenarios']);
for(const s of [enterprise,labs,results,runs,scenarios]){assert.equal(s.contract.centralWiring,'CONTROLLER_CONVERGENCE_REQUIRED');assert.ok(s.ownerBindings.includes('WorkspaceFoundation'));assert.ok(s.ownerBindings.includes('SemanticCommandBus'))}
assert.equal(runs.domain.truth().runtimeTruth,'INTERNAL_SIMULATION');assert.equal(runs.truthCeiling.pty,false);assert.equal(runs.truthCeiling.powershell,false);assert.equal(runs.truthCeiling.ssh,false);
assert.equal(results.truthCeiling.reviewDecision,false);console.log('W03 group regression: PASS');
