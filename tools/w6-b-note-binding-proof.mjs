import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {runW6BNoteBindingAdapterProof} from '../dist/w6-b-note-binding-tests.js';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';

const root=new URL('../',import.meta.url),assurance=new URL('assurance/',root);await mkdir(assurance,{recursive:true});
const identity=await canonicalSourceIdentity(root),proof=runW6BNoteBindingAdapterProof();
const sourcePaths=['stack/native-typescript/foundation/notes/note-binding.ts','stack/native-typescript/adapters/note-binding-domains.ts','stack/native-typescript/w6-b-note-binding-tests.ts'];
const texts=Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,await readFile(new URL(path,root),'utf8')])));
const ownerText=texts['stack/native-typescript/foundation/notes/note-binding.ts'];
const adapterText=texts['stack/native-typescript/adapters/note-binding-domains.ts'];
const forbiddenEdits=['stack/native-typescript/main.ts','stack/native-typescript/foundation/accepted-runtime.ts','stack/native-typescript/foundation/workspace.ts','stack/native-typescript/foundation/workspace-host.ts','stack/native-typescript/model-tests.ts','index.html'];
const staticChecks=[
  {id:'canonical-owner-single-declaration',pass:(ownerText.match(/class\s+NoteBindingAdapter\b/g)||[]).length===1},
  {id:'thin-domain-adapters-no-secondary-owner',pass:!/class\s+NoteBindingAdapter\b/.test(adapterText)&&/LibraryNoteBindingInputAdapter/.test(adapterText)&&/LearnNoteBindingInputAdapter/.test(adapterText)&&/SpatialNoteBindingInputAdapter/.test(adapterText)},
  {id:'no-content-window-persistence-ownership',pass:/excludedOwnership/.test(ownerText)&&!/localStorage|indexedDB|sessionStorage|writeFile|save\s*\(|setGeometry|deleteSource/.test(ownerText)},
  {id:'presentation-source-injection-guard',pass:/PRESENTATION_IDENTITY_CANNOT_BECOME_SOURCE_IDENTITY/.test(ownerText)},
  {id:'fail-atomic-rebind-order',pass:/const before=this\.descriptor\(id\);const next=normalizedBinding\(id,input\)/.test(ownerText)},
  {id:'explicit-stale-resolution-guard',pass:/EXPLICIT_SOURCE_REVALIDATION_REQUIRED/.test(ownerText)&&/RESOLUTION_EVIDENCE_REQUIRED/.test(ownerText)},
  {id:'canonical-owner-branding',pass:/OWNER_INSTANCES=new WeakSet/.test(ownerText)&&/NON_CANONICAL_NOTE_BINDING_OWNER/.test(ownerText)},
  {id:'canonical-domain-adapter-branding',pass:/DOMAIN_INPUT_ADAPTERS=new WeakSet/.test(ownerText)&&/NON_CANONICAL_DOMAIN_BINDING_ADAPTER/.test(ownerText)}
];
const status=proof.status==='PASS'&&staticChecks.every(check=>check.pass)?'PASS':'FAIL';
const result={...proof,classification:'W6_B_LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,staticChecks,forbiddenWriterEditTargets:forbiddenEdits};
const negative={schemaVersion:1,kind:'W6_B_NOTE_BINDING_NEGATIVE_COHERENCE_SCAN',classification:'W6_B_LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',status:staticChecks.every(check=>check.pass)?'PASS':'FAIL',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,checkedPaths:sourcePaths,checks:staticChecks};
await writeFile(new URL('W6_B_NOTE_BINDING_ADAPTER_PROOF.json',assurance),JSON.stringify(result,null,2)+'\n');
await writeFile(new URL('W6_B_NOTE_BINDING_NEGATIVE_COHERENCE.json',assurance),JSON.stringify(negative,null,2)+'\n');
console.log(JSON.stringify({status,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,cases:{total:proof.caseCount,pass:proof.pass,fail:proof.fail},staticChecks:{total:staticChecks.length,pass:staticChecks.filter(x=>x.pass).length}},null,2));
if(status!=='PASS')process.exitCode=1;
