// W01-TODAY populated-composition evidence capture (TEST_ONLY presentation harness).
// Evidence-only tool. Serves the repo root so the harness can import ../dist modules.
// Binds every image to: candidate + commit + viewport + timestamp + path + sha256 + dims.
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { extname, resolve, relative } from 'node:path';

const ROOT = 'writer-output/W01-TODAY/evidence';
const HARNESS = '/writer-output/W01-TODAY/harness/today-harness.html';
const PORT = Number(process.env.W01_PORT || 4199);
const REF_W = 1520, REF_H = 1034;

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
const REPO = resolve('.');

const commit = (() => { try { return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(); } catch { return 'unknown'; } })();
const dirty = (() => { try { return execSync('git status --porcelain -- stack/native-typescript/surfaces/today stack/native-typescript/adapters/today', { encoding: 'utf8' }).trim(); } catch { return '?'; } })();
const startedAt = new Date().toISOString();

async function identity(path) {
  const bytes = await readFile(path);
  return { path, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, dims: { w: bytes.readUInt32BE(16), h: bytes.readUInt32BE(20) } };
}

function serve() {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      const file = pathname === '/' ? REPO : resolve(REPO, pathname.replace(/^\/+/, ''));
      const rel = relative(REPO, file);
      if (!rel || rel.startsWith('..')) throw Error('outside');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': mime[extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('Not found'); }
  });
  return new Promise(ok => server.listen(PORT, '127.0.0.1', () => ok(server)));
}

const CROPS = {
  greeting: '.today-head',
  hero: '#todaySessionCard',
  next: '#todayRecommendationCard',
  why: '#todayWhyCard',
  recent: '#todayRecentCard',
  progress: '#todayProgressCard',
  attention: '#todayAttentionSidebar',
  provider: '#todayProviderTruth'
};

async function main() {
  const tag = process.argv[2] || 'rebuild';
  await mkdir(ROOT, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch();
  const rows = [];

  const configs = [
    { name: `${tag}-pop-ar-rtl-ref`, lang: 'ar', w: REF_W, h: REF_H },
    { name: `${tag}-pop-en-ltr-ref`, lang: 'en', w: REF_W, h: REF_H },
    { name: `${tag}-pop-ar-rtl-1280`, lang: 'ar', w: 1280, h: 900 },
    { name: `${tag}-pop-ar-rtl-1024`, lang: 'ar', w: 1024, h: 860 },
    { name: `${tag}-pop-ar-rtl-768`, lang: 'ar', w: 768, h: 900 },
    { name: `${tag}-pop-ar-rtl-480`, lang: 'ar', w: 480, h: 900 }
  ];

  for (const cfg of configs) {
    const context = await browser.newContext({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 240)); });
    page.on('pageerror', e => consoleErrors.push('pageerror: ' + String(e).slice(0, 240)));
    await page.goto(`http://127.0.0.1:${PORT}${HARNESS}?lang=${cfg.lang}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('.today-orchestration', { timeout: 15000 });
    await page.waitForTimeout(500);

    const view = `${ROOT}/${cfg.name}.png`;
    await page.screenshot({ path: view });           // viewport-matched (reference-matched) capture
    const full = `${ROOT}/${cfg.name}--full.png`;
    await page.screenshot({ path: full, fullPage: true });

    const crops = {};
    for (const [key, sel] of Object.entries(CROPS)) {
      const el = await page.$(sel);
      if (el) { const p = `${ROOT}/${cfg.name}--crop-${key}.png`; await el.screenshot({ path: p }); crops[key] = await identity(p); }
    }

    const metrics = await page.evaluate(() => {
      const box = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
      const cards = [...document.querySelectorAll('.today-card')].map(el => { const r = el.getBoundingClientRect(); return { id: el.id, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
      const doc = document.documentElement;
      const attention = box('#todayAttentionSidebar'), main = box('.today-main');
      const dirOf = sel => { const el = document.querySelector(sel); return el ? getComputedStyle(el).direction : null; };
      return {
        lang: doc.lang, dir: doc.dir,
        computedDirection: { orchestration: dirOf('.today-orchestration'), main: dirOf('.today-main'), card: dirOf('.today-card'), cardHead: dirOf('.today-card-head'), sessionContent: dirOf('.today-session-content'), action: dirOf('.today-action'), recentList: dirOf('.today-list'), filterbar: dirOf('.today-filterbar') },
        harnessTruth: doc.dataset.harnessTruth,
        projectionState: window.W01_TODAY_EVIDENCE_PROOF?.projection?.state,
        itemCount: window.W01_TODAY_EVIDENCE_PROOF?.projection?.items?.length,
        canonicalWrites: window.W01_TODAY_EVIDENCE_PROOF?.receipt?.canonicalWrites,
        layout: box('.today-layout'), main, attention,
        attentionPhysicallyRight: attention && main ? attention.x >= main.x : null,
        cards, overflowX: doc.scrollWidth - doc.clientWidth, scrollH: doc.scrollHeight,
        attentionItems: document.querySelectorAll('.today-attention-item').length,
        attentionIcons: document.querySelectorAll('.today-attention-icon').length,
        recentRows: document.querySelectorAll('.today-recent-row').length,
        progressRows: document.querySelectorAll('.today-progress-row').length,
        rationaleItems: document.querySelectorAll('.today-rationale-item').length,
        filterCount: document.querySelectorAll('.today-filter').length,
        iconCount: document.querySelectorAll('svg.today-ico').length,
        emptyZones: [...document.querySelectorAll('.today-empty')].map(e => e.textContent.trim().slice(0, 60))
      };
    });

    rows.push({ name: cfg.name, viewport: `${cfg.w}x${cfg.h}`, lang: cfg.lang, view: await identity(view), full: await identity(full), crops, metrics, consoleErrors });
    await context.close();
  }

  await browser.close();
  server.close();
  const out = { unit: 'W01-TODAY', surface: 'today', classification: 'TEST_ONLY_PRESENTATION_HARNESS__NOT_PRODUCT_PROVIDER_TRUTH', tag, startedAt, capturedAt: new Date().toISOString(), commit, dirtyWorkingTree: dirty !== '', server: `repo-root static server :${PORT}`, captures: rows };
  const json = `${ROOT}/LINEAGE-${tag}.json`;
  await writeFile(json, JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ tag, commit, json, count: rows.length, errors: rows.reduce((n, r) => n + r.consoleErrors.length, 0) }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
