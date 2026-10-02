/** SH-1 probe: replicate the EXACT flow-3 locators of tools/browser-conformance.mjs and report per-sub-condition truth. */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43192);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));

await page.goto(`${base}/?surface=enterprise`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise', null, { timeout: 20000 });
await page.waitForTimeout(600);

const composer = page.locator('.relation-composer').filter({ visible: true }).first();
const edge = page.locator('.spatial-canvas [data-edge]').first();
const line = edge.locator('line').filter({ visible: true }).first();
const label = edge.locator('[data-relation-label]').filter({ visible: true }).first();

const counts = { edge: await edge.count(), line: await line.count(), label: await label.count(), composer: await composer.count() };

const geometry = await page.evaluate(() => {
  const first = document.querySelector('.spatial-canvas [data-edge]');
  if (!first) return null;
  const box = el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100, x: Math.round(r.x), y: Math.round(r.y) }; };
  return {
    edgeId: first.dataset.edge,
    lines: [...first.querySelectorAll('line')].map(l => ({ cls: l.getAttribute('class'), box: box(l) })),
    label: (() => { const t = first.querySelector('[data-relation-label]'); return t ? { text: t.textContent, box: box(t), visibility: getComputedStyle(t).visibility, display: getComputedStyle(t).display } : null; })(),
    edgeBox: box(first),
    canvasBox: box(document.querySelector('.spatial-canvas')),
    allEdges: [...document.querySelectorAll('.spatial-canvas [data-edge]')].map(g => g.dataset.edge)
  };
});

/* then run the interaction steps to see how far the flow gets */
const steps = [];
try {
  await line.dblclick();
  steps.push({ step: 'line dblclick', ok: true, composerVisible: await composer.count() > 0 ? !(await composer.evaluate(n => n.hidden)) : 'no-composer' });
} catch (e) { steps.push({ step: 'line dblclick', ok: false, error: String(e.message || e).slice(0, 300) }); }
try {
  await label.dblclick();
  steps.push({ step: 'label dblclick', composerVisible: await composer.count() > 0 ? !(await composer.evaluate(n => n.hidden)) : 'no-composer' });
} catch (e) { steps.push({ step: 'label dblclick', ok: false, error: String(e.message || e).slice(0, 300) }); }

console.log(JSON.stringify({ counts, geometry, steps, errors }, null, 2));
await browser.close();
server.kill();
