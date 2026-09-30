import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const b = await chromium.launch();
const out = [];
for (const dir of ['rtl','ltr']) {
  const ctx = await b.newContext({ viewport: { width: 1505, height: 1045 } });
  const p = await ctx.newPage();
  await p.addInitScript(({locale,chromeDirection}) => localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale,chromeDirection,contentDirection:chromeDirection}}})), { locale: dir==='rtl'?'ar':'en', chromeDirection: dir });
  await p.goto('http://localhost:4173/?surface=rq', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  // 1. view tab keyboard + focus retention
  await p.evaluate(() => document.querySelector('#domainToolbar [data-foundation-command="rq.view.claims"]')?.focus());
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  out.push({ dir, step: 'view-tab-enter', active: await p.evaluate(() => document.activeElement?.getAttribute('data-foundation-command')), view: await p.evaluate(() => document.querySelector('#domainToolbar [data-foundation-command="rq.view.claims"]')?.getAttribute('aria-pressed')) });
  // 2. claim radio keyboard + focus retention
  await p.evaluate(() => document.querySelector('#foundationStage .rq-radio')?.focus());
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  out.push({ dir, step: 'claim-radio-enter', active: await p.evaluate(() => { const a = document.activeElement; return `${a?.getAttribute('data-rq-action')}:${a?.getAttribute('data-claim')}`; }), selected: await p.evaluate(() => [...document.querySelectorAll('#foundationStage tr[aria-selected=true]')].map(r => r.dataset.rqClaim)) });
  // 3. action chip keyboard
  await p.evaluate(() => document.querySelector('#foundationStage .rq-chip:not([disabled])')?.focus());
  const before = await p.evaluate(() => (document.activeElement?.textContent||'').trim().slice(0,40));
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  out.push({ dir, step: 'chip-enter', chip: before, active: await p.evaluate(() => (document.activeElement?.textContent||'').trim().slice(0,40)), status: await p.evaluate(() => document.querySelector('#foundationStatus')?.textContent) });
  // 4. context tab keyboard
  await p.evaluate(() => document.querySelector('#domainContext [data-rq-action="context-tab"]')?.focus());
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  out.push({ dir, step: 'context-tab-enter', active: await p.evaluate(() => document.activeElement?.getAttribute('data-tab')), selected: await p.evaluate(() => document.querySelector('#domainContext .rq-tab[aria-selected=true]')?.getAttribute('data-tab')) });
  await ctx.close();
}
await b.close();
const fs = await import('node:fs/promises');
await fs.writeFile('writer-output/W02-RESEARCH-QUALITY/analysis/KEYBOARD.json', JSON.stringify(out, null, 1));
console.log('written analysis/KEYBOARD.json');
