/* Open the shared bottom shelf and capture the surface's ledger with full lineage. */
import {spawn, execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile, appendFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium} = require('playwright');
const root = '/workspaces/cep-writer-baseline-repo/';
const OUT = path.join(root, 'writer-output/W05-BACKUP/evidence');
const WORK = path.join(root, 'writer-output/W05-BACKUP/.runtime/bottom');
await mkdir(OUT, {recursive: true});
await mkdir(path.join(WORK, 'staging'), {recursive: true});

const lineage = {
  branch: execSync('git branch --show-current', {cwd: root}).toString().trim(),
  commit: execSync('git rev-parse HEAD', {cwd: root}).toString().trim(),
  treeSha: execSync('git rev-parse HEAD:stack/native-typescript', {cwd: root}).toString().trim(),
  worktreeDelta: 'UNCOMMITTED_SURFACE_DELTA',
  capturedAt: new Date().toISOString(), viewport: '1536x1024', lang: 'en',
  harness: 'writer-output/W05-BACKUP/evidence/harness/bottom.mjs', runtime: 'playwright-chromium-headless'
};
const sha256 = b => createHash('sha256').update(b).digest('hex');
const records = [];
const record = async (file, kind) => {const b = await readFile(file);const rec = {kind, file: path.relative(root, file), sha256: sha256(b), bytes: b.length, dims: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`, ...lineage};records.push(rec);return rec;};

const freePort = () => new Promise(res => {const s = net.createServer(); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
const port = await freePort(), runtimePort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {cwd: root, env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(WORK, 'bottom.sqlite'), CEP_STAGING_ROOT: path.join(WORK, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(WORK, 'root')}, stdio: ['ignore', 'pipe', 'pipe']});
const wait = async url => {for (let i = 0; i < 150; i++) {try {if ((await fetch(url)).ok) return true;} catch {} await new Promise(r => setTimeout(r, 100));} return false;};
await wait(`http://127.0.0.1:${port}/`); await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const browser = await chromium.launch({headless: true});
const out = {lineage, checks: [], captures: [], attempts: [], notes: []};
const push = (id, ok, detail='') => out.checks.push({id, status: ok ? 'PASS' : 'FAIL', detail});
try {
  const context = await browser.newContext({viewport: {width: 1536, height: 1024}, reducedMotion: 'reduce'});
  await context.addInitScript(() => {try {localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: 'en'}}}));} catch {}});
  const page = await context.newPage();
  const pageErrors = []; page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/?surface=backup&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'backup', undefined, {timeout: 30000});
  await page.waitForTimeout(2000);
  for (const id of ['backup.package','backup.plan','backup.preview','backup.stage','backup.drill','backup.activationRequest']) {
    await page.evaluate(cmd => {const el = [...document.querySelectorAll('[data-foundation-command]')].find(b => b.dataset.foundationCommand === cmd && !b.disabled); if (el) el.click();}, id);
    await page.waitForTimeout(1200);
  }
  out.candidates = await page.evaluate(() => ({
    toggle: (() => {const t = document.querySelector('#bottomToggle'); return t ? {tag: t.tagName, text: t.textContent.trim().slice(0, 30), action: t.dataset.action || t.getAttribute('data-action') || '', cls: String(t.className)} : null;})(),
    actionButtons: [...document.querySelectorAll('[data-action="toggle-bottom"],#bottomShelf button')].map(b => ({text: b.textContent.trim().slice(0, 24), action: b.dataset.action || '', id: b.id})).slice(0, 8),
    state: document.querySelector('#bottomShelf')?.dataset?.state
  }));

  const strategies = [
    ['click-bottomToggle', async () => page.evaluate(() => {const t = document.querySelector('#bottomToggle'); if (t) {t.click(); return true;} return false;})],
    ['click-toggle-action', async () => page.evaluate(() => {const b = [...document.querySelectorAll('[data-action="toggle-bottom"]')][0]; if (b) {b.click(); return true;} return false;})],
    ['command-foundation.bottom', async () => page.evaluate(() => {try {window.CEPFoundation?.api?.Commands?.execute?.('foundation.bottom', {route: 'w05-evidence'}); return true;} catch (e) {return String(e);}})]
  ];
  for (const [name, fn] of strategies) {
    const fired = await fn();
    await page.waitForTimeout(900);
    const st = await page.evaluate(() => ({state: document.querySelector('#bottomShelf')?.dataset?.state, h: Math.round(document.querySelector('#bottomShelf')?.getBoundingClientRect().height || 0), rows: document.querySelectorAll('#domainBottomRegion .bkb-table tbody tr').length, tableVisible: (() => {const t = document.querySelector('#domainBottomRegion .bkb-table'); if (!t) return false; const r = t.getBoundingClientRect(); return r.width > 0 && r.height > 0;})()}));
    out.attempts.push({name, fired, ...st});
    if (st.state === 'open' && st.rows > 0) break;
  }
  const final = await page.evaluate(() => ({state: document.querySelector('#bottomShelf')?.dataset?.state, rows: document.querySelectorAll('#domainBottomRegion .bkb-table tbody tr').length, tableRect: (() => {const t = document.querySelector('#domainBottomRegion .bkb-table'); const r = t?.getBoundingClientRect(); return r ? {w: Math.round(r.width), h: Math.round(r.height)} : null;})(), details: !!document.querySelector('#domainBottomRegion details'), summary: document.querySelector('#bottomSummary')?.textContent?.slice(0, 70)}));
  out.final = final;
  push('bottom.open', final.state === 'open', JSON.stringify(final));
  push('bottom.ledger-rows-visible', final.rows > 0, `rows=${final.rows}`);
  const shelf = await page.$('#bottomShelf');
  if (shelf) {const f = path.join(OUT, 'postfix4-bottom-open.png'); await shelf.screenshot({path: f}); out.captures.push(await record(f, 'element'));}
  const pageShot = path.join(OUT, 'postfix4-bottom-open-full.png');
  await page.screenshot({path: pageShot}); out.captures.push(await record(pageShot, 'viewport'));
  out.pageErrors = pageErrors;
} catch (error) {out.fatal = String(error?.stack || error);}
finally {await browser.close(); runtime.kill('SIGTERM'); server.kill('SIGTERM');}
out.captures = records;
const file = path.join(OUT, 'postfix3-bottom.json');
await writeFile(file, JSON.stringify(out, null, 2));
await appendFile(path.join(OUT, 'captures.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(JSON.stringify({file, checks: out.checks, candidates: out.candidates, attempts: out.attempts, final: out.final, captures: records.map(r => `${r.file} ${r.sha256.slice(0, 16)} ${r.dims}`), fatal: out.fatal || null}, null, 2));
