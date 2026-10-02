#!/usr/bin/env node
/* W02-VISUALIZE D08 parity harness runner — runs tools/d08-visualize-parity-harness.html headlessly,
   reads window.D08_PARITY_PROOF, captures a screenshot into writer-output/W02-VISUALIZE/captures/
   and appends a lineage entry (same schema as capture.mjs). */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
const OUT = path.join(HERE, 'captures');
mkdirSync(OUT, { recursive: true });
const commit = execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim();
const tree = execSync('git rev-parse HEAD^{tree}', { cwd: ROOT }).toString().trim();
const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');

/* The parity harness lives under tools/ and imports ../dist/**, so it needs a repo-root static
   server (tools/serve.mjs serves dist/ only). Ephemeral execution-only server on :4180. */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  try {
    const rel = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep)) throw Error('outside root');
    const body = readFileSync(file);
    res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('Not found'); }
});
await new Promise(resolve => server.listen(4180, '127.0.0.1', resolve));

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e?.message || e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://127.0.0.1:4180/tools/d08-visualize-parity-harness.html', { waitUntil: 'load' });
await page.waitForTimeout(1200);
const proof = await page.evaluate(() => window.D08_PARITY_PROOF || null);
const name = `d08-parity-${stamp}-${commit.slice(0, 8)}`;
const file = path.join(OUT, `${name}.png`);
await page.screenshot({ path: file, fullPage: true });
await browser.close();
const bytes = readFileSync(file);
const sha256 = createHash('sha256').update(bytes).digest('hex');
const rel = `writer-output/W02-VISUALIZE/captures/${name}.png`;
const entry = {
  name: 'd08-parity',
  timestamp: new Date().toISOString(),
  url: 'http://127.0.0.1:4180/tools/d08-visualize-parity-harness.html',
  viewport: { width: 1440, height: 1000, deviceScaleFactor: 1 },
  candidate: `${branch}@${commit}`, commit, tree, branch,
  environment: 'ephemeral repo-root static server on 127.0.0.1:4180 (tools/serve.mjs serves dist/ only); Playwright chromium headless',
  seededLocale: 'n/a (static parity harness)',
  classification: 'TEST_ONLY_PRESENTATION_HARNESS__NOT_PRODUCT_PROVIDER_TRUTH',
  proof, consoleErrors: errors,
  image: { path: rel, sha256, bytes: bytes.length, dims: [1440, 1000] }
};
const lineagePath = path.join(HERE, 'LINEAGE.json');
const lineage = existsSync(lineagePath) ? JSON.parse(readFileSync(lineagePath, 'utf8')) : { entries: [] };
lineage.entries.push(entry);
writeFileSync(lineagePath, JSON.stringify(lineage, null, 2) + '\n');
server.close();
console.log(JSON.stringify({ proof, errors, image: entry.image, commit, tree }, null, 1));
