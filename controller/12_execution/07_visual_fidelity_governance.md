# 12_execution / 07_visual_fidelity_governance — injected quality/acceptance layer

Timestamp: 2026-09-29T06:10Z · Authority: **Owner review directive (visual fidelity / shared-component
governance / acceptance re-audit)** · Status: **INJECTED INTO LIVE EXECUTION — no reset, no Wave-0 restart**

This layer sits *on top of* the running Writer execution. Existing work is preserved. Existing
checkpoints stand as **functional** evidence and are re-opened for visual acceptance per directive §14.

## 0. The correction in one line

A surface is not acceptable because it builds, its tests pass, its route works, or it reuses shared
components. It must satisfy **all ten** of: functional correctness · architecture correctness ·
ownership/contract correctness · reference fidelity · visual quality · information/content density ·
component completeness · responsive behavior · surface-specific context · evidence-backed acceptance.

A technically valid but visually impoverished, empty, generic or weakly composed surface is **not** a
completion state.

## 1. Governing sources already in the repo (read these; do not re-derive)

| Source | Path | Role |
|---|---|---|
| **CEP-VIS-001-FINAL** visual & interaction contract (Owner-approved, CEP-DEC-027) | `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md` | the visual grammar: 5 global destinations, `ONE INFORMATION ITEM → ONE AUTHORITATIVE DISPLAY LOCATION`, `CANONICAL OWNER ≠ WORKSPACE SURFACE ≠ CONTEXT OF CREATION`, `GLOBAL DESTINATION → PRIMARY AREA → ACTIVE OBJECT/TASK → CONTEXTUAL TOOL` |
| Final visual reference register | `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` | surface → reference PNG + SHA-256 + classification |
| Reference image set (28 PNGs) | `cep-writer/references/visual/**` | the **construction baseline**, per surface |
| Writer local visual capture method | `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md` | capture + **inspection** law |
| Library golden parity | `cep-writer/references/library-golden/` | donor quality bar for the structural tree |
| Surface profiles | `cep-writer/references/surface-profiles/*.json` | per-surface object/command/invariant contract |

**Critical law from the capture method:** *"A PNG/WebM existing on disk is not visual acceptance.
Material screenshots must be **opened and inspected**."* Screenshots captured by the first Writer wave
were written to disk but **not visually inspected**. That is exactly the weak acceptance §14 condemns.

## 2. Terminology correction (directive §11) — BINDING

The reference is **VISUALIZE TREE-VIEW**, not "Visualize Review".
- Reference file: `cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/03_VISUALIZE/CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png` (register calls it "Visualize main / **Tree**").
- It is a **donor pattern** for hierarchy, structural navigation, tree organization, icon/row
  treatment, density, structural affordances and visual language — **adapted** to Visualize content,
  hierarchy, labels, states, actions, context and interaction semantics.
- Do **not** copy Library wholesale. Do **not** create or assume a "Visualize Review" surface.
- Supporting Visualize component references (representation-only): Path View, Focused Graph /
  Relationship, Canvas View under `90_SUPPORTING_COMPONENT_REFERENCES/`.

## 3. Reference classifications that constrain acceptance

| Classification | Meaning | Consequence |
|---|---|---|
| `OWNER_CONFIRMED_FINAL_REFERENCE` | Owner-promoted construction baseline | full reference fidelity required |
| `CURRENT_FINAL_REFERENCE` | current baseline | full reference fidelity required |
| `OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE` | a **state** within a surface (e.g. AAR, Compare, Preflight, Twin/Baseline) | that state must be reconstructable, not just the base screen |
| `SUPPORTING_COMPONENT_REFERENCE` | a component donor (Canvas/Path/Focused-Graph) | component-level fidelity; does not replace shell/panel architecture |
| `REVIEWED_FINAL_CANDIDATE` (RQ) | **not** Owner-final | this is open question **Q-3** — STOP/REPORT, never decided by a Writer |
| `INTENTIONALLY_NOT_GENERATED` (Processing) | `CONTRACT_DERIVABLE / NO_NEW_REFERENCE_REQUIRED` | no reference to chase; satisfy the contract instead of inventing a look |

References are a **construction baseline**, not a pixel template: high-fidelity reconstruction under
current architecture, Owner directives, surface context, shared-component contracts, responsive
constraints, accessibility and functional requirements. **No blind pixel copying.**

## 4. Defect taxonomy (directive §16)

Severity: `V0` cosmetic micro-difference · `V1` small inconsistency · `V2` meaningful
component/layout mismatch · `V3` major reference/structure/density mismatch · `V4` surface materially
fails the intended visual product state.

Root cause: `SURFACE_COMPOSITION` · `SHARED_COMPONENT` · `CONTENT_MODEL` · `FIXTURE_DATA` ·
`RESPONSIVE_RULE` · `ARCHITECTURE` · `OWNER_CONSTRAINT` · `STALE_DECISION` · `IMPLEMENTATION` ·
`EVIDENCE/ORACLE` · `UNKNOWN`.

Routing: `surface Writer` · `shared-component owner` · `Coordinator` · `Owner STOP/REPORT`.

## 5. Comparison is multi-level and iterative (directive §8–§10)

Levels: **L1 whole surface** (composition, hierarchy, density, regions, balance, IA) · **L2 pane/region**
(LEFT / CENTER / RIGHT-context / TOP / BOTTOM / splits / structural nav) · **L3 component** (cards, rows,
lists, buttons, controls, selectors, toolbars, tabs, notices, metadata blocks, structured-editor pieces,
copy/list/voice/question primitives) · **L4 micro detail** (spacing, alignment, sizing, type hierarchy,
iconography, visual weight, grouping, borders, separators, density, state styling, empty-state treatment,
responsive transitions, affordances).

Loop: R0 inspect reference → R1 implement/improve → R2 capture → R3 compare → R4 component-level
discrepancy analysis → R5 fix → R6 recapture → R7 recompare → repeat until every remaining difference
is explicitly justified (architecture, Owner decision, responsive/contextual, accessibility, functional).

For material corrections inspect **together**: reference PNG · current PNG · implementation code ·
component structure · relevant contract · applicable Owner decisions · evidence/acceptance history.
Never the screenshot alone, never the code alone.

## 6. Shared components (directive §3–§5, §19, §20)

Reuse is **reuse of the right contract**, not copy-paste of one screen. A shared component must not
dominate a surface merely because it exists, and must not be filled in with generic filler. Distinguish:
shared contract · shared mechanics · shared visual primitives · **surface-specific** composition ·
content · hierarchy · density · states.

**A shared component is itself subject to review.** If it is the root cause (poor visual outcome,
excessive emptiness, weak hierarchy, prevents reference fidelity, inadequate interaction/content model,
obsolete assumption) follow the 10-step shared-component improvement protocol: isolate → inspect
contract → inspect consumers → compare to references → separate invariant from surface-specific
behaviour → improve the primitive minimally → preserve the owner boundary → regression-test consumers →
re-run visual checks on affected surfaces. **Do not patch every consumer independently.** Never modify
a shared component for one surface's appearance if it damages other consumers.

## 7. Empty UI and fixture data (directive §6–§7, §21–§22)

An empty pane/card/section/blank state is not acceptable merely because it renders. This does **not**
license invented product facts. Where existing source material already defines what should be there,
populate it meaningfully: purpose, content structure, controls, meaningful metadata, representative
records, informative empty/loading/error states where genuinely appropriate, density, affordances,
neighbour relationships. Fixtures must represent **representative product state** — never lorem ipsum,
never random decorative data, never entities contradicting project semantics.

Blank-pane headers, empty structure regions, arbitrary placeholder controls, meaningless rows, dead
visual zones, unexplained whitespace, empty right/context areas and generic filler cards are all defects.

## 8. Valid collapsed ≠ broken empty (directive §24)

Where the architecture specifies collapsible / zero-width behaviour, preserve it and **prove the state
transition** in evidence. A collapsed pane is not "empty UI".

## 9. Responsive must not be sacrificed (directive §23)

Reference fidelity coexists with responsive transitions, pane collapse, width constraints,
keyboard/focus, RTL/BIDI and accessibility. Capture at **1440×1000 and 1024×900** minimum (Canvas
closure obligations), plus narrow/pane-collapse where the packet requires.

## 10. Acceptance gate (directive §28) — ALL applicable boxes must hold

Functional behaviour · architecture respected · ownership respected · shared components used correctly ·
not unnecessarily duplicated · not forcing inappropriate composition · meaningful content/state exists ·
no unjustified blank regions · **reference actually inspected** · current screenshot captured ·
component-level comparison performed · major discrepancies addressed · responsive still correct · valid
strategic decisions preserved · obsolete/harmful historical assumptions not blindly preserved · evidence
bound to the correct candidate · re-comparison confirms the fix · remaining differences explicitly
justified. **If any critical visual condition fails, the surface does not PASS.**

## 11. No auto-repair loop (directive §17)

Every iteration records: identified defect · severity · root-cause hypothesis · change · evidence ·
re-comparison · acceptance decision. Resolve and close. Correct invalid assumptions. **Owner-decision
defects → STOP/REPORT**, never invented.

## 12. Status vocabulary for the re-audit

`ACCEPTANCE_REQUIRES_REVIEW` · `VISUAL_PASS` · `VISUAL_FAIL` · `BLOCKED` · `NOT_APPLICABLE_WITH_PROOF`.
Functional-only acceptance must never be recorded as `VISUAL_PASS`.
