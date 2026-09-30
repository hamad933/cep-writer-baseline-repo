# HANDOFF — W03-ENTERPRISE (surface `enterprise`)

**Status:** `NOT_OWNER_ACCEPTED` — sole Controller review required. This unit cannot accept its own work.
**Branch:** `writer/mi-serial` · **HEAD at final capture:** `d2b3e47615d2ddca738925a1f1b0df2d4449afab` · **Worktree: dirty, uncommitted by design** (no `git add` / `git commit` performed).
**Report:** `writer-output/W03-ENTERPRISE/VISUAL_EXECUTION_REPORT.json` (all 23 required fields).

---

## 1. What this workspace is for

Enterprise digital twin: model the organization's topology, assets and defensive posture — an
authoring workbench where an operator reads the twin (structure → topology → selection context),
then changes lifecycle state (create → relate → validate → publish → pin Baseline → prepare Run)
with explicit truth boundaries (published revisions immutable, Simulation-local never promoted,
geometry representation-only).

## 2. Reference authority used

| Reference | sha256 (16) | Dims | Classification | Governs |
|---|---|---|---|---|
| `…/Enterprise Cybersecurity Topology Dashboard.png` | `8b3b3e3b47693a54` | 1503×1046 | `CURRENT_FINAL_REFERENCE` | topology workbench, 3-pane IA, tab+action rows, legend, node composition |
| `…/CEP_ENTERPRISE_DIGITAL_TWIN_REVISION_BASELINE_REFERENCE.png` | `54939bae7d1f323a` | 1607×979 | `OWNER_CONFIRMED_SUPPORTING_MAJOR_STATE_REFERENCE` | revision/baseline state density, right-pane context depth |

Construction authority only (composition/hierarchy/IA/density/interaction), never pixel-copied;
reference language never used as product-language authority.

## 3. What was actually wrong (root causes, not cosmetics)

1. **Pane organization (V3)** — the surface rendered its *own* left/right rails inside the shell
   centre while the shell LEFT/RIGHT panes already existed: five visual columns, canvas crushed to
   **380px**. This was the composition failure the Owner rejected.
2. **Command duplication (V3)** — the surface header repeated all five shell-toolbar commands
   (9 buttons wrapping over three rows).
3. **Baked direction (V2)** — `root.dir` came from `workspace?.dir` (undefined → `ltr`), so the
   stage stayed LTR inside an RTL Arabic session.
4. **Node text collision (V2)** — shared `renderSpatialNode` draws id chip and status chip on one
   line; the fixture's `Type: …` status made them overlap in every node.
5. **Content density (V2)** — Revisions/Baselines views were thin (59/50 centre words) against a
   reference that is dense in those states.
6. **Lost affordance (V2)** — after de-duplicating commands the relation composer lost its only
   in-stage entry point.

## 4. What was changed (one file + evidence tooling)

`stack/native-typescript/surfaces/enterprise/presentation.ts` (targeted bounded edits only):

- **Shell-region projection** via the shared `workspace.region('LEFT'|'RIGHT'|'BOTTOM')` mechanics
  (same pattern as audit/configuration/scenarios/health/processing): structure → shell LEFT,
  selection context → shell RIGHT, temporary deep work → shell BOTTOM (**closed by default**), with
  surface-local sibling suppression + bounded self-healing MutationObserver and **in-stage
  fallbacks** for bands that collapse a pane. No shared file modified.
- **Header** rebuilt: eyebrow → title → state chips → 4 lifecycle commands with **one primary**
  (Validate). The five duplicated commands are gone from the header; the relation composer moved to
  the topology tool cluster (`Connect / edit relation`, zoom −/+, `Fit topology`).
- **Bilingual model** (en/ar, ~110 keys) resolved per render from the user preference; this domain's
  own command labels are localized; direction now **inherits the active document direction**.
- **Nodes composed** as icon tile + id + title + `Type: …` secondary line (presentation fields fed
  to the shared SpatialView) → zero text collisions.
- **Panels/structure/context** rebuilt as reference-shaped cards, kv lists, tables and context
  sections with fixture-derived data (no invented product content).
- Design system applied: type/spacing scales, chips with a fixed state→colour map, focus-visible,
  hover/disabled, one primary action, reduced-motion honoured, focus preserved across re-renders.

## 5. Evidence (hash-bound; supersedes retained)

- Tool: `writer-output/W03-ENTERPRISE/capture.mjs` (unit-owned) → `evidence/<label>/*.png` +
  `receipt-<label>.json` (path + sha256 + dims + bytes + viewport + dir/locale + timestamp + commit).
- **before** (11 frames, commit `68341ec18f79`) · **after1…after4** retained · **after5** (12 frames,
  final): LTR 1503/1024/820, RTL 1503, states topology / selected / composer / twins / revisions /
  baselines / state.
- `evidence/ocr-anchors-after5.txt` — tesseract anchors with coordinates, each block headed by the
  sha256 of the exact bytes read.
- `evidence/analysis-ink.json` — region ink before/after: left 0.0392→0.0871, right 0.0213→0.0378.
- `evidence/crops/sbs-ref-vs-cand-4e71.png` — reference above / candidate below for L1 review.

## 6. Verification results

- **Functional:** 12 frames, **0 page errors**, all enactments ok (tab switch, structure selection
  `APP-WEB-01`, relation composer `form:true`). `npm test` **exit 0**.
- **Structural:** all five slots owned and measurable (TOP 757×154, LEFT 278px/20 buttons/6 sections,
  CENTER 757×590, RIGHT 394px/5 blocks when selected, BOTTOM closed); suppressed siblings 6 left /
  3 right; right pane visible siblings = `[domainContext]` only.
- **Responsive:** 1503 panes open → 1024 right collapsed (in-stage context fallback) → 820 both
  collapsed (in-stage structure+context, wrapped header), **clipped=0**, every frame byte-distinct.
- **RTL/LTR:** `ar` → `dir=rtl`, Arabic surface strings, mirrored tabs/actions/legend/minimap,
  readout pinned opposite the legend; `en` → LTR mirror. BIDI: IDs/digests in `<bdi dir="ltr">`.
  *Limitation: tesseract ships only `eng`+`osd`, so Arabic was verified by DOM probes, not OCR.*
- **L1–L4** completed (see report for method and per-level anchors).
- **Shared build:** went transiently red once mid-session (`stripTypeScriptTypes: Unterminated regexp
  literal`), attributed by an exhaustive parse of all 322 sources to
  `stack/native-typescript/adapters/library-fixtures.ts` — another unit's in-flight edit. Per dispatch
  rules this unit did **not** touch it; retried after 45s → serialized build `pass:true`,
  `written:322`, `dist/surfaces/enterprise/presentation.js` regenerated from source sha256
  `a32a37c4429ab1f0…`.

## 7. Open items for the Controller

| ID | Severity | Item |
|---|---|---|
| **D-12 / B-1** | V3 | **Vision channel unreliable.** Three documented mismatches (canary read, side-by-side read, stale pre-fix crop) in `evidence/vision-verification.json`. Every visual claim here is hash + OCR + DOM-based. Re-verify L1/L2 with a working image channel before Owner submission. |
| **D-13 / B-2** | V2 | `npm run check`: 2/9 steps fail — browser receipt pins an older canonical tree while ≥10 units edit concurrently, and `check-build-authority` throws `CANONICAL_SOURCE_CHANGED_BY_STACK_PROOF`. Not enterprise-specific; regenerate both at the serialized checkpoint. **Did not** run `npm run browser:test` deliberately (would write a receipt that is stale again within seconds). |
| **D-04 / B-3** | V2 | **Shared-component request:** `foundation/spatial/presentation.ts` → `renderSpatialNode` should offset/truncate the status chip when it would collide with `idChip`. Mitigated consumer-side for ENTERPRISE; `visualize`/`runs` can reproduce it. |
| **B-4** | V1 | The generic shell left content (`main.ts` “Workspace views / Objects”) survives only where `workspace.region()` is unavailable (headless harness) — degraded but functional through the in-stage fallback. |

## 8. What to re-run

```bash
tools/writer-serial.sh npm run build:runtime
node writer-output/W03-ENTERPRISE/capture.mjs --label controller-review
node writer-output/W03-ENTERPRISE/capture.mjs --compare after5 controller-review
```
