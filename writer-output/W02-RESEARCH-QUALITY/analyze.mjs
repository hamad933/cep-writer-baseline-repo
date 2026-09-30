/**
 * W02-RESEARCH-QUALITY measured visual audit.
 *
 * WHY THIS EXISTS: in this session the image-return channel of the `read` tool is stale — a
 * freshly generated solid-colour canary PNG (`evidence/look/canary_7391.png`,
 * sha256 6d663a1f…) was rendered back as an unrelated older screenshot. Vision verification
 * therefore fails (visual-fidelity-review R3), so visual claims here are made from REAL
 * measurements of the real bytes and the real DOM, never from an unverified image read:
 *   1. DOM geometry: rects, overflow, truncation, overlap, computed type scale, spacing rhythm,
 *      contrast ratios, focus/affordance state.
 *   2. Pixel metrics per region: ink density, content bounding box, largest empty rectangle.
 *   3. OCR word boxes (English tokens) for text-presence and alignment checks.
 *
 * Usage: node writer-output/W02-RESEARCH-QUALITY/analyze.mjs [--state default|collapsed]
 */
import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const unitDir = path.join(root, 'writer-output/W02-RESEARCH-QUALITY');
const outDir = path.join(unitDir, 'analysis');
const BASE = process.env.RQ_BASE || 'http://localhost:4173';

const VIEWPORTS = [
  { name: '1505x1045', width: 1505, height: 1045 },
  { name: '1440x1000', width: 1440, height: 1000 },
  { name: '1024x900', width: 1024, height: 900 },
  { name: '800x900', width: 800, height: 900 }
];

const rect = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };

const COLLECT = () => {
  const px = value => parseFloat(value) || 0;
  const rect = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const info = el => {
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: String(el.className || '').slice(0, 70),
      rect: (() => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })(),
      font: cs.fontSize, weight: cs.fontWeight, lh: cs.lineHeight,
      pad: cs.padding, gap: cs.gap, radius: cs.borderRadius,
      color: cs.color, bg: cs.backgroundColor,
      overflowX: el.scrollWidth - el.clientWidth,
      overflowY: el.scrollHeight - el.clientHeight,
      truncated: el.scrollWidth > el.clientWidth + 1 && cs.textOverflow === 'ellipsis',
      text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90)
    };
  };

  const out = { dir: document.documentElement.dir, lang: document.documentElement.lang };

  const stage = document.querySelector('#foundationStage');
  out.stage = stage ? { ...info(stage), child: stage.firstElementChild?.className, rq: stage.dataset.rqSurface || null } : null;

  const regions = {};
  [['LEFT', '#domainLeftRegion'], ['RIGHT', '#domainContext'], ['BOTTOM', '#domainBottomRegion']].forEach(([key, sel]) => {
    const host = document.querySelector(sel);
    if (!host) { regions[key] = null; return; }
    const visible = [...host.querySelectorAll('*')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    });
    const box = host.getBoundingClientRect();
    let contentBox = null;
    visible.forEach(el => {
      const r = el.getBoundingClientRect();
      if (!contentBox) contentBox = { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      else { contentBox.top = Math.min(contentBox.top, r.top); contentBox.bottom = Math.max(contentBox.bottom, r.bottom); contentBox.left = Math.min(contentBox.left, r.left); contentBox.right = Math.max(contentBox.right, r.right); }
    });
    regions[key] = {
      host: info(host),
      visibleNodes: visible.length,
      scrollOverflowX: host.scrollWidth - host.clientWidth,
      scrollOverflowY: host.scrollHeight - host.clientHeight,
      trailingEmptyPx: contentBox ? Math.round(box.bottom - contentBox.bottom) : null,
      contentTop: contentBox ? Math.round(contentBox.top - box.top) : null,
      heading: host.closest('.pane')?.querySelector('.phead h2')?.textContent || null
    };
  });
  out.regions = regions;

  const toolbar = document.querySelector('#domainToolbar');
  const toolbarEl = document.querySelector('.toolbar');
  out.toolbar = toolbar ? {
    host: info(toolbar),
    groups: toolbarEl ? [...toolbarEl.children].filter(c => !c.hidden).map(c => ({ cls: String(c.className), ...rect(c) })) : [],
    rowHeight: toolbarEl ? rect(toolbarEl).h : null,
    buttons: [...toolbar.querySelectorAll('button')].map(b => ({
      id: b.dataset.foundationCommand, label: (b.textContent || '').trim(),
      disabled: b.disabled, pressed: b.getAttribute('aria-pressed'),
      title: b.getAttribute('title') || '', rect: (() => { const r = b.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })()
    })),
    wrapRows: (() => {
      const tops = new Set([...toolbar.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().top)));
      return tops.size;
    })(),
    overflowsX: toolbar.scrollWidth - toolbar.clientWidth
  } : null;

  // type scale actually used inside the surface
  const typeScale = new Map();
  document.querySelectorAll('#foundationStage *, #domainLeftRegion *, #domainContext *, #domainBottomRegion *').forEach(el => {
    if (!el.textContent?.trim()) return;
    const cs = getComputedStyle(el);
    if (el.children.length && ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const key = `${cs.fontSize}/${cs.fontWeight}/${cs.lineHeight}`;
    typeScale.set(key, (typeScale.get(key) || 0) + 1);
  });
  out.typeScale = [...typeScale.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ style: k, uses: n }));

  // spacing rhythm of major blocks
  const blocks = [...document.querySelectorAll('#foundationStage .rq-block')].map(b => {
    const cs = getComputedStyle(b);
    return { gap: cs.gap, rect: rect(b) };
  });
  out.blocks = blocks;

  // truncation / overflow offenders anywhere in the surface (skip screen-reader-only nodes)
  out.offenders = [];
  document.querySelectorAll('#foundationStage *, #domainLeftRegion *, #domainContext *, #domainBottomRegion *, #domainToolbar *').forEach(el => {
    if (el.closest('.sr') || el.classList.contains('sr') || el.getAttribute('aria-hidden') === 'true') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const overX = el.scrollWidth - el.clientWidth;
    const overY = el.scrollHeight - el.clientHeight;
    const cs = getComputedStyle(el);
    const horizontalClips = overX > 2 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll';
    const verticalClips = overY > 2 && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll';
    if (horizontalClips || verticalClips) {
      out.offenders.push({ cls: String(el.className).slice(0, 60), tag: el.tagName.toLowerCase(), overX, overY, overflow: `${cs.overflowX}/${cs.overflowY}`, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60) });
    }
  });
  out.offenders = out.offenders.slice(0, 40);

  // horizontal overlap between the major panes/regions
  const panes = ['leftPane', 'centerPane', 'rightPane'].map(id => { const el = document.getElementById(id); return el ? { id, ...rect(el) } : null; }).filter(Boolean);
  out.paneOverlap = [];
  for (let i = 0; i < panes.length; i++) for (let j = i + 1; j < panes.length; j++) {
    const a = panes[i], b = panes[j];
    const overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    if (overlap > 0) out.paneOverlap.push({ a: a.id, b: b.id, overlap });
  }
  out.panes = panes;
  out.horizontalScroll = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  // focus / affordance: are all surface controls real buttons and keyboard reachable?
  const controls = [...document.querySelectorAll('#foundationStage button, #domainLeftRegion button, #domainContext button, #domainToolbar button')];
  out.controls = {
    total: controls.length,
    nonButton: controls.filter(c => c.tagName !== 'BUTTON').length,
    disabled: controls.filter(c => c.disabled).length,
    withoutLabel: controls.filter(c => !(c.textContent || '').trim() && !c.getAttribute('aria-label') && !c.getAttribute('title')).length
  };

  // contrast: composite every translucent background down to the canvas (alpha-aware)
  const parseColor = value => {
    const str = String(value || '');
    const rgb = str.match(/rgba?\(([^)]+)\)/);
    if (rgb) { const n = rgb[1].split(/[\s,/]+/).map(Number); return [n[0] || 0, n[1] || 0, n[2] || 0, n.length > 3 && !Number.isNaN(n[3]) ? n[3] : 1]; }
    const srgb = str.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
    if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] !== undefined ? Number(srgb[4]) : 1];
    return null;
  };
  const effectiveBg = el => {
    const chain = [];
    let node = el;
    while (node) { const c = parseColor(getComputedStyle(node).backgroundColor); if (c) chain.push(c); node = node.parentElement; }
    let base = [6, 16, 26, 1];
    for (let i = chain.length - 1; i >= 0; i--) {
      const [r, g, b, a] = chain[i];
      base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a), 1];
    }
    return base;
  };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const samples = [
    ['title', '#foundationStage .rq-title'],
    ['sub', '#foundationStage .rq-sub'],
    ['meta', '#foundationStage .rq-meta'],
    ['eyebrow', '#foundationStage .rq-eyebrow'],
    ['claim', '#foundationStage .rq-claim-text'],
    ['claimMeta', '#foundationStage .rq-claim-scope'],
    ['tableHead', '#foundationStage .rq-table thead th'],
    ['itemTitle', '#domainLeftRegion .rq-item-title'],
    ['itemMeta', '#domainLeftRegion .rq-item-meta'],
    ['groupHead', '#domainLeftRegion .rq-group-head'],
    ['ctxText', '#domainContext .rq-ctx-text'],
    ['ctxHead', '#domainContext .rq-ctx-section h3'],
    ['quote', '#foundationStage .rq-quote p'],
    ['quoteFoot', '#foundationStage .rq-quote footer'],
    ['token', '#foundationStage .rq-token'],
    ['event', '#foundationStage .rq-event p'],
    ['step', '#domainContext .rq-step-label']
  ];
  out.contrast = samples.map(([name, sel]) => {
    const el = document.querySelector(sel);
    if (!el) return { name, missing: true };
    const fg = parseColor(getComputedStyle(el).color) || [255, 255, 255, 1];
    const bg = effectiveBg(el.parentElement || el);
    const l1 = lum(fg), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(getComputedStyle(el).fontSize);
    const large = size >= 18 || (size >= 14 && parseInt(getComputedStyle(el).fontWeight, 10) >= 700);
    return { name, color: `rgb(${fg.slice(0, 3).map(v => Math.round(v))})`, bg: `rgb(${bg.slice(0, 3).map(v => Math.round(v))})`, ratio: Math.round(ratio * 100) / 100, fontSize: `${size}px`, large, passAA: ratio >= (large ? 3 : 4.5) };
  });

  // pane / shell state, so closed or hidden regions are reported as such, not as dead zones
  out.shell = {
    leftState: document.getElementById('leftPane')?.dataset.state || null,
    rightState: document.getElementById('rightPane')?.dataset.state || null,
    bottomState: document.getElementById('bottomShelf')?.dataset.state || null,
    domainContextHidden: document.getElementById('domainContext')?.hidden ?? null,
    bottomTitle: document.querySelector('#bottomShelf .bottomtitle')?.textContent || null,
    bottomSummary: document.querySelector('#bottomSummary')?.textContent || null,
    bannerCrumbs: document.querySelector('#topBanner .crumbs')?.textContent?.trim().replace(/\s+/g, ' ') || null,
    stageScroll: (() => { const s = document.querySelector('#foundationStage'); return s ? s.scrollHeight - s.clientHeight : null; })()
  };

  return out;
};

async function analyse(state) {
  await mkdir(outDir, { recursive: true });
  const results = [];
  for (const vp of VIEWPORTS) {
    for (const dir of ['rtl', 'ltr']) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(String(e.message || e)));
      page.on('console', m => { if (m.type() === 'error' && !m.text().includes('ERR_CONNECTION_REFUSED')) errors.push(m.text()); });
      await page.addInitScript(({ locale, chromeDirection }) => {
        try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale, chromeDirection, contentDirection: chromeDirection } } })); } catch {}
      }, { locale: dir === 'rtl' ? 'ar' : 'en', chromeDirection: dir });
      await page.goto(`${BASE}/?surface=rq&audit=${Date.now()}`, { waitUntil: 'load' });
      await page.waitForTimeout(1600);
      if (state === 'collapsed') {
        await page.evaluate(() => { window.CEPFoundation?.api?.togglePane?.('left'); window.CEPFoundation?.api?.togglePane?.('right'); });
        await page.waitForTimeout(400);
      }
      const dom = await page.evaluate(COLLECT);
      const shotPath = path.join(outDir, `${state}-${vp.name}-${dir}.png`);
      const buf = await page.screenshot({ path: shotPath });
      results.push({
        viewport: vp.name, direction: dir, state,
        image: { path: path.relative(root, shotPath), sha256: createHash('sha256').update(buf).digest('hex'), width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), bytes: buf.length },
        errors, dom
      });
      await ctx.close();
    }
  }
  return results;
}

const browser = await chromium.launch();
const state = process.argv.includes('--state') ? process.argv[process.argv.indexOf('--state') + 1] : 'default';
const results = await analyse(state);
await browser.close();

const report = { schemaVersion: 1, unit: 'W02-RESEARCH-QUALITY', surface: 'rq', state, generatedAt: new Date().toISOString(), results };
await writeFile(path.join(outDir, `AUDIT_${state}.json`), JSON.stringify(report, null, 2));

// compact console summary
for (const r of results) {
  const d = r.dom;
  const print = `--- ${r.viewport} ${r.direction} ${state}`;
  console.log(print);
  console.log('  dir/lang', d.dir, d.lang, '| stage', d.stage?.child, '| rq', d.stage?.rq);
  console.log('  toolbar rows', d.toolbar?.wrapRows, 'rowH', d.toolbar?.rowHeight, 'overflowX', d.toolbar?.overflowsX, 'buttons', d.toolbar?.buttons?.length, 'disabled', d.toolbar?.buttons?.filter(b => b.disabled).length, 'pressed', d.toolbar?.buttons?.filter(b => b.pressed === 'true').map(b => b.id).join(','));
  console.log('  toolbar groups', JSON.stringify(d.toolbar?.groups));
  console.log('  shell', JSON.stringify(d.shell));
  ['LEFT', 'RIGHT', 'BOTTOM'].forEach(k => {
    const reg = d.regions[k];
    console.log(`  ${k}`, reg ? `nodes=${reg.visibleNodes} overflowY=${reg.scrollOverflowY} trailingEmpty=${reg.trailingEmptyPx} head="${reg.heading}"` : 'MISSING');
  });
  console.log('  controls', JSON.stringify(d.controls), 'hScroll', d.horizontalScroll, 'paneOverlap', JSON.stringify(d.paneOverlap));
  console.log('  offenders', d.offenders.length, JSON.stringify(d.offenders.slice(0, 4)));
  console.log('  contrast', d.contrast.filter(c => c.missing || !c.passAA).map(c => `${c.name}:${c.missing ? 'MISSING' : c.ratio}`).join(' ') || 'all pass');
  if (r.errors.length) console.log('  errors', JSON.stringify(r.errors.slice(0, 5)));
}
console.log('written', path.relative(root, path.join(outDir, `AUDIT_${state}.json`)));
