---
name: Professional UI/UX Composition
description: The craft standard for CEP interface quality - visual hierarchy, content hierarchy, balance, spacing rhythm, typography, grouping, affordance, progressive disclosure, contrast, emphasis, responsive composition, polish, and perceived quality. Use whenever designing, building, reviewing, or refining any interface, component, or presentation so the output reads as a serious production application.
---

# Professional UI/UX Composition

## Purpose

Define what "good" looks like, concretely, so quality is **decidable** rather than a matter of taste. This skill is the craft bar that `visual-surface-composition` builds to and `visual-fidelity-review` measures against.

**The target is NOT "technically valid UI."** The target is a serious, polished, professional production interface.

## When to invoke

- Designing or building any interface, pane, card, list, toolbar, or control.
- Reviewing output for perceived quality and polish.
- Resolving density, spacing, hierarchy, or typography questions.
- Whenever a surface risks looking generic, template-like, or mechanically assembled.

---

## THE QUALITY BAR

The product must feel: **deliberate · elegant · professional · coherent · information-rich without clutter · purpose-built per surface · visually strong · refined · modern · credible as a serious production application.**

Across the whole product:
- each surface has a **distinct identity**
- shared mechanics remain **coherent**
- local composition remains **intentional**
- information hierarchy is **obvious**
- the center feels like **actual work**
- panes are **meaningful**
- the design is **not gloomy or lifeless**
- **density is intentional**
- content **feels real**
- **visual rhythm is strong**
- transitions between surfaces feel like **one product** — but the surfaces do **NOT** look cloned
- responsive behavior is deliberate
- Arabic and English both work properly
- implementation remains architecturally sound

---

## MANDATORY RULES

### R1. Hierarchy first

Establish a single dominant focal point per region. Make the hierarchy legible before adding detail.

Concretely: define a **type scale** (e.g. 4–6 steps) and a **weight scale** (3–4 weights), then use them consistently. Title > section > body > meta > micro. Never introduce an unstyled one-off size.

If two elements compete at the same level, one is wrong.

### R2. Content hierarchy mirrors task hierarchy

The most important information for the user's task is largest, earliest (in reading order), and least decorated. Supporting metadata recedes. Controls appear where the task happens.

Ask of every element: *what decision does this help the user make?* If none, remove or demote it.

### R3. Balance and layout composition

- Distribute visual weight deliberately; do not let a pane drift to one corner.
- Prefer asymmetric-but-balanced composition over dead-center symmetry for work surfaces.
- Align to a consistent grid. Every edge should be explainable.
- Whitespace is structural: it separates groups, not just fills gaps.

### R4. Spacing rhythm

Use a **spacing scale** (e.g. 4/8/12/16/24/32/48) and nothing else. Related items sit closer than unrelated items (Gestalt proximity). Padding inside a container is smaller than the gap between containers.

Rhythm breaks are visible: if one card has 16px padding and its neighbor 20px, the surface feels sloppy even when the user cannot name why.

### R5. Typography as a system

- Limit families (1–2). Limit sizes to the scale.
- Set line-height for reading (body ~1.4–1.6; headings tighter).
- Control measure: body text roughly 45–75 characters per line where it is read, not displayed.
- Use weight and color before size to create emphasis.
- Never rely on all-caps for hierarchy in Arabic.
- **BIDI typography**: isolate technical tokens (`<bdi>`), never mix direction runs unguarded, keep numbers/IDs readable in both directions.

### R6. Grouping and containment

Group by meaning, then by proximity, then by a container. Do **not** box everything.

**Over-boxing is a primary failure mode.** If every group gets a rounded border and a shadow, nothing stands out and the surface reads as a template. Prefer: spacing, subtle dividers, background tiers (surface/elevated/sunken), and typographic sectioning before drawing another card.

### R7. Affordance and interaction clarity

- Interactive elements must look interactive; static ones must not.
- Make state visible: hover, focus, active, disabled, loading, error, empty.
- Focus must always be visible and follow reading order. Keyboard behavior is not optional.
- Destructive actions are visually distinct and confirmed.
- The primary action in a region is visually dominant; secondary actions recede; tertiary go into overflow.
- Never make users guess what is clickable.

### R8. Progressive disclosure

Show what the task needs now; reveal depth on demand. Collapse, tabs, disclosure, and inspectors exist so the first screen stays composed.

Anti-pattern: dumping all available information at equal weight. Also anti-pattern: hiding everything behind clicks so the surface looks empty.

### R9. Contrast and emphasis

- Meet WCAG AA contrast for text and controls (4.5:1 body, 3:1 large/UI). Do not use low-contrast gray-on-gray.
- Emphasis must be earned. If everything is emphasized, nothing is.
- Color carries meaning consistently (status, severity, category) — define the mapping and keep it across surfaces.

### R10. Not gloomy, not lifeless

Dark does not mean gloomy. Avoid: near-black backgrounds with muted gray text, zero chroma, no accent energy, dead empty regions.

A serious application can be calm and still have visual strength: a considered accent palette, clear tonal separation, purposeful elevation, and real content doing the work.

### R11. Responsive composition

Layout is composed for each breakpoint, not merely squeezed. Define intended behavior for wide / standard / narrow / compact. Panes collapse deliberately; content reflows rather than truncates unreadably; nothing overlaps; touch targets stay usable.

### R12. Bilingual and bidirectional composition

Arabic and English are both first-class. Compose so hierarchy and spacing hold in **both** directions. Mirror directional icons/indicators with direction; do **not** mirror logos, media, or inherently-directional technical content. Never let a screenshot's language become the product default.

### R13. Polish is in the last 10%

Alignment to the pixel. Consistent corner radii. Consistent border colors. Consistent icon size and optical alignment. No orphaned single-line text blocks. No clipped labels. No jumpy layout on load. Real, meaningful empty states — not blank space.

### R14. Consistency without monotony

Same concept → same presentation everywhere. Different surfaces may and should differ where their purpose differs. Consistency is in the **system** (tokens, components, interaction language), not in identical page layouts.

---

## ANTI-PATTERNS (the output must NOT look)

- **Generic** — could be any product.
- **Template-like** — clearly assembled from a starter kit.
- **Mechanically assembled** — same card repeated N times with no hierarchy.
- **Gloomy** — dark, muted, low-contrast, lifeless.
- **Repetitive** — one pattern doing all the work.
- **Over-boxed** — every group in a rounded card.
- **Under-composed** — unaligned, unrhythmic, no focal point.
- **Over-engineered visually** — ornament, shadows, gradients, and chrome without function.
- **Cloned from another surface** — see `visual-surface-composition` R4.
- **Density theatre** — filler content, or empty zones pretending to be minimal.

---

## WORKFLOW

1. **Define the content model** and the task the surface serves.
2. **Set the system**: type scale, spacing scale, color/contrast mapping, elevation tiers, radius set.
3. **Compose regions** with a focal point and deliberate visual weight.
4. **Apply hierarchy** (R1–R2), then grouping (R6), then rhythm (R4).
5. **Add affordance and states** (R7), progressive disclosure (R8).
6. **Check contrast and emphasis** (R9), tone and life (R10).
7. **Verify responsive and BIDI** (R11–R12).
8. **Polish** (R13) and check consistency (R14).
9. **Review against the anti-pattern list** — if any matches, revise.

---

## ESCALATION CONDITIONS

Escalate when: two compositions are genuinely equivalent and the choice is a lasting product-identity decision; a contrast/accessibility requirement conflicts with a mandated visual reference; or the Owner's stated aesthetic direction conflicts with an accessibility rule (accessibility wins; report the conflict).

---

## RELATIONSHIP TO OTHER SKILLS

- **`visual-surface-composition`** — applies this craft within the reference-driven surface build.
- **`visual-fidelity-review`** — measures against this bar; its L4 micro-detail pass is largely this skill.
- **`shared-component-governance`** — ensures shared primitives meet this bar so every surface can.
