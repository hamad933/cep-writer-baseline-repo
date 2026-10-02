#!/usr/bin/env node
/* Diagnostic: why `spatial.canvas-has-bounds` (bidi flow, visualize step) fails at 1440x1000.
   Read-only probe of the running product; no product mutation. */
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e?.message || e)));
await page.goto('http://localhost:4173/?surface=visualize', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const before = await page.evaluate(() => {
  const host = document.querySelector('#spatialHost');
  const canvas = document.querySelector('.spatial-canvas');
  const rect = el => el ? (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect()) : null;
  return { hidden: host?.hidden, hostRect: rect(host), canvasCount: document.querySelectorAll('.spatial-canvas').length, canvasRect: rect(canvas), svgRect: rect(CEPFoundation.spatial?.svg), activeView: document.querySelector('#foundationStage')?.dataset?.visualizeActiveView };
});
const after = await page.evaluate(() => {
  const host = document.querySelector('#spatialHost');
  if (host) host.hidden = false;
  try { CEPFoundation.spatial?.fit?.(); } catch (e) { return { fitError: String(e) } }
  const canvas = document.querySelector('.spatial-canvas');
  const rect = el => el ? (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(el.getBoundingClientRect()) : null;
  return { hidden: host?.hidden, hostRect: rect(host), canvasCount: document.querySelectorAll('.spatial-canvas').length, canvasRect: rect(canvas), svgRect: rect(CEPFoundation.spatial?.svg), hostDisplay: host ? getComputedStyle(host).display : null, canvasDisplay: canvas ? getComputedStyle(canvas).display : null, canvasAttrs: canvas ? { w: canvas.getAttribute('width'), h: canvas.getAttribute('height') } : null };
});
await browser.close();
console.log(JSON.stringify({ before, after, errors }, null, 1));
