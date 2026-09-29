# REQUIREMENT_EXTRACT.md — recovered requirements summary

**Companion machine-readable file:** `REQUIREMENT_EXTRACT.csv` — **80 rows**, columns `id,source_file,source_id,requirement,scope,surface_workspace_hint,status,notes`. Item class: `requirement`.

## Counts by scope

| Scope | Rows | ID range |
|---|---|---|
| GLOBAL (cross-surface UX/behavior) | 12 | CBM-R-001…012, 055…060 |
| IA / architecture | 6 | CBM-R-013, 014, 017, 061, 073, 074 |
| DOMAIN (product models A01–A03) | 12 | CBM-R-015, 016, 018…029 |
| UX (CEP-VIS-001 + interaction) | 5 | CBM-R-030, 031, 060, 075, 076 |
| SURFACE (23-surface matrix rows) | 23 | CBM-R-032…054 |
| PERSISTENCE / RUNTIME / PLATFORM | 8 | CBM-R-062…068 + 011 |
| EVIDENCE / ACCEPTANCE | 4 | CBM-R-069, 070, 079, 080 |
| REUSE / GOVERNANCE | 5 | CBM-R-072…074, 077, 078 |
| EXECUTION | 2 | CBM-R-071, 012 |

## Counts by status

| Status | Count |
|---|---|
| CURRENT_OWNER_DIRECTIVE | 33 |
| CURRENT_VALIDATED | 43 |
| CONDITIONAL | 3 |
| HISTORICAL_VALID | 1 |
| CONFLICTED | 1 (CBM-R-042 Results TimelineReplay duplicate-owner ambiguity) |

## Source distribution

| Source | Rows |
|---|---|
| 23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md (1ODc-0jTWUCoZ-wVPUIpktoRn-taPEI_x) | 29 (23 surface rows + 6 cross-surface) |
| OWNER_ENHANCEMENT_BACKLOG_20260911_v1.0.md (1Qwv_9M8evVHmAt3bWcd-IQqWMAYjqG_E) | 12 |
| CEP_PRD_001_A01/A02/A03 | 7 / 5 / 4 |
| CEP_VIS_001 (1hhnXSpT3usVGjiR9OtkxtMxWFxy41CE_) | 2 |
| CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md (1uwyvNG7E2n3VwAxxoI3QqesMhpNCjlTr) | 7 |
| OWNER_DECISION_LIVE_REGISTER.csv (1GF70xX-eGWNmp8VaK_gjTRrAAVq0bihh) | 5 |
| CEP_VISUAL_CAPTURE_RECOVERY_PROTOCOL.md (167wLSSjxGstoNGRgMoGJ-SisFnKKOiyN) | 2 |
| CONTROLLER_GOVERNANCE.md (1xZSIBmNWcc6DtWuQ30R_5uHLg7AT9hB_) | 1 |
| POST_DS01_23_SURFACE_PARALLEL_RESTORATION_PLAN.md (1HkssNtVd2SAve2ibYyCoLCtEXZAW2mOP) | 1 |

## Highlights per class

**Product-identity requirements (must survive any migration):** the 23 surface purpose/COMMAND/lifecycle rows CBM-R-032…054 are the distilled per-surface identity contract — e.g. Today is orchestration projection and never a second store (CBM-R-033); Visualize representations never mutate canonical objects (CBM-R-037); W03 studios are workspace-first with immutable published revisions (CBM-R-038…042); Evidence admission ≠ review ≠ acceptance ≠ mastery (CBM-R-026, 028, 043); Processing intentionally has no visual reference (CBM-R-048); Configuration ≠ Global Settings (CBM-R-054).

**UX law:** region role contract (CBM-R-030), one information/action home (CBM-R-056), typed region proof (CBM-R-057), Arabic-first dark shell (CBM-R-031), multi-route reversibility (CBM-R-075), InputDirectionResolver behavior (CBM-R-001), UI Scale separation (CBM-R-002).

**Truth-separation requirements:** AUTOSAVE≠SAVE≠RECOVERY (CBM-R-062); STAGED_AND_VERIFIED≠LIVE_RESTORED (CBM-R-063); FTS5 derived-only (CBM-R-064); import adjudication gate (CBM-R-065); CEP_INTERNAL_PIN≠OS_ALWAYS_ON_TOP (CBM-R-066); renderer≠runtime≠semantic owner (CBM-R-067); provider UNAVAILABLE never renders as AVAILABLE_EMPTY (CBM-R-033, 047).

**Acceptance requirements:** state/viewport-matched proof incl. 1440 & ~1024 (CBM-R-079), positive+negative/falsification proof + value-recovery disposition per obligation (CBM-R-080), real-consumer proof, worst-finding verdict law (CBM-R-079), mandatory visual QA inspection of every material screenshot (CBM-R-069).

## Open / conditional requirements (explicitly unresolved in the corpus)

- CBM-R-036 RQ final visual authority: `REVIEWED_FINAL_CANDIDATE` only.
- CBM-R-042 Results: TimelineReplayOwner vs M0 local replay — retain+rebind or retire (must pick one).
- CBM-R-046 Portfolio project/learning-objective grouping: `AUTHORITY_DECISION_REQUIRED`.
- CBM-R-068 real Windows PTY/ConPTY + HWND/always-on-top/input-direction target proof: never closed historically.
- CBM-R-032 Shell destination count: five is baseline, `destinationCountFrozen=false`.
