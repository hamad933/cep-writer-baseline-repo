# CEP W01/W02 C025 CURRENT HANDOFF v1.0

CLASSIFICATION: CURRENT EXECUTION HANDOFF / NOT ACCEPTANCE / NOT FREEZE

## Read first
- `CEP_CURRENT_CONTROLLER_STATE_v1.7.md`
- `CEP_W01_W02_C025_FORENSIC_EXECUTION_REPORT_v1.0.md`
- reusable Colab/Drive standard + runtime defect triage playbook + checklist.

## Do not redo
Do NOT rerun:
- predecessor bootstrap;
- CELL00;
- CELL01;
- completed C025 correction waves;
- C025 test suites solely because Drive custody is pending.

## Proven
C025 core and PHP Integration PASS on corrected successor content.

Canonical successor content:
- name: `CEP_W01_W02_PRODUCTION_KNOWLEDGE_WORKBENCH_FORGE_v1.1.5.2_C025_CORRECTED_SUCCESSOR_CANDIDATE.zip`
- ZIP SHA: `bdd7343bc2ca34e5ea0785ddce53eaaf7eff0164b93c78b7851d24b3eb6c4626`
- size: 3,061,541
- source tree: `5a5c083594dbc76177e2c5039ac6f55ba69e31c6`
- source manifest: `3f9490517e0d98f0f5bb816d527bf43aa047ea5b78f62eedf728c8397d7063e4`
- source files: 592
- delta vs predecessor: exactly 9 files.

## Current blocker
Drive server-side object custody is not proven.
FUSE readback is exact but Drive API/connector does not yet expose the successor object/File ID.

## Exact continuation
1. Use the canonical local `/content` ZIP, do not rebuild.
2. Query intended `01_INPUT` for an existing exact-name candidate before create.
3. If exact object exists, API download it and SHA verify.
4. If absent, perform a single server-side Drive upload/create with bounded retry/backoff for `userRateLimitExceeded`.
5. Obtain Drive File ID.
6. API redownload the File ID and verify exact canonical SHA and size.
7. Verify parent folder ID `1H7COFFWQBAuMwnIFO2z14mivZLOcLW_H`.
8. Persist execution identity receipt.
9. Fresh-extract/download successor from File ID to a new `/content` path.
10. Reverify ZIP SHA, 592-row source manifest, manifest SHA, and source tree.
11. Only then proceed to CELL03; CELL04 only after CELL03 evidence is reviewed.

No GitHub mutation. No Owner acceptance/freeze/merge/release/deploy.
