/**
 * Proves the captured candidate equals this unit's source: strips each writable-root TS file and
 * compares byte-for-byte with the generated dist file that the browser actually served.
 */
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';

const {stripTypeScriptTypes}=createRequire(import.meta.url)('node:module');
const root=new URL('../../',import.meta.url).pathname;
const pairs=[
  ['stack/native-typescript/surfaces/scenarios/i18n.ts','dist/surfaces/scenarios/i18n.js'],
  ['stack/native-typescript/surfaces/scenarios/util.ts','dist/surfaces/scenarios/util.js'],
  ['stack/native-typescript/surfaces/scenarios/styles.ts','dist/surfaces/scenarios/styles.js'],
  ['stack/native-typescript/surfaces/scenarios/views.ts','dist/surfaces/scenarios/views.js'],
  ['stack/native-typescript/surfaces/scenarios/structure.ts','dist/surfaces/scenarios/structure.js'],
  ['stack/native-typescript/surfaces/scenarios/inspector.ts','dist/surfaces/scenarios/inspector.js'],
  ['stack/native-typescript/surfaces/scenarios/presentation.ts','dist/surfaces/scenarios/presentation.js'],
  ['stack/native-typescript/surfaces/scenarios/index.ts','dist/surfaces/scenarios/index.js'],
  ['stack/native-typescript/adapters/scenarios/domain.ts','dist/adapters/scenarios/domain.js']
];
const rows=[];
for(const [src,dst] of pairs){
  let stripped=null,error=null;
  try{stripped=stripTypeScriptTypes(await readFile(root+src,'utf8'),{mode:'strip'})}catch(e){error=String(e.message).split('\n')[0]}
  let built=null;
  try{built=await readFile(root+dst,'utf8')}catch(e){error=error||'missing dist file'}
  rows.push({src,dst,parseOk:!error,inSync:stripped!==null&&built!==null&&stripped.trim()===built.trim(),srcBytes:stripped?.length??0,distBytes:built?.length??0,error});
}
const receipt={schemaVersion:1,proof:'W03-SCENARIOS-DIST-SYNC',checkedAt:new Date().toISOString(),
  allParsed:rows.every(r=>r.parseOk),allInSync:rows.every(r=>r.inSync),rows};
await writeFile(new URL('./DIST_SYNC.json',import.meta.url),JSON.stringify(receipt,null,2));
console.log(rows.map(r=>`${r.inSync?'IN SYNC  ':r.parseOk?'STALE    ':'PARSE FAIL'} ${r.src.split('/').pop()}`).join('\n'));
console.log(`allParsed=${receipt.allParsed} allInSync=${receipt.allInSync}`);
