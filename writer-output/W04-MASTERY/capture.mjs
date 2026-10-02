/**
 * W04-MASTERY local visual capture (baseline + candidate).
 *
 * Ground truth is FILE BYTES: sha256 + PNG dimensions are computed from the bytes written.
 * Every frame is bound to candidate label + git HEAD + viewport + timestamp in the receipt.
 *
 * LINEAGE (added by lane MAS-1): every receipt additionally carries the exact
 * `commit` / `HEAD^{tree}` / branch / dirty-path count at capture time, an OWNED_SOURCE_DIGEST
 * (sha256 over the lane's writable source roots) and the DIGEST OF THE DIST BYTES ACTUALLY
 * SERVED for those roots, so a reviewer can prove the rendered bytes came from this tree.
 *
 * Usage: node writer-output/W04-MASTERY/capture.mjs --label baseline [--seed] [--locale ar|en]
 */
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
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

const VIEWPORTS = (() => {
  const raw = argValue('--viewports');
  if (!raw) return [[1505, 1045], [1440, 1000], [1024, 900]];
  return raw.split(',').map(pair => { const [w, h] = pair.split('x').map(Number); return [w, h]; });
})();

const freePort = () => new Promise(resolve => {
  const server = net.createServer();
  server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
});

const pngDims = buffer => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

/* ------------------------------------------------------------------ lineage binding
 * Receipts must be bound to the EXACT tree that produced the bytes (evidence contract).
 * OWNED_SOURCE_DIGEST covers only this lane's writable roots; DIST_SERVED_DIGEST covers the
 * compiled bytes the browser actually loaded for those roots.
 */
const OWNED_SOURCE_ROOTS = [
  'stack/native-typescript/surfaces/mastery',
  'stack/native-typescript/adapters/mastery'
];
const DIST_SERVED_ROOTS = ['dist/surfaces/mastery', 'dist/adapters/mastery'];

const git = command => { try { return String(execSync(command, { cwd: root, encoding: 'utf8' })).trim(); } catch { return null; } };

const walkFiles = async dir => {
  const out = [];
  const visit = async current => {
    let entries;
    try { entries = await readdir(current, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(full);
      else out.push(full);
    }
  };
  await visit(dir);
  return out.sort();
};

const digestRoots = async roots => {
  const hash = createHash('sha256');
  const files = [];
  for (const relative of roots) files.push(...await walkFiles(path.join(root, relative)));
  const perFile = [];
  for (const file of files) {
    const bytes = await readFile(file);
    const sha = createHash('sha256').update(bytes).digest('hex');
    const relative = path.relative(root, file);
    perFile.push({ path: relative, sha256: sha, bytes: bytes.length });
    hash.update(`${relative}\0${sha}\n`);
  }
  return { digest: hash.digest('hex'), fileCount: perFile.length, files: perFile };
};

const lineage = async () => {
  const source = await digestRoots(OWNED_SOURCE_ROOTS);
  const distServed = await digestRoots(DIST_SERVED_ROOTS);
  const dirty = git('git status --porcelain') || '';
  return {
    branch: git('git branch --show-current'),
    commit: git('git rev-parse HEAD'),
    commitTree: git('git rev-parse HEAD^{tree}'),
    headLabel: git('git log -1 --format=%h %s'),
    dirtyPathCount: dirty ? dirty.split('\n').length : 0,
    dirtyPaths: dirty ? dirty.split('\n') : [],
    ownedRoots: OWNED_SOURCE_ROOTS,
    ownedSourceDigest: source.digest,
    ownedSourceFileCount: source.fileCount,
    distServedRoots: DIST_SERVED_ROOTS,
    distServedDigest: distServed.digest,
    distServedFileCount: distServed.fileCount,
    ownedSourceFiles: source.files,
    distServedFiles: distServed.files,
    node: process.version,
    capturedBy: 'writer-output/W04-MASTERY/capture.mjs'
  };
};

const METRICS = `(() => {
  const textOf = sel => (document.querySelector(sel)?.innerText || '').replace(/[\\t ]+/g, ' ').trim();
  const lines = t => t.split('\\n').map(s => s.trim()).filter(Boolean);
  const rectOf = sel => { const r = document.querySelector(sel)?.getBoundingClientRect(); return r ? {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)} : null; };
  const arabicChars = t => (String(t).match(/[\\u0600-\\u06FF]/g) || []).length;
  const rect = { left: rectOf('#leftPane'), center: rectOf('#centerPane'), right: rectOf('#rightPane'), stage: rectOf('#foundationStage'), workbench: rectOf('#foundationStage .m0-workbench') };
  const intersection = (a, b) => {
    if (!a || !b || !a.w || !b.w) return 0;
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return w > 0 && h > 0 ? Math.round(w * h) : 0;
  };
  const leftText = textOf('#leftPane .pbody');
  const centerText = textOf('#foundationStage .m0-workbench');
  const rightText = textOf('#rightPane .pbody');
  const dir = document.body.dataset.foundationDirection || document.documentElement.dir || null;
  const stage = document.querySelector('#foundationStage');
  return {
    direction: dir,
    lang: document.documentElement.lang,
    left: leftText,
    center: centerText,
    right: rightText,
    bottom: textOf('#bottomShelf'),
    centerLines: lines(centerText).length,
    leftLines: lines(leftText).length,
    rightLines: lines(rightText).length,
    steps: [...document.querySelectorAll('#foundationStage [data-w04-step-number]')].map(n => n.getAttribute('data-w04-step-number')),
    pills: [...document.querySelectorAll('#foundationStage [data-w04-pill]')].map(n => n.textContent.replace(/\\s+/g,' ').trim()),
    recordTables: document.querySelectorAll('#foundationStage table').length,
    tableHeaders: [...document.querySelectorAll('#foundationStage table th')].map(n => n.textContent.trim()),
    leftHeaders: [...document.querySelectorAll('#leftPane table th')].map(n => n.textContent.trim()),
    leftRows: document.querySelectorAll('#leftPane [data-r6-row]').length,
    toolbar: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(n => n.textContent.trim()),
    stateTokens: document.querySelectorAll('#foundationStage .state-token').length,
    rect,
    horizontalOverflow: document.documentElement.scrollWidth > (window.innerWidth + 1),
    clipped: [...document.querySelectorAll('#foundationStage .w04-rec-title,#foundationStage .w04-pill,#foundationStage h3,#foundationStage .w04-step-num,#foundationStage .w04-track-step')]
      .filter(n => n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).overflow !== 'visible')
      .map(n => n.className + ':' + n.scrollWidth + '>' + n.clientWidth),
    paneOverlapPx2: {
      leftCenter: intersection(rect.left, rect.center),
      centerRight: intersection(rect.center, rect.right),
      leftRight: intersection(rect.left, rect.right)
    },
    paneOrder: { dir, leftX: rect.left?.x ?? null, rightX: rect.right?.x ?? null,
      mirrored: Boolean(dir === 'rtl' && rect.left && rect.right && rect.left.x > rect.right.x) },
    centerScroll: stage ? { clientHeight: stage.clientHeight, scrollHeight: stage.scrollHeight,
      scrollable: stage.scrollHeight > stage.clientHeight + 1,
      overflowY: getComputedStyle(stage).overflowY } : null,
    localeTruth: {
      centerArabicChars: arabicChars(centerText),
      leftArabicChars: arabicChars(leftText),
      rightArabicChars: arabicChars(rightText),
      lang: document.documentElement.lang
    }
  };
})()`;

const capture = async () => {
  await mkdir(outDir, { recursive: true });
  const lineageInfo = await lineage();
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
    lineage: lineageInfo,
    viewports: VIEWPORTS.map(v => `${v[0]}x${v[1]}`),
    seed: seed ? 'dist/adapters/mastery/domain.js#createW04MasteryDemoRecords (all rows truthClass=SYNTHETIC_DEMO_SEED)' : 'none (product boot default: domain empty)',
    locale: locale || 'product default',
    frameCount: frames.length, frames
  };
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ receipt: path.relative(root, receiptPath), frames: frames.map(f => ({ file: f.file, sha256: f.sha256.slice(0, 16), dims: `${f.width}x${f.height}`, bytes: f.bytes, errors: f.pageErrors.length })) }, null, 2));
};

capture().catch(error => { console.error(error); process.exit(1); });
