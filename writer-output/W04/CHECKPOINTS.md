# W04 CHECKPOINTS — Evidence · Reviews · Mastery · Portfolio

Workspace: **W04** · Writer: W04 complete-workspace writer · Packet: `controller/09_writer_forge/W04_writer_packet.md`
Dispatch baseline: branch `writer/mi-serial`, HEAD `d3ddc5e`, candidate `WORKTREE_VARIANT:c82cec63cb5f`
(`c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f`, 287 files)
HEAD at last matrix run: `891c1e563e741b8f0f7f610db0c4082ebe2cfb34` (Coordinator commits advanced during parallel execution)

Status vocabulary: `PASS · FAIL · BLOCKED · NOT_APPLICABLE_WITH_PROOF`.

---

## CKPT-A — baseline verified · **PASS**

Artifact: `writer-output/W04/BASELINE_PROOF_RESULTS.json`

| Proof (command) | Baseline result | Measured by |
|---|---|---|
| `node dist/tests/surfaces/evidence/domain.test.js` | **FAIL** `EVIDENCE_UNKNOWN:ev-alpha` | W04 writer, pre-edit |
| `node dist/tests/surfaces/mastery/domain.test.js` | **FAIL** `MASTERY_UNKNOWN:mastery-crypto` | W04 writer, pre-edit |
| `node dist/tests/surfaces/reviews/domain.test.js` | **FAIL** `REVIEW_UNKNOWN:review-1` | W04 writer, pre-edit |
| `node dist/tests/surfaces/portfolio/domain.test.js` | **FAIL** `PORTFOLIO_MEMBER_UNKNOWN:member-1` | W04 writer, pre-edit |
| `node dist/tests/rescue/CG2_SHARED_FAMILIES_COVERAGE/shared-family-coverage.test.js` | **FAIL** 6 tests / 1 fail (`count('VirtualizationOwner') 2 !== 0`) | W04 writer, pre-edit **and** post-edit |
| `dist/tests/rescue/S14_*`, `S15_*`, `tests/post-c03/D10/*`, `w4-g-epistemic-confirmation-tests.js` | PASS | dispatch brief, re-verified post-change |
| `npm test` | PASS 210 / 0 | dispatch brief, re-verified post-change |
| `npm run check` | **FAIL exit 1** — 2 `browser.*` failures over the SHARED receipt | dispatch brief, re-verified post-change |
| `npm run browser:test` | not run by W04 (shared 6-flow suite, W04 flows absent) | dispatch brief |

Baseline failures are preserved verbatim; no historical failure was deleted because a later rerun went green.

---

## CKPT-B — implementation stable · **PASS**

The four W04 surface domain failures were closed by fixing the `.ts` sources (never `dist/`):

| File | Change |
|---|---|
| `stack/native-typescript/tests/surfaces/evidence/domain.test.ts` | inject `createW04EvidenceDemoRecords()` + bound `admissionAuthorityRegistry`; assert default-EMPTY invariant |
| `stack/native-typescript/tests/surfaces/mastery/domain.test.ts` | inject `createW04MasteryDemoRecords()` on **both** domain instances; assert default-EMPTY invariant |
| `stack/native-typescript/tests/surfaces/reviews/domain.test.ts` | inject `createW04ReviewDemoRecords()` + `allowTestAuthority:true`; assert default-EMPTY invariant |
| `stack/native-typescript/tests/surfaces/portfolio/domain.test.ts` | inject `createW04PortfolioDemoRecords()`; assert default-EMPTY invariant |
| `stack/native-typescript/surfaces/reviews/index.ts` | **product fix** — expose `toolbarCommandIds` + id-list `commands` (and keep the bus on `commandBus`) |

Root cause (shared): the default W04 domain is **required** to be empty
(`tools/c2-w04-truth/falsify-w04-truth.mjs` check `normal-defaults-empty`, also asserted by
`tests/post-c03/LCORR01`), so a surface test that constructs `new W04XDomain()` without the explicit
fixture factory throws on the first lookup. Rejected the alternative (seeding the constructor) because
it would have broken that truth law.

Product defect found and closed while preparing the browser flows: the `/ ?surface=reviews` route
**did not mount at all** — `mountW04Group` passed the semantic command **bus object** into
`WorkspaceFoundation.toolbar()`, which does `new Set(commands)` → `TypeError: object is not iterable`.
Fixed inside W04 ownership (`surfaces/reviews/index.ts`), no serialized hotspot required.

Packet §10 acceptance:
* **(b) F-051 closed with a counting proof bound to the exact candidate** — `writer-output/W04/F051_COUNTING_PROOF.json`, 11/11 checks PASS, executed against the recomputed worktree identity + commit + tree.
* **(c) evidence/mastery state machines match CEP-DEC-026 (A03 model)** — `P-EVIDENCE-SURFACE`, `P-MASTERY-SURFACE`, `P-S14`, `P-S15`, `P-D10`, `P-W4G`, `P-CG5` all PASS, plus the `mastery.progression-state-machine` browser flow.
* **(d) w04-seam single-owner invariant holds** — `writer-output/W04/SEAM_OWNERSHIP_PROOF.json`, 14/14 checks PASS.
* **(e) portfolio exports reproducible** — `portfolio.assembly-and-export` browser flow: two exports are byte-identical, `canonicalPublication=false`, no canonical Evidence copy.
* **(f) evidence bound exactly** — every artifact hashed and bound in `writer-output/W04/EVIDENCE_INDEX.json`.

**Post-change measured result: 4/4 surface domain tests PASS.**

---

## CKPT-C — requirement coverage · **PASS**

`writer-output/W04/PROOF_CATALOG.json` — disjoint total partition of **all 1,445 rows**:

| Rule | Rows | Status |
|---|---:|---|
| `R-EVIDENCE-SURFACE` | 377 | derived_from_proof (10 proofs, logic `all`) |
| `R-REVIEWS-SURFACE` | 351 | derived_from_proof (7 proofs, logic `all`) |
| `R-PORTFOLIO-SURFACE` | 350 | derived_from_proof (7 proofs, logic `all`) |
| `R-MASTERY-SURFACE` | 349 | derived_from_proof (8 proofs, logic `all`) |
| `R-HISTORICAL-GUARDRAIL-NOT-CURRENT-LAW` | 5 | `NOT_APPLICABLE_WITH_PROOF` |
| `R-Q5-GROUPING-AUTHORITY-BLOCKED` | 5 | `BLOCKED` — **Q-5** |
| `R-ARCHAEOLOGY-NOT-LAW` | 4 | `NOT_APPLICABLE_WITH_PROOF` |
| `R-VISUAL-REFERENCE-NOT-LAW` | 4 | `NOT_APPLICABLE_WITH_PROOF` |
| **total** | **1445** | unmatched 0 · multi-match 0 |

Command (exit 0, `zero_loss: true`):

```
python3 tools/writer-acceptance-matrix.py --workspace W04 --run-proofs \
  --candidate "WORKTREE_VARIANT:c82cec63cb5f" \
  --commit "891c1e563e741b8f0f7f610db0c4082ebe2cfb34" \
  --tree "c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f"
```

Result: **PASS 1427 · NOT_APPLICABLE_WITH_PROOF 13 · BLOCKED 5 · FAIL 0** · `zero_loss: true`.

All 14 measured proofs PASS (`writer-output/W04/PROOF_RESULTS.json`).
Q-5 rows are **not** folded into a passing surface test — they stay `BLOCKED` with **Q-5** named.

---

## CKPT-D — browser / evidence · **PASS**

`node tools/w04-browser-flows.mjs` → `writer-output/W04/BROWSER_RECEIPT.json` — **5 flows, 5 PASS / 0 FAIL**

| Flow (packet §9) | Status | Assertions | Screenshots |
|---|---|---:|---:|
| `evidence.create-attest-verify-lifecycle` | PASS | 19 | 4 |
| `reviews.flow-and-verdict-recording` | PASS | 20 | 3 |
| `mastery.progression-state-machine` | PASS | 15 | 3 |
| `portfolio.assembly-and-export` | PASS | 16 | 3 |
| `evidence.receipt-count-truth-f051` | PASS | 11 | 1 |

Every record carries all `browser_contract.md` §1 fields plus a 7-class `failureClassification`
(`null` for PASS flows; `PRODUCT|HARNESS|ENVIRONMENT|ORACLE|EVIDENCE|LINEAGE|UNKNOWN` reserved for FAILs).
Screenshots: `writer-output/W04/evidence/<flow>-<YYYYMMDDTHHMMSSZ>-c82cec63.png`,
every one indexed in `BROWSER_RECEIPT.json#evidenceArtifacts` and in `EVIDENCE_INDEX.json` → **no orphan screenshots**.

Repaired within one bounded loop (no endless repair loop): assertion-expectation mismatches only —
no product regression was papered over and no flow was deleted after failing.

---

## CKPT-E — handoff · **PASS**

* `writer-output/W04/EVIDENCE_INDEX.json` — sha256 of every artifact, bound to candidate / commit / tree / flow.
* `writer-output/W04/CHECKPOINTS.md` — this file.
* `writer-output/W04/W04_HANDOFF.md` — full handoff: proof table, counts, blockers, integration impact.
* `writer-output/W04/PROPOSALS.md` — Controller adjudication requests (no registry/profile/contract edits made).
