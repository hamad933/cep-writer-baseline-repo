> ## CURRENT ROUTE-MIMO-AGENT OVERLAY — OD-20261002-087
> **Current role:** `W01_MILESTONE_SCOPE_AND_OBLIGATION_PACKET__NOT_CURRENTLY_DISPATCHED`  
> **Milestone surfaces:** SHELL + TODAY.  
> The current carrier runs parallel disjoint lanes under `OD-20261002-087`: one mutating Writer per exact bounded Surface/lane, value-weighted (`OD-20260916-043`), shared hotspots/same-owner/dependencies/final wiring serialized, each lane in an isolated candidate branch/worktree from the exact Controller-bound parent. `OD-20260928-085` (ONE persistent sequential Writer, W01→W05 milestones) is historical task-specific lineage; the W0X grouping above remains scope grouping, not a sequential mandate. Any body text that treats `1 Writer → 1 Surface` as fixed topology, plus historical `writer/cep-serial` lineage, historical baseline SHAs, fixed model names, or old PRE_WRITER gate wording, is **lineage only**.  
> Before this family's lanes may mutate Product, the Controller must rebind the actual remote parent/HEAD/tree, exact current Product subtree, Writer authority projection + lane-applicable subset, current SurfaceProfiles/oracles/references, current open findings, exact writable roots/shared-seam locks, tests/falsifiers/evidence, and STOP gate — via the final evidence-reuse DAG after `RECOVERY_GATE_PASS`.  
> The Surface packets under `surface_units/` are candidate lane units — structural scope/reference inputs launchable only through exact packet binding from the final DAG, never independent launch authority.  
> **Current Controller phase:** `EXISTING_AUDIT_CORPUS_RECONCILIATION__BOUNDED_GAP_FILL__PARALLEL_DAG_REBIND`; no Writer launch is authorized from this packet now (until `RECOVERY_GATE_PASS`).

# W01_COMPLETE_WORKSPACE_PACKET — Today + Shared Global Shell

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

**Generated:** 2026-09-29T02:35Z by NEW CEP Controller · **Status:** execution-ready, dispatch-gated by `../11_gates/PRE_WRITER_DISPATCH_GATE.md`

## 1. Workspace identity
W01 owns the **Today** surface and the **Shared Global Shell** (shell surface + global shell mechanics),
plus Blueprint→Production conversion and diagnostics/deep-work state as scoped below.

## 2. Baseline binding (immutable unless Owner directive changes it)
| Binding | Value |
|---|---|
| Repository | `hamad933/cep-writer-baseline-repo` |
| Serial lineage | `main@37c4d765…` → `writer/cep-serial@48fec276…` → `writer/mi-serial` (create at first serial work; never from `main` or the historical repo; `writer/ci-serial` must never exist) |
| CANONICAL product source | `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641` / **273 files** @ `293dd1e0…`/tree `3101c069…` |
| CLEAN HEAD identity | `3f3ad1e0…24e20` / 287 @ `48fec276` |
| WORKTREE VARIANT (current) | `c82cec63…cb5f` / 287 (includes 3 pre-existing unadjudicated deltas: `main.ts`, `foundation/extensions.css`, `foundation/operational/xterm-renderer.ts` — `../08_evidence/worktree_disposition.md`) |
| Runtime | Node 22.16.0, native TS/ESM, Playwright 1.62.1, @xterm/xterm 6.0.0, `node:sqlite`, committed `dist/` |

## 3. Full surface inventory (exact current locations — verified)
| Surface/feature | Implementation | Notes |
|---|---|---|
| SHELL | `surfaces/shell/`, profile `profiles/shell.json`, destination registry `foundation/…/cep-destinations.ts` | 352 obligations |
| TODAY | `surfaces/today/`, `profiles/today.json`, truth tooling `tools/c3-today-truth/` | 359 obligations |
| Global shell mechanics | `foundation/global/` (shell nav owner), `surfaces/m0-controller-composition.ts`, `main.ts` | serialized hotspots |
| Diagnostics state | `main.ts` L286-288 (`?diagnostics=foundation`), `m0-controller-composition.ts` L41 `diagnosticsEnabled()`, `foundation/workspace.ts` L12 | app-level gate EXISTS |
| `domain-diagnostics` bottom tab | **NOT IMPLEMENTED** | requirement candidate only — do not invent (A-2) |
| Deep-work state | `foundation/global/bottom-shelf.ts` (`BottomDeepWorkOwner`), `state.surface.bottomOpen` (`workspace-host-kernel.ts` L31) | CURRENT_VALIDATED |
| Blueprint→Production | `foundation/accepted-runtime.ts` (`CONVERSION_COMPATIBILITY`, `commitConversion`, `openMapping()`); SC-039 `ProductionMappingBoundary` `implementation:null` | donor-local; DECISION_REQUIRED (A-3) |

## 4. Shared mechanics — ownership (single owner each; two-field model)
| Mechanic | IMPLEMENTATION_OWNER | POLICY_OWNER | Consumers |
|---|---|---|---|
| Global shell navigation | GlobalShellNavigationOwner (`foundation/global`) | W01 | all workspaces |
| Workspace region grammar | WorkspaceRegionCore | W01 | all |
| Pane responsive state | PaneResponsiveCore + WorkspacePaneLayoutOwner + WorkspaceResponsiveLayoutPolicy | W02 (responsive policy) | all |
| Bottom deep-work | BottomDeepWorkOwner (foundation) | W01 | W02/W03 consumers |
| `main.ts` + `m0-controller-composition.ts` | **SERIALIZED — Controller-assigned slot only** | Controller | all |

**Consumption rule:** W01 OWNS shell mechanics; other workspaces CONSUME read-only. Duplicate shell
implementations are forbidden.

## 5. Requirements
Input: `W01_REQUIREMENTS.csv` — **711 rows, all in scope** (shell 352 + today 359).
Layers: OWNER_DECISION 147 · OWNER_QA_DEEP_AUDIT 104 · ZL01_ROOT_FINDING 140 · ZL01_FORWARD_GAP 30 ·
ZL01_DURABLE_ANCILLARY 275 · identity/profile/visual/result rows 15 · HISTORICAL_DURABLE_GUARDRAIL 2
(guardrails = history, not law). Proof coverage: positive 442 / negative 406 / proof_requirement 711.
**Zero-loss law:** every row lands in the acceptance matrix or carries `NOT_APPLICABLE_JUSTIFIED`.

## 6. Decisions & findings in scope
- 147 Owner-decision obligations (register `OWNER_DECISION_LIVE_REGISTER.csv`, 111 rows; applicability set `decision_ledger.csv`). Binding examples: OWNER-20260910-001 (customization principle), -002 (defaults are starting values), -005 (maximize executable reuse), -008 (read canonical authority before raw candidates).
- Findings: **CBF-002** (P0: Back restores route, loses semantic context — TODAY filter side), **C03-GATE-023** (shell destination authority — Owner-authority-only; `destinationCountFrozen=false`, do NOT invent a final destination count), C03-GATE-020/024 shared obligations.
- **Open questions (do NOT decide silently — STOP/REPORT):** Q-1 shell destination count (`destinationCountFrozen=false`), Q-2 Today provider owner (`../03_historical/open_questions.md`).

## 7. RCF expectations
Use `L07` taxonomy (`primaryLiveOperationalConsumer` / `recordedConsumer` / `notApplicable`). Real-consumer proof required for shell navigation + today state; fixture results never satisfy a `proof_requirement`. Proof shape: `PS03` admission receipt template (familyOwner + consumers + targetedTests + centralPropagation + exactRevert). Claim ceilings per `PW01`: AUTOSAVE ≠ SAVE ≠ RECOVERY; declare `TRUTHFUL_BOUNDED` where applicable.

## 8. Evidence expectations
Bind every artifact: candidate (`480dbe…/273` or explicitly-labeled variant), commit, tree, surface, flow, browser+version, timestamp, expected/actual. Naming `evidence/W01/<surface>/<flow>-<ts>-<candidate8>.<ext>`. No orphan screenshots; no "passed" without reproducible context.

## 9. Browser flows
shell destination routing · today render + filter · back/forward semantic context (CBF-002 regression) · deep-work open/close lifecycle · diagnostics gate (positive + negative). Contract fields per `../07_browser/browser_contract.md`; classify failures PRODUCT|HARNESS|ENVIRONMENT|ORACLE|EVIDENCE|LINEAGE|UNKNOWN. Known baseline: `workspace.transient-and-pane-lifecycle` PASS on `c82cec63…`; 5 flows failing in other workspaces are NOT W01's.

## 10. Acceptance criteria
(a) all 711 rows dispositioned; (b) shell five-destination functional baseline preserved, `destinationCountFrozen=false` respected; (c) CBF-002 regression proven fixed or explicitly bounded with evidence; (d) deep-work lifecycle matches `BottomDeepWorkOwner` contract; (e) evidence bound to exact candidate; (f) no duplicate shell mechanics.

## 11. Negative cases
Back/forward must not silently reset semantic context · diagnostics panel must NOT appear without `?diagnostics=foundation` · destination count must not be frozen or invented · shell nav must not create domain state (SC-001 hard boundary) · deep-work bottom must be `hidden+inert` when closed.

## 12. Dependencies & inputs
Inputs: `W01_REQUIREMENTS.csv`, SurfaceProfiles shell/today, applicable Owner-decision rows, oracles (none W01-specific), visual references (CONSTRUCTION AUTHORITY — see `VISUAL_EXECUTION_STANDARD.md` §2), `../05_foundation/ownership_adjudication.md`. Deps: foundation/global shared owners (consume-only), persistence seed (CBF-001 — W05-owned) for today state.

## 13. Donor/reference map
Library Editor v1.2.17 = accepted design donor (OWNER-20260910-003) for editor primitives only; Blueprint material = requirement/value/evidence input only (OWNER-20260910-004); donor disposition per `archaeology/DONOR_PRESERVE_IMPROVE_REJECT_REGISTER.csv`.

## 14. Outputs & checkpoints
Outputs: candidate code delta + `writer-output/W01/` evidence bundle + completion proof (PS03 shape). Checkpoints: `checkpoint(W01-…)`: at surface start, per finding closure, at integration. Never push to `main`; never self-merge/release/promote.

## 15. Stop / block conditions
STOP if: an old source conflicts with this packet (report, do not choose) · ownership ambiguity appears · oracle undefined for an assertion · evidence cannot bind to a candidate · product mutation would exceed the allowlist · any step needs a secret. Hard stop → report to Controller.

## 16. Integration boundaries & parallelism
Parallel-safe with W02/W04 (P1 group). Shared-hotspot lock: `main.ts` + `m0-controller-composition.ts` serialized; W01 proposes, Controller assigns slot. Merge risks HIGH for shell owners — single-writer rule per mechanic.

## 17. Conflict rules
Registry-vs-code conflicts: **code wins** (current executable state); record conflict, do not silently adopt registry paths (see OC-C-06 class). Must-never-promote list binding (`../03_historical/conflict_register.md`).

## 18. Rollback / recovery
Candidate-only outputs; checkpoint commits on the serial branch; recovery = re-dispatch from last checkpoint with exact candidate re-binding. Preserve prior evidence; never delete.

## 19. Completion proof
Implementation state + required browser state + evidence state + acceptance state + integration state + checkpoint state — all six required. A code change alone is not completion.

## 20. Handoff
Report to Controller: rows dispositioned (with `NOT_APPLICABLE_JUSTIFIED` list), findings closed/bounded, evidence index with hashes, browser receipt bound to exact candidate, conflicts encountered, residual gaps.
