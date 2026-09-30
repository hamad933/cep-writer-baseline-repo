import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(700);
const out = await page.evaluate(() => {
  const el = document.querySelector('#w04SurfacePresentationStyle');
  const css = el ? el.textContent : '';
  const open = (css.match(/\{/g) || []).length, close = (css.match(/\}/g) || []).length;
  const rules = [];
  try { for (const sheet of document.styleSheets) { try { for (const r of sheet.cssRules) if (r.selectorText && /studio-head|record-body|foundationStage\[/.test(r.selectorText)) rules.push(r.selectorText.slice(0,120)); } catch {} } } catch {}
  const stage = document.querySelector('#foundationStage');
  const head = document.querySelector('.m0-studio-head');
  const h3 = document.querySelector('#foundationStage .w04-block h3');
  return {
    styleFound: !!el, cssLen: css.length, open, close,
    hasMarker: css.includes('W04 SURFACE PRESENTATION SYSTEM'),
    indexOfStudio: css.indexOf('[data-r6-typed-surface=evidence] .m0-studio-head'),
    rules,
    stagePadding: stage ? getComputedStyle(stage).padding : null,
    headH: head ? Math.round(head.getBoundingClientRect().height) : null,
    h1Size: document.querySelector('.m0-studio-head h1') ? getComputedStyle(document.querySelector('.m0-studio-head h1')).fontSize : null,
    h3Transform: h3 ? getComputedStyle(h3).textTransform : null,
    h3Color: h3 ? getComputedStyle(h3).color : null
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
