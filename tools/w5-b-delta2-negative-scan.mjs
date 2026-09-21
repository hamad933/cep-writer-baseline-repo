import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
import {STRUCTURED_TREE_KERNEL} from '../dist/foundation/structured.js';
import {deriveStructuredReadInspectionDescriptor} from '../dist/foundation/structured/read-inspection.js';
import {StructuredNavigationDescriptorOwner} from '../dist/foundation/structured/outline-descriptor.js';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const paths=['stack/native-typescript/foundation/structured/read-inspection.ts','stack/native-typescript/foundation/structured/outline-descriptor.ts'];
const patterns={
  DOM_SCROLL_CALL:/\bscrollIntoView\s*\(/g,
  DOM_QUERY_CALL:/\b(?:document\.(?:querySelector|querySelectorAll|getElementById|createElement)|window\.|globalThis\.document)\b/g,
  FOCUS_CALL:/\.focus\s*\(/g,
  DOCUMENT_MUTATION_CALL:/\.(?:updateBlock|insertBlock|removeBlock|moveBlock|transact|commit|undo|redo)\s*\(/g,
  SELECTION_MUTATION_CALL:/\.(?:select|clearSelection|setSelection)\s*\(/g,
  DOMAIN_REFERENCE_MUTATION_CALL:/\b(?:bindReaderReference|writeReference|updateReference|mutateReference)\s*\(/g,
  CONTEXT_INSPECTOR_LIFECYCLE_CALL:/\.(?:openInspector|closeInspector|openContextInspector|closeContextInspector)\s*\(/g,
  OWNER_STRING_TREE_AUTHORITY:/treeKernel[^\n]{0,160}\.owner[^\n]{0,160}StructuredTreeKernel|StructuredTreeKernel[^\n]{0,160}\.owner/g
};
const findings=[];
for(const path of paths){
  const text=await readFile(resolve(root,path),'utf8');
  for(const [rule,pattern] of Object.entries(patterns)){
    pattern.lastIndex=0;
    for(const match of text.matchAll(pattern))findings.push({path,rule,match:match[0],offset:match.index});
  }
}
const fake={owner:'StructuredTreeKernel',contract:STRUCTURED_TREE_KERNEL.contract,validate:(...args)=>STRUCTURED_TREE_KERNEL.validate(...args),walk:(...args)=>STRUCTURED_TREE_KERNEL.walk(...args),findRef:(...args)=>STRUCTURED_TREE_KERNEL.findRef(...args),pathFor:()=>['FAKE_PATH']};
const document={id:'scan-doc',revision:'scan-r1',title:'Scan document',blocks:[{id:'scan-h1',type:'h2',html:'Scan'}]};
const identity={id:'scan-doc',committedRevision:'scan-r1',workingRevision:1,owner:'Scan'};
const capture=fn=>{try{fn();return {rejected:false,error:null}}catch(error){return {rejected:true,error:String(error?.message||error)}}};
const dynamic={
  standaloneFakeTree:capture(()=>new StructuredNavigationDescriptorOwner({readDocument:()=>structuredClone(document),readIdentity:()=>structuredClone(identity),treeKernel:fake})),
  helperFakeTree:capture(()=>deriveStructuredReadInspectionDescriptor({treeKernel:fake,document,identity,blockId:'scan-h1'}))
};
const expected='CANONICAL_STRUCTURED_TREE_KERNEL_REQUIRED';
const dynamicPass=dynamic.standaloneFakeTree.rejected&&dynamic.standaloneFakeTree.error===expected&&dynamic.helperFakeTree.rejected&&dynamic.helperFakeTree.error===expected;
const source=await canonicalSourceIdentity(new URL('../',import.meta.url));
const status=!findings.length&&dynamicPass?'PASS':'FAIL';
const report={schemaVersion:1,kind:'W5_B_POST_CORRECTION_DELTA2_NEGATIVE_OWNER_DOMAIN_MUTATION_TREE_AUTHORITY_SCAN',status,sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files,ownerPaths:paths,forbiddenPrimitiveFindings:findings,treeAuthority:{canonicalAuthority:'exact STRUCTURED_TREE_KERNEL identity',ownerStringOrDuckTypingAccepted:false,dynamic},claims:{domScrollOwned:false,transientLifecycleOwned:false,contextInspectorLifecycleOwned:false,canonicalSelectionOwned:false,documentMutationOwned:false,domainReferenceMutationOwned:false,secondTreeOwnerCreated:false}};
await writeFile(resolve(root,'assurance/W5_B_POST_CORRECTION_DELTA2_NEGATIVE_SCAN.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status,findings:findings.length,dynamic,sourceCanonicalTreeSha256:source.sha256,canonicalSourceFileCount:source.files},null,2));
if(status!=='PASS')process.exit(1);
