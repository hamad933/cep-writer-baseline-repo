/**
 * PRC-1 render probe — live proof that the F1/F2 fixes hold in the rendered product,
 * plus responsive/narrow capture at 1440x1000 and 1024x900 (RTL active locale).
 * Runs from an isolated mirror of the exact candidate worktree; writes captures into
 * writer-output/W05-PROCESSING/evidence/render/ (lane-owned).
 */
import { spawn } from 'node:child_process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'writer-output/W05-PROCESSING/evidence/render');
await mkdir(outDir, { recursive: true });

const freePort = () => new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
const port = await freePort(), runtimePort = await freePort();
const workRoot = path.join(root, 'writer-output/W05-PROCESSING/.render-proof');
await mkdir(workRoot, { recursive: true });

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: { ...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: path.join(workRoot, 'render.sqlite'), CEP_STAGING_ROOT: path.join(workRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(workRoot, 'root') },
  stdio: ['ignore', 'pipe', 'pipe']
});
let runtimeLog = ''; runtime.stdout.on('data', c => { runtimeLog += String(c); }); runtime.stderr.on('data', c => { runtimeLog += String(c); });

const wait = async url => { for (let i = 0; i < 150; i += 1) { try { if ((await fetch(url)).ok) return true; } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); } return false; };
const browser = await chromium.launch({ headless: true });
const probe = { schemaVersion: 1, probe: 'PRC1_RENDER_PROBE', viewports: [], dom: null, captures: [] };
try {
  const up = await wait(`http://127.0.0.1:${port}/`), rtUp = await wait(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
  if (!up || !rtUp) throw Error(`servers did not start up=${up} runtime=${rtUp} log=${runtimeLog.slice(-400)}`);

  /* seed one completed + one cancel-requested job so the workbench is populated */
  const post = async (p, body) => (await fetch(`http://127.0.0.1:${runtimePort}${p}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })).json();
  const created = await post('/v1/processing/jobs', { requestId: `prc1-render-${Date.now()}`, taskKind: 'SHA256_JSON', input: { kind: 'render-proof', text: 'render' } });
  await post('/v1/processing/worker/run-once', { workerId: 'prc1-render-worker' });
  const second = await post('/v1/processing/jobs', { requestId: `prc1-render-b-${Date.now()}`, input: { kind: 'render-cancel' } });
  await post(`/v1/processing/jobs/${encodeURIComponent(second.job?.jobId || '')}/cancel-request`, { requestId: `prc1-cancel-${Date.now()}` });

  for (const [label, viewport] of [['1440x1000', { width: 1440, height: 1000 }], ['1024x900', { width: 1024, height: 900 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/?surface=processing&persistencePort=${runtimePort}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.CEPFoundation?.consumer === 'processing', undefined, { timeout: 30000 });
    await page.waitForFunction(() => (window.CEPFoundation?.m0Composition?.group?.surfaces?.processing?.snapshot()?.jobs || []).length >= 1, undefined, { timeout: 30000 });
    await page.waitForTimeout(700);

    const dom = await page.evaluate(() => {
      const h1 = document.querySelector('[data-w05-surface="processing"] .p-head h1');
      const head = document.querySelector('[data-w05-surface="processing"] .p-head');
      const eyebrow = document.querySelector('[data-w05-surface="processing"] .m0-eyebrow');
      const stageHead = document.querySelector('.m0-controller-stage')?.firstElementChild;
      const cs = h1 ? getComputedStyle(h1) : null, hs = head ? getComputedStyle(head) : null;
      const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const eb = box(eyebrow);
      const intersects = (a, b) => Boolean(a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h);
      /* F2: no unscoped [data-tone] rule may exist in any stylesheet */
      let globalToneRules = [];
      for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const rule of rules) if (rule.selectorText && /^\[data-tone/.test(rule.selectorText)) globalToneRules.push(rule.selectorText);
      }
      return {
        h1Exists: Boolean(h1),
        h1Display: cs?.display || null,
        h1FontSize: cs?.fontSize || null,
        h1MarginTop: cs?.marginTop || null,
        headMarginBlockStart: hs?.marginBlockStart || hs?.marginTop || null,
        eyebrowBox: eb,
        stageHeadBox: box(stageHead),
        eyebrowOverlapsStageHeader: intersects(eb, box(stageHead)),
        globalToneRuleCount: globalToneRules.length,
        globalToneRules,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        hasLeftRegion: Boolean(document.querySelector('.p-nav')),
        hasRightRegion: Boolean(document.querySelector('.p-ctx')),
        hasBottomRegion: Boolean(document.querySelector('.p-bottom')),
        toolbarCommands: [...document.querySelectorAll('[data-foundation-command]')].map(n => n.dataset.foundationCommand).filter(id => id.startsWith('processing.'))
      };
    });
    if (label === '1440x1000') probe.dom = dom;
    const file = path.join(outDir, `processing-${label}-active-shell.png`);
    await page.screenshot({ path: file, fullPage: false });
    const bytes = await readFile(file);
    probe.captures.push({ label, viewport, file: path.relative(root, file), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, lang: dom.lang, dir: dom.dir });

    if (label === '1440x1000') {
      /* direction test: flip the shell direction only (surface structure must mirror,
         keep bdi/technical tokens LTR, and never overlap). NOT a Settings-driven locale test. */
      const rtl = await page.evaluate(() => {
        const root = document.documentElement;
        /* mirror the shared language policy exactly: html[dir] + body[data-foundation-direction] */
        root.dir = 'rtl';
        document.body.setAttribute('data-foundation-direction', 'rtl');
        const head = document.querySelector('[data-w05-surface="processing"]');
        const stage = document.querySelector('.m0-controller-stage');
        const bd = [...document.querySelectorAll('[data-w05-surface="processing"] bdi')];
        const overlaps = (a, b) => Boolean(a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h);
        const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
        const visible = [...document.querySelectorAll('[data-w05-surface="processing"] *')].filter(el => el.offsetParent !== null && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0);
        let overflow = 0;
        for (const el of visible) { const r = el.getBoundingClientRect(); if (r.right > window.innerWidth + 2 || r.left < -2) overflow += 1; }
        const chain = [];
        let node = head;
        while (node && node !== document.documentElement) { chain.push({ tag: node.tagName.toLowerCase(), cls: String(node.className || '').slice(0, 48), direction: getComputedStyle(node).direction }); node = node.parentElement; }
        return {
          dir: root.dir,
          bodyDirectionAttribute: document.body.getAttribute('data-foundation-direction'),
          surfaceDirection: getComputedStyle(head || document.body).direction,
          ancestorDirectionChain: chain,
          bdiCount: bd.length,
          bdiStillLtr: bd.every(b => b.getAttribute('dir') === 'ltr'),
          overflowingElements: overflow,
          eyebrowStageOverlap: overlaps(box(document.querySelector('[data-w05-surface="processing"] .m0-eyebrow')), box(stage?.firstElementChild))
        };
      });
      const rtlFile = path.join(outDir, `processing-${label}-dir-rtl.png`);
      await page.screenshot({ path: rtlFile, fullPage: false });
      const rtlBytes = await readFile(rtlFile);
      probe.directionTest = {
        mechanism: 'document.documentElement.dir flipped in-page (structure/direction test only; Settings-driven locale change not exercised)',
        ...rtl,
        sha256: createHash('sha256').update(rtlBytes).digest('hex'),
        file: path.relative(root, rtlFile)
      };
      probe.captures.push({ label: `${label}-dir-rtl`, viewport, file: path.relative(root, rtlFile), sha256: probe.directionTest.sha256, bytes: rtlBytes.length, lang: dom.lang, dir: 'rtl' });
      probe.viewports.push({ label: `${label}-dir-rtl`, viewport, direction: rtl });
    }
    probe.viewports.push({ label, viewport, dom });
    await context.close();
  }
} catch (error) {
  probe.error = String(error?.message || error);
} finally {
  await browser.close();
  runtime.kill('SIGTERM'); server.kill('SIGTERM');
}

probe.expectations = {
  h1Styled: probe.dom?.h1Display === 'flex',
  marginApplied: /26px/.test(String(probe.dom?.headMarginBlockStart)),
  noEyebrowOverlap: probe.dom?.eyebrowOverlapsStageHeader === false,
  noGlobalToneRules: probe.dom?.globalToneRuleCount === 0,
  directionMirrors: probe.directionTest?.surfaceDirection === 'rtl',
  bdiTokensStayLtr: probe.directionTest?.bdiStillLtr === true,
  noHorizontalOverflowInRtl: probe.directionTest?.overflowingElements === 0,
  noOverlapInRtl: probe.directionTest?.eyebrowStageOverlap === false
};
probe.allHold = Object.values(probe.expectations).every(Boolean) && !probe.error;
await writeFile(path.join(outDir, 'RENDER_PROBE.json'), JSON.stringify(probe, null, 2) + '\n');
console.log(JSON.stringify({ expectations: probe.expectations, allHold: probe.allHold, error: probe.error || null, captures: probe.captures.map(c => ({ label: c.label, sha256: c.sha256.slice(0, 16) })) }, null, 2));
if (!probe.allHold) process.exitCode = 1;
