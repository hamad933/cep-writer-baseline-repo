import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1505, height: 1045 } });
await ctx.addInitScript(() => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: 'en', chromeDirection: 'ltr' } } })); } catch {} });
const page = await ctx.newPage();
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(500);
const out = await page.evaluate(() => {
  const el = document.querySelector('.m0-workbench');
  const hits = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules) {
      if (!r.selectorText || !r.style || !r.style.getPropertyValue('direction')) continue;
      let m = false; try { m = el.matches(r.selectorText); } catch { continue; }
      if (m) hits.push({ sheet: sheet.ownerNode?.id || sheet.href?.split('/').pop(), sel: r.selectorText.slice(0, 130), dir: r.style.getPropertyValue('direction'), prio: r.style.getPropertyPriority('direction') });
    }
  }
  return { hits, attrs: [...el.attributes].map(a => `${a.name}=${a.value.slice(0, 60)}`), computed: getComputedStyle(el).direction, inline: el.getAttribute('style') };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
