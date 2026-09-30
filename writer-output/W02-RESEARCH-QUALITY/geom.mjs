import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const b = await chromium.launch();
for (const [w,h] of [[1505,1045]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.addInitScript(l => localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:'ar',chromeDirection:'rtl',contentDirection:'rtl'}}})));
  await p.goto('http://localhost:4173/?surface=rq', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const g = await p.evaluate(() => {
    const pick = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { sel, y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width) }; };
    return ['.rq-controlrow', '.rq-head', '.rq-headline', '.rq-title', '.rq-sub', '.rq-block:nth-of-type(1)', '.rq-sources', '.rq-source', '.rq-source-head', '.rq-source-meta', '.rq-quote', '.rq-block:nth-of-type(2)', '.rq-block:nth-of-type(3)', '.rq-result-grid'].map(pick);
  });
  console.log(w + 'x' + h, JSON.stringify(g, null, 1));
  await ctx.close();
}
await b.close();
