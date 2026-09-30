#!/usr/bin/env node
/* W02-VISUALIZE DOM geometry probe — usage: node writer-output/W02-VISUALIZE/probe.mjs [lang] [view] [w] [h] */
import { chromium } from 'playwright';
const lang = process.argv[2] || 'ar';
const view = process.argv[3] || 'TREE';
const width = Number(process.argv[4] || 1672), height = Number(process.argv[5] || 941);
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width, height } });
await ctx.addInitScript(l => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: l, chromeDirection: l === 'ar' ? 'rtl' : 'ltr' } } })); } catch {} }, lang);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e?.message || e)));
await page.goto('http://localhost:4173/?surface=visualize', { waitUntil: 'load' });
await page.waitForTimeout(1500);
if (view !== 'TREE') { await page.click(`[data-visualize-view-tab="${view}"]`); await page.waitForTimeout(900); }
const out = await page.evaluate(() => {
  const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right), bottom: Math.round(b.bottom) }; };
  const overlap = (a, b) => a && b && !(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y);
  const head = document.querySelector('.m0-visualize-four-view .domain-heading');
  const headid = head?.querySelector('.vis-headid'), sw = head?.querySelector('.vis-switcher'), truth = head?.querySelector('.vis-headtruth');
  const eye = head?.querySelector('.vis-eyebrow');
  const rows = [...document.querySelectorAll('.visualize-tree-row')];
  const leftRows = [...document.querySelectorAll('.vis-objectrow')];
  const nodes = [...document.querySelectorAll('.spatial-node-card')];
  const overflowing = nodes.map(n => {
    const rect = n.querySelector('.node-surface')?.getBoundingClientRect();
    const t = n.querySelector('.node-title')?.getBoundingClientRect();
    if (!rect || !t) return null;
    return { id: n.dataset.node, over: Math.round(Math.max(0, t.right - rect.right) + Math.max(0, rect.left - t.left)), titleW: Math.round(t.width), rectW: Math.round(rect.width), text: (n.querySelector('.node-title')?.textContent || '').slice(0, 60) };
  }).filter(Boolean);
  return {
    dir: document.documentElement.dir, lang: document.documentElement.lang,
    head: r(head), headid: r(headid), switcher: r(sw), headtruth: r(truth), eyebrow: r(eye),
    overlapHeadIdSwitcher: overlap(r(headid), r(sw)),
    overlapEyebrowSwitcher: overlap(r(eye), r(sw)),
    meta: r(document.querySelector('#visualizeViewMeta')),
    metaLines: document.querySelector('#visualizeViewMeta') ? Math.round(document.querySelector('#visualizeViewMeta').getBoundingClientRect().height) : null,
    center: r(document.querySelector('#domainView')),
    spatial: r(document.querySelector('#spatialHost')),
    treeRowCount: rows.length,
    treeRowSample: rows.slice(0, 3).map(el => ({ text: el.innerText.replace(/\n/g, ' | ').slice(0, 90), rect: r(el) })),
    leftRowCount: leftRows.length,
    leftRowOverflow: leftRows.map(el => { const s = el.querySelector('.vis-orow span'); return s && s.scrollWidth > s.clientWidth + 1 ? { t: s.textContent.slice(0, 40), sw: s.scrollWidth, cw: s.clientWidth } : null; }).filter(Boolean),
    leftRect: r(document.querySelector('.visualize-left')),
    rightRect: r(document.querySelector('.visualize-selection')),
    nodeOverflow: overflowing,
    legend: !!document.querySelector('.vis-spatial-overlay'),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  };
});
await browser.close();
console.log(JSON.stringify({ view, errors, ...out }, null, 1));
