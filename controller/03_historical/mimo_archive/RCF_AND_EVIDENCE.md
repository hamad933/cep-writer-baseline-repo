# RCF_AND_EVIDENCE — real-consumer vs fixture knowledge and evidence patterns

**Class:** `FORENSIC_RECOVERY__RCF_AND_EVIDENCE_LAW__PROVENANCE_BOUND`
**Produced:** 2026-09-29 · MIMO forensic worker. Companion to `KNOWLEDGE_EXTRACT.md` (K-055…K-063) and `OPERATIONAL_LESSONS.md`.
**Naming note:** the archive contains **no file named `*RCF*`** and none named `*REAL_CONSUMER*`. RCF knowledge is distributed across governance law, Owner decisions, obligation rows and executable code. Files named `*FIXTURE*` exist only in the historical product tree (listed in §5).

---

## 1. RCF law (the real-consumer vs fixture doctrine)

**R-1 · Fixtures never prove reuse** — `.openclaw/tmp/cep_mirror/READ_FIRST.md` (PRESENTATION HARD STOP), register `OD-20260914-020`, `CONTROLLER_GOVERNANCE.md` §7 (lines 46730–47248):
Fixtures/demo/synthetic consumers may supplement tests. They **never** satisfy: real-consumer reuse proof · donor parity · second-consumer proof · donor cutover · Presentation acceptance. A fixture must be labeled `FIXTURE_ONLY`, never `PROVEN_BROWSER_CONSUMER`. The forbidden substitution is spelled out verbatim: `READ DONOR → BUILD PARALLEL LOOKALIKE/SIMPLIFIED HOST → PROVE FIXTURES → CALL IT REUSE`.

**R-2 · Extraction, not parallel reimplementation** — register `OD-20260914-021`, `CONTROLLER_GOVERNANCE.md` §7 (lines 45182–45191):
`IDENTIFY ACCEPTED VALUE → LOCATE REAL DONOR IMPLEMENTATION/PATH → EXTRACT/REFACTOR ACTUAL VALUE INTO CANONICAL OWNER → REBIND REAL DONOR/LIBRARY TO THAT OWNER → BIND REAL COMPATIBLE NON-LIBRARY CONSUMER → STATE/VIEWPORT-MATCHED COMPONENT COMPARISON → CENTRAL CHANGE PROPAGATION → EXACT REVERT → CUT OVER ONLY WHEN ZERO-LOSS → REMOVE ONLY THE PROVEN DUPLICATE BRANCH`.

**R-3 · Writer scope must permit the true seam** — register `OD-20260914-023`, `CONTROLLER_GOVERNANCE.md` §8 (lines 48787–49819):
If extraction needs `accepted-runtime`, `main`, donor CSS/DOM, final wiring or another shared hotspot: serialize the hotspot, give one bounded explicit owner, or keep it Controller-owned. Prohibited: forbid all real extraction seams; allow only a new parallel module; accept that parallel module as donor extraction. `Collision avoidance never justifies false reuse.` Historical owner-lock matrices are collision evidence, not current mission authority.

**R-4 · Real-consumer proof (the admission test)** — `CONTROLLER_GOVERNANCE.md` §14 (lines 66797–69367):
When reuse is claimed: real Library/donor path consumes the extracted owner (where Library is an applicable consumer) AND ≥1 genuine compatible non-Library path consumes the same owner; no consumer-specific patch may create the propagation result; a bounded central change must visibly/functionally propagate to all claimed consumers; exact revert must restore intended final source.
A route is **not** a qualified second real consumer merely because it is executable, browser-runnable, named `learn`/`visualize`/`runs`, or appears in a Foundation proof host. To qualify it must be a current real non-fixture/non-demo product/runtime source path that actually binds the same extracted Presentation owner.
`Fixture-backed product routes, Foundation proof/workbench routes, synthetic data paths, descriptor/import-only paths, harnesses and simulation-only consumers are NOT_YET_QUALIFIED_REAL_SECOND_CONSUMER unless direct source/runtime evidence proves otherwise.`
`Import-only, registry-only, descriptor-only and fixture-only proof are invalid for real-consumer claims.`
If independent preflight/audit readers disagree on consumer qualification, **use the stricter classification** until the Controller resolves it with direct source/runtime proof. Never average the findings.

**R-5 · Temporary compatibility seam** — `CONTROLLER_GOVERNANCE.md` §8.2 (lines 54439–55466):
A compatibility branch/host may remain during strangler-style extraction as rollback protection but is never a permanent second canonical Presentation owner. Lifecycle: `TEMP COMPATIBILITY → EXTRACT TO CANONICAL OWNER → REBIND LIBRARY → QUALIFY REAL SECOND CONSUMER → ZERO-LOSS PROOF → CUTOVER → RETIRE ONLY PROVEN DUPLICATE`. Historical `KEEP_SURFACE`/`DONOR_LOCKED`/preserve-as-is rules protect rollback but do not grant permanent immunity from cutover.

**R-6 · Canonical authoring source law** — `CONTROLLER_GOVERNANCE.md` §8.1 (lines 51358–53413):
A donor-derived extraction must identify the canonical authoring source or reproducible build/extraction pipeline. `dist/*`, bundled JS/CSS, extracted HTML, compiled artifacts and screenshots are evidence/runtime products, not authoring authority. Prohibited: hand-edit a generated output and call it a reusable canonical owner; leave accepted donor DOM/CSS trapped in an opaque generated artifact while claiming extraction complete; bypass the real build/extraction seam.

**R-7 · Donor floor + state/viewport component proof** — register `OD-20260914-022/024/027`, `CONTROLLER_GOVERNANCE.md` §§11–12:
Accepted donor value = minimum quality floor; hard-fail vocabulary: materially weaker / visibly weaker / thin / proof-oriented / placeholder / partial Presentation / not donor-grade / not zero-loss / unproven / missing shared Foundation / blocking / quality blocker. Component matrix must include: component ID, canonical owner, donor/oracle anchor, Owner-decision IDs, real donor path, real candidate consumer path, exact state, viewport, donor screenshot, candidate screenshot, behavior/interaction receipt, responsive/Bidi/a11y evidence, verdict, blocker. Compare same state→same state, same viewport→same viewport; minimum 1440 and ~1024; broad page screenshots insufficient when they hide component regressions; evidence must be directly inspectable by Controller/Owner (not ZIP-buried).

**R-8 · Golden replay hard gate** — `CONTROLLER_GOVERNANCE.md` §13 (lines 65258–66284):
For any donor-derived component/mechanic, replay all applicable R3 P0 Golden scenarios on the **real current consumer path**. P0 loss without explicit newer Owner supersession = REJECT. Presentation-only changes still may not regress Golden interaction/behavior.

**R-9 · Visual references are Presentation authority only** — `READ_FIRST.md` OD-059 block; `corpus/23_SURFACE_IDENTITY_MATRIX.md` adjudication #6; `cep_repo/README.md`.
Final visual-reference images are Presentation floors/ceilings distinct from source-bound evidence screenshots; they never override domain/data/provider truth or newer Owner decisions.

## 2. RCF in the requirement corpus

- Every obligation row carries `positive_test` + `negative_falsification_test` + `proof_requirement` + `reference_binding` (schema in `DECISIONS_AND_REQUIREMENTS.md` §2.1) — RCF is enforced per row, not per mission.
- Per-mission donor work additionally requires (governance §17, lines 75032–75037): donor component inventory; **actual extraction map donor-source → canonical owner → Library binding → second consumer**; explicit Library-domain-only exclusions; component evidence matrix; **no fixture-only acceptance**.
- Surface-matrix hard gate (`corpus/23_SURFACE_IDENTITY_MATRIX.md`, "Rescue mission hard gate"): "No generic `renderTruthStage`/fixture route/shared-owner-presence proof can substitute for the row's actual purpose and typed composition."
- `STAGE2_OWNER_APPLICABILITY.csv` / `APPLICABLE_OWNER_DECISIONS.csv` bind each Owner decision to target surfaces so RCF duties cannot be dropped silently per surface.

## 3. RCF evidence patterns and evidence-class vocabulary (recovered)

| Evidence class / receipt pattern | Meaning | Provenance |
|---|---|---|
| `CANDIDATE_ONLY__REAL_PRODUCT_ACCEPTED_RUNTIME_ROUTE__NO_PROMOTION` | real product route proof that is still candidate-only | `cep_repo/stack/native-typescript/tests/rescue/CG1_CORR01_OD054_ACCEPTED_RUNTIME_SECONDARY_ROUTE/evidence/CG1_CORR01_OD054_BROWSER_PRODUCT_ROUTE_PROOF.json` |
| `NOT_GENUINE_ROUTE` | navigation-independent rendering of exact candidate bytes; proves Presentation/interaction only; never closes HTTP routing/Back-Forward/network/platform claims | `CONTROLLER_GOVERNANCE.md` (line 93294); `CONTROLLER_SUCCESSION_HANDOFF.md` §11; `OD-20260915-002/OD-20260922-072` |
| `BOOTSTRAP_ONLY__NOT_FINAL_ACCEPTANCE_EVIDENCE` | Controller-prepared bootstrap screenshots (exact-source-bound, inspected; Writer recaptures after mutation) | `CONTROLLER_GOVERNANCE.md` (line 97358, OD-075) |
| `EVIDENCE_ONLY__NOT_RECOVERABLE_PRODUCT_SUCCESSOR` | screenshots/logs/prose/hash-text without source-bearing bytes | `CONTROLLER_SUCCESSION_HANDOFF.md` §10 |
| `FIXTURE_ONLY__NOT_PRODUCT_TRUTH` (+ `canonicalProductTruth=false`) | adapter-level fixture classification | `cep_repo/stack/native-typescript/adapters/w03-enterprise.ts` |
| `NO_QUALIFIED_REAL_SECOND_CONSUMER_IN_THIS_MISSION` | declared when a mission cannot prove a real second consumer | `cep_repo/stack/native-typescript/foundation/review/decision.ts`, `tests/rescue/CG2_SHARED_FAMILIES_COVERAGE/shared-family-coverage.test.ts` |
| `REVIEW_AUDIT_REAL_CONSUMER_CANDIDATE_REQUIRED` / `REVIEW_AUDIT_PROFILE_CANNOT_CREATE_PROOF` | admission errors thrown at composition time | `cep_repo/stack/native-typescript/foundation/review/family-admission.ts` (lines 20–24) |
| `LIBRARY_FIXTURE_SOURCE_FORBIDDEN` | negative falsifier rejecting fixture-classified Library sources | `cep_repo/stack/native-typescript/tests/rescue/S08_W01_W02_LIBRARY_LEARN/s08-falsification.ts` (line 26) |
| `VISUAL_PARITY_NOT_ADJUDICABLE__DATA_COVERAGE_BLOCKED` | truthful refusal when populated reference has no lawful matched data | `CONTROLLER_GOVERNANCE.md` §17.3 binding #6 |
| `DATA_COVERAGE_BLOCKER` | mission-level refusal to fabricate representative data | `.openclaw/tmp/req/shell/MISSION.md` |
| `OWNER_VISIBLE_EVIDENCE_SHEET_REQUIRED` | acceptance workflow requires Owner-inspectable component/state sheet | register `OD-20260914-027` |
| `SCREENSHOT != PARITY; GREEN TEST != PRESENTATION PASS` | mandatory actual image inspection | `CONTROLLER_GOVERNANCE.md` §17.3 binding #11 |

## 4. Data-sufficiency and matched-state proof (RCF precondition)

`.openclaw/tmp/cep_mirror/corpus/CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §N ("Data sufficiency is prerequisite to visual/component parity") + `CONTROLLER_GOVERNANCE.md` §17.3 bindings #6–#9:
- Every reference-backed parity decision classifies its data basis as `REAL_CURRENT_DATA | GOVERNED_ACCEPTANCE_SEED | TEST_ONLY_PRESENTATION_HARNESS | TRUTHFUL_EMPTY_UNAVAILABLE`.
- A populated final reference and an empty/provider-unavailable candidate do not expose the same defects; **never PASS a populated reference from an empty/unavailable screenshot**.
- When lawful populated Product truth is unavailable: capture truthful normal Product state PLUS a separately labeled matched Presentation diagnostic state through an admitted test/acceptance seam — and keep test-only truth out of Product truth.
- Region/crop decomposition over TOP/TOOLBAR/LEFT/CENTER/RIGHT/BOTTOM/TRANSIENT; crops are precision aids, never independent authority artifacts.
- Reviewer missions split into `PHASE A — SOURCE-BOUND VISUAL EVIDENCE CENSUS` (prove identity/data/state/viewport coverage first) and `PHASE B — REFERENCE/AUTHORITY DEEP AUDIT` (then judge parity).

## 5. Fixture assets and RCF-adjacent code found in the historical product tree

Fixture-named modules (all inside `.openclaw/tmp/cep_repo/`):
`stack/native-typescript/adapters/library-fixtures.ts`, `adapters/note-content-direction-fixture.ts`, `adapters/w03-v34/{enterprise,runs}-fixture.ts`, `fixtures/w4-f-runtime-contract-fixture.ts` (+ compiled `dist/**` mirrors).

Key semantics recovered:
- `adapters/library-fixtures.ts`: re-exports the Balanced6 acceptance seed; `libraryFixtureDescriptor()` returns `{classification: BALANCED6_CLASSIFICATION, truth: BALANCED6_TRUTH, realConsumer:true, role:'SOURCE_GROUNDED_BALANCED6_LOCAL_ACCEPTANCE'}` — i.e. **a governed acceptance seed**, not product truth for other claims (see `KNOWLEDGE_EXTRACT.md` K-058).
- `foundation/timeline/replay.ts`: `TIMELINE_REPLAY_TRUTH_CLASSES = ['DOMAIN_OWNED','FIXTURE_ONLY']` — fixture-derived replay state is a distinct, non-canonical truth class.
- `foundation/review/family-admission.ts`: real-consumer admission predicate requires `routeKind==='PRODUCT' && consumerKind==='GENUINE_REAL_PRODUCT' && domainImplementation==='REAL_PRODUCT_COMPOSITION' && candidateConsumerEvidence` and rejects `synthetic | fixture | contractOnly`; result is frozen with `controllerAdmissionRequired:true, realConsumerAccepted:false`.
- `adapters/w03-enterprise.ts`: fixture adapters self-classify `FIXTURE_ONLY__NOT_PRODUCT_TRUTH`, `canonicalProductTruth=false`, with a fixture source digest — asserted by `tests/rescue/S10_W03_ENTERPRISE/domain-and-lifecycle.test.ts`.

## 6. Evidence custody law

- **Capability separation** (register `OD-20260915-038`, `OD-20260922-072`): local-process reachability, browser launch, URL navigation, navigation-independent rendering, JS/DOM, pointer/keyboard interaction, screenshot creation, actual image inspection, video and genuine route/platform proof are separate capabilities. A failure in one never declares visual capture impossible while a bounded path remains (L1–L8 ladder: explicit executable paths, `CEP_BROWSER_EXECUTABLE`, validated offline packages, standalone Chrome Headless Shell after full-Chrome failure, other compatible engines, in-memory transport of exact bytes).
- **Local-first + custody** (`OD-20260922-073`): intermediate captures/crops/diffs/logs/videos = local execution scratch; promote only final representative source-bound evidence; heavy final generated custody → Google Drive with hash/source-bound receipts; GitHub is not bulk visual-evidence transport.
- **Freshness**: never relabel historical screenshots as fresh current-candidate evidence; bootstrap screenshots bind exact capsule source commit/tree + screenshot/receipt hashes + viewport/state metadata.
- **Receipt integrity precedents** (`corpus/ZL02_CONTROLLER_RECONCILIATION.txt`, `CEP_LESSONS_GAPS_DEPENDENCIES_LEDGER.md` §G): evidence carriers must independently pass SHA/bytes, ZIP/CRC, standalone verifier, `git bundle verify`, materialization to exact HEAD/tree, clean worktree, Product identity and mission input verification. Known evidence defects found: evidence-receipt overcount (`F-051`); `assurance/BROWSER_CONFORMANCE_RECEIPT.json` with `executionStatus=BLOCKED_OR_FAILED` (3/6 flows) contradicting a Writer handoff PASS claim; manifest changed-path accounting defect (93/29 vs 93/30); hidden files omitted by artifact upload; self-referential source/transport binding.
- **Owner-visible evidence** (`OD-20260914-027`, `CONTROLLER_GOVERNANCE.md` §19): no acceptance before the Controller directly inspects representative pixels and exposes an Owner-readable component/state evidence sheet.
- **Full-carrier negative falsification** (§17.3 binding #12): prove required semantics/regions/actions are present AND donor/debug/foreign-surface semantics unauthorized for that consumer are absent.

## 7. RCF-related historical exclusions (do not reimport without exact-current re-falsification)

`corpus/ZL02_CONTROLLER_RECONCILIATION.txt` §7: `F-048`; old non-genuine-route screenshots used as functional proof; provider-unavailable treated as Product success; superseded old browser/native defects; historical PREPARED/HOLD states; five Shell destinations as frozen authority; unavailable-provider RQ populated reference content; old Owner-decision counts.

## 8. Open RCF items at archive cutoff

- `TimelineReplayOwner` retain+rebind vs retire (duplicate replay mechanics forbidden) — `23_SURFACE_IDENTITY_MATRIX.md` adjudication #8, `A01-PF-007`.
- RELEASES shared test blocker: tests construct Releases without injecting canonical `AnalyticalCompareOwner` and expect compare to work — must not be "fixed" with a local fallback owner (`CURRENT_RESULT_AUDIT.txt`).
- W04 duplicate shared owners (`SemanticCommandBus`/`TransientFocusOwner`/`ContextInspectorHost`) from local workbench chrome must not be replayed as shared mechanics (A5 audit).
- `MFC-PF-001/002/003` local Library transient/focus/settings paths beside canonical owners.
- `F-051` evidence-receipt overcount remains open (M4 EVIDENCE).
