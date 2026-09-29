# 02_current_truth / current_route_census + current_browser_census

Timestamp: 2026-09-29T01:30Z · Status: **PASS_WITH_LIMITATION** (census reconstructed from retained receipts + live surface/profile inventories; a fresh route sweep was NOT re-executed this pass)

## Surface census — 23 surfaces (canonical product taxonomy)

Evidence: `profiles/*.json` (23 SurfaceProfiles), `contracts/23_SURFACE_INHERITANCE_MATRIX.{csv,json}`,
`authority/23_SURFACE_CURRENT_REQUIREMENT_INDEX.{csv,json}`, and the zero-loss per-surface mission map
(23/23 rows, Drive).

| # | Surface | Profile | Product source dir | Zero-loss obligations (Drive) |
|---|---|---|---|---|
| 1 | SHELL | profiles/shell.json | surfaces/shell | 352 |
| 2 | TODAY | profiles/today.json | surfaces/today | 359 |
| 3 | LIBRARY | profiles/library.json | surfaces/library | 375 |
| 4 | LEARN | profiles/learn.json | surfaces/learn | 369 |
| 5 | RQ | profiles/rq.json | surfaces/rq | 353 |
| 6 | VISUALIZE | profiles/visualize.json | surfaces/visualize | 388 |
| 7 | ENTERPRISE | profiles/enterprise.json | surfaces/enterprise | 412 |
| 8 | SCENARIOS | profiles/scenarios.json | surfaces/scenarios | 439 |
| 9 | LABS | profiles/labs.json | surfaces/labs | 441 |
| 10 | RUNS | profiles/runs.json | surfaces/runs | 461 |
| 11 | RESULTS | profiles/results.json | surfaces/results | 430 |
| 12 | EVIDENCE | profiles/evidence.json | surfaces/evidence | 382 |
| 13 | REVIEWS | profiles/reviews.json | surfaces/reviews | 355 |
| 14 | MASTERY | profiles/mastery.json | surfaces/mastery | 353 |
| 15 | PORTFOLIO | profiles/portfolio.json | surfaces/portfolio | 355 |
| 16 | HEALTH | profiles/health.json | **UNKNOWN (no surfaces/health)** | 355 |
| 17 | PROCESSING | profiles/processing.json | **UNKNOWN (no surfaces/processing)** | 361 |
| 18 | VALIDATION | profiles/validation.json | surfaces/validation | 359 |
| 19 | MANUAL_AI | profiles/manual_ai.json | surfaces/manual_ai | 352 |
| 20 | BACKUP | profiles/backup.json | surfaces/backup | 354 |
| 21 | AUDIT | profiles/audit.json | surfaces/audit | 345 |
| 22 | RELEASES | profiles/releases.json | surfaces/releases | 354 |
| 23 | CONFIGURATION | profiles/configuration.json | surfaces/configuration | 347 |

Shared/composition: `surfaces/composition/` (incl. `w05-rescue.ts`), `surfaces/m0-controller-composition.ts`,
`foundation/global` (GlobalShellNavigationOwner line) — ownership assignment pending Wave 5/6.

## Route/browser census — retained diagnostic evidence (NOT fresh proof)

From `assurance/BROWSER_CONFORMANCE_RECEIPT.json` (current worktree copy, written 2026-09-29T23:35
local) and `cep-writer/KNOWN_OPEN_GATES.md`:

- Retained claim: current-baseline two-viewport route/baseline census **46/46** diagnostic route/viewport
  cases; **23/23** reload route identity at 1440×1000; **22 PASS / 0 FAIL / 1 N/A** internal Back/Forward
  navigation — all classified `WRITER_RELEVANT_CURRENT_GATE_PROJECTION__NOT_ACCEPTANCE`.
- Browser conformance receipt summary in the worktree: **total 6 / pass 1 / fail 5**
  (`workspace.transient-and-pane-lifecycle` PASS; `spatial.selection-connect-canonical-edge`,
  `relation.route-convergence-and-label-scope`, `central-change-reuse`, `runtime-causal-consequence`,
  `spatial-input-bidi-preference-and-structured-isolation` FAIL), `executionStatus=BLOCKED_OR_FAILED`.
- Receipt candidate binding: `CANONICAL_SOURCE_TREE_SHA256:a676f663…` — this matches **neither** the
  canonical identity `480dbe…/273` **nor** the current live worktree identity `2ebcbf89…/287`.
  Classification: **LINEAGE** failure — the receipt is orphaned from both known candidates and cannot
  be promoted as evidence until rebound and re-run (see `07_browser/failure_taxonomy.md`).

## Open product findings recovered (projected, per KNOWN_OPEN_GATES + zero-loss index §5)

P0: `CBF-001` (persistence seed `section` type vs StructuredTreeKernel), `CBF-002` (Back restores
route, loses semantic context), `CBF-003` (domain BOTTOM orphaned from BottomDeepWorkOwner);
`F-049/F-050` (Canvas remove leaks / identity-grammar), `F-051` (evidence-receipt overcount);
`MFC-PF-001..003`; `PVF-001..003` (Enterprise Twin/Baseline, Runs Preflight, Results AAR/Compare);
open gates `C03-GATE-020..024` (023 is Owner-authority-only, `destinationCountFrozen=false`).
