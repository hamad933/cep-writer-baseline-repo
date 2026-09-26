import assert from 'node:assert/strict';
import {BackupRuntimeAdapter,ProviderAwareBackupIntegrationAdapter} from '../../../adapters/backup-runtime.js';
import {backupAttemptProjection} from '../../../surfaces/backup/index.js';

const sha=(c:string)=>c.repeat(64);
const packageReceipt=(packageId='pkg-safe-1')=>({ok:true,status:'PACKAGE_VERIFIED',packageId,capturedAt:'2026-09-26T00:00:00Z',manifestSha256:sha('a'),snapshotSha256:sha('b'),schemaArtifactSha256:sha('c'),liveRestored:false,productionDatabaseMutated:false});

type Handler=(method:string,path:string,body:any)=>any;
class FakeTransport{
  calls:any[]=[];
  handler:Handler;
  constructor(handler:Handler){this.handler=handler;}
  descriptor(){return {owner:'BackupMissionFakeTransport',availability:'AVAILABLE'};}
  async request(method:string,path:string,body:any){this.calls.push({method,path,body});return this.handler(method,path,body);}
}

const happyHandler:Handler=(_method,path,body)=>{
  if(path==='/v1/backup/package')return packageReceipt();
  if(path==='/v1/backup/preview')return {ok:true,status:'PREVIEW_CLEAN',packageId:body.packageId,liveRestored:false,productionDatabaseMutated:false};
  if(path==='/v1/backup/stage')return {ok:true,status:'STAGED',packageId:body.packageId,target:{kind:'ISOLATED_RESTORE_DRILL',live:false,trueEmptyRequired:true},liveRestored:false,productionDatabaseMutated:false};
  if(path==='/v1/backup/drill')return {ok:true,status:'STAGED_AND_VERIFIED',drillId:'drill-safe-1',packageId:body.packageId,target:{isolated:true,trueEmptyBeforeRestore:true},liveRestored:false,productionDatabaseMutated:false};
  if(path==='/v1/backup/activation-request')return {ok:true,status:'AUTHORITY_PENDING',requestId:'activation-safe-1',drillId:body.drillId,packageId:'pkg-safe-1',liveRestored:false,productionDatabaseMutated:false};
  if(path.startsWith('/v1/backup/attempts'))return {ok:true,attempts:[{attemptId:'provider-att-1',operation:'STAGE',status:'FAILED',at:'2026-09-26T00:00:00Z',originalError:{code:'PROVIDER_STAGE_FAILED'},compensation:{status:'COMPENSATED'}}]};
  return {ok:false,code:'UNKNOWN_PATH'};
};

async function fullyPrepared(adapter:any){
  assert.equal((await adapter.createPackage('mission-test')).ok,true);
  assert.equal(adapter.plan().ok,true);
  assert.equal((await adapter.preview()).ok,true);
  assert.equal((await adapter.stage()).ok,true);
  return adapter;
}

const tests:{name:string,run:()=>any}[]=[
  {name:'package identity is complete before restore planning',run:async()=>{
    const transport=new FakeTransport((_m,path)=>path==='/v1/backup/package'?{ok:true,status:'PACKAGE_VERIFIED',packageId:'pkg-incomplete',manifestSha256:sha('a')}:{ok:false});
    const adapter=new BackupRuntimeAdapter({transport});
    const result=await adapter.createPackage();
    assert.equal(result.ok,false);assert.equal(result.code,'BACKUP_PACKAGE_IDENTITY_INCOMPLETE');assert.equal(adapter.snapshot().packages.length,0);
  }},
  {name:'plan preview and stage remain non-restoring semantic operations',run:async()=>{
    const transport=new FakeTransport(happyHandler),adapter=new BackupRuntimeAdapter({transport});
    assert.equal((await adapter.createPackage()).ok,true);const providerWrites=transport.calls.length;
    const plan=adapter.plan(),preview=adapter.preview(),stage=adapter.stage();
    assert.equal(plan.ok,true);assert.equal(preview.ok,true);assert.equal(stage.ok,true);assert.equal(transport.calls.length,providerWrites);assert.equal(stage.productionDatabaseMutated,false);assert.equal(stage.liveRestored,false);
  }},
  {name:'drill rejects a provider receipt that claims a live restore',run:async()=>{
    const transport=new FakeTransport((m,path,body)=>path==='/v1/backup/drill'?{ok:true,status:'STAGED_AND_VERIFIED',drillId:'bad',packageId:body.packageId,liveRestored:true,productionDatabaseMutated:false}:happyHandler(m,path,body));
    const adapter=await fullyPrepared(new BackupRuntimeAdapter({transport}));const result=await adapter.drill();
    assert.equal(result.ok,false);assert.equal(result.code,'BACKUP_DRILL_TRUTH_CONTRADICTION');assert.equal(adapter.snapshot().lastDrill,null);
  }},
  {name:'activation rejects provider authority or mutation overclaim',run:async()=>{
    const transport=new FakeTransport((m,path,body)=>path==='/v1/backup/activation-request'?{ok:true,status:'RESTORED',requestId:'bad-act',drillId:body.drillId,packageId:'pkg-safe-1',liveRestored:true,productionDatabaseMutated:true}:happyHandler(m,path,body));
    const adapter=await fullyPrepared(new BackupRuntimeAdapter({transport}));assert.equal((await adapter.drill()).ok,true);const result=await adapter.requestActivation();
    assert.equal(result.ok,false);assert.equal(result.code,'BACKUP_ACTIVATION_TRUTH_CONTRADICTION');assert.equal(adapter.snapshot().lastActivation,null);
  }},
  {name:'rehydration fails closed when package cryptographic identity is incomplete',run:()=>{
    const adapter=new BackupRuntimeAdapter({transport:new FakeTransport(happyHandler)});
    assert.throws(()=>adapter.rehydrate({packages:[{packageId:'pkg-safe-1',manifestSha256:sha('a')}],selectedPackageId:'pkg-safe-1'}),/BACKUP_PACKAGE_IDENTITY_REQUIRED/);
  }},
  {name:'rehydration fails closed when selected package is absent',run:()=>{
    const adapter=new BackupRuntimeAdapter({transport:new FakeTransport(happyHandler)});
    assert.throws(()=>adapter.rehydrate({packages:[packageReceipt('pkg-a')],selectedPackageId:'pkg-b'}),/BACKUP_SELECTED_PACKAGE_IDENTITY_MISMATCH/);
  }},
  {name:'rehydration rejects plan digest substitution',run:()=>{
    const adapter=new BackupRuntimeAdapter({transport:new FakeTransport(happyHandler)}),pkg=packageReceipt();
    assert.throws(()=>adapter.rehydrate({packages:[pkg],selectedPackageId:pkg.packageId,plan:{planId:'plan-safe',packageId:pkg.packageId,packageManifestSha256:sha('f')}}),/BACKUP_PLAN_DIGEST_MISMATCH/);
  }},
  {name:'legacy exact plan identity is rebound only to the selected package digests',run:()=>{
    const adapter=new BackupRuntimeAdapter({transport:new FakeTransport(happyHandler)}),pkg=packageReceipt();
    const result=adapter.rehydrate({packages:[pkg],selectedPackageId:pkg.packageId,plan:{planId:'legacy-plan',packageId:pkg.packageId}}),snapshot=adapter.snapshot();
    assert.equal(result.planDigestBound,true);assert.equal(snapshot.plan.planId,'legacy-plan');assert.equal(snapshot.plan.packageManifestSha256,pkg.manifestSha256);assert.equal(snapshot.plan.snapshotSha256,pkg.snapshotSha256);assert.equal(snapshot.plan.schemaArtifactSha256,pkg.schemaArtifactSha256);
  }},
  {name:'provider-aware snapshot persists explicit preview and stage package bindings',run:async()=>{
    const adapter=await fullyPrepared(new ProviderAwareBackupIntegrationAdapter({transport:new FakeTransport(happyHandler)}));const snapshot=adapter.snapshot();
    assert.equal(snapshot.providerPreviewPackageId,'pkg-safe-1');assert.equal(snapshot.providerStagePackageId,'pkg-safe-1');assert.equal(snapshot.providerPreview.packageId,'pkg-safe-1');assert.equal(snapshot.providerStage.packageId,'pkg-safe-1');
  }},
  {name:'provider-aware rehydration preserves exact provider receipt bindings',run:async()=>{
    const original=await fullyPrepared(new ProviderAwareBackupIntegrationAdapter({transport:new FakeTransport(happyHandler)}));const snapshot=original.snapshot();
    const restored=new ProviderAwareBackupIntegrationAdapter({transport:new FakeTransport(happyHandler)});const result=restored.rehydrate(snapshot);
    assert.equal(result.providerPreviewBound,true);assert.equal(result.providerStageBound,true);assert.equal(restored.snapshot().providerStagePackageId,'pkg-safe-1');
  }},
  {name:'provider-aware rehydration rejects provider receipt identity mismatch',run:async()=>{
    const original=await fullyPrepared(new ProviderAwareBackupIntegrationAdapter({transport:new FakeTransport(happyHandler)}));const snapshot=original.snapshot();snapshot.providerStagePackageId='pkg-other';
    const restored=new ProviderAwareBackupIntegrationAdapter({transport:new FakeTransport(happyHandler)});
    assert.throws(()=>restored.rehydrate(snapshot),/BACKUP_PROVIDER_STAGE_IDENTITY_MISMATCH/);
  }},
  {name:'legacy state without provider receipt does not invent provider availability',run:()=>{
    const pkg=packageReceipt(),snapshot={packages:[pkg],selectedPackageId:pkg.packageId,plan:{planId:'legacy-plan',packageId:pkg.packageId},preview:{packageId:pkg.packageId,state:'PREVIEWED'}};
    const restored=new ProviderAwareBackupIntegrationAdapter({transport:new FakeTransport(happyHandler)});restored.rehydrate(snapshot);
    assert.notEqual(restored.availability('backup.stage'),true);assert.equal(restored.snapshot().providerPreview,null);assert.equal(restored.snapshot().providerPreviewPackageId,null);
  }},
  {name:'durable attempt projection preserves original error and compensation evidence',run:async()=>{
    const adapter=new ProviderAwareBackupIntegrationAdapter({transport:new FakeTransport(happyHandler)});assert.equal((await adapter.createPackage()).ok,true);const projection=backupAttemptProjection(adapter);
    assert.equal(projection.durable,true);assert.equal(projection.source,'PROVIDER_DURABLE_ATTEMPT_JOURNAL');assert.equal(projection.rows[0].originalError.code,'PROVIDER_STAGE_FAILED');assert.equal(projection.rows[0].compensation.status,'COMPENSATED');
  }}
];

const results:any[]=[];
for(const test of tests){try{await test.run();results.push({name:test.name,status:'PASS'});}catch(error){results.push({name:test.name,status:'FAIL',error:String((error as any)?.stack||error)});}}
const pass=results.filter(row=>row.status==='PASS').length,fail=results.length-pass;
console.log(JSON.stringify({suite:'SWR-W05-BACKUP-mission',pass,fail,results},null,2));
if(fail)process.exitCode=1;
