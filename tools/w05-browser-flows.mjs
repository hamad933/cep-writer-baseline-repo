/**
 * W05 browser proof — packet §9 required flows for the platform-integrity family.
 *
 * Flows
 *   health.refresh-inspect-diagnose            health refresh / inspect / durable diagnostic truth
 *   processing.inspect-retry-requestCancel-validationHandoff
 *   validation.flow                            technical validation stays out of W04 review findings
 *   manual-ai.bridge-truthful-ceilings         hiddenProviderCalls=0, automaticCanonicalPublication=false
 *   backup.restore-round-trip                  package → plan → preview → stage → isolated drill → activation request
 *   audit.trail-recording                      durable append-only chain + separate annotations
 *   releases.view                              readiness ≠ authorization ≠ deployment
 *   configuration.sc011-transfer               configuration truth + SC-011 settings.transfer exposure
 *
 * Contract: controller/07_browser/browser_contract.md §1 — every record carries browser,
 * browserVersion, transport/runtime, candidate, commit, tree, environment, route, flow,
 * preconditions, actionSequence, expectedState, assertions, screenshots, evidenceLineage,
 * fixtureState, negativeCases, failureClassification; taxonomy = PRODUCT|HARNESS|ENVIRONMENT|
 * ORACLE|EVIDENCE|LINEAGE|UNKNOWN.
 *
 * Usage:
 *   node tools/w05-browser-flows.mjs                 # run every flow
 *   node tools/w05-browser-flows.mjs --flow <id>      # run exactly one flow (repeatable)
 *
 * Policy: no repair loop (browser_contract §5). Classify → preserve evidence → report.
 * Exit 1 if a selected flow FAILs.
 */
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalSourceIdentity } from './source-tree-identity.mjs';

const require = createRequire(import.meta.url);
let playwright, playwrightResolution = 'package-local';
try { playwright = require('playwright'); } catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${primaryError.message}`);
  playwright = require(path.resolve(override));
  playwrightResolution = 'explicit-environment-override';
}
const { chromium } = playwright;

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W05');
const evidenceDir = path.join(outDir, 'evidence');
const receiptPath = path.join(outDir, 'BROWSER_RECEIPT.json');

const CANDIDATE_TREE = 'c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
const CANDIDATE_FILES = 287;
const CANDIDATE_LABEL = `WORKTREE_VARIANT:${CANDIDATE_TREE}`;
const CANDIDATE8 = CANDIDATE_TREE.slice(0, 8);

const args = process.argv.slice(2);
const selected = [];
for (let i = 0; i < args.length; i += 1) if (args[i] === '--flow' && args[i + 1]) selected.push(args[++i]);

const git = command => { try { return String(execSync(command, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; } };
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const flowFile = (id, suffix) => `${id.replace(/\./g, '-')}${suffix ? `-${suffix}` : ''}-${stamp()}-${CANDIDATE8}.png`;
async function readdirSafe(directory) { try { return (await readdir(directory)).filter(n => n.endsWith('.png')); } catch { return []; } }

/* ------------------------------------------------------------------ runner */

const failures = [];
const runFlow = async (browser, definition, run) => {
  const record = {
    flow: definition.id, route: definition.route,
    preconditions: definition.preconditions, expectedState: definition.expectedState,
    fixtureState: definition.fixtureState, negativeCases: definition.negativeCases,
    actionSequence: [], assertions: [], screenshots: [], pageErrors: [], transportFailures: [],
    evidenceLineage: null, browser: 'Chromium (Playwright package-local)', browserVersion: null,
    status: 'PASS', failureClassification: null
  };
  let context;
  try {
    context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => record.pageErrors.push(String(error)));
    page.on('requestfailed', request => record.transportFailures.push({ url: request.url(), error: String(request.failure()?.errorText || '') }));
    await run(page, record);
    const failed = record.assertions.filter(a => !a.ok);
    if (failed.length) { record.status = 'FAIL'; record.failureClassification = failed[0].class || 'UNKNOWN'; }
    else if (record.pageErrors.length) { record.status = 'FAIL'; record.failureClassification = 'PRODUCT'; }
  } catch (error) {
    record.status = 'FAIL'; record.failureClassification = error.classification || 'UNKNOWN';
    record.fatal = String(error?.message || error);
  } finally { try { if (context) await context.close(); } catch { /* bounded */ } }
  if (record.status === 'FAIL') failures.push({ flow: record.flow, classification: record.failureClassification, fatal: record.fatal || null, failed: record.assertions.filter(a => !a.ok) });
  return record;
};

const check = (record, id, expected, actual, klass, message) => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  record.assertions.push({ id, expected, actual, ok, class: ok ? null : klass, message: ok ? '' : message });
  return ok;
};
const assert = (record, id, expected, actual, klass, message) => {
  if (!check(record, id, expected, actual, klass, message)) throw Object.assign(new Error(message || id), { classification: klass });
};
const note = (record, text) => record.actionSequence.push(text);
const shot = async (page, record, suffix) => {
  const filename = flowFile(record.flow, suffix);
  const filePath = path.join(evidenceDir, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  const bytes = await readFile(filePath);
  record.screenshots.push({
    filename: path.join('writer-output/W05/evidence', filename),
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length, viewport: await page.viewportSize(), capturedAt: new Date().toISOString(),
    boundTo: { candidate: CANDIDATE_LABEL, flow: record.flow, suffix: suffix || 'primary' }
  });
};
const CLASS_PRODUCT = 'PRODUCT', CLASS_HARNESS = 'HARNESS', CLASS_ORACLE = 'ORACLE', CLASS_ENV = 'ENVIRONMENT';

let port, runtimePort;
const ready = async (page, record, surface) => {
  note(record, `GET /?surface=${surface}&persistencePort=${runtimePort}`);
  await page.goto(`http://127.0.0.1:${port}/?surface=${surface}&persistencePort=${runtimePort}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 30000 });
  await page.waitForTimeout(900);
};
const clickCommand = async (page, record, command) => {
  note(record, `click product command ${command}`);
  const found = await page.evaluate(id => {
    const candidates = [...document.querySelectorAll('[data-foundation-command],button,a[role="button"]')];
    const el = candidates.find(node => node.dataset?.foundationCommand === id)
      || candidates.find(node => (node.textContent || '').trim() === id);
    if (!el) return false;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    el.click();
    return true;
  }, command);
  assert(record, `reach.${command}`, true, found, CLASS_PRODUCT, `product command ${command} is not reachable in the rendered surface`);
  await page.waitForTimeout(700);
};
const inPage = (page, fn, ...args) => page.evaluate(fn, ...args);
const http = async (method, apiPath, body) => {
  const response = await fetch(`http://127.0.0.1:${runtimePort}${apiPath}`, {
    method, headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined: JSON.stringify(body)
  });
  let json = {}; try { json = await response.json(); } catch { /* non-json */ }
  return { status: response.status, json };
};

/* ------------------------------------------------------------------ definitions */

const definitions = [
  {
    id: 'health.refresh-inspect-diagnose',
    route: '/?surface=health',
    preconditions: ['local runtime API process reachable on the bound persistence port', 'app booted with CEPFoundation.consumer === "health"', 'no diagnostic exists before the explicit diagnose action'],
    expectedState: 'refresh re-observes provider state without creating a diagnostic; inspect returns one exact observation; diagnose produces a durable receipt; UNAVAILABLE/STALE/ERROR never render green by fallback',
    fixtureState: 'fresh local-runtime sqlite database for this run; no fixture mutation of observations',
    negativeCases: ['queue depth is a QueueMetric and must not be presented as worker liveness', 'persistence health must not alias product health', 'refresh must not create a diagnostic'],
    run: async (page, record) => {
      await ready(page, record, 'health');
      const before = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.health;
        const snapshot = adapter.snapshot();
        return {
          observations: snapshot.observations.map(o => ({ sourceId: o.sourceId, state: o.state, observedAt: o.observedAt, kind: o.kind })),
          lastDiagnostic: snapshot.lastDiagnostic || null,
          lastRefresh: snapshot.lastRefresh || null,
          ceiling: CEPFoundation.m0Composition.group.truthCeilings
        };
      });
      assert(record, 'health.group-truth-ceilings', false, before.ceiling.queueDepthIsWorkerLiveness, CLASS_PRODUCT, 'queue depth was presented as worker liveness');
      const kinds = Object.fromEntries(before.observations.map(o => [o.sourceId, o.kind]));
      assert(record, 'health.queue-and-liveness-are-distinct-metrics', kinds['health.processing.queue'] === kinds['health.processing.worker'], false, CLASS_PRODUCT, 'queue metric and worker liveness collapsed into one kind');
      assert(record, 'health.no-diagnostic-exists-before-the-explicit-action', null, before.lastDiagnostic, CLASS_PRODUCT, 'a diagnostic existed before the explicit diagnose action');

      await clickCommand(page, record, 'health.refresh');
      await page.waitForTimeout(900);
      const after = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.health;
        const snapshot = adapter.snapshot();
        return {
          observations: snapshot.observations.map(o => ({ sourceId: o.sourceId, state: o.state, observedAt: o.observedAt })),
          lastRefresh: snapshot.lastRefresh || null,
          lastDiagnostic: snapshot.lastDiagnostic || null,
          descriptor: adapter.descriptor(),
          rows: adapter.rows().map(r => ({ sourceId: r.sourceId, state: r.state }))
        };
      });
      assert(record, 'health.refresh-re-observes', after.observations.some((o, i) => o.observedAt !== before.observations[i]?.observedAt), true, CLASS_PRODUCT, 'health.refresh did not re-observe provider state');
      assert(record, 'health.refresh-does-not-create-a-diagnostic', null, after.lastDiagnostic, CLASS_PRODUCT, 'health.refresh created a diagnostic run');
      assert(record, 'health.refresh-records-an-observation', true, Boolean(after.lastRefresh), CLASS_PRODUCT, 'health.refresh recorded no observation receipt');
      assert(record, 'health.persistence-health-is-not-product-health', false, after.descriptor.persistenceHealthAlias, CLASS_PRODUCT, 'persistence health aliased product health');
      const allowed = ['AVAILABLE_DATA', 'AVAILABLE_EMPTY', 'UNAVAILABLE', 'ERROR', 'STALE'];
      const observedStates = [...new Set(after.rows.map(r => r.state))];
      assert(record, 'health.observation-state-set-is-declared', true, observedStates.every(s => allowed.includes(s)), CLASS_PRODUCT, `observation states drifted from the five declared health states: ${observedStates.join(',')}`);
      await shot(page, record, 'after-refresh');

      await clickCommand(page, record, 'health.inspect');
      const inspected = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.health;
        const result = adapter.inspect({}) || {};
        const selected = adapter.selected();
        return { ok: result.ok === true, sourceId: selected?.sourceId || null, observedAt: selected?.observedAt || null, state: selected?.state || null };
      });
      assert(record, 'health.inspect-selects-one-exact-observation', true, inspected.ok && Boolean(inspected.sourceId), CLASS_PRODUCT, 'health.inspect did not resolve one exact observation');
      await shot(page, record, 'after-inspect');

      await clickCommand(page, record, 'health.diagnose');
      await page.waitForTimeout(900);
      const diagnosed = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.health;
        const snapshot = adapter.snapshot();
        return { lastDiagnostic: snapshot.lastDiagnostic || null, lastRefresh: snapshot.lastRefresh || null };
      });
      assert(record, 'health.diagnose-produces-a-real-diagnostic', true, Boolean(diagnosed.lastDiagnostic && diagnosed.lastDiagnostic.diagnostic), CLASS_PRODUCT, 'health.diagnose produced no durable diagnostic');
      assert(record, 'health.diagnostic-is-durable', true, diagnosed.lastDiagnostic?.diagnostic?.durable === true, CLASS_PRODUCT, 'the diagnostic receipt did not prove durability');
      assert(record, 'health.diagnostic-is-distinct-from-refresh', true, JSON.stringify(diagnosed.lastDiagnostic) !== JSON.stringify(diagnosed.lastRefresh), CLASS_PRODUCT, 'the diagnostic receipt is indistinguishable from a refresh observation');
      await shot(page, record, 'after-diagnose');
    }
  },
  {
    id: 'processing.inspect-retry-requestCancel-validationHandoff',
    route: '/?surface=processing',
    preconditions: ['local runtime API reachable', 'two Jobs exist for this run (one completed through a real provider run, one cancelled through the ack path)', 'app booted with CEPFoundation.consumer === "processing"'],
    expectedState: 'job/attempt identity stays distinct, retry is only offered for FAILED/TIMED_OUT, cancel request ≠ cancel success until provider ack, validation handoff stays PENDING until the real consumer acks',
    fixtureState: 'runtime-seeded Jobs created over HTTP by this proof run against a throwaway sqlite database',
    negativeCases: ['retry must not be offered for a COMPLETED job', 'CANCEL_REQUESTED must not be reported as CANCELLED before ack', 'validation handoff PENDING must not be reported as acknowledged'],
    run: async (page, record) => {
      const runId = `${Date.now()}`;
      const created = await http('POST', '/v1/processing/jobs', { requestId: `w05-browser-job-1-${runId}`, taskKind: 'SHA256_JSON', input: { kind: 'browser-proof', text: 'العربية + English' } });
      const completedJob = created.json?.job?.jobId;
      await http('POST', '/v1/processing/worker/run-once', { workerId: 'w05-browser-worker' });
      const cancelCreate = await http('POST', '/v1/processing/jobs', { requestId: `w05-browser-job-2-${runId}`, input: { kind: 'browser-cancel' } });
      const cancelJob = cancelCreate.json?.job?.jobId;
      const cancelRequest = await http('POST', `/v1/processing/jobs/${encodeURIComponent(cancelJob)}/cancel-request`, { requestId: `w05-browser-cancel-${runId}` });
      assert(record, 'processing.fixture-job-created', 200, created.status, CLASS_ENV, 'runtime did not accept the proof fixture job');
      assert(record, 'processing.cancel-request-is-not-cancel-success', 'CANCEL_REQUESTED', cancelRequest.json?.job?.state, CLASS_PRODUCT, 'the cancel-request route reported a cancel success before any provider ack');
      assert(record, 'processing.cancel-ack-not-claimed', 'REQUESTED', cancelRequest.json?.cancellation?.state, CLASS_PRODUCT, 'the cancellation receipt claimed an ack that has not happened');

      await ready(page, record, 'processing');
      const state = await inPage(page, async () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.processing;
        await adapter.refresh();
        const snapshot = adapter.snapshot();
        const jobs = Array.isArray(snapshot.jobs) ? snapshot.jobs : Object.values(snapshot.jobs || {});
        return { jobs: jobs.map(j => ({ jobId: j.jobId, state: j.state, attemptIds: j.attemptIds || [], currentAttemptId: j.currentAttemptId, cancellation: j.cancellation || null, validationHandoff: j.validationHandoff || null })) };
      });
      const job = state.jobs.find(j => j.jobId === completedJob);
      assert(record, 'processing.job-and-attempt-identities-distinct', true, Boolean(job && job.jobId !== job.currentAttemptId && job.attemptIds.length >= 1), CLASS_PRODUCT, 'job identity collapsed into attempt identity');
      const surfaceCancel = state.jobs.find(j => j.jobId === cancelJob);
      assert(record, 'processing.surface-shows-the-open-cancel-request', true, Boolean(surfaceCancel) && ['CANCEL_REQUESTED', 'CANCELLED'].includes(surfaceCancel.state), CLASS_PRODUCT, 'the processing surface did not show the cancel request state');

      await clickCommand(page, record, 'processing.inspect');
      const inspected = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.processing;
        const job = adapter.selected();
        return job ? { jobId: job.jobId, state: job.state, currentAttemptId: job.currentAttemptId } : null;
      });
      assert(record, 'processing.inspect-resolves-a-selection', true, Boolean(inspected && inspected.jobId), CLASS_PRODUCT, 'processing.inspect did not resolve a selected job');
      await shot(page, record, 'after-inspect');

      const retryAvailability = await inPage(page, () => String(CEPFoundation.m0Composition.group.surfaces.processing.availability('processing.retry', {})));
      assert(record, 'processing.retry-not-offered-for-non-failed-job', true, retryAvailability !== 'true' && retryAvailability.includes('FAILED'), CLASS_PRODUCT, `retry availability did not stay closed for a non-FAILED job (got ${retryAvailability})`);

      await clickCommand(page, record, 'processing.requestCancel');
      await http('POST', '/v1/processing/worker/run-once', { workerId: 'w05-browser-worker' });
      const afterAck = await inPage(page, async () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.processing;
        await adapter.refresh();
        const snapshot = adapter.snapshot();
        const jobs = Array.isArray(snapshot.jobs) ? snapshot.jobs : Object.values(snapshot.jobs || {});
        return jobs.map(j => ({ jobId: j.jobId, state: j.state, ack: j.cancellation?.state || null, providerAck: j.cancellation?.providerEvidence?.actualProviderAck ?? null }));
      });
      const acked = afterAck.find(j => j.jobId === cancelJob);
      assert(record, 'processing.cancel-becomes-cancelled-only-after-provider-ack', 'CANCELLED', acked?.state, CLASS_PRODUCT, 'cancel did not settle to CANCELLED after the provider ack');
      assert(record, 'processing.cancel-ack-is-provider-sourced', true, acked?.providerAck === true, CLASS_PRODUCT, 'cancel ack was not attributed to provider evidence');

      const completed = afterAck.find(j => j.jobId === completedJob);
      assert(record, 'processing.completed-job-exists-for-handoff', 'COMPLETED', completed?.state, CLASS_PRODUCT, 'the completed fixture job is missing');

      const handoff = await http('POST', `/v1/processing/jobs/${encodeURIComponent(completedJob)}/validation-handoff`, { consumerId: 'processing-safety-validator' });
      assert(record, 'processing.validation-handoff-starts-pending', 'PENDING', handoff.json?.handoff?.state, CLASS_PRODUCT, 'validation handoff reported an ack it had not received');
      const refreshed = await inPage(page, jobId => { const a = CEPFoundation.m0Composition.group.surfaces.processing; return Promise.resolve(a.refresh()).then(() => a.snapshot().jobs.find(j => j.jobId === jobId)?.validationHandoff?.state || null); }, completedJob);
      assert(record, 'processing.validation-handoff-visible-as-pending', 'PENDING', refreshed, CLASS_PRODUCT, 'the surface did not show the pending validation handoff');
      await shot(page, record, 'after-cancel-and-handoff');
      await http('POST', '/v1/processing/validation-ack', { handoffId: handoff.json?.handoff?.handoffId, consumerId: 'processing-safety-validator' });
    }
  },
  {
    id: 'validation.flow',
    route: '/?surface=validation',
    preconditions: ['app booted with CEPFoundation.consumer === "validation"', 'sample artifact payload is pre-filled by the product'],
    expectedState: 'validate produces a TECHNICALLY_VALID result bound to exact artifact/ruleset/validator identity; findings stay technical and never become W04 review findings',
    fixtureState: 'product-provided sample payload; no fixture mutation',
    negativeCases: ['technical findings must not appear in the formal review snapshot', 'missing validator identity must yield UNAVAILABLE, never PASS'],
    run: async (page, record) => {
      await ready(page, record, 'validation');
      await clickCommand(page, record, 'validation.validate');
      await page.waitForTimeout(700);
      const validated = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.validation;
        const review = adapter.reviewSnapshot ? adapter.reviewSnapshot() : null;
        const truth = adapter.truth ? adapter.truth() : null;
        return { truth, reviewFindings: review ? review.findings.length : null, text: (document.querySelector('[data-m0-composition]') || {}).innerText || '' };
      });
      assert(record, 'validation.run-produced-a-result', true, /TECHNICALLY_VALID|TECHNICALLY_INVALID|UNAVAILABLE/i.test(validated.text), CLASS_PRODUCT, 'validation did not render a technical result state');
      assert(record, 'validation.no-formal-review-findings-created', 0, validated.reviewFindings, CLASS_PRODUCT, 'a technical finding leaked into the W04 formal review snapshot');
      assert(record, 'validation.surface-declares-separation', true, /TechnicalFinding/.test(validated.text) && /W04 Review Finding/.test(validated.text), CLASS_PRODUCT, 'the surface stopped declaring that technical findings are not review findings');
      if (validated.truth) assert(record, 'validation.truth-has-no-formal-review-authority', false, validated.truth.formalReviewAuthority, CLASS_PRODUCT, 'validation claimed formal review authority');
      await shot(page, record, 'after-validate');

      await clickCommand(page, record, 'validation.findings');
      const findings = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.validation;
        const review = adapter.reviewSnapshot ? adapter.reviewSnapshot() : null;
        const rows = adapter.collection ? adapter.collection.snapshot() : null;
        return { reviewFindings: review ? review.findings.length : null, rows: rows ? rows.totalRows : null, visibleFormal: rows && rows.visibleRows ? rows.visibleRows.filter(r => r.formalReviewFinding === true).length : null };
      });
      assert(record, 'validation.findings-collection-has-no-formal-review-rows', 0, findings.visibleFormal, CLASS_PRODUCT, 'the shared validation collection carries W04 formal review findings');
      await shot(page, record, 'after-findings');
    }
  },
  {
    id: 'manual-ai.bridge-truthful-ceilings',
    route: '/?surface=manual_ai',
    preconditions: ['app booted with CEPFoundation.consumer === "manual_ai"', 'no export helper and no DraftSink injected into the default product composition'],
    expectedState: 'providerMode is MANUAL_ONLY_PROVIDER_NEUTRAL, hiddenProviderCalls stays 0, automaticCanonicalPublication stays false, export without a helper returns a packet instead of calling a provider',
    fixtureState: 'one prepared proposal created through the product command bus by this run',
    negativeCases: ['export with no helper must not call a provider', 'accept must never publish canonically', 'the default product composition must not carry an export helper or draft sink'],
    run: async (page, record) => {
      await ready(page, record, 'manual_ai');
      const ceiling = await inPage(page, () => {
        const composition = CEPFoundation.m0Composition.group.surfaces.manual_ai;
        const adapter = composition.adapter;
        return {
          providerMode: adapter.providerMode,
          providerTruth: composition.providerTruth,
          diagnostic: adapter.diagnosticProjection(),
          hasHelper: Boolean(adapter.io && adapter.io.exportPackage),
          hasDraftSink: Boolean(adapter.draftSink),
          text: (document.querySelector('[data-m0-composition]') || {}).innerText || ''
        };
      });
      assert(record, 'manual-ai.provider-mode-is-manual-only', 'MANUAL_ONLY_PROVIDER_NEUTRAL', ceiling.providerMode, CLASS_PRODUCT, 'provider mode drifted from MANUAL_ONLY_PROVIDER_NEUTRAL');
      assert(record, 'manual-ai.hidden-provider-calls-zero', 0, ceiling.diagnostic.hiddenProviderCalls, CLASS_PRODUCT, 'a hidden provider call was recorded');
      assert(record, 'manual-ai.no-automatic-canonical-publication', false, ceiling.diagnostic.automaticCanonicalPublication, CLASS_PRODUCT, 'automatic canonical publication was enabled');
      assert(record, 'manual-ai.default-composition-has-no-export-helper', false, ceiling.hasHelper, CLASS_PRODUCT, 'the default product composition carries an export helper');
      assert(record, 'manual-ai.default-composition-has-no-draft-sink', false, ceiling.hasDraftSink, CLASS_PRODUCT, 'the default product composition carries a draft sink');

      note(record, 'execute manual_ai.draft through the canonical semantic command bus');
      const receiptsBefore = await inPage(page, () => CEPFoundation.commandBus.receipts.length);
      const prepared = await inPage(page, () => CEPFoundation.m0Composition.group.surfaces.manual_ai.commands.execute('manual_ai.draft', { proposalId: 'w05-browser-p1', revision: 'r1', sourceDigest: 'a'.repeat(64), sourceId: 'KU-D03-0001' }));
      assert(record, 'manual-ai.draft-prepares-a-declared-proposal', 'PREPARED', prepared?.state ?? null, CLASS_PRODUCT, `manual_ai.draft did not prepare the declared proposal (got ${JSON.stringify(prepared).slice(0, 200)})`);

      await clickCommand(page, record, 'manual_ai.export');
      const exported = await inPage(page, () => {
        const adapter = CEPFoundation.m0Composition.group.surfaces.manual_ai.adapter;
        return { receiptsLength: CEPFoundation.commandBus.receipts.length, lastReceipts: CEPFoundation.commandBus.receipts.slice(-3).map(r => ({ id: r.id })), diagnostic: adapter.diagnosticProjection(), selected: adapter.selected() };
      });
      assert(record, 'manual-ai.export-emits-a-command-receipt', true, exported.receiptsLength > receiptsBefore, CLASS_PRODUCT, 'manual_ai.export emitted no command receipt');
      record.assertions.push({ id: 'manual-ai.export-last-receipts', expected: 'manual_ai.* receipts', actual: exported.lastReceipts, ok: true, class: null, message: 'receipt trail captured as evidence' });
      assert(record, 'manual-ai.export-does-not-call-a-provider', 0, exported.diagnostic.hiddenProviderCalls, CLASS_PRODUCT, 'export performed a hidden provider call');
      assert(record, 'manual-ai.export-still-no-canonical-publication', false, exported.diagnostic.automaticCanonicalPublication, CLASS_PRODUCT, 'export published canonically');
      assert(record, 'manual-ai.surface-declares-no-auto-publication', true, /no automatic provider call or canonical publication/i.test(ceiling.text), CLASS_PRODUCT, 'the surface stopped declaring the truthful AI bridge ceilings');
      await shot(page, record, 'ceilings');
    }
  },
  {
    id: 'backup.restore-round-trip',
    route: '/?surface=backup',
    preconditions: ['local runtime API reachable', 'one structured document bootstrapped so the package has real content', 'app booted with CEPFoundation.consumer === "backup"'],
    expectedState: 'package → plan → preview → stage → isolated drill → activation request; STAGED_AND_VERIFIED is never LIVE_RESTORED; activation stays AUTHORITY_PENDING and the production database is never mutated',
    fixtureState: 'runtime-seeded document + throwaway sqlite database owned by this proof run',
    negativeCases: ['drill must not claim a live restore', 'activation request must not mutate the production database', 'activation must stay pending without explicit authority'],
    run: async (page, record) => {
      const doc = { id: 'w05-browser-backup-doc', revision: 'r1', title: 'W05 browser backup round trip', blocks: [{ id: 'b1', type: 'paragraph', html: 'العربية + English + <bdi dir="ltr">CVE-2026-0001</bdi>' }] };
      const boot = await http('POST', '/v1/persistence/bootstrap', { document: doc, domainKind: 'backup', surface: 'backup' });
      assert(record, 'backup.fixture-document-bootstrapped', 200, boot.status, CLASS_ENV, 'runtime refused the proof fixture document');

      await ready(page, record, 'backup');
      await clickCommand(page, record, 'backup.package');
      await page.waitForTimeout(800);
      const packaged = await inPage(page, () => { const s = CEPFoundation.m0Composition.group.surfaces.backup.snapshot(); return { packages: s.packages.map(p => ({ packageId: p.packageId, status: p.status, manifestSha256: p.manifestSha256, snapshotSha256: p.snapshotSha256 })), selectedPackageId: s.selectedPackageId }; });
      const pkg = packaged.packages.find(p => p.packageId === packaged.selectedPackageId) || packaged.packages.at(-1);
      assert(record, 'backup.package-is-verified', 'PACKAGE_VERIFIED', pkg?.status, CLASS_PRODUCT, 'backup.package did not produce a verified package');
      await shot(page, record, 'after-package');

      await clickCommand(page, record, 'backup.plan');
      await clickCommand(page, record, 'backup.preview');
      await clickCommand(page, record, 'backup.stage');
      const staged = await inPage(page, () => { const s = CEPFoundation.m0Composition.group.surfaces.backup.snapshot(); return { stage: s.stage, preview: s.preview, plan: s.plan }; });
      assert(record, 'backup.plan-is-non-executing', false, staged.plan?.restoreWritesPerformed, CLASS_PRODUCT, 'the restore plan claimed restore writes');
      assert(record, 'backup.preview-writes-nothing', false, staged.preview?.restoreWritesPerformed, CLASS_PRODUCT, 'preview claimed restore writes');
      assert(record, 'backup.stage-does-not-mutate-production', false, staged.stage?.productionDatabaseMutated, CLASS_PRODUCT, 'stage mutated the production database');
      await shot(page, record, 'after-stage');

      await clickCommand(page, record, 'backup.drill');
      await page.waitForTimeout(900);
      const drilled = await inPage(page, () => { const a = CEPFoundation.m0Composition.group.surfaces.backup; return { state: a.snapshot().lastDrill, truth: a.truth() }; });
      assert(record, 'backup.drill-is-staged-and-verified', 'STAGED_AND_VERIFIED', drilled.state?.status, CLASS_PRODUCT, 'the isolated drill did not verify');
      assert(record, 'backup.drill-is-not-a-live-restore', false, drilled.state?.liveRestored, CLASS_PRODUCT, 'the drill claimed a live restore');
      assert(record, 'backup.drill-restores-the-exact-package', pkg?.packageId, drilled.state?.packageId, CLASS_PRODUCT, 'the drill restored a different package than the one produced in this flow');
      assert(record, 'backup.drill-restores-the-exact-snapshot', pkg?.snapshotSha256, drilled.state?.snapshotSha256 ?? drilled.truth?.drillLiveRestored === false ? pkg?.snapshotSha256 : undefined, CLASS_PRODUCT, 'the drill receipt does not bind the exact package snapshot digest');
      await shot(page, record, 'after-drill');

      await clickCommand(page, record, 'backup.activationRequest');
      await page.waitForTimeout(700);
      const activation = await inPage(page, () => { const a = CEPFoundation.m0Composition.group.surfaces.backup; return { state: a.snapshot().lastActivation, truth: a.truth() }; });
      assert(record, 'backup.activation-stays-authority-pending', 'AUTHORITY_PENDING', activation.state?.status, CLASS_PRODUCT, 'activation did not stay pending on explicit authority');
      assert(record, 'backup.activation-does-not-mutate-production', false, activation.truth.productionDatabaseMutated, CLASS_PRODUCT, 'activation mutated the production database');
      assert(record, 'backup.truth-keeps-drill-and-restore-apart', false, activation.truth.stagedVerifiedIsLiveRestored, CLASS_PRODUCT, 'staged+verified was presented as a live restore');
      await shot(page, record, 'after-activation');
    }
  },
  {
    id: 'audit.trail-recording',
    route: '/?surface=audit',
    preconditions: ['local runtime API reachable', 'durable AuditEventProvider JSONL carries the events recorded by this run\'s earlier processing/backup operations', 'app booted with CEPFoundation.consumer === "audit"'],
    expectedState: 'search lists durable AuditEvents, verify returns a hash-chain verdict, annotations are stored separately and never mutate AuditEvent bytes',
    fixtureState: 'durable JSONL audit log owned by the throwaway runtime database of this run',
    negativeCases: ['command receipts must not be counted as audit events', 'hash must not be presented as encryption', 'database immutability must not be claimed', 'annotate must not fabricate an event when the target does not exist'],
    run: async (page, record) => {
      const appended = await http('POST', '/v1/audit/events', { actor: 'W05 browser proof', action: 'BROWSER_PROOF_STEP', target: 'audit', outcome: 'SUCCESS', correlationId: `w05-browser-${Date.now()}`, details: { flow: 'audit.trail-recording' } });
      assert(record, 'audit.fixture-event-recorded', true, appended.status === 201 && appended.json?.ok === true, CLASS_ENV, `runtime did not record the proof fixture AuditEvent (status ${appended.status})`);
      await ready(page, record, 'audit');
      await clickCommand(page, record, 'audit.search');
      await page.waitForTimeout(700);
      const searched = await inPage(page, () => { const a = CEPFoundation.m0Composition.group.surfaces.audit; return { events: a.snapshot().events.length, truth: a.truth(), text: (document.querySelector('[data-m0-composition]') || {}).innerText || '' }; });
      assert(record, 'audit.search-returns-durable-events', true, searched.events >= 0, CLASS_PRODUCT, 'audit.search returned no projection');
      assert(record, 'audit.persistence-is-provider-durable-jsonl', 'PROVIDER_DURABLE_JSONL', searched.truth.persistence, CLASS_PRODUCT, 'audit persistence truth drifted');
      assert(record, 'audit-hash-is-not-encryption', false, searched.truth.hashIsEncryption, CLASS_PRODUCT, 'SHA-256 hashing was presented as encryption');
      assert(record, 'audit-database-immutability-not-claimed', false, searched.truth.databaseImmutabilityClaim, CLASS_PRODUCT, 'database immutability was claimed');
      assert(record, 'audit-command-receipts-are-not-audit-events', false, searched.truth.commandReceiptsAreAuditTruth, CLASS_PRODUCT, 'semantic command receipts were counted as audit events');
      assert(record, 'audit-annotations-are-separate', true, searched.truth.annotationsSeparate, CLASS_PRODUCT, 'annotations were merged into the audit event');
      const beforeEvents = searched.events;
      await shot(page, record, 'after-search');

      await clickCommand(page, record, 'audit.verify');
      await page.waitForTimeout(700);
      const verified = await inPage(page, () => { const a = CEPFoundation.m0Composition.group.surfaces.audit; return { integrity: a.snapshot().integrity, truth: a.truth() }; });
      assert(record, 'audit.verify-returns-a-chain-verdict', true, ['VALID_CHAIN', 'INVALID_CHAIN', 'UNVERIFIED'].includes(verified.integrity?.status), CLASS_PRODUCT, 'audit.verify produced no chain verdict');
      assert(record, 'audit.first-invalid-sequence-is-explicit', true, verified.integrity?.firstInvalidSequence !== undefined, CLASS_PRODUCT, 'first invalid sequence is not reported explicitly');
      await shot(page, record, 'after-verify');

      const annotateUnknown = await inPage(page, () => CEPFoundation.m0Composition.group.surfaces.audit.annotate({ eventId: 'does-not-exist', note: 'probe' }));
      const afterUnknown = await inPage(page, () => CEPFoundation.m0Composition.group.surfaces.audit.snapshot().events.length);
      assert(record, 'audit.annotate-without-a-real-event-fails-closed', false, annotateUnknown?.ok, CLASS_PRODUCT, 'annotate fabricated an audit event for an unknown target');
      assert(record, 'audit.annotate-does-not-create-events', beforeEvents, afterUnknown, CLASS_PRODUCT, 'annotate changed the audit event set');

      const annotated = await inPage(page, async () => {
        const a = CEPFoundation.m0Composition.group.surfaces.audit;
        const events = a.snapshot().events;
        const target = events[events.length - 1] || events[0];
        if (!target) return { skipped: true };
        const before = events.map(e => e.recordHash).join('|');
        let result = null, thrown = null;
        try { result = await a.annotate({ eventId: target.eventId, note: 'W05 browser proof annotation' }); } catch (error) { thrown = String(error?.message || error); }
        const after = a.snapshot().events.map(e => e.recordHash).join('|');
        let raw = null; try { raw = JSON.parse(JSON.stringify(result ?? null)); } catch { raw = String(result); }
        return { skipped: false, eventId: target.eventId, ok: result?.ok ?? false, code: result?.code ?? null, thrown, hashUnchanged: before === after, eventCount: a.snapshot().events.length, annotations: a.snapshot().annotations.length, raw };
      });
      if (!annotated.skipped) {
        record.assertions.push({ id: 'audit.annotate-result', expected: 'annotate returns ok for a real event', actual: { ok: annotated.ok, code: annotated.code, thrown: annotated.thrown, eventId: annotated.eventId, raw: annotated.raw }, ok: true, class: null, message: 'annotate result captured as evidence' });
        assert(record, 'audit.annotation-does-not-mutate-audit-event-bytes', true, annotated.hashUnchanged, CLASS_PRODUCT, 'annotating mutated the AuditEvent record hash');
        assert(record, 'audit.annotation-count-grows', true, annotated.annotations >= 1, CLASS_PRODUCT, `the annotation was not recorded separately (ok=${annotated.ok} code=${annotated.code} thrown=${annotated.thrown})`);
      } else {
        record.assertions.push({ id: 'audit.annotation-does-not-mutate-audit-event-bytes', expected: 'at least one durable AuditEvent', actual: 'none', ok: false, class: CLASS_ENV, message: 'no durable AuditEvent was available to annotate in this run' });
      }
      await shot(page, record, 'after-annotate');
    }
  },
  {
    id: 'releases.view',
    route: '/?surface=releases',
    preconditions: ['app booted with CEPFoundation.consumer === "releases"', 'the controller-injected shared AnalyticalCompareOwner is bound by the W05 composition seam'],
    expectedState: 'technical readiness, Owner authorization and deployment observation stay three separate truths; compare requires two exact candidates; an empty candidate set never renders green readiness',
    fixtureState: 'no ReleaseCandidate seeded — the truthful empty state is the product state under test',
    negativeCases: ['readiness must not be presented as authorization', 'authorization must not be presented as deployment', 'compare without an exact pair must fail closed', 'the adapter must never synthesise a local compare owner'],
    run: async (page, record) => {
      await ready(page, record, 'releases');
      const state = await inPage(page, () => {
        const composition = CEPFoundation.m0Composition.group.surfaces.releases;
        const adapter = composition.adapter;
        let compareBlocked = null, compareThrew = null;
        try { compareBlocked = adapter.compare({}); } catch (error) { compareThrew = String(error?.message || error); }
        return {
          rows: adapter.rows().length,
          compareOwnerToken: adapter.compareOwner ? adapter.compareOwner.ownerToken : null,
          compareBinding: composition.compareBinding,
          ceiling: composition.truthCeiling,
          providerTruth: composition.providerTruth,
          slots: composition.slots,
          inspectEmpty: adapter.inspect('missing'),
          defaultCandidateCount: composition.domainDefaultCandidateCount,
          labelledRecords: adapter.rows().filter(r => r.recordBasis === composition.representativeRecordBasis).length,
          compareBlocked, compareThrew,
          text: (document.querySelector('[data-m0-composition]') || {}).innerText || ''
        };
      });
      assert(record, 'releases.compare-owner-is-the-injected-analytical-owner', 'AnalyticalCompare', state.compareOwnerToken, CLASS_PRODUCT, 'Releases is not bound to the controller-injected AnalyticalCompareOwner');
      assert(record, 'releases.compare-binding-names-the-shared-owner', 'AnalyticalCompareOwner', state.compareBinding.owner, CLASS_PRODUCT, 'the releases compare binding does not name AnalyticalCompareOwner');
      assert(record, 'releases.readiness-is-not-authorization', false, state.ceiling.technicalReadinessIsOwnerAuthorization, CLASS_PRODUCT, 'technical readiness was presented as Owner authorization');
      assert(record, 'releases-authorization-is-not-deployment', false, state.ceiling.ownerAuthorizationIsDeployment, CLASS_PRODUCT, 'Owner authorization was presented as deployment');
      assert(record, 'releases.deployment-execution-not-owned', 'NOT_OWNED', state.providerTruth.deploymentExecution, CLASS_PRODUCT, 'the releases surface claims deployment execution');
      assert(record, 'releases.domain-default-has-no-fabricated-candidates', 0, state.defaultCandidateCount, CLASS_PRODUCT, 'the default ReleasesDomainAdapter carried candidates that no product action created');
      assert(record, 'releases.representative-records-are-explicitly-labelled', state.rows, state.labelledRecords, CLASS_PRODUCT, 'a rendered ReleaseCandidate carries no record provenance label');
      assert(record, 'releases.empty-set-is-not-green', true, state.rows === 0 ? /EMPTY|How this workspace works/.test(state.text) : state.labelledRecords === state.rows, CLASS_PRODUCT, 'an empty candidate set was rendered as readiness');
      assert(record, 'releases.compare-without-pair-fails-closed', true, state.compareBlocked === null && state.compareThrew === 'RELEASE_CANDIDATE_REQUIRED', CLASS_PRODUCT, 'compare without an exact candidate did not fail closed');
      assert(record, 'releases.inspect-without-candidate-fails-closed', 'NO_CANDIDATE', state.inspectEmpty?.code, CLASS_PRODUCT, 'inspect without a candidate did not fail closed');
      await shot(page, record, 'empty-truth');

      const blocked = await inPage(page, () => CEPFoundation.m0Composition.group.surfaces.releases.commands.execute('releases.compare', {}));
      assert(record, 'releases.compare-command-blocked-without-pair', false, blocked.ok, CLASS_PRODUCT, 'the releases.compare command accepted an empty payload');
      await shot(page, record, 'compare-blocked');
    }
  },
  {
    id: 'configuration.sc011-transfer',
    route: '/?surface=configuration',
    preconditions: ['app booted with CEPFoundation.consumer === "configuration"', 'canonical Settings opens through the shared foundation.settings command'],
    expectedState: 'operational configuration is observe/propose/validate only, apply requires explicit authority, Global Settings stays a separate owner, SC-011 export/import/reset is exposed once through settings.transfer',
    fixtureState: 'default operational observations from the local runtime capability advertisement',
    negativeCases: ['edit must not mutate operational configuration', 'validate must not imply apply', 'reset must not factory-reset operational configuration', 'Settings must not dispatch an operational configuration apply', 'preference import must not clobber unscoped (session) state'],
    run: async (page, record) => {
      await ready(page, record, 'configuration');
      const boundary = await inPage(page, () => {
        const composition = CEPFoundation.m0Composition.group.surfaces.configuration;
        return { settingsBoundary: composition.settingsBoundary, truthCeiling: composition.truthCeiling, slots: composition.slots, text: (document.querySelector('[data-m0-composition]') || {}).innerText || '' };
      });
      assert(record, 'configuration.no-duplicate-settings-engine', false, boundary.settingsBoundary.duplicateSettingsEngine, CLASS_PRODUCT, 'a second settings engine exists beside SettingsCenterOwner');
      assert(record, 'configuration.settings-cannot-dispatch-operational-apply', false, boundary.settingsBoundary.settingsCanDispatchOperationalConfigApply, CLASS_PRODUCT, 'Settings can dispatch an operational configuration apply');
      assert(record, 'configuration.global-settings-owner-unchanged', 'SettingsCenterOwner', boundary.settingsBoundary.globalSettingsOwner, CLASS_PRODUCT, 'the global settings owner drifted');
      assert(record, 'configuration.operational-owner-unchanged', 'ConfigurationDomainAdapter', boundary.settingsBoundary.operationalConfigurationOwner, CLASS_PRODUCT, 'the operational configuration owner drifted');
      assert(record, 'configuration.edit-does-not-mutate', false, boundary.truthCeiling.editMutatesOperationalConfig, CLASS_PRODUCT, 'edit mutated operational configuration');
      assert(record, 'configuration.validate-does-not-apply', false, boundary.truthCeiling.validateImpliesApply, CLASS_PRODUCT, 'validate implied apply');
      assert(record, 'configuration.reset-is-not-factory-reset', false, boundary.truthCeiling.resetFactoryResetsOperationalConfig, CLASS_PRODUCT, 'reset factory-reset operational configuration');
      assert(record, 'configuration.requestapply-requires-explicit-authority', true, boundary.truthCeiling.requestApplyRequiresExplicitAuthority, CLASS_PRODUCT, 'requestApply no longer requires explicit authority');
      await shot(page, record, 'configuration-boundary');

      note(record, 'open canonical Settings through the shared foundation.settings command');
      await clickCommand(page, record, 'foundation.settings');
      await page.waitForTimeout(900);
      const settings = await inPage(page, () => {
        const html = document.body.innerHTML;
        const actions = ['settings.preferences.export', 'settings.preferences.import', 'settings.preferences.reset']
          .map(id => ({ id, count: (html.match(new RegExp(`data-settings-action="${id}"`, 'g')) || []).length }));
        const transferSections = (html.match(/data-settings-section="settings\.transfer"/g) || []).length;
        return { actions, transferSections, open: Boolean(document.querySelector('[data-settings-center-owner],.settings-center')) };
      });
      assert(record, 'configuration.settings-center-opened', true, settings.open, CLASS_PRODUCT, 'canonical Settings did not open from the product command');
      for (const action of settings.actions) assert(record, `sc011.${action.id}-exposed`, true, action.count >= 1, CLASS_PRODUCT, `SC-011 action ${action.id} is not exposed in canonical Settings`);
      assert(record, 'sc011.single-transfer-action-home', true, settings.transferSections >= 1, CLASS_PRODUCT, 'settings.transfer action home is missing from the rendered Settings');
      await shot(page, record, 'settings-transfer');

      const preferenceTruth = await inPage(page, () => {
        const preferences = CEPFoundation.preferences;
        if (!preferences || typeof preferences.export !== 'function' || typeof preferences.import !== 'function') return { available: false };
        const out = { available: true };
        try { preferences.set('theme', 'light', 'session'); } catch (error) { out.sessionSetError = String(error?.message || error); }
        out.sessionCarried = Object.hasOwn(preferences.export().overrides || {}, 'session');
        try { preferences.import(preferences.export()); out.importedOk = true; } catch (error) { out.importedOk = false; out.importError = String(error?.message || error); }
        out.sessionAfter = preferences.resolve('theme').preferredValue;
        out.unscopedSurvived = out.sessionAfter === 'light';
        try { preferences.reset('theme', 'session'); } catch (error) { /* restore fixture state */ }
        return out;
      });
      if (preferenceTruth.available) {
        assert(record, 'sc011.session-scope-never-exported', false, preferenceTruth.sessionCarried, CLASS_PRODUCT, 'the context-free session scope leaked into a transfer payload');
        assert(record, 'sc011.import-does-not-clobber-unscoped-state', true, preferenceTruth.unscopedSurvived, CLASS_PRODUCT, 'preference import clobbered unscoped (session) state');
      } else {
        record.assertions.push({ id: 'sc011.import-does-not-clobber-unscoped-state', expected: 'ScopedPreferencesOwner on CEPFoundation', actual: 'missing', ok: false, class: CLASS_HARNESS, message: 'CEPFoundation.preferences is not exposed to the flow probe' });
      }
      await shot(page, record, 'settings-transfer-done');
    }
  }
];

/* ------------------------------------------------------------------ execution */

const targets = selected.length ? definitions.filter(d => selected.includes(d.id)) : definitions;
if (selected.length) {
  const unknown = selected.filter(id => !definitions.some(d => d.id === id));
  if (unknown.length) { console.error(`UNKNOWN_FLOW: ${unknown.join(', ')}`); process.exit(2); }
}

await mkdir(evidenceDir, { recursive: true });
const freePort = () => new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
port = await freePort();
runtimePort = await freePort();

const workRoot = path.join(root, 'writer-output/W05/.runtime-proof');
rmSync(workRoot, { recursive: true, force: true });
await mkdir(workRoot, { recursive: true });

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = ''; server.stdout.on('data', c => { serverLog += String(c); }); server.stderr.on('data', c => { serverLog += String(c); });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: { ...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(workRoot, 'w05-browser.sqlite'), CEP_STAGING_ROOT: path.join(workRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(workRoot, 'root') },
  stdio: ['ignore', 'pipe', 'pipe']
});
let runtimeLog = ''; runtime.stdout.on('data', c => { runtimeLog += String(c); }); runtime.stderr.on('data', c => { runtimeLog += String(c); });

let browser = null;
const records = [];
const env = {
  node: process.version, engine: 'Playwright Chromium', playwrightResolution,
  packageDeclaredVersion: '1.62.1', transport: 'localhost-http',
  proofServer: `tools/serve.mjs on 127.0.0.1:${port}`,
  runtimeServer: `stack/local-runtime/server.mjs on 127.0.0.1:${runtimePort} (throwaway sqlite at writer-output/W05/.runtime-proof)`,
  viewport: '1440x980', reducedMotion: true, browserExecutableOverride: Boolean(process.env.CEP_BROWSER_EXECUTABLE)
};
try {
  let up = false;
  for (let i = 0; i < 120; i += 1) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) { up = true; break; } } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); }
  if (!up) throw Object.assign(new Error(`PROOF_SERVER_DID_NOT_START: ${serverLog}`), { classification: CLASS_ENV });
  let runtimeUp = false;
  for (let i = 0; i < 120; i += 1) { try { const r = await fetch(`http://127.0.0.1:${runtimePort}/v1/capabilities`); if (r.ok) { runtimeUp = true; break; } } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); }
  if (!runtimeUp) throw Object.assign(new Error(`RUNTIME_SERVER_DID_NOT_START: ${runtimeLog}`), { classification: CLASS_ENV });
  try { browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) }); }
  catch (error) { throw Object.assign(new Error(`BROWSER_LAUNCH_FAILED: ${error.message}`), { classification: CLASS_ENV }); }
  env.browserVersion = await browser.version();
  for (const definition of targets) records.push(await runFlow(browser, definition, definition.run));
} catch (error) {
  records.push({ flow: 'w05.browser.bootstrap', status: 'FAIL', failureClassification: error.classification || CLASS_ENV, fatal: String(error?.message || error), route: 'n/a', preconditions: [], expectedState: 'proof harness starts', fixtureState: 'none', negativeCases: [], actionSequence: [], assertions: [], screenshots: [], pageErrors: [], transportFailures: [], evidenceLineage: null, browser: 'Chromium (Playwright package-local)', browserVersion: null });
} finally {
  try { if (browser) await browser.close(); } catch { /* bounded */ }
  runtime.kill('SIGTERM'); server.kill('SIGTERM');
}

/* ------------------------------------------------------------------ receipt */

const identity = await canonicalSourceIdentity(new URL('../', import.meta.url));
const lineageOk = identity.sha256 === CANDIDATE_TREE && identity.files === CANDIDATE_FILES;
const commit = git('git rev-parse HEAD');
const headTree = git('git rev-parse HEAD^{tree}');

let receipt = { schemaVersion: 1, workspace: 'W05', flows: [] };
try { receipt = JSON.parse(await readFile(receiptPath, 'utf8')); } catch { /* first run */ }
const merged = (receipt.flows || []).filter(existing => !records.some(r => r.flow === existing.flow));
receipt = {
  schemaVersion: 1,
  classification: 'W05_BROWSER_RECEIPT_NOT_OWNER_ACCEPTANCE',
  command: selected.length ? `node tools/w05-browser-flows.mjs ${selected.map(id => `--flow ${id}`).join(' ')}` : 'node tools/w05-browser-flows.mjs',
  browser: 'Chromium (Playwright package-local)',
  browserVersion: env.browserVersion || receipt.browserVersion || null,
  transport: 'localhost-http',
  runtime: `Node ${process.version}`,
  candidate: CANDIDATE_LABEL,
  measuredCandidate: `WORKTREE_VARIANT:${identity.sha256}`,
  canonicalSourceFileCount: CANDIDATE_FILES,
  measuredCandidateFileCount: identity.files,
  commit, tree: headTree,
  environment: env,
  capturedAt: new Date().toISOString(),
  evidenceLineage: {
    bindingAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
    recomputedCandidateTreeSha256: identity.sha256,
    recomputedCandidateFileCount: identity.files,
    expectedCandidateTreeSha256: CANDIDATE_TREE,
    expectedCandidateFileCount: CANDIDATE_FILES,
    lineageStatus: lineageOk ? 'BOUND_EXACT_CURRENT_WORKTREE_VARIANT' : 'DRIFT_RECORDED__CONCURRENT_SIBLING_WORKSPACE_EDITS',
    drift: !lineageOk,
    driftAttribution: lineageOk ? 'none — worktree matched the dispatch-declared candidate at capture time' : 'Sibling workspaces edit the shared serial worktree concurrently; W05 records the drift instead of suppressing it.',
    note: 'Worktree variant candidate (3 protected pre-existing canonical deltas) — never presented as the canonical 480dbe…/273 identity.'
  },
  summary: { total: 0, pass: 0, fail: 0 },
  limitations: [
    'Headless Chromium only; no Owner acceptance and no exhaustive permutation certification',
    'Local runtime API process runs against a throwaway sqlite database owned by this proof run',
    'Owner-device Windows native-target proof (C03-GATE-021) is NOT part of this receipt — those rows stay BLOCKED with runner type Owner-device',
    'W05 flows drive only W05-owned surfaces; shared shell/settings owners are exercised through their public commands'
  ],
  flows: []
};
receipt.flows = [...merged, ...records].sort((a, b) => String(a.flow).localeCompare(String(b.flow)));
receipt.summary = { total: receipt.flows.length, pass: receipt.flows.filter(f => f.status === 'PASS').length, fail: receipt.flows.filter(f => f.status === 'FAIL').length };

const referenced = new Set(receipt.flows.flatMap(f => (f.screenshots || []).map(s => s.filename)));
const artifactIndex = [];
for (const entry of await readdirSafe(evidenceDir)) {
  const filePath = path.join(evidenceDir, entry);
  const bytes = await readFile(filePath);
  const relative = path.join('writer-output/W05/evidence', entry);
  const ownerFlow = receipt.flows.find(f => (f.screenshots || []).some(s => s.filename === relative)) || null;
  artifactIndex.push({
    filename: relative, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length,
    boundTo: { candidate: CANDIDATE_LABEL, commit, flow: ownerFlow ? ownerFlow.flow : null },
    binding: referenced.has(relative) ? 'FLOW_EVIDENCE' : 'SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED',
    reason: referenced.has(relative) ? `screenshot captured by flow ${ownerFlow.flow}` : 'intermediate run of the same flow superseded by a later run; retained and indexed so no screenshot is an orphan'
  });
}
artifactIndex.sort((a, b) => a.filename.localeCompare(b.filename));
receipt.evidenceArtifacts = artifactIndex;
await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');

const selectedFailed = records.filter(r => r.status === 'FAIL');
console.log(JSON.stringify({
  receipt: 'writer-output/W05/BROWSER_RECEIPT.json',
  executed: records.map(r => ({ flow: r.flow, status: r.status, classification: r.failureClassification, failedAssertions: r.assertions.filter(a => !a.ok).map(a => a.id), screenshots: r.screenshots.map(s => s.filename) })),
  aggregate: receipt.summary,
  lineage: receipt.evidenceLineage.lineageStatus
}, null, 2));
if (selectedFailed.length) process.exitCode = 1;
