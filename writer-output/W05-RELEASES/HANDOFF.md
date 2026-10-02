# W05-RELEASES — LANE HANDOFF (`REL-1`)

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Unit/Owner:** `W05-RELEASES` · **Surface:** `releases` · **Matrix row:** 20 (`rescued-partial (in-flight)` → `SALV (S: close remaining)` · `S_BOUNDED`)
**Execution carrier:** ROUTE-MIMO-AGENT · **Status:** `NOT_OWNER_ACCEPTED` (self-acceptance is never claimed)

---

## 1. Candidate identity (exact)

| Field | Value |
|---|---|
| Worktree | `/workspaces/cep-lanes/REL-1` (isolated) |
| Branch | `writer/mi-serial-lane/REL-1` |
| Parent (verified before any mutation, `git status` clean) | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` — "controller(gate): RECOVERY_GATE_PASS — execution transition authorized" |
| Parent stack tree | `bd0ea53e6658e001fd46377eca8854a009d03073` |
| Canonical source identity before → after (`tools/source-tree-identity.mjs`, 338 files) | `0c43d7f11631dc85c4cec60b20d8612ccdfebd0c72da1475dc78360245984abc` → `8dc756f337cb95eab528b8458b56ec14e0453211f482fba1c70bd19cc085420c` |
| **Candidate commit** | `CANDIDATE_COMMIT_PENDING_FILL_BEFORE_PUSH` |
| **Candidate tree** | `CANDIDATE_TREE_PENDING_FILL_BEFORE_PUSH` |

### 1.1 Changed paths (this lane's whole delta)

| Path | sha256 (candidate bytes) | Change |
|---|---|---|
| `stack/native-typescript/surfaces/releases/composition.ts` | `90439aec32a5a1d5219b592b07aaea200b76278866ff8522d98a4d639ec64bbd` | MODIFIED — `releaseRecord` import + new `releasesDeepProjection()` + `bottomProjection` rewired |
| `stack/native-typescript/surfaces/releases/runtime.ts` | `94912cbd68b5757ea9bf0bd2fb0a10c5719e6a24747f08914e69908b58cf81c0` | MODIFIED — consumer-side shelf refresh after lang/dir change |
| `writer-output/W05-RELEASES/**` | (this report, request, evidence) | ADDED/UPDATED — own output root only |

Nothing else was written. `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json` (mission-mandated build/test artefacts) and the shared `writer-output/W05/**` runtime churn produced by the mandated flow command are restored to the parent state before the commit.

### 1.2 Closed read set used (only)

`controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0 + `REL-1` row §3 · `controller/09_writer_forge/surface_units/W05-RELEASES_SURFACE_PACKET.md` · `controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md` (incl. §0) · `profiles/releases.json` · `cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv` · reuse-matrix **row 20 only** · own salvage under `writer-output/W05-RELEASES/`. No other controller file, no broad search, no Drive.

---

## 2. Salvage preserved (continued, never restarted)

Salvage inspected first and kept intact:

- `writer-output/W05-RELEASES/VISUAL_EXECUTION_REPORT.json` — cycle-1 report (`17 defects found / 16 fixed`, `CYCLE_2_PENDING_REBUILD`) — **updated in place**, not rewritten or reverted.
- `writer-output/W05-RELEASES/evidence/baseline/**` (9 captures + `baseline.json`) and `evidence/audit/**` (17 captures + `audit.json`) — untouched, still the cycle-1 record.
- `evidence/harness/{baseline,audit,probe}.mjs` — cycle-1 harnesses, untouched; cycle 2 uses new `cycle2-*.mjs` harnesses alongside them.
- Cycle-1 source value (4-file surface + adapters, reference-driven composition, bilingual record model, governor) — preserved byte-for-byte; only `bottomProjection` (composition) and one added block in the governor (runtime) changed.
- H02 do-not-repeat law respected: no reset/revert to `48fec276`, no from-zero relaunch, no donor archaeology, no redo of cycle 1 or functional 26/26, `w05-rescue.ts` never touched, superseded captures retained and labelled.

Salvage not redone: functional 26/26 (cycle 1), cycle-1 L1–L4, baseline+audit evidence, releases flow.

---

## 3. Objective of this lane and what was closed

Sealed row 20 objective: **"1 open defect + CP-003's 2 bottom-shelf issues (1 shared-owned → request path)"**.

| # | Item (as sealed / as found in salvage) | Owner | Outcome |
|---|---|---|---|
| 1 | **The 1 open defect of "17 found / 16 fixed"** = `D-06` (V2, `SURFACE_COMPOSITION`): "Bottom deep projection repeated a raw diagnostics/lastAction string with no release meaning … release verification content composed into the centre workbench instead of claiming the shared shelf" | surface-owned (`surfaces/releases/composition.ts`) | **CLOSED** — `releasesDeepProjection()` claims the shelf through the sanctioned read-only provider path `w05.releases.deep-projection` (registered by m0 from this unit's `composition.bottomProjection`) with four release-meaningful sections; `lastAction · ok=… · differences=…` removed entirely |
| 2 | **Bottom-shelf issue A (surface-owned)**: the shelf projection must be release-meaningful and follow the active language (its `threeTruths` axis names were Arabic-pinned and the projection was built once at mount time, so a locale flip kept the old language) | surface-owned | **CLOSED** — `sections`/`currentRevisionId` are live getters read on every shared shelf render; EN session measures **0** Arabic characters in the surface-owned text, AR session localised; plus a consumer-side call to the shared owner's `renderBottom()` after a lang/dir change while the shelf is open |
| 3 | **Bottom-shelf issue B (shared-owned → request)**: `#bottomSummary` closed summary + donor shelf chrome are hardcoded Arabic, so an EN/LTR session shows Arabic (`D-17`, V1, `SHARED_COMPONENT`) | **shared** — `foundation/global/bottom-shelf.ts:178`, `:27/:38/:40-42`, `foundation/accepted-runtime.ts:537/728` (outside this lane's roots) | **STOP for this sub-scope** → `writer-output/W05-RELEASES/SERIALIZED_HOTSPOT_REQUEST.md` (HS-REL-1-01/02 + optional HS-REL-1-03). No shared file was opened for writing at any time. |

Reading note (stated honestly): items 1 and 2 both live in `composition.bottomProjection`, so the sealed "1 open defect + 2 bottom-shelf issues" collapses into **2 distinct fixes + 1 shared request**. Both readings are satisfied: the surface-owned bottom-shelf content (meaningful + localised) is fixed, and the shared-owned bottom-shelf strings are requested, never patched in-lane.

Resulting defect ledger: **17 found · 16 fixed · 1 open (`D-17`, shared-owned, request filed)** — report `DEFECT_SEVERITY` now `FIXED: 16 / OPEN_SHARED_REQUESTED: 1`.

---

## 4. Tests and falsification

### 4.1 Baseline (mission loop step 1) and re-run after the edits

| Command | Result |
|---|---|
| `npm run build:runtime` | PASS (build authority `CANONICAL_SOURCE_TO_GENERATED_ONLY`,323 files written) |
| `npm test` | **210 / 0** at baseline, and **210 / 0 again** after the edits — run twice, identical |
| `node tools/w05-browser-flows.mjs releases.view` | **8 / 8 PASS** (includes `releases.view`: empty-truth + compare-blocked) — run at baseline and after the edits |
| Packet `tests/surfaces/releases` (`releases-tests.js`) | **12 / 0** |
| Packet `S19_W05_RELEASES_CONFIGURATION` (`s19-tests.js`) | **17 / 0** |
| Packet `CG6_W05_COVERAGE` (`cg6-w05-coverage.test.js`) | **6 / 0** (incl. `cg6.truth-ceilings-four-planes-separated`) |
| `node tools/check-duplicate-mechanics.mjs` (**N4**) | **PASS** (`status: PASS`, no duplicate owner introduced) |
| `npm test` twice (**N5**) | **identical**: `210/0` both runs; the full test id/status list and the whole JSON (minus the run `date`) are byte-equal |
| `npm run check` | exit 1 — see §7 B-02: the pre-known `browser.lineage_receipt_truthful` red (its6-flow receipt is `pass 4 / fail 2` = the two **global Enterprise** failures, explicitly not this lane) plus `browser.current_candidate_claim_truthful`, which any source delta turns red because the Controller-owned receipt still binds the pre-delta tree. **Not faked green.** |

### 4.2 Mandatory falsification — `writer-output/W05-RELEASES/evidence/cycle2/falsification.json` → **39 / 39 PASS**

| ID | Checks | Result |
|---|---|---|
| **N1** non-owned-route mutation attempt → must refuse | `N1.no-mutation-outside-writable-roots` (static `git status` scope), `N1.non-owned-commands-refused` (5 out-of-scope command ids), `N1.no-state-change-from-refused-attempts`, `N1.no-deploy-or-authorize-execution-command-registered` | 4/4 PASS |
| **N2** boundary/invalid input → no corruption / no false receipt | same-identity compare (`RELEASE_COMPARE_DISTINCT_CANDIDATES_REQUIRED`), invalid candidate identity, compare-without-pair leaves receipts unchanged, inspect unknown → `NO_CANDIDATE`, nonexistent `releases.deploy` refused | 5/5 PASS |
| **N3** act without prerequisite data/provider → UNAVAILABLE, never fabricated | empty adapter → `NO_CANDIDATE` + 0 fabricated candidates, missing auth provider → `AUTHORIZATION_REQUEST_PROVIDER_UNAVAILABLE` with **no** state change, missing compare owner → `ANALYTICAL_COMPARE_INTEGRATION_REQUIRED`, bottom projection with no candidate → "no candidate bound" and no readiness value | 7/7 PASS |
| **N4** duplicate mechanics | `node tools/check-duplicate-mechanics.mjs` → PASS | PASS |
| **N5** suite twice → identical | two `npm test` runs → identical id/status list (§4.1) | PASS |
| **Lane: ceilings** | `release-readiness-is-authorization = false`, `release-authorization-is-deployment = false`, `readiness-executes-deployment = false`, `authorization-executes-deployment = false`, `deploymentExecution = NOT_OWNED` — asserted on the composition **and** on the live in-page composition, plus CG6 | 7/7 PASS |
| **Lane: empty-truth renders truthfully** | search `zzzz` → 0 cards + "No candidate matches … an empty view is not green readiness" + "No candidate selected …", no readiness/green claim | PASS (+ capture) |
| **Lane: compare-blocked renders truthfully** | `releases.compare {}` fails closed, receipts unchanged, chip carries a real BLOCKED/unavailable reason, every disabled toolbar command carries a real reason | 3/3 PASS (+ capture) |
| **Lane: D-06 + shelf localisation** | 4 release sections present, no raw diagnostics (`ok=`/`differences=`/`lastAction`), ceilings visible and false in both languages, EN surface-owned text = 0 Arabic chars, AR localised, 0 page errors | 10/10 PASS |

Harness: `writer-output/W05-RELEASES/evidence/harness/cycle2-falsification.mjs`.

---

## 5. FOUR TRUTHS (kept separate — never collapsed into each other)

| # | Truth | Owner / basis | Value in this candidate | Ceiling (must stay false) |
|---|---|---|---|---|
| **1** | **Technical readiness** | candidate-bound evidence (`records.ts` + `ReleasesDomainAdapter.state`) | `TECHNICALLY_READY` for `REL-2026.08.31-RC2`; shelf section "Three separated truths" states it first | `ciPassIsAcceptance = false` · **`release-readiness-is-authorization = false`** (`technicalReadinessIsOwnerAuthorization`) — verified on composition + live DOM + CG6 |
| **2** | **Owner authorization** | explicit authority record, injected requester only | `NONE` for the selected candidate; `releases.requestAuthorization` is **disabled with a real reason** ("Authorization request provider unavailable") and emits **no** receipt when the provider is missing | **`release-authorization-is-deployment = false`** · `authorizationExecutesDeployment = false` — verified on composition + live DOM + CG6 |
| **3** | **Deployment observation** | separate deployment provider | `NOT_DEPLOYED` (other fixtures: `DEPLOYED` / `FAILED` / `UNKNOWN` — `UNKNOWN` never converts to `NOT_DEPLOYED`/`DEPLOYED`) | `deploymentExecution: 'NOT_OWNED'` · `readinessExecutesDeployment = false` — no deploy/publish/execute command exists on this surface (`N1.no-deploy-or-authorize-execution-command-registered`) |
| **4** | **Record / provenance basis** | `RECORD_BASIS` shown in the UI footer and in the shelf's "Selected release candidate" section | digests are synthetic-but-stable fixture values **pinned to each candidate**; a raw `new ReleasesDomainAdapter()` carries **0** candidates (`domainDefaultCandidateCount = 0`) and an unknown candidate degrades to `UNAVAILABLE` presentation detail with **no invented gates/events** | `PUSH/CI PASS is not acceptance` · `Candidate A evidence cannot authorize B` · no release/deploy execution is authorised by this design packet |

Status truths (reported separately from the product truths above): `FUNCTIONAL = PASS` · `STRUCTURAL = PASS` · `VISUAL = CANDIDATE_COMPLETE_PENDING_CONTROLLER_REVIEW` · `RESPONSIVE = PASS` · `RTL_LTR = PASS` · `ACCEPTANCE = NOT_OWNER_ACCEPTED`.

---

## 6. Evidence (hash-bound to the candidate)

All under `writer-output/W05-RELEASES/evidence/cycle2/` (47 files, 8.2 MB); every capture records path + sha256 + bytes + dims, and every JSON re-states commit + stack tree + delta.

| Evidence | Result |
|---|---|
| `cycle2/audit/audit.json` + 17 captures (EN 1536/1280/1024/820, AR 1536, pane/strip/truths crops, empty state, records) | **29/29 PASS**, lineage `fe1bb98…` + `bd0ea53e…` + `[M composition.ts, M runtime.ts]`, `consoleErrors` =1 benign 503 (runtime probe), `pageErrors` = 0 |
| `cycle2/falsification.json` + 4 captures | **39/39 PASS**, sha256 `4879329dfb9ca133835ca4c3f049a933624f04401730ade8458c4eb6a63940fe` |
| `cycle2/{before,after,after2}-*.png` + 3 probe JSONs (12 shelf captures) | before/after proof for D-06: `before-en-bottom-shelf.png` `289b522f…` → `after2-en-bottom-shelf.png` `7167684e…`; AR `after2-ar-bottom-shelf.png` `fe4db562…` |
| `cycle2/flow/{empty-truth,compare-blocked}-*.png` | copies of the mandated flow run (8/8 PASS, 2026-10-02T05:12Z); both sha256 `84a30530…` — byte-identical because the two flow states are assertion-oracled, not pixel-oracled (recorded, not hidden) |
| Visual inspection (vision channel, actual bytes read) | cycle-2 EN whole surface, EN shelf before/after, AR shelf, empty-truth and compare-blocked captures inspected directly — see §3 and §4.2 |
| Cycle-1 evidence (untouched) | `evidence/baseline/**` (9), `evidence/audit/**` (17), `VISUAL_EXECUTION_REPORT.json` cycle-1 sections |

`VISUAL_COMPARISON_LEVELS_COMPLETED` for cycle 2: **L1 + L2 + L3 + L4** (recorded in the report as `CYCLE_2`).

---

## 7. Unresolved findings / blockers (recorded, not decided)

- **B-01 — CLEARED.** The cycle-1 transient rebuild blocker (sibling in-flight TS errors in `surfaces/manual_ai/presentation.ts`, `surfaces/portfolio/presentation-style.ts`) no longer reproduces; `npm run build:runtime` passes at the candidate.
- **B-02 — OPEN, Controller-owned, recorded not fixed.** `npm run check` shows **two** reds: the pre-known `browser.lineage_receipt_truthful` (the6-flow receipt is `BLOCKED_OR_FAILED`, `pass 4 / fail 2` = the two **global Enterprise** FAILs that are explicitly not this lane's) and `browser.current_candidate_claim_truthful`, which flips red for **any** canonical source delta because `assurance/BROWSER_CONFORMANCE_RECEIPT.json` still records `sourceCanonicalTreeSha256 0c43d7f…` while this lane's delta yields `8dc756f…` (both measured with `tools/source-tree-identity.mjs`; HEAD blobs reproduce `0c43d7f…` exactly, so the delta is the only cause). `assurance/**` is read-only for this lane and is force-restored by the mission cleanup step, so the truthful handling is this record — regenerating the receipt belongs to the Controller at convergence.
- **B-03 — OPEN, shared seam, request filed.** `D-17` (`V1`): Arabic bottom-shelf closed summary + donor shelf chrome in EN sessions → `SERIALIZED_HOTSPOT_REQUEST.md` (HS-REL-1-01/02, optional HS-REL-1-03). Not fixable inside this lane's roots.
- **Not-a-blocker, recorded:** the shared shelf does not re-read its provider on a locale-only change; mitigated **in-lane** by invoking the shared owner's own `renderBottom()` (no shared write), and listed as optional shared improvement HS-REL-1-03.
- Cycle-2 iteration note (truthful): the intermediate `after-*` probe captures were overwritten by a later iteration of the same run label during this lane's development (the `before-*` baseline captures were never touched). Final labelled proof is `before-*` vs `after2-*`.

---

## 8. Owner / STOP notes

- **STOP used exactly once, for the shared-owned sub-scope** (`D-17`): file-based hotspot request written, no shared file mutated. Nothing in the request needs an Owner product decision — it is a mechanical language correction against an active policy (`VISUAL_EXECUTION_STANDARD` §7: Arabic and English are both first class; no permanent Arabic-first authority).
- **No Owner-facing items** were attempted (shell redesign `OWNER-20260910-010`, RQ reference promotion, Visualize F-048, destination-count freeze `C03-GATE-023` all untouched).
- **No authority conflict found.** Owner decisions applied: `OD-20261002-087` (one writer per bounded lane), `OD-20260914-037`/`OD-20260921-066` (isolated candidate, mission branch, no main push/merge/release), `OD-20260916-043`, `OD-20260918-055` (surface identity/completeness), `OD-20260920-059` (shared mechanics do not override surface semantics), `OD-20260920-060` (no new product dependency — none added), `OWNER-20260910-005/011/012/013/014/020` (foundation reuse, shared grammar, no duplicate owners).
- **Prohibited paths never written:** `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `dist-ts/**`, other lanes, `main`, `writer/mi-serial`, secrets/`node_modules`; `stack/native-typescript/foundation/**`, `surfaces/m0-controller-composition.ts`, `surfaces/composition/w05-rescue.ts`, `tests/**` untouched.
- **Ceilings held:** `STACK_EXPANSION_LOCKED__STACK_NOT_FROZEN` (no dependency added), H03 PROP/FALSIFY stay `NOT_PROVEN` (untouched), `browser.lineage_receipt_truthful` red left red (not faked), rescue≠acceptance, report/branch presence≠completion.
- **Acceptance:** `NOT_OWNER_ACCEPTED`. Sole Controller review required; this lane never self-accepts, merges, promotes, releases or deploys.

---

## 9. Exact resume instructions for the Controller

1. Verify identity: `git -C <worktree> rev-parse HEAD` == candidate commit in §1; `git status --porcelain` must show only §1.1 paths.
2. Evidence entry points: `writer-output/W05-RELEASES/VISUAL_EXECUTION_REPORT.json` (machine-readable, all §12 fields) → `evidence/cycle2/falsification.json` (39/39) → `evidence/cycle2/audit/audit.json` (29/29).
3. Shared follow-up: schedule `writer-output/W05-RELEASES/SERIALIZED_HOTSPOT_REQUEST.md` through the serialized shared-hotspot slot (W01-SHELL/foundation steward).
4. At convergence: regenerate `assurance/BROWSER_CONFORMANCE_RECEIPT.json` against the integrated tree (Controller-owned) — that clears B-02's second red; the first red stays until the Enterprise defect closes.
