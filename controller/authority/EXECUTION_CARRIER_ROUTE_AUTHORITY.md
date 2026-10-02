# CEP — EXECUTION CARRIER ROUTE AUTHORITY


**Role:** canonical execution-carrier separation/profile authority
**Custody:** mode-resolved: Drive canonical before cutover; `controller/authority/EXECUTION_CARRIER_ROUTE_AUTHORITY.md` canonical after explicit `GITHUB_CANONICAL` cutover
**Update mode:** STABLE_NAME__IN_PLACE
**Authority:** latest Owner decision + CURRENT_STATE + CONTROLLER_GOVERNANCE
**Current governing decisions: OD-20260916-043, OD-20260921-066, OD-20260921-067, OD-20260922-072, OD-20260922-073, OD-20260922-074, OD-20260922-075, OD-20260922-076, OD-20260924-081, OD-20260924-082, OD-20260925-083 (ROUTE-LOCAL only), OD-20261002-087 (current agentic multi-Writer topology). OD-20260928-085 is historical task-specific lineage; OD-20260925-084 is superseded duplicate merged into OD-20260921-067.


## 1. Core separation law


CEP Mission/DAG authority and Writer execution-carrier authority are separate control dimensions.


A Mission defines WHAT may be changed and proven:
- exact parent/source identity;
- findings/objective;
- writable/read-only/prohibited paths;
- owner/collision locks;
- tests/falsification/evidence;
- output/STOP/acceptance ceilings.


An Execution Carrier defines HOW that exact Mission is transported/executed:
- local vs hosted/chat execution environment;
- branch/worktree topology;
- serial vs parallel execution policy;
- shell/runtime/tool inheritance checks;
- client/provider/model binding;
- local path/custody conventions;
- remote-write/push policy;
- browser/MCP/tool permissions.


No carrier-specific rule may be copied, inferred or propagated to another carrier unless the Owner or exact Controller mission binding explicitly says so.


## 2. Recognized Writer execution carriers



### ROUTE-MIMO-AGENT — CURRENT ACTIVE AGENTIC CARRIER

Authority: `OD-20261002-087` ACTIVE. `OD-20260928-085` is historical task-specific lineage.

Current topology:
- multiple mutating Writers MAY run concurrently;
- one Writer per exact bounded Surface/lane at a time;
- parallel launch requires disjoint writable paths, compatible canonical-owner boundaries, and no unresolved dependency edge;
- shared hotspots, same-owner mutations, final wiring, integration/convergence and true dependencies serialize;
- Controller/Coordinator constructs and revalidates the DAG, binds exact parents/scopes, receives results, independently audits each candidate, and admits only verified deltas/checkpoints;
- interrupted/partial Writer work is salvage input and must not be discarded or promoted merely because files/results exist;
- branch/worktree layout may use isolated candidate branches/worktrees as needed to prevent collisions; no direct main mutation/self-promotion;
- Product acceptance, main merge, release, deployment and stack freeze remain separately gated.

This carrier inherits global value-weighted parallelism from `OD-20260916-043` and carrier isolation from `OD-20260924-081`. It does not inherit ROUTE-LOCAL paths/no-push rules or ROUTE-CHATGPT Capsule ceremony unless an exact mission explicitly rebinds them.

### ROUTE-LOCAL — LOCAL_EXECUTION


Purpose:
Owner-machine/local repository execution using a locally connected coding Writer/model/client.


Current local repository:
`D:\projects\Enterprise-Projects\cep-writer-baseline-repo`


Current governed local baseline environment:
- OS: Windows 11
- Node: `v22.16.0`
- npm: `10.9.2`
- repository baseline at current D03A launch preparation: `main@37c4d765e1db854505c81cbd15b90d4715f6690e`
- tree: `57dbde7a730c687a341748dad4a725a052653f0b`
- current local model target for D03A: `Kimi K3`
- local coding client is NOT durably frozen by this profile; bind the exact client/provider/model per current task when materially relevant.


Current durable local topology under OD-20260924-080 as scoped by OD-20260924-081:
- ONE persistent local Writer;
- stable non-main local candidate branch `writer/cep-serial`;
- local execution remains one persistent Writer on one governed local lineage unless the Owner changes the carrier/topology;
- task ordering/grouping and audit boundaries are Owner-controlled under OD-20260924-082;
- when the Owner explicitly groups multiple local tasks for continuous execution, the Writer may cross those task boundaries without a Controller-invented STOP/audit gate, while preserving exact task scopes, checkpoints/receipts, collision locks and lineage;
- no task may self-accept or silently widen scope merely because it is grouped.


Local-environment rules:
- the local AI agent must prove its OWN cwd/branch/HEAD/tree/Node/npm/executable/status before first mutation;
- a visible human terminal result does not automatically prove the agent subprocess environment;
- client-generated local residue such as `.kilo/`, `.zcodeignore`, IDE metadata or similar must never be treated as Product authority or committed automatically; inspect/classify it if present;
- local file paths, shell behavior, environment inheritance, browser installation and local tool notes belong only to ROUTE-LOCAL unless explicitly generalized.


Current D03A task-specific transport rule:
- Writer-side `git push` is NOT authorized for D03A before Controller audit.
- This NO-PUSH rule is current D03A Mission/State sequencing, NOT a durable rule for every future local Mission unless the Owner generalizes it.


### ROUTE-CHATGPT — CHATGPT_WRITER


ChatGPT Writer execution is a separate carrier.


It does NOT inherit from ROUTE-LOCAL:
- `writer/cep-serial`;
- one-persistent-local-Writer assumption;
- strict local serial execution;
- local Windows paths;
- local Node executable path;
- local client/provider/model configuration;
- local D03A NO-PUSH task instruction;
- local browser/client residue rules except generic repository hygiene principles.


Unless an exact newer carrier-specific Owner decision or Mission says otherwise:
- apply general Writer governance;
- apply exact Mission/DAG dependency and collision law;
- use OD-20260916-043 value-weighted parallelism where safe;
- use OD-20260921-066 mission-bound candidate branch workflow for repository-based mutating ChatGPT Writers;
- multiple ChatGPT Writers may be serial or parallel according to the exact current DAG and collision locks.


#### ROUTE-CHATGPT mandatory Controller operating profile — consolidated existing law
This is a zero-loss operating index, not a new Owner Decision. Before any ChatGPT Writer preparation/launch/continuation/review, Controller must apply together: OD-066 branch law; extended OD-067 closed read-set/self-containment; OD-072 visual capability separation; OD-073 local-first evidence custody; OD-074/075 Capsule v1.1 + Controller-prepared bootstrap; OD-076 verified continuation; and OD-081 carrier isolation.
- New ChatGPT mission/lane defaults to Controller-prepared `CAPSULE_V1_1`; do not use connector-heavy per-file workspace assembly as the normal path.
- Use `VERIFIED_CONTINUATION_V1` only when exact prior candidate/worktree/reconstruction identity and immutable lineage have independently passed OD-076 continuation admission.
- Controller resolves live Drive authority and supplies exact parent/source, mission overlay, closed read set, references/profiles/oracles, write locks, and mission-relevant harness/bootstrap. Writer does not reconstruct governance from chat memory or broad Drive/repo archaeology.
- After capsule/continuation materialization, Writer must prove actual HEAD/tree/clean status and actual tool/runtime/browser identity before mutation. Historical ChatGPT Node/Chromium/Playwright versions are capability examples only.
- GitHub/API/connector is for exact identity/source/diff/commit/ref transport and small receipts; do not use it for bulk screenshots/videos/generated build output or blob-by-blob workspace/evidence assembly when local materialization exists.
- Google Drive is live Controller governance and heavy final generated-output custody. Intermediate screenshots/crops/diffs/logs/build outputs remain local/ephemeral by default.
- `NAVIGATION_FAILURE != RENDERING_FAILURE`. Follow the governed visual recovery ladder. Navigation-independent real-browser rendering is `NOT_GENUINE_ROUTE` and cannot close genuine HTTP/Back-Forward/network/platform gates.
- Any UI/Presentation-visible mutation is a `VISUAL_IMPACTING_MISSION`; bind the complete visual lifecycle and exact references/profiles/oracles in the mission prompt.
- ChatGPT does not inherit `writer/cep-serial`, local one-writer seriality, Owner-machine Windows/fnm/Kimi facts, or ROUTE-LOCAL no-push. Mutating repository missions use a mission-bound candidate branch unless exact newer ChatGPT authority says otherwise.
- Safe parallelism is value/DAG/collision based. Shared hotspots/final convergence serialize.
- If exact execution bytes cannot be materialized and verified, STOP/rebuild transport; never lower a build/runtime/browser/visual gate to source-only inference.
Canonical methods: `SELF_CONTAINED_WRITER_WORKSPACE_CAPSULE_METHOD.md` Drive `1XtJlxnWIFZe_AmiLX7QXKVk31IjRQj7n`; `WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md` Drive `1W7CC1tGXmLShF240uKnjq4MpMx2J7e9V`.
### ROUTE-GOOGLE-AI-STUDIO — GOOGLE_AI_STUDIO_WRITER


Google AI Studio Writer execution is a separate carrier.


It does NOT inherit ROUTE-LOCAL branch, seriality, Windows-shell, Kimi/client, local path or D03A NO-PUSH rules.


Unless an exact newer carrier-specific Owner decision or Mission says otherwise:
- apply general Writer governance;
- use exact Mission/DAG dependencies and collision locks;
- apply OD-20260916-043 value-weighted parallelism where safe;
- use OD-20260921-066 mission-bound candidate branch workflow for repository-based mutating Google AI Studio Writers;
- serial/parallel execution is mission/DAG-bound, not inherited from ROUTE-LOCAL.


### FUTURE CARRIERS


A future Writer carrier may be admitted without changing Product architecture.
Before launch it must receive:
- a stable route ID/profile;
- exact mission binding;
- branch/transport law;
- tool/environment truth;
- custody/output rules;
- collision relationship with simultaneously active carriers.


Never infer a future carrier's workflow from another carrier.


## 3. Cross-carrier laws that remain global


The following are carrier-independent unless explicitly superseded:
- latest explicit Owner decision wins;
- exact parent/source identity;
- bounded mission scope;
- writable/read-only/prohibited paths;
- owner/collision locks;
- reuse law;
- four separate truths;
- truthful provider/persistence/runtime ceilings;
- positive + negative/falsification proof;
- CANDIDATE_ONLY / NO_SELF_PROMOTION;
- Writer PASS does not create acceptance;
- no direct Writer mutation of live Controller governance;
- Controller independently audits exact results before acceptance/promotion;
- no sibling ZIP overlay;
- no Product release/deployment/stack freeze without separate authority.


## 4. Carrier-binding requirement for every mutating Mission


Before launch, every mutating Mission must explicitly state:


`EXECUTION_CARRIER: <ROUTE-ID>`


and, where materially applicable:
- exact client/model/provider;
- repository/workspace path;
- branch/worktree topology;
- serial/parallel relationship to active sibling Missions;
- push/remote-write permission;
- tool/runtime/environment gate;
- output/evidence custody.


If EXECUTION_CARRIER is missing or ambiguous, STOP and bind it before mutation.


## 5. Carrier reassignment law


Moving a Mission from one carrier to another does NOT automatically change its Product scope/findings.


However, before execution, Controller must rebind:
- execution parent if changed;
- branch/worktree topology;
- collision matrix;
- transport/push policy;
- environment/tool requirements;
- output/evidence custody;
- concurrency/sequence relationship.


Do not carry carrier-specific assumptions across the rebind.


## 6. Current D03A binding


D03A is currently bound to:


`EXECUTION_CARRIER: ROUTE-LOCAL`


`LOCAL_MODEL_TARGET: Kimi K3`


Current local execution topology:
`main@37c4d765... -> writer/cep-serial -> D03A checkpoint -> STOP -> Controller audit`


This binding says nothing about the topology of a future ChatGPT Writer or Google AI Studio Writer Mission.


## 7. Anti-mixing closeout check


Before issuing any Writer prompt or mission:
1. identify the Mission;
2. identify the Execution Carrier;
3. read this file;
4. apply only that carrier's transport/tool rules;
5. separately apply global Product/mission laws;
6. verify that no local path/branch/model/seriality/push assumption leaked from another carrier.


END
## 8. ROUTE-LOCAL server-role separation


For the current local CEP repository:
- `npm run dev` runs `node tools/serve.mjs` and serves the built `dist/**` proof/static UI on default port `4173`.
- `node tools/serve.mjs --port <N>` is the same proof/static server on a different port; it does NOT start persistence/platform/runtime APIs.
- `npm run runtime:local` runs `node stack/local-runtime/server.mjs` and starts the local runtime/provider host on default `127.0.0.1:4174`.
- Genuine browser tests that exercise persistence, platform input direction, capabilities, backup, processing or terminal/runtime endpoints must prove the `4174` runtime listener independently; a green `4173`/custom proof server does not prove runtime availability.
- A browser `CORS request did not succeed`/status-null message is not sufficient to classify a CORS defect. First prove whether `4174` is actually listening and whether direct endpoint requests succeed.
- If the local runtime is intentionally/unintentionally absent, Product degraded-mode behavior remains a separate truth. Runtime absence must not be used to excuse synchronous main-thread request storms, unstable first paint, or unrelated navigation/reload defects.


## 8.1 Local task grouping / audit-boundary override — OD-20260924-082


The Owner, not the Controller, chooses whether local tasks run as separate stop/audit units or as one explicitly grouped continuous sequence. Do not insert a new permission/audit gate between already-authorized grouped tasks. Preserve exact checkpoints/receipts and task scopes, but audit at the Owner-defined boundary. This supersedes only the mandatory per-task STOP/audit interpretation of OD-080/081.
.




## 8.2 ROUTE-LOCAL remote-write default — OD-20260925-083


For `ROUTE-LOCAL`, Writer-side remote mutation is **default-deny**.


- Local commits/checkpoints on the governed non-main local lineage are allowed when the exact Mission authorizes mutation.
- `git push` is NOT authorized merely because a task completed, tests are green, a checkpoint exists, a previous local task had push permission, or the Mission is silent.
- Push becomes authorized only when the Owner explicitly authorizes push for the exact task/run, or explicitly groups a sequence with a defined final push boundary.
- Without that explicit current instruction, required state is `LOCAL_ONLY__NO_PUSH`.
- This does not authorize direct `main` mutation, force-push, history rewrite, merge, PR creation, release, deployment, self-acceptance or stack freeze.
- This rule is local-carrier-specific. Do not leak it into `ROUTE-CHATGPT`, `ROUTE-GOOGLE-AI-S


## 8.3 Historical ROUTE-LOCAL exact-read-set lineage — merged into OD-20260921-067


For every `ROUTE-LOCAL` Writer, Auditor, Reviewer, or similar local execution mission, the Controller owns input discovery and context shaping before handoff. The local worker is an executor/reviewer of the exact mission, not a substitute Controller archaeology process.


Before issuing the prompt, the Controller MUST:
- reconstruct the exact local/repository parent and current mission truth;
- determine the minimum **sufficient** read set for that role;
- bind every required local input by exact path and purpose;
- distinguish `READ_WHOLE_FILE` from `READ_ONLY_SECTIONS_OR_SYMBOLS` where useful;
- name the exact source/test/reference/profile/oracle/Owner-decision inputs required;
- name writable, read-only, and prohibited paths separately;
- include `NO_DISCOVERY_BY_DEFAULT / DO_NOT_READ` boundaries so unrelated repo/governance material is not consumed merely because it exists.


Open-ended instructions such as `inspect anything useful`, unspecified `applicable profiles/oracles`, generic repo-wide archaeology, or broad recursive `rg`/`grep`/`find` are prohibited by default for ROUTE-LOCAL mission prompts.


A `BOUNDED_DISCOVERY_ESCAPE` is allowed only when a named path/symbol is missing, contradictory, or insufficient for the exact mission. It must be restricted to the smallest relevant directory/source family, the reason must be recorded, and a material authority/lineage contradiction is a STOP condition rather than permission for unlimited search.


### Drive-to-local self-containment


If any mission-required authority, evidence, profile/oracle content, Owner-decision meaning, or other required input exists in Google Drive but is not already available in the local repository/workspace, the **Controller retrieves and resolves it before launch** and then either:
1. embeds the sufficient authoritative content directly in the mission/prompt; or
2. supplies an exact deterministic local projection/overlay with provenance, classification, and hash where appropriate.


The local Writer/Auditor/Reviewer MUST NOT be required to perform live Drive lookup/search for mission-required inputs. If a required input cannot be safely embedded or projected, launch is blocked until the Controller provides a bounded worker-consumable form.


This rule means `read exactly enough to complete and falsify the mission without unrelated context`, not `read as little as possible`. Read-only Auditors/Reviewers may receive broader read scope when their mission genuinely requires it, but the breadth must still be explicit, relevant, and bounded.


This decision complements `OD-20260921-067` (Writer self-contained inputs) by defining the ROUTE-LOCAL prompt/read-set construction law. It applies to all future local Writers, Auditors, Reviewers, and future Controllers preparing their prompts.
TUDIO`, or future carriers unless separately bound


## 8.4 ROUTE-LOCAL captured toolchain inventory — 2026-09-25


Classification: `ROUTE_LOCAL_ENVIRONMENT_FACTS__OWNER_CAPTURED__MISSION_REVERIFY_REQUIRED`


These are ROUTE-LOCAL environment/tool facts captured from the Owner machine. They are not cross-carrier authority, not Product-stack admission, and not a substitute for each local Writer/Auditor proving its own subprocess cwd/branch/HEAD/tree/executable/version/status before mutation.


### Captured tool inventory


- Repository: `D:\projects\Enterprise-Projects\cep-writer-baseline-repo`.
- Primary shell: Windows PowerShell `5.1.26100.4652`.
- Git: `C:\programs\Git\cmd\git.exe` — `2.51.0.windows.2`.
- CEP repo-effective Node: `v22.16.0`. GitHub `main` `package.json` independently declares `engines.node = 22.16.0`.
- Host-installed/base Node inventory includes `C:\Program Files\nodejs\node.exe` associated with `v24.19.0`, but the Owner reports that a Node version manager was intentionally configured so local terminal/shell sessions resolve Node `v22.16.0`. Therefore the Node 24 installation is underlying host inventory, not the effective CEP shell selection.
- npm: `10.9.2` observed in the CEP repo shell. Do not upgrade merely because npm advertises a newer version.
- Node version-manager state: `fnm` (Fast Node Manager) is `VERIFIED_CURRENT_AT_CAPTURE`, version `1.39.0`. Exact executable: `C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe\fnm.exe`. `fnm current` returned `v22.16.0`.
- npm cache: `C:\Users\User\AppData\Local\npm-cache`.
- Repository Node Playwright: `1.62.1`; `npx playwright --version` returned `1.62.1`. GitHub `main` `package.json` pins `playwright = 1.62.1`.
- Playwright cache root: `C:\Users\User\AppData\Local\ms-playwright`.
- Earlier captured cache entries: `chromium-1228`, `chromium_headless_shell-1228`, `ffmpeg-1011`, `winldd-1007`.
- Python: `3.13.7`; `where.exe python3` first resolves `C:\Users\User\cep-tools\python3.cmd`; `python3 -c "import sys; print(sys.executable)"` resolves `C:\programs\Python\Python313\python.exe`.
- Python Playwright: `1.63.0`, installed under Python 3.13.
- Python Playwright browser cache added: `C:\Users\User\AppData\Local\ms-playwright\chromium-1243` and `C:\Users\User\AppData\Local\ms-playwright\chromium_headless_shell-1243`, Chrome for Testing / Headless Shell `153.0.8010.12`.
- Docker: CLI `29.6.2`; Compose `v5.3.1`; daemon/runtime availability must be reverified before any Docker-dependent mission.
- WSL: `Ubuntu-24.04` / WSL2 `2.7.10.0`; available host capability only unless an exact mission binds WSL.
- GitHub CLI: `gh 2.98.0`; authenticated access worked at capture, but authentication/session must be reverified before any permitted GitHub action.
- Owner shell capture on `main` was clean and up-to-date with `origin/main`. This is environment capture only and does NOT supersede any current mission branch/HEAD lock.
- `npm ci` capture: 3 packages added, 0 vulnerabilities.


### ROUTE-LOCAL browser/tool binding law


- Node Playwright `1.62.1` and Python Playwright `1.63.0` are distinct installed toolchains. Evidence from one must not be silently attributed to the other.
- The `ms-playwright` directory is a shared cache, not browser authority. `chromium-1228` and `chromium-1243` may coexist; cache presence alone never selects the mission browser.
- For CEP Node/browser harnesses, use the repository-pinned Node Playwright route when that is what the exact test/harness source imports. Python Playwright is only a separately bound compatible capture tool.
- Before browser evidence generation, the local worker must record the exact Playwright package/version and the exact browser executable returned/used by that package or harness.
- Before mutation, the local worker must record `process.execPath`, `node --version`, npm version, Git executable/path, current branch/HEAD/tree/status and any relevant Python executable. An unexplained toolchain mismatch is a STOP condition.
- Do not download/install/upgrade browsers, Playwright, Node, npm, Python, Docker or other tooling during a mission merely because another version exists, unless the exact mission/Controller explicitly authorizes that acquisition.
- Owner terminal capture establishes ROUTE-LOCAL inventory, not proof that an AI subprocess inherited the same PATH or executable.
- Verified PowerShell profile: `C:\Users\User\OneDrive\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1`. The captured initialization defines `$fnmExe` at the verified WinGet path, prepends its directory to `PATH` when absent, then evaluates `& $fnmExe env --use-on-cd --shell powershell | Out-String | Invoke-Expression`; this is the mechanism that makes Node `22.16.0` effective and supports automatic project-directory switching.
- Captured `Get-Command node` / `node -p "process.execPath"` resolved to `C:\Users\User\AppData\Local\fnm_multishells\14952_1790357988412\node.exe`; `where.exe node` showed that FNM multishell executable first and `C:\Program Files\nodejs\node.exe` second. The exact `fnm_multishells` path is `SESSION_SPECIFIC_AT_CAPTURE` and MUST NOT be hard-coded into future missions; each subprocess must resolve its own active Node path.
- `fnm` is the current ROUTE-LOCAL Node version manager. Verified capture: `fnm 1.39.0`, exact executable `C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe\fnm.exe`, profile initialization through `Microsoft.PowerShell_profile.ps1` with `fnm env --use-on-cd --shell powershell`, and active Node `v22.16.0`. For each mutating mission, still re-resolve `Get-Command fnm`, `where.exe fnm`, `fnm --version`, `fnm current`, `Get-Command node`, `where.exe node`, and `node -p "process.execPath"` inside the executing subprocess. Do not hard-code the captured `fnm_multishells` path and do not infer the active Node executable from `C:\Program Files\nodejs\node.exe` alone.
.