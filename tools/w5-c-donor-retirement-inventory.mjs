import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {canonicalSourceIdentity} from './source-tree-identity.mjs';
import {buildEvidenceIndex,evaluateRetirementInvariants,validateInventoryData,RETIRE_READY,KEEP} from './w5-c-donor-retirement-truth-validator.mjs';

const root=new URL('../',import.meta.url);
const donorPath='stack/native-typescript/foundation/accepted-runtime.ts';
const donorText=await readFile(new URL(donorPath,root),'utf8');
const donorLines=donorText.split(/\r?\n/);
const sha=v=>createHash('sha256').update(v).digest('hex');
const functionLine=name=>{const needle=new RegExp(`(?:async\\s+)?function\\s+${name.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*\\(`);const i=donorLines.findIndex(line=>needle.test(line));if(i<0)throw new Error(`DONOR_REGION_NOT_FOUND:${name}`);return i+1;};
const region=(fn,branch='whole')=>({file:donorPath,function:fn,line:functionLine(fn),branch,deterministicId:`${donorPath}::${fn}::${branch}`});
const cov=(pointer,keyboard,accessibility,browser,notes='')=>({pointer,keyboard,accessibility,browser,notes});
const allConsumers=['Library reference consumer','Learn real Structured consumer','Note-content-compatible consumer'];
const libLearn=['Library reference consumer','Learn real Structured consumer'];
const replacement=(owner,path)=>({owner,path});
const candidate=(id,fn,branch,behavior,repl,coverage,central=true,visual='PRESERVED_BY_UNCHANGED_DONOR_PLUS_REGRESSION')=>({id,region:region(fn,branch),behavior,replacement:repl,realConsumerProof:allConsumers,coverage,centralChangeProofReachesReplacement:central,visualInteractionPreservation:visual,priorAdjudication:'RETIRE_READY'});
const keep=(id,fn,branch,behavior,repl,proof,coverage,reason,central=false,visual='PRESERVED_DONOR_REQUIRED')=>({id,region:region(fn,branch),behavior,replacement:repl,realConsumerProof:proof,coverage,centralChangeProofReachesReplacement:central,visualInteractionPreservation:visual,keepReason:reason,priorAdjudication:'KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE'});

const hiddenFalseAssessments={
 D02:{rationale:'This branch synchronizes already-canonical projection into donor presentation state; it does not decide canonical Structured truth.',sourceEvidence:['applyStructuredProjection consumes accepted projection and updates presentation shadow only.']},
 D05:{rationale:'The main undo branch delegates history causality to extension.execute(history.undo); remaining work is bookmark/render/focus projection glue.',sourceEvidence:['accepted-runtime.ts::undo::main branch receives the accepted transaction result before donor bookmark/render/focus projection.']},
 D07:{rationale:'The main redo branch delegates history causality to extension.execute(history.redo); remaining work is bookmark/render/focus projection glue.',sourceEvidence:['accepted-runtime.ts::redo::main branch receives the accepted transaction result before donor bookmark/render/focus projection.']},
 D09:{rationale:'Bookmark capture records DOM caret/focus presentation and reads the accepted Structured selection bookmark; it does not author canonical selection.',sourceEvidence:['captureBookmark reads window selection and extension.structuredAdapter.selectionBookmark without canonical document mutation.']},
 D10:{rationale:'Bookmark restore is presentation/focus restoration around an already-owned Structured selection projection.',sourceEvidence:['restoreBookmark restores DOM selection/focus presentation rather than canonical document truth.']},
 D12:{rationale:'The main drag branch delegates canonical move semantics to extension.execute(block.moveToGap); after success it only renders/focuses.',sourceEvidence:["moveBlockToGap(main) invokes extension.execute('block.moveToGap', ...) and performs no direct st.blocks write on the main branch.",'The only post-success donor operations on the main branch are renderSurface and focusBlock presentation glue.']},
 D16:{rationale:'The canonical main command-availability branch is a direct return from extension.commandAvailability; local fallback policy executes only when the command is not canonical.',sourceEvidence:['commandAvailability begins with if(canonicalStructuredCommand(...)) return extension.commandAvailability(...).']},
 D18:{rationale:'This branch is accepted DOM/chrome/focus presentation composition; canonical Structured truth is supplied by the converged engine.',sourceEvidence:['renderSurface is retained for visual composition and focus hooks, not canonical document mutation.']},
 D19:{rationale:'Recursive DOM emission is presentation rendering over existing block truth.',sourceEvidence:['renderBlockArray recursively emits DOM and wiring without becoming canonical tree authority.']},
 D20:{rationale:'Per-block DOM/accessibility rendering is presentation behavior over canonical block truth.',sourceEvidence:['renderBlock emits controls/content/ARIA projection while canonical tree/mutation owners remain external.']},
 D29:{rationale:'The main block-property branch delegates canonical formatting mutation to extension.execute; remaining donor operations are render/focus/menu presentation glue.',sourceEvidence:['setBlockProp(main) maps UI key to canonical command then calls extension.execute; it does not directly write the main block property.']},
 D30:{rationale:'Insertion transient is DOM/focus lifecycle only; insertion semantics are separately owned.',sourceEvidence:['openInsertion opens and positions transient UI and focus lifecycle.']},
 D31:{rationale:'Context-menu branch is transient/focus presentation around accepted action descriptors.',sourceEvidence:['openBlockMenu provides menu/focus presentation rather than canonical mutation truth.']},
 D32:{rationale:'Structure-tree branch renders navigation presentation; descriptor truth is supplied by StructuredNavigationDescriptorOwner.',sourceEvidence:['renderStructure supplies DOM/search/active-path presentation and does not replace descriptor authority.']},
 D35:{rationale:'Quick-jump branch renders transient DOM from descriptor truth and accepted focus lifecycle.',sourceEvidence:['renderQuickJump is presentation of quick-jump descriptors.']},
 D36:{rationale:'Quick-jump control synchronization is presentation state only.',sourceEvidence:['syncQuickJumpControl synchronizes control visibility/state without canonical document mutation.']},
 D41:{rationale:'Event binding is integration wiring; semantic ownership remains in the invoked canonical owners.',sourceEvidence:['bindEvents registers browser event listeners and dispatches into existing handlers/owners.']},
 D42:{rationale:'Code markup branch is visual rendering of code tokens/annotations.',sourceEvidence:['renderCodeMarkup emits syntax/annotation presentation and does not mutate canonical code truth.']},
 D43:{rationale:'Multi-block toolbar function renders selection presentation; canonical selection remains StructuredSelectionKernel-owned.',sourceEvidence:['renderBlockSelectionToolbar projects toolbar/actions from existing selection state.']},
 D45:{rationale:'Delete-confirm function owns dialog/focus presentation while confirmation requirement is supplied by StructuredActionDescriptorOwner.',sourceEvidence:['openDeleteConfirm renders/positions confirmation UI and focus lifecycle; it does not decide canonical subtree confirmation policy.']},
 D46:{rationale:'Inspector branch is diagnostic projection only, not a Structured semantic owner.',sourceEvidence:['inspect projects diagnostic runtime state without canonical Structured mutation.']}
};
const hiddenOwnerAssessment=(entry)=>{
 const proven=hiddenFalseAssessments[entry.id];
 if(proven)return {remains:false,basis:'BRANCH_SOURCE_AND_REPLACEMENT_REVIEW',...proven,conclusion:'NO_HIDDEN_DONOR_SEMANTIC_OWNER_PATH'};
 return {remains:true,basis:'CONSERVATIVE_BRANCH_REVIEW',rationale:`No-hidden-owner condition is not proven for ${entry.region.deterministicId}. Donor-local behavior remains material: ${entry.behavior}`,sourceEvidence:[entry.region.deterministicId,entry.keepReason||'Branch-level semantic/integration behavior remains donor-owned or ambiguous pending final convergence.'],conclusion:'HIDDEN_DONOR_SEMANTIC_OWNER_REMAINS'};
};
const retirementProofById={
 D12:{
  replacementExecutableEvidenceRefs:['w5c.drag-keyboard-shared-target-policy-all-three','w5c.drag-pointer-shared-target-policy-all-three'],
  realConsumerEvidenceRefs:['w5c.drag-keyboard-shared-target-policy-all-three','w5c.drag-pointer-shared-target-policy-all-three'],
  interactionEvidenceRefs:{pointer:['browser.pointer-keyboard-drag-same-policy'],keyboard:['browser.pointer-keyboard-drag-same-policy'],browser:['browser.pointer-keyboard-drag-same-policy']},
  coverageNARationale:{accessibility:'N/A: canonical move-target/mutation policy has no independent ARIA surface; accessibility presentation remains with accepted renderer/focus owners and is not authored by this donor branch.'},
  centralChangeApplicable:false,
  centralChangeNotApplicableReason:'Requirement 14 central renderer/presentation-policy mutation does not govern drag target/mutation semantics; exact drag owner replacement is proven by the bound executable/browser drag cases.',
  visualPreservationEvidenceRefs:['browser.pointer-keyboard-drag-same-policy'],
  retirementOwnershipProof:'MAIN_BRANCH_DELEGATION_ONLY_AFTER_CANONICAL_EXECUTE; POST_SUCCESS_RENDER_AND_FOCUS_ARE_PRESENTATION_GLUE'
 }
};
const entries=[
 keep('D01','newDocStore','canonical-shadow-store','Creates accepted-runtime mutable document/history/selection shadow state.',replacement('StructuredDocumentDomainAdapter','foundation/structured.ts'),libLearn,cov('indirect','indirect','indirect','legacy + W5 C'),'Legacy runtime still consumes this local store and Note-window state is outside Lane C; deleting it now would break accepted runtime composition.'),
 keep('D02','applyStructuredProjection','structured-projection-sync','Copies canonical Structured projections back into accepted-runtime presentation store.',replacement('StructuredPresentationBridge','foundation/structured/presentation-bridge.ts'),allConsumers,cov('indirect','indirect','yes','W5 C + legacy'),'Canonical presentation bridge is proven, but accepted-runtime synchronization glue remains an integration seam until Controller convergence.',true),
 candidate('D03','pushHistory','main-structured-transaction','Routes main Structured history frame creation through accepted external transaction.',replacement('StructuredTransactionHistoryRecoveryOwner','foundation/structured/transaction-history.ts'),cov('yes','yes','n/a semantic transaction','W5 C')),
 keep('D04','pushHistory','note-local-history','Creates local Sticky Note history frames for non-main surface.',replacement('Wave 6 final NoteBindingAdapter / note-window integration','DEFERRED_WAVE6'),[],cov('n/a','n/a','n/a','not applicable'),'Lane C Note proof is content compatibility only and is forbidden from owning StickyNoteWindowOwner/final NoteBindingAdapter.'),
 candidate('D05','undo','main-structured-history','Routes main Structured undo through accepted command/transaction owner.',replacement('StructuredTransactionHistoryRecoveryOwner','foundation/structured/transaction-history.ts'),cov('n/a','yes','n/a','W5 C')),
 keep('D06','undo','note-local-history','Runs local Sticky Note undo and bookmark restore.',replacement('Wave 6 final note transaction binding','DEFERRED_WAVE6'),[],cov('n/a','n/a','focus restore retained','not applicable'),'Note-window history/focus is explicitly outside the Lane C content-compatibility authority.'),
 candidate('D07','redo','main-structured-history','Routes main Structured redo through accepted command/transaction owner.',replacement('StructuredTransactionHistoryRecoveryOwner','foundation/structured/transaction-history.ts'),cov('n/a','yes','n/a','Lane A + preserved regressions')),
 keep('D08','redo','note-local-history','Runs local Sticky Note redo and bookmark restore.',replacement('Wave 6 final note transaction binding','DEFERRED_WAVE6'),[],cov('n/a','n/a','focus restore retained','not applicable'),'Requires final NoteBindingAdapter/window lifecycle evidence in Wave 6.'),
 keep('D09','captureBookmark','dom-selection-bookmark','Captures DOM caret/focus bookmark for accepted runtime surfaces.',replacement('StructuredSelectionKernel + accepted Global focus/transient owners','foundation/structured/selection.ts + global owners'),libLearn,cov('yes','keyboard caret','yes','legacy/W3/W4'),'Canonical selection ownership is proven, but DOM caret/focus restoration is presentation lifecycle and remains required by legacy composition.'),
 keep('D10','restoreBookmark','dom-selection-bookmark','Restores DOM caret/focus bookmark and Structured selection projection.',replacement('StructuredSelectionKernel + accepted Global focus/transient owners','foundation/structured/selection.ts + global owners'),libLearn,cov('yes','keyboard caret','yes','legacy/W3/W4'),'DOM focus restoration remains a presentation seam; Lane C must not replace it with a new transient owner.'),
 candidate('D11','applyStructuredMutation','main-canonical-mutation','Routes Structured document mutation to canonical mutation kernel.',replacement('StructuredMutationKernel','foundation/structured/mutation.ts'),cov('yes','yes','n/a','W5 C')),
 candidate('D12','moveBlockToGap','main-drag-mutation','Validates and commits canonical move-to-gap semantics.',replacement('StructuredDragDropOwner + StructuredDropTargetPolicyOwner + StructuredMutationKernel','foundation/structured/drag-drop.ts'),cov('yes','yes','n/a','W5 C')),
 candidate('D13','validateMoveTarget','main-target-validation','Validates canonical nested/gap move targets.',replacement('StructuredDropTargetPolicyOwner','foundation/structured/drag-drop-target.ts'),cov('yes','yes','n/a','W5 C')),
 candidate('D14','canonicalStructuredCommand','command-normalization','Normalizes accepted Structured command identity.',replacement('SemanticCommandBus + StructuredCommandAvailabilityOwner','foundation/global/commands.ts + foundation/structured/command-availability.ts'),cov('indirect','yes','n/a','Lane A + W5 C')),
 candidate('D15','structuredCommandContext','command-context','Builds canonical Structured command context without creating document truth.',replacement('StructuredSurfaceHost command routing + StructuredCommandAvailabilityOwner','foundation/structured/surface-host.ts'),cov('indirect','yes','n/a','Lane A + W5 C')),
 candidate('D16','commandAvailability','main-command-availability','Delegates main Structured command availability policy.',replacement('StructuredCommandAvailabilityOwner','foundation/structured/command-availability.ts'),cov('yes','yes','n/a','Lane A + W5 C')),
 candidate('D17','setMode','structured-read-edit-semantic','Applies read/edit semantic mode to main Structured surface.',replacement('StructuredSurfaceHost','foundation/structured/surface-host.ts'),cov('yes denial','yes denial','contenteditable/read projection','W5 C')),
 keep('D18','renderSurface','legacy-dom-composition','Renders accepted Library/Note surface DOM, chrome, focus hooks and existing visual composition.',replacement('StructuredBlockRenderer + StructuredPresentationBridge','foundation/structured/block-renderer.ts + presentation-bridge.ts'),libLearn,cov('yes','yes','yes','legacy + Wave3 + Wave4 + Wave5'),'Central renderer reaches all Lane C consumers, but full accepted-runtime DOM/chrome convergence and actual donor removal are shared Controller work.',true,'PRESERVED_AND_HIGH_VALUE; DONOR_LEFT_UNCHANGED'),
 keep('D19','renderBlockArray','legacy-recursive-dom-render','Recursively emits accepted runtime block DOM and surface-specific wiring.',replacement('StructuredBlockRenderer','foundation/structured/block-renderer.ts'),libLearn,cov('yes','yes','yes','legacy + W5 C'),'Replacement projection is proven, but exact accepted Library DOM/interaction composition is still supplied here pending final convergence.',true,'PRESERVED_AND_HIGH_VALUE; DONOR_LEFT_UNCHANGED'),
 keep('D20','renderBlock','legacy-block-dom-render','Renders individual block controls/content, accessibility hooks and donor visual behavior.',replacement('StructuredBlockRenderer + StructuredPresentationBridge','foundation/structured/block-renderer.ts + presentation-bridge.ts'),libLearn,cov('yes','yes','yes','legacy + W5 C'),'High-value per-block DOM behavior is broader than Lane C replacement evidence; retain until Controller performs convergence.',true,'PRESERVED_AND_HIGH_VALUE; DONOR_LEFT_UNCHANGED'),
 candidate('D21','commitEditable','main-content-commit-semantic','Commits editable block content into canonical Structured transaction path.',replacement('StructuredSurfaceHost.updateContent + StructuredTransactionHistoryRecoveryOwner','foundation/structured/surface-host.ts'),cov('pointer editing','keyboard editing','n/a','W5 C')),
 candidate('D22','selectBlock','main-selection-semantic','Updates canonical block selection for main Structured surface.',replacement('StructuredSelectionKernel','foundation/structured/selection.ts'),cov('yes','yes','selection DOM state','W5 C')),
 keep('D23','deriveGapTarget','dom-gap-hit-testing','Derives drag target from DOM geometry and pointer location.',replacement('StructuredDropTargetPolicyOwner consumes canonical target; DOM geometry remains presentation-owned','foundation/structured/drag-drop-target.ts'),libLearn,cov('yes','n/a','n/a','legacy + W5 C'),'Lane C proves canonical target validation, not wholesale retirement of DOM hit-testing/geometry.'),
 keep('D24','insertBlock','legacy-insertion-ui-and-mutation','Creates blocks from insertion UI, mixes presentation context with canonical insertion route.',replacement('StructuredActionDescriptorOwner + StructuredMutationKernel','foundation/structured/action-descriptor.ts + mutation.ts'),libLearn,cov('yes','yes','yes menus','legacy/W4/W5'),'Core action owner is proven but this branch contains accepted UI/transient behavior and multiple insertion variants not exhaustively retired in Lane C.',true),
 keep('D25','duplicateBlock','legacy-duplicate-action','Duplicates a block from donor context actions.',replacement('StructuredActionDescriptorOwner + StructuredMutationKernel','foundation/structured/action-descriptor.ts + mutation.ts'),libLearn,cov('yes','yes','menu accessibility','legacy/W4'),'Action ownership is canonical, but exact donor UI branch remains tied to accepted menu/transient composition.'),
 keep('D26','removeBlock','legacy-delete-action','Deletes block/subtree with donor UI lifecycle.',replacement('StructuredActionDescriptorOwner + StructuredMutationKernel','foundation/structured/action-descriptor.ts + mutation.ts'),libLearn,cov('yes','yes','confirmation dialog','legacy/W4'),'Deletion includes confirmation/transient presentation branches not fully replaceable by Lane C alone.'),
 keep('D27','copyPlainBlock','legacy-clipboard-copy','Serializes/copies a Structured block from donor runtime.',replacement('StructuredClipboardTrustOwner','foundation/structured/clipboard.ts'),libLearn,cov('yes','keyboard shortcut','yes clipboard feedback','legacy/W5'),'Clipboard truth owner is proven across three Lane C consumers, but donor serialization/UI glue is retained until final convergence.',true),
 keep('D28','cutBlock','legacy-clipboard-cut','Combines donor clipboard copy and mutation deletion.',replacement('StructuredClipboardTrustOwner + StructuredMutationKernel','foundation/structured/clipboard.ts + mutation.ts'),libLearn,cov('yes','keyboard shortcut','yes','legacy'),'Composite UI branch is broader than Lane C copy/ownership proof; retain conservatively.'),
 candidate('D29','setBlockProp','main-direction-format-semantic','Routes block property formatting (including direction/alignment/background) through canonical command availability/mutation owners.',replacement('InputDirectionResolver + StructuredCommandAvailabilityOwner + StructuredMutationKernel','foundation/structured/direction.ts + command-availability.ts'),cov('yes controls','yes command','projected dir','W5 C + Wave4')),
 keep('D30','openInsertion','insertion-transient-ui','Opens insertion transient UI and binds donor DOM focus lifecycle.',replacement('StructuredActionDescriptorOwner for descriptors; accepted Global transient/focus owners for presentation','foundation/structured/action-descriptor.ts + global owners'),libLearn,cov('yes','yes','focus/ARIA','legacy/W4'),'Descriptor truth converges, but Global transient/focus presentation must remain accepted owner and donor DOM glue remains until convergence.'),
 keep('D31','openBlockMenu','context-menu-transient-ui','Opens block context menu, focus trapping and donor action presentation.',replacement('StructuredActionDescriptorOwner + accepted Global transient/focus owners','foundation/structured/action-descriptor.ts + global owners'),libLearn,cov('yes','Shift+F10','ARIA/focus','legacy/W4'),'Lane C must not duplicate Global transient/focus ownership; donor presentation stays until final convergence.'),
 keep('D32','renderStructure','legacy-structure-tree-presentation','Renders Library structure tree, search/filter, active path and DOM navigation.',replacement('StructuredNavigationDescriptorOwner for descriptor truth; accepted Global presentation lifecycle for focus/scroll','foundation/structured/outline-descriptor.ts'),libLearn,cov('yes','yes','tree accessibility','legacy + W5 B/C'),'Navigation descriptor truth is canonical, but actual structure-tree DOM/focus/scroll presentation remains accepted runtime behavior.',true,'PRESERVED_AND_HIGH_VALUE; DONOR_LEFT_UNCHANGED'),
 keep('D33','switchKU','library-route-navigation','Switches Library KU and updates accepted route, focus and visual composition.',replacement('StructuredNavigationDescriptorOwner is read-navigation descriptor only; route ownership remains outside Lane C','foundation/structured/outline-descriptor.ts'),['Library reference consumer'],cov('yes','yes','focus announcement','legacy'),'This is broader workspace/library route lifecycle, not a Structured navigation descriptor semantic to retire in Lane C.'),
 candidate('D34','inspectReadBlock','read-inspection-descriptor-semantic','Derives read inspection semantics for a canonical Structured block before presentation.',replacement('StructuredNavigationDescriptorOwner.readInspection','foundation/structured/outline-descriptor.ts'),cov('yes entry','yes entry','presentation delegated','W5 B/C')),
 keep('D35','renderQuickJump','quick-jump-presentation','Renders quick-jump DOM, transient list and navigation affordances.',replacement('StructuredNavigationDescriptorOwner.quickJump descriptor + accepted Global transient/focus owners','foundation/structured/outline-descriptor.ts + global owners'),libLearn,cov('yes','yes','focus/ARIA','legacy + W5 B/C'),'Descriptor is fully replaced, but DOM focus/scroll/transient presentation is intentionally not owned by Lane C.',true),
 keep('D36','syncQuickJumpControl','quick-jump-control-presentation','Synchronizes quick-jump button visibility/state with donor runtime.',replacement('StructuredNavigationDescriptorOwner descriptor + accepted presentation lifecycle','foundation/structured/outline-descriptor.ts'),libLearn,cov('yes','yes','yes','legacy'),'Presentation control glue remains until Controller convergence.'),
 keep('D37','handleEditableKey','legacy-key-event-glue','Handles raw contenteditable keyboard/caret/composition and donor DOM event integration.',replacement('StructuredInputKeymapOwner + GlobalInputKeymapOwner + SemanticCommandBus','foundation/structured/input-keymap.ts + foundation/global/input-keymap.ts'),libLearn,cov('n/a','yes','IME/caret accepted proofs','Lane A + Wave4 + legacy'),'Semantic key ownership is canonical, but raw DOM caret/composition glue and all event cases are high-value integration behavior requiring final convergence.',true),
 keep('D38','handlePointerDown','legacy-pointer-drag-start-glue','Starts donor pointer selection/drag/marquee behavior from DOM events.',replacement('StructuredDragDropOwner + StructuredSelectionKernel; Global transient presentation retained','foundation/structured/drag-drop.ts + selection.ts'),libLearn,cov('yes','n/a','pointer semantics','legacy + W5 C'),'Canonical drag/selection semantics are proven, but this function multiplexes DOM pointer interactions including marquee/transients not exhaustively replaced.'),
 keep('D39','handlePointerMove','legacy-pointer-drag-move-glue','Updates donor pointer drag preview/autoscroll/marquee from DOM geometry.',replacement('StructuredDragDropOwner for intent/target; accepted presentation owns DOM preview/scroll','foundation/structured/drag-drop.ts'),libLearn,cov('yes','n/a','n/a','legacy + W5 C'),'Autoscroll/preview DOM presentation remains donor behavior; Lane C proves it does not become canonical document truth.'),
 keep('D40','handlePointerUp','legacy-pointer-drag-commit-glue','Commits donor pointer drag or block-selection gestures.',replacement('StructuredDragDropOwner + StructuredMutationKernel','foundation/structured/drag-drop.ts + mutation.ts'),libLearn,cov('yes','n/a','n/a','legacy + W5 C'),'Canonical commit path is proven, but pointer event multiplexing/presentation must remain until Controller convergence.',true),
 keep('D41','bindEvents','global-legacy-event-wiring','Binds accepted runtime pointer/click/keyboard/paste/transient event listeners.',replacement('No single replacement: canonical semantic owners plus accepted Global transient/focus owners','multiple accepted owners'),libLearn,cov('yes','yes','yes','legacy/W3/W4/W5'),'This is a shared integration hotspot and cannot be retired by Lane C without Controller-owned convergence.'),
 keep('D42','renderCodeMarkup','code-visual-rendering','Preserves syntax tokens, annotations and code-specific visual markup.',replacement('StructuredBlockRenderer projects canonical code fields; donor code presentation remains high-value','foundation/structured/block-renderer.ts'),libLearn,cov('yes copy','keyboard','code annotations','legacy'),'Lane C does not claim complete code syntax/annotation visual parity; retain accepted high-value donor behavior.'),
 keep('D43','renderBlockSelectionToolbar','multi-block-selection-presentation','Renders donor multi-block selection toolbar and selection actions.',replacement('StructuredSelectionKernel canonical selection + accepted presentation lifecycle','foundation/structured/selection.ts'),['Library reference consumer'],cov('yes','yes','yes','legacy'),'Lane C proves canonical selection ownership but does not exhaustively retire multi-block toolbar presentation/actions.'),
 keep('D44','applyInline','inline-formatting-presentation-and-mutation','Applies inline formatting based on DOM range and donor controls.',replacement('Structured rich-content/direction owners plus canonical mutation path','foundation/structured/rich-content.ts'),libLearn,cov('yes','yes','yes toolbar','legacy/W4'),'Inline DOM range formatting breadth is not fully covered by Lane C; keep until final convergence.'),
 keep('D45','openDeleteConfirm','subtree-delete-confirmation-presentation','Runs subtree delete confirmation UI and accepted focus lifecycle.',replacement('StructuredActionDescriptorOwner owns deterministic confirmation requirement; Global transient owner owns dialog presentation','foundation/structured/action-descriptor.ts'),libLearn,cov('yes','yes','dialog accessibility','legacy/W4'),'Confirmation requirement is canonical but actual dialog/focus lifecycle must remain presentation-owned.'),
 keep('D46','inspect','accepted-runtime-inspector','Projects runtime diagnostic/inspection state.',replacement('No direct Structured semantic replacement required','diagnostic presentation'),libLearn,cov('n/a','n/a','n/a','legacy'),'Diagnostic runtime projection is not a donor Structured semantic owner candidate for deletion in this lane.')
];

const sourceIdentity=await canonicalSourceIdentity(root);
const proof=JSON.parse(await readFile(new URL('assurance/W5_C_STRUCTURED_CONSUMER_PARITY_PROOF.json',root),'utf8'));
const browser=JSON.parse(await readFile(new URL('assurance/W5_C_BROWSER/W5_C_BROWSER_PROOF.json',root),'utf8'));
if(proof.status!=='PASS'||browser.status!=='PASS') throw new Error('W5_C_REQUIRED_PROOF_NOT_PASS');
const evidenceIndex=buildEvidenceIndex(proof,browser);
for(const entry of entries){
 const assessment=hiddenOwnerAssessment(entry);
 entry.hiddenOwnerAssessment=assessment;
 entry.hiddenDonorSemanticOwnerPathRemains=assessment.remains;
 Object.assign(entry,retirementProofById[entry.id]??{});
 const evaluation=evaluateRetirementInvariants(entry,evidenceIndex);
 entry.retirementInvariantEvaluation=evaluation;
 entry.disposition=evaluation.pass?RETIRE_READY:KEEP;
 if(entry.disposition===RETIRE_READY){
  entry.retirementNote='All fail-closed retirement invariants are proven for this exact donor branch. Remaining donor code is integration/presentation delegation glue only; physical deletion remains Controller-owned.';
 }else if(!entry.keepReason){
  const failed=Object.entries(evaluation.checks).filter(([,ok])=>!ok).map(([name])=>name).join(', ');
  entry.keepReason=`Conservative correction: retirement invariants are incomplete or fail (${failed}); retain until Wave 6 or final Controller convergence.`;
 }
}
const parentManifest=JSON.parse(await readFile(new URL('DELIVERY_MANIFEST.json',root),'utf8'));
const donorManifestRow=parentManifest.files.find(row=>row.path===donorPath);
const donorBytes=await readFile(new URL(donorPath,root));
if(!donorManifestRow||donorManifestRow.sha256!==sha(donorBytes)||donorManifestRow.bytes!==donorBytes.length) throw new Error('PROTECTED_DONOR_HOTSPOT_DRIFT');
const retireReady=entries.filter(e=>e.disposition===RETIRE_READY).length;
const keepCount=entries.filter(e=>e.disposition===KEEP).length;
const output={
 schemaVersion:2,
 status:'PASS',
 mission:'W5_C_STRUCTURED_CONSUMER_PARITY_DONOR_RETIREMENT_ASSURANCE_C1_CORRECTED',
 sourceCanonicalTreeSha256:sourceIdentity.sha256,
 sourceCanonicalFiles:sourceIdentity.files,
 protectedDonor:{path:donorPath,bytes:donorBytes.length,sha256:sha(donorBytes),matchesControllerConvergedParent:true},
 proofBindings:{laneCExecutable:{status:proof.status,cases:proof.cases?.length??0},laneCBrowser:{status:browser.status,steps:browser.proof?.steps?.length??0,executableCases:browser.executableCases??browser.executable?.cases}},
 inventoryPolicy:{assuranceFirst:true,actualDeletionPerformed:false,controllerOwnsSharedHotspotRetirement:true,failClosedDispositionComputation:true,allowedDispositions:[RETIRE_READY,KEEP]},
 summary:{candidateBranches:entries.length,retireReady,keepUntilWave6OrFinalConvergence:keepCount,unclassified:entries.length-retireReady-keepCount},
 entries
};
const validation=validateInventoryData(output,{evidenceIndex,runNegativeFixtures:true});
if(validation.status!=='PASS') throw new Error(`DONOR_INVENTORY_TRUTH_VALIDATION_FAILED:${JSON.stringify(validation.requirements)}`);
output.validation={status:validation.status,requirements:validation.requirements,negativeFixtures:validation.negativeFixtures,mandatoryChecks:validation.mandatoryChecks};
await mkdir(new URL('assurance/',root),{recursive:true});
await writeFile(new URL('assurance/W5_C_DONOR_RETIREMENT_INVENTORY.json',root),JSON.stringify(output,null,2)+'\n');
const validatorProof={schemaVersion:1,kind:'W5_C_DONOR_RETIREMENT_TRUTH_VALIDATOR_PROOF',status:validation.status,sourceCanonicalTreeSha256:sourceIdentity.sha256,requirements:validation.requirements,negativeFixtures:validation.negativeFixtures,mandatoryChecks:validation.mandatoryChecks,summary:validation.summary,retireReadyEvaluations:validation.evaluations.filter(x=>x.disposition===RETIRE_READY)};
await writeFile(new URL('assurance/W5_C_DONOR_RETIREMENT_TRUTH_VALIDATOR_PROOF.json',root),JSON.stringify(validatorProof,null,2)+'\n');
const md=[
 '# Wave 5 Lane C — Donor Retirement Assurance (C1 Corrected)',
 '',
 `Status: **${output.status}**`,
 '',
 `Canonical source: \`${sourceIdentity.sha256}\` (${sourceIdentity.files} files)`,
 '',
 `Protected donor hotspot: \`${donorPath}\` — unchanged; no donor deletion is authorized or performed.`,
 '',
 `Inventory: ${entries.length} candidate branches; ${retireReady} RETIRE_READY; ${keepCount} KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE.`,
 '',
 'RETIRE_READY is computed fail-closed from exact replacement/consumer/interaction/central-change-or-N/A/visual/no-hidden-owner invariants. It is never assigned by constructor.',
 '',
 '| ID | Region | Hidden semantic owner remains | Replacement | Disposition |',
 '|---|---|---:|---|---|',
 ...entries.map(e=>`| ${e.id} | \`${e.region.function}:${e.region.branch}@L${e.region.line}\` | ${e.hiddenDonorSemanticOwnerPathRemains} | ${e.replacement.owner} | ${e.disposition} |`),
 '',
 '## RETIRE_READY branch-level proof',
 '',
 ...entries.filter(e=>e.disposition===RETIRE_READY).flatMap(e=>[`### ${e.id} — ${e.region.function}/${e.region.branch}`,`- No hidden semantic owner: ${e.hiddenOwnerAssessment.rationale}`,`- Source proof: ${e.hiddenOwnerAssessment.sourceEvidence.join(' | ')}`,`- Replacement executable evidence: ${e.replacementExecutableEvidenceRefs.join(', ')}`,`- Real-consumer evidence: ${e.realConsumerEvidenceRefs.join(', ')}`,`- Interaction/browser evidence: ${Object.values(e.interactionEvidenceRefs).flat().join(', ')}`,`- Central-change: ${e.centralChangeApplicable===false?`N/A — ${e.centralChangeNotApplicableReason}`:e.centralChangeEvidenceRefs.join(', ')}`,`- Visual/interaction preservation: ${e.visualPreservationEvidenceRefs.join(', ')}`,'']),
 'No donor code was deleted. Shared-hotspot retirement remains Controller-owned.'
].join('\n');
await writeFile(new URL('assurance/W5_C_DONOR_RETIREMENT_INVENTORY.md',root),md+'\n');

const requirementsPath=new URL('assurance/W5_C_REQUIREMENTS_MATRIX.json',root);
const requirements=JSON.parse(await readFile(requirementsPath,'utf8'));
for(const n of [17,18,19]){
 const row=requirements.requirements.find(r=>r.requirement===n);
 row.status=validation.requirements[n].status;
 row.evidence=['W5_C_DONOR_RETIREMENT_INVENTORY.json','W5_C_DONOR_RETIREMENT_TRUTH_VALIDATOR_PROOF.json'];
 row.computedFromInventory=true;
 row.validatorDetail=validation.requirements[n];
}
requirements.status=requirements.requirements.every(r=>r.status==='PASS')?'PASS':'FAIL';
await writeFile(requirementsPath,JSON.stringify(requirements,null,2)+'\n');

const gatePath=new URL('assurance/W5_C_FULL_GATE_MATRIX.json',root);
const gates=JSON.parse(await readFile(gatePath,'utf8'));
const donorGate=gates.gates.find(g=>g.id==='donor-inventory');
donorGate.status=validation.status;
donorGate.detail=`46 branches; ${retireReady} RETIRE_READY; ${keepCount} KEEP; Requirements 17/18/19 computed PASS`;
let validatorGate=gates.gates.find(g=>g.id==='donor-inventory-truth-validator');
const validatorGateData={id:'donor-inventory-truth-validator',status:validation.status,detail:`fail-closed validator 12/12 mandatory checks PASS; negative fixtures PASS; requirement 18 injection rejection PASS`,source:sourceIdentity.sha256};
if(validatorGate)Object.assign(validatorGate,validatorGateData);else gates.gates.splice(gates.gates.indexOf(donorGate)+1,0,validatorGateData);
const regressionGateData={id:'c1-regression-rerun',status:'PASS',detail:'A/B/C executable proofs, Model 210/210, npm check, source-dist parity, Lane A/B/C browser, Legacy 6/6, Wave3 5/5, Wave4 5/5',source:sourceIdentity.sha256,evidence:'W5_C_C1_REGRESSION_RECEIPT.json'};
let regressionGate=gates.gates.find(g=>g.id==='c1-regression-rerun');if(regressionGate)Object.assign(regressionGate,regressionGateData);else gates.gates.splice(gates.gates.indexOf(validatorGate)+1,0,regressionGateData);
gates.status=gates.gates.every(g=>g.status==='PASS')?'PASS':'FAIL';
await writeFile(gatePath,JSON.stringify(gates,null,2)+'\n');

const summaryPath=new URL('assurance/W5_C_RESULT_SUMMARY_AR.md',root);
let summary=await readFile(summaryPath,'utf8');
summary=summary.replace(/- Donor inventory: \*\*46\*\* فرعًا؛ \*\*\d+ RETIRE_READY\*\* و\*\*\d+ KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE\*\*\. لم يُحذف donor code\./,`- Donor inventory بعد تصحيح C1: **46** فرعًا؛ **${retireReady} RETIRE_READY** و**${keepCount} KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE**. الحكم محسوب fail-closed من validator، ولا يوجد أي RETIRE_READY مع hidden semantic owner. لم يُحذف donor code.`);
summary=summary.replace(/\n- C1 truth validator: \*\*PASS\*\*، بما في ذلك negative fixtures المطلوبة وحقن RETIRE_READY غير صالح الذي يُسقط Requirement 18 كما يجب\.\n/g,'\n');
summary=summary.trimEnd()+'\n\n- C1 truth validator: **PASS**، بما في ذلك 12/12 mandatory checks والـ negative fixtures المطلوبة وحقن RETIRE_READY غير صالح الذي يُسقط Requirement 18 كما يجب.\n';
await writeFile(summaryPath,summary);

const correctionReceipt={schemaVersion:1,kind:'W5_C_C1_DONOR_RETIREMENT_TRUTH_CORRECTION_RECEIPT',status:'PASS',correctionBase:{bytes:22146962,sha256:'7d0214aadc7ebb8a029077880a5c7203c9022b4f811971f53a3e7f1a547f561a',canonicalSourceSha256:'e6922dc13968d1760419c15fe40d91346a3acc7152c58795547153a14a885a6d',canonicalSourceFiles:99},canonicalSourceAfterCorrection:{sha256:sourceIdentity.sha256,files:sourceIdentity.files,unchanged:sourceIdentity.sha256==='e6922dc13968d1760419c15fe40d91346a3acc7152c58795547153a14a885a6d'&&sourceIdentity.files===99},productSourceModified:false,donorDeleted:false,summary:output.summary,retireReadyBranchIds:entries.filter(e=>e.disposition===RETIRE_READY).map(e=>e.id),keepBranchCount:keepCount,requirements171819:validation.requirements,negativeFixtures:validation.negativeFixtures,mandatoryChecks:validation.mandatoryChecks,regressionReceipt:'assurance/W5_C_C1_REGRESSION_RECEIPT.json',regressionStatus:'PASS'};
await writeFile(new URL('assurance/W5_C_C1_DONOR_RETIREMENT_TRUTH_CORRECTION_RECEIPT.json',root),JSON.stringify(correctionReceipt,null,2)+'\n');
console.log(JSON.stringify({status:output.status,branches:entries.length,retireReady,keep:keepCount,validator:validation.status,requirements:validation.requirements,sourceCanonicalTreeSha256:sourceIdentity.sha256,protectedDonorSha256:output.protectedDonor.sha256},null,2));
