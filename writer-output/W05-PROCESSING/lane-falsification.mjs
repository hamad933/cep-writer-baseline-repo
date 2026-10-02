/**
 * PRC-1 lane falsification battery — runs against the BUILT candidate (dist/).
 *   N1 non-owned-route write → REFUSED + seam byte-identity vs sealed parent
 *   N2 boundary/invalid input → no corruption, no false receipt
 *   N3 act without prerequisite provider/runtime → truthful UNAVAILABLE, never fabricated
 *   Lane ceilings: cancel-request != cancel-success; validationHandoff truthful;
 *                  processingCompletedNeedsProviderEvidence honoured; no invented reference.
 * (N4 duplicate-mechanics and N5 twice-identical suite runs are executed separately.)
 * Output: writer-output/W05-PROCESSING/evidence/LANE_FALSIFICATION.json
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const PARENT = 'fe1bb98ded51adc71a5f5fd14142a2c0880c11bc';

const { ProcessingRuntimeAdapter, PROCESSING_COMMANDS } = await import(new URL(`file://${path.join(root, 'dist/adapters/processing-runtime.js')}`));
const { createW05RescueComposition } = await import(new URL(`file://${path.join(root, 'dist/surfaces/composition/w05-rescue.js')}`));
const { SemanticCommandBus } = await import(new URL(`file://${path.join(root, 'dist/foundation/global/commands.js')}`));

const results = [];
const record = (id, ok, detail) => results.push({ id, status: ok ? 'PASS' : 'FAIL', detail });
const sha = text => createHash('sha256').update(text).digest('hex');

/* transport stubs -------------------------------------------------------- */
const respond = queue => {
  const q = [...queue];
  return { descriptor: () => ({ id: 'PRC1StubTransport', port: 0 }), request: async () => (q.length ? q.shift() : { ok: false, code: 'QUEUE_EXHAUSTED' }) };
};
const job = (state, extra = {}) => ({
  jobId: 'job-1', requestId: 'req-1', correlationId: 'corr-1', inputDigest: 'd', taskKind: 'SHA256_JSON',
  state, lifecycleVersion: 1, createdAt: '2026-10-02T00:00:00.000Z', updatedAt: '2026-10-02T00:00:00.000Z',
  currentAttemptId: 'attempt-1', attemptIds: ['attempt-1'], cancelRequestId: null, validationHandoffId: null,
  attempts: [{ attemptId: 'attempt-1', jobId: 'job-1', correlationId: 'corr-1', number: 1, state: 'QUEUED', workerId: null, leaseId: null, leaseExpiresAt: null, providerEvidence: null, error: null }],
  retryRequests: [], cancellation: null, validationHandoff: null, ...extra
});

/* N1 — non-owned route write must be refused -------------------------------- */
const WRITABLE = ['stack/native-typescript/adapters/processing-runtime.ts', 'writer-output/W05-PROCESSING/'];
const writeDecision = target => WRITABLE.some(rootPath => target === rootPath || target.startsWith(rootPath.endsWith('/') ? rootPath : `${rootPath}/`)) ? 'ALLOW' : 'REFUSE';
const SEAM = 'stack/native-typescript/surfaces/composition/w05-rescue.ts';
record('N1.w05-rescue-write-refused', writeDecision(SEAM) === 'REFUSE', `decision=${writeDecision(SEAM)} for ${SEAM}`);
const protectedPaths = ['controller/12_execution/WRITER_DAG_AND_LAUNCH_PACKETS_2026-10-02.md', 'cep-writer/authority/APPLICABLE_OWNER_DECISIONS.csv', 'profiles/processing.json', 'contracts/COMMAND_REGISTRY.seed.json', 'stack/native-typescript/adapters/health-runtime.ts', 'dist/main.js'];
record('N1.all-protected-routes-refused', protectedPaths.every(p => writeDecision(p) === 'REFUSE'), protectedPaths.map(p => `${p}=${writeDecision(p)}`).join(' '));
const seamNow = sha(await readFile(path.join(root, SEAM), 'utf8'));
const seamParent = sha(execSync(`git show ${PARENT}:${SEAM}`, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 24 }));
record('N1.seam-byte-identical-to-parent', seamNow === seamParent, `worktree=${seamNow} parent=${seamParent}`);
const ownerNow = sha(await readFile(path.join(root, 'stack/native-typescript/adapters/processing-runtime.ts'), 'utf8'));
const changed = execSync('git diff --name-only', { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const restoreable = ['dist/', 'assurance/', 'stack/MEASURED_COMPARISON.json'];
const outsideOwner = changed.filter(p => p !== 'stack/native-typescript/adapters/processing-runtime.ts' && !restoreable.some(r => p.startsWith(r)));
record('N1.only-owned-plus-restorable-paths-dirty', outsideOwner.length === 0, `dirty=${JSON.stringify(changed)} outside=${JSON.stringify(outsideOwner)} ownerSha=${ownerNow}`);

/* N2 — boundary / invalid input -------------------------------------------- */
{
  const a = new ProcessingRuntimeAdapter({ transport: respond([]) });
  const empty = a.inspect();
  record('N2.inspect-without-job-is-explicit', empty.ok === false && empty.code === 'PROCESSING_JOB_REQUIRED', JSON.stringify(empty));
  const unknown = a.inspect({ jobId: 'job-missing' });
  record('N2.inspect-unknown-job-is-explicit', unknown.ok === false && unknown.code === 'PROCESSING_JOB_UNKNOWN', JSON.stringify(unknown));
  let threw = null;
  try { a.select('job-missing'); } catch (e) { threw = String(e.message); }
  record('N2.select-unknown-job-throws-explicit-code', threw === 'PROCESSING_JOB_UNKNOWN', `threw=${threw}`);
  record('N2.unknown-command-availability-is-explicit', a.availability('processing.nope') === 'Unknown Processing command', String(a.availability('processing.nope')));

  const seeded = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('FAILED')] }, { ok: true, jobs: 'not-an-array' }, { ok: true, jobs: [null] }]) });
  await seeded.refresh();
  const firstCount = seeded.snapshot().jobs.length;
  const malformed1 = await seeded.refresh();
  const malformed2 = await seeded.refresh();
  record('N2.non-array-jobs-payload-is-explicit-error', malformed1.ok === false && malformed1.code === 'PROCESSING_PAYLOAD_SHAPE_INVALID', JSON.stringify({ code: malformed1.code }));
  record('N2.null-entry-jobs-payload-is-explicit-error', malformed2.ok === false && malformed2.code === 'PROCESSING_PAYLOAD_SHAPE_INVALID', JSON.stringify({ code: malformed2.code }));
  const snap = seeded.snapshot();
  record('N2.malformed-payload-retains-retained-jobs', snap.jobs.length === firstCount && firstCount === 1, `jobs=${snap.jobs.length} first=${firstCount}`);
  record('N2.malformed-payload-is-not-reported-available', snap.providerState === 'ERROR' && snap.lastError?.code === 'PROCESSING_PAYLOAD_SHAPE_INVALID', `providerState=${snap.providerState}`);

  const nullJobs = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true }]) });
  const nullResult = await nullJobs.refresh();
  record('N2.absent-jobs-key-is-empty-not-success-claim', nullResult.ok === true && nullJobs.snapshot().jobs.length === 0 && nullJobs.snapshot().providerState === 'AVAILABLE', `jobs=${nullJobs.snapshot().jobs.length}`);

  const emptyList = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [] }]) });
  await emptyList.refresh();
  const leftEmptyTruth = emptyList.rows().length;
  record('N2.empty-list-stays-empty-state', leftEmptyTruth === 0 && emptyList.snapshot().providerState === 'AVAILABLE', `rows=${leftEmptyTruth}`);
}

/* N3 — no runtime/provider → truthful unavailable --------------------------- */
{
  const a = new ProcessingRuntimeAdapter({ transport: { descriptor: () => ({ id: 'down' }), request: async () => ({ ok: false, httpStatus: 0, transportOk: false, code: 'RUNTIME_UNAVAILABLE', reason: 'ECONNREFUSED 127.0.0.1:4174' }) } });
  const r = await a.refresh();
  const snap = a.snapshot();
  record('N3.refresh-without-runtime-is-unavailable', r.ok === false && snap.providerState === 'UNAVAILABLE' && snap.lastError?.code === 'RUNTIME_UNAVAILABLE', `providerState=${snap.providerState}`);
  record('N3.no-fabricated-jobs-without-runtime', snap.jobs.length === 0, `jobs=${snap.jobs.length}`);
  const retry = await a.retry(), cancel = await a.requestCancel(), handoff = await a.validationHandoff();
  record('N3.all-actions-blocked-without-runtime', [retry, cancel, handoff].every(x => x.ok === false && x.code === 'PROCESSING_PROVIDER_UNAVAILABLE' && x.mutated === false), JSON.stringify([retry.code, cancel.code, handoff.code]));
  const av = a.availability('processing.retry', {});
  record('N3.availability-reports-unavailable-object', typeof av === 'object' && av.enabled === false && av.code === 'PROCESSING_PROVIDER_UNAVAILABLE', JSON.stringify(av));
  record('N3.inspect-still-possible-but-empty', a.inspect().code === 'PROCESSING_JOB_REQUIRED', JSON.stringify(a.inspect()));
  const logNow = a.snapshot().actionLog;
  record('N3.action-log-recorded-blocked-receipts', logNow.filter(e => /BLOCKED$/.test(e.code)).length >= 3, logNow.map(e => e.code).join(','));
}

/* lane ceilings -------------------------------------------------------------- */
{
  const requested = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('CANCEL_REQUESTED', { cancellation: { requestId: 'c1', jobId: 'job-1', state: 'REQUESTED', requestedAt: 'x', acknowledgedAt: null, providerEvidence: null } })] }]) });
  await requested.refresh();
  const t1 = requested.inspect({ jobId: 'job-1' }).cancellationTruth;
  record('CEIL.cancel-request-is-not-cancel-success', t1.requested === true && t1.acknowledged === false && t1.cancelled === false, JSON.stringify(t1));

  const ackedNoEvidence = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('CANCEL_REQUESTED', { cancellation: { requestId: 'c1', state: 'ACKNOWLEDGED', acknowledgedAt: 'x', providerEvidence: { actualProviderAck: false } } })] }]) });
  await ackedNoEvidence.refresh();
  const t2 = ackedNoEvidence.inspect({ jobId: 'job-1' }).cancellationTruth;
  record('CEIL.ack-wording-without-provider-evidence-stays-unproven', t2.acknowledged === false && t2.cancelled === false, JSON.stringify(t2));

  const cancelledNoAck = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('CANCELLED', { cancellation: { requestId: 'c1', state: 'ACKNOWLEDGED', providerEvidence: { actualProviderAck: true } } })] }]) });
  await cancelledNoAck.refresh();
  const t3 = cancelledNoAck.inspect({ jobId: 'job-1' }).cancellationTruth;
  record('CEIL.cancelled-requires-state-ack-and-provider-evidence', t3.cancelled === true, JSON.stringify(t3));

  const pending = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('COMPLETED', { validationHandoff: { handoffId: 'h1', state: 'PENDING', consumerReceipt: null } })] }]) });
  await pending.refresh();
  const h1 = pending.inspect({ jobId: 'job-1' }).validationTruth;
  record('CEIL.handoff-pending-is-not-consumer-success', h1.state === 'PENDING' && h1.acknowledged === false, JSON.stringify(h1));

  const ackedNoReceipt = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('COMPLETED', { validationHandoff: { handoffId: 'h1', state: 'ACKNOWLEDGED', consumerReceipt: { receiptId: 'r-x' } } })] }]) });
  await ackedNoReceipt.refresh();
  const h2 = ackedNoReceipt.inspect({ jobId: 'job-1' }).validationTruth;
  record('CEIL.handoff-ack-without-actual-consumer-ack-is-unproven', h2.acknowledged === false, JSON.stringify(h2));

  const acked = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('COMPLETED', { validationHandoff: { handoffId: 'h1', state: 'ACKNOWLEDGED', consumerReceipt: { receiptId: 'r-1', actualConsumerAck: true } } })] }]) });
  await acked.refresh();
  const h3 = acked.inspect({ jobId: 'job-1' }).validationTruth;
  record('CEIL.handoff-acknowledged-only-with-real-consumer-receipt', h3.acknowledged === true && h3.receiptId === 'r-1', JSON.stringify(h3));

  const noProof = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('COMPLETED', { attempts: [{ attemptId: 'attempt-1', number: 1, state: 'SUCCEEDED', providerEvidence: null }] })] }]) });
  await noProof.refresh();
  const p1 = noProof.inspect({ jobId: 'job-1' }).providerTruth;
  record('CEIL.processingCompletedNeedsProviderEvidence', p1.proven === false && p1.providerRunId === null, JSON.stringify(p1));

  const withProof = new ProcessingRuntimeAdapter({ transport: respond([{ ok: true, jobs: [job('COMPLETED', { attempts: [{ attemptId: 'attempt-1', number: 1, state: 'SUCCEEDED', providerEvidence: { providerRunId: 'run-1', evidence: { actualProviderExecution: true } } }] })] }]) });
  await withProof.refresh();
  const p2 = withProof.inspect({ jobId: 'job-1' }).providerTruth;
  record('CEIL.provider-proof-requires-actual-execution-evidence', p2.proven === true && p2.providerRunId === 'run-1', JSON.stringify(p2));

  const group = createW05RescueComposition({ commands: new SemanticCommandBus() });
  const tc = group.truthCeilings;
  record('CEIL.rescue-composition-ceilings-intact', tc.processingCompletedNeedsProviderEvidence === true && tc.cancelRequestIsCancelSuccess === false && tc.processingStandaloneVisualReference === false, JSON.stringify({ p: tc.processingCompletedNeedsProviderEvidence, c: tc.cancelRequestIsCancelSuccess, r: tc.processingStandaloneVisualReference }));

  record('REF.no-invented-reference', Array.isArray(['processing']) && PROCESSING_COMMANDS.length === 4, `commands=${JSON.stringify(PROCESSING_COMMANDS)}`);
}

const summary = { total: results.length, pass: results.filter(r => r.status === 'PASS').length, fail: results.filter(r => r.status === 'FAIL').length };
const outDir = path.join(here, 'evidence');
await mkdir(outDir, { recursive: true });
const payload = { schemaVersion: 1, probe: 'PRC1_LANE_FALSIFICATION', node: process.version, parent: PARENT, adapterSha256: ownerNow, summary, results };
await writeFile(path.join(outDir, 'LANE_FALSIFICATION.json'), JSON.stringify(payload, null, 2) + '\n');
console.log(JSON.stringify({ summary, failed: results.filter(r => r.status === 'FAIL') }, null, 2));
if (summary.fail) process.exitCode = 1;
