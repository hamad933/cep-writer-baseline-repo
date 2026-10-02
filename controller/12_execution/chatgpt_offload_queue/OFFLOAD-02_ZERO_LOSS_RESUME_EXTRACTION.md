# OFFLOAD-02 — ZERO-LOSS RESUME / CHECKPOINT EXTRACTION

| Field | Value |
|---|---|
| `TASK_ID` | `CEP-REC-OFFLOAD-02` |
| `STATUS` | `READY_FOR_CHATGPT` |
| `PURPOSE` | Extract EVERY unique durable claim from the pre-overreach resume/checkpoint/dispatch artifacts and map each claim to its current owner in the tree at `f5b78e3` (or mark `NO_CURRENT_OWNER_FOUND`), producing the key-by-key zero-loss map of the `58b8058` RESUME_STATE.json compaction. This is the evidentiary backbone of the recovery's zero-loss proof (gate 3). |
| `FORENSIC_TARGET_HEAD` | `f5b78e3c7df5993e8208c914f5b328967e958ec4` (immutable historical identity whose tree is the current-owner search target) |
| `FORENSIC_TARGET_TREE` | `47e97e04434316ec98796bfcf41436ae1e96fc20` |
| `TASK_EXECUTION_SNAPSHOT_HEAD` | `cb76794d8cf34ba19877da470dbe568d423918d5` (snapshot this task is launched against; rebind on rebase) |
| `TASK_EXECUTION_SNAPSHOT_TREE` | `c6df80ee15ea252016a08fedf12efb37daa64cbc` |
| `WHY_CHATGPT_OFFLOAD` | Read-only git-history extraction and cross-tree claim mapping; pure archaeology. Primary spot-check only. |

## EXACT_READ_SET

Historical versions (use GitHub raw URLs pinned to the SHA, e.g. `https://raw.githubusercontent.com/hamad933/cep-writer-baseline-repo/d5d7588fbd6445a66cdb7d57e0cc48e619591361/controller/state/RESUME_STATE.json`):

1. `d5d7588fbd6445a66cdb7d57e0cc48e619591361`:
   - `controller/state/RESUME.md` (105 lines)
   - `controller/state/RESUME_STATE.md` (116 lines)
   - `controller/state/RESUME_STATE.json` (30,948 B — parse fully)
   - `controller/state/CHECKPOINTS.json`
   - `controller/10_dispatch/PARALLEL_EXECUTION_PLAN.md`
   - `controller/10_dispatch/SURFACE_DISPATCH_MATRIX.json`
2. `f024a3730e1e87bf1aa0b7d903733d4035359070`:
   - `controller/state/RESUME_STATE.json` (31,271 B — the richest version; diff vs the d5d7588 version, list everything ADDED)
   - `controller/state/RESUME.md`, `RESUME_STATE.md` as modified there
3. Commit `58b8058932a8a34dfb424025466b1359db2cf3fd`: the diff that compacted `RESUME_STATE.json` 31,271 → 1,965 B (640 lines changed / −799 net). Reconstruct the FULL pre-compaction JSON content and enumerate every removed key/entry.
4. Checkpoint/rescue metadata at `d5d7588` AND current: `controller/state/MIMO_CLAW_HANDOFF_CP-2026-09-30-004.{md,json}`, `MIMO_CLAW_CHECKPOINT_CP-2026-10-01-005.md`, `MIMO_CLAW_WRITER_PRIORITY_MATRIX_2026-10-01-005.{md,json}`, `RESCUE_REMAINING_WRITERS_2026-09-30.{md,json}`, `RESCUE_W03_ENTERPRISE_2026-09-30.{md,json}`, `CHECKPOINT_PROTOCOL.md`.
5. Current owner-side counterparts to test against (the search targets): `controller/state/RESUME*.md|json` @ `f5b78e3`, `controller/state/CHECKPOINTS.json`, `controller/12_execution/WRITER_RESULT_RECONSTRUCTION_BASELINE.md`, `controller/10_dispatch/*`, `controller/13_visual_control/CONTROLLER_REGISTERS.md`, `controller/13_visual_control/PREPARATION_GAP_REGISTER.md`, `controller/09_writer_forge/surface_units/*.md`, `controller/09_writer_forge/SURFACE_PACKET_REVALIDATION_MATRIX.json`, `writer-output/**` (manifests/handoffs only), `cep-writer/KNOWN_OPEN_GATES.md`.

## OPTIONAL_SUPPORTING_EVIDENCE

Pre-overreach `RESUME.md` explicitly points to `controller/13_visual_control/*`, `controller/state/bootstrap.sh`, `writer-output/<UNIT>/` — verify each pointer still resolves.

## QUESTIONS_TO_RESOLVE

1. Per artifact (1–4): enumerate EVERY unique durable claim in the required claim categories: per-Surface status/history (all 23); Writer result lineage; active/rescued/interrupted work; shared-component changes; pending integration seams (AD-01, AD-02, D-08, b2, w05-rescue split…); validation truth (exact run/hash/counts); blockers (G-24, G-35, G-36, VD-005, VD-008, VD-011, Q-1…); dependency/collision knowledge; exact continuation pointers; Owner-decision "do not re-ask" language; next-action lists.
2. For EACH claim: exact source (file@SHA + line/key) → claim value → equivalent claim found in current `f5b78e3` tree? (exact current location) or `NO_CURRENT_OWNER_FOUND`.
3. Key-by-key table of what `58b8058` removed from `RESUME_STATE.json`: key → content summary → current owner or `NO_CURRENT_OWNER_FOUND`.
4. Diff `d5d7588` vs `f024a37` RESUME files: what did the import commit add/change, and is any of that later lost by `58b8058`?
5. Explicit LOST-CANDIDATE table (claims with `NO_CURRENT_OWNER_FOUND`), each with a one-line note where a successor would naturally look for it.

## REQUIRED_OUTPUT

One coherent markdown report: §1 per-artifact claim tables (source → claim → current location/LOST); §2 58b8058 key-map; §3 f024a37 delta; §4 LOST-CANDIDATE table; §5 unresolved items (`UNRESOLVED_FROM_AVAILABLE_EVIDENCE`). Completeness of claim enumeration matters more than prose.

## NON_AUTHORITY_BOUNDARY

READ_ONLY; no mutation; no final dispositions (whether a LOST claim needs restoring is Primary's call); no acceptance claims.

## INVALIDATION_CONDITIONS

Durable rule: **later remote movement invalidates this task only when the delta materially changes this task's evidence/read set or authority assumptions.** Unrelated control/queue/recovery bookkeeping commits after `cb76794` do NOT force a restart — record the observed snapshot and proceed (search current-owner locations against `f5b78e3` as the forensic target, noting any post-`f5b78e3` owner additions you observe). If a material change is found, STOP on that sub-scope and report the delta. If a historical path is unreachable, mark it, do not guess.

Forensic comparison targets to preserve exactly: `d5d7588fbd6445a66cdb7d57e0cc48e619591361`, `f024a3730e1e87bf1aa0b7d903733d4035359070`, `58b8058932a8a34dfb424025466b1359db2cf3fd`, `f5b78e3c7df5993e8208c914f5b328967e958ec4`.

## RETURN/CONSUMPTION_INSTRUCTIONS

Return the full report in the ChatGPT conversation. Primary will persist it, spot-check a sample of claim→location mappings against `git show`, and use it for the zero-loss proof and ledger.
