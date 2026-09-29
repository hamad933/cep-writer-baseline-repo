# 01_sources / source_inventory

Timestamp: 2026-09-29T01:22-01:30Z · Status: **PASS_WITH_LIMITATION** (all known source classes located; deep byte-level indexing of large archives deferred)

## Source graph (identity → class → access → verified?)

| ID | Source | Exact identity | Class | Access verified |
|---|---|---|---|---|
| S1 | Current executable repository | `hamad933/cep-writer-baseline-repo`, `origin/main@37c4d765`, local `writer/cep-serial@48fec276` | CURRENT_VALIDATED (B) | yes — clone present, gh API |
| S2 | Canonical product source | tree `3101c06901dbdaff9602fea8098efb9c34575149` @ parent commit `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a`, `stack/native-typescript`, **480dbe9d… / 273 files** | CURRENT_VALIDATED (B) | **yes — recomputed exactly** |
| S3 | Historical platform repository | `hamad933/Cybersecurity-Education-Platform` `main@2d8a711` (Laravel/PHP/Vue/PostgreSQL line) | HISTORICAL (E) | referenced by successor audit; not cloned in this pass |
| S4 | Project Drive corpus | `/Google Drive/cep_building_mgm` folder `1mt_0MSzAiy81czOEcM2xsVr1suiRsibv` (11 top children incl. `00_CONTROLLER`, `01_SHARED_INPUTS`, `30_CONTROLLER_REVIEW`, `40_ACCEPTED_SUCCESSORS`, `50_FOUNDATION_PRESENTATION_DONOR_EXTRACTION_RESCUE`, `90_ARCHIVE`, `SURFACE_BUILD`, `POST_M0_*`) | RECONCILED_DRIVE (D) | yes — enumerated read-only |
| S5 | Drive governance live set | `00_CONTROLLER` (57 children): `CURRENT_STATE.md` (867,161 B, 2026-09-27), `CONTROLLER_GOVERNANCE.md` (185,036 B), `OWNER_DECISION_LIVE_REGISTER.csv` (125,675 B, 111 rows), `READ_FIRST.md`, `CONTROLLER_SUCCESSION_HANDOFF.md`, `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` | RECONCILED_DRIVE (D) | metadata all; index text read |
| S6 | Legacy Mimo Claw archive | Drive id `1B6idqykGzjHLwhQ_cOd6_Lhp3aeUCCdp` = `mimoclaw_workspace.tar.gz`, 607,540,790 B, mod 2026-09-27 (8,407 entries per successor forensic) | HISTORICAL (E) | metadata yes; content indexed via S8 |
| S7 | Small successor / bootstrap archive | `/home/codespace/mimoclaw_workspace_2.tar.gz`, sha256 `aad681aae9f839a7213a5772b029e8aefe743ae5c081a8aedee9ba4ed742451a` — **matches directive exactly** | CANDIDATE→HISTORICAL_VALID (E/F) | yes — hash verified + extracted (7/7 expected files) |
| S8 | Successor archive contents | `README.md`, `01_BASELINE.md`, `02_RECONCILIATION.md`, `03_OPERATING_FOUNDATION.md`, `04_CODESPACE.md`, `05_HANDOFF.md`, `06_AUTHORITY_AUDIT.md` | HISTORICAL_VALID (E) | yes — read (README, 01, 02 partial, 06 partial) |
| S9 | Zero-loss obligation corpus | Drive: STAGE2_OBLIGATIONS_MASTER (8,651 rows), SOURCE_VALUE_CROSSWALK (3,497 rows), 23 per-surface CSVs (~13 MB), OWNER_ENHANCEMENT_QA_BACKLOG, ZL01/ZL02 ledgers, 23-SURFACE_IDENTITY_MATRIX, CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER | RECONCILED_DRIVE (D) | indexed via S5 index; row-level ingest NOT_STARTED |
| S10 | RCF evidence set | Drive: `W3A/W3_B/W3E/W5_A/FW_B_REAL_CONSUMER_PROOF.json`, `REAL_CONSUMER_REUSE_AND_PROPAGATION.json` (55,243 B), `L02/L07/L08` matrices, `PS03/PS04` proofs, `PW01_REAL_CONSUMER_STATUS.json` | CURRENT_EVIDENCE historical (C/E) | located, metadata verified; content ingest NOT_STARTED |
| S11 | Foundation capability matrix | Drive `CEP_REUSABLE_FOUNDATION_CAPABILITY_MATRIX_v1.0.csv` (61,621 B, 2026-09-20) | HISTORICAL input (E) | located; ingest NOT_STARTED |
| S12 | Repo authority/contract corpus | `authority/` (registries, dispositions, ledgers), `contracts/` (23-surface inheritance matrix, component/mechanic/state ownership registries), `profiles/` (23 SurfaceProfiles), `archaeology/` (accepted donor census), `assurance/` (receipts), `cep-writer/` (curated Writer chain) | CURRENT_EVIDENCE (C) | enumerated; deep parse partially done |
| S13 | `/cep_building_mgm/` as a LOCAL path | **does not exist locally** | UNKNOWN→RESOLVED | Drive folder S4 is the real envelope (confirmed by successor archive `01_BASELINE.md`) |

## Source graph edges (who depends on whom)

- S1 contains and binds S2 (via `cep-writer/tools/verify_repo.py` + `WRITER_INPUT_MANIFEST.json`).
- S5 (Drive governance) binds S1/S2 (`main@37c4d765`, `480dbe…/273`) — matches live measurements.
- S8 (successor) is a *map of* S4/S5/S6/S1 — explicitly `NOT AUTHORITY`; its facts were re-verified
  here wherever possible (all re-verified facts MATCHED).
- S9 is the mission-generation requirement corpus for the 23 surfaces → feeds `04_rcf`, `06_workspaces`.
- S12 is the in-repo projection of S4/S5-era decisions; `authority/` remains protected historical
  control material (mission section 12) — evidence, not operating law.
