import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=rq', { waitUntil: 'load' });
await page.waitForTimeout(1500);
const probe = await page.evaluate(() => {
  const kids = sel => [...(document.querySelector(sel)?.children || [])].map(c => ({
    tag: c.tagName, id: c.id, cls: String(c.className).slice(0, 60), hidden: c.hidden, ds: {...c.dataset}
  }));
  return {
    carrier: document.body.dataset.carrierDocumentSemantics,
    domainContext: !!document.querySelector('#domainContext'),
    domainContextParent: document.querySelector('#domainContext')?.parentElement?.id || document.querySelector('#domainContext')?.parentElement?.className || null,
    domainToolbar: !!document.querySelector('#domainToolbar'),
    domainToolbarParent: document.querySelector('#domainToolbar')?.parentElement?.className || null,
    leftPbody: kids('#leftPane .pbody'),
    rightPbody: kids('#rightPane .pbody'),
    bottomContent: kids('#bottomContent'),
    toolbar: kids('.toolbar'),
    stage: kids('#foundationStage'),
    panes: { left: document.querySelector('#leftPane')?.dataset.state, right: document.querySelector('#rightPane')?.dataset.state, bottom: document.querySelector('#bottomShelf')?.dataset.state },
    globalRows: [...document.querySelectorAll('.global .gnav a')].map(a => ({ label: a.textContent.trim(), ds: {...a.dataset} })),
    w02nav: [...document.querySelectorAll('.w02nav a')].map(a => ({ label: a.textContent.trim(), ds: {...a.dataset} }))
  };
});
console.log(JSON.stringify(probe, null, 2));
await browser.close();
