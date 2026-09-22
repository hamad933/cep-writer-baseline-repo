# CEP SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE v1

Purpose: give a CEP Writer one exact, locally usable inbound workspace artifact instead of connector-driven per-file repository assembly.

Core lifecycle:

`Controller exact parent + task packet -> capsule branch -> GitHub Action -> one artifact -> local clone from repo.bundle -> local development loop -> bounded final handoff`.

## Contents

A built capsule contains:
- `repo.bundle`: Git bundle containing the exact source commit/ref used for the mission.
- `CAPSULE_MANIFEST.json`: source/branch/tree/mission/binding identity and payload hashes.
- `SHA256SUMS.txt`: payload checksums.
- `bootstrap.sh` and `bootstrap.ps1`: local materialization helpers.
- `verify_capsule.py`: offline identity/payload verifier.
- `README_FIRST.md`: generated task-local bootstrap summary.

## Authority

The capsule is an execution transport and local workspace materialization mechanism. It never creates Product, mission, Owner-decision, acceptance, merge, release, or readiness authority.

The Controller must bind exact mission, parent/source identity, writable/read-only/prohibited scope, applicable Owner decisions, profiles/oracles/references, falsification gates, and Stop Gate before building a mission capsule.

## Writer law

- Download the capsule artifact once.
- Verify hashes and bundle integrity before mutation.
- Materialize locally and perform search/edit/build/test/browser/visual work locally.
- Intermediate screenshots/crops/diffs/videos/logs/build outputs remain local by default.
- GitHub is source/delta + small receipt transport, not bulk evidence transport.
- Heavy final generated custody goes to Google Drive only when materially required.
- Never treat connector or artifact success as Product acceptance.
- Never silently fetch live Drive/GitHub inputs to repair a capsule mismatch. Stop as `WRITER_CAPSULE_IDENTITY_MISMATCH`.

## C1 grandfathering

CORR02 C1 remains bound to its already prepared pre-capsule packet and is not repackaged by this method. The first downstream mission launched after accepted/clean C1 Controller adjudication must use this capsule method (or an explicitly accepted successor).
