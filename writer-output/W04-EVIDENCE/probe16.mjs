import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(600);
const out = await page.evaluate(() => {
  const info = sel => { const n = document.querySelector(sel); if (!n) return null; const cs = getComputedStyle(n); return { scrollH: n.scrollHeight, clientH: n.clientHeight, overflow: cs.overflow + '/' + cs.overflowY, scrollable: n.scrollHeight > n.clientHeight + 2 && ['auto','scroll'].includes(cs.overflowY) }; };
  return {
    domainContext: info('#domainContext'),
    rightPbody: info('#rightPane .pbody'),
    leftRegion: info('#domainLeftRegion'),
    leftPanel: info('#domainLeftRegion .m0-collection-panel'),
    skeletonCount: document.querySelectorAll('.w04-ctx-skeleton').length,
    lastCardVisible: (() => { const cards = document.querySelectorAll('.w04-ctx-skeleton'); if (!cards.length) return null; const r = cards[cards.length - 1].getBoundingClientRect(); const p = document.querySelector('#rightPane .pbody').getBoundingClientRect(); return { cardBottom: Math.round(r.bottom), paneBottom: Math.round(p.bottom), fullyVisible: r.bottom <= p.bottom + 1 }; })()
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
