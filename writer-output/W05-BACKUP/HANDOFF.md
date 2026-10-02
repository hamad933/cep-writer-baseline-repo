# HANDOFF — W05-BACKUP (surface `backup`) · lane **BKP-1**

**Unit:** `W05-BACKUP` · **Class:** `SURFACE_UNIT__CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Lane:** `BKP-1` (isolated worktree `/workspaces/cep-lanes/BKP-1`, branch `writer/mi-serial-lane/BKP-1`)
**Mission:** continue the 13-defect continuation — close the pending **browser-lifecycle proof** and the
**responsive / RTL `SOURCE_ONLY` / `BROWSER_PENDING`** statuses with fresh source-bound browser evidence.
Diagnosis/fixes of the inherited 13 defects were **not** redone (H02 do-not-repeat law).
**Acceptance:** `NOT_OWNER_ACCEPTED` — Controller re-verification required on every dimension below.

---

## 1. CANDIDATE IDENTITY (exact)

| Field | Value |
|---|---|
| Base / EXACT_PARENT (verified before mutation) | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` |
| Source-fix commit | `6601741bfc3398cfeb7086a16a9ff67d5ede17b7` (tree `ecea7cc4d4fb36ca043d41c7e6c81e8284f9eba4`) |
| Evidence-packaging commit | `a713be883666252771cbef6622f3cd1000f1ad69` (tree `07894c8d1df25f9c728df732a88761b85377a5df`) |
| Report commit | this commit (branch tip — see `git log -1`) |
| Canonical source identity (`path\0size\0sha256`) | `8b19a3dcefc764ad3fdd4e4bd94b25c9c8a9b0cb9071bd26c7eca1a79810a782` (338 files) |
| Writable-root source sha256 (4 surface files + adapter) | `9113f11cd54ceaba46d430cf55eb8d65ac15e176c9d60c630158b648774357e9` |
| Salvage (pre-lane) source sha256 | `b50f5592a885688f793b166efed49eba04df529508bda453313eaaccb900a10b` (carried unchanged into `fe1bb98`) |
| Branch state | `CANDIDATE_ONLY` pushed to `writer/mi-serial-lane/BKP-1`; never merged/accepted/promoted |
| HEAD clean for writable roots | `git status --porcelain -- stack/native-typescript/surfaces/backup stack/native-typescript/adapters/backup-runtime.ts` → empty at capture time (recorded as `writableSourceCleanVsHead:true` in every round-B capture) |

> **Note on signing:** `.codespaces/bin/gh-gpgsign` fails in this environment (`403 | Author is invalid`),
> so lane commits were created with `git -c commit.gpgsign=false`. Recorded, not hidden.

## 2. CHANGED PATHS (writable roots only)

| Path | Change |
|---|---|
| `stack/native-typescript/surfaces/backup/index.ts` | **D-14 fix (lane):** verdict chip now reports the *latest drill ATTEMPT* (tone + status token) instead of an older completed drill's success, plus a scoped failure note naming status/code and stating that the report below is the last completed drill receipt |
| `stack/native-typescript/surfaces/backup/i18n.ts` | `attemptFailTitle` / `attemptFailBody` in **both** locales (en + ar) |
| `stack/native-typescript/surfaces/backup/style.ts` | `.bk-attempt-fail` note styling (bad tone, logical properties only) |
| `stack/native-typescript/surfaces/backup/icons.ts` | unchanged this lane (salvage fix retained) |
| `stack/native-typescript/adapters/backup-runtime.ts` | **UNCHANGED** — verified, no adapter change needed |
| `writer-output/W05-BACKUP/**` | evidence, harnesses, falsification, OCR cross-check, reports (all below) |

Non-owned side effects created during the lane were **reverted** at lane end:
`git checkout -- dist assurance stack/MEASURED_COMPARISON.json` + `git checkout -- writer-output/W05 && git clean -fd writer-output/W05`
(browser flow writes into the shared `writer-output/W05` receipt; its artifacts were copied into
`writer-output/W05-BACKUP/evidence/flow/` first — nothing was lost, nothing outside my roots remains dirty).

## 3. SALVAGE PRESERVED (never restarted / reverted / deleted)

* **~184 pre-existing files** under `writer-output/W05-BACKUP/` retained: `baseline-*`, `postfix`–`postfix5`
  drill/empty/AR captures, `postfix3-drill-vp-*`, `captures.jsonl` (append-only), `.runtime/evidence/**`
  (packages, drills, stages, journals), original `VISUAL_EXECUTION_REPORT.json`
  (copied to `VISUAL_EXECUTION_REPORT.pre-lane-BKP1.json` before this lane's update), original `HANDOFF.md`
  (superseded by this one).
* The 13-defect fixes (D-01…D-13) are untouched and now **browser-verified**, not redone.
* Superseded lane captures retained, never deleted: `lane1a-en-1440-*`, `A-*-attempt1-*`,
  `A-ar-1024-attempt2-*`, `F-*`, `evidence/falsification/FALSIFICATION-attempt1.json`,
  `FALSIFICATION-attempt2.json`, `L1-corrupted-seed-ui-attempt1/attempt2.png`.
* Salvage harness `evidence/harness/capture.mjs` left **untouched and unexecuted** — it hardcodes
  `root = '/workspaces/cep-writer-baseline-repo'` (the main worktree), which this lane must never write.

## 4. TESTS

**Build / suite**

| Run | Result |
|---|---|
| `npm run build:runtime` (baseline, parent) | PASS — `authority CANONICAL_SOURCE_TO_GENERATED_ONLY`, 323 files written |
| `npm test` (baseline, parent) | **210 / 0** |
| `npm run build:runtime` (after D-14 fix) | PASS (dist backup bundle rebuilt, sha256 recorded per capture) |
| `npm test` run 1 (post-fix) | **210 / 0** |
| `npm test` run 2 (post-fix, N5) | **210 / 0**, id/status list **byte-identical**, `sha256 bf0ccfb65a699f1555aeec5ec5a63154e931f113fbbaecba3bb65ad5f04e22bf` (same as run 1) → **N5 PASS** |

**Packet tests (post-fix, all exit 0)**

| Test | Result |
|---|---|
| `dist/tests/rescue/S18_W05_BACKUP_AUDIT/domain-tests.js` | PASS |
| `dist/tests/rescue/S18_W05_BACKUP_AUDIT/source-boundary-tests.js` | PASS (no live-restore endpoint, no persistence-owner import) |
| `dist/tests/rescue/CG6_W05_COVERAGE/cg6-w05-coverage.test.js` | PASS |
| `dist/tests/rescue/CG6_W05_COVERAGE/controller-corr01-w05-truth.test.js` | PASS |
| `dist/tests/post-c03/D11/d11-w05-provider-integration-tests.js` | PASS (100%) |
| `PC1_W05_PROVIDER_PERSISTENCE/provider-persistence-falsification.mjs` | PASS **9 / 0** |
| `PC1_W05_PROVIDER_PERSISTENCE/server-provider-seam-smoke.mjs` | PASS **4 / 0** |
| `node tools/check-duplicate-mechanics.mjs` (N4) | `status: PASS`, exit 0, **zero** `backup` findings → no new duplicate owner |

**Browser flow (positive test)**

| Flow | Result |
|---|---|
| `node tools/w05-browser-flows.mjs --flow backup.restore-round-trip` (pre-fix) | **PASS**, aggregate 8/8, exit 0 |
| same, post-fix against candidate `6601741` | **PASS**, aggregate 8/8, exit 0 |
| Local runtime | `npm run runtime:local` started **in this worktree**, `127.0.0.1:4174` listener proven (`ss -ltnp` → pid, `GET /v1/capabilities` → 200), **stopped after** (4174 DOWN verified). Data root env-redirected to `writer-output/W05-BACKUP/.runtime/port4174/` so no write landed outside my roots. |

**Lane capture battery (round B, candidate-bound)**

| Run | Checks | Fails | Page errors | Refused requests |
|---|---|---|---|---|
| `B-empty-en-1440` (no data) | 8 | 0 | 0 | 0 |
| `B-en-1440` (+ responsive sweep, crops, scrolled) | 27 | 0 | 0 | 0 |
| `B-ar-1440` | 17 | 0 | 0 | 0 |
| `B-en-1024` | 17 | 0 | 0 | 0 |
| `B-ar-1024` | 17 | 0 | 0 | 0 |
| **total** | **86** | **0** | **0** | **0** |

Every round-B capture records `commit 6601741…`, `HEAD tree`, `stack tree`, canonical source sha,
surface source sha, dist bundle shas, viewport, lang/dir, and image identity (path/sha256/dims/bytes).

**Falsification (`evidence/falsification/FALSIFICATION.json` → 5 / 5 PASS)**

| Case | Result |
|---|---|
| **N1** non-owned-route write attempt refuses | PASS — surface exposes only `backup.*`; every runtime request observed during the lifecycle is `/v1/backup/*`; adapter transport paths all `/v1/backup/*`; unknown backup route → **404**; `POST /v1/backup/../../v1/persistence/save` traversal → **4xx + ok:false** |
| **N2** boundary / invalid input → no corruption | PASS — unknown package/drill preview·stage·drill·activation → `ok:false` and no `STAGED_AND_VERIFIED`; rehydrate(null/[]/{}/missing-identity) → 4 distinct refusal codes; **adapter session-state hash unchanged**; hostile `<script>` label stored sanitized |
| **N3** no prerequisite data → truthful unavailable | PASS — `VERIFIED_PACKAGE_REQUIRED` / `RESTORE_PLAN_REQUIRED` / `PROVIDER_PREVIEW_REQUIRED` / `PROVIDER_STAGE_REQUIRED` / `VERIFIED_ISOLATED_DRILL_REQUIRED` / `PACKAGE_UNKNOWN`; rendered `NOT_RUN` + designed not-run block; `activationAuthority=NOT_REQUESTED`; durable journal **empty** |
| **L1** corrupted-seed restore → truthful failure | PASS — drill → `FAILED_BEFORE_MUTATION` / `PACKAGE_HASH_MISMATCH`; **0 new drill receipt dirs**, FAILED rows in durable journal, audit event `backup.drill.failed`; focal chip now `FAILED` + `FAILED_BEFORE_MUTATION` + failure note (OCR finds the note on screen); ceilings stay false |
| **L2** backup-verify ≠ live-restore ceiling | PASS — `stagedVerifiedIsLiveRestored=false`, `drillLiveRestored=false`, `liveRestored=false`, `productionDatabaseMutated=false`, `persistenceOwnerMutated=false`, activation `AUTHORITY_PENDING`, banner `STAGED_AND_VERIFIED ≠ LIVE_RESTORED` present, descriptor `liveRestoreOwned=false/activationAuthority=false`, `/v1/backup/{restore,activate-live,apply,live-restore}` → **404 ×4** |

## 5. THE FOUR TRUTHS (stated separately)

### Content
Arabic and English are both first-class and both were exercised. EN captures contain **0 Arabic glyphs**
inside `[data-w05-surface]`; AR captures contain **965**. Independent OCR cross-check
(`evidence/OCR_CROSSCHECK.json`, tesseract eng on the exact capture bytes) = **11/11 PASS**: every EN capture
scores `ENGLISH_UI_DETECTED`, every AR capture scores `NON_ENGLISH_UI_DETECTED`, and the falsification capture
scoring finds `Latest restore-drill attempt failed` + `PACKAGE_HASH_MISMATCH` literally on screen.
Technical tokens (`PACKAGE_VERIFIED`, `ISOLATED_RESTORE_DRILL`, `PROVIDER_DURABLE_ATTEMPT_JOURNAL`,
`FAILED_BEFORE_MUTATION`) stay isolated in `<bdi dir="ltr">` in **both** locales by design.
Density comes from a real fixture: `POST /v1/persistence/bootstrap → 200`, then real provider receipts
(Documents 1/1, Revisions 1/1, Migrations 1/1, schema signature matched). The two D-14 strings were added
to **both** locale tables — no English-only or Arabic-only surface string was introduced.

### Presentation
L1–L4 completed on round-B captures at the packet viewports **1440×1000** and **1024×900** (plus the
responsive sweep at 1280×860 / 960×900 / 820×900). Composition against the
`OWNER_CONFIRMED_FINAL_REFERENCE` intent holds: identity strip → safety banner → one focal Restore Drill
report (8-stage pipeline, 3×3 check grid, 6 expected-vs-actual metrics, meta strip, truth chips) → grouped
left queue → 9-block right context → bottom ledger.
Responsive measured live: container `654px@1440 → metrics3/checks3/pipe4 (connector off)`,
`496px@1280 → 2/2/4`, `678px@1024 (right pane collapsed) → 3/3/8 (connector on)`,
`616px@960 → 3/3/4`, `795px@820 (both panes collapsed) → 6/3/8`; **0** document h-scroll and **0** clipped
blocks at every viewport. Collapsed state proven: the shared shell hides `#rightPane` at ≤1024 and both
panes at 820, and the surface **re-composes** through container queries instead of squeezing.
RTL mirroring proven by computed logical properties (AR: `padding-inline-start 28px` lands on the **right**,
`border-inline-start` lands on the **right**; EN: the mirror image). Before/after pair for the one lane fix:
`falsification/L1-corrupted-seed-ui-attempt2.png` (stale `COMPLETED / VERIFIED`) →
`falsification/L1-corrupted-seed-ui.png` (`FAILED` + note).
**No visual PASS is claimed — `NOT_OWNER_ACCEPTED`, Controller review required.**

### Behavior
The full six-command lifecycle (`backup.package → plan → preview → stage → drill → activationRequest`)
executes in headless Chromium against a lane-owned local runtime at **both** viewports and **both**
directions — 86/86 lane checks, **0 page errors**, 0 refused requests. Flow
`backup.restore-round-trip` **PASS (8/8)** twice (pre- and post-fix). N1 (no non-owned route can be
driven), N2 (invalid/boundary input changes nothing and yields no receipt), N3 (missing prerequisites →
truthful unavailable) all PASS. N4 (`check-duplicate-mechanics`) PASS with zero backup findings;
N5 (`npm test` twice) identical.

### Domain-Data-Provider
Every displayed verdict derives from a provider receipt — nothing invented: `PACKAGE_VERIFIED`,
`COMPATIBLE`, `STAGED`, `STAGED_AND_VERIFIED`, `AUTHORITY_PENDING`, and the provider durable attempt
journal. Corrupting a package seed and re-running the drill produces a **truthful failure**
(`FAILED_BEFORE_MUTATION` / `PACKAGE_HASH_MISMATCH`, FAILED rows in the durable journal, audit
`backup.drill.failed`) with **zero** new success receipts — never a false success. Ceilings held throughout:
`stagedVerifiedIsLiveRestored=false`, `drillLiveRestored=false`, `productionDatabaseMutated=false`,
`persistenceOwnerMutated=false`, activation stays `AUTHORITY_PENDING`, and no live-restore route exists
(404 ×4). Regression evidence: S18 domain + source-boundary, CG6 ×2, D11, PC1 9/0 + 4/0, `npm test` 210/0 ×2.

## 6. EVIDENCE (paths)

* Manifest (295 files, 32,398,733 bytes, sha256/file): `writer-output/W05-BACKUP/evidence/MANIFEST.json`
* Browser lifecycle + RTL/responsive (round B): `evidence/B-empty-en-1440.{json,png}`,
  `evidence/B-en-1440.{json,png}` + `B-en-1440-{left,center,right,bottom,scrolled,eyebrow,vp-*}.png`,
  `evidence/B-ar-1440*`, `evidence/B-en-1024*`, `evidence/B-ar-1024*`
* Round A (superseded, retained): `evidence/A-*`, `evidence/lane1a-en-1440-*`, `evidence/F-*`
* OCR cross-check: `evidence/OCR_CROSSCHECK.json` + `evidence/ocr/*.eng.txt` (11/11 PASS)
* Falsification: `evidence/falsification/FALSIFICATION.json` (5/5) + `L1-corrupted-seed-ui.png`
  (+ `FALSIFICATION-attempt1/2.json`, `L1-corrupted-seed-ui-attempt1/2.png` retained)
* Shared W05 browser receipt + screenshots preserved from the reverted shared tree: `evidence/flow/INDEX.json`
* Ownership/geometry diagnosis (shared-shell findings): `evidence/diagnose-backup-en.json`,
  `evidence/diagnose-processing-en.json`
* Harnesses (all write only inside this lane root): `evidence/harness/lane-capture.mjs`,
  `lane-diagnose.mjs`, `ocr-crosscheck.mjs`, `evidence/falsification/lane-falsify.mjs`
* Machine-readable report: `writer-output/W05-BACKUP/VISUAL_EXECUTION_REPORT.json`
  (salvage version preserved as `VISUAL_EXECUTION_REPORT.pre-lane-BKP1.json`)

## 7. STATUS CLOSEOUT (was → now)

| §12 field | Before (salvage) | Now |
|---|---|---|
| `FUNCTIONAL_STATUS` | `…BROWSER_RE-LIFECYCLE_PENDING` | `BROWSER_PROVEN__LIFECYCLE_CLOSED` |
| `RESPONSIVE_STATUS` | `SOURCE_ONLY` | `BROWSER_PROVEN` (bands measured, 5 viewports, collapsed state proven) |
| `RTL_LTR_STATUS` | `SOURCE_ONLY__OFFLINE_PASS__BROWSER_PENDING` | `BROWSER_PROVEN BOTH DIRECTIONS` |
| `RECAPTURE_STATUS` / `RECOMPARISON_STATUS` | `PENDING — blocked on shared build` | `DONE` (round B + OCR cross-check) |
| `REGRESSION_STATUS` | `NOT_STARTED` | `PASS` (suite ×2, packet tests, flow, N4) |
| `ACCEPTANCE_STATUS` | `NOT_OWNER_ACCEPTED` | `NOT_OWNER_ACCEPTED` (unchanged — self-acceptance prohibited) |

## 8. UNRESOLVED FINDINGS (recorded, not decided)

| id | sev | root cause | finding |
|---|---|---|---|
| **U-01** | V2 | `SHARED_COMPONENT` | Shared `.centerrail` (absolute, `top:8px`, `z-index:214`, no reserved space) overlaps the top of center-pane content; the surface eyebrow sits under it at scroll-top and content scrolls beneath it. Verified identical geometry on `?surface=processing` → **not surface-specific**. Shell-owned; no foundation file written. |
| **U-02** | V2 | `SHARED_COMPONENT` | Shared chrome renders Arabic while locale=en: `#leftLocalReveal`=البنية, `#rightLocalReveal`=السياق, ContextInspector scope buttons=الوحدة/الكتلة المحددة, skiplink. Surface-owned DOM has **zero** Arabic under EN. |
| **U-03** | ENV | `EVIDENCE/ORACLE` | `GET 127.0.0.1:4174/v1/platform/input-direction` → **503** (no platform sidecar on Linux); without a 4174 listener the same probe is refused (2 console errors). With the lane-started listener: 0 refused, 1 recorded 503, 0 page errors, no lifecycle impact. |
| **U-04** | V1 | `SURFACE_COMPOSITION` | Long camelCase token (`productionDatabaseMutated`) breaks mid-token in the narrow check-value column — readable, not ideal; left for Controller judgement (a fix would change token wrapping everywhere). |
| **U-05** | OBS | `RESPONSIVE_RULE` | At 1440×1000 with both panes open the metric grid renders 3-across (container 654px ≤ 700 band); the 6-across band appears only when a pane is collapsed. Intentional; flagged for density preference. |
| **U-06** | HARNESS | `EVIDENCE/ORACLE` | `tools/w05-browser-flows.mjs` hardcodes candidate tree `c82cec63…` (287 files) → its receipt always records `DRIFT_RECORDED` for this lane tree (measured candidate recorded alongside). Tool is not lane-writable. |

## 9. OWNER / STOP NOTES

* **No Owner-facing item surfaced for this lane.** The four Owner-isolated items — shell redesign
  (`OWNER-20260910-010`), RQ reference promotion (`REVIEWED_FINAL_CANDIDATE`), Visualize `F-048`,
  destination-count freeze (`C03-GATE-023`) — were **not attempted, not decided, not referenced**.
* **No STOP condition was triggered**: no write outside my roots, no authority conflict, no false receipt
  required, scope stayed inside the sealed `BKP-1` row.
* **Shared-component protocol honoured:** U-01/U-02 live in shared shell code → recorded only
  (no `SERIALIZED_HOTSPOT_REQUEST` needed because no shared write is required by this lane's objective).
* **Non-owned side effects reverted:** `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json`,
  shared `writer-output/W05/` (artifacts preserved in `evidence/flow/`).
* **Never touched:** `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`,
  `dist-ts/**`, other lanes, `main`, `writer/mi-serial`, other worktrees.
* **H03 PROP/FALSIFY unchanged** — not in this lane's scope, not upgraded by static evidence.
