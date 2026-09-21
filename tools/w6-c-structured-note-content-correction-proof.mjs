import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {runW6CStructuredNoteContentCorrectionProof} from '../dist/w6-c-structured-note-content-correction-tests.js';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
const root=new URL('../',import.meta.url),assurance=new URL('assurance/',root);await mkdir(assurance,{recursive:true});
const identity=await canonicalSourceIdentity(root),proof=runW6CStructuredNoteContentCorrectionProof();
const adapter=await readFile(new URL('stack/native-typescript/adapters/structured-note-content.ts',root),'utf8');
const staticChecks=[
 {id:'owner-instance-scoped-composition-registry',pass:/COMPOSITION_REGISTRIES=new WeakMap/.test(adapter)&&/new WeakMap\(\)/.test(adapter)},
 {id:'same-note-duplicate-guard',pass:/DUPLICATE_STRUCTURED_NOTE_CONTENT_ADAPTER/.test(adapter)&&/byNoteId/.test(adapter)},
 {id:'document-id-collision-guard',pass:/STRUCTURED_NOTE_CONTENT_DOCUMENT_ID_COLLISION/.test(adapter)&&/byDocumentId/.test(adapter)},
 {id:'preflight-before-engine-construction',pass:adapter.indexOf('assertPublicationSlotAvailable(bindingOwner,windowOwner,noteId,document.id)')<adapter.indexOf('new SemanticCommandBus()')},
 {id:'publication-after-complete-engine-construction',pass:adapter.indexOf('publishCanonicalAdapter(this)')>adapter.indexOf('new StructuredSurfaceHost')},
 {id:'canonical-composition-verifies-publication',pass:/STRUCTURED_NOTE_CONTENT_CANONICAL_PUBLICATION_DRIFT/.test(adapter)&&/STRUCTURED_NOTE_CONTENT_DOCUMENT_PUBLICATION_DRIFT/.test(adapter)},
 {id:'no-process-global-string-only-set',pass:!/new Set\(\).*noteId|NOTE_IDS\s*=\s*new Set/.test(adapter)}
];
const status=proof.status==='PASS'&&staticChecks.every(x=>x.pass)?'PASS':'FAIL';
const result={...proof,status,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,staticChecks};
await writeFile(new URL('W6_C_STRUCTURED_NOTE_CONTENT_BOUNDED_CORRECTION_PROOF.json',assurance),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,cases:{total:proof.caseCount,pass:proof.passCount,fail:proof.failCount},staticChecks:{total:staticChecks.length,pass:staticChecks.filter(x=>x.pass).length}},null,2));
if(status!=='PASS')process.exitCode=1;
