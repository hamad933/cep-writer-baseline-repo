# 12_execution / 10_owner_directive_checkpoint — required response (directive §30)

Timestamp: 2026-09-29T06:40Z · Author: Writer Coordinator · **Checkpoint while execution CONTINUES.**
Directive applied as a governance layer onto the live Writer execution — **no reset, no Wave-0 restart**.

---

## 1. Which Writers are currently running

All five workspaces have returned functional handoffs and are committed. Four child agents are live now:

| Agent | Task | Session |
|---|---|---|
| Shared-component improvement | RC-1/RC-2/RC-3 root-cause fix in the PW-C serialized slot | `ses_f11fed88affeFDpSiakk0XSba3` |
| W01 visual fidelity audit | shell + today | `ses_f11fed886ffePzBXxETOLQatdK` |
| W02 visual fidelity audit | library + learn + visualize + rq | `ses_f11fed880ffeTWtq6wFVd3W9Cm` |
| Acceptance-matrix policy correction | regenerate all 5 matrices under P1-P6 | `ses_f11fd04bbffekh23GQvanLfgJX` |

Completed and committed: W01 `61ee12d` + `04b92f7` (CBF-002 FIXED) · W02 `11f6fdd` · W03 `f9d5a4d` · W04 `81a2732` · W05 `3fc8345`.

## 2. Which surfaces are currently being implemented

None are *green-field*; the phase is now **remediation and re-audit**. The shared-component agent is changing the presentation primitive that feeds **evidence, reviews, mastery, portfolio, manual_ai, releases, configuration** (7 surfaces). Surface-level remediation is queued behind it for the 16 `VISUAL_FAIL` surfaces.

## 3. Which previous acceptances now require visual re-audit

**All of them.** Every workspace accepted on `FUNCTIONAL_ONLY` basis. Register state at this checkpoint:

| visual_status | surfaces |
|---|---|
| `VISUAL_FAIL` | 16 (13 at **V4**, 4 at V3) |
| `BLOCKED` | 2 (results — provider unavailable; rq — Q-3 non-final reference) |
| `ACCEPTANCE_REQUIRES_REVIEW` | 5 (shell, today, library, learn, visualize — audits in flight) |

## 4. First highest-risk visual defects discovered

1. **V4 — Scenarios identity entirely absent.** Renders a generic `"Structured + Spatial Studio / Foundation document host"` scaffold instead of the scenario timeline.
2. **V4 — Labs identity entirely absent.** Same scaffold instead of the non-linear task graph.
3. **V4 — `ONE INFORMATION ITEM → ONE AUTHORITATIVE DISPLAY LOCATION` violated by construction.** `renderTypedCollectionStage` renders the same detail into CENTER *and* RIGHT.
4. **V4 — health** replaces the Arabic component-status dashboard (5×5 table + 4 detail cards + 4 context blocks) with an English generic header (~35% of reference density).
5. **V3 — Enterprise topology empty** (`ENT-REV-UNAVAILABLE`, 0 objects) against a node/edge/legend reference — restorable from the existing W03 6-object fixture, no invention needed.

## 5. Which defects are surface-level

`SURFACE_COMPOSITION` (4): enterprise topology, runs toolbar/telemetry, backup drill report, and the W04 record-composition group (D9/D10/D11). `CONTENT_MODEL` (6): validation session dashboard, manual_ai proposal chain, audit trace chain, releases readiness/authorization/observation, configuration revision/diff + SC-011 receipts, results CENTER filler.

## 6. Which defects are shared-component-level

**6 register rows**, plus three cross-cutting root causes:
- **RC-1** `renderTypedCollectionStage` (`m0-controller-composition.ts:96`) — CENTER/RIGHT duplication.
- **RC-2** `collectionMode:'list'` forced at `m0:174` and `m0:194` — suppresses the authored table matrix (measured `tables = 0` despite 4 authored columns; the table branch at `m0:101` is unreachable).
- **RC-3** `semanticProjection` (`m0:78`) — root cause of generic filler (`studio-node-1/2/3`, bare `EMPTY / State` token).

These three explain **9 of W04's 12 defects** and W05's D1. Also flagged: `audit` settlement projection (annotate outcome invisible), `ContextInspectorHost` lens vocabulary, and the global `.phead h2` `direction:rtl` + ellipsis clipping LTR labels at the start (measured 187 < scrollWidth 260).

## 7. Which shared components genuinely require improvement

`renderTypedCollectionStage`, `semanticProjection`, the `collectionMode` parameterisation, the audit settlement projection, `ContextInspectorHost` lens blocks, and the `.phead h2` direction/ellipsis rule. Being fixed **once**, per directive §5/§19 — *"ONE GOOD SHARED FOUNDATION, not ONE SHARED DEFECT COPIED EVERYWHERE"*. Not patched per surface.

## 8. Which components must remain unchanged (contract valid)

`TimelineReplayOwner` (single-instance invariant holds; **Q-4** retain-vs-retire is STOP/REPORT) · `AnalyticalCompareOwner` · `OperationalSessionOwner`/`OperationalTerminalHost` · `RelationInteractionOwner` · `AuditProvenanceInteractionCore`/Host · `ReviewAuthorityRegistry` gating · `ReusableToolbarTemplateOwner` **and the W04 `toolbarCommandIds`/`commandBus` split** (verified rendering 4/4 live controls) · `CollectionTableMatrixPresentationCore` contract · `SettingsCenterOwner` + `ScopedPreferencesOwner` (36/36 + D03A green) · `BottomShelf` closed-by-default · `WorkspaceFoundation` availability states · `SpatialInteractionKernel` · the default-EMPTY truth law · Portfolio's `AUTHORITY_DECISION_REQUIRED` refusal.

## 9. Which surfaces are empty/under-populated, and why

Measured against reference population: manual_ai ~8% · releases ~8% · configuration ~10% · validation ~15% · audit ~20% · processing ~25% · backup ~30% · health ~35% · portfolio ~15% · mastery ~25% · reviews ~35% · evidence ~35% populated / ~10% empty · enterprise 0 objects · scenarios & labs not empty but **mishandled** (wrong identity entirely).

**Cause:** generic mounts at `m0-controller-composition.ts:241` plus content models (queues, receipts, session tables, drill reports, trace chains) that **already exist** in references/domain code but are never projected. Per audits these gaps are **fillable from existing material — no invention required**. Where empty is *truthful* (W04 default-EMPTY law, Results provider unavailable) the **copy** is valid but the **treatment** is broken (bare `EMPTY / State` duplicated in RIGHT).

## 10. Which reference screenshots are being used

All 28 under `cep-writer/references/visual/**`, governed by `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` (SHA-256 verified against the register). Per family: `00_TODAY` 1 · `01_KNOWLEDGE_AND_LEARNING` 4 · `02_SIMULATION_AND_ENTERPRISE` 9 · `03_PROGRESS_AND_EVIDENCE` 4 · `04_SYSTEM_AND_OPERATIONS` 7 · `90_SUPPORTING_COMPONENT_REFERENCES` 3.

**Terminology bound (directive §11):** the reference is **VISUALIZE TREE-VIEW** (`CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png`, register label "Visualize main / **Tree**") — **not** "Visualize Review". No such surface is created or assumed. Library's structure-tree is a donor for hierarchy/icon/row/density only.

Exceptions: **Processing** = `INTENTIONALLY_NOT_GENERATED / CONTRACT_DERIVABLE` (no look invented). **RQ** = `REVIEWED_FINAL_CANDIDATE` = **Q-3 STOP/REPORT** (not Owner-final, not chased). **Shell** = contract-derived from `CEP-VIS-001-FINAL` §2.1 Global Destinations.

## 11. Which comparison loops are currently running

Three completed (W03/W04/W05) with L1-L4 discrepancies recorded and R5-R7 remediation queued. Two in flight (W01/W02). Each loop recorded: defect · severity · root-cause hypothesis · recommended change · evidence · re-comparison plan · acceptance decision — no auto-repair loops.

## 12. Which fixes can run in parallel

Surface-level remediation for disjoint surfaces (enterprise/scenarios/labs/runs · health/validation/manual_ai/backup/audit/releases/configuration · evidence/reviews/mastery/portfolio), the disposition-policy regeneration, and the two remaining visual audits — all parallel now.

## 13. Which shared changes must be serialized

`surfaces/m0-controller-composition.ts` (**RC-1/2/3** — single agent, PW-C slot, consumer regression across 7 surfaces) · `main.ts` · `foundation/workspace.ts` / `table-matrix.ts` / `context-inspector.ts` if the shared fix needs them (agent instructed to **report** instead of taking them) · anything writing `dist/**` or `assurance/**` (serialized through `tools/writer-serial.sh`) · git history (Coordinator only). W01's filed `SERIALIZED_HOTSPOT_REQUEST.md` (Today LEFT filter) is queued at PW-C slot 2.

## 14. Which acceptance decisions are being reopened

1. **Every prior `PASS` in the five acceptance matrices** — disposition policy P1-P6 (Pro ruling: neither blanket-BLOCKED nor sweep-PASS was defensible). Cross-matrix conflicts measured at **111 across 180 replicated subjects**.
2. **Every surface's visual acceptance** — `FUNCTIONAL_ONLY` is no longer sufficient (directive §15).
3. **CG2 subtest 1 attribution** — re-routed W04 → W02, and identified as an **oracle false-positive** (`VirtualizationOwner` substring matching the `universalVirtualizationOwner:false` truth field).
4. **W04's `81a2732` dist provenance** — recorded a transparency note; rule tightened forward to source-correspondence.

## 15. Updated completion status

| Workspace | Obligations | Functional | Visual | Status |
|---|---|---|---|---|
| W01 | 711 | CBF-002 FIXED, 5/5 browser flows PASS | audit in flight | `PASS_WITH_LIMITATION` |
| W02 | 1,485 | 5 source defects closed, 9/11 proofs | audit in flight | `PASS_WITH_LIMITATION` |
| W03 | 2,183 | PVF-001 closed, semantic checker 60/60 | **VISUAL_FAIL ×4, BLOCKED ×1** | `BLOCKED` (visual) |
| W04 | 1,445 | F-051 closed, 4 tests fixed, product fix verified | **VISUAL_FAIL ×4** | `BLOCKED` (visual) |
| W05 | 2,827 | CBF-001 + MFC-PF-003 closed, 8/8 flows | **VISUAL_FAIL ×8** | `BLOCKED` (visual) |
| **Total** | **8,651 / 8,651 dispositioned** | | **0 surfaces at `VISUAL_PASS`** | **`BLOCKED`** |

**Evidence integrity:** 8,651/8,651 rows dispositioned with `zero_loss: true` in all five workspaces; reference SHAs verified; screenshots hash-bound; two harness observations logged as `EVIDENCE/ORACLE` (non-deterministic image-render channel — auditors compensated with OCR + perceptual hashing + self-identifying composites).

**Two Owner decisions requested:**
1. **Product language.** `CEP-VIS-001-FINAL` is Arabic-first; every current centre is English. This is an `OWNER_CONSTRAINT` that materially changes 4 Arabic-reference surfaces (health, evidence, mastery, + today-adjacent).
2. **Q-1…Q-6** remain STOP/REPORT (Q-1 shell destination count · Q-2 Today provider owner · Q-3 RQ visual ceiling · Q-4 TimelineReplayOwner · Q-5 Portfolio grouping · Q-6 Manual-AI provenance).

**Next action:** apply RC-1/2/3 → re-run the 7 consumer regressions → route residual surface defects to per-surface L1-L4 remediation loops → drive `cross_matrix_consistency.conflicts` to 0 → final five-workspace review against the 18-box acceptance gate.
