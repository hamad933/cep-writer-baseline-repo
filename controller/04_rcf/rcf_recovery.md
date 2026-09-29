# 04_rcf / RCF_RECOVERY_REGISTER + CURRENT_COVERAGE_MATRIX (B-1 COMPLETE, recovery deepened)

Timestamp: 2026-09-29T02:15Z · Doctrine unchanged: historical proofs = evidence; current proof requires current-candidate execution.

## RCF_RECOVERY_REGISTER — artifacts read at content level (provenance = Drive id in `../03_historical/corpus/manifest.json`)

| ID | Artifact | Kind / classification | What it proves (original meaning) | Applicability now | Status |
|---|---|---|---|---|---|
| RCF-01 | `FW_B_REAL_CONSUMER_PROOF.json` | real-consumer proof, status PASS | library + learn consumers exercised on `sourceIdentity` | W02 (library/learn) + foundation | HISTORICAL_VALID |
| RCF-02 | `W2_C_REAL_CONSUMER_BROWSER_PROOF.json` | browser real-consumer, PASS | browser assertions over `consumers` | W02 | HISTORICAL_VALID |
| RCF-03 | `W3A_REAL_CONSUMER_PROOF.json` | owner-scoped proof (owner, consumers, inputOwnership, semanticReceipts, verdict) | W3A mechanic consumer binding | W03 | HISTORICAL_VALID |
| RCF-04 | `W3_B_REAL_CONSUMER_PROOF.json` | contract/policy/dedupe/lifecycle/truthBoundary, PASS | W3B shared contract truth | W03 | HISTORICAL_VALID |
| RCF-05 | `W3E_REAL_CONSUMER_PROOF.json` | preferenceAuthority + paneStateAuthority + scales/persistence/domainState, PASS | preference/pane authority split | W03 + shared prefs | HISTORICAL_VALID |
| RCF-06 | `W5_A_REAL_CONSUMER_PROOF.json` | `LANE_EXECUTION_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE` | W5A bounded lane case | W05 | HISTORICAL_VALID (explicit ceiling preserved) |
| RCF-07 | `PS04_BROWSER_REAL_CONSUMER_PROOF.json` | PASS, modules+viewports+checks+runtimeEventCount | runtime/persistence browser convergence | W05 persistence + foundation | HISTORICAL_VALID (duplicate 09-16/09-20 copies — dedupe by later timestamp) |
| RCF-08 | `PS03_REAL_CONSUMER_ADMISSION_RECEIPT.json` | `CANDIDATE_EVIDENCE_NOT_CONTROLLER_ACCEPTANCE`, PASS | admission pattern: familyOwner + consumers + targetedTests + centralPropagation + exactRevert | acceptance logic template | HISTORICAL_VALID → **template adopted** for packet completion proof |
| RCF-09 | `REAL_CONSUMER_REUSE_AND_PROPAGATION.json` | PASS, finalSourceIdentity + centralOwnerPath + fourDimensionEvidence | reuse propagation through a central owner | foundation capability | HISTORICAL_VALID |
| RCF-10 | `L02_REAL_CONSUMER_REUSE_MATRIX.json` | reuse matrix (rows + rule) | which mechanics proved reusable | foundation | HISTORICAL_VALID |
| RCF-11 | `L07_REAL_CONSUMER_SET.json` | authority + primaryLiveOperationalConsumer + recordedConsumer + notApplicable + generalizationDecision | real-consumer set definitions | RCF taxonomy source | HISTORICAL_VALID → **taxonomy adopted** |
| RCF-12 | `L08_REAL_CONSUMER_AND_GENERALIZATION_MATRIX.json` | rows + profileEvidence + overallGeneralization | generalization ceiling per capability | foundation | HISTORICAL_VALID |
| RCF-13 | `PW01_REAL_CONSUMER_STATUS.json` | `TRUTHFUL_BOUNDED`, fixtureSubstitutionUsed + claimCeiling | explicit claim-ceiling discipline | truthful-capability law (K-01) | HISTORICAL_VALID → **law adopted** |
| RCF-14 | `VS04/VS05_DUPLICATE_OWNER_AND_NEGATIVE_FIXTURE_PROOF.json` | PASS; negative fixtures + ownership gates + history recovery guards | duplicate-owner falsification + negative-fixture method | falsification template for all workspaces | HISTORICAL_VALID → **template adopted** |
| RCF-15 | `PW-20_LEARN_REAL_CONSUMER_BINDING` (historical, not retrieved this pass) | historical BLOCKED | Learn binding failure pattern | W02 | HISTORICAL_VALID (failure pattern preserved) |

## CURRENT_COVERAGE_MATRIX

Full per-surface machine-readable matrix: **`current_rcf_matrix.csv`** (23 rows: obligation counts,
positive/negative/proof-definition counts, artifact mapping, gap). Summary:

| Dimension | State |
|---|---|
| Surfaces with current real-consumer run | **0 / 23** |
| Surfaces with current fixture run | **0 / 23** |
| Surfaces with defined current proof obligations | **23 / 23** (from `requirement_ledger.csv` `positive_test` / `negative_falsification_test` / `proof_requirement` columns) |
| Historical real-consumer artifacts recovered | 12 (contents read) |
| Historical fixture/negative artifacts recovered | 2 + templates |
| Real vs fixture status | `HISTORICAL_EVIDENCE_ONLY__CURRENT_PROOF_OBLIGATIONS_DEFINED` |

## Residual RCF gaps (must appear in Writer packets)

1. Every workspace must execute current-candidate real-consumer checks for its surfaces before any
   acceptance claim; fixture results alone can never satisfy a `proof_requirement`.
2. `L07` taxonomy (primaryLiveOperationalConsumer / recordedConsumer / notApplicable) is the binding
   vocabulary for classifying each check.
3. `PW01` claim-ceiling discipline: AUTOSAVE ≠ SAVE ≠ RECOVERY; declare ceilings explicitly.
4. `PS03`/`VS04`/`VS05` provide the reusable admission + negative-falsification proof shapes.
