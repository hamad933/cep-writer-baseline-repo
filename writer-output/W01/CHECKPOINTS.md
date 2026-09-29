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

---

## W01-F — residual round: CBF-002 repaired, C03-GATE-020 capture filed, hotspot request filed

- **checkpoint_id:** `W01-F`
- **branch:** `writer/mi-serial`
- **commit** (at the final authoritative proof run, 2026-09-29T05:23Z): `e78d453c43961daba72f2e1ffb203e43c90b6eba`
- **`HEAD^{tree}`:** `21c1ed0606f0bd322e140dd4a2c7597761cc7007`
- **candidate (per-writer binding, `controller/12_execution/03_lineage_adjudication.md`):** `OWNED_PARTITION_SHA256:b9419922de60834bd7948830e883542a96bb87878031c9c9a909b67d09975965` / 14 files / `stableUnderSiblingEdits: true`
- **candidate (whole worktree, `INFORMATIONAL_MOVING` only):** recomputed every run via `tools/writer-candidate-identity.mjs`; HEAD advanced several times during this round (`891c1e5 → d4b9e151 → e78d453c`) purely from sibling checkpoints — recorded, never used to bind a W01 claim
- **scope:** the two residuals W01 itself listed in `W01_HANDOFF.md` §6 (item 3 = CBF-002, item 5 = C03-GATE-020) plus §5.3 / §6 item 9 (Today LEFT filter summary → filed, not applied)

### changed_files (this round, complete)

| Path | Provenance |
|---|---|
| `stack/native-typescript/foundation/global/shell/navigation.ts` | `W01_CHANGE` — **CBF-002 restore side**: `applySurfaceContext()` waits (bounded, 90 frames) for the context control, clicks it once, then **verifies** the pressed/selected state moved. `restoreBookmark()` sets `contextRestored='true'` / `contextRestoreStatus='restored'` only on verification; otherwise `contextRestored='false'` / `contextRestoreStatus='context-unapplied'` and returns `false` — a route+scroll restore is never reported as a context restore (packet §11 negative case). Scroll + focus restoration unchanged. |
| `stack/native-typescript/surfaces/today/surface.ts` | `W01_CHANGE` — **CBF-002 command side**: `today.{filter,resume,refresh,why}` resolve their target adapter at call time through the mounted adapter (`currentTodayAdapter()`, set by `bindTodaySurface`). One owner, one registration — no competing bus, no duplicate mechanics. |
| `tools/w01-obligation-manifest-proof.mjs` | `W01_NEW` — subject-matched `P-OBLIGATION-MANIFEST` proof (see known_risks 5) |
| `tools/w01-visual-capture.mjs` | `W01_NEW` — matched-viewport 1440×1000 + 1024×900 + keyboard/focus capture with `document.activeElement` proof |
| `tools/w01-cbf-probe.mjs` | `W01_NEW` — CBF-002 root-cause measurement probe |
| `tools/w01-evidence-index.mjs` | `W01_NEW` — regenerates `EVIDENCE_INDEX.json` from disk, recursive, orphan-checked |
| `tools/w01-conformance.mjs` | `W01_CHANGE` — `w01.writable-partition-only-expected-changes` expectation refreshed to the current in-partition change set (the W01-E list was already committed, so it could no longer be observed in `git status`); `w01Tools` extended with the three new W01 tools |
| `tools/w01-browser-flows.mjs` | `W01_CHANGE` — added `cbf.restore-reported-only-when-context-applied`; recursive evidence indexing (nested `evidence/<surface>/`); `ownedPartition` binding on the receipt |
| `tests/surfaces/today/surface.test.mjs` | `W01_CHANGE` (previous round, still carried) |
| `writer-output/W01/PROOF_CATALOG.json` | `EVIDENCE` — +`P-VISUAL-CAPTURE`, +`P-OBLIGATION-MANIFEST`, repointed 2 rules off the self-referential proof, keyed 6 rules on their row subject (see known_risks 5) |
| `writer-output/W01/SERIALIZED_HOTSPOT_REQUEST.md` | `EVIDENCE` — exact m0 hunk, **filed not applied** |
| `writer-output/W01/{PROOF_RESULTS,ACCEPTANCE_MATRIX,ACCEPTANCE_SUMMARY,BROWSER_RECEIPT,VISUAL_CAPTURE_RECEIPT,CBF002_PROBE,EVIDENCE_INDEX}.json` | `EVIDENCE` (tool-measured / regenerated) |
| `writer-output/W01/evidence/**/*.png` | `EVIDENCE` — 216 files, 0 orphans, nothing deleted |
| `stack/native-typescript/{main.ts,foundation/extensions.css,foundation/operational/xterm-renderer.ts}` | `PRE_EXISTING_PROTECTED` — untouched (`w01.protected-canonical-deltas-preserved`) |
| `stack/native-typescript/surfaces/m0-controller-composition.ts`, `profiles/**` | `READ_ONLY_FOR_WRITERS` — untouched (`w01.read-only-roots-untouched`); the LEFT-region hunk is filed instead |
| `dist/**` | `GENERATED_DIST` — **regenerated this round** under `tools/writer-serial.sh node tools/build-runtime.mjs` (`pass: true`, `CANONICAL_SOURCE_TO_GENERATED_ONLY`, written 272, copiedAssets 2, removedStale 0): W01's first product-source change |

### proof table (measured — `python3 tools/writer-acceptance-matrix.py --workspace W01 --run-proofs …`)

| proof | result | exit |
|---|---|---|
| `P-SHELL-ROUTE` `node tests/surfaces/shell/surface.test.mjs` | **PASS** (`cases:8`) | 0 |
| `P-TODAY-ROUTE` `node tests/surfaces/today/surface.test.mjs` | **PASS** (`cases:9`) | 0 |
| `P-S07` `node dist/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.js` | **PASS** | 0 |
| `P-D07` `node dist/tests/post-c03/D07/d07-today-presentation-authority-tests.js` | **PASS** | 0 |
| `P-MODEL` `tools/writer-serial.sh npm test` | **PASS** (210/0) | 0 |
| `P-CHECK` `tools/writer-serial.sh npm run check` | **FAIL** — `browser.lineage_receipt_truthful` (1/6) + `browser.targeted_visual_evidence` (legacy class); unchanged from the pre-writer baseline, Controller plane | 1 |
| `P-CHECK-DUP` `tools/writer-serial.sh node tools/check-duplicate-mechanics.mjs` | **PASS** | 0 |
| `P-CONFORMANCE` `tools/writer-serial.sh node tools/w01-conformance.mjs` | **PASS** (21/21) | 0 |
| `P-VISUAL-CAPTURE` *(new this round)* `node tools/w01-visual-capture.mjs` | **PASS** (32/32 assertions, 8 artifacts) | 0 |
| `P-BROWSER-W01` (4 flows) | **PASS** | 0 |
| `P-BROWSER-CBF002` `node tools/w01-browser-flows.mjs --flow back-forward-semantic-context` | **PASS** — *was FAIL at W01-E* | 0 |
| `P-MATRIX-ZEROLOSS` `python3 tools/writer-acceptance-matrix.py --workspace W01` | **PASS** (711/711, `zero_loss: true`) | 0 |
| `P-OBLIGATION-MANIFEST` *(new this round)* `node tools/w01-obligation-manifest-proof.mjs` | **PASS** (711 ids exactly once, 4-status vocabulary, proof/justification law, uniform binding, summary agreement) | 0 |

**13 proofs: 12 PASS / 1 FAIL** — the single FAIL is the pre-existing browser-lineage gate.

### acceptance

- **711 / 711 rows dispositioned · `zero_loss: true` · exit 0**
- counts: `PASS 327` (+1 vs W01-E) · `BLOCKED 356` (0) · `NOT_APPLICABLE_WITH_PROOF 26` (0) · `FAIL 2` (−1)
- per surface: shell `159 / 179 / 13 / 1` · today `168 / 177 / 13 / 1` (PASS/BLOCKED/NA/FAIL)
- matrix sha256 `2075057c8aeaec512a406763655517ffb79952bec8d2fe672de1140167f75f7a`
- every row bound with `--candidate OWNED_PARTITION_SHA256:b9419922…` `--commit e78d453c…` `--tree 21c1ed06…`
- the row that moved: **`OBL-000001` (shell return continuity) `FAIL → PASS`** behind the now-green `P-BROWSER-CBF002`; the 2 remaining FAIL rows are `OBL-008623 / OBL-008624` (`R-GATE022-BROWSER-EVIDENCE`, Controller plane)
- Q-1 → 4 rows `BLOCKED`, Q-2 → 3 rows `BLOCKED`: **still STOP/REPORT, still never decided**

### browser (5/5 PASS, all 44 assertions green)

| flow | status | classification |
|---|---|---|
| `shell.destination-routing` | **PASS** | — |
| `today.render-and-filter` | **PASS** | — |
| `back-forward-semantic-context` | **PASS** | — *(was FAIL / PRODUCT at W01-E — CBF-002)* |
| `deep-work.open-close-lifecycle` | **PASS** | — |
| `diagnostics.gate` | **PASS** | — |

Receipt `writer-output/W01/BROWSER_RECEIPT.json` (Playwright 1.62.1 package-local, Chromium 151.0.7922.34, viewport 1440×980, `reducedMotion:'reduce'`, transport `localhost-http`, commit `e78d453c…`). **216 screenshots on disk, 216 indexed, 0 orphans, 0 deleted** = 13 `FLOW_EVIDENCE` + 8 `MATCHED_VIEWPORT_VISUAL_CAPTURE_EVIDENCE` + 195 `SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED`.

### evidence

- `writer-output/W01/VISUAL_CAPTURE_RECEIPT.json` — C03-GATE-020 W01-side capture: **32/32 assertions**, 1440×1000 **and** 1024×900 × {shell, today} × {baseline, keyboard-focus}, `document.activeElement` proof per keyboard frame, sha256-bound per `controller/08_evidence/evidence_contract.md` as `evidence/<workspace>/<surface>/<flow>-<ts>-<candidate8>.png` (`<candidate8>` = first 8 of `OWNED_PARTITION_SHA256`); 8 CURRENT + 48 retained-and-labelled superseded = 56 artifacts
- `writer-output/W01/CBF002_PROBE.json` — CBF-002 root cause measured before the repair, repair verified after
- `writer-output/W01/SERIALIZED_HOTSPOT_REQUEST.md` — exact m0 line-203 hunk, filed not applied
- `writer-output/W01/EVIDENCE_INDEX.json` — regenerated by `node tools/w01-evidence-index.mjs` (235 artifacts = 19 documents/tools + 216 screenshots, 0 orphans)

### remaining_work

1. **Q-1** shell final destination count — Owner decision only; `destinationCountFrozen=false` preserved, never frozen, never invented (4 rows `BLOCKED`).
2. **Q-2** Today provider owner — Owner/Controller ownership decision + registry row (3 rows `BLOCKED`).
3. **C03-GATE-022** browser evidence — Controller plane (the 2 remaining FAIL rows).
4. **C03-GATE-020** — W01-side capture complete; gate stays `BLOCKED` on Owner matched-state image inspection (`OBL-003674 / OBL-003675 / OBL-008651` unchanged).
5. **Today LEFT-region `Filter · …` summary** — filed as `SERIALIZED_HOTSPOT_REQUEST.md`; needs the Coordinator to apply the m0 half atomically with the `surfaces/today/surface.ts` half.
6. 356 `BLOCKED` rows — each names its own missing authority; 26 `NOT_APPLICABLE_WITH_PROOF` rows keep their cited bindings.

### known_risks

1. **Candidate identity drift is structural under Owner-directed parallel execution.** HEAD advanced `891c1e5 → d4b9e151 → e78d453c` during this round from sibling checkpoints only. W01 therefore binds every receipt and every matrix row to `OWNED_PARTITION_SHA256:b9419922…` + `commit` + `tree`, and records the worktree variant as `INFORMATIONAL_MOVING` context. Nothing suppressed.
2. **`npm run check` still exits 1** on the browser-lineage class — unchanged from the pre-writer baseline, Controller plane, not W01 product code.
3. **Superseded screenshots accumulate and are retained by design** (195 of 216 are superseded intermediate attempts, all labelled with their reason). The Coordinator may prune; W01 does not delete evidence.
4. **The CBF-002 repair changed product source for the first time**, so `dist/` was regenerated under `tools/writer-serial.sh`. A sibling's in-flight `stack/native-typescript/**` edit present at that instant is included in `dist/` — inherent to the shared serial worktree; the build is re-runnable by any writer under the lock.
5. **The shared acceptance-matrix tool changed underneath this round.** An uncommitted edit to the Coordinator-owned `tools/writer-acceptance-matrix.py` added P6 guards (`SELF_REFERENTIAL_PROOF`, `NO_SUBJECT_MATCHED_DISCHARGE`, `INSUFFICIENT_GRANULARITY`). W01 **did not edit that tool** (outside its write partition). It adapted its own `writer-output/W01/PROOF_CATALOG.json`: `R-OBLIGATION-MANIFEST` and `R-OD-ZEROLOSS` were repointed from the self-referential `P-MATRIX-ZEROLOSS` to the new subject-matched `P-OBLIGATION-MANIFEST`, and the 6 rules that sweep `OWNER_DECISION` / `OWNER_QA_DEEP_AUDIT` rows were keyed on `obligation_id__contains` (their exact current row sets, so **no status changed**). Row counts are byte-for-byte the same as under the committed tool: 711/711, `327/356/26/2`. If the Coordinator reverts the tool change, this catalog still produces identical output.
6. **Four proof runs were needed** (transient, recorded): run 1 populated the new proof, run 2 exposed the replay-binding assumption in it, run 3 exposed the stale `obligation_id__contains` narrowing (5 rows momentarily unmatched), run 4 is the authoritative one above. Only run 4's `PROOF_RESULTS.json` is the handoff record; no earlier run's failure is hidden — all are visible in the tool's stdout history of this session.
