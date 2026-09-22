# CEP — R6 PRESENTATION CORR02 PRE-WRITER DEEP DEFECT AUDIT

**Role:** Controller defect-discovery ledger before further Product Writer mutation  
**Mode:** READ_ONLY audit of current candidate source/evidence; no acceptance, merge, release, R7 or stack freeze  
**Candidate:** `writer/presentation-corr02-google-ai-studio@da007840363d92cdadd9f7c5180449a49e6f1d19`  
**Main:** `ef7de5e05eee79d1302a84c47ef41ba5e94364c6`

## Verdict

`PRE_WRITER_AUDIT_OPEN__SHARED_OWNER_FIRST__BROAD_PRODUCT_WRITER_WAVE_NOT_YET_SAFE`

The candidate must not be split immediately into many independent Surface correction Writers. Several defects originate in shared carrier/Foundation seams; local Surface fixes would risk CSS masking, duplicate semantic owners and inconsistent evidence. Complete one bounded Controller defect ledger, then correct shared owners before leaf Surface correction.

## Finding ledger

### F-001 — Library donor semantic HTML is the runtime carrier for unrelated Surfaces — BLOCKING / SHARED_OWNER

`tools/extract_donor.py` preserves the accepted Library editor donor HTML while extracting scripts/styles. `dist/index.html` therefore carries Library/editor toolbar, identity, context and deep-work semantics before Foundation composition.

`composeToolbarSlots()` inserts `.foundation-global` and `.foundation-domain` slots but does not remove donor `.tg.main` / `.tg.identity` groups. This violates the Owner law that Library is donor + normal consumer, not universal semantic/action template.

### F-002 — WorkspaceFoundation actively binds donor Read/Edit/Save semantics for generic consumers — BLOCKING / SHARED_OWNER

`WorkspaceFoundation.bind()` projects mode state and intercepts donor `[data-action=set-mode]`, `[data-action=explicit-save]`, and `[data-action=toolbar-more]` whenever the host is `DONOR_FREE_WORKSPACE_HOST`. `workspace.toolbar(ids)` only populates `#domainToolbar`; it does not neutralize the donor groups.

Therefore this is not only stale HTML: foreign semantics can remain behaviorally active.

### F-003 — Consumer-specific CSS hides the donor leak only for a subset — BLOCKING / SHARED_OWNER

`foundation/extensions.css` suppresses donor toolbar/chrome fragments for `visualize`, `runs`, `golden` and `enterprise`, but not for many other non-Library consumers. This is a masking strategy, not a neutral shared carrier.

Source-level exposed population requiring fresh full-carrier browser falsification includes at least: `shell`, `today`, `rq`, `results`, `evidence`, `reviews`, `mastery`, `portfolio`, `configuration`, `manual_ai`, `releases`, `backup`, `health`, `processing`, `audit`, `validation`; `labs`/`scenarios` require separate region-by-region inspection because their structured studio composition rewrites some regions.

This population is SOURCE-RISK, not yet a claim that every listed Surface has been visually observed with the defect.

### F-004 — Global `surface.mode='read'` leaks Structured semantics into generic families — BLOCKING / SHARED_SEMANTICS

`WorkspaceHostKernel` initializes `state.surface.mode='read'` globally. Generic `createFamilyWorkspaceBinding()` forwards `mode` in command context even where a Surface has no Read/Edit domain concept. Removing/hiding toolbar buttons alone would leave semantic contamination.

### F-005 — Today B1 composes CENTER but not its zero-loss region contract — BLOCKING / SURFACE_COMPOSITION

Today profile requires typed Today `LEFT`, `CENTER`, selected-projection `RIGHT`, Today `BOTTOM`, and `TOOLBAR`. Current B1 calls `ensureStage()` and renders Today presentation into CENTER, updates limited banner copy, then populates only domain toolbar slot. It does not replace/rebind all profile regions. Result is structurally a Today center inside residual donor shell/chrome.

### F-006 — Today current-looking data is hard-coded acceptance projection, not SQLite/current provider truth — BLOCKING / DATA_PROVIDER

Current Product path imports `createBalanced6TodayProviders()` from `adapters/today/acceptance-data.ts` and passes it directly to `TodayProjectionDomainAdapter`. The provider hard-codes current-looking sessions, recommendations, attention items, relative times and progress. Descriptor authority is only `LOCAL_ACCEPTANCE_PROJECTION_ONLY`.

This path does not read SQLite. Therefore the current Today defect is not presently a database-column defect; it is primarily provider/data-binding/provenance truth.

### F-007 — Hard-coded continuation availability can enable Resume without canonical target proof — BLOCKING / DATA_PROVIDER_BEHAVIOR

Acceptance data hard-codes continuation `exists:true`, `readable:true`, `targetState:'RESOLVABLE'`. `TodayProjectionDomainAdapter.canResume()` treats that as sufficient to enable continuation. Without exact current source/provider resolution this converts fixture/acceptance assertions into live behavior availability.

### F-008 — Today recommendation provenance/availability is similarly acceptance-bound — BLOCKING / DATA_PROVIDER_BEHAVIOR

Recommendation `sourceRef`, version, reason code and rationale are hard-coded. Today correctly does not own canonical judgment, but the bound provider is not demonstrated as current source truth. Reference visual density does not authorize invented recommendation state.

### F-009 — Today SurfaceProfile state vocabulary and implementation have drifted — AUTHORITY/CONTRACT GATE

Packaged profile state dimensions use `AVAILABLE_DATA`, `AVAILABLE_EMPTY`, `PARTIAL`, `STALE`, `UNAVAILABLE`, `ERROR`. Adapter uses `OBSERVED_DATA`, `OBSERVED_EMPTY`, `PARTIAL`, `STALE`, `UNAVAILABLE`, `UNOBSERVED`, `FAILED` and internally maps legacy names. Determine whether the profile is stale or implementation drifted before acceptance; do not silently normalize authority in Product code.

### F-010 — Today error behavior violates packaged epistemic contract — BLOCKING / BEHAVIOR

Profile requires keeping the last successful projection plus a safe correlation reference on error. Adapter `project()` overwrites `lastProjection` with the failed/empty projection. A provider failure can therefore erase the prior successful projection instead of truthfully retaining it as required.

### F-011 — Today source-specific stale/unavailable truth is under-presented — MATERIAL / PRESENTATION+DATA

Profile requires per-provider `observedAt` for stale state and source-specific unavailable cards. Presentation mostly emits an aggregate status; source lines do not generally expose `observedAt`, and a provider with no items can disappear rather than become a source-specific unavailable/stale card.

### F-012 — Full-carrier negative falsification coverage is insufficient — BLOCKING / TEST_HARNESS

Existing Today/S07 tests exercise adapter/commands and semantic invariants but do not mount the real complete carrier and assert absence of Library-only Read/Edit/Save/KU/context/deep-work semantics. A passing leaf adapter test therefore allowed an obvious cross-surface Presentation defect.

Future full-carrier tests must verify both required profile regions and absence of foreign donor semantics at governed viewports/states.

### F-013 — B0 EventTarget repair is broader than the proven seam — BLOCKING / PREREQUISITE_CORRECTNESS

Checkpoint adds global `Node.prototype.closest` and `Window.prototype.closest` mutation in multiple owners. Existing narrow event-target normalization already demonstrates the smaller correct pattern. Under OD-070 remove duplicated global prototype mutation, retain bounded EventTarget normalization, then rerun focused + affected regression.

### F-014 — Writer authority packet is stale — BLOCKING / EXECUTION_INPUT

Candidate `cep-writer/CURRENT_MISSION.md`, `CANONICAL_MISSION_SOURCE.md` and Owner-decision snapshots omit OD-070/071 and retain older B0 wording. The new global visual-capture decision/method will also need inclusion in the next Controller packet refresh. No further Writer mutation should start from a stale self-contained packet.

### F-015 — W03 rescue defaults can instantiate shared owners when injection is omitted — AUDIT_REQUIRED / DUPLICATE_OWNER_RISK

`composeW03RescueGroup.requireShared()` creates new `TimelineReplayOwner`, `AnalyticalCompareOwner` and `OperationalSessionOwner` when absent even though the group contract says shared owners are injected/reused. Product wiring currently may inject central owners, but the defaults create a latent split-owner path that requires exact caller/consumer audit.

### F-016 — W04 rescue has a similar default AnalyticalCompare owner path — AUDIT_REQUIRED / DUPLICATE_OWNER_RISK

`createW04RescueComposition()` defaults to `new AnalyticalCompareOwner()`. Current m0 composition passes the central owner, but the default remains a latent alternate owner path. Classify test-only vs Product-admissible and remove/guard if it can reach a real consumer without central injection.

### F-017 — W05 creates fresh runtime transport composition per mount call — AUDIT_REQUIRED / PROVIDER_CONSISTENCY

`createW05RescueComposition()` defaults to a new bounded loopback transport. `m0-controller-composition.ts` creates a new W05 rescue composition each time a W05 Surface mounts. Transport declares `semanticOwnership:false`, so this is not automatically an ownership violation, but cross-Surface capability/receipt consistency must be checked before treating W05 as one coherent runtime observation plane.

### F-018 — Visualize truth copy remains at risk of mixed canonical/local labels — B3 OPEN / DATA_PRESENTATION

Current Visualize data is a bounded/local acceptance projection with representations marked non-canonical, while legacy/shared Presentation paths still contain copy such as `Canonical relationship workspace` / `Canonical relationships`. Exact B3 full-carrier inspection must ensure local/fixture representation truth is never labeled canonical.

### F-019 — Learn force-edit behavior requires capability-bound audit — AUDIT_REQUIRED / SEMANTICS

Legacy main composition calls `api.setMode('edit')` for Learn. Learn may inherit compatible Structured editing, but automatic global edit must be verified against the exact selected object capability and Learning semantics rather than assumed from Library/editor mechanics.

### F-020 — Green model/contract tests do not close current Presentation truth — EVIDENCE_GAP

Checkpoint model evidence is 210/210 but recorded under Node `v22.23.2`, not governed exact `v22.16.0`; contract evidence is 165 PASS / 3 FAIL. Current ChatGPT environment has exact Node `v22.16.0` and real Playwright/Chromium rendering, so the next correction wave can produce exact-target and fresh browser-rendered evidence without treating localhost navigation as a general visual blocker.

## Data/provider/database disposition

For each Surface, future audit must trace:
`UI field/copy -> Surface view-model -> domain adapter -> provider/transport -> persistence/database table or external runtime -> provenance/observedAt/revision -> availability/effect`.

Classify every displayed datum as one of:
`CANONICAL_PERSISTED / CANONICAL_PROVIDER_OBSERVED / DERIVED_PROJECTION / LOCAL_WORKING / GOVERNED_FIXTURE / ACCEPTANCE_FIXTURE / DEMO_SYNTHETIC / STALE / UNAVAILABLE / UNOBSERVED / ERROR`.

A database audit starts only after the actual read path reaches SQLite. For Today at current checkpoint, it does not.

## Required correction sequencing

1. Controller refreshes Writer authority/method packet; no Product mutation in this step.
2. B0 bounded EventTarget correction.
3. Central carrier/toolbar/mode semantic extraction correction at the narrowest shared owner. No consumer-local masking as the primary fix.
4. Full-carrier propagation/falsification across genuine non-Library consumers, with fresh browser-rendered screenshots at governed viewports and negative assertions for donor leakage.
5. Today zero-loss region composition + truthful provider binding/fallback + epistemic-state correction.
6. Reaudit RQ/Visualize B3 and then continue later Surface batches from the corrected shared parent.

Do not launch broad parallel Product Writers across the shared carrier before steps 1–4 converge. Read-only audit lanes may parallelize where they do not mutate shared hotspots.

## Acceptance rule

No finding closes because a Writer reports PASS, a screenshot exists, or a unit suite is green. Close each item only after exact source diff, real consumer execution, negative falsification, visual inspection where applicable, Owner-decision zero-loss review, and data/provider/persistence truth verification.


## Deepening pass — 23-Surface region/data/domain truth audit

The second pass compared all 23 packaged SurfaceProfiles against the exact checkpoint composition path rather than stopping at Today. The following findings are additive to F-001..F-020.

### F-021 — Profile LEFT/CENTER/RIGHT/BOTTOM roles collapse into CENTER for multiple Surface families — BLOCKING / SYSTEMIC_SURFACE_COMPOSITION

Every packaged SurfaceProfile defines shell roles separately: `LEFT` typed collection/navigation, `CENTER` primary workbench, `RIGHT` selected-object identity/context inspector, and `BOTTOM` deep diagnostics/history. `ensureStage()` creates `#foundationStage` only inside `#centerPane`. `renderTypedCollectionStage()` then renders its collection panel, primary workbench, optional truth/diagnostics aside and bottom projection inside that CENTER stage.

This is the direct path for RQ and the W04 group, and for W05 collection-driven Configuration / Manual AI / Releases. W05 Backup / Health / Processing / Audit / Validation also mount their Product work into the CENTER stage and require separate proof for the other shell regions. Therefore a visually rich center card grid does not prove the zero-loss SurfaceProfile region contract.

This finding is broader than Today F-005. Correction must happen at the correct shared Surface-composition/slot owner; do not patch each Surface with local CSS or duplicate pane systems.

### F-022 — Evidence import UI fabricates verification/provenance assertions — BLOCKING / PRODUCT_TRUTH

The W04 Evidence import form in `m0-controller-composition.ts` builds a Candidate Evidence envelope with hard-coded values including:
- `digest:'sha256:3333333333333333'`;
- `actor:'owner:local'` / `subject:'owner:local'`;
- `sourceBytesAvailable:true`;
- `schemaValid:true`;
- fixed criterion/purpose values.

`W04EvidenceDomain.importEvidence()` trusts those supplied booleans and stores the candidate with `schemaValid:true` and `sourceBytesAvailable:true`; it does not independently verify bytes, digest or schema. This is not a database-column problem. It is a Product input/provider-assurance defect: the UI supplies facts that must come from an exact verification/provider boundary.

Candidate import may remain local/session-scoped, but verification facts must be provider-derived or explicitly `UNVERIFIED/UNAVAILABLE`; they must never be invented by the presentation form.

### F-023 — W04 Evidence/Reviews default Product data contains rescue/demo authority claims — BLOCKING / DATA_PROVIDER

`W04EvidenceDomain()` defaults to hard-coded `initial()` records. Those include `schemaValid:true`, `sourceBytesAvailable:true`, rescue-base validation proof refs, admission-authority proof refs and placeholder-like digests. One seeded record is already `ADMITTED`; another is `SUBMITTED_FOR_INTAKE` with validation/authority assertions. `createW04RescueComposition()` constructs `new W04EvidenceDomain()` by default, so the Product path receives these records unless a real provider is injected.

`W04ReviewDomain()` likewise defaults to hard-coded formal reviews, reviewer authority flags/proof refs, findings and an existing formal decision, with fallback provenance `{source:'rescue-base'}`. The profile is `CONTRACT_ONLY`, not a real canonical provider implementation.

Normal Product UI may not present these as current Evidence/Review truth. They must be explicitly bounded test/demo data outside normal truth, or replaced by truthful provider/empty/unavailable states.

### F-024 — W04 Review command composition generates semantic content instead of collecting/proving it — BLOCKING / BEHAVIOR_DOMAIN_TRUTH

`reviews.finding` creates a finding from a toolbar action using generated ID plus literal text `Workbench finding` and state `NOT_ASSESSABLE`; there is no user-entered finding body in that command path. This can mutate a formal Review with content invented by the composition layer.

`reviews.supersede` similarly auto-generates a decision ID and generic correction reason. Worse, it passes outcome `INCONCLUSIVE`, while `W04ReviewDomain` accepts only `ACCEPT`, `ACCEPT_WITH_LIMITATIONS`, `MORE_EVIDENCE_REQUIRED`, or `REJECT`; therefore the wired Product command is contract-invalid even before authority semantics are considered.

Formal findings/decisions require explicit governed input, pinned basis and actual authority proof. Presentation may not synthesize their semantic content.

### F-025 — W04 Mastery and Portfolio normal Product composition starts from synthetic demo seeds — BLOCKING / DATA_PRESENTATION_TRUTH

`W04MasteryDomain()` defaults to records explicitly labeled `truthClass:'SYNTHETIC_DEMO_SEED'`, including `MASTERED` / `NOT_MASTERED` judgments. `W04PortfolioDomain()` similarly defaults to synthetic demo membership records. Their profiles are `CONTRACT_ONLY`.

Synthetic demo data can be useful for bounded tests, but it cannot silently become the normal Product data set or be rendered as the user's current mastery/portfolio truth. The real consumer must either bind an admitted provider or expose a truthful empty/unavailable/demo classification that cannot be mistaken for canonical state.

### F-026 — W04 toolbar silently truncates the domain command set — MATERIAL / TOOLBAR_ZERO_LOSS

`mountW04Group()` computes the full domain command set, then calls `workspace.toolbar([...commands].slice(0,3))`. Evidence has five domain commands; Reviews and Portfolio expose more than three. This makes command visibility depend on array order rather than profile semantics/availability and violates zero-loss toolbar composition.

The toolbar must classify universal vs contextual/domain actions and handle overflow/availability intentionally, not drop commands with `slice(0,3)`.

### F-027 — RQ B3 Product wiring uses non-production Balanced6 acceptance records — BLOCKING / DATA_PROVIDER

The RQ Product path constructs `RQDomainAdapter(BALANCED6_RQ_RECORDS, ...)`. The same source module declares the corpus classification `LOCAL_DEV_ACCEPTANCE_SEED__DETERMINISTIC__RESETTABLE__NON_PRODUCTION` and truth `SOURCE_GROUNDED_B09_BALANCED6__NOT_CANONICAL_RUNTIME_IMPORT`. RQ's packaged SurfaceProfile is `CONTRACT_ONLY / proof_consumer=false`.

The source material is valuable for deterministic proof, but it is not current canonical RQ runtime/provider truth. Normal RQ Product presentation must explicitly remain a bounded acceptance/demo projection or be rebound to the admitted real provider before acceptance.

### F-028 — W03 Labs / Scenarios / Results can render synthetic spatial relationships detached from real domain objects — BLOCKING / DATA_PRESENTATION_TRUTH

`seedRelations()` fabricates local nodes/relationships for Labs (`Task`, `Dependency`, `Validation`), Scenarios (`Phase`, `Module`, `Decision`) and Results (`Recorded result`, `Comparison`, `AAR`). Those relations are then mounted into Product spatial workspaces. For Results, the profile is `CONTRACT_ONLY` and explicitly forbids inventing historical events/results.

A reusable spatial engine may use test fixtures in harnesses, but normal Product composition must bind actual domain objects/relationships or clearly present an explicit non-canonical demo/empty state. Generic generated nodes are not a substitute for domain truth.

### F-029 — Shell composition also does not zero-loss bind its profile regions — MATERIAL / SURFACE_COMPOSITION

The Shell profile specifies typed route navigation, selected RouteContext inspector, bottom diagnostics/history and toolbar commands. The m0 Shell branch changes banner and writes a home section into CENTER, then binds navigation commands. It does not by itself establish the required LEFT/RIGHT/BOTTOM role composition. This must be included in the F-021 full-region correction/falsification matrix rather than treated as a complete Shell because navigation commands exist.

### F-030 — W05 collection toolbar mixes Settings entry into the domain toolbar path — AUDIT_REQUIRED / ROLE_SEPARATION

`mountW05Collection()` calls `workspace.toolbar([...commands,'foundation.settings'].slice(0,7))`. Current Owner law separates global SettingsCenter responsibilities from per-Surface toolbar/context responsibilities and forbids duplicate semantic owners. Determine whether `foundation.settings` is an intentional universal toolbar slot owned centrally or an accidental domain-slot injection. Do not duplicate a second Settings action/owner locally.

### F-031 — Data problem classification is now multi-layered; database rewrite is not the first correction — CONTROLLER_CLASSIFICATION

Current verified defects separate into at least four distinct data truths:
1. **Acceptance/demo provider bound as Product data:** Today, RQ, portions of Visualize/Learn proof data.
2. **Hard-coded domain rescue/demo seeds:** W04 Evidence / Reviews / Mastery / Portfolio.
3. **Presentation-generated assurance/semantic claims:** Evidence import verification flags/digest and Review finding/decision payloads.
4. **Real runtime/provider adapters:** parts of W05 such as Processing, where provider receipt/ACK truth is explicitly checked and must be audited against the actual transport.

No evidence from this pass establishes that SQLite schema/columns are the root cause of the Today/W04/RQ defects. Do not modify the database to compensate for a provider/composition problem.

## 23-Surface execution implication

The broad Product correction wave remains unsafe. The minimum safe convergence order is:

`Writer packet + OD-072/method refresh -> B0 EventTarget correction -> central neutral carrier / toolbar / global-mode correction -> shared shell-region composition correction + 23-Surface negative/role matrix -> W04 data/action truth correction -> Today provider/epistemic correction -> RQ/Visualize B3 -> remaining Surface batches -> integrated fresh browser visual/interaction audit`.

Read-only audit work may be parallelized by disjoint owner/family, but mutating Writers touching carrier/toolbar/slot owners must be serialized through one exact integration lineage.


## Fresh full-carrier runtime/visual falsification — genuine localhost route

The Controller executed an audit-only GitHub branch derived from exact Product checkpoint `da007840363d92cdadd9f7c5180449a49e6f1d19`. The audit branch modified only `.github/workflows/**`, `controller-audit/**`, and later `controller-targeted/**`; the workflow hard-failed if any Product or `cep-writer/` authority path differed from the checkpoint. No Product mutation was performed.

Primary run: GitHub Actions `35670265046`, audit HEAD `412ab73d1a4677548c5a757806442c2a6345d115`, artifact `10670544348`, artifact digest `sha256:bd113da504671fa8929f4c70290cbd5e3c0227b005aa5cdf546999178a52b210`. Toolchain was exact Node `v22.16.0`, npm `10.9.2`, Playwright `1.62.1`. `npm test` passed `210/210`. Genuine localhost navigation was available. The Controller captured `23 Surfaces × 2 viewports = 46` fresh screenshots at `1440×1000` and `1024×900`, opened the material screenshots/contact sheets, and visually inspected them.

Targeted falsification run: GitHub Actions `35671028123`, audit HEAD `f7d3e7de80d1cfaea2c2c039a201c00b647c7ed3`, artifact `10671850032`, artifact digest `sha256:50800de8905b75bcc85b78e2074965bf4790a47a30a91c04e1319ff897c10133`. This run corrected the audit selector for the responsive RIGHT reveal control and proved the actual `[data-pane-toggle=right]` path on the genuine route.

### F-032 — Library semantic toolbar contamination is runtime/visual confirmed across the non-exempt carrier population — BLOCKING / SHARED_PRESENTATION

Fresh full-carrier inspection confirms the source-level F-001/F-002 risk is an actual Product Presentation defect, not merely static risk. At both governed viewports, `36/36` inspected captures across `18` non-Library/Learn Surfaces visibly expose Library donor Read/Edit controls and explicit Save. Visual inspection confirms the same Library KU/banner/toolbar language appears around unrelated Surface workbenches. Existing CSS masks these donor groups only for a bounded subset (`visualize`, `enterprise`, `runs`; `golden` is not one of the 23 Product Surfaces).

The correction belongs to the central carrier/toolbar/Surface-mode seam. Do not patch the 18 consumers individually and do not hide the defect with more consumer-specific CSS. Library and compatible Structured consumers must retain applicable donor value through explicit binding; unrelated Surfaces must receive the neutral shared toolbar grammar plus their own contextual/domain commands only.

### F-033 — Responsive RIGHT mechanics are CLEAN, but RIGHT semantic binding is wrong on multiple Surfaces — BLOCKING / REGION_SEMANTICS, NOT RESPONSIVE_GEOMETRY

The initial automated full-carrier scanner flagged collapsed RIGHT panes at `1024×900`. That scanner used the wrong opener selector and is superseded for this point. Targeted genuine-route falsification against the real `[data-pane-toggle=right]` control passed `22/22`: every Profile-requiring RIGHT Surface changed from responsive `collapsed` to `open/visible`. Therefore there is no blanket 1024 RIGHT-pane mechanism blocker.

However, the opened content proves the systemic region-binding defect. `shell`, `today`, `rq`, `evidence`, `reviews`, `mastery`, `portfolio`, `validation`, `manual_ai`, `backup`, `audit`, `releases`, and `configuration` expose the residual donor generic context (`الوحدة / الكتلة المحددة`) rather than their Profile-defined selected-object/domain inspector. `health` and `processing` append domain-specific content while donor context chrome/text remains present. This is a Surface role/content binding defect under the shared region composition, not a reason to replace the proven responsive pane owner.

### F-034 — Visualize displays canonical copy over a non-canonical local acceptance provider — BLOCKING / DATA_PRESENTATION_TRUTH

Fresh genuine-route Visualize evidence directly confirms F-018. The bound provider reports `LOCAL_ACCEPTANCE_PROJECTION_ONLY`; representation relations are `canonical:false`, and node status says `Local acceptance projection`. Yet the normal RIGHT inspector visibly says `Canonical relationship workspace` and `Canonical relationships`. This is a Product copy/truth contradiction. Correct the Presentation/provider projection truth; do not promote the acceptance projection to canonical merely to satisfy the copy.

### F-035 — Visualize current provider is read-only while the packaged profile requires domain-valid editing — BLOCKING / PROFILE_PROVIDER_BINDING

Targeted runtime enumeration found `0` eligible relation endpoint pairs. Every pair returns `READ_ONLY / Relationship source is read only`. The packaged Visualize profile declares `spatial.connect`, `spatial.relation.commit`, `relation.edit`, `relation.undo`, `relation.redo` and the invariant `All four views support domain-valid editing through same semantic command`, while current `domain_implementation` is `BOUNDED_FIXTURE`. This is not permission to make the acceptance provider writable. B3 must resolve the mismatch truthfully by binding the intended editable domain/provider path or explicitly reconciling the profile/availability contract without fabricating canonical mutation.

### F-036 — Three legacy browser relation flows are stale against current read-only Visualize truth — BLOCKING / TEST_HARNESS_EVIDENCE

Fresh `npm run browser:test` on the genuine route produced `2 PASS / 4 FAIL`. Three failures (`spatial.selection-connect-canonical-edge`, `relation.route-convergence-and-label-scope`, `central-change-reuse`) assume an editable eligible Visualize relation pair and/or an editable edge composer. Exact runtime evidence proves the current bound provider is read-only and has `0` eligible pairs; edge-label double-click truthfully remains inert under that provider. These browser tests are therefore not valid Product-editability proof for this exact checkpoint. Update the harness to test availability/truth ceilings and separately test editing only against a provider/consumer contract that actually authorizes editing. Do not mutate Product solely to make the stale assumptions pass.

F-035 remains independently open: the Product/Profile/provider mismatch itself still requires B3 adjudication.

### F-037 — Legacy Runs causal browser failure is a stale harness API read; actual causal Product path passes — EVIDENCE_HARNESS_DEFECT / PRODUCT_PATH_CLEAN_FOR_THIS_FLOW

The fourth legacy browser failure dereferences `CEPFoundation.operational.providerDescriptor.id`, but the current `OperationalTerminalHost` does not expose that property. Targeted genuine-route falsification used the current `wave4Assembly.operationalSession.providerDescriptors()` boundary and exercised the visible Operational terminal. Submitting `shutdown` produced a consistent causal result: `DEV-WEB-01.up=false`, spatial node `DOWN`, latest event `device.shutdown`, recorded projection `up=false`, terminal output reports interface DOWN, and RIGHT Runs context updates to event sequence `1` / State `DOWN`. Provider descriptor remains `InternalSimulationAdapter / INTERNAL_SIMULATION`.

Therefore this browser failure must be fixed in the harness, not by changing Product runtime/provider semantics.

### F-038 — W04 rescue/demo truth is visibly exposed in normal Product Presentation — BLOCKING / DATA_PROVIDER_PRESENTATION

Fresh images convert F-023/F-025 from source-only findings into direct visual evidence. Evidence/Reviews show formal-looking seeded Evidence/Review data; Mastery visibly shows seeded `user:self` judgments including `MASTERED`; Portfolio visibly exposes `SYNTHETIC_DEMO_SEED` records. These profiles are `CONTRACT_ONLY`. Normal Product mode must bind real provider truth or explicitly classified demo/empty/unavailable state; formal authority, Review Decision, Mastery, or Evidence verification cannot be inferred from rescue seeds.

### F-039 — W03 synthetic relation scaffolding is visibly present on real Product routes — BLOCKING / DOMAIN_DATA_PRESENTATION

Fresh Scenarios/Labs/Results inspection confirms F-028 reaches normal Product Presentation. Synthetic `seedRelations()` labels such as Phase/Module/Decision, Task/Dependency/Validation, and Recorded result/Comparison/AAR are rendered as workbench/spatial content. Shared Spatial mechanics may render domain objects but may not manufacture them. Rebind to actual domain objects/provider data, or render an explicit bounded demo/empty/unavailable state.

### F-040 — Exact governed Node regression is now independently green — CLOSED EVIDENCE GAP / NOT PRODUCT ACCEPTANCE

The audit runner independently executed `npm test = 210/210 PASS` under exact Node `v22.16.0`. This closes the prior exact-Node evidence gap in F-020 for model tests only. It does not close any Presentation, provider/data, browser, or Surface acceptance finding.

### F-041 — Canonical browser/check evidence harness remains inconsistent with the new full-carrier evidence — BLOCKING / EVIDENCE_PACKAGE

Before fresh browser execution, `npm run check` failed on stale environment/source browser receipt. After genuine localhost browser execution, `browser.current_candidate_claim_truthful` became PASS, but the browser receipt is `BLOCKED_OR_FAILED` because of the four flows above and the legacy screenshot manifest contains only one screenshot from the two passing flows. `browser.targeted_visual_evidence` therefore remains FAIL even though the separate Controller full-carrier audit produced and visually inspected 46 fresh hash-bound screenshots.

Do not relabel either source. The package check must be corrected only after the relation/Runs harness classification above is encoded and the accepted evidence path incorporates the correct fresh full-carrier evidence class.

## Updated correction ownership / execution DAG

The broad Product Writer wave remains unsafe. The next legal mutation sequence is now:

`C0 Controller packet refresh (no Product) -> C1 SERIAL SHARED FOUNDATION/CARRIER/REGION CORRECTION -> independent C1 falsification -> C2 W04 data/action truth -> C3 Today provider/epistemic truth -> B3 RQ/Visualize provider/profile correction -> remaining surface batches -> B9 integrated 23-Surface audit`.

C1 owns only shared issues: B0 EventTarget/global `.closest` cleanup, neutral carrier/toolbar semantics, removal of generic cross-Surface `surface.mode`, and correct binding of Profile regions to the existing shared pane/bottom hosts. It must preserve the responsive pane owner proven `22/22` and must not solve W04/Today/RQ/Visualize domain truth locally.

Every correction after C1 must consume the exact C1 candidate and re-run the 23-Surface negative donor-leak matrix. No sibling ZIP overlay and no parallel mutation of the shared carrier/toolbar/region hotspots.

## Local-first exact-checkpoint deepening — 2026-09-22

The Controller materialized the exact Product checkpoint `da007840363d92cdadd9f7c5180449a49e6f1d19` into the local execution environment and verified canonical source identity `777d8b24032891b00bf3b61858a3be015b0b77fea710e1d5bd446d182577bb51 / 273` with the repository's own `tools/source-tree-identity.mjs`. GitHub Actions was used only once as byte transport for this exact snapshot; all findings below were discovered/reproduced locally with exact Node `v22.16.0`, local build/model/runtime execution and Python Playwright + installed Chromium `144.0.7559.96`. Browser evidence in this section is `NAVIGATION_INDEPENDENT_EXACT_CANDIDATE_BROWSER_RENDER`, not genuine-route evidence; genuine-route F-032..F-041 evidence remains separately bound above.

Local exact-candidate regression split is cleanly classified: `npm test = 210/210 PASS`, `npm run build:runtime = PASS`, and `npm run runtime:check = PASS`. Local Node `npm run browser:test` cannot currently start because the interrupted local `npm ci` did not leave the Node `playwright` package resolvable; this is a local dependency-state limitation, not a Product finding. Python Playwright is installed and was used for the focused browser probes below. Local `npm run check` reproduces stale browser/screenshot lineage failures already classified by F-041; no new Product failure is inferred from that evidence staleness.

A refinement to F-032/F-004 is also established: on representative non-Structured `global` consumers (`today`, `rq`, `reviews`, `mastery`, `portfolio`, `shell`, `configuration`), the visibly leaked donor Read/Edit controls do **not** silently change workspace mode. Activating them is denied with `WORKSPACE_MODE_UNAVAILABLE_FOR_FAMILY:global`; representative explicit Save likewise does not fabricate persistence. The defect therefore remains a blocking visible/semantic carrier contamination plus inappropriate global mode state, while the current shared family guard is a behavior boundary that C1 must preserve rather than remove.

### F-042 — Shared global toolbar loses selected-row context for W04 commands — BLOCKING / SHARED_ACTION_BINDING

Local exact-candidate browser falsification on `reviews` proves the current global toolbar is not context-bound to the selected W04 row. `CommandRegistry.availability('reviews.finding',{id:'review-1'})`, the same call with `review-2`, and corresponding `reviews.review` / `reviews.supersede` calls are `AVAILABLE`; the no-payload forms are `UNAVAILABLE / Select Review`. Nevertheless the Product toolbar renders those commands through `WorkspaceFoundation.toolbar(ids)`, which calls `commands.availability(id)` with no payload, and its click route executes only `{invoker,route}`. After selecting the second Review row, the toolbar remained disabled for `Continue Review`, `Add scoped finding`, and `Compare exact Review revisions`.

This is broader than F-026 command truncation. The shared toolbar/action carrier needs a truthful contextual-payload binding and availability refresh mechanism owned centrally; it must not learn W04 semantics. C1 owns that reusable mechanism. C2 still owns W04-specific command inputs/effects.

The same probe confirms the semantic half remains separate: direct execution of `reviews.finding` with a valid selected-row payload succeeded but ignored the supplied finding text and created literal `Workbench finding`, reinforcing F-024. Therefore C1 may restore contextual command transport/availability only; it may not synthesize or repair formal Review content itself.

### F-043 — Evidence import runtime accepts Presentation-generated verification assertions into Candidate Evidence — BLOCKING / PRODUCT_TRUTH

Local exact-candidate runtime falsification converts F-022 from static source evidence into an executed Product path. The visible Evidence import form constructs an envelope with fixed `digest:'sha256:3333333333333333'`, `actor/subject:'owner:local'`, `sourceBytesAvailable:true`, `schemaValid:true`, fixed criterion and governed purpose. Executing the exact form-equivalent `evidence.import` route returns `ok:true` and stores `candidate-local-001` with those digest/verification booleans intact.

The domain truthfully keeps this object at Candidate level (`candidateState:'PREPARED'`, `intakeValidation.status:'NOT_VALIDATED'`, `admissionAuthority.available:false`, `canonicalEvidenceCreated:false`, `importAssurance:'UNCLASSIFIED'`), so this probe does **not** claim fake Admission. The blocker is narrower and exact: Presentation-supplied assertions that look like byte/schema verification are accepted as Candidate fields without an independent verifier/provider boundary. C2 must make those facts provider-derived or explicitly `UNVERIFIED/UNAVAILABLE`; it must preserve the existing Candidate-versus-Admission separation.

### F-044 — Today renders enabled continuation actions from acceptance-provider assertions without canonical target resolution — BLOCKING / DATA_PROVIDER_BEHAVIOR

Local exact-candidate browser/runtime inspection strengthens F-007. The normal Today route renders `7` enabled resume/action buttons representing `6` unique continuation-ready items. For each of those unique items, `TodayProjectionDomainAdapter.canResume()` returns `AVAILABLE` and `resume()` returns `CONTINUATION_READY` because the bound `balanced6.today.orchestration-provider` supplies `exists:true`, `readable:true`, and `targetState:'RESOLVABLE'`.

The adapter remains read-side only and truthfully reports `canonicalWrites:false`, `masteryWrites:false`, `accessDecisionOwner:false`; `resume()` also reports `mutated:false`, `progressMutation:false`, `accessDecisionMade:false`. The defect is therefore not a fabricated progress write. It is current-looking continuation availability being derived from `LOCAL_ACCEPTANCE_PROJECTION_ONLY` assertions rather than an exact current target-resolution/provider boundary. C3 must preserve the no-write/access-decision ceiling while rebinding or truthfully degrading continuation availability.

## Local-first execution consequence

The correction DAG is now refined to:
`C0 packet refresh -> C1 shared carrier/region/contextual-toolbar mechanism -> independent C1 falsification -> C2 W04 provider/action semantics -> C3 Today provider/epistemic/continuation truth -> B3-R RQ+Visualize -> remaining batches -> B9 integrated audit`.

C1 must close F-042 as a reusable action-carrier mechanism in addition to its already-bound shared carrier/mode/region scope. C2 consumes that clean mechanism and closes F-022..F-026/F-038/F-043 without moving formal Evidence/Review semantics into Foundation. C3 closes F-007..F-011/F-044. No broad parallel Product Writer wave is safe before C1 convergence.



## C1 Independent Controller acceptance — 2026-09-22

Exact C1 final branch HEAD `ac888c7e622fdefdc4f958771b21db485e33f9fc`; validated Product HEAD `7fbc25f781e7b8e9fe3eba72f5a57ffe2ed96c1c`; accepted Product source `5885c32a71c14b1b982ec8dcdadba4fafde40c78b2d9287f367f1ca28373f91d / 273`. Controller independently reviewed the exact 14-Product-path delta, final/revert artifacts, logs/receipts, all 46 full-carrier screenshots, targeted responsive/context/EventTarget evidence and the central revert proof.

**Accepted closed findings:** `F-013`, `F-001`, `F-002`, `F-003`, `F-004`, `F-005`, `F-021`, `F-029`, `F-032`, `F-033`, `F-042`.

C1 introduces no accepted closure for downstream truth findings: `F-022..F-026`, `F-038`, `F-043` remain C2; `F-007..F-011`, `F-044` remain C3; `F-027`, `F-034..F-036` remain B3-R; `F-028`, `F-039` remain later W03/domain work.

Evidence clarification: Writer claim `43/46 byte-identical to previously inspected set` is not bound to an exact intermediate artifact. Against governed pre-C1 artifact `10670544348`, only `4/46` are byte-identical and `42/46` changed, which is expected from the shared carrier/region correction. Because Controller directly inspected all 46 final images and verified the final source-bound artifact, this is `NONBLOCKING_EVIDENCE_ACCOUNTING_AMBIGUITY`, not a Product defect.

**Disposition:** `C1_CONTROLLER_ACCEPTED__DOWNSTREAM_PARENT_ELIGIBLE__NO_MAIN_MERGE_RELEASE`.


## C2 Controller closure — 2026-09-22

Writer C2 candidate `287c30d135597c692a367cd1561aea67fd2c54bc` was **rejected as delivered for one exact remaining F-043 provider-boundary defect**. Although normal UI import was truthful, direct domain falsification showed caller-supplied string-only `VERIFIED` source assertions, validation proof and admission-authority proof could still create an admitted immutable Evidence revision without a bound verification provider.

Controller bounded Correction01 changed only the existing Evidence domain owner plus the C2 falsification harness. Accepted corrected identity: HEAD `1acf9d691b27b1a271f149139e055110971b1fa0`; tree `e8b26523c72aba5888439eedb221feff9edc9486`; Product source `760578213b3f3e352dd2b08dd05fab183c3ffad9625844a1d0ea82e30cc9e454 / 273`; package Drive `11tlmcoAFIUjmprNv8gkVLWe0q37jDR6u`; Controller audit Drive `1IJafIuLSO8YSOJ9vllltmCuHQp-nOwgV`.

Final Controller disposition: `F-022 CLOSED`, `F-023 CLOSED`, `F-024 CLOSED`, `F-025 CLOSED`, `F-026 CLOSED`, `F-038 CLOSED`, `F-043 CLOSED_AFTER_CONTROLLER_CORR01`, and W04 domain-semantic half of `F-042 CLOSED`. Provider-unbound imports cannot self-assert `VERIFIED`; a future real verification provider remains separate governed work.

Corrected evidence: build PASS; `npm test 210/210 PASS`; runtime PASS; C2 falsification `9/9 PASS`; browser `60/60 PASS` / `11` exact-source screenshots; all 11 images byte-identical to the accepted C2 visual set. Three root stale browser/evidence-lineage check failures and legacy pre-C2 W04 tests remain explicit harness/evidence debt, not Product blockers.

**Disposition:** `C2_CONTROLLER_ACCEPTED_AFTER_BOUNDED_CORRECTION01__C3_PARENT_ELIGIBLE__NO_MAIN_MERGE_RELEASE`.


## C3 Controller closure — 2026-09-22

Writer C3 tree/source were independently reconstructed from exact capsule transport parent and scope-verified, but the Writer result was **not accepted as delivered**. Controller negative falsification found that `TodayProjectionDomainAdapter` still accepted provider state `STALE` when `observedAt` was absent, violating F-011's governed per-provider stale provenance requirement.

Bounded Controller Correction01 under `OD-20260916-044` added the missing existing-owner guard and one falsification case only. Exact accepted identity: HEAD `fec137df4b06111db160cdcbd25d7c725dfec286`; tree `5e38492adc4dce89972d59a7b059430990e83bc4`; Product source `e3951754ae79016603456b14dc71856671428e0d0811ec119388fbd79093890c / 273`; package Drive `1gqTgEajskWLnnyKHo4aV_hW4zfqdCVhB`; Controller audit Drive `1vnl8aBchUh6CbEwJQRGXln1rampZELzR`.

Final Controller disposition: `F-007 CLOSED`, `F-008 CLOSED`, `F-009 CLOSED`, `F-010 CLOSED`, `F-011 CLOSED_AFTER_CONTROLLER_CORRECTION01`, `F-044 CLOSED`; F-006 remains root-context only. Corrected evidence: build PASS; model `210/210 PASS`; runtime PASS; Balanced6 `32/32 PASS`; C3 falsification `18/18 PASS`; exact-source Today visual/state evidence inspected at both governed viewport families. The same three root browser/evidence-lineage check rows remain stale non-Product debt.

**Disposition:** `C3_CONTROLLER_ACCEPTED_AFTER_BOUNDED_CORRECTION01__B3R_PREREQUISITES_SATISFIED__CAPSULE_PREPARATION_NEXT__NO_MAIN_MERGE_RELEASE`.


## B3-R Independent Controller audit — post-Writer result

### F-045 — Visualize governed four-view Product composition is not wired — BLOCKING / PRESENTATION + BEHAVIOR + FUNCTIONALITY

The exact B3-R Writer candidate and Controller Correction01 both retain normal Visualize Product composition from `main.ts` with `view='topology'` and only `Topology / Objects / History` view controls. The governed `visualize.json` SurfaceProfile declares state dimension `TREE / PATH / GRAPH / CANVAS`; the current B3-R mission explicitly defines Visualize as those four views over one Spatial workbench and requires all four states to remain one shared engine with distinct view semantics.

`VisualizeDomainAdapter` does contain `TREE / PATH / GRAPH / CANVAS` adapters, but they are descriptor-level unless a valid `mode` reaches the commands. Exact post-correction runtime inspection shows the normal Product UI contains no Tree/Path/Graph/Canvas selector; `visualize.select`, `visualize.move`, and `visualize.viewport` are disabled with `VISUALIZE_VIEW_MODE_REQUIRED`. Therefore adapter presence does not satisfy Surface identity/functionality under `OD-20260918-055`.

Direct visual comparison also shows a material Presentation gap independent of illustrative reference data: the Owner-confirmed Tree page reference exposes explicit Tree/Path/Graph/Canvas selection and Tree-specific composition; the Path/Graph/Canvas supporting references expose distinct view grammars. The current Product presents one generic topology canvas plus table/history. Correct this through existing Visualize/spatial composition owners; preserve one `SpatialInteractionKernel`, representation/canonical separation, and current read-only provider truth. Do not create four engines or make acceptance data canonical/writable.

### F-046 — B3-R final visual evidence omits required Tree/Path/Graph/Canvas states — BLOCKING / EVIDENCE_COMPLETENESS

The Writer evidence ZIP contains six screenshots only: RQ default `1440×1000`, RQ default `1024×900`, RQ RIGHT-reveal `1024×900`, Visualize default `1440×1000`, Visualize default `1024×900`, and Visualize RIGHT-reveal `1024×900`. None is a Tree/Path/Graph/Canvas-specific state.

B3-R mission gate explicitly requires `Tree/Path/Graph/Canvas states are visually compared against their governed reference ceilings at 1440×1000 and 1024×900 as applicable`. The evidence set therefore cannot close that gate. This is distinct from F-045 Product incompleteness: even after Product correction, acceptance requires fresh exact-candidate view-specific evidence that is opened and inspected.

## B3-R Controller Correction01 truth closure

The Writer's claims for F-027/F-035 were not sufficient under negative falsification. Controller found: (a) `canonical:false` provider projection with a non-local-acceptance authority plus write methods could still enable canonical mutation; (b) `rq.search` was command-available while the current RQ provider was explicitly unavailable. Controller Correction01 at HEAD `64a31e409c860a1e266101fd38fcb01f679327a2` / Product source `16588836714764f10bc52066827e82b98b6809284e9aabeb19dd1e92580b6e36 / 273` closes both in existing owners only. Post-correction direct falsification proves noncanonical provider commits/edits remain zero and RQ Search is disabled without an admitted current provider; B3-R focused suite is `13/13 PASS`.

Current disposition after Correction01: `F-027` provider/search truth `CLOSED_AFTER_CONTROLLER_CORR01`; `F-034` `CLOSED` for canonical-copy/provider truth; `F-035` `CLOSED_AFTER_CONTROLLER_CORR01` for canonical-write/provider boundary; `F-036` stale-harness source correction remains clean with genuine-route evidence ceiling preserved; `F-045` and `F-046` are OPEN/BLOCKING. B3-R as a whole remains NOT ACCEPTED.
