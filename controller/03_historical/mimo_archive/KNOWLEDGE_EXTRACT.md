# KNOWLEDGE_EXTRACT — Legacy Mimo Claw archive knowledge register

**Class:** `FORENSIC_KNOWLEDGE_REGISTER__HISTORICAL_EVIDENCE__NEVER_SILENT_AUTHORITY`
**Produced:** 2026-09-29 · MIMO forensic worker · see `ARCHIVE_INVENTORY.md` for receipt/integrity.
**Provenance:** every item cites its exact path **inside the archive** (`mimoclaw_workspace.tar.gz → …`).
**Kinds:** fact | decision | requirement | rationale | evidence | hypothesis | implementation_detail | historical_context | operational_lesson
**Classifications:** CURRENT_OWNER_DIRECTIVE | CURRENT_VALIDATED | CURRENT_EVIDENCE | HISTORICAL_VALID | HISTORICALLY_USEFUL_BUT_SUPERSEDED | CANDIDATE | CONDITIONAL | CONFLICTED | REJECTED | UNKNOWN

## A. Governance, authority chain, Controller law

**MIMO-K-001 · Authority precedence chain** · kind=requirement · class=HISTORICAL_VALID (carries forward)
Source: `.openclaw/tmp/cep_mirror/READ_FIRST.md`; also `CEP_CONTROLLER_BOOT.md` (root).
`Owner latest explicit decision → CURRENT_STATE → exact accepted source/evidence → live Owner decisions/current locks → mission/intake → governed donor/oracle → historical classified knowledge → chat memory LAST`. Every substantive Controller response must re-read `READ_FIRST → CURRENT_STATE → CONTROLLER_GOVERNANCE → applicable OWNER_DECISION rows` from Drive.
Why: this is the adjudication ladder the new Controller must replicate for W01–W05 packets; it decides conflicts between archive findings and current repo truth.

**MIMO-K-002 · READ_FIRST hard stops (consolidated)** · kind=requirement · class=HISTORICAL_VALID
Source: `.openclaw/tmp/cep_mirror/READ_FIRST.md`.
Nine standing hard stops: OD-079 owner-input classification (DURABILITY/ROUTING/EXISTING_AUTHORITY tests before any new OD row); OD-081 execution-carrier hard stop; OD-059 authority dimensions (shared Presentation ≠ surface semantics); OD-060 stack expansion lock; OD-045 technical source resolution; OD-055/056 surface rescue + W03 workspace-first; PRESENTATION hard stop (fixture≠real consumer; donor floor; owner visual rejection voids lower PASS); launch-admission hard stop (no self-authorizing historical packet); OD-077 succession hard stop; Drive custody law (`/Google Drive/cep_building_mgm` sole live root).
Why: defines what a Writer mission may/may not do per workspace; governs how to treat old packets in this archive.

**MIMO-K-003 · Controller boot standing instructions** · kind=operational_lesson · class=HISTORICAL_VALID
Source: root `CEP_CONTROLLER_BOOT.md`.
Read Drive `00_CONTROLLER` live set before substantive reply; use `gog drive download <id>`; local mirror `.openclaw/tmp/cep_mirror/`; on state change update `CURRENT_STATE.md` IN PLACE (Drive `164CDevKZ48ZAXke44oL3jXIVpYQJBmRu`) and re-read; Writer outputs are `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`; never trust Writer PASS; reply in Arabic for control/status with English technical IDs.
Why: exact operating procedure of the predecessor; validates the new Controller's checkpoint/evidence rules.

**MIMO-K-004 · Succession = authority reconstruction, not memory transfer** · kind=decision · class=HISTORICAL_VALID
Source: `READ_FIRST.md` (OD-20260922-077 block); `.openclaw/tmp/cep_mirror/CONTROLLER_SUCCESSION_HANDOFF.md` §0.
A new Controller chat is a direct successor, not a new epoch; must independently re-run boot + exact reads; predecessor handoff is "a map, never authority"; first action is to recheck whether any pending Writer result appeared after the handoff was prepared.
Why: governs how the current Controller consumes THIS archive — evidence/map, never authority.

**MIMO-K-005 · Single live CURRENT_STATE, updated in place** · kind=decision · class=HISTORICAL_VALID
Source: register rows `OD-20260914-015/016/017`; `.openclaw/tmp/cep_mirror/corpus/CEP_LIVE_GOVERNANCE_MANIFEST.json`.
One stable `CURRENT_STATE.md` updated in place (no versioned live-control proliferation); any Controller that materially changes mission/status/blockers must update it in the same task and re-read from Drive; canonical governance files use stable names + in-place updates; overlapping governance docs are distilled then archived.
Why: the archive shows three `CURRENT_STATE_REREAD*.md` copies kept as readback proof of exactly this law — a practice pattern for evidence-bound state writes.

**MIMO-K-006 · Owner-input classification / anti-inflation (OD-20260922-079)** · kind=decision · class=HISTORICAL_VALID
Source: `READ_FIRST.md`; `CONTROLLER_GOVERNANCE.md` §4 (compact lines 148–205); register `OD-20260922-079`.
Never create an `OD-*` just because the Owner asked/emphasized; all three tests must pass (DURABILITY, ROUTING, EXISTING_AUTHORITY). Route: task sequencing→Mission/CURRENT_STATE, enhancements→backlog, defects→finding custody, evidence→evidence custody, lessons→stable references, profile/domain reqs→profile/oracle/intake. One item has one primary canonical store. Temporary exceptions are task-bound (OD-20260915-041).
Why: prevents decision-register bloat; directly relevant to how Writer missions record Owner notes.

**MIMO-K-007 · Launch admission — existence is not authority** · kind=requirement · class=HISTORICAL_VALID
Source: `READ_FIRST.md` launch-admission block; register `OD-20260914-036`.
No historical `INPUT/START_HERE/CURRENT_AUTHORITY/AUTHORIZED/READY` packet is launchable merely because it exists or self-authorizes; launch requires CURRENT_STATE authorization for the mission class + exact Controller mission binding. Historical execution trees live in `90_ARCHIVE` and are never relaunched directly. OD-20260921-071: an explicit Owner instruction to prepare a named mission IS authorization to launch it once prerequisites are satisfied (Controller must not invent a second permission gate).
Why: tells the new Controller exactly how to treat this archive's `req/shell` and `req/today` packets (prepared, not auto-launchable).

**MIMO-K-008 · Supporting registries never create authority** · kind=requirement · class=HISTORICAL_VALID
Source: `READ_FIRST.md`; `CEP_LIVE_GOVERNANCE_MANIFEST.json` (`supportingAuthorityCeiling`).
Census/manifests/stale registers/inventories/maps/pointers never create current state, acceptance, Owner, launch, readiness or promotion authority; any conflict with the live chain is stale and must be corrected before mission launch.
Why: the Stage-2 corpus + knowledge indexes are discovery aids; Writer packets must not elevate them.

**MIMO-K-009 · Drive custody law + zero-loss migration** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260914-030/031/032/033`; `READ_FIRST.md`.
`/Google Drive/cep_building_mgm` is the sole live governance/execution root; File-Library-era paths are retired but preserved verbatim inside immutable historical evidence (never rewritten); migration must be zero-loss with destination verification before source retirement.
Why: explains why archive paths reference both `/Google Drive/cep_building_mgm/...` and old Library paths — both are provenance, only the Drive root is live.

**MIMO-K-010 · Mandatory Controller review chain** · kind=requirement · class=HISTORICAL_VALID
Source: register `OD-20260914-006`; `CONTROLLER_GOVERNANCE.md` §19 (compact line 473+).
`Writer → Independent Audit → exact parent/source/scope diff → package/manifest truth → direct falsification → REAL consumer path verification → Golden state/viewport replay → component-by-component Browser/Runtime/Visual comparison → Owner-decision zero-loss audit → reuse/duplicate-owner audit → Data/provider/persistence truth → audit contradiction scan → integrated regression → Owner-visible evidence sheet → ACCEPT or BOUNDED CORRECTION`. No acceptance before the Controller directly inspects representative pixels.
Why: this is the acceptance logic the new Controller must run per milestone; also drives `RCF_AND_EVIDENCE.md`.

**MIMO-K-011 · Worst-unresolved-finding law** · kind=requirement · class=HISTORICAL_VALID
Source: register `OD-20260914-025/028`; `CONTROLLER_GOVERNANCE.md` §15.
Top-level verdict may never exceed the worst unresolved applicable finding; `BLOCKING|QUALITY_BLOCKER|MISSING_SHARED_FOUNDATION|PARTIAL_FOUNDATION|materially weaker|thin|not donor-grade|not zero-loss|unproven` each forbid PASS/READY/convergence until directly resolved or explicitly superseded by Owner. "Materially addressed / bounded scope / Controller later" cannot downgrade a blocker. An internally contradictory audit bundle is itself a blocking audit defect.
Why: acceptance logic for W01–W05 milestone adjudication; prevents green-washing partial work.

**MIMO-K-012 · Four independent truths** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §9; `CONTROLLER_SUCCESSION_HANDOFF.md` §14.
Audit CONTENT / PRESENTATION / BEHAVIOR-INTERACTION-FUNCTIONALITY / DOMAIN-DATA-PROVIDER-TRUTH separately; PASS never transfers between dimensions.
Why: structure for every Writer acceptance matrix; also separates RCF presentation proof from provider truth.

**MIMO-K-013 · Truth ceilings (no fake capability)** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §20; `cep_repo/cep-writer/PROTECTED_TRUTHS.md`.
No fake Save/persistence/provider/runtime/native/canonical-state/async-completion/success-receipt. `AUTOSAVE != EXPLICIT SAVE != RECOVERY`. Close/hide/minimize changes Presentation only. `CEP pinning != OS always-on-top`. `InternalSimulationAdapter` is valid runtime truth. `UNAVAILABLE`/failure must stay truthful. `STACK_NOT_FROZEN` until an accepted gate says otherwise.
Why: hard falsification targets for Writer work; also the "four truths" ceiling cited in every legacy disposition.

**MIMO-K-014 · Stack expansion lock (OD-20260920-060)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260920-060`; `CONTROLLER_GOVERNANCE.md` §20.1.
Admitted baseline: Node.js/TypeScript app + local-runtime host, browser-native UI + `node:http`, `node:sqlite` behind the persistence boundary, `@xterm/xterm` renderer, narrow C++17 Win32/ConPTY sidecar behind platform capability contracts, Playwright for dev/test evidence. No framework/ORM/db-driver/queue/second-runtime/desktop-shell/bridge/production dependency without an exact unsatisfied requirement + Controller dependency-admission disposition. `STACK_EXPANSION_LOCKED != STACK_FROZEN` (freeze awaits Windows/xterm/PTY/ConPTY + platform-window/input-direction + integrated real-consumer gates).
Why: constrains what the current Node-22.16.0 native-TS stack may add during W01–W05.

## B. Owner decisions (register: 111 rows — full register in `DECISIONS_AND_REQUIREMENTS.md`)

**MIMO-K-015 · Register composition (re-parsed)** · kind=fact · class=CURRENT_EVIDENCE
Source: `.openclaw/tmp/cep_mirror/OWNER_DECISION_LIVE_REGISTER.csv` (re-parsed by this worker; `REGISTER_REREAD.csv` is byte-identical).
111 rows = **101 ACTIVE + 2 ACTIVE_PLATFORM_GATED (OE-001, OE-004) + 4 SUPERSEDED_DUPLICATE (OD-20260915-001/002, OD-20260920-058, OD-20260925-084) + 4 COMPLETED_TASK_SPECIFIC_NON_DURABLE (OD-20260921-061/063/064, OD-20260922-078)**. Families span `OWNER-20260910-001..020` (design/reuse law), `OE-001..005` (Owner enhancements), `OD-2026xxxx-xxx` (governance/execution/presentation/platform).
Why: resolves the archive-internal count drift (see CONFLICTS) and gives the authoritative applicability pool for W01–W05 packets.

**MIMO-K-016 · Foundation reuse-first + shared layout constitution** · kind=decision · class=HISTORICAL_VALID
Source: register `OWNER-20260910-005/011/012/013/014`.
Maximize executable reuse via global foundation / family engines / thin domain adapters; universal layout-slot templates (same layout grammar, placement, interaction across surfaces; surfaces change domain content/actions only); unified pane system (LEFT/RIGHT/TOP/BOTTOM shared mechanics; internal close/collapse distinct from external edge reveal; shared resize/responsive/preferred-vs-effective); one toolbar template with stable universal action slots; shared action containers (Command Palette, Context Action Menu, Selection Action Surface).
Why: defines the shared-mechanics contract for W01–W05 reconstruction and the collision map.

**MIMO-K-017 · Library is donor + consumer, not semantic template** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260914-001`, `OD-20260920-059`, `OWNER-20260910-003/004/016`.
Library Editor v1.2.17 is the accepted executable design donor; Library is a normal consumer + donor/regression oracle; generic improvements go central and propagate to every applicable surface. Learn inherits maximum compatible Structured/Library mechanics but keeps Learning semantics (never resurrect consumption-only/no-authoring CENTER). Other surfaces inherit only what their profile/family justifies. Non-Library blueprints (Visualize/W03) are requirement/value/evidence inputs only.
Why: governs reuse claims in every Writer mission; also the RCF donor-parity baseline.

**MIMO-K-018 · Extraction, not parallel reimplementation** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260914-020/021/022/023`; `CONTROLLER_GOVERNANCE.md` §§7–8.
Valid reuse path: `IDENTIFY ACCEPTED VALUE → LOCATE REAL DONOR → EXTRACT/REFACTOR INTO CANONICAL OWNER → REBIND DONOR → BIND REAL NON-LIBRARY CONSUMER → STATE/VIEWPORT-MATCHED COMPARISON → CENTRAL PROPAGATION → EXACT REVERT → CUTOVER WHEN ZERO-LOSS → REMOVE ONLY PROVEN DUPLICATE`. Forbidden: `READ DONOR → BUILD PARALLEL LOOKALIKE → PROVE FIXTURES → CALL IT REUSE`. Writer scope must permit the true extraction seam; collision avoidance never justifies false reuse.
Why: the single most important reuse rule for W01–W05; see `RCF_AND_EVIDENCE.md`.

**MIMO-K-019 · Donor quality floor + state/viewport proof** · kind=requirement · class=HISTORICAL_VALID
Source: register `OD-20260914-022/024/027`; `CONTROLLER_GOVERNANCE.md` §§11–12.
Accepted donor value is the minimum floor for every applicable component/state; "materially weaker/thin/partial/unproven" is a blocking failure. Presentation acceptance requires a component matrix (component ID, owner, donor anchor, OD ids, real donor path, real candidate consumer path, exact state, viewport, both screenshots, behavior receipt, responsive/Bidi/a11y evidence, verdict, blocker) at 1440 and ~1024. Evidence must be directly inspectable by Owner (not buried in ZIPs).
Why: acceptance mechanics for every Presentation-heavy Writer mission.

**MIMO-K-020 · Owner visual rejection overrides lower PASS (E19 precedent)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260914-019/026`; `CONTROLLER_GOVERNANCE.md` §16.
Direct Owner visual rejection immediately voids lower Writer/Auditor Presentation PASS/READY tokens and blocks convergence/promotion until corrected and re-proven; record `REJECTED_BY_OWNER`; investigate root cause before another Writer launch; salvage subordinate behavior/semantic work only after source-level adjudication. E19 A/B/C/D + Lane-F convergence were rejected on this basis (REJECTED class item).
Why: adjudication precedent; shows Owner visual authority is absolute over machine claims.

**MIMO-K-021 · Result-first acceptance + all components material** · kind=requirement · class=HISTORICAL_VALID
Source: register `OD-20260914-003/004`; `CONTROLLER_GOVERNANCE.md` §10.
Acceptance is based on the actual visible/interactable result (appearance, interaction, functionality, responsive behavior, Bidi/a11y, truthful state/data). Every material component counts (small controls, icons, tree items, menus, toolbars, content chrome, states, transients, panes). Verify default/hover/focus-visible/active/selected/disabled/unavailable/expanded/collapsed/loading/empty/stale/error/conflict/read-only/processing/success plus typography/hierarchy/spacing/density/overflow; pointer/keyboard/focus; Back/Forward; 1440 + ~1024; RTL/LTR/Bidi; reduced motion.
Why: completeness bar for W01–W05 component censuses.

**MIMO-K-022 · Writer = constrained assembler** · kind=decision · class=HISTORICAL_VALID
Source: register `OWNER-20260910-019/020`, `OD-20260914-012`.
Foundation outputs must be executable components/templates/cores + machine-readable contracts + tests, not prose. Writers receive small bounded tasks and mostly compose/configure/bind/test prebuilt owners; generic design/behavior/presentation invention belongs in Foundation correction, not Surface Writer discretion; deviations require explicit justification.
Why: shapes mission granularity for the serial Writer.

**MIMO-K-023 · Serial branch law (OD-20260924-080 + carrier scoping)** · kind=decision · class=HISTORICAL_VALID (carrier-scoped)
Source: register `OD-20260924-080/081/082`, `OD-20260925-083`; `EXECUTION_CARRIER_ROUTE_AUTHORITY.txt`.
One persistent Writer on one stable non-main branch created from exact Controller-bound `main`; strictly serial missions; each mission = explicit audited checkpoint start + one bounded commit + STOP; unadjudicated delta never carried into the next mission; no push to `main`/merge/self-accept/release/deploy/governance mutation. OD-081: carrier rules never leak across routes (ROUTE-LOCAL vs ChatGPT vs AI Studio vs future). OD-082: Owner controls local task grouping and audit boundaries (Controller must not insert mandatory STOP gates between Owner-grouped tasks). OD-083: ROUTE-LOCAL remote push is **default-deny** unless the Owner explicitly authorizes push for that exact run.
Why: the branch/checkpoint/push law for the current serial Writer lane (see CONFLICTS re: `writer/cep-serial` vs `writer/mi-serial`).

**MIMO-K-024 · ROUTE-MIMO-AGENT admission (OD-20260928-085)** · kind=decision · class=HISTORICAL_VALID → superseded in part by current Owner hard rule
Source: register `OD-20260928-085`; `.openclaw/tmp/cep_mirror/CURRENT_STATE.md` entry `EXECUTION CARRIER REBIND — ROUTE-MIMO-AGENT + SERIAL 5-MILESTONE PLAN — 2026-09-28`.
Owner switched carrier from constrained ROUTE-CHATGPT to the agentic agent-chat class: full shell/git/gh/gog; repo cloned+pushed directly; Capsule v1.1/git-bundle/connector ceremony retired for this carrier. Topology: ONE persistent sequential Writer on ONE candidate branch `writer/mi-serial`, checkpoint commit per milestone, no parallel multi-Writer. Review topology: Controller chat is both Controller and independent Auditor (direct clone/test/diff/visual). Push: Writer may push checkpoint commits to its candidate branch only; main merge/acceptance/release/deploy/stack-freeze gated on exact Controller audit + Owner. It supersedes the Stage-3 "23 hardened packets + COMMON_AND_DAG + 23/23 prelaunch" ceremony **as a launch gate only**; accepted lineage, evidence custody and the requirement corpus remain immutable and binding.
Why: this is the direct ancestor of the current execution model; its five-milestone map is the W01–W05 plan.

**MIMO-K-025 · Five-workspace milestone map (23 surfaces, exactly once)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260928-085`; `CURRENT_STATE.md` (2026-09-28 rebind entry); `CONTROLLER_SUCCESSION_HANDOFF.md` §3.
`M1=W01: SHELL,TODAY` · `M2=W02: LIBRARY,LEARN,RQ,VISUALIZE` · `M3=W03: ENTERPRISE,SCENARIOS,LABS,RUNS,RESULTS` · `M4=W04: EVIDENCE,REVIEWS,MASTERY,PORTFOLIO` · `M5=W05: HEALTH,PROCESSING,VALIDATION,MANUAL_AI,BACKUP,AUDIT,RELEASES,CONFIGURATION` (23/23 covered exactly once).
Why: the canonical five-workspace mapping the Controller asked for; matches the current W01–W05 reconstruction.

**MIMO-K-026 · Platform/window/terminal law (OD-047..OD-052)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260917-046..052`.
Managed target runner first (Owner machine only for genuine desktop/session capabilities); narrow replaceable Win32 sidecar behind `PlatformWindowCapability`/`PlatformInputDirectionCapability` (no Electron/Tauri/Python second runtime); Operational Terminal window parity with Sticky (all-edge resize, CEP-internal pin, detached-window control; OS always-on-top is a separately proven platform truth); xterm.js is the canonical terminal renderer across InternalSimulation + real PTY/ConPTY + playback (raw stream, no command allowlist; one Windows PTY/ConPTY provider serves PowerShell/cmd/WSL/Git-Bash profiles; STACK_FROZEN forbidden until proven); security hardening is non-blocking for this personal/local app (no allowlists/RBAC/sandbox as security gates); Sticky full-editor parity + always-editable (OD-051); Separate/Detach opens the whole owning surface with route/object/context (OD-052).
Why: W05 (Runs/Configuration/Sticky) implementation constraints and platform truth ceilings.

**MIMO-K-027 · Settings vs Toolbar/Details (OD-053) + insertion-gap donor interaction (OD-054)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260917-053`, `OD-20260918-054`; `corpus/OWNER_ENHANCEMENT_QA_BACKLOG.md` §6.5.
Settings owns durable/global/family preferences + discoverability; Toolbar/Details owns current-surface/object contextual state/actions; no duplicate Presentation ownership; shared commands bind the same canonical owner and are framed as shortcuts. Grouped settings: one-open/self-close + search + keyboard. OD-054 (micro-supersedes OD-051's right-click clause): left-click/keyboard on insertion `+` opens the chooser; right-click inserts a Paragraph directly at the exact gap.
Why: exact interaction contract for Structured consumers in W02 (Library/Learn) and Sticky.

**MIMO-K-028 · W03 workspace-first + object lifecycle (OD-056)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260918-056`; `corpus/23_SURFACE_IDENTITY_MATRIX.md` "W03 causal identity chain".
Enterprise/Scenarios/Labs/Runs/Results are workspaces/studios, not surfaces under a universal Read/Edit mode; default interaction is active work per surface purpose + selected-object lifecycle (modeling/authoring; operational control; historical analysis/replay/AAR/compare); immutability attaches to published/sealed artifacts handled via clone/new/superseding revision — never by making the whole surface read-only; Read/Edit controls only for compatible Structured document content. Causal chain: `Enterprise Definition → Digital Twin Revision → Baseline → Scenario/Lab Definition → immutable Run Manifest → deterministic runtime → sealed Result revision → Replay/AAR/Compare → Candidate Evidence handoff`. "Operations" is a Runs mode; "Replay/AAR/Compare" are Results modes; InternalSimulationAdapter is the W03 semantic default while xterm is presentation and ConPTY a parallel provider.
Why: the semantic skeleton for M3 (W03) reconstruction.

**MIMO-K-029 · Surface identity rescue gate (OD-055)** · kind=requirement · class=HISTORICAL_VALID
Source: register `OD-20260918-055`; `corpus/23_SURFACE_IDENTITY_MATRIX.md` (matrix + hard gate).
Route reachability, generic controller stages, shared-owner presence, smoke PASS, tests or screenshots never prove surface completeness. Each surface must compose required shared owners through its own typed domain/data/provider truth in TOP/TOOLBAR/LEFT/CENTER/RIGHT/BOTTOM/TRANSIENT. Before rescue mutation, a zero-loss 23-surface identity/reference matrix must be reconstructed from SurfaceProfiles + requirement index + live Owner decisions + accepted donors + classified references. Owner hands-on rejection overrides lower CLEAN/PASS.
Why: the acceptance gate for every workspace reconstruction.

**MIMO-K-030 · Execution/parallelism economics** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260915-039`, `OD-20260916-043/044`, `OD-20260918-057`.
Max safe parallelism is DAG/collision-bound but Writer count is not the objective (value-weighted lanes; no gratuitous micro-fragmentation). Controller may implement bounded corrections during review when exact root cause + minimal existing-owner diff + isolated candidate + full revalidation are proven (no new architecture/owner/scope widening). Post-M0 rescue uses medium bounded specialists by owner/seam + family, group coverage/convergence Writers consuming only Controller-approved deltas, serialized shared hotspots, no sibling ZIP overlay.
Why: scheduling law behind the serial milestone model and Controller bounded-correction authority.

**MIMO-K-031 · Checkpoint + continuation law (OD-042, OD-076)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260916-042`, `OD-20260922-076`; `CONTROLLER_SUCCESSION_HANDOFF.md` §9.
Heavy chats must materialize a self-contained source-bound continuity package on Owner checkpoint request (CHECKPOINT_RECEIPT.json, WORKING_CANDIDATE.zip, HANDOFF.md, APPLIED_CHANGE_LEDGER, SOURCE_DIFF.patch, FINDING_LEDGER, PHASE_PROGRESS, TEST_EVIDENCE_INDEX, REVALIDATION_MAP, INPUT_CONSUMPTION, OWNER_DECISION_PROGRESS, RESUME_INSTRUCTIONS). Checkpoint = continuity transport, `CANDIDATE_ONLY / NOT_ACCEPTANCE`. Corrections prefer verified incremental continuation over full repackaging; predecessors preserved immutably; never overwrite or sibling-overlay.
Why: exact checkpoint recipe for the current serial Writer + Controller audit.

**MIMO-K-032 · Lean Writer repository boundary (OD-062/063/064/067)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260921-062/063/064/067`; `cep_repo/cep-writer/REPOSITORY_BOUNDARY.md`.
Writer-facing repos carry exact Product parent + Controller-distilled task authority packet (mission, parent identity, applicable OD rows with binding text, SurfaceProfiles, oracles/visual refs, protected truths, writable/read-only/prohibited, acceptance/falsification gates, truth ceilings) — NOT live `CURRENT_STATE.md`, full governance or full register. Repository is execution input, never acceptance authority; stale packet = STOP. Drive retrieval uses exact file IDs (no mount/path discovery). OD-067: Controller pre-resolves a CLOSED/mandatory read set; `NO_DISCOVERY_BY_DEFAULT`; `BOUNDED_DISCOVERY_ESCAPE` only for named missing/contradictory inputs; Drive-only inputs are retrieved/projected by the Controller before launch.
Why: directly shapes the current repo's Writer packets and read-set discipline.

**MIMO-K-033 · Per-mission authorization is Owner-exclusive (OD-071)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260921-071`; `READ_FIRST.md` launch block.
Owner authorization comes from the Owner; an explicit instruction to prepare a named next mission/batch is authorization to launch it once real sequencing/technical prerequisites are satisfied, unless the Owner says preparation-only/hold. The Controller binds that authorization to the exact mission/parent/scope and enforces factual authority, sequencing, collision and feasibility gates — but must not invent or withhold a second permission gate.
Why: dispatch law for the current Controller's Writer launches.

**MIMO-K-034 · Visual-evidence capability separation (OD-038/072/073)** · kind=decision · class=HISTORICAL_VALID
Source: register `OD-20260915-038` (consolidating superseded duplicates OD-20260915-001/002), `OD-20260922-072/073`; `CONTROLLER_GOVERNANCE.md` §17.3 + §20.6.
Browser launch, URL navigation, navigation-independent rendering, JS/DOM, interaction, screenshot, actual image inspection, video and genuine route/platform proof are separate capabilities; a failure in one never declares visual capture impossible while a bounded path remains (recovery ladder L1–L8 incl. explicit executable paths, offline packages, standalone Chrome Headless Shell, in-memory `page.setContent` of EXACT candidate bytes classified `NOT_GENUINE_ROUTE`). Never relabel historical screenshots as fresh. Local-first loop; intermediate captures are scratch; heavy final evidence to Drive; GitHub is not bulk visual transport. Any user-visible mutation is a `VISUAL_IMPACTING_MISSION` (15 mandatory prompt bindings incl. data-sufficiency classification, matched state/viewport, region decomposition, actual inspection).
Why: browser/evidence method for all W01–W05 work; see `RCF_AND_EVIDENCE.md`.

**MIMO-K-035 · Session/environment facts of the legacy runtime** · kind=implementation_detail · class=HISTORICAL_VALID
Source: root `MEMORY.md`, `TOOLS.md`, `memory/2026-09-28.md`.
gh 2.101.0 authenticated as `hamad933`; `gog` 0.42.0 authenticated to `hamadco933@gmail.com` (drive/docs/sheets) with keyring file backend that must be sourced before use (`.openclaw/tmp/gog-keyring.env`, mode 0600); repo `hamad933/cep-writer-baseline-repo`, clone at `.openclaw/tmp/cep_repo`; dev proof server `npm run dev` → localhost:4173 with `ab screenshot`/agent-browser pipeline verified end-to-end; a service-account key once transited chat (wrong type for personal Drive) and the Owner was advised to rotate it (recorded as a security lesson; **no key material present in the archive**).
Why: reusable environment knowledge + one security-relevant operational lesson.

## C. Workspaces W01–W05 and 23-surface knowledge

Primary source for all C items: `.openclaw/tmp/cep_mirror/corpus/23_SURFACE_IDENTITY_MATRIX.md` (canonical 23-row matrix) cross-checked with `.openclaw/tmp/cep_mirror/CURRENT_STATE.md`, `corpus/FINAL_VISUAL_REFERENCE_REGISTER.md`, and `.openclaw/tmp/req/*/MISSION.md`.

**MIMO-K-036 · W01 = SHELL + TODAY** · kind=fact · class=HISTORICAL_VALID
SHELL: global navigation/composition surface (destinations, route/object context, shared workspace frame, return continuity); CENTER = GlobalShell primary task; commands `shell.navigate/recover/search/leaveDirty`; no domain mutation; **visual composition REOPENED** (`NO_FINAL_BINARY__VISUAL_COMPOSITION_REOPENED_BY_OWNER-20260910-010`); five destinations are a current baseline with `destinationCountFrozen=false`.
TODAY: daily orchestration/command projection over domain-owned truth (resume, recommendation, attention, recent context, progress projection); CENTER = OrchestrationProjectionWorkbench; commands `today.resume/refresh/filter/why`; never a second canonical store; epistemic/provider state controls availability+copy; known drift: provider UNAVAILABLE rendered as AVAILABLE_EMPTY; `today.why` not bound to selected recommendation subject; reference `1JGkV1QP4m7ZIiFpcE_nJuRFIAXLjavC6` (OWNER_CONFIRMED_FINAL_REFERENCE).
Why: M1 scope; also the two known P0s (CBF-002 Back-context, CBF-003 BOTTOM) land here.

**MIMO-K-037 · W02 = LIBRARY + LEARN + RQ + VISUALIZE** · kind=fact · class=HISTORICAL_VALID
LIBRARY: canonical Knowledge & Learning + Structured content workbench (KU/document/revision-aware authoring); commands `library.create/insert/save/revise/history`; READ/EDIT/CLEAN/DIRTY apply to the selected document transaction only; explicit Save/revision semantics; donor `1HMBrJNFggyR2B3Y0Rnb8RYNW2RxEjZuO` (ORACLE-002) + final reference `1-1EUeL56tcRKUOFDaLa-1Aey6zABnXPJ`.
LEARN: learning journey/activity workbench over canonical knowledge objects (progress/practice/assessment); Completion/Progress != Mastery; commands `learn.open/edit/practice/review`; reference `1HLU4FemcxptjirsUlXKf_dzTARiu6rSJ`.
RQ: analytical knowledge-quality workbench (sources, claims, provenance, conflict, exact revision comparison/reconciliation) — NOT W04 formal Evidence Review; commands `rq.search/compare/review/provenance`; `rq.compare` requires exact SourceRevision pair + scope; visual ceiling = `REVIEWED_FINAL_CANDIDATE` only (`16INkI_mgjhbCNig2PUqSvbzOdLEKJ1mQ`), never Owner-confirmed final.
VISUALIZE: spatial knowledge workbench (Tree/Path/Graph/Canvas over canonical objects/relations); representation state ≠ canonical truth; commands `spatial.* / relation.*`; Tree ref `1ltKZYzU5Ho2025W8rHo2We1oOWm9JUyG` (FINAL), Path/Graph/Canvas supporting; known drift: canonical provider unavailable while a synthetic LocalGraph was labeled "Canonical"; one-shell four-view composition must be restored.
Why: M2 scope + the exact drifts to falsify.

**MIMO-K-038 · W03 = ENTERPRISE + SCENARIOS + LABS + RUNS + RESULTS** · kind=fact · class=HISTORICAL_VALID
ENTERPRISE: Digital-Twin modeling workspace (canonical entities/typed relations, Twin revisions, Simulation-local overlays, immutable Baselines); commands `enterprise.inspect/edit/revise/twin/handoff`; drift: Twin revision/Baseline lifecycle + selected-object workbench incomplete.
SCENARIOS: portable Scenario authoring Studio (roles/environment/phases/events/injects/decisions/lab modules/tasks/rules/observability/completion); commands `scenarios.author/validate/revise/prepare`; drift: M0 generic framing misses governed orchestration facets.
LABS: reusable Lab Definition Studio centered on a non-linear typed Task Graph + explicit environment binding; commands `labs.author/preflight/handoff/revise`; drift: task-graph authoring + selected task/branch context missing.
RUNS: operational runtime workspace (no-write Preflight, immutable Run Manifest, lifecycle control, runtime facts/tools, terminal/deep work); commands `OPEN_TERMINAL, runtime.input/disconnect/reconnect, runs.pause/resume, view.recorded`; lifecycle derived from Run state/provider ACK; drift: Preflight + Active Operations composition incomplete; ConPTY/input/window proof is a separate platform gate.
RESULTS: sealed historical analysis (Result truth, Replay, AAR, Compare, Candidate Evidence handoff); commands `results.replay/step/compare/annotate/handoff/verifyDeterminism`; sealed facts immutable, replay interactive, AAR revisioned separately; drift: Replay/AAR/Compare workbench incomplete; M0 local replay duplicates `TimelineReplayOwner`.
Why: M3 scope.

**MIMO-K-039 · W04 = EVIDENCE + REVIEWS + MASTERY + PORTFOLIO** · kind=fact · class=HISTORICAL_VALID
EVIDENCE: governed Evidence lifecycle (Candidate Evidence → admission, immutable revisions, provenance, review eligibility); commands `evidence.inspect/import/amend/admit/sourceChoice`; drift: `evidence.import` missing; amend/admit/sourceChoice guards violate immutable-revision/authority/CAS/reason semantics.
REVIEWS: formal review/decision workbench over pinned Evidence revisions (criteria, findings, decisions, re-review, immutable supersession); commands `reviews.review/finding/compare/supersede`; drift: `reviews.compare` missing, selected payload unbound, finding criterion-scope guard incomplete.
MASTERY: governed competency explanation/evaluation projection (policy + effective Decisions + Evidence; no local fabrication from activity/completion); commands `mastery.inspect/explain/reevaluate`; drift: `mastery.reevaluate` manufactures local governed truth instead of a zero-local-write request.
PORTFOLIO: curation/projection over canonical Evidence/Mastery/project references (membership/order/filter/annotation mutable; source truth never edited/deleted); commands `portfolio.curate/filter/export/group`; drift: hard-coded grouping IDs act as authority; Project/Learning-Objective grouping = `AUTHORITY_DECISION_REQUIRED`.
Why: M4 scope; A03 is the approved domain model for this workspace.

**MIMO-K-040 · W05 = HEALTH + PROCESSING + VALIDATION + MANUAL_AI + BACKUP + AUDIT + RELEASES + CONFIGURATION** · kind=fact · class=HISTORICAL_VALID
HEALTH: operational observation (provider/freshness/liveness/queue/diagnostics; refresh = observation; durable diagnostics separate); drift: typed command/region binding incomplete; must distinguish unavailable/stale/empty.
PROCESSING: pipeline lifecycle (requests, Jobs, Attempts, retry/cancellation, validation handoff with provider ACK truth); **no standalone visual reference by design** (`INTENTIONALLY_NOT_GENERATED — CONTRACT_DERIVABLE`).
VALIDATION: technical validation of exact artifact/ruleset/validator inputs → TechnicalFindings; never promoted to formal Review truth.
MANUAL_AI: manual/provider-neutral proposal adjudication with export/import provenance; Accept creates draft only; drift: direct provenance equality falsified (import must match exact prepared/exported source/revision/digests).
BACKUP: recovery-safety workbench (package/plan/stage/restore-drill/verification/activation-request); staged/verified != live restored; drift: durable failure/compensation attempt history incomplete.
AUDIT: audit traceability (application audit history, verification/integrity results, separate annotations; AuditEvent append-only); drift: command-receipt inspection does not replace canonical AuditEvent/hash-chain/search/verify/annotate.
RELEASES: release governance separating technical readiness, exact candidate comparison, Owner authorization, deployment observation; drift: compare must pin two exact candidate identities; candidate-bound evidence model thin.
CONFIGURATION: operational configuration inspect/propose/validate/apply-request — explicitly distinct from Global Settings; commands `configuration.edit/diff/validate/reset/requestApply`.
Why: M5 scope.

**MIMO-K-041 · Per-surface visual reference bindings (register, 2026-09-05)** · kind=evidence · class=HISTORICAL_VALID
Source: `corpus/FINAL_VISUAL_REFERENCE_REGISTER.md`.
Classification levels: `OWNER_CONFIRMED_FINAL_REFERENCE` (Today, Library, Learn, Visualize-Tree, Validation, AI-Bridge/Manual-AI, Backup, Audit, Releases, Configuration), `CURRENT_FINAL_REFERENCE` (Enterprise-Topology, Scenarios, Labs, Runs, Results-Replay, Evidence, Reviews, Mastery, Portfolio, Health), `OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE` (Enterprise Twin/Baseline, Run Preflight, Results AAR, Results Compare), `REVIEWED_FINAL_CANDIDATE` (RQ — ceiling only), supporting component refs (Visualize Path/Graph/Canvas; Canvas promoted by Owner 2026-09-05 as representation-only). Every row carries Drive ID + SHA-256. Expanded-bottom depictions in Audit/Releases/Validation references are depiction-only; the contract remains `BOTTOM = temporary deep workspace / closed by default`.
Why: Presentation floors/ceilings per surface; exact binaries + hashes for evidence binding.

**MIMO-K-042 · CEP-VIS-001 visual & interaction contract** · kind=requirement · class=HISTORICAL_VALID
Source: `corpus/CEP_VIS_001.md` (Owner-approved CEP-DEC-027, 2026-08-14).
Highest law: `ONE INFORMATION ITEM → ONE AUTHORITATIVE DISPLAY LOCATION`; ownership law: `CANONICAL OWNER ≠ WORKSPACE SURFACE ≠ CONTEXT OF CREATION`; navigation law: `GLOBAL DESTINATION → PRIMARY AREA → ACTIVE OBJECT/TASK → CONTEXTUAL TOOL`. Region semantics (from succession handoff §7): TOP=current actions/modes; LEFT=structure/navigation; CENTER=dominant primary work; RIGHT=unique context; BOTTOM=temporary deep workspace closed by default; one information/action home.
Why: the layout/region constitution every W01–W05 surface must obey.

**MIMO-K-043 · A01/A02/A03 approved product models** · kind=requirement · class=HISTORICAL_VALID
Source: `corpus/A01_UNIFIED_WORKSPACE_PRODUCT_MODEL.md` (CEP-DEC-023), `A02_SIMULATION_ENTERPRISE_PRODUCT_MODEL.md` (CEP-DEC-025), `A03_PROGRESS_EVIDENCE_PRODUCT_MODEL.md` (CEP-DEC-026) — all `APPROVED — IMPLEMENTATION AUTHORIZATION: NONE`.
A01: five destinations `Today | Knowledge & Learning | Simulation & Enterprise | Progress & Evidence | System & Operations`; K&L contains `Library | Learn | Visualize | Research & Quality`; Library and Learn never duplicate canonical knowledge objects. A02: Simulation & Enterprise = Enterprise World → Simulation Definition → Run Preparation → Internal High-Fidelity Simulation → Runtime Execution → Post-Run Results (not an "Active Lab Runner"); V1 uses internal high-fidelity simulation only — no Docker/VM dependency. A03: Progress & Evidence lifecycle `Definition → Attempt/Run → Result → Candidate Evidence → Evidence → Review → Decision → Mastery State`.
Why: domain law for W02/W03/W04; the workspace-to-destination mapping explains the W01–W05 grouping.

**MIMO-K-044 · Surface-reference ceilings and unresolved authority questions** · kind=hypothesis · class=CANDIDATE / CONFLICTED (open)
Source: `corpus/23_SURFACE_IDENTITY_MATRIX.md` "Current unresolved Controller-bound authority questions".
Open: (1) Shell exact destination-count permanence — five is functional baseline, not immutable law; (2) Today provider owner binding; (3) RQ final visual authority (candidate-only); (4) Portfolio Project/Learning-Objective grouping authority; (5) `TimelineReplayOwner` retain+rebind vs retire; (6) W05 Audit domain vs command-receipt provenance; (7) Manual-AI provenance equality mechanism.
Why: these must be resolved or explicitly carried as OPEN in Writer packets; none may be silently decided by a Writer.

**MIMO-K-045 · Surface rescue hard gate (binding sentence)** · kind=requirement · class=HISTORICAL_VALID
Source: `corpus/23_SURFACE_IDENTITY_MATRIX.md` "Rescue mission hard gate".
A mutating rescue Writer launches only after the Controller binds exact parent bytes/hash/source, affected matrix rows, applicable Owner decisions (incl. OD-056 for W03), exact shared owners, exact writable/read-only/prohibited paths, current collisions, positive + falsification tests, visual/runtime/provider evidence and output custody. No generic `renderTruthStage`/fixture route/shared-owner-presence proof substitutes for the row's actual purpose and typed composition.
Why: pre-dispatch checklist for each milestone mission.

## D. Shared mechanics ownership (hotspot map)

**MIMO-K-046 · Shared-hotspot delegation map (binding)** · kind=decision · class=HISTORICAL_VALID
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §4 + §17.4; `CURRENT_STATE.md` (2026-09-28 rebind entry); `.openclaw/tmp/cep_mirror/HELPER_B_HANDOFF.md`.
`Shell→GlobalShellNavigationOwner` · `Learn→StructuredPresentationBridge` · `RQ→BottomDeepWorkOwner (provider contract)` · `Scenarios→SpatialPresentationOwner` · `Results→TimelineReplayOwner` · `Runs→exact W03 hunks in main.ts + m0-controller-composition.ts` · `Reviews→W04 family composition seam (w04-rescue.ts)` · `Configuration→W05 family composition seam (w05-rescue.ts)`; `main.ts` + `m0-controller-composition.ts` held as convergence hotspots. Sibling Writers stay read-only on a hotspot; **serialize only the colliding hotspot, not the whole Surface mission**. A newly discovered shared defect = `SAME_WAVE_SHARED_HOTSPOT_REBIND_REQUEST` (never a consumer-local fork, never automatic grounds for a generic Coverage Writer).
Why: the exact ownership map the Controller must reproduce for W01–W05.

**MIMO-K-047 · GlobalShellNavigationOwner — source location + role** · kind=implementation_detail · class=HISTORICAL_VALID
Source: `cep_repo/stack/native-typescript/foundation/global/shell/navigation.ts` (`export const GLOBAL_SHELL_OWNER='GlobalShellNavigationOwner'`; `export class GlobalShellNavigationOwner` line 60; `mountGlobalShellNavigation` line 322); tests `cep_repo/stack/native-typescript/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.ts` (`shell.search` owner assertion).
Owns global shell navigation mechanics; the Shell surface binds it as its sole navigation owner.
Why: exact seam for the Shell hotspot.

**MIMO-K-048 · StructuredPresentationBridge — source location + owner vector** · kind=implementation_detail · class=HISTORICAL_VALID
Source: `cep_repo/stack/native-typescript/foundation/structured/presentation-bridge.ts` (+ `foundation/structured/surface-host.ts`, `foundation/accepted-runtime.ts` render path, `w5-c-structured-consumer-parity-tests.ts`).
Canonical Structured presentation owner; the accepted-owner vector enforced across consumers is: tree=`StructuredTreeKernel`, mutation=`StructuredMutationKernel`, transaction=`StructuredTransactionHistoryRecoveryOwner`, selection=`StructuredSelectionKernel`, clipboard=`StructuredClipboardTrustOwner`, input=`StructuredInputKeymapOwner`, action=`StructuredActionDescriptorOwner`, direction=`InputDirectionResolver`, rich=`StructuredRichContentOwner`, drag=`StructuredDragDropOwner`, renderer=`StructuredBlockRenderer`, presentation=`StructuredPresentationBridge`, commands=`SEMANTIC_COMMAND_BUS_OWNER`, globalInput=`GLOBAL_INPUT_KEYMAP_OWNER`, navigation=`StructuredNavigationDescriptorOwner`. The parity test asserts all three consumers (Library/Learn/Sticky-class) share the identical owner vector and renderer↔bridge graph.
Why: the "no second editor engine" invariant is machine-checked here — Writer work must preserve this vector.

**MIMO-K-049 · BottomDeepWorkOwner — source location + contract** · kind=implementation_detail · class=HISTORICAL_VALID
Source: `cep_repo/stack/native-typescript/foundation/global/bottom-shelf.ts` (`export class BottomDeepWorkOwner`), `foundation/global/bottom-provider-contract.ts`, `foundation/wave3-assembly.ts` (owner list `GlobalInputKeymapOwner, AccessibilityFeedbackOwner, ContextInspectorHost, BottomDeepWorkOwner, UIScalePolicyOwner`).
BOTTOM shelf hosts provider-contributed deep-work content (`asBottomDeepWorkProvider()`; read result carries `sourceOwner`, `readOnly`, `ownsCanonicalContent`); domain BOTTOM must route through this owner (root finding CBF-003 is exactly its orphaning).
Why: RQ hotspot + CBF-003 fix seam.

**MIMO-K-050 · SpatialPresentationOwner — source location** · kind=implementation_detail · class=HISTORICAL_VALID
Source: `cep_repo/stack/native-typescript/foundation/spatial/presentation.ts` (`SPATIAL_PRESENTATION_OWNER_ID='SpatialPresentationOwner'`, descriptor id + scoped CSS); family set `['SpatialInteractionKernel','SpatialPresentationOwner','RelationInteractionOwner','SpatialSelectionNavigationKernel']` (`tests/rescue/CG2_SHARED_FAMILIES_COVERAGE/shared-family-coverage.test.ts`); Scenarios is the sole Writer for `foundation/spatial/presentation.ts` (HELPER_B_HANDOFF hotspot law), consumer forks forbidden.
Why: Scenarios hotspot seam.

**MIMO-K-051 · TimelineReplayOwner — source location + open ownership question** · kind=implementation_detail / hypothesis · class=CONFLICTED (open)
Source: `cep_repo/stack/native-typescript/foundation/timeline/replay.ts` (`export class TimelineReplayOwner` line 120; `TIMELINE_REPLAY_TRUTH_CLASSES=['DOMAIN_OWNED','FIXTURE_ONLY']`); `tests/rescue/S13_W03_RESULTS/results-rescue.test.ts` (asserts `domain.replayOwner.owner==='TimelineReplayOwner'`, `no second local replay state engine`, replay never executes runtime); `23_SURFACE_IDENTITY_MATRIX.md` adjudication #8.
Accepted `TimelineReplayOwner` exists while M0 Results carried local generic replay mechanics; future work must **rebind Results to the shared mechanic or explicitly retire the shared owner — never keep both** (A01-PF-007; hard authority precondition before final Results replay integration). HELPER_B adds: Results is sole Writer for `foundation/timeline/replay.ts` with real `PLAYING/PAUSED` states and no second replay engine.
Why: Results hotspot + one of the named shared owners; resolution is an explicit open decision.

**MIMO-K-052 · Operational/runtime shared owners (one-owner law)** · kind=implementation_detail · class=HISTORICAL_VALID
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §17.6; `HELPER_B_HANDOFF.md`; `cep_repo/stack/native-typescript/adapters/w03-enterprise.ts` etc.
One `OperationalSessionOwner`; xterm = canonical renderer where authority binds it; provider/runtime/semantic separation; `InternalSimulationAdapter` remains valid runtime truth; no fake PTY/PowerShell/SSH/native capability; truthful cancellation/rollback, first-mount output/subscription, terminal input/focus; OD-052 detach/reattach preserved; Windows/ConPTY/platform proof stays on independent gates.
Why: W03-Runs + W05 invariants.

**MIMO-K-053 · Duplicate-owner law + known duplicates** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §5/§5.0; `CURRENT_STATE.md` A5 audit entry; `cep_repo/assurance/DUPLICATE_MECHANIC_SCAN.json`, `tools/check-duplicate-mechanics.mjs`.
One canonical shared owner per mechanic; no consumer-local duplicate. A5 audit found genuine central owners coexisting with legacy/local bypasses (e.g. W04 local workbench chrome creating duplicate `SemanticCommandBus`/`TransientFocusOwner`/`ContextInspectorHost`) — these must not be replayed as shared mechanics. Strict DI must be verified at the highest composition actually instantiated (group compositions silently constructing `new SemanticCommandBus()`).
Why: defect class to hunt in every workspace reconstruction.

**MIMO-K-054 · Shared-hotspot conflict ledger pattern (TASK_A)** · kind=evidence · class=HISTORICAL_VALID
Source: `cep_repo/TASK_A_SHARED_HOTSPOT_CONFLICT_LEDGER.json`.
Example of the required collision-custody artifact: hotspot path + contributor lanes + resolution method (`SYMBOL_AND_BEHAVIOR_LEVEL_MERGE` / `SELECTOR/BLOCK_LEVEL_MERGE`) + preserved items + `zeroLoss: PASS` + `conflictMarkers: 0` + `wholeFileLaterSiblingOverwrite: false`.
Why: template for the collision ledger the serial milestones should emit when touching `accepted-runtime.ts`, `extensions.css`, `main.ts`, `m0-controller-composition.ts`.

## E. RCF (real-consumer vs fixture) — summary items (full detail in `RCF_AND_EVIDENCE.md`)

**MIMO-K-055 · Fixture consumers never prove reuse** · kind=requirement · class=HISTORICAL_VALID
Source: `READ_FIRST.md` PRESENTATION HARD STOP; register `OD-20260914-020`; `CONTROLLER_GOVERNANCE.md` §7 (lines 46730–47248).
Fixtures/demo/synthetic consumers may supplement tests but NEVER satisfy: real-consumer reuse proof, donor parity, second-consumer proof, donor cutover, Presentation acceptance. A fixture must be labeled `FIXTURE_ONLY`, never `PROVEN_BROWSER_CONSUMER`.
Why: core RCF law for all W01–W05 reuse claims.

**MIMO-K-056 · Qualified second-consumer definition** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §14 (lines 66797–69367).
Real Library/donor path consumes the extracted owner AND ≥1 genuine compatible non-Library path consumes the same owner; no consumer-specific patch may fabricate propagation; a bounded central change must visibly propagate to all claimed consumers; exact revert restores final source. A route is NOT a qualified second consumer merely because it is executable/browser-runnable/named `learn|visualize|runs`/in a Foundation proof host — it must be a current real non-fixture/non-demo product/runtime source path actually binding the same extracted owner. Fixture-backed routes, proof/workbench routes, synthetic data paths, descriptor/import-only paths, harnesses and simulation-only consumers are `NOT_YET_QUALIFIED_REAL_SECOND_CONSUMER`. On disagreement between auditors, use the stricter classification (never average).
Why: the precise admission test for "real consumer" claims in Writer proofs.

**MIMO-K-057 · Executable RCF markers found in product source** · kind=implementation_detail · class=CURRENT_EVIDENCE (of the historical tree)
Source: `cep_repo/stack/native-typescript/foundation/review/family-admission.ts` (lines 20–24), `foundation/review/decision.ts`, `adapters/library-fixtures.ts`, `adapters/w03-enterprise.ts`, `tests/rescue/S08_W01_W02_LIBRARY_LEARN/s08-falsification.ts`, `tests/rescue/S10_W03_ENTERPRISE/domain-and-lifecycle.test.ts`.
Machine-enforced RCF vocabulary: `REVIEW_AUDIT_REAL_CONSUMER_CANDIDATE_REQUIRED` (throws unless `routeKind==='PRODUCT' && consumerKind==='GENENUINE_REAL_PRODUCT' && domainImplementation==='REAL_PRODUCT_COMPOSITION' && candidateConsumerEvidence && !synthetic && !fixture && !contractOnly`), `REVIEW_AUDIT_PROFILE_CANNOT_CREATE_PROOF` (`profileUse==='READ_ONLY_EVIDENCE_NOT_PROOF'`), `realConsumerAccepted:false` until Controller admission; `REVIEW_DECISION_REAL_CONSUMER_STATUS='NO_QUALIFIED_REAL_SECOND_CONSUMER_IN_THIS_MISSION'`; `LIBRARY_FIXTURE_SOURCE_FORBIDDEN` falsifier; `FIXTURE_ONLY__NOT_PRODUCT_TRUTH` adapter classification with `canonicalProductTruth=false`.
Why: these are the exact assertions a Writer's real-consumer proof must satisfy/extend.

**MIMO-K-058 · Balanced6 acceptance seed is a governed fixture class** · kind=fact · class=HISTORICAL_VALID
Source: `cep_repo/stack/native-typescript/adapters/library-fixtures.ts`, `adapters/balanced6-acceptance-data.js`; `23_SURFACE_IDENTITY_MATRIX.md` adjudication #9; `corpus/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md` §4 (`SMOKE_3`, `ACCEPTANCE_BALANCED_6`, `FULL_ACCEPTANCE_10`).
Balanced6 = deterministic acceptance seed (6 KU / idempotency-restart / FTS / save / autosave / recovery checks). `libraryFixtureDescriptor()` labels it `realConsumer:true, role:'SOURCE_GROUNDED_BALANCED6_LOCAL_ACCEPTANCE'` — i.e. a **source-grounded acceptance seed**, explicitly not product truth for other claims. Balanced6 presence must be proven from exact candidate seed/provider evidence and never inferred from historical fixtures or an assurance DB.
Why: the boundary between "governed acceptance seed" and "fixture that cannot prove reuse".

**MIMO-K-059 · Data-sufficiency classes for any parity proof** · kind=requirement · class=HISTORICAL_VALID
Source: `corpus/CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §N; `CONTROLLER_GOVERNANCE.md` §17.3 binding #6.
Every reference-backed parity decision classifies data basis as `REAL_CURRENT_DATA | GOVERNED_ACCEPTANCE_SEED | TEST_ONLY_PRESENTATION_HARNESS | TRUTHFUL_EMPTY_UNAVAILABLE`. Never PASS a populated reference from an empty/unavailable screenshot; else `VISUAL_PARITY_NOT_ADJUDICABLE__DATA_COVERAGE_BLOCKED`.
Why: mandatory field in every W01–W05 visual proof.

**MIMO-K-060 · Genuine-route vs navigation-independent evidence** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` (line 93294); `CONTROLLER_SUCCESSION_HANDOFF.md` §11.
Navigation-independent rendering (`page.setContent`/in-memory transport of EXACT candidate bytes) is admissible as fresh current-candidate Presentation/interaction evidence **only** when classified `NOT_GENUINE_ROUTE`; it never closes genuine HTTP routing, Back/Forward, network or target-platform claims. Local backend state obtained by non-browser means may be injected with provenance preserved; fixtures/mocks never become Product truth. `NAVIGATION_FAILURE != RENDERING_FAILURE`.
Why: evidence-classification rule for browser work in this Codespace.

**MIMO-K-061 · Extraction seam & temporary compatibility law** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §§8, 8.1, 8.2 (lines 47761–55466).
If extraction needs `accepted-runtime`, `main`, donor CSS/DOM, final wiring or another shared hotspot: serialize the hotspot, assign one bounded explicit owner, or keep it Controller-owned — never forbid the real seam and accept a parallel module. Canonical authoring source / reproducible build seam must exist for donor-derived Presentation (hand-editing generated output is prohibited). A compatibility branch/host may remain during strangler-style extraction as rollback protection but is never a permanent second Presentation owner: `TEMP COMPATIBILITY → EXTRACT → REBIND LIBRARY → QUALIFY REAL SECOND CONSUMER → ZERO-LOSS PROOF → CUTOVER → RETIRE ONLY PROVEN DUPLICATE`.
Why: mechanics of any reuse work in W01–W05.

**MIMO-K-062 · Golden replay hard gate** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §13 (lines 64745–66284).
For any donor-derived component/mechanic, replay all applicable R3 P0 Golden scenarios on the **real current consumer path**; P0 loss without explicit newer Owner supersession = REJECT; Presentation-only changes still may not regress Golden interaction/behavior.
Why: regression bar for donor value.

**MIMO-K-063 · RCF evidence receipts present in the tree** · kind=evidence · class=HISTORICAL_VALID
Source: `cep_repo/stack/native-typescript/tests/rescue/CG1_CORR01_OD054_ACCEPTED_RUNTIME_SECONDARY_ROUTE/evidence/CG1_CORR01_OD054_BROWSER_PRODUCT_ROUTE_PROOF.json`; `cep_repo/assurance/MODEL_TEST_RESULTS.json`; `cep_repo/M0_A1_A5_FINDING_DISPOSITION.json`.
Example of a correctly classified RCF receipt: `"classification":"CANDIDATE_ONLY__REAL_PRODUCT_ACCEPTED_RUNTIME_ROUTE__NO_PROMOTION"`, browser `/usr/bin/chromium`, runtime build `CANONICAL_SOURCE_TO_GENERATED_ONLY`, 8/8 route-level interaction proofs (chooser vs direct-insert, non-editable gap no-mutation, Sticky always-editable) with per-case structural receipts.
Why: template for the evidence receipts Writer missions should emit.

## F. Known regressions, bugs, open gates, browser findings

**MIMO-K-064 · Open P0 findings CBF-001/002/003** · kind=fact · class=HISTORICAL_VALID (open)
Source: `CURRENT_STATE.md` (2026-09-24 post-C03 diagnostic audit entry); `cep_repo/cep-writer/KNOWN_OPEN_GATES.md`; `corpus/ZL02_CONTROLLER_RECONCILIATION.txt`.
`CBF-001` (P0): official Balanced6 persistence seed `section` type incompatible with current `StructuredTreeKernel` → D08/D13/D14 persistence class. `CBF-002` (P0): Back restores route but loses governed Surface semantic context → TODAY filter + VISUALIZE context + shared navigation owner. `CBF-003` (P0): domain BOTTOM content orphaned from `BottomDeepWorkOwner` on affected zero-provider Surfaces → RQ/BottomDeepWorkOwner + zero-provider surfaces. (Post-dates F-049/050.)
Why: M1/M2 mission scope must carry these three.

**MIMO-K-065 · Open P0/P1 findings F-049/F-050/F-051, MFC-PF-001..003, PVF-001..003** · kind=fact · class=HISTORICAL_VALID (open)
Source: `corpus/ZL02_CONTROLLER_RECONCILIATION.txt` §2; `cep_repo/cep-writer/KNOWN_OPEN_GATES.md`; `CURRENT_STATE.md` routing entries.
`F-049` Canvas removal leaks to TREE/PATH/GRAPH + `F-050` Canvas identity/grammar incomplete → Visualize (M2), authoritative route **D08→D13→D14 with D04 NO-TOUCH** (F-050 facets are sub-obligations, not new root findings). `F-051` evidence-receipt overcount → M4 EVIDENCE. `MFC-PF-001/002` Library local transient/focus keys beside `TransientFocusOwner`/`GlobalInputKeymapOwner` (F6 duplicate/fallback). `MFC-PF-003` SC-011 `PreferenceExportImportResetModel` not exposed through canonical Settings while a Library-local donor path remains. `PVF-001/002/003` P1 blocking major-state integration subfindings (Enterprise Twin/Baseline, Runs Preflight, Results AAR/Compare); `PVF-004` deduplicated into CBF-003. A03-PF-007/008/009 (Path/Graph/broad-Canvas parity) bind into GATE-020.
Why: complete open-finding inventory with owning surfaces.

**MIMO-K-066 · Open acceptance gates C03-GATE-020..024** · kind=requirement · class=HISTORICAL_VALID (open)
Source: `cep_repo/cep-writer/KNOWN_OPEN_GATES.md`; `corpus/ZL02_CONTROLLER_RECONCILIATION.txt` §6.
`GATE-020` visual region/state proof (base census 46/46 diagnostic; still open: Twin/Baseline + Runs Preflight + Results AAR/Compare integration, domain BOTTOM via shared owner, five post-F049/F050 Canvas proofs, 1024x900 lifecycle, DOM focus, fit/pan/zoom + canonical invariance, command-availability state/code matrix). `GATE-021` Windows/native target (automated Windows checks first; one Owner-device interactive run; plus fresh-checkout output-directory bootstrap). `GATE-022` genuine-browser exact-source receipt (needs fresh receipt bound to exact integrated D13 successor; stale browser API negative preflight + generated-runtime/source binding). `GATE-023` Shell destination authority (**Owner-authority-only**; keep five destinations + `destinationCountFrozen=false`). `GATE-024` product correction/integration (frozen obligation-level proof manifest required).
Why: what remains open at archive cutoff; gates map onto milestones.

**MIMO-K-067 · Owner interactive QA defect list (2026-09-17)** · kind=fact · class=HISTORICAL_VALID
Source: `corpus/OWNER_ENHANCEMENT_QA_BACKLOG.md` §6.1–§6.9; `CURRENT_STATE.md` (Owner interactive QA entry).
Sticky: reduced-editor vs full Structured parity; missing/ineffective vertical scroll; content-height non-responsiveness under resize; active-note z-order failure; insertion-gutter geometry collision; parent read-mode gating conflict. Input direction (OE-001): active keyboard/input-language not reflected in empty/new block direction/affordance (Windows). Runs/W03: Structure-pane resize-collapse drift (partial sliver is not a valid collapsed state), W03 studio/tool/action incompleteness, Ctrl/Cmd/Shift multi-block selection failures. Settings (OE-003/OD-053): active-group re-click does not close; hierarchy rejected for redesign; Settings vs Toolbar/Details duplication. Scroll: wheel/scroll excessively fast (only `MECHANISM_REPRODUCED`; tuning requires Owner wheel deltaY/deltaMode/cadence evidence — no arbitrary multipliers). xterm: `error loading dynamically imported module: /vendor/xterm/xterm.mjs` — root cause is the proof/static server (Windows separator-sensitive path validation + missing `.mjs` JS-module MIME), i.e. a **harness/evidence-carrier defect, not a terminal product defect**. Owner expects additional undiscovered defects → deep audits must not be defect-list-driven. Evidence: `OWNER_WINDOWS_E2E_20260917T062653Z.rar` (`1qJVuX442Oa_u5m7RzbnAHU5iyU32E4b8`), Sticky collision screenshot (`1ORixNZVSxLYLUvOankUAfbCArbAZ6A9C`).
Why: the concrete defect backlog any W01–W05 build must not regress.

**MIMO-K-068 · M0 A1–A5 finding disposition ledger (116 rows)** · kind=evidence · class=HISTORICAL_VALID
Source: `cep_repo/M0_A1_A5_FINDING_DISPOSITION.csv` / `.json`.
116 findings (A1=18, A2=38, A3=12, A4=18, A5=30) with `action` dispositions `FIX=88, PROVE_NOT_APPLICABLE=24, TRUE_BLOCKER=4`. The four TRUE_BLOCKERs are all target/environment evidence: Owner-device WheelEvent cadence; hosted-runner raw child-input consumption; independent real-Windows HWND/topmost/focus/bounds; Windows input-layout/native-window/ConPTY interactive proof. Controller source reproduction confirmed key claims (WorkspaceHost `setPreferredWidth` vs collapse-aware `resizeBy`; `settings.open` vs canonical toggle; Scenario validation mutating state from render/availability paths; W04 local shared owners; proof-server `.mjs` MIME/containment; terminal adapter lacking live output subscription/restart cursor reset).
Why: proven-vs-open defect census with exact owners/proofs.

**MIMO-K-069 · Per-surface legacy result dispositions (17 results; 0 verified successors)** · kind=evidence · class=HISTORICAL_VALID
Source: `corpus/CURRENT_RESULT_AUDIT.txt` (2026-09-27); `.openclaw/tmp/req/shell/CURRENT_RESULT_RETAIN_REJECT_MAP.csv`.
Drive results present 17 (SHELL, TODAY, LIBRARY, LEARN, RQ, RESULTS, RUNS, LABS, SCENARIOS, EVIDENCE, MASTERY, PORTFOLIO, HEALTH, PROCESSING, VALIDATION, MANUAL_AI, RELEASES); **6 surfaces had no durable result** (VISUALIZE, ENTERPRISE, REVIEWS, BACKUP, AUDIT, CONFIGURATION = `NO_DURABLE_RESULT` per explicit Owner clarification). `RECOVERABLE_VERIFIED_SUCCESSOR = 0`. 14/17 have source-bearing remote candidates; SHELL is patch-only (`RECOVERABLE_SALVAGEABLE_DELTA__DETERMINISTIC_REPLAY_REQUIRED`); LABS latest Phase-2 is patch-only (base `e86677c9…` + ordered patch, expected tree `ce474722…`); SCENARIOS is frozen-snapshot salvage with later WIP loss. HEALTH carries a **+3 TypeScript diagnostic regression** vs parent (six added HealthRuntimeAdapter `state` diagnostics minus three removed) = convergence blocker until corrected or proven non-material. RELEASES has a shared S19 test-contract blocker (missing injected `AnalyticalCompareOwner`) that must NOT be "fixed" with a local fallback. MANUAL-AI has 4 legacy shared-test failures expecting undeclared import authority (harness/oracle incompatibility, not a truth-boundary weakening). PROCESSING's legacy capability-proof tool is stale (retries without governed idempotency key). Most candidate visuals are "materially thinner than the CURRENT_FINAL_REFERENCE" (Presentation floor blocked).
Why: retain/reject/rebuild input for every milestone; shows what value must be salvaged vs rebuilt.

**MIMO-K-070 · Browser findings & receipts** · kind=evidence · class=HISTORICAL_VALID
Source: `CURRENT_STATE.md` (post-C03 diagnostic entries + C03_VISUAL/BROWSER census CORR02); `cep_repo/BROWSER_CONFORMANCE_BOOTSTRAP.md`; `assurance/BROWSER_CONFORMANCE_RECEIPT.json`; `baseline-check.log`.
Genuine-browser diagnostics: `46/46` direct route/viewport cases; `23/23` reload route identity at 1440×1000; `22 PASS / 0 FAIL / 1 N/A (Shell)` internal navigation Back/Forward carrier — diagnostic only, does NOT close GATE-022. Baseline capture census: `23/23` at 1440×1000, `22/23` at 1024×900 (missing: exact-current RQ 1024×900 after Corr01 changed RQ). Contract truth at Stage-2 integration: `165 PASS / 3 FAIL` where the 3 failures are inherited open browser-evidence checks (`browser.lineage_receipt_truthful`, `browser.current_candidate_claim_truthful`, `browser.targeted_visual_evidence`) = `C03-GATE-022` open. Browser conformance bootstrap: pinned `playwright@1.62.1`; `CEP_BROWSER_EXECUTABLE` override; `CEP_BROWSER_TRANSPORT=in-memory` test-only transport over the same built `dist/index.html`; six-flow bounded conformance proof is not an exhaustive matrix and not Owner acceptance.
Why: exact browser capability + receipt state for the current Codespace's browser lane.

**MIMO-K-071 · Harness vs Product separation precedents** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `corpus/ZL02_CONTROLLER_RECONCILIATION.txt` (A10/GATE-021/GATE-022 rows); `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §G/J.
Stale `tools/browser-conformance.mjs` referencing `CEPFoundation.operational.providerDescriptor.id` while ownership moved to `operationalSession` = harness defect (repair before GATE-022; no Product change justified by it). `tools/lane1-windows-native-terminal-falsification.mjs` writing into `assurance/lane1-windows-native-terminal/` without proving directory creation = fresh-checkout harness defect (GATE-021). Static/proof server ≠ local runtime; diagnose transport before naming CORS. Environment cause and Product degraded-mode quality are separate truths. A stale checker assumption can itself be a harness defect.
Why: failure-classification precedents for the current stack's tooling.

## G. Writer mission law, packet anatomy, acceptance logic

**MIMO-K-072 · Writer mission mandatory bindings** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §17 (compact line 392+).
Every mission must specify: exact parent bytes/hash/source; exact current-state/governance/Owner reads; exact target result; writable/read-only/prohibited paths; current collision/owner locks; true extraction seams (donor work); required reused owners; prohibited duplicates/substitutes; real consumers by exact path; positive + negative/falsification tests; Golden scenarios; state/viewport visual evidence; output destination; `CANDIDATE_ONLY / NO_SELF_PROMOTION`. Donor missions add: donor component inventory, extraction map donor-source→canonical owner→Library binding→second consumer, Library-domain-only exclusions, component evidence matrix, no fixture-only acceptance. Writers never update CURRENT_STATE, self-promote, widen scope, or use mocks as product truth.
Why: the checklist the new Controller must satisfy per milestone.

**MIMO-K-073 · Stage-3 hardened packet anatomy (the `req/` packets)** · kind=implementation_detail · class=HISTORICAL_VALID
Source: `.openclaw/tmp/req/shell/*`, `.openclaw/tmp/req/today/*` (HELPER-A outputs), `.openclaw/tmp/cep_mirror/MATERIALIZATION_AND_VERIFIER_PAYLOAD.json`.
Per-surface packet = `MISSION.md` + `ZERO_LOSS_OBLIGATION_MATRIX.csv` (352 SHELL / 359 TODAY rows) + `ACCEPTANCE_AND_FALSIFICATION_MATRIX.csv` (same row count; cols: obligation_id, directive, dimension, component, state, canonical_owner_or_dependency, positive_acceptance_evidence, negative_falsifier, proof_requirement, current_result_relation, stage3_result_disposition, stop_on_fail) + `APPLICABLE_OWNER_DECISIONS.csv` (74 SHELL rows) + `CURRENT_RESULT_RETAIN_REJECT_MAP.csv` (357 rows incl. legacy path evidence) + `SURFACE_PROFILE_AND_DOMAIN_CONTRACT.json` (profile + dataStatePolicy + sharedOwnerPolicy + resultTreatment + scopeCanonicalSha256) + `VISUAL_REFERENCE_AND_MAJOR_STATE_MATRIX.csv` + `SOURCE_VALUE_CROSSWALK.csv` (1,087 SHELL rows). `MISSION.md` carries a `SCOPE_CANONICAL_V1` block with byte-semantic scope + `SCOPE_CANONICAL_SHA256`, branch launch gate, output status, and a closed read set. Materialization classes: `NEW_FULL_CAPSULE_V1_1`, `DETERMINISTIC_EXACT_RECONSTRUCTION_REEXECUTION`, `EXACT_COMMITTED_BASE_PLUS_ORDERED_PHASE2_PATCH_RECONSTRUCTION`, `VERIFIED_CONTINUATION_V1`.
Why: the exact packet schema to reuse for M1–M5 missions.

**MIMO-K-074 · Zero-loss admission rule** · kind=requirement · class=HISTORICAL_VALID
Source: `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` §4/§6; `CURRENT_STATE.md` (2026-09-28 corpus-ingestion entry).
Every obligation row of a mission's surfaces must appear in that mission's acceptance matrix or carry explicit `NOT_APPLICABLE_JUSTIFIED`; a silently missing row is a zero-loss failure. Every mission covers ALL source layers (ZL01_DURABLE_ANCILLARY, ZL01_ROOT_FINDING, OWNER_DECISION, OWNER_QA_DEEP_AUDIT, ZL01_FORWARD_GAP, ZL01_ZL02_RECONCILIATION, identity/profile/visual) — defects are not the mission. No mission from chat memory alone.
Why: acceptance completeness rule for M1–M5.

**MIMO-K-075 · Obligation corpus schema (the zero-loss requirement unit)** · kind=implementation_detail · class=HISTORICAL_VALID
Source: `.openclaw/tmp/cep_mirror/corpus/STAGE2_OBLIGATIONS_MASTER.csv` + per-surface CSVs (schema verified).
Row = `obligation_id, source_layer, source_key, source_drive_id, source_row_id, authority_class, temporal_disposition, dimension, component, state, directive, obligation, canonical_owner_or_dependency, positive_test, negative_falsification_test, proof_requirement, reference_binding, current_result_relation, applicability_basis, applicability_confidence, source_excerpt, notes`. Per-surface counts: SHELL 352, TODAY 359, LIBRARY 375, LEARN 369, RQ 353, VISUALIZE 388, ENTERPRISE 412, SCENARIOS 439, LABS 441, RUNS 461, RESULTS 430, EVIDENCE 382, REVIEWS 355, MASTERY 353, PORTFOLIO 355, HEALTH 355, PROCESSING 361, VALIDATION 359, MANUAL_AI 352, BACKUP 354, AUDIT 345, RELEASES 354, CONFIGURATION 347 (total 8,651 master rows). `STAGE2_MANIFEST.json` records bytes+sha256 per file (verified per-file digests present).
Why: the requirement unit for every Writer acceptance matrix.

**MIMO-K-076 · Four-truths + product-quality bar for acceptance** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §12; `cep_repo/writer/AMBIGUITY_LINT_AND_SURFACE_CHECKLIST.md`.
Correctness alone is insufficient: product-specific authored UI; CENTER dominance; one information/action home; meaningful density/spacing/typography; restrained structural chrome; truthful microcopy; no fake dashboard; no card-wall/template smell; no synthetic canonical truth; no dev/proof leakage; responsive continuity; keyboard/focus/touch; reduced motion; high contrast/forced colors; RTL/LTR/Bidi; material non-default states. Reference recovery = value/intent recovery, not pixel cloning; historical/donor value gets explicit disposition `PRESERVE / RECOVER / RESTRUCTURE / ADAPT / DROP_EXPLICITLY / SUPERSEDED_BY_OWNER / NOT_APPLICABLE_JUSTIFIED`.
Why: the quality ceiling for W01–W05 deliverables.

**MIMO-K-077 · Ambiguity lint + Writer capsule template** · kind=requirement · class=HISTORICAL_VALID
Source: `cep_repo/writer/AMBIGUITY_LINT_AND_SURFACE_CHECKLIST.md`, `cep_repo/writer/WRITER_CAPSULE_TEMPLATE.md`.
12 lint rules: every mechanic has profile classification + reason (omission is a failing contract); distinguish conceptual admission vs source preservation vs executable binding vs tested behavior vs Owner acceptance; exact object/source-revision/representation/session/invocation identity (never merged); unavailable/empty/stale/error defined separately; one semantic owner per command with availability reason; every transient has visible + keyboard exit and deterministic focus return (persistent panes don't blur-dismiss); preferred/effective customization checked at desktop/medium/narrow/200% zoom (CSS zoom ≠ browser zoom); shared slots/styles (screenshot resemblance ≠ reusable ownership); UnifiedEditor for applicable working content incl. Learn/Notes; separate authored definition / runtime mutation / recorded output / evidence admission / review decision / Mastery; record real provider capability (terminal renderer ≠ provider); read the open-issues ledger before scope expansion (gap = Writer work, not an Owner question).
Why: pre-delivery self-check for each Writer result.

**MIMO-K-078 · Output contract & stop ceilings** · kind=requirement · class=HISTORICAL_VALID
Source: `cep_repo/cep-writer/ACCEPTANCE_GATES.md`; `READ_FIRST.md`; `MATERIALIZATION_AND_VERIFIER_PAYLOAD.json`.
Global stop ceilings: `CANDIDATE_ONLY / NO_SELF_PROMOTION / NO_MAIN_MERGE_BY_WRITER / NO_RELEASE / NO_DEPLOYMENT / NO_STACK_FREEZE / CONTROLLER_AUDIT_REQUIRED`. Writer PASS, screenshots, green tests, filenames, timestamps, workflow success or branch presence never create Product acceptance. Verifier gates for materialization: scopeCanonicalSha256, B0 source identity, git bundle exact commit, clean materialization before Product mutation, zero-loss packet hashes, branch collision gate, STOP gate. Legacy-branch gate: `LEGACY_REMOTE_BRANCH_OCCUPIED__CONTROLLER_RESET_OR_REBIND_REQUIRED_BEFORE_LAUNCH__WRITER_FORCE_PUSH_FORBIDDEN`.
Why: binding output law + the collision/branch gate for old `writer/surface-*` branches.

**MIMO-K-079 · PROTECTED_TRUTHS list** · kind=requirement · class=HISTORICAL_VALID
Source: `cep_repo/cep-writer/PROTECTED_TRUTHS.md`.
Preserve: exact Product-source identity/parent lineage; Save != Autosave != Recovery + durable settlement truth; stale-save/competing-revision atomicity; xterm renderer vs runtime/provider separation; InternalSimulationAdapter truth ceiling unless a real provider is admitted; W03 workspace-first semantics; W04 Evidence/Review/Mastery/Portfolio ownership boundaries; W05 domain/provider truth ceilings; Visualize representation identity ≠ canonical object identity; current RQ unavailable/provider truth (never refill with non-production fixture data); one canonical shared owner per mechanic; no fabricated provider/runtime/native/domain state; `main.ts` + `surfaces/m0-controller-composition.ts` serialized final-convergence hotspots.
Why: the immutable-preservation list for all five milestones.

## H. Operational lessons (summary; full detail in `OPERATIONAL_LESSONS.md`)

**MIMO-K-080 · Failure classification before Product change** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §13/§17.7; `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §G.
Classify every failure as `PRODUCT / HARNESS-ORACLE / ENVIRONMENT-PLATFORM / EVIDENCE-RECEIPT / PACKAGE-MANIFEST / PROVIDER-DATA / TRANSPORT-CUSTODY` before changing Product. Never mutate Product to satisfy a stale harness, broken receipt, absent provider, managed-runner limitation or package defect. A Writer STOP can be correct Writer behavior and still require Controller rebind/recovery. When a predecessor conclusion proves wrong: retract → root cause → repair canonical state/mission → re-read live state → continue.

**MIMO-K-081 · Review law (never trust surface signals)** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §14; `READ_FIRST.md`.
Never trust Writer PASS, prettier screenshots, green tests, branch presence or filenames. Result-first order: Writer → exact custody → identity/ancestry/scope → package/manifest → direct falsification → browser/runtime/visual → Owner-decision zero-loss → reuse/duplicate-owner → Data/Provider/Persistence → integrated regression → disposition. Keep CONTENT / PRESENTATION / BEHAVIOR / DOMAIN-DATA-PROVIDER separate.

**MIMO-K-082 · Drive-first lost-WIP law** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §10.
For a vanished worktree/commit: do not conclude loss from GitHub alone; inspect exact Surface folder, WRITER_OUTPUT, bounded children and artifact IDs from handoff/manifest/receipt. Recoverable Product custody requires source-bearing bytes (candidate/source ZIP, git bundle, exact snapshot or ordered reconstruction chain with verifiable identity); screenshots/logs/handoff prose/hash text alone = `EVIDENCE_ONLY__NOT_RECOVERABLE_PRODUCT_SUCCESSOR`. If no exact successor exists, OD-076 path C = new full capsule/base + RE-EXECUTE current zero-loss obligations. Never reconstruct lost source from chat memory.

**MIMO-K-083 · Local-first + post-download verification** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §G (capsule lessons).
Prefer `local edit → local test → local browser/render → local screenshot → compare → fix → repeat`; managed/remote only for genuinely unavailable capabilities or target-platform proof (Actions must not become the dev workstation). Workflow green is insufficient: artifacts must independently pass SHA/bytes, ZIP/CRC, standalone verifier, `git bundle verify`, materialization to exact HEAD/tree, clean worktree, Product identity and mission input verification. Product parent identity and transport identity are separate; never measure Product delta from the transport baseline.

**MIMO-K-084 · Correction continuity (no repackaging)** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §G "Correction continuity"; register `OD-20260922-076`.
Once a candidate is independently reconstructed/audited and retained as a salvageable correction base, prefer verified incremental continuation (same clean worktree, else deterministic reconstruction from nearest verified base + ordered delta/bundle chain + lightweight continuation overlay) instead of rebuilding a full capsule. Preserve every predecessor candidate immutably; emit successors; never overwrite or sibling-overlay.

**MIMO-K-085 · Succession closeout must transfer decision method** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §L.
A safe handoff transfers: live authority/identity; exact pending task + stop point; source-proven vs unproven findings; failure classification method; carrier separation; mission holds/locks; next diagnostic action; negative requirements and acceptance ceilings. Update stable succession files in place; don't create a new Owner decision merely because a chat changes.

**MIMO-K-086 · Deep-audit lessons (post-D05–D11)** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §O.
Finding-ID semantic drift is an evidence/control defect (a matrix row reusing `Axx-PF-xxx` for a different issue does not close the canonical finding). Domain-level success ≠ Product-command reachability (`domain.publish()` can pass while the composed Product command bus exposes no publish command). Normal Product defaults must never silently promote demo/fixture truth (`records=[]` → `demoInitial()` converts synthetic data into apparent real data). Strict DI must be verified at the highest composition actually instantiated. Harness parity ≠ normal-route parity. Reviewer verdict cannot outrank its own evidence (BLOCKED/PARTIAL evidence cannot become `VISUALLY_VERIFIED_CLEAN` without a new traceable chain). Preserve validated value while repairing narrow root causes (a later defect is not authority to revert an entire lineage). D12/D13/D14 semantics may be compressed into fewer missions but never deleted as gates.

**MIMO-K-087 · Repository cleanup / baseline-minimality lessons** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §I; `CURRENT_STATE.md` (2026-09-24 cleanup entries).
Stage-1 zero-loss cleanup ≠ final historical slimming; historical evidence reduction must be dependency-aware; governed visual references are not historical screenshots (28 governed reference PNGs kept in `cep-writer/references/visual/**`); current-tip size ≠ Git-history size; cleanup validation must preserve open truth gates. Recorded progression: 1,540 files → 1,517 (Stage-1) → 1,154 (Stage-2 content-forensic) with `ARCHIVE_GIT_HISTORY=364 files`, `KEEP_CURRENT=225`, `KEEP_TEST_RUNTIME_DEPENDENCY=35`, `KEEP_REUSABLE_DONOR_EVIDENCE=6`; Product source byte-identical throughout (`480dbe9d…/273`).

**MIMO-K-088 · Interactive runtime/performance lessons** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §J.
Static/proof server ≠ local runtime; diagnose transport before naming CORS; environment cause and Product degraded-mode quality are separate truths; performance acceptance must be explicit; full-reload routing is not proven acceptable merely because the destination is correct; source-proven first-paint layering must be reviewed as runtime behavior; runtime prerequisite defects can reorder work but must not silently widen missions.

**MIMO-K-089 · Carrier separation & git-native sync lessons** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §K/§M; `EXECUTION_CARRIER_ROUTE_AUTHORITY.txt` §1.
Mission/DAG scope and execution-carrier topology are independent; never copy `writer/cep-serial`, Kimi/local Windows details or task-specific no-push rules into another carrier without an explicit rebind. Git-native packet synchronization has Windows line-ending hazards (recorded 2026-09-25).

**MIMO-K-090 · Mission packet scope contradiction (debt flag)** · kind=operational_lesson · class=HISTORICAL_VALID
Source: `corpus/CURRENT_RESULT_AUDIT.txt` cross-cutting C.
Several machine-readable `CAPSULE_BINDING` scopes were broader than the prose `MISSION.md` wording; where the Writer followed the binding this is `MISSION_PACKET_SCOPE_CONTRADICTION` (mission-design debt), not Writer misconduct. Future packets must make prose and machine-readable scope identical.

## I. Implementation & historical context

**MIMO-K-091 · Repository identity & Product-source truth (strong corroboration)** · kind=fact · class=CURRENT_VALIDATED (corroborated)
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §2; `cep_repo/cep-writer/{START_HERE,WRITER_AUTHORITY_BASELINE,GIT_WORKFLOW,KNOWN_OPEN_GATES}.md`; `MATERIALIZATION_AND_VERIFIER_PAYLOAD.json`; `CURRENT_STATE.md` (Stage-2 integration entry).
Repository is **`hamad933/cep-writer-baseline-repo`** throughout the archive (no claim of a repo named "Cybersecurity-Education-Platform"; "Cybersecurity Education Platform — CEP" is the product name). Product source = `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641 / 273 files` — **matches the current canonical truth exactly**. Product-source ancestor commit `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a` / tree `3101c069…` (lineage only). Repo `main` at archive cutoff `37c4d765e1db854505c81cbd15b90d4715f6690e` / tree `57dbde7a…`. Node governed at **22.16.0** (`node2216/` toolchain; engines pin; a validation failure was classified ENVIRONMENT/HARNESS because Node was not pinned to 22.16.0) — matches current truth. Accepted DS01 seed branch `writer/ds01-global-data-sufficiency-seed@25a5f13c…` / tree `dd031592…` / Product `b8b5e4a5… / 289 files`, exact parent `48fec27608859d3a8e991b18b9f35f6e1dac1d19`.
Why: independent historical corroboration of the current repo identity, product hash and Node version.

**MIMO-K-092 · C03 provenance chain (A01–A17 → C01 → C02 → C03)** · kind=historical_context · class=HISTORICAL_VALID
Source: `CURRENT_STATE.md` (C03 entries); `corpus/ZL02_CONTROLLER_RECONCILIATION.txt` §1.
17 audit lanes (A01–A17) produced 102 source files → C01 normalization (1,975 source rows, 165 findings, 155 conservative clusters, 5 proven shared-root clusters) → C02 adversarial challenge → C03 synthesis (1,975-row final crosswalk, 718-row surface/component readiness, 98-row Owner decision matrix, 15-node DAG, 24 unresolved gates). Verdict: `SOURCE_ZERO_LOSS_THROUGH_C03__POST_C03_FORWARD_CONTROL_LAYER_REQUIRES_BOUNDED_RECONCILIATION`; all 23 surfaces were `NOT_READY` at C03; `NO_BROAD_WRITER_START`. ZL01 later preserved 735 ancillary rows + 69 gap rows (`ZL01_LOST_UNDERREPRESENTED_VALUE.csv`) and 66 routed-but-underspecified findings across D05–D11.
Why: provenance of every finding ID (A*/C*/F-*/CBF/MFC/PVF) referenced in Writer packets.

**MIMO-K-093 · Stage-2/Stage-3 preparation state at cutoff** · kind=historical_context · class=HISTORICAL_VALID
Source: `CONTROLLER_SUCCESSION_HANDOFF.md` §17.1–17.9; `CURRENT_STATE.md` (2026-09-27/28 Stage-3 entries); `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md`.
Stage-1 (plan/source universe) and Stage-2 (8,651 obligations + 3,497 crosswalk + 23/23 per-surface CSVs) COMPLETE as preparation coverage only. Stage-3 INCOMPLETE: Helper B delivered all 5 W03 sets (Enterprise 17/Scenarios 17/Labs 17/Runs 16/Results 16 artifacts); Helper D delivered 6 W05 sets (21 artifacts incl. `CAPSULE_V1_1_WORKSPACE_ARTIFACT.zip` verified via 6 GitHub Actions runs); Helper A 4 complete + RQ partial + VISUALIZE empty; Helper C partial with format deviation (native Google Docs/Sheets needing A03-style lossless normalization). `COMMON_AND_DAG` EMPTY (no shared-owner register, collision matrix, carrier map, DAG, prelaunch matrix or `23_SURFACE_LAUNCH_MAP`). Helper presence is never completion authority.
Why: explains what exists vs what the new Controller still owes; the MIMO rebind (K-024) then superseded the Stage-3 launch ceremony.

**MIMO-K-094 · W03 evidence: W03 v3.4 donor-only + semantic review receipts** · kind=evidence · class=HISTORICAL_VALID
Source: `baseline-check.log` (tail), `cep_repo/tools/extract-w03-v34.py`, `cep_repo/stack/native-typescript/adapters/w03-v34/*`.
Check receipt records `authority.w03-role: PASS — W03 v3.4 remains donor-only` and `w03.semantic_review_318: PASS (318 rows reviewed, 242 changed, 76 unchanged; bounded semantic-owner hardening of the existing compilation; no historical W03 archaeology or re-atomization)`.
Why: establishes W03's donor-only authority ceiling and the semantic-review baseline.

**MIMO-K-095 · UI-scale model-test evidence** · kind=evidence · class=HISTORICAL_VALID
Source: `baseline-model-tests.log` (tail); `OWNER_ENHANCEMENT_QA_BACKLOG.md` §2.
Model tests `w3e.ui-scale-pane-responsive-separation`, `w3e.ui-scale-no-surface-local-policy`, `w3e.ui-scale-style-projection` PASS as `MODEL_NOT_BROWSER`: scaled widths change while preferred/effective pane state + responsive band remain unchanged; consumer descriptors cannot introduce local scale policy; central CSS-variable projection emits geometry variables without CSS zoom/transform semantics. Owner: central UI Scale covers chrome/panes/controls/spacing/typography and stays separate from document/canvas zoom, density and responsive breakpoints.
Why: OE-002 acceptance shape for W01–W05.

**MIMO-K-096 · Library donor v1.2.17 accepted design reference** · kind=evidence · class=HISTORICAL_VALID
Source: `corpus/ACCEPTED_LIBRARY_DESIGN_REUSE_REGISTER.txt`.
`CEP_LIBRARY_EDITOR_EXECUTABLE_BLUEPRINT_v1.2.17_FINAL_BEST_CANDIDATE.html` (672,893 bytes, SHA-256 `ea66b58e…`) + accepted immutable design-reference copy (`1HMBrJNFggyR2B3Y0Rnb8RYNW2RxEjZuO`, read-back identical) classified `ACCEPTED_EXECUTABLE_DESIGN_REFERENCE / NOT_PRODUCT_SOURCE / NOT_RELEASE / NOT_FINAL_PRODUCT_ACCEPTANCE`. Writer evidence (9/9 reference+scroll, 41/41 regression+recovery) admitted as design-evidence inputs only. This register is the canonical project-knowledge owner for the donor's design/interaction/reuse knowledge.
Why: the donor baseline for Library/Learn/Structured reuse work.

**MIMO-K-097 · Persistence/SQLite/backup/AI-bridge technical direction** · kind=requirement · class=HISTORICAL_VALID (partially conditional)
Source: `corpus/CEP_RUNTIME_PERSISTENCE_BRIDGE_TECHNICAL_REFERENCE.md` (§§4, 9–14).
Deterministic acceptance datasets defined: `SMOKE_3`, `ACCEPTANCE_BALANCED_6`, `FULL_ACCEPTANCE_10`; Bidi/mixed-script QA input defined (§5). SQLite is a **strong candidate behind the persistence boundary, not frozen authority**; Save/Autosave/Recovery non-collapse is a dedicated law (§11); migrations+search (§12), Backup/Restore (§13), Manual AI Bridge import/export (§14) have durable boundaries. §14+ (2026-09-24): local proof server ≠ local runtime host (diagnostic clarification).
Why: W05 (Processing/Backup/Configuration/Manual-AI) technical constraints.

**MIMO-K-098 · Manual-AI / provider-truth invariants** · kind=requirement · class=HISTORICAL_VALID
Source: `corpus/23_SURFACE_IDENTITY_MATRIX.md` manual_ai row + A03; `CURRENT_RESULT_AUDIT.txt` MANUAL_AI.
Helper/DraftSink availability must be explicit; no false success when a sink/helper is absent; accepted output is a working draft only; no canonical publication claim; provenance equality gates import/review (exact prepared/exported source/revision/digests must match). Personal/local: no hidden AI provider execution.
Why: W05 Manual-AI truth ceiling.

**MIMO-K-099 · E19 rejected Presentation wave (REJECTED precedent)** · kind=decision · class=REJECTED
Source: register `OD-20260914-026`; `CEP_LIVE_GOVERNANCE_MANIFEST.json` (`rejectedE19PresentationPacket`).
E19 A/B/C/D Presentation candidates and `E19_PARALLEL_LANES_READY_FOR_CONTROLLER_CONVERGENCE` were rejected by Owner visual review; Lane F convergence forbidden; only independently adjudicated subordinate value salvageable. The packet remains "execution lineage/evidence only; never launch/converge as current Presentation authority."
Why: the only explicitly REJECTED-class item in the register; anti-pattern to avoid.

**MIMO-K-100 · Authoring-source / generated-output law** · kind=requirement · class=HISTORICAL_VALID
Source: `CONTROLLER_GOVERNANCE.md` §8.1.
A donor-derived extraction must identify the canonical authoring source or reproducible build/extraction pipeline; `dist/*`, bundled JS/CSS, extracted HTML, compiled artifacts or screenshots are evidence/runtime products, not authoring authority. Prohibited: hand-editing generated output and calling it a reusable canonical owner; leaving accepted donor DOM/CSS trapped in an opaque generated artifact while claiming extraction is complete; bypassing the real build/extraction seam. If donor Presentation exists only in generated form, the mission must create/identify a maintainable canonical source seam before cutover.
Why: governs how shared-mechanics extraction is done in this native-TS tree.

## J. Conflicts vs current truths (adjudication notes)

Current truths supplied by the Controller: (1) repo = `hamad933/cep-writer-baseline-repo` (NOT `Cybersecurity-Education-Platform`); (2) branch `writer/cep-serial @ 48fec276`; (3) canonical Product source `480dbe9d… / 273 files`; (4) Node 22.16.0 native-TS stack.

| # | Archive statement | Current truth | Verdict |
|---|---|---|---|
| X-1 | Repository is `hamad933/cep-writer-baseline-repo` everywhere (`cep_repo/README.md`, `cep-writer/START_HERE.md`, `MEMORY.md`, `MATERIALIZATION_AND_VERIFIER_PAYLOAD.json`). "Cybersecurity Education Platform — CEP" appears only as the **product name** (A01/A02/A03, mission packets). | same | **NO CONFLICT — corroborated.** No source in the archive names a repository `Cybersecurity-Education-Platform`. |
| X-2 | Product source `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641 / 273 files` (7+ independent sources incl. `START_HERE.md`, `GIT_WORKFLOW.md`, `KNOWN_OPEN_GATES.md`, `LIVE_AUTHORITY_SNAPSHOT.md`, `MATERIALIZATION_AND_VERIFIER_PAYLOAD.json`, `CURRENT_STATE.md` Stage-2 entry "Product source remains byte-identical"). | same | **NO CONFLICT — strong corroboration.** |
| X-3 | Node governed at **22.16.0** (`node2216/` toolchain; `CURRENT_STATE.md` "Node was not pinned to the governed 22.16.0" = ENVIRONMENT/HARNESS failure; `EXECUTION_CARRIER_ROUTE_AUTHORITY.txt` "Node: v22.16.0, npm 10.9.2"); Product stack = `stack/native-typescript/**` with node:sqlite / @xterm/xterm / Win32 sidecar / Playwright 1.62.1. | Node 22.16.0 native-TS stack | **NO CONFLICT — corroborated.** |
| X-4 | **Branch law carries two names:** `OD-20260924-080` = one stable `writer/cep-serial` (ROUTE-LOCAL lane, created from exact Controller-bound `main`); `OD-20260928-085` = one candidate branch `writer/mi-serial` **created from exact parent `main@37c4d765e1db854505c81cbd15b90d4715f6690e`** (ROUTE-MIMO-AGENT lane), with `OD-20260924-081` forbidding cross-carrier inference. | branch `writer/cep-serial @ 48fec276` | **CONFLICTED / needs reconciliation.** The archive (2026-09-27/28) predates the 2026-09-29 Owner hard rule that chains `main → writer/cep-serial → writer/mi-serial`. OD-085 says `mi-serial` is created **from main@37c4d765**, not from `cep-serial`. Notable coincidence: `48fec27608859d3a8e991b18b9f35f6e1dac1d19` is recorded in the archive ONLY as the exact parent of the accepted DS01 branch (`25a5f13c…`'s parent) — so the current `writer/cep-serial` tip equals a historical commit the archive knows, but the archive never describes `writer/cep-serial` as being at `48fec276`. Adjudicate the branch-creation parent against the Owner hard rule before dispatch. |
| X-5 | Owner-decision counts: `CURRENT_STATE.md` says "98 current (96 ACTIVE + 2 ACTIVE_PLATFORM_GATED); 105 total register rows (3 SUPERSEDED_DUPLICATE + 4 COMPLETED…)"; `MISSION_PREPARATION_ZERO_LOSS_KNOWLEDGE_INDEX.md` says "111 rows | 96 ACTIVE + 2 ACTIVE_PLATFORM_GATED". | Controller's open conflict C-4 (count drift) | **CONFLICTED — resolved by direct re-parse:** the CSV has **111 rows = 101 ACTIVE + 2 ACTIVE_PLATFORM_GATED + 4 SUPERSEDED_DUPLICATE + 4 COMPLETED_TASK_SPECIFIC_NON_DURABLE** (and `REGISTER_REREAD.csv` is byte-identical). The "96 ACTIVE / 105 rows" figures are stale in-place-update lag; the "111 rows" figure is current. `STAGE2_OWNER_APPLICABILITY.csv` (102 rows) is the applicable subset. Use 111/101/2/4/4. |
| X-6 | `req/shell/MISSION.md` / `req/today/MISSION.md` bind `executionCarrier=ROUTE-CHATGPT`, `candidateBranch=writer/surface-w01-shell`, `materializationClass=NEW_FULL_CAPSULE_V1_1`, and a branch gate `LEGACY_REMOTE_BRANCH_OCCUPIED…`. | current model = one serial branch, no capsules | **SUPERSEDED (not conflicting):** Stage-3 packet ceremony was retired as a launch gate by OD-20260928-085; the packets' requirement content (obligation matrices, acceptance matrices, profiles) stays binding. |
| X-7 | `HELPER_D … the canonical CAPSULE_V1_1 containing repo.bundle was NOT materialized` (2026-09-27 early) vs later entry: "Earlier wording … is now stale … independently corroborated … all six build-capsule jobs success". | — | **INTERNAL SELF-CORRECTION, resolved inside the archive** (later entry wins; documented as a stale-gap correction). |
| X-8 | Accepted DS01 Product identity `b8b5e4a5… / 289 files` and B0 `25a5f13c… / dd031592…`; current canonical is `480dbe9d… / 273`. | 273 files | **NOT A CONFLICT:** different baselines (DS01 seed era vs Stage-2 cleanup era); the archive itself records both and states Product source "remains byte-identical at 480dbe9d…/273" after the later cleanups. |
| X-9 | RQ reference ceiling `REVIEWED_FINAL_CANDIDATE` while most surfaces are `OWNER_CONFIRMED_FINAL_REFERENCE`; Processing has no reference by design. | — | **Internal ceiling, documented** — carry as a per-surface truth ceiling, not a defect. |
| X-10 | `destinationCountFrozen=false` with five Shell destinations as functional baseline. | — | **Open authority question (K-044)** — must not be silently frozen by Writer work. |

## K. Register summary

- **Total knowledge items recovered: 100** (`MIMO-K-001` … `MIMO-K-100`).
- By kind: requirement 32 · decision 21 · operational_lesson 14 · fact 11 · implementation_detail 12 · evidence 11 · historical_context 3 · rationale (embedded) · hypothesis 1 (items may carry a secondary kind).
- By classification: HISTORICAL_VALID 84 · CURRENT_EVIDENCE/CURRENT_VALIDATED 6 · CONFLICTED 3 · CANDIDATE 1 · REJECTED 1 · HISTORICALLY_USEFUL_BUT_SUPERSEDED 5 (embedded in K-024, K-034, X-6 rows).
- Unread/partially-read sources are listed in `ARCHIVE_INVENTORY.md` §6.

### The 10 most valuable items

1. **MIMO-K-025** — five-workspace milestone map (M1=W01 … M5=W05, 23 surfaces exactly once) — the requested W01–W05 mapping, Owner-bound.
2. **MIMO-K-018** — extraction-not-reimplementation + the forbidden `READ DONOR → PARALLEL LOOKALIKE → FIXTURES` pattern — the core reuse law.
3. **MIMO-K-056** — the qualified second real-consumer definition (`NOT_YET_QUALIFIED_REAL_SECOND_CONSUMER`) — the exact RCF admission test.
4. **MIMO-K-046** — shared-hotspot delegation map (5 named shared owners + `main.ts`/`m0-controller-composition.ts`/`w04-rescue`/`w05-rescue` seams).
5. **MIMO-K-015 + X-5** — re-parsed Owner-decision register (111 = 101+2+4+4), resolving the count-drift conflict.
6. **MIMO-K-010** — the 15-step mandatory Controller review chain (acceptance logic).
7. **MIMO-K-073/075** — Stage-3 packet anatomy + obligation-corpus schema (the requirement unit for every mission).
8. **MIMO-K-064/065/066** — complete open-findings + open-gates inventory (CBF-001..003, F-049/050/051, MFC-PF-001..003, PVF-001..003, GATE-020..024) with owning surfaces.
9. **MIMO-K-069** — per-surface legacy-result dispositions (17 results, 0 verified successors, exact salvage classes + Health +3 diagnostics blocker).
10. **MIMO-K-086** — deep-audit lessons (finding-ID semantic drift, domain-success ≠ command reachability, fixture-truth promotion, top-composition DI, harness≠route parity, verdict ≤ evidence).










