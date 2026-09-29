# 07_browser / browser_contract + failure_taxonomy + oracle_model

Timestamp: 2026-09-29T01:30Z · Controller owns review architecture, adjudication, classification, acceptance (mission §26)

## 1. Browser review contract (required record per check)

Every browser check MUST record: `browser`, `browserVersion`, `transport/runtime`, `candidate`
(canonical source identity), `commit`, `tree`, `environment`, `route`, `flow`, `preconditions`,
`actionSequence`, `expectedState`, `assertions`, `screenshots`, `evidenceLineage`, `fixtureState`,
`negativeCases`, `failureClassification`.

Current environment facts to bind: Playwright 1.62.1 package-local, Chromium engine, Node 22.16.0,
viewports used historically 1440×1000 / 1440×900 / 1024×900, reduced-motion where recorded.

## 2. Failure taxonomy (mandatory classes)

`PRODUCT` · `HARNESS` · `ENVIRONMENT` · `ORACLE` · `EVIDENCE` · `LINEAGE` · `UNKNOWN`

Adjudication rules (mission §25):
- Visual mismatch alone is never sufficient; check oracle definition and evidence lineage first.
- "browser issue" and "Product bug" are forbidden default labels.
- A receipt whose candidate binding cannot be matched to the executed source is **LINEAGE**, not PRODUCT.

## 3. Existing failure classification (this Controller's adjudication of current retained state)

| Observed | Classification | Rationale |
|---|---|---|
| Newest `BROWSER_CONFORMANCE_RECEIPT.json`: 6 flows, 1 PASS / 5 FAIL, `executionStatus=BLOCKED_OR_FAILED` | **UNKNOWN → pending re-run** | flows fail, but receipt lineage is broken (below) so root cause cannot be assigned yet |
| Receipt candidate `CANONICAL_SOURCE_TREE_SHA256:a676f663…` matches neither `480dbe…/273` (canonical) nor `2ebcbf89…/287` (live worktree) | **LINEAGE** | orphan evidence; must be rebound and re-executed |
| Retained 46/46 route + 23/23 reload diagnostics | **EVIDENCE (projection only)** | explicitly `NOT_ACCEPTANCE`; cannot close C03-GATE-022 |
| Localhost navigation administratively blocked (historical CDP harness workaround: in-memory Blob ESM transport) | **ENVIRONMENT** | preserved failure pattern; harness workaround documented in `tools/psc-ps01-browser-conformance-cdp.py` |
| Historical PW-20 Learn real-consumer binding | **PRODUCT/HARNESS split unresolved** (historical BLOCKED) | preserved as failure pattern for W02 |

## 4. Oracle model

- Domain oracles are acceptance truth: W03 ORACLE-007, W04 ORACLE-011, W05 ORACLE-012, ORACLE-009
  (bindings per zero-loss index §4.5; exact oracle files to be bound in packets from `cep-writer/`).
- Visual references (`cep-writer/references/visual`, `FINAL_VISUAL_REFERENCE_REGISTER`, `CEP_VIS-001`)
  are **Presentation inputs only** — never domain/data/provider truth (K-05).
- Positive tests + negative/falsification tests per obligation row are the semantic oracle pair (K-02).

## 5. Review responsibility split (mission §26)

Controller: contract, adjudication, classification, acceptance, final interpretation.
Writer: executes assigned checks, captures evidence, fixes its workspace per packet.
Helper: may run Playwright/screenshots/traces; never final authority.
**Policy: no endless repair loops before dispatch** — classify current failures, re-run only the
rebinding proof, then dispatch.
