import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(700);
const out = await page.evaluate(() => {
  const h1 = document.querySelector('.m0-studio-head h1');
  const h3 = document.querySelector('#foundationStage .w04-block h3');
  const collect = (el, prop) => {
    const hits = [];
    let i = 0;
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const r of rules) {
        i++;
        if (!r.selectorText) continue;
        try { if (el.matches(r.selectorText) && new RegExp(`(?:^|[^-])${prop}\\s*:`).test(r.style.cssText)) hits.push({ sheet: sheet.href || sheet.ownerNode?.id || 'inline', sel: r.selectorText.slice(0, 110), prop: r.style.getPropertyValue(prop), prio: r.style.getPropertyPriority(prop), order: i }); } catch {}
      }
    }
    return hits;
  };
  return {
    styleOrder: [...document.head.querySelectorAll('style')].map(s => s.id || 'no-id'),
    h1FontSize: collect(h1, 'font-size'),
    h3Color: collect(h3, 'color'),
    h3Transform: collect(h3, 'text-transform')
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
