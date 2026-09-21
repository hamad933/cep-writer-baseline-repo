# CEP FINAL RUNTIME/TEST/COLAB REUSABLE CHECKLIST v1.0

Use this checklist for any future CEP workspace before declaring runtime/test/browser completion.

## A. Admission
- [ ] Exact governed predecessor/candidate identified.
- [ ] ZIP/file SHA known.
- [ ] Source manifest known and verified.
- [ ] Source tree identity known and verified.
- [ ] Source-contract/static exhaustion gate completed where applicable.
- [ ] Colab task isolated from unrelated runtimes/queues.

## B. Drive input
- [ ] Prefer exact Drive File ID.
- [ ] FUSE path is convenience only.
- [ ] Local `/content` copy SHA verified.
- [ ] API fallback download by exact File ID implemented.
- [ ] ZIP CRC verified.
- [ ] Embedded/member manifest verified.

## C. Toolchain
- [ ] Exact versions logged.
- [ ] Toolchain receipt persisted.
- [ ] No implicit host/global version assumptions.

## D. DB
- [ ] Task-scoped role/database names only.
- [ ] No governed/Production database names.
- [ ] DB lifecycle commands are separate `psql` calls.
- [ ] Runtime DB connection probe PASS.
- [ ] Test DB connection probe PASS.
- [ ] Migrations PASS.

## E. Build/test order
- [ ] Dependencies installed.
- [ ] Frontend build prerequisites generated before PHP page-render tests.
- [ ] Vite manifest exists before Laravel tests that render the application shell.
- [ ] Typecheck executed.
- [ ] Frontend test suite executed.
- [ ] PHP targeted pre-Colab suite executed.
- [ ] Unit/Feature executed.
- [ ] Integration executed.
- [ ] Architecture failures classified into Product vs repository-envelope dependency.

## F. Failure triage
For every failure:
- [ ] Preserve exact log/return code.
- [ ] Identify first causal error.
- [ ] Inspect direct implementation + direct test.
- [ ] Classify orchestration/environment/Product/stale-test/envelope/provider.
- [ ] Do not mutate Product before classification.
- [ ] Back up files before bounded patch.
- [ ] Verify old SHA.
- [ ] Apply smallest patch.
- [ ] Verify new SHA + semantic marker/compile.
- [ ] Rerun only affected gate first.
- [ ] Then rerun complete relevant suite.

## G. Test-quality anti-regression
- [ ] No positional DOM selectors where compositional shell can add controls.
- [ ] Async UI action waits for actual application settlement (`flushPromises`/equivalent).
- [ ] Fixtures satisfy current validation contract.
- [ ] Tests use current type/domain contract (`Summary` vs detail entities).
- [ ] Stale hard-coded counts verified against exact inventory before adjustment.
- [ ] Mathematical offset/range expectations recomputed from current contract.
- [ ] Product semantics are not degraded to satisfy historical tests.

## H. Runtime-discovered successor
If any source/test correction occurs:
- [ ] Old candidate identity is not reused for browser evidence.
- [ ] Re-extract clean predecessor.
- [ ] Reproduce predecessor tree.
- [ ] Overlay exact admitted files only.
- [ ] Verify no unexpected added/deleted file.
- [ ] Record changed-file register.
- [ ] Generate new source manifest.
- [ ] Compute new source tree.
- [ ] Compute exact package SHA.

## I. New Drive artifact custody
- [ ] Upload/create server-side Drive object.
- [ ] Obtain Drive File ID.
- [ ] API re-download the exact File ID.
- [ ] Verify size + SHA of downloaded bytes.
- [ ] Verify intended parent folder.
- [ ] `FUSE_READBACK` alone is NOT accepted.
- [ ] Record Drive File ID in current execution identity.

## J. Browser/visual
- [ ] Fresh bootstrap from exact successor File ID.
- [ ] Exact SHA/tree/manifest reverified after download/extraction.
- [ ] Correct route and authentication.
- [ ] No login bounce, 404, fatal page.
- [ ] Ready state confirmed.
- [ ] Required interaction executed before capture.
- [ ] Browser evidence and visual evidence reported separately.
- [ ] Actual 200% headed-browser zoom measured.
- [ ] AX tree not mislabeled as screen-reader proof.
- [ ] Real clipboard evidence handled separately.

## K. Governance closeout
- [ ] No self-acceptance.
- [ ] No merge/release/deploy without explicit authorization.
- [ ] Evidence classes reported separately.
- [ ] Lessons promoted to Control Center.
- [ ] Current state/manifest/handoff updated.
