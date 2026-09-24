# CEP — Runtime / Persistence / Bridge Durable Technical Reference

**Classification:** `DURABLE_TECHNICAL_REFERENCE__NOT_CURRENT_STATE__NOT_STACK_FREEZE__NOT_EXECUTION_AUTHORITY`
**Source provenance:** zero-loss distillation of archived `CEP_RUNTIME_PERSISTENCE_BRIDGE_STACK_WORKING_MEMORY_20260914.md`.
**Dynamic authority rule:** resolve all current mission/state/accepted implementation/Owner decisions from the live Controller chain. Nothing in this file authorizes a Writer, selects a final stack, or overrides current accepted source.

## 0. Controller lookup contract / anti-loss index

This file is the **primary durable CEP-specific technical reference** for runtime, persistence, SQLite/schema, local/OS bridge, Operational/Terminal, xterm renderer, platform-window capability and related deferred/admission reasoning. It must be read under `OD-20260916-045` whenever those subjects materially affect readiness, mission design, dependency admission or acceptance.

Use with, never instead of:
- live `CURRENT_STATE.md` + live Owner Decision register for current authority;
- exact current accepted source/package for implementation truth;
- `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER_v1.0.md` for cross-project correction and durable deferral lessons;
- archived `CEP_RUNTIME_PERSISTENCE_BRIDGE_STACK_WORKING_MEMORY_20260914.md` only for deeper provenance/detail that this distillation intentionally omits;
- exact historical Wave evidence (for example OperationalSession/StickyNote work) only to explain why a capability was bounded/deferred, never to resurrect stale status.

Do **not** replace this lookup with `DEPENDENCY_INVENTORY`, `package.json`, an enhancement backlog, filename search results, or a cross-project stack memory. Those can locate clues but cannot alone classify a capability.

Mandatory extraction when this reference is consulted:
1. semantic/presentation owner that must remain authoritative;
2. proposed technology/provider role (what it may own and what it must not own);
3. exact current implementation status from accepted source;
4. bounded proof/admission gate;
5. reason for prior deferral or bounded maturity;
6. real consumer(s) required before generalization;
7. target-platform proof required (especially Windows);
8. truth ceiling / unavailable behavior;
9. provenance/source references.

Key distinctions that must not be collapsed:
- `xterm.js` is the selected canonical Terminal I/O **renderer/carrier** for Internal Simulation, real PTY/ConPTY shells, recorded/read-only playback and future compatible providers; provider/runtime semantics remain separate.
- `CEP internal pin` is not OS always-on-top; native detached window / OS pin requires a real `PlatformWindowCapability` and Windows target proof.
- Operational Terminal concepts already include tabs/split/dock/float/move-resize/attachment-pinning where justified; full generalized attachment/native-window behavior was intentionally not fabricated before real-consumer proof.
- SQLite is a strong local persistence candidate, not frozen authority; driver/schema/save-recovery/import decisions remain behind bounded Gates A-C and current semantic owners.
- Node/TypeScript local runtime is the lowest-complexity baseline. Avoid a giant semantic backend for ownership/maintainability reasons, not for security; process/shell capability may be as unrestricted as functionally useful under `OD-20260917-050`.

## 1. Project identity and dependency admission

CEP is a personal/local/single-owner knowledge, study and simulation environment. Do not import multi-tenancy, organization switching, account/RBAC ceremony, cloud orchestration, microservice or commercial-SaaS complexity without an actual current requirement.

Dependency admission heuristic:

`MEASURED COMPLEXITY REMOVED > DEPENDENCY + LOCK-IN + COMPLEXITY INTRODUCED`

Prefer the simplest reliable tool that produces the required functionality, compatibility, data integrity and quality. Exact historical versions are not goals by themselves.

## 2. Architecture boundary that runtime/persistence must respect

Preserve:

`Foundation semantic/state owner → provider/adapter contract → local runtime capability → external system / SQLite / OS`

Avoid:

`UI component → direct SQLite / direct OS / direct shell calls`

Database, bridge, terminal renderer, filesystem helper or OS helper must not replace semantic owners.

## 3. Canonical content / runtime import guard

These are independent truths:

- `SOURCE CONTENT AVAILABLE != CANONICAL RUNTIME IMPORT AUTHORIZED`
- `ACCEPTED KNOWLEDGE IDENTITY != LEGACY RUNTIME ID MAPPING`
- `RECOVERED CONTENT != CURRENT DATABASE SCHEMA`
- `LEGACY SQLITE EXPORT != CURRENT CEP PERSISTENCE MODEL`

Recovered/accepted knowledge may contribute content, identity, provenance and relationships. Preserve original identity/provenance. Never silently inherit old route/module/database mappings. A canonical SQLite import requires a current mapping/adjudication gate.

## 4. Deterministic acceptance data

Prefer small, rich, deterministic, resettable real-contract acceptance data over large random/fake corpora.

Historical useful candidate profiles:

### `SMOKE_3`
- `KU-D03-0004`
- `KU-D05-0021`
- `KU-D09-0002`

### `ACCEPTANCE_BALANCED_6`
- `KU-D03-0001`
- `KU-D03-0004`
- `KU-D03-0011`
- `KU-D05-0021`
- `KU-D05-0023`
- `KU-D09-0002`

### `FULL_ACCEPTANCE_10`
- `KU-D03-0001`
- `KU-D03-0004`
- `KU-D03-0008`
- `KU-D03-0011`
- `KU-D05-0015`
- `KU-D05-0017`
- `KU-D05-0021`
- `KU-D05-0022`
- `KU-D05-0023`
- `KU-D09-0002`

Classification only:
`LOCAL_DEV_ACCEPTANCE_SEED__DETERMINISTIC__RESETTABLE__NON_PRODUCTION`.

These IDs are candidates, not automatic canonical DB seed authority.

Controller/preparation owns selected real source identities, fixture profile/count, provenance, classification and allowed semantic claims. A Writer may adapt payloads to current contracts but must not invent canonical mappings, silently change KU IDs, broaden the corpus or promote test/dev seed to canonical persisted truth.

## 5. Bidi / mixed-script QA input

Browser QA should cover Arabic containing English, English containing Arabic, Arabic→English→Arabic on one line, IDs, URLs, paths, timestamps, versions, brackets/slashes/punctuation, inline code/code blocks, links/citations, wrapping, caret navigation, Home/End, Shift+Arrow, mouse selection, Backspace/Delete at direction boundaries, rich/plain paste, Undo/Redo, keyboard-language switching and persistence/reload/recovery without logical-order corruption.

This is QA input, not a fixed Arabic-first/RTL product law.

## 6. Operational / terminal durable boundaries

`InternalSimulationAdapter` is a valid runtime provider and must remain provider-neutral. Terminal output must derive from canonical simulated device state; no canned output disconnected from state.

Causal pattern:

`User command → SemanticCommand → RuntimeAdapter → provider → canonical state → subscribed representations + truthful terminal output`

A terminal renderer never owns command semantics or canonical state.

### xterm.js role — canonical shared Terminal renderer/carrier

Canonical role:
`OperationalSessionOwner / TerminalSurface → TerminalRendererAdapter → xterm.js → terminal I/O presentation`

This role was already recovered in historical CEP working memory: xterm is not tied to Real Terminal. It renders Internal Simulation, simulated/synthetic CLI, real PTY/ConPTY shells, SSH carried through a terminal stream, and recorded/read-only terminal playback. Real PTY is not a prerequisite for xterm; xterm is also not the runtime/command owner.

It may own rendering, cursor, selection, keyboard capture, scrollback, ANSI/VT presentation, resize exchange and copy/paste. It must not own semantic commands, canonical simulated state, process creation, PTY/SSH lifecycle or persistent CEP session/tab identity.

### Current Owner supersession — OD-20260917-049

The prior wording that treated xterm and real PTY/process support as indefinitely optional is superseded for the final CEP stack by `OD-20260917-049`. Current durable direction is:
- `xterm.js` is the canonical Terminal I/O Presentation renderer required on the real Operational terminal consumer before stack freeze;
- real shell sessions use a provider-neutral terminal byte/keystroke stream with **no CEP-side command allowlist/parser** and no per-command provider model;
- provider/session boundaries exist for lifecycle, identity, routing, resize, exit/error/restart and truthful capability state. Under `OD-20260917-050` they are **not security gates** and must not restrict Owner-selected commands, executables, shell profiles, providers, local/remote scope or transport merely for security reasons;
- one Windows PTY/ConPTY provider should serve PowerShell, `cmd.exe` and other installed shell profiles; tools executed inside those shells do not each require a CEP provider;
- SSH may initially run through the same PTY stream using the system SSH client, while a specialized SSH provider is optional only if later connection-management semantics materially justify it;
- `InternalSimulationAdapter` remains a separate valid provider and is not replaced by the real PTY provider;
- before `STACK_FROZEN`, prove raw I/O, resize exchange, exit/error/restart, session identity/lifecycle and truthful unavailable/failure behavior on Windows.

## 7. Local runtime / bridge direction — provisional

Lowest-complexity baseline candidate, because current accepted implementation is Native TypeScript/Node-oriented:

`Browser CEP UI → bounded local runtime transport → Node.js/TypeScript Local Runtime Host → capability-specific providers`

Avoid one giant backend that owns product semantics.

Potential capability boundaries:
- `PersistenceCapability`
- `BackupRestoreCapability`
- `FilesystemCapability`
- `PlatformWindowCapability`
- `PlatformInputDirectionCapability`
- `ImportExportCapability`
- optional/general `ProcessRuntimeCapability` when useful; no security-driven command/executable allowlist
- required pre-freeze `TerminalRuntimeCapability` with Windows PTY/ConPTY plus the shared xterm renderer

Every capability must advertise truthful availability and deterministic request/result state. Those boundaries are engineering/lifecycle contracts, not security restrictions.

Python is not prohibited; it is a specialized helper/provider candidate only when it materially wins. Do not introduce a second application runtime by default.

Process execution is not a baseline requirement merely because a bridge exists.

Filesystem access is justified only where it materially serves durable path control, backup/restore, package generation/validation, canonical import/export, runtime data, watching or controlled artifact access.

## 8. Platform capability truth

### Sticky Notes / windows

`CEP_INTERNAL_PIN != OS_ALWAYS_ON_TOP`

Without a real platform provider:
`OS_ALWAYS_ON_TOP = UNAVAILABLE`

Separate native windows and OS always-on-top require a genuine platform-window provider. A normal browser tab plus Node local host does not magically create Windows HWND authority.

Preferred generalization path:
1. narrow `PlatformWindowCapability`;
2. prove the Sticky Notes consumer;
3. prove real Windows behavior;
4. generalize only after a second real consumer shares the same semantics.

Do not adopt Electron/Tauri solely for one native-window feature without measured justification.

### Input direction

A platform input-direction hint may inform empty-input initial direction where available. Explicit persisted direction is stronger. Do not infer semantic language from content.

## 9. Persistence — SQLite as a strong candidate, not frozen authority

The Foundation already owns save/history/recovery semantics. A persistence provider should implement them rather than reinvent them.

Conceptual path:

`StructuredTransactionHistoryRecoveryOwner → Save/Persistence Boundary → Persistence Client → Local Runtime → SqlitePersistenceAdapter → SQLite`

SQLite is attractive for CEP because it is local, single-owner, transactional, relational, service-free, inspectable, backup-friendly and supports FTS5.

Driver must remain behind a `SqliteConnectionAdapter`.

Historical proof observed `node:sqlite` functionality including FTS5/backup, but target maturity must be re-proven on the actual Owner environment. Bounded comparison candidate:
- `node:sqlite`
- `better-sqlite3`

Use one driver, not multiple simultaneous abstractions. Do not add an ORM merely to hide a small SQL layer.

Recommended SQL model:
`DIRECT SQL + SMALL EXPLICIT DATA ACCESS LAYER`

Use prepared statements, transactions, foreign keys, explicit capability/domain adapters and deterministic migrations. Data-access boundaries should reflect Foundation/domain contracts rather than table aesthetics.

## 10. Provisional schema v1 direction

Do not model all 23 surfaces speculatively. Start from proven cross-cutting truths.

Candidate structures:
- `schema_migrations`: version/name/checksum/applied_at; deterministic and immutable after acceptance.
- `app_metadata`: schema/data-format/application-lineage metadata.
- `structured_documents`: semantic TEXT document identity; current committed revision pointer; provenance/source fields where admitted.
- `structured_revisions`: immutable committed revisions, parent/supersedes, canonical content, digest, format version, provenance, reason, timestamp.
- `structured_working_drafts`: working/base revision, content, digest, autosave, dirty truth.
- `structured_recovery_points`: recoverable snapshots with base/working revision, digest, timestamp and reason.
- `note_bindings`: binding/provenance identity separate from note content.
- `preference_values`: only genuinely durable preferences; `preferred != effective responsive`.
- `navigation_bookmarks`: route/object/selection/scroll/return-origin context where justified.
- FTS5 as a rebuildable derived index, never canonical truth.

Do not remap KU identities into opaque legacy numeric IDs.

## 11. Save / Autosave / Recovery non-collapse

### Explicit Save
Expected semantics:
1. expected base committed revision;
2. transaction;
3. verify current committed revision;
4. stale/conflict rejects atomically;
5. new immutable committed revision;
6. current pointer update;
7. derived-index update;
8. success only after actual DB commit.

### Autosave
Persist working/draft state. Never falsely become canonical committed Save.

### Recovery
Persist/retrieve recoverable working snapshots. Restore returns a working state; a later explicit Save creates a new committed revision.

`AUTOSAVE != EXPLICIT SAVE != RECOVERY`

## 12. Migrations and search

Provisional migration direction:
small repository-native numbered SQL migration runner with checksums, history, deterministic clean init/reset and immutable accepted migrations. No migration framework until complexity proves need.

FTS5 role:
local derived search index, rebuildable from committed truth.

Acceptance must include Arabic, English, mixed-script, technical IDs/tokens, required prefix/phrase behavior and rebuild correctness.

## 13. Backup / Restore

Never blindly copy an actively written SQLite file and call it a verified backup.

Preferred pattern:

`SQLite Online Backup → DB snapshot → package → manifest → checksums → schema/data-format metadata`

Restore:

`select package → isolated staging → integrity/foreign-key/migration/checksum validation → restore drill/readback → explicit activation gate`

`STAGED_AND_VERIFIED != LIVE_RESTORED`

## 14. Manual AI Bridge / Import-Export

Useful product model:
- export prompt/package;
- user obtains AI result externally;
- import result;
- technical validation;
- preserve provenance;
- human review;
- accept as draft or reject;
- no hidden provider call;
- no automatic canonical publication.

A bounded local runtime may assist package generation/checksums/filesystem export/import validation/archive extraction.

## 15. Capability breadth after Owner supersession

Historical CEP guidance deferred generic shell/process/SSH/remote capabilities because no proven consumer required them and to avoid unnecessary architecture. That **deferral rationale was about value/complexity and must not be reused as a security restriction**.

Current Owner law (`OD-20260917-049` + `OD-20260917-050`):
- xterm is the common renderer for simulation and real terminal modes;
- at least one real Windows PTY/ConPTY provider is required before stack freeze;
- once a real terminal session exists, the Owner may select arbitrary installed shell/executable profiles and send unfiltered terminal input;
- PowerShell, `cmd.exe`, WSL/Git Bash and tools launched inside them do not require per-command providers;
- SSH may simply run through the same PTY stream using the system client; a specialized SSH provider is optional only for richer connection-management semantics;
- generic ProcessRuntime, remote, Docker/VM/WSL or other capabilities may be admitted whenever they materially improve the personal product. **Security alone may not be used to reject or delay them.**

Still avoid unnecessary architecture when it adds complexity without functional value. Internal Simulation remains independently valid and uses the same xterm-backed presentation.

## 16. Target-proof boundary

A generic ChatGPT/Linux browser environment can prove contracts, state truth, delegation, failure behavior, simulated runtime, web UI behavior and many persistence semantics.

It cannot certify actual Windows:
- OS always-on-top / HWND behavior;
- detached native window integration;
- ConPTY/PowerShell PTY desktop behavior.

Those require `WINDOWS_TARGET_E2E_PROOF` on the Owner machine or controlled Windows runner.

## 17. Proposed baseline direction — REQUIRES CURRENT ADJUDICATION

Strong historical candidate set, not a stack freeze:
- Application/Foundation: Native TypeScript
- Local runtime host: Node.js + TypeScript
- Transport: simplest local HTTP is the current baseline for simplicity/compatibility; WebSocket only for materially streaming use. Loopback is not a security-mandated product restriction under `OD-20260917-050`; broader/local-remote transport may be admitted when functionally useful.
- Persistence: SQLite
- SQL: direct SQL + small explicit adapter layer
- Search: SQLite FTS5
- Migrations: small numbered SQL runner
- SQLite driver: bounded target proof between `node:sqlite` and `better-sqlite3`
- Terminal renderer: xterm.js
- OS/native window: separate platform capability provider
- Python: specialized helper/provider only when materially beneficial

Not selected merely by historical memory:
FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis, Celery, RabbitMQ, graph DB, Elasticsearch, Tauri, Electron, Docker as app-runtime requirement, microservices, multi-user auth.

## 18. Bounded proof/adjudication backlog

These are proof candidates, not launch authorizations:
- SQLite driver target proof
- schema v1 review against accepted owners/contracts
- Save/Autosave/Recovery real provider proof
- xterm + InternalSimulationAdapter renderer proof
- minimal Node/TS local runtime/transport proof
- Windows PlatformWindow spike
- xterm real Operational consumer + Windows PTY/ConPTY provider proof under `OD-20260917-049` before stack freeze; PowerShell/`cmd.exe` are provider profiles and SSH may reuse the same PTY stream

## 19. Controlled data-import stages

1. bounded deterministic development/acceptance fixtures;
2. real persistence proof on a small current-contract subset;
3. canonical runtime import gate with source/target identity, provenance, hash, revisions, relations, conflicts, unsupported fields and rejected legacy mappings;
4. controlled canonical import.

Never perform `legacy DB → current DB` directly without adjudication.

## 20. Writer / audit consequences

A Surface Writer must consume accepted Foundation contracts. It may not invent private persistence, localStorage/IndexedDB/JSON truth, direct SQL bypass, fake Save, a second Operational session/tab owner, local terminal parser or native provider.

Independent review of runtime/persistence work should test:
- exact reused owners and no duplicate state/command/session engines;
- real persistence readback;
- stale conflict atomicity;
- restart/autosave/recovery truth;
- truthful capability AVAILABLE/UNAVAILABLE states;
- renderer vs command/provider ownership;
- canonical provider-state-linked terminal output;
- exact candidate identity, browser/negative proof and fresh extraction.

## 21. Provenance

Raw source working memory is preserved unchanged in archived shared-input custody:
`/Google Drive/cep_building_mgm/90_ARCHIVE/SUPERSEDED_SHARED_INPUTS_20260914/01_SHARED_INPUTS_HISTORICAL_PRE_RESCUE_20260914/CEP_RUNTIME_PERSISTENCE_BRIDGE_STACK_WORKING_MEMORY_20260914.md`

This distilled reference intentionally removes:
- obsolete `/cep_building_mgm` live-root authority;
- versioned `CURRENT_CONTROL_v3.18` state;
- old E19 mission sequencing;
- environment-specific observations as permanent guarantees.

Use current Controller authority before promoting any provisional technical direction.
