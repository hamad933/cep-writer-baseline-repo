/* Post-fix extras: (a) bottom shelf expanded state, (b) responsive passes.
 * Writes evidence PNGs + a lineage-bound JSON only. */
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
const WORK = path.join(root, 'writer-output/W05-BACKUP/.runtime/extras');
await mkdir(OUT, {recursive: true});
await mkdir(path.join(WORK, 'staging'), {recursive: true});

const branch = execSync('git branch --show-current', {cwd: root}).toString().trim();
const commit = execSync('git rev-parse HEAD', {cwd: root}).toString().trim();
const treeSha = execSync('git rev-parse HEAD:stack/native-typescript', {cwd: root}).toString().trim();
const srcDigest = async () => {
  const h = createHash('sha256');
  for (const f of ['index.ts', 'style.ts', 'i18n.ts', 'icons.ts']) h.update(await readFile(path.join(root, 'stack/native-typescript/surfaces/backup', f)));
  h.update(await readFile(path.join(root, 'stack/native-typescript/adapters/backup-runtime.ts')));
  return h.digest('hex');
};
const lineage = {branch, commit, treeSha, worktreeDelta: 'UNCOMMITTED_SURFACE_DELTA', sourceSha256: await srcDigest(), capturedAt: new Date().toISOString(), lang: 'en', harness: 'writer-output/W05-BACKUP/evidence/harness/extras.mjs', runtime: 'playwright-chromium-headless'};
const sha256 = b => createHash('sha256').update(b).digest('hex');
const records = [];
const record = async (file, kind) => {
  const b = await readFile(file);
  const rec = {kind, file: path.relative(root, file), sha256: sha256(b), bytes: b.length, dims: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`, ...lineage};
  records.push(rec);
  return rec;
};

const freePort = () => new Promise(res => {const s = net.createServer(); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
const port = await freePort(), runtimePort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(WORK, 'extras.sqlite'), CEP_STAGING_ROOT: path.join(WORK, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(WORK, 'root')},
  stdio: ['ignore', 'pipe', 'pipe']
});
const wait = async url => {for (let i = 0; i < 150; i++) {try {if ((await fetch(url)).ok) return true;} catch {} await new Promise(r => setTimeout(r, 100));} return false;};
await wait(`http://127.0.0.1:${port}/`); await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const browser = await chromium.launch({headless: true});
const out = {lineage, checks: [], captures: [], geometry: {}, notes: []};
const push = (id, ok, detail='') => out.checks.push({id, status: ok ? 'PASS' : 'FAIL', detail});
try {
  const context = await browser.newContext({viewport: {width: 1536, height: 1024}, reducedMotion: 'reduce'});
  await context.addInitScript(() => {try {localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: 'en'}}}));} catch {}});
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/?surface=backup&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'backup', undefined, {timeout: 30000});
  await page.waitForTimeout(2000);

  const run = async id => {
    await page.evaluate(cmd => {const el = [...document.querySelectorAll('[data-foundation-command]')].find(b => b.dataset.foundationCommand === cmd && !b.disabled); if (el) el.click();}, id);
    await page.waitForTimeout(1500);
  };
  await run('backup.package'); await run('backup.plan'); await run('backup.preview'); await run('backup.stage'); await run('backup.drill'); await run('backup.activationRequest');

  /* (a) bottom shelf expanded — collapsed-state comparison */
  const before = await page.evaluate(() => document.querySelector('#bottomShelf')?.dataset?.state || 'unknown');
  await page.evaluate(() => {const t = document.querySelector('#bottomToggle'); if (t) t.click();});
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({state: document.querySelector('#bottomShelf')?.dataset?.state, summary: document.querySelector('#bottomSummary')?.textContent?.slice(0, 80), regionHtml: (document.querySelector('#domainBottomRegion')?.innerHTML || '').slice(0, 400), regionPresent: !!document.querySelector('#domainBottomRegion'), table: !!document.querySelector('#domainBottomRegion .bkb-table'), rows: document.querySelectorAll('#domainBottomRegion .bkb-table tbody tr').length, receiptBehindDetails: (() => {const d = document.querySelector('#domainBottomRegion details'); return d ? d.querySelector('[data-w05-receipt]') !== null : false;})(), donorPre: [...document.querySelectorAll('#bottomContent pre')].map(p => p.textContent.slice(0, 40))}));
  out.geometry.bottom = {before, ...after};
  push('bottom.opens', after.state === 'open', JSON.stringify(out.geometry.bottom).slice(0, 300));
  push('bottom.ledger-table-visible', after.table && after.rows > 0, `rows=${after.rows}`);
  push('bottom.receipt-behind-details', after.receiptBehindDetails, '');
  const shelf = await page.$('#bottomShelf');
  if (shelf) {const f = path.join(OUT, 'postfix3-bottom-open.png'); await shelf.screenshot({path: f}); out.captures.push(await record(f, 'element'));}
  await page.evaluate(() => {const t = document.querySelector('#bottomToggle'); if (t) t.click();});
  await page.waitForTimeout(600);

  /* (b) responsive passes */
  for (const [name, vp] of [['1280x860', {width: 1280, height: 860}], ['1024x900', {width: 1024, height: 900}], ['820x900', {width: 820, height: 900}]]) {
    await page.setViewportSize(vp);
    await page.waitForTimeout(800);
    const f = path.join(OUT, `postfix3-drill-vp-${name}.png`);
    await page.screenshot({path: f});
    out.captures.push(await record(f, 'viewport'));
    const probe = await page.evaluate(() => ({
      hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      stageW: Math.round(document.querySelector('#foundationStage')?.getBoundingClientRect().width || 0),
      containerW: Math.round(document.querySelector('.bk-root')?.getBoundingClientRect().width || 0),
      checksCols: getComputedStyle(document.querySelector('.bk-checks')).gridTemplateColumns.split(' ').length,
      metricsCols: getComputedStyle(document.querySelector('.bk-metrics')).gridTemplateColumns.split(' ').length,
      pipeCols: getComputedStyle(document.querySelector('.bk-pipe')).gridTemplateColumns.split(' ').length,
      paneOverlap: (() => {const l = document.querySelector('#leftPane')?.getBoundingClientRect(), c = document.querySelector('#foundationStage')?.getBoundingClientRect(), r = document.querySelector('#rightPane')?.getBoundingClientRect(); if (!l || !c) return false; const leftHit = Math.round(l.right - c.left) > 0; const rightHit = r ? Math.round((r.left) - (c.right)) < -1 : false; return leftHit || rightHit;})(),
      clipped: [...document.querySelectorAll('.bk-check .bk-name, .bk-metric .bk-v, .bk-step-name')].filter(e => e.scrollWidth > e.clientWidth + 2).length
    }));
    out.geometry[`vp_${name}`] = probe;
    push(`responsive.${name}.no-h-overflow`, !probe.hOverflow, JSON.stringify(probe));
    push(`responsive.${name}.no-clipped-text`, probe.clipped === 0, `clipped=${probe.clipped}`);
  }
  await page.setViewportSize({width: 1536, height: 1024});
  await page.waitForTimeout(600);
  out.pageErrors = pageErrors;
} catch (error) {
  out.fatal = String(error?.stack || error);
} finally {
  await browser.close(); runtime.kill('SIGTERM'); server.kill('SIGTERM');
}
out.captures = records;
const file = path.join(OUT, 'postfix3-extras.json');
await writeFile(file, JSON.stringify(out, null, 2));
await appendFile(path.join(OUT, 'captures.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(JSON.stringify({file, checks: out.checks, captures: records.map(r => `${r.file} ${r.sha256.slice(0, 16)} ${r.dims}`), geometry: out.geometry, fatal: out.fatal || null}, null, 2));
