> ## CURRENT ROUTE-MIMO-AGENT OVERLAY — OD-20261002-087
> **Current role:** `W05_MILESTONE_SCOPE_AND_OBLIGATION_PACKET__NOT_CURRENTLY_DISPATCHED`  
> **Milestone surfaces:** HEALTH + PROCESSING + VALIDATION + MANUAL_AI + BACKUP + AUDIT + RELEASES + CONFIGURATION.  
> The current carrier runs parallel disjoint lanes under `OD-20261002-087`: one mutating Writer per exact bounded Surface/lane, value-weighted (`OD-20260916-043`), shared hotspots/same-owner/dependencies/final wiring serialized, each lane in an isolated candidate branch/worktree from the exact Controller-bound parent. `OD-20260928-085` (ONE persistent sequential Writer, W01→W05 milestones) is historical task-specific lineage; the W05 grouping above remains scope grouping, not a sequential mandate. Any body text with per-Surface-parallel prohibitions from the serial era, historical `writer/cep-serial` lineage, historical baseline SHAs, fixed model names, or old PRE_WRITER gate wording is lineage only.  
> Before W05 lanes may mutate Product, the Controller must rebind actual remote parent/HEAD/tree, exact current Product subtree, Writer authority projection + W05-applicable subset, current SurfaceProfiles/oracles/references, open findings, exact writable roots/shared-seam locks, tests/falsifiers/evidence, and STOP gate — via the final evidence-reuse DAG after `RECOVERY_GATE_PASS`.  
> W05 owns the group-level `surfaces/composition/w05-rescue.ts` seam (sole owner: W05-VALIDATION); the HEALTH and PROCESSING structural packets do not independently own/write it.  
> **Current Controller phase:** `EXISTING_AUDIT_CORPUS_RECONCILIATION__BOUNDED_GAP_FILL__PARALLEL_DAG_REBIND`; no Writer launch is authorized from this packet now (until `RECOVERY_GATE_PASS`).

# W05_COMPLETE_WORKSPACE_PACKET — Health · Processing · Validation · Manual AI (AI Bridge) · Backup · Audit · Releases · Configuration

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
W05 owns the platform-integrity family: Health, Processing, Validation, Manual AI (AI Bridge),
Backup/Restore, Audit, Releases, Configuration. Historical corpus split this into **W05A**
(health, processing, validation, manual_ai = 1,427 rows) and **W05B** (audit, backup, configuration,
releases = 1,400 rows); the current law is **one workspace W05 = 2,827 rows** (adjudication RC-WS-1),
with sub-lanes usable only as internal parallel phases under single W05 ownership.

## 2. Baseline binding
`hamad933/cep-writer-baseline-repo` · lineage `main@37c4d765…` → `writer/cep-serial@48fec276…` → `writer/mi-serial` · CANONICAL `480dbe9d…cc9641`/273 @ `293dd1e0` · CLEAN HEAD `3f3ad1e0…`/287 · WORKTREE VARIANT `c82cec63…`/287 (3 pre-existing deltas) · Node 22.16.0 · `node:sqlite` persistence · Playwright 1.62.1.

## 3. Full surface inventory (verified — location resolutions are binding)
| Surface | Implementation (verified) | Obligations |
|---|---|---|
| HEALTH | **`adapters/health-runtime.ts`** (`HealthRuntimeAdapter`, `W05HealthDomain`, `health.refresh/inspect/diagnose`), composed `surfaces/composition/w05-rescue.ts` → `m0-controller-composition.ts` L241 → `main.ts` L274; tests `tests/rescue/S16_W05_HEALTH_PROCESSING/`; build `dist/adapters/health-runtime.js` | 355 |
| PROCESSING | **`adapters/processing-runtime.ts`** (`ProcessingRuntimeAdapter`, `W05ProcessingDomain`, `processing.inspect/retry/requestCancel/validationHandoff`) | 361 |
| VALIDATION | `surfaces/validation/`, `profiles/validation.json` | 359 |
| MANUAL_AI (AI Bridge) | `adapters/manual_ai/domain-adapter.ts` (`ManualAiDomainAdapter`, `ManualIoBridge`) + `surfaces/manual_ai/composition.ts`; ceiling `hiddenProviderCalls:0, automaticCanonicalPublication:false` | 352 |
| BACKUP | `surfaces/backup/`, `profiles/backup.json`; capability donor `backup-restore-capability.mjs` (Drive) | 354 |
| AUDIT | `surfaces/audit/`, `profiles/audit.json` | 345 |
| RELEASES | `surfaces/releases/`, `profiles/releases.json` | 354 |
| CONFIGURATION | `surfaces/configuration/`, `profiles/configuration.json`; SC-011 SettingsCenter action home `settings.transfer` | 347 |

**DUPLICATION BAN (binding, resolves OC-C-06/A-1):** `SURFACE_READINESS_REGISTRY.json` planned paths
`adapters/surfaces/{health,processing}-domain.ts` and writable scope `surfaces/{health,processing}/**`
are **stale planning rows**. Do NOT create those modules/trees; implement in the verified adapters
above. Registry revision (2 rows) is a Controller/Owner follow-up, not Writer scope.

## 4. Shared mechanics — ownership
| Mechanic | IMPLEMENTATION_OWNER | POLICY_OWNER | Consumers |
|---|---|---|---|
| w05-rescue seam | **W05-group seam (not configuration-only)** | W05 | W05 surfaces |
| Persistence kernel + Balanced6 seed | persistence owners (`stack/local-runtime/persistence/**`) | **W05** | ALL workspaces (CBF-001) |
| SC-011 Preference export/import/reset | SettingsCenterOwner (`settings.transfer`) + ScopedPreferencesOwner | W05 | all (MFC-PF-003) |
| Backup/restore capability | W05 backup owners | W05 | — |
| AI Bridge policy | W05 manual_ai owners | W05 | — |
| Audit/release truth | W05 owners | W05 | — |

## 5. Requirements
Input: `W05_REQUIREMENTS.csv` — **2,827 rows, all in scope** (sub-lanes W05A 1,427 / W05B 1,400).
Layers: OWNER_DECISION 581 · OWNER_QA 420 · ROOT_FINDING 577 · FORWARD_GAP 115 · DURABLE_ANCILLARY 1,086 · identity/profile/visual/result 19 · guardrails 8. Proof coverage: positive 1,765 / negative 1,605 / proof_requirement 2,827. Zero-loss law binding.

## 6. Decisions & findings
Decisions (581 obligations): node:sqlite direction + Save≠Autosave≠Recovery law + backup/staging law (runtime/persistence bridge reference), STACK_NOT_FROZEN with Windows proof cluster (PTY raw-I/O, HWND, input-direction — ties C03-GATE-021), OD-20260917-049/050 terminal truth.
Findings: **CBF-001** (P0: persistence seed `section` type vs StructuredTreeKernel — cross-surface persistence consumers), **MFC-PF-003** (SC-011 PreferenceExportImportResetModel exposure), C03-GATE-021 (Windows native target — automated checks first, one Owner-device run only).
- **Open questions (do NOT decide silently — STOP/REPORT):** Q-6 Manual-AI provenance mechanism (`../03_historical/open_questions.md`).

## 7. RCF expectations
Historical: `W5_A` (explicit `LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE` ceiling), `PS03`/`PS04` persistence proofs, `L05/L06/L08` capability proofs (`../04_rcf/rcf_recovery.md`). Current real-consumer runs REQUIRED for: persistence save/restore/recovery chain, backup/restore capability, AI Bridge truthful-ceiling behavior, processing retry/cancel. `L07` taxonomy + `PW01` ceilings (AUTOSAVE ≠ SAVE ≠ RECOVERY) are product truth here.

## 8. Evidence expectations
Full binding per `../08_evidence/evidence_contract.md`; persistence evidence must bind DB state hashes; backup evidence must prove exact restorability; Windows proof cluster claims must state runner type (automated vs Owner-device).

## 9. Browser flows
health refresh/inspect/diagnose · processing inspect/retry/requestCancel/validationHandoff · validation flow · manual AI bridge (truthful ceilings) · backup → restore round-trip · audit trail recording · releases view · configuration + SC-011 transfer. Known global FAIL `runtime-causal-consequence` (HARNESS probe bug — fix probe before product conclusions).

## 10. Acceptance criteria
(a) 2,827 rows dispositioned · (b) CBF-001 closed (seed type vs kernel) with persistence proof · (c) MFC-PF-003 resolved (SC-011 exposure correct) · (d) no duplicate health/processing modules (duplication ban held) · (e) backup/restore round-trip proven real-consumer · (f) evidence bound exactly.

## 11. Negative cases
Autosave must never be presented as save or recovery · hidden provider calls must stay 0 in Manual AI · restore must not silently drop state · seed data must not violate kernel types (CBF-001 regression) · preference import must not clobber unscoped state.

## 12. Dependencies & inputs
`W05_REQUIREMENTS.csv`, 8 SurfaceProfiles, W05 ORACLE-012 + ORACLE-009, applicable Owner decisions, runtime/persistence bridge reference, `tests/rescue/S16_W05_HEALTH_PROCESSING/`. Consumes: shell (W01), policy mechanics (W02).

## 13. Donor/reference map
`backup-restore-capability.mjs` (Drive donor), `PS006C_W05_RUNTIME_PERSISTENCE_CAPABILITY_MATRIX.json`, `L05/L06/L08` capability proofs, `CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md`.

## 14. Outputs & checkpoints
Candidate deltas + `writer-output/W05/` evidence + PS03-shaped proof; checkpoints per sub-lane phase (W05A then W05B, or parallel under one owner), per finding, integration slot. No push to `main`; no self-merge/promote.

## 15. Stop conditions
Standard stop set + any request to create `adapters/surfaces/*` or `surfaces/{health,processing}/**` (duplication ban) → STOP/REPORT · any STACK_FROZEN assumption (stack is NOT frozen).

## 16. Integration boundaries & parallelism
P2 group (parallel with W03). Internal phases: W05A/W05B parallelizable under single W05 owner. HIGH merge risk: persistence kernel (all-workspace consumer), w05 seam, SC-011.

## 17. Conflict rules
Code wins over registries (OC-C-06 binding); terminal/stack rows superseded per OD-20260917-049/050 (C-12); must-never-promote list binding.

## 18. Rollback / recovery
Checkpointed candidates; DB/persistence evidence hashed; recovery from checkpoint.

## 19. Completion proof
Six states required.

## 20. Handoff
Rows dispositioned (both sub-lanes), CBF-001 + MFC-PF-003 closures with proofs, backup/restore round-trip evidence, receipt bound to candidate, conflicts, residual gaps (Windows proof cluster status explicit).
