/**
 * ENT-1 re-dispatch #2 — shared-root hotspot probes for D-04 and D-08.
 *
 * These two D-ledger items have genuine residuals at SHARED roots that ENT-1 may not write.
 * This script measures the residual READ-ONLY so the finding is evidence, not opinion:
 *   D-04 — `foundation/spatial/presentation.ts renderSpatialNode` renders idChip (x=31,y=21)
 *          and statusChip (anchor x=119,y=21) on one baseline with no collision handling.
 *   D-08 — `foundation/extensions.css` pins `.spatial-readout{left:14px}` +
 *          `.foundation-stage .spatial-readout{direction:ltr}` and `.spatial-legend{left:20px}` /
 *          `.minimap{right:12px}` — physical sides that never mirror in RTL.
 *
 * Nothing here writes source, geometry, adapters or fixtures.
 * Usage: node writer-output/W03-ENTERPRISE/shared-hotspot-probes.mjs
 * Writes: writer-output/W03-ENTERPRISE/evidence/shared-hotspot-probes.json
 */
import {spawn} from 'node:child_process';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const outFile = path.join(root, 'writer-output/W03-ENTERPRISE/evidence/shared-hotspot-probes.json');

const sha = async p => createHash('sha256').update(await readFile(p)).digest('hex');
const freePort = () => new Promise(res => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
});

/* ---------------------------------------------------------------- D-04 (node level) */
const D04 = async () => {
  const modPath = path.join(root, 'dist/foundation/spatial/presentation.js');
  const mod = await import(`file://${modPath}`);
  const render = mod.renderSpatialNode;
  if (typeof render !== 'function') return {available: false, reason: 'renderSpatialNode not exported from dist build'};

  // Exact condition recorded by the rescue: 0 < len(status) <= 22 makes showStatusChip true.
  const cases = [
    {id: 'enterprise-consumer-mitigated', node: {id: 'APP-WEB-01', label: 'Web Application', status: '', subtitle: 'Type: Application', x: 0, y: 0}},
    {id: 'shared-root-repro-long-status', node: {id: 'APP-WEB-01', label: 'Web Application', status: 'Type: Web Application', x: 0, y: 0}},
    {id: 'shared-root-repro-22-chars', node: {id: 'CTL-WAF-01', label: 'Web Application Firewall', status: 'Security Control Device', x: 0, y: 0}},
    {id: 'shared-root-over-22-chars', node: {id: 'SIM-ATK-01', label: 'Attacker Workstation', status: 'Type: Simulation Local Device', x: 0, y: 0}}
  ];
  const out = [];
  for (const c of cases) {
    const html = render({node: c.node});
    const idM = html.match(/class="node-id-chip" x="(\d+)" y="(\d+)"/);
    const stM = html.match(/<g class="node-status-chip"/);
    const stText = html.match(/node-status-chip" data-status="([^"]*)"><circle[^>]*><text x="(\d+)" y="(\d+)"/);
    const secondary = html.match(/class="node-secondary-line" x="(\d+)" y="(\d+)"/);
    const status = String(c.node.status || '');
    out.push({
      case: c.id,
      statusLen: status.length,
      showStatusChipExpected: status.length > 0 && status.length <= 22,
      statusChipRendered: !!stM,
      idChip: idM ? {x: +idM[1], y: +idM[2]} : null,
      statusChipText: stText ? {x: +stText[2], y: +stText[3], text: stText[1]} : null,
      secondaryLine: secondary ? {x: +secondary[1], y: +secondary[2]} : null,
      sameBaseline: idM && stText ? +idM[2] === +stText[3] : null,
      note: 'both chips on one baseline at y=21; no offset/truncate/collision handling exists in this function'
    });
  }
  return {
    available: true,
    sharedFile: 'stack/native-typescript/foundation/spatial/presentation.ts',
    sharedFileSha256: await sha(path.join(root, 'stack/native-typescript/foundation/spatial/presentation.ts')),
    distFileSha256: await sha(modPath),
    cases: out,
    verdict: 'RESIDUAL_AT_SHARED_ROOT — any spatial consumer passing a status of length 1..22 still gets a status chip on the id-chip baseline; ENTERPRISE mitigates by passing status:"" + subtitle'
  };
};

/* ---------------------------------------------------------------- D-08 (page level, other consumers) */
const D08 = async (browser, port) => {
  const rows = [];
  for (const surface of ['enterprise', 'visualize', 'labs', 'runs']) {
    const ctx = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce', deviceScaleFactor: 1, locale: 'ar'});
    await ctx.addInitScript(() => {
      try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: 'ar', chromeDirection: 'rtl'}}})); } catch {}
    });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e.message)));
    try {
      await page.goto(`http://127.0.0.1:${port}/?surface=${surface}`, {waitUntil: 'networkidle'});
      await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, {timeout: 30000});
      await page.waitForTimeout(600);
      const probe = await page.evaluate(() => {
        const q = s => document.querySelector(s);
        const qa = s => [...document.querySelectorAll(s)];
        const box = n => { if (!n) return null; const r = n.getBoundingClientRect(); return {x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1)}; };
        const overlap = (a, b) => !!a && !!b && Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1;
        const readout = q('.spatial-readout'), legend = q('.spatial-legend') || q('.ent-legend'), minimap = q('.minimap');
        const cs = readout ? getComputedStyle(readout) : null;
        // which stylesheet rule wins for the readout
        let winning = null;
        for (const ss of [...document.styleSheets]) {
          try {
            for (const r of [...ss.cssRules]) if (r.selectorText && readout && readout.matches(r.selectorText) && r.style && (r.style.left || r.style.right || r.style.direction)) winning = (winning || '') + ` | ${r.selectorText}{${r.style.cssText.slice(0, 120)}}`;
          } catch {}
        }
        return {
          docDir: document.documentElement.dir,
          canvases: qa('svg.spatial-canvas').length,
          readout: box(readout),
          readoutDirection: cs ? cs.direction : null,
          readoutLeft: cs ? cs.left : null,
          readoutRight: cs ? cs.right : null,
          readoutInlineStart: cs ? cs.insetInlineStart : null,
          readoutInlineEnd: cs ? cs.insetInlineEnd : null,
          legend: box(legend),
          minimap: box(minimap),
          legendReadoutOverlap: overlap(box(legend), box(readout)),
          legendMinimapOverlap: overlap(box(legend), box(minimap)),
          readoutMinimapOverlap: overlap(box(readout), box(minimap)),
          winningRules: winning,
          surfaceOwnsCanvas: !!q('.ent-canvas') || !!q('[data-surface-canvas]') || !!q('[class*="-canvas"]')
        };
      });
      rows.push({surface, ok: true, pageErrors, probe});
    } catch (e) {
      rows.push({surface, ok: false, pageErrors, error: String(e.message).slice(0, 300)});
    }
    await ctx.close();
  }
  return {
    sharedFiles: [
      {file: 'stack/native-typescript/foundation/extensions.css', sha256: await sha(path.join(root, 'stack/native-typescript/foundation/extensions.css')),
       markers: ['.spatial-readout{position:absolute;bottom:10px;left:14px;pointer-events:none', '.foundation-stage .spatial-readout{direction:ltr;unicode-bidi:isolate}', '.spatial-legend{position:absolute;top:55px;left:20px', '.minimap{position:absolute;bottom:32px;right:12px']},
      {file: 'stack/native-typescript/foundation/spatial/presentation.ts', sha256: await sha(path.join(root, 'stack/native-typescript/foundation/spatial/presentation.ts')),
       markers: ['<div class="spatial-readout" aria-live="polite"', '<svg class="minimap" aria-label="Map overview"']}
    ],
    rows
  };
};

const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: 'ignore'});
const browser = await chromium.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none']});
const git = (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root}).toString().trim(); } catch { return 'unknown'; } })();
const tree = (() => { try { return execFileSync('git', ['rev-parse', 'HEAD^{tree}'], {cwd: root}).toString().trim(); } catch { return 'unknown'; } })();
let d04, d08;
try {
  d04 = await D04();
  d08 = await D08(browser, port);
} finally {
  await browser.close();
  server.kill();
}
const out = {schemaVersion: 1, unit: 'W03-ENTERPRISE', purpose: 'D-04 / D-08 shared-root hotspot evidence (read-only measurement)', commit: git, tree, capturedAt: new Date().toISOString(), D04: d04, D08: d08};
await writeFile(outFile, JSON.stringify(out, null, 2));
console.log(`wrote ${path.relative(root, outFile)}`);
console.log('D04:', JSON.stringify(d04.cases || d04, null, 1).slice(0, 1400));
for (const r of d08.rows || []) console.log(`D08 ${r.surface}: ok=${r.ok} docDir=${r.probe?.docDir} readoutL=${r.probe?.readoutLeft} dir=${r.probe?.readoutDirection} legendROoverlap=${r.probe?.legendReadoutOverlap} legendMM=${r.probe?.legendMinimapOverlap} err=${r.error || ''}`);
