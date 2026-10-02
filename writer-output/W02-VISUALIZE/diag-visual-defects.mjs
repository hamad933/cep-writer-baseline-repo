#!/usr/bin/env node
/* W02-VISUALIZE visual defect diagnostics — geometry/DOM facts only (no mutation of product state
   beyond view activation and pane reveal probing). Prints JSON. */
import { chromium } from 'playwright';
const [w = 1440, h = 1000, lang = 'ar'] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(h) } });
await ctx.addInitScript(l => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: l, chromeDirection: l === 'ar' ? 'rtl' : 'ltr' } } })); } catch {} }, lang);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e?.message || e)));
await page.goto('http://localhost:4173/?surface=visualize', { waitUntil: 'load' });
await page.waitForTimeout(1500);

const rect = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) }; };
const overlap = (a, b) => !(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y);

const out = {};
// ── PATH lane overflow
await page.click('[data-visualize-view-tab="PATH"]');
await page.waitForTimeout(700);
out.path = await page.evaluate(() => [...document.querySelectorAll('.visualize-path-track')].map((t, i) => ({
  lane: i, clientW: t.clientWidth, scrollW: t.scrollWidth, overflowX: t.scrollWidth > t.clientWidth + 1,
  overflowStyle: getComputedStyle(t).overflowX, wrap: getComputedStyle(t).flexWrap,
  cards: t.querySelectorAll('.visualize-path-node').length
})));

// ── toolbar command labels (surface-registered vs shared) in active locale
out.toolbarLabels = await page.evaluate(() => [...document.querySelectorAll('[data-foundation-command]')].map(b => ({ id: b.dataset.foundationCommand, text: b.textContent.trim().slice(0, 60) })));

// ── GRAPH label/card collisions
await page.click('[data-visualize-view-tab="GRAPH"]');
await page.waitForTimeout(900);
out.graph = await page.evaluate(() => {
  const r = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right), bottom: Math.round(b.bottom) }; };
  const ov = (a, b) => !(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y);
  const cards = [...document.querySelectorAll('.spatial-node-card')].map(n => ({ id: n.dataset.node, rect: r(n) }));
  const labels = [...document.querySelectorAll('.relation-label')].map(l => {
    const rect = r(l);
    const hits = cards.filter(c => ov(rect, c.rect)).map(c => c.id);
    return { text: (l.textContent || '').slice(0, 50), visibility: getComputedStyle(l).visibility, rect, cardCollisions: hits };
  });
  const legend = document.querySelector('.vis-spatial-overlay .vis-legend');
  const legendRect = legend ? r(legend) : null;
  const legendHits = legendRect ? cards.filter(c => ov(legendRect, c.rect)).map(c => c.id) : [];
  const legendPointer = legend ? getComputedStyle(legend).pointerEvents : null;
  return { labels, legend: legendRect, legendCollisions: legendHits, legendPointer, cards };
});

// ── CANVAS toolbar labels
await page.click('[data-visualize-view-tab="CANVAS"]');
await page.waitForTimeout(700);
out.canvasToolbarLabels = await page.evaluate(() => [...document.querySelectorAll('[data-foundation-command]')].map(b => ({ id: b.dataset.foundationCommand, text: b.textContent.trim().slice(0, 60), disabled: b.disabled === true || b.getAttribute('aria-disabled') === 'true' })));

// ── responsive: RIGHT pane reachability at this viewport
out.responsive = await page.evaluate(() => {
  const r = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const right = document.querySelector('#wave3ContextInspectorHost') || document.querySelector('[data-m0-region="RIGHT"]');
  const reveal = [...document.querySelectorAll('button,[role="button"]')].filter(b => /right|inspector|context|السياق/i.test(`${b.dataset.m0Region || ''}${b.getAttribute('aria-label') || ''}${b.title || ''}`)).map(b => ({ label: b.getAttribute('aria-label') || b.title, visible: !b.hidden && b.getBoundingClientRect().width > 0 })).slice(0, 8);
  return { viewport: { w: document.documentElement.clientWidth, h: document.documentElement.clientHeight }, horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, rightExists: !!right, rightRect: right ? r(right) : null, rightHidden: right ? !!right.hidden : null, revealCandidates: reveal };
});
out.errors = errors;
await browser.close();
console.log(JSON.stringify(out, null, 1));
