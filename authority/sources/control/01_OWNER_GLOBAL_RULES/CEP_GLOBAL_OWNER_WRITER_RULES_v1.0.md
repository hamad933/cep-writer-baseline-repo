# CEP GLOBAL OWNER / WRITER RULES v1.0

AUTHORITY: OWNER / CONTROLLER CROSS-SURFACE RULES
SCOPE: ALL CEP WORKSPACES / ALL SURFACES / ALL WRITERS UNLESS A STRONGER CURRENT OWNER RULE OVERRIDES

## 1. GLOBAL GUIDANCE / SUPPORT-UI LAW
Optional guidance/support UI is never mandatory permanent chrome merely because a Blueprint contains it.

This applies across ALL CEP surfaces, not only Scenarios or W03.

Examples include:
- guides;
- stickers;
- legends;
- helper badges;
- temporary labels;
- tutorial cues;
- hint chips;
- snap/grid hints;
- helper overlays;
- non-mandatory callouts.

Where such UI exists, the Owner must be able to control it where meaningful through the shared presentation grammar, including:
- SHOW / HIDE;
- OPEN / CLOSE / REOPEN;
- MOVE / REPOSITION or DOCK / ANCHOR where spatially meaningful;
- persistence of Owner preference where appropriate;
- reset/default restoration;
- keyboard and pointer access where interaction exists;
- focus return and viewport clamping for transient/floating support UI.

Support UI should default to a professional minimal presentation rather than permanently occupying critical workspace area unless the domain requires otherwise.

Mandatory safety/error/authority/provider/platform disclosures are NOT optional guidance and must remain available.

Do not implement a Scenarios-only guidance owner when the mechanic is generic and compatible across surfaces.

## 2. SHARED-MECHANIC OWNER LAW
When Enterprise / Scenarios / Labs / Runs / Results or other CEP surfaces use the same generic mechanic, implement one shared owner/core plus domain adapters rather than independent copies.

Examples:
- pane/drawer/overlay grammar;
- Context / Context Actions transient ownership;
- focus containment/return;
- Settings/customization grammar;
- guidance/support-UI grammar;
- spatial selection/pan/move/marquee primitives;
- Operational Surface session/window grammar.

Keep domain truth surface-owned. Shared presentation mechanics must not erase domain semantics.

## 3. BROWSER / VISUAL EVIDENCE CLASSIFICATION LAW
`EXACT_ROUTE_BROWSER_PROOF` and candidate-bound visual screenshot proof are different evidence classes.

### A. EXACT_ROUTE_BROWSER_PROOF
Requires successful browser navigation to the intended application route/origin/state and, where relevant:
- expected URL/route;
- route/app bootstrap;
- route-specific data/provider behavior;
- console/page-error review;
- same-origin storage/persistence behavior;
- exact target state.

### B. CANDIDATE_BOUND_VISUAL_PROOF
May be produced from the exact candidate HTML/CSS/JS bytes through a controlled fallback renderer such as Chromium `page.set_content` when exact-route navigation is blocked by the execution environment.

It may prove visual/layout/responsive/transient presentation of those candidate bytes, but it does NOT by itself prove:
- routing;
- same-origin persistence;
- backend/provider integration;
- authenticated application state;
- route-specific data contracts.

## 4. EXACT-ROUTE FAILURE FALLBACK — DO NOT ABANDON SCREENSHOTS
If exact-route/browser navigation is blocked by environment policy (for example `ERR_BLOCKED_BY_ADMINISTRATOR`):

1. record `EXACT_ROUTE_ENVIRONMENT_BLOCKED` with the exact error;
2. do NOT claim `EXACT_ROUTE_BROWSER_PROOF`;
3. do NOT stop candidate-bound visual review merely because route proof is blocked;
4. render the exact candidate bytes through the strongest available controlled fallback (for example Chromium `set_content`);
5. verify the screenshot evidence is bound to the exact candidate identity/hash where possible;
6. run the planned visual/responsive matrix using the fallback;
7. classify the result as `CANDIDATE_BOUND_VISUAL_PROOF` / `VISUAL_ONLY`, not route proof;
8. keep route-dependent assertions separately OPEN/BLOCKED.

A Writer must not repeat the earlier failure mode of treating exact-route unavailability as inability to create screenshots.

## 5. POST-CHANGE VISUAL EVIDENCE LAW
Every material frontend correction requires fresh candidate-bound post-change visual evidence.
Do not reuse precursor screenshots after the candidate SHA/bytes materially change.

## 6. EVIDENCE NON-COLLAPSE
Do not collapse evidence classes:
- STATIC != RUNTIME
- TEST != BROWSER
- BROWSER != DATABASE
- VISUAL != ROUTE
- VISUAL != PERSISTENCE
- SOURCE PRESENCE != INTERACTION BEHAVIOR

## 7. NO SELF-ACCEPTANCE
Writer PASS + Writer screenshots != Controller acceptance.
Writer outputs remain candidates until independent review/adjudication reaches the governed gate.
