# WRITER DAG & LAUNCH PACKETS — 2026-10-02 (SEALED)

**Class:** `RECOVERY_DAG_AND_PACKETS__LAUNCH-READY_AFTER_RECOVERY_GATE_PASS__CANDIDATE_ONLY__NO_SELF_PROMOTION`
**Author:** PRIMARY_RECOVERY_CONTROLLER. Basis: sealed `EXISTING_EVIDENCE_REUSE_MATRIX_23_SURFACES.md` + recovery ledger.
**Authority:** `OD-20261002-087` (parallel disjoint lanes; one mutating Writer per bounded lane; serialize shared hotspots/same-owner/dependencies/final wiring) + `OD-20260916-043` (value-weighted) + `OD-20260914-037` (isolated candidates) + `OD-20260921-066` (mission-bound branches) + `OD-20260915-039` (max safe parallel) + `OD-20260918-057` (balanced specialists).
**EXECUTION_CARRIER:** `ROUTE-MIMO-AGENT` (Codespaces/OpenCode/MiMo).
**EXACT_PARENT binding rule:** parent = the first remote commit on `writer/mi-serial` containing this file at this path (deterministic; equals the identity reported in the `RECOVERY_GATE_PASS` response). Lane materialization MUST verify `git fetch && git rev-parse` equals that identity before any mutation; mismatch = STOP.

## 0. Common packet contract (applies to every lane below)

- **Objective frame:** one bounded lane = one Surface/owner scope; preserve listed salvage; close listed findings; produce evidence; return `CANDIDATE_ONLY`.
- **Closed read set (all lanes):** this file; `controller/09_writer_forge/surface_units/<LANE>_SURFACE_PACKET.md`; `controller/09_writer_forge/VISUAL_EXECUTION_STANDARD.md` (incl. §0 execution-config-not-governance + OD-087 overlay); `cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv`; `controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json` (unit row only); `profiles/<surface>.json`; `controller/state/RESUME_STATE.md`; exact own-row of `controller/12_execution/EXISTING_EVIDENCE_REUSE_MATRIX_23_SURFACES.md`. `NO_DISCOVERY_BY_DEFAULT`: no `controller/**` archaeology beyond these, no Drive reads, no broad repo grep.
- **Writable:** exactly per-lane roots below. **Read-only:** everything else. **Prohibited:** `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `dist-ts/**`, other lanes' roots, other lanes' candidate branches, `main`, `writer/mi-serial` (Controller-only), secrets/node_modules.
- **Shared seams:** owned seams listed per lane are writable; any other shared file (incl. the 16 serialize-only paths) = STOP + `writer-output/<LANE>/SERIALIZED_HOTSPOT_REQUEST.md`.
- **Execution:** isolated worktree + candidate branch `writer/mi-serial-lane/<LANE>` from EXACT_PARENT; push only to that branch; never self-accept/merge/promote.
- **H02 do-not-repeat law (binding, from OFFLOAD-03):** no reset/revert to `48fec276`; no from-zero relaunch; do not redo donor archaeology, Backup's 13-defect diagnosis, Releases cycle 1, H-RUN-1, or closed harness fixes; rescue≠acceptance; report/file/branch presence≠completion; conceptual donor coupling≠file collision; never concurrent-mutate `w05-rescue.ts`; never silently apply the RQ hotspot request; Owner questions = STOP (not invention); provider/model/session mechanics never become governance; superseded evidence keeps provenance.
- **Environment:** node `22.16.0` (engines); `npm ci` first; local truth = `npm run build:runtime` → `npm test` (210/0 baseline) → `npm run check` (expected: 1 known red = `browser.lineage_receipt_truthful` 6/6-truth-guard while the Enterprise defect is open — do NOT fake it green) → lane-scoped tests/flows.
- **Positive tests:** lane-specific (below) + full suite green (except the known guard).
- **Negative/falsification (every lane):** (N1) non-owned-route mutation attempt → must refuse; (N2) boundary/invalid input → no corruption/false receipt; (N3) act without prerequisite data/provider → unavailable, never fabricated; (N4) `node tools/check-duplicate-mechanics.mjs` → no duplicate owner introduced; (N5) suite run twice → identical, no leakage; plus lane-specific below.
- **Evidence:** exact HEAD/tree binding; before/after captures at 1440×1000 + 1024×900 in AR/RTL + EN/LTR where Presentation-visible; receipts hash-bound to candidate bytes; final `writer-output/<LANE>/HANDOFF.md` (identity, diff, evidence, unresolved findings) + `VISUAL_EXECUTION_REPORT.json`.
- **STOP conditions:** shared-seam write needed; authority conflict found (record verbatim, never edit Owner records); evidence cannot be produced truthfully; scope would exceed roots; truth would require a false receipt; H03 PROP/FALSIFY cannot be upgraded by static evidence (both stay `NOT_PROVEN` until the dedicated proof cycle); any Owner-facing item surfaces (record, do not decide).
- **Owner-facing items isolated from ALL lanes (do not attempt):** shell redesign (OWNER-20260910-010); RQ reference promotion (`REVIEWED_FINAL_CANDIDATE`); Visualize F-048 hierarchy projection; destination-count freeze (`C03-GATE-023`).

## 1. Collision check (gate 8) — mechanical

Lane writable-root sets were pairwise-intersected against each other and against the 16 serialize-only seams (matrix Table A). Result: **0 unhandled overlaps** — every shared-file contact is either (a) owned by the lane, (b) explicitly serialized below, or (c) routed to `SERIALIZED_HOTSPOT_REQUEST`. Same-owner serialization chain: `W01-SHELL` (SH-1 → SH-2), `W03-ENTERPRISE` (ENT-1 after SH-1), `W05-VALIDATION` seam stewardship.

## 2. DAG (execution order)

```
WAVE-1 (parallel, 15 lanes): LIB-1 · LRN-1 · VIS-1 · LAB-1 · RUN-1 · REV-1 · MAS-1 · POR-1 · BKP-1 · AUD-1 · REL-1 · MAI-1 · VAL-1 · HLTH-1 · PRC-1
  (HLTH-1/PRC-1 condition: VAL-1 not changing w05-rescue semantics — they never write that seam)
SH-1 (composition-root integration; may run parallel with WAVE-1 — zero file overlap — but MUST precede ENT-1 and SH-2)
DEP: ENT-1 after SH-1 · RES-1 after RUN-1 · SH-2 after SH-1 (same owner)
WAVE-2: SH-2 ∥ ENT-1 ∥ RES-1 (pairwise disjoint after prerequisites)
CONVERGENCE (Controller-owned, serialized): integrated build → exact-HEAD browser receipt (target 6/6 only after Enterprise closes)
  → grouped independent audits (OD-039) → final integrated regression → admission
OPTIONAL (Owner-visible, NOT in core launch set): H03R2-1 propagation/falsification proof lane (M) after LIB-1+LRN-1:
  central mutation → Library change + Learn change → exact revert; inverse Library-local no-leak cycle.
  The ONLY path to close H03-R2-PROP-001 / H03-R2-FALSIFY-001 (structured-family S-03 seam → serialize).
AUDIT-ONLY (no writer): TODAY-A, RQ-A, SCN-A, EVD-A, CFG-A (read-only re-verification; new findings → new packet later).
```

Value-weighted (OD-043): no artificial serialization of disjoint lanes; only true same-owner/dependency edges serialize; no gratuitous fragmentation; the highest-value defect (Enterprise integration root) sits at the head of its owner chain.

## 3. Per-lane packets

### WAVE-1 (parallel)

| Lane | Size | Objective (bounded) | Writable roots | Owned shared seams | Salvage to preserve (exact) | Positive tests | Lane-specific falsification |
|---|---|---|---|---|---|---|---|
| `LIB-1` (library) | M_SALVAGE | Close WM-001 defect set + probe-payload/evidence conflicts; DEF-06 consumer-side verification only (foundation fix = SH-2) | `surfaces/library/`, `adapters/library-chrome.ts`, `adapters/library-fixtures.ts` | — | BASE→FIX1-3→FINAL ar/en captures; donor v1.2.17 value; real-consumer-chain flow | `npm test`; `library-edit-learn-consume-real-consumer-chain`; S01/S08/CG2 | locale flip EN→AR→EN → identical function; no Arabic-only string under EN in OWNED files (foundation → request, not edit) |
| `LRN-1` (learn) | M_SALVAGE | Continue rescued candidate: resolve report-vs-manifest staleness + R6 binding; F04 metadata fix; keep H03 ceiling | `surfaces/learn/`, `adapters/learn.ts`, `adapters/context-learn-structured.ts` | — | v1–v3 manifests; Bidi flow PASS lineage; CP-003 items | `npm test`; `spatial-input-bidi-preference-and-structured-isolation`; S08/CG3 | no Library KU/scope-switch leakage (seed Library data → Learn unchanged); truthful unavailable state with no canonical provider |
| `VIS-1` (visualize) | M_SALVAGE | Close visual V2/V3/V4 + responsive/RTL pending; F-048 stays Owner-gated | `surfaces/visualize/`, `adapters/visualize/` | — | base/cand1 receipts; LINEAGE; tree-view identity; selection-connect PASS | `npm test`; `spatial.selection-connect-canonical-edge`; `fit-pan-zoom`; S09/D08 | local canvas op must NOT mutate canonical objects (canonical-store hash probe); representation≠canonical identity asserted |
| `LAB-1` (labs) | M_SALVAGE | Finish post-fix proof (build/recapture + responsive/RTL); no restart | `surfaces/labs/`, `adapters/labs/` | — | SITE_BUILD 322-stripped; after1-3 evidence; 8 RESOLVED/2 RESIDUAL_ACCEPTED | `npm test`; S11/CG4 | site-build re-run → zero kept-from-dist; residuals re-proven, not assumed |
| `RUN-1` (runs) | M_SALVAGE | Close PENDING_BUILD recapture/build; F02 fail-closed singleton (own roots); preserve H-RUN-1 | `surfaces/runs/`, `adapters/runs/`, `adapters/w03-runs.ts`, `adapters/w03-v34/runs-fixture.ts` | — | hrun1-* evidence; causal PASS lineage; candidate/final captures | `npm test`; `runtime-causal-consequence`; `runs-preflight-run-recorded`; S12/CG4 | with shared-owner injection absent in harness, Product path fails closed (no silent `new OperationalSessionOwner()`); terminal/provider truth truthful |
| `REV-1` (reviews) | M_SALVAGE | Continue early-stage candidate; close responsive/RTL NOT_STARTED; shared Review-owner audit | `surfaces/reviews/`, `adapters/reviews/` | — | LINEAGE; baseline-rtl receipt; i18n app-boot export repair | `npm test`; `reviews.flow-and-verdict-recording`; S14/S06 | verdict receipt only on real state change; no fabricated review decisions |
| `MAS-1` (mastery) | M_SALVAGE | Continue from initialized state; close NOT_STARTED responsive/RTL | `surfaces/mastery/`, `adapters/mastery/` | — | baseline + populated captures + MEASURES; progression SM | `npm test`; `mastery.progression-state-machine`; S15/CG5 | local Learn completion must NOT infer Mastery (seed → Mastery unchanged); parallel-vs-LRN-1 override: file-disjoint (WAVE-2 donor-lesson) |
| `POR-1` (portfolio) | M_SALVAGE | Deep audit + close NOT_YET_TESTED (report-only evidence is weak — produce real captures) | `surfaces/portfolio/`, `adapters/portfolio/` | — | existing source build; W04 flow shots; PLAN_COMPLETE lineage | `npm test`; `portfolio.assembly-and-export`; S15/CG5 | export payload hash-matches canonical sources (no synthetic content); Q-5 → STOP |
| `BKP-1` (backup) | M_SALVAGE | Continue 13-defect continuation: close browser lifecycle + responsive/RTL pending | `surfaces/backup/`, `adapters/backup-runtime.ts` | — | postfix1-5 drill/empty evidence (~100); offline-pass status | `npm test`; `backup.restore-round-trip`; S18/PC1/CG6 | corrupted-seed restore → truthful failure; backup-verify≠live-restore ceiling held |
| `AUD-1` (audit) | M_SALVAGE | Close AUD-V1/V2/V3 visual defects (functional/structural already pass) | `surfaces/audit/`, `adapters/audit.ts` | — | reconstructed report HOLD verdict; capture-lineage; 2 capture rounds | `npm test`; `audit.trail-recording`; S18/S06 | audit-hash-is-encryption stays false; trail entries immutable after write (tamper probe) |
| `REL-1` (releases) | S_BOUNDED | Close 1 open defect + bottom-shelf issues (shared-owned item → request) | `surfaces/releases/`, `adapters/releases/` | — | functional 26/26; cycle-1 L1–L4; baseline+audit evidence | `npm test`; `releases.view`; S19/CG6 | empty-truth + compare-blocked truthful; release-readiness≠authorization held |
| `MAI-1` (manual-ai) | S_BOUNDED | Lineage reconstruction first (report → HANDOFF), then close confirmed gaps | `surfaces/manual_ai/`, `adapters/manual_ai/` | — | report+HANDOFF+26 pngs; ceilings (auto-publish=false) | `npm test`; `manual-ai.bridge-truthful-ceilings`; S17/CG6 | ceilings stay false; no capability shown the provider lacks; if lineage proves terminal-complete → STOP (audit-only) |
| `VAL-1` (validation) | M_SALVAGE | Audit-then-complete; SEAM STEWARDSHIP: sole writer for `w05-rescue.ts` if change needed (requests arrive from HLTH-1/PRC-1) | `surfaces/validation/`, `adapters/validation.ts`, `surfaces/composition/w05-rescue.ts` | **`w05-rescue.ts` (sole)** | existing validation semantics; W05 flow shots | `npm test`; `validation.flow`; S17/CG6 | any rescue-composition change must leave health/processing mounts behaviorally identical (probe both flows before/after) |
| `HLTH-1` (health) | S_BOUNDED | Audit-then-bounded-close on adapter; identity/composition question answered explicitly (escalate `OWN` if redesign needed) | `adapters/health-runtime.ts` | — | 24 flow shots; `.runtime-proof/root/health/*` | `npm test`; `health.refresh-inspect-diagnose`; S16/CG6 | no `w05-rescue.ts` write — probe refusal; refresh/inspect/diagnose receipts truthful |
| `PRC-1` (processing) | S_BOUNDED | Audit-then-bounded-close on adapter; identity question explicit; no invented references | `adapters/processing-runtime.ts` | — | 16 flow shots; `.runtime-proof/root/processing/state.json` | `npm test`; `processing.inspect-retry-requestCancel-validationHandoff`; S16/CG6 | cancel-request≠cancel-success held; validationHandoff truthful |

### SERIAL CHAIN (W01-SHELL owner) + dependency lanes (WAVE-2)

| Lane | Size | Prerequisite | Objective (bounded) | Writable roots | Salvage/exact scope | Positive tests | Lane-specific falsification |
|---|---|---|---|---|---|---|---|
| `SH-1` composition-root integration | M_SALVAGE | none (file-disjoint from WAVE-1 → may run with it; MUST precede ENT-1, SH-2) | ONE coherent wiring correction: close the Enterprise relation integration root (SpatialView instance split) + apply RQ `b2` mount + F01 fail-closed injection | `main.ts`, `surfaces/m0-controller-composition.ts`, `surfaces/enterprise/**` (wiring half), W01 shell roots as needed | exact root cause (CURRENT_STATE narrowing): `RelationInteractionOwner` bound to earlier SpatialView; `bindRqSurface` deferred-guarded; ReviewAuthorityRegistry fallback | `relation.route-convergence-and-label-scope`; `central-change-reuse`; `npm test`; S07/CG3 | selection drives central availability (probe `selectionCount>0` from visible endpoint); no third SpatialView instance (instance census); RQ uses purpose-built mount (probe) |
| `SH-2` chrome/geometry | M_SALVAGE | SH-1 (same owner) | AD-01 pane proportions (+full 23-route consumer regression), AD-02/D-08 chrome, G-20 `dist/index.html` bake-out, DEF-06 foundation chrome fix | W01 shell roots + `foundation/extensions.css`, `foundation/global/pane-layout.ts`, `dist/index.html` (via build) | direction:rtl→inherit lineage; VD-009; G-20 language policy FINAL | full `npm test` + build parity + 23/23 route smoke + chrome flows | geometry ≈16/65/17 at 1440; locale probe AR→EN → structure identical (no baked direction); EN chrome shows no hardcoded Arabic in owned files |
| `ENT-1` enterprise salvage | M_SALVAGE | SH-1 | Visual re-verification of after5 candidate (CP-003 3 mismatches) + D-ledger residuals at exact current source | `surfaces/enterprise/`, `adapters/enterprise/` | after5 12-PNG evidence; D-01..D-08 ledger; rescue lineage | `npm test`; `enterprise-twin-baseline`; S10/CG4/D09 | mismatches resolved by re-capture only; never claim acceptance from rescue evidence |
| `RES-1` results completion | M_SALVAGE | RUN-1 | Audit existing domain/AAR/compare value → complete missing ownership-loop presentation per packet | `surfaces/results/`, `adapters/results/` | timeline-replay/analytical mechanics; flow shots; S13 tests | `npm test`; `results-aar-compare`; `replay-causality-timeline-scrub`; S13/D09 | replay stays historical/inert; Results acquires no Review authority; TimelineReplayOwner count = 1 |

## 4. Explicit non-lanes

- **AUDIT-ONLY (5):** today, rq, scenarios, evidence, configuration — read-only re-verification; findings → new bounded packet later (no implicit mutation).
- **H03R2-1 (optional):** after LIB-1+LRN-1, structured-family serialized proof cycle — the ONLY path to close `H03-R2-PROP-001/FALSIFY-001`. Owner-visible; not in core set.
- **Owner-only:** shell redesign; RQ reference promotion; F-048; destination-count freeze.
- **Not authorized by this file:** Product acceptance, main merge, release, deployment, stack freeze, or any Writer launch before `RECOVERY_GATE_PASS` + explicit Owner mission extension.

## 5. STOP/ceiling recap for every lane

`RECOVERY_GATE_PASS` first · no self-acceptance · H03 PROP/FALSIFY stay `NOT_PROVEN` · Enterprise OPEN until SH-1+ENT-1 proven · `browser.lineage_receipt_truthful` red is expected until 6/6 · stack `STACK_EXPANSION_LOCKED__STACK_NOT_FROZEN` (no new product dependency) · Owner questions → STOP.
