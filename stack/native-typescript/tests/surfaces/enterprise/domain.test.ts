import assert from 'node:assert/strict';
import {createEnterpriseAdapter} from '../../../adapters/w03-enterprise.js';
import {composeEnterpriseSurface} from '../../../surfaces/enterprise/index.js';

const surface=composeEnterpriseSurface({relationAdapter:createEnterpriseAdapter({fixture:true})});
assert.equal(surface.contract.id,'enterprise');
assert.equal(surface.domain.inspect().persistence.status,'UNAVAILABLE');
assert.equal(surface.bus.execute('enterprise.inspect').owner,'W03EnterpriseDomain');

// A successor is not created from an unpublished working revision.
const blockedRevision=surface.bus.execute('enterprise.revise',{expectedVersion:surface.domain.version});
assert.equal(blockedRevision.ok,false);
assert.equal(blockedRevision.code,'SOURCE_REVISION_NOT_PUBLISHED');

// Explicit Baseline -> validation -> publication is required before successor authoring.
surface.bus.execute('enterprise.baseline',{baseline:{status:'AVAILABLE',id:'BL-SURFACE',revision:'1',digest:'digest-surface'}});
const validated=surface.bus.execute('enterprise.validate');
assert.equal(validated.snapshot.authoring,'VALIDATED');
const published=surface.bus.execute('enterprise.publish');
assert.equal(published.snapshot.authoring,'PUBLISHED');
const revision=surface.bus.execute('enterprise.revise',{expectedVersion:surface.domain.version});
assert.equal(revision.ok,true);
assert.equal(revision.source.authoring,'PUBLISHED');
assert.equal(revision.snapshot.authoring,'DRAFT');
assert.equal(revision.snapshot.dirty,false);

// Stale provider state blocks handoff and does not mutate run/device truth.
surface.domain.setTwinBinding({baselineStatus:'STALE'});
const before=surface.domain.receipts.length;
const blocked=surface.bus.execute('enterprise.handoff');
assert.equal(blocked.ok,false);assert.equal(blocked.code,'BASELINE_STALE');assert.equal(surface.domain.receipts.length,before);

const relBefore=surface.domain.relations.project().length;
assert.throws(()=>surface.domain.edit({source:'SIM-ATK-01',target:'APP-WEB-01',type:'CONNECTS_TO',direction:'directed',sourcePin:'bogus',targetPin:'APP-WEB-01:eth0'}));
assert.equal(surface.domain.relations.project().length,relBefore);
assert.equal(surface.platformTruth.osAlwaysOnTop,'UNAVAILABLE');
console.log('enterprise surface: PASS');
