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

`OD-20261002-087` ACTIVE:
- multiple Writers are allowed on the current agentic/Codespaces route;
- one mutating Writer per exact bounded Surface/lane at a time;
- run genuinely disjoint lanes in parallel under the current DAG/collision matrix;
- serialize shared hotspots, final wiring, same-owner work and true dependency edges;
- Controller/Coordinator owns exact source binding, collision control, result intake, independent audit and convergence;
- `OD-20260928-085` is historical task-specific lineage and is not current general serial-topology authority.

## Operating model (quota-efficient routing, 2026-10-02)

`CHATGPT PRECOMPUTE (broad read-only offload) → PRIMARY SPOT-CHECK/ADJUDICATE → MIMO WRITERS EXECUTE → CHATGPT INDEPENDENT REVIEW → PRIMARY INTEGRATE`.
Offload packets: `controller/12_execution/chatgpt_offload_queue/` (dispatch inputs only, never authority).
Role boundary: `controller/roles/CHATGPT_CONTROLLER_HELPER_OPERATING_PROFILE.md`. Consume returned analysis via `CONSUME → CHECK SOURCE BINDING → SPOT-CHECK → CHECK INVALIDATION → GAP-FILL → ADJUDICATE`; never restart completed archaeology.

## Current truth ceilings

- H03 propagation/falsification: `NOT_PROVEN` — dedicated proof cycle `H03R2-1` in progress under final zero-gap closure.
- Enterprise shared relation integration: **CLOSED by integrated proof** (`0102a35`; conformance 6/6 EXECUTED_PASS; SH-1 instance/selection facts + OD-044 oracle correction).
- Runs causal flow: CLOSED — `HARNESS_ORACLE_DEFECT__CLOSED_WITHOUT_PRODUCT_MUTATION` (source-bound `@490b6a40` / run `36947731860`); older "UNRESOLVED_RUNTIME_OR_HARNESS_INTEGRATION" claims are historical (@db41d0f-era).
- Product acceptance/main merge/release/deploy: NOT_AUTHORIZED.
- stack: `STACK_EXPANSION_LOCKED__STACK_NOT_FROZEN`.

Google Drive entrypoints are compatibility pointers under `OD-20261002-086`; when arriving through Drive, follow them back to this GitHub plane.
