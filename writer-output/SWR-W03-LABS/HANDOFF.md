# SWR-W03-LABS Writer Handoff

Status: `CANDIDATE_ONLY__SOLE_CONTROLLER_REVIEW_REQUIRED`

## Source binding
- Mission: `SWR-W03-LABS`
- Candidate branch: `writer/surface-w03-labs`
- Bound parent HEAD: `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- Bound parent tree: `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Bound Product source SHA-256: `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a`
- Bound Product tracked files: `289`
- Capsule verifier: `PASS`

## Candidate delta
Only Labs-local authorized paths changed:
- `stack/native-typescript/adapters/labs/domain.ts`
- `stack/native-typescript/surfaces/labs/index.ts`
- `stack/native-typescript/surfaces/labs/presentation.ts`
- `stack/native-typescript/tests/surfaces/labs/domain.test.ts`
- `writer-output/SWR-W03-LABS/HANDOFF.md`

Semantics preserved / corrected:
- `LabDefinition != Run instance`; handoff delegates run identity to Runs and never creates runtime state.
- Publication freezes a validated Lab definition; provider/environment truth remains enforced by `labs.preflight` and `labs.handoff` rather than preventing definition publication.
- Draft preflight remains `BLOCKED`; handoff requires exact `PUBLISHED` LabRevision.
- Published revisions remain immutable; `labs.revise` creates a draft successor with source lineage preserved.
- RTL presentation keeps semantic `LEFT / CENTER / RIGHT` geometry stable while preserving RTL text in local Labs panes.
- Task/branch selections expose `aria-pressed`; edge-condition control has an explicit accessible name.
- No Structured/Spatial/shared owner was modified or locally forked.

## Source-bound parent failures
On the exact parent, both required targeted Labs tests failed on READY-vs-BLOCKED lifecycle assertions. They were treated as inherited source-bound defects; the stricter Draft=`BLOCKED` / Published=`READY` law was not weakened.

## Candidate tests / falsification
- `dist/tests/rescue/S11_W03_SCENARIOS_LABS/lab-task-graph.test.js` — `PASS`
- `dist/tests/surfaces/labs/domain.test.js` — `PASS`
- `dist/tests/rescue/CG4_W03_COVERAGE/controller-corr01-w03-lifecycle-truth.test.js` — `PASS`
- `dist/tests/rescue/CG4_W03_COVERAGE/group-composition.test.js` — `PASS`
- `dist/tests/rescue/CG4_W03_COVERAGE/group-falsification.test.js` — `PASS`
- `python3 tools/check-w03-semantic-ownership.py` — `PASS 60/60`
- `npm test` — `210 PASS / 0 FAIL`
- Generated `dist/**` and assurance drift restored before handoff.

Negative/falsification evidence includes:
- Draft preflight remains blocked even with otherwise-ready provider context.
- Draft handoff returns `LAB_REVISION_NOT_PUBLISHED`.
- Missing required provider after publication returns `LAB_PREFLIGHT_BLOCKED` and does not mutate Lab version.
- Successful handoff reports `runCreated=false`, `runtimeStateCreated=false`, and preserves Lab version.
- Published authoring is immutable until `labs.revise` creates a successor revision.

## Browser / visual / interaction / accessibility evidence
Evidence classification: `NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE`.

Reason: direct localhost/file navigation is blocked in this execution carrier, matching the capsule bootstrap limitation. Evidence was rendered from exact candidate bytes with Chromium `144.0.7559.96`; this is not represented as genuine-route proof.

Representative final capture hashes:
- `candidate_labs_1440x1000.png` — SHA-256 `59e3433557879fd409ea25b9ed5c15c1715578faa11bef13e46a21da5fc70a3a`
- `candidate_labs_published_1440x1000.png` — SHA-256 `e082ab1bf534b89edfe7d227a2923965ab85277716c5ed1e16374d73438efa8d`
- `candidate_labs_768x1000.png` — SHA-256 `e05eeedb03524ed35042e9098d4808a305d88cf57587867bcaf276ca4fb74cb5`

Observed candidate facts:
- RTL 1440 geometry: `LEFT.x=9 < CENTER.x=249 < RIGHT.x=1111`; no horizontal overflow.
- Initial state: `5` tasks, `2` branch/optional edges, selected `T3`, Draft preflight `BLOCKED`, handoff disabled.
- Keyboard `Enter` selects task `T4`; keyboard `Space` selects branch `E3`; `aria-pressed` follows selection.
- Draft authoring adds a task without creating a Run.
- Published state: preflight `READY`, handoff enabled, authoring controls disabled.
- Handoff UI states that Lab input was frozen and no Run was created; Lab version is unchanged.
- Revise creates revision `3` from published revision `2` and preserves source lineage/digest.
- 768 viewport: no horizontal overflow; Labs-local structural pane collapses per responsive rule.
- Browser proof: `0` console errors, `0` page errors, `0` failed requests, `0` unnamed buttons, `0` unlabeled form controls.

The navigation-independent harness does not carry the full shared donor/theme route, so shared Spatial visual styling is not used as a local Labs correction target. No shared-owner defect was mutated.

## Shared-owner / route status
- `SHARED_OWNER_ESCALATION_REQUIRED`: none established by direct evidence in this lane.
- Genuine W03 route/controller-convergence proof remains outside this Writer's writable ownership; Controller integration/review is still required.

Exact final candidate HEAD/tree and promoted Drive evidence are recorded externally after the enclosing commit is created, because a tracked handoff file cannot recursively contain the SHA of the commit that contains itself.
