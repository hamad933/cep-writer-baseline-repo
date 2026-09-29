# W05 VISUAL REAUDIT — Health · Processing · Validation · Manual AI · Backup · Audit · Releases · Configuration

Class: `WRITER_REAUDIT__VISUAL_FIDELITY__DEFECT_REGISTER__NO_PRODUCT_SOURCE_EDITED`
Workspace W05 · Branch `writer/mi-serial` · Auditor: W05 Visual Fidelity Auditor · Date 2026-09-29
Authority: `controller/12_execution/07_visual_fidelity_governance.md` (Owner directive) · Contract: `CEP-VIS-001-FINAL` (CEP-DEC-027)

Method: every reference PNG and every current screenshot was **opened and inspected** (capture-method law: a PNG on disk is not acceptance). Because screenshot→file associations proved unreliable in one transport of this audit, every visual claim below was cross-checked three ways before being recorded: direct image inspection · SHA-256/byte identity of the PNGs · headless-canvas pixel diff and region-brightness fingerprinting of the exact files. Where those disagree with a filename, the pixels win. No product source was edited. Audit-only helpers live outside the repo (`/tmp/opencode/imgdiff.mjs`, `/tmp/opencode/imgprobe.mjs`).

---

## 0. Global finding that shapes every surface verdict

**All 12 backup, 6 health, 6 processing, 6 validation, 3 manual-ai, 12 audit, 6 releases and 7 configuration evidence PNGs (1440×980) render the same generic W05 workbench family** — English copy, `X workbench` / `X · Runtime Capability` banners, one truth card, one explanation card, an EMPTY or 1–4-item LEFT list, and a thin RIGHT "Context" pane. None of them reconstructs its Owner-confirmed Arabic reference's architecture. The only surfaces with bespoke content are `audit` and `validation`, and even those are English technical workbenches, not the reference compositions.

Root cause is visible in code, not mysterious: `surfaces/m0-controller-composition.ts:241` dispatches the eight W05 consumers into three generic mounts —
- `configuration | manual_ai | releases` → `mountW05Collection` → `renderTypedCollectionStage` (the shared typed-collection template with `emptyGuidance` "How this workspace works" filler);
- `backup | health | processing` → bespoke adapter `mount()`s styled as "Runtime Capability";
- `audit | validation` → `mountAuditSurface` / `mountValidationSurface`.

`surfaces/composition/w05-rescue.ts` carries a correct `truthCeilings` object (`cancelRequestIsCancelSuccess:false`, `backupStageVerifyDrillIsLiveRestore:false`, `manualAiHiddenProviderExecution:false`, …) — the truth model is right; the presentation layer barely projects it.

**Second global finding (EVIDENCE/ORACLE):** several screenshots that claim distinct flow states are byte-identical or pixel-identical:

| Pair (same round) | Measured | Consequence |
|---|---|---|
| processing `after-inspect` ↔ `after-cancel-and-handoff` | **0 px changed** (both rounds) | cancel-requested → validation-handoff transition has **no visible state** |
| validation `after-validate` ↔ `after-findings` | **0 px changed** | "Inspect TechnicalFindings" produces no visible feedback (its state text is overwritten by `render()`, `surfaces/validation/index.ts:15`) |
| releases `empty-truth` ↔ `compare-blocked` | **byte-identical** (816e5703, ×6 files) | fail-closed compare/inspect feedback is **invisible** |
| configuration `settings-transfer` ↔ `settings-transfer-done` | **byte-identical** (1276331f, ×7 files) | export/import/reset **receipts have no display location** |
| audit `after-verify` ↔ `after-annotate` | **byte-identical** (08bc3e15, 76582416) | annotation outcome (success or fail-closed) is **invisible**; `DurableAuditRuntimeAdapter.lastError` is never rendered |
| health `after-refresh` ↔ `after-diagnose` | **1215 px (0.086%)** — timestamps only | the durable diagnostic exists only inside the **collapsed** BOTTOM shelf (`w05-health-diagnostic`); the flow never proves the shelf transition |

Also: `tools/w05-browser-flows.mjs` action sequences never click `processing.retry`, never click `processing.validationHandoff` (despite the suffix `after-cancel-and-handoff`), never execute `settings.*` transfer commands (the `configuration` flow only opens `foundation.settings`), and `releases.view` performs **no actions at all**. The screenshots are therefore labelled with states the flows never enacted.

---

## 1. HEALTH

**Reference actually shows** (`01_HEALTH/Arabic Operational Health Dashboard.png`, `f5f78968`, Arabic RTL):
global shell with 5 destinations; LEFT structural nav of 8 operational sections (الصحة التشغيلية active … التكوين); TOP action strip (تفعيل فحص / إعادة المحاولة / فتح التقرير / …); CENTER dominated by a **5-row × 5-column component status table** (component · operational state w/ icon+color · last check time · recorded note · per-row next-action button), one row selected; below it a **"selected component details"** block of 4 rich cards (last-check summary w/ counts ✓2 ⚠1 ✕1 and duration 00:02:41 · blocking state (red ✕, نشطة) with 3 fields · brief failure description · suggested next action w/ icon); RIGHT "السياق" with **4 icon-bearing context blocks** (التواريخ · الاعتماديات · آخر سياسة تحقق · نطاقات التكوين); BOTTOM collapsed "مساحة عمل مؤقتة". Fully Arabic, RTL, high density (~60+ meaningful items), semantic colour state (green ✓ / blue ↻ / amber ⚠ / gray ○).

**Current shows** (all 6 PNGs, e.g. `health-…-after-refresh-20260929T050322Z`): English "Health · Runtime Capability"; TOP actions `Refresh observed state / Inspect observation / Run durable diagnostic`; LEFT "Observed sources" = 4 cards (health.local-runtime, health.persistence.sqlite, health.processing.worker, health.processing.queue) with state + timestamp; CENTER = eyebrow, English title "Health", 2-line English description, the same 3 actions **repeated as inline links**, 5 status chips (AVAILABLE_DATA·2 … STALE·0), one "Selected observation" card (6 metadata fields), one "Status meaning" explanation card; RIGHT "Context" = 2 tabs + a single line `health.local-runtime / AVAILABLE_DATA · Observation`; BOTTOM collapsed "Health diagnostics". ~20 meaningful items.

**L1–L4 discrepancies**
- **L1/V4** — composition is a capability monitor, not the reference's component-status dashboard; hierarchy flat (description → chips → 2 cards); ~65 % fewer meaningful items; English where the reference is Arabic-first.
- **L2/V3** — reference CENTER = table + detail block; current CENTER = prose + chips + 2 cards. Reference RIGHT = 4 context blocks (dates/dependencies/policy/config scope); current RIGHT = 1 line. Reference LEFT = 8-section operational nav; current LEFT = source list (acceptable class per contract §3.2 "queue/category navigation", but far thinner).
- **L3/V2** — missing: component table with per-row next actions, last-check summary card, blocking-state card, suggested-next-action card, all 4 context blocks. Duplicated header: pane title **"Observed sources" rendered twice** (pane chrome + inner card).
- **L4/V1** — bidi: eyebrow `W05 · OPERATIONAL OBSERVATION` renders garbled/mixed with Arabic fragments (contract §12 violated); timestamps wrap mid-token (`2026-09- / 29T05:03:20.629Z`); "Status meaning" card's Arabic line is **clipped** by the bottom shelf; vertical stray accent bar beside "Selected observation".
- **Truth ceilings**: `queue QueueMetric ≠ worker WorkerLiveness` and `persistenceHealthAlias=false` ARE legible (distinct kinds per card) ✓; `AVAILABLE_EMPTY` never green ✓ (stated in "Status meaning"). But the **durable diagnostic run has no display** in any open region (only the collapsed BOTTOM shelf `pre`); `diagnose` moved 0.086 % of pixels.

**Density assessment:** under-populated ~65 % vs reference; whitespace ratio high in CENTER-left and RIGHT; no navigation depth beyond one list; metadata thin (state+timestamp only vs the reference's counts, durations, severities, next actions).
**Component completeness:** present: source list, selected-detail card, status chips, collapsed bottom shelf. Missing: component table, 4 detail cards, 4 context blocks, per-row actions, saved/last-session metadata.
**Shared-component dependency:** `WorkspaceFoundation` (regions/toolbar) helps — correct TOP/BOTTOM ownership. `ContextInspectorHost` (health `describe()` lenses) forces a single generic field list instead of the reference's impact/dependency/policy/config-scope context blocks — **forcing generic output**. The runtime-capability mount itself (not shared) owns the language and hierarchy gap.

**Defects**
| # | Defect | Sev | Root cause | Recommended change | Evidence | Re-comparison | Routing |
|---|---|---|---|---|---|---|---|
| H-1 | Whole-surface mismatch: English capability monitor vs Arabic component-status dashboard (table, 4 detail cards, 4 context blocks absent) | V4 | SURFACE_COMPOSITION | Rebuild health presentation on the reference architecture (component table + selected-component detail + policy context), Arabic-first | ref PNG vs 6 health PNGs | recapture @1440×980 + L1/L2 compare | surface Writer |
| H-2 | Durable diagnostic run invisible in open regions (only collapsed BOTTOM `pre`); evidence never shows the shelf | V2 | CONTENT_MODEL + EVIDENCE/ORACLE | Surface a "last diagnostic" summary in CENTER/TOP; capture BOTTOM expanded once | imgdiff 0.086 %; `health-runtime.ts:118,126` | recapture after diagnose incl. expanded shelf | surface Writer + Coordinator (evidence) |
| H-3 | Same 3 actions in TOP toolbar and CENTER links | V2 | SURFACE_COMPOSITION (contract §9) | One action home (TOP) | health PNGs | visual check | surface Writer |
| H-4 | `Observed sources` heading duplicated; RIGHT repeats CENTER state (`AVAILABLE_DATA · Observation`) | V2 | SURFACE_COMPOSITION (anti-patterns §14) | Single authoritative display location per item | health PNGs | visual check | surface Writer |
| H-5 | Bidi garbling in eyebrow, mid-token timestamp wrapping, clipped Arabic line in "Status meaning" | V1/V2 | IMPLEMENTATION (contract §12) | LTR spans for identifiers/timestamps, fix clipping | health PNGs | RTL/BIDI inspection per capture §6 | surface Writer |

**Verdict: VISUAL_FAIL**

---

## 2. PROCESSING (no reference — judged on contract + state legibility)

**Reference:** none (`INTENTIONALLY_NOT_GENERATED / CONTRACT_DERIVABLE / NO_NEW_REFERENCE_REQUIRED`). Criterion: running / retry / cancel-requested / validation-handoff must be legible and informative; no invented look.

**Current shows** (6 PNGs): English "Processing · Runtime Capability"; LEFT "Processing Jobs" + inner "Jobs" heading (duplicated) with **2 job cards** (UUID wrapping mid-token); CENTER: eyebrow (bidi-garbled `W05 · PIPELINE LIFECYCLE`), title, description, an orphan unexplained **`OBSERVING` chip**, a right-aligned "Selected lifecycle" card (job id, `CANCEL_REQUESTED`, truth chips `Provider execution · NOT PROVEN` / `Cancel ACK · NOT ACKNOWLEDGED` / `Validation · NONE`, 4 action buttons duplicating TOP, "Attempt history" table **clipped by the bottom shelf**); RIGHT "Context" = one line; BOTTOM collapsed "Processing lifecycle detail". ~15–20 items; the left half of CENTER is dead space (region probe: 0.0 % content).

**State legibility (the actual acceptance criterion):**
- running/observing: ⚠ weak — an unlabelled `OBSERVING` chip, no job-level progress, queue depth or worker split in the main view.
- retry: ✗ not visible — no attempt created, button disabled; no "retry unavailable for non-FAILED" explanation rendered.
- cancel-requested: ✓ legible — `CANCEL_REQUESTED` + `Cancel ACK · NOT ACKNOWLEDGED` + `Provider execution · NOT PROVEN` truthfully separate request from success.
- validation-handoff: ✗ **invisible** — `after-cancel-and-handoff` is pixel-identical to `after-inspect`; the `Validation · NONE` chip never shows `PENDING`; the flow never even clicks `processing.validationHandoff`.

**Density:** under-populated; 2 rows in a 760 px-tall LEFT pane; attempt history clipped; no per-row metadata beyond 3 lines.
**Component completeness:** present: job list, selected lifecycle w/ truth tokens, attempt table (partial), status-meaning card (in the DOM, below the fold), collapsed bottom shelf. Missing: handoff state display, retry affordance state, queue/worker split (`QueueMetric` vs `WorkerLiveness` exists in health but not here), running progress.
**Shared-component dependency:** bespoke adapter mount (not shared) — owns the emptiness. `WorkspaceFoundation` correct. Truth-token pattern inside the lifecycle card is a **good** local pattern worth keeping.

**Defects:** P-1 (V3, EVIDENCE/ORACLE + CONTENT_MODEL): validation-handoff state has no visible manifestation and the "after-cancel-and-handoff" screenshot never enacted a handoff — fix: render handoff lifecycle (PENDING/ACK/NONE) on the job card + retry eligibility reason; rename/recapture evidence. Routing: surface Writer + Coordinator. · P-2 (V2, SURFACE_COMPOSITION): retry/running states illegible (orphan `OBSERVING` chip) — explain or replace with per-state tokens. · P-3 (V2, SURFACE_COMPOSITION §9): duplicated action homes (TOP + CENTER). · P-4 (V1, IMPLEMENTATION §12): UUID wrap, bidi eyebrow garble, clipped attempt table. · P-5 (V2, SURFACE_COMPOSITION): CENTER-left dead zone; under-populated LEFT.

**Verdict: VISUAL_FAIL** (2 of 4 mandated states illegible)

---

## 3. VALIDATION

**Reference actually shows** (`03_VALIDATION/CEP_SYSTEM_VALIDATION_REFERENCE.png`, `0074ab58`, Arabic RTL):
TOP = 6 operational actions (تفعيل التحقق / إعادة تنشيط الفحص / عرض الإخفاقات فقط / اختيار Suite / تصدير التقرير / المزيد); LEFT = validation structure tree of **9 categories with status icons + counts** (Platform Integrity ✓7 … Integration ✓4) plus **4 recent validation sessions** (VAL-2026-08-31-0042 …); CENTER = session header `VAL-2026-08-31-0042` + copy affordance + status pill "مكتمل مع إخفاقات" + start/end/duration metadata, **4 semantic metric tiles** (38 total / 31 ✓ / 4 ⚠ / 3 ✕), **10-row × 5-column results table** (ID · check · category · severity · status) with PASS/WARNING/FAIL colour rows and pagination; RIGHT = rich "selected validation context" with **8 sections** (why? · affected scope · dependency · interpretation · recommended action · re-run capability (محظور, disabled state visible) · source · coupling) and a warning icon block; BOTTOM = full temporary workspace with 5 tabs and 3 panes (JSON check view / log stream / affected components). ~120+ meaningful items.

**Current shows** (6 PNGs, all the same composition): English "Validation · Local Bounded Rules" + `TechnicalValidationWorkbench`: LEFT "Validation requests" pane holding one card `ValidationRequest / VR-0001 / TECHNICALLY_VALID` (lower ~70 % empty); CENTER = title + one-line truth ("TechnicalFinding stays in W05 and never becomes a W04 Review Finding" ✓ good), a JSON textarea pinned to artifact/ruleset/validator identity, 3 buttons (Technical findings / Inspect result / Validate), result line `TECHNICALLY_VALID · RES-0001`, 3 identity cards (Validator / Ruleset / Artifact) and `No TechnicalFindings`; RIGHT = "Validation provenance" family host (Audit/Provenance inspection + Trace inspection cards); BOTTOM = collapsed "Technical findings". ~15 items.

**L1–L4 discrepancies**
- **L1/V4** — a JSON workbench replaces a validation-session dashboard; no session identity (`VAL-…`), no category structure, no results table, no metric tiles, no session queue; English vs Arabic reference.
- **L2/V3** — LEFT empty below one row; RIGHT is a generic provenance family host, not the 8-section criterion/impact/dependency context; BOTTOM has no tabs/panes.
- **L3/V2** — missing: metric tiles, results table, pagination, severity column, disabled re-run (محظور) state, interpretation & recommended-action blocks, affected-components list.
- **L4/V1** — digest strings `word-break:break-all` across 4 lines; `No TechnicalFindings` shows with leading-period bidi instability; family host column "Refresh" breaks one-letter-per-line (`R e f r e s h` vertical text).

**Truth ceilings:** `TechnicalFinding ≠ W04 Review Finding` ✓ visibly stated in CENTER and BOTTOM bar. Findings-count truth (`findings.length===0`) is asserted but the "Inspect TechnicalFindings" action is **visually a no-op** (0 px).

**Density:** ~85 % under-populated vs reference. **Component completeness:** present: identity cards, JSON input, action buttons, provenance host. Missing: nearly the whole reference component set.
**Shared-component dependency:** `ReviewAuditFamilyHost` + `AuditProvenanceInteractionCore` in RIGHT are truthful and well-structured (helping, keep); the surface's own runner composition is the gap.

**Defects:** V-1 (V4, SURFACE_COMPOSITION): whole-surface mismatch vs reference — rebuild on session-dashboard architecture. · V-2 (V2, IMPLEMENTATION): `validation.findings` feedback clobbered by `render()` (`surfaces/validation/index.ts:15` vs `:11`) → 0 px evidence; persist the findings result in a real region. · V-3 (V2, CONTENT_MODEL): no session queue/category tree/metric tiles although the reference defines them. · V-4 (V1, IMPLEMENTATION §12): text wrapping/vertical label/punctuation instability. Routing: surface Writer (V-1..V-4), Coordinator (evidence naming).

**Verdict: VISUAL_FAIL**

---

## 4. MANUAL AI (AI Bridge)

**Reference actually shows** (`04_AI_BRIDGE/CEP_SYSTEM_AI_BRIDGE_REFERENCE.png`, `ae1d8df7`, Arabic RTL):
title + "تثبيت بيدوي متحكم AI" chip + 6 actions; second LEFT column = **queue counters** (Open 7 / Waiting for External AI 3 / Response Received 4 / Validation Required 2 / Completed 11 / Failed 2) + **6 request records** (AIB-REQ-0048 …) with status badges and times; CENTER sections A–E: A request identity (5 fields) · B ready external package (5 rows incl. excluded-data check, version) · C **7-step sequence stepper** (DRAFT→VALIDATED→EXPORTED→WAITING_FOR_RESPONSE→…) + current-state pill + last-update · D usage-scope rows · E **3 human/controller truth statements** ("external AI is a review aid only", "final decision stays with the human reviewer", "no acceptance without verification and audit"); RIGHT "سياق الحوكمة" = **8 icon-bearing governance cards** (scope · excluded data · source-chain audit · verification results · sensitive data · decision packaging · human decision required · next action); BOTTOM collapsed temp workspace with explicit "contains when expanded" description. ~80+ items.

**Current shows** (3 PNGs, all byte-identical `63215d07`): English "Manual Ai · Workspace" + generic typed-collection workbench: toolbar `draft / export / import / review` (export/import/review **disabled**), LEFT "...orkbench · Collection" (**truncated title**) + single empty box `.No current records`; CENTER "Manual Ai workbench" + one-line ceiling prose + a card `Manual Ai workbench / EMPTY / State` + "How this workspace works" (3 bullets); RIGHT "Manual Ai workbench · Context" repeating **the same EMPTY/State card**; BOTTOM "Manual Ai workbench · Detail / No domain-owned deep projection is bound". ~6 items.

**Truth ceilings:** the prose line states "no automatic provider call or canonical publication" ✓ weakly. But `hiddenProviderCalls=0`, `automaticCanonicalPublication=false`, `providerMode=MANUAL_ONLY_PROVIDER_NEUTRAL` — the mandated visible ceilings — are **not displayed anywhere** (they exist only in `adapters/manual_ai/domain-adapter.ts:136` `diagnosticProjection()`). The reference's three human/controller statements (E) are absent.

**Density:** ~92 % under-populated; empty LEFT list; dead CENTER/RIGHT below one card; no queue, no records, no stepper, no governance context.
**Component completeness:** present: empty-state treatment (honest, not green), disabled action affordances. Missing: everything the reference defines.
**Shared-component dependency:** `renderTypedCollectionStage` (**shared**) actively harms this surface: generic "How this workspace works" filler, truncated collection title (`...orkbench · Collection`), and the RIGHT region renders **the same detail projection as CENTER** (`m0-controller-composition.ts:105` uses `semanticProjection(detail)` for both) — a built-in violation of `ONE INFORMATION ITEM → ONE AUTHORITATIVE DISPLAY LOCATION`.

**Defects:** MA-1 (V4, SURFACE_COMPOSITION+CONTENT_MODEL): surface is an empty shell vs a dense governance workbench. · MA-2 (V2, CONTENT_MODEL): truth ceilings not visible (mandated content). · MA-3 (V2, SHARED_COMPONENT): typed-collection stage duplicates CENTER↔RIGHT, truncates titles, inserts filler. · MA-4 (V1, IMPLEMENTATION §12): leading-period bidi punctuation in description. · MA-5 (STOP/REPORT overlay, Owner): Q-6 provenance-recording mechanism remains unspecified — no Writer may decide it; the reference's provenance rows therefore cannot be populated beyond already-proven ceilings. Routing: surface Writer (MA-1/2/4), shared-component owner (MA-3), Owner STOP/REPORT (MA-5).

**Verdict: VISUAL_FAIL** (with Q-6 Owner-blocked content overlay)

---

## 5. BACKUP (reference = the RESTORE DRILL state specifically)

**Reference actually shows** (`05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png`, `782e813a`, Arabic RTL):
7 TOP actions (بدء نسخة احتياطية / التحقق من السلامة / **بدء اختبار استعادة** / مقارنة / جدولة / التقرير / …) + a **restoration-safety warning strip**; LEFT: backup collections + **restore-point queue (count 12)** with search/filter/sort and **5 restore points** (BKP-2026-08-30-001 …, VERIFIED/WARNING badges, lock icons) + "view all" + **4 accordion groups** (drills 6 / schedules 4 / policies / scan reports 8); CENTER: **"Restore Drill: RDRILL-0041"** header + `COMPLETED / VERIFIED` pill + metadata row (source backup · started 02:25 · completed 02:34 · duration 00:08:42 · environment `isolate-drill-01`) + **8-step numbered drill stepper** (تحديد النسخة → … → إكمال الاختبار, PASS/VERIFIED states) + **9 verification result cards** (checksum · app settings · RTO 00:08:42 · DB restore · logs · RPO 00:14:19 · large files · post-restore state · final verdict "النسخة قابلة للاستعادة") + **expected-vs-actual comparison tiles** (12/12 DB · 128/128 tables · 1,842/1,842 records · 24,590/24,590 files · 356/356 settings · 0 diffs) with legend; RIGHT "سياق النسخة" = **10 blocks** (dependencies list · retention policy · last integrity check · encryption/manifest · restore readiness · dependency versions · risk warning (avoid direct restore in production) · RPO/RTO targets · test interpretation); BOTTOM closed "مساحة عمل تشغيلية مؤقتة" with contents-listed description + "فتح مساحة العمل". ~70+ items. **The multi-state truth lives in this design:** isolated environment `isolate-drill-01`, verdict "restorable" (not "restored"), and the risk warning against production restore.

**Current shows** (all 12 PNGs — verified by region fingerprinting that no evidence file carries the reference layout): English "Backup · Runtime Capability" + "Recovery Safety Workbench": TOP 6 commands (Create verified BackupPackage … Request activation authority); LEFT "BackupPackage" = 1 package card (id + digest wrapping over 3 lines), lower 60 % empty; CENTER: 2-line description ("Package → plan → preview → stage → isolated drill → activation request. `STAGED_AND_VERIFIED != LIVE_RESTORED`…" ✓ good truth prose), **5 stage chips** (`Activation` / `Drill` / `Stage` / `Preview` / `Plan`), and a "Recovery lifecycle" card with 5 command buttons + a raw JSON receipt **clipped at the bottom**; RIGHT "Provider truth" = `liveRestored: false` · `productionDatabaseMutated: false` · `activation: <AUTHORITY_PENDING|NOT_REQUESTED>` · durable failed-attempt/compensation journal. ~20 items.

**W05-specific check (multi-state legibility):** the current workbench **does** keep the states apart — the five stage chips (`Drill: STAGED_AND_VERIFIED`, `Activation: AUTHORITY_PENDING`) plus the `Provider truth` panel (`liveRestored: false`, `productionDatabaseMutated: false`) make staged-verified ≠ live-restored ≠ authority-pending **legible**. That part passes. What fails is fidelity: the reference's drill report (stepper, 9 verification cards, comparison tiles, drill metadata, restore-point queue, 10 context blocks, safety warning) is entirely absent, and `stagedVerifiedIsLiveRestored=false` appears only as ASCII prose/chips in English, never as the reference's product narrative ("النسخة قابلة للاستعادة" + isolated environment + production-restore warning).

**Density:** ~70 % under-populated. **Component completeness:** present: stage chips, provider-truth panel, package card, lifecycle command card + JSON receipt. Missing: restore-point queue, drill report, stepper, verification cards, comparison tiles, context blocks, safety warning strip, accordions.
**Shared-component dependency:** bespoke adapter mount; `WorkspaceFoundation` correct; the JSON-receipt-as-content pattern is honest but is **raw debug output standing in for product presentation** (L3 substitution defect).

**Defects:** B-1 (V4, SURFACE_COMPOSITION): no drill-report reconstruction vs the OWNER_CONFIRMED RESTORE DRILL reference. · B-2 (V2, CONTENT_MODEL): `stagedVerifiedIsLiveRestored=false` legible only as English tokens; the reference's safety warning / isolation environment / "restorable not restored" framing absent. · B-3 (V2, SURFACE_COMPOSITION): LEFT/CENTER under-populated; JSON receipt used as primary content and clipped. · B-4 (V2, EVIDENCE/ORACLE): `after-drill` label in round 1 captured the pre-drill state (receipt shows `state: STAGED`), and no screenshot evidences the drill-report/preview states; flow naming over-claims (`restore-round-trip` includes no preview screenshot). · B-5 (V1, IMPLEMENTATION §12): digest wraps 3 lines; stray accent bars beside right-panel text. Routing: surface Writer (B-1/2/3/5), Coordinator (B-4).

**Verdict: VISUAL_FAIL** (multi-state truth: PASS sub-item; reference fidelity: FAIL)

---

## 6. AUDIT

**Reference actually shows** (`06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png`, `7cb34c83`, Arabic RTL):
LEFT = **9 event categories with counts** (كل الأحداث 12,842 … إجراءات حساسة أمانة 619) + **4 saved views**; TOP = title + subtitle + filter toolbar (search + 4 dropdowns + trace-link + export + last-update); CENTER = **10-row × 13-column audit event table** (time · actor · action · target · workspace · source · result · trace id …) + **trace chain panel** (`TRACE-5B9C-22A1`, 3 numbered nodes with arrows, per-node result/source) + BOTTOM tabs (raw data / data model / chain (3) / before-after / source audit) with JSON viewer, model metadata and timestamped source checks; RIGHT "selected event details" = actor identity block (avatar, role, group, مثبّت chip) · session/device context (6 fields) · action details (5) · reason · before/after (changed markers) · 3 related references · policy basis · amber out-of-hours warning. ~150+ items. **Traceability/provenance density is the identity.**

**Current shows** (12 PNGs): English "Audit · Durable Event Trace": LEFT "…itEvent / provenance" = "Inspection chain" card (Ready · AUDIT/PROVENANCE · `w05-durable-audit-events` · rev 12) + FILTER VISIBLE RECORDS + "Ready: Durable AuditEvents…" + a scrolling list of `#1 … #N` event rows (id/action/state/actor, wrapped UUIDs); CENTER = "Status meaning" card (AuditEvent != SemanticCommandBus receipt ✓ · database immutability not claimed ✓ · SHA-256 not encryption ✓) + "Hash-chain verification" card (`VALID_CHAIN`, `events 12`, `persistence PROVIDER_DURABLE_JSONL`, `annotations 0`, first-invalid/scope) + "Separate annotation revisions" form (Annotate + 2 inputs + empty notes list); RIGHT "Audit context" = "Selected integrity context" (3 lines); BOTTOM "Audit revisions" (annotations, empty). ~25 items.

**Truth ceilings:** excellent — all four ceilings are visibly stated (receipts≠events, hash≠encryption, no DB-immutability claim, annotations separate + "AuditEvent bytes remain unchanged") ✓. This is the best truth projection in W05.
**L1–L4:** L1/V4 — no event table, no trace chain, no tabbed bottom workspace, no actor/session/action detail; English vs Arabic; ~80 % less density. L2/V3 — RIGHT is 3 lines vs an 8-block event-detail panel; LEFT mixes list+card chrome. L3/V2 — missing saved views, category counts, filter toolbar, before/after diff, related refs, policy basis. L4/V1 — UUID wrap in list rows; `12 First invalid: none · scope` word-order instability (bidi); annotation form inputs unlabeled visually.
**Critical state defect:** `after-annotate` is **byte-identical** to `after-verify` — a failed (fail-closed) annotation renders no error (`lastError` never projected), and the form status line is unused when commands run through the bus. Annotation revisions — the surface's own named feature — therefore have no observable behaviour in evidence.

**Shared-component dependency:** `AuditProvenanceInteractionCore` + `AuditProvenanceHost` (shared) render event chains, verify state and annotation truth honestly — **helping, contract valid, keep unchanged**; the missing table/trace-chain richness is surface-level. `ReviewAuditFamilyHost` reuse is appropriate.

**Defects:** A-1 (V4, SURFACE_COMPOSITION): no reference architecture (table/chain/detail panel). · A-2 (V2, IMPLEMENTATION+EVIDENCE): annotation outcome invisible (`lastError`/status unprojected; identical screenshots). · A-3 (V2, CONTENT_MODEL): no filter toolbar, saved views, category counts, before/after, actor context. · A-4 (V1, IMPLEMENTATION §12): wrapping/bidi word-order. Routing: surface Writer (A-1/3/4), shared-component owner (A-2 minimal: project annotate failure/settlement), Coordinator (evidence).

**Verdict: VISUAL_FAIL** (truth ceilings sub-item: PASS)

---

## 7. RELEASES

**Reference actually shows** (`07_RELEASES/CEP_SYSTEM_RELEASES_REFERENCE.png`, `9e7c8747`, Arabic RTL):
LEFT = release management tree (نظرة عامة · الأدلة 24 · active releases REL-2026.08.31-RC2/RC1/… with counts · completed evidence · view-all/export links); TOP = 6 actions incl. audit reconciliation; CENTER = release header + `READY WITH WARNING` pill + actions + **release info strip** (id · version · environment · owner · readiness · timestamps) + **4 tiles** (128 changes / 94 files / 23 critical / 87 checkpoints) + **readiness analytics** (charts, 96.4 %, 99.2 %) + **audit reconciliation panel** (128 verified, 94 %, 12 need review, 3 change rows) + **verification-points panel** (87 pts, 4 categories, 6 missing warning) + **3 risk cards** + **4 evidence rows**; RIGHT = **governance & approval** (4 named approvers with avatars, approved/pending/rejected states, remind button) + **release history timeline** (4 entries) + **deployment & stability** ("next: Production · **after final approval**", stability 99.2 %, schedule-deployment). ~80+ items. The three truths are structurally separate: readiness pill · approval states · deployment "after final approval".

**Current shows** (6 PNGs, `empty-truth` == `compare-blocked` byte-identical): English "Releases · Workspace" generic typed-collection workbench — toolbar `inspect / compare / plan / requestAuthorization` (compare/plan/requestAuthorization **disabled**), LEFT "...orkbench · Collection" + `.No current records`, CENTER "Releases workbench" + the one-line three-truths prose + `EMPTY / State` card + 3 "How this workspace works" bullets, RIGHT repeating the same `EMPTY / State` card, BOTTOM "No domain-owned deep projection is bound". ~6 items.

**Truth ceilings:** the three-truth sentence is correct and `empty set not green` is honored (EMPTY is neutral, no false green). But readiness ≠ authorization ≠ deployment is **one prose line** — the reference gives each truth its own region, states, actors and timeline. `compare/inspect fail closed` is proven **only programmatically**; the fail-closed feedback is byte-invisible.

**Density:** ~92 % under-populated — the emptiest surface together with manual_ai/configuration. **Component completeness:** absent almost entirely (no candidate list, no tiles, no approvals, no history, no deployment block). **Shared-component dependency:** same `renderTypedCollectionStage` harm as manual_ai (CENTER↔RIGHT duplication, filler, truncated title).

**Defects:** R-1 (V4, SURFACE_COMPOSITION+CONTENT_MODEL): empty workbench vs dense release-accountability reference. · R-2 (V2, EVIDENCE/ORACLE+IMPLEMENTATION): `compare-blocked` identical to `empty-truth`; fail-closed feedback must render (notice/badge). · R-3 (V2, CONTENT_MODEL): three truths not given separate visible homes (contract §11 semantic separations are visual+textual). · R-4 (V2, SHARED_COMPONENT): typed-collection duplication/filler. Routing: surface Writer (R-1/3), shared-component owner (R-4), Coordinator + surface Writer (R-2).

**Verdict: VISUAL_FAIL**

---

## 8. CONFIGURATION

**Reference actually shows** (`08_CONFIGURATION/CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png`, `bb32df27`, Arabic RTL):
LEFT = components tree (Platform/Security/Simulation/Learning/Evidence/AI Bridge with ✓/⚠/✕ + setting counts) + **4 environments** (Development/Testing/Staging/Production with states); TOP = 6 actions (نشر Revision / حفظ / مقابلة الإصدارات / فحص / تصدير مسودة / …); CENTER = **change-review state strip** (المراجعة · التحقق · الاعتماد · النشر) + change summary (128 modified / 23 critical / 47 new / 12 deleted) + discovered risks + **deployment stage stepper** (DRAFT→VALIDATING→APPROVED→PUBLISHED→ROLLED BACK) + approvals + change log + **split diff view** (old vs new config trees, +/-/~ markers, severity chips, view tabs); RIGHT = **change scope panel** (scope, 3 affected modules, change size, estimated activation time, target environment, 8 dependencies, 2 conflicts) + **3 configuration alerts** + **publication policy** ("requires Security Owner approval", "**automatic publication disabled**", request-approval button) + audit log. ~90+ items.

**Current shows**: (a) `configuration-boundary` (4 PNGs): English "Configuration · Workspace" typed-collection workbench — toolbar `edit / diff / validate / reset / request Apply`, LEFT "...orkbench · Collection" + `.No current records`, CENTER "Configuration workbench" + boundary prose + `EMPTY / State` card + 3 bullets, RIGHT duplicating `EMPTY / State`, BOTTOM "No domain-owned deep projection is bound"; (b) `settings-transfer` (3 PNGs, == `settings-transfer-done` byte-identical): the **Settings modal** (`الإعدادات / Settings`) with groups PREFERENCES / SETTINGS / COMMANDS / SHORTCUTS and 7 rows, incl. `Export / Import / reset` (the SC-011 `settings.transfer` home) — last row `Global shortcuts` **clipped** at the modal edge.

**SC-011 / preferences-store check (mandated):** the `settings.transfer` action home is **visible** (`Export / Import / reset` under SETTINGS; `foundation/global/settings/center.ts` `sc011PreferenceTransferActionHome:'settings.transfer'`; DOM carries the three `data-settings-action` attributes per flow assertions). But it is **not complete as a visual product state**: the three actions (export · import · reset) appear as one collapsed row rather than three ordered items; **no receipt/result is ever displayed** (`settings-transfer-done` is byte-identical to `settings-transfer`; receipts `EXPORTED / PERSISTED / IMPORT_REJECTED / resetCount` have no display location); and the W05 product delta — `foundation/global/preferences/store.ts#import` now preserving the context-free `session` scope so a transfer cannot clobber unscoped state — has **zero visible reflection** (no scope semantics, no "carried scope applied / unscoped preserved" line in the transfer UI).

**Density:** ~90 % under-populated vs reference. **Component completeness:** present: settings modal (SC-011 home), empty-state, disabled/available command states. Missing: components tree, environments, diff view, scope panel, alerts, publication policy (incl. the visible "automatic publication disabled" ceiling), stepper, approvals.
**Shared-component dependency:** `SettingsCenterOwner` + `ScopedPreferencesOwner` are contract-correct and well tested (P-W4E 36/36, P-SC011) — **unchanged contract recommended**; the visual gap is presentation of receipts/scope semantics (minimal additive change) plus the same `renderTypedCollectionStage` harm.

**Defects:** C-1 (V4, SURFACE_COMPOSITION+CONTENT_MODEL): empty workbench vs the configuration-revision reference (diff view etc.). · C-2 (V2, CONTENT_MODEL+IMPLEMENTATION): transfer receipts and session-scope semantics invisible; `settings-transfer-done` byte-identical. · C-3 (V1/V2, CONTENT_MODEL): SC-011 exposes 3 actions as 1 collapsed row; modal clips its last row. · C-4 (V2, CONTENT_MODEL): the "automatic publication disabled" ceiling is not visibly owned by this surface (it is configuration truth in the reference's policy panel). Routing: surface Writer (C-1..C-4), shared-component owner (optional receipt projection in SettingsCenterOwner), Owner note: store.ts semantics already accepted — no decision needed.

**Verdict: VISUAL_FAIL**

---

## 9. Shared components — improvement required vs unchanged

**Genuinely require improvement (with evidence):**
1. **`renderTypedCollectionStage` / typed-collection workbench template** (`surfaces/m0-controller-composition.ts:103–105,194`) — renders the same `semanticProjection(detail)` into CENTER and RIGHT (structural violation of ONE-INFORMATION-ONE-LOCATION), truncates collection titles (`...orkbench · Collection`), and injects generic "How this workspace works" filler in place of surface content. Affects manual_ai, releases, configuration (and non-W05 consumers share it — improve the primitive minimally, preserve consumers). → shared-component owner + Coordinator (10-step protocol; regression-test evidence/reviews/mastery/portfolio/rq consumers).
2. **Audit annotate failure/settlement projection** (minimal): `DurableAuditRuntimeAdapter.lastError` and the form `status` line are never rendered on bus-driven annotate (`surfaces/audit/index.ts:36`) → invisible fail-closed. A one-line settlement projection fixes an entire invisible-state class. → shared-component owner.
3. **`ContextInspectorHost` describe-lens vocabulary** — single generic field-list lens cannot express the references' impact/dependency/policy/config-scope context blocks (health RIGHT is one line). Additive lens/block kinds needed. → shared-component owner.

**Contract valid — must remain unchanged:**
- `AuditProvenanceInteractionCore` + `AuditProvenanceHost` — truthful event-chain/verify/annotation model (hash-chain, first-invalid, annotation-separate semantics all render correctly).
- `SettingsCenterOwner` / `ScopedPreferencesOwner` (`settings.transfer` home, import/export/reset semantics, session-scope preservation) — ownership and semantics correct per C-02/D03A; tested 36/36 + D03A.
- `WorkspaceFoundation` region/toolbar/status contract and `ReusableToolbarTemplateOwner` availability states (disabled buttons truthfully shown) — correct TOP/BOTTOM ownership; BOTTOM closed-by-default matches contract §3.5.
- `BottomShelf / BottomDeepWorkOwner` collapsed-by-default behaviour — correct; the gap is evidence (never expanded), not the component.
- `ReviewAuditFamilyHost` — appropriate shared provenance presentation for validation RIGHT.

---

## 10. Empty / under-populated surfaces and why

| Surface | Population vs reference | Why (root cause) |
|---|---|---|
| manual_ai | ~8 % (6 items vs ~80) | typed-collection mount with zero bound rows; Q-6 blocks the provenance rows; ceilings not projected |
| releases | ~8 % (6 items vs ~80) | typed-collection mount, no rows, no three-truth regions |
| configuration | ~10 % (+7-row settings modal vs ~90) | typed-collection mount, no rows; receipts/scope semantics unprojected |
| validation | ~15 % | bespoke but input-focused workbench; session/category/table content model absent |
| audit | ~20 % | provenance core correct but table/chain/detail content model absent |
| health | ~35 % | runtime-capability composition replaces component dashboard |
| backup | ~30 % | runtime-capability composition replaces drill report |
| processing | ~25 % (no reference) | 2 job rows; handoff/retry/running states unrendered; clipped table |

None of these gaps may be filled with invented product facts; each is fillable from material the references and existing domain models already define (queues, counts, receipts, statuses, metadata fields).

---

## 11. Consolidated defect register (severity · root cause · routing)

| ID | Surface | Defect (short) | Sev | Root cause | Routing |
|---|---|---|---|---|---|
| H-1 | health | Whole-surface mismatch vs Arabic dashboard | V4 | SURFACE_COMPOSITION | surface Writer |
| H-2 | health | Diagnostic run invisible outside collapsed shelf; evidence unproven | V2 | CONTENT_MODEL / EVIDENCE/ORACLE | surface Writer + Coordinator |
| H-3 | health | Actions duplicated TOP+CENTER | V2 | SURFACE_COMPOSITION | surface Writer |
| H-4 | health | Header + CENTER/RIGHT status duplication | V2 | SURFACE_COMPOSITION | surface Writer |
| H-5 | health | Bidi garble, timestamp wrap, clipped Arabic | V1 | IMPLEMENTATION | surface Writer |
| P-1 | processing | Validation-handoff state invisible; mislabelled evidence | V3 | EVIDENCE/ORACLE + CONTENT_MODEL | surface Writer + Coordinator |
| P-2 | processing | Running/retry states illegible (orphan `OBSERVING`) | V2 | SURFACE_COMPOSITION | surface Writer |
| P-3 | processing | Duplicated action homes | V2 | SURFACE_COMPOSITION | surface Writer |
| P-4 | processing | UUID wrap, clipped attempt table | V1 | IMPLEMENTATION | surface Writer |
| P-5 | processing | Dead CENTER-left; thin LEFT | V2 | SURFACE_COMPOSITION | surface Writer |
| V-1 | validation | Workbench vs session-dashboard reference | V4 | SURFACE_COMPOSITION | surface Writer |
| V-2 | validation | Findings feedback clobbered → 0 px evidence | V2 | IMPLEMENTATION | surface Writer |
| V-3 | validation | Missing queue/tiles/table/severity/re-run-blocked | V2 | CONTENT_MODEL | surface Writer |
| V-4 | validation | Wrapping, vertical label, punctuation instability | V1 | IMPLEMENTATION | surface Writer |
| MA-1 | manual_ai | Empty shell vs dense governance workbench | V4 | SURFACE_COMPOSITION + CONTENT_MODEL | surface Writer |
| MA-2 | manual_ai | Truth ceilings not visible | V2 | CONTENT_MODEL | surface Writer |
| MA-3 | manual_ai/releases/configuration | Typed-collection CENTER↔RIGHT duplication + filler | V2 | SHARED_COMPONENT | shared-component owner |
| MA-4 | manual_ai | Bidi punctuation instability | V1 | IMPLEMENTATION | surface Writer |
| MA-5 | manual_ai | Q-6 provenance mechanism unspecified | (STOP/REPORT) | OWNER_CONSTRAINT | Owner STOP/REPORT |
| B-1 | backup | No drill-report reconstruction vs RESTORE DRILL reference | V4 | SURFACE_COMPOSITION | surface Writer |
| B-2 | backup | staged≠live≠authority framing not product-legible | V2 | CONTENT_MODEL | surface Writer |
| B-3 | backup | Under-populated panes; raw JSON as primary content | V2 | SURFACE_COMPOSITION | surface Writer |
| B-4 | backup | Round-1 after-drill evidence captured pre-drill state | V2 | EVIDENCE/ORACLE | Coordinator |
| B-5 | backup | Digest wrap, stray accent bars | V1 | IMPLEMENTATION | surface Writer |
| A-1 | audit | No table/chain/detail reference architecture | V4 | SURFACE_COMPOSITION | surface Writer |
| A-2 | audit | Annotation outcome invisible (identical screenshots) | V2 | IMPLEMENTATION | shared-component owner + surface Writer |
| A-3 | audit | Missing filters/saved views/counts/before-after/actor | V2 | CONTENT_MODEL | surface Writer |
| A-4 | audit | Wrap + bidi word-order | V1 | IMPLEMENTATION | surface Writer |
| R-1 | releases | Empty workbench vs dense accountability reference | V4 | SURFACE_COMPOSITION + CONTENT_MODEL | surface Writer |
| R-2 | releases | Compare-blocked feedback byte-invisible | V2 | EVIDENCE/ORACLE + IMPLEMENTATION | Coordinator + surface Writer |
| R-3 | releases | Three truths lack separate visible homes | V2 | CONTENT_MODEL | surface Writer |
| C-1 | configuration | Empty workbench vs revision reference (diff etc.) | V4 | SURFACE_COMPOSITION + CONTENT_MODEL | surface Writer |
| C-2 | configuration | Transfer receipts + session-scope semantics invisible | V2 | CONTENT_MODEL | surface Writer |
| C-3 | configuration | 3 SC-011 actions as 1 row; modal clips last row | V1 | CONTENT_MODEL | surface Writer |
| C-4 | configuration | "Automatic publication disabled" ceiling not visible | V2 | CONTENT_MODEL | surface Writer |
| G-1 | all | Distinct flow states captured byte/pixel-identical (6 pairs) | V3 | EVIDENCE/ORACLE | Coordinator (recapture policy) |
| G-2 | all | Flow names/suffixes over-claim actions never performed | V2 | EVIDENCE/ORACLE | Coordinator (harness) |
| G-3 | all | Arabic-first contract not honored on any W05 surface (all-English centers) | V3 | SURFACE_COMPOSITION / OWNER_CONSTRAINT* | Coordinator + Owner (*confirm intended product language; contract §2.2/§12 says Arabic-first) |

Counts: V4 ×6 · V3 ×3 · V2 ×18 · V1 ×7 (+1 STOP/REPORT). Surface-level: 30 · shared-component-level: 3 (MA-3, A-2, plus ContextInspectorHost lens gap folded into H-1/V-1) · evidence-level: 3 (G-1..G-2, H-2/B-4 fold-ins).

## 12. Re-comparison plan (no auto-repair loop)

Per defect: fix → recapture at 1440×980 (and 1024×900 where panes collapse) → re-open PNGs → re-run L1–L4 against the named reference → record remaining differences with explicit justification. Evidence must additionally capture (a) BOTTOM shelf expanded at least once per surface that owns one, (b) one screenshot per **enacted** state, with action sequences that actually perform the named actions, (c) byte-distinct proof for every pair currently identical. All fixes to shared components follow the 10-step protocol with consumer regression (evidence/reviews/mastery/portfolio/rq for the typed-collection template).

## 13. Verdicts

| Surface | Verdict | First highest-risk defects |
|---|---|---|
| health | **VISUAL_FAIL** | H-1 (V4), H-2 (V2), G-1 |
| processing | **VISUAL_FAIL** | P-1 (V3), P-2 (V2) |
| validation | **VISUAL_FAIL** | V-1 (V4), V-2 (V2) |
| manual_ai | **VISUAL_FAIL** (Q-6 STOP/REPORT overlay) | MA-1 (V4), MA-2 (V2), MA-5 |
| backup | **VISUAL_FAIL** (multi-state truth sub-item PASS) | B-1 (V4), B-2 (V2), B-4 (V2) |
| audit | **VISUAL_FAIL** (truth-ceiling sub-item PASS) | A-1 (V4), A-2 (V2) |
| releases | **VISUAL_FAIL** | R-1 (V4), R-2 (V2) |
| configuration | **VISUAL_FAIL** | C-1 (V4), C-2 (V2) |

No surface reaches `VISUAL_PASS`; none is `BLOCKED` (the visual work is executable here — only MA-5/Q-6 content is Owner-blocked). The register rows remain `FUNCTIONAL_ONLY / ACCEPTANCE_REQUIRES_REVIEW` at Controller level until the loop above closes; **functional-only acceptance must never be recorded as VISUAL_PASS** (governance §12).

## 14. Reference PNGs actually used (all opened and inspected)

1. `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/01_HEALTH/Arabic Operational Health Dashboard.png` (f5f78968)
2. `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/03_VALIDATION/CEP_SYSTEM_VALIDATION_REFERENCE.png` (0074ab58)
3. `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/04_AI_BRIDGE/CEP_SYSTEM_AI_BRIDGE_REFERENCE.png` (ae1d8df7)
4. `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png` (782e813a)
5. `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/06_AUDIT/CEP_SYSTEM_AUDIT_TRACEABILITY_REFERENCE.png` (7cb34c83)
6. `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/07_RELEASES/CEP_SYSTEM_RELEASES_REFERENCE.png` (9e7c8747)
7. `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/08_CONFIGURATION/CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png` (bb32df27)

SHA-256 prefixes match `FINAL_VISUAL_REFERENCE_REGISTER.md`. Processing: no reference (contract-derived judgement only). Current evidence inspected: all 64 PNGs in `writer-output/W05/evidence/` (state sets spot-inspected visually; the full set classified by pixel fingerprint and hash; per-state differences measured by canvas diff).
