import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(600);
const out = await page.evaluate(() => {
  const info = sel => { const n = document.querySelector(sel); if (!n) return null; const cs = getComputedStyle(n); return { dir: n.getAttribute('dir'), computedDirection: cs.direction, text: (n.textContent || '').slice(0, 90), bidi: cs.unicodeBidi }; };
  return {
    centerEmpty: info('#foundationStage .m0-empty-state'),
    centerToken: info('#foundationStage .state-token'),
    leftToken: info('#domainLeftRegion .state-token'),
    rightToken: info('#domainContext .state-token'),
    bodyDir: document.body.dataset.foundationDirection, htmlDir: document.documentElement.dir,
    stageChildren: [...document.querySelectorAll('#foundationStage .m0-workbench > *')].map(n => n.className)
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
