# CEP SWR-W05-MANUAL-AI — Manual AI Bridge Writer Mission Overlay

## Role and carrier
EXECUTION_CARRIER: ROUTE-CHATGPT / CHATGPT_WRITER.
This is a Controller-prepared Writer capsule for exactly Manual AI Bridge. Do not reconstruct authority from chat memory or live Drive, and do not perform broad repository archaeology.

## Exact immutable source
- Repository: `hamad933/cep-writer-baseline-repo`
- Product parent HEAD: `25a5f13c55096b7c4c8ef51100256a856cff75f5`
- Product parent TREE: `dd0315926270ec1f6571b82566dcdab3d65267f9`
- Product source identity: `b8b5e4a5797eb48b4cb8ae10439ff7dca5d8e2c900cb782b4802f69b21e23b7a / 289 files`
- Source lineage branch: `writer/ds01-global-data-sufficiency-seed`
- Candidate branch: `writer/surface-w05-manual-ai`
- Ceiling: `CONTROLLER_ACCEPTED_FOR_DATA_SUFFICIENCY_FOUNDATION__NOT_OVERALL_PRODUCT_ACCEPTANCE__NOT_MAIN_MERGED__NOT_RELEASED__NOT_DEPLOYED__STACK_NOT_FROZEN`

## SurfaceProfile / W05 oracle
- Profile: `cep-writer/references/surface-profiles/manual_ai.json`
- CENTER: `ManualProposalAdjudicationWorkbench`
- Commands: `manual_ai.draft`, `manual_ai.export`, `manual_ai.import`, `manual_ai.review`
- Primary W05 oracle: `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` / ORACLE-012.
Historical stack/provider assumptions in the donor do not become current capability.

## Reference / identity
Manual AI is a manual/provider-neutral proposal adjudication workflow. Human-mediated export/import/provenance/review are the truth; ACCEPT may create a working draft only.
- Visual ID: `1kfJayw9NGZvSeHLHwwRKppKnzTZid9yQ`
- Classification: `OWNER_CONFIRMED_FINAL_REFERENCE`
- SHA-256: `ae1d8df7230c9719bb7a8026949c285dc8c9b11f3b050899b1ec2d9b02b9f526`
- Local reference: `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/04_AI_BRIDGE/CEP_SYSTEM_AI_BRIDGE_REFERENCE.png`
Reference authority is Presentation-only.

## Applicable Owner decisions
- OD-20260918-055: preserve exact Surface identity/function/typed provider truth; generic route/screenshot PASS is insufficient.
- OD-20260916-045: runtime/provider/persistence claims require exact source/technical authority reconciliation.
- OD-20260921-066: mission-bound candidate branch; no direct main mutation/merge/release/self-promotion.
- OD-20260921-067: closed exact read set; no broad archaeology; no required live Drive dependency.
- OD-20260922-072: visual capability separation; navigation-independent rendering is NOT_GENUINE_ROUTE.
- OD-20260922-073: local-first diagnose/fix/recapture; intermediate evidence remains local.
- OD-20260922-074/075: full CAPSULE_V1_1 with Controller-prepared mission/bootstrap binding; bootstrap is not acceptance.
- OD-20260922-076: this is a new lane, so full capsule initialization is required.
- OD-20260924-081: ROUTE-CHATGPT isolation; no ROUTE-LOCAL topology/tool inheritance.

## Current findings
- A16-PF-005 OPEN: default Product composition lacks an admitted export helper / DraftSink; generic Product payload cannot complete the exact proposal workflow.
- A16-PF-006 OPEN: human disposition / edited-draft lineage remains in-memory/caller-derived rather than proven append-only durable lineage.
- CBF-003 P0 shared-owner prerequisite: BOTTOM content can exist while BottomDeepWorkOwner has zero registered providers. No per-Surface workaround.

## Provider/runtime/data truth
- `MANUAL_ONLY / PROVIDER_NEUTRAL`. Hidden provider calls=0. No provider keys/API/polling/embeddings and no automatic-generation claim.
- Default adapter without `exportPackage` helper returns `EXPORT_HELPER_UNAVAILABLE`; do not fake export/provider success.
- Import requires exact `sourceId + sourceRevisionId + sourceDigest + exportedPackageDigest`; mismatch => `PROVENANCE_INVALID`, no canonical write.
- Default adapter without `DraftSink` returns `DRAFT_SINK_UNAVAILABLE` on ACCEPT; do not claim draft creation or persistence.
- With an explicitly admitted DraftSink, ACCEPT creates a working draft only and `canonicalPublication=false`.
- Current disposition/history is in-memory unless a separately proven durable provider is bound; never label it append-only durable persistence.
- Manual AI is excluded from DS01 data seeding. No async/background completion claim.
- `unavailable/loading/stale/error/processing/success` must remain separate when applicable.

## Closed mandatory read set
- `cep-writer/references/surface-profiles/manual_ai.json` — whole file.
- `cep-writer/references/domain-oracles/CEP_W05_WORK_MASTER_PLAN_A-M_2026-08-31.md` — relevant Manual AI/W05 sections.
- `cep-writer/references/23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md` — manual_ai row + global doctrine.
- `cep-writer/references/FINAL_VISUAL_REFERENCE_REGISTER.md` — AI Bridge row/reference rules.
- `cep-writer/CURRENT_POST_C03_FINDINGS.json` — A16-PF-005/006 and CBF-003 only.
- `cep-writer/references/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md` — relevant provider/manual bridge constraints.
- `stack/native-typescript/adapters/manual_ai/domain-adapter.ts`
- `stack/native-typescript/surfaces/manual_ai/composition.ts`
- `stack/native-typescript/tests/rescue/S17_W05_VALIDATION_MANUAL_AI/s17-tests.ts`
- `stack/native-typescript/tests/surfaces/manual_ai/manual-ai-tests.ts`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts` — shared composition read-only.
- exact visual binary above.
No discovery by default. Bounded discovery escape only for a named missing/contradictory directly imported symbol in the smallest relevant source family.

## Writable
- `stack/native-typescript/adapters/manual_ai/**`
- `stack/native-typescript/surfaces/manual_ai/**`
- `stack/native-typescript/tests/surface-restoration/manual_ai/**`
- `writer-output/SWR-W05-MANUAL-AI/**`

## Read-only / collision locks
- Shared S17 test is read-only; add dedicated Manual AI restoration tests instead.
- `stack/native-typescript/surfaces/composition/w05-rescue.ts`, `stack/native-typescript/foundation/**`, and `stack/local-runtime/**` are read-only.
- CBF-003 is shared-owner-first; emit `SHARED_OWNER_ESCALATION` if it blocks closure.

## Prohibited
- `stack/native-typescript/main.ts`
- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- sibling W05/W01-W04 Product paths
- mutation of `cep-writer/**`, `authority/**`, `contracts/**`, `profiles/**`
- provider/API/polling/embedding integration that changes the manual-only contract
- `.github/**`, package/lockfiles, routes/server/deployment/config changes solely for evidence
- merge/release/deploy/accept/self-promote/governance/CURRENT_STATE mutation.

## Positive proof
- With an explicitly injected lawful local export helper, export binds exact source/revision/sourceDigest/packageDigest and performs zero provider calls.
- Provenance-equal manual import reaches IMPORTED and becomes reviewable.
- With an explicitly injected admitted DraftSink, ACCEPT is idempotent and creates draft only; `canonicalPublication=false`.
- Pointer/keyboard/focus/responsive/Bidi at 1440x1000 and 1024x900.

## Negative/falsification proof
- Default missing export helper remains unavailable; no export-success UI/receipt.
- Provenance mismatch => PROVENANCE_INVALID and blocks draft creation without destroying request provenance.
- Default missing DraftSink must not claim ACCEPTED_AS_DRAFT, canonical persistence, or background completion.
- No provider/API/polling/embedding network activity.
- In-memory review history is not labeled append-only durable persistence.
- No local BOTTOM-owner workaround.

## Visual evidence
Follow `WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md`. Recapture current/candidate locally at 1440x1000 and 1024x900. Inspect images and exercise pointer/keyboard/focus/unavailable states. Navigation-independent real-browser evidence must be labeled `FRESH_CURRENT_CANDIDATE__BROWSER_RENDERED__NAVIGATION_INDEPENDENT__NOT_GENUINE_ROUTE` and cannot close route/history/network/platform gates. This capsule intentionally uses `PARTIAL__LOCAL_RECAPTURE_ALLOWED`; no current-parent screenshot/provider success is fabricated.

## Output custody
- Surface folder Drive ID: `1FaYeRIJSQPTP6lW2rTkRPu8-7FdiKLgn`
- WRITER_OUTPUT Drive ID: `1gm9_UfBJaFuAR8F5SFdr-fljf5ZItsAK`
- Heavy final evidence goes to that Drive folder; small textual handoff may use `writer-output/SWR-W05-MANUAL-AI/**`.

## Stop Gate
`SURFACE_CANDIDATE_ONLY__CONTROLLER_DELTA_ADMISSION_REQUIRED`
