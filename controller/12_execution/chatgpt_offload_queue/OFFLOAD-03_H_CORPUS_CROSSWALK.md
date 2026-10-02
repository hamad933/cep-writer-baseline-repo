# OFFLOAD-03 — H01–H09 / H03-R2 / H08 CROSSWALK

| Field | Value |
|---|---|
| `TASK_ID` | `CEP-REC-OFFLOAD-03` |
| `STATUS` | `READY_FOR_CHATGPT` |
| `PURPOSE` | Distill the nine helper-audit lanes (H01–H09) plus H03-R2 into: (a) durable-vs-temporary claim classification; (b) a per-Surface salvage/truth crosswalk feeding the 23-Surface evidence-reuse matrix; (c) shared-owner/seam inventory for the collision DAG; (d) status of H09's required controller corrections; (e) the Drive→GitHub durable-delta zero-loss check. Consumes existing audits first — no re-audit from zero. |
| `BASIS_HEAD` | `f5b78e3c7df5993e8208c914f5b328967e958ec4` |
| `BASIS_TREE` | `47e97e04434316ec98796bfcf41436ae1e96fc20` |
| `WHY_CHATGPT_OFFLOAD` | ~450 KB of Drive-hosted audit prose + GitHub crosswalks; purely read-only analysis. Primary spot-check only. |

## EXACT_READ_SET

Fetch actual remote HEAD/tree first; confirm equals BASIS.

GitHub side:
1. `controller/12_execution/H08_LOCAL_RESIDUE_DISPOSITION.md` (54-path dispositions) and `H08_DELETED_TEMP_UNIQUE_KNOWLEDGE_CLOSURE.md`.
2. `controller/state/CURRENT_STATE.md`, `controller/authority/AUTHORITY_STATUS.json` (truth ceilings), `controller/12_execution/WRITER_RESULT_RECONSTRUCTION_BASELINE.md` (23-Surface classes).
3. `controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json` + `PARALLEL_EXECUTION_PLAN.md` (shared seams/dependency waves).
4. `controller/05_foundation/{mechanic_owner_conflicts,ownership_adjudication,shared_ownership_map}.md` (H03-superseded, lineage-preserved).

Google Drive side (the H-corpus — read-only; these are the audit bodies, classified `HISTORICAL_SUPPORTING_EVIDENCE`, never current authority):
- Lane parent folder: `1_LTXY_wGeiDh3lqB6dwnetIYP0nDdYV7`
- H01 `1XVunnfPpwyQuvkAQHOJWE9o2AGY4d0yk`: PROMOTION_CANDIDATES, CONTROL_PLANE_FINDINGS, CONTROL_ARTIFACT_CLASSIFICATION
- H02 `13TX8G0aHMxUIHYOYlCLiC-fCT37vlNN1`: 23_SURFACE_SALVAGE_MATRIX, EXACT_STARTING_POINTS_AND_DO_NOT_REPEAT_LIST, INTERRUPTION_TIMELINE_AND_RESCUE_AUDIT
- H03 `1ZBzoFV9zxxjir7c0beYT4q6mxMqO4fkR`: R2_CONTROLLER_COMPLETION_RECEIPT, R2_CURRENT_OUTPUT_SET_MANIFEST, R2_PROPAGATION_AND_FALSIFICATION_MATRIX, DUPLICATION_AND_LOCAL_REINVENTION_FINDINGS, ARCHITECTURE_PROMOTION_CANDIDATES, SHARED_SEAMS_REQUIRING_SERIALIZATION, SHARED_OWNER_AND_CONSUMER_MAP (multiple versions exist — inventory and diff them; superseded drafts under subfolder `90_SUPERSEDED_CONTROLLER_DRAFTS`)
- H04 `1uanJM68qgaTK1GG6XKGBAT3VTMxVjNEA`: FOUR_SURFACE_TRUTH_MATRIX, CURRENT_VISUAL_BLOCKERS_AND_EXACT_NEXT_PROOF, LIBRARY_DURABLE_VALUE_KEEP_REPAIR_REVERT_RECONCILE_MAP, VISUAL_REFERENCE_AND_MECHANICS_PROMOTION_CANDIDATES
- H05 `1CmX-Lrhd095_oiPhQqiX2p0ReQcA2UMG`: CURRENT_TEST_AND_BROWSER_TRUTH, PRODUCT_VS_HARNESS_VS_EVIDENCE_DEFECT_MATRIX, EVIDENCE_LINEAGE_RISK_REGISTER, GITHUB_EVIDENCE_CUSTODY_RECOMMENDATION
- H06 `1Xa0BEKU8aRVSreU-32oxg9Bfu1NmGvZL`: DURABLE_WISDOM_PROMOTION_SET, TEMPORARY_RESIDUE_DO_NOT_PROMOTE_SET, CONFLICTS_WITH_CURRENT_BRANCH_GOVERNANCE, PROMPT_CLAIM_CLASSIFICATION (the three SOURCE_PROMPT_* files: provenance only)
- H07 `1pl5vw2weL-9k-b_ASbyqbKFll00l6Zfg`: DRIVE_TO_GITHUB_DURABLE_DELTA, GITHUB_CUTOVER_BLOCKERS, MISSING_CUSTODY_AND_REFERENCE_BYTES, SAFE_TO_LEAVE_HISTORICAL_ON_DRIVE
- H09 `1l5oSCl-JP1ZnTyQhus-TQpiH71WuMSZq`: ADVERSARIAL_CROSS_LANE_REPORT, CLAIM_FALSIFICATION_MATRIX, REQUIRED_CONTROLLER_CORRECTIONS, CLEAN_CHECKPOINT_GATE, GITHUB_CUTOVER_READINESS_VERDICT (LAUNCH_PROMPT: methodology only)
- If a Drive file is inaccessible, report `UNRESOLVED_FROM_AVAILABLE_EVIDENCE` with its name/ID; do not approximate.

## QUESTIONS_TO_RESOLVE

1. **H03/H03-R2:** full shared-owner & consumer map (with version differences), full serialization-seam list, duplication findings, promotion candidates; exact content of `H03_R2_PROPAGATION_AND_FALSIFICATION_MATRIX` — precisely what `H03-R2-PROP-001` and `H03-R2-FALSIFY-001` would require to leave `NOT_PROVEN`.
2. **H09:** every claim in CLAIM_FALSIFICATION_MATRIX (claim → falsifier → verdict); COMPLETE REQUIRED_CONTROLLER_CORRECTIONS list, each marked `CLOSED_IN_CURRENT_TREE` (cite evidence) / `STILL_OPEN` / `STATE_CHANGED_SINCE`; every CLEAN_CHECKPOINT_GATE condition; the cutover-readiness verdict and its conditions; any statement about Writer topology (quote exactly).
3. **H02:** reproduce the 23-Surface salvage matrix as a table (per surface: salvage class, work preserved w/ paths, remaining work, do-not-repeat items, exact starting point); full do-not-repeat list; interruption timeline.
4. **H04/H05:** four-surface truth matrix (Library/Learn/Visualize/RQ); visual blockers + exact next proof; Library keep/repair/revert/reconcile map; H05 product-vs-harness-vs-evidence defect rows (each: defect → classification → statement); evidence-lineage risk rows; H05's recorded test/browser truth marked as historical snapshot with its stated identity/date.
5. **H01/H06/H07:** control-plane findings + promotion candidates; H06 durable-wisdom promotion set vs temporary-do-not-promote set (verbatim lists) + conflicts-with-current-branch-governance; H07 Drive→GitHub durable delta (each item + expected GitHub location) cross-checked against the current tree (`f5b78e3`) — flag anything still missing; H07 cutover blockers status.
6. **Cross-lane:** flag every claim that (a) contradicts current GitHub authority (GitHub canonical post-cutover; OD-20261002-087 parallel one-writer-per-lane; OD-20260928-085 historical), or (b) is a temporary provider/session/tactic artifact that must NOT be promoted as law.

## REQUIRED_OUTPUT

One coherent markdown report: §1 H03/R2; §2 H09; §3 H02 per-surface table; §4 H04/H05; §5 H01/H06/H07; §6 cross-cutting contradictions + durable/temporary flags; §7 `UNRESOLVED_FROM_AVAILABLE_EVIDENCE`. Use exact quotes + identities. Strong conclusions expected (`OBSERVED_EXISTING_EVIDENCE`, `OBSERVED_OPEN_FINDING`, `POSSIBLE_INVALIDATION_TRIGGER`).

## NON_AUTHORITY_BOUNDARY

READ_ONLY for both GitHub and Drive. No mutation. No final gap/readiness/Writer/DAG decisions. Classification of durable-vs-temporary is analytical input; Primary adjudicates.

## INVALIDATION_CONDITIONS

If remote HEAD/tree differs from BASIS, STOP. If Drive access fails for a named file, report it unresolved — never substitute a lookalike.

## RETURN/CONSUMPTION_INSTRUCTIONS

Return the full report in the ChatGPT conversation. Primary will persist it to evidence custody, spot-check material claims (H09 correction statuses, H07 missing-item flags) directly against the tree, and reopen only contradicted parts.
