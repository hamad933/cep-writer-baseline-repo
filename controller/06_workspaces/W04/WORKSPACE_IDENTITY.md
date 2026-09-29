# W04 WORKSPACE RECONSTRUCTION PACKAGE (COMPLETE)

Execution contract: `../09_writer_forge/W04_writer_packet.md` · Requirements: `../09_writer_forge/W04_REQUIREMENTS.csv` (1,445 rows)

| § | Content |
|---|---|
| 1 WORKSPACE_IDENTITY | W04 = Evidence + Reviews + Mastery + Portfolio (proof/attestation family) + w04 group seam. |
| 2 SURFACE_CENSUS | evidence 382 · reviews 355 · mastery 353 · portfolio 355 (`surfaces/<name>/` + profiles). State machines per A03 model (CEP-DEC-026). Seam lineage `tools/c2-w04-truth/`. |
| 3 SHARED_MECHANICS | w04-rescue seam (**group seam, not reviews-only** — OC-C-10..15 class correction) · evidence custody/receipt truth (W04 policy owner, all workspaces consume the format) · consumes SC-011 (W05). |
| 4 CURRENT_STATUS | Open: **F-051** (evidence-receipt overcount). No W04 baseline flow run yet (flows untested at `c82cec63…`). |
| 5 HISTORICAL_PROVENANCE | `tools/c2-w04-truth/`; Drive `CEP_WRITER_WORKSPACE_CAPSULE_C2_W04_32354e83.zip`, `MISSION_DS01_W04_GOVERNED_ACCEPTANCE_DATA.md`; `assurance/E18_ANALYTICAL_COMPARE_CONTROLLER_ACCEPTANCE.json`. |
| 6 REQUIREMENTS | 1,445 rows: decisions 291 · QA 216 · findings 320 · gaps 59 · values 534 · identity/profile/visual/result 20 · guardrails 5. pos 923 / neg 847 / proof 1,445. |
| 7 DECISIONS | CEP-DEC-026 (Evidence/Mastery state machines) · governance acceptance-gate architecture (donor floor, state/viewport proof, golden replay, real-consumer, worst-finding law). |
| 8 RCF | W04 enforces fixture-vs-real labeling product-side (`L07` taxonomy); templates PS03/VS04/VS05. |
| 9 CURRENT_EVIDENCE | `assurance/SCREENSHOT_MANIFEST.json` policy `TARGETED_VISUAL_EVIDENCE_MAX_4`; F-051 counting audit inputs. |
| 10 GAPS | F-051 closure proof · W04 browser flows unexecuted at baseline · receipt-count truth regression suite. |
| 11 CONFLICTS | C-14 (17 prior writer results = 0 verified successors — must never be presented as acceptance). |
| 12 DEPENDENCIES | shell (W01) · settings SC-011 (W05) · receipt format it polices. |
| 13 CROSS_WORKSPACE_CONSUMERS | Evidence receipt contract consumed by ALL workspaces' completion proofs. |
| 14 PRIMARY DONORS | A03 evidence/mastery state machines; E18 acceptance shape. |
| 15 BROWSER_FLOWS | Packet §9 (5 flows). |
| 16 ACCEPTANCE_MODEL | Packet §10. |
| 17 EVIDENCE_MODEL | Packet §8; overcount = defect class (F-051 regression test required). |
| 18 WRITER_OWNERSHIP_BOUNDARY | Owns 4 surfaces + evidence custody policy + w04 seam. |
| 19 INTEGRATION_BOUNDARY | P1 parallel group; evidence dirs workspace-scoped to avoid receipt collisions. |
| 20 STOP/BLOCK | Packet §15; unbindable receipt lineage → LINEAGE classification, report. |
