# SWR-W05-RELEASES — Releases Writer Mission

PROJECT: Cybersecurity Education Platform — CEP
ROUTE: CHATGPT_WRITER
MISSION STATUS: CANDIDATE_ONLY
CANDIDATE BRANCH: `writer/surface-w05-releases`

## Exact source
Repository `hamad933/cep-writer-baseline-repo`; Product parent HEAD `25a5f13c55096b7c4c8ef51100256a856cff75f5`; TREE `dd0315926270ec1f6571b82566dcdab3d65267f9`; Product source `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289 files`. Verify before mutation. Capsule transport identity is not Product acceptance.

## Closed authority
Read only the closed set in `mission-overlay/MISSION_INPUT_MANIFEST.json`. No broad Drive/repo archaeology and no required live Drive lookup.
Bind:
- `profiles/releases.json`
- ORACLE-012 `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` — W05 ownership, G2 Releases, verification/convergence only
- ORACLE-013 `cep-writer/references/23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md` — Releases row
- ORACLE-009 `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md`
- exact visual `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/07_RELEASES/CEP_SYSTEM_RELEASES_REFERENCE.png`, Drive `1vk_AGnCeOFk1TrmyoeNkxXsWk1vOloV1`, SHA-256 `9e7c8747953bef1d8e0f2000ad00bad12667ddfd35bbcbbde4f227a812604f7a`
- visual method and runtime/persistence technical reference
- resolved Owner/current-findings snapshot in `mission-overlay/AUTHORITY_SNAPSHOT.md`.

## Objective and truth
Restore exact Releases identity/functionality without shared-owner duplication.
1. Bind ReleaseCandidate to exact candidateId + commitSHA + treeSHA + artifactDigest and candidate-bound evidence. Candidate A evidence cannot satisfy B.
2. Keep technical readiness, Owner authorization, and deployment observation/execution as independent truth planes.
3. Deployment provider unavailable => UNKNOWN; never infer DEPLOYED or NOT_DEPLOYED.
4. Exact-pair compare consumes the canonical controller-injected AnalyticalCompareOwner; never construct a local/fallback compare owner.
5. PUSH/CI PASS is not acceptance/merge/release/deployment. This Surface may request authorization only; it does not deploy.

## Writable
- `stack/native-typescript/surfaces/releases/**`
- `stack/native-typescript/adapters/releases/**`
- `stack/native-typescript/tests/surfaces/releases/**`
- `writer-output/SWR-W05-RELEASES/**` small handoff only

## Read-only / collision locks
- `stack/native-typescript/foundation/**`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts`
- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- `stack/native-typescript/main.ts`
- `stack/native-typescript/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.ts`
- canonical AnalyticalCompare/Audit-Provenance/Settings/SemanticCommandBus implementations
- DS01 fixture (Releases is intentionally NOT a DS01 target)
- profiles/references/authority files
- `package.json`, lockfiles, `dist/**` as commit targets

Shared-owner need => emit `SHARED_OWNER_ESCALATION:<owner>:releases:<symptom>:<required behavior>:<falsification>`; do not solve it locally.

## Falsification and tests
- exact candidate mismatch blocks evidence/readiness attribution;
- TECHNICALLY_READY cannot grant authorization or deployment;
- authorization cannot imply deployment;
- unavailable deployment provider remains UNKNOWN;
- if no lawful populated provider state exists, report `DATA_COVERAGE_BLOCKER`, never fabricate Release success.

Run at minimum:
- `npm run build:runtime`
- `node dist/tests/surfaces/releases/releases-tests.js`
- `node dist/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.js`
- `node dist/tests/post-c03/D11/d11-w05-provider-integration-tests.js`
- `npm run check`
No package/dependency mutation and no weakening of tests.

## Visual/browser
Freshly capture normal Product truth at 1440x1000 and 1024x900. DS01 does not seed Releases. Use a lawful exact-candidate state only if reachable from current contracts; otherwise retain the data-coverage limitation. Compare full frame + material regions/states against the exact Owner-confirmed reference. Exercise keyboard/focus, disabled/unavailable states, responsive behavior, RTL/LTR/Bidi and technical tokens. Open and inspect screenshots. Classify `GENUINE_ROUTE` separately from `NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE`.
Capsule bootstrap status is intentionally `VISUAL_BOOTSTRAP_DISABLED_BY_CONTROLLER_BINDING__WRITER_LOCAL_RECAPTURE_REQUIRED`.

## Output / Stop
Candidate branch: `writer/surface-w05-releases`.
Final Writer Drive output folder: `1ZFZVcWLSsU6JsD0aqBPUIT4uBpFxfNCN`.
Handoff exact parent/HEAD/tree/Product-source, changed paths + owner class, tests/falsification, provider/data truth, normal/current visual proof, blockers/escalations. No self-acceptance.

STOP: `SURFACE_CANDIDATE_ONLY__CONTROLLER_DELTA_ADMISSION_REQUIRED`
