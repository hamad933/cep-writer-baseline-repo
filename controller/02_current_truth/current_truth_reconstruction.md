# 02_current_truth / current_truth_reconstruction (COMPLETED for all locally verifiable facts)

Timestamp: 2026-09-29T02:20Z · Method: DISCOVER → INVENTORY → CLASSIFY → RECONCILE → VALIDATE
Statement set v2 (v1 superseded; all statements carry source + confidence).

## Verified identity chain (the backbone of all evidence binding)

| Candidate | Identity (algorithm `path\0size\0sha256\n`) | Files | Bound to | Verified how |
|---|---|---|---|---|
| CANONICAL product source | `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641` | 273 | parent commit `293dd1e0…` / tree `3101c069…` | recomputed byte-exact from `git show` |
| CLEAN HEAD | `3f3ad1e06bd3e8e8363b8425d741e85ac16236f78d854e59817a04a48d724e20` | 287 | HEAD `48fec276…` / tree `fbe50585…` | recomputed from git |
| WORKTREE VARIANT | `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` | 287 | live tree incl. 3 unadjudicated deltas | recomputed via `tools/source-tree-identity.mjs` |

## Statements (each: claim — source — confidence)

1. **Repository identity** — current executable CEP = `hamad933/cep-writer-baseline-repo`; the Laravel
   line `Cybersecurity-Education-Platform` = HISTORICAL provenance only. Owner directive + live repo +
   successor audit A1-A6. HIGH.
2. **Canonical source** — `480dbe…/273` exactly reproduced. Owner directive + independent recompute. HIGH.
3. **Branch state** — `origin/main@37c4d765…`; checkout `writer/cep-serial@48fec276` (tree `fbe50585…`);
   required serial lineage `main → writer/cep-serial → writer/mi-serial` (Owner hard rule 2026-09-29);
   `writer/mi-serial` does not exist yet. `git` + successor C-1. HIGH.
4. **Runtime stack** — Node 22.16.0 native-TS/ESM, Playwright 1.62.1 (package-local Chromium headless
   shell; `/usr/bin/chromium` absent = ENVIRONMENT delta vs historical receipts), @xterm/xterm 6.0.0,
   `node:sqlite`, committed `dist/`, no Docker/devcontainer, no PHP/Laravel/PG. Live measurement. HIGH.
5. **Worktree state** — 186 modified + 3 untracked items fully classified into 8 categories
   (`08_evidence/worktree_disposition.md`): 3 canonical-source deltas (null-safe lock write +
   enterprise-gate removal in `main.ts`; `min-height` layout deltas in `extensions.css`;
   `import.meta.url` asset fix in `xterm-renderer.ts`), 174 regenerated `dist/`, 5 regenerated
   evidence receipts (originals preserved), 2 Writer-input-chain evolutions, 1 tooling edit, 1
   measurement file, 2 unattributed (quarantined). Nothing reverted. HIGH on state; attribution
   MEDIUM (predecessor-Controller vs Owner work indistinguishable by timestamp alone).
6. **Worktree/manifest mismatch explained** — `verify_repo.py REQUIRED_INPUT_MISMATCH` = the manifest
   binds the pre-drift state; cause fully accounted for by category 5. Restore-or-rebind remains the
   single Owner decision. HIGH.
7. **Drive truth** — live governance plane = Drive `cep_building_mgm` (`1mt_0MSz…`); `00_CONTROLLER`
   holds CURRENT_STATE.md (sole live state), CONTROLLER_GOVERNANCE.md, OWNER_DECISION_LIVE_REGISTER.csv
   (111 rows: 96 ACTIVE + 2 ACTIVE_PLATFORM_GATED). `/cep_building_mgm/` is not a local path. HIGH.
8. **Drive access** — service-account route SUCCESS (list/get/export all 200); user-OAuth route dead
   (`invalid_grant`) = historical conflict C-5 reproduced. HIGH.
9. **Zero-loss corpus truth** — `STAGE2_OBLIGATIONS_MASTER.csv` = **exactly 8,651 rows / 23 surfaces /
   12 source layers**, ingested at row level (`03_historical/requirement_ledger.csv`). Historical
   workspace partition = W01 711 / W02 1,485 / W03 2,183 / W04 1,445 / **W05A 1,427 / W05B 1,400**.
   HIGH.
10. **Workspace law reconciliation (RC-WS-1)** — directive mandates exactly five workspaces; corpus
    uses six (W05A/W05B). Resolution: canonical W05 = {health, processing, validation, manual_ai} ∪
    {audit, backup, configuration, releases} = 2,827 rows, sub-lanes preserved for parallelism.
    The 40-row capability matrix independently labels workspaces exactly as the directive does
    (`W01:Today`, `W01:Shared Global Shell`, … `W05:AI Bridge / Manual AI Bridge`). HIGH.
11. **Surface taxonomy** — 23 surfaces; `health` and `processing` have profiles + obligations but no
    `surfaces/<name>/` directory; resolution pending B-2 evidence stream. MEDIUM (location), HIGH (count).
12. **Browser truth** — re-run bound to `c82cec63…` over genuine `localhost-http` transport:
    6 flows, 1 PASS / 5 FAIL, classified PRODUCT 1 / HARNESS 1 / UNKNOWN 3 (`07_browser/failure_taxonomy.md`).
    The prior orphaned receipt (`a676f663…`) is preserved as historical evidence. HIGH.
13. **RCF truth** — 12 historical real-consumer artifacts recovered at content level; 0 current-candidate
    real-consumer or fixture runs exist; 23/23 surfaces have defined current proof obligations. HIGH.
14. **Decision truth** — 102 applicable Owner decisions recovered at row level (all ACTIVE-class;
    79 carry supersession provenance); register total 111 rows (count drift explained by
    applicability filtering = conflict C-4 closed). HIGH.

## Explicit non-claims (unchanged)

No Product acceptance; no claim that historical proofs are current proof; no adoption of old control
models; no claims about Drive document bodies not yet ingested by the historical-mining streams.
