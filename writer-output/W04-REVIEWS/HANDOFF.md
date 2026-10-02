# HANDOFF — W04-REVIEWS · lane REV-1

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Lane:** `REV-1` (Reviews · W04-REVIEWS) · **Writer:** ROUTE-MIMO-AGENT / mimo-v2.6-flash
**Status:** `NOT_OWNER_ACCEPTED` — sole Controller review required. Nothing here is acceptance.

---

## 1. CANDIDATE IDENTITY

| Field | Value |
|---|---|
| Branch | `writer/mi-serial-lane/REV-1` |
| Sealed parent commit | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` |
| Sealed parent tree | `f22c70ce9597f07a9cf9ecb9bbc2ecd361fc3684` |
| HEAD verification at entry | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` ✔ (`git status --porcelain` empty) |
| Environment | node `v22.16.0`, `npm ci` deps present, playwright package-local chromium `151.0.7922.34` |
| Reference | `cep-writer/references/visual/03_PROGRESS_AND_EVIDENCE/02_REVIEWS/Cybersecurity Evidence Review Dashboard.png` · `CURRENT_FINAL_REFERENCE` · sha256 `f1b915d50866e5bc69f61c9ac2042fc3cb6e0c3a277a8ad61e98e268e566de70` · 1505×1045 |

The candidate commit is the single commit produced on top of the sealed parent; its identity is
reported in the lane's final message. Every changed file hash is recorded in
`VISUAL_EXECUTION_REPORT.json → LINEAGE.changed_file_sha256`.

### Changed paths (exactly two, both inside the sealed writable root)

```
stack/native-typescript/surfaces/reviews/index.ts                 (+35 / -6)
stack/native-typescript/surfaces/reviews/presentation-surface.ts  (+25 / -6)
```

Nothing outside `stack/native-typescript/surfaces/reviews/`,
`stack/native-typescript/adapters/reviews/` and `writer-output/W04-REVIEWS/` was written.
`dist/`, `assurance/` and `stack/MEASURED_COMPARISON.json` were restored before commit (step 6).

---

## 2. SALVAGE INSPECTED AND PRESERVED (nothing restarted, reverted or deleted)

| Salvage item | State after this lane |
|---|---|
| `writer-output/W04-REVIEWS/LINEAGE.json` | preserved, appended — 12 → 23 entries, `baseline-rtl` entry untouched |
| `writer-output/W04-REVIEWS/baseline-rtl.receipt.json` | untouched |
| `captures/baseline-rtl-20260930T182651Z-e5a77b60.png` | untouched |
| `writer-output/W04-REVIEWS/capture.mjs` | reused as the capture-of-record, unmodified |
| app-boot i18n export repair (`REVIEW_STATE_TONE` / `reviewStateLabel` / `reviewDecisionLabel`) | **preserved** — `index.ts` line 4 `export {…} from './i18n.js'` unchanged; guarded by `I18N.re-exports-preserved-at-app-boot` |

---

## 3. WHAT WAS ACTUALLY WRONG (3 defects closed, all inside my root)

### REV1-D1 · V3 · RIGHT context lens was dead — `fill` never imported
`reviews/index.ts` called `fill()` in 5 places (`reviewIssuanceGate`, `reviewConflict`,
`reviewRationaleGap`, scope/criterion fields) but never imported it. `describeContextProvider`
caught the `ReferenceError` and returned `INVALID_DESCRIPTOR`, so the browser rendered the generic
*"No domain context lens is bound to this surface"* instead of the Review scope/authority/prior
lens. Introduced by rescue commit `c362799`.
**Fix:** one token added to the existing i18n import. The app-boot re-export line was not touched.
**Proved:** `S14 surface-contract` exit 1 → 0; browser RIGHT pane pre-fix vs post-fix captures.

### REV1-D2 · V3 · "Issue Decision" could never record a verdict
The governed-input form posts `{id, decision:{…}}`, but this surface registers `reviews.supersede`
**before** the controller composition gets a chance to, so the surface handler — which forwarded the
payload verbatim and expects a top-level `newDecision` — is the one that binds. With no top-level
`expectedDecisionId`, the domain compared `current(null) !== undefined` and returned
`STALE_EXPECTED_DECISION` for **every** verdict in **every** state.
**Evidence:** a real button click returned `Decision blocked: STALE_EXPECTED_DECISION`,
`recordUnchanged: true`, `receipts 5 → 5`.
**Fix:** `supersedeOpts()` payload-shape bridge. Availability and execution now read the *same*
normalized payload, so a verdict can never be enabled under one contract and executed under another.
**Proved:** same click now returns `Decision recorded with immutable lineage.`
`READY_FOR_DECISION → CLOSED` with `provenance.permissionProofRef` and `evidenceBasis` populated.

### REV1-D3 · V3 · The surface's presentation layer was never mounted
`presentation-surface.ts` exports `installReviewsPresentation` and documents *"Called once from
`composeReviewsSurface`"* — but **nothing imported it anywhere in the repo**. Consequence: the shared
W04 head rendered **Evidence** intake vocabulary (`All records / Submitted / Returned / Prepared /
Admitted`) on the *Review* surface, and pane + toolbar labels stayed English in an Arabic session.
**Fix:** wired it from `composeReviewsSurface`.

---

## 4. FOUR TRUTHS (reported separately, no cross-substitution)

### P — PRESENTATION
**CANDIDATE_LEVEL · L1/L2/L3 done · L4 NOT done.**
`RESPONSIVE_STATUS = PASS_1440x1000_AND_1024x900`.
1440×1000 → three panes `304 / 694 / 420`, `#bottomShelf` 1440×39.
1024×900 → `#rightPane` deliberately collapsed by shared `PaneResponsiveCore`
(`data-pane-mode=collapsed`, `hidden`, `inert`, `display:none`, `data-preferred-state=open`
preserved) → `304 / 709`. Reveal control `#rightLocalReveal` verified: collapsed → `overlay`,
width 420, zero page errors.
`horizontalOverflow = false` and `clipped = []` on **all** acceptance captures.
**Ceiling:** no L4 micro-detail pass against the reference was performed — no fidelity claim is made.

### B — BROWSER BEHAVIOUR
**PASS.** `npm run build:runtime` PASS · `npm test` **210/0** ·
`tools/w04-browser-flows.mjs --flow reviews.flow-and-verdict-recording` **PASS 5/5, 0 failed
assertions** (3 screenshots, `writer-output/W04/BROWSER_RECEIPT.json`) ·
`tests/surfaces/reviews/domain`, `S14 domain-lifecycle`, `S14 surface-contract`,
`S06 review-decision-family` (3/3), `CG5 w04-convergence` all exit 0.
**Ceiling:** 2 console errors remain on every capture — `net::ERR_CONNECTION_REFUSED` to
`http://127.0.0.1:4174/v1/capabilities` and `/v1/platform/input-direction`. That is the product's
local-runtime probe when no runtime is listening (this is also the state the flow passed in at
baseline). Not a Reviews-surface defect; owner is the read-only foundation bridge. Recorded below.

### C — CONTENT / LANGUAGE
**PASS_WITH_RECORDED_SHARED_RESIDUALS.**
Under AR the surface's own content is Arabic: queue segments (`كل المراجعات / مطلوبة / مفوّضة /
قيد المراجعة / جاهزة للقرار / مغلقة`), toolbar (`بدء المراجعة / إضافة نتيجة / مقارنة المراجعات /
إصدار القرار`), centre headings, RIGHT lens, collection column headers.
Zero Arabic literals exist outside `i18n.ts` in both writable roots.
`RTL_LTR_STATUS = PASS_WITH_RECORDED_SHARED_CHRESIDUALS` — remaining English-under-AR strings are
all in read-only shared code (see §7 hotspots).

### DP — DOMAIN / PROVIDER
**PASS.** `W04ReviewDomain` binds the injected shared `ReviewAuthorityRegistry`; **no** local
`new ReviewAuthorityRegistry()` outside the explicit `createTestReviewAuthorityRegistry` test
factory; `allowTestAuthority` never enabled on a product path. Live browser proof:
`window.CEPFoundation.sharedOwners.reviewAuthorityRegistry === m0Composition.group.reviews.domain.reviewAuthorityRegistry`
→ **`sameInstance: true`**. Authority failures stay fail-closed
(`REVIEWER_AUTHORITY_UNAVAILABLE`, `TEST_AUTHORITY_NOT_ALLOWED_IN_PRODUCT`,
`EVIDENCE_RESOLVER_UNBOUND`) and create nothing. `familyAdmissionClaim = false`,
`reviewDecisionPresentationStatus = CONCEPT_CONTRACT_ONLY` preserved.

---

## 5. TESTS + FALSIFICATION

| Gate | Result |
|---|---|
| `npm run build:runtime` | PASS (`pass: true`, 323 generated) |
| `npm test` | **210 / 0** |
| `npm test` ×2 (N5) | byte-identical apart from the `"date"` line — `diff = 0 lines` |
| `tests/surfaces/reviews/domain.test.js` | exit 0 |
| `S14 domain-lifecycle` | exit 0 |
| `S14 surface-contract` | exit 0 (**was exit 1 at baseline → D1**) |
| `S06 review-decision-family` | 3/3, exit 0 |
| `CG5 w04-convergence` | exit 0 |
| `tools/check-duplicate-mechanics.mjs` (N4) | exit 0 — no duplicate owner introduced |
| `tools/w04-browser-flows.mjs --flow reviews.flow-and-verdict-recording` | **PASS 5/5** |
| `writer-output/W04-REVIEWS/falsification.mjs` | **104 / 104** |
| `npm run check` | exit 1 with **exactly one** red: `browser.lineage_receipt_truthful` (4/6) — the 2 failures are the global Enterprise flows, **not** this lane's. Not faked green. |

### Falsification detail (`falsification.mjs`, exit 0)

* **N1** non-owned route refuses: `composeReviewsSurface` / `createReviewsCollectionAdapter` reject
  foreign domain owners (`REVIEWS_DOMAIN_REQUIRED`) and foreign compare owners
  (`CENTRAL_ANALYTICAL_COMPARE_REQUIRED`); the bus refuses a foreign claim on a reviews command id
  (`DUPLICATE_COMMAND_OWNER`); the reviews bus does not expose `evidence.admit`
  (`UNKNOWN_COMMAND`).
* **N2** boundary/invalid input: 14 refusal cases (unknown record, unknown action, empty finding
  text, criterion outside pinned scope, invalid finding outcome, out-of-scope without reason,
  duplicate finding id, illegal workflow state at construction, …) — **every one byte-identical
  state, zero receipts added, none reported `ok:true`**.
* **N3** prerequisites missing → unavailable, never fabricated: unbound evidence resolver,
  unbound authority registry, caller-supplied authority fields explicitly *not* authoritative,
  test-only authority refused in product mode, unregistered reviewer, compare without central owner,
  compare without provider — all refuse and create nothing.
* **N4** duplicate mechanics: clean (exit 0).
* **N5** two identical runs: `diff = 0` lines (date excluded).
* **PLUS — verdict receipt only on real state change:**
  * verdict refused while `IN_REVIEW` → `REVIEW_NOT_READY_FOR_DECISION`, decision unchanged,
    effective id unchanged, history unchanged, **0 supersede receipts**, state unchanged;
  * `ready` (a real change) → exactly +1 receipt;
  * stale CAS → `STALE_EXPECTED_DECISION`, no receipt, no decision;
  * invalid outcome → `DECISION_OUTCOME_INVALID`, no receipt, no decision;
  * `continue` (no-op) → `ok:true, mutated:false` and **no receipt**;
  * a real verdict → exactly 1 supersede receipt, `CLOSED`, history appended, prior retained;
  * second verdict on the CLOSED review → refused, history unchanged, supersede receipts stay 1;
  * a Finding on a CLOSED review → refused, decision never drifts;
  * **block B** (review carrying prior lineage `decision-17`): blank correction/basis reason →
    `SUPERSESSION_REASON_REQUIRED`, no receipt, no decision; a real supersession then succeeds with
    `supersedesDecisionRef = decision-17` and prior retained.
* **FORM regression guard:** the exact m0 form payload records a verdict through the registered
  command (`CLOSED`, 1 supersede receipt, provenance present); the same payload against a
  not-ready review is refused at availability with **no receipt and no fabricated decision**.

---

## 6. EVIDENCE (hash-bound to the candidate)

All six acceptance captures: `commit fe1bb98d`, `workingTreeDirty = reviews-roots-modified`,
`horizontalOverflow = false`, `clipped = []`, 0 page errors.

| capture | viewport | dir/lang | sha256 (16) | bytes |
|---|---|---|---|---|
| `accept-1440-ar-20261002T062110Z-fe1bb98d.png` | 1440×1000 | rtl/ar | `a29c0673f52c78e0` | 230154 |
| `accept-1440-en-20261002T062114Z-fe1bb98d.png` | 1440×1000 | ltr/en | `31666d2ae7d66962` | 263177 |
| `accept-1024-ar-20261002T062118Z-fe1bb98d.png` | 1024×900 | rtl/ar | `1bcf2c190d86b38c` | 147850 |
| `accept-1024-en-20261002T062123Z-fe1bb98d.png` | 1024×900 | ltr/en | `0f68b556ebe28bbb` | 165499 |
| `accept-verdict-1440-en-20261002T062128Z-fe1bb98d.png` | 1440×1000 | ltr/en (closed) | `a71d77f4ab78dbee` | 267159 |
| `accept-empty-1024-ar-20261002T062133Z-fe1bb98d.png` | 1024×900 | rtl/ar (empty) | `aac779185b7e5a00` | 147482 |

Before/after defect evidence: `pre-fix-right-lens-*` (RIGHT pane shows the generic fallback) →
`postfix-right-lens-*` (full lens, Arabic). Full image identity (path + sha256 + dims + bytes) is in
`LINEAGE.json` and `VISUAL_EXECUTION_REPORT.json → EVIDENCE`. Browser receipt:
`writer-output/W04/BROWSER_RECEIPT.json` (PASS 5/5).

Superseded captures from this lane (`responsive-*`, `resp-final-*`, `final-resp-*`,
`verdict-closed-*`) are **retained**, not deleted and not used as current proof.

---

## 7. UNRESOLVED FINDINGS + HOTSPOTS (record-only — outside my writable roots)

1. **SHARED-W04-SEAM · English-under-AR chrome.** `w04-rescue.ts` owns and hardcodes
   `W04_QUEUE.reviews.pane/ctxPane/note` and the `Settings · language & direction` foot, plus
   `w04SetPaneLabel`. These remain English in an Arabic session:
   `Review queue`, `Review context`, `Reviews workbench`, `1 Review in this session · Decisions stay
   immutable`, `Settings · language & direction`. **Do not localise from the surface** — see §7.4.
2. **FOUNDATION · pane edge toggles.** `foundation/accepted-runtime.ts syncPaneCSS()` writes
   `#leftLocalReveal/#rightLocalReveal [data-pane-toggle-label]` in hardcoded Arabic
   (`إخفاء البنية`/`فتح البنية`/`إخفاء السياق`/`فتح السياق`) regardless of locale. Same for the
   bottom-shelf closed summary in `foundation/global/bottom-shelf.ts`
   (`مغلق — افتحه للسجل أو المقارنة أو الاسترداد`) and the baked `dist/index.html` labels.
   Pre-existing, shared/shell-lane scope (matrix row 1 AD-02 / SH-2).
3. **FOUNDATION · unconsumed non-OK response body.**
   `foundation/contracts/platform-input-direction-bridge.ts` does `if (!res.ok) return null;`
   without draining the body. When a local runtime occupies the **fixed shared port 4174** and
   answers 503 `WINDOWS_PLATFORM_UNAVAILABLE`, Chromium never fires `loadingFinished`, so
   `tools/w04-browser-flows.mjs` (`waitUntil:'networkidle'`, line 152) times out with **0
   assertions recorded**. Verified environment-only: `library` and `today` fail identically, `load`
   completes in ~1.7s, and the flow **passes** whenever 4174 is free. A sibling lane's
   `local-runtime/server.mjs` (cwd `/workspaces/cep-lanes/BKP-1`) held 4174 from 05:17 to 06:02;
   the flow passed at 06:02 and again at 06:16 against final source. **I did not touch that
   process.**
4. **SHARED-W04-SEAM · mutation-observer collision (the reason for (1)).** `w04-rescue` observes
   `childList` and rewrites `#leftPane/#rightPane .phead h2` with English on every pass. A surface
   writing the localized value makes the two observers overwrite each other forever — measured
   starvation of the main thread inside ~4 s under AR with `page.goto` never reaching `load`.
   The two pane-title writes were removed from `projectChrome`; pane identity therefore stays on
   the shared value until that seam localises it. **This is the one thing that must not be
   re-added without a shared-component change.**
5. **REVIEWS_PRESENTATION_CSS withheld (in-root, not shipped).** A/B on one live page:
   stylesheet **on** → worst `.w04-record-table` cell 10 wrapped lines, 9/9 cells > 5 lines;
   **off** → 5 lines, 0/9. Installed with `applyStyle:false`. Needs its own reference-compared
   craft pass before it may be applied.
6. **Criterion Findings table is cramped (pre-existing, unchanged).** With the stylesheet off
   (= baseline rendering) at 1440×1000: table 342 px inside a `.78fr/1.22fr` split, criterion cell
   65 px → **4 line boxes** for `crit:v4#web-input`, evidence cell 104 px → **5 line boxes**
   (`Range.getClientRects`, max 5, `cellsOver5 = 0`). Not a regression from this lane; worth a
   dedicated layout pass.
7. **`m0-controller-composition.ts:230` fallback** `reviewAuthorityRegistry ||
   new ReviewAuthorityRegistry()` and **`w04-rescue.ts:64`** `reviewsDomain || new W04ReviewDomain(…)`.
   Both outside my roots. Proved **fail-closed**: an empty registry refuses every mutation
   (`REVIEWER_AUTHORITY_UNAVAILABLE`) and creates nothing; `main.ts` always injects the shared
   instance on the live route (`OWN.main-injects-shared-instance` PASS). Matrix row 1 already
   records this as H03 residual F01 / P-01. No edit made.
8. **Whitespace-only `correctionReason` on a *first* decision** is stored verbatim at domain level
   (`if (current && …)` skips the guard when `current` is null). The product path trims it, and two
   read-only tests (`LCORR01`) depend on a first decision being issuable **without** a reason, so
   requiring one would break them. Recorded only; `SUPERSESSION_REASON_REQUIRED` is enforced and
   proven for supersession (falsification block B).
9. **`L4` reference comparison not completed** — `VISUAL_COMPARISON_LEVELS_COMPLETED = L1/L2/L3`.

---

## 8. OWNER / STOP NOTES (record only, nothing decided)

- **No Owner decision was required and none was invented.** No authority conflict was found; nothing
  was edited under `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`,
  `dist-ts/**`, `tools/**`, `stack/native-typescript/foundation/**`, `surfaces/composition/**`,
  `surfaces/m0-controller-composition.ts`, `main.ts`, other lanes, `main` or `writer/mi-serial`.
- **No shared-seam write was attempted.** Items 1–4 and 7 above are shared-component/Owner-adjacent
  and were routed to this record instead of edited. If the Controller wants them closed, they need
  a serialized shared-component request, not a REV-1 edit.
- **STOP conditions checked:** no out-of-root write · no authority conflict · no false receipt
  (every receipt in the falsification is tied to a real state change; every refusal added zero
  receipts) · scope stayed at the sealed row (responsive/RTL evidence + shared Review-owner audit)
  · `browser.lineage_receipt_truthful` left red on purpose.
- **Self-acceptance:** not claimed. `ACCEPTANCE_STATUS = NOT_OWNER_ACCEPTED`.

---

## 9. VERIFICATION COMMANDS

```bash
npm run build:runtime
npm test                                   # 210/0
node writer-output/W04-REVIEWS/falsification.mjs      # 104/104, exit 0
node tools/check-duplicate-mechanics.mjs  # N4, exit 0
node tools/w04-browser-flows.mjs --flow reviews.flow-and-verdict-recording   # PASS 5/5 (4174 must be free)
node dist/tests/rescue/S14_W04_EVIDENCE_REVIEWS/surface-contract.test.js     # exit 0
node dist/tests/rescue/S06_SHARED_COLLECTION_AUDIT_REVIEW/review-decision-family.test.js
node dist/tests/rescue/CG5_W04_COVERAGE/w04-convergence.test.js
node writer-output/W04-REVIEWS/capture.mjs <name> <w> <h> <ar|en> <in-review|ready|closed|empty>
```
