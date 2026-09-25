import {createBoundedLocalRuntimeTransport} from './runtime/local-runtime-transport.js';
import {mountBackupSurface,BACKUP_COMMANDS} from '../surfaces/backup/index.js';
export {BACKUP_COMMANDS};

const clone=value=>value===undefined?undefined:structuredClone(value);
const now=()=>new Date().toISOString();
export const BACKUP_DOMAIN_OWNER='BackupRuntimeAdapter';

export class BackupRuntimeAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport(),clock=now}={}){this.owner=BACKUP_DOMAIN_OWNER;this.transport=transport;this.clock=clock;this.attemptSeq=0;this.state={packages:[],selectedPackageId:null,plan:null,preview:null,stage:null,lastDrill:null,lastActivation:null,lastError:null,attemptHistory:[],durableFailureJournal:{status:'UNAVAILABLE_LOCKED_PROVIDER_SEAM',owner:'BackupRestoreCapability',required:'durable failed-attempt + original error + compensation-attempt/result journal'}};}
  descriptor(){return {owner:this.owner,capabilityOwner:'BackupRestoreCapability',transport:this.transport.descriptor(),activationAuthority:false,persistenceOwnerMutation:false,liveRestoreOwned:false};}
  snapshot(){return clone(this.state);}
  _attempt(operation,status,detail={}){const row={attemptId:`backup-ui-attempt-${++this.attemptSeq}`,operation,status,at:this.clock(),...clone(detail)};this.state.attemptHistory.push(row);return row;}
  _package(){return this.state.packages.find(row=>row.packageId===this.state.selectedPackageId)||this.state.packages.at(-1)||null;}
  selectPackage(packageId){if(!this.state.packages.some(row=>row.packageId===packageId))return {ok:false,code:'PACKAGE_UNKNOWN'};this.state.selectedPackageId=packageId;return {ok:true,packageId};}
  async createPackage(label='backup-surface'){this._attempt('PACKAGE','STARTED',{label});try{const r=await this.transport.request('POST','/v1/backup/package',{label});this.state.lastError=r.ok?null:r;if(r.ok){this.state.packages.push(clone(r));this.state.selectedPackageId=r.packageId;this.state.plan=null;this.state.preview=null;this.state.stage=null;this.state.lastDrill=null;this.state.lastActivation=null;this._attempt('PACKAGE','VERIFIED',{packageId:r.packageId,manifestSha256:r.manifestSha256});}else this._attempt('PACKAGE','FAILED',{code:r.code||'UNKNOWN'});return r;}catch(error){const r={ok:false,code:'BACKUP_PROVIDER_ERROR',message:String(error?.message||error)};this.state.lastError=r;this._attempt('PACKAGE','FAILED',{code:r.code});return r;}}
  plan(){const pkg=this._package();if(!pkg)return {ok:false,code:'VERIFIED_PACKAGE_REQUIRED'};const plan={planId:`restore-plan:${pkg.packageId}`,packageId:pkg.packageId,packageManifestSha256:pkg.manifestSha256,snapshotSha256:pkg.snapshotSha256,schemaArtifactSha256:pkg.schemaArtifactSha256,state:'PLANNED',target:{kind:'ISOLATED_RESTORE_DRILL',live:false,trueEmptyRequired:true},restoreWritesPerformed:false,activationState:'NOT_REQUESTED',createdAt:this.clock()};this.state.plan=plan;this.state.preview=null;this.state.stage=null;this._attempt('PLAN','PLANNED',{packageId:pkg.packageId,restoreWritesPerformed:false});return {ok:true,...clone(plan)};}
  preview(){const pkg=this._package(),plan=this.state.plan;if(!pkg||!plan||plan.packageId!==pkg.packageId)return {ok:false,code:'RESTORE_PLAN_REQUIRED'};const preview={packageId:pkg.packageId,state:'PREVIEWED',packageIdentity:{manifestSha256:pkg.manifestSha256,snapshotSha256:pkg.snapshotSha256,schemaArtifactSha256:pkg.schemaArtifactSha256},schemaComparison:{status:'DEFERRED_TO_RUNTIME_PREFLIGHT',reason:'BackupRestoreCapability validates package migrations/schema against the live provider immediately before isolated drill.'},packageCapturedAt:pkg.capturedAt,liveSchemaAtPreview:'NOT_READ_BY_SURFACE',restoreWritesPerformed:false,activationState:'NOT_REQUESTED',observedAt:this.clock()};this.state.preview=preview;this._attempt('PREVIEW','PREVIEWED',{packageId:pkg.packageId,restoreWritesPerformed:false});return {ok:true,...clone(preview)};}
  stage(){const pkg=this._package(),plan=this.state.plan,preview=this.state.preview;if(!pkg||!plan||!preview||plan.packageId!==pkg.packageId)return {ok:false,code:'PREVIEW_REQUIRED'};const stage={packageId:pkg.packageId,state:'STAGED',stagingKind:'SEMANTIC_HANDOFF_TO_ISOLATED_RUNTIME_PREFLIGHT',target:{kind:'ISOLATED_RESTORE_DRILL',live:false,trueEmptyRequired:true},runtimeArtifactWritesPerformed:false,productionDatabaseMutated:false,activationState:'NOT_REQUESTED',stagedAt:this.clock()};this.state.stage=stage;this._attempt('STAGE','STAGED',{packageId:pkg.packageId,productionDatabaseMutated:false});return {ok:true,...clone(stage)};}
  async drill(){const pkg=this._package(),stage=this.state.stage;if(!pkg||!stage||stage.packageId!==pkg.packageId)return {ok:false,code:'STAGED_PLAN_REQUIRED'};this._attempt('DRILL','STARTED',{packageId:pkg.packageId});try{const r=await this.transport.request('POST','/v1/backup/drill',{packageId:pkg.packageId});this.state.lastError=r.ok?null:r;if(r.ok){this.state.lastDrill=clone(r);this._attempt('DRILL','VERIFIED',{packageId:pkg.packageId,drillId:r.drillId,liveRestored:r.liveRestored===true});}else this._attempt('DRILL','FAILED',{packageId:pkg.packageId,code:r.code||'UNKNOWN',compensationStatus:'NOT_DURABLY_JOURNALED_BY_CURRENT_PROVIDER'});return r;}catch(error){const r={ok:false,code:'BACKUP_PROVIDER_ERROR',message:String(error?.message||error),liveRestored:false};this.state.lastError=r;this._attempt('DRILL','FAILED',{packageId:pkg.packageId,code:r.code,compensationStatus:'NOT_DURABLY_JOURNALED_BY_CURRENT_PROVIDER'});return r;}}
  async requestActivation(){const drill=this.state.lastDrill;if(!drill||drill.status!=='STAGED_AND_VERIFIED'||drill.liveRestored===true)return {ok:false,code:'VERIFIED_ISOLATED_DRILL_REQUIRED'};this._attempt('ACTIVATION_REQUEST','STARTED',{drillId:drill.drillId});try{const r=await this.transport.request('POST','/v1/backup/activation-request',{drillId:drill.drillId,reason:'backup-surface-explicit-request'});this.state.lastError=r.ok?null:r;if(r.ok){this.state.lastActivation=clone(r);this._attempt('ACTIVATION_REQUEST',r.status||'AUTHORITY_PENDING',{requestId:r.requestId,productionDatabaseMutated:r.productionDatabaseMutated===true,liveRestored:r.liveRestored===true});}else this._attempt('ACTIVATION_REQUEST','FAILED',{code:r.code||'UNKNOWN'});return r;}catch(error){const r={ok:false,code:'BACKUP_PROVIDER_ERROR',message:String(error?.message||error),liveRestored:false};this.state.lastError=r;this._attempt('ACTIVATION_REQUEST','FAILED',{code:r.code});return r;}}
  availability(id){const pkg=this._package();if(id==='backup.plan')return pkg?.status==='PACKAGE_VERIFIED'||'Create/select a verified BackupPackage';if(id==='backup.preview')return this.state.plan?.packageId===pkg?.packageId||'Create a RestorePlan first';if(id==='backup.stage')return this.state.preview?.packageId===pkg?.packageId||'Preview the exact RestorePlan first';if(id==='backup.drill')return this.state.stage?.packageId===pkg?.packageId||'Stage the exact isolated drill intent first';if(id==='backup.activationRequest')return this.state.lastDrill?.status==='STAGED_AND_VERIFIED'&&this.state.lastDrill?.liveRestored!==true||'A verified isolated RestoreDrill is required';return true;}
  truth(){const state=this.snapshot();return {owner:this.owner,capabilityOwner:'BackupRestoreCapability',selectedPackageId:state.selectedPackageId,stagedVerifiedIsLiveRestored:false,persistenceOwnerMutated:false,drillLiveRestored:state.lastDrill?.liveRestored??false,activationAuthority:state.lastActivation?.status||'NOT_REQUESTED',productionDatabaseMutated:state.lastActivation?.productionDatabaseMutated??false,durableSuccessReceipts:'PROVIDER_OWNED_PACKAGE_DRILL_ACTIVATION',durableFailureCompensationHistory:state.durableFailureJournal.status};}
  rehydrate(snapshot: any){
    if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw Error('BACKUP_SNAPSHOT_REQUIRED');
    if(!Array.isArray(snapshot.packages))throw Error('BACKUP_PACKAGES_ARRAY_REQUIRED');
    for(const pkg of snapshot.packages){if(!pkg.packageId||!pkg.manifestSha256)throw Error('BACKUP_PACKAGE_IDENTITY_REQUIRED');}
    this.state.packages=snapshot.packages.map(clone);
    this.state.selectedPackageId=snapshot.selectedPackageId??null;
    this.state.plan=clone(snapshot.plan??null);
    this.state.preview=clone(snapshot.preview??null);
    this.state.stage=clone(snapshot.stage??null);
    this.state.lastDrill=clone(snapshot.lastDrill??null);
    this.state.lastActivation=clone(snapshot.lastActivation??null);
    this.state.attemptHistory=Array.isArray(snapshot.attemptHistory)?snapshot.attemptHistory.map(clone):[];
    if(snapshot.durableFailureJournal)this.state.durableFailureJournal=clone(snapshot.durableFailureJournal);
    return Object.freeze({ok:true,rehydrated:true,packageCount:this.state.packages.length,selectedPackageId:this.state.selectedPackageId});
  }
  mount(args){return mountBackupSurface({...args,adapter:this});}
}
export function createBackupRuntimeAdapter(options={}){return new BackupRuntimeAdapter(options);}


/* CG6 provider-aware integration seam. Keeps W05 lifecycle semantics in the adapter while
   binding preview/stage/failure-journal truth to the already-approved BackupRestoreCapability. */
export class ProviderAwareBackupIntegrationAdapter{
  constructor({transport=createBoundedLocalRuntimeTransport(),clock=now}={}){
    this.owner='W05BackupProviderAwareIntegrationAdapter';
    this.transport=transport;
    this.semantic=new BackupRuntimeAdapter({transport,clock});
    this.durableAttempts=[];
    this.lastProviderPreview=null;
    this.lastProviderPreviewPackageId=null;
    this.lastProviderStage=null;
    this.lastProviderStagePackageId=null;
  }
  descriptor(){return {...this.semantic.descriptor(),owner:this.owner,semanticOwner:BACKUP_DOMAIN_OWNER,providerBinding:'BackupRestoreCapability',providerAwarePreview:true,providerAwareStage:true,durableAttemptJournal:true,surfaceSemanticsMovedIntoProvider:false};}
  snapshot(){const semantic=this.semantic.snapshot(),durableAttempts=clone(this.durableAttempts);return {...semantic,sessionAttemptHistory:clone(semantic.attemptHistory),attemptHistory:durableAttempts,durableAttempts,attemptHistorySource:'PROVIDER_DURABLE_ATTEMPT_JOURNAL',providerPreview:clone(this.lastProviderPreview),providerStage:clone(this.lastProviderStage)};}
  selectPackage(id){return this.semantic.selectPackage(id)}
  async #syncAttempts(){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1)||null;const suffix=pkg?.packageId?`?packageId=${encodeURIComponent(pkg.packageId)}`:'';const r=await this.transport.request('GET',`/v1/backup/attempts${suffix}`);if(r?.ok&&Array.isArray(r.attempts)){this.durableAttempts=r.attempts.map(clone);this.semantic.state.durableFailureJournal={status:'PROVIDER_DURABLE_ATTEMPT_JOURNAL',owner:'BackupRestoreCapability',attemptCount:this.durableAttempts.length,lastAttempt:this.durableAttempts.at(-1)||null};}return r;}
  async createPackage(label='backup-surface'){const r=await this.semantic.createPackage(label);if(r?.ok){this.lastProviderPreview=null;this.lastProviderPreviewPackageId=null;this.lastProviderStage=null;this.lastProviderStagePackageId=null;}await this.#syncAttempts();return r;}
  plan(){return this.semantic.plan();}
  async preview(){const local=this.semantic.preview();if(!local.ok)return local;const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1);const provider=await this.transport.request('POST','/v1/backup/preview',{packageId:pkg.packageId});this.lastProviderPreview=clone(provider);this.lastProviderPreviewPackageId=pkg.packageId;this.lastProviderStage=null;this.lastProviderStagePackageId=null;this.semantic.state.preview={...this.semantic.state.preview,providerReceipt:clone(provider),schemaComparison:{status:provider.status||provider.code||'PREVIEW_FAILED',conflict:provider.status==='SCHEMA_CONFLICT'||provider.code==='PACKAGE_TARGET_SCHEMA_CONFLICT',code:provider.code||null},restoreWritesPerformed:false};if(!provider.ok){this.semantic.state.lastError=clone(provider);return provider;}return {...provider,semanticPlanId:this.semantic.state.plan?.planId,restoreWritesPerformed:false,liveRestored:false};}
  async stage(){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),localPreview=this.semantic.state.preview;if(!pkg||localPreview?.packageId!==pkg.packageId||this.lastProviderPreviewPackageId!==pkg.packageId||!localPreview?.providerReceipt?.ok||localPreview?.schemaComparison?.conflict===true)return {ok:false,code:'PROVIDER_PREVIEW_REQUIRED'};const provider=await this.transport.request('POST','/v1/backup/stage',{packageId:pkg.packageId,correlationId:pkg.correlationId||null});this.lastProviderStage=clone(provider);this.lastProviderStagePackageId=pkg.packageId;await this.#syncAttempts();if(!provider.ok){this.semantic.state.lastError=clone(provider);return provider;}this.semantic.state.stage={...this.semantic.stage?.(),providerReceipt:clone(provider),...clone(provider),state:provider.status||'STAGED',target:{kind:'ISOLATED_RESTORE_DRILL',live:false,trueEmptyRequired:true},productionDatabaseMutated:provider.productionDatabaseMutated===true,liveRestored:provider.liveRestored===true};return clone(this.semantic.state.stage);}
  async drill(){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),stage=this.semantic.state.stage;if(!pkg||stage?.packageId!==pkg.packageId||this.lastProviderStagePackageId!==pkg.packageId||!this.lastProviderStage?.ok||!stage?.providerReceipt?.ok)return {ok:false,code:'PROVIDER_STAGE_REQUIRED'};const r=await this.semantic.drill();await this.#syncAttempts();return r;}
  async requestActivation(){const r=await this.semantic.requestActivation();await this.#syncAttempts();return r;}
  rehydrate(snapshot: any){
    const res=this.semantic.rehydrate(snapshot);
    if(Array.isArray(snapshot.durableAttempts))this.durableAttempts=snapshot.durableAttempts.map(clone);
    this.lastProviderPreview=clone(snapshot.providerPreview??null);
    this.lastProviderPreviewPackageId=snapshot.providerPreviewPackageId??snapshot.selectedPackageId??null;
    this.lastProviderStage=clone(snapshot.providerStage??null);
    this.lastProviderStagePackageId=snapshot.providerStagePackageId??snapshot.selectedPackageId??null;
    return Object.freeze({...res,durableAttemptCount:this.durableAttempts.length});
  }
  availability(id){if(id==='backup.stage'){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),preview=this.semantic.state.preview;if(!pkg||preview?.packageId!==pkg.packageId||this.lastProviderPreviewPackageId!==pkg.packageId||!preview?.providerReceipt?.ok||preview?.schemaComparison?.conflict===true)return 'A successful provider preview for the exact selected BackupPackage is required';return true;}if(id==='backup.drill'){const pkg=this.semantic._package?.()||this.semantic.snapshot().packages.at(-1),stage=this.semantic.state.stage;if(!pkg||stage?.packageId!==pkg.packageId||this.lastProviderStagePackageId!==pkg.packageId||!this.lastProviderStage?.ok||!stage?.providerReceipt?.ok)return 'A successful provider stage for the exact selected BackupPackage is required';return true;}return this.semantic.availability(id)}
  truth(){const base=this.semantic.truth();return {...base,owner:this.owner,semanticOwner:BACKUP_DOMAIN_OWNER,durableFailureCompensationHistory:this.semantic.state.durableFailureJournal.status,providerPreviewStatus:this.lastProviderPreview?.status||'NOT_OBSERVED',providerStageStatus:this.lastProviderStage?.status||'NOT_OBSERVED',liveRestored:false,providerOwnsSurfaceSemantics:false};}
  mount(args){return mountBackupSurface({...args,adapter:this});}
}
export function createProviderAwareBackupIntegrationAdapter(options={}){return new ProviderAwareBackupIntegrationAdapter(options);}
