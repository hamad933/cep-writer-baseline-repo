# W03 — PROPOSALS (nothing applied unilaterally)

Scope rule: registry / profile / contract changes and any edit to a serialized hotspot are
**proposed here**, never applied by the Writer. `main.ts` was not edited.

---

## P-W03-01 — Surface contract: add `SpatialInteraction` to `RESULTS_SURFACE_CONTRACT.families`

**Status: APPLIED (inside W03 ownership) — reported for review**

* File: `stack/native-typescript/surfaces/results/index.ts` (W03-owned)
* Before: `families:['TimelineReplay','AnalyticalCompare','AuditProvenance']`
* After:  `families:['TimelineReplay','AnalyticalCompare','AuditProvenance','SpatialInteraction']`
* Why: `profiles/results.json` declares `family_engines: ['SpatialInteraction','AnalyticalCompare']`
  and the obligation says *every family-engine binding is mandatory unless explicitly superseded*.
  The Results studio really does mount a shared spatial projection
  (`surfaces/m0-controller-composition.ts` → `.m0-results-spatial` → `mountEmbeddedSpatial`) and
  `ownerBindings` already contained `SpatialInteractionKernel`. Only `contract.families` was short.
* Proof: `node tools/w03-profile-coverage.mjs` → `PASS … results: 21/21 profile keys covered`.
* Reversibility: revert one array element; no test asserts this array.

**No registry (`authority/**`, `contracts/**`), no `profiles/**` file was modified.**

---

## P-W03-02 — SERIALIZED-HOTSPOT-QUALITY hunk for `main.ts` (NOT applied, NOT required)

**Status: PROPOSED ONLY — no `SERIALIZED_HOTSPOT_REQUEST.md` was filed because W03 did not need the
edit; recording it so the Controller can decide.**

The adjudicated worktree delta removes `if(consumer!=='enterprise'){…}` from `main.ts`. Verified
consequence (see CHECKPOINTS CKPT-B): `workspace.onPreferences` at `main.ts:223` does

```js
const host=stage.querySelector('#spatialHost');
host.querySelector('.spatial-legend')?.remove();
```

and for `enterprise` the M0 presentation has replaced the stage markup, so `host === null` and the
uncaught `TypeError` aborts boot. W03 worked around it **inside its own ownership** by making the
Enterprise presentation's topology host the stage's `#spatialHost`
(`surfaces/enterprise/presentation.ts`), which restores boot and preserves single-host uniqueness.

If the Controller prefers a null-safe guard instead of / in addition to that, the exact hunk is:

```diff
--- a/stack/native-typescript/main.ts
+++ b/stack/native-typescript/main.ts
@@ -223,1 +223,1 @@
- workspace.onPreferences=p=>{spatial.grid=p.grid;spatial.minimap=p.minimap;spatial.model.snap=p.snap;spatial.render();const host=stage.querySelector('#spatialHost');host.querySelector('.spatial-legend')?.remove();if(p.guidance){…
+ workspace.onPreferences=p=>{spatial.grid=p.grid;spatial.minimap=p.minimap;spatial.model.snap=p.snap;spatial.render();const host=stage.querySelector('#spatialHost');host?.querySelector('.spatial-legend')?.remove();if(p.guidance&&host){…
```

**Justification:** one-token null-guard; preserves the gate-REMOVED branch, keeps a single spatial
host per stage, and cannot affect `visualize`/`runs`/`golden`. W03 did **not** apply it — `main.ts`
is a serialized hotspot and the workaround above removes the need.

---

## P-W03-03 — `runs.preflight` / `runs.prepare` / `runs.start` are not wired into the live Runs route

**Status: OPEN — reported, not worked around**

* Observation: on `?surface=runs` the registry exposes only `runs.pause`, `runs.resume`
  (plus `OPEN_TERMINAL`, `runtime.*`, `view.*`). `main.ts:217` registers the `pause/resume` pair;
  `composeRunsSurface` (which owns `runs.preflight/prepare/start/inspect/seal`) is never composed for
  the live route — `surfaces/m0-controller-composition.ts` `consumer==='runs'` only sets a toolbar.
* Impact: **PVF-002** preflight → prepare → start cannot be driven from the live toolbar.
* What W03 proved instead: the full chain on the composed Runs surface
  (`runs.preflight` `NO_WRITE_PREFLIGHT` status READY, no state write → `runs.prepare` → READY with
  an immutable manifest → `runs.start` → RUNNING), recorded in
  `writer-output/W03/BROWSER_RECEIPT.json#flows.runs-preflight-run-recorded evidence.compositionPreflight`.
* Ask: Controller decides whether `mountM0ControllerComposition` should compose `composeRunsSurface`
  for `consumer==='runs'` (a `main.ts`/m0 hunk → serialized slot).

---

## P-W03-04 — Live Results provider binding (PVF-003 live half)

**Status: BLOCKED on another workspace — exact dependency named**

* Observation: `?surface=results` reports `RESULTS_PROVIDER_UNAVAILABLE` for
  `results.replay / results.compare / results.annotate / results.handoff`, and
  `DETERMINISM_PROVIDER_UNAVAILABLE` for `results.verifyDeterminism`.
  `W03ResultsDomain` is constructed with no `records`, so `providerState` is `UNAVAILABLE`.
* Missing dependency: **W05 persistence phase — CBF-001 seed + SC-011** (concurrent workspace).
* W03 rule observed: no surface-local persistence was implemented, and no sealed Result was
  fabricated — the unavailability is displayed truthfully (browser receipt flow 3).
* Mechanics (AAR / Compare / Replay / canonical-state invariance) are proven with explicitly
  labelled `recordedConsumer` fixtures.

---

## P-W03-05 — `runtime-causal-consequence` global-flow probe reads a non-existent property

**Status: PROPOSED — `tools/browser-conformance.mjs` is NOT W03-owned**

* Flow: `runtime-causal-consequence` (global suite) fails with
  `TypeError: Cannot read properties of undefined (reading 'id')` at the `page.evaluate` return.
* Cause: the probe reads `CEPFoundation.operational.providerDescriptor.id`.
  `OperationalTerminalHost` (`foundation/operational/terminal-host.ts`) exposes **no**
  `providerDescriptor`; the descriptor lives on the session owner as
  `providerDescriptor(providerId)` (`foundation/operational/session-owner.ts:68`).
* Classification: **HARNESS**.
* Suggested probe (owner of `tools/browser-conformance.mjs` to apply):

```js
provider: CEPFoundation.sharedOwners?.operationalSessionOwner?.providerDescriptor?.(
  CEPFoundation.operational?.providerDescriptor?.()  ??  null
)?.id ?? null
```

or simply drop the `provider` field from the returned evidence — the remaining assertions in that
flow (`up === false`, `nodeStatus === 'DOWN'`, `recordedUp === false`, `semanticCommand ===
'device.shutdown'`, terminal text contains `DOWN`) are the actual oracle.
W03's own flow `runs-preflight-run-recorded` proves that same causal chain with a correct probe and
measures **PASS**.

---

## P-W03-06 — Global `browser.targeted_visual_evidence` receipt is short by 2 screenshots

**Status: OBSERVED — not W03's to fix**

`npm run check` → `browser.targeted_visual_evidence` = `1 hash-bound screenshots; class=legacy`.
`tools/check-contracts.mjs` requires `screenshotManifest.count === 3` for the legacy branch (or
`>= 46` for the presentation branch). Only 1 flow currently reaches `capture(...)`.
W03's own evidence set (7 hash-bound PNGs at two viewports) is written to
`writer-output/W03/evidence/` and is **not** part of `assurance/SCREENSHOT_MANIFEST.json`.
