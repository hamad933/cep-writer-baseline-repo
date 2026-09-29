# 12_execution / 04_hotspot_register — PW-C serialized integration slot

Timestamp: 2026-09-29T04:20Z · Author: Writer Coordinator · Slot order fixed by `../10_dispatch/parallel_plan.md`:
`W05 persistence → W01 shell → W02 kernels → W03 → W04`.

`main.ts` and `surfaces/m0-controller-composition.ts` are **writer-forbidden**. Any Writer that needs a
change there files `writer-output/<WS>/SERIALIZED_HOTSPOT_REQUEST.md`; the Coordinator applies it in
slot order and re-runs the regression selection after each application. Nothing is applied before its
slot; nothing is applied by the requesting Writer.

| Slot | Owner | Request | Status | Notes |
|---|---|---|---|---|
| 1 | W05 persistence | (none filed yet) | AWAITING | W05 in flight |
| 2 | W01 shell | **filed: Today LEFT-region `Filter · …` summary not re-rendered after `today.filter`** (from `W01_HANDOFF.md` §5.3, W01 residual round instructed to file it) | PENDING W01 residual | W01-owned presentation staleness; requires `m0-controller-composition.ts`. Verified *not* to be a shell-mechanics regression — the fix is inside the Today mount path. |
| 3 | W02 kernels | (none filed yet) | AWAITING | W02 in flight |
| 4 | W03 | (none filed yet) | AWAITING | W03 in flight — packet §11 notes the worktree delta removes the `if(consumer!=='enterprise'){…}` gate; W03 must report which branch it assumed before any hotspot hunk is applied here |
| 5 | W04 | (none filed yet) | AWAITING | W04 in flight |

## Rules applied at application time

1. Verify the request still applies against the then-current `main.ts` / `m0-controller-composition.ts`
   (sibling work has moved on; hunks may need re-basing).
2. Confirm the hunk does not break a negative case named in the request or in the requesting packet §11.
3. Confirm the 3 protected canonical deltas remain byte-identical in their non-requested parts
   (`main.ts` carries a pre-existing `PRE_EXISTING_CANDIDATE_DELTA__OWNER_ADJUDICATION_REQUIRED`
   change that must not be disturbed).
4. Apply, rebuild (`tools/writer-serial.sh node tools/build-runtime.mjs`), re-run
   `tools/writer-regression-sweep.mjs --label PW-C-<slot> --baseline writer-output/_coordinator/REGRESSION_pre-writer-baseline.json`.
5. Record the application here with commit + tree + the regression delta.

## Applications to date

| Slot | Applied at commit | Tree | Regression delta | Result |
|---|---|---|---|---|
| — | — | — | — | none yet |
