# W02_HANDOFF — Library · Learn · Visualize · RQ + shared interaction/customization POLICY

Writer **W02** → Writer Coordinator (review, never self-merge).
Branch `writer/mi-serial` · HEAD at handoff `d4b9e151801b66d8c50511306532dec3482ae553` · packet `controller/09_writer_forge/W02_writer_packet.md` · requirements `W02_REQUIREMENTS.csv` (1,485 rows).

**Candidate bindings**
| Identity | Value | Used for |
|---|---|---|
| `WORKTREE_VARIANT c82cec63cb5f` | `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` (287 files) | `ACCEPTANCE_MATRIX.csv` rows (as instructed by the brief) |
| Execution-time source tree | `90240a5e9f5b5eae74d8843a3ab074762fea4aad058aa19b6ffd37577161805a` (287 files) | `BROWSER_RECEIPT.json`, every screenshot |
| commit | `072343e9f99e03f4deeb707a5393c0d8a18b38b2` (bound on `ACCEPTANCE_MATRIX.csv` rows **and** `BROWSER_RECEIPT.json`) | both |
| HEAD at handoff write | `d4b9e151801b66d8c50511306532dec3482ae553` | handoff only — HEAD moved during execution as W01/W03/W04 committed |
| `HEAD^{tree}` | `1fc29a81ff17fde696ab1a1ef72c33ba61cc4141` | both |

> The dispatch-time and execution-time source hashes differ because W01 (`61ee12d`) and the Coordinator
> (`891c1e5`, `d4b9e15`) committed into the same worktree while W02 executed. Both are recorded, neither
> is silently reconciled (`controller/08_evidence/evidence_contract.md` §Lineage).

---

## 1 · CKPT A–E

| CKPT | Status | One-line evidence |
|---|---|---|
| **A** baseline verified | **DONE** | 15 commands re-measured on the dispatched candidate — `CHECKPOINTS.md` §W02-A |
| **B** implementation stable | **DONE** | 5 source defects closed + 2 vacuous proofs made real — §W02-B |
| **C** requirement coverage | **DONE** | 1485/1485, `zero_loss: true`, exit **0**, FAIL **0** — §W02-C |
| **D** browser/evidence | **DONE_WITH_LIMITATION** | 8/10 W02 flows PASS, 2 ORACLE-classified with cited bindings — §W02-D |
| **E** handoff | **DONE** | this file — §W02-E |

## 2 · Proof results (command → measured)

| # | Command | Measured |
|---|---|---|
| 1 | `node tests/surfaces/library/surface.test.mjs` | **PASS** `{"status":"PASS","cases":7}` (was FAIL) |
| 2 | `node tests/surfaces/learn/surface.test.mjs` | **PASS** `{"status":"PASS","cases":22}` (was FAIL) |
| 3 | `node tests/surfaces/rq/surface.test.mjs` | **PASS** `{"status":"PASS","cases":12}` (was FAIL) |
| 4 | `node tests/surfaces/visualize/surface.test.mjs` | **PASS** `{"status":"PASS","cases":9}` |
| 5 | `tools/writer-serial.sh npm test` | **PASS** 210 / 0 |
| 6 | `node dist/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-structured-editor-core-tests.js` | **PASS** 10/10 (was vacuous 0) |
| 7 | `node dist/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-browser-proof.js` under `node` | **FAIL** `document is not defined` — **browser-only artifact**, re-proved in-browser: flows `s01-…-1440x1000` and `s01-…-1024x900` **PASS 2/2 each** |
| 8 | `node dist/tests/rescue/S08_W01_W02_LIBRARY_LEARN/s08-falsification.js` | **PASS** 17/17 |
| 9 | `node dist/tests/rescue/S09_W01_W02_RQ_VISUALIZE/s09-reexecution-tests.js` | **PASS** 16/16 (was vacuous 0) |
| 10 | `node dist/tests/post-c03/D08/d08-w02-visualize-parity-tests.js` | **PASS** 10/10 |
| 11 | `node tools/b3r-rq-visualize/falsify-b3r.mjs` | **PASS** 18/18 |
| 12 | `node tools/b3r-rq-visualize/falsify-b3r-corr03.mjs` | **PASS** 30/30 (was 28/30) |
| 13 | `node tools/check-duplicate-mechanics.mjs` / `check-authority-intake.mjs` / `check-deferred-boundary.mjs` | **PASS** ×3 (exit 0) |
| 14 | `tools/writer-serial.sh npm run check` | **exit 1** — `check-contracts`: `browser.lineage_receipt_truthful`, `browser.targeted_visual_evidence` = the **baseline pair** (`00_dispatch_readiness.md` §5); other 8 sub-commands exit 0. `browser.current_candidate_claim_truthful` (appeared mid-run) **cleared** by rebinding the receipt. |
| 15 | `tools/writer-serial.sh npm run browser:test` | **1 PASS / 5 FAIL** (unchanged from baseline): 4 W02-policy flows **ORACLE** + `runtime-causal-consequence` **HARNESS/W03** |
| 16 | `node tools/w02-browser-flows.mjs` | **8 PASS / 2 FAIL** (both **ORACLE**) |
| 17 | `node dist/tests/rescue/CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH/controller-corr01.test.js` | **FAIL** — 2 stale assertions vs post-C03 `LCORR03` + `D03C`; source half already closed by W02 → **PROPOSALS P-1** |
| 18 | `node dist/tests/rescue/S04_SHARED_NOTES_OPERATIONAL/s04-shared-notes-operational-tests.js` | **FAIL 8/11** — root causes `DETACH_CONTEXT_HANDOFF_REQUIRED` / `PROVIDER_REATTACH_UNAVAILABLE`; **both the source and the test are outside W02 §1** → **PROPOSALS P-4** |
| 19 | `python3 tools/writer-acceptance-matrix.py --workspace W02 --run-proofs …` | **exit 0**, `zero_loss: true` |

## 3 · Acceptance matrix counts

`writer-output/W02/ACCEPTANCE_MATRIX.csv` (1,485 rows, **disjoint total partition of 40 rules over 17 proofs**)

| Status | Count | Where |
|---|---|---|
| **PASS** | **1411** | per-surface identity/profile/result-audit/owner-decision/QA/root-finding/durable-ancillary/forward-gap + reconciliation rows discharged by the measured proofs |
| **BLOCKED** | **68** | 58 `Future D05/D06/D08/D09/D10/D11 Mission material` + 4 `POST_C03_EXECUTION_PLAN` re-issue (artifacts do not exist / Controller-owned) + **6 Q-3** (`REVIEWED_FINAL_CANDIDATE` RQ visual-ceiling rows — STOP/REPORT, never decided) |
| **NOT_APPLICABLE_WITH_PROOF** | **6** | 3 `VISUAL_REFERENCE` (K-05 / `browser_contract.md` §4 presentation-only) + 3 `AUTHORITY_RECOVERY_ARCHAEOLOGY` (provenance-only law, packet §13) |
| **FAIL** | **0** | — |
| `zero_loss` | **true**, exit **0** | `requirements_sha256 32024e3067885c659ba8ee8d66201be184cda6672fb14f28b652f4955d814821` · `matrix_sha256 e101788ecd6c089e95fc2e0069e89ebb08c9464a0a0980cf6229f481e6bdefaa` |

**Q-3 is never decided.** All 6 rows are `BLOCKED` with Q-3 named (`R-Q3-RQ-VISUAL-REF`, `R-Q3-RQ-CEILING-BINDING`, `R-Q3-RQ-CEILING-EXCERPT`).

**Honest-FAIL accounting:** one catalog proof measured FAIL — `P-W02-BROWSER-ALL` (full 10-flow packet §9
suite, 2 ORACLE-classified flows). It is referenced by **no** rule because a search of
`W02_REQUIREMENTS.csv` finds **0 rows** matching `route convergence|label scope|central change|relation.edit|spatial.connect`;
binding it anywhere would violate "group rows only where genuinely discharged by the same measured proof".
The failure is preserved in `BROWSER_RECEIPT.json`, `PROOF_RESULTS.json`, `CHECKPOINTS.md §W02-C` and here.

## 4 · Findings disposition

| Finding (packet §6/§10) | Disposition |
|---|---|
| **F-049** Canvas remove leaks to TREE/PATH/GRAPH | **CLOSED** — `adapters/visualize/domain.ts` `removeRepresentation` now drops representations whose remaining view set is empty; caught by `falsify-b3r-corr03.mjs` F047 (28/30 → **30/30**). D04 NO-TOUCH preserved (no `post-c03/D04` file touched). |
| **F-050** Canvas identity/grammar incomplete | **CLOSED for the reported dimension** — duplicate/remove/undo/redo identity round-trips proven (`F047.duplicate…`, `F047.remove…`, `F047.undo-redo…` all PASS) + browser closure at 1440×1000 **and** 1024×900. |
| **CBF-003** BOTTOM domain reachable through `BottomDeepWorkOwner` | **VERIFIED READ-ONLY** — `foundation/global/bottom-shelf.ts` (`BottomDeepWorkOwner`) is W01/FOUNDATION-owned and *not* in W02's §1 write list; W02 did not fork it, `check-duplicate-mechanics.mjs` (approved owner `foundation/global/bottom-shelf.js`) and `check-authority-intake.mjs` both PASS, and `adapters/structured-bottom-provider.ts` (W02 list) remains a *consumer*. No code change required to make it reachable → no hotspot request filed. |
| **MFC-PF-001/002** Library local transient/focus keys beside shared owners | **RESOLVED — no local keys introduced**; W02's only Library change routes through shared owners (`structured.availability('document.commit')`, `StructuredTransactionHistoryRecoveryOwner`, `structured.updateTitle`). `check-duplicate-mechanics.mjs` PASS. |
| **CBF-002** (VISUALIZE context side) | no change required; `visualize` context provider binding proved by `fit/pan/zoom` + `spatial select/connect` flows (PASS). |
| **PW-20** Learn real-consumer binding | **REMAINS HISTORICAL BLOCKED (evidence only, per packet §7)** — `tests/surfaces/learn/surface.test.mjs` uses a *test-supplied* source and is explicitly labelled `boundRoute:'test-supplied-source-route-only'`; it is **not** claimed as a real-consumer proof (PW01 ceiling). Real-consumer ground is `S08.learn.real-source-no-fixture-claim` (PASS) + `LCORR03 C5`. |
| **Q-3** RQ visual ceiling | **STOP/REPORT — not decided** (6 rows BLOCKED). |

## 5 · Browser receipt bound to candidate

`writer-output/W02/BROWSER_RECEIPT.json` — `candidate WORKTREE_VARIANT:90240a5e9f5b` at capture,
`commit 072343e9…`, receipt `tree` = source-tree identity `90240a5e…` (287 files), `canonicalSourceFileCount 287`, Chromium/Playwright 1.62.1,
`localhost-http`, viewports 1440×1000 and 1024×900, `reducedMotion: reduce`.
10 screenshots in `writer-output/W02/evidence/`, each with `bytes` + `sha256` + `viewport`; the 50 orphans produced by aborted intermediate runs were deleted — no orphan evidence remains.
All 18 `browser_contract.md` §1 fields present per flow (`contractFields`), 7-class `failureClassification`
on every failure (2 × `ORACLE`, 0 other in W02's own suite).

## 6 · Policy-mechanics compliance matrix (packet §4, two-field A-4 model)

| Mechanic | IMPLEMENTATION_OWNER (never forked by W02) | POLICY_OWNER | Verified across **library · learn · rq · visualize** | Other 19 surfaces |
|---|---|---|---|---|
| Structured presentation bridge | `StructuredPresentationBridge` / `StructuredSurfaceHost` | W02 | PASS — S01-core 10/10, S08 17/17, library↔learn chain flow PASS | read-only consumers, no change |
| Spatial engine | `SpatialPresentationOwner` + `SpatialInteractionKernel` | W02 | PASS — visualize select/connect, fit/pan/zoom, closure 1024×900 | W03 consumers read-only, unchanged |
| Relation interaction | `RelationInteractionOwner` (`foundation/relations.ts`) | W02 | PASS in-kernel (no page error, ownership intact); **flow blocked by ORACLE precondition** (PROPOSALS P-2/P-3) | enterprise/labs/scenarios = W03 |
| Pointer kernels | `WindowMotion` + `StructuredDragDropOwner` | W02 | PASS — S01 pointer/keyboard proof both viewports, S04 `window-motion` cases 3/3 | unchanged |
| Global keymap | `GlobalInputKeymapOwner` | W02 | PASS — focus/`document.activeElement` flow PASS | unchanged |
| Input direction (RTL/BIDI) | `InputDirectionResolver` | W02 | PASS — `unicode-bidi: isolate` DOM evidence + `lang/dir` preference flow | unchanged |
| Layout / responsive | `WorkspacePaneLayoutOwner` + `WorkspaceResponsiveLayoutPolicy` | W02 | PASS — pane preferred/effective lifecycle in focus flow | unchanged |
| Accessibility feedback | `AccessibilityFeedbackOwner` | **W02** | PASS — `check-duplicate-mechanics.mjs` + `npm test` 210/0 | unchanged |
| Customization | `ScopedPreferencesOwner` + `SettingsCenterOwner` + `ReusableToolbarTemplateOwner` | W02 policy / W05 SC-011 action home | PASS — no W02-local preference keys introduced | W05 owns SC-011 action home, untouched |
| Bottom deep-work | `BottomDeepWorkOwner` (foundation) | W01 | PASS (read-only consumer, CBF-003 above) | unchanged |
| Analytical compare | `foundation/analytical/compare.ts` | W03 (results) / **W02 (rq provider)** | PASS — RQ fails closed without the shared owner; `rq` route 12/12 | results = W03, unchanged |

## 7 · Files created / changed

**Changed (W02-owned):**
- `stack/native-typescript/surfaces/library/surface.ts`
- `stack/native-typescript/adapters/learn.ts`
- `stack/native-typescript/adapters/visualize/domain.ts`
- `stack/native-typescript/tests/rescue/S09_W01_W02_RQ_VISUALIZE/s09-reexecution-tests.ts`
- `stack/native-typescript/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-structured-editor-core-tests.ts`
- `tests/surfaces/learn/surface.test.mjs`
- `tests/surfaces/rq/surface.test.mjs`

**Created:**
- `tools/w02-browser-flows.mjs`
- `writer-output/W02/{PROOF_CATALOG,PROOF_RESULTS,ACCEPTANCE_MATRIX,ACCEPTANCE_SUMMARY,BROWSER_RECEIPT,EVIDENCE_INDEX}.json/.csv`
- `writer-output/W02/{CHECKPOINTS,W02_HANDOFF,PROPOSALS}.md`
- `writer-output/W02/evidence/*.png` (10)

**Generated:** `dist/**` (272 files, `tools/writer-serial.sh node tools/build-runtime.mjs` only).
**Never touched:** the 3 protected pre-existing canonical deltas (`main.ts`, `foundation/extensions.css`,
`foundation/operational/xterm-renderer.ts`), `controller/**`, `cep-writer/**`, `contracts/**`,
`profiles/**`, `authority/**`, `archaeology/**`, `assurance/**` (read-only; the two shared receipts were
only *re-measured* by running the sanctioned shared commands under the lock), `session-63ad5b92-*.md`,
`adapters/surfaces/*`, `surfaces/{health,processing}/**`, `main.ts` / `m0-controller-composition.ts`
(no `SERIALIZED_HOTSPOT_REQUEST.md` filed — none was required).

## 8 · Blockers / residual gaps (all REPORTED, none hidden)

1. **CG3_CONTROLLER_CORR01** — FAIL, 2 assertions stale vs post-C03 `LCORR03` + `D03C`. Exact hunks in **PROPOSALS P-1**. Outside W02 §1.
2. **S04_SHARED_NOTES_OPERATIONAL** — FAIL 8/11. `foundation/notes/sticky-note-window.ts` + `foundation/operational/session-owner.ts` + the S04 test are **all outside W02 §1**. Root causes measured; proposal in **PROPOSALS P-4**.
3. **Shared `npm run browser:test` 4 W02-policy flows** — **ORACLE** (stale `#objectList` selector; measure hidden `#spatialHost` in TREE view; unsatisfiable Enterprise precondition). Tool `tools/browser-conformance.mjs` is **not** in W02 §1 → exact corrections in **PROPOSALS P-2**.
4. **Enterprise admitted topology missing** (`adapters/w03-enterprise.ts`, W03) → blocks packet §9 "route convergence + label scope" → **PROPOSALS P-3**.
5. **`npm run check` exit 1** = baseline pair (`browser.lineage_receipt_truthful`, `browser.targeted_visual_evidence`); cleared only by (3). No W02 regression: `browser.current_candidate_claim_truthful` was fixed by W02's receipt rebind.
6. **Q-3** — 6 rows BLOCKED; STOP/REPORT, never decided.
7. **PW-20** — Learn real-consumer browser binding remains historical BLOCKED (evidence only per packet §7).

## 9 · Integration impact on other workspaces

- **No other workspace's source, adapter, test or composition file was modified.**
- `dist/**` was regenerated from W02's source changes; other writers' in-flight source that was already present in `dist` is preserved, not reverted (the build is `CANONICAL_SOURCE_TO_GENERATED_ONLY` over `stack/native-typescript`, `written: 272`, `removedStale: 0`).
- `assurance/BROWSER_CONFORMANCE_RECEIPT.json` + `SCREENSHOT_MANIFEST.json` were rewritten **only** by running the sanctioned `tools/writer-serial.sh npm run browser:test` (lock-held), bound to `90240a5e…/287`.
- `workspace.transient-and-pane-lifecycle` (W01 flow, must stay green) **PASS** on the final re-run.
- **Semantics change other surfaces may observe:** `library.revise` is now reachable when no Library source runtime is bound (local working revision only, `persisted:false`, `canonicalMutation:false`); `library.save` is now always *available* (truthfully refusing); `library.history` is owned by `StructuredTransactionHistoryRecoveryOwner`. All three are exercised by `S08` (green) and `LCORR03` (green).

## 10 · STOP/REPORT conditions invoked

- **Q-3** (RQ visual ceiling) — reported, never decided (packet §6, §15).
- **Packet conflict / cross-test conflict** — CG3 (CORR01) vs post-C03 `LCORR03` + `D03C`, and S04 vs its own
  fixture bridge: reported with exact proposed hunks (**PROPOSALS P-1, P-4**), not resolved unilaterally.
- **Scope boundary** — 4 report-only items filed in `writer-output/W02/PROPOSALS.md`.
- **No `SERIALIZED_HOTSPOT_REQUEST.md`** was required (neither `main.ts` nor `m0-controller-composition.ts` needed a change).
