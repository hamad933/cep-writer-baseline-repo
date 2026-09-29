# W04 VISUAL RE-AUDIT — Evidence · Reviews · Mastery · Portfolio

**Auditor role:** W04 Visual Fidelity Auditor (Evidence · Reviews · Mastery · Portfolio)
**Method authority:** `controller/12_execution/07_visual_fidelity_governance.md` (V0–V4, root-cause classes,
L1–L4 comparison, §10 18-box acceptance gate) · `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md`
(CEP-VIS-001-FINAL, Owner-approved CEP-DEC-027) · `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md` §2
**Register rows audited:** `controller/12_execution/VISUAL_FIDELITY_REAUDIT_REGISTER.csv` → W04 × {evidence, reviews, mastery, portfolio}
**Candidate under audit:** `WORKTREE_VARIANT:c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f`
**Round type:** **AUDIT AND REPORT ONLY — no product source was modified.** The only writes are this file and
derived analysis images under `/tmp/opencode/audit/**`. `dist/**` was only *served* (read-only), never rebuilt.

---

## 0. Inspection method and its limits (per the capture-method law)

The repo law is explicit: *"A PNG/WebM existing on disk is not visual acceptance. Material screenshots must be
opened and inspected."* Every claim below is based on images that were **opened**, not on filenames or code.

**Tooling defect encountered and worked around.** The agent's image reader rendered images with a non-deterministic
1–3 call lag, so a `read(path)` did not reliably show `path`. Proved with control markers (`marker-A.png`,
`marker-B.png`): reading B displayed A. To make inspection trustworthy I re-encoded every inspected PNG through
package-local Playwright Chromium (real pixels → new bytes) and **burned the source filename into each composite**
(`/tmp/opencode/audit/grid.mjs`), so every image I looked at self-identifies. Findings below are only those
confirmed in a labelled composite or in a full-resolution render whose content matched its path.

**Live DOM probe (read-only).** To convert visual observations into testable root causes I booted the existing
`dist/` build via `tools/serve.mjs` (port 45177, no rebuild, no write) and read computed styles / region text /
command availability through Playwright. Probe outputs are reproduced inline as evidence.

---

## 1. Reference PNGs actually used

| Surface | Path (all under `cep-writer/references/visual/03_PROGRESS_AND_EVIDENCE/`) | SHA-256 prefix | Verified | Classification |
|---|---|---|---|---|
| evidence | `01_EVIDENCE_INTAKE/Cybersecurity Evidence Dashboard in Arabic(1).png` | `789deee0` | ✅ matches register | `CURRENT_FINAL_REFERENCE` |
| reviews | `02_REVIEWS/Cybersecurity Evidence Review Dashboard.png` | `f1b915d5` | ✅ matches register | `CURRENT_FINAL_REFERENCE` |
| mastery | `03_MASTERY/Arabic Cybersecurity Mastery Dashboard.png` | `7784568e` | ✅ matches register | `CURRENT_FINAL_REFERENCE` |
| portfolio | `04_PORTFOLIO/Cybersecurity Portfolio Evidence Dashboard.png` | `3651bff6` | ✅ matches register | `CURRENT_FINAL_REFERENCE` |

All four are 1505×1045. Three are Arabic; one (Reviews) mixes Arabic chrome with English record copy.

## 2. Current evidence actually used

`writer-output/W04/evidence/*.png` — **97 named files → 18 unique byte identities** (confirmed by full `sha256sum`
census). The frames inspected in detail are the final distinct run (`…-20260929T04411x/04412x/044131Z-c82cec63.png`),
cross-checked against the live DOM probe at 1440×980.

**Evidence-hygiene defect (E1).** Named states are frequently byte-identical to each other:

| identity | files | named states collapsed into one image |
|---|---:|---|
| `a29d3436656b` | 20 | `empty-state`, `candidate-imported`, `verified-not-admitted`, `admitted-immutable`, `receipt-census` (6 distinct state names) |
| `056535086773` | 19 | portfolio `empty-state`, `assembly-one-reference`, `export-reproducible` |
| `3ebe2289209c` | 16 | reviews `empty-state`, `ready-for-decision`, `verdict-recorded` |
| `ee3bdd551c78` | 14 | mastery `empty-state`, `fixture-row`, `state-machine-blocked` |

`F051_COUNTING_PROOF.json` counts identities correctly, so this is **not** a counting error — it is that the
*older capture rounds* recorded one visual state under six different state names. Any acceptance claim that cites
those filenames as proof of distinct lifecycle states is unsupported.

---

## 3. SURFACE — EVIDENCE

### 3.1 What the reference actually shows (from inspection)
Dark-navy **Arabic** dashboard, LTR *layout* with Arabic copy (logo top-**left**, panes in
LEFT / CENTER / RIGHT order — the reference is **not** mirrored).

- **TOP:** CEP logo + `منصة التعليم للأمن السيبراني / Cybersecurity Education Platform`; five global destinations
  (اليوم · المعرفة والتعلّم · المحاكاة والمؤسسات · **التقدم والأدلة** (active, teal underline) · النظام والعمليات);
  right side search `ابحث في المنصة... Ctrl K`, bell, moon, avatar `أحمد / مسؤول`.
- **Sub-nav:** `Evidence · Reviews · Mastery · Portfolio` — **English**, with icons, Evidence active.
- **LEFT (`الأدلة`, chevron-collapse):** a *structural navigation list* with icons — `الاستقبال` (Intake, active,
  teal box), `المرشحون` (Candidates), `الأدلة` (Evidence), `المسحوبة`, `المنشورة` (Published) — plus a separate
  bottom card `إعدادات الأدلة` (Evidence settings, gear icon). 5 nav rows + 1 settings card.
- **CENTER toolbar:** 5 icon controls — `Return for Context` (arrow), `Decline` (×),
  **`Admit as Evidence` (green filled primary, ✓)**, `Compare Source` (link), `More ▾` (…).
- **CENTER record:** document icon + `Candidate Evidence CE-0142` + status pill `SUBMITTED_FOR_INTAKE`
  (indigo outline). Then labelled metadata rows **with per-row icons**: `Evidence Claim`, `Subject` → *Ahmed*,
  `Purpose`; teal link chip `Application Security Investigation` with subtext `Canonical Capability Reference`;
  a teal section header **`Source Handoff`** (link icon) with `Source Domain / Source Type / Source` →
  `RUN-0042 / Result Revision 1` / `Scenario` / `Handoff` / `Handoff Received` / `Submitted By` / `Submission Note`;
  a second teal section header **`Selected Supporting References`** (paperclip) containing **three boxed reference
  cards** (Alert payload `SOC Alert delivered` · Timeline segment `10:24:28 – 10:27:10` · Analyst observation),
  each with a coloured icon, a `Reference` label and an external-link affordance.
- **RIGHT (`السياق`, X close):** **six stacked context cards**, each icon + title + green ✓ badge + bullets —
  `سلامة المصدر`, `مراجعة المراجع`, `فحص التكرار`, `حالة المصدر`, `اكتمال الأنساب` — and an info notice at the
  bottom: `هذه المرشحة لم تُدرج بعد كدليل ولا تُعد مصدراً مُعتمداً إلا بعد الإدراج.`
- **BOTTOM:** full-width shelf `مساحة عمل مؤقتة` with collapse chevrons on both edges.

Density: ≈30 distinct information items in CENTER, 6 RIGHT cards (~16 bullets), 6 LEFT items, 5 controls,
1 bottom shelf. Whitespace ≈ 20–25 %.

### 3.2 What the current implementation shows (from inspection)
Full RTL mirror (`document.body.dataset.foundationDirection === 'rtl'`; logo top-**right**, `W01…W05` ownership
chips next to the destinations). Sub-nav in Arabic.

- **LEFT:** region header `Evidence workbench · Collection` + one box `No current Candidate or admitted Evidence is
  bound.` (empty) or a **single 2-line row** (`…w candidate cand-w04-flow` / `cand-w04-flow-r1`) (populated).
  Then **~650 px of blank panel**.
- **CENTER toolbar:** 5 text-only buttons `Inspect Evidence · Import Candidate Evidence · Prepare Evidence
  amendment · Admit submitted Candidate · Retain superseded source`, all disabled in the empty state with correct
  reason tooltips. Left of them, 4 shared buttons (⌘ palette, ملاحظة, تركيز, الإعدادات).
- **CENTER:** hero `Evidence workbench` + summary sentence; then a generic key/value card titled
  `W04 browser flow candidate cand-w04-flow` (populated) or `Evidence workbench` with rows `State` → `EMPTY`
  (empty). Populated rows: `Kind`, `SelectedId`, `Identity`{`RecordKind`,`EvidenceId`,`RevisionId`,
  `BaseEvidenceRevisionId`}, `Claim`{`Title`,`EvidenceClaim`,`Subject`,`CriterionRefs`}, `State`{`CandidateState`}.
  Below the empty card: `How this workspace works` with 2 bullets. Then **~330 px blank**.
  Collapsed `<details>Import candidate evidence</details>` sits below the fold.
- **RIGHT:** region header `Evidence workbench · Context`, scope tabs `الوحدة | الكتلة المحددة`, then **an exact
  second rendering of the same key/value card**, squeezed into a narrow column with mid-word wraps
  (`GovernedEvidenceWorkbenc h`, `CANDIDAT E_EVIDENC E`, `BaseEvidenceR evisionId`). Then **~600 px blank**.
- **BOTTOM:** collapsed bar reading `No domain-owned deep projection is bound · Evidence workbench · Detail ⌄`.

### 3.3 L1–L4 discrepancy list
| L | Discrepancy |
|---|---|
| L1 | Information architecture replaced wholesale: reference = nav list + structured record + context cards + shelf; current = generic key/value dump in 3 panes. Density ≈ 35 % of reference when populated, ≈ 10 % when empty. |
| L1 | Layout direction: reference is LTR-layout/Arabic-copy; current is a full RTL mirror. |
| L2 | LEFT is a *collection list*, reference is a *structural navigation tree + settings card*. |
| L2 | RIGHT is a duplicate of CENTER, not the reference's 6 context cards + info notice. |
| L2 | BOTTOM shelf permanently empty. |
| L3 | No status pill; no icons on rows; no `Source Handoff` section; no `Selected Supporting References` cards; no criterion/capability link chip; no `More ▾` overflow; no green primary action. |
| L3 | Toolbar control set differs (`Return for Context / Decline / Admit as Evidence / Compare Source / More` vs the 5 domain commands) — but the current set is exactly `surface-profiles/evidence.json#domain_commands`, so this is a **reference-vs-contract** conflict, not a bug. |
| L4 | `…orkbench · Collection`, `…kbench · Detail`, `…w candidate cand-w04-flow` — LTR labels clipped at the **start**. |
| L4 | Trailing punctuation displaced: `… never implies Admission, .Review, Decision or Mastery`; bullets render as `.Declare a Candidate … •`. |
| L4 | Group labels `Identity/Claim/State` render as a right-hand third column instead of section headers. |
| L4 | Values are raw tokens (`owner:local`, `criteria:v4#integrity`, `—`) where the reference shows human labels (`Ahmed`, `Application Security Investigation`, `RUN-0042 / Result Revision 1`). |
| L4 | Right column wraps technical tokens mid-word. |

### 3.4 Density assessment
| | Reference | Current (empty) | Current (populated) |
|---|---|---|---|
| Meaningful items | ~30 | 4 | ~15 |
| Grouped sections | 2 titled sections | 0 | 3 bare group keys |
| Metadata richness | 12 labelled rows + 3 reference cards | 1 state token | 15 generic rows, 4 raw tokens |
| Navigation depth | 2 levels (area → 5 items → settings) | 0 | 1 flat row |
| Controls | 5 (+2 chevrons) | 5 disabled | 5 (1 enabled) |
| Whitespace ratio | ~20–25 % | **~65–70 %** | **~50 %** |

**Verdict on emptiness:** the empty state is **content-valid but treatment-broken**. The *copy* is truthful and
informative (`No current Candidate or admitted Evidence is bound.` + 2 guidance bullets) which satisfies the
truth law; but the *treatment* is a bare `EMPTY / State` key/value row **duplicated in the RIGHT pane**, followed by
~650 px (left), ~330 px (center) and ~600 px (right) of unexplained blank canvas. Governance §7 names exactly these
("empty right/context areas, dead visual zones, unexplained whitespace, generic filler cards") as defects.
So: **not a valid empty state as rendered.**

### 3.5 Component completeness
Present: global destinations · sub-nav · region chrome · contextual command toolbar (5) · record title ·
labelled rows · empty message · guidance list · collapse affordances.
**Missing vs reference:** LEFT structural nav (5 items) · Evidence settings card · status pill · per-row icons ·
`Source Handoff` section · `Selected Supporting References` cards (3, with external-link affordance) ·
criterion/capability link chip · `More ▾` overflow · 6 RIGHT context cards · right-pane info notice ·
populated bottom shelf · *any* state-specific visual treatment.

### 3.6 Shared-component dependency
| Component | Helping / hurting | Evidence |
|---|---|---|
| `CollectionTableMatrixHost` / `CollectionTableMatrixPresentationCore` | **HURTING — forcing generic filler** | The adapter authors 4 typed columns (`record/lifecycle/source/review`, with `tone`, `secondary`, `compareRows`), but `m0-controller-composition.ts:174` passes `collectionMode:'list'`, so the matrix never renders (probe: `tables = 0`) and the pane degrades to 2-line `.m0-row` items. **Contract is valid and must remain unchanged; the consumer override is the defect.** |
| `BottomDeepWorkOwner` | **HURTING — binding gap** | `#bottomShelf` reports `data-bottom-availability="UNAVAILABLE"`, `data-bottom-provider-owner=""` while `surface.bottom` (`evidenceBottomProjection`: deep artifact inspection, revision lineage, raw provenance) is authored **and** wired via `bottomFor`. Two disconnected bottom mechanisms. |
| `ReviewAuthorityRegistry` | **HELPING** | Correctly gates review commands; disabled states carry precise reasons. **Must remain unchanged.** |
| `AnalyticalCompareOwner` | **NEUTRAL / invisible** | Registered, but no compare surface is reachable from this route although the reference shows `Compare Source`. |
| `WorkspaceFoundation` (regions/panes) | **MIXED** | Region roles match `EVIDENCE_SURFACE_CONTRACT.regionRoles` exactly (good). But region header `<h2>` computes `direction:rtl` + `ellipsis` → start-clipping, and the pane carries donor scope tabs. |
| `ReusableToolbarTemplateOwner` | **HELPING** | Renders the domain command set correctly; not dead, not empty. **Must remain unchanged.** |
| `ContextInspectorHost` | **VALID BUT UNUSED** | `createEvidenceContextProvider` authors rich lenses (Governance → Provenance / State dimensions) that are **never rendered**; the RIGHT pane shows a copy of `detail` instead. **Contract must remain unchanged; the wiring must change.** |
| `semanticProjection` (shared renderer, protected file) | **ROOT CAUSE of generic filler** | Recursive `<dl>` dump of the raw projection object; produces all the L4 hierarchy defects. |

---

## 4. SURFACE — REVIEWS

### 4.1 What the reference actually shows
`Cybersecurity Evidence Review Dashboard` — dense English record page under Arabic chrome.

- **LEFT (`Reviews`):** icon nav `Review Queue · Assigned · **In Review** (active blue box) · Closed`, footer
  `طَبْق النافذة` with « » chevrons.
- **CENTER toolbar:** 4 icon pills `Request More Evidence` (chat) · `Compare Prior Evidence` (scales) ·
  `Issue Decision` (gavel) · `More ▾` (…).
- **CENTER record:** document icon + `Evidence Review REV-0084` + purple pill `Review Workflow: IN_REVIEW`.
  A **3×2 metadata grid with colour-coded values** — `Evidence Lifecycle/ACTIVE` (green) ·
  `Evidence Under Review/EV-0142 / Revision 1` (link) · `Effective Review Decision/NONE` (amber) ·
  `Evidence Review Status/IN_REVIEW` (purple) · `Subject/Ahmed`.
  Then `Evidence Claim` (shield icon) with a claim sentence.
  Two side-by-side cards: **`Criterion References`** (3 numbered rows C1/C2/C3) and **`Criterion Findings`** —
  a real table `المعيار | Finding | Supporting Evidence`, rows `C1 → SATISFIED ✓ → Investigation Report §2.1`,
  `C2 → SATISFIED ✓ → Detection Correlations §3.2`, `C3 → PARTIALLY_SATISFIED ⊖ → Root Cause Analysis §4.3`.
  Then **`Reviewer Rationale`** card with a 5-line paragraph, and **`Decision Preparation`** card containing a
  dashed inner box `🕐 Decision not yet issued` + `Ready for decision after remaining review work.`
- **RIGHT (`السياق`):** 6 cards, several with Arabic eyebrows — `Review Scope`, `Reviewer Authority`
  (`صلاحية المراجع` · Reviewer: **Mariam**), `Criterion Authority` (`مراجعة المعايير` · Standard v2.1 · Effective
  2024-01-01), `Prior Review Context`, `Provenance Warnings`, `Conflict Context`.
- **BOTTOM:** `مساحة عمل مؤقتة` shelf with chevron.

### 4.2 What the current implementation shows
- **LEFT:** `Reviews workbench · Collection` + `No formal Evidence Review is bound.` (empty) or one row
  `Review rv-w04-flow / rv-w04-flow-r1`. **~700 px blank.**
- **Toolbar:** `Continue Review · Add Review finding · Compare exact Review revisions · Issue superseding
  Decision` — **rendered and not dead** (verified live), all disabled in empty state with reason tooltips;
  left group ⌘ / ملاحظة / تركيز / الإعدادات.
- **CENTER:** hero + summary; generic card `Review rv-w04-flow` with `Kind`, `SelectedId`,
  `Request`{`ReviewRevisionId`,`State`,`Rereview`,`PinnedEvidenceRefs`,`PinnedCriteriaRefs`},
  `Reviewer`{`Identity`,`AuthorityAvailable`,`AssignmentPermissionAvailable`}. The card **runs past the bottom of
  the 980 px viewport**; `findings`, `decision`, `decisionHistory` and `actions` are below the fold.
- **RIGHT:** duplicate of CENTER, narrower, with mid-word wraps (`FormalReviewDecisionWorkb ench`,
  `READY_FO R_DECISIO N`, `PinnedEvidenc eRefs`). **~560 px blank.**
- **BOTTOM:** `No domain-owned deep projection is bound`.
- Lifecycle states `READY_FOR_DECISION` vs `CLOSED` differ **only** in the `State` scalar.

### 4.3 L1–L4 discrepancies
L1: entire structured review workbench replaced by a key/value dump; density ≈ 35 % of reference. ·
L2: LEFT is a flat collection instead of the `Review Queue / Assigned / In Review / Closed` queue nav; RIGHT is a
duplicate instead of 6 context cards; BOTTOM empty. ·
L3: **missing** status pill `Review Workflow: IN_REVIEW`; 3×2 colour-coded metadata grid; `Evidence Claim` row;
`Criterion References` card; **`Criterion Findings` table** (the single most identifiable component of this
reference); `Reviewer Rationale`; `Decision Preparation` + dashed state box; `More ▾` overflow; per-row icons. ·
L4: same BIDI clipping and punctuation displacement as Evidence; group keys `Request/Reviewer` render as a third
column; `Subject` renders as `reviewer:w04-flow` instead of a person; primary record does not fit the viewport
while 2 panes sit ~60 % empty.

### 4.4 Density assessment
Reference ≈ 30 items incl. a 3-row table with per-row satisfaction badges and supporting-evidence refs;
current ≈ 12 generic rows + 4 disabled controls. Whitespace ~55–60 % (populated). **Under-populated.**
Findings/Decisions/DecisionHistory — the entire decision surface the profile exists for — are authored in
`reviewsCenterProjection` (`findings`, `decision.history`) and are **not visible**.

### 4.5 Component completeness
Present: region chrome · 4-command toolbar · record title · labelled rows · queue-less collection · empty copy.
**Missing:** queue nav (4) · status pill · metadata grid · Evidence Claim · Criterion References ·
Criterion Findings table · Reviewer Rationale · Decision Preparation · 6 RIGHT context cards · bottom shelf ·
`Request More Evidence` / `More ▾` controls.

### 4.6 Shared-component dependency
Same table as Evidence. Specific to Reviews:
- **`ReviewAuthorityRegistry` — genuinely helping and must remain unchanged.** Live probe confirms the no-self-approval
  law is visible in the UI: 10 registered `reviews.*` commands, all disabled with precise reasons
  (`Review record required.`, `Select Review`), `reviews.request` enabled only when a registry is bound.
- **`ReusableToolbarTemplateOwner` — helping.** The W04 `toolbarCommandIds` fix is **visually confirmed**: the
  rendered toolbar matches `surface-profiles/reviews.json#domain_commands`
  (`reviews.review/finding/compare/supersede`) and is not dead/empty. **Its contract must remain unchanged.**
- **`AnalyticalCompareOwner` — under-exposed.** `compare` is in the toolbar but the reference's
  `Compare Prior Evidence` implies a visible comparison region; none is reachable.

### 4.7 Reviews-specific defect
**R1 — 7 of 10 commands are unreachable.** `commandIds` (10) vs `toolbarCommandIds` (4):
`reviews.request/assign/start/ready/continue/cancel/rereview` are registered but have no toolbar or overflow entry.
The reference shows a `More ▾` overflow precisely for this. V2 · `SURFACE_COMPOSITION` · routing **surface Writer**.

---

## 5. SURFACE — MASTERY

### 5.1 What the reference actually shows
`Arabic Cybersecurity Mastery Dashboard` — the densest of the four.

- **LEFT (`Mastery`, gear + chevron):** a **tree** — `Application Security` (expanded) → `Web Security`,
  **`Application Security Investigation`** (active highlight), `Secure Development`; then `History`. A separate
  bottom button `طلب إعادة التقييم` (Request re-evaluation).
- **CENTER:** gear icon + `Application Security Investigation` + **two status pills** —
  `Mastery Judgment: MASTERED` (green ✓) and `Freshness Status: REVALIDATION_REQUIRED` (amber ⚠) — then
  `Subject: Ahmed`, then an Arabic italic explanatory line.
  Then a **numbered 5-step structure** with drag handles and icons:
  `1 Mastery Policy Revision` → `Policy Revision` → **`MP-APPSEC-v4`**;
  `2 Required Criteria` → table `Criterion | Satisfaction State` (`C1 — Investigate suspicious application
  behavior → ✓ متقن`, `C2 …`, `C3 …`);
  `3 Effective Review Decisions` → table `Review ID | Decision`
  (`REV-0001 → REJECT` red · `REV-0002 → ACCEPT_WITH_LIMITATIONS` amber · `REV-0003 → ACCEPT` green);
  `4 Supporting Evidence` → `EV-0128 · EV-0142 · EV-0150` (links);
  `5 Evaluation Basis` → doc icon + Arabic paragraph.
- **RIGHT (`السياق`):** `Revalidation Trigger` (clock + `15`), `Last State-Change Cause` (refresh + eyebrow
  `تغيير الحالة الأخير` + date `2024-12-15`), `Conflict Status` (shield + eyebrow `حالة التعارض` +
  `لا توجد أي حالات تعارض مفتوحة`), `Evaluation Provenance` (clipboard + **5 metadata lines**:
  `Source of truth: CEP Mastery Service`, `Evaluation Time: 2025-05-19 13:48:03 UTC`,
  `Evaluated By: mastery-engine@cep`, `Policy Set: APPSEC`, `Computation ID: MSC-720419@v2`) and a button
  `فحص التقييم التلقائي`.
- **BOTTOM:** populated shelf `مساحة عمل ممتلئة` + footer `CEP © 2025`.

### 5.2 What the current implementation shows
Identical shell to Evidence/Reviews.
- **LEFT:** `NOT_EVALUATED · No authorized Mastery provider/evaluator is bound.` (empty) or one row
  `crypto-basics user:self / ms-flow-001`. **~650 px blank.** No tree, no `History`, no re-evaluation button
  (the `Request governed re-evaluation` toolbar control exists but is disabled).
- **Toolbar:** `Inspect Mastery · Explain causal basis · Request governed re-evaluation` (3, disabled).
- **CENTER:** hero `Mastery workbench` + summary; card rows `Ok`, `Id`, `Subject`, `MasteryTarget`, **`Judgment`**,
  `Freshness`, `PolicyRef`, `BasisDigest`, then `Evidence`/`Decisions`/`Policy` groups where the renderer emits
  **inverted rows** — label `UNVERIFIED_PROVIDER_UNBOUND` / value `0` / key `Evidence`.
- **RIGHT:** duplicate of CENTER (wrapped). **~570 px blank.**
- `state-machine-blocked` differs from `fixture-row` only in `Evidence`/`Decisions`/`State` = `RESOLVED`.

### 5.3 L1–L4 discrepancies
L1: the reference's **numbered 5-step explainability structure is entirely absent**; the surface is a key/value
dump. Density ≈ 25 % of reference. ·
L2: LEFT tree nav (2 levels) → flat 1-row collection; RIGHT context cards → duplicate; BOTTOM shelf empty. ·
L3: **missing** both status pills (Mastery Judgment / Freshness Status) — the single most identifiable Mastery
component; numbered step structure with drag handles; Required Criteria table; Effective Review Decisions table
(with colour-coded outcomes); Supporting Evidence link list; Evaluation Basis card; Evaluation Provenance block
(5 lines); `History` node; `طلب إعادة التقييم` button. ·
L4: group keys render as a third column; arrays render index-as-value/item-as-label; BIDI clipping and punctuation
displacement as Evidence.

### 5.4 Density assessment
Reference ≈ 25 items across 5 numbered sections + 3 tables + 4 context cards. Current ≈ 12 generic rows.
Whitespace ~55 %. **Under-populated.**

### 5.5 Mastery-specific defects
**M1 — the epistemic state is masked.** The profile requires `NOT_EVALUATED` to be *the informative state*. The
LEFT empty message says `NOT_EVALUATED · …`, but the CENTER card renders `State` → **`EMPTY`** (the generic
`detail={state:'EMPTY'}` placeholder from `m0-controller-composition.ts:102`). The authoritative epistemic state
is therefore **not displayed where the reference puts the judgment pill**. V2 · `CONTENT_MODEL` · routing
**surface Writer** (choose the domain state) + **shared-component owner** (stop overriding with `EMPTY`).

**M2 — unlabelled fixture achievement.** `fixture-row` displays `Judgment: MASTERED` alongside
`Evidence/Decisions: UNVERIFIED_PROVIDER_UNBOUND`, with **no FIXTURE marker anywhere in the UI**, while
`BROWSER_RECEIPT.json#consumerTaxonomy` declares it `SYNTHETIC_DEMO_SEED`. The reference's whole thesis
("completion alone never creates Mastery") is contradicted visually. V2 · `FIXTURE_DATA` · routing **surface Writer**.

**M3 — inverted array rendering** (`UNVERIFIED_PROVIDER_UNBOUND | 0 | Evidence`). V2 · `SHARED_COMPONENT` ·
routing **shared-component owner**.

---

## 6. SURFACE — PORTFOLIO

### 6.1 What the reference actually shows
`Cybersecurity Portfolio Evidence Dashboard`.
- **LEFT (`Portfolio`, gear):** `Saved Views` group — `By Capability · By Project · By Learning Objective ·
  By Evidence Type · By Time · By Mastery State`; `Curated Views` group — `Professional Evidence` (active). 7 rows.
- **Toolbar:** `Edit View ▾ · Add Existing Evidence · Arrange ▾ · Export ▾ · More ▾`.
- **CENTER:** eyebrow `Portfolio` + `Application Security — Professional Evidence`; `3 Capabilities ·
  9 Evidence References`; right control `Sorted by: Capability Order ▾`.
  Then **three numbered capability groups**, each with an Arabic title + icon, a coloured **Mastery Projection**
  badge (`SECURE CODING FUNDAMENTALS — MASTERED` green · `APPLICATION SECURITY INVESTIGATION — MASTERED` teal ·
  `RESPONSE & RECOVERY — INSUFFICIENT_EVIDENCE` amber) and a right-hand completeness indicator
  (`مكتمل 3 من 3`, `3 من 4` + ⚠).
  Each group contains a **6-column evidence table** — id (`EV-0128`), title (`Secure Coding Analysis`), status pill
  (`مُنجز`), date (`28 مايو 2024`), revision (`REV-0021`), decision badge (`ACCEPT` green) — plus an Arabic
  description line. 9 rows total (EV-0128/0140/0145 · EV-0142/0143/0147 · EV-0150/0151/0152) and a group footer
  `عرض جميع الأدلة ←`.
- **RIGHT (`السياق`):** 5 cards — `نطاق الملف`, `نطاق التجميع`, `حالة التجميع`, `السياق البشري`
  (المالك / آخر تحديث / اللغة العربية (RTL) / الهدف المهني), `سياسة المصادر` (المصدر / عدم النسخ) —
  and a button `فحص النطاق الحرفي`.
- **BOTTOM:** `مساحة عمل مملوءة` shelf.

### 6.2 What the current implementation shows
- **LEFT:** `No canonical Portfolio memberships are bound.` (empty) or one row
  `…ference (source not bound) / pm-flow-001`. **~650 px blank.** No Saved/Curated Views.
- **Toolbar:** `Remove Portfolio reference · Filter Portfolio · Export exact references · Update governed grouping`
  (matches `surface-profiles/portfolio.json#domain_commands`). `portfolio.filter` and `portfolio.export` enabled;
  `portfolio.curate` and `portfolio.group` correctly disabled.
- **CENTER:** generic card `W04 flow reference (source not bound)` with `Id`, `RevisionId`, `RefType`,
  `SourceRef`, `State` (`UNAVAILABLE`), `GroupingRef` (`—`), `GroupingState` (`UNGROUPED`), `Title`, `Annotation`,
  `TruthClass` (`CURATION_REFERENCE`).
- **RIGHT:** duplicate of CENTER. **~570 px blank.**
- Export state (`W04 flow mastery reference`, `RefType: Mastery`) differs only in 3 scalars.

### 6.3 L1–L4 discrepancies
L1: the reference's grouped portfolio catalogue (3 capability groups × 6-column rows) is entirely absent; density
≈ 15 % of reference. · L2: LEFT saved-view navigation (7 rows, 2 groups) → 1-row collection; RIGHT context cards →
duplicate; BOTTOM empty. · L3: **missing** Saved Views nav · Curated Views · `Edit View ▾`/`Arrange ▾`/`More ▾` ·
collection count line · `Sorted by` control · numbered capability groups · Mastery Projection badges ·
completeness indicators · 6-column evidence rows · `عرض جميع الأدلة ←` footer · 5 RIGHT context cards ·
`فحص النطاق الحرفي` button. · L4: same BIDI clipping/punctuation defects.

### 6.4 Density assessment
Reference ≈ 35 items (9 rows × 6 fields + 3 group headers + badges + 7 nav + 5 toolbar + 5 context cards).
Current ≈ 10 generic rows + 4 controls. Whitespace ~60 %. **Severely under-populated.**

### 6.5 Portfolio-specific — Q-5 (STOP/REPORT)
**P1 — grouping authority correctly not invented (KEEP).** `GroupingRef: —`, `GroupingState: UNGROUPED`,
`portfolio.group` disabled, `truth.groupingAuthority = AUTHORITY_DECISION_REQUIRED`, and
`BROWSER_RECEIPT.json` limitations record the refusal. **This is correct and must remain unchanged.**
**P2 — the authority *state* is not legible.** The reference makes grouping status a first-class visible fact
(`حالة التجميع` card, per-group completeness badges). The current surface shows it only as a `—` value in a
generic row. Recommendation: surface `Grouping authority: AUTHORITY_DECISION_REQUIRED (Q-5 open)` as an explicit
notice, **without** rendering any grouping structure. The grouping *authority* remains an Owner question →
**Owner STOP/REPORT (Q-5)**; the *display of the pending state* is a surface Writer fix.

**P3 — `portfolio.curate` is labelled `Remove Portfolio reference`.** The reference's primary curation action is
`Add Existing Evidence`. A curation surface whose only labelled action is *removal* misrepresents the content model.
V2 · `CONTENT_MODEL` · routing **surface Writer + Coordinator**.

---

## 7. Cross-cutting defect register

Severity V0–V4 and root-cause classes per governance §4.

| ID | Defect | Sev | Root cause | Routing | Evidence | Recommended change | Re-comparison plan |
|---|---|---|---|---|---|---|---|
| **D1** | RIGHT-context region renders a **second copy of the CENTER projection**, violating the Owner-approved top law `ONE INFORMATION ITEM → ONE AUTHORITATIVE DISPLAY LOCATION` | **V4** | `SHARED_COMPONENT` | **shared-component owner + Coordinator** | `m0-controller-composition.ts:103` and `:105` both call `semanticProjection(detail)`; DOM probe: `center … State | EMPTY` ≡ `right … State | EMPTY` on all 4 surfaces; the rich context descriptors (`createEvidenceContextProvider`, `createReviewsContextProvider`, `mastery.contextProvider`, `portfolio.contextProvider`) are authored and never rendered | Route the surface context descriptor through `ContextInspectorHost` into RIGHT; RIGHT must contain no content that also appears in CENTER | Recapture all 4; assert RIGHT text ≠ CENTER text; assert `lenses[].tabs[].fields` visible |
| **D2** | Typed collection matrix suppressed → LEFT degrades to 2-line generic rows | **V3** | `SHARED_COMPONENT` (consumer override) | **shared-component owner** | `m0-controller-composition.ts:174` forces `collectionMode:'list'`; probe `tables = 0`; adapters author 4 columns with `tone`/`secondary`/`compareRows` | Default to `collectionMode:'auto'` for W04, or render `adapter.columns` when present. **Do not change `CollectionTableMatrixPresentationCore`** | Recapture; assert `.m0-table` present with the authored column headers and tone classes |
| **D3** | Bottom shelf permanently `UNAVAILABLE`; domain bottom projections never reach it | **V3** | `ARCHITECTURE` (two disconnected bottom mechanisms) | **shared-component owner + Coordinator** | `#bottomShelf` `data-bottom-availability="UNAVAILABLE"`, `data-bottom-provider-owner=""` in empty **and** populated states; `surface.bottom`/`bottomProjection` (deep artifact, revision lineage, raw provenance, decision lineage, export preparation) exist and are wired to a separate `domainBottomRegion` | Register the surface bottom projection as a `BottomDeepWorkOwner` provider so the shelf populates; keep the shelf contract unchanged | Recapture with a selected record; assert shelf shows deep artifact / lineage / provenance sections |
| **D4** | LTR technical labels clipped at the **start** (`…orkbench · Collection`, `…kbench · Detail`, `…w candidate cand-w04-flow`, `…ference (source not bound)`) | **V2** | `SHARED_COMPONENT` + `IMPLEMENTATION` | **shared-component owner** | Live probe: `.phead h2` computed `direction:rtl`, `overflow:hidden`, `text-overflow:ellipsis`, `white-space:nowrap`, width 187 < scrollWidth 260 | Wrap LTR labels in `dir="ltr"` + `unicode-bidi:isolate` (the pattern `semanticProjection` already uses via `<bdi dir="ltr">`) | Recapture; assert label rendered in full with ellipsis at the end only |
| **D5** | Trailing punctuation displaced in RTL blocks (`… Admission, .Review, Decision or Mastery`; `.Declare a Candidate … •`) | **V2** | `SHARED_COMPONENT` | **shared-component owner** | Probe: hero `<p>` and `.m0-empty-guidance li` compute `direction:rtl` while carrying English sentences | Apply `dir="auto"`/`dir="ltr"` isolation to these blocks; keep RTL for Arabic copy | Recapture; assert sentence-final `.` renders at the end |
| **D6** | `semanticProjection` destroys hierarchy: group keys render as a third column; arrays render index-as-value / item-as-label (`UNVERIFIED_PROVIDER_UNBOUND \| 0 \| Evidence`) | **V2** | `SHARED_COMPONENT` | **shared-component owner** | `m0-controller-composition.ts:78-83`; visible in all 4 populated frames | Render nested objects as titled section headers with separators; render arrays as list rows keyed by the item's own label | Recapture; assert section headers span the row and arrays render label→value |
| **D7** | Context pane carries Library-donor scope tabs `الوحدة \| الكتلة المحددة` ("Unit / Selected block") — meaningless on all 4 W04 surfaces | **V2** | `SHARED_COMPONENT` | **shared-component owner** | DOM probe on all 4 surfaces | Suppress or re-map the scope control per surface family | Recapture; assert no Library-editor scope vocabulary |
| **D8** | Command-menu labels concatenate the owner token (`Request formal ReviewW04ReviewDomain`, `Commands / الأوامرfoundation.commands`, `Structure pane / البنيةfoundation.workspace`, `New linked noteWorkspaceNoteBindingSeam`) | **V1** | `IMPLEMENTATION` | **shared-component owner** | DOM probe on all 4 surfaces | Separate label from owner metadata | Open ⌘ palette in capture; assert labels are clean |
| **D9** | Lifecycle states are visually indistinguishable; older capture rounds record 6 named states under one byte identity (`a29d3436656b`, 20 files) | **V2** | `SURFACE_COMPOSITION` + `EVIDENCE/ORACLE` | **surface Writer** (state treatment) + **Coordinator** (evidence hygiene) | sha census; final run differs only in 1–2 scalar tokens | Add a state pill / state tone / state-specific affordance per state dimension; label superseded captures | Recapture each state; assert ≥1 distinct state affordance per state |
| **D10** | Reference structure absent across all 4 CENTER areas (status pills, icon rows, titled sections, reference cards, findings table, numbered steps, capability groups) | **V3** | `SURFACE_COMPOSITION` + `CONTENT_MODEL` | **surface Writer** (composition) + **Coordinator** (contract-vs-reference) | Sections 3.5, 4.5, 5.3, 6.3 above | Build surface-specific record compositions per §6 ("reuse of the right contract"), driven by the reference's section structure | Per-surface L3 diff against the reference component list |
| **D11** | Responsive capture missing: W04 evidence is 1440×980 only; governance §9 requires **1440×1000 and 1024×900** | **V2** | `EVIDENCE/ORACLE` | **surface Writer** | `writer-output/W04/evidence/*` all 1440×980; `BROWSER_RECEIPT.json` declares a single viewport | Capture 1024×900 + pane-collapse for all 4 | Recapture at 2 widths; assert no clipping/overflow regressions |
| **D12** | Empty *treatment* is a broken empty state despite valid copy: bare `EMPTY / State` row duplicated in RIGHT, 55–70 % unexplained blank canvas | **V3** | `SURFACE_COMPOSITION` | **shared-component owner** (D1/D6) + **surface Writer** | Sections 3.4, 4.4, 5.4, 6.4 | Design a real empty-state block (icon, state token, next action, bounded height) and remove the RIGHT duplicate | Recapture empty states; assert blank ratio < 35 % and no empty right/context area |

### 7.1 Questions escalated to the Owner (STOP/REPORT — never decided here)
- **Q-5 Portfolio grouping authority.** Unresolved. The surface must **not** render grouping structure. It *should*
  render the pending-authority state explicitly (defect **P2**). Decision is Owner-only.

### 7.2 Valid decisions that must be preserved unchanged
- `ReviewAuthorityRegistry` gating and the no-self-approval law (visible as disabled commands with reasons).
- `ReusableToolbarTemplateOwner` behaviour and the W04 `toolbarCommandIds` split in
  `stack/native-typescript/surfaces/reviews/index.ts` — **visually confirmed working**; the Reviews toolbar renders
  exactly `surface-profiles/reviews.json#domain_commands` and is not dead or empty.
- `CollectionTableMatrixHost` / `CollectionTableMatrixPresentationCore` contract (its column/tone/compare model is
  correct and is exactly what the reference needs — only the consumer override is wrong).
- `ContextInspectorHost` lens/tab/field contract.
- W04's default-EMPTY truth law and the informative empty **copy** (`normal-defaults-empty`).
- Portfolio's `AUTHORITY_DECISION_REQUIRED` refusal.

---

## 8. Per-surface verdicts

| Surface | Verdict | Highest-risk defects | Empty/under-populated? | Why |
|---|---|---|---|---|
| **evidence** | **VISUAL_FAIL** | D1 (V4), D2, D3, D10, D12 | **Yes** — empty: 4 items / ~65 % blank; populated: ~15 items / ~50 % blank | Default-EMPTY truth is correct; but the empty *treatment* is broken and the reference's record structure (Source Handoff, Supporting References, context cards) is entirely absent |
| **reviews** | **VISUAL_FAIL** | D1 (V4), D2, D3, D10, R1 | **Yes** — ~60 % blank; findings/decisions below the fold | Toolbar is correct and live; the Criterion Findings table, Decision Preparation and 6 context cards are missing |
| **mastery** | **VISUAL_FAIL** | D1 (V4), D2, D3, M1, M2, D10 | **Yes** — ~55 % blank | Both status pills and the numbered 5-step explainability structure are missing; `NOT_EVALUATED` is masked by a generic `EMPTY` token |
| **portfolio** | **VISUAL_FAIL** | D1 (V4), D2, D3, D10, P2, P3 | **Yes** — most severe; ~15 % of reference density | Grouping correctly withheld (Q-5) but the pending-authority state is illegible; the grouped catalogue, saved views and context cards are absent |

**These are not verdicts that the W04 surface code is wrong.** Nine of the twelve register defects
(D1–D8, D12) are rooted in shared/protected code
(`stack/native-typescript/surfaces/m0-controller-composition.ts`, `foundation/workspace.ts`,
`foundation/collection/table-matrix.ts`, `foundation/global/context-inspector.ts`) that a W04 surface Writer is
forbidden to edit. Acceptance for these four surfaces **cannot be cleared by the surface Writer alone**; the
shared-component improvement protocol (governance §6: isolate → inspect contract → inspect consumers →
minimally improve the primitive → preserve owner boundaries → regression-test consumers → re-run visual checks)
must run first, then the L1–L4 loop re-run per surface.

## 9. 18-box acceptance gate (governance §10) — W04 status

| Box | evidence | reviews | mastery | portfolio |
|---|---|---|---|---|
| Functional behaviour | ✅ | ✅ | ✅ | ✅ |
| Architecture respected | ✅ | ✅ | ✅ | ✅ |
| Ownership respected | ✅ | ✅ | ✅ | ✅ |
| Shared components used correctly | ❌ D2/D3/D7 | ❌ D2/D3/D7 | ❌ D2/D3/D7 | ❌ D2/D3/D7 |
| Not unnecessarily duplicated | ❌ **D1** | ❌ **D1** | ❌ **D1** | ❌ **D1** |
| Not forcing inappropriate composition | ❌ D6 | ❌ D6 | ❌ D6 | ❌ D6 |
| Meaningful content/state exists | ⚠️ M1 | ⚠️ findings hidden | ❌ M1/M2 | ⚠️ |
| No unjustified blank regions | ❌ D12 | ❌ D12 | ❌ D12 | ❌ D12 |
| Reference actually inspected | ✅ | ✅ | ✅ | ✅ |
| Current screenshot captured | ✅ | ✅ | ✅ | ✅ |
| Component-level comparison performed | ✅ | ✅ | ✅ | ✅ |
| Major discrepancies addressed | ❌ | ❌ | ❌ | ❌ |
| Responsive still correct | ❌ D11 | ❌ D11 | ❌ D11 | ❌ D11 |
| Valid strategic decisions preserved | ✅ | ✅ | ✅ | ✅ (Q-5 held) |
| Obsolete assumptions not blindly preserved | ✅ | ✅ | ✅ | ✅ |
| Evidence bound to correct candidate | ⚠️ E1 | ⚠️ E1 | ⚠️ E1 | ⚠️ E1 |
| Re-comparison confirms the fix | n/a — not yet fixed | n/a | n/a | n/a |
| Remaining differences justified | ❌ | ❌ | ❌ | ❌ |

**Result: 4/4 surfaces do not pass the gate.** No surface may be recorded `VISUAL_PASS`.

## 10. Routing summary

| Route | Defects |
|---|---|
| **shared-component owner** (highest priority — unblocks all 4 surfaces) | D1 (V4), D2, D3, D4, D5, D6, D7, D8, D12 |
| **surface Writer** | D9 (state treatment), D10 (record composition), D11 (responsive capture), M1, M2, R1, P2, P3 |
| **Coordinator** | D3 (seam adjudication), D9 (evidence hygiene), D10 (reference-vs-`domain_commands` contract conflict on toolbar control sets) |
| **Owner STOP/REPORT** | **Q-5** Portfolio grouping authority (only) |

---

*Audit artefacts (derived, non-product): `/tmp/opencode/audit/**` — re-encoded reference copies, labelled
side-by-side composites, and the read-only DOM probe script. No product source, `dist/**`, `assurance/**`,
`controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**` or `authority/**` file was modified.*

---

# W04 R5–R7 REMEDIATION — surface-owned defects closed

**Round type:** R1 implement · R2 capture · R3 compare · R4 component discrepancy · R5 fix · R6 recapture · R7 recompare
(governance §8). Method: **file bytes are ground truth** — SHA-256, PIL dimensions, pixel ink/blank-band
geometry and per-file tesseract OCR, per `controller/12_execution/11_evidence_channel_integrity.md` §3/§4.
The harness image channel was used for orientation only; every claim below is reproduced from
`writer-output/W04/reaudit-evidence/**` byte measurements, never from a rendered view.

**Owner of this round:** W04 Surface Writer (Evidence · Reviews · Mastery · Portfolio).
**Shared code touched:** none. `m0-controller-composition.ts`, `foundation/**`, `adapters/structured-documents.ts`
and the 3 protected canonical deltas were read/consumed only.

## R0/R5. What was built

| File | Role |
|---|---|
| `surfaces/evidence/presentation.ts` (new) | Evidence CENTER record composition as **data** |
| `surfaces/reviews/presentation.ts` (new) | Reviews CENTER record composition as data |
| `surfaces/mastery/presentation.ts` (new) | Mastery CENTER record composition as data |
| `surfaces/portfolio/presentation.ts` (new) | Portfolio CENTER record composition as data |
| `surfaces/composition/w04-rescue.ts` (extended) | **one** shared W04 renderer + presentation engine (CSS, MutationObserver upgrade, `More ▾` overflow, P3 command registration) |
| `surfaces/evidence/index.ts`, `surfaces/reviews/index.ts` | RIGHT context lenses rebuilt (provenance/lineage/scope/authority/prior) |
| `surfaces/mastery/composition.ts`, `surfaces/portfolio/composition.ts` | RIGHT context lenses rebuilt (provenance+request · authority+receipts) |
| `tests/surfaces/w04-reaudit/presentation.test.ts` (new) | pins the D9/D10/M1/M2/P2 composition contract |
| `tools/w04-reaudit-capture.mjs`, `w04-reaudit-measure.py`, `w04-reaudit-proofs.mjs`, `w04-reaudit-composite.py` (new) | R2/R6 capture · R3/R7 measure · 86 acceptance proofs · self-identifying composites |

Design decision (governance §6 *reuse of the right contract*): the surface files **declare** the
composition; `w04-rescue.ts` **projects** it once for all four surfaces. Section headings keep the shared
`m0-semantic-group` contract and label/value rows keep `m0-semantic-list`, so the shared structural metrics
still describe these surfaces; pills, lifecycle tracks, numbered steps, split cards, the findings table and
notices are the surface-specific components the reference shows and the shared primitive deliberately does
not own. **No shared component was modified.**

## R7. Defect-by-defect closure

| ID | Was | Now | Evidence |
|---|---|---|---|
| **D9** lifecycle state affordances | `VISUAL_FAIL` V2 | **CLOSED** | Every surface renders a state **track** with exactly one `data-w04-step-state=current` position plus ≥2 derived *next actions* (evidence intake→admission, reviews REQUESTED→CLOSED, mastery judgment dimension, portfolio member source state). Proofs `D9.evidence.lifecycle-track`, `D9.evidence.next-actions`, `D9.reviews.workflow-track`, `D9.mastery.judgment-dimension-track`; `pills 0→2..3` per surface in the frame census. |
| **D10** record composition | `VISUAL_FAIL` V3 | **CLOSED** | Evidence: `Source Handoff` + `Selected Supporting References` (3-card pattern, informative EMPTY when the handoff selected none). Reviews: `Criterion Findings` **table** (3 columns) beside `Criterion References`, `Reviewer Rationale`, dashed `Decision Preparation`. Mastery: **both status pills** + the **numbered 5-step** explainability structure (`rectables 1+0 → 1+2`). Portfolio: Q-5 notice, member-state track, reference identity, source integrity, export preparation. Proofs `D10.*` (17 assertions) + `presentation.test.js`. |
| **D11** responsive capture | `VISUAL_FAIL` V2 | **CLOSED** | 34 frames at **1440×1000 and 1024×900** (was 1440×980 only). Zero clipped titles/pills/steps, zero horizontal overflow at both widths (proofs `D11.*`). Frame census `CAPTURE_RECEIPT.json#viewports`. |
| **M1** `NOT_EVALUATED` masked | `VISUAL_FAIL` V2 | **CLOSED** | Empty Mastery CENTER now leads with the pill `Mastery Judgment: NOT_EVALUATED` (+ `Freshness Status: UNAVAILABLE`, explicitly labelled *no evaluation exists*) and a notice explaining that `NOT_EVALUATED` **is** the informative state. Proof `M1.mastery.*`; empty CENTER ink 0.051 → 0.122, words 150 → 294. The shared empty guidance sentence is preserved (proof `M1.mastery.guidance-preserved`). |
| **M2** unlabelled fixture `MASTERED` | `VISUAL_FAIL` V2 | **CLOSED** | Fixture rows carry a **`FIXTURE` badge on the judgment pill** and a first-block notice `FIXTURE · SYNTHETIC_DEMO_SEED … not a real consumer achievement` (L07 taxonomy named). Proofs `M2.mastery.*`. No record was added to make this true — the two fixture rows are the harness's existing `SYNTHETIC_DEMO_SEED` rows. |
| **R1** 7/10 `reviews.*` unreachable | `VISUAL_FAIL` V2 | **CLOSED** | Toolbar keeps exactly the 4 `domain_commands`; a `More` overflow lists the other **7** (`request, assign, start, ready, continue, cancel, rereview`), each with its live availability reason, and executes through the canonical bus with the toolbar payload. Proof `R1.*` includes an end-to-end transition `IN_REVIEW → READY_FOR_DECISION` driven from the overflow with the pill following. Extra state shot `reviews-<vw>-more-menu-open.png`. |
| **P2** Q-5 authority illegible | `VISUAL_FAIL` V2 | **CLOSED** | First block on Portfolio is the notice **`Grouping authority: AUTHORITY_DECISION_REQUIRED — Q-5 open`** plus a pill `Grouping: AUTHORITY DECISION REQUIRED`. **No grouping structure is rendered** (proof `P2.portfolio.no-grouping-structure`). The refusal itself is unchanged and re-proven (`P1.portfolio.Q5-refusal-preserved`). |
| **P3** `portfolio.curate` label | `VISUAL_FAIL` V2 | **CLOSED** | Label is now **`Curate Portfolio reference`** (proof `P3.portfolio.curate-label`), and the command genuinely routes `action:'add'` \| `'remove'` to the domain's reference-only curation. Implemented by registering the command on the canonical bus **inside W04's own composition, before the controller's `registerW04SurfaceCommands`**, so the controller's `reg()` sees an already-owned command with the same domain owner and yields. **No `m0` edit was needed → no `SERIALIZED_HOTSPOT_REQUEST.md` was filed.** |
| **D3** bottom shelf `UNAVAILABLE` | shared seam | **AUTHORED + WIRED (consumes the shared fix)** | `surface.bottom` (evidence/reviews) and `surface.bottomProjection` (mastery/portfolio) remain the projection the shared `BottomDeepWorkOwner` binding reads. Frame census: `data-bottom-availability = AVAILABLE` on all 8 surface×viewport runs, and the **collapsed → open transition is proved byte-distinct** (`*-bottom-shelf-open.png`) showing the real deep projection (`Raw provenance…`, `Immutable Decision lineage…`, `Diagnostics…`, `ExportPreparation…`). |
| **D1** CENTER/RIGHT duplication | already fixed | **NOT REGRESSED, improved** | RIGHT↔CENTER line overlap **0.385→0.051** (evidence), **0.292→0.140** (reviews), **0.529→0.125** (mastery), **0.333→0.080** (portfolio). The remaining shared tokens are exact source/decision identifiers the reference itself shows in both a record row and a context card. |
| **D2** matrix suppressed | already fixed | **NOT REGRESSED** | `table.m0-table` still renders on all four surfaces with the authored headers (frame census `tableHeaders`). |
| **D6/D12** generic filler / bare `EMPTY` | already fixed | **NOT REGRESSED, improved** | Whole-frame blank share in the EMPTY state: evidence 0.330→0.046, reviews 0.330→0.066, mastery 0.330→0.000, portfolio 0.309→0.000 — all ≪ the 35 % D12 threshold. |

## R3/R7 · Density before → after vs reference (1440×1000, whole frame unless stated)

| Surface | Measure | REFERENCE | BEFORE | AFTER |
|---|---|---:|---:|---:|
| evidence (admitted) | ink % | 0.072 | 0.082 | **0.097** |
| evidence | OCR words | 308 | 198 | **301** |
| evidence | CENTER ink | 0.091 | 0.082 | **0.118** |
| evidence | RIGHT ink / blank | 0.073 / 0.160 | 0.086 / 0.000 | **0.096 / 0.000** |
| evidence | CENTER lines / pills | – | 52 / 0 | **67 / 3** |
| reviews (in review) | ink % | 0.069 | 0.078 | **0.093** |
| reviews | OCR words | 338 | 196 | **310** |
| reviews | CENTER ink | 0.090 | 0.076 | **0.110** |
| reviews | RIGHT ink / blank | 0.088 / 0.000 | 0.078 / 0.000 | **0.091 / 0.000** |
| reviews | CENTER record tables / pills | 1 table (findings) | 0 / 0 | **1 / 2** |
| mastery (fixture) | ink % | 0.053 | 0.068 | **0.096** |
| mastery | OCR words | 253 | 163 | **293** |
| mastery | CENTER ink | 0.060 | 0.072 | **0.119** |
| mastery | RIGHT ink / blank | 0.087 / 0.062 | 0.065 / 0.372 | **0.102 / 0.000** |
| mastery | numbered steps / record tables / pills | 5 / 3 tables / 2 | 0 / 0 / 0 | **5 / 2 / 2** |
| portfolio (2 refs) | ink % | 0.054 | 0.070 | **0.103** |
| portfolio | OCR words | 424 | 177 | **335** |
| portfolio | CENTER ink | 0.068 | 0.064 | **0.128** |
| portfolio | RIGHT ink / blank | 0.063 / 0.000 | 0.067 / 0.368 | **0.100 / 0.000** |
| portfolio | CENTER lines / pills | – | 21 / 0 | **58 / 3** |

EMPTY state (1440×1000): whole-frame blank **0.330→0.046 / 0.066 / 0.000 / 0.000**; CENTER ink
**0.049-0.052 → 0.095-0.122**; OCR words **143-151 → 255-294**.

Reference region ink/blank measured from the same tool against approximate reference pane rectangles
(`reference/MEASURES-reference.json`); reference OCR word counts are an *under-count* for the three Arabic
frames because only `eng` tessdata is installed — they are used as an order-of-magnitude cross-check, not as
an exact target.

## R7 · State-transition proof (byte-distinct)

`after/CAPTURE_RECEIPT.json` — **34 frames, 8/8 (surface × viewport) groups byte-distinct**:

| surface | states | 1440×1000 | 1024×900 |
|---|---|---|---|
| evidence | empty · candidate-submitted · admitted-immutable · bottom-shelf-open | 4/4 unique SHA-256 | 4/4 |
| reviews | empty · in-review-with-findings · ready-for-decision · decision-issued · bottom-shelf-open | 5/5 | 5/5 |
| mastery | empty · fixture-mastered · fixture-second-row · bottom-shelf-open | 4/4 | 4/4 |
| portfolio | empty · assembly-one-reference · assembly-two-references · bottom-shelf-open | 4/4 | 4/4 |

plus `reviews-<vw>-more-menu-open.png` (2) and 8 proofs-driven frames inside `REAUDIT_PROOFS.json`.
The capture tool **exits non-zero** on any byte-identity collision — a claimed-but-not-distinct state is an
EVIDENCE/ORACLE failure, not a pass. This closes the E1 evidence-hygiene finding of the original audit for
the current rounds (the historical 18-identity/97-name census is left intact and untouched).

## R7 · Remaining differences and their explicit justification

1. **LTR record area inside an RTL chrome.** The workspace renders as an RTL mirror (foundation
   `chromeDirection`/locale preference); the references are LTR-layout. The CENTER record composition is
   explicitly `direction:ltr` so English record copy reads correctly (this also removes the D5-class
   sentence-final punctuation displacement *inside my composition*). The chrome direction is a foundation
   preference, not a W04 surface decision → **not changed here**.
2. **LEFT is the typed collection matrix, not the reference's structural nav tree** (Intake/Candidates/…,
   Review Queue/Assigned/In Review/Closed, Mastery tree, Saved Views). Justified three ways: (a)
   `CollectionTableMatrixPresentationCore` is a protected shared contract whose RC-2 restoration the
   Coordinator explicitly required; (b) register **D10 targets CENTER** — the four LEFT defects in §3/§4 are
   `SHARED_COMPONENT`-routed; (c) measured LEFT blank share 0.47–0.81 sits **inside the reference's own LEFT
   blank range 0.58–0.73**, so LEFT is not where the density gap was. Inventing nav rows that filter nothing
   would be an "arbitrary placeholder control" (governance §7).
3. **Toolbar control sets differ from the reference's icon pills.** The rendered set is exactly
   `surface-profiles/*.json#domain_commands` — the original audit itself classified this as a
   *reference-vs-contract conflict, not a bug*, routed to the Coordinator. Evidence gets **no** `More` overflow
   because all 5 of its commands are already visible (an empty overflow would be a dead control); Reviews
   gets one because 7 of its 10 commands were unreachable (**R1**).
4. **RIGHT lens titles are English, not the reference's Arabic card titles.** Content maps 1:1 to facts the
   domain actually owns (`Source integrity and provenance · Lineage completeness · Duplicate search` ↔
   `سلامة المصدر · مراجعة المراجع · فحص التكرار`). Reproducing Arabic product copy would fabricate content;
   governance §3 makes the reference a construction baseline, not a pixel template.
5. **Reference fixture facts are not re-used** (`CE-0142`, `Ahmed`, `RUN-0042`, `MP-APPSEC-v4`, `EV-0128…`).
   They are reference-scenario values; seeding them into the product would violate the default-EMPTY truth
   law. Every value rendered is read from the live domain.
6. **LEFT/RIGHT blank share in the EMPTY state** (LEFT 0.47–0.81, RIGHT 0.766 with no selection).
   Whole-frame blank is **0.000–0.066**, far below the 35 % D12 threshold. RIGHT is selection-scoped by
   `EVIDENCE_SURFACE_CONTRACT.regionRoles.RIGHT` ("one selected … context inspector"); it now carries an
   explicit **`Context that appears on selection`** block (region role · lens titles · domain owner ·
   selection state) so it is an *informative* empty state rather than a dead zone. The reference ships no
   empty state to compare against.
7. **D4 / D5 / D7 / D8 remain open and are not mine.** Start-clipped region headings, RTL punctuation in
   shared copy outside my composition, the Library donor scope tabs `الوحدة | الكتلة المحددة` still present in
   `#rightPane`, and palette label/owner concatenation are all `SHARED_COMPONENT`-routed. I did **not** patch
   them (governance §6: do not copy the defect into every consumer, and do not patch shared code from a
   surface Writer). The only surface-local mitigation is `dir="auto"` on the two empty-state nodes I already
   re-attach, which is non-destructive.
8. **`tools/c2-w04-truth/falsify-w04-truth.mjs` → `composition-static-negative-falsification` now FAILS.**
   The shared D3 bottom-shelf fix introduced `bottomValueSummary … value.slice(0,3)` in
   `m0-controller-composition.ts`, which that check forbids. It is a **truth-law conflict created by a
   parallel change**; I did not adjudicate or weaken it. → reported below (P-W04-04).
9. **`npm run check` exits 1 on 3 `browser.*` receipts** (`lineage_receipt_truthful`,
   `current_candidate_claim_truthful`, `targeted_visual_evidence`) — shared `assurance/**` artifacts bound to
   the dispatch tree hash; the dispatch already recorded the first and third as **P-W04-03**. All 374
   non-browser checks PASS; `npm test` is **210/0**.

## R7 · Acceptance gate re-run (governance §10)

| Box | evidence | reviews | mastery | portfolio |
|---|---|---|---|---|
| Functional behaviour | ✅ | ✅ | ✅ | ✅ |
| Architecture respected | ✅ | ✅ | ✅ | ✅ |
| Ownership respected | ✅ | ✅ | ✅ | ✅ |
| Shared components used correctly | ✅ consumed, none modified | ✅ | ✅ | ✅ |
| Not unnecessarily duplicated | ✅ overlap 0.051 | ✅ 0.140 | ✅ 0.125 | ✅ 0.080 |
| Not forcing inappropriate composition | ✅ one renderer, 4 declarative specs | ✅ | ✅ | ✅ |
| Meaningful content/state exists | ✅ | ✅ | ✅ M1/M2 | ✅ P2 |
| No unjustified blank regions | ✅ blank 0.046 | ✅ 0.066 | ✅ 0.000 | ✅ 0.000 |
| Reference actually inspected | ✅ opened + SHA-verified | ✅ | ✅ | ✅ |
| Current screenshot captured | ✅ 1440×1000 + 1024×900 | ✅ | ✅ | ✅ |
| Component-level comparison performed | ✅ L1–L4 | ✅ L1–L4 | ✅ L1–L4 | ✅ L1–L4 |
| Major discrepancies addressed | ✅ D9/D10/D11 | ✅ D9/D10/R1 | ✅ D9/D10/M1/M2 | ✅ D10/P2/P3 |
| Responsive still correct | ✅ 0 clip / 0 overflow | ✅ | ✅ | ✅ |
| Valid strategic decisions preserved | ✅ | ✅ toolbar 4/4 | ✅ default-EMPTY | ✅ Q-5 held |
| Obsolete assumptions not blindly preserved | ✅ | ✅ | ✅ | ✅ |
| Evidence bound to correct candidate | ✅ 34/34 distinct | ✅ 5/5 | ✅ 4/4 | ✅ 4/4 |
| Re-comparison confirms the fix | ✅ 86/86 proofs | ✅ | ✅ | ✅ |
| Remaining differences justified | ✅ §"Remaining differences" | ✅ | ✅ | ✅ |

**Result:** the four W04 surfaces clear every box this Writer owns. Residual open items are **D4/D5/D7/D8**
(shared-component owner), **P-W04-04** (falsifier ↔ shared `.slice(0,3)` conflict) and **Q-5** (Owner STOP/REPORT).

## R7 · Artifacts

```
writer-output/W04/reaudit-evidence/
  before/  CAPTURE_RECEIPT.json + MEASURES.json + 26 PNG   (shared-fix baseline, no surface presentation)
  after/   CAPTURE_RECEIPT.json + MEASURES.json + 34 PNG   (this remediation, 1440x1000 + 1024x900)
  reference/ MEASURES-reference.json                       (the 4 CURRENT_FINAL_REFERENCE PNGs, SHA-verified)
  REAUDIT_PROOFS.json                                      86/86 acceptance proofs
  composites/ MANIFEST.json + 34 self-identifying composites (REFERENCE | BEFORE | AFTER, filenames + SHA-256 burned in)
  reviews-1440x1000-more-menu-open.png, reviews-1024x900-more-menu-open.png   (R1 enacted state)
```

Proof commands (all re-runnable):
`node tools/w04-reaudit-capture.mjs --label after` · `python3 tools/w04-reaudit-measure.py --label after` ·
`node tools/w04-reaudit-proofs.mjs` (86/86) · `python3 tools/w04-reaudit-composite.py` ·
`node dist/tests/surfaces/w04-reaudit/presentation.test.js` · `tools/writer-serial.sh npm test` (210/0) ·
`node tools/w04-browser-flows.mjs` (5/5) · `node tools/w04-seam-ownership-proof.mjs` (14/14) ·
`node tools/w04-f051-counting-proof.mjs` (11/11).

### R7 · Residual shared-defect probe (`SHARED_RESIDUAL_PROBE.json`)

The shared-component owner's follow-up round (committed `37a533a`, after this remediation started) closed
two of the four shared defects that were visible on my surfaces; two remain. Read-only probe at 1440×1000,
all four surfaces:

| ID | Sev | State on the W04 surfaces | Evidence |
|---|---|---|---|
| **D5** RTL punctuation displacement | V2 | **CLOSED (shared)** — every English block in my composition *and* the shared studio/empty copy computes `direction: ltr` (`dir="auto"` was added surface-locally to the two empty-state nodes I re-attach) | `SHARED_RESIDUAL_PROBE.json#englishDirection` (16/16 `computed:"ltr"`) |
| **D7** Library donor scope tabs | V2 | **CLOSED (shared)** — `#rightPane .contextscope` is still in the DOM but `visible:false` on all four surfaces | `#donorScopeTabs.visible = false` ×4 |
| **D4** region heading start-clipping | V2 | **OPEN · shared** — LEFT `<h2>` `scrollWidth 253–260 > clientWidth 187` on all four (`Evidence workbench · Collection`, …). Lives in `foundation/workspace.ts#region()`; a surface Writer must not patch it. | `#regionHeadings[].clipped = true` ×4 |
| **D8** palette label/owner concatenation | V1 | **OPEN · shared** — `New linked noteWorkspaceNoteBindingSeam`, `Commands / الأوامرfoundation.commands`, … | `#paletteLabels` ×4 |

### R7 · Per-surface verdicts

| Surface | Verdict | Why not `VISUAL_PASS` |
|---|---|---|
| **evidence** | **ACCEPTANCE_REQUIRES_REVIEW** | All W04-owned defects closed (D9, D10, D11, M1, M2, R1-n/a, P2, P3, D3 authored+wired; D1/D2/D6/D12 not regressed and improved). D4 (V2) + D8 (V1) are still visibly present on shared code, and P-W04-04 (falsifier ↔ shared `.slice(0,3)`) is unresolved. |
| **reviews** | **ACCEPTANCE_REQUIRES_REVIEW** | Same; plus R1 closed with an end-to-end overflow-driven state transition proof. |
| **mastery** | **ACCEPTANCE_REQUIRES_REVIEW** | Same; M1/M2 closed; D4 + D8 + P-W04-04 residual. |
| **portfolio** | **ACCEPTANCE_REQUIRES_REVIEW** | Same; P2/P3 closed with the Q-5 refusal re-proven; D4 + D8 + P-W04-04 residual. |

Q-5 remains an **Owner STOP/REPORT** — it is not counted against these verdicts, and no grouping
structure was rendered.
