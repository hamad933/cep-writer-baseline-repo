# CEP CORR02 B3-R Correction02 — Visualize Four-View Product Composition

**Writer class:** `CHATGPT_WRITER` — preferably the same Writer conversation that executed B3-R.  
**Mode:** `MUTATING_CANDIDATE_ONLY / LOCAL_FIRST / NO_SELF_PROMOTION / NO MAIN MERGE / NO RELEASE / NO GOVERNANCE MUTATION`  
**Continuation law:** reuse prior Writer *knowledge*, but DO NOT continue from the old B3-R working tree. Materialize this Capsule and work only from its exact parent.  
**Exact Controller-Correction01 parent:** `64a31e409c860a1e266101fd38fcb01f679327a2`  
**Parent tree:** `f0eab313d37552889bce080a74b255b2ce91a38d`  
**Parent Product source:** `16588836714764f10bc52066827e82b98b6809284e9aabeb19dd1e92580b6e36 / 273 files`  
**Current open blockers:** `F-045`, `F-046` only.  
**Stop Gate:** `B3R_CANDIDATE_ONLY__CONTROLLER_AUDIT_REQUIRED`

## 1. Why this is a correction, not a B3-R redo

The original B3-R Writer result `c77c1953...` was independently audited. Controller Correction01 already fixed the two bounded provider-truth defects discovered afterward. Those fixes are part of this exact parent and MUST be preserved. Do not redo F-027/F-034/F-035/F-036 except as regression/falsification.

The remaining blocker is exact and narrower:
- `F-045`: normal Visualize Product composition exposes `Topology / Objects / History` but does not bind the governed `TREE / PATH / GRAPH / CANVAS` states. Commands such as `visualize.select`, `visualize.move`, and `visualize.viewport` are unavailable without governed view context.
- `F-046`: prior final evidence omitted view-specific Tree/Path/Graph/Canvas states.

## 2. Exact correction objective

Wire the **existing** `VisualizeDomainAdapter.view(TREE|PATH|GRAPH|CANVAS)` adapters into the normal Visualize Product composition while preserving exactly **one** shared Spatial engine/owner.

Required result:
1. one truthful Product view selector/context for `TREE / PATH / GRAPH / CANVAS`;
2. active governed view mode reaches `visualize.select`, `visualize.move`, and `visualize.viewport` through the existing command/context seams;
3. Tree/Path/Graph/Canvas are visibly and behaviorally distinct thin projections over one shared Spatial engine;
4. selection/context remains coherent while switching views and while revealing RIGHT at `1024×900`;
5. the provider remains `LOCAL_ACCEPTANCE_PROJECTION_ONLY / canonical:false / READ_ONLY` unless exact current authority proves otherwise;
6. representation state never becomes canonical object/relation truth;
7. no second Spatial engine, relation owner, canonical store, pane system, toolbar owner, or Foundation owner.

## 3. Visual authority

- Tree = page-level `OWNER_CONFIRMED_FINAL_REFERENCE`.
- Path = supporting component reference.
- Graph = supporting component reference.
- Canvas = `OWNER_CONFIRMED_SUPPORTING_COMPONENT_REFERENCE`.
- Supporting references guide their component/view grammar only; they do not replace Tree/shared-shell authority.
- Reference data is illustrative. Do not fabricate canonical objects, writable relations, provider availability, progress, Mastery, or persistence merely to match a screenshot.

## 4. Writable Product scope

Preferred/narrow scope:
- `stack/native-typescript/adapters/visualize/**`
- `stack/native-typescript/surfaces/visualize/**`
- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- `tools/b3r-rq-visualize/**`
- `writer-output/presentation-corr02-b3r/**`

RQ is **regression-only**. `stack/native-typescript/adapters/rq/**` and `stack/native-typescript/surfaces/rq/**` are read-only unless a direct regression caused by this correction is proven; if such a regression would require mutation, STOP and report rather than silently widening scope.

Explicitly prohibited:
- Foundation/shared pane/toolbar/context/Spatial owner rewrites;
- Today/W04/W03/W05 changes;
- persistence/SQLite/runtime/terminal/dependencies;
- SurfaceProfile/Owner-decision/oracle mutation;
- making local acceptance data canonical/writable;
- main merge/push, release, deployment, stack freeze.

## 5. Required falsification

Prove on the exact final candidate:
- exactly one shared Spatial engine is used across all four views;
- four visible Product states exist: `TREE`, `PATH`, `GRAPH`, `CANVAS`;
- view switching does not create/clone canonical objects or relations;
- selection survives compatible view switches and RIGHT collapse/reveal;
- `visualize.select/move/viewport` receive active view context and are available only when their domain/view conditions are satisfied;
- relation connect/edit/commit/undo/redo stay truthful under the read-only provider;
- `canonical:false` and representation-only truth remain intact;
- no legacy `Canonical relationship workspace / Canonical relationships` copy returns after selection/context refresh;
- corrected RQ Search remains unavailable without an admitted provider and no Balanced6 RQ data leaks into normal RQ;
- keyboard/pointer/focus/overflow/Bidi behavior is checked at both governed viewport families.

## 6. Required visual evidence

Capture and **open/inspect** fresh exact-candidate screenshots for:
- TREE `1440×1000` and `1024×900`;
- PATH `1440×1000` and `1024×900`;
- GRAPH `1440×1000` and `1024×900`;
- CANVAS `1440×1000` and `1024×900`;
- at least one selected-object/context state per applicable view;
- responsive RIGHT reveal at `1024×900` without losing view/selection.

Every screenshot/receipt must bind exact candidate HEAD/tree/Product source. The initial Capsule bootstrap is parent evidence only and cannot satisfy final acceptance.

## 7. Regression gates

Rerun:
- `python3 cep-writer/tools/verify_repo.py` before mutation;
- `npm test` → preserve `210/210`;
- `npm run build:runtime`;
- `npm run runtime:check`;
- Balanced6 `32/32`;
- B3-R focused falsification (currently `13/13` at parent; extend for F-045/F-046);
- duplicate-owner scan;
- `npm run browser:test` / `npm run check` with Product-vs-harness/evidence/environment classification; do not mutate Product merely to satisfy stale evidence rows.

## 8. Final custody

Heavy final outputs only:
- Drive folder ID `1DGdhhFBQU7f0Pj1Q3SMFDe8XbhIrh84F`
- `/Google Drive/cep_building_mgm/00_CONTROLLER/B3R_RQ_VISUALIZE_TRUTH_CONVERGENCE/B3R_CORRECTION02_VISUALIZE_VIEW_COMPOSITION`

Final handoff must state exact parent, candidate HEAD/tree, Product source, exact Product/harness diff, F-045/F-046 disposition, four-view state/evidence matrix, all regression results, any remaining blocker, and final Drive IDs/hashes.

No self-promotion. End exactly:
`B3R_CANDIDATE_ONLY__CONTROLLER_AUDIT_REQUIRED`
