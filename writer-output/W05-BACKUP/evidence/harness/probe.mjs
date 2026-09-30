/* Read-only DOM probe: which nodes render Arabic copy on an EN surface, and are the
 * surface's own buttons visually styled? Writes JSON evidence only. */
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire('/workspaces/cep-writer-baseline-repo/package.json');
const {chromium} = require('playwright');
const root = '/workspaces/cep-writer-baseline-repo/';
const OUT = path.join(root, 'writer-output/W05-BACKUP/evidence');
await mkdir(OUT, {recursive: true});
const WORK = path.join(root, 'writer-output/W05-BACKUP/.runtime/probe');

const freePort = () => new Promise(res => {const s = net.createServer(); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => res(p));});});
const port = await freePort(), runtimePort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(WORK, 'probe.sqlite'), CEP_STAGING_ROOT: path.join(WORK, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(WORK, 'root')},
  stdio: ['ignore', 'pipe', 'pipe']
});
const wait = async url => {for (let i = 0; i < 150; i++) {try {if ((await fetch(url)).ok) return true;} catch {} await new Promise(r => setTimeout(r, 100));} return false;};
await wait(`http://127.0.0.1:${port}/`); await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({viewport: {width: 1536, height: 1024}});
await context.addInitScript(() => {try {localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: 'en'}}}));} catch {}});
const page = await context.newPage();
await page.goto(`http://127.0.0.1:${port}/?surface=backup&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'backup', undefined, {timeout: 30000});
await page.waitForTimeout(2500);

const probe = await page.evaluate(() => {
  const AR = /[؀-ۿ]/;
  const surface = document.querySelector('[data-w05-surface]');
  const own = new Set([surface, ...document.querySelectorAll('.bkl, .bkl *'), ...document.querySelectorAll('.bkr, .bkr *'), ...document.querySelectorAll('.bkb, .bkb *'), ...document.querySelectorAll('.bk-root, .bk-root *')]);
  const arabic = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const text = (n.nodeValue || '').trim();
    if (!text || !AR.test(text)) continue;
    const el = n.parentElement;
    if (!el || own.has(el)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    arabic.push({text: text.slice(0, 60), tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 60), id: el.id || el.parentElement?.id || '', rect: {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}, owner: el.closest('[data-domain-owner]')?.getAttribute('data-domain-owner') || el.closest('[data-foundation-region]')?.getAttribute('data-foundation-region') || 'chrome'});
  }
  const btn = document.querySelector('.bkl-act .btn');
  const head = document.querySelector('.bk-act .btn');
  const cs = e => e ? (({border, borderWidth, borderColor, background, color, borderRadius, padding, opacity}) => ({border, borderWidth, borderColor, background, color, borderRadius, padding, opacity}))(getComputedStyle(e)) : null;
  const eyebrow = document.querySelector('.bk-eyebrow');
  return {
    arabicOutsideSurface: arabic,
    leftActionButton: cs(btn),
    headerActionButton: cs(head),
    eyebrowText: eyebrow?.textContent,
    eyebrowFont: eyebrow ? getComputedStyle(eyebrow).fontFamily : null,
    rightTabs: [...document.querySelectorAll('#rightPane .contextscope button, #rightPane button')].slice(0, 6).map(b => ({text: b.textContent.trim().slice(0, 40), cls: String(b.className).slice(0, 50)})),
    checksCols: getComputedStyle(document.querySelector('.bk-checks')).gridTemplateColumns,
    metricsCols: getComputedStyle(document.querySelector('.bk-metrics')).gridTemplateColumns,
    containerW: Math.round(document.querySelector('.bk-root').getBoundingClientRect().width),
    bottomOpen: document.querySelector('#bottomShelf')?.dataset?.state
  };
});
await browser.close(); runtime.kill('SIGTERM'); server.kill('SIGTERM');
const file = path.join(OUT, 'postfix-probe.json');
const payload = {capturedAt: new Date().toISOString(), viewport: '1536x1024', lang: 'en', dir: 'ltr', probe};
await writeFile(file, JSON.stringify(payload, null, 2));
console.log(JSON.stringify({file, sha256: createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16), ...probe}, null, 2));
