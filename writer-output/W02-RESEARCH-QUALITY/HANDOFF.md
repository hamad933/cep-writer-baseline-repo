# HANDOFF — W02-RESEARCH-QUALITY (`rq`)

**Unit:** `W02-RESEARCH-QUALITY` · **Surface:** `rq` · **Branch:** `writer/mi-serial`
**Status:** `NOT_OWNER_ACCEPTED` — sole Controller review required.
**Reference:** `cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png`
**Reference classification:** `CANDIDATE__AUTHORITY_UNRESOLVED` (not promoted to canonical; carried in every evidence record).

---

## 1. What this workspace is for

Reconcile claims against sources. An analyst pins a source pair, reads both excerpts with their
anchors, sees how each claim is supported by each source (supported / qualified / needs review /
conflict), inspects provenance, revisions and activity, and records **working** review state —
never a formal Review decision and never a durable save. Everything shown is labelled
`Working analysis · no formal review authority · durable save unavailable`, and the truth values
come from `adapters/rq/domain.ts` (`providerAdmitted:false`,
`analysisSessionPersistence:'UNAVAILABLE'`, `formalReviewAuthority:false`).

## 2. What was wrong (owner rejection, quantified)

The route rendered a generic typed-collection stage: a header card, one paragraph in LEFT, an
`EMPTY` token in RIGHT, an empty BOTTOM, English-only copy regardless of the language preference,
and roughly 90% dead space. Measured defect **D-01 (V3, `SURFACE_COMPOSITION`)**.

## 3. What is there now

| Region | Owner | Content |
|---|---|---|
| TOOLBAR `#domainToolbar` | shared slot, rq presentation | 5 view tabs (`Compare · Claims · Provenance · Revision · History`) with `aria-pressed` bound to state — **one row, 48px, at every viewport** |
| LEFT `#domainLeftRegion` | rq | active-review scope card · active investigations (4, with state dots) · review queue (4 items, counts, hints) · working-scope footnote |
| CENTER `#foundationStage` | rq | reconciliation action chips + truth chips · review identity line · title + view summary · per-view bodies: source pair (A/B with anchors, digests, verified counts, quoted excerpts), claim matching table (select/support/status/confidence), review result (v3.2 approved → draft), claim register (9), provenance chain (6 anchors), revision list (4), activity log (5) |
| RIGHT `#domainContext` | rq | 5 context tabs (Overview · Attributes · Marks · Order · History) — Overview carries claim linkage, related relations, review note, documentation & references, tools/tags |
| BOTTOM `#domainBottomRegion` | rq | reconciliation trace summary + local-only note (collapsed bar carries label + live summary) |
| `#topBanner .crumbs` | rq content | localized `Area › Surface › REV-SQLI-014` breadcrumb |

**Five working actions** (accept / confirm / raise conflict / request source / embed review) mutate
local working state only and return `persisted:false, formalReview:false, canonicalMutation:false`.
Availability is state-driven with reason tooltips; the bottom summary and status line update truthfully.

## 4. Files changed (writable roots only)

- `stack/native-typescript/surfaces/rq/composition.ts` *(new)* — composition, style, commands, state
- `stack/native-typescript/surfaces/rq/surface.ts` — command registration + guarded deferred mount
- `stack/native-typescript/adapters/rq/fixtures.ts` *(new)* — bilingual presentation fixtures,
  explicitly fenced from Product SourceRevision truth

**No file outside `surfaces/rq/` and `adapters/rq/` was written.** The mount entry point that lives
in the writer-forbidden `m0-controller-composition.ts` is **filed, not applied**:
`writer-output/W02-RESEARCH-QUALITY/SERIALIZED_HOTSPOT_REQUEST.md` (slot 3, W02 kernels).

## 5. Measured results (final round, 4 viewports × 2 directions)

- Truncation/overflow offenders: **0** · contrast failures: **0** (17 text roles, 5.85–16.84)
- Toolbar rows: **1** everywhere (was 2–3) · pane overlap: **0** · horizontal document scroll: **0**
- Largest empty rectangle per region: **0.2%–6.1%** (dead zones closed); ink density 0.07–0.37
- Keyboard: view tabs, claim radios, action chips and context tabs all retain focus in both directions
- Centre scroll past the fold at 1505×1045: **238px RTL / 306px LTR** (recorded as blocker `b3`)
- `npm test` **210/0**; `npm run check` and `npm run browser:test` show only pre-existing,
  cross-surface reds (see `REGRESSION_STATUS`)

> **Handoff-time environment note (b4):** `tools/build-runtime.mjs` currently aborts with
> `ERR_INVALID_TYPESCRIPT_SYNTAX` at `stack/native-typescript/surfaces/today/presentation.ts:161`
> — an in-flight edit by the today owner, outside my writable roots and not fixed by me. The
> `dist/surfaces/rq/*` and `dist/adapters/rq/*` artifacts backing this report were verified present,
> importable and post-fix; a fresh **full** build cannot complete until that sibling file is repaired.

## 6. Known blockers

1. **`b1` (V3, `EVIDENCE/ORACLE`)** — the session image-return channel is stale: a freshly generated
   600×240 solid-colour canary PNG (`evidence/look/canary_7391.png`) rendered back as an unrelated
   older screenshot. Per `visual-fidelity-review` R3 this Writer **cannot** claim vision
   verification, and no unverified image read was used to support any statement above. L1–L4 were
   executed with hash-bound pixel metrics (PIL), DOM geometry/contrast probes and tesseract OCR of
   **both** the reference and the candidate. **Controller-side vision confirmation is required.**
2. **`b2` (V1, `ARCHITECTURE`)** — apply the filed m0 hunk to replace the deferred mount with the
   canonical direct call (`mountRqWorkspace`), then optionally delete the workaround.
3. **`b3` (V1, `STALE_DECISION`)** — adjudicate the density/scroll trade-off against the
   reference's single-screen mock.

## 7. Evidence map

- `VISUAL_EXECUTION_REPORT.json` — every required field, 26 hash-bound evidence entries
- `CAPTURE_RECEIPT.json` — final + superseded rounds (baseline, c1, c2 retained, never reused)
- `evidence/final/*.png` — 8 captures (1505/1440/1024/800 × RTL/LTR) + `DENSITY.json`
- `evidence/baseline/*.png` — pre-change state for the L1 delta
- `analysis/AUDIT_default.json`, `AUDIT_VIEWS.json`, `DENSITY.json`, `KEYBOARD.json` — measured audits
- `analysis/view-*.png`, `analysis/collapsed-*.png` — per-view and collapsed-state captures
- `analyze.mjs`, `analyze-views.mjs`, `density.py`, `keyboard.mjs`, `capture.mjs` — rerunnable methods

**Acceptance:** `NOT_OWNER_ACCEPTED`. A Writer cannot accept its own work.
