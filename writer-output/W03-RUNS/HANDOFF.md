# W03-RUNS HANDOFF — LANE RUN-1 (CANDIDATE_ONLY · NO_SELF_PROMOTION)

**Unit:** W03-RUNS · **Surface:** runs · **Branch:** `writer/mi-serial-lane/RUN-1`
**HEAD:** `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` (verified as first action; clean status at start)
**HEAD tree:** `f22c70ce9597f07a9cf9ecb9bbc2ecd361fc3684`
**Canonical source tree (stack/native-typescript):** `31fdb9a5375c2ef663d793f2eefd7585675481b2fc1d77f016c77f9e48b4fd5b` (338 files)
**Env:** node v22.16.0 · deps installed · isolated worktree · Controller parent binding untouched
**Status:** NOT_OWNER_ACCEPTED — sole Controller review required. H03 PROP/FALSIFY stay `NOT_PROVEN` (no relation/Enterprise claim made).

---

## 1. SEALED OBJECTIVE vs DELIVERED

| Mission item | Result |
|---|---|
| (a) Close `PENDING_BUILD` responsive/RTL (+build/recapture) | **CLOSED** — fresh source-bound recapture at exact HEAD+tree, required viewports/locales, DOM-asserted, defects fixed in-owned (§4) |
| (b) H03 residual F02 fail-closed singleton (own roots) | **CLOSED** — 13/13 fail-closed probe; no silent `new OperationalSessionOwner()` on the Product path |
| (c) Preserve H-RUN-1 | **PRESERVED** — re-probe `HRUN1_PASS__LIVE_ROUTE_MOUNT_PROVEN` (not reopened) |
| Positive tests `npm test` 210/0 + flows + packet tests | **PASS** (§3): flows 7/7 + `runtime-causal-consequence` PASS at final tree; `npm run check` = the documented single known red only |

## 2. CHANGED PATHS (write scope respected)

Source (all inside sealed writable roots — nothing else touched):
- `stack/native-typescript/adapters/runs/domain.ts` — F02 fail-closed (no owner instantiation; `requireSessionOwner()`; null-safe `truth()`/`openSessions()`; `sessionOwnerBinding`/`sessionOwnerFallbackCreated` truth fields)
- `stack/native-typescript/surfaces/runs/index.ts` — explicit harness-only default (`harnessRunsDomain()`); availability-level fail-closed `RUNS_SESSION_OWNER_REQUIRED`
- `stack/native-typescript/surfaces/runs/styles.ts` — `.runs-bar` flex-wrap (no tab clipping), `.runs-tab` padding 12→10, `overflow-wrap:anywhere→break-word` on `.runs-kv dd`/`.runs-detailgrid dd`
- `stack/native-typescript/surfaces/runs/i18n.ts` — `alerts.of/prev/next` (ar+en)
- `stack/native-typescript/surfaces/runs/views.ts` — localized, `<bdi>`-isolated pager

Writer output: `writer-output/W03-RUNS/**` (probes, evidence, `VISUAL_EXECUTION_REPORT.json`, this HANDOFF).
**Refused (recorded):** the F02 root also exists in `surfaces/m0-controller-composition.ts` (Product ternary passes `{}` when shared-owner injection is absent) — file owned by another lane (`m0-controller-composition.ts`/`main.ts` never edit); fix was neutralized inside owned roots instead.

## 3. TESTS + FALSIFICATION

**Baseline (pre-edit, exact parent):** `build:runtime` exit 0 · `npm test` 210/0 · `w03-browser-flows` 7/7 · `browser:test` 4/6 with exactly the 2 global Enterprise FAILs (`relation.route-convergence-and-label-scope`, `central-change-reuse` — NOT mine) and `runtime-causal-consequence` PASS · packet tests (runs domain, runs group-regression, S12, CG4 composition+falsification, D09 10/0) all PASS.

**Post-edit (candidate):**
- `npm run build:runtime` exit 0 (×3).
- `npm test` **210/0**; packet tests **6/6 PASS** (D09 `pass:10 fail:0`).
- `npm run check` → **exactly the documented single known red** `browser.lineage_receipt_truthful` (6/6 guard, 2 Enterprise flows open — do NOT fake green); `vs05-read-mode-matrix` + `vs05-command-ownership` PASS (run individually — the `&&` chain stops at the known red).
- `node tools/w03-browser-flows.mjs` → **7/7 PASS at FINAL tree `31fdb9a5` / commit `fe1bb98ded51`** (incl. `runs-preflight-run-recorded`), receipt + runs capture in `evidence/flows-final-tree/`.
- `npm run browser:test` → **4/6 at final tree**: `runtime-causal-consequence` **PASS (kept PASS)**; only the 2 global Enterprise FAILs (`relation.route-convergence-and-label-scope`, `central-change-reuse` — not this lane); `workspace.transient…`, `spatial.selection-connect…`, `spatial-input-bidi…` PASS.
- `npm run check` at final receipts → **exactly the documented single known red** `browser.lineage_receipt_truthful` (6/6 guard while the Enterprise defect is open; `browser.current_candidate_claim_truthful` PASS at the candidate tree); `vs05-read-mode-matrix` + `vs05-command-ownership` PASS run individually (the `&&` chain stops at the known red).

**Falsification (fresh, final tree):**
- **N1** write-scope census → 0 out-of-scope mutations (out-of-root edit refused, recorded) — `evidence/falsification-n1-n5-20261002T053102Z.json`
- **N2** boundary/invalid → `RUNS_SESSION_OWNER_INVALID` / `RUNS_SHARED_SPATIAL_REQUIRED` / `CAPABILITY_UNAVAILABLE` (no state created) / `RUN_TERMINAL_NOT_OPEN` / `409` — same file
- **N3** no prerequisite → `RUN_NOT_RUNNING`, `RUN_NOT_READY`, provider loss → `PROVIDER_DISCONNECTED` while lifecycle stays `RUNNING` — same file
- **N4** `check-duplicate-mechanics.mjs` exit 0 — same file
- **N5** suite twice → 210/0 both, identical id:status digest — same file
- **Lane-specific (F02):** with shared-owner injection absent, exact Product construction `new W03RunDomain({})` → `sessionOwner===null`, no `OperationalSessionOwner` instance, `openTerminal/input/reconnect` throw `RUNS_SESSION_OWNER_REQUIRED`, availability refuses (no throw), `truth()` reports `ABSENT_FAIL_CLOSED` + `sessionOwnerFallbackCreated:false`; `composeW03RescueGroup` without shared owner → `W03_CONTROLLER_SHARED_OWNER_BINDINGS_REQUIRED`; injected-owner positive control opens a terminal — **13/13** `evidence/f02-fail-closed-probe-20261002T053055Z.json`
- **Terminal/provider truth** — `INTERNAL_SIMULATION`, pty/powershell/ssh/nativeWindow false, `UNVERIFIED_PLATFORM_GATE`, no real-process claim (checked in both injected and fail-closed states).

## 4. FOUR TRUTHS (separately)

| Truth | Status | Basis |
|---|---|---|
| **P — build/platform** | **PASS (was PENDING_BUILD)** | `npm run build:runtime` exit 0 at candidate; generated dist from canonical source only; source tree hash `31fdb9a5…` recorded in every manifest/receipt; 4174 listener proven from this worktree (`LISTENER_PROOF.json`, ss + HTTP evidence, stopped after proof) |
| **B — browser** | **PASS** | `w03-browser-flows` **7/7 at final tree `31fdb9a5`** incl. `runs-preflight-run-recorded`; `browser:test` 4/6 with `runtime-causal-consequence` PASS (kept PASS) and only the 2 global Enterprise FAILs; captures at exact HEAD `fe1bb98ded51`. Transiently blocked while sibling BKP-1's 4174 listener was up (§7 B1, environmental, resolved after listener cleared) |
| **C — code/bilingual** | **PASS (owned scope)** | ar/en verified at 1440/1024/1505: htmlLang/dir, tab labels, identity title, terminal hint, pager all localized + `<bdi>` isolated; static census: Arabic literals in owned files only behind `localeOf()==='ar'` guards; **residual foundation/shell Arabic-under-EN chrome recorded, out of roots** (§5) |
| **DP — domain/provider** | **PASS / truthful** | `runtimeTruth: INTERNAL_SIMULATION`; pty/powershell/ssh/nativeWindow all `false`; `realTerminalProof: UNVERIFIED_PLATFORM_GATE`; provider loss is not Run completion; recorded playback `INERT`; no fabricated terminal/session success (fail-closed instead) |

## 5. SALVAGE PRESERVED (exact)

`hrun1-*` probes/captures (incl. fresh re-probe `hrun1-*-20261002T052402Z.*`), `SERIALIZED_HOTSPOT_REQUEST.md`, `candidate*`/`final*`/`route-current` captures (62 paths), `superseded-20260930T1834Z-*` + `superseded-20260930T1908Z-*`, prior `VISUAL_EXECUTION_REPORT.json` fields (superseded in-place with lineage note), `capture.mjs`/`mount.mjs`/`probe*.mjs`. Nothing restarted, reverted, reset or deleted; two first-attempt FAIL probe JSONs retained as truthful failures; interrupted-capture orphan frames moved (not deleted) to `run1-final-matrix-states/superseded-20261002T0522Z-INTERRUPTED-CAPTURE/` with README proving byte-identity to manifest frames.

## 6. EVIDENCE (hash-bound, exact HEAD/tree)

- **Current recapture:** `evidence/run1-close-responsive/` (1440×1000 + 1024×900 × en/ar, 4 frames) and `evidence/run1-close-matrix/` (1505×1045 × en/ar × operations/preflight/timeline/topology, 8 frames) — each frame sha256 + dir/lang/overflow/pageErrors in `CAPTURE_MANIFEST.json` (commit `fe1bb98ded51` + writableRootDiff); **0 page errors, 0 horizontal overflow, 8/8 and 4/4 unique frame hashes**.
- **DOM assertions:** `evidence/responsive-assert-1790920182430.json` — all 4 mode tabs visible at every viewport/locale (`modeBarClipped:false`, scroll==client), `overflow-wrap:break-word` on detail/kv values, pager `1–4 of 4` (en) / `1–4 من 4` (ar) with `<bdi dir="ltr">`, terminal hint localized both ways.
- **F02 + falsification:** §3 JSON files (13/13, 12/12).
- **H-RUN-1 preserved:** `evidence/hrun1-probe-20261002T052402Z.json` verdict `HRUN1_PASS__LIVE_ROUTE_MOUNT_PROVEN`.
- **4174 listener truth:** `evidence/runtime-4174-listener/` (LISTENER_PROOF.json, ss-listen.txt showing this worktree's node pid, http-root-code, after-stop CLOSED).
- **Flows (final tree):** `evidence/flows-final-tree/` receipts (w03-browser-flows 7/7 + browser-conformance at tree `31fdb9a5` / commit `fe1bb98ded51`) + `runs-preflight-run-recorded` + `runtime-causal-consequence` shutdown captures. Intermediate post-edit receipts retained in `evidence/flows-post-edit/` (tree `7c64a2e2`).
- **Out-of-root finding probe:** `evidence/foundation-en-arabic-chrome-probe.json`.
- **Superseded retained:** `run1-final-*` sets (§5) + prior `baseline/candidate/final*`.

## 7. UNRESOLVED FINDINGS / BLOCKERS

- **B1 (environmental, RESOLVED):** while sibling lane **BKP-1's** `runtime:local` held `127.0.0.1:4174` (their worktree; verified `/proc/<pid>/cwd`), every `networkidle` navigation stalled: foundation `platform-input-direction-bridge.ts` does `if (!res.ok) return null` without reading the 503 body → Chromium never fires `requestfinished` for that request (minimal repro: unread non-OK body never finishes, read body finishes; curl to the same URL returns 503 in <5 ms, `content-length: 68` captured from Chromium). My own listener was proven then stopped (mission requirement); cross-lane port collision recorded, **no other lane's process touched**. After the listener cleared (06:01Z) the flows were re-run at the final tree → **7/7 + runtime-causal-consequence PASS**.
- **B2 (record-only):** foundation/shell Arabic-only chrome under EN — DEF-RUN-R05 (`foundation/accepted-runtime.ts:508` pane edge-toggle labels; `foundation/presentation-carrier` blueprint → `dist/index.html` rail markup). Out of RUN-1 roots → **foundation → request, not edit**.
- **B3 (record-only):** shell Runs toolbar labels English under AR — prior report H-RUN-2 (shell-owned, unchanged).
- **V1 residual:** narrow Alert Details value track wraps long tokens (`203.0.113.4/5`) — cosmetic, not fixed to preserve reference grid proportions.
- **Owner-facing items untouched:** shell redesign (OWNER-20260910-010), RQ reference promotion, Visualize F-048, destination-count freeze — not attempted.

## 8. OWNER / STOP NOTES

- No authority conflict found in the closed read set; no Owner-facing decision surfaced. No STOP condition was hit.
- Status stays `NOT_OWNER_ACCEPTED`; candidate only; no merge/promotion attempted. Push target: `origin/writer/mi-serial-lane/RUN-1` only.
- `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json` and `writer-output/W03/**` (sibling W03 flow evidence regenerated by the mandated flow tools) are restored to HEAD before the commit — net-zero out-of-root diff; only §2 paths are committed.
