# CEP W01/W02 — COLAB FINAL RUNTIME / DB / BROWSER EVIDENCE PACKET v1.0

PROJECT: Cybersecurity Education Platform — CEP
AUTHORITY: OWNER / CENTRAL CONTROLLER
MODE: EXISTING COLAB NOTEBOOK ONLY / FINAL EVIDENCE WAVE / NO PRODUCT MUTATION

## Exact candidate
`CEP_W01_W02_PRODUCTION_KNOWLEDGE_WORKBENCH_FORGE_v1.1.5.1_PRE_COLAB_MICRO_CORRECTED_CANDIDATE.zip`
SHA-256: `e554e9badbd0a79ad4ae84c7d72a875cf9cb9ce0fc8ddf71c810a12c355089be`
Source tree: `892b1944951386e41658abe0ace65e89159f58c6`
Source manifest SHA-256: `72be846106cd64cbc496fc1ba20e59b1fb408bf9d4c153b4c53c1a7bfd9cc8d3`

## Entry gate
`PRE_COLAB_SOURCE_CONTRACT_EXHAUSTED_CONFIRMED`

## Mission
Produce the strongest truthful final evidence for C025/C026 without altering product source.

### C025 — real application/database
- provision project-declared Node 24.18.0 / npm 11.16.0;
- install PHP/Composer compatible with project lock;
- provision PostgreSQL;
- verify candidate hash and source tree before execution;
- `composer install` and `npm ci`;
- migrate a disposable test DB only;
- run project Laravel unit/feature tests including V4 legacy-boundary tests and C024 endpoints;
- exercise migration lifecycle, query/page correctness, cursor invalidation, concurrency where applicable, and bounded query behavior with 251+ fixtures;
- never mutate governed production DB.

### Build/type/test
- `npm run typecheck`;
- `npm run test`;
- `npm run build`;
- PHP/Laravel test suite;
- preserve raw logs and exact return codes.

### C026 — browser/reference/interaction
Use a real Chromium/Playwright browser against the disposable runtime. Prove at minimum:
- exact authenticated intended routes for W01/W02 surfaces;
- 1440+, ~1024, narrow fallback, and actual browser 200% zoom;
- English/Arabic, LTR/RTL/mixed Bidi;
- keyboard-only critical paths, focus lifecycle/return, hidden-focus prevention;
- real browser clipboard plain/formatted + denied/error truth;
- V4 Color/Highlight/Underline selection behavior + persistence/reload/history;
- BlockContextMenu contains no stale V4 denial and does not fake block-range formatting;
- Linked Notes same-origin popout identity if browser allows;
- C024 server-driven paging/search/load-more/lazy detail/stale-response behavior;
- light/dark/system and relevant accepted-Library visual/reference deltas;
- screenshots bound to exact candidate identity.

## Evidence classes
Keep STATIC / SEMANTIC / TEST / DB / RUNTIME / BROWSER / VISUAL / RESPONSIVE / A11Y / BIDI separate. Never infer one from another.

## External gates
Do not fabricate durable Notes, OS topmost, Today provider, durable R&Q persistence, Visualize canonical mutation, or Learn providers.

## Stop condition
Return full raw evidence + gate verdicts to Controller. No merge/release/deploy and no Owner acceptance from Colab itself.
