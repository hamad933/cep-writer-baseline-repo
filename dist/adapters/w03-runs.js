import {InternalSimulationAdapter,SimulatedDeviceEngine} from './simulation.js';
import {fixture} from './w03-v34/runs-fixture.js';
import {requestRun,acknowledgeRun,completeRun,preflight as projectPreflight,seal as sealRun} from './w03-v34/domain-kernel.js';

const copy=value=>structuredClone(value);
const canonical=value=>value===null||typeof value!=='object'?JSON.stringify(value):Array.isArray(value)?`[${value.map(canonical).join(',')}]`:`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
const compactDigest=value=>{const text=canonical(value);let hash=2166136261;for(let index=0;index<text.length;index++){hash^=text.charCodeAt(index);hash=Math.imul(hash,16777619)}return `fixture-fnv1a32:${(hash>>>0).toString(16).padStart(8,'0')}`};
const fail=(code,message)=>{const error=new Error(message);error.code=code;throw error};
const immutable=value=>{const visit=item=>{if(item&&typeof item==='object'&&!Object.isFrozen(item)){for(const child of Object.values(item))visit(child);Object.freeze(item)}return item};return visit(copy(value))};

/**
 * Bounded W03 Runs adapter over the exact v3.4 fixture.
 * It owns Runs lifecycle/input truth only. xterm/window/Windows providers remain shared/external owners.
 */
export class W03V34RunsAdapter extends InternalSimulationAdapter {
 constructor({initialLifecycle=fixture.lifecycle,clock=()=>Date.now(),preflightTtl=60000}={}){
  super();
  this.runId=fixture.runId;
  this.lineage='W03_v3.4';
  this.clock=clock;
  this.preflightTtl=preflightTtl;
  this.sourceFixture=copy(fixture);
  this.engine=new SimulatedDeviceEngine(fixture.devices.map(device=>({...device,up:true,capabilities:['OPEN_TERMINAL'],version:1})));
  this.devices=this.engine.devices;
  this.authored=JSON.stringify(this.devices);
  this.run={id:this.runId,lifecycle:initialLifecycle,version:1,pending:null,lastReceipt:null};
  this.sourceLatest={definitionId:fixture.definitionId,definitionRevision:fixture.definitionRevision,definitionDigest:fixture.definitionDigest,environmentDigest:fixture.environmentDigest,baselineId:fixture.baselineId,baselineDigest:fixture.baselineDigest,twinRevision:fixture.twinRevision,seed:fixture.seed,mode:fixture.mode,runType:fixture.runType};
  this.manifest=immutable({id:fixture.manifestId,version:fixture.manifestVersion,createdAt:fixture.manifestCreatedAt,digest:fixture.manifestDigest,inputDigest:fixture.inputDigest,isolationScope:fixture.isolationScope,definitionId:fixture.definitionId,definitionRevision:fixture.definitionRevision,definitionDigest:fixture.definitionDigest,environmentDigest:fixture.environmentDigest,baselineId:fixture.baselineId,baselineDigest:fixture.baselineDigest,twinRevision:fixture.twinRevision,seed:fixture.seed,mode:fixture.mode,runType:fixture.runType,provenance:fixture.provenance,engine:'InternalSimulationAdapter'});
  this.sourceEvents=copy(fixture.events);
  this.lifecycleReceipts=[];
  this.lifecycleTransitions=[];
  this.prepareInvocations=new Map();
  this.lifecycleInvocations=new Map();
  this.sealedReceipt=null;
 }
 currentInput(){const current=copy(this.sourceLatest);const exactFixture=current.definitionRevision===fixture.definitionRevision&&current.definitionDigest===fixture.definitionDigest&&current.environmentDigest===fixture.environmentDigest&&current.baselineDigest===fixture.baselineDigest&&current.twinRevision===fixture.twinRevision&&current.seed===fixture.seed&&current.mode===fixture.mode&&current.runType===fixture.runType;return {...current,inputDigest:exactFixture?fixture.inputDigest:compactDigest(current)}}
 setSourceLatest(patch={}){this.sourceLatest={...this.sourceLatest,...copy(patch)};return copy(this.sourceLatest)}
 preflight({now=this.clock(),ttl=this.preflightTtl}={}){const current=this.currentInput(),checks=[
  {id:'source.definition',label:'Source definition revision',status:current.definitionId===this.manifest.definitionId&&current.definitionRevision===this.manifest.definitionRevision&&current.definitionDigest===this.manifest.definitionDigest?'PASS':'BLOCKED',detail:`${current.definitionId}@${current.definitionRevision}`},
  {id:'environment.binding',label:'Environment / baseline binding',status:current.environmentDigest===this.manifest.environmentDigest&&current.baselineId===this.manifest.baselineId&&current.baselineDigest===this.manifest.baselineDigest?'PASS':'BLOCKED',detail:`${current.baselineId} · ${current.twinRevision}`},
  {id:'runtime.provider',label:'Internal simulation provider',status:this.connected?'PASS':'BLOCKED',detail:this.connected?`CONNECTED · epoch ${this.epoch}`:`DISCONNECTED · epoch ${this.epoch}`},
  {id:'manifest.integrity',label:'Frozen run manifest',status:Object.isFrozen(this.manifest)&&this.manifest.inputDigest?'PASS':'BLOCKED',detail:`${this.manifest.id} · v${this.manifest.version}`},
  {id:'terminal.platform',label:'Real Windows terminal capability',status:'ADVISORY',detail:'Separate platform gate; InternalSimulationAdapter remains valid runtime truth.'}
 ];return immutable({...projectPreflight(checks,current.inputDigest,this.epoch,now,ttl),kind:'NO_WRITE_PREFLIGHT',source:current,runId:this.runId,manifestId:this.manifest.id,runtimeTruth:'INTERNAL_SIMULATION'})}
 prepare({invocationId='prepare-1',expectedVersion=this.run.version,now=this.clock()}={}){const payload={invocationId,expectedVersion,source:this.currentInput(),providerEpoch:this.epoch},digest=canonical(payload);if(this.prepareInvocations.has(invocationId)){const prior=this.prepareInvocations.get(invocationId);if(prior.digest!==digest)fail('INVOCATION_COLLISION','Prepare invocation payload changed');return prior.receipt}if(expectedVersion!==this.run.version)fail('409','Expected Run aggregate version does not match current version');if(!['PREPARING','BLOCKED','READY'].includes(this.run.lifecycle))fail('409','Prepare is only available before an active Run starts');const projected=this.preflight({now});const status=projected.status==='READY'?'READY':'BLOCKED';const current=this.currentInput();if(status==='READY')this.manifest=immutable({...this.manifest,version:this.manifest.version+1,createdAt:new Date(now).toISOString(),inputDigest:current.inputDigest,definitionId:current.definitionId,definitionRevision:current.definitionRevision,definitionDigest:current.definitionDigest,environmentDigest:current.environmentDigest,baselineId:current.baselineId,baselineDigest:current.baselineDigest,twinRevision:current.twinRevision,seed:current.seed,mode:current.mode,runType:current.runType,digest:compactDigest(current)});this.run={...this.run,lifecycle:status,pending:null,version:this.run.version+1,lastReceipt:status==='READY'?'PREPARED':'PREPARE_BLOCKED'};const receipt=immutable({ok:status==='READY',status,run:copy(this.run),manifest:this.manifest,preflight:projected,invocationId,expectedVersion,runtimeTruth:'INTERNAL_SIMULATION'});this.prepareInvocations.set(invocationId,{digest,receipt});return receipt}
 requestLifecycle(action,{invocationId=`lifecycle-${this.lifecycleReceipts.length+1}`,expectedVersion=this.run.version,now=this.clock()}={}){const payload={action,invocationId,expectedVersion,providerEpoch:this.epoch},digest=canonical(payload);if(this.lifecycleInvocations.has(invocationId)){const prior=this.lifecycleInvocations.get(invocationId);if(prior.digest!==digest)fail('INVOCATION_COLLISION','Lifecycle invocation payload changed');return prior.receipt}if(expectedVersion!==this.run.version)fail('409','Expected Run aggregate version does not match current version');const before=copy(this.run),ctx={invocationId,providerEpoch:this.epoch,connection:this.connected?'CONNECTED':'DISCONNECTED',supported:true,now,preflight:action==='start'?this.preflight({now}):undefined,inputDigest:this.manifest.inputDigest};this.run=requestRun(this.run,action,ctx);const receipt=immutable({stage:'REQUESTED',action,before,after:copy(this.run),invocationId,providerEpoch:this.epoch,runtimeTruth:'INTERNAL_SIMULATION'});this.lifecycleInvocations.set(invocationId,{digest,receipt});this.lifecycleTransitions.push(receipt);return receipt}
 acknowledgeLifecycle(invocationId,{accepted=true,complete=true}={}){if(!this.run.pending||this.run.pending.invocationId!==invocationId)fail('409','No matching pending Run lifecycle request');const before=copy(this.run),providerReceipt={invocationId,providerEpoch:this.epoch,accepted};this.run=acknowledgeRun(this.run,providerReceipt);const acknowledged=copy(this.run);if(accepted&&complete)this.run=completeRun(this.run,providerReceipt);const receipt=immutable({stage:accepted?(complete?'COMPLETED':'ACKNOWLEDGED'):'REJECTED',action:before.pending.action,before,acknowledged,after:copy(this.run),invocationId,providerEpoch:this.epoch,accepted,runtimeTruth:'INTERNAL_SIMULATION'});this.lifecycleTransitions.push(receipt);if(receipt.stage==='COMPLETED'||receipt.stage==='REJECTED')this.lifecycleReceipts.push({action:receipt.action,after:receipt.after.lifecycle,version:receipt.after.version,invocationId:receipt.invocationId});return receipt}
 lifecycle(action,options={}){const requested=this.requestLifecycle(action,options);return this.acknowledgeLifecycle(requested.invocationId,{accepted:true,complete:true}).after}
 input(id,command,invocation){if(this.run.lifecycle!=='RUNNING')throw Error('RUN_NOT_RUNNING');return super.input(id,command,invocation)}
 inspect(){const observed=copy(this.sourceEvents),gaps=[];for(let index=1;index<observed.length;index++){const a=Number(observed[index-1]?.seq),b=Number(observed[index]?.seq);if(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)>1)gaps.push({observedIndex:index,from:a,to:b,missingFrom:Math.min(a,b)+1,missingTo:Math.max(a,b)-1})}return immutable({runId:this.runId,observedOrder:observed,gaps,ordering:'OBSERVED_NOT_RECONSTRUCTED',runtimeTruth:'INTERNAL_SIMULATION'})}
 sealPreview(){if(this.sealedReceipt)return this.sealedReceipt;const inspection=this.inspect();const reconciled=inspection.gaps.length===0;const sealed=sealRun(this.run,inspection.observedOrder,reconciled,inspection.gaps,null);this.sealedReceipt=immutable({...sealed,kind:'RUN_SEAL_HANDOFF_PREVIEW',resultAuthority:'W03ResultsDomain',runtimeTruth:'INTERNAL_SIMULATION'});return this.sealedReceipt}
 recorded(){return immutable({...super.recorded(),manifest:this.manifest,sourceEvents:copy(this.sourceEvents),inspection:this.inspect(),lifecycle:copy(this.run),lineage:this.lineage,recordedPlayback:'INERT',timelineReplayOwner:'SHARED_BINDING_REQUIRED'})}
}
