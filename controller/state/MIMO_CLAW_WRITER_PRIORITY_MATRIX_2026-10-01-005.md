# TEMPORARY WRITER PRIORITY MATRIX — MIMO CLAW (CP-2026-10-01-005)

> TEMPORARY EXECUTION PLANNING STATE only (§53). It does not change CEP governance, Surface
> ownership, or the acceptance law. Basis snapshot: see `MIMO_CLAW_WRITER_PRIORITY_MATRIX_2026-10-01-005.json`.
> **No Writer may run before the Owner explicitly approves rows (§96).**

| Priority | Writer Work / Surface(s) | Writer Allocation & Parallelism | Why Writer Is Still Required |
| -------- | ------------------------ | ------------------------------- | ---------------------------- |
| P0 | **WM-001 · W02-LIBRARY** — close the 6 recorded V2–V3 visual defects vs OWNER reference; fix EN/AR chrome (Arabic-only strings under EN); refresh report | mimo-v2.6-flash · SERIAL_ONLY (Library editor mechanics are the donor base; no concurrent editor-core mutation) | Defects are composition-level across L1–L4 × 2 locales; sustained visual authoring + re-verification loop the Controller cannot close safely in one surgical pass (§17.8–9) |
| P0 | **WM-002 · W04-REVIEWS** — complete the visual ownership loop from READING_REFERENCE (surface unblocked 2026-10-01 by Controller i18n repair; route now boots) | mimo-v2.6-flash · PARALLEL_ALLOWED with WM-003, WM-004 | No owned composition exists yet; a full bounded authoring loop (reference → build → captures → L1–L4) is Writer-scale work |
| P0 | **WM-003 · W03-RESULTS** — full visual ownership loop (never dispatched; only controller studio mount exists) | mimo-v2.6-flash · PARALLEL_ALLOWED with WM-002, WM-004 | Same: full owned composition + bilingual matched evidence; replay/AAR semantics need sustained surface authoring |
| P1 | **WM-004 · W02-VISUALIZE** — close open V2/V3/V4 defects after the composition rewrite; matched EN/AR + responsive proof; Tree-View identity preserved | mimo-v2.6-flash · PARALLEL_ALLOWED with WM-002, WM-003 | Rewrite is unverified against reference; multiple open defects recorded in the rescued report; needs a real visual ownership loop, not a patch |
| P1 | **WM-005 · W05-AUDIT** — recompose toward the reference: center split (event table + trace timeline + JSON), bottom status/action bar, compact header (see reconstructed report AUD-V1..V3) | mimo-v2.6-flash · PARALLEL_ALLOWED | Controller evidence repair is done; the composition gap itself is sustained visual authoring |
| P1 | **WM-008 · W05-VALIDATION** — visual ownership loop FIRST of the W05 trio (owns `w05-rescue.ts` write slot) | mimo-v2.6-flash · SERIAL_ONLY vs WM-006/WM-007 · SERIAL_REASON: shared `w05-rescue.ts` write-ownership split | Never dispatched; needs owned composition + evidence loop |
| P1 | **WM-006 · W05-HEALTH** — visual ownership loop (requests `w05-rescue.ts` writes via `tools/writer-serial.sh`) | mimo-v2.6-flash · SERIAL_ONLY, after WM-008 | Same; serialized seam |
| P1 | **WM-007 · W05-PROCESSING** — visual ownership loop (requests `w05-rescue.ts` writes) | mimo-v2.6-flash · SERIAL_ONLY, after WM-008 | Same; serialized seam |
| P2 | **WM-009 · W04-MASTERY** — complete loop from INITIALIZED | mimo-v2.6-flash · PARALLEL_ALLOWED with WM-010 | No owned composition; full loop required |
| P2 | **WM-010 · W04-PORTFOLIO** — resume and complete the loop (session-start state preserved) | mimo-v2.6-flash · PARALLEL_ALLOWED with WM-009 | Same |
| P2 | **WM-011 · W01-SHELL** — AD-02 only: donor/shared chrome Arabic hardcodes → bilingual chrome sweep | mimo-v2.6-flash · SERIAL_ONLY · SERIAL_REASON: shared seam files (`dist/index.html`, `foundation/extensions.css`, shell chrome) are single-owner serialized hotspots | Cross-chrome bilingual sweep on shared seams; broader than a surgical label fix |

## HOLD / BLOCKED rows (not dispatchable)

| Row | Work | Hold semantics | Unblock condition |
| --- | ---- | -------------- | ----------------- |
| WM-012 | W01-SHELL global shell/navigation redesign | HOLD — BLOCKED_BY_DEPENDENCY (OWNER-20260910-010) | Owner declares the shared workbench foundation stable |

## NO_WRITER_REQUIRED_NOW (deferred by design)

today, rq, scenarios, evidence, configuration, manual_ai, releases, backup, enterprise, labs, learn,
runs — all are **candidate / awaiting Controller review or recapture** at current evidence. None justifies
Writer quota now (§63–65). Each can spawn a row after review falsifies its candidate (§55 recomputes
minimum scope only).

## Parallel groups (if approved)

- PARALLEL_APPROVED candidates: **WM-002 + WM-003 + WM-004** (disjoint surfaces) · **WM-005 + WM-009 + WM-010**
- SERIAL_APPROVED required: **WM-008 → WM-006 → WM-007** (w05-rescue seam) · **WM-001** runs alone (editor donor base) · **WM-011** runs alone (shared chrome seams)
