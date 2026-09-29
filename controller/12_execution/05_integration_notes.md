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

**Refined at `f9d5a4d` (W03) — apply from now on:** partition membership is necessary but not
sufficient. A `dist/**` file may be staged **only if its corresponding source file under
`stack/native-typescript/**` is also changed in the same checkpoint**. Otherwise it is one of the
**175 pre-existing B-5 regenerated `dist/` artifacts** (worktree disposition: `GENERATED_ARTIFACT`,
regeneration reproducible) and must be left uncommitted. Applying this at the W03 checkpoint unstaged
25 such files, e.g. `dist/adapters/simulation.js`, `dist/foundation/timeline/*.js`,
`dist/analytical-compare-*.js`, whose sources were untouched.

Provenance note, recorded for transparency: `81a2732` (W04) applied the partition-level rule and may
therefore contain a small number of pre-existing regenerated `dist/` artifacts alongside W04's genuine
output. It is not rewritten (history is immutable); the rule is tightened forward. W03's `f9d5a4d` is
source-correspondence clean.

## IN-4 · Disposition-policy contradiction — **RESOLVED** (Pro review)

W01 (`61ee12d`) marked `OWNER_DECISION` and `OWNER_QA_DEEP_AUDIT` rows **BLOCKED**; W04 (`81a2732`)
marked the same row classes **PASS** from a per-surface proof battery. Both ran real measured proofs.
Escalated to the Pro reviewer as a requirement-interpretation dispute (mission §27).

**Outcome:** neither treatment was defensible. A single unified policy P1-P6 was issued
(`06_unified_disposition_policy.md`) and all five matrices were regenerated (`55a46d6`).
Cross-matrix conflicts went **111 → 0** across 180 replicated subjects. The truthful landscape is
PASS 75 / BLOCKED 5356 / NOT_APPLICABLE_WITH_PROOF 3220 / FAIL 0 — the earlier 7,736 PASS was
manufactured by sweep rules. The single largest gap surfaced: **0 of 98 `OWNER_QA_DEEP_AUDIT`
findings have any executable closure proof anywhere in the repo.**

## IN-5 · The writer-forbidden hotspot is forcing worse designs (HIGH — architectural)

Three separate Writers have now hit the same wall: `main.ts` / `m0-controller-composition.ts` are
writer-forbidden, so when the *correct* fix is a one-line change at a call site, the Writer reaches
for a design that fits inside its own partition instead.

Concrete instance (W03, `f68f805`-era, currently uncommitted):
`main.ts:185` calls `createEnterpriseAdapter()` with **no arguments**. The safe default was
`fixture:false` (empty topology, `sourceClassification:'UNAVAILABLE'`, `sourceDigest:null`) and
`tests/post-c03/LCORR01` enforced it. To make the V3 "empty topology" defect fixable without
touching `main.ts`, W03 **flipped the default to `fixture:true`** and re-expressed the negative case
as `createEnterpriseAdapter({fixture:false})`.

**Ruling: ACCEPTED as bounded, but the design is recorded as sub-optimal and routed to the hotspot.**

Why accepted — the boundary genuinely holds:
- `canonicalProductTruth` is `false` **unconditionally** (fixture or not).
- `providerAvailability` is `'EXPLICIT_TEST_FIXTURE'`.
- The classification `FIXTURE_ONLY__NOT_PRODUCT_TRUTH` is **rendered in the UI**
  (`surfaces/enterprise/presentation.ts:70` RIGHT context shows `Classification` and
  `Canonical product truth`).
- The negative invariant "no product truth without a seed" is **still enforced**, just via an
  explicit parameter.
- All four affected suites green (LCORR01, S10, CG4 group-falsification, enterprise domain).

Why sub-optimal — the *default* now carries fixture data, so any future no-arg caller silently
receives it. The cleaner design is: default `fixture:false`, and `main.ts:185` passes
`{fixture:true}` explicitly. **That is a `main.ts` hunk and therefore a PW-C slot item**, filed
below. It is not a Writer error; it is the hotspot constraint doing exactly what the constraint
does — pushing design distortion into the partition that is allowed to move.

**Rule for the rest of the phase:** when a Writer's correct fix requires a writer-forbidden call
site, prefer (in order): (1) file the hotspot hunk and leave the safe default intact; (2) if the
surface would otherwise be materially empty, change the default **but** keep
`canonicalProductTruth:false`, an explicit `providerAvailability` marker, a UI-rendered
classification, and the negative case expressed with an explicit parameter. Never weaken the
negative case.

## IN-6 · Representative-record patterns compared (for consistency)

Two patterns appeared; they are **not** equivalent and the difference matters.

| | W05 (`b87313c`) | W03 (enterprise) |
|---|---|---|
| where records live | **composition** (presentation) | **adapter default** (domain) |
| adapter default | stays **EMPTY** | now returns 6 labelled nodes |
| default-EMPTY law | intact, 7/7 green | re-expressed via `{fixture:false}` |
| provenance label | `W05_SURFACE_REPRESENTATIVE_RECORD` + honest basis string | `FIXTURE_ONLY__NOT_PRODUCT_TRUTH` + `canonicalProductTruth:false` |
| verdict | **preferred** | accepted, sub-optimal (see IN-5) |

Both are authorised by Owner directive §6-§7. **W05's shape is the preferred one** and should be the
template for future work; W03's is acceptable only because the labelling is exhaustive and the
negative case survives.

W01 (`61ee12d`) marked `OWNER_DECISION` and `OWNER_QA_DEEP_AUDIT` rows **BLOCKED**;
W04 (`81a2732`) marked the same row classes **PASS** from a per-surface proof battery. Both ran real
measured proofs. Escalated to the Pro reviewer as a requirement-interpretation dispute. Awaiting a
single unified disposition policy to be applied uniformly to every workspace matrix (regeneration is
cheap and tool-driven; implementation is unaffected).
