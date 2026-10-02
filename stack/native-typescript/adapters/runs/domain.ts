import {W03V34RunsAdapter} from '../w03-runs.js';
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const child of Object.values(value))freeze(child);Object.freeze(value)}return value};
/**
 * H03 residual F02 — FAIL-CLOSED OPERATIONAL SESSION OWNER.
 * The shared `OperationalSessionOwner` (wave4 assembly) must be injected by the composition that
 * owns it. This domain NEVER instantiates one: when injection is absent/undefined `sessionOwner`
 * stays `null` and every session-bound operation refuses with `RUNS_SESSION_OWNER_REQUIRED`
 * instead of silently creating a second, private owner that would weaken the singleton.
 * Owner-independent projections (preflight/prepare/start/inspect/recorded/workspace/truth) stay
 * truthful and available so a missing binding degrades to an explicit fail-closed state, never to
 * a crash and never to fabricated terminal/session success.
 */
export class W03RunDomain {
  constructor({runtime=new W03V34RunsAdapter(),sessionOwner=null}={}){this.owner='W03RunDomain';this.runtime=runtime;this.sessionOwner=sessionOwner||null;if(this.sessionOwner){if(typeof this.sessionOwner.registerProvider!=='function'){const error=new Error('RUNS_SESSION_OWNER_INVALID: injected session owner cannot register a provider');error.code='RUNS_SESSION_OWNER_INVALID';throw error}this.sessionOwner.registerProvider(runtime,{classification:'REAL_RUNTIME_PROVIDER',evidenceRole:'Runs InternalSimulation runtime truth'})}this.presentationByDevice=new Map()}
  requireSessionOwner(operation){if(!this.sessionOwner){const error=new Error(`RUNS_SESSION_OWNER_REQUIRED: ${operation} refuses without the injected shared OperationalSessionOwner (fail closed; no local fallback owner is created)`);error.code='RUNS_SESSION_OWNER_REQUIRED';throw error}return this.sessionOwner}
  preflight(payload={}){return this.runtime.preflight(payload)}
  prepare(payload={}){return this.runtime.prepare(payload)}
  start(payload={}){return this.runtime.lifecycle('start',payload)}
  requestOperation(action,payload={}){return this.runtime.requestLifecycle(action,payload)}
  acknowledgeOperation(invocationId,payload={}){return this.runtime.acknowledgeLifecycle(invocationId,payload)}
  openTerminal({deviceId}){this.requireSessionOwner('openTerminal');const existingId=this.presentationByDevice.get(deviceId),existing=existingId?this.sessionOwner.tab(existingId):null;if(existing)return freeze({ok:true,provider:this.runtime.descriptor(),tab:existing,runtimeTruth:'INTERNAL_SIMULATION',reusedPresentation:true});const session=this.runtime.open(deviceId);const tab=this.sessionOwner.attachProviderSession(this.runtime,session.id,{classification:'REAL_RUNTIME_PROVIDER',evidenceRole:'Runs InternalSimulation runtime truth'});this.presentationByDevice.set(deviceId,tab.presentationId);return freeze({ok:true,provider:this.runtime.descriptor(),tab,runtimeTruth:'INTERNAL_SIMULATION',reusedPresentation:false})}
  input({deviceId,command,invocationId}){this.requireSessionOwner('input');const presentationId=this.presentationByDevice.get(deviceId);if(!presentationId)throw Error('RUN_TERMINAL_NOT_OPEN');const tab=this.sessionOwner.tab(presentationId);return this.runtime.input(tab.runtimeSessionId,String(command||''),String(invocationId||`runs-${Date.now()}`))}
  disconnect(){const lifecycle=this.runtime.run.lifecycle;this.runtime.disconnect();return freeze({connected:false,epoch:this.runtime.epoch,lifecycle,runtimeTruth:'INTERNAL_SIMULATION',providerLossIsRunCompletion:false})}
  reconnect({deviceId}){this.requireSessionOwner('reconnect');const presentationId=this.presentationByDevice.get(deviceId);if(!presentationId)throw Error('RUN_TERMINAL_NOT_OPEN');const tab=this.sessionOwner.tab(presentationId);const session=this.runtime.reconnect(tab.runtimeSessionId);return freeze({connected:true,session:structuredClone(session),lifecycle:this.runtime.run.lifecycle,runtimeTruth:'INTERNAL_SIMULATION'})}
  pause(payload={}){return this.runtime.lifecycle('pause',payload)}
  resume(payload={}){return this.runtime.lifecycle('resume',payload)}
  stop(payload={}){return this.runtime.lifecycle('stop',payload)}
  inspect(){return this.runtime.inspect()}
  sealPreview(){return this.runtime.sealPreview()}
  recorded(){return freeze(this.runtime.recorded())}
  /**
   * Run operations projection for the surface. Everything returned here is derived from the
   * v3.4 fixture / live adapter state — nothing is invented, no success is fabricated.
   * Added fields: parsed mode policy, source tabs, honest counts, observation log,
   * captured artifacts, lifecycle receipts and per-device session presence.
   */
  workspace(){const fixture=this.runtime.sourceFixture,inspection=this.runtime.inspect(),
    alerts=structuredClone(fixture.alerts||[]),events=inspection.observedOrder,logs=structuredClone(fixture.logs||[]),
    snapshots=structuredClone(fixture.snapshots||[]),tasks=structuredClone(fixture.tasks||[]),
    devices=structuredClone(this.runtime.devices),
    modeParts=String(fixture.mode||'').split('/').map(part=>part.trim()).filter(Boolean),
    sourceMap=new Map();
  for(const alert of alerts){const key=alert.source||'Unknown';const cell=sourceMap.get(key)||{id:key,label:key,alerts:0,events:0};cell.alerts++;sourceMap.set(key,cell)}
  for(const event of events){const key=event.source||'Unknown';const cell=sourceMap.get(key)||{id:key,label:key,alerts:0,events:0};cell.events++;sourceMap.set(key,cell)}
  const sources=[...sourceMap.values()].sort((a,b)=>(b.alerts+b.events)-(a.alerts+a.events)||(a.id<b.id?-1:1));
  const activeTasks=tasks.filter(task=>task.status==='ACTIVE');
  return freeze({identity:{runId:this.runtime.runId,title:fixture.title,titleAr:fixture.titleAr,runType:fixture.runType,phase:fixture.phase,role:fixture.role,task:fixture.task,health:fixture.health,provenance:fixture.provenance,enterprise:fixture.enterprise,definitionId:fixture.definitionId,definitionRevision:fixture.definitionRevision,baselineId:fixture.baselineId,twinRevision:fixture.twinRevision},
    mode:{raw:fixture.mode,parts:modeParts,guidance:modeParts[0]||'—',participation:modeParts[1]||'—',rolePolicy:modeParts[2]||'—'},
    run:structuredClone(this.runtime.run),manifest:structuredClone(this.runtime.manifest),preflight:this.runtime.preflight(),provider:{...this.runtime.descriptor(),epoch:this.runtime.epoch},
    alerts,events,gaps:inspection.gaps,tasks,devices,observations:logs,artifacts:snapshots,snapshots,logs,
    sources,counts:{alerts:alerts.length,events:events.length,tasks:tasks.length,devices:devices.length,observations:logs.length,artifacts:snapshots.length,done:tasks.filter(task=>task.status==='DONE').length,active:activeTasks.length},
    activeTask:activeTasks[0]||tasks.find(task=>task.status!=='DONE')||null,
    lifecycleReceipts:structuredClone(this.runtime.lifecycleReceipts||[]),
    terminalPresentationOwner:'OperationalSessionOwner + OperationalTerminalHost',
    openSessions:deviceIds=>{const open=[];for(const [deviceId,presentationId] of this.presentationByDevice){if(!deviceIds||deviceIds.includes(deviceId))open.push({deviceId,presentationId,attached:this.sessionOwner?this.sessionOwner.tab(presentationId)!=null:false})}return freeze(open)},
    recordedHistoryOwner:'TimelineReplayOwner binding required; recorded playback is inert'})}
  truth(){const descriptor=this.runtime.descriptor(),owner=this.sessionOwner,platform=owner?(owner.platformWindowBridge?.descriptor?.()||owner.platformWindowBridge?.snapshot?.()||null):null;return freeze({owner:this.owner,canonicalStateOwner:'W03RunDomain + InternalSimulationAdapter',provider:descriptor.id,runtimeTruth:descriptor.runtimeTruth,providerConnected:descriptor.connected,providerEpoch:this.runtime.epoch,pty:descriptor.pty,powershell:descriptor.powershell,ssh:descriptor.ssh,nativeWindow:platform?.availability==='AVAILABLE'||platform?.available===true,osAlwaysOnTop:platform?.topmostAvailable===true||false,platformWindow:platform,persistence:descriptor.persistence,operationalSessionOwner:owner?owner.owner:null,sessionOwnerBinding:owner?'INJECTED_SHARED_OWNER':'ABSENT_FAIL_CLOSED',sessionOwnerFallbackCreated:false,realTerminalProof:'UNVERIFIED_PLATFORM_GATE',surfaceInteraction:'WORKSPACE_FIRST',manifestImmutability:'OBJECT_SCOPED_NOT_SURFACE_READ_ONLY'})}
}
