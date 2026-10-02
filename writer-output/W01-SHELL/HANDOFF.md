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

---

# SH-2 HANDOFF — bounded shared chrome/geometry (W01-SHELL owner)

**Lane:** `SH-2` · **Unit:** `W01-SHELL` · **Branch:** `writer/mi-serial-lane/SH-2`
**Class:** `CANDIDATE_ONLY__NO_SELF_PROMOTION__SOLE_CONTROLLER_REVIEW_REQUIRED`
**Sealed packet:** `controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md` §0 (BINDING) + §3 `SH-2` row
**SH-1's files above are preserved verbatim; this section is appended, nothing above was rewritten.**

## SH-2.1 Candidate identity

| Field | Value |
|---|---|
| Base (EXACT_PARENT, verified `git rev-parse HEAD` at lane start) | `9f1dc785c2cc71bc6540f435efe6821b83cd2205` (tree `fdbd05f022790a848ee59e65a7d38231d98f0e5e`); `git status --porcelain` empty at start |
| Canonical source identity BEFORE | `28ef1ce6ca527593ead695ed2c56de6d0137fd3e83a272a5a0d2e772ba429aea` (338 files) — equals SH-1's recorded candidate identity |
| Canonical source identity AFTER | `62fe5d81ee767f25a132c4c7ee88a09f6647541ebf1dc7787efb83524d23027a` (338 files) |
| Candidate commit | the single commit on `writer/mi-serial-lane/SH-2` (exact sha in the lane final message) |
| Runtime | node `22.16.0`, Playwright `1.62.1` chromium, `localhost-http` (`tools/serve.mjs` on lane-local ports 43174/43175/43176/43177 — **port 4174 pre-checked with `curl` at lane start and repeatedly: `000`, no listener; the local runtime was deliberately not started so no parallel lane could be blocked (SH-1 F-SH1-04). `/v1/**` requests are therefore refused (198+42+… across 99 routes); this is an environment fact, `pageErrors` stayed 0 on every route.** |

## SH-2.2 Changed paths (writable roots only)

| Path | Change |
|---|---|
| `stack/native-typescript/foundation/extensions.css` | `+13` lines — one id-qualified shared centerrail-clearance rule + explanatory comment |
| `dist/foundation/extensions.css` | regenerated by the mandated `npm run build:runtime`; contains the rule above **plus** the pre-existing source-side `justify-content:safe center` line that was already in base source but not in base `dist` (same-file regeneration; hand-forging `dist` is prohibited, so the two cannot be split) |
| `writer-output/W01-SHELL/**` | probes, evidence, `SERIALIZED_HOTSPOT_REQUEST.md`, `VISUAL_EXECUTION_REPORT_SH2.json`, this appended section |

Nothing else was mutated. Final `git status --porcelain` shows exactly the two paths above plus `writer-output/W01-SHELL/`.
`pane-layout.ts` was edited for the two AD-01 experiments and **fully reverted** (`git checkout --`); `git status` proves it.

## SH-2.3 Per-item status

| # | Item | Status | Proof / reason |
|---|---|---|---|
| **A** | **AD-01 pane proportions ≈16/65/17** | **STOP — HOTSPOT-FILED (`H-SH2-01`), NOT CLOSED** | Experiment A (the packet's literal edit: `pane-layout.ts` fallbacks `304/420 → 230/245`) = **inert**: `npm test 210/0`, live `--left/--right` still `304px/420px`, proportions still **21.11 / 48.19 / 29.17** at 1440 on all 23 routes. Experiment B (non-inert) **achieves 15.97 / 65.49 / 17.01** but `npm test` → **208/2 FAIL** on `w3e.ui-scale-pane-responsive-separation` and `w3e.ui-scale-style-projection`, both frozen in `stack/native-typescript/model-tests.ts` (outside every SH-2 root) → mission STOP rule "consumer regression FAIL after AD-01 → STOP AD-01 sub-scope … do not push a regressed geometry" applied. Required out-of-root set enumerated in `SERIALIZED_HOTSPOT_REQUEST.md` (`preferences/schema.ts` = live default + `model-tests.ts` fixtures (atomic pair), `accepted-runtime.ts`, `responsive-layout.ts`, generated `donor.css :root`). |
| **B1** | **AD-02 shared/donor chrome Arabic under EN** | **PARTIAL — in-root seam CLOSED; remainder HOTSPOT-FILED (`H-SH2-02`)** | In-root census: `.foundation-shell` scope = **0 Arabic entries under EN** on every route/viewport measured; `foundation/extensions.css` and `foundation/global/pane-layout.ts` contain **0** Arabic code points; `foundation/global/shell/*` + `surfaces/shell/surface.ts` are `{ar,en}` pairs or `lang==='ar'?…:…` guarded. Out of root: **138** unique Arabic strings in the generated document shell and **28–42** Arabic chrome entries per route under EN, all in scopes `.toolbar` / `.centerrail` / `#topBanner` / `#leftPane .phead` / `#rightPane .phead` / `#leftLocalReveal` / `#rightLocalReveal` / `#leftPane .rail` — sourced from `dist/index.html` (generated by `tools/extract_donor.py`) and `foundation/accepted-runtime.ts` (HS-REL-1, explicitly "NOT yours"). |
| **B2** | **D-08 `donor.css #rightPane .contextscope{display:grid!important}`** | **HOTSPOT-FILED (`H-SH2-03`)** | Confirmed at `dist/foundation/donor.css:734` (17 `.contextscope` rules). `donor.css` exists only as a generated file (no authored CSS source under `stack/**`); harness `tools/extract_donor.py` is prohibited → recorded, not edited. |
| **C** | **G-20 `dist/index.html` dir/lang bake-out** | **CLOSED (verified; no edit required)** | `dist/index.html` is a **bare `<html>`** (0 `lang=`, 0 baked `dir=` on the root) followed by the `G-20 LANGUAGE POLICY BOOTSTRAP` whose resolution order is stored user preference → browsing-context language → schema placeholder, direction = explicit pin → derived from the active locale. Generator chain: emitted by `tools/extract_donor.py` under a ZERO_DELTA hash guard; **no fix is needed**, so no `tools/**` edit was attempted. Locale flip proof below: 23/23 routes structure-identical AR↔EN with `(dir,lang,authority) = (rtl,ar,user-preference)` / `(ltr,en,user-preference)`. |
| **D(i)** | **MAS1-003 pane order never mirrors in AR** | **HOTSPOT-FILED (`H-SH2-04`)** | Confirmed: under `dir=rtl`, `#leftPane.x = 0` and `#rightPane.x = 1020` on **all 23 routes**. Root = generated `dist/foundation/donor.css:9 .cols{direction:ltr; grid-template-areas:"left lr center rr right"}`. `pane-layout.ts` (the other candidate root) returns only side/width/mode/state — **it has no ordering responsibility, so there is no "pane-layout share" to fix.** Additional flag: the accepted donor reference carries the same `.cols{direction:ltr}` in an RTL document, i.e. the accepted reference does not mirror either → needs a reference-authority adjudication before any flip. |
| **D(ii)** | **HLTH-F6 `#leftLocalReveal` occludes stage eyebrow** | **CLOSED** | Root: shared `.centerrail` is absolutely positioned at `top:8px`, height 30 → covers `y 8..38` of `#centerPane`, and the shared centre stage had no clearance (and two runtime-injected style blocks out-specified a bare class rule). Fix in `foundation/extensions.css`: `#centerPane>.foundation-stage,#centerPane>div#foundationStage.foundation-stage{padding-top:44px}` (the four consumers that carried an ad-hoc `36px` restored to their original value so one shared rule governs). **Result: overlapping measurements 23 → 0** across 8 surfaces × 3 viewports × 2 locales; every eyebrow now sits at offset ≥ 54px vs rail bottom 38px. |
| **D(iii)** | **HLTH-F7 right-pane `#contextLenses` / hidden `.contextscope` / ~27px gap** | **NOT REPRODUCIBLE (`H-SH2-06`) — no speculative edit made** | `pheadGap = 0` on **46/46** measurements (`#rightPane` has exactly `.phead` + `.pbody`, contiguous). `#contextLenses` **does not exist in `dist/index.html`** — `accepted-runtime.ts renderContextLenses()` early-returns on `if(!host) return`. On the health route `.contextscope` is `display:grid` (visible), not hidden. Original capture state requested. |
| **D(iv)** | **PRC-1 forced-flip nav chip edge clip** | **CLOSED (verified live) + residual documented** | `justify-content: safe center` is now live on `.global-shell-destinations` in **99/99** measurements (the base `dist` still had plain `center`; the mandated rebuild propagated the source fix). Start-edge chip is never clipped in either direction; every overflowing nav (76/76) has its end chip **reachable by scroll** (RTL scroll extent measured with the sign-correct probe). Residual width budget, recorded not redesigned (shell redesign is Owner-gated, OWNER-20260910-010): overflow `131px` @1440 EN, `91px` @1024 AR, `324px` / `166px` @768. |
| **D(v)** | **BKP U-01 `.centerrail` overlays centre content (V2)** | **HOTSPOT-FILED (`H-SH2-05`) + mitigated in-root** | Root is generated `dist/foundation/donor.css` (`.centerrail{position:absolute;top:8px;…;z-index:214}`) — not in `extensions.css`, `tools/**` prohibited. Mitigated by the D(ii) clearance rule for all `.foundation-stage` consumers. Residual observation: on the structured-editor routes the bar also floats over `#centerPane > .docscroll` (`beneathCenterrail[0] = article#editorDocument`); no text occlusion was measured there and no structured-editor layout was changed. |
| **D(vi)** | **AUD-U3 side-pane geometry 335/451 @1440 forcing 2-pane lower band** | **NOT REPRODUCED + subsumed by `H-SH2-01`** | Every one of the 23 routes measures `--left 304px / --right 420px` at 1440 (21.11 / 48.19 / 29.17). `335/451` never appears. Band behaviour is viewport-driven and correct: 1440 → `wide` (both open), 1024 → `medium` (right collapsed), 768 → `narrow` (both collapsed); **0 pane-overlap cases at any band, before and after.** The underlying "side panes too wide" substance is the AD-01 defect and is blocked by the same out-of-root set. |

## SH-2.4 Regression results (full consumer regression)

| Gate | Baseline (base `9f1dc785`, post-build) | After (candidate) |
|---|---|---|
| `npm run build:runtime` | PASS | PASS |
| `npm test` | **210/0** | **210/0** (re-run after the final tree, and again after the dist revert) |
| `npm run check` (exit) | exit 1 — `check-contracts` **166/2**: `browser.lineage_receipt_truthful` (documented known red) + `browser.current_candidate_claim_truthful` (G-24/G-36 stale-receipt lineage, Controller-owned) | exit 1 — with the conformance receipt re-bound to current source: `check-contracts` **167/1** = only the documented known red; `model.required_regressions` PASS; `check-build-authority` (build parity) PASS both times |
| `node tools/browser-conformance.mjs` (6 flows) | **5 PASS / 1 FAIL** | **5 PASS / 1 FAIL** — no regression |
| 23-route boot smoke | — | **99/99 booted, `pageErrors` = 0 on every route** (23 routes × AR@1440 + EN@1440 + AR@1024; 10 routes × 3 viewports × EN) |
| Packet `S07_W01_W02_SHELL_TODAY` | — | **PASS** |
| Packet `CG3_W01_W02_COVERAGE` | — | exit 0, 0 FAIL |
| Packet `S03_SHARED_SETTINGS_TRANSIENT` | — | **10 pass / 0 fail** |
| Packet `S02_SHARED_WORKSPACE_CHROME` (python) | — | **BLOCKED — environment**: `ModuleNotFoundError: No module named 'playwright'` (no Python Playwright binding installed). Reported, not faked, not worked around. |
| `node tools/check-duplicate-mechanics.mjs` (N4) | — | **exit 0** |

**Build-parity / dist note (falsified, recorded):** the base commit's `dist` is stale w.r.t. its own source for
`dist/surfaces/enterprise/presentation.js` and `dist/surfaces/m0-controller-composition.js` (SH-1's source fix was
committed without a dist rebuild). Reverting those two regenerated files — as step (6) of the lane contract
requires — drops `browser-conformance.mjs` to **4 PASS / 2 FAIL**
(`evidence/sh2/conformance-REVERTED-DIST-4of6-preexisting-drift.txt`). Both the baseline 5/1 and the after 5/1 were
therefore measured **under the mandated `npm run build:runtime` precondition**, and the two files were reverted to
their base state so this lane's commit stays inside its own scope. This is a **pre-existing dist/source drift at the
base, not caused by SH-2**, and it is reported rather than silently absorbed.

## SH-2.5 Falsification (N1–N5 + lane-specific)

- **(N1) non-owned-route mutation refused** — final `git status --porcelain` contains only
  `stack/native-typescript/foundation/extensions.css`, `dist/foundation/extensions.css` and `writer-output/W01-SHELL/`.
  `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `dist-ts/**`, `tools/**`,
  `surfaces/m0-controller-composition.ts`, `foundation/accepted-runtime.ts`, `foundation/global/preferences/**`,
  `model-tests.ts`, other lanes' roots, `main` and `writer/mi-serial` were never written.
- **(N2) boundary / invalid input → no corruption, no false receipt** — the AD-01 sub-scope was pushed to its
  boundary twice (inert edit, then non-inert edit); instead of shipping either, the falsification result was recorded
  and both edits reverted. The out-of-root need became `SERIALIZED_HOTSPOT_REQUEST.md` rather than a root violation.
- **(N3) missing prerequisite → unavailable, never fabricated** — S02 reported `BLOCKED` with the exact module error;
  HLTH-F7 reported `NOT REPRODUCIBLE` with the exact measurements instead of a guessed "fix"; AUD-U3's 335/451
  reported as not observed instead of assumed.
- **(N4) no duplicate owner** — `tools/check-duplicate-mechanics.mjs` **exit 0**.
- **(N5) suite run twice → identical** — `npm test` = **210/0 on three separate runs** (baseline, after-edit,
  post-revert); `browser-conformance.mjs` = **5/1 at baseline and 5/1 after**; the route probe was run twice at base
  and twice after with identical verdicts (99/99 boot, 0 pageErrors each time).
- **Lane A (AD-01)** — every route boots (99/99, `pageErrors` 0); **no pane overlap at 1440/1024/768 (0 cases)**;
  proportions **NOT** within tolerance: 21.11 / 48.19 / 29.17 vs ≈16/65/17 at 1440 (tolerance target ±1.2 / ±1.5 /
  ±1.2 points) — therefore AD-01 is reported **not closed**.
- **Lane B (AD-02)** — EN-locale chrome grep/census = **0 Arabic in the lane's roots** (`.foundation-shell` scope 0 on
  every route); locale flip AR→EN → structure identical on **23/23** routes (no baked direction); the remaining
  Arabic chrome is attributed by scope to generated/`accepted-runtime` sources and filed as a hotspot.

## SH-2.6 FOUR TRUTHS (reported separately)

**Content truth** — unchanged. No label, copy, object, command, fixture or datum was added, removed or reworded.
The only source change is a `padding-top` clearance in the shared chrome stylesheet; the surface content each route
renders is byte-for-byte the same markup path as before (verified by the 23/23 identical structure hashes across
locales and by the pixel diff being confined to a vertical shift inside `#centerPane`).

**Presentation truth** — captured, not claimed. 8 before + 8 after PNGs at 1440×1000 and 1024×900 in AR/RTL and
EN/LTR, each bound to sha256 + bytes + dims + `dir`/`lang` + `pageErrors`; before captured by reverting the single
source file, rebuilding and re-capturing (dist rule count 0 → 1 verified). All 8 pairs differ by sha256; PIL pixel
diff bbox is confined to the centre pane (`x ≥ 330`) at 1.06–16.67 % of frame; tesseract OCR of the same bytes
cross-checks the frames (VD-008 mitigation — no visual verdict rests on the image channel alone). The decisive claim
is a DOM measurement: rail/eyebrow overlap **23 → 0**. `VISUAL_COMPARISON_LEVELS_COMPLETED: L1 + L2` (L3/L4 not
performed for a single CSS inset; they belong to AD-01 once it can land). `RTL_LTR_STATUS: both directions probed
and captured`.

**Behavior truth** — measured: 99/99 route boots with 0 pageErrors; responsive bands wide/medium/narrow at
1440/1024/768 with 0 pane overlap; `justify-content: safe center` live in 99/99 nav measurements with 76/76
overflowing navs scroll-reachable; locale authority `user-preference` in both directions; conformance 5/1 → 5/1;
`npm test` 210/0 ×3; packet S07/CG3/S03 green.

**Domain-Data-Provider truth** — unchanged. No adapter, domain, fixture, provider, preference schema, contract or
owner was touched; no new owner or second mechanic was introduced (N4 exit 0); no provider capability was claimed;
H03 PROP/FALSIFY ceilings remain `NOT_PROVEN`.

## SH-2.7 Evidence

```
writer-output/W01-SHELL/
├── HANDOFF.md                                  this file (SH-1 section preserved verbatim; SH-2 appended)
├── VISUAL_EXECUTION_REPORT.json                SH-1's report — NOT rewritten
├── VISUAL_EXECUTION_REPORT_SH2.json            SH-2's standard §12 report
├── SERIALIZED_HOTSPOT_REQUEST.md               H-SH2-01..06 out-of-root request
├── probes/
│   ├── sh2-geometry-route-probe.mjs            23-route boot + geometry + locale + seeded-finding probe
│   ├── sh2-capture.mjs                         hash-bound before/after capture
│   └── sh2-debug-{stage,pad}.mjs               stage-padding root-cause probes
└── evidence/
    ├── sh2-probe-BEFORE.json / sh2-probe-AFTER.json     99 records each
    ├── sh2-capture/  {before,after}/*.png + manifest-*.json + image-verification.json + rail-band crops
    └── sh2/  baseline & after gates, AD-01 experiments A/B + diff, packet logs, N4 log, SH2 patch, extensions.css copy
```

## SH-2.8 Unresolved findings

1. **AD-01 open** — centre is 48.19 % of width instead of ≈65 % on every surface; blocked out-of-root (H-SH2-01).
2. **AD-02 remainder open** — 28–42 Arabic chrome strings per route under EN in generated/`accepted-runtime` sources (H-SH2-02).
3. **D-08 open** — donor `!important` collision (H-SH2-03).
4. **MAS1-003 open** — no RTL pane mirror + a reference-authority contradiction to adjudicate (H-SH2-04).
5. **BKP U-01 root open** — `.centerrail` geometry in generated donor chrome; mitigated only for `.foundation-stage` consumers (H-SH2-05); the `#centerPane > .docscroll` float is an unadjudicated observation.
6. **HLTH-F7 unresolved** — not reproducible; original capture state requested (H-SH2-06).
7. **PRC-1 residual** — top-nav column under-budget by 131 px at 1440 EN (chips cut but reachable); fixing it means re-budgeting the top chrome = shell redesign territory (OWNER-20260910-010, Owner-gated).
8. **Pre-existing dist/source drift** at the base for 2 SH-1 files (conformance 5/1 built vs 4/2 unbuilt) — Controller disposition needed at convergence.
9. **`S02_SHARED_WORKSPACE_CHROME`** not executed (Python Playwright missing in this environment).
10. **Known red retained:** `browser.lineage_receipt_truthful` (needs a 6/6 receipt); `browser.current_candidate_claim_truthful` returns to FAIL once `assurance/BROWSER_CONFORMANCE_RECEIPT.json` is reverted to its base state (G-24/G-36, Controller-owned).

## SH-2.9 Owner / STOP notes

- **No Owner-facing item was decided**: shell redesign (`OWNER-20260910-010`), RQ reference promotion, Visualize
  `F-048`, destination-count freeze — recorded only. `OWNER-20260910-011/012/015` were honoured (one shared
  clearance for every surface's stage; shared pane mechanics untouched).
- No architecture or owner was introduced; no shared seam outside the sealed roots was written; the required
  out-of-root need is filed as `writer-output/W01-SHELL/SERIALIZED_HOTSPOT_REQUEST.md`.
- Non-owned side effects reverted: `assurance/**` (6 files), `stack/MEASURED_COMPARISON.json`,
  `dist/surfaces/enterprise/presentation.js`, `dist/surfaces/m0-controller-composition.js`.
- Status: **`NOT_OWNER_ACCEPTED` / `CANDIDATE_ONLY`** — sole Controller review required; no merge, acceptance,
  release or deployment is claimed or implied.
