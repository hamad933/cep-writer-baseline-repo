# HANDOFF — RES-1 · W03-RESULTS (Results completion)

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Lane:** RES-1 (dependency lane; RUN-1 prerequisite proven) · **Branch:** `writer/mi-serial-lane/RES-1`
**Parent (rebound, verified):** `ed6e19a3f49e12e7c8faa71c608b9d227b3d3b5d` — `git rev-parse HEAD` equals it,
`git status --porcelain` empty at launch.
**Candidate source tree (canonical `stack/native-typescript`):** `8e2a3d51c6e92304130af11be1f554e01783ecbd15736b3a94012bd134c368e6`
(339 files) · **parent baseline tree:** `0c43d7f11631dc85c4cec60b20d8612ccdfebd0c72da1475dc78360245984abc` (338 files)
**Environment:** node v22.16.0 · Playwright 1.62.1 (chromium cached) · port 4174 checked free (`000`) and **not used** —
this lane needs no local runtime; all captures used ephemeral static servers, so no H-FAM-03 contention occurred.

---

## 1. Changed paths (own scope only)

| Path | Kind | Δ |
|---|---|---|
| `stack/native-typescript/surfaces/results/i18n.ts` | **NEW** | AR/EN string tables + `resultsLocale()`/`resultsT()` (pattern of `surfaces/{runs,labs,scenarios}/i18n.ts`) |
| `stack/native-typescript/surfaces/results/presentation.ts` | modified | 74 lines changed: locale/dir resolution, localized chrome, ownership-loop card, Replay attach guard, AAR real-content panels, Compare pinned-pair receipt, mode-key validation |
| `stack/native-typescript/surfaces/results/index.ts` | modified | 35 lines changed: injected-shared-owner identity checks, localized + refusal-aware *Capability state* read-out (deduped) |
| `stack/native-typescript/adapters/results/domain.ts` | modified | 23 lines changed: `recordedTimeline()` (read-only, reuses the thin timeline provider), boundary-safe `step()` |
| `writer-output/W03-RESULTS/**` | new outputs | reports, falsification, capture tooling, harness, evidence |

`git diff --stat` (source): `3 files changed, 97 insertions(+), 35 deletions(-)` + 1 new file.
**Nothing else was written.** `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`,
`dist-ts/**`, `main.ts`, `surfaces/m0-controller-composition.ts`, `foundation/**`, other lanes (incl. `surfaces/runs`),
`main`, `writer/mi-serial` untouched. `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json` were dirtied only by the
mandated `npm run build:runtime` / `npm test` and were restored with
`git checkout -- dist assurance stack/MEASURED_COMPARISON.json` before staging (see §7); the one generated
artifact my source produced there (`dist/surfaces/results/i18n.js`, untracked) was removed with it so `dist/`
matches HEAD exactly — the Controller's integrated rebuild regenerates it from `surfaces/results/i18n.ts`.

---

## 2. AUDIT FIRST (what existed — preserved, not rebuilt)

Salvage inspected before any edit: `adapters/results/domain.ts` (134 l), `adapters/results/timeline-replay-provider.ts` (63 l),
`foundation/timeline/replay{,-host}.ts`, `foundation/analytical/compare{,-host}.ts`,
`adapters/analytical/results-compare-provider.ts`, `writer-output/W03` flow shots
(`aar-compare`, `replay-causality` `-3da01fa0`) and `VISUAL_REAUDIT.md` (DEF-RES-1/2/3, H4, Q-4),
tests (`tests/surfaces/results`, S13, D09, CG4, D03C, analytical-compare).

**Verdict: the domain/data/provider layer was already real and good.** Sealed-record admission (rejects unsealed),
exact-ref/digest contradiction guards, AAR revision + conflict + anchor validation, candidate-evidence handoff ceilings,
the thin timeline provider (gap truth, no reconstruction), the results compare provider (exact pinned pair, schema/
comparator compatibility) and both shared owners are sound. **No domain engine, provider or owner was rebuilt.**

### Audit findings → disposition

| # | Sev | Finding | Root cause | Disposition |
|---|---|---|---|---|
| A1 | V2 | Results presentation had **zero Arabic strings** (packet §8 AR+EN first-class) | `STALE_DECISION`/`IMPLEMENTATION` | **FIXED** — new `i18n.ts`, direction never baked (`dir` follows explicit option → document dir → locale) |
| A2 | V2 | `composeResultsSurface` **ignored** `shared.timelineReplayOwner`/`shared.analyticalCompareOwner` — a split instance would render one owner while claiming another (only CG4 checked this, not the surface layer the live route uses) | `ARCHITECTURE` | **FIXED** — `RESULTS_TIMELINE_REPLAY_OWNER_SPLIT` / `RESULTS_ANALYTICAL_COMPARE_OWNER_SPLIT` refusal |
| A3 | V1 | Replay mode re-executed `results.replay` on every centre re-render → cursor silently reset to event 1 | `IMPLEMENTATION` | **FIXED** — `attachReplay()` re-attaches only when the selected exact ref actually changes |
| A4 | V2 | `domain.step(0)` / `step(NaN)` were coerced by `delta\|\|1` into a **real forward step** instead of being refused | `IMPLEMENTATION` | **FIXED** — pass-through to the shared owner; returns `{…state, accepted:false, code:'TIMELINE_STEP_INVALID'}` (found by falsification N2) |
| A5 | V2 | AAR view was a single textarea + history — no content derived from the sealed Result (packet §7 "no meaningful structure left empty") | `CONTENT_MODEL` | **FIXED** — `recordedTimeline()` panel (recorded event sequence incl. recorded GAP), provenance/run sources, anchored-event refs |
| A6 | V1 | Compare view showed no owner/pin receipt in its own region | `SURFACE_COMPOSITION` | **FIXED** — pinned-pair note, receipt owner in the heading, ownership card in the RIGHT pane |
| A7 | V2 | A **refused** capability request left no visible status (H4 Results half; `bus.execute` returns before `run`, so DEF-RES-3's note never fired) | `IMPLEMENTATION` | **FIXED** inside my root — availability refusals are recorded in the same read-out (deduped) |
| A8 | V2 | Shared `TimelineReplayHost` is **EN-only** | `SHARED_COMPONENT` | **REQUESTED** — `SERIALIZED_HOTSPOT_REQUEST.md#SH-R1` (foundation read-only) |
| A9 | V2 | Shared `AnalyticalCompareHost` **bakes `dir="rtl"`** and Arabic-only chrome | `SHARED_COMPONENT` | **REQUESTED** — `#SH-R2`; Results keeps surface-local compare chrome so both directions stay correct |
| A10 | V3 | Live route centre has no Replay/AAR/Compare views — blocked by `RESULTS_PROVIDER_UNAVAILABLE` (DEF-RES-1, W05) | `FIXTURE_DATA`/dependency | **UNCHANGED on purpose** — no Result fabricated (N3); H4 already filed by W03 (`#SH-R3`) |
| A11 | V1 | A second `mountM0ControllerComposition` in one page session would throw `ANALYTICAL_PROVIDER_DUPLICATE_ID` (fail-closed) | `ARCHITECTURE` | **RECORDED** — today there is exactly one boot-time mount (`main.ts:274`); no silent fallback exists |
| A12 | V0 | Reference file names appear swapped vs content (AAR-named file renders the Compare state) | `EVIDENCE/ORACLE` | **RECORDED** — hashes match the packet table; `cep-writer/**` read-only |
| A13 | V2 | `npm run check` gained a 2nd red `browser.current_candidate_claim_truthful` | `EVIDENCE/ORACLE` (stale receipt) | **RECORDED** — `assurance/BROWSER_CONFORMANCE_RECEIPT.json` is bound to the *parent* tree `0c43d7f1`; any source change invalidates it. `assurance/**` is read-only for this lane; the receipt is regenerated by the Controller at convergence against exact HEAD. |

## 3. COMPLETED WORK (packet §15 mission b — the ownership-loop presentation)

1. **Visible ownership loop** — every Results view (Result/Replay/AAR/Compare) now carries an
   `Ownership loop` card: replay owner `TimelineReplayOwner` · **instances = 1** · compare owner
   `AnalyticalCompareOwner` · **Review authority: none — Results never issues review decisions** ·
   **Replay executes runtime: false — HISTORICAL / INERT**.
2. **AAR / Replay / Compare bound to the shared owners** — Replay mounts the shared
   `TimelineReplayPresentationHost` on `domain.replayOwner`; Compare executes
   `results.compare` → `compareOwner.createPair/comparePair` on the **injected**
   `AnalyticalCompareOwner`; AAR anchors to the shared replay owner's selected recorded event.
   Composition now **refuses** a split instance (A2).
3. **Replay stays historical/inert** — no runtime path exists in Results; scrub/step/select only move
   the owner cursor (proven by hash before/after, §5 L1).
4. **Results acquires no Review authority** — no review methods on the domain, `reviews.*` refused on the
   Results bus, `truthCeiling.reviewDecision=false`, handoff `reviewDecisionPerformed=false` (§5 L3).
5. **AR/EN + RTL/LTR** (A1) and **real AAR content from sealed data** (A5), **refusal visibility** (A7).

---

## 4. FOUR TRUTHS (separate)

**Content truth** — Studio frames are explicitly labelled `RECORDED_CONSUMER_FIXTURE__NOT_PRODUCT_TRUTH`
(2 sealed fixture Results, 6+2 recorded events incl. a recorded GAP). All rendered content is derived from
those sealed records: recorded event sequence, provenance refs, source run, AAR revisions, exact compare
differences. Live route frames show only the surface's own truthful provider state — **no synthetic Result,
event, timeline or comparison** is created anywhere (N3).
Localized content verified from the DOM probes: AR chrome is Arabic (`حل الملكية`, `سلطة المراجعة`,
`لا سلطة — لا تصدر نتائج مراجعة أبدًا`), EN chrome is English; technical tokens (ids/digests/owner names)
stay `dir="ltr"` in both.

**Presentation truth** — Studio = 3-pane workspace (LEFT sealed-Result structure + facets, CENTER workbench,
RIGHT context inspector) with top mode tabs and a temporary-deep-work footer, composed from the packet's
regions. Mirroring proven on the captured bytes: EN `Enterprise` identity token at `x=32`, structure pane
`x=30`, ownership card `x=1151`; AR the same tokens at `x=1041` / `x=1208` / mirrored RIGHT pane
(tesseract 5.3.4 TSV boxes). Responsive at 1024×900 (2-col → stacked panes, no overlap; captured in both
locales). Honest ceilings: shared `TimelineReplayHost` chrome is EN-only (SH-R1), and the standalone
harness renders with system `Canvas` (light) because it is outside the product shell — the product route
supplies the shell theme.

**Behavior truth** — N1–N5 + L1–L4 all pass (§5). Ownership receipts are real: compare receipt
`owner=AnalyticalCompareOwner`, replay receipts `owner=TimelineReplayOwner`, AAR `factMutation=false`,
`results.step` refusal receipts are truthful rather than coerced (A4). The live route reports
`RESULTS_PROVIDER_UNAVAILABLE` / `DETERMINISM_PROVIDER_UNAVAILABLE` for all six commands and
`reviewAuthorityAvailable=false`.

**Domain-Data-Provider truth** — `W03ResultsDomain` (real, preserved) over `results.sealed-result.timeline`
(thin timeline provider, `canonicalHistory:true`, domain-owned truth) and `results.sealed-result.compare`
(compare provider `results-compare/1.0.0`, exact pinned pairs). **Live route provider state = `UNAVAILABLE`
(0 records)** — DEF-RES-1 remains blocked on W05; this lane deliberately did not seed it. Determinism stays
`DETERMINISM_PROVIDER_UNAVAILABLE` (no admitted execution provider). TimelineReplayOwner count stays 1
(single production instantiation `main.ts`, L2).

---

## 5. Tests + falsification

**Baseline (parent `ed6e19a`, tree `0c43d7f1`)** — `build:runtime` exit 0 · `npm test` **210/0** ·
`npm run check` **1 known red** (`browser.lineage_receipt_truthful`, documented in packet §0; the receipt
itself shows the **2 global Enterprise FAILs**, `executionStatus BLOCKED_OR_FAILED`, 4/6 — known, not mine) ·
`node tools/w03-browser-flows.mjs` **7/7 PASS** (incl. `results-aar-compare`, `replay-causality-timeline-scrub`) ·
packet tests: results domain, S13, D09, CG4×3, analytical-compare, analytical-compare-correction, D03C — **all PASS**.

**Final (candidate, tree `8e2a3d51`)** —
- `npm test` **210/0 twice, identical** per-test results (N5, 210 ids compared).
- Packet tests (9) **all PASS** · `node tools/check-duplicate-mechanics.mjs` **clean (N4)**.
- `node tools/w03-browser-flows.mjs` **7/7 PASS**; the two Results flow frames are byte-distinct
  (`results-aar-compare` `dd5d22b9…` vs `replay-causality` `98f1385f…`) so DEF-RES-3 stays closed.
- `npm run check`: identical to baseline **except** A13 (`browser.current_candidate_claim_truthful` now red
  because the browser receipt is bound to the parent tree). Every other id matches baseline exactly.
- Lane falsification `node writer-output/W03-RESULTS/falsification.mjs` → **7/7 PASS**:

| Row | Assertion | Result |
|---|---|---|
| N1 | `reviews.decide`, `reviews.supersede`, `evidence.admission`, `mastery.record`, `releases.compare`, `rq.compare` → `UNKNOWN_COMMAND`, `ok:false` on the Results bus | PASS |
| N2 | bad refs/digests/unsealed/provider-state/AAR anchors/negative or NaN step → exact refusals, cursor preserved | PASS (**found A4**) |
| N3 | provider absent → `UNAVAILABLE`, 0 records, timeline `UNAVAILABLE`/0 events, `recordedTimeline`/`aarProjection` throw, `results.replay` → `RESULTS_PROVIDER_UNAVAILABLE`, state stays `IDLE` | PASS |
| N4 | `check-duplicate-mechanics` | PASS (clean) |
| N5 | full suite twice | PASS (identical) |
| L1 | canonical hash `{records,listResults,aar}` + raw fixture bytes **before vs after replay, 5 steps, −1 step, scrubToFraction, selectEvent, compare** → identical; `replayExecutesRuntime=false` | PASS |
| L2 | exactly **one** production `new TimelineReplayOwner()` (`main.ts`); `'replay' in domain === false` | PASS (count = 1) |
| L3 | no `decide/reviewDecision/issueDecision/admit/recordMastery` on the domain; `reviews.decide` refused; handoff `reviewDecisionPerformed=false`; ceilings false | PASS |
| L4 | missing injected owner → refusal; provider registered on the injected instance; compare receipt owner/token; **split shared owners refused** (`…_OWNER_SPLIT`) | PASS |

Browser-level falsification (in `CAPTURE_RECEIPT.json.probes.scrub`): canonical sealed-facts hash
**identical before/after** an in-page scrub (`results.step` + `scrubToFraction(0.75)` + `selectEvent`) in both
locales, while `STUDIO_PROOF.sealedFactsUnchanged=true` and `aarAnalysisStateAdded=true` (AAR is separate
analysis state, `factMutation=false`).

---

## 6. Evidence (hash-bound to this candidate)

`writer-output/W03-RESULTS/CAPTURE_RECEIPT.json` — 20 shots, every one with path + sha256 + bytes + dims +
viewport + locale/dir + `commit` `ed6e19a…` + `tree` `8e2a3d51c6e9…`:

- `evidence/studio-{result,replay,aar,compare}-{en-ltr,ar-rtl}-{1440x1000,1024x900}.png` (16) — studio harness,
  labelled fixture, 4 modes × 2 locales × 2 viewports.
- `evidence/live-results-{en-ltr,ar-rtl}-{1440x1000,1024x900}.png` (4) — genuine live route `/?surface=results`
  (provider-unavailable truth + visible *Capability state* read-out).
- `final-flow-capture/` — 7 fresh W03 flow frames + `BROWSER_RECEIPT.final.json` (tree `8e2a3d51`, 7/7 PASS).
- `baseline-flow-capture/` — parent baseline (tree `0c43d7f1`, 7/7 PASS), retained as baseline evidence.
- `superseded-13b60f57/` — intermediate round, retained and labelled (never reused as current proof).
- Salvage shots `writer-output/W03/evidence/*-3da01fa0.png` **restored untouched** (the flow tool deletes
  them by design; each run's output was copied into this lane's directory and the tracked files re-checkout'ed).

**Vision-verification disclosure (capability separation, OD-20260915-038/072):** the image-display channel in
this session returned mismatched bytes for 3 of 4 reads (it served a reference/product-shell image when a
lane capture was requested). Rather than claim vision PASS, presentation verification used byte-level
ground truth on the actual captured files: tesseract 5.3.4 OCR text (EN frames), OCR token **coordinates**
for RTL mirroring, and DOM probes captured in the same page load. The mismatch itself is recorded here as an
environment limitation, not as a product defect.

---

## 7. Unresolved findings / STOP notes

- **Shared seams untouched → requests filed:** `writer-output/W03-RESULTS/SERIALIZED_HOTSPOT_REQUEST.md`
  (SH-R1 TimelineReplayHost i18n · SH-R2 AnalyticalCompareHost baked direction · SH-R3 = existing H4, not duplicated).
- **Owner/Controller questions recorded, not decided:** **Q-4 / A01-PF-007 `TimelineReplayOwner`
  retain-vs-retire** (open; only its single-instance invariant was measured); Owner-only items remain untouched
  (shell redesign, RQ reference promotion, F-048, destination-count freeze).
- **DEF-RES-1 remains BLOCKED on W05** — no sealed Result provider exists on the live route; fabricating one
  would be a product-truth violation, so the live centre truthfully reports unavailable.
- **A13** — `npm run check` shows one extra red vs baseline (`browser.current_candidate_claim_truthful`)
  purely because the Controller-owned browser receipt still binds the parent tree; regenerated at convergence.
- **Accepted ceiling:** live-route Results centre still comes from `m0-controller-composition.ts`
  (writer-forbidden); surfacing `renderResultsSurface` there needs the Controller's composition seam.
- `stack/native-typescript/surfaces/mastery/i18n.ts` was **verified tracked at HEAD and identical to HEAD**
  in this worktree (blob `1c695959…`, `git diff HEAD` empty, not ignored) — it is not an uncommitted artifact
  here and was never touched by this lane.

**ACCEPTANCE_STATUS: `NOT_OWNER_ACCEPTED`** — CANDIDATE_ONLY, sole Controller review required.
