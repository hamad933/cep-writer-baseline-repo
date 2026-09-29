# SERIALIZED_HOTSPOT_REQUEST — W01 (residual round, W01-F)

**File:** `writer-output/W01/SERIALIZED_HOTSPOT_REQUEST.md` · **Workspace:** W01 · **Status:** **FILED, NOT APPLIED**
**Author:** W01 writer (`writer/mi-serial`) · **Date:** 2026-09-29 · **Reason for filing:** `controller/12_execution/02_parallel_dispatch.md` §3 forbids Writers from editing `stack/native-typescript/surfaces/m0-controller-composition.ts` and `stack/native-typescript/main.ts`. This hunk needs the former, so it is proposed here for the Coordinator/Controller to apply — W01 did **not** touch either hotspot.

---

## 1. The defect (measured, not assumed)

**Today LEFT-region `Filter · …` summary is not re-rendered after `today.filter`.**

The LEFT region is written **once**, at mount time, by `m0-controller-composition.ts` from
`adapter.lastProjection || adapter.project()`. Every later `today.filter` re-renders only the
CENTER workbench (`composeTodayOrchestrationPresentation().render()`), so the LEFT summary keeps
the filter that was current at mount.

Measured on the exact candidate by `node tools/w01-cbf-probe.mjs` →
`writer-output/W01/CBF002_PROBE.json` (post-CBF-002-repair run, so this is an isolated residual):

| observation | CENTER pressed (`ATTENTION`) | LEFT summary |
|---|---|---|
| `03-after-attention-click` | `true` | `Filter · ALL` |
| `05-after-forward-restore` | `true` | `Filter · ALL` |
| `06-after-manual-attention-click` | `true` | `Filter · ALL` |
| `07-direct-today.filter-command` | `true` | `Filter · ALL` |

CENTER and LEFT disagree on screen at the same instant → the surface presents two different
truths for one state token. This is a presentation-truthfulness defect, not a data defect: the
adapter, the semantic command receipt (`today.filter`, owner `TodayProjectionDomainAdapter`) and
`canonicalWrites:false` are all correct.

---

## 2. Exact proposed hunk

### 2a. Serialized hotspot — `stack/native-typescript/surfaces/m0-controller-composition.ts`

* **File status:** untouched, byte-identical to HEAD (`git status --porcelain` on the path is empty)
* **Affected line:** **203** (single 1593-character line; the `if(consumer==='today'){…}` branch)
* **Adjacent anchors:** line 202 = `if(consumer==='shell'){…}`, line 204 = `if(consumer==='rq'){`
* **Scope of change:** line 203 only. Lines 202, 204–243 and every other line must remain byte-identical.

**OLD (exact substring of line 203, from `if(consumer===` through `label:'Today projection'});`):**

```text
if(consumer==='today'){const adapter=new TodayProjectionDomainAdapter({providers:Array.isArray(context.todayProviders)?context.todayProviders:[],continuationResolver:context.todayContinuationResolver||null});const stage=ensureStage({consumer});setBanner(consumer,'Today · Projection','Projection only · no canonical progress or Mastery writes');const composed=composeTodayOrchestrationPresentation({host:stage,commands:registry,adapter,workspace}),projection=adapter.lastProjection||adapter.project(),selected=projection.items?.[0]||null;workspace.region('LEFT',{html:`<section class="m0-domain-nav"><h2>Today projection</h2><p>Filter · <bdi dir="ltr">${html(projection.filter||'ALL')}</bdi></p>${compactRegionList(projection.items||[])}</section>`,label:'Today projection'});
```

**NEW:**

```text
if(consumer==='today'){const adapter=new TodayProjectionDomainAdapter({providers:Array.isArray(context.todayProviders)?context.todayProviders:[],continuationResolver:context.todayContinuationResolver||null});const stage=ensureStage({consumer});setBanner(consumer,'Today · Projection','Projection only · no canonical progress or Mastery writes');const renderTodayLeftRegion=(projection=adapter.lastProjection||adapter.project())=>workspace.region('LEFT',{html:`<section class="m0-domain-nav"><h2>Today projection</h2><p>Filter · <bdi dir="ltr">${html(projection.filter||'ALL')}</bdi></p>${compactRegionList(projection.items||[])}</section>`,label:'Today projection'});const composed=composeTodayOrchestrationPresentation({host:stage,commands:registry,adapter,workspace,onProjection:renderTodayLeftRegion}),projection=adapter.lastProjection||adapter.project(),selected=projection.items?.[0]||null;renderTodayLeftRegion(projection);
```

**Diff form (line 203 only):**

```diff
- …writes');const composed=composeTodayOrchestrationPresentation({host:stage,commands:registry,adapter,workspace}),projection=adapter.lastProjection||adapter.project(),selected=projection.items?.[0]||null;workspace.region('LEFT',{html:`<section class="m0-domain-nav">…</section>`,label:'Today projection'});
+ …writes');const renderTodayLeftRegion=(projection=adapter.lastProjection||adapter.project())=>workspace.region('LEFT',{html:`<section class="m0-domain-nav">…</section>`,label:'Today projection'});const composed=composeTodayOrchestrationPresentation({host:stage,commands:registry,adapter,workspace,onProjection:renderTodayLeftRegion}),projection=adapter.lastProjection||adapter.project(),selected=projection.items?.[0]||null;renderTodayLeftRegion(projection);
```

Why this shape: the LEFT-region markup grammar (`m0-domain-nav`, `compactRegionList`, `html`,
`label`, the `<bdi dir="ltr">` token) is owned by `m0-controller-composition.ts`. Extracting it
into a local function and handing it to the Today composition as an `onProjection` callback keeps
**one** owner of the region grammar (no duplicate presentation mechanic, `P-CHECK-DUP` stays PASS)
while letting the composition re-run it whenever it re-renders. The explicit
`renderTodayLeftRegion(projection)` after `compose…` preserves today's mount-time behaviour even
if the callback is dropped, so the change degrades safely rather than silently.

### 2b. Companion half — `stack/native-typescript/surfaces/today/surface.ts` (W01-writable, **also not applied**)

W01 did not apply this either: shipping the consumer of a callback that does not exist yet would
be a dead parameter. Both halves must land in the same change.

```diff
--- a/stack/native-typescript/surfaces/today/surface.ts
+++ b/stack/native-typescript/surfaces/today/surface.ts
@@ -55,7 +55,7 @@
-export function composeTodayOrchestrationPresentation({host,commands,adapter,workspace=null,lang=null}={}){
+export function composeTodayOrchestrationPresentation({host,commands,adapter,workspace=null,lang=null,onProjection=null}={}){
@@ -76,6 +76,7 @@
       }
     });
+    if(typeof onProjection==='function'){try{onProjection(adapter.lastProjection||adapter.project())}catch(error){console.error('Today region projection hook failed',error)}}
     restoreFocus(restore);
     return presentation;
```

(Exact anchors in the current file: signature at line 55, the `});` closing
`renderTodayOrchestrationProjection(` at line 77, `restoreFocus(restore);` at line 78.)

---

## 3. Requirement / obligation ids this closes

| obligation | surface · layer | how the hunk relates | matrix status *after* the W01-F run | does this hunk change it? |
|---|---|---|---|---|
| `OBL-000003` | today · `CURRENT_IDENTITY` (SurfaceIdentity) | *"preserve … region composition, commands, **state semantics** …"*; `proof_requirement = Source + executable route + state/interaction proof`. The LEFT summary is a state-semantics claim the surface currently renders wrongly. | `PASS` (`R-IDENTITY-TODAY`) | **No row flip.** The stale LEFT token is *not* covered by any PASS claim today and is recorded as a bounded residual in `W01_HANDOFF.md` §6/§RESIDUAL ROUND. The hunk removes the residual from the product. |
| `OBL-001774` | today · `CURRENT_RESULT_AUDIT` | current result status carries `…_CBF002_CBF003_AND_GENUINE_ROUTE_OPEN`; this request is the routed disposition of that residual. | `PASS` (`R-RESULT-AUDIT`) | No row flip. |
| `OBL-003358` | today · `ZL01_ROOT_FINDING` **A02-PF-002** (P0, `CURRENT_BLOCKER`) | *"correct semantic/content binding at the proper shared composition seam"* — this is exactly that seam. | `BLOCKED` (`R-FINDING-OPEN-BLOCKED`) | **No** — the row needs Controller convergence / Owner adjudication, which a Writer may not supply. The hunk is the W01-discoverable half of the correction. |
| `OBL-001400` | today · `OWNER_DECISION` `SURFACE_IDENTITY_FUNCTIONAL_COMPLETENESS_RESCUE_GATE` | *"must not be accepted … where it loses … **region composition** … **state semantics**"* | `BLOCKED` (`R-OD-OWNER-EVIDENCE-BLOCKED`) | **No** — Owner acceptance is the named missing authority. |
| `OBL-000001` | shell · `CURRENT_IDENTITY` (return continuity) | sibling finding **CBF-002**, repaired in this round (see §5) | `PASS` (was `FAIL` at W01-E) | **Yes — already closed by the W01-F repair, not by this hunk.** |

**Net matrix effect of filing this request: zero rows change status.** Its value is product truth
plus an explicit, routed disposition of a residual that the W01-E handoff had only *bounded*.
No row is flipped to `PASS` on the strength of a proposal.

---

## 4. Negative cases the hunk must NOT break

1. **No Today canonical write.** `profiles/today.json` invariants *"No Today canonical domain
   writes"* and *"Progress is a projection; Mastery is W04-owned"*. The re-render is
   presentation-only: the hunk must not call `setFilter`, `refresh`, `resume`, any provider, or
   add a domain write. `descriptor().canonicalWrites === false` and
   `binding.canonicalWrites === false` must stay `false`; `mastery` must stay
   `NOT_INFERRED__W04_OWNED`.
2. **One presentation owner, one region grammar.** LEFT must remain a *summary* — it must not
   grow a second Today workbench, and the `m0-domain-nav` template must stay single-owned in m0
   (no copy of `compactRegionList`/`html` in `surfaces/today/**`).
   `node tools/check-duplicate-mechanics.mjs` must stay **PASS**.
3. **`today.filter` stays single-registered.** `SemanticCommandBus.registerCommand` rejects
   `DUPLICATE_COMMAND_OWNER`; the receipt owner must remain `TodayProjectionDomainAdapter` and
   the W01-F "commands drive the mounted adapter" behaviour must be preserved.
4. **CBF-002 must not regress.** Back/forward must still re-apply the filter and must never
   report a route-only restore as a context restore
   (`cbf.context-restored-on-forward`, `cbf.native-context-preserved`,
   `cbf.restore-reported-only-when-context-applied`), and after this hunk LEFT must follow the
   same restore (`Filter · ATTENTION` after Back/Forward).
5. **No invented `domain-diagnostics` bottom tab** (packet §3 A-2) — the hunk must not add one;
   `w01.domain-diagnostics-tab-not-invented` must stay PASS.
6. **Q-1 not decided.** `destinationCountFrozen=false`, five-destination baseline and
   `data-shell-destination-count="5"` / `data-shell-route-count="23"` unchanged.
7. **RTL/BiDi + protected CSS.** Keep `<bdi dir="ltr">`, the `·` separator, `label:'Today
   projection'` and `direction:inherit` geometry exactly as-is so the protected
   `foundation/extensions.css` needs no change; the LEFT region must render identically in `ar`
   and `en`.
8. **RIGHT/BOTTOM unchanged.** The hunk deliberately re-renders only LEFT — the only token that
   moves with `today.filter`. RIGHT (`Selected Today context`) and BOTTOM (`Projection status`)
   keep their current semantics.
9. **Keyboard/focus must not move.** Re-rendering LEFT must not steal `document.activeElement`
   from the filter toolbar or reset scroll; the matched-viewport keyboard proof must stay PASS.

---

## 5. Verification W01 would run after applying the hunk

Run in this order (all commands already exist and are green today):

| # | command | oracle |
|---|---|---|
| 1 | `tools/writer-serial.sh node tools/build-runtime.mjs` | `dist/` regenerated from source (`pass: true`, `CANONICAL_SOURCE_TO_GENERATED_ONLY`); no hand edit to `dist/**` |
| 2 | `node tools/w01-cbf-probe.mjs` → `writer-output/W01/CBF002_PROBE.json` | **the acceptance oracle for this hunk:** `leftFilterSummary` must read `Filter · ATTENTION` in observations `03`, `05`, `06`, `07` (today it reads `Filter · ALL` in all four) while `domPressed` stays `true` |
| 3 | `node tools/w01-browser-flows.mjs --flow today.render-and-filter` (+ a new `today.left-region-follows-filter` check to be added to that flow) | 6-filter set complete, LEFT summary equals `adapter.filter` after the ATTENTION click |
| 4 | `node tools/w01-browser-flows.mjs` (all five) | 5/5 PASS — CBF-002 must not regress (see §4.4) |
| 5 | `node tools/w01-visual-capture.mjs` | 32/32 PASS at 1440×1000 **and** 1024×900, LEFT summary visible and correct in both `matched-viewport-baseline` captures |
| 6 | `tools/writer-serial.sh node tools/w01-conformance.mjs` | 21/21 PASS (incl. `w01.writable-partition-only-expected-changes` with the m0 hunk listed in `expectedChanged`) |
| 7 | `node tests/surfaces/today/surface.test.mjs` · `node tests/surfaces/shell/surface.test.mjs` · `node dist/tests/rescue/S07_W01_W02_SHELL_TODAY/s07-contracts.test.js` · `node dist/tests/post-c03/D07/d07-today-presentation-authority-tests.js` | PASS (9 / 8 / PASS / PASS) |
| 8 | `tools/writer-serial.sh npm test` · `tools/writer-serial.sh npm run check` · `tools/writer-serial.sh node tools/check-duplicate-mechanics.mjs` | `npm test` 210/0; `npm run check` — only the pre-existing browser-lineage FAILs may remain; `check-duplicate-mechanics` PASS |
| 9 | `python3 tools/writer-acceptance-matrix.py --workspace W01 --run-proofs --candidate "$(node tools/writer-candidate-identity.mjs --workspace W01 --json \| python3 -c 'import sys,json;print(json.load(sys.stdin)["ownedPartition"]["identity"])')" --commit "$(git rev-parse HEAD)" --tree "$(git rev-parse 'HEAD^{tree}')"` | `zero_loss: true`, 711/711, counts must not regress from the W01-F baseline (`PASS 327 / BLOCKED 356 / NOT_APPLICABLE_WITH_PROOF 26 / FAIL 2`) |

---

## 6. What W01 did instead (this round)

* **CBF-002 was repaired** inside W01's own partition — see §5 of `W01_HANDOFF.md` (RESIDUAL ROUND).
  That repair is *not* contingent on this request.
* This LEFT-region residual was **filed, not forced**: no edit to `m0-controller-composition.ts`,
  no edit to `main.ts`, no work-around copy of the LEFT template inside a W01-owned file.
* Evidence for the defect is preserved and hash-bound in
  `writer-output/W01/CBF002_PROBE.json` (sha256 recorded in `EVIDENCE_INDEX.json`).

**Requested of the Coordinator:** apply §2a (m0) + §2b (`surfaces/today/surface.ts`) atomically,
run the §5 verification battery, then re-disposition `OBL-003358` / `OBL-001400` through their
own (Controller / Owner) rules. W01 will not pre-empt either decision.
