# 01_sources / source_classification + retrieval_manifest

Timestamp: 2026-09-29T01:30Z

## Classification matrix (mission section 15 vocabulary)

| Source | Classification | Type | Confidence | Supersession / conflicts | Downstream impact |
|---|---|---|---|---|---|
| Owner directive (this mission) | CURRENT_OWNER_DIRECTIVE | decision | HIGH | supersedes prior Controller operating models | defines mission model W01-W05, gate, mutation policy |
| Canonical product identity `480dbe…/273` @ `293dd1e`/`3101c069` | CURRENT_VALIDATED | fact | HIGH (recomputed byte-exact) | none | binds all candidate/evidence identity |
| Worktree source identity `2ebcbf89…/287` files | CURRENT_VALIDATED | fact | HIGH | differs from canonical because live tree contains post-parent drift (287 vs 273 files) | must NOT be reported as the canonical identity |
| `origin/main@37c4d765` / `writer/cep-serial@48fec276` | CURRENT_VALIDATED | fact | HIGH | none | mission branch base |
| Dirty worktree + `verify_repo.py` REQUIRED_INPUT_MISMATCH | CURRENT_VALIDATED | evidence | HIGH | unresolved restore-or-rebind decision | blocks clean-baseline claim at dispatch |
| Drive auth Route A success / Route B `invalid_grant` | CURRENT_VALIDATED | evidence | HIGH | equals successor conflict C-5 (independently reproduced) | Drive access OK via A only |
| Successor archive README/01/02/06 | HISTORICAL_VALID | historical context + decision rationale | MEDIUM-HIGH (claims re-verified where possible) | its own law: live sources win on disagreement | bootstrap map, conflict register seed |
| `cep_building_mgm` corpus (S4/S5) | HISTORICAL_VALID / RECONCILED_DRIVE | decision/requirement/rationale | MEDIUM (indexed, not fully ingested) | temporal reconciliation required | requirement/decision ledgers |
| Legacy Mimo archive (S6) | HISTORICAL_VALID (unindexed content) | historical context | LOW on content (metadata only) | none | deferred deep mining |
| `Cybersecurity-Education-Platform` (S3) | HISTORICALLY_USEFUL_BUT_SUPERSEDED | implementation history | MEDIUM (per successor audit A1-A6) | superseded by S1 for implementation | donor/reference only — never execution target |
| Old control files (`authority/sources/control/**`, `00_PORTFOLIO_CONTROL`, PORTFOLIO REVIEWS) | HISTORICAL_VALID (protected) | historical control model | — | must NOT be adopted (mission §12/§36) | forensic evidence only |
| Zero-loss obligation corpus (S9) | CANDIDATE→validated-on-ingest | requirement | MEDIUM | rows must be reconciled to current surface state | Writer packet requirement inputs |
| Historical RCF proofs (S10) | HISTORICAL_VALID | evidence | MEDIUM | not current proof until re-run | `04_rcf` recovery register |

## Retrieval manifest (this pass)

| Retrieval | Bytes | Integrity | Cache |
|---|---|---|---|
| `mimoclaw_workspace_2.tar.gz` (local) | 31,218 | sha256 `aad681aa…742451a` = directive value ✔ | extracted to `/tmp/mimoclaw_workspace_2_inspect` (7 files) |
| `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` (Drive `1hsSFHJ8…`) | 12,563 | read via Route A, `alt=media` | `/tmp/opencode/cache/drive/` |
| Drive metadata queries (root list, folder children ×3, targeted searches ×4) | — | HTTP 200 | results recorded in `01_sources/source_inventory.md` |
| Legacy archive content (607 MB) | not retrieved | md5 present on Drive | DEFERRED — metadata-first policy (mission §10) |
| Probe scripts (`drive_probe.mjs`, `drive_probe2.mjs`, `drive_search.mjs`, `canonical_check.mjs`) | — | deterministic, secret-redacting | `/tmp/opencode/` (outside repo) |

No credential was written to cache, repo, or report. No historical Drive source was mutated.
