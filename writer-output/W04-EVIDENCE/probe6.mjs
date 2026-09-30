import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(500);
const out = await page.evaluate(() => {
  const sec = document.querySelector('[data-r6-typed-surface]');
  const h1 = document.querySelector('.m0-studio-head h1');
  const mySheet = document.querySelector('#w04SurfacePresentationStyle');
  const myRules = [...mySheet.sheet.cssRules].filter(r => r.selectorText && r.selectorText.includes('studio-head')).map(r => ({ sel: r.selectorText, match: (() => { try { return h1.matches(r.selectorText); } catch (e) { return 'ERR ' + e.message; } })() }));
  return {
    bodyData: { ...document.body.dataset },
    sectionAttr: sec ? sec.getAttribute('data-r6-typed-surface') : null,
    h1InSection: sec ? sec.contains(h1) : null,
    myRules,
    styleIsLast: document.head.lastElementChild === mySheet
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
