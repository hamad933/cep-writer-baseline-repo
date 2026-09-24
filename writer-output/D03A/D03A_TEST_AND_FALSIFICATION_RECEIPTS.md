# D03A — TEST AND FALSIFICATION RECEIPTS

Runtime: Node v22.16.0, npm 10.9.2, win32. Product identity method: `tools/source-tree-identity.mjs#canonicalSourceIdentity` over `stack/native-typescript/`.

## 1. Exact parent reproduction (FAIL expectation met at 37c4d76)
Executed in temporary detached worktree `D:\projects\Enterprise-Projects\cep-d03a-parent-repro` at exact parent (removed after use; never execution authority), read-only script, result exit=0 with all checks `PASS_DEFECT_REPRODUCED`:

- `A04-PF-001.duplicate-active-bus-owners`: buses=[SemanticCommandBus×3], distinct=3
- `A04-PF-001.duplicate-authoritative-receipt-ledgers`: one probe execution per surface → three separate ledgers [1,1,1]
- `A04-PF-001.di-contract-absent-default-constructs`: compositions construct `new SemanticCommandBus()` when caller omits commands
- `MFC-PF-003.settings-lacks-sc011-transfer-section`: sectionIds=[preferences.appearance, settings.general, settings.layout, commands.catalog, shortcuts.global]; `exportPreferences` undefined
- `MFC-PF-003.preference-owner-has-canonical-transfer-capability`: ScopedPreferencesOwner export/import/reset present
- `MFC-PF-003.settings-owner-canonical`: SettingsCenterOwner / SemanticCommandBus identities confirmed

Parent bytes were not modified to manufacture failure.

## 2. Candidate targeted suite
`stack/native-typescript/tests/post-c03/D03A/d03a-command-settings-convergence-tests.ts` (11 tests, all PASS):

| test | status |
|---|---|
| d03a.command-owner-uniqueness-one-injected-shared-bus | PASS |
| d03a.receipt-uniqueness-single-authoritative-ledger | PASS |
| d03a.negative.composition-requires-canonical-bus-instance | PASS |
| d03a.negative.no-new-semantic-command-bus-in-target-compositions | PASS |
| d03a.settings-owner-uniqueness-canonical-identities | PASS |
| d03a.sc011-exposure-through-canonical-settings | PASS |
| d03a.sc011-delegation-to-scoped-preferences-owner | PASS |
| d03a.sc011-no-fabricated-persistence | PASS |
| d03a.sc011-failing-storage-import-reported | PASS |
| d03a.regression.semantic-command-bus-routes-and-guards | PASS |
| d03a.regression.settings-center-lifecycle-and-boundaries | PASS |

Note: the repository's standalone test-script entry idiom (`import.meta.url===new URL(process.argv[1],'file:').href`) does not match Windows `argv[1]` in this shell, so the suite was executed via module import of its exported runner — identical convention as existing scripts, same test bodies.

## 3. Global regression gates (candidate vs parent)
| gate | parent | candidate | classification |
|---|---|---|---|
| D03A targeted suite | N/A (defects reproduced above) | 11 PASS / 0 FAIL | CANDIDATE_PASS |
| npm test (model tests) | 210 PASS / 0 FAIL | 210 PASS / 0 FAIL, exit 0 | PASS (parent-equal) |
| npm run build:runtime | exit 9009 — `python3` not on the npm/cmd PATH of this environment | exit 9009 (identical) | INHERITED_ENVIRONMENT; equivalent node steps pass: `node tools/build-runtime.mjs` exit 0, and check-build-authority internal build pass=true (258 files, both parent and candidate) |
| node tools/check-duplicate-mechanics.mjs | PASS (exit 0) | PASS (exit 0) | PASS (parent-equal) |
| npm run check | exit 1 — scaffold.execution FAIL + intentional negative-fixture FAIL entries (structured.compat.*, structured.history.*, library.*) | exit 1 — identical failure set | INHERITED (parent-equal) |
| w4-e-settings-center regression | 30 PASS / 1 FAIL (`w4e.owner-contract-presentation-only` — historical contract scope literal) | 30 PASS / 1 FAIL (same id) | INHERITED (parent-equal) |

## 4. Browser/runtime proof
OUT_OF_SCOPE_UNTIL_D13_PRODUCT_ENTRY_WIRING: genuine product-entry reachability of Settings from W05 surfaces requires `main.ts`/`surfaces/m0-controller-composition.ts` convergence owned by D13. Bounded model/runtime proof above (sections/search/render/delegation/persistence truth) is the truthful D03A evidence; no fixture-based product-consumer claim is made.

## 5. Changed-path enforcement
Authored change set is exactly the D03A allowlist (5 Product sources + 1 test file + writer-output/D03A/**). Harness-generated rewrites of `dist/**`, `assurance/**`, `stack/MEASURED_COMPARISON.json` observed during gate runs were reverted/removed before staging; final list is generated from git in D03A_CHANGED_PATHS.txt.

## 6. Known candidate-side intentional contract change
W05 composition factories no longer construct a fallback bus: calling `createManualAiSurfaceComposition()`/`createReleasesSurfaceComposition()`/`createConfigurationSurfaceComposition()` without an injected canonical bus fails closed with `CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED:<surface>.composition`. Historical standalone scripts (tests/surfaces/*, tests/rescue/S17, S19) that call them no-argument would now throw if executed; none are executed by any npm gate; D13 owns re-binding consumers to the canonical bus.
