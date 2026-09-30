# CONTROLLER REGISTERS

**Controller:** MiMo-V2.6-Pro · **Branch:** `writer/mi-serial`
**Authority:** Master Controller Contract §14/§15/§32 — the repository is the durable truth; chat memory is not.
**Companion:** `PREPARATION_GAP_REGISTER.md` (preparation gaps) · `../10_dispatch/SURFACE_DISPATCH_MATRIX.json` (ownership/dependency/reference map)

**Status vocabulary:** `PASS` · `PASS_WITH_LIMITATION` · `BLOCKED` · `UNKNOWN` · `NOT_STARTED` · `REOPENED`
**Acceptance authority:** Controller is final acceptance authority unless a genuine Owner decision is required. **Writers cannot accept their own work** — status stays `NOT_OWNER_ACCEPTED` until Controller review.

---

## 1. VISUAL DEFECT REGISTER

Severity `V0` cosmetic · `V1` minor inconsistency · `V2` meaningful mismatch · `V3` major mismatch · `V4` material surface failure.
Root cause: `SURFACE_COMPOSITION` · `SHARED_COMPONENT` · `CONTENT_MODEL` · `FIXTURE_DATA` · `RESPONSIVE_RULE` · `ARCHITECTURE` · `OWNER_CONSTRAINT` · `STALE_DECISION` · `IMPLEMENTATION` · `EVIDENCE/ORACLE` · `UNKNOWN`.

Repair loop contract: **DEFECT → SEVERITY → ROOT CAUSE HYPOTHESIS → CHANGE → EVIDENCE → RE-COMPARISON → ACCEPT / REOPEN**.

| Defect | Surface/Scope | Sev | Root cause hypothesis | Change | Evidence | Re-comparison | State |
|---|---|---|---|---|---|---|---|
| VD-001 | All 23 surfaces | V4 | SURFACE_COMPOSITION — surfaces render as interchangeable card grids with weak identity, mixed-language labels, dead lower regions | Per-surface rewrite in composition (23 surface units) | Owner visual rejection (contract §0) + `assurance/browser-workspace-pane-context.png` (sha256 `e307352f…`, 900×980) | pending | OPEN |
| VD-002 | Scenarios, Labs (and other operational surfaces) | V4 | STALE_DECISION — Library/Learn composition conceptually cloned into unrelated surfaces | Anti-cloning rule encoded in standard + packets; W03-SCENARIOS packet flags this as the historical failure site | contract §5/§34 | pending | OPEN |
| VD-003 | Global language/direction | V3 | STALE_DECISION — Arabic baked in as product-language authority (`locale:{safeDefault:'ar'}`, `<html dir="rtl" lang="ar">`) | Dispatched to `W05-CONFIGURATION` (owns preferences/settings seams) | `foundation/global/preferences/schema.ts`, `dist/index.html` | pending | OPEN |
| VD-004 | RQ surface | V2 | STALE_DECISION — reference authority unresolved (`REVIEWED_FINAL_CANDIDATE`, never promoted) | Bound as `CANDIDATE__AUTHORITY_UNRESOLVED`; Writer must report the gap, must not promote | `FINAL_VISUAL_REFERENCE_REGISTER.md` | pending | OPEN |
| VD-005 | Writer execution system (W01-TODAY, W05-AUDIT both affected) | V3 | ARCHITECTURE — Flash Writers attempt wholesale rewrites of 20–75 KB surface files (`today/presentation.ts` 39,723 B, `audit/index.ts` 27,876 B) and exhaust output budget mid-build. Sessions terminate with a work-in-progress fragment and **no report**. Capability is fine (W01-TODAY correctly decomposed the reference into regions and captured AR/RTL + EN/LTR baselines at 480/768/1024/1280); **completion** is the failure. | Added §17 BUDGET DISCIPLINE & COMPLETION GUARANTEE to `VISUAL_EXECUTION_STANDARD.md`: surgical edits over full rewrites, vertical slices, report written incrementally and prioritised above all else | 2 premature-termination sessions; `surfaces/today/presentation.ts` and `surfaces/audit/index.ts` both unchanged (mtimes predate writer runs) | re-launch as continuation | ACCEPTED FIX — monitoring |

---

## 2. SHARED-COMPONENT RISK REGISTER

Protocol (contract §25): owner → contract → consumers → current behavior → reference expectations → historical assumptions → root cause → shared-vs-local → smallest correct change → regression every material consumer.

| ID | Shared component / seam | Owner | Consumers | Risk | Mitigation | State |
|---|---|---|---|---|---|---|
| SC-01 | `foundation/global/shell/navigation.ts` + `cep-destinations.ts` | W01-SHELL | all 23 surfaces | Global chrome change ripples everywhere | Single owner; everyone else requests via `tools/writer-serial.sh` | MONITORED |
| SC-02 | `foundation/global/preferences/` + `settings/` | W05-CONFIGURATION | all surfaces (language/direction) | Language policy is cross-cutting | Single owner; G-20 fixed at shared level, not per-consumer | ACTIVE (VD-003) |
| SC-03 | `foundation/extensions.css`, `workspace*.ts`, `pane-layout.ts`, `region-contract.ts` | W01-SHELL | all surfaces | Shared visual tokens could flatten surface identity | Shared governs MECHANICS only; composition stays local | MONITORED |
| SC-04 | `surfaces/m0-controller-composition.ts`, `main.ts` | W01-SHELL | all surfaces | Composition root collision | Controller-owned integration; serialized | MONITORED |
| SC-05 | `surfaces/composition/w0*-rescue.ts` | per-wave owner | cross-surface rescue | Multi-surface mount points | One owner each (see PARALLEL_EXECUTION_PLAN §1) | MONITORED |
| SC-06 | `dist/**` (generated) | **Controller** | everyone | **Global collision** — every `npm run build:runtime` rewrites the tree | Serialized via `tools/writer-serial.sh`; writers never commit `dist/` concurrently | ACTIVE |
| SC-07 | Library tree/panel mechanics (donor) | W02-LIBRARY | LEARN, VISUALIZE TREE-VIEW | Donor thrash, or composition leakage into donees | WAVE-2 serialization; donor is MECHANICS-only, never composition | ACTIVE |

---

## 3. ACCEPTANCE REGISTER

Dimensions required (all relevant): FUNCTION · STRUCTURE · VISUAL FIDELITY · DENSITY · CONTENT COMPLETENESS · RESPONSIVE BEHAVIOR · RTL/LTR/BIDI · REFERENCE CONSISTENCY · ARCHITECTURAL CONSISTENCY · SHARED-COMPONENT APPROPRIATENESS · EVIDENCE LINEAGE.

| Unit | Surface | Writer report | Controller re-verification | Acceptance | Notes |
|---|---|---|---|---|---|
| W01-TODAY | today | pending | pending | NOT_STARTED | Wave-1 |
| W02-RESEARCH-QUALITY | rq | pending | pending | NOT_STARTED | Wave-1 · reference authority unresolved |
| W03-SCENARIOS | scenarios | pending | pending | NOT_STARTED | Wave-1 · anti-cloning failure site |
| W04-EVIDENCE | evidence | pending | pending | NOT_STARTED | Wave-1 · Arabic reference must not set product default |
| W05-AUDIT | audit | pending | pending | NOT_STARTED | Wave-1 |
| W05-CONFIGURATION | configuration | pending | pending | NOT_STARTED | Wave-1 · owns language policy seam (G-20) |
| W02-LIBRARY | library | pending | pending | NOT_STARTED | Wave-2 (donor-coupled) |
| W02-LEARN | learn | pending | pending | NOT_STARTED | Wave-2 |
| W02-VISUALIZE | visualize | pending | pending | NOT_STARTED | Wave-2 · **VISUALIZE TREE-VIEW** (not "Visualize Review") |
| W03-ENTERPRISE | enterprise | pending | pending | NOT_STARTED | Wave-3 |
| W03-LABS | labs | pending | pending | NOT_STARTED | Wave-3 · anti-cloning failure site |
| W03-RUNS | runs | pending | pending | NOT_STARTED | Wave-3 |
| W03-RESULTS | results | pending | pending | NOT_STARTED | Wave-3 · depends on W03-RUNS |
| W04-REVIEWS | reviews | pending | pending | NOT_STARTED | Wave-3 · depends on W04-EVIDENCE |
| W04-MASTERY | mastery | pending | pending | NOT_STARTED | Wave-3 |
| W04-PORTFOLIO | portfolio | pending | pending | NOT_STARTED | Wave-3 |
| W05-HEALTH | health | pending | pending | NOT_STARTED | Wave-3 |
| W05-PROCESSING | processing | pending | pending | NOT_STARTED | Wave-3 · reference `INTENTIONALLY_NOT_GENERATED` (contract-derivable) |
| W05-VALIDATION | validation | pending | pending | NOT_STARTED | Wave-3 · owns `w05-rescue` seam |
| W05-MANUAL-AI | manual_ai | pending | pending | NOT_STARTED | Wave-3 |
| W05-BACKUP | backup | pending | pending | NOT_STARTED | Wave-3 |
| W05-RELEASES | releases | pending | pending | NOT_STARTED | Wave-3 |
| W01-SHELL | shell | pending | pending | NOT_STARTED | Wave-4 · global chrome seams |

---

## 4. EVIDENCE / LINEAGE MAP

Binding required on every artifact: candidate · commit/tree · environment · test · viewport · timestamp · **image identity** (path + sha256 + dims).

| Evidence | Bound candidate | Image identity | Class | State |
|---|---|---|---|---|
| `assurance/browser-workspace-pane-context.png` | worktree `c82cec63…` | sha256 `e307352f562e472de5f0351671ffdaf129bbe08c38a6c4853188b104ae10993a`, 900×980, 87,369 B | CURRENT_RESULT (pre-remediation baseline) | RETAINED — used for VD-001 |
| `assurance/BROWSER_CONFORMANCE_RECEIPT.json` | source tree `64d103fa…` vs current `7b01a08d…` | n/a | stale | **ORPHANED LINEAGE (G-24/G-36)** — 6 flows / 1 pass / 5 fail. Requires re-bind. |
| Vision capability test | live | sha256 `e307352f…` (same bytes read and interpreted) | CAPABILITY_PROOF | **PASS** (contract §20) — OpenCode image delivery + Controller vision + provider image input all confirmed |

**Image-identity discipline:** before any visual claim, confirm the analysed bytes are the claimed bytes (path + sha256 + dims). A moving-worktree capture is not canonical without lineage labelling. Superseded captures are retained and labelled, never reused as current proof.

---

## 5. EXECUTION CHECKPOINTS

| # | Checkpoint | Result |
|---|---|---|
| CP-1 | Truth reconstruction (repo, references, requirements, decisions, historical, evidence) | PASS — 2 recon passes, 23-surface census confirmed, reference register located |
| CP-2 | Governance repair (§3/§8/§13) | PASS — reference-demotion removed; standard + packet inheritance in place |
| CP-3 | Skills created (§12) | PASS — 4/4 persisted and discoverable |
| CP-4 | Dispatch rebuilt (§7/§23) | PASS — 23 units, computed reference identity, collision seams declared |
| CP-5 | Capability gates (§20/§21/§30) | PASS — vision empirical, models live, preview/capture flow confirmed |
| CP-6 | Governance durable in repo | PASS — commit `7c9c153` |
| CP-7 | Wave-1 launch | **IN PROGRESS** — 6 Writers live on `mimo-v2.6-flash` |
| CP-8 | Controller review of Wave-1 | NOT_STARTED |
| CP-9 | Wave-2/3/4 launch | NOT_STARTED |
| CP-10 | Final integration + candidate identity + lineage verification | NOT_STARTED |

---

## 6. REMEDIATION STATUS

| Item | Owner | State |
|---|---|---|
| G-24/G-36 stale browser conformance receipt lineage | Controller | OPEN — re-bind to current candidate before final integration |
| G-35 pre-existing manifest drift (10+ entries) | Controller | OPEN — per-entry adjudication; deliberately not auto-absorbed |
| G-33 repository/evidence hygiene (674 MB, 1000 PNGs) | Controller | OPEN — classification done in gap register §D; removal deferred until lineage extracted |
| G-20 language/direction authority defect | W05-CONFIGURATION | DISPATCHED |
| G-21/G-25 visual + structural surface rejection | 23 surface units | DISPATCHED (Wave-1 live) |
