import assert from 'node:assert/strict';
import {W03V34RunsAdapter} from '../../../adapters/w03-runs.js';
import {W03RunDomain} from '../../../adapters/runs/domain.js';
import {composeRunsSurface} from '../../../surfaces/runs/index.js';

const throwsCode=(fn,expected)=>{let error=null;try{fn()}catch(caught){error=caught}assert.ok(error,`expected ${expected}`);assert.equal(error.code||error.message,expected)};

// INV.1 — runtime effects never rewrite authored definitions or frozen source truth.
{
 const adapter=new W03V34RunsAdapter();const authored=adapter.authored,manifest=JSON.stringify(adapter.manifest),session=adapter.open('DEV-WEB-01');adapter.input(session.id,'shutdown','s12-inv1');assert.equal(adapter.authored,authored);assert.equal(JSON.stringify(adapter.manifest),manifest);assert.equal(adapter.sourceFixture.definitionRevision,'2.4');
}

// INV.2 / runs.operate — terminal lifecycle change requires provider ACK.
{
 const adapter=new W03V34RunsAdapter();const request=adapter.requestLifecycle('pause',{invocationId:'pause-1',expectedVersion:adapter.run.version});assert.equal(request.stage,'REQUESTED');assert.equal(adapter.run.lifecycle,'PAUSE_REQUESTED');assert.ok(adapter.run.pending);adapter.acknowledgeLifecycle('pause-1',{accepted:true,complete:true});assert.equal(adapter.run.lifecycle,'PAUSED');assert.equal(adapter.run.pending,null);
 const stopRequest=adapter.requestLifecycle('stop',{invocationId:'stop-1',expectedVersion:adapter.run.version});assert.equal(adapter.run.lifecycle,'STOP_REQUESTED');assert.notEqual(adapter.run.lifecycle,'STOPPED');adapter.acknowledgeLifecycle(stopRequest.invocationId,{accepted:true,complete:true});assert.equal(adapter.run.lifecycle,'STOPPED');
}

// INV.3 — invocation payload + aggregate version guard.
{
 const adapter=new W03V34RunsAdapter({initialLifecycle:'PREPARING',clock:()=>1000});const version=adapter.run.version;const receipt=adapter.prepare({invocationId:'prepare-1',expectedVersion:version,now:1000});assert.equal(adapter.prepare({invocationId:'prepare-1',expectedVersion:version,now:1000}),receipt);throwsCode(()=>adapter.prepare({invocationId:'prepare-1',expectedVersion:999,now:1000}),'INVOCATION_COLLISION');throwsCode(()=>adapter.prepare({invocationId:'prepare-2',expectedVersion:1,now:1000}),'409');
}

// INV.4 — provider loss is not Run completion.
{
 const domain=new W03RunDomain();const before=domain.runtime.run.lifecycle;const receipt=domain.disconnect();assert.equal(receipt.providerLossIsRunCompletion,false);assert.equal(domain.runtime.run.lifecycle,before);assert.notEqual(domain.runtime.run.lifecycle,'COMPLETED');
}

// INV.5 + runs.prepare/start — preflight expires on source drift or provider epoch drift; frozen manifest stays stable.
{
 const adapter=new W03V34RunsAdapter({initialLifecycle:'PREPARING',clock:()=>1000});const noWriteBefore=JSON.stringify({run:adapter.run,manifest:adapter.manifest});const projected=adapter.preflight({now:1000,ttl:500});assert.equal(projected.status,'READY');assert.equal(JSON.stringify({run:adapter.run,manifest:adapter.manifest}),noWriteBefore);const prepared=adapter.prepare({invocationId:'prepare-current',expectedVersion:adapter.run.version,now:1000});assert.equal(prepared.status,'READY');const frozenRevision=adapter.manifest.definitionRevision,version=adapter.run.version;adapter.setSourceLatest({definitionRevision:'2.5',definitionDigest:'sha256:newer'});assert.equal(adapter.manifest.definitionRevision,frozenRevision);assert.equal(adapter.preflight({now:1100}).status,'BLOCKED');throwsCode(()=>adapter.requestLifecycle('start',{invocationId:'start-drift',expectedVersion:version,now:1100}),'409');
 const clean=new W03V34RunsAdapter({initialLifecycle:'PREPARING',clock:()=>2000});clean.prepare({invocationId:'prepare-clean',expectedVersion:1,now:2000});clean.disconnect();throwsCode(()=>clean.requestLifecycle('start',{invocationId:'start-stale-provider',expectedVersion:2,now:2001}),'PLATFORM_GATED');
}

// runs.start — READY -> STARTING -> RUNNING only after ACK; duplicate invocation is stable.
{
 const adapter=new W03V34RunsAdapter({initialLifecycle:'PREPARING',clock:()=>3000});adapter.prepare({invocationId:'prepare-start',expectedVersion:1,now:3000});const expected=adapter.run.version,request=adapter.requestLifecycle('start',{invocationId:'start-1',expectedVersion:expected,now:3001});assert.equal(adapter.run.lifecycle,'STARTING');assert.equal(adapter.requestLifecycle('start',{invocationId:'start-1',expectedVersion:expected,now:3001}),request);adapter.acknowledgeLifecycle('start-1',{accepted:true,complete:true});assert.equal(adapter.run.lifecycle,'RUNNING');
}

// runs.terminal — stale lease/session rejects input; presentation detach is not a Run lifecycle command.
{
 const adapter=new W03V34RunsAdapter();const session=adapter.open('DEV-WEB-01');adapter.disconnect();throwsCode(()=>adapter.input(session.id,'show status','lease-old'),'PROVIDER_DISCONNECTED');assert.equal(adapter.run.lifecycle,'RUNNING');adapter.reconnect(session.id);const other=adapter.open('DEV-DB-01');adapter.disconnect();adapter.reconnect(session.id);throwsCode(()=>adapter.input(other.id,'show status','lease-stale'),'STALE_SESSION');assert.equal(adapter.run.lifecycle,'RUNNING');
}

// runs.inspect — preserve observed order and expose gaps, never synthesize causal sequence.
{
 const adapter=new W03V34RunsAdapter();adapter.sourceEvents=[{seq:10,type:'A'},{seq:7,type:'B'},{seq:6,type:'C'}];const view=adapter.inspect();assert.deepEqual(view.observedOrder.map(event=>event.seq),[10,7,6]);assert.deepEqual(view.gaps.map(gap=>[gap.missingFrom,gap.missingTo]),[[8,9]]);assert.equal(view.ordering,'OBSERVED_NOT_RECONSTRUCTED');
}

// runs.seal — terminal, reconciled Run produces one immutable handoff preview; Results remains declared authority.
{
 const adapter=new W03V34RunsAdapter();adapter.lifecycle('stop',{invocationId:'seal-stop',expectedVersion:adapter.run.version});const first=adapter.sealPreview(),second=adapter.sealPreview();assert.equal(first,second);assert.equal(first.resultAuthority,'W03ResultsDomain');assert.ok(Object.isFrozen(first));
}

// WORKSPACE_FIRST + truth ceiling — no global read-only mode and no fabricated Windows/real-terminal PASS.
{
 const surface=composeRunsSurface({shared:{spatialRelation:{owner:'RelationInteractionOwner'}}});const workspace=surface.domain.workspace(),truth=surface.domain.truth();assert.equal(surface.contract.interactionModel,'WORKSPACE_FIRST');assert.equal(truth.manifestImmutability,'OBJECT_SCOPED_NOT_SURFACE_READ_ONLY');assert.equal(truth.runtimeTruth,'INTERNAL_SIMULATION');assert.equal(truth.realTerminalProof,'UNVERIFIED_PLATFORM_GATE');assert.equal(surface.truthCeiling.windowsConptyProof,'UNVERIFIED_PLATFORM_GATE');assert.equal(surface.truthCeiling.realProcessExecution,false);assert.ok(workspace.terminalPresentationOwner.includes('OperationalSessionOwner'));assert.ok(workspace.recordedHistoryOwner.includes('TimelineReplayOwner'));
}

console.log('S12 W03 Runs operational workspace: PASS');
