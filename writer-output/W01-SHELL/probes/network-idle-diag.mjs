/** SH-1: why does networkidle never settle? count requests + page errors after load. */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../../../', import.meta.url);
const port = Number(process.env.SH1_PROBE_PORT || 43211);
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 980 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const requests = [];
const errors = [];
const console_ = [];
page.on('request', r => requests.push(r.url()));
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console_.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
const surface = process.argv[2] || 'golden';
await page.goto(`${base}/?surface=${surface}`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => errors.push('goto: ' + e.message));
await page.waitForTimeout(4000);
const unique = [...new Set(requests.map(u => u.replace(/\?.*$/, '')))];
const counts = {};
for (const u of requests) { const k = u.replace(/\?.*$/, ''); counts[k] = (counts[k] || 0) + 1; }
const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
const state = await page.evaluate(() => ({ consumer: window.CEPFoundation?.consumer ?? null, ready: !!window.CEPFoundation })).catch(e => ({ evalError: String(e) }));
console.log(JSON.stringify({ surface, totalRequests: requests.length, uniqueCount: unique.length, top, state, errors: errors.slice(0, 10), console: console_.slice(0, 10) }, null, 2));
await browser.close();
server.kill();
