# OFFLOAD-05 — INDEPENDENT RESIDUAL CROSSWALK ACROSS THE 19 LANE CANDIDATES

| Field | Value |
|---|---|
| `TASK_ID` | `CEP-REC-OFFLOAD-05` |
| `STATUS` | `READY_FOR_CHATGPT` |
| `PURPOSE` | Independent READ_ONLY completeness check of the final residual inventory: scan every lane candidate's HANDOFF/findings/hotspot artifacts on GitHub and return a deduplicated residual list that either matches, extends, or contradicts the Primary Controller's register. Purpose = find what the Primary's in-session register may have UNDER-weighted (the register was assembled from session context, not a fresh branch-wide file sweep). |
| `FORENSIC_TARGET_HEAD` | `58932fc` (canonical-reconciliation commit) — product content = integrated candidate `0102a35d4850ab1a3b14436bcc6abe0868ee6a7f` / tree `396010acdf3e0f049fee4962bd18245d20a94fa4` |
| `TASK_EXECUTION_SNAPSHOT_HEAD` | fetch `origin/writer/mi-serial` yourself and record it (expected `58932fc…` or later bookkeeping; materiality rule applies — controller-bookkeeping commits do not invalidate) |
| `WHY_CHATGPT_OFFLOAD` | Read-only branch/file sweep + dedup over 19 pushed candidates; zero MiMo quota; independent eyes on completeness. |

## EXACT_READ_SET

Fetch remote first. Then ONLY:

1. The 19 candidate branches (all on `hamad933/cep-writer-baseline-repo`): `writer/mi-serial-lane/{LIB-1,LRN-1,VIS-1,LAB-1,RUN-1,REV-1,MAS-1,POR-1,BKP-1,AUD-1,REL-1,MAI-1,VAL-1,HLTH-1,PRC-1,RES-1,SH-1,SH-2,ENT-1}`.
2. On each branch: `writer-output/**/HANDOFF.md`, any `SERIALIZED_HOTSPOT_REQUEST.md`, `VISUAL_EXECUTION_REPORT*.json` "unresolved/findings" sections only (not full reports).
3. Canonical register of record: `controller/12_execution/EXECUTION_LIFECYCLE_STATE.md` and `controller/12_execution/RECOVERY_ADJUDICATION_LEDGER_2026-10-02.md` @ current `writer/mi-serial`.
4. Exact-current source where a finding cites it: `stack/native-typescript/**` (cite file:line).

## OPTIONAL_SUPPORTING_EVIDENCE

`controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` (sealed scope per lane), `controller/12_execution/EXISTING_EVIDENCE_REUSE_MATRIX_23_SURFACES.md`.

## QUESTIONS_TO_RESOLVE

1. Extract EVERY distinct residual/finding/open-item from the 19 branches' HANDOFF + hotspot artifacts (one row each: ID as written, originating lane, quote, file:line on its branch).
2. Deduplicate across lanes (e.g., the same shared-root finding cited by 3 lanes = one residual with all citing lanes listed).
3. Crosswalk against `EXECUTION_LIFECYCLE_STATE.md` + ledger §15: for each deduplicated residual return one of: `MATCHES_REGISTER` / `MISSING_FROM_REGISTER` (exact quote+location) / `STALE_CLOSED_BY_INTEGRATED_EVIDENCE` (state the closing proof — receipt 6/6, battery, smoke — with identity).
4. Classify each residual into exactly one of: `ALREADY_CLOSED`, `TECHNICAL_FIX_REQUIRED`, `SHARED_OWNER_FIX_REQUIRED`, `EVIDENCE_ONLY_GAP`, `HARNESS_ORACLE_GAP`, `ENVIRONMENT_ONLY_GAP`, `OWNER_DECISION_ALREADY_RESOLVABLE_FROM_EXISTING_AUTHORITY`, `GENUINE_NEW_OWNER_CHOICE_REQUIRED`, `NON_BLOCKING_OBSERVATION`, `SUPERSEDED/HISTORICAL` — recommendation only (Primary adjudicates).
5. Owner-item sweep: does ANY lane HANDOFF raise an Owner-facing/Owner-gated item NOT in this known set {shell redesign OWNER-20260910-010, RQ reference promotion, F-048, C03-GATE-023, Health BOTTOM composition, Q-4 TimelineReplayOwner retain-vs-retire}? List exactly or state NONE.
6. Evidence-integrity sweep: any HANDOFF claiming a pass/result that its own attached evidence does NOT support (cite the contradiction); any receipt-lineage `DRIFT_RECORDED` not already in the register.

## REQUIRED_OUTPUT

One coherent markdown report: §1 deduplicated residual table (residual | lanes citing | quote+location | classification rec | register crosswalk status); §2 MISSING-FROM-REGISTER list (or NONE with proof of sweep coverage: 19/19 branches, N files scanned); §3 stale/closed items with closing proof; §4 Owner-item sweep result; §5 evidence-integrity contradictions (or NONE); §6 unresolved.

## NON_AUTHORITY_BOUNDARY

READ_ONLY; no mutation of any branch/Drive; recommendations only — Primary adjudicates; no acceptance/merge/release claims; classification ≠ disposition.

## INVALIDATION_CONDITIONS

Materiality rule: controller-only commits after snapshot do not invalidate. If a Product delta lands on a lane branch after your scan (unexpected), stop on that branch and report.

## RETURN/CONSUMPTION_INSTRUCTIONS

Return the full report in the ChatGPT conversation. Primary persists, spot-checks quotes/locations against the branches, gap-fills only contradicted/missing parts, then adjudicates the final residual register.
