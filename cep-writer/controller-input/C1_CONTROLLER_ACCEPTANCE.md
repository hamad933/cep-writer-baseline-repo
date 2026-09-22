# CORR02 C1 — Independent Controller Audit

**Classification:** `CONTROLLER_ACCEPTED_C1__PRODUCT_CLEAN_WITH_NONBLOCKING_EVIDENCE_ACCOUNTING_CLARIFICATION__C2_PARENT_ELIGIBLE`

## Exact identities
- Starting Writer packet HEAD: `bcbb1ac2d09e30b21062fabeccf7a1aaa2b30a2d`
- Validated Product candidate HEAD: `7fbc25f781e7b8e9fe3eba72f5a57ffe2ed96c1c`
- Final Writer branch HEAD: `ac888c7e622fdefdc4f958771b21db485e33f9fc`
- Product source before: `777d8b24032891b00bf3b61858a3be015b0b77fea710e1d5bd446d182577bb51 / 273`
- Product source after: `5885c32a71c14b1b982ec8dcdadba4fafde40c78b2d9287f367f1ca28373f91d / 273`
- Exact packet→final compare: `12 ahead / 0 behind`; `14` Product paths + `6` writer-output handoff paths.
- Exact validated-head→final compare: `2 ahead / 0 behind`; Product bytes unchanged; only temporary audit/harness removal + final bounded handoff files.

## Controller audit result
Controller independently reviewed the exact GitHub source delta, canonical mission scope, applicable Owner decisions, final/revert artifacts, logs/receipts, full-carrier JSON, targeted falsification JSON, all 46 full-carrier screenshots at `1440×1000` and `1024×900`, responsive RIGHT targeted evidence, and the final Product-vs-harness classifications.

C1 is accepted for its bounded shared-owner scope. Candidate-side closure is accepted for: `F-013`, `F-001`, `F-002`, `F-003`, `F-004`, `F-005`, `F-021`, `F-029`, `F-032`, `F-033`, `F-042`.

Verified Product conclusions:
- Global `Node.prototype.closest` / `Window.prototype.closest` mutation is removed; narrow `eventTargetElement()` normalization is used at actual event seams.
- Generic cross-Surface `surface.mode='read'` state was removed from `WorkspaceHostKernel` and default family command context. Structured document mode remains scoped to Structured/document hosts.
- Shared carrier/toolbar is neutral for non-Structured consumers; Library retains Read/Edit/explicit Save, Learn retains compatible Read/Edit while explicit Library Save is suppressed.
- Shared toolbar now accepts contextual payload/provider binding; availability refresh and contextual execution are source-bound and targeted falsification PASSes.
- Profile LEFT/RIGHT/BOTTOM/TOOLBAR roles are bound through existing shared hosts; surface-specific changes are thin composition/binding changes, not new shared semantic owners.
- Responsive pane owner is preserved; targeted RIGHT reveal is `22/22 PASS @ 1024×900`.
- Full-carrier result is `46/46` captures with `0` horizontal overflow, `0` page errors, no foreign Library Read/Edit/explicit Save leakage on unrelated Surfaces.
- Central revert falsification reintroduced donor leakage and was then restored; this proves central owner propagation rather than consumer-local masking.
- `npm test 210/210 PASS`, `build:runtime PASS`, `runtime:check PASS`, duplicate/runtime-owner scans PASS.
- `browser:test 2 PASS / 4 FAIL` and check `166 PASS / 2 FAIL` remain correctly classified as stale/downstream evidence/harness rows, not C1 Product failures.
- No dependency, SQLite/schema, persistence, provider/runtime architecture, release, deployment, or `main` branch mutation.

## Nonblocking evidence-accounting clarification
Writer handoff states that 43 final screenshots were byte-identical to a previously inspected set and 3 changed. That statement is not anchored to an exact intermediate artifact in the handoff. Controller comparison against the governed **pre-C1** full-carrier artifact `10670544348` finds `4/46` byte-identical and `42/46` changed, which is expected because C1 materially rebounded shared carrier/regions across many Surfaces. This does **not** invalidate the final visual result: Controller independently opened/inspected all 46 final screenshots and verified their source-bound hashes in the final artifact. The Writer sentence is therefore classified `EVIDENCE_ACCOUNTING_AMBIGUITY__NONBLOCKING__NOT_PRODUCT_DEFECT` and is superseded by this Controller audit interpretation.

## Artifact custody
- Final C1 evidence ZIP: bytes `8,337,556`, SHA-256 `dc4061180ba988e5e6af302762cbf673a8695773ccd48096d98265519977ef64`.
- Revert/falsification evidence ZIP: bytes `6,861,149`, SHA-256 `16c9d0d49567d82a8c48191966ca7321eabcbd5f416066e20e53aee5e03290dd`.

## Acceptance / next parent
Accepted C1 Product parent for downstream preparation: `ac888c7e622fdefdc4f958771b21db485e33f9fc` with Product source `5885c32a71c14b1b982ec8dcdadba4fafde40c78b2d9287f367f1ca28373f91d / 273`. The final two commits after validated Product HEAD change no Product bytes.

This acceptance closes C1 only. It does not accept C2/C3/B3-R, does not merge `main`, does not release/deploy, and does not freeze the stack.
