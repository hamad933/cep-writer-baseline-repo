import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readdir} from 'node:fs/promises';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';

const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const parentRoot=process.env.CEP_W5B_PARENT_ROOT ? resolve(process.env.CEP_W5B_PARENT_ROOT) : null;
const ownerPaths=['stack/native-typescript/foundation/structured/read-inspection.ts','stack/native-typescript/foundation/structured/outline-descriptor.ts'];
const patterns={
  DOM_SCROLL_CALL:/\bscrollIntoView\s*\(/g,
  DOM_QUERY_CALL:/\b(?:document\.(?:querySelector|querySelectorAll|getElementById|createElement)|window\.|globalThis\.document)\b/g,
  FOCUS_CALL:/\.focus\s*\(/g,
  DOCUMENT_MUTATION_CALL:/\.(?:updateBlock|insertBlock|removeBlock|moveBlock|transact|commit|undo|redo)\s*\(/g,
  SELECTION_MUTATION_CALL:/\.(?:select|clearSelection|setSelection)\s*\(/g,
  DOMAIN_REFERENCE_MUTATION_CALL:/\b(?:bindReaderReference|writeReference|updateReference|mutateReference)\s*\(/g,
  CONTEXT_INSPECTOR_LIFECYCLE_CALL:/\.(?:openInspector|closeInspector|openContextInspector|closeContextInspector)\s*\(/g
};
const findings=[];
for(const path of ownerPaths){
  const text=await readFile(resolve(root,path),'utf8');
  for(const [rule,pattern] of Object.entries(patterns)){
    pattern.lastIndex=0;
    for(const match of text.matchAll(pattern))findings.push({path,rule,match:match[0],offset:match.index});
  }
}
const hash=async path=>createHash('sha256').update(await readFile(path)).digest('hex');
const walk=async directory=>{
  const out=[];
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const absolute=resolve(directory,entry.name);
    if(entry.isDirectory())out.push(...await walk(absolute)); else out.push(absolute);
  }
  return out;
};
let inherited=null;
if(parentRoot){
  const pFiles=await walk(parentRoot),wFiles=await walk(root),pMap=new Map(),wMap=new Map();
  for(const file of pFiles)pMap.set(relative(parentRoot,file).replaceAll('\\','/'),await hash(file));
  for(const file of wFiles)wMap.set(relative(root,file).replaceAll('\\','/'),await hash(file));
  const changed=[...pMap.keys()].filter(path=>wMap.has(path)&&pMap.get(path)!==wMap.get(path)&&path!=='DELIVERY_MANIFEST.json').sort();
  const removed=[...pMap.keys()].filter(path=>!wMap.has(path)).sort();
  const locked=['stack/native-typescript/main.ts','stack/native-typescript/foundation/workspace.ts','stack/native-typescript/foundation/workspace-host.ts','stack/native-typescript/foundation/accepted-runtime.ts','stack/native-typescript/foundation/wave3-assembly.ts','stack/native-typescript/foundation/wave4-assembly.ts','stack/native-typescript/model-tests.ts','dist/index.html','dist-ts/index.html','dist/foundation/donor.css','dist/foundation/extensions.css','dist-ts/foundation/donor.css','dist-ts/foundation/extensions.css'];
  const lockChecks=locked.map(path=>({path,byteIdenticalToParent:pMap.has(path)&&wMap.has(path)&&pMap.get(path)===wMap.get(path)}));
  for(const prefix of ['profiles/','contracts/'])lockChecks.push({path:prefix+'**',byteIdenticalToParent:![...new Set([...changed,...removed])].some(path=>path.startsWith(prefix))});
  inherited={changedExistingExcludingRootManifest:changed,removed,lockChecks};
}
const source=await canonicalSourceIdentity(new URL('../',import.meta.url));
const status=!findings.length&&(!inherited||(!inherited.changedExistingExcludingRootManifest.length&&!inherited.removed.length&&inherited.lockChecks.every(x=>x.byteIdenticalToParent)))?'PASS':'FAIL';
const report={schemaVersion:1,kind:'W5_B_NEGATIVE_OWNERSHIP_MUTATION_SCAN',status,sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files,ownerPaths,forbiddenPrimitiveFindings:findings,inheritedBoundary:inherited,claims:{domScrollOwned:false,transientLifecycleOwned:false,contextInspectorLifecycleOwned:false,canonicalSelectionOwned:false,documentMutationOwned:false,domainReferenceMutationOwned:false,rendererStateOwned:false}};
await writeFile(resolve(root,'assurance/W5_B_NEGATIVE_OWNERSHIP_MUTATION_SCAN.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status,findings:findings.length,sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files},null,2));
if(status!=='PASS')process.exitCode=1;
