# E17 AnalyticalCompare — Bounded Correction Result

Status: `CORRECTED_CANDIDATE_READY_FOR_CONTROLLER_REVIEW`

The correction is limited to canonical identity integrity and deterministic provider data. It does not update registries, readiness, Writer intakes, Surface Release Authority or CURRENT_CONTROL.

## Closed defects

- every supplied pair is re-derived from the registered provider before resolve/diff; forged pairId, keys, domainKind, comparatorVersion and pinned/mutable metadata are rejected;
- invalid-pair error receipts use `UNVERIFIED` rather than claiming a forged pair ID as canonical;
- RQ/Results refs and pair IDs now use collision-safe type-tagged canonical identity encoding;
- provider boundaries detect key collision/non-determinism;
- duplicate field paths are rejected before diff;
- normalized analytical values are restricted to deterministic plain data; Date/Map/Set/class instances/sparse arrays/undefined/BigInt/Symbol/function/NaN/Infinity are rejected;
- failed pair/session replacement is fail-atomic.

## Evidence

- bounded correction: `20/20 PASS + 8/8 static`
- original AnalyticalCompare executable: `56/56 PASS`
- AnalyticalCompare browser: `21/21 PASS`
- current-candidate legacy browser: `6/6 PASS`
- Model: `210/210 PASS`
- current-candidate Contracts projection: `168/168 PASS`
- current-candidate `npm run check`: `PASS`
- historical E17 browser evidence: restored byte-for-byte after current-candidate regression.

Readiness remains unchanged until Controller acceptance/reconciliation.
