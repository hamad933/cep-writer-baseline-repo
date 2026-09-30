import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
page.on('console', m => console.log('[console.' + m.type() + ']', m.text()));
page.on('pageerror', e => console.log('[pageerror]', String(e && e.stack || e)));
page.on('requestfailed', r => console.log('[reqfail]', r.url(), r.failure()?.errorText));
await page.goto('http://localhost:4173/?surface=rq', { waitUntil: 'load' });
await page.waitForTimeout(2500);
const info = await page.evaluate(() => {
  const stage = document.querySelector('#foundationStage');
  return {
    surfaceParam: location.search,
    stageComposition: stage?.dataset.m0Composition,
    stageRq: stage?.dataset.rqSurface,
    stageClass: stage?.className,
    rqNodes: document.querySelectorAll('[data-rq-region]').length,
    toolbarIds: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(b => b.dataset.foundationCommand),
    hasStyle: !!document.getElementById('rqSurfaceStyle'),
    status: document.querySelector('#foundationStatus')?.textContent,
    commands: [...(window.CEPFoundation?.registry?.commands?.keys?.() || [])].filter(k => k.startsWith('rq.'))
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
