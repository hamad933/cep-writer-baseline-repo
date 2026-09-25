import assert from 'node:assert/strict';
import {SemanticCommandBus} from '../../../foundation/global/commands.js';
import {HealthRuntimeAdapter,normalizeHealthObservation,HEALTH_COMMANDS} from '../../../adapters/health-runtime.js';
import {ProcessingRuntimeAdapter,PROCESSING_COMMANDS} from '../../../adapters/processing-runtime.js';
import {createValidationConsumerAdapter,VALIDATION_RULESET_IDENTITY,VALIDATION_VALIDATOR_IDENTITY} from '../../../adapters/validation.js';
import {ManualAiDomainAdapter} from '../../../adapters/manual_ai/domain-adapter.js';
import {createManualAiSurfaceComposition} from '../../../surfaces/manual_ai/composition.js';
import {BackupRuntimeAdapter,ProviderAwareBackupIntegrationAdapter,createProviderAwareBackupIntegrationAdapter,BACKUP_COMMANDS} from '../../../adapters/backup-runtime.js';
import {AuditEventDomain,createAuditConsumerAdapter,DurableAuditRuntimeAdapter,sha256Text} from '../../../adapters/audit.js';
import {ReleasesDomainAdapter,                     } from '../../../adapters/releases/domain-adapter.js';
import {createReleasesSurfaceComposition} from '../../../surfaces/releases/composition.js';
import {ConfigurationDomainAdapter} from '../../../adapters/configuration/domain-adapter.js';
import {createConfigurationSurfaceComposition} from '../../../surfaces/configuration/composition.js';
import {createW05RescueComposition,W05_RESCUE_SURFACES} from '../../../surfaces/composition/w05-rescue.js';
import {AnalyticalCompareOwner} from '../../../foundation/analytical/compare.js';

console.log('[D11 TEST] Starting W05 Provider + Product Integration verification...');

// Helpers and mocks
const sha = (char        ) => char.repeat(64);
const sourceDigest = sha('a');
const packageDigest = sha('b');
const artifactDigest = sha('c');

class MockTransport {
  calls                                                   = [];
  responses                                   = [];

  constructor(responses                                   = []) {
    this.responses = [...responses];
  }

  descriptor() {
    return {id: 'D11MockTransport', owner: 'MockTransport', availability: 'AVAILABLE'};
  }

  async request(method        , path        , body     ) {
    this.calls.push({method, path, body});
    const next = this.responses.shift();
    if (typeof next === 'function') return next({method, path, body});
    return structuredClone(next ?? {ok: false, code: 'NO_MOCK_RESPONSE'});
  }
}

const mockAttempt = (number        , state        , providerEvidence      = null) => ({
  attemptId: `attempt-${number}`,
  jobId: 'job-1',
  number,
  state,
  createdAt: `2026-09-18T00:00:0${number}Z`,
  updatedAt: `2026-09-18T00:00:0${number}Z`,
  workerId: state === 'SUCCEEDED' ? 'worker-1' : null,
  leaseId: state === 'SUCCEEDED' ? 'lease-1' : null,
  providerEvidence,
  error: state === 'FAILED' ? 'JOB_FAILED' : null
});

const mockJob = (state = 'FAILED', attempts = [mockAttempt(1, 'FAILED')], extra      = {}) => ({
  jobId: 'job-1',
  requestId: 'req-1',
  inputDigest: 'digest-1',
  taskKind: 'SHA256_JSON',
  state,
  lifecycleVersion: attempts.length,
  createdAt: '2026-09-18T00:00:00Z',
  updatedAt: '2026-09-18T00:00:10Z',
  currentAttemptId: attempts.at(-1)?.attemptId ?? 'attempt-1',
  attemptIds: attempts.map(a => a.attemptId),
  attempts,
  cancellation: null,
  validationHandoff: null,
  ...extra
});

// =========================================================================
// Group 1: Health & Processing Provider Truth
// =========================================================================
console.log('\n--- Group 1: Health & Processing Provider Truth ---');

// 1.1 Heartbeat, queue depth zero does NOT imply worker alive, epistemic states
{
  const queueObs = normalizeHealthObservation({
    observationId: 'q1',
    sourceId: 'health.processing.queue',
    kind: 'QueueMetric',
    status: 'AVAILABLE',
    observedAt: '2026-09-18T00:00:00Z',
    freshnessMs: 5000,
    value: {depth: 0}
  });
  const workerObs = normalizeHealthObservation({
    observationId: 'w1',
    sourceId: 'health.processing.worker',
    kind: 'WorkerLiveness',
    status: 'STALE',
    observedAt: '2026-09-17T23:59:00Z',
    freshnessMs: 5000,
    value: {state: 'EXPIRED'}
  });

  assert.equal(queueObs.state, 'AVAILABLE_EMPTY', 'Queue depth 0 must map to AVAILABLE_EMPTY');
  assert.equal(workerObs.state, 'STALE', 'Expired worker status must remain STALE');
  assert.equal(workerObs.workerState, 'EXPIRED', 'Worker state must reflect EXPIRED');

  // Unavailable source never claims green/available, observedAt is null
  const unavail = normalizeHealthObservation({
    sourceId: 'health.unregistered',
    kind: 'Observation',
    status: 'UNAVAILABLE',
    value: null,
    error: 'SOURCE_OFFLINE'
  });
  assert.equal(unavail.state, 'UNAVAILABLE');
  assert.equal(unavail.observedAt, null, 'Unavailable source must not fabricate observedAt');
  console.log('✓ 1.1 Health observations maintain strict epistemic states without false alive');
}

// 1.2 Health diagnose is distinct durable request; transport failures preserve last known observation
{
  const transport = new MockTransport([
    {
      ok: true,
      observations: [
        {
          observationId: 'obs-init',
          sourceId: 'health.system',
          kind: 'Observation',
          status: 'AVAILABLE',
          observedAt: '2026-09-18T00:00:00Z',
          freshnessMs: 5000,
          value: {load: 0.12}
        }
      ]
    },
    {
      ok: true,
      diagnostic: {diagnosticId: 'diag-dur-1', durable: true, recordedAt: '2026-09-18T00:00:05Z'}
    }
  ]);

  const adapter = new HealthRuntimeAdapter({transport});
  await adapter.refresh();
  assert.equal(adapter.rows().length, 1);
  assert.equal(adapter.snapshot().lastDiagnostic, null, 'Refresh must not create diagnostic');

  await adapter.diagnose();
  assert.equal(adapter.snapshot().lastDiagnostic.diagnostic.diagnosticId, 'diag-dur-1');
  assert.equal(transport.calls[1].path, '/v1/health/diagnostic');

  // Transport failure preserves last known observation
  const transport2 = new MockTransport([
    {
      ok: true,
      observations: [
        {
          observationId: 'obs-init-2',
          sourceId: 'health.system',
          kind: 'Observation',
          status: 'AVAILABLE',
          observedAt: '2026-09-18T00:00:00Z',
          freshnessMs: 5000,
          value: {load: 0.12}
        }
      ]
    },
    {ok: false, code: 'NETWORK_TIMEOUT'}
  ]);
  const adapter2 = new HealthRuntimeAdapter({transport: transport2});
  await adapter2.refresh();
  assert.equal(adapter2.rows().length, 1);
  await adapter2.refresh();
  assert.equal(adapter2.rows().length, 1, 'Transport failure must retain last known observation');
  assert.equal(adapter2.snapshot().lastError.code, 'NETWORK_TIMEOUT');
  assert.deepEqual(HEALTH_COMMANDS, ['health.refresh', 'health.inspect', 'health.diagnose']);
  console.log('✓ 1.2 Health diagnostics are durable requests; transport failure preserves cached state');
}

// 1.3 Processing epistemic states and retry state guards (A16-PF-002)
{
  // Test 1: Retry prohibited when job is RUNNING
  const runningJob = mockJob('RUNNING', [mockAttempt(1, 'RUNNING')]);
  const transport = new MockTransport([{ok: true, jobs: [runningJob]}]);
  const adapter = new ProcessingRuntimeAdapter({transport});
  await adapter.refresh();

  const retryRunning = await adapter.retry();
  assert.equal(retryRunning.ok, false);
  assert.equal(retryRunning.code, 'RETRY_NOT_ALLOWED');

  // Test 2: Retry prohibited when job is COMPLETED
  const completedJob = mockJob('COMPLETED', [mockAttempt(1, 'SUCCEEDED', {providerRunId: 'pr-1', evidence: {}})], {selectedId: 'job-1'});
  const transport2 = new MockTransport([{ok: true, jobs: [completedJob]}]);
  const adapter2 = new ProcessingRuntimeAdapter({transport: transport2});
  await adapter2.refresh();

  const retryCompleted = await adapter2.retry();
  assert.equal(retryCompleted.ok, false);
  assert.equal(retryCompleted.code, 'RETRY_NOT_ALLOWED');

  // Test 3: Retry allowed on FAILED job; retains failed attempt and appends new attempt
  const failedBefore = mockJob('FAILED', [mockAttempt(1, 'FAILED')]);
  const queuedAfter = mockJob('PENDING', [mockAttempt(1, 'FAILED'), mockAttempt(2, 'QUEUED')]);
  const transport3 = new MockTransport([
    {ok: true, jobs: [failedBefore]},
    {ok: true, job: queuedAfter}
  ]);
  const adapter3 = new ProcessingRuntimeAdapter({transport: transport3});
  await adapter3.refresh();

  const retryRes = await adapter3.retry();
  assert.equal(retryRes.ok, true);
  const selected = adapter3.selected();
  assert.equal(selected.attempts.length, 2);
  assert.equal(selected.attempts[0].state, 'FAILED', 'Original failed attempt must be preserved');
  assert.equal(selected.attempts[1].state, 'QUEUED');
  assert.notEqual(selected.attempts[0].attemptId, selected.attempts[1].attemptId, 'Attempt IDs must be unique');

  // Test 4: Retry replayed while pending returns RETRY_NOT_ALLOWED without fabricating attempt
  const replayed = await adapter3.retry();
  assert.equal(replayed.ok, false);
  assert.equal(replayed.code, 'RETRY_NOT_ALLOWED');
  assert.equal(adapter3.selected().attempts.length, 2, 'Replayed retry must not mutate attempt count');
  console.log('✓ 1.3 Processing retry state guard blocks invalid transitions and preserves attempt history');
}

// 1.4 Processing cancellation and validation handoff semantics
{
  // Cancellation request without provider ack is NOT cancelled
  const pendingJob = mockJob('PENDING', [mockAttempt(1, 'QUEUED')]);
  const cancelRequestedJob = mockJob('CANCEL_REQUESTED', [mockAttempt(1, 'QUEUED')], {
    cancellation: {
      requestId: 'cnl-1',
      jobId: 'job-1',
      state: 'REQUESTED',
      requestedAt: '2026-09-18T00:01:00Z',
      acknowledgedAt: null,
      providerEvidence: null
    }
  });

  const transport = new MockTransport([
    {ok: true, jobs: [pendingJob]},
    {ok: true, job: cancelRequestedJob, cancellation: cancelRequestedJob.cancellation}
  ]);
  const adapter = new ProcessingRuntimeAdapter({transport});
  await adapter.refresh();
  await adapter.requestCancel();

  const cancelTruth = adapter.inspect({jobId: 'job-1'}).cancellationTruth;
  assert.equal(cancelTruth.requested, true);
  assert.equal(cancelTruth.acknowledged, false);
  assert.equal(cancelTruth.cancelled, false, 'Cancel request must not claim cancelled without provider ack');

  // Validation handoff pending is not consumer success
  const proof = {providerRunId: 'pr-1', evidence: {verified: true}};
  const succJob = mockJob('COMPLETED', [mockAttempt(1, 'SUCCEEDED', proof)]);
  const handoffJob = mockJob('COMPLETED', [mockAttempt(1, 'SUCCEEDED', proof)], {
    validationHandoff: {
      handoffId: 'hnd-1',
      jobId: 'job-1',
      consumerId: 'processing-validator',
      state: 'PENDING',
      requestedAt: '2026-09-18T00:02:00Z',
      acknowledgedAt: null,
      consumerReceipt: null
    }
  });

  const transport2 = new MockTransport([
    {ok: true, jobs: [succJob]},
    {ok: true, job: handoffJob, handoff: handoffJob.validationHandoff}
  ]);
  const adapter2 = new ProcessingRuntimeAdapter({transport: transport2});
  await adapter2.refresh();
  await adapter2.validationHandoff();

  const valTruth = adapter2.inspect({jobId: 'job-1'}).validationTruth;
  assert.equal(valTruth.state, 'PENDING');
  assert.equal(valTruth.acknowledged, false, 'Pending handoff must not claim consumer acknowledgment');

  // Completion without provider evidence is unproven
  const noProofJob = mockJob('COMPLETED', [mockAttempt(1, 'SUCCEEDED', null)]);
  const transport3 = new MockTransport([{ok: true, jobs: [noProofJob]}]);
  const adapter3 = new ProcessingRuntimeAdapter({transport: transport3});
  await adapter3.refresh();
  assert.equal(adapter3.inspect({jobId: 'job-1'}).providerTruth.proven, false);

  assert.deepEqual(PROCESSING_COMMANDS, ['processing.inspect', 'processing.retry', 'processing.requestCancel', 'processing.validationHandoff']);
  console.log('✓ 1.4 Processing cancellation and validation handoff maintain strict provider evidence bounds');
}

// =========================================================================
// Group 2: Validation & Manual AI
// =========================================================================
console.log('\n--- Group 2: Validation & Manual AI ---');

// 2.1 Exact artifact identity, ruleset binding, and technical validity boundaries
{
  const valAdapter = createValidationConsumerAdapter();
  const validPayload = JSON.stringify({
    artifactRef: 'artifact-core-1',
    artifactDigest,
    ruleset: VALIDATION_RULESET_IDENTITY,
    validator: VALIDATION_VALIDATOR_IDENTITY,
    payload: {verified: true}
  });

  const res = await valAdapter.validate(validPayload);
  assert.equal(res.status, 'TECHNICALLY_VALID');
  assert.equal(res.identity.artifact.digest, artifactDigest);
  assert.equal(valAdapter.truth().formalReviewAuthority, false, 'Technical validation must never claim formal review authority');

  // Stale detection when inspecting against mismatched artifact identity
  const inspectStale = valAdapter.inspect({
    resultId: res.resultId,
    currentIdentity: {
      artifactRef: 'artifact-core-modified',
      artifactDigest: sha('d'),
      ruleset: VALIDATION_RULESET_IDENTITY,
      validator: VALIDATION_VALIDATOR_IDENTITY
    }
  });
  assert.equal(inspectStale.code, 'STALE_FOR_CURRENT_ARTIFACT');
  assert.equal(inspectStale.currentIdentityMatches, false);
  assert.equal(inspectStale.acceptance, null);

  // Missing validator identity returns UNAVAILABLE, never passes
  const missingValidatorPayload = JSON.stringify({
    artifactRef: 'artifact-core-1',
    artifactDigest,
    ruleset: VALIDATION_RULESET_IDENTITY,
    payload: {verified: true}
  });
  const missingRes = await valAdapter.validate(missingValidatorPayload);
  assert.equal(missingRes.status, 'UNAVAILABLE');
  assert.equal(missingRes.technicalFindings.some((f     ) => f.code === 'VALIDATOR_IDENTITY_MISSING'), true);

  // Technical findings never masquerade as W04 formal review findings
  const invalidJsonRes = await valAdapter.validate('{ malformed');
  const findings = valAdapter.findings({resultId: invalidJsonRes.resultId});
  assert.equal(findings.formalReviewFindings.length, 0);
  assert.equal(findings.technicalFindings.every((f     ) => f.formalReviewFinding === false), true);
  console.log('✓ 2.1 Validation consumer preserves artifact identity and forbids review authority overreach');
}

// 2.2 Manual AI: provider neutrality, no hidden calls, exact provenance equality, idempotent drafts
{
  let draftCalls = 0;
  const manualAdapter = new ManualAiDomainAdapter({
    io: {
      exportPackage: () => ({artifactId: 'pkg-m1', digest: packageDigest})
    },
    draftSink: {
      createWorkingDraft: () => {
        draftCalls++;
        return {draftId: 'draft-id-1', status: 'CREATED'};
      }
    }
  });

  manualAdapter.prepare({
    proposalId: 'prop-1',
    revision: 'rev-1',
    sourceDigest,
    sourceId: 'src-alpha'
  });

  // Zero hidden provider calls
  assert.equal(manualAdapter.diagnosticProjection().hiddenProviderCalls, 0);

  // Export binds source provenance and returns artifact package digest
  const exportRes = manualAdapter.export('prop-1');
  assert.equal(exportRes.ok, true);
  assert.equal(exportRes.packet.sourceId, 'src-alpha');
  assert.equal(exportRes.packet.sourceRevisionId, 'rev-1');
  assert.equal(exportRes.packet.sourceDigest, sourceDigest);
  assert.equal(exportRes.artifact.digest, packageDigest);

  // Provenance mismatch fails closed
  const mismatchRes = manualAdapter.import({
    proposalId: 'prop-1',
    sourceId: 'src-tampered',
    sourceRevisionId: 'rev-2',
    sourceDigest: sha('f'),
    packageDigest,
    content: 'untrusted recommendation'
  });
  assert.equal(mismatchRes.ok, false);
  assert.equal(mismatchRes.code, 'PROVENANCE_INVALID');
  const selectedProposal = manualAdapter.selected();
  assert.equal(selectedProposal?.provenance.sourceId, 'src-alpha');
  assert.equal(selectedProposal?.sourceDigest, sourceDigest);

  // Exact matching import succeeds on a properly exported proposal
  manualAdapter.prepare({
    proposalId: 'prop-2',
    revision: 'rev-1',
    sourceDigest,
    sourceId: 'src-alpha'
  });
  manualAdapter.export('prop-2');

  const matchRes = manualAdapter.import({
    proposalId: 'prop-2',
    sourceId: 'src-alpha',
    sourceRevisionId: 'rev-1',
    sourceDigest,
    packageDigest,
    content: 'verified human-assisted recommendation'
  });
  assert.equal(matchRes.ok, true);
  assert.equal(matchRes.provenanceEqual, true);
  assert.equal(matchRes.proposal.state, 'IMPORTED');

  // Adjudication accept produces working draft only, canonicalPublication remains false
  const review1 = manualAdapter.review({id: 'prop-2', disposition: 'ACCEPT'});
  assert.equal(review1.ok, true);
  assert.equal(review1.code, 'ACCEPTED_AS_DRAFT');
  assert.equal(review1.canonicalPublication, false);
  assert.equal(draftCalls, 1);

  // Idempotent re-review does not create duplicate drafts
  const review2 = manualAdapter.review({id: 'prop-2', disposition: 'ACCEPT'});
  assert.equal(review2.ok, true);
  assert.equal(review2.idempotent, true);
  assert.equal(draftCalls, 1, 'Draft sink must not be called a second time');

  // Surface composition wiring
  const manualComp = createManualAiSurfaceComposition({commands: new SemanticCommandBus()});
  assert.equal(manualComp.slots.LEFT, 'collection');
  assert.equal(manualComp.slots.CENTER, 'ManualProposalAdjudicationWorkbench');
  assert.equal(manualComp.providerTruth.hiddenProviderCalls, 0);
  console.log('✓ 2.2 Manual AI enforces zero hidden execution, strict provenance, and working draft containment');
}

// =========================================================================
// Group 3: Backup & Audit Provider Truth
// =========================================================================
console.log('\n--- Group 3: Backup & Audit Provider Truth ---');

// 3.1 Backup: Stage -> Drill seam, preserved provider receipts, isolated drill, authority pending
{
  class BackupFakeTransport {
    calls        = [];
    async request(method        , path        , body     ) {
      this.calls.push({method, path, body});
      if (path === '/v1/backup/package') {
        return {
          ok: true,
          status: 'PACKAGE_VERIFIED',
          packageId: 'pkg-d11-1',
          capturedAt: '2026-09-18T00:00:00Z',
          manifestSha256: sha('1'),
          snapshotSha256: sha('2'),
          schemaArtifactSha256: sha('3'),
          migrations: [{version: 1, name: 'schema-v1', checksum: sha('4')}],
          readbackSummary: {documentCount: 5},
          liveRestored: false,
          activationState: 'NOT_REQUESTED'
        };
      }
      if (path === '/v1/backup/preview') {
        return {
          ok: true,
          status: 'PREVIEW_CLEAN',
          packageId: body.packageId,
          schemaComparison: {status: 'MATCH', conflict: false},
          restoreWritesPerformed: false,
          liveRestored: false
        };
      }
      if (path === '/v1/backup/stage') {
        return {
          ok: true,
          status: 'STAGED',
          packageId: body.packageId,
          target: {kind: 'ISOLATED_RESTORE_DRILL', live: false, trueEmptyRequired: true},
          productionDatabaseMutated: false,
          liveRestored: false
        };
      }
      if (path === '/v1/backup/drill') {
        return {
          ok: true,
          status: 'STAGED_AND_VERIFIED',
          drillId: 'drill-d11-1',
          packageId: body.packageId,
          target: {isolated: true, trueEmptyBeforeRestore: true},
          liveRestored: false,
          activationState: 'NOT_REQUESTED'
        };
      }
      if (path === '/v1/backup/activation-request') {
        return {
          ok: true,
          status: 'AUTHORITY_PENDING',
          requestId: 'act-d11-1',
          drillId: body.drillId,
          packageId: 'pkg-d11-1',
          liveRestored: false,
          productionDatabaseMutated: false
        };
      }
      if (path.startsWith('/v1/backup/attempts')) {
        return {
          ok: true,
          attempts: [
            {attemptId: 'att-1', packageId: 'pkg-d11-1', status: 'SUCCESS', timestamp: '2026-09-18T00:00:00Z'}
          ]
        };
      }
      return {ok: false, code: 'UNKNOWN_PATH'};
    }
  }

  const transport = new BackupFakeTransport();
  const backup = createProviderAwareBackupIntegrationAdapter({transport});

  // Create package
  const pkgRes = await backup.createPackage('test-d11-package');
  assert.equal(pkgRes.ok, true);

  // Plan and preview
  const planRes = backup.plan();
  assert.equal(planRes.ok, true);
  assert.equal(planRes.restoreWritesPerformed, false);

  const previewRes = await backup.preview();
  assert.equal(previewRes.ok, true);
  assert.equal(previewRes.liveRestored, false);

  // Stage preserves providerReceipt (A08-PF-002, A17-PF-001)
  const stageRes = await backup.stage();
  assert.equal(stageRes.ok, true);
  assert.equal(stageRes.status, 'STAGED');
  assert.equal(stageRes.productionDatabaseMutated, false);
  assert.equal(stageRes.liveRestored, false);
  assert.equal(stageRes.target.kind, 'ISOLATED_RESTORE_DRILL');
  assert.ok(stageRes.providerReceipt, 'Stage must preserve providerReceipt');
  assert.equal(stageRes.providerReceipt.status, 'STAGED');

  // Drill executes on staged artifact
  const drillRes = await backup.drill();
  assert.equal(drillRes.ok, true);
  assert.equal(drillRes.status, 'STAGED_AND_VERIFIED');
  assert.equal(drillRes.target.isolated, true);
  assert.equal(drillRes.liveRestored, false);

  // Activation request is authority pending and does NOT live restore
  const actRes = await backup.requestActivation();
  assert.equal(actRes.ok, true);
  assert.equal(actRes.status, 'AUTHORITY_PENDING');
  assert.equal(actRes.liveRestored, false);
  assert.equal(actRes.productionDatabaseMutated, false);

  // Truth projection checks
  const truth = backup.truth();
  assert.equal(truth.liveRestored, false);
  assert.equal(truth.providerOwnsSurfaceSemantics, false);
  assert.equal(truth.persistenceOwnerMutated, false);
  assert.equal(truth.activationAuthority, 'AUTHORITY_PENDING');
  console.log('✓ 3.1 Backup Stage->Drill seam preserves provider receipt without mutating production');
}

// 3.2 Backup rehydration and durable attempt journal preservation (A17-PF-002, A17-PF-003)
{
  const snapValid = {
    packages: [
      {
        packageId: 'pkg-rehydrate-1',
        label: 'test-backup',
        state: 'CREATED',
        createdAt: '2026-09-18T00:00:00Z',
        manifestSha256: sha('1'),
        snapshotSha256: sha('2'),
        schemaArtifactSha256: sha('3')
      }
    ],
    selectedPackageId: 'pkg-rehydrate-1',
    plan: {planId: 'plan-1', packageId: 'pkg-rehydrate-1', steps: []},
    preview: {previewId: 'prev-1', packageId: 'pkg-rehydrate-1'},
    stage: {stageId: 'stage-1', packageId: 'pkg-rehydrate-1', status: 'STAGED'},
    lastDrill: {drillId: 'drill-1', packageId: 'pkg-rehydrate-1', status: 'STAGED_AND_VERIFIED'},
    durableAttempts: [
      {attemptId: 'att-1', packageId: 'pkg-rehydrate-1', status: 'SUCCESS'}
    ]
  };

  // Rehydration with invalid snapshot fails
  const adapter = createProviderAwareBackupIntegrationAdapter();
  assert.throws(() => adapter.rehydrate(null), /BACKUP_SNAPSHOT_REQUIRED/);
  assert.throws(() => adapter.rehydrate({packages: 'not-array'}), /BACKUP_PACKAGES_ARRAY_REQUIRED/);
  assert.throws(() => adapter.rehydrate({packages: [{invalid: true}], selectedPackageId: 'p1'}), /BACKUP_PACKAGE_IDENTITY_REQUIRED/);

  // Valid rehydration restores state and durable attempts
  const rehydrateRes = adapter.rehydrate(snapValid);
  assert.equal(rehydrateRes.ok, true);
  assert.equal(rehydrateRes.rehydrated, true);
  assert.equal(rehydrateRes.packageCount, 1);
  assert.equal(rehydrateRes.durableAttemptCount, 1);

  const snapshot = adapter.snapshot();
  assert.equal(snapshot.selectedPackageId, 'pkg-rehydrate-1');
  assert.equal(snapshot.packages[0].packageId, 'pkg-rehydrate-1');
  assert.equal(snapshot.durableAttempts.length, 1);
  assert.equal(snapshot.durableAttempts[0].attemptId, 'att-1');
  console.log('✓ 3.2 Backup rehydration strictly validates shape and restores durable attempt journal');
}

// 3.3 Audit: canonical eventId/occurredAt SHA-256 hash chain and tamper detection (A17-PF-004, A17-PF-005)
{
  const auditDomain = new AuditEventDomain({
    seed: false,
    clock: () => '2026-09-18T00:00:00Z'
  });

  const ev1 = auditDomain.append({action: 'AUTH_LOGIN', target: 'user-1', eventId: 'event-001', occurredAt: '2026-09-18T00:00:01Z'});
  const ev2 = auditDomain.append({action: 'CONFIG_CHANGE', target: 'policy-1', eventId: 'event-002', occurredAt: '2026-09-18T00:00:02Z'});
  const ev3 = auditDomain.append({action: 'BACKUP_CREATE', target: 'pkg-1', eventId: 'event-003', occurredAt: '2026-09-18T00:00:03Z'});

  // Hash chain verification succeeds
  const verifyValid = auditDomain.verify();
  assert.equal(verifyValid.status, 'VALID_CHAIN');
  assert.equal(verifyValid.encryptionClaim, false);
  assert.equal(verifyValid.hashAlgorithm, 'SHA-256');

  // Rows retain canonical IDs
  const rows = auditDomain.rows();
  assert.equal(rows.length, 3);
  assert.equal(rows[0].eventId, 'event-001');
  assert.equal(rows[0].occurredAt, '2026-09-18T00:00:01Z');
  assert.equal(rows[1].eventId, 'event-002');
  assert.equal(rows[2].eventId, 'event-003');

  // Annotation matches canonical eventId and leaves recordHash untouched
  const annotateRes = auditDomain.annotate({eventId: 'event-002', note: 'Reviewed by security compliance'});
  assert.equal(annotateRes.ok, true);
  assert.equal(annotateRes.separateFromAuditEvent, true);
  assert.equal(annotateRes.auditRecordHashUnchanged, true);
  assert.equal(auditDomain.rows()[1].recordHash, ev2.recordHash, 'Audit recordHash must remain unchanged after annotation');
  assert.equal(auditDomain.truth().annotationCount, 1);
  assert.equal(auditDomain.truth().canonicalEventId, true);
  assert.equal(auditDomain.truth().canonicalOccurredAt, true);

  // Tamper detection: modifying action or timestamp invalidates chain at exact sequence
  const tamperedRows = auditDomain.rows().map(r => ({...r}));
  tamperedRows[1].action = 'UNAUTHORIZED_MUTATION';
  const tamperAction = auditDomain.verifyObserved(tamperedRows);
  assert.equal(tamperAction.status, 'INVALID_CHAIN');
  assert.equal(tamperAction.firstInvalidSequence, 2);

  const tamperedDateRows = auditDomain.rows().map(r => ({...r}));
  tamperedDateRows[0].occurredAt = '1970-01-01T00:00:00Z';
  const tamperDate = auditDomain.verifyObserved(tamperedDateRows);
  assert.equal(tamperDate.status, 'INVALID_CHAIN');
  assert.equal(tamperDate.firstInvalidSequence, 1);

  // Known SHA-256 vector
  assert.equal(sha256Text('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  console.log('✓ 3.3 Audit binds canonical eventId/occurredAt into SHA-256 hash chain with strict tamper falsification');
}

// =========================================================================
// Group 4: Releases & Configuration Separation and Canonical Command Bus DI
// =========================================================================
console.log('\n--- Group 4: Releases & Configuration Separation and Canonical Bus DI ---');

const testCandidate = (id        , patch      = {})                   => ({
  candidateId: id,
  commitSHA: sha(id === 'A' ? 'a' : 'e'),
  treeSHA: sha(id === 'A' ? 'b' : 'f'),
  artifactDigest: sha(id === 'A' ? 'c' : '1'),
  state: 'TECHNICALLY_READY',
  evidenceDigest: sha(id === 'A' ? 'd' : '2'),
  authorization: 'NONE',
  deployment: 'NOT_DEPLOYED',
  deploymentObservedAt: null,
  ...patch
});

// 4.1 Releases: candidate evidence binding, readiness vs authorization vs deployment separation
{
  // Evidence binding mismatch rejected
  assert.throws(
    () => new ReleasesDomainAdapter({
      candidates: [
        testCandidate('A', {
          evidenceBinding: {
            digest: sha('d'),
            candidateRef: {candidateId: 'B', commitSHA: sha('e'), treeSHA: sha('f'), artifactDigest: sha('1')},
            method: 'TEST'
          }
        })
      ]
    }),
    /RELEASE_EVIDENCE_CANDIDATE_BINDING_MISMATCH/
  );

  const relAdapter = new ReleasesDomainAdapter({
    candidates: [testCandidate('A'), testCandidate('B')],
    analyticalCompareOwner: new AnalyticalCompareOwner(),
    requester: {
      request: () => ({requestId: 'auth-req-1', state: 'REQUESTED'})
    }
  });

  // Readiness is NOT authorization and NOT deployment
  const insp = relAdapter.inspect('A');
  assert.equal(insp.ok, true);
  assert.equal(insp.candidate.state, 'TECHNICALLY_READY');
  assert.equal(insp.candidate.authorization, 'NONE');
  assert.equal(insp.candidate.deployment, 'NOT_DEPLOYED');
  assert.equal(insp.truth.technicalReadinessIsAuthorization, false);
  assert.equal(insp.truth.authorizationIsDeployment, false);

  // Requesting authorization does NOT deploy
  relAdapter.select('A');
  const authRes = relAdapter.requestAuthorization();
  assert.equal(authRes.ok, true);
  assert.equal(authRes.authorization, 'REQUESTED');
  assert.equal(authRes.deployment, 'NOT_DEPLOYED');
  assert.equal(authRes.executesAuthorizationDecision, false);
  assert.equal(authRes.executesDeployment, false);

  // Release plan is non-executing and bound to candidate
  const plan = relAdapter.plan('A');
  assert.equal(plan.ok, true);
  assert.equal(plan.candidateRef.commitSHA, sha('a'));
  assert.equal(plan.executesAuthorization, false);
  assert.equal(plan.executesDeployment, false);

  // Exact pair compare through AnalyticalCompareOwner
  const bus = new SemanticCommandBus();
  const relComp = createReleasesSurfaceComposition({adapter: relAdapter, commands: bus});
  const compareRes = relComp.commands.execute('releases.compare', {leftId: 'A', rightId: 'B'});
  assert.equal(compareRes.ok, true);
  assert.equal(compareRes.mode, 'EXACT_PAIR');
  assert.equal(compareRes.receipt.owner, 'AnalyticalCompareOwner');
  console.log('✓ 4.1 Releases candidate evidence binding and three-state separation verified');
}

// 4.2 Configuration: proposal containment, zero live mutation, sensitive key exclusion, global settings boundary
{
  const obs = {
    key: 'runtime.maxWorkers',
    presentVersion: 'v1',
    redactedValue: '***8',
    source: 'local-runtime',
    observedAt: '2026-09-18T00:00:00Z',
    restartRequired: false,
    state: 'AVAILABLE'         
  };

  const sensitiveObs = {
    key: 'provider.apiKey',
    presentVersion: 'v1',
    redactedValue: '***REDACTED***',
    source: 'local-runtime',
    observedAt: '2026-09-18T00:00:00Z',
    restartRequired: false,
    state: 'AVAILABLE'         
  };

  let applyCalls = 0;
  const cfgAdapter = new ConfigurationDomainAdapter({
    observations: [obs, sensitiveObs],
    authority: {
      id: 'cfg-auth-1',
      requestApply: (proposal     ) => {
        applyCalls++;
        return {status: 'APPLY_REQUESTED', authorityId: 'cfg-auth-1'};
      }
    }
  });

  // Edit creates proposal only; zero authority calls
  cfgAdapter.beginProposal('runtime.maxWorkers', '16');
  assert.equal(applyCalls, 0);
  assert.equal(cfgAdapter.proposal('runtime.maxWorkers')?.application, 'NOT_APPLIED');

  // Validate never applies
  const valRes = cfgAdapter.validate('runtime.maxWorkers');
  assert.equal(valRes.state, 'VALIDATED');
  assert.equal(valRes.application, 'NOT_APPLIED');
  assert.equal(applyCalls, 0);

  // Version conflict becomes INVALID, not applied
  (cfgAdapter       ).observations[0].presentVersion = 'v2';
  const conflictRes = cfgAdapter.validate('runtime.maxWorkers');
  assert.equal(conflictRes.state, 'INVALID');
  assert.equal(conflictRes.validation.reason, 'VERSION_CONFLICT');
  assert.equal(conflictRes.application, 'NOT_APPLIED');

  // Reset discards proposal only without mutating live config
  const resetRes = cfgAdapter.reset('runtime.maxWorkers');
  assert.equal(resetRes.ok, true);
  assert.equal(resetRes.liveConfigMutation, false);
  assert.equal(resetRes.presentVersion, 'v2');
  assert.equal(cfgAdapter.proposal('runtime.maxWorkers'), null);

  // Sensitive config key excluded before proposal
  assert.throws(
    () => cfgAdapter.beginProposal('provider.apiKey', 'super-secret'),
    /SENSITIVE_CONFIG_KEY_EXCLUDED/
  );

  // Global settings boundary in composition
  const cfgComp = createConfigurationSurfaceComposition({commands: new SemanticCommandBus()});
  assert.equal(cfgComp.slots.CENTER, 'OperationalConfigInspectionWorkbench');
  assert.equal(cfgComp.settingsBoundary.globalSettingsOwner, 'SettingsCenterOwner');
  assert.equal(cfgComp.settingsBoundary.operationalConfigurationOwner, 'ConfigurationDomainAdapter');
  assert.equal(cfgComp.settingsBoundary.duplicateSettingsEngine, false);
  console.log('✓ 4.2 Configuration proposal containment and global settings boundary verified');
}

// 4.3 Canonical SemanticCommandBus DI Contract Falsification (D03A)
{
  // Calling compositions without commands throws CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED
  assert.throws(
    () => createManualAiSurfaceComposition({commands: null       }),
    /CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED/
  );
  assert.throws(
    () => createReleasesSurfaceComposition({commands: undefined       }),
    /CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED/
  );
  assert.throws(
    () => createConfigurationSurfaceComposition({commands: {}       }),
    /CANONICAL_SEMANTIC_COMMAND_BUS_REQUIRED/
  );

  // Passing a valid SemanticCommandBus succeeds
  const bus = new SemanticCommandBus();
  const mComp = createManualAiSurfaceComposition({commands: bus});
  const rComp = createReleasesSurfaceComposition({commands: bus});
  const cComp = createConfigurationSurfaceComposition({commands: bus});

  assert.equal(mComp.commands, bus);
  assert.equal(rComp.commands, bus);
  assert.equal(cComp.commands, bus);
  console.log('✓ 4.3 Canonical SemanticCommandBus DI contract enforced across all W05 surfaces');
}

// 4.4 W05 Rescue Composition End-to-End Integration
{
  const centralCompare = new AnalyticalCompareOwner();
  const centralCommands = new SemanticCommandBus();
  const rescueComp = createW05RescueComposition({
    analyticalCompareOwner: centralCompare,
    commands: centralCommands
  });

  assert.equal(rescueComp.owner, 'CG6W05RescueComposition');
  assert.deepEqual(rescueComp.surfaceIds, [...W05_RESCUE_SURFACES]);
  assert.ok(rescueComp.commands instanceof SemanticCommandBus);

  // Check surfaces present
  for (const s of W05_RESCUE_SURFACES) {
    assert.ok(rescueComp.surfaces[s], `Surface ${s} must be present in composition`);
  }

  // Check provider bindings
  assert.equal(rescueComp.providerBindings.processing, 'ProcessingCapability');
  assert.equal(rescueComp.providerBindings.backup, 'BackupRestoreCapability');
  assert.equal(rescueComp.providerBindings.audit, 'AuditEventProvider');

  // Check truth ceilings
  assert.equal(rescueComp.truthCeilings.queueDepthIsWorkerLiveness, false);
  assert.equal(rescueComp.truthCeilings.processingCompletedNeedsProviderEvidence, true);
  assert.equal(rescueComp.truthCeilings.cancelRequestIsCancelSuccess, false);
  assert.equal(rescueComp.truthCeilings.backupStageVerifyDrillIsLiveRestore, false);
  assert.equal(rescueComp.truthCeilings.backupActivationAuthorityPendingOnly, true);
  assert.equal(rescueComp.truthCeilings.auditCommandReceiptsAreAuditEvents, false);
  assert.equal(rescueComp.truthCeilings.auditHashIsEncryption, false);
  assert.equal(rescueComp.truthCeilings.manualAiHiddenProviderExecution, false);
  assert.equal(rescueComp.truthCeilings.releaseReadinessIsAuthorization, false);
  assert.equal(rescueComp.truthCeilings.releaseAuthorizationIsDeployment, false);
  assert.equal(rescueComp.truthCeilings.classification, 'SHARED_ACTION_HOME_RESIDUAL__D13_OR_SHARED_CONVERGENCE');

  console.log('✓ 4.4 W05 Rescue Composition initializes all 8 surfaces with sound truth ceilings and provider bindings');
}

console.log('\n[D11 TEST] All W05 Provider + Product Integration tests passed successfully (100%).\n');
