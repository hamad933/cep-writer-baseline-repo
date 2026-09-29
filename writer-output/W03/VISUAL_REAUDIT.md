# W03 — VISUAL FIDELITY RE-AUDIT (Enterprise · Scenarios · Labs · Runs · Results)

- **Auditor:** W03 Visual Fidelity Auditor (audit/report only — no product source edited this round)
- **Branch:** `writer/mi-serial` · Repo: `/workspaces/cep-writer-baseline-repo`
- **Date:** 2026-09-29
- **Governing layers:** `controller/12_execution/07_visual_fidelity_governance.md` (V0–V4, root-cause classes, L1–L4, 18-box gate) · `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md` (**CEP-VIS-001-FINAL**, CEP-DEC-027) · `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md` §2
- **Scope:** the 5 W03 rows of `controller/12_execution/VISUAL_FIDELITY_REAUDIT_REGISTER.csv`.
- **Deliverable register of record:** this file + fresh captures under `writer-output/W03/reaudit-evidence/` (18 PNGs, `CAPTURE_MANIFEST.json`).

---

## 0. Method note — how the images were actually inspected (EVIDENCE/ORACLE caveat)

The repo capture law (§2) requires screenshots to be **opened and inspected**, not merely present.
During this audit the harness **image-render channel proved unreliable** for these ~1.5 MB dashboard
PNGs: reading the *same* PNG path twice returned **different** pictures (e.g. the AAR reference first
rendered as the Preflight mock, then as the Runs mock), and a re-read of a requested file returned a
previously-loaded image. Judging fidelity from a buggy renderer would corrupt the register.

I therefore grounded every "what the image shows" claim in **deterministic channels** and used the
visual channel only where it agreed with them:

1. **Perceptual hashing + dimensions** (Pillow dHash, 256-bit) to prove identity / near-duplicate /
   distinct across every reference and capture.
2. **OCR** (Tesseract 5.3.4, `--psm 11`) of every reference and every capture to read the actual
   rendered labels, headings, IDs and states.
3. **Targeted crop OCR** (4× upscale, alnum whitelist) to confirm small chrome details.
4. **Edge-density metric** (FIND_EDGES ink fraction + luminance σ) as a secondary whitespace/under-
   population signal.
5. Reliable **first-render** reads where the render channel returned the correct file.

Any claim below that is *only* from the (unreliable) render channel is explicitly flagged. This
methodology gap is itself logged as **DEF-ORACLE-1**.

---

## 1. Reference PNGs actually used (ground-truthed)

| Surface | Reference path | Class | dHash (32) | Size |
|---|---|---|---|---|
| enterprise | `cep-writer/references/visual/02_SIMULATION_AND_ENTERPRISE/01_ENTERPRISE_DIGITAL_TWIN/Enterprise Cybersecurity Topology Dashboard.png` (`8b3b3e3b`) | CURRENT_FINAL_REFERENCE | `6554f500c94b…` | 1503×1046 |
| enterprise (major state) | `…/01_ENTERPRISE_DIGITAL_TWIN/CEP_ENTERPRISE_DIGITAL_TWIN_REVISION_BASELINE_REFERENCE.png` (`54939bae`) | OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE | `6c61af01d2a9…` | 1607×979 |
| scenarios | `…/02_SCENARIOS/Cybersecurity Scenario Timeline Dashboard(1).png` (`98a1c752`) | CURRENT_FINAL_REFERENCE | `6550b703d753…` | 1505×1045 |
| labs | `…/03_LABS/Cybersecurity Lab Task Graph Dashboard(2).png` (`09f9d53b`) | CURRENT_FINAL_REFERENCE | `65543dc0d925…` | 1505×1045 |
| runs | `…/04_RUNS_OPERATIONS/image-gen-1(20260813-230627).png` (`e875f6c5`) | CURRENT_FINAL_REFERENCE | `2570b680c693…` | 1505×1045 |
| runs (major state) | `…/04_RUNS_OPERATIONS/CEP_RUN_PREPARATION_PREFLIGHT_REFERENCE.png` (`91126b1e`) | OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE | `375066c4d693…` | 1505×1045 |
| results | `…/05_RESULTS_REPLAY/Cybersecurity Replay Dashboard Timeline.png` (`4d5af620`) | CURRENT_FINAL_REFERENCE | `6550b684c24f…` | 1505×1045 |
| results (major state) | `…/05_RESULTS_REPLAY/CEP_RESULTS_AAR_SUPPORTING_MAJOR_STATE_REFERENCE.png` (`c9b57a30`) | OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE | `64a0b709c69f…` | 1672×941 |
| results (major state) | `…/05_RESULTS_REPLAY/CEP_RESULTS_COMPARE_SUPPORTING_MAJOR_STATE_REFERENCE.png` (`f5a720f3`) | OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE | `64b4a704d627…` | 1672×941 |

**All nine references are genuine authored mocks** (verified by OCR: AAR shows `VERIFIED · Sealed ·
RESULT-0042-R1 · AAR-0042-01`; Compare shows `RESULT-0042-R1 ↔ RESULT-0047-R1 · both Sealed · digest
verified`; Enterprise major-state shows `Application Security Twin · Revision 3 · PUBLISHED ·
Revision Provenance · Impact (Critical 22 / High 51 …) · Baseline`). No reference is a screenshot of
the audited implementation.

**Note (reference-set inconsistency, minor):** the major-state references are authored at different
canvases (1607×979 and 1672×941) than the base references (1505×1045). Not a product defect; recorded
so downstream comparison normalizes scale.

---

## 2. Current evidence inventory (before + after this audit)

**Pre-existing (W03 packet) — 7 PNGs, only 6 distinct:**

| Capture | Viewport | What it actually shows (OCR) |
|---|---|---|
| `enterprise-twin-baseline-…` | 1440×1000 | Enterprise, **empty topology** `ENT-REV-UNAVAILABLE · DRAFT · No Twin · DETACHED · 0 objects` |
| `runs-preflight-run-recorded-…` | 1440×1000 | Runs `RUN-0042 · RUNNING · Web App interface DOWN`, 3 objects — **not** the Preflight checklist |
| `results-aar-compare-…` | 1440×1000 | Results **EMPTY / provider-unavailable** base + generic filler |
| `replay-causality-timeline-scrub-…` | 1440×1000 | **byte-identical to the row above** (sha `c74a3f9e…`) |
| `spatial-select-connect-…-1440` | 1440×1000 | **Visualize** surface, `Hierarchy unavailable · containment not observed` |
| `spatial-select-connect-…-1024` | 1024×900 | **Visualize** surface, representation list (`KU-D05-…` nodes) |
| `run-terminal-detach-…` | 1440×1000 | Runs `RUN-0042 · RUNNING · No live command events` |

**Captured by me this round (see §0 method): 18 PNGs in `writer-output/W03/reaudit-evidence/`** —
`{enterprise,scenarios,labs,runs,results}-base-1440x1000`, `…-base-1024x900`, plus major-state tab
attempts (`enterprise-state0-Revisions`, `results-state1-AAR`, `results-state2-Compare`, etc.).

---

## 3. Cross-surface findings (apply to all five)

### 3.1 L1 — Global shell shows internal orchestration wave labels
The **global destination chrome renders `W01…W05` badges** next to the five Arabic destinations (crop-OCR
confirms `W4 … W3 … W2`; `W03` also appears in the breadcrumb). `W01…W05` are the **writer-workspace /
wave partition IDs**, not product terminology from CEP-VIS-001. This leaks *context of creation* into
the *workspace surface / global chrome*, contravening `CANONICAL OWNER ≠ WORKSPACE SURFACE ≠ CONTEXT OF
CREATION` and the rule that the shell must not become orchestration chrome. Visible on every surface.
→ **DEF-SHELL-1** (below).

### 3.2 L1 — All five surfaces share the same `m0-controller-composition` scaffold
Scenarios, Labs and Results are composed by `surfaces/m0-controller-composition.ts`, which:
- sets an **identical banner** for Scenarios *and* Labs (`"Structured + Spatial Studio"`, line 118);
- injects an **identical LEFT filler** (`"Edit the structured definition and its spatial relationships
  in one workspace."`, line 122);
- fabricates **generic spatial demo nodes** `studio-node-1/2/3` (type `work-item`, edges `depends`,
  line 73) that surface as filler in Results.

This is "reuse of one screen" rather than "reuse of the right contract" — a shared component forcing
generic composition/density across surfaces (directive §3–§5). `m0-controller-composition.ts` is a
**protected** file → report/coordinate, do not patch.

---

## 4. Per-surface audit

### 4.1 ENTERPRISE — `Enterprise Cybersecurity Topology Dashboard.png` (8b3b3e3b) + major state (54939bae)

**Reference shows (looked at + OCR):** LEFT structural tree in 4 groups (~15 items): *Enterprise Model*
(Systems, Applications, Services, Networks, Devices, Identities, Data, Security Controls), *Digital
Twins* (Training Twin — selected), *Baselines* (Baseline v3.1), *Device Templates* (Windows Server,
Web Application, Database). TOP: mode tabs `Model / Topology / State / Behavior / Validation` + actions
`Save Draft / Validate / Publish Revision / Create Baseline / …` + contextual tool row `Select / Add /
Connect / undo / redo / delete / zoom 100% / fullscreen`. CENTER = the **topology identity**: title
"Training Twin — Application Security" + `Draft Revision 3` pill; **6 richly-labeled node cards**
(Web Application, WAF, Attacker Workstation `[Simulation-local]`, Database, Identity Service, SIEM/
Monitoring — each icon + name + `Type:` + colored border) joined by **6 typed edge labels** (`CONNECTS_TO`,
`PROTECTED_BY`, `DEPENDS_ON`, `AUTHENTICATES_WITH`, `SENDS_LOGS`×2), solid=Typed / dashed=Derived, plus a
**Legend** box. RIGHT = unique selected-object context (Capabilities, Simulation-state source,
Behavior, Telemetry `Enabled`, Validation `Compatible`). BOTTOM = collapsed "temporary workspace".
The **major-state reference** (54939bae) additionally shows the *Revision/Baseline* state: `Application
Security Twin · Revision 3 · PUBLISHED`, Revision Provenance, Impact (Critical 22 / High 51 / Medium 12
/ Low 18), `Baseline`, Twin list (Training Twin / Incident Response Twin), `ACME Cyber Range`.

**Current shows (OCR of `enterprise-base-1440x1000`):** TOP action strip of long English commands
(`Inspect Enterprise selection / Edit typed Enterprise relation / Create successor Enterprise revision /
Create or rebase Digital Twin / Prepare Run handoff[disabled]`). LEFT = `Workspace views: topology /
table / history` + an `Objects` heading with **no objects** (vs 15-item reference tree). CENTER
identity region = **empty dotted canvas**, one featureless rectangle, status `Ready · 100% · 0 selected
· 0 objects`; header `Enterprise · ENT-REV-UNAVAILABLE` + `DRAFT` + `DETACHED`; a summary column
`ENTERPRISE MODEL (empty) / DIGITAL TWINS: No Twin · DETACHED / REVISIONS: ENT-REV-UNAVAILABLE DRAFT /
BASELINES: — · UNAVAILABLE`. RIGHT = `Context`, `Selection object(s) 0`, `Canonical relationship
workspace` + relation buttons, `No selection`, `Source truth / Classification`, with **text clipped at
the right edge** ("Selected conte", "Choose an Ente", "Canonical product t"). Clicking `Revisions`
does **not** reach the PUBLISHED Revision/Baseline state — still `ENT-REV-UNAVAILABLE`.

**L1–L4 discrepancies:**
- **L1:** Reference is a populated topology dashboard; current is an empty operational shell. Whitespace
  ratio far higher; the dominant visual object (topology) is absent.
- **L2:** LEFT is structure-only in reference but is nearly empty (`Workspace views` + bare `Objects`
  heading) in current; a *summary/mini-dashboard* column (`ENTERPRISE MODEL / DIGITAL TWINS / REVISIONS /
  BASELINES`) appears in CENTER-LEFT (≈ anti-pattern "LEFT mini-dashboard / summary panel"); RIGHT is
  present but its content overflows/clips.
- **L3:** Missing: 4-group tree (~15 nav items), the 2-row TOP toolbar (mode tabs + Save/Validate/Publish/
  Create Baseline + Select/Add/Connect/undo/redo/zoom), the 6 node cards, the 6 typed edge labels, the
  Legend, the Revision/Baseline cards (Provenance/Impact). Present but weak: a generic action strip,
  relation buttons, placeholder summary rows.
- **L4:** No node icons/colored borders/type labels; no edge labels or solid/dashed legend; RIGHT text
  clips at container edge (overflow); `UNAVAILABLE/DETACHED/0 objects` empty-state treatment is bare
  (not informative about *why* or *what to do*).

**Density assessment:** reference ≈ 30+ meaningful items (15 nav + 6 nodes + 6 edges + 5 context fields +
legend + revision pill). Current ≈ 8–10 items, most of which are status placeholders (`UNAVAILABLE`,
`DETACHED`, `0 objects`). **Severely under-populated**; the CENTER identity (topology) has zero items.
Edge-density metric: **5.5% ink vs 8.2% reference (0.67×)**.

**Component completeness:** Present: spatial canvas host, relation action group, context inspector,
summary column. Missing/mostly-stubbed: structural tree, topology node/edge/legend presentation,
mode/action toolbar, Revision & Baseline cards.

**Shared-component dependency:**
- `SpatialInteractionKernel` / `SpatialPresentationOwner` — *kernel* is sound (canvas measurable, selection,
  F-049 boundary). But the **rich node/edge/legend presentation the reference requires is not produced**
  (current renders a bare canvas). Presentation richness may be a shared gap (route to W02 for assessment);
  the *empty content* is a data-binding issue, not a kernel defect.
- `RelationInteractionOwner` — **helping** (typed-edge authoring commits, fail-closed negatives proven).
- `ReusableToolbarTemplateOwner` — **contract valid**, but the command set composed into it is a long
  English action strip rather than the reference's mode+action+contextual-tool grammar (composition issue).
- `WorkspaceFoundation` — **helping** (shell/regions), apart from the `W0x` label leak (DEF-SHELL-1).

**Defects:**
- **DEF-ENT-1 (V3, FIXTURE_DATA / CONTENT_MODEL)** — live topology binds **0 objects** (`ENT-REV-UNAVAILABLE`).
  The W03 fixture adapter already defines the *same 6 representative objects* as the reference (Web App,
  WAF, Attacker Workstation, Database, Identity Service, SIEM); representative seed is **derivable from
  existing material** (governance §7) — no invention required. *Hypothesis:* `createEnterpriseAdapter()`
  is bound without a representative seed on the live route. *Change:* bind a representative enterprise
  inventory/twin/baseline seed (labelled representative, not provider truth). *Evidence:* `enterprise-base-1440x1000.png`.
  *Re-compare:* recapture and confirm 6 nodes + typed edges + legend vs 8b3b3e3b. *Decision:* VISUAL_FAIL.
  **Routing:** surface Writer + Coordinator (adapter/seed binding).
- **DEF-ENT-2 (V3, SURFACE_COMPOSITION)** — topology **node cards / typed edge labels / Legend** absent; the
  CENTER identity is not composed as in the reference. *Evidence:* same. *Re-compare:* L3 component diff
  of node card + edge label + legend. *Decision:* VISUAL_FAIL. **Routing:** surface Writer (+ shared-component
  owner W02 to confirm the node/edge primitive can express the reference card).
- **DEF-ENT-3 (V2, SURFACE_COMPOSITION)** — LEFT tree not populated (15 items → 2 headings); a CENTER-LEFT
  summary column approximates the "mini-dashboard / duplicated summary" anti-pattern. *Decision:*
  ACCEPTANCE_REQUIRES_REVIEW. **Routing:** surface Writer.
- **DEF-ENT-4 (V1/V2, RESPONSIVE_RULE / IMPLEMENTATION)** — RIGHT context text **clips/overflows** at the
  container edge at 1440 and 1024. *Evidence:* crop OCR (`Selected conte`, `Choose an Ente`, `Canonical
  product t`). **Routing:** surface Writer.
- **DEF-ENT-5 (V2, EVIDENCE/ORACLE)** — the **Twin/Baseline major state** (`54939bae`: PUBLISHED Revision 3 +
  Baseline + Impact) is **not reconstructable** on the live route (stays `ENT-REV-UNAVAILABLE`); no capture
  reaches it. *Decision:* ACCEPTANCE_REQUIRES_REVIEW (needs a representative published revision/baseline
  state). **Routing:** surface Writer + Coordinator.

**Verdict: `VISUAL_FAIL`** (CENTER topology identity absent; materially under-populated vs 8b3b3e3b).

---

### 4.2 SCENARIOS — `Cybersecurity Scenario Timeline Dashboard(1).png` (98a1c752)

**Reference shows:** LEFT `Scenario Structure` (~15 items + References): Overview, Environment, Roles,
**Phases (01 Initial Access / 02 Application Exploitation / 03 Detection / 04 Response)**, Events,
Injects, Decision Points, Lab Modules, Tasks, Rules, Observability, Completion Criteria, References
(Knowledge Units, Lab Library). TOP: mode tabs `Timeline / Flow / Topology / Canvas` + `Save Draft /
Validate / Publish Revision / Prepare Run / …` + contextual `Select / Add Phase / Add Event / Add Inject /
Add Decision / Add Lab Module / Connect`. CENTER = the **timeline identity**: title "Web Application
Breach & Response" + `Draft Revision 2`; a **vertical 4-phase timeline** (01→02→03→04) where each phase
row holds event cards (e.g. "Attack Accept / Phishing Email Opened" → "Malicious Link Delivery";
"SQL Injection Fundamentals (Reference)" → "Use Data for Priv Escalation?") + `+ Add Element` affordance;
`Legend (Relationships)` (solid=Sequence/Flow, dashed=Conditional Flow). RIGHT = rich selected-element
context: Type/Recipient/Trigger/Delivery/Payload type/Branch impact.

**Current shows (OCR of `scenarios-base-1440x1000` + `…-1024x900`):** a generic **"Scenarios · Structured +
Spatial Studio"** scaffold. TOP commands `Author Scenario / Revise Scenario / Validate Scenario /
Prepare Scenario`. LEFT/CENTER = `Scenarios · Foundation document host` with boilerplate
"Edit the structured definition and its spatial relationships in one workspace", "Structured host
retained for shared workspace composition", "Structured authoring and Spatial structure share the
application-level pane, focus, toolbar and context owners", plus `Revision / version: DRAFT ·
WorkspaceFirst · GlobalReadEditMode`, and "Shared spatial authoring projection; canonical domain mutation
stays behind semantic commands". **No phase tree, no timeline, no event cards, no legend, no right
context.** Identical at 1024×900 (only narrower).

**L1–L4 discrepancies:**
- **L1:** reference = a dense orchestration **timeline dashboard**; current = a generic document/spatial
  authoring scaffold. The surface's entire identity is missing.
- **L2:** LEFT (structure tree) → replaced by generic document host; CENTER (timeline) → replaced by
  boilerplate; RIGHT (element context) → absent.
- **L3:** missing phase list (01–04), event cards, `+ Add Element`, Relationship Legend, mode tabs
  (Timeline/Flow/Topology/Canvas), the 7 contextual authoring tools, the RIGHT Type/Recipient/Trigger/
  Delivery/Payload/Branch block. Present: only a 4-button action stack + placeholder paragraph + a state line.
- **L4:** no timeline node/connector styling, no per-card icons/tints, no legend, no phase numbering —
  the rich component vocabulary of the reference is entirely absent.

**Density assessment:** reference ≈ 40+ meaningful items (15 nav + 4 phases × 2 cards + legend + 6 context
fields). Current ≈ 6–8 items, **all boilerplate/placeholder**. **Severely under-populated**; the CENTER
timeline identity has zero items. Edge-density metric 0.75× reference — but this *overstates* content
because boilerplate paragraphs also produce "ink"; the ink is non-meaningful filler.

**Component completeness:** Present: shared structured host, shared spatial host, action stack, state line.
**Missing: the entire Scenario timeline identity + structure tree + right context.**

**Shared-component dependency:**
- `StructuredSurfaceHost` + `adapters/structured-documents.ts` — **forcing generic filler**. It emits the
  placeholder `"<surface> · Foundation document host"` + "Structured host retained for shared workspace
  composition" (line 16) because no real structured content is supplied. This is exactly directive §7
  "generic filler cards / meaningless rows / blank structure regions".
- `SpatialPresentationOwner` / `SpatialInteractionKernel` — provide a spatial host but **no scenario timeline**;
  a spatial graph is *not* the Scenario identity (the contract says CENTER = "orchestration/timeline/flow").
- `m0-controller-composition` — forces the shared "Structured + Spatial Studio" banner + LEFT filler on Scenarios.

**Defects:**
- **DEF-SCN-1 (V4, SURFACE_COMPOSITION)** — the CENTER **timeline identity is entirely absent**; surface does
  not reach its intended visual product state. *Hypothesis:* surface falls back to the shared structured/spatial
  scaffold instead of composing `ScenarioAuthoringWorkbench` (the contract slot already names it). *Change:*
  compose the phase-timeline center (numbered phases → event cards → legend) per 98a1c752. *Evidence:*
  `reaudit-evidence/scenarios-base-1440x1000.png`. *Re-compare:* L3 diff of timeline rows/cards/legend vs ref.
  *Decision:* VISUAL_FAIL. **Routing:** surface Writer (composition) + Coordinator (m0 is protected).
- **DEF-SCN-2 (V3, SHARED_COMPONENT)** — `StructuredSurfaceHost`/`structured-documents.ts` injects the generic
  "Foundation document host" placeholder instead of surface content. *Decision:* VISUAL_FAIL. **Routing:**
  shared-component owner (improve minimal primitive to not emit filler when real content is expected) + surface Writer.
- **DEF-SCN-3 (V2, SURFACE_COMPOSITION)** — LEFT phase/structure tree (~15 items) and RIGHT element context
  (Type/Recipient/Trigger/Delivery/Payload/Branch) absent. **Routing:** surface Writer.

**Verdict: `VISUAL_FAIL`** (surface identity not implemented).

---

### 4.3 LABS — `Cybersecurity Lab Task Graph Dashboard(2).png` (09f9d53b)

**Reference shows:** LEFT `Lab Structure` (~11 items): Overview, Knowledge Links, Environment, Initial
State, **Task Graph (selected)**, Tools & Actions, Expected Signals, Validation, Safety & Reset, Result
Schema, Completion Criteria. TOP: `Select / Add Task / Connect / Add Branch` + `Save Draft / Validate /
Publish Revision / Prepare Run / More`. CENTER = the **non-linear task graph identity**: title "SQL
Injection Fundamentals" + `Draft Revision 2` + purpose line; a **branching node graph** (1 Discover Input
Surface → 2 Test Input Behavior → 3 Confirm Injection Condition → 4 Inspect Simulated Database Effect
(solid) and → 5 Interpret Generated Signals (dashed, `Optional`)); `Relationship Legend` (Linear Dependency /
Conditional Unlock / Optional Branch). RIGHT = unique properties: Objective type, Required capability,
Permitted tools (Browser / Request Inspector chips), Expected signal, Validation link, Completion
contribution.

**Current shows (OCR of `labs-base-1440x1000` + `…-1024x900`):** the same generic **"Labs · Structured +
Spatial Studio"** scaffold. TOP commands `Author Lab / Revise Lab / Preflight Lab / Prepare Lab handoff`.
LEFT/CENTER = `labs · Foundation document host` + the *same* boilerplate ("Edit the structured definition
and its spatial relationships in one workspace", "Structured host retained for shared workspace
composition", "…share the application-level pane, focus, toolbar and context owners"), `DRAFT` state.
**No lab structure tree, no task graph, no legend, no right properties.** Identical at 1024×900.

**L1–L4 discrepancies:**
- **L1:** reference = a **non-linear task-graph dashboard**; current = the generic document/spatial scaffold.
- **L2:** LEFT (lab structure) → generic host; CENTER (task graph) → boilerplate; RIGHT (properties) → absent.
- **L3:** missing the 5-node branching graph + `Optional` branch, the Relationship Legend, the 11-item lab
  tree, the RIGHT property block (Objective/Required capability/Permitted tools/Expected signal/Validation
  link/Completion contribution). Present: 4-button action stack + placeholder paragraph.
- **L4:** no node numbering/circular badges, no solid-vs-dashed dependency edges, no per-node icons/descriptions.

**Density assessment:** reference ≈ 30+ items (11 nav + 5 nodes + 3 legend keys + 6 property fields). Current
≈ 6–8 boilerplate items. **Severely under-populated**; CENTER task-graph identity has zero items. Edge-density
0.84× — again overstated by filler text.

**Component completeness:** Present: shared structured/spatial hosts, action stack. **Missing: the entire
non-linear task graph identity + lab structure tree + right properties + legend.**

**Shared-component dependency:** identical to Scenarios — `StructuredSurfaceHost`/`structured-documents.ts`
forces the "Foundation document host" filler; `SpatialPresentationOwner` provides a spatial host but the
**non-linear task graph is not composed**; `m0-controller-composition` forces the shared banner + LEFT filler.

**Defects:**
- **DEF-LAB-1 (V4, SURFACE_COMPOSITION)** — CENTER **non-linear task graph entirely absent**; contract slot
  already names "non-linear Task Graph through shared Spatial owner" but it renders as generic host. *Change:*
  compose the branching task graph per 09f9d53b. *Evidence:* `reaudit-evidence/labs-base-1440x1000.png`.
  *Re-compare:* L3 diff of node/branch/legend. *Decision:* VISUAL_FAIL. **Routing:** surface Writer + Coordinator.
- **DEF-LAB-2 (V3, SHARED_COMPONENT)** — same generic `Foundation document host` filler injection as Scenarios.
  **Routing:** shared-component owner + surface Writer.
- **DEF-LAB-3 (V2, SURFACE_COMPOSITION)** — LEFT lab tree (~11 items) and RIGHT property block absent. **Routing:**
  surface Writer.

**Verdict: `VISUAL_FAIL`** (surface identity not implemented).

---

### 4.4 RUNS — `image-gen-1(20260813-230627).png` (e875f6c5) + major state (91126b1e)

**Reference shows:** LEFT `Run Structure` (Overview, Scenario Timeline, Tasks, Devices, Events & Injects,
Telemetry, Observations, Artifacts) + `Run Phases` (Preparation/Execution/Analysis). TOP toolbar:
`Operations / Timeline / Topology` tabs + **`Pause / End Run / Capture Snapshot / …`**. CENTER identity =
**operational telemetry**: header `Web Application Breach & Response · RUN-0042 · RUNNING · 03 Detection ·
SOC Analyst · Investigate suspicious SQL activity`; device tabs `SIEM/Monitoring · Web Application ·
Database` + `Split View`; an **alerts table** (4 rows, Severity/Status chips, filter `Severity: High`,
`Last 1 hour`); an **Alert Details** block (Source/Source IP/User/URI/HTTP Method/Alert ID/Detection Rule/
Technique/Triggered/Ingested); an **Event Timeline** table (Time/Source/Event/Details, 6 rows) with
`Filter events / Highlight / Export`; RIGHT = **interpretation** (Detection rationale / Correlation scope /
Operational implication / Observation / Recommended next step). The **Preflight major state** (91126b1e) shows
`Run Preparation · PREPARING · RUN-0048`, a **6-card preflight checklist** (1 Source Definition, 2 Environment
Contract/Binding, 3 Run Type, 4 Mode/Policy, 5 Roles/Participants table, 6 Readiness Checks table with
PASS/WARNING/BLOCKED) + a red `BLOCKED — 1 mandatory check unresolved` banner + disabled Start.

**Current shows (OCR of `runs-base-1440x1000` + `runs-preflight-run-recorded-…`):** header `Simulation Run ·
Internal simulation · RUN-0042`; toolbar **`Open terminal / pause run / Disconnect provider / [Reconnect
session] / Recorded result`** (only `pause run` is a lifecycle control). LEFT `Topology / Objects / History /
Recorded result` + `Workspace views`. CENTER = a **runtime device topology** (3 objects: Web Application,
SIEM, Database with UP/DOWN pills) + `Run RUN-0042 · RUNNING · No live command events` + `Lifecycle recorded`
+ `Latest event sequence` + `Operational sessions`. **No alerts table, no Alert Details, no Event Timeline,
no Run Phases, no Pre/fight checklist.** `runs-state2-Recordedresult` still shows the topology view.

**L1–L4 discrepancies:**
- **L1:** reference = a dense operational monitoring console; current = a sparse runtime topology view with
  3 devices + a run header. Under-populated.
- **L2:** CENTER is a device topology instead of the alerts/telemetry/Event-Timeline identity; RIGHT
  interpretation (Detection rationale etc.) is thin/absent; Run Phases absent.
- **L3:** **Run toolbar missing `End Run`, `Capture Snapshot`, and any `Start/Prepare/Preflight`** (only
  `pause run` + provider/session controls). This confirms W03's own wiring gap (live route registers only
  `runs.pause/resume`). Missing alerts table, Alert Details (10 fields), Event Timeline table, device tabs +
  Split View, Run Phases, Preflight 6-card checklist.
- **L4:** alert rows lack severity/status chip hierarchy of reference; no timeline table treatment; device
  cards are minimal.

**Density assessment:** reference ≈ 45+ items (8 nav + 3 phases + 4 alerts + 10 detail fields + 6 timeline rows
+ 5 interpretation fields + toolbar). Current ≈ 12–15 items (3 devices + header + lifecycle line). **Materially
under-populated.** Edge-density metric: **4.9% vs 7.8% (0.63×)** — the least dense of the five.

**Component completeness:** Present: run header, device grid, lifecycle/recorded line, provider/session controls,
operational sessions. Missing: telemetry/alerts identity (alerts table, Alert Details, Event Timeline),
Run Phases, most run-lifecycle toolbar controls, Preflight checklist state.

**Shared-component dependency:**
- `OperationalSessionOwner` / `OperationalTerminalHost` — **helping** (OPEN_TERMINAL + truthful detach
  `PROVIDER_REATTACH_UNAVAILABLE`, provider session preserved). Contract valid.
- `SpatialInteractionKernel` — device topology rendered via spatial host; fine, but it is the *wrong identity*
  vs the reference's telemetry console (composition choice).
- `ReusableToolbarTemplateOwner` — **contract valid**; the gap is the **command set** (only `pause/resume`
  registered), not the template.

**Defects:**
- **DEF-RUN-1 (V3, SURFACE_COMPOSITION)** — **Run toolbar missing `End Run`, `Capture Snapshot`, `Start`,
  `Prepare`, `Preflight`** (live route registers only `runs.pause/resume`). *Evidence:* `runs-base-1440x1000.png`
  vs `image-gen-1(20260813-230627).png`. *Re-compare:* L3 toolbar button diff. *Decision:* VISUAL_FAIL.
  **Routing:** surface Writer + Coordinator (command registration / `composeRunsSurface` wiring — W03 B6).
- **DEF-RUN-2 (V3, SURFACE_COMPOSITION / CONTENT_MODEL)** — CENTER shows a device topology, not the
  operational telemetry identity (alerts table + Alert Details + Event Timeline). Under-populated. **Routing:**
  surface Writer.
- **DEF-RUN-3 (V2, EVIDENCE/ORACLE)** — the **Preflight major state** (91126b1e: 6-card checklist + readiness
  PASS/WARNING/BLOCKED + BLOCKED banner) is **not captured/reconstructable**; the "runs-preflight" evidence
  actually shows a RUNNING/recorded topology, not preflight. **Routing:** surface Writer + Coordinator.

**Verdict: `VISUAL_FAIL`** (missing run-lifecycle controls + missing operational telemetry identity).

---

### 4.5 RESULTS — `Cybersecurity Replay Dashboard Timeline.png` (4d5af620) + major states (c9b57a30 AAR, f5a720f3 Compare)

**Reference shows:** LEFT `Result Structure` (Overview, Task Outcomes, Phase Outcomes, Decisions, Observations,
Runtime Artifacts, Provenance). TOP: `Result / Replay / AAR / Compare` + `Candidate Evidence Handoff / Export`.
CENTER identity = **replay timeline**: header `Web Application Breach & Response · RUN-0042 · COMPLETED ·
PARTIAL · 2025-05-14 10:42:51 UTC · Sealed`; replay controls `Pause Replay / Step Back / Step Forward / 1x /
Jump to Marker`; a vertical event timeline (10:24:28 Allowed traffic → … → 10:24:31 SOC Alert delivered → …
Phase transition) + a **split Event Details** block (Effective change/Event type/Current phase/Event-Effect/
Primary impact/Immediate effect/Source) + a **"State at this point"** row of 3 component-state cards
(Web Application Compromised / Database At Risk / Security Control Alerted). RIGHT = analytical interpretation
(Why this matters / Operational impact / Required action / Time window / Observation / Linked artifacts). The
**AAR major state** (c9b57a30) = `VERIFIED · Sealed · RESULT-0042-R1 · AAR-0042-01 · Digest SHA-256 …` with a
4-phase summary + primary findings + analysis chain. The **Compare major state** (f5a720f3) = side-by-side
`RESULT-0042-R1 ↔ RESULT-0047-R1 · both Sealed · digest verified` with per-field deltas + durations.

**Current shows (OCR of `results-base-1440x1000`, `results-state1-AAR`, `results-state2-Compare`):** an
**EMPTY / provider-unavailable** base. Truthful informative text is present: "Recorded Result revisions remain
sealed facts. Replay, AAR and exact comparison are historical analysis only and never execute the live runtime",
"Recorded Results and AnalyticalCompare are read-only with respect to live runtime truth", "Select a Result then
use the shared toolbar/action surfaces". A capability toolbar is present: `Replay recorded Result / Step recorded
Result / Compare sealed Results / Revise AAR analysis / Prepare candidate Evidence handoff / Verify determinism`.
But the CENTER identity region carries **generic filler**: `Recorded Results … EMPTY · State none · Revision none ·
AAR depends · Comparison depends`, placeholder spatial nodes **`studio-node-1 / studio-node-2 / studio-node-3`**,
and `EMPTY · State · 08%`. Clicking `AAR` / `Compare` does **not** reach those major states (still empty).

**L1–L4 discrepancies:**
- **L1:** reference = a dense replay/AAR/compare console; current = an informative-but-empty provider-unavailable
  screen with generic filler. The CENTER replay timeline (identity) is absent.
- **L2:** CENTER (replay timeline + event details + state-at-point) → empty + filler; RIGHT (interpretation) →
  thin; the AAR and Compare modes do not render their states.
- **L3:** missing replay controls, event timeline, split Event Details, state-at-point cards, AAR summary,
  Compare side-by-side. Present: capability toolbar (correct 6 capabilities), truthful sealed-fact boundary text.
- **L4:** `studio-node-1/2/3` and `EMPTY · 08% · State none · Revision none` read as meaningless placeholder rows.

**Informative-empty vs unjustified-blank (the mandated judgment):**
The `RESULTS_PROVIDER_UNAVAILABLE` state is **predominantly a legitimate, informative empty/unavailable state** —
it truthfully states the provider is unavailable, explains the sealed-fact boundary, exposes the correct
capability affordances, and does **not** fabricate sealed Results (correct; keep). **However** it is contaminated
by an **unjustified generic-filler region** in the CENTER identity area: the fabricated `studio-node-1/2/3` demo
nodes and `EMPTY · State none · Revision none · 08%` placeholder rows (from `m0-controller-composition.mountEmbeddedSpatial`
+ the shared scaffold) are generic filler, not informative content. So: **informative unavailable state at the
message level; unjustified generic-filler/blank region at the CENTER identity level.** The remedy is to remove the
filler (do **not** invent sealed data) and let the informative unavailable state own the identity region until
W05 binds the provider.

**Density assessment:** reference ≈ 30+ items (7 nav + 7 timeline events + 7 detail fields + 3 state cards + 5
interpretation fields + toolbar). Current ≈ 8–10 items (capability toolbar + boundary text + filler rows).
**Under-populated**, but the emptiness is *largely justified by the unavailable provider*; the *filler* is not.
Edge-density metric 0.95× — inflated by boilerplate; not a real density parity.

**Component completeness:** Present: capability toolbar (6 correct capabilities), truthful provider-unavailable
message, sealed-fact boundary copy, context inspector. Missing/absent: replay timeline + controls, Event Details
split, state-at-point cards, AAR summary, Compare side-by-side (all **blocked on data**).

**Shared-component dependency:**
- `TimelineReplayOwner` — **helping** (single-instance invariant holds; replay mechanics proven). Q-4 open →
  STOP/REPORT; do not change.
- `AnalyticalCompareOwner` — **helping** (exact comparator `results-compare/1.0.0`, canonical invariance proven).
  Contract valid; Compare visual absent only for lack of data.
- `AuditProvenanceInteractionCore` — **helping**.
- `m0-controller-composition` / `SpatialPresentationOwner` — **forcing generic filler** (`studio-node-1/2/3`).
- `results/presentation.ts:44` — **helping** (truthful `UNAVAILABLE/EMPTY/ERROR` messages).

**Defects:**
- **DEF-RES-1 (V3, FIXTURE_DATA / blocked-dependency)** — CENTER replay timeline + AAR + Compare states absent
  because no sealed Results are bound (`RESULTS_PROVIDER_UNAVAILABLE`). *Hypothesis:* blocked on **W05 CBF-001
  seed + SC-011** persistence (W03 B2). *Change:* none by W03 — do not fabricate; bind the provider when W05 lands.
  *Evidence:* `results-base-1440x1000.png`. *Re-compare:* after W05 seed, re-capture Replay/AAR/Compare vs
  4d5af620 / c9b57a30 / f5a720f3. *Decision:* **BLOCKED** (external dependency). **Routing:** Owner STOP/REPORT →
  W05 dependency; surface Writer to surface the states once data exists.
- **DEF-RES-2 (V2, SHARED_COMPONENT)** — generic filler `studio-node-1/2/3` + `EMPTY · State none · Revision none ·
  08%` placeholder rows in the CENTER identity region. *Change:* remove embedded-spatial demo filler; let the
  informative unavailable state own the region. *Evidence:* OCR of `results-base-1440x1000.png`. *Decision:*
  ACCEPTANCE_REQUIRES_REVIEW. **Routing:** shared-component owner (m0/`mountEmbeddedSpatial`) + Coordinator (m0 protected).
- **DEF-RES-3 (V2, EVIDENCE/ORACLE)** — `results-aar-compare` and `replay-causality-timeline-scrub` evidence are
  **byte-identical** (sha `c74a3f9e…`, dHash `b07cc8e1…`); there is **no distinct visual evidence** for the
  replay/causality/timeline-scrub flow. **Routing:** Coordinator / evidence owner.

**Verdict: `BLOCKED`** (base unavailable state is legitimate; reference-fidelity of Replay/AAR/Compare is blocked
on W05). Filler (DEF-RES-2) is a reviewable defect independent of the block.

---

## 5. Shared components — improve vs unchanged

**Genuinely require improvement (evidence-backed):**
- **`StructuredSurfaceHost` + `adapters/structured-documents.ts`** — emits the generic placeholder
  `"… · Foundation document host"` + "Structured host retained for shared workspace composition" for Scenarios and
  Labs whenever real structured content is absent (DEF-SCN-2, DEF-LAB-2). Forces generic filler / weak hierarchy.
  *Minimal improvement:* never emit filler placeholder copy; expose an explicit empty/unavailable state instead.
- **`m0-controller-composition.ts` (protected — Coordinator/Owner)** — (a) identical "Structured + Spatial Studio"
  banner + LEFT filler for Scenarios *and* Labs; (b) `mountEmbeddedSpatial` fabricates `studio-node-1/2/3` demo
  nodes used as Results filler (DEF-SHELL/DEF-RES-2). Forces one generic screen across surfaces (contravenes
  directive §3–§5). *Because protected* → Owner/Coordinator decision, not a Writer patch.
- **`SpatialPresentationOwner` (W02, assess only)** — the reference topology/task-graph node cards (icon + label +
  type + colored border) + typed edge labels + legend are not produced; current renders a bare canvas/list. Confirm
  whether the primitive can express the reference card richness; if not, improve minimally. **Do not edit here** —
  route to shared-component owner (W02 sole-writer for `foundation/spatial/**`).

**Valid — must remain UNCHANGED (contract sound):**
- `TimelineReplayOwner` (Q-4 STOP/REPORT; single-instance invariant holds), `AnalyticalCompareOwner` (exact
  comparator + canonical invariance), `OperationalSessionOwner` / `OperationalTerminalHost` (truthful detach),
  `RelationInteractionOwner` (typed-edge authoring + fail-closed negatives), `AuditProvenanceInteractionCore`,
  `WorkspaceFoundation` (shell/regions — the `W0x` leak is a composition/string issue, not the foundation's contract),
  `ReusableToolbarTemplateOwner` (template valid; the runs gap is the *command set*, not the template),
  `SpatialInteractionKernel` (kernel mechanics + F-049 boundary valid; empty content is data-binding, not a kernel defect).

---

## 6. Defect register (identified · severity · root cause · change · evidence · re-compare · decision · routing)

| ID | Surface | Severity | Root cause | Recommended change | Evidence | Re-comparison plan | Decision | Routing |
|---|---|---|---|---|---|---|---|---|
| DEF-SCN-1 | scenarios | **V4** | SURFACE_COMPOSITION | compose phase-timeline center per 98a1c752 | `reaudit-evidence/scenarios-base-1440x1000.png` | L3 diff timeline rows/cards/legend | VISUAL_FAIL | surface Writer + Coordinator (m0 protected) |
| DEF-LAB-1 | labs | **V4** | SURFACE_COMPOSITION | compose non-linear task graph per 09f9d53b | `reaudit-evidence/labs-base-1440x1000.png` | L3 diff node/branch/legend | VISUAL_FAIL | surface Writer + Coordinator |
| DEF-ENT-1 | enterprise | **V3** | FIXTURE_DATA / CONTENT_MODEL | bind representative enterprise/twin/baseline seed (derivable from W03 fixture) | `enterprise-base-1440x1000.png` | recapture; expect 6 nodes + typed edges + legend | VISUAL_FAIL | surface Writer + Coordinator |
| DEF-ENT-2 | enterprise | **V3** | SURFACE_COMPOSITION | add topology node cards / typed edge labels / Legend | same | L3 node/edge/legend diff | VISUAL_FAIL | surface Writer + shared (W02 assess) |
| DEF-RUN-1 | runs | **V3** | SURFACE_COMPOSITION | register `End Run`/`Capture Snapshot`/`Start`/`Prepare`/`Preflight` (only pause/resume now) | `runs-base-1440x1000.png` | L3 toolbar diff vs e875f6c5 | VISUAL_FAIL | surface Writer + Coordinator |
| DEF-RUN-2 | runs | **V3** | CONTENT_MODEL / SURFACE_COMPOSITION | add alerts table + Alert Details + Event Timeline identity | same | L3 center diff | VISUAL_FAIL | surface Writer |
| DEF-SCN-2 | scenarios | **V3** | SHARED_COMPONENT | stop `structured-documents.ts` filler placeholder | scenarios capture | L4 filler-text diff | VISUAL_FAIL | shared-component owner + surface Writer |
| DEF-LAB-2 | labs | **V3** | SHARED_COMPONENT | same filler fix | labs capture | same | VISUAL_FAIL | shared-component owner + surface Writer |
| DEF-ENT-3 | enterprise | **V2** | SURFACE_COMPOSITION | populate LEFT tree; drop mini-dashboard summary column | enterprise capture | L2 region diff | ACC_REQ_REVIEW | surface Writer |
| DEF-RES-2 | results | **V2** | SHARED_COMPONENT | remove `studio-node-1/2/3` + `EMPTY/08%` filler | `results-base-1440x1000.png` | L4 filler diff | ACC_REQ_REVIEW | shared-component owner + Coordinator (m0) |
| DEF-RES-3 | results | **V2** | EVIDENCE/ORACLE | produce distinct replay/scrub evidence | both share sha `c74a3f9e…` | re-capture distinct frames | ACC_REQ_REVIEW | Coordinator / evidence owner |
| DEF-RUN-3 | runs | **V2** | EVIDENCE/ORACLE | capture/reconstruct Preflight 6-card state | runs capture (not preflight) | re-capture vs 91126b1e | ACC_REQ_REVIEW | surface Writer + Coordinator |
| DEF-ENT-5 | enterprise | **V2** | EVIDENCE/ORACLE | reconstruct PUBLISHED Revision/Baseline state | enterprise capture (still UNAVAILABLE) | re-capture vs 54939bae | ACC_REQ_REVIEW | surface Writer + Coordinator |
| DEF-SHELL-1 | all | **V2** | CONTENT_MODEL / IMPLEMENTATION | remove internal `W01…W05` wave labels from global chrome | crop-OCR `W4 W3 … W2` | re-capture nav; confirm no W0x | ACC_REQ_REVIEW | surface Writer + Coordinator |
| DEF-ENT-4 | enterprise | **V1/V2** | RESPONSIVE_RULE / IMPLEMENTATION | fix RIGHT-pane text clipping/overflow | crop-OCR `Selected conte…` | re-capture 1440 + 1024 | ACC_REQ_REVIEW | surface Writer |
| DEF-SCN-3 / DEF-LAB-3 | scenarios / labs | **V2** | SURFACE_COMPOSITION | add LEFT trees + RIGHT context | captures | L2/L3 diff | ACC_REQ_REVIEW | surface Writer |
| DEF-ORACLE-1 | methodology | **V2** | EVIDENCE/ORACLE | harness image-render channel unreliable (same path → different images); capture method must use deterministic inspection | §0 | — | ACC_REQ_REVIEW | Coordinator / Owner |
| DEF-RES-1 | results | **V3** | FIXTURE_DATA (blocked) | bind sealed-Results provider when W05 lands; do not fabricate | `results-base-1440x1000.png` | re-capture Replay/AAR/Compare after W05 | **BLOCKED** | Owner STOP/REPORT → W05 dependency |

---

## 7. REPORT_BACK (mandate §REPORT_BACK)

1. **Per-surface verdict + first highest-risk defects**
   - Enterprise `VISUAL_FAIL` — **DEF-ENT-1 (empty topology, 0 objects)**, DEF-ENT-2 (no node/edge/legend identity).
   - Scenarios `VISUAL_FAIL` — **DEF-SCN-1 (V4: timeline identity absent)**, DEF-SCN-2 (shared filler).
   - Labs `VISUAL_FAIL` — **DEF-LAB-1 (V4: task-graph identity absent)**, DEF-LAB-2 (shared filler).
   - Runs `VISUAL_FAIL` — **DEF-RUN-1 (V3: missing End Run/Capture Snapshot/Start/Prepare/Preflight)**, DEF-RUN-2 (no telemetry identity).
   - Results `BLOCKED` — DEF-RES-1 (provider blocked on W05), **DEF-RES-2 (generic filler)**, DEF-RES-3 (duplicate evidence).

2. **Surface-level vs shared-component-level**
   - *Surface-level:* DEF-ENT-1/2/3/4/5, DEF-RUN-1/2/3, DEF-SCN-1/3, DEF-LAB-1/3 (composition + content on the W03 surfaces).
   - *Shared-component-level:* DEF-SCN-2, DEF-LAB-2 (`StructuredSurfaceHost`/`structured-documents.ts` filler),
     DEF-RES-2 (m0 `mountEmbeddedSpatial` filler), DEF-SHELL-1 (chrome string leak via shared composition).

3. **Shared components needing improvement vs unchanged** — see §5. Improve: `StructuredSurfaceHost` +
   `structured-documents.ts`, `m0-controller-composition` (protected → Owner/Coordinator), `SpatialPresentationOwner`
   (W02 assess node-card richness). Unchanged: `TimelineReplayOwner` (Q-4 open), `AnalyticalCompareOwner`,
   `OperationalSessionOwner`/`OperationalTerminalHost`, `RelationInteractionOwner`, `AuditProvenanceInteractionCore`,
   `WorkspaceFoundation`, `ReusableToolbarTemplateOwner`, `SpatialInteractionKernel`.

4. **Which surfaces are empty/under-populated and why**
   - **Enterprise:** empty topology — live adapter binds no representative seed (`ENT-REV-UNAVAILABLE`); seed is
     derivable from the existing W03 fixture (no invention needed).
   - **Scenarios & Labs:** not merely empty but *mishandled* — fall back to the shared "Foundation document host"
     scaffold; their timeline / task-graph identities are not implemented at all.
   - **Runs:** sparse — device topology stands in for the operational telemetry identity; toolbar missing lifecycle controls.
   - **Results:** empty but **largely justified** (`RESULTS_PROVIDER_UNAVAILABLE`, blocked on W05 CBF-001/SC-011);
     only the generic filler is unjustified.

5. **Reference PNG paths used** — all nine in §1 (verified by dHash/size/OCR).

6. **Recommended action + routing per defect** — see §6 register. **Highest-priority routing:** the two V4 identity
   failures (Scenarios timeline, Labs task graph) and the shared-filler root cause (`StructuredSurfaceHost` +
   `m0-controller-composition`) go to **Coordinator/Owner (m0 is protected) + shared-component owner + surface Writer**;
   Runs toolbar wiring (DEF-RUN-1) goes to **surface Writer + Coordinator**; Results provider block (DEF-RES-1) is
   **Owner STOP/REPORT → W05**; Q-4 (TimelineReplayOwner retain-vs-retire) remains **Owner STOP/REPORT**.

---

## 8. Acceptance-gate status (directive §10)

Boxes **failing** across the surface set: *meaningful content/state exists* (Scenarios/Labs/Enterprise),
*no unjustified blank regions* (Scenarios/Labs/Results-filler), *reference actually inspected* ✔ (done, §0),
*component-level comparison performed* ✔ (L1–L4), *major discrepancies addressed* ✘ (open), *evidence bound to the
correct candidate* ✘ (DEF-RES-3 duplicate; missing scenarios/labs in original packet — remediated here).

**Overall:** no W03 surface reaches `VISUAL_PASS`. Two surfaces (`scenarios`, `labs`) are **V4** identity failures;
`enterprise` and `runs` are **V3** under-populated/composition failures; `results` is **BLOCKED** on W05 with a
reviewable filler defect. All five are recorded `ACCEPTANCE_REQUIRES_REVIEW` or worse and require the R5–R7
re-comparison loop after remediation.
