# CEP Writer Start Here — Current Working Baseline

Repository: `hamad933/cep-writer-baseline-repo`

## Identity

Repository execution baseline:
- ref: `main`
- exact repository HEAD: **resolve and record at mission binding**
- exact mission branch parent: supplied by the Controller mission overlay

Unchanged Product-source ancestry:
- Product parent commit: `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a`
- Product parent tree: `3101c06901dbdaff9602fea8098efb9c34575149`
- Product source: `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641 / 273 files`
- classification: `WORKING_CORRECTION_BASELINE__SALVAGEABLE_NOT_ACCEPTED`

Do not confuse the Product-source ancestor with the current repository `main` commit after governance/Writer-input-only integration commits.

This baseline is a required starting point for current correction Writers. It is **not** Product acceptance, release, deployment, or stack freeze.

## Mandatory local reads

1. `CURRENT_WRITER_BASELINE_STATE.json`
2. `CURRENT_POST_C03_FINDINGS.json`
3. `KNOWN_OPEN_GATES.md`
4. `WRITER_AUTHORITY_BASELINE.md`
5. applicable Owner-decision projection, SurfaceProfiles, domain oracles and visual references
6. exact immutable mission overlay

## Writer procedure

1. Verify the exact checked-out mission-branch parent and clean status before mutation.
2. Read the current findings and exact mission overlay before editing.
3. Read only the SurfaceProfiles/domain oracles/visual references/Owner-decision subset applicable to the mission.
4. Mutate only the mission allowlist.
5. Preserve shared-owner boundaries and all protected truths.
6. Keep heavy generated evidence in governed custody with exact receipts.
7. Never push directly to `main`, self-merge, self-promote, release, deploy, or mutate live Controller governance.

## Current execution stage

Post-C03 source binding is closed. Current-baseline diagnostic browser/visual/source challenges expanded the finding set but did not create Product acceptance.

The first correction wave remains `D03A / D03B / D03C / D04`, with the current finding projection routed into the existing D03-D14 DAG rather than creating a parallel DAG.

`stack/native-typescript/main.ts` and `stack/native-typescript/surfaces/m0-controller-composition.ts` remain serialized final-convergence hotspots until D13 unless an exact Controller mission explicitly changes that.
