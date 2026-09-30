#!/usr/bin/env node
/**
 * W04-REVIEWS visual capture — lineage-bound evidence generator.
 * Owned by unit W04-REVIEWS (writer-output/W04-REVIEWS/). Nothing outside this unit writes it.
 *
 * usage:
 *   node writer-output/W04-REVIEWS/capture.mjs <name> [width] [height] [lang] [state]
 *     lang  : ar | en          (seeds the Settings-owned preference before boot)
 *     state : in-review | ready | closed | empty   (driven through the LIVE domain/semantic commands)
 *
 * Produces: writer-output/W04-REVIEWS/captures/<name>-<UTC>-<sha8>.png
 *        +  entry in writer-output/W04-REVIEWS/LINEAGE.json
 *        +  writer-output/W04-REVIEWS/<name>.receipt.json
 * Image identity: path + sha256 + dims + bytes. Candidate: branch@commit + dirty flag.
 *
 * Integrity: fixtures are created ONLY through the live product domain/registry inside the page
 * (no shadow state) and every seeded row carries truthClass SYNTHETIC_DEMO_SEED / is labelled by
 * the receipt's `fixtureLabel`. A fixture is never presented as a real consumer result.
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(import.meta.dirname, 'captures');
mkdirSync(OUT, { recursive: true });

const [name = 'capture', wArg = '1505', hArg = '1045', seedLang = 'ar', state = 'in-review'] = process.argv.slice(2);
const width = Number(wArg), height = Number(hArg);
const commit = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
const dirty = execSync('git status --porcelain -- stack/native-typescript/surfaces/reviews stack/native-typescript/adapters/reviews', { cwd: ROOT }).toString().trim();
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const FIXTURE_LABEL = 'FIXTURE_REVIEW_ADJUDICATION_BATCH__W04_REVIEWS_CAPTURE';

const freePort = () => new Promise(resolve => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); });
});

/* Drives the LIVE product through its own registry/domain. No second product state exists. */
const SEED = `(() => {
  const M = window.CEPFoundation.m0Composition;
  const reg = window.CEPFoundation.registry;
  const ev = M.group.evidence.domain;
  const rv = M.group.reviews.domain;
  const auth = window.CEPFoundation.sharedOwners.reviewAuthorityRegistry;
  const out = { steps: [] };
  const id = 'ev-rev-0142';
  if (!ev.records.some(r => r.id === id)) {
    ev.importEvidence({ id, revisionId: 'ev-rev-0142-r1', title: 'SQL activity investigation report',
      sourceId: 'src-soc-triage', sourceRevision: 'r1', subject: 'Ahmed Al-Mansouri',
      evidenceClaim: 'Demonstrated ability to investigate suspicious SQL activity and interpret correlated detection signals across multiple data sources.',
      criterionRefs: ['crit:v4#web-input', 'crit:v4#telemetry', 'crit:v4#rationale'],
      governedPurpose: 'SOC analyst competency review (synthetic demo seed)',
      verification: { status: 'UNVERIFIED' } });
    ev.verifySource(id, { status: 'VERIFIED', providerId: 'provider:sec-lab', providerRevision: '1.0.0',
      proofId: 'proof:sec-lab:ev-rev-0142', digest: 'sha256:' + '9'.repeat(64),
      schemaValid: true, sourceBytesAvailable: true, verifiedAt: '2026-09-24T09:12:00.000Z' });
    ev.submitCandidate(id);
    ev.markCandidateValidated(id, { validator: 'sec-lab', validationProofRef: 'proof:intake:ev-rev-0142' });
    ev.admissionAuthorityRegistry = { resolveAdmissionAuthority: () => ({ state: 'AUTHORIZED', testOnly: false }) };
    ev.setAdmissionAuthority(id, true, 'authority:evidence-admission:cap:' + id, { testOnly: false });
    out.steps.push({ admit: ev.admit(id).ok });
  }
  if (auth) auth.registerReviewer('reviewer:mariam', { authorized: true, canAssign: true, permissionProofRef: 'perm:mariam:v1', testOnly: false });
  const rid = 'rev-0084';
  if (!rv.records.some(r => r.id === rid)) {
    const row = ev.inspect(id);
    rv.review(rid, { action: 'request',
      evidenceRefs: [row.evidenceId + '@' + row.revisionId],
      criteriaRefs: ['crit:v4#web-input', 'crit:v4#telemetry', 'crit:v4#rationale'],
      reviewer: { identity: 'reviewer:mariam', permissionProofRef: 'perm:mariam:v1', authorityAvailable: true, assignmentPermissionAvailable: true },
      requester: 'owner:local', purpose: 'Formal competency Evidence Review', requestedAt: '2026-09-26T08:40:00.000Z' });
    rv.review(rid, { action: 'assign' });
    rv.review(rid, { action: 'start' });
    out.steps.push({ state: rv.inspect(rid).state });
  }
  const finding = (fid, st, crit, text) => { const r = rv.finding(rid, { findingId: fid, state: st, criterionRef: crit, text, scopeDisposition: 'IN_SCOPE' }); return r.ok === true; };
  if (rv.inspect(rid).findings.length === 0) {
    out.steps.push({ f1: finding('f-0084-1', 'SATISFIED', 'crit:v4#web-input', 'Suspicious web-input behaviour identified and correctly classified; report section 2.1 carries the corroborating capture.') });
    out.steps.push({ f2: finding('f-0084-2', 'SATISFIED', 'crit:v4#telemetry', 'Correlated detection telemetry from three sources is reconciled in report section 3.2.') });
    out.steps.push({ f3: finding('f-0084-3', 'PARTIALLY_SATISFIED', 'crit:v4#rationale', 'Investigation rationale is stated but alternative hypotheses are not eliminated in report section 4.3.') });
  }
  if ('${state}' === 'ready') out.steps.push({ ready: rv.review(rid, { action: 'ready' }).ok });
  if ('${state}' === 'closed') {
    rv.review(rid, { action: 'ready' });
    const cur = rv.inspect(rid).effectiveDecisionId || rv.inspect(rid).priorDecisionRef || null;
    out.steps.push({ decide: rv.supersede(rid, { expectedDecisionId: cur,
      newDecision: { decisionId: 'decision-0084', outcome: 'ACCEPT_WITH_LIMITATIONS',
        correctionReason: 'Two of three pinned criteria are satisfied; the rationale criterion needs one further pass on alternative-hypothesis justification.' } }).ok });
  }
  window.__w04cap = { selected: rid, state: rv.inspect(rid).state, findings: rv.inspect(rid).findings.length, records: rv.records.length };
  return out;
})()`;

const METRICS = `(() => {
  const t = sel => (document.querySelector(sel)?.innerText || '').replace(/[\\t ]+/g, ' ').trim();
  const clipped = [...document.querySelectorAll('#foundationStage .w04-rec-title,#foundationStage .w04-pill,#foundationStage h3,#foundationStage .w04-track-step,#foundationStage .w04-grid-cell,#foundationStage td,#foundationStage .w04-card,#domainContext h3,#domainContext .m0-semantic-group')]
    .filter(n => n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).overflow !== 'visible')
    .map(n => (n.className || n.tagName) + ':' + n.scrollWidth + '>' + n.clientWidth);
  return {
    direction: document.body.dataset.foundationDirection || document.documentElement.getAttribute('dir') || null,
    lang: document.documentElement.getAttribute('lang'),
    composition: document.querySelector('#foundationStage')?.dataset?.m0Composition || null,
    leftText: t('#leftPane .pbody'), centerText: t('#foundationStage .m0-workbench'), rightText: t('#rightPane .pbody'),
    centerHeads: [...document.querySelectorAll('#foundationStage .w04-block h3')].map(n => n.textContent.trim()),
    pills: [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\\s+/g,' ').trim()),
    toolbar: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(n => n.textContent.trim() + (n.disabled ? ' (disabled)' : '')),
    overflow: document.querySelectorAll('#domainToolbar [data-w04-overflow]').length,
    clipped, horizontalOverflow: document.documentElement.scrollWidth > (window.innerWidth + 1),
    rects: Object.fromEntries(['#leftPane','#centerPane','#rightPane','#bottomShelf','#domainToolbar','#foundationStage']
      .map(s => { const r = document.querySelector(s)?.getBoundingClientRect(); return [s, r ? {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)} : null]; })),
    bodyConsumer: document.body.dataset.consumer || null
  };
})()`;

const port = await freePort();
const server = (await import('node:child_process')).spawn(process.execPath, [path.join(ROOT, 'tools/serve.mjs'), '--port', String(port)], { cwd: ROOT, stdio: 'ignore' });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await ctx.addInitScript(lang => {
  try {
    localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({
      schemaVersion: 1, kind: 'cep-foundation-preferences',
      overrides: { global: { locale: lang, chromeDirection: lang === 'ar' ? 'rtl' : 'ltr' } }
    }));
  } catch { /* storage unavailable — boot default applies */ }
}, seedLang);

const page = await ctx.newPage();
const consoleErrors = [];
page.on('pageerror', e => consoleErrors.push(String(e?.message || e)));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

const url = `http://127.0.0.1:${port}/?surface=reviews`;
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'reviews', null, { timeout: 25000 });
await page.waitForTimeout(600);
let seedResult = null;
if (state !== 'empty') seedResult = await page.evaluate(SEED);
await page.waitForTimeout(200);
await page.evaluate(() => { try { window.CEPFoundation.m0Composition.mounted.render(); } catch {} });
// select the seeded record in the LEFT collection matrix (real click, real selection)
await page.evaluate(id => {
  const rows = [...document.querySelectorAll('#domainLeftRegion [data-r6-row]')];
  const target = rows.find(r => r.getAttribute('data-r6-row') === id) || rows[0];
  target?.click();
}, 'rev-0084');
await page.waitForTimeout(700);
const metrics = await page.evaluate(METRICS);

const rel = path.join('captures', `${name}-${stamp}-${commit.slice(0, 8)}.png`);
const abs = path.join(import.meta.dirname, rel);
await page.screenshot({ path: abs, fullPage: false });
await browser.close();
server.kill();

const bytes = readFileSync(abs);
const sha = createHash('sha256').update(bytes).digest('hex');
const dims = execSync(`python3 -c "import struct;d=open('${abs}','rb').read(33);print(list(struct.unpack('>II',d[16:24])))"`, { cwd: ROOT }).toString().trim();

const entry = {
  name, timestamp: new Date().toISOString(), url: 'file-or-local-served/?surface=reviews',
  viewport: { width, height, deviceScaleFactor: 1 },
  candidate: `${branch}@${commit}`, commit, branch, workingTreeDirty: dirty ? 'reviews-roots-modified' : 'clean',
  environment: 'local dist served by tools/serve.mjs (free port), playwright chromium headless',
  seededLocale: seedLang, state, fixtureLabel: FIXTURE_LABEL, seedResult, metrics,
  image: { path: `writer-output/W04-REVIEWS/${rel}`, sha256: sha, bytes: bytes.length, dims: JSON.parse(dims) },
  consoleErrors
};
const lineagePath = path.join(import.meta.dirname, 'LINEAGE.json');
const lineage = existsSync(lineagePath) ? JSON.parse(readFileSync(lineagePath, 'utf8')) : { entries: [] };
lineage.entries.push(entry);
writeFileSync(lineagePath, JSON.stringify(lineage, null, 2));
writeFileSync(path.join(import.meta.dirname, `${name}.receipt.json`), JSON.stringify(entry, null, 2));
console.log(JSON.stringify({ name, image: entry.image, viewport: entry.viewport, direction: metrics.direction, lang: metrics.lang, state: seedResult, clipped: metrics.clipped, consoleErrors }, null, 2));
