# HANDOFF — VAL-1 (Validation surface, W05)

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Status:** `NOT_OWNER_ACCEPTED`
**Lane:** `VAL-1` · **Surface:** `validation` · **Unit:** `W05-VALIDATION`

---

## 1. Identity

| Field | Value |
|---|---|
| Branch | `writer/mi-serial-lane/VAL-1` |
| Parent (exact, verified at launch) | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` — `controller(gate): RECOVERY_GATE_PASS — execution transition authorized` |
| Candidate commit identity | recorded in `writer-output/W05-VALIDATION/CANDIDATE_IDENTITY.json` (written immediately after the product commit so the identity is exact, not guessed) |
| Canonical source tree (338 files) | `ad431b655aed13ac6741bbf007f3e214782d4bd5e4309e0df1d9e872b5e8addb` |
| Node | `v22.16.0` (matches `engines`) |
| Reference | `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/03_VALIDATION/CEP_SYSTEM_VALIDATION_REFERENCE.png` sha256 `0074ab58c53f1d9e…` = `OWNER_CONFIRMED_FINAL_REFERENCE` (re-verified against the packet digest) |

## 2. Changed paths

**`w05-rescue.ts` touched: NO.**

| Path | Change |
|---|---|
| `stack/native-typescript/adapters/validation.ts` | audited + bounded truth fixes (D-VAL-1,2,4,5) |
| `stack/native-typescript/surfaces/validation/index.ts` | audited + bounded truth/presentation fixes (D-VAL-3,4,6,7,8,9,10) |
| `stack/native-typescript/surfaces/composition/w05-rescue.ts` | **UNCHANGED** — audited as sole seam steward; byte-identical to HEAD (`git status` shows no modification; committed sha256 `04408baa8539c30cc8aeb3ff5546689ee5060d5ca1dd7ab41a1ec31c70e54300`) |
| `writer-output/W05-VALIDATION/**` | reports + evidence (new) |

Seam justification: the validation adapter is already constructed by `createW05RescueComposition` and injected into `mountValidationSurface({adapter:selected})`; every fix lands in the adapter module or the surface module, both VAL-1-owned. The seam's truth ceilings, provider bindings and `finalR6Wiring:false / balanced6:'HOLD'` ceilings are correct as committed and were deliberately left alone.

**HLTH-1 / PRC-1 hotspot requests:** none present — `writer-output/W05-HEALTH/` and `writer-output/W05-PROCESSING/` do not exist in this worktree, so there was nothing to honour or to decline.

## 3. Salvage (audit first, never rebuilt)

- **Existing validation semantics preserved exactly:** exact artifact/ruleset/validator identity checks, `TechnicalFinding ≠ W04 Review Finding`, `formalReviewAuthority=false`, missing-validator ⇒ `UNAVAILABLE` never `PASS`, bounded-local (no network) validation. All ten S17 assertions that encode these pass unchanged.
- **W05 validation flow evidence** in `writer-output/W05/` (flow shots + reaudit) **preserved**: the mandated harness writes there by design; every byte it produced was copied into this lane's `flow-evidence/` and the read-only path was restored with `git checkout -- writer-output/W05` → **0 diffs** afterwards. No pre-existing screenshot, receipt or `.runtime-proof` state was deleted or rewritten.
- **No restart / revert / reset anywhere.** Pre-existing defects were fixed in place; superseded intermediate probe captures are retained under `probe/captures/superseded-run*/` (labelled, not deleted).

## 4. Baseline → after (tests + falsification)

| Gate | Baseline (parent source) | Candidate |
|---|---|---|
| `npm run build:runtime` | exit 0 | exit 0 |
| `npm test` | **210 pass / 0 fail** | **210 / 0**, run **twice → byte-identical** (N5) |
| `validation.flow` | PASS | PASS |
| `health.refresh-inspect-diagnose` | (not run at baseline — seam untouched) | **PASS** |
| `processing.inspect-retry-requestCancel-validationHandoff` | (not run at baseline — seam untouched) | **PASS** |
| S17 | 12/12 pass, 0 fail | 12/12 pass, 0 fail |
| CG6 coverage | 7/7 pass, 0 fail | 7/7 pass, 0 fail |
| CG6 truth | 4/4 pass, 0 fail | 4/4 pass, 0 fail |
| D11 | 100% | 100% |
| `tools/check-duplicate-mechanics.mjs` (N4) | exit 0 | exit 0 |
| `tools/check-contracts.mjs` | 167/168 — 1 FAIL | 166/168 — 2 FAIL (see §6) |
| Lane probe (`probe/validation-probe.mjs`) | n/a | **45/45 assertions pass** |

**Falsification run (mandatory):**

- **N1 non-owned-route mutation → REFUSED.** `n1-refusal.json` enumerates the four non-owned paths the audit would have needed (`m0-controller-composition.ts`, `w05-rescue.ts`, `assurance/BROWSER_CONFORMANCE_RECEIPT.json`, `writer-output/W05/**`) and the refusal/record action taken for each; `git status` filtered against the declared roots returns nothing outside them.
- **N2 boundary/invalid input → no corruption, no false receipt.** Probed: valid object, `null`, number, array, string, boolean, empty, broken JSON. Before: `null` returned `TECHNICALLY_INVALID` **with zero findings** (false receipt). After: every non-object root yields `ROOT_NOT_OBJECT`; parse failures yield `INVALID_JSON`; both project truthfully.
- **N3 act without prerequisite provider → unavailable, never fabricated.** Foreign validator identity ⇒ `UNAVAILABLE` + `VALIDATOR_UNAVAILABLE` finding, never `TECHNICALLY_VALID`; rules that cannot run are rendered `NOT_EVALUATED` instead of `PASS`; unresolved-identity inspect reports `UNRESOLVED_RUN_IDENTITY` instead of a fabricated `STALE`.
- **N4 duplicate mechanics → clean** (exit 0, no new owner).
- **N5 suite twice → identical** (both runs 210/0, normalized outputs equal).
- **Lane-specific (seam):** `w05-rescue` was **not** changed, so before/after equivalence is proven by running the health and processing flows on the candidate — both PASS with zero failed assertions, i.e. both mounts behave identically through the unchanged seam. The pre-change `validation.flow` capture is retained in `flow-evidence/baseline/` for before/after comparison.
- **validate-without-provider → truthful findings/unavailable:** probe section D, both viewports, PASS.

## 5. FOUR TRUTHS (stated separately)

**TRUTH 1 — FUNCTIONAL.**
What executes, passes: build, `npm test` 210/0 twice identical, S17/CG6/D11, three browser flows (validation + health + processing), 45/45 lane assertions. What does **not** pass: `browser.lineage_receipt_truthful` (pre-existing at parent) and `browser.current_candidate_claim_truthful` (caused by this lane's source drift against a read-only Controller receipt). Nothing is claimed green that is not green.

**TRUTH 2 — STRUCTURAL.**
Two VAL-1-owned source files changed; the shared seam untouched; no new owner or duplicate mechanic; adapter computes truth, surface projects it (presentation/state boundary held); no writes outside the declared roots; `dist/`, `assurance/`, `stack/MEASURED_COMPARISON.json` restored to HEAD before commit as instructed.

**TRUTH 3 — VISUAL.**
The surface was compared L1→L4 against the `OWNER_CONFIRMED_FINAL_REFERENCE` and against its own profile; 7×V2 and 3×V1 defects were found by inspection and fixed; re-capture and re-comparison confirm them; direction and language were proven in both AR/RTL and EN/LTR at 1440×1000 and 1024×900 through the product's own preference path. Visual status is `CANDIDATE_COMPLETE_NOT_ACCEPTED` — this lane cannot accept its own rendering.

**TRUTH 4 — EVIDENCE & LINEAGE.**
Every capture is hash-bound (sha256 + viewport + locale + selector) in `PROBE_RECEIPT.json` / `SHA256SUMS.txt`; baseline and after capture sets are kept separately; superseded captures are retained and labelled; the flow harness's lineage line honestly reports `DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS` rather than a false bind; no receipt was regenerated to make a check green.

**Protected profile invariants held (not part of the four truths, listed for the audit):** technical validity ≠ admission/review/mastery · technical findings are never W04 review findings · missing validator is `UNAVAILABLE`, never `PASS` · empty ⇒ `NOT_RUN`, not "technically valid" · stale ⇒ shown as stale relative to the current artifact · validator exception ⇒ `ERROR`, distinct from schema nonconformance.

## 6. Evidence

| Evidence | Path |
|---|---|
| Lane probe receipt (45/45, 15 sha256-bound captures, 1440×1000 + 1024×900, AR/RTL + EN/LTR + default, element crops) | `probe/PROBE_RECEIPT.json` |
| Probe captures | `probe/captures/*.png` (superseded intermediates: `probe/captures/superseded-run*/`, retained, git-ignored) |
| Pre-change `validation.flow` capture + receipt copy | `flow-evidence/baseline/` (+ `SHA256SUMS.txt`) |
| Post-change validation + health + processing captures + receipt | `flow-evidence/after/` (+ `SHA256SUMS.txt`) |
| Packet tests, baseline and final | `s17-baseline.json`, `s17-final.json`, `cg6-*.json`, `cg6-truth-*.json`, `d11-baseline.txt`, `d11-final.txt` |
| Contract check, baseline and final | `check-contracts.json`, `check-contracts-final.json` |
| N1 refusal record | `n1-refusal.json` |
| N4 duplicate-mechanics output | `n4-duplicate-mechanics.txt` |
| Machine-readable acceptance report | `VISUAL_EXECUTION_REPORT.json` |

Capture environment: headless Chromium (Playwright 1.62.1, package-local), `localhost-http` via `tools/serve.mjs`, throwaway sqlite under this lane's own `probe/.runtime-proof` (never the shared `writer-output/W05/.runtime-proof`).

## 7. Unresolved findings (record-only, not decided here)

1. **R1 — V1 residual, `RULE`/`CODE` identifier cells still wrap mid-token** (`ARTIFACT_REF_RE QUIRED`) at both viewports. Root cause is the CENTER pane width, which is governed by shared shell pane geometry (`SH-2` / AD-01, read-only for VAL-1). Not fixed in this lane; would need a serialized request if the Controller wants it closed.
2. **R2 — `browser.current_candidate_claim_truthful` FAIL.** It passes at parent and fails here only because `assurance/BROWSER_CONFORMANCE_RECEIPT.json` still binds the pre-change canonical source tree. Any source-editing lane produces this. Regenerating the receipt is Controller-owned; fabricating it is forbidden, so it is reported.
3. **R3 — `browser.lineage_receipt_truthful` FAIL is pre-existing/global.** Proven by stashing both edited files, rebuilding and re-running the check at parent source: exactly this one FAIL (its 6-flow summary is 4 pass / 2 fail — the two global Enterprise browser flows the mission declares out of scope). Restored and re-verified afterwards.
4. **R4 — profile state `QUEUED` is unreachable** in the bounded local validator (there is no queue). Deliberately **not** fabricated; `RUNNING/TECHNICALLY_VALID/TECHNICALLY_INVALID/ERROR/UNAVAILABLE` are all reachable, `ERROR` now genuinely so.
5. **R5 — reference vs profile command inventory.** The governed reference shows a richer toolbar (Suite selector, show-failures-only, report export, raw-log console, changing-components list). `profiles/validation.json.domain_commands` lists exactly `validation.validate / validation.inspect / validation.findings`. Profile + OD-20260920-059 govern command inventory, so nothing extra was invented. If the reference's fuller command set is wanted, that is an Owner/Controller scope decision.
6. **R6 — RIGHT context pane collapses at 1024×900** under the shared responsive rule (recorded as a collapsed-state observation in the probe receipt, not a defect).

## 8. Owner / STOP notes

- **No Owner-facing item was decided or invented.** Owner-gated items named by the DAG (shell redesign `OWNER-20260910-010`, RQ reference promotion, Visualize F-048, destination-count freeze `C03-GATE-023`) were not touched and are not claimed.
- **No authority conflict found** in the closed read set; no `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**` file was modified.
- **No STOP condition was hit.** The two `check-contracts` reds are reported truthfully rather than resolved by touching read-only assurance.
- **No self-acceptance:** acceptance stays `NOT_OWNER_ACCEPTED`; Controller review required.
- **Seam stewardship:** `w05-rescue.ts` remains single-writer-clean — zero bytes changed by VAL-1; no serialized hotspot request was needed or silently applied.

## 9. Resume instructions

1. `git status --porcelain` must show only `stack/native-typescript/adapters/validation.ts`, `stack/native-typescript/surfaces/validation/index.ts` and `writer-output/W05-VALIDATION/` (plus restored build artifacts if a build/test was just run).
2. `npm run build:runtime` → `npm test` (expect 210/0) → `node writer-output/W05-VALIDATION/probe/validation-probe.mjs` (expect 45/45).
3. Read `VISUAL_EXECUTION_REPORT.json` before any further edit; the defect ledger in §4 of that file is the authoritative change list.
