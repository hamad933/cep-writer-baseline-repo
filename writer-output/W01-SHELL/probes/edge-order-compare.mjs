/** SH-1 probe: compare model edge order between the RelationInteraction-bound SpatialView (spatial-1) and the live enterprise canvas (spatial-3). */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43193);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
await page.goto(`${base}/?surface=enterprise`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise');
const out = await page.evaluate(() => ({
  relationUiEdges: CEPFoundation.relationUI.spatial.model.edges.map(e => e.id),
  publishedEdges: CEPFoundation.spatial.model.edges.map(e => e.id),
  domEdges: [...document.querySelectorAll('.spatial-canvas [data-edge]')].map(g => g.dataset.edge),
  relationUiNodes: CEPFoundation.relationUI.spatial.model.nodes.map(n => `${n.id}@${n.x},${n.y}`),
  publishedNodes: CEPFoundation.spatial.model.nodes.map(n => `${n.id}@${n.x},${n.y}`),
  sameModel: CEPFoundation.relationUI.spatial.model === CEPFoundation.spatial.model,
  firstGroup: (() => { const g = document.querySelector('.spatial-canvas [data-edge]'); if (!g) return null; const ls = [...g.querySelectorAll('line')].map(l => { const r = l.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; }); return { id: g.dataset.edge, lines: ls }; })()
}));
console.log(JSON.stringify(out, null, 2));
await browser.close();
server.kill();
