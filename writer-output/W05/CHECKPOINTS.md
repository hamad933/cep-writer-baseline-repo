# W05 CHECKPOINTS — A … E

Workspace: **W05** (Health · Processing · Validation · Manual AI / AI Bridge · Backup/Restore · Audit · Releases · Configuration)
Branch: `writer/mi-serial` · Packet: `controller/09_writer_forge/W05_writer_packet.md` · Requirements: `controller/09_writer_forge/W05_REQUIREMENTS.csv` (2,827 rows)
Writer-phase record format per `controller/12_execution/01_writer_checkpoint_contract.md` §1. Append-only.

**Candidate identity (declared):** `WORKTREE_VARIANT:c82cec63cb5f` · tree `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` / 287 files
**Candidate identity (measured at W05 browser capture):** `WORKTREE_VARIANT:90240a5e9f5b5eae74d8843a3ab074762fea4aad058aa19b6ffd37577161805a` / 287 files
**Drift note:** sibling writers committed to `writer/mi-serial` concurrently during W05 execution (`3763d13` → `61ee12d` → `891c1e5` → `81a2732` → `1854d41` → `f9d5a4d` → `d4b9e15`). Both identities are recorded; the drift is **not** suppressed and the declared `c82cec63…` hash is **never** re-labeled as the measured one.

---

## W05-A — workspace baseline verified

| Field | Content |
|---|---|
| `checkpoint_id` | `W05-A` |
| `branch` | `writer/mi-serial` |
| `commit` | `d3ddc5e` (dispatch HEAD at W05 launch) |
| `candidate` | `WORKTREE_VARIANT c82cec63…/287` |
| `changed_files` | none (baseline measurement only) |
| `tests` | Direct re-measure of every W05-owned failing artifact, one command at a time, before any edit:<br>• `node dist/tests/surfaces/manual_ai/manual-ai-tests.js` → **FAIL** `pass=8 fail=4` (`manual-import-preserves-provenance`, `invalid-provenance-is-quarantined`, `accept-invalid-fails-closed`, `accept-creates-working-draft-only`)<br>• `node dist/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.js` → **FAIL** `pass=15 fail=2` (`exact-pair-is-pinned-through-AnalyticalCompareOwner`: assertion failed; `latest-alias-cannot-replace-exact-pair`: `Cannot read properties of undefined (reading 'commitSHA')`)<br>• `node dist/w4-e-settings-center-tests.js` → exit 0 **but produced no output**: the file only *exported* `runW4ESettingsCenterTests()` and never invoked it — **vacuous PASS**<br>• `node tools/w05-processing-capability-proof.mjs` → **FAIL** `RETRY_IDEMPOTENCY_KEY_REQUIRED` (`TypeError: Cannot read properties of undefined (reading 'currentAttemptId')`)<br>• `node tools/w05-runtime-http-integration.mjs` → **hang** then **FAIL** at `HTTP-N01` (asserted `403 CAPABILITY_NOT_EXPOSED`, runtime truthfully returns `404 NOT_FOUND`)<br>• `node tools/balanced6-acceptance-tests.mjs` → **PASS 32/32** but **no CBF-001 assertion existed**<br>• **CBF-001 probe (new, throwaway)**: seed 6 documents → `StructuredTreeKernel.validate` → **6/6 INVALID** with `UNSUPPORTED_BLOCK_TYPE: section` + `INVALID_CHILD_CONTAINMENT`<br>• `node dist/tests/rescue/{S16,S17,S18}/**`, `CG6_W05_COVERAGE/*`, `post-c03/D11/*`, `post-c03/LCORR01/*`, `PC1_*/**`, `tools/w05-{health,backup}-capability-proof.mjs` → **PASS**<br>• `npm test` → **210 / 0** |
| `evidence` | this section; raw stdout captured in the session transcript |
| `requirements` | 0 / 2,827 dispositioned at A (catalog not yet authored) |
| `remaining_work` | close the 4 manual-ai + 2 S19 failures; make `w4-e-settings-center-tests` executable; repair 2 stale W05 proofs; close CBF-001 and MFC-PF-003; author the catalog; browser flows; handoff |
| `known_risks` | `npm run check` baseline = exit 1 with 2 pre-existing `browser.*` failures (not W05's); shared `runtime-causal-consequence` flow is pre-classified **HARNESS probe bug** in `tools/browser-conformance.mjs` (not W05-owned) |

---

## W05-B — implementation stable, build regenerated

| Field | Content |
|---|---|
| `checkpoint_id` | `W05-B` |
| `branch` | `writer/mi-serial` |
| `commit` | `d4b9e15` (HEAD after B) |
| `candidate` | `WORKTREE_VARIANT c82cec63…/287` declared; measured `90240a5e…/287` |
| `changed_files` | see "W05-owned file inventory" below; provenance flags: `W05_NEW` (2 tools, writer-output/W05), `W05_MODIFIED` (8 files), `GENERATED_DIST` (build output), `EVIDENCE` (writer-output/W05), `PRE_EXISTING_PROTECTED` (the 3 canonical deltas were never touched) |
| `tests` | `tools/writer-serial.sh node tools/build-runtime.mjs` → **PASS** `written 272, removedStale 0`<br>`node dist/tests/surfaces/manual_ai/manual-ai-tests.js` → **PASS 12/12**<br>`node dist/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.js` → **PASS 17/17**<br>`node dist/w4-e-settings-center-tests.js` → **PASS 36/36** (now actually executes)<br>`node tools/w05-processing-capability-proof.mjs` → **PASS 13/13**<br>`node tools/w05-runtime-http-integration.mjs` → **PASS 16/16**<br>`node tools/balanced6-acceptance-tests.mjs` → **PASS 35/35** incl. 3 new CBF-001 checks<br>`node tools/w05-stack-admission-proof.mjs` → **PASS 5/5**<br>`tools/writer-serial.sh npm test` → **210 / 0**<br>cross-workspace sweep `dist/tests/**/*.js` (63 files) → **4 failures, none W05-owned** (see handoff) |
| `evidence` | `writer-output/W05/PROOF_RESULTS.json` (24 measured proofs, all PASS) |
| `requirements` | 0 / 2,827 at B (catalog authored at C) |
| `remaining_work` | requirement coverage, browser receipt, handoff |
| `known_risks` | sibling writers editing `adapters/learn.ts`, `adapters/visualize/domain.ts`, `surfaces/{library,today}/**`, `foundation/global/shell/navigation.ts` concurrently; W05 did not touch them |

### B — closure of the two packet findings

**CBF-001 (P0) — CLOSED.**
Root cause: `stack/local-runtime/persistence/acceptance-seed/balanced6/seed.mjs` seeded a `type:'section'` block, which is not one of the 10 `STRUCTURED_BLOCK_TYPES`; the child `code` block was therefore also an `INVALID_CHILD_CONTAINMENT`. Measured before: **6 of 6** seeded documents rejected by `StructuredTreeKernel.validate`.
Fix (single-owner persistence kernel): seed now emits a kernel-valid `type:'toggle'` container (`title`, `open:true`) owning the `code` block — the closest structural equivalent of the original "section" and already exercised by the canonical Library fixture.
Proof (in `tools/balanced6-acceptance-tests.mjs`, now part of proof `P-BALANCED6`):
- `cbf-001.seed-blocks-satisfy-structured-tree-kernel` → **PASS**, `documents=6 owner=StructuredTreeKernel validated=ALL_SIX`
- `cbf-001.no-unsupported-section-block-type` → **PASS**, `seededBlockTypes=['code','toggle']`
- `cbf-001.db-state-hash-bound` → **PASS**, `stateHash=9f09cb6ffe60c542c5a303dca747d7e9bf069e4de61611064240a3e7353fde0e` plus per-document `revisionId` + `contentSha256` (DB state hashes bound in evidence, stable across re-seed)

**MFC-PF-003 (SC-011) — RESOLVED.**
Exposure verified through `settings.transfer` → `ScopedPreferencesOwner` by three independent proofs:
- `P-W4E` (`dist/w4-e-settings-center-tests.js`, **36/36**) — 5 new SC-011 tests: exactly one `settings.transfer` action home with `sourceOwner=SettingsCenterOwner`, `groupId=settings`, all three action ids in order, every item `delegatesTo=ScopedPreferencesOwner`, search reaches the home; export/import/reset receipts all carry `valueOwner/persistenceOwner=ScopedPreferencesOwner` with `durablePersistenceClaim=false` on export; rejected imports are atomic; rendered Settings exposes all three actions; **import does not clobber unscoped (session) state**.
- `P-SC011` (`tests/post-c03/D03A`, not W05-owned) → PASS, confirms the same exposure end-to-end.
- `P-BROWSER` flow `configuration.sc011-transfer` → PASS, DOM-verified `data-settings-action="settings.preferences.{export,import,reset}"` and `data-settings-section="settings.transfer"` in the live app.
Product delta: `foundation/global/preferences/store.ts#import` now preserves the context-free `session` scope that `export()` structurally excludes, so a transfer payload cannot clobber state it does not carry (packet §11 negative). Semantics of carried scopes unchanged (still replaces them), verified against D03A's `import replaces overrides` expectation.

### B — other repairs (all W05-owned)

1. `tests/surfaces/manual_ai/manual-ai-tests.ts` — 4 fixtures rebuilt onto the **declared** `prepare → export → import` flow. Assertions unchanged (`obtainedBy==='MANUAL_IMPORT'`, quarantine state, fail-closed review, `ACCEPTED_AS_DRAFT` + `canonicalPublication===false`). Rationale: the old fixtures imported a never-declared proposal, which contradicts the binding, currently-passing law `S17 manual-ai.unknown-import-cannot-create-authority` (`DECLARED_REQUEST_NOT_FOUND`, `a.rows().length===0`) and the product's own `manual_ai.import` availability text ("Exported request required for provenance equality").
2. `tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.ts` — 2 fixtures now inject `AnalyticalCompareOwner`. Rationale: `post-c03/LCORR01` test `A17-PF-006.releases-does-not-create-local-compare-owner` (**PASS 29/0**, not W05-owned) requires `new ReleasesDomainAdapter().compareOwner === null`; a local owner cannot be synthesised, so the fixture must supply the controller-injected owner. S19 additionally asserts the no-local-owner law so the reason stays on the record.
3. `w4-e-settings-center-tests.ts` — added the `if(import.meta.url===…)` main block (it previously never ran) and corrected the contract-scope expectation to `GLOBAL_PRESENTATION_DISCLOSURE_SEARCH_INTERACTION_ONLY`, the value already adjudicated as parent-equal in `writer-output/D03A/D03A_FINDING_CLOSURE_MATRIX.csv`.
4. `tools/w05-processing-capability-proof.mjs` — now supplies the explicit durable retry idempotency key (`retry:<jobId>:<attemptId>`) and adds 2 new negatives: `RETRY_IDEMPOTENCY_KEY_REQUIRED` when absent, and idempotent replay must not fabricate a second attempt.
5. `tools/w05-runtime-http-integration.mjs` — `HTTP-N01` now asserts the truthful current runtime answer (`404 NOT_FOUND`, route not fabricated), matching `tools/psc-runtime-falsification.mjs`; the child runtime is now always reaped so the tool cannot hang on failure.

---

## W05-C — requirement coverage verified

| Field | Content |
|---|---|
| `checkpoint_id` | `W05-C` |
| `branch` | `writer/mi-serial` |
| `commit` | `f9d5a4d25163842db04e8e5bc7ec78132f88cc5f` (bound by the matrix run) |
| `candidate` | `WORKTREE_VARIANT:c82cec63cb5f` / tree `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` (per dispatch instruction) |
| `changed_files` | `writer-output/W05/PROOF_CATALOG.json` (`W05_NEW`), `writer-output/W05/PROOF_RESULTS.json` (`EVIDENCE`), `writer-output/W05/ACCEPTANCE_MATRIX.csv` (`EVIDENCE`), `writer-output/W05/ACCEPTANCE_SUMMARY.json` (`EVIDENCE`), `tools/w05-stack-admission-proof.mjs` (`W05_NEW`) |
| `tests` | `python3 tools/writer-acceptance-matrix.py --workspace W05 --run-proofs --candidate "WORKTREE_VARIANT:c82cec63cb5f" --commit "$(git rev-parse HEAD)" --tree "c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f"` → **exit 0**<br>**24 / 24 proofs measured PASS** (P-MODEL, P-PSC, P-BALANCED6, P-STACK, P-PC1, P-PC1-SEAM, P-D11, P-BROWSER, P-S16, P-HEALTH-CAP, P-HTTP, P-CG6, P-PROC-CAP, P-S17, P-MANUALAI-SURFACE, P-CG6-TRUTH, P-S18-DOMAIN, P-S18-BOUNDARY, P-BACKUP-CAP, P-S19, P-RELEASES-SURFACE, P-CONFIGURATION-SURFACE, P-W4E, P-SC011) |
| `evidence` | `writer-output/W05/PROOF_RESULTS.json` sha256 `be022a0dabd992d4…`; `PROOF_CATALOG.json` `b66c03577e06b8f2…`; `ACCEPTANCE_MATRIX.csv` `eaa4fd6fe4759cdf…` |
| `requirements` | **2,827 / 2,827 dispositioned · `zero_loss: true` · matrix sha256 `eaa4fd6fe4759cdf…`** — PASS **2,487** · BLOCKED **324** · NOT_APPLICABLE_WITH_PROOF **16** · FAIL **0** |
| `remaining_work` | none for coverage |
| `known_risks` | catalog is a strict disjoint/total partition (verified offline: 0 unmatched, 0 multi before the tool ran) |

Partition (15 rules): 8 surface rules (2,487 PASS) · `C03-GATE-021` Owner-device Windows native target (216 BLOCKED) · `ZL01_FORWARD_GAP` no mission material (106 BLOCKED) · `Q-6` Manual-AI provenance mechanism (2 BLOCKED) · `MANAGED_RUNNER_ENVIRONMENT_IDENTITY` (8 PASS, runner type **automated**) · `PACKAGE_AND_LOCKFILE_DIFF_SCAN` (8 PASS, runner type **automated**) · `VISUAL_REFERENCE` (8 N/A) · `AUTHORITY_RECOVERY_ARCHAEOLOGY` (8 N/A).

---

## W05-D — browser / evidence verification

| Field | Content |
|---|---|
| `checkpoint_id` | `W05-D` |
| `branch` | `writer/mi-serial` |
| `commit` | `d4b9e151801b66d8c50511306532dec3482ae553` · `HEAD^{tree}` `1fc29a81ff17fde696ab1a1ef72c33ba61cc4141` |
| `candidate` | declared `WORKTREE_VARIANT c82cec63…/287`; measured at capture `WORKTREE_VARIANT 90240a5e…/287` (lineage status `DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS`) |
| `changed_files` | `writer-output/W05/BROWSER_RECEIPT.json` (`EVIDENCE`), `writer-output/W05/evidence/*.png` (`EVIDENCE`, 64 indexed artifacts), `tools/w05-browser-flows.mjs` (`W05_NEW`), `assurance/BROWSER_CONFORMANCE_RECEIPT.json` + `assurance/browser-workspace-pane-context.png` (`GENERATED_DIST`, shared rebind under `tools/writer-serial.sh`) |
| `tests` | `node tools/w05-browser-flows.mjs` → **exit 0 · 8 flows · 8 PASS / 0 FAIL**<br>`tools/writer-serial.sh npm run browser:test` → exit 1 · shared 6 flows **1 PASS / 5 FAIL** (receipt **rebound** to live tree `90240a5e…/287`, `currentUse=EXACT_CURRENT_CANONICAL_SOURCE_EXECUTION_RECEIPT`)<br>`tools/writer-serial.sh npm run check` → exit 1 · **exactly 2 `browser.*` failures**, identical to baseline; `check-duplicate-mechanics.mjs` standalone **exit 0 / status PASS** (the 11 `structured.*`/`library.*` FAIL entries are its own *expected* negative probes) |
| `evidence` | `writer-output/W05/BROWSER_RECEIPT.json` sha256 `9076a0b0b985e775…`; screenshots `writer-output/W05/evidence/<flow>-<YYYYMMDDTHHMMSSZ>-<candidate8>.png`, every one hash-indexed in `evidenceArtifacts` (0 orphans) |
| `requirements` | unchanged from C (2,827 / 2,827, zero_loss true) — the browser proof is one of the 24 measured proofs |
| `remaining_work` | none for W05-owned browser evidence |
| `known_risks` | see "Windows proof cluster" and "shared browser suite" below |

### W05 browser flows (browser_contract §1 fields present on every record)

| flow | status | classification | assertions |
|---|---|---|---|
| `health.refresh-inspect-diagnose` | PASS | — | 13 |
| `processing.inspect-retry-requestCancel-validationHandoff` | PASS | — | 12 |
| `validation.flow` | PASS | — | 6 |
| `manual-ai.bridge-truthful-ceilings` | PASS | — | 11 |
| `backup.restore-round-trip` | PASS | — | 16 |
| `audit.trail-recording` | PASS | — | 13 |
| `releases.view` | PASS | — | 11 |
| `configuration.sc011-transfer` | PASS | — | 17 |

No flow was labelled "Product bug" or "browser issue"; `failureClassification` is `null` on all eight because none failed.

### Backup → restore round-trip evidence (real consumer, exact restorability)

Flow `backup.restore-round-trip` against `stack/local-runtime/server.mjs` + a throwaway sqlite database:
document bootstrapped → `backup.package` (`PACKAGE_VERIFIED`, `manifestSha256` + `snapshotSha256` recorded) → `plan` (`restoreWritesPerformed=false`) → `preview` (`restoreWritesPerformed=false`) → `stage` (`productionDatabaseMutated=false`) → `drill` (`status=STAGED_AND_VERIFIED`, `liveRestored=false`, **`drill.packageId === flow packageId`**, **`drill.snapshotSha256 === flow snapshotSha256`**) → `activationRequest` (`AUTHORITY_PENDING`, `productionDatabaseMutated=false`).
Truth ceilings asserted: `stagedVerifiedIsLiveRestored=false`. Node-level corroboration: `P-BACKUP-CAP` (exit 0), `P-HTTP` `HTTP-02/03/04/15`, `P-PC1` `backup.stage-drill-activation-never-live-restore` PASS.

### Persistence evidence (DB state hashes bound)

`P-BALANCED6` → `cbf-001.db-state-hash-bound` returns `stateHash` (sha256 of `committedTruthFingerprint()`) plus per-document `revisionId`/`contentSha256`.
`P-PSC` → `explicitSaveAfterCommit`, `staleBaseAtomic`, `duplicateInflightDeterministic`, `commitFailureRollback`, `autosaveNotSave`, `recoverySurvivesRestart`, `backupIntegrity`, `mixedBidiReadback` all `true`; save receipt carries `digest`, `committedRevision`, `driverId=node:sqlite`.

### Windows proof cluster (explicit)

`C03-GATE-021` **not closed by W05.** Runner type for the 216 blocked rows = **Owner-device** (Windows 10.0.26100 interactive desktop/session: real HWND + OS topmost + focus/bounds, active keyboard-source layout, ConPTY PTY raw-I/O, Windows path containment, native-window lifecycle). This wave ran on the **automated managed Linux runner** (Node 22.16.0, Playwright 1.62.1 Chromium headless); no Owner-device execution authority was granted. Two Windows/platform rows groups that the law explicitly says do **not** need the Owner machine are **not** blocked: `MANAGED_RUNNER_ENVIRONMENT_IDENTITY` (8 rows, runner type automated → PASS via `P-BROWSER`+`P-PSC`+`P-STACK`) and `PACKAGE_AND_LOCKFILE_DIFF_SCAN` (8 rows, runner type automated → PASS via `P-STACK`).

### Shared browser suite (not W05-owned)

`runtime-causal-consequence` remains **FAIL / HARNESS** per `controller/07_browser/failure_taxonomy.md`. The probe lives in `tools/browser-conformance.mjs`, which is **outside W05's ownership**, so W05 did not edit it — **REPORTED, not fixed** (see `W05_HANDOFF.md` → Blockers). Per packet §9 no product conclusion is drawn from that flow.

---

## W05-E — workspace completion handoff

| Field | Content |
|---|---|
| `checkpoint_id` | `W05-E` |
| `branch` | `writer/mi-serial` |
| `commit` | `d4b9e151801b66d8c50511306532dec3482ae553` |
| `candidate` | declared `WORKTREE_VARIANT:c82cec63cb5f` / `c82cec63…/287`; measured `90240a5e…/287` (drift recorded, not suppressed) |
| `changed_files` | see inventory below |
| `tests` | all of A–D; final state: 24/24 proofs PASS · matrix exit 0 · zero_loss true · `npm test` 210/0 · W05 browser 8/8 · `npm run check` exit 1 with only the 2 pre-existing non-W05 `browser.*` failures |
| `evidence` | `writer-output/W05/EVIDENCE_INDEX.json`, `PROOF_RESULTS.json`, `ACCEPTANCE_MATRIX.csv`, `ACCEPTANCE_SUMMARY.json`, `BROWSER_RECEIPT.json`, `evidence/*.png` (64) |
| `requirements` | **2,827 / 2,827 · `zero_loss: true` · PASS 2,487 · BLOCKED 324 · NOT_APPLICABLE_WITH_PROOF 16 · FAIL 0** |
| `remaining_work` | 324 BLOCKED rows need external authority (Owner-device Windows run · Q-6 Owner decision · Stage3 mission material); 1 shared HARNESS probe fix outside W05 scope; OC-C-06 registry revision (Controller/Owner side, filed in `PROPOSALS.md`) |
| `known_risks` | see `W05_HANDOFF.md` → Blockers / STOP-REPORT |

### Six packet states (packet §19)

| State | Status |
|---|---|
| Implementation | **STABLE** — 8 surfaces composed through `w05-rescue`; no `adapters/surfaces/*`, no `surfaces/{health,processing}/**` created |
| Browser | **VERIFIED** — 8/8 W05 flows PASS, contract-complete receipt; shared 6-flow suite unchanged at baseline (1/5) |
| Evidence | **BOUND** — 64 hash-indexed screenshots, 0 orphans; DB state hashes bound; candidate/commit/tree bound with drift recorded |
| Acceptance | **MATRIX COMPLETE** — 2,827 rows, `zero_loss: true`, exit 0 |
| Integration | **NO NEW REGRESSION** — `npm test` 210/0; `npm run check` at baseline; `check-duplicate-mechanics` exit 0; 4/63 cross-workspace sweep failures all attributable to sibling workspaces |
| Checkpoint | **A–E recorded here** |

---

## W05-owned file inventory

| Path | Provenance |
|---|---|
| `stack/local-runtime/persistence/acceptance-seed/balanced6/seed.mjs` | `W05_MODIFIED` (CBF-001) |
| `stack/native-typescript/foundation/global/preferences/store.ts` | `W05_MODIFIED` (MFC-PF-003 / §11 negative) |
| `stack/native-typescript/w4-e-settings-center-tests.ts` | `W05_MODIFIED` (executable + 5 SC-011 tests) |
| `stack/native-typescript/tests/surfaces/manual_ai/manual-ai-tests.ts` | `W05_MODIFIED` (fixture repair) |
| `stack/native-typescript/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.ts` | `W05_MODIFIED` (fixture repair) |
| `tools/balanced6-acceptance-tests.mjs` | `W05_MODIFIED` (CBF-001 proof + DB state hashes) |
| `tools/w05-processing-capability-proof.mjs` | `W05_MODIFIED` (idempotency key + 2 negatives) |
| `tools/w05-runtime-http-integration.mjs` | `W05_MODIFIED` (truthful `HTTP-N01`, no child leak) |
| `tools/w05-browser-flows.mjs` | `W05_NEW` |
| `tools/w05-stack-admission-proof.mjs` | `W05_NEW` |
| `writer-output/W05/**` | `EVIDENCE` |
| `dist/**` | `GENERATED_DIST` (never hand-edited; always `tools/writer-serial.sh node tools/build-runtime.mjs`) |
| `assurance/{MODEL_TEST_RESULTS,CONTRACT_TEST_RESULTS,BROWSER_CONFORMANCE_RECEIPT}.json`, `assurance/browser-workspace-pane-context.png` | `GENERATED_DIST` (shared, written only under `tools/writer-serial.sh`) |

**Not touched:** the 3 pre-existing protected canonical deltas (`main.ts`, `foundation/extensions.css`, `foundation/operational/xterm-renderer.ts`), `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `archaeology/**`, `assurance/**` (hand-written), `session-63ad5b92-…md`, and every other writer's surfaces/adapters/tests.
