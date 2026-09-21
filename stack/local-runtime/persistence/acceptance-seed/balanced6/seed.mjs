import {readFileSync,existsSync,lstatSync,rmSync} from 'node:fs';
import {resolve,dirname,basename,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {CepSqlitePersistenceProvider} from '../../sqlite-persistence-provider.mjs';

export const BALANCED6_CLASSIFICATION='LOCAL_DEV_ACCEPTANCE_SEED__DETERMINISTIC__RESETTABLE__NON_PRODUCTION';
const HERE=dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH=join(HERE,'BALANCED6_SEED_MANIFEST.json');
const EXPECTED_IDS=Object.freeze(['KU-D03-0001','KU-D03-0004','KU-D03-0011','KU-D05-0021','KU-D05-0023','KU-D09-0002']);
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
const titleFrom=text=>{const line=text.split(/\r?\n/,1)[0]||'';return line.replace(/^#\s+/,'').trim()};
const documentFrom=(record,sourceText)=>({
  id:record.id,title:record.title,revision:`b6-${record.sourceSha256.slice(0,12)}`,
  tags:[record.domainId,'Balanced6','Local acceptance'],
  blocks:[{id:`b6-${record.id.toLowerCase()}-source`,type:'section',level:2,title:'Source-bound acceptance content',children:[{id:`b6-${record.id.toLowerCase()}-text`,type:'code',codeText:sourceText,children:[]}]}],
  sources:[{title:record.sourcePath,kind:'B09 source-bound acceptance content',status:`${record.sourceVersion} · SHA-256 verified`}],relations:[],labs:[],projects:[],evidence:[],
  provenance:{profile:'ACCEPTANCE_BALANCED_6',classification:BALANCED6_CLASSIFICATION,sourcePath:record.sourcePath,sourceSha256:record.sourceSha256,sourceVersion:record.sourceVersion,corpusSha256:record.corpusSha256,canonicalPublication:false}
});
export function validateBalanced6Manifest(manifest){
  if(manifest.profile!=='ACCEPTANCE_BALANCED_6'||manifest.classification!==BALANCED6_CLASSIFICATION)throw Error('BALANCED6_CLASSIFICATION_MISMATCH');
  if(!Array.isArray(manifest.documents)||manifest.documents.length!==6||manifest.count!==6)throw Error('BALANCED6_EXACT_SIX_REQUIRED');
  const ids=manifest.documents.map(x=>x.id);if(JSON.stringify(ids)!==JSON.stringify(EXPECTED_IDS))throw Error('BALANCED6_ID_SET_OR_ORDER_MISMATCH');
  for(const record of manifest.documents)if(record.sourceVersion!=='v0.1'||record.classification!==BALANCED6_CLASSIFICATION)throw Error(`BALANCED6_RECORD_PROVENANCE_MISMATCH:${record.id}`);
  return manifest.documents;
}
export function validateBalanced6Source(record,bytes){const actual=sha256(bytes),text=bytes.toString('utf8');if(actual!==record.sourceSha256)throw Error(`BALANCED6_SOURCE_SHA_MISMATCH:${record.id}`);if(titleFrom(text)!==record.title)throw Error(`BALANCED6_TITLE_MISMATCH:${record.id}`);return text}
export function loadAndValidateBalanced6(){
  const manifest=JSON.parse(readFileSync(MANIFEST_PATH,'utf8')),documents=validateBalanced6Manifest(manifest),sourceDir=join(HERE,'source');
  const records=documents.map(record=>{const path=join(sourceDir,`${record.id}.md`),bytes=readFileSync(path),text=validateBalanced6Source(record,bytes);return {...record,document:documentFrom(record,text),sourceBytes:bytes.length}});
  return {manifest,records};
}
export function assertSafeAcceptanceDbPath(databasePath){const p=resolve(databasePath);if(basename(p)!=='balanced6-acceptance.sqlite')throw Error('BALANCED6_SAFE_DB_BASENAME_REQUIRED');if(existsSync(p)&&lstatSync(p).isSymbolicLink())throw Error('BALANCED6_DB_SYMLINK_REJECTED');return p}
export function resetBalanced6Database(databasePath){const p=assertSafeAcceptanceDbPath(databasePath);for(const suffix of ['','-wal','-shm']){const x=p+suffix;if(existsSync(x)){const st=lstatSync(x);if(st.isSymbolicLink()||!st.isFile())throw Error('BALANCED6_DB_PATH_TYPE_REJECTED');rmSync(x)}}return p}
export function seedBalanced6({databasePath,reset=false}={}){const p=assertSafeAcceptanceDbPath(databasePath);if(reset)resetBalanced6Database(p);const {manifest,records}=loadAndValidateBalanced6(),provider=new CepSqlitePersistenceProvider({databasePath:p});try{const seedResults=[];for(const record of records){seedResults.push(provider.bootstrap(record.document,{domainKind:'library',surface:'balanced6-acceptance-seed',sourceKind:'b09-source-grounded-local-acceptance',provenance:record.document.provenance}))}return {ok:true,databasePath:p,classification:BALANCED6_CLASSIFICATION,profile:manifest.profile,seedCount:records.length,seedResults,documents:provider.listDocuments(),counts:provider.tableCounts(),integrity:provider.integrityCheck(),foreignKeys:provider.foreignKeyCheck(),migrations:provider.migrationHistory(),ftsRows:provider.ftsRows().length}}finally{provider.close()}}

if(import.meta.url===`file://${process.argv[1]}`){const args=process.argv.slice(2),idx=args.indexOf('--db'),db=idx>=0?args[idx+1]:join(process.cwd(),'assurance','balanced6-runtime','balanced6-acceptance.sqlite'),reset=args.includes('--reset');try{const result=seedBalanced6({databasePath:db,reset});process.stdout.write(JSON.stringify(result,null,2)+'\n')}catch(error){process.stderr.write(String(error?.stack||error)+'\n');process.exitCode=1}}
