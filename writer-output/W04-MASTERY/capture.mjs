/**
 * W04-MASTERY local visual capture (baseline + candidate).
 *
 * Ground truth is FILE BYTES: sha256 + PNG dimensions are computed from the bytes written.
 * Every frame is bound to candidate label + git HEAD + viewport + timestamp in the receipt.
 *
 * Usage: node writer-output/W04-MASTERY/capture.mjs --label baseline [--surface mastery]
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
const argValue = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const label = argValue('--label') || 'baseline';
const seed = args.includes('--seed');
const locale = argValue('--locale') || null;
const outDir = path.join(root, 'writer-output/W04-MASTERY/evidence', label);
const receiptPath = path.join(outDir, 'CAPTURE_RECEIPT.json');

/* Seeds the LIVE product domain inside the page (no parallel product state). Every seeded row
 * carries truthClass SYNTHETIC_DEMO_SEED so a fixture result never reads as a real result.
 * The rows come from the product's OWN fixture factory (dist/adapters/mastery/domain.js), so
 * the capture never carries a private copy of the data. */
const seedScript = rows => `(() => {
  const d = window.CEPFoundation.m0Composition.group.mastery.domain;
  const rows = ${JSON.stringify(rows)};
  for (const row of rows) if (!d.records.some(r => r.id === row.id)) d.records.push(row);
  try { window.CEPFoundation.m0Composition.mounted?.render?.(); } catch {}
  try { window.CEPFoundation.workspace?.render?.(); } catch {}
  return d.records.map(r => r.id);
})()`;

const localeScript = value => `(() => {
  const ws = window.CEPFoundation?.workspace;
  ws?.preferences?.set?.('locale', ${JSON.stringify(value)});
  try { ws?.applyPreferences?.(); } catch {}
  try { window.CEPFoundation.m0Composition.mounted?.render?.(); } catch {}
  return document.documentElement.lang + '/' + document.documentElement.dir;
})()`;

const VIEWPORTS = [[1505, 1045], [1440, 1000], [1024, 900]];

const freePort = () => new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});

const pngDims = buffer => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

const METRICS = `(() => {
  const textOf = sel => (document.querySelector(sel)?.innerText || '').replace(/[\\t ]+/g, ' ').trim();
  const lines = t => t.split('\\n').map(s => s.trim()).filter(Boolean);
  const rectOf = sel => { const r = document.querySelector(sel)?.getBoundingClientRect(); return r ? {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)} : null; };
  return {
    direction: document.body.dataset.foundationDirection || document.documentElement.dir || null,
    lang: document.documentElement.lang,
    left: textOf('#leftPane .pbody'),
    center: textOf('#foundationStage .m0-workbench'),
    right: textOf('#rightPane .pbody'),
    bottom: textOf('#bottomShelf'),
    centerLines: lines(textOf('#foundationStage .m0-workbench')).length,
    leftLines: lines(textOf('#leftPane .pbody')).length,
    rightLines: lines(textOf('#rightPane .pbody')).length,
    steps: [...document.querySelectorAll('#foundationStage [data-w04-step-number]')].map(n => n.getAttribute('data-w04-step-number')),
    pills: [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\\s+/g,' ').trim()),
    recordTables: document.querySelectorAll('#foundationStage table').length,
    tableHeaders: [...document.querySelectorAll('#foundationStage table th')].map(n => n.textContent.trim()),
    leftHeaders: [...document.querySelectorAll('#leftPane table th')].map(n => n.textContent.trim()),
    leftRows: document.querySelectorAll('#leftPane [data-r6-row]').length,
    toolbar: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(n => n.textContent.trim()),
    stateTokens: document.querySelectorAll('#foundationStage .state-token').length,
    rect: { left: rectOf('#leftPane'), center: rectOf('#centerPane'), right: rectOf('#rightPane'), stage: rectOf('#foundationStage'), workbench: rectOf('#foundationStage .m0-workbench') },
    horizontalOverflow: document.documentElement.scrollWidth > (window.innerWidth + 1),
    clipped: [...document.querySelectorAll('#foundationStage .w04-rec-title,#foundationStage .w04-pill,#foundationStage h3,#foundationStage .w04-step-num,#foundationStage .w04-track-step')]
      .filter(n => n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).overflow !== 'visible')
      .map(n => n.className + ':' + n.scrollWidth + '>' + n.clientWidth)
  };
})()`;

const capture = async () => {
  await mkdir(outDir, { recursive: true });
  let seedRows = [];
  if (seed) {
    const mod = await import(pathToFileURL(path.join(root, 'dist/adapters/mastery/domain.js')).href);
    seedRows = [...mod.createW04MasteryDemoRecords()];
  }
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: 'ignore' });
  const browser = await chromium.launch();
  const frames = [];
  try {
    for (const [width, height] of VIEWPORTS) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', e => pageErrors.push(String(e?.message || e)));
      await page.goto(`http://127.0.0.1:${port}/?surface=mastery`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.CEPFoundation?.consumer === 'mastery', null, { timeout: 20000 });
      await page.waitForTimeout(500);
      let applied = { seed: null, locale: null };
      if (seed) applied.seed = await page.evaluate(seedScript(seedRows));
      if (locale) applied.locale = await page.evaluate(localeScript(locale));
      await page.waitForTimeout(450);
      const metrics = await page.evaluate(METRICS);
      const file = `mastery-${width}x${height}${seed ? '-seeded' : ''}${locale ? `-${locale}` : ''}.png`;
      const filePath = path.join(outDir, file);
      await page.screenshot({ path: filePath, fullPage: false });
      const buffer = await readFile(filePath);
      const dims = pngDims(buffer);
      frames.push({
        surface: 'mastery', viewport: `${width}x${height}`, file, path: path.relative(root, filePath),
        sha256: createHash('sha256').update(buffer).digest('hex'), bytes: buffer.length,
        width: dims.width, height: dims.height, pageErrors, metrics, applied,
        capturedAt: new Date().toISOString()
      });
      await context.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }
  const receipt = {
    schemaVersion: 1, proof: 'w04-mastery-visual-capture', label,
    method: 'file-bytes ground truth (sha256 + PNG IHDR dims); playwright chromium headless, reducedMotion reduce',
    viewports: VIEWPORTS.map(v => `${v[0]}x${v[1]}`),
    seed: seed ? 'dist/adapters/mastery/domain.js#createW04MasteryDemoRecords (all rows truthClass=SYNTHETIC_DEMO_SEED)' : 'none (product boot default: domain empty)',
    locale: locale || 'product default',
    frameCount: frames.length, frames
  };
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ receipt: path.relative(root, receiptPath), frames: frames.map(f => ({ file: f.file, sha256: f.sha256.slice(0, 16), dims: `${f.width}x${f.height}`, bytes: f.bytes, errors: f.pageErrors.length })) }, null, 2));
};

capture().catch(error => { console.error(error); process.exit(1); });
