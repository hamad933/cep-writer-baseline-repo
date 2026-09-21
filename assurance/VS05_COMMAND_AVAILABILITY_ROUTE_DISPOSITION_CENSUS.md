# VS-05 — Command / Availability Route Disposition Census

Status: `PASS`  
Canonical source: `{SOURCE_SHA}`

| Route / symbol | Classification | Disposition |
|---|---|---|
| `commandAvailability` | `PRESENTATION_ONLY_PROJECTION_OF_CANONICAL_TRUTH` | Canonical VS-05 shared IDs delegate to extension/CommandRegistry -> StructuredCommandAvailabilityOwner; local decisions retained only for non-admitted presentation/domain/deferred cases. |
| `commandEnabled` | `PRESENTATION_ONLY_PROJECTION_OF_CANONICAL_TRUTH` | Thin enabled projection of commandAvailability; no separate semantic eligibility owner. |
| `Commands.execute` | `COMPATIBILITY_PRESENTATION_DISPATCHER` | Admitted main-document semantic IDs converge on extension.execute/CommandRegistry; UI-only/donor presentation actions remain local. |
| `Toolbar Undo/Redo` | `PRESENTATION_ONLY_PROJECTION_OF_CANONICAL_TRUTH` | disabled/code/reason derive from registry availability; execution uses canonical history.undo/history.redo. |
| `Block menu duplicate/move/indent/outdent/delete/format` | `PRESENTATION_ONLY_PROJECTION_OF_CANONICAL_TRUTH` | Menu enabled state comes from canonical command availability; execution converges on canonical command IDs. Delete confirmation remains presentation safety glue. |
| `Library command palette` | `PRESENTATION_ONLY_PROJECTION_OF_CANONICAL_TRUTH` | Canonical shared IDs replace donor aliases for admitted commands; disabled reason/code project canonical availability; UI-only items remain local. |
| `Save / Autosave` | `REMOVED_REPLACED_BY_CANONICAL_OWNER` | Both use document.commit through registry; VS-04 save-boundary truth remains semantic authority. |
| `Recovery restore-as-new` | `REMOVED_REPLACED_BY_CANONICAL_OWNER` | Uses document.recoverAsNew through registry; VS-04 recovery owner remains semantic authority. |
| `Keyboard mapping` | `EXPLICITLY_DEFERRED` | Mapping unchanged (VS-09); where existing mapping invokes admitted semantic commands, execution converges on canonical command route. |
| `selection multi-delete removeMany` | `EXPLICITLY_DEFERRED` | Selection-owned direct main mutation remains isolated for VS-06; not counted as VS-05 command ownership. |
| `clipboard cut/copy/paste mechanics` | `EXPLICITLY_DEFERRED` | VS-07 owns clipboard cutover/sanitization/transport; not migrated here. |
| `Note-window history/mutation commands` | `DOMAIN_SPECIFIC_LEGITIMATELY_RETAINED` | Explicitly outside VS-04 main-document ownership and outside VS-05 shared Structured main-document command convergence. |
| `Learn Workspace command palette` | `CANONICAL_CONSUMER` | commands.items(context) projects same availability; click executes CommandRegistry with same context. |

## Scope locks

- Selection ownership remains VS-06.
- Clipboard ownership remains VS-07.
- Keyboard mapping remains VS-09.
- Workspace transient lifecycle and renderer remain later slices.
- No Controller control or accepted-successor path is modified.
