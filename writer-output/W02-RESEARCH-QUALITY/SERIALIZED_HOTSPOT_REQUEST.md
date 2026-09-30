# SERIALIZED_HOTSPOT_REQUEST — W02-RESEARCH-QUALITY (rq surface composition hook)

**File:** `writer-output/W02-RESEARCH-QUALITY/SERIALIZED_HOTSPOT_REQUEST.md`
**Unit:** `W02-RESEARCH-QUALITY` · **Surface:** `rq` · **Workspace:** W02
**Status:** **FILED, NOT APPLIED** — `main.ts` and `surfaces/m0-controller-composition.ts` are
writer-forbidden (`controller/12_execution/04_hotspot_register.md`, slot table row 3 `W02 kernels`).
**Filed:** 2026-09-30 · branch `writer/mi-serial`

No hunk below has been taken by W02-RESEARCH-QUALITY. Everything else in this unit's candidate is
inside `stack/native-typescript/surfaces/rq/` and `stack/native-typescript/adapters/rq/` only.

---

## Why this request exists

`if(consumer==='rq')` in `m0-controller-composition.ts` still calls the generic
`renderTypedCollectionStage(...)`, which renders an empty typed-collection stage, an empty LEFT
collection and an empty RIGHT context for the rq route. That is the composition the Owner rejected.

The RQ workspace is now composed inside its own writable root
(`surfaces/rq/composition.ts` → `mountRqWorkspace`), and is currently reached through a guarded
deferred mount from `bindRqSurface()` (double `requestAnimationFrame`, guarded on
`#foundationStage[data-m0-composition="rq"]`), because W02 may not edit the hotspot. The deferred
mount is correct and regression-safe, but it is a workaround: the canonical entry point belongs in
the mount dispatcher. This request files that hunk so the Coordinator can replace the workaround
with the direct call.

---

## H1 — `stack/native-typescript/surfaces/m0-controller-composition.ts` (rq branch, line ~273)

Replace the generic typed-collection call with the surface-owned composition:

```diff
-    const mounted=renderTypedCollectionStage(stage,{workspace,surface:'rq',title:'RQ research workbench',summary:'Search and compare are available only against an admitted current provider with exact SourceRevision identities. No non-production acceptance corpus is promoted into Product truth.',rows:()=>adapter.records,commands:binding.commands,registry,rowId:(row,index)=>row.sourceId||`rq-${index+1}`,rowLabel:(row,index)=>row.title||row.sourceId||`Source ${index+1}`,rowMeta:row=>row.revision||row.status||'',detailFor:row=>row,truth:diagnosticsEnabled()?[`Analytical compare owner: ${analyticalCompareOwner.owner}`,'Current RQ provider: UNAVAILABLE_NO_ADMITTED_CURRENT_PROVIDER','Analysis-session persistence: unavailable','Formal review authority: false']:['No current Product SourceRevision provider is admitted.','Comparisons require exact provider-bound source revisions.','This workspace does not issue formal Evidence Review decisions or Mastery.'],emptyMessage:'No admitted current RQ SourceRevision provider is bound. Non-production acceptance data is excluded from normal Product truth; Compare remains unavailable until exact provider-bound revisions exist.'});
+    const mounted=mountRqWorkspace({stage,workspace,registry,adapter,binding});
```

And add the import next to the existing rq import (line 8):

```diff
 import {bindRqSurface} from './rq/surface.js';
+import {mountRqWorkspace} from './rq/composition.js';
```

**Negative case this must not break:** `rq.search` / `rq.compare` / `rq.review` / `rq.provenance`
keep their current owners (`RQ_DOMAIN_OWNER`) and their current availability semantics —
`tests/surfaces/rq/surface.test.mjs` and `tools/b3r-rq-visualize/falsify-b3r*.mjs` assert
`rq.search` availability `enabled:false / code:RQ_CURRENT_PROVIDER_UNAVAILABLE` when no provider is
admitted, and `rq.compare` requires an exact SourceRevision pair + `workingAnalysisId` + non-empty
`scope`. `mountRqWorkspace` does not touch those registrations.

Re-run after application:
`tools/writer-serial.sh bash -c 'node tools/test-models.mjs && node tools/build-runtime.mjs'`
plus the rq route check in `writer-output/W02-RESEARCH-QUALITY/analyze.mjs`.

## H2 — remove the deferred-mount workaround once H1 is applied (W02-owned half, no hotspot needed)

Not required. `bindRqSurface`'s deferred mount is idempotent and self-guards
(`stage.dataset.rqSurface === 'rq.source-claim-reconciliation'` → `refreshRqWorkspace()` instead of
a second mount), so it stays harmless after H1. W02 can delete it in a follow-up if the
Coordinator prefers a single entry point; no hotspot edit is needed for that.

---

## What the composition provides (so the Coordinator can judge the hunk)

| Region | Owner | Content |
|---|---|---|
| TOOLBAR `#domainToolbar` | shared slot, rq presentation | 5 view tabs (`rq.view.compare/claims/provenance/revision/history`), `aria-pressed` bound to state |
| LEFT `#domainLeftRegion` | rq | active-review scope card, active investigations list, review queue with counts, working-scope footnote |
| CENTER `#foundationStage` | rq | reconciliation action chips + truth chips, review title/meta, and per-view bodies (source pair, claim matching table, review result, claim register, provenance chain, revision list, activity log) |
| RIGHT `#domainContext` | rq | 5 context tabs (overview/attributes/marks/order/history) with the overview sections from the reference |
| BOTTOM `#domainBottomRegion` | rq | reconciliation trace summary + local-only note |
| `#topBanner .crumbs` | rq content | localized `Area › Surface › REV-SQLI-014` breadcrumb |

Truth labels are derived from `adapters/rq/domain.ts` (`providerAdmitted:false`,
`analysisSessionPersistence:'UNAVAILABLE'`, `formalReviewAuthority:false`) and are shown in the
UI; the fixture data lives in `adapters/rq/fixtures.ts` and is explicitly labelled presentation
fixture, never Product SourceRevision truth.
