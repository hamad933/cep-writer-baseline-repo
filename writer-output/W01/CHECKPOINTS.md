# W01 CHECKPOINTS — Today + Shared Global Shell

Schema: `controller/12_execution/01_writer_checkpoint_contract.md` §1.
Records are appended in order A→E; this file is a Writer-phase output (never a Controller artifact).

Common bindings for this return:

| Field | Value |
|---|---|
| `branch` | `writer/mi-serial` |
| `commit` (at final proof run, 2026-09-29T04:16:31Z) | `3763d13b27df6505a309c3b51299e70a9bf56d3c` |
| `HEAD^{tree}` | `1faf6df1b71e9f528b6001ce4dfe0b34376352fd` |
| `candidate` (dispatch-declared, packet §2 baseline binding) | `WORKTREE_VARIANT c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` / 287 files |
| `candidate` (measured by `tools/source-tree-identity.mjs` at capture) | `ac424340da0dc6db1a1922eaff5c1e8789343ee438abd0771669e18f86a11fa8` / 287 files |
| candidate drift | **recorded, not suppressed** — see `known_risks` and `W01_HANDOFF.md` §conflicts |

---

## W01-A — workspace baseline verified

- **checkpoint_id:** `W01-A`
- **branch:** `writer/mi-serial`
- **commit:** `d0910639e06a33aad118a798177a106537b825f0` (HEAD at dispatch / at the moment of the inherited-receipt re-measurement)
- **candidate:** `WORKTREE_VARIANT c82cec63…/287`
- **changed_files:**
  - `tests/surfaces/today/surface.test.mjs` → `W01_CHANGE` (the known W01 baseline defect, fixed in W01-B)
  - `stack/native-typescript/main.ts`, `stack/native-typescript/foundation/extensions.css`, `stack/native-typescript/foundation/operational/xterm-renderer.ts` → `PRE_EXISTING_PROTECTED` (never touched)
  - `dist/**` → `GENERATED_DIST` (untouched by W01; no `npm run build:runtime` was needed)
  - `writer-output/W01/*` → `EVIDENCE`
- **tests:** inherited Coordinator baseline receipt `controller/12_execution/00_dispatch_readiness.md` §5 re-measured on the exact candidate:
  - `npm test` → **PASS** (210/0, exit 0)
  - `npm run check` → **FAIL** (exit 1; 5 real FAIL, all `browser.*` lineage class)
  - `node tests/surfaces/shell/surface.test.mjs` → **PASS**
  - `node tests/surfaces/today/surface.test.mjs` → **FAIL** (`AssertionError line 9: actual 'NOT_INFERRED__W04_OWNED' expected 'NOT_INFERRED'`) — the single W01-owned baseline defect
  - `node dist/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.js` → **PASS**
  - `node dist/tests/post-c03/D07/d07-today-presentation-authority-tests.js` → **PASS**
  - receipt: `writer-output/W01/PROOF_RESULTS.json`
- **evidence:** `writer-output/W01/PROOF_RESULTS.json`
- **requirements:** 711 in scope (shell 352 + today 359), 0 dispositioned at this checkpoint, `zero_loss: false` (catalog not yet authored)
- **remaining_work:** CKPT-B..E
- **known_risks:** baseline `npm run check` failure is browser-lineage class and is **not** W01-owned; it is carried into the matrix as measured FAIL on the `GATE-022` rows.

---

## W01-B — foundation/surface implementation stable

- **checkpoint_id:** `W01-B`
- **branch:** `writer/mi-serial`
- **commit:** `3763d13b27df6505a309c3b51299e70a9bf56d3c`
- **candidate:** as in the common bindings above
- **changed_files:**
  - `tests/surfaces/today/surface.test.mjs` → `W01_CHANGE` — **Coordinator-accepted**. Fix: (i) mastery epistemic token `'NOT_INFERRED'` → `'NOT_INFERRED__W04_OWNED'`, bound to `profiles/today.json` invariant *"Progress is a projection; Mastery is W04-owned"*, `surfaces/today/surface.ts:masteryAuthority:'W04_OWNED'` and the passing S07 contract `s07-contracts.test.ts`; (ii) fixture brought to the current adapter contract proven by S07/D07 — added `kind:'RECOMMENDATION'`, `recommendation.version:'rev-7'`, a bound `continuationResolver`, and `selectRecommendation` before `today.why` (`_normalizeItem` drops kindless items; `today.resume`/`today.why` are deliberately availability-gated on target-resolution and provenance proof).
  - `tools/w01-conformance.mjs` → `W01_NEW` (21/21 checks, exit 0)
  - `tools/w01-browser-flows.mjs` → `W01_NEW` (5 packet §9 flows)
  - `stack/native-typescript/**` → **no W01 edit**; the 3 protected deltas remain byte-identical to their dispatch state
- **tests:** `node tests/surfaces/today/surface.test.mjs` → **PASS** (`cases:9`); `node tests/surfaces/shell/surface.test.mjs` → **PASS**; S07 → **PASS**; D07 → **PASS**; `npm test` → **PASS**; `node tools/w01-conformance.mjs` → **PASS 21/21**
- **build regenerated:** **NOT REQUIRED** — no `stack/native-typescript/**` source changed, so `npm run build:runtime` was deliberately not run and `dist/` is untouched by W01
- **evidence:** `writer-output/W01/PROOF_RESULTS.json`
- **requirements:** 0/711 dispositioned yet, `zero_loss: false`
- **remaining_work:** CKPT-C..E
- **known_risks:** the Today LEFT-region summary string (`Filter · …`) is rendered once at mount and is not re-rendered by the filter command — a presentation-staleness observation recorded as a bounded finding; it was **not** repaired because the fix would require editing `surfaces/m0-controller-composition.ts`, a Coordinator-applied serialized hotspot (02_parallel_dispatch §3: writers may not edit it at all).

---

## W01-C — requirement coverage verified (zero-loss, exit 0)

- **checkpoint_id:** `W01-C`
- **branch:** `writer/mi-serial`
- **commit:** `3763d13b27df6505a309c3b51299e70a9bf56d3c`
- **candidate:** as in the common bindings above (`--candidate "WORKTREE_VARIANT:c82cec63cb5f+measured:ac424340"`)
- **changed_files:**
  - `writer-output/W01/PROOF_CATALOG.json` → `EVIDENCE` (24 rules, 11 proofs, disjoint total partition)
  - `writer-output/W01/PROOF_RESULTS.json` → `EVIDENCE` (measured by the tool, never hand-written)
  - `writer-output/W01/ACCEPTANCE_MATRIX.csv`, `ACCEPTANCE_SUMMARY.json` → `EVIDENCE`
- **tests:** `python3 tools/writer-acceptance-matrix.py --workspace W01 --run-proofs …` → **exit 0**, `zero_loss: true`
  - measured proofs: `P-SHELL-ROUTE` PASS · `P-TODAY-ROUTE` PASS · `P-S07` PASS · `P-D07` PASS · `P-MODEL` PASS · **`P-CHECK` FAIL (exit 1)** · `P-CHECK-DUP` PASS · `P-CONFORMANCE` PASS (21/21) · `P-BROWSER-W01` PASS · **`P-BROWSER-CBF002` FAIL (exit 1)** · `P-MATRIX-ZEROLOSS` PASS
  - receipt: `writer-output/W01/PROOF_RESULTS.json`
- **evidence:**
  - `writer-output/W01/ACCEPTANCE_MATRIX.csv` sha256 `e95694c4781ddd9851f0207442ea8325d87d342da9f70e140722bbd422184827`
  - `writer-output/W01/PROOF_RESULTS.json` sha256 `d22b72857397dc9f6b2aec13a695daf14cfe2a29574ad3421426b944ca1991d0`
  - `writer-output/W01/PROOF_CATALOG.json` sha256 `419073beedfc2f14991ffcde7e05704c1bba73adedee45adb5366331bf3411b2`
  - `writer-output/W01/ACCEPTANCE_SUMMARY.json` sha256 `ba204145e81247d0890f2f69cb55c2cb7cac53efd343cafdf1748aad17962c0b`
- **requirements:** **711 / 711 dispositioned · `zero_loss: true`** · PASS 326 · BLOCKED 356 · NOT_APPLICABLE_WITH_PROOF 26 · FAIL 3
  - matrix sha256 `e95694c4781ddd9851f0207442ea8325d87d342da9f70e140722bbd422184827`
  - FAIL rows (measured, not hidden): `OBL-000001` (CBF-002 return continuity), `OBL-008623`, `OBL-008624` (C03-GATE-022 browser evidence)
- **remaining_work:** CKPT-D..E
- **known_risks:** 356 BLOCKED rows are bounded by named missing authority, not by missing effort — see `W01_HANDOFF.md` §rows-dispositioned.

---

## W01-D — browser/evidence verification

- **checkpoint_id:** `W01-D`
- **branch:** `writer/mi-serial`
- **commit:** `3763d13b27df6505a309c3b51299e70a9bf56d3c`
- **candidate:** dispatch-declared `c82cec63…/287`; receipt records **measured** `ac424340…/287` and `lineageStatus: DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS`
- **changed_files:**
  - `tools/w01-browser-flows.mjs` → `W01_NEW`
  - `writer-output/W01/BROWSER_RECEIPT.json` → `EVIDENCE`
  - `writer-output/W01/evidence/*.png` (66 files, all indexed) → `EVIDENCE`
- **tests:** `node tools/w01-browser-flows.mjs` (Playwright 1.62.1 package-local Chromium `151.0.7922.34`, viewport 1440×980, `reducedMotion:'reduce'`, transport `localhost-http` via `tools/serve.mjs` on a runtime-discovered port, server killed on exit)
  - **4 PASS / 1 FAIL** — see `W01_HANDOFF.md` §browser for per-flow classification
  - receipt: `writer-output/W01/BROWSER_RECEIPT.json`
- **evidence:** `writer-output/W01/BROWSER_RECEIPT.json` sha256 `a1a643ce1000be7a01efa1ae8963e3e0f24222de3d55218531d74ac1d8d57a67` + 66 hash-bound screenshots in `writer-output/W01/evidence/` (13 `FLOW_EVIDENCE`, 53 `SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED`)
- **requirements:** browser-coupled rows dispositioned under W01-C
- **remaining_work:** CKPT-E; CBF-002 repair decision belongs to the Coordinator (see known_risks)
- **known_risks:** CBF-002 measured **FAIL / PRODUCT** — the shell bookmark *captures* the Today filter correctly but the *restore* does not re-apply it after the async surface mount. Bounded with evidence, not repaired (see handoff).

---

## W01-E — workspace completion handoff

- **checkpoint_id:** `W01-E`
- **branch:** `writer/mi-serial`
- **commit:** `3763d13b27df6505a309c3b51299e70a9bf56d3c`
- **candidate:** as in the common bindings above
- **changed_files (complete W01 change set, provenance):**
  | Path | Provenance |
  |---|---|
  | `tests/surfaces/today/surface.test.mjs` | `W01_CHANGE` (Coordinator-accepted fix) |
  | `tools/w01-conformance.mjs` | `W01_NEW` |
  | `tools/w01-browser-flows.mjs` | `W01_NEW` |
  | `writer-output/W01/**` (10 files + `evidence/`) | `EVIDENCE` |
  | `stack/native-typescript/{main.ts,foundation/extensions.css,foundation/operational/xterm-renderer.ts}` | `PRE_EXISTING_PROTECTED` (untouched by W01) |
  | `dist/**` | `GENERATED_DIST` (untouched by W01 — no source change, no rebuild) |
- **tests:** the full proof table of W01-C plus the browser receipt of W01-D; `zero_loss: true` re-verified
- **evidence:** `writer-output/W01/EVIDENCE_INDEX.json` (sha256 of every artifact and every screenshot, bound to candidate/commit/tree/flow)
- **requirements:** **711 / 711 · `zero_loss: true`** · matrix sha256 `e95694c4781ddd9851f0207442ea8325d87d342da9f70e140722bbd422184827`
- **remaining_work:**
  1. **Q-1** shell final destination count — Owner decision (C03-GATE-023 Owner-authority-only); `destinationCountFrozen=false` preserved, count never frozen or invented.
  2. **Q-2** Today provider owner — Owner/Controller ownership decision + registry row.
  3. **CBF-002** (TODAY filter side) — restore-side repair seam identified; requires a serialized-hotspot slot if `main.ts`/`m0-controller-composition.ts` are touched, otherwise a `foundation/global/shell/navigation.ts` change (W01 sole writer).
  4. **C03-GATE-022** browser evidence gate — browser-lineage class, Controller plane.
  5. 356 `BLOCKED` rows — each carries its named missing authority in `ACCEPTANCE_MATRIX.csv`.
  6. 26 `NOT_APPLICABLE_WITH_PROOF` rows — bindings cited per row.
- **known_risks:**
  1. **Candidate identity drift under Owner-directed parallel execution** (`02_parallel_dispatch.md`): W02/W03/W04/W05 are editing this same worktree concurrently. The dispatch-declared candidate `c82cec63…/287` no longer recomputes; the measured identity at capture was `ac424340…/287` (same file count). Recorded in `BROWSER_RECEIPT.json.evidenceLineage`, `PROOF_RESULTS.json` and `EVIDENCE_INDEX.json`; **not** suppressed. W01's own partition is provably unchanged (`w01.writable-partition-only-expected-changes`, `w01.read-only-roots-untouched`).
  2. `npm run check` remains **exit 1** for `browser.lineage_receipt_truthful` + `browser.targeted_visual_evidence` — shared browser-receipt evidence, Controller plane, not W01 product code.
  3. 55 of the 66 screenshots are superseded intermediate attempts retained deliberately (never deleted) and labelled in `BROWSER_RECEIPT.json.evidenceArtifacts`; the Coordinator may prune them if a single-attempt evidence set is preferred.
  4. Today LEFT-region filter summary staleness (bounded finding, blocked on the serialized hotspot rule).
