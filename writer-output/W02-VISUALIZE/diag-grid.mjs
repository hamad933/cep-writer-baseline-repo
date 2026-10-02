#!/usr/bin/env node
/* Diagnostic: grid placement of visualize stage children when #spatialHost is force-unhidden. */
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
await page.goto('http://localhost:4173/?surface=visualize', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const dump = await page.evaluate(() => {
  const stage = document.querySelector('.m0-visualize-four-view');
  const rect = el => (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect());
  const kids = [...stage.children].map(el => ({ tag: el.tagName, id: el.id, cls: el.className?.toString?.().slice(0, 40), hidden: !!el.hidden, display: getComputedStyle(el).display, rect: rect(el) }));
  const host = document.querySelector('#spatialHost');
  host.hidden = false;
  try { CEPFoundation.spatial?.fit?.(); } catch {}
  const after = [...stage.children].map(el => ({ id: el.id || el.className?.toString?.().slice(0, 24), hidden: !!el.hidden, display: getComputedStyle(el).display, row: getComputedStyle(el).gridRowStart, rect: rect(el) }));
  const style = getComputedStyle(stage);
  return { gridRows: style.gridTemplateRows, before: kids, after, hostParent: host.parentElement.id || host.parentElement.className };
});
await browser.close();
console.log(JSON.stringify(dump, null, 1));
