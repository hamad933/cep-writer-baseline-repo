# CEP W01/W02 — NEW COLAB FINAL EVIDENCE TASK CONTRACT v1.0

PROJECT: Cybersecurity Education Platform — CEP
TASK: W01_W02_FINAL_COLAB_RUNTIME_DB_BROWSER_EVIDENCE_01
CLASSIFICATION: CONTROLLER-RESOLVED EXECUTION TASK / FINAL C025+C026 EVIDENCE / NO PRODUCT MUTATION

## 1. Exact input identity
- Candidate: `CEP_W01_W02_PRODUCTION_KNOWLEDGE_WORKBENCH_FORGE_v1.1.5.1_PRE_COLAB_MICRO_CORRECTED_CANDIDATE.zip`
- SHA-256: `e554e9badbd0a79ad4ae84c7d72a875cf9cb9ce0fc8ddf71c810a12c355089be`
- Source tree: `892b1944951386e41658abe0ace65e89159f58c6`
- Source manifest SHA-256: `72be846106cd64cbc496fc1ba20e59b1fb408bf9d4c153b4c53c1a7bfd9cc8d3`
- Source files in manifest: 592

Input authority rule: the exact candidate ZIP is the execution input. GitHub `main` or any branch MUST NOT substitute for it.

## 2. Drive task root
Drive folder ID: `1Tjmk2IiyrQaQ9DgeZZNUuH0I_cRN5d8k`

Mounted path:
`/content/drive/MyDrive/PORTFOLIO REVIEWS & CONTROL/05_EXECUTION_SYSTEM/CEP_WORK_TASKS/W01_W02_FINAL_COLAB_RUNTIME_DB_BROWSER_EVIDENCE_01`

Children:
- `00_CONTROL` — ID `107nTE5SqJUVQNq2QbO8aeLT8q9cy7hMq`
- `01_INPUT` — ID `1H7COFFWQBAuMwnIFO2z14mivZLOcLW_H`
- `02_RUNTIME_EVIDENCE` — ID `1Gr67JQM2yrjvOoX3XOToFCheQDXgO04D`
- `03_DB_EVIDENCE` — ID `1Q48OH9hiU4cYxU0ovuCDFj7ySj0VuNcU`
- `04_BROWSER_VISUAL_EVIDENCE` — ID `1eAHyu4di4GYOXNUKtHDWJJ0ddZdyfUIh`
- `05_LOGS` — ID `1R9wMBqy12MPrpioQMP1SADDlzuKf9Fb1`
- `06_MANIFESTS` — ID `11JTB057vhqzHtUeiBUR6GB7HI-lyBJ-H`
- `07_FINAL_RECEIPT` — ID `1hFbkwaLOyUpa-nwVsm5H3_KGUskMKFHB`

## 3. Runtime model
- Use the Owner's existing Colab notebook only.
- Standard hosted Colab runtime. Do not connect to a local runtime.
- `/content` is disposable working space.
- Drive task root is persistent execution/evidence custody only.
- No existing CEP Colab runtime tree, queue, checkpoint, or acquisition workspace is part of this task.
- No GitHub clone is required for execution. GitHub remains optional read-only repository truth only.
- No GitHub push/PR/merge/release/deploy.
- No governed production database mutation.

## 4. Candidate staging
If the exact ZIP is not yet in `01_INPUT`, CELL 00 asks the Owner to upload the exact candidate once through Colab's file picker. It MUST verify SHA-256 before copying bytes into `01_INPUT`. All later runs reuse the Drive copy only after re-verifying SHA.

## 5. Required exact toolchain
Source-declared:
- Node `24.18.0`
- npm `11.16.0`
- PHP `^8.5`
- Laravel `^13.21.1`
- PostgreSQL (`pgsql` test/runtime)

The task records exact observed versions. It does not silently fall back to an older PHP/Node version.

## 6. C025 evidence
Prove with disposable PostgreSQL databases only:
- Composer install from lock;
- npm ci from lock;
- migration lifecycle;
- seed/runtime boot;
- full relevant Laravel Unit/Feature tests;
- Integration + Architecture where compatible;
- V4 tests and legacy boundary;
- C024 251-item paging/search/lazy-detail tests;
- npm typecheck/test/build;
- raw return codes/logs;
- app health and authenticated runtime route proof.

## 7. C026 browser evidence
Against the exact disposable Laravel runtime:
- real `/login` authentication;
- exact W01/W02 routes: `/workbench/today`, `/workbench/library`, `/workbench/learn`, `/workbench/visualize`, `/workbench/rq`;
- page identity and no login/404/error proof before screenshots;
- 1440, ~1024, narrow fallback;
- English/Arabic and LTR/RTL/mixed Bidi;
- light/dark/system;
- keyboard/focus lifecycle;
- V4 Color/Highlight/Underline selection + save/reload/history proof using a disposable test document;
- C024 API/browser paging/search/lazy detail;
- real browser clipboard success/error truth where browser permissions allow;
- 200% actual Chrome zoom attempt in headed Xvfb; only PASS if measured viewport ratio proves it;
- browser accessibility tree evidence; screen-reader/AT is a separate evidence class and is not inferred from AX tree.

## 8. Screenshot admissibility
A screenshot is admissible only after exact candidate + route + authenticated intended state + no fatal/page error preconditions pass. Login/404/error captures are invalid evidence.

## 9. Secrets
No production secrets. Disposable DB and browser-owner credentials are generated inside `/content` and are not written to Drive logs/receipts. No GitHub token is required.

## 10. Final state
Colab can return evidence but cannot self-accept/freeze/merge/release/deploy. Controller reviews C025/C026 evidence afterward. External Authority/Provider/Platform gates remain explicit.
