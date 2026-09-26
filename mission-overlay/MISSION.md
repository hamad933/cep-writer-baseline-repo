# SWR-W05-CONFIGURATION — Configuration Writer Mission

PROJECT: Cybersecurity Education Platform — CEP
ROUTE: CHATGPT_WRITER
MISSION STATUS: CANDIDATE_ONLY
CANDIDATE BRANCH: `writer/surface-w05-configuration`

## Exact source
Repository `hamad933/cep-writer-baseline-repo`; Product parent HEAD `25a5f13c55096b7c4c8ef51100256a856cff75f5`; TREE `dd0315926270ec1f6571b82566dcdab3d65267f9`; Product source `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289 files`. Verify before mutation. Capsule transport identity is not Product acceptance.

## Closed authority
Read only `mission-overlay/MISSION_INPUT_MANIFEST.json`. No broad Drive/repo archaeology and no required live Drive lookup.
Bind `profiles/configuration.json`; ORACLE-012 W05 oracle (ownership + G3 Configuration + verification/convergence); ORACLE-013 identity matrix Configuration row; ORACLE-009 final visual register; visual method; runtime/persistence reference; local Owner/current-findings snapshot.
Exact visual: `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/08_CONFIGURATION/CEP_SYSTEM_CONFIGURATION_REVISION_REFERENCE.png`; Drive `14j2lNC_rDe9m3zHrHH5JYPB9mN4uI5CX`; SHA-256 `bb32df27c015b018ee31e88ce82841355f46e770c4ee02ca6775b7536ce18092`.

## Objective and truth
Restore exact Operational Configuration identity/functionality while preserving the Global Settings boundary.
1. ConfigObservation, ConfigProposal and ConfigAuthority are distinct. Present value is not approved/applied value.
2. Global Settings / SettingsCenterOwner owns durable global/family preferences; this Surface must not create a second Settings engine or let Settings apply operational config.
3. Edit creates a proposal; validate never applies; reset discards proposal/reveals observation and is not factory reset.
4. requestApply without explicit ConfigAuthority remains AUTHORITY_PENDING / NOT_APPLIED. Never fabricate configuration-application success.
5. Sensitive/unknown keys fail before storage/logging; diagnostics withhold proposal values as required.

## Writable
- `stack/native-typescript/surfaces/configuration/**`
- `stack/native-typescript/adapters/configuration/**`
- `stack/native-typescript/tests/surfaces/configuration/**`
- `writer-output/SWR-W05-CONFIGURATION/**` small handoff only

## Read-only / collision locks
- `stack/native-typescript/foundation/**`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts`
- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- `stack/native-typescript/main.ts`
- Global Settings / SettingsCenter implementation
- `stack/native-typescript/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.ts`
- DS01 fixture/test/capture harness
- profiles/references/authority
- `package.json`, lockfiles, committed `dist/**`

Shared-owner need => `SHARED_OWNER_ESCALATION:<owner>:configuration:<symptom>:<required behavior>:<falsification>`; do not solve it locally.

## Falsification and tests
- Settings shortcut cannot create another Settings owner or dispatch operational apply.
- validate() cannot alter live config/application state.
- No ConfigAuthority => AUTHORITY_PENDING and NOT_APPLIED.
- UNAVAILABLE observation cannot substitute a default/current value as observed truth.
- DS01 proposal is TEST_ONLY/NON_PRODUCTION and normal Product state remains unchanged without DS01 activation.

Run:
- `npm run build:runtime`
- `node dist/tests/surfaces/configuration/configuration-tests.js`
- `node dist/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.js`
- `node dist/tests/post-c03/D11/d11-w05-provider-integration-tests.js`
- `node dist/tests/post-d13/DS01_GLOBAL_DATA_SUFFICIENCY/ds01-global-data-sufficiency.test.js`
- `npm run check`
No package/dependency mutation or test weakening.

## Visual/browser
Use the DS01 harness for TWO captures: normal Product truth and deterministic non-production populated Configuration state, at 1440x1000 and 1024x900, plus targeted proposal/diff. Compare to the Owner-confirmed reference. Inspect full frame and material regions/states, keyboard/focus, disabled/unavailable states, responsive behavior, RTL/LTR/Bidi and technical tokens. Capture class must distinguish genuine route from navigation-independent browser rendering. DS01 does not grant ConfigAuthority or apply truth.
Capsule bootstrap status: `VISUAL_BOOTSTRAP_DISABLED_BY_CONTROLLER_BINDING__WRITER_LOCAL_RECAPTURE_REQUIRED`.

## Output / Stop
Candidate `writer/surface-w05-configuration`.
Final Writer Drive output folder `1Xcq9VPlKnUDxFeVnxvKt-z0ooWfEnYu8`.
Handoff exact parent/HEAD/tree/Product-source, changed paths/owners, tests/falsification, provider/data truth, normal+DS01 evidence, blockers/escalations.
STOP: `SURFACE_CANDIDATE_ONLY__CONTROLLER_DELTA_ADMISSION_REQUIRED`.
