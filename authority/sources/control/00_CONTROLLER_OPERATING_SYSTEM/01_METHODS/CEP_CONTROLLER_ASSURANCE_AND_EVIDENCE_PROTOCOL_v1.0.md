# CEP CONTROLLER ASSURANCE + EVIDENCE PROTOCOL v1.0

## 1. Evidence classes
Keep separate:
`SOURCE_IDENTIFIED`, `STATIC_PROVEN`, `SEMANTIC_PROVEN`, `TYPE_PROVEN`, `TEST_PROVEN`, `DB_PROVEN`, `RUNTIME_PROVEN`, `BROWSER_PROVEN`, `VISUAL_PROVEN`, `REFERENCE_PARITY_PROVEN`, `OWNER_ACCEPTED`.

No upward promotion by implication.

## 2. Independent review minimum
Controller verifies, as applicable:
- baseline/package SHA and manifest;
- exact changed-file scope;
- regression tests;
- current-source semantics;
- destination/owner collisions;
- actual interactive state transition;
- negative stale/duplicate/fake-output assertions;
- fresh screenshots bound to candidate bytes;
- exact-route truth separately;
- responsive/a11y/Bidi/focus where user-facing.

## 3. Interaction oracle
For every material interaction:
`before state → actual action → command/owner identity → after state → visible region/state change → negative stale-state check`.

Handler/selector/function presence is never sufficient.

## 4. Browser fallback
If exact route is environment-blocked, keep exact-route status blocked and continue candidate-bound visual/interaction evidence through strongest available controlled fallback. Never call fallback route proof.

## 5. User hands-on review
Owner manual review is an independent evidence source and can reopen a previously “passing” Blueprint. A Controller must convert material Owner observations into findings, tests, and reusable lessons.

## 6. Completion wording
Use precise labels such as:
- `SOURCE_IMPLEMENTATION_COMPLETE_IN_AUTHORIZED_SCOPE`
- `RUNTIME_UNPROVEN`
- `VISUAL_UNPROVEN`
- `AUTHORITY_GATED`
- `PRE_COLAB_SOURCE_CONTRACT_EXHAUSTED`
Never compress them into “complete” without qualification.
