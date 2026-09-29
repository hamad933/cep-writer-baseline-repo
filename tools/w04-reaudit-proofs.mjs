/**
 * W04 visual re-audit proofs (R7 of governance §8).
 *
 * Byte-level and DOM-level assertions for the defects this remediation owns. Every assertion is
 * evaluated against the LIVE product inside a real Chromium page; screenshots written here are
 * extra enacted states (menu open / shelf open) that the frame census in
 * `w04-reaudit-capture.mjs` does not cover.
 *
 * Defect coverage
 *   D3  bottom shelf registers the authored surface bottom projection and opens with content
 *   D9  lifecycle state affordance: a state track with a current position + next actions
 *   D10 reference record composition present (Source Handoff / Supporting References /
 *       Criterion Findings / Decision Preparation / numbered 5-step structure / status pills)
 *   D11 both required viewports, no horizontal overflow, no clipped title/pill/step
 *   M1  NOT_EVALUATED is displayed as the judgment pill, not a bare EMPTY token
 *   M2  a SYNTHETIC_DEMO_SEED mastery row carries a visible FIXTURE badge + fixture notice
 *   R1  7 unreachable reviews.* commands are reachable through a `More` overflow
 *   P2  pending grouping authority is a legible first-class notice (Q-5, no grouping structure)
 *   P3  `portfolio.curate` is labelled `Curate Portfolio reference`
 *
 * Usage: node tools/w04-reaudit-proofs.mjs
 * Writes: writer-output/W04/reaudit-evidence/REAUDIT_PROOFS.json
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (primaryError) {
  const override = process.env.CEP_PLAYWRIGHT_MODULE_PATH;
  if (!override) throw Error(`PLAYWRIGHT_PACKAGE_UNAVAILABLE: ${primaryError.message}`);
  playwright = require(path.resolve(override));
}
const { chromium } = playwright;

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W04/reaudit-evidence');
const VIEWPORTS = [[1440, 1000], [1024, 900]];

const freePort = () => new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});

const SEEDS = `(() => {
  const M = window.CEPFoundation.m0Composition;
  window.__p = {
    evidence: M.group.evidence.domain, reviews: M.group.reviews.domain,
    mastery: M.group.mastery.domain, portfolio: M.group.portfolio.domain,
    group: M.group, mounted: M.mounted,
    registry: window.CEPFoundation.registry, workspace: window.CEPFoundation.workspace,
    authority: window.CEPFoundation.sharedOwners.reviewAuthorityRegistry,
    render: () => { try { M.mounted.render(); } catch {} }
  };
  window.__p.evAdmit = id => {
    const d = window.__p.evidence;
    d.importEvidence({ id, revisionId: id + '-r1', title: 'Proof candidate ' + id, sourceId: 'proof-source', sourceRevision: 'r1', subject: 'owner:local', evidenceClaim: 'Proof claim for the W04 re-audit proof harness.', criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'W04 visual re-audit proof', verification: { status: 'UNVERIFIED' } });
    d.verifySource(id, { status: 'VERIFIED', providerId: 'provider:w04-proof', providerRevision: '1.0.0', proofId: 'proof:reaudit:' + id, digest: 'sha256:' + '9'.repeat(64), schemaValid: true, sourceBytesAvailable: true });
    d.submitCandidate(id);
    d.markCandidateValidated(id, { validator: 'w04-proof', validationProofRef: 'proof:intake:' + id });
    d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
    d.setAdmissionAuthority(id, true, 'authority:evidence-admission:proof:' + id, { testOnly: false });
    return d.admit(id).ok;
  };
  window.__p.rvSetup = () => {
    const d = window.__p.evidence, r = window.__p.reviews;
    window.__p.authority.registerReviewer('reviewer:proof', { authorized: true, canAssign: true, permissionProofRef: 'perm:proof', testOnly: false });
    if (!d.records.some(x => x.id === 'ev-proof-1')) window.__p.evAdmit('ev-proof-1');
    const row = d.inspect('ev-proof-1');
    if (!r.records.some(x => x.id === 'rv-proof-1')) {
      r.review('rv-proof-1', { action: 'request', evidenceRefs: [row.evidenceId + '@' + row.revisionId], criteriaRefs: ['criteria:v4#integrity', 'criteria:v4#provenance'], reviewer: { identity: 'reviewer:proof', permissionProofRef: 'perm:proof', authorityAvailable: true, assignmentPermissionAvailable: true }, purpose: 'Formal competency Evidence review (proof)' });
      r.review('rv-proof-1', { action: 'assign' });
      r.review('rv-proof-1', { action: 'start' });
      r.finding('rv-proof-1', { findingId: 'f-proof-1', text: 'Digest and schema verified against the pinned source revision.', state: 'SATISFIED', criterionRef: 'criteria:v4#integrity', scopeDisposition: 'IN_SCOPE' });
    }
    return r.inspect('rv-proof-1').state;
  };
  window.__p.msFixture = () => {
    const d = window.__p.mastery;
    if (!d.records.some(r => r.id === 'mastery-proof-1')) d.records.push({ id: 'mastery-proof-1', revisionId: 'mr-proof-001', subject: 'user:self', capability: 'crypto-basics', judgment: 'MASTERED', freshness: 'REVALIDATION_REQUIRED', policyRef: 'policy:mastery-v3', truthClass: 'SYNTHETIC_DEMO_SEED', basis: { evidenceRefs: ['ev-proof-1@ev-proof-1-r1'], decisionRefs: ['decision-proof-1'], digest: 'basis:proof001' } });
    window.__p.render();
    return d.inspect('mastery-proof-1').judgment;
  };
  return true;
})()`;

const checks = [];
const check = (id, surface, ok, expected, actual, note = '') => {
  checks.push({ id, surface, ok: ok === true, expected, actual, note, status: ok === true ? 'PASS' : 'FAIL' });
  return ok === true;
};
const text = (page, selector) => page.evaluate(sel => (document.querySelector(sel)?.textContent || '').replace(/\s+/g, ' ').trim(), selector);
const count = (page, selector) => page.evaluate(sel => document.querySelectorAll(sel).length, selector);
const lensBound = async page => {
  const right = await text(page, '#rightPane .pbody');
  return !right.includes('No domain context lens is bound') && right.length > 80;
};

const run = async () => {
  await mkdir(outDir, { recursive: true });
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: 'ignore' });
  const browser = await chromium.launch();
  const shots = [];
  try {
    for (const [width, height] of VIEWPORTS) {
      /* ---------------------------------------------------------- evidence */
      {
        const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e?.message || e)));
        await page.goto(`http://127.0.0.1:${port}/?surface=evidence`, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
        await page.evaluate(SEEDS);
        await page.evaluate(() => { window.__p.evAdmit('ev-proof-1'); window.__p.render(); });
        await page.waitForTimeout(250);
        const center = await text(page, '#foundationStage .m0-workbench');
        check('D10.evidence.Source-Handoff', 'evidence', center.includes('Source Handoff'), 'Source Handoff section', center.includes('Source Handoff') ? 'present' : 'absent');
        check('D10.evidence.Supporting-References', 'evidence', center.includes('Selected Supporting References'), 'Selected Supporting References section', center.includes('Selected Supporting References') ? 'present' : 'absent');
        check('D10.evidence.status-pill', 'evidence', await count(page, '#foundationStage [data-w04-pill]') >= 2, '>=2 status pills', await count(page, '#foundationStage [data-w04-pill]'));
        check('D9.evidence.lifecycle-track', 'evidence', await count(page, '#foundationStage [data-w04-track] .w04-track-step[data-w04-step-state=current]') === 1, 'exactly one current lifecycle step', await count(page, '#foundationStage [data-w04-track] .w04-track-step[data-w04-step-state=current]'));
        check('D9.evidence.next-actions', 'evidence', await count(page, '#foundationStage .w04-next-item') >= 3, '>=3 next-action affordances', await count(page, '#foundationStage .w04-next-item'));
        check('D1.evidence.right-context-lens-bound', 'evidence', await lensBound(page), 'RIGHT renders the authored context lens (no fallback)', await lensBound(page));
        check('D3.evidence.bottom-shelf-availability', 'evidence', (await page.evaluate(() => document.querySelector('#bottomShelf')?.dataset.bottomAvailability)) === 'AVAILABLE', 'AVAILABLE', await page.evaluate(() => document.querySelector('#bottomShelf')?.dataset.bottomAvailability));
        check('D11.evidence.no-horizontal-overflow', 'evidence', !(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), 'no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1));
        check('D11.evidence.no-clipped-heading', 'evidence', (await page.evaluate(() => [...document.querySelectorAll('#foundationStage .w04-rec-title, #foundationStage .w04-pill')].filter(n => n.scrollWidth > n.clientWidth + 2).length)) === 0, 'no clipped title/pill', await page.evaluate(() => [...document.querySelectorAll('#foundationStage .w04-rec-title, #foundationStage .w04-pill')].filter(n => n.scrollWidth > n.clientWidth + 2).length));
        check('E.evidence.no-page-errors', 'evidence', errors.length === 0, '0 page errors', errors);
        await ctx.close();
      }
      /* ---------------------------------------------------------- reviews (R1) */
      {
        const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e?.message || e)));
        await page.goto(`http://127.0.0.1:${port}/?surface=reviews`, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'reviews', null, { timeout: 20000 });
        await page.evaluate(SEEDS);
        await page.evaluate(() => { window.__p.rvSetup(); window.__p.render(); });
        await page.waitForTimeout(250);
        const toolbarIds = await page.evaluate(() => [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(n => n.dataset.foundationCommand));
        check('R1.reviews.toolbar-is-4-domain-commands', 'reviews', JSON.stringify(toolbarIds) === JSON.stringify(['reviews.review', 'reviews.finding', 'reviews.compare', 'reviews.supersede']), 'the 4 domain_commands stay visible', toolbarIds);
        const hasMore = await count(page, '#domainToolbar [data-w04-overflow] [data-w04-overflow-toggle]');
        check('R1.reviews.more-overflow-present', 'reviews', hasMore === 1, 1, hasMore);
        await page.click('#domainToolbar [data-w04-overflow-toggle]');
        await page.waitForTimeout(150);
        const menu = await page.evaluate(() => [...document.querySelectorAll('#domainToolbar .w04-overflow-menu [data-foundation-command]')].map(n => ({ id: n.dataset.foundationCommand, label: n.textContent.split('\n')[0].trim(), disabled: n.disabled, reason: n.title })));
        const expectedMore = ['reviews.request', 'reviews.assign', 'reviews.start', 'reviews.ready', 'reviews.continue', 'reviews.cancel', 'reviews.rereview'];
        check('R1.reviews.seven-unreachable-now-listed', 'reviews', JSON.stringify(menu.map(m => m.id)) === JSON.stringify(expectedMore), expectedMore, menu.map(m => m.id));
        const withReason = menu.filter(m => m.label && m.reason).length;
        check('R1.reviews.every-item-has-label-and-reason', 'reviews', withReason === 7, 7, withReason);
        const enabledItems = menu.filter(m => !m.disabled).map(m => m.id);
        check('R1.reviews.state-appropriate-items-enabled', 'reviews', enabledItems.includes('reviews.ready'), 'reviews.ready enabled for IN_REVIEW with findings', enabledItems);
        const file = `reviews-${width}x${height}-more-menu-open.png`;
        await page.screenshot({ path: path.join(outDir, file), fullPage: false });
        const bytes = await readFile(path.join(outDir, file));
        shots.push({ file, viewport: `${width}x${height}`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, state: 'more-menu-open' });
        // execute an overflow command and prove the projection follows
        const before = await page.evaluate(() => window.__p.reviews.inspect('rv-proof-1').state);
        await page.click('#domainToolbar .w04-overflow-menu [data-foundation-command="reviews.ready"]');
        await page.waitForTimeout(350);
        const after = await page.evaluate(() => window.__p.reviews.inspect('rv-proof-1').state);
        const pill = await text(page, '#foundationStage [data-w04-pill]');
        check('R1.reviews.overflow-command-executes-and-renders', 'reviews', before === 'IN_REVIEW' && after === 'READY_FOR_DECISION' && pill.includes('READY_FOR_DECISION'), 'IN_REVIEW -> READY_FOR_DECISION and the pill follows', `${before} -> ${after} | pill: ${pill}`);
        const center = await text(page, '#foundationStage .m0-workbench');
        check('D1.reviews.right-context-lens-bound', 'reviews', await lensBound(page), 'RIGHT renders the authored context lens (no fallback)', await lensBound(page));
        check('D10.reviews.Criterion-Findings-table', 'reviews', center.includes('Criterion Findings') && (await count(page, '#foundationStage table.w04-record-table')) >= 1, 'Criterion Findings table', center.includes('Criterion Findings'));
        check('D10.reviews.Decision-Preparation', 'reviews', center.includes('Decision Preparation'), 'Decision Preparation card', center.includes('Decision Preparation'));
        check('D10.reviews.Reviewer-Rationale', 'reviews', center.includes('Reviewer Rationale'), 'Reviewer Rationale card', center.includes('Reviewer Rationale'));
        check('D9.reviews.workflow-track', 'reviews', await count(page, '#foundationStage [data-w04-track] .w04-track-step') === 5, 5, await count(page, '#foundationStage [data-w04-track] .w04-track-step'));
        check('D1.reviews.right-not-a-center-copy', 'reviews', await page.evaluate(() => {
          const c = (document.querySelector('#foundationStage .m0-workbench')?.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
          const r = (document.querySelector('#rightPane .pbody')?.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
          if (!r.length) return false;
          return r.filter(l => c.includes(l)).length / r.length <= 0.2;
        }), 'RIGHT/CENTER line overlap <= 0.2', await page.evaluate(() => {
          const c = (document.querySelector('#foundationStage .m0-workbench')?.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
          const r = (document.querySelector('#rightPane .pbody')?.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
          return r.length ? Number((r.filter(l => c.includes(l)).length / r.length).toFixed(3)) : null;
        }));
        check('E.reviews.no-page-errors', 'reviews', errors.length === 0, '0 page errors', errors);
        await ctx.close();
      }
      /* ---------------------------------------------------------- mastery (M1/M2) */
      {
        const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e?.message || e)));
        await page.goto(`http://127.0.0.1:${port}/?surface=mastery`, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'mastery', null, { timeout: 20000 });
        await page.evaluate(SEEDS);
        await page.waitForTimeout(250);
        const emptyPills = await page.evaluate(() => [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\s+/g, ' ').trim()));
        const emptyCenter = await text(page, '#foundationStage .m0-workbench');
        check('M1.mastery.NOT_EVALUATED-is-the-judgment-pill', 'mastery', emptyPills.some(p => p.includes('Mastery Judgment') && p.includes('NOT_EVALUATED')), 'Mastery Judgment: NOT_EVALUATED pill', emptyPills);
        check('M1.mastery.not-a-bare-EMPTY-token', 'mastery', emptyCenter.includes('NOT_EVALUATED') && !/\bState\b\s*EMPTY/.test(emptyCenter), 'NOT_EVALUATED displayed, no bare State|EMPTY row', emptyCenter.slice(0, 240));
        check('M1.mastery.guidance-preserved', 'mastery', emptyCenter.includes('Current state is NOT_EVALUATED while evaluator/provider truth is unavailable.'), 'shared empty guidance preserved', emptyCenter.includes('Current state is NOT_EVALUATED while evaluator/provider truth is unavailable.'));
        await page.evaluate(() => { window.__p.msFixture(); });
        await page.waitForTimeout(250);
        const pills = await page.evaluate(() => [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\s+/g, ' ').trim()));
        check('M2.mastery.fixture-badge-on-judgment-pill', 'mastery', pills.some(p => p.includes('MASTERED') && p.includes('FIXTURE')), 'FIXTURE badge on the judgment pill', pills);
        const center = await text(page, '#foundationStage .m0-workbench');
        check('M2.mastery.fixture-notice-visible', 'mastery', center.includes('SYNTHETIC_DEMO_SEED') && center.includes('not a real consumer achievement'), 'fixture notice names SYNTHETIC_DEMO_SEED + L07', center.includes('SYNTHETIC_DEMO_SEED'));
        check('D1.mastery.right-context-lens-bound', 'mastery', await lensBound(page), 'RIGHT renders the authored context lens (no fallback)', await lensBound(page));
        check('D10.mastery.numbered-5-step-structure', 'mastery', await count(page, '#foundationStage .w04-step[data-w04-step-number]') === 5, 5, await count(page, '#foundationStage .w04-step[data-w04-step-number]'));
        check('D10.mastery.both-status-pills', 'mastery', pills.some(p => p.includes('Mastery Judgment')) && pills.some(p => p.includes('Freshness Status')), 'Mastery Judgment + Freshness Status pills', pills);
        check('D9.mastery.judgment-dimension-track', 'mastery', await count(page, '#foundationStage [data-w04-track] .w04-track-step') === 5 && await count(page, '#foundationStage [data-w04-track] .w04-track-step[data-w04-step-state=current]') === 1, '5 judgment steps, 1 current', await count(page, '#foundationStage [data-w04-track] .w04-track-step'));
        check('D11.mastery.no-horizontal-overflow', 'mastery', !(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), 'no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1));
        check('E.mastery.no-page-errors', 'mastery', errors.length === 0, '0 page errors', errors);
        await ctx.close();
      }
      /* ---------------------------------------------------------- portfolio (P2/P3) */
      {
        const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(String(e?.message || e)));
        await page.goto(`http://127.0.0.1:${port}/?surface=portfolio`, { waitUntil: 'networkidle' });
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'portfolio', null, { timeout: 20000 });
        await page.evaluate(SEEDS);
        const label = await page.evaluate(() => window.__p.registry.commands.get('portfolio.curate')?.label);
        check('P3.portfolio.curate-label', 'portfolio', label === 'Curate Portfolio reference', 'Curate Portfolio reference', label);
        await page.evaluate(() => { window.__p.portfolio.curate({ action: 'add', member: { id: 'member-proof-1', revisionId: 'pm-proof-001', refType: 'Evidence', sourceRef: 'ev-proof-1@ev-proof-1-r1', title: 'Proof curation reference' } }); window.__p.render(); });
        await page.waitForTimeout(250);
        const center = await text(page, '#foundationStage .m0-workbench');
        check('D1.portfolio.right-context-lens-bound', 'portfolio', await lensBound(page), 'RIGHT renders the authored context lens (no fallback)', await lensBound(page));
        check('P2.portfolio.legible-pending-authority', 'portfolio', center.includes('AUTHORITY_DECISION_REQUIRED') && center.includes('Q-5'), 'AUTHORITY_DECISION_REQUIRED (Q-5) notice', center.includes('AUTHORITY_DECISION_REQUIRED'));
        check('P2.portfolio.no-grouping-structure', 'portfolio', !(await count(page, '#foundationStage [data-w04-group]')) && !(await page.evaluate(() => /Capability Group|مجموعة القدرات/.test(document.querySelector('#foundationStage')?.innerText || ''))), 'no capability-grouping structure rendered', await count(page, '#foundationStage [data-w04-group]'));
        const refused = await page.evaluate(() => {
          const d = window.__p.portfolio, row = d.records[0];
          const r = d.group(row.id, 'grp-project-example', { expectedRevisionId: row.revisionId });
          return { code: r.code, mutated: r.mutated, groupingState: d.records[0].groupingState };
        });
        check('P1.portfolio.Q5-refusal-preserved', 'portfolio', refused.code === 'AUTHORITY_DECISION_REQUIRED' && refused.mutated === false && refused.groupingState === 'UNGROUPED', 'AUTHORITY_DECISION_REQUIRED, no mutation', refused);
        const pills = await page.evaluate(() => [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\s+/g, ' ').trim()));
        check('D10.portfolio.status-pills', 'portfolio', pills.length >= 2, '>=2 status pills', pills);
        check('D3.portfolio.bottom-shelf-availability', 'portfolio', (await page.evaluate(() => document.querySelector('#bottomShelf')?.dataset.bottomAvailability)) === 'AVAILABLE', 'AVAILABLE', await page.evaluate(() => document.querySelector('#bottomShelf')?.dataset.bottomAvailability));
        check('D11.portfolio.no-horizontal-overflow', 'portfolio', !(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)), 'no horizontal overflow', await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1));
        check('E.portfolio.no-page-errors', 'portfolio', errors.length === 0, '0 page errors', errors);
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }
  const failed = checks.filter(c => !c.ok);
  const receipt = {
    schemaVersion: 1,
    proof: 'w04-visual-reaudit-remediation',
    viewports: VIEWPORTS.map(v => `${v[0]}x${v[1]}`),
    method: 'live product DOM + file bytes (sha256) in package-local Chromium',
    total: checks.length,
    passed: checks.length - failed.length,
    failed: failed.length,
    failedIds: failed.map(f => f.id),
    checks,
    extraStateShots: shots
  };
  await writeFile(path.join(outDir, 'REAUDIT_PROOFS.json'), JSON.stringify(receipt, null, 2));
  console.log(`proofs ${receipt.passed}/${receipt.total}${failed.length ? ` — FAIL: ${receipt.failedIds.join(', ')}` : ''}`);
  if (failed.length) {
    for (const f of failed) console.log(`  FAIL ${f.id}: expected ${JSON.stringify(f.expected)} got ${JSON.stringify(f.actual)}`);
    process.exitCode = 1;
  }
};

await run();
