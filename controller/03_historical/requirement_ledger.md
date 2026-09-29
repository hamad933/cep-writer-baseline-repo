# 03_historical / requirement_ledger (B-1 COMPLETE)

Generated 2026-09-29T02:00Z by Controller ledger forge. Source: `STAGE2_OBLIGATIONS_MASTER.csv`
(Drive `1EcmccqhAmeKMkM-KCUZAVga8La_vwyqe`, sha256 recorded in `corpus/manifest.json`). Row-level
contents preserved in full at `requirement_ledger.csv` (13382809 bytes, 8651 rows).

## Coverage
- Obligation rows: **8651** across **23** surfaces (345-461 rows/surface).
- Canonical workspaces: {'W05': 2827, 'W03': 2183, 'W04': 1445, 'W02': 1485, 'W01': 711}
- Historical sub-lanes preserved: {'W05B': 1400, 'W03': 2183, 'W04': 1445, 'W05A': 1427, 'W02': 1485, 'W01': 711}

## Workspace reconciliation (decision RC-WS-1)
The corpus partitions W05 into **W05A** (health, processing, validation, manual_ai = 1,427 rows) and
**W05B** (audit, backup, configuration, releases = 1,400 rows). The current Owner directive mandates
**exactly five** workspaces with W05 owning all eight surfaces. Resolution: canonical mapping
W05A+W05B → **W05**, with `workspace_sublane` retained for parallelism planning (two sub-lanes can be
parallel inside W05 only under single W05 ownership). Provenance preserved; nothing dropped.

## Source layers (all preserved — every mission must cover all layers)
| source_layer | rows |
|---|---|
| ZL01_DURABLE_ANCILLARY | 3247 |
| ZL01_ROOT_FINDING | 1854 |
| OWNER_DECISION | 1700 |
| OWNER_QA_DEEP_AUDIT | 1306 |
| ZL01_FORWARD_GAP | 387 |
| ZL01_ZL02_RECONCILIATION | 38 |
| VISUAL_REFERENCE | 27 |
| CURRENT_IDENTITY | 23 |
| CURRENT_PROFILE | 23 |
| AUTHORITY_RECOVERY_ARCHAEOLOGY | 23 |
| CURRENT_RESULT_AUDIT | 23 |

## Authority classes
| authority_class | rows |
|---|---|
| DURABLE_ANCILLARY_VALUE | 3247 |
| SOURCE_ZERO_LOSS_ROOT_OR_ALIAS | 1854 |
| LIVE_OWNER_DECISION | 1700 |
| INDEPENDENT_AUDIT_DURABLE_VALUE | 1306 |
| POST_C03_FORWARD_CONTROL_GAP | 387 |
| PRESENTATION_REFERENCE | 27 |
| CONTROLLER_IDENTITY_REFERENCE | 23 |
| CURRENT_SURFACE_PROFILE | 23 |
| DURABLE_IDENTITY_REFERENCE_RECOVERY | 23 |
| CONTROLLER_ADJUDICATED_ZERO_LOSS_ACCEPTANCE_LAW | 23 |
| CONTROLLER_RESULT_AUDIT | 23 |
| CONTROLLER_ADJUDICATED_POST_C03_DELTA | 15 |

## Temporal disposition
{'CURRENT': 6797, 'CURRENT_OR_DURABLE': 1825, 'HISTORICAL_DURABLE_GUARDRAIL': 29}

## Controller conflict flags
{'HISTORICAL_GUARDRAIL_NOT_CURRENT_LAW': 29}

## Companion ledgers
- `decision_ledger.csv` — 102 Owner decisions (id, status, supersedes, applies_to) + 1700 decision-derived obligations.
- `../04_rcf/current_rcf_matrix.csv` — per-surface real-vs-fixture state.
- `../05_foundation/capability_matrix.csv` — 40 foundation capabilities (SC-*).
- `../05_foundation/donor_crosswalk.csv` — 3497 source-value crosswalk rows.

## Retrieval anomalies (preserved, non-blocking)
- `ZL01_LOST_UNDERREPRESENTED_VALUE.csv` (id `1uoT754…344`) and `DURABLE_MICRO_VALUE_LEDGER.csv`
  (id `17TPlTz…BK4`) returned HTTP 400 on content retrieval (two attempts). Their knowledge is
  substantially preserved inside the master's `ZL01_DURABLE_ANCILLARY` (3,247) and `ZL01_ROOT_FINDING`
  (1,854) layers. Classification: RETRIEVAL_FAIL / partial knowledge coverage — recorded, not fabricated.
