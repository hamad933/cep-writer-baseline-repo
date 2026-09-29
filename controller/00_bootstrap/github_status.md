# 00_bootstrap / github_status

Timestamp: 2026-09-29T01:20Z · Status: **PASS_WITH_LIMITATION** (worktree dirty — pre-existing, unchanged by this mission)

| Check | Result | Evidence |
|---|---|---|
| `gh` CLI | available, v2.100.0 | `/usr/bin/gh` |
| `gh auth status` | authenticated as `hamad933` via `GITHUB_TOKEN`, active account, HTTPS git protocol | token value redacted in logs |
| Repository | `hamad933/cep-writer-baseline-repo` (origin fetch+push) | `git remote -v` |
| Remote visibility | PUBLIC | `gh repo view --json visibility` |
| Viewer permission | ADMIN | `gh repo view --json viewerPermission` |
| Default branch | `main` | `gh repo view --json defaultBranchRef` |
| `origin/main` tip | `37c4d765e1db854505c81cbd15b90d4715f6690e` ("controller: repair Writer packet execution identity truth") | `git rev-parse origin/main` |
| Local branch (checked out) | `writer/cep-serial` (tracking `origin/writer/cep-serial`) | `git branch --show-current` |
| Local HEAD | `48fec27608859d3a8e991b18b9f35f6e1dac1d19` ("checkpoint(LCORR-03): serialize shared final integration before D14") | `git rev-parse HEAD` |
| Local HEAD tree | `fbe50585c4173d47f319cecfb3105b160199d42d` | `git rev-parse HEAD^{tree}` |
| Remote refs | 94 branches | `git branch -r \| wc -l` |
| No history rewrite / no unrelated branch mutation | respected | mission performed read-only git operations |

## Worktree cleanliness — LIMITATION (pre-existing condition)

`git status` reports uncommitted modifications **that existed before this mission began**, e.g.
`assurance/BROWSER_CONFORMANCE_RECEIPT.json`, `assurance/CONTRACT_TEST_RESULTS.json`,
`assurance/MODEL_TEST_RESULTS.json`, `assurance/SCREENSHOT_MANIFEST.json`,
`assurance/W03_SEMANTIC_OWNER_VALIDATION.json`, `cep-writer/WRITER_INPUT_MANIFEST.json`,
`cep-writer/tools/verify_repo.py`, and multiple regenerated `dist/**/*.js`.

Consequence: `python3 cep-writer/tools/verify_repo.py` currently returns
`REQUIRED_INPUT_MISMATCH` (HASH_SIZE_MISMATCH on the modified assurance receipts and regenerated
dist files vs the manifest's bound hashes).

Classification: `CURRENT_VALIDATED` defect state; failure class **LINEAGE / EVIDENCE** drift, not
proven Product mutation. It is consistent with prior runs of `build:runtime` / test / browser
tooling regenerating committed evidence and dist in-place. Resolution is a Controller/Writer
decision (restore-or-accept-and-rebind) and is recorded in `11_gates/PRE_WRITER_DISPATCH_GATE.md`
as an open blocker; this mission made no attempt to repair or commit anything.
