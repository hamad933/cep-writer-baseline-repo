import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(600);
const out = await page.evaluate(() => {
  const pts = [[360, 213], [1000, 213], [415, 213], [1465, 213]];
  const at = pts.map(([x, y]) => ({ pt: [x, y], stack: document.elementsFromPoint(x, y).slice(0, 4).map(n => `${n.tagName}#${n.id}.${(n.className || '').toString().slice(0, 40)}:${(n.textContent || '').trim().slice(0, 30)}`) }));
  const scope = document.querySelector('#rightPane .contextscope');
  const mySheet = document.querySelector('#w04SurfacePresentationStyle');
  return {
    at,
    scopeDisplay: scope ? { display: getComputedStyle(scope).display, hidden: scope.hidden, inline: scope.getAttribute('style') } : null,
    mySheetHasScope: mySheet ? mySheet.textContent.includes('.contextscope') : false,
    mySheetPos: mySheet ? { isLast: document.head.lastElementChild === mySheet, index: [...document.head.children].indexOf(mySheet), headChildren: [...document.head.children].map(n => n.id || n.tagName) } : null
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
