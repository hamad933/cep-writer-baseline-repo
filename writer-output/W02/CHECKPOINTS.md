# W02 · CHECKPOINTS (A–E)

Format per `controller/12_execution/01_writer_checkpoint_contract.md` §1 (appended, never rewritten).
Writer: **W02** — Library · Learn · Visualize · RQ + shared interaction/customization POLICY.
Branch: `writer/mi-serial`.

**Candidate identities**
- *Dispatch-time* `WORKTREE_VARIANT c82cec63cb5f…` = `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` (287 files) — the identity named in the W02 brief and bound on every `ACCEPTANCE_MATRIX.csv` row.
- *Execution-time* (recomputed with `tools/source-tree-identity.mjs`, `path\0size\0sha256\n`) = `90240a5e9f5b5eae74d8843a3ab074762fea4aad058aa19b6ffd37577161805a` (287 files) — bound on `writer-output/W02/BROWSER_RECEIPT.json` and every screenshot.
- The two differ because W01 (`61ee12d`) and the Coordinator (`891c1e5`, `d4b9e15`) committed into the same worktree while W02 executed. Both are recorded rather than silently reconciled (evidence_contract.md §Lineage).

---

## W02-A · workspace baseline verified — DONE

`commit`: `d3ddc5e` (session start) · `candidate`: WORKTREE_VARIANT `c82cec63…`
`changed_files`: none (read-only reconnaissance)
`requirements`: 0/1485 at this checkpoint.

Measured baseline (every command re-executed by W02 on the dispatched candidate, not inherited):

| Command | Measured result |
|---|---|
| `node tests/surfaces/visualize/surface.test.mjs` | **PASS** — `{"surface":"visualize","status":"PASS","cases":9,"canonicalProvider":"UNAVAILABLE"}` |
| `node tests/surfaces/learn/surface.test.mjs` | **FAIL** — line 10 `assert.equal(practice.masteryWrite,false)`: actual `undefined`, expected `false` |
| `node tests/surfaces/library/surface.test.mjs` | **FAIL** — line 11 `structured.snapshot().title`: actual `'Library'`, expected `'Library revised'` |
| `node tests/surfaces/rq/surface.test.mjs` | **FAIL** — throw `RQ_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED` at `tests/surfaces/rq/surface.test.mjs:8` |
| `node dist/tests/rescue/CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH/controller-corr01.test.js` | **FAIL** — actual `'UNAVAILABLE'`, expected `'UNAVAILABLE_PROVIDER_UNBOUND'` |
| `node dist/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-browser-proof.js` | **FAIL** — `ReferenceError: document is not defined` (browser proof executed under `node`) |
| `node dist/tests/rescue/S04_SHARED_NOTES_OPERATIONAL/s04-shared-notes-operational-tests.js` | **FAIL** — `status:FAIL`, 8/11 (3 `separate-window` cases) |
| `node dist/tests/rescue/S08_W01_W02_LIBRARY_LEARN/s08-falsification.js` | **PASS** 17/17 |
| `node dist/tests/rescue/S09_W01_W02_RQ_VISUALIZE/s09-reexecution-tests.js` | **PASS — VACUOUS (new finding)**: the module only *exports* `runS09ReexecutionTests()`; executing the file runs **0 tests** |
| `node dist/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-structured-editor-core-tests.js` | **PASS — VACUOUS (new finding)**: same shape, 0 tests executed |
| `node dist/tests/post-c03/D08/d08-w02-visualize-parity-tests.js` | **PASS** 10/10 |
| `tools/writer-serial.sh npm test` | **PASS** 210 / 0 |
| `tools/writer-serial.sh npm run check` | exit 1 — `check-contracts` `browser.lineage_receipt_truthful` + `browser.targeted_visual_evidence` (the baseline pair of `00_dispatch_readiness.md` §5); other 8 sub-commands exit 0 |
| `tools/writer-serial.sh npm run browser:test` | 6 flows **1 PASS / 5 FAIL** |

`evidence`: this section + `writer-output/W02/PROOF_RESULTS.json` (final measured run, CKPT-C).
`remaining_work`: close the W02-owned defects above; make S01/S09 non-vacuous; author matrix + browser receipt.
`known_risks`: shared `dist/**` and `assurance/**` are rebuilt by five concurrent writers — every derived write ran under `tools/writer-serial.sh`.

---

## W02-B · implementation stable — DONE

`commit`: `072343e9f99e03f4deeb707a5393c0d8a18b38b2` · `candidate`: as above.
`changed_files` (provenance flag in brackets):

| Path | Flag |
|---|---|
| `stack/native-typescript/surfaces/library/surface.ts` | W02_NEW (edit) |
| `stack/native-typescript/adapters/learn.ts` | W02_NEW (edit) |
| `stack/native-typescript/adapters/visualize/domain.ts` | W02_NEW (edit) |
| `stack/native-typescript/tests/rescue/S09_W01_W02_RQ_VISUALIZE/s09-reexecution-tests.ts` | W02_NEW (edit) |
| `stack/native-typescript/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-structured-editor-core-tests.ts` | W02_NEW (edit) |
| `tests/surfaces/learn/surface.test.mjs` | W02_NEW (edit) |
| `tests/surfaces/rq/surface.test.mjs` | W02_NEW (edit) |
| `tools/w02-browser-flows.mjs` | W02_NEW (file) |
| `writer-output/W02/**` | EVIDENCE |
| `dist/**` (272 files rewritten by `tools/writer-serial.sh node tools/build-runtime.mjs`) | GENERATED_DIST |
| `stack/native-typescript/main.ts`, `foundation/extensions.css`, `foundation/operational/xterm-renderer.ts` | PRE_EXISTING_PROTECTED — **never opened for write by W02**; still carry only the pre-existing canonical delta |
| `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `archaeology/**`, `assurance/**` (except the two receipts re-measured by the shared harness) | read-only, untouched |

### Defects closed (source fixes, not just test fixes)

1. **`library.save` forked the Structured availability gate** (`surfaces/library/surface.ts`).
   `library.save` re-imposed its own `SAVE_BOUNDARY_UNAVAILABLE` *availability* instead of delegating to
   the canonical `structured.availability('document.commit')` (which `foundation/structured.ts` L425
   deliberately keeps enabled with a truthful receipt). Violates the brief's "never fork shared behaviour".
   Now: `payload=>admitted(structured.availability('document.commit',payload))`.
   Result: `library.save` returns `{status:'SAVE_BOUNDARY_UNAVAILABLE', persisted:false}` — a truthful
   refusal, zero fabricated persistence. *Bindings:* `model-tests.ts` `structured.command.read-mode-commit-checkpoint`,
   `tools/vs05-read-mode-matrix.mjs`, `w6-c-structured-note-content-tests.ts` `39.persistence-ceiling…`.
2. **`library.history` claimed a Library-local owner for a shared-history mechanic.**
   Now registered under `StructuredTransactionHistoryRecoveryOwner` (the canonical transaction/history
   owner). Availability/behaviour unchanged → `S08.library.history-requires-exact-revision-provider` still green.
3. **`library.revise` had no local lane when no canonical Library source runtime is bound.**
   `bindLibrarySurface` is invoked by the product route *without* a `libraryRuntime`
   (`m0-controller-composition.ts` L200 ← `main.ts` L52 `createStructuredConsumerAdapter('library', libraryBundle)`),
   so `library.revise` was permanently dead. Added a strictly-scoped local working revision:
   only when `libraryRuntime` is `null` (i.e. **no published source is bound to protect**) and a title is
   supplied, applied through the canonical `structured.updateTitle` (Structured transaction owner,
   `canonicalMutation:false`, `persisted:false`). When a runtime *is* bound the successor-revision
   provider gate is byte-for-byte preserved → `S08.library.revise-does-not-fake-title-edit` stays green
   (asserts `a.enabled===false` + "published source was mutated" is a *failure* condition).
4. **Learn unbound source truth was ambiguous** (`adapters/learn.ts`).
   `LEARN_PROVIDER_UNBOUND` now reports `truth:'UNAVAILABLE_PROVIDER_UNBOUND'` (other rejection reasons
   keep `'UNAVAILABLE'`). Closes the W02-routed half of CG3 (`unbound.structured.sourceBinding.truth`).
   The remaining CG3 assertions are stale vs post-C03 → `writer-output/W02/PROPOSALS.md` P-1.
5. **Canvas-only representation removal leaked into TREE/PATH/GRAPH** (`adapters/visualize/domain.ts`).
   Found by W02's own falsifier `tools/b3r-rq-visualize/falsify-b3r-corr03.mjs`
   (`F047.remove-representation-only-canonical-and-sibling-survive`,
   `F047.undo-redo-recovers-exact-representation-identity-state`, both FAIL).
   `removeRepresentation` emptied `node.views` (`['CANVAS'] → []`), and `viewsOf()` treats an empty base
   as "all views", so the removed representation **re-appeared** in TREE/PATH/GRAPH as
   `views:['TREE','PATH','GRAPH']` — a Canvas-local presentation artefact leaking into the other three
   views. Fix: a representation whose remaining view set is empty is removed from `model.nodes`
   (presentation-only; `canonicalObjectsDeleted:0`, `canonicalMutation:false`).
   → `falsify-b3r-corr03.mjs` now **30/30 PASS** (was 28/30). This is F-049/F-050-adjacent Canvas
   grammar, closed inside D04 NO-TOUCH (no `post-c03/D04` file touched).

### Defects made REAL (were vacuously green)

6. `S09_W01_W02_RQ_VISUALIZE/s09-reexecution-tests.ts` and
   `S01_SHARED_STRUCTURED_EDITOR/s01-structured-editor-core-tests.ts` only *exported* their runner;
   executing them ran **0 tests**. Both now execute on invocation.
   S09 additionally had **11 stale assertions**, adjudicated against W02's own falsifiers:
   - 6 × `new RQDomainAdapter(records)` without the shared owner → `falsify-b3r.mjs` + D03C + packet §4 ⇒ supply `AnalyticalCompareOwner`.
   - 3 × `provider.read()` fixtures omitted `canonical:true` → `falsify-b3r.mjs` **F035** asserts a non-canonical writable provider must stay read-only and **F036** declares `canonical:true` on the editable one ⇒ fixtures corrected, source unchanged.
   - `viewport` on `PATH` → **F045** binds viewport to Graph/Canvas (`{tree:viewport:false, graph:true, canvas:true}`) ⇒ test corrected **and** strengthened with the negative PATH assertion.
   - `sharedSpatial()` registered 8 of the 10 shared spatial commands (`spatial.undo`/`spatial.redo` missing; both registered by `main.ts` L197 and present in `contracts/COMMAND_REGISTRY.seed.json`) ⇒ test corrected.
   Result: **S09 16/16 PASS, S01-core 10/10 PASS** (both previously vacuous).

### Baseline surface-test adjudications (packet §17)

| Test | Verdict | Binding cited |
|---|---|---|
| `tests/surfaces/rq/surface.test.mjs` | **TEST wrong** — constructed `RQDomainAdapter` without the mandatory shared owner, and called `rq.compare` without `scope` | `post-c03/D03C` (must throw), `m0-controller-composition.ts` `R6_CENTRAL_ANALYTICAL_COMPARE_REQUIRED`, `w01-w02-rescue.ts`, `shared_ownership_map.md` #6, packet §4. Corrected → 12 assertions PASS. |
| `tests/surfaces/learn/surface.test.mjs` | **TEST wrong** — exercised the *unbound* product route but asserted *bound* mechanics (`practice`→`submit`→`review`) | `LCORR03` C5-003 (`createLearnRuntimeComposition()` unbound in `main.ts`), CG3 (availability disabled when unbound), `model-tests.ts` `learn.idempotency` (`START_REQUIRED`), `SemanticCommandBus.execute` (refuses disabled commands). Restructured into the two truthful lanes → 22 assertions PASS. |
| `tests/surfaces/library/surface.test.mjs` | **SOURCE wrong** (`save`/`history`) + **source extended** (`revise`) — test left byte-identical | `structured.availability('document.commit')` contract, `m0-controller-composition.ts` L200 product route, `S08.library.revise-does-not-fake-title-edit` (negative falsification preserved) → 7 assertions PASS, **file untouched**. |

`tests` (measured after B):

| Command | Result |
|---|---|
| `node tests/surfaces/{library,learn,rq,visualize}/surface.test.mjs` | **4/4 PASS** (was 1/4) |
| `node dist/tests/rescue/S08_…/s08-falsification.js` | PASS 17/17 |
| `node dist/tests/rescue/S09_…/s09-reexecution-tests.js` | PASS 16/16 (was vacuous 0) |
| `node dist/tests/rescue/S01_…/s01-structured-editor-core-tests.js` | PASS 10/10 (was vacuous 0) |
| `node dist/tests/post-c03/D08/…` | PASS 10/10 |
| `node tools/b3r-rq-visualize/falsify-b3r.mjs` | PASS 18/18 |
| `node tools/b3r-rq-visualize/falsify-b3r-corr03.mjs` | PASS 30/30 (was 28/30) |
| `tools/writer-serial.sh npm test` | PASS 210 / 0 |
| `tools/writer-serial.sh npm run check` | exit 1 — residual `check-contracts` `browser.lineage_receipt_truthful` + `browser.targeted_visual_evidence` (**baseline pair**, requires shared browser flows to pass → PROPOSALS P-2) |
| `node dist/tests/rescue/CG3_CONTROLLER_CORR01_…/controller-corr01.test.js` | **FAIL (reported, not hidden)** — 2 stale assertions vs post-C03 → PROPOSALS P-1 |
| `node dist/tests/rescue/S04_…/s04-shared-notes-operational-tests.js` | **FAIL 8/11 (reported)** — both source and test outside W02 §1 → PROPOSALS P-4 |

`evidence`: this section, `writer-output/W02/PROPOSALS.md`.
`known_risks`: `library.revise` now reachable on the product Library route (local working revision only,
no canonical mutation, no persistence claim).

---

## W02-C · requirement coverage verified — DONE

`commit`: `072343e9f99e03f4deeb707a5393c0d8a18b38b2` · `candidate`: `WORKTREE_VARIANT:c82cec63cb5f` ·
`tree`: `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` (as instructed by the brief)

Command (one authoritative `--run-proofs` invocation; an earlier two-invocation bootstrap became obsolete when
`P-ZEROLOSS` was replaced by the independent `tools/w02-coverage-check.mjs` — see the guard note below):
```
python3 tools/writer-acceptance-matrix.py --workspace W02 --run-proofs \
  --candidate "WORKTREE_VARIANT:c82cec63cb5f" --commit "$(git rev-parse HEAD)" \
  --tree "c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f"
```

`requirements`:

| Field | Value |
|---|---|
| rows dispositioned | **1485 / 1485** |
| `zero_loss` | **true** |
| exit code | **0** |
| PASS | **1411** |
| BLOCKED | **68** (62 `Future D05…D11 Mission material`, 4 `POST_C03_EXECUTION_PLAN` re-issue, **6 Q-3**) |
| NOT_APPLICABLE_WITH_PROOF | **6** (3 `VISUAL_REFERENCE` → K-05, 3 `AUTHORITY_RECOVERY_ARCHAEOLOGY` → provenance-only law) |
| FAIL | **0** |
| `requirements_sha256` | `32024e3067885c659ba8ee8d66201be184cda6672fb14f28b652f4955d814821` |
| `matrix_sha256` | `e101788ecd6c089e95fc2e0069e89ebb08c9464a0a0980cf6229f481e6bdefaa` |

Catalog shape: **40 rules / 17 proofs** — a *disjoint, total* partition validated locally before the run
(0 unmatched, 0 multi-matched rows) and re-validated by the tool (exit 0).

`tests`: 16 of 17 proofs **measured PASS**; 1 measured FAIL —

| Proof | Measured |
|---|---|
| `P-LIBRARY-ROUTE` `P-LEARN-ROUTE` `P-RQ-ROUTE` `P-VISUALIZE-ROUTE` | PASS ×4 |
| `P-MODEL` (`tools/writer-serial.sh npm test`) | PASS (210/0) |
| `P-S01` `P-S08` `P-S09` `P-D08` | PASS ×4 |
| `P-B3R` `P-B3R-CORR03` | PASS ×2 |
| `P-CHECK-DUP` `P-CHECK-AUTH` `P-CHECK-DEFERRED` | PASS ×3 |
| `P-W02-BROWSER` (8 core packet §9 flows) | PASS |
| `P-MANIFEST-COVERAGE` (`node tools/w02-coverage-check.mjs`) | PASS |
| **`P-W02-BROWSER-ALL` (full 10-flow packet §9 suite)** | **FAIL (exit 1)** — `relation-route-convergence-and-label-scope` + `central-change-reuse`, both classified **ORACLE** (precondition unsatisfiable: no admitted Enterprise topology → PROPOSALS P-3). **Referenced by no rule**: a repository-wide search of `W02_REQUIREMENTS.csv` returns 0 rows matching `route convergence|label scope|central change|relation.edit|spatial.connect`, so binding it to any row would violate "group rows only where genuinely discharged by the same measured proof". Declared here and in the handoff so it is never invisible. |

`evidence`: `writer-output/W02/{PROOF_CATALOG,PROOF_RESULTS,ACCEPTANCE_MATRIX,ACCEPTANCE_SUMMARY}.*`.
Guard compliance (the engine gained three guards during W02's run — each satisfied, none bypassed):
- `SELF_REFERENTIAL_PROOF` — the matrix generator may not prove the matrix. `R-RECON-MANIFEST` now uses
  `tools/w02-coverage-check.mjs`, an independent checker that reads the frozen CSV + catalog directly and
  never imports or invokes `tools/writer-acceptance-matrix.py`.
- `NO_SUBJECT_MATCHED_DISCHARGE` — no rule is discharged by `build-runtime`/`npm test`/`test-models` alone.
- `INSUFFICIENT_GRANULARITY` — every `OWNER_DECISION` (296) and `OWNER_QA_DEEP_AUDIT` (211) rule keys
  explicitly on `component` (decision id / finding id): `R-<SURFACE>-DECISION` and `R-<SURFACE>-QA`
  each enumerate the exact subject ids they discharge (77 decision subjects, 54 audit subjects).

`known_risks`: none outstanding for coverage; the catalog generator (`tools/w02-coverage-check.mjs` re-run) is
the cheap re-validator if the engine gains further guards.

---

## W02-D · browser / evidence verification — DONE

`commit`: `072343e9f99e03f4deeb707a5393c0d8a18b38b2` · `browser`: Chromium (Playwright package-local headless shell), `playwrightResolution: package-local`, Playwright `1.62.1`, Node `v22.16.0`, transport `localhost-http` (`tools/serve.mjs`, port 43187 — W02-private, does not collide with the shared harness on 43173).

**W02 suite** `node tools/w02-browser-flows.mjs` → `writer-output/W02/BROWSER_RECEIPT.json`, **10 flows, 8 PASS / 2 FAIL**:

| Flow | Status | Class | Notes |
|---|---|---|---|
| `library-edit-learn-consume-real-consumer-chain` | PASS (8/8) | — | one Structured mutation + transaction owner across Library → Learn; Learn document untouched |
| `spatial-select-connect-canonical-edge` | PASS (5/5) | — | 2-item selection preserved, read-only Connect hidden, canonical relation count/version unchanged |
| `relation-route-convergence-and-label-scope` | **FAIL** | **ORACLE** | `W02_PRECONDITION_UNMET: edge=0,label=0` — `createEnterpriseAdapter()` with `fixture:false` returns `nodes:[]` |
| `central-change-reuse` | **FAIL** | **ORACLE** | `W02_PRECONDITION_UNMET: enterprise exposes no relation endpoint pair` — same root cause |
| `spatial-input-bidi-preference-and-structured-isolation` | PASS (5/5) | — | `lang=en`/`dir=ltr`; `getComputedStyle(bdi).unicodeBidi === 'isolate'` on every mixed-direction token; `assertDomainIsolation()` true; Learn exposes 0 Library state |
| `fit-pan-zoom-canonical-state-invariance` | PASS (4/4) | — | camera changes, canonical projection digest + relation records byte-identical; Tree/Path refuse viewport |
| `focus-document-activeElement-proofs` | PASS (4/4) | — | pane lifecycle, palette Escape, `document.activeElement === invoker` |
| `s01-structured-insertion-pointer-keyboard-1440x1000` | PASS (2/2) | — | compiled S01 browser proof runs in a real document (was `document is not defined` under node) |
| `s01-structured-insertion-pointer-keyboard-1024x900` | PASS (2/2) | — | same, closure viewport |
| `spatial-closure-1024x900` | PASS (2/2) | — | Canvas closure obligation: non-zero spatial bounds + reachable selection at 1024×900 |

Every flow records `browser · browserVersion · transportRuntime · candidate · commit · tree · environment · route · flow · preconditions · actionSequence · expectedState · assertions · screenshots · evidenceLineage · fixtureState · negativeCases · failureClassification` (`contractFields` in the receipt).

**Shared harness** `tools/writer-serial.sh npm run browser:test` → 6 flows, **1 PASS / 5 FAIL** (unchanged from baseline): 4 W02-policy flows classified **ORACLE** (proposed corrections in PROPOSALS P-2) + `runtime-causal-consequence` **HARNESS/W03** (Controller pre-classified). `assurance/BROWSER_CONFORMANCE_RECEIPT.json` re-bound to `CANONICAL_SOURCE_TREE_SHA256:90240a5e…` / 287 files, which cleared `browser.current_candidate_claim_truthful` in `npm run check`; the residual `browser.lineage_receipt_truthful` + `browser.targeted_visual_evidence` are the baseline pair and cannot clear until the 6 shared flows pass.

**Screenshots** — 10 files (the 2 ORACLE-classified flows fail before any capture, so they own none), `writer-output/W02/evidence/<flow>-<YYYYMMDDTHHMMSSZ>-<candidate8>-<seq>.png`,
each hash-bound in the receipt (`bytes` + `sha256` + `viewport`); viewports recorded at **1440×1000 and 1024×900** (Canvas closure). Stale screenshots from aborted intermediate runs were deleted so no orphan evidence remains.

`evidence`: `writer-output/W02/BROWSER_RECEIPT.json`, `writer-output/W02/evidence/*.png`.
`known_risks`: W02's candidate-tree hash is shared with four concurrent writers (see header).

---

## W02-E · workspace completion handoff — DONE

`commit`: `072343e9f99e03f4deeb707a5393c0d8a18b38b2` at handoff write (= the commit bound on the final measured artifacts). HEAD moved six times during execution (W01 `61ee12d`, Coordinator `891c1e5`, W04 `1854d41`, W03 `f9d5a4d`, W03 `d4b9e15`, W04 `072343e9`) because five writers share one worktree; **every measured artifact binds its own `git rev-parse HEAD`** (`ACCEPTANCE_MATRIX.csv` rows and `BROWSER_RECEIPT.json` both bind `072343e9…`).

Six packet states (packet §19):

| State | Result |
|---|---|
| **Implementation** | DONE — 7 source/test files + 1 new tool; 5 defects closed, 2 vacuous proofs made real; protected files untouched |
| **Browser** | DONE_WITH_LIMITATION — 8/10 W02 flows PASS; 2 classified ORACLE with cited bindings; shared harness 1/6 with 4 ORACLE + 1 HARNESS/W03 |
| **Evidence** | DONE — `EVIDENCE_INDEX.json` (sha256 of every artifact, bound to candidate/commit/tree/flow) |
| **Acceptance** | DONE — 1485/1485, `zero_loss: true`, exit 0, FAIL 0 |
| **Integration** | DONE_WITH_LIMITATION — `npm test` 210/0; `npm run check` at baseline pair; `dist/**` regenerated only via `tools/writer-serial.sh`; no cross-workspace source file touched |
| **Checkpoint** | DONE — this file, A–E |

`requirements`: see W02-C. `remaining_work` / `known_risks`: see `writer-output/W02/W02_HANDOFF.md`.
