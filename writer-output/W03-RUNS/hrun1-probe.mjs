/**
 * H-RUN-1 live-route architecture gate probe (Controller-owned evidence).
 * Gate: m0-controller-composition.ts must actually mount composeRunsSurface + renderRunsSurface
 * on the real ?surface=runs coordinator route (candidate/in-page mounts do not count).
 *
 * Usage: PLAYWRIGHT_BROWSERS_PATH=<browsers> node writer-output/W03-RUNS/hrun1-probe.mjs
 * Evidence: writer-output/W03-RUNS/evidence/hrun1-*.json + hrun1-*.png (hash-bound).
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const outDir = path.join(root, 'writer-output/W03-RUNS/evidence');
await mkdir(outDir, { recursive: true });

const commit = execSync('git rev-parse HEAD', { cwd: root }).toString().trim();
const dirty = execSync('git status --porcelain -- stack/native-typescript/surfaces/m0-controller-composition.ts stack/native-typescript/surfaces/runs', { cwd: root }).toString().trim();
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

const webPort = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(webPort)], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
const waitUp = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch {} await new Promise(r => setTimeout(r, 100)); } return false; };
if (!(await waitUp(`http://127.0.0.1:${webPort}/`))) { console.error(JSON.stringify({ SERVER_START_FAILED: true })); process.exit(2); }

const browser = await chromium.launch();
const result = { gate: 'H-RUN-1', unit: 'W03-RUNS', surface: 'runs', candidate: { commit, dirtyFiles: dirty ? dirty.split('\n') : [] }, environment: { node: process.version, web: `http://127.0.0.1:${webPort}/` }, checks: {}, captures: [], errors: [] };

try {
  for (const [locale, dir] of [['en', 'ltr'], ['ar', 'rtl']]) {
    const page = await browser.newPage({ viewport: { width: 1505, height: 1045 } });
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(`http://127.0.0.1:${webPort}/?surface=runs`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    if (locale === 'ar') { await page.evaluate(() => { CEPFoundation.preferences.set('locale', 'ar', 'global'); CEPFoundation.workspace.applyPreferences(); }); await page.waitForTimeout(600); }

    const state = await page.evaluate(() => {
      const stage = document.querySelector('#foundationStage');
      return {
        consumer: window.CEPFoundation?.consumer,
        stageM0Composition: stage?.dataset?.m0Composition || null,
        runsRoot: !!document.querySelector('[data-runs-root]'),
        runsWorkspace: !!document.querySelector('.runs-workspace'),
        runsTabs: document.querySelectorAll('[data-runs-tab]').length,
        runsTerminal: !!document.querySelector('[data-runs-terminal]'),
        runsFacts: document.querySelectorAll('.runs-fact').length,
        lang: document.documentElement.lang, dir: document.documentElement.dir,
        overflow: (() => { const d = document.documentElement; return d.scrollWidth === d.clientWidth ? 'NONE' : `HORIZONTAL_${d.scrollWidth}>${d.clientWidth}`; })()
      };
    });
    const shot = path.join(outDir, `hrun1-${locale}-${dir}-${stamp}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    const sha = createHash('sha256').update(readFileSync(shot)).digest('hex');
    result.captures.push({ name: `hrun1-${locale}-${dir}`, path: path.relative(root, shot), sha256: sha, viewport: '1505x1045', lang: locale, dir });
    if (locale === 'en') result.checks = {
      'route-consumer-runs': state.consumer === 'runs',
      'stage-m0-composition-runs': state.stageM0Composition === 'runs',
      'render-runs-surface-mounted (data-runs-root)': state.runsRoot,
      'runs-workspace-rendered': state.runsWorkspace,
      'runs-tabs-rendered': state.runsTabs > 0,
      'runs-terminal-slot-rendered': state.runsTerminal,
      'no-horizontal-overflow': state.overflow === 'NONE'
    };
    else result.checks['ar-rtl-mount'] = state.runsRoot && state.dir === 'rtl';
    result.errors.push(...pageErrors.map(e => ({ locale, error: e })));
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}

result.verdict = Object.values(result.checks).every(Boolean) && result.errors.length === 0 ? 'HRUN1_PASS__LIVE_ROUTE_MOUNT_PROVEN' : 'HRUN1_FAIL';
await writeFile(path.join(outDir, `hrun1-probe-${stamp}.json`), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
