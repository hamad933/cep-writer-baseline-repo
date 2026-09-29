# 12_execution / PARALLEL_DISPATCH — Owner-directed parallel execution + resource partition

Timestamp: 2026-09-29T03:45Z · Author: Writer Coordinator · Supersedes the *execution seriality* reading
in `00_dispatch_readiness.md` §2 **by explicit Owner directive**, not by silent reinterpretation.

## 1. Owner directive (2026-09-29, verbatim law)

> RUN IN PARALLEL: independent workspace work.
> SERIALIZE: only conflicting shared resources / integration seams.
> "Do NOT serialize an entire workspace merely because it has some shared consumers."
> "Serialize only the exact conflicting resource/change."
> "Actually launch every currently eligible Writer now."

This is an Owner authority instruction and therefore binding over the `dispatch_manifest.md`
carrier-seriality reading. The Controller artifacts are **not** rewritten — `00_dispatch_readiness.md`
§2 is retained as the record of the prior reading, and this file records the change of authority.

## 2. Dependency-graph re-check (mission §30 / directive rule 2 & 10)

| Writer | PW wave | Depends on | Blocked by live work? | Eligible now? |
|---|---|---|---|---|
| W01 | PW-A | W05 persistence seed (consume-only) | running | ✅ already running |
| W02 | PW-A | shell nav (W01, consume-only), preferences (W05, consume-only) | no — consume-only edges | ✅ **launched** |
| W04 | PW-A | shell nav (W01), settings (W05), evidence receipt format it polices | no — consume-only edges | ✅ **launched** |
| W05 | PW-A first phase = persistence/CBF-001 + SC-011 | none (it *is* the dependency) | no | ✅ **launched** |
| W03 | PW-B | W05 persistence truth (data edge) | partially — seeded-surface work | ✅ **launched** with explicit instruction to do independent surface work now and report persistence-dependent rows as `BLOCKED` with the missing dependency named |

The only *hard* edges in `parallel_plan.md` are `W04 → ALL` (evidence receipt contract) and
`W03 → W05` (run-state persistence) plus `ALL → W05` (persistence kernel). The first is a contract
consumers read; the second is satisfied by running W05 concurrently and letting W03 mark the
dependent rows `BLOCKED` rather than by serializing all of W03.

## 3. Exact conflicting resources → exact serialization

Per directive rule 6, only these are serialized, and only for the duration of the mutating command:

| Conflicting resource | Why | Serialization mechanism |
|---|---|---|
| `dist/**` (whole-tree regenerated build output) | `node tools/build-runtime.mjs` rewrites every file in `dist/` | `tools/writer-serial.sh node tools/build-runtime.mjs` (exclusive `flock`) |
| `assurance/**` receipts | `npm test` / `npm run check` / `npm run browser:test` rewrite the same JSON/png | `tools/writer-serial.sh npm test` / `… npm run check` / `… npm run browser:test` |
| `main.ts` + `surfaces/m0-controller-composition.ts` | single composition entrypoint, shared singletons constructed once | **writers may not edit at all**; proposed hunks go to `writer-output/<WS>/SERIALIZED_HOTSPOT_REQUEST.md`, Coordinator applies in PW-C slot order |
| git history | one serial branch | **writers may not `git add`/`commit`**; Coordinator commits per workspace checkpoint |

Everything else is partitioned by file ownership (§4) and runs concurrently.

## 4. Source-tree ownership partition (0 overlap)

| Writer | Writable source roots |
|---|---|
| **W01** | `surfaces/{shell,today}/**`, `foundation/global/{shell/**,bottom-shelf.ts,workspace.ts}`, `adapters/today/**`, `tests/surfaces/{shell,today}/**`, `tools/{c3-today-truth,w01-*}` |
| **W02** | `surfaces/{library,learn,rq,visualize}/**`, `adapters/{learn,library-*,context-*,structured-*,note-*}.*`, `adapters/{library,learn,rq,visualize}/**` (minus `analytical/results-compare-provider.ts`), `foundation/{structured,spatial,relations,window-motion}.ts*`, `foundation/global/{input-keymap,input-ownership-contract,region-cycle,feedback,feedback-contract,input-direction,responsive-layout,pane-layout,toolbar-template,transient-focus,transient-host,context-inspector}.ts`, `foundation/contracts/platform-input-direction-bridge.ts`, `w5-*/w6-*/pw08*/pw11*` structured test lines, `tests/surfaces/{library,learn,rq,visualize}/**`, `tests/rescue/{S01,S08,S09}/**`, `tests/post-c03/D08/**`, `tools/{b3r-rq-visualize,w02-*}` |
| **W03** | `surfaces/{enterprise,scenarios,labs,runs,results}/**`, `adapters/{w03-enterprise.ts,w03-runs.ts,simulation.ts}`, `adapters/{enterprise,labs,runs,results,scenarios,w03-v34}/**`, `adapters/analytical/results-compare-provider.ts`, `foundation/analytical/**`, `analytical-compare*.ts`, `foundation/timeline/**`, `surfaces/composition/w03-rescue.ts`, `w4-f-operational-session-tests.ts`, `tests/surfaces/{enterprise,scenarios,labs,runs,results}/**`, `tests/rescue/{S10,S11,S12,S13,CG4_W03_COVERAGE}/**`, `tests/post-c03/{D09,LCORR03}/**`, `tools/{check-w03-semantic-ownership.py,w03-*}` |
| **W04** | `surfaces/{evidence,reviews,mastery,portfolio}/**`, `adapters/{evidence,reviews,mastery,portfolio}/**`, `surfaces/composition/w04-rescue.ts`, `w4-g-epistemic-confirmation-tests.ts`, `tests/surfaces/{evidence,reviews,mastery,portfolio}/**`, `tests/rescue/{CG5_W04_COVERAGE,S14,S15}/**`, `tests/post-c03/D10/**`, `tools/{c2-w04-truth,w04-*,d10-*}` |
| **W05** | `adapters/{health-runtime,processing-runtime,validation,backup-runtime,audit}.ts`, `adapters/{manual_ai,audit,backup,configuration,releases,persistence}/**`, `surfaces/{validation,manual_ai,backup,audit,releases,configuration}/**`, `surfaces/composition/w05-rescue.ts`, **`foundation/global/{settings,preferences}/**`** (sole writer, SC-011), **`stack/local-runtime/persistence/**`** (sole writer, CBF-001), `w4-e-settings-center-tests.ts`, `tests/surfaces/{validation,manual_ai,backup,audit,releases,configuration}/**`, `tests/rescue/{S16,S17,S18,S19,PC1}/**`, `tests/post-c03/D11/**`, `tools/{w05-*,d11-*,balanced6-*,psc-runtime-falsification.mjs}` |

Read-only for everyone: `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`,
`archaeology/**`, `assurance/**`, the 3 protected canonical deltas, `session-63ad5b92-….md`.

Disjointness rule applied to the two known kernel seams:
- **preferences/settings kernel** → W05 sole writer (W02 = policy consumer, read-only) — resolves C-02/C-17.
- **spatial engine** → W02 sole writer this wave (W03 = boundary enforcer + consumer, read-only) — resolves C-09/C-12.
- **compare + replay kernels** → W03 sole writer (W02's `rq-compare-provider.ts` stays W02's).
- **shell nav / deep-work** → W01 sole writer.

## 5. Live child sessions at time of writing

| Writer | Session | Model | State |
|---|---|---|---|
| W01 | `ses_f14d7869affeqfnKZoxUNw7Rqa` | mimo-v2.6-flash | running (correction round) |
| W02 | `ses_f14b56e1affeemj07a3KvnvhW5` | mimo-v2.6-flash | running |
| W04 | `ses_f14b56e14ffe4ouq2NI4RHgN1U` | mimo-v2.6-flash | running |
| W05 | `ses_f14b56e0fffeq7Bk6PCjL8eO7I` | mimo-v2.6-flash | running |
| W03 | `ses_f14b56e0affeaQm36hjFaTU0Kr` | mimo-v2.6-flash | running |

## 6. Integration integrity under parallelism

- Writers never commit; the Coordinator reviews each return against the 9-point checklist
  (`01_writer_checkpoint_contract.md` §2) and commits one checkpoint per workspace.
- After each checkpoint the Coordinator runs `tools/writer-regression-sweep.mjs --label <WS>
  --baseline writer-output/_coordinator/REGRESSION_pre-writer-baseline.json` so only **new**
  failures count as regressions, attributed to the introducing workspace.
- PW-C serialized hotspot slot order is preserved for any `SERIALIZED_HOTSPOT_REQUEST.md`:
  `W05 persistence → W01 shell → W02 kernels → W03 → W04`.
- PW-D independent proof (obligation-manifest replay + genuine-browser receipt) still runs last,
  on the exact successor identity.
