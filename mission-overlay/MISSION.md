# MISSION_D03A — COMMAND AND SETTINGS OWNER CONVERGENCE


STATUS: MISSION_REFRESHED__OWNER_AUTHORIZED__TRANSPORT_MATERIALIZATION_REQUIRED
COMMON CONTRACT: Drive 1yx2bCIomPRWcgh5QFHTT13K-PVjxtnITCbQEX2NIBj0
EXACT REPOSITORY PARENT: `37c4d765e1db854505c81cbd15b90d4715f6690e`
EXACT PARENT TREE: `57dbde7a730c687a341748dad4a725a052653f0b`
PRODUCT SOURCE: `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641 / 273`
CLASSIFICATION: `WORKING_CORRECTION_BASELINE__SALVAGEABLE_NOT_ACCEPTED`
PRODUCT-SOURCE ANCESTOR: `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a` / `3101c06901dbdaff9602fea8098efb9c34575149` — lineage only, not the execution parent.
OUTPUT FOLDER: Drive 1HxTTF3fGzbg7hEsnUjU0LouMpBBtk-2P
C03 PARENT NODE: D03 SHARED_OWNER_AND_COMPOSITION


SOURCE FINDINGS
- A04-PF-001 — duplicate active SemanticCommandBus owners / duplicate receipt path.
- A07-PF-003 + A17-PF-008 — W05 Settings action-home collision while SettingsCenterOwner remains canonical.
- MFC-PF-003 — `PreferenceExportImportResetModel` is not exposed through canonical Settings while a Library donor-local transfer path remains. This lane owns only canonical Settings exposure/action-home; Library donor-local retirement remains D08/D13.
- CBF-001/CBF-002/CBF-003, MFC-PF-001/MFC-PF-002 and PVF-001/002/003 were reviewed from the current projection and are not independently closed by this lane unless explicitly named above.
Exact source crosswalks:
- A04 Drive 1nbgZKWj60-ynl9shK1a261w9dahpnmD4
- A07 Drive 1XzZNygtNqOQ7nlrxES0-0fMeEmCBYzaI
- A17 Drive 1dYIvl5_fZXo9GjUp_WoTXXvKmi1z3Cuc


WRITABLE PATHS ONLY
- stack/native-typescript/foundation/global/commands.ts — only if dependency-injection contract change is proven necessary
- stack/native-typescript/foundation/global/settings/center.ts — only for canonical SC-011 export/import/reset exposure/action-home; preference values/persistence remain owned by ScopedPreferencesOwner
- stack/native-typescript/surfaces/manual_ai/composition.ts
- stack/native-typescript/surfaces/releases/composition.ts
- stack/native-typescript/surfaces/configuration/composition.ts
- stack/native-typescript/tests/post-c03/D03A/**


PROHIBITED
- main.ts
- stack/native-typescript/surfaces/m0-controller-composition.ts
- Visualize source
- W05 domain/provider semantics beyond dependency injection/wiring contract
- a new Settings or command semantic owner


REQUIRED OWNER TRUTH
- exactly one canonical application SemanticCommandBus.
- exactly one SettingsCenterOwner and the existing foundation.settings command identity.
- contextual shortcut may reuse that command but may not become a second semantic/action owner.
- final W05 toolbar placement that requires main/m0 is RESIDUAL_TO_D13, not locally reinvented.


PARENT-FAIL / CANDIDATE-PASS PROOF
1. Parent probe proves multiple active W05 bus instances and/or duplicate receipt route.
2. Candidate proves all three W05 compositions reuse the canonical bus contract and do not construct an independent canonical bus.
3. One command execution yields one authoritative receipt/effect path; no nested duplicate receipt ownership.
4. `foundation.settings` identity and `SettingsCenterOwner` remain canonical; SC-011 export/import/reset delegates to `ScopedPreferencesOwner` without a second preference value/persistence owner.
4a. Parent-fail/candidate-pass proof demonstrates the canonical Settings path is absent on parent and reachable on candidate; no Library donor-local transfer code is promoted as universal semantics.
5. Negative constructor/instance scan fails if any production W05 composition creates a new SemanticCommandBus.
6. Runtime instance-count and duplicate-receipt tests fail on the exact parent and pass on candidate.
7. Existing registry/command tests remain green.
8. No changed path outside the writable list.


REQUIRED OUTPUTS
- D03A candidate delta/git bundle with exact parent prerequisite.
- D03A_FINDING_CLOSURE_MATRIX.csv.
- D03A_TEST_AND_FALSIFICATION_RECEIPTS.md.
- D03A_CHANGED_PATHS.txt.
- D03A_FINAL_HANDOFF.md.
- exact HEAD/tree/Product-source/clean-status receipt.


STOP
D03A_CANDIDATE_COMPLETE__CONTROLLER_AUDIT_REQUIRED