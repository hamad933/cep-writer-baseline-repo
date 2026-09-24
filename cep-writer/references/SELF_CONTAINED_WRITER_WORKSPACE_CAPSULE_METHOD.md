# CEP — SELF-CONTAINED WRITER WORKSPACE CAPSULE METHOD


**Role:** reusable inbound workspace materialization and bounded outbound custody method for CEP Writers  
**Authority class:** execution/transport method only; never Product, mission, Owner-decision, acceptance, merge, release or readiness authority  
**Version:** `CAPSULE_V1_1 + VERIFIED_CONTINUATION_V1`  
**Applies to:** `CHATGPT_WRITER` by default after CORR02 C1; later Writer classes when explicitly bound by the Controller


## 1. Core law


Use one exact, self-contained inbound workspace artifact instead of connector-driven per-file repository assembly whenever the Writer can execute locally.


Preferred lifecycle:


`Controller resolves live authority -> exact parent/source + mission packet -> capsule staging branch -> automated capsule build -> ONE inbound artifact -> offline/local verification -> local workspace materialization -> local analysis/edit/build/test/browser/visual loop -> bounded final result custody -> Controller audit`


The capsule reduces transport overhead. It does not lower any authority, scope, truth, testing, visual-inspection, falsification, or Controller-review gate.


## 2. C1 grandfathering / activation boundary


CORR02 `C1_SERIAL_SHARED_FOUNDATION_CARRIER_REGION_CORRECTION` remains bound to its already prepared packet at `writer/presentation-corr02-google-ai-studio@bcbb1ac2d09e30b21062fabeccf7a1aaa2b30a2d` and MUST NOT be repackaged merely to adopt this method.


The first downstream Writer launched after an exact Controller-clean C1 adjudication (normally C2 if C2 becomes launchable) MUST use `CAPSULE_V1_1` or a Controller-accepted successor method.


## 3. Knowledge-wide, mutation-narrow


A capsule MAY include all stable mission-relevant knowledge that materially improves local execution efficiency: Product/source bytes, mission-bound authority packet, applicable Owner decisions, SurfaceProfiles, oracles, visual references, domain references, harnesses, fixtures and reusable methods.


A capsule MUST NOT widen mutation authority merely because additional knowledge is present. The active mission still binds exact writable/read-only/prohibited scope and Stop Gate.


For a genuinely new mission/lane, environment reset, or source transition where no trusted exact continuation workspace can be verified/reconstructed, build a successor capsule from the exact Controller-adjudicated parent.


For a **correction/repair continuation of a recent Writer result**, do **not** automatically build another full capsule merely to restage source and stable references already under exact custody. Apply `OD-20260922-076` and prefer `VERIFIED_INCREMENTAL_CONTINUATION`: verify the exact current candidate directly when the same Writer still has it, or reconstruct it from the nearest verified capsule/base plus the exact ordered candidate-delta/git-bundle chain. Stable reference material and harnesses may be reused by exact identity; source identity must still advance exactly. A new full capsule is the fallback when exact continuation cannot be proven safely.


## 4. Required capsule payload


A mission-bound capsule contains at minimum:


1. `repo.bundle` — Git bundle containing the exact source commit/ref used to materialize the local workspace.
2. `CAPSULE_BINDING.json` — Controller-created mission binding: mission ID, Writer class, expected source commit/tree, Product source identity, candidate branch, authority root, writable/read-only/prohibited scope, applicable decisions, Stop Gate and custody law.
3. `CAPSULE_MANIFEST.json` — generated source ref/commit/tree + payload byte/hash manifest.
4. `SHA256SUMS.txt` — payload checksums.
5. `bootstrap.sh` and `bootstrap.ps1` — local materialization helpers.
6. `verify_capsule.py` — offline payload + Git-bundle verifier.
7. `README_FIRST.md` — exact capsule identity and first-step instructions.
8. the complete mission-bound `cep-writer/**` packet and every required local reference named by its manifest.
9. `visual-bootstrap/VISUAL_BOOTSTRAP_MANIFEST.json` — exact parent/source binding, capture status, screenshot/receipt hashes, viewport/state metadata, reference bindings and comparison plan.
10. `visual-bootstrap/baseline-current/**` plus `raw-receipts/**` when Controller-bound capture is material and technically available.
11. the reusable/task-bound capture harness or exact local method needed for Writer recapture when a state is missing or after Product mutation.


Optional large dependency/offline-tool packs are separate governed payloads and are included only when the environment actually requires them. Do not pack `node_modules`, build caches, stale generated results, unbounded screenshot/video dumps or reproducible bulky outputs by default. A bounded mission-bound Visual Bootstrap Pack is explicitly allowed and expected where initial Presentation/interaction comparison materially benefits the Writer.


## 5. Capsule build law


Before building a real mission capsule the Controller MUST:


- re-read live governance/current state/applicable Owner decisions;
- bind the exact Controller-adjudicated parent/source identity;
- bind the exact mission and active mutation lane;
- include every required input locally and prove `noRequiredLiveDriveFetch=true` where applicable;
- include exact hashes for mission/decision/profile/oracle/reference inputs;
- ensure candidate/source bytes and task packet agree;
- preserve accepted predecessors and historical candidates immutably;
- build from a dedicated capsule/candidate branch, never by mutating accepted source in place;
- never use capsule packaging to merge sibling candidates or bypass semantic convergence.


## 6. Automation / Workflow law


The standard implementation is `SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE_V1_1`:


- GitHub infrastructure template branch: `controller/writer-workspace-capsule-v1`;
- workflow path: `.github/workflows/build-writer-workspace-capsule.yml`;
- builder: `tools/writer-capsule/build_capsule.py`;
- verifier: `tools/writer-capsule/verify_capsule.py`;
- binding template: `cep-writer/CAPSULE_BINDING.template.json`.


For a real mission, create a staging branch from the exact authorized parent, replay/copy only this small capsule infrastructure plus the exact mission packet/binding, and trigger the workflow. The workflow is a byte-packaging mechanism only.


`workflow PASS != Product PASS != mission acceptance`.


## 7. Writer inbound law


For `CHATGPT_WRITER`:


1. download the single capsule artifact once;
2. verify `CAPSULE_MANIFEST.json`, SHA-256 values and `git bundle verify`;
3. materialize the local workspace from `repo.bundle`;
4. verify local HEAD/tree/Product source identity against `CAPSULE_BINDING.json`;
5. read the mission packet locally;
6. perform code search, analysis, edits, builds, tests, browser/visual work locally.


On identity/hash/input mismatch, STOP as:


`WRITER_CAPSULE_IDENTITY_MISMATCH`


Do not silently fetch live GitHub/Drive files to patch a broken capsule. The Controller corrects/rebuilds the capsule.


### 7.1 Verified correction continuation inbound law — OD-20260922-076


A full Capsule is the **initialization / fresh-isolation / fallback transport**, not an obligatory wrapper around every successive correction. For a bounded continuation whose exact Writer result has already been independently reconstructed/audited and retained by the Controller as a legal correction base, use this ordered admission ladder:


1. **DIRECT_VERIFIED_WORKTREE** — same Writer may continue in the same local workspace only when exact `HEAD`, `HEAD^{tree}`, canonical Product-source identity and clean status all match the Controller-bound continuation parent. Any mismatch rejects this path.
2. **EXACT_RECONSTRUCTION_FROM_EXISTING_CUSTODY** — a new Writer or lost/untrusted workspace reuses the nearest already-verified Capsule/base, then applies/fetches the exact ordered candidate delta/git-bundle chain with every prerequisite commit, bytes/SHA, ancestry and final identity verified. A delta that requires an earlier transport commit is never treated as standalone.
3. **NEW_FULL_CAPSULE_FALLBACK** — Controller prepares a new full Capsule only when paths 1/2 are unavailable or unsafe; required lineage bytes are missing/ambiguous; the reconstruction chain becomes materially error-prone; mission-bound references/harnesses changed enough that lightweight reuse would recreate connector-driven setup; or fresh isolation materially improves correctness.


The Controller provides a **lightweight continuation overlay/binding** for paths 1/2. It binds, at minimum:
- exact correction parent HEAD/tree/Product-source identity and its classification (`CANDIDATE_ONLY`, `SALVAGEABLE_CORRECTION_BASE`, or other exact state);
- exact reconstruction recipe and prerequisite artifact IDs/hashes when direct worktree continuation is unavailable;
- open findings and preserved/closed findings;
- writable/read-only/prohibited paths plus reusable-owner/architecture locks;
- required positive + negative falsification/regression/browser/visual gates;
- exact final output custody and immutable predecessor custody;
- Stop Gate and no-self-promotion/no-merge/no-release ceilings.


The continuation overlay is authority/mission transport, **not** a Product merge mechanism. Never reconstruct a candidate by manual changed-file overlay or sibling ZIP overlay.


## 8. Local-first development loop


Once materialized, connector access leaves the critical development path.


Preferred loop:


`local source inspection -> governed reference decomposition/cropping -> current local capture -> region/state comparison -> diagnose -> narrow owner fix -> build/rerender -> recapture/reinspect -> repeat`


Intermediate screenshots, crops, diffs, videos, logs, build outputs and comparison artifacts remain local/ephemeral by default under `OD-20260922-073`.


## 9. Outbound result law


The Writer should not upload every intermediate state.


At the mission Stop Gate, produce one bounded result handoff containing, as applicable:


- exact starting capsule/commit identity;
- exact final local source/commit/tree identity;
- Product delta manifest;
- test/falsification results;
- final representative evidence only;
- truthful blockers/unavailable classifications;
- final source bundle/patch/candidate package when needed for Controller audit.


Heavy final generated result custody belongs to Google Drive for `CHATGPT_WRITER` when materially required. GitHub remains source/delta + small receipt transport. Controller publication/convergence occurs after independent audit; Writer output does not self-promote.


For correction continuations, predecessor candidate/result artifacts are **immutable lineage**. Do not replace or overwrite the previous candidate ZIP, bundle, evidence pack or handoff merely because a newer correction exists. The new correction produces a new successor commit/candidate/delta/evidence/handoff whose parent/ancestry points to the exact predecessor. This preserves auditability and allows later reconstruction without full-capsule repackaging.


## 10. Google AI Studio distinction


`GOOGLE_AI_STUDIO_WRITER` may continue using the bounded candidate-branch final-evidence exception because governed Drive output may be unavailable there. This does not justify connector-driven intermediate evidence churn and does not change Product authority.


## 11. Negative rules


Never:


- treat a capsule as a second governance/control plane;
- place mutable live `CURRENT_STATE.md`, full live governance or full live Owner register into the Writer packet as live authority;
- infer authority from artifact presence, workflow PASS, filename or branch placement;
- build a capsule from an unadjudicated sibling overlay;
- silently substitute another source when exact bytes are unavailable;
- bundle large generated evidence merely for convenience;
- change Product architecture because a connector, network or packaging mechanism is inconvenient;
- allow a broad capsule to create broad mutation authority.
- rebuild a full Capsule for every correction when an exact Controller-audited candidate can be safely verified/reconstructed under OD-20260922-076; equally, never force continuation when lineage cannot be proven safely.




## 12.1 Controller-prepared ready-to-work capsule — OD-20260922-075


Capsule assembly, initial harness binding and initial baseline preparation are **Controller responsibilities**. The Writer does not spend its first execution budget reconstructing the repository, choosing the capture harness, manufacturing a baseline merely to start comparison, or using GitHub/Drive connectors as a per-file setup mechanism.


For every real mission the Controller classifies whether an initial Visual Bootstrap Pack is `MATERIAL`, `OPTIONAL`, or `NOT_APPLICABLE`.


When `MATERIAL` and technically available, the Controller/workflow MUST prepare the pack from the **exact capsule source parent** before handoff. It contains, as applicable:


- source-bound current-parent screenshots for the exact governed viewport/state set;
- raw capture/harness receipts sufficient to identify how each screenshot was produced;
- screenshot SHA-256/bytes plus exact source commit/tree binding;
- viewport, Surface, object/state and route/render classification;
- governed reference paths/classifications and a comparison-plan mapping;
- the reusable harness/capture method the Writer can rerun locally after mutation.


The initial screenshots are classified:


`CONTROLLER_PREPARED_BOOTSTRAP_ONLY__NOT_FINAL_ACCEPTANCE_EVIDENCE`


They accelerate first-pass defect discovery. They never prove the Writer result, never replace fresh post-mutation capture, and never create Product/mission/acceptance authority.


Writer first-pass lifecycle becomes:


`DOWNLOAD ONCE -> VERIFY -> MATERIALIZE -> OPEN PREBUILT BASELINE + REFERENCE BINDING -> COMPARE -> DIAGNOSE -> NARROW FIX -> RECAPTURE LOCALLY -> RECOMPARE -> REPEAT`


If the bootstrap is partial, unavailable, stale or missing a needed state, the Writer may use the packaged harness/method for local recapture. The Writer MUST NOT rebuild the capsule, silently substitute screenshots from another source identity, or fall back to connector-driven repository/evidence assembly.


A bootstrap failure is a transport/capture classification, not a Product defect. The Controller decides before launch whether a missing bootstrap state is acceptable with local-recapture fallback or requires capsule rebuild.


## 12.2 Visual Bootstrap Pack identity law


Every `VISUAL_BOOTSTRAP_MANIFEST.json` must bind:


`missionId -> exact source commit -> exact source tree -> capture command/harness ID -> viewport/state -> screenshot/receipt path -> bytes -> SHA-256 -> reference binding -> bootstrap classification`.


The capsule verifier must reject a bootstrap pack whose source commit/tree differs from the capsule source. A screenshot without exact source binding is not eligible for the bootstrap pack.


The pack should be **bounded and task-relevant**. Prefer representative, comparison-useful screenshots and raw receipts over a massive evidence archive. Intermediate/future Writer recaptures remain local under OD-073.






## 12.3 Bootstrap tracked-source immutability guard


Controller-prepared bootstrap execution may install/setup temporary execution tooling and may generate untracked/ignored screenshots, receipts, logs, caches or transient browser/runtime material. It MUST NOT mutate tracked Product/source/authority bytes merely to prepare the Writer.


The standard v1.1 implementation separates `setupCommands` from `captureCommands`, checks the tracked Git diff/index before execution, re-checks after setup/capture, and re-checks before capsule packaging. Any tracked path change is a hard build failure. `VISUAL_BOOTSTRAP_MANIFEST.json` and `CAPSULE_MANIFEST.json` must record `trackedSourceGuard=PASS` before handoff.


This guard does not prohibit normal Writer Product mutation after verified local materialization; it governs only Controller-side capsule/bootstrap preparation.


## 13. Acceptance of the transport method


The method itself is considered operationally proven only when a validation capsule demonstrates:


- exact trigger/source commit captured;
- exact source tree captured;
- `repo.bundle` verifies;
- a clean local materialization reaches the exact source commit;
- manifest byte/hash checks pass;
- no Product bytes are changed merely by packaging;
- the artifact can be consumed through one bounded download/materialization flow.


A future method revision must preserve these guarantees or explicitly supersede this file through governance.






## 14. Identity separation and standalone-verification law


A real capsule has two different Git identities and MUST NOT collapse them:


1. `expectedProductParentCommit` — the exact Controller-adjudicated Product/base parent bound before capsule preparation.
2. `capsuleTransportCommit` / `capsuleTransportTree` — the exact final staging HEAD/tree generated after mission packet, capsule infrastructure and Controller binding are present.


Do not place a self-referential `expectedSourceCommit=HEAD` inside a tracked binding/config and then require the final HEAD to equal that value; updating the binding itself changes HEAD. The builder must instead prove the bound Product parent exists and is an ancestor of the capsule transport HEAD, while `CAPSULE_MANIFEST.json` records the exact final transport commit/tree.


`verify_capsule.py` MUST work from an empty directory with no pre-existing Git repository. `git bundle verify` therefore runs inside a temporary bare verification repository (or an equivalent standalone-safe mechanism), and bundle refs must expose the exact capsule transport commit.


The downloaded artifact is the verification target. Pre-upload workflow PASS is insufficient if transport can omit bytes. Every manifested file—including hidden-path payloads when present—must survive artifact upload/download and re-verify by size/SHA-256.


## 15. Operational validation receipt — Capsule v1.1


`CAPSULE_V1_1` transport/materialization is operationally proven by validation mission `MISSION_CAPSULE_V1_1_END_TO_END_VALIDATION`.


Final proof:
- run `35680790334` = SUCCESS;
- validation branch HEAD `245fbbdb98dd4917ef9b2a9569e4cc280222e2fb`;
- transport tree `d43a7fc76c999b0773298d43d66e28c61de3011d`;
- artifact `10674707888`;
- downloaded artifact ZIP SHA-256 `cff06b057972753716897e8900f70157cce7dd736bec038b76d6fc1299e5b417`;
- standalone verifier from empty cwd PASS;
- clean bootstrap materialization PASS;
- exact HEAD/tree match PASS;
- clean worktree PASS;
- `trackedSourceGuard=PASS`;
- Visual Bootstrap `READY`;
- two validation PNG files (`1440x1000`, `1024x900`) plus one source-bound receipt, all hash-verified;
- zero Product-path delta against bound Product parent.


The validation images are deterministic fixture-only transport probes and are not CEP Product/Presentation/acceptance evidence.


This closes the method-level runtime validation gate only. Every mission-specific capsule still requires exact live Controller authority reconstruction, exact current Product parent binding, mission-specific authority/reference completeness, applicable real capture harness/reference mapping, and downloaded-artifact verification before Writer Product mutation.


## 16. Verified Incremental Continuation v1 — global correction workflow


`VERIFIED_CONTINUATION_V1` is the standard correction-loop companion to `CAPSULE_V1_1`. It does not replace the full Capsule method for new missions; it prevents unnecessary restaging during iterative Writer correction.


Preferred lifecycle:


`Writer candidate -> Controller independent audit -> ACCEPT OR SALVAGEABLE_CORRECTION_BASE -> bind exact continuation parent -> DIRECT_VERIFIED_WORKTREE OR EXACT_RECONSTRUCTION_FROM_EXISTING_CUSTODY -> lightweight correction overlay -> local correction loop -> NEW successor candidate/delta/evidence -> Controller audit`


Controller continuation admission checklist:
1. previous candidate artifact/source identity is exact and independently reconstructable;
2. exact parent commit/tree/Product-source identity is bound;
3. prior candidate remains immutable and is not promoted merely by reuse;
4. open findings are explicit and all previously closed value is listed as regression-only/preserved;
5. reconstruction path is deterministic and every prerequisite artifact has exact bytes/SHA/ancestry;
6. same-Writer direct continuation requires clean status; untrusted local state forces reconstruction;
7. no sibling-ZIP/file overlay; semantic/source lineage is Git/canonical-delta based;
8. new output is a successor candidate, never an in-place overwrite;
9. full Capsule fallback is triggered when continuation loses exactness, completeness, self-containment or safety;
10. independent Controller review remains mandatory before acceptance.


A Controller may optionally compact a long correction chain into a fresh verified checkpoint/full Capsule when doing so materially reduces reconstruction risk or future transport cost. Compaction is a transport optimization only; it does not alter accepted/candidate authority or erase predecessor lineage.