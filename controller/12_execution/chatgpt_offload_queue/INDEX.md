# CHATGPT OFFLOAD QUEUE (non-authority dispatch inputs)

**Class:** `DISPATCH_INPUTS_ONLY__NOT_AUTHORITY__NOT_CURRENT_STATE__NOT_SECOND_CONTROL_PLANE`
**Created:** 2026-10-02 · **Basis:** `writer/mi-serial@f5b78e3c7df5993e8208c914f5b328967e958ec4` / tree `47e97e04434316ec98796bfcf41436ae1e96fc20`
**Operating model:** `CHATGPT BROAD READ-ONLY ANALYTICAL OFFLOAD → PRIMARY CONTROLLER SPOT-CHECK + FINAL ADJUDICATION → MIMO WRITERS EXECUTE → CHATGPT INDEPENDENT REVIEW → PRIMARY INTEGRATE`

## Status index

| TASK_ID | File | STATUS |
|---|---|---|
| CEP-REC-OFFLOAD-01 | `OFFLOAD-01_COMMIT_GOVERNANCE_FORENSICS.md` | `READY_FOR_CHATGPT` |
| CEP-REC-OFFLOAD-02 | `OFFLOAD-02_ZERO_LOSS_RESUME_EXTRACTION.md` | `READY_FOR_CHATGPT` |
| CEP-REC-OFFLOAD-03 | `OFFLOAD-03_H_CORPUS_CROSSWALK.md` | `READY_FOR_CHATGPT` |

Status lifecycle: `READY_FOR_CHATGPT` → `RESULT_RETURNED` → `PRIMARY_SPOT_CHECKED` → `CONSUMED` → `CLOSED/ARCHIVED`.

## Rules

- Each packet is a bounded READ_ONLY task for a ChatGPT Project conversation pointed at `hamad933/cep-writer-baseline-repo` (+ exact Drive evidence IDs when the packet names them).
- Returned analysis is EVIDENCE/INPUT only. The Primary Controller spot-checks source binding and material claims, then performs final adjudication; contradictions reopen only the affected part (`CONSUME → CHECK SOURCE BINDING → SPOT-CHECK → CHECK INVALIDATION → GAP-FILL → ADJUDICATE`).
- These files must never become CURRENT_STATE, Owner decisions, acceptance records, or a second governance system. Only the Primary Controller mutates canonical control files.
- Invalidation: any packet's BASIS_HEAD/BASIS_TREE no longer matching the fetched remote requires re-basing the packet before use.
