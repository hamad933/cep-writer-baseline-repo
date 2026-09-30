# W04-EVIDENCE — HANDOFF (surface: `evidence`)

**Unit:** `W04-EVIDENCE` · **Branch:** `writer/mi-serial` · **Status:** `NOT_OWNER_ACCEPTED` — sole Controller review required.
**Reference:** `cep-writer/references/visual/03_PROGRESS_AND_EVIDENCE/01_EVIDENCE_INTAKE/Cybersecurity Evidence Dashboard in Arabic(1).png`
(`CURRENT_FINAL_REFERENCE`, sha256 `789deee01cd946d9`, 1505×1045) — read as **CONSTRUCTION AUTHORITY**, not presentation.

## What this workspace is for

Evidence intake: **collect, triage, and bind evidence artifacts to their claims.** The reference's
information architecture was composed for that purpose locally — never as "Library renamed for Evidence":

| Region | Job on this surface |
|---|---|
| LEFT | Intake **queue**: pane identity (`Evidence intake`), state segments that double as live filters over the shared collection matrix, queue rows with tone-coded state, session-truth footer + Settings entry |
| CENTER | The **record workbench**: identity (title + status pill + exact ids), lifecycle band + "what happens next", `Candidate record` (claim/subject/purpose/criterion), `Source Handoff`, `Selected Supporting References`, and — when empty — the intake form itself |
| RIGHT | **Verification check cards**: source integrity (admission gates as PASS/HOLD/OPEN/INFO rows), source state, criterion/purpose, lineage, duplicate scan + the admission truth notice pinned at the bottom |
| BOTTOM | Shared deep-work shelf (deep artifact / revision lineage / raw provenance) — bound, `AVAILABLE` |
| TRANSIENT | Shared host only |

## Candidate and files

- Candidate: `writer/mi-serial@<commit>` + W04 working tree (see `EVIDENCE_INDEX.json.candidate.workingTreeDiffSha256`).
- Product files changed: `stack/native-typescript/surfaces/evidence/index.ts`,
  `stack/native-typescript/surfaces/evidence/presentation.ts`,
  `stack/native-typescript/surfaces/composition/w04-rescue.ts` (owned seam).
- Unit outputs: `writer-output/W04-EVIDENCE/` (harness, captures, lineage, index, report).

## Headline defect → fix loops (V0–V4, root-caused)

See `VISUAL_EXECUTION_REPORT.json` → `DEFECTS_FOUND` (18 entries, full DEFECT → SEVERITY → ROOT CAUSE → CHANGE → EVIDENCE → RE-COMPARISON log: V3x2 · V2x9 · V1x6 · V0x1).
The five structural ones:

1. **Empty-by-default surface was an uncomposed dump** (V3, `SURFACE_COMPOSITION`) → queue segments, guidance + open intake form, RIGHT lens skeleton cards.
2. **150 px generic hero pushed the record below the fold** (V3, `SURFACE_COMPOSITION`) → compacted to a 57 px workspace strip (text preserved).
3. **4-column queue table hid two columns outside the 278 px pane** (V2, `IMPLEMENTATION`) → 2-column adapter with human state labels (adapter is in the writable root).
4. **Center duplicated the RIGHT lens (gates)** (V2, `CONTENT_MODEL`, ONE-LOCATION) → gates removed from CENTER, expressed as gate rows in the RIGHT descriptor.
5. **Surface CSS lost tie-breaks to shared CSS** (V2, `IMPLEMENTATION`) — style injected before `m0ControllerStyle`; unquoted `evidence.admit` attribute selector was invalid CSS; `[data-r6-typed-surface]` never matched because the shared controller writes `"[object Object]"` for W04 → style kept last in `<head>`, selectors quoted, scoping moved to `body[data-consumer=…]`.
6. **Duplicate scan matched the record itself** (V2, `CONTENT_MODEL`, truth defect) — `duplicateCandidate(row)` without `excludeId` reported a false HOLD duplicate on every record → `duplicateCandidate(row, row.id)`; cand7-notice (BLOCKED) vs cand8-notice (HOLDS·PASS).
7. **RIGHT region clipped its own content** (V1, `RESPONSIVE_RULE`) — 1417 px of lens content under a pane with `overflow:hidden` hid the duplicate card and the admission notice → region-owned scroll; cand8-notice shows the notice pinned at the pane bottom.

## Shared-component findings (reported, Consumer-patch-free)

- **`direction:rtl` is baked** into shared `.m0-collection-panel, .m0-workbench, .m0-truth`
  (`surfaces/m0-controller-composition.ts:50`) — violates "direction follows the active preference".
  Fixed **surface-family-scoped** (`direction:inherit` under W04 consumers) and reported for a shared-level fix.
- **Donor scope tabs**: `#rightPane .contextscope{display:grid!important}` (donor.css) outranks the
  `extensions.css` suppression → tabs visible although `data-donor-semantic="suppressed"`. Enforced
  inside W04 panes; reported as `SHARED_COMPONENT`.
- Pane-header template label (`… · Collection`) start-clips the 278 px pane → surface-owned short
  labels (`Evidence intake` / `Evidence context`), zero clipping.

## Language / direction

Arabic and English are both first-class; the active language is Settings-owned (`locale` resolved from
the browsing context since G-20). Captures cover **RTL/Arabic** and **LTR/English** plus narrow/compact
bands and both collapsed-pane states. Direction is never baked into structure; English copy inside RTL
containers resolves per element (`dir="auto"`), technical tokens are `<bdi>`-isolated.

## Governance constraints honoured

- Domain boots **empty** (`tools/c2-w04-truth` "normal-defaults-empty", `w04-browser-flows`
  "evidence.domain-empty-at-start") — fixtures are imported **only** through the live domain API by the
  capture harness and are labelled `FIXTURE_INTAKE_BATCH__W04_EVIDENCE_VISUAL_HARNESS` in every receipt.
- Descriptor vocabulary pinned by tests is preserved (`Source Handoff`,
  `Selected Supporting References`, lens ids `provenance/lineage/duplicate`, ≥2 pills, one current
  lifecycle step, ≥3 next-actions, `defaultDomainsEmpty`).
- No shared file outside `w04-rescue.ts` was edited.

## Verification run (this candidate)

- Official build: `tools/writer-serial.sh npm run build:runtime` → **pass, written 290**; `check-build-authority` PASS inside `npm run check`.
- `npm test`: **210 pass / 0 fail** (fresh receipt).
- `dist/tests/**`: **60/64**; the 4 failures (`CG2` spatial families, `CG3` learn/rq, `S01` structured
  editor browser proof, `S04` notes) import no evidence/W04 file → cross-surface, reported not patched.
- Standalone checks: `check-duplicate-mechanics`, `check-authority-intake`, `check-deferred-boundary`,
  `check-w03-semantic-ownership`, `vs05-read-mode-matrix`, `vs05-command-ownership`,
  `test-writer-scaffold` all **PASS**.
- `tools/w04-reaudit-proofs.mjs`: **86/86** (two runs, final dist) · `tools/w04-browser-flows.mjs`: **5/5**
  (two runs, exit 0) — evidence + reviews + mastery + portfolio all green on my seam changes.
- `check-contracts`: FAIL only on `browser.lineage_receipt_truthful`,
  `browser.current_candidate_claim_truthful`, `browser.targeted_visual_evidence` — all three read the
  shared `BROWSER_CONFORMANCE_RECEIPT` (5 failing **spatial** flows: `spatial.selection-connect-canonical-edge`,
  `relation.route-convergence…`, `central-change-reuse`, `runtime-causal-consequence`,
  `spatial-input-bidi…`) and the 1-shot legacy `SCREENSHOT_MANIFEST`; the workspace pane flow PASSES and
  `model.required_regressions` is 210/0. Shared/assurance-owned → reported, not patched.
- Builds were repeatedly **blocked by other writers' in-flight syntax errors**
  (`surfaces/today/presentation.ts`, then `surfaces/audit/index.ts`); every build went through
  `tools/writer-serial.sh`, was retried until green, and the one interim partial build is documented in
  `PARTIAL_BUILD_RECEIPT.json` (skip list now empty — the final build is a full official build).

## What the Controller should re-verify (not accepted by Writer)

1. L1–L4 against the reference at 1505×1045 (populated **and** entry state), both directions — start from the 11 `cand8-*` current captures in `EVIDENCE_INDEX.json`.
2. The three region compositions + bottom shelf binding at 1024/1280/760 and collapsed panes.
3. Segment-filter behaviour, toolbar command availability truthfulness, gate chip derivation.
4. Evidence lineage: `EVIDENCE_INDEX.json` (path+sha256+dims+bytes+viewport+seeded locale+fixture label),
   superseded/bad-URL capture retained and labelled, no stale byte reused as current proof.
5. The shared-defect list above — decide shared-level fix vs surface-scoped ruling.
