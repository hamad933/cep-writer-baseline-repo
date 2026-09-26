# CEP SWR-W05-PROCESSING — Processing Writer Mission Overlay

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
- Candidate branch to create/use after capsule materialization: `writer/surface-w05-processing`
- Capsule transport branch is not the Product candidate branch: `capsule/w05a-processing-v1-1`

## SurfaceProfile
- Exact profile: `cep-writer/references/surface-profiles/processing.json`
- Surface identity: Pipeline lifecycle workbench for ProcessingRequest/Job/Attempt/retry/cancellation/validation handoff; CENTER=PipelineLifecycleWorkbench; commands processing.inspect/retry/requestCancel/validationHandoff.
- Data classification: `CURRENT_LAWFUL_PROVIDER_PATH__NO_DS01_TARGET_DATA`

## W05 oracle
Primary domain oracle: `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` (ORACLE-012, durable W05 requirements donor with historical stack bindings).
Use it only for W05 domain identity/lifecycle/failure/provenance/typed-region value after reconciliation with current profile/source/Owner decisions. Historical Laravel/PHP/PostgreSQL/queue/path assumptions are not current implementation authority.

## Reference / identity row
Pipeline lifecycle workbench for ProcessingRequest/Job/Attempt/retry/cancellation/validation handoff; CENTER=PipelineLifecycleWorkbench; commands processing.inspect/retry/requestCancel/validationHandoff.
Visual reference binding:
- ID: `INTENTIONALLY_NOT_GENERATED`
- Classification: `CONTRACT_DERIVABLE / NO_NEW_REFERENCE_REQUIRED`
- SHA-256: `N/A`
- Repo-local binary: `NONE — Processing intentionally has no standalone final visual reference`
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
- A16-PF-002 OPEN: Processing mutation availability can remain enabled from retained historical Job state after provider refresh becomes unavailable.
- CBF-003 P0 shared-owner lock: domain BOTTOM content can exist while BottomDeepWorkOwner has zero registered providers. Do not patch locally; record SHARED_OWNER_ESCALATION.

## Provider / runtime / data truth ceiling
- Current adapter owner W05ProcessingDomainAdapter over ProcessingCapability transport; provider execution success requires actualProviderExecution=true plus providerRunId evidence.
- CANCEL_REQUESTED is not CANCELLED; cancellation success requires provider ACK evidence. Retry creates a new Attempt and idempotent duplicate retry key must not create another Attempt.
- Validation handoff ACK requires actual consumer receipt; COMPLETED does not imply technical validation success.
- Processing is excluded from DS01 data seeding; preserve current proven durable provider/correlation/retry/cancel lineage without inventing new provider success.
- No standalone final visual reference exists. Presentation is contract/profile/current-source derivable only.
Cross-surface state law: `unavailable`, `loading/fetching`, `stale`, `error`, `processing/running`, and `success/terminal-success` are separate states. Never collapse or relabel them to make the UI appear complete.

## CLOSED / MANDATORY READ SET
- `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` — **READ_ONLY_SECTIONS_OR_SYMBOLS** — W05 identity/lifecycle/provider/failure/typed-region donor; historical stack bindings are non-authoritative.
- `cep-writer/references/23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md` — **READ_ONLY_SURFACE_ROW_PLUS_GLOBAL_DOCTRINE** — Current surface identity/reference/current-owner synthesis.
- `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` — **READ_ONLY_RELEVANT_W05_ROW_AND_REFERENCE_RULES** — Presentation-only reference identity/ceiling.
- `cep-writer/CURRENT_POST_C03_FINDINGS.json` — **READ_ONLY_RELEVANT_FINDINGS** — Current finding projection; live state/mission overlay supersedes stale conflicts.
- `cep-writer/references/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md` — **READ_ONLY_RELEVANT_W05_RUNTIME_PROVIDER_SECTIONS** — Technical constraints only; not execution authority.
- `stack/native-typescript/surfaces/composition/w05-rescue.ts` — **READ_ONLY** — Current W05 composition/provider bindings/truth ceilings; shared owner.
- `stack/native-typescript/foundation/**` — **READ_ONLY_WHEN_EXACT_IMPORT_OR_SHARED_OWNER_INSPECTION_IS_NEEDED** — Consume shared owners; do not duplicate or mutate them.
- `cep-writer/references/surface-profiles/processing.json` — **READ_WHOLE_FILE** — Exact SurfaceProfile.
- `stack/local-runtime/processing/processing-capability.mjs` — **READ_ONLY** — Current surface/provider/test truth; preserve and falsify without shared mutation.
- `tools/w05-processing-capability-proof.mjs` — **READ_ONLY** — Current surface/provider/test truth; preserve and falsify without shared mutation.
- `stack/native-typescript/tests/rescue/S16_W05_HEALTH_PROCESSING/s16-health-processing-tests.ts` — **READ_ONLY** — Current surface/provider/test truth; preserve and falsify without shared mutation.
- `stack/native-typescript/tests/rescue/PC1_W05_PROVIDER_PERSISTENCE/provider-persistence-falsification.mjs` — **READ_ONLY** — Current surface/provider/test truth; preserve and falsify without shared mutation.

**DO NOT READ / NO DISCOVERY BY DEFAULT:** anything outside this closed set. A bounded discovery escape is allowed only for a named missing/contradictory symbol or directly imported dependency and must remain in the smallest relevant source family; record the reason in the handoff.

## Exact writable paths
- `stack/native-typescript/adapters/processing-runtime.ts`
- `stack/native-typescript/tests/surface-restoration/processing/**`
- `writer-output/SWR-W05-PROCESSING/**`

## Read-only / shared-owner locks
- `stack/local-runtime/processing/processing-capability.mjs`
- `tools/w05-processing-capability-proof.mjs`
- `stack/native-typescript/tests/rescue/S16_W05_HEALTH_PROCESSING/s16-health-processing-tests.ts`
- `stack/native-typescript/tests/rescue/PC1_W05_PROVIDER_PERSISTENCE/provider-persistence-falsification.mjs`
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
- Retry after FAILED/TIMED_OUT creates distinct Attempt; same idempotency key replays same retry receipt without extra Attempt.
- Cancel request persists CANCEL_REQUESTED; only actual provider ACK permits CANCELLED.
- Completed provider execution is marked proven only with actualProviderExecution=true + providerRunId.
- Validation handoff moves NONE→PENDING→ACKNOWLEDGED only with actual consumer ACK; correlation/request/job/attempt IDs remain distinct.
- Pointer/keyboard/focus/responsive/Bidi behavior at 1440x1000 and 1024x900.

## Negative / falsification proof
- When latest provider refresh is UNAVAILABLE/ERROR, retry/cancel/handoff mutations must not remain enabled solely from last-known Job state.
- No ACK means no CANCELLED claim; no provider evidence means no proven-success claim.
- No generic async 'processing/success' collapse: PENDING/RUNNING/RETRY_WAIT/TIMED_OUT/CANCEL_REQUESTED/CANCELLED/COMPLETED/FAILED remain distinct.
- No fabricated visual authority or new canonical Processing reference image; no local BOTTOM owner workaround.

## Visual evidence contract
- Governed method: `WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`.
- Required viewports for material states: `1440x1000` and `1024x900`.
- Inspect generated images visually; DOM assertions/screenshots alone do not replace interaction proof.
- Exercise pointer, keyboard, focus entry/return/fallback, unavailable/disabled states, responsive geometry, RTL/LTR and technical-token Bidi isolation.
- Prefer genuine route. If navigation is blocked but exact candidate bytes can render, use navigation-independent real-browser rendering and classify it `FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE`; never use it to close route/history/network/platform gates.
- Bootstrap classification in this capsule is intentionally `PARTIAL__LOCAL_RECAPTURE_ALLOWED`: no fresh current-parent screenshot is fabricated by capsule construction. Governed reference bytes/mapping are local, and Writer must recapture current/candidate states locally.
- Processing has **no standalone final visual reference**. Use the SurfaceProfile, W05 oracle, identity matrix, current exact source and truthful current capture; do not manufacture or promote a new reference image.
- Intermediate captures remain local/ephemeral; only final representative candidate-bound evidence goes to governed final custody when materially required.

## Writer output custody
- Surface folder Drive ID: `1uq2foNI0SkJsF4JU7hRZY4OXGGwDBnj2`
- Writer output folder Drive ID: `1sjjw_HzMPC6s_lm2RgDOf5jZ-4hiS0QZ`
- Small textual handoff may also use repo path `writer-output/SWR-W05-PROCESSING/**` if needed.
- Heavy final screenshots/video/bundles belong in the bound Drive WRITER_OUTPUT folder, not GitHub bulk evidence.

## Handoff requirements
Return exact candidate HEAD/tree, exact Product-source identity, changed paths classified as writable/read-only/prohibited, build/tests/falsification results, current + populated/current-data state evidence where applicable, state-separation proof, pointer/keyboard/focus/responsive/RTL/LTR/Bidi evidence, visual evidence classification, shared-owner escalations, and confirmation that there was no self-acceptance.

## Stop Gate
`SURFACE_CANDIDATE_ONLY__CONTROLLER_DELTA_ADMISSION_REQUIRED`
