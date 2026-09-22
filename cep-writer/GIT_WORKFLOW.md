# Git / Capsule Workflow — CORR02 C2

- Repository: `hamad933/cep-writer-baseline-repo`
- Controller-prepared transport branch: `capsule/corr02-c2-w04-truth`
- Accepted Product parent: `ac888c7e622fdefdc4f958771b21db485e33f9fc`
- Accepted Product source: `5885c32a71c14b1b982ec8dcdadba4fafde40c78b2d9287f367f1ca28373f91d / 273`
- Writer starts from the downloaded Capsule artifact, not a network clone.
- Verify and materialize `repo.bundle` locally; work on the materialized exact transport HEAD.
- Do not edit `cep-writer/**`.
- Intermediate screenshots/logs/diffs stay local.
- GitHub Actions is not the correction loop; use managed execution only for final corroboration if materially required.
- Never write/merge `main`, release, deploy or self-promote.
- Finish `C2_CANDIDATE_ONLY__CONTROLLER_AUDIT_REQUIRED`.
