# CEP — CONTROLLER SUCCESSION HANDOFF

**Role:** supporting continuity only — never authority  
**Current phase:** `GITHUB_CUTOVER_COMPLETE__DRIVE_COMPATIBILITY_PROVEN__PRODUCT_EXECUTION_BINDING_NEXT`

A successor must not inherit conclusions from this file blindly.

## Mandatory recovery
1. fetch actual remote `writer/mi-serial` HEAD/tree;
2. read `controller/authority/AUTHORITY_STATUS.json`;
3. read `controller/READ_FIRST.md`;
4. read `controller/state/CURRENT_STATE.md`;
5. read `controller/CONTROLLER_GOVERNANCE.md`;
6. resolve all applicable rows in `controller/authority/OWNER_DECISION_LIVE_REGISTER.csv`;
7. read exact mission/profile/oracle/evidence required by the task.

## Current durable routing
- active carrier: `ROUTE-MIMO-AGENT`;
- controlling topology: `OD-20261002-087` — parallel disjoint lanes, one mutating Writer per exact bounded Surface/lane, shared hotspots/dependencies/final wiring serialize, value-weighted under `OD-20260916-043`;
- `OD-20260928-085` (one persistent sequential Writer on `writer/mi-serial`; W01 → W02 → W03 → W04 → W05) is historical task-specific lineage only;
- offload/operating model: `CHATGPT PRECOMPUTE → PRIMARY SPOT-CHECK/ADJUDICATE → MIMO EXECUTE → CHATGPT INDEPENDENT REVIEW → PRIMARY INTEGRATE` (`controller/12_execution/chatgpt_offload_queue/`);
- Controller independently audits results;
- historical parallel/WM plans are lineage/dependency evidence only; the current DAG is rebuilt from the 23-Surface evidence-reuse matrix.

## Current cutover truth
- until `AUTHORITY_STATUS.classification=GITHUB_CANONICAL`, Drive remains live Controller authority;
- future sole mutable GitHub Controller plane is `controller/**`;
- `cep-writer/**` is derived Writer input only;
- post-cutover Drive role is compatibility pointer + history/evidence under `OD-20261002-086`.

## Open truth ceilings
- H03 propagation/falsification remain `NOT_PROVEN`;
- Enterprise relation shared-owner integration remains an open Product defect until separately corrected and proven;
- Product acceptance, main merge, release, deployment and stack freeze are not implied by control-plane cutover.

This handoff intentionally contains no independent next-action authority. The current state file controls.

## Cutover completion

GitHub-direct successor proof: PASS. Drive-entry successor proof: PASS 16/16. Drive is compatibility/history/evidence only. The next Controller binds exact lane scope/order from the current 23-Surface evidence-reuse matrix and the final OD-087 DAG; this handoff does not independently choose milestones.
