# W04 PROPOSALS — Controller adjudication requests (no code change made)

W04 filed **no registry, profile or contract edits**. The three items below are unresolved
authority/contract questions that a Writer must not decide silently (W04 packet §6, §17;
`controller/03_historical/open_questions.md` standing rule).

---

## P-W04-01 · `falsify-w04-truth.mjs` contradicts the passing D10 suite — **STOP/REPORT**

`tools/c2-w04-truth/falsify-w04-truth.mjs` (W04-owned, mission CORR02 `C2_W04_PRODUCT_DATA_ACTION_TRUTH`)
measures **4 PASS / 5 FAIL** at this candidate. W04 did **not** change evidence-import or review-authority
semantics to force it green, because two of its expectations conflict with currently **PASSING** W04 proofs:

| Check | Falsifier expects | Current product + passing proof | Conflict |
|---|---|---|---|
| `evidence-presentation-assertions-rejected` | `importEvidence({…digest,sourceBytesAvailable,schemaValid,producerIdentity})` **rejected** with `VERIFICATION_ASSERTION_REQUIRES_PROVIDER_ENVELOPE` | `dist/tests/post-c03/D10/d10-w04-authority-lifecycle-tests.ts` asserts the *same shape* import returns `cand.ok === true` (test 3) | **direct contradiction** — same input, opposite required verdict |
| `review-finding-requires-explicit-content` | `FINDING_INPUT_REQUIRED` reported **before** the authority gate | `adapters/reviews/domain.ts` runs `authorityFailure()` first → `REVIEWER_AUTHORITY_UNAVAILABLE` | ordering only; no mutation either way |
| `review-decision-vocabulary-and-input-truth` | invalid outcome → `DECISION_OUTCOME_INVALID`, then **valid** decision → `ok:true` | without a bound `ReviewAuthorityRegistry` the second call returns `REVIEWER_AUTHORITY_UNAVAILABLE` | fixing it would **weaken the sole-Controller/Owner review law** (packet §11 "reviews must not self-approve") |
| `evidence-unverified-candidate-truth` | `sourceBytesAvailable:null`, `schemaValid:null` when UNVERIFIED | product records `false` (unknown-vs-false) | semantic, no test conflict found |
| `evidence-verified-assertion-requires-bound-provider` | a self-declared `{providerId,proofRef}` VERIFIED envelope must be refused | product currently accepts it | **likely a real gap**, but changing it is an evidence-import contract change |

**Requested:** Controller adjudication of which artifact is authoritative (C2 falsifier vs D10 suite),
then a single bounded correction pass. W04 did not pick an answer.
Already closed in this run: `default-composition-empty-and-command-complete` now passes because
`surfaces/reviews/index.ts` exposes the command **id list** separately from the command bus.

---

## P-W04-02 · `CG2_SHARED_FAMILIES_COVERAGE` failure is outside W04 ownership — **cross-workspace**

`node dist/tests/rescue/CG2_SHARED_FAMILIES_COVERAGE/shared-family-coverage.test.js` → **FAIL**
(6 tests, 1 fail): `assert.equal(count('VirtualizationOwner'), 0)` sees **2** occurrences.

Both are in READ-ONLY-for-W04 source, byte-identical to HEAD `d3ddc5e` (pre-existing at baseline):

* `stack/native-typescript/adapters/visualize/domain.ts` — `universalVirtualizationOwner:false`
* `stack/native-typescript/surfaces/visualize/surface.ts` — `universalVirtualizationOwner:false`

The occurrences are *negations* (`…:false`), so this reads as an **ORACLE** defect in the test's
substring rule, not a product owner. Neither the test file nor the visualize sources are in W04's
ownership list (W02 owns `surfaces/visualize/**` and is in flight).

**Requested:** Controller re-rules the CG2 assertion (e.g. count *owner declarations*, not the
substring) or routes the rename to W02. W04 did not touch either file.

---

## P-W04-03 · `npm run check` fails on SHARED browser artifacts — **not W04's**

`tools/writer-serial.sh npm run check` → **exit 1**, on two `browser.*` assertions over artifacts
W04 does not own:

* `browser.lineage_receipt_truthful` — `assurance/BROWSER_CONFORMANCE_RECEIPT.json` is
  `6 flows, 1 PASS / 5 FAIL, executionStatus BLOCKED_OR_FAILED`
* `browser.targeted_visual_evidence` — `assurance/SCREENSHOT_MANIFEST.json` → `1 hash-bound screenshots; class=legacy`

W04's own browser evidence lives in `writer-output/W04/BROWSER_RECEIPT.json` (5/5 PASS) precisely so
that workspace-scoped evidence avoids this shared-resource collision (packet §16).

**Requested:** Controller rebind/re-run the shared 6-flow suite; do not attribute its 5 failures to W04.

---

## Not filed

* **No `SERIALIZED_HOTSPOT_REQUEST.md`** — `stack/native-typescript/main.ts` and
  `stack/native-typescript/surfaces/m0-controller-composition.ts` were never edited; the reviews-route
  mount defect was fixed inside `surfaces/reviews/index.ts`.
* **No registry / profile / contract changes.**

---

## P-W04-04 · falsifier ↔ shared D3 bottom-shelf fix — **truth-law conflict created in parallel**

`node tools/c2-w04-truth/falsify-w04-truth.mjs` check **`composition-static-negative-falsification`**
now FAILs (the run went 4/9 → 3/9 for this reason only). The check asserts that
`stack/native-typescript/surfaces/m0-controller-composition.ts` does **not** contain `.slice(0,3)`
(a historical *truncation* defect). The shared-component owner's D3 bottom-shelf fix introduced
`bottomValueSummary` with `value.slice(0,3)` to summarise deep-projection values inside the shelf title.

Both readings are defensible: the original defect truncated **displayed content**; the new use
summarises a **label**. W04 did not adjudicate either way and changed neither side — weakening a
truth-law falsifier from a surface Writer would be exactly the silent adjudication the packet forbids.

**Requested:** Controller/Owner rule whether `bottomValueSummary`'s label summarisation is inside the
falsifier's scope (and if so, whether the check should be narrowed to *content* paths) — or route the
`m0` hunk back to the shared-component owner for a summarisation that needs no slice.

**Note:** this check is the only W04-owned tool that moved from PASS to FAIL this round; every other
W04 proof is green (`npm test` 210/0 · browser flows 5/5 · seam proof 14/14 · F-051 11/11 ·
`w04-reaudit-proofs` 86/86 · `presentation.test.js` PASS).

---

## P-W04-05 · P3 (`portfolio.curate` label) closed WITHOUT a serialized hotspot — for the record

The visual re-audit's **P3** wanted `portfolio.curate` relabelled; the label lives in
`m0-controller-composition.ts#registerW04SurfaceCommands`, which W04 may not edit. Instead of filing a
hotspot, W04 registers the same command id with the same domain owner (`PORTFOLIO_DOMAIN_OWNER`) on the
**canonical `SemanticCommandBus` inside `createW04RescueComposition`**, which the controller runs
*before* `registerW04SurfaceCommands`. The controller's `reg()` therefore sees an already-owned command
with a matching owner and yields. Behaviour is unchanged for the existing payload (`id` → remove);
`action:'add'`/`member` routes to the domain's reference-only `add`.

**Requested:** Controller confirms this ordering (composition before command registration) as an
accepted surface-owned registration point, or moves the label into the profile and I will drop the
registration. Proof: `writer-output/W04/reaudit-evidence/REAUDIT_PROOFS.json#P3.portfolio.curate-label`.

---

## Not filed

* **No `SERIALIZED_HOTSPOT_REQUEST.md`** — `stack/native-typescript/main.ts` and
  `stack/native-typescript/surfaces/m0-controller-composition.ts` were never edited; the reviews-route
  mount defect was fixed inside `surfaces/reviews/index.ts`, **P3** inside `w04-rescue.ts` (P-W04-05),
  and **D3** was already being fixed in parallel by the shared-component owner — W04's contribution is
  that `surface.bottom` / `surface.bottomProjection` are authored and wired as its binding source.
* **No registry / profile / contract changes.**
