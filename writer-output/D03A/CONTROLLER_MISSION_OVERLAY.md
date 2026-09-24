# D03A — CONTROLLER MISSION OVERLAY (BOUND COPY)

Classification: `CONTROLLER_BOUND_D03A_OVERLAY_COPY__READ_ONLY_AFTER_MATERIALIZATION`

## Identity
- Mission: D03A — COMMAND AND SETTINGS OWNER CONVERGENCE
- Branch: `writer/cep-serial` (OD-20260924-080 serial one-persistent-Writer mode)
- Exact parent HEAD: `37c4d765e1db854505c81cbd15b90d4715f6690e`
- Exact parent tree: `57dbde7a730c687a341748dad4a725a052653f0b`
- Product source (parent): `480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641 / 273`
- Candidate Product source: `f4de1d9306349de4be288ec8eb34b4f2af500d00166996f6f393051f2428a47d / 274` (tools/source-tree-identity.mjs, canonicalSourceIdentity over stack/native-typescript)
- Node: v22.16.0 / npm: 10.9.2

## Owned findings (D03A-bounded portions only)
- MFC-PF-003: SC-011 preference export/import/reset exposure through canonical Settings; Library donor-local retirement remains D08/D13.
- A04-PF-001: duplicate active SemanticCommandBus owners / duplicate authoritative receipt path in affected W05 compositions.
- A07-PF-003 + A17-PF-008: W05 Settings action-home collision; `SettingsCenterOwner` remains canonical.
- D03A does NOT claim closure of CBF-001..003, MFC-PF-001/002, PVF-001..003, F-049, F-050.

## Canonical owners
- Semantic commands: `SemanticCommandBus` (one injected canonical instance)
- Settings: `SettingsCenterOwner` / command identity `foundation.settings`
- Preference value/persistence: `ScopedPreferencesOwner` (incl. `PreferenceExportImportResetModel` role via export/import/reset)

## Writable paths
- stack/native-typescript/foundation/global/commands.ts (DI contract, proven necessary)
- stack/native-typescript/foundation/global/settings/center.ts (SC-011 exposure/action-home)
- stack/native-typescript/surfaces/manual_ai/composition.ts
- stack/native-typescript/surfaces/releases/composition.ts
- stack/native-typescript/surfaces/configuration/composition.ts
- stack/native-typescript/tests/post-c03/D03A/**
- writer-output/D03A/** (bounded textual only)

## Prohibited
- main.ts; surfaces/m0-controller-composition.ts (D13); Visualize; D03B/D03C/D04 scope; shared registries; live Controller governance; cep-writer/** authority mutation; new framework/dependency/owner/engine.
- No static-singleton workaround for the canonical bus; compositions must not construct competing canonical buses.

## Proof requirements
- Exact parent reproduction (detached temp worktree at 37c4d76) FAILs the defect-free expectation; candidate PASSes.
- Positive: shared injected bus across three W05 compositions; one execution = one receipt; SC-011 section/actions searchable and rendered; delegation to ScopedPreferencesOwner with truthful persistence codes.
- Negative: compositions reject missing/fake bus; source scan finds no `new SemanticCommandBus` in target compositions; denied execution emits no receipt; failed storage yields STORAGE_UNAVAILABLE/STORAGE_WRITE_FAILED (no fabricated durability).
- Existing command/Settings regression preserved (npm test 210/0 parent-equal).

## Transport law
- REMOTE_PUSH: NOT_PERFORMED_BY_WRITER. Pull request: NOT_CREATED. Merge: NOT_PERFORMED.
- Single local checkpoint commit `D03A: converge canonical command and settings owners`, then STOP for independent Controller audit.

## STOP rule
Mission ends at: one exact local D03A checkpoint commit → clean worktree → exact post-commit identity → local external audit bundle/receipt → STOP.
