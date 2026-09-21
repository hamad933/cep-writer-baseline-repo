# CORR02 Task-Packet Overlay

This candidate branch is derived exactly from bootstrap baseline commit:
`44f922e29e02363d00cc31ae6daeeca01dc9081a`.

The existing `cep-writer/REPOSITORY_MANIFEST.json` remains the immutable manifest for that bootstrap baseline. It is intentionally not rewritten merely because Controller-owned task instructions were corrected after bootstrap.

This branch adds a **Controller task-packet overlay only**:
- branch workflow under `OD-20260921-066`;
- corrected repository-mode mission wording;
- candidate-branch output boundary.

These overlay files are not Product source. Product identity must still be verified through `PARENT_IDENTITY.json` and the exact Product paths. No Product bytes were changed by this task-packet correction.

Current candidate branch:
`writer/presentation-corr02-google-ai-studio`
