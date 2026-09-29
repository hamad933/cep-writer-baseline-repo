import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(freePort)], { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] });
let up = false;
for (let i = 0; i < 100; i += 1) { try { if ((await fetch(`http://127.0.0.1:${freePort}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
if (!up) { console.log('SERVER_DOWN'); process.exit(1); }
const browser = await chromium.launch({ headless: true });
const out = {};
for (const surface of ['reviews']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 980 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e && e.stack || e)));
  try {
    await page.goto(`http://127.0.0.1:${freePort}/?surface=${surface}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 20000 });
    await page.waitForTimeout(400);
    out[surface] = await page.evaluate(() => {
      const m = window.CEPFoundation.m0Composition;
      const stage = document.querySelector('#foundationStage');
      const rows = [...document.querySelectorAll('#foundationStage [data-collection-row], #foundationStage .collection-row, #foundationStage [data-r6-row], #foundationStage li')].slice(0, 4).map(n => ({ tag: n.tagName, cls: n.className, data: [...n.attributes].filter(a => a.name.startsWith('data-')).map(a => `${a.name}=${a.value}`) }));
      return {
        consumer: CEPFoundation.consumer,
        stageComposition: stage?.dataset.m0Composition ?? null,
        keys: m ? Object.keys(m) : null,
        domainOwner: m?.domain?.owner ?? null,
        recordCount: m?.domain?.records?.length ?? null,
        groupKeys: m?.group ? Object.keys(m.group) : null,
        stageHTML: (stage?.innerHTML || '').slice(0, 900),
        rows,
        buttons: [...document.querySelectorAll('#foundationStage button')].map(b => b.textContent.trim()).slice(0, 20),
        rowNodes: [...document.querySelectorAll('#foundationStage [class*=row]')].slice(0, 6).map(n => `${n.tagName}.${n.className}`)
      };
    });
  } catch (error) {
    out[surface] = { error: String(error?.message || error) };
  }
  out[surface].pageErrors = pageErrors;
  await ctx.close();
}
await browser.close();
server.kill('SIGTERM');
console.log(JSON.stringify(out, null, 2));
