# W03-SCENARIOS · HANDOFF (Surface Writer)

**Unit** `W03-SCENARIOS` · **Surface** `scenarios` · **Status** `NOT_OWNER_ACCEPTED` (sole Controller review required)
**Candidate commit** `4053087b16481bb43c565c7902e9cd39b3e19ac7` (exactly the 8 files above; worktree clean for these roots)
**Reference** `Cybersecurity Scenario Timeline Dashboard(1).png` · `CURRENT_FINAL_REFERENCE` · sha256 `98a1c75226a20db0` · 1505×1045

> Scope discipline: wrote ONLY `stack/native-typescript/surfaces/scenarios/` and `stack/native-typescript/adapters/scenarios/`.
> `surfaces/composition/w03-rescue.ts` was inspected and needed no change. No shared file was edited.

---

## 1. What this workspace is for

**Scenario authoring and preparation**: compose an attack/defense scenario as *time-ordered events*, then
validate → publish an exact revision → freeze a run-input manifest. The timeline is the real work surface:
numbered phases on a rail, elements chained horizontally inside each phase, an explicit "add element"
affordance per row, and a relationship legend at the foot of the board.

The reference shows a workbench, not a dashboard. That distinction drove every composition decision:
**the center is scenario work (not cards), the left is scenario structure (not generic navigation), the
right is the selected element's inspector (not workspace metadata).**

## 2. Composition (what was rebuilt)

| Region | Before (rejected) | After |
|---|---|---|
| Center | One `w03-identity` block: title + vertical stacked `dl` cards — a generic list | Full workbench: **view tab row** (Timeline · Flow · Topology · Canvas + Validate · Publish Revision · Prepare Run · ⋯) → **authoring palette** (Select · Add Phase · Add Event · Add Inject · Add Decision · Add Lab Module · Connect · ⋯) → **bordered timeline board** (identity head · 4 phase rows with numbered rail, connector, element chains, pinned `+ Add Element` · legend + status) |
| Left | Generic shared `m0-domain-nav`: "Scenarios authoring" + raw semantic dump (`ValidationStatusUNVALIDATED`) | Own `workspace.region('LEFT')`: **Scenario Structure** tree — Overview / Environment / Roles, expandable **Phases** with numbered children, eight typed facets with counts, **References** (Knowledge Units · Lab Library) |
| Right | Generic workspace context (State/Revision) | Own `workspace.region('RIGHT')`: **Scenario Inspector** with sectioned fields (Type · Position · Recipient · Trigger · Delivery · Payload type · Branch impact) plus Validation and Environment truths |
| Toolbar | 4 generic commands | Same contract commands with **localized labels**; lifecycle actions moved into the workbench action row where the reference puts them |
| Bottom / chrome | Arabic-only labels rendered in English sessions | Localized (bottom title/summary, pane edge toggles, banner) from the surface's own hook |

**Four real projections of one domain** (no fake content, no dead tabs):
`timeline` (rail + chains) · `flow` (cross-phase chain with inline phase gates) · `topology` (shared
SpatialInteraction kernel) · `canvas` (per-phase authoring board with the full authored field set).

## 3. Anti-cloning statement (the historical failure site)

Library/Learn composition was **not** reused. Verified by `carrier.mjs`: donor Library nodes
(`.structurewrap`, `#kuList`, `.library-search`, `#structureTree`), the generic `m0-domain-nav`,
foreign-surface classes (`enterprise-*`, `today-*`, `w03-lab-*`, `s11-*`) and the donor `#editorDocument`
are all **absent/hidden** on `/?surface=scenarios`. Shared *mechanics* used: SVG icon sprite, design
tokens, `workspace.region()` hosts, `SpatialView`, `RelationDomainAdapter`, SemanticCommandBus. All
composition, hierarchy, density and grouping are local to this surface.

## 4. Truthfulness notes (read before reviewing)

- **Environment binding** is declared as `LOCAL_TRAINING_ENVIRONMENT_FIXTURE` with
  `classification: FIXTURE_BINDING__NOT_PROVIDER_TRUTH`, rendered verbatim in the inspector. It exists so
  Validate → Publish → Prepare are *reachable*, not to claim provider truth. `scenarios.prepare` still
  reports `runStarted:false` (manifest frozen, no run).
- **`Save Draft` is deliberately absent**: draft mutations are immediate and the durable save boundary is
  not bound for this surface; that fact is stated in the bottom shelf summary instead of behind a fake button.
- **Validation is shown twice on purpose**: the recorded state (`UNVALIDATED`/`VALIDATED`) and the live
  query result (`23/23 passed`) are separate lines, so a query can never be read as a completed validation.
- **Published revisions are immutable**: after Publish, authoring controls disable with the domain's own
  reason (`Published Scenario revisions require scenarios.revise before mutation.`).

## 5. Verification performed

| Instrument | Result |
|---|---|
| `functional.mjs` (genuine route, Playwright) | **46/46 PASS** — regions, selection→inspector, 4 views, authoring, validate→publish→prepare, connect, menus, immutable guard, narrow viewport, RTL mirror, localized toolbar |
| `carrier.mjs` (required + forbidden semantics) | see `CARRIER.json` |
| `geometry.mjs` (5 cases: 1505/1280/1024 × en/ar) | 0 overflow at 1505 both directions, legend visible, no centerrail overlap, no clipped controls, right pane auto-collapses ≤1024 |
| `micro.mjs` (L4 type/spacing/radius/alignment) | see `MICRO.json` |
| `npm test` | **210 pass / 0 fail** |
| `verify-dist-sync.mjs` | **all 9 writable-root files byte-identical to the dist the browser served** (proof that the captured candidate IS this unit's source) |
| `npm run check` (sub-checks) | PASS: duplicate-mechanics, authority-intake, deferred-boundary, vs05 read-mode, vs05 command-ownership, writer-scaffold, w03-semantic-ownership 60/60. **FAIL:** check-contracts 165/168 — the 3 failures are stale Controller-owned browser receipts (tree SHA `4efc6404` vs current, screenshot class `legacy`); check-build-authority is red because the shared build is red (see §7) |
| Density (ink vs reference) | left pane **1.06×**, center **1.98×**, right 1.72×, whole surface 1.59× (see §6) |

## 6. Known deviations from the reference (declared, not hidden)

1. **Center density 1.98× the reference** (whole surface 1.59×). Cause: shell pane widths (left 304 /
   right 420) leave the work surface ~775px against the reference's ~1000px, so the same information is
   denser per pixel; the workbench also carries the lifecycle action row that the reference shows in
   equivalent chrome. Left pane matches at **1.06×**. Reduced decorative ink twice (dot-grid strength,
   redundant per-row counts, spacing normalisation → 2.07× → 1.98×). Pane widths are owned by
   `W05-CONFIGURATION` (preference defaults) — not changed here.
2. **Palette wraps to two rows in English at 1505px** (9 controls vs ~758px available). Correct flex
   reflow, no truncation; Arabic labels are narrower and fit on one row.
3. **Phase names are shown inside each timeline row** (the reference keeps them only in the tree). This is
   deliberate: rows stay self-describing when the structure pane is collapsed.
4. **1280×860 and 1024×800 scroll vertically** (viewport height is smaller than the reference's), and the
   right pane collapses ≤1024 by shell rule — both are reflow, not truncation.
5. **Active tab weight is 700** while the rest of the surface uses 400/500/600/650 (5 weights vs the
   3–4 target). The reference marks the active tab by colour + underline as well, so this could be
   dropped to 650 — but that would desynchronise source from the built candidate while the shared
   build is red, and candidate/source identity (§7) is the stronger evidence property. Left as a V0.5
   note rather than breaking lineage.

## 7. Blockers for Controller

1. **Model image-read channel returns stale/mismatched frames** (`EVIDENCE/ORACLE`, V3). Verified
   deterministically: requesting a freshly written PNG returned a different, previously-read image.
   All visual claims here are therefore grounded in **OCR (tesseract), DOM geometry probes and pixel
   metrics**, not in model vision. **Controller must re-verify with a working image channel.**
2. **Shared build RED since 02:12 UTC** — `stack/native-typescript/surfaces/audit/index.ts` line 1035
   (unit `W05-AUDIT`, uncommitted) contains `workspace.status?.`…`?.()`, which Node cannot parse
   (`ERR_INVALID_TYPESCRIPT_SYNTAX`). 62 serialized retry attempts over ~30 minutes never went green.
   Consequence: `npm run check` (build-authority step) cannot pass. **Not touched by this unit** —
   this unit's files all parse and are byte-identical to `dist` (`DIST_SYNC.json`), so the captured
   frames are still a faithful rendering of this unit's source.
3. **`check-contracts` 165/168** — 3 stale Controller-owned browser receipts (canonical tree SHA
   `4efc6404` ≠ current, screenshot `class=legacy`). Regenerate after the writer wave.
4. **Arabic OCR unavailable** (`tesseract` ships `eng` only) — Arabic text verification is DOM-based.

## 8. Files

```
stack/native-typescript/surfaces/scenarios/i18n.ts         NEW  bilingual label set
stack/native-typescript/surfaces/scenarios/util.ts         NEW  kind map, icons, counts, BIDI helpers
stack/native-typescript/surfaces/scenarios/styles.ts       NEW  direction-neutral stylesheet
stack/native-typescript/surfaces/scenarios/views.ts        NEW  4 projections + topology graph
stack/native-typescript/surfaces/scenarios/structure.ts    NEW  LEFT pane
stack/native-typescript/surfaces/scenarios/inspector.ts    NEW  RIGHT pane
stack/native-typescript/surfaces/scenarios/presentation.ts MOD  orchestrator, regions, actions
stack/native-typescript/surfaces/scenarios/index.ts          —  unchanged (contract intact)
stack/native-typescript/adapters/scenarios/domain.ts        MOD  fixture element field enrichment
stack/native-typescript/surfaces/composition/w03-rescue.ts    —  unchanged (no change required)
```

Evidence tooling (writer-local, in `writer-output/W03-SCENARIOS/`): `capture.mjs`, `functional.mjs`,
`carrier.mjs`, `geometry.mjs`, `micro.mjs`, `probe.mjs`.
