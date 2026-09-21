# Wave 5 Lane C — Donor Retirement Assurance (C1 Corrected)

Status: **PASS**

Canonical source: `e6922dc13968d1760419c15fe40d91346a3acc7152c58795547153a14a885a6d` (99 files)

Protected donor hotspot: `stack/native-typescript/foundation/accepted-runtime.ts` — unchanged; no donor deletion is authorized or performed.

Inventory: 46 candidate branches; 1 RETIRE_READY; 45 KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE.

RETIRE_READY is computed fail-closed from exact replacement/consumer/interaction/central-change-or-N/A/visual/no-hidden-owner invariants. It is never assigned by constructor.

| ID | Region | Hidden semantic owner remains | Replacement | Disposition |
|---|---|---:|---|---|
| D01 | `newDocStore:canonical-shadow-store@L29` | true | StructuredDocumentDomainAdapter | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D02 | `applyStructuredProjection:structured-projection-sync@L79` | false | StructuredPresentationBridge | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D03 | `pushHistory:main-structured-transaction@L86` | true | StructuredTransactionHistoryRecoveryOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D04 | `pushHistory:note-local-history@L86` | true | Wave 6 final NoteBindingAdapter / note-window integration | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D05 | `undo:main-structured-history@L87` | false | StructuredTransactionHistoryRecoveryOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D06 | `undo:note-local-history@L87` | true | Wave 6 final note transaction binding | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D07 | `redo:main-structured-history@L88` | false | StructuredTransactionHistoryRecoveryOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D08 | `redo:note-local-history@L88` | true | Wave 6 final note transaction binding | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D09 | `captureBookmark:dom-selection-bookmark@L89` | false | StructuredSelectionKernel + accepted Global focus/transient owners | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D10 | `restoreBookmark:dom-selection-bookmark@L90` | false | StructuredSelectionKernel + accepted Global focus/transient owners | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D11 | `applyStructuredMutation:main-canonical-mutation@L125` | true | StructuredMutationKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D12 | `moveBlockToGap:main-drag-mutation@L134` | false | StructuredDragDropOwner + StructuredDropTargetPolicyOwner + StructuredMutationKernel | RETIRE_READY |
| D13 | `validateMoveTarget:main-target-validation@L133` | true | StructuredDropTargetPolicyOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D14 | `canonicalStructuredCommand:command-normalization@L153` | true | SemanticCommandBus + StructuredCommandAvailabilityOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D15 | `structuredCommandContext:command-context@L154` | true | StructuredSurfaceHost command routing + StructuredCommandAvailabilityOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D16 | `commandAvailability:main-command-availability@L155` | false | StructuredCommandAvailabilityOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D17 | `setMode:structured-read-edit-semantic@L180` | true | StructuredSurfaceHost | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D18 | `renderSurface:legacy-dom-composition@L187` | false | StructuredBlockRenderer + StructuredPresentationBridge | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D19 | `renderBlockArray:legacy-recursive-dom-render@L188` | false | StructuredBlockRenderer | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D20 | `renderBlock:legacy-block-dom-render@L191` | false | StructuredBlockRenderer + StructuredPresentationBridge | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D21 | `commitEditable:main-content-commit-semantic@L206` | true | StructuredSurfaceHost.updateContent + StructuredTransactionHistoryRecoveryOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D22 | `selectBlock:main-selection-semantic@L210` | true | StructuredSelectionKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D23 | `deriveGapTarget:dom-gap-hit-testing@L215` | true | StructuredDropTargetPolicyOwner consumes canonical target; DOM geometry remains presentation-owned | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D24 | `insertBlock:legacy-insertion-ui-and-mutation@L218` | true | StructuredActionDescriptorOwner + StructuredMutationKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D25 | `duplicateBlock:legacy-duplicate-action@L222` | true | StructuredActionDescriptorOwner + StructuredMutationKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D26 | `removeBlock:legacy-delete-action@L224` | true | StructuredActionDescriptorOwner + StructuredMutationKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D27 | `copyPlainBlock:legacy-clipboard-copy@L245` | true | StructuredClipboardTrustOwner | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D28 | `cutBlock:legacy-clipboard-cut@L248` | true | StructuredClipboardTrustOwner + StructuredMutationKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D29 | `setBlockProp:main-direction-format-semantic@L259` | false | InputDirectionResolver + StructuredCommandAvailabilityOwner + StructuredMutationKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D30 | `openInsertion:insertion-transient-ui@L276` | false | StructuredActionDescriptorOwner for descriptors; accepted Global transient/focus owners for presentation | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D31 | `openBlockMenu:context-menu-transient-ui@L281` | false | StructuredActionDescriptorOwner + accepted Global transient/focus owners | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D32 | `renderStructure:legacy-structure-tree-presentation@L335` | false | StructuredNavigationDescriptorOwner for descriptor truth; accepted Global presentation lifecycle for focus/scroll | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D33 | `switchKU:library-route-navigation@L342` | true | StructuredNavigationDescriptorOwner is read-navigation descriptor only; route ownership remains outside Lane C | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D34 | `inspectReadBlock:read-inspection-descriptor-semantic@L354` | true | StructuredNavigationDescriptorOwner.readInspection | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D35 | `renderQuickJump:quick-jump-presentation@L450` | false | StructuredNavigationDescriptorOwner.quickJump descriptor + accepted Global transient/focus owners | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D36 | `syncQuickJumpControl:quick-jump-control-presentation@L451` | false | StructuredNavigationDescriptorOwner descriptor + accepted presentation lifecycle | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D37 | `handleEditableKey:legacy-key-event-glue@L558` | true | StructuredInputKeymapOwner + GlobalInputKeymapOwner + SemanticCommandBus | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D38 | `handlePointerDown:legacy-pointer-drag-start-glue@L583` | true | StructuredDragDropOwner + StructuredSelectionKernel; Global transient presentation retained | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D39 | `handlePointerMove:legacy-pointer-drag-move-glue@L585` | true | StructuredDragDropOwner for intent/target; accepted presentation owns DOM preview/scroll | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D40 | `handlePointerUp:legacy-pointer-drag-commit-glue@L587` | true | StructuredDragDropOwner + StructuredMutationKernel | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D41 | `bindEvents:global-legacy-event-wiring@L600` | false | No single replacement: canonical semantic owners plus accepted Global transient/focus owners | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D42 | `renderCodeMarkup:code-visual-rendering@L71` | false | StructuredBlockRenderer projects canonical code fields; donor code presentation remains high-value | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D43 | `renderBlockSelectionToolbar:multi-block-selection-presentation@L296` | false | StructuredSelectionKernel canonical selection + accepted presentation lifecycle | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D44 | `applyInline:inline-formatting-presentation-and-mutation@L330` | true | Structured rich-content/direction owners plus canonical mutation path | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D45 | `openDeleteConfirm:subtree-delete-confirmation-presentation@L256` | false | StructuredActionDescriptorOwner owns deterministic confirmation requirement; Global transient owner owns dialog presentation | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |
| D46 | `inspect:accepted-runtime-inspector@L671` | false | No direct Structured semantic replacement required | KEEP_UNTIL_WAVE6_OR_FINAL_CONVERGENCE |

## RETIRE_READY branch-level proof

### D12 — moveBlockToGap/main-drag-mutation
- No hidden semantic owner: The main drag branch delegates canonical move semantics to extension.execute(block.moveToGap); after success it only renders/focuses.
- Source proof: moveBlockToGap(main) invokes extension.execute('block.moveToGap', ...) and performs no direct st.blocks write on the main branch. | The only post-success donor operations on the main branch are renderSurface and focusBlock presentation glue.
- Replacement executable evidence: w5c.drag-keyboard-shared-target-policy-all-three, w5c.drag-pointer-shared-target-policy-all-three
- Real-consumer evidence: w5c.drag-keyboard-shared-target-policy-all-three, w5c.drag-pointer-shared-target-policy-all-three
- Interaction/browser evidence: browser.pointer-keyboard-drag-same-policy, browser.pointer-keyboard-drag-same-policy, browser.pointer-keyboard-drag-same-policy
- Central-change: N/A — Requirement 14 central renderer/presentation-policy mutation does not govern drag target/mutation semantics; exact drag owner replacement is proven by the bound executable/browser drag cases.
- Visual/interaction preservation: browser.pointer-keyboard-drag-same-policy

No donor code was deleted. Shared-hotspot retirement remains Controller-owned.
