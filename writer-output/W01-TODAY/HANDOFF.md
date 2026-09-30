# HANDOFF — W01-TODAY (surface `today`)

**Unit:** `W01-TODAY` · **Branch:** `writer/mi-serial` · **Commit:** `24eb51260b41be917adf0cb02e7bc2bb6e9f93eb`
**Reference:** `cep-writer/references/visual/00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png` · `OWNER_CONFIRMED_FINAL_REFERENCE` · sha256(16) `3f75eac759efd920` · 1520×1034
**Acceptance:** `NOT_OWNER_ACCEPTED` — sole Controller review required.

Machine-readable report: [`VISUAL_EXECUTION_REPORT.json`](./VISUAL_EXECUTION_REPORT.json)

---

## 1. What the surface is for

**Today = the daily orchestration surface: what needs attention now, and the fastest path into real work.**
Its composition answers that in reading order: *greeting + date → scope → the session you are already in →
the one recommended next action and why → what happened recently and how far you are → the attention rail
that gates everything else.* The center is the work column; the right rail is context that must not compete
with it. Nothing is borrowed from Library/Learn composition — only the shared shell mechanics.

## 2. What changed (bounded, region-by-region — no wholesale rewrite)

`stack/native-typescript/surfaces/today/presentation.ts` was edited in **14 targeted region edits** plus a
handful of Python find/replace patches (each asserted exactly-1 match). The file went 1019 → ~1300 lines,
all of it inside the `<style>` block, the `host.innerHTML` template, and two copy tables.

| Slice | Change |
|---|---|
| Design system | type scale 29/22/17/15.5/13.5/12.5/11 · spacing 4/8/10/14/16/20 · one card tier (13px radius, one low shadow) · badge tone map |
| Direction model | **physical** workbench geometry (`.today-orchestration direction:ltr`, `.today-layout`, `.today-main`, `.today-grid-2`, card heads, hero panes) + **language-logical** content (`.today-list`, `.today-filterbar`, `.today-action-sm`, `.today-link-btn`). Removed the stale `.today-main/.today-attention-side direction:rtl` rules that mirrored heads/grid order/rail items against the reference. |
| Greeting band | 48px glyph tile · eyebrow · heading · subtitle · date block anchored at the work-column end · band width tied to the work column `calc((100% - 14px) * 1.85 / 2.8)` |
| Scope toolbar | 7 loose pills pulled out of the band into a segmented control (start edge) with state + status (end edge) |
| Session hero | breadcrumb · title+status badge · activity chip · accent position line · summary · icon chips · **right-anchored action column beside the text column** · visual panel pinned to the start edge in both languages |
| Next / Why | 2.1:1 split · icon meta row · "unlocks next" box · direction-safe connector (≥901px) · next actions start-aligned, why actions end-aligned |
| Attention rail | tone-mapped icon tile · domain + priority badge head · status line + id line · **summary + action share one row** (rail 742px → 635px) · red count chip |
| Recent | four aligned columns (status glyph \| title \| domain+glyph \| time) using the previously unused `statusIcon` field, hairline dividers, footer link at the start edge; `data-split=wide-first` so recent/progress widths match the reference (647/308 vs 642/300) |
| Progress | uniform bordered chip rows: line icon \| label \| end-anchored value (`7 / 10`) |
| Icons | 26-glyph SVG line-icon kit (one stroke weight, no directional glyphs); arrows flip with language |
| Responsive | 1080 / 900 / 860 / 768 / 520 breakpoints; head, scope bar and provider strip go full width ≤900; attention item drops its tile ≤520 |

`stack/native-typescript/adapters/today/acceptance-data.ts` (fixture, mine): `actionLabel` → `ابدأ الممارسة` /
`Start practice`; `pathTags` reordered to the reference's chip order; `metaTags` aligned to the reference meta row
(`SQL Injection · 12 min · next dependency incomplete`).

**Preserved from the previous session:** `acceptance-data.ts` improvements, `capture.mjs`, and all baseline + reference-region evidence.

## 3. Verification

- **Functional/authority:** `D07_TODAY_PRESENTATION_AUTHORITY` → **15 PASS / 0 FAIL**, including
  `normal-product-does-not-fabricate-*`, `acceptance-provider-rejected-from-normal-product`, reference sha256 identity,
  presentation source tokens, and the responsive probe contract.
- **Visual:** L1 reference-over-candidate comparisons `evidence/compare_FINAL2_ar_l1.png` (final, from `LINEAGE-final4`) and `evidence/compare_final_en_l1.png`;
  L2 reference decomposition in `evidence/ref-regions/` (8 named regions + 22 programmatic crops);
  L3/L4 via 8 per-region candidate crops per viewport.
- **Responsive + RTL/LTR:** 6 viewports × both directions where applicable, `overflowX = 0` everywhere, 0 console errors,
  `attentionPhysicallyRight = true` in both directions, computed `direction` recorded per region in `evidence/LINEAGE-final2.json`.
- **Regression:** only the two owned files are modified; all public exports and required CSS/DOM tokens intact.

## 4. Evidence & lineage

| Artifact | Path | Binding |
|---|---|---|
| Final candidate capture | `evidence/LINEAGE-final4.json` + `final4-pop-*.png` (AR headline sha256 `7d292dfecb82de34…`, 1520×1034) | commit `24eb512` · dirty-in-roots · 6 viewports · 8 crops each · path+sha256+dims+bytes+timestamp · superseded captures retained |
| Product route capture | `evidence/LINEAGE-rebuild4.json` + `rebuild4-*.png` | same commit · shows D-08 UNAVAILABLE truthfully |
| Pre-rebuild baseline | `evidence/LINEAGE-baseline.json` + `baseline-*.png` | retained, labelled **superseded** |
| Reference | `cep-writer/references/visual/00_TODAY/...png` | `OWNER_CONFIRMED_FINAL_REFERENCE` — reference, **not** evidence |
| Harness | `harness/today-harness.html` | labelled `TEST_ONLY_PRESENTATION_HARNESS__NOT_PRODUCT_PROVIDER_TRUTH` |

## 5. Open items for the Controller

1. **D-08 (V3, ARCHITECTURE, blocked):** `main.ts` never passes `context.todayProviders`, so the **product route renders
   every region as an empty state**. Fixing it requires editing `main.ts` / `surfaces/m0-controller-composition.ts`
   (W01-SHELL owned) — route through `tools/writer-serial.sh`. This unit deliberately did **not** inject fixture providers.
2. **D-09 (V2, SHARED_COMPONENT, blocked):** shell LEFT/RIGHT/BOTTOM regions + global chrome are not composed for Today.
3. **D-11 (V2, open):** horizontal geometry now matches the reference within ~5% (session 969/990, next 639/622,
   why 304/320, recent 647/642, progress 308/300, rail 497/480) but **vertical rhythm is still looser** —
   next/why 294px vs ~250/~230, recent/progress 347px vs ~270, rail 635px vs ~540. D-10 (action row) and D-15
   (recent status column + wide-first split) were fixed in this session; a final vertical-rhythm pass remains open.
4. **D-16 (V2):** shared `tools/build-runtime.mjs` was blocked by another unit's in-flight syntax error; this unit used a
   serialized unit-scoped transpile (`build-today.mjs`). A full shared build must be re-run before a repo-wide sweep.
4. **D-12/D-14 (V1):** session position line wraps to two lines; greeting copy is generic (no user identity in the projection model).
5. **Shared build** was blocked by another unit's in-flight syntax error; a full `tools/build-runtime.mjs` run is needed
   before any repo-wide sweep. This unit used `build-today.mjs` under the serialized lock.
6. **Re-view `evidence/compare_final_en_l1.png`** — the model's image-read path returned stale frames in this session;
   EN/LTR correctness is otherwise evidenced by byte-diff, computed-direction metrics and language tests.

**Status: `NOT_OWNER_ACCEPTED`.**
