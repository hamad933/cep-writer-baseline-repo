import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;
const root = fileURLToPath(new URL('../../', import.meta.url));
const locale = process.argv[2] || 'ar';
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const wait = async (u) => { for (let i = 0; i < 150; i++) { try { if ((await fetch(u)).ok) return true; } catch { } await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1505, height: 1045 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(([l]) => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: l, chromeDirection: 'auto', contentDirection: 'auto' } } })); } catch (e) { } }, [locale]);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/?surface=library`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', null, { timeout: 45000 });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const bp = window.CEPBlueprint, st = bp?.state;
    const tree = [...document.querySelectorAll('#structureTree .treeitem')].map(e => ({ id: e.dataset.treeId, ku: e.dataset.ku || null, lvl: e.getAttribute('aria-level'), sel: e.getAttribute('aria-selected'), cur: e.hasAttribute('aria-current'), expanded: e.getAttribute('aria-expanded'), txt: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 70) }));
    const ar = new Set(['البنية','السياق','السجل والمقارنة','قرا/تحرير','حفظ','إخفاء السايد','إظهار السايد']);
    const visibleArabic = [];
    document.querySelectorAll('#leftPane *,#rightPane *,#bottomShelf *,.toolbar *,#topBanner *').forEach(e => {
      if (e.children.length) return;
      const t = (e.textContent || '').trim();
      if (!t || t.length > 40) return;
      if (/[؀-ۿ]/.test(t) && /[A-Za-z]/.test(t) === false) visibleArabic.push(t);
    });
    return {
      locale: document.documentElement.lang, dir: document.documentElement.dir,
      hasBlueprint: !!bp, hasState: !!st,
      expanded: st ? [...st.structure.expanded] : null,
      filters: st ? st.structure.filters : null,
      activeKu: st ? st.route.activeKu : null,
      treeItems: tree,
      fixtureKeys: Object.keys(window.CEPFoundation?.fixtures?.FIXTURES || {}),
      prefsLocale: st ? st.preferences.theme : null,
      arabicOnlyLeaves: [...new Set(visibleArabic)].slice(0, 60)
    };
  });
  console.log(JSON.stringify({ errs, ...out }, null, 2));
  await ctx.close();
} finally { await browser.close(); server.kill('SIGTERM'); }
