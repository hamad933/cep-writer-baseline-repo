# W02_COMPLETE_WORKSPACE_PACKET — Library · Learn · Visualize · Research & Quality + shared interaction/customization policy

**Class:** `WRITER_PACKET__CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Generated:** 2026-09-29T02:35Z by NEW CEP Controller · dispatch-gated by `../11_gates/PRE_WRITER_DISPATCH_GATE.md`

## 1. Workspace identity
W02 owns Library, Learn, Visualize, RQ surfaces **and** the shared customization / action mechanics /
accessibility / keyboard / mouse / RTL / BIDI / responsive **policy** for the whole product
(implementation owners remain foundation kernels — two-field model, `../05_foundation/ownership_adjudication.md` A-4).

## 2. Baseline binding
Repository `hamad933/cep-writer-baseline-repo` · serial lineage `main@37c4d765…` → `writer/cep-serial@48fec276…` → `writer/mi-serial` · CANONICAL `480dbe9d…cc9641`/273 @ `293dd1e0` · CLEAN HEAD `3f3ad1e0…`/287 · WORKTREE VARIANT `c82cec63…`/287 (3 pre-existing deltas, see `../08_evidence/worktree_disposition.md`) · Node 22.16.0 native-TS/ESM · Playwright 1.62.1.

## 3. Full surface inventory (verified locations)
| Surface | Implementation | Obligations |
|---|---|---|
| LIBRARY | `surfaces/library/`, `profiles/library.json`, adapters `library-chrome.js`/`library-fixtures.js`/`library-outline-descriptor.js` lineage | 375 |
| LEARN | `surfaces/learn/`, `profiles/learn.json`, structured hosts `w5-a/w5-b/w5-c` + `pw08/pw11` test line | 369 |
| RQ | `surfaces/rq/`, `profiles/rq.json`, `tools/b3r-rq-visualize/` | 353 |
| VISUALIZE | `surfaces/visualize/`, `profiles/visualize.json`, spatial stack (`foundation/spatial*`) | 388 |
| Shared interaction policy | keyboard/pointer/RTL-BIDI/responsive/accessibility compliance across surfaces | — |

## 4. Shared mechanics — ownership
| Mechanic | IMPLEMENTATION_OWNER | POLICY_OWNER | Consumers |
|---|---|---|---|
| Structured presentation bridge | StructuredPresentationBridge (Structured family engine — **NOT LEARN-owned**) | W02 | LEARN + structured hosts |
| Spatial engine | SpatialPresentationOwner (spatial family — **NOT SCENARIOS-owned**) | W02 | VISUALIZE, W03 spatial |
| Bottom deep-work | BottomDeepWorkOwner (foundation) | W01 | RQ deep-work consumer |
| Accessibility feedback | AccessibilityFeedbackOwner (foundation-global) | **W02** | all |
| Global keymap | GlobalInputKeymapOwner | **W02** | all |
| Input direction (RTL/BIDI) | InputDirectionResolver | **W02** | all |
| Layout/responsive | WorkspacePaneLayoutOwner + WorkspaceResponsiveLayoutPolicy | **W02** | all |
| Mouse/pointer kernels | WindowMotion + SpatialInteractionKernel + RelationInteractionOwner + StructuredDragDropOwner | **W02** (policy) | all |
| Customization | ScopedPreferencesOwner + SettingsCenterOwner + ReusableToolbarTemplateOwner | W02 policy / W05 SC-011 action home | all |
| Analytical compare | foundation `analytical/compare.ts` | W03 (results) / W02 (rq provider) | RQ+Results |

## 5. Requirements
Input: `W02_REQUIREMENTS.csv` — **1,485 rows, all in scope** (library 375, learn 369, rq 353, visualize 388).
Layers: OWNER_DECISION 296 · OWNER_QA 211 · ROOT_FINDING 313 · FORWARD_GAP 67 · DURABLE_ANCILLARY 567 · identity/profile/visual/result 27 · guardrails 4. Proof coverage: positive 930 / negative 850 / proof_requirement 1,485. Zero-loss law binding.

## 6. Decisions & findings
Decisions (296 obligations): OWNER-20260910-003 (Library Editor v1.2.17 donor), -004 (blueprint = input only), -006 (accepted library mechanics → reusable primitives), -007 (one spatial engine + domain adapters), OE-001…005 customization/QA intake.
Findings: **CBF-002** (VISUALIZE context side), **CBF-003** (P0: domain BOTTOM orphaned from BottomDeepWorkOwner — RQ is the owner-side surface), **F-049** (Canvas remove leaks to TREE/PATH/GRAPH), **F-050** (Canvas identity/grammar incomplete), **MFC-PF-001/002** (Library local transient/focus keys beside shared owners), PW-20 Learn real-consumer binding (historical BLOCKED pattern), C03-GATE-020 Canvas closure proofs.
- **Open questions (do NOT decide silently — STOP/REPORT):** Q-3 RQ visual ceiling (`REVIEWED_FINAL_CANDIDATE`) (`../03_historical/open_questions.md`).

## 7. RCF expectations
`L07` taxonomy binding; real-consumer proofs required for: library editor mechanics (second consumer = learn), structured hosts, spatial selection/connect, RQ deep-work. Historical: `FW_B`/`W2_C`/`PW-20` recovered (`../04_rcf/rcf_recovery.md`) — evidence only. Negative-falsification shape: `VS04/VS05` duplicate-owner + negative-fixture templates.

## 8. Evidence expectations
Full binding per `../08_evidence/evidence_contract.md`; spatial flows need canvas-bound screenshots at 1440×1000 **and** 1024×900 (Canvas closure obligations); DOM evidence for BIDI cases (`unicode-bidi:isolate` behaviors).

## 9. Browser flows
library edit→learn consume real-consumer chain · spatial select/connect/canonical-edge (known FAIL on `c82cec63…`, classification UNKNOWN→must be adjudicated in-mission) · route convergence + label scope (known FAIL, PRODUCT-class null deref) · central change reuse (known FAIL) · RTL/BIDI input + structured isolation (known FAIL, canvas bounds) · fit/pan/zoom canonical-state invariance · focus/`document.activeElement` proofs.

## 10. Acceptance criteria
(a) 1,485 rows dispositioned · (b) F-049/F-050 closed or bounded with evidence through the D13/D14 route (D04 NO-TOUCH preserved) · (c) CBF-003 BOTTOM domain reachable through the shared owner · (d) MFC-PF-001/002 resolved (no local keys beside shared owners) · (e) accessibility/keyboard/RTL-BIDI/responsive policy verified across all four surfaces · (f) evidence bound exactly.

## 11. Negative cases
Canvas remove must not leak to TREE/PATH/GRAPH · spatial canonical state must not change under fit/pan/zoom · local transient/focus keys must not bypass shared owners · BIDI isolation must hold for mixed content · fixture substitution must never be claimed as real-consumer (`PW01` ceiling).

## 12. Dependencies & inputs
`W02_REQUIREMENTS.csv`, 4 SurfaceProfiles, applicable Owner decisions + OE backlog (§1 input-direction, §2 UI scale, §3 grouped settings, §5 shortcut focus), oracles W03-007 (visualize-adjacent), visual references (presentation only). Consumes: shell nav (W01), preferences (W05 SC-011), persistence seed (W05).

## 13. Donor/reference map
Library Editor v1.2.17 accepted donor (330-function coverage + DOM/CSS/event census in `archaeology/`); `ACCEPTED_LIBRARY_DESIGN_REUSE_REGISTER.txt`; spatial donor per OWNER-20260910-007; `CEP_W02_UNIVERSAL_INTERFACE_…CAPABILITY_MATRIX_v1.0.csv` (historical input).

## 14. Outputs & checkpoints
Candidate deltas + `writer-output/W02/` evidence + PS03-shaped completion proof; checkpoints at surface start, per finding, at integration. No push to `main`; no self-merge.

## 15. Stop conditions
Packet conflict with any source → STOP/REPORT · shared-owner ambiguity · undefined oracle · unbindable evidence · secret exposure · product mutation beyond allowlist.

## 16. Integration boundaries & parallelism
P1 group (parallel with W01/W04). W02 provides policy mechanics consumed read-only by others. `main.ts`/`m0` serialized. HIGH merge risk on shared interaction kernels — one writer per mechanic.

## 17. Conflict rules
Code wins over registries (OC-C-01…18 dispositions); historical locks (e.g. "LEARN owns bridge") are superseded provenance — do not re-implement under old owners.

## 18. Rollback / recovery
Checkpointed candidates; recovery = re-dispatch from checkpoint with candidate re-binding; preserve all evidence.

## 19. Completion proof
Implementation + browser + evidence + acceptance + integration + checkpoint states, all six.

## 20. Handoff
Rows dispositioned, findings closed/bounded, evidence index + hashes, browser receipt bound to candidate, policy-mechanics compliance matrix for all 23 surfaces, conflicts, residual gaps.
