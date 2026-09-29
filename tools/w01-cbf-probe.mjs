/**
 * W01 CBF-002 diagnostic probe (residual round).
 *
 * Reproduces the `back-forward-semantic-context` route and measures WHERE the restore
 * side loses the Today semantic context. Read-only against product code: it only
 * observes and records. Output: writer-output/W01/CBF002_PROBE.json
 *
 * Usage: node tools/w01-cbf-probe.mjs
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const playwright = require('playwright');
const { chromium } = playwright;

const root = fileURLToPath(new URL('../', import.meta.url));
const outDir = path.join(root, 'writer-output/W01');
const probePath = path.join(outDir, 'CBF002_PROBE.json');

const freePort = await new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const port = freePort;
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', c => { serverLog += String(c); });
server.stderr.on('data', c => { serverLog += String(c); });

const observations = [];
const record = (phase, value) => { observations.push({ phase, at: new Date().toISOString(), value }); console.log(phase, JSON.stringify(value)); };

let browser = null;
try {
  let up = false;
  for (let i = 0; i < 100; i += 1) { try { if ((await fetch(`http://127.0.0.1:${port}/`)).ok) { up = true; break; } } catch {} await new Promise(r => setTimeout(r, 100)); }
  if (!up) throw Error(`PROOF_SERVER_DID_NOT_START: ${serverLog}`);
  browser = await chromium.launch({ headless: true, ...(process.env.CEP_BROWSER_EXECUTABLE ? { executablePath: process.env.CEP_BROWSER_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => record('pageerror', String(e)));

  const snapshot = phase => page.evaluate(p => {
    const nav = window.CEPFoundation?.shellNavigation;
    const btn = document.querySelector('.today-filter[data-filter="ATTENTION"]');
    const cmd = CEPFoundation.registry.commands.get('today.filter');
    return {
      phase: p,
      consumer: window.CEPFoundation?.consumer,
      search: location.search,
      domPressed: btn ? btn.getAttribute('aria-pressed') : null,
      domFilters: [...document.querySelectorAll('.today-filter[data-today-action="filter"]')].map(b => `${b.dataset.filter}:${b.getAttribute('aria-pressed')}`).join(','),
      stageComposition: document.querySelector('#foundationStage')?.dataset.m0Composition ?? null,
      leftFilterSummary: (document.querySelector('#leftPane')?.innerText || '').match(/Filter · [^\n]*/)?.[0] ?? null,
      adapterFilterViaM0: window.CEPFoundation?.m0Composition?.adapter?.filter ?? null,
      adapterFilterViaBinding: window.CEPFoundation?.m0Composition?.binding?.adapter?.filter ?? null,
      todayFilterCommandOwner: cmd?.owner ?? null,
      restoreStatus: document.querySelector('.foundation-shell')?.dataset.contextRestoreStatus ?? null,
      contextRestored: document.querySelector('.foundation-shell')?.dataset.contextRestored ?? null,
      captureProviderRegistered: nav?.contextProviders ? [...nav.contextProviders.keys()] : null,
      todayReceipts: CEPFoundation.registry.receipts.filter(r => r.id === 'today.filter').map(r => ({ seq: r.sequence, route: r.route }))
    };
  }, phase);

  // instrument: wrap restoreBookmark to observe whether/what it restores
  await page.addInitScript(() => {
    window.__cbf = { restoreBookmarkCalls: [], restoreBookmarkResults: [], popstate: 0 };
    const install = () => {
      const nav = window.CEPFoundation?.shellNavigation;
      if (!nav || nav.__cbfWrapped) return false;
      nav.__cbfWrapped = true;
      const original = nav.restoreBookmark.bind(nav);
      nav.restoreBookmark = async bookmark => {
        const before = { surface: bookmark.surface, surfaceContext: bookmark.surfaceContext || null, filterButtonFound: !!document.querySelector('[data-filter="' + (bookmark.surfaceContext?.todayFilter || '') + '"]') };
        window.__cbf.restoreBookmarkCalls.push(before);
        const result = await original(bookmark);
        window.__cbf.restoreBookmarkResults.push({ surface: bookmark.surface, result, domAfter: (() => { const b = document.querySelector('.today-filter[data-filter="ATTENTION"]'); return b ? b.getAttribute('aria-pressed') : null; })(), filterButtonFound: before.filterButtonFound });
        return result;
      };
      return true;
    };
    const timer = setInterval(() => { if (install()) clearInterval(timer); }, 5);
    window.addEventListener('popstate', () => { window.__cbf.popstate += 1; });
  });

  await page.goto(`http://127.0.0.1:${port}/?surface=shell`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'shell', null, { timeout: 20000 });
  record('01-initial-shell', await snapshot('01-initial-shell'));

  await page.locator('.global-shell-destinations [data-shell-area="W01"]').first().click();
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', null, { timeout: 20000 });
  await page.waitForSelector('.today-filter[data-filter="ATTENTION"]', { timeout: 20000 });
  await page.waitForTimeout(300);
  record('02-first-today-arrival', await snapshot('02-first-today-arrival'));

  await page.locator('.today-filter[data-filter="ATTENTION"]').first().click();
  await page.waitForTimeout(400);
  record('03-after-attention-click', await snapshot('03-after-attention-click'));

  await page.locator('[data-shell-history="back"]').first().click();
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'shell', null, { timeout: 20000 });
  await page.waitForTimeout(400);
  record('04-after-back', await snapshot('04-after-back'));

  await page.locator('[data-shell-history="forward"]').first().click();
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', null, { timeout: 20000 });
  await page.waitForSelector('.today-filter[data-filter="ATTENTION"]', { timeout: 20000 });
  await page.waitForTimeout(1200);
  record('05-after-forward-restore', await snapshot('05-after-forward-restore'));

  // manual user click on ATTENTION after the forward restore: does the DOM move?
  await page.locator('.today-filter[data-filter="ATTENTION"]').first().click();
  await page.waitForTimeout(400);
  record('06-after-manual-attention-click', await snapshot('06-after-manual-attention-click'));

  // direct semantic command execution
  const direct = await page.evaluate(() => {
    const before = CEPFoundation.registry.receipts.filter(r => r.id === 'today.filter').length;
    const result = CEPFoundation.registry.execute('today.filter', { value: 'ATTENTION', route: 'probe' });
    const btn = document.querySelector('.today-filter[data-filter="ATTENTION"]');
    return { result: { ok: result?.ok, filter: result?.filter }, domPressed: btn?.getAttribute('aria-pressed') ?? null, m0AdapterFilter: CEPFoundation.m0Composition?.adapter?.filter ?? null, receiptsAdded: CEPFoundation.registry.receipts.filter(r => r.id === 'today.filter').length - before };
  });
  record('07-direct-today.filter-command', direct);

  record('08-instrumentation', await page.evaluate(() => window.__cbf));

  await context.close();
} catch (error) {
  record('probe-error', { message: String(error?.message || error), stack: String(error?.stack || '') });
} finally {
  try { if (browser) await browser.close(); } catch {}
  server.kill('SIGTERM');
}

await mkdir(outDir, { recursive: true });
await writeFile(probePath, JSON.stringify({ schemaVersion: 1, workspace: 'W01', probe: 'w01-cbf-probe.mjs', capturedAt: new Date().toISOString(), observations }, null, 2) + '\n');
console.log(`probe written: writer-output/W01/CBF002_PROBE.json (${observations.length} observations)`);
