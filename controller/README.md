# CEP CONTROLLER CONTROL PLANE

**Current phase:** `EXISTING_AUDIT_CORPUS_RECONCILIATION__BOUNDED_GAP_FILL__PARALLEL_DAG_REBIND`  
**Current authority status:** read `controller/authority/AUTHORITY_STATUS.json` first.

This directory is the dedicated Controller plane being converged into the future canonical GitHub control plane required by `OD-20261002-086`.

## Plane separation
- `controller/**` — Controller governance/state/recovery/evidence-control plane.
- `cep-writer/**` — derived Writer execution inputs only.
- `stack/native-typescript/**` — Product source.
- historical `authority/**` / archive material — lineage/evidence unless explicitly current.

No file becomes authority because of its name, path, timestamp, `CURRENT`, `FINAL`, `PASS`, or proximity to HEAD.

## Bootstrap
1. Fetch actual remote `writer/mi-serial`.
2. Read `controller/authority/AUTHORITY_STATUS.json`.
3. Read `controller/READ_FIRST.md`.
4. Follow the PRE_CUTOVER vs GITHUB_CANONICAL branch exactly.
5. Read `controller/state/RESUME.md`.
6. Resolve current Owner decisions and exact task evidence.
7. Never launch from historical dispatch artifacts.

## Current ROUTE-MIMO-AGENT topology
`OD-20261002-087`: parallel disjoint lanes — one mutating Writer per exact bounded Surface/lane; shared hotspots/same-owner/dependencies/final wiring serialize; value-weighted under `OD-20260916-043`; isolated per-lane candidate branches/worktrees. `OD-20260928-085` (ONE persistent sequential Writer → W01→W05) is historical task-specific lineage. Historical parallel/per-Surface material retains dependency/collision wisdom but is not self-launch authority: launch requires the current evidence-reuse matrix → final DAG → exact packet under `RECOVERY_GATE_PASS`.

Nothing in this README creates Product acceptance, cutover, release, deployment or stack freeze.
