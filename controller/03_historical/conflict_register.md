# 03_historical / successor_archive_index + conflict_register + supersession_register

Timestamp: 2026-09-29T01:30Z

## Successor/bootstrap archive index (SUCCESSOR_WORKSPACE_CANDIDATE)

- Path: `/home/codespace/mimoclaw_workspace_2.tar.gz` — 31,218 bytes
- Integrity: sha256 `aad681aae9f839a7213a5772b029e8aefe743ae5c081a8aedee9ba4ed742451a` = directive value ✔
- Extracted read-only to `/tmp/mimoclaw_workspace_2_inspect/` — **7/7 expected files present**
  (`README.md`, `01_BASELINE.md`, `02_RECONCILIATION.md`, `03_OPERATING_FOUNDATION.md`,
  `04_CODESPACE.md`, `05_HANDOFF.md`, `06_AUTHORITY_AUDIT.md`)
- Self-declared class: `SUCCESSOR_WORKSPACE_CANDIDATE__NOT_AUTHORITY` ("a map, not authority;
  live sources win — then fix this workspace"). Built 2026-09-29 by the ROUTE-MIMO-AGENT predecessor.
- Verification result: every measurable claim it makes (repo identity, `main@37c4d765`,
  `writer/cep-serial@48fec276`, canonical `480dbe…/273`, Drive folder ids, archive size, Node 22.16.0,
  C-5 OAuth defect) **matched this Controller's independent live measurements**. Classification
  upgraded: CANDIDATE → HISTORICAL_VALID (as map/evidence), never authority.

## Conflict register (seeded by successor §2, re-verified live)

| ID | Conflict | Re-verification this pass | Status |
|---|---|---|---|
| C-1 | Serial branch lineage: `writer/cep-serial` (OD-20260924-080) vs `writer/mi-serial` (OD-20260928-085) | `writer/cep-serial` exists locally/remotely @ `48fec276`; `writer/mi-serial` not present in the 94 remote refs reviewed; Owner hard rule 2026-09-29 fixes lineage `main → writer/cep-serial → writer/mi-serial` | CLOSED (Owner hard rule) — but `writer/mi-serial` creation is a pre-dispatch action item |
| C-2 | Two repositories/two stacks — which is current | live: current repo package `cep-foundation-forge v0.2.1c` matches `40_ACCEPTED_SUCCESSORS` naming; historical repo not used by any current execution path | CLOSED (S2 current, S1 historical) |
| C-3 | Node 22.16.0 vs 24.18.0 | live: 22.16.0 + `engines` pin in the executable repo | CLOSED (per-repo pinning) |
| C-4 | Owner-decision register counts drift (111 rows vs other counts) | **CLOSED by X-5 re-parse** (Mimo archive `REGISTER_REREAD.csv`, byte-identical): 111 = **101 ACTIVE + 2 ACTIVE_PLATFORM_GATED + 4 SUPERSEDED_DUPLICATE + 4 COMPLETED_TASK_SPECIFIC_NON_DURABLE**; 102 applicable rows = the Stage-2 applicability set | CLOSED — use re-parse; "96 ACTIVE" claims are stale |
| C-5 | Drive user-OAuth refresh defect vs session OAuth | **independently reproduced**: Route B `invalid_grant`, Route A works | OPEN (non-blocking) — see `00_bootstrap/drive_status.md` |
| C-6 | Live branch topology vs branch law | 94 remote refs incl. `capsule/*`, `controller/*`, `baseline/*`, `writer/*` families; no protection rules assumed | OPEN (policy item) |
| C-7 | **NEW** — worktree evidence/dist drift vs `WRITER_INPUT_MANIFEST.json` | `verify_repo.py → REQUIRED_INPUT_MISMATCH` live | OPEN (blocking for clean-baseline dispatch) |
| C-8 | **NEW** — browser receipt candidate `a676f663…` matches no known identity | measured `480dbe…` (canonical) and `2ebcbf89…` (live worktree) | OPEN (LINEAGE) |

### Conflicts recovered by the `cep_building_mgm` mining stream (2026-09-29T02:2xZ; full evidence in `cep_building_mgm_mining/RECONCILIATION_NOTES.md` + `DECISION_EXTRACT.md`)

| ID | Conflict | Evidence | Status / Controller adjudication |
|---|---|---|---|
| C-9 | Historical "accepted" product source `b8b5e4a5…/289 files` vs current `480dbe…/273` | mining DECISION_EXTRACT / CURRENT_STATE lineage | CLOSED-ADJUDICATED: historical hashes are provenance only; **never a current verification baseline**. Notable convergence: current branch tip `48fec276` == the historical "exact parent" |
| C-10 | Branch topology: 23 `writer/surface-*` + `writer/ds01-*` branches vs the `writer/cep-serial` serial regime | mining CORPUS_MAP | SUPERSEDED: serial regime wins. Open sub-item: **push policy for the new carrier is UNKNOWN — Owner decision required** (do not copy ROUTE-LOCAL no-push rules across carriers; carrier-isolation law K-06) |
| C-11 | OD-20260914-030/031 "Drive is the sole live governance root" vs repo-based controller authority | decision register rows | PARTIAL: governance *duties* are portable; the *location claim* must NOT be promoted to current law. Current truth: Drive = governance/custody plane; repo = executable baseline (README authority boundary agrees) |
| C-12 | Terminal/stack: historical "no real-PTY requirement" vs OD-20260917-049/050; `STACK_NOT_FROZEN` + open Windows proof cluster (PTY raw-I/O, HWND, input-direction) | register + lessons ledger | OPEN: stack explicitly NOT frozen; Windows proof cluster ties to C03-GATE-021 |
| C-13 | Fact-domain collision: PRE_D8/W5/GAP-0720 control events belong to the cybersecurity **content** campaign (`cep-fp-98e…`), not product engineering | mining KNOWLEDGE_EXTRACT | CLOSED-ADJUDICATED: content-campaign states ("C0 FROZEN / 152/152") carry **zero product-authority meaning** — kept in the corpus, excluded from product truth |
| C-14 | Historical result set: 17 prior writer results, `RECOVERABLE_VERIFIED_SUCCESSOR = 0`, 6 `NO_DURABLE_RESULT` surfaces, `MISSION_PACKET_SCOPE_CONTRADICTION` finding | POST_DS01 result audit (1gfru…) | OPEN (material for W01-W05 packets): no prior result may be presented as verified; per-surface disposition must be re-derived |
| C-15 | **X-4 branch-creation parent:** Mimo archive (OD-20260928-085 wording) binds `writer/mi-serial` created **from `main@37c4d765`**; the Owner hard rule 2026-09-29 binds lineage `main → writer/cep-serial → writer/mi-serial` (mi-serial **from `writer/cep-serial`**, never from main) | archive `DECISIONS_AND_REQUIREMENTS.md` vs successor C-1 hard rule; note `48fec276` appears in the archive only as "exact parent of the accepted DS01 branch" | **CLOSED-ADJUDICATED: Owner hard rule (fresher, Owner class) WINS**; OD-20260928-085 wording preserved as provenance (the hard rule itself says so). Dispatch action: create `writer/mi-serial` from `writer/cep-serial@48fec276` and bind its exact base at creation |

**Must-never-promote list** (adopted as a standing rule for all Writer packets): E19 presentation (REJECTED), M0 as-delivered handoff, all 17 writer results as acceptance, old Phase-2 prompts, old capsule authority payloads, `CURRENT_POST_C03_FINDINGS.json` as sole input, versioned `CURRENT_CONTROL_v*` files as live law, the UPDOS stack, superseded duplicate OD rows, and historical source hashes as current verification.

## Supersession register

| Superseded | Superseded by | Rationale preserved |
|---|---|---|
| Old Controller operating model (`authority/sources/control/**`, `00_PORTFOLIO_CONTROL`-era) | This Controller foundation (`controller/**`) | Old model preserved as evidence of prior governance practice (mission §36: no old-system inheritance) |
| Draft claim "Cybersecurity-Education-Platform is the current product code" | Authority audit 2026-09-29 (successor `06_AUTHORITY_AUDIT.md` Part D + live repo evidence) | The draft mis-weighted release-shape (TIER-3) over live governance (TIER-2); corrected reading preserved |
| "Historical/drift" reading of `writer/mi-serial` (2026-09-29 morning) | Owner hard rule: `mi-serial` branches from `cep-serial` | OD-20260928-085 wording preserved as provenance |
| Local-path assumption `/cep_building_mgm/` | Drive folder `cep_building_mgm` (`1mt_0MSz…`) | Path-only reading would have caused a false "source missing" hard stop |
| Historical RCF results as "proof" | Re-run requirement under `04_rcf` | Results preserved as historical evidence |
| 23 `writer/surface-*` + `writer/ds01-*` branch regime | `writer/cep-serial` → `writer/mi-serial` serial regime (Owner hard rule 2026-09-29) | Branch families preserved as execution history; per-branch HEADs recorded in POST_DS01 result audit |
| Historical product-source identity `b8b5e4a5…/289` | Current canonical `480dbe…/273` (parent-commit bound) | Old hash retained as provenance of what was "accepted" on 2026-09-2x; explicit rule: never a verification baseline |
| "Drive is the sole live governance root" (OD-20260914-030/031) as a location law | Split truth: Drive = governance/custody plane; repo = executable baseline | Duties preserved; location absolutism not promoted (C-11) |
| Content-campaign control states ("C0 FROZEN / 152/152") read as product states | Excluded from product truth (C-13) | Preserved as content-campaign history |

## Knowledge-loss risk register (mission §35 hard stop #15 guard)

- Legacy Mimo archive (607 MB) content not mined this pass → risk MEDIUM; mitigations: successor
  forensic indexes exist; deferred retrieval recipe recorded in `retrieval_manifest.md`.
- `CURRENT_STATE.md` (867 KB) body and `CONTROLLER_GOVERNANCE.md` (185 KB) body not ingested →
  risk MEDIUM-HIGH for Writer packet detail; both are indexed and must be ingested in the
  reconstruction wave before any Writer packet is finalized.
- 8,651-row obligation corpus not row-ingested → risk HIGH for zero-loss packet generation; this is
  the single largest remaining knowledge dependency.
