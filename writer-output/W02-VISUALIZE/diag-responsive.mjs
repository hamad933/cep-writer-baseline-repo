#!/usr/bin/env node
/* W02-VISUALIZE responsive probe: pane presence/geometry at a viewport + RIGHT-pane reachability. */
import { chromium } from 'playwright';
const [w = 1024, h = 900, lang = 'ar'] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(h) } });
await ctx.addInitScript(l => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: l, chromeDirection: l === 'ar' ? 'rtl' : 'ltr' } } })); } catch {} }, lang);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e?.message || e)));
await page.goto('http://localhost:4173/?surface=visualize', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const measure = () => page.evaluate(() => {
  const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const vis = el => !!el && !el.hidden && el.getBoundingClientRect().width > 0;
  const left = document.querySelector('.visualize-left');
  const center = document.querySelector('#domainView');
  const right = document.querySelector('.visualize-selection');
  const inspector = document.querySelector('#wave3ContextInspectorHost');
  const controls = [...document.querySelectorAll('button,[role="button"],[data-foundation-command]')]
    .filter(b => /context|pin|inspector|السياق|تثبيت/i.test(`${b.getAttribute('aria-label') || ''}${b.title || ''}${b.dataset.foundationCommand || ''}`))
    .map(b => ({ id: b.dataset.foundationCommand || '', label: b.getAttribute('aria-label') || b.title || b.textContent.trim().slice(0, 30), visible: vis(b) }));
  return {
    viewport: { w: document.documentElement.clientWidth, h: document.documentElement.clientHeight },
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    left: { rect: r(left), visible: vis(left) },
    center: { rect: r(center), visible: vis(center) },
    right: { rect: r(right), visible: vis(right) },
    inspectorHost: { rect: r(inspector), visible: vis(inspector) },
    controls
  };
});
const before = await measure();
let activation = null;
try {
  activation = await page.evaluate(() => {
    const exec = id => CEPFoundation.registry.execute(id, {});
    const tried = [];
    for (const id of ['foundation.right', 'foundation.context']) { try { const res = exec(id); tried.push({ id, ok: res?.ok ?? null, status: res?.status ?? null }); if (res?.ok !== false) break; } catch (e) { tried.push({ id, error: String(e.message || e) }); } }
    return tried;
  });
} catch (e) { activation = [{ error: String(e.message || e) }]; }
await page.waitForTimeout(500);
const after = await measure();
await browser.close();
console.log(JSON.stringify({ viewport: [Number(w), Number(h)], lang, before, activation, after, errors }, null, 1));
