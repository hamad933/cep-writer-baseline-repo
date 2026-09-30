import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.evaluate(() => {
  const d = window.CEPFoundation.m0Composition.group.evidence.domain;
  d.importEvidence({ id: 'pr-1', revisionId: 'pr-1-r1', title: 'Probe', subject: 'p', evidenceClaim: 'c', criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'p', sourceId: 'S', sourceRevision: 'r1' });
  window.CEPFoundation.m0Composition.mounted.render();
});
await page.waitForTimeout(500);
const before = await page.evaluate(() => {
  const n = document.querySelector('#domainContext');
  const notice = n.querySelector('.m0-context-summary');
  return { scrollH: n.scrollHeight, clientH: n.clientHeight, overflowY: getComputedStyle(n).overflowY, hasNotice: !!notice, noticeIsLast: notice ? notice.previousElementSibling !== null && n.querySelector('.m0-context-panel')?.lastElementChild === notice : null };
});
const scrolled = await page.evaluate(() => { const n = document.querySelector('#domainContext'); n.scrollTop = 99999; return { scrollTop: Math.round(n.scrollTop), maxScroll: n.scrollHeight - n.clientHeight }; });
const after = await page.evaluate(() => {
  const n = document.querySelector('#domainContext');
  const notice = n.querySelector('.m0-context-summary');
  const r = notice.getBoundingClientRect();
  const pane = document.querySelector('#rightPane .pbody').getBoundingClientRect();
  return { noticeInViewport: r.bottom <= pane.bottom + 2 && r.top >= pane.top - 2, noticeTop: Math.round(r.top), paneBottom: Math.round(pane.bottom), text: notice.textContent.slice(0, 60) };
});
console.log(JSON.stringify({ before, scrolled, after, errors }, null, 1));
await browser.close();
