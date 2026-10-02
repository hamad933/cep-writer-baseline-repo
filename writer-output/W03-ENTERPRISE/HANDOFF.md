# HANDOFF — W03-ENTERPRISE (surface `enterprise`) · lane **ENT-1**, RE-DISPATCH #2

**Class:** `CANDIDATE_ONLY / NO_SELF_PROMOTION` · **Status:** `NOT_OWNER_ACCEPTED` — sole Controller review required; this lane cannot accept its own work.
**Branch:** `writer/mi-serial-lane/ENT-1` · **Parent/identity:** commit `766ab95367dde5ce433a148cdecb602274fe6c0d`, tree `5926fac34eaf680abbaf95bc18023cb6fd2ee868` (= SH-1's adjudicated candidate `9f1dc785c2cc71bc6540f435efe6821b83cd2205` + the STOP-record commit; the relation-wiring fix is **in the base and was not redone**).
**Report:** `writer-output/W03-ENTERPRISE/VISUAL_EXECUTION_REPORT.json` (all 23 required fields).
**First dispatch:** STOP'd on an environment block; its record `writer-output/W03-ENTERPRISE/HANDOFF_ENT1_ENV_BLOCK.md` is **preserved byte-for-byte** in this commit.

---

## 1. What this workspace is for

Enterprise digital twin: model the organization's topology, assets and defensive posture — an authoring workbench where an operator reads the twin (structure → topology → selection context), then changes lifecycle state (create → relate → validate → publish → pin Baseline → prepare Run) with explicit truth boundaries (published revisions immutable, Simulation-local never promoted, geometry representation-only, fixture data never presented as provider truth).

## 2. Reference authority used

| Reference | sha256 (16) | Dims | Classification | Governs |
|---|---|---|---|---|
| `…/Enterprise Cybersecurity Topology Dashboard.png` | `8b3b3e3b47693a54` | 1503×1046 | `CURRENT_FINAL_REFERENCE` | topology workbench, 3-pane IA, tab+action rows, legend, node composition |
| `…/CEP_ENTERPRISE_DIGITAL_TWIN_REVISION_BASELINE_REFERENCE.png` | `54939bae7d1f323a` | 1607×979 | `OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE` | revision/baseline state density, right-pane context depth |

Both re-hashed this session and matching the packet. Construction authority only; reference language is never a product-language authority.

## 3. Changed paths (this lane's scope only)

| Path | Change |
|---|---|
| `stack/native-typescript/surfaces/enterprise/presentation.ts` | **2 lines** (1 defect fix, D-14): `.enterprise-modebar` + `flex-wrap:wrap;row-gap:0` + 6px end padding; `.ent-tools` `position:sticky;inset-inline-end:0` → `position:relative`. sha256 `90331aab…` → `3d1e35e3…` |
| `writer-output/W03-ENTERPRISE/capture.mjs` | evidence tool: candidate branch/tree recorded truthfully; DAG-mandated `1440×1000` and `1024×900` **AR/RTL + EN/LTR** case rows added |
| `writer-output/W03-ENTERPRISE/{d-ledger-probe,shared-hotspot-probes,hittest-probe,modebar-probe,falsification}.mjs`, `{make_vision_probes,make_comparisons}.py` | new unit-owned probes/manifest generators |
| `writer-output/W03-ENTERPRISE/evidence/**` | `ent1-rev1/` (19), `ent1-rev2/` (19), `vision-probes/`, `comparisons/`, probe JSONs, receipts, comparisons, `vision-verification-ent1.json` |
| `writer-output/W03-ENTERPRISE/{VISUAL_EXECUTION_REPORT.json,HANDOFF.md}` | this cycle's mandatory output |

**Not touched:** `adapters/enterprise/domain.ts`, `adapters/w03-v34/**` (fixtures), `surfaces/enterprise/index.ts`, `main.ts`, `surfaces/m0-controller-composition.ts` (SH-1 fixed wiring), `foundation/**`, `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `dist-ts/**`, `tools/**`, other lanes, `surfaces/runs/**`, `writer/mi-serial`, `main`.

## 4. CP-003 mismatch resolution — **by fresh capture + compare only, never from rescue evidence**

Rescue `after5` was inspected first (12 PNGs + receipts + D-ledger + rescue lineage intact, nothing reverted/reset/deleted) and then **superseded for acceptance purposes** by two fresh rounds at exact current source.

| CP-003 item | Fresh artifact (this session) | Byte ground truth | Read result | Verdict |
|---|---|---|---|---|
| **VV-01 canary** | `evidence/vision-probes/vv01-canary-8417.png` | sha `d046d5df…`, 640×220, OCR `ENT1 VV01 CANARY 8417 / NONCE 8417 FRESH 766AB95 / MAGENTA 200 0 160` | returned exactly that canary | **RESOLVED** |
| **VV-02 side-by-side** | `evidence/vision-probes/vv02-sbs-reference-vs-ent1-rev1.png` | sha `8117306c…`, 1232×1870, OCR `REFERENCE … 8b3b3e3b47693a54` / `CANDIDATE ent1-rev1 … 7a901262dcb92dc2` | returned reference-on-top / candidate-below with both label bands | **RESOLVED** |
| **VV-03 stale after1 frame** | `evidence/vision-probes/vv03-crop-ltr-1503-topology-ent1-rev1.png` | sha `5d64838a…`, 1080×570, OCR = current-source layout | returned the **current-source** layout (structure in the shell LEFT pane, no duplicated rail inside the stage) | **RESOLVED** |
| **VV-04 / VV-05 (NEW)** | `evidence/comparisons/l2a-…png`, `…/l3-components-….png`, same bytes copied to `vision-probes/` | sha + OCR recorded in `comparisons/manifest.json` + `ocr-anchors.txt` | **3 consecutive reads of 2 paths in 2 directories all returned the same stale cached L1 frame** (superseded label `L1 CANDIDATE ent1-rev1`, candidate sha `2aca5e12b12412db` — bytes that no longer exist at any requested path) | **OPEN (VD-008 recurrence)** |

Consequence: **L1** is carried by verified image-channel reads; **L2/L3/L4** carry sha256-verified bytes + tesseract OCR of those bytes + pixel statistics + live DOM geometry, **never an unverified read**. Full record: `evidence/vision-verification-ent1.json`.

**Pixel-level answer to "does the salvage still hold at current source?":**
- `after5` vs `ent1-rev1`, 5 overlapping frames: every diff bbox is `(232,0,1161,45)` — the **shell destination row only**; the enterprise surface starts at `y=218` and is **pixel-identical**. AR/RTL frames are byte-identical in full (`rtl-1503-topology` sha `2aca5e12b124` in both rounds).
- The one shell-row difference root-caused (D-15): `.global-shell-destinations` used `justify-content:center` with `overflow-x:auto`, start-clipping the first chip — OCR reads `lay (W01)` in after5 vs `Today (W01)` now; already fixed by shared commit `2eafa13` (`justify-content:safe center`) in `foundation/extensions.css`. **Shell chrome is SH-1/W01-owned → recorded, not fixed by ENT-1.**
- `ent1-rev1` vs `ent1-rev2`: diff bbox starts at `x=315,y=380` — the D-14 centre-column reflow; left/right panes unchanged; word counts and clipped sets identical.

## 5. D-ledger status (D-01 … D-08) — **visual/DOM evidence, not static markers**

Measured by `d-ledger-probe.mjs` at **1440×1000 + 1024×900 × EN/LTR + AR/RTL**, topology/selected/revisions states (`evidence/dledger-probe.json`; pre-fix snapshot `dledger-probe-prefix.json`).

| ID | Ledger (rescue) | Verified at current source | Evidence | Residual |
|---|---|---|---|---|
| **D-01** pane projection | FIXED | `left/right/bottomRegionOwned=true` ×4 viewports, `nestedRailsInsideStage=0`, hidden siblings 6/3, `visibleRightSiblings=['domainContext']` | `D01` + L2 left/right crops | none |
| **D-02** command duplication | FIXED | header commands = 4 (`Create workspace, Pin exact Baseline, Validate, Publish revision`), `duplicated=[]` ×4; shell toolbar keeps its 5 | `D02` + L3 header crop | none |
| **D-03** baked direction | FIXED | `stageHasBakedDirAttr=null`, `documentDir==stageDirection` (rtl/rtl, ltr/ltr) ×4, `inherited=true` | `D03` | none |
| **D-04** node chip collision | FIXED_CONSUMER_SIDE | consumer: `nodeTextOverlaps=[]` every frame ×2 rounds ×4 viewports; **shared root PROVEN still colliding**: `renderSpatialNode(status='Type: Web Application')` (len 21 ≤ 22) emits `statusChip x=119,y=21` beside `idChip x=31,y=21`, `sameBaseline=true` | `shared-hotspot-probes.json` D04; shared sha `06afda5a…` | **HOTSPOT at shared root** (foundation/spatial/presentation.ts) — not fixed (outside roots) |
| **D-05** structure truncation | FIXED | `clippedRows=[]`, 8/8 sampled rows `clipped=false` ×4 | `D05` | none |
| **D-06** hint ellipsis | FIXED | hint present, `hintClipped=false`, absent from clipped list ×4 | `D06` | none |
| **D-07** revisions overflow | FIXED | `.ent-table-wrap` present, `overflow-x:auto`, `min-width:0px`, `tableWiderThanCard=true` with `clippedCards=[]` ×4 | `D07` | none |
| **D-08** RTL legend/readout | FIXED_SURFACE_SIDE | surface override present in the cascade; `legendReadoutOverlap=false`, `legendMinimapOverlap=false` ×AR/RTL+EN/LTR; **shared root still declares physical `left:14px` + `direction:ltr` + `left:20px`/`right:12px`** (sha `333ebe4d…`) | `shared-hotspot-probes.json` D08 | **HOTSPOT at shared root** (foundation/extensions.css) — not fixed; **honest limit:** the collision did *not* reproduce in visualize/runs/labs at 1440×1000 AR/RTL (readout not laid out / no legend / direction already rtl) — condition persists, live collision elsewhere **not** observed |

**New defects this cycle**

| ID | Sev | What | Status |
|---|---|---|---|
| **D-14** | V2 | Mode-tab occlusion: `.ent-tools` (`position:sticky`, 358px) covered `State / Validation` at 1503/1024/820 and `Baselines`+`State` at 1440 (`elementFromPoint` → `BUTTON.ent-btn`); mode row `scrollWidth 889 > clientWidth 757/694/709/820`. 1 of 5 modes not directly reachable at rest. | **FIXED → rebuilt → re-probed (`covered=[]` ×4, `scrollWidth==clientWidth` ×4) → re-captured (`ent1-rev2`, 19 frames, 0 pageerrors, identical word/clipped sets) → re-compared** |
| **D-15** | V2 | Shell destination chip `lay` vs `Today` (after5 epoch), root cause `2eafa13` safe-center fix in shared CSS | **RECORDED, not fixed** (shell chrome, SH-1/W01-owned) |
| **D-12** | V3 | Vision channel (see §4) | CP-003 part **closed**, VV-04/05 **open** |
| **D-13** | V2 | Receipt-lineage reds under concurrency | **No longer reproduced**: `npm run check` = exactly 1 red (`browser.lineage_receipt_truthful`), `current_candidate_claim_truthful` + `targeted_visual_evidence` PASS |

## 6. Tests and falsification

**Tests (post-fix, at this base):**

| Run | Result |
|---|---|
| `npm run build:runtime` ×2 | `pass:true`, `written:323` |
| `npm test` | **210 / 0** (run twice → byte-identical output apart from the `date` field) |
| `node tools/w03-browser-flows.mjs` | **7 / 7 PASS**, exit 0 (incl. `enterprise-twin-baseline`) |
| `node tools/browser-conformance.mjs` | **5 / 1**, exit 1 — identical to the pre-fix baseline at this base |
| `dist/tests/surfaces/enterprise/domain.test.js` | rc 0 |
| `dist/tests/rescue/S10_W03_ENTERPRISE/*` (2) | rc 0 |
| `dist/tests/rescue/CG4_W03_COVERAGE/*` (3) | rc 0 |
| `dist/tests/post-c03/D09/d09-w03-studios-replay-tests.js` | rc 0 (`pass:10`) |
| `node tools/w03-profile-coverage.mjs` | PASS 107/107 |
| `node tools/check-duplicate-mechanics.mjs` | PASS (N4) |
| `npm run check` | exit 1 with **exactly one** documented red: `browser.lineage_receipt_truthful` (6/6 truth guard) — **not faked green** |

**Falsification (`evidence/falsification.json` — N1, N2, N3, LANE all `true`):**

- **N1 non-owned writes refused** — `git status` classified against the sealed roots: **21 owned**, **25 mandated-tool** (`dist/`, `assurance/`, `writer-output/W03/`, `stack/MEASURED_COMPARISON.json`) left **unstaged and disclosed**, **0 OUT_OF_ROOT**. Explicit refusal list recorded for `controller/**`, `cep-writer/**`, `contracts/**`, `profiles/**`, `authority/**`, `dist-ts/**`, `tools/**`, `main.ts` + `m0-controller-composition.ts`, `adapters/w03-v34/**`, `surfaces/runs/**`, `writer/mi-serial`, `main`.
- **N2 boundary / invalid input** — `--compare` with a nonexistent label **throws and writes no receipt**; `enact('definitely-not-a-mode')` → `{ok:false, reason}` with the centre unchanged; `?surface=definitely-not-a-surface` renders **no** enterprise stage (`NO_FABRICATION`).
- **N3 provider absent → truthful unavailable** — `#domainContext` carries `FIXTURE_ONLY__NOT_PRODUCT_TRUTH`, `Canonical product truth false`, `Persistence UNAVAILABLE`; **no** enterprise provider key on `CEPFoundation`; canonical provider registry **ABSENT**. Fixture data is never presented as provider truth.
- **N4 duplicate mechanics** — PASS (exit 0).
- **N5 suite ×2** — identical (210/0 both; only the `date` field differs).
- **Lane-specific** — mismatch resolution **by re-capture only**; fixture + adapter hashes **identical before/after**; **single** shared SpatialView instance (`svg.spatial-canvas` count = 1, `data-spatial-instance='spatial-1'`) ×4; **`selectionCount>0` preserved** from the visible endpoint (readout `1 selected`, `aria-pressed=true`) ×4; **0 pageerrors** across both 19-frame rounds.

## 7. The four truths (separate)

1. **Build/test truth:** `build:runtime` PASS (323); `npm test` **210/0** twice; `npm run check` exit 1 with exactly the documented one red; flows **7/7**; conformance **5/1**; S10/CG4/D09/enterprise/profile-coverage PASS.
2. **Visual truth:** two fresh 19-frame rounds at exact current source, hash-bound, 0 pageerrors; the salvage candidate **survives at current source** (enterprise region pixel-identical to after5, except the shell destination row D-15 and the intentional D-14 reflow); L1 verified by image read, L2–L4 verified programmatically; **vision verification PARTIALLY OPEN** (VV-04/VV-05).
3. **Flow truth:** `relation.route-convergence-and-label-scope` **FAIL at its first assertion** (F-SH1-01 — `.first()` fixture edge APP-WEB-01→CTL-WAF-01 is horizontal → zero-height bbox → visibility 0), **reported as-is and unmanipulated**; diagnostic: `relationUiSharesPublishedSpatial=true`, `relationUiSpatialConnected=true`, `publishedSpatialConnected=true`, `adapterRelationCount=8`, `publishedSpatialEdgeCount=8`, `canvases[{connected:true,hidden:false,edges:8,labels:8}]`, `selectionCount=0`. `central-change-reuse` **PASS**; `spatial.selection-connect-canonical-edge` PASS at both viewports; workspace/runtime/bidi flows PASS.
4. **Authority / H03 truth:** H03 PROP/FALSIFY stay **`NOT_PROVEN`** — SH-1's instance/selection fixes are cited as *observed facts* only, never as propagation proofs. Owner items (shell redesign · RQ reference promotion · F-048 · destination-count freeze) untouched, record-only. No self-acceptance, no promotion, no merge, no release.

## 8. Evidence index

- Receipts: `evidence/receipt-ent1-rev1.json`, `receipt-ent1-rev2.json` (19 frames each; commit + tree + viewport + dir/locale + timestamp + sha256 + dims + bytes per PNG).
- Comparisons: `evidence/comparison-after5-vs-ent1-rev1.json`, `comparison-ent1-rev1-vs-ent1-rev2.json`.
- Probes: `evidence/dledger-probe.json` (+ `-prefix`), `shared-hotspot-probes.json`, `falsification.json`.
- Vision: `evidence/vision-verification-ent1.json`, `vision-probes/manifest.json`, `comparisons/manifest.json`, `comparisons/ocr-anchors.txt`.
- L1–L4 composites: `evidence/comparisons/l1-ref-vs-candidate-{rtl,ltr}.png` (2024×766), `l2-regions-…png` (1264×4318), `l3-components-…png` (1132×1939), `l4-micro-…png` (700×1236).
- Required viewport matrix (sha256-bound): `1440×1000` EN/LTR + AR/RTL, `1024×900` EN/LTR + AR/RTL, × {topology, selected, revisions} in `evidence/comparisons/manifest.json → requiredViewportMatrix`.
- Superseded-but-retained: `evidence/{before,after1,after2,after5}/`, rescue `vision-verification.json`, pre-fix `dledger-probe-prefix.json`.

## 9. Unresolved findings

| ID | Sev | Item | Owner |
|---|---|---|---|
| **VV-04 / VV-05** | V3 | Image channel serves a stale cached frame regardless of path/directory → L2/L3/L4 need a working channel before human-quality sign-off | Controller / evidence channel |
| **D-04 residual** | V2 | `foundation/spatial/presentation.ts renderSpatialNode` has no id/status chip collision handling (reproduced node-level); ENTERPRISE mitigated consumer-side; other spatial consumers may reproduce | Controller → serialized shared-component slot |
| **D-08 residual** | V1 | `foundation/extensions.css` pins `.spatial-readout{left:14px}` + `direction:ltr` + physical legend/minimap sides (never mirrors); condition persists, live collision **not** observed in visualize/runs/labs at the measured viewport/state | Controller → serialized shared-component slot |
| **F-SH1-01** | V2 | `relation.route-convergence-and-label-scope` first assertion blocked by a horizontal fixture edge (zero-height bbox) — harness/fixture, Controller-owned at convergence. **No fixture reorder, no geometry/adapter edit made.** | Controller / harness owner |
| **B-4 / D-13 lineage** | V1/V2 | Structure-row click drives the selection context while the canvas readout stays `0 selected` (canvas click → `selectionCount=1`); no after5 baseline recorded, so **no regression claimed**. Receipt regeneration must be a serialized Controller checkpoint action. | Controller (informational) |

## 10. Owner / STOP notes

- **Owner-facing items, record-only, untouched:** shell redesign (`OWNER-20260910-010`) · RQ reference promotion (`REVIEWED_FINAL_CANDIDATE`) · Visualize `F-048` hierarchy projection · destination-count freeze (`C03-GATE-023`).
- **H03 PROP/FALSIFY:** `NOT_PROVEN` — unchanged; not upgradeable by static evidence; the dedicated proof lane (H03R2-1) is the only path.
- **No STOP taken this cycle** — no shared-seam write was needed (D-04/D-08 were recorded as hotspots instead), no authority conflict, evidence produced truthfully, scope stayed inside the sealed `ENT-1` row.
- **Status remains `NOT_OWNER_ACCEPTED`.** CANDIDATE_ONLY, nothing pushed to any branch other than `writer/mi-serial-lane/ENT-1`.

## 11. Mandated-tool writes outside this lane's roots (disclosed, left unstaged)

Running the mandated commands rewrote shared/other-lane artifacts. Per dispatch §(6) they are **disclosed, left unstaged, not committed**:

- `dist/**` (`foundation/extensions.css`, `surfaces/enterprise/presentation.js`, `surfaces/m0-controller-composition.js`) — restored with `git checkout -- dist` at the end of the cycle.
- `assurance/**` (`BROWSER_CONFORMANCE_RECEIPT.json`, `CONTRACT_TEST_RESULTS.json`, `MODEL_TEST_RESULTS.json`, `SCREENSHOT_MANIFEST.json`, 3 PNGs) — restored with `git checkout -- assurance`.
- `stack/MEASURED_COMPARISON.json` — restored with `git checkout -- stack/MEASURED_COMPARISON.json`.
- `writer-output/W03/**` (another lane's workspace, written by `tools/w03-browser-flows.mjs` + `tools/w03-profile-coverage.mjs`): `BROWSER_RECEIPT.json` and `PROFILE_COVERAGE.json` modified; 7 evidence PNGs dated `20260929T1841*Z-3da01fa0` **deleted by the flow tool** and 7 new ones dated `20261002T0728*Z-f37580e5` written. **Left exactly as the mandated tool left them, unstaged and undiscarded** — the Controller may restore the superseded set with `git checkout -- writer-output/W03/evidence`. This lane did not otherwise write there.

## 12. What to re-run

```bash
npm run build:runtime
node writer-output/W03-ENTERPRISE/capture.mjs --label ent1-rev3
node writer-output/W03-ENTERPRISE/d-ledger-probe.mjs
node writer-output/W03-ENTERPRISE/hittest-probe.mjs          # expect coveredTabs = NONE
node writer-output/W03-ENTERPRISE/falsification.mjs
node tools/w03-browser-flows.mjs                              # expect 7/7
node tools/browser-conformance.mjs                            # expect 5/1 at this base
```
