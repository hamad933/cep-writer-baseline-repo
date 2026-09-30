import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.evaluate(() => {
  const d = window.CEPFoundation.m0Composition.group.evidence.domain;
  d.importEvidence({ id: 'pr-1', revisionId: 'pr-1-r1', title: 'Probe candidate', subject: 'probe', evidenceClaim: 'probe claim', criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'probe', sourceId: 'SRC-1', sourceRevision: 'r1' });
  window.CEPFoundation.m0Composition.mounted.render();
});
await page.waitForTimeout(400);
const out = await page.evaluate(() => ({
  right: document.querySelector('#rightPane .pbody')?.outerHTML || null,
  left: document.querySelector('#leftPane .pbody')?.outerHTML || null,
  toolbarParent: document.querySelector('#domainToolbar')?.parentElement?.outerHTML.slice(0, 900),
  stageChildren: [...document.querySelectorAll('#foundationStage > *')].map(n => ({ cls: n.className, h: Math.round(n.getBoundingClientRect().height), txt: (n.innerText || '').slice(0, 80) }))
}));
console.log(JSON.stringify(out, null, 1));
await browser.close();
