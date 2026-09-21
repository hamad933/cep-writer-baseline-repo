# CEP Writer Baseline Repository

This repository is the self-contained execution baseline for CEP Writers. It is not the live Controller control plane and a Git commit is never CEP Product acceptance by itself.

## Start here

Writers must start at `cep-writer/START_HERE.md`.

Do not use the historical root file `README_START_HERE_AR.md` as current Writer authority; it is retained lineage from an earlier Foundation epoch.

## Directory map

- `stack/native-typescript/` - authored Product source.
- `stack/local-runtime/` - local runtime/provider implementation and acceptance seed inputs.
- `tests/`, `tools/`, `contracts/`, `profiles/` - executable verification, reusable contracts and current Surface profiles.
- `cep-writer/` - curated Writer-facing authority, mission-independent rules, reference images, SurfaceProfiles, domain/oracle inputs and repository workflow.
- `authority/` - mixed traceability/intake/build-test authority corpus. It is NOT a blanket Writer reading set. Read only exact files named by the mission, curated Writer packet, a verifier, or an applicable contract. See `authority/README.md`.
- `assurance/` - retained verification/build-test inputs and receipts; presence never creates acceptance authority.
- `archaeology/` - classified donor/reuse evidence; never a current implementation target by filename alone.
- `writer/` - reusable Writer templates/checklists.
- `writer-output/` - mission-bounded Writer handoff/evidence only when a mission branch authorizes it.

## Authority boundary

For Writer execution, use the curated chain under `cep-writer/`, especially `WRITER_AUTHORITY_BASELINE.md`, `authority/WRITER_OWNER_DECISIONS.csv`, the mission overlay on a mission branch, the exact SurfaceProfiles/domain oracles, and the governed visual-reference binaries.

Visual reference images are Presentation authority inputs. They are not evidence screenshots and they never override domain/data/provider truth.

Google Drive remains the live Controller/governance/custody plane. Writers should not need live Drive reads for required task inputs.

## Git lifecycle

`main` is the Controller-bound Writer baseline. Mutating Writer work occurs only on an exact Controller-bound mission branch. Writers never self-merge, release, promote, or write directly to `main`.

See `cep-writer/GIT_WORKFLOW.md` for the full branch lifecycle.

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
