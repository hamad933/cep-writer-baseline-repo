# MIMO CLAW HANDOFF — CP-2026-09-30-004

Project: CEP — Cybersecurity Education Platform
Repository: `hamad933/cep-writer-baseline-repo`
Branch: `writer/mi-serial`
Baseline reviewed commit: `dac0396a6aeefbec3c1c4d4a8f8d251e3516ec83`
Prior review checkpoint: `CP-2026-09-30-003`
Prior review verdict: `REVIEWED_HOLD__NO_OWNER_ACCEPTANCE`

## Purpose

This is a Controller-to-Controller handoff for a new MiMo Claw environment.

The new Controller MUST use this package as durable context, but MUST NOT treat any previous Controller or Writer verdict as acceptance authority.

The correct operating model is:

**inherit durable facts → independently verify critical claims → reconcile contradictions → only then accept.**

## Durable facts that may be inherited

- GitHub is the durable control plane and current source of truth.
- Branch: `writer/mi-serial`.
- Baseline reviewed commit: `dac0396a6aeefbec3c1c4d4a8f8d251e3516ec83`.
- 12 rescued Writer result units exist and remain NOT_OWNER_ACCEPTED.
- Previous Controller review was independent and intentionally conservative.
- Writer PASS/self-acceptance is never authoritative.
- The previous review found no accepted units.
- Known high-risk areas are shared seams, current-build freshness, route mounting, stale receipts, report/evidence mismatch, and image-channel trust.

## Claims that MUST be re-verified by the new Controller

1. **Current tree/build truth**
   - Checkout the actual branch HEAD.
   - Run the canonical build.
   - Regenerate assurance/browser receipts from the current tree.
   - Prove source-to-generated parity from the current commit.
   - Do not use historical receipts as current proof.

2. **Runtime truth**
   - Start the real runtime lifecycle.
   - Verify route mounting through the real coordinator, not an in-page/candidate mount.
   - Capture fresh EN/LTR and AR/RTL evidence.
   - Capture matched responsive viewports.
   - Record page errors and runtime anomalies.

3. **Visual truth**
   - Treat screenshot hashes, OCR, DOM probes, and ink metrics as cross-checks, not substitutes for trustworthy image verification.
   - If the image channel is stale/unreliable, do not claim visual acceptance.
   - Reconcile every image hash with the exact captured artifact and current commit.

4. **Report/evidence consistency**
   - Where a report is older than evidence, treat the report as stale until reconciled.
   - Where evidence exists without a proper execution report, do not infer missing functional/structural ownership claims.
   - Never upgrade a surface because the Writer report says PASS.

5. **Shared-component safety**
   - Verify AD-01, AD-02, donor.css collision D-08, and other shared seams against all affected consumers.
   - Any shared fix requires regression across its consumers.

6. **W03-RUNS**
   - H-RUN-1 is an architectural gate, not a cosmetic defect.
   - Confirm `composeRunsSurface` + `renderRunsSurface` are actually mounted by `m0-controller-composition.ts`.
   - A candidate mount inside the surface is insufficient.

7. **W05-AUDIT**
   - The prior review found the execution report missing.
   - Reconstruct from real source/evidence or generate a truthful report.
   - Do not synthesize missing proof.

8. **W03-ENTERPRISE**
   - Re-run image verification with a trustworthy image channel.
   - Refresh shared browser/build lineage receipts.
   - Re-evaluate the SpatialNode/shared seam concern.
   - Only then reconsider its status.

## Non-negotiable acceptance rule

A unit may become Controller-accepted only when the new Controller has current, reproducible evidence for:
- functional behavior,
- structural composition,
- visual fidelity,
- responsive behavior,
- EN/LTR and AR/RTL behavior,
- shared-component safety,
- current-build/source-to-dist truth,
- evidence lineage.

If any acceptance-critical layer is unproven, the correct result is HOLD/BLOCKED, not PASS.

## Independence rule

The new Controller is explicitly authorized and expected to disagree with the previous Controller.

A previous HOLD may be cleared with new evidence.
A previous PASS-like Writer statement may be rejected.
A new defect not listed in CP-003 must be recorded if discovered.

## First execution order

1. Bootstrap and verify GitHub branch/head.
2. Read this handoff + RESUME_STATE + VISUAL_EXECUTION_STANDARD + dispatch/ownership files.
3. Build current HEAD and regenerate receipts.
4. Perform the W03-RUNS architecture gate.
5. Reconcile stale report/evidence units.
6. Re-capture bilingual matched viewports.
7. Reconstruct W05-AUDIT.
8. Re-review W03-ENTERPRISE.
9. Produce a fresh Controller checkpoint with explicit evidence refs and acceptance decisions.

## Forbidden shortcuts

- No force push.
- No reset/revert of preserved Writer work merely to make validation green.
- No acceptance from Writer self-report.
- No acceptance from stale screenshots.
- No acceptance from a candidate/in-page mount when live coordinator integration is required.
- No acceptance when evidence lineage is stale or untrustworthy.
- No claiming completion merely because build/test counts are green.

## Handoff status

**READY_FOR_MIMO_CLAW_CONTROLLER_WITH_MANDATORY_INDEPENDENT_REVERIFICATION**

This handoff is a control document, not an acceptance document.
