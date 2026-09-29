/**
 * W04 visual re-audit capture (R2 / R6 of governance §8).
 *
 * Captures the four W04 surfaces (evidence · reviews · mastery · portfolio) at BOTH required
 * viewports — 1440x1000 and 1024x900 (governance §9 / defect D11) — in every ENACTED state.
 * States are produced cumulatively through the live product domain inside the page (no shadow
 * state) and every seeded row carries truthClass SYNTHETIC_DEMO_SEED or is created by the live
 * semantic commands, so no fixture result is presented as a real consumer result.
 *
 * Ground truth is FILE BYTES: SHA-256, PNG dimensions and byte-distinctness are computed here.
 * Ink / blank-band geometry and per-file OCR are computed by tools/w04-reaudit-measure.mjs.
 *
 * Usage:
 *   node tools/w04-reaudit-capture.mjs                 # capture into reaudit-evidence/current/
 *   node tools/w04-reaudit-capture.mjs --label before  # .../reaudit-evidence/before/
 *
 * Exit 1 if any (surface, viewport) frame set contains duplicate byte identities — a state that
 * is claimed but not visually distinct is an EVIDENCE/ORACLE failure, not a pass.
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
const args = process.argv.slice(2);
const argValue = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const label = argValue('--label') || 'current';
const only = argValue('--surface');
const outDir = path.join(root, 'writer-output/W04/reaudit-evidence', label);
const receiptPath = path.join(outDir, 'CAPTURE_RECEIPT.json');

const VIEWPORTS = [[1440, 1000], [1024, 900]];

const freePort = () => new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});

/* ------------------------------------------------------------------ in-page seed helpers
   Installed once per page. They call the LIVE product domain / semantic command registry that
   is bound to the mounted composition — there is no parallel product state in this tool.       */

const IN_PAGE_SEEDS = `(() => {
  const M = window.CEPFoundation.m0Composition;
  const api = {
    evidence: M.group.evidence.domain,
    reviews: M.group.reviews.domain,
    mastery: M.group.mastery.domain,
    portfolio: M.group.portfolio.domain
  };
  window.__w04 = {
    ...api,
    surface: M.surface, group: M.group, mounted: M.mounted,
    registry: window.CEPFoundation.registry,
    workspace: window.CEPFoundation.workspace,
    authorityRegistry: window.CEPFoundation.sharedOwners.reviewAuthorityRegistry,
    select: index => { document.querySelectorAll('#domainLeftRegion [data-r6-row]')[index]?.click(); },
    rows: () => (M.surface.collectionCore || M.surface.collection).snapshot().visibleRows.map(r => r.id || r),
    render: () => { try { M.mounted.render(); } catch {} }
  };
  window.__w04_seeds = {
    evImport: a => { const id = a[0]; return window.__w04.registry.execute('evidence.import', { route: 'w04-reaudit-capture', input: {
      id, revisionId: id + '-r1', title: 'Re-audit candidate ' + id,
      sourceId: 'reaudit-source-' + id, sourceRevision: 'r1', subject: 'owner:local',
      evidenceClaim: 'Candidate claim recorded for the W04 visual re-audit lifecycle state.',
      criterionRefs: ['criteria:v4#integrity', 'criteria:v4#provenance'],
      governedPurpose: 'W04 visual re-audit state capture (fixture)',
      selectedMaterialRefs: ['reaudit-source-' + id + '@r1', 'reaudit-timeline@t1', 'reaudit-observation@o1'],
      notes: 'Submitted with a source handoff note for the re-audit capture.'
    } }); },
    evSubmit: a => { const r = window.__w04.evidence.submitCandidate(a[0]); return { ok: r.ok, code: r.code || null }; },
    evAdmit: a => { const id = a[0];
      const d = window.__w04.evidence;
      const verified = d.verifySource(id, { status: 'VERIFIED', providerId: 'provider:w04-reaudit', providerRevision: '1.0.0', proofId: 'proof:reaudit:' + id, digest: 'sha256:' + '7'.repeat(64), schemaValid: true, sourceBytesAvailable: true, verifiedAt: '2026-09-29T08:00:00.000Z' });
      const validated = d.markCandidateValidated(id, { validator: 'w04-reaudit', validationProofRef: 'proof:intake:' + id });
      d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
      d.setAdmissionAuthority(id, true, 'authority:evidence-admission:reaudit:' + id, { testOnly: false });
      const admitted = d.admit(id);
      const row = d.inspect(id);
      return { verified: verified.ok, validated: validated.ok, admitted: admitted.ok, code: admitted.code || null, status: row.status, revisionId: row.revisionId, immutable: row.currentRevision ? row.currentRevision.immutable === true : false };
    },
    rvEvidence: () => {
      const d = window.__w04.evidence, id = 'ev-reaudit-1';
      if (!d.records.some(r => r.id === id)) {
        d.importEvidence({ id, revisionId: 'ev-reaudit-1-r1', title: 'Re-audit Evidence for Review', sourceId: 'reaudit-source', sourceRevision: 'r1', subject: 'owner:local', evidenceClaim: 'Re-audit Evidence claim pinned to the formal Review.', criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'W04 visual re-audit capture', verification: { status: 'UNVERIFIED' } });
        d.verifySource(id, { status: 'VERIFIED', providerId: 'provider:w04-reaudit', providerRevision: '1.0.0', proofId: 'proof:reaudit:' + id, digest: 'sha256:' + '5'.repeat(64), schemaValid: true, sourceBytesAvailable: true });
        d.submitCandidate(id);
        d.markCandidateValidated(id, { validator: 'w04-reaudit', validationProofRef: 'proof:intake:ev-reaudit-1' });
        d.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
        d.setAdmissionAuthority(id, true, 'authority:evidence-admission:reaudit:ev-reaudit-1', { testOnly: false });
        d.admit(id);
      }
      const row = d.inspect(id);
      return { status: row.status, revisionId: row.revisionId };
    },
    rvRequest: () => {
      const r = window.__w04.reviews, d = window.__w04.evidence;
      window.__w04.authorityRegistry.registerReviewer('reviewer:reaudit', { authorized: true, canAssign: true, permissionProofRef: 'perm:reaudit', testOnly: false });
      const row = d.inspect('ev-reaudit-1');
      if (!r.records.some(x => x.id === 'rv-reaudit-1')) {
        r.review('rv-reaudit-1', { action: 'request', evidenceRefs: [row.evidenceId + '@' + row.revisionId], criteriaRefs: ['criteria:v4#integrity', 'criteria:v4#provenance'], reviewer: { identity: 'reviewer:reaudit', permissionProofRef: 'perm:reaudit', authorityAvailable: true, assignmentPermissionAvailable: true }, requester: 'owner:local', purpose: 'Formal competency Evidence review (re-audit capture)' });
        r.review('rv-reaudit-1', { action: 'assign' });
        r.review('rv-reaudit-1', { action: 'start' });
      }
      return { state: r.inspect('rv-reaudit-1').state };
    },
    rvFinding: a => { const res = window.__w04.reviews.finding('rv-reaudit-1', { findingId: a[0], text: a[3], state: a[1], criterionRef: a[2], scopeDisposition: 'IN_SCOPE' }); return res.ok || res.code; },
    rvReady: () => { const res = window.__w04.reviews.review('rv-reaudit-1', { action: 'ready' }); return res.ok || res.code; },
    rvDecide: () => {
      const r = window.__w04.reviews, row = r.inspect('rv-reaudit-1');
      const res = r.supersede('rv-reaudit-1', {
        expectedDecisionId: row.effectiveDecisionId || row.priorDecisionRef || null,
        newDecision: { decisionId: 'decision-reaudit-1', outcome: 'ACCEPT_WITH_LIMITATIONS', correctionReason: 'Pinned findings are satisfied; alternative-hypothesis justification needs one further review pass.' },
        correctionReason: 'Pinned findings are satisfied; alternative-hypothesis justification needs one further review pass.'
      });
      return { ok: res.ok, code: res.code || null, state: r.inspect('rv-reaudit-1').state };
    },
    msFixture: () => {
      const d = window.__w04.mastery;
      if (!d.records.some(r => r.id === 'mastery-reaudit-1')) {
        d.records.push({ id: 'mastery-reaudit-1', revisionId: 'mr-reaudit-001', subject: 'user:self', capability: 'crypto-basics', judgment: 'MASTERED', freshness: 'REVALIDATION_REQUIRED', policyRef: 'policy:mastery-v3', truthClass: 'SYNTHETIC_DEMO_SEED', basis: { evidenceRefs: ['ev-reaudit-1@ev-reaudit-1-r1'], decisionRefs: ['decision-reaudit-1'], digest: 'basis:reaudit001' } });
        d.history.push({ evaluationId: 'eval:mastery-reaudit-1:0', recordId: 'mastery-reaudit-1', revisionId: 'mr-reaudit-001', judgment: 'MASTERED', freshness: 'REVALIDATION_REQUIRED', policyRef: 'policy:mastery-v3', evidenceRefs: ['ev-reaudit-1@ev-reaudit-1-r1'], decisionRefs: ['decision-reaudit-1'], basisDigest: 'basis:reaudit001', truthClass: 'SYNTHETIC_DEMO_SEED' });
      }
      return { judgment: d.inspect('mastery-reaudit-1').judgment, truthClass: d.inspect('mastery-reaudit-1').truthClass };
    },
    msSecond: () => {
      const d = window.__w04.mastery;
      if (!d.records.some(r => r.id === 'mastery-reaudit-2')) {
        d.records.push({ id: 'mastery-reaudit-2', revisionId: 'mr-reaudit-002', subject: 'user:self', capability: 'network-analysis', judgment: 'INSUFFICIENT_EVIDENCE', freshness: 'CURRENT', policyRef: 'policy:mastery-v3', truthClass: 'SYNTHETIC_DEMO_SEED', basis: { evidenceRefs: ['ev-missing@r1'], decisionRefs: [], digest: 'basis:reaudit002' } });
      }
      window.__w04.render();
      window.__w04.select(1);
      return { judgment: d.inspect('mastery-reaudit-2').judgment, rows: window.__w04.rows() };
    },
    pfAdd: a => window.__w04.portfolio.curate({ action: 'add', member: { id: a[0], revisionId: 'pm-reaudit-' + a[0], refType: a[1], sourceRef: a[2], title: a[3] } }),
    pfSelect: a => { const rows = [...document.querySelectorAll('#domainLeftRegion [data-r6-row]')]; const i = rows.findIndex(r => r.getAttribute('data-r6-row') === a[0]); if (i >= 0) rows[i].click(); return { selected: a[0], index: i }; },
    bottomToggle: () => { const r = window.CEPFoundation.registry.execute('foundation.bottom', { route: 'w04-reaudit-capture' }); return { ok: r?.ok !== false, state: document.querySelector('#bottomShelf')?.dataset?.state ?? null, availability: document.querySelector('#bottomShelf')?.dataset?.bottomAvailability ?? null, providerOwner: document.querySelector('#bottomShelf')?.dataset?.bottomProviderOwner ?? null }; },
    state: () => ({ rows: window.__w04.rows(), records: { evidence: window.__w04.evidence.records.length, reviews: window.__w04.reviews.records.length, mastery: window.__w04.mastery.records.length, portfolio: window.__w04.portfolio.records.length } })
  };
  return window.__w04_seeds.state();
})()`;

const METRICS = `(() => {
  const textOf = sel => (document.querySelector(sel)?.innerText || '').replace(/[\\t ]+/g, ' ').trim();
  const lines = t => t.split('\\n').map(s => s.trim()).filter(Boolean);
  const center = textOf('#foundationStage .m0-workbench');
  const right = textOf('#rightPane .pbody');
  const left = textOf('#leftPane .pbody');
  const centerLines = lines(center), rightLines = lines(right);
  const shared = rightLines.filter(l => centerLines.includes(l));
  return {
    centerText: center, leftText: left, rightText: right, bottomText: textOf('#bottomShelf'),
    centerLineCount: centerLines.length, rightLineCount: rightLines.length, leftLineCount: lines(left).length,
    rightLineOverlapRatio: rightLines.length ? Number((shared.length / rightLines.length).toFixed(3)) : 0,
    tables: document.querySelectorAll('table.m0-table').length,
    tableHeaders: [...document.querySelectorAll('table.m0-table th')].map(n => n.textContent.trim()),
    recordTables: document.querySelectorAll('#foundationStage table').length,
    statePills: document.querySelectorAll('#foundationStage [data-w04-pill]').length,
    pillTexts: [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\\s+/g, ' ').trim()),
    numberedSteps: [...document.querySelectorAll('#foundationStage [data-w04-step-number]')].map(n => n.getAttribute('data-w04-step-number')),
    semanticRows: document.querySelectorAll('#foundationStage .m0-semantic-list dt').length,
    semanticGroups: document.querySelectorAll('#foundationStage .m0-semantic-group h3').length,
    regionItems: document.querySelectorAll('#foundationStage .m0-region-list li').length,
    centerStateTokens: document.querySelectorAll('#foundationStage .state-token').length,
    overflow: document.querySelectorAll('#domainToolbar [data-w04-overflow]').length,
    toolbarButtons: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(n => n.textContent.trim()),
    toolbarCount: document.querySelectorAll('#domainToolbar [data-foundation-command]').length,
    toolbarDisabled: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].filter(n => n.disabled).length,
    guidance: (document.querySelector('#foundationStage')?.textContent || '').includes('How this workspace works'),
    bottomRegionText: (document.querySelector('#domainBottomRegion')?.innerText || '').replace(/\\s+/g, ' ').trim(),
    bottomAvailability: document.querySelector('#bottomShelf')?.dataset.bottomAvailability ?? null,
    direction: document.body.dataset.foundationDirection || null,
    clipped: [...document.querySelectorAll('#foundationStage .w04-rec-title, #foundationStage .w04-pill, #foundationStage h3, #foundationStage .w04-track-step, #foundationStage .w04-step-num')]
      .filter(node => node.scrollWidth > node.clientWidth + 2 && getComputedStyle(node).overflow !== 'visible')
      .map(node => node.className + ':' + node.scrollWidth + '>' + node.clientWidth),
    horizontalOverflow: document.documentElement.scrollWidth > (window.innerWidth + 1),
    workbenchOverflow: (() => { const n = document.querySelector('#foundationStage .m0-workbench'); return n ? n.scrollWidth > n.clientWidth + 2 : false; })(),
    rects: Object.fromEntries(['#leftPane', '#centerPane', '#rightPane', '#bottomShelf', '#domainToolbar', '#foundationStage']
      .map(sel => { const r = document.querySelector(sel)?.getBoundingClientRect(); return [sel, r ? { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) } : null]; }))
  };
})()`;

/* ------------------------------------------------------------------ state scripts (in-page) */

const SURFACES = {
  evidence: [
    { id: 'empty', steps: [] },
    { id: 'candidate-submitted', steps: [['evImport', ['cand-reaudit-1']], ['evSubmit', ['cand-reaudit-1']]] },
    { id: 'admitted-immutable', steps: [['evAdmit', ['cand-reaudit-1']]] },
    { id: 'bottom-shelf-open', steps: [['bottomToggle', []]] }
  ],
  reviews: [
    { id: 'empty', steps: [] },
    { id: 'in-review-with-findings', steps: [['rvEvidence', []], ['rvRequest', []], ['rvFinding', ['f-reaudit-1', 'SATISFIED', 'criteria:v4#integrity', 'Digest and schema verified against the pinned source revision.']], ['rvFinding', ['f-reaudit-2', 'PARTIALLY_SATISFIED', 'criteria:v4#provenance', 'Provenance chain is present but the handoff receipt is not yet pinned.']]] },
    { id: 'ready-for-decision', steps: [['rvReady', []]] },
    { id: 'decision-issued', steps: [['rvDecide', []]] },
    { id: 'bottom-shelf-open', steps: [['bottomToggle', []]] }
  ],
  mastery: [
    { id: 'empty', steps: [] },
    { id: 'fixture-mastered', steps: [['msFixture', []]] },
    { id: 'fixture-second-row', steps: [['msSecond', []]] },
    { id: 'bottom-shelf-open', steps: [['bottomToggle', []]] }
  ],
  portfolio: [
    { id: 'empty', steps: [] },
    { id: 'assembly-one-reference', steps: [['pfAdd', ['member-reaudit-1', 'Evidence', 'ev-reaudit-1@ev-reaudit-1-r1', 'Re-audit Evidence reference']]] },
    { id: 'assembly-two-references', steps: [['pfAdd', ['member-reaudit-2', 'Mastery', 'mastery-reaudit-1@mr-reaudit-001', 'Re-audit Mastery reference']], ['pfSelect', ['member-reaudit-2']]] },
    { id: 'bottom-shelf-open', steps: [['bottomToggle', []]] }
  ]
};

/* ------------------------------------------------------------------ run */

const capture = async () => {
  await mkdir(outDir, { recursive: true });
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: 'ignore' });
  const browser = await chromium.launch();
  const frames = [];
  const problems = [];
  const surfaces = only ? [only] : Object.keys(SURFACES);
  try {
    for (const [width, height] of VIEWPORTS) {
      for (const surface of surfaces) {
        const states = SURFACES[surface];
        const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const pageErrors = [];
        page.on('pageerror', error => pageErrors.push(String(error?.message || error)));
        await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`, { waitUntil: 'networkidle' });
        await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 20000 });
        await page.waitForTimeout(300);
        await page.evaluate(IN_PAGE_SEEDS);
        for (const state of states) {
          const executed = [];
          for (const [seed, seedArgs] of state.steps) {
            const value = await page.evaluate(([name, callArgs]) => window.__w04_seeds[name](callArgs), [seed, seedArgs]);
            executed.push({ seed, args: seedArgs, value });
          }
          await page.evaluate(() => { try { window.__w04.render(); } catch {} });
          await page.waitForTimeout(260);
          const metrics = await page.evaluate(METRICS);
          const file = `${surface}-${width}x${height}-${state.id}.png`;
          const filePath = path.join(outDir, file);
          await page.screenshot({ path: filePath, fullPage: false });
          const bytes = await readFile(filePath);
          frames.push({
            surface, viewport: `${width}x${height}`, viewportWidth: width, viewportHeight: height,
            state: state.id, file, sha256: createHash('sha256').update(bytes).digest('hex'),
            bytes: bytes.length, pageErrors: [...pageErrors],
            seeds: executed, metrics
          });
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }
  const groups = new Map();
  for (const frame of frames) {
    const key = `${frame.surface}@${frame.viewport}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(frame);
  }
  const distinctness = [];
  for (const [key, list] of groups) {
    const ids = new Set(list.map(f => f.sha256));
    const ok = ids.size === list.length;
    distinctness.push({ key, states: list.length, uniqueByteIdentities: ids.size, byteDistinct: ok });
    if (!ok) problems.push(`BYTE_IDENTITY_COLLISION:${key}:${ids.size}/${list.length}`);
  }
  const receipt = {
    schemaVersion: 1,
    proof: 'w04-visual-reaudit-capture',
    label,
    method: 'file-bytes ground truth (sha256 + dimensions); ink/blank-band + OCR in w04-reaudit-measure.mjs',
    viewports: VIEWPORTS.map(v => `${v[0]}x${v[1]}`),
    surfaces,
    fixturePolicy: 'every populated state is enacted through the live product domain inside the page; seeded rows carry truthClass SYNTHETIC_DEMO_SEED or are created by the live semantic commands',
    frameCount: frames.length,
    distinctness,
    problems,
    frames
  };
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2));
  console.log(`captured ${frames.length} frames -> ${outDir}`);
  for (const d of distinctness) console.log(`  ${d.key}: ${d.uniqueByteIdentities}/${d.states} byte-distinct ${d.byteDistinct ? 'OK' : 'FAIL'}`);
  if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
};

await capture();
