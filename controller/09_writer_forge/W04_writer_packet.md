# W04_COMPLETE_WORKSPACE_PACKET — Evidence · Reviews · Mastery · Portfolio

**Class:** `WRITER_PACKET__CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Generated:** 2026-09-29T02:35Z by NEW CEP Controller · dispatch-gated by `../11_gates/PRE_WRITER_DISPATCH_GATE.md`

## 1. Workspace identity
W04 owns Evidence, Reviews, Mastery, Portfolio — the proof/attestation family — plus the w04
rescue seam for its group.

## 2. Baseline binding
`hamad933/cep-writer-baseline-repo` · lineage `main@37c4d765…` → `writer/cep-serial@48fec276…` → `writer/mi-serial` · CANONICAL `480dbe9d…cc9641`/273 @ `293dd1e0` · CLEAN HEAD `3f3ad1e0…`/287 · WORKTREE VARIANT `c82cec63…`/287 (3 pre-existing deltas) · Node 22.16.0 · Playwright 1.62.1.

## 3. Full surface inventory (verified)
| Surface | Implementation | Obligations |
|---|---|---|
| EVIDENCE | `surfaces/evidence/`, `profiles/evidence.json`, evidence-state machine per A03 model (CEP-DEC-026) | 382 |
| REVIEWS | `surfaces/reviews/`, `profiles/reviews.json` | 355 |
| MASTERY | `surfaces/mastery/`, `profiles/mastery.json`, mastery state machine (CEP-DEC-026) | 353 |
| PORTFOLIO | `surfaces/portfolio/`, `profiles/portfolio.json` | 355 |
| w04 rescue seam | `tools/c2-w04-truth/` lineage + rescue composition | group seam |

## 4. Shared mechanics — ownership
| Mechanic | IMPLEMENTATION_OWNER | POLICY_OWNER | Consumers |
|---|---|---|---|
| w04-rescue seam | **W04-group seam (not reviews-only)** | W04 | W04 surfaces |
| Evidence custody/receipt truth | evidence family owners | **W04** | all workspaces consume the receipt format |
| Mastery/Evidence state machines | surface owners per CEP-DEC-026 | W04 | — |
| Review/attestation flow | reviews owners | W04 | — |
| SC-011 preference exposure (MFC-PF-003) | SettingsCenterOwner + ScopedPreferencesOwner | W05 | W04 consumes settings |

## 5. Requirements
Input: `W04_REQUIREMENTS.csv` — **1,445 rows, all in scope** (evidence 382, portfolio 355, reviews 355, mastery 353).
Layers: OWNER_DECISION 291 · OWNER_QA 216 · ROOT_FINDING 320 · FORWARD_GAP 59 · DURABLE_ANCILLARY 534 · identity/profile/visual/result 20 · guardrails 5. Proof coverage: positive 923 / negative 847 / proof_requirement 1,445. Zero-loss law binding.

## 6. Decisions & findings
Decisions (291 obligations): Evidence/Mastery state-machine laws (A03/CEP-DEC-026), evidence-custody rules from CONTROLLER_GOVERNANCE acceptance-gate architecture (donor floor, state/viewport proof, golden replay, real-consumer, worst-finding law).
Findings: **F-051** (evidence-receipt overcount — evidence custody truth), plus C03-GATE-020 evidence obligations and E18 acceptance lineage (`assurance/E18_ANALYTICAL_COMPARE_CONTROLLER_ACCEPTANCE.json`).
- **Open questions (do NOT decide silently — STOP/REPORT):** Q-5 Portfolio grouping authority (`../03_historical/open_questions.md`).

## 7. RCF expectations
W04 is the workspace where fixture-vs-real discipline is *stated* as product behavior: evidence artifacts must distinguish `primaryLiveOperationalConsumer` vs `recordedConsumer` vs fixture (`L07` taxonomy). Historical templates: `PS03` admission receipt, `VS04/VS05` negative-fixture proofs. F-051 closure requires real receipt counts bound to exact candidates.

## 8. Evidence expectations
W04 writers must satisfy the *product's* evidence contract as well as the Controller's: receipts bind candidate/commit/tree/flow/browser/timestamp/expected/actual; overcount = defect (F-051). No orphan screenshots.

## 9. Browser flows
evidence create → attest → verify lifecycle · review flow + verdict recording · mastery progression state machine · portfolio assembly/export · receipt-count truth (F-051 regression). Baseline note: `workspace.transient-and-pane-lifecycle` PASS on `c82cec63…`; W04 flows not yet run at baseline.

## 10. Acceptance criteria
(a) 1,445 rows dispositioned · (b) F-051 closed with counting proof bound to candidate · (c) evidence/mastery state machines match CEP-DEC-026 · (d) w04 seam single-owner invariant holds · (e) portfolio exports reproducible · (f) evidence bound exactly.

## 11. Negative cases
Receipt counts must not overcount (F-051) · evidence state must not jump unattested states · mastery must not grant without proof · reviews must not self-approve (sole Controller/Owner review law) · fixture evidence must not be labeled real-consumer.

## 12. Dependencies & inputs
`W04_REQUIREMENTS.csv`, 4 SurfaceProfiles, W04 ORACLE-011, applicable Owner decisions, `tools/c2-w04-truth/` references. Consumes: shell nav (W01), settings (W05), evidence receipt format it polices.

## 13. Donor/reference map
Evidence/Mastery state machines (A03 product model), E18 acceptance shape, donor dispositions per `archaeology/DONOR_PRESERVE_IMPROVE_REJECT_REGISTER.csv`.

## 14. Outputs & checkpoints
Candidate deltas + `writer-output/W04/` evidence + PS03-shaped proof; checkpoints per surface + F-051 closure + integration. No push to `main`; no self-merge/promote.

## 15. Stop conditions
Standard stop set (W01 §15) + any receipt whose lineage cannot bind a candidate → classify LINEAGE, report, do not paper over.

## 16. Integration boundaries & parallelism
P1 group (parallel with W01/W02). MEDIUM merge risk (w04 seam, evidence receipts in `assurance/**` — use workspace-scoped evidence dirs per naming rule to avoid collisions).

## 17. Conflict rules
Code wins over registries; must-never-promote list binding (esp. "17 prior writer results" are NOT acceptance — C-14).

## 18. Rollback / recovery
Checkpointed candidates; evidence immutable (preserve, never delete); recovery from checkpoint.

## 19. Completion proof
Six states required.

## 20. Handoff
Rows dispositioned, F-051 counting proof, evidence index + hashes, receipt bound to candidate, conflicts, residual gaps.
