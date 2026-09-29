# 02_current_truth / current_codebase_map + current_runtime_map

Timestamp: 2026-09-29T01:30Z · Source: live inspection of `cep-writer-baseline-repo` @ `writer/cep-serial` `48fec276` · Classification: CURRENT_VALIDATED

## Product identity (binding)

- Product source: `stack/native-typescript/` — **273 files** at parent commit `293dd1e0e2e6cb61bea5b42abd2cba39847e3c6a`
- Canonical identity: `productCanonicalSourceSha256 = 480dbe9d76cb2883b3a97b3cd618caaa2b0718572a78d86ad8941729a0cc9641` — **recomputed byte-exact**
- Algorithm (from `cep-writer/tools/verify_repo.py`, the binding implementation):
  `sha256( sort_by_path( relative_path \0 byte_size \0 sha256_of_bytes \n ) )`, bytes from `git show <parent_commit>:<path>`
- Parent tree `3101c06901dbdaff9602fea8098efb9c34575149` = `293dd1e^{tree}` ✔, and `293dd1e` **is an ancestor of HEAD** ✔
- Live worktree variant: `2ebcbf890b1b7bc71aa42b6719a867533b7b95bc2db52c00c3a35796929c5ee6 / 287 files` — the drifted live tree, NOT the canonical identity.

## Runtime map

| Layer | Implementation | Location |
|---|---|---|
| Product source (canonical) | native TypeScript/ESM | `stack/native-typescript/` (adapters, foundation, surfaces, fixtures, tests, `main.ts`) |
| Generated runtime | committed JS build | `dist/` (272 .js) + `dist-ts/` (274 files, gitignored) |
| Local runtime / persistence | Node server + SQLite (`node:sqlite`) + sha256-bound staging | `stack/local-runtime/` (`server.mjs`, `persistence/acceptance-seed/balanced6/`) |
| Terminal | `@xterm/xterm` 6.0.0 runtime assets | built via `stack/native-typescript/foundation/operational/xterm-runtime-assets.mjs` |
| Browser harness | Playwright 1.62.1 (package-local), Chromium | `tools/browser-conformance.mjs`, `tools/*.py` CDP harnesses |
| Build pipeline | `python3 tools/extract_donor.py && node tools/build-runtime.mjs && … xterm-runtime-assets.mjs` | `npm run build:runtime` |
| Verification pipeline | 9 checkers (`check:build-authority`, `check-duplicate-mechanics`, `test-writer-scaffold`, `check-w03-semantic-ownership`, `check-authority-intake`, `check-deferred-boundary`, `check-contracts`, `vs05-read-mode-matrix`, `check-vs05-command-ownership`) | `npm run check` |
| Model tests | `tools/test-models.mjs` | `npm test` |
| Acceptance seed | Balanced6 deterministic seed + acceptance tests | `npm run seed:balanced6` / `test:balanced6` |
| Preview | `tools/serve.mjs` → 0.0.0.0:4173 (product), runtime API 127.0.0.1:4174 | `npm run dev` / `runtime:local` |

## Application structure census (live)

- `stack/native-typescript/surfaces/` — 22 surface directories + `composition/` + `m0-controller-composition.ts`
- Surface dirs: audit, backup, configuration, enterprise, evidence, labs, learn, library, manual_ai,
  mastery, portfolio, releases, results, reviews, rq, runs, scenarios, shell, today, validation, visualize
- `health` and `processing` appear as SurfaceProfiles (`profiles/health.json`, `profiles/processing.json`)
  and as zero-loss surfaces (M5) but **not** as `surfaces/<name>/` directories — their current
  implementation location is unresolved (`UNKNOWN`) and is an explicit open item in
  `06_workspaces/W05/WORKSPACE_IDENTITY.md`.
- `stack/native-typescript/foundation/` — shared mechanics: global, collection, operational, spatial,
  structured, timeline, notes, analytical, audit, review, contracts, presentation-carrier, relations.
- Serialization hotspots named by the curated chain: `main.ts`, `surfaces/m0-controller-composition.ts`
  (held for serial final convergence).

## Test census (live inventory, results not re-executed)

- Product-source test files (`stack/native-typescript/*.ts` test modules): analytical-compare-tests,
  model-tests, ps02-spatial-finite-atomicity-tests, pw08/pw11/w3-d/w4-c..w4-g/w5-a..w5-c/w6-a suites.
- `tests/`, `tools/test-models.mjs`, `tools/balanced6-acceptance-tests.mjs`, `tools/*-browser*.py` harnesses.
- Current retained receipts: `assurance/MODEL_TEST_RESULTS.json` (has `pass`/`fail` totals),
  `assurance/CONTRACT_TEST_RESULTS.json`, `assurance/WRITER_SCAFFOLD_TEST_RESULTS.json`,
  `assurance/W03_SEMANTIC_OWNER_VALIDATION.json` — all currently **diverged from the manifest hashes**
  (see `00_bootstrap/github_status.md`).
