/**
 * W05 fast surface probe (dev aid, not acceptance evidence).
 *
 * Usage: node tools/w05-surface-shot.mjs <surface> [suffix] [--open-bottom]
 * Writes writer-output/W05/reaudit-evidence/_probe/<surface>-<suffix>.png
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require(path.resolve(process.env.CEP_PLAYWRIGHT_MODULE_PATH)); }
const { chromium } = playwright;

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const surface = args[0] || 'health';
const suffix = args.find(a => !a.startsWith('--')) && args[1] && !args[1].startsWith('--') ? args[1] : 'probe';
const openBottom = args.includes('--open-bottom');
const outDir = process.env.W05_PROBE_DIR || '/tmp/opencode/w05-probe';


const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort(), runtimePort = await freePort();
const workRoot = path.join(root, 'writer-output/W05/.runtime-proof');
await mkdir(outDir, { recursive: true });

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: { ...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(workRoot, 'probe.sqlite'), CEP_STAGING_ROOT: path.join(workRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(workRoot, 'root') },
  stdio: ['ignore', 'pipe', 'pipe']
});
const wait = async (url) => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch { } await new Promise(r => setTimeout(r, 100)); } return false; };
await wait(`http://127.0.0.1:${port}/`);
await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);

const browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`http://127.0.0.1:${port}/?surface=${surface}&persistencePort=${runtimePort}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 30000 });
  await page.waitForTimeout(2500);
  const scrollIdx = args.indexOf('--scroll');
  if (scrollIdx >= 0 && args[scrollIdx + 1]) {
    const px = Number(args[scrollIdx + 1]);
    await page.evaluate(y => { for (const sel of ['#foundationStage', '#centerPane .docscroll', '#centerPane']) { const d = document.querySelector(sel); if (d && d.scrollHeight > d.clientHeight) d.scrollTop = y; } }, px);
    await page.waitForTimeout(400);
  }
  if (openBottom) {
    await page.evaluate(() => {
      const shelf = document.querySelector('#bottomShelf');
      const state = CEPFoundation?.api?.state?.surface;
      if (state) state.bottomOpen = true;
      if (shelf) { shelf.dataset.state = 'open'; const c = document.querySelector('#bottomContent'); if (c) { c.inert = false; c.hidden = false; } }
    });
    await page.waitForTimeout(600);
  }
  if (args.includes('--inspect')) {
    const info = await page.evaluate(() => {
      const el = document.elementFromPoint(970, 210);
      const chain = []; let c = el; while (c && chain.length < 6) { chain.push(`${c.tagName}#${c.id||''}.${c.className&&c.className.baseVal!==undefined?c.className.baseVal:c.className||''}`); c = c.parentElement; }
      const heads = [...document.querySelectorAll('.phead')].map(h => `${h.closest('[id]').id} => ${h.textContent.trim().slice(0,60)}`);
      return { at: chain, heads };
    });
    console.log(JSON.stringify(info, null, 2));
  }
  const file = path.join(outDir, `${surface}-${suffix}.png`);
  await page.screenshot({ path: file, fullPage: args.includes('--full') });
  const bytes = await readFile(file);
  console.log(JSON.stringify({ file: path.relative(root, file), bytes: bytes.length, errors }, null, 2));
  await context.close();
} finally {
  await browser.close(); runtime.kill('SIGTERM'); server.kill('SIGTERM');
}
