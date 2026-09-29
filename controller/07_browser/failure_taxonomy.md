# 07_browser / failure taxonomy — adjudicated current state (B-4 COMPLETE)

Timestamp: 2026-09-29T02:05Z · Adjudicator: Controller (final interpretation authority, mission §26)

## B-4 lineage repair — CLOSED

| Item | Before | After |
|---|---|---|
| Receipt candidate | `a676f663…` — matched NO known identity (**LINEAGE** failure) | `c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f` / 287 files |
| Reproducibility | unverifiable | **independently recomputed** via the repo's binding module `tools/source-tree-identity.mjs` → exact match |
| Transport | `file` | **`localhost-http`** (genuine HTTP route, `tools/serve.mjs` on 127.0.0.1:43173) — stronger than the historical receipt |
| Original evidence | overwritten risk | **preserved** at `controller/08_evidence/legacy_evidence/*.pre-rebind-20260929T0145Z` + `PRESERVATION_RECEIPT.json` (hashes bound) |

Identity chain (all recomputed with the binding algorithm `path\0size\0sha256\n`):
`480dbe…/273` (canonical, parent commit `293dd1e`) → `3f3ad1e0…/287` (clean HEAD `48fec276`) →
`c82cec63…/287` (live worktree variant = 3 drifted files). Receipts must name which of the three
they bind. Correction notice: an earlier Controller note cited worktree hash `2ebcbf89` — that value
was computed with the field order `path\0sha256\0size` (wrong) and is **retracted**; the correct
worktree identity is `c82cec63…`.

## Failure classification — 6 declared flows, 1 PASS / 5 FAIL (candidate `c82cec63…`, Playwright 1.62.1 Chromium, 1440×980, reducedMotion)

| Flow | Status | Classification | Evidence | Smallest next step |
|---|---|---|---|---|
| workspace.transient-and-pane-lifecycle | PASS | — | receipt | none |
| spatial.selection-connect-canonical-edge | FAIL | **UNKNOWN** (ORACLE vs PRODUCT) | `#objectList [data-object="b6-rep-ku-d03-0001"]` resolves in DOM but "element is not visible" across 60 retries | capture computed visibility + ancestor `hidden`/`display` at precondition; if product hides it by design → ORACLE (fix assertion), else PRODUCT |
| central-change-reuse | FAIL | **UNKNOWN** (same signature) | identical locator-not-visible timeout | same probe closes both |
| relation.route-convergence-and-label-scope | FAIL | **PRODUCT** | page error `TypeError: Cannot read properties of null (reading 'querySelector')` raised in page during `waitForFunction` | locate null deref in relation route convergence path; map to owner surface (RQ/VISUALIZE shared) |
| runtime-causal-consequence | FAIL | **HARNESS** | `page.evaluate: TypeError: … reading 'id'` thrown inside the harness eval (`at Utilit…`), not in product code | fix probe's guard for missing state; re-run to reveal underlying product state |
| spatial-input-bidi-preference-and-structured-isolation | FAIL | **UNKNOWN** (PRODUCT-layout vs ORACLE-timing) | assertion "spatial canvas has no measurable bounds" (canvas zero-size) | measure `#spatialCanvas` bounds after `spatial.fit()`; note worktree CSS drift sets `.spatial-host`/`.foundation-stage` min-height 320px — classification must be re-done against canonical `480dbe…` too |

Notes:
- All 5 failures ran against the **worktree variant** `c82cec63…`, which includes 3 unadjudicated
  canonical-source deltas (`main.ts`, `extensions.css`, `xterm-renderer.ts` — see
  `08_evidence/worktree_disposition.md`). Per-flow classifications are therefore provisional to the
  candidate and must be re-bound when the delta is adjudicated.
- No flow is labeled "Product bug" or "browser issue" by default; `UNKNOWN` is used where the
  evidence cannot yet separate PRODUCT from ORACLE (mission §25).
- Policy held: **no repair loops**. This pass produced classification + lineage, not green flows.
- ENVIRONMENT class recorded separately: `/usr/bin/chromium` (historical harness executable) is
  **absent** in this Codespace; execution used Playwright's package-local Chromium headless shell.
  `CEP_BROWSER_EXECUTABLE` override not required. Class: ENVIRONMENT (documented difference vs
  historical receipts, non-blocking).
