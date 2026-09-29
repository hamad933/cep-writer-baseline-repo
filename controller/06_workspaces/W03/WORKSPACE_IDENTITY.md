# W03 WORKSPACE RECONSTRUCTION PACKAGE (COMPLETE)

Execution contract: `../09_writer_forge/W03_writer_packet.md` · Requirements: `../09_writer_forge/W03_REQUIREMENTS.csv` (2,183 rows)

| § | Content |
|---|---|
| 1 WORKSPACE_IDENTITY | W03 = Enterprise + Scenarios + Labs + Runs + Results + Replay/AAR/Compare mechanics + spatial boundary. |
| 2 SURFACE_CENSUS | enterprise 412 · scenarios 439 · labs 441 · runs 461 · results 430. Mechanics resolved: Replay `foundation/timeline/replay.ts` + `adapters/results/timeline-replay-provider.ts` (1 instance) · AAR embedded `adapters/results/domain.ts` + `surfaces/results/presentation.ts` · Compare `foundation/analytical/compare.ts` + `adapters/analytical/{rq,results}-compare-provider.ts`. |
| 3 SHARED_MECHANICS | TimelineReplayOwner (foundation; W03 primary consumer-owner) · SpatialPresentationOwner (W03 boundary consumer) · analytical compare · W03 semantic-ownership seam (`tools/check-w03-semantic-ownership.py`) · `main.ts` runs hunks (serialized). |
| 4 CURRENT_STATUS | Open: **PVF-001** (Enterprise Twin/Baseline), **PVF-002** (Runs Preflight), **PVF-003** (Results AAR/Compare) + C03-GATE-020 integration obligations. Baseline FAILs relevant: `runtime-causal-consequence` (HARNESS probe bug), `spatial.selection-connect-canonical-edge` (UNKNOWN). |
| 5 HISTORICAL_PROVENANCE | `authority/W03_*` disposition corpus (69/318 reuse, proposal 69-section, V34 map) · `06_W03_WORLD_CLASS_WORKBENCH_PROPOSAL__HIGH_VALUE_NOT_AUTHORITY.txt` · `assurance/W03_SEMANTIC_OWNERSHIP_CORRECTION_RECEIPT.json` (250 KB) + `W03_SEMANTIC_OWNER_VALIDATION.json` · RCF `W3A/W3_B/W3E` proofs · `W3_D_BROWSER_FIXTURE.html` (fixture class). |
| 6 REQUIREMENTS | 2,183 rows: decisions 385 · QA 355 · findings 504 · gaps 116 · values 785 · identity/profile/visual/result 28 · guardrails 10. pos 1,413 / neg 1,315 / proof 2,183. |
| 7 DECISIONS | CEP-DEC-023 (canonical-object≠surface≠context), CEP-DEC-025 (V1 internal-simulation doctrine), OWNER-20260910-007 (spatial engine), W03 work-admission interpretation policy. |
| 8 RCF | Historical W3A/W3_B/W3E + PS04. Current real-consumer runs REQUIRED: replay causality, AAR projection, compare convergence, spatial connect. |
| 9 CURRENT_EVIDENCE | E18 analytical-compare acceptance; rebound receipt `c82cec63…`. |
| 10 GAPS | PVF-001/002/003 · five post-F049/F050 Canvas closure proofs · exact-successor replay for GATE-020 · semantic-ownership checker must stay green. |
| 11 CONFLICTS | C-10 branch topology supersession · worktree `main.ts` enterprise-gate delta (verify intended `consumer!=='enterprise'` behavior) · OC-C-08/09 registry absences (TimelineReplayOwner, SpatialPresentationOwner). |
| 12 DEPENDENCIES | persistence seed (W05 CBF-001) for run state · spatial policy (W02) · shell (W01). |
| 13 CROSS_WORKSPACE_CONSUMERS | Compare engine consumed by RQ (W02); replay consumed by RUNS+RESULTS; spatial engine shared with VISUALIZE. |
| 14 PRIMARY DONORS | Workbench proposal (value-only) · `BIG_BOSS_468_ATOM_*` dispositions · blueprint donors (OWNER-20260910-004 restriction). |
| 15 BROWSER_FLOWS | Packet §9 (6 flows incl. terminal detach `OPEN_TERMINAL`). |
| 16 ACCEPTANCE_MODEL | Packet §10; E18 shape for compare; C03-GATE-020/024 obligations routed D13/D14. |
| 17 EVIDENCE_MODEL | Packet §8; replay causal-chain binding; canonical-state invariance proofs. |
| 18 WRITER_OWNERSHIP_BOUNDARY | Owns 5 surfaces + replay/AAR/compare product semantics; foundation engines consumed read-only. |
| 19 INTEGRATION_BOUNDARY | P2 parallel group (with W05); D13 serialized final integration; D14 independent proof. |
| 20 STOP/BLOCK | Packet §15; no `main.ts`/`m0` writes outside serialized slot. |
