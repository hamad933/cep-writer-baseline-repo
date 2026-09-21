# CEP CONTROLLER ADJUDICATION — W01/W02 PRE-COLAB SOURCE COMPLETION v1.0

**Project:** Cybersecurity Education Platform — CEP  
**Lane:** W01 + W02 Production  
**Date:** 2026-09-09  
**Authority:** Controller bounded destination/data-contract adjudication  
**Baseline:** `CEP_W01_W02_PRODUCTION_KNOWLEDGE_WORKBENCH_FORGE_v1.1.4_WRITER_B_FINAL_CLOSURE_HARDENED_RESULT.zip`  
**Baseline SHA-256:** `5954e55db93411293cacb28b4082f54cf53fe8fc3950e9e56ad36cf97b82d636`

## 1. Purpose

Push the W01/W02 source implementation to the **maximum truthful pre-Colab closure point**. This document resolves the two remaining source/contract gaps that are safe for Controller adjudication now:

1. persistent arbitrary text-range `Color / Highlight / Underline` for `LIB-026`, `LIB-037`, `W03-LIB-008`;
2. historical `C024` bounded server-side Library/R&Q search, pagination, summaries and lazy detail.

This does **not** turn runtime/browser/DB/provider/platform gates into PASS. Colab remains deferred until source/semantic closure is independently confirmed.

## 2. Decision A — canonical persistent inline range marks

### 2.1 One canonical owner

Extend the existing Knowledge structured-content contract. Do **not** create a second editor model, hidden persistent HTML store, parallel notes format, or new database table.

Canonical owner remains:

- PHP: `app/Modules/Knowledge/Content/LessonContentContract.php`
- TypeScript: `resources/js/pages/KnowledgeLearning/components/content/lessonContent.ts`
- persistence: existing `lesson_revisions.blocks` JSONB
- editing surface: `resources/js/workbench/StructuredEditor.vue`

### 2.2 Contract version

Advance current manifest identity from:

`CEP_W02_STRUCTURED_CONTENT_V3`

to:

`CEP_W02_STRUCTURED_CONTENT_V4`

V4 is backward-compatible with historical V3 blocks that omit `inline_marks`. Absence means no persistent inline marks. Do not rewrite immutable historical revisions merely to add empty arrays.

### 2.3 Block field

Admit an optional field on eligible prose blocks:

```text
inline_marks?: InlineMark[]

InlineMark = {
  start: integer,
  end: integer,
  kind: "underline" | "color" | "highlight",
  value?: token
}
```

`start/end` are half-open **Unicode code-point offsets** into the canonical plain `body`, not JavaScript UTF-16 code-unit offsets and not byte offsets.

Allowed values:

- `underline`: no value;
- `color`: `ice | sky | mint | amber | rose`;
- `highlight`: `amber | blue | green | violet | rose`.

Clearing formatting is represented by removing/splitting marks, never by a `transparent`/empty persisted mark.

### 2.4 Bounded validation

- maximum 256 inline marks per block;
- integer offsets;
- `0 <= start < end <= UnicodeCodePointLength(body)`;
- registered kind only;
- exact allowed token for color/highlight;
- underline has no persisted value;
- deterministic normalization/sort;
- same-kind/same-value adjacent/overlapping marks normalize together;
- overlapping marks of the same kind but different value are deterministically split/replaced by the latest explicit user formatting operation;
- different kinds may overlap.

PHP and TypeScript must have equivalent normalization behavior and golden vectors including Arabic, emoji/non-BMP characters, and U+2028/U+2029.

### 2.5 Text mutation semantics

When an edit replaces code-point range `[a,b)` with inserted text length `n`:

- marks entirely before remain;
- marks entirely after shift by `n-(b-a)`;
- marks spanning the edit preserve semantic coverage and have their end shifted;
- endpoints inside replaced content map to the replacement boundary deterministically;
- zero-length marks are removed;
- no mark may escape current body bounds.

Selection operations must update the canonical working `LessonBlock.inline_marks`, not DOM-only decoration.

### 2.6 UI/render/clipboard

Accepted Library donor interaction intent is preserved:

- Selection Toolbar `Underline`, `Color`, `Highlight` become materially active for eligible text selection;
- Read Mode may apply admitted persistent formatting without enabling text/structure mutation;
- renderer reads canonical marks;
- theme-safe token mapping lives in presentation CSS, not persisted raw CSS;
- Plain clipboard strips marks;
- Formatted clipboard may use sanitized transient HTML and must reconstruct only admitted marks on internal/rich paste;
- persistent canonical storage remains `inline_marks`, never copied HTML.

### 2.7 Legacy VS001/VS002 anti-loss boundary

C002 remains hard.

VS001/VS002 must never silently drop or stale V4 marks. If a revision contains non-empty `inline_marks`:

- legacy LessonEditor must present that revision as explicit read-only / `EDIT_IN_W02_LIBRARY_REQUIRED`;
- server-side VS001/VS002 update routes must refuse advanced-marked content mutation with an explicit bounded error;
- legacy readers may render canonical marks if safely reusable, or render truthful plain text without mutation, but must not claim editing parity.

Unmarked historical/V4-compatible blocks remain editable under existing safe contract.

### 2.8 Digest/history/save

New saves include `inline_marks` in canonical block JSON and therefore in `content_digest`. Existing immutable historical digests remain unchanged. Restore/history/undo/redo/recovery/save/read must preserve marks exactly.

## 3. Decision B — C024 bounded server-side scale contract

### 3.1 Existing owners only

Use/extend these current owners; do not invent a parallel data domain:

- `routes/workbench.php`
- `app/Http/Controllers/KnowledgeLearning/WorkbenchController.php`
- `app/Application/KnowledgeLearning/KnowledgeLearningWorkspace.php`
- `app/Modules/Knowledge/Application/KnowledgeLibraryService.php`
- `app/Modules/Knowledge/Application/Library/LibraryHierarchyProjector.php`
- `app/Modules/SourceGovernance/Application/KnowledgeQualityService.php`
- `app/Modules/SourceGovernance/Application/ResearchQuality/ResearchQualityWorkbench.php`
- existing W02 Library/R&Q Vue surfaces.

### 3.2 Shared bounded page contract

Collection endpoints use:

- `q` optional bounded search string;
- `cursor` optional opaque cursor;
- `limit` default 50, maximum 100;
- deterministic stable ordering with canonical ID tie-break;
- invalid cursor → explicit 422 contract error;
- response page metadata: `limit`, `has_more`, `next_cursor`;
- no client-visible claim that a loaded page equals the entire corpus.

### 3.3 Library collection endpoint

Add:

`GET /api/cep/v1/library/catalog`

Return **summary rows only**, including canonical Knowledge Unit ID, bilingual titles and bounded revision/availability summary needed by the list. Do not include full revision block bodies for every item.

Search is server-side across canonical ID + Arabic/English titles. Preserve canonical IDs exactly.

### 3.4 Library hierarchy bounded projection

Stop calling full-corpus `catalog()` merely to build Structure.

Project the bounded catalog page plus authoritative placement/path context for those loaded canonical IDs. The response/UI must disclose bounded subset state and support cursor/load-more. It must not fabricate global totals from the loaded page.

Active selected unit/revision remains lazy exact detail through current exact-detail owners.

### 3.5 Library workspace bootstrap

`GET /api/cep/v1/workspace/library` may return active exact detail + first bounded catalog/hierarchy page, but must not materialize the full corpus. Query parameters may carry initial `q/cursor/limit` through the same collection contract.

### 3.6 R&Q source collection

Add:

`GET /api/cep/v1/rq/sources`

with the same bounded query/cursor/limit contract. Return source summaries sufficient for browsing: canonical source ID, title, authority/review summary and bounded counts/status. Do not attach every claim/detail to every source row.

Add exact lazy detail:

`GET /api/cep/v1/rq/sources/{source}`

for one canonical source and its exact detail/claims.

### 3.7 R&Q analysis scope

Research/Quality analysis for an active lesson/revision must query only sources related to the active canonical claim IDs, not every SourceRecord in the corpus. This preserves conflict/provenance truth while removing whole-corpus materialization.

If analysis ever needs a safety cap, it must return an explicit truncation/incompleteness state; it may not silently treat a truncated set as exhaustive.

### 3.8 Frontend behavior

`LibraryWorkspace.vue`, `LibraryHierarchyTree.vue`, and `ResearchWorkspace.vue` must become server-driven for corpus search/browse:

- loading/error/empty states;
- cursor/load-more;
- query cancellation/stale-response protection;
- canonical active selection preserved across pages/search where still valid;
- no `.filter()` over a preloaded whole corpus masquerading as server search;
- details fetched lazily.

### 3.9 Required C024 tests

At minimum:

- 251+ unit fixture proving first page <= configured limit;
- 251+ source fixture proving source page bounded;
- max limit enforcement;
- deterministic no-duplicate/no-loss cursor progression;
- Arabic/English/ID server search;
- invalid cursor contract;
- active detail fetch is exact and independent from page size;
- hierarchy projection handles only page canonical IDs/placements;
- R&Q list omits full claim payloads while detail includes them;
- active R&Q analysis queries claim-related sources rather than whole corpus;
- frontend unit/semantic tests prove server-driven paging and stale response protection.

DB-real query/count/performance proof remains for final runtime environment; source tests must still prove no explicit full-corpus `.get()` path remains in the W02 collection owners.

## 4. Gates intentionally NOT converted into source work

These remain explicit and must not be fabricated:

- durable Linked Sticky Notes server persistence — `AUTHORITY_GATED`;
- OS cross-application always-on-top — `PLATFORM_GATED`;
- Today provider C027 — real provider required;
- durable R&Q reconciliation C028 — authority/persistence contract required beyond read-only analysis;
- advanced Visualize canonical/durable mutation C029 — authority/provider/schema required;
- Learn practice/assessment/progression C030 — real provider required; Progress != Mastery;
- C025 real Laravel/PostgreSQL runtime proof;
- C026 exact browser/reference/visual/200%/AT/Bidi proof.

These do not authorize fake providers or speculative schemas.

## 5. Post-writer stop gate

After the Writer returns, Controller independently verifies source/semantic closure. Only when the remaining register contains genuine runtime/browser/DB/provider/platform/authority gates may the Controller prepare the Owner's existing-Colab final evidence cells.

**Control token:** `W01_W02_PRE_COLAB_CONTRACTS_ADJUDICATED / RANGE_STYLE_V4_AUTHORIZED / C024_BOUNDED_SCALE_AUTHORIZED / COLAB_DEFERRED_UNTIL_SOURCE_CLOSURE`
