import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e.message)));
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.evaluate(() => {
  const d = window.CEPFoundation.m0Composition.group.evidence.domain;
  for (const [id, state] of [['a-1', 'SUBMITTED_FOR_INTAKE'], ['a-2', 'PREPARED']]) {
    d.importEvidence({ id, revisionId: `${id}-r1`, title: `Probe ${id}`, subject: 'probe', evidenceClaim: `claim ${id}`, criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'probe', sourceId: 'SRC', sourceRevision: 'r1' });
    if (state === 'SUBMITTED_FOR_INTAKE') d.submitCandidate(id);
  }
  window.CEPFoundation.m0Composition.mounted.render();
});
await page.waitForTimeout(400);
const before = await page.evaluate(() => ({
  rows: window.CEPFoundation.m0Composition.surface.collectionCore.snapshot().visibleRows.map(r => r.id),
  pressed: [...document.querySelectorAll('[data-w04-segment]')].map(b => [b.dataset.w04Segment, b.getAttribute('aria-pressed')])
}));
await page.click('[data-w04-segment="PREPARED"]');
await page.waitForTimeout(400);
const after = await page.evaluate(() => ({
  rows: window.CEPFoundation.m0Composition.surface.collectionCore.snapshot().visibleRows.map(r => r.id),
  pressed: [...document.querySelectorAll('[data-w04-segment]')].map(b => [b.dataset.w04Segment, b.getAttribute('aria-pressed')]),
  center: document.querySelector('.w04-rec-title')?.textContent,
  rowNodes: document.querySelectorAll('#domainLeftRegion [data-r6-row]').length
}));
await page.click('[data-w04-segment=""]');
await page.waitForTimeout(300);
const reset = await page.evaluate(() => window.CEPFoundation.m0Composition.surface.collectionCore.snapshot().visibleRows.map(r => r.id));
console.log(JSON.stringify({ before, after, reset, errors }, null, 1));
await browser.close();
