import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(500);
const out = await page.evaluate(() => {
  const scopes = [...document.querySelectorAll('.contextscope')];
  const sheet = document.querySelector('#w04SurfacePresentationStyle');
  const matches = [];
  for (const r of sheet.sheet.cssRules) if (r.selectorText && r.selectorText.includes('contextscope')) matches.push({ sel: r.selectorText, css: r.style.cssText });
  return {
    count: scopes.length,
    scopes: scopes.map(n => ({ parent: n.parentElement?.className, hidden: n.hidden, display: getComputedStyle(n).display, rect: Math.round(n.getBoundingClientRect().height) })),
    myRules: matches,
    consumer: document.body.dataset.consumer
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
