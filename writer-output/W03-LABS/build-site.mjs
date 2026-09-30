/**
 * W03-LABS · private capture site builder (writer-local instrument).
 *
 * The shared `dist/**` build is SERIALIZED and may be transiently red from another unit's
 * in-flight file. This instrument never writes `dist/`: it copies the last good `dist/` into a
 * writer-private site directory, then overlays a fresh strip of every source file that parses.
 * Files that fail to parse (owned by another unit) keep their last-good dist output and are
 * listed in the report, so the labs candidate can be rendered and captured without editing
 * anyone else's file and without racing the shared derived output.
 *
 * Usage: node writer-output/W03-LABS/build-site.mjs [destination]
 */
import fs from 'node:fs';
import path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../',import.meta.url));
const source=path.join(root,'stack','native-typescript');
const dist=path.join(root,'dist');
const destination=process.argv[2]||'/tmp/opencode/labs-site';

const walk=d=>!fs.existsSync(d)?[]:fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const a=path.join(d,e.name);return e.isDirectory()?walk(a):[a]});

fs.rmSync(destination,{recursive:true,force:true});
fs.mkdirSync(destination,{recursive:true});
fs.cpSync(dist,destination,{recursive:true});

const written=[],keptFromDist=[],missingInDist=[];
for(const input of walk(source).filter(f=>f.endsWith('.ts')).sort()){
  const rel=path.relative(source,input).replace(/\.ts$/,'.js');
  const output=path.join(destination,rel);
  try{
    const generated=stripTypeScriptTypes(fs.readFileSync(input,'utf8'),{mode:'strip'});
    fs.mkdirSync(path.dirname(output),{recursive:true});
    fs.writeFileSync(output,generated);
    written.push(rel);
  }catch(error){
    if(fs.existsSync(path.join(dist,rel)))keptFromDist.push(rel);
    else missingInDist.push(`${rel} :: ${String(error.message).split('\n')[0]}`);
  }
}
for(const input of walk(source).filter(f=>f.endsWith('.css'))){
  const rel=path.relative(source,input);
  const output=path.join(destination,rel);
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.copyFileSync(input,output);
}

const report={pass:missingInDist.length===0,destination,written:written.length,keptFromDist,missingInDist,
  labs:written.filter(f=>f.startsWith('surfaces/labs/')||f.startsWith('adapters/labs/'))};
fs.writeFileSync(path.join(root,'writer-output','W03-LABS','SITE_BUILD.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,labs:report.labs},null,2));
