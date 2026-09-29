# 12_execution / 05_integration_notes — live cross-Writer contract findings

Timestamp: 2026-09-29T04:55Z · Author: Writer Coordinator · Append-only; add new findings, never rewrite.

## IN-1 · `commands` slot contract differs between the W04 and W05 mount paths (HIGH value)

Found while reviewing W04's `surfaces/reviews/index.ts` fix.

`surfaces/m0-controller-composition.ts` consumes the surface `commands` slot **differently per path**:

| Path | Line | Consumer | Required shape of `composition.commands` |
|---|---|---|---|
| `mountW04Group` (evidence/reviews/mastery/portfolio) | L169 | `renderTypedCollectionStage({…, commands, …})` | **id list** (`new Set(commands)` is called on it) |
| `mountW05Collection` (configuration/manual_ai/releases) | L190 | `bridgeSemanticCommandBus(registry, composition.commands)` | **semantic command BUS object** (needs `.items()`); L116 `if(!bus?.items) return []` silently registers **nothing** |

W04's fix was correct for its own path: it moved the bus into `commandBus` and made `commands` an id
list, matching the `evidence/index.ts` peer. It could not change L190 because `m0` is writer-forbidden.

**Risk:** a W05 writer that "fixes" the same shape in a W05 composition would make
`bridgeSemanticCommandBus` return `[]`, silently dropping every W05 semantic command registration
with **no test failure at the composition level**. Verify explicitly at the W05 checkpoint:

- `createW05RescueComposition(...)` surfaces must still expose `commands` as a **bus object** with
  `.items()`; if an id list is wanted for the toolbar it must go in `toolbarCommandIds`.
- Empirical check: after W05 lands, assert that W05 consumer commands are present in the registry
  (`registry.commands.has('configuration.…')` / `manual_ai.…` / `releases.…`) and that the W05
  browser flows exercise a toolbar button, not just a route render.

Owner: **W05** (its own `surfaces/composition/w05-rescue.ts` + `adapters/{configuration,manual_ai,releases}`).
No Coordinator mutation is authorized here — `m0-controller-composition.ts` is serialized.

## IN-2 · `CG2_SHARED_FAMILIES_COVERAGE` residual failure is spatial, not W04

`dist/tests/rescue/CG2_SHARED_FAMILIES_COVERAGE/shared-family-coverage.test.js` exits 1 on
`not ok 1 - CG2 retains one Spatial family engine and no universal VirtualizationOwner` (`2 !== 0`).
Subtests 5 and 6 (Audit/Provenance and Review/Decision family non-absorption) pass.

Re-attribution: **W02** (spatial engine is W02's sole-writer kernel this wave, `02_parallel_dispatch.md` §4).
W04's own CG2 subtest is closed. Verified at the W04 checkpoint `81a2732`.

## IN-3 · `dist/` commit provenance under parallel rebuilds

`tools/writer-serial.sh node tools/build-runtime.mjs` regenerates the **whole** `dist/` tree from the
current source, which under parallelism includes sibling writers' uncommitted source edits. Committing
that output would violate the merge-risk rule "never commit another workspace's regenerated dist".

Rule applied from `81a2732` onward: **stage only the committer's own `dist/` output paths**, matching
the workspace partition. Sibling `dist/` deltas stay uncommitted and are committed by their own
workspace checkpoint. `tools/writer-candidate-identity.mjs` `PARTITIONS` is the reference for which
`dist/` subtrees belong to whom.

## IN-4 · Disposition-policy contradiction (open — Pro review)

W01 (`61ee12d`) marked `OWNER_DECISION` and `OWNER_QA_DEEP_AUDIT` rows **BLOCKED**;
W04 (`81a2732`) marked the same row classes **PASS** from a per-surface proof battery. Both ran real
measured proofs. Escalated to the Pro reviewer as a requirement-interpretation dispute. Awaiting a
single unified disposition policy to be applied uniformly to every workspace matrix (regeneration is
cheap and tool-driven; implementation is unaffected).
