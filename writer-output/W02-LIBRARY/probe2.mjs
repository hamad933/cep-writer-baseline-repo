import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;
const root = fileURLToPath(new URL('../../', import.meta.url));
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const wait = async (u) => { for (let i = 0; i < 150; i++) { try { if ((await fetch(u)).ok) return true; } catch { } await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);
const browser = await chromium.launch({ headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1505, height: 1045 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=library`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', null, { timeout: 45000 });
  await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const info = sel => {
      const e = document.querySelector(sel); if (!e) return null;
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return { sel, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, hidden: e.hidden, text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90) };
    };
    return {
      nodes: ['.docmeta', '.docintro', '#documentTitle', '.doclead', '#contentGroups', '#contentGroupToggle', '#contentGroupBody', '#blockList', '.pane-toggle-row', '#leftPane .phead', '#leftPane .phead h2', '.tree-scroll', '.left-footer', '#structureActivePath', '.library-smartviews', '.searchmeta'].map(info),
      leftHeadHTML: document.querySelector('#leftPane .phead')?.outerHTML.slice(0, 400),
      treeScrollClass: document.querySelector('.tree-scroll')?.className,
      firstTreeRow: document.querySelector('#structureTree .treeitem')?.outerHTML.slice(0, 600),
      docIntroHTML: document.querySelector('.docintro')?.outerHTML.slice(0, 400)
    };
  });
  console.log(JSON.stringify(out, null, 1));
  await ctx.close();
} finally { await browser.close(); server.kill('SIGTERM'); }
