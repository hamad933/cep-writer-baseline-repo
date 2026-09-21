# CEP Writer Git Workflow — Presentation CORR02

**Owner decision:** `OD-20260921-066`

## Exact binding

- Repository: `hamad933/cep-writer-baseline-repo`
- Baseline branch: `main`
- Exact base commit: `44f922e29e02363d00cc31ae6daeeca01dc9081a`
- Candidate branch: `writer/presentation-corr02-google-ai-studio`
- Exact Product parent: `5205d2a3d0db441e030a046bc831549728cc95b9c09ff9d2fa4233ba1672fd66 / 272`

## Writer write boundary

The Writer may:
- modify authorized genuine Product paths;
- commit and push to the exact candidate branch above;
- write small text/machine-readable handoff evidence under `writer-output/presentation-corr02/`.

The Writer may NOT:
- push directly to `main`;
- merge/rebase candidate work into `main`;
- create release/acceptance tags;
- edit `cep-writer/` Controller authority/reference files;
- mutate live Drive governance;
- self-promote/accept the result;
- commit candidate/evidence/baseline ZIPs, large screenshot sets, `node_modules`, build caches, or generated dependency trees unless the Controller explicitly amends this mission.

## Result identity

The Writer result is the exact candidate-branch HEAD SHA plus its Product delta and bounded handoff files. The Controller audits that exact HEAD. A rejected result leaves `main` unchanged. Only the Controller may later integrate an accepted Product delta to `main` and refresh `cep-writer/` for the next mission.


## Google AI Studio branch-safety rule

Google AI Studio supports GitHub import/sync, but target-branch selection is not treated as guaranteed by this mission.

Before importing into AI Studio:
- if AI Studio explicitly lets you select `writer/presentation-corr02-google-ai-studio`, select it;
- if it does not expose a branch selector and uses the repository default branch, temporarily set the GitHub repository default branch to `writer/presentation-corr02-google-ai-studio` **before import**;
- never let AI Studio write to `main`;
- after the Writer handoff and Controller audit, restore the repository default branch to `main`.

Changing the repository default branch does not merge branches and does not alter `main` bytes.
