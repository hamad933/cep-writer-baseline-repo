# RESUME — deterministic CEP Controller recovery

> Fetch the remote first. Chat/session memory is never the recovery source.

## 1. Verify repository identity
```sh
git fetch origin --prune
git checkout writer/mi-serial
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --short
```
The actual remote HEAD is current execution identity. Stored checkpoint SHAs are historical observations, not a substitute for the remote ref.

## 2. Resolve authority mode
Read `controller/authority/AUTHORITY_STATUS.json` then `controller/READ_FIRST.md`.
If `PRE_CUTOVER_MIRROR`, Drive is still live authority. If `GITHUB_CANONICAL`, the GitHub Controller files named by AUTHORITY_STATUS are the sole mutable control authority and Drive is pointer/history/evidence only. Never infer cutover from file presence.

## 3. Current route
`OD-20260928-085`: `ROUTE-MIMO-AGENT`, one persistent sequential Writer, `writer/mi-serial`, W01→W05, Controller independent audit. Historical parallel/per-Surface plans are not launch authority for this route.

## 4. Current phase
`CONTROLLER_ZERO_LOSS_CONVERGENCE`

Read `controller/state/CURRENT_STATE.md`, `controller/CONTROLLER_GOVERNANCE.md`, `controller/authority/OWNER_DECISION_LIVE_REGISTER.csv`, `controller/authority/EXECUTION_CARRIER_ROUTE_AUTHORITY.md`, and `controller/state/RESUME_STATE.json` only under its derived-snapshot ceiling.

## 5. Convergence order
1. deterministic Controller-plane boundary/bootstrap;
2. reconcile OD-085 pointers and historical topology;
3. H08 54-path disposition;
4. decision/profile projection repair;
5. 23 Surface packet revalidation;
6. browser harness/oracle correction + exact-source evidence;
7. clean-checkpoint prerequisites + GitHub-direct successor recovery proof;
8. explicit cutover;
9. post-cutover Drive pointer/history reconciliation;
10. Drive-entry successor proof reaches the same GitHub truth.

## 6. Never do
- do not use Writer Priority Matrix/per-Surface parallel waves as current MIMO launch authority;
- do not create a second mutable Controller authority under `cep-writer/**`;
- do not delete unresolved H08 residue merely to make git clean;
- do not mutate Product to satisfy a stale harness;
- do not upgrade H03 propagation beyond `NOT_PROVEN` without genuine-consumer proof;
- do not force-push or rewrite recovery history.
