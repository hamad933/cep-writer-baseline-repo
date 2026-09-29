# SERIALIZED_HOTSPOT_REQUEST — W03 (visual remediation round, R5)

**File:** `writer-output/W03/SERIALIZED_HOTSPOT_REQUEST.md` · **Workspace:** W03
**Status:** **FILED, NOT APPLIED** — `main.ts` and `surfaces/m0-controller-composition.ts` are
writer-forbidden (`controller/12_execution/04_hotspot_register.md`, `02_parallel_dispatch.md` §3).
**Slot:** 4 (`W05 persistence → W01 shell → W02 kernels → W03 → W04`).
**Filed:** 2026-09-29 · branch `writer/mi-serial`.

Every hunk below was designed against the current worktree text of the two forbidden files and is
paired with a W03-owned half that is **already applied** in this candidate. Nothing in this file has
been taken by W03.

---

## H1 — Runs toolbar: `End Run` / `Capture Snapshot` / `Start` / `Prepare` / `Preflight` (DEF-RUN-1, V3)

**Defect.** The live route renders only `Open terminal · pause run · resume run · Disconnect provider ·
Reconnect session · Recorded result`. The reference (`image-gen-1(20260813-230627).png`, `e875f6c5`)
shows `Pause · End Run · Capture Snapshot` in the Operations toolbar and
`CEP_RUN_PREPARATION_PREFLIGHT_REFERENCE.png` (`91126b1e`) shows `Prepare · Preflight · Start`.
`composeRunsSurface` (W03-owned) already registers `runs.preflight/prepare/start/stop/seal`, but
neither the composition nor the toolbar is reached by the live route.

**W03-owned half already applied:** none required — `adapters/w03-runs.ts` already provides
`preflight()`, `prepare()`, `lifecycle('start'|'stop')` and `sealPreview()`;
`surfaces/runs/index.ts#composeRunsSurface` already registers `runs.preflight`, `runs.prepare`,
`runs.start`, `runs.stop`, `runs.seal`.

### H1a — `stack/native-typescript/main.ts` (inside `if(isSpatial){ … if(simulation){ … } }`,
immediately after the existing `for(const action of ['pause','resume'])…` line)

```diff
-  for(const action of ['pause','resume'])reg('runs.'+action,'W03V34RunsAdapter',action+' run',()=>{simulation.lifecycle(action);update()},()=>view!=='recorded'&&(action==='pause'?simulation.run.lifecycle==='RUNNING':simulation.run.lifecycle==='PAUSED')||'Run lifecycle does not allow this operation');
+  for(const action of ['pause','resume'])reg('runs.'+action,'W03V34RunsAdapter',action+' run',()=>{simulation.lifecycle(action);update()},()=>view!=='recorded'&&(action==='pause'?simulation.run.lifecycle==='RUNNING':simulation.run.lifecycle==='PAUSED')||'Run lifecycle does not allow this operation');
+  reg('runs.preflight','W03V34RunsAdapter','Run preflight (no write)',()=>{const receipt=simulation.preflight();update();return receipt},()=>view!=='recorded'||'Recorded Results are read only');
+  reg('runs.prepare','W03V34RunsAdapter','Prepare immutable Run Manifest',()=>{const receipt=simulation.prepare();update();return receipt},()=>view!=='recorded'&&['PREPARING','BLOCKED','READY'].includes(simulation.run.lifecycle)||'Prepare is only available before an active Run starts');
+  reg('runs.start','W03V34RunsAdapter','Start Run',()=>{simulation.lifecycle('start');update();return simulation.run},()=>view!=='recorded'&&simulation.run.lifecycle==='READY'||'Run must be READY (Prepare + passing preflight) before start');
+  reg('runs.end','W03V34RunsAdapter','End Run',()=>{simulation.lifecycle('stop');update();return simulation.run},()=>view!=='recorded'&&['RUNNING','PAUSED'].includes(simulation.run.lifecycle)||'Run must be RUNNING or PAUSED before End Run');
+  reg('runs.captureSnapshot','W03V34RunsAdapter','Capture Snapshot',()=>{const receipt={ok:true,kind:'RUN_SNAPSHOT_CAPTURE',runId:simulation.runId,lifecycle:simulation.run.lifecycle,devices:simulation.devices.map(d=>({id:d.id,up:d.up})),capturedAt:new Date().toISOString(),runtimeTruth:'INTERNAL_SIMULATION'};simulation.lifecycleReceipts.push({action:'captureSnapshot',after:simulation.run.lifecycle,version:simulation.run.version,invocationId:`snapshot-${simulation.lifecycleReceipts.length+1}`});update();return receipt},()=>view!=='recorded'&&['RUNNING','PAUSED'].includes(simulation.run.lifecycle)||'Snapshot capture requires an active Run');
```

### H1b — `stack/native-typescript/surfaces/m0-controller-composition.ts` line 264

```diff
-  if(consumer==='runs'){workspace.toolbar(['OPEN_TERMINAL','runs.pause','runs.resume','runtime.disconnect','runtime.reconnect','view.recorded']);return {surface:'runs',runtimeTruth:simulation?.descriptor?.()?.runtimeTruth||'INTERNAL_SIMULATION',operationalSessionOwner:wave4Assembly?.operationalSession?.owner||null,terminalRenderer:'XtermOperationalTerminalRenderer',realStudio:true};}
+  if(consumer==='runs'){workspace.toolbar(['OPEN_TERMINAL','runs.preflight','runs.prepare','runs.start','runs.pause','runs.resume','runs.end','runs.captureSnapshot','runtime.disconnect','runtime.reconnect','view.recorded']);return {surface:'runs',runtimeTruth:simulation?.descriptor?.()?.runtimeTruth||'INTERNAL_SIMULATION',operationalSessionOwner:wave4Assembly?.operationalSession?.owner||null,terminalRenderer:'XtermOperationalTerminalRenderer',realStudio:true};}
```

**Negative case this must not break:** `view==='recorded'` must keep every Runs lifecycle command
disabled (the availability predicates above already encode it). Re-run
`node tools/w03-browser-flows.mjs` flow `runs-preflight-run-recorded` after application.

---

## H2 — Runs CENTER: operational telemetry identity (DEF-RUN-2, V3)

**Defect.** The CENTER shows a 3-object device topology instead of the reference's operational
telemetry console (device tabs + alerts table + Alert Details + Event Timeline + Run Phases).

**Why a Writer cannot do it:** the runs `stage.innerHTML`, `renderDomainView()` and the LEFT
`Workspace views / Objects` tree all live in `main.ts` (`if(isSpatial){…}`), and the runs branch of
`mountM0ControllerComposition` runs *after* them with no post-mount hook W03 can reach.

### Proposed hunk — `stack/native-typescript/surfaces/m0-controller-composition.ts` line 264
(extends the H1b replacement block; every symbol below is already W03-owned and present in this
candidate, so the hunk is pure wiring):

```js
import {composeRunsSurface} from './runs/index.js';
import {renderRunsSurface} from './runs/presentation.js';
import {W03RunDomain} from '../adapters/runs/domain.js';
…
if(consumer==='runs'){
  // ONE run source: the exact `simulation` instance main.ts already binds as the live runtime.
  const runsDomain=new W03RunDomain({runtime:simulation,sessionOwner:wave4Assembly?.operationalSession});
  const runsComposition=composeRunsSurface({domain:runsDomain,bus:commandBus,shared:{spatialRelation:relations||seedRelations('runs',['Device','Event','Telemetry'])}});
  bridgeSemanticCommandBus(registry,commandBus);           // existing m0 helper (already used for W05)
  workspace.toolbar(['OPEN_TERMINAL','runs.preflight','runs.prepare','runs.start','runs.pause','runs.resume','runs.stop','runs.captureSnapshot','runtime.disconnect','runtime.reconnect','view.recorded']);
  const runsStage=ensureStage({consumer});
  renderRunsSurface(runsStage,runsComposition,{dir:workspace?.dir||'ltr'});   // reference-shaped centre
  registerM0Context(wave3Assembly,{consumer,domain:runsDomain,summary:'Run lifecycle and recorded operational facts',snapshot:()=>runsDomain.workspace()});
  return {surface:'runs',composition:runsComposition,presentation:renderRunsSurface(runsStage,runsComposition,{dir:workspace?.dir||'ltr'}),runtimeTruth:simulation?.descriptor?.()?.runtimeTruth||'INTERNAL_SIMULATION',operationalSessionOwner:wave4Assembly?.operationalSession?.owner||null,terminalRenderer:'XtermOperationalTerminalRenderer',realStudio:true};
}
```

Notes for the Coordinator when re-basing:
* `main.ts` also writes the runs `stage.innerHTML` (`#spatialHost` + `#domainView` +
  `#operationalHost`) *before* this branch; `ensureStage({consumer})` returns that same stage, so
  `renderRunsSurface` replaces the generic device-topology markup. The **OperationalTerminalHost**
  bound to `#operationalHost` at `main.ts` is therefore lost — if the terminal must survive,
  re-base the hunk to append `.runs-workspace` *after* `#operationalHost` instead of replacing
  `stage.innerHTML`, i.e. change `renderRunsSurface`'s call to
  `renderRunsSurface(document.createElement('div'),…)` + `stage.append(…)`.
* `bridgeSemanticCommandBus` throws `R6_DUPLICATE_COMMAND_OWNER` if `registry` already owns an id
  with a different owner. `runs.pause` / `runs.resume` are registered by `main.ts` with owner
  `W03V34RunsAdapter` while `composeRunsSurface` uses `W03RunDomain` — **either** drop those two
  ids from `composeRunsSurface` **or** align both owners to `W03RunDomain` before bridging.
  (H1a alone, without H2, avoids this collision entirely.)

---

## H3 — Run Preparation / Preflight major state (DEF-RUN-3, V2)

`CEP_RUN_PREPARATION_PREFLIGHT_REFERENCE.png` (`91126b1e`) must be reconstructable. With H1a applied
the `Preflight` and `Prepare` commands become reachable; W03's capture tool already contains a
`runs → Preflight` state enactor (`tools/w03-visual-reaudit-capture.mjs`) that fails today with
`no runs.preflight toolbar control` — re-run it after H1a+H1b to produce the evidence frame
`runs-Preflight-1440x1000.png` / `-1024x900.png`.

**Blocking:** H1a + H1b. No W03-owned half can substitute.

---

## H4 — Results CENTER identity: informative unavailable state + visible capability state
(DEF-RES-2 residual, DEF-RES-3)

**Defect.** `studio-node-1/2/3` and `EMPTY · State none · Revision none · 08%` were removed by the
Coordinator's RC-3 fix, but the Results CENTER identity still reads as a generic collection shell:
the title is rendered twice (`.m0-studio-head h1` + `.m0-workbench h2`), `EMPTY · No current records.`
does not say *why*, and `.m0-results-spatial` renders the generic
`No authored spatial structure is bound to this definition; nodes and relations appear here once the
domain authoring commands create them.` copy, which is meaningless on a read-only Results surface.
Because a failed `results.replay / results.annotate / results.compare` only writes
`stage.dataset.lastCommandStatus`, **Replay, AAR and Compare are byte-identical on screen**
(measured: all three frames sha `fde68ae3c996…` at 1440×1000).

**Do not fabricate sealed Results** (DEF-RES-1 stays BLOCKED on W05 CBF-001/SC-011).

### Proposed hunk — `stack/native-typescript/surfaces/m0-controller-composition.ts`,
`mountResultsStudio` (≈ line 151-157)

```diff
-  const grid=stage.querySelector('.m0-studio-grid'),workbench=stage.querySelector('.m0-workbench');
+  const grid=stage.querySelector('.m0-studio-grid'),workbench=stage.querySelector('.m0-workbench');
+  if(workbench&&!rows.length)workbench.insertAdjacentHTML('afterbegin',
+    `<section class="m0-empty-guidance" data-results-unavailable-mode="RESULT"><h3>Replay / AAR / Compare unavailable</h3>
+     <p>RESULTS_PROVIDER_UNAVAILABLE · no sealed Result revision is bound to this composition yet.
+     Recorded Result revisions remain sealed facts; Replay, AAR and exact comparison are historical
+     analysis only and never execute the live runtime. This region shows an unavailable state — it
+     does not infer, fabricate or pre-render any Result.</p></section>`);
```

plus a mode chip row (`Result · Replay · AAR · Compare`) driven by
`stage.dataset.lastCommandCode` so the four modes are **byte-distinct** without any data.

**W03-owned half already applied:** none — the centre is composed entirely inside
`mountResultsStudio`. W03 keeps `adapters/results/**` and `foundation/analytical/**` unchanged and
read-only; no surface-local persistence or fake sealed Result is introduced.

---

## H5 — Scenarios / Labs RIGHT context lens (DEF-SCN-3 / DEF-LAB-3, V2)

**Defect.** `registerM0Context()` builds a 2-field generic lens
(`State` + `Revision / version`) from every domain snapshot, so the reference RIGHT blocks
(scenario: Type / Recipient / Trigger / Delivery / Payload type / Branch impact; lab: Objective type /
Required capability / Permitted tools / Expected signal / Validation link / Completion contribution)
cannot appear even though `domain.selectionContext()` already returns exactly those objects.

### Proposed hunk — `stack/native-typescript/surfaces/m0-controller-composition.ts`,
`registerM0Context` (≈ line 59-63)

```diff
-      const value=snapshot()||{},revision=value.revisionId||value.version||value.status||'current',
-      lenses=[{id:'identity',label:'Context',tabs:[{id:'current',label:'Current',fields:[{id:'state',label:'State',value:value.status||value.state||'AVAILABLE'},{id:'revision',label:'Revision / version',value:String(revision),technical:true}]}]}];
+      const value=snapshot()||{},revision=value.revisionId||value.version||value.status||'current';
+      const selection=value.selection&&value.selection.id?value.selection:(value.definition&&value.definition.selection)||null;
+      const lenses=[{id:'identity',label:'Context',tabs:[{id:'current',label:'Current',fields:[
+        {id:'state',label:'State',value:value.status||value.state||'AVAILABLE'},
+        {id:'revision',label:'Revision / version',value:String(revision),technical:true},
+        ...(selection?.object?Object.entries(selection.object).filter(([,v])=>['string','number','boolean'].includes(typeof v)).slice(0,10).map(([k,v])=>({id:k,label:k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase()),value:String(v)})):[])]}]}];
```

**W03-owned half already applied:** `W03ScenarioDomain.selectionContext()` and
`W03LabDomain.selectionContext()` already expose `object` with every reference field; the
representative definitions seeded in `adapters/{scenarios,labs}/domain.ts` supply them.

---

## Files W03 did **not** touch (verified)

`stack/native-typescript/main.ts` · `stack/native-typescript/surfaces/m0-controller-composition.ts` ·
`stack/native-typescript/adapters/structured-documents.ts` · `stack/native-typescript/foundation/workspace.ts` ·
`stack/native-typescript/foundation/spatial/**` · `stack/native-typescript/foundation/structured/outline-*.ts` ·
`controller/**` · `cep-writer/**` · `contracts/**` · `profiles/**` · `authority/**` (hand-edited) ·
`assurance/**` (only via `tools/writer-serial.sh`).

## Regression selection to run after application

```
tools/writer-serial.sh node tools/build-runtime.mjs
tools/writer-serial.sh npm test
node tools/w03-browser-flows.mjs
node tools/w03-visual-reaudit-capture.mjs --label post-hotspot
```

Expected: `runs-Preflight-*` becomes an enacted, byte-distinct frame; `results-{Replay,AAR,Compare}-*`
become byte-distinct; scenarios/labs RIGHT panes gain the selection lens fields.
