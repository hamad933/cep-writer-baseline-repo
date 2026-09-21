import fs from 'node:fs';
import {runW5BStructuredNavigationCorrectionProof} from '../dist/w5-b-structured-navigation-correction-tests.js';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
const root=new URL('../',import.meta.url),report=runW5BStructuredNavigationCorrectionProof(),identity=await canonicalSourceIdentity(root);
const output={...report,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,classification:'LANE_B_BOUNDED_CORRECTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE'};
fs.mkdirSync(new URL('../assurance/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../assurance/W5_B_BOUNDED_CORRECTION_PROOF.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({status:output.status,pass:output.pass,fail:output.fail,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files},null,2));
if(output.fail)process.exit(1);
