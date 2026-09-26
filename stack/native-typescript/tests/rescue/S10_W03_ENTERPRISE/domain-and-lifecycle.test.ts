import assert from 'node:assert/strict';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {W03EnterpriseDomain} from '../../../adapters/enterprise/domain.js';
import {composeEnterpriseSurface} from '../../../surfaces/enterprise/index.js';

const adapter=createEnterpriseAdapter({fixture:true});
assert.equal(adapter.canonicalProductTruth,false);
assert.equal(adapter.sourceClassification,'FIXTURE_ONLY__NOT_PRODUCT_TRUTH');
const surface=composeEnterpriseSurface({relationAdapter:adapter});
assert.equal(surface.contract.interaction,'WORKSPACE_FIRST');
assert.equal(surface.contract.globalReadEditMode,false);
assert.equal(surface.domain.snapshot().surfaceReadOnly,false);

// INV.1 / INV.2: Twin identity and Simulation-local classification stay explicit.
const initial=surface.domain.snapshot();
assert.notEqual(initial.enterpriseId,initial.twinId);
assert.ok(initial.objects.some(o=>o.classification==='SIMULATION_LOCAL'&&!o.canonicalEnterpriseInventory));

// inspect: no selection clears prior context rather than retaining the previous object.
surface.bus.execute('enterprise.inspect',{id:'APP-WEB-01'});
assert.equal(surface.domain.snapshot().selection.id,'APP-WEB-01');
surface.bus.execute('enterprise.inspect',{});
assert.equal(surface.domain.snapshot().selection.kind,'NONE');
assert.equal(surface.domain.snapshot().selection.id,null);

// edit: validation happens before write and an invalid interface leaves canonical relations unchanged.
const beforeRelations=adapter.project().length;
assert.throws(()=>surface.domain.edit({source:'SIM-ATK-01',target:'APP-WEB-01',type:'CONNECTS_TO',direction:'directed',sourcePin:'bogus',targetPin:'APP-WEB-01:eth0'}));
assert.equal(adapter.project().length,beforeRelations);

// Geometry in shared SpatialView is intentionally outside this domain owner and cannot create relation truth.
const canonicalBefore=JSON.stringify(adapter.project());
adapter.nodes[0].x+=25;adapter.nodes[0].y+=15;
assert.equal(JSON.stringify(adapter.project()),canonicalBefore);

// Lifecycle truth: publication cannot bypass explicit validation, and later mutation invalidates validation.
const lifecycleAdapter=createEnterpriseAdapter({fixture:true});
const lifecycle=composeEnterpriseSurface({relationAdapter:lifecycleAdapter});
assert.equal(lifecycle.bus.availability('enterprise.publish').enabled,false);
const blockedPublish=lifecycle.domain.publish();
assert.equal(blockedPublish.ok,false);assert.equal(blockedPublish.code,'ENTERPRISE_VALIDATION_REQUIRED_BEFORE_PUBLISH');
lifecycle.bus.execute('enterprise.baseline',{baseline:{status:'AVAILABLE',id:'BL-LIFE',revision:'1',digest:'digest-life'}});
assert.equal(lifecycle.domain.snapshot().twinBinding,'DETACHED');
assert.equal(lifecycle.bus.availability('enterprise.twin').enabled,false);
assert.equal(lifecycle.bus.availability('enterprise.publish').enabled,false);
const validated=lifecycle.bus.execute('enterprise.validate');
assert.equal(validated.ok,true);assert.equal(validated.snapshot.authoring,'VALIDATED');
assert.equal(lifecycle.bus.availability('enterprise.publish').enabled,true);
const publishedLifecycle=lifecycle.bus.execute('enterprise.publish');
assert.equal(publishedLifecycle.ok,true);assert.equal(publishedLifecycle.snapshot.authoring,'PUBLISHED');
const draftRevise=surface.bus.execute('enterprise.revise',{expectedVersion:surface.domain.version});
assert.equal(draftRevise.ok,false);assert.equal(draftRevise.code,'SOURCE_REVISION_NOT_PUBLISHED');

// Mutation after successful validation returns the working revision to DIRTY.
const dirtyAdapter=createEnterpriseAdapter({fixture:true});
const dirtySurface=composeEnterpriseSurface({relationAdapter:dirtyAdapter});
dirtySurface.bus.execute('enterprise.baseline',{baseline:{status:'AVAILABLE',id:'BL-DIRTY',revision:'1',digest:'digest-dirty'}});
dirtySurface.bus.execute('enterprise.validate');
const dirtyMutation=dirtySurface.bus.execute('enterprise.create',{enterpriseId:`${dirtySurface.domain.snapshot().enterpriseId}-UPDATED`});
assert.equal(dirtyMutation.ok,true);assert.equal(dirtyMutation.snapshot.authoring,'DIRTY');
assert.equal(dirtySurface.bus.availability('enterprise.publish').enabled,false);

// Published revision remains interactive for inspect but domain mutation is unavailable.
const publishedAdapter=createEnterpriseAdapter({fixture:true});
const publishedDomain=new W03EnterpriseDomain({relationAdapter:publishedAdapter,authoring:'PUBLISHED',revisionId:'ENT-REV-900-PUBLISHED',baseline:{status:'AVAILABLE',id:'BL-900',revision:'900',digest:'digest-900'}});
const published=composeEnterpriseSurface({relationAdapter:publishedAdapter,domain:publishedDomain});
assert.equal(published.bus.availability('enterprise.edit').enabled,false);
assert.equal(published.bus.execute('enterprise.inspect',{id:'APP-WEB-01'}).selection.id,'APP-WEB-01');
const baselineDigest=publishedDomain.snapshot().baseline.digest;
const revision=published.bus.execute('enterprise.revise',{expectedVersion:1,reason:'successor'});
assert.equal(revision.source.authoring,'PUBLISHED');
assert.equal(revision.snapshot.authoring,'DRAFT');
assert.equal(revision.snapshot.baseline.digest,baselineDigest);
assert.ok(revision.snapshot.lineage.some(x=>x.sourceRevisionId==='ENT-REV-900-PUBLISHED'));

// Twin rebase requires explicit classification and conflict resolution, and preserves Simulation-local inventory identity.
publishedDomain.setTwinBinding({baselineStatus:'STALE'});
const invalid=published.bus.execute('enterprise.twin',{action:'rebaseTwin',overlayRefs:[{id:'SIM-ATK-01'}],conflictsResolved:true,targetBaseline:{id:'BL-901',revision:'901',digest:'digest-901'}});
assert.equal(invalid.ok,false);assert.equal(invalid.code,'OVERLAY_CLASSIFICATION_REQUIRED');
const unresolved=published.bus.execute('enterprise.twin',{action:'rebaseTwin',overlayRefs:publishedDomain.snapshot().objects.map(o=>({id:o.id,classification:o.classification})),conflictsResolved:false,targetBaseline:{id:'BL-901',revision:'901',digest:'digest-901'}});
assert.equal(unresolved.ok,false);assert.equal(unresolved.code,'TWIN_REBASE_CONFLICT_RESOLUTION_REQUIRED');
const simBefore=publishedDomain.snapshot().objects.filter(o=>o.classification==='SIMULATION_LOCAL').map(o=>o.id).sort();
const rebound=published.bus.execute('enterprise.twin',{action:'rebaseTwin',overlayRefs:publishedDomain.snapshot().objects.map(o=>({id:o.id,classification:o.classification})),conflictsResolved:true,targetBaseline:{id:'BL-901',revision:'901',digest:'digest-901'}});
assert.equal(rebound.ok,true);assert.equal(rebound.snapshot.twinBinding,'BOUND');
assert.deepEqual(rebound.snapshot.objects.filter(o=>o.classification==='SIMULATION_LOCAL').map(o=>o.id).sort(),simBefore);

// Handoff is preflight-only: no run start and no live device mutation.
const handoffDomain=new W03EnterpriseDomain({relationAdapter:createEnterpriseAdapter({fixture:true}),authoring:'PUBLISHED',revisionId:'ENT-REV-901-PUBLISHED',baseline:{status:'AVAILABLE',id:'BL-901',revision:'901',digest:'digest-901'}});
const handoffSurface=composeEnterpriseSurface({relationAdapter:handoffDomain.relations,domain:handoffDomain});
const nodeTruth=JSON.stringify(handoffDomain.relations.nodes),handoff=handoffSurface.bus.execute('enterprise.handoff');
assert.equal(handoff.ok,true);assert.equal(handoff.runStarted,false);assert.equal(handoff.liveDeviceChanges,0);assert.equal(handoff.preflightOnly,true);assert.equal(JSON.stringify(handoffDomain.relations.nodes),nodeTruth);

console.log('S10 domain and lifecycle: PASS');
