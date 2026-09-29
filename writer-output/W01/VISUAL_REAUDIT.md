# VISUAL_REAUDIT — W01 · Shared Global Shell + Today

**Auditor:** W01 Visual Fidelity Auditor · **Date:** 2026-09-29 · **Branch:** `writer/mi-serial` · **HEAD:** `8172bf1`
**Scope:** `shell` (CONTRACT_DERIVABLE) + `today` (OWNER_CONFIRMED_FINAL_REFERENCE) — L1–L4 comparison against the actual reference image and `CEP-VIS-001-FINAL` (CEP-DEC-027).
**Method:** governance `controller/12_execution/07_visual_fidelity_governance.md` V0–V4 · R0–R7 loop · 18-box gate (§10). This is an **audit record only** — no product source was changed.

---

## 0. Evidence integrity (EVIDENCE/ORACLE incidents — read first)

Two sibling auditors warned the harness image-render channel is non-deterministic. **This audit hit it twice**, and mitigated as required (deterministic cross-checks + filename burn-in):

| # | Incident | Mitigation | Residual risk |
|---|---|---|---|
| E1 | **Filename ↔ image mis-attribution.** `read` on `evidence/shell/matched-viewport-baseline-20260929T052233Z…png` rendered the *Today* picture, and `read` of `evidence/today/…052236Z…png` rendered the *shell-home* picture. Deterministic `tesseract` OCR of the same two files returns the **opposite** (and self-consistent) attribution: `shell/…052233Z` = "CEP · Workspace Home / Global destinations / Route context"; `today/…052236Z` = "Today · Projection / Today projection / TODAY_PROVIDER_UNBOUND". | All claims below are anchored on **OCR of the file bytes** (authoritative per filename) + sha256 + PNG dimensions, not on which picture the `read` channel associates with which path. Composites were built with the source filename burned into a red label bar. | The render channel's *file identity* cannot be trusted. Every image claim below carries its OCR/dimension anchor. |
| E2 | **Stale image served.** Two `read` calls on `/tmp/opencode/w01audit/responsive-1024.png` (and on a byte-identical copy `r1024-v2.png`, sha256 `b6e2606d…`) both returned the *attention* composite (`today-attention-l3.png`) instead — provable by its burned label bar reading `REF-ATTENTION-COLUMN / CUR-ATTENTION-CARD`. | The 1024×900 responsive judgement was made from deterministic OCR + pixel metrics instead of a rendered view. | The `today-attention-l3.png` render itself is trustworthy *as a picture* (it matched its own label and OCR). |

Deterministic artefacts produced by this audit (in `/tmp/opencode/w01audit/`, composites carry burned-in source filenames):
`today-l1-composite.png`, `shell-chrome-l2.png`, `today-hero-l2.png`, `today-attention-l3.png`, `today-recent-progress-l3.png`, `responsive-1024.png`, plus OCR crops.

Evidence used (all pre-existing, `writer-output/W01/evidence/`, 216 PNGs + receipts):
`matched-viewport-*` at 1440×1000 and 1024×900 × {baseline, keyboard-focus} for both surfaces (candidate `b9419922` = OWNED_PARTITION) · `today-render-and-filter-{all,attention}-filter-*` (`c82cec63`) · `shell-destination-routing-*` · `back-forward-semantic-context-*` · `deep-work-open-close-lifecycle-*` · `diagnostics-gate-*`. Cross-read against `BROWSER_RECEIPT.json`, `VISUAL_CAPTURE_RECEIPT.json`, `CBF002_PROBE.json`, `SERIALIZED_HOTSPOT_REQUEST.md`, `W01_HANDOFF.md`.

---

## 1. SURFACE — `today` (`/?surface=today`, banner "Today · Projection")

### 1.1 What the reference actually shows
`cep-writer/references/visual/00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png` — opened and inspected (1520×1034, sha256 `3f75eac7…` verified against register). It is a dense, Arabic-first, RTL orchestration dashboard:

- **Global frame (top):** brand block (shield mark + `CEP` + bilingual tagline "منصة التعليم للأمن السيبراني / Cybersecurity Education Platform") · **5 clean global destination links** (اليوم active-cyan-underlined, المعرفة والتعلّم, المحاكاة والمؤسسات, التقدم والأدلة, النظام والعمليات) · search "البحث في المنصة… Ctrl K" · **notification bell + red badge "5"** · **dark-mode moon toggle** · **user avatar + "أحمد / مسؤول المنصة" + chevron**. No internal codes anywhere.
- **Greeting band:** sun-icon tile + "مرحبًا أحمد 👋" (personalised) + "الليك ما يخصك لمتابعة يومك." and a **date/time anchor block** "الاثنين 18 مايو 2025 · 10:45 ص (UTC+3)" with calendar icon — one authoritative time anchor.
- **متابعة الجلسة الحالية** (session-continue, large card): illustration thumbnail, breadcrumb "المعرفة والتعلّم → Learn", title "SQL Injection — Lesson 02", status badge "قيد التنفيذ", "آخر نشاط: منذ 18 دقيقة", linked "آخر موضوع: 03 السيناريو — مثيل إدخال غير موثوق", explanation line, primary CTA "متابعة →", secondary "عرض السياق 👁", metadata chips "المسار: حقن SQL" / "المرحلة: الدرس".
- **الإجراء التالي الموصى به** (next action): meta chips (⊙ SQL Injection · ⏱ 12 دقيقة · 🔗 الإعداد التالي غير المحتسب), description, primary "ابدأ الممارسة ▷", secondary "لماذا هذا؟ ?".
- **لماذا الآن؟**: 4 ✓-bullets (Lesson 02 / المطلوب السابق مكتمل / Basic Lab يجمع التحقق الحالي / الإكمال يفتح التقدم التالٍ) + boxed "يحقق ذلك:" → linked object "SQL Injection — Basic Lab" + target icon.
- **يحتاج انتباهك (4)** (right column): bell icon + red count badge; 4 full item cards, each = colored icon tile + domain label + severity chip (متوسط/عالٍ/منخفض – متوسط) + title + technical id (Evidence EVD-0042 · RUN-0048 · Restore verification · RQ-SRC-018) + reason line + right-aligned action button (فتح المراجعة / عرض السبب / فتح الحالة / مراجعة التعارض); footer "← عرض جميع عناصر الانتباه".
- **السابق الأخير** (recent context): 5 rows × [time-ago | domain + icon | action (EN technical token) | status icon] + footer "عرض كل السياق الأخير →".
- **توقع التقدم** (progress projection): 5 metric rows with icons (SQL Injection 7/10 ring · مراجعات معلقة 2 · تجربة تشغيل في المحاكاة 1 · تجميعات مكتملة هذا الأسبوع 3 · تحذير تنشيل واحد 1) + footer "عرض توقع التقدم التفصيلي →".

≈ **40+ meaningful information items**, 6 regions, strong hierarchy, rich metadata, per-region affordances, no dead zone.

### 1.2 What the current implementation shows
(`evidence/today/matched-viewport-baseline-20260929T052236Z-b9419922.png`, 1440×1000, OCR-anchored)

Three-pane workspace frame (LEFT / CENTER / RIGHT + banner + toolbar + bottom strip). **All six reference regions exist as titled shells — and every one is empty:**

- CENTER hero: eyebrow "إسقاط يومي من مصادر الأنشطة الأصلية · اليوم", generic "مرحبًا، إليك سياق يومك" (no user, **no date/time anchor**), state-machinery line "آخر رد موصول: لا يوجد رد مسرد حالة حالياً" + `UNAVAILABLE` chip; the 6-filter chip row (الكل ✓ / الجلسة / الموصى به / الانتباه / السياق الأخير / التقدم / تحديث — set is complete and matches the reference); red notice "مصادر Today غير مناحة حالياً."; a full-width bar `TODAY_PROVIDER_UNBOUND · UNAVAILABLE · today.current-provider`.
- Region cards (2-col grid): متابعة الجلسة الحالية → "مصادر Today غير مناحة حالياً." · يحتاج انتباهك **(0)** → same line + footer "‹ عرض جميع عناصر الانتباه" · لماذا الآن؟ → "لا يوجد تفسير موصول لهذا الإصدار." · الإجراء التالي الموصى به → same absence line · توقع التقدم / السياق الأخير → same absence line. **0 rows, 0 icons, 0 severity chips, 0 metadata chips, 0 CTAs.**
- LEFT "Today projection": `ALL · Filter` + "No current items" (English) in a boxed empty state.
- RIGHT "Selected Today context": 2 lens tabs + a 2-row `UNAVAILABLE / State` table — otherwise a **~760 px tall dead zone**.
- Bottom: floating "Today · UNAVAILABLE" status pill **overlapping the region cards**, and "Projection status · Observed projection truth only; no progress or Mastery write is inferred".

The emptiness is **not** missing components in code: `surfaces/today/presentation.ts` implements the full set (session grid, badges, code snippet, tags, CTAs, attention items, provider truth rows). It renders nothing because **no Today provider composition is bound** (`TODAY_PROVIDER_UNBOUND`, `providerBoundary:'CENTRAL_REAL_PROVIDER_COMPOSITION_REQUIRED'`, Q-2 open).

### 1.3 Density assessment
| metric | reference | current (1440) | verdict |
|---|---|---|---|
| visible meaningful items | ~40+ | **0** (all regions empty; only state/empty-state tokens) | **UNDER_POPULATED** |
| ink density (fraction ≠ background, per region) | main column 0.065 · attention col 0.046 | center 0.038 · LEFT 0.016 · **RIGHT 0.007** | RIGHT/LEFT are dead zones |
| hierarchy | 6 named regions + per-region sub-structure | region titles only | weak |
| metadata richness | ids, severity, times, domains, counts, tracks, stages | none | none |
| navigation depth | per-item deep links + 3 footer "view all" links | 1 footer link (attention) | shallow |
| controls | 2 CTAs + 2 secondary + 4 item actions + 7 filters | 7 filters + 0 actions | under-populated |
| whitespace | dense-but-ordered | large unexplained empties in every card + right pane | fails §7 |

### 1.4 Component completeness
**Present:** region headings ×6 (titles match reference wording) · filter set (6 + refresh, complete and correctly styled, الكل pressed-state) · projection-state chip · provider-truth bar · footer "view all" link (attention) · bottom projection-status disclaimer · mastery-non-inference semantics.
**Missing vs reference:** greeting band (icon tile, personalised greeting, date/time anchor) · session card contents (thumbnail, breadcrumb, status badge, last-activity, position link, chips ×2, CTA ×2) · next-action card contents (meta chips ×3, description, CTA ×2) · why-now bullets + "يحقق ذلك" box + linked object · attention items ×4 (icon tiles, domain labels, severity chips, ids, reasons, action buttons) + count badge · recent rows ×5 · progress rows ×5 + ring · all per-region action affordances.

### 1.5 Shared-component dependency
| shared component | helping / hurting |
|---|---|
| `GlobalShellNavigationOwner` | **Hurts (shared defect).** Leaks internal `W01–W05` area tokens into the global bar (see §2.5); identity chrome thin (no user identity → the reference's personalised greeting has no source). |
| `WorkspaceFoundation` (WorkspacePaneLayoutOwner paths) | **Mixed.** Correct 3-pane frame + inert/aria semantics; but its foundation toolbar injects generic `⌘ / تركيز / ملاحظة / الملاحظات` chips into every surface (generic filler at L3), its `#foundationStatus` pill **floats over the work surface**, and its dictionary ships `W03 …` prefixed labels. |
| `ReusableToolbarTemplateOwner` (`composeToolbarSlots`) | **Hurts.** Forces the same 4 generic global chips into the Today toolbar row; the surface's real commands (English command-registry labels) sit beside them with no visual grouping vs the reference's action layout. |
| `BottomDeepWorkOwner` | **Helping.** Closed state is `hidden+inert`, lifecycle proven open→close (`deep-work.*` assertions PASS); not "empty UI" (§24). Correctly no invented `domain-diagnostics` tab (A-2). |
| `ContextInspectorHost` / RIGHT region | **Contract-correct, unpopulated.** "Selected Today context" is legitimate §3.4 content; it renders a bare `UNAVAILABLE/State` table → dead zone because the provider is unbound. |
| `TransientFocusOwner` | **Helping.** Keyboard-focus captures pass at both viewports (`keyboard-focus-*`, receipt 32/32). |

### 1.6 Defect register — today
| id | severity | defect | root cause | recommended change | routing |
|---|---|---|---|---|---|
| T-01 | **V4** | All six orchestration regions render empty: 0 of ~40 reference items; `TODAY_PROVIDER_UNBOUND`; every card shows the same absence line. Surface materially fails the intended visual product state. | `ARCHITECTURE` / `CONTENT_MODEL` (no provider composition bound; Q-2 provider owner unadjudicated) | Bind the real Today provider composition (or Owner-authorised representative fixtures per §7 — never invented facts), then re-run R2–R7 | **Coordinator + Owner STOP/REPORT (Q-2)** — remediation BLOCKED on Q-2; the visual state itself is FAIL |
| T-02 | **V3** | RIGHT "Selected Today context" is a ~760 px dead zone (ink 0.007 vs reference column 0.046); LEFT "Today projection" holds one English empty-state box. | `CONTENT_MODEL` (follows T-01) + `SURFACE_COMPOSITION` (empty-state treatment is a bare table) | Populate with selection-scoped context (§3.4) or give the panes an informative, contract-scoped empty state; re-check density | surface Writer + Coordinator (after Q-2) |
| T-03 | **V2** | LEFT `Filter · ALL` summary **does not re-render after `today.filter`** — CENTER pressed chip moves to الانتباه while LEFT still says `ALL`. Two display locations, one state token, disagreeing on screen. Measured (`CBF002_PROBE.json` obs 03/05/06/07; re-verified by OCR of `today-render-and-filter-{all,attention}-filter-*`: both read `ALL · Filter`). Violates `ONE INFORMATION ITEM → ONE AUTHORITATIVE DISPLAY LOCATION`. | `SURFACE_COMPOSITION` (m0 mount-time region write; `m0-controller-composition.ts` hunk filed in `SERIALIZED_HOTSPOT_REQUEST.md`, not applied) | Apply the filed §2a+§2b hunk atomically (Coordinator/Controller plane — W01 may not edit that file) | **Coordinator** (serialized hotspot) |
| T-04 | **V2** | The single absence message "مصادر Today غير مناحة حالياً." is repeated 4× in cards + red notice + `UNAVAILABLE` chip + provider bar + status pill ("Today · UNAVAILABLE") — 6+ display locations for one fact; violates ONE-INFORMATION-ITEM and creates noise exactly where the reference carries content. | `SURFACE_COMPOSITION` | One authoritative absence/provider-truth location (the provider bar already owns it); regions get per-region scoped empty states | surface Writer |
| T-05 | **V2** | Arabic-first surface renders English UI copy: toolbar commands ("Resume projected work", "Refresh Today projection", "Filter Today projection", "Explain recommendation source"), LEFT "No current items", and the floating "Today · UNAVAILABLE" pill. Reference is Arabic-first with English only as technical tokens. Also ".No current items" shows punctuation mis-ordered by RTL placement (bidi defect class). | `IMPLEMENTATION` / `CONTENT_MODEL` (command-registry labels used as UI strings) | Localize command labels for `ar`; keep technical tokens in `<bdi dir="ltr">`; fix LTR-label placement in RTL containers | surface Writer + shared-component owner (command label policy) |
| T-06 | **V2** | Reference's dedicated greeting band is missing: no date/time anchor (the reference's "الاثنين 18 مايو 2025 · 10:45 ص (UTC+3)" is an information item with no authoritative location today), no icon tile, greeting generic (no user identity — blocked upstream by shell identity chrome, see S-04). | `SURFACE_COMPOSITION` + `SHARED_COMPONENT` (identity) | Restore the band with the time anchor; personalisation only if the shell identity model is supplied | surface Writer + shared-component owner |
| T-07 | **V2** | Floating `#foundationStatus` pill overlaps the region-card area at 1440 and 1024 (bottom-centre over content). | `SHARED_COMPONENT` (`WorkspaceFoundation.status` placement) | Anchor the status strip to the bottom bar, not over the stage | shared-component owner |
| T-08 | **V1** | L3 state-styling deltas: count rendered as a boxed `(0)` LTR-paren chip vs the reference's red count pill; footer link chevron is a text `‹` vs the reference's arrow icon; hero eyebrow carries a redundant "· اليوم" suffix and two stray structural icons (السياق / الإنشاء) at the card corners. | `SURFACE_COMPOSITION` | Match reference chip/arrow/iconography treatment | surface Writer |
| T-09 | **V2** | Responsive 1024×900: toolbar wraps to 2 rows and the second row ("Explain recommendation source", disabled) is pushed under the first with no grouping; region grid compresses but the region cards clip at the fold behind the status pill. No overflow, focus OK (32/32 capture assertions pass). | `RESPONSIVE_RULE` | Re-group toolbar at narrow widths; keep disabled commands visually secondary | surface Writer |
| T-10 | **V1** | Evidence-channel non-determinism (E1/E2): screenshot↔filename attribution and stale renders in the harness `read` channel. | `EVIDENCE/ORACLE` | Re-verify every visual acceptance claim with OCR/hash/dimension anchors and burned-label composites (as done here); fix or quarantine the render channel before Owner image inspection (C03-GATE-020) | **Coordinator** |

**Verdict — today: `VISUAL_FAIL`** (V4 material). Remediation is in part **BLOCKED on Q-2** (Owner STOP/REPORT) — but a functional PASS must never be recorded as a visual pass: the surface as rendered is an empty shell of its reference.

---

## 2. SURFACE — `shell` (`/?surface=shell`, banner "CEP · Workspace Home")

### 2.1 What the reference/contract actually shows
No final binary (register: visual **reopened** by `OWNER-20260910-010`; `CONTRACT_DERIVABLE`). Governing text: `CEP-VIS-001-FINAL` §2.1/§2.2 — exactly five global destinations (اليوم · المعرفة والتعلّم · المحاكاة والمؤسسات · التقدم والأدلة · النظام والعمليات), `Today` = orchestration/command surface, the shell must be dark, professional, **high-density without crowding**, **Arabic-first**, fixed across domains, one clearly-active destination, return context preserved across domain transitions, and must *not* become dashboard chrome. The **Today reference PNG depicts the shell chrome** (it is the global frame in every reference) and is legitimate corroborating evidence for the frame: clean 5-link nav (no internal codes), rich bilingual brand block, search "البحث في المنصة… Ctrl K", bell + badge, theme toggle, avatar + name + role.

### 2.2 What the current implementation shows
(`evidence/shell/matched-viewport-baseline-20260929T052233Z-b9419922.png`, OCR-anchored)

- Top row: brand (small shield-less "C" avatar mark + `CEP` + "مساحة CEP الشخصية") · 5 destination links **each prefixed by a boxed internal token `W01…W05`** (`W01 اليوم` active in a filled box, `W02 المعرفة والتعلّم`, `W03 المحاكاة والمؤسسات`, `W04 التقدم والأدلة`, `W05 النظام والعمليات`) · "⌘ بحث أو امر Ctrl K" · "⚙ الإعدادات". **No bell/badge, no theme toggle, no user identity.**
- Second row (context bar): current-area title with `W01` token + area links + ←/→ history + "محلي · مالك واحد". Return-context machinery is real: `back-forward-semantic-context` flow 10/10 PASS (CBF-002 repaired), `shell.destination-routing` 11/11 PASS, `destinationCountFrozen=false` proven (Q-1 never decided).
- LEFT "CEP destinations": "Global destinations" — 5 cards each showing label + meta **`W01 · today`** (internal area id + surface id), then "Current area surfaces" (اليوم · today).
- CENTER: "CEP workspace" + one English sentence ("Choose a destination from the global shell. Navigation, history, context restoration and dirty-departure guards are owned centrally.") and then a **~700 px empty dead zone** to the bottom.
- RIGHT "Route context": 2 lens tabs + one card ("الأساس / التركيب CEP مساحة والنقل العام") with `Surface: shell` / `Area: W01` rows — then empty.
- BOTTOM: "Navigation history · Route/history state only; no domain state is inferred" + collapse handle.

### 2.3 Density assessment
Ink density: center **0.013** (one sentence), RIGHT 0.009, LEFT 0.036. Visible meaningful items: 5 destinations + 6 nav rows + 3 metadata rows ≈ **14** for an entire "Workspace Home" surface, against a contract demanding "high-density professional". **UNDER_POPULATED** in CENTER and RIGHT; LEFT is fine. Hierarchy is flat (everything is a same-weight card). Whitespace ratio in CENTER ≈ 98 % dead — §7 "dead visual zones / unexplained whitespace" defect.

### 2.4 Component completeness
**Present:** 5 global destinations with one active ✓ · destination count unfrozen and not judged (Q-1 respected) ✓ · history back/forward + bookmark restore (return context) ✓ · command/search entry ✓ · settings entry ✓ · route-context metadata card ✓ · deep-work shelf closed (`hidden+inert`) ✓ · no invented `domain-diagnostics` tab (A-2) ✓.
**Missing vs the reference frame:** notification centre + badge · theme toggle · user identity (avatar + name + role) · bilingual brand tagline (current brandcopy is a workspace name, "مساحة CEP الشخصية") · brand mark treatment (shield glyph) · any dashboard-grade content in the home CENTER.
**Missing vs §2.2 intent:** "high-density without crowding" (home is low-density), "Arabic-first" (CENTER body copy and all four toolbar command labels are English).

### 2.5 Shared-component dependency
| shared component | helping / hurting |
|---|---|
| `GlobalShellNavigationOwner` (`foundation/global/shell/navigation.ts`) | **Mixed → hurting on chrome.** Navigation semantics, focus, history, bookmark restore all correct (receipt 10/10 + 11/11). But it renders the internal area id as user chrome: `navigation.ts:164` emits `<bdi class="global-shell-area-token" dir="ltr">${item.id}</bdi>` per destination, `m0-controller-composition.ts:93` (`compactRegionList`) appends `item.area · item.id` as visible card meta, and `WorkspaceFoundation.dictionary` ships labels like `W03 المؤسسة` / `W03 التشغيل`. Internal wave/area taxonomy is user-facing on **every** surface. |
| `WorkspaceFoundation` | **Hurting on chrome** (as §1.5: generic toolbar chips, floating status pill, `W03`-prefixed dictionary labels); **helping** on pane lifecycle/inert semantics. |
| `ReusableToolbarTemplateOwner` | **Hurting.** Generic `⌘ / تركيز / ملاحظة / الملاحظات` chips are pushed into the shell toolbar next to the surface's English command buttons with no hierarchy. |
| `BottomDeepWorkOwner` | **Helping** (hidden+inert closed; lifecycle proven; §24 satisfied). |
| `TransientFocusOwner` | **Helping** (keyboard focus reaches destination nav; arrow-key movement asserted). |

### 2.6 Defect register — shell
| id | severity | defect | root cause | recommended change | routing |
|---|---|---|---|---|---|
| S-01 | **V2** | Internal `W01–W05` wave/area tokens leak into global chrome on every surface (destination links `global-shell-area-token`, LEFT card meta `W0x · surface-id`, dictionary `W03 …`). Reference frame shows clean destination labels only. Shared defect affecting all 23 surfaces. | `SHARED_COMPONENT` | Remove the area token from user chrome (keep `data-shell-area` as data); strip `area · id` meta from `compactRegionList` user rows; drop `W0x ` prefixes from the label dictionary. Do **not** change the destination set or count (Q-1 open). | **shared-component owner** (+ Coordinator for the m0 meta row) |
| S-02 | **V3** | Shell home CENTER is a ~700 px dead zone with one English sentence; RIGHT card holds 2 metadata rows then empties. §7 "blank-pane header / dead visual zone" on the surface that frames all others. | `SURFACE_COMPOSITION` | Populate home with contract-scoped orchestration affordances (recent destinations, return context, session state) or an explicit, designed hub composition; justify remaining whitespace | surface Writer (composition proposal) → Coordinator (shell composition is Owner-reopened) |
| S-03 | **V2** | §2.2 "Arabic-first" violated: CENTER body copy and toolbar labels ("Navigate to product destination", "Restore Shell bookmark", "Open or query Shell command navigation", "Resolve guarded dirty departure", "CEP workspace") are English command-registry strings used as UI copy. | `IMPLEMENTATION` / `CONTENT_MODEL` | Localize command labels for `ar`; keep technical tokens isolated | surface Writer + shared-component owner |
| S-04 | **V2** | Identity chrome thin vs the frame every reference depicts: no notification centre/badge, no theme toggle, no user avatar/name/role, brandcopy is the workspace name instead of the product tagline. Shell visual is Owner-reopened, so final composition is not Writer-decidable. | `OWNER_CONSTRAINT` (reopened shell visual) + `SHARED_COMPONENT` | Propose the identity/tool cluster to the Owner via Coordinator; do not invent notification data | **Owner STOP/REPORT** via Coordinator |
| S-05 | **V1** | Active-destination emphasis uses a filled box + underline + token chip (heavier than the reference's single cyan underline), and the two-row chrome (destination row + context row) crowds where the reference uses one row. | `SURFACE_COMPOSITION` | Reduce active-state weight to the reference's treatment; merge or slim the context row | surface Writer (subject to S-04 decision) |
| S-06 | **V2** | Same bidi/ellipsis class as T-05: `.phead h2` sits in `direction:rtl` panes with `text-overflow:ellipsis` (donor CSS) — sibling auditors measured an LTR label clipped at its start (187 < scrollWidth 260). **Not reproducible in the two W01 matched-viewport widths** (OCR shows "Today projection" / "CEP destinations" / "Selected Today context" complete at 1440 and 1024), but the mis-ordered punctuation on ".No current items" proves the underlying LTR-in-RTL treatment is wrong. | `IMPLEMENTATION` (bidi/ellipsis), evidence class `EVIDENCE/ORACLE` for the exact 187/260 numbers | Set `direction:ltr; unicode-bidi:isolate` on LTR pane labels or ellipsize at the inline end; re-measure at narrow/pane-collapse widths (the sibling measurement presumably occurred at a width W01 does not capture) | shared-component owner (+ Coordinator to re-measure at the failing width) |
| S-07 | **V1** | Floating status pill overlaps the stage (shared with T-07). | `SHARED_COMPONENT` | Reposition to the bottom strip | shared-component owner |

**Verdict — shell: `ACCEPTANCE_REQUIRES_REVIEW`.** The frame's contract mechanics hold (5 unfrozen destinations, one active, return context proven, deep-work closed-by-default, no invented tabs), but the chrome leaks internal taxonomy (S-01), the home surface is materially under-populated (S-02) and the final shell composition is Owner-reopened (S-04) — a Writer may neither close nor pixel-settle it. If the Owner wants the reference-frame identity cluster, S-02/S-04 escalate to `VISUAL_FAIL`.

---

## 3. Shared components: genuinely need improvement vs must remain unchanged

**Genuinely require improvement (evidence-backed):**
1. `GlobalShellNavigationOwner` chrome rendering — internal `W0x` area tokens in user chrome (`navigation.ts:164`; screenshot evidence on both surfaces; S-01). Minimal change: presentation-only, keep data attributes and registry untouched.
2. `WorkspaceFoundation` — (a) `#foundationStatus` pill overlapping the stage (T-07/S-07), (b) `W03 …`-prefixed dictionary labels, (c) generic foundation toolbar chips forced into every surface with no hierarchy (T-05/S-05).
3. Command-label policy (SemanticCommandBus/CommandRegistry labels consumed as UI copy) — English strings on Arabic-first chrome (T-05/S-03).
4. `compactRegionList` (m0 seam) — `area · id` meta rows and the mount-time-only LEFT region write (S-01, T-03). Route via Coordinator (filed hunk).

**Contract valid — must remain unchanged:**
- `BottomDeepWorkOwner` — `hidden+inert` closed policy, provider-delegation, no-fabrication when no provider (`deepwork.*` assertions all PASS; §24 satisfied).
- Pane responsive/inert semantics of `WorkspacePaneLayoutOwner`/`WorkspaceFoundation` region lifecycle (32/32 matched-viewport assertions, no horizontal overflow at 1024).
- `TransientFocusOwner` focus capture/restore behaviour (keyboard-focus captures + receipts pass).
- Destination registry **as data** — 5-destination baseline with `destinationCountFrozen=false`; Q-1 is STOP/REPORT and this audit does **not** judge or propose any destination count.
- Today's semantic separation (`canonicalWrites:false`, `mastery NOT_INFERRED__W04_OWNED`, projection-only status line) — correct and must not be "fixed" by inventing progress.

---

## 4. Empty / under-populated surfaces (mandate answer #4)

| surface | state | why |
|---|---|---|
| **today** | **EMPTY** (all 6 regions, 0 items) | No Today provider composition bound (`TODAY_PROVIDER_UNBOUND`; `providerBoundary='CENTRAL_REAL_PROVIDER_COMPOSITION_REQUIRED'`). Root cause is architectural/content-model, not missing components; Q-2 (provider owner) is Owner STOP/REPORT. Cannot be filled with invented facts (§7). |
| **today LEFT / RIGHT panes** | dead zones (ink 0.016 / 0.007) | Follows the same provider gap; RIGHT additionally renders a bare table as its empty state. |
| **shell home CENTER / RIGHT** | dead zones (ink 0.013 / 0.009) | The shell home composition was written as a minimal hub ("Choose a destination…"); nothing in the current law forbids content there and §7 condemns the resulting dead zone. Final shell composition is Owner-reopened → proposal required, not Writer invention. |

---

## 5. Reference sources actually used (mandate answer #5)

1. `cep-writer/references/visual/00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png` — **opened and inspected** (rendered view + OCR + sha256 `3f75eac7…` verified against the register).
2. `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md` §2.1 Global Destinations, §2.2 Global Shell, §3.1–3.5 workspace composition, §4 navigation, §10 information ownership, §12 RTL/LTR, §13 responsive — read as text.
3. `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` — Today promotion text (orchestrator scope) + shell visual reopened note + expanded-bottom note (BOTTOM closed by default).
4. `controller/12_execution/07_visual_fidelity_governance.md` + `VISUAL_FIDELITY_REAUDIT_REGISTER.csv` (my 2 rows).
5. Current-state evidence: `writer-output/W01/evidence/**` (216 PNGs; matched-viewport 8×2, flow captures), `BROWSER_RECEIPT.json`, `VISUAL_CAPTURE_RECEIPT.json`, `CBF002_PROBE.json`, `SERIALIZED_HOTSPOT_REQUEST.md`, `W01_HANDOFF.md`.
6. Implementation (read-only): `surfaces/shell/surface.ts`, `surfaces/today/{surface,presentation}.ts`, `foundation/workspace.ts`, `foundation/global/shell/{navigation,destination-registry}.ts`, `foundation/global/bottom-shelf.ts`, `surfaces/m0-controller-composition.ts` (lines 93/202/203 read only; **in-flight sibling edits not attributed to W01 and not touched**), `cep-writer/references/surface-profiles/{shell,today}.json`.
7. No reference exists for `shell` beyond the contract + the shell frame depicted inside the Today reference — recorded as `CONTRACT_DERIVABLE`.

---

## 6. Recommended actions + routing (mandate answer #6)

| first / highest risk | action | routing |
|---|---|---|
| **T-01 (V4)** Today six regions empty | Resolve Q-2 (provider owner) → bind real provider composition; re-capture and re-compare at 1440×1000 + 1024×900 | **Owner STOP/REPORT (Q-2)** + Coordinator |
| **T-03 (V2)** LEFT `Filter ·` stale vs CENTER pressed chip | Apply the already-filed `SERIALIZED_HOTSPOT_REQUEST.md` §2a+§2b atomically | **Coordinator** (serialized hotspot `m0-controller-composition.ts`) |
| **S-01 (V2)** `W01–W05` leak in global chrome (all 23 surfaces) | Remove area tokens from user chrome in `GlobalShellNavigationOwner` + `compactRegionList` meta + dictionary prefixes; preserve registry data & `destinationCountFrozen=false` | **shared-component owner** + Coordinator (m0) |
| **S-02 (T-02) (V3)** shell home CENTER dead zone / Today RIGHT dead zone | Propose contract-scoped hub/context compositions; populate after T-01 | surface Writer → Coordinator (shell composition Owner-reopened) |
| **T-05/S-03 (V2)** English copy on Arabic-first chrome | Localize command labels; isolate technical tokens | surface Writer + shared-component owner |
| **S-04 (V2)** identity/tool cluster (bell, theme, user, brand tagline) | Owner decision on reopened shell composition | **Owner STOP/REPORT** via Coordinator |
| **T-07/S-07 (V2)** status pill overlapping stage | Reposition `WorkspaceFoundation.status` | shared-component owner |
| **T-10 (V2)** image-channel non-determinism | Quarantine/fix render channel before Owner image inspection; keep OCR/hash burn-in verification | **Coordinator** (evidence plane) |

**Re-comparison plan (R6/R7):** after any of the above lands — re-run `tools/w01-visual-capture.mjs` (matched 1440×1000 + 1024×900 × baseline/keyboard-focus), rebuild burned-label composites against `CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png` + §2.1 grammar, re-measure ink-density ratios and per-region item counts (targets: today ≥ reference parity per region; shell home center non-dead), re-verify `Filter ·` token equality with the pressed chip, then re-disposition each defect id above individually. No auto-repair loop; every iteration recorded as defect · severity · root cause · change · evidence · re-comparison · acceptance decision.

**18-box gate (governance §10) status:** "reference actually inspected" ✓ · "current screenshot captured" ✓ · "component-level comparison" ✓ · "meaningful content/state exists" ✗ (today) · "no unjustified blank regions" ✗ (both) · "responsive still correct" ✓ (32/32, with T-09 noted) · "evidence bound to correct candidate" ✓ with E1/E2 caveats · "remaining differences explicitly justified" ✓ (this document). **Neither surface passes the gate today.**

---

*No product source, controller, contract, profile, authority or assurance artefact was modified in producing this audit. Q-1 (destination count) and Q-2 (Today provider owner) were not decided.*
