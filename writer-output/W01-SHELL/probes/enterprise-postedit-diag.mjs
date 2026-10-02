/** SH-1: why is the enterprise canvas missing/detached after the unification edit? */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43221);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });

await page.goto(`${base}/?surface=enterprise`, { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise', null, { timeout: 20000 });
await page.waitForTimeout(800);

const out = await page.evaluate(() => {
  const stage = document.querySelector('#foundationStage');
  const placeholder = document.querySelector('[data-enterprise-spatial]');
  const spatial = CEPFoundation.spatial;
  return {
    pageErrors: [],
    stagePresent: !!stage,
    stageChildren: stage ? [...stage.children].map(c => `${c.tagName}.${String(c.className).slice(0, 40)}`) : null,
    stageInnerStart: stage ? stage.innerHTML.slice(0, 240) : null,
    studioPresent: Boolean(stage?.querySelector('.enterprise-studio')),
    placeholderPresent: !!placeholder,
    liveSpatialCanvasCount: document.querySelectorAll('.spatial-canvas').length,
    publishedInstance: spatial?.instanceId ?? null,
    relationUiInstance: CEPFoundation.relationUI?.spatial?.instanceId ?? null,
    shares: CEPFoundation.relationUI?.spatial === spatial,
    publishedHostConnected: spatial?.host?.isConnected ?? null,
    publishedHostInStage: spatial?.host ? Boolean(stage?.contains(spatial.host)) : null,
    publishedHostParent: spatial?.host?.parentElement ? `${spatial.host.parentElement.tagName}.${String(spatial.host.parentElement.className)}` : null,
    hostAttrs: spatial?.host ? [...spatial.host.attributes].map(a => `${a.name}=${a.value}`) : null,
    selection: spatial?.selectionDescriptor?.()?.selectionCount ?? null
  };
});
out.pageErrors = pageErrors;
out.consoleErrors = consoleErrors;
console.log(JSON.stringify(out, null, 2));
await browser.close();
server.kill();
