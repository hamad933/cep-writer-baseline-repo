/**
 * POR-1 direction/mirroring diagnostic (read-only observation, no product mutation).
 * Question: in AR/RTL do the workspace panes actually mirror, and if not, is the cause
 * surface-owned (portfolio) or shared shell/pane layout?
 * Usage: node writer-output/W04-PORTFOLIO/harness/por1-direction-diag.mjs
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../../../', import.meta.url));

const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(freePort)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let up = false;
for (let i = 0; i < 120; i++) { try { if ((await fetch(`http://127.0.0.1:${freePort}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
if (!up) { console.error('SERVER_FAILED'); server.kill('SIGTERM'); process.exit(1); }

const browser = await chromium.launch({ headless: true });
const out = [];

const chain = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const rows = [];
  let node = el;
  for (let i = 0; i < 6 && node && node !== document.documentElement; i++, node = node.parentElement) {
    const s = getComputedStyle(node);
    rows.push({ tag: node.tagName, id: node.id || null, cls: String(node.className).slice(0, 50), display: s.display, direction: s.direction, position: s.position, flexDirection: s.flexDirection, order: s.order, left: s.left, right: s.right });
  }
  const s = getComputedStyle(el);
  return { rect: { x: Math.round(r.x), w: Math.round(r.width) }, inlineStyle: el.getAttribute('style'), computed: { direction: s.direction, position: s.position, left: s.left, right: s.right }, chain: rows };
};

for (const surface of ['portfolio', 'evidence']) {
  for (const locale of ['en', 'ar']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${freePort}/?surface=${surface}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 20000 });
    await page.evaluate(l => { window.CEPFoundation.preferences.set('locale', l, 'global'); window.CEPFoundation.workspace.applyPreferences(); }, locale);
    await page.waitForTimeout(400);
    await page.evaluate(() => { try { window.CEPFoundation.m0Composition?.mounted?.render?.(); } catch {} });
    await page.waitForTimeout(300);
    const data = await page.evaluate((probe) => {
      const f = new Function('sel', `return (${probe})(sel)`);
      return {
        html: { dir: document.documentElement.dir, lang: document.documentElement.lang, directionAuthority: document.documentElement.dataset.directionAuthority || null },
        body: { direction: getComputedStyle(document.body).direction, foundationDirection: document.body.dataset.foundationDirection || null },
        left: f('#domainLeftRegion'),
        center: f('#foundationStage'),
        right: f('#domainContext')
      };
    }, chain.toString());
    out.push({ surface, locale, data });
    await context.close();
  }
}
await browser.close();
server.kill('SIGTERM');
console.log(JSON.stringify(out, null, 1));
