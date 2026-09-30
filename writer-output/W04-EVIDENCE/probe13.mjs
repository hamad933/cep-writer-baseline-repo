import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1505, height: 1045 } });
await ctx.addInitScript(({ lang }) => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: lang, chromeDirection: lang === 'ar' ? 'rtl' : 'ltr' } } })); } catch {} }, { lang: 'en' });
const page = await ctx.newPage();
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(600);
const out = await page.evaluate(() => {
  const grid = document.querySelector('#foundationStage .m0-field-grid');
  const labels = grid ? [...grid.querySelectorAll(':scope > label')].slice(0, 4).map(l => ({ t: l.firstChild?.textContent?.trim?.() || l.textContent.slice(0, 20), rect: Math.round(l.getBoundingClientRect().x) })) : null;
  const details = document.querySelector('#foundationStage .m0-domain-nav');
  const cs = details ? getComputedStyle(details) : null;
  const gridCs = grid ? getComputedStyle(grid) : null;
  return {
    bodyDir: document.body.dataset.foundationDirection, htmlDir: document.documentElement.dir,
    detailsDir: cs?.direction, gridDir: gridCs?.direction, gridX: grid ? Math.round(grid.getBoundingClientRect().x) : null,
    labels
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
