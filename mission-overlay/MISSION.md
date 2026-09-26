# SWR-W05-BACKUP — Backup & Restore Writer Mission

PROJECT: Cybersecurity Education Platform — CEP
ROUTE: CHATGPT_WRITER
WRITER CLASS: PRODUCT SURFACE WRITER
MISSION STATUS: CANDIDATE_ONLY
CANDIDATE BRANCH: `writer/surface-w05-backup`
DO NOT execute this mission on the capsule transport branch.

## 1. Exact source binding
- Repository: `hamad933/cep-writer-baseline-repo`
- Required Product parent HEAD: `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- Required Product parent TREE: `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Product source SHA-256: `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a`
- Canonical Product source file count: `289`
- Transport/capsule commit is not Product acceptance and is not the candidate branch.

Before mutation, verify materialized HEAD/TREE and canonical Product source identity. If they do not match, STOP.

## 2. Authority and closed read set
Read ONLY the exact closed set declared in `mission-overlay/MISSION_INPUT_MANIFEST.json`. Do not broadly search Drive or the repository. Required authority is already local in the capsule.
Mandatory local authority:
- exact SurfaceProfile: `profiles/backup.json`
- W05 oracle: `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` — only W05 ownership table, Backup section F when applicable, section G for Audit/Releases/Configuration, tests/falsification, and convergence invariants
- identity/reference matrix: `cep-writer/references/23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md` — W05 row for `Backup & Restore`
- visual authority: `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` + exact image `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png`
- visual method: `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`
- provider/persistence reference: `cep-writer/references/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md`
- Owner decisions: local snapshot in `mission-overlay/AUTHORITY_SNAPSHOT.md` plus exact repo snapshot `cep-writer/authority/WRITER_OWNER_DECISIONS.csv` only for the IDs listed there
- current findings: `mission-overlay/AUTHORITY_SNAPSHOT.md`

No live Google Drive search is required or authorized for mission inputs.

## 3. Mission objective
Restore the exact governed Backup & Restore Surface identity/functionality from the accepted DS01 parent while preserving current valid semantics and truth ceilings. Do not redesign unrelated surfaces and do not solve shared-owner problems locally.

Required outcomes:
1. Keep package -> plan -> preview -> stage -> isolated drill -> activation-request as distinct lifecycle states.
2. Never create or display a fake restore-success/live-restored receipt. stage/verify/drill evidence is not production restore.
3. Project durable provider attempt/failure/compensation truth when actually available; preserve original provider error/compensation evidence without synthesizing durable history.
4. Fresh composition/rehydration must preserve exact BackupPackage/plan/provider receipt identity or fail closed rather than silently substitute current state.
5. Production activation remains outside this Surface authority; requestActivation may remain AUTHORITY_PENDING only.

## 4. Writable scope
- `stack/native-typescript/surfaces/backup/**`
- `stack/native-typescript/adapters/backup-runtime.ts`
- `stack/native-typescript/tests/surfaces/backup/**`
- `writer-output/SWR-W05-BACKUP/**`

Small textual handoff/receipts may be written only under `writer-output/SWR-W05-BACKUP/**`. Heavy screenshots/video/build output remain local until final bounded custody.

## 5. Read-only scope
- `cep-writer/READ_FIRST.md`
- `cep-writer/references/SURFACE_PROFILE_BINDING.json`
- `cep-writer/references/ORACLE_INDEX.json`
- `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md`
- `cep-writer/references/23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md`
- `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md`
- `cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`
- `cep-writer/references/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md`
- `cep-writer/authority/WRITER_OWNER_DECISIONS.csv`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts`
- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- `stack/native-typescript/main.ts`
- `package.json`
- `profiles/backup.json`
- `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png`
- `stack/local-runtime/backup/backup-restore-capability.mjs`
- `stack/native-typescript/tests/rescue/S18_W05_BACKUP_AUDIT/domain-tests.ts`
- `stack/native-typescript/tests/rescue/S18_W05_BACKUP_AUDIT/source-boundary-tests.ts`
- `stack/native-typescript/tests/post-c03/D11/d11-w05-provider-integration-tests.ts`
- `stack/native-typescript/fixtures/acceptance-data/ds01-global/index.ts`
- `stack/native-typescript/tests/post-d13/DS01_GLOBAL_DATA_SUFFICIENCY/ds01-global-data-sufficiency.test.ts`
- `tools/ds01-global-data-sufficiency/capture.py`

## 6. Prohibited scope
- Any Product path outside the per-surface writable scope
- stack/native-typescript/foundation/** shared-owner implementations
- stack/native-typescript/surfaces/composition/w05-rescue.ts
- stack/native-typescript/surfaces/m0-controller-composition.ts
- stack/native-typescript/main.ts
- Global Settings / SettingsCenter owner implementation
- package.json and all lockfiles/dependency manifests
- cep-writer/** authority/profile/reference files
- mission-overlay/**
- CURRENT_STATE/governance/Owner-decision artifacts
- main branch, merge, release, deployment, stack-freeze operations
- manual edits to dist/** or other generated build outputs
- DS01 fixture semantics/classification changes
- shared S18/S19 regression files unless Controller separately rebinds collision ownership

A need to change a shared owner/path is not permission. Emit:
`SHARED_OWNER_ESCALATION:<owner>:backup:<exact symptom>:<required behavior>:<falsification>`
and keep the Surface candidate within its local ownership.

## 7. Shared-owner / collision locks
- Canonical application `SemanticCommandBus` is injected; never construct a fallback/local bus.
- `AnalyticalCompareOwner` is canonical and shared. Audit/Releases compare mechanics must consume that owner; no local duplicate/fallback.
- Shared Audit/Provenance presentation mechanics are consumed, not reimplemented.
- Global Settings / `SettingsCenterOwner` is canonical. Configuration owns operational ConfigObservation/Proposal/Authority semantics only; no second Settings engine.
- Shared `w05-rescue.ts`, M0 composition, main application mount and S18/S19 cross-surface tests are read-only collision hotspots in this mission.

## 8. Required falsification
- No package => no restored-success status and plan unavailable.
- Preview/stage never report restore writes; isolated drill never reports productionDatabaseMutated=true.
- Provider failure remains failure; no compensation-success fabrication; durable journal provenance is explicit.
- Rehydrate rejects missing package identity/digests and does not invent provider receipt state.
- DS01 seeded drill remains TEST_ONLY/NON_PRODUCTION and normal Product state remains unchanged when DS01 activation is absent.

At minimum run:
- `npm run build:runtime`
- `node dist/tests/rescue/S18_W05_BACKUP_AUDIT/domain-tests.js`
- `node dist/tests/rescue/S18_W05_BACKUP_AUDIT/source-boundary-tests.js`
- `node dist/tests/post-c03/D11/d11-w05-provider-integration-tests.js`
- `node dist/tests/post-d13/DS01_GLOBAL_DATA_SUFFICIENCY/ds01-global-data-sufficiency.test.js`
- `npm run check`
Run additional surface-local tests you add. Do not weaken existing tests to obtain green status. No package/dependency mutation.

## 9. Visual / browser requirements
Visual reference is OWNER_CONFIRMED_FINAL_REFERENCE:
- Drive reference ID: `1X2OS6L_4A46qL6tQ2WvKWOMbLpPtSa6z`
- SHA-256: `782e813a4ffacd969eeff180b90a0a859271bd8c5a1a4e3b98ac6379e9a88ed0`
- local repo copy: `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png`

Use the existing DS01 capture harness for TWO captures: normal Product truth and DS01 populated test state. Required viewports: 1440x1000 and 1024x900. Also exercise the Surface-specific targeted state supported by the harness.
Follow the visual recovery ladder. Classify captures truthfully as `GENUINE_ROUTE` or `NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE`. Open and inspect every material screenshot. Verify component/state parity, hierarchy, overflow/clipping, focus, keyboard operation, disabled/unavailable states, 200%/responsive behavior where material, RTL/LTR/Bidi and technical-token isolation. DOM assertions alone are not visual proof.

Bootstrap status supplied by this capsule is intentionally `VISUAL_BOOTSTRAP_DISABLED_BY_CONTROLLER_BINDING__WRITER_LOCAL_RECAPTURE_REQUIRED`; this is not a visual blocker and not acceptance evidence.

## 10. Candidate and output custody
- Work only on candidate branch `writer/surface-w05-backup` created from the exact Product parent.
- Do not push/merge main, release, deploy, self-accept or self-promote.
- Final Writer output destination: Google Drive folder ID `1BlD3U6dmIQdHMbaPmgy7Y88_Hdv2MOOA` under the W05B BACKUP capsule folder.
- GitHub carries only source delta + small handoff/receipts. Heavy final evidence goes to the stated Drive output folder when required.
- Handoff must include exact parent/HEAD/tree/Product-source identity, changed paths with owner classification, truth ceilings, normal + populated/test evidence classification, tests/falsification, visual/browser evidence, remaining blockers, and every shared-owner escalation.

## 11. Stop Gate
`SURFACE_CANDIDATE_ONLY__CONTROLLER_DELTA_ADMISSION_REQUIRED`

The Writer must stop there. No acceptance, convergence, merge, release, deployment or stack freeze.
