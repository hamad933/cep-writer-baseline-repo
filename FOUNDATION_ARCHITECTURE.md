# CEP Foundation correction candidate v0.2.1

Status: `BOUNDED_FOUNDATION_CORRECTION_CANDIDATE / INDEPENDENT_REVIEW_REQUIRED / NOT_OWNER_ACCEPTED / STACK_NOT_FROZEN`.

Composition remains:

`Foundation → surface profile → family engine → thin domain adapter → surface composition`.

`WorkspaceFoundationHost@1.0.0` owns the donor-free shared host for Learn, Spatial and Operational consumers. `PaneLayoutController` keeps durable preferred pane state separate from responsive/focus effective state; `TransientFocusController` owns reversible global transient focus; `ContextInspectorPresentation` consumes domain/family fields only through `ContextDescriptorProvider`. Library alone retains the accepted donor host through the explicit compatibility deviation `DEV-LIBRARY-COMPAT-HOST-001`. `CommandRegistry`, `CapabilityRegistry` and `ActionSurfaceRegistry` reject duplicate semantic owners.

## Structured boundary

`StructuredDocumentDomainAdapter@1.0.0` exposes document identity, working and committed revisions, schema/capabilities, commit/save, family-local history, recovery, minimum note/source binding, metadata and command availability. Library binds the accepted `UnifiedEditorCore` through that boundary. Learn uses `StructuredSurfaceHost` with an independent fixture and does not import Library fixtures or require Library search, tree, KU state or persistence keys. The donor remains intact; this is bounded extraction, not a 330-function rewrite.

## Spatial and relation boundary

`SpatialView` owns pointer/camera/selection representation. `ActionAvailabilityCore@1.1.0` derives one result from selection count/types, endpoint compatibility, domain capability, canonical constraints, current mode, registered command availability and destructive policy. Connect appears for exactly two eligible endpoints unless a domain declares deterministic bulk semantics. `RelationInteraction` owns the compact action surface and composer at policy `RELATION-CENTRAL-04`. `RelationDomainAdapter@1.1.0` owns typed canonical records, duplicate constraints, validation, versioning, projection and undo/redo.

Visualize and W03 Enterprise instantiate the same central policy. Label double-click and edge Enter/F2 converge on `relation.edit`; whole-edge double-click is intentionally inert. Ctrl+RMB suppression is bound to the matching generated context event and clears on pointerup, pointercancel, visibility loss, window blur or timeout. Arrow focus, Shift+Arrow selection extension, Alt+Arrow camera movement and Ctrl/Meta+Arrow object movement are distinct.

## Operational boundary

`OperationalView` and `DomTerminalRendererAdapter` depend only on `RuntimeAdapter@1.0.0`. The provider supplies its descriptor, capabilities, prompt/help text, stable session lookup, parser/effect boundary and receipts. The shared presentation does not name or read `InternalSimulationAdapter` internals.

`InternalSimulationAdapter` is the sole active provider in scope. It maps supported input to semantic commands and delegates canonical device truth to `SimulatedDeviceEngine`. Spatial state, terminal output, telemetry and recorded projection derive from that truth. No external runtime, host shell or PTY is claimed.

## Authority and change control

The accepted Library HTML stays byte-identical. W03 v3.4 is classified only as `W03_V3_4_SAME_LINEAGE_VALUE_DOMAIN_REQUIREMENT_EVIDENCE_DONOR_NOT_AUTHORITY`; it supplies same-lineage value/domain/requirement evidence, never implementation, UI, design, interaction, layout, component or stack authority.

The 23 profiles and 1,403 inheritance classifications remain. The Controller-compiled W03 map supplies exactly 69 sections and 318 grouped atoms without creating atom-level feature tasks. Contract versions, mechanic ownership, duplicate fixtures and `tools/generate-writer-scaffold.mjs` make future composition inspectable. Breaking changes require affected consumers, migration, disposition and conformance proof.

Deferred governance is value-filtered: the active ledger contains only the ten Controller-admitted high-value items, while fifteen dropped, duplicate, superseded or historical items remain in a separate traceability-only register. The six-flow browser suite is a mandatory executable gate; the candidate finalizer refuses to emit the ZIP unless all six flows pass.
