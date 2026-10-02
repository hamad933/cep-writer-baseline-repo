# HANDOFF — W05-MANUAL-AI (surface `manual_ai`) — lane MAI-1 (lineage reconstruction + evidence clarification)

**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__EVIDENCE_CLARIFICATION_ADDITIVE` · **Lane:** `MAI-1` · **Branch:** `writer/mi-serial-lane/MAI-1` · **Recorded:** 2026-10-02
**Acceptance:** `NOT_OWNER_ACCEPTED` — sole Controller review required. Nothing in this lane accepts, promotes or closes the unit.
**Structure of this file:** §0–§6 below are the MAI-1 lane record (added 2026-10-02). Everything after the `--- PRESERVED` separator is the **original historical W05-MANUAL-AI HANDOFF, preserved byte-identical** (pre-image sha256 `47d0e90861aaefeda8712de2d119b0476bfb8ef65c407373d51b9529af559d9a`); no historical text was edited, reordered or removed.

---

## 0. LINEAGE FINDING (STEP 1 — first)

**TERMINAL_COMPLETE_PROVEN.** The historical interrupted Manual-AI Writer **reached terminal completion**; what was reconstructed later is only the **git custody** of that result (Controller checkpoint commits), **not the result content**. Matrix row 14 disposition flips to `NOWR` (audit-only) per the sealed rule "if lineage proves terminal-complete → STOP (audit-only)". MAI-1 therefore mutated **no product source**; its only writes are this lane record + one additive clarification block + a new lane evidence file.

Own-branch evidence (`git log -- writer-output/W05-MANUAL-AI stack/native-typescript/surfaces/manual_ai`, plus in-unit report/HANDOFF/audit.json/captures):

1. Five commits touch the unit: `44f922e` (2026-09-21 baseline init) → `a2b1d29` (2026-09-24 D03A) → `b87313c` (2026-09-29 W05 remediation checkpoint) → `f98eb46` (2026-09-30 18:44) → `4dbdcf7` (2026-09-30 19:13).
2. `f98eb46` committed the **interim** report with `_STAGE: "BUILD_COMPLETE__AUDIT_PENDING"`, `VISUAL_STATUS: "IN_PROGRESS"`, `RESPONSIVE/RTL_LTR/RECAPTURE/RECOMPARISON: PENDING`, `REGRESSION_STATUS: "PENDING"`, `EVIDENCE[...audit].status: "PENDING"` — plus `evidence/harness/audit.mjs` and the first `en-1536.png` capture (sha256 `899fa582…`).
3. `evidence/audit.json` records a **live run at 2026-09-30T19:05:46.777Z** at HEAD `d2b3e47` with `dirtyFiles: 5` (`domain-adapter · presentation · runtime · style · workbench`) — exactly the final report's `CURRENT_CANDIDATE.working_tree_files` — result **34/34 PASS**; the capture addendum ran at `19:06:25.216Z` and bound 9 further captures, all with commit/tree/viewport/timestamp.
4. `4dbdcf7` (19:13:15Z, subject *"checkpoint(quality): W05-MANUAL-AI reviewed; VD-008 decisive stale-frame proof"*) committed the **terminal artifacts 8 minutes after the last capture**: final report with every §12 field at a terminal value (`RECAPTURE_STATUS: COMPLETE`, `RECOMPARISON_STATUS: COMPLETE`, `REGRESSION_STATUS: 210 pass / 0 fail`, `ACCEPTANCE_STATUS: NOT_OWNER_ACCEPTED`), the complete historical HANDOFF (preserved below), `audit.json`, 23 pngs, the harness addendum — **and the surface source itself**.
5. **Anti-reconstruction test (passed):** a post-hoc reconstruction cannot explain (a) an interim report stage committed 29 minutes before the final one, in the same first-person writer voice; (b) `CURRENT_CANDIDATE.head_at_close: "d2b3e47 (Controller moved HEAD concurrently; earlier checkpoints f98eb46/b87313c already captured this surface's files)"`; (c) a dirty-file list that only a real working tree could produce; (d) citations in the final report that point at the writer's own **superseded** frames (i.e. the report was written while captures were still moving). Fabrication would have produced a self-consistent, byte-accurate report instead.
6. **Terminal ≠ accepted:** the unit closed with `NOT_OWNER_ACCEPTED` and two disclosed open items — `D-08 V1 EVIDENCE/ORACLE (REOPENED_AS_BLOCKER, vision verification OPEN)` and `D-10 V1 SHARED_COMPONENT (OPEN)` — reported truthfully by the writer, not hidden.

Both row-14 gap cells are now closed read-only: **lineage/result boundary** = terminal-complete proven (above); **"report RESPONSIVE/RTL PASS"** = backed by `audit.json` (`responsive.1280/1024/900/760` 4/4 PASS, `rtl.*` 5/5 PASS, `bidi.*` 2/2 PASS) with **23/23 capture bindings verified byte-for-byte against HEAD**.

## 1. Candidate identity (exact)

| Field | Value |
|---|---|
| Branch | `writer/mi-serial-lane/MAI-1` |
| HEAD (required + observed) | `fe1bb98ded51adc71a5f5fd14142a2c0880c11bc` |
| `HEAD^{tree}` | `f22c70ce9597f07a9cf9ecb9bbc2ecd361fc3684` |
| Runtime | node `v22.16.0`, deps pre-installed, status clean at session start |

## 2. Changed paths (this lane — exact, complete)

| Path | Change |
|---|---|
| `writer-output/W05-MANUAL-AI/HANDOFF.md` | prepended §0–§6; historical content preserved byte-identical (pre-image `47d0e908…`) |
| `writer-output/W05-MANUAL-AI/VISUAL_EXECUTION_REPORT.json` | **additive only**: `MAI_1_LINEAGE_CLARIFICATION`; the 24 original keys re-serialize byte-identically vs `git show HEAD:` (verified); pre-image sha256 `a6be9f343d5cf2f912626030527b4f9b95347d3371fd798073da2f6f8cd23321` |
| `writer-output/W05-MANUAL-AI/evidence/mai1-lane/lineage-hash-reconciliation.json` | new (computed reconciliation, lineage timeline, caveats) |
| `writer-output/W05-MANUAL-AI/evidence/mai1-lane/manual-ai-bridge-truthful-ceilings-ceilings-20261002T045119Z-c82cec63.png` | new (MAI-1 flow capture, sha256 `baa9d61266ba1b585059df6f0cc7b762c8784235b60bd119aa4c0ee5e89dfbc2`) |

**Zero** writes under `stack/**` (no product-source delta), and zero writes under `controller/ cep-writer/ contracts/ profiles/ authority/ dist-ts/`, other lanes, `main`, `writer/mi-serial`.

## 3. Tests + falsification

**Baseline / loop:** `npm run build:runtime` → pass (`CANONICAL_SOURCE_TO_GENERATED_ONLY`, 323 written, xterm vendor ok) · `npm test` → **210 pass / 0 fail** (run twice: identical id+status sequences = **N5**) · `npm run check` → exit 1 **solely** on the known red `browser.lineage_receipt_truthful` (4/6, 2 fail) expected by DAG §0 while the Enterprise defect is open — `browser.current_candidate_claim_truthful` PASS, `browser.targeted_visual_evidence` PASS, `model.required_regressions` 210/0 PASS; nothing red is attributable to `manual_ai`.
**Packet tests (compiled `dist/tests/**` from `stack/native-typescript/tests/**`):** `tests/surfaces/manual_ai` **12/12 PASS** · `S17_W05_VALIDATION_MANUAL_AI` **12/12 PASS** · `CG6_W05_COVERAGE` **6/6 + 3/3 PASS**.
**Flow:** `node tools/w05-browser-flows.mjs --flow manual-ai.bridge-truthful-ceilings` → **PASS** (`aggregate 8/8`, lineage `DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS`).

| Falsification | Result |
|---|---|
| **N1** non-owned-route mutation → must refuse | Harness side-effects outside lane roots (flow wrote `writer-output/W05/BROWSER_RECEIPT.json` + `.runtime-proof/*`; `npm test` wrote `assurance/MODEL_TEST_RESULTS.json`; build wrote `dist/*`) were **detected by `git status` and reverted** (`git checkout -- dist assurance stack/MEASURED_COMPARISON.json writer-output/W05`); the flow screenshot was moved into the lane root. Final `git status` shows changes under `writer-output/W05-MANUAL-AI/` only. |
| **N2** boundary/invalid input → no corruption/false receipt | `audit.json` (two concatenated JSON documents) parsed sequentially and left **byte-identical**; the absent `/tmp` baseline recorded as `BASELINE_PATH_ABSENT` (never substituted); abbreviated hashes count as match only on a true prefix (`MATCH_ABBREVIATED`, 1 case). |
| **N3** no prerequisite data → unavailable, never fabricated | Baseline capture `94f2f420` is unrecoverable → recorded absent; my flow run's shared-seam receipt was reverted → the run is recorded here truthfully instead of being left on a shared file; **D-08 vision verification left OPEN** — no visual claim was made or upgraded by this lane. |
| **N4** `node tools/check-duplicate-mechanics.mjs` | **PASS**, `findings: []`, 322 files scanned, exit 0 — no duplicate owner introduced (no source delta). |
| **N5** suite twice → identical | 210/0 both runs; id sequence and status sequence diffs empty. |
| **Ceilings stay false** | `adapters/manual_ai/domain-adapter.ts`: `automaticCanonicalPublication:false` (both `ceilings` and `diagnosticProjection`), `hiddenProviderCalls:0`, `importRequiresDeclaredExport:true`, `providerMode: MANUAL_ONLY_PROVIDER_NEUTRAL` — **unchanged** (no source write); asserted by `manual-ai.product-declares-no-auto-publication` (12/12 suite) and the flow PASS. |
| **Bridge shows no capability the provider lacks** | Export → `EXPORT_HELPER_UNAVAILABLE` (record stays `PREPARED / NOT_EXPORTED`); Accept → `DRAFT_SINK_UNAVAILABLE` (gate disabled **with the reason**); Import gated on an operator-declared response — all asserted by packet tests + flow; **no new capability introduced** (zero product-source delta). |

## 4. FOUR TRUTHS (separately)

- **P — Presentation:** historical verdict stands unverified-by-this-lane: `VISUAL_STATUS` "IMPROVED (V4 closed), D-08/D-10 open", L1–L4 claimed by the original writer. MAI-1 did **not** re-render or re-read pixels (`D-08 VISION_VERIFICATION_OPEN` remains). Status: `HISTORICAL_CLAIM__NOT_RE_VERIFIED__NOT_UPGRADED`.
- **B — Browser:** **PASS at this HEAD.** `manual-ai.bridge-truthful-ceilings` PASS; `audit.json`'s 34/34 run receipt retained; all 23 bound captures re-verified against the bytes committed at `fe1bb98`/`f22c70ce`.
- **C — Bilingual/contract:** claims **backed by bound receipts, not re-rendered**: `rtl.*` 5/5 PASS, `bidi.*` 2/2 PASS, `responsive.*` 4/4 PASS inside `audit.json`, with captures hash-bound (matrix row 14 C-cell was empty). Status: `RECEIPTS_VERIFIED__RENDER_NOT_REPEATED`.
- **DP — Domain/provider truth:** **PASS at this HEAD.** Ceilings false (`automaticCanonicalPublication=false`, `hiddenProviderCalls=0`, `MANUAL_ONLY_PROVIDER_NEUTRAL`), accept-fails-closed `DRAFT_SINK_UNAVAILABLE`, export truthful, provenance mismatch quarantined — 12/12 manual_ai + 12/12 S17 + 3/3 CG6 (manual-ai assertions) green.

## 5. Evidence

- `evidence/mai1-lane/lineage-hash-reconciliation.json` — computed, machine-readable: **22 report image citations → 10 `MATCH_FULL` + 1 `MATCH_ABBREVIATED` + 10 `MISMATCH` + 1 `BASELINE_PATH_ABSENT`**; `audit.json` **23/23 verified** (sha256 + size) at sha256 `c5d697ab073748c071ea39b9b9dddc78bb2ff44ec972f9bf872c7d1e13ca56da`; capture inventory (24 committed pngs); full commit timeline; finding + caveats.
- `evidence/audit.json` — **left byte-identical** (the historical harness was not re-run in place, so no evidence file was rewritten); 34/34 receipt, capture bindings all resolve.
- `evidence/mai1-lane/manual-ai-bridge-truthful-ceilings-*.png` — MAI-1's own flow capture, sha256 `baa9d612…`, bound to HEAD `fe1bb98` / tree `f22c70ce` / 2026-10-02T04:51Z.
- Provenance anchors: original HANDOFF pre-image `47d0e908…`; report pre-clarification `a6be9f34…`; both original documents preserved (report values re-serialization-identical).

## 6. Unresolved findings (record-only — no decision taken)

- **U-1 (EVIDENCE/ORACLE, V2-equivalent):** 9 report image citations do not resolve to bytes at HEAD (`en-stage`, `en-left-region` ×2, `ar-left-region`, `en-1280x860`, `en-1024x900`, `en-900x900`, `compact-secC`, `en-stage-bottom`, `en-1536`) — superseded pre-recapture frames overwritten by the 19:05:46Z re-capture before the checkpoint commit; only `en-1536`'s cited predecessor `899fa582` is retrievable (`git show f98eb46:writer-output/W05-MANUAL-AI/evidence/en-1536.png`); the other 8 frames and the `/tmp` baseline `94f2f420` are **not retrievable**. Clarified additively; `audit.json` bindings are the authoritative image identity.
- **U-2:** `D-08 / VD-008` vision verification **OPEN** → Controller-side independent full-frame re-verification (record-only; Owner/Controller item).
- **U-3:** `D-10` V1 `SHARED_COMPONENT` — bottom-shelf closed-state copy owned by shared `BottomDeepWorkOwner` (`m0-controller-composition.ts` / `bottom-shelf.ts` are writer-forbidden) → routed to the shared/shell lane request path, **not patched here**.
- **U-4:** `evidence/audit.json` is **two concatenated JSON documents** (run audit + capture addendum), so it is not parseable as one JSON document; left byte-identical rather than rewritten (rewriting would falsify provenance).
- **U-5:** matrix row 14 records "26 pngs"; 24 are committed. Explanation (24 + absent `/tmp` baseline + superseded pre-recapture `en-1536` = 26 distinct referenced images) recorded as `EXPLANATION_CONSISTENT_NOT_PROVEN`.
- **U-6:** historical HANDOFF says "1 157 Arabic glyphs" while `audit.json` records `arabicGlyphs: 1253` — workbench-vs-document scope difference is plausible but was **not** re-measured by this lane.
- **U-7:** `npm run check` known red `browser.lineage_receipt_truthful` (4/6) is the DAG-§0 expected guard while the Enterprise defect is open — not mine, not masked.

---

### --- PRESERVED ORIGINAL HANDOFF (byte-identical below this line; pre-image sha256 `47d0e90861aaefeda8712de2d119b0476bfb8ef65c407373d51b9529af559d9a`) ---

# HANDOFF — W05-MANUAL-AI (surface `manual_ai`)

**Unit:** `W05-MANUAL-AI` · **Branch:** `writer/mi-serial` · **Base commit:** `e2a915e` (+ uncommitted delta)
**Reference:** `cep-writer/references/visual/04_SYSTEM_AND_OPERATIONS/04_AI_BRIDGE/CEP_SYSTEM_AI_BRIDGE_REFERENCE.png` — `OWNER_CONFIRMED_FINAL_REFERENCE` (`ae1d8df7230c9719`, 1525×1031, 1 500 124 B, verified this session against `cep-writer/REFERENCE_MANIFEST.json`)
**Acceptance:** `NOT_OWNER_ACCEPTED` — sole Controller review required. Machine-readable report: [`VISUAL_EXECUTION_REPORT.json`](./VISUAL_EXECUTION_REPORT.json).

---

## 1. What this workspace is for

**A governed, human-in-the-loop bridge to external AI.** The reviewer prepares an explicit packet from a *declared* source revision, carries it out of CEP by hand, imports the response, **proves provenance equality**, and only then decides. CEP never calls a provider and never publishes canonically.

That identity — *human authority over AI output* — is what the composition is built around. Every stage of the exchange, every provenance check and every disposition is visible, labelled and inspectable; nothing completes silently.

Reference read before code (R8 / §15). Its authority was taken as **composition, IA, hierarchy, spatial relationships, pane organization, density/rhythm, interaction language, visual emphasis and responsive intent** — explicitly *not* as a pixel copy and *not* as a product-language authority (the reference is Arabic; the product language stays user-configurable).

## 2. The starting point and why it was rejected

The baseline (`/tmp/opencode/w05-manual-ai/baseline/en-1536.png`, sha256 `94f2f420…`) rendered the **shared generic typed-collection workbench**: header *"Manual Ai workbench"*, a bare 2-column table in LEFT, a flat key/value semantic projection in CENTER, a generic context inspector in RIGHT, an English-only toolbar inside an Arabic UI, and no exchange model anywhere. That is a `V4` surface-identity failure — the surface had no answer to *"what is this workspace for?"*.

## 3. What was built (surface-owned only)

| File | Role |
|---|---|
| `surfaces/manual_ai/runtime.ts` | view state + **presentation governor** (MutationObserver · ownership marks `data-ma-owned="manual_ai"` · 16/300 ms burst guard · domain-state signature · capture-phase command hook) |
| `surfaces/manual_ai/workbench.ts` | CENTER: the **A…E adjudication workbench** |
| `surfaces/manual_ai/panes.ts` | LEFT record list + RIGHT governance context + bottom projection |
| `surfaces/manual_ai/presentation.ts` | bilingual copy, state/facet/step models, icon set, token helpers |
| `surfaces/manual_ai/style.ts` | the surface style sheet, scoped to `[data-ma-owned="manual_ai"]`, product tokens only |
| `surfaces/manual_ai/composition.ts` | fixtures + composition wiring (still `assertCanonicalSemanticCommandBus`) |
| `adapters/manual_ai/domain-adapter.ts` | additive truth: `inspect().provenanceMatch`, `inspect().dispositionReadiness`, `availability('manual_ai.import')` honours `requireResponse` |

**Center follows the reference's information architecture:** header (eyebrow · bilingual H1 · lead · four truth pills) →
**A. Request identity** · **B. Cleared external payload** (icon rows: source unit, files, scope, clearance verdict, export artifact, packet envelope) · **C. Exchange state** (7-step stepper *DRAFT → CLEARED → EXPORTED → AWAITING_RESPONSE → RESPONSE_IMPORTED → PROVENANCE_EQUALITY → HUMAN_DISPOSITION* + current-state / equality / last-update bar) · **D. Response intake** (response status, acquisition, linked request, four equality chips, operator response field) · **E. Human decision gate** (three governance statements, review readiness, five disposition buttons) → record-basis footnote.

**LEFT** = *Bridge records / سجلات الجسر*: 8 facets with **real** counts + search + record cards (id · time · title · state pill · source revision).
**RIGHT** = *Governance context / سياق الحوكمة*: 9 cards — assisted analysis only · no hidden provider call · source authority · acceptance conditions · sensitive data · a response is not a decision · human decision required · next action · record basis.
**Bottom** = the reference's collapsible *Temporary workspace* (cleared payload · imported response · declared digests · equality result).
**Toolbar** = single global action home (Prepare · Export · Import · Settings, fully localised); the five **dispositions live in E**, where the reviewer sees the evidence they decide on.

Architecture: **SHARED MECHANICS** (SemanticCommandBus, WorkspaceFoundation regions/toolbar/banner, BottomDeepWorkOwner) **+ SURFACE-SPECIFIC COMPOSITION + SURFACE-SPECIFIC PRESENTATION**. No file outside my writable roots was touched; `surfaces/m0-controller-composition.ts` and `main.ts` are writer-forbidden and needed no hunk (governor pattern proven by W05-CONFIGURATION), so **no shared-seam request was filed**.

## 4. Truth discipline (no fabricated success)

- **Export** has no helper bound → reports `EXPORT_HELPER_UNAVAILABLE`; the record stays `PREPARED / NOT_EXPORTED`. Verified, not faked.
- **Import** is gated by `requireResponse` → the toolbar button is *disabled with the reason* "Paste the external response into the intake field first" until the operator declares a response. Then it produces a provenance-equal `IMPORTED` state.
- **Accept** needs a working-draft sink this build does not bind → `DRAFT_SINK_UNAVAILABLE`. Section E disables Accept and *says why*; the other four dispositions work. No draft-creation receipt is invented.
- **Prepare** uses `NEXT_REQUEST_DECLARATION`, a declared source that is part of the representative fixture set — no source revision is invented.
- Fixtures carry `RECORD_BASIS` and it is displayed in the UI: representative records modelled on the reference, **no real external exchange occurred**.

## 5. Verification

| Gate | Result |
|---|---|
| `evidence/harness/audit.mjs` | **34 / 34 PASS** — functional (facet, selection, search+focus, disposition, export-truth, import gate, prepare), structural (owned-not-generic, A…E, 8 records/8 facets, 9 cards, 7 steps, single action home, banner identity), responsive ×4, RTL ×2, BIDI round-trip |
| `evidence/harness/capture-addendum.mjs` | 8 region captures (L1 EN/AR, sections A/C/D/E, compact) hash-bound into `evidence/audit.json` |
| `npm test` | **210 pass / 0 fail** (manual_ai, S17, D03A, D11, CG6 lanes) |
| `npm run check` | exits 1 on three **pre-existing** browser-receipt lineage checks (`browser.lineage_receipt_truthful`, `browser.current_candidate_claim_truthful`, `browser.targeted_visual_evidence`) already documented as red in `controller/12_execution/04_hotspot_register.md` because the tree is moving under concurrent remediation; `model.required_regressions` **210/0 PASS**. Nothing attributable to `manual_ai`. |
| Evidence integrity | every capture bound to sha256 + dims + bytes + commit + tree + viewport + timestamp |

**Responsive:** 1536 · 1280 · 1024 · 900 · 760 — no document overflow, no section overflow, actions always visible, stepper reflows 7 → 4 → 2 columns.
**RTL/LTR:** AR `lang=ar dir=rtl h1 direction=rtl`, 1 157 Arabic glyphs, all A…E present, pane geometry mirrored, toolbar fully Arabic, no overflow. EN ⇄ AR round-trip restores `Manual AI Bridge` as primary with Arabic mass < 60 % of the AR reading. 12+ `<bdi dir=ltr>` isolate every digest/ID/token.

## 6. Defects — 10 found (1×V4 · 3×V3 · 3×V2 · 3×V1), 8 ACCEPT, 1 reopened as evidence blocker, 1 open V1

Full list with root cause, change, evidence and re-comparison is in the report. The four that mattered most:

1. **V4** generic typed-collection workbench → reference-driven A…E adjudication workbench (`SURFACE_COMPOSITION`).
2. **V3** exchange stepper absent → 7-step stepper derived from domain truth (`SURFACE_COMPOSITION`).
3. **V3** placeholder records → 8 realistic bilingual records covering all 7 states (`CONTENT_MODEL`).
4. **V1** L4 token wrapping in the stepper → short display token + nowrap/ellipsis, re-captured and OCR-verified (`SURFACE_COMPOSITION`).

**Still open:**

- **D-08 · V1 · `EVIDENCE/ORACLE` — vision verification is OPEN.** Full-frame image reads returned stale/mismatched frames twice for identical sha256: once rendering the *pre-change* surface while tesseract OCR of those exact bytes returned the *post-change* surface, and once serving section-C pixels for the `en-secE-gate.png` file. **All visual claims here are grounded on OCR + DOM geometry + hash-bound region crops**, but the Controller must independently re-verify full-frame reads before accepting.
- **D-10 · V1 · `SHARED_COMPONENT`** — the bottom shelf's closed-state copy is owned by the shared `BottomDeepWorkOwner`; the governor re-asserts the localised *Temporary workspace* strip on every pass, but a shelf re-render can briefly revert it. `m0-controller-composition.ts` / `bottom-shelf.ts` are writer-forbidden, so this is recorded rather than patched.

## 7. Notes for the Controller

- **No `git add` / no `git commit`** was performed — the delta is in the working tree for your checkpoint.
- Two **transient shared failures** were observed and retried, never edited: a nested-backtick syntax error in a W04-PORTFOLIO template literal, and a missing `MASTERY_CAUSAL_LAW` export in W04-MASTERY's `adapters/mastery/domain.ts`. Both self-resolved; the same harness then re-ran green.
- Suggested review order: `evidence/audit.json` → `evidence/en-L1-whole.png` vs the reference → `evidence/ar-L1-whole.png` → `en-secC-stepper-v2.png` → `en-right-region.png` → responsive `en-760x900.png` / `compact-L1.png`.
- Language policy held throughout: **Arabic and English are both first-class, the active language is user-configurable in Settings, and there is no permanent product-language authority.** The reference being Arabic did not make Arabic the default.
