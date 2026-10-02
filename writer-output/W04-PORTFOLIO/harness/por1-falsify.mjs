/**
 * POR-1 (W04-PORTFOLIO) — falsification battery.
 *
 * N1  non-owned-route mutation attempt  → must refuse        (por1-write-guard.mjs --self-test)
 * N2  boundary/invalid input            → no corruption / no false receipt
 * N3  act without prerequisite data/provider → unavailable, never fabricated
 * N5  suite run twice                   → identical (run separately: npm test ×2)
 * L1  exported portfolio payload hash-matches canonical sources (no synthetic content)
 * Q-5 grouping authority stays an Owner question → refusal preserved (never decided here)
 *
 * This file executes N2, N3, L1 and the Q-5 preservation probe and writes
 * writer-output/W04-PORTFOLIO/evidence/falsification/FALSIFICATION.json
 *
 * Usage: node writer-output/W04-PORTFOLIO/harness/por1-falsify.mjs
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../../../', import.meta.url));
const outDir = path.join(root, 'writer-output/W04-PORTFOLIO/evidence/falsification');
const git = c => { try { return String(execSync(c, { cwd: root, encoding: 'utf8' })).trim(); } catch { return ''; } };
const sha = value => createHash('sha256').update(value).digest('hex');

const results = [];
const record = (id, ok, detail) => { results.push({ id, ok: !!ok, detail }); return !!ok; };
const snapshotOf = domain => JSON.stringify({
  records: domain.records, receipts: domain.receipts, filterText: domain.filterText, seq: domain.seq
});

/* ─────────────────────────────── N2 / N3 — domain boundary (Node) ─────────────────────────────── */

const { W04PortfolioDomain, createW04PortfolioDemoRecords } = await import(path.join(root, 'dist/adapters/portfolio/domain.js'));
const { describePortfolioRecord, describePortfolioEmpty } = await import(path.join(root, 'dist/surfaces/portfolio/presentation.js'));

// Canonical source registry — the same fixture shape the S15 packet test uses (demo refs) plus
// this lane's canonical ref. ONE store backs both the domain resolver and the hash-match check,
// so a RESOLVABLE member can never be compared against a registry it was not derived from.
const canonicalStore = new Map([
  ['ev-beta@evr-002', { digest: 'sha256:evidence-beta', rowCount: 1 }],
  ['mastery-crypto@mr-001', { digest: 'sha256:mastery-crypto', rowCount: 1 }],
  ['ev-canonical@evr-001', { digest: 'sha256:' + 'ab'.repeat(32), rowCount: 17 }]
]);
const domain = new W04PortfolioDomain(createW04PortfolioDemoRecords(), {
  sourceResolver: { inspect: ref => canonicalStore.has(ref) ? { ...canonicalStore.get(ref) } : null }
});

// seed two legitimate memberships FIRST — every later invalid op must leave this state untouched
domain.curate({ action: 'add', member: { id: 'member-canonical', revisionId: 'pm-canonical', refType: 'Evidence', sourceRef: 'ev-canonical@evr-001', title: 'Canonical reference' } });
const before = snapshotOf(domain);
const receiptsBefore = domain.receipts.length;

const expectRefusal = (id, fn, expectedCode) => {
  let out;
  try { out = fn(); } catch (error) { out = { threw: String(error?.message || error) }; }
  const code = out?.code ?? (out?.threw ? 'THREW' : null);
  const ok = out?.ok !== true && out?.mutated !== true && (expectedCode ? code === expectedCode : !!code);
  record(id, ok, { code, expected: expectedCode, mutated: out?.mutated ?? null, ok: out?.ok ?? null, threw: out?.threw ?? null });
};

expectRefusal('N2.add-invalid-reftype', () => domain.curate({ action: 'add', member: { id: 'x1', revisionId: 'px1', refType: 'Document', sourceRef: 'a@b', title: 'x' } }), 'EXACT_SOURCE_REF_REQUIRED');
expectRefusal('N2.add-invalid-source-ref', () => domain.curate({ action: 'add', member: { id: 'x2', revisionId: 'px2', refType: 'Evidence', sourceRef: 'no-at-sign', title: 'x' } }), 'EXACT_SOURCE_REF_REQUIRED');
expectRefusal('N2.add-missing-member', () => domain.curate({ action: 'add', member: null }), 'EXACT_SOURCE_REF_REQUIRED');
expectRefusal('N2.add-duplicate-id', () => domain.curate({ action: 'add', member: { id: 'member-canonical', revisionId: 'dup', refType: 'Evidence', sourceRef: 'ev-other@r1', title: 'dup' } }), 'MEMBERSHIP_ID_CONFLICT');
expectRefusal('N2.add-unsupported-action', () => domain.curate({ action: 'archive', member: { id: 'x3', revisionId: 'px3', refType: 'Evidence', sourceRef: 'a@b', title: 'x' } }), 'CURATION_ACTION_UNSUPPORTED');
expectRefusal('N2.remove-unknown-member', () => domain.curate({ action: 'remove', id: 'nope', expectedRevisionId: 'r' }), 'MEMBER_UNKNOWN');
expectRefusal('N2.remove-without-revision-envelope', () => domain.curate({ action: 'remove', id: 'member-canonical' }), 'REVISION_ENVELOPE_REQUIRED');
expectRefusal('N2.remove-stale-revision-envelope', () => domain.curate({ action: 'remove', id: 'member-canonical', expectedRevisionId: 'stale' }), 'REVISION_CONFLICT');
expectRefusal('N2.source-state-invalid', () => domain.setSourceState('member-canonical', 'MAGIC', { expectedRevisionId: 'pm-canonical' }), 'PORTFOLIO_SOURCE_STATE_INVALID');
expectRefusal('N2.source-state-without-envelope', () => domain.setSourceState('member-canonical', 'UNAVAILABLE'), 'REVISION_ENVELOPE_REQUIRED');
const filtered = domain.filter('!!!not-a-taxonomy%%%');
record('N2.filter-unknown-taxonomy-creates-nothing', filtered.ok === true && filtered.taxonomyCreated === false && filtered.records.length === 0 && snapshotOf(domain).replace(/"filterText":"[^"]*"/, '"filterText":"x"') === before.replace(/"filterText":"[^"]*"/, '"filterText":"x"'), { admitted: filtered.records.length, taxonomyCreated: filtered.taxonomyCreated });
domain.filter('');

record('N2.state-unchanged-after-invalid-inputs', snapshotOf(domain) === before, { before: sha(before).slice(0, 16), after: sha(snapshotOf(domain)).slice(0, 16) });
record('N2.no-false-receipts', domain.receipts.length === receiptsBefore, { before: receiptsBefore, after: domain.receipts.length });

// N3 — no source resolver / no provider → UNVERIFIED, never an invented RESOLVABLE
const noResolver = new W04PortfolioDomain();
noResolver.curate({ action: 'add', member: { id: 'm-np', revisionId: 'pm-np', refType: 'Evidence', sourceRef: 'unbound@r1', title: 'no provider' } });
record('N3.no-provider-never-resolvable', noResolver.get('m-np').state === 'UNVERIFIED_PROVIDER_UNBOUND', { state: noResolver.get('m-np').state });

const missingSource = new W04PortfolioDomain(undefined, { sourceResolver: { inspect: () => null } });
missingSource.curate({ action: 'add', member: { id: 'm-missing', revisionId: 'pm-m', refType: 'Evidence', sourceRef: 'ghost@r1', title: 'missing' } });
record('N3.missing-source-not-resolvable', missingSource.get('m-missing').state === 'UNAVAILABLE', { state: missingSource.get('m-missing').state });

const emptyExport = new W04PortfolioDomain().export();
record('N3.empty-export-is-empty-and-not-canonical', emptyExport.ok === true && emptyExport.members.length === 0 && emptyExport.canonicalPublication === false, { members: emptyExport.members.length, canonicalPublication: emptyExport.canonicalPublication });

// N3 — presentation must say UNAVAILABLE (no fabricated digest) when no resolver is bound
const projection = describePortfolioRecord(noResolver, 'm-np');
const integrityBlock = projection.blocks.find(b => b.id === 'source-integrity');
const integrityText = JSON.stringify(integrityBlock);
record('N3.presentation-no-fabricated-digest', !/sha256:[0-9a-f]{16}/.test(integrityText) && integrityText.includes('UNAVAILABLE') && integrityText.includes('No source resolver'), { hasDigest: /sha256:[0-9a-f]{16}/.test(integrityText), hasUnavailable: integrityText.includes('UNAVAILABLE') });
record('N3.empty-projection-empty-tokens', describePortfolioEmpty().blocks[0].id === 'q5', { firstBlock: describePortfolioEmpty().blocks[0].id });

// L1 (domain half) — export payload is an exact projection of the canonical records
const projected = domain.records.map(({ id, revisionId, refType, sourceRef, state, groupingRef, groupingState, annotation }) => ({ id, revisionId, refType, sourceRef, state, groupingRef, groupingState, annotation: annotation ?? null }));
const exportA = domain.export();
const exportB = domain.export();
const exportHash = sha(JSON.stringify(exportA.members));
record('L1.export-members-hash-equal-domain-projection', exportHash === sha(JSON.stringify(projected)), { exportHash: exportHash.slice(0, 16), projectionHash: sha(JSON.stringify(projected)).slice(0, 16) });
record('L1.export-twice-identical', sha(JSON.stringify(exportA)) === sha(JSON.stringify(exportB)), { a: sha(JSON.stringify(exportA)).slice(0, 16), b: sha(JSON.stringify(exportB)).slice(0, 16) });
record('L1.export-never-canonical', exportA.canonicalPublication === false && !JSON.stringify(exportA).includes('canonicalEvidence') && !JSON.stringify(exportA).includes('"digest"'), { canonicalPublication: exportA.canonicalPublication });

// L1 (canonical-source half) — every RESOLVABLE member's envelope hash-matches the canonical source
const sourceStore = canonicalStore;
const resolvable = exportA.members.filter(m => m.state === 'RESOLVABLE');
const mismatches = [];
for (const member of resolvable) {
  const canonical = sourceStore.get(member.sourceRef) || null;
  const observed = domain.sourceResolver.inspect(member.sourceRef);
  if (!canonical || !observed || observed.digest !== canonical.digest || observed.rowCount !== canonical.rowCount) {
    mismatches.push({ sourceRef: member.sourceRef, canonical, observed });
  }
}
record('L1.resolvable-envelope-hash-matches-canonical-source', resolvable.length > 0 && mismatches.length === 0, { resolvable: resolvable.length, mismatches });
const syntheticStates = exportA.members.filter(m => m.state === 'RESOLVABLE' && !sourceStore.has(m.sourceRef));
record('L1.no-synthetic-resolvable', syntheticStates.length === 0, { synthetic: syntheticStates.map(m => m.sourceRef) });

// Q-5 — the grouping authority must stay refused; this lane never decides it
const q5Before = snapshotOf(domain);
const refused = domain.group('member-canonical', 'grp-project-example', { expectedRevisionId: 'pm-canonical' });
const memberAfter = domain.get('member-canonical');
record('Q5.grouping-refused-authORITY-decision-required', refused.ok === false && refused.code === 'AUTHORITY_DECISION_REQUIRED' && refused.mutated === false && snapshotOf(domain) === q5Before && memberAfter.groupingRef === null, { code: refused.code, mutated: refused.mutated, groupingRef: memberAfter.groupingRef, groupingState: memberAfter.groupingState, stateUnchanged: snapshotOf(domain) === q5Before });

/* ─────────────────────────────── L1 — live page (browser) ─────────────────────────────── */

const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(freePort)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let up = false;
for (let i = 0; i < 120; i++) { try { if ((await fetch(`http://127.0.0.1:${freePort}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
const browser = up ? await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) }) : null;

if (!browser) {
  record('L1.live-page-export-hash-match', false, 'PROOF_SERVER_DID_NOT_START');
} else {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e).slice(0, 160)));
  await page.goto(`http://127.0.0.1:${freePort}/?surface=portfolio`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'portfolio', null, { timeout: 20000 });
  await page.waitForTimeout(500);
  const live = await page.evaluate(() => {
    const M = window.CEPFoundation.m0Composition;
    const portfolio = M.group.portfolio.domain;
    const evidence = M.group.evidence.domain;
    // canonical source fixture through the LIVE evidence domain (labelled FIXTURE)
    evidence.importEvidence({ id: 'ev-falsify', revisionId: 'ev-falsify-r1', title: 'POR-1 falsification fixture Evidence', sourceId: 'falsify-source', sourceRevision: 'r1', subject: 'owner:local', evidenceClaim: 'POR-1 falsification fixture claim', criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'POR-1 lane export hash-match proof' });
    evidence.verifySource('ev-falsify', { status: 'VERIFIED', providerId: 'provider:por1-falsify', providerRevision: '1.0.0', proofId: 'proof:por1:fx', digest: `sha256:${'c3'.repeat(32)}`, schemaValid: true, sourceBytesAvailable: true });
    evidence.submitCandidate('ev-falsify');
    evidence.markCandidateValidated('ev-falsify', { validator: 'por1-falsify', validationProofRef: 'proof:intake:ev-falsify' });
    evidence.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
    evidence.setAdmissionAuthority('ev-falsify', true, 'authority:evidence-admission:por1:fx', { testOnly: false });
    evidence.admit('ev-falsify');
    const row = evidence.inspect('ev-falsify');
    const canonicalRef = `${row.evidenceId}@${row.revisionId}`;
    const canonical = evidence.findRevision('ev-falsify', 'ev-falsify-r1') || null;

    portfolio.curate({ action: 'add', member: { id: 'member-falsify-canonical', revisionId: 'pm-fx-1', refType: 'Evidence', sourceRef: canonicalRef, title: 'Canonical fixture reference' } });
    portfolio.curate({ action: 'add', member: { id: 'member-falsify-unbound', revisionId: 'pm-fx-2', refType: 'Evidence', sourceRef: 'not-bound@r1', title: 'Unbound reference' } });

    const exportOne = portfolio.export();
    const exportTwo = portfolio.export();
    const projected = portfolio.records.map(({ id, revisionId, refType, sourceRef, state, groupingRef, groupingState, annotation }) => ({ id, revisionId, refType, sourceRef, state, groupingRef, groupingState, annotation: annotation ?? null }));
    const envelopeForCanonical = portfolio.sourceResolver.inspect(canonicalRef);
    const refusedGroup = portfolio.group('member-falsify-canonical', 'grp-project-example', { expectedRevisionId: 'pm-fx-1' });
    return {
      consumer: window.CEPFoundation.consumer,
      truth: M.surface.truth,
      canonicalRef,
      canonicalDigest: canonical?.source?.digest ?? null,
      canonicalRows: canonical?.source ? 1 : null,
      envelopeForCanonical,
      exportOne, exportTwo, projected,
      records: portfolio.records.map(r => `${r.id}:${r.state}:${r.groupingRef}`),
      refusedGroup: { ok: refusedGroup.ok, code: refusedGroup.code, mutated: refusedGroup.mutated },
      groupingStillNull: portfolio.records.every(r => r.groupingRef === null),
      receipts: portfolio.receipts.map(r => `${r.sequence}:${r.command}:${r.action || ''}:${r.id}`),
      pageErrors: []
    };
  });
  await browser.close();

  const exportOneHash = sha(JSON.stringify(live.exportOne.members));
  const projectedHash = sha(JSON.stringify(live.projected));
  record('L1.live-export-members-hash-equal-live-domain-projection', exportOneHash === projectedHash, { exportHash: exportOneHash.slice(0, 16), projectionHash: projectedHash.slice(0, 16) });
  record('L1.live-export-twice-identical', sha(JSON.stringify(live.exportOne)) === sha(JSON.stringify(live.exportTwo)), { a: sha(JSON.stringify(live.exportOne)).slice(0, 16), b: sha(JSON.stringify(live.exportTwo)).slice(0, 16) });
  // the surface's source resolver returns {digest, rowCount} (state is derived by the domain
  // snapshot); hash-match the digest against the canonical evidence source itself.
  const envelopeMatches = !!live.canonicalDigest && live.envelopeForCanonical?.digest === live.canonicalDigest && Number.isInteger(live.envelopeForCanonical?.rowCount);
  record('L1.live-canonical-envelope-hash-matches-source', envelopeMatches, { canonicalDigest: String(live.canonicalDigest).slice(0, 30), observed: live.envelopeForCanonical });
  const states = Object.fromEntries(live.records.map(r => { const [id, state, ref] = r.split(':'); return [id, { state, ref }]; }));
  record('L1.live-unbound-member-not-resolvable', states['member-falsify-unbound']?.state === 'UNAVAILABLE', { unbound: states['member-falsify-unbound'] });
  const resolvableMembers = live.records.filter(line => line.split(':')[1] === 'RESOLVABLE');
  record('L1.live-no-synthetic-resolvable', resolvableMembers.length === 1 && resolvableMembers[0].startsWith('member-falsify-canonical:'), { resolvableMembers, records: live.records });
  record('Q5.live-grouping-refused', live.refusedGroup.code === 'AUTHORITY_DECISION_REQUIRED' && live.refusedGroup.mutated === false && live.groupingStillNull, { refused: live.refusedGroup, groupingStillNull: live.groupingStillNull });
  record('L1.live-truth-ceiling-unchanged', live.truth?.canonicalSourceCopies === 0 && live.truth?.canonicalSourceDeleteAuthority === false && live.truth?.groupingAuthority === 'AUTHORITY_DECISION_REQUIRED', live.truth);
  record('L1.live-no-page-errors', pageErrors.length === 0 && live.pageErrors.length === 0, { pageErrors });
}

server.kill('SIGTERM');

/* ─────────────────────────────── report ─────────────────────────────── */

const report = {
  schemaVersion: 1,
  lane: 'POR-1',
  unit: 'W04-PORTFOLIO',
  ranAt: new Date().toISOString(),
  candidate: { branch: 'writer/mi-serial-lane/POR-1', commit: git('git rev-parse HEAD'), tree: git('git rev-parse HEAD^{tree}') },
  environment: { node: process.version, browser: browser ? 'Chromium (Playwright package-local)' : 'NOT_STARTED' },
  summary: { total: results.length, pass: results.filter(r => r.ok).length, fail: results.filter(r => !r.ok).length },
  results
};
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'FALSIFICATION.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ summary: report.summary, failed: results.filter(r => !r.ok).map(r => r.id) }, null, 2));
if (report.summary.fail) process.exitCode = 1;
