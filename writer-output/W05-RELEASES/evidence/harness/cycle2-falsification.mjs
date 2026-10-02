/**
 * W05-RELEASES / REL-1 — mandatory falsification battery (cycle 2).
 *
 * N1 non-owned-route mutation attempt must refuse (runtime command probe + static git scope)
 * N2 boundary/invalid input -> no corruption, no false receipt
 * N3 act without prerequisite data/provider -> UNAVAILABLE, never fabricated
 * N4 duplicate mechanics (run separately: node tools/check-duplicate-mechanics.mjs)
 * N5 suite twice identical (run separately, merged into this report)
 * LANE-empty-truth + LANE-compare-blocked render truthfully (browser)
 * LANE-ceilings: release-readiness-is-authorization and release-authorization-is-deployment stay FALSE
 * LANE-D06 bottom shelf: release-meaningful projection, no raw diagnostics, localised per session
 *
 * Output: writer-output/W05-RELEASES/evidence/cycle2/falsification.json (+ after-* captures)
 */
import {spawn, execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';

const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(path.join(root, 'package.json'));
const {chromium} = require('playwright');
const OUT = path.join(root, 'writer-output/W05-RELEASES/evidence/cycle2');
await mkdir(OUT, {recursive: true});

const results = {
  lane: 'REL-1',
  harness: 'writer-output/W05-RELEASES/evidence/harness/cycle2-falsification.mjs',
  lineage: {
    commit: execSync('git rev-parse HEAD', {cwd: root}).toString().trim(),
    stackTree: execSync('git rev-parse HEAD:stack/native-typescript', {cwd: root}).toString().trim(),
    branch: execSync('git branch --show-current', {cwd: root}).toString().trim(),
    delta: execSync('git status --porcelain -- stack/native-typescript/surfaces/releases stack/native-typescript/adapters/releases', {cwd: root}).toString().trim().split('\n').filter(Boolean),
    capturedAt: new Date().toISOString()
  },
  checks: [],
  captures: []
};
const check = (id, ok, expected, observed) => results.checks.push({id, status: ok ? 'PASS' : 'FAIL', expected, observed});

/* ── static scope: only writable roots mutated (N1) ── */
{
  const changed = execSync('git status --porcelain', {cwd: root}).toString().replace(/\s+$/, '').split('\n').filter(Boolean)
    .map(line => (line.slice(0, 2).trim() ? line.slice(3) : line.slice(3)))
    .filter(p => !p.includes('.runtime-proof') && !p.startsWith('writer-output/W05/') && p !== 'dist' && !p.startsWith('assurance/'));
  const allowed = p => p.startsWith('stack/native-typescript/surfaces/releases/') ||
    p.startsWith('stack/native-typescript/adapters/releases/') ||
    p.startsWith('writer-output/W05-RELEASES/') ||
    p === 'dist' || p.startsWith('dist/') || p.startsWith('assurance/') || p === 'stack/MEASURED_COMPARISON.json' ||
    p.startsWith('writer-output/W05/.runtime-proof') || p.startsWith('writer-output/W05/evidence/') || p === 'writer-output/W05/BROWSER_RECEIPT.json';
  const offending = changed.filter(p => !allowed(p));
  check('N1.no-mutation-outside-writable-roots', offending.length === 0, [], offending);
}

/* ── node-side: N2 / N3 / ceiling / D-06 shape ── */
const {createReleasesSurfaceComposition} = await import(path.join(root, 'dist/surfaces/releases/composition.js'));
const {ReleasesDomainAdapter} = await import(path.join(root, 'dist/adapters/releases/domain-adapter.js'));
const {SemanticCommandBus} = await import(path.join(root, 'dist/foundation/global/commands.js'));
const hex = c => c.repeat(64);
const candidate = (patch = {}) => ({candidateId: 'cand-1', commitSHA: hex('a'), treeSHA: hex('b'), artifactDigest: hex('c'), state: 'TECHNICALLY_READY', evidenceDigest: hex('d'), authorization: 'NONE', deployment: 'UNKNOWN', deploymentObservedAt: null, ...patch});

{ /* N3 — prerequisite data/provider missing -> UNAVAILABLE, never fabricated */
  const empty = new ReleasesDomainAdapter();
  const inspect = empty.inspect();
  check('N3.empty-adapter-inspect-NO_CANDIDATE', inspect.ok === false && inspect.code === 'NO_CANDIDATE', 'NO_CANDIDATE', inspect);
  check('N3.empty-adapter-has-zero-fabricated-candidates', empty.rows().length === 0, 0, empty.rows().length);

  const noProvider = new ReleasesDomainAdapter({candidates: [candidate()]});
  noProvider.select('cand-1');
  const auth = noProvider.requestAuthorization();
  check('N3.auth-provider-missing-UNAVAILABLE', auth.ok === false && auth.code === 'AUTHORIZATION_REQUEST_PROVIDER_UNAVAILABLE', 'AUTHORIZATION_REQUEST_PROVIDER_UNAVAILABLE', auth);
  const after = noProvider.inspect('cand-1');
  check('N3.auth-provider-missing-no-state-change', after.candidate.authorization === 'NONE' && after.candidate.deployment === 'UNKNOWN', 'NONE/UNKNOWN', `${after.candidate.authorization}/${after.candidate.deployment}`);

  const noCompareOwner = createReleasesSurfaceComposition({adapter: new ReleasesDomainAdapter({candidates: [candidate(), candidate({candidateId: 'cand-2'})]}), commands: new SemanticCommandBus()});
  const cmp = noCompareOwner.commands.execute('releases.compare', {leftId: 'cand-1', rightId: 'cand-2'});
  check('N3.compare-owner-missing-blocked', cmp.ok === false && /ANALYTICAL_COMPARE/.test(String(cmp.code || cmp.reason || '')), 'ANALYTICAL_COMPARE_INTEGRATION_REQUIRED', cmp);

  const bus = createReleasesSurfaceComposition({commands: new SemanticCommandBus()});
  const emptyProjection = bus.bottomProjection(null);
  const truthsEmpty = emptyProjection.sections.find(s => s.id === 'truths').value;
  check('N3.bottom-projection-no-candidate-is-unavailable', /no candidate bound/i.test(truthsEmpty) && !/TECHNICALLY_READY/.test(truthsEmpty), 'no candidate bound + no readiness value', truthsEmpty);
}
{ /* N2 — boundary/invalid input -> no corruption, no false receipt */
  const {AnalyticalCompareOwner} = await import(path.join(root, 'dist/foundation/analytical/compare.js'));
  const dup = new ReleasesDomainAdapter({candidates: [candidate()], analyticalCompareOwner: new AnalyticalCompareOwner()});
  let dupCode = null;
  try { dup.compare({leftId: 'cand-1', rightId: 'cand-1'}); } catch (e) { dupCode = String(e.message); }
  check('N2.compare-same-identity-rejected', dupCode === 'RELEASE_COMPARE_DISTINCT_CANDIDATES_REQUIRED', 'RELEASE_COMPARE_DISTINCT_CANDIDATES_REQUIRED', dupCode);

  let identityCode = null;
  try { new ReleasesDomainAdapter({candidates: [candidate({commitSHA: 'nope'})]}); } catch (e) { identityCode = String(e.message); }
  check('N2.invalid-identity-rejected', identityCode === 'RELEASE_CANDIDATE_IDENTITY_INVALID', 'RELEASE_CANDIDATE_IDENTITY_INVALID', identityCode);

  const c = createReleasesSurfaceComposition({adapter: new ReleasesDomainAdapter({candidates: [candidate()]}), commands: new SemanticCommandBus()});
  const before = c.commands.receipts.length;
  const blocked = c.commands.execute('releases.compare', {});
  check('N2.compare-without-pair-no-receipt', blocked.ok === false && c.commands.receipts.length === before, 'ok:false + receipts unchanged', {ok: blocked.ok, before, after: c.commands.receipts.length});

  const unknownInspect = c.adapter.inspect('does-not-exist');
  check('N2.inspect-unknown-candidate-NO_CANDIDATE', unknownInspect.ok === false && unknownInspect.code === 'NO_CANDIDATE', 'NO_CANDIDATE', unknownInspect);

  const unknownCommand = c.commands.execute('releases.deploy', {id: 'cand-1'});
  check('N2.nonexistent-domain-command-refused', unknownCommand.ok === false, 'ok:false', unknownCommand);
}
{ /* N1 runtime — non-owned / out-of-scope route attempts must refuse, state unchanged */
  const a = new ReleasesDomainAdapter({candidates: [candidate()]});
  const c = createReleasesSurfaceComposition({adapter: a, commands: new SemanticCommandBus()});
  const snapshot = () => JSON.stringify({authorization: a.inspect('cand-1').candidate.authorization, deployment: a.inspect('cand-1').candidate.deployment, history: a.inspect('cand-1').timeline, receipts: c.commands.receipts.length});
  const before = snapshot();
  const attempts = ['reviews.verdict', 'runs.start', 'release.publish', 'releases.deploy', 'shell.navigate'];
  const outcomes = {};
  for (const id of attempts) outcomes[id] = c.commands.execute(id, {id: 'cand-1'});
  const after = snapshot();
  check('N1.non-owned-commands-refused', Object.values(outcomes).every(v => v && v.ok === false), 'every attempt ok:false', outcomes);
  check('N1.no-state-change-from-refused-attempts', before === after, 'identical state snapshot', {before, after});
  const commandIds = [...c.commands.items()].map(i => i.id);
  check('N1.no-deploy-or-authorize-execution-command-registered', commandIds.every(id => !/deploy|publish|execute/i.test(id)), [], commandIds);
}
{ /* LANE ceilings + D-06 projection shape */
  const c = createReleasesSurfaceComposition({commands: new SemanticCommandBus()});
  const tc = c.truthCeiling;
  check('LANE.release-readiness-is-authorization-stays-false', tc.technicalReadinessIsOwnerAuthorization === false, false, tc.technicalReadinessIsOwnerAuthorization);
  check('LANE.release-authorization-is-deployment-stays-false', tc.ownerAuthorizationIsDeployment === false, false, tc.ownerAuthorizationIsDeployment);
  check('LANE.deployment-execution-stays-NOT_OWNED', c.providerTruth.deploymentExecution === 'NOT_OWNED', 'NOT_OWNED', c.providerTruth.deploymentExecution);
  check('LANE.readiness-executes-deployment-stays-false', tc.readinessExecutesDeployment === false && tc.authorizationExecutesDeployment === false, false, [tc.readinessExecutesDeployment, tc.authorizationExecutesDeployment]);

  const adapter = new ReleasesDomainAdapter({candidates: [candidate()]});
  adapter.select('cand-1');
  const comp = createReleasesSurfaceComposition({adapter, commands: new SemanticCommandBus()});
  const projection = comp.bottomProjection('cand-1');
  const serialized = JSON.stringify(projection);
  check('D06.four-release-sections', projection.sections.length === 4 && projection.sections.map(s => s.id).join(',') === 'events,gates,truths,candidate', 'events,gates,truths,candidate', projection.sections.map(s => s.id));
  check('D06.no-raw-lastaction-diagnostics', !/lastAction/.test(serialized) && !/ok=(true|false)/.test(serialized) && !/differences=/.test(serialized), 'no raw diagnostics string', serialized.slice(0, 240));
  const truths = projection.sections.find(s => s.id === 'truths').value;
  check('D06.projection-states-ceilings-false', /technicalReadinessIsAuthorization = false/.test(truths) && /ownerAuthorizationIsDeployment = false/.test(truths) && !/(IsAuthorization|IsDeployment) = true/.test(truths), 'ceilings present and false', truths);

  /* representative fixture candidate: gates + recorded verification events must be present */
  const {domainCandidates} = await import(path.join(root, 'dist/surfaces/releases/records.js'));
  const fixture = domainCandidates()[0];
  const fixtureAdapter = new ReleasesDomainAdapter({candidates: [fixture]});
  fixtureAdapter.select(fixture.candidateId);
  const fixtureProjection = createReleasesSurfaceComposition({adapter: fixtureAdapter, commands: new SemanticCommandBus()}).bottomProjection(fixture.candidateId);
  const fixtureGates = fixtureProjection.sections.find(s => s.id === 'gates').value;
  const fixtureEvents = fixtureProjection.sections.find(s => s.id === 'events').value;
  const fixtureIdentity = fixtureProjection.sections.find(s => s.id === 'candidate').value;
  check('D06.projection-carries-release-meaning', /TECHNICALLY_READY/.test(fixtureProjection.sections.find(s => s.id === 'truths').value) && /gates \d+ pass/.test(fixtureGates) && /event\./.test(fixtureEvents) && /v0\.4\.0/.test(fixtureIdentity), 'state + gates + recorded events + build identity', {gates: fixtureGates.slice(0, 120), events: fixtureEvents.slice(0, 120), identity: fixtureIdentity.slice(0, 120)});
  const unknownGates = projection.sections.find(s => s.id === 'gates').value;
  check('D06.unknown-candidate-degrades-truthfully', /no gates defined for this candidate/.test(unknownGates) && /no verification events recorded/.test(projection.sections.find(s => s.id === 'events').value), 'UNAVAILABLE presentation detail, never invented gates/events', {gates: unknownGates, events: projection.sections.find(s => s.id === 'events').value});
  check('D06.currentRevisionId-is-candidate-bound', String(fixtureProjection.currentRevisionId) === String(fixture.artifactDigest).slice(0, 12), String(fixture.artifactDigest).slice(0, 12), String(fixtureProjection.currentRevisionId));
}

/* ── browser side: shelf localisation, empty-truth, compare-blocked ── */
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort(), runtimePort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {cwd: root, env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(root, 'writer-output/W05-RELEASES/.runtime-proof/falsify.sqlite')}, stdio: ['ignore', 'pipe', 'pipe']});
const wait = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch {} await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);
await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({viewport: {width: 1536, height: 1024}, reducedMotion: 'reduce'});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
const shot = async name => {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({path: file});
  const b = await readFile(file);
  results.captures.push({name, file: path.relative(root, file), sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length, dims: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`});
};
await page.goto(`http://127.0.0.1:${port}/?surface=releases&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'releases', undefined, {timeout: 30000});
await page.waitForFunction(() => !!document.querySelector('#foundationStage .rel-grid'), undefined, {timeout: 20000});
await page.waitForTimeout(2200);

/* ceilings in the live composition the flow also reads */
const live = await page.evaluate(() => {
  const comp = CEPFoundation.m0Composition.group.surfaces.releases;
  return {ceiling: comp.truthCeiling, providerTruth: comp.providerTruth, defaultCount: comp.domainDefaultCandidateCount};
});
check('LANE.live-ceiling-readiness-not-authorization', live.ceiling?.technicalReadinessIsOwnerAuthorization === false, false, live.ceiling?.technicalReadinessIsOwnerAuthorization);
check('LANE.live-ceiling-authorization-not-deployment', live.ceiling?.ownerAuthorizationIsDeployment === false, false, live.ceiling?.ownerAuthorizationIsDeployment);
check('LANE.live-domain-default-has-no-fabricated-candidates', live.defaultCount === 0, 0, live.defaultCount);

/* empty-truth */
await page.fill('#domainLeftRegion [data-rel-search]', 'zzzz');
await page.waitForTimeout(500);
const emptyState = await page.evaluate(() => {
  const box = document.querySelector('#foundationStage .rel-empty') || document.querySelector('#domainLeftRegion .rel-empty-compact');
  const text = (box?.textContent || '').trim();
  return {cards: document.querySelectorAll('.rel-cand').length, text, hasEmptyLabel: /empty|no candidate/i.test(text), claimsGreen: /\bis ready\b|TECHNICALLY_READY|\ball checks pass\b/i.test(text)};
});
check('LANE.empty-truth-renders-truthfully', emptyState.cards === 0 && emptyState.hasEmptyLabel && !emptyState.claimsGreen, '0 cards + truthful empty block + no readiness claim', emptyState);
await shot('falsify-empty-truth');
await page.click('#foundationStage [data-rel-clear]').catch(() => page.click('#domainLeftRegion [data-rel-clear]'));
await page.waitForTimeout(400);

/* compare-blocked: command must fail closed with a truthful reason */
const blocked = await page.evaluate(() => {
  const c = CEPFoundation.m0Composition.group.surfaces.releases;
  const before = c.commands.receipts.length;
  let result = null;
  try { result = c.commands.execute('releases.compare', {}); } catch (e) { result = {ok: false, code: String(e.message)}; }
  const chip = document.querySelector('.rel-chip[title]');
  const disabled = [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].filter(b => b.disabled).map(b => ({id: b.dataset.foundationCommand, title: b.title}));
  return {result, receiptsBefore: before, receiptsAfter: c.commands.receipts.length, chip: chip ? {tone: chip.getAttribute('data-tone'), title: chip.getAttribute('title')} : null, disabled};
});
check('LANE.compare-blocked-fails-closed', blocked.result?.ok === false && blocked.receiptsAfter === blocked.receiptsBefore, 'ok:false + no receipt', blocked);
check('LANE.compare-blocked-state-is-labelled', !!blocked.chip?.title && /BLOCKED|UNAVAILABLE|pinned|Select|bound/i.test(blocked.chip.title), 'BLOCKED/unavailable reason visible', blocked.chip);
check('LANE.disabled-commands-carry-real-reasons', blocked.disabled.every(d => d.title && d.title.length > 3), 'every disabled command has a reason', blocked.disabled);
await shot('falsify-compare-blocked');

/* bottom shelf: release-meaningful + localised + truthful, EN then AR */
const shelfProbe = async locale => {
  await page.evaluate(l => { CEPFoundation.preferences.set('locale', l, 'global'); CEPFoundation.workspace.applyPreferences(); }, locale);
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const t = document.querySelector('#bottomToggle'); if (t && document.querySelector('#bottomShelf')?.dataset?.state !== 'open') t.click(); });
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const content = document.querySelector('#bottomContent');
    const paragraphs = [...(content?.querySelectorAll('p') || [])].map(p => (p.textContent || '').trim());
    const arabicCount = s => (s.match(/[؀-ۿ]/g) || []).length;
    const labels = ['Selected release candidate:', 'Three separated truths:', 'Gates, verification & rollback:', 'Verification events:', 'المرشّح المحدد:', 'ثلاث حقائق منفصلة:', 'البوابات والتحقق والتراجع:', 'سجل أحداث التحقق:'];
    const whole = (content?.textContent || '');
    const found = labels.filter(l => whole.includes(l));
    const mine = paragraphs.filter(p => labels.some(l => p.includes(l)));
    return {
      lang: document.documentElement.lang,
      paragraphs,
      mine,
      found,
      foundCount: found.length,
      mineArabic: mine.reduce((n, p) => n + arabicCount(p), 0),
      rawDiagnostics: /ok=(true|false)|differences=|lastAction/.test(whole),
      ceilingsInShelf: /technicalReadinessIsAuthorization = false/.test(whole) && /ownerAuthorizationIsDeployment = false/.test(whole),
      falseCeilingClaim: /(technicalReadinessIsAuthorization|ownerAuthorizationIsDeployment|ciPassIsAcceptance) = true/.test(whole),
      sectionCount: found.length,
      closedSummary: (document.querySelector('#bottomSummary')?.textContent || '').trim()
    };
  });
};
const shelfEN = await shelfProbe('en');
check('LANE.shelf-en-four-sections', shelfEN.sectionCount >= 4, '>=4 release sections', shelfEN.mine);
check('LANE.shelf-en-no-arabic-in-surface-owned-projection', shelfEN.mineArabic === 0, 0, shelfEN.mineArabic);
check('LANE.shelf-no-raw-diagnostics-D06', shelfEN.rawDiagnostics === false, false, shelfEN.rawDiagnostics);
check('LANE.shelf-ceilings-visible-and-false', shelfEN.ceilingsInShelf && !shelfEN.falseCeilingClaim, 'ceilings present and false', {ceilingsInShelf: shelfEN.ceilingsInShelf, falseCeilingClaim: shelfEN.falseCeilingClaim});
await shot('falsify-shelf-en');
const shelfAR = await shelfProbe('ar');
check('LANE.shelf-ar-localised', shelfAR.foundCount >= 4 && shelfAR.mineArabic > 0, '4 Arabic section labels under AR', {found: shelfAR.found, arabic: shelfAR.mineArabic});
check('LANE.shelf-ar-ceilings-still-false', shelfAR.ceilingsInShelf && !shelfAR.falseCeilingClaim, 'ceilings present and false', {ceilingsInShelf: shelfAR.ceilingsInShelf, falseCeilingClaim: shelfAR.falseCeilingClaim});
await shot('falsify-shelf-ar');

check('LANE.no-page-errors', pageErrors.length === 0, [], pageErrors.slice(0, 6));
results.pageErrors = pageErrors.slice(0, 6);
results.shelfEN = shelfEN;
results.shelfAR = shelfAR;
results.emptyState = emptyState;
results.compareBlocked = blocked;
results.liveComposition = live;
results.N4 = {id: 'N4.check-duplicate-mechanics', how: 'node tools/check-duplicate-mechanics.mjs (run separately, merged into HANDOFF)'};
results.N5 = {id: 'N5.suite-twice-identical', how: 'npm test twice + id/status list comparison (run separately, merged into HANDOFF)'};

await writeFile(path.join(OUT, 'falsification.json'), JSON.stringify(results, null, 2));
const summary = {total: results.checks.length, pass: results.checks.filter(c => c.status === 'PASS').length, fail: results.checks.filter(c => c.status === 'FAIL').length};
console.log(JSON.stringify({summary, failed: results.checks.filter(c => c.status === 'FAIL')}, null, 2));
await browser.close();
server.kill();
runtime.kill();
if (summary.fail) process.exitCode = 1;
