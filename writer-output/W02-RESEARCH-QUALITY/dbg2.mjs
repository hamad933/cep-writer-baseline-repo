import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
page.on('console', m => console.log('[c.' + m.type() + ']', m.text()));
await page.addInitScript(({ locale, chromeDirection }) => {
  try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale,chromeDirection,contentDirection:chromeDirection}}})); } catch {}
}, { locale: 'ar', chromeDirection: 'rtl' });
await page.goto('http://localhost:4173/?surface=rq&capture=test', { waitUntil: 'load' });
const snap = async tag => {
  const s = await page.evaluate(() => {
    const st = document.querySelector('#foundationStage');
    return { t: Date.now(), lang: document.documentElement.lang, dir: document.documentElement.dir, comp: st?.dataset.m0Composition, rq: st?.dataset.rqSurface, child: st?.firstElementChild?.className, status: document.querySelector('#foundationStatus')?.textContent, toolbar: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(b=>b.dataset.foundationCommand) };
  });
  console.log(tag, JSON.stringify(s));
};
await page.waitForTimeout(400); await snap('t400 ');
await page.waitForTimeout(1200); await snap('t1600');
const buf = await page.screenshot({ path: 'writer-output/W02-RESEARCH-QUALITY/evidence/look/dbg2.png' });
await snap('after-shot');
await page.waitForTimeout(2000); await snap('t3600');
await browser.close();
