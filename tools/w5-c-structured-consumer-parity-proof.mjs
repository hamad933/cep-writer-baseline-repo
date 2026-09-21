import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {runW5CStructuredConsumerParityProof} from '../dist/w5-c-structured-consumer-parity-tests.js';
import {runW5AStructuredSurfaceHostProof} from '../dist/w5-a-structured-surface-host-tests.js';
import {runW5BStructuredNavigationProof} from '../dist/w5-b-structured-navigation-tests.js';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';

const root=new URL('../',import.meta.url),assurance=new URL('assurance/',root);await mkdir(assurance,{recursive:true});
const identity=await canonicalSourceIdentity(root),executable=runW5CStructuredConsumerParityProof(),a=runW5AStructuredSurfaceHostProof(),b=runW5BStructuredNavigationProof();
const sourcePaths=['stack/native-typescript/adapters/structured-note-content-compatibility.ts','stack/native-typescript/w5-c-structured-consumer-parity-tests.ts'];
const texts=Object.fromEntries(await Promise.all(sourcePaths.map(async p=>[p,await readFile(new URL(p,root),'utf8')])));
const forbiddenOwnerDeclarations=['StructuredSurfaceHost','StructuredDocumentDomainAdapter','StructuredSelectionKernel','StructuredClipboardTrustOwner','StructuredInputKeymapOwner','StructuredActionDescriptorOwner','InputDirectionResolver','StructuredRichContentOwner','StructuredDragDropOwner','StructuredDropTargetPolicyOwner','StructuredMutationKernel','StructuredTransactionHistoryRecoveryOwner','StructuredCommandAvailabilityOwner','StructuredNavigationDescriptorOwner','SemanticCommandBus','GlobalInputKeymapOwner','StickyNoteWindowOwner','NoteBindingAdapter'];
const findings=[];for(const [path,text] of Object.entries(texts))for(const owner of forbiddenOwnerDeclarations){const rx=new RegExp(`(?:class|function)\\s+${owner}\\b|(?:const|let|var)\\s+${owner}\\s*=`,'g');if(rx.test(text))findings.push({path,owner});}
const compatibilityText=texts['stack/native-typescript/adapters/structured-note-content-compatibility.ts'];
const staticChecks=[
 {id:'no-duplicate-semantic-owner-declarations',pass:findings.length===0,evidence:findings},
 {id:'note-compatibility-instantiates-canonical-adapter-only',pass:/new StructuredDocumentDomainAdapter\(/.test(compatibilityText)&&!/class\s+/.test(compatibilityText)},
 {id:'note-boundary-explicit-no-window-domain-owner',pass:/CONTENT_COMPATIBILITY_ONLY/.test(compatibilityText)&&/stickyNoteWindowOwnerImplemented:false/.test(compatibilityText)&&/finalNoteBindingAdapterImplemented:false/.test(compatibilityText)&&/secondEditorEngineImplemented:false/.test(compatibilityText)}
];
const status=executable.status==='PASS'&&a.status==='PASS'&&b.status==='PASS'&&staticChecks.every(x=>x.pass)?'PASS':'FAIL';
const proof={...executable,classification:'LANE_C_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,phase1CarryForward:{laneA:{status:a.status,pass:a.passCount,fail:a.failCount,cases:a.caseCount},laneB:{status:b.status,pass:b.pass,fail:b.fail}},staticChecks};
const negative={schemaVersion:1,kind:'W5_C_DUPLICATE_OWNER_NEGATIVE_SCAN',classification:'LANE_C_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',status:staticChecks.every(x=>x.pass)?'PASS':'FAIL',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,checkedPaths:sourcePaths,forbiddenOwnerDeclarations,findings,checks:staticChecks};
await writeFile(new URL('W5_C_STRUCTURED_CONSUMER_PARITY_PROOF.json',assurance),JSON.stringify(proof,null,2)+'\n');
await writeFile(new URL('W5_C_DUPLICATE_OWNER_NEGATIVE_SCAN.json',assurance),JSON.stringify(negative,null,2)+'\n');
console.log(JSON.stringify({status,sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,laneC:{cases:executable.caseCount,pass:executable.passCount,fail:executable.failCount},laneA:{status:a.status,pass:a.passCount,fail:a.failCount},laneB:{status:b.status,pass:b.pass,fail:b.fail},negative:negative.status},null,2));
if(status!=='PASS')process.exitCode=1;
