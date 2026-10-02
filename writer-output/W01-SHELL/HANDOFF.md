# SH-1 HANDOFF — composition-root integration (W01-SHELL owner)

**Lane:** `SH-1` · **Unit:** `W01-SHELL` · **Branch:** `writer/mi-serial-lane/SH-1`
**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Sealed packet:** `controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0 (BINDING) + §3 `SH-1` row

---

## 1. Candidate identity

| Field | Value |
|---|---|
| Parent (Controller-bound) | `4c6fffe3b6f3cc766e537655a362a3e423585e07` — verified with `git rev-parse HEAD` at lane start; `git status --porcelain` empty |
| Candidate commit | the single commit on `writer/mi-serial-lane/SH-1` (this file's container); exact sha + tree stated in the lane final message (`git rev-parse HEAD`, `git rev-parse HEAD^{tree}`) |
| Canonical source identity (BEFORE, parent) | `0c43d7f11631dc85c4cec60b20d8612ccdfebd0c72da1475dc78360245984abc` — `tools/source-tree-identity.mjs` |
| Canonical source identity (AFTER, candidate) | `28ef1ce6ca527593ead695ed2c56de6d0137fd3e83a272a5a0d2e772ba429aea` |
| Runtime | node `22.16.0`, `npm ci`-installed deps, chromium (Playwright `1.62.1`) |
| Capture transport | `localhost-http` (`tools/serve.mjs`), except where an environment note says otherwise (see F-SH1-04) |

Evidence manifests bind to `commit` + `sourceTreeSha256` + per-image `sha256`/`bytes`/viewport — see
`writer-output/W01-SHELL/evidence/{before,after}/manifest.json`.

## 2. Changed paths (writable roots only)

| Path | Change |
|---|---|
| `stack/native-typescript/surfaces/enterprise/presentation.ts` | single shared SpatialView: `ensureSpatial()` re-hosts the main.ts instance instead of constructing new ones; `wireSharedSpatial()` adds the Enterprise inspect route on top of the central callbacks |
| `stack/native-typescript/surfaces/m0-controller-composition.ts` | RQ `b2` direct purpose-built mount; F01 `ReviewAuthorityRegistry` fail-closed (fallback removed) |
| `writer-output/W01-SHELL/**` | this handoff, report, patch, probes, evidence (output dir) |

**Not changed (no change required):** `main.ts` (already creates the one `SpatialView`, binds
`RelationInteractionOwner`, and passes it through `wave3Assembly.spatial`), `surfaces/shell/**`,
`foundation/global/shell/**`, `surfaces/rq/**` (read-only — **no `SERIALIZED_HOTSPOT_REQUEST.md` needed**:
the b2 wiring was done from the composition root exactly as the rq mount note prescribed).

Full source diff: `writer-output/W01-SHELL/SH1_SOURCE.patch` (2 files; verified byte-identical on restore).

## 3. Root cause → fix mapping

### (a) Enterprise relation integration root — SpatialView instance split

*Root cause (as recorded in `controller/state/CURRENT_STATE.md`, confirmed by this lane's baseline probe):*
`main.ts` constructed `SpatialView #1` and bound `RelationInteractionOwner(workspace, spatial #1, relations)`.
`mountM0ControllerComposition → renderEnterpriseSurface` rewrites `root.innerHTML` on every draw (single
`#foundationStage`), which detaches `#1.host`; because `existingSpatial.host !== freshPlaceholder`, each draw
constructed **another** `SpatialView`. Baseline census: **`spatial-1` (detached, relation-bound),
`spatial-2` (detached, published on `CEPFoundation`), `spatial-3` (the visible canvas)** — three instances;
`relationUiSharesPublishedSpatial=false`, `relationUiSpatialConnected=false`,
`publishedSpatialConnected=false`, visible selection never reached the central owner
(`selectionCount=0`, `connect availability.enabled=false`).

*Fix (wiring only, no new owner/architecture):*
- `renderEnterpriseSurface` now resolves `shared = spatialView || spatial`. When a shared instance exists,
  the freshly rendered `[data-enterprise-spatial]` placeholder is replaced by **the same host node**
  (`host.replaceWith(shared.host)` after attribute adoption), so the instance the user sees IS the instance
  `RelationInteractionOwner` is bound to. `spatial.model.nodes/edges` are re-synced from the surface
  projection (`nodeOptions()` / `relations.project()`) and the view re-rendered/re-fit — preserving the exact
  node presentation the Enterprise canvas had before (status chip vs. subtitle), i.e. no visual redesign.
- `wireSharedSpatial()` preserves the central callbacks (main's `select → updateDomainContext →
  relationUI.refresh`, `open`, plus the existing `relation`, `edgeSelect`, `change` routes that make label/F2
  converge on `relation.edit`) and appends the surface's own `enterprise.inspect` + region refresh so the
  RIGHT selection context and LEFT structure highlight keep following canvas selection (behaviour salvage).
- Construction of a `SpatialView` still exists **only** for the no-shared-instance case (unit-test mount
  without `wave3Assembly`); runtime census proves it never fires on the product route.

### (b) RQ `b2` mount

*Before:* `mountM0ControllerComposition`'s rq branch called the generic `renderTypedCollectionStage` first and
the guarded deferred mount in `surfaces/rq/composition.ts` replaced it two frames later (filed-not-applied
per OFFLOAD-03 C-X2).

*After:* the rq branch keeps `bindRqSurface()` (command binding + guarded deferred mount, now a
`refreshRqWorkspace()` no-op because the stage is already marked) and calls **`mountRqWorkspace({stage, workspace, registry, adapter})`** directly from the composition root; the generic branch no longer
handles rq (`grep renderTypedCollectionStage(stage,{workspace,surface:'rq'` → 0 occurrences).

### (c) F01 fail-closed ReviewAuthorityRegistry

*Before:* `mountW04Group` used `reviewAuthorityRegistry || new ReviewAuthorityRegistry()` — a silent local
fallback that would split review authority (probe: injection absent → mount **succeeded** with a fresh
`{testOnly:false, authorities:{}}` registry).

*After:* the composition path requires the injected shared instance and **fails closed**:
`throw Error('R6_REVIEW_AUTHORITY_REGISTRY_REQUIRED: …')`; the `new ReviewAuthorityRegistry()` fallback and
its import are removed from `m0-controller-composition.ts`. `main.ts` already injects the shared instance on
both call sites, so the product path is unchanged except that it can no longer silently degrade.

## 4. Salvage preserved

- `writer-output/W03-ENTERPRISE/**` untouched (no byte changed).
- `writer-output/W03/evidence/**` and `writer-output/W03/BROWSER_RECEIPT.json` restored to parent state after
  the mandated `tools/w03-browser-flows.mjs` runs (that harness deletes the prior `-3da01fa0` captures on each
  run — see F-SH1-05). This lane's own harness captures are copied under
  `writer-output/W01-SHELL/evidence/w03-flows/` before restoration.
- `assurance/**`, `dist/**`, `stack/MEASURED_COMPARISON.json` reverted to parent (`git checkout -- …`).
- H03 PROP/FALSIFY ceilings remain `NOT_PROVEN` — **no relation propagation/falsification proof is claimed.**
- `npm run check` keeps exactly the one documented known red (`browser.lineage_receipt_truthful`) — not faked green.
- Existing product behaviour (Enterprise studio composition, node/edge rendering, RQ end-state workspace,
  W04 group mounts) left intact; diffs are wiring-only.

## 5. Tests and falsification

### Positive

| Gate | BEFORE (parent) | AFTER (candidate) |
|---|---|---|
| `npm run build:runtime` | PASS | PASS |
| `npm test` | 210/0 | **210/0** (re-run after final edit) |
| `node tools/browser-conformance.mjs` (6 global flows, localhost-http) | **4 PASS / 2 FAIL** | **5 PASS / 1 FAIL** |
| `node tools/w03-browser-flows.mjs` (7 W03 flows) | 7/7 PASS | **7/7 PASS** |
| `node tools/check-duplicate-mechanics.mjs` (N4) | PASS (exit 0) | **PASS (exit 0)** |
| `npm run check` | 1 known red (`browser.lineage_receipt_truthful`) | same — `check-contracts` 167 pass / **1 fail = that known red**; every other check exit 0 |
| `dist/tests/surfaces/enterprise/domain.test.js` | PASS | PASS |
| `dist/tests/rescue/S10_W03_ENTERPRISE/domain-and-lifecycle.test.js` | PASS | PASS |
| `dist/tests/rescue/S10_W03_ENTERPRISE/source-duplicate-owner.test.js` | PASS | PASS |
| `dist/tests/rescue/CG4_W03_COVERAGE/*` (3 proofs) | PASS | PASS |
| `dist/tests/post-c03/D09/d09-w03-studios-replay-tests.js` | PASS (10/0) | PASS |
| `node tools/w03-profile-coverage.mjs` | PASS | PASS (107/107 keys, 0 gaps) |
| `python3 tools/check-w03-semantic-ownership.py` | PASS | PASS (60/60) |
| `dist/tests/post-c03/LCORR03/lcorr03-central-integration-falsification-tests.js` | **14/15 — C3-002 FAIL (pre-existing at parent)** | **14/15 — same single C3-002 FAIL, no new failure** |

### Target flows (sealed mission)

| Flow | BEFORE | AFTER |
|---|---|---|
| `central-change-reuse` | **FAIL** — `Enterprise editable boundary did not remain available`, `selectionCount:0`, `relationUiSharesPublishedSpatial:false` | **PASS** |
| `relation.route-convergence-and-label-scope` | **FAIL** at first assertion, identity diagnostics all false | **FAIL at the same first assertion only** — identity diagnostics now all `true`; every assertion behind it proven PASS (see F-SH1-01) |

### Lane-specific probes (all recorded, `writer-output/W01-SHELL/evidence/`)

| Probe | BEFORE | AFTER |
|---|---|---|
| **Instance census** (response-rewritten `foundation/spatial.js` counts every constructor) | `spatial-1, spatial-2, spatial-3` (3 instances), only 1 live canvas | **exactly `spatial-1` — one instance**, shared by `RelationInteractionOwner`, `CEPFoundation.spatial` and the visible Enterprise host; 1 live canvas; no second/third instance |
| **Selection probe** (click visible endpoint pair) | `selectionCount:0`, `connect {enabled:false, code:SELECTION_COUNT}` | `selectionCount:2`, `connect {enabled:true, code:AVAILABLE, selectedTypes:[Security Control, Simulation-local Device]}` on the shared instance |
| **RQ probe** | generic branch called first (source-level, present in parent), purpose-built workspace mounted later via deferred guard | `mountedBy:"mountRqWorkspace"`, `owner:"W02RqWorkspaceComposer"`, first child `DIV.rq`, `stage.dataset.rqSurface=rq.source-claim-reconciliation`, `genericTypedStage:false`, toolbar `rq.view.*` (5), `rq.search/compare/review/provenance` registered |
| **Inject-fallback probe** (call `mountM0ControllerComposition({consumer:'evidence'})` without `reviewAuthorityRegistry`) | `threw:false` — silent fallback registry constructed | **`threw:true`** — `R6_REVIEW_AUTHORITY_REGISTRY_REQUIRED` (fail closed) |
| **Flow-3 residual probe** | label route dead on visible canvas (no `relation.edit` receipts) | precondition `edge:1, lineOnFirstEdge:0, label:1`; behind it: whole-edge dblclick **inert**, label dblclick **opens composer**, close works, F2 **opens composer**, exactly **2 `relation.edit` receipts, both `RelationInteractionOwner`** |

### Falsification / negative

- (N1) non-owned-route mutation: no write outside the sealed roots — final `git status --porcelain` shows only
  the 2 owned source files + `writer-output/W01-SHELL/`; `controller/**`, `cep-writer/**`, `contracts/**`,
  `profiles/**`, `authority/**`, `dist-ts/**`, `surfaces/rq/**`, other lanes' roots untouched.
- (N2) boundary/invalid input: registry injection absent → fail closed (above), never a false receipt.
- (N3) no provider fabrication: RQ provider remains `UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER`.
- (N4) `check-duplicate-mechanics` PASS (no duplicate owner introduced).
- (N5) suite re-run twice → identical results (210/0 twice; conformance 5/1 twice; probes deterministic).

## 6. FOUR TRUTHS (reported separately)

**Content truth** — unchanged. No labels, copy, objects, commands or data were added/removed/reworded.
Enterprise studio content is produced by the same render functions; RQ now renders the same
purpose-built `W02RqWorkspaceComposer` markup synchronously instead of showing the generic typed stage first.

**Presentation truth** — captured, not claimed. Before/after captures at 1440×1000 and 1024×900 in AR/RTL and
EN/LTR (`evidence/{before,after}/`, hash-bound). Node/edge rendering preserved by syncing the shared model
from the same `nodeOptions()` projection (status chip vs. subtitle identical to the pre-fix visible canvas).
Selection action surface visible + shared composer open are the only new visible states (they are the defect
closure). `VISUAL_COMPARISON_LEVELS_COMPLETED: L1 whole-surface + L2 region` — L3/L4 component/micro comparison
and reference re-audit are **ENT-1's** scope, not performed here. `RTL_LTR_STATUS: both directions captured`
(lang/dir verified `ar/rtl` and `en/ltr` in every capture).

**Behavior truth** — measured: visible selection → central availability (`selectionCount 0→2`,
`enabled false→true`); label and F2 → `relation.edit` convergence (2 receipts, `RelationInteractionOwner`);
whole-edge dblclick inert; RQ surface composes through the purpose-built mount with its own toolbar;
W04 composition fails closed without injected registry; the other 4 global browser flows and all 7 W03 flows
unchanged PASS.

**Domain-Data-Provider truth** — unchanged. No adapter, domain, fixture, provider or contract file was
touched (`adapters/**` read-only); the Enterprise adapter still reports 8 relations /
`FIXTURE_ONLY__NOT_PRODUCT_TRUTH` / `canonicalProductTruth:false`; RQ provider stays unadmitted; H03
PROP/FALSIFY ceilings remain `NOT_PROVEN`.

## 7. Evidence

```
writer-output/W01-SHELL/
├── HANDOFF.md                     this file
├── VISUAL_EXECUTION_REPORT.json   standard §12 fields
├── SH1_SOURCE.patch               exact source delta (2 files)
├── probes/                        10 probe scripts + baseline-diag.json + after-fix-diag.json
└── evidence/
    ├── before/                    8 PNG + manifest.json (parent source 0c43d7f1, commit 4c6fffe)
    ├── after/                     8 PNG + manifest.json (candidate source 28ef1ce6, commit 4c6fffe)
    ├── w03-flows/                 7 harness PNG from the 7/7 post-fix W03 run
    ├── final-diag.json            post-fix instance census + selection + RQ + fallback probes
    ├── final-rq-probe.json        RQ b2 mount probe
    ├── final-flow3-residual.json  flow-3 precondition + downstream assertion results
    ├── conformance-BEFORE-parent-4of6.json
    ├── conformance-AFTER-candidate-5of6.json
    ├── w03-flows-AFTER-7of7.json
    ├── check-contracts-AFTER-167pass-1known-red.json
    └── n4-duplicate-mechanics-AFTER-pass.json
```

## 8. Unresolved findings (truthful failures only)

**F-SH1-01 (BLOCKER for one target flow) — `relation.route-convergence-and-label-scope` still FAILS at its
first assertion.**
Reproduction (exact harness locator, post-fix, `1440×980`, localhost-http):
`edge = page.locator('.spatial-canvas [data-edge]').first()` → 1 (group `APP-WEB-01:relation:0`);
`line = edge.locator('line').filter({visible:true}).first()` → **0**; `label` → 1.
Root cause (`EVIDENCE/ORACLE × FIXTURE_DATA`, not integration): the first relation record is
`APP-WEB-01 → CTL-WAF-01`, and both nodes sit on fixture row 0
(`adapters/w03-enterprise.ts`: `x:(i%3)*240, y:Math.floor(i/3)*200`), so `renderSpatialRelation` emits
`ay = source.y+31 === by = target.y+31` — a horizontal segment. Chrome reports
`getBoundingClientRect().height = 0` for it, and Playwright's `visible` filter requires a non-empty bounding
box (`probes/playwright-line-visibility.mjs`: horizontal line → not visible, diagonal → visible). The order
and geometry are identical in the pre-fix split instances and the post-fix single instance
(`probes/edge-order-compare.mjs`), so this precondition is independent of the wiring defect.
Everything behind the precondition passes (`evidence/final-flow3-residual.json`), and every identity
diagnostic CURRENT_STATE recorded for this flow is now `true`.
**Why not fixed here:** satisfying it requires changing fixture coordinates/record order
(`adapters/**` — read-only for this lane) or ordering the paint purely to satisfy `.first()`, which would be
data/locator manipulation, not wiring. **Not decided by this lane** — Controller disposition options of
record: harness-oracle correction (precedent: `490b6a4 controller(w03): correct SVG and xterm browser oracles`)
or a fixture-layout decision routed to the W03/fixture owner.

**F-SH1-02 (V2, observation) — label pointer interception at 1024×900.** The first visible relation label's
centre can be covered by a later edge's `stroke-width:18` hit-target, so a pointer `dblclick` lands on the
line (inert) instead of the label; the label→`relation.edit` route itself works (event-dispatched dblclick
opens the composer, recorded as `clickRoute:"dispatched-dblclick-event"` in `evidence/after/manifest.json`).
Geometry/hit-testing lives in read-only `foundation/spatial/presentation.ts` + fixture data.

**F-SH1-03 (pre-existing, unchanged) — `LCORR03 / C3-002`** fails its textual guard
(`root.innerHTML=` must appear within 600 chars of `const draw=(...)`); reproduced at parent HEAD before any
edit (14/15 both before and after). Fixing it needs a presentational code-motion of `draw()` outside the
sealed wiring scope; its behavioural assertions (single `#foundationStage`, replacement render, enterprise
mount shape) still pass.

**F-SH1-04 (environment) — parallel-lane interference.** While another lane's local runtime occupied
`127.0.0.1:4174`, the page's boot request `GET /v1/platform/input-direction` returned headers but never
completed, so `waitUntil:'networkidle'` never fired and every harness run timed out
(`probes/networkidle-repro.mjs`). Not a product defect (the endpoint answers in 85 ms via curl; the fetch
itself succeeds when issued later); all reported runs were executed while the port was free.

**F-SH1-05 (harness behaviour) — `tools/w03-browser-flows.mjs` deletes the previous captures** in
`writer-output/W03/evidence/` at start of run; the 7 salvaged `-3da01fa0` PNGs + receipt were restored to
parent state, this lane's captures preserved under its own evidence dir.

**Known red retained:** `browser.lineage_receipt_truthful` (needs a 6/6 receipt — target flow 3 above).

## 9. Owner / STOP notes

- **No Owner-facing item was decided**: shell redesign (`OWNER-20260910-010`), RQ reference promotion
  (`REVIEWED_FINAL_CANDIDATE`), Visualize `F-048`, destination-count freeze (`C03-GATE-023`) — recorded only.
- No architecture/new owner was introduced; no shared seam outside the packet's list was touched; no
  `SERIALIZED_HOTSPOT_REQUEST.md` was required.
- H03 PROP/FALSIFY ceilings stay `NOT_PROVEN`.
- Status: **`NOT_OWNER_ACCEPTED` / `CANDIDATE_ONLY`** — sole Controller review required; no merge, acceptance,
  release or deployment is claimed or implied.
