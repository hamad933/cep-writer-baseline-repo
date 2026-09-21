# CEP CONTROLLER ADJUDICATION — W01/W02 C004 + LINKED STICKY NOTES DESTINATION OWNERS — v1.0

STATUS:
`CONTROLLER_ADJUDICATED / OWNER_ACCEPTANCE_NOT_INFERRED / PRODUCTION_MAPPING_CONTRACT_ACTIVE`

## A. C004 R&Q Claim Identity

ADJUDICATION_ID: `CTRL-ADJ-RQ-CLAIM-001`

Selected model:
`SOURCE_SCOPED_CLAIM_ROW_IDENTITY + CROSS_SOURCE claim_id EQUIVALENCE KEY`

Schema:
`UNIQUE(source_record_id, claim_id)`

Rationale:
R&Q must be able to compare different source variants associated with the same canonical/equivalence claim key. Global `claim_id` uniqueness makes that persisted state impossible.

Runtime gate:
`LARAVEL_POSTGRESQL_UNPROVEN`

## B. Linked Sticky Notes

ADJUDICATION_ID: `OWNER-ADJ-PROD-NOTES-001`

Destination form:
`NEW_SHARED_CORE_OWNER`

Exact planned shared state owner:
`resources/js/shared/LinkedStickyNoteCore.ts`

Owned state:
- `NoteWorkingState`
- `NoteContextBinding`
- `StickyNoteWindowState`

Working persistence:
local/browser working state only.

Durable server Notes persistence:
`AUTHORITY_GATED`

Existing shared semantic core:
`resources/js/shared/StructuredContentCore.ts :: StructuredDocument`

Existing single command owner:
`resources/js/shared/SemanticCommandCore.ts`
provided through:
`resources/js/workbench/context.ts`
from:
`resources/js/workbench/Workbench.vue`

Planned presentation/domain adapters:
- `resources/js/workbench/BlockContextMenu.vue`
- `resources/js/workbench/LibraryNotesLens.vue`
- `resources/js/workbench/StickyNoteHost.vue`
- `resources/js/workbench/StickyNoteEditorSurface.vue`
- `resources/js/workbench/StructuredEditor.vue`
- `resources/js/workbench/LibraryWorkspace.vue`

Commands:
- `note.new`
- `note.open`
- `note.close`
- `note.pin`
- `note.unpin`
- `note.move`
- `note.resize`
- `note.source.focus`
- `note.popout.map`

Forbidden collapses:
1. `WorkspaceMemoryCore.note` is NOT the Linked Sticky Note owner.
2. No second `StructuredContentCore` / UnifiedEditor semantic engine.
3. No second `SemanticCommandCore`.
4. No invented durable Notes schema/API.
5. No collapse into W04 formal Review/Evidence/Mastery.
6. No false OS always-on-top claim.

Platform:
- in-app pinning is Product-owned presentation behavior;
- browser/PWA popout mapping may be implemented only with same note-instance identity;
- OS cross-application always-on-top remains `PLATFORM_GATED`.

Traceability consequence:
the nine formerly unresolved rows now have exact planned destination ownership.
`ZERO_ORPHAN_PRODUCTION_TRACEABILITY_GATE = PASS` at the destination-ownership mapping layer.

This is not capability implementation proof.
