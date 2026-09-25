import assert from 'node:assert/strict';
import {W04EvidenceDomain,createEvidenceCompareProvider} from '../../../adapters/evidence/domain.js';
import {W04ReviewDomain,ReviewAuthorityRegistry,createTestReviewAuthorityRegistry,createReviewsCompareProvider} from '../../../adapters/reviews/domain.js';
import {W04MasteryDomain,createMasteryCompareProvider} from '../../../adapters/mastery/domain.js';
import {W04PortfolioDomain,createPortfolioCompareProvider} from '../../../adapters/portfolio/domain.js';
import {reviewsCenterProjection,composeReviewsSurface} from '../../../surfaces/reviews/index.js';
import {createMasterySurfaceComposition} from '../../../surfaces/mastery/composition.js';
import {createPortfolioSurfaceComposition} from '../../../surfaces/portfolio/composition.js';
import {createW04RescueComposition} from '../../../surfaces/composition/w04-rescue.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';

console.log('[D10 TEST] Starting W04 Authority + Lifecycle verification...');

// =========================================================================
// 1. Evidence Authority Falsification (A15-PF-001)
// =========================================================================
{
  const domain = new W04EvidenceDomain();

  // Test 1: Self-asserted verification without envelope in product mode fails
  const forgedVerification = domain.importEvidence({
    id: 'ev-forged-1',
    revisionId: 'r1',
    sourceId: 'src-1',
    sourceRevision: 'v1',
    verification: { status: 'VERIFIED' }
  });
  assert.equal(forgedVerification.ok, false);
  assert.equal(forgedVerification.code, 'VERIFICATION_PROVIDER_UNBOUND');

  // Test 2: Schema invalid candidate rejected
  const badSchema = domain.importEvidence({
    id: 'ev-bad-schema',
    revisionId: 'r1',
    sourceId: 'src-1',
    sourceRevision: 'v1',
    schemaValid: false
  });
  assert.equal(badSchema.ok, false);
  assert.equal(badSchema.code, 'SCHEMA_REJECTED');

  // Test 3: Unauthoritative admission authority rejected when registry bound
  const admissionRegistry = {
    resolveAdmissionAuthority(evidenceId, proofRef) {
      if (proofRef === 'authority:admit:authorized') {
        return { state: 'AUTHORIZED', proofRef, testOnly: false };
      }
      if (proofRef === 'authority:admit:test-only') {
        return { state: 'AUTHORIZED', proofRef, testOnly: true };
      }
      return { state: 'REJECTED', reason: 'Unregistered admission authority' };
    }
  };

  const domainWithRegistry = new W04EvidenceDomain(undefined, {
    admissionAuthorityRegistry: admissionRegistry,
    allowTestAuthority: false
  });

  // Import candidate
  const cand = domainWithRegistry.importEvidence({
    id: 'ev-cand-1',
    revisionId: 'r1',
    title: 'Candidate item',
    sourceId: 'src-1',
    sourceRevision: 'v1',
    subject: 'owner:local',
    evidenceClaim: 'Authentic item',
    criterionRefs: ['criteria:v4#integrity'],
    sourceBytesAvailable: true,
    schemaValid: true,
    digest: 'sha256:abcd'
  });
  assert.equal(cand.ok, true);

  // Validate and submit
  domainWithRegistry.verifySource('ev-cand-1', {
    status: 'VERIFIED',
    providerId: 'provider:source-check',
    providerRevision: '1.0.0',
    proofId: 'proof:src:1',
    digest: 'sha256:abcd',
    schemaValid: true,
    sourceBytesAvailable: true
  });
  domainWithRegistry.markCandidateValidated('ev-cand-1', {
    validator: 'test-validator',
    validationProofRef: 'proof:val:1'
  });
  domainWithRegistry.submitCandidate('ev-cand-1', { expectedCandidateRevision: 1 });

  // Forged proofRef rejected
  const forgedAdmit = domainWithRegistry.admit('ev-cand-1', {
    authority: { available: true, proofRef: 'authority:admit:forged' }
  });
  assert.equal(forgedAdmit.ok, false);
  assert.equal(forgedAdmit.code, 'ADMISSION_AUTHORITY_UNAVAILABLE');

  // Test-only authority rejected in product mode (allowTestAuthority: false)
  const testOnlyAdmit = domainWithRegistry.admit('ev-cand-1', {
    authority: { available: true, proofRef: 'authority:admit:test-only' }
  });
  assert.equal(testOnlyAdmit.ok, false);
  assert.equal(testOnlyAdmit.code, 'TEST_AUTHORITY_FORBIDDEN_IN_PRODUCT');

  // Authorized authority passes
  const validAdmit = domainWithRegistry.admit('ev-cand-1', {
    authority: { available: true, proofRef: 'authority:admit:authorized' }
  });
  assert.equal(validAdmit.ok, true);
  assert.equal(validAdmit.record.status, 'ADMITTED');
  assert.equal(validAdmit.revision.lifecycle, 'ACTIVE');

  console.log('[D10 TEST] PASS: Evidence authority falsification verified.');
}

// =========================================================================
// 2. Review Authority & Lifecycle (A15-PF-002, A15-PF-003)
// =========================================================================
{
  const authorityRegistry = new ReviewAuthorityRegistry([
    { identity: 'reviewer:senior', authorized: true, canAssign: true, permissionProofRef: 'perm:senior:1', testOnly: false },
    { identity: 'reviewer:junior', authorized: true, canAssign: false, permissionProofRef: 'perm:junior:1', testOnly: false },
    { identity: 'reviewer:test-actor', authorized: true, canAssign: true, permissionProofRef: 'perm:test:1', testOnly: true },
    { identity: 'reviewer:suspended', authorized: false, canAssign: false, permissionProofRef: 'perm:susp:1', testOnly: false }
  ]);

  const evidenceDomain = new W04EvidenceDomain(undefined, { allowTestAuthority: true });
  // Admit evidence
  evidenceDomain.setAdmissionAuthority('ev-alpha', true, 'authority:evidence-admission:test');
  const evAdmit = evidenceDomain.admit('ev-alpha');
  assert.equal(evAdmit.ok, true);

  const reviewDomain = new W04ReviewDomain([], {
    evidenceResolver: ref => evidenceDomain.resolveReviewableEvidenceRef(ref),
    reviewAuthorityRegistry: authorityRegistry,
    allowTestAuthority: false
  });

  // Test 1: Forged reviewer not in registry is rejected on request
  const forgedRequest = reviewDomain.review('rev-forged', {
    action: 'request',
    evidenceRefs: [`ev-alpha@${evAdmit.revision.revisionId}`],
    criteriaRefs: ['criteria:v4#provenance'],
    reviewer: { identity: 'reviewer:forged', authorityAvailable: true, assignmentPermissionAvailable: true }
  });
  assert.equal(forgedRequest.ok, false);
  assert.equal(forgedRequest.code, 'REVIEWER_AUTHORITY_UNAVAILABLE');

  // Test 2: Suspended reviewer rejected
  const suspendedRequest = reviewDomain.review('rev-susp', {
    action: 'request',
    evidenceRefs: [`ev-alpha@${evAdmit.revision.revisionId}`],
    criteriaRefs: ['criteria:v4#provenance'],
    reviewer: { identity: 'reviewer:suspended', authorityAvailable: true, assignmentPermissionAvailable: true }
  });
  assert.equal(suspendedRequest.ok, false);
  assert.equal(suspendedRequest.code, 'REVIEWER_AUTHORITY_UNAVAILABLE');

  // Test 3: Test-only reviewer rejected when allowTestAuthority is false
  const testOnlyRequest = reviewDomain.review('rev-test', {
    action: 'request',
    evidenceRefs: [`ev-alpha@${evAdmit.revision.revisionId}`],
    criteriaRefs: ['criteria:v4#provenance'],
    reviewer: { identity: 'reviewer:test-actor', authorityAvailable: true, assignmentPermissionAvailable: true }
  });
  assert.equal(testOnlyRequest.ok, false);
  assert.equal(testOnlyRequest.code, 'TEST_AUTHORITY_NOT_ALLOWED_IN_PRODUCT');

  // Test 4: Junior reviewer can request, but cannot assign
  const juniorRequest = reviewDomain.review('rev-junior', {
    action: 'request',
    evidenceRefs: [`ev-alpha@${evAdmit.revision.revisionId}`],
    criteriaRefs: ['criteria:v4#provenance'],
    reviewer: { identity: 'reviewer:junior', authorityAvailable: true, assignmentPermissionAvailable: true }
  });
  assert.equal(juniorRequest.ok, true);
  assert.equal(juniorRequest.record.reviewer.assignmentPermissionAvailable, false); // Forged caller boolean ignored!

  const juniorAssign = reviewDomain.review('rev-junior', { action: 'assign' });
  assert.equal(juniorAssign.ok, false);
  assert.equal(juniorAssign.code, 'ASSIGNMENT_PERMISSION_UNAVAILABLE');

  // Test 5: Full governed lifecycle with senior reviewer
  const seniorRequest = reviewDomain.review('rev-senior', {
    action: 'request',
    evidenceRefs: [`ev-alpha@${evAdmit.revision.revisionId}`],
    criteriaRefs: ['criteria:v4#provenance'],
    reviewer: { identity: 'reviewer:senior' }
  });
  assert.equal(seniorRequest.ok, true);
  assert.equal(seniorRequest.record.state, 'REQUESTED');

  // Full lifecycle: assign -> start -> finding -> ready -> supersede
  const assigned = reviewDomain.review('rev-senior', { action: 'assign' });
  assert.equal(assigned.ok, true);
  assert.equal(assigned.record.state, 'ASSIGNED');

  const started = reviewDomain.review('rev-senior', { action: 'start' });
  assert.equal(started.ok, true);
  assert.equal(started.record.state, 'IN_REVIEW');

  const findingAdded = reviewDomain.finding('rev-senior', {
    findingId: 'f-senior-1',
    text: 'Formal provenance criterion confirmed authentic',
    criterionRef: 'criteria:v4#provenance',
    state: 'SATISFIED'
  });
  assert.equal(findingAdded.ok, true);
  assert.equal(findingAdded.mutated, true);

  const ready = reviewDomain.review('rev-senior', { action: 'ready' });
  assert.equal(ready.ok, true);
  assert.equal(ready.record.state, 'READY_FOR_DECISION');

  const superseded = reviewDomain.supersede('rev-senior', {
    expectedDecisionId: null,
    newDecision: { decisionId: 'dec-formal-1', outcome: 'ACCEPT' },
    correctionReason: 'Initial formal review decision'
  });
  assert.equal(superseded.ok, true);
  assert.equal(superseded.record.state, 'CLOSED');
  assert.equal(superseded.record.effectiveDecisionId, 'dec-formal-1');

  // Rereview from closed decision
  const rereview = reviewDomain.review('rev-senior', {
    action: 'rereview',
    newReviewId: 'rev-senior-rereview'
  });
  assert.equal(rereview.ok, true);
  assert.equal(rereview.record.state, 'REQUESTED');
  assert.equal(rereview.record.previousReviewRef, 'rev-senior');
  assert.equal(rereview.record.priorDecisionRef, 'dec-formal-1');

  // Center projection exposes full lifecycle actions
  const proj = reviewsCenterProjection(reviewDomain, 'rev-senior');
  assert.equal(proj.kind, 'FormalReviewDecisionWorkbench');
  assert.equal(proj.actions.canRereview, true);
  assert.equal(typeof proj.actions.canAssign, 'boolean');
  assert.equal(typeof proj.actions.canStart, 'boolean');
  assert.equal(typeof proj.actions.canAddFinding, 'boolean');
  assert.equal(typeof proj.actions.canMarkReady, 'boolean');
  assert.equal(typeof proj.actions.canContinue, 'boolean');
  assert.equal(typeof proj.actions.canCancel, 'boolean');
  assert.equal(typeof proj.actions.canSupersede, 'boolean');

  console.log('[D10 TEST] PASS: Review authority & full lifecycle verified.');
}

// =========================================================================
// 3. Portfolio Curation & Grouping Hard Ceiling (A15-PF-004)
// =========================================================================
{
  const portfolio = new W04PortfolioDomain();

  // Test 1: Unresolvable source cannot become falsely verified membership (RESOLVABLE)
  const unverifiedAdd = portfolio.curate({
    action: 'add',
    member: { id: 'pm-ghost', refType: 'Evidence', sourceRef: 'ghost@r1', title: 'Ghost evidence' }
  });
  assert.equal(unverifiedAdd.ok, true);
  assert.equal(unverifiedAdd.record.state, 'UNVERIFIED_PROVIDER_UNBOUND');
  assert.notEqual(unverifiedAdd.record.state, 'RESOLVABLE');

  // Test 2: Removing portfolio member preserves canonical source
  const sourceRefBefore = portfolio.get('member-1').sourceRef;
  const revBefore = portfolio.get('member-1').revisionId;
  const removed = portfolio.curate({ action: 'remove', id: 'member-1', expectedRevisionId: revBefore });
  assert.equal(removed.ok, true);
  assert.equal(removed.sourcePreserved, true);
  assert.equal(removed.removed.sourceRef, sourceRefBefore);
  assert.equal(removed.receipt.canonicalSourceWrite, false);

  // Test 3: Grouping without approved registry fails closed
  const member2 = portfolio.get('member-2');
  const unapprovedGroup = portfolio.group(member2.id, 'proj-123', { expectedRevisionId: member2.revisionId });
  assert.equal(unapprovedGroup.ok, false);
  assert.equal(unapprovedGroup.code, 'AUTHORITY_DECISION_REQUIRED');
  assert.equal(unapprovedGroup.groupingState, 'AUTHORITY_PENDING');

  console.log('[D10 TEST] PASS: Portfolio curation & grouping ceiling verified.');
}

// =========================================================================
// 4. AnalyticalCompare Fallback Elimination (A15-PF-006)
// =========================================================================
{
  const masteryDomain = new W04MasteryDomain();
  const portfolioDomain = new W04PortfolioDomain();

  // Passing invalid token throws CENTRAL_ANALYTICAL_COMPARE_REQUIRED
  assert.throws(() => {
    createMasterySurfaceComposition({ domain: masteryDomain, analyticalCompareOwner: { ownerToken: 'FORGED' } });
  }, /CENTRAL_ANALYTICAL_COMPARE_REQUIRED/);

  assert.throws(() => {
    createPortfolioSurfaceComposition({ domain: portfolioDomain, analyticalCompareOwner: { ownerToken: 'FORGED' } });
  }, /CENTRAL_ANALYTICAL_COMPARE_REQUIRED/);

  assert.throws(() => {
    createW04RescueComposition({ analyticalCompareOwner: { ownerToken: 'FORGED' } });
  }, /CENTRAL_ANALYTICAL_COMPARE_REQUIRED/);

  // Exact single owner injected propagates cleanly across all surfaces
  const centralCompare = new AnalyticalCompareOwner();
  const rescue = createW04RescueComposition({ analyticalCompareOwner: centralCompare });
  assert.equal(rescue.shared.analyticalCompareOwner, centralCompare);
  assert.equal(rescue.evidence.compareOwner, centralCompare.owner);
  assert.equal(rescue.reviews.compareOwner, centralCompare.owner);
  assert.equal(rescue.mastery.compareOwner, centralCompare);
  assert.equal(rescue.portfolio.compareOwner, centralCompare);

  // All 4 providers registered in the single central owner
  assert.deepEqual([...centralCompare.providerIds()].sort(), [
    'w04.evidence.analysis',
    'w04.mastery.analysis',
    'w04.portfolio.analysis',
    'w04.reviews.analysis'
  ].sort());

  console.log('[D10 TEST] PASS: AnalyticalCompare single owner propagation verified.');
}

console.log('[D10 TEST] ALL D10 W04 AUTHORITY + LIFECYCLE TESTS PASSED 100%.');
