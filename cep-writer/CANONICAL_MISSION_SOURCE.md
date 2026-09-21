# CEP — MISSION_R6_PRESENTATION_PARITY_CORR02

**Role:** EXECUTION WRITER — serialized multi-owner Presentation correction only  
**Mode:** MUTATING ISOLATED CANDIDATE / EXACT 5205d2a3 PARENT / PRESENTATION-ONLY PRODUCT CORRECTION / REPACKAGE / CANDIDATE_ONLY / NO SELF-PROMOTION / NO LIVE GOVERNANCE MUTATION / NO GITHUB PUSH / NO R7 / NO STACK FREEZE

## 0. Controller binding

This mission exists because the Independent Controller audit retained the exact R6-CORR01 + Balanced6 Product/data/runtime result but reopened `R6-PRESENTATION-REFERENCE-PARITY-FAIL` as `OPEN_PRODUCT / PRESENTATION`.

The Controller already closed the separate evidence-chain/package defect through `CONTROLLER_EVIDENCE_CORR01`; do not re-open or re-implement that correction.

## 1. Mandatory live reads before mutation

Read exact current live authority first:

1. `READ_FIRST.md` — Drive `1r6XU0zhlAjdrK3OrzkXzHLA2WknWip6h`
2. `CURRENT_STATE.md` — Drive `164CDevKZ48ZAXke44oL3jXIVpYQJBmRu`
3. `CONTROLLER_GOVERNANCE.md` — Drive `1xZSIBmNWcc6DtWuQ30R_5uHLg7AT9hB_`
4. all applicable ACTIVE / ACTIVE_PLATFORM_GATED rows in `OWNER_DECISION_LIVE_REGISTER.csv` — Drive `1GF70xX-eGWNmp8VaK_gjTRrAAVq0bihh`
5. `23_SURFACE_ZERO_LOSS_IDENTITY_REFERENCE_MATRIX.md` — Drive `1ODc-0jTWUCoZ-wVPUIpktoRn-taPEI_x`
6. `FINAL_VISUAL_REFERENCE_REGISTER.md` — Drive `1l97eSpCZ0tsNGDgEhHXmiyjhoCgpuEz4`
7. `CEP_VIS_001_FINAL_VISUAL_AND_INTERACTION_CONTRACT_v1.0_APPROVED.md` — Drive `1hhnXSpT3usVGjiR9OtkxtMxWFxy41CE_`
8. exact SurfaceProfiles for every touched Surface and ORACLE-007 / ORACLE-011 / ORACLE-012 where applicable.
9. Controller-corrected evidence package — Drive `15LmsW_xRPdQEwXtFPqLnC2riK3i-5BM5`.

Pay special attention to `OD-20260916-044`, `OD-20260918-055`, `OD-20260918-056`, `OD-20260920-059`, `OD-20260920-060`, and `OD-20260921-061`.

## 2. Exact Product parent — hard gate

Start ONLY from:

`CEP_R6_CORR01_BALANCED6_CANDIDATE_5205d2a3.zip`

Expected candidate ZIP SHA-256:
`03fa724c20c4b41847f4418bbd9d512e8dd64c152c1e7e28f6f55e04fd23ed4b`

Expected canonical source identity:
`5205d2a3d0db441e030a046bc831549728cc95b9c09ff9d2fa4233ba1672fd66 / 272`

Expected normalized Product tree:
`d6743fe7b41c39050656ec10d99938f28db88a27a7f5ae3bc8a47d915d6d5d75 / 2,143 files / 105,549,338 bytes`

If any identity differs, STOP with `PARENT_IDENTITY_MISMATCH`.

Do not restart from R6. Do not overlay a sibling ZIP. Do not use the old baseline Product as the mutation parent.

## 3. Proven truth that MUST be preserved

The following are already independently reproduced and are regression-only in this mission:

- Balanced6 exact six KU profile and provenance;
- `32/32` Balanced6 focused tests;
- `6 documents / 6 baseline revisions / 6 FTS rows` idempotent state;
- Save / Autosave / Recovery / stale-save atomicity;
- `npm test 210/210`;
- `npm run check PASS`;
- runtime build PASS;
- `npm run runtime:check PASS` on Node `v22.16.0`;
- provider/persistence falsification `9/9`;
- R6 targeted suite `10/10`;
- no dependency addition;
- `node:sqlite`, current provider boundaries and all domain/data truth;
- genuine HTTP remains `OPEN_ENVIRONMENT__LOOPBACK_BLOCKED_BEFORE_PRODUCT_RECEIPT` unless a permitted environment genuinely proves otherwise.

Any change to persistence, Balanced6 seed semantics, provider architecture, schema, dependencies, runtime or canonical domain behavior is OUT OF SCOPE unless a Presentation change accidentally exposes a real regression; in that case stop and report rather than widening scope.

## 4. Exact correction objective

Close Presentation parity through state/viewport-matched Product composition, not by copying screenshots pixel-for-pixel and not by inventing fake content.

Controller direct comparison proved the Writer's generic `23/23 no blocker` conclusion unsafe. Required primary re-review includes at least:

- Today
- Enterprise
- Evidence
- Reviews
- Validation
- Backup & Restore
- Audit
- Releases
- Configuration

Also re-falsify Mastery, Portfolio, Health, Processing, Manual AI, Scenarios, Labs, Runs, Results, RQ, Visualize, Learn, Library and Shell for propagation/regression. Mutate additional Surfaces only if direct current state/reference comparison proves a material defect.

The problem is Presentation/composition, not a license to rewrite domain semantics.

## 5. Ownership law

Preserve:

`GLOBAL FOUNDATION → FAMILY ENGINE → REUSABLE MECHANICS/PRESENTATION/HOSTS → THIN DOMAIN ADAPTER → SURFACE COMPOSITION`

`OD-20260920-059` is a hard stop:
- shared owners may own compatible layout grammar, panes, focus, responsive mechanics and interaction carriers;
- Surface/domain owners retain purpose, command vocabulary, workflow, lifecycle, data/provider truth and effects;
- Library is not a universal semantic template;
- do not create a new universal domain renderer that flattens Surface identity.

Prefer existing seams. Current relevant Presentation/composition paths include, but are not limited to:

- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- `stack/native-typescript/surfaces/today/presentation.ts`
- `stack/native-typescript/surfaces/today/surface.ts`
- `stack/native-typescript/surfaces/enterprise/presentation.ts`
- `stack/native-typescript/surfaces/enterprise/index.ts`
- `stack/native-typescript/surfaces/evidence/index.ts`
- `stack/native-typescript/surfaces/reviews/index.ts`
- `stack/native-typescript/surfaces/mastery/composition.ts`
- `stack/native-typescript/surfaces/portfolio/composition.ts`
- `stack/native-typescript/surfaces/validation/index.ts`
- `stack/native-typescript/surfaces/backup/index.ts`
- `stack/native-typescript/surfaces/audit/index.ts`
- `stack/native-typescript/surfaces/releases/composition.ts`
- `stack/native-typescript/surfaces/configuration/composition.ts`
- `stack/native-typescript/surfaces/composition/w04-rescue.ts`
- `stack/native-typescript/surfaces/composition/w05-rescue.ts`

Shared Foundation paths are writable ONLY when direct evidence proves the defect belongs to an already-existing shared Presentation owner and a central change is the narrowest correct fix. No new shared semantic owner.

## 6. Prohibited Product changes

Do NOT change:

- Balanced6 KU source files or seed identities/hashes;
- persistence schema or DB engine;
- `node:sqlite` provider choice;
- Save/Autosave/Recovery semantics;
- provider/domain truth merely to make screenshots richer;
- package dependency graph or `package-lock.json` dependency set;
- runtime/terminal architecture;
- Owner decisions, CURRENT_STATE or governance;
- genuine browser truth from OPEN_ENVIRONMENT to PASS without real route proof.

Do not add dummy KPI cards, fake health states, fabricated review decisions, fake deployment status, fake canonical graph relations or fake Mastery merely to resemble a reference image.

## 7. Result-first Presentation gate

For every affected Surface and both governed viewports (`1440×1000`, approximately `1024×900`), compare current candidate output step-by-step against:

- exact SurfaceProfile;
- current visual reference classification;
- applicable domain oracle;
- current Owner decisions;
- current data/provider truth.

Inspect every material component, including small controls/affordances, for applicable:

- hierarchy, typography, density, spacing, icons, overflow;
- LEFT/CENTER/RIGHT/BOTTOM ownership;
- selected-object/context coherence;
- default/hover/focus/active/selected/disabled/unavailable;
- expanded/collapsed/loading/empty/stale/error/conflict/read-only/processing/success;
- pointer + keyboard;
- focus entry/return/fallback;
- dismissal;
- responsive geometry;
- RTL/LTR/Bidi and long technical identifiers;
- truthful labels and product copy;
- no proof/debug/internal owner/provider leakage in normal mode.

The reference image is Presentation authority only. Preserve Product truth when reference data is illustrative.

## 8. Positive and falsification tests

At minimum prove:

- materially affected Surface references are no longer weaker at matched states/viewports;
- all 23 Surface identities still route to the correct typed workbench;
- no generic `Governed typed product workbench`/Truth Boundary/debug leak returns in normal UI;
- no page-level horizontal overflow at 1440×1000 or 1024×900;
- technical IDs wrap/isolate correctly without character fragmentation;
- domain commands/availability remain exact;
- W03 remains workspace-first;
- W04 Evidence/Review/Decision/Mastery boundaries remain unchanged;
- W05 truth ceilings remain unchanged;
- central Presentation changes, if any, propagate to at least two real compatible consumers and exact-revert proves central ownership;
- no consumer-specific workaround is needed for a shared mechanic;
- diagnostics remain explicit/bounded;
- all preserved non-browser regression gates still PASS.

Negative tests must attempt to detect semantic drift caused by visual changes.

## 9. Browser/evidence law

Use the exact built Product and current compatible browser tooling.

If localhost remains administratively blocked, in-memory built-ESM capture MAY be used only for Presentation comparison and must remain labeled `VISUAL_PRESENTATION_EVIDENCE__NOT_GENUINE_ROUTE`.

It cannot close genuine HTTP / Back-Forward / xterm route findings.

Produce real PNG binaries for all 23 Surfaces × 2 viewports after correction, plus additional state-matched screenshots for every materially corrected Surface/reference pair.

Create a state-matched parity matrix that records:
- Surface;
- reference ID/SHA/classification;
- candidate screenshot;
- viewport;
- exact matched state/object;
- component-by-component disposition;
- intentional truth-driven differences;
- PASS/BLOCKED/NOT_APPLICABLE.

## 10. Integrated regression

After Product mutation is complete rerun from a clean extraction:

- canonical source identity;
- normalized Product tree;
- exact Product delta;
- dependency diff;
- `npm test`;
- `npm run check`;
- `npm run build:runtime`;
- `npm run runtime:check` on Node `v22.16.0`;
- Balanced6 `32/32`;
- provider/persistence `9/9`;
- targeted R6 correction tests;
- duplicate-owner scan;
- encoding/Bidi audit;
- 23-Surface visual Presentation audit.

Do not alter Product merely to make a stale harness PASS.

## 11. Packaging and evidence-chain boundary

Because Product changes will create a new source identity, regenerate:

- candidate ZIP;
- source/tree identities;
- Product delta manifest;
- evidence ZIP;
- self-contained baseline whose `product/` is byte-exact to the corrected candidate;
- baseline manifest/tree verifier;
- safe Colab bootstrap hard-bound to the new final baseline ZIP SHA.

Preserve the Controller evidence-chain correction design:
- final validation and final handoff are external closure documents;
- do NOT store their SHA receipts inside the Evidence ZIP if those documents bind the finalized Evidence ZIP identity;
- finalize Evidence ZIP first;
- then generate external final validation/handoff and external SHA receipts.

## 12. Required outputs

At minimum:

- `CEP_R6_CORR01_BALANCED6_PRESENTATION_CORR02_CANDIDATE_<SOURCE8>.zip`
- `CEP_R6_CORR01_BALANCED6_PRESENTATION_CORR02_EVIDENCE_<SOURCE8>.zip`
- `CEP_WRITER_BASELINE_R6CORR01_BALANCED6_PRESENTATION_CORR02_<SOURCE8>_TREE_<TREE8>_20260921.zip`
- external `.sha256` receipts;
- `PRESENTATION_STATE_MATCHED_PARITY_MATRIX.csv/json`;
- `PRODUCT_DELTA_MANIFEST.json`;
- `DEPENDENCY_DIFF.json`;
- `SCREENSHOT_MANIFEST.json`;
- raw regression logs;
- `FINAL_VALIDATION.json` and `FINAL_HANDOFF.md` generated only after Evidence ZIP finalization;
- safe Colab bootstrap bound to new baseline SHA.

## 13. No self-promotion

Even with every Product/Presentation gate green, return only:

`CANDIDATE_ONLY__PENDING_INDEPENDENT_CONTROLLER_AUDIT`

Do not modify live governance, accept/promote a successor, launch R7, freeze stack, create a GitHub repository or push anything.

When the full correction is actually packaged and validated, end with:

`R6_BALANCED6_PRESENTATION_CORR02_CANDIDATE_READY_FOR_CONTROLLER_AUDIT`
