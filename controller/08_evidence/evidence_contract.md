# 08_evidence / evidence_contract + lineage + checkpoints

Timestamp: 2026-09-29T01:30Z · Status: contract **PASS** (defined); enforcement infrastructure **NOT_STARTED**

## Evidence contract (mission §27)

Every evidence item binds, where applicable: candidate (canonical source identity), commit, tree,
workspace, surface, test/flow, environment, browser, timestamp, source, screenshot/capture,
expected outcome, actual outcome.

Naming rule: `evidence/<workspace>/<surface>/<flow>-<YYYYMMDDTHHMMSSZ>-<candidate8>.<ext>`.
Forbidden: orphan screenshots, orphan claims, "passed" without reproducible context.

## Lineage model

- `candidate = CANONICAL_SOURCE_TREE_SHA256:<480dbe…>` for product-source-bound claims (273-file
  parent tree). A worktree hash is admissible only when explicitly labeled `WORKTREE_VARIANT` with
  its own hash (e.g. `2ebcbf89…/287`) and never presented as canonical.
- Every receipt must carry `canonicalSourceFileCount`; a count/hash pair that does not recompute is
  **LINEAGE** failure (live example: receipt candidate `a676f663…` — see `07_browser/browser_contract.md` §3).
- `commit`/`tree` binding: record `git rev-parse HEAD` + `HEAD^{tree}` at capture time
  (current: `48fec276…` / `fbe50585…`).
- Test binding: record the exact command + tool version (e.g. `node tools/browser-conformance.mjs`,
  Playwright 1.62.1).

## Checkpoint model

| Checkpoint | Contents | Binding |
|---|---|---|
| C-BOOT | `00_bootstrap/*` statuses | environment + credential presence (no values) |
| C-SOURCE | `01_sources/*` inventory + retrieval manifest | Drive IDs, hashes, cache paths |
| C-TRUTH | `02_current_truth/*` | canonical identity + census |
| C-HISTORY | `03_historical/*`, `04_rcf/*` | provenance per recovered item |
| C-FOUNDATION | `05_foundation/*`, `06_workspaces/*` | ownership decisions |
| C-BROWSER | `07_browser/*` | re-run receipts bound to exact candidates |
| C-PACKET | `09_writer_forge/*` | five packets, each with completion-proof template |
| C-DISPATCH | `10_dispatch/*` + gate | dependency/parallel plan + gate report |

Rollback/recovery expectation for Writers: candidate-only outputs; no self-merge; checkpoint commits
on the serial branch (`writer/cep-serial` → `writer/mi-serial` per K-06); recovery = re-dispatch from
last checkpoint with exact candidate re-binding.

## Artifact manifest

This control tree itself is the initial artifact manifest (self-indexing via `README.md`).
Drive-side evidence custody remains the Owner/Controller plane (mission: Drive is governance/custody;
required Writer inputs must be local to GitHub before mission launch).
