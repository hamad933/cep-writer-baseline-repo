# CEP WRITER VISUAL EXECUTION STANDARD

**Status:** MANDATORY · INHERITED BY EVERY WRITER AUTOMATICALLY
**Authority:** CURRENT_OWNER_DIRECTIVE (Master Controller Contract)
**Supersedes:** any packet wording that describes visual references as "presentation only"
**Applies to:** every surface, every Writer, every meaningful modification, every remediation, every visual improvement.

> A future Writer must NOT depend on an ephemeral Coordinator prompt to learn these rules. If your packet and this standard disagree, this standard is correct and your packet is stale — report the conflict and follow this.

---

## 0. EXECUTION CONFIGURATION AND OWNERSHIP UNITS

Provider/model/session/concurrency bindings are **execution configuration, not permanent CEP governance**. The exact current Owner decision + execution-carrier profile + mission binding determines the runtime/model and commit/push mechanics.

Durable laws:
- one coherent mutation owner for every bounded write scope;
- no competing writers on the same shared seam;
- surface/domain identity stays explicit even when one Writer owns a whole milestone;
- shared files may be changed only through the exact mission-bound owner/seam;
- Writer never self-accepts or mutates live Controller authority.

**Current ROUTE-MIMO-AGENT overlay — OD-20260928-085:** exactly ONE persistent sequential Writer on `writer/mi-serial`, executing milestone families W01 → W02 → W03 → W04 → W05. The 23 Surface packets are structural scope/reference inputs consumed by those milestones; they are **not 23 independent launch units** for this carrier.

Commit/push law is carrier-specific. For current ROUTE-MIMO-AGENT, the Writer may create/push bounded checkpoint commits only on `writer/mi-serial`; direct `main` mutation, merge, acceptance, release, deployment and stack freeze remain prohibited. Other carriers follow their own current profile.

Historical MiMo model names and `1 Writer → 1 Surface` wording are execution lineage only unless an exact current carrier/mission rebinds them.

---

## 1. SURFACE IDENTITY AND OWNERSHIP (fill exactly, never blank)

Your packet states these. They are binding:

| Field | Meaning |
|---|---|
| `SURFACE` | Exact surface id from the canonical census (`shell`, `today`, `library`, `learn`, `rq`, `visualize`, `enterprise`, `scenarios`, `labs`, `runs`, `results`, `evidence`, `reviews`, `mastery`, `portfolio`, `health`, `processing`, `validation`, `manual_ai`, `backup`, `audit`, `releases`, `configuration`) |
| `OWNER` | Your writer unit id (e.g. `W02-RQ`) |
| `WRITABLE_ROOTS` | Exact paths you may write |
| `READ_ONLY_ROOTS` | Paths you may read but never write (`controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`) |
| `SURFACE_PURPOSE` | One sentence: **"What is this workspace for?"** |

**Every surface must answer "What is this workspace for?" and then compose around that purpose.**

---

## 2. REFERENCE AUTHORITY — A REFERENCE IS CONSTRUCTION AUTHORITY

### 2.1 The three categories (never conflate)

| Category | Meaning |
|---|---|
| **A. VISUAL REFERENCE AUTHORITY** | The intended construction baseline |
| **B. CURRENT RESULT** | What the code currently renders |
| **C. EVIDENCE SCREENSHOT** | Proof capture bound to candidate/commit/tree/environment/test/viewport/time |

Do not place a visual reference into evidence merely because it is an image.

### 2.2 A reference is authoritative for

visual intent · composition · hierarchy · spatial relationships · information architecture · density/rhythm · interaction language · visual emphasis · pane organization · component relationships · responsive intent.

**It is NOT "presentation only". Never write, inherit, or accept wording that demotes a reference to presentation-only.**

### 2.3 A reference does NOT force preservation of

obsolete implementation · obsolete technology · invalid historical decisions · broken accessibility · broken responsiveness · fake content · architecture mistakes · accidental visual defects.

**REFERENCE != BLIND PIXEL COPY.**

### 2.4 Current authority status must be declared

Classify your reference before building: `OWNER_CONFIRMED_FINAL_REFERENCE` · `CURRENT_FINAL_REFERENCE` · `REVIEWED_FINAL_CANDIDATE` · `OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE` · `SUPPORTING_COMPONENT_REFERENCE` · `INTENTIONALLY_NOT_GENERATED` · `SUPERSEDED` · `STALE`.

If status is unresolved, build to the reference's **intent**, flag the authority gap, and report it. **Do not silently promote a candidate to canonical.**

Register of record: `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md`.
Integrity manifest: `cep-writer/REFERENCE_MANIFEST.json` (path + size + sha256).

---

## 3. PROHIBITED CONCEPTUAL CLONING — HARD RULE

**DONOR != DESTINATION TEMPLATE.**

A surface may borrow **mechanics**: interaction language, structural ideas, proven primitives, tree behavior, panel behavior.

A surface must **never** borrow **composition**. Never produce:

- "Library, but renamed for Scenarios"
- "Learn, but renamed for Labs"
- "Library → copy → Learn"
- "Learn → copy → Scenarios"
- or any equivalent conceptual clone.

This specific historical failure (Library/Learn patterns conceptually copied into Scenarios, Labs, and other unrelated surfaces) is **REJECTED** and must never recur.

Correct method:
> Reference → understand intent → identify reusable mechanics → identify surface-specific requirements → compose locally → compare → improve.

Permitted donor relationships (**mechanics level only**):
- LIBRARY is a structural donor for LEARN and for **VISUALIZE TREE-VIEW**.
- Correct terminology is `VISUALIZE TREE-VIEW`. Never invent a false concept such as "Visualize Review".

---

## 4. LOCAL COMPOSITION RESPONSIBILITY

### 4.1 Shared components are NOT final visual authority

Shared components **may** govern: interaction mechanics · state mechanics · accessibility mechanics · keyboard behavior · ownership · data contracts · responsive mechanics · repeatable primitives, structural capabilities.

They do **NOT** govern: final surface composition · local information hierarchy · final density · local grouping · local content presentation · local emphasis · surface-specific visual language · inline presentation inside the component.

Use: **SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION**
Never: `# SHARED MECHANICS` / `# SHARED FINAL PAGE DESIGN`

Full protocol: skill `shared-component-governance`.

### 4.2 You own, locally

local composition · local information hierarchy · final density · local grouping · local emphasis · inline presentation inside shared components.

### 4.3 Regions

Compose deliberately for: top/toolbar · left/structure pane · center/work pane · right/context pane · bottom · transient.

- The **center is the surface's actual work area**. It must never be: generic education content · generic dashboard cards · generic documentation · copied Library structure · copied Learn structure · a component showcase.
- Left and right panes carry meaningful contextual information appropriate to **that** surface.

---

## 5. MANDATORY VISUAL LIFECYCLE

Every meaningful modification follows this loop, in order:

> REFERENCE → UNDERSTAND → PLAN → BUILD / MODIFY → FUNCTIONAL CHECK → STRUCTURAL CHECK → MATCHED-VIEWPORT RENDER → SCREENSHOT → WHOLE-SCREEN COMPARISON → REGION COMPARISON → PANE COMPARISON → COMPONENT COMPARISON → MICRO-DETAIL INSPECTION → CONTENT / DENSITY COMPARISON → RESPONSIVE COMPARISON → COLLAPSED-STATE COMPARISON *(where applicable)* → RTL/LTR/BIDI COMPARISON *(where applicable)* → ARCHITECTURE / SHARED-COMPONENT REVIEW → DEFECT IDENTIFICATION → ROOT-CAUSE ANALYSIS → TARGETED FIX → RE-CAPTURE → RE-COMPARE → REGRESSION CHECK → ACCEPTANCE → EVIDENCE + LINEAGE → CLOSE

**A surface is NOT complete merely because:** tests pass · the route opens · the DOM exists · a screenshot exists · one screenshot looks reasonable · you wrote "PASS".

**FUNCTIONAL PASS != VISUAL PASS. TECHNICAL PASS != PRODUCT ACCEPTANCE.**

### 5.1 Comparison depth (use the appropriate depth)

- **L1 — WHOLE SURFACE:** overall composition, visual hierarchy, major regions, balance, density, spacing, identity.
- **L2 — REGION / PANE:** left/structure, center/work, right/context, top/bottom, toolbar regions, important collapsible zones.
- **L3 — COMPONENT:** cards, toolbars, tabs, trees, lists, tables, inspectors, dialogs, controls, state blocks.
- **L4 — MICRO DETAIL:** alignment, spacing, typography, icon positioning, dividers, labels, emphasis, affordances, truncation, wrapping, visual rhythm.

Methods: side-by-side · aligned · region crops · pane crops · component crops · micro crops · overlays/difference where useful.
**Do not rely on arithmetic density ratios alone.**

Report which levels you completed (`VISUAL_COMPARISON_LEVELS_COMPLETED`).

---

## 6. CONTENT / DENSITY

- Do **not** invent fake product content to fill space.
- Do **not** leave meaningful known structures empty when requirements define content, references show meaningful content, the product model requires meaningful state, or realistic fixture/test data can represent the state.
- Use realistic structured fixture/state data.

Banned: lorem ipsum · meaningless filler · repeated fake cards · random placeholder text · unexplained empty zones · dead visual regions.

Judge density against reference intent, task complexity, information hierarchy, real content requirements, usability. **More density is not automatically better; less is not automatically better. The goal is intentional density.**

---

## 7. LANGUAGE REQUIREMENTS — FINAL, NOT RE-OPENABLE

- **Arabic and English are BOTH first-class product languages.**
- The active language is **user-configurable through Settings**.
- **There is NO permanent Arabic-first or English-first product authority.**
- A reference/screenshot being Arabic MUST NOT make Arabic the product default. A reference being English MUST NOT make English the product default. References establish visual/layout/interaction intent, **not** permanent product-language preference.

All applicable surfaces must support: **Arabic · English · RTL · LTR · BIDI-safe behavior · appropriate localized hierarchy and spacing.**

Practical requirements:
- Do not bake direction into structure. Direction follows the active preference.
- Mirror directional affordances with direction; do not mirror logos, media, or inherently directional technical content.
- Isolate technical tokens (`<bdi>`), guard mixed-direction runs, keep IDs/numbers readable both ways.
- Do not use all-caps as a hierarchy device in Arabic.
- Test and report **both** directions (`RTL_LTR_STATUS`).

---

## 8. REQUIRED EVIDENCE AND LINEAGE

Evidence is bound to: exact candidate · commit/tree · environment · test · viewport · timestamp · **image identity** (path + sha256 + dimensions, + byte size when useful).

- Verify the bytes you analyse are the bytes you claim. Never let a stale or mis-attributed image pass as proof.
- A moving-worktree capture is NOT canonical evidence without proper lineage labelling.
- Superseded captures are retained and labelled, not deleted and not reused as current proof.

Capture/render method of record: `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`.
Evidence contract: `controller/08_evidence/evidence_contract.md`.
Capture tooling: `tools/w0*-visual-capture.mjs`, `tools/d07-visual-capture.mjs` (element crops), `tools/w04-reaudit-measure.py` (region density + OCR), `tools/shared-component-visual-proof*.mjs` (before/after pixel delta).

---

## 9. DEFECT GOVERNANCE

**Severity:** `V0` cosmetic · `V1` minor inconsistency · `V2` meaningful mismatch · `V3` major mismatch · `V4` material surface failure.

**Root cause:** `SURFACE_COMPOSITION` · `SHARED_COMPONENT` · `CONTENT_MODEL` · `FIXTURE_DATA` · `RESPONSIVE_RULE` · `ARCHITECTURE` · `OWNER_CONSTRAINT` · `STALE_DECISION` · `IMPLEMENTATION` · `EVIDENCE/ORACLE` · `UNKNOWN`.

Every repair loop records:
> DEFECT → SEVERITY → ROOT CAUSE HYPOTHESIS → CHANGE → EVIDENCE → RE-COMPARISON → ACCEPT / REOPEN

**No blind repair loops. No endless repair cycles.** Bound your iterations; escalate rather than thrash.

---

## 10. RESPONSIVE REQUIREMENTS

Compose for each breakpoint deliberately — wide / standard / narrow / compact — rather than merely squeezing. Panes collapse deliberately; content reflows rather than truncating unreadably; nothing overlaps; touch targets stay usable. Report `RESPONSIVE_STATUS` and perform COLLAPSED-STATE COMPARISON where the surface has collapsible zones.

---

## 11. ACCEPTANCE CONDITIONS

Acceptance requires **ALL** relevant dimensions:

FUNCTION · STRUCTURE · VISUAL FIDELITY · DENSITY · CONTENT COMPLETENESS · RESPONSIVE BEHAVIOR · RTL/LTR/BIDI · REFERENCE CONSISTENCY · ARCHITECTURAL CONSISTENCY · SHARED-COMPONENT APPROPRIATENESS · EVIDENCE LINEAGE.

A surface cannot close because: tests are green · a screenshot exists · you say complete · the DOM is correct · the route works.

**You cannot accept your own work.** Your status stays `NOT_OWNER_ACCEPTED`. Sole Controller review is required. Controller acceptance is the final acceptance authority unless a genuine Owner decision is required.

---

## 12. MANDATORY WRITER OUTPUT (machine-readable)

Vague verdicts are rejected. "Looks good." / "Done." / "Passed." are not valid output. Return every field:

```
SURFACE
OWNER
REFERENCE
REFERENCE_CLASSIFICATION
CURRENT_CANDIDATE
FILES_CHANGED
FUNCTIONAL_STATUS
STRUCTURAL_STATUS
VISUAL_STATUS
VISUAL_COMPARISON_LEVELS_COMPLETED
RESPONSIVE_STATUS
RTL_LTR_STATUS
DEFECTS_FOUND
DEFECT_SEVERITY
ROOT_CAUSE
FIXES_APPLIED
RECAPTURE_STATUS
RECOMPARISON_STATUS
REGRESSION_STATUS
EVIDENCE
LINEAGE
ACCEPTANCE_STATUS
BLOCKERS
```

Write it to `writer-output/<UNIT>/VISUAL_EXECUTION_REPORT.json` and summarize in `writer-output/<UNIT>/HANDOFF.md`.

---

## 13. ESCALATION RULES

**Controller decides** (do not ask the Owner) when the question can be resolved from current product truth + current code + valid references + requirements + evidence + architecture + UX/UI principles + engineering judgment + verified historical knowledge. This includes all implementation details and any UI/UX detail with a clearly superior professional solution.

**Owner escalation is reserved ONLY** for genuine unresolved: product intent · policy · authority · irreversible product choice · security/privacy boundary · meaningful unresolved contradiction · human visual acceptance that cannot be safely adjudicated automatically.

If a suitable implementation does not exist: **research → reason → design → implement → validate**. Do not stop merely because no exact historical solution exists.

**Never escalate because "I don't know which option I personally prefer."**

---

## 14. HISTORICAL MATERIAL

Historical material is **evidence, not automatic authority**. Before using a historical decision: identify source · date · scope · whether it remains current · whether it was superseded · whether current product truth contradicts it.

Preserve useful historical knowledge (rationale, provenance, rollback understanding, architectural learning, precedent). Do not clone historical control systems wholesale into the current operating system. Do not let historical decisions force obsolete or poor design.

---

## 15. REFERENCE-BEFORE-CODE

No implementation from memory. Before changing a surface, identify: what the reference is · why it is authoritative · surface identity · major regions · hierarchy · key interactions · intended density · responsive behavior · important visual relationships · what is shared · what is local · what must NOT be copied from another surface.

---

## 16. QUALITY TARGET

Not "technically valid UI." A serious, polished, professional production interface in which each surface has a distinct identity, shared mechanics stay coherent, local composition stays intentional, information hierarchy is obvious, the center feels like actual work, panes are meaningful, the design is not gloomy or lifeless, density is intentional, content feels real, visual rhythm is strong, transitions between surfaces feel like one product **but the surfaces do not look cloned**, responsive behavior is deliberate, Arabic and English both work properly, and implementation remains architecturally sound.

Craft standard: skill `professional-ui-ux-composition`.

---

## 17. BUDGET DISCIPLINE & COMPLETION GUARANTEE

Surface files in this codebase are large (`surfaces/today/presentation.ts` ≈ 39 KB, `surfaces/m0-controller-composition.ts` ≈ 75 KB). A Writer that attempts to **wholesale rewrite** a large file will exhaust its output budget and die mid-build with **no report**. This has already happened. Do not repeat it.

### 17.1 Prefer surgical edits

- Use targeted edits (find-and-replace of a specific region) over full-file rewrites.
- Never re-emit a large file in full when a bounded change suffices.
- Compose in **vertical slices**: one region/pane at a time, verified, then the next.
- If a file genuinely must be restructured, split the work into multiple bounded edits rather than one giant write.

### 17.2 Completion guarantee — the report is NOT optional

Deliverable priority when scope or budget is tight, in this order:

1. **The report files** (`VISUAL_EXECUTION_REPORT.json` + `HANDOFF.md`) — always.
2. The surface source change.
3. Render + capture + comparison evidence.

**Write progress incrementally.** Create `writer-output/<UNIT>/VISUAL_EXECUTION_REPORT.json` early and update it as you complete each stage, rather than leaving it to the end. A session that dies with partial work must still leave a truthful report describing what was and was not completed.

Never end a session mid-build without having written the report. A partial-but-reported unit is recoverable; an unreported one is not.

### 17.3 If you cannot finish

Report `BLOCKERS` honestly and set `ACCEPTANCE_STATUS: NOT_OWNER_ACCEPTED`. Preserve valid work already done — do not revert it. The Controller continues the unit rather than restarting it.

---

## 18. SKILLS TO LOAD

Load these before working (they are project skills, discoverable by id):

1. `visual-surface-composition`
2. `visual-fidelity-review`
3. `shared-component-governance`
4. `professional-ui-ux-composition`
