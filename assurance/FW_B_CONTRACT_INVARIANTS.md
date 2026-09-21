# FW-B Structured Selection Kernel — Contract and invariants

Mission: `FW-B-STRUCTURED-SELECTION-KERNEL`  
Parent: `CEP-FR-E06-VS05-c2fd8cc9`  
Owner lock: `LOCK-S-SELECT`

## Canonical ownership

- Canonical owner: `StructuredSelectionKernel`.
- Compatibility name `StructuredSelectionModel` is constructor-only and inherits the kernel; it owns no selection behavior.
- `StructuredDocumentDomainAdapter` creates one kernel instance per real Structured consumer.
- Library projects selection through the adapter. Learn boots through `DONOR_FREE_WORKSPACE_HOST` and exposes the same owner/contract through its real adapter.
- `StructuredSelectionDOMBridge` is explicitly `PROJECTION_ONLY`; DOM nodes and `Range` objects are not canonical selection state.

## Identity and traversal

- Block selection identity is block ID based.
- Canonical order is `StructuredTreeKernel.walk(...)` preorder, not click order and not `doc.blocks` root order only.
- Duplicate IDs are removed deterministically.
- Range endpoints are inclusive in the shipped policy.
- Anchor and focus are explicit and deterministic across nested content.
- Collapsed toggle descendants remain addressable because visual disclosure state does not redefine canonical tree order.

## Ancestor/subtree normalization

Policy: `ancestor-dominates-descendants-with-explicit-coverage`.

When an ancestor and one or more descendants are selected, the ancestor is the canonical selected root and descendants are represented in `coveredBlockIds`. This prevents double-counting while preserving subtree coverage for presentation/action projection.

## Inline selection

Canonical inline selection stores only:

- `blockId`;
- logical `anchorOffset` and `focusOffset`;
- normalized `start` and `end`;
- direction.

DOM selection is converted by `StructuredSelectionDOMBridge`; restoration uses the bridge to project the logical descriptor back to the current DOM. DOM identity is never stored in the kernel.

## Transactions and stale identity

- Selection actions do not add history frames, change working revision, dirty the document, or mutate document bytes.
- Transaction projection calls `selection.reconcile(...)`.
- Removed/stale block IDs are pruned deterministically and recorded in selection receipts.
- Selection bookmarks can be projected after Undo/Redo/recovery; stale bookmarks are cleared/repaired rather than pointing to nonexistent blocks.

## Bounded non-ownership

This candidate does **not** implement or take ownership of:

- Clipboard transport, payload schema, copy/cut/paste policy, or OS clipboard side effects;
- Structured keyboard/keymap semantics;
- Structured renderer redesign, drag/drop, insertion menus, or Surface composition;
- Spatial selection;
- Tree, Mutation, Transaction/History/Recovery, or Command Availability policy.

The full/targeted regression suite verifies those adjacent behaviors only as preservation gates.
