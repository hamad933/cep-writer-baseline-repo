# W05 WORKSPACE RECONSTRUCTION PACKAGE (COMPLETE)

Execution contract: `../09_writer_forge/W05_writer_packet.md` · Requirements: `../09_writer_forge/W05_REQUIREMENTS.csv` (2,827 rows; sub-lanes W05A 1,427 / W05B 1,400)

| § | Content |
|---|---|
| 1 WORKSPACE_IDENTITY | W05 = Health + Processing + Validation + Manual AI (AI Bridge) + Backup + Audit + Releases + Configuration. Historical W05A/W05B split reconciled to ONE workspace (RC-WS-1); sub-lanes = internal phases only. |
| 2 SURFACE_CENSUS | **HEALTH → `adapters/health-runtime.ts`** and **PROCESSING → `adapters/processing-runtime.ts`** (B-2 RESOLVED, HIGH; composition chains `w05-rescue.ts` → `m0-controller-composition.ts` L241 → `main.ts` L274; tests `tests/rescue/S16_W05_HEALTH_PROCESSING/`) · validation 359 · manual_ai 352 (`adapters/manual_ai/domain-adapter.ts`, `ManualIoBridge`) · backup 354 · audit 345 · releases 354 · configuration 347. |
| 3 SHARED_MECHANICS | w05-rescue seam (**group seam, not configuration-only**) · persistence kernel + Balanced6 seed (W05 policy owner, ALL consume — CBF-001) · SC-011 (`settings.transfer` + ScopedPreferencesOwner) · backup/restore capability · AI Bridge truth ceilings. |
| 4 CURRENT_STATUS | Open: **CBF-001** (P0 persistence seed `section` type vs StructuredTreeKernel) · **MFC-PF-003** (SC-011 exposure) · C03-GATE-021 Windows cluster. Baseline FAIL `runtime-causal-consequence` = HARNESS probe bug. |
| 5 HISTORICAL_PROVENANCE | Drive `03_W05_RUNTIME_CAPABILITY_CLOSURE`, `MISSION_W05_RUNTIME_CAPABILITY_CLOSURE`, `PS006C_W05_RUNTIME_PERSISTENCE_CAPABILITY_MATRIX.json`, `L05/L06/L08` capability proofs, `CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md`, `backup-restore-capability.mjs`, RCF `W5_A`/`PS03`/`PS04`. |
| 6 REQUIREMENTS | 2,827 rows: decisions 581 · QA 420 · findings 577 · gaps 115 · values 1,086 · identity/profile/visual/result 19 · guardrails 8. pos 1,765 / neg 1,605 / proof 2,827. |
| 7 DECISIONS | node:sqlite direction · Save≠Autosave≠Recovery law · backup/staging law · OD-20260917-049/050 terminal truth · STACK_NOT_FROZEN · port 4173/4174 split. |
| 8 RCF | Historical W5_A (explicit ceiling), PS03/PS04. Current real-consumer runs REQUIRED: persistence chain, backup/restore round-trip, AI Bridge ceilings, processing retry/cancel. |
| 9 CURRENT_EVIDENCE | `assurance/MODEL_TEST_RESULTS.json` (regenerated); Balanced6 seed/test scripts. |
| 10 GAPS | CBF-001 closure · MFC-PF-003 closure · Windows proof cluster (PTY raw-I/O, HWND, input-direction) · OC-C-06 registry revision (2 rows, Controller/Owner side). |
| 11 CONFLICTS | **OC-C-06 duplication risk** — neutralized by binding duplication ban in the packet · C-12 terminal/stack supersessions · C-9 historical source identity. |
| 12 DEPENDENCIES | shell (W01) · policy mechanics (W02) · consumed by ALL workspaces via persistence kernel. |
| 13 CROSS_WORKSPACE_CONSUMERS | Persistence kernel + seed: all 23 surfaces; SC-011: all settings consumers. |
| 14 PRIMARY DONORS | `backup-restore-capability.mjs` · PS006C capability matrix · runtime/persistence bridge reference. |
| 15 BROWSER_FLOWS | Packet §9 (8 flows). |
| 16 ACCEPTANCE_MODEL | Packet §10; truthful-capability ceilings are acceptance-critical here. |
| 17 EVIDENCE_MODEL | Packet §8; DB state hashes for persistence claims; runner-type labelling for Windows claims. |
| 18 WRITER_OWNERSHIP_BOUNDARY | Owns 8 surfaces + persistence/SC-011/backup policy; single W05 owner over both sub-lanes. |
| 19 INTEGRATION_BOUNDARY | P2 parallel group (with W03); W05A/W05B internal parallel phases; HIGH merge risk on persistence kernel. |
| 20 STOP/BLOCK | Packet §15; any request to create `adapters/surfaces/*` or `surfaces/{health,processing}/**` → STOP/REPORT. |
