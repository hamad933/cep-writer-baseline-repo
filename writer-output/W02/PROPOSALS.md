# W02 · PROPOSALS — changes W02 believes correct but that fall OUTSIDE its §1 edit allowlist

Writer: W02 (Library · Learn · Visualize · RQ + shared interaction/customization policy) · branch `writer/mi-serial`
Candidate of record: `WORKTREE_VARIANT:c82cec63cb5f` (dispatch-time identity) · live execution-time source identity `90240a5e9f5b5eae74d8843a3ab074762fea4aad058aa19b6ffd37577161805a` (287 files)

**Law applied:** `W02 writer packet` §15 + writer brief §1 — "Edit ONLY the ownership list … Anything else: REPORT in your handoff, do not edit."
None of the changes below was made. Each carries the exact proposed hunk + justification so the Coordinator can apply it as a focused correction task.

---

## P-1 · `stack/native-typescript/tests/rescue/CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH/controller-corr01.test.ts` (2 stale assertions)

Routing: `controller/12_execution/00_dispatch_readiness.md` §5 routes
`dist/tests/rescue/CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH/*` → **W02**, but the directory is not in the
writer brief's §1 path allowlist (which enumerates `tests/rescue/{S01,S08,S09}` + `post-c03/D08` only).
W02 therefore closed the **source** half of CG3 and reports the **test** half.

### P-1a · already closed on the W02 side
`adapters/learn.ts` `unavailableSource()` now reports `truth:'UNAVAILABLE_PROVIDER_UNBOUND'` when the
reason is `LEARN_PROVIDER_UNBOUND` (previously a flat `'UNAVAILABLE'`), which satisfies CG3 line
`assert.equal(unbound.structured.sourceBinding.truth,'UNAVAILABLE_PROVIDER_UNBOUND')`.
`npm test` = 210 PASS / 0 FAIL after this change; LCORR03 C5 (`rejectionReason==='LEARN_PROVIDER_UNBOUND'`)
is unaffected.

### P-1b · proposed hunk 1 — synthetic source must REJECT, not throw (post-C03 supersedes CORR01)

Current CG3 line:
```js
assert.throws(()=>createLearnRuntimeComposition({source:{classification:'SYNTHETIC_DEMO',truth:'DEMO',activity:{id:'x',revision:'r1'},document:{id:'d',revision:'r1',blocks:[]}}}),/LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN/);
```
Proposed:
```js
{const rejected=createLearnRuntimeComposition({source:{classification:'SYNTHETIC_DEMO',truth:'DEMO',activity:{id:'x',revision:'r1'},document:{id:'d',revision:'r1',blocks:[]}}});
assert.equal(rejected.learn.sourceAvailable,false);
assert.equal(rejected.learn.source.rejectionReason,'LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN');
assert.equal(rejected.descriptor.realConsumer,false);
assert.equal(rejected.descriptor.fixtureFallback,false);}
```
**Justification:** `stack/native-typescript/tests/post-c03/LCORR03/lcorr03-central-integration-falsification-tests.ts`
C5 asserts `composition.learn.source.rejectionReason === 'LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN'`
(i.e. *non-throwing*, fail-closed rejection) and `main.ts` must call `createLearnRuntimeComposition()`
unbound. CG3 (CORR01-era) and LCORR03 (post-C03) are mutually exclusive; post-C03 + current code win
per packet §17 ("code wins; historical locks are superseded provenance"). Fail-closed semantics are
preserved: no fixture content is ever admitted, `realConsumer:false`, `fixtureFallback:false`.

### P-1c · proposed hunk 2 — RQ adapter must fail closed without the shared owner (post-C03 supersedes CORR01)

Current CG3 line:
```js
const rq=new RQDomainAdapter(records);
```
Proposed:
```js
const rq=new RQDomainAdapter(records,{analyticalCompareOwner:new AnalyticalCompareOwner()});
```
plus `import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';`.

**Justification:** `tests/post-c03/D03C/d03c-shared-host-reachability-tests.ts`
`d03c.production-domains-fail-closed-without-shared-owners` requires `new RQDomainAdapter(rqRecords)`
to **throw** `RQ_SHARED_ANALYTICAL_COMPARE_OWNER_REQUIRED`. `surfaces/m0-controller-composition.ts`
throws `R6_CENTRAL_ANALYTICAL_COMPARE_REQUIRED` without it; `surfaces/composition/w01-w02-rescue.ts`
injects it; `shared_ownership_map.md` #6 records one `AnalyticalCompareOwner` constructed once in
`main.ts`. W02 made the identical correction in `tests/surfaces/rq/surface.test.mjs` (allowed path).

**Measured status after W02 work:** `node dist/tests/rescue/CG3_CONTROLLER_CORR01_LEARN_RQ_TRUTH/controller-corr01.test.js`
= **FAIL** (first failing assertion now `assert.throws(...LEARN_FIXTURE_OR_SYNTHETIC_SOURCE_FORBIDDEN)`,
line ~8). Reported as a real FAIL; not hidden in any matrix rule (no W02 obligation row is discharged by
CG3 — S08/S09/D08/model carry that ground).

---

## P-2 · `tools/browser-conformance.mjs` — 4 oracle corrections (W01-owned tool, not in W02 §1)

Shared harness measured after W02 work (`tools/writer-serial.sh npm run browser:test`): **6 flows,
1 PASS / 5 FAIL**. Four of the five W02-policy flows fail for reasons adjudicated below;
`runtime-causal-consequence` is HARNESS/W03 (Controller pre-classified, unchanged).

| Flow | Measured failure | Class | Proposed correction |
|---|---|---|---|
| `spatial.selection-connect-canonical-edge` | `locator.click Timeout … waiting for '#objectList [data-object="b6-rep-ku-d03-0001"]' … locator resolved to <button data-cep…` (resolves, never clickable) | **ORACLE** | select the *composed* LEFT region: `.visualize-object-list [data-visualize-select="<id>"]`. `main.ts` L221 `#objectList` is `hidden inert aria-hidden` once `mountVisualizeFourViewComposition().renderLeft()` composes `workspace.region('LEFT')` (proved PASS in `tools/w02-browser-flows.mjs` flow `spatial-select-connect-canonical-edge`, 5/5 assertions). |
| `central-change-reuse` | identical `#objectList` timeout | **ORACLE** | same selector change (visualize half); the enterprise half additionally needs P-3. |
| `relation.route-convergence-and-label-scope` | `editable Enterprise relation edge/label is unavailable for route falsification` (edge=0,label=0) | **ORACLE** (precondition unsatisfiable) | either gate the flow on `CEPFoundation.relations.providerAvailability !== 'UNAVAILABLE'`, or move it to a surface with an admitted editable topology. Root cause is P-3, not W02 policy: `RelationInteractionOwner` itself is proven by the passing `fit/pan/zoom`, `focus` and `spatial select/connect` flows. |
| `spatial-input-bidi-preference-and-structured-isolation` | `spatial canvas has no measurable bounds` | **ORACLE** | `.spatial-canvas` lives in `#spatialHost`, which `mountVisualizeFourViewComposition().render()` sets `spatialHost.hidden = !spatialMode` while `initialView='TREE'`. Activate a spatial view first (`registry.execute('visualize.view.canvas',{})`) then `spatial.fit()`, or assert bounds after `#spatialHost` becomes visible. Proved PASS in W02 flow (same assertions + `unicode-bidi` DOM evidence). |

Also, `browser.lineage_receipt_truthful` and `browser.targeted_visual_evidence` (the two `npm run check`
failures) can only clear once these flows pass — W02 re-bound the receipt to `90240a5e…/287` and
`browser.current_candidate_claim_truthful` already cleared; the residual 2 are the baseline pair
(`00_dispatch_readiness.md` §5), not a W02 regression.

---

## P-3 · Enterprise admitted topology (W03-owned, blocks a W02 packet §9 flow)

`stack/native-typescript/adapters/w03-enterprise.ts` `createEnterpriseAdapter()` is called from
`main.ts` L185 **without** `{fixture:true}` and therefore returns `nodes:[]`, `sourceClassification:'UNAVAILABLE'`,
`providerAvailability:'UNAVAILABLE'` ("its node values are never promoted to canonical CEP product truth").
Measured in the live route: `relations.nodes = 0`, `[data-edge] = 0`, `spatial.model.nodes = 0`
while `relations.readOnly = false`.

Consequence: no admitted editable relation edge exists anywhere in the product route, so the packet §9
flow "route convergence + label scope" cannot be executed against its stated precondition.

**Proposal (W03):** bind an admitted (non-fixture, non-promoted) Enterprise relation source, or publish
the sanctioned gate so the flow can skip when `providerAvailability === 'UNAVAILABLE'`.
**Not W02-repairable:** `foundation/relations.ts` / `RelationInteractionOwner` (W02 policy kernel) is
healthy — see the W02 receipt.

---

## P-4 · `stack/native-typescript/tests/rescue/S04_SHARED_NOTES_OPERATIONAL` — 3 failures, both files outside W02 §1

Measured (`node dist/tests/rescue/S04_SHARED_NOTES_OPERATIONAL/s04-shared-notes-operational-tests.js`
→ `status: FAIL`, 8/11):

| Case | Measured | Root cause | Owning file |
|---|---|---|---|
| `s04.sticky-separate-is-owning-surface-focus-intent` | `result.ok=false`, `code='DETACH_CONTEXT_HANDOFF_REQUIRED'` (detachScope/focusContext already correct: `OWNING_SURFACE` / `STICKY_NOTE`) | `StickyNoteWindowOwner.register('note-1')` without an owning-surface context leaves `surfaceId/domainKind/route = null`, so the owner refuses the handoff before consulting the bridge | `foundation/notes/sticky-note-window.ts` (NOT in W02 §1) |
| `s04.operational-separate-is-owning-surface-and-preserves-provider-session` | `owner.detachWindow()` → `ok=false`, `code='PROVIDER_REATTACH_UNAVAILABLE'` (bridge advertises `separateWindow:true`) | reattach of the provider session is unavailable in the fixture harness | `foundation/operational/session-owner.ts` (NOT in W02 §1) |
| `s04.operational-separate-unavailable-does-not-fake-detached-state` | same `PROVIDER_REATTACH_UNAVAILABLE`; `detachScope`/`detached===false` truth already correct | same as above | same |

**Proposal:** either (a) `StickyNoteWindowOwner.register(id, {owningSurfaceContext:{surfaceId:'s04',domainKind:'library',route:'PERSONAL:CEP/S04/library',...}})` in the S04 test, or (b) allow the fixture bridge to satisfy the handoff. Decide in S04 — W02 reports only.

---

## P-5 · Registry / profile / contract changes

**None proposed.** `contracts/**`, `profiles/**`, `authority/**`, `cep-writer/**` were read-only and
require no change for W02's disposition: `profiles/{library,learn,rq,visualize}.json` commands
(`library.save` / `library.revise` / `library.history`, `learn.*`, `rq.*`, `visualize.*`) all remain
registered, and the shared-owner identities W02 relies on (`StructuredTransactionHistoryRecoveryOwner`,
`AnalyticalCompareOwner`, `SpatialInteractionKernel`, `RelationInteractionOwner`,
`BottomDeepWorkOwner`) already match code per `controller/05_foundation/shared_ownership_map.md`.
