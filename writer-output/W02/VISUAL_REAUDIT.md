# W02 VISUAL REAUDIT — Library · Learn · Visualize · RQ (+ shared interaction/customization policy)

**Auditor:** W02 Visual Fidelity Auditor · **Date:** 2026-09-29 · **Branch** `writer/mi-serial` · **HEAD at audit** `8172bf1`
**Method:** `controller/12_execution/07_visual_fidelity_governance.md` (V0–V4, root-cause classes, L1–L4, iterative loop) · `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md` (**CEP-VIS-001-FINAL**, CEP-DEC-027) · `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` · `cep-writer/references/library-golden/GOLDEN_LIBRARY_VISUAL_INTERACTION_PARITY_MATRIX.md` (23/23 donor bar)

**Scope discipline:** this is an **audit + defect register**. No product source, `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `assurance/**` or `main.ts` / `m0-controller-composition.ts` was modified. The only writes are this file, `writer-output/W02/evidence-reaudit/**` (10 fresh screenshots + manifest). Nothing was auto-repaired.

---

## 0 · Verdict summary

| Surface | Reference class | Verdict | Highest severity | First highest-risk defects |
|---|---|---|---|---|
| **library** | `OWNER_CONFIRMED_FINAL_REFERENCE` `6976f17f` | **VISUAL_FAIL** | **V3** | W02-VF-L01 structure tree 3 rows vs ~20 rows/6 levels · W02-VF-L02 raw `**markdown**` markers rendered as content · W02-VF-L03 no code block / no relational tables |
| **learn** | `OWNER_CONFIRMED_FINAL_REFERENCE` `5fa530e7` | **VISUAL_FAIL** | **V4** | W02-VF-LE01 entire surface is an unavailable placeholder (2 items in LEFT) · W02-VF-LE02 practice-attempt widget replaces the lesson content surface |
| **visualize** | `OWNER_CONFIRMED_FINAL_REFERENCE` `c02a6a27` | **VISUAL_FAIL** | **V4** | W02-VF-VZ01 tree-view identity absent (`Hierarchy unavailable`) · W02-VF-VZ02 Library donor pattern not reused · W02-VF-VZ05 400 px dead centre band |
| **rq** | `REVIEWED_FINAL_CANDIDATE` `312bf193` (**Q-3 open**) | **BLOCKED** | — | STOP/REPORT: reference is **not** Owner-final; no reference-fidelity judgement issued. Current state described only (§4) |

**Nothing in W02 may be recorded as `VISUAL_PASS`.** The register's `acceptance_basis` for all four rows is `FUNCTIONAL_ONLY`, and governance §0/§10 states functional-only acceptance is never `VISUAL_PASS`.

**Terminology compliance:** the reference is the **VISUALIZE TREE-VIEW** (`CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png`). No "Visualize Review" surface is created, assumed or judged anywhere in this report.

---

## 1 · Evidence actually used (and how it was inspected)

### 1.1 Reference sources — all SHA-256 verified against the register before inspection

| Surface | File (under `cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/`) | SHA-256 (first 16) | Size | Class |
|---|---|---|---|---|
| library | `01_LIBRARY/CEP_VIS_001_LIBRARY_FINAL_OWNER_CONFIRMED_REFERENCE.png` | `6976f17f84d8eae1…` | 1505×1045 | OWNER_CONFIRMED_FINAL_REFERENCE |
| learn | `02_LEARN/CEP_VIS_001_LEARN_FINAL_OWNER_CONFIRMED_REFERENCE.png` | `5fa530e7c9506fd7…` | 1505×1045 | OWNER_CONFIRMED_FINAL_REFERENCE |
| visualize | `03_VISUALIZE/CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png` | `c02a6a272f330c3c…` | 1672×941 | OWNER_CONFIRMED_FINAL_REFERENCE |
| rq | `04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png` | `312bf193216402f8…` | 1505×1045 | **REVIEWED_FINAL_CANDIDATE (Q-3)** |

Supporting component references (`visual/90_SUPPORTING_COMPONENT_REFERENCES/`): `CEP_VISUALIZE_CANVAS_VIEW_COMPONENT_REFERENCE.png` — SHA-256 `918ab2a8c7c415b5…` (matches the register), 1672×941, `OWNER_CONFIRMED_SUPPORTING_COMPONENT`; plus `…_PATH_VIEW_COMPONENT_REFERENCE.png` (1094×343) and `…_FOCUSED_GRAPH_RELATIONSHIP_COMPONENT_REFERENCE.png` (613×647) — both diagram-only (0 OCR tokens), used for edge/relationship treatment only.

### 1.2 Current-state evidence

- **Fresh captures** (Playwright 1.62.1 Chromium, `tools/serve.mjs`, `reducedMotion: reduce`, both required viewports): `writer-output/W02/evidence-reaudit/` — 10 PNGs + `MANIFEST.json` with bytes/SHA-256/viewport per file. Routes: `/?surface={library,learn,visualize,rq}` at 1440×1000 and 1024×900, all four Visualize view tabs, Library bottom-shelf expanded.
- **Existing W02 evidence** `writer-output/W02/evidence/` (10 PNGs, `BROWSER_RECEIPT.json`) read and used for lineage agreement. Deterministic agreement check: `library-edit-learn-consume-…-02.png` is **byte-identical** to a plain `/?surface=learn` load (SHA-256 `830b3792ab0d7892…`), and `visualize-view-Tree-1440x1000` is byte-identical to `visualize-default-1440x1000` (`387b36957739f9ec…`) — i.e. **Visualize's default view is TREE**, and W02's flow captures are reproducible.
- **Deterministic cross-checks** (because the image-render channel proved unreliable — see §6): image dimensions + SHA-256 + 64-bit dHash; **OCR** (tesseract) per file as a file-bound content oracle; **edge-ink density** per region; **blank-band geometry**; and a **Playwright DOM probe** (region char counts, component counts, computed `direction` / `text-overflow`, `scrollWidth` vs `clientWidth`, toolbar + bottom-shelf state).

### 1.3 Quantified density baseline (deterministic)

| Measure | REF library | CUR library | REF learn | CUR learn | REF visualize | CUR visualize | REF rq | CUR rq |
|---|---|---|---|---|---|---|---|---|
| OCR words (visible text) | **508** | 271 | **429** | 249 | **408** | 238 | **380** | 143 |
| Words / MP of viewport | **323** | 188 | **273** | 173 | **259** | 165 | **242** | 99 |
| Edge-ink coverage (whole) | **10.21 %** | 4.92 % | **9.33 %** | 4.60 % | **10.33 %** | 5.16 % | **8.04 %** | 3.99 % |
| LEFT-pane ink | **7.29 %** | 3.31 % | **4.78 %** | 2.35 % | **7.88 %** | 6.00 % | 3.40 % | 3.74 % |
| CENTRE dead bands ≥ 80 px | **none** | none | **none** | 112 px | **none** | **400 px** | **none** | **408 px** |

**Every current surface carries roughly half the reference's visual information density** (ink 3.99–5.16 % vs 8.04–10.33 %). No reference contains a single blank horizontal band ≥ 80 px; two of the four current surfaces dedicate ~40 % of viewport height to empty centre.

DOM component counts across all four current surfaces: `tables: 0`, `codeBlocks: 0`, `images: 0`. The Library reference alone contains **2 syntax-highlighted code blocks and 2 relational tables**.

---

## 2 · LIBRARY — verdict **VISUAL_FAIL** (V3)

### 2.1 What the reference actually shows (inspected)
Full CEP shell (logo + Arabic/English identity · 5 global destinations · platform search `Ctrl K` · notification bell · dark-mode toggle · avatar `أحمد / مدير النظام`) → a 4-tab workspace row (`المكتبة | التعلم | التصور | البحث والحجود`) → a **three-pane workspace with a populated bottom rail**.

- **LEFT — structural tree (the donor bar).** Search-in-library + filter button; then a **six-level tree of ~20 rows** with per-node counts right-aligned (`12, 129, 47, 15, 5, 6, 4, 5, 21, 18, 14`), amber folder glyphs for branches, teal shield glyphs for knowledge-unit leaves, **two-line leaf rows** (`SQL Injection` + `KU-APPSEC-SQLI`), indent guides, expand chevrons, and a **selected row with a filled blue highlight**. Footer `إدارة المكتبة ⚙`.
- **CENTRE — document + structured editor.** Breadcrumb; title `SQL Injection` + green `منشور` badge; a metadata band (`KU-APPSEC-SQLI` · `v2` · `مُحدَّث` · `آخر تحديث: 18 مايو 2025` · `الإذاع`); four tag chips (`OWASP · CWE-89 · Web · Injection`); an edit toolbar with **undo/redo + `حفظ ▾` + a persistent `مسودة محفوظة تلقائياً` token + a full rich-text palette** (T, U, I, bullet list, numbered list, quote, code, link, table, more) + expand; then `المعرفة / المحتوى` and **numbered sections 01–05** (`نظرة عامة`, `المقدمة التمهيدية`, `سيناريو / تجريبي` with a 4-line **syntax-highlighted SQL code block + `SQL` language badge**, `النتائج والمخاطر`, `التخفيف / الوقاية` with a 4-item bulleted list); then **two relational tables** (`التعلم المترابط` — 5/2/1/2 rows, and `السياق المترابط` — 2/2/23/23/1 rows).
- **RIGHT — context.** `السياق` + close; **8 labelled lens tabs**; a scope line; **5 KPI cards all non-zero with descriptive subtitles** (المشاريع 1 · الابعاد 23 · العوامل 2 · العلاجات 23 · المصادر 2); `مصادر مترابطة (2)` with two distinct coloured source icons + external-link affordance; `مختبرات مترابطة (2)` with completion status; a `03 مثال / سيناريو` code card with `SQL` badge; an info callout.
- **BOTTOM — populated summary rail.** `السياق ↑ | نظرة عامة | العلاجات 23 | العوامل 2 | المشاريع 1 | الابعاد 23 | الملاحظات 2` + an explanatory sentence + chevron.

### 2.2 What the current implementation shows (inspected)
Correct shell family and correct three-pane architecture, but every region is thinned to a fraction of the reference. LEFT carries exactly **3 flat domain rows**; CENTRE is a real document but its structured body renders **literal markdown markers**; RIGHT's KPI row is **4/5 zeroed**; the bottom is a **single closed line**. (Full details below.)

### 2.3 L1–L4 discrepancies

| ID | L | Discrepancy | Sev | Root cause | Routing |
|---|---|---|---|---|---|
| **W02-VF-L01** | L2/L3 | LEFT structure tree: **3 flat domain rows** (`Identity and access`, `Application and API se…`, `Incident response`) with a count badge *before* the label and no nesting, vs the reference's ~20 rows / **6 levels** / per-node counts / two-line KU leaves / folder-vs-leaf glyph differentiation / indent guides / selected-row highlight. The `>` chevron on every row indicates children that are never shown. | **V3** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-L02** | L3/L4 | CENTRE structured body renders **raw markdown markers as text** — `- **ku_id:** KU-D03-0001`, `- **domain_id:** D03`, `- **knowledge_type:** MECHANISM`, `- **status:** DRAFT_FOR_INDEPENDENT_REVIEW` (OCR-verified in `W02RA-library-default-1440x1000.png`). The reference renders a semantic numbered-section scheme. | **V3** | CONTENT_MODEL | surface Writer |
| **W02-VF-L03** | L3 | Missing centre components entirely: `منشور` status badge; the `v2 · مُحدَّث · آخر تحديث · الإذاع` metadata band; the 4 tag chips; the **numbered 01–05 section scheme**; the **syntax-highlighted code block + language badge**; both **relational tables** (`التعلم المترابط`, `السياق المترابط`). DOM confirms `tables: 0`, `codeBlocks: 0`. | **V3** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-L04** | L2/L3 | RIGHT context under-populated: KPI cards read `0 المشاريع / 0 الأدلة / 0 المختبرات / 1 العلاقات / 1 المصادر` vs 5 non-zero cards each with a descriptive subtitle; **no** `مختبرات مترابطة` list; **no** `مثال / سيناريو` code card; lens tabs are icon-only with truncated labels (`المختبر…`, `الملاحظ…`). RIGHT is only **514 chars** of visible text. | **V2** | CONTENT_MODEL | surface Writer |
| **W02-VF-L05** | L4 | Bilingual truth inside one statement: explicit save renders Arabic `فشل الحفظ الصريح؛ المسودة ما تزال محلية` in `.save` while `.foundation-status` renders `Save failed · RUNTIME_UNAVAILABLE`. Toolbar commands mix `قراءة/تحرير` with `حفظ`, `عرض مساحة العمل`, `فتح الكل`. | **V1** | IMPLEMENTATION | surface Writer |
| **W02-VF-L06** | L4 | Visual language: current is a monochrome navy/cyan line-icon system; the reference uses **categorical colour** (amber folders, teal shields, green published badge, syntax colours, flask/beaker lab glyphs, per-source brand icons) and richer iconography. | **V2** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-L07** | L1 | Shell delta vs reference: W01–W05 workspace chips added; notification bell, dark-mode toggle and the `أحمد / مدير النظام` identity block absent; the breadcrumb is **redundant** (`المكتبة › المكتبة`). | **V1** | SURFACE_COMPOSITION | surface Writer (shell: Coordinator) |

### 2.4 Density assessment
Visible meaningful items: LEFT **3** (ref ~20), RIGHT **2** content lists with **1** item (ref 2 lists × 2 + 1 code card + 5 KPI cards), CENTRE 3 sections (ref 5 sections + 2 code blocks + 2 tables). Hierarchy is **flat** (0 nesting levels in the tree; 1 level in the document). Grouping exists (sections are collapsible, RIGHT has heading groups) but carries no metadata richness. Navigation depth: **1 level** (ref 4–6). Controls: 185 buttons DOM-wide but the visible document toolbar has **no formatting palette in read mode**, no `مسودة محفوظة تلقائياً` token, and no per-row structural affordances. Whitespace ratio: LEFT ink 3.31 % vs 7.29 %; the left pane's lower ~360 px is an empty column. **Under-populated: yes — at both L2 (tree, right context) and L3 (centre components).**

### 2.5 Component completeness

| Reference component | Status |
|---|---|
| Structural tree with counts / two-line KU leaves / selection | **missing** (3 flat rows) |
| Document metadata band (version, updated, read, tags) | **missing** |
| Status badge `منشور` | **missing** |
| Numbered structured sections 01–05 | **missing** (unnumbered headings) |
| Syntax-highlighted code block + language badge | **missing** |
| Relational tables (linked learning, linked context) | **missing** |
| Edit toolbar + rich-text palette + autosave token | **partial** (palette not in read mode; autosave token absent) |
| Right KPI card row + source list + lab list + example card | **partial** (KPI row present but 4/5 zeroed; lab list & example card missing) |
| Bottom summary rail | **missing** (closed one-line strip) |
| Three-pane architecture, context lens tabs, save control, breadcrumb | **present** |

### 2.6 Donor status
Library **is** the donor and it is the strongest of the four. Its LEFT pane exercises the shared structured outline host (`foundation/structured/outline-host.js` + `adapters/library-outline-descriptor.ts` → `createLibraryHierarchyOutlineDescriptor`, with `iconRenderer`, `countElement`, `emptyElement`, `summaryElement` wiring). The donor *machinery* supports counts, glyphs, empty states and an active-path summary — **the rendered tree simply does not populate them** (3 rows out of the ~20 the fixture tree already defines). That is a population gap in the surface, not a missing donor capability. Learn consumes the same host (§3.6); **Visualize does not consume it at all** (§4.6).

---

## 3 · LEARN — verdict **VISUAL_FAIL** (V4)

### 3.1 What the reference actually shows (inspected)
Same shell; `التعلم` tab active. **LEFT — journey path:** `مسار التعلم` + `التقدم الكلي 28%` with a progress bar; a journey group `أمن تطبيقات الويب` containing **three stage rows, each a two-line row with a leading status glyph** (`✅ HTTP Basics / مكتمل`, `✅ SQL Basics / مكتمل`, `◉ SQL Injection / التقدم في القسم 3/7` expanded); under the active stage a **connector rail** links five numbered steps (`01 المقدمة` ✅ مكتمل · `02 فهم الاستغلالات الضخافة` ◉ **الحالي** (highlighted row) · `03 أطراف الإدخال الضار` · `04 التأثير واسعة الاستخدام` · `05 التخفيف`) plus `Practice`, `Assessment`, `Lab` rows each with a "next" description; a full-width `عرض خريطة المسار` button. **CENTRE:** breadcrumb, title + `شغّال الآن` badge, meta band, 4 tag chips, edit toolbar with the full formatting palette + `مسودة محفوظة تلقائياً`, a `التقدم في القسم 3/7` progress row, sections 01–05 + `Practice`/`Assessment`/`Lab` rows each with a trailing summary phrase, and inside the active section a goal callout, body copy, an inline link, a **4-line syntax-highlighted SQL code block**, and an info callout with `عرض التوضيح` actions. **RIGHT:** 8 labelled lens tabs + `الهدف الحالي` (target glyph) · `الهدف المعرفي الأساسي` · `المتطلبات السابقة` · `الممارسة المترابطة` · `جاهزية المختبر` · `الوصول السريع` (4 quick-access rows with counts). **BOTTOM:** summary rail `نظرة عامة | المعرفة 23 | العلاجات 18 | Practice 7 | Assessment 4 | Labs 3 | الابعاد 12 | الشواهد 5`.

### 3.2 What the current implementation shows (inspected)
The Learn identity is correct (H1, LEFT header, bottom toast all say Learn) — **but the surface is an unavailable placeholder**:
- H1 / H2: `Learning source unavailable`; badge `شغّال الآن`.
- LEFT (`البنية`): search placeholder `Search activity outline`, then `Learn activity outline`, `Local source learn-unavailable · r1` — **65 characters total**.
- CENTRE: `Practice: identify the trust boundary` + a short Arabic paragraph + `Journey → Practice → Assessment → Lab` + `Activity revision: 1 · Learning progress (local): INCOMPLETE · Mastery: not inferred` + `Recommendation: Bind a canonical learning source to continue.` + an **empty textarea** + `Start / New attempt · Submit answer · Open assessment · Open lab brief · No attempt` + `Learning source is not bound. This placeholder is not canonical learning content and is not editable` + three zero-count section headers (`دليل التعلم / المحتوى 0`, `التعلم المترابط 0`, `مسارات وروابط التعلم 0`).
- RIGHT: `Learning source unavailable — Read-only Learn domain projection consumed by the canonical shared Context Inspector` + an identity table whose values are `learn-unavailable / unavailable / 1 / learn-unavailable / —`.
- BOTTOM toast: `Learn · canonical source unavailable · no local fixture truth`.

### 3.3 L1–L4 discrepancies

| ID | L | Discrepancy | Sev | Root cause | Routing |
|---|---|---|---|---|---|
| **W02-VF-LE01** | L1 | The whole surface is a **source-unavailable placeholder** in place of the reference's dense journey workspace. LEFT 65 chars vs the reference's progress bar + 3 stage rows + 5 steps + 3 activity rows + path-map button. Objects per `surface-profiles/learn.json` (`Journey`, `LearningActivity`, `PracticeAttempt`, `LearningProgress`): **1 of 4 rendered, as `unavailable`**. | **V4** | CONTENT_MODEL / FIXTURE_DATA | surface Writer + **Owner STOP/REPORT** (no canonical learning source is bound; this must not be filled with invented content) |
| **W02-VF-LE02** | L2/L3 | CENTRE is an **inert practice-attempt widget** (empty textarea + `Start / New attempt · Submit answer · Open assessment · Open lab brief · No attempt`) where the reference shows the lesson content surface (5 numbered sections + code block + goal callout). The widget is dead: `No attempt`, textarea empty. Centre dead band **112 px**. | **V3** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-LE03** | L3/L4 | RIGHT carries an identity table with an **em-dash placeholder** (`Document revision —`) instead of an explicit unavailable state, and the lens label is truncated (`…arning Support`). No `الهدف الحالي` / `المتطلبات السابقة` / `الممارسة المترابطة` / `جاهزية المختبر` / `الوصول السريع` blocks. RIGHT 357 chars. | **V2** | CONTENT_MODEL | surface Writer |
| **W02-VF-LE04** | L4 | No save truth at all on Learn (`.save` and `حفظ` are `hidden: true`), and the headline is English over an Arabic body (`Learning source unavailable` / `اقرأ بحرية وقم بتغيير التعلم…`). | **V1** | IMPLEMENTATION | surface Writer |
| **W02-VF-LE05** | L2 | BOTTOM summary rail (8 counters) absent — same family as W02-VF-L06/L06. | **V2** | SURFACE_COMPOSITION | surface Writer |

### 3.4 Density assessment
Visible meaningful items: LEFT **2** (ref ~15 including the connector rail and progress bar), CENTRE **1** practice card + 3 zero-count headers (ref 5 sections + code block + callouts + 3 activity rows), RIGHT **1** identity table (ref 6 context blocks + 4 quick-access rows). Hierarchy: **none** (no journey tree, no steps, no nesting). Metadata richness: 5 identity fields, all placeholder-valued. Navigation depth: **0** (nothing to navigate). Controls: 5 activity buttons of which the primary is inert. Whitespace ratio: LEFT ink 2.35 % vs 4.78 %. **Severely under-populated — the reference's information product is essentially absent.**

### 3.5 Component completeness
Progress bar **missing** · journey stage rows with status glyphs **missing** · numbered lesson steps + connector rail **missing** · `عرض خريطة المسار` **missing** · numbered sections + syntax-highlighted code block **missing** · goal callout **missing** · right objective/prerequisites/related-practice/lab-readiness/quick-access blocks **missing** · bottom counter rail **missing** · lesson title + badge + meta + tags **missing**. **Present:** surface identity, three-pane shell, context lens host, one identity table, an honest unavailable message.

### 3.6 Donor-reuse verdict — Library → Learn
**Pattern preserved and context adapted; output is empty for a content reason, not a reuse reason.**
- Learn consumes the **same shared outline host** as Library (`foundation/structured/outline-descriptor.js` `createStructuredOutlinePresentationDescriptor` + `outline-host.js` `renderStructuredOutline` / `resolveStructuredOutlineKeyboardIntent`), the same `StructuredDocumentDomainAdapter`, `StructuredNavigationDescriptorOwner`, and the shared sticky-note runtime (`library-note-runtime-composition.js` via `learnNoteBindingInput`).
- The donor vocabulary is **adapted, not copied**: `learn.ts outlineDescriptor` projects nodes to `journey-stage` / `journey-activity-step` kinds with `i-journey` / `i-activity` icon keys and an `ariaLabel: 'Learn Journey navigation'` — Library's document-outline semantics re-expressed as Journey semantics. That is exactly directive §12.
- Verdict: **NOT "copy-paste instead of reuse"** (no duplication) and **NOT "ignored"** (the donor is wired). The gap is that the bound source is `learn-unavailable` with a single paragraph block, so the donor renders zero rows. **The donor wiring is the one thing on Learn that must not be changed.**

---

## 4 · VISUALIZE (TREE-VIEW) — verdict **VISUAL_FAIL** (V4)

### 4.1 What the reference actually shows (inspected — burn-in verified)
`التصور` tab active. **TOP (a five-part structural control bar):** ① map switcher `الخريطة المعرفية الحالية` + `Main Learning Map ▾` + a map-menu button · ② `طريقة العرض` segmented **Tree | Path | Graph | Canavas** · ③ `الطبقة التحليلية (Overlay)` segmented **Prerequisites | Coverage | Progress | Evidence | Mastery** · ④ `أدوات التصوير المحددة` — an **8-tool relation/representation palette** (`اقتراح مفهوم · اعتماد علاقة · نسخ الكيان/العقدة · تحديد الجهة/الاتجاه · توزيع/محاذاة · ربط/علاقة كيان · تخطيط لوحة مسار · المزيد`).

**LEFT (structure pane) — the Library-donor tree, adapted:** ① a map list (`Main Learning Map` with status dot and `الخريطة التفاعلية الرئيسية`, `Web Application Security`, `Injection`, `OWASP 2021 / SQL Injection`) · ② `خرائط استكشاف` (`Knowledge Map`, `Project Map`, `Research Map`, `Custom Maps`, each with a `…` menu) + `+ خريطة جديدة` · ③ `الفلاتر الذكية` — filter rows **with counts** (`جميع الكيانات`, `امن تطبيقات الويب 129`, `مستوى التعلم المتقدم 47`, `علامة جزئ 15`, `SQL Injection 5` selected).

**CENTRE:** an entity header card (large icon tile · `SQL Injection` · green `منشور` + `فعال للحل الحالي` pills · `KU-APPSEC-SQLI v2 مستو2 المسحوف من 3 عناصر ● قراءة/اكتمال` · 4 tag chips · 5 icon actions) and then the **`الهيكل التجريبي` tree-grid**: a column header (`النوع | الحالة | العلاجات`) and **~20 rows across 6 levels**, each row carrying an indent guide, a **kind glyph**, the label, a **kind word** (`وحدة معرفة / مفهوم / درس / ممارسة / مختبر`), a **status dot**, and **three relation counters with icons** (`📎23 · 📚12 · 🧪3` on `SQL Injection`; `📎6 · 📚2 · 🧪1` on each concept; `📎2 · 📚2` on `Lessons`; `📚1` on each lesson; `📎2 · 🧪1` on `Practice`; `📎1 · 🧪1` on `Lab`).

**RIGHT:** `السياق` · `ملخص الكيانات` with **4 KPI tiles** (`23 العلاقات · 12 الدروس · 3 المختبرات · 5 الملاحظات`) · `التصنيفات المتعددة` + `عرض الكل` (`SQL Routes`, `Input Validation`, `Web Security Concepts`) · `صلة الكيان بهذا` (3 rows: `Lesson 02…`, `Practice: Identify vulnerable query`, `SQL injection - Basic Lab`, each with `عرض في السلاس ›` + external icon) · `معلومات اضافية` (`تم الإنشاء 18 يناير 2025` · `المصدر OWASP Top 10 (A03:2021)` · `CWE CWE-89` · `الوسوم Injection, SQLi, Web, Database`) · `روابط سريعة` (4 rows with external icons). **BOTTOM:** `مساحة عمل مؤقتة ↑` + `المراجعة المؤقتة حالياً ●` + `آخر عرض: منذ الساعة 10:30 مساءً ⓘ`.

### 4.2 What the current implementation shows (inspected)
`Visualize · Spatial Representations` · view switcher `Tree | Path | Graph | Canvas` · a truth meta strip (`LOCAL_ACCEPTANCE_PROJECTION_ONLY · canonical:false · READ_ONLY · SpatialInteractionKernel`) · **`Hierarchy unavailable — No admitted canonical containment hierarchy is observed from the bound Visualize provider`** · a collapsed `<details>` titled **`Auxiliary source-family navigation — not hierarchy`** · and a **400 px empty band** below. LEFT is a flat 6-button `Representations` list. RIGHT is an identity table whose thirteen rows all read `none` / `unavailable` / `NONE`, followed by raw truth strings.

### 4.3 L1–L4 discrepancies

| ID | L | Discrepancy | Sev | Root cause | Routing |
|---|---|---|---|---|---|
| **W02-VF-VZ01** | L2/L3 | **The tree-view identity is absent.** CENTRE asserts `Hierarchy unavailable` and the tree degrades to a collapsed `<details>` explicitly labelled *"not hierarchy"*. The reference's `الهيكل التجريبي` tree-grid (5 columns, ~20 rows, 6 levels, kind glyphs + kind words + status dots + 3 relation counters) does not exist in any form. | **V4** | SHARED_COMPONENT / CONTENT_MODEL | shared-component owner + surface Writer |
| **W02-VF-VZ02** | L3/L4 | **Library donor pattern not reused.** `surfaces/visualize/surface.ts:12 renderVisualizeHierarchyTree` is a bespoke minimal renderer (`<span>label</span><small>kind</small>` in a plain `<ul>`), not the shared `foundation/structured/outline-host.js` + `outline-descriptor.js` that Library and Learn both use. No counts, no two-line rows, no kind glyphs, no indent guides, no status dots, no per-row actions. It also renders in **CENTRE**, not in the LEFT/structure pane the directive specifies. | **V3** | SHARED_COMPONENT | shared-component owner + surface Writer |
| **W02-VF-VZ03** | L2 | **All four TOP structural controls are missing**: map switcher, the **analytic overlay layer selector** (`Prerequisites / Coverage / Progress / Evidence / Mastery`), and the **8-tool relation/representation palette**. Current TOP carries only the 4-view switcher + a truth strip. | **V3** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-VZ04** | L2/L3 | LEFT is a flat 6-button list: no map list, no `خرائط استكشاف`, no `الفلاتر الذكية` with counts, no hierarchy, no counts, no icons. vs the reference's 3 stacked structural blocks. | **V3** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-VZ05** | L1/L4 | **400 px dead band** in CENTRE (y 520–920 of 1000) = **40 % of viewport height** unexplained whitespace (governance §21). No reference has any dead band ≥ 80 px. | **V3** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-VZ06** | L4 | **Raw debug truth strings leak into the UI with typos**: `provider:balanced6-local-acceptance.visualize|canonical:false|editability:READ_ONLY|view:TREE|sel…` and `selction-Oreps:6jhistorOffuture:0` (`selction`, `jhistor`) rendered as RIGHT-pane content instead of a presented state. | **V2** | IMPLEMENTATION | surface Writer |
| **W02-VF-VZ07** | L3 | **Canvas supporting-component fidelity is very low** (judged against `CEP_VISUALIZE_CANVAS_VIEW_COMPONENT_REFERENCE.png` `918ab2a8`, representation-only bar): node cards are a label + the **same generic `Local acceptance projection` subtitle repeated 6×**, with no id chip, no icon tile, no Arabic subtitle, no status chip, no progress, no tags. Edges: **2 unlabelled** vs the reference's **4 labelled edge classes** (canonical solid green `مستقيم سليم` · related dashed cyan `مترابط` · current path purple `المسار الحالي` · canvas-only dashed red `مرتبط إلى العقدة المحددة`) with Arabic edge labels on the lines. Also missing: the edge-legend card, minimap, zoom/pan controls with `100% تكبير · ملاءمة حجم | 12 عنصر · محدد`, the selected-element detail panel (definition table, tags, description, `ابعاد التمثيل X 720 · Y 280`) and the action rail (`حذف من المساحة` / `نسخ التمثيل` / `فتح التمثيل`). | **V3** | SHARED_COMPONENT | shared-component owner |
| **W02-VF-VZ08** | L3 | View switching is **cosmetically but not structurally** differentiated: `treeRows: 12` and `spatialNodes: 6` are identical across Tree/Path/Graph/Canvas, and `visibleNodes: 6` in every view — the four projections show the same six items with no view-specific richness. | **V2** | SURFACE_COMPOSITION | surface Writer |
| **W02-VF-VZ09** | L4 | The reference's own view switcher reads **`Canavas`** (typo for `Canvas`). The implementation correctly reads `Canvas`. **Do not copy the typo.** Logged so a future pixel-match pass does not "correct" it. | **V1** | EVIDENCE/ORACLE | Coordinator (reference hygiene) |

### 4.4 Density assessment
Visible meaningful items: LEFT **6** buttons + 2 headings (ref: 4 map rows + 4 explorer rows + `+ new map` + 5 counted filters), CENTRE **0 tree rows** (ref ~20 rows × 5 attributes), RIGHT **13 identity rows all `none`** (ref 4 KPI tiles + 3 taxonomy chips + 3 related rows + 4 definition rows + 4 quick links). Hierarchy: **absent** (explicitly "unavailable"). Grouping: 3 RIGHT groups + 1 collapsed `<details>`. Metadata richness: **nil** on entities (no counts, no status, no taxonomy). Navigation depth: **0**. Controls: 4 view tabs + 1 fit command (ref: 4 views + 5 overlays + 8 tools + zoom/pan + minimap). Whitespace ratio: **worst of the four** — 400 px dead centre band. **Severely under-populated.**

### 4.5 Component completeness
Entity header card (icon tile, pills, meta, tags, actions) **missing** · tree-grid with 5 columns and relation counters **missing** · map switcher **missing** · overlay layer selector **missing** · relation/representation tool palette **missing** · edge legend **missing** · minimap + zoom/pan + readout **missing** · selected-element detail panel with definition table/tags/description/coordinates **missing** · action rail **missing** · smart filters with counts **missing**. **Present:** three-pane shell, 4-view switcher, per-view truth descriptor, representation selection, a shared spatial SVG host (Graph/Canvas), a representation-only context statement.

### 4.6 Donor-reuse verdict — Library → Visualize Tree-View
**Pattern NOT preserved — "not enough donor pattern" plus a wrong reuse decision.**
- The directive names the Library structure-tree as the donor for *hierarchy, structural navigation, tree organization, icon/row treatment, density, structural affordances and visual language*, adapted to Visualize content. Current Visualize applies **none** of those: no hierarchy, no counts, no two-line rows, no kind glyphs, no indent guides, no structural affordances, and no reuse of the shared outline host.
- Worse, it **reinvents** a weaker renderer (`renderVisualizeHierarchyTree`) instead of consuming the shared contract that Library and Learn already share. This is §20's *"not enough donor pattern"* — and additionally a shared-component-boundary miss (the shared outline host is not consumed at all).
- It is **not** "copy-paste instead of reuse": no Library content or Library surface was duplicated. Nothing Library-specific leaked in.
- **Placement is also wrong**: the directive specifies the donor tree lives in the **left/structure pane**; the implementation renders its (failing) tree in CENTRE and leaves the structure pane as a flat list.

---

## 5 · RESEARCH & QUALITY — verdict **BLOCKED** (Q-3 · Owner STOP/REPORT)

`cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png` (`312bf193`) is **`REVIEWED_FINAL_CANDIDATE`, not `OWNER_CONFIRMED_FINAL_REFERENCE`**. Per governance §3 and `FINAL_VISUAL_REFERENCE_REGISTER.md`, its visual ceiling is open question **Q-3**, which a Writer/auditor may never decide. **No reference-fidelity judgement is issued for RQ.** Nothing in this report may be read as approving or rejecting RQ against that candidate.

**What the current implementation shows (described, not judged):** an honest but empty workbench.
- LEFT (`RQ research workbench · Collection`): one paragraph — `No admitted current RQ SourceRevision provider is bound. Non-production acceptance data is excluded from normal Product truth; Compare remains unavailable until exact provider-bound revisions exist.` (233 chars)
- CENTRE (`RQ research workbench`): `Search and compare are available only against an admitted current provider with exact SourceRevision identities. No non-production acceptance corpus is promoted into Product truth.` + `RQ research workbench — EMPTY State` (455 chars) and a **408 px dead band** (41 % of viewport height).
- RIGHT (`RQ research workbench · Context`): `RQ research workbench — EMPTY State` (137 chars).
- BOTTOM (`RQ research workbench · Detail`): `No domain-owned deep projection is bound.`
- All four domain commands are **disabled**: `Search RQ sources`, `Compare exact RQ revisions`, `Review working analysis`, `Inspect RQ provenance`.
- Per `surface-profiles/rq.json`, objects `SourceRevision`, `Claim`, `ClaimSourceRelation`, `AnalysisSession`, `WorkingConflict`: **0 of 5 rendered**.
- **Observation (not a defect verdict):** the fail-closed posture is *truthful* — it refuses to promote non-production acceptance data into Product truth and says so in all four regions. What is missing is any informative **empty-state composition** (governance §7 permits "informative empty/loading/error states where genuinely appropriate"). This is noted for the Owner once Q-3 is decided; it is **not** routed as a reference-fidelity defect.

---

## 6 · Shared components: requiring improvement vs must remain unchanged

### 6.1 Genuinely requiring improvement (evidence-backed)

| # | Shared component / rule | Evidence | Minimal recommended change | Regression scope |
|---|---|---|---|---|
| **S-01** | `dist/foundation/donor.css` — `#leftPane .phead h2,#rightPane .phead h2{direction:rtl!important}` combined with `.phead h2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}` | Measured **63 headings × 4 surfaces × 2 viewports**. **4 clipped, all on W02:** `Visualize views & representations` (clientWidth 187 / scrollWidth 273 / **31 % clipped**) and `RQ research workbench · Collection` (187 / 286 / **35 % clipped**), at **both** 1440×1000 and 1024×900. Because the element is `direction:rtl`, the ellipsis is placed at the RTL line-end = the visual left, so the **start of the LTR label is cut**. Content headings (`h1.title`, `h2.doctitle`, `h3`) are **not** clipped (`overflow:visible`). | Do not force `direction:rtl` on a heading whose text is LTR; resolve heading direction from content, or use `text-overflow:ellipsis` only in the resolved direction. **Do not change the rule globally without checking all consumers.** | W01/W03/W04/W05 panes (siblings flagged the same rule); any surface with a long LTR pane label |
| **S-02** | `SpatialPresentationOwner` / `SpatialInteractionKernel` — **node-card and edge presentation primitives** | Current canvas node card offers only `label` + one subtitle slot (the same generic `Local acceptance projection` 6×) and edges have **no label and no style class**. The Canvas component reference (`918ab2a8`) requires an id chip, a coloured icon tile, a title, a localized subtitle, a status chip, a progress meter, tags, plus 4 labelled edge classes. There is **no primitive slot** for any of these. | Extend the node-card primitive with optional slots (id chip · icon tile · secondary line · status · progress · tags) and the edge primitive with `label` + `styleClass` (`canonical \| related \| currentPath \| canvasOnly`). Keep the **representation-only** semantics and `canonical:false` boundary untouched. | W03 enterprise/labs/scenarios (read-only spatial consumers), W05, and the Canvas/Path/Focused-Graph component bar |
| **S-03** | `StructuredNavigationDescriptorOwner` / `renderStructuredOutline` — **consumption, not contract** | The host already supports counts (`countElement`), glyphs (`iconRenderer`), empty states (`emptyElement`) and an active-path summary — Library proves it. Visualize does not consume it at all (`renderVisualizeHierarchyTree` is bespoke). | **No contract change.** Route a consumption change to the Visualize surface so its structure pane uses the shared outline host. | Learn + Library must be byte-stable |

### 6.2 Contract is valid — **must remain unchanged**

| Shared component | Why it must not change (evidence) |
|---|---|
| `StructuredPresentationBridge` / `StructuredSurfaceHost` | The shared structured document/transaction truth is exemplary. The bottom shelf states its boundary in-product: `السجل مملوك لـ StructuredTransactionHistoryRecoveryOwner. العرض هنا read-only؛ والاستعادة، عند توفر مسارها، تُنشئ مسودة جديدة ولا تعيد كتابة التاريخ.` — exactly the canonical-owner ≠ workspace-surface split CEP-VIS-001 requires. |
| `StructuredTransactionHistoryRecoveryOwner` + `structured-bottom-provider.ts` | BOTTOM composition is honest and correctly scoped (3 tabs `السجل | مقارنة | استرداد`, current revision `b6-7ece51647550`, `working 1 · history 1/1 → 2/3`, `baseline`, ownership statement). Closed-by-default is Owner-sanctioned (`FINAL_VISUAL_REFERENCE_REGISTER.md` "Expanded-bottom behavior note"). W02 correctly remains a *consumer* (`check-duplicate-mechanics.mjs` passes). |
| `BottomDeepWorkOwner` (`foundation/global/bottom-shelf.ts`) | W01/FOUNDATION-owned, not forked by W02 (CBF-003 verified read-only). Open/close transition is real and provable. |
| `ContextInspectorPresentation` / `ContextLensHost` | **Capable.** Library renders KPI cards + a source list through it; Learn renders an identity table. The thinness on Learn/Visualize is surface composition, not a host limitation. **Do not genericise it to compensate.** |
| `AccessibilityFeedbackOwner`, `GlobalInputKeymapOwner`, `StructuredDragDropOwner`, `WorkspacePaneLayoutOwner`, `ReusableToolbarTemplateOwner` | No visual defect observed at L1–L4. No W02-local duplicate keys (`check-duplicate-mechanics.mjs` PASS); focus/`document.activeElement` and pane collapse round-trip in the existing evidence. |
| `SpatialInteractionKernel` **contract** (not its primitives) | The representation-only truth is visibly and correctly enforced (`canonical:false`, `representationId != canonicalObjectId` boundary, "Canvas lifecycle actions never create/delete canonical objects"), and view switching reports truthful per-view descriptors with `spatialHostHidden` toggling correctly. Keep the contract; only the *presentation primitives* need slots (S-02). |

### 6.3 Bottom-region internal composition (governance §21)
Judged explicitly because it is shared with RQ deep-work: the BOTTOM region has **no blank pane header and no dead zone when open** — it carries a summary, three tabs, and a readable history/compare/recovery workspace with real values. The **closed** state is a single 59-char line (`السجل والمقارنة مغلق — افتحه للسجل أو المقارنة أو الاسترداد`) which is a valid collapse (§8) with a **provable transition** (measured: `bottomOpen: closed → open`, `bottomChars 59 → 301`). The one legitimate gap is that the references' *collapsed* bottom is a **populated summary rail with counters**, which the implementation does not carry anywhere — recorded as W02-VF-L06 / LE05, **not** as a BottomDeepWorkOwner defect.

---

## 7 · EVIDENCE / ORACLE findings

| ID | Finding | Impact | Handling |
|---|---|---|---|
| **W02-VF-EO01** | **The harness image-render channel is non-deterministic AND mis-attributes files.** A `read` of a given PNG repeatedly returned a *different* PNG than the requested path (e.g. requesting the Library reference returned the current-Library composite; requesting a Visualize reference crop returned the full Visualize composite). Sibling auditors measured it as non-deterministic; this audit measured it as **path-mis-attributing**. | Any conclusion drawn from an unlabelled `read` is unsafe. | **Mitigated:** every composite was built with the **source filename burned into a label bar** and every image used for a finding was identified by its burned label. Findings are additionally grounded in deterministic, file-bound measures (SHA-256, dimensions, dHash, per-file OCR, edge-ink %, blank-band geometry, DOM probe). Two facts are corroborated byte-exactly (`learn` evidence == fresh `learn` capture; `visualize` default == `visualize` Tree capture). **Any surface statement in this report that rests only on a visual read carries its burned label.** |
| **W02-VF-EO02** | `CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png` renders its view switcher as **`Canavas`** (typo for `Canvas`). | A pixel-fidelity pass could "correct" the implementation to match the typo. | Logged as W02-VF-VZ01/VZ09 — implementation is right; the reference should not be copied literally. Routing: Coordinator / Owner (reference hygiene). |
| **W02-VF-EO03** | The RQ reference classification is `REVIEWED_FINAL_CANDIDATE`, and the register + governance both name **Q-3** as unresolved. | No RQ visual ceiling exists to measure against. | RQ = **BLOCKED**; STOP/REPORT; never decided here. |
| **W02-VF-EO04** | `dist/**` was rebuilt at 05:22 by another agent while W02's evidence was captured at 05:19, and `main.ts` / `m0-controller-composition.ts` are under concurrent edit. | Screenshot/`dist` alignment could be mis-attributed to W02. | The 10 fresh screenshots are bound to the served `dist` at 16:20Z and are labelled `CANDIDATE_ONLY_REAUDIT_EVIDENCE__NOT_OWNER_ACCEPTANCE`. **No in-flight edit by the concurrent agent is attributed to W02**, and nothing mid-change was "cleaned up". |

---

## 8 · No auto-repair loop — iteration record (governance §11)

For every defect: *identified · severity · root-cause hypothesis · recommended change · evidence · re-comparison plan · acceptance decision.* No change was made by this auditor; "recommended change" is a **routing instruction**, not an edit.

| Defect | Sev | Root-cause hypothesis | Recommended change (routed) | Evidence | Re-comparison plan (R5→R7) | Acceptance decision |
|---|---|---|---|---|---|---|
| L01 tree | V3 | SURFACE_COMPOSITION | Populate the shared outline descriptor from the existing 6 KU leaves + counts already present in the Library fixture set; expose counts/2-line leaves/selection | DOM `treeitems:3`; LEFT ink 3.31 % vs 7.29 % | Recapture 1440×1000 + 1024×900; require ≥ 15 rows / ≥ 3 levels / counts present / LEFT ink ≥ 6 % | REJECT |
| L02 markdown | V3 | CONTENT_MODEL | Render the block source through the structured editor instead of dumping markdown text | OCR shows literal `**ku_id:**` | Recapture; require 0 occurrences of `**` in visible text | REJECT |
| L03 centre components | V3 | SURFACE_COMPOSITION | Add metadata band, tags, numbered sections, one code block, the two relational tables (all derivable from existing source material) | DOM `tables:0 codeBlocks:0` | Require `tables ≥ 2`, `codeBlocks ≥ 1`, metadata band + 4 tags visible | REJECT |
| L04 right context | V2 | CONTENT_MODEL | Populate lab list + example card from existing material; do not invent | RIGHT 514 chars; 4/5 KPI zeroed | Require ≥ 3 non-zero KPIs + lab list + example card | REJECT |
| L05 save truth | V1 | IMPLEMENTATION | Add the persistent draft/persistence-boundary token; make one truth statement single-language | `.save` + `.foundation-status` disagree in language | Resting toolbar must show an autosave/persistence token | REJECT |
| L06/L07 shell + bottom rail | V1/V2 | SURFACE_COMPOSITION | Reconcile shell with CEP-VIS-001; surface the reference's collapsed summary rail | Screenshot + OCR | Compare L1 shell band and bottom rail | REJECT |
| LE01 placeholder | V4 | CONTENT_MODEL / FIXTURE_DATA | **STOP/REPORT to Owner**: no canonical learning source is bound. Do **not** invent content. | LEFT 65 chars; 1/4 objects | Owner decision first; then rebuild against the reference | **BLOCKED → Owner** |
| LE02 practice widget | V3 | SURFACE_COMPOSITION | Restore the lesson content surface; move the attempt widget behind an explicit attempt state | Centre dead band 112 px | Require 5 sections + code block; no inert widget in the default state | REJECT |
| LE03/LE04 | V2/V1 | CONTENT_MODEL / IMPLEMENTATION | Replace `—` placeholders with explicit unavailable tokens; add save truth; single-language truth statements | DOM identity table | Field-level re-inspection | REJECT |
| VZ01/VZ02 tree | V4/V3 | SHARED_COMPONENT / SURFACE_COMPOSITION | Consume the shared outline host in the LEFT structure pane; adapt Library row treatment to Visualize kinds/counts; never render "not hierarchy" as the default | `Hierarchy unavailable`; bespoke renderer at `surfaces/visualize/surface.ts:12` | Require a populated structure tree ≥ 3 levels with kind glyphs + counts in the **left** pane | REJECT |
| VZ03/VZ04 top + left | V3 | SURFACE_COMPOSITION | Add map switcher, overlay layer selector, relation tool palette, smart filters with counts | Screenshot | Component checklist per §4.5 | REJECT |
| VZ05 dead band | V3 | SURFACE_COMPOSITION | Fill or collapse the 400 px band; explain the whitespace | Blank-band geometry | Require 0 blank bands ≥ 80 px (all four references meet this) | REJECT |
| VZ06 raw truth | V2 | IMPLEMENTATION | Present the truth as a labelled state; remove the raw pipe-delimited string and its typos | `selction-Oreps:6jhistorOffuture:0` | Require no raw `key|value` strings in visible text | REJECT |
| VZ07 canvas components | V3 | SHARED_COMPONENT | S-02 primitive slots (node card + edge label/class) + legend/minimap/zoom/detail panel | 6 flat cards vs 12 rich cards; 2 unlabelled edges vs 4 labelled classes | Component-level compare against `918ab2a8` | REJECT |
| VZ08 view differentiation | V2 | SURFACE_COMPOSITION | Give each projection its own visible richness | `treeRows:12`/`spatialNodes:6` identical in 4 views | Per-view item counts must differ where the projection differs | REJECT |
| S-01 `.phead` clip | V2 | SHARED_COMPONENT | Resolve heading direction from content; keep ellipsis in the resolved direction | 4/63 headings clipped, all W02 LTR labels, 31–35 % | Re-measure all 63 headings at both viewports; require 0 clipped | REJECT |
| RQ | — | OWNER_CONSTRAINT | **STOP/REPORT (Q-3)** | Register + governance §3 | Only after Q-3 is decided | **BLOCKED** |

---

## 9 · Which surfaces are empty / under-populated, and why

| Surface | State | Why |
|---|---|---|
| **learn** | **Empty (placeholder)** | No canonical learning source is bound — the adapter's `normalizeSource` rejects anything fixture/synthetic and falls back to `learn-unavailable` with one paragraph block. This is a **deliberate fail-closed** behaviour (correct for truth, fatal for visuals). It must be resolved by an Owner decision on the source, **not** by inventing content. |
| **visualize** | **Under-populated + one empty region** | No admitted canonical containment hierarchy is observed (`BOUND_VISUALIZE_PROVIDER_CONTAINMENT_NOT_OBSERVED`), so the tree-view has nothing to render; and the composition never built the reference's map switcher / overlay selector / tool palette / smart filters / entity cards. Leftover: a 400 px unexplained centre band. |
| **rq** | **Empty (all four regions)** | No admitted current `SourceRevision` provider is bound; Compare is gated on exact provider-bound revisions and non-production acceptance data is excluded from Product truth. **Correct truth posture, zero visual product.** Judge only after Q-3. |
| **library** | **Under-populated (not empty)** | Real document and real editor exist (10,477 chars of centre text). Under-population is in the tree (3 vs ~20 rows), the centre components (0 tables, 0 code blocks) and the right context (4/5 KPIs zeroed). |

---

## 10 · Shared-component dependency assessment (per surface)

| Shared component | library | learn | visualize | rq |
|---|---|---|---|---|
| `StructuredPresentationBridge` / `StructuredSurfaceHost` | **helping** — real document + history | **helping** — correct unavailable doc handling | n/a | n/a |
| `StructuredNavigationDescriptorOwner` + outline host | **helping** (donor; under-populated) | **helping** (donor correctly adapted to Journey kinds) | **not used** → forces a weak bespoke tree (**defect**) | n/a |
| `SpatialPresentationOwner` / `SpatialInteractionKernel` | n/a | n/a | **contract helping, primitives insufficient** (no card/edge slots) | n/a |
| `RelationInteractionOwner` | n/a | n/a | **weak** — 2 unlabelled edges; no relation vocabulary in the UI | n/a |
| `ContextInspectorPresentation` / `ContextLensHost` | **helping** (KPIs + list) | **helping but starved** (identity table only) | **helping but starved** (all-`none` table + raw truth) | honest empty state |
| `StructuredBottomProvider` + `BottomDeepWorkOwner` | **helping** (rich, honest, provable collapse) | same | same ("Deep work unavailable") | honest ("No domain-owned deep projection is bound.") |
| `ReusableToolbarTemplateOwner` | **helping** but no formatting palette in read mode | same | **forcing generic composition** — the domain tool palette has no slot | 4/4 domain commands disabled |
| `WorkspacePaneLayoutOwner` / `WorkspaceResponsiveLayoutPolicy` | helping | helping | helping | helping |
| `GlobalInputKeymapOwner` / `AccessibilityFeedbackOwner` / `StructuredDragDropOwner` | no visual defect | no visual defect | no visual defect | no visual defect |

---

## 11 · Acceptance gate (governance §10) — 18-box status

| Box | library | learn | visualize | rq |
|---|---|---|---|---|
| Functional behaviour | ✅ | ✅ | ✅ | ✅ (fails closed) |
| Architecture respected | ✅ | ✅ | ✅ | ✅ |
| Ownership respected | ✅ | ✅ | ✅ | ✅ |
| Shared components used correctly | ✅ | ✅ | ❌ (bespoke tree; outline host unused) | ✅ |
| Not unnecessarily duplicated | ✅ | ✅ | ⚠ (reinvented instead of reused) | ✅ |
| Not forcing inappropriate composition | ✅ | ✅ | ✅ | ✅ |
| Meaningful content/state exists | ⚠ partial | ❌ | ❌ | ❌ |
| No unjustified blank regions | ⚠ (left column) | ❌ (112 px) | ❌ (400 px) | ❌ (408 px) |
| **Reference actually inspected** | ✅ | ✅ | ✅ | n/a (Q-3) |
| Current screenshot captured | ✅ | ✅ | ✅ | ✅ |
| Component-level comparison performed | ✅ | ✅ | ✅ | n/a |
| Major discrepancies addressed | ❌ | ❌ | ❌ | n/a |
| Responsive still correct | ✅ (both viewports) | ✅ | ✅ | ✅ |
| Valid strategic decisions preserved | ✅ (fail-closed truth) | ✅ | ✅ (representation-only) | ✅ |
| Obsolete assumptions not blindly preserved | ✅ | ✅ | ✅ | ✅ |
| Evidence bound to correct candidate | ✅ | ✅ | ✅ | ✅ |
| Re-comparison confirms the fix | ❌ (no fix yet) | ❌ | ❌ | n/a |
| Remaining differences explicitly justified | ⚠ | ⚠ | ⚠ | n/a |

**Result: library = VISUAL_FAIL · learn = VISUAL_FAIL · visualize = VISUAL_FAIL · rq = BLOCKED.**

---

## 12 · REPORT BACK (mandate §REPORT BACK)

1. **Verdicts + first highest-risk defects** — library `VISUAL_FAIL` (V3: 3-row tree / raw markdown / no code block or tables); learn `VISUAL_FAIL` (V4: entire surface is a source-unavailable placeholder); visualize `VISUAL_FAIL` (V4: tree-view identity absent; donor pattern not reused; 400 px dead band); rq `BLOCKED` (Q-3, STOP/REPORT).
2. **Surface-level vs shared-component-level** — surface-level: L01–L07, LE02–LE05, VZ03–VZ05, VZ08 (composition, content model, density). Shared-component-level: **S-01** `.phead h2` RTL+ellipsis clipping, **S-02** spatial node-card/edge primitive slots, **S-03** Visualize does not consume the shared outline host.
3. **Shared components needing improvement** — `donor.css` `.phead` rule (S-01, 4/63 headings clipped at 31–35 %), `SpatialPresentationOwner` primitives (S-02), outline-host consumption (S-03). **Must remain unchanged:** `StructuredPresentationBridge`/`StructuredSurfaceHost`, `StructuredTransactionHistoryRecoveryOwner` + `structured-bottom-provider` + `BottomDeepWorkOwner`, `ContextInspectorPresentation`/`ContextLensHost`, `SpatialInteractionKernel` **contract**, `AccessibilityFeedbackOwner`, `GlobalInputKeymapOwner`, `StructuredDragDropOwner`, `WorkspacePaneLayoutOwner`, `ReusableToolbarTemplateOwner`.
4. **Empty / under-populated** — learn (empty placeholder; no bound canonical learning source — Owner decision required, never invented), visualize (under-populated + 400 px empty region; hierarchy unobserved), rq (all four regions empty; provider unbound — judged only after Q-3), library (under-populated tree/centre/right).
5. **Reference sources actually used** — the four `01_KNOWLEDGE_AND_LEARNING` PNGs (SHA-256 verified against the register) + `CEP_VISUALIZE_CANVAS_VIEW_COMPONENT_REFERENCE.png` (`918ab2a8`) + the Path/Focused-Graph component references (diagram-only) + `library-golden/GOLDEN_LIBRARY_VISUAL_INTERACTION_PARITY_MATRIX.md` (donor bar) + `surface-profiles/{library,learn,visualize,rq}.json` (slot/object contract).
6. **Donor-reuse verdict** — **Library → Learn: pattern preserved and context adapted (journey-stage / journey-activity-step kinds, shared outline host); renders empty only because no canonical learning source is bound. Not copy-paste, not ignored.** — **Library → Visualize Tree-View: pattern NOT preserved — "not enough donor pattern" plus a wrong reuse decision (a bespoke renderer instead of the shared outline host) and wrong placement (centre instead of the structure pane).**
7. **Recommended action + routing** — per defect in §8; headline routing: `learn` → **Owner STOP/REPORT** (source binding) then surface Writer; `visualize` → **shared-component owner (S-02/S-03) + surface Writer**; `library` → **surface Writer**; `S-01` → **shared-component owner** with cross-workspace regression; `rq` → **Owner STOP/REPORT (Q-3)**.
