# W04 HANDOFF — Evidence · Reviews · Mastery · Portfolio

**Workspace:** W04 (complete workspace) · **Packet:** `controller/09_writer_forge/W04_writer_packet.md`
**Dispatch baseline:** branch `writer/mi-serial`, HEAD `d3ddc5e`, candidate `WORKTREE_VARIANT:c82cec63cb5f`
(`c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f`, 287 files)
**HEAD when the acceptance matrix was measured:** `891c1e563e741b8f0f7f610db0c4082ebe2cfb34`
(the Coordinator advanced the branch during parallel execution)
**Status:** candidate-only, no commit/push/merge performed. Sole Controller/Owner review required.

---

## 1. Checkpoints

| Checkpoint | Status | Artifact |
|---|---|---|
| **CKPT-A** baseline verified | **PASS** | `writer-output/W04/BASELINE_PROOF_RESULTS.json` |
| **CKPT-B** implementation stable (packet §10 b–f) | **PASS** | `writer-output/W04/CHECKPOINTS.md#ckpt-b` |
| **CKPT-C** requirement coverage, zero-loss | **PASS** | `PROOF_CATALOG.json` · `PROOF_RESULTS.json` · `ACCEPTANCE_MATRIX.csv` · `ACCEPTANCE_SUMMARY.json` |
| **CKPT-D** browser / evidence | **PASS** (5/5 flows) | `writer-output/W04/BROWSER_RECEIPT.json` + `evidence/*.png` |
| **CKPT-E** handoff | **PASS** | `EVIDENCE_INDEX.json` · `CHECKPOINTS.md` · this file |

---

## 2. Files created / changed

### Changed (all inside W04 ownership)

| File | Why |
|---|---|
| `stack/native-typescript/tests/surfaces/evidence/domain.test.ts` | closed baseline FAIL — inject the explicit fixture factory + bound admission-authority registry; assert the default-EMPTY law |
| `stack/native-typescript/tests/surfaces/mastery/domain.test.ts` | closed baseline FAIL — same, on **both** domain instances |
| `stack/native-typescript/tests/surfaces/reviews/domain.test.ts` | closed baseline FAIL — same + `allowTestAuthority:true` |
| `stack/native-typescript/tests/surfaces/portfolio/domain.test.ts` | closed baseline FAIL — same |
| `stack/native-typescript/surfaces/reviews/index.ts` | **product fix** — `/ ?surface=reviews` route did not mount: the semantic command **bus object** reached `WorkspaceFoundation.toolbar()` → `new Set(commands)` → `TypeError: object is not iterable`. Added `toolbarCommandIds` (id list), split `commands` (id list) from `commandBus`. |

### Created — tools (`tools/w04-*.mjs`, W04-owned)

| File | Purpose |
|---|---|
| `tools/w04-browser-flows.mjs` | packet §9 five flows → `BROWSER_RECEIPT.json` + screenshots |
| `tools/w04-f051-counting-proof.mjs` | **F-051 counting proof** → `F051_COUNTING_PROOF.json` |
| `tools/w04-seam-ownership-proof.mjs` | packet §10 (d) single-owner invariant → `SEAM_OWNERSHIP_PROOF.json` |
| `tools/w04-evidence-index.mjs` | hashes every `writer-output/W04/**` artifact → `EVIDENCE_INDEX.json` |
| `tools/w04-probe.mjs` | read-only DOM/domain probe used to diagnose the reviews-route mount defect |

### Created — `writer-output/W04/**`

`PROOF_CATALOG.json` · `PROOF_RESULTS.json` · `ACCEPTANCE_MATRIX.csv` · `ACCEPTANCE_SUMMARY.json` ·
`BROWSER_RECEIPT.json` · `F051_COUNTING_PROOF.json` · `SEAM_OWNERSHIP_PROOF.json` ·
`BASELINE_PROOF_RESULTS.json` · `CHECKPOINTS.md` · `PROPOSALS.md` · `W04_HANDOFF.md` ·
`EVIDENCE_INDEX.json` · `evidence/*.png` (97 hash-bound screenshots, 18 unique byte identities).

### Derived writes (all under `tools/writer-serial.sh`)

`node tools/build-runtime.mjs` (×N, `dist/**`) · `tools/writer-serial.sh npm test`
(`assurance/MODEL_TEST_RESULTS.json`) · `tools/writer-serial.sh npm run check`
(`assurance/CONTRACT_TEST_RESULTS.json`). `dist/**` was never hand-edited.

### Explicitly NOT touched

`stack/native-typescript/main.ts`, `stack/native-typescript/surfaces/m0-controller-composition.ts`,
the 3 protected canonical deltas (`main.ts`, `foundation/extensions.css`,
`foundation/operational/xterm-renderer.ts` — still the pre-existing worktree deltas, byte-identical to
what I found), `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`,
`archaeology/**`, `assurance/**` (by hand), all W01/W02/W03/W05 READ-ONLY paths, `dist/**` (by hand),
the session file, `adapters/surfaces/*`, `surfaces/{health,processing}/**`.

---

## 3. Proof results (command → measured)

| # | Command | Result |
|---|---|---|
| 1 | `tools/writer-serial.sh node tools/build-runtime.mjs` | **PASS** (exit 0, `pass:true`, 272 written) |
| 2 | `node dist/tests/surfaces/evidence/domain.test.js` | **PASS** (was FAIL) |
| 3 | `node dist/tests/surfaces/reviews/domain.test.js` | **PASS** (was FAIL) |
| 4 | `node dist/tests/surfaces/mastery/domain.test.js` | **PASS** (was FAIL) |
| 5 | `node dist/tests/surfaces/portfolio/domain.test.js` | **PASS** (was FAIL) |
| 6 | `node dist/tests/rescue/S14_W04_EVIDENCE_REVIEWS/{domain-lifecycle,surface-contract}.test.js` | **PASS** |
| 7 | `node dist/tests/rescue/S15_W04_MASTERY_PORTFOLIO/domain-authority.test.js` | **PASS** |
| 8 | `node dist/tests/rescue/CG5_W04_COVERAGE/w04-convergence.test.js` | **PASS** |
| 9 | `node dist/tests/post-c03/D10/d10-w04-authority-lifecycle-tests.js` | **PASS** |
| 10 | `node dist/w4-g-epistemic-confirmation-tests.js` | **PASS** |
| 11 | `node tools/w04-seam-ownership-proof.mjs` | **PASS** (14/14 checks) |
| 12 | `node tools/w04-browser-flows.mjs` | **PASS** (5/5 flows, 81 assertions) |
| 13 | `node tools/w04-f051-counting-proof.mjs` | **PASS** (11/11 checks) |
| 14 | `tools/writer-serial.sh npm test` | **PASS** (210 / 0) |
| — | `node dist/tests/rescue/CG2_SHARED_FAMILIES_COVERAGE/shared-family-coverage.test.js` | **FAIL** — **not W04-owned**, see §6 |
| — | `tools/writer-serial.sh npm run check` | **FAIL (exit 1)** — 2 `browser.*` on SHARED receipt, **not W04-owned**, see §6 |
| — | `npm run browser:test` | not run by W04 (shared 6-flow suite declares no W04 flow) |
| — | `node tools/c2-w04-truth/falsify-w04-truth.mjs` | **4/9 PASS** — W04-owned, **STOP/REPORT** filed (`PROPOSALS.md` P-W04-01) |

---

## 4. Acceptance matrix

```
python3 tools/writer-acceptance-matrix.py --workspace W04 --run-proofs \
  --candidate "WORKTREE_VARIANT:c82cec63cb5f" \
  --commit "891c1e563e741b8f0f7f610db0c4082ebe2cfb34" \
  --tree "c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f"
```

**exit 0 · `zero_loss: true` · 1445 / 1445 rows dispositioned**

| status | rows |
|---|---:|
| `PASS` | **1427** |
| `NOT_APPLICABLE_WITH_PROOF` | **13** (4 `VISUAL_REFERENCE` · 4 `AUTHORITY_RECOVERY_ARCHAEOLOGY` · 5 reconciled historical guardrails) |
| `BLOCKED` | **5** — all named **Q-5** |
| `FAIL` | **0** |

Partition is disjoint and total (unmatched 0, multi-match 0). All 14 declared proofs measured **PASS**.

---

## 5. F-051 counting proof (packet §10 (b))

`node tools/w04-f051-counting-proof.mjs` → `writer-output/W04/F051_COUNTING_PROOF.json` — **11/11 PASS**, bound to
`executedSourceTreeSha256` + `commit` + `tree` + `command` at run time.

* **A — real census** of `writer-output/W04/evidence/`: **97 named files → 18 unique SHA-256 byte identities**.
  Published evidence count = **18** (the identity count), *not* 97. Using names would have overcounted by **79**.
* **B — falsification of the counting law**: the same counter is fed an explicitly labelled
  `SYNTHETIC_COUNTER_FALSIFICATION_INPUT__NOT_REAL_EVIDENCE` manifest shaped exactly like the historical
  finding (18 names, 17 unique digests, duplicate pair `8cabdca5…`) and reports **17**, never 18.
* **C — product receipt ledger**: a real run of `dist/adapters/evidence/domain.js` produced
  **4 receipts for 4 successful mutating operations**, 4 unique receipt identities, 4 unique sequences,
  all owned by `W04EvidenceDomain`; the refused Admission (`SOURCE_VERIFICATION_REQUIRED`) emitted
  **0** receipts; 3 records → 3 unique record identities.

Browser-side regression: flow `evidence.receipt-count-truth-f051` (11 assertions) proves the same law
in the live route — receipt count == unique identity count == exact mutation count, visible named rows
== unique record ids.

---

## 6. Browser flows (packet §9)

`writer-output/W04/BROWSER_RECEIPT.json` — Chromium (Playwright package-local) 1.62.1, `localhost-http`
via `tools/serve.mjs`, Node 22.16.0, viewport 1440×980, reducedMotion.

| Flow | Status | failureClassification | Assertions | Shots |
|---|---|---|---:|---:|
| `evidence.create-attest-verify-lifecycle` | **PASS** | — (`null`) | 19 | 4 |
| `reviews.flow-and-verdict-recording` | **PASS** | — | 20 | 3 |
| `mastery.progression-state-machine` | **PASS** | — | 15 | 3 |
| `portfolio.assembly-and-export` | **PASS** | — | 16 | 3 |
| `evidence.receipt-count-truth-f051` | **PASS** | — | 11 | 1 |

Every record carries all `browser_contract.md` §1 fields: `browser`, `browserVersion`, `transport/runtime`,
`candidate`, `commit`, `tree`, `environment`, `route`, `flow`, `preconditions`, `actionSequence`,
`expectedState`, `assertions`, `screenshots`, `evidenceLineage`, `fixtureState`, `negativeCases`,
`failureClassification`.

**L07 consumer taxonomy is declared per flow** (`consumerTaxonomy`): a `primaryLiveOperationalConsumer`
(the live W04 domain executed in the mounted page), a `recordedConsumer` (the DOM projection), and
`fixture` (everything this harness seeded — labelled `SYNTHETIC_DEMO_SEED`, fixture admission authority,
fixture reviewer registration). No fixture row is ever presented as a real consumer or a real achievement.

**Screenshots:** `writer-output/W04/evidence/<flow>-<YYYYMMDDTHHMMSSZ>-c82cec63.png`; every file is
indexed in `BROWSER_RECEIPT.json#evidenceArtifacts` **and** in `EVIDENCE_INDEX.json` → **0 orphan screenshots**.
Superseded intermediate attempts are retained and labelled, never deleted.

**Lineage:** `evidenceLineage.lineageStatus = DIVERGED_FROM_DISPATCH_BASELINE_BY_WRITER_DELTAS` — the
receipt recomputes and binds the *executed* worktree identity (`tools/source-tree-identity.mjs`,
`path\0size\0sha256\n`) and records the dispatch baseline alongside it. It is never presented as the
canonical `480dbe…/273` identity.

---

## 7. Blockers / STOP-REPORT

1. **CG2 shared-family test FAIL — cross-workspace (W02 / Controller).**
   `assert.equal(count('VirtualizationOwner'),0)` sees 2 hits, both
   `universalVirtualizationOwner:false` in `adapters/visualize/domain.ts` and `surfaces/visualize/surface.ts`.
   Both files and the CG2 test are byte-identical to HEAD `d3ddc5e` → **pre-existing at baseline**.
   Neither file nor test is in W04's ownership list. Classification: **ORACLE** (the rule counts a
   *negating* flag name as an owner declaration). → `PROPOSALS.md` **P-W04-02**.
2. **`npm run check` exit 1 — shared browser artifacts.** `browser.lineage_receipt_truthful`
   (`assurance/BROWSER_CONFORMANCE_RECEIPT.json`: 6 flows, 1 PASS / 5 FAIL) and
   `browser.targeted_visual_evidence` (`assurance/SCREENSHOT_MANIFEST.json`: `1 … class=legacy`).
   Neither file is W04-owned; W04's own browser evidence is workspace-scoped by design (packet §16).
   → **P-W04-03**.
3. **`tools/c2-w04-truth/falsify-w04-truth.mjs` 4/9 — contradiction with the PASSING D10 suite.**
   Two of its expectations are directly opposed by a currently green W04 proof
   (D10 test 3 requires the import the falsifier wants rejected), and one would require weakening the
   reviewer-authority gate that the packet's no-self-approval law depends on. W04 changed neither side.
   → **P-W04-01** (STOP/REPORT).
4. **Q-5 Portfolio grouping authority** remains an open Owner question. The 5 affected rows are
   `BLOCKED` with **Q-5** named; the product refuses grouping with `AUTHORITY_DECISION_REQUIRED`
   (proven by the `portfolio.assembly-and-export` flow). No implementation was written.

---

## 8. Integration impact

* **MEDIUM merge risk, as the packet predicted.** My only non-test product change is
  `stack/native-typescript/surfaces/reviews/index.ts` (adds `toolbarCommandIds`, splits `commands`
  from `commandBus` on the returned surface object). Consumers: `surfaces/composition/w04-rescue.ts`
  (spreads the object) and `surfaces/m0-controller-composition.ts` (reads `surface.toolbarCommandIds`
  first — this is exactly what un-breaks the reviews route). `falsify-w04-truth.mjs` check
  `default-composition-empty-and-command-complete` now passes because of it.
* No edits to `main.ts`, `m0-controller-composition.ts`, or any shared foundation file.
* No `dist/**` hand-edits; every rebuild ran under `tools/writer-serial.sh`.
* W04 evidence is workspace-scoped (`writer-output/W04/**`), so no collision with
  `assurance/SCREENSHOT_MANIFEST.json` / `BROWSER_CONFORMANCE_RECEIPT.json`.
* `tools/w04-browser-flows.mjs` uses an ephemeral free port + `tools/serve.mjs`, so it cannot collide
  with `tools/browser-conformance.mjs` (port 43173) or another writer's runner.

---

## 9. STOP/REPORT conditions encountered

| Condition | Action taken |
|---|---|
| Q-5 Portfolio grouping authority | STOP → 5 rows `BLOCKED` with **Q-5**; refusal proven, no implementation |
| Falsifier ↔ D10 contract contradiction | STOP → `PROPOSALS.md` P-W04-01; no silent adjudication |
| CG2 failure outside ownership | REPORT → P-W04-02; no edit to visualize sources or the CG2 test |
| Shared `npm run check` browser failures | REPORT → P-W04-03; W04 evidence kept workspace-scoped |
| Any receipt whose lineage cannot bind a candidate | none — every receipt recomputes and binds `path\0size\0sha256\n` |

## 10. Filed

* `writer-output/W04/PROPOSALS.md` — 3 Controller adjudication requests (P-W04-01/02/03).
* **No `SERIALIZED_HOTSPOT_REQUEST.md`** — neither serialized hotspot was needed.
