# CEP Writer Baseline Repository

This repository is the self-contained execution baseline for CEP Writers. It is not the live Controller control plane and a Git commit is never CEP Product acceptance by itself.

## Start here

Writers must start at `cep-writer/START_HERE.md`.

Historical Foundation/M0 handoffs and checkpoints are indexed at `docs/history/HISTORICAL_LINEAGE_INDEX.md` and remain recoverable from Git history; they are not current Writer authority.

## Directory map

- `stack/native-typescript/` - authored Product source.
- `stack/local-runtime/` - local runtime/provider implementation and acceptance seed inputs.
- `tests/`, `tools/`, `contracts/`, `profiles/` - executable verification, reusable contracts and current Surface profiles.
- `cep-writer/` - curated Writer-facing baseline rules, references, profiles, domain/oracle inputs and repository workflow.
- `authority/` - mixed traceability/intake/build-test authority corpus. It is not a blanket Writer reading set.
- `assurance/` - retained verification/build-test inputs and receipts; presence never creates acceptance authority.
- `archaeology/` - classified donor/reuse evidence; never a current implementation target by filename alone.
- `writer/` - reusable Writer templates/checklists.
- `writer-output/` - historical/mission-bounded Writer handoff material pending zero-loss archival review.

## Authority boundary

For Writer execution, use the curated chain under `cep-writer/`, the exact mission overlay on the mission branch, applicable SurfaceProfiles/domain oracles, governed visual-reference binaries and mission-bound Owner decisions.

Visual references are Presentation authority inputs. They are not evidence screenshots and never override domain/data/provider truth.

Google Drive remains the live Controller/governance/custody plane. Required Writer inputs must be local to GitHub before mission launch.

## Git lifecycle

`main` is the Controller-bound working/correction baseline. Mutating Writer work occurs only on an exact Controller-bound mission branch. Writers never self-merge, release, promote, or write directly to `main`.

## Baseline verification

```sh
python3 cep-writer/tools/verify_repo.py
npm ci
npm run build:runtime
npm test
npm run check
npm run runtime:check
```

Environment-specific gates remain truthful; do not mutate Product merely to satisfy a broken environment or stale harness.
