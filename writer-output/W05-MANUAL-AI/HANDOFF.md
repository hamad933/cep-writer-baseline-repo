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
