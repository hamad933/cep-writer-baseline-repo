import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ledger=JSON.parse(await readFile(path.join(root,'assurance/HIGH_VALUE_DEFERRED_LEDGER.json'),'utf8'));
const expected=['DEF-HV-001','DEF-HV-002','DEF-HV-003','DEF-HV-004','DEF-HV-005','DEF-HV-006','DEF-HV-007','DEF-HV-008','DEF-HV-009','DEF-HV-010'];
async function files(dir){const out=[]; for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory())out.push(...await files(p)); else if(/\.(ts|js)$/.test(e.name))out.push(p);} return out;}
const sourceFiles=await files(path.join(root,'stack/native-typescript'));
const sources=(await Promise.all(sourceFiles.map(async p=>[p,await readFile(p,'utf8')])));
const forbiddenImplementationSymbols=[
  'NotesCore','OperationalSurfaceAttachmentController','SessionShelf','LayoutProfileManager','AnalyticalWorkbenchCore',
  'ReviewAuditFamilyEngine','GuidanceSupportUI','EpistemicClaimEvidenceContract','ExternalRuntimeAdapter',
  'SSHRuntimeAdapter','ContainerRuntimeAdapter','VMRuntimeAdapter','WSLRuntimeAdapter','PowerShellRuntimeAdapter','PTYRuntimeAdapter'
];
const findings=[];
for(const [p,text] of sources){for(const symbol of forbiddenImplementationSymbols){const def=new RegExp(`\\b(?:class|function|interface|type|const)\\s+${symbol}\\b`); if(def.test(text)) findings.push({symbol,path:path.relative(root,p).replaceAll('\\\\','/')});}}
const ids=ledger.items.map(x=>x.id);
const checks=[
  {id:'deferred.exact-ten-ids',ok:JSON.stringify(ids)===JSON.stringify(expected),detail:ids},
  {id:'deferred.all-active',ok:ledger.items.length===10 && ledger.items.every(x=>x.activeFutureObligation===true),detail:ledger.summary},
  {id:'deferred.applicability-metadata',ok:ledger.items.every(x=>x.applicability && x.applicability.global!==undefined),detail:'routing metadata exists for each deferred obligation'},
  {id:'deferred.named-implementations-absent',ok:findings.length===0,detail:findings},
  {id:'deferred.stack-remains-unfrozen',ok:JSON.parse(await readFile(path.join(root,'contracts/FOUNDATION_RUNTIME_REGISTRY.json'),'utf8')).stackStatus==='STACK_NOT_FROZEN',detail:'STACK_NOT_FROZEN'}
];
const report={schemaVersion:1,status:checks.every(x=>x.ok)?'PASS':'FAIL',pass:checks.filter(x=>x.ok).length,fail:checks.filter(x=>!x.ok).length,checks:checks.map(({ok,...x})=>({...x,status:ok?'PASS':'FAIL'})),truthCeiling:'Named deferred implementation owners are absent from executable source; small interface hooks/metadata do not count as implementation.'};
await writeFile(path.join(root,'assurance/DEFERRED_BOUNDARY_GUARD.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2)); if(report.fail)process.exitCode=1;
