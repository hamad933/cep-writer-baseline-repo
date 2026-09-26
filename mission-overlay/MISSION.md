# SWR-W01-TODAY — Today Writer Mission

## 0. Role / hard stop
You are the Product Writer for **Today only**. You are not the Controller and not a capsule builder.
Do not modify live governance, Owner decisions, acceptance state, merge/release/deployment state, or sibling Surface domains.

Stop gate:
`CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`

## 1. Source and branch
Bound Product/source base:
- HEAD `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- tree `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Product identity `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289 files`

The capsule materializes a transport-only descendant containing `mission-overlay/**`. Create/switch to exactly `writer/surface-w01-today` from that materialized transport HEAD and preserve the overlay.

Before Product mutation:
- prove `25a5f13c55096b7c4c8ef51100256a856cff75f5` is an ancestor of HEAD;
- prove `25a5f13c55096b7c4c8ef51100256a856cff75f5^{tree}` = `dd0315926270ec1f6571b82566dcdab3d65267f9`;
- run `tools/source-tree-identity.mjs` and verify `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289`;
- prove clean worktree.
Any mismatch => STOP; do not refetch/guess.

## 2. CLOSED MANDATORY READ SET — exact order
1. `mission-overlay/MISSION.md`
2. `mission-overlay/CAPSULE_BINDING.json`
3. `mission-overlay/LIVE_AUTHORITY_SNAPSHOT.md`
4. `mission-overlay/APPLICABLE_OWNER_DECISIONS.csv`
5. `cep-writer/references/surface-profiles/today.json`
6. `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`
7. `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md`
8. `cep-writer/references/visual/00_TODAY/CEP_TODAY_MAIN_ORCHESTRATION_REFERENCE.png` — owner-confirmed Today Presentation reference
9. `stack/native-typescript/tests/post-c03/D07/d07-today-presentation-authority-tests.ts` — Today provider/Presentation falsification contract
10. `stack/native-typescript/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.ts` — shared W01 semantic contract; read-only
11. `stack/native-typescript/fixtures/acceptance-data/ds01-global/index.ts` — accepted DS01 test-only populated truth; read-only

No required live Drive lookup. Do not read old PREP helpers or `POST_DS01_SIX_EXECUTION_WRITERS` as authority.
Do not use `cep-writer/CURRENT_WRITER_BASELINE_STATE.json` to infer the current source base; its historical source fields are superseded by this mission binding.
No repo-wide `rg/grep/find` archaeology. A bounded discovery escape is allowed only for a named missing/contradictory symbol within the smallest relevant source family; record the reason.

## 3. Surface contract
Objects: `TodayProjection`, `ContinuationRef`, `Recommendation`. Slots: TOP Today identity/routes; LEFT typed projection collection; CENTER orchestration workbench; RIGHT selected projection/context; BOTTOM Today diagnostics/history; TOOLBAR shared grammar + Today commands; TRANSIENT shared owner. States: FETCHING / AVAILABLE_DATA / AVAILABLE_EMPTY / PARTIAL / STALE / UNAVAILABLE / ERROR; continuation RESOLVABLE / TARGET_REMOVED / TARGET_FORBIDDEN. No Today canonical domain writes; Mastery stays W04-owned; recommendations do not grant/deny access.

## 4. Current rescue objective
Restore/verify Today identity and owner-confirmed-reference Presentation without weakening provider truth: explicit unavailable/stale/error, exact continuation handoff, selection/version-gated `today.why`, responsive hierarchy/Bidi, and no canonical writes.

Historical/current matrix drift is a falsification target, not an assumption. Correct only defects that reproduce on the exact bound source and only inside the writable ceiling.

## 5. Writable paths — ONLY
- `stack/native-typescript/surfaces/today/**`
- `stack/native-typescript/adapters/today/**`
- `stack/native-typescript/tests/post-ds01/W01/TODAY/**`
- `dist/surfaces/today/** (generated only)`
- `dist/adapters/today/** (generated only)`
- `dist/tests/post-ds01/W01/TODAY/** (generated only)`
- `writer-output/SWR-W01-TODAY/**` for small textual handoff/receipts only.

Generated `dist/**` changes are allowed only for exact generated counterparts of authorized source/test changes after `npm run build:runtime`.

## 6. Explicit read-only dependencies
- `stack/native-typescript/foundation/**`
- `stack/native-typescript/surfaces/shell/**`
- `stack/native-typescript/tests/post-c03/D07/d07-today-presentation-authority-tests.ts`
- `stack/native-typescript/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.ts`
- `stack/native-typescript/fixtures/acceptance-data/ds01-global/**`
- `tools/d07-falsification.mjs`
- `tools/d07-today-visual-harness.html`
- `all W02-W05 paths`

## 7. Prohibited mutation
- `stack/native-typescript/main.ts`
- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- `stack/native-typescript/foundation/**`
- every other Surface/domain outside the explicit writable paths
- `cep-writer/**`
- `mission-overlay/**` after launch
- `.github/**`
- `package.json`, lockfiles, dependency manifests
- shared global CSS/chrome/focus/settings/pane/notes/toolbar owners
- UnifiedEditor / SpatialInteraction / AnalyticalCompare / OperationalSurface shared owners
- CURRENT_STATE / governance / Owner-decision storage
- merge/release/deployment/acceptance/promotion

Shared-owner need => `SHARED_OWNER_ESCALATION`, not a local duplicate/workaround.

## 8. Positive + negative/falsification gates
- Positive: normal unbound provider is explicit UNAVAILABLE and never fabricated populated/empty truth.
- Positive: DS01 test-only populated state renders Today orchestration without becoming default Product data.
- Positive: Today command availability, continuation, filter, and exact selected recommendation/version `today.why` follow adapter truth.
- Positive: 1440×1000 + 1024×900, pointer/keyboard/focus, responsive, RTL/LTR/Bidi are inspected against the exact Today reference.
- Negative: no Today canonical/Mastery/access write or invented unlock logic.
- Negative: UNAVAILABLE/ERROR/STALE cannot collapse to AVAILABLE_EMPTY; filtered-empty differs from source-empty.
- Negative: CBF-002/003 shared-owner defects are escalated, not locally duplicated.
- Negative: stale screenshots cannot be labeled fresh.

## 9. Required commands
- `npm run build:runtime`
- `node tools/d07-falsification.mjs`
- `node dist/tests/post-d13/DS01_GLOBAL_DATA_SUFFICIENCY/ds01-global-data-sufficiency.test.js`
- `npm test`
- `npm run check`
- `npm run runtime:check`
- `npm run test:balanced6`

Inherited exact-parent failure must be reported with parent-vs-candidate proof; never relabel it PASS.

## 10. Browser / visual / interaction
Capture fresh current-candidate 1440×1000 and 1024×900 states covering normal Product UNAVAILABLE truth, DS01 populated orchestration, selected recommendation with truthfully enabled `today.why`, and filtered-empty. Compare hierarchy/regions/resume/next-action/attention/recent/progress/spacing/clipping to the exact Today reference. Exercise pointer, keyboard, visible focus, responsive panes, RTL/LTR and technical-token Bidi. Provider/domain truth overrides visual imitation.

Bootstrap disposition: `DISABLED__LOCAL_RECAPTURE_ALLOWED`.
No prior/stale screenshot may be relabeled as fresh evidence. Use the packaged visual method and capture the current candidate locally. Open and visually inspect every material screenshot.
Navigation-independent real-browser rendering is evidence only when labeled `NOT_GENUINE_ROUTE`; it cannot close route/history/network/platform claims.

## 11. Output
- Candidate branch: `writer/surface-w01-today`
- Heavy/final Writer output Drive folder: `1ZOAYeK_XlMbosPaMv7N0odUHAB6nnTzs`
- Intermediate screenshots/logs/diffs remain local/ephemeral.
- GitHub carries Product delta + small bounded receipt/handoff only.

Final handoff: candidate HEAD/tree, Product identity, exact changed paths, commands/results, browser/visual evidence class, positive/negative tests, inherited blockers, all shared-owner escalations, and Stop Gate.

## 12. Stop
`CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
