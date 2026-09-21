# CEP Writer Git Workflow — Presentation CORR02

Owner decisions: OD-20260921-066 / OD-20260921-067.

- repo: hamad933/cep-writer-baseline-repo
- baseline main: 7c499ba9c042dfc7aad7e7cd62757a6e1c75c243
- candidate branch: writer/presentation-corr02-google-ai-studio
- Product parent: 5205d2a3d0db441e030a046bc831549728cc95b9c09ff9d2fa4233ba1672fd66 / 272
- normalization validation: run 35555465695 PASS

Writer may mutate only mission-authorized Product paths and small handoff files under writer-output/presentation-corr02/. Never push to main, merge/rebase into main, release, edit cep-writer authority, mutate live Drive governance, self-promote, or commit heavy generated outputs.

If AI Studio cannot select a target branch and follows repository default branch, temporarily set default branch to the candidate branch before import; this changes no main bytes.
