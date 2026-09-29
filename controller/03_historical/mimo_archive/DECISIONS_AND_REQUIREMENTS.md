# DECISIONS_AND_REQUIREMENTS — recovered Owner decisions and requirements

**Class:** `FORENSIC_RECOVERY__HISTORICAL_OWNER_DECISIONS_AND_REQUIREMENTS__PROVENANCE_BOUND`
**Produced:** 2026-09-29 · MIMO forensic worker · companion to `KNOWLEDGE_EXTRACT.md`.
**Primary sources (archive-internal paths):**
- `.openclaw/tmp/cep_mirror/OWNER_DECISION_LIVE_REGISTER.csv` (111 rows; re-parsed 2026-09-29) — **the decision authority of record**
- `.openclaw/tmp/cep_mirror/READ_FIRST.md` (consolidated hard stops)
- `.openclaw/tmp/cep_mirror/CONTROLLER_GOVERNANCE.md` (law bodies §0–§22)
- `.openclaw/tmp/cep_mirror/corpus/*` (requirement corpus)
- `.openclaw/tmp/req/{shell,today}/*` (hardened mission packets)
- `cep_repo/cep-writer/*`, `cep_repo/writer/*` (Writer-facing requirement projections)

**Classification key:** CURRENT_OWNER_DIRECTIVE = still directive-class law · HISTORICAL_VALID = durable law recovered from the legacy era · HISTORICALLY_USEFUL_BUT_SUPERSEDED = kept for rationale/lineage · REJECTED = explicitly rejected by Owner · CONFLICTED = needs adjudication.

---

## Part 1 — Owner decision register (all 111 rows, condensed)

Verbatim `decision` text is preserved for the highest-value rows; condensed paraphrase for the rest. Full text is recoverable from the CSV path above.

### 1.1 Foundation/reuse design law — `OWNER-20260910-001..020` (all ACTIVE)

| ID | Family | Decision (condensed) | Classification |
|---|---|---|---|
| OWNER-20260910-001 | CUSTOMIZATION_GENERALIZATION | Customization is a general CEP principle; safe presentation/workspace settings customizable where meaningful | HISTORICAL_VALID |
| OWNER-20260910-002 | SAFE_DEFAULT_NOT_PRODUCT_LAW | Defaults are starting values, not immutable laws unless safety/domain requires | HISTORICAL_VALID |
| OWNER-20260910-003 | ACCEPTED_BLUEPRINT_SCOPE | Library Editor v1.2.17 is the accepted executable design donor; mine compatible mechanics directly | HISTORICAL_VALID |
| OWNER-20260910-004 | CANDIDATE_NOT_AUTHORITY | Visualize/W03/other non-Library blueprints are requirement/value/evidence inputs only until explicit design acceptance | HISTORICAL_VALID |
| OWNER-20260910-005 | FOUNDATION_REUSE_FIRST | Maximize executable reuse across all 23 surfaces via global foundation, family engines, thin domain adapters | HISTORICAL_VALID |
| OWNER-20260910-006 | EDITOR_ENGINE_REUSE | Accepted Library editor mechanics become reusable structured/editor primitives for Learn and all compatible authoring surfaces (Sticky full consumer per OD-051) | HISTORICAL_VALID |
| OWNER-20260910-007 | SPATIAL_ENGINE_REUSE | One reusable spatial engine with domain adapters for Visualize/W03/eligible consumers | HISTORICAL_VALID |
| OWNER-20260910-008 | AUTHORITY_INTAKE_HARDENING | Read canonical authority/supersession before raw candidates; historical framework paths are not new-foundation authority | HISTORICAL_VALID |
| OWNER-20260910-009 | MICRO_SUPERSESSION_ALLOWED | Preserve accepted Library donor value; apply newer Owner corrections only to affected mechanics | HISTORICAL_VALID |
| OWNER-20260910-010 | SHELL_DESIGN_REOPENED | Current Shell/navigation visual composition is NOT accepted as strong/final; mine interaction/context mechanics but redesign after shared foundation is stable | HISTORICAL_VALID |
| OWNER-20260910-011 | GLOBAL_LAYOUT_SLOT_CONSTITUTION | Executable universal layout/slot templates; shared pane/toolbar/context/action surfaces keep one layout grammar; surfaces change domain content/actions only | HISTORICAL_VALID |
| OWNER-20260910-012 | PANE_SYSTEM_UNIFICATION | LEFT/RIGHT/TOP/BOTTOM shared pane mechanics; internal close/collapse distinct from external edge reveal; shared resize/responsive/preferred-vs-effective (Runs Structure-pane divergence = active parity defect, not fork permission) | HISTORICAL_VALID |
| OWNER-20260910-013 | TOOLBAR_TEMPLATE_UNIFICATION | One toolbar template/grammar with stable universal action slots; domain actions bind into slots | HISTORICAL_VALID |
| OWNER-20260910-014 | ACTION_SURFACE_REUSE | Command Palette / Context Action Menu / Selection Action Surface use common templates; only command groups/capability bindings change | HISTORICAL_VALID |
| OWNER-20260910-015 | MULTI_ROUTE_REVERSIBILITY | Keyboard is one route, not the only route; reversible/transient UI needs multiple dismiss routes; persistent panes don't vanish on focus loss | HISTORICAL_VALID |
| OWNER-20260910-016 | MAX_LIBRARY_INHERITANCE | Learn = Library-grade workbench + learning additions; do NOT resurrect consumption-only/no-authoring CENTER | HISTORICAL_VALID |
| OWNER-20260910-017 | INTERNAL_SIMULATION_DEFAULT | W03 default = InternalSimulationAdapter; container/VM/remote/real-device optional; simulated commands operate simulation state (OD-049/050 add parallel real-terminal capability; do not change the default) | HISTORICAL_VALID |
| OWNER-20260910-018 | TECHNOLOGY_MUST_EARN_ADMISSION | Vue/TS/Vite/Vue-Flow/Electron/Tauri/Python-bridge/SQLite/xterm.js are candidates/specialized tools only; no final stack freeze before measured proof (xterm clause superseded by OD-049; general rule ACTIVE) | HISTORICAL_VALID |
| OWNER-20260910-019 | EXECUTABLE_NOT_PROSE_ONLY | Foundation outputs must be executable components/templates/cores + machine-readable contracts + tests | HISTORICAL_VALID |
| OWNER-20260910-020 | MINIMIZE_WRITER_DISCRETION | Contracts constrain future Writers; generic design/interaction choices are inherited, not reinvented; deviations need explicit justification | HISTORICAL_VALID |

### 1.2 Owner enhancement rows — `OE-001..005`

| ID | Status | Decision (condensed) | Classification |
|---|---|---|---|
| OE-001 ACTIVE_INPUT_DIRECTION | **ACTIVE_PLATFORM_GATED** | Empty block/note initial direction follows active OS keyboard hint via `InputDirectionResolver` with truthful fallback; explicit persisted direction wins; never infer domain language. Owner QA: implementation failed Windows proof → open | HISTORICAL_VALID (open) |
| OE-002 UI_SCALE | ACTIVE | Central UI Scale applies to chrome/panes/controls/spacing/typography; separate from document/canvas zoom, density, responsive breakpoints; verify 0.8/1/2 propagation; no surface-local scale variables | HISTORICAL_VALID |
| OE-003 GROUPED_SETTINGS | ACTIVE | Grouped Preferences/Settings/Commands/Shortcuts: one-open disclosure, search, keyboard navigation, applicability-filtered sections (Owner QA: active-group re-click regression + rejected hierarchy) | HISTORICAL_VALID |
| OE-004 STICKY_NOTES | **ACTIVE_PLATFORM_GATED** | StickyNotesWindowOwner: internal scroll, all-edge/corner resize, reachable toolbar, responsive bounds, z-order, pin intent, separate-window control; OS always-on-top only with real platform proof; close/hide != delete | HISTORICAL_VALID (open) |
| OE-005 SHORTCUT_VISIBILITY_VS_EXECUTION | ACTIVE | Shortcut panel visibility independent from execution eligibility; editor-owned input suppresses global execution; IME never intercepted | HISTORICAL_VALID |

### 1.3 Portfolio/governance/presentation law — `OD-20260914-001..037` (all ACTIVE)

| ID | Family | Decision (condensed) | Class |
|---|---|---|---|
| OD-20260914-001 | LIBRARY_AS_DONOR_CONSUMER_ORACLE | Library = normal consumer + donor/regression oracle; generic improvements central + propagate to every applicable surface | HISTORICAL_VALID |
| OD-20260914-002 | REUSE_INCLUDES_PRESENTATION | Reuse = Presentation + Behavior + Interaction + Functionality, not semantics alone | HISTORICAL_VALID |
| OD-20260914-003 | RESULT_FIRST_ACCEPTANCE | Acceptance on actual visible/interactable result incl. responsive, Bidi/a11y, truthful state/data | HISTORICAL_VALID |
| OD-20260914-004 | ALL_COMPONENTS_MATERIAL | Every material component counts (small controls, icons, tree items, menus, toolbars, chrome, states, transients, panes) | HISTORICAL_VALID |
| OD-20260914-005 | CONTROLLER_ACCOUNTABILITY | Controller accountable for mission design, scope isolation, falsification, convergence, acceptance; Writer PASS never transfers it | HISTORICAL_VALID |
| OD-20260914-006 | MANDATORY_REVIEW_CHAIN | Writer → Independent Audit → source/scope audit → Browser/Runtime comparison → Owner-decisions audit → reuse/duplicate-owner audit → data/provider truth → integrated regression → Acceptance/Correction | HISTORICAL_VALID |
| OD-20260914-007 | OWNER_DECISION_ZERO_LOSS | Every Owner decision/enhancement gets explicit zero-loss disposition; long chats never erase a decision | HISTORICAL_VALID |
| OD-20260914-008 | STATIC_INSTRUCTIONS_LIVE_POINTERS | Static instructions use stable live pointers/read sets; never hardcode epochs/hashes/missions/readiness counts | HISTORICAL_VALID |
| OD-20260914-009 | PER_RESPONSE_LIVE_REFRESH | Every substantive Controller response refreshes live governance/state + applicable Owner decisions | HISTORICAL_VALID |
| OD-20260914-010 | CONTENT_AWARE_GOVERNANCE_CENSUS | Inspect content recursively before classifying/modifying/archiving/deleting governance artifacts; never infer from filenames | HISTORICAL_VALID |
| OD-20260914-011 | DURABLE_VALUE_FROM_HISTORICAL_STATE | Historical files may hold durable laws/lessons; distill value while preventing historical state from becoming current authority | HISTORICAL_VALID |
| OD-20260914-012 | WRITER_CONSTRAINED_ASSEMBLER | Writers get small bounded tasks composing/configuring/binding/testing prebuilt owners | HISTORICAL_VALID |
| OD-20260914-013 | COMPONENT_BY_COMPONENT_ORACLE_COMPARISON | Compare reused components step-by-step vs Owner decisions + accepted donor value across presentation/behavior/interaction/responsive/a11y | HISTORICAL_VALID |
| OD-20260914-014 | GOVERNANCE_ROOT_ROLE | `/Google Drive/cep_building_mgm` is the durable governance/control workspace reconstructible without chat memory | HISTORICAL_VALID |
| OD-20260914-015 | SINGLE_LIVE_CURRENT_STATE_IN_PLACE | One stable `CURRENT_STATE.md` updated in place; versioned live-control proliferation retired | HISTORICAL_VALID |
| OD-20260914-016 | CONTROLLER_LIVE_STATE_MAINTENANCE_DUTY | Material state change ⇒ update CURRENT_STATE in the same task before replying, then re-read from Drive | HISTORICAL_VALID |
| OD-20260914-017 | CANONICAL_GOVERNANCE_IN_PLACE_AND_CONSOLIDATED | Stable names + in-place updates; new governance files only for genuinely distinct roles; overlapping docs distilled then archived | HISTORICAL_VALID |
| OD-20260914-018 | STATIC_INSTRUCTIONS_MAXIMUM_CONTINUITY | Static instructions force per-response refresh of state/governance/decisions/sources; strong enough for a new/long-running Controller | HISTORICAL_VALID |
| OD-20260914-019 | OWNER_VISUAL_REJECTION_OVERRIDES_LOWER_PASS | Direct Owner visual rejection voids lower Presentation PASS/READY and blocks convergence/promotion (applies to E19) | HISTORICAL_VALID |
| OD-20260914-020 | REAL_CONSUMER_REQUIRED_FOR_PRESENTATION_REUSE | Fixture/demo/synthetic consumers never satisfy real-consumer reuse, donor parity, second-consumer or cutover acceptance | HISTORICAL_VALID |
| OD-20260914-021 | EXTRACTION_NOT_PARALLEL_REIMPLEMENTATION | Reuse = extract/refactor actual accepted value into canonical owner + rebind donor; parallel lookalike is not extraction | HISTORICAL_VALID |
| OD-20260914-022 | DONOR_FLOOR_HARD_FAIL | Accepted donor value = minimum quality floor; materially weaker/thin/partial/unproven = blocking failure | HISTORICAL_VALID |
| OD-20260914-023 | WRITER_SCOPE_MUST_PERMIT_TRUE_EXTRACTION | Controller must grant/serialize real source seams; forbidden to prohibit the true seam and accept a fixture/parallel substitute | HISTORICAL_VALID |
| OD-20260914-024 | STATE_VIEWPORT_MATCHED_COMPONENT_PROOF | Component-by-component donor-vs-candidate proof on real consumer paths at matching states/viewports incl. 1440 and ~1024 | HISTORICAL_VALID |
| OD-20260914-025 | AUDIT_CONTRADICTION_HARD_STOP | Any unresolved BLOCKING/QUALITY_BLOCKER/MISSING_SHARED_FOUNDATION/PARTIAL_FOUNDATION/materially-weaker/thin/not-donor-grade/not-zero-loss/unproven finding forbids PASS/READY/convergence | HISTORICAL_VALID |
| OD-20260914-026 | REJECTED_E19_PRESENTATION_NO_CONVERGENCE | E19 A/B/C/D Presentation candidates REJECTED by Owner visual review; no Lane-F convergence; salvage only adjudicated subordinate value | **REJECTED** |
| OD-20260914-027 | OWNER_VISIBLE_EVIDENCE_SHEET_REQUIRED | Owner-readable component/state evidence sheet before Presentation acceptance; ZIP-buried evidence insufficient | HISTORICAL_VALID |
| OD-20260914-028 | WORST_UNRESOLVED_FINDING_CONTROLS_VERDICT | Top-level readiness never exceeds worst unresolved applicable finding; "materially addressed/bounded scope/Controller later" cannot downgrade | HISTORICAL_VALID |
| OD-20260914-029 | HISTORICAL_LOCKS_REQUIRE_CURRENT_RECONCILIATION | Historical owner-lock matrices = durable collision evidence, not current authority; if a lock blocks the true objective, serialize the hotspot | HISTORICAL_VALID |
| OD-20260914-030 | DRIVE_AS_CANONICAL_GOVERNANCE_WORKSPACE | `/Google Drive/cep_building_mgm` = sole live governance/execution root; File-Library paths retired after zero-loss migration | HISTORICAL_VALID |
| OD-20260914-031 | DRIVE_PATH_IN_PLACE_MAINTENANCE | All live state/governance/IO/custody paths live under the Drive root and are maintained in place | HISTORICAL_VALID |
| OD-20260914-032 | HISTORICAL_LIBRARY_PATHS_PROVENANCE_ONLY | Library-era paths in immutable evidence stay verbatim (never rewritten) and never authorize a current launch path | HISTORICAL_VALID |
| OD-20260914-033 | ZERO_LOSS_DRIVE_MIGRATION | Migrate with zero file loss + preserved relative structure; retire source only after destination verification | HISTORICAL_VALID |
| OD-20260914-034 | SUPPORTING_REGISTRY_AUTHORITY_CEILING | Census/manifests/stale registers/inventories/maps/pointers never create state/acceptance/Owner/launch/readiness/promotion authority | HISTORICAL_VALID |
| OD-20260914-035 | PERSONAL_LOCAL_VALUE_FIRST_EXECUTION | Personal/local value first; version rigidity is not an independent blocker; keep the stack as simple as practical but admit a tool when it materially improves results | HISTORICAL_VALID |
| OD-20260914-036 | EXPLICIT_LAUNCH_ADMISSION_ONLY | No historical/self-authorizing packet launches by existence; CURRENT_STATE authorization + exact Controller mission binding required | HISTORICAL_VALID |
| OD-20260914-037 | ISOLATED_WRITER_CANDIDATE_AND_SEQUENTIAL_OVERLAP | Mutating Writers work in isolated private candidates from the exact approved parent; overlapping/shared-hotspot candidates accepted sequentially via Controller rebase/replay + full re-verification; no parallel writes to one canonical tree | HISTORICAL_VALID |

### 1.4 Execution/evidence/platform law — `OD-20260915-001 … OD-20260928-085`

| ID | Status | Decision (condensed) | Class |
|---|---|---|---|
| OD-20260915-001 VISUAL_CAPTURE_CAPABILITY_SEPARATION | **SUPERSEDED_DUPLICATE** | Capability separation + recovery ladder; consolidated into OD-038 | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260915-002 EXACT_CURRENT_CANDIDATE_IN_MEMORY_TRANSPORT | **SUPERSEDED_DUPLICATE** | `page.setContent` of exact candidate bytes for visual evidence only when hash-bound + fresh + not fixture; consolidated into OD-038 | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260915-038 | ACTIVE | Visual capture recovery + fresh evidence: separate launch/navigation/render/screenshot/inspection; bounded recovery ladder (explicit paths, offline packages, standalone Chrome Headless Shell, compatible engines); never relabel historical screenshots; no architecture change just for screenshots | HISTORICAL_VALID |
| OD-20260915-039 | ACTIVE | Max safe parallel isolated Writers from the same accepted parent when the DAG permits; grouped convergence audits; approved-delta replay only; post-convergence + integrated regression; no ZIP overlay | HISTORICAL_VALID |
| OD-20260915-041 | ACTIVE | Temporary Owner exceptions/waivers are task-bound; never promoted to durable authority unless Owner explicitly generalizes | HISTORICAL_VALID |
| OD-20260916-042 | ACTIVE | Heavy-chat resumable checkpoint package (12 named artifacts) on explicit Owner checkpoint request; checkpoint = continuity transport, not acceptance | HISTORICAL_VALID |
| OD-20260916-043 | ACTIVE | Value-weighted parallelism: smallest number of coherent lanes minimizing time-to-accepted-result; Writer count is not the objective | HISTORICAL_VALID |
| OD-20260916-044 | ACTIVE | Controller bounded-correction authority: independently reproduced + exact root cause + minimal existing-owner diff + isolated candidate + full revalidation; no new architecture/owner/scope widening | HISTORICAL_VALID |
| OD-20260916-045 | ACTIVE | Technical source-resolution zero-loss: live authority → durable technical reference + lessons ledger → accepted source reconciliation; inventories/backlogs/summaries never classify a technology alone | HISTORICAL_VALID |
| OD-20260917-046 | ACTIVE | Managed target runner first; Owner machine only for genuine desktop/session/hardware capabilities; CI repos non-authoritative | HISTORICAL_VALID |
| OD-20260917-047 | ACTIVE | Narrow replaceable Win32 sidecar behind PlatformWindowCapability/PlatformInputDirectionCapability for OE-001/OE-004; no Electron/Tauri/Python second runtime; no stack freeze | HISTORICAL_VALID |
| OD-20260917-048 | ACTIVE | Operational Terminal window parity with Sticky (all-edge resize, CEP-internal pin, detached-window control); OS always-on-top = platform truth; close/hide never fabricates provider termination (updated in place after OD-049/050/052) | HISTORICAL_VALID |
| OD-20260917-049 | ACTIVE | xterm.js canonical terminal renderer across InternalSimulation/real PTY/ConPTY/playback; raw stream, no command allowlist; one Windows PTY/ConPTY provider for arbitrary shell profiles; STACK_FROZEN forbidden until proven | HISTORICAL_VALID |
| OD-20260917-050 | ACTIVE | Security non-blocking personal/local policy: no allowlists/RBAC/sandbox/permission prompts/loopback-only for security reasons; preserve correctness/data-integrity/lifecycle-truth boundaries | HISTORICAL_VALID |
| OD-20260917-051 | ACTIVE (partial micro-supersession) | Sticky full Structured editor parity + always-editable regardless of parent read/edit mode; no reduced fork; canonical owners for blocks/selection/clipboard/undo/Bidi (right-click clause superseded by OD-054) | HISTORICAL_VALID |
| OD-20260917-052 | ACTIVE | Separate/Detach opens the whole owning surface with route/object/context + focused note/terminal; pin both; close/hide no delete/termination fabrication | HISTORICAL_VALID |
| OD-20260917-053 | ACTIVE | Settings = durable/global/family preferences + discoverability; Toolbar/Details = current surface/object state/actions; no duplicate owners; grouping one-open/self-close + search + keyboard; current hierarchy not accepted | HISTORICAL_VALID |
| OD-20260918-054 | ACTIVE | Structured insertion-gap donor interaction: left-click/keyboard → chooser; right-click → direct Paragraph at exact gap (micro-supersedes OD-051's right-click clause only) | HISTORICAL_VALID |
| OD-20260918-055 | ACTIVE | Surface identity/functional completeness rescue gate (route smoke/shared-owner presence/tests/screenshots never prove completeness) | HISTORICAL_VALID |
| OD-20260918-056 | ACTIVE | W03 workspace-first direct manipulation + object lifecycle (immutability = specific artifacts, never surface-wide read-only) | HISTORICAL_VALID |
| OD-20260918-057 | ACTIVE | Balanced specialist coverage execution (medium bounded specialists → group coverage/convergence on approved deltas → independent group audit → serialized global convergence) | HISTORICAL_VALID |
| OD-20260920-058 | **SUPERSEDED_DUPLICATE** | Task-specific visual-capture + bounded-correction authorization; durable law already in OD-038/044 (corrected after authority audit) | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260920-059 | ACTIVE | Shared mechanics do not override surface semantics (Library not universal template; two-layer toolbar; per-surface action availability) | HISTORICAL_VALID |
| OD-20260920-060 | ACTIVE | Stack expansion lock with separate final-freeze gate (admitted baseline enumerated; dependency-admission disposition required) | HISTORICAL_VALID |
| OD-20260921-061 | **COMPLETED_TASK_SPECIFIC_NON_DURABLE** | R6 correction + Balanced6 serialized in one Writer candidate; retained for lineage only | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260921-062 | ACTIVE | Lean self-contained Writer repository (mission-bound authority packet; no live CURRENT_STATE/full governance/full register inside) | HISTORICAL_VALID |
| OD-20260921-063 | **COMPLETED_TASK_SPECIFIC_NON_DURABLE** | CORR02 existing-repo `main` bootstrap with Drive source; token variable only, token-free remote URL, no force, manifest allowlist, private-visibility gate | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260921-064 | **COMPLETED_TASK_SPECIFIC_NON_DURABLE** | Direct Drive API retrieval by exact file ID (no drive.mount / path discovery) | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260921-065 | ACTIVE | Public existing Writer repository admission (visibility law for `hamad933/cep-writer-baseline-repo`) | HISTORICAL_VALID |
| OD-20260921-066 | ACTIVE | Mission-bound candidate branch workflow (default for repository-based mutating Writers; superseded in part by OD-080 for the serial mode) | HISTORICAL_VALID |
| OD-20260921-067 | ACTIVE | Writer-complete main + mission overlay + Controller pre-resolved closed read set (READ_WHOLE_FILE vs READ_ONLY_SECTIONS; NO_DISCOVERY_BY_DEFAULT; Drive-to-local self-containment) | HISTORICAL_VALID |
| OD-20260921-068 | ACTIVE | CHATGPT_WRITER vs GOOGLE_AI_STUDIO_WRITER capability profiles (transport/custody differences never relax parent binding/no-self-promotion/audit) | HISTORICAL_VALID |
| OD-20260921-069 | ACTIVE | AI Studio manual git branch clone over main-only built-in sync; token via secret/env only, never in prompts/URLs; no push during preparation/preview | HISTORICAL_VALID |
| OD-20260921-070 | ACTIVE | Verified prerequisite correctness repair (fix prerequisite defects before phase execution; stop gates stay truthful) | HISTORICAL_VALID |
| OD-20260921-071 | ACTIVE | Owner authorization exclusivity + preparation-launch binding (Owner instruction to prepare = authorization to launch once prerequisites pass; Controller must not invent a second gate) | HISTORICAL_VALID |
| OD-20260922-072 | ACTIVE | Capability separation + local render recovery (browser capability ladder; navigation-independent rendering = NOT_GENUINE_ROUTE) | HISTORICAL_VALID |
| OD-20260922-073 | ACTIVE | Local-first iterative improvement over connector transport; intermediate evidence = scratch; heavy final custody to Drive; GitHub not bulk visual transport | HISTORICAL_VALID |
| OD-20260922-074 | ACTIVE | Self-contained Writer workspace Capsule v1 (one inbound capsule → local dev loop → one bounded outbound handoff) | HISTORICAL_VALID (CHATGPT-era) |
| OD-20260922-075 | ACTIVE | Controller-prepared ready-to-work capsule + bounded VISUAL_BOOTSTRAP_PACK (bootstrap screenshots = BOOTSTRAP_ONLY) | HISTORICAL_VALID (CHATGPT-era) |
| OD-20260922-076 | ACTIVE | Verified incremental Writer continuation (same clean worktree or deterministic reconstruction + continuation overlay; predecessors immutable) | HISTORICAL_VALID |
| OD-20260922-077 | ACTIVE | Zero-loss direct-successor Controller handoff (successor = sole accountable Controller; handoff never outranks live authority) | HISTORICAL_VALID |
| OD-20260922-078 | **COMPLETED_TASK_SPECIFIC_NON_DURABLE** | CORR03 review-then-traceability sequencing (historical task binding) | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260922-079 | ACTIVE | Owner-input classification routing + decision-register anti-inflation (3-gate test before any new OD row) | HISTORICAL_VALID |
| OD-20260924-080 | ACTIVE | Single persistent Writer serial branch workflow (`writer/cep-serial`; mission = audited checkpoint start + bounded commit + STOP; never push/merge to main) — LOCAL_EXECUTION scoped | HISTORICAL_VALID |
| OD-20260924-081 | ACTIVE | Execution-carrier route isolation + scoped topology (no cross-carrier inheritance of branch/seriality/paths/push/custody rules) | HISTORICAL_VALID |
| OD-20260924-082 | ACTIVE | Owner controls local task grouping + audit boundaries (no Controller-invented per-task STOP gates; lineage/scope/no-self-acceptance preserved) | HISTORICAL_VALID |
| OD-20260925-083 | ACTIVE | Owner explicit push gate (ROUTE-LOCAL remote push default-deny; explicit Owner push instruction per exact run/group) | HISTORICAL_VALID |
| OD-20260925-084 | **SUPERSEDED_DUPLICATE** | Controller pre-resolved exact read set (merged into OD-20260921-067 by explicit Owner direction) | HISTORICALLY_USEFUL_BUT_SUPERSEDED |
| OD-20260928-085 | ACTIVE | ROUTE-MIMO-AGENT admission: agentic carrier, one persistent serial Writer on `writer/mi-serial`, checkpoint commits per milestone, inline Controller+Auditor, five milestone workspace map, requirement corpus stays binding, Stage-3 launch ceremony superseded as ceremony only | HISTORICAL_VALID → see `KNOWLEDGE_EXTRACT.md` X-4 conflict |

## Part 2 — Recovered requirements (with provenance)

### 2.1 Zero-loss requirement corpus (the requirement unit)

| Requirement | Content | Provenance |
|---|---|---|
| Obligation row schema | `obligation_id, source_layer, source_key, source_drive_id, source_row_id, authority_class, temporal_disposition, dimension, component, state, directive, obligation, canonical_owner_or_dependency, positive_test, negative_falsification_test, proof_requirement, reference_binding, current_result_relation, applicability_basis, applicability_confidence, source_excerpt, notes` | `.openclaw/tmp/cep_mirror/corpus/STAGE2_OBLIGATIONS_MASTER.csv` + `corpus/surfaces/*.csv` + `.openclaw/tmp/req/*/ZERO_LOSS_OBLIGATION_MATRIX.csv` |
| Per-surface obligation counts | SHELL 352 · TODAY 359 · LIBRARY 375 · LEARN 369 · RQ 353 · VISUALIZE 388 · ENTERPRISE 412 · SCENARIOS 439 · LABS 441 · RUNS 461 · RESULTS 430 · EVIDENCE 382 · REVIEWS 355 · MASTERY 353 · PORTFOLIO 355 · HEALTH 355 · PROCESSING 361 · VALIDATION 359 · MANUAL_AI 352 · BACKUP 354 · AUDIT 345 · RELEASES 354 · CONFIGURATION 347 (Σ 8,651) | `corpus/STAGE2_MANIFEST.json`; `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` §3 |
| Source layers per row | `ZL01_DURABLE_ANCILLARY / ZL01_ROOT_FINDING / OWNER_DECISION / OWNER_QA_DEEP_AUDIT / ZL01_FORWARD_GAP / ZL01_ZL02_RECONCILIATION / CURRENT_IDENTITY / PROFILE / AUTHORITY_RECOVERY / VISUAL_REFERENCE` — every mission covers ALL layers | `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` §2 |
| Acceptance matrix row | `obligation_id, directive, dimension, component, state, canonical_owner_or_dependency, positive_acceptance_evidence, negative_falsifier, proof_requirement, current_result_relation, stage3_result_disposition, stop_on_fail` | `.openclaw/tmp/req/shell/ACCEPTANCE_AND_FALSIFICATION_MATRIX.csv` (352 rows = obligation count) |
| Zero-loss admission | Every obligation row appears in the mission acceptance matrix or carries `NOT_APPLICABLE_JUSTIFIED`; missing row = zero-loss failure | `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` §4/§6 |
| Source-value crosswalk | 3,497 rows (`raw_id, raw_class, source_lane, source_file_id, source_row_or_finding, target_surfaces, component, state, truth_dimension, exact_value, positive_test, negative_test, currentness, disposition, current_route, notes`) | `corpus/STAGE2_SOURCE_VALUE_CROSSWALK.csv` |
| Durable ancillary value | 735 micro-value rows (`detail_id, lane, source_file_id, source_row, source_kind, exact_detail_term, surface, component, state, c03_disposition, suggested_preservation_home, positive_test, negative_test, current_route, separate_root_finding, preservation_requirement`) — must be preserved as mission criteria, NOT inflated into root defects | `corpus/DURABLE_MICRO_VALUE_LEDGER.csv`; `ZL02` §4 |
| Lost/underrepresented value | 69 gap rows (`gap_id, priority, source_item, classification, current_route, gap_type, material_value_at_risk, falsification_performed, why_not_missing_root, recommended_target, status`) | `corpus/ZL01_LOST_UNDERREPRESENTED_VALUE.csv` |
| Manifest integrity | per-file bytes + sha256 for all 28 Stage-2 artifacts (e.g. master `bf71a13f…`, crosswalk `d535675a…`, SHELL `7a4a8278…`, TODAY `3e0833d5…`) | `corpus/STAGE2_MANIFEST.json` |

### 2.2 Mission-packet requirements (from the hardened `req/` packets)

| Requirement | Content | Provenance |
|---|---|---|
| Canonical scope block | `SCOPE_CANONICAL_V1` (project/workspace/surface/missionId/executionCarrier/candidateBranch/materializationClass/executionStartIdentity+b0 hashes/currentResultTreatment/branchLaunchGate/outputStatus/allowMainMerge=false/allowReleaseDeploy=false/allowGovernanceMutation=false) + `SCOPE_CANONICAL_SHA256`, byte-semantically mirrored in `CAPSULE_BINDING.json.scopeCanonical` | `.openclaw/tmp/req/shell/MISSION.md` |
| Result treatment | `SALVAGE_EVIDENCE_ONLY__NOT_EXECUTION_PARENT` — prior Writer results never exempt a row from fresh proof | `req/shell/MISSION.md` |
| Domain & truth contract | profile path + `domainImplementation` classification (`CONTRACT_ONLY` for SHELL) + invariants + **epistemic truth states** (`empty/stale/unavailable/error` defined per surface with exact expected behavior) + `DATA_COVERAGE_BLOCKER` instead of fabricating Product truth | `req/shell/MISSION.md`, `req/shell/SURFACE_PROFILE_AND_DOMAIN_CONTRACT.json` |
| Shared-owner policy | `ESCALATE_GLOBAL_SHARED`; generic/shared defects escalated centrally; no consumer-local fork; `main.ts`, `m0-controller-composition.ts`, `foundation/**`, DS01 impl, authority, package/dependency, CI, governance paths reserved/prohibited; `COMMON_AND_DAG` read-only | `req/shell/MISSION.md` |
| Visual proof loop | reference → current capture → decompose → diagnose → narrow correction → rebuild/rerender → recapture → **actual image inspection** → matched-state/viewport comparison → interaction/a11y/data/provider corroboration → regression/falsification → representative evidence; viewports `1440x1000`, governed compact ~1024, narrower responsive when layout changes; `NAVIGATION_FAILURE != RENDERING_FAILURE`; navigation-independent = `NOT_GENUINE_ROUTE` | `req/shell/MISSION.md` |
| Closed read set | packet artifacts first, then `CAPSULE_BINDING.json.closedReadSet`; no broad repo/Drive archaeology; `BOUNDED_DISCOVERY_ESCAPE` only for a named missing/contradictory input in the smallest relevant directory, recorded, stopping on authority/lineage ambiguity | `req/shell/MISSION.md` |
| Writable scope | e.g. SHELL: `stack/native-typescript/surfaces/shell/**`, `tests/surfaces/shell/**`, `writer-output/SWR-W01-SHELL/**`; read-only shared-owner paths listed explicitly | `req/shell/MISSION.md` |
| Materialization classes | `NEW_FULL_CAPSULE_V1_1` / `DETERMINISTIC_EXACT_RECONSTRUCTION_REEXECUTION` / `EXACT_COMMITTED_BASE_PLUS_ORDERED_PHASE2_PATCH_RECONSTRUCTION` / `VERIFIED_CONTINUATION_V1` (+ OD-076 admission truth required for continuation) | `req/*/MISSION.md`, `MATERIALIZATION_AND_VERIFIER_PAYLOAD.json`, `HELPER_B_HANDOFF.md`, `HELPER_D_HANDOFF.md` |
| Verifier gates | scopeCanonicalSha256; B0 source identity; git bundle exact commit; clean materialization before Product mutation; zero-loss packet hashes; branch collision gate recorded; STOP gate | `MATERIALIZATION_AND_VERIFIER_PAYLOAD.json` |

### 2.3 Product / domain requirements (approved models)

| Requirement | Content | Provenance |
|---|---|---|
| A01 workspace model (CEP-DEC-023, 2026-08-13) | Five destinations `Today | Knowledge & Learning | Simulation & Enterprise | Progress & Evidence | System & Operations`; K&L = `Library | Learn | Visualize | Research & Quality`; Library/Learn never duplicate canonical objects; visualization grammar defined in §3 | `corpus/A01_UNIFIED_WORKSPACE_PRODUCT_MODEL.md` |
| A02 simulation/enterprise model (CEP-DEC-025) | Enterprise World → Simulation Definition → Run Preparation → Internal High-Fidelity Simulation → Runtime Execution → Post-Run Results; V1 = internal high-fidelity simulation only (no Docker/VM architecture dependency) | `corpus/A02_SIMULATION_ENTERPRISE_PRODUCT_MODEL.md` |
| A03 progress/evidence model (CEP-DEC-026) | `Definition → Attempt/Run → Result → Candidate Evidence → Evidence → Review → Decision → Mastery State` lifecycle with governed immutability/supersession | `corpus/A03_PROGRESS_EVIDENCE_PRODUCT_MODEL.md` |
| CEP-VIS-001 (CEP-DEC-027) | Visual + interaction contract: one information item → one authoritative display location; canonical owner ≠ workspace surface ≠ context of creation; global destination → primary area → active object/task → contextual tool; region semantics TOP/LEFT/CENTER/RIGHT/BOTTOM | `corpus/CEP_VIS_001.md` |
| 23-surface identity matrix | Per-surface purpose/CENTER/commands/interaction model/reference binding/shared owners/drift/Owner overlay (see `KNOWLEDGE_EXTRACT.md` K-036..K-040) | `corpus/23_SURFACE_IDENTITY_MATRIX.md` |
| Technical reference (runtime/persistence/bridge) | Deterministic acceptance datasets `SMOKE_3`/`ACCEPTANCE_BALANCED_6`/`FULL_ACCEPTANCE_10`; Bidi/mixed-script QA input; xterm role; SQLite candidate-not-frozen; Save/Autosave/Recovery non-collapse; migrations/search; backup/restore; Manual-AI bridge import/export; capability breadth + target-proof boundary | `corpus/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md` |
| Library donor reuse register | Accepted design reference v1.2.17 (SHA-256 `ea66b58e…`), accepted-evidence IDs, design adjudication and reuse/dependency rules as the canonical project-knowledge owner for donor design knowledge | `corpus/ACCEPTED_LIBRARY_DESIGN_REUSE_REGISTER.txt` |

### 2.4 Acceptance / quality requirements (governing all Writer output)

| Requirement | Content | Provenance |
|---|---|---|
| Output law | `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`; global stop ceilings `NO_MAIN_MERGE_BY_WRITER / NO_RELEASE / NO_DEPLOYMENT / NO_STACK_FREEZE / CONTROLLER_AUDIT_REQUIRED`; Writer PASS/screenshots/tests/filenames/branch presence never create acceptance | `cep_repo/cep-writer/ACCEPTANCE_GATES.md`; `READ_FIRST.md` |
| Protected truths | (13 items: Product-source identity; Save/Autosave/Recovery; stale-save atomicity; xterm renderer≠provider; InternalSimulationAdapter ceiling; W03 workspace-first; W04 ownership boundaries; W05 provider ceilings; Visualize representation≠canonical; RQ unavailable truth never refilled with fixtures; one canonical owner per mechanic; no fabricated state; `main.ts`+`m0-controller-composition.ts` serialized hotspots) | `cep_repo/cep-writer/PROTECTED_TRUTHS.md` |
| Product-quality bar | authored UI, CENTER dominance, one information/action home, density/typography, restrained chrome, truthful microcopy, no fake dashboard/card-wall, no synthetic canonical truth, no dev/proof leakage, responsive continuity, keyboard/focus/touch, reduced motion, high contrast, RTL/LTR/Bidi, material non-default states; reference recovery = value/intent recovery not pixel cloning; dispositions `PRESERVE/RECOVER/RESTRUCTURE/ADAPT/DROP_EXPLICITLY/SUPERSEDED_BY_OWNER/NOT_APPLICABLE_JUSTIFIED` | `CONTROLLER_SUCCESSION_HANDOFF.md` §12 |
| Four-truth separation | CONTENT / PRESENTATION / BEHAVIOR-INTERACTION-FUNCTIONALITY / DOMAIN-DATA-PROVIDER-TRUTH; PASS never transfers | `CONTROLLER_GOVERNANCE.md` §9 |
| Truth ceilings | no fake Save/persistence/provider/runtime/native/canonical/async/success-receipt; `AUTOSAVE != EXPLICIT SAVE != RECOVERY`; close/hide = presentation only; `CEP pin != OS always-on-top`; `InternalSimulationAdapter` valid; `UNAVAILABLE` truthful; `STACK_NOT_FROZEN` | `CONTROLLER_GOVERNANCE.md` §20 |
| Ambiguity lint (12 rules) | profile classification + reason for every mechanic; admission vs preservation vs binding vs tested vs acceptance distinguished; exact identity objects; unavailable/empty/stale/error separate; one semantic owner per command; transient exits + focus return; preferred/effective customization at 4 zoom bands; shared slots not screenshot resemblance; UnifiedEditor for applicable content; authored/runtime/recorded/admission/review/Mastery separation; real provider capability recorded; open-issues ledger before scope expansion | `cep_repo/writer/AMBIGUITY_LINT_AND_SURFACE_CHECKLIST.md` |
| Writer capsule template | named fields for surface/profile, input candidate hash, authority, domain identity/revision, family engine, region payload bindings, domain commands, adapter capabilities, behavior proof (before→action→single owner→after→effect→negative oracle), source requirements addressed/remaining; output = bounded patch + source/command/profile delta + proof receipt + screenshots + unresolved deviations; status `NOT_OWNER_ACCEPTED` | `cep_repo/writer/WRITER_CAPSULE_TEMPLATE.md` |
| Baseline verification commands | `python3 cep-writer/tools/verify_repo.py; npm ci; npm run build:runtime; npm test; npm run check; npm run runtime:check` (+ `npm run browser:test` bounded six-flow) | `cep_repo/README.md`, `cep_repo/BROWSER_CONFORMANCE_BOOTSTRAP.md` |
| Writer authority order | latest explicit Owner decision → Controller-bound baseline + mission overlay → applicable Writer-readable Owner decisions → current finding projection → SurfaceProfile/domain/oracle/reference → protected truths → classified historical evidence only when explicitly bound | `cep_repo/cep-writer/WRITER_AUTHORITY_BASELINE.md` |
| Open-gate projection | 5 open C03 gates + finding projection `cep-writer/CURRENT_POST_C03_FINDINGS.json` (itself marked non-exhaustive; F-049/F-050 routing drift corrected in Drive authority) | `cep_repo/cep-writer/KNOWN_OPEN_GATES.md`; `corpus/ZL02_CONTROLLER_RECONCILIATION.txt` §8 |
| Owner open questions (Arabic, Writer-facing) | Shell/navigation final form reopened (current consumer host is not implicitly accepted); final foundation/stack adoption needs complete evidence then Owner adjudication (not requested now); Container/VM/remote/real + local bridge + desktop wrapper are future options not needed for internal simulation. Status `OWNER_ACCEPTANCE_PENDING / NO_SELF_ACCEPTANCE` | `cep_repo/authority/OPEN_OWNER_DECISIONS.md` |



