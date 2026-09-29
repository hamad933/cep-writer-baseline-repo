# 05_foundation / mechanic_owner_conflicts (B-3)

Timestamp: 2026-09-29T02:20Z · Source: live inspection of `cep-writer-baseline-repo` @ `writer/cep-serial` `48fec276` · Classification: CURRENT_VALIDATED (read-only pass; no product/contract/evidence file modified)

Scope: every registry-vs-code, registry-vs-registry, profile-vs-code, and historical-lock-vs-current
ambiguity found while resolving B-2/B-3. Each entry gives BOTH evidences and a recommended
resolution. **Conflicts found: 18** (C-01 … C-18). All recommended resolutions are reconciliation
actions (registry/contract/declaration updates or owner-name normalization) — none require new
product ownership inventions.

---

## C-01 — Global shell navigation: registry symbol unresolved vs executable owner

- **Declared (registry):** `contracts/CORE_OWNER_REGISTRY.json` SC-001 `core_or_engine:
  "GlobalShellCore"`, `implementation: null`, `implementation_status: "CONCEPT_CONTRACT_ONLY"`,
  `physical_implementation_status: "CONCEPTUAL_OWNER_ADMITTED__PHYSICAL_FILE_SYMBOL_UNRESOLVED_FOR_NEW_FOUNDATION"`.
  Additionally **absent** from `contracts/MECHANIC_OWNERSHIP_REGISTRY.json` (30 records, no shell),
  `contracts/COMPONENT_REGISTRY.json` (38 records, no shell), and
  `contracts/STATE_OWNERSHIP_REGISTRY.csv` (35 rows, no shell row).
- **Observed (code):** `stack/native-typescript/foundation/global/shell/navigation.ts` —
  `export const GLOBAL_SHELL_OWNER='GlobalShellNavigationOwner'` (L7), `export class
  GlobalShellNavigationOwner` (L70), `mountGlobalShellNavigation` (L435). Destination authority in
  the same module family: `foundation/global/shell/destination-registry.ts` L17/L18
  (`GlobalShellDestinationRegistry`, `GlobalShellAreaBaseline`), `foundation/global/shell/cep-destinations.ts`
  (all 23 destinations, e.g. health L23, processing L24). Guard evidence:
  `surfaces/composition/w01-w02-rescue.ts` L21-24 `if(navigation?.owner!==GLOBAL_SHELL_OWNER)throw
  Error('CG3_SHARED_GLOBAL_SHELL_OWNER_REQUIRED')`; command owner stamps `surfaces/shell/surface.ts`
  L25/L37 (`owner:'GlobalShellNavigationOwner'`).
- **Recommended resolution:** single owner = **GlobalShellNavigationOwner**
  (`foundation/global/shell/navigation.ts`). Update `CORE_OWNER_REGISTRY.json` SC-001 to record
  `GlobalShellCore (conceptual) → GlobalShellNavigationOwner (physical owner)` with implementation
  `stack/native-typescript/foundation/global/shell/navigation.js`, and add a
  `MECHANIC_OWNERSHIP_REGISTRY.json` record `global.shell-navigation` (FOUNDATION_OWNER). Note
  `authority/OWNER_CURRENT_RULES.json` OWNER-20260910-010 (`SHELL_DESIGN_REOPENED`) keeps the visual
  composition unaccepted; that does not change owner identity.
- **Residual risk if unresolved:** a future Writer could create a second shell owner because the
  registry advertises the physical symbol as unresolved.

## C-02 — SC-011 PreferenceExportImportResetModel: "CONCEPT_CONTRACT_ONLY" vs implemented actions

- **Declared:** `contracts/CORE_OWNER_REGISTRY.json` SC-011 `core_or_engine:
  "PreferenceExportImportResetModel"`, `implementation: null`, `implementation_status:
  "CONCEPT_CONTRACT_ONLY"`, `physical_implementation_status: ...PHYSICAL_FILE_SYMBOL_UNRESOLVED...`;
  all 23 `profiles/*.json` classify SC-011 `MANDATORY_INHERIT` with `owner:
  "PreferenceExportImportResetModel"`.
- **Observed:** no symbol of that name exists in `stack/native-typescript`. The mechanic is
  implemented as a two-owner split:
  `foundation/global/settings/center.ts` — `SETTINGS_CENTER_CONTRACT.sc011PreferenceTransferActionHome:
  'settings.transfer'` (L17), `transferSections()` (L72-84) exposing `settings.preferences.export /
  import / reset` (L77-79) with `delegatesTo:'ScopedPreferencesOwner'`, receipts at L130-149;
  `foundation/global/preferences/store.ts` — `export()` (L19), `import()` (L20), `reset()` (L16).
  Executable proof: `stack/native-typescript/tests/post-c03/D03A/d03a-command-settings-convergence-tests.ts`
  L60-71 asserts "exactly one SC-011 transfer action-home", "all three SC-011 actions exposed".
- **Recommended resolution:** declare SC-011's physical implementation =
  `foundation/global/settings/center.ts` (action home, SettingsCenterOwner) +
  `foundation/global/preferences/store.ts` (export/import/reset, ScopedPreferencesOwner), status
  EXECUTABLE_BOUNDED. Keep the conceptual name `PreferenceExportImportResetModel` as the SC id label.
  Single owner for the *model semantics*: **ScopedPreferencesOwner**; single owner for the *action
  home*: **SettingsCenterOwner** (`settings.transfer`).
- **Residual risk:** writers may re-implement export/import/reset elsewhere because the registry
  claims none exists (duplicate-mechanic risk on a MANDATORY_INHERIT mechanic).

## C-03 — Preference system: registry implementation path points at a facade

- **Declared:** `contracts/COMPONENT_REGISTRY.json` `ScopedPreferencesOwner` (SC-008)
  `implementation: ["dist/foundation/models.js"]`; `contracts/CORE_OWNER_REGISTRY.json` SC-008
  `PreferenceScopeResolver` `implementation: "dist/foundation/models.js"`, `implementation_status:
  "PARTIAL_EXECUTABLE_OWNER"`. (SC-007 `GlobalPreferenceCore` correctly names
  `dist/foundation/global/preferences/store.js + ui-scale.js`.)
- **Observed:** canonical class is `foundation/global/preferences/store.ts` —
  `SCOPED_PREFERENCES_OWNER='ScopedPreferencesOwner'` (L3), `class ScopedPreferencesOwner` (L9),
  scope precedence `scopes()` (L11), `resolve()` (L17), persistence L21-22. `foundation/models.ts`
  L83-84 states explicitly: `/** Backward-compatible facade only; canonical owner identity is
  ScopedPreferencesOwner. */ export class ScopedPreferences extends ScopedPreferencesOwner {}`.
  Scope-resolution semantics (safe default → global → workspace → surface → view → component → session)
  are implemented in `store.ts` `scopes()`/`resolve()`, not in `models.ts`.
- **Recommended resolution:** re-point both records to
  `dist/foundation/global/preferences/store.js` (canonical) with `dist/foundation/models.js` noted as
  compatibility facade only; SC-008 `PreferenceScopeResolver` → implementation
  `dist/foundation/global/preferences/store.js`, status EXECUTABLE.
- **Residual risk:** low (facade is subclass-safe today) but path drift breaks traceability tooling
  (`tools/reconcile-current-owner-registries.py`).

## C-04 — Command registry: SemanticCommandBus path/layering mismatch

- **Declared:** `contracts/COMPONENT_REGISTRY.json` `SemanticCommandBus` (SC-016) `implementation:
  ["dist/foundation/models.js"]`; `contracts/FOUNDATION_RUNTIME_REGISTRY.json` component
  `SemanticCommandRegistry` `implementation: ["dist/foundation/models.js"]`.
- **Observed:** two distinct modules: `foundation/global/commands.ts` owns the bus
  (`SEMANTIC_COMMAND_BUS_OWNER='SemanticCommandBus'` L1, `class SemanticCommandBus` L13,
  `assertCanonicalSemanticCommandBus` L31); `foundation/models.ts` owns the registries
  (`CommandRegistry` L27, `CapabilityRegistry` L35, `ActionSurfaceRegistry` L41) which *wrap* the bus
  (`constructor(bus=new SemanticCommandBus())`). Surface code asserts the bus identity
  (`foundation/structured/surface-host.ts` L8 imports `SemanticCommandBus` from `../global/commands.js`).
- **Recommended resolution:** split the record — `SemanticCommandBus` →
  `dist/foundation/global/commands.js`; `SemanticCommandRegistry (CommandRegistry)` /
  `CapabilityRegistry` / `ActionSurfaceRegistry` → `dist/foundation/models.js`. One semantic owner
  per layer: bus = `foundation/global/commands.ts`, registry = `foundation/models.ts`.
- **Residual risk:** `assertCanonicalSemanticCommandBus` rejects non-bus candidates, so behavior is
  safe today; the registry path is the only defect.

## C-05 — Accessibility: registry claims no implementation while partial owners execute

- **Declared:** `contracts/CORE_OWNER_REGISTRY.json` SC-021 `AccessibilityInteractionCore`
  `implementation: null`, `implementation_status: "CONCEPT_CONTRACT_ONLY"`, responsibility
  "focus visibility, region navigation, announcements, equivalent action routes".
- **Observed:** three executable owners cover those responsibilities today:
  `foundation/global/feedback.ts` (`AccessibilityFeedbackOwner`, announcements/aria-live projection,
  comment L23 "Reusable presentation-only owner for short-lived accessible feedback");
  `foundation/global/region-cycle.ts` (F6 region navigation — listed in
  `MECHANIC_OWNERSHIP_REGISTRY.json` `global.input-keymap` implementation);
  `foundation/global/transient-focus.ts` (focus visibility/return). Registries themselves already
  classify `global.accessibility-feedback` as FOUNDATION_OWNER and `StatusFeedback` (SC-022) as
  `CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER` (`COMPONENT_REGISTRY.json`).
- **Recommended resolution:** change SC-021 to `PARTIAL_EXECUTABLE_OWNER` with implementation
  `dist/foundation/global/feedback.js + region-cycle.js + transient-focus.js`, keeping
  "equivalent action routes" as the genuinely unimplemented remainder. Single owner split:
  announcements = AccessibilityFeedbackOwner; region navigation = GlobalInputKeymapOwner; focus
  lifecycle = TransientFocusOwner.
- **Residual risk:** a writer may duplicate aria-live/feedback owners (the exact anti-pattern
  `COMPONENT_REGISTRY.json` `StatusFeedback` forbids).

## C-06 — HEALTH/PROCESSING: registry-planned writer paths vs current runtime-adapter implementation (PRIMARY B-2 CONFLICT)

- **Declared:** `contracts/SURFACE_READINESS_REGISTRY.json` rows `surface: "health"` / `"processing"`:
  `domainAdapter: {name:"HealthDomainAdapter"|"ProcessingDomainAdapter",
  path:"stack/native-typescript/adapters/surfaces/health-domain.ts"|".../processing-domain.ts",
  status:"TO_BE_IMPLEMENTED_BY_SURFACE_WRITER"}`; `writableScope.allowed` includes
  `stack/native-typescript/surfaces/{health,processing}/**`,
  `stack/native-typescript/adapters/surfaces/{health,processing}-domain.ts`,
  `stack/native-typescript/tests/surfaces/{health,processing}/**`. Negative assertion in the same
  rows: "no stale registry path".
- **Observed:** none of those paths exist (`ls stack/native-typescript/adapters/surfaces` → no such
  directory; no `surfaces/health|processing`). The live implementation is
  `stack/native-typescript/adapters/health-runtime.ts` (`HealthRuntimeAdapter`, owner
  `W05HealthDomainAdapter`, `descriptor().semanticOwner='W05HealthDomain'`) and
  `stack/native-typescript/adapters/processing-runtime.ts` (`ProcessingRuntimeAdapter`,
  `W05ProcessingDomain`), mounted by `surfaces/composition/w05-rescue.ts` (L2-3, L19-20, L27) and
  `surfaces/m0-controller-composition.ts` L241; compiled to `dist/adapters/health-runtime.js`,
  `dist/adapters/processing-runtime.js` (+ `dist-ts/`); tested by
  `tests/rescue/S16_W05_HEALTH_PROCESSING/s16-health-processing-tests.ts` L1-2. Owner chain agrees:
  `authority/23_SURFACE_CURRENT_REQUIREMENT_INDEX.json` rows 46-48/100-103 declare
  `owner: "W05HealthDomain" / "W05ProcessingDomain"` with `disposition:
  "PRESERVE_SEMANTICS_REBIND_LOCAL_ADAPTER"` — exactly the adapter `descriptor().semanticOwner`.
- **Recommended resolution:** record the **current** implementation location as
  `adapters/health-runtime.ts` / `adapters/processing-runtime.ts` (hosts + surface rendering via
  `mount()`), and treat the SURFACE_READINESS paths as **planned future-writer scope only**. Before
  any W05 writer dispatch, one of the two must be reconciled (smallest step: edit the two
  `domainAdapter.path`/`writableScope` fields, or add an explicit `supersededBy` note pointing at the
  runtime adapters). Until then, a writer following the writable scope would create a second,
  duplicate health/processing owner next to `HealthRuntimeAdapter`.
- **Residual risk:** HIGH if writer dispatch happens before reconciliation (duplicate mechanic +
  registry "no stale registry path" assertion would self-falsify).

## C-07 — HEALTH/PROCESSING: profile `domain_implementation: "CONTRACT_ONLY"` vs executable adapters

- **Declared:** `profiles/health.json` / `profiles/processing.json`
  `"domain_implementation": "CONTRACT_ONLY"`, `source_status:
  "CONCEPTUAL_SEMANTICS_RECONCILED_NOT_ACCEPTED_VISUAL_DESIGN"`.
- **Observed:** executable adapters exist and mount (C-06 evidence); however they are bounded local
  runtime adapters over `adapters/runtime/local-runtime-transport.js` with hard truth ceilings
  (`surfaces/composition/w05-rescue.ts` L35-52: `processingCompletedNeedsProviderEvidence:true`,
  `cancelRequestIsCancelSuccess:false`, `queueDepthIsWorkerLiveness:false`, …), i.e. no admitted
  provider backend exists. `authority/23_SURFACE_CURRENT_REQUIREMENT_INDEX.json` rows use
  `implementation: "SEE_RUNTIME_COMMAND_REGISTRY; otherwise CONTRACT_ONLY"`.
- **Recommended resolution:** treat as a **semantic-field ambiguity, not an ownership conflict**:
  "CONTRACT_ONLY" = domain semantics have no admitted provider; the bounded runtime adapter is the
  current executable surface host. Recommend a profile field clarification (e.g.
  `domain_implementation: "CONTRACT_SEMANTICS__BOUNDED_LOCAL_RUNTIME_ADAPTER"`).
- **Residual risk:** low; misreading either way leads to either fabricating provider truth or
  discarding real executable surfaces.

## C-08 — TimelineReplayOwner: no registry record anywhere

- **Declared:** nothing. Grep over `contracts/MECHANIC_OWNERSHIP_REGISTRY.json` (30 records),
  `contracts/COMPONENT_REGISTRY.json` (38), `contracts/FOUNDATION_RUNTIME_REGISTRY.json`
  (37 components), `contracts/STATE_OWNERSHIP_REGISTRY.csv` (35 rows) for `timeline|replay` owner
  records → zero. (Only `analytical.compare` covers the compare half.)
- **Observed:** `foundation/timeline/replay.ts` (`id:'TimelineReplayOwner'` L8, `class
  TimelineReplayOwner` L120, `defineTimelineReplayProvider`), `foundation/timeline/replay-host.ts`
  (`TIMELINE_REPLAY_HOST_CONTRACT` L7, `class TimelineReplayHost` L26),
  `adapters/results/timeline-replay-provider.ts` L1. Single-instance enforcement in
  `surfaces/composition/w03-rescue.ts` (L21 `timelineReplayOwnerCount:1`; L34 `W03_TIMELINE_REPLAY_OWNER_REQUIRED`;
  L91 `W03_RESULTS_TIMELINE_REPLAY_OWNER_SPLIT`; L103 `W03_TIMELINE_REPLAY_OWNER_COUNT_INVALID`) and
  `adapters/results/domain.ts` L39 (`RESULTS_TIMELINE_REPLAY_OWNER_REQUIRED`). Assurance:
  `assurance/DUPLICATE_MECHANIC_SCAN.json` `d03cBindingGuards` requires `TimelineReplayHost` in
  `adapters/results/domain.js`.
- **Recommended resolution:** add `timeline.replay` to `MECHANIC_OWNERSHIP_REGISTRY.json`
  (`FOUNDATION_OWNER`/family-owner as per sibling `analytical.compare`),
  `familyOwner: TimelineReplayOwner`, `implementation: dist/foundation/timeline/replay.js +
  dist/foundation/timeline/replay-host.js`, plus a `STATE_OWNERSHIP_REGISTRY.csv` row ("timeline
  replay session state → TimelineReplayOwner, session only, no runtime re-execution").
- **Residual risk:** medium — the most-guarded shared instance in W03 is invisible to ownership
  tooling.

## C-09 — SpatialPresentationOwner: missing from registries

- **Declared:** no `spatial.presentation` record. `MECHANIC_OWNERSHIP_REGISTRY.json` has
  `spatial.input` (SpatialInteractionKernel + SpatialSelectionNavigationKernel, impl
  `dist/foundation/spatial.js`) and `spatial.selection-actions`; `COMPONENT_REGISTRY.json`
  `SpatialInteraction` (SC-031) → `dist/foundation/spatial/interaction-kernel.js + dist/foundation/spatial.js`.
- **Observed:** `foundation/spatial/presentation.ts` L1 `SPATIAL_PRESENTATION_OWNER_ID='SpatialPresentationOwner'`,
  contract L3, host stamping L33 (`host.dataset.spatialPresentationOwner=...`), style keying L13-29;
  re-exported `foundation/spatial.ts` L9; declared in `surfaces/enterprise/index.ts` L38
  `ownerBindings`.
- **Recommended resolution:** add `spatial.presentation` record
  (`familyOwner: SpatialPresentationOwner`, `implementation:
  dist/foundation/spatial/presentation.js`), distinct from `spatial.input` (interaction kernel).
- **Residual risk:** medium — presentation and input kernels can be conflated and duplicated.

## C-10 — StructuredPresentationBridge: historical LEARN lock vs shared Structured-family module

- **Declared/historical:** directive historical lock assigns StructuredPresentationBridge to LEARN
  (W02). Registry treatment: `MECHANIC_OWNERSHIP_REGISTRY.json` `structured.surface-host`
  (`FAMILY_HOST: StructuredSurfaceHost`) merely lists `dist/foundation/structured/presentation-bridge.js`
  among implementations — the bridge is not a registered owner.
- **Observed:** `foundation/structured/presentation-bridge.ts` L6 `id:'StructuredPresentationBridge'`,
  L19 `owner:'StructuredPresentationBridge'`. Consumers: `foundation/structured/surface-host.ts` L14
  (→ every Structured surface: library/learn/labs/scenarios per `main.ts` L48-52) and
  `foundation/accepted-runtime.ts` L211 (Library donor host lazily loads
  `createAcceptedRuntimeStructuredPresentationOwner`). Nothing is Learn-specific in the module.
- **Recommended resolution:** owner = **StructuredPresentationBridge**, scope = Structured family
  (all Structured surfaces + Library donor host), subordinated to `StructuredSurfaceHost` for
  orchestration. Record `structured.presentation-bridge` in `MECHANIC_OWNERSHIP_REGISTRY.json`.
  The LEARN historical lock is superseded (consistent with OWNER-20260910-006
  `EDITOR_ENGINE_REUSE`).
- **Residual risk:** low-medium — a Learn-local copy could appear if the historical lock is followed
  literally.

## C-11 — BottomDeepWorkOwner: historical RQ lock vs FOUNDATION_OWNER (registry+code agree)

- **Declared/historical:** directive historical lock assigns BottomDeepWorkOwner to RQ (W02).
  Current registries: `MECHANIC_OWNERSHIP_REGISTRY.json` `workspace.bottom-deep-work`
  `FOUNDATION_OWNER: BottomDeepWorkOwner` (impl `dist/foundation/global/bottom-shelf.js`);
  `COMPONENT_REGISTRY.json` `BottomShelf` (SC-005) "BottomDeepWorkOwner owns open/close/inert/focus/provider
  lifecycle; provider content remains family/domain-owned"; `assurance/DUPLICATE_MECHANIC_SCAN.json`
  approves only `foundation/global/bottom-shelf.js`.
- **Observed:** `foundation/global/bottom-shelf.ts` L3/L61; single instance
  `foundation/wave3-assembly.ts` L102-108; consumers include `adapters/library-chrome.ts` L21,
  `surfaces/evidence/index.ts` L7 / `surfaces/reviews/index.ts` L7 (`requiredSharedOwners`),
  `foundation/accepted-runtime.ts` L537 (`BOTTOM_DEEP_WORK_OWNER_RENDER_REQUIRED`).
- **Recommended resolution:** owner = **BottomDeepWorkOwner (foundation/global/bottom-shelf.ts)**.
  RQ is a consumer only (its RQ workbench uses the generic BOTTOM region projection,
  `m0-controller-composition.ts` `renderTypedCollectionStage` L106). Historical lock superseded.
- **Residual risk:** none material; registries and code already agree.

## C-12 — SpatialPresentationOwner: historical SCENARIOS lock vs spatial-family owner

- **Declared/historical:** directive historical lock assigns SpatialPresentationOwner to SCENARIOS
  (W03).
- **Observed:** module is `foundation/spatial/presentation.ts` (C-09 evidence); consumers span
  visualize (W02), enterprise/scenarios/labs/runs/results (W03) — see
  `m0-controller-composition.ts` L73/L120/L132/L192/L212-234 and `surfaces/enterprise/index.ts` L38.
  Scenarios itself receives spatial presentation only through the shared `SpatialView` embedded by
  the controller composition (`mountStructuredStudio` L120 "Shared spatial authoring projection").
- **Recommended resolution:** owner = **SpatialPresentationOwner (foundation/spatial/presentation.ts)**
  under the Spatial family (OWNER-20260910-007 `SPATIAL_ENGINE_REUSE`); SCENARIOS is one consumer.
- **Residual risk:** low-medium (same duplication risk as C-10 if the lock is read literally).

## C-13 — TimelineReplayOwner: historical RESULTS lock — partially holds, needs precise statement

- **Declared/historical:** directive historical lock assigns TimelineReplayOwner to RESULTS (W03).
- **Observed:** RESULTS is the primary consumer (`adapters/results/domain.ts`, `surfaces/results/*`)
  but the owner is a foundation module with exactly ONE instance created in `main.ts` L43 and shared
  across the W03 group (`surfaces/composition/w03-rescue.ts` L119-121 reports
  `timelineReplayOwnerInstancesInGroup:1`); RUNS binds the same instance for recorded history
  (`adapters/runs/domain.ts` L21).
- **Recommended resolution:** owner = **TimelineReplayOwner (foundation/timeline/replay.ts)**;
  family home W03 with RESULTS as primary consumer and RUNS as secondary; single instance is
  controller-constructed (`main.ts` L43). Not a workspace-owned mechanic.
- **Residual risk:** low; guard code already enforces the single instance.

## C-14 — w04-rescue seam: historical "REVIEWS" lock understates its scope

- **Declared/historical:** directive historical lock labels `w04-rescue` the REVIEWS seam. No
  registry record exists (`grep w04-rescue contracts/` → 0).
- **Observed:** `surfaces/composition/w04-rescue.ts` composes **all four** W04 surfaces — imports
  L3-10 (`W04EvidenceDomain`, `W04ReviewDomain`, `W04MasteryDomain`, `W04PortfolioDomain`,
  `composeEvidenceSurface`, `composeReviewsSurface`, `createMasterySurfaceComposition`,
  `createPortfolioSurfaceComposition`), authority `W04_RESCUE_AUTHORITY='ORACLE-011/A03'` (L12),
  causal chain L19; consumed by `m0-controller-composition.ts` L240 for
  `['evidence','mastery','portfolio','reviews']`.
- **Recommended resolution:** name it the **W04 group composition seam** (controller-owned thin
  composition); the reviews-specific semantics remain owned by `adapters/reviews/domain.ts`
  (`W04ReviewDomain`, `ReviewAuthorityRegistry`) and `surfaces/reviews/index.ts`. Add a
  `MECHANIC_OWNERSHIP_REGISTRY.json` note or a composition-seam registry entry to make the seam
  visible.
- **Residual risk:** low; the mislabel could steer a writer to modify the seam for reviews-only work
  and break evidence/mastery/portfolio wiring.

## C-15 — w05-rescue seam: historical "CONFIGURATION" lock understates its scope

- **Declared/historical:** directive historical lock labels `composition/w05-rescue.ts` the
  CONFIGURATION seam. No registry record exists.
- **Observed:** `surfaces/composition/w05-rescue.ts` L11
  `W05_RESCUE_SURFACES=Object.freeze(['health','processing','validation','manual_ai','backup','audit','releases','configuration'])`
  — all 8 W05 surfaces; `owner:'CG6W05RescueComposition'` (L29); provider bindings L34; truth
  ceilings L35-52. The configuration-specific composition is
  `surfaces/configuration/composition.ts` (`createConfigurationSurfaceComposition`, imported L9,
  instantiated L26).
- **Recommended resolution:** name it the **W05 group composition seam** (controller-owned);
  configuration semantics stay with `surfaces/configuration/composition.ts` +
  `adapters/configuration/*`. Same registry-visibility note as C-14.
- **Residual risk:** low-medium — the seam is also the health/processing mount point (B-2), so
  mislabeling it risks breaking the two resolved surfaces.

## C-16 — accessibility / keyboard / mouse / RTL-BIDI / responsive: directive "W02 owns" vs FOUNDATION/global ownership

- **Declared/historical:** directive workspace-family table assigns shared
  customization/action/accessibility/keyboard/mouse/RTL/BIDI/responsive mechanics to W02.
- **Observed (current registries):** `MECHANIC_OWNERSHIP_REGISTRY.json` —
  `global.input-keymap` → `FOUNDATION_OWNER: GlobalInputKeymapOwner`;
  `global.accessibility-feedback` → `FOUNDATION_OWNER: AccessibilityFeedbackOwner`;
  `global.input-direction` → `FOUNDATION_OWNER: InputDirectionResolver`;
  `global.settings-center` → `FOUNDATION_OWNER: SettingsCenterOwner`;
  `structured.input-keymap`/`structured.rich-content` → `FAMILY_OWNER` (Structured family).
  `COMPONENT_REGISTRY.json` — `GlobalInputKeymap`, `StatusFeedback`, `InputDirectionResolver` all
  `CONTROLLER_ACCEPTED_EXECUTABLE_GLOBAL_OWNER[_M6]`; `SidePaneShell` (SC-003 responsive)
  `EXECUTABLE_PREFERRED_EFFECTIVE_PANE_OWNER`. `contracts/STATE_OWNERSHIP_REGISTRY.csv` —
  "global input routing and region-cycle receipts → GlobalInputKeymapOwner", "accessibility feedback
  presentation → AccessibilityFeedbackOwner", "transient input direction hint → InputDirectionResolver",
  "application chrome UI scale projection → UIScalePolicyOwner … no responsive breakpoints".
  **Observed (code):** all modules under `foundation/global/*` and `foundation/structured/*`
  (input-keymap.ts L4, feedback.ts L23, input-direction.ts L19, responsive-layout.ts L7
  `WorkspaceResponsiveLayoutPolicy`, pane-layout.ts L6 `WorkspacePaneLayoutOwner`,
  structured/input-keymap.ts, structured/rich-content.ts + direction-adapter.ts). No W02-scoped
  owner symbols exist anywhere in `stack/native-typescript`.
- **Recommended resolution:** W02 is **donor + consumer** (OWNER-20260910-005/006
  `FOUNDATION_REUSE_FIRST` / `EDITOR_ENGINE_REUSE`); ownership is foundation-global per mechanic:
  accessibility = AccessibilityFeedbackOwner (+ region-cycle under GlobalInputKeymapOwner,
  focus under TransientFocusOwner); keyboard = GlobalInputKeymapOwner / StructuredInputKeymapOwner;
  mouse/pointer = WindowMotion + SpatialInteractionKernel + RelationInteractionOwner +
  StructuredDragDropOwner (no single mouse owner exists — see open ambiguity §A-4); RTL/BIDI =
  InputDirectionResolver + StructuredRichContentOwner; responsive = WorkspacePaneLayoutOwner +
  WorkspaceResponsiveLayoutPolicy. Update the directive/workspace packets to reflect foundation
  ownership with W02 as primary donor.
- **Residual risk:** HIGH if writers implement W02-local duplicates of global interaction owners
  (the exact `NO_SURFACE_LOCAL_DUPLICATE_OWNER` anti-pattern in `CORE_OWNER_REGISTRY.json`).

## C-17 — customization: directive "W02 shared customization" vs generalized CEP principle

- **Declared/historical:** directive assigns "shared customization" to W02.
- **Observed:** `authority/OWNER_CURRENT_RULES.json` OWNER-20260910-001
  (`CUSTOMIZATION_GENERALIZATION`, scope `PORTFOLIO`): "Customization is a general CEP principle.
  Safe presentation/workspace settings should be customizable where meaningful; not a language-only
  exception", superseding "Fixed surface-local/default-only customization laws"; plus
  OWNER-20260910-013 (`TOOLBAR_TEMPLATE_UNIFICATION`, "customizable composition") and
  `contracts/UNIVERSAL_LAYOUT_SLOT_CONTRACT.json` `same_mechanic_law` "same customization". No
  `CustomizationOwner` symbol exists in code; the mechanics are
  `ScopedPreferencesOwner` (`preferences/store.ts`), `SettingsCenterOwner`
  (`settings/center.ts`), `ReusableToolbarTemplateOwner` (`toolbar-template.ts` L117-124
  `composeToolbarSlots`), `UIScalePolicyOwner` (`preferences/ui-scale.ts`).
- **Recommended resolution:** customization is a **global principle with global owners**, not a W02
  asset: single value/persistence owner = ScopedPreferencesOwner; single action home =
  SettingsCenterOwner; single toolbar composition owner = ReusableToolbarTemplateOwner. W02 may be
  listed as the donor surface family only.
- **Residual risk:** medium — a W02-scoped customization implementation would fragment preference
  scope/persistence (STATE_OWNERSHIP_REGISTRY forbids "domain runtime configuration" writes and
  "preferred value overwrite" of effective geometry).

## C-18 — BOTTOM tab vocabulary: profiles/contract vs code

- **Declared:** all 23 `profiles/*.json` declare `bottom_tabs: ["history","domain-diagnostics"]` and
  BOTTOM slot "Deep <Surface> diagnostics/history"; `contracts/UNIVERSAL_LAYOUT_SLOT_CONTRACT.json`
  BOTTOM binding "history/diagnostics; no canonical mutation".
- **Observed:** `foundation/global/bottom-shelf.ts` L22
  `BOTTOM_DEEP_WORK_TABS=Object.freeze(['history','compare','recovery'])` (L23 actions
  `bottom.tab.select` over these); `foundation/accepted-runtime.ts` L537 renders the same three tabs
  (history/compare/recovery). No code produces a `domain-diagnostics` tab.
- **Recommended resolution:** reconcile the vocabulary in one direction: either (a) update
  profiles/contract BOTTOM binding to `history/compare/recovery` (+ note domain diagnostics live in
  each surface's own BOTTOM projection — e.g. `health.diagnose` panel
  `adapters/health-runtime.ts` L118/L126), or (b) add a `domain-diagnostics` provider/tab to
  `BottomDeepWorkOwner`. Recommendation: (a), because every executable bottom provider
  (`adapters/structured-bottom-provider.ts`, `adapters/operational-bottom-provider.ts`) is built
  around history/compare/recovery and the profiles' "domain-diagnostics" content is already
  delivered as per-surface BOTTOM region projections (`m0-controller-composition.ts` L106,
  `health-runtime.ts` L126).
- **Residual risk:** low-medium (contract tests or future writers could assert the profile vocabulary
  and fabricate a second diagnostics surface).

---

## Open ambiguities remaining (not counted as resolved conflicts)

| ID | Ambiguity | Smallest evidence needed to resolve |
|---|---|---|
| A-1 | Are the `SURFACE_READINESS_REGISTRY.json` health/processing paths (`adapters/surfaces/*-domain.ts`, `surfaces/{health,processing}/**`) the *intended future writer scope* (making the runtime adapters interim) or *stale* (making them the permanent location)? (drives C-06/C-07) | One Owner decision or one registry field revision per surface (`domainAdapter.status` + `writableScope`) stating the authoritative path for W05 writers |
| A-2 | Does the directive's "diagnostics / deep-work state" (W01 extras) mean the profiles' BOTTOM `domain-diagnostics` tab (unimplemented), or the app-level diagnostics gate (`main.ts` L286-288) plus BottomDeepWorkOwner state? | The directive's exact W01 requirement/atom IDs (or a Big Boss source row) naming the mechanic; code implements only the latter reading |
| A-3 | Should "Blueprint → Production conversion" become a shared foundation owner (SC-039 `ProductionMappingBoundary`) or remain Library-donor evidence? No W01/global implementation exists today | An Owner decision mapping SC-039 to a physical file/owner (currently `implementation: null`) or explicitly classifying it EVIDENCE_ONLY |
| A-4 | Is "mouse" a distinct shared mechanic with its own owner, or subsumed under SC-020 `InputKeymapCore` ("keyboard/pointer/touch/trackpad mappings") + spatial/structured pointer owners? | The directive's mechanic ID for "mouse"; no code/registry record names a mouse owner |
| A-5 | Canonical owner *name* for SC-001: `GlobalShellCore` (registry) vs `GlobalShellNavigationOwner` (code) — which string should registry rows and writer packets use going forward? | A single registry update row (C-01 resolution) or an Owner naming decision |
