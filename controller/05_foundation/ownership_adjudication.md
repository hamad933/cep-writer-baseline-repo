# 05_foundation / ownership_adjudication (Controller adjudication, 2026-09-29T02:40Z)

Inputs: `shared_ownership_map.md` + `mechanic_owner_conflicts.md` + `surface_location_resolution.md`
(stream C, evidence-bound to code + registries). The Controller adjudicates; Owner ratification is
requested only where marked `CONDITIONAL`.

## 1. Surface-location resolutions (B-2) — ADOPTED

| Concept | Current implementation | Confidence | Classification |
|---|---|---|---|
| HEALTH surface | `stack/native-typescript/adapters/health-runtime.ts` (`HealthRuntimeAdapter`, `W05HealthDomain`, commands `health.refresh/inspect/diagnose`), composed `surfaces/composition/w05-rescue.ts` → `surfaces/m0-controller-composition.ts` L241 → `main.ts` L274; tests `tests/rescue/S16_W05_HEALTH_PROCESSING/`; build `dist/adapters/health-runtime.js` | HIGH | CURRENT_VALIDATED |
| PROCESSING surface | `adapters/processing-runtime.ts` (`ProcessingRuntimeAdapter`, `W05ProcessingDomain`, commands `processing.inspect/retry/requestCancel/validationHandoff`) | HIGH | CURRENT_VALIDATED |
| Blueprint→Production conversion | Library-donor-local only: `foundation/accepted-runtime.ts` (`CONVERSION_COMPATIBILITY`, `commitConversion`, `openMapping()` reading `#production-mapping-manifest`); SC-039 `ProductionMappingBoundary` = `implementation: null / CONCEPT_CONTRACT_ONLY` | HIGH (absence proven) | CANDIDATE / NOT_IMPLEMENTED |
| Diagnostics state | App-level gate exists (`main.ts` L286-288 `?diagnostics=foundation`, `m0-controller-composition.ts` L41 `diagnosticsEnabled()`, `foundation/workspace.ts` L12); profile-named bottom tab `domain-diagnostics` **not implemented** | HIGH | PARTIAL / UNKNOWN (tab) |
| Deep-work state | `foundation/global/bottom-shelf.ts` (`BottomDeepWorkOwner` open/closed hidden+inert lifecycle), `state.surface.bottomOpen` (`workspace-host-kernel.ts` L31), providers `structured-bottom-provider.ts` / `operational-bottom-provider.ts`, single instance `wave3-assembly.ts` L102 | HIGH | CURRENT_VALIDATED |
| Replay | `foundation/timeline/replay.ts` (`TimelineReplayOwner`) + `timeline/replay-host.ts` + `adapters/results/timeline-replay-provider.ts`; 1 instance `main.ts` L43; guards `w03-rescue.ts` | HIGH | CURRENT_VALIDATED |
| AAR | embedded: `adapters/results/domain.ts` (`aarProjection`, `RESULT_AAR_*` invariants) + `surfaces/results/presentation.ts` aar mode + `results.annotate` | HIGH | CURRENT_VALIDATED |
| Compare | `foundation/analytical/compare.ts` + `compare-host.ts` + `adapters/analytical/{rq,results}-compare-provider.ts`; registry `analytical.compare`; E18 acceptance | HIGH | CURRENT_VALIDATED |
| AI Bridge | = MANUAL_AI surface: `adapters/manual_ai/domain-adapter.ts` (`ManualAiDomainAdapter`, `ManualIoBridge`) + `surfaces/manual_ai/composition.ts` ("Manual AI Bridge"); ceiling `hiddenProviderCalls:0, automaticCanonicalPublication:false` | HIGH | CURRENT_VALIDATED |

## 2. Ambiguity dispositions (A-1…A-5)

| ID | Question | Controller adjudication | Class |
|---|---|---|---|
| A-1 | SURFACE_READINESS planned `adapters/surfaces/{health,processing}-domain.ts` + `surfaces/{health,processing}/**` writable scope vs live adapters | **Live adapters win** (B: current executable state). Registry rows are stale planning entries. Writer W05 packets bind to `adapters/health-runtime.ts` / `adapters/processing-runtime.ts`; creating duplicate domain modules or `surfaces/{health,processing}/**` trees is **forbidden** unless the Owner re-opens the registry rows (2-row revision). Duplicate-owner risk neutralized by packet rule. | CURRENT_VALIDATED (with CONDITIONAL registry-revision request) |
| A-2 | "diagnostics / deep-work state" meaning | Both known implementations are in W01 scope: app-level diagnostics gate + `BottomDeepWorkOwner` deep-work state. The `domain-diagnostics` bottom tab is recorded as an **unimplemented requirement candidate** (from profile vocabulary), not a mandate to invent. Smallest evidence to close: the directive's exact W01 atom IDs. | CONDITIONAL |
| A-3 | SC-039 `ProductionMappingBoundary` (`implementation: null`) | **No new owner created before the gate** (do-not-invent rule). Blueprint→Production stays donor-local (`accepted-runtime.ts`) + SC-039 concept contract; W01 packet scopes it as `DECISION_REQUIRED` with the physical-file mapping as the smallest closure step. | CANDIDATE |
| A-4 | "mouse" mechanic | Split resolved without dual ownership: **implementation owners** stay foundation kernels (`WindowMotion`, `SpatialInteractionKernel`, `RelationInteractionOwner`, `StructuredDragDropOwner`); the directive's "W02 owns … mouse …" is **policy/compliance ownership** for those mechanics across surfaces. Packets use `IMPLEMENTATION_OWNER` vs `POLICY_OWNER` fields everywhere. | CURRENT_VALIDATED |
| A-5 | `GlobalShellCore` vs `GlobalShellNavigationOwner` naming | Code names are canonical (current executable truth); registry names map through the crosswalk table in `shared_ownership_map.md`. One registry naming row to update later; no behavior impact. | CURRENT_VALIDATED (naming CONDITIONAL) |

## 3. Conflict dispositions (stream C's OC-C-01…OC-C-18; details in `mechanic_owner_conflicts.md`)

| Conflict class | Disposition |
|---|---|
| OC-C-06 readiness-registry planned paths vs live adapters (health/processing) | **Stale planning vs live code** — see A-1. Highest dispatch risk; neutralized by packet duplication ban + registry-revision request. |
| OC-C-01/02/05 registries say "symbol unresolved / CONCEPT_CONTRACT_ONLY" while code implements shell nav, SC-011, accessibility | Code wins (B>A); registry rows flagged for update. Owners assigned per code. |
| OC-C-03/04 wrong implementation paths for preferences/command bus | Path corrections adopted (`models.js` = facade; owners `ScopedPreferencesOwner`, `SemanticCommandBus` + `CommandRegistry`). |
| OC-C-08/09 `TimelineReplayOwner`, `SpatialPresentationOwner` absent from every registry | Existence proven in code; owners assigned; registry gap recorded. |
| OC-C-10…15 historical locks superseded/understated | Historical locks preserved as provenance; current owners per code (e.g. Structured family ≠ LEARN; BottomDeepWorkOwner = foundation ≠ RQ; spatial family ≠ SCENARIOS). |
| OC-C-16/17 directive "W02 owns" interaction/customization vs foundation-global implementation | Resolved by A-4 two-field model (IMPLEMENTATION_OWNER vs POLICY_OWNER). |
| OC-C-18 bottom tab vocabulary `domain-diagnostics` vs code `history/compare/recovery` | Vocabulary gap recorded (ties A-2); no code change pre-gate. |

## 4. Residual ambiguity status

**No critical ownership remains ambiguous.** Every one of the 18 shared mechanics has exactly one
IMPLEMENTATION_OWNER and explicit consumers. The five A-items are closed above as adjudications of
which three are `CONDITIONAL` pending Owner ratification (A-2 wording, A-3 SC-039 mapping, A-5
naming) — none blocks Writer dispatch because packets carry the binding rules.
