# W03-LABS · HANDOFF (Surface Writer) — LAB-1 post-fix proof lane

**Unit** `W03-LABS` · **Surface** `labs` · **Lane** `LAB-1` · **Status** `NOT_OWNER_ACCEPTED` (sole Controller review required)
**Candidate branch** `writer/mi-serial-lane/LAB-1` · **Candidate HEAD** `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` (unchanged — lane starts and ends on the sealed parent)
**Canonical source tree (candidate)** `b9b6c8cad4573b4ca73992c60579c1d544423832ea3c1b636eb38b2a7a53598d` (338 files) — equals the sealed-parent tree `0c43d7f11631dc85c4cec60b20d8612ccdfebd0c72da1475dc78360245984abc` until the single source change in §3 (DEF-LAB-R11)
**Reference** `Cybersecurity Lab Task Graph Dashboard(2).png` · `CURRENT_FINAL_REFERENCE` · sha256 `09f9d53b8d845ad3` · 1505×1045
**Writable roots used** `stack/native-typescript/surfaces/labs/` · `stack/native-typescript/adapters/labs/` (untouched) · `writer-output/W03-LABS/`
**No shared file was edited.** `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json` and the shared `writer-output/W03/` were restored to their committed state before the commit (packet step 6). Status stays `NOT_OWNER_ACCEPTED` — this unit never self-accepts.

---

## 1. Mission (LANE LAB-1, sealed) and what was done

Objective: **finish the post-fix proof** — close the pending build/recapture and responsive/RTL recapture items with fresh source-bound evidence and **re-prove** the two `RESIDUAL_ACCEPTED` defects instead of assuming them. **No restart**: baseline/after/after2/after3 salvage was inspected first and kept.

| Sealed item | Disposition |
|---|---|
| build/recapture pending (`OPEN_PENDING_RECAPTURE`, DEF-LAB-B04) | **CLOSED** — re-proven from fresh bytes (§5, §6) |
| responsive recapture `PENDING` | **CLOSED** — full matrix recaptured + asserted (§6) |
| RTL/LTR recapture `PENDING` | **CLOSED** — AR/RTL + EN/LTR proven; one RTL defect found and fixed (DEF-LAB-R11) |
| DEF-LAB-R09 `RESIDUAL_ACCEPTED` | **RE-PROVED** on the live renderer (authored a conditional edge through the real bus), not assumed |
| DEF-LAB-R10 `RESIDUAL_ACCEPTED` | **RE-PROVED** during a real Shift + pointer-down selection gesture, not assumed |
| lane falsification: site-build re-run → zero kept-from-dist | **PASS** (`written=323, keptFromDist=[]`) |

## 2. Salvage preserved (nothing restarted, reverted, reset or deleted)

- `evidence/baseline/` (2), `evidence/after/`, `evidence/after2/`, `evidence/after3/` — untouched superseded rounds.
- `SITE_BUILD.json` "322 sources stripped, 0 kept-from-dist" lineage continued: re-run at final state → **323 written, 0 kept-from-dist** (the extra file is another unit's source that landed in the parent tree; all parse).
- `REGRESSION 4/4` lineage continued: re-run at exact HEAD after the final change → 5/5 across the same four targets plus the runs group-regression.
- New rounds **added**, never replacing old ones: `evidence/after4/` (pre-fix, labs roots unedited), `evidence/after5/` (final), `evidence/postfix/` (L3/L4 instrument captures), `evidence/flows/` (flow/test/check logs).
- `FUNCTIONAL.json`, `VISUAL_EXECUTION_REPORT.json`, this `HANDOFF.md` updated in place.

## 3. Changed paths (exact, commit scope)

**Source (1 file):**
- `stack/native-typescript/surfaces/labs/board.ts` — DEF-LAB-R11: `graphModel()` now states the shared `styleClass` token (`canonical` linear / `related` conditional+optional) while `type` keeps the localized visible label + accessible name. One field + comment; no shared file touched.

**Writer-local instruments / evidence (`writer-output/W03-LABS/`):**
- `capture.mjs` — readiness gate `networkidle` → `domcontentloaded + CEPFoundation.consumer gate + 1400 ms` (networkidle provably never settles in this environment, §8) + `LABEL_REFUSED` path guard (N2); both documented in-file and in the capture manifest.
- `postfix-proof.mjs` (new), `pixelcheck.py` (new), `debug3.mjs`/`debug4.mjs`/`debug5.mjs` (new diagnostics).
- `POSTFIX_PROOF.json`, `FUNCTIONAL.json`, `SITE_BUILD.json`, `VISUAL_EXECUTION_REPORT.json`, `HANDOFF.md`, `COMPARE.json`, `COMPARE-after5-en.json`, `COMPARE-after5-ar.json`.
- `evidence/after4/`, `evidence/after5/`, `evidence/postfix/`, `evidence/flows/` (new); baseline/after/after2/after3 unchanged.

## 4. Tests (fresh, at exact HEAD)

| Gate | Result |
|---|---|
| `npm run build:runtime` | PASS (`written=323`, `authority=CANONICAL_SOURCE_TO_GENERATED_ONLY`) — run before the proof and again after the R11 fix |
| `npm test` (baseline) | **210 pass / 0 fail**, exit 0 |
| `npm test` run 2 (N5) | **210 / 0**, exit 0; id/status sequence **identical** — only `date` differs (`05:28:11.182Z` vs `.833Z`) |
| `dist/tests/surfaces/labs/domain.test.js` | PASS (`labs surface: PASS`) |
| `dist/tests/rescue/S11_W03_SCENARIOS_LABS/lab-task-graph.test.js` | PASS |
| `dist/tests/rescue/S11_W03_SCENARIOS_LABS/scenario-studio.test.js` | PASS |
| `dist/tests/rescue/CG4_W03_COVERAGE/controller-corr01-w03-lifecycle-truth.test.js` | PASS |
| `dist/tests/surfaces/runs/group-regression.test.js` | PASS (4/4 regression set, re-run after the final change) |
| `node writer-output/W03-LABS/functional.mjs --root $PWD/dist` | **12/12 PASS** (fresh `FUNCTIONAL.json`) |
| `node writer-output/W03-LABS/postfix-proof.mjs` | **16/16 PASS** (`POSTFIX_PROOF.json`) |
| `node tools/w03-browser-flows.mjs` | first run **7/7 PASS** at exact HEAD; later runs **environment-blocked** (§8) — logs preserved |
| `node tools/check-duplicate-mechanics.mjs` (N4) | exit 0 — no duplicate owner introduced |
| `npm run check` | exit 1 **only** from `check-contracts.mjs`; the other 8 stages exit 0. Reds: `browser.lineage_receipt_truthful` (pre-existing known red — `assurance/BROWSER_CONFORMANCE_RECEIPT.json` = 4/6, the two global Enterprise FAILs) and `browser.current_candidate_claim_truthful` (lineage freshness vs this candidate's tree). Both explained in §8; neither is a labs product failure. |

Note: the packet/DAG test paths (`tests/surfaces/labs`, `tests/rescue/S11_...`, `tests/rescue/CG4_...`) exist in this repo as TypeScript sources under `stack/native-typescript/tests/…` and run as their compiled `dist/tests/…` forms (the paths quoted by the W03 acceptance catalog). Recorded here so the naming difference is not read as a missing test.

## 5. Mandatory falsification (N1–N5 + lane-specific)

| # | Attempt | Observed |
|---|---|---|
| **N1** | On a **non-owned route** `/?surface=library`, execute `labs.author` through the global bus | `{ok:false, code:'UNKNOWN_COMMAND', reason:'Unknown command', owner:null}`; consumer stayed `library`; labs composition count 0 before and after → **refused, no side effect** |
| **N1b** | On `/?surface=labs`, execute another surface's command (`scenarios.author`) | `UNKNOWN_COMMAND`, `ok:false`; labs node count 5 → 5 → **refused, no labs mutation** |
| **N2** | Invalid/boundary input: `labs.author{fieldOutOfScope:1}`, `labs.author op=connect` with `from===to`, then author an `UNBOUND` task and ask for publish | throws `LAB_FIELD_OUT_OF_SCOPE:fieldOutOfScope` and `LAB_EDGE_ENDPOINTS_INVALID`; **bus receipts unchanged across both throws**; publish → `ok:false, code=LAB_VALIDATION_REQUIRED_BEFORE_PUBLISH` with **exact task ids** (`TASK-1:validation-required`, `TASK-1:expected-signal-required`) → no corruption, no false receipt |
| **N2b** | Capture instrument path traversal: label `../n2-escape-probe` (pre-guard resolves **outside** `evidence/`) | guard added → `LABEL_REFUSED …`, **exit 2, nothing created** (`artifactsOutsideEvidenceRoot: []`) |
| **N3** | Act without prerequisite/provider: `availability('labs.handoff',{tools:{}})` + `execute` | `enabled:false`, `code=LAB_REVISION_NOT_PUBLISHED`, explicit reason; execute `ok:false`; preflight `BLOCKED` / `runStartAllowed:false`; `runCreated` never true → **unavailable, never fabricated** |
| **N4** | `node tools/check-duplicate-mechanics.mjs` | exit 0 — no duplicate owner introduced by the labs change |
| **N5** | `npm test` twice at final state | both 210/0 exit 0, identical id/status sequence, only the run timestamp differs → **no leakage, deterministic** |
| **Lane-1** | Site build re-run at final state (`build-site.mjs`) | `written=323`, **`keptFromDist=[]` (0 kept-from-dist)**, `missingInDist=[]`, all 9 labs modules written from source |
| **Lane-2** | Re-prove **DEF-LAB-R09** (assumption forbidden) | authored a conditional edge on the real renderer via `labs.author op=connect` → `Conditional Unlock` dash `7px,4px` **≡** `Optional Branch` dash `7px,4px`, `Linear` `none`; legend still 3 keys with solid/dash/dash-dot swatches → **RESIDUAL_REPROVED_NOT_FIXED** |
| **Lane-3** | Re-prove **DEF-LAB-R10** (assumption forbidden) | during a live Shift + pointer-down gesture: 2 selected, group boundary `(331,613)–(677,698)`, rightmost card right `684` → boundary stops **7 px short**; minimap tiles all `132×62` while card CSS is `156×104` → **RESIDUAL_REPROVED_NOT_FIXED** |

## 6. Recapture / RTL / responsive closure (evidence bound to exact HEAD)

`evidence/after5/` — 10 frames, `1505x1045 · 1440x1000 · 1280x860 · 1024x900 · 1024x800` × `en · ar`, from `dist` produced by `npm run build:runtime`, manifest sha256 `9372c46e80fbef42cb45ee567a0494baf052cab5405b0571e150c497a71dbe29`, binding commit `fe1bb98…`, writable-root diff (`M …/surfaces/labs/board.ts`), node version, serve root, and per-frame sha256/bytes/pageErrors/DOM probe. `evidence/after4/` kept as the pre-fix round.

- **B04**: rect `(346,627) 142×95` measured on the same page as its screenshot → stddev **46.78** (baseline 13), ink 0.2096, neighbour ratio **1.22** (baseline 0.29); OCR on the same bytes: *"1 | tasx-2 Discover Input Surface identify reachable input"* (tesseract 5.3.4, prep `invert+x3+autocontrast`, psm 6) where baseline OCR read nothing; DOM tspans `['Discover Input','Surface']`, aria-label intact, style sheet injected, 0 page errors.
- **Responsive** (probe): 1440×1000, 1280×860, 1024×900, 1024×800 → overflowX=overflowY=0, visible panes never overlap, rightmost pane fits, graph height ≥260 (430/266/346/260), 0 page errors. At 1024 the RIGHT pane is **deliberately collapsed** and **reversible**: `[data-pane-toggle=right]` reveals `#domainContext` at 278×678 with 6 rows (collapsed-state comparison done, not assumed).
- **RTL/LTR**: AR → `dir=rtl lang=ar`, Arabic surface chrome, no English action labels, bdi tokens present, region tops equal, overflow 0; EN → `dir=ltr lang=en`, **zero** Arabic characters in surface-owned chrome, region tops equal, overflow 0.
- **L1/L2 re-compare** on the after5 bytes in both locales (`COMPARE-after5-en.json`, `COMPARE-after5-ar.json`, reference `09f9d53b…`): right pane ≈ reference (ink 0.0476 ref vs 0.0485 en / 0.0432 ar); left/centre denser than the reference (0.0975 / 0.086) with more OCR text — intentional density per packet §7; toolbar band lighter (0.0577 vs 0.1031, OCR 58 vs 116) — **recorded as an observation, not raised as a new defect** (§8).

## 7. FOUR TRUTHS (separate, no blending)

- **P — Presentation / visual:** post-fix recapture complete and hash-bound (`after5`); L1/L2 re-compare executed on identical bytes for both locales; L3/L4 instruments in `evidence/postfix/` (node-paint rect+crop, legend crops EN/AR, gesture + minimap crops). B04 **RESOLVED** with fresh proof; R09 and R10 remain `RESIDUAL_ACCEPTED` but are now **re-evidenced, not inherited**; new defect **DEF-LAB-R11 (V2, RTL stroke class) found by the RTL recapture and fixed** surface-side, then re-verified in both locales. Status: `NOT_OWNER_ACCEPTED` — Controller decides acceptance.
- **B — Browser / behaviour:** `npm test` 210/0 twice with identical id/status sequence; 5/5 packet tests at exact HEAD; functional 12/12; proof probe 16/16; `w03-browser-flows` **7/7 PASS** on its first run at this HEAD, subsequent runs blocked by the environment (§8, logs preserved); zero uncaught page errors on every captured frame in both locales.
- **C — Content / language:** Arabic and English both first-class — AR session renders Arabic chrome with no English command labels; EN session has **no** Arabic characters in surface-owned chrome; technical tokens isolated (`bdi`, 3 tokens measured); direction not baked into structure (regions identical tops, no overflow in either direction); legend/labels localized (تبعية خطية / فتح مشروط / فرع اختياري). DEF-LAB-B05's bilingual fix re-verified rather than assumed.
- **DP — Domain / provider truth:** preflight without prerequisites → `BLOCKED`, `runStartAllowed:false`; handoff without a published revision → `LAB_REVISION_NOT_PUBLISHED`, `ok:false`; publish blocked by validation with **exact task ids**; published revisions immutable (`PUBLISHED_REVISION_IMMUTABLE`); `labs.handoff` still reports `runCreated:false` (preparing freezes the run-input manifest, never starts a run); environment binding stays `LOCAL_TRAINING_ENVIRONMENT_FIXTURE` / `FIXTURE_BINDING__NOT_PROVIDER_TRUTH` — no provider capability invented (N3).

## 8. Unresolved findings (recorded, not decided)

1. **`npm run check` → 2 reds, both explained:** (a) `browser.lineage_receipt_truthful` — `assurance/BROWSER_CONFORMANCE_RECEIPT.json` reports `summary 4/6` (the two global Enterprise FAILs `relation.route-convergence-and-label-scope` + `central-change-reuse`, owned elsewhere; DAG names this the known red) and its tree no longer equals this candidate's; (b) `browser.current_candidate_claim_truthful` — same receipt binds source tree `0c43d7f1…/338 files` (sealed parent) while the candidate tree is `b9b6c8ca…` after the R11 fix. Rebinding runs `npm run browser:test`, which writes `assurance/**` (outside this lane's sealed roots) → **handed to the Controller, not touched here.** All other `npm run check` stages exit 0.
2. **`tools/w03-browser-flows.mjs` cannot reach a green final receipt in this environment.** Its `networkidle` gate never settles because the platform input-direction request to `http://127.0.0.1:4174/v1/platform/input-direction` (a `stack/local-runtime/server.mjs` instance started by a sibling lane at 05:17:14) stays **pending in Chromium** while `curl` answers `503 WINDOWS_PLATFORM_UNAVAILABLE` in 49 ms; its fixed port `43174` also collides when another lane runs the same harness (one attempt failed with `ERR_CONNECTION_REFUSED`). The harness is **read-only for this lane**, so it was not modified. First run (before that service existed) = 7/7 PASS at this HEAD; all later logs are preserved in `evidence/flows/`. **Not a labs product failure**: the page boots, consumer gate passes, 0 page errors, all gates green.
3. **Toolbar-band ink/OCR below reference** (0.0577 vs 0.1031; OCR 58 vs 116) in the L1/L2 compare — pre-existing composition choice (the reference's toolbar band carries surface-specific controls; this surface groups them in the workbench action row). Recorded for Controller judgment; **not** silently closed and **not** raised as a new defect by this lane.
4. **Left/centre density above reference** — intentional content density per packet §7; flagged so a Controller re-audit can confirm rather than inherit the claim.
5. **Instrument change on record:** `capture.mjs` no longer waits for `networkidle` (it provably never settles here); readiness is `domcontentloaded + CEPFoundation.consumer + 1400 ms`, stated in every capture manifest. `pixelcheck.py` OCR uses a fixed, reported preprocessing (`invert+x3+autocontrast`, psm 6→3) — the raw psm 3 read returned nothing on a light-on-dark card.
6. **Build artifacts restored:** `dist/`, `assurance/*` and `stack/MEASURED_COMPARISON.json` were returned to their committed state per packet step 6, so a consumer must run `npm run build:runtime` before testing (the captures/evidence were taken from the freshly built `dist`, not from the restored one).
7. **Accepted residuals pending shared-component work:** DEF-LAB-R09 (V1, `SHARED_COMPONENT` — conditional vs optional stroke classes) and DEF-LAB-R10 (V0, `SHARED_COMPONENT` — 132×62 boundary/minimap vs 156×104 Labs cards). Both stay `RESIDUAL_ACCEPTED` **with fresh re-proof**; geometry was not forked, shared files were not edited.

## 9. Owner / STOP notes

- **No STOP condition was triggered**: no shared-seam write was needed, no authority conflict was found, no evidence had to be fabricated, scope stayed inside the sealed row (`surfaces/labs/`, `adapters/labs/`, `writer-output/W03-LABS/`), and no false receipt was produced (the environment-blocked flow runs are reported as failures, not successes).
- **Owner-facing items remain isolated and untouched** (record-only, per DAG §0): shell redesign `OWNER-20260910-010`, RQ reference promotion, Visualize `F-048`, destination-count freeze `C03-GATE-023`.
- Authority read (read-only, closed set): DAG §0 + LAB-1 row, `W03-LABS_SURFACE_PACKET.md`, `VISUAL_EXECUTION_STANDARD.md` incl. §0, `profiles/labs.json`, `APPLICABLE_OWNER_DECISIONS.csv`, reuse-matrix row 8. No `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**` file was written.
- H02 do-not-repeat law held: no reset/revert to `48fec276`, no from-zero relaunch, no donor archaeology redone, no `w05-rescue.ts` touch, salvage and superseded evidence retained.

## 10. How to re-run the evidence

```bash
npm run build:runtime                                   # written=323, pass
npm test                                                # 210/0 (run twice → identical)
for t in dist/tests/surfaces/labs/domain.test.js \
         dist/tests/rescue/S11_W03_SCENARIOS_LABS/lab-task-graph.test.js \
         dist/tests/rescue/S11_W03_SCENARIOS_LABS/scenario-studio.test.js \
         dist/tests/rescue/CG4_W03_COVERAGE/controller-corr01-w03-lifecycle-truth.test.js \
         dist/tests/surfaces/runs/group-regression.test.js; do node "$t"; done
node writer-output/W03-LABS/functional.mjs --root "$PWD/dist"     # 12/12 → FUNCTIONAL.json
node writer-output/W03-LABS/build-site.mjs                        # keptFromDist must be []
node writer-output/W03-LABS/postfix-proof.mjs                     # 16/16 → POSTFIX_PROOF.json
node writer-output/W03-LABS/capture.mjs --label after5 --root "$PWD/dist" \
  --viewports 1505x1045,1440x1000,1280x860,1024x900,1024x800 --locales en,ar
python3 writer-output/W03-LABS/compare.py writer-output/W03-LABS/evidence/after5/labs-en-1505x1045-*.png
node tools/check-duplicate-mechanics.mjs                          # N4, exit 0
```

Every capture manifest binds candidate + commit + tree + viewport + timestamp + path + sha256 + bytes + page errors; `POSTFIX_PROOF.json` binds the same commit/tree for all 16 checks.

> Full machine-readable status: `writer-output/W03-LABS/VISUAL_EXECUTION_REPORT.json` (STAGE `POSTFIX_PROOF_COMPLETE__AWAITING_CONTROLLER_REVIEW`).
