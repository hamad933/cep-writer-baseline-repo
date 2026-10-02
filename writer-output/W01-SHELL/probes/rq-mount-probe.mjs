/** SH-1: RQ b2 mount probe — purpose-built RQ workspace composed from the composition root. */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43228);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto(`${base}/?surface=rq`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'rq', null, { timeout: 20000 });
await page.waitForTimeout(800);
const out = await page.evaluate(() => {
  const stage = document.querySelector('#foundationStage');
  return {
    stageComposition: stage?.dataset.m0Composition ?? null,
    stageRqSurface: stage?.dataset.rqSurface ?? null,
    stageClasses: stage?.className ?? null,
    firstChild: stage?.firstElementChild ? `${stage.firstElementChild.tagName}.${stage.firstElementChild.className}` : null,
    genericTypedStage: Boolean(stage?.querySelector('[data-r6-typed-surface="rq"]')),
    rqControls: stage ? stage.querySelectorAll('[data-rq-command],[data-rq-action],[data-rq-view]').length : 0,
    rqSections: stage ? [...stage.querySelectorAll('section')].slice(0, 6).map(s => String(s.className).slice(0, 40)) : [],
    toolbar: [...document.querySelectorAll('#domainToolbar [data-foundation-command]')].map(b => b.dataset.foundationCommand),
    commandRegistryHas: ['rq.search', 'rq.compare', 'rq.review', 'rq.provenance'].map(id => [id, CEPFoundation.registry.commands.has(id)]),
    bindingOwner: CEPFoundation.registry.commands.get('rq.search')?.owner ?? null,
    m0MountedBy: CEPFoundation.m0Composition?.mounted?.mountedBy ?? null,
    m0MountedOwner: CEPFoundation.m0Composition?.mounted?.owner ?? null
  };
});
out.pageErrors = pageErrors;
console.log(JSON.stringify(out, null, 2));
await browser.close();
server.kill();
