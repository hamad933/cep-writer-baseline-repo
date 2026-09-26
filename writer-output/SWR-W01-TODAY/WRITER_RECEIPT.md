# SWR-W01-TODAY Writer Receipt

Mission: SWR-W01-TODAY
Candidate branch: writer/surface-w01-today
Product commit: 36d91129a50f4219b1ea58b37efc716d152c6ea9
Product tree: dd11ab6daf9e655da439274dafc1aa6f21f20f64
Bound parent: 25a5f13c55096b7c4c8ef51100256a856cff75f5
Bound parent tree: dd0315926270ec1f6571b82566dcdab3d65267f9
Transport commit: 60644c5b65a8980d1ace131baf47f6c8581b3091
Transport tree: e29269e274c404c9ee767e7364e850d42e9ec24b
Bound-parent Product identity: sha256:b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a; files=289
Candidate canonical source hash observed by npm run check: b72c1a12a0d2119c12990bb8f12cba30248eaaf0fd6971b50029d7bce26c0402

## Product delta

- stack/native-typescript/surfaces/today/presentation.ts
- stack/native-typescript/surfaces/today/surface.ts
- stack/native-typescript/tests/post-ds01/W01/TODAY/today-selection-and-state-falsification.test.ts
- dist/surfaces/today/presentation.js
- dist/surfaces/today/surface.js
- dist/tests/post-ds01/W01/TODAY/today-selection-and-state-falsification.test.js

The Today Presentation no longer auto-selects the first Recommendation during render. An explicit presentation-only selection action binds the exact recommendation version before today.why becomes available. No semantic command was added and canonicalWrites remains false.

## Required command results

- npm run build:runtime — PASS / rc=0
- node tools/d07-falsification.mjs — PASS / rc=0
- node dist/tests/post-d13/DS01_GLOBAL_DATA_SUFFICIENCY/ds01-global-data-sufficiency.test.js — PASS 14/14 / rc=0
- npm test — PASS / rc=0
- npm run check — FAIL / rc=1; inherited exact-parent browser environment gate, not relabeled PASS
- npm run runtime:check — PASS / rc=0
- npm run test:balanced6 — PASS / rc=0
- node dist/tests/post-ds01/W01/TODAY/today-selection-and-state-falsification.test.js — PASS / rc=0

Exact-parent proof: npm run check on 25a5f13c55096b7c4c8ef51100256a856cff75f5 also returns rc=1 with net::ERR_BLOCKED_BY_ADMINISTRATOR, browser.current_candidate_claim_truthful FAIL, and browser.targeted_visual_evidence FAIL. Candidate check reports the same browser environment gate; current candidate source hash changes only because of the authorized Today delta.

## Browser / visual / interaction

Evidence class: FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE

Fresh 1440x1000 and 1024x900 browser captures cover:
- normal Product UNAVAILABLE truth
- DS01 populated orchestration before selection
- exact selected recommendation with truthfully available today.why
- filtered-empty with sourceTotalCount retained
- LTR English selected state in both viewports

Pointer refresh, keyboard selection, keyboard why action, focus restoration, responsive panes, RTL/LTR, and technical-token bdi dir=ltr were exercised. All browser evidence runs reported zero page errors. Navigation-independent evidence does not close genuine route/history/network/platform claims.

## Shared-owner escalations

SHARED_OWNER_ESCALATION:GlobalShellNavigationOwner:Today:Browser Back can restore route while losing governed Today filter semantic context:Browser Back and Forward must restore governed Today filter semantic context with the route:Use genuine route navigation set a non-ALL Today filter navigate away Back then Forward and assert route and filter semantic context restore together

SHARED_OWNER_ESCALATION:BottomDeepWorkOwner:Today:domain BOTTOM can exist while shared BottomDeepWorkOwner has zero providers:shared BottomDeepWorkOwner must expose truthful BOTTOM provider binding without a Today-local duplicate:Bind the shared BOTTOM owner for Today and assert provider count is nonzero and Today adds no local substitute

## Stop Gate

CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED
