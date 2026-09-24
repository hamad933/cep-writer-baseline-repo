# Git / Writer Workflow — Current Baseline

- `main` is the Controller-bound **working/correction baseline reference**; resolve its exact HEAD/tree at mission binding.
- The immutable Product-source ancestor is `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a` / tree `3101c06901dbdaff9602fea8098efb9c34575149`; do not confuse it with current repository `main`.
- Product source remains `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641 / 273`.
- `main` is not automatic Product acceptance authority.
- Every mutating Writer mission starts from the exact Controller-bound `main` commit or an independently audited successor named by the mission overlay.
- Each mission uses one mission-specific candidate branch.
- Writers never push directly to `main`, merge to `main`, create releases, deploy, self-promote, or mutate live Controller governance.
- `main` carries reusable Product/build/test/reference inputs; the mission branch carries the exact immutable task overlay.
- Verified incremental continuation is preferred for correction loops when parent HEAD/tree/Product identity is exact; fresh lanes use the Controller-bound Capsule method when required.
- Heavy generated evidence stays in Google Drive with hash/source-bound receipts; required Writer inputs remain local in GitHub.
