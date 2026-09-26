import {createBoundedLocalRuntimeTransport} from './runtime/local-runtime-transport.js';
import {mountBackupSurface,BACKUP_COMMANDS} from '../surfaces/backup/index.js';
export {BACKUP_COMMANDS};

const clone=value=>value===undefined?undefined:structuredClone(value);
const now=()=>new Date().toISOString();
const nonEmpty=value=>typeof value==='string'&&value.length>0;
export const BACKUP_DOMAIN_OWNER='BackupRuntimeAdapter';

function packageIdentityComplete(pkg:any){
  return !!pkg&&nonEmpty(pkg.packageId)&&nonEmpty(pkg.manifestSha256)&&nonEmpty(pkg.snapshotSha256)&&nonEmpty(pkg.schemaArtifactSha256);
}
function receiptPackageId(receipt:any){
  return receipt?.packageId??receipt?.packageIdentity?.packageId??null;
}
function safeProviderFailure(code:string,receipt:any,detail:any={}){
  return {ok:false,code,liveRestored:false,productionDatabaseMutated:false,providerReceipt:clone(receipt),...clone(detail)};
}

export class BackupRuntimeAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport(),clock=now}={}){
    this.owner=BACKUP_DOMAIN_OWNER;this.transport=transport;this.clock=clock;this.attemptSeq=0;
    this.state={packages:[],selectedPackageId:null,plan:null,preview:null,stage:null,lastDrill:null,lastActivation:null,lastError:null,attemptHistory:[],durableFailureJournal:{status:'UNAVAILABLE_LOCKED_PROVIDER_SEAM',owner:'BackupRestoreCapability',required:'durable failed-attempt + original error + compensation-attempt/result journal'}};
  }
  descriptor(){return {owner:this.owner,capabilityOwner:'BackupRestoreCapability',transport:this.transport.descriptor(),activationAuthority:false,persistenceOwnerMutation:false,liveRestoreOwned:false};}
  snapshot(){return clone(this.state);}
  _attempt(operation,status,detail={}){const row={attemptId:`backup-ui-attempt-${++this.attemptSeq}`,operation,status,at:this.clock(),...clone(detail)};this.state.attemptHistory.push(row);return row;}
  _package(){return this.state.packages.find(row=>row.packageId===this.state.selectedPackageId)||this.state.packages.at(-1)||null;}
  _planBound(pkg=this._package()){
    const p=this.state.plan;
    return !!pkg&&!!p&&nonEmpty(p.planId)&&p.packageId===pkg.packageId&&p.packageManifestSha256===pkg.manifestSha256&&p.snapshotSha256===pkg.snapshotSha256&&p.schemaArtifactSha256===pkg.schemaArtifactSha256;
  }
  selectPackage(packageId){
    if(!this.state.packages.some(row=>row.packageId===packageId))return {ok:false,code:'PACKAGE_UNKNOWN'};
    if(this.state.selectedPackageId!==packageId){this.state.selectedPackageId=packageId;this.state.plan=null;this.state.preview=null;this.state.stage=null;this.state.lastDrill=null;this.state.lastActivation=null;}
    return {ok:true,packageId};
  }
  async createPackage(label='backup-surface'){
    this._attempt('PACKAGE','STARTED',{label});
    try{
      const r=await this.transport.request('POST','/v1/backup/package',{label});
      if(r?.ok&&!packageIdentityComplete(r)){
        const failure=safeProviderFailure('BACKUP_PACKAGE_IDENTITY_INCOMPLETE',r);
        this.state.lastError=failure;this._attempt('PACKAGE','FAILED',{code:failure.code});return failure;
      }
      this.state.lastError=r?.ok?null:r;
      if(r?.ok){this.state.packages.push(clone(r));this.state.selectedPackageId=r.packageId;this.state.plan=null;this.state.preview=null;this.state.stage=null;this.state.lastDrill=null;this.state.lastActivation=null;this._attempt('PACKAGE','VERIFIED',{packageId:r.packageId,manifestSha256:r.manifestSha256});}
      else this._attempt('PACKAGE','FAILED',{code:r?.code||'UNKNOWN'});
      return r;
    }catch(error){const r={ok:false,code:'BACKUP_PROVIDER_ERROR',message:String(error?.message||error)};this.state.lastError=r;this._attempt('PACKAGE','FAILED',{code:r.code});return r;}
  }
  plan(){
    const pkg=this._package();if(!packageIdentityComplete(pkg))return {ok:false,code:'VERIFIED_PACKAGE_REQUIRED'};
    const plan={planId:`restore-plan:${pkg.packageId}`,packageId:pkg.packageId,packageManifestSha256:pkg.manifestSha256,snapshotSha256:pkg.snapshotSha256,schemaArtifactSha256:pkg.schemaArtifactSha256,state:'PLANNED',target:{kind:'ISOLATED_RESTORE_DRILL',live:false,trueEmptyRequired:true},restoreWritesPerformed:false,activationState:'NOT_REQUESTED',createdAt:this.clock()};
    this.state.plan=plan;this.state.preview=null;this.state.stage=null;this.state.lastDrill=null;this.state.lastActivation=null;this._attempt('PLAN','PLANNED',{packageId:pkg.packageId,restoreWritesPerformed:false});return {ok:true,...clone(plan)};
  }
  preview(){
    const pkg=this._package();if(!this._planBound(pkg))return {ok:false,code:'EXACT_RESTORE_PLAN_REQUIRED'};
    const preview={packageId:pkg.packageId,state:'PREVIEWED',packageIdentity:{packageId:pkg.packageId,manifestSha256:pkg.manifestSha256,snapshotSha256:pkg.snapshotSha256,schemaArtifactSha256:pkg.schemaArtifactSha256},schemaComparison:{status:'DEFERRED_TO_RUNTIME_PREFLIGHT',reason:'BackupRestoreCapability validates package migrations/schema against the live provider immediately before isolated drill.'},packageCapturedAt:pkg.capturedAt,liveSchemaAtPreview:'NOT_READ_BY_SURFACE',restoreWritesPerformed:false,productionDatabaseMutated:false,liveRestored:false,activationState:'NOT_REQUESTED',observedAt:this.clock()};
    this.state.preview=preview;this.state.stage=null;this.state.lastDrill=null;this.state.lastActivation=null;this._attempt('PREVIEW','PREVIEWED',{packageId:pkg.packageId,restoreWritesPerformed:false});return {ok:true,...clone(preview)};
  }
  stage(){
    const pkg=this._package(),preview=this.state.preview;if(!pkg||!this._planBound(pkg)||!preview||preview.packageId!==pkg.packageId)return {ok:false,code:'PREVIEW_REQUIRED'};
    const stage={packageId:pkg.packageId,state:'STAGED',stagingKind:'SEMANTIC_HANDOFF_TO_ISOLATED_RUNTIME_PREFLIGHT',target:{kind:'ISOLATED_RESTORE_DRILL',live:false,trueEmptyRequired:true},runtimeArtifactWritesPerformed:false,productionDatabaseMutated:false,liveRestored:false,activationState:'NOT_REQUESTED',stagedAt:this.clock()};
    this.state.stage=stage;this.state.lastDrill=null;this.state.lastActivation=null;this._attempt('STAGE','STAGED',{packageId:pkg.packageId,productionDatabaseMutated:false});return {ok:true,...clone(stage)};
  }
  async drill(){
    const pkg=this._package(),stage=this.state.stage;if(!pkg||!stage||stage.packageId!==pkg.packageId)return {ok:false,code:'STAGED_PLAN_REQUIRED'};
    this._attempt('DRILL','STARTED',{packageId:pkg.packageId});
    try{
      const r=await this.transport.request('POST','/v1/backup/drill',{packageId:pkg.packageId});
      const echoedPackage=receiptPackageId(r);
      if(r?.ok&&(r.liveRestored===true||r.productionDatabaseMutated===true||(echoedPackage&&echoedPackage!==pkg.packageId))){
        const failure=safeProviderFailure('BACKUP_DRILL_TRUTH_CONTRADICTION',r,{packageId:pkg.packageId});this.state.lastError=failure;this._attempt('DRILL','FAILED',{packageId:pkg.packageId,code:failure.code,compensationStatus:'PROVIDER_RECEIPT_REJECTED'});return failure;
      }
      this.state.lastError=r?.ok?null:r;
      if(r?.ok){this.state.lastDrill={...clone(r),packageId:pkg.packageId,providerBinding:{packageId:pkg.packageId,receiptEchoedPackageId:echoedPackage}};this._attempt('DRILL','VERIFIED',{packageId:pkg.packageId,drillId:r.drillId,liveRestored:false});}
      else this._attempt('DRILL','FAILED',{packageId:pkg.packageId,code:r?.code||'UNKNOWN',compensationStatus:'NOT_DURABLY_JOURNALED_BY_CURRENT_PROVIDER'});
      return r;
    }catch(error){const r={ok:false,code:'BACKUP_PROVIDER_ERROR',message:String(error?.message||error),liveRestored:false,productionDatabaseMutated:false};this.state.lastError=r;this._attempt('DRILL','FAILED',{packageId:pkg.packageId,code:r.code,compensationStatus:'NOT_DURABLY_JOURNALED_BY_CURRENT_PROVIDER'});return r;}
  }
  async requestActivation(){
    const drill=this.state.lastDrill,pkg=this._package();if(!pkg||!drill||drill.packageId!==pkg.packageId||drill.status!=='STAGED_AND_VERIFIED'||drill.liveRestored===true||drill.productionDatabaseMutated===true)return {ok:false,code:'VERIFIED_ISOLATED_DRILL_REQUIRED'};
    this._attempt('ACTIVATION_REQUEST','STARTED',{drillId:drill.drillId,packageId:pkg.packageId});
    try{
      const r=await this.transport.request('POST','/v1/backup/activation-request',{drillId:drill.drillId,reason:'backup-surface-explicit-request'});
      const echoedDrill=r?.drillId??null,echoedPackage=receiptPackageId(r);
      if(r?.ok&&(r.status!=='AUTHORITY_PENDING'||r.liveRestored===true||r.productionDatabaseMutated===true||(echoedDrill&&echoedDrill!==drill.drillId)||(echoedPackage&&echoedPackage!==pkg.packageId))){
        const failure=safeProviderFailure('BACKUP_ACTIVATION_TRUTH_CONTRADICTION',r,{packageId:pkg.packageId,drillId:drill.drillId});this.state.lastError=failure;this._attempt('ACTIVATION_REQUEST','FAILED',{code:failure.code});return failure;
      }
      this.state.lastError=r?.ok?null:r;
      if(r?.ok){const bound={...clone(r),providerBinding:{packageId:pkg.packageId,drillId:drill.drillId,receiptEchoedPackageId:echoedPackage,receiptEchoedDrillId:echoedDrill}};this.state.lastActivation=bound;this._attempt('ACTIVATION_REQUEST','AUTHORITY_PENDING',{requestId:r.requestId,packageId:pkg.packageId,drillId:drill.drillId,productionDatabaseMutated:false,liveRestored:false});return clone(bound);}
      this._attempt('ACTIVATION_REQUEST','FAILED',{code:r?.code||'UNKNOWN'});return r;
    }catch(error){const r={ok:false,code:'BACKUP_PROVIDER_ERROR',message:String(error?.message||error),liveRestored:false,productionDatabaseMutated:false};this.state.lastError=r;this._attempt('ACTIVATION_REQUEST','FAILED',{code:r.code});return r;}
  }
  availability(id){
    const pkg=this._package();
    if(id==='backup.plan')return packageIdentityComplete(pkg)&&pkg?.status==='PACKAGE_VERIFIED'||'Create/select a verified BackupPackage';
    if(id==='backup.preview')return this._planBound(pkg)||'Create an exact digest-bound RestorePlan first';
    if(id==='backup.stage')return this._planBound(pkg)&&this.state.preview?.packageId===pkg?.packageId||'Preview the exact RestorePlan first';
    if(id==='backup.drill')return this.state.stage?.packageId===pkg?.packageId&&this.state.stage?.productionDatabaseMutated!==true&&this.state.stage?.liveRestored!==true||'Stage the exact isolated drill intent first';
    if(id==='backup.activationRequest')return this.state.lastDrill?.packageId===pkg?.packageId&&this.state.lastDrill?.status==='STAGED_AND_VERIFIED'&&this.state.lastDrill?.liveRestored!==true&&this.state.lastDrill?.productionDatabaseMutated!==true||'A verified isolated RestoreDrill is required';
    return true;
  }
  truth(){const state=this.snapshot();return {owner:this.owner,capabilityOwner:'BackupRestoreCapability',selectedPackageId:state.selectedPackageId,stagedVerifiedIsLiveRestored:false,persistenceOwnerMutated:false,drillLiveRestored:state.lastDrill?.liveRestored??false,activationAuthority:state.lastActivation?.status||'NOT_REQUESTED',productionDatabaseMutated:state.lastActivation?.productionDatabaseMutated??state.lastDrill?.productionDatabaseMutated??false,durableSuccessReceipts:'PROVIDER_OWNED_PACKAGE_DRILL_ACTIVATION',durableFailureCompensationHistory:state.durableFailureJournal.status};}
  rehydrate(snapshot:any){
    if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw Error('BACKUP_SNAPSHOT_REQUIRED');
    if(!Array.isArray(snapshot.packages))throw Error('BACKUP_PACKAGES_ARRAY_REQUIRED');
    for(const pkg of snapshot.packages)if(!packageIdentityComplete(pkg))throw Error('BACKUP_PACKAGE_IDENTITY_REQUIRED');
    const selected=snapshot.selectedPackageId??null;
    if(selected!==null&&!snapshot.packages.some((pkg:any)=>pkg.packageId===selected))throw Error('BACKUP_SELECTED_PACKAGE_IDENTITY_MISMATCH');
    const selectedPkg=snapshot.packages.find((pkg:any)=>pkg.packageId===selected)??null;
    if(snapshot.plan){if(!nonEmpty(snapshot.plan.planId)||snapshot.plan.packageId!==selected)throw Error('BACKUP_PLAN_IDENTITY_MISMATCH');if(snapshot.plan.packageManifestSha256&&snapshot.plan.packageManifestSha256!==selectedPkg?.manifestSha256)throw Error('BACKUP_PLAN_DIGEST_MISMATCH');if(snapshot.plan.snapshotSha256&&snapshot.plan.snapshotSha256!==selectedPkg?.snapshotSha256)throw Error('BACKUP_PLAN_DIGEST_MISMATCH');if(snapshot.plan.schemaArtifactSha256&&snapshot.plan.schemaArtifactSha256!==selectedPkg?.schemaArtifactSha256)throw Error('BACKUP_PLAN_DIGEST_MISMATCH');}
    for(const [name,value] of [['PREVIEW',snapshot.preview],['STAGE',snapshot.stage],['DRILL',snapshot.lastDrill]])if(value?.packageId&&value.packageId!==selected)throw Error(`BACKUP_${name}_PACKAGE_IDENTITY_MISMATCH`);
    if(snapshot.lastActivation?.packageId&&snapshot.lastActivation.packageId!==selected)throw Error('BACKUP_ACTIVATION_PACKAGE_IDENTITY_MISMATCH');
    if(snapshot.lastActivation?.drillId&&snapshot.lastDrill?.drillId&&snapshot.lastActivation.drillId!==snapshot.lastDrill.drillId)throw Error('BACKUP_ACTIVATION_DRILL_IDENTITY_MISMATCH');
    const reboundPlan=snapshot.plan&&selectedPkg?{...clone(snapshot.plan),packageManifestSha256:selectedPkg.manifestSha256,snapshotSha256:selectedPkg.snapshotSha256,schemaArtifactSha256:selectedPkg.schemaArtifactSha256}:clone(snapshot.plan??null);
    this.state.packages=snapshot.packages.map(clone);this.state.selectedPackageId=selected;this.state.plan=reboundPlan;this.state.preview=clone(snapshot.preview??null);this.state.stage=clone(snapshot.stage??null);this.state.lastDrill=clone(snapshot.lastDrill??null);this.state.lastActivation=clone(snapshot.lastActivation??null);this.state.lastError=clone(snapshot.lastError??null);this.state.attemptHistory=Array.isArray(snapshot.attemptHistory)?snapshot.attemptHistory.map(clone):[];this.attemptSeq=this.state.attemptHistory.length;if(snapshot.durableFailureJournal)this.state.durableFailureJournal=clone(snapshot.durableFailureJournal);
    return Object.freeze({ok:true,rehydrated:true,packageCount:this.state.packages.length,selectedPackageId:this.state.selectedPackageId,planDigestBound:this._planBound(selectedPkg)});
  }
  mount(args){return mountBackupSurface({...args,adapter:this});}
}
export function createBackupRuntimeAdapter(options={}){return new BackupRuntimeAdapter(options);}

/* Provider-aware integration seam. W05 lifecycle semantics remain here while provider receipts
   and durable attempts are projected without granting provider/runtime authority to the Surface. */
export class ProviderAwareBackupIntegrationAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport(),clock=now}={}){this.owner='W05BackupProviderAwareIntegrationAdapter';this.transport=transport;this.semantic=new BackupRuntimeAdapter({transport,clock});this.durableAttempts=[];this.lastProviderPreview=null;this.lastProviderPreviewPackageId=null;this.lastProviderStage=null;this.lastProviderStagePackageId=null;}
  descriptor(){return {...this.semantic.descriptor(),owner:this.owner,semanticOwner:BACKUP_DOMAIN_OWNER,providerBinding:'BackupRestoreCapability',providerAwarePreview:true,providerAwareStage:true,durableAttemptJournal:true,surfaceSemanticsMovedIntoProvider:false};}
  snapshot(){const semantic=this.semantic.snapshot(),durableAttempts=clone(this.durableAttempts);return {...semantic,sessionAttemptHistory:clone(semantic.attemptHistory),attemptHistory:durableAttempts,durableAttempts,attemptHistorySource:'PROVIDER_DURABLE_ATTEMPT_JOURNAL',providerPreview:clone(this.lastProviderPreview),providerPreviewPackageId:this.lastProviderPreviewPackageId,providerStage:clone(this.lastProviderStage),providerStagePackageId:this.lastProviderStagePackageId};}
  selectPackage(id){const r=this.semantic.selectPackage(id);if(r.ok){this.lastProviderPreview=null;this.lastProviderPreviewPackageId=null;this.lastProviderStage=null;this.lastProviderStagePackageId=null;}return r;}
  async #syncAttempts(){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1)||null;const suffix=pkg?.packageId?`?packageId=${encodeURIComponent(pkg.packageId)}`:'';const r=await this.transport.request('GET',`/v1/backup/attempts${suffix}`);if(r?.ok&&Array.isArray(r.attempts)){this.durableAttempts=r.attempts.map(clone);this.semantic.state.durableFailureJournal={status:'PROVIDER_DURABLE_ATTEMPT_JOURNAL',owner:'BackupRestoreCapability',attemptCount:this.durableAttempts.length,lastAttempt:this.durableAttempts.at(-1)||null};}return r;}
  async createPackage(label='backup-surface'){const r=await this.semantic.createPackage(label);if(r?.ok){this.lastProviderPreview=null;this.lastProviderPreviewPackageId=null;this.lastProviderStage=null;this.lastProviderStagePackageId=null;}await this.#syncAttempts();return r;}
  plan(){return this.semantic.plan();}
  async preview(){
    const local=this.semantic.preview();if(!local.ok)return local;const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1);const provider=await this.transport.request('POST','/v1/backup/preview',{packageId:pkg.packageId});const echoed=receiptPackageId(provider);
    if(echoed&&echoed!==pkg.packageId){const failure=safeProviderFailure('BACKUP_PROVIDER_PREVIEW_IDENTITY_MISMATCH',provider,{packageId:pkg.packageId});this.semantic.state.lastError=failure;return failure;}
    this.lastProviderPreview=clone(provider);this.lastProviderPreviewPackageId=pkg.packageId;this.lastProviderStage=null;this.lastProviderStagePackageId=null;
    this.semantic.state.preview={...this.semantic.state.preview,providerReceipt:clone(provider),providerBinding:{packageId:pkg.packageId,receiptEchoedPackageId:echoed},schemaComparison:{status:provider.status||provider.code||'PREVIEW_FAILED',conflict:provider.status==='SCHEMA_CONFLICT'||provider.code==='PACKAGE_TARGET_SCHEMA_CONFLICT',code:provider.code||null},restoreWritesPerformed:false,productionDatabaseMutated:false,liveRestored:false};
    if(!provider.ok){this.semantic.state.lastError=clone(provider);return provider;}return {...provider,semanticPlanId:this.semantic.state.plan?.planId,providerBinding:{packageId:pkg.packageId,receiptEchoedPackageId:echoed},restoreWritesPerformed:false,productionDatabaseMutated:false,liveRestored:false};
  }
  async stage(){
    const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),localPreview=this.semantic.state.preview;if(!pkg||localPreview?.packageId!==pkg.packageId||this.lastProviderPreviewPackageId!==pkg.packageId||!localPreview?.providerReceipt?.ok||localPreview?.schemaComparison?.conflict===true)return {ok:false,code:'PROVIDER_PREVIEW_REQUIRED'};
    const provider=await this.transport.request('POST','/v1/backup/stage',{packageId:pkg.packageId,correlationId:pkg.correlationId||null});const echoed=receiptPackageId(provider);this.lastProviderStage=clone(provider);this.lastProviderStagePackageId=pkg.packageId;await this.#syncAttempts();
    if(echoed&&echoed!==pkg.packageId){const failure=safeProviderFailure('BACKUP_PROVIDER_STAGE_IDENTITY_MISMATCH',provider,{packageId:pkg.packageId});this.semantic.state.lastError=failure;return failure;}
    if(provider?.ok&&(provider.productionDatabaseMutated===true||provider.liveRestored===true)){const failure=safeProviderFailure('BACKUP_PROVIDER_STAGE_TRUTH_CONTRADICTION',provider,{packageId:pkg.packageId});this.semantic.state.lastError=failure;return failure;}
    if(!provider.ok){this.semantic.state.lastError=clone(provider);return provider;}
    const semanticStage=this.semantic.stage();if(!semanticStage.ok)return semanticStage;
    this.semantic.state.stage={...semanticStage,providerReceipt:clone(provider),providerBinding:{packageId:pkg.packageId,receiptEchoedPackageId:echoed},...clone(provider),packageId:pkg.packageId,state:provider.status||'STAGED',target:{kind:'ISOLATED_RESTORE_DRILL',live:false,trueEmptyRequired:true},productionDatabaseMutated:false,liveRestored:false};return clone(this.semantic.state.stage);
  }
  async drill(){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),stage=this.semantic.state.stage;if(!pkg||stage?.packageId!==pkg.packageId||this.lastProviderStagePackageId!==pkg.packageId||!this.lastProviderStage?.ok||!stage?.providerReceipt?.ok)return {ok:false,code:'PROVIDER_STAGE_REQUIRED'};const r=await this.semantic.drill();await this.#syncAttempts();return r;}
  async requestActivation(){const r=await this.semantic.requestActivation();await this.#syncAttempts();return r;}
  rehydrate(snapshot:any){
    const res=this.semantic.rehydrate(snapshot);if(Array.isArray(snapshot.durableAttempts))this.durableAttempts=snapshot.durableAttempts.map(clone);
    this.lastProviderPreview=clone(snapshot.providerPreview??null);this.lastProviderStage=clone(snapshot.providerStage??null);
    const selected=snapshot.selectedPackageId??null,previewId=snapshot.providerPreviewPackageId??receiptPackageId(snapshot.providerPreview),stageId=snapshot.providerStagePackageId??receiptPackageId(snapshot.providerStage);
    if(this.lastProviderPreview&&!previewId)throw Error('BACKUP_PROVIDER_PREVIEW_IDENTITY_REQUIRED');if(previewId&&previewId!==selected)throw Error('BACKUP_PROVIDER_PREVIEW_IDENTITY_MISMATCH');
    if(this.lastProviderStage&&!stageId)throw Error('BACKUP_PROVIDER_STAGE_IDENTITY_REQUIRED');if(stageId&&stageId!==selected)throw Error('BACKUP_PROVIDER_STAGE_IDENTITY_MISMATCH');
    this.lastProviderPreviewPackageId=previewId??null;this.lastProviderStagePackageId=stageId??null;
    return Object.freeze({...res,durableAttemptCount:this.durableAttempts.length,providerPreviewBound:!!this.lastProviderPreview&&this.lastProviderPreviewPackageId===selected,providerStageBound:!!this.lastProviderStage&&this.lastProviderStagePackageId===selected});
  }
  availability(id){
    if(id==='backup.stage'){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),preview=this.semantic.state.preview;if(!pkg||preview?.packageId!==pkg.packageId||this.lastProviderPreviewPackageId!==pkg.packageId||!preview?.providerReceipt?.ok||preview?.schemaComparison?.conflict===true)return 'A successful provider preview for the exact selected BackupPackage is required';return true;}
    if(id==='backup.drill'){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),stage=this.semantic.state.stage;if(!pkg||stage?.packageId!==pkg.packageId||this.lastProviderStagePackageId!==pkg.packageId||!this.lastProviderStage?.ok||!stage?.providerReceipt?.ok||stage.productionDatabaseMutated===true||stage.liveRestored===true)return 'A successful provider stage for the exact selected BackupPackage is required';return true;}
    return this.semantic.availability(id);
  }
  truth(){const base=this.semantic.truth();return {...base,owner:this.owner,semanticOwner:BACKUP_DOMAIN_OWNER,durableFailureCompensationHistory:this.semantic.state.durableFailureJournal.status,providerPreviewStatus:this.lastProviderPreview?.status||'NOT_OBSERVED',providerStageStatus:this.lastProviderStage?.status||'NOT_OBSERVED',liveRestored:false,providerOwnsSurfaceSemantics:false};}
  mount(args){return mountBackupSurface({...args,adapter:this});}
}
export function createProviderAwareBackupIntegrationAdapter(options={}){return new ProviderAwareBackupIntegrationAdapter(options);}
