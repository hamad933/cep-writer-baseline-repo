import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { runW5AStructuredSurfaceHostProof } from '../dist/w5-a-structured-surface-host-tests.js';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const root=new URL('../',import.meta.url);
const assurance=new URL('assurance/',root);
const sourcePaths=[
  'stack/native-typescript/foundation/structured/surface-host.ts',
  'stack/native-typescript/foundation/structured/block-renderer.ts',
  'stack/native-typescript/foundation/structured/presentation-bridge.ts',
  'stack/native-typescript/w5-a-structured-surface-host-tests.ts',
  'stack/native-typescript/w5-a-structured-surface-host-browser.ts'
];
const forbiddenOwners=[
  'StructuredSelectionKernel','StructuredClipboardTrustOwner','StructuredInputKeymapOwner',
  'StructuredActionDescriptorOwner','InputDirectionResolver','StructuredRichContentOwner',
  'StructuredDragDropOwner','StructuredMutationKernel','StructuredTransactionHistoryRecoveryOwner',
  'StructuredCommandAvailabilityOwner','StructuredNavigationDescriptorOwner','StickyNoteWindowOwner'
];
const sources=Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,await readFile(new URL(path,root),'utf8')])));
const declarations=[];
for(const [path,text] of Object.entries(sources)) for(const owner of forbiddenOwners){
  const rx=new RegExp(`(?:class|function)\\s+${owner}\\b|(?:const|let|var)\\s+${owner}\\s*=`,`g`);
  if(rx.test(text))declarations.push({path,owner});
}
const host=sources['stack/native-typescript/foundation/structured/surface-host.ts'];
const renderer=sources['stack/native-typescript/foundation/structured/block-renderer.ts'];
const bridge=sources['stack/native-typescript/foundation/structured/presentation-bridge.ts'];
const staticChecks=[
  {id:'no-forbidden-owner-reimplementation',pass:declarations.length===0,evidence:declarations},
  {id:'surface-host-orchestration-contract',pass:/canonicalTruthOwnership:false/.test(host)&&/StructuredSurfaceHost/.test(host)&&/assertCanonicalOwners\(\)/.test(host)},
  {id:'canonical-update-route',pass:/this\.adapter\.updateBlock\(blockId,patch\)/.test(host)&&/historyFrameDelta!==1/.test(host)&&!/\.blocks\s*=/.test(host)},
  {id:'selection-delegation',pass:/this\.adapter\.(?:toggleSelectedBlock|selectBlockRange|selectBlocks)/.test(host)},
  {id:'clipboard-bus-delegation',pass:/this\.commands\.execute\(command/.test(host)&&/StructuredClipboardTrustOwner/.test(host)},
  {id:'input-keymap-canonical-adapter-path',pass:/adapter\.attachInputKeymap\(/.test(host)&&/adapter\.assertCanonicalInputKeymapOwner\(\)/.test(host)&&!/new StructuredInputKeymapOwner\(/.test(host)},
  {id:'action-delegation',pass:/this\.adapter\.executeStructuredAction/.test(host)&&/assertCanonicalActionDescriptorOwner/.test(host)},
  {id:'drag-delegation',pass:/this\.adapter\.dragDropOwner\.(?:beginPointer|updatePointer|commitPointer|reorderKeyboard)/.test(host)&&/_readModeDragDenial/.test(host)&&/assertCanonicalDragDropOwner/.test(host)},
  {id:'actual-global-command-class-boundary',pass:/exactPrototype\(commands,SemanticCommandBus\.prototype\)/.test(host)&&/exactPrototype\(owner,GlobalInputKeymapOwner\.prototype\)/.test(host)&&/GLOBAL_INPUT_KEYMAP_COMMAND_BUS_MISMATCH/.test(host)},
  {id:'post-construction-owner-drift-guard',pass:/STRUCTURED_CANONICAL_OWNER_DRIFT/.test(host)&&/_assertCanonicalCommandBindings/.test(host)},
  {id:'constructor-fail-atomic-ordering',pass:/INVALID_STRUCTURED_SURFACE_MODE/.test(host)&&/resolvedBridge/.test(host)&&/beforeInputOwner/.test(host)&&/restoreMap/.test(host)},
  {id:'content-applicability-preflight',pass:/_validateContentPatch/.test(host)&&/STRUCTURED_CONTENT_FIELD_NOT_APPLICABLE/.test(host)&&/STRUCTURED_CODE_ANNOTATION/.test(host)},
  {id:'renderer-presentation-only',pass:/canonicalTruthOwnership:false/.test(renderer)&&/this\.treeKernel\.pathFor/.test(renderer)&&/this\.richContentOwner\.projectBlock/.test(renderer)&&/childrenVisible/.test(renderer)&&/background/.test(renderer)&&!/mutationKernel/.test(renderer)},
  {id:'presentation-bridge-presentation-only',pass:/canonicalTruthOwnership:false/.test(bridge)&&/root\.innerHTML=this\.toHTML/.test(bridge)&&/instanceof StructuredBlockRenderer/.test(bridge)&&/aria-expanded/.test(bridge)&&!/mutationKernel|transactionOwner|commandAvailability/.test(bridge)}
];
const executable=runW5AStructuredSurfaceHostProof();
const identity=await canonicalSourceIdentity(root);
const negativeIds=['w5a.duplicate-command-owner-negative-fixture','w5a.controller.input-owner-command-global-mismatch-rejected','w5a.controller.fake-input-owner-rejected','w5a.controller.fake-presentation-bridge-rejected','w5a.delta.global-owner-different-command-bus-fail-atomic','w5a.delta.fake-same-name-global-owner-rejected','w5a.delta.fake-same-name-semantic-command-bus-rejected','w5a.delta.action-owner-post-construction-drift-rejected-before-effect','w5a.delta.drag-owner-post-construction-drift-rejected-before-effect','w5a.delta.selection-owner-post-construction-drift-rejected-before-effect','w5a.delta.fake-same-name-rich-owner-cannot-inject-projection','w5a.delta.fake-same-name-tree-kernel-cannot-alter-path-truth','w5a.delta.shared-command-binding-drift-rejected-before-execution','w5a.delta.invalid-bridge-constructor-fail-atomic','w5a.delta.invalid-mode-constructor-fail-atomic'];
const negativeCases=negativeIds.map(id=>executable.cases.find(x=>x.id===id));
const negative={schemaVersion:1,kind:'W5_A_NEGATIVE_DUPLICATE_OWNER_PROOF',classification:'LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,sourceFiles:identity.files,status:staticChecks.every(x=>x.pass)&&negativeCases.every(x=>x?.status==='PASS')?'PASS':'FAIL',staticChecks,runtimeNegativeFixtures:negativeCases};
const consumerCase=executable.cases.find(x=>x.id==='w5a.real-library-learn-consumer-parity');
const centralCase=executable.cases.find(x=>x.id==='w5a.central-renderer-change-both-consumers-exact-revert');
const ownerProof={...executable,classification:'LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files};
const realConsumer={schemaVersion:1,kind:'W5_A_REAL_CONSUMER_PROOF',classification:'LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,status:consumerCase?.status||'FAIL',case:consumerCase};
const central={schemaVersion:1,kind:'W5_A_CENTRAL_RENDERER_CHANGE_EXACT_REVERT_PROOF',classification:'LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE',sourceCanonicalTreeSha256:identity.sha256,status:centralCase?.status||'FAIL',case:centralCase};
const files={
  'W5_A_EXECUTABLE_OWNER_PROOF.json':ownerProof,
  'W5_A_REAL_CONSUMER_PROOF.json':realConsumer,
  'W5_A_CENTRAL_RENDERER_CHANGE_REVERT_PROOF.json':central,
  'W5_A_NEGATIVE_DUPLICATE_OWNER_PROOF.json':negative
};
for(const [name,value] of Object.entries(files))await writeFile(new URL(name,assurance),JSON.stringify(value,null,2)+'\n');
const failed=[executable.status!=='PASS'?'executable':null,negative.status!=='PASS'?'negative':null,realConsumer.status!=='PASS'?'consumer':null,central.status!=='PASS'?'central':null].filter(Boolean);
console.log(JSON.stringify({status:failed.length?'FAIL':'PASS',sourceCanonicalTreeSha256:identity.sha256,canonicalSourceFileCount:identity.files,executable:{cases:executable.caseCount,pass:executable.passCount,fail:executable.failCount},negative:{checks:staticChecks.length,status:negative.status},realConsumer:realConsumer.status,centralChangeRevert:central.status,failures:failed},null,2));
if(failed.length)process.exitCode=1;
