---
name: Visual Surface Composition
description: Compose a CEP product surface from its visual reference into a real, purpose-built UI. Governs reference authority, surface-specific composition, anti-cloning, pane organization, density, and AR/EN+RTL/LTR composition. Use whenever building, restructuring, or materially changing any product surface, page, workspace, or pane layout.
---

# Visual Surface Composition

## Purpose

Turn a **visual reference** into a **built surface** that is deliberate, purpose-built, information-rich without clutter, and visibly its own thing. This skill governs the *construction* act: how a surface is understood, composed, structured, and given identity.

It is the build-side counterpart to `visual-fidelity-review` (the compare-side skill).

## When to invoke

- Building any surface for the first time.
- Materially restructuring an existing surface (regions, panes, hierarchy, density).
- Adding a new workspace, page, or major pane to a surface.
- Any time you are tempted to copy a layout from another surface.

Do **not** invoke for pure bug fixes, pure logic changes, or typography-only polish (use `professional-ui-ux-composition` for polish-level craft).

---

## MANDATORY RULES

### R1. A visual reference is CONSTRUCTION AUTHORITY

A reference is authoritative for: visual intent, composition, hierarchy, spatial relationships, information architecture, density/rhythm, interaction language, visual emphasis, pane organization, component relationships, and responsive intent.

It is **not** "presentation only". Never write, inherit, or accept wording that demotes a reference to presentation-only.

A reference does **not** force preservation of: obsolete implementation, obsolete technology, invalid historical decisions, broken accessibility, broken responsiveness, fake content, architecture mistakes, or accidental visual defects.

**REFERENCE != BLIND PIXEL COPY.**

### R2. Classify the reference before you build

Before touching code, record:

- What the reference is (exact path).
- Its classification: `VISUAL_REFERENCE_AUTHORITY` | `CANDIDATE` | `SUPERSEDED` | `STALE` | `LOW_QUALITY`.
- Why it is authoritative (lineage: source, date, scope).
- Whether current product truth contradicts it.

Do not silently promote a `CANDIDATE` to canonical. If authority is unresolved, build to the candidate's *intent* while flagging the authority gap, and record it.

### R3. Surface identity: answer "What is this workspace for?"

Every surface must answer that question in its composition — visibly. Then compose around that purpose: its users, its tasks, its content model, its information hierarchy, its operational context, its local visual identity.

The center workspace is the surface's **actual work area**. It must never become:
- generic education content
- generic dashboard cards
- generic documentation
- a copied Library structure
- a copied Learn structure
- a component showcase

Left and right panes must carry meaningful contextual information appropriate to **that** surface.

### R4. DONOR != DESTINATION TEMPLATE — hard anti-cloning rule

A surface may borrow **mechanics**: interaction language, structural ideas, proven primitives, tree behavior, panel behavior.

A surface must **never** borrow composition. Never produce "Library, but renamed for Scenarios", "Learn, but renamed for Labs", or any conceptual clone.

This includes the historical failure mode: Library/Learn patterns conceptually copied into Scenarios, Labs, or other operational surfaces. That is REJECTED. Do not repeat it.

Verified donor relationships that are permitted at the **mechanics** level only:
- LIBRARY is a structural donor for LEARN and for VISUALIZE TREE-VIEW.
- `VISUALIZE TREE-VIEW` is the correct terminology. Never invent a false concept such as "Visualize Review".

### R5. Shared components do not compose your surface

Shared components govern mechanics, not final presentation. See `shared-component-governance`. You own: local composition, local information hierarchy, final density, local grouping, local emphasis, and inline presentation inside shared components.

Use: **SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION**.

Never: `# SHARED MECHANICS` / `# SHARED FINAL PAGE DESIGN`.

### R6. Intentional density

- Do not invent fake product content to fill space.
- Do not leave meaningful known structures empty when requirements, references, the product model, or realistic fixtures define content.
- Use realistic structured fixture/state data.
- Banned: lorem ipsum, meaningless filler, repeated fake cards, random placeholder text, unexplained empty zones, dead visual regions.

Judge density against reference intent, task complexity, information hierarchy, real content requirements, and usability. More density is not automatically better; less is not automatically better. The goal is **intentional density**.

### R7. Language policy is FINAL and non-negotiable

Arabic and English are **both first-class** product languages. The active language is user-configurable through Settings. There is **no** permanent Arabic-first or English-first product authority.

A reference screenshot being Arabic does **not** make Arabic the product default. A reference being English does **not** make English the product default. References establish visual/layout/interaction intent, **not** permanent product-language preference.

Every surface must support: Arabic, English, RTL, LTR, BIDI-safe behavior, and appropriate localized hierarchy and spacing. Compose so the layout survives both directions. Do not bake a direction into structure.

### R8. Reference-before-code

No implementation from memory. Inspect the reference first and identify: surface identity, major regions, hierarchy, key interactions, intended density, responsive behavior, important visual relationships, what is shared, what is local, and what must NOT be copied from another surface.

---

## WORKFLOW

1. **REFERENCE** — locate, classify, record lineage (R2).
2. **UNDERSTAND** — surface purpose, users, tasks, content model, operational context (R3).
3. **MAP REGIONS** — top/toolbar, left/structure, center/work, right/context, bottom, transient. Name each region's job for *this* surface.
4. **PLAN** — hierarchy, grouping, density targets, what is shared vs local, what must not be cloned (R4).
5. **BUILD** — compose locally; wire shared mechanics without inheriting another surface's composition.
6. **FUNCTIONAL + STRUCTURAL CHECK** — it works and the structure matches intent.
7. **RENDER + COMPARE** — matched-viewport capture, then compare at L1–L4 per `visual-fidelity-review`.
8. **FIX** — targeted, root-cause-driven, then re-capture and re-compare.
9. **ARCHITECTURE / SHARED-COMPONENT REVIEW** — is a shared component the real root cause?
10. **ACCEPT + EVIDENCE + LINEAGE + CLOSE** — only when all acceptance dimensions pass.

Full lifecycle depth is specified in `visual-fidelity-review`. Do not shortcut it.

---

## ANTI-PATTERNS (reject these)

- **Conceptual cloning** — another surface's composition with the labels swapped.
- **Generic dashboard center** — interchangeable rounded cards that could belong to any product.
- **Reference worship** — copying a known-bad or stale visual decision because a screenshot shows it.
- **Reference demotion** — calling a reference "presentation only" to justify building from memory.
- **Direction baking** — layout that only works in one of RTL/LTR.
- **Language default smuggling** — inferring a permanent product language from a screenshot.
- **Density theater** — filler content to look busy, or stripping content to look clean.
- **Empty theatre** — leaving required structures empty and calling it "minimal".
- **Component showcase** — the center becomes a demo of parts instead of a work area.
- **Shared-composition capture** — letting a shared component dictate the page design.

---

## ESCALATION CONDITIONS

Escalate to the Controller (not the Owner) when:
- The reference is contradictory, low quality, or superseded and intent cannot be reconstructed.
- Two valid compositions are genuinely equivalent and the choice is irreversible.

Escalate to the **Owner** only for genuine product intent/policy ambiguity or a decision that is an irreversible product choice. See the Owner escalation gate: if code + evidence + reference + requirements + professional judgment can resolve it, the Controller decides.

---

## RELATIONSHIP TO OTHER SKILLS

- **`visual-fidelity-review`** — the mandatory comparison and evidence half of the same lifecycle. Composition is not accepted without it.
- **`shared-component-governance`** — tells you what shared components may and may not govern in your composition.
- **`professional-ui-ux-composition`** — the craft standard applied *inside* this workflow (hierarchy, rhythm, typography, polish).
