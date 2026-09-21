# CEP Writer Git Workflow - Presentation CORR02

Owner decisions: OD-20260921-062 / 066 / 067 / 068 / 069.

- repository: hamad933/cep-writer-baseline-repo
- Controller-bound Writer baseline: main@ef7de5e05eee79d1302a84c47ef41ba5e94364c6
- candidate branch: writer/presentation-corr02-google-ai-studio
- Product parent: 5205d2a3d0db441e030a046bc831549728cc95b9c09ff9d2fa4233ba1672fd66 / 272

## Google AI Studio transport

Built-in AI Studio GitHub sync is MAIN-only for this workflow and is not the mission branch transport.

Create/use a separate manual Git clone of the exact candidate branch. All mission edits, tests, preview, screenshots and final handoff operate there.

Before Product mutation verify remote, branch, exact starting HEAD, clean status, baseline ancestry, Product identity and Writer self-containment.

No GitHub write credential is needed before final Owner visual approval. After approval, use Git CLI plus a fine-grained PAT stored only as a non-echoing Secret/environment variable if authentication is required. Never print, paste, commit, write to a file, or persist the token in the remote URL.

## Branch law

Writer may mutate only mission-authorized Product paths and bounded outputs under `writer-output/presentation-corr02/`.
Never write to main, merge/rebase into main, release, self-promote, mutate live Drive governance, or use built-in sync to publish CORR02.

Execution is serialized by the small-batch plan in `CURRENT_MISSION.md`.
