import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1505, height: 1045 } });
const page = await ctx.newPage();
page.on('console', m => console.log('[c.' + m.type() + ']', m.text()));
page.on('framenavigated', f => { if (f === page.mainFrame()) console.log('[nav]', f.url()); });
await page.addInitScript(({ locale, chromeDirection }) => {
  try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale,chromeDirection,contentDirection:chromeDirection}}})); } catch {}
}, { locale: 'ar', chromeDirection: 'rtl' });
await page.goto('http://localhost:4173/?surface=rq&capture=dbg3', { waitUntil: 'load' });
await page.waitForTimeout(1600);
const ev = await page.evaluate(() => ({
  frames: window.frames.length,
  stages: document.querySelectorAll('#foundationStage').length,
  child: document.querySelector('#foundationStage')?.firstElementChild?.className,
  rqRegions: document.querySelectorAll('[data-rq-region]').length,
  m0studio: document.querySelectorAll('.m0-studio').length,
  title: document.title
}));
console.log('EVAL', JSON.stringify(ev));
const html = await page.content();
console.log('HTML has rq-scope:', html.includes('rq-scope'), '| has m0-studio:', html.includes('m0-studio'), '| len', html.length);
const buf = await page.screenshot();
console.log('shot bytes', buf.length, 'sha', (await import('node:crypto')).createHash('sha256').update(buf).digest('hex').slice(0,16));
const ev2 = await page.evaluate(() => document.querySelector('#foundationStage')?.firstElementChild?.className);
console.log('child after shot', ev2);
await browser.close();
