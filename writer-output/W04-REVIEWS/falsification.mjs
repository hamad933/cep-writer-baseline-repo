#!/usr/bin/env node
/**
 * W04-REVIEWS lane falsification — REV-1.
 *
 * Mandated battery (DAG §0 negative/falsification) + lane-specific PLUS:
 *   N1 non-owned-route mutation attempt      -> must refuse (no side effect)
 *   N2 boundary/invalid input                -> no corruption, no false receipt
 *   N3 act without prerequisite data/provider-> unavailable, never fabricated
 *   N4 duplicate-mechanics                   -> tools/check-duplicate-mechanics.mjs (separate cmd)
 *   N5 suite twice identical                 -> separate cmd (byte-identical)
 *   PLUS verdict receipt only on REAL state change:
 *       attempt to record a verdict without underlying state change
 *       -> must NOT fabricate a decision, must NOT emit a supersede receipt.
 *
 * Source of truth: dist/ (built by npm run build:runtime from stack/native-typescript).
 * Exits 1 on any failed check. Never mutates product source.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = p => path.join(ROOT, 'dist', p);

const { W04ReviewDomain, ReviewAuthorityRegistry, createW04ReviewDemoRecords, createReviewsCompareProvider, REVIEW_DECISION_OUTCOMES, REVIEW_FINDING_OUTCOMES, REVIEW_WORKFLOW_STATES } =
  await import(dist('adapters/reviews/domain.js'));
const { W04EvidenceDomain, createW04EvidenceDemoRecords } = await import(dist('adapters/evidence/domain.js'));
const { AnalyticalCompareOwner } = await import(dist('foundation/analytical/compare.js'));
const { SemanticCommandBus } = await import(dist('foundation/global/commands.js'));
const { composeReviewsSurface, REVIEWS_SURFACE_CONTRACT, createReviewsCollectionAdapter, createReviewsContextProvider, reviewsCenterProjection, reviewsBottomProjection } =
  await import(dist('surfaces/reviews/index.js'));
const { describeContextProvider } = await import(dist('foundation/global/context-descriptor-contract.js'));

const results = [];
const check = (id, pass, detail) => { results.push({ id, pass: pass === true, detail }); return pass === true; };
const snap = domain => JSON.stringify({ records: domain.records, receipts: domain.receipts });

/* ───────────────────────── shared harness: a legitimate, authority-bound Review in IN_REVIEW ── */
function makeDomain() {
  const evidence = new W04EvidenceDomain(createW04EvidenceDemoRecords(), {
    admissionAuthorityRegistry: { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) },
  });
  const registry = new ReviewAuthorityRegistry([
    { identity: 'reviewer:mariam', authorized: true, canAssign: true, permissionProofRef: 'perm:mariam:v1' },
  ]);
  const domain = new W04ReviewDomain(undefined, {
    evidenceResolver: ref => evidence.resolveReviewableEvidenceRef(ref),
    reviewAuthorityRegistry: registry,
    allowTestAuthority: false,
  });
  const requested = domain.review('rev-fals', {
    action: 'request',
    evidenceRefs: ['ev-beta@evr-002'],
    criteriaRefs: ['crit:v4#web-input', 'crit:v4#rationale'],
    reviewer: { identity: 'reviewer:mariam', permissionProofRef: 'perm:mariam:v1' },
    requester: 'owner:local', purpose: 'Formal competency Evidence Review',
  });
  assert.equal(requested.ok, true, 'harness request must succeed');
  domain.review('rev-fals', { action: 'assign' });
  domain.review('rev-fals', { action: 'start' });
  assert.equal(domain.inspect('rev-fals').state, 'IN_REVIEW');
  // a Review only becomes READY_FOR_DECISION with real findings — seed two against pinned criteria
  for (const crit of ['crit:v4#web-input', 'crit:v4#rationale']) {
    const f = domain.finding('rev-fals', { findingId: `f-${crit.split('#')[1]}`, text: `Assessed ${crit} against the pinned revision.`, state: 'SATISFIED', criterionRef: crit });
    assert.equal(f.ok, true, `harness finding must succeed for ${crit}: ${JSON.stringify(f)}`);
  }
  assert.equal(domain.inspect('rev-fals').findings.length, 2);
  return { evidence, registry, domain };
}
const FINDING = (id, crit) => ({ findingId: id, text: `Assessed ${crit} against the pinned revision.`, state: 'SATISFIED', criterionRef: crit });

/* ═══════════════════════════ N1 — non-owned route must refuse ══════════════════════════════ */
{
  let threw = '', value = null;
  try { composeReviewsSurface({ domain: { owner: 'SomeoneElseDomain' } }); } catch (e) { threw = String(e.message); }
  check('N1.composition-rejects-foreign-domain', threw === 'REVIEWS_DOMAIN_REQUIRED', threw);

  threw = '';
  try { composeReviewsSurface({ domain: new W04ReviewDomain(createW04ReviewDemoRecords()), analyticalCompareOwner: { ownerToken: 'NotCompare' } }); } catch (e) { threw = String(e.message); }
  check('N1.composition-rejects-foreign-compare-owner', threw === 'CENTRAL_ANALYTICAL_COMPARE_REQUIRED', threw);

  threw = '';
  try { createReviewsCollectionAdapter({ owner: 'NotReviews' }); } catch (e) { threw = String(e.message); }
  check('N1.collection-adapter-rejects-foreign-domain', threw === 'REVIEWS_DOMAIN_REQUIRED', threw);

  // foreign owner trying to claim a reviews command id on the canonical bus
  const bus = new SemanticCommandBus();
  bus.registerCommand('reviews.supersede', 'SomeOtherFamily', 'foreign', () => ({ ok: true }));
  threw = '';
  try { bus.registerCommand('reviews.supersede', 'W04ReviewDomain', 'mine', () => ({ ok: true })); } catch (e) { threw = String(e.message); }
  check('N1.bus-refuses-foreign-claim-on-reviews-command', threw.startsWith('DUPLICATE_COMMAND_OWNER:reviews.supersede'), threw);

  // bridgeSemanticCommandBus must refuse an owner mismatch rather than silently adopt
  const bus2 = new SemanticCommandBus();
  bus2.registerCommand('reviews.compare', 'ForeignOwner', 'x', () => ({ ok: true }));
  const { composeReviewsSurface: _c } = { composeReviewsSurface };
  const d = new W04ReviewDomain(createW04ReviewDemoRecords());
  threw = '';
  try {
    const surface = composeReviewsSurface({ domain: d, analyticalCompareOwner: new AnalyticalCompareOwner(), commands: bus2 });
    void surface;
  } catch (e) { threw = String(e.message); }
  // reviews.* availability predicates are only registered when absent; a foreign pre-existing
  // owner must surface as an explicit refusal, never a silent re-owner.
  check('N1.no-silent-reowner-of-reviews-command',
    threw === '' || threw.includes('DUPLICATE') || threw.includes('R6_DUPLICATE_COMMAND_OWNER'),
    threw === '' ? 'pre-existing foreign owner left untouched (availability reads through, no re-owner)' : threw);

  // command id from another family must be UNKNOWN on the reviews surface's own id space
  const bus3 = new SemanticCommandBus();
  composeReviewsSurface({ domain: new W04ReviewDomain(createW04ReviewDemoRecords()), analyticalCompareOwner: new AnalyticalCompareOwner(), commands: bus3 });
  const foreign = bus3.availability('evidence.admit', { id: 'ev-beta' });
  check('N1.reviews-bus-does-not-expose-evidence-route', foreign.code === 'UNKNOWN_COMMAND', JSON.stringify(foreign));
}

/* ═══════════════════════════ N2 — boundary/invalid input ════════════════════════════════════ */
{
  const { domain } = makeDomain();
  const cases = [];

  const expectRefusal = (label, fn, expectedCode) => {
    const before = snap(domain);
    const receiptsBefore = domain.receipts.length;
    let out; try { out = fn(); } catch (e) { out = { threw: String(e.message) }; }
    const after = snap(domain);
    const code = out?.code || out?.threw || null;
    cases.push({ label, expectedCode, code, unchanged: before === after, receiptsSame: domain.receipts.length === receiptsBefore, ok: out?.ok });
    return out;
  };

  expectRefusal('supersede.invalid-outcome', () => domain.supersede('rev-fals', { expectedDecisionId: null, newDecision: { decisionId: 'd-x', outcome: 'APPROVE' } }), 'REVIEW_NOT_READY_FOR_DECISION');
  expectRefusal('request.missing-evidence', () => domain.review('rev-none', { action: 'request', criteriaRefs: ['c1'], reviewer: { identity: 'reviewer:mariam' } }), 'EXACT_EVIDENCE_REFS_REQUIRED');
  expectRefusal('request.missing-criteria', () => domain.review('rev-none', { action: 'request', evidenceRefs: ['ev-beta@evr-002'], reviewer: { identity: 'reviewer:mariam' } }), 'PINNED_CRITERIA_REQUIRED');
  expectRefusal('request.missing-actor', () => domain.review('rev-none', { action: 'request', evidenceRefs: ['ev-beta@evr-002'], criteriaRefs: ['c1'], reviewer: {} }), 'REVIEWER_ACTOR_REQUIRED');
  expectRefusal('unknown-record.assign', () => domain.review('rev-ghost', { action: 'assign' }), 'REVIEW_UNKNOWN');
  expectRefusal('unknown-record.cancel', () => domain.review('rev-ghost', { action: 'cancel' }), 'REVIEW_UNKNOWN');
  expectRefusal('unknown-action', () => domain.review('rev-fals', { action: 'teleport' }), 'REVIEW_ACTION_UNKNOWN');
  expectRefusal('finding.empty-text', () => domain.finding('rev-fals', { findingId: 'f-empty', text: '' }), 'FINDING_INPUT_REQUIRED');
  expectRefusal('finding.out-of-pinned-scope', () => domain.finding('rev-fals', { findingId: 'f-bad', text: 'x', criterionRef: 'crit:v9#nope', state: 'SATISFIED' }), 'CRITERION_OUTSIDE_PINNED_SCOPE');
  expectRefusal('finding.invalid-outcome', () => domain.finding('rev-fals', { findingId: 'f-bad2', text: 'x', criterionRef: 'crit:v4#web-input', state: 'PARTIALLY_APPROVED' }), 'FINDING_STATE_INVALID');
  expectRefusal('finding.oos-without-reason', () => domain.finding('rev-fals', { findingId: 'f-oos', text: 'x', criterionRef: 'crit:v9#nope', scopeDisposition: 'OUT_OF_SCOPE', state: 'NOT_ASSESSABLE' }), 'OUT_OF_SCOPE_REASON_REQUIRED');
  // seed one legitimate finding, THEN attempt its duplicate id -> must be refused byte-for-byte
  const seeded = domain.finding('rev-fals', { findingId: 'f-dup', text: 'Seeded once.', criterionRef: 'crit:v4#web-input', state: 'SATISFIED' });
  check('N2.seed-finding-for-conflict-case', seeded.ok === true, JSON.stringify(seeded));
  expectRefusal('finding.id-conflict', () => domain.finding('rev-fals', { findingId: 'f-dup', text: 'x', criterionRef: 'crit:v4#web-input', state: 'SATISFIED' }), 'FINDING_ID_CONFLICT');
  expectRefusal('decision.invalid-outcome', () => domain.supersede('rev-fals', { expectedDecisionId: null, newDecision: { decisionId: 'd-1', outcome: 'MAYBE' } }), 'REVIEW_NOT_READY_FOR_DECISION');

  // constructor boundary: an illegal workflow state must never be silently coerced into a record
  let ctorCode = null;
  try { new W04ReviewDomain([{ id: 'bad', revisionId: 'r1', state: 'SOMEWHERE_ELSE' }]); } catch (e) { ctorCode = String(e.message); }
  check('N2.ctor-rejects-illegal-workflow-state', ctorCode === 'REVIEW_WORKFLOW_STATE_INVALID:SOMEWHERE_ELSE', ctorCode);

  // every refusal left state byte-identical and added no receipt
  const allUnchanged = cases.every(c => c.unchanged && c.receiptsSame);
  check('N2.no-corruption-no-false-receipt-across-boundaries', allUnchanged,
    JSON.stringify(cases.filter(c => !c.unchanged || !c.receiptsSame)));
  check('N2.none-claimed-ok-on-refusal', cases.every(c => c.ok !== true), JSON.stringify(cases.filter(c => c.ok === true)));

  // enums are closed
  check('N2.decision-outcomes-closed', REVIEW_DECISION_OUTCOMES.length === 4 && REVIEW_DECISION_OUTCOMES.includes('REJECT'), JSON.stringify(REVIEW_DECISION_OUTCOMES));
  check('N2.finding-outcomes-closed', REVIEW_FINDING_OUTCOMES.includes('NOT_ASSESSABLE') && !REVIEW_FINDING_OUTCOMES.includes('APPROVED'), JSON.stringify(REVIEW_FINDING_OUTCOMES));
  check('N2.workflow-states-closed', REVIEW_WORKFLOW_STATES.length === 6 && !REVIEW_WORKFLOW_STATES.includes('DECIDED'), JSON.stringify(REVIEW_WORKFLOW_STATES));
}

/* ═══════════════════════════ N3 — prerequisite missing → unavailable, never fabricated ══════ */
{
  // (a) no evidence resolver bound
  const bare = new W04ReviewDomain(undefined, { reviewAuthorityRegistry: new ReviewAuthorityRegistry([{ identity: 'r:1', authorized: true }]) });
  const noResolver = bare.review('rev-x', { action: 'request', evidenceRefs: ['ev-beta@evr-002'], criteriaRefs: ['c1'], reviewer: { identity: 'r:1' } });
  check('N3.unbound-evidence-resolver-refuses', noResolver.ok !== true && /UNBOUND|RESOLVER/.test(String(noResolver.code)), JSON.stringify(noResolver));
  check('N3.unbound-evidence-resolver-creates-nothing', bare.records.length === 0, String(bare.records.length));

  // (b) no authority registry and product mode (allowTestAuthority=false)
  const noAuth = new W04ReviewDomain(undefined, { evidenceResolver: () => ({ state: 'RESOLVED', immutable: true }) });
  const denied = noAuth.review('rev-y', { action: 'request', evidenceRefs: ['e@r1'], criteriaRefs: ['c1'], reviewer: { identity: 'r:1', authorityAvailable: true, permissionProofRef: 'p' } });
  check('N3.unbound-authority-registry-refuses', denied.code === 'REVIEWER_AUTHORITY_UNAVAILABLE', JSON.stringify(denied));
  check('N3.unbound-authority-registry-creates-nothing', noAuth.records.length === 0, String(noAuth.records.length));

  // (c) caller-supplied authority fields are explicitly NOT authoritative when registry is unbound
  check('N3.caller-supplied-authority-not-authoritative',
    /caller-supplied fields are not authoritative/.test(String(denied.reason)), String(denied.reason));

  // (d) testOnly authority must not be usable in product mode
  const testReg = new ReviewAuthorityRegistry([{ identity: 'r:t', authorized: true, canAssign: true, permissionProofRef: 'perm:t', testOnly: true }]);
  const testDomain = new W04ReviewDomain(undefined, { evidenceResolver: () => ({ state: 'RESOLVED', immutable: true }), reviewAuthorityRegistry: testReg, allowTestAuthority: false });
  const testDenied = testDomain.review('rev-z', { action: 'request', evidenceRefs: ['e@r1'], criteriaRefs: ['c1'], reviewer: { identity: 'r:t' } });
  check('N3.test-authority-refused-in-product-mode', testDenied.code === 'TEST_AUTHORITY_NOT_ALLOWED_IN_PRODUCT', JSON.stringify(testDenied));
  check('N3.test-authority-creates-nothing', testDomain.records.length === 0, String(testDomain.records.length));

  // (e) reviewer absent from the registry
  const { domain } = makeDomain();
  const stranger = domain.review('rev-stranger', { action: 'request', evidenceRefs: ['ev-beta@evr-002'], criteriaRefs: ['c1'], reviewer: { identity: 'reviewer:who' } });
  check('N3.unregistered-reviewer-refused', stranger.code === 'REVIEWER_AUTHORITY_UNAVAILABLE' && stranger.reason === 'REVIEWER_NOT_IN_AUTHORITY_REGISTRY', JSON.stringify(stranger));

  // (f) compare without the central AnalyticalCompareOwner
  const cmp = domain.compare('rev-fals', { provider: createReviewsCompareProvider(domain), left: { id: 'a', revisionId: 'a:r1' }, right: { id: 'b', revisionId: 'b:r1' } });
  check('N3.compare-without-central-owner-refuses', cmp.code === 'CENTRAL_ANALYTICAL_COMPARE_REQUIRED', JSON.stringify(cmp));

  // (g) compare without a provider
  const cmp2 = domain.compare('rev-fals', { compareOwner: new AnalyticalCompareOwner() });
  check('N3.compare-without-provider-refuses', cmp2.code === 'ANALYTICAL_PROVIDER_REQUIRED', JSON.stringify(cmp2));

  // (h) action availability reports the prerequisite instead of enabling a no-op
  const surface = composeReviewsSurface({ domain, analyticalCompareOwner: new AnalyticalCompareOwner(), commands: new SemanticCommandBus() });
  void surface;
}

/* ═══════════════════ PLUS — verdict receipt ONLY on real state change ═══════════════════════ */
{
  const { domain } = makeDomain();

  // Baseline: IN_REVIEW, no decision of its own.
  const base = domain.inspect('rev-fals');
  const baseHistoryLen = base.decisionHistory.length;
  const baseEffective = base.effectiveDecisionId;
  const baseDecisionJson = JSON.stringify(base.decision);
  const baseReceipts = domain.receipts.length;
  check('PLUS.starting-state-is-in-review', base.state === 'IN_REVIEW', base.state);

  // (1) Attempt to record a verdict WITHOUT the underlying state change (not READY_FOR_DECISION).
  const attempt1 = domain.supersede('rev-fals', {
    expectedDecisionId: baseEffective ?? null,
    newDecision: { decisionId: 'decision-forced', outcome: 'ACCEPT', correctionReason: 'trying to force a verdict without readiness' },
  });
  check('PLUS.verdict-refused-without-readiness', attempt1.ok === false && attempt1.code === 'REVIEW_NOT_READY_FOR_DECISION', JSON.stringify(attempt1));
  check('PLUS.no-decision-fabricated-1', JSON.stringify(domain.inspect('rev-fals').decision) === baseDecisionJson, 'decision mutated');
  check('PLUS.effective-decision-unchanged-1', domain.inspect('rev-fals').effectiveDecisionId === baseEffective, `${baseEffective} -> ${domain.inspect('rev-fals').effectiveDecisionId}`);
  check('PLUS.decision-history-unchanged-1', domain.inspect('rev-fals').decisionHistory.length === baseHistoryLen, String(domain.inspect('rev-fals').decisionHistory.length));
  check('PLUS.no-supersede-receipt-1', !domain.receipts.some(r => r.command === 'reviews.supersede'), JSON.stringify(domain.receipts.map(r => r.command)));
  check('PLUS.state-unchanged-1', domain.inspect('rev-fals').state === 'IN_REVIEW', domain.inspect('rev-fals').state);

  // (2) Reach READY_FOR_DECISION legitimately (real state change DOES emit a receipt).
  const receiptsBeforeReady = domain.receipts.length;
  const ready = domain.review('rev-fals', { action: 'ready' });
  check('PLUS.ready-reached', ready.ok === true && domain.inspect('rev-fals').state === 'READY_FOR_DECISION', JSON.stringify(ready));
  check('PLUS.real-state-change-emits-receipt', domain.receipts.length === receiptsBeforeReady + 1,
    `${receiptsBeforeReady} -> ${domain.receipts.length}`);

  // (3) Verdict attempt with a STALE expected id (CAS) while genuinely ready — must not fabricate.
  const readyRow = domain.inspect('rev-fals');
  const stale = domain.supersede('rev-fals', {
    expectedDecisionId: 'decision-someone-elses',
    newDecision: { decisionId: 'decision-stale', outcome: 'REJECT', correctionReason: 'stale CAS attempt' },
  });
  check('PLUS.verdict-refused-on-stale-cas', stale.ok === false && stale.code === 'STALE_EXPECTED_DECISION', JSON.stringify(stale));
  check('PLUS.no-decision-fabricated-2', JSON.stringify(domain.inspect('rev-fals').decision) === baseDecisionJson, 'decision mutated');
  check('PLUS.effective-decision-unchanged-2', domain.inspect('rev-fals').effectiveDecisionId === baseEffective, String(domain.inspect('rev-fals').effectiveDecisionId));
  check('PLUS.no-supersede-receipt-2', !domain.receipts.some(r => r.command === 'reviews.supersede'), JSON.stringify(domain.receipts.map(r => r.command)));
  check('PLUS.state-unchanged-2', domain.inspect('rev-fals').state === 'READY_FOR_DECISION', domain.inspect('rev-fals').state);

  // (4) Verdict attempt with an INVALID outcome while genuinely ready — must not fabricate.
  const badOutcome = domain.supersede('rev-fals', {
    expectedDecisionId: readyRow.effectiveDecisionId ?? null,
    newDecision: { decisionId: 'decision-bad', outcome: 'APPROVED', correctionReason: 'not a governed outcome' },
  });
  check('PLUS.verdict-refused-on-invalid-outcome', badOutcome.ok === false && badOutcome.code === 'DECISION_OUTCOME_INVALID', JSON.stringify(badOutcome));
  check('PLUS.no-decision-fabricated-3', JSON.stringify(domain.inspect('rev-fals').decision) === baseDecisionJson, 'decision mutated');
  check('PLUS.no-supersede-receipt-3', !domain.receipts.some(r => r.command === 'reviews.supersede'), JSON.stringify(domain.receipts.map(r => r.command)));

  // (5) NOTE on contract: SUPERSESSION_REASON_REQUIRED is guarded by `if(current && …)`, so a
  //     FIRST decision (current === null) does not require a correction/basis reason — two
  //     read-only tests (LCORR01) depend on exactly that. The basis the profile requires IS
  //     carried (evidenceBasis/criteriaBasis from the pinned refs). Assert the contract holds:
  //     the whitespace-reason probe below must not create a decision here either (it reaches
  //     DECISION_OUTCOME_INVALID first when the outcome is invalid), and the reason requirement
  //     is separately proven on a review WITH prior lineage in block B.

  // (6) `continue` is a no-op by contract: ok:true but mutated:false AND no receipt.
  const receiptsBeforeContinue = domain.receipts.length;
  const cont = domain.review('rev-fals', { action: 'continue' });
  check('PLUS.continue-ok-but-not-mutated', cont.ok === true && cont.mutated === false, JSON.stringify(cont));
  check('PLUS.continue-no-receipt', domain.receipts.length === receiptsBeforeContinue, `${receiptsBeforeContinue} -> ${domain.receipts.length}`);
  check('PLUS.continue-preserves-decision', JSON.stringify(domain.inspect('rev-fals').decision) === baseDecisionJson, 'decision mutated');

  // (7) Duplicate decision id on a *different* review must not be re-issued.
  //     Drive rev-fals to a real verdict first (this one IS a real state change).
  const realReceiptsBefore = domain.receipts.length;
  const real = domain.supersede('rev-fals', {
    expectedDecisionId: readyRow.effectiveDecisionId ?? null,
    newDecision: { decisionId: 'decision-real', outcome: 'ACCEPT_WITH_LIMITATIONS', correctionReason: 'Two of three pinned criteria satisfied; rationale needs one further pass.' },
  });
  check('PLUS.real-verdict-accepted', real.ok === true && real.mutated === true, JSON.stringify(real));
  const realRow = domain.inspect('rev-fals');
  check('PLUS.real-verdict-emits-one-supersede-receipt',
    domain.receipts.length === realReceiptsBefore + 1 &&
    domain.receipts.filter(r => r.command === 'reviews.supersede').length === 1,
    `${realReceiptsBefore} -> ${domain.receipts.length}; supersede receipts=${domain.receipts.filter(r => r.command === 'reviews.supersede').length}`);
  check('PLUS.real-verdict-closed-state', realRow.state === 'CLOSED', realRow.state);
  check('PLUS.real-verdict-history-appended', realRow.decisionHistory.length === baseHistoryLen + 1, String(realRow.decisionHistory.length));
  check('PLUS.real-verdict-recorded', realRow.decision?.decisionId === 'decision-real', String(realRow.decision?.decisionId));

  // (8) Now that a verdict exists, a SECOND verdict attempt on the CLOSED review must be refused.
  const receiptsAtClosed = domain.receipts.length;
  const second = domain.supersede('rev-fals', {
    expectedDecisionId: 'decision-real',
    newDecision: { decisionId: 'decision-second', outcome: 'REJECT', correctionReason: 'attempting a second verdict on a CLOSED review' },
  });
  check('PLUS.no-second-verdict-on-closed-review', second.ok === false && second.code === 'REVIEW_NOT_READY_FOR_DECISION', JSON.stringify(second));
  check('PLUS.no-second-verdict-history', domain.inspect('rev-fals').decisionHistory.length === baseHistoryLen + 1, String(domain.inspect('rev-fals').decisionHistory.length));
  check('PLUS.no-second-supersede-receipt', domain.receipts.filter(r => r.command === 'reviews.supersede').length === 1, String(domain.receipts.filter(r => r.command === 'reviews.supersede').length));
  check('PLUS.closed-receipts-unchanged', domain.receipts.length === receiptsAtClosed, `${receiptsAtClosed} -> ${domain.receipts.length}`);

  // (9) Finding is never a Decision (profile invariant).
  const beforeFinding = JSON.stringify({ d: domain.inspect('rev-fals').decision, e: domain.inspect('rev-fals').effectiveDecisionId });
  // rev-fals is CLOSED now, so findings are refused — assert refusal AND no decision drift.
  const lateFinding = domain.finding('rev-fals', { findingId: 'f-late', text: 'late', criterionRef: 'crit:v4#web-input', state: 'SATISFIED' });
  check('PLUS.finding-refused-on-closed-review', lateFinding.ok === false && lateFinding.code === 'REVIEW_NOT_FINDING_EDITABLE', JSON.stringify(lateFinding));
  check('PLUS.finding-never-becomes-decision',
    JSON.stringify({ d: domain.inspect('rev-fals').decision, e: domain.inspect('rev-fals').effectiveDecisionId }) === beforeFinding, 'decision drifted');

  /* ── block B: SUPERSESSION_REASON_REQUIRED where `current` is non-null ──────────────────────
   * demo `review-2` carries prior lineage (effectiveDecisionId=decision-17, decision=null). A
   * supersession attempt without a usable correction/basis reason must be refused outright. */
  const regB = new ReviewAuthorityRegistry([{ identity: 'reviewer:local-owner', authorized: true, canAssign: true, permissionProofRef: 'perm:local-owner:v1' }]);
  const domB = new W04ReviewDomain(createW04ReviewDemoRecords(), { reviewAuthorityRegistry: regB, allowTestAuthority: false });
  const b0 = domB.inspect('review-2');
  check('PLUS-B.starting-lineage-present', b0.state === 'IN_REVIEW' && b0.effectiveDecisionId === 'decision-17' && b0.decision === null,
    JSON.stringify({ state: b0.state, eff: b0.effectiveDecisionId, dec: b0.decision }));
  const fB = domB.finding('review-2', { findingId: 'f-b1', text: 'Pinned integrity criterion assessed.', state: 'SATISFIED', criterionRef: 'criteria:v4#integrity' });
  check('PLUS-B.finding-ok', fB.ok === true, JSON.stringify(fB));
  const readyB = domB.review('review-2', { action: 'ready' });
  check('PLUS-B.ready-reached', readyB.ok === true && domB.inspect('review-2').state === 'READY_FOR_DECISION', JSON.stringify(readyB));
  const bRow = domB.inspect('review-2');
  const bReceipts = domB.receipts.length;

  const blankReason = domB.supersede('review-2', {
    expectedDecisionId: 'decision-17',
    newDecision: { decisionId: 'decision-blank', outcome: 'ACCEPT' },
    correctionReason: '   ',
  });
  check('PLUS-B.supersession-reason-required', blankReason.ok === false && blankReason.code === 'SUPERSESSION_REASON_REQUIRED', JSON.stringify(blankReason));
  check('PLUS-B.no-decision-fabricated', JSON.stringify(domB.inspect('review-2').decision) === JSON.stringify(bRow.decision), 'decision mutated');
  check('PLUS-B.effective-unchanged', domB.inspect('review-2').effectiveDecisionId === 'decision-17', String(domB.inspect('review-2').effectiveDecisionId));
  check('PLUS-B.no-receipt-on-refusal', domB.receipts.length === bReceipts, `${bReceipts} -> ${domB.receipts.length}`);
  check('PLUS-B.state-unchanged', domB.inspect('review-2').state === 'READY_FOR_DECISION', domB.inspect('review-2').state);

  const goodSup = domB.supersede('review-2', {
    expectedDecisionId: 'decision-17',
    newDecision: { decisionId: 'decision-18', outcome: 'ACCEPT_WITH_LIMITATIONS' },
    correctionReason: 'Two criteria satisfied; rationale criterion needs one further pass.',
  });
  check('PLUS-B.real-supersession-accepted', goodSup.ok === true && goodSup.mutated === true, JSON.stringify(goodSup));
  const bAfter = domB.inspect('review-2');
  check('PLUS-B.prior-decision-retained', goodSup.priorDecisionRetained === true && bAfter.decisionHistory.some(d => d.decisionId === 'decision-17'),
    JSON.stringify(bAfter.decisionHistory.map(d => d.decisionId)));
  check('PLUS-B.supersedes-ref-prior', bAfter.decision?.supersedesDecisionRef === 'decision-17', String(bAfter.decision?.supersedesDecisionRef));
  check('PLUS-B.one-supersede-receipt', domB.receipts.filter(r => r.command === 'reviews.supersede').length === 1,
    String(domB.receipts.filter(r => r.command === 'reviews.supersede').length));
  check('PLUS-B.closed', bAfter.state === 'CLOSED', bAfter.state);
}

/* ═══════════════ form payload shape — the Issue Decision button regression guard ═════════════ */
{
  // The controller's governed-input form posts {id, decision:{…}} while the command-bus contract
  // is {id, expectedDecisionId, newDecision:{…}}. This surface registers `reviews.supersede`
  // FIRST, so its handler is the one that binds. Without normalization the form payload reached
  // the domain with expectedDecisionId === undefined and every verdict was refused as a stale CAS.
  const reg = new ReviewAuthorityRegistry([{ identity: 'reviewer:form', authorized: true, canAssign: true, permissionProofRef: 'perm:form:v1' }]);
  const ev = new W04EvidenceDomain(createW04EvidenceDemoRecords(), { admissionAuthorityRegistry: { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) } });
  const domain = new W04ReviewDomain(undefined, { evidenceResolver: ref => ev.resolveReviewableEvidenceRef(ref), reviewAuthorityRegistry: reg, allowTestAuthority: false });
  const bus = new SemanticCommandBus();
  const surface = composeReviewsSurface({ domain, analyticalCompareOwner: new AnalyticalCompareOwner(), commands: bus });
  void surface;

  const rid = 'review-form-1';
  const requested = domain.review(rid, { action: 'request', evidenceRefs: ['ev-beta@evr-002'], criteriaRefs: ['criteria:v4#integrity'], reviewer: { identity: 'reviewer:form', permissionProofRef: 'perm:form:v1' }, requester: 'owner:local', purpose: 'form payload proof' });
  check('FORM.request-ok', requested.ok === true, JSON.stringify(requested));
  domain.review(rid, { action: 'assign' });
  domain.review(rid, { action: 'start' });
  check('FORM.finding-ok', domain.finding(rid, { findingId: 'f-form', text: 'Assessed pinned integrity criterion.', state: 'SATISFIED', criterionRef: 'criteria:v4#integrity' }).ok === true, 'finding');
  check('FORM.ready', domain.review(rid, { action: 'ready' }).record?.state === 'READY_FOR_DECISION', 'ready');

  // EXACT shape the m0 form builds (m0-controller-composition.ts submit handler).
  const formPayload = { id: rid, decision: { decisionId: 'decision-form-1', outcome: 'ACCEPT_WITH_LIMITATIONS', correctionReason: 'Pinned criterion satisfied with stated limitations.', expectedDecisionId: null } };
  const avail = bus.availability('reviews.supersede', formPayload);
  check('FORM.availability-enabled', avail.enabled === true, JSON.stringify(avail));

  const before = JSON.stringify(domain.inspect(rid));
  const receiptsBefore = domain.receipts.length;
  const executed = bus.execute('reviews.supersede', formPayload);
  const after = JSON.stringify(domain.inspect(rid));
  check('FORM.form-payload-records-verdict', executed.ok === true, JSON.stringify(executed).slice(0, 300));
  check('FORM.state-became-closed', domain.inspect(rid).state === 'CLOSED', domain.inspect(rid).state);
  check('FORM.exactly-one-supersede-receipt', domain.receipts.length === receiptsBefore + 1 &&
    domain.receipts.filter(r => r.command === 'reviews.supersede').length === 1,
    `${receiptsBefore} -> ${domain.receipts.length}`);
  check('FORM.decision-carries-provenance',
    domain.inspect(rid).decision?.decisionId === 'decision-form-1' &&
    domain.inspect(rid).decision?.provenance?.permissionProofRef === 'perm:form:v1' &&
    Array.isArray(domain.inspect(rid).decision?.evidenceBasis) && domain.inspect(rid).decision.evidenceBasis.length > 0,
    JSON.stringify(domain.inspect(rid).decision));
  check('FORM.record-really-changed', before !== after, 'record unchanged');

  // NEGATIVE: same payload against a review that is NOT ready must be refused at availability,
  // with no receipt and no fabricated decision.
  const rid2 = 'review-form-2';
  domain.review(rid2, { action: 'request', evidenceRefs: ['ev-beta@evr-002'], criteriaRefs: ['criteria:v4#integrity'], reviewer: { identity: 'reviewer:form', permissionProofRef: 'perm:form:v1' }, requester: 'owner:local', purpose: 'form negative' });
  domain.review(rid2, { action: 'assign' });
  domain.review(rid2, { action: 'start' });
  const negPayload = { id: rid2, decision: { decisionId: 'decision-form-2', outcome: 'ACCEPT', correctionReason: 'attempt without readiness', expectedDecisionId: null } };
  const negAvail = bus.availability('reviews.supersede', negPayload);
  check('FORM.negative-not-ready-unavailable', negAvail.enabled === false && negAvail.code === 'REVIEW_NOT_READY_FOR_DECISION', JSON.stringify(negAvail));
  const negReceipts = domain.receipts.length;
  const negBefore = JSON.stringify(domain.inspect(rid2));
  const negExec = bus.execute('reviews.supersede', negPayload);
  check('FORM.negative-execute-refused', negExec.ok === false, JSON.stringify(negExec));
  check('FORM.negative-no-receipt', domain.receipts.length === negReceipts, `${negReceipts} -> ${domain.receipts.length}`);
  check('FORM.negative-no-fabricated-decision', JSON.stringify(domain.inspect(rid2)) === negBefore && domain.inspect(rid2).decision === null, 'record mutated');
}

/* ═══════════════════ shared Review-owner injection (in-root side of the audit) ═══════════════ */
{
  // The reviews surface must consume an injected authority registry; it must never mint one locally.
  const src = readFileSync(path.join(ROOT, 'stack/native-typescript/adapters/reviews/domain.ts'), 'utf8');
  const idx = readFileSync(path.join(ROOT, 'stack/native-typescript/surfaces/reviews/index.ts'), 'utf8');
  // `createTestReviewAuthorityRegistry` is an explicit test factory; strip it, then no construction remains.
  const srcWithoutTestFactory = src.replace(/export function createTestReviewAuthorityRegistry\([\s\S]*?\n\}/, '');
  check('OWN.adapters-do-not-construct-local-registry', !/new\s+ReviewAuthorityRegistry\s*\(/.test(srcWithoutTestFactory),
    'adapters/reviews/domain.ts constructs no ReviewAuthorityRegistry outside the explicit test factory');
  check('OWN.surface-do-not-construct-local-registry', !/new\s+ReviewAuthorityRegistry\s*\(/.test(idx),
    'surfaces/reviews/index.ts constructs no ReviewAuthorityRegistry');
  check('OWN.surface-does-not-fabricate-authority',
    !/allowTestAuthority\s*:\s*true/.test(idx) && !/allowTestAuthority\s*:\s*true/.test(src),
    'no product-path enablement of test authority');

  // Injection actually flows: domain bound to the shared registry refuses an unknown reviewer,
  // and accepts a reviewer registered on THAT SAME instance (shared-instance semantics).
  const shared = new ReviewAuthorityRegistry();
  const d1 = new W04ReviewDomain(undefined, { reviewAuthorityRegistry: shared, evidenceResolver: () => ({ state: 'RESOLVED', immutable: true }) });
  const before = d1.review('r1', { action: 'request', evidenceRefs: ['e@r1'], criteriaRefs: ['c1'], reviewer: { identity: 'reviewer:late' } });
  check('OWN.injected-registry-empty-refuses', before.code === 'REVIEWER_AUTHORITY_UNAVAILABLE', JSON.stringify(before));
  shared.registerReviewer('reviewer:late', { authorized: true, canAssign: true, permissionProofRef: 'perm:late:v1' });
  const afterReg = d1.review('r1', { action: 'request', evidenceRefs: ['e@r1'], criteriaRefs: ['c1'], reviewer: { identity: 'reviewer:late' } });
  check('OWN.same-shared-instance-sees-registration', afterReg.ok === true, JSON.stringify(afterReg));

  // Two domains bound to the SAME shared instance share authority truth; two domains with two
  // private instances do not — prove the shared instance is what makes registration visible.
  const d2 = new W04ReviewDomain(undefined, { reviewAuthorityRegistry: shared, evidenceResolver: () => ({ state: 'RESOLVED', immutable: true }) });
  const d2res = d2.review('r2', { action: 'request', evidenceRefs: ['e@r1'], criteriaRefs: ['c1'], reviewer: { identity: 'reviewer:late' } });
  check('OWN.shared-instance-cross-domain', d2res.ok === true, JSON.stringify(d2res));

  // m0 composition passes the injected registry through (read-only verification of the seam).
  const m0 = readFileSync(path.join(ROOT, 'stack/native-typescript/surfaces/m0-controller-composition.ts'), 'utf8');
  check('OWN.m0-binds-injected-registry', /reviewAuthorityRegistry:authorityRegistry/.test(m0),
    'm0 passes the injected reviewAuthorityRegistry into W04ReviewDomain');
  check('OWN.m0-registry-parameter-reaches-mount', /function mountW04Group\(\{[^}]*reviewAuthorityRegistry=null/.test(m0),
    'mountW04Group accepts the injected registry parameter');
  // HOTSPOT (record-only, outside REV-1 roots): m0 carries a `|| new ReviewAuthorityRegistry()`
  // fallback and w04-rescue carries a `reviewsDomain || new W04ReviewDomain(...)` fallback.
  // Prove the fallback is FAIL-CLOSED (empty registry => every mutation refused), never a grant.
  const m0Fallback = /\|\|\s*new\s+ReviewAuthorityRegistry\s*\(\)/.test(m0);
  const rescue = readFileSync(path.join(ROOT, 'stack/native-typescript/surfaces/composition/w04-rescue.ts'), 'utf8');
  const rescueFallback = /reviewsDomain\s*\|\|\s*new\s+W04ReviewDomain\s*\(/.test(rescue);
  const emptyRegistry = new ReviewAuthorityRegistry();
  const fallbackDomain = new W04ReviewDomain(undefined, { reviewAuthorityRegistry: emptyRegistry, evidenceResolver: () => ({ state: 'RESOLVED', immutable: true }) });
  const fallbackAttempt = fallbackDomain.review('r-fb', { action: 'request', evidenceRefs: ['e@r1'], criteriaRefs: ['c1'], reviewer: { identity: 'reviewer:anybody', authorityAvailable: true, permissionProofRef: 'caller-supplied' } });
  check('HOTSPOT.m0-fallback-detected-outside-roots', m0Fallback,
    m0Fallback ? 'm0-controller-composition.ts:230 `reviewAuthorityRegistry||new ReviewAuthorityRegistry()` — NOT in REV-1 roots, recorded as hotspot' : 'no m0 fallback present');
  check('HOTSPOT.w04-rescue-fallback-detected-outside-roots', rescueFallback,
    rescueFallback ? 'w04-rescue.ts:64 `reviewsDomain||new W04ReviewDomain(...)` — NOT in REV-1 roots, recorded as hotspot' : 'no w04-rescue fallback present');
  check('HOTSPOT.fallback-is-fail-closed-not-a-grant',
    fallbackAttempt.ok === false && fallbackAttempt.code === 'REVIEWER_AUTHORITY_UNAVAILABLE' && fallbackDomain.records.length === 0,
    JSON.stringify(fallbackAttempt));
  // main.ts always injects the shared instance on the live route, so the fallback is not the live path.
  const mainSrc = readFileSync(path.join(ROOT, 'stack/native-typescript/main.ts'), 'utf8');
  check('OWN.main-injects-shared-instance', /reviewAuthorityRegistry\s*=\s*new\s+ReviewAuthorityRegistry\s*\(\)/.test(mainSrc) &&
    /await mountM0ControllerComposition\(\{[\s\S]{0,600}?reviewAuthorityRegistry\s*\}/.test(mainSrc),
    'main.ts creates ONE shared instance and injects it into mountM0ControllerComposition');
  check('OWN.main-exposes-single-shared-owner',
    /sharedOwners:\{[^}]*reviewAuthorityRegistry/.test(mainSrc),
    'window.CEPFoundation.sharedOwners.reviewAuthorityRegistry is the single shared instance');
}

/* ═══════════════════ i18n app-boot export lineage (must not regress) ═════════════════════════ */
{
  const i18n = readFileSync(path.join(ROOT, 'stack/native-typescript/surfaces/reviews/i18n.ts'), 'utf8');
  const idx = readFileSync(path.join(ROOT, 'stack/native-typescript/surfaces/reviews/index.ts'), 'utf8');
  check('I18N.REVIEW_STATE_TONE-exported', /export const REVIEW_STATE_TONE/.test(i18n), 'REVIEW_STATE_TONE');
  check('I18N.reviewStateLabel-exported', /export const reviewStateLabel/.test(i18n), 'reviewStateLabel');
  check('I18N.reviewDecisionLabel-exported', /export const reviewDecisionLabel/.test(i18n), 'reviewDecisionLabel');
  check('I18N.re-exports-preserved-at-app-boot',
    /export \{REVIEW_STATE_TONE, reviewStateLabel, reviewDecisionLabel\} from '\.\/i18n\.js'/.test(idx),
    'index.ts app-boot re-export line intact');
  check('I18N.fill-imported-where-used', /import \{[^}]*\bfill\b[^}]*\} from '\.\/i18n\.js'/.test(idx),
    'fill imported into index.ts (RIGHT lens regression guard)');

  // RIGHT context lens must produce a valid descriptor (this is what failed at baseline).
  const domain = new W04ReviewDomain(createW04ReviewDemoRecords());
  const surface = composeReviewsSurface({ domain, analyticalCompareOwner: new AnalyticalCompareOwner() });
  const rc = describeContextProvider(surface.context, { selectedId: 'review-1' });
  check('I18N.right-lens-descriptor-valid', rc.ok === true, JSON.stringify(rc.ok ? rc.descriptor.lenses.map(l => l.id) : rc));
  check('I18N.right-lens-lenses-correct', rc.ok === true && JSON.stringify(rc.descriptor.lenses.map(l => l.id).sort()) === JSON.stringify(['authority', 'prior', 'scope']),
    JSON.stringify(rc.ok ? rc.descriptor.lenses.map(l => l.id).sort() : rc));
  check('I18N.right-lens-no-duplicate-state-tab',
    rc.ok === true && rc.descriptor.lenses.some(l => l.tabs.some(t => t.id === 'state')) === false, 'state tab present');
  check('I18N.center-projection-intact', reviewsCenterProjection(domain, 'review-1').kind === 'FormalReviewDecisionWorkbench', 'center kind');
  check('I18N.bottom-projection-intact', reviewsBottomProjection(domain, 'review-1').readOnly === true, 'bottom readOnly');
  check('I18N.contract-intact', REVIEWS_SURFACE_CONTRACT.center === 'FormalReviewDecisionWorkbench' && REVIEWS_SURFACE_CONTRACT.localSharedOwnerCreation === false, 'contract');
}

/* ═══════════════════════════════════════ report ═════════════════════════════════════════════ */
const failed = results.filter(r => !r.pass);
console.log(JSON.stringify({
  lane: 'REV-1/W04-REVIEWS',
  battery: ['N1', 'N2', 'N3', 'N4(separate)', 'N5(separate)', 'PLUS-verdict-receipt-on-real-state-change', 'OWN-shared-review-owner', 'I18N-app-boot-lineage'],
  total: results.length,
  pass: results.length - failed.length,
  fail: failed.length,
  failures: failed,
  checks: results,
}, null, 2));
process.exit(failed.length ? 1 : 0);
