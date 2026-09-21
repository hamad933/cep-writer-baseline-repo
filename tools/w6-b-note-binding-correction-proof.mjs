import {mkdir,writeFile} from 'node:fs/promises';
import {runW6BNoteBindingCorrectionProof} from '../dist/w6-b-note-binding-correction-tests.js';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';

const root=new URL('../',import.meta.url),assurance=new URL('assurance/',root);await mkdir(assurance,{recursive:true});
const identity=await canonicalSourceIdentity(root),proof=runW6BNoteBindingCorrectionProof();
const result={...proof,classification:'W6_B_BOUNDED_CORRECTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,blockingDefect:'AVAILABILITY_PROJECTION_AVAILABLE_WITHOUT_CANONICAL_SOURCE_IDENTITY',deterministicRejection:'SOURCE_IDENTITY_REQUIRED_FOR_AVAILABLE_BINDING',failAtomic:true};
await writeFile(new URL('W6_B_NOTE_BINDING_AVAILABILITY_INVARIANT_CORRECTION_PROOF.json',assurance),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:proof.status,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,cases:{total:proof.caseCount,pass:proof.pass,fail:proof.fail}},null,2));
if(proof.status!=='PASS')process.exitCode=1;
