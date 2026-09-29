# SHARED-COMPONENT FOLLOW-UP — F1..F5 root-cause report

Session: shared-component follow-up (per Owner directive §5 — "ONE GOOD SHARED FOUNDATION")
Base: `writer/mi-serial`, started at HEAD `e66519e` (two concurrent checkpoints landed mid-session:
`55a46d6`, `1077e93` — policy-correction + W03 remediation agents; see §C).
Fixes: F1 `adapters/structured-documents.ts` · F2 `foundation/workspace.ts` ·
F3 `foundation/spatial/presentation.ts` (+ its embedded presentation CSS) ·
F4 `surfaces/visualize/surface.ts` (+ outline-host consumption) ·
F5 W04/W05 mount path in `surfaces/m0-controller-composition.ts`.
Protected and untouched: `main.ts`, `foundation/extensions.css`, `foundation/operational/xterm-renderer.ts`,
`controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `assurance/**`,
`SpatialInteractionKernel` contract, the Visualize reference `Canavas` spelling.

Evidence: `writer-output/_coordinator/shared-component-fix2/evidence/`
(`before/`, `after/`, `metrics-*.json`, `comparison.json`, `file-byte-evidence.json`,
`composites/` (filename-burned), `spatial-slot-probe.json`+`.svg`).
Before arm = identical worktree with the 5 fixed files reverted to their pre-edit content
(verified: `git diff` hunks of those 5 files are exactly this session's hunks), so every delta
below is attributable to the fixes alone. The image channel was used for orientation only;
all claims rest on DOM measures + file-byte measures (SHA-256, dimensions, per-file OCR,
ink/blank-band geometry).

---

## A. Per-fix: hunk, minimality, measured before/after

### F1 — scaffold no longer impersonates surface content
Hunk (`adapters/structured-documents.ts`, seed fallback only; library/learn branches untouched):
- title `'<surface> · Foundation document host'` → `'<surface> · empty Structured scaffold — no domain document bound'`
- tags `['Foundation']` → `['Scaffold','No domain content bound']`
- the single paragraph "Structured host retained for shared workspace composition." → one `callout`
  block that states emptiness explicitly (no identity, structure, records or facts asserted) and that
  real content appears only from a bound domain source; the surface token is escaped via `seedLabel`.
Minimal: same document id/revision/shape (one block), no fake domain documents seeded, only the
placeholder strings + block kind. Producers of the impersonating string in source: **0**
(`git grep 'Foundation document host' -- 'stack/**'` → empty).
Measured: `scaffold.docTitle` before `scenarios · Foundation document host` / `labs · Foundation
document host` → after `scenarios|labs · empty Structured scaffold — no domain document bound`;
`hasFoundationHostTitle` true→false at both viewports. Pixel delta on the scenarios frame is 0.0000 —
by the time of capture the concurrent W03 remediation (`1077e93`) had composed real Scenarios/Labs
identities, so the shared host text is not in the visible frame; the fix retires the impersonating
producer for every remaining consumer of the shared seed.

### F2 — `.phead h2` labels: ellipsis now lands at the end
Hunk (`foundation/workspace.ts`, `region()` heading assignment + one module helper):
- helper `firstStrongDirection(label)` (first-strong UBA resolution, `rtl`/`ltr`, default `ltr`);
- on every pane-label assignment: `heading.textContent=label; heading.setAttribute('dir','auto');
  heading.style.setProperty('unicode-bidi','isolate');
  heading.style.setProperty('direction',firstStrongDirection(label),'important')`.
The inline `!important` is required because `dist/foundation/donor.css` forces
`#leftPane .phead h2,#rightPane .phead h2{direction:rtl!important}`; without it `dir=auto` loses the
cascade and the start keeps being cut. Arabic labels resolve `rtl` unchanged.
Minimal: one line in one shared method; no donor.css change; all consumers keep their labels.
Measured (heading-rect crops, x3, per-file OCR):
- BEFORE `direction:rtl`, OCR `..ws & representations` and `..orkbench - Collection`
  (head token visible: **false**, tail visible: true — start cut at 31.5 %/34.6 %).
- AFTER `direction:ltr` `dir=auto` `unicode-bidi:isolate`, OCR `Visualize views & rep...` and
  `RQ research workben...` (head token visible: **true** — ellipsis at the end).
Same at 1024×900. Overflow itself (187 px box vs 273 px label) is donor layout and stays; the defect
(clipping at the start) is gone.

### F3 — spatial node-card slots + edge label/class vocabulary
Hunk (`foundation/spatial/presentation.ts` renderers + embedded STYLE):
- `renderSpatialNode` keeps the kernel-locked **132×62** footprint (kernel hardcodes `+132/+62`;
  contract untouched) and adds optional slots: icon tile (kind-tinted: `ku`, `lab`, default),
  id chip (`node.idChip||node.canonicalRef?.objectId||node.id`), title, secondary line
  (`node.subtitle||node.meta`), status chip (short `node.status`, dot + value), progress meter
  (`node.progress{value,max}` + `node.progressText`), tags (`node.tags`, ≤2 pills), keeping the
  duplicate badge, `node-surface`, `data-node`, aria contract and the `spatial-node-duplicate` class.
- `renderSpatialRelation` keeps `data-edge`, `relation-hit-target/-line/-label`, `data-relation-label`,
  marker wiring and the canvas-only class/markers, and adds **label + styleClass**
  (`canonical | related | currentPath | canvasOnly`, exposed as `data-edge-class` +
  `spatial-relation-<class>`): explicit `edge.styleClass` wins; otherwise canvas-presentation →
  `canvasOnly`; `optional|conditional|branch` → dashed `related`; `depend|linear|canonical|prereq|
  require|sequence|flow` → solid `canonical`; `current.?path` → `currentPath`. Label =
  `edge.label||edge.type` (`[Canvas] ` prefix preserved).
Minimal: optional slots only — nodes without new fields render identically-shaped but richer cards;
`SpatialInteractionKernel`, `SpatialView`, all consumer files untouched.
Measured (1440×1000):
- labs graph: id chips 0→5, icon tiles 0→5, titles 0→5, secondary lines 0→5, edges 4/4 labelled,
  classes `[null×4]` → `['canonical','canonical','canonical','related']` (3× Linear Dependency solid,
  Optional Branch dashed).
- visualize canvas: id chips 0→6, icon tiles 0→6, titles 0→6, classes `[null×3]` →
  `['related','related','canvasOnly']` (canvas-only link created through the live `visualize.canvasLink`
  semantic command in the seed).
- runs devices: status chips 0→3 (UP/DOWN/NOTE preserved as chips).
- slot probe (`spatial-slot-probe.json`): all slots render true (idChip/iconTile/title/secondaryLine/
  statusChip/tags + progress variant), all 4 edge classes render true, footprint 132×62.

### F4 — Visualize TREE consumes the shared outline host
Hunk (`surfaces/visualize/surface.ts`): `renderStructuredOutline` +
`createStructuredOutlinePresentationDescriptor` + `resolveStructuredOutlineKeyboardIntent` now render
the TREE projection (both branches) through a Visualize-adapted descriptor
(`createVisualizeHierarchyOutlineDescriptor`, `createVisualizeSourceFamilyOutlineDescriptor`,
`mountVisualizeOutline`): hierarchy/source-family roots with counts, kind glyphs (`i-ku`/`i-rep`/
`i-folder`), canonical-object-id `bdi` secondary lines, selection state, `activationDataset` wiring
(`data-visualize-select`) with click + keyboard semantics identical to before. `renderVisualizeHierarchyTree`
is retained unchanged as a compatibility export (LCORR01 29/0). `foundation/structured/outline-*.ts`
needed **no change** (the shared descriptor already carries the structure) — Library/Learn untouched.
Truth laws preserved verbatim: `Hierarchy unavailable`, `BOUND_VISUALIZE_PROVIDER_CONTAINMENT_NOT_OBSERVED`,
`AUTHORITY_GATED`, `data-tree-hierarchy-status="UNAVAILABLE_NOT_OBSERVED"`,
`Auxiliary source-family navigation — not hierarchy` (B3R F048 falsification PASS).
Measured: outline hosts 0→1, tree items 0→9 (3 source-family groups + 6 representations),
bespoke rows 6→0, hierarchy status unchanged (`UNAVAILABLE_NOT_OBSERVED` — not fabricated).

### F5 — bottom shelf: one mechanism, honest availability (mount-path part)
Hunk (`surfaces/m0-controller-composition.ts`): a conforming read-only `BottomDeepWorkProvider`
(`createDomainDeepBottomProvider`, contract from `bottom-provider-contract.js`) is registered per
W04/W05 surface at mount through `wave3Assembly.registerBottomProvider` (id-guarded), projecting the
surface's own `bottom`/`bottomProjection` truth; `renderTypedCollectionStage` gains `bottomInShelf`
and, when a provider is registered, stops writing the second `#domainBottomRegion` mechanism.
`BottomDeepWorkOwner` lifecycle (hidden+inert closed, focus return, tabs) is untouched.
Measured (evidence + configuration, both viewports):
- BEFORE `data-bottom-availability="UNAVAILABLE"`, `data-bottom-provider-owner=""`, toggle disabled,
  shelf closed forever; the authored deep projection ("Deep artifact inspection / Evidence revision
  lineage / Raw provenance") sat unreachable in the dead shelf content — the D3 defect as measured.
- AFTER `AVAILABLE`, `data-bottom-provider-owner="W04EvidenceDomain"` / `"ConfigurationDomainAdapter"`,
  toggle enabled, shelf opens (state `open`), and the deep content is reachable: summary
  `السجل · cand-proof-1`, section labels + real values (SourceRef `fixture-source-cand-proof-1@r1`,
  lineage revision ids, `Raw provenance: Candidate: true …`), closed state keeps the praised
  `مغلق — افتحه للسجل أو المقارنة أو الاسترداد` line.
Pixel delta `evidence populated-bottom` 0.4012 changed / `configuration populated-bottom` 0.2780.

---

## B. Consumer regression table (final build; every command re-run)

| Command | Measured |
|---|---|
| `node dist/tests/surfaces/evidence/domain.test.js` | pass:true (exit 0) |
| `node dist/tests/surfaces/reviews/domain.test.js` | pass:true (exit 0) |
| `node dist/tests/surfaces/mastery/domain.test.js` | pass:true (exit 0) |
| `node dist/tests/surfaces/portfolio/domain.test.js` | pass:true (exit 0) |
| `node dist/tests/surfaces/manual_ai/manual-ai-tests.js` | 12 / 0 |
| `node dist/tests/surfaces/releases/releases-tests.js` | 12 / 0 |
| `node dist/tests/surfaces/configuration/configuration-tests.js` | **11 / 1** — `configuration.no-preference-config-collapse`; CONCURRENT (see §C) |
| `node dist/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-structured-editor-core-tests.js` | exit 0 |
| `node dist/tests/rescue/S01_SHARED_STRUCTURED_EDITOR/s01-browser-proof.js` | **not runnable in Node** (`document is not defined` at load; browser-context harness, pre-existing) |
| `node dist/tests/rescue/S08_W01_W02_LIBRARY_LEARN/s08-falsification.js` | 17 / 0 |
| `node dist/tests/rescue/S09_W01_W02_RQ_VISUALIZE/s09-reexecution-tests.js` | 16 / 0 |
| `node dist/tests/post-c03/D08/d08-w02-visualize-parity-tests.js` | 10 / 0 |
| `node dist/ps02-spatial-finite-atomicity-tests.js` | 101 / 0 |
| `node tools/b3r-rq-visualize/falsify-b3r-corr03.mjs` | all checks PASS (F048 truth strings intact) |
| `node dist/tests/surfaces/enterprise/domain.test.js` | exit 0 |
| `node dist/tests/surfaces/scenarios/domain.test.js` | exit 0 |
| `node dist/tests/surfaces/labs/domain.test.js` | exit 0 |
| `node dist/tests/surfaces/runs/domain.test.js` + `group-regression.test.js` | exit 0 |
| `node dist/tests/surfaces/results/domain.test.js` | exit 0 |
| `node dist/tests/rescue/S10_W03_ENTERPRISE/*.js` (2) | exit 0 |
| `node dist/tests/rescue/S11_W03_SCENARIOS_LABS/*.js` (2) | exit 0 |
| `node dist/tests/rescue/S12_W03_RUNS/*.js` | exit 0 |
| `node dist/tests/rescue/S13_W03_RESULTS/*.js` | exit 0 |
| `node dist/tests/post-c03/D09/d09-w03-studios-replay-tests.js` | 10 / 0 |
| `node dist/tests/post-c03/LCORR03/lcorr03-central-integration-falsification-tests.js` | 15 / 15 (exit 0) |
| `node dist/tests/post-c03/LCORR01/lcorr01-parent-candidate-falsification-tests.js` | 29 / 0 (`renderVisualizeHierarchyTree` export intact) |
| `node dist/tests/rescue/CG5_W04_COVERAGE/w04-convergence.test.js` | pass:true |
| `node dist/tests/rescue/S14_W04_EVIDENCE_REVIEWS/domain-lifecycle.test.js` | pass:true |
| `node dist/tests/rescue/S14_W04_EVIDENCE_REVIEWS/surface-contract.test.js` | **exit 1** — `composition.context` undefined; CONCURRENT (see §C) |
| `node dist/tests/rescue/S15_W04_MASTERY_PORTFOLIO/domain-authority.test.js` | pass:true |
| `node dist/tests/rescue/S17_W05_VALIDATION_MANUAL_AI/s17-tests.js` | 12 / 0 |
| `node dist/tests/rescue/S19_W05_RELEASES_CONFIGURATION/s19-tests.js` | 17 / 0 |
| `node dist/tests/post-c03/D10/d10-w04-authority-lifecycle-tests.js` | exit 0 |
| `node dist/tests/post-c03/D11/d11-w05-provider-integration-tests.js` | exit 0 |
| `node dist/tests/post-c03/D03A/d03a-command-settings-convergence-tests.js` | 11 / 0 |
| `node dist/w4-e-settings-center-tests.js` | 36 / 0 |
| `node dist/w3-d-bottom-deep-work-tests.js` | exit 0 (closed lifecycle preserved) |
| `node dist/w5-c-structured-consumer-parity-tests.js`, `w6-c-structured-note-content-tests.js` | exit 0 |
| `node tests/surfaces/shell/surface.test.mjs`, `tests/surfaces/today/surface.test.mjs` | exit 0 |
| `node dist/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.js` | exit 0 |
| `node dist/tests/post-c03/D07/d07-today-presentation-authority-tests.js` | 15 / 0 |
| `tools/writer-serial.sh npm test` | **210 / 0** |
| `tools/writer-serial.sh node tools/check-contracts.mjs` | **165 PASS / 3 FAIL / 168 total** — the 3 are `browser.lineage_receipt_truthful`, `browser.current_candidate_claim_truthful` (browser receipt tree-sha staleness: recorded `4f5f…`/287 vs current tree; refresh at receipt execution) and `browser.targeted_visual_evidence` (`1 hash-bound screenshots; class=legacy`). Byte-identical across 3 runs all session; the brief's "171/2" is stale — 168 total matches the last committed receipt's total |
| `node tools/w01-conformance.mjs` | 19/2 mid-session → **18/3** final. Fails: `w01.read-only-roots-untouched` (my Owner-authorized F5 edit to `m0-controller-composition.ts`, uncommitted; clears at checkpoint commit — precedent `c855bc8`), `w01.writable-partition-only-expected-changes` (stale frozen expectation: its 8 expected files are clean vs HEAD, so it fails with zero local edits too; additionally my in-partition F2 edit to `foundation/workspace.ts` appears), `w01.candidate-identity-recomputed-and-recorded` (worktree identity drift — records drift, expects the frozen W01 tree) |
| `node tools/check-duplicate-mechanics.mjs` | exit 0 |
| `python3 tools/check-w03-semantic-ownership.py` | PASS 60/60 |

---

## C. Concurrent-agent shifts (re-run + attributed, not mine)

The shared serial worktree moved mid-session (`55a46d6`, `1077e93` committed; further uncommitted
edits landing live in `adapters/{configuration,manual_ai,releases}/domain-adapter.ts`,
`surfaces/{configuration,manual_ai,releases,mastery,portfolio}/composition.ts`,
`surfaces/{evidence,reviews}/index.ts`, new `surfaces/{evidence,mastery,portfolio,reviews}/presentation.ts`):
- `configuration-tests 12/0 → 11/1`: `configuration.no-preference-config-collapse` asserts
  `bottomProjection().providerTruth==='OPERATIONAL_CONFIG_AUTHORITY_UNAVAILABLE'`; the concurrent
  rewrite of `surfaces/configuration/composition.ts` moved `providerTruth` under `diagnostics`.
  My diff touches none of those files; the same test was 12/0 with all my fixes built in.
- `S14 surface-contract exit 0 → 1`: crashes at `composition.context.contract` (`context` undefined)
  after the concurrent `evidence/index.ts` (+33) / `reviews/index.ts` (162-line) rewrites.
Both belong to the live W04/W05 remediation stream; routing: that stream's author.

---

## D. Reported instead of taken (exact proposed hunks)

### D1 — F5 remainder: honest domain-section presentation in the bottom shelf
The mount-path provider fixes availability/ownership/reachability, but `BottomDeepWorkOwner`'s
presentation model only has `structured`/`operational` templates, whose fixed labels
("المراجعة الحالية / المسودة المحلية") are document-editing language. The domain deep projection
currently maps into the structured template (values preserved, labels imperfect — visible in the
`populated-bottom` captures). Owner-side change to finish D3's "shelf shows deep artifact / lineage /
provenance sections" with correct labels:

`stack/native-typescript/foundation/global/bottom-provider-contract.ts`:
```diff
-export const BOTTOM_DEEP_WORK_PROVIDER_FAMILIES=Object.freeze(['structured','operational']);
+export const BOTTOM_DEEP_WORK_PROVIDER_FAMILIES=Object.freeze(['structured','operational','domain']);
```
`stack/native-typescript/foundation/global/bottom-shelf.ts` (add; structured/operational untouched):
```diff
+function domainPresentation(projection,{tab='history'}={}){
+  const currentTab=safeTab(tab),sections=Array.isArray(projection.sections)?projection.sections:[];
+  const rows=sections.map(section=>`<article class="recovery-row"><div><strong dir="auto">${esc(section?.label||section?.id)}</strong><small><bdi dir="ltr">${esc(section?.id)}</bdi></small></div><p class="subtle">${esc(String(section?.summary??''))}</p></article>`).join('')||'<div class="context-warning">لا توجد أقسام عميقة مربوطة.</div>';
+  return {tab:currentTab,summary:`${tabLabel(currentTab)} · ${esc(projection.documentId??'')}`,html:`<div class="recovery-owner"><div class="context-warning"><strong>Deep projection · <bdi dir="ltr">${esc(projection.sourceOwner)}</bdi></strong><br>Read-only domain projection; no canonical content is owned here.</div><div class="recovery-list">${rows}</div></div>`};
+}
```
and in `presentationModel`:
```diff
-    const view=projection.family==='structured'?structuredPresentation(projection,{tab:currentTab,actionCapabilities,preferences}):operationalPresentation(projection,{tab:currentTab});
+    const view=projection.family==='structured'?structuredPresentation(projection,{tab:currentTab,actionCapabilities,preferences}):projection.family==='domain'?domainPresentation(projection,{tab:currentTab}):operationalPresentation(projection,{tab:currentTab});
```
Then flip `createDomainDeepBottomProvider` in `surfaces/m0-controller-composition.ts` to
`family:'domain'` and stop the interim history-frame mapping (the `sections` payload is already
carried in the provider projection). **No `main.ts` hunk is required** — mount-path
`wave3Assembly.registerBottomProvider` is sufficient for registration.

### D2 — Visualize LEFT structure pane ≥3-level populated tree (W02 VZ01 acceptance)
BLOCKED on content truth, not code: the bound provider exposes **no admitted canonical containment**
(`hierarchyProjection(): ok=false, VISUALIZE_HIERARCHY_UNAVAILABLE_NOT_OBSERVED`), and B3R F048
falsifies any fabricated hierarchy ("source-family grouping is auxiliary navigation only"). Honest
outline depth today = 2 (source-family → representations). The moment a provider supplies admitted
containment nodes, `createVisualizeHierarchyOutlineDescriptor` renders them at full depth with glyphs
and counts — no further code needed. Routing: fixture/provider admission (Owner/fixture-data), not
the shared component.

### D3 — donor.css `.phead h2{direction:rtl!important}` (cosmetic residue)
F2 overrides per heading inline. A donor.css cleanup could drop the forced direction (keep RTL as
pane default); suggested rule: `#leftPane .phead h2,#rightPane .phead h2{margin:0!important;…}` with
no `direction` override, leaving resolution to `dir=auto`. Not taken (donor.css out of scope).

---

## E. Sub-items proven unchanged
- `SpatialInteractionKernel` contract + geometry assumptions: kernel files untouched; cards keep the
  132×62 footprint; ps02 101/0; W03 consumers green.
- `renderVisualizeHierarchyTree` public export: retained; LCORR01 29/0.
- Library/Learn donor byte-stability: S08 17/0; `learn` frame pixel delta **0.0000** (byte-identical
  PNG); outline-host/outline-descriptor sources untouched.
- Truth laws: B3R F048 PASS (hierarchy "unavailable-not-observed" preserved; no
  `BALANCED6_STRUCTURE_TREE` fabrication); `canonical:false` / `READ_ONLY` /
  `canonicalInvariant` untouched; `hiddenProviderCalls:0`, `automaticCanonicalPublication:false`,
  `stagedVerifiedIsLiveRestored=false`, Portfolio `AUTHORITY_DECISION_REQUIRED`,
  `destinationCountFrozen=false`, reviews toolbar 4/4 + `ReviewAuthorityRegistry` gating — none
  edited; D10/D11/D03A/w4-e/CG5/S14-domain/S15/S17/S19 all green.
- `BottomDeepWorkOwner` hidden+inert closed lifecycle + focus return: w3d exit 0; closed summary line
  preserved in captures.

## F. Residual shared defects and routing
1. Bottom-shelf domain-section labels (structured template language over domain projections) →
   shared-component owner, hunks D1 above (the only remaining shared-piece work).
2. Visualize LEFT representation list duplicates the TREE projection rows (one information item, two
   display locations) → surface Writer (Visualize), out of F4 scope.
3. `.phead` donor rule (D3) → donor.css owner, cosmetic.
4. W02 L-series surface-level density/composition items (L01–L07 etc.) → surface Writers (untouched
   by design).
5. Concurrent-stream regressions (configuration 11/1, S14 surface-contract) → live W04/W05
   remediation stream (§C).
