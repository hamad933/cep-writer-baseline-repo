import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(600);
const out = await page.evaluate(() => {
  const info = sel => { const n = document.querySelector(sel); return n ? { text: (n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120), cls: n.className, rect: (() => { const r = n.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })() } : null; };
  return {
    centerPhead: info('#centerPane .phead'),
    leftPhead: info('#leftPane .phead'),
    rightPhead: info('#rightPane .phead'),
    topLabels: [...document.querySelectorAll('#centerPane .phead *, .centerhead *')].slice(0, 12).map(n => `${n.tagName}.${n.className}="${(n.textContent || '').trim().slice(0, 40)}"`),
    scopeTabs: info('#rightPane .contextscope'),
    consoleFailures: performance.getEntriesByType('resource').filter(r => r.name.startsWith('http://localhost:4173') === false).map(r => r.name).slice(0, 5),
    studioHeadRect: info('#foundationStage .m0-studio-head'),
    w04StyleLast: document.head.lastElementChild?.id === 'w04SurfacePresentationStyle',
    h3Transform: (() => { const h = document.querySelector('#foundationStage .w04-block h3'); return h ? getComputedStyle(h).textTransform : null; })()
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
