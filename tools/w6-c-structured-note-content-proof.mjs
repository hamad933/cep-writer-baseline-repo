import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {runW6CStructuredNoteContentAdapterProof} from '../dist/w6-c-structured-note-content-tests.js';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
const root=new URL('../',import.meta.url),assurance=new URL('assurance/',root);await mkdir(assurance,{recursive:true});
const identity=await canonicalSourceIdentity(root),proof=runW6CStructuredNoteContentAdapterProof();
const sourcePaths=['stack/native-typescript/adapters/structured-note-content.ts','stack/native-typescript/adapters/structured-note-content-compatibility.ts','stack/native-typescript/w6-c-structured-note-content-tests.ts','stack/native-typescript/w6-c-structured-note-content-browser.ts'];
const texts=Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,await readFile(new URL(path,root),'utf8')])));
const finalText=texts[sourcePaths[0]],compatText=texts[sourcePaths[1]],allText=Object.values(texts).join('\n');
const declarationCount=(allText.match(/class\s+StructuredNoteContentAdapter\b/g)||[]).length;
const staticChecks=[
 {id:'exactly-one-final-structured-note-content-owner-declaration',pass:declarationCount===1,evidence:{declarationCount}},
 {id:'final-adapter-instantiates-accepted-structured-document-adapter',pass:/new StructuredDocumentDomainAdapter\s*\(/.test(finalText)&&/new StructuredSurfaceHost\s*\(/.test(finalText)},
 {id:'no-parallel-structured-semantic-class-declarations',pass:!/(class\s+Structured(?:DocumentDomainAdapter|SurfaceHost|SelectionKernel|ClipboardTrustOwner|TransactionHistoryRecoveryOwner|InputKeymapOwner|RichContentOwner|DragDropOwner)\b)/.test(finalText)},
 {id:'note-binding-canonical-owner-validation',pass:/assertCanonicalNoteBindingOwner/.test(finalText)&&/bindingOwner\.descriptor/.test(finalText)},
 {id:'sticky-window-canonical-owner-validation',pass:/validateStickyNoteWindowOwner/.test(finalText)&&/windowOwner\.window/.test(finalText)},
 {id:'parallel-structured-engine-injection-rejected',pass:/PARALLEL_STRUCTURED_ENGINE_INJECTION_FORBIDDEN/.test(finalText)},
 {id:'persistence-ceiling-explicit',pass:/UNPROVEN_NO_OWNER/.test(finalText)&&/FABRICATED_STRUCTURED_NOTE_PERSISTENCE_OWNER/.test(finalText)&&/STRUCTURED_NOTE_PERSISTENCE_OWNER_NOT_ACCEPTED/.test(finalText)},
 {id:'presentation-source-document-substitution-guards',pass:/PRESENTATION_IDENTITY_CANNOT_BECOME_NOTE_SOURCE_IDENTITY/.test(finalText)&&/PRESENTATION_IDENTITY_CANNOT_BECOME_NOTE_DOCUMENT_IDENTITY/.test(finalText)},
 {id:'w5-compatibility-remains-content-only',pass:/CONTENT_COMPATIBILITY_ONLY/.test(compatText)&&/finalNoteBindingAdapterImplemented:false/.test(compatText)&&/stickyNoteWindowOwnerImplemented:false/.test(compatText)&&!/class\s+StructuredNoteContentAdapter\b/.test(compatText)},
 {id:'no-storage-or-source-deletion-implementation',pass:!/localStorage|sessionStorage|indexedDB|writeFile\s*\(|deleteSource|removeSource/.test(finalText)}
];
const status=proof.status==='PASS'&&staticChecks.every(x=>x.pass)?'PASS':'FAIL';
const result={...proof,classification:'W6_C_LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,staticChecks};
const negative={schemaVersion:1,kind:'W6_C_DUPLICATE_OWNER_AND_BOUNDARY_NEGATIVE_SCAN',classification:'W6_C_LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',status:staticChecks.every(x=>x.pass)?'PASS':'FAIL',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,checkedPaths:sourcePaths,checks:staticChecks};
await writeFile(new URL('W6_C_STRUCTURED_NOTE_CONTENT_ADAPTER_PROOF.json',assurance),JSON.stringify(result,null,2)+'\n');
await writeFile(new URL('W6_C_STRUCTURED_NOTE_CONTENT_NEGATIVE_SCAN.json',assurance),JSON.stringify(negative,null,2)+'\n');
console.log(JSON.stringify({status,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,cases:{total:proof.caseCount,pass:proof.passCount,fail:proof.failCount},staticChecks:{total:staticChecks.length,pass:staticChecks.filter(x=>x.pass).length}},null,2));
if(status!=='PASS')process.exitCode=1;
