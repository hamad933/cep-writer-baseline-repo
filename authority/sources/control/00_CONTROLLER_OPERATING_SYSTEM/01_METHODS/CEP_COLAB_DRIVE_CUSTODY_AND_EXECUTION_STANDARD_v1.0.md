# CEP COLAB + GOOGLE DRIVE EXECUTION/CUSTODY STANDARD v1.0

CLASSIFICATION: CONTROLLER REUSABLE METHOD / ZERO-LOSS OPERATING KNOWLEDGE / NOT PRODUCT TRUTH / NOT ACCEPTANCE
DATE: 2026-09-09
SOURCE EVENT: W01/W02 C025 final runtime/DB/test execution in Owner's existing Google Colab notebook.

## 1. Purpose
This standard captures the reusable execution law learned from the W01/W02 C025 campaign so future CEP workspaces can use Colab without repeating bootstrap, Drive-custody, environment, test-order, or evidence-class mistakes.

## 2. Authority model
1. Governed source/decision truth remains in CEP governed storage and Controller state.
2. Google Drive is durable execution/evidence custody.
3. Google Colab `/content` is disposable execution space only.
4. GitHub is code/branch/SHA truth only when explicitly admitted; it is not an implicit Colab execution input.
5. A Drive **file ID** is the authoritative identity of an already-existing Drive execution object.
6. A Drive/FUSE path is a convenience locator only; path visibility is not custody proof.

## 3. Exact-input law for existing Drive artifacts
Preferred sequence:

`KNOWN DRIVE FILE ID -> API get_media(fileId) or FUSE fast path -> local /content -> SHA-256 -> ZIP CRC -> embedded/source manifest -> source-tree identity -> execute`

Rules:
- If a FUSE path exists, it may be copied to `/content` as a fast path.
- The local copy MUST be hashed before use.
- If FUSE is missing or SHA mismatches, download the exact known Drive File ID through authenticated Drive API.
- Filename alone is never identity.
- Never use a file picker when an exact Drive File ID is already known.

## 4. New-artifact Drive custody law
A new artifact is NOT `DRIVE_STAGED` because it can be read from `/content/drive/MyDrive/...`.

Required sequence:

`local exact bytes -> Drive create/upload -> obtain Drive File ID -> API download THAT ID -> verify size + SHA -> verify intended parent -> record File ID + SHA + source tree/manifest`

Only after all stages pass may the state become `DRIVE_EXACT_BYTES_VERIFIED`.

### Critical distinction
`FUSE_READBACK_SHA_PASS != DRIVE_OBJECT_CUSTODY_PROVEN`.

W01/W02 demonstrated a case where:
- mounted path read-back returned the exact `v1.1.5.2` bytes;
- Drive API folder listing still showed only `v1.1.5.1`;
- therefore no File ID existed/was exposed for the new candidate;
- browser execution remained blocked.

## 5. Drive error classification
### Harmless warning
`WARNING:google_auth_httplib2: httplib2 transport does not support per-request timeout...`
- Does not invalidate an otherwise successful authentication/download.

### Material failure
`403 userRateLimitExceeded`
- The Drive create/upload write did not complete.
- Do not claim staging.
- Do not replace the write failure with a FUSE read-back claim.
- Do not repeatedly hammer Drive create calls.
- On retry: first query for an already-created exact-name object, verify by re-download; only create when absent.

## 6. Existing-notebook law
- Reuse the Owner's existing notebook unless the Owner requests a new notebook.
- Do not use unrelated CEP acquisition/runtime queues or notebooks as execution state for a separate task.
- One task receives its own Drive root, control, input, logs, evidence, manifests, and receipt folders.

## 7. Cell execution law
- No `Run all` for governed final evidence.
- Run one cell/phase at a time.
- Inspect the receipt/log after every phase.
- Preserve already-proven phases when a later phase fails.
- Never restart Bootstrap/CELL00/CELL01 just because CELL02 or a later phase fails.
- Rerun only the smallest affected gate after a bounded correction.

## 8. Toolchain law
- Pin/verify exact required runtime versions before DB/tests/browser.
- Persist a toolchain receipt.
- W01/W02 proven toolchain: PHP 8.5.10, Node 24.18.0, npm 11.16.0, Composer 2.10.3, PostgreSQL 14.24.
- Toolchain provisioning PASS is not DB/test/runtime/browser evidence.

## 9. Disposable database law
- Use task-scoped role/database names only.
- Never point destructive setup at governed or Production database names.
- W01/W02 used task-scoped `cep_w01w02_colab`, `cep_w01w02_runtime`, and `cep_w01w02_test`.
- Positive authenticated connection probes are required after DB creation.

## 10. PostgreSQL lifecycle rule learned from CELL02
Do NOT send `DROP DATABASE` / `CREATE DATABASE` together in one multi-statement `psql -c` request.

Reason: database lifecycle commands reject transaction-block execution in this context.

Correct pattern:
1. terminate task DB sessions;
2. DROP runtime DB in a separate request;
3. DROP test DB in a separate request;
4. DROP role separately;
5. CREATE role separately;
6. CREATE runtime DB separately;
7. CREATE test DB separately;
8. authenticated connection probe to each DB.

## 11. Evidence classes must remain separate
Never collapse:
- SOURCE_IDENTIFIED
- STATIC_PROVEN
- SEMANTIC_PROVEN
- TYPE_PROVEN
- TEST_PROVEN
- DB_PROVEN
- RUNTIME_PROVEN
- BROWSER_PROVEN
- VISUAL_PROVEN
- REFERENCE_PARITY_PROVEN
- OWNER_ACCEPTED

A later PASS does not retroactively prove a different class.

## 12. Browser capture preconditions
Before screenshot/browser evidence:
- exact candidate identity is frozen for execution;
- exact route known;
- authentication succeeds;
- no login bounce/404/fatal page;
- page ready state is confirmed;
- required interaction actually executed;
- capture is candidate-bound.
Otherwise classify capture as `INVALID_CAPTURE / PRECONDITION_FAILED`.

## 13. Accessibility and zoom evidence
- AX tree is not screen-reader AT proof.
- `200% zoom` is PASS only when headed Chromium/browser UI zoom is actually measured near 2x.
- Clipboard permission/denial evidence is its own browser evidence class.

## 14. GitHub boundary
- Colab authorization does not authorize GitHub push.
- Do not clone/pull/push unless GitHub is explicitly admitted as an execution input/action.
- No merge/release/deploy is implied by runtime evidence.

## 15. Resume rule
After a failure, report:
- last proven phase;
- failing command/log;
- defect class: orchestration / environment / product source / stale test / repository-envelope dependency / external provider;
- exact next smallest action.
Never reset a strong lineage merely because a later gate failed.
