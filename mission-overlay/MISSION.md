# SWR-W01-SHELL — Shell Writer Mission

## 0. Role / hard stop
You are the Product Writer for **Shell only**. You are not the Controller and not a capsule builder.
Do not modify live governance, Owner decisions, acceptance state, merge/release/deployment state, or sibling Surface domains.

Stop gate:
`CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`

## 1. Source and branch
Bound Product/source base:
- HEAD `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- tree `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Product identity `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289 files`

The capsule materializes a transport-only descendant containing `mission-overlay/**`. Create/switch to exactly `writer/surface-w01-shell` from that materialized transport HEAD and preserve the overlay.

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
5. `cep-writer/references/surface-profiles/shell.json`
6. `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`
7. `cep-writer/references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md`
8. `stack/native-typescript/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.ts` — current Shell semantic contract; read-only
9. `stack/native-typescript/foundation/global/shell/cep-destinations.ts` — shared destination registry; read-only
10. `stack/native-typescript/foundation/global/shell/destination-registry.ts` — global-area baseline; read-only
11. `stack/native-typescript/foundation/global/shell/navigation.ts` — navigation owner behavior; read-only/escalation source

No required live Drive lookup. Do not read old PREP helpers or `POST_DS01_SIX_EXECUTION_WRITERS` as authority.
Do not use `cep-writer/CURRENT_WRITER_BASELINE_STATE.json` to infer the current source base; its historical source fields are superseded by this mission binding.
No repo-wide `rg/grep/find` archaeology. A bounded discovery escape is allowed only for a named missing/contradictory symbol within the smallest relevant source family; record the reason.

## 3. Surface contract
Objects: `RouteContext`, `NavigationBookmark`, `ShellPresentation`. Slots: TOP Shell identity/routes; LEFT typed RouteContext navigation; CENTER GlobalShell; RIGHT selected RouteContext inspector; BOTTOM diagnostics/history; TOOLBAR shared grammar + Shell commands; TRANSIENT shared owner. States: IDLE / RESOLVING / ACTIVE / NOT_FOUND / FORBIDDEN / FAILED; dirty departure NONE / CHOICE_REQUIRED / PRESERVED. Route state is not preference/domain state; navigation composition is reopened; destination count is not immutable law.

## 4. Current rescue objective
Restore/verify Shell-local projection and command semantics without inventing final chrome or forking shared owners. Preserve typed RouteContext, search/recover/navigation/dirty-departure and return continuity. Any change requiring `main.ts`, m0, `foundation/global/shell`, Settings, TransientFocus or other shared path is escalation-only.

Historical/current matrix drift is a falsification target, not an assumption. Correct only defects that reproduce on the exact bound source and only inside the writable ceiling.

## 5. Writable paths — ONLY
- `stack/native-typescript/surfaces/shell/**`
- `stack/native-typescript/tests/post-ds01/W01/SHELL/**`
- `dist/surfaces/shell/** (generated only)`
- `dist/tests/post-ds01/W01/SHELL/** (generated only)`
- `writer-output/SWR-W01-SHELL/**` for small textual handoff/receipts only.

Generated `dist/**` changes are allowed only for exact generated counterparts of authorized source/test changes after `npm run build:runtime`.

## 6. Explicit read-only dependencies
- `stack/native-typescript/foundation/global/shell/**`
- `stack/native-typescript/foundation/**`
- `stack/native-typescript/surfaces/today/**`
- `stack/native-typescript/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.ts`
- `tools/d07-falsification.mjs`
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
- Positive: navigate/search/recover/leaveDirty preserve current route/object semantics.
- Positive: five global areas remain a baseline while `destinationCountFrozen=false` and registered Product routes remain discoverable.
- Positive: dirty departure requires explicit choice; preserve requires verified recovery receipt; cancel does not navigate.
- Positive: pointer/keyboard/focus/dismissal/responsive/RTL/LTR/Bidi follow shared mechanics without local forks.
- Negative: no Shell canonical domain mutation or route→preference/domain conflation.
- Negative: no fixed final chrome/destination count is inferred from historical/current screenshots.
- Negative: no DS01/test-only seed enters Shell.
- Negative: shared TransientFocus/Settings/navigation/m0 gaps are escalated, never duplicated locally.
- Negative: stale screenshots cannot be labeled fresh.

## 9. Required commands
- `npm run build:runtime`
- `node tools/d07-falsification.mjs`

- `npm test`
- `npm run check`
- `npm run runtime:check`
- `npm run test:balanced6`

Inherited exact-parent failure must be reported with parent-vs-candidate proof; never relabel it PASS.

## 10. Browser / visual / interaction
There is no final Shell binary oracle. Capture fresh current-candidate 1440×1000 and 1024×900 states for active navigation, search/recover, dirty-departure choice and preserved return. Inspect shared layout/pane/command/focus/dismissal/responsive/RTL-LTR-Bidi/clipping/continuity against the SurfaceProfile + durable interaction contract + current shared mechanics. Do not claim visual parity to a nonexistent final reference.

Bootstrap disposition: `DISABLED__LOCAL_RECAPTURE_ALLOWED`.
No prior/stale screenshot may be relabeled as fresh evidence. Use the packaged visual method and capture the current candidate locally. Open and visually inspect every material screenshot.
Navigation-independent real-browser rendering is evidence only when labeled `NOT_GENUINE_ROUTE`; it cannot close route/history/network/platform claims.

## 11. Output
- Candidate branch: `writer/surface-w01-shell`
- Heavy/final Writer output Drive folder: `1DtKajrVreLripWnbYC0TeSX_UXkvMwqc`
- Intermediate screenshots/logs/diffs remain local/ephemeral.
- GitHub carries Product delta + small bounded receipt/handoff only.

Final handoff: candidate HEAD/tree, Product identity, exact changed paths, commands/results, browser/visual evidence class, positive/negative tests, inherited blockers, all shared-owner escalations, and Stop Gate.

## 12. Stop
`CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
