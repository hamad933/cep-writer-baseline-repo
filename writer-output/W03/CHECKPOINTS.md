# W03 — Checkpoints A–E

Workspace: **W03_COMPLETE_WORKSPACE_WRITER** · surfaces Enterprise · Scenarios · Labs · Runs · Results
(+ Replay / AAR / Compare mechanics and the spatial **boundary**)
Branch `writer/mi-serial` · dispatch HEAD `d3ddc5e` · candidate label `WORKTREE_VARIANT:c82cec63cb5f`

Status vocabulary: `PASS` · `FAIL` · `BLOCKED` · `NOT_APPLICABLE_WITH_PROOF`

---

## CKPT-A — baseline verified

**State: PASS** (baseline captured before any edit)

Measured on the candidate (each command run directly, output captured):

| Proof file | Measured baseline | Exact assertion |
|---|---|---|
| `dist/tests/surfaces/labs/domain.test.js` | **FAIL** | `'BLOCKED' !== 'READY'` at `L6` (`labs.preflight` on a DRAFT Lab) |
| `dist/tests/rescue/S11_W03_SCENARIOS_LABS/lab-task-graph.test.js` | **FAIL** | `'BLOCKED' !== 'READY'` at `L11` (`ready.status` after `domain.publish({digest})`) |
| `dist/tests/surfaces/scenarios/domain.test.js` | **FAIL** | `false !== true` at `L6` (`prepared.ok` for `scenarios.prepare` on a DRAFT Scenario) |
| `dist/tests/post-c03/LCORR03/lcorr03-central-integration-falsification-tests.js` | **FAIL** | `C3-002.main-avoids-duplicate-spatial-view-on-enterprise` — `Enterprise guard block exists in main.ts` (14/15) |
| `dist/tests/surfaces/{enterprise,results,runs}/domain.test.js`, `S10/S12/S13`, `CG4_W03_COVERAGE/*`, `tests/post-c03/D09/*`, `w3-d-bottom-deep-work-tests.js`, `analytical-compare-tests.js`, `analytical-compare-correction-tests.js`, `ps02-spatial-finite-atomicity-tests.js` | PASS | — |
| `npm test` | PASS 210/0 | — |
| `npm run check` | **FAIL (exit 1)** | 2 `browser.*` failures, not W03-owned |
| `npm run browser:test` | **FAIL** | 6 flows, 1 PASS / 5 FAIL |
| `python3 tools/check-w03-semantic-ownership.py` | PASS | `60/60 (69/318; cumulativeChanged=242; reviewPatch=24)` |

Root cause recorded at CKPT-A (no code changed yet):

* LCORR-01 (`fb73490`) added publication/provider gates to `W03LabDomain` + `W03ScenarioDomain`
  but only updated `tests/surfaces/{enterprise,runs}` — the labs/scenarios surface tests and
  `S11/lab-task-graph` were left stale.
* The adjudicated worktree delta removes `if(consumer!=='enterprise'){…}` from `main.ts`
  (serialized hotspot), which LCORR03 `C3-002` asserted as a source-text guard.

Baseline written to `writer-output/W03/PROOF_RESULTS.json` by
`python3 tools/writer-acceptance-matrix.py --workspace W03 --run-proofs …` (re-run after every change,
per ACCEPTANCE_MATRIX_SPEC §2).

---

## CKPT-B — implementation stable

**State: PASS** — all four W03-owned failures closed; no other test regressed.

| Failure | Fix (file) | Why this is the fix |
|---|---|---|
| labs surface test `'BLOCKED' !== 'READY'` | `stack/native-typescript/tests/surfaces/labs/domain.test.ts` | Added publish-first setup (`labs.publish` with provider context → `labs.revise` before the authoring negative case). LCORR-01's provider-gated publish (`A13-PF-005`, asserted by `LCORR01` which W03 does not own) is the binding contract; the stale test never published. |
| S11 `'BLOCKED' !== 'READY'` | `stack/native-typescript/tests/rescue/S11_W03_SCENARIOS_LABS/lab-task-graph.test.ts` | `domain.publish(...)` now receives the tool + environment binding context the provider gate requires. |
| scenarios `prepared.ok !== true` | `stack/native-typescript/tests/surfaces/scenarios/domain.test.ts` | Publish-first setup (`scenarios.publish` with `validationContext`) before `scenarios.prepare`. |
| LCORR03 `C3-002` source-text guard | `stack/native-typescript/tests/post-c03/LCORR03/lcorr03-central-integration-falsification-tests.ts` | Guard replaced by **behavioural** single-container assertions (see §11 note below). |
| *(new, found during CKPT-D)* enterprise route crashed in the browser | `stack/native-typescript/surfaces/enterprise/presentation.ts` | See packet §11 note below. |

Packet §11 note — **assumed branch: the gate-REMOVED branch.** I did not edit `main.ts`.
Verified intended behaviour by driving the live route: with the gate removed, `main.ts` runs its
spatial block for `enterprise` and assigns `workspace.onPreferences`, which does
`const host=stage.querySelector('#spatialHost'); host.querySelector(…)` (dist `main.js:223:171`).
The M0 enterprise presentation replaces the stage markup, so `#spatialHost` was gone and the
uncaught `TypeError` aborted boot — `window.CEPFoundation` was never set and the enterprise route
was dead. Fix inside W03 ownership: the Enterprise presentation's topology host now *is* the
stage's single `#spatialHost` (`<div id="spatialHost" data-enterprise-spatial …>`), so the shared
`workspace.onPreferences` contract holds and exactly one spatial host survives per stage.
LCORR03 `C3-002` now asserts that invariant (single `#foundationStage` allocation, M0 `ensureStage`
reuse, replacement render) instead of a source-text branch, and records
`enterpriseGatePresentInMain` in its returned detail for evidence.

Rebuilt with `tools/writer-serial.sh node tools/build-runtime.mjs` after every source edit.

Post-fix measurement: **all four baseline failures PASS**; `npm test` 210/0;
`LCORR03` 15/15; `check-w03-semantic-ownership.py` 60/60.

---

## CKPT-C — requirement coverage

**State: PASS** — `exit 0`, `zero_loss: true`

```
python3 tools/writer-acceptance-matrix.py --workspace W03 --run-proofs \
  --candidate "WORKTREE_VARIANT:c82cec63cb5f" \
  --commit "$(git rev-parse HEAD)" \
  --tree "c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f"
```

| Measure | Value |
|---|---|
| requirements rows | **2,183** |
| rows dispositioned | **2,183** |
| `zero_loss` | **true** |
| PASS | **2,084** |
| FAIL | **0** |
| BLOCKED | **99** |
| NOT_APPLICABLE_WITH_PROOF | 0 |
| rules | 51 (4 literal, 47 derived) |
| proofs | 27 (all measured PASS) |

`writer-output/W03/PROOF_CATALOG.json` is a **disjoint, total partition**: it is generated and then
re-validated by `tools/w03-acceptance-catalog.mjs`, which re-implements the matrix tool's
`row_matches()` semantics and exits 1 on any 0-match (zero-loss) or multi-match (ambiguous) row.

**BLOCKED = 99**, all with a named missing authority:

| Bucket | Rows | Named block |
|---|---|---|
| `R-Q4-TIMELINE-REPLAY-OWNER-BLOCKED` | 11 | **Q-4** (TimelineReplayOwner retain-vs-retire) — STOP/REPORT |
| `R-FUTURE-FOREIGN-MISSION-BLOCKED` | 74 | D05 / D06 / D08 / D10 / D11 mission material (other lanes) |
| `R-VISUAL-REFERENCE-OWNER-INSPECTION-BLOCKED` | 9 | Owner matched-state visual acceptance + C03-GATE-020 |
| `R-ZL02-D13-D14-OBLIGATION-MANIFEST-BLOCKED` | 5 | D13 serialized integration + D14 independent proof (C03-GATE-024) |

Real FAILs stay FAIL: **0**, because no named proof measured FAIL.

---

## CKPT-D — browser / evidence

**State: PASS (W03 suite)** — `writer-output/W03/BROWSER_RECEIPT.json`, `executionStatus: EXECUTED_PASS`

| # | Flow | Viewport | Status | Evidence |
|---|---|---|---|---|
| 1 | `enterprise-twin-baseline` (PVF-001) | 1440×1000 | PASS | evidence/enterprise-twin-baseline-20260929T045721Z-90240a5e.png |
| 2 | `runs-preflight-run-recorded` (PVF-002) | 1440×1000 | PASS | evidence/runs-preflight-run-recorded-20260929T045724Z-90240a5e.png |
| 3 | `results-aar-compare` (PVF-003) | 1440×1000 | PASS | evidence/results-aar-compare-20260929T045726Z-90240a5e.png |
| 4 | `replay-causality-timeline-scrub` | 1440×1000 | PASS | evidence/replay-causality-timeline-scrub-20260929T045728Z-90240a5e.png |
| 5 | `spatial-select-connect-canonical-edge` | **1440×1000** | PASS | evidence/spatial-select-connect-canonical-edge-20260929T045731Z-90240a5e.png |
| 6 | `spatial-select-connect-canonical-edge` | **1024×900** | PASS | evidence/spatial-select-connect-canonical-edge-20260929T045734Z-90240a5e.png |
| 7 | `run-terminal-detach` (`OPEN_TERMINAL`) | 1440×1000 | PASS | evidence/run-terminal-detach-20260929T045736Z-90240a5e.png |

* Receipt carries every `browser_contract.md` §1 field per flow (`browser`, `browserVersion`,
  `transport/runtime`, `candidate`, `commit`, `tree`, `environment`, `route`, `flow`,
  `preconditions`, `actionSequence`, `expectedState`, `assertions`, `screenshots`,
  `evidenceLineage`, `fixtureState`, `negativeCases`, `failureClassification`).
* `failureClassification` uses the 7 classes (`PRODUCT · HARNESS · ENVIRONMENT · ORACLE · EVIDENCE ·
  LINEAGE · UNKNOWN`); every PASS flow carries `null` (nothing to classify).
* **Replay evidence binds the causal chain**: `results.step` action → timeline index delta →
  selected recorded event change, forwards *and* backwards; absent exact ref fails closed with
  `RESULT_REVISION_ABSENT` and leaves `state: IDLE`.
* **Compare evidence proves canonical-state invariance**: sealed Result JSON and the live route's
  canonical relation state are byte-identical before/after AAR + compare.
* Receipt tree `90240a5e…` (287 files) equals the live canonical source tree at proof time.

**Global suite** (`npm run browser:test`, `tools/browser-conformance.mjs` — not W03-owned):
6 flows, 1 PASS / 5 FAIL, `executionStatus=BLOCKED_OR_FAILED`. Classified below in the handoff.

---

## CKPT-E — handoff

**State: PASS**

* `writer-output/W03/EVIDENCE_INDEX.json` — 21 evidence sections + 10 artifact entries
* `writer-output/W03/CHECKPOINTS.md` — this file
* `writer-output/W03/W03_HANDOFF.md` — full report (proofs, PVF closure, classifications, blockers)
* `writer-output/W03/PROPOSALS.md` — contract/hotspot proposals (nothing applied unilaterally)
* `writer-output/W03/ACCEPTANCE_MATRIX.csv` + `ACCEPTANCE_SUMMARY.json` + `PROOF_RESULTS.json`
  + `PROOF_CATALOG.json` + `PROFILE_COVERAGE.json` + `BROWSER_RECEIPT.json` + `evidence/*.png`

Six completion states (packet §19): implementation ✅ · browser ✅ · evidence ✅ · acceptance ✅ ·
integration (bounded — see handoff "Integration impact") ⚠ · checkpoint ✅
