/**
 * W05 re-audit composites — reference | current side-by-side with the evidence filename and
 * SHA-256 burned into the image, plus a per-state ink measurement for both panes.
 *
 * Reads writer-output/W05/reaudit-evidence/REAUDIT_MEASUREMENTS.json and rewrites
 * writer-output/W05/reaudit-evidence/composites/<flow>__<state>.png
 *
 * Usage: node tools/w05-reaudit-composites.mjs
 */
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;

const root = fileURLToPath(new URL('../', import.meta.url));
const evidenceDir = path.join(root, 'writer-output/W05/reaudit-evidence');
const compositeDir = path.join(evidenceDir, 'composites');
const measurementsPath = path.join(evidenceDir, 'REAUDIT_MEASUREMENTS.json');

const measurement = JSON.parse(await readFile(measurementsPath, 'utf8'));
await rm(compositeDir, { recursive: true, force: true });
await mkdir(compositeDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'], ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
const page = await browser.newPage();
try { await page.goto(`file://${root}`, { waitUntil: 'domcontentloaded' }); } catch { /* directory listing */ }

const ink = [];
for (const capture of measurement.captures) {
  if (capture.viewport !== '1440x1000') continue;
  const reference = measurement.references[capture.flow];
  if (!reference) continue;
  let data;
  try {
    data = await page.evaluate(async ({ refUrl, curUrl, label }) => {
      const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(`image load failed: ${src}`)); i.src = src; });
      const [a, b] = await Promise.all([load(refUrl), load(curUrl)]);
      const H = 640, wa = Math.round(a.width * H / a.height), wb = Math.round(b.width * H / b.height);
      const canvas = document.createElement('canvas');
      canvas.width = wa + wb + 10; canvas.height = H + 34;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#05090f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(a, 0, 34, wa, H); ctx.drawImage(b, wa + 10, 34, wb, H);
      ctx.fillStyle = '#9fd8ff'; ctx.font = 'bold 15px monospace';
      ctx.fillText(label, 6, 21);
      ctx.fillStyle = '#5b7590'; ctx.font = '12px monospace';
      ctx.fillText('REFERENCE', 6, H + 26); ctx.fillText('CURRENT', wa + 16, H + 26);
      const inkOf = img => { const c = document.createElement('canvas'); const w = Math.min(420, img.width), h = Math.max(1, Math.round(img.height * w / img.width)); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(img, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data; let lit = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 96) lit += 1; return +(lit / (w * h)).toFixed(4); };
      return { png: canvas.toDataURL('image/png'), refInk: inkOf(a), curInk: inkOf(b) };
    }, {
      refUrl: `file://${path.join(root, reference)}`,
      curUrl: `file://${path.join(root, capture.filename)}`,
      label: `${capture.filename}  sha256:${capture.sha256.slice(0, 16)}…`
    });
  } catch (error) {
    ink.push({ flow: capture.flow, state: capture.state, reference, compositeError: String(error?.message || error) });
    continue;
  }
  const buffer = Buffer.from(data.png.split(',')[1], 'base64');
  const name = `${capture.flow}__${capture.state}.png`;
  await writeFile(path.join(compositeDir, name), buffer);
  ink.push({
    flow: capture.flow, state: capture.state, reference,
    referenceSha256: createHash('sha256').update(await readFile(path.join(root, reference))).digest('hex'),
    currentSha256: capture.sha256,
    refInk: data.refInk, currentInk: data.curInk, inkRatio: +(data.curInk / data.refInk).toFixed(3),
    composite: path.join('writer-output/W05/reaudit-evidence/composites', name)
  });
}
await browser.close();

measurement.ink = ink;
measurement.compositesGeneratedAt = new Date().toISOString();
await writeFile(measurementsPath, JSON.stringify(measurement, null, 2) + '\n');
const byFlow = {};
for (const row of ink) if (row.inkRatio !== undefined) byFlow[row.flow] = Math.max(byFlow[row.flow] || 0, row.inkRatio);
console.log(JSON.stringify({ composites: ink.filter(r => r.composite).length, errors: ink.filter(r => r.compositeError), bestInkRatioBySurface: byFlow }, null, 2));
