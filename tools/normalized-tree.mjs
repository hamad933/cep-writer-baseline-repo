import { createHash } from 'node:crypto';
import { lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

export const NORMALIZED_TREE_ALGORITHM = 'CEP-NORMALIZED-TREE-V1__POSIX_PATH_SIZE_SHA256';
export const INTENTIONAL_EXCLUSIONS = [
  '.git/**','node_modules/**','**/__pycache__/**','**/*.pyc','**/*.sqlite','**/*.sqlite-wal','**/*.sqlite-shm'
];
const excluded = rel => {
  const parts=rel.split('/');
  const base=parts.at(-1)||'';
  return parts.includes('.git') || parts.includes('node_modules') || parts.includes('__pycache__') || base.endsWith('.pyc') || /\.sqlite(?:-wal|-shm)?$/.test(base);
};
export async function normalizedTreeIdentity(rootPath){
  const root=path.resolve(rootPath);
  const rows=[];
  async function walk(dir){
    const entries=await readdir(dir,{withFileTypes:true});
    entries.sort((a,b)=>a.name.localeCompare(b.name));
    for(const entry of entries){
      const abs=path.join(dir,entry.name);
      const rel=path.relative(root,abs).split(path.sep).join('/').normalize('NFC');
      if(excluded(rel)) continue;
      const st=await lstat(abs);
      if(st.isSymbolicLink()) throw new Error(`NORMALIZED_TREE_SYMLINK_REJECTED:${rel}`);
      if(st.isDirectory()) await walk(abs);
      else if(st.isFile()){
        const bytes=await readFile(abs);
        rows.push({path:rel,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
      }
    }
  }
  await walk(root);
  rows.sort((a,b)=>a.path.localeCompare(b.path));
  const stream=rows.map(r=>`${r.path}\0${r.size}\0${r.sha256}\n`).join('');
  return {algorithm:NORMALIZED_TREE_ALGORITHM,sha256:createHash('sha256').update(stream).digest('hex'),files:rows.length,bytes:rows.reduce((n,r)=>n+r.size,0),intentionalExclusions:INTENTIONAL_EXCLUSIONS,rows};
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){
  const root=process.argv[2]||process.cwd();
  const result=await normalizedTreeIdentity(root);
  console.log(JSON.stringify(result,null,2));
}
