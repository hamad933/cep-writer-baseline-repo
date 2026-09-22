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
































Before final Owner visual approval, ordinary flow remains no remote Product push. One narrow exception is now active under section `0.9`: the Owner explicitly authorizes an immediate continuity-checkpoint push to the existing CORR02 candidate branch because of provider interruption. That checkpoint is custody-only, may be incomplete, and is not final evidence/acceptance. Outside that one-off exception:
- no remote push of Product result;
- no final evidence packaging;
- no GitHub write secret is required;
- local working-tree changes/local commits are permitted only as mission-local checkpoints and remain unpushed.
































### 0.4 Serialized small-batch CORR02 plan - Controller mission binding
































Do NOT attempt all 23 Surfaces in one correction pass.
































Every batch is both a correction pass and a fresh discovery/falsification pass. Known findings are not assumed exhaustive. Before editing each Surface, open and inspect the actual local governed reference image binary when one exists, then read the exact SurfaceProfile, applicable Owner decisions, domain/oracle truth, shared-owner bindings and current Product composition.
































Execute only one active batch at a time:
































- B0 - Environment preparation and identity/self-containment verification. No planned Product feature/Presentation mutation. Under `OD-20260921-070`, a directly reproduced prerequisite correctness/runtime defect that materially blocks, crashes, or corrupts the authorized work MAY receive one bounded correctness repair before B1, but only under the exact prerequisite-repair gate below.
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
- preserve serialized batch order and the current batch stop/handoff, but do not invent a second authorization gate: under `OD-20260921-071`, an explicit Owner request to prepare a named next batch is launch authorization for that batch once predecessor sequencing/technical prerequisites are satisfied; B2 Library+Learn is already authorized after B1 handoff, and B3 RQ+Visualize is now already authorized after B2 handoff;
- a shared-owner change is allowed only when direct evidence proves the defect is shared; then re-falsify affected real consumers immediately;
- do not solve a Surface-specific semantic defect by changing a global Presentation owner;
- do not copy Library actions/text/content into unrelated Surfaces;
- inspect both governed viewport families and applicable interactive states for the active batch;
- if a new defect requires scope outside the active batch/shared-owner propagation, report it and wait rather than silently widening scope.
































`B1` is the first **planned Presentation/Product-correction batch** after B0 succeeds. A separately proven `B0_PREREQUISITE_CORRECTNESS_REPAIR` under `OD-20260921-070` is not B1 scope and does not authorize Today/visual work early.
































### 0.5 Prerequisite correctness repair gate — OD-20260921-070
































CEP must not knowingly continue development on a proven broken runtime merely to preserve a phase label.
































During B0 or any later batch, if a real correctness/runtime bug is directly reproduced and materially blocks, crashes, or corrupts the currently authorized work, the Writer MAY apply the narrowest prerequisite repair before continuing, subject to ALL of the following:
































- classify it explicitly as `B0_PREREQUISITE_CORRECTNESS_REPAIR` (or the analogous current-batch prerequisite repair), not as planned Presentation work;
- preserve exact parent and branch lineage;
- record exact reproduction, root cause, affected call paths and exact Product diff;
- use the narrowest existing canonical owner/seam; no new architecture, dependency, semantic owner, domain behavior, provider claim, or design scope;
- do not use the repair as permission to improve unrelated code, refactor broadly, or widen the active Surface batch;
- where practicable prove parent-fails / corrected-candidate-passes for the exact defect;
- rerun focused tests plus every materially affected runtime/browser/interaction regression;
- preserve all four independent truths: Content, Presentation, Behavior/Interaction/Functionality, and Domain/Data/Provider truth;
- if the defect or correct owner is uncertain, broad, cross-owner, architectural, semantic, or design-expanding, STOP for Controller adjudication instead of guessing;
- the repair remains candidate-only and must be independently Controller-reviewed.
































For the currently reported `TypeError: e.target.closest is not a function`, the Writer may retain the local repair rather than revert it **only if** the final local diff is bounded to the exact event-target correctness problem, no unrelated Product changes are mixed in, and focused + affected regression evidence passes. The repair must normalize non-Element event targets safely before any `.closest(...)` use while preserving the original command, spatial, window-motion, focus and runtime semantics.
































This exception does NOT waive the batch preview gates and does NOT authorize B2 or later work.
































### 0.6 Owner-authorized B1 continuation — no B0 redo
































The latest explicit Owner direction authorizes immediate continuation in the same Google AI Studio chat, same manual CORR02 branch, and same worktree. Do NOT redo B0 and do NOT discard the already-applied EventTarget/.closest prerequisite correctness repair merely to restore the pre-B0 tree.
































Begin `B1_TODAY` now.
































If B1 exposes another real runtime/correctness bug that materially blocks, crashes, or corrupts the active work, fix it under `OD-20260921-070` when exact and bounded; do not knowingly build Presentation work on a broken runtime. Separate every such prerequisite repair from B1 Presentation changes in the final diff/evidence.
































B1 remains Today-only for planned Presentation work. STOP after the Today preview/evidence and produce the required B1 handoff. The Owner has already authorized B2 Library+Learn as the next batch under `OD-20260921-071`; no additional Owner/Controller authorization step is required after the B1 stop/handoff. Review of B1 remains a quality/audit function and may produce bounded correction findings, but it is not a second source of launch permission.
































### 0.7 Owner-authorized B2 continuation — Library + Learn
















The latest explicit Owner direction authorizes `B2_LIBRARY_AND_LEARN` as the next CORR02 batch. This authorization is Owner-derived under `OD-20260921-071`; the Controller must not require a second permission step.
















Execution remains serialized: finish B1 Today to its prescribed STOP/handoff first, then continue directly into B2 in the same Google AI Studio conversation, same manual CORR02 branch, and same worktree. Do not redo B0 or B1, do not reset/discard already-completed local corrections, and do not create/switch to another mission branch merely to begin B2.
















B2 planned Presentation scope is exactly Library + Learn, plus only directly proven shared-Presentation propagation and bounded prerequisite correctness repairs admitted by `OD-20260921-070`. Preserve Library as accepted donor + normal consumer + regression oracle, while Learn consumes maximum compatible Structured/Library mechanics without inheriting Library domain semantics, command vocabulary, save/revision authority, or canonical-store behavior.
















B2 remains subject to its exact packaged Library/Learn profiles, current visual references, applicable Owner decisions, donor/oracle truth, both governed viewport families, direct interaction/state falsification, and exact change accounting. B3 is not implied or authorized by this B2 authorization unless the Owner separately directs/prepares B3 under current authority.
















### 0.8 Owner-authorized B3 continuation — RQ + Visualize








The latest explicit Owner direction authorizes `B3_RQ_AND_VISUALIZE` as the next CORR02 batch after B2. This authorization is Owner-derived under `OD-20260921-071`; no second Owner/Controller permission step is required.








Execution remains serialized: complete B2 Library+Learn to its prescribed STOP/handoff, then continue directly into B3 in the same Google AI Studio conversation, same manual CORR02 branch, and same worktree. Do not redo B0/B1/B2, do not reset/discard already-completed local corrections, and do not create/switch branches merely to enter B3.








B3 planned Presentation scope is exactly Research & Quality (`rq`) + Visualize, plus only directly proven shared-Presentation propagation and bounded prerequisite correctness repairs admitted by `OD-20260921-070`.








B3 authority/identity hard boundaries:
- RQ is an Analytical knowledge-quality workbench using `AnalyticalCompare`; it is not W04 Formal Evidence Review, must not assign formal review decisions or Mastery, and `rq.compare` is available only when exact valid `SourceRevision` references exist.
- RQ profile remains `CONTRACT_ONLY` / `proof_consumer=false`; do not fabricate provider/domain truth or upgrade candidate/reference material into canonical product truth.
- RQ visual `image-gen-1(20260813-194728).png` remains `REVIEWED_FINAL_CANDIDATE`, not Owner-confirmed final; use as bounded Presentation/reference input only.
- Visualize is one Spatial workbench using `SpatialInteraction` with Tree/Path/Graph/Canvas adapters; never create four independent spatial engines.
- Visualize Tree is the page-level `OWNER_CONFIRMED_FINAL_REFERENCE`; Path and Graph are supporting component references; Canvas is an `OWNER_CONFIRMED_SUPPORTING_COMPONENT_REFERENCE`. Supporting references do not replace Tree/shared-shell authority.
- representation state is not canonical object/relation truth. `representationId != canonicalObjectId`; moving/duplicating/removing a representation, Canvas-local geometry, and Canvas-only links must not silently mutate canonical objects/relations.
- Visualize current domain implementation is `BOUNDED_FIXTURE`; synthetic/local graph data must never be labeled or implied canonical when canonical provider truth is unavailable.








Exact packaged profile hashes:
- `cep-writer/references/surface-profiles/rq.json` = `4f6f8cc7c5055473e9636748f263683889d61f599daeac2f20fc2eea11c9ae7f`.
- `cep-writer/references/surface-profiles/visualize.json` = `18b47d9de8adc39fc9a3a10011e5b7570a835726b1618245990858b62cfeb915`.








Exact packaged visual bindings:
- RQ: `cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png` = `312bf193216402f8c16fb8c2bca424fa453d961e31f818ac0183cdf8e7b380c8` / `REVIEWED_FINAL_CANDIDATE`.
- Visualize Tree: `cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/03_VISUALIZE/CEP_VIS_001_VISUALIZE_TREE_CORRECTED_REFERENCE_v2.png` = `c02a6a272f330c3cc169317bff616239e1b2ae08ba99e57ff91adffc07c6831f` / `OWNER_CONFIRMED_FINAL_REFERENCE`.
- Visualize Path supporting: `cep-writer/references/visual/90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_PATH_VIEW_COMPONENT_REFERENCE.png` = `0f1d320fe684b992b885cafb47664aa98ce41d8f6c44f6c67df7ef350735166f`.
- Visualize Graph supporting: `cep-writer/references/visual/90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_FOCUSED_GRAPH_RELATIONSHIP_COMPONENT_REFERENCE.png` = `7c36b02e30fd82a6664e427cbc450c1b8f1c221295ea53b31a36b745cebd38f2`.
- Visualize Canvas supporting: `cep-writer/references/visual/90_SUPPORTING_COMPONENT_REFERENCES/CEP_VISUALIZE_CANVAS_VIEW_COMPONENT_REFERENCE.png` = `918ab2a8c7c415b5f201712c5b11a3c13590db0231d7be1d0073a8f955ced33c` / `OWNER_CONFIRMED_SUPPORTING_COMPONENT_REFERENCE`.








Direct domain/reference packets to preserve in Controller/packaged authority:
- RQ packet Drive `19hfp-ddB3J14mfPo3mJs5eIjznWyRIt2v0f1NO5mocU`.
- Visualize packet Drive `189E4ajLfWbQ8Ihf5JVjCUHU8LK0R0mUPsbANeh5MmaQ`.
- Visualize Canvas reference-delta addendum Drive `1ewA1hDcoVlZkJEXSL9lRmlCn0bH75gooA5lgQbOSh-8`.








B3 must perform fresh defect discovery/falsification at both governed viewport families. For RQ preserve analytical mode/claim/source/revision context, exact compare pair truth, distinct empty/stale/unavailable/error states, and no W04 authority leakage. For Visualize preserve one spatial engine, four distinct view semantics, selection/focus/multi-selection, viewport/pan/zoom/fit, relation draft/validated/rejected truth, representation-aware inspector behavior, responsive/a11y/Bidi, and canonical-vs-representation separation.








B4 is not implied or authorized by this B3 authorization unless separately directed/prepared by the Owner under current authority.








### 0.9 Owner-authorized interruption continuity checkpoint push — ONE-OFF / NON-DURABLE EXCEPTION




The Owner explicitly authorizes an immediate Git continuity checkpoint because Google AI Studio model/provider execution is unstable and current B0/B1/B2/B3 progress must not be lost.




This is a narrow task-specific exception under `OD-20260915-041` and MUST NOT be registered as a reusable Owner decision or permanent governance law. It overrides only the ordinary CORR02 rule that Product results stay unpushed before final Owner visual approval.




Checkpoint target:
- repository: `hamad933/cep-writer-baseline-repo`;
- branch: `writer/presentation-corr02-google-ai-studio`;
- same existing manual clone/worktree and current branch lineage;
- push by Git CLI only; do not use AI Studio built-in GitHub sync for this mission branch.




Checkpoint objective:
- preserve every current mission-relevant Product/source/test/handoff change already present in the exact AI Studio worktree, including completed and clearly identified partial/in-progress B0/B1/B2/B3 work;
- create a bounded continuity manifest under `writer-output/presentation-corr02/` recording exact pre-checkpoint HEAD, exact staged paths, current batch/progress classification, tests actually run, known failures/provider interruption, and resume instructions;
- commit and push the checkpoint to the existing candidate branch even if the work is not yet complete, provided the commit is explicitly classified `CHECKPOINT_ONLY__CANDIDATE__NOT_ACCEPTED__MAY_BE_INCOMPLETE`;
- after push, verify remote branch HEAD equals local checkpoint HEAD.




Do NOT:
- push or merge to `main`;
- create a release/tag-as-acceptance;
- claim B1/B2/B3 complete or accepted merely because bytes are checkpointed;
- discard/reset/revert current progress to make the tree cleaner;
- commit secrets, PAT values, `.env` files, `node_modules`, build caches, generated dependency trees, large screenshot sets, candidate/evidence ZIPs, or unrelated files;
- broaden permissions merely to push workflow files; if `.github/workflows/**` is unexpectedly changed, leave it unstaged and report it for later Controller adjudication unless it was already explicitly in mission scope.




GitHub credential handling:
- preferred AI Studio secret name: `CEP_GITHUB_PAT`;
- never print, echo, cat, log, commit, or embed the token in a remote URL;
- first verify only presence (`test -n "${CEP_GITHUB_PAT:-}"`) without exposing the value;
- use a temporary non-echoing `GIT_ASKPASS` helper or equivalent Git credential mechanism that reads `CEP_GITHUB_PAT` from the environment and remove the helper after push;
- keep the remote URL credential-free: `https://github.com/hamad933/cep-writer-baseline-repo.git`.




Resume law:
After the checkpoint, later Google AI Studio or another controlled environment resumes from the exact remote checkpoint HEAD on `writer/presentation-corr02-google-ai-studio`, re-reads current live authority before further work, inspects the checkpoint manifest/diff/tests, and continues from the first incomplete valid step without blind redo.




This checkpoint changes custody/continuity only. It does not create Product acceptance, promotion, merge, release, stack freeze, final evidence acceptance, or R7 authority.




### 0.9.1 Continuity checkpoint completed and independently verified — 2026-09-22


Controller independently verified the remote continuity checkpoint on GitHub:
- repository: `hamad933/cep-writer-baseline-repo`;
- branch: `writer/presentation-corr02-google-ai-studio`;
- pre-checkpoint HEAD: `35fe286f78c51f5751db8dda297cf0a3a2757ab0`;
- checkpoint/remote branch HEAD: `da007840363d92cdadd9f7c5180449a49e6f1d19`;
- GitHub compare `da007840...` -> branch = `identical`, `ahead=0`, `behind=0`;
- checkpoint is exactly one commit ahead of `35fe286f...` and changes `31` paths (`26 modified + 5 added`); no `.github/workflows/**` path and no secret-like path name is present in that commit.


Continuity preservation is therefore CLOSED/SUCCESSFUL. This verifies custody only; it does NOT accept the Writer's B0/B1/B2 COMPLETE claims or B3 Product quality.


Controller direct checkpoint audit found three material truth items that MUST be resolved before treating the checkpoint as a clean B3 continuation base:
1. Root `assurance/CONTRACT_TEST_RESULTS.json` is `165 PASS / 3 FAIL`, not zero failures. The failed rows are browser evidence/lineage assertions after later source mutation; they are evidence/package truth defects, not automatically Product defects, but the Writer handoff statement `KNOWN_TEST_FAILURES=None` is not authoritative.
2. `assurance/MODEL_TEST_RESULTS.json` records runtime `v22.23.2`, not the governed exact-target Node `v22.16.0`; do not claim exact-target runtime proof from this checkpoint.
3. The B0 EventTarget fix is implemented as global `Node.prototype.closest` and `Window.prototype.closest` polyfills in both `stack/native-typescript/main.ts` and `stack/native-typescript/foundation/accepted-runtime.ts`. This does not satisfy the mission's stated narrow repair form of normalizing non-Element event targets before `.closest(...)` use and introduces duplicated global prototype mutation. Treat B0 completeness as `WRITER_CLAIMED_COMPLETE__CONTROLLER_REVIEW_BLOCKED`; rework/re-falsify through the narrowest existing owner before additional B3 Product mutation.


Resume sequence from the preserved checkpoint:
1. start from exact remote HEAD `da007840363d92cdadd9f7c5180449a49e6f1d19`; never reset to the original baseline and never redo valid B1/B2 work blindly;
2. first perform the bounded B0 prerequisite-correctness correction/review: remove the global prototype workaround and normalize EventTarget safely at the real `.closest` call seams, preserving commands/spatial/window/focus semantics; prove parent-fails/corrected-candidate-passes where practicable and rerun affected regressions;
3. regenerate/reconcile source-bound browser/contract receipts so current evidence identity matches the corrected source; keep loopback blockage truthful;
4. rerun governed-target Node `v22.16.0` runtime checks when available; otherwise record environment limitation;
5. then continue the remaining B3 RQ + Visualize work from the corrected checkpoint lineage.


Do not create a new branch merely for this correction. Keep `writer/presentation-corr02-google-ai-studio`. No main merge/release/acceptance is authorized.


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
































Pay special attention to `OD-20260916-044`, `OD-20260918-055`, `OD-20260918-056`, `OD-20260920-059`, `OD-20260920-060`, `OD-20260921-062`, `OD-20260921-066`, `OD-20260921-067`, `OD-20260921-068`, `OD-20260921-069`, `OD-20260921-070`, and `OD-20260921-071`.
































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
































Final-result remote push remains allowed only after explicit Owner visual approval. Separately, section `0.9` authorizes one immediate pre-final continuity checkpoint push caused by provider interruption. Both use Git CLI from the manual clone, and the Writer may push only to:
`writer/presentation-corr02-google-ai-studio`
































Built-in AI Studio sync must not publish this mission.
































Do not push to or merge into `main`. Do not modify live governance, accept/promote a successor, launch R7, freeze stack, create a release, or claim that a Git commit is accepted CEP authority.
































When the branch is complete and validated, end with:
































`R6_BALANCED6_PRESENTATION_CORR02_BRANCH_READY_FOR_CONTROLLER_AUDIT`

## 17. Controller runtime-audit correction addendum — 2026-09-22 — CURRENT / SUPERSEDES OLD B0-B3 EXECUTION ASSUMPTIONS

This addendum is current mission authority for the next CORR02 work and supersedes earlier wording that treated B0 as zero Product mutation or allowed continuation directly into B3 from the preserved checkpoint.

### 17.1 Exact preserved Product checkpoint

Next correction work derives from Git Product checkpoint commit:
`da007840363d92cdadd9f7c5180449a49e6f1d19`

Fresh exact-current browser receipt reports canonical Product source tree:
`777d8b24032891b00bf3b61858a3be015b0b77fea710e1d5bd446d182577bb51 / 273 files`.

The existing candidate branch checkpoint remains `CANDIDATE_ONLY / NOT_ACCEPTED`. Controller audit-only branch/workflow commits are NOT Product parents and MUST NOT be replayed into Product.

### 17.2 Fresh Controller evidence binding

Read the current Controller finding ledger `R6_PRESENTATION_CORR02_PRE_WRITER_DEEP_DEFECT_AUDIT.md` Drive `1VFEr8f8ptCaJuxeApcnXD-dpWRkqucCW`, including F-001..F-044. Fresh runtime evidence:
- full-carrier run `35670265046`, artifact `10670544348`, 46 genuine-localhost screenshots (`23 × 2`), exact Node `22.16.0`, `npm test 210/210` PASS;
- targeted final run `35671028123`, artifact `10671850032`, responsive RIGHT reveal `22/22 PASS`, current Visualize read-only/provider diagnostics, and Runs shutdown causal proof;
- local-first exact-checkpoint deepening: source `777d8b24032891b00bf3b61858a3be015b0b77fea710e1d5bd446d182577bb51 / 273`; `npm test 210/210`, build and runtime check PASS; F-042 W04 contextual-toolbar binding, F-043 Evidence Candidate verification-assertion path, and F-044 Today continuation availability. Local Playwright evidence is navigation-independent and does not replace genuine-route evidence.

Do not consume superseded targeted run-1 RIGHT selector conclusions.

### 17.3 Current correction sequence

The earlier serial B1/B2/B3 plan is paused. Execute the following sequence instead:

**C0 — Controller-only authority/input refresh. No Product mutation.**
- refresh `cep-writer/` mission/decision/finding/method packet through OD-072 and this addendum;
- classify browser failures according to F-035..F-041;
- verify self-containment and exact hashes.

**C1 — SERIAL SHARED FOUNDATION / CARRIER / REGION CORRECTION. One mutating Writer only.**
Exact objective:
1. close B0/F-013 by removing duplicated global `Node.prototype.closest` / `Window.prototype.closest` mutation while retaining narrow EventTarget normalization at existing seams;
2. close F-001/F-002/F-003/F-004/F-032 by making the shared carrier semantically neutral for non-Structured Surfaces while preserving Library and compatible Structured value through explicit binding;
3. remove generic cross-Surface `surface.mode='read'` semantic leakage; no universal Read/Edit primitive;
4. close F-042 at the shared action-carrier seam: selected Surface/collection context must be bound into toolbar availability and execution through a reusable contextual payload/provider contract, and selection changes must refresh toolbar availability; the shared owner must not synthesize W04 or other domain semantics;
5. close F-005/F-021/F-033 region-binding defects by binding Profile-defined LEFT/CENTER/RIGHT/BOTTOM/TOOLBAR roles into the existing shared hosts rather than rendering right/bottom substitutes inside CENTER;
6. preserve the existing responsive pane mechanism; final genuine-route test must keep `22/22` RIGHT reveal behavior at `1024×900`;
7. prohibit new consumer-specific CSS masks as the primary fix. Existing compatibility masks may remain only when explicitly classified temporary and no longer required for semantic correctness.

C1 MUST NOT rewrite W04 data, Today provider data, RQ acceptance records, Visualize provider mutability, W03 synthetic domain data, SQLite, persistence, runtime, or dependencies. Those are downstream domain/provider lanes.

C1 candidate evidence must prove at both governed viewports:
- Library + Learn retain applicable Structured donor value;
- all unrelated Surfaces have no Library Read/Edit/explicit Save/KU identity/document-context leakage;
- profile-required RIGHT uses the shared pane and reveal path;
- Surface-specific inspectors/LEFT/BOTTOM bindings are present where the profile requires them;
- central correction propagation occurs without consumer-local workarounds;
- exact revert proof demonstrates central ownership;
- `npm test`, build, current check/harness classifications, duplicate-owner scan and 23-Surface fresh screenshots are regenerated.

**C2 — W04 Product data/action truth.** Starts only from clean C1. Close F-022..F-026/F-038/F-043 and the domain-semantic half exposed by F-042 without inventing authority/provider facts. The shared C1 context transport must be consumed, not duplicated.

**C3 — Today provider/epistemic truth.** Starts only from clean C2 or from the exact C1 parent if Controller proves no W04 dependency. Close F-007..F-011/F-044 and Today-specific region/data/continuation truth while preserving no-write/no-access-decision ceilings.

**B3-R — RQ + Visualize.** Resume only after C1 and applicable data prerequisites. RQ must not present NON_PRODUCTION acceptance data as current Product truth. Visualize must close F-034/F-035 truthfully; do not make the local acceptance projection canonical/writable merely to satisfy old tests. Update stale browser relation tests under F-036 instead of forcing Product to match invalid assumptions.

Remaining original batches resume only after these shared/data gates.

### 17.4 Browser/check classification law for the next Writer

Do not treat `npm run browser:test` current `2 PASS / 4 FAIL` as four Product defects. Current Controller classification:
- three relation/central-change failures = stale harness assumptions against current read-only Visualize provider, while F-035 independently keeps the Profile/provider binding open;
- Runs `runtime-causal-consequence` failure = stale harness API dereference; targeted genuine-route Product causal path is PASS;
- post-browser `browser.current_candidate_claim_truthful` = PASS;
- targeted-visual check remains evidence-package open because legacy screenshot manifest has one screenshot and is not the same evidence class as the Controller 46-shot full-carrier set.

A Writer may correct a test/harness only where the mission explicitly authorizes that harness path and must prove it is correcting stale evidence logic, not weakening a valid oracle. Product source must not be changed merely to make a stale harness green.

### 17.5 Visual method

Bind `OD-20260922-072` and `WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md` Drive `1W7CC1tGXmLShF240uKnjq4MpMx2J7e9V`. Localhost restriction alone is not a screenshot/video blocker. Every material screenshot must be opened and inspected; full-carrier negative assertions must check both required Surface semantics and absence of foreign donor semantics.

### 17.6 Writer throughput / evidence-locality law — OD-20260922-073

For C1 and every later CORR02 Writer, use the local workspace as the primary development and visual-analysis loop. Intermediate screenshots, crops, diffs, videos, logs and generated comparison artifacts are local scratch by default and are not GitHub/Drive deliverables. Their purpose is to expose weaknesses and drive repeated correction.

Required working loop where a governed visual reference exists:
`open exact reference -> decompose/crop material regions and states as useful -> capture current exact candidate -> compare corresponding regions/states -> record concrete mismatch -> correct narrowest owner -> rerender/recapture -> compare again -> repeat`.

Only final representative source-bound captures/results that materially prove the handoff are promoted to durable evidence. `CHATGPT_WRITER` must not use the GitHub connector as a bulk evidence/file-transfer channel; heavy final generated custody goes to Drive only when needed. Preserve GitHub for source/delta plus small mission/handoff receipts. Google AI Studio retains its bounded final-evidence branch exception because it lacks governed Drive output, but intermediate evidence churn still remains local.

This changes transport/evidence workflow only; it does not relax exact parent, C1 scope, visual inspection, falsification, final evidence, Controller audit or no-self-promotion gates.



### 17.7 Post-C1 Writer Workspace Capsule activation law — OD-20260922-074

C1 remains exactly bound to its current self-contained packet at `writer/presentation-corr02-google-ai-studio@bcbb1ac2d09e30b21062fabeccf7a1aaa2b30a2d`; do not rebuild/repackage C1 merely to adopt a new transport method.

After independent Controller adjudication produces an exact clean C1 parent, the first downstream mutating Writer (normally C2 if launchable) MUST use `SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE_V1` or a Controller-accepted successor. Canonical method Drive `1XtJlxnWIFZe_AmiLX7QXKVk31IjRQj7n`.

Required downstream lifecycle:
`exact Controller-adjudicated parent/source -> exact mission-bound capsule staging branch -> automated single artifact -> offline/local verify + materialize -> local-first mutation/test/browser/visual loop -> bounded final handoff -> independent Controller audit`.

The capsule may package broad stable task-relevant knowledge, but mutation authority remains exactly the active mission scope. No capsule/workflow/artifact PASS creates Product acceptance, readiness, merge, release, provider truth or authority. Do not silently repair a capsule with live connector reads; identity/input mismatch is a Controller rebuild condition.

### 17.8 Controller-prepared Capsule v1.1 / Visual Bootstrap activation — OD-20260922-075

This changes only the **post-C1 Writer preparation/transport method**. C1 remains grandfathered at exact packet HEAD `bcbb1ac2d09e30b21062fabeccf7a1aaa2b30a2d`.

For the first downstream Writer launched after exact Controller-clean C1 (normally C2 if launchable), the Controller MUST prepare a `SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE_V1_1` before handoff. The Writer does not assemble the capsule, repository snapshot, initial capture harness or initial baseline.

For a Presentation/interaction-heavy downstream mission, the Controller must bind and package, when technically available:
- exact source/branch and complete mission packet;
- task-bound reusable capture harness/method;
- bounded current-parent baseline screenshots at the governed viewport/state set;
- source-bound raw capture receipts;
- `VISUAL_BOOTSTRAP_MANIFEST.json` with screenshot/receipt hashes, viewport/state metadata and reference mappings;
- local-recapture fallback instructions.

Writer first-pass work is:
`verify -> materialize -> inspect prebuilt baseline/reference mapping -> compare -> diagnose -> fix -> fresh local recapture -> compare again`.

Bootstrap images never satisfy final evidence/acceptance by themselves. Missing/partial bootstrap states may be recaptured locally using the packaged harness; no connector-driven per-file setup or silent screenshot/source substitution is permitted.


### 17.9 C1 Controller acceptance / C2 parent binding — 2026-09-22

C1 is now `CONTROLLER_ACCEPTED` for its bounded shared-owner scope. Exact downstream parent is final branch HEAD `ac888c7e622fdefdc4f958771b21db485e33f9fc`; validated Product tree is unchanged from Product HEAD `7fbc25f781e7b8e9fe3eba72f5a57ffe2ed96c1c`; accepted Product source is `5885c32a71c14b1b982ec8dcdadba4fafde40c78b2d9287f367f1ca28373f91d / 273`.

Accepted closure: `F-013`, `F-001`, `F-002`, `F-003`, `F-004`, `F-005`, `F-021`, `F-029`, `F-032`, `F-033`, `F-042`.

The next legal mutating lane is **C2 — W04 Product data/action truth**, and it MUST start from the exact accepted C1 parent above through `SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE_V1_1`. C2 owns only `F-022..F-026`, `F-038`, `F-043` plus the domain-semantic half exposed by F-042. It must consume the accepted C1 contextual-toolbar mechanism rather than duplicate it. C3/B3-R/later W03 remain HOLD.

The C1 handoff's unbound `43/46 byte-identical` sentence is superseded by Controller audit: it is a nonblocking evidence-accounting ambiguity; final C1 visual evidence itself is accepted after direct Controller inspection of all 46 source-bound screenshots.
