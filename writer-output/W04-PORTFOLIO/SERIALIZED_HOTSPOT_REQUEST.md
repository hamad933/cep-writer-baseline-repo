# SERIALIZED_HOTSPOT_REQUEST — POR-1 / W04-PORTFOLIO

**Class:** `CANDIDATE_ONLY · NO_SELF_PROMOTION · RECORD_ONLY_FOR_SHARED_SEAMS`
**From:** lane `POR-1` (branch `writer/mi-serial-lane/POR-1`, parent `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc`)
**Date:** 2026-10-02

## 0. Statement of scope

**POR-1 needs NO shared-file write of its own.** Every source change this lane made is inside
`stack/native-typescript/surfaces/portfolio/` (the adapter root was audited and left unchanged).
The N1 guard (`evidence/falsification/N1_WRITE_GUARD.json`, 19/19 refusals) proves the lane refuses
out-of-root writes. This document exists to hand the defects POR-1 *found* but cannot fix to the
stewards of the files that own them (DAG §0: shared file → serialized request, do not edit directly).

Evidence for every item: `writer-output/W04-PORTFOLIO/evidence/` (hash-bound), detailed in
`HANDOFF.md` §6–§8.

---

## 1. SHARED-1 — RTL pane order is baked LTR (V2, all 23 surfaces)

- **Owner seam:** shell/chrome geometry (`foundation/extensions.css` + donor bake-out
  `tools/extract_donor.py` → `dist/foundation/donor.css`, source blueprint
  `foundation/presentation-carrier/CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_ACCEPTED_DESIGN_REFERENCE.html`).
- **Exact cause:** blueprint rule `.cols{direction:ltr; …grid-template-areas:"left lr center rr right"}`.
  Under `html[dir=rtl]` every ancestor inherits `rtl`, but `.cols` stays `ltr`, so the structure pane
  stays physically left and the context pane physically right. The sibling rule `.pane{direction:rtl}`
  already has the shared override `body[data-foundation-direction=ltr] .pane{direction:ltr}`
  (VD-009 lineage) — the symmetric RTL override for `.cols` is what is missing.
- **Scope proof:** reproduced on **portfolio AND evidence** (both locales) → app-wide, not
  surface-owned — `evidence/direction-diag.json`.
- **Requested fix (owner-side):** add the direction-neutral rule, e.g.
  `body[data-foundation-direction=rtl] .cols{direction:inherit}` (or drop `direction:ltr` from the
  blueprint) plus the 1100/820-band `.right`/`.left` off-canvas transforms, then re-run the SH-2
  locale probe (AR→EN structure identical, no baked direction).
- **Lane impact:** POR-1's own RTL evidence is complete without it; the defect is visible in
  `evidence/final/por1-final-ar-rtl-*` (`mirrored:false` in every AR probe).

## 2. SHARED-2 — shared W04 pane chrome is English-only under AR (V2)

- **Owner seam:** `stack/native-typescript/surfaces/composition/w04-rescue.ts` (sole-writer seam,
  W04-EVIDENCE per matrix row 5).
- **Exact lines:** `:849` family label map (`pane: 'Portfolio references'`,
  `note: n => "${n} reference(s) in this session · references are never copied"` — note the note is
  **hardcoded English**), `:925` `Settings · language & direction` button label.
- **Observed:** AR capture `evidence/final/por1-final-ar-rtl-1440x1000-populated.png` + AR
  `census.left` — English head/footer inside an otherwise Arabic pane.
- **Requested fix:** route these three strings through the W04 i18n table (the surface's own copy is
  already localized; only the shared head/footer/button is not).

## 3. SHARED-3 — toolbar command labels English-only under AR (V2)

- **Owner seams:** `w04-rescue.ts:86` (`portfolio.curate` → "Curate Portfolio reference") and
  `surfaces/m0-controller-composition.ts:223-226` (`portfolio.filter`/`portfolio.export`/
  `portfolio.group` → "Filter Portfolio" / "Export exact references" / "Update governed grouping").
- **Observed:** toolbar row in every AR capture (labels identical to EN).
- **Requested fix:** bilingual label registration for the four `portfolio.*` commands (and the same
  treatment for the other W04 commands, which share the pattern).

## 4. SHARED-4 — shared bottom shelf hardcodes Arabic under EN (V2)

- **Owner seam:** `foundation/global/bottom-shelf.ts:178`
  (`summary.textContent='مغلق — افتحه للسجل أو المقارنة أو الاسترداد'`) and
  `foundation/accepted-runtime.ts:537` (`renderBottom()` — 'السجل'/'المقارنة'/'الاسترداد' and more).
- **Observed:** the bottom strip of every EN capture shows Arabic; `bottomtitle` "عمل عميق" and
  `bottomSummary` "مغلق — …" are Arabic in **both** locales (probe output quoted in the session log;
  reproduction: `harness/por1-direction-diag.mjs`-style probe on `#bottomShelf`).
- **Requested fix:** localize through the shared dictionary (both languages are first-class).

## 5. SHARED-5 — language switch does not re-render the mounted surface (V2)

- **Owner seam:** preference → presentation wiring (`foundation/workspace.ts applyPreferences()` →
  `api.applyPreferenceSnapshot` / `renderCommandResults`) and/or the m0 stage refresh binding.
- **Measured (reproduce: `harness/por1-locale-refresh-probe.mjs`):**
  `before {lang:en,title:"Portfolio assembly"}` → Settings → choose العربية →
  `afterClick {lang:ar, title:"Portfolio assembly"}` → Escape (panel closed) →
  `afterClose {lang:ar, title:"Portfolio assembly"}` → +1.5 s →
  `afterWait {lang:ar, title:"Portfolio assembly"}`.
  `html lang/dir` switch immediately (shell chrome follows), but the mounted m0 copy only changes
  after an explicit `CEPFoundation.m0Composition.mounted.render()`.
- **Scope:** not portfolio-specific — the same binding serves evidence/reviews/mastery.
- **Requested fix:** re-render the mounted surface (or its copy projection) on locale preference
  change; until then every capture harness must compensate with an explicit render (this lane's
  harness does, and says so in its source).

## 6. GUARD-1 — `npm run check` reds (record-only)

- `browser.lineage_receipt_truthful` — the documented known red while the Enterprise defect is
  open: its 6-flow receipt is 4/6, the two FAILs are the **global Enterprise flows**
  (`relation.route-convergence-and-label-scope`, `central-change-reuse`) — explicitly not POR-1's.
- `browser.current_candidate_claim_truthful` — `assurance/BROWSER_CONFORMANCE_RECEIPT.json` binds
  canonical tree `0c43d7f1…`; recomputing the parent tree from `git archive HEAD` yields exactly
  `0c43d7f1…` (338 files), so the red appears only once *any* lane's source delta lands
  (now `b61cf2bb…` = parent + this lane's 5 files). Re-binding is the Controller's exact-HEAD
  browser receipt at convergence; the receipt is outside POR-1 roots and was not modified.

## 7. Environment note (no owner requested — recorded)

The shared `tools/w04-browser-flows.mjs` waits for `networkidle`. While a local runtime server on
`127.0.0.1:4174` is running (owned here by lane **BKP-1**, `npm run runtime:local`), the page's
`GET /v1/platform/input-direction` never reaches `requestfinished` for Playwright → `page.goto`
times out (5 attempts recorded with receipts). BKP-1's process was not touched. POR-1's passing run
used an isolated network namespace with loopback up, i.e. the exact "static proof server only, no
local runtime API" condition the receipt already documents. Suggested owner-side improvement: use
`waitUntil:'load'` + an explicit readiness predicate instead of `networkidle` in the shared harness.
