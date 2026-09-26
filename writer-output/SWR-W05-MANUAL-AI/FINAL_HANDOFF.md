# SWR-W05-MANUAL-AI — Final Writer Handoff

## Binding and source verification

- Capsule: `CAPSULE_V1_1.zip`
- Capsule SHA-256: `539decd505348ea8638cf646fb38f48db90340ed8fb4a8f73d197bdf0a3d2a4e`
- `verify_capsule.py`: `PASS`
- Mission: `SWR-W05-MANUAL-AI`
- Repository: `hamad933/cep-writer-baseline-repo`
- Product parent: `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- Product parent tree: `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Capsule transport commit/tree: `0fba5a39c3ebecf5da100eba2cc0a24fbd7c14dd` / `29e178b8af1290593dc0460e1b5c047d8e9ae93d`
- Candidate branch: `writer/surface-w05-manual-ai`
- Visual bootstrap: `PARTIAL__LOCAL_RECAPTURE_ALLOWED`
- Tracked source guard: `PASS`

## Product delta

Only authorized Manual-AI-local paths were changed.

1. `ManualAiDomainAdapter` now exposes explicit capability truth for export helper, import helper, DraftSink, in-memory history, provider-network calls, and background completion.
2. `manual_ai.export` is command-unavailable when no explicit export helper is admitted. It no longer produces a SemanticCommand receipt merely by falling through to `EXPORT_HELPER_UNAVAILABLE`.
3. `manual_ai.review` with `ACCEPT` is command-unavailable when no DraftSink is admitted; repeat `ACCEPT` after a created working draft remains idempotently available without a second draft creation.
4. Collection row actions derive enabled state from the same adapter availability contract instead of showing Review/Export as generically enabled.
5. Context/provider truth now says `IN_MEMORY_ONLY`, `appendOnlyDurableHistory=false`, `providerNetworkCalls=0`, `backgroundCompletion=false`, and preserves `canonicalPublication=false` semantics.
6. A dedicated restoration suite was added without editing the read-only S17 or legacy shared test files.

## Positive / negative / falsification results

- Manual-AI restoration suite: **8/8 PASS**.
- Read-only S17 W05 Validation/Manual-AI oracle: **12/12 PASS**.
- Legacy `manual-ai-tests.ts`: **8 PASS / 4 FAIL**, retained as a documented read-only contradiction. Those four legacy cases expect an undeclared import to create authority, while the governing S17 oracle requires unknown import to fail closed. No source-bound failing test was weakened to obtain green.
- Export-helper missing: unavailable, no export-success receipt.
- Provenance mismatch: `PROVENANCE_INVALID`, original declared request provenance retained, no draft creation.
- DraftSink missing: ACCEPT unavailable, no accepted-draft/persistence/background-completion claim.
- Admitted DraftSink: one working draft creation; repeat ACCEPT is idempotent; `canonicalPublication=false`.
- Provider/network/background truth: zero hidden provider execution, zero observed browser network requests, no polling/embeddings/background completion.

## Visual / interaction evidence

Evidence class: `FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE`.

- Chromium `144.0.7559.96`, Playwright `1.57.0`.
- Fresh captures at `1440x1000` and `1024x900`.
- Pointer selection, Arrow/Enter keyboard interaction, focus, disabled unavailable actions, responsive geometry, RTL document direction, and LTR technical-token isolation were exercised.
- Four inspected final PNGs were persisted to the Writer output Drive folder and read back successfully:
  - helper unavailable — `1iYrWCLPTHO9mOBo2MEhICXFra87gOp3T`
  - provenance invalid — `1YpO7Utth-rZN3XVuMwjETIe6nX4IwC27`
  - DraftSink unavailable — `1cl5LyelxhcXyHaNEL4H3O--31qU4LgOZ`
  - accepted as working draft — `1GiKSRCTerzIdUkweJ2U6TYzMJh2VX69h`
- Exact hashes and sizes are in `VISUAL_EVIDENCE_RECEIPT.json`.
- The visual reference SHA-256 matched the capsule binding: `ae1d8df7230c9719bb7a8026949c285dc8c9b11f3b050899b1ec2d9b02b9f526`.

## Truth ceilings / unresolved items

- `A16-PF-005` remains open by design: the default Product composition still has no admitted export helper or DraftSink. This candidate makes the unavailable states truthful; it does not fabricate those capabilities.
- `A16-PF-006` remains open by design: review/disposition history remains `IN_MEMORY_ONLY`; no append-only durable persistence is claimed.
- `CBF-003` remains a P0 shared-owner prerequisite. No per-Surface BOTTOM workaround was added; see `SHARED_OWNER_ESCALATION.md`.
- Genuine route/history/network/platform proof is not claimed by the navigation-independent browser evidence.
- No provider/API/polling/embedding integration was added.

## Governance stop

No main merge, release, deployment, self-acceptance, governance mutation, or shared-owner mutation was performed.

**STOP GATE:** `SURFACE_CANDIDATE_ONLY__CONTROLLER_DELTA_ADMISSION_REQUIRED`
