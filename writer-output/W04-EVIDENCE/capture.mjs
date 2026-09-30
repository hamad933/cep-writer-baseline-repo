#!/usr/bin/env node
/**
 * W04-EVIDENCE visual capture — lineage-bound evidence generator.
 * Owned by unit W04-EVIDENCE (writer-output/W04-EVIDENCE/).
 *
 * usage: node writer-output/W04-EVIDENCE/capture.mjs <name> [width] [height] [url-suffix]
 * Produces: writer-output/W04-EVIDENCE/captures/<name>-<UTC>-<sha12>.png + lineage entry in
 * writer-output/W04-EVIDENCE/LINEAGE.json (path + sha256 + dims + bytes + candidate + commit).
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(import.meta.dirname, 'captures');
mkdirSync(OUT, { recursive: true });

const [name = 'capture', wArg = '1505', hArg = '1045', seedLang = 'en'] = process.argv.slice(2);
const width = Number(wArg), height = Number(hArg);
const commit = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

const url = `http://localhost:4173/?surface=evidence`;
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
await page.waitForTimeout(1400);

const dir = await page.evaluate(() => document.documentElement.getAttribute('dir') || '');
const lang = await page.evaluate(() => document.documentElement.getAttribute('lang') || '');
const surfaceMounted = await page.evaluate(() => document.querySelector('#foundationStage')?.dataset?.m0Composition || null);

const rel = path.join('captures', `${name}-${stamp}-${commit.slice(0, 8)}.png`);
const abs = path.join(import.meta.dirname, rel);
await page.screenshot({ path: abs, fullPage: true });
await browser.close();

const bytes = readFileSync(abs);
const sha = createHash('sha256').update(bytes).digest('hex');
const dims = execSync(`python3 -c "import struct;d=open('${abs}','rb').read(33);print(struct.unpack('>II',d[16:24]))"`, { cwd: ROOT }).toString().trim();

const entry = {
  name, timestamp: new Date().toISOString(), url, viewport: { width, height, deviceScaleFactor: 1 },
  candidate: `${branch}@${commit}`, commit, branch, environment: 'local dist served by tools/serve.mjs on :4173', seededLocale: seedLang,
  image: { path: `writer-output/W04-EVIDENCE/${rel}`, sha256: sha, bytes: bytes.length, dims: JSON.parse(dims.replace(/\(/g, '[').replace(/\)/g, ']')) },
  dom: { dir, lang, surfaceMounted }, consoleErrors
};
const lineagePath = path.join(import.meta.dirname, 'LINEAGE.json');
const lineage = existsSync(lineagePath) ? JSON.parse(readFileSync(lineagePath, 'utf8')) : { entries: [] };
lineage.entries.push(entry);
writeFileSync(lineagePath, JSON.stringify(lineage, null, 2));
writeFileSync(path.join(import.meta.dirname, `${name}.receipt.json`), JSON.stringify(entry, null, 2));
console.log(JSON.stringify(entry, null, 2));
