# VS-03 — Donor → Canonical Structured Mutation Disposition

Status: `CONTROLLER_REVIEW_READY_NOT_PROMOTED`

| Mutation mechanic | Library compatibility entry | Canonical VS-03 owner | Donor concern intentionally retained | Disposition |
|---|---|---|---|---|
| Insert at structural gap / replace empty | `insertBlock`, Toggle child/sibling insertion helpers | `StructuredMutationKernel` (`insert`, `replace`) | Palette, caret/focus, render, history | `DELEGATED_CANONICAL` |
| Duplicate subtree | `duplicateBlock` | `StructuredMutationKernel` (`duplicate`, explicit `allocateId`) | UI command route, focus, history | `DELEGATED_CANONICAL` |
| Delete subtree / multi-delete | `removeBlock`, `deleteMultiBlockSelectionNow` | `StructuredMutationKernel` (`remove`, `removeMany`) | Risk confirmation, selection UI, history | `DELEGATED_CANONICAL` |
| Sibling move / start / end | `moveSibling`, `moveSiblingToEdge` | `StructuredMutationKernel` | Menu/keyboard presentation, focus, history | `DELEGATED_CANONICAL` |
| Move-to-gap | `validateMoveTarget`, `moveBlockToGap` | `StructuredMutationKernel` | Pointer threshold, drag geometry/preview, focus, history | `DELEGATED_CANONICAL` |
| Indent / outdent | `indentBlock`, `outdentBlock`, availability wrappers | `StructuredMutationKernel` | key event capture, focus, history | `DELEGATED_CANONICAL` |
| Split / merge data | `splitBlockAtCaret`, `caretSplitInsert`, `structuralMergeBackward/Forward`, container split | `StructuredMutationKernel` | DOM caret extraction/placement, render, history | `DELEGATED_CANONICAL` |
| Convert / plain-text promotion | `requestConvert`, `commitConversion`, `convertToPlainText` | `StructuredMutationKernel` (`canConvert`, `convert`, `convertPlainText`) | loss-warning UI, focus, history | `DELEGATED_CANONICAL` |

## Explicit non-transfer

VS-03 does **not** own transaction/history/recovery, semantic command unification, selection, clipboard transport/policy, keyboard intent ownership, editor host rendering, caret geometry, focus lifecycle, drag geometry, Library KU navigation/search, or Notes. These remain later slices or legitimate compatibility/presentation concerns.

## Atomicity and duplicate-owner result

Invalid containment, duplicate identity, illegal depth and self-descendant move tests return rejection with caller input unchanged. The duplicate-mechanic scanner now has a `structured.mutation` rule plus a deliberate fake second-owner fixture, and the real adapter rejects an injected second mutation owner.
