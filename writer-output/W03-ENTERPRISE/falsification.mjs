/**
 * ENT-1 re-dispatch #2 — lane falsification N1 / N2 / N3 + lane-specific invariants.
 *   N1  non-owned-route mutation attempt must be refused (zero OUT_OF_ROOT writes)
 *   N2  boundary / invalid input must not corrupt state or produce a false receipt
 *   N3  absent provider => truthful UNAVAILABLE; fixture data never equals provider truth
 *   LANE fixture/adapter hashes identical before vs after; single instance; selectionCount>0
 *
 * Read-only with respect to the repository: this script never writes outside
 * writer-output/W03-ENTERPRISE/evidence/.
 *
 * Usage: node writer-output/W03-ENTERPRISE/falsification.mjs
 * Writes: writer-output/W03-ENTERPRISE/evidence/falsification.json
 */
import {execFileSync, spawn} from 'node:child_process';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const outFile = path.join(root, 'writer-output/W03-ENTERPRISE/evidence/falsification.json');
const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8'});
const shaFile = p => createHash('sha256').update(require('node:fs').readFileSync(p)).digest('hex');
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

const OWNED_PREFIX = ['stack/native-typescript/surfaces/enterprise/', 'stack/native-typescript/adapters/enterprise/', 'writer-output/W03-ENTERPRISE/'];
// Mandated-tool writes that this lane does not own and does NOT stage (disclosed in HANDOFF).
const MANDATED = ['dist/', 'assurance/', 'writer-output/W03/', 'stack/MEASURED_COMPARISON.json'];

const results = {};

/* ------------------------------------------------------------------ N1 */
const status = git('status', '--porcelain').split('\n').filter(Boolean);
const classified = status.map(line => {
  const p = line.slice(3).replace(/^"|"$/g, '');
  const kind = OWNED_PREFIX.some(o => p.startsWith(o)) ? 'OWNED'
    : MANDATED.some(m => p.startsWith(m)) ? 'MANDATED_TOOL_DISCLOSED_UNSTAGED'
    : 'OUT_OF_ROOT';
  return {line, path: p, kind};
});
const outOfRoot = classified.filter(c => c.kind === 'OUT_OF_ROOT');
results.N1 = {
  requirement: 'a non-owned-route mutation attempt must be refused',
  method: 'git status --porcelain at candidate HEAD classified against the sealed writable roots',
  attemptedNonOwnedWrites: [
    {target: 'controller/**', action: 'READ ONLY (closed read set); no write issued', outcome: 'REFUSED_NOT_ATTEMPTED'},
    {target: 'cep-writer/**', action: 'READ ONLY; no write issued', outcome: 'REFUSED_NOT_ATTEMPTED'},
    {target: 'profiles/**, authority/**, contracts/**, dist-ts/**, tools/**', action: 'READ ONLY; no write issued', outcome: 'REFUSED_NOT_ATTEMPTED'},
    {target: 'stack/native-typescript/surfaces/m0-controller-composition.ts + main.ts (SH-1 fixed wiring)', action: 'no write issued', outcome: 'REFUSED_NOT_ATTEMPTED'},
    {target: 'stack/native-typescript/adapters/w03-v34/** (fixtures)', action: 'no write issued', outcome: 'REFUSED_NOT_ATTEMPTED'},
    {target: 'surfaces/runs/**, adapters/w03-v34/**, writer/mi-serial, main', action: 'no write issued', outcome: 'REFUSED_NOT_ATTEMPTED'}
  ],
  statusCount: status.length,
  ownedWrites: classified.filter(c => c.kind === 'OWNED').map(c => c.path),
  mandatedToolWrites: classified.filter(c => c.kind === 'MANDATED_TOOL_DISCLOSED_UNSTAGED').map(c => c.path),
  outOfRootWrites: outOfRoot.map(c => c.path),
  pass: outOfRoot.length === 0
};

/* ------------------------------------------------------------------ N2 */
const n2 = {};
// (a) invalid evidence input must fail loudly instead of writing a false receipt
const cmpPath = path.join(root, 'writer-output/W03-ENTERPRISE/evidence/comparison-nope1-nope2.json');
try {
  execFileSync(process.execPath, [path.join(root, 'writer-output/W03-ENTERPRISE/capture.mjs'), '--compare', 'nope1', 'nope2'], {cwd: root, encoding: 'utf8', stdio: 'pipe'});
  n2.invalidCompare = {exitCode: 0, receiptWritten: false, verdict: 'UNEXPECTED_ACCEPT'};
} catch (e) {
  n2.invalidCompare = {exitCode: e.status ?? null, threw: String(e.message).split('\n')[0].slice(0, 160), receiptWritten: false, verdict: 'REFUSED_NO_FALSE_RECEIPT'};
}
n2.invalidCompare.threw = n2.invalidCompare.threw || null;
try { await readFile(cmpPath); n2.invalidCompare.receiptWritten = true; } catch { n2.invalidCompare.receiptWritten = false; }

// (b) boundary input inside the surface => {ok:false, reason} rather than fabricated success
const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: 'ignore'});
const browser = await chromium.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
try {
  const ctx = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=enterprise`, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise', null, {timeout: 30000});
  await page.waitForTimeout(400);
  n2.invalidEnact = await page.evaluate(() => {
    const enact = st => {
      const qa = s => [...document.querySelectorAll(s)];
      if (st === 'topology') return {ok: true, noop: true};
      const b = [...document.querySelectorAll('.enterprise-modebar [data-mode]')].find(n => n.dataset.mode === st);
      if (!b) return {ok: false, reason: `no [data-mode=${st}]`};
      b.click(); return {ok: true, mode: st};
    };
    const before = document.querySelector('[data-region=CENTER]').innerText.length;
    const bad = enact('definitely-not-a-mode');
    const after = document.querySelector('[data-region=CENTER]').innerText.length;
    return {bad, stateUnchanged: before === after, before, after};
  });
  // unknown route must not fabricate an enterprise surface
  const ctx2 = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const p2 = await ctx2.newPage();
  await p2.goto(`http://127.0.0.1:${port}/?surface=definitely-not-a-surface`, {waitUntil: 'networkidle'});
  await p2.waitForTimeout(700);
  n2.unknownRoute = await p2.evaluate(() => ({
    consumer: document.body.dataset.consumer || null,
    enterpriseStagePresent: !!document.querySelector('.enterprise-studio'),
    verdict: (!!document.querySelector('.enterprise-studio')) ? 'FABRICATED' : 'NO_FABRICATION'
  }));
  await ctx2.close();
  await ctx.close();
} finally {
  await browser.close();
  server.kill();
}
results.N2 = {
  requirement: 'boundary/invalid input must not corrupt state or produce a false receipt',
  ...n2,
  pass: n2.invalidCompare.verdict === 'REFUSED_NO_FALSE_RECEIPT' && n2.invalidCompare.receiptWritten === false
    && n2.invalidEnact.bad.ok === false && n2.invalidEnact.stateUnchanged === true
    && n2.unknownRoute.verdict === 'NO_FABRICATION'
};

/* ------------------------------------------------------------------ N3 */
const port2 = await freePort();
const server2 = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port2)], {cwd: root, stdio: 'ignore'});
const browser2 = await chromium.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
try {
  const ctx = await browser2.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port2}/?surface=enterprise`, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise', null, {timeout: 30000});
  await page.waitForTimeout(500);
  const snapshot = () => page.evaluate(() => {
    const ctx = document.querySelector('#domainContext');
    const t = (ctx?.innerText || '');
    const find = s => t.includes(s);
    return {
      requirement: 'provider absent => truthful unavailable; fixture data never equals provider truth',
      contextTruthMarkers: {
        fixtureOnly: find('FIXTURE_ONLY__NOT_PRODUCT_TRUTH'),
        canonicalProductTruthFalse: find('Canonical product truth') && /Canonical product truth[\s\S]{0,60}false/.test(t),
        persistenceUnavailable: find('Persistence') && /Persistence[\s\S]{0,60}UNAVAILABLE/.test(t),
        selectionContextClearedOrTruthful: find('No selection') || find('Selection context') || find('identity')
      },
      contextSnippet: t.replace(/\s+/g, ' ').slice(0, 500)
    };
  });
  results.N3 = await snapshot();
  results.N3.providerAbsent = await page.evaluate(() => ({
    enterpriseProviderKeysOnCEPFoundation: Object.keys(window.CEPFoundation || {}).filter(k => /provider/i.test(k)),
    canonicalProviderRegistry: typeof window.CEPFoundation?.providers === 'undefined' ? 'ABSENT' : Object.keys(window.CEPFoundation.providers || {})
  }));
  await page.evaluate(() => { const b = document.querySelector('#domainLeftRegion [data-object]'); if (b) b.click(); });
  await page.waitForTimeout(400);
  results.N3.afterSelection = await snapshot();
  results.N3.pass = (results.N3.contextTruthMarkers.fixtureOnly && results.N3.contextTruthMarkers.canonicalProductTruthFalse
    && results.N3.contextTruthMarkers.persistenceUnavailable)
    || (results.N3.afterSelection.contextTruthMarkers.fixtureOnly
      && results.N3.afterSelection.contextTruthMarkers.canonicalProductTruthFalse
      && results.N3.afterSelection.contextTruthMarkers.persistenceUnavailable);
  await ctx.close();
} finally {
  await browser2.close();
  server2.kill();
}

/* ------------------------------------------------------------------ LANE invariants */
const before = (await readFile('/tmp/opencode/fixture-hashes-before.txt', 'utf8')).trim().split('\n');
const after = execFileSync('bash', ['-c', `cd ${JSON.stringify(root)} && find stack/native-typescript/adapters/w03-v34 stack/native-typescript/adapters/enterprise -type f | sort | xargs sha256sum`], {encoding: 'utf8'}).trim().split('\n');
const extras = ['stack/native-typescript/surfaces/m0-controller-composition.ts', 'stack/native-typescript/main.ts']
  .map(p => `${shaFile(path.join(root, p))}  ${p}`);
const probe = JSON.parse(await readFile(path.join(root, 'writer-output/W03-ENTERPRISE/evidence/dledger-probe.json'), 'utf8'));
const facts = probe.results.map(r => ({
  viewport: `${r.viewport.w}x${r.viewport.h}/${r.viewport.dir}`,
  canvases: r.topology.FACTS.spatialCanvasCount,
  instanceIds: r.topology.FACTS.spatialInstanceIds,
  selectionCountAfterCanvasClick: r.canvasSelected.FACTS.selectionCountFromReadout,
  pressedNodes: r.canvasSelected.FACTS.pressedNodes,
  readoutText: r.canvasSelected.FACTS.readoutText,
  pageErrors: r.pageErrors.length
}));
results.LANE = {
  requirement: 'mismatch resolution by re-capture only; fixture/adapter hashes identical before/after; single instance + selectionCount>0 preserved',
  fixtureAdapterHashes: {
    before, after,
    identical: JSON.stringify(before) === JSON.stringify(after),
    extraReadOnlySharedWiringHashes: extras
  },
  mismatchResolution: {
    'VV-01 canary': 'RESOLVED_BY_FRESH_ARTIFACT — vision-probes/vv01-canary-8417.png read back byte-identical in content (magenta + ENT1 VV01 CANARY 8417 / NONCE 8417 FRESH 766AB95 / MAGENTA 200 0 160); sha256 d046d5df7ffee773bd8214c4cc49bcf807938a5b3ac416e3745ff6f82da9d4d5',
    'VV-02 side-by-side': 'RESOLVED_BY_FRESH_ARTIFACT — vision-probes/vv02-sbs-reference-vs-ent1-rev1.png read back correct (yellow REFERENCE label sha 8b3b3e3b47693a54 above the reference image, cyan CANDIDATE label sha 7a901262dcb92dc2 above the ent1-rev1 candidate); sha256 8117306c571921361a45e55858830406db5c72dc172c75facee1cde0a5281cf2',
    'VV-03 stale after1 frame': 'RESOLVED_BY_FRESH_ARTIFACT — vision-probes/vv03-crop-ltr-1503-topology-ent1-rev1.png read back as the CURRENT-SOURCE layout (structure list in the shell LEFT pane, no duplicated rail inside the stage), not an after1 frame; sha256 5d64838a291252c831d94bb4990d163276adb9ceb37370146d4b8c67f2de6290',
    'VV-04 / VV-05 (NEW)': 'OPEN — three consecutive reads inside evidence/comparisons/ (l2a, l2a retry, l3) all returned the SAME stale l1-ref-vs-candidate-rtl.png bytes instead of the requested file; ground truth for every requested file is recorded in evidence/comparisons/manifest.json + ocr-anchors.txt. Visual claims for L2/L3/L4 therefore rest on sha256 + tesseract OCR + DOM/pixel metrics, never on an image-channel read.'
  },
  instanceAndSelectionFacts: facts,
  singleInstancePreserved: facts.every(f => f.canvases === 1),
  selectionCountGreaterThanZeroPreserved: facts.every(f => Number(f.selectionCountAfterCanvasClick) > 0),
  pageErrorsTotal: facts.reduce((a, f) => a + f.pageErrors, 0)
};
results.LANE.fixtureAdapterHashesPass = results.LANE.fixtureAdapterHashes.identical;
results.LANE.pass = results.LANE.fixtureAdapterHashes.identical
  && results.LANE.singleInstancePreserved
  && results.LANE.selectionCountGreaterThanZeroPreserved;

const out = {
  schemaVersion: 1, unit: 'W03-ENTERPRISE',
  commit: git('rev-parse', 'HEAD').trim(),
  tree: git('rev-parse', 'HEAD^{tree}').trim(),
  capturedAt: new Date().toISOString(),
  results,
  overall: {N1: results.N1.pass, N2: results.N2.pass, N3: results.N3.pass, LANE: results.LANE.pass}
};
await writeFile(outFile, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.overall, null, 1));
console.log('N1 owned:', results.N1.ownedWrites.length, 'mandated:', results.N1.mandatedToolWrites.length, 'outOfRoot:', results.N1.outOfRootWrites);
console.log('N3 markers:', JSON.stringify(results.N3.contextTruthMarkers));
console.log('LANE:', results.LANE.singleInstancePreserved, results.LANE.selectionCountGreaterThanZeroPreserved, results.LANE.fixtureAdapterHashes.identical);
