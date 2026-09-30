import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.waitForTimeout(500);
const out = await page.evaluate(() => {
  const el = document.querySelector('.contextscope');
  const hits = [];
  let order = 0;
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules) {
      order++;
      if (!r.selectorText || !r.style) continue;
      const disp = r.style.getPropertyValue('display');
      if (!disp) continue;
      let m = false; try { m = el.matches(r.selectorText); } catch { continue; }
      if (m) hits.push({ sheet: sheet.ownerNode?.id || sheet.href || 'anon', sel: r.selectorText.slice(0, 140), disp, prio: r.style.getPropertyPriority('display'), order });
    }
  }
  return { hits, computed: getComputedStyle(el).display };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
