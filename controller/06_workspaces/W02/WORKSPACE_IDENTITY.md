# W02 WORKSPACE RECONSTRUCTION PACKAGE (COMPLETE)

Execution contract: `../09_writer_forge/W02_writer_packet.md` · Requirements: `../09_writer_forge/W02_REQUIREMENTS.csv` (1,485 rows)

| § | Content |
|---|---|
| 1 WORKSPACE_IDENTITY | W02 = Library + Learn + Visualize + RQ + shared interaction/customization **policy** (implementation stays foundation-owned — A-4 two-field model). |
| 2 SURFACE_CENSUS | library 375 · learn 369 · visualize 388 · rq 353 (source dirs `surfaces/<name>/`, profiles per surface). Structured hosts `w5-a/b/c`, `pw08/pw11` lines; spatial stack `foundation/spatial*`; `tools/b3r-rq-visualize/`. |
| 3 SHARED_MECHANICS | StructuredPresentationBridge (Structured family) · SpatialPresentationOwner (spatial family) · AccessibilityFeedbackOwner · GlobalInputKeymapOwner · InputDirectionResolver · WorkspacePaneLayoutOwner + WorkspaceResponsiveLayoutPolicy · pointer kernels (WindowMotion, SpatialInteractionKernel, RelationInteractionOwner, StructuredDragDropOwner) · customization trio (ScopedPreferencesOwner, SettingsCenterOwner, ReusableToolbarTemplateOwner) — W02 = POLICY owner of interaction/accessibility/responsive/customization; W02 consumes BottomDeepWorkOwner (RQ). |
| 4 CURRENT_STATUS | Open findings: CBF-002 (VISUALIZE side) · **CBF-003** (P0 BOTTOM orphan — RQ owner side) · **F-049/F-050** (Canvas) · MFC-PF-001/002 (Library keys). Baseline flows failing: spatial-selection, route-convergence, central-reuse, bidi-isolation (see `../../07_browser/failure_taxonomy.md`). |
| 5 HISTORICAL_PROVENANCE | Drive capsules `CEP_WRITER_WORKSPACE_CAPSULE_B3R_RQ_VISUALIZE_*`, `CEP_B3R_CORR02_VISUALIZE_*`, `PW-20_LEARN_REAL_CONSUMER_BINDING` (BLOCKED pattern); dispositions `CEP_{LEARN_V14,RQ_V13,VISUALIZE_V20}_…DISPOSITION.csv`; W02 capability matrix v1.0. |
| 6 REQUIREMENTS | 1,485 rows: decisions 296 · QA 211 · findings 313 · gaps 67 · values 567 · identity/profile/visual/result 27 · guardrails 4. pos 930 / neg 850 / proof 1,485. |
| 7 DECISIONS | OWNER-20260910-003/004/006/007; OE-001…005 customization intake; §1 input-direction / §5 shortcut focus Owner QA. |
| 8 RCF | Historical real-consumer: FW_B (library+learn), W2_C (browser). Current runs required per packet §7. |
| 9 CURRENT_EVIDENCE | Rebound receipt `c82cec63…`; archaeology Library coverage censuses (330 functions, DOM/CSS/event). |
| 10 GAPS | F-049/F-050 closure route (D08→D13→D14, D04 NO-TOUCH) · CBF-003 reachability proof · MFC-PF-001/002 · four failing baseline flows need adjudication in-mission. |
| 11 CONFLICTS | OC-C-10…15 historical lock supersessions · OC-C-16/17 directive-vs-foundation ownership (resolved by two-field model) · C-13 content-campaign collisions excluded. |
| 12 DEPENDENCIES | Preferences (W05 SC-011) · persistence seed (W05) · shell (W01) · compare engine (shared with W03). |
| 13 CROSS_WORKSPACE_CONSUMERS | Interaction/accessibility/responsive/customization policies consumed by all 23 surfaces; spatial engine consumed by W03. |
| 14 PRIMARY DONORS | Library Editor v1.2.17 (accepted donor + full mechanic census in `archaeology/`); spatial engine donor per OWNER-20260910-007. |
| 15 BROWSER_FLOWS | Packet §9 (7 flows incl. BIDI + canvas proofs at 1440×1000 and 1024×900). |
| 16 ACCEPTANCE_MODEL | Packet §10; canvas closure obligations feed C03-GATE-020. |
| 17 EVIDENCE_MODEL | Packet §8 + spatial DOM/canvas evidence rules. |
| 18 WRITER_OWNERSHIP_BOUNDARY | Owns 4 surfaces + listed policy mechanics; kernels remain foundation-owned (single owner preserved). |
| 19 INTEGRATION_BOUNDARY | P1 parallel group; HIGH merge risk on shared kernels — one writer per mechanic. |
| 20 STOP/BLOCK | Packet §15 + any duplicate implementation of a foundation kernel. |
