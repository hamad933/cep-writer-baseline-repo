# B3-R Correction03 Candidate Handoff

Mission: `CORR02_B3R_CORRECTION03_CANVAS_REPRESENTATION_AND_TREE_TRUTH`
Mode: `MUTATING_CANDIDATE_ONLY / SERIALIZED / LOCAL_FIRST`
Exact legal parent: `f21212b18f3b54a07b43516b50149219c0b15533`
Parent tree: `eb2f74f0ba619144933b5f828777e4bb3ece108e`
Parent Product source: `a964f65b7849b9440101f83b4af48e92dc5b1c5a37142c4fcc37c428874c6295 / 273 files`

## Bounded product correction

### F-047 — Canvas governed representation lifecycle

- Preserves the one existing `SpatialInteractionKernel`; no second Spatial engine, history owner, relation owner, pane owner, focus owner, canonical store, or persistence subsystem is introduced.
- Representation identity remains distinct from canonical object identity.
- Multiple Canvas representations may point to the same canonical object while retaining independent representation IDs and Canvas-local coordinates.
- Selection exposes an explicit selected set plus primary/focus/anchor truth.
- Duplicate creates a new Canvas representation only; it never creates a canonical object.
- Remove-from-Canvas removes only the selected representation and Canvas-local presentation links; canonical objects and sibling representations survive.
- Canvas-only links are presentation state (`canonical:false`, `presentationOnly:true`) and never mutate canonical relationships.
- Move / duplicate / Canvas-only link / remove use the existing Spatial presentation checkpoint/undo/redo history.
- RIGHT context is representation-aware and exposes canonical object ID, representation ID, Canvas-local coordinates, selection truth and representation actions with explicit non-canonical presentation-state copy.
- Pointer, keyboard and context-menu routes converge on the same semantic command registrations.
- Focus fallback after remove and focus restoration through undo/redo are deterministic.
- Provider ceiling remains exactly `LOCAL_ACCEPTANCE_PROJECTION_ONLY / canonical:false / READ_ONLY`.

### F-048 — Tree hierarchy truth

- The bound Visualize provider exposes objects/relations but no admitted canonical hierarchy/containment projection.
- `BALANCED6_STRUCTURE_TREE` is not promoted from the Library fixture into Visualize because no authority admits it as Visualize canonical containment.
- Tree therefore renders `VISUALIZE_HIERARCHY_UNAVAILABLE_NOT_OBSERVED` with explicit source/reason truth.
- Source-family grouping remains available only as an auxiliary, explicitly non-hierarchy navigation aid.
- Canonical containment mutation remains `AUTHORITY_GATED`.

## Regression state before final candidate binding

- `npm test`: `210/210 PASS`.
- `npm run build:runtime`: `PASS` (`258` generated modules).
- `npm run runtime:check`: `PASS` on Node `v22.16.0`.
- `npm run test:balanced6`: `32/32 PASS`.
- Prior B3-R focused falsification: `18/18 PASS`.
- Correction03 focused falsification: `30/30 PASS`.
- Duplicate-owner scan: `PASS`.
- `npm run check`: non-green only on inherited browser/evidence rows (`browser.lineage_receipt_truthful`, `browser.current_candidate_claim_truthful`, `browser.targeted_visual_evidence`); Product/model/authority rows pass.
- `npm run browser:test`: `ENVIRONMENT` blocked before browser flow because the Node `playwright` package is absent. Dependencies are not mutated for this correction.

The exact final candidate HEAD/tree/Product-source identity is bound after the candidate commit in the external final custody manifest and final handoff, avoiding a false self-referential commit claim in this tracked file.

Stop gate: `B3R_CANDIDATE_ONLY__CONTROLLER_AUDIT_REQUIRED`
