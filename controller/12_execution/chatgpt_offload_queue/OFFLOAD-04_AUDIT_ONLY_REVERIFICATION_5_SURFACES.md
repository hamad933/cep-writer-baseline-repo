# OFFLOAD-04 — AUDIT-ONLY RE-VERIFICATION OF THE 5 NOWR SURFACES

| Field | Value |
|---|---|
| `TASK_ID` | `CEP-REC-OFFLOAD-04` |
| `STATUS` | `READY_FOR_CHATGPT` |
| `PURPOSE` | Independent READ_ONLY re-verification of the 5 surfaces adjudicated `NO_MUTATING_WRITER_NEEDED` (today, rq, scenarios, evidence, configuration): confirm from exact current source + existing evidence that no open mutating-work finding remains, or produce the exact bounded finding list that would justify a later packet. This closes the audit-only half of the sealed 23-Surface matrix. |
| `FORENSIC_TARGET_HEAD` | `48530188a833c06b52be609aa952af9a75af7c21` (battery-tested tree `69714217bed67ec974b11fa5102ad3b68a5383e7` — matrix sealed at this identity) |
| `TASK_EXECUTION_SNAPSHOT_HEAD` | fetch `origin/writer/mi-serial` yourself and record it (expected `4c6fffe3b6f3cc766e537655a362a3e423585e07` or later bookkeeping; rebind on rebase) |
| `WHY_CHATGPT_OFFLOAD` | Read-only evidence/source review of 5 surfaces; independent-review value with zero MiMo quota cost; Primary spot-checks only. |

## EXACT_READ_SET

Fetch remote first. Then ONLY:
1. `controller/12_execution/EXISTING_EVIDENCE_REUSE_MATRIX_23_SURFACES.md` — rows 2 (today), 3 (rq), 4 (scenarios), 5 (evidence), 6 (configuration) [SEALED dispositions].
2. `controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0 + §4 (AUDIT-ONLY list).
3. Per surface: `stack/native-typescript/surfaces/<surface>/` + its adapters; `tests/surfaces/<surface>/` or `stack/native-typescript/tests/surfaces/<surface>*`; the applicable `tools/w0X-browser-flows.mjs` flow definitions.
4. Per surface evidence: `writer-output/W01-TODAY/`, `writer-output/W02-RESEARCH-QUALITY/`, `writer-output/W03-SCENARIOS/`, `writer-output/W04-EVIDENCE/`, `writer-output/W05-CONFIGURATION/` (reports, HANDOFFs, receipts only — not every PNG).
5. Supporting: `controller/state/CONTROLLER_REVIEW_CP-2026-09-30-003.json`, `controller/12_execution/WRITER_RESULT_RECONSTRUCTION_BASELINE.md` (own rows), `profiles/{today,rq,scenarios,evidence,configuration}.json`.
6. Optional evidence: Drive H-corpus lanes if a provenance question arises (record Drive IDs read; classify historical).

## OPTIONAL_SUPPORTING_EVIDENCE

`controller/13_visual_control/CONTROLLER_REGISTERS.md` (VD rows), `cep-writer/KNOWN_OPEN_GATES.md`, git log for the surface paths (bookkeeping-aware invalidation rule applies: later controller-only commits do not invalidate).

## QUESTIONS_TO_RESOLVE (per surface, then cross-surface)

1. Does any open finding/defect remain that requires MUTATING Product work inside the surface's own writable roots? (vs. already-closed, evidence-pending, shared-seam-routed, or Owner-facing.)
2. Is the existing terminal result's evidence sufficient for `COMPLETE_RESULT_REAUDIT_REQUIRED` closure — i.e., which exact re-verification steps (read-only) still lack a trustworthy binding, and are they already covered by existing receipts?
3. Cross-surface: any shared-owner/seam issue whose canonical owner lane is NOT in the sealed DAG (SH-1/SH-2/ENT-1/RES-1 or WAVE-1)? Name it exactly.
4. For configuration: confirm O-01 (donor chrome language) and O-02 (pane proportions) are correctly routed OUT of configuration (to shared/shell lanes) and not silently reopened.
5. For rq: confirm the `b2` m0 mount is inside SH-1's scope and the reference-promotion question remains Owner-isolated (`REVIEWED_FINAL_CANDIDATE`, no promotion).
6. Return `OBSERVED_EXISTING_EVIDENCE` / `OBSERVED_OPEN_FINDING` (with exact file:line) / `POSSIBLE_INVALIDATION_TRIGGER` / `UNRESOLVED_FROM_AVAILABLE_EVIDENCE` per surface.

## REQUIRED_OUTPUT

One coherent markdown report: §1 per-surface verdict table (re-verified-clean vs exact bounded finding list with file:line); §2 evidence-sufficiency gaps (read-only steps only); §3 cross-surface/shared-owner findings; §4 recommended disposition confirmation or the minimal finding-driven packet scope suggestion (recommendation only — Primary decides); §5 unresolved.

## NON_AUTHORITY_BOUNDARY

READ_ONLY. No Product/GitHub/Drive mutation. No final disposition/writer/DAG decisions — recommendations only. No acceptance claims. Green tests never prove all four truths (Content/Presentation/Behavior/Domain-Data-Provider) — state each separately where relevant.

## INVALIDATION_CONDITIONS

Materiality rule: later remote movement invalidates only if the delta materially changes these five surfaces' evidence/read set/authority (Product writes to their roots by a lane, or authority change). The parallel WAVE-1 writers do NOT touch these five surfaces' roots — but `tools/`, `assurance/`, `dist/`, or shared seams changing IS material for browser/evidence claims → rebind and note.

## RETURN/CONSUMPTION_INSTRUCTIONS

Return the full report in the ChatGPT conversation. Primary will persist it, spot-check material claims (file:line + receipts), gap-fill only contradicted parts, then confirm/adjust dispositions (Primary's authority).
