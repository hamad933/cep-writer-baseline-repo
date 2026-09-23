# Git / Writer Workflow — Current Baseline

- `main` is the Controller-bound **working/correction baseline** at `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a`.
- `main` is not automatic Product acceptance authority.
- Every mutating Writer mission starts from the exact Controller-bound `main` commit or an independently audited successor.
- Each mission uses one mission-specific candidate branch.
- Writers never push directly to `main`, merge to `main`, create releases, deploy, self-promote, or mutate live Controller governance.
- `main` carries reusable Product/build/test/reference inputs; the mission branch carries the exact immutable task overlay.
- Verified incremental continuation is preferred for correction loops when parent HEAD/tree/Product identity is exact.
- Heavy generated evidence stays in Google Drive with hash/source-bound receipts; required Writer inputs remain local in GitHub.
