# HANDOFF — CLOSURE TASK R-01 (AD-01 pane proportion contract)

**Class:** `CONTROLLER_BOUNDED_CLOSURE__CANDIDATE_ONLY` · Serial mode · Parent `f5ba0cc`

## Atomic set executed (per blueprint R-01 + SH-2 H-SH2-01 table)
1. `foundation/global/preferences/schema.ts:18` — live default `leftWidth.safeDefault 304→230`, `rightWidth.safeDefault 420→245` (≈16%/17% of 1440).
2. `model-tests.ts` (4 hunks @ 98/276/278) — re-freeze to the corrected contract: preferred 420→245; scaled-left 243.2→184 (230×0.8), 608→460 (230×2); style-projection `--cep-ui-left-pane-width` 243.2px→184px. Justification: old expectations encoded the defective 304/420 geometry (CONTROLLER_REGISTERS AD-01 ≈16/65/17); new values are arithmetic of the reference defaults.
3. `foundation/global/responsive-layout.ts:23` — band-projection fallback `leftPreferredWidth 304→230`.

## Explicitly NOT changed (with reason)
- `foundation/accepted-runtime.ts:38` initial-prefs literal (SH-2 file#3): live probe proves non-authoritative (root CSS vars = 230/245 on all routes/locales) → stays in Task 3 language scope.
- generated `dist/foundation/donor.css` `:root --left:304px/--right:420px` (SH-2 file#5): extractor literal, tools/** = Task 6 generator pass; runtime preference-sync overrides root vars (probed) → exposure limited to pre-JS static fallback → **RESIDUAL → TASK 6**.
- `foundation/global/pane-layout.ts`: proven inert for live defaults (SH-2 Exp-A) — untouched.

## Proof
- 1440×1000: **15.97 / 65.49 / 17.01** (uniform, n=56) = target ±1.5.
- 1024×900: 22.46 / 76.46 / right 0–23.93 (medium band, designed suppression). 768×900: narrow band, suppression by design.
- Overlap **0** on all 99 records ({leftVsCenter:0, centerVsRight:0}).
- Smoke-1024 supplement: **23/23 booted, 0 pageErrors, cssVars 230/245** (main probe's smoke-1024 set truncated by 600s timeout kill — navError "browser has been closed", NOT product; disclosed).
- `npm test` **210/0 ×2**; `browser-conformance` **6/6 EXECUTED_PASS** (receipt `108d945a…`); live CSS vars `--left:230px --right:245px`.
- Evidence: `geometry-after.json` (99 records), `R01_SUMMARY.json`, `R01_SOURCE.diff`.

## Four truths
CONTENT n/a · PRESENTATION: proportions/overlap/bands ×3 vp ×2 locales · BEHAVIOR: 23-route boots + reveal/collapse intact (0 pageErrors) · DOMAIN/DATA/PROVIDER: n/a (layout only), stated explicitly.

## Unresolved (routed)
donor.css static `:root` → **Task 6 (R-03/R-09)** · accepted-runtime:38 seed → **Task 3 language scope**.
