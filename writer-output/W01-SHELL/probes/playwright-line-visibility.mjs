import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(`<!doctype html><svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <g data-edge="h"><line class="relation-hit-target" x1="10" y1="50" x2="258" y2="50" stroke="transparent" stroke-width="18"/><line class="relation-line" x1="10" y1="50" x2="258" y2="50" stroke="#3b82f6" stroke-width="1.5"/><text x="120" y="45">HORIZONTAL</text></g>
  <g data-edge="d"><line x1="10" y1="100" x2="258" y2="160" stroke="#3b82f6" stroke-width="1.5"/><text x="120" y="120">DIAGONAL</text></g>
</svg>`);
const all = await page.locator('[data-edge] line').count();
const visible = await page.locator('[data-edge] line').filter({ visible: true }).count();
const firstGroupVisibleLines = await page.locator('[data-edge]').first().locator('line').filter({ visible: true }).count();
const boxes = await page.evaluate(() => [...document.querySelectorAll('line')].map(l => { const r = l.getBoundingClientRect(); return { w: r.width, h: r.height }; }));
console.log(JSON.stringify({ all, visible, firstGroupVisibleLines, boxes }, null, 2));
await browser.close();
