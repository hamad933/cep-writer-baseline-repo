# CLOSURE-T3 HANDOFF — R-02 + R-04 + R-05 shared locale and spatial presentation

- **Task**: Blueprint T3 = residuals R-02 (shared chrome Arabic-under-EN + HS-REL-1-03) + R-04 (SH-R1/R2 shared hosts) + R-05 (shared spatial defects D-04/D-06/D-08/F-SH1-02/B-4), executed serially in the Primary session on `recovery/convergence-w1` → `writer/mi-serial`.
- **Classification**: `CANDIDATE_ONLY__NOT_OWNER_ACCEPTANCE` — OFFLOAD-04/05 (Owner ChatGPT audits) remain `READY_FOR_CHATGPT`; this handoff does not claim absolute zero-gap.
- **Spec**: `controller/12_execution/FINAL_REMAINING_WORK_EXECUTION_BLUEPRINT_2026-10-02.md` §R-02/§R-04/§R-05 + the four hotspot requests (W05-RELEASES HS-REL-1, W03-RESULTS SH-R1/SH-R2, W03-ENTERPRISE D-04/D-08, W01-SHELL F-SH1-02, W02-VISUALIZE D-06).
- **Evidence dir**: `writer-output/_coordinator/closure-T3/` (receipts, censuses, probes, captures, harness copies).

## Writable-set compliance

| File | Why writable |
|---|---|
| `stack/native-typescript/foundation/accepted-runtime.ts` | R-02 `WRITABLE_PATHS` |
| `stack/native-typescript/foundation/global/bottom-shelf.ts` | R-02 `WRITABLE_PATHS` |
| `stack/native-typescript/foundation/analytical/compare-host.ts` | R-04 "the two host files" |
| `stack/native-typescript/foundation/timeline/replay-host.ts` | R-04 "the two host files" |
| `stack/native-typescript/foundation/spatial/**` | R-05 `WRITABLE_PATHS` (only `presentation.ts` touched) |

No `surfaces/**`, no `tools/**`, no `common`, no `dist` except via build, no hand-edited `dist/index.html`. CRLF line endings of `accepted-runtime.ts` and `spatial/presentation.ts` preserved (whole-file churn caught in self-review and rebuilt surgically). Diff scope proof: `STATIC_GREP_PROOFS.txt`.

---

## TRUTH 1 — Presentation (visual)

| Claim | Evidence |
|---|---|
| EN census (23 routes, 1440×1000, product locale path): **0 visible Arabic entries originate in the two R-02 writable files** (713 visible total = 522 `dist/index.html` static → R-03/T6, 8 proven cross-file literal collisions with cited emitters outside the writable set, 183 other-ts/composed origins) | `EN_CENSUS_FINAL.json` + `CENSUS_CLASSIFICATION_RECEIPT.json` |
| Before-census (same 23 routes, pre-fix build): 807 visible; per-file attribution pinned in-scope fixes (44 census-visible texts / 16+ lines in accepted-runtime; full bottom-shelf; both hosts) | `EN_CENSUS_BEFORE.json`, `IN_SCOPE_FIXLIST.json` |
| AR census sanity (6 representative routes, flipped through the product's Settings path): 682 visible Arabic, `lang=ar` on every record — AR output intact | `AR_CENSUS_SANITY.json` |
| D-04: status chip no longer shares the id baseline (own row y=46; suppressed-when-subtitle case carries status in aria-label); unit + DOM probes across enterprise/visualize/labs/scenarios = 0 id/status overlaps | `T3_PROBE_RECEIPT.json` rows `D-04.unit.*`, `R-05.D-04.DOM.*` |
| D-06: node title static-ellipsized to the 97px card region with full-value `<title>` tooltip; enterprise DOM: all titles ≤ budget (measured `getComputedTextLength`), truncated ones carry full tooltip | `T3_PROBE_RECEIPT.json` `D-06.unit.*`, `R-05.D-06.DOM.*` |
| D-08: readout follows container direction (AR → `direction:rtl`, mirrors to physical right via `inset-inline-start`; EN → left) — in-root override `0-4-0` outranks `extensions.css` and surface overrides | `T3_PROBE_RECEIPT.json` `R-05.D-08.readout-follows-direction`, `d08-ar.png` |
| R-04 captures: shared hosts × {ar/rtl, en/ltr} × {1440×1000, 1024×900} — studio result/replay/aar/compare + live results route, 20 PNGs hash-bound to the source tree | `evidence/*.png`, `CAPTURE_RECEIPT.json` |
| Baselines for before-state: ENT-1 probe JSONs (commit `766ab95`, D-04/D-08 measured), VIS-1 D-06 note, SH-1 `after/manifest.json` (F-SH1-02 interception + dispatched-dblclick route), `EN_CENSUS_BEFORE.json` | cited in each defect row below |

## TRUTH 2 — Behavior (interaction)

| Claim | Evidence |
|---|---|
| **HS-REL-1-03**: locale flip AR→EN→AR through the real Settings control updates the mounted shelf (summary + bottom title), pane-toggle labels and workspace-toggle labels **live, without reload** (timeOrigin + workspace identity unchanged); panel self-closes after a locale change (product behavior, recorded) and was reopened for the flip back | `T3_PROBE_RECEIPT.json` `R-02.HS-REL-1-03.live-locale-flip...`, `flip-after.png` |
| F-SH1-02: a **real mouse dblclick** at 1024×900 on the first visible relation label opens the relation composer; interception by a later edge's 18px hit-target is rescued by a capture-phase pointerdown/dblclick rescue in `mountSpatialPresentation` (event listener, no observer) with bbox + visibility checks so a hidden label can never steal the event | `T3_PROBE_RECEIPT.json` `R-05.F-SH1-02...`, `fsh102-composer.png` |
| R-04 flows: `results-aar-compare` + `replay-causality-timeline-scrub` (+5 more) PASS | `BROWSER_RECEIPT.json` (7/7) |
| Replay invariant: canonical hash before/after scrub identical, `TimelineReplayOwner` single instance, injected compare owner, no review authority (L1–L4 + N1–N3) | `res1-falsification` rows (7/7 PASS) |
| No MutationObserver/IntersectionObserver/ResizeObserver added by the T3 diff (REV-1 starvation guard); shelf re-derives on the existing preference path via a single microtask | `STATIC_GREP_PROOFS.txt` |

## TRUTH 3 — Domain / data / provider

| Claim | Evidence |
|---|---|
| Canonical store sha256 unchanged after canvas operations (`db2be05e…` before == after, representation projection did change) | `FALSIFICATION_RECEIPT.json` (VIS copy, 16/16) |
| Replay historical/inert; hosts use the injected owners; ceilings untouched — no domain file in the diff | diff scope in `STATIC_GREP_PROOFS.txt`; res1 rows L1/L2/L3/L4 |
| Shelf truths unchanged (read-only projection, `AUTOSAVE != EXPLICIT SAVE != RECOVERY`, ceilings false): only display strings converted; `git diff` shows no truth-string/logic change beyond `T()` pairs, the locale microtask, and the spatial presentation fixes | full source diff reviewed (self-review phase) |
| Model tests untouched in substance: `assurance/MODEL_TEST_RESULTS.json` reverted (receipt-churn policy); conformance receipt/manifest/PNGs kept as source-bound evidence | git status + commit contents |

## TRUTH 4 — Product language (AR+EN first-class)

| Claim | Evidence |
|---|---|
| Every display string on every **census-touched line** of the writable files is now a `{ar,en}` pair rendered at read time (rule: touched lines fully localized; untouched lines byte-identical; non-rendered palette `keywords` exempt) | `STATIC_GREP_PROOFS.txt` rule line + touched-line audit; `EN_CENSUS_FINAL.json` |
| AR still fully Arabic under the product's own locale path (682 visible, lang=ar) | `AR_CENSUS_SANITY.json` |
| Host chrome + direction follow the document locale in both directions (SH-R1/SH-R2) | `CAPTURE_RECEIPT.json` captures ×2 locales; `STATIC_GREP_PROOFS.txt` (no baked dir) |
| EN-only technical identity field labels in compare-host (`Provider`, `Pair`, `Identity / Provenance`…) were **never** in SH-R2's cited defect scope ("Arabic-only headings + baked dir") and are retained as technical vocabulary — recorded as a bounded observation for the Owner, not silently expanded | `writer-output/W03-RESULTS/SERIALIZED_HOTSPOT_REQUEST.md` SH-R2 block |

---

## Defect-by-defect closure

### R-02 (SHFP-1) — shared chrome Arabic-under-EN + HS-REL-1-03
- **Census** (blueprint step 1, durable before mutation): `EN_CENSUS_BEFORE.json` (23 routes) → fix list `IN_SCOPE_FIXLIST.json` → post-fix `EN_CENSUS_FINAL.json` with **0 in-scope misses** (cited cross-file collisions proven by emitters).
- **Fix**: render-time `T(ar,en)` pairs in `accepted-runtime.ts` (pane toggles, lens/inspector/center projections, fixture header, shelf fallback, palette, init chrome, note windows, save states…) and `bottom-shelf.ts` (all tab/recovery/operational content + closed-state summary).
- **HS-REL-1-03**: `applyPreferenceSnapshot` now schedules `{syncPaneCSS, updateAllWorkspaceToggleControl, syncBottomShelfTitle, renderBottom}` in a **microtask** — the settings path writes `lang/dir` after the snapshot returns, so the microtask re-derives mounted shelf/pane copy live. No observer (REV-1), single-pass, idempotent.
- **Out-of-origin list (feeds R-03/T6 + follow-ups)** — from `CENSUS_CLASSIFICATION_RECEIPT.json`:
  - 522 visible → `dist/index.html` static → **R-03/T6** (already routed).
  - `foundation/structured/presentation-bridge.ts` (33 exact + ~49 composed: block handles/body, toggle triggers, counts) → **new residual T3-X2** (structured editor chrome AR-under-EN).
  - `adapters/processing-runtime.ts` (29), `surfaces/validation/index.ts` (24), `adapters/health-runtime.ts` (18) → **T3-X1 family** (adapter chrome, W05/processing/validation roots).
  - `foundation/global/top-region.ts` (5, reference-return suffix), `foundation/structured.ts` (2), `main.ts`/`learn`/`manual_ai`/`audit` bilingual strings, `cep-destinations.ts`, `library-outline-descriptor.ts` → routed to their canonical owners.
  - Hidden-but-interaction-gated Arabic inside untouched writable lines (block menu 306, dialogs 171/545, toasts, drag preview pre-fix) → recorded as follow-up candidate **T3-X3** (census-invisible; not required by step 2).
- **Falsification**: injected raw Arabic token into the live shelf summary → census detected it (`INJECTION_CENSUS.json`, `FALSIFICATION PASS`); injection reverted (diff clean).

### R-04 (SH-R1/SH-R2) — shared hosts
- `replay-host.ts`: EN-only chrome → `{ar,en}` pairs (state copy, placeholders, controls, detail rows, aria-labels); host renders per document locale.
- `compare-host.ts`: constructor `locale='ar'` default removed (document-derived), `setAttribute('dir',…)` now locale-conditional, `.ac-diffs{direction:rtl}` removed, all Arabic headings/table headers/state/kind/aria → `L(ar,en)`.
- Grep proof: **zero** `dir="rtl"`/`direction:rtl` literals in both hosts (`STATIC_GREP_PROOFS.txt`).
- Invariants re-run: res1 L1–L4 + N1–N3 (7/7), flows `results-aar-compare` + `replay-causality` PASS, captures ×2 locales.

### R-05 — shared spatial
- **D-04**: status chip moved to its own baseline row (y=46); when a subtitle owns that row the chip is suppressed and the status stays in the card `aria-label` (no data loss); id chip ellipsized to its region with full-id tooltip. Unit markup proofs + DOM overlap probes (4 surfaces) = 0 overlaps.
- **D-06**: static single-line ellipsis (13+`…` = 14-glyph budget, measured against the 97px region) + full-value `<title>` on the card; DOM measurement on enterprise within budget.
- **D-08**: in-root CSS override in `spatial/presentation.ts` (anchored by `data-spatial-readout`, specificity `0-4-0`): `left/right:auto; inset-inline-start:14px; inset-inline-end:auto; direction:inherit`. `foundation/extensions.css` is out-of-root and untouched — the override outranks it and the `.ent-canvas`/`[dir]` surface rules (documented in the proof file).
- **F-SH1-02**: paint order cannot be fixed inside one edge group (z-index on SVG confirmed unsupported in Chromium by probe), so `mountSpatialPresentation` installs a capture-phase `pointerdown`/`dblclick` **rescue**: when the topmost target is an edge hit area but the pointer is inside a *different visible* relation label's bbox, the event is re-dispatched on that label → the label route wins. Real-mouse probe at 1024×900 opens the composer.
- **B-4 — STOP + report (per blueprint stop-condition)**: structure-row click on enterprise (`surfaces/enterprise/presentation.ts:613` → `enterprise.inspect`) never feeds the spatial selection kernel; the readout reads the kernel (`foundation/spatial.ts:34,40`), so the canvas readout stays `0 selected` while the context updates. The sync call belongs to `surfaces/**` (prohibited for this lane; scenario/m0 do it from surface code: `surfaces/scenarios/presentation.ts:441`, `main.ts:222`). Trace receipt: `T3_PROBE_RECEIPT.json` `R-05.B-4.trace...` (verdict `OUT_OF_ROOT_STOP__surfaces/enterprise/presentation.ts:613`). **Exact line handed to the canonical owner; not fixed here.**

## Proof battery (final tree)

| Gate | Result |
|---|---|
| `npm test` ×2 | 210/0, 210/0 |
| `npm run browser:test` (conformance) | 6/6 |
| sh2 geometry smoke (23 routes × bands × locales → 99 boots) | 99/99 booted, 0 page errors, 0 geometry overlaps; console = `/v1` responder absent (byte-identical pattern to SH-1's sealed BEFORE/AFTER runs) |
| T3 probes | 11/11 |
| res1-falsification (copied, path-fixed) | 7/7 |
| VIS falsify (copied) | 16/16, canonical sha identical |
| w03-browser-flows (copied, hermetic) | 7/7 |
| res1-capture (copied) | 20 captures, tree-bound (source tree `03b4ba2b…`) |

All receipts above were re-generated on the **final checkpoint tree** (after the line-ending restoration): conformance 6/6, test 210/0 ×2, probes 11/11, census EN/AR re-run, res1 7/7, VIS 16/16, flows 7/7, capture tree `03b4ba2b`.

## Unresolved / deliberately not fixed (owner-visible)

1. **B-4 sync** — out-of-root STOP (exact line above); needs a `surfaces/enterprise` micro-lane.
2. **T3-X1** adapter chrome Arabic-under-EN (health/processing/validation/manual_ai/audit… `other-ts` origins) — their canonical lane roots.
3. **T3-X2** `presentation-bridge.ts` block-editor chrome (largest runtime bucket, ~82 entries).
4. **T3-X3** interaction-gated hidden Arabic inside untouched writable lines (block menu, dialogs) — census-invisible; same pattern, follow-up batch.
5. **T3-X4 (observation)** compare-host EN-only technical identity field labels under AR — retained per SH-R2 scope; Owner decision if full parity wanted.
6. **R-03/T6** static 522 → Controller/generator pass (already sequenced).
7. **SHARED-5** systemic mounted-copy refresh (POR-1) unchanged; T3 adds the shelf/pane microtask path only where the blueprint required it.
8. `spatialReadout()` text (`N selected / M objects`) is EN-only under AR — pre-existing, outside the five named R-05 defects; recorded for completeness.
9. **OFFLOAD-04/05** pending Owner ChatGPT audits — terminal wording must not claim absolute zero-gap until they return.
