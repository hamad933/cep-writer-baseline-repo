import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;
const root = fileURLToPath(new URL('../../', import.meta.url));
const locale = process.argv[2] || 'en';
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
    const info = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), dir: cs.direction, ta: cs.textAlign, disp: cs.display, txt: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) }; };
    const mast = document.getElementById('libraryDocumentMasthead');
    const footer = document.querySelector('#leftPane .structure-footer');
    const row = document.querySelector('#structureTree .treeitem[aria-selected="true"]') || document.querySelector('#structureTree .treeitem');
    const badge = row ? row.querySelector('.count, .treecount, [class*=count]') : null;
    return {
      lang: document.documentElement.lang, dir: document.documentElement.dir,
      bodyDir: getComputedStyle(document.body).direction,
      mast: info('#libraryDocumentMasthead'),
      mastMeta: info('.lib-mast-meta'),
      mastFirstPair: info('.lib-mast-meta > span'),
      k: info('.lib-mast-meta .k'),
      v: info('.lib-mast-meta .v'),
      editorDocument: info('#editorDocument'),
      blockList: info('#blockList'),
      contentGroups: info('#contentGroups'),
      footer: info('#leftPane .structure-footer'),
      corpus: info('.lib-corpus'),
      corpusHTML: footer?.querySelector('.lib-corpus')?.outerHTML?.slice(0, 300) || null,
      rowHTML: row ? row.outerHTML.slice(0, 700) : null,
      badgeHTML: badge ? badge.outerHTML.slice(0, 300) : null,
      badgeClass: badge ? badge.className : null,
      presentation: (window.CEPFoundation && window.__pres) || null
    };
  });
  console.log(JSON.stringify({ errs, ...out }, null, 1));
  await ctx.close();
} finally { await browser.close(); server.kill('SIGTERM'); }
