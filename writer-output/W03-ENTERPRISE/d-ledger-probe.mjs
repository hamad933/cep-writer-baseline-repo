/**
 * ENT-1 re-dispatch #2 — D-ledger visual/DOM probe at EXACT CURRENT SOURCE.
 *
 * Static marker inspection from dispatch #1 is explicitly insufficient (mission (b));
 * this probe measures every D-01..D-08 residual live in the browser against the build
 * produced from commit 766ab95367dde5ce433a148cdecb602274fe6c0d.
 *
 * D-04 and D-08 have genuine residuals at SHARED roots — this probe measures and records
 * them as hotspot findings; it never edits geometry, fixtures or adapters.
 *
 * Usage: node writer-output/W03-ENTERPRISE/d-ledger-probe.mjs
 * Writes: writer-output/W03-ENTERPRISE/evidence/dledger-probe.json
 */
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const outFile = path.join(root, 'writer-output/W03-ENTERPRISE/evidence/dledger-probe.json');

const freePort = () => new Promise(res => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
});

const PROBE = () => {
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const visible = n => n.offsetParent !== null || n.getClientRects().length > 0;
  const box = n => { const r = n.getBoundingClientRect(); return {x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1)}; };
  const overlap = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1;
  const clippedX = qa('.enterprise-studio *,#domainLeftRegion *,#domainContext *')
    .filter(n => visible(n) && n.scrollWidth > n.clientWidth + 2 && !['auto', 'scroll'].includes(getComputedStyle(n).overflowX))
    .map(n => `${n.tagName}.${(n.className || '').toString().slice(0, 40)}:${(n.innerText || n.textContent || '').trim().slice(0, 40)}`);

  // ---- D-01 shell-region projection
  const d01 = {
    leftRegionOwned: !!q('#domainLeftRegion .ent-structure'),
    rightRegionOwned: !!q('#domainContext .ent-context'),
    bottomRegionOwned: !!q('#domainBottomRegion .ent-deep-body'),
    inStageFallbackLeft: !!q('.enterprise-studio .ent-structure'),
    inStageFallbackRight: !!q('.enterprise-studio .ent-context'),
    hiddenLeftSiblings: qa('#leftPane .pbody > *').filter(n => n.hidden).length,
    hiddenRightSiblings: qa('#rightPane .pbody > *').filter(n => n.hidden).length,
    visibleRightSiblings: qa('#rightPane .pbody > *').filter(n => !n.hidden).map(n => n.id || n.tagName),
    panes: {left: q('#leftPane')?.dataset.state, right: q('#rightPane')?.dataset.state, bottom: q('#bottomShelf')?.dataset.state},
    nestedRailsInsideStage: qa('.enterprise-studio .ent-rail,.enterprise-studio [data-ent-rail]').length,
    regionBoxes: {
      left: q('#domainLeftRegion') ? box(q('#domainLeftRegion')) : null,
      center: q('[data-region=CENTER]') ? box(q('[data-region=CENTER]')) : null,
      right: q('#domainContext') ? box(q('#domainContext')) : null
    }
  };

  // ---- D-02 command duplication
  const d02 = {
    headerCommands: qa('[data-region=TOP] button').filter(visible).map(n => n.textContent.trim()),
    headerCommandCount: qa('[data-region=TOP] button').filter(visible).length,
    shellToolbarCommands: qa('.toolbar [data-foundation-command],.toolbar button').filter(visible).map(n => n.textContent.trim()),
    inStageComposerAffordance: (() => { const b = q('#foundationStage [data-command="enterprise.edit"]'); return b ? {present: true, label: b.textContent.trim(), disabled: !!b.disabled} : {present: false}; })(),
    duplicated: (() => {
      const h = new Set(qa('[data-region=TOP] button').filter(visible).map(n => n.textContent.trim()));
      return qa('.toolbar [data-foundation-command],.toolbar button').filter(visible).map(n => n.textContent.trim()).filter(t => h.has(t));
    })()
  };

  // ---- D-03 direction inheritance
  const stage = q('.enterprise-studio');
  const d03 = {
    documentDir: document.documentElement.dir,
    stageDirection: stage ? getComputedStyle(stage).direction : null,
    stageHasBakedDirAttr: stage ? stage.getAttribute('dir') : 'NO_STAGE',
    identityX: q('.ent-id') ? Math.round(q('.ent-id').getBoundingClientRect().x) : null,
    actionsX: q('.ent-actions') ? Math.round(q('.ent-actions').getBoundingClientRect().x) : null,
    inherited: stage ? getComputedStyle(stage).direction === document.documentElement.dir : null
  };

  // ---- D-04 node text collision (consumer side) + shared-root condition
  const overlaps = [];
  qa('[data-region=CENTER] .spatial-node-card').forEach(card => {
    const texts = [...card.querySelectorAll('text')].filter(t => (t.textContent || '').trim() && t.getBoundingClientRect().width > 0);
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i].getBoundingClientRect(), b = texts[j].getBoundingClientRect();
      if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2)
        overlaps.push(`${card.dataset.node || '?'}:${texts[i].textContent.trim()}~${texts[j].textContent.trim()}`);
    }
  });
  const nodeSample = qa('[data-region=CENTER] .spatial-node-card').slice(0, 6).map(c => ({
    node: c.dataset.node,
    texts: [...c.querySelectorAll('text')].filter(t => (t.textContent || '').trim()).map(t => ({t: t.textContent.trim(), y: +t.getBoundingClientRect().y.toFixed(1)}))
  }));
  const d04 = {nodeTextOverlaps: overlaps, nodeCards: qa('[data-region=CENTER] .spatial-node-card').length, nodeSample};

  // ---- D-05 structure row truncation
  const d05 = {
    clippedRows: clippedX.filter(c => c.includes('.ent-row') && c.includes('.lbl')),
    rowSamples: qa('#domainLeftRegion .ent-row .lbl').slice(0, 8).map(n => ({text: n.textContent.trim(), clipped: n.scrollWidth > n.clientWidth + 2}))
  };

  // ---- D-06 status hint
  const hint = q('.ent-status') || q('.ent-hint');
  const d06 = {
    hintPresent: !!hint,
    hintText: hint ? hint.textContent.trim() : null,
    hintClipped: hint ? hint.scrollWidth > hint.clientWidth + 2 : null,
    hintTitle: hint ? (hint.title || null) : null,
    clippedInClippedList: clippedX.filter(c => c.includes('ent-status') || c.includes('ent-hint'))
  };

  // ---- D-07 revisions table overflow containment
  const wrap = q('[data-region=CENTER] .ent-table-wrap');
  const d07 = {
    wrapPresent: !!wrap,
    wrapOverflowX: wrap ? getComputedStyle(wrap).overflowX : null,
    wrapMinWidth: wrap ? getComputedStyle(wrap).minWidth : null,
    tableWiderThanCard: (() => {
      const t = q('[data-region=CENTER] table'); if (!t || !wrap) return null;
      return t.scrollWidth > wrap.clientWidth + 2;
    })(),
    clippedCards: clippedX.filter(c => c.includes('ent-card') || c.includes('table'))
  };

  // ---- D-08 RTL legend / readout / minimap geometry
  const legend = q('.ent-legend') || q('[data-region=CENTER] .ent-legend') || q('.spatial-legend');
  const readout = q('.spatial-readout');
  const minimap = q('.minimap');
  const b = n => (n ? box(n) : null);
  const legendBox = b(legend), readoutBox = b(readout), minimapBox = b(minimap);
  const d08 = {
    documentDir: document.documentElement.dir,
    legend: legendBox, readout: readoutBox, minimap: minimapBox,
    legendReadoutOverlap: legendBox && readoutBox ? overlap(legendBox, readoutBox) : null,
    legendMinimapOverlap: legendBox && minimapBox ? overlap(legendBox, minimapBox) : null,
    readoutDirection: readout ? getComputedStyle(readout).direction : null,
    readoutInlineEnd: readout ? getComputedStyle(readout).insetInlineEnd : null,
    surfaceOverrideRules: (() => {
      const hits = [];
      for (const ss of [...document.styleSheets]) {
        try {
          for (const r of [...ss.cssRules]) {
            if (r.selectorText && r.selectorText.includes('.spatial-readout') && (r.cssText.includes('left') || r.cssText.includes('right')))
              hits.push(r.cssText.slice(0, 160));
          }
        } catch {}
      }
      return hits;
    })()
  };

  // ---- SH-1 preserved facts: single SpatialView instance + selectionCount>0
  const readoutEl = q('.spatial-readout');
  const facts = {
    spatialCanvasCount: qa('svg.spatial-canvas').length,
    spatialInstanceIds: qa('svg.spatial-canvas').map(n => n.dataset.spatialInstance),
    foundationSpatialRegistered: typeof window.CEPFoundation?.spatial !== 'undefined' ? Object.keys(window.CEPFoundation.spatial || {}).length : null,
    readoutText: readoutEl ? readoutEl.textContent : null,
    selectionCountFromReadout: readoutEl ? ((readoutEl.textContent || '').match(/(-?\d+)\s*selected/) || [])[1] ?? null : null,
    pressedNodes: qa('.spatial-node-card[aria-pressed="true"]').length
  };

  const clipped = clippedX;
  return {
    dir: document.documentElement.dir,
    lang: document.documentElement.lang,
    consumer: document.body.dataset.consumer,
    words: {
      left: (q('#domainLeftRegion')?.innerText || '').split(/\s+/).filter(Boolean).length,
      center: (q('[data-region=CENTER]')?.innerText || '').split(/\s+/).filter(Boolean).length,
      right: (q('#domainContext')?.innerText || '').split(/\s+/).filter(Boolean).length,
      top: (q('[data-region=TOP]')?.innerText || '').split(/\s+/).filter(Boolean).length
    },
    clipped,
    FACTS: facts,
    D01: d01, D02: d02, D03: d03, D04: d04, D05: d05, D06: d06, D07: d07, d08lower: false,
    D08: d08
  };
};

const run = async (page, locale, dir) => {
  await page.addInitScript(o => {
    try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: o.locale, chromeDirection: o.dir}}})); } catch {}
  }, {locale, dir});
  return page;
};

const results = [];
const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: 'ignore'});
const browser = await chromium.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none']});
const git = (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root}).toString().trim(); } catch { return 'unknown'; } })();
const tree = (() => { try { return execFileSync('git', ['rev-parse', 'HEAD^{tree}'], {cwd: root}).toString().trim(); } catch { return 'unknown'; } })();

try {
  for (const cfg of [
    {id: 'en-ltr-1440', w: 1440, h: 1000, locale: 'en', dir: 'ltr'},
    {id: 'ar-rtl-1440', w: 1440, h: 1000, locale: 'ar', dir: 'rtl'},
    {id: 'en-ltr-1024', w: 1024, h: 900, locale: 'en', dir: 'ltr'},
    {id: 'ar-rtl-1024', w: 1024, h: 900, locale: 'ar', dir: 'rtl'}
  ]) {
    const ctx = await browser.newContext({viewport: {width: cfg.w, height: cfg.h}, reducedMotion: 'reduce', deviceScaleFactor: 1, locale: cfg.locale === 'ar' ? 'ar' : 'en-US'});
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e.message)));
    await run(page, cfg.locale, cfg.dir);
    await page.goto(`http://127.0.0.1:${port}/?surface=enterprise`, {waitUntil: 'networkidle'});
    await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise', null, {timeout: 30000});
    await page.waitForTimeout(500);
    const topology = await page.evaluate(PROBE);
    // selection: click a structure object (selectionCount>0 fact)
    const picked = await page.evaluate(() => {
      const b = document.querySelector('#domainLeftRegion [data-object]') || document.querySelector('[data-region=LEFT] [data-object]');
      if (!b) return null; b.click(); return b.dataset.object;
    });
    await page.waitForTimeout(450);
    const selected = await page.evaluate(PROBE);
    // canvas selection: click the node in the shared SpatialView (visible endpoint) with trusted events
    let canvasPicked = null;
    try {
      const loc = page.locator('svg.spatial-canvas g[data-node="APP-WEB-01"]');
      if (await loc.count()) { await loc.first().click({force: true}); canvasPicked = 'APP-WEB-01'; }
      else {
        const any = page.locator('svg.spatial-canvas g[data-node]').first();
        if (await any.count()) { canvasPicked = await any.getAttribute('data-node'); await any.click({force: true}); }
      }
    } catch (e) { canvasPicked = 'CLICK_FAILED:' + String(e.message).slice(0, 120); }
    await page.waitForTimeout(450);
    const canvasSelected = await page.evaluate(PROBE);
    // revisions state (D-07)
    await page.evaluate(() => { const b = [...document.querySelectorAll('.enterprise-modebar [data-mode]')].find(n => n.dataset.mode === 'revisions'); if (b) b.click(); });
    await page.waitForTimeout(400);
    const revisions = await page.evaluate(PROBE);
    results.push({viewport: cfg, picked, canvasPicked, pageErrors, topology, selected, canvasSelected, revisions});
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}

const out = {
  schemaVersion: 1,
  unit: 'W03-ENTERPRISE',
  purpose: 'D-ledger (D-01..D-08) measured at exact current source — visual/DOM evidence, not static markers',
  commit: git,
  tree,
  capturedAt: new Date().toISOString(),
  note: 'D-04 and D-08 residuals live at SHARED roots (foundation/spatial presentation); recorded as hotspot findings, never fixed inside ENT-1 roots.',
  results
};
await writeFile(outFile, JSON.stringify(out, null, 2));
console.log(`wrote ${path.relative(root, outFile)}`);
for (const r of results) {
  console.log(`${r.viewport.id} picked=${r.picked} canvasPicked=${r.canvasPicked} errs=${r.pageErrors.length} D01.left=${r.topology.D01.leftRegionOwned} D02.headerCmds=${r.topology.D02.headerCommandCount} dup=${JSON.stringify(r.topology.D02.duplicated)} D03.stageDir=${r.topology.D03.stageDirection} inh=${r.topology.D03.inherited} D04.overlaps=${r.topology.D04.nodeTextOverlaps.length} D05.clipped=${r.topology.D05.clippedRows.length} D06.clipped=${r.topology.D06.hintClipped} D07.wrap=${r.revisions.D07.wrapPresent}/${r.revisions.D07.wrapOverflowX} D08.legendReadoutOverlap=${r.topology.D08.legendReadoutOverlap} canvases=${r.topology.FACTS.spatialCanvasCount} sel(struct)=${r.selected.FACTS.selectionCountFromReadout} sel(canvas)=${r.canvasSelected.FACTS.selectionCountFromReadout} pressed(canvas)=${r.canvasSelected.FACTS.pressedNodes}`);
}
