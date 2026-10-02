# HANDOFF — LRN-1 / W02-LEARN (Learn surface continuation)

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Lane:** `LRN-1` · **Unit:** `W02-LEARN` · **Branch:** `writer/mi-serial-lane/LRN-1`
**Date:** 2026-10-02 · **Status:** `NOT_OWNER_ACCEPTED`

---

## 1. Identity

| Field | Value |
|---|---|
| Parent / required HEAD | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` (verified before any mutation: `git rev-parse HEAD` matches, `git status --porcelain` empty) |
| Parent git tree | `f22c70ce9597f07a9cf9ecb9bbc2ecd361fc3684` |
| Parent canonical source tree | `0c43d7f11631dc85c4cec60b20d8612ccdfebd0c72da1475dc78360245984abc` (338 files) |
| **Candidate canonical source tree** | **`9b8572156d1831eab3f273432aa8d978d862f92d613f915f4b49e791457e6746` (338 files)** |
| Node | `v22.16.0` (engines) |
| Build | `npm run build:runtime` → PASS |
| Branch pushed | see §9 |

The candidate tree is the canonical source identity of the two changed product files plus the untouched
parent source; it is the value the W02 flow receipt also reports (`tree 9b8572156d18…`).

---

## 2. Changed paths (exactly the sealed row's roots)

| Path | Change |
|---|---|
| `stack/native-typescript/adapters/learn.ts` | F04 `metadata.libraryIndependent` `false` → `true`; two-tier Learn source admission added |
| `stack/native-typescript/surfaces/learn/composition.ts` | DEF-L04 donor scope-switch suppression made effective + correctly scoped |
| `writer-output/W02-LEARN/**` | report, HANDOFF, falsification/probe instruments, v4-before/v4/v4-crops evidence |
| `writer-output/W02-LEARN/capture.mjs` | writer-local instrument: `waitUntil` `networkidle` → `domcontentloaded` + consumer-identity (reason in its manifest) |

No other path was written. `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json` and `writer-output/W02/`
were touched only by build/test/flow side effects and are restored before commit (mission step 6).

**Why each edit is in-scope**

* **F04** — the metadata lives in `adapters/learn.ts`, inside the lane's writable roots, so it was fixed
  directly rather than raised as a hotspot. `profiles/learn.json` declares
  `domain_implementation: LEARN_DOMAIN_ADAPTER_LIBRARY_INDEPENDENT`, the learn path imports no
  `library-fixtures`, and `adapters/structured-documents.ts` already writes `libraryIndependent:true`
  for learn — the `false` value was stale against the actual architecture.
* **DEF-L04** — `surfaces/learn/` is a writable root. The prior "fix" only set `hidden`/`inert`, which the
  shared `.contextscope{display:grid!important}` rules defeat, so the Library KU/block scope pills were
  still painted on the Learn route in both locales. The suppression now forces `display:none!important`
  and no longer suppresses Learn's own Context detail tabs (they were `hidden`+`inert` while still
  rendered — an accessibility mismatch).
* **Two-tier admission** — see §5 (N1/N3). It is the narrowest change that satisfies both existing
  Controller test expectations without editing any read-only file.

---

## 3. Salvage preserved (never restarted, reverted, reset or deleted)

* `writer-output/W02-LEARN/evidence/v1/` (4 frames + `CAPTURE_MANIFEST.json`) — retained, labelled superseded.
* `writer-output/W02-LEARN/evidence/v2/` (4 frames + manifest) — retained, labelled superseded.
* `writer-output/W02-LEARN/evidence/v3/` (8 frames + manifest, 4 viewports × 2 locales) — retained, labelled superseded.
* `writer-output/W02-LEARN/capture.mjs`, `dbg.mjs` — retained; `capture.mjs` edited only for the wait
  strategy (recorded in its manifest `waitUntil` field).
* `writer-output/W02-LEARN/VISUAL_EXECUTION_REPORT.json` — **continued in place**, not rewritten from zero:
  the prior `STAGE`, reference block, DEF-L01/L02/L03/L05/L06/L07 history and the v1 evidence block are
  carried forward, with the staleness and vision conflicts resolved (§4).
* Prior report's H03 ceilings and `NOT_OWNER_ACCEPTED` carried forward unchanged.
* Existing Bidi flow PASS lineage and CP-003 items referenced, not overwritten.

---

## 4. Conflicts resolved (the sealed mission's two open items)

### 4.1 Report-vs-manifest staleness — **RESOLVED**
The report claimed *"v2 fixes applied, awaiting rebuild + recapture"* and `RECAPTURE_STATUS: BLOCKED
(transient shared build red: MASTERY_CAUSAL_LAW)`, listing only v1 evidence — while
`evidence/v3/CAPTURE_MANIFEST.json` already held **8 hash-bound frames** captured 2026-09-30T19:14Z.

Adjudicated, not assumed:
* every v3 frame's sha256 was recomputed locally and equals its manifest value;
* the v3 probes show DEF-L01..L05 present (single `#domainLeftRegion` child, bilingual toolbar commands,
  donor scope switch carrying `hidden`, localised BOTTOM);
* the transient shared-build red no longer exists — `npm run build:runtime` is green at this HEAD.

**Outcome:** report superseded (`STALENESS_CONFLICT_RESOLVED` field); v1/v2/v3 retained in place and
labelled `SUPERSEDED_BY_V4`; current evidence is `v4-before` (exact parent content) and `v4` (candidate).

### 4.2 `VISION_VERIFICATION: OPEN_CONFLICT` — **RESOLVED**
The earlier vision read returned a frame that did not match the manifest bytes, so all visual claims were
demoted to probe + OCR. This lane reopened it and actually inspected the bytes:

* sha256 recomputed locally first, then the image opened on the vision channel:
  `v4-before/learn-en-1440x1000` (`9c3c43e2…`), `v4/learn-en-1440x1000` (`05112c59…`),
  `v4-crops/after-toolbar.png` (`7a070e8d…`);
* `v4-before` shows the two Arabic Library scope pills under *Prerequisites UNKNOWN*; `v4` shows the same
  region without them;
* independently confirmed by an **objective pixel diff** (13,232 px, bbox `[1033,653,1427,688]`) and by the
  toolbar crop being **byte-identical** before/after.

### 4.3 `MITIGATED_NOT_RESOLVED` (DEF-L07, needs R6) — **CLOSED WITHIN LANE SCOPE**
The mitigation is now *proven*, not asserted (N3 battery + real-route probe, §5), and **no synthetic or
fixture content is rendered anywhere**. The remaining R6 canonical-source binding (main.ts + a canonical
Learn provider) is **outside LRN-1's writable roots**: recorded as an out-of-root dependency, **not
claimed, not performed, no false receipt**.

### 4.4 H03 residual `F04` — **CLOSED** (metadata was inside the writable root)

### 4.5 Responsive / RTL pending — **CLOSED**
Fresh captures at **1440×1000 and 1024×900 × {en, ar}** (the report's old "1024×800 compact pass pending"
line is superseded), zero horizontal overflow in every frame, collapsed-state comparison performed,
`RTL_LTR_STATUS` PASS with `unicode-bidi:isolate` verified on computed styles.

---

## 5. Tests and falsification — reported per truth category

### CONTENT truth
| Check | Result |
|---|---|
| `npm run build:runtime` | PASS (323 dist files written) |
| `npm test` (`test-models`) | **210 / 0**, run twice |
| `tests/surfaces/learn/surface.test.mjs` | PASS, 22 cases |
| `stack/.../rescue/S08_W01_W02_LIBRARY_LEARN` | **17 / 17 PASS** |
| `rescue/CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH` | **LEARN half PASS** (was FAIL at baseline on `assert.throws`); **RQ half FAIL** — `RQDomainAdapter` now requires `analyticalCompareOwner`, test supplies none; `adapters/rq/**` + `tests/**` read-only → recorded (§8) |
| `post-c03/LCORR01` | 29 / 29 PASS |
| `post-c03/LCORR03` | 14 / 15 — only `C3-002 main-avoids-duplicate-spatial-view-on-enterprise` (Enterprise, identical to baseline, not this lane) |
| `post-c03/D08`, `post-c03/D05` | 10 / 10, 23 / 23 PASS |
| `rescue/CG3_W01_W02_COVERAGE` | PASS |
| **N5** suite twice identical | model suite twice → identical `tests` arrays (byte-equal JSON); learn surface test twice identical; S08 twice identical |
| **N4** `node tools/check-duplicate-mechanics.mjs` | `status: PASS`, `findings: 0` — no duplicate owner introduced |
| `npm run check` | exit 1 with exactly **2** reds: `browser.lineage_receipt_truthful` (the documented expected known red while the Enterprise defect is open) and `browser.current_candidate_claim_truthful` (assurance receipt bound to the parent source tree — invalidated by *any* lane source delta; `assurance/` is reverted per mission step 6, regeneration is the Controller-owned CONVERGENCE step) |

### BEHAVIOR truth
| Check | Result |
|---|---|
| **N1** non-owned route refuses | `writer-output/W02-LEARN/FALSIFICATION.json` → `N1.learn-registers-only-learn-owned-routes`, `N1.foreign-route-execution-refused` (`library.insert`, `library.save`, `mastery.states`, `visualize.viewport`, `rq.compare` all refused; Learn document byte-unchanged), `N1.cross-surface-block-edit-refused-or-inert` — **PASS** |
| **N2** boundary input safe | `N2.boundary-source-inputs-fail-closed` (empty object / missing activity / missing document revision / non-array blocks / null source → all `available:false`, document id `learn-unavailable`, `realConsumer:false`), `N2.boundary-learn-commands-do-not-corrupt-document` (missing block id, unknown patch key, blank answer → `ANSWER_REQUIRED`, review without attempt, `<script>` outline query never reaches the document) — **PASS** |
| Route behavior | route boots `consumer=learn`, **zero page errors in every captured frame**, command binding unchanged (`LearnDomainAdapter` / `StructuredTransactionHistoryRecoveryOwner` / `learn.open,learn.edit,learn.practice,learn.review`) |
| Bidi flow substance | `spatial-input-bidi-preference-and-structured-isolation` itself is **RED at exact HEAD for a reason outside this lane** (§8). Its Learn/BIDI/structured-isolation substance is re-executed and **PASS** in `LANE_BROWSER_PROBE.json` (20/20), including `BIDI.en/ar-locale-drives-lang-and-dir`, `BIDI.dom-isolate-evidence`, `BIDI.isolate-rule-present`, `LANE.learn-structured-domain-isolation`, `LANE.learn-host-kind-donor-free` |

### DOMAIN-DATA-PROVIDER truth
| Check | Result |
|---|---|
| **N3** missing canonical provider → truthful unavailable, never synthetic | `N3.unbound-provider-is-truthfully-unavailable` (truth `UNAVAILABLE_PROVIDER_UNBOUND`, `learn.edit`/`learn.practice` disabled, `learn.practice` refuses `LEARN_CANONICAL_SOURCE_UNAVAILABLE` with `masteryWrite: undefined`, zero banned tokens in document **and** context descriptor), `N3.synthetic-classification-is-hard-rejected`, `N3.non-production-truth-fails-closed-not-throws` — **PASS**; on the real route: `N3.learn-route-renders-truthful-unavailable-not-synthetic` and `N3.learn-route-has-no-synthetic-learning-content` — **PASS** |
| **Lane-specific falsification** — seed Library-only KU/scope-switch data → Learn unchanged | `LANE.library-kU-scope-seed-does-not-reach-learn` (Library composition seeded with `KU-D03-0001` + scope-switch working edits; Learn document and metadata byte-identical before/after; no KU/LIB-SEED/`الوحدة`/`الكتلة المحددة` tokens anywhere; `libraryIndependent === true`) — **PASS**. On the real route: visit Library (seed present, `SEED.library-route-exposes-library-only-KU-and-scope` PASS) → visit Learn → `LANE.learn-no-library-KU-list-after-library-seed`, `LANE.learn-no-library-search-state`, `LANE.learn-no-KU-identifiers-in-rendered-text`, `LANE.learn-donor-scope-switch-suppressed-not-visible`, `LANE.donor-scope-stays-suppressed-after-EN/AR-flip` — **all PASS** |
| `LANE.learn-context-descriptor-owns-no-library-scope`, `LANE.learn-own-context-detail-tabs-remain-live` | PASS |
| **H03 ceiling** | `LANE.h03-ceiling-held-no-relation-propagation-claim` PASS. PROP/FALSIFY remain **NOT_PROVEN**; no relation propagation or proof is claimed anywhere. |
| Falsification totals | `FALSIFICATION.json` **11 / 11 PASS**; `LANE_BROWSER_PROBE.json` **20 / 20 PASS** |

### Browser flows (`node tools/w02-browser-flows.mjs`)
* **Baseline run at the parent tree, 2026-10-02T04:55:53Z (canonical source `0c43d7f1…`)** — 10 flows ran:
  **5 PASS / 5 FAIL**. PASS: `library-edit-learn-consume-real-consumer-chain`, `fit-pan-zoom…`,
  `focus-document-activeElement-proofs`, `s01-structured-insertion…1440`, `s01-structured-insertion…1024`.
  FAIL: `relation-route-convergence-and-label-scope` + `central-change-reuse` (the two known global fails,
  NOT this lane), `spatial-select-connect-canonical-edge`, `spatial-input-bidi-preference-and-structured-isolation`,
  `spatial-closure-1024x900`. Surviving screenshot bytes are hash-recorded in
  `writer-output/W02-LEARN/evidence/BASELINE_W02_FLOW_RUN_20261002T045553Z.json`.
* **Candidate runs from 2026-10-02T05:25Z onward — ENVIRONMENT-blocked** (see §8). 7–8 of 10 flows fail with
  `page.goto … waitUntil:'networkidle'` timeouts; the only flows that complete are the two `s01-…` flows,
  which navigate with `domcontentloaded`. This is **not** a product regression: the same routes render
  correctly under `domcontentloaded + consumer-identity` (all v4 frames, lane probe 20/20).

---

## 6. Evidence (hash-bound, exact candidate/parent binding)

| Evidence | Path |
|---|---|
| BEFORE capture (exact parent content, `writableRootDiff` empty) | `writer-output/W02-LEARN/evidence/v4-before/CAPTURE_MANIFEST.json` + 4 frames |
| AFTER capture (candidate delta) | `writer-output/W02-LEARN/evidence/v4/CAPTURE_MANIFEST.json` + 4 frames |
| Objective pixel diff + L4 crops | `writer-output/W02-LEARN/evidence/v4-crops/` |
| Falsification battery (N1/N2/N3/N4/N5 + lane) | `writer-output/W02-LEARN/FALSIFICATION.json` |
| Lane browser probe (Learn/BIDI/isolation + Library seed) | `writer-output/W02-LEARN/LANE_BROWSER_PROBE.json` + `evidence/lane-probe/` |
| Baseline flow-run artifact identities | `writer-output/W02-LEARN/evidence/BASELINE_W02_FLOW_RUN_20261002T045553Z.json` |
| W02 flow receipt copy | `writer-output/W02-LEARN/evidence/BROWSER_RECEIPT.final.copy.json` |
| Superseded v1/v2/v3 (retained) | `writer-output/W02-LEARN/evidence/v{1,2,3}/` |
| Machine-readable report (§12 of the standard, all fields) | `writer-output/W02-LEARN/VISUAL_EXECUTION_REPORT.json` |

**Determinism / lineage cross-checks (independent, byte-level):**
1. `v4-before/learn-ar-1440x1000` = `b22c7fc8…` **byte-identical** to the salvaged v3 `ar-1440x1000` frame (2026-09-30).
2. `v4-before/learn-en-1440x1000` = `9c3c43e2…` **byte-identical** to the baseline flow's *Learn second consumer* shot at the parent tree (2026-10-02T04:55:53Z).
3. `v4/learn-en-1440x1000` = `05112c59…` **byte-identical** to the lane probe EN/LTR shot.
4. Diff at 1440×1000 = **13,232 px at `[1033,653,1427,688]`** (EN and AR identical); at 1024×900 = **0 px / byte-identical**.
5. Toolbar crop before/after = **identical sha256** `7a070e8d…` (proves DEF-L08 is pre-existing, not introduced).

---

## 7. Four truths, separately

* **Content truth** — the Learn centre is a real learning-workbench projection of the Learn domain: Journey
  path rail, path progress, objective callout, practice lifecycle, assessment/lab briefs, source-truth card.
  Nothing is invented: with no canonical provider the document id is `learn-unavailable`, the classification
  is `UNAVAILABLE` and the rejection reason is `LEARN_PROVIDER_UNBOUND`. **Ceiling: no synthetic/fixture
  learning content is ever rendered.**
* **Presentation truth** — `OWNER_CONFIRMED_FINAL_REFERENCE` at sha256 `5fa530e7c9506fd7` is construction
  authority. L1–L4 completed against the actual bytes. Status `PASS_WITH_DEFECTS`: DEF-L04 closed this lane;
  DEF-L06 and DEF-L08 are shared-component and open. `ACCEPTANCE_STATUS: NOT_OWNER_ACCEPTED`.
* **Behavior truth** — commands, availability and refusals are asserted, not assumed (N1/N2/N3). A disabled
  command refuses with its exact code; a refusal carries no `masteryWrite`; no foreign route is accepted;
  boundary input never corrupts the document.
* **Domain-Data-Provider truth** — Learn consumes no canonical provider today and says so. Library KU/scope
  data does not reach Learn (node-level + real-route seeding both PASS). `metadata.libraryIndependent` now
  matches the actual library-independent architecture (F04). Learn completion never infers Mastery
  (`mastery: NOT_INFERRED` everywhere). H03 PROP/FALSIFY stay **NOT_PROVEN**.

---

## 8. Unresolved findings (truthful; none hidden)

1. **`spatial-input-bidi-preference-and-structured-isolation` is RED at exact HEAD** — its *first*
   assertion `spatial.canvas-has-bounds` fails with `{w:664,h:0}`. Probe evidence: the flow only sets
   `#spatialHost.hidden=false` while Visualize stays in its **default TREE view**, where `render()` never
   calls `spatialView.render()`, so the svg has no size (host h=2, canvas h=0). The flow would need
   `visualize.view.canvas`/`graph` first (as `spatial-closure-1024x900` correctly does).
   `tools/w02-browser-flows.mjs` and `surfaces/visualize/**` are **read-only for LRN-1** → classified
   **HARNESS/ORACLE, out of roots**. The flow's Learn/BIDI/structured-isolation substance is re-executed
   and PASS in `LANE_BROWSER_PROBE.json` (20/20). *This contradicts matrix row 22's "PASS at exact HEAD";
   the matrix appears to rest on the committed receipt captured at `072343e`, not at `fe1bb98`.*
2. **`spatial-select-connect-canonical-edge` and `spatial-closure-1024x900` RED** — stale selector
   `.visualize-object-list [data-visualize-select]`; the Visualize LEFT region now renders
   `.vis-objectlist > .vis-objectrow` (recomposition between `072343e` and `fe1bb98`). Out of roots.
3. **Browser-flow suite ENVIRONMENT-blocked since 2026-09-30… specifically since 05:17:14Z**, when a
   concurrent lane's `stack/local-runtime/server.mjs` bound the shared fixed port **127.0.0.1:4174**.
   The app's `/v1/platform/input-direction` probe gets `503` whose browser response **never completes**
   (`nav-probe.mjs`, `net-probe.mjs` evidence; `/v1/capabilities` and `/v1/persistence/bootstrap` finish
   normally), and the bridge retries — so Playwright's `waitUntil:'networkidle'` never settles.
   Classification **ENVIRONMENT (cross-lane)**; other lanes' processes were **not** touched.
   Recovery ladder used per OD-038/OD-072: browser launch ✓, render ✓, DOM/JS ✓, screenshot ✓,
   genuine-route identity asserted via `CEPFoundation.consumer===learn` ✓, navigation failure isolated to a
   single external listener ✓, all this lane's own instruments switched to `domcontentloaded` + consumer
   identity ✓. The read-only flow tool could not be adapted.
4. **`CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH` RQ half** — `new RQDomainAdapter(records)` throws
   `RQ_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED`; the test supplies no owner. Pre-existing (it was masked
   at baseline by an earlier LEARN failure). `adapters/rq/**` and `tests/**` are read-only → recorded.
   *Note: the LEARN half of this test was genuinely red at baseline and is now green.*
5. **DEF-L06** shared chrome is not locale-clean under EN (Arabic-only structured toolbar labels
   `تحرير / قراءة / عرض مساحة العمل / طي الكل`), shared `direction:!important` pane headings, and the
   compact banner suppressing the reference's meta/tag row. Local mitigation only; full fix is the shared
   shell/top-region owner.
6. **DEF-L08** shared toolbar overlap: `bdi#toolbarKuId` (`learn-unavailable`, x649–751) over
   `span#toggleAllWorkspaceLabel` (`طي الكل`, x678–732). Pre-existing (byte-identical before/after).
7. **`npm run check` second red** — `browser.current_candidate_claim_truthful`: the assurance browser
   receipt is bound to parent source tree `0c43d7f1…` while the candidate is `9b857215…`. Any lane source
   delta causes this; `assurance/` is reverted per mission step 6, so regeneration belongs to the
   Controller's CONVERGENCE step from the exact candidate HEAD. **Not faked green.**
8. **Committed `dist/foundation/extensions.css` is stale vs its own source** at the parent
   (`justify-content:center` in the committed dist vs `safe center` from a fresh build), so a freshly built
   dist renders the shell destination strip slightly differently from the salvaged v3 frames
   (pixel diff bbox `[232,0,1098,45]`). Build-authority observation, out of LRN-1 roots.
9. **`LCORR03 C3-002`** (duplicate SpatialView on Enterprise) still fails — Enterprise/SH-1 territory,
   unchanged from baseline.

---

## 9. Owner / STOP notes (record-only, nothing decided here)

* **Not attempted, per §0 of the DAG:** shell redesign (`OWNER-20260910-010`), RQ reference promotion
  (`REVIEWED_FINAL_CANDIDATE`), Visualize `F-048` hierarchy projection, destination-count freeze
  (`C03-GATE-023`).
* **H03 ceilings:** `H03-R2-PROP-001` / `H03-R2-FALSIFY-001` remain **NOT_PROVEN**. The only path to close
  them is the dedicated serialized proof cycle `H03R2-1` after LIB-1 + LRN-1. Nothing in this lane claims
  relation propagation or proof.
* **R6 canonical Learn source binding** — out of roots; recorded as a dependency, not performed.
* **Shared-component hotspots (no edit attempted):** DEF-L06 (shared chrome localisation + compact banner
  meta row) and DEF-L08 (toolbar KU-id chip vs *Fold all* overlap) → route to W01-SHELL / shared foundation.
* **Read-only boundary honoured:** no write outside
  `stack/native-typescript/surfaces/learn/`, `stack/native-typescript/adapters/learn.ts`,
  `stack/native-typescript/adapters/context-learn-structured.ts` (untouched — no change was needed),
  `writer-output/W02-LEARN/`. No `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`,
  `authority/**`, `dist-ts/**`, other lane, `main` or `writer/mi-serial` mutation. No secret handled.
* **No self-acceptance:** status stays `NOT_OWNER_ACCEPTED`.

---

## 10. Recommended Controller actions

1. Regenerate `assurance/BROWSER_CONFORMANCE_RECEIPT.json` from the exact candidate HEAD at CONVERGENCE
   (clears `browser.current_candidate_claim_truthful`; the `browser.lineage_receipt_truthful` red stays
   until Enterprise closes, as documented).
2. Route DEF-L06 and DEF-L08 to the shared shell/toolbar owner; route the two W02 flow defects
   (stale `.visualize-object-list` selector, missing spatial view activation) to the harness owner.
3. Re-verify matrix row 22's "PASS at exact HEAD" claim for
   `spatial-input-bidi-preference-and-structured-isolation` — it does not hold at `fe1bb98`.
4. Confirm whether `CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH`'s RQ half should be updated by the RQ owner.
