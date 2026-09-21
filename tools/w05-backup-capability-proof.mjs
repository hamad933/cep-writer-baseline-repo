import {cpSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {CepSqlitePersistenceProvider} from '../stack/local-runtime/persistence/sqlite-persistence-provider.mjs';
import {BackupRestoreCapability} from '../stack/local-runtime/backup/backup-restore-capability.mjs';
const assert=(v,m)=>{if(!v)throw Error(m)},sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const root=mkdtempSync(join(tmpdir(),'cep-w05-backup-'));const checks=[];const check=(id,fn)=>{fn();checks.push({id,status:'PASS'})};
try{
 const provider=new CepSqlitePersistenceProvider({databasePath:join(root,'live.sqlite')});provider.bootstrap({id:'backup-real-consumer-doc',revision:'r1',title:'نسخة احتياطية · Backup',blocks:[{id:'b1',type:'paragraph',html:'Arabic العربية + English token'}]},{domainKind:'backup',surface:'backup'});
 const capability=new BackupRestoreCapability({persistenceProvider:provider,root:join(root,'capability')});const pkg=await capability.createPackage({label:'real-backup'});check('BKP-01-package-verified',()=>assert(pkg.ok&&pkg.status==='PACKAGE_VERIFIED','package not verified'));
 const drill=capability.drill({packageId:pkg.packageId});check('BKP-02-true-empty-drill',()=>assert(drill.ok&&drill.status==='STAGED_AND_VERIFIED'&&drill.target.trueEmptyBeforeRestore&&drill.liveRestored===false,'drill truth failed'));check('BKP-03-readback',()=>assert(drill.readback.documentCount===1&&drill.readback.revisionCount===1,'restore readback failed'));
 const activation=capability.requestActivation({drillId:drill.drillId,reason:'proof-only'});check('BKP-04-activation-separated',()=>assert(activation.ok&&activation.status==='AUTHORITY_PENDING'&&activation.liveRestored===false&&activation.productionDatabaseMutated===false,'activation separation failed'));
 const packageRoot=join(root,'capability','packages'),source=join(packageRoot,pkg.packageId);
 const clone=(id,mutate)=>{const dir=join(packageRoot,id);cpSync(source,dir,{recursive:true});const mp=join(dir,'manifest.json'),m=JSON.parse(readFileSync(mp,'utf8'));m.packageId=id;mutate?.(dir,m);writeFileSync(mp,JSON.stringify(m,null,2),'utf8');return id};
 const corrupt=clone('corrupt-package',(dir)=>{const path=join(dir,'snapshot.sqlite'),buf=Buffer.from(readFileSync(path));buf[Math.min(128,buf.length-1)]^=0xff;writeFileSync(path,buf)});const corruptResult=capability.drill({packageId:corrupt});check('BKP-N01-corrupt-rejected',()=>assert(!corruptResult.ok&&corruptResult.code==='PACKAGE_HASH_MISMATCH','corrupt package not rejected'));
 const wrong=clone('wrong-schema-package',(dir,m)=>{const path=join(dir,'schema-v1.sql');writeFileSync(path,readFileSync(path,'utf8')+'\n-- incompatible package-time schema artifact\n','utf8');m.schemaArtifact.sha256=sha(path)});const wrongResult=capability.drill({packageId:wrong});check('BKP-N02-wrong-schema-rejected',()=>assert(!wrongResult.ok&&wrongResult.code==='WRONG_SCHEMA_ARTIFACT','wrong schema not rejected'));
 const stale=clone('stale-package',(dir,m)=>{const path=join(dir,'snapshot.sqlite'),db=new DatabaseSync(path);db.exec('DELETE FROM schema_migrations');db.close();m.snapshot.sha256=sha(path);m.snapshot.bytes=readFileSync(path).length;m.migrations=[]});const staleResult=capability.drill({packageId:stale});check('BKP-N03-stale-rejected',()=>assert(!staleResult.ok&&staleResult.code==='STALE_PACKAGE_SCHEMA','stale package not rejected'));
 check('BKP-N04-unverified-activation-rejected',()=>{const r=capability.requestActivation({drillId:'missing'});assert(!r.ok&&r.code==='VERIFIED_DRILL_REQUIRED','activation accepted without drill')});provider.close();
 console.log(JSON.stringify({kind:'W05_BACKUP_CAPABILITY_PROOF',status:'PASS',checks,receipts:{package:pkg,drill,activation,negative:{corrupt:corruptResult,wrongSchema:wrongResult,stale:staleResult}}},null,2));
}catch(error){console.error(JSON.stringify({kind:'W05_BACKUP_CAPABILITY_PROOF',status:'FAIL',checks,error:String(error?.stack||error)},null,2));process.exitCode=1}finally{rmSync(root,{recursive:true,force:true})}
