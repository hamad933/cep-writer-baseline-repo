// W01-TODAY visual evidence capture.
// Evidence-only tool. Writes to writer-output/W01-TODAY/evidence/ (unit-owned, not a shared seam).
// Binds every image to: candidate + commit + viewport + timestamp + path + sha256 + dims.
import {chromium} from 'playwright';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {execSync} from 'node:child_process';

const ROOT = 'writer-output/W01-TODAY/evidence';
const BASE = process.env.TODAY_BASE || 'http://localhost:4173';
const REF = process.env.TODAY_REF_VIEWPORT || '1520x1034';

const commit = (() => { try { return execSync('git rev-parse HEAD', {encoding: 'utf8'}).trim(); } catch { return 'unknown'; } })();
const dirty = (() => { try { return execSync('git status --porcelain -- stack/native-typescript/surfaces/today stack/native-typescript/adapters/today', {encoding: 'utf8'}).trim(); } catch { return '?'; } })();
const startedAt = new Date().toISOString();

const [REF_W, REF_H] = REF.split('x').map(Number);

async function identity(path) {
  const bytes = await readFile(path);
  return {
    path,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    dims: {w: bytes.readUInt32BE(16), h: bytes.readUInt32BE(20)}
  };
}

async function main() {
  const tag = process.argv[2] || 'baseline';
  await mkdir(ROOT, {recursive: true});
  const browser = await chromium.launch();
  const rows = [];

  const configs = [
    {name: `${tag}-ar-rtl-ref`, locale: 'ar', dir: 'auto', w: REF_W, h: REF_H},
    {name: `${tag}-en-ltr-ref`, locale: 'en', dir: 'auto', w: REF_W, h: REF_H},
    {name: `${tag}-ar-rtl-1280`, locale: 'ar', dir: 'auto', w: 1280, h: 900},
    {name: `${tag}-ar-rtl-1024`, locale: 'ar', dir: 'auto', w: 1024, h: 860},
    {name: `${tag}-ar-rtl-768`, locale: 'ar', dir: 'auto', w: 768, h: 900},
    {name: `${tag}-ar-rtl-480`, locale: 'ar', dir: 'auto', w: 480, h: 900}
  ];

  for (const cfg of configs) {
    const context = await browser.newContext({viewport: {width: cfg.w, height: cfg.h}, deviceScaleFactor: 1});
    await context.addInitScript(prefs => {
      try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: prefs.locale, chromeDirection: prefs.dir}}})); } catch {}
    }, {locale: cfg.locale, dir: cfg.dir});
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 240)); });
    page.on('pageerror', e => consoleErrors.push('pageerror: ' + String(e).slice(0, 240)));
    await page.goto(`${BASE}/?surface=today`, {waitUntil: 'networkidle'});
    await page.waitForSelector('.today-orchestration', {timeout: 15000});
    await page.waitForTimeout(700);

    const full = `${ROOT}/${cfg.name}.png`;
    await page.screenshot({path: full, fullPage: true});

    const crops = {};
    for (const [key, sel] of Object.entries({
      hero: '#todaySessionCard',
      next: '#todayRecommendationCard',
      why: '#todayWhyCard',
      recent: '#todayRecentCard',
      progress: '#todayProgressCard',
      attention: '#todayAttentionSidebar',
      head: '#todayHeader'
    })) {
      const el = await page.$(sel);
      if (el) {
        const p = `${ROOT}/${cfg.name}--crop-${key}.png`;
        await el.screenshot({path: p});
        crops[key] = await identity(p);
      }
    }

    const metrics = await page.evaluate(() => {
      const box = sel => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; };
      const cards = [...document.querySelectorAll('.today-card')].map(el => { const r = el.getBoundingClientRect(); return {id: el.id, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; });
      const doc = document.documentElement;
      const overflowX = doc.scrollWidth - doc.clientWidth;
      return {
        lang: doc.lang, dir: doc.dir,
        layout: box('.today-layout'), main: box('.today-main'), attention: box('#todayAttentionSidebar'),
        cards, overflowX,
        scrollH: doc.scrollHeight,
        attentionItems: document.querySelectorAll('.today-attention-item').length,
        recentRows: document.querySelectorAll('.today-recent-row').length,
        progressRows: document.querySelectorAll('.today-progress-row,.today-progress-count-row').length,
        filterCount: document.querySelectorAll('.today-filter').length,
        emptyZones: [...document.querySelectorAll('.today-empty')].map(e => e.textContent.trim().slice(0, 60))
      };
    });

    rows.push({name: cfg.name, viewport: `${cfg.w}x${cfg.h}`, locale: cfg.locale, full: await identity(full), crops, metrics, consoleErrors});
    await context.close();
  }

  await browser.close();
  const out = {unit: 'W01-TODAY', surface: 'today', tag, startedAt, capturedAt: new Date().toISOString(), commit, dirtyWorkingTree: dirty !== '', captures: rows};
  const json = `${ROOT}/LINEAGE-${tag}.json`;
  await writeFile(json, JSON.stringify(out, null, 2));
  console.log(JSON.stringify({tag, commit, json, count: rows.length, errors: rows.reduce((n, r) => n + r.consoleErrors.length, 0)}, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
