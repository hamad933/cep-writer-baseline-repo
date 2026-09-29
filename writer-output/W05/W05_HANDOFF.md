# W05 HANDOFF — Health · Processing · Validation · Manual AI (AI Bridge) · Backup/Restore · Audit · Releases · Configuration

**Class:** `WRITER_HANDOFF__CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
Workspace W05 · Branch `writer/mi-serial` · Packet `controller/09_writer_forge/W05_writer_packet.md` · Requirements `controller/09_writer_forge/W05_REQUIREMENTS.csv`
Candidate declared: `WORKTREE_VARIANT:c82cec63cb5f` / `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` / 287 files
Candidate measured at W05 capture: `WORKTREE_VARIANT:90240a5e9f5b5eae74d8843a3ab074762fea4aad058aa19b6ffd37577161805a` / 287 files — **drift recorded, never suppressed**

---

## 1. Checkpoint status

| Checkpoint | Status | Headline |
|---|---|---|
| **CKPT-A** | **DONE** | Baseline re-measured one command at a time on the exact candidate before any edit: 4 manual-ai + 2 S19 failures, `w4-e-settings-center-tests` vacuous (never invoked), `w05-processing-capability-proof` FAIL, `w05-runtime-http-integration` hang+FAIL, **CBF-001 reproduced 6/6 invalid seed documents** |
| **CKPT-B** | **DONE** | All W05-owned failures closed; build regenerated under `tools/writer-serial.sh`; CBF-001 closed; MFC-PF-003 resolved; duplication ban held |
| **CKPT-C** | **DONE** | Matrix tool **exit 0**, **`zero_loss: true`**, 2,827/2,827 rows, **24/24 proofs measured PASS** |
| **CKPT-D** | **DONE** | `node tools/w05-browser-flows.mjs` **exit 0 · 8/8 flows PASS**; contract-complete receipt + 64 hash-indexed screenshots; shared `npm run browser:test` rebind run; `npm run check` at baseline |
| **CKPT-E** | **DONE** | `EVIDENCE_INDEX.json`, `CHECKPOINTS.md` (A–E), this handoff, `PROPOSALS.md` |

---

## 2. Exact files created / changed

**Created (`W05_NEW`)**
- `tools/w05-browser-flows.mjs` — 8 W05 browser flows + contract-complete receipt writer
- `tools/w05-stack-admission-proof.mjs` — automated package/lockfile diff + dependency-admission ledger
- `writer-output/W05/PROOF_CATALOG.json`, `PROOF_RESULTS.json`, `ACCEPTANCE_MATRIX.csv`, `ACCEPTANCE_SUMMARY.json`, `BROWSER_RECEIPT.json`, `EVIDENCE_INDEX.json`, `CHECKPOINTS.md`, `W05_HANDOFF.md`, `PROPOSALS.md`
- `writer-output/W05/evidence/*.png` — 64 hash-indexed screenshots

**Modified (`W05_MODIFIED`)**
- `stack/local-runtime/persistence/acceptance-seed/balanced6/seed.mjs` — CBF-001 (`section` → kernel-valid `toggle`)
- `stack/native-typescript/foundation/global/preferences/store.ts` — import preserves unscoped `session` state
- `stack/native-typescript/w4-e-settings-center-tests.ts` — made executable + 5 SC-011 tests + corrected contract-scope expectation
- `stack/native-typescript/tests/surfaces/manual_ai/manual-ai-tests.ts` — 4 fixtures rebuilt onto the declared export/import flow
- `stack/native-typescript/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.ts` — 2 fixtures inject `AnalyticalCompareOwner` + assert no local owner
- `tools/balanced6-acceptance-tests.mjs` — 3 CBF-001 checks incl. DB state hashes
- `tools/w05-processing-capability-proof.mjs` — explicit durable retry idempotency key + 2 negatives
- `tools/w05-runtime-http-integration.mjs` — truthful `HTTP-N01`, child runtime always reaped

**Generated (`GENERATED_DIST`, never hand-edited)**
- `dist/**` via `tools/writer-serial.sh node tools/build-runtime.mjs` (272 files)
- `assurance/MODEL_TEST_RESULTS.json`, `assurance/CONTRACT_TEST_RESULTS.json`, `assurance/BROWSER_CONFORMANCE_RECEIPT.json`, `assurance/browser-workspace-pane-context.png` — only ever under `tools/writer-serial.sh`

**Never touched:** the 3 pre-existing protected canonical deltas (`main.ts`, `foundation/extensions.css`, `foundation/operational/xterm-renderer.ts`), `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `archaeology/**`, hand-written `assurance/**`, `session-63ad5b92-…md`, and every other writer's surfaces/adapters/tests.

---

## 3. Proof results table (command → measured)

| # | Command | Measured |
|---|---|---|
| P-MODEL | `tools/writer-serial.sh npm test` | **PASS** 210 / 0 |
| P-PSC | `node tools/psc-runtime-falsification.mjs` | **PASS** (save/autosave≠save/recovery/backup integrity/staged import/path traversal/no allowlists/mixed bidi) |
| P-BALANCED6 | `node tools/balanced6-acceptance-tests.mjs` | **PASS 35/35** (incl. 3 CBF-001 checks) |
| P-STACK | `node tools/w05-stack-admission-proof.mjs` | **PASS 5/5** |
| P-PC1 | `node stack/native-typescript/tests/rescue/PC1_W05_PROVIDER_PERSISTENCE/provider-persistence-falsification.mjs` | **PASS 9/0** |
| P-PC1-SEAM | `node …/PC1_W05_PROVIDER_PERSISTENCE/server-provider-seam-smoke.mjs` | **PASS** |
| P-D11 | `node dist/tests/post-c03/D11/d11-w05-provider-integration-tests.js` | **PASS** (exit 0) |
| P-BROWSER | `node tools/w05-browser-flows.mjs` | **PASS 8/8 flows** |
| P-S16 | `node dist/tests/rescue/S16_W05_HEALTH_PROCESSING/s16-health-processing-tests.js` | **PASS 14/14** |
| P-HEALTH-CAP | `node tools/w05-health-capability-proof.mjs` | **PASS** |
| P-HTTP | `node tools/w05-runtime-http-integration.mjs` | **PASS 16/16** |
| P-CG6 | `node dist/tests/rescue/CG6_W05_COVERAGE/cg6-w05-coverage.test.js` | **PASS 6/6** |
| P-PROC-CAP | `node tools/w05-processing-capability-proof.mjs` | **PASS 13/13** |
| P-S17 | `node dist/tests/rescue/S17_W05_VALIDATION_MANUAL_AI/s17-tests.js` | **PASS 12/12** |
| P-MANUALAI-SURFACE | `node dist/tests/surfaces/manual_ai/manual-ai-tests.js` | **PASS 12/12** (was 8/4) |
| P-CG6-TRUTH | `node dist/tests/rescue/CG6_W05_COVERAGE/controller-corr01-w05-truth.test.js` | **PASS 3/3** |
| P-S18-DOMAIN | `node dist/tests/rescue/S18_W05_BACKUP_AUDIT/domain-tests.js` | **PASS 13/13** |
| P-S18-BOUNDARY | `node dist/tests/rescue/S18_W05_BACKUP_AUDIT/source-boundary-tests.js` | **PASS 5/5** |
| P-BACKUP-CAP | `node tools/w05-backup-capability-proof.mjs` | **PASS** |
| P-S19 | `node dist/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.js` | **PASS 17/17** (was 15/2) |
| P-RELEASES-SURFACE | `node dist/tests/surfaces/releases/releases-tests.js` | **PASS 12/12** |
| P-CONFIGURATION-SURFACE | `node dist/tests/surfaces/configuration/configuration-tests.js` | **PASS 12/12** |
| P-W4E | `node dist/w4-e-settings-center-tests.js` | **PASS 36/36** (was vacuous) |
| P-SC011 | `node dist/tests/post-c03/D03A/d03a-command-settings-convergence-tests.js` | **PASS** (exit 0) |
| — | `tools/writer-serial.sh node tools/build-runtime.mjs` | **PASS** 272 written, 0 stale |
| — | `tools/writer-serial.sh npm run check` | **exit 1 — exactly the 2 pre-existing `browser.*` failures, not W05's** |
| — | `node tools/check-duplicate-mechanics.mjs` (standalone) | **exit 0 / status PASS** |
| — | `tools/writer-serial.sh npm run browser:test` | exit 1 — shared 6 flows 1 PASS / 5 FAIL; receipt **rebound** to live tree |

---

## 4. Acceptance matrix

```
workspace            W05
requirements_rows    2827
rows_dispositioned   2827
zero_loss            true
counts               PASS 2487 · BLOCKED 324 · NOT_APPLICABLE_WITH_PROOF 16 · FAIL 0
proofs_used          24 (all measured PASS)
matrix sha256        eaa4fd6fe4759cdf…
```

Per surface (PASS / BLOCKED / N-A): audit 303/40/2 · backup 308/44/2 · configuration 305/40/2 · health 314/39/2 · manual_ai 309/41/2 · processing 320/39/2 · releases 311/41/2 · validation 317/40/2.

Rule partition (15 rules, disjoint + total, verified 0 unmatched / 0 multi before the tool ran):
`R-W05-SURFACE-*` ×8 (2,487 PASS) · `R-W05-C03-GATE-021-WINDOWS-NATIVE-OWNER-DEVICE` (216 BLOCKED) · `R-W05-FORWARD-GAP-NO-MISSION-MATERIAL` (106 BLOCKED) · `R-W05-Q6-MANUAL-AI-PROVENANCE-MECHANISM` (2 BLOCKED) · `R-W05-C03-GATE-021-MANAGED-RUNNER-IDENTITY` (8 PASS, runner type **automated**) · `R-W05-STACK-ADMISSION-NO-UNPROVEN-EXPANSION` (8 PASS, runner type **automated**) · `R-W05-VISUAL-REFERENCE-NOT-LAW` (8 N/A) · `R-W05-ARCHAEOLOGY-NOT-LAW` (8 N/A).

No row carries PASS without a measured proof. No real FAIL exists (0), so nothing was hidden as FAIL→BLOCKED.

---

## 5. CBF-001 closure proof (acceptance criterion b)

- **Before (measured):** 6/6 seeded documents rejected by the real `StructuredTreeKernel` — `UNSUPPORTED_BLOCK_TYPE: section` (depth 0) + `INVALID_CHILD_CONTAINMENT` of the child `code` block (depth 1).
- **Fix:** single-owner persistence kernel seed emits a kernel-valid `toggle` container (`title`, `open:true`) owning the `code` block. No other seeded field, hash, id, provenance or FTS behaviour changed.
- **After (measured, proof `P-BALANCED6`):**
  - `cbf-001.seed-blocks-satisfy-structured-tree-kernel` → PASS, `documents=6 owner=StructuredTreeKernel validated=ALL_SIX`
  - `cbf-001.no-unsupported-section-block-type` → PASS, `seededBlockTypes=['code','toggle']`
  - `cbf-001.db-state-hash-bound` → PASS, `stateHash=9f09cb6ffe60c542c5a303dca747d7e9bf069e4de61611064240a3e7353fde0e` + per-document `revisionId`/`contentSha256` (stable across re-seed)
- **Regression guard:** the test fails on re-introduction of `type:'section'` or any type outside the kernel's type set.
- Seed-data `section` type no longer violates kernel types → packet §11 negative discharged.

## 6. MFC-PF-003 closure proof (acceptance criterion c)

`PreferenceExportImportResetModel` exposure = `SettingsCenterOwner` action home `settings.transfer` + `ScopedPreferencesOwner` values/persistence (adjudication C-02, `shared_ownership_map.md` row 9). Proven three ways:
1. **`P-W4E` 36/36** — exactly one `settings.transfer` home; `sourceOwner=SettingsCenterOwner`; `groupId=settings`; action ids exactly `settings.preferences.export|import|reset` in order; every item `kind=preference-transfer-action` + `delegatesTo=ScopedPreferencesOwner`; Settings search reaches the home; export receipt `code=EXPORTED`, `durablePersistenceClaim=false`, `valueOwner/persistenceOwner=ScopedPreferencesOwner`; import `code=PERSISTED`, `durable=true`, carried scope applied, non-carried scope dropped; reset `resetCount=1` restoring defaults; rejected imports atomic (`IMPORT_REJECTED`, `overridesUnchanged=true`, overrides byte-identical); rendered Settings carries all three `data-settings-action` attributes.
2. **`P-SC011`** (`tests/post-c03/D03A`, not W05-owned) → PASS, same exposure end-to-end.
3. **`P-BROWSER` flow `configuration.sc011-transfer`** → PASS, live DOM: `data-settings-section="settings.transfer"` + the three `data-settings-action` attributes.

**Product delta made by W05:** `ScopedPreferencesOwner.import()` now preserves the context-free `session` scope that `export()` structurally excludes, so a transfer payload cannot clobber state it does not carry (packet §11 "preference import must not clobber unscoped state"). Carried-scope replacement semantics are unchanged and still satisfy D03A's `import replaces overrides` expectation; `model-tests` `preference.session` / `preference.atomic` / `w2a.preference-import-atomic-validation` all still PASS (210/0).

---

## 7. Backup → restore round-trip evidence (acceptance criterion e)

**Browser (real consumer):** flow `backup.restore-round-trip` — document bootstrapped over HTTP → `backup.package` → `backup.plan` → `backup.preview` → `backup.stage` → `backup.drill` → `backup.activationRequest`, 16/16 assertions PASS.
Exact restorability proven by identity binding: `drill.packageId === flow packageId`, `drill.snapshotSha256 === flow snapshotSha256`; `stage.productionDatabaseMutated=false`; `drill.status=STAGED_AND_VERIFIED` with `liveRestored=false`; `activation.status=AUTHORITY_PENDING` with `productionDatabaseMutated=false`; `truth.stagedVerifiedIsLiveRestored=false`.

**Node (corroboration):** `P-BACKUP-CAP` PASS; `P-HTTP` `HTTP-02/03/04/15` PASS; `P-PC1` `backup.stage-drill-activation-never-live-restore`, `backup.preview-zero-write-and-schema-conflict-before-drill`, `backup.failed-attempt-survives-reopen`, `backup.compensation-failure-preserves-original` all PASS; `P-PSC` `backupIntegrity=true`, `boundedBackupDestination=true`, `stagedImportExport=true`, `invalidChecksumRejected=true`.

**Ceilings held:** `STAGED_AND_VERIFIED ≠ LIVE_RESTORED`; no surface command owns a production restore endpoint; activation is authority-pending only.

---

## 8. Browser flow results with classifications (browser_contract §1 + 7-class taxonomy)

| flow | status | `failureClassification` | notes |
|---|---|---|---|
| `health.refresh-inspect-diagnose` | PASS | — | refresh re-observes and does **not** create a diagnostic; `diagnose` → `diagnostic.durable=true`; queue `QueueMetric` ≠ worker `WorkerLiveness`; `persistenceHealthAlias=false` |
| `processing.inspect-retry-requestCancel-validationHandoff` | PASS | — | cancel-request returns `CANCEL_REQUESTED` at the API boundary (not cancelled); `CANCELLED` only after provider ack with `providerEvidence.actualProviderAck=true`; retry not offered for a non-FAILED job; handoff `PENDING` until real consumer ack |
| `validation.flow` | PASS | — | technical result rendered; `reviewSnapshot().findings.length===0`; collection has 0 `formalReviewFinding` rows; `truth.formalReviewAuthority=false` |
| `manual-ai.bridge-truthful-ceilings` | PASS | — | `providerMode=MANUAL_ONLY_PROVIDER_NEUTRAL`; `hiddenProviderCalls=0`; `automaticCanonicalPublication=false`; default composition has **no** export helper and **no** draft sink |
| `backup.restore-round-trip` | PASS | — | see §7 |
| `audit.trail-recording` | PASS | — | `persistence=PROVIDER_DURABLE_JSONL`; `hashIsEncryption=false`; `databaseImmutabilityClaim=false`; `commandReceiptsAreAuditTruth=false`; annotate on unknown target fails closed and creates no event; annotation leaves `eventHashBefore===eventHashAfter` and `eventCountBefore===eventCountAfter` |
| `releases.view` | PASS | — | `compareOwner.ownerToken='AnalyticalCompare'` (injected, never synthesised); readiness ≠ authorization ≠ deployment; empty set not green; compare/inspect fail closed |
| `configuration.sc011-transfer` | PASS | — | `duplicateSettingsEngine=false`; `settingsCanDispatchOperationalConfigApply=false`; edit/validate/reset/requestApply ceilings hold; SC-011 exposure in live DOM; session-scope import does not clobber unscoped state |

**Totals:** 8 flows · 8 PASS · 0 FAIL · every record carries `browser, browserVersion, transport/runtime, candidate, commit, tree, environment, route, flow, preconditions, actionSequence, expectedState, assertions, screenshots, evidenceLineage, fixtureState, negativeCases, failureClassification`.
**Evidence:** `writer-output/W05/BROWSER_RECEIPT.json` (sha256 `9076a0b0b985e775…`), screenshots `writer-output/W05/evidence/<flow>-<YYYYMMDDTHHMMSSZ>-<candidate8>.png`, 64 artifacts hash-indexed in `evidenceArtifacts` → **0 orphan screenshots**.
No flow used the forbidden default labels "Product bug" or "browser issue"; `failureClassification` is `null` on all eight because none failed.

---

## 9. Windows proof cluster (explicit)

**`C03-GATE-021` is NOT closed by W05.** 216 rows are `BLOCKED` with runner type **Owner-device** (Windows 10.0.26100 interactive desktop/session — real HWND + OS topmost + focus/bounds, active keyboard-source layout, ConPTY PTY raw-I/O, Windows path containment, native-window lifecycle). W05 executed on the **automated managed Linux runner** (Node 22.16.0 · Playwright 1.62.1 Chromium headless · `localhost-http`); no Owner-device execution authority was granted, and an Owner-device claim is `BLOCKED` by Owner authority.

Two Windows/platform row groups the law says do **not** require the Owner machine are **not** blocked and carry runner type **automated**:
- `MANAGED_RUNNER_ENVIRONMENT_IDENTITY…` (8 rows) — negative test explicitly rejects `OWNER_MACHINE_REQUIRED_FOR_ALL_WINDOWS_TARGET_PROOF` → PASS via `P-BROWSER` (environment identity, exact harness source binding, hash-bound artifact custody) + `P-PSC` (target semantics, local-only capabilities explicit, no command/executable allowlist) + `P-STACK`.
- `PACKAGE_AND_LOCKFILE_DIFF_SCAN…` (8 rows) — PASS via `P-STACK` (diff scan + admission ledger + no unadmitted third-party import in 210 product source files).

The `runtime: platformWindow / activeKeyboardSource / terminalRuntime` capability advertisement still truthfully reports `UNAVAILABLE` with `providerId=cep-win32-sidecar` and `platform=linux` — no false capability claim.

---

## 10. Blockers

| # | Blocker | Class | Owner needed |
|---|---|---|---|
| B1 | **216 rows** — Windows native target proof requires an Owner-device run (C03-GATE-021) | `BLOCKED` (Owner authority) | Owner |
| B2 | **2 rows** — Q-6 Manual-AI provenance recording mechanism unspecified; A16-PF-006 cannot be closed without silently deciding it | `BLOCKED` (open question) | Owner / Controller |
| B3 | **106 rows** — `ZL01_FORWARD_GAP` needs new Stage3 mission material with an executable owner/proof route (positive test forbids treating a route label as consumption) | `BLOCKED` (missing mission material) | Controller |
| B4 | `tools/browser-conformance.mjs` flow `runtime-causal-consequence` still **FAIL / HARNESS** (probe dereferences missing state). File is **outside W05 ownership** → reported, not edited. Packet §9 satisfied: **no product conclusion drawn from it**. | `HARNESS` | owner of `browser-conformance.mjs` |
| B5 | Shared 6-flow suite stays 1 PASS / 5 FAIL; `npm run check` therefore still exits 1 on `browser.lineage_receipt_truthful` + `browser.targeted_visual_evidence` — **identical to the pre-W05 baseline** | `UNKNOWN/HARNESS` per `failure_taxonomy.md` (Controller-adjudicated) | Controller |
| B6 | `OC-C-06 / A-1` — `SURFACE_READINESS_REGISTRY.json` still lists 2 stale planning rows (`adapters/surfaces/{health,processing}-domain.ts`, writable `surfaces/{health,processing}/**`). W05 did **not** create them (duplication ban held); registry revision is Controller/Owner scope → filed in `PROPOSALS.md` | registry drift | Controller/Owner |

---

## 11. Integration impact (persistence kernel consumers)

`stack/local-runtime/persistence/**` is single-owner for this wave and consumed by **ALL** workspaces.

- **Change:** only the Balanced6 seed's block *type* (`section` → `toggle`). No schema, no column, no provider method, no API, no revision/digest algorithm changed. `schema-v1.sql`, `sqlite-persistence-provider.mjs`, `sqlite-connection-adapter.mjs` byte-identical.
- **Effect on consumers:** seeded documents now validate against `StructuredTreeKernel`, so Library/Learn/Visualize/Today consumers that read seeded KUs no longer receive an invalid tree. `BALANCED6_SEED_MANIFEST.json`, the six `source/*.md` files, all source SHA-256s and titles are unchanged (`seed.exact-source-hashes`, `seed.exact-titles` PASS).
- **Fingerprint:** committed DB state hash `9f09cb6ffe60c542c5a303dca747d7e9bf069e4de61611064240a3e7353fde0e` (changes because the seeded content changes — expected and recorded).
- **Second change:** `foundation/global/preferences/store.ts#import` preserves the `session` scope. Every `ScopedPreferencesOwner` consumer (W01 shell, W02 policy, W03, W04, W05) is affected only in that a session-scoped override now survives a preference import/load; all carried-scope semantics unchanged. `npm test` 210/0 and `tests/post-c03/D03A` PASS after the change.
- **Serialization held:** every `dist/**` and `assurance/**` write went through `tools/writer-serial.sh`; `dist/**` never hand-edited; no sibling output attributed, reverted or "cleaned up".

---

## 12. STOP / REPORT conditions encountered

1. **Q-6 (STOP/REPORT, packet §6 + open-questions standing rule)** — the Manual-AI provenance *recording* mechanism is unspecified. W05 did **not** decide it; the 2 A16-PF-006 rows are `BLOCKED` with **Q-6** named. Everything W05 proved about Manual AI is limited to ceilings already enforced in code (`hiddenProviderCalls:0`, `automaticCanonicalPublication:false`) and the already-declared export→import provenance equality.
2. **Duplication-ban request check** — no request to create `adapters/surfaces/*` or `surfaces/{health,processing}/**` was received or acted on; had one arrived it would have been a STOP/REPORT. Verified absence recorded in `EVIDENCE_INDEX.json#duplicationBanHeld`.
3. **No STACK_FROZEN assumption** — `P-STACK` explicitly asserts the *absence of unadmitted expansion*, never a frozen list; `stack.not-declared-frozen` is a real negative scan for frozen markers.
4. **Contract text conflict (resolved without silent decision)** — `w4-e-settings-center-tests.ts` expected `GLOBAL_PRESENTATION_DISCLOSURE_SEARCH_ONLY` while `settings/center.ts` declares `…_INTERACTION_ONLY`. The code value was already adjudicated parent-equal in `writer-output/D03A/D03A_FINDING_CLOSURE_MATRIX.csv` ("fails identically on parent and candidate"), so the test expectation was corrected and the reason recorded here rather than the contract being changed to match a stale test.
5. **S19 vs LCORR01 conflict (resolved without weakening either law)** — S19's 2 fixtures constructed a `ReleasesDomainAdapter` with no compare owner, which is impossible to satisfy while `post-c03/LCORR01` `A17-PF-006.releases-does-not-create-local-compare-owner` (PASS 29/0, not W05-owned) requires `compareOwner===null`. Fixtures now inject the controller-injected owner and S19 additionally asserts the no-local-owner law.

**No `writer-output/W05/SERIALIZED_HOTSPOT_REQUEST.md` was filed** — `main.ts` and `m0-controller-composition.ts` were not edited.
**`writer-output/W05/PROPOSALS.md` was filed** (registry/contract proposals only).

---

## 13. Residual gaps

- Windows Owner-device run (B1) — one bounded Owner-device session only, per packet §6.
- Q-6 Owner decision (B2).
- Stage3 mission material for 106 forward-gap rows (B3).
- Shared HARNESS probe fix (B4) + Controller re-adjudication of the shared 6-flow suite (B5).
- OC-C-06 registry revision (B6).
- Historical `W5_A` results carry `LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE` and were **never** promoted; they are provenance only.
