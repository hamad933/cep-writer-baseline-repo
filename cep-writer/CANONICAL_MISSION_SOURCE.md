# CEP — MISSION_R6_PRESENTATION_PARITY_CORR02

**Role:** EXECUTION WRITER — serialized multi-owner Presentation correction only  
**Mode:** MUTATING ISOLATED CANDIDATE / EXACT 5205d2a3 PARENT / PRESENTATION-ONLY PRODUCT CORRECTION / GITHUB CANDIDATE BRANCH BOUND / CANDIDATE_ONLY / NO SELF-PROMOTION / NO LIVE GOVERNANCE MUTATION / NO DIRECT MAIN PUSH / NO MERGE / NO RELEASE / NO R7 / NO STACK FREEZE

## 0. Controller binding

This mission exists because the Independent Controller audit retained the exact R6-CORR01 + Balanced6 Product/data/runtime result but reopened `R6-PRESENTATION-REFERENCE-PARITY-FAIL` as `OPEN_PRODUCT / PRESENTATION`.

The Controller already closed the separate evidence-chain/package defect through `CONTROLLER_EVIDENCE_CORR01`; do not re-open or re-implement that correction.


### 0.1 Repository execution binding — OD-20260921-066 / OD-20260921-067

This mission is now executed in the long-lived Writer repository:

- repository: `hamad933/cep-writer-baseline-repo`;
- baseline branch: `main`;
- exact normalized Writer baseline commit: `ef7de5e05eee79d1302a84c47ef41ba5e94364c6`;
- normalization validation: GitHub Actions run `35555465695` = `PASS`;
- baseline repository content tree: `d0c3551a75ab05b67eb52de60c699d5e6191ccaefd2ed671b71130886132bb03` / `1,471` manifested files;
- exact Writer candidate branch: `writer/presentation-corr02-google-ai-studio`;
- Product parent inside that base remains `5205d2a3d0db441e030a046bc831549728cc95b9c09ff9d2fa4233ba1672fd66 / 272`.

The Writer MAY commit and push only to `writer/presentation-corr02-google-ai-studio`.

Google AI Studio transport gate - OD-20260921-068 / OD-20260921-069:
- built-in AI Studio GitHub sync is MAIN-only for this workflow and is NOT the mission transport;
- keep repository default branch = main;
- create a separate manual Git clone/worktree for the exact branch `writer/presentation-corr02-google-ai-studio`;
- verify remote, exact branch, exact starting HEAD, clean status, baseline ancestry, Product identity and Writer self-containment before mutation;
- do not request/configure GitHub write credentials during preparation or small-batch preview work;
- after final Owner visual approval only, use Git CLI with a non-echoing fine-grained PAT Secret if write authentication is needed;
- never publish mission work with built-in main sync.

The Writer MUST NOT:
- push directly to `main`;
- merge/rebase the candidate into `main`;
- create a release or acceptance tag;
- edit `cep-writer/` Controller authority/reference files;
- mutate Drive live governance/accepted-successor custody;
- self-promote any result.

Small textual mission handoff/evidence may be written only under:
`writer-output/presentation-corr02/`

Before final Owner visual approval, do not push final Product results or final evidence. After explicit Owner approval, GOOGLE_AI_STUDIO_WRITER may commit bounded generated screenshots/evidence only under `writer-output/presentation-corr02/evidence/` as a transport exception. Never commit secrets, credentials, `.env`, `node_modules`, build caches, runtime SQLite state, generated dependency trees or unrelated historical packages. No ordinary Git file may be >=100 MiB; prefer generated evidence artifacts below 50 MiB each. Candidate/self-contained baseline ZIP creation remains Controller-owned unless later explicitly requested. The exact final candidate-branch HEAD is the Writer result identity.


### 0.2 Writer-input self-containment gate — OD-20260921-067

This mission must execute from a Writer-complete repository snapshot. Required execution inputs are repository content, not live Drive dependencies.

Before Product mutation:
- verify `cep-writer/WRITER_INPUT_MANIFEST.json` (or the Controller-designated successor manifest) resolves every mission-required local input;
- verify exact hashes for the packaged mission, applicable Owner decisions, affected SurfaceProfiles, domain/oracle/technical references and governed visual-reference images;
- verify all required reference binaries can be opened directly from the repository;
- verify no mandatory task read points only to a live Drive file.

Drive IDs in the packaged task material are provenance/custody identifiers only unless the Controller explicitly classifies an artifact as an external generated-output receipt. If a required Writer input is missing from the repository, STOP with:
`WRITER_INPUT_INCOMPLETE`.

Reference images/PDFs/fixtures required to perform the mission are valid Git inputs and must not be skipped merely because they are binary or relatively large.

Heavy GENERATED outputs remain external by default. When large result artifacts are placed in Drive, commit only a bounded receipt under `writer-output/presentation-corr02/` containing exact Drive ID/path, filename, bytes, SHA-256, branch/commit identity, Product/source identity and classification.


### 0.3 Google AI Studio execution class

This mission is specialized for `GOOGLE_AI_STUDIO_WRITER`.

Lifecycle:
`PREPARE_NO_MUTATION -> SMALL_BATCH_EXECUTION_AND_PREVIEW -> OWNER_VISUAL_REVIEW -> FINAL_EVIDENCE_CAPTURE_AND_BRANCH_PUSH -> CONTROLLER_AUDIT`.

All Product work, preview, tests and evidence capture occur from the separate manual clone of the candidate branch. The AI Studio built-in main workspace, if present, is non-mission/read-only context.

Before final Owner visual approval:
- no remote push of Product result;
- no final evidence packaging;
- no GitHub write secret is required;
- local working-tree changes/local commits are permitted only as mission-local checkpoints and remain unpushed.

### 0.4 Serialized small-batch CORR02 plan - Controller mission binding

Do NOT attempt all 23 Surfaces in one correction pass.

Every batch is both a correction pass and a fresh discovery/falsification pass. Known findings are not assumed exhaustive. Before editing each Surface, open and inspect the actual local governed reference image binary when one exists, then read the exact SurfaceProfile, applicable Owner decisions, domain/oracle truth, shared-owner bindings and current Product composition.

Execute only one active batch at a time:

- B0 - Environment preparation only; zero Product mutation.
- B1 - Today calibration only. Establish the visual-analysis/correction method against its Owner-confirmed final reference. STOP for Owner preview review.
- B2 - Library + Learn. Preserve their high compatible Structured reuse while keeping Learning semantics distinct.
- B3 - RQ + Visualize. Preserve Analytical versus Spatial identity and representation/canonical-truth separation.
- B4 - Enterprise + Scenarios + Labs. W03 workspace-first authoring/modeling; no global Read/Edit surface mode.
- B5 - Runs + Results. Separate operational live-runtime interaction from sealed historical analysis/replay/AAR/compare.
- B6 - Evidence + Reviews + Mastery + Portfolio. Preserve W04 evidence/review/decision/mastery boundaries.
- B7 - Health + Processing + Validation + Manual AI. Processing intentionally has no standalone visual reference; use contract/profile/domain truth.
- B8 - Backup & Restore + Audit + Releases + Configuration.
- B9 - Shell integration + full 23-Surface cross-lane regression. Shell has no frozen final binary; use its profile/current Owner law and shared composition contracts without inventing visual authority.

Hard batch gates:
- do not advance to the next batch until the Owner/Controller explicitly reviews the current preview;
- a shared-owner change is allowed only when direct evidence proves the defect is shared; then re-falsify affected real consumers immediately;
- do not solve a Surface-specific semantic defect by changing a global Presentation owner;
- do not copy Library actions/text/content into unrelated Surfaces;
- inspect both governed viewport families and applicable interactive states for the active batch;
- if a new defect requires scope outside the active batch/shared-owner propagation, report it and wait rather than silently widening scope.

B1 is the first Product-mutation batch after B0 succeeds.

## 1. Mandatory packaged reads before mutation

The Controller resolves live authority before branch launch. The Writer must consume the **packaged repository copies** of every required execution input and must not depend on live Drive reads.

Read, from `cep-writer/` and its bound local references:
1. `START_HERE.md`;
2. `CURRENT_MISSION.md`;
3. the exact packaged Authority Packet and applicable Owner-decision snapshot;
4. `references/23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md`;
5. `references/FINAL_VISUAL_REFERENCE_REGISTER.md`;
6. `references/CEP_FINAL_VISUAL_INTERACTION_CONTRACT.md`;
7. exact local SurfaceProfiles for every touched Surface;
8. applicable local domain/oracle references, including W03 / W04 / W05 where required;
9. exact local governed visual-reference images required for every affected Surface/state;
10. packaged Controller finding/evidence summaries admitted as Writer input.

Drive IDs recorded in these files remain provenance/custody identifiers only; they are not permission to substitute a live Drive lookup for a missing required repository input.

Pay special attention to `OD-20260916-044`, `OD-20260918-055`, `OD-20260918-056`, `OD-20260920-059`, `OD-20260920-060`, `OD-20260921-062`, `OD-20260921-066`, `OD-20260921-067`, `OD-20260921-068`, and `OD-20260921-069`.

If any required item above is absent, stale, hash-mismatched, or only available through a live Drive lookup, STOP with `WRITER_INPUT_INCOMPLETE`.

## 2. Exact Product parent — hard gate

Start ONLY from:

`CEP_R6_CORR01_BALANCED6_CANDIDATE_5205d2a3.zip`

Expected candidate ZIP SHA-256:
`03fa724c20c4b41847f4418bbd9d512e8dd64c152c1e7e28f6f55e04fd23ed4b`

Expected canonical source identity:
`5205d2a3d0db441e030a046bc831549728cc95b9c09ff9d2fa4233ba1672fd66 / 272`

Expected normalized Product tree:
`d6743fe7b41c39050656ec10d99938f28db88a27a7f5ae3bc8a47d915d6d5d75 / 2,143 files / 105,549,338 bytes`

If any identity differs, STOP with `PARENT_IDENTITY_MISMATCH`.

Do not restart from R6. Do not overlay a sibling ZIP. Do not use the old baseline Product as the mutation parent.

## 3. Proven truth that MUST be preserved

The following are already independently reproduced and are regression-only in this mission:

- Balanced6 exact six KU profile and provenance;
- `32/32` Balanced6 focused tests;
- `6 documents / 6 baseline revisions / 6 FTS rows` idempotent state;
- Save / Autosave / Recovery / stale-save atomicity;
- `npm test 210/210`;
- `npm run check PASS`;
- runtime build PASS;
- `npm run runtime:check PASS` on Node `v22.16.0`;
- provider/persistence falsification `9/9`;
- R6 targeted suite `10/10`;
- no dependency addition;
- `node:sqlite`, current provider boundaries and all domain/data truth;
- genuine HTTP remains `OPEN_ENVIRONMENT__LOOPBACK_BLOCKED_BEFORE_PRODUCT_RECEIPT` unless a permitted environment genuinely proves otherwise.

Any change to persistence, Balanced6 seed semantics, provider architecture, schema, dependencies, runtime or canonical domain behavior is OUT OF SCOPE unless a Presentation change accidentally exposes a real regression; in that case stop and report rather than widening scope.

## 4. Exact correction objective

Close Presentation parity through state/viewport-matched Product composition, not by copying screenshots pixel-for-pixel and not by inventing fake content.

Controller direct comparison proved the Writer's generic `23/23 no blocker` conclusion unsafe. Required primary re-review includes at least:

- Today
- Enterprise
- Evidence
- Reviews
- Validation
- Backup & Restore
- Audit
- Releases
- Configuration

Also re-falsify Mastery, Portfolio, Health, Processing, Manual AI, Scenarios, Labs, Runs, Results, RQ, Visualize, Learn, Library and Shell for propagation/regression. Mutate additional Surfaces only if direct current state/reference comparison proves a material defect.

The problem is Presentation/composition, not a license to rewrite domain semantics.

## 5. Ownership law

Preserve:

`GLOBAL FOUNDATION → FAMILY ENGINE → REUSABLE MECHANICS/PRESENTATION/HOSTS → THIN DOMAIN ADAPTER → SURFACE COMPOSITION`

`OD-20260920-059` is a hard stop:
- shared owners may own compatible layout grammar, panes, focus, responsive mechanics and interaction carriers;
- Surface/domain owners retain purpose, command vocabulary, workflow, lifecycle, data/provider truth and effects;
- Library is not a universal semantic template;
- do not create a new universal domain renderer that flattens Surface identity.

Prefer existing seams. Current relevant Presentation/composition paths include, but are not limited to:

- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- `stack/native-typescript/surfaces/today/presentation.ts`
- `stack/native-typescript/surfaces/today/surface.ts`
- `stack/native-typescript/surfaces/enterprise/presentation.ts`
- `stack/native-typescript/surfaces/enterprise/index.ts`
- `stack/native-typescript/surfaces/evidence/index.ts`
- `stack/native-typescript/surfaces/reviews/index.ts`
- `stack/native-typescript/surfaces/mastery/composition.ts`
- `stack/native-typescript/surfaces/portfolio/composition.ts`
- `stack/native-typescript/surfaces/validation/index.ts`
- `stack/native-typescript/surfaces/backup/index.ts`
- `stack/native-typescript/surfaces/audit/index.ts`
- `stack/native-typescript/surfaces/releases/composition.ts`
- `stack/native-typescript/surfaces/configuration/composition.ts`
- `stack/native-typescript/surfaces/composition/w04-rescue.ts`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts`

Shared Foundation paths are writable ONLY when direct evidence proves the defect belongs to an already-existing shared Presentation owner and a central change is the narrowest correct fix. No new shared semantic owner.

## 6. Prohibited Product changes

Do NOT change:

- Balanced6 KU source files or seed identities/hashes;
- persistence schema or DB engine;
- `node:sqlite` provider choice;
- Save/Autosave/Recovery semantics;
- provider/domain truth merely to make screenshots richer;
- package dependency graph or `package-lock.json` dependency set;
- runtime/terminal architecture;
- Owner decisions, CURRENT_STATE or governance;
- genuine browser truth from OPEN_ENVIRONMENT to PASS without real route proof.

Do not add dummy KPI cards, fake health states, fabricated review decisions, fake deployment status, fake canonical graph relations or fake Mastery merely to resemble a reference image.

## 7. Result-first Presentation gate

For every affected Surface and both governed viewports (`1440×1000`, approximately `1024×900`), compare current candidate output step-by-step against:

- exact SurfaceProfile;
- current visual reference classification;
- applicable domain oracle;
- current Owner decisions;
- current data/provider truth.

Inspect every material component, including small controls/affordances, for applicable:

- hierarchy, typography, density, spacing, icons, overflow;
- LEFT/CENTER/RIGHT/BOTTOM ownership;
- selected-object/context coherence;
- default/hover/focus/active/selected/disabled/unavailable;
- expanded/collapsed/loading/empty/stale/error/conflict/read-only/processing/success;
- pointer + keyboard;
- focus entry/return/fallback;
- dismissal;
- responsive geometry;
- RTL/LTR/Bidi and long technical identifiers;
- truthful labels and product copy;
- no proof/debug/internal owner/provider leakage in normal mode.

The reference image is Presentation authority only. Preserve Product truth when reference data is illustrative.

## 8. Positive and falsification tests

At minimum prove:

- materially affected Surface references are no longer weaker at matched states/viewports;
- all 23 Surface identities still route to the correct typed workbench;
- no generic `Governed typed product workbench`/Truth Boundary/debug leak returns in normal UI;
- no page-level horizontal overflow at 1440×1000 or 1024×900;
- technical IDs wrap/isolate correctly without character fragmentation;
- domain commands/availability remain exact;
- W03 remains workspace-first;
- W04 Evidence/Review/Decision/Mastery boundaries remain unchanged;
- W05 truth ceilings remain unchanged;
- central Presentation changes, if any, propagate to at least two real compatible consumers and exact-revert proves central ownership;
- no consumer-specific workaround is needed for a shared mechanic;
- diagnostics remain explicit/bounded;
- all preserved non-browser regression gates still PASS.

Negative tests must attempt to detect semantic drift caused by visual changes.

## 9. Browser/evidence law

Use the exact built Product and current compatible browser tooling.

If localhost remains administratively blocked, in-memory built-ESM capture MAY be used only for Presentation comparison and must remain labeled `VISUAL_PRESENTATION_EVIDENCE__NOT_GENUINE_ROUTE`.

It cannot close genuine HTTP / Back-Forward / xterm route findings.

Produce real PNG binaries for all 23 Surfaces × 2 viewports after correction, plus additional state-matched screenshots for every materially corrected Surface/reference pair.

Create a state-matched parity matrix that records:
- Surface;
- reference ID/SHA/classification;
- candidate screenshot;
- viewport;
- exact matched state/object;
- component-by-component disposition;
- intentional truth-driven differences;
- PASS/BLOCKED/NOT_APPLICABLE.

## 10. Integrated regression

After Product mutation is complete rerun from a clean extraction:

- canonical source identity;
- normalized Product tree;
- exact Product delta;
- dependency diff;
- `npm test`;
- `npm run check`;
- `npm run build:runtime`;
- `npm run runtime:check` on Node `v22.16.0`;
- Balanced6 `32/32`;
- provider/persistence `9/9`;
- targeted R6 correction tests;
- duplicate-owner scan;
- encoding/Bidi audit;
- 23-Surface visual Presentation audit.

Do not alter Product merely to make a stale harness PASS.

## 11. Repository handoff and Controller packaging boundary

This repository workflow supersedes the earlier requirement for the Writer to manufacture final heavy ZIP custody itself.

The Writer must leave the candidate branch in a reproducible state and produce only bounded text/small-machine-readable handoff files under:
`writer-output/presentation-corr02/`

At minimum include:
- `WRITER_HANDOFF.md`;
- `PRODUCT_DELTA_MANIFEST.json`;
- `DEPENDENCY_DIFF.json`;
- `PRESENTATION_STATE_MATCHED_PARITY_MATRIX.csv` and/or `.json`;
- `TEST_RESULTS.json`;
- `FINAL_WRITER_STATUS.json`;
- paths/hashes for any screenshots or large local artifacts that were generated but intentionally not committed.

Do not commit:
- candidate ZIPs;
- evidence ZIPs;
- self-contained baseline ZIPs;
- large 23×2 screenshot sets;
- `node_modules`;
- build caches;
- generated dependency trees.

After Writer handoff, the Controller checks out the exact candidate-branch HEAD, independently audits Product/Presentation/runtime/data truth, regenerates required large evidence/candidate/baseline packages in controlled custody, and decides acceptance or bounded correction.

If a later Controller instruction explicitly requests a particular binary artifact in Git, that exact instruction may narrow this rule.

## 12. Required branch result

The final Writer result must be one exact branch HEAD on:
`writer/presentation-corr02-google-ai-studio`

The handoff must state:
- exact base commit `ef7de5e05eee79d1302a84c47ef41ba5e94364c6`;
- final candidate branch HEAD SHA;
- exact Product source identity after mutation;
- exact Product changed paths;
- dependency diff;
- all executed test/regression results;
- Presentation parity disposition for all 23 Surfaces;
- every blocked/unavailable/environment-limited proof without fabricated PASS;
- `CANDIDATE_ONLY__PENDING_INDEPENDENT_CONTROLLER_AUDIT`.

## 13. No self-promotion / Git boundary

Even with every Product/Presentation gate green, return only:

`CANDIDATE_ONLY__PENDING_INDEPENDENT_CONTROLLER_AUDIT`

Final remote push is allowed only after explicit Owner visual approval and must use Git CLI from the manual clone. The Writer may push only to:
`writer/presentation-corr02-google-ai-studio`

Built-in AI Studio sync must not publish this mission.

Do not push to or merge into `main`. Do not modify live governance, accept/promote a successor, launch R7, freeze stack, create a release, or claim that a Git commit is accepted CEP authority.

When the branch is complete and validated, end with:

`R6_BALANCED6_PRESENTATION_CORR02_BRANCH_READY_FOR_CONTROLLER_AUDIT`
