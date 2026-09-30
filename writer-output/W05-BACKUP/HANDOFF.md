# HANDOFF — W05-BACKUP (surface `backup`)

**Unit:** `W05-BACKUP` · **Class:** `SURFACE_UNIT__CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Acceptance:** `NOT_OWNER_ACCEPTED` — Controller re-verification required on every dimension below.

---

## 1. WHAT THIS SURFACE IS FOR

Protect state and **prove that restore works**. The work surface is the Restore Drill and its
per-stage verdicts — not a list of backup files, not a lifecycle diagram. Reference (construction
authority, `OWNER_CONFIRMED_FINAL_REFERENCE`):
`cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/05_BACKUP_AND_RESTORE/CEP_SYSTEM_BACKUP_RESTORE_RESTORE_DRILL_REFERENCE.png`
(sha256 `782e813a4ffacd96…`, 1536×1024, re-verified by sha256sum + tesseract eng/ara OCR of the same
bytes this session).

## 2. STAGE

`SOURCE_FIXES_APPLIED__OFFLINE_VERIFIED__BUILD_AND_CAPTURE_PENDING`

All **13 baseline defects (D-01…D-13)** are fixed **in source**. An offline mount smoke test passes
(0 failures). **No visual PASS is claimed** — matched-viewport recapture and L1–L4 re-comparison were
not completed inside this session's budget.

## 3. FILES CHANGED (working tree only — no `git add` / `git commit`)

| File | Change |
|---|---|
| `stack/native-typescript/surfaces/backup/index.ts` | Composition rewritten: focal drill panel, localized copy, grouped left pane, 9-block right pane, ledger bottom shelf, language observer, command re-localisation |
| `stack/native-typescript/surfaces/backup/style.ts` | Added: bdi break-word rule (D-11), logical paddings (D-05), pane-scoped tone colors, `.bk-truth`, `.bkr-metric-pair`, direction-neutral disclosure cue |
| `stack/native-typescript/surfaces/backup/i18n.ts` | Extended: `truthTitle`, `provTitle`, `failureJournal`, `authorityRequest`, `noAuthority`, `clearFilters` (both locales) |
| `stack/native-typescript/surfaces/backup/icons.ts` | Extended: `chevron` disclosure glyph (surface-owned inline SVG) |
| `stack/native-typescript/adapters/backup-runtime.ts` | **Unchanged** — no adapter change was needed; readiness reasons are localised at the surface seam |

## 4. HOW EACH DEFECT WAS FIXED

- **D-01 (V4)** Every string goes through `tx()/txList()`; locale read from `<html lang>`; a
  `MutationObserver` on `lang/dir` re-renders when the user switches language in Settings.
  Offline proof: en/ltr markup contains no Arabic; ar/rtl markup contains no English command label.
- **D-02 (V4)** Focal panel = head + status pill · 5-cell meta strip (source/started/completed/
  duration/environment) · **8-stage pipeline with per-stage verdicts** · **3×3 real-check grid** ·
  **6 big-number expected-vs-actual metrics** with legend. Every number derives from provider
  receipts (`readbackSummary`, drill `preflight`/`readback`, schema signatures) — nothing invented.
- **D-03 (V3)** DOM order: header → safety banner → single focal drill panel. The standalone
  lifecycle stepper is deleted (its content lives in the pipeline + left groups + readiness block).
- **D-04 (V3)** One `.bk-panel.is-focal` instead of 5 equal-weight bordered boxes; spacing on the
  4/8/12/16/24 scale; the stretched 2-card stepper row is gone.
- **D-05 (V2)** No `←`. Connector is a CSS rule with `inset-inline`; disclosure cue is a
  direction-neutral down/up chevron; `.bkl-search input` and `.bk-meta` paddings made logical.
- **D-06 (V2)** Emoji → surface-owned inline SVG (`icons.ts`), always paired with a text label.
- **D-07 (V2)** Right pane = 9 icon-headed blocks incl. red risk block, readiness with localised
  reasons, and an RTO/RPO metric block (RTO = drill attempt duration, RPO = window since capture).
- **D-08 (V2)** Left pane = search + verified-only toggle + 4 collapsible counted groups (restore
  points / drills / journal / authority); rows carry lock affordance + status pill; over-filtering
  offers *View all* + *Clear search & filter*.
- **D-09 (V2)** Bottom = durable-attempt ledger table + provenance strip; raw JSON only behind
  `<details>`.
- **D-10 (V2)** Status copy is localized human phrasing (`{cmd} · receipt recorded.`). The overlay
  element itself is shared foundation chrome (`#foundationStatus`, auto-clears 6 s) — **not
  modified** (shared-component protocol: surface contribution fixed, shared placement left alone).
- **D-11 (V1)** `<bdi>` now owns `overflow-wrap:break-word; word-break:normal`, scoped to
  `.bk-root/.bkl/.bkr/.bkb`, so `productionDatabaseMutated = false` wraps at spaces.
- **D-12 (V1)** Commands re-sync label + availability + run on every render, then
  `workspace.refreshToolbar()`; blocked reasons come from `COMMAND_REASON_KEYS` (localized).
- **D-13 (V2)** No-drill first paint renders the full composition: `NOT RUN` pill, designed
  `.bk-nostrun` statement, meta strip with em-dashes, 8 `NOT_RUN` stages, pending/deferred checks,
  metrics as `expected / —` + "Compare runs after a drill produces a receipt.", truth chips.

## 5. EVIDENCE

- Baseline (superseded for comparison, retained for lineage): `writer-output/W05-BACKUP/evidence/`
  — `baseline-drill-full.png` sha256 `0957b88da880d0ff…` 1536×1024, plus region crops, empty-state
  captures and `baseline-drill.json` (8/8 checks + geometry).
- Offline structural/language smoke: `/tmp/opencode/bk/smoke.mjs` → `{"pass": true}` (8 stages,
  9 checks, 6 metrics, no emoji, no `undefined`/`NaN`, no legacy stepper/arrow, 9 right blocks,
  receipt behind disclosure, localized labels, no cross-language leakage). **Not visual evidence.**
- Post-fix browser captures: **PENDING** (see §7).

## 6. §12 STATUS (all fields in `VISUAL_EXECUTION_REPORT.json`)

`SURFACE` backup · `OWNER` W05-BACKUP · `REFERENCE_CLASSIFICATION` OWNER_CONFIRMED_FINAL_REFERENCE ·
`CURRENT_CANDIDATE` writer/mi-serial uncommitted delta · `FILES_CHANGED` 4 surface files ·
`FUNCTIONAL_STATUS` source applied + offline smoke pass, browser re-lifecycle pending ·
`STRUCTURAL_STATUS` recomposed, measurement pending · `VISUAL_STATUS` 13/13 fixed in source,
recapture pending · `VISUAL_COMPARISON_LEVELS_COMPLETED` L1–L4 done for baseline, re-comparison
pending · `RESPONSIVE_STATUS` source-only (container queries 860/660/470) · `RTL_LTR_STATUS`
offline pass both directions, browser pending · `DEFECTS_FOUND` 13 · `DEFECT_SEVERITY`
V4:2 V3:2 V2:6 V1:2 · `FIXES_APPLIED` 13 · `RECAPTURE_STATUS` pending · `RECOMPARISON_STATUS` pending
· `REGRESSION_STATUS` not started · `ACCEPTANCE_STATUS` **NOT_OWNER_ACCEPTED** · `BLOCKERS` B-01.

## 7. BLOCKERS

- **B-01 (resolved during session, verify)** The shared build was transiently red from a concurrent
  unit's edit of `stack/native-typescript/surfaces/manual_ai` (`ERR_INVALID_TYPESCRIPT_SYNTAX` on
  `():'rtl'|'ltr'=>`). Not edited by this unit. It went green later in the session; the browser
  recapture below still had to be completed after it.

## 8. NEXT STEPS (in order)

1. `tools/writer-serial.sh npm run build:runtime`
2. `node writer-output/W05-BACKUP/evidence/harness/capture.mjs --label=postfix-empty --lang=en --w=1536 --h=1024`
   and `--label=postfix-drill --lang=en --drill`, plus `--lang=ar` RTL runs; record sha256+dims.
3. Re-compare L1–L4 vs the reference; OCR cross-check every image claim.
4. Regression: S18 domain tests, `npm run check`.
5. Controller acceptance on all 11 dimensions.
