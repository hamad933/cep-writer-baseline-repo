/**
 * W02-LIBRARY visual capture (evidence tool for this unit only).
 * Lives under writer-output/ (unit output root) — not a shared seam.
 *
 * Usage:
 *   node writer-output/W02-LIBRARY/capture.mjs --name=base-ar --locale=ar --w=1505 --h=1045
 *   node writer-output/W02-LIBRARY/capture.mjs --name=base-en --locale=en --w=1505 --h=1045
 *   node writer-output/W02-LIBRARY/capture.mjs --name=narrow-ar --locale=ar --w=1180 --h=900
 *   extra flags: --bottom-open --scroll=<px> --probe
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;

const root = fileURLToPath(new URL('../../', import.meta.url));
const git = args => { try { return require('node:child_process').execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim(); } catch { return ''; } };
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const flag = name => args.includes(`--${name}`);
const name = opt('name', 'probe');
const locale = opt('locale', 'ar');
const width = Number(opt('w', 1505));
const height = Number(opt('h', 1045));
/* --persist=on  : default local persistence port (4174). A persisted baseline written BEFORE a
   fixture fix hydrates the document and masks the canonical content — that is provider truth.
   --persist=off : point the LocalPersistenceClient at a deliberately closed port (>=1024) so the
   client reports RUNTIME_UNAVAILABLE and the canonical fixture content is what renders.
   The condition is recorded in the evidence JSON; it is never presented as the default product
   state and never used to claim the provider wrote something it did not. */
const persist = opt('persist', 'on');
const persistPort = persist === 'off' ? opt('port', '41999') : null;
const outDir = path.join(root, 'writer-output/W02-LIBRARY/evidence');
await mkdir(outDir, { recursive: true });

const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort();
const workRoot = path.join(root, 'writer-output/W02-LIBRARY/.runtime');
await mkdir(workRoot, { recursive: true });

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const wait = async (url) => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch { } await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const startedAt = new Date().toISOString();
const errors = [];
let file = null, dims = null, sha256 = null, probe = null;
try {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await context.addInitScript(([loc]) => {
    try {
      localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: loc, chromeDirection: 'auto', contentDirection: 'auto' } } }));
    } catch (e) { }
  }, [locale]);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console:${m.text()}`); });
  await page.goto(`http://127.0.0.1:${port}/?surface=library${persistPort ? `&persistencePort=${persistPort}` : ''}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', null, { timeout: 45000 });
  await page.waitForTimeout(3000);

  if (flag('bottom-open')) {
    await page.evaluate(() => {
      const shelf = document.querySelector('#bottomShelf');
      const st = window.CEPFoundation?.api?.state?.surface;
      if (st) st.bottomOpen = true;
      if (shelf) { shelf.dataset.state = 'open'; const c = document.querySelector('#bottomContent'); if (c) { c.inert = false; c.hidden = false; } }
      document.querySelector('#bottomToggle')?.click();
    });
    await page.waitForTimeout(700);
  }
  const scrollIdx = args.indexOf('--scroll');
  if (scrollIdx >= 0 && args[scrollIdx + 1]) {
    await page.evaluate(y => { for (const sel of ['#centerPane .docscroll', '#centerPane', '.inspector-scroll', '.tree-scroll']) { const d = document.querySelector(sel); if (d && d.scrollHeight > d.clientHeight) d.scrollTop = y; } }, Number(args[scrollIdx + 1]));
    await page.waitForTimeout(500);
  }

  if (flag('probe')) {
    probe = await page.evaluate(() => {
      const rect = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const text = sel => (document.querySelector(sel)?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160);
      return {
        dir: document.documentElement.dir,
        lang: document.documentElement.lang,
        theme: document.documentElement.dataset.theme || document.body.dataset.theme || null,
        bodyDensity: document.body.dataset.density || null,
        rects: {
          global: rect('.global'), toolbar: rect('.toolbar'),
          leftPane: rect('#leftPane'), centerPane: rect('#centerPane'), rightPane: rect('#rightPane'),
          bottomShelf: rect('#bottomShelf'), structureTree: rect('#structureTree'),
          editorDocument: rect('#editorDocument'), blockList: rect('#blockList'),
          contextLenses: rect('#contextLenses'), inspectorContent: rect('#inspectorContent'),
          librarySearch: rect('.library-search'), libraryFooter: rect('.structure-footer'),
          topBanner: rect('#topBanner')
        },
        heads: {
          left: text('#leftPane .phead h2'), right: text('#rightPane .phead h2'),
          bottom: text('#bottomShelf .bottomtitle'),
          title: text('#editorDocument h1, #editorDocument .doctitle, #editorDocument [contenteditable]'),
          banner: text('#topBanner .title')
        },
        counts: {
          treeItems: document.querySelectorAll('.treeitem').length,
          blocks: document.querySelectorAll('#blockList .block').length,
          lensTabs: document.querySelectorAll('#contextLenses [role=tab], #contextLenses button').length,
          inspectorCards: document.querySelectorAll('#inspectorContent section, #inspectorContent .card, #inspectorContent article').length,
          toolbarButtons: document.querySelectorAll('.toolbar button').length
        },
        overflow: { x: document.documentElement.scrollWidth > document.documentElement.clientWidth, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth },
        centerProjectionHeads: [...document.querySelectorAll('#centerPane h2, #centerPane h3, #centerPane .mainGroupHead, #centerPane .projection-head')].map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 70)),
        rightLenses: [...document.querySelectorAll('#contextLenses button, #contextLenses [role=tab]')].map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 30))
      };
    });
  }

  file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file });
  const bytes = await readFile(file);
  sha256 = createHash('sha256').update(bytes).digest('hex');
  const dimsBuf = { w: bytes.readUInt32BE(16), h: bytes.readUInt32BE(20) };
  dims = `${dimsBuf.w}x${dimsBuf.h}`;
  await context.close();
} finally {
  await browser.close(); server.kill('SIGTERM');
}

const record = {
  name, locale, viewport: `${width}x${height}`, startedAt, capturedAt: new Date().toISOString(),
  file: path.relative(root, file), sha256, dims, bytes: (await readFile(file)).length,
  candidate: 'writer/mi-serial-lane/LIB-1',
  candidateCommit: git(['rev-parse', 'HEAD']),
  candidateTree: git(['rev-parse', 'HEAD^{tree}']),
  branch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
  build: 'npm run build:runtime',
  persistence: persistPort ? `UNAVAILABLE_BY_CAPTURE_FLAG__port=${persistPort}__canonical_fixture_content` : 'DEFAULT_LOCAL_RUNTIME__port=4174__persisted_baseline_may_hydrate',
  errors, probe
};
await writeFile(path.join(outDir, `${name}.json`), JSON.stringify(record, null, 2));
console.log(JSON.stringify(record, null, 2));
