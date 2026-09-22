# CEP CORR02 C2 — W04 Product Data / Action Truth

**Writer class:** `CHATGPT_WRITER`  
**Mode:** `MUTATING CANDIDATE_ONLY__NO_SELF_PROMOTION__NO_MAIN_MERGE__NO_RELEASE`  
**Exact accepted Product parent:** `ac888c7e622fdefdc4f958771b21db485e33f9fc`  
**Accepted Product source:** `5885c32a71c14b1b982ec8dcdadba4fafde40c78b2d9287f367f1ca28373f91d / 273 files`  
**Transport branch:** `capsule/corr02-c2-w04-truth`

## Objective
Close only `F-022..F-026`, `F-038`, `F-043`, plus the W04/domain-semantic half exposed by accepted C1 `F-042`.

Affected Surfaces:
- Evidence
- Reviews
- Mastery
- Portfolio

Consume the accepted C1 contextual-toolbar/region mechanics. Do not duplicate or rewrite Foundation mechanics.

## Required truth corrections
1. Normal Product W04 constructors/composition must not silently load rescue/demo/formal-authority seed records. With no admitted provider, render truthful EMPTY / UNAVAILABLE / UNVERIFIED states according to the exact SurfaceProfile.
2. Synthetic/demo fixtures may remain only behind explicit test/demo injection and must never be the normal Product default.
3. Evidence import Presentation must not invent digest, schema-validity, byte-availability, producer/authority proof or verification facts. Candidate Evidence may remain local/session scoped and may be created with verification `UNVERIFIED/UNAVAILABLE`; missing verification must block dependent validation/admission, not fabricate success.
4. Preserve Candidate ≠ admitted Evidence. Import must not imply Admission, Review, Decision or Mastery.
5. Review `reviews.finding` must require explicit governed finding content/basis; no literal `Workbench finding` or generated semantic finding.
6. Review `reviews.supersede` must require explicit allowed outcome and correction/basis input. Never emit invalid `INCONCLUSIVE`; allowed outcomes are domain-contract values only.
7. Full W04 domain command sets must reach the accepted C1 toolbar carrier. Remove array-order truncation such as `.slice(0,3)`; availability/overflow is intentional and context-bound.
8. Mastery normal mode with no evaluator/provider must show `NOT_EVALUATED/UNAVAILABLE` truth rather than seeded `MASTERED/NOT_MASTERED`.
9. Portfolio normal mode with no canonical source/provider must be empty/unavailable curation projection rather than seeded achievements.
10. Do not invent institutional reviewer/admission authority, persistence, provider success, canonical Evidence, Mastery, grouping registry, or source verification.

## Writable Product allowlist
- `stack/native-typescript/adapters/evidence/domain.ts`
- `stack/native-typescript/adapters/reviews/domain.ts`
- `stack/native-typescript/adapters/mastery/domain.ts`
- `stack/native-typescript/adapters/portfolio/domain.ts`
- `stack/native-typescript/surfaces/evidence/index.ts`
- `stack/native-typescript/surfaces/reviews/index.ts`
- `stack/native-typescript/surfaces/mastery/composition.ts`
- `stack/native-typescript/surfaces/portfolio/composition.ts`
- `stack/native-typescript/surfaces/composition/w04-rescue.ts`
- `stack/native-typescript/surfaces/m0-controller-composition.ts`
- bounded C2-only tests/harness under `tools/c2-*/**`
- bounded handoff under `writer-output/presentation-corr02-c2/**`

Everything else is READ ONLY unless a reproducible prerequisite correctness defect satisfies OD-070 and the Writer stops for Controller adjudication before widening scope.

## Explicitly prohibited
- any Foundation/shared carrier rewrite;
- Today/RQ/Visualize/W03/W05 domain/provider corrections;
- SQLite/schema/persistence/runtime/terminal/provider architecture;
- dependency/package changes;
- `cep-writer/**` mutation by the Writer;
- `main` merge/push, release, deployment, self-promotion;
- fake authority/provider/verification data to resemble references.

## Required local-first execution
Use the Capsule as the only inbound workspace. Start from the prebuilt Visual Bootstrap:
`verify -> materialize -> inspect W04 baseline/reference mapping -> compare -> diagnose -> fix -> local build/test/browser -> recapture -> compare -> repeat`.

GitHub Actions is not the development loop. Use the packaged C2 harness locally after Product changes. Managed runner may be used only as final corroboration if a proof class materially requires it.

## Positive / negative gates
- Evidence import without verifier facts creates at most a truthful unverified Candidate or returns a truthful unavailable/input-needed state; it must not persist fake digest/schema/bytes truth.
- Admission remains unavailable until exact validation/source/authority prerequisites are genuinely satisfied.
- Reviews cannot create a Finding without explicit finding payload and cannot issue/supersede a Decision without explicit allowed outcome/basis.
- Evidence/Reviews/Mastery/Portfolio normal initial views contain no rescue-base/demo formal truth.
- Mastery has no silent synthetic current judgment.
- Portfolio has no silent synthetic memberships.
- all profile domain commands are discoverable/bound; no silent truncation.
- C1 shared carrier/regions/contextual toolbar remain regression-clean.
- no dependency drift; `npm test`, `npm run build:runtime`, `npm run runtime:check` remain clean.
- rerun applicable browser/visual W04 gates at 1440×1000 and 1024×900.
- compare final W04 visuals against governed references without importing reference semantics that conflict with provider truth.
- perform explicit falsification proving demo/test injection remains possible only when explicitly requested, while normal Product remains truthful.

## Stop Gate
Produce a candidate only. Report exact Product source identity, changed paths, tests, W04 visual disposition, provider/empty truth, command availability, and any remaining blockers.

End:
`C2_CANDIDATE_ONLY__CONTROLLER_AUDIT_REQUIRED`
