# MIMO CLAW HANDOFF — CP-2026-09-30-004

Project: CEP — Cybersecurity Education Platform
Repository: `hamad933/cep-writer-baseline-repo`
Branch: `writer/mi-serial`
Baseline reviewed commit: `dac0396a6aeefbec3c1c4d4a8f8d251e3516ec83`
Previous Controller checkpoint: `CP-2026-09-30-003`
Previous Controller decision: `REVIEWED_HOLD__NO_OWNER_ACCEPTANCE`

## Operating principle

The new MiMo Claw Controller must:

**inherit durable facts → independently verify critical claims → reconcile contradictions → only then accept.**

This handoff is context, not acceptance.

## What may be inherited

- GitHub is the durable control plane.
- Branch: `writer/mi-serial`.
- Baseline reviewed commit: `dac0396a6aeefbec3c1c4d4a8f8d251e3516ec83`.
- 12 Writer result units were durably rescued.
- All 12 remain NOT_OWNER_ACCEPTED.
- The previous Controller review was independent and deliberately conservative.
- Writer PASS/self-acceptance is evidence only.

## What MUST be independently re-verified

### 1. Current tree and build
- Fetch the actual remote branch HEAD first.
- Run the canonical current-tree build.
- Regenerate assurance/browser receipts from that exact tree.
- Prove source-to-generated parity.
- Do not treat historical receipts as current proof.

### 2. Runtime integration
- Start the real runtime lifecycle.
- Verify the real coordinator mount.
- Candidate/in-page mounts are not integration proof.
- Record runtime errors and anomalies.

### 3. Visual verification
- Fresh EN/LTR and AR/RTL captures.
- Fresh matched responsive viewports.
- Reconcile screenshot hashes with exact captured artifacts.
- OCR/DOM/ink/hash are cross-checks.
- If the image channel is stale or unreliable, visual acceptance remains unproven.

### 4. Evidence/report reconciliation
- Newer evidence supersedes stale reports only after explicit reconciliation.
- Evidence without a proper execution report does not prove missing functional/structural ownership claims.
- Never upgrade a surface solely because a Writer says PASS.

### 5. Shared-component governance
Re-verify shared seams and regress affected consumers, especially:
- AD-01 pane proportions.
- AD-02 shared/donor chrome language hardcodes.
- D-08 donor.css right-pane collision.
- Any other shared m0/foundation changes that affect multiple surfaces.

### 6. W03-RUNS architecture gate
H-RUN-1 is mandatory:
`m0-controller-composition.ts` must actually mount `composeRunsSurface` + `renderRunsSurface`.
A candidate mount inside the surface is insufficient.

### 7. W05-AUDIT
The prior review found the execution report missing.
Reconstruct it from real source/evidence or generate a truthful report.
Do not synthesize missing claims.

### 8. W03-ENTERPRISE
Re-run image verification with a trustworthy image channel.
Refresh shared browser/build lineage receipts.
Re-check the shared SpatialNode concern.
Only then revisit acceptance.

## Acceptance rule

A surface is not Controller-accepted until current reproducible evidence supports:
- functional behavior,
- structural composition,
- visual fidelity,
- responsive behavior,
- EN/LTR + AR/RTL,
- shared-component safety,
- source-to-generated truth,
- evidence lineage.

If any acceptance-critical layer is unproven:

**HOLD / BLOCKED — not PASS.**

## Independence rule

The new Controller is expected to disagree when evidence warrants it.

A previous HOLD can be cleared by new proof.
A Writer PASS can be rejected.
New defects must be recorded even if absent from CP-003.

## First execution order

1. Bootstrap and verify the actual GitHub branch HEAD.
2. Read this handoff, `RESUME_STATE.json`, the binding execution standard, dispatch/ownership files, and prior review checkpoint.
3. Build the current tree and regenerate receipts.
4. Execute H-RUN-1.
5. Reconcile stale report/evidence pairs.
6. Perform fresh bilingual matched captures.
7. Reconstruct W05-AUDIT.
8. Re-review W03-ENTERPRISE.
9. Produce a new Controller checkpoint with evidence-bound decisions.

## Forbidden shortcuts

- No force push.
- No reset/revert merely to hide failures.
- No Writer self-acceptance.
- No acceptance from stale screenshots.
- No acceptance from a candidate mount when live route integration is required.
- No acceptance with stale/untrustworthy evidence lineage.
- No completion claims based only on green test counts.

## Status

**READY_FOR_MIMO_CLAW_CONTROLLER_WITH_MANDATORY_INDEPENDENT_REVERIFICATION**
