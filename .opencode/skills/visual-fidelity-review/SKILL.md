---
name: Visual Fidelity Review
description: The mandatory CEP visual comparison, evidence, and defect-governance methodology. Governs L1-L4 comparison depth, reference/result/evidence taxonomy, evidence lineage and image identity, vision verification, defect severity and root cause, and visual acceptance. Use for every surface review, screenshot, comparison, re-audit, or visual acceptance decision.
---

# Visual Fidelity Review

## Purpose

Make visual judgement **reproducible and honest**. This skill governs the compare-side of the lifecycle: how a rendered surface is captured, compared to its reference at sufficient depth, how evidence is bound to a candidate, how defects are classified and rooted, and when a surface may be accepted.

FUNCTIONAL PASS != VISUAL PASS. TECHNICAL PASS != PRODUCT ACCEPTANCE.

## When to invoke

- Reviewing any surface after build or modification.
- Capturing or interpreting screenshots.
- Re-auditing a surface, candidate, or regression.
- Adjudicating whether work is acceptable.
- Whenever a claim like "looks good", "PASS", or "done" is about to be made. Replace it with this methodology.

---

## MANDATORY RULES

### R1. Reference / Result / Evidence taxonomy — never conflate

| Category | Meaning |
|---|---|
| **A. VISUAL REFERENCE AUTHORITY** | The intended construction baseline. |
| **B. CURRENT RESULT** | What the code currently renders. |
| **C. EVIDENCE SCREENSHOT** | A proof capture tied to a specific candidate/commit/tree/environment/test/viewport/time. |

Do **not** place visual references into evidence merely because they are images.

### R2. Evidence must be bound

Every evidence artifact carries lineage: exact candidate, commit/tree, environment, test, viewport, timestamp, and **image identity**. Image identity = path + sha256 + dimensions (+ byte size when useful).

For any visual claim, verify that the bytes being analysed are the bytes referenced. Prevent stale or mis-attributed analysis. A moving-worktree capture is **not** canonical evidence without proper lineage labelling.

Banned: screenshots with no candidate binding; a screenshot that "looks reasonable" standing in for review; reusing an old capture as proof of a new state.

### R3. Verify vision capability — never assume, never fake

The active Controller must prove image capability with an actual local-image vision test before making visual claims. Confirm the model supports image input, OpenCode can deliver image input, and the provider configuration supports it.

If vision works: use it throughout. If it fails: identify the exact failing layer, fix configuration if possible, and **do not fabricate visual analysis**.

### R4. Comparison depth L1–L4 (use the appropriate depth)

**L1 — WHOLE SURFACE**: overall composition, visual hierarchy, major regions, balance, density, spacing, identity.

**L2 — REGION / PANE**: left/structure pane, center/work pane, right/context pane, top/bottom regions, toolbar regions, important collapsible zones.

**L3 — COMPONENT**: cards, toolbars, tabs, trees, lists, tables, inspectors, dialogs, controls, state blocks.

**L4 — MICRO DETAIL**: alignment, spacing, typography, icon positioning, dividers, labels, emphasis, affordances, truncation, wrapping, visual rhythm.

Methods: side-by-side comparison, aligned comparison, region crops, pane crops, component crops, micro crops, overlays/difference methods where useful.

**Do not rely on arithmetic density ratios alone.**

### R5. Comparison is mandatory and layered

Matched-viewport render → screenshot → whole-screen comparison → region comparison → pane comparison → component comparison → micro-detail inspection → content/density comparison → responsive comparison → collapsed-state comparison (where applicable) → RTL/LTR/BIDI comparison (where applicable).

A surface is **not** complete merely because: tests pass, the route opens, the DOM exists, a screenshot exists, one screenshot looks reasonable, or a Writer says "PASS".

### R6. Defect governance — no blind repair loops

Every visual defect is classified:

**Severity**
- `V0` cosmetic
- `V1` minor inconsistency
- `V2` meaningful mismatch
- `V3` major mismatch
- `V4` material surface failure

**Root cause**
`SURFACE_COMPOSITION` | `SHARED_COMPONENT` | `CONTENT_MODEL` | `FIXTURE_DATA` | `RESPONSIVE_RULE` | `ARCHITECTURE` | `OWNER_CONSTRAINT` | `STALE_DECISION` | `IMPLEMENTATION` | `EVIDENCE/ORACLE` | `UNKNOWN`

Every repair loop records: **DEFECT → SEVERITY → ROOT CAUSE HYPOTHESIS → CHANGE → EVIDENCE → RE-COMPARISON → ACCEPT / REOPEN**.

No blind repair loops. No endless repair cycles. Cap iterations and escalate rather than thrash.

### R7. Acceptance requires ALL relevant dimensions

FUNCTION · STRUCTURE · VISUAL FIDELITY · DENSITY · CONTENT COMPLETENESS · RESPONSIVE BEHAVIOR · RTL/LTR/BIDI · REFERENCE CONSISTENCY · ARCHITECTURAL CONSISTENCY · SHARED-COMPONENT APPROPRIATENESS · EVIDENCE LINEAGE.

A surface cannot close because tests are green, a screenshot exists, a Writer says complete, the DOM is correct, or the route works. The Controller is the final acceptance authority unless a genuine Owner decision is required. Never accept "Writer PASS" without independent re-verification.

### R8. Machine-readable Writer output is mandatory

Vague verdicts are rejected. Every surface result reports: SURFACE, OWNER, REFERENCE, REFERENCE_CLASSIFICATION, CURRENT_CANDIDATE, FILES_CHANGED, FUNCTIONAL_STATUS, STRUCTURAL_STATUS, VISUAL_STATUS, VISUAL_COMPARISON_LEVELS_COMPLETED, RESPONSIVE_STATUS, RTL_LTR_STATUS, DEFECTS_FOUND, DEFECT_SEVERITY, ROOT_CAUSE, FIXES_APPLIED, RECAPTURE_STATUS, RECOMPARISON_STATUS, REGRESSION_STATUS, EVIDENCE, LINEAGE, ACCEPTANCE_STATUS, BLOCKERS.

---

## WORKFLOW

1. **Bind** the reference (classification + lineage) and the candidate (commit/tree/env).
2. **Render** at matched viewport; capture with hash + dims + path + timestamp.
3. **Compare L1** whole surface. Note hierarchy, balance, density, identity deltas.
4. **Compare L2** per region/pane. Compare **L3** per component. Inspect **L4** micro detail.
5. **Content/density comparison** — is the content real, complete, intentionally dense?
6. **Responsive comparison** — intended breakpoints and collapsed states.
7. **RTL/LTR/BIDI comparison** — both directions, in the product's two first-class languages.
8. **Classify defects** (severity + root cause). Root-cause before fixing.
9. **Targeted fix → re-capture → re-compare → regression check**.
10. **Acceptance** across all dimensions, or reopen with a bounded, classified defect.

---

## ANTI-PATTERNS

- **Verdict words without evidence** — "looks good", "done", "passed", "matches".
- **Single-screenshot acceptance.**
- **Density-ratio-only judgement.**
- **Stale image reuse** — old bytes presented as current proof.
- **Reference-in-evidence** — putting a reference image into the evidence set.
- **Faked visual analysis** — describing a surface without actually reading the pixels.
- **Blind repair loops** — fixing repeatedly with no root-cause hypothesis.
- **Writer self-promotion** — a Writer accepting its own work. Sole Controller review required.
- **Ignoring a whole comparison level** because the surface is "simple".

---

## ESCALATION CONDITIONS

Escalate when: vision capability is broken and cannot be fixed (evidence integrity risk); the reference authority is unresolved and blocks adjudication; a defect is `V4` and root cause is architectural; or human visual acceptance is genuinely required (prepare a clearly-labelled visual packet with full lineage).

---

## RELATIONSHIP TO OTHER SKILLS

- **`visual-surface-composition`** — builds the surface this skill judges.
- **`shared-component-governance`** — supplies the `SHARED_COMPONENT` root-cause branch and the change protocol.
- **`professional-ui-ux-composition`** — the quality bar that "VISUAL FIDELITY" is measured against.
