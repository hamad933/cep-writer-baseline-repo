/**
 * W05-BACKUP lane diagnostic — ownership attribution for visual anomalies.
 * Read-only against the rendered app: reports WHICH element owns a given text/glyph,
 * so a defect can be attributed to an owned file (fix) or a shared component (record only).
 *
 * Usage: node writer-output/W05-BACKUP/evidence/harness/lane-diagnose.mjs [--lang=en|ar]
 */
import {spawn, execSync} from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));
const {chromium} = require('playwright');
const OUT = path.join(root, 'writer-output/W05-BACKUP/evidence');
const LANG = (process.argv.find(a => a.startsWith('--lang=')) || '--lang=en').split('=')[1];
const ROUTE = (process.argv.find(a => a.startsWith('--route=')) || '--route=backup').split('=')[1];

const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort(), runtimePort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(root, 'writer-output/W05-BACKUP/.runtime/diag/cep.sqlite'), CEP_STAGING_ROOT: path.join(root, 'writer-output/W05-BACKUP/.runtime/diag/staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(root, 'writer-output/W05-BACKUP/.runtime/diag/root')},
  stdio: ['ignore', 'pipe', 'pipe']
});
const waitUp = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); } return false; };
await waitUp(`http://127.0.0.1:${port}/`);
await waitUp(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const report = {lang: LANG, capturedAt: new Date().toISOString(), branch: String(execSync('git branch --show-current', {cwd: root})).trim(), commit: String(execSync('git rev-parse HEAD', {cwd: root})).trim()};
const browser = await chromium.launch({headless: true});
try {
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce', locale: LANG === 'ar' ? 'ar' : 'en'});
  await context.addInitScript(({lang}) => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: lang}}})); } catch {} }, {lang: LANG});
  const page = await context.newPage();
  report.nonOkResponses = [];
  page.on('response', r => { if (r.status() >= 400) report.nonOkResponses.push({url: r.url(), status: r.status()}); });
  report.route = ROUTE;
  await page.goto(`http://127.0.0.1:${port}/?surface=${ROUTE}&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer, undefined, {timeout: 30000});
  await page.waitForTimeout(1500);

  report.eyebrow = await page.evaluate(() => {
    const e = document.querySelector('.bk-eyebrow');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const points = [[r.x + 2, r.y + r.height / 2], [r.x + r.width / 2, r.y + r.height / 2], [r.x + r.width * 0.35, r.y + r.height / 2]];
    const describe = n => `${n.nodeType === 1 ? n.tagName : '#text'}${n.id ? '#' + n.id : ''}${n.classList && n.classList.length ? '.' + [...n.classList].join('.') : ''}`;
    const path = n => { const out = []; let cur = n; while (cur && cur !== document.documentElement && out.length < 7) { out.push(describe(cur)); cur = cur.parentElement; } return out; };
    return {
      rect: {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)},
      text: e.innerText,
      codes: [...e.innerText].map(c => c.codePointAt(0).toString(16)).join(' '),
      atPoints: points.map(([x, y]) => ({x: Math.round(x), y: Math.round(y), stack: document.elementsFromPoint(x, y).slice(0, 6).map(n => ({describe: describe(n), owner: path(n), text: String(n.textContent || '').trim().slice(0, 40)}))}))
    };
  });

  report.visibleArabicNodes = await page.evaluate(() => {
    const ar = /[؀-ۿ]/;
    const describe = n => `${n.tagName}${n.id ? '#' + n.id : ''}${n.classList && n.classList.length ? '.' + [...n.classList].join('.') : ''}`;
    const path = n => { const out = []; let cur = n; while (cur && cur !== document.documentElement && out.length < 7) { out.push(describe(cur)); cur = cur.parentElement; } return out; };
    const rows = [...document.querySelectorAll('body *')].filter(el => {
      if (el.children.length) return false;
      const t = String(el.textContent || '');
      if (!ar.test(t)) return false;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      if (getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).display === 'none') return false;
      if (el.closest('[data-w05-surface]')) return false;
      return true;
    });
    return rows.slice(0, 40).map(el => {
      const r = el.getBoundingClientRect();
      return {owner: path(el), text: String(el.textContent || '').trim().slice(0, 50), rect: {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}, inSurface: Boolean(el.closest('[data-w05-surface]'))};
    });
  });

  report.surfaceArabicNodesInEnglish = await page.evaluate(() => {
    const ar = /[؀-ۿ]/;
    const host = document.querySelector('[data-w05-surface]');
    if (!host) return null;
    return [...host.querySelectorAll('*')].filter(el => !el.children.length && ar.test(String(el.textContent || '')) && !el.closest('bdi')).map(el => ({describe: el.tagName + '.' + String(el.className || ''), text: String(el.textContent).trim().slice(0, 40)}));
  });

  report.railGeometry = await page.evaluate(() => {
    const rect = sel => { const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!e) return null; const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return {sel: typeof sel === 'string' ? sel : (e.tagName + '.' + String(e.className || '')), rect: {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}, position: c.position, zIndex: c.zIndex, display: c.display, top: c.top, insetBlockStart: c.insetBlockStart, pointerEvents: c.pointerEvents}; };
    const host = document.querySelector('[data-w05-surface]');
    const firstChild = host && host.firstElementChild ? host.firstElementChild : null;
    return [...['#centerPane', '.centerrail', '#foundationStage', '[data-w05-surface]', '#leftLocalReveal', '#rightLocalReveal'].map(rect), firstChild ? rect(firstChild) : null].filter(Boolean);
  });
} finally {
  try { await browser.close(); } catch {}
  runtime.kill('SIGTERM');
  server.kill('SIGTERM');
}
const file = path.join(OUT, `diagnose-${ROUTE}-${LANG}.json`);
await writeFile(file, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
