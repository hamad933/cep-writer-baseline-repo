import {spawnSync} from 'node:child_process';import {writeFile,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url),generator=new URL('tools/generate-writer-scaffold.mjs',root).pathname,authority=new URL('authority/FINAL_GATE_PARENT_AUTHORITY.json',root).pathname,tests=[];
const check=(id,ok,detail)=>tests.push({id,status:ok?'PASS':'FAIL',detail});
const profiles=(await readdir(new URL('profiles/',root))).filter(x=>x.endsWith('.json')).map(x=>x.slice(0,-5)).sort();
const blockedExpected=[];
function generate(surface){const r=spawnSync(process.execPath,[generator,'--surface',surface,'--authority-file',authority],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||`generator ${surface} exit ${r.status}`);return {text:r.stdout,value:JSON.parse(r.stdout)}}
try{
 const blocked=[];
 for(const surface of profiles){const a=generate(surface),b=generate(surface),v=a.value;
  check(`scaffold.deterministic.${surface}`,a.text===b.text,'byte-identical repeated generation');
  check(`scaffold.authority.${surface}`,v.authority.successorSha256==='692a2acc7ca9c10253ee115c81d2c3c1fd720927e5d5189a9cb1b0b2043c4cd4'&&v.authority.canonicalSourceSha256==='5dcc401a95f6b7b38bbd2f64d9140c29182eb459042dc6e3dd7be5460c6bca5f','exact E17 parent authority bound for post-final AnalyticalCompare reconciliation test');
  check(`scaffold.profile.${surface}`,v.mission.surface===surface&&v.surfaceProfile===`profiles/${surface}.json`,'one exact surface/profile');
  check(`scaffold.domain.${surface}`,v.domainTruth.canonicalStateOwner.endsWith('DomainAdapter')&&v.domainTruth.adapterPath.includes(`/surfaces/${surface}-domain.ts`)&&v.readiness.unresolvedDomainDecisions.length===0,'named thin domain adapter and no unresolved decision');
  check(`scaffold.scope.${surface}`,v.writableScope.readOnly.includes('stack/native-typescript/foundation/**')&&v.writableScope.prohibited.includes('shared registries')&&!/(laravel|postgresql|inertia|tailwind|historical vue)/i.test(a.text),'Foundation/shared paths protected and old stack absent');
  check(`scaffold.negative.${surface}`,['no duplicate owner','no fake persistence','no unavailable mutation receipt','no stale registry path'].every(x=>v.proof.negativeAssertions.includes(x)),'negative proof packet present');
  if(v.readiness.overall==='BLOCKED'){blocked.push(surface);check(`scaffold.blocked-nowrite.${surface}`,v.writableScope.allowed.length===0&&v.status==='SURFACE_INTAKE_BLOCKED','blocked surface receives zero writable scope');}
  else check(`scaffold.ready-scope.${surface}`,v.writableScope.allowed.every(x=>x.includes(`/surfaces/${surface}`)||x.includes(`/surfaces/${surface}-domain.ts`))&&v.status==='SURFACE_INTAKE_READY_FOR_WRITER','ready surface receives only own surface/domain scope');
 }
 check('scaffold.profile-count',profiles.length===23,profiles);
 check('scaffold.ready-count',profiles.length-blocked.length===23,{ready:profiles.length-blocked.length});
 check('scaffold.blocked-exact',JSON.stringify(blocked.sort())===JSON.stringify(blockedExpected),{expected:blockedExpected,actual:blocked.sort()});
}catch(e){check('scaffold.execution',false,String(e.stack||e));}
const report={schemaVersion:4,pass:tests.filter(t=>t.status==='PASS').length,fail:tests.filter(t=>t.status==='FAIL').length,profileCount:profiles.length,tests};await writeFile(new URL('assurance/WRITER_SCAFFOLD_TEST_RESULTS.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.fail)process.exitCode=1;
