/**
 * SH-1: flow-3 residual diagnostic.
 *
 * The harness precondition (`.first()` edge group must contain a Playwright-visible <line>)
 * is measured separately from the route-convergence assertions behind it. This probe:
 *   1. reports the precondition truth (edge/line/label counts on the FIRST edge group),
 *   2. then exercises label-dblclick / close / F2 exactly as the harness does — using the
 *      first VISIBLE line in the DOM only for the whole-edge inertness step — and reports
 *      composer state + relation.edit receipts.
 * Diagnostic only: substituting the line locator is NOT a harness pass claim.
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43225);
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
const precondition = { edge: await edge.count(), lineOnFirstEdge: await line.count(), label: await label.count() };

const steps = [];

/* whole-edge inertness — harness uses line-on-first-edge; diagnostic falls back to any visible line */
const anyVisibleLine = line.count ? await page.locator('.spatial-canvas [data-edge] line').filter({ visible: true }).first().count() : 0;
const edgeLineTarget = precondition.lineOnFirstEdge > 0 ? line : page.locator('.spatial-canvas [data-edge] line').filter({ visible: true }).first();
const edgeLineFallback = precondition.lineOnFirstEdge === 0 && anyVisibleLine > 0;
try {
  await edgeLineTarget.dblclick({ timeout: 8000 });
  steps.push({ step: 'whole-edge line dblclick', usedFallbackLine: edgeLineFallback, composerVisible: await composer.count() > 0 ? !(await composer.evaluate(n => n.hidden)) : 'no-composer' });
} catch (e) { steps.push({ step: 'whole-edge line dblclick', error: String(e.message || e).slice(0, 200) }); }

try {
  await label.dblclick({ timeout: 8000 });
  steps.push({ step: 'label dblclick', composerVisible: await composer.count() > 0 ? !(await composer.evaluate(n => n.hidden)) : 'no-composer' });
} catch (e) { steps.push({ step: 'label dblclick', error: String(e.message || e).slice(0, 200) }); }

try {
  await composer.locator('[data-relation-close]').first().click({ timeout: 5000 });
  steps.push({ step: 'composer closed', ok: true });
} catch (e) { steps.push({ step: 'composer closed', error: String(e.message || e).slice(0, 200) }); }

try {
  await edge.focus();
  await page.keyboard.press('F2');
  await page.waitForTimeout(200);
  steps.push({ step: 'F2 on edge', composerVisible: await composer.count() > 0 ? !(await composer.evaluate(n => n.hidden)) : 'no-composer' });
} catch (e) { steps.push({ step: 'F2 on edge', error: String(e.message || e).slice(0, 200) }); }

const receipts = await page.evaluate(() => CEPFoundation.registry.receipts.filter(r => r.id === 'relation.edit').map(r => ({ owner: r.owner, ok: r.ok })));

console.log(JSON.stringify({ precondition, edgeLineFallbackUsed: edgeLineFallback, steps, relationEditReceipts: receipts, pageErrors: errors }, null, 2));
await browser.close();
server.kill();
