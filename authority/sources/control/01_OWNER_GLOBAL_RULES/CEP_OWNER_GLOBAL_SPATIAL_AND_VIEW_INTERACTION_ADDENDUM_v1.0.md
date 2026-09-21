# CEP OWNER GLOBAL SPATIAL + VIEW INTERACTION ADDENDUM v1.0

**Authority:** OWNER DIRECT DECISION / CONTROLLER NORMALIZATION  
**Date:** 2026-09-09  
**Scope:** ALL CEP WORKSPACES / ALL CURRENT AND FUTURE SURFACES WHERE SEMANTICALLY APPLICABLE  
**Classification:** GLOBAL OWNER RULE / NOT PRODUCTION PROOF / NOT SELF-ACCEPTANCE

## 1. GLOBAL SURFACE COMPLETENESS LAW
A generic interaction/presentation mechanic admitted for CEP must be evaluated across the complete surface universe. Omission is not `NOT_APPLICABLE`. Any exception requires an explicit `NOT_APPLICABLE_JUSTIFIED` row with a domain reason.

## 2. WORKSPACE/VIEW MODE vs CONTEXT/LENS LAW
Controls must not visually promise one transition while performing another.

### Workspace / View mode
If a control is presented as a workspace/view/top-mode tab (for example Operations, Timeline, Topology, Model, State, Behavior, Variation or equivalent), activating it MUST visibly transition the **CENTER workspace** to the corresponding state. A selected tab with materially stale CENTER content is a defect.

### Context / Inspector lens
If a control is an inspector/context lens (properties, relationships, state, provenance, capability, etc.), activating it MUST visibly transition the **RIGHT Context/Inspector** and update selection/focus identity. It must be labeled/presented as a lens, not masquerade as a workspace tab.

If the same semantic concept is reachable from multiple surfaces, all routes converge on one state/command owner; presentation may differ but side-effect ownership must not duplicate.

## 3. GLOBAL SPATIAL PAN PROFILE — OWNER ADDITION
Existing defaults remain:
- blank `LEFT drag` in Select mode → marquee selection;
- object `LEFT drag` → admitted object move;
- `Space + LEFT drag` → temporary pan;
- `Middle Mouse drag` → pan;
- plain `RIGHT click` / keyboard `Shift+F10` → Context Actions.

New third pan route:
- `Ctrl + RIGHT Mouse Drag` → pan **after a movement threshold**.

Collision law:
1. `Ctrl + RMB pointerdown` starts only a pending gesture.
2. If movement exceeds the configured drag threshold, the gesture becomes PAN and the corresponding contextmenu event for that gesture is suppressed.
3. Plain RMB click/no-drag remains Context Actions.
4. Do not create a second spatial input engine. Route the new gesture through the same `SpatialInteractionCore` / pointer-profile owner.
5. Native scrolling/text/settings/context/operational regions keep their own pointer semantics and must not be hijacked.
6. Preserve keyboard Context parity and existing MMB/Space+LMB routes.

Current collision audit for this Owner addition: no existing `Ctrl+RMB drag` binding was identified in Big Boss v1.2, Controller Recovery Handoff, Accepted Library donor, or W03 v3.3.1 source set. Production conversion must repeat collision analysis against the then-current code truth.

## 4. CAPABILITY-DRIVEN DOUBLE CLICK
Double-click is not globally synonymous with Terminal. For an eligible device/session/run object with `OPEN_TERMINAL` capability, double-click MAY be an entry route and must converge on the same semantic command as Context/Palette/Inspector/List routes. Non-capable objects preserve their domain-specific double-click meaning. Results live execution remains forbidden; recorded terminal is historical read-only.

## 5. INTERACTION COMPLETENESS PROOF
For an interactive requirement, selector/function/handler presence is insufficient. Closure requires:
- before-state identity;
- actual pointer/keyboard action;
- after-state owner identity;
- visible target-region transition where user-facing;
- negative stale-state assertion;
- command-owner/side-effect assertion when mutation is involved;
- fresh candidate-bound visual evidence after material frontend change;
- exact-route evidence classified separately when available.

**Control token:** `GLOBAL_SPATIAL_AND_VIEW_INTERACTION_LAW_ACTIVE / CTRL_RMB_DRAG_PAN_ADMITTED / ALL_SURFACES_COVERAGE_REQUIRED`
