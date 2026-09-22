# B3-R Correction02 Candidate Handoff

Mission: `CORR02_B3R_CORRECTION02_VISUALIZE_FOUR_VIEW_COMPOSITION`
Mode: `MUTATING_CANDIDATE_ONLY`
Controller-Correction01 parent: `64a31e409c860a1e266101fd38fcb01f679327a2`
Parent tree: `f0eab313d37552889bce080a74b255b2ce91a38d`
Parent Product source: `16588836714764f10bc52066827e82b98b6809284e9aabeb19dd1e92580b6e36 / 273 files`

## Product correction

- Normal Visualize now exposes governed `TREE / PATH / GRAPH / CANVAS` states.
- The existing `wave3Assembly.spatial` instance/model is injected into the existing Visualize adapter; no second Spatial engine or owner is created.
- Active view context is bound to `visualize.select`, `visualize.move`, and `visualize.viewport`.
- Tree and Path are read-oriented projections; Graph exposes representation viewport interaction; Canvas exposes representation-geometry movement through the same Spatial owner.
- Selection is carried by the one shared selection kernel and survives compatible view changes and responsive RIGHT reveal/collapse.
- Provider truth remains `LOCAL_ACCEPTANCE_PROJECTION_ONLY / canonical:false / READ_ONLY`.
- Canonical relation/object mutation remains unavailable. Representation geometry/camera changes never become canonical object/relation truth.
- Controller Correction01 RQ behavior is preserved: no admitted current provider means Search/Compare remain unavailable, with no Balanced6 RQ promotion.

## F-045 / F-046 disposition

- `F-045`: `CLOSED_IN_CANDIDATE_PENDING_CONTROLLER_AUDIT`.
- `F-046`: `CLOSED_IN_CANDIDATE_PENDING_CONTROLLER_AUDIT` through a final evidence matrix covering all four views at `1440×1000` and `1024×900`, selected/context states, and RIGHT reveal at `1024×900`.

## Regression state before final candidate binding

- `npm test`: `210/210 PASS`.
- `npm run runtime:check`: `PASS`.
- `npm run test:balanced6`: `32/32 PASS`.
- B3-R focused falsification: `18/18 PASS`.
- Duplicate-owner scan: `PASS`.
- Navigation-independent Chromium candidate evidence: `PASS`; this is explicitly not genuine-route acceptance evidence.
- `npm run browser:test`: environment-blocked before flow execution because the Node `playwright` package is absent.
- `npm run check`: remains non-green only on inherited browser/evidence rows; Product/model/authority regressions are not implicated.

The exact final candidate HEAD/tree/Product-source identity is intentionally bound after the candidate commit in the external final custody manifest and final handoff, avoiding a false self-referential commit claim in this tracked file.

Stop gate: `B3R_CANDIDATE_ONLY__CONTROLLER_AUDIT_REQUIRED`
