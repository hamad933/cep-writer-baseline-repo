# OFFLOAD-01 — COMMIT & GOVERNANCE FORENSICS (d5d7588 → f5b78e3)

| Field | Value |
|---|---|
| `TASK_ID` | `CEP-REC-OFFLOAD-01` |
| `STATUS` | `READY_FOR_CHATGPT` |
| `PURPOSE` | Produce the commit-by-commit forensic map of the 33 post-pre-overreach commits and the structural outline of the two wholesale-imported governance documents, so the Primary Controller can classify every material delta (KEEP / ZERO_LOSS_MERGE / REJECT / DISTILL / EVIDENCE_ONLY / REVERIFY / OWNER_DECISION_REQUIRED) without repeating this archaeology. |
| `FORENSIC_TARGET_HEAD` | `f5b78e3c7df5993e8208c914f5b328967e958ec4` (immutable historical identity being analyzed) |
| `FORENSIC_TARGET_TREE` | `47e97e04434316ec98796bfcf41436ae1e96fc20` |
| `TASK_EXECUTION_SNAPSHOT_HEAD` | `cb76794d8cf34ba19877da470dbe568d423918d5` (snapshot this task is launched against; rebind on rebase) |
| `TASK_EXECUTION_SNAPSHOT_TREE` | `c6df80ee15ea252016a08fedf12efb37daa64cbc` |
| `WHY_CHATGPT_OFFLOAD` | Pure read-only git/governance archaeology over public GitHub history. No execution environment needed; Primary spot-check only. |

## EXACT_READ_SET

1. `https://github.com/hamad933/cep-writer-baseline-repo` — fetch/inspect remote `writer/mi-serial` first; record actual HEAD/tree yourself as the task execution snapshot. Do NOT require it to equal the FORENSIC_TARGET (later recovery bookkeeping commits are expected and irrelevant to this analysis); see INVALIDATION_CONDITIONS for the materiality rule.
2. Commit list: `d5d7588fbd6445a66cdb7d57e0cc48e619591361..f5b78e3c7df5993e8208c914f5b328967e958ec4` (33 commits, all 2026-10-02, author hamad933). Use the GitHub compare/diff UI or raw file URLs pinned to exact SHAs.
3. Per-commit diffs of the state-file families: `controller/CONTROLLER_GOVERNANCE.md`, `controller/state/CURRENT_STATE.md`, `controller/state/RESUME.md`, `controller/state/RESUME_STATE.md`, `controller/state/RESUME_STATE.json`, `controller/authority/OWNER_DECISION_LIVE_REGISTER.csv`, `controller/READ_FIRST.md`, `controller/authority/AUTHORITY_STATUS.json`, `controller/authority/EXECUTION_CARRIER_ROUTE_AUTHORITY.md`, `controller/10_dispatch/PARALLEL_EXECUTION_PLAN.md`, `controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json`, `controller/state/CHECKPOINTS.json`, `controller/11_gates/*`.
4. Structure (NOT full read): `controller/CONTROLLER_GOVERNANCE.md` at `f024a3730e1e87bf1aa0b7d903733d4035359070` (97,557 lines) vs at `f5b78e3` (96,027 lines); `controller/state/CURRENT_STATE.md` at `f024a37` (27,152 lines) vs at `f5b78e3` (315 lines).

## OPTIONAL_SUPPORTING_EVIDENCE

- The current-tree receipts: `controller/authority/PRE_CUTOVER_LIVE_STATE_DISTILLATION_RECEIPT.md`, `GITHUB_DIRECT_SUCCESSOR_RECOVERY_PROOF.md`, `DRIVE_ENTRY_SUCCESSOR_RECOVERY_PROOF.md`, `PROJECTION_RECONCILIATION_RECEIPT.md`, `AUTHORITY_CUTOVER_EVENT.json`.
- If needed for provenance only: Google Drive folder `1GvLy2ZnT_6nFbeKfdGdKoKkPtYvBO3j-` (H08 custody area) — READ ONLY, classify anything found as historical evidence.

## QUESTIONS_TO_RESOLVE

1. For each of the 33 commits: hash, subject, files touched with +/- counts, and a 1–3 sentence semantic summary of what changed in the state-file families (not just line counts).
2. `f024a37`: Is the injected `CONTROLLER_GOVERNANCE.md` (97,557 lines) and `CURRENT_STATE.md` (27,152 lines) a WHOLESALE copy of Google Drive governance documents? Evidence markers: embedded Drive paths (`/Google Drive/cep_building_mgm`), document titles, epoch stamps, duplicated registers, chat-log-like content. Give the complete `#`/`##` section-header outline with line ranges for BOTH documents at `f024a37`, and classify each major section as: `WHOLESALE_DRIVE_IMPORT` / `DISTILLED` / `DUPLICATE_OF_REGISTER` / `UNIQUE_DURABLE_CLAIM` (name the unique claim categories).
3. Track `CONTROLLER_GOVERNANCE.md` across the whole range: which commits changed it and exactly WHAT was removed/added at each change (it went 97,557 → 96,027 lines). Enumerate the removed ~1,500 lines by category.
4. Track `CURRENT_STATE.md`: which commits reduced 27,152 → 315 lines; give the section-header outline of the 27k version; flag content categories in the 27k version that are NOT present anywhere in the current `f5b78e3` tree (per-surface status, writer history, seams, validation truth, blockers, continuation pointers) — this is a zero-loss pre-check, not the final claim map.
5. Provenance of `OD-20261002-087`: the earliest commit introducing it into `OWNER_DECISION_LIVE_REGISTER.csv` and the note appended to `OD-20260928-085`; quote the exact diffs. Then search ALL history (every ref) for any artifact recording a first-party Owner statement behind `CURRENT_DIRECT_OWNER_2026_10_02_MULTI_WRITER_PARALLEL_CORRECTION`. Report every hit, distinguishing self-referential register/state claims from independent evidence.
6. EXHAUSTIVE topology-contradiction sweep: every file at `f5b78e3` (and at `d5d7588`) that states Writer serial-vs-parallel topology or cites OD-20260928-085 / OD-20261002-087 / "one persistent sequential" / "W01→W05", with exact wording. Known so far (verify and COMPLETE this list): `controller/state/RESUME.md`, `RESUME_STATE.md`, `RESUME_STATE.json`, `CONTROLLER_SUCCESSION_HANDOFF.md`, `authority/WRITER_OWNER_DECISION_APPLICABILITY.md`, `11_gates/PRE_WRITER_DISPATCH_GATE.md`, `11_gates/bootstrap_gate.md`, `10_dispatch/PARALLEL_EXECUTION_PLAN.md` ceilings. Flag any I have not listed.

## REQUIRED_OUTPUT

One coherent markdown report with exact identities (file @ SHA, line numbers, quoted text), structured as: §1 commit map; §2 f024a37 import structure; §3 governance-file evolution; §4 CURRENT_STATE evolution + missing-content flags; §5 OD-087 provenance hunt; §6 complete topology-contradiction register. Strong analytical conclusions are expected (e.g. `OBSERVED_UNIQUE_DURABLE_CLAIM`, `POSSIBLE_WHOLESALE_IMPORT`, `UNRESOLVED_FROM_AVAILABLE_EVIDENCE`).

## NON_AUTHORITY_BOUNDARY

READ_ONLY. Do not mutate Product/GitHub/Drive. Do not make final dispositions (KEEP/REJECT etc. are Primary's call); classify and recommend only. Do not treat any `PASS` label or file presence as truth.

## INVALIDATION_CONDITIONS

Durable rule: **later remote movement invalidates this task only when the delta materially changes this task's evidence/read set or authority assumptions.** Unrelated control/queue/recovery bookkeeping commits after `cb76794` do NOT force a restart — record the observed snapshot and proceed. If a material change is found (e.g. a forensic-range file or its interpretation was modified), STOP on that sub-scope and report the delta for rebasing. If a claim depends on a file revision not reachable in git history, mark `UNRESOLVED_FROM_AVAILABLE_EVIDENCE`.

Forensic comparison targets to preserve exactly: `d5d7588fbd6445a66cdb7d57e0cc48e619591361`, `f024a3730e1e87bf1aa0b7d903733d4035359070`, `58b8058932a8a34dfb424025466b1359db2cf3fd`, `f5b78e3c7df5993e8208c914f5b328967e958ec4`.

## RETURN/CONSUMPTION_INSTRUCTIONS

Return the full report in the ChatGPT conversation. Primary will persist it to evidence custody, spot-check material claims (hashes/line numbers), and reopen only contradicted parts.
