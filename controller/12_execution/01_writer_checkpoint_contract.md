# 12_execution / WRITER CHECKPOINT + COORDINATOR REVIEW CONTRACT

Timestamp: 2026-09-29T03:25Z · Author: Writer Coordinator · Applies to W01…W05 execution phase.

This file defines the record format every Writer checkpoint must carry and the 9-point Coordinator
review applied to each returned child result before it is committed (mission §26). It is a Writer-phase
append; no Controller artifact is modified.

## 1. Checkpoint record schema (A–E per workspace)

Each checkpoint writes `writer-output/<WS>/CHECKPOINTS.md` (appended, never rewritten) with:

| Field | Content |
|---|---|
| `checkpoint_id` | `<WS>-A` … `<WS>-E` |
| `branch` | `writer/mi-serial` |
| `commit` | `git rev-parse HEAD` at the moment of the checkpoint |
| `candidate` | candidate identity actually measured (CANONICAL `480dbe…/273`, CLEAN HEAD `3f3ad1e0…/287`, or explicitly-labelled `WORKTREE_VARIANT c82cec63…/287`) + `HEAD^{tree}` |
| `changed_files` | exact paths, with provenance flag: `W01_NEW` / `PRE_EXISTING_PROTECTED` / `GENERATED_DIST` / `EVIDENCE` |
| `tests` | exact commands run + measured PASS/FAIL counts + receipt path |
| `evidence` | artifact paths + sha256 |
| `requirements` | rows dispositioned / total, zero-loss boolean, matrix sha256 |
| `remaining_work` | explicit list, empty only if genuinely empty |
| `known_risks` | explicit list |

Checkpoints A–E map to the packet's minimum set:

- **A** workspace baseline verified (inherited receipts re-measured on the exact candidate)
- **B** foundation/surface implementation stable (defects repaired, build regenerated)
- **C** requirement coverage verified (zero-loss matrix generated, exit 0)
- **D** browser/evidence verification (contract-complete receipt, failures classified)
- **E** workspace completion handoff (six packet states: implementation, browser, evidence,
  acceptance, integration, checkpoint)

## 2. Coordinator review of a returned Writer (all 9 must be answerable)

1. Did it use the correct packet and the correct `W0x_REQUIREMENTS.csv`?
2. Did it remain inside its workspace (no W0y surface/adaptor/test touched)?
3. Did it cover requirements — `zero_loss: true`, every row carries a permitted status?
4. Did it preserve shared ownership (one IMPLEMENTATION_OWNER per mechanic, consumers read-only)?
5. Did it run the required tests, and are the reported numbers the *measured* ones?
6. Does the evidence match the actual candidate (recomputed hash/file-count, no orphan screenshots)?
7. Did it introduce a cross-workspace regression (the 86-file compiled corpus + `npm run check`)?
8. Did it change protected files (the 3 pre-existing canonical deltas, `controller/**`, `cep-writer/**` chain)?
9. Is the reported status supported by an artifact a reviewer can re-run?

A "no" sends the child back with a **focused correction task** — never a workspace restart.

# 12_execution / 01_writer_checkpoint_contract

> **CURRENT CONTROLLER CEILING — 2026-10-02 (reconciled):** Historical Writer-phase record (2026-09-29). The `W01 → W02 → W04 → W05 → W03` integration order below is **epoch evidence from the serial dispatch era**; current topology is `OD-20261002-087` (parallel disjoint lanes; integration/convergence serialized Controller-owned). Preserve the body as lineage; it grants no current launch authority.

## 3. Integration order applied by the Coordinator

Execution/commit order = `W01 → W02 → W04 → W05 → W03` (dispatch manifest carrier law), which
preserves PW-A ({W01,W02,W04}) before PW-B ({W05 remainder, W03}).

After **each** workspace checkpoint commit the Coordinator re-runs the regression selection:

- `npm test`
- `npm run check` (all 9 sub-commands individually, so a single failing sub-command is attributable)
- the full compiled corpus `dist/**/*.js` test sweep (86 files) — attribute every new failure to the
  workspace that introduced it
- `tests/surfaces/*/surface.test.mjs` sweep
- `npm run browser:test` when a workspace changed product source

PW-C serialized hotspot slots are granted per-writer at the time of the change:
`W05 persistence → W01 shell → W02 kernels → W03 → W04`. Because execution is serial there is only one
candidate holder at a time; the slot is recorded in the checkpoint record rather than lock-contended.

## 4. Final execution matrix (mission §35)

Produced at completion from the aggregate:

```
WORKSPACE | OBLIGATIONS | IMPLEMENTED | VERIFIED | EVIDENCE | BLOCKERS | STATUS
```

with `STATUS ∈ {PASS, PASS_WITH_LIMITATION, BLOCKED, UNKNOWN, NOT_STARTED}` only.

Aggregate command: `python3 tools/writer-acceptance-matrix.py --workspace W01 --aggregate`.
