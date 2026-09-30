/**
 * W05-BACKUP evidence harness.
 * Method: cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md (L1/L3)
 * Lifecycle: fresh local runtime (own root, never another unit's) + dist static server +
 *            playwright chromium headless, matched viewport, full lineage on every capture.
 *
 * Usage:
 *   node writer-output/W05-BACKUP/evidence/harness/capture.mjs \
 *     --label=baseline-empty --lang=en --w=1536 --h=1024 [--drill] [--full] [--crop]
 */
import {spawn, execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {mkdir, readFile, writeFile, appendFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium} = require('playwright');

const root = '/workspaces/cep-writer-baseline-repo/';
const OUT = path.join(root, 'writer-output/W05-BACKUP/evidence');
const WORK = path.join(root, 'writer-output/W05-BACKUP/.runtime/evidence');
await mkdir(OUT, {recursive: true});
await mkdir(path.join(WORK, 'staging'), {recursive: true});

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};
const has = name => argv.includes(`--${name}`);
const LABEL = arg('label', 'capture');
const LANG = arg('lang', 'en');
const W = Number(arg('w', '1536'));
const H = Number(arg('h', '1024'));
const DB = path.join(WORK, 'balanced6-acceptance.sqlite');

const lineage = {
  branch: execSync('git branch --show-current', {cwd: root}).toString().trim(),
  commit: execSync('git rev-parse HEAD', {cwd: root}).toString().trim(),
  treeSha: execSync('git rev-parse HEAD:stack/native-typescript', {cwd: root}).toString().trim(),
  worktreeDelta: 'UNCOMMITTED_SURFACE_DELTA',
  sourceSha256: (() => {const h = createHash('sha256');for (const f of ['index.ts','style.ts','i18n.ts','icons.ts']) h.update(readFileSync(path.join(root,'stack/native-typescript/surfaces/backup',f)));h.update(readFileSync(path.join(root,'stack/native-typescript/adapters/backup-runtime.ts')));return h.digest('hex');})(),
  capturedAt: new Date().toISOString(),
  viewport: `${W}x${H}`,
  lang: LANG,
  label: LABEL,
  runtime: 'playwright-chromium-headless',
  harness: 'writer-output/W05-BACKUP/evidence/harness/capture.mjs'
};

const freePort = () => new Promise(res => {const s = net.createServer(); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
const port = await freePort(), runtimePort = await freePort();

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: DB, CEP_STAGING_ROOT: path.join(WORK, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(WORK, 'root')},
  stdio: ['ignore', 'pipe', 'pipe']
});
let runtimeStderr = '';
runtime.stderr.on('data', d => {runtimeStderr += String(d);});
const wait = async url => {for (let i = 0; i < 150; i++) {try {if ((await fetch(url)).ok) return true;} catch {} await new Promise(r => setTimeout(r, 100));} return false;};
const serveOk = await wait(`http://127.0.0.1:${port}/`);
const runtimeOk = await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const records = [];
const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const record = async (file, kind, extra = {}) => {
  const b = await readFile(file);
  const rec = {kind, file: path.relative(root, file), sha256: sha256(b), bytes: b.length, dims: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`, ...lineage, ...extra};
  records.push(rec);
  return rec;
};

const browser = await chromium.launch({headless: true});
const out = {lineage, checks: [], captures: [], geometry: {}, notes: []};
const push = (id, ok, detail) => out.checks.push({id, status: ok ? 'PASS' : 'FAIL', detail});
try {
  const context = await browser.newContext({viewport: {width: W, height: H}, reducedMotion: 'reduce'});
  await context.addInitScript(({lang}) => {
    try {
      localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: lang}}}));
    } catch {}
  }, {lang: LANG});
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  const consoleErrors = [];
  page.on('console', m => {if (m.type() === 'error') consoleErrors.push(m.text());});

  await page.goto(`http://127.0.0.1:${port}/?surface=backup&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'backup', undefined, {timeout: 30000});
  await page.waitForTimeout(2500);

  const state = () => page.evaluate(() => {
    const adapter = window.CEPFoundation?.m0Composition?.adapter;
    const snap = adapter?.snapshot ? adapter.snapshot() : null;
    return snap ? {packages: snap.packages.length, plan: !!snap.plan, preview: !!snap.preview, stage: !!snap.stage, drill: snap.lastDrill?.status || null, activation: snap.lastActivation?.status || null, attempts: (snap.durableAttempts || []).length, lang: document.documentElement.lang, dir: document.documentElement.dir} : null;
  });
  out.geometry.initialState = await state();

  if (has('drill')) {
    const run = async (id, predicate) => {
      const clicked = await page.evaluate(cmd => {
        const el = [...document.querySelectorAll('[data-foundation-command]')].find(b => b.dataset.foundationCommand === cmd && !b.disabled);
        if (el) {el.click(); return true;}
        return false;
      }, id);
      if (!clicked) {push(`command.${id}`, false, 'button not found or disabled'); return false;}
      for (let i = 0; i < 60; i++) {
        await page.waitForTimeout(250);
        const s = await state();
        if (predicate(s)) {push(`command.${id}`, true, JSON.stringify(s)); return true;}
      }
      push(`command.${id}`, false, `timeout waiting for state after ${id} · ${JSON.stringify(await state())}`);
      return false;
    };
    await run('backup.package', s => s.packages > 0);
    await run('backup.plan', s => s.plan);
    await run('backup.preview', s => s.preview);
    await run('backup.stage', s => s.stage);
    await run('backup.drill', s => s.drill);
    await run('backup.activationRequest', s => !!s.activation);
    await page.waitForTimeout(600);
  }

  out.geometry.finalState = await state();

  const shot = async (name, opts = {}) => {
    const file = path.join(OUT, `${LABEL}-${name}.png`);
    await page.screenshot({path: file, fullPage: false, ...opts});
    const rec = await record(file, 'viewport');
    out.captures.push(rec);
    return rec;
  };
  const elShot = async (selector, name) => {
    const el = await page.$(selector);
    if (!el) {out.notes.push(`missing element ${selector} for ${name}`); return null;}
    const file = path.join(OUT, `${LABEL}-${name}.png`);
    await el.screenshot({path: file});
    const rec = await record(file, 'element');
    out.captures.push(rec);
    return rec;
  };

  await shot('full');
  if (has('full')) {
    const file = path.join(OUT, `${LABEL}-page.png`);
    await page.screenshot({path: file, fullPage: true});
    out.captures.push(await record(file, 'fullpage'));
  }

  /* geometry / L2-L4 probes */
  out.geometry.probe = await page.evaluate(() => {
    const rect = sel => {const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)};};
    const style = (sel, props) => {const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); const o = {}; for (const p of props) o[p] = c[p]; return o;};
    const stage = document.querySelector('#foundationStage');
    return {
      viewport: {w: innerWidth, h: innerHeight},
      regions: {banner: rect('#topBanner'), toolbar: rect('#domainToolbar'), left: rect('#leftPane'), stage: rect('#foundationStage'), right: rect('#rightPane'), bottom: rect('#bottomShelf')},
      centerChildren: [...(stage?.querySelector('[data-w05-surface]')?.children || [])].map(c => ({tag: c.tagName, cls: c.className, ...rect(`[data-w05-surface] > .${String(c.className).split(' ')[0]}`)})),
      counts: {
        steps: document.querySelectorAll('.b-drill-step, .bk-step').length,
        checks: document.querySelectorAll('.b-check, .bk-check').length,
        metrics: document.querySelectorAll('.b-metric, .bk-metric').length,
        leftItems: document.querySelectorAll('#domainLeftRegion li').length,
        rightBlocks: document.querySelectorAll('#domainContext section').length
      },
      overflow: {docH: document.documentElement.scrollWidth > document.documentElement.clientWidth, stageScroll: stage?.scrollHeight, stageClient: stage?.clientHeight},
      lang: document.documentElement.lang, dir: document.documentElement.dir,
      h1: style('[data-w05-surface] h1', ['fontSize', 'fontWeight', 'lineHeight']),
      glyphs: {total: (document.querySelector('[data-w05-surface]')?.innerText || '').length}
    };
  });

  if (has('crop')) {
    await elShot('#leftPane', 'left');
    await elShot('#rightPane', 'right');
    await elShot('#foundationStage', 'center');
    await elShot('#bottomShelf', 'bottom');
  }

  /* scroll shot */
  if (has('scroll')) {
    await page.evaluate(() => {const s = document.querySelector('#foundationStage'); if (s) s.scrollTop = s.scrollHeight;});
    await page.waitForTimeout(500);
    await shot('scrolled');
    await page.evaluate(() => {const s = document.querySelector('#foundationStage'); if (s) s.scrollTop = 0;});
    await page.waitForTimeout(300);
  }

  /* responsive passes */
  if (has('responsive')) {
    for (const [name, vp] of [['1280x860', {width: 1280, height: 860}], ['1024x900', {width: 1024, height: 900}], ['820x900', {width: 820, height: 900}]]) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(700);
      await shot(`vp-${name}`);
      const probe = await page.evaluate(() => ({docH: document.documentElement.scrollWidth > document.documentElement.clientWidth, stageW: Math.round(document.querySelector('#foundationStage')?.getBoundingClientRect().width || 0), leftW: Math.round(document.querySelector('#leftPane')?.getBoundingClientRect().width || 0), rightW: Math.round(document.querySelector('#rightPane')?.getBoundingClientRect().width || 0)}));
      out.geometry[`vp_${name}`] = probe;
    }
    await page.setViewportSize({width: W, height: H});
    await page.waitForTimeout(500);
  }

  out.pageErrors = pageErrors;
  out.consoleErrors = consoleErrors.slice(0, 20);
  out.serveOk = serveOk;
  out.runtimeOk = runtimeOk;
  push('runtime.reachable', runtimeOk, runtimeOk ? 'GET /v1/capabilities ok' : runtimeStderr.slice(0, 400));
  push('page.errors', pageErrors.length === 0, pageErrors.join(' | ') || 'no page errors');
} catch (error) {
  out.fatal = String(error?.stack || error);
} finally {
  await browser.close();
  runtime.kill('SIGTERM');
  server.kill('SIGTERM');
}

out.captures = records;
const outFile = path.join(OUT, `${LABEL}.json`);
await writeFile(outFile, JSON.stringify(out, null, 2));
await appendFile(path.join(OUT, 'captures.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(JSON.stringify({outFile, checks: out.checks, captures: records.map(r => `${r.file} ${r.sha256.slice(0, 16)} ${r.dims}`), fatal: out.fatal || null}, null, 2));
