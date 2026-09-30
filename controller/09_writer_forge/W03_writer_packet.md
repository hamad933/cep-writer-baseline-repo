# W03_COMPLETE_WORKSPACE_PACKET — Enterprise · Scenarios · Labs · Runs · Results (+ Replay/AAR/Compare, spatial boundary)

**Class:** `WRITER_PACKET__CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`

> ## MANDATORY INHERITED STANDARD — READ BEFORE ANY WORK
>
> This packet **automatically inherits** [`VISUAL_EXECUTION_STANDARD.md`](./VISUAL_EXECUTION_STANDARD.md) in this directory.
> That standard is **binding** and overrides any stale wording in this packet.
>
> It defines, and you must follow:
> - **Reference authority** — a visual reference is **CONSTRUCTION AUTHORITY** (composition, hierarchy, spatial relationships, information architecture, density/rhythm, interaction language, visual emphasis, pane organization, responsive intent). It is **never** "presentation only". `REFERENCE != BLIND PIXEL COPY`.
> - **Reference / Result / Evidence taxonomy** and current authority-status declaration.
> - **Prohibited conceptual cloning** — `DONOR != DESTINATION TEMPLATE`. Never "Library renamed for Scenarios", never "Learn renamed for Labs".
> - **Local composition responsibility** — `SHARED MECHANICS + SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION`.
> - **The mandatory visual lifecycle** (REFERENCE → … → CLOSE) and L1–L4 comparison depth.
> - **Content / density rules** — no fake content, no dead zones, intentional density.
> - **Language policy (FINAL)** — Arabic and English are both first-class; active language is user-configurable in Settings; **no permanent Arabic-first or English-first product authority**; RTL / LTR / BIDI-safe required.
> - **Evidence + lineage binding** — candidate, commit/tree, environment, test, viewport, timestamp, image identity (path + sha256 + dims).
> - **Defect governance** — V0–V4 severity, root-cause taxonomy, no blind repair loops.
> - **Responsive requirements**, **acceptance conditions**, and **escalation rules**.
> - **Mandatory machine-readable Writer output** (`VISUAL_EXECUTION_REPORT.json`) — "Looks good" / "Done" / "Passed" are not valid output.
>
> **Also load these project skills before working:** `visual-surface-composition` · `visual-fidelity-review` · `shared-component-governance` · `professional-ui-ux-composition`.
>
> **Execution unit:** 1 WRITER → 1 SURFACE → 1 VISUAL OWNERSHIP LOOP. Final visual refinement dispatch is per-surface: see [`../10_dispatch/SURFACE_DISPATCH_MATRIX.json`](../10_dispatch/SURFACE_DISPATCH_MATRIX.json) and `surface_units/`. This workspace packet remains the scope/obligation package, not the final visual execution unit.
>
> **You cannot accept your own work.** Status stays `NOT_OWNER_ACCEPTED`; sole Controller review is required.

**Generated:** 2026-09-29T02:35Z by NEW CEP Controller · dispatch-gated by `../11_gates/PRE_WRITER_DISPATCH_GATE.md`

## 1. Workspace identity
W03 owns Enterprise, Scenarios, Labs, Runs, Results — including the **Replay / AAR / Compare**
mechanics (verified as mechanics, not separate surfaces) and the **spatial boundary** discipline.

## 2. Baseline binding
`hamad933/cep-writer-baseline-repo` · lineage `main@37c4d765…` → `writer/cep-serial@48fec276…` → `writer/mi-serial` · CANONICAL `480dbe9d…cc9641`/273 @ `293dd1e0` · CLEAN HEAD `3f3ad1e0…`/287 · WORKTREE VARIANT `c82cec63…`/287 (3 pre-existing deltas) · Node 22.16.0 · Playwright 1.62.1.

## 3. Full surface inventory (verified locations)
| Surface | Implementation | Obligations |
|---|---|---|
| ENTERPRISE | `surfaces/enterprise/`, `profiles/enterprise.json` | 412 |
| SCENARIOS | `surfaces/scenarios/`, `profiles/scenarios.json` | 439 |
| LABS | `surfaces/labs/`, `profiles/labs.json` | 441 |
| RUNS | `surfaces/runs/`, `profiles/runs.json`, run presentation + preflight | 461 |
| RESULTS | `surfaces/results/`, `profiles/results.json` | 430 |
| **Replay** | `foundation/timeline/replay.ts` (`TimelineReplayOwner`) + `timeline/replay-host.ts` + `adapters/results/timeline-replay-provider.ts`; 1 instance `main.ts` L43; guards `surfaces/composition/w03-rescue.ts` | mechanic |
| **AAR** | `adapters/results/domain.ts` (`aarProjection`, `RESULT_AAR_*` invariants) + `surfaces/results/presentation.ts` (aar mode) + `results.annotate` | mechanic |
| **Compare** | `foundation/analytical/compare.ts` + `compare-host.ts` + `adapters/analytical/{rq,results}-compare-provider.ts`; registry `analytical.compare`; E18 acceptance | mechanic |

## 4. Shared mechanics — ownership
| Mechanic | IMPLEMENTATION_OWNER | POLICY_OWNER | Consumers |
|---|---|---|---|
| Spatial engine + boundary | SpatialPresentationOwner (spatial family) | W02 policy / W03 boundary | scenarios, enterprise, runs spatial |
| Timeline replay | TimelineReplayOwner (foundation; **1 instance**) | W03 (primary), RUNS (secondary) | results, runs |
| Analytical compare | foundation `analytical/compare.ts` | W03 | results + rq providers |
| W03 semantic-ownership seam | `tools/check-w03-semantic-ownership.py`-enforced boundary | W03 | — |
| Enterprise semantics | W03 semantic owners (`assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json`) | W03 | — |
| `main.ts`/`m0` runs hunks | SERIALIZED slot | Controller | — |

## 5. Requirements
Input: `W03_REQUIREMENTS.csv` — **2,183 rows, all in scope** (runs 461, labs 441, scenarios 439, results 430, enterprise 412).
Layers: OWNER_DECISION 385 · OWNER_QA 355 · ROOT_FINDING 504 · FORWARD_GAP 116 · DURABLE_ANCILLARY 785 · identity/profile/visual/result 28 · guardrails 10 (history). Proof coverage: positive 1,413 / negative 1,315 / proof_requirement 2,183. Zero-loss law binding.

## 6. Decisions & findings
Decisions (385 obligations) incl. V1 internal-simulation doctrine (A02 model, CEP-DEC-025), canonical-object≠surface≠context law (CEP-DEC-023), OWNER-20260910-007 (spatial engine + adapters).
Findings: **PVF-001** (Enterprise Twin/Baseline integration), **PVF-002** (Runs Preflight integration), **PVF-003** (Results AAR/Compare integration), C03-GATE-020 (W03 major-state integration subfindings; five post-F049/F050 Canvas closure proofs), C03-GATE-024/D14 obligation-manifest law.
- **Open questions (do NOT decide silently — STOP/REPORT):** Q-4 TimelineReplayOwner retain-vs-retire (`../03_historical/open_questions.md`).

## 7. RCF expectations
Historical recovered: `W3A`/`W3_B`/`W3E` real-consumer proofs + `PS04` runtime proofs (`../04_rcf/rcf_recovery.md`) — evidence only. Current real-consumer runs REQUIRED for: recorded-run replay causality, AAR projection truth, compare convergence, spatial connect integrity. `L07` taxonomy; `PS03` admission shape; recorded/read-only consumers must be labeled `recordedConsumer`.

## 8. Evidence expectations
Full binding per `../08_evidence/evidence_contract.md`. Spatial evidence at 1440×1000 + 1024×900. Replay evidence must bind causal chain (action → timeline event → state delta). Compare evidence must prove canonical-state invariance. E18 analytical-compare acceptance shape governs compare claims.

## 9. Browser flows
enterprise twin/baseline (PVF-001) · runs preflight → run → recorded result (PVF-002) · results AAR + compare (PVF-003) · replay causality + timeline scrub · spatial select/connect/canonical-edge · run terminal detach (`OPEN_TERMINAL`, operational host) — note known global FAILs: `runtime-causal-consequence` (HARNESS-class probe bug — fix probe first), `spatial.selection-connect-canonical-edge` (UNKNOWN).

## 10. Acceptance criteria
(a) 2,183 rows dispositioned · (b) PVF-001/002/003 closed or bounded through D13/D14 route · (c) W03 semantic-ownership checker green on candidate · (d) TimelineReplayOwner single-instance invariant holds · (e) recorded-result read-only truth preserved (V1 internal-simulation doctrine) · (f) evidence bound exactly.

## 11. Negative cases
Recorded results must never mutate · replay must not fabricate causality · compare must not alter canonical state · spatial ops must not leak to other domains (F-049 class) · `enterprise` consumer gate behavior must match adjudicated `main.ts` delta (worktree delta removes the `consumer!=='enterprise'` gate — verify intended behavior before relying on either branch).

## 12. Dependencies & inputs
`W03_REQUIREMENTS.csv`, 5 SurfaceProfiles, W03 ORACLE-007, applicable Owner decisions, `authority/W03_*` dispositions (historical input), `tools/check-w03-semantic-ownership.py`. Consumes: spatial policy (W02), persistence seed (W05, CBF-001), shell nav (W01).

## 13. Donor/reference map
`authority/sources/06_W03_WORLD_CLASS_WORKBENCH_PROPOSAL__HIGH_VALUE_NOT_AUTHORITY.txt` (explicitly NOT authority — requirement/value input only), `W03_69_318_REQUIREMENT_REUSE_DISPOSITION`, `BIG_BOSS_468_ATOM_*`, blueprint donors per OWNER-20260910-004.

## 14. Outputs & checkpoints
Candidate deltas + `writer-output/W03/` evidence + PS03-shaped proof; checkpoints per surface + per PVF closure + integration slot. No push to `main`; no self-merge/promote.

## 15. Stop conditions
As W01 §15, plus: any attempt to touch `main.ts`/`m0` outside the serialized slot; any registered-vs-code ownership ambiguity (report to Controller).

## 16. Integration boundaries & parallelism
P2 group (parallel with W05, after/with its persistence dependency resolved). HIGH merge risk: spatial + replay owners, runs hunks in `main.ts`. Integration order: per-surface → PVF closures → D13 serialized final integration → D14 independent proof.

## 17. Conflict rules
Code wins over registries; historical `writer/surface-*` branch work is superseded provenance (C-10); must-never-promote list binding.

## 18. Rollback / recovery
Checkpointed candidates; evidence immutable; recovery from checkpoint with candidate re-binding.

## 19. Completion proof
Six states required (implementation, browser, evidence, acceptance, integration, checkpoint).

## 20. Handoff
Rows dispositioned, PVF closures with evidence, semantic-ownership checker output, receipt bound to candidate, conflicts, residual gaps (esp. any C03-GATE-020 obligation left open).
