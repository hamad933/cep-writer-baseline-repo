# W03-LABS · HANDOFF (Surface Writer)

**Unit** `W03-LABS` · **Surface** `labs` · **Status** `NOT_OWNER_ACCEPTED` (sole Controller review required)
**Reference** `Cybersecurity Lab Task Graph Dashboard(2).png` · `CURRENT_FINAL_REFERENCE` · sha256 `09f9d53b8d845ad3` · 1505×1045
**Writable roots used** `stack/native-typescript/surfaces/labs/` · `stack/native-typescript/adapters/labs/`
No shared file was edited. No `git add` / `git commit` was performed by this unit.

---

## 1. What this workspace is for

**Lab definition authoring**: compose ONE lab as a dependency graph of discrete technical tasks, then
validate → publish an exact revision → freeze a run-input manifest. The task graph **is** the work
surface, so it takes the whole board; everything else exists to serve it.

The reference shows a workbench, not a dashboard, and that distinction drove every decision:
**the centre is the graph (not cards), the left is lab structure (not a document collection), the
right is the authored context of the selected node (not workspace metadata).**

## 2. Composition (what changed)

| Region | Before (rejected) | After |
|---|---|---|
| Centre | Graph block + a grid of five generic task cards pushed below the fold (`#m0StructuredSpatial` 1010px inside an 824px pane) | One workbench: **authoring palette** (Select · Add Task · Connect · Add Branch) + **lifecycle row** (Validate · Publish Revision · Prepare Run · ⋯) → bordered board (title · `Draft Revision 2` pill · lifecycle pill · graph meta · purpose · **dot-grid task-graph canvas** · footer with **Relationship Legend** + live state token) |
| Left | Shared generic `m0-domain-nav`: "Labs authoring" + raw semantic dump (`Version/Status/Lifecycle/Selection/SourceLineage`, then `NodeType: · ExpectedSignal: · Description:` strings) | Own `workspace.region('LEFT')`: **Lab Structure** — 11 definition facets with icons + counts, a numbered **Task Graph rail** (5 steps, selected/optional states), a **Branches** group with endpoints |
| Right | Generic "Workspace context · Labs workspace" with two state rows and ~460px of dead zone | Own `workspace.region('RIGHT')`: **Lab Context** — icon/label/value rows for the selected subject (Objective type · Required capability · Permitted tools chips · Expected signal · Validation link · Completion contribution) + an always-present **Preflight facts** block |
| Toolbar | 4 generic commands, English-only in Arabic sessions | Shell toolbar keeps the same command ids with **localized labels**; the workbench action row carries the reference's grouping |
| Chrome | Arabic-only banner/bottom regardless of language; foreign context strip above the right region | Banner, bottom shelf, pane headers and pane toggles localized from the surface's own hook; non-region pane siblings forced `display:none!important` |

**New surface modules** (all under `surfaces/labs/`):
`i18n.ts` (bilingual set + locale/direction readers) · `icons.ts` (local 16px stroke set) ·
`styles.ts` (type/spacing/radius/accent system, logical properties only) · `structure.ts` (LEFT) ·
`context.ts` (RIGHT) · `board.ts` (centre + wiring) · `presentation.ts` (re-export shim).

`index.ts` (contract, commands, slots, truth objects) and `adapters/labs/domain.ts` (domain truth)
are **unchanged**.

## 3. Anti-cloning statement (the historical failure site)

Library/Learn composition was **not** reused. Verified by `functional.mjs` →
`structure.no-donor-leak.no-dead-regions`: `#editorDocument`, `#kuList`, `.structurewrap` and the
generic `.m0-domain-nav` are all absent/hidden on `/?surface=labs`; visible non-region pane siblings
= 0 on both sides.

Shared *mechanics* used: `SpatialView` / `SpatialInteractionKernel` (graph interaction owner),
`workspace.region()` hosts, `SemanticCommandBus`, the SVG icon-free design tokens, the global
chrome. All composition, hierarchy, grouping, density and copy are local to this surface.

## 4. Known, bounded corrections to shared presentation (no shared file edited)

- **Node card geometry** is set by surface CSS (`156×104` model units) and the title/description are
  laid out by a post-render wrap pass (`≤2` balanced lines). Full strings stay in `aria-label`, the
  structure rail and the context pane.
- **Relation endpoints** are re-seated onto the card border through the shared `change` hook, because
  the shared renderer authors them at the node centre and nodes paint after edges (arrowheads would
  otherwise be hidden under the card).
- **`fit()`** is replaced by a local `fitToBox()` using the same camera maths with the Labs card box;
  the shared `fit()` assumes 132×62 and clipped the last card.
- **`[hidden]` was not enough** for donor pane siblings (a donor host forces its own `display`), so
  this surface forces inline `display:none!important` on its own pane siblings only.

## 5. Truthfulness notes (read before reviewing)

- **Environment binding** is declared as `LOCAL_TRAINING_ENVIRONMENT_FIXTURE` /
  `FIXTURE_BINDING__NOT_PROVIDER_TRUTH` so Validate → Publish → Prepare are reachable. It is never
  claimed as provider truth, and `labs.handoff` still reports `runCreated:false` — preparing freezes
  the run-input manifest, it never starts a run.
- **Published revisions are immutable**: after Publish, authoring commands disable with the domain's
  own reason (`Published Lab revisions require labs.revise before mutation.`).
- **Save Draft is deliberately absent** — the durable save boundary is not bound for this surface;
  the bottom shelf states that fact instead of showing a fake button.
- **Arabic and English are both first-class**: no direction is baked into structure; every render
  pass reads the active locale/direction; technical tokens are isolated with `<bdi dir="ltr">`.

## 6. Residual (accepted) defects

- `DEF-LAB-R09` (V1, `SHARED_COMPONENT`): the reference distinguishes *Conditional Unlock* (dashed)
  from *Optional Branch* (dashed + circle); the shared relation renderer only has solid/dashed
  classes. The legend keeps the reference's three relationships; the optional branch is additionally
  marked by its `Optional` node chip and the `Branches` group. Geometry was not forked.
- `DEF-LAB-R10` (V0, `SHARED_COMPONENT`): multi-selection boundary and minimap tiles still assume the
  shared 132×62 card box.

## 7. Environment note for the reviewer

The shared `dist/**` build was **transiently red several times during this unit** from other units'
in-flight TypeScript files (`surfaces/manual_ai` empty-paren syntax; `adapters/mastery` missing
export; a corpus rewriter regex). This unit never edited those files and never wrote `dist/`
outside `tools/writer-serial.sh npm run build:runtime`. A writer-private site builder
(`build-site.mjs`, output `SITE_BUILD.json`) was written as a fallback but the canonical evidence
captured here is from the **serialized shared build**.

## 8. How to re-run the evidence

```bash
tools/writer-serial.sh npm run build:runtime
node writer-output/W03-LABS/functional.mjs          # 12 functional/structural checks → FUNCTIONAL.json
node writer-output/W03-LABS/geom.mjs                # card geometry, overlaps, edge seating
node writer-output/W03-LABS/titles.mjs              # title wrap / no-ellipsis proof
node writer-output/W03-LABS/capture.mjs --label final \
  --root "$PWD/dist" --viewports 1505x1045,1440x1000,1280x860,1024x800 --locales en,ar
```

Every capture manifest binds candidate + commit + viewport + timestamp + path + sha256 + bytes.

> Full machine-readable status: `writer-output/W03-LABS/VISUAL_EXECUTION_REPORT.json`.
