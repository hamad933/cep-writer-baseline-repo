/**
 * W05-RELEASES cycle-2 bottom-shelf probe (REL-1 lane).
 * Opens the shared BottomDeepWork shelf on the releases route and records the exact
 * surface-owned deep projection + the shared closed/open summary text, hash-bound to
 * the current candidate HEAD/tree, in EN/LTR and AR/RTL.
 * Output: writer-output/W05-RELEASES/evidence/cycle2/*.png + bottom-probe.json
 *
 * Usage: node writer-output/W05-RELEASES/evidence/harness/cycle2-bottom-probe.mjs <label>
 *        (label defaults to "probe"; captures are named <label>-...)
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
const label = process.argv[2] || 'probe';
const OUT = path.join(root, 'writer-output/W05-RELEASES/evidence/cycle2');
await mkdir(OUT, {recursive: true});

const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort(), runtimePort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {cwd: root, env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(root, 'writer-output/W05-RELEASES/.runtime-proof/cycle2.sqlite')}, stdio: ['ignore', 'pipe', 'pipe']});
const wait = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch {} await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);
await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const commit = execSync('git rev-parse HEAD', {cwd: root}).toString().trim();
const treeSha = execSync('git rev-parse HEAD:stack/native-typescript', {cwd: root}).toString().trim();
const deltaFiles = execSync('git status --porcelain -- stack/native-typescript/surfaces/releases stack/native-typescript/adapters/releases', {cwd: root}).toString().trim().split('\n').filter(Boolean);
const results = {label, lineage: {commit, treeSha, branch: execSync('git branch --show-current', {cwd: root}).toString().trim(), capturedAt: new Date().toISOString(), runtime: 'playwright-chromium-headless', deltaFiles}, sessions: [], captures: []};

const browser = await chromium.launch({headless: true});
const shot = async (page, name) => {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({path: file, fullPage: false});
  const b = await readFile(file);
  const rec = {name, file: path.relative(root, file), sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length, dims: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);
  return rec;
};
const elShot = async (page, selector, name) => {
  const el = await page.$(selector);
  if (!el) { results.captures.push({name, error: 'missing ' + selector}); return null; }
  const file = path.join(OUT, `${name}.png`);
  await el.screenshot({path: file});
  const b = await readFile(file);
  const rec = {name, file: path.relative(root, file), sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length, dims: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`};
  results.captures.push(rec);
  return rec;
};

const context = await browser.newContext({viewport: {width: 1536, height: 1024}, reducedMotion: 'reduce'});
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/?surface=releases&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'releases', undefined, {timeout: 30000});
for (let attempt = 0; attempt < 3; attempt++) {
  try { await page.waitForFunction(() => !!document.querySelector('#foundationStage .rel-grid'), undefined, {timeout: 12000}); break; }
  catch { await page.reload({waitUntil: 'domcontentloaded'}); await page.waitForFunction(() => window.CEPFoundation?.consumer === 'releases', undefined, {timeout: 30000}).catch(() => {}); }
}
await page.waitForTimeout(2000);

const readShelf = () => page.evaluate(() => {
  const t = el => (el?.textContent || '').trim();
  const shelf = document.querySelector('#bottomShelf');
  const content = document.querySelector('#bottomContent');
  const arabic = s => (s.match(/[؀-ۿ]/g) || []).length;
  const closedSummary = t(document.querySelector('#bottomSummary'));
  // open the shelf (shared toggle) so the deep projection is visible
  const toggle = document.querySelector('#bottomToggle');
  let opened = false;
  if (toggle && shelf?.dataset?.state !== 'open') { toggle.click(); opened = true; }
  return {beforeOpen: {state: shelf?.dataset?.state || null, summary: closedSummary, summaryArabic: arabic(closedSummary), content: t(content).slice(0, 400)}, opened, toggleDisabled: toggle?.disabled ?? null};
});
const readOpen = () => page.evaluate(() => {
  const t = el => (el?.textContent || '').trim();
  const content = document.querySelector('#bottomContent');
  const summary = t(document.querySelector('#bottomSummary'));
  const arabic = s => (s.match(/[؀-ۿ]/g) || []).length;
  const frames = [...document.querySelectorAll('#bottomContent [class]')].map(el => t(el)).filter(Boolean).slice(0, 40);
  return {
    shelfState: document.querySelector('#bottomShelf')?.dataset?.state || null,
    providerOwner: document.querySelector('#bottomShelf')?.dataset?.bottomProviderOwner || null,
    summary, summaryArabic: arabic(summary),
    content: t(content).slice(0, 2500),
    contentArabic: arabic(t(content)),
    frames,
    rawLastAction: /ok=(true|false)/.test(t(content)),
    rawCommandTail: /differences=/.test(t(content))
  };
});

for (const locale of ['en', 'ar']) {
  await page.evaluate(l => { CEPFoundation.preferences.set('locale', l, 'global'); CEPFoundation.workspace.applyPreferences(); }, locale);
  await page.waitForTimeout(1400);
  const before = await readShelf();
  await page.waitForTimeout(600);
  const open = await readOpen();
  const session = {locale, dir: await page.evaluate(() => document.documentElement.dir), before, open};
  /* locale-flip-while-open: does the shelf refresh its projection without a toggle? (truthful either way) */
  const other = locale === 'en' ? 'ar' : 'en';
  await page.evaluate(l => { CEPFoundation.preferences.set('locale', l, 'global'); CEPFoundation.workspace.applyPreferences(); }, other);
  await page.waitForTimeout(1600);
  session.flipWhileOpen = {target: other, ...(await readOpen())};
  await page.evaluate(l => { CEPFoundation.preferences.set('locale', l, 'global'); CEPFoundation.workspace.applyPreferences(); }, locale);
  await page.waitForTimeout(1600);
  session.afterFlipBack = await readOpen();
  results.sessions.push(session);
  await shot(page, `${label}-${locale}-bottom-open`);
  await elShot(page, '#bottomShelf', `${label}-${locale}-bottom-shelf`);
  // close it again so the closed summary is captured per locale
  await page.evaluate(() => { const t = document.querySelector('#bottomToggle'); if (t && document.querySelector('#bottomShelf')?.dataset?.state === 'open') t.click(); });
  await page.waitForTimeout(500);
  const closed = await page.evaluate(() => {
    const s = (document.querySelector('#bottomSummary')?.textContent || '').trim();
    return {summary: s, arabic: (s.match(/[؀-ۿ]/g) || []).length};
  });
  session.closed = closed;
  await shot(page, `${label}-${locale}-bottom-closed`);
}

results.pageErrors = pageErrors.slice(0, 6);
await writeFile(path.join(OUT, `${label}-bottom-probe.json`), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.sessions.map(s => ({locale: s.locale, closed: s.closed, summary: s.open.summary, summaryArabic: s.open.summaryArabic, contentArabic: s.open.contentArabic, rawLastAction: s.open.rawLastAction, rawCommandTail: s.open.rawCommandTail, contentHead: s.open.content.slice(0, 400)})), null, 2));
await browser.close();
server.kill();
runtime.kill();
