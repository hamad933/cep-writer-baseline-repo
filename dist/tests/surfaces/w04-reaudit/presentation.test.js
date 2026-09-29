import assert from 'node:assert/strict';
import {W04EvidenceDomain} from '../../../adapters/evidence/domain.js';
import {W04ReviewDomain,REVIEW_FINDING_OUTCOMES} from '../../../adapters/reviews/domain.js';
import {W04MasteryDomain,createW04MasteryDemoRecords} from '../../../adapters/mastery/domain.js';
import {W04PortfolioDomain,createW04PortfolioDemoRecords} from '../../../adapters/portfolio/domain.js';
import {describeEvidenceRecord,describeEvidenceEmpty} from '../../../surfaces/evidence/presentation.js';
import {describeReviewsRecord,describeReviewsEmpty} from '../../../surfaces/reviews/presentation.js';
import {describeMasteryRecord,describeMasteryEmpty} from '../../../surfaces/mastery/presentation.js';
import {describePortfolioRecord,describePortfolioEmpty} from '../../../surfaces/portfolio/presentation.js';

/**
 * W04 visual re-audit (governance §8 R1): the four CENTER record compositions are declared as
 * data here and projected by ONE renderer in `surfaces/composition/w04-rescue.ts`.
 *
 * These assertions pin the D10 reference structure, the D9 state affordance, M1/M2 (mastery
 * epistemic state + fixture labelling), P2 (legible pending grouping authority) and the
 * ONE-INFORMATION-ITEM-ONE-LOCATION split between CENTER and RIGHT.
 */

const SUPPORTED_KINDS = new Set(['track', 'rows', 'grid', 'cards', 'table', 'prose', 'notice', 'steps', 'split']);
const SUPPORTED_CELL_TONES = new Set(['success', 'warning', 'danger', 'info', 'link', 'muted', 'neutral', undefined]);

const ids = spec => (spec.blocks || []).map(block => block.id || block.kind);
const find = (spec, id) => (spec.blocks || []).find(block => (block.id || block.kind) === id);
const walk = (spec, visit) => {
  const visitBlock = block => {
    if (!block) return;
    visit(block);
    if (block.kind === 'split') { visitBlock(block.left); visitBlock(block.right); }
    if (block.kind === 'steps') (block.items || []).forEach(item => visitBlock(item.body));
  };
  (spec.blocks || []).forEach(visitBlock);
};

function assertWellFormed(spec, label) {
  assert.ok(spec.key && spec.key.length, `${label}: a composition key is required for idempotent rendering`);
  assert.ok(spec.header && Array.isArray(spec.header.pills) && spec.header.pills.length, `${label}: status pills are required`);
  walk(spec, block => {
    assert.ok(SUPPORTED_KINDS.has(block.kind), `${label}: unknown block kind ${String(block.kind)} — it would render as nothing`);
    if (block.kind === 'rows') (block.rows || []).forEach(row => {
      assert.ok(typeof row.label === 'string' && row.label, `${label}: a row without a label`);
      assert.ok(typeof row.value === 'string', `${label}: row ${row.label} must render as text`);
      assert.ok(SUPPORTED_CELL_TONES.has(row.tone), `${label}: unknown row tone ${String(row.tone)}`);
    });
    if (block.kind === 'grid') (block.cells || []).forEach(cell => assert.ok(SUPPORTED_CELL_TONES.has(cell.tone), `${label}: unknown grid tone ${String(cell.tone)}`));
    if (block.kind === 'notice') assert.ok(block.body && block.body.length > 40, `${label}: notice needs a real body`);
    if (block.kind === 'table') assert.ok((block.columns || []).length && (block.rows || []).length, `${label}: empty findings table`);
    if (block.kind === 'steps') assert.ok((block.items || []).length === 5, `${label}: the reference explainability structure is exactly 5 steps`);
    if (block.kind === 'track') {
      assert.ok((block.steps || []).length >= 4, `${label}: lifecycle track needs every governed step`);
      assert.ok((block.next || []).length >= 2, `${label}: D9 requires "what can happen next"`);
    }
  });
}

/* ------------------------------------------------------------------ fixtures */

const evidence = new W04EvidenceDomain(undefined, {
  admissionAuthorityRegistry: { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) }
});
assert.equal(evidence.records.length, 0, 'the default Evidence domain must stay EMPTY (normal-defaults-empty)');
assert.equal(evidence.importEvidence({
  id: 'ev-unit', revisionId: 'ev-unit-r1', title: 'Unit Evidence', sourceId: 'unit-source', sourceRevision: 'r1',
  subject: 'owner:local', evidenceClaim: 'Unit claim', criterionRefs: ['criteria:v4#integrity'],
  governedPurpose: 'W04 presentation unit test', verification: { status: 'UNVERIFIED' }
}).ok, true);
evidence.submitCandidate('ev-unit');
// admitted through the REAL domain rules, so the Review pins an admitted immutable revision
assert.equal(evidence.verifySource('ev-unit', {
  status: 'VERIFIED', providerId: 'provider:unit', providerRevision: '1.0.0', proofId: 'proof:unit',
  digest: 'sha256:' + '1'.repeat(64), schemaValid: true, sourceBytesAvailable: true
}).ok, true);
evidence.markCandidateValidated('ev-unit', { validator: 'unit', validationProofRef: 'proof:intake:unit' });
evidence.setAdmissionAuthority('ev-unit', true, 'authority:evidence-admission:unit', { testOnly: false });
assert.equal(evidence.admit('ev-unit').ok, true, 'fixture admission must pass the real gates');
assert.equal(evidence.inspect('ev-unit').status, 'ADMITTED');

const reviews = new W04ReviewDomain(undefined, {
  allowTestAuthority: true,
  evidenceResolver: ref => evidence.resolveReviewableEvidenceRef(ref)
});
assert.equal(reviews.records.length, 0, 'the default Review domain must stay EMPTY');
assert.ok(REVIEW_FINDING_OUTCOMES.includes('SATISFIED'));
assert.equal(reviews.review('rv-unit', {
  action: 'request',
  evidenceRefs: ['ev-unit@ev-unit-r1'],
  criteriaRefs: ['criteria:v4#integrity'],
  reviewer: { identity: 'reviewer:unit', permissionProofRef: 'perm:unit', authorityAvailable: true, assignmentPermissionAvailable: true }
}).ok, true, 'a Review must be requestable against admitted immutable Evidence');
reviews.review('rv-unit', { action: 'assign' });
reviews.review('rv-unit', { action: 'start' });
assert.equal(reviews.finding('rv-unit', { findingId: 'f-unit', text: 'Digest verified.', state: 'SATISFIED', criterionRef: 'criteria:v4#integrity', scopeDisposition: 'IN_SCOPE' }).ok, true);

const mastery = new W04MasteryDomain();
assert.equal(mastery.records.length, 0, 'the default Mastery domain must stay EMPTY');
const masteryFixture = new W04MasteryDomain(createW04MasteryDemoRecords());
assert.ok(masteryFixture.records.every(row => row.truthClass === 'SYNTHETIC_DEMO_SEED'));

const portfolio = new W04PortfolioDomain(undefined, { sourceResolver: { inspect: ref => evidence.findRevision(String(ref).split('@')[0], String(ref).split('@')[1]) ? { digest: 'sha256:' + '2'.repeat(64), rowCount: 1 } : null } });
assert.equal(portfolio.records.length, 0, 'the default Portfolio domain must stay EMPTY');
assert.equal(portfolio.curate({ action: 'add', member: { id: 'pm-unit', revisionId: 'pm-unit-r1', refType: 'Evidence', sourceRef: 'ev-unit@ev-unit-r1', title: 'Unit reference' } }).ok, true);

/* ------------------------------------------------------------------ D10 · evidence */

const evEmpty = describeEvidenceEmpty();
assertWellFormed(evEmpty, 'evidence/empty');
assert.equal(evEmpty.empty, true);
assert.equal(ids(evEmpty).includes('intake'), true, 'D9: the empty state still shows the lifecycle track');

// a second, still-CANDIDATE record proves the candidate-state pill; ev-unit proves the lifecycle pill
assert.equal(evidence.importEvidence({
  id: 'ev-cand', revisionId: 'ev-cand-r1', title: 'Unit Candidate', sourceId: 'unit-source', sourceRevision: 'r1',
  subject: 'owner:local', evidenceClaim: 'Unit candidate claim', criterionRefs: ['criteria:v4#integrity'],
  governedPurpose: 'W04 presentation unit test', verification: { status: 'UNVERIFIED' }
}).ok, true);
evidence.submitCandidate('ev-cand');
const evCandidate = describeEvidenceRecord(evidence, 'ev-cand');
assertWellFormed(evCandidate, 'evidence/candidate');
assert.equal(evCandidate.header.pills.some(pill => pill.label === 'Candidate state' && pill.value === 'SUBMITTED_FOR_INTAKE'), true, 'D9: the state pill shows the governed candidate state');

const ev = describeEvidenceRecord(evidence, 'ev-unit');
assertWellFormed(ev, 'evidence/record');
assert.equal(ids(ev).includes('source-handoff'), true, 'D10: Source Handoff section');
assert.equal(ids(ev).includes('supporting-references'), true, 'D10: Selected Supporting References');
assert.equal(find(ev, 'source-handoff').title, 'Source Handoff');
assert.equal(find(ev, 'supporting-references').title, 'Selected Supporting References');
assert.equal(ev.header.pills.some(pill => pill.label === 'Evidence lifecycle' && pill.value === 'ACTIVE'), true, 'D9: admitted Evidence shows its lifecycle as the state pill');
assert.equal(ids(ev).includes('review-projection'), false, 'ONE LOCATION: lifecycle/review status are the pill, not a second CENTER block');
assert.equal(JSON.stringify(ev).includes('None — first revision'), false, 'lineage belongs to the RIGHT context lens, not CENTER');

/* ------------------------------------------------------------------ D10 · reviews */

const rvEmpty = describeReviewsEmpty();
assertWellFormed(rvEmpty, 'reviews/empty');

const rv = describeReviewsRecord(reviews, 'rv-unit', { claimResolver: () => ({ claim: 'Unit claim', subject: 'owner:local', criterionRefs: 'criteria:v4#integrity' }) });
assertWellFormed(rv, 'reviews/record');
const split = find(rv, 'criteria');
assert.equal(split && split.kind, 'split', 'D10: Criterion References and Criterion Findings sit side by side');
assert.equal(split.right.kind, 'table', 'D10: Criterion Findings is a table');
assert.equal(split.right.title, 'Criterion Findings');
assert.equal(split.right.columns.length, 3, 'the reference table has exactly three columns');
assert.equal(ids(rv).includes('rationale'), true, 'D10: Reviewer Rationale');
assert.equal(ids(rv).includes('decision-preparation'), true, 'D10: Decision Preparation');
assert.equal(find(rv, 'decision-preparation').dashed, true, 'the reference shows a dashed "not yet issued" box');
assert.equal(ids(rv).includes('authority'), false, 'ONE LOCATION: reviewer authority lives in the RIGHT context lens');
assert.equal(rv.header.pills.some(pill => pill.label === 'Review workflow' && pill.value === 'IN_REVIEW'), true, 'D9: workflow pill');

reviews.review('rv-unit', { action: 'ready' });
const rvReady = describeReviewsRecord(reviews, 'rv-unit', { claimResolver: null });
assert.equal(rvReady.key !== rv.key, true, 'a state transition must change the composition key (byte-distinct states)');
assert.equal(rvReady.header.pills.some(pill => pill.value === 'READY_FOR_DECISION'), true);

/* ------------------------------------------------------------------ M1 · mastery */

const msEmpty = describeMasteryEmpty();
assertWellFormed(msEmpty, 'mastery/empty');
assert.equal(msEmpty.header.pills.some(pill => pill.label === 'Mastery Judgment' && pill.value === 'NOT_EVALUATED'), true, 'M1: NOT_EVALUATED is the authoritative pill, never a bare EMPTY token');
assert.equal(msEmpty.blocks.some(block => block.kind === 'notice' && block.title.includes('NOT_EVALUATED')), true, 'M1: the empty state explains the epistemic state');
assert.equal(msEmpty.blocks.some(block => block.kind === 'steps'), false, 'no explainability structure exists without a Mastery State');

/* ------------------------------------------------------------------ M2 · mastery fixture */

const ms = describeMasteryRecord(masteryFixture, masteryFixture.records[0].id);
assertWellFormed(ms, 'mastery/record');
const notice = ms.blocks[0];
assert.equal(notice.kind, 'notice', 'M2: the first block must be the fixture notice (kind must be declared or it renders as nothing)');
assert.equal(notice.title.includes('SYNTHETIC_DEMO_SEED'), true, 'M2: fixture provenance is visible');
assert.equal(notice.body.includes('not a real consumer achievement'), true, 'M2: a fixture result must never read as real consumer mastery');
assert.equal(ms.header.pills.some(pill => pill.label === 'Mastery Judgment' && pill.badge === 'FIXTURE'), true, 'M2: FIXTURE badge on the judgment pill');
assert.equal(find(ms, 'explainability').items.length === 5, true, 'D10: the numbered 5-step explainability structure');
assert.equal(ms.header.pills.some(pill => pill.label === 'Freshness Status' && pill.value === 'REVALIDATION_REQUIRED'), true, 'D10: both status pills');

/* ------------------------------------------------------------------ P2 · portfolio */

const pfEmpty = describePortfolioEmpty();
assertWellFormed(pfEmpty, 'portfolio/empty');
assert.equal(pfEmpty.blocks[0].kind, 'notice', 'P2: pending authority is the first thing the surface says');
assert.equal(pfEmpty.blocks[0].title.includes('AUTHORITY_DECISION_REQUIRED'), true);
assert.equal(pfEmpty.blocks[0].body.includes('Q-5'), true, 'P2: the open Owner question is named');

const pf = describePortfolioRecord(portfolio, 'pm-unit');
assertWellFormed(pf, 'portfolio/record');
assert.equal(pf.blocks.some(block => block.kind === 'notice' && block.body.includes('Q-5')), true, 'P2');
assert.equal(ids(pf).includes('source-integrity'), true, 'D10: canonical source integrity');
assert.equal((pf.blocks || []).some(block => block.kind === 'steps'), false, 'Q-5: no grouping/capability structure may be reconstructed');
assert.equal(JSON.stringify(pf).toLowerCase().includes('capability group'), false, 'Q-5: capability groups are the unresolved grouping authority');
assert.equal(pf.header.pills.some(pill => pill.label === 'Grouping' && pill.value.includes('AUTHORITY DECISION REQUIRED')), true, 'P2: grouping authority is a visible state');

console.log(JSON.stringify({
  pass: true,
  surface: 'w04-presentation',
  compositions: ['evidence', 'reviews', 'mastery', 'portfolio'],
  supportedBlockKinds: [...SUPPORTED_KINDS],
  defectCoverage: ['D9', 'D10', 'M1', 'M2', 'P2', 'Q-5'],
  defaultDomainsEmpty: true
}));
