/**
 * W02-RESEARCH-QUALITY matched-viewport visual capture.
 *
 * Binds every artifact to: candidate (OWNED_PARTITION + commit + tree), environment,
 * viewport, timestamp, image identity (path + sha256 + dimensions + bytes).
 *
 * Usage: node writer-output/W02-RESEARCH-QUALITY/capture.mjs <label> [--rtl] [--lang ar|en]
 * Writes: writer-output/W02-RESEARCH-QUALITY/evidence/<label>/*.png + CAPTURE_RECEIPT.json
 */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const unitDir = path.join(root, 'writer-output/W02-RESEARCH-QUALITY');
const evidenceDir = path.join(unitDir, 'evidence');
const receiptPath = path.join(unitDir, 'CAPTURE_RECEIPT.json');

const label = process.argv[2] || 'capture';
const BASE = process.env.RQ_BASE || 'http://localhost:4173';

const identity = (() => {
  const p = spawnSync(process.execPath, [path.join(root, 'tools/writer-candidate-identity.mjs'), '--workspace', 'W02', '--json'], { cwd: root, encoding: 'utf8' });
  if (p.status !== 0) throw Error('CANDIDATE_IDENTITY_FAILED: ' + (p.stderr || p.stdout));
  return JSON.parse(p.stdout);
})();
const PARTITION = identity.ownedPartition.identity;
const PARTITION8 = PARTITION.replace(/^OWNED_PARTITION_SHA256:/, '').slice(0, 8);
const COMMIT = identity.commit;
const TREE = identity.tree;

const VIEWPORTS = [
  { name: '1505x1045', width: 1505, height: 1045, note: 'reference-matched viewport' },
  { name: '1440x1000', width: 1440, height: 1000, note: 'declared desktop capture' },
  { name: '1024x900', width: 1024, height: 900, note: 'narrow capture' },
  { name: '800x900', width: 800, height: 900, note: 'compact capture' }
];

const sha256 = buf => createHash('sha256').update(buf).digest('hex');
const dims = buf => {
  // PNG IHDR
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

async function main() {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const dir = path.join(evidenceDir, label);
  await mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  const artifacts = [];
  const consoleErrors = [];

  for (const vp of VIEWPORTS) {
    for (const mode of ['rtl-ar', 'ltr-en']) {
      const dirName = mode === 'rtl-ar' ? 'rtl' : 'ltr';
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`${vp.name}/${dirName}: ${m.text()}`); });
      page.on('pageerror', e => consoleErrors.push(`${vp.name}/${dirName}: ${String(e.message || e)}`));
      // Set language + direction through the real Settings preference seam (global scope),
      // exactly the path the Settings centre uses. No DOM direction forcing.
      const locale = dirName === 'rtl' ? 'ar' : 'en';
      const chromeDirection = dirName === 'rtl' ? 'rtl' : 'ltr';
      await page.addInitScript(({ locale, chromeDirection }) => {
        try {
          localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({
            schemaVersion: 1, kind: 'cep-foundation-preferences',
            overrides: { global: { locale, chromeDirection, contentDirection: chromeDirection } }
          }));
        } catch {}
      }, { locale, chromeDirection });
      const url = `${BASE}/?surface=rq&capture=${stamp}`;
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(1600);
      const file = path.join(dir, `${vp.name}-${dirName}.png`);
      const facts = await page.evaluate(() => {
        const stage = document.querySelector('#foundationStage');
        const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
        return {
          dir: document.documentElement.dir,
          lang: document.documentElement.lang,
          foundationDirection: document.body.dataset.foundationDirection,
          stageComposition: stage ? stage.dataset.m0Composition : null,
          stageRect: rect(stage),
          stageChild: stage && stage.firstElementChild ? stage.firstElementChild.className : null,
          leftRect: rect(document.querySelector('#leftPane')),
          rightRect: rect(document.querySelector('#rightPane')),
          centerRect: rect(document.querySelector('#centerPane')),
          leftState: document.querySelector('#leftPane')?.dataset.state,
          rightState: document.querySelector('#rightPane')?.dataset.state,
          rqNodes: document.querySelectorAll('[data-rq-surface]').length,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        };
      });
      const buf = await page.screenshot({ fullPage: false });
      await writeFile(file, buf);
      const d = dims(buf);
      artifacts.push({
        path: path.relative(root, file), sha256: sha256(buf), width: d.width, height: d.height,
        bytes: buf.length, viewport: vp.name, viewportNote: vp.note, direction: dirName,
        facts, url: page.url(), capturedAt: new Date().toISOString()
      });
      await ctx.close();
    }
  }

  await browser.close();

  let previous = null;
  try { previous = JSON.parse(await readFile(receiptPath, 'utf8')); } catch {}

  const receipt = {
    schemaVersion: 1,
    unit: 'W02-RESEARCH-QUALITY',
    surface: 'rq',
    label,
    reference: {
      path: 'cep-writer/references/visual/01_KNOWLEDGE_AND_LEARNING/04_RESEARCH_AND_QUALITY/image-gen-1(20260813-194728).png',
      sha256: '312bf193216402f8c16fb8c2bca424fa453d961e31f818ac0183cdf8e7b380c8',
      dims: '1505x1045',
      classification: 'CANDIDATE__AUTHORITY_UNRESOLVED',
      authorityGap: 'Reference authority is UNRESOLVED; every evidence record carries this classification. Not promoted to canonical.'
    },
    candidate: {
      ownedPartition: PARTITION, commit: COMMIT, tree: TREE, branch: identity.branch,
      canonicalProductSource: identity.canonicalProductSource,
      worktreeVariantInformational: identity.worktreeVariant
    },
    environment: { base: BASE, node: process.version, captureMethod: 'playwright chromium screenshot', runtime: 'dist/ built by tools/writer-serial.sh npm run build:runtime' },
    capturedAt: new Date().toISOString(),
    artifacts,
    consoleErrors,
    superseded: previous ? previous.artifacts : []
  };
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify({ ok: true, label, count: artifacts.length, consoleErrors, dir: path.relative(root, dir) }, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
