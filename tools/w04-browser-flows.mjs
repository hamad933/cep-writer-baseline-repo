/**
 * W04 browser proof — packet §9 required flows for Evidence · Reviews · Mastery · Portfolio.
 *
 * Flows
 *   evidence.create-attest-verify-lifecycle  create -> attest/verify -> admission lifecycle (negatives first)
 *   reviews.flow-and-verdict-recording       formal review flow + immutable verdict recording
 *   mastery.progression-state-machine        CEP-DEC-026 (A03) progression state machine, no grant without proof
 *   portfolio.assembly-and-export            reference-only curation + reproducible export
 *   evidence.receipt-count-truth-f051        receipt-count truth regression (overcount = defect)
 *
 * Contract: controller/07_browser/browser_contract.md §1 (every record carries browser,
 * browserVersion, transport/runtime, candidate, commit, tree, environment, route, flow,
 * preconditions, actionSequence, expectedState, assertions, screenshots, evidenceLineage,
 * fixtureState, negativeCases, failureClassification) and the 7-class taxonomy
 * PRODUCT|HARNESS|ENVIRONMENT|ORACLE|EVIDENCE|LINEAGE|UNKNOWN.
 *
 * L07 consumer taxonomy is recorded per flow: a reviewer harness driving the live product domain
 * inside a real Chromium page is a primaryLiveOperationalConsumer; DOM projections are
 * recordedConsumer; anything seeded by this script is fixture and is labelled as such.
 *
 * Usage:
 *   node tools/w04-browser-flows.mjs                 # run every flow
 *   node tools/w04-browser-flows.mjs --flow <id>     # run/refresh exactly one flow (repeatable)
 *
 * Policy: no repair loop. Classify -> preserve evidence -> report. Exit 1 if a selected flow FAILs.
 */
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
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
const outDir = path.join(root, 'writer-output/W04');
const evidenceDir = path.join(outDir, 'evidence');
const receiptPath = path.join(outDir, 'BROWSER_RECEIPT.json');

const CANDIDATE_TREE = 'c82cec6382f17c0052782f8450053b4e28060873161440d2993fc97143d2cb5f';
const CANDIDATE_FILES = 287;
const CANDIDATE_LABEL = `WORKTREE_VARIANT:${CANDIDATE_TREE}`;
const CANDIDATE8 = CANDIDATE_TREE.slice(0, 8);

const args = process.argv.slice(2);
const selected = [];
for (let i = 0; i < args.length; i += 1) if (args[i] === '--flow' && args[i + 1]) selected.push(args[++i]);

const git = command => {
  try { return String(execSync(command, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; }
};
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const flowFile = (flow, id) => `${flow.replace(/\./g, '-')}${id ? `-${id}` : ''}-${stamp()}-${CANDIDATE8}.png`;
async function readdirSafe(directory) {
  try { return (await readdir(directory)).filter(name => name.endsWith('.png')); } catch { return []; }
}

const CLASS_PRODUCT = 'PRODUCT', CLASS_HARNESS = 'HARNESS', CLASS_ENV = 'ENVIRONMENT', CLASS_ORACLE = 'ORACLE';

/* ------------------------------------------------------------------ flow runner */

const failures = [];
const runFlow = async (browser, definition, run) => {
  const record = {
    flow: definition.id,
    route: definition.route,
    preconditions: definition.preconditions,
    expectedState: definition.expectedState,
    fixtureState: definition.fixtureState,
    negativeCases: definition.negativeCases,
    consumerTaxonomy: definition.consumerTaxonomy,
    actionSequence: [],
    assertions: [],
    screenshots: [],
    pageErrors: [],
    transportFailures: [],
    browser: 'Chromium (Playwright package-local)',
    browserVersion: env.browserVersion || null,
    status: 'PASS',
    failureClassification: null
  };
  let context;
  try {
    context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => record.pageErrors.push(String(error?.stack || error)));
    page.on('requestfailed', request => record.transportFailures.push({ url: request.url(), error: String(request.failure()?.errorText || '') }));
    await run(page, record);
    const failedAssertions = record.assertions.filter(a => !a.ok);
    if (failedAssertions.length) {
      record.status = 'FAIL';
      record.failureClassification = failedAssertions[0].class || 'UNKNOWN';
    } else if (record.pageErrors.length) {
      record.status = 'FAIL';
      record.failureClassification = 'PRODUCT';
    } else {
      record.failureClassification = null;
    }
  } catch (error) {
    record.status = 'FAIL';
    record.failureClassification = error.classification || 'UNKNOWN';
    record.fatal = String(error?.message || error);
  } finally {
    try { if (context) await context.close(); } catch {}
  }
  if (record.status === 'FAIL') failures.push({ flow: record.flow, classification: record.failureClassification, fatal: record.fatal || null, failed: record.assertions.filter(a => !a.ok) });
  return record;
};

const assert = (record, id, expected, actual, klass, message) => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  record.assertions.push({ id, expected, actual, ok, class: ok ? null : klass, message: ok ? '' : message });
  if (!ok) throw Object.assign(new Error(message || `${id}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`), { classification: klass });
};
const check = (record, id, expected, actual, klass, message) => {
  const ok = JSON.stringify(expected) === JSON.stringify(actual);
  record.assertions.push({ id, expected, actual, ok, class: ok ? null : klass, message: ok ? '' : message });
  return ok;
};
const note = (record, text) => record.actionSequence.push(text);
const shot = async (page, record, id) => {
  // Re-render the mounted collection first so the captured frame reflects the state the flow
  // claims to show (direct domain mutations do not auto-refresh the presentation).
  try { await page.evaluate(() => { try { window.__w04?.mounted?.render?.(); } catch {} }); } catch {}
  await page.waitForTimeout(150);
  const filename = flowFile(record.flow, id);
  const filePath = path.join(evidenceDir, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  const bytes = await readFile(filePath);
  record.screenshots.push({
    filename: path.join('writer-output/W04/evidence', filename),
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    viewport: await page.viewportSize(),
    capturedAt: new Date().toISOString(),
    boundTo: { candidate: CANDIDATE_LABEL, flow: record.flow, id }
  });
};
const ready = async (page, record, surface) => {
  note(record, `GET /?surface=${surface}`);
  await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 20000 });
  await page.waitForTimeout(250);
};

/**
 * In-page helpers injected once per page. They operate on the LIVE product domain bound to the
 * mounted W04 composition — no shadow state, no re-implemented rules.
 */
const injectHelpers = async page => page.evaluate(() => {
  const M = window.CEPFoundation.m0Composition;
  window.__w04 = {
    evidence: M.group.evidence.domain,
    reviews: M.group.reviews.domain,
    mastery: M.group.mastery.domain,
    portfolio: M.group.portfolio.domain,
    surface: M.surface,
    mounted: M.mounted,
    domain: M.domain,
    registry: window.CEPFoundation.registry,
    authorityRegistry: window.CEPFoundation.sharedOwners.reviewAuthorityRegistry,
    rows: () => (M.surface.collectionCore || M.surface.collection).snapshot().visibleRows.map(r => r.id || r)
  };
});

/** Admit a candidate through the real domain API. Admission authority is a BOUND, explicitly
 *  labelled fixture authority (no admission-authority registry ships with this static route) —
 *  the default product refusal is recorded separately as a negative case before this runs. */
const ADMIT_FIXTURE = id => {
  const d = window.__w04.evidence;
  d.verifySource(id, {
    status: 'VERIFIED', providerId: 'provider:w04-browser-flow', providerRevision: '1.0.0',
    proofId: `proof:flow:${id}`, digest: `sha256:flow${id.replace(/[^a-z0-9]/gi, '')}0000000000000000000000000000000000000000000000000000000`.slice(0, 71),
    schemaValid: true, sourceBytesAvailable: true
  });
  d.submitCandidate(id);
  d.markCandidateValidated(id, { validator: 'w04-browser-flow', validationProofRef: `proof:intake:${id}` });
  d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
  d.setAdmissionAuthority(id, true, `authority:evidence-admission:browser-flow:${id}`, { testOnly: false });
  const admitted = d.admit(id);
  const row = d.inspect(id);
  return {
    admitOk: admitted.ok, admitCode: admitted.code || null,
    status: row.status, candidateState: row.candidateState,
    revisionId: row.revisionId, immutableRevision: row.currentRevision?.immutable === true,
    lifecycle: row.lineage?.lifecycle || null,
    reviewStatus: row.reviewStatus ?? null, effectiveDecision: row.effectiveDecision ?? null,
    receipts: d.receipts.length,
    authorityLabel: 'FIXTURE_ADMISSION_AUTHORITY__EXPLICITLY_INJECTED_BY_REVIEWER_HARNESS'
  };
};

const IMPORT_CANDIDATE = id => window.__w04.registry.execute('evidence.import', {
  route: 'w04-browser-flow',
  input: {
    id, revisionId: `${id}-r1`, title: `W04 browser flow candidate ${id}`,
    sourceId: `flow-source-${id}`, sourceRevision: 'r1', subject: 'owner:local',
    evidenceClaim: `W04 browser flow candidate claim for ${id}`,
    criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'W04 packet §9 browser proof'
  }
});

/* ------------------------------------------------------------------ the five flows */

const definitions = [
  {
    id: 'evidence.create-attest-verify-lifecycle',
    route: '/?surface=evidence',
    preconditions: [
      'static proof server serves the current dist/ build',
      'app booted with CEPFoundation.consumer === "evidence"',
      'W04 evidence domain starts EMPTY (tools/c2-w04-truth "normal-defaults-empty")',
      'no admission-authority registry ships with this route; the default product refusal is asserted first'
    ],
    expectedState: 'Candidate import never implies verification or Admission; verification requires a bound verifier envelope; Admission requires validated intake AND explicit admission authority; the admitted Evidence is an immutable revision that creates no Review Decision and no Mastery',
    fixtureState: 'reviewer harness seeds the candidate through the live evidence.import semantic command; the admission authority registry is injected ONLY after the default product refusal is captured, and is labelled FIXTURE in every receipt field',
    consumerTaxonomy: {
      primaryLiveOperationalConsumer: 'W04 Evidence domain executed inside the mounted Chromium page (CEPFoundation.m0Composition.group.evidence.domain)',
      recordedConsumer: 'm0 Evidence workbench DOM projection (rows, state list, import form)',
      fixture: 'candidate identity + admission authority registry injected by this harness (labelled FIXTURE)'
    },
    negativeCases: [
      'Admission before source verification must be refused with SOURCE_VERIFICATION_REQUIRED',
      'Admission without bound admission authority must be refused with ADMISSION_AUTHORITY_UNAVAILABLE',
      'Import must never report canonicalEvidenceCreated=true',
      'Admission must not create a Review Decision or a Mastery mutation'
    ],
    run: async (page, record) => {
      await ready(page, record, 'evidence');
      await injectHelpers(page);
      note(record, 'inspect the mounted Evidence workbench before any mutation');
      const pre = await page.evaluate(() => ({
        consumer: window.CEPFoundation.consumer,
        stage: document.querySelector('#foundationStage')?.dataset.m0Composition,
        records: window.__w04.evidence.records.length,
        receipts: window.__w04.evidence.receipts.length,
        owner: window.__w04.evidence.owner,
        commands: [...window.__w04.surface.commands],
        empty: document.querySelector('#foundationStage')?.textContent.includes('Declare a Candidate without inventing verification facts.') || false
      }));
      assert(record, 'evidence.route-mounted', { consumer: 'evidence', stage: 'evidence' }, { consumer: pre.consumer, stage: pre.stage }, CLASS_PRODUCT, 'Evidence composition did not mount');
      assert(record, 'evidence.domain-empty-at-start', 0, pre.records, CLASS_PRODUCT, 'Evidence domain was not empty at route entry');
      assert(record, 'evidence.domain-owner-w04', 'W04EvidenceDomain', pre.owner, CLASS_PRODUCT, 'Evidence domain owner drifted from W04EvidenceDomain');
      assert(record, 'evidence.command-set-complete', ['evidence.inspect', 'evidence.import', 'evidence.amend', 'evidence.admit', 'evidence.sourceChoice'], pre.commands, CLASS_PRODUCT, 'Evidence command set incomplete');
      assert(record, 'evidence.empty-state-is-visible', true, pre.empty, CLASS_ORACLE, 'empty-state guidance missing');
      await shot(page, record, 'empty-state');

      note(record, 'execute semantic command evidence.import (Candidate creation only)');
      const imported = await page.evaluate(id => {
        const result = window.__w04.registry.execute('evidence.import', {
          route: 'w04-browser-flow',
          input: {
            id, revisionId: `${id}-r1`, title: `W04 browser flow candidate ${id}`,
            sourceId: `flow-source-${id}`, sourceRevision: 'r1', subject: 'owner:local',
            evidenceClaim: `W04 browser flow candidate claim for ${id}`,
            criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'W04 packet §9 browser proof'
          }
        });
        const row = window.__w04.evidence.records[0] || null;
        return {
          ok: result?.ok, canonicalEvidenceCreated: result?.canonicalEvidenceCreated ?? null,
          verificationStatus: result?.verificationStatus ?? null,
          records: window.__w04.evidence.records.length,
          status: row?.status ?? null, candidateState: row?.candidateState ?? null,
          verification: row?.verification?.status ?? null,
          receipts: window.__w04.evidence.receipts.length
        };
      }, 'cand-w04-flow');
      assert(record, 'evidence.import-created-candidate', { ok: true, canonicalEvidenceCreated: false, verificationStatus: 'UNVERIFIED', records: 1, status: 'CANDIDATE', candidateState: 'PREPARED', verification: 'UNVERIFIED', receipts: 1 }, imported, CLASS_PRODUCT, 'Candidate import did not produce an unverified CANDIDATE');
      await shot(page, record, 'candidate-imported');

      note(record, 'NEGATIVE: attempt Admission before source verification');
      const neg1 = await page.evaluate(() => {
        const r = window.__w04.evidence.admit('cand-w04-flow');
        return { ok: r.ok, code: r.code, status: window.__w04.evidence.inspect('cand-w04-flow').status, receipts: window.__w04.evidence.receipts.length };
      });
      assert(record, 'evidence.negative-admit-before-verification', { ok: false, code: 'SOURCE_VERIFICATION_REQUIRED', status: 'CANDIDATE', receipts: 1 }, neg1, CLASS_PRODUCT, 'Admission was allowed before source verification');
      assert(record, 'evidence.negative-no-receipt-on-refusal', 1, neg1.receipts, CLASS_PRODUCT, 'a refused Admission still emitted a receipt');

      note(record, 'ATTTEST: bind a verifier envelope (verifySource) and record the attestation');
      const verified = await page.evaluate(() => {
        const r = window.__w04.evidence.verifySource('cand-w04-flow', {
          status: 'VERIFIED', providerId: 'provider:w04-browser-flow', providerRevision: '1.0.0',
          proofId: 'proof:flow:cand-w04-flow', digest: 'sha256:1111111111111111111111111111111111111111111111111111111111111111',
          schemaValid: true, sourceBytesAvailable: true
        });
        const row = window.__w04.evidence.inspect('cand-w04-flow');
        return { ok: r.ok, verification: row.verification.status, providerId: row.verification.providerId, proofRef: row.verification.proofRef, status: row.status, receipts: window.__w04.evidence.receipts.length };
      });
      assert(record, 'evidence.verify-attested-by-bound-provider', { ok: true, verification: 'VERIFIED', providerId: 'provider:w04-browser-flow', proofRef: 'proof:flow:cand-w04-flow', status: 'CANDIDATE', receipts: 2 }, verified, CLASS_PRODUCT, 'source attestation did not bind a verifier envelope');
      assert(record, 'evidence.verify-does-not-admit', 'CANDIDATE', verified.status, CLASS_PRODUCT, 'verification silently promoted the Candidate to ADMITTED');

      note(record, 'submit for intake and validate intake');
      const staged = await page.evaluate(() => {
        const d = window.__w04.evidence;
        const s = d.submitCandidate('cand-w04-flow');
        const v = d.markCandidateValidated('cand-w04-flow', { validator: 'w04-browser-flow', validationProofRef: 'proof:intake:w04-flow' });
        const row = d.inspect('cand-w04-flow');
        return { submitOk: s.ok, validateOk: v.ok, candidateState: row.candidateState, intake: row.intakeValidation.status, receipts: d.receipts.length };
      });
      assert(record, 'evidence.intake-staged', { submitOk: true, validateOk: true, candidateState: 'SUBMITTED_FOR_INTAKE', intake: 'VALIDATED' }, { submitOk: staged.submitOk, validateOk: staged.validateOk, candidateState: staged.candidateState, intake: staged.intake }, CLASS_PRODUCT, 'Candidate could not be staged for intake');

      note(record, 'NEGATIVE: Admission without bound admission authority (product default)');
      const neg2 = await page.evaluate(() => {
        const r = window.__w04.evidence.admit('cand-w04-flow');
        const row = window.__w04.evidence.inspect('cand-w04-flow');
        return { ok: r.ok, code: r.code, status: row.status, receipts: window.__w04.evidence.receipts.length };
      });
      assert(record, 'evidence.negative-admit-needs-admission-authority', { ok: false, code: 'ADMISSION_AUTHORITY_UNAVAILABLE', status: 'CANDIDATE', receipts: 4 }, neg2, CLASS_PRODUCT, 'Admission succeeded without bound admission authority');
      await shot(page, record, 'verified-not-admitted');

      note(record, 'bind an explicitly labelled FIXTURE admission authority and complete the lifecycle');
      const admitted = await page.evaluate(() => {
        const d = window.__w04.evidence;
        d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
        d.setAdmissionAuthority('cand-w04-flow', true, 'authority:evidence-admission:browser-flow:v1', { testOnly: false });
        const r = d.admit('cand-w04-flow');
        const row = d.inspect('cand-w04-flow');
        return {
          ok: r.ok, code: r.code || null, status: row.status, candidateState: row.candidateState,
          immutableRevision: row.currentRevision?.immutable === true, lifecycle: row.lineage?.lifecycle || null,
          revisionId: row.revisionId, reviewStatus: row.reviewStatus ?? null, effectiveDecision: row.effectiveDecision ?? null,
          receipts: d.receipts.length, receiptLast: d.receipts[d.receipts.length - 1] || null,
          fixtureAuthority: row.admissionAuthority?.proofRef || null
        };
      });
      assert(record, 'evidence.admit-created-immutable-revision', { ok: true, status: 'ADMITTED', candidateState: 'ADMITTED', immutableRevision: true, lifecycle: 'ACTIVE' }, { ok: admitted.ok, status: admitted.status, candidateState: admitted.candidateState, immutableRevision: admitted.immutableRevision, lifecycle: admitted.lifecycle }, CLASS_PRODUCT, 'Admission did not produce an active immutable Evidence revision');
      assert(record, 'evidence.admission-created-no-review-decision', { reviewStatus: 'UNREVIEWED', effectiveDecision: 'NONE' }, { reviewStatus: admitted.reviewStatus, effectiveDecision: admitted.effectiveDecision }, CLASS_PRODUCT, 'Admission fabricated a Review Decision / review status');
      assert(record, 'evidence.admission-receipt-carries-authority-proof', 'authority:evidence-admission:browser-flow:v1', admitted.receiptLast?.authorityProofRef ?? null, CLASS_PRODUCT, 'Admission receipt lost its authority proof ref');
      assert(record, 'evidence.admission-receipt-no-review-decision', true, admitted.receiptLast?.noReviewDecisionCreated === true, CLASS_PRODUCT, 'Admission receipt does not record noReviewDecisionCreated');

      note(record, 're-render the workbench after Admission and capture the admitted state');
      await page.waitForTimeout(300);
      await shot(page, record, 'admitted-immutable');
      const post = await page.evaluate(() => ({
        rows: window.__w04.rows(),
        stateText: [...document.querySelectorAll('#foundationStage .m0-semantic-list dd')].map(n => n.textContent.trim())
      }));
      check(record, 'evidence.collection-renders-one-row', ['cand-w04-flow'], post.rows, CLASS_ORACLE, 'collection did not re-render the admitted record');
      const final = await page.evaluate(() => ({ receipts: window.__w04.evidence.receipts.map(r => `${r.sequence}:${r.command}:${r.id}`), records: window.__w04.evidence.records.length }));
      assert(record, 'evidence.receipt-identities-are-unique', final.receipts.length, new Set(final.receipts).size, CLASS_PRODUCT, 'duplicate evidence receipts (overcount)');
      assert(record, 'evidence.receipt-count-exact', 5, final.receipts.length, CLASS_PRODUCT, `expected exactly 5 evidence receipts, got ${final.receipts.length}`);
    }
  },

  {
    id: 'reviews.flow-and-verdict-recording',
    route: '/?surface=reviews',
    preconditions: [
      'app booted with CEPFoundation.consumer === "reviews"',
      'shared W04 evidence domain starts empty, so no admitted immutable Evidence exists yet',
      'central ReviewAuthorityRegistry is bound (no reviewer is registered initially)'
    ],
    expectedState: 'a Review cannot exist without pinned admitted immutable Evidence; workflow runs REQUESTED -> ASSIGNED -> IN_REVIEW -> finding -> READY_FOR_DECISION -> CLOSED verdict; the Decision is append-only immutable lineage; the family never self-admits and never claims formal presentation authority',
    fixtureState: 'reviewer harness (a) seeds the shared Evidence domain through the live evidence API with a labelled FIXTURE admission authority, (b) registers ONE reviewer in the CENTRAL ReviewAuthorityRegistry. Both are labelled fixture; no review, finding or Decision content is invented by the harness beyond the explicit reviewer-authored text used by this proof.',
    consumerTaxonomy: {
      primaryLiveOperationalConsumer: 'W04 Review domain + central ReviewAuthorityRegistry executed inside the mounted Chromium page',
      recordedConsumer: 'm0 Reviews workbench DOM projection (rows, governed Review input form)',
      fixture: 'reviewer registration + admission authority injected by this harness (labelled FIXTURE)'
    },
    negativeCases: [
      'a Review request pinned to a non-existent Evidence revision must be refused (ADMITTED_IMMUTABLE_EVIDENCE_REQUIRED)',
      'a finding/Decision must never be created without reviewer authority',
      'a second Decision must not overwrite or delete the first (append-only lineage)',
      'the family must stay familyAdmissionClaim=false and CONCEPT_CONTRACT_ONLY (no self-approval)'
    ],
    run: async (page, record) => {
      await ready(page, record, 'reviews');
      await injectHelpers(page);
      note(record, 'inspect the mounted Reviews workbench before any mutation');
      const pre = await page.evaluate(() => ({
        consumer: window.CEPFoundation.consumer,
        stage: document.querySelector('#foundationStage')?.dataset.m0Composition,
        records: window.__w04.reviews.records.length,
        owner: window.__w04.reviews.owner,
        familyAdmissionClaim: window.__w04.reviews.familyAdmissionClaim,
        presentation: window.__w04.reviews.reviewDecisionPresentationStatus,
        toolbar: [...window.__w04.surface.toolbarCommandIds],
        commands: [...window.__w04.surface.commands],
        authorityBound: Boolean(window.__w04.authorityRegistry)
      }));
      assert(record, 'reviews.route-mounted', { consumer: 'reviews', stage: 'reviews' }, { consumer: pre.consumer, stage: pre.stage }, CLASS_PRODUCT, 'Reviews composition did not mount (route crash)');
      assert(record, 'reviews.domain-empty-at-start', 0, pre.records, CLASS_PRODUCT, 'Reviews domain was not empty at route entry');
      assert(record, 'reviews.no-family-self-admission', { familyAdmissionClaim: false, presentation: 'CONCEPT_CONTRACT_ONLY' }, { familyAdmissionClaim: pre.familyAdmissionClaim, presentation: pre.presentation }, CLASS_PRODUCT, 'Review/Decision family self-admitted or left CONCEPT_CONTRACT_ONLY');
      assert(record, 'reviews.toolbar-command-set', ['reviews.review', 'reviews.finding', 'reviews.compare', 'reviews.supersede'], pre.toolbar, CLASS_PRODUCT, 'Reviews toolbar command set is not the registered command bus id list');
      assert(record, 'reviews.central-authority-registry-bound', true, pre.authorityBound, CLASS_PRODUCT, 'central ReviewAuthorityRegistry is not bound on the reviews route');
      await shot(page, record, 'empty-state');

      note(record, 'NEGATIVE: request a Review pinned to an Evidence revision that does not exist');
      const neg1 = await page.evaluate(() => {
        const r = window.__w04.reviews.review('rv-w04-flow', {
          action: 'request', evidenceRefs: ['ghost-evidence@r1'], criteriaRefs: ['criteria:v4#integrity'],
          reviewer: { identity: 'reviewer:w04-flow', permissionProofRef: 'perm:w04-flow', authorityAvailable: true, assignmentPermissionAvailable: true }
        });
        return { ok: r.ok, code: r.code || null, records: window.__w04.reviews.records.length };
      });
      assert(record, 'reviews.negative-no-phantom-review', { ok: false, code: 'ADMITTED_IMMUTABLE_EVIDENCE_REQUIRED', records: 0 }, neg1, CLASS_PRODUCT, 'a Review was created without admitted immutable Evidence');

      note(record, 'seed the shared Evidence domain through the live evidence domain API (labelled FIXTURE) so a real admitted revision can be pinned');
      const admitted = await page.evaluate(() => {
        const d = window.__w04.evidence;
        const result = d.importEvidence({
          id: 'ev-w04-flow', revisionId: 'ev-w04-flow-r1', title: 'W04 browser flow Evidence',
          sourceId: 'flow-source', sourceRevision: 'r1', subject: 'owner:local',
          evidenceClaim: 'W04 browser flow Evidence claim', criterionRefs: ['criteria:v4#integrity'],
          governedPurpose: 'W04 packet §9 reviews browser proof'
        });
        d.verifySource('ev-w04-flow', { status: 'VERIFIED', providerId: 'provider:w04-browser-flow', providerRevision: '1.0.0', proofId: 'proof:flow:ev', digest: 'sha256:2222222222222222222222222222222222222222222222222222222222222222', schemaValid: true, sourceBytesAvailable: true });
        d.submitCandidate('ev-w04-flow');
        d.markCandidateValidated('ev-w04-flow', { validator: 'w04-browser-flow', validationProofRef: 'proof:intake:ev-w04-flow' });
        d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
        d.setAdmissionAuthority('ev-w04-flow', true, 'authority:evidence-admission:browser-flow:ev', { testOnly: false });
        const a = d.admit('ev-w04-flow');
        const row = d.inspect('ev-w04-flow');
        return { importOk: result?.ok, admitOk: a.ok, status: row.status, evidenceRef: `${row.evidenceId}@${row.revisionId}`, immutable: row.currentRevision?.immutable === true };
      });
      assert(record, 'reviews.fixture-evidence-admitted', { importOk: true, admitOk: true, status: 'ADMITTED', evidenceRef: 'ev-w04-flow@ev-w04-flow-r1', immutable: true }, admitted, CLASS_PRODUCT, 'fixture Evidence could not be admitted for the review flow');

      note(record, 'register exactly one Reviewer in the CENTRAL ReviewAuthorityRegistry (the only authority path)');
      const reviewer = await page.evaluate(() => {
        window.__w04.authorityRegistry.registerReviewer('reviewer:w04-flow', { authorized: true, canAssign: true, permissionProofRef: 'perm:w04-flow', testOnly: false });
        return window.__w04.authorityRegistry.resolveReviewerAuthority('reviewer:w04-flow');
      });
      assert(record, 'reviews.reviewer-registered-in-central-registry', { authorized: true, canAssign: true, testOnly: false }, { authorized: reviewer.authorized, canAssign: reviewer.canAssign, testOnly: reviewer.testOnly }, CLASS_PRODUCT, 'reviewer authority was not resolved from the central registry');

      note(record, 'request the formal Review pinned to the admitted Evidence revision + pinned criterion');
      const requested = await page.evaluate(ref => {
        const r = window.__w04.reviews.review('rv-w04-flow', {
          action: 'request', evidenceRefs: [ref], criteriaRefs: ['criteria:v4#integrity'],
          reviewer: { identity: 'reviewer:w04-flow', permissionProofRef: 'perm:w04-flow', authorityAvailable: true, assignmentPermissionAvailable: true }
        });
        const row = window.__w04.reviews.inspect('rv-w04-flow');
        return { ok: r.ok, state: row.state, decision: row.decision, findings: row.findings.length, evidenceRefs: row.evidenceRefs, criteriaRefs: row.criteriaRefs };
      }, admitted.evidenceRef);
      assert(record, 'reviews.request-created', { ok: true, state: 'REQUESTED', decision: null, findings: 0 }, { ok: requested.ok, state: requested.state, decision: requested.decision, findings: requested.findings }, CLASS_PRODUCT, 'Review request did not produce a REQUESTED Review with no Decision');
      assert(record, 'reviews.pinned-to-exact-admission-revision', [admitted.evidenceRef], requested.evidenceRefs, CLASS_PRODUCT, 'Review is not pinned to the exact admitted Evidence revision');

      note(record, 'assign -> start the Review');
      const started = await page.evaluate(() => {
        const d = window.__w04.reviews;
        const a = d.review('rv-w04-flow', { action: 'assign' });
        const s = d.review('rv-w04-flow', { action: 'start' });
        const row = d.inspect('rv-w04-flow');
        return { assignOk: a.ok, startOk: s.ok, state: row.state };
      });
      assert(record, 'reviews.workflow-advances', { assignOk: true, startOk: true, state: 'IN_REVIEW' }, started, CLASS_PRODUCT, 'Review workflow did not advance to IN_REVIEW');

      note(record, 'record an explicit reviewer-authored finding (no manufactured text)');
      const finding = await page.evaluate(() => {
        const d = window.__w04.reviews;
        const r = d.finding('rv-w04-flow', { findingId: 'f-w04-1', text: 'Digest, schema and intake validation were observed against the pinned Evidence revision.', state: 'SATISFIED', criterionRef: 'criteria:v4#integrity', scopeDisposition: 'IN_SCOPE' });
        const row = d.inspect('rv-w04-flow');
        return { ok: r.ok, decisionCreated: r.note?.includes('no Review Decision was created') ?? null, findings: row.findings.length, decision: row.decision };
      });
      assert(record, 'reviews.finding-creates-no-decision', { ok: true, findings: 1, decision: null }, { ok: finding.ok, findings: finding.findings, decision: finding.decision }, CLASS_PRODUCT, 'a Finding manufactured a Review Decision');

      note(record, 'mark ready for Decision');
      const readyState = await page.evaluate(() => {
        const r = window.__w04.reviews.review('rv-w04-flow', { action: 'ready' });
        return { ok: r.ok, state: window.__w04.reviews.inspect('rv-w04-flow').state };
      });
      assert(record, 'reviews.ready-for-decision', { ok: true, state: 'READY_FOR_DECISION' }, readyState, CLASS_PRODUCT, 'Review did not reach READY_FOR_DECISION');
      await shot(page, record, 'ready-for-decision');

      note(record, 'record the verdict (issuing Decision) with explicit expected CAS = null (no prior Decision)');
      const verdict = await page.evaluate(() => {
        const d = window.__w04.reviews;
        const r = d.supersede('rv-w04-flow', {
          expectedDecisionId: null,
          newDecision: { decisionId: 'decision-w04-flow-1', outcome: 'ACCEPT_WITH_LIMITATIONS', correctionReason: 'Pinned Evidence satisfies the criterion with stated limitations.' },
          correctionReason: 'Pinned Evidence satisfies the criterion with stated limitations.'
        });
        const row = d.inspect('rv-w04-flow');
        return { ok: r.ok, code: r.code || null, state: row.state, outcome: row.decision?.outcome || null, decisionId: row.decision?.decisionId || null, history: row.decisionHistory.map(x => `${x.decisionId}:${x.outcome}`), priorRetained: r.priorDecisionRetained, receipts: d.receipts.length };
      });
      assert(record, 'reviews.verdict-recorded', { ok: true, code: null, state: 'CLOSED', outcome: 'ACCEPT_WITH_LIMITATIONS', decisionId: 'decision-w04-flow-1', history: ['decision-w04-flow-1:ACCEPT_WITH_LIMITATIONS'], priorRetained: true, receipts: 6 }, verdict, CLASS_PRODUCT, 'verdict was not recorded');

      note(record, 'NEGATIVE: re-issuing a Decision on a CLOSED review must not mutate lineage');
      const neg2 = await page.evaluate(() => {
        const before = JSON.stringify(window.__w04.reviews.inspect('rv-w04-flow').decisionHistory);
        const r = window.__w04.reviews.supersede('rv-w04-flow', { expectedDecisionId: 'decision-w04-flow-1', newDecision: { decisionId: 'decision-w04-flow-2', outcome: 'REJECT', correctionReason: 'second attempt' }, correctionReason: 'second attempt' });
        const after = JSON.stringify(window.__w04.reviews.inspect('rv-w04-flow').decisionHistory);
        return { ok: r.ok, code: r.code, unchanged: before === after };
      });
      assert(record, 'reviews.negative-closed-review-not-redecided', { ok: false, code: 'REVIEW_NOT_READY_FOR_DECISION', unchanged: true }, neg2, CLASS_PRODUCT, 'a CLOSED Review was re-decided or its lineage changed');

      note(record, 'assert the family authority ceiling after the verdict');
      const ceiling = await page.evaluate(() => {
        const snap = window.__w04.reviews.presentationSnapshot('rv-w04-flow');
        return {
          familyAdmissionClaim: window.__w04.reviews.familyAdmissionClaim,
          presentation: window.__w04.reviews.reviewDecisionPresentationStatus,
          authorityCeiling: snap.authorityCeiling, familyStatus: snap.familyStatus, realConsumerStatus: snap.realConsumerStatus,
          registryReceipts: window.CEPFoundation.registry.receipts.filter(r => String(r.id).startsWith('reviews.')).map(r => `${r.id}:${r.owner}`)
        };
      });
      assert(record, 'reviews.family-never-self-approves', { familyAdmissionClaim: false, presentation: 'CONCEPT_CONTRACT_ONLY' }, { familyAdmissionClaim: ceiling.familyAdmissionClaim, presentation: ceiling.presentation }, CLASS_PRODUCT, 'Review/Decision family claimed admission or left CONCEPT_CONTRACT_ONLY');
      assert(record, 'reviews.presentation-authority-ceiling', 'NO_FORMAL_DECISION_AUTHORITY_OR_MUTATION', ceiling.authorityCeiling, CLASS_PRODUCT, 'presentation snapshot claims formal decision authority');
      assert(record, 'reviews.presentation-is-not-a-real-consumer', 'W04_NOT_SELF_ADMITTED', ceiling.realConsumerStatus, CLASS_PRODUCT, 'presentation snapshot self-admitted as a real consumer');
      await page.waitForTimeout(300);
      await shot(page, record, 'verdict-recorded');
      const rows = await page.evaluate(() => ({ rows: window.__w04.rows(), history: window.__w04.reviews.inspect('rv-w04-flow').decisionHistory.length }));
      check(record, 'reviews.collection-renders-review-row', ['rv-w04-flow'], rows.rows, CLASS_ORACLE, 'reviews collection did not render the recorded Review');
      check(record, 'reviews.decision-history-append-only', 1, rows.history, CLASS_PRODUCT, 'decision history length drifted');
    }
  },

  {
    id: 'mastery.progression-state-machine',
    route: '/?surface=mastery',
    preconditions: [
      'app booted with CEPFoundation.consumer === "mastery"',
      'no canonical Mastery writer / authorized evaluator is bound on this route',
      'CEP-DEC-026 (A03) judgment + freshness vocabulary is the state machine under test'
    ],
    expectedState: 'NOT_EVALUATED -> INSUFFICIENT_EVIDENCE/INCONCLUSIVE -> NOT_MASTERED/MASTERED with freshness CURRENT|REVALIDATION_REQUIRED; no progression may occur without a bound basis and an authorized evaluator; there is no local Mastery write',
    fixtureState: 'reviewer harness injects ONE synthetic Mastery State row (truthClass SYNTHETIC_DEMO_SEED) so the state machine has a subject; the row is labelled fixture and is never presented as a real achievement',
    consumerTaxonomy: {
      primaryLiveOperationalConsumer: 'W04 Mastery domain executed inside the mounted Chromium page',
      recordedConsumer: 'm0 Mastery workbench DOM projection (rows, explainability projection)',
      fixture: 'single SYNTHETIC_DEMO_SEED Mastery State injected by this harness'
    },
    negativeCases: [
      'reevaluation without an authorized evaluator must be refused (AUTHORIZED_EVALUATOR_UNBOUND)',
      'reevaluation with an unavailable basis must be refused (BASIS_UNAVAILABLE)',
      'conflicting Decisions must route to governed evaluation, never to a grant (CONFLICT_REQUIRES_GOVERNED_EVALUATION)',
      'local freshness/Mastery writes must be refused (CANONICAL_MASTERY_WRITE_FORBIDDEN)',
      'completion/activity must never be an input to Mastery'
    ],
    run: async (page, record) => {
      await ready(page, record, 'mastery');
      await injectHelpers(page);
      note(record, 'inspect the mounted Mastery workbench before any mutation');
      const pre = await page.evaluate(() => ({
        consumer: window.CEPFoundation.consumer,
        stage: document.querySelector('#foundationStage')?.dataset.m0Composition,
        records: window.__w04.mastery.records.length,
        owner: window.__w04.mastery.owner,
        truth: window.__w04.surface.truth,
        toolbar: [...window.__w04.surface.toolbarCommandIds],
        empty: document.querySelector('#foundationStage')?.textContent.includes('Current state is NOT_EVALUATED while evaluator/provider truth is unavailable.') || false
      }));
      assert(record, 'mastery.route-mounted', { consumer: 'mastery', stage: 'mastery' }, { consumer: pre.consumer, stage: pre.stage }, CLASS_PRODUCT, 'Mastery composition did not mount');
      assert(record, 'mastery.domain-empty-at-start', 0, pre.records, CLASS_PRODUCT, 'Mastery domain was not empty at route entry');
      assert(record, 'mastery.truth-no-local-write', { masteryFromCompletion: false, canonicalMasteryWriter: 'UNBOUND', reevaluate: 'ZERO_LOCAL_MASTERY_WRITE' }, { masteryFromCompletion: pre.truth.masteryFromCompletion, canonicalMasteryWriter: pre.truth.canonicalMasteryWriter, reevaluate: pre.truth.reevaluate }, CLASS_PRODUCT, 'Mastery surface truth drifted (completion/locally written Mastery)');
      assert(record, 'mastery.toolbar-command-set', ['mastery.inspect', 'mastery.explain', 'mastery.reevaluate'], pre.toolbar, CLASS_PRODUCT, 'Mastery toolbar command set incomplete');
      assert(record, 'mastery.empty-state-is-visible', true, pre.empty, CLASS_ORACLE, 'Mastery empty-state guidance missing');
      await shot(page, record, 'empty-state');

      note(record, 'inject ONE synthetic Mastery State (truthClass SYNTHETIC_DEMO_SEED) as the state-machine subject');
      const seeded = await page.evaluate(() => {
        const d = window.__w04.mastery;
        d.records.push({
          id: 'mastery-w04-flow', revisionId: 'mr-flow-001', subject: 'user:self', capability: 'crypto-basics',
          judgment: 'MASTERED', freshness: 'REVALIDATION_REQUIRED', policyRef: 'policy:mastery-v3',
          truthClass: 'SYNTHETIC_DEMO_SEED',
          basis: { evidenceRefs: ['ev-w04-flow@evr-002'], decisionRefs: ['decision-w04-flow-1'], digest: 'basis:w04flow001' }
        });
        d.history.push({
          evaluationId: 'eval:mastery-w04-flow:0', recordId: 'mastery-w04-flow', revisionId: 'mr-flow-001',
          judgment: 'MASTERED', freshness: 'REVALIDATION_REQUIRED', policyRef: 'policy:mastery-v3',
          evidenceRefs: ['ev-w04-flow@evr-002'], decisionRefs: ['decision-w04-flow-1'], basisDigest: 'basis:w04flow001',
          truthClass: 'SYNTHETIC_DEMO_SEED'
        });
        const row = d.inspect('mastery-w04-flow');
        return { records: d.records.length, judgment: row.judgment, freshness: row.freshness, truthClass: row.truthClass, history: d.history.length };
      });
      const JUDGMENTS = ['NOT_EVALUATED', 'INSUFFICIENT_EVIDENCE', 'INCONCLUSIVE', 'NOT_MASTERED', 'MASTERED'];
      const FRESHNESS = ['CURRENT', 'REVALIDATION_REQUIRED'];
      assert(record, 'mastery.judgment-in-vocabulary', true, JUDGMENTS.includes(seeded.judgment), CLASS_ORACLE, 'judgment outside CEP-DEC-026 vocabulary');
      assert(record, 'mastery.freshness-in-vocabulary', true, FRESHNESS.includes(seeded.freshness), CLASS_ORACLE, 'freshness outside CEP-DEC-026 vocabulary');
      assert(record, 'mastery.fixture-row-is-labelled', 'SYNTHETIC_DEMO_SEED', seeded.truthClass, 'EVIDENCE', 'fixture Mastery row is not labelled SYNTHETIC_DEMO_SEED');
      await shot(page, record, 'fixture-row');

      note(record, 'NEGATIVE: re-evaluation with an unavailable/unbound basis');
      const neg1 = await page.evaluate(() => {
        const d = window.__w04.mastery;
        const before = JSON.stringify(d.snapshot());
        const r = d.reevaluate('mastery-w04-flow', { basisAvailable: false });
        return { code: r.code, mutated: r.mutated, snapshotUnchanged: before === JSON.stringify(d.snapshot()), history: d.history.length };
      });
      assert(record, 'mastery.negative-basis-unavailable', { code: 'BASIS_UNAVAILABLE', mutated: false, snapshotUnchanged: true, history: 1 }, neg1, CLASS_PRODUCT, 'Mastery re-evaluation proceeded with an unavailable basis');

      note(record, 'NEGATIVE: basis bound but no authorized evaluator -> no grant');
      const neg2 = await page.evaluate(() => {
        const d = window.__w04.mastery;
        d.basisResolver = {
          readEvidence: ref => ({ state: 'RESOLVED', ref }),
          readDecision: ref => ({ state: 'RESOLVED', ref }),
          readPolicy: ref => ({ state: 'RESOLVED', ref })
        };
        const before = JSON.stringify(d.snapshot());
        const r = d.reevaluate('mastery-w04-flow', {});
        return { ok: r.ok, code: r.code, mutated: r.mutated, snapshotUnchanged: before === JSON.stringify(d.snapshot()), history: d.history.length, judgment: d.inspect('mastery-w04-flow').judgment };
      });
      assert(record, 'mastery.negative-no-evaluator-no-grant', { ok: false, code: 'AUTHORIZED_EVALUATOR_UNBOUND', mutated: false, snapshotUnchanged: true, history: 1, judgment: 'MASTERED' }, neg2, CLASS_PRODUCT, 'Mastery re-evaluation proceeded without an authorized evaluator');

      note(record, 'NEGATIVE: conflicting Decisions route to governed evaluation, never to a grant');
      const neg3 = await page.evaluate(() => {
        const d = window.__w04.mastery;
        const before = JSON.stringify(d.snapshot());
        const r = d.reevaluate('mastery-w04-flow', { conflictingDecisions: true });
        return { code: r.code, action: r.action, mutated: r.mutated, snapshotUnchanged: before === JSON.stringify(d.snapshot()), judgment: d.inspect('mastery-w04-flow').judgment, history: d.history.length };
      });
      assert(record, 'mastery.negative-conflict-needs-governed-evaluation', { code: 'CONFLICT_REQUIRES_GOVERNED_EVALUATION', action: 'REQUEST_REVIEW_OR_EVALUATION', mutated: false, snapshotUnchanged: true, judgment: 'MASTERED', history: 1 }, neg3, CLASS_PRODUCT, 'conflicting Decisions were silently resolved into a Mastery grant');

      note(record, 'NEGATIVE: local freshness write is forbidden (canonical Mastery writer only)');
      const neg4 = await page.evaluate(() => {
        const d = window.__w04.mastery;
        const r = d.setFreshness('mastery-w04-flow', 'CURRENT');
        const row = d.inspect('mastery-w04-flow');
        return { ok: r.ok, code: r.code, mutated: r.mutated, freshness: row.freshness, judgment: row.judgment };
      });
      assert(record, 'mastery.negative-no-local-write', { ok: false, code: 'CANONICAL_MASTERY_WRITE_FORBIDDEN', mutated: false, freshness: 'REVALIDATION_REQUIRED', judgment: 'MASTERED' }, neg4, CLASS_PRODUCT, 'a local Mastery/freshness write was accepted');

      note(record, 'explain the causal basis and confirm completion/activity is never an input');
      const explained = await page.evaluate(() => {
        const r = window.__w04.mastery.explain('mastery-w04-flow');
        return { ok: r.ok, completionOrActivityUsed: r.completionOrActivityUsed, institutionalAuthorityInferred: r.institutionalAuthorityInferred, causalLaw: r.causalLaw, missingRefs: r.missingRefs.length, judgment: r.judgment, freshness: r.freshness };
      });
      assert(record, 'mastery.explain-causal-law', { completionOrActivityUsed: false, institutionalAuthorityInferred: false, causalLaw: 'EFFECTIVE_DECISIONS+EVIDENCE+VERSIONED_POLICY_ONLY' }, { completionOrActivityUsed: explained.completionOrActivityUsed, institutionalAuthorityInferred: explained.institutionalAuthorityInferred, causalLaw: explained.causalLaw }, CLASS_PRODUCT, 'Mastery explanation used completion/activity or inferred institutional authority');
      const finalMastery = await page.evaluate(() => ({
        judgment: window.__w04.mastery.inspect('mastery-w04-flow').judgment,
        freshness: window.__w04.mastery.inspect('mastery-w04-flow').freshness,
        history: window.__w04.mastery.history.length,
        receipts: window.__w04.mastery.receipts.length
      }));
      assert(record, 'mastery.no-progression-without-proof', { judgment: 'MASTERED', freshness: 'REVALIDATION_REQUIRED', history: 1, receipts: 0 }, finalMastery, CLASS_PRODUCT, 'the state machine progressed (or recorded a receipt) without governed proof');
      await page.waitForTimeout(300);
      await shot(page, record, 'state-machine-blocked');
      const rows = await page.evaluate(() => ({ rows: window.__w04.rows() }));
      check(record, 'mastery.collection-renders-fixture-row', ['mastery-w04-flow'], rows.rows, CLASS_ORACLE, 'mastery collection did not render the row');
    }
  },

  {
    id: 'portfolio.assembly-and-export',
    route: '/?surface=portfolio',
    preconditions: [
      'app booted with CEPFoundation.consumer === "portfolio"',
      'Portfolio owns curation references only; the shared source resolver can only resolve admitted Evidence/ Mastery revisions',
      'Project/Learning Objective grouping authority is UNRESOLVED (open question Q-5) — no grouping registry is bound'
    ],
    expectedState: 'assembly adds reference-only memberships whose source state is whatever the resolver observed (never an invented RESOLVABLE); grouping is refused with AUTHORITY_DECISION_REQUIRED while Q-5 is open; export is a reproducible projection that never duplicates or deletes canonical truth',
    fixtureState: 'reviewer harness adds two curation references through the live portfolio.curate path; the referenced sources do not exist, so their source state must stay UNVERIFIED_PROVIDER_UNBOUND',
    consumerTaxonomy: {
      primaryLiveOperationalConsumer: 'W04 Portfolio domain executed inside the mounted Chromium page',
      recordedConsumer: 'm0 Portfolio workbench DOM projection (rows, curation metadata)',
      fixture: 'two curation references added by this harness'
    },
    negativeCases: [
      'grouping without bound authority must be refused with AUTHORITY_DECISION_REQUIRED (Q-5 stays open)',
      'a missing canonical source must never be presented as RESOLVABLE',
      'curate remove must preserve the canonical source (canonicalSourceWrite=false, sourcePreserved=true)',
      'export must never claim canonical publication or copy canonical Evidence truth'
    ],
    run: async (page, record) => {
      await ready(page, record, 'portfolio');
      await injectHelpers(page);
      note(record, 'inspect the mounted Portfolio workbench before any mutation');
      const pre = await page.evaluate(() => ({
        consumer: window.CEPFoundation.consumer,
        stage: document.querySelector('#foundationStage')?.dataset.m0Composition,
        records: window.__w04.portfolio.records.length,
        owner: window.__w04.portfolio.owner,
        truth: window.__w04.surface.truth,
        toolbar: [...window.__w04.surface.toolbarCommandIds],
        invariants: window.__w04.surface.invariants || null,
        exportBefore: window.__w04.portfolio.export()
      }));
      assert(record, 'portfolio.route-mounted', { consumer: 'portfolio', stage: 'portfolio' }, { consumer: pre.consumer, stage: pre.stage }, CLASS_PRODUCT, 'Portfolio composition did not mount');
      assert(record, 'portfolio.domain-empty-at-start', 0, pre.records, CLASS_PRODUCT, 'Portfolio domain was not empty at route entry');
      assert(record, 'portfolio.truth-no-canonical-copy', { canonicalSourceCopies: 0, canonicalSourceDeleteAuthority: false, groupingAuthority: 'AUTHORITY_DECISION_REQUIRED' }, { canonicalSourceCopies: pre.truth.canonicalSourceCopies, canonicalSourceDeleteAuthority: pre.truth.canonicalSourceDeleteAuthority, groupingAuthority: pre.truth.groupingAuthority }, CLASS_PRODUCT, 'Portfolio surface truth drifted');
      assert(record, 'portfolio.toolbar-command-set', ['portfolio.curate', 'portfolio.filter', 'portfolio.export', 'portfolio.group'], pre.toolbar, CLASS_PRODUCT, 'Portfolio toolbar command set incomplete');
      assert(record, 'portfolio.export-empty-and-not-canonical', { ok: true, canonicalPublication: false, members: 0 }, { ok: pre.exportBefore.ok, canonicalPublication: pre.exportBefore.canonicalPublication, members: pre.exportBefore.members.length }, CLASS_PRODUCT, 'empty export is not a truthful projection');
      await shot(page, record, 'empty-state');

      note(record, 'assemble a curation reference whose canonical source is NOT resolvable');
      const added = await page.evaluate(() => {
        const d = window.__w04.portfolio;
        const r = d.curate({ action: 'add', member: { id: 'member-w04-flow-1', revisionId: 'pm-flow-001', refType: 'Evidence', sourceRef: 'not-bound-evidence@r1', title: 'W04 flow reference (source not bound)' } });
        const row = d.get('member-w04-flow-1');
        return { ok: r.ok, state: row.state, groupingState: row.groupingState, canonicalSourceWrite: r.receipt?.canonicalSourceWrite, records: d.records.length };
      });
      assert(record, 'portfolio.add-is-reference-only', { ok: true, groupingState: 'UNGROUPED', canonicalSourceWrite: false, records: 1 }, { ok: added.ok, groupingState: added.groupingState, canonicalSourceWrite: added.canonicalSourceWrite, records: added.records }, CLASS_PRODUCT, 'curation add invented canonical or grouping truth');
      assert(record, 'portfolio.unbound-source-not-resolvable', 'UNAVAILABLE', added.state, CLASS_PRODUCT, 'an unresolvable canonical source was presented as RESOLVABLE');
      await shot(page, record, 'assembly-one-reference');

      note(record, 'NEGATIVE: grouping without bound authority (open question Q-5)');
      const grouped = await page.evaluate(() => {
        const d = window.__w04.portfolio;
        const before = JSON.stringify(d.get('member-w04-flow-1'));
        const r = d.group('member-w04-flow-1', 'grp-project-example', { expectedRevisionId: d.get('member-w04-flow-1').revisionId });
        return { ok: r.ok, code: r.code, mutated: r.mutated, unchanged: before === JSON.stringify(d.get('member-w04-flow-1')), responseGroupingState: r.groupingState, groupingRef: d.get('member-w04-flow-1').groupingRef, groupingState: d.get('member-w04-flow-1').groupingState };
      });
      assert(record, 'portfolio.negative-grouping-authority-unresolved', { ok: false, code: 'AUTHORITY_DECISION_REQUIRED', mutated: false, unchanged: true, responseGroupingState: 'AUTHORITY_PENDING', groupingRef: null, groupingState: 'UNGROUPED' }, grouped, CLASS_PRODUCT, 'grouping succeeded while Q-5 grouping authority is unresolved');

      note(record, 'add a second reference, then remove the first with an exact revision envelope');
      const curated = await page.evaluate(() => {
        const d = window.__w04.portfolio;
        d.curate({ action: 'add', member: { id: 'member-w04-flow-2', revisionId: 'pm-flow-002', refType: 'Mastery', sourceRef: 'not-bound-mastery@r1', title: 'W04 flow mastery reference' } });
        const revisionId = d.get('member-w04-flow-1').revisionId;
        const stale = d.curate({ action: 'remove', id: 'member-w04-flow-1', expectedRevisionId: 'stale-revision' });
        const removed = d.curate({ action: 'remove', id: 'member-w04-flow-1', expectedRevisionId: revisionId });
        return {
          staleOk: stale.ok, staleCode: stale.code,
          removeOk: removed.ok, sourcePreserved: removed.sourcePreserved, canonicalSourceWrite: removed.receipt?.canonicalSourceWrite,
          records: d.records.map(r => r.id), receipts: d.receipts.map(r => `${r.sequence}:${r.command}:${r.action || ''}:${r.id}`)
        };
      });
      assert(record, 'portfolio.negative-stale-revision-envelope', { staleOk: false, staleCode: 'REVISION_CONFLICT' }, { staleOk: curated.staleOk, staleCode: curated.staleCode }, CLASS_PRODUCT, 'a stale revision envelope removed a membership');
      assert(record, 'portfolio.remove-preserves-canonical-source', { removeOk: true, sourcePreserved: true, canonicalSourceWrite: false }, { removeOk: curated.removeOk, sourcePreserved: curated.sourcePreserved, canonicalSourceWrite: curated.canonicalSourceWrite }, CLASS_PRODUCT, 'removing a curation reference deleted or wrote canonical source truth');
      assert(record, 'portfolio.records-after-removal', ['member-w04-flow-2'], curated.records, CLASS_PRODUCT, 'portfolio membership set drifted');

      note(record, 'export twice and compare byte-for-byte (reproducible export)');
      const exported = await page.evaluate(() => {
        const d = window.__w04.portfolio;
        const first = d.export();
        const second = d.export();
        const raw = JSON.stringify(first);
        return {
          reproducible: raw === JSON.stringify(second),
          canonicalPublication: first.canonicalPublication,
          hasCanonicalEvidence: raw.includes('canonicalEvidence'),
          hasDigestCopy: raw.includes('"digest"'),
          members: first.members.map(m => `${m.id}@${m.revisionId}:${m.sourceRef}:${m.groupingRef ?? 'UNGROUPED'}`),
          limitations: first.limitations,
          receipts: d.receipts.map(r => `${r.sequence}:${r.command}:${r.action || ''}:${r.id}`)
        };
      });
      assert(record, 'portfolio.export-reproducible', true, exported.reproducible, CLASS_PRODUCT, 'portfolio export is not reproducible');
      assert(record, 'portfolio.export-never-canonical', { canonicalPublication: false, hasCanonicalEvidence: false, hasDigestCopy: false }, { canonicalPublication: exported.canonicalPublication, hasCanonicalEvidence: exported.hasCanonicalEvidence, hasDigestCopy: exported.hasDigestCopy }, CLASS_PRODUCT, 'portfolio export claimed canonical publication or copied canonical Evidence truth');
      assert(record, 'portfolio.export-exact-refs', ['member-w04-flow-2@pm-flow-002:not-bound-mastery@r1:UNGROUPED'], exported.members, CLASS_PRODUCT, 'exported membership refs are not exact');
      assert(record, 'portfolio.receipt-identities-are-unique', curated.receipts.length, new Set(curated.receipts).size, CLASS_PRODUCT, 'duplicate portfolio receipts (overcount)');
      await page.waitForTimeout(300);
      await shot(page, record, 'export-reproducible');
      const rows = await page.evaluate(() => ({ rows: window.__w04.rows() }));
      check(record, 'portfolio.collection-renders-member', ['member-w04-flow-2'], rows.rows, CLASS_ORACLE, 'portfolio collection did not render the remaining member');
    }
  },

  {
    id: 'evidence.receipt-count-truth-f051',
    route: '/?surface=evidence',
    preconditions: [
      'app booted with CEPFoundation.consumer === "evidence"',
      'F-051 (Corr03 evidence-receipt overcount) is the regression under test: named count must never exceed unique identity count',
      'receipts are counted by identity (sequence + command + subject), never by name alone'
    ],
    expectedState: 'the W04 receipt census reports exactly one receipt per mutating operation, with unique receipt identities and a visible row count equal to the unique record id count; a refused operation emits no receipt',
    fixtureState: 'three Candidates imported through the live evidence.import semantic command; one verified; one refused Admission (no receipt)',
    consumerTaxonomy: {
      primaryLiveOperationalConsumer: 'W04 Evidence domain receipt ledger executed inside the mounted Chromium page',
      recordedConsumer: 'm0 Evidence workbench collection rows (visible row census)',
      fixture: 'three Candidate identities imported by this harness'
    },
    negativeCases: [
      'a refused Admission must not add a receipt (no phantom counts)',
      'two receipts must never share an identity (sequence+command+subject)',
      'the visible named row count must equal the unique record id count'
    ],
    run: async (page, record) => {
      await ready(page, record, 'evidence');
      await injectHelpers(page);
      note(record, 'import three Candidates through the live semantic command');
      const imported = await page.evaluate(() => {
        const exec = id => window.__w04.registry.execute('evidence.import', {
          route: 'w04-browser-flow',
          input: {
            id, revisionId: `${id}-r1`, title: `Receipt census ${id}`,
            sourceId: `census-source-${id}`, sourceRevision: 'r1', subject: 'owner:local',
            evidenceClaim: `Receipt census claim ${id}`, criterionRefs: ['criteria:v4#integrity'],
            governedPurpose: 'F-051 receipt-count truth proof'
          }
        });
        return ['census-a', 'census-b', 'census-c'].map(id => ({ id, ok: exec(id)?.ok }));
      });
      assert(record, 'f051.three-candidates-imported', { ok: true, ok2: true, ok3: true }, { ok: imported[0].ok, ok2: imported[1].ok, ok3: imported[2].ok }, CLASS_PRODUCT, 'candidate import failed');

      note(record, 'verify one candidate (attestation receipt) and refuse one Admission (no receipt)');
      const mutated = await page.evaluate(() => {
        const d = window.__w04.evidence;
        d.verifySource('census-a', { status: 'VERIFIED', providerId: 'provider:w04-browser-flow', providerRevision: '1.0.0', proofId: 'proof:census-a', digest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', schemaValid: true, sourceBytesAvailable: true });
        const refused = d.admit('census-b');
        return { refusedOk: refused.ok, refusedCode: refused.code };
      });
      assert(record, 'f051.refused-admission-code', { refusedOk: false, refusedCode: 'SOURCE_VERIFICATION_REQUIRED' }, mutated, CLASS_PRODUCT, 'admission was not refused as expected');

      note(record, 'census the receipt ledger by identity');
      const census = await page.evaluate(() => {
        const d = window.__w04.evidence;
        const identities = d.receipts.map(r => `${r.sequence}|${r.command}|${r.id}`);
        const rows = (window.__w04.surface.collectionCore || window.__w04.surface.collection).snapshot().visibleRows.map(r => r.id);
        const registryEvidence = window.CEPFoundation.registry.receipts.filter(r => String(r.id).startsWith('evidence.'));
        return {
          receiptCount: d.receipts.length,
          uniqueIdentities: new Set(identities).size,
          uniqueSequences: new Set(d.receipts.map(r => r.sequence)).size,
          sequenceStrictlyIncreasing: d.receipts.every((r, i) => i === 0 || r.sequence > d.receipts[i - 1].sequence),
          commands: d.receipts.map(r => r.command),
          owners: [...new Set(d.receipts.map(r => r.owner))],
          recordCount: d.records.length,
          uniqueRecordIds: new Set(d.records.map(r => r.id)).size,
          visibleRowCount: rows.length,
          uniqueVisibleRowIds: new Set(rows).size,
          registryEvidenceReceiptCount: registryEvidence.length,
          registryEvidenceUnique: new Set(registryEvidence.map(r => `${r.id}|${r.owner}`)).size
        };
      });
      assert(record, 'f051.receipt-count-equals-unique-identity-count', census.receiptCount, census.uniqueIdentities, CLASS_PRODUCT, 'F-051 overcount: receipts counted by name exceed unique receipt identities');
      assert(record, 'f051.sequences-unique', census.receiptCount, census.uniqueSequences, CLASS_PRODUCT, 'F-051 overcount: duplicate receipt sequences');
      assert(record, 'f051.receipt-count-exact', 4, census.receiptCount, CLASS_PRODUCT, `expected exactly 4 receipts (3 imports + 1 attestation), got ${census.receiptCount}`);
      assert(record, 'f051.sequences-increasing', true, census.sequenceStrictlyIncreasing, CLASS_PRODUCT, 'receipt sequence numbering is not monotonic');
      assert(record, 'f051.owners-are-w04-domain', ['W04EvidenceDomain'], census.owners, CLASS_PRODUCT, 'a receipt carries a non-W04 owner');
      assert(record, 'f051.named-rows-equal-unique-record-ids', census.visibleRowCount, census.uniqueVisibleRowIds, CLASS_PRODUCT, 'F-051 overcount: visible named rows exceed unique record identities');
      assert(record, 'f051.visible-rows-equal-domain-records', census.recordCount, census.visibleRowCount, CLASS_PRODUCT, 'visible row census disagrees with the domain record census');
      assert(record, 'f051.record-ids-unique', census.recordCount, census.uniqueRecordIds, CLASS_PRODUCT, 'F-051 overcount: duplicate record identities');
      check(record, 'f051.semantic-command-receipts-not-undercounted', true, census.registryEvidenceReceiptCount >= census.registryEvidenceUnique, CLASS_HARNESS, 'semantic command receipt census could not be compared');
      await page.waitForTimeout(300);
      await shot(page, record, 'receipt-census');
    }
  }
];

/* ------------------------------------------------------------------ bootstrap */

await mkdir(evidenceDir, { recursive: true });
const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const port = freePort;
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', chunk => { serverLog += String(chunk); });
server.stderr.on('data', chunk => { serverLog += String(chunk); });

let browser = null;
const records = [];
const env = {
  node: process.version,
  engine: 'Playwright Chromium',
  playwrightResolution,
  packageDeclaredVersion: '1.62.1',
  transport: 'localhost-http',
  proofServer: `tools/serve.mjs on 127.0.0.1:${port}`,
  viewport: '1440x980',
  reducedMotion: true,
  browserExecutableOverride: Boolean(process.env.CEP_BROWSER_EXECUTABLE)
};
const targets = selected.length ? definitions.filter(d => selected.includes(d.id)) : definitions;
try {
  let up = false;
  for (let i = 0; i < 100; i += 1) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  if (!up) throw Object.assign(new Error(`PROOF_SERVER_DID_NOT_START: ${serverLog}`), { classification: 'ENVIRONMENT' });
  try { browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) }); }
  catch (error) { throw Object.assign(new Error(`BROWSER_LAUNCH_FAILED: ${error.message}`), { classification: 'ENVIRONMENT' }); }
  env.browserVersion = await browser.version();
  for (const definition of targets) records.push(await runFlow(browser, definition, definition.run));
} catch (error) {
  records.push({ flow: 'w04.browser.bootstrap', status: 'FAIL', failureClassification: error.classification || 'ENVIRONMENT', fatal: String(error?.message || error), route: 'n/a', preconditions: [], expectedState: 'proof harness starts', fixtureState: 'none', negativeCases: [], actionSequence: [], assertions: [], screenshots: [], pageErrors: [], transportFailures: [] });
} finally {
  try { if (browser) await browser.close(); } catch {}
  server.kill('SIGTERM');
}

/* ------------------------------------------------------------------ receipt */

const identity = await canonicalSourceIdentity(new URL('../', import.meta.url));
const lineageOk = identity.sha256 === CANDIDATE_TREE && identity.files === CANDIDATE_FILES;
const commit = git('git rev-parse HEAD');
const headTree = git('git rev-parse HEAD^{tree}');

let receipt = { schemaVersion: 1, workspace: 'W04', flows: [] };
try { receipt = JSON.parse(await readFile(receiptPath, 'utf8')); } catch {}
const merged = (receipt.flows || []).filter(existing => !records.some(r => r.flow === existing.flow));
receipt = {
  schemaVersion: 1,
  classification: 'W04_BROWSER_RECEIPT_NOT_OWNER_ACCEPTANCE',
  contract: 'controller/07_browser/browser_contract.md §1',
  command: selected.length ? `node tools/w04-browser-flows.mjs ${selected.map(id => `--flow ${id}`).join(' ')}` : 'node tools/w04-browser-flows.mjs',
  browser: 'Chromium (Playwright package-local)',
  browserVersion: env.browserVersion || receipt.browserVersion || null,
  transport: 'localhost-http',
  runtime: `Node ${process.version}`,
  candidate: CANDIDATE_LABEL,
  canonicalSourceFileCount: CANDIDATE_FILES,
  commit,
  tree: headTree,
  environment: env,
  capturedAt: new Date().toISOString(),
  evidenceLineage: {
    bindingAlgorithm: 'path\\0size\\0sha256\\n (tools/source-tree-identity.mjs)',
    recomputedCandidateTreeSha256: identity.sha256,
    recomputedCandidateFileCount: identity.files,
    expectedCandidateTreeSha256: CANDIDATE_TREE,
    expectedCandidateFileCount: CANDIDATE_FILES,
    dispatchDeclaredCandidate: CANDIDATE_LABEL,
    lineageStatus: lineageOk ? 'BOUND_EXACT_DISPATCH_BASELINE_WORKTREE_VARIANT' : 'DIVERGED_FROM_DISPATCH_BASELINE_BY_WRITER_DELTAS',
    note: lineageOk
      ? 'Worktree variant candidate (3 protected pre-existing canonical deltas) — never presented as the canonical 480dbe…/273 identity.'
      : 'The executed source tree is recomputed here and is bound exactly; it differs from the dispatch baseline c82cec63… because this run includes W04 candidate deltas (packet §14). The recomputed value above IS the candidate this receipt executed against — it is never presented as the canonical 480dbe…/273 identity.'
  },
  summary: { total: 0, pass: 0, fail: 0 },
  limitations: [
    'Headless Chromium only; no Owner acceptance and no exhaustive permutation certification',
    'Static proof server (tools/serve.mjs) serves the current dist/ build only — no local runtime API process runs, so requestfailed transport entries are ENVIRONMENT noise, not product verdicts',
    'Fixture rows and fixture admission/reviewer authority are labelled per flow; they are never presented as a real-consumer or a real achievement',
    'Q-5 (Portfolio grouping authority) is an open Owner question: the portfolio flow proves the refusal, never an implementation'
  ],
  flows: []
};
receipt.flows = [...merged, ...records].sort((a, b) => String(a.flow).localeCompare(String(b.flow)));
receipt.summary = {
  total: receipt.flows.length,
  pass: receipt.flows.filter(f => f.status === 'PASS').length,
  fail: receipt.flows.filter(f => f.status === 'FAIL').length
};
// Every file under writer-output/W04/evidence/ is indexed and bound here, so no screenshot can be an orphan.
const referenced = new Set(receipt.flows.flatMap(f => (f.screenshots || []).map(s => s.filename)));
const artifactIndex = [];
for (const entry of await readdirSafe(evidenceDir)) {
  const filePath = path.join(evidenceDir, entry);
  const bytes = await readFile(filePath);
  const relative = path.join('writer-output/W04/evidence', entry);
  const ownerFlow = receipt.flows.find(f => (f.screenshots || []).some(s => s.filename === relative)) || null;
  artifactIndex.push({
    filename: relative,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    boundTo: { candidate: CANDIDATE_LABEL, commit, flow: ownerFlow ? ownerFlow.flow : null },
    binding: referenced.has(relative) ? 'FLOW_EVIDENCE' : 'SUPERSEDED_INTERMEDIATE_ATTEMPT__RETAINED_NOT_DELETED',
    reason: referenced.has(relative)
      ? `screenshot captured by flow ${ownerFlow.flow}`
      : 'intermediate run of the same flow superseded by a later run; retained and indexed so the evidence set stays complete and non-orphaned'
  });
}
artifactIndex.sort((a, b) => a.filename.localeCompare(b.filename));
receipt.evidenceArtifacts = artifactIndex;
await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n');

const selectedFailed = records.filter(r => r.status === 'FAIL');
console.log(JSON.stringify({
  receipt: 'writer-output/W04/BROWSER_RECEIPT.json',
  executed: records.map(r => ({ flow: r.flow, status: r.status, classification: r.failureClassification, failedAssertions: r.assertions.filter(a => !a.ok).map(a => a.id), screenshots: r.screenshots.map(s => s.filename) })),
  aggregate: receipt.summary,
  lineage: receipt.evidenceLineage.lineageStatus
}, null, 2));
if (selectedFailed.length) process.exitCode = 1;
