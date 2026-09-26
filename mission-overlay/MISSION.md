# CEP SWR-W05-HEALTH — Health Writer Mission Overlay

## Role and carrier
EXECUTION_CARRIER: ROUTE-CHATGPT / CHATGPT_WRITER.
This capsule is Controller-prepared. The Writer is a Product Writer for exactly this Surface after handoff; the capsule builder is not the Product Writer.
Do not use live Drive to reconstruct required mission inputs. Do not perform broad repository archaeology.

## Exact immutable source
- Repository: `hamad933/cep-writer-baseline-repo`
- Product parent HEAD: `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- Product parent TREE: `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Product source identity: `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289 files`
- Source branch lineage: `writer/ds01-global-data-sufficiency-seed`
- Acceptance ceiling: `CONTROLLER_ACCEPTED_FOR_DATA_SUFFICIENCY_FOUNDATION__NOT_OVERALL_PRODUCT_ACCEPTANCE__NOT_MAIN_MERGED__NOT_RELEASED__NOT_DEPLOYED__STACK_NOT_FROZEN`
- Candidate branch to create/use after capsule materialization: `writer/surface-w05-health`
- Capsule transport branch is not the Product candidate branch: `capsule/w05a-health-v1-1`

## SurfaceProfile
- Exact profile: `cep-writer/references/surface-profiles/health.json`
- Surface identity: Operational observation workspace for truthful provider/freshness/liveness/queue/diagnostic state; CENTER=OperationalObservationWorkbench; commands health.refresh/inspect/diagnose.
- Data classification: `CURRENT_LAWFUL_PROVIDER_PATH__NO_DS01_TARGET_DATA`

## W05 oracle
Primary domain oracle: `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` (ORACLE-012, durable W05 requirements donor with historical stack bindings).
Use it only for W05 domain identity/lifecycle/failure/provenance/typed-region value after reconciliation with current profile/source/Owner decisions. Historical Laravel/PHP/PostgreSQL/queue/path assumptions are not current implementation authority.

## Reference / identity row
Operational observation workspace for truthful provider/freshness/liveness/queue/diagnostic state; CENTER=OperationalObservationWorkbench; commands health.refresh/inspect/diagnose.
Visual reference binding:
- ID: `1VKIQOlLJNMkd1jLNV7CBGdiBxoAlpUU6`
- Classification: `CURRENT_FINAL_REFERENCE`
- SHA-256: `f5f789687f09f115a75e96a315d74ba5d664853b4430cc766fcc70eaf8aa17b6`
- Repo-local binary: `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/01_HEALTH/Arabic Operational Health Dashboard.png`
Visual reference controls Presentation only and never overrides provider/runtime/data truth.

## Applicable Owner decisions
- **OD-20260918-055:** Surface identity/function completeness: typed domain/data/provider truth + exact regions/commands/states; generic route/screenshot PASS is insufficient.
- **OD-20260916-045:** Runtime/provider/persistence capability claims require live authority + exact source/technical reference reconciliation; summary-only classification prohibited.
- **OD-20260921-066:** Mission-bound candidate branch; no direct main mutation/merge/release/self-promotion; cep-writer read-only; bounded writer-output only.
- **OD-20260921-067:** Closed exact read set; no broad archaeology; required inputs self-contained; no required live Drive dependency.
- **OD-20260922-072:** Visual capability separation; navigation-independent real-browser render allowed only with NOT_GENUINE_ROUTE classification.
- **OD-20260922-073:** Local-first diagnose/fix/recapture loop; intermediate evidence local; final representative evidence only to durable custody.
- **OD-20260922-074:** CAPSULE_V1_1 exact bundle + binding + checksums + verifier; no silent live fetch.
- **OD-20260922-075:** Controller-prepared visual bootstrap/reference mapping where possible; bootstrap is not acceptance; local recapture fallback allowed.
- **OD-20260922-076:** New mission/lane uses full capsule; verified incremental continuation reserved for audited correction successors.
- **OD-20260924-081:** ROUTE-CHATGPT carrier isolation; mission-specific branches; do not inherit ROUTE-LOCAL writer/cep-serial or local machine facts.

## Current findings to preserve/close only within lawful Surface scope
- A16-PF-001 OPEN: retained Health rows can remain apparently current after latest observation failure instead of projecting separate current stale/unavailable epistemic truth.
- CBF-003 P0 shared-owner lock: domain BOTTOM content can exist while BottomDeepWorkOwner has zero registered providers. Do not patch locally; record SHARED_OWNER_ESCALATION.

## Provider / runtime / data truth ceiling
- Current adapter owner W05HealthDomainAdapter over HealthCapability transport.
- State truth must keep AVAILABLE_DATA, AVAILABLE_EMPTY, UNAVAILABLE, ERROR, STALE separate; worker ALIVE/EXPIRED/UNKNOWN separate; refresh IDLE/FETCHING separate.
- Refresh is observation only; it must not create a durable DiagnosticRun. Unknown/unavailable source must never appear healthy/green.
- Health is excluded from DS01 data seeding; use current lawful provider/runtime path only. Do not infer success from DS01.
- No uptime/SLA claim and no liveness inference from queue/table existence.
Cross-surface state law: `unavailable`, `loading/fetching`, `stale`, `error`, `processing/running`, and `success/terminal-success` are separate states. Never collapse or relabel them to make the UI appear complete.

## CLOSED / MANDATORY READ SET
- `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` — **READ_ONLY_SECTIONS_OR_SYMBOLS** — W05 identity/lifecycle/provider/failure/typed-region donor; historical stack bindings are non-authoritative.
- `cep-writer/references/23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md` — **READ_ONLY_SURFACE_ROW_PLUS_GLOBAL_DOCTRINE** — Current surface identity/reference/current-owner synthesis.
- `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` — **READ_ONLY_RELEVANT_W05_ROW_AND_REFERENCE_RULES** — Presentation-only reference identity/ceiling.
- `cep-writer/CURRENT_POST_C03_FINDINGS.json` — **READ_ONLY_RELEVANT_FINDINGS** — Current finding projection; live state/mission overlay supersedes stale conflicts.
- `cep-writer/references/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md` — **READ_ONLY_RELEVANT_W05_RUNTIME_PROVIDER_SECTIONS** — Technical constraints only; not execution authority.
- `stack/native-typescript/surfaces/composition/w05-rescue.ts` — **READ_ONLY** — Current W05 composition/provider bindings/truth ceilings; shared owner.
- `stack/native-typescript/foundation/**` — **READ_ONLY_WHEN_EXACT_IMPORT_OR_SHARED_OWNER_INSPECTION_IS_NEEDED** — Consume shared owners; do not duplicate or mutate them.
- `cep-writer/references/surface-profiles/health.json` — **READ_WHOLE_FILE** — Exact SurfaceProfile.
- `stack/local-runtime/health/health-capability.mjs` — **READ_ONLY** — Current surface/provider/test truth; preserve and falsify without shared mutation.
- `tools/w05-health-capability-proof.mjs` — **READ_ONLY** — Current surface/provider/test truth; preserve and falsify without shared mutation.
- `stack/native-typescript/tests/rescue/S16_W05_HEALTH_PROCESSING/s16-health-processing-tests.ts` — **READ_ONLY** — Current surface/provider/test truth; preserve and falsify without shared mutation.
- `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/01_HEALTH/Arabic Operational Health Dashboard.png` — **READ_ONLY_BINARY_VISUAL_REFERENCE** — Presentation-only governed reference; compare, never infer data/provider truth.

**DO NOT READ / NO DISCOVERY BY DEFAULT:** anything outside this closed set. A bounded discovery escape is allowed only for a named missing/contradictory symbol or directly imported dependency and must remain in the smallest relevant source family; record the reason in the handoff.

## Exact writable paths
- `stack/native-typescript/adapters/health-runtime.ts`
- `stack/native-typescript/tests/surface-restoration/health/**`
- `writer-output/SWR-W05-HEALTH/**`

## Read-only / shared-owner locks
- `stack/local-runtime/health/health-capability.mjs`
- `tools/w05-health-capability-proof.mjs`
- `stack/native-typescript/tests/rescue/S16_W05_HEALTH_PROCESSING/s16-health-processing-tests.ts`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts` — shared W05 composition owner, READ_ONLY.
- `stack/native-typescript/foundation/**` — consume shared mechanics only, READ_ONLY.
- CBF-003 / BottomDeepWorkOwner is shared-owner-first. If it blocks correctness, emit `SHARED_OWNER_ESCALATION`; do not create a local owner, CSS concealment, or duplicate toggle.

## Prohibited paths/actions
- stack/native-typescript/main.ts
- stack/native-typescript/surfaces/m0-controller-composition.ts
- stack/native-typescript/surfaces/composition/w05-rescue.ts (mutation prohibited; read-only shared composition)
- stack/native-typescript/foundation/** (mutation prohibited; shared owners)
- stack/local-runtime/** (mutation prohibited for this Surface-restoration lane)
- all sibling W05 surface adapters/compositions and all W01-W04/W05B Product paths
- cep-writer/**, authority/**, contracts/**, profiles/** (Controller/reference inputs are read-only)
- .github/**, package.json, lockfiles, Router/routes/server/deployment/config changes made only to obtain evidence
- shared rescue test files S16/S17 (read-only; write dedicated surface-restoration tests instead)
No direct main push, merge, release, deployment, acceptance, stack freeze, governance/CURRENT_STATE mutation, or self-promotion.

## Positive proof
- Successful refresh preserves AVAILABLE_DATA versus AVAILABLE_EMPTY and exact observedAt/freshUntil/source identity.
- Expired freshness projects STALE; worker liveness remains independent from queue depth.
- health.diagnose produces explicit diagnostic receipt/history while health.refresh does not.
- Pointer + keyboard selection/commands, focus return/fallback, responsive 1440x1000 and 1024x900, RTL/LTR/Bidi token isolation.

## Negative / falsification proof
- Provider failure/unreachable must project UNAVAILABLE or ERROR and retained rows must not remain apparently current.
- Expired/unreachable worker must not be inferred ALIVE from queue/table presence.
- BOTTOM shared-owner defect must not be hidden with local CSS or local duplicate owner.
- No fabricated success/healthy state during loading, stale, unavailable, or error.

## Visual evidence contract
- Governed method: `WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`.
- Required viewports for material states: `1440x1000` and `1024x900`.
- Inspect generated images visually; DOM assertions/screenshots alone do not replace interaction proof.
- Exercise pointer, keyboard, focus entry/return/fallback, unavailable/disabled states, responsive geometry, RTL/LTR and technical-token Bidi isolation.
- Prefer genuine route. If navigation is blocked but exact candidate bytes can render, use navigation-independent real-browser rendering and classify it `FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE`; never use it to close route/history/network/platform gates.
- Bootstrap classification in this capsule is intentionally `PARTIAL__LOCAL_RECAPTURE_ALLOWED`: no fresh current-parent screenshot is fabricated by capsule construction. Governed reference bytes/mapping are local, and Writer must recapture current/candidate states locally.

- Intermediate captures remain local/ephemeral; only final representative candidate-bound evidence goes to governed final custody when materially required.

## Writer output custody
- Surface folder Drive ID: `1MRD_YIyEswwb0DRYzn9yaolA1fyZ8_e4`
- Writer output folder Drive ID: `1PkTHxdky4OnBizs1cNaPx_YrK8Z53XPM`
- Small textual handoff may also use repo path `writer-output/SWR-W05-HEALTH/**` if needed.
- Heavy final screenshots/video/bundles belong in the bound Drive WRITER_OUTPUT folder, not GitHub bulk evidence.

## Handoff requirements
Return exact candidate HEAD/tree, exact Product-source identity, changed paths classified as writable/read-only/prohibited, build/tests/falsification results, current + populated/current-data state evidence where applicable, state-separation proof, pointer/keyboard/focus/responsive/RTL/LTR/Bidi evidence, visual evidence classification, shared-owner escalations, and confirmation that there was no self-acceptance.

## Stop Gate
`SURFACE_CANDIDATE_ONLY__CONTROLLER_DELTA_ADMISSION_REQUIRED`
