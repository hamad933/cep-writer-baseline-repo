# CEP RUNTIME-DISCOVERED DEFECT TRIAGE + TEST ALIGNMENT PLAYBOOK v1.0

CLASSIFICATION: CONTROLLER REUSABLE METHOD / TEST+PRODUCTION ASSURANCE / NOT ACCEPTANCE
DATE: 2026-09-09

## 1. Core rule
A failing runtime/test command is an observation, not an automatic product defect.

Before source mutation classify the failure into one of these classes:
1. EXECUTION_ORCHESTRATION_DEFECT
2. ENVIRONMENT_OR_ORDERING_DEFECT
3. PRODUCT_SOURCE_DEFECT
4. TEST_FIXTURE_OR_EXPECTATION_STALE
5. REPOSITORY_ENVELOPE_DEPENDENCY
6. EXTERNAL_PROVIDER_OR_PLATFORM_FAILURE
7. UNKNOWN_NEEDS_BOUNDED_INSPECTION

Never mutate Production source until the class is justified from direct source/test/log evidence.

## 2. W01/W02 reusable triage sequence
For each failed command:
1. preserve exact return code and full log;
2. identify the first causal error, not the tail exception;
3. inspect the direct test and direct implementation/contract;
4. compare current contract semantics to test assumptions;
5. determine whether build/generated prerequisites existed at test time;
6. inspect whether the test assumes repository files excluded from portable candidate;
7. patch the smallest responsible layer;
8. hash-gate the patch;
9. rerun only affected gates first;
10. run the complete class suite before promotion.

## 3. Specific failures and resolutions learned
### A. CELL02 database orchestration failure
Observation: `21_db_create.log rc=1` before dependencies/tests.
Cause: multiple DB lifecycle SQL statements in one `psql -c`; DROP/CREATE DATABASE transaction-context conflict.
Resolution: split each lifecycle command; add authenticated runtime/test connection probes.
Classification: EXECUTION_ORCHESTRATION_DEFECT, not Product.

### B. Hotfix expected-hash failure
Observation: patch produced `da9e28...`, while Controller-provided expected hash was `6bb0af...`.
Cause: expected hash represented a differently formatted Controller-local version, not the literal patch supplied to Owner.
Resolution: independently reproduce exact user-visible patch bytes; verify semantic markers + compile; admit `da9e28...` as the correct literal patch identity.
Rule: the hash gate itself can be wrong. Never modify a valid patch merely to satisfy an unverified expected hash.

### C. Laravel Unit/Feature/Integration Vite-manifest failures
Observation: page-render tests failed with `Vite manifest not found`, while later `npm build` passed.
Cause: execution ordering: PHP page-render tests ran before build generated `public/build/manifest.json`.
Resolution: build before page-render suites; rerun affected PHP suites.
Classification: ENVIRONMENT_OR_ORDERING_DEFECT.

### D. TypeScript errors
Observed three typecheck failures:
- `LibraryHierarchyTree.vue`: undefined `root` -> real Product source defect.
- `LibraryWorkspace.vue`: `@click="save"` passed PointerEvent into function expecting optional boolean -> real Product typing defect; changed to `save()`.
- integration test `Source[]` vs `SourceSummary[]` -> test fixture typing contract drift.
Rule: typecheck output can mix Product and test defects; classify per file/contract.

### E. StructuredDocument child-depth test
Old test expected converting `toggle -> paragraph` to promote children to depth 0.
Current contract admits paragraph children, so received depth `[0,1]` was consistent.
Resolution: test the promotion behavior using a non-child-admitting type (`code`) rather than corrupt Product semantics.
Classification: TEST_EXPECTATION_STALE.

### F. Slash-menu integration test
Old test expected slash insertion menu on a non-empty block (`Original`). Current Product intentionally opens slash insertion for an empty block.
Resolution: make the fixture empty.
Classification: TEST_FIXTURE_STALE.

### G. VS001 textarea limit
Old test expected `maxlength=4000`; current bounded contract is `16000`.
Resolution: align test with current governed contract after direct verification.
Classification: TEST_EXPECTATION_STALE.

### H. RQ comparison test — source summary contract
Current RQ list is summary-only and lazily fetches source detail.
Old fixture put full `Source[]` where `SourceSummary[]` is required.
Resolution: fixture supplies summaries and mocks exact lazy detail fetch.

### I. RQ comparison test — async settlement
`pin()` awaits `Promise.all(sourceDetail...)`.
Triggering the click alone is not enough for Vue test state settlement.
Resolution: `await flushPromises()` after triggering async pin.
Rule: event trigger completion != application async state completion.

### J. RQ comparison test — brittle positional selectors
WorkspaceFrame added a Top-banner presentation `<select>` before RQ source selects.
Old `findAll('select')[0/1]` manipulated the wrong controls, leaving RQ pair invalid.
Resolution: select controls semantically by their source option universe; require exactly two source selectors.
Rule: do not use positional DOM selector assumptions across compositional shells.

### K. V4 inline mark ordering
Old test expected pieces in legacy ordering. Current normalization canonically sorts by start/end/kind/value.
Resolution: update test expected canonical order only after direct contract verification.

### L. V4 replacement transformation
For `abcd`, replacing `[1,3)` with one code point yields new length 3. A full underline `[0,4]` therefore becomes `[0,3]`, not stale `[0,5]`.
Resolution: mathematical/contract-correct expected range.

### M. Required block `depth`
VS001/VS002 legacy fixtures omitted `depth`, while V4 requires `blocks.*.depth`.
Resolution: fixtures include `depth: 0`.
Rule: fixtures must satisfy current public/validation contract, not historical payload shape.

### N. Migration count
Candidate had 13 migrations; old lifecycle test asserted exactly 12.
Resolution: verify actual exact migration universe first, then align expected count to 13.
Rule: fixed inventory counts are stale-prone; verify the governed universe before changing them.

### O. Architecture/repository envelope
Portable candidate lacked repository-level `review-packets/...`, parent `AGENTS.md`, and `.git` root expected by RepositorySafety tests.
Classification: REPOSITORY_ENVELOPE_DEPENDENCY; do not call these failures Product defects without restoring the intended repository envelope.

### P. Architecture boundary findings
Module boundary suite also exposed direct model imports in application-boundary controllers.
Rule: an environment-bound suite can contain a real source finding alongside envelope failures. Preserve each finding separately; do not discard the whole suite as environmental.

## 4. Bounded correction law
- Never patch the entire working tree blindly.
- Maintain an exact admitted file list.
- Verify old SHA before patch and new SHA after patch.
- Back up each file before mutation.
- Verify semantic preconditions in direct implementation/contract.
- Prefer test-only alignment when Product semantics are already correct.
- Product-source correction requires explicit classification and changed-file registration.

## 5. Successor freeze law after runtime-discovered corrections
Runtime-discovered source/test corrections invalidate the old candidate identity for subsequent evidence.
Do NOT run browser evidence on a disposable mutated predecessor.

Correct procedure:
1. re-extract the exact clean predecessor package;
2. reproduce predecessor source tree identity;
3. overlay only admitted corrected files;
4. prove exact changed-file universe (no added/deleted/unexpected file);
5. generate new source manifest;
6. compute new source tree;
7. package successor;
8. compute exact ZIP SHA;
9. stage exact successor to Drive and prove Drive File ID custody;
10. fresh bootstrap from that exact successor before browser evidence.

## 6. Content identity vs container identity
Source tree + source manifest bind content/source identity.
ZIP SHA binds exact container bytes.
Different compression/runtime implementations can produce different ZIP SHA while source tree/manifest remain identical.
Never silently substitute one ZIP container for another. For execution custody, record and verify the exact admitted ZIP SHA and Drive File ID.

## 7. Promotion gate
A runtime-discovered correction may advance only when:
- affected targeted gate passes;
- complete relevant suite passes;
- source delta is bounded and registered;
- successor identity is recomputed;
- old candidate is not misreported as retroactively PASS;
- browser evidence waits for successor custody.
