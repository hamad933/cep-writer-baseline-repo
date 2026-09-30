# SERIALIZED_HOTSPOT_REQUEST — W03-RUNS (visual remediation, current wave)

**File:** `writer-output/W03-RUNS/SERIALIZED_HOTSPOT_REQUEST.md` · **Unit:** `W03-RUNS` · **Surface:** `runs`
**Status:** **FILED, NOT APPLIED** — `stack/native-typescript/main.ts` and
`stack/native-typescript/surfaces/m0-controller-composition.ts` are writer-forbidden
(`controller/12_execution/02_parallel_dispatch.md` §3; `controller/12_execution/04_hotspot_register.md`).
**Slot:** 4 (`W05 persistence → W01 shell → W02 kernels → W03 → W04`).
**Filed:** 2026-09-30 · branch `writer/mi-serial` · HEAD `68341ec18f79`.

Everything below is designed against the *current* worktree text of the two forbidden files.
Nothing in this file has been applied by this Writer.

---

## H-RUN-1 — Mount the Runs surface composition (V4, root cause `ARCHITECTURE`) — REQUIRED

### Defect

`renderRunsSurface` (`stack/native-typescript/surfaces/runs/presentation.ts`) and `W03RunDomain`
(`stack/native-typescript/adapters/runs/domain.ts`) are **not referenced by any runtime path**.
Verified by grep across `stack/`, `dist/`, `tests/`, `tools/`:

* `renderRunsSurface` → definition only.
* `W03RunDomain` → `surfaces/composition/w03-rescue.ts` + tests only.

The live route `/?surface=runs` therefore renders `main.ts`'s generic spatial harness
(`.domain-heading` "RUN-0042 · Internal simulation" + `#spatialHost` + `#domainView`), a generic
LEFT `Workspace views / topology / table / history / recorded / Objects` list (main.ts:221) and a
generic RIGHT `Context` 2-field lens. Ground truth: `writer-output/W03-RUNS/evidence/baseline/`
(DOM probe + tesseract OCR + sha256 of the same bytes).

The composition itself (centre workbench, LEFT Run Structure, RIGHT context, preflight state,
lifecycle actions, terminal tray, AR/EN) is complete and lives entirely in W03-owned roots.

### Why a Writer cannot do it

Both files are writer-forbidden (§3 of the parallel dispatch). W03 owns no shared seam.

### Proposed hunk A — `stack/native-typescript/surfaces/m0-controller-composition.ts`

Add to the import block (alongside the existing `renderEnterpriseSurface` import):

```diff
 import {composeScenariosSurface} from './scenarios/index.js';
+import {composeRunsSurface} from './runs/index.js';
+import {renderRunsSurface} from './runs/presentation.js';
+import {W03RunDomain} from '../adapters/runs/domain.js';
```

Replace line 308:

```diff
-  if(consumer==='runs'){workspace.toolbar(['OPEN_TERMINAL','runs.pause','runs.resume','runtime.disconnect','runtime.reconnect','view.recorded']);return {surface:'runs',runtimeTruth:simulation?.descriptor?.()?.runtimeTruth||'INTERNAL_SIMULATION',operationalSessionOwner:wave4Assembly?.operationalSession?.owner||null,terminalRenderer:'XtermOperationalTerminalRenderer',realStudio:true};}
+  if(consumer==='runs'){
+    const runsDomain=new W03RunDomain({runtime:simulation,sessionOwner:wave4Assembly?.operationalSession});
+    const runsComposition=composeRunsSurface({domain:runsDomain,shared:{spatialRelation:relations||seedRelations('runs',['Device','Event','Telemetry'])}});
+    const runsPresentation=renderRunsSurface(ensureStage({consumer}),runsComposition,{dir:workspace?.dir||'ltr',workspace});
+    workspace.toolbar(['OPEN_TERMINAL','runs.pause','runs.resume','runtime.disconnect','runtime.reconnect','view.recorded']);
+    return {surface:'runs',composition:runsComposition,presentation:runsPresentation,runtimeTruth:simulation?.descriptor?.()?.runtimeTruth||'INTERNAL_SIMULATION',operationalSessionOwner:wave4Assembly?.operationalSession?.owner||null,terminalRenderer:'XtermOperationalTerminalRenderer',realStudio:true};
+  }
```

### Why this hunk is safe

1. **No `bridgeSemanticCommandBus` call.** `composeRunsSurface` uses its own default
   `SemanticCommandBus`, so its `OPEN_TERMINAL` / `runs.pause` / `runs.resume` /
   `runtime.*` ids never collide with `registry`'s `W03V34RunsAdapter` /
   `InternalSimulationAdapter` owners and `R6_DUPLICATE_COMMAND_OWNER` cannot fire.
   The surface drives those commands through `composition.bus`; the shell toolbar keeps driving
   main.ts's registrations. Both operate on the **same `simulation` instance**, so state never
   splits.
2. **Non-destructive render.** `renderRunsSurface` does *not* wipe the stage. It detaches
   `.domain-heading`, `#spatialHost`, `#domainView` and `#operationalHost`, re-appends the first
   three with `display:none` (so `renderDomainView()`'s `stage.querySelector('#spatialHost')`
   and friends keep resolving and cannot throw), and moves `#operationalHost` into the surface's
   own terminal tray. `OperationalTerminalHost` keeps its element reference and keeps working.
3. **Region binding is inside `renderRunsSurface`.** Passing `workspace` makes the surface set
   `workspace.region('LEFT', …)` (Run Structure) and `workspace.region('RIGHT', …)` (context
   readout) itself — no extra region code is needed in this hunk.
4. **`W03RunDomain` reuses `wave4Assembly.operationalSession`.**
   `OperationalSessionOwner.registerProvider()` is idempotent for the same provider instance
   (`session-owner.ts:60-66`), so registering `simulation` a second time cannot throw.

### Negative cases to re-run after application

* `node tools/w03-browser-flows.mjs` flow `runs-preflight-run-recorded` — `view==='recorded'`
  must keep every Runs lifecycle command disabled.
* `node tools/w03-visual-reaudit-capture.mjs` — `runs-Preflight-*`,
  `runs-{Topology,Recordedresult}-*` frames must still be produced.
* `npm test` — `stack/native-typescript/tests/rescue/S12_W03_RUNS/runs-operational-workspace.test.ts`,
  `tests/surfaces/runs/*`, `tests/rescue/CG4_W03_COVERAGE/*`, `tests/post-c03/D09/*`.
* `node tools/w03-browser-flows.mjs` flow that opens a terminal from `runs` — the xterm session
  must appear **inside** the surface's "Temporary work area" tray, not in the old stage position.

---

## H-RUN-2 — Shell toolbar action language for Runs (V2, `STALE_DECISION`) — OPTIONAL

**Defect.** main.ts registers only `runs.pause` / `runs.resume` (line 217), so the shell toolbar
for `runs` shows `Open terminal · pause run · resume run · Disconnect provider · Reconnect session
· Recorded result`. Neither reference state is expressible from the shell toolbar: the
preparation reference (`91126b1e`) needs `Prepare / Preflight / Start`, the operations reference
(`e875f6c5`) needs `Capture Snapshot`.

**W03-owned half already applied:** `composeRunsSurface` already registers `runs.preflight`,
`runs.prepare`, `runs.start`, `runs.stop`, `runs.captureSnapshot`, `runs.seal`, `view.recorded`,
and the new surface renders its own lifecycle-aware action row bound to those commands, so the
surface is fully operable **without** this hunk.

**If the Coordinator wants the shell toolbar to match the surface**, extend main.ts line 217's
registration loop with `runs.preflight`, `runs.prepare`, `runs.start`, `runs.stop`,
`runs.captureSnapshot` (owner must stay `W03V34RunsAdapter` to match the existing `reg(...)` owners)
and change line 308's toolbar array accordingly. Not required for H-RUN-1.

---

## H-RUN-3 — Bottom shelf content for `runs` (V1, `SURFACE_COMPOSITION`) — OPTIONAL

**Defect.** `main.ts` `renderBottom` (line ~102) dumps `JSON.stringify(simulation?.events||[])`
into `#bottomContent` for `consumer==='runs'`. The reference's bottom region is a *temporary work
area* (terminal), not a JSON dump.

**Note.** With H-RUN-1 applied, the terminal tray lives inside the surface and this shelf becomes
a second, redundant bottom region. Cleanest resolution is for the `runs` branch of `renderBottom`
to return `false` (letting the shell shelf stay closed for runs). Purely cosmetic; the surface
already renders an honest, labelled terminal tray.

---

## Files W03-RUNS did NOT touch (verified)

`stack/native-typescript/main.ts` · `stack/native-typescript/surfaces/m0-controller-composition.ts` ·
`stack/native-typescript/surfaces/composition/w03-rescue.ts` · `stack/native-typescript/adapters/w03-runs.ts`
· `stack/native-typescript/adapters/w03-v34/**` · `stack/native-typescript/adapters/simulation.ts`
· `stack/native-typescript/foundation/**` · `controller/**` · `cep-writer/**` · `contracts/**`
· `profiles/**` · `authority/**` · `assurance/**` (no writes at all by this unit) · `dist/**`
(only via `tools/writer-serial.sh npm run build:runtime`).

## Regression selection to run after application

```
tools/writer-serial.sh npm run build:runtime
tools/writer-serial.sh npm test
node tools/w03-browser-flows.mjs
node tools/w03-visual-reaudit-capture.mjs --label post-hotspot-W03RUNS
node writer-output/W03-RUNS/capture.mjs --label post-mount --viewports 1505x1045,1440x1000,1280x860,1024x800 --locales en,ar
```

Expected: `/?surface=runs` renders the reference-driven operations workbench at all four
viewports in both directions; `runs-Preflight-*` becomes an enacted, byte-distinct frame; the
terminal opens inside the surface tray; no page errors.
