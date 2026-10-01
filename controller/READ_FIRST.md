# CEP — READ FIRST

**Role:** canonical GitHub Controller bootstrap index  
**Authority mode:** `GITHUB_CANONICAL`  
**Cutover event:** `CEP-GITHUB-CUTOVER-2026-10-02-001`

## Mandatory boot

Before every substantive CEP Controller action:

1. fetch the actual remote `writer/mi-serial` HEAD/tree;
2. read `controller/authority/AUTHORITY_STATUS.json`;
3. read `controller/state/CURRENT_STATE.md`;
4. read `controller/CONTROLLER_GOVERNANCE.md`;
5. resolve every applicable ACTIVE / ACTIVE_PLATFORM_GATED row in `controller/authority/OWNER_DECISION_LIVE_REGISTER.csv`;
6. read `controller/authority/EXECUTION_CARRIER_ROUTE_AUTHORITY.md` for Writer/carrier work;
7. read the exact current mission/profile/intake/owner-lock/oracle/evidence required by the task.

Re-refresh when source/hash, Writer/Auditor output, blockers, Owner decisions, shared owners, donor parity, readiness or continuity changes.

## Authority

`latest explicit Owner decision → controller/state/CURRENT_STATE.md → exact Controller-accepted source/evidence → live Owner decisions/locks → current mission/profile/intake → governed oracle/donor → classified historical evidence → chat memory`.

No filename, timestamp, checkpoint label, Writer PASS, screenshot or green test creates authority.

## Plane boundary

- `controller/**` = sole mutable Controller governance/state/recovery plane.
- `cep-writer/**` = derived Writer execution inputs only.
- Product source remains distinct from governance/control state.
- Google Drive = compatibility/bootstrap/navigation + immutable/history/evidence/heavy-output custody; never a second mutable Controller authority.

## Current execution carrier

`OD-20260928-085`:
- `ROUTE-MIMO-AGENT`
- exactly one persistent sequential Writer
- branch `writer/mi-serial`
- W01 → W02 → W03 → W04 → W05
- Controller performs independent audit
- historical parallel/per-Surface/WM plans are lineage/dependency evidence only.

## Current truth ceilings

- H03 propagation/falsification: `NOT_PROVEN`.
- Enterprise shared relation integration: OPEN Product defect.
- Runs causal flow: `UNRESOLVED_RUNTIME_OR_HARNESS_INTEGRATION`.
- Product acceptance/main merge/release/deploy: NOT_AUTHORIZED.
- stack: `STACK_EXPANSION_LOCKED__STACK_NOT_FROZEN`.

Google Drive entrypoints are compatibility pointers under `OD-20261002-086`; when arriving through Drive, follow them back to this GitHub plane.
