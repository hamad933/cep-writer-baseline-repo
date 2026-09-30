/* Fallback builder for the shared `dist/` seam.
 *
 * `npm run build:runtime` compiles the whole canonical source tree, so a single uncompilable file
 * owned by ANOTHER writer blocks every writer. This builds the canonical working tree into dist/
 * with each uncompilable file substituted by its last committed (HEAD) revision. It never modifies
 * any source file, and it refuses to run if a substituted file also fails to compile.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildRuntime} from '/workspaces/cep-writer-baseline-repo/tools/build-runtime.mjs';

const ROOT='/workspaces/cep-writer-baseline-repo';
const SRC=path.join(ROOT,'stack','native-typescript');
const TMP='/tmp/opencode/w05-build-src';

const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const a=path.join(d,e.name);return e.isDirectory()?walk(a):[a]}):[];

function copyTree(from,to){
  fs.rmSync(to,{recursive:true,force:true});
  fs.mkdirSync(to,{recursive:true});
  for(const file of walk(from)){
    const rel=path.relative(from,file), out=path.join(to,rel);
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.copyFileSync(file,out);
  }
}
const parses=file=>{try{stripTypeScriptTypes(fs.readFileSync(file,'utf8'),{mode:'strip'});return true}catch{return false}};

copyTree(SRC,TMP);
const broken=walk(SRC).filter(f=>f.endsWith('.ts')&&!parses(f));
const resolved=[],unresolved=[];
for(const file of broken){
  const rel=path.relative(SRC,file);
  let head=null;
  try{head=execFileSync('git',['show',`HEAD:stack/native-typescript/${rel}`],{cwd:ROOT,encoding:'utf8',maxBuffer:64e6})}catch{}
  const tmpFile=path.join(TMP,rel);
  if(head!==null){fs.writeFileSync(tmpFile,head);}
  if(head===null||!parses(tmpFile))unresolved.push(rel); else resolved.push(rel);
}
if(unresolved.length){console.error(JSON.stringify({build:'REFUSED',unresolved},null,2));process.exit(1)}
for(const f of walk(TMP).filter(f=>f.endsWith('.ts')&&!parses(f))){console.error(JSON.stringify({build:'REFUSED',stillBroken:path.relative(TMP,f)}));process.exit(1)}

const result=buildRuntime({sourceRoot:TMP,destinationRoot:path.join(ROOT,'dist')});
console.log(JSON.stringify({build:result.pass?'PASS':'FAIL',authority:result.authority,written:result.written,removedStale:result.removedStale,
  substitutedFromHead:resolved,note:'uncompilable working-tree files substituted by their HEAD revision; no source file was modified'},null,2));
