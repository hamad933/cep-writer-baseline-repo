# SERIALIZED_HOTSPOT_REQUEST — DEF-06 English chrome (Library consumer-side verification)

**Lane:** `LIB-1` · **Unit:** `W02-LIBRARY` · **Class:** `REQUEST_ONLY__NO_SELF_EDIT__NO_PROMOTION`
**Raised:** 2026-10-02 · **Candidate:** branch `writer/mi-serial-lane/LIB-1`, HEAD `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` (pre-change) → see `HANDOFF.md` for the candidate HEAD/tree this request was verified against.
**Authority:** `controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0 shared-seam rule + §3 `LIB-1` row ("DEF-06 fix via shared-component request path") + matrix row 21 ("library lane = consumer-side verification only"). Foundation fix is `SH-2` scope.

---

## 1. What is broken (consumer-side observation)

On `/?surface=library` with the active locale set to **English** (`documentElement.lang='en'`, `dir='ltr'`), Library chrome still renders Arabic-only strings. Observed at **1440×1000**, EN/LTR, persistence provider deliberately unavailable so the canonical fixture content was under test:

- `arabicLeafCount` = **225** text nodes containing Arabic while EN is active (probe `writer-output/W02-LIBRARY/evidence/DIAG-AFTER-PWDOFF-en-1440.json`).
- Attribution of the first 60 leaves (52 distinct strings) → `writer-output/W02-LIBRARY/evidence/DEF06-ARABIC-UNDER-EN-ATTRIBUTION.json`.
- The same strings are correctly Arabic under locale `ar` (probe `DIAG-BASE-ar-1440.json`, `arabicLeafCount`=252) — so direction/locale resolution works; only the **string table** is missing for these elements.

Representative strings and their owning elements:

| String | DOM owner / path | Located in |
|---|---|---|
| `فتح العدسة في RIGHT` | `GroupedSectionSystem` · `#relatedContextBody` | `foundation/accepted-runtime.ts` |
| `المصادر` / `العلاقات` / `المختبرات` | `ContextInspector` lens + stat cells | `adapters/context-library-structured.ts` |
| `تجاوز التنقل إلى المستند` | `NO_OWNER` skip-link | baked `dist/index.html` |
| `البنية`-family pane/filter/tree labels | `StructurePane` · `#leftPane` | baked `dist/index.html` + `foundation/accepted-runtime.ts` |
| `قراءة` / `تحرير` / `حفظ` | `ReusableToolbarTemplateOwner` · `.toolbar` | `foundation/global/toolbar-template.ts` |
| bottom-shelf summary (`المراجعة الحالية`, `تفاصيل السجل`, …) | `BottomDeepWorkOwner` render | `foundation/accepted-runtime.ts` (`renderBottom`) |
| `توسيع القسم` / `عنوان القسم القابل للطي` | `StructuredPresentationBridge` toggle a11y labels | `foundation/structured/*` |

## 2. Why this lane cannot fix it

All literal locations above are **outside** `W02-LIBRARY` writable roots (`surfaces/library/`, `adapters/library-chrome.ts`, `adapters/library-fixtures.ts`). Editing them from this lane would be a write outside the sealed roots → STOP per §0.

## 3. Consumer-side verification this lane DID complete (no foundation edit)

1. **No Arabic-only chrome originates in owned files.** Static scan of all five writable source files:
   - `surfaces/library/presentation.ts` — 6 Arabic lines, all inside `TEXT.ar`, with `TEXT.en` counterparts selected by the active locale.
   - `adapters/library-fixtures.ts` — 2 Arabic lines, both `NOTE_FIXTURES` sticky-note **content** (a genuinely Arabic note title/status = domain data, not chrome).
   - `surface.ts`, `runtime-composition.ts`, `adapters/library-chrome.ts` — zero Arabic strings.
2. **Runtime proof that the owned chrome localises:** locale flip EN → AR → EN keeps function identical while labels change (`evidence/FALSIFICATION.json` → `L1.locale-flip-EN-AR-EN-identical-function`, PASS): left pane heading `Library` ↔ `المكتبة`, `dir` `ltr` → `rtl` → `ltr`, identical block ids / tree rows / command availability / history.
3. **Owned elements carry no Arabic under EN:** the Library-owned nodes (`data-presentation-owner="LibrarySurfacePresentation"` masthead, `"LibraryCorpusSummary"` corpus line) do not appear among the Arabic leaves in the EN probe.

## 4. Requested fix (for `SH-2` / shared-component owner, NOT for this lane)

- Give the affected foundation elements an EN string table entry and select it from the same active-locale source the rest of the chrome already uses (no direction baked into structure; no Arabic default; both languages first-class — `VISUAL_EXECUTION_STANDARD` §7, `profiles/library.json` language rules).
- Scope: `foundation/accepted-runtime.ts` (`initStaticDOM`, `overviewLens`/`renderInspector`, `renderBottom`), `foundation/global/toolbar-template.ts`, `foundation/global/context-inspector.ts`, `foundation/structured/*` a11y labels, `adapters/context-library-structured.ts`, `adapters/library-outline-descriptor.ts` aria labels, and the static markup baked into `dist/index.html`.
- Re-verify as a consumer of this lane afterwards with `node writer-output/W02-LIBRARY/diag.mjs --locale=en --persist=off` → `arabicLeafCount` must drop to the count of genuinely Arabic *content* leaves only (sticky-note data), with zero Arabic under EN in chrome.

## 5. Explicitly NOT requested

- No shell redesign (`OWNER-20260910-010`), no RQ reference promotion, no `F-048` work, no destination-count freeze (`C03-GATE-023`) — all Owner-gated and out of scope for this lane.
- No change to Arabic content/data fixtures (both languages are first-class; Arabic note content is not a defect).

**Status:** `OPEN__AWAITING_SERIALIZED_SHARED_SLOT` · this lane does not self-apply and does not claim DEF-06 closed.
