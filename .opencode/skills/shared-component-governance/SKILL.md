---
name: Shared Component Governance
description: Decide what shared components may and may not govern in CEP, and run the safe change protocol when a shared component is the root cause. Governs shared-mechanics vs surface-specific-composition boundaries, ownership, contracts, consumer regression, and the anti-cloning guard. Use before changing any shared component, and whenever a defect may live in shared rather than surface code.
---

# Shared Component Governance

## Purpose

Keep shared code **coherent** without letting it **flatten** the product. Shared components carry mechanics across surfaces; surfaces carry their own composition and presentation. This skill defines that boundary and the protocol for changing shared code safely.

## When to invoke

- Before **any** change to a shared component, shared host, shared owner, or shared contract.
- When a visual defect might be rooted in shared code rather than surface code.
- When a surface looks like another surface (possible shared-composition capture).
- When a Writer requests a shared-file change that its packet does not clearly permit.

---

## MANDATORY RULES

### R1. The boundary: SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION

Shared components **may** govern:
- interaction mechanics
- state mechanics
- accessibility mechanics
- keyboard behavior
- ownership
- data contracts
- responsive mechanics
- repeatable primitives, structural capabilities

Shared components **do NOT** govern:
- final surface composition
- local information hierarchy
- final density
- local grouping
- local content presentation
- local emphasis
- surface-specific visual language
- inline presentation inside the component

Never: `# SHARED MECHANICS` / `# SHARED FINAL PAGE DESIGN`.

### R2. Shared components are NOT final visual authority and NOT immutable

Shared components are a governed, changeable layer — not a sacred design. If a shared component is the actual root cause, improve it at the shared level. Do not patch every consumer individually when the real defect is shared.

Equally: never modify a shared component casually. See R5.

### R3. Ownership is explicit

Every shared component has a declared owner and a contract. Before working with one, identify: owner, contract, consumers, historical assumptions, current decisions, cross-surface impact. Do not infer ownership from file location alone.

A shared left/right pane owner governs **mechanics and interaction**, not final local presentation.

### R4. Root cause decides the layer

- Defect is **shared** (affects multiple consumers identically) → fix shared, regression-check every material consumer.
- Defect is **local** (one surface's composition) → fix locally. Never spread a local surface defect into a global shared change without proof.

Do **not** patch every consumer individually if the shared component is genuinely defective. Do **not** push a global change for one consumer's local taste.

### R5. Shared-component change protocol (10 steps, mandatory)

1. Identify owner.
2. Read contract.
3. Identify **all** consumers.
4. Inspect current behavior.
5. Inspect reference expectations.
6. Check historical assumptions.
7. Determine root cause.
8. Decide shared-level fix vs consumer-local fix.
9. Implement the **smallest correct architectural change**.
10. Regression-check **every material consumer**.

### R6. Writers and shared files

A Writer may touch shared files **only** when its packet explicitly permits it and the change is justified. Otherwise: stop, record a shared-component request, and route it through the Controller (serialized slot). Surface ownership is isolated where practical.

### R7. Cross-surface coherence without cloning

Improving shared code must not cause surfaces to converge into one look. Shared mechanics keep the product feeling like **one product**; surface composition keeps surfaces from looking **cloned**. Both are acceptance dimensions.

---

## WORKFLOW

1. **Trigger** — shared change requested, or defect suspected in shared code.
2. **Locate** owner + contract + registry entries (registries are the machine-readable truth).
3. **Enumerate consumers** — every surface/host that inherits or mounts it.
4. **Reproduce** the defect and record which consumers show it. Identical across consumers → shared. Isolated → local.
5. **Hypothesise root cause**; classify per `visual-fidelity-review` (`SHARED_COMPONENT` vs `SURFACE_COMPOSITION` vs `ARCHITECTURE` …).
6. **Choose layer** (R4) and design the smallest correct change (R5 step 9).
7. **Implement** in the serialized slot if the file is a known hotspot.
8. **Regression-check** all material consumers — function, structure, and visual at L1–L3.
9. **Record** change, rationale, consumers checked, evidence, and any deferred work.
10. **Accept or reopen** — Controller review is final.

---

## ANTI-PATTERNS

- **Shared-final-design** — a shared component dictating page composition for every surface.
- **Consumer patch storm** — patching N consumers for a shared defect.
- **Casual shared edits** — touching shared code without owner/contract/consumer analysis.
- **Local defect promoted to global** — one surface's preference changing the shared layer.
- **Clone by convergence** — a "helpful" shared change that makes all surfaces look the same.
- **Silent contract drift** — changing behavior without updating the contract or registry.
- **Hotspot stomping** — two writers editing the same shared file concurrently. Serialize.

---

## ESCALATION CONDITIONS

Escalate when: the change is cross-surface and irreversible; ownership is genuinely ambiguous or contested; the smallest correct change is architectural and touches many consumers; or a contract/registry conflict cannot be resolved from current truth. Route through the Controller's shared-component change slot; Owner escalation only for genuine policy or irreversible product choice.

---

## RELATIONSHIP TO OTHER SKILLS

- **`visual-surface-composition`** — owns what surfaces do with the mechanics you provide (R5 there references this boundary).
- **`visual-fidelity-review`** — provides the defect classification this skill branches on, and the regression evidence standard.
- **`professional-ui-ux-composition`** — the craft bar that shared primitives must meet so surfaces can be built well.
