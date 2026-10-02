#!/usr/bin/env node
/**
 * SH-2 lane probe — W01-SHELL (chrome/geometry).
 *
 * Serves the exact built `dist/` over localhost-http on its own port (H-FAM-03: never grabs
 * 4174, the local-runtime port), then for every `?surface=` route and every (viewport, locale)
 * combination records:
 *   - boot truth: booted / pageErrors / console errors  (23-route smoke)
 *   - pane geometry: `--left`/`--right`, #leftPane/#centerPane/#rightPane rects, proportions
 *   - responsive band + overlap (AD-01 acceptance probe)
 *   - shell-chrome Arabic census under EN (AD-02 probe)
 *   - structural tree hash of chrome+panes per locale (G-20 "no baked direction" probe)
 *   - the six pre-seeded findings' objective DOM facts
 *
 * Usage: node writer-output/W01-SHELL/probes/sh2-geometry-route-probe.mjs <out.json>
 */
import { spawn } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const OUT = process.argv[2] || 'writer-output/W01-SHELL/evidence/sh2-probe.json';
const STATIC_PORT = Number(process.env.SH2_STATIC_PORT || 43174);
const BASE = `http://127.0.0.1:${STATIC_PORT}`;

export const SURFACES = [
  'shell', 'today', 'library', 'learn', 'visualize', 'rq', 'enterprise', 'scenarios', 'labs',
  'runs', 'results', 'evidence', 'reviews', 'mastery', 'portfolio', 'health', 'processing',
  'validation', 'manual_ai', 'backup', 'audit', 'releases', 'configuration'
];

const VIEWPORTS = [
  { id: '1440x1000', width: 1440, height: 1000 },
  { id: '1024x900', width: 1024, height: 900 },
  { id: '768x900', width: 768, height: 900 }
];

const LOCALES = ['ar', 'en'];

function seedLocale(locale) {
  return `try{
    localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion:1,kind:'cep-foundation-preferences',overrides:{global:{locale:'${locale}'}}}));
  }catch(e){}`;
}

const MEASURE = () => {
  const AR = /[؀-ۿ]/;
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), right: Math.round(b.right), bottom: Math.round(b.bottom) };
  };
  const de = document.documentElement;
  const left = document.getElementById('leftPane');
  const center = document.getElementById('centerPane');
  const right = document.getElementById('rightPane');
  const cols = document.querySelector('.cols');
  const cs = getComputedStyle(de);
  const colsRect = cols ? cols.getBoundingClientRect() : null;
  const W = colsRect ? colsRect.width : window.innerWidth;
  const p = (v) => (v == null ? null : Math.round((v / W) * 10000) / 100);
  const L = r(left), C = r(center), R = r(right);
  const bodyData = {};
  for (const k of Object.keys(document.body.dataset)) bodyData[k] = document.body.dataset[k];

  // ---- shell / chrome Arabic census (AD-02) ----
  const chromeSelectors = [
    '.foundation-shell', '#topBanner', '.toolbar', '.centerrail',
    '#leftPane .phead', '#rightPane .phead', '#leftLocalReveal', '#rightLocalReveal',
    '#leftResizer', '#rightResizer', '#leftPane .rail', '#rightPane .rail'
  ];
  const seen = new Set();
  const chromeArabic = [];
  const scan = (rootEl, scope) => {
    if (!rootEl) return;
    for (const el of rootEl.querySelectorAll('*')) {
      for (const attr of ['aria-label', 'title', 'placeholder']) {
        const v = el.getAttribute && el.getAttribute(attr);
        if (v && AR.test(v)) chromeArabic.push({ scope, attr, value: v.slice(0, 80), tag: el.tagName.toLowerCase(), id: el.id || null, cls: (el.className && String(el.className).slice(0, 60)) || null });
      }
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
      if (own && AR.test(own)) chromeArabic.push({ scope, attr: 'text', value: own.slice(0, 80), tag: el.tagName.toLowerCase(), id: el.id || null, cls: (el.className && String(el.className).slice(0, 60)) || null });
    }
  };
  for (const sel of chromeSelectors) {
    const rootEl = document.querySelector(sel);
    if (!rootEl) continue;
    const key = sel + '#' + (rootEl.id || rootEl.className);
    if (seen.has(key)) continue;
    seen.add(key);
    scan(rootEl, sel);
  }

  // whole-document Arabic (surface content included -> reference only, not an AD-02 verdict)
  let docArabic = 0;
  for (const el of document.querySelectorAll('*')) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    if (own && AR.test(own)) docArabic++;
  }

  // ---- structural tree hash (G-20 / locale flip): identity of chrome+pane skeleton ----
  const skeleton = (rootEl) => {
    if (!rootEl) return null;
    const walk = (el) => {
      if (el.nodeType !== 1) return null;
      const cls = typeof el.className === 'string' ? el.className.trim().replace(/\s+/g, ' ') : '';
      const kids = [...el.children].map(walk).filter(Boolean);
      return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls.split(' ').join('.') : ''}[${kids.join('>')}]`;
    };
    return walk(rootEl);
  };
  const skelParts = ['.foundation-shell', '.app', '.stage', '.cols', '.centerrail', '#topBanner']
    .map((s) => skeleton(document.querySelector(s)));
  const skeletonRaw = skelParts.join('|');
  // deterministic 64-bit FNV-1a (page context has no crypto)
  let h1 = 0x811c9dc5, h2 = 0xcbf29ce4;
  for (let i = 0; i < skeletonRaw.length; i++) {
    const c = skeletonRaw.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x01000193) >>> 0;
  }
  const skeletonHash = (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')) + ':' + skeletonRaw.length;

  // ---- pre-seeded findings ----
  const reveal = document.getElementById('leftLocalReveal');
  const revealRect = r(reveal);
  // stage eyebrow / first VISIBLE heading inside the centre stage
  const heads = [...document.querySelectorAll('.foundation-stage h1, .foundation-stage h2, #centerPane h1, #centerPane h2, #foundationStage h1, #foundationStage h2, .structurehud h1, .structurehud h2')]
    .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; });
  const eyebrow = heads[0] || null;
  const eyebrowRect = eyebrow ? r(eyebrow) : null;
  const revealOccludes = Boolean(revealRect && eyebrowRect && !reveal.hidden &&
    revealRect.x < eyebrowRect.right && revealRect.right > eyebrowRect.x &&
    revealRect.y < eyebrowRect.bottom && revealRect.bottom > eyebrowRect.y);
  const beneathReveal = (revealRect && revealRect.w > 0)
    ? document.elementsFromPoint(Math.round(revealRect.x + revealRect.w / 2), Math.round(revealRect.y + revealRect.h / 2))
        .slice(0, 5).map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : ''}`)
    : [];
  // right pane context chrome
  const ctxScope = document.querySelector('#rightPane .contextscope');
  const ctxLenses = document.querySelector('#rightPane .context-lenses, #contextLenses, .context-lenses');
  const rpHead = document.querySelector('#rightPane .phead');
  const gap27 = (() => {
    if (!ctxScope || ctxLenses) return null;
    const a = rpHead ? rpHead.getBoundingClientRect().bottom : null;
    const b = ctxLenses ? ctxLenses.getBoundingClientRect().top : null;
    if (a == null || b == null) return null;
    return Math.round(b - a);
  })();
  // centerrail overlay over centre content
  const crail = document.querySelector('.centerrail');
  const crailRect = r(crail);
  const centreContent = document.querySelector('#centerPane .docscroll, #centerPane .structurehud, #centerPane .foundation-stage, #centerPane > *:not(.centerrail)');
  const centreContentRect = centreContent ? r(centreContent) : null;
  const crailOverlay = Boolean(crailRect && centreContentRect && !crail.hidden &&
    crailRect.x < centreContentRect.right && crailRect.right > centreContentRect.x &&
    crailRect.y < centreContentRect.bottom && crailRect.bottom > centreContentRect.y);
  const beneathCenterrail = (crailRect && crailRect.w > 0)
    ? document.elementsFromPoint(Math.round(crailRect.x + crailRect.w / 2), Math.round(crailRect.y + crailRect.h / 2))
        .slice(0, 5).map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/).join('.') : ''}`)
    : [];
  // forced-flip nav chip edge clip (PRC-1)
  const navClip = (() => {
    const nav = document.querySelector('.global-shell-destinations, .global-shell-area-nav');
    if (!nav) return null;
    const out = [];
    for (const chip of nav.querySelectorAll('.global-shell-destination, .global-shell-context-link, .global-shell-area-token')) {
      const b = chip.getBoundingClientRect();
      const nb = nav.getBoundingClientRect();
      if (b.width === 0) continue;
      const spillL = nb.left - b.left, spillR = b.right - nb.right;
      if (spillL > 0.5 || spillR > 0.5) out.push({ text: (chip.textContent || '').trim().slice(0, 30), spillL: Math.round(spillL), spillR: Math.round(spillR) });
    }
    return { scrollWidth: nav.scrollWidth, clientWidth: nav.clientWidth, clipped: out };
  })();

  // ---- HLTH-F7: right pane child layout (gap between .phead and the first visible child) ----
  const rp = document.getElementById('rightPane');
  const rightPaneChildren = rp ? [...rp.children].map((el) => {
    const b = el.getBoundingClientRect();
    const cs2 = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(), id: el.id || null,
      cls: (typeof el.className === 'string' ? el.className.trim().replace(/\s+/g, ' ') : '').slice(0, 50),
      hidden: Boolean(el.hidden), display: cs2.display,
      y: Math.round(b.y), h: Math.round(b.height)
    };
  }) : [];
  const rpHeadEl = document.querySelector('#rightPane .phead');
  const rpHeadBottom = rpHeadEl ? Math.round(rpHeadEl.getBoundingClientRect().bottom) : null;
  const firstVisibleBelowHead = rightPaneChildren.find((c) => !c.hidden && c.display !== 'none' && c.h > 0 && rpHeadBottom != null && c.y >= rpHeadBottom - 1);
  const pheadGap = (rpHeadBottom != null && firstVisibleBelowHead) ? Math.round(firstVisibleBelowHead.y - rpHeadBottom) : null;

  // ---- PRC-1: top-nav grid diagnostics ----
  const primaryEl = document.querySelector('.global-shell-primary');
  const navDiag = (() => {
    const nav = document.querySelector('.global-shell-destinations');
    if (!nav || !primaryEl) return null;
    const pcs = getComputedStyle(primaryEl);
    const navBox = nav.getBoundingClientRect();
    const primBox = primaryEl.getBoundingClientRect();
    return {
      gridTemplateColumns: pcs.gridTemplateColumns,
      primaryInnerW: Math.round(primBox.width),
      navW: Math.round(navBox.width),
      navScrollW: nav.scrollWidth,
      deficit: Math.round(nav.scrollWidth - nav.clientWidth),
      justifyContent: getComputedStyle(nav).justifyContent
    };
  })();
  // reachability proof for the clipped end chip (overflow-x:auto + safe center)
  if (navDiag) {
    const navEl = document.querySelector('.global-shell-destinations');
    const prev = navEl.scrollLeft;
    const rtl = document.documentElement.dir === 'rtl';
    navEl.scrollLeft = rtl ? -navEl.scrollWidth : navEl.scrollWidth;
    navDiag.maxScrollAbs = Math.abs(navEl.scrollLeft);
    navEl.scrollLeft = prev;
    navDiag.endChipReachableByScroll = navDiag.maxScrollAbs >= navDiag.deficit - 1;
  }
  // ---- HLTH-F7b: inside .pbody ----
  const pbodyEl = document.querySelector('#rightPane .pbody');
  const pbodyChildren = pbodyEl ? [...pbodyEl.children].slice(0, 12).map((el) => {
    const b = el.getBoundingClientRect();
    const cs3 = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(), id: el.id || null,
      cls: (typeof el.className === 'string' ? el.className.trim().replace(/\s+/g, ' ') : '').slice(0, 50),
      hidden: Boolean(el.hidden), display: cs3.display,
      y: Math.round(b.y), h: Math.round(b.height)
    };
  }) : [];

  return {
    consumer: (window.CEPFoundation && window.CEPFoundation.consumer) || null,
    foundationStage: Boolean(document.getElementById('foundationStage')),
    viewport: { w: window.innerWidth, h: window.innerHeight },
    dir: de.dir, lang: de.lang, languageAuthority: de.getAttribute('data-language-authority'),
    cssVars: { left: cs.getPropertyValue('--left').trim(), right: cs.getPropertyValue('--right').trim() },
    bodyData,
    colsRect: colsRect ? { x: Math.round(colsRect.x), w: Math.round(colsRect.width) } : null,
    rects: { left: L, center: C, right: R },
    pct: { left: p(L && L.w), center: p(C && C.w), right: p(R && R.w) },
    overlap: {
      leftVsCenter: L && C ? Math.max(0, L.right - C.x) : null,
      centerVsRight: C && R ? Math.max(0, C.right - R.x) : null
    },
    chromeArabicCount: chromeArabic.length,
    chromeArabic: chromeArabic.slice(0, 60),
    docArabicLeafCount: docArabic,
    rightPaneChildren,
    pbodyChildren,
    pheadGap,
    navDiag,
    skeletonHash,
    seeded: {
      leftPaneX: L ? L.x : null,
      revealOccludesEyebrow: revealOccludes,
      revealHidden: reveal ? reveal.hidden : null,
      beneathReveal,
      eyebrow: eyebrow ? { tag: eyebrow.tagName.toLowerCase(), text: (eyebrow.textContent || '').trim().slice(0, 60), rect: eyebrowRect } : null,
      contextscopePresent: Boolean(ctxScope),
      contextscopeDisplay: ctxScope ? getComputedStyle(ctxScope).display : null,
      contextLensesPresent: Boolean(ctxLenses),
      contextLensesDisplay: ctxLenses ? getComputedStyle(ctxLenses).display : null,
      pheadToLensesGap: gap27,
      centerrailOverlay: crailOverlay,
      centerrailRect: crailRect,
      beneathCenterrail,
      navClip
    }
  };
};

function startServer(port) {
  const child = spawn(process.execPath, [path.join(ROOT, 'tools/serve.mjs'), '--port', String(port)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('serve.mjs did not start in 15s')), 15000);
    child.stdout.on('data', (b) => { if (String(b).includes('ready')) { clearTimeout(timer); resolve(child); } });
    child.stderr.on('data', (b) => process.stderr.write(String(b)));
    child.on('exit', (c) => { clearTimeout(timer); reject(new Error('serve.mjs exited early: ' + c)); });
  });
}

async function once(browser, { surfaces, viewports, locales, label }) {
  const results = [];
  for (const locale of locales) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
      await context.addInitScript(seedLocale(locale));
      const page = await context.newPage();
      const pageErrors = [];
      const consoleErrors = [];
      const failedRequests = new Set();
      page.on('pageerror', (e) => pageErrors.push(String(e && e.message || e)));
      page.on('requestfailed', (r) => failedRequests.add(`${r.url().replace(/^https?:\/\/[^/]+/, '')} :: ${(r.failure() && r.failure().errorText) || 'unknown'}`));
      page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
      for (const surface of surfaces) {
        pageErrors.length = 0; consoleErrors.length = 0; failedRequests.clear();
        const url = `${BASE}/index.html?surface=${encodeURIComponent(surface)}`;
        let booted = false, navError = null;
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.waitForFunction(() => Boolean(window.CEPFoundation) && document.readyState === 'complete', { timeout: 15000 });
          await page.waitForFunction(() => Boolean(document.getElementById('foundationStage')), { timeout: 15000 }).catch(() => {});
          await page.waitForTimeout(700);
          booted = true;
        } catch (e) { navError = String(e && e.message || e).slice(0, 200); }
        let geo = null, geoError = null;
        if (booted) {
          try { geo = await page.evaluate(MEASURE); } catch (e) { geoError = String(e && e.message || e).slice(0, 200); }
        }
        results.push({
          label, locale, viewport: vp.id, surface, url,
          booted, navError,
          pageErrors: [...pageErrors], consoleErrors: [...consoleErrors].slice(0, 4),
          failedRequests: [...failedRequests].slice(0, 6),
          geometry: geo, geoError
        });
      }
      await context.close();
    }
  }
  return results;
}

const t0 = Date.now();
const server = await startServer(STATIC_PORT);
const QUICK = process.env.SH2_QUICK === '1';
const ONLY = process.env.SH2_SURFACES ? process.env.SH2_SURFACES.split(',').filter(Boolean) : null;
const pick = (list) => (ONLY ? list.filter((s) => ONLY.includes(s)) : list);
let browser;
try {
  browser = await chromium.launch();
  const all = [];
  // Pass 1: every route at the primary viewport in both locales (route smoke + locale flip)
  all.push(...await once(browser, { surfaces: pick(SURFACES), viewports: QUICK ? VIEWPORTS : [VIEWPORTS[0]], locales: LOCALES, label: 'smoke-primary' }));
  if (!QUICK) {
  // Pass 2: representative route set across all viewports (responsive/overlap regression)
  const sample = ['shell', 'library', 'enterprise', 'scenarios', 'evidence', 'audit', 'configuration', 'visualize', 'runs', 'health'];
  all.push(...await once(browser, { surfaces: sample, viewports: VIEWPORTS, locales: ['en'], label: 'responsive' }));
  // Pass 3: whole route set at the two wide viewports in AR (AD-01 acceptance at 1440/1024)
  all.push(...await once(browser, { surfaces: SURFACES, viewports: [VIEWPORTS[1]], locales: ['ar'], label: 'smoke-1024' }));
  }

  const summary = {
    probe: 'SH2_GEOMETRY_ROUTE_PROBE',
    startedAt: new Date(t0).toISOString(),
    finishedAt: new Date().toISOString(),
    node: process.version,
    staticPort: STATIC_PORT,
    transport: 'localhost-http',
    quick: QUICK,
    surfacesFilter: ONLY,
    labels: QUICK ? ['smoke-primary-quick'] : ['smoke-primary', 'responsive', 'smoke-1024'],
    total: all.length,
    booted: all.filter((r) => r.booted).length,
    routesWithPageErrors: all.filter((r) => r.pageErrors.length).length,
    routesWithConsoleErrors: all.filter((r) => r.consoleErrors.length).length,
    results: all
  };
  await mkdir(path.dirname(path.join(ROOT, OUT)), { recursive: true });
  await writeFile(path.join(ROOT, OUT), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({ ...summary, results: undefined }, null, 2));
  if (summary.booted !== summary.total || summary.routesWithPageErrors) process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
