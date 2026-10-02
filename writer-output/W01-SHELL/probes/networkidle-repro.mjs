/** SH-1: reproduce networkidle timeout against MY server and report in-flight requests. */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43213);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const events = [];
page.on('request', r => events.push({ t: Date.now(), kind: 'req', url: r.url() }));
page.on('requestfinished', r => events.push({ t: Date.now(), kind: 'done', url: r.url() }));
page.on('requestfailed', r => events.push({ t: Date.now(), kind: 'fail', url: r.url(), err: String(r.failure()?.errorText) }));
page.on('response', r => { if (r.status() >= 400) events.push({ t: Date.now(), kind: 'resp', status: r.status(), url: r.url() }); });
const surface = process.argv[2] || 'golden';
let result;
try {
  await page.goto(`${base}/?surface=${surface}`, { waitUntil: 'networkidle', timeout: 25000 });
  result = 'networkidle OK';
} catch (e) {
  result = 'TIMEOUT: ' + String(e.message).split('\n')[0];
}
const start = events[0]?.t ?? Date.now();
const tail = events.slice(-15).map(e => ({ ...e, ms: e.t - start }));
console.log(JSON.stringify({ surface, result, eventCount: events.length, tail }, null, 2));
await browser.close();
server.kill();
