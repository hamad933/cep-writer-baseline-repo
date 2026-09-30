#!/usr/bin/env node
/**
 * W02-VISUALIZE visual capture — lineage-bound evidence generator.
 * Owned by unit W02-VISUALIZE (writer-output/W02-VISUALIZE/).
 *
 * usage: node writer-output/W02-VISUALIZE/capture.mjs <name> [width] [height] [lang] [surface]
 * Produces: writer-output/W02-VISUALIZE/captures/<name>-<UTC>-<sha12>.png + lineage entry in
 * writer-output/W02-VISUALIZE/LINEAGE.json (path + sha256 + dims + bytes + candidate + commit).
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'captures');
mkdirSync(OUT, { recursive: true });

const [name = 'capture', wArg = '1672', hArg = '941', seedLang = 'ar', surface = 'visualize', extra = '', click = ''] = process.argv.slice(2);
const width = Number(wArg), height = Number(hArg);
const commit = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

const url = `http://localhost:4173/?surface=${surface}${extra ? `&${extra}` : ''}`;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
await ctx.addInitScript(({ lang }) => {
  try {
    localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({
      schemaVersion: 1, kind: 'cep-foundation-preferences',
      overrides: { global: { locale: lang, chromeDirection: lang === 'ar' ? 'rtl' : 'ltr' } }
    }));
  } catch { /* storage unavailable — boot default applies */ }
}, { lang: seedLang });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('pageerror', e => consoleErrors.push(String(e?.message || e)));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(1600);

let clicked = [];
if (click) {
  for (const sel of click.split('||')) {
    try { await page.click(sel, { timeout: 4000 }); await page.waitForTimeout(800); clicked.push(sel); }
    catch (e) { clicked.push(`FAIL:${sel}:${String(e?.message || e).slice(0, 120)}`); }
  }
}

const dom = await page.evaluate(() => {
  const stage = document.querySelector('#foundationStage');
  const vis = document.querySelector('.m0-visualize-four-view');
  const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  return {
    dir: document.documentElement.getAttribute('dir') || '',
    lang: document.documentElement.getAttribute('lang') || '',
    mounted: stage?.dataset?.m0Composition || null,
    activeView: vis?.dataset?.visualizeActiveView || null,
    stage: rect(stage),
    heading: rect(document.querySelector('.m0-visualize-four-view .domain-heading')),
    meta: rect(document.querySelector('#visualizeViewMeta')),
    left: rect(document.querySelector('[data-m0-region="LEFT"], .m0-region-left')),
    right: rect(document.querySelector('[data-m0-region="RIGHT"], .m0-region-right')),
    center: rect(document.querySelector('#domainView')),
    spatial: rect(document.querySelector('#spatialHost')),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth
  };
});

const rel = path.join('captures', `${name}-${stamp}-${commit.slice(0, 8)}.png`);
const abs = path.join(HERE, rel);
await page.screenshot({ path: abs, fullPage: false });
await browser.close();

const bytes = readFileSync(abs);
const sha = createHash('sha256').update(bytes).digest('hex');
const dims = execSync(`python3 -c "import struct;d=open('${abs}','rb').read(33);print(list(struct.unpack('>II',d[16:24])))"`, { cwd: ROOT }).toString().trim();

const entry = {
  name, timestamp: new Date().toISOString(), url, viewport: { width, height, deviceScaleFactor: 1 },
  candidate: `${branch}@${commit}`, commit, branch, environment: 'local dist served by tools/serve.mjs on :4173', seededLocale: seedLang,
  image: { path: `writer-output/W02-VISUALIZE/${rel}`, sha256: sha, bytes: bytes.length, dims: JSON.parse(dims) },
  dom, clicked, consoleErrors
};
const lineagePath = path.join(HERE, 'LINEAGE.json');
const lineage = existsSync(lineagePath) ? JSON.parse(readFileSync(lineagePath, 'utf8')) : { entries: [] };
lineage.entries.push(entry);
writeFileSync(lineagePath, JSON.stringify(lineage, null, 2));
writeFileSync(path.join(HERE, `${name}.receipt.json`), JSON.stringify(entry, null, 2));
console.log(JSON.stringify(entry, null, 2));
