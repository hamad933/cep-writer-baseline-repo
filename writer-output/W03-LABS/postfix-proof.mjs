/**
 * W03-LABS · post-fix proof probe (writer-local instrument, LAB-1 candidate lane).
 *
 * Closes the pending post-fix proof with fresh, source-bound evidence at the exact candidate
 * HEAD. Every section is a named check; every check records its evidence (DOM measurement,
 * capture bytes, pixel/OCR read) instead of an opinion.
 *
 *   B04    · node paint re-proof (pixel stddev + same-bytes OCR + DOM title truth)
 *   R09    · conditional-vs-optional residual RE-PROVED (not assumed)
 *   R10    · multi-selection boundary + minimap tile residual RE-PROVED (not assumed)
 *   RESP   · responsive recapture proof at 1440x1000 and 1024x900
 *   I18N   · AR/RTL + EN/LTR first-class proof (direction, chrome language, bdi isolation)
 *   N1     · non-owned-route mutation attempt must refuse (and must not mount labs)
 *   N1b    · non-owned command on the labs route must refuse
 *   N2     · boundary/invalid input → explicit error, exact task id, no false receipt
 *   N3     · act without provider/prerequisite → unavailable, never fabricated
 *   DONOR  · no visible donor leak (supporting)
 *
 * Usage: node writer-output/W03-LABS/postfix-proof.mjs [--root <siteDir>]
 * Output: writer-output/W03-LABS/POSTFIX_PROOF.json + evidence/postfix/*.png
 */
import {createRequire} from 'node:module';
import {spawn, spawnSync} from 'node:child_process';
import {writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
const arg = (n) => {const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null};
const siteRoot = arg('--root') || path.join(root, 'dist');
const outDir = path.join(root, 'writer-output/W03-LABS/evidence/postfix');
const PREFS = {
  en: {locale: 'en', chromeDirection: 'ltr', contentDirection: 'ltr'},
  ar: {locale: 'ar', chromeDirection: 'rtl', contentDirection: 'rtl'},
};

const sha256 = (p) => createHash('sha256').update(require('node:fs').readFileSync(p)).digest('hex');
const freePort = () => new Promise((r) => {const s = net.createServer(); s.listen(0, '127.0.0.1', () => {const p = s.address().port; s.close(() => r(p))})});
const checks = [];
const check = (id, pass, evidence) => {checks.push({id, pass: !!pass, evidence}); return !!pass};

const exec = async (page, code) => page.evaluate(code);

async function boot(browser, port, locale, viewport) {
  const ctx = await browser.newContext({viewport, reducedMotion: 'reduce'});
  await ctx.addInitScript((p) => {try {localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: p}}))} catch {}}, PREFS[locale]);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e?.message || e).slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?surface=labs`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'labs', null, {timeout: 30000});
  await page.waitForSelector('[data-lab-graph] g[data-node]', {timeout: 20000});
  await page.waitForTimeout(1200);
  return {ctx, page, pageErrors};
}

const pixelcheck = (png, rect, opts = []) => {
  const r = spawnSync('python3', [path.join(root, 'writer-output/W03-LABS/pixelcheck.py'), png, rect.x, rect.y, rect.w, rect.h, ...opts], {encoding: 'utf8', timeout: 120000});
  try {return JSON.parse(r.stdout)} catch {return {error: 'PIXELCHECK_FAILED', stdout: r.stdout.slice(0, 200), stderr: String(r.stderr).slice(0, 300)}}
};

const port = await freePort();
const server = spawn(process.execPath, [path.join(root, 'writer-output/W03-LABS/serve-site.mjs'), '--port', String(port), '--root', siteRoot], {cwd: root, stdio: 'ignore'});
await new Promise((r) => setTimeout(r, 900));
await mkdir(outDir, {recursive: true});
const browser = await chromium.launch();
const startedAt = new Date().toISOString();

/* ------------------------------------------------------------------ B04 · node paint */
{
  const {ctx, page, pageErrors} = await boot(browser, port, 'en', {width: 1505, height: 1045});
  const dom = await page.evaluate(() => {
    const pick = (id) => {
      const g = document.querySelector(`[data-lab-graph] [data-node="${id}"]`);
      const s = g?.querySelector('.node-surface');
      if (!g || !s) return null;
      const r = s.getBoundingClientRect();
      const t = g.querySelector('.node-title');
      return {id, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        cssW: getComputedStyle(s).width, cssH: getComputedStyle(s).height,
        title: (t?.textContent || '').replace(/\s+/g, ' ').trim(),
        tspans: [...(t?.querySelectorAll('tspan') || [])].map((x) => x.textContent),
        aria: g.getAttribute('aria-label') || ''};
    };
    return {n1: pick('TASK-1'), n2: pick('TASK-2'), styleInjected: !!document.querySelector('style[data-w03-labs-style]')};
  });
  const png = path.join(outDir, 'b04-node-paint-en-1505x1045.png');
  await page.screenshot({path: png});
  const n1 = dom.n1 && pixelcheck(png, dom.n1, ['--crop', path.join(outDir, 'b04-task1-rect.png'), '--ocr']);
  const n2 = dom.n2 && pixelcheck(png, dom.n2, ['--crop', path.join(outDir, 'b04-task2-rect.png')]);
  const ocrText = (n1?.ocr?.text || '').toLowerCase();
  const ocrHit = /discover/.test(ocrText) && /(input|surface)/.test(ocrText);
  /* the SVG title is split across two tspans, so textContent has no space between them —
     the accessible name and the joined tspan text are the truthful DOM strings to assert */
  const domTitle = (dom.n1?.tspans?.length ? dom.n1.tspans.join(' ') : dom.n1?.title || '').replace(/\s+/g, ' ');
  const domHit = /Discover Input Surface/i.test(domTitle) && /Discover Input Surface/i.test(dom.n1?.aria || '');
  const ratio = n1?.stddev && n2?.stddev ? n1.stddev / n2.stddev : 0;
  check('B04.node-paint-reproof', !!dom.n1 && domHit && ocrHit && n1.stddev >= 25 && ratio >= 0.5 && pageErrors.length === 0, {
    note: 'baseline destroyed node: stddev 13 vs neighbour 45, OCR read no text in the node rect',
    rect: dom.n1 && {x: dom.n1.x, y: dom.n1.y, w: dom.n1.w, h: dom.n1.h, css: [dom.n1.cssW, dom.n1.cssH]},
    task1: {stddev: n1?.stddev, ink: n1?.ink, mean: n1?.mean, ocr: n1?.ocr, error: n1?.error},
    task2: {stddev: n2?.stddev, ink: n2?.ink},
    stddevRatioTask1OverTask2: Number(ratio.toFixed(2)),
    domTitle, domTitleRaw: dom.n1?.title, domAria: dom.n1?.aria, tspans: dom.n1?.tspans, styleInjected: dom.styleInjected,
    thresholds: {stddevMin: 25, ratioMin: 0.5, ocrRequires: 'discover + (input|surface)'},
    capture: {path: path.relative(root, png), sha256: sha256(png), bytes: require('node:fs').statSync(png).size},
    crop: {path: path.relative(root, path.join(outDir, 'b04-task1-rect.png')), sha256: sha256(path.join(outDir, 'b04-task1-rect.png'))},
    pageErrors});
  await ctx.close();
}

/* ------------------------------------------------------- R09 · conditional/optional residual */
const readRelations = (page) => page.evaluate(() => {
  const edges = [...document.querySelectorAll('[data-lab-graph] [data-edge]')].map((g) => {
    const line = g.querySelector('line.relation-line');
    return {edge: g.getAttribute('data-edge'), styleClass: g.getAttribute('data-edge-class'),
      label: (g.querySelector('.relation-label')?.textContent || '').replace(/\s+/g, ' ').trim(),
      dashAttr: line?.getAttribute('stroke-dasharray') || '',
      dashComputed: line ? getComputedStyle(line).strokeDasharray : '',
      aria: (g.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 160)};
  });
  const legend = [...document.querySelectorAll('.w03l-legend .w03l-key')].map((k) => ({
    text: (k.innerText || '').replace(/\s+/g, ' ').trim(),
    swatch: k.querySelector('i')?.className || '(solid)'}));
  const structure = (document.querySelector('#domainLeftRegion')?.innerText || '').replace(/\s+/g, ' ');
  return {edges, legend,
    branchesGroup: /Branch(es)?/.test(structure) || /فروع/.test(structure),
    legendKeys: legend.length};
});
{
  const {ctx, page} = await boot(browser, port, 'en', {width: 1505, height: 1045});
  /* The shipped fixture has no conditional edge, so the residual is authored through the labs
     bus on the real renderer — measured, not inferred from source. */
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-lab-graph] [data-node]')].map((g) => g.getAttribute('data-node')));
  let chosen = null, authored = null, rejected = [];
  for (const [i, a] of ids.entries()) {
    if (chosen) break;
    for (const b of ids.slice(i + 1)) {
      const res = await page.evaluate(([from, to]) => {
        const bus = window.CEPFoundation.commandBus;
        try {
          const r = bus.execute('labs.author', {op: 'connect', edge: {id: 'EDGE-COND-PROOF', from, to, type: 'conditional', condition: 'when generated signals are already explained'}});
          return {accepted: true, lifecycle: r?.snapshot?.lifecycle ?? null};
        } catch (e) { return {accepted: false, error: String(e.message).slice(0, 120)} }
      }, [a, b]);
      if (res.accepted) { chosen = [a, b]; authored = res; break }
      if (!/LAB_EDGE_DUPLICATE/.test(res.error || '')) rejected.push({a, b, ...res});
    }
  }
  if (chosen) { await page.locator('#domainLeftRegion [data-step="TASK-3"]').click(); await page.waitForTimeout(700); }
  const r = await readRelations(page);
  const match = (re) => r.edges.filter((e) => re.test(e.label));
  const cond = match(/conditional/i), opt = match(/optional/i), lin = match(/linear/i);
  const dashedSet = [...new Set([...cond, ...opt].map((e) => e.dashComputed))];
  const sameDash = cond.length > 0 && opt.length > 0 && dashedSet.length === 1;
  const legendShot = path.join(outDir, 'r09-legend-en.png');
  await page.locator('.w03l-foot').screenshot({path: legendShot});
  check('R09.optional-vs-conditional-residual-reproved',
    r.legendKeys === 3 && sameDash && lin.length > 0 && lin.every((e) => e.dashComputed === 'none') && r.branchesGroup,
    {note: 'reference distinguishes Conditional Unlock (dashed) from Optional Branch (dashed + circle); shared relation stroke classes are solid vs dashed only',
      authoredConditionalEdge: chosen ? {pair: chosen, ...authored} : null, rejections: rejected,
      legend: r.legend, legendKeys: r.legendKeys,
      edges: r.edges.map((e) => ({edge: e.edge, label: e.label, styleClass: e.styleClass, dash: e.dashComputed})),
      linearDash: [...new Set(lin.map((e) => e.dashComputed))],
      conditionalDashes: cond.map((e) => e.dashComputed),
      optionalDashes: opt.map((e) => e.dashComputed),
      conditionalEqualsOptionalDash: sameDash,
      legendOptionalSwatch: (r.legend.find((k) => /optional/i.test(k.text)) || {}).swatch,
      compensation: {legendKeys: r.legend.map((k) => k.text), branchesGroup: r.branchesGroup},
      residualVerdict: sameDash ? 'RESIDUAL_REPROVED_NOT_FIXED — Conditional Unlock and Optional Branch render the same 7/4 dashed stroke; the legend key and the Optional node chip/Branches group carry the distinction. Shared stroke geometry not forked.'
        : 'RESIDUAL_CHANGED — re-read required',
      evidence: {legend: {path: path.relative(root, legendShot), sha256: sha256(legendShot), bytes: require('node:fs').statSync(legendShot).size}}});
  await ctx.close();
}
{
  /* same relation read in AR/RTL — presentation-visible direction check for the same residual */
  const {ctx, page} = await boot(browser, port, 'ar', {width: 1505, height: 1045});
  const r = await readRelations(page);
  const legendShot = path.join(outDir, 'r09-legend-ar.png');
  await page.locator('.w03l-foot').screenshot({path: legendShot});
  const dashSet = [...new Set(r.edges.map((e) => e.dashComputed))];
  check('R09.edge-styles-observed-in-ar', r.edges.length > 0 && r.legendKeys === 3,
    {note: 'observation, not a pass/fail claim: which shared stroke classes the Arabic labels resolve to',
      legend: r.legend, dashSet, edges: r.edges.map((e) => ({label: e.label, styleClass: e.styleClass, dash: e.dashComputed})),
      evidence: {legend: {path: path.relative(root, legendShot), sha256: sha256(legendShot)}}});
  await ctx.close();
}

/* ------------------------------------------------- R10 · selection boundary + minimap residual */
{
  const {ctx, page} = await boot(browser, port, 'en', {width: 1505, height: 1045});
  /* Shift + pointer-down extends the spatial selection; the shared group boundary is drawn during
     the gesture, which is the reachable moment to measure it against the Labs card box. */
  const box = await page.locator('[data-lab-graph] [data-node="TASK-2"] .node-surface').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.waitForTimeout(320);
  const sel = await page.evaluate(() => {
    const pressed = [...document.querySelectorAll('[data-lab-graph] [data-node][aria-pressed="true"]')];
    const cards = pressed.map((g) => {
      const r = g.querySelector('.node-surface').getBoundingClientRect();
      return {id: g.getAttribute('data-node'), left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom)};
    });
    const b = document.querySelector('.spatial-multi-selection-group .group-boundary');
    const br = b ? b.getBoundingClientRect() : null;
    const card = document.querySelector('[data-lab-graph] .node-surface');
    const minimap = document.querySelector('.minimap');
    const tiles = [...(minimap?.querySelectorAll('rect') || [])].map((t) => ({w: +t.getAttribute('width'), h: +t.getAttribute('height')}));
    return {selectionCount: pressed.length,
      boundaryLabel: b ? (b.parentElement?.querySelector('.group-label')?.textContent || '').trim() : null,
      boundary: br ? {left: Math.round(br.left), right: Math.round(br.right), top: Math.round(br.top), bottom: Math.round(br.bottom)} : null,
      cards,
      cardAttr: card ? {w: card.getAttribute('width'), h: card.getAttribute('height')} : null,
      cardCss: card ? {w: getComputedStyle(card).width, h: getComputedStyle(card).height} : null,
      minimapHidden: minimap ? !!minimap.hidden : null,
      minimapBox: minimap ? (r => ({w: Math.round(r.width), h: Math.round(r.height)}))(minimap.getBoundingClientRect()) : null,
      tiles};
  });
  const png = path.join(outDir, 'r10-multi-selection-boundary-en.png');
  await page.screenshot({path: png});
  const minimapShot = path.join(outDir, 'r10-minimap-en.png');
  await page.locator('.minimap').screenshot({path: minimapShot});
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => ({pressed: [...document.querySelectorAll('[data-lab-graph] [data-node][aria-pressed="true"]')].length,
    boundaryGone: !document.querySelector('.spatial-multi-selection-group .group-boundary')}));
  const maxRight = Math.max(...sel.cards.map((c) => c.right), -Infinity);
  const underCover = sel.boundary && sel.cards.length >= 2 ? maxRight - sel.boundary.right : null;
  const tilesAre132x62 = sel.tiles.length > 0 && sel.tiles.every((t) => t.w === 132 && t.h === 62);
  const cardIs156x104 = sel.cardCss?.w === '156px' && sel.cardCss?.h === '104px';
  check('R10.selection-boundary-and-minimap-residual-reproved',
    sel.selectionCount >= 2 && !!sel.boundary && underCover > 0 && tilesAre132x62 && cardIs156x104 && after.boundaryGone,
    {note: 'shared multi-selection boundary and minimap tiles derive from the shared 132x62 card box while Labs cards are 156x104 model units',
      selection: sel, boundaryShortOfRightmostCardPx: underCover,
      minimapTilesAre132x62: tilesAre132x62, cardIs156x104Css: cardIs156x104,
      selectionCollapsesToOneAfterRelease: after,
      residualVerdict: (underCover > 0 && tilesAre132x62 && cardIs156x104)
        ? 'RESIDUAL_REPROVED_NOT_FIXED — the group boundary stops short of the right card edge and the minimap tiles keep the shared 132x62 box; geometry not duplicated in the surface'
        : 'RESIDUAL_CHANGED — re-read required',
      evidence: {
        gesture: {path: path.relative(root, png), sha256: sha256(png), bytes: require('node:fs').statSync(png).size},
        minimap: {path: path.relative(root, minimapShot), sha256: sha256(minimapShot), bytes: require('node:fs').statSync(minimapShot).size}}});
  await ctx.close();
}

/* ------------------------------------------------------------------ RESP · responsive recapture */
for (const [width, height] of [[1440, 1000], [1280, 860], [1024, 900], [1024, 800]]) {
  const {ctx, page, pageErrors} = await boot(browser, port, 'en', {width, height});
  const m = await page.evaluate(() => {
    const box = (sel) => {const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect();
      return {l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height), display: getComputedStyle(el).display}};
    const left = box('#leftPane'), center = box('#centerPane'), right = box('#rightPane'), graph = box('[data-lab-graph]');
    return {dir: document.documentElement.dir,
      overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      overflowY: Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight),
      left, center, right, graph,
      regionTops: [box('#domainLeftRegion')?.t, box('#domainContext')?.t],
      rightToggle: document.querySelectorAll('[data-pane-toggle="right"]').length,
      leftToggle: document.querySelectorAll('[data-pane-toggle="left"]').length};
  });
  const panes = [['left', m.left], ['center', m.center], ['right', m.right]]
    .filter(([, p]) => p && p.display !== 'none' && p.w > 0)
    .map(([name, p]) => ({pane: name, ...p}))
    .sort((a, b) => a.l - b.l);
  const collapsedPanes = ['left', 'center', 'right'].filter((n) => !panes.some((p) => p.pane === n));
  const overlaps = [];
  for (let i = 1; i < panes.length; i++) if (panes[i].l < panes[i - 1].r) overlaps.push([panes[i - 1].pane, panes[i].pane]);
  const fits = panes.length > 0 && panes[panes.length - 1].r <= width + 1;
  /* A collapsed pane is only deliberate if the shell offers the control that reverses it. */
  let reversible = null;
  if (collapsedPanes.length) {
    const toggles = await page.locator(`[data-pane-toggle="${collapsedPanes.includes('right') ? 'right' : 'left'}"]`).count();
    let revealed = null;
    if (toggles) {
      try {
        await page.locator(`[data-pane-toggle="${collapsedPanes.includes('right') ? 'right' : 'left'}"]`).first().click({timeout: 8000});
        await page.waitForTimeout(600);
        revealed = await page.evaluate(() => {const el = document.querySelector('#domainContext, #domainLeftRegion');
          if (!el) return {present: false};
          const r = el.getBoundingClientRect();
          return {present: true, w: Math.round(r.width), h: Math.round(r.height), rows: document.querySelectorAll('#domainContext .w03l-row').length,
            display: getComputedStyle(el).display}});
      } catch (e) { revealed = {present: false, clickError: String(e?.message || e).slice(0, 160)} }
    }
    reversible = {collapsedPanes, toggles, revealed};
  }
  const revealedOk = !reversible || (reversible.toggles > 0 && reversible.revealed?.present && (reversible.revealed?.w || 0) > 0);
  check(`RESPONSIVE.${width}x${height}-no-overflow-no-overlap`,
    m.overflowX === 0 && m.overflowY === 0 && overlaps.length === 0 && fits && m.graph && m.graph.h >= 260
    && panes.length >= 2 && revealedOk && pageErrors.length === 0,
    {...m, visiblePanes: panes.map((p) => ({pane: p.pane, l: p.l, r: p.r, w: p.w})), collapsedPanes, overlaps,
      rightmostFits: fits, graphMinHeight: 260, reversible, pageErrors});
  await ctx.close();
}

/* ------------------------------------------------------------------ I18N · RTL + LTR truth */
{
  const {ctx, page} = await boot(browser, port, 'ar', {width: 1440, height: 1000});
  const ar = await page.evaluate(() => {
    const t = (sel) => (document.querySelector(sel)?.innerText || '').replace(/\s+/g, ' ').trim();
    const surfaceText = ['#leftPane .phead', '#rightPane .phead', '.w03l-actions', '.w03l-legend', '#bottomShelf', '.toolbar'].map(t);
    const body = surfaceText.join(' | ');
    return {dir: document.documentElement.dir, lang: document.documentElement.lang,
      leftHead: t('#leftPane .phead h2'), rightHead: t('#rightPane .phead h2'),
      toolbar: t('.toolbar').slice(0, 160), actions: t('.w03l-actions').slice(0, 200),
      overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      englishCommands: /Add Task|Publish Revision|Prepare Run|Connect\b/.test(body),
      bdiTokens: document.querySelectorAll('.w03l bdi, [data-lab-graph] bdi, .w03l-head bdi').length,
      regionTops: [document.querySelector('#domainLeftRegion')?.getBoundingClientRect().top, document.querySelector('#domainContext')?.getBoundingClientRect().top]};
  });
  check('I18N.ar-rtl-first-class', ar.dir === 'rtl' && ar.lang === 'ar' && !ar.englishCommands && ar.overflowX === 0
    && /بنية/.test(ar.leftHead) && /السياق/.test(ar.rightHead) && ar.regionTops[0] === ar.regionTops[1] && ar.bdiTokens > 0, ar);
  await ctx.close();
}
{
  const {ctx, page} = await boot(browser, port, 'en', {width: 1440, height: 1000});
  const en = await page.evaluate(() => {
    const t = (sel) => (document.querySelector(sel)?.innerText || '').replace(/\s+/g, ' ').trim();
    const sels = ['#leftPane .phead', '#rightPane .phead', '.w03l-actions', '.w03l-legend', '.w03l-foot', '#bottomShelf', '.toolbar'];
    const surfaces = sels.map((s) => ({sel: s, text: t(s)}));
    const arabic = /[\u0600-\u06FF]/;
    return {dir: document.documentElement.dir, lang: document.documentElement.lang,
      arabicInSurfaceChrome: surfaces.filter((s) => arabic.test(s.text)).map((s) => ({sel: s.sel, text: s.text.slice(0, 120)})),
      leftHead: t('#leftPane .phead h2'), actions: t('.w03l-actions').slice(0, 200),
      overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      regionTops: [document.querySelector('#domainLeftRegion')?.getBoundingClientRect().top, document.querySelector('#domainContext')?.getBoundingClientRect().top]};
  });
  check('I18N.en-ltr-first-class', en.dir === 'ltr' && en.lang === 'en' && en.arabicInSurfaceChrome.length === 0
    && en.overflowX === 0 && /Lab Structure/.test(en.leftHead) && en.regionTops[0] === en.regionTops[1], en);
  await ctx.close();
}

/* ------------------------------------------------------- N1/N1b · non-owned route refusal */
{
  const ctx = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?surface=library`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => !!window.CEPFoundation, null, {timeout: 30000});
  await page.waitForTimeout(1500);
  const before = await exec(page, `JSON.stringify({consumer:document.body.dataset.consumer,labGraph:document.querySelectorAll('[data-lab-graph]').length,labShell:document.querySelectorAll('.w03l').length})`);
  const attempt = await exec(page, `(()=>{try{const r=window.CEPFoundation?.commandBus?.execute('labs.author',{title:'N1 probe'});return {returned:true,ok:r?.ok??null,code:r?.code??null,reason:r?.reason??null,owner:r?.owner??null}}catch(e){return {returned:false,threw:String(e.message).slice(0,160)}}})()`);
  const after = await exec(page, `JSON.stringify({consumer:document.body.dataset.consumer,labGraph:document.querySelectorAll('[data-lab-graph]').length,labShell:document.querySelectorAll('.w03l').length})`);
  const b = JSON.parse(before), a = JSON.parse(after);
  const at = typeof attempt === 'string' ? JSON.parse(attempt) : attempt;
  check('N1.non-owned-route-labs-mutation-refused',
    b.consumer === 'library' && b.labGraph === 0 && at.returned === true && at.ok === false && a.labGraph === 0 && a.labShell === 0 && a.consumer === 'library',
    {route: '/?surface=library', attempt: at, before: b, after: a,
      oracle: 'labs command is not registered off its own route → execute() must refuse; no labs composition may mount as a side effect'});
  await ctx.close();
}
{
  const {ctx, page} = await boot(browser, port, 'labs', {width: 1440, height: 1000});
  const nodesBefore = await page.locator('[data-lab-graph] g[data-node]').count();
  const attempt = await exec(page, `(()=>{try{const r=window.CEPFoundation?.commandBus?.execute('scenarios.author',{op:'addPhase',phase:{id:'n1',name:'n1',elements:[]}});return {returned:true,ok:r?.ok??null,code:r?.code??null,reason:r?.reason??null}}catch(e){return {returned:false,threw:String(e.message).slice(0,160)}}})()`);
  const nodesAfter = await page.locator('[data-lab-graph] g[data-node]').count();
  const at = typeof attempt === 'string' ? JSON.parse(attempt) : attempt;
  check('N1b.non-owned-command-on-labs-route-refused',
    at.returned === true && at.ok === false && nodesBefore === nodesAfter,
    {route: '/?surface=labs', attempt: at, nodesBefore, nodesAfter,
      oracle: 'a command owned by another surface must not execute on the labs route and must not mutate labs state'});
  await ctx.close();
}

/* ------------------------------------------- N3 · no provider/prerequisite → never fabricated */
{
  const {ctx, page} = await boot(browser, port, 'labs', {width: 1440, height: 1000});
  const n3 = await exec(page, `(()=>{
    const bus=window.CEPFoundation.commandBus;
    const noProvider={tools:{}};
    const av=bus.availability('labs.handoff',noProvider);
    const exec1=bus.execute('labs.handoff',noProvider);
    const pre=bus.execute('labs.preflight',noProvider);
    const receipts=bus.receipts.length;
    const statusText=(document.querySelector('.w03l-status')?.innerText||'').replace(/\\s+/g,' ').trim();
    const bottom=(document.querySelector('#bottomShelf')?.innerText||'').replace(/\\s+/g,' ').trim();
    return {lifecycle:window.CEPFoundation?.m0Composition?undefined:undefined,
      handoffAvailability:av, handoffExecute:exec1,
      preflightStatus:pre?.status, preflightRunStartAllowed:pre?.runStartAllowed,
      preflightChecks:(pre?.checks||[]).map(c=>({id:c.id,status:c.status,source:c.source})),
      runCreated:exec1?.runCreated??null, receiptsAfterNoOpExec:receipts,
      statusText, bottom};
  })()`);
  check('N3.no-prerequisite-no-fabricated-run',
    n3.handoffAvailability?.enabled === false && !!n3.handoffAvailability?.reason && n3.handoffExecute?.ok === false
    && n3.preflightRunStartAllowed !== true && n3.runCreated !== true && n3.handoffExecute?.mutated !== true,
    {oracle: 'without provider/prerequisite the command is unavailable with an explicit reason; no run, manifest or receipt is invented',
      statusClaimsNoRunStarted: /no run started/i.test(n3.statusText + ' ' + n3.bottom),
      ...n3});
  await ctx.close();
}

/* -------------------------------------------------- N2 · boundary/invalid input, no false receipt */
{
  const {ctx, page} = await boot(browser, port, 'labs', {width: 1440, height: 1000});
  const n2 = await exec(page, `(()=>{
    const bus=window.CEPFoundation.commandBus;
    const out={};
    const receipts0=bus.receipts.length;
    const nodes0=document.querySelectorAll('[data-lab-graph] g[data-node]').length;
    try{bus.execute('labs.author',{fieldOutOfScope:1});out.outOfScope={returned:true}}
    catch(e){out.outOfScope={returned:false,message:String(e.message).slice(0,160)}}
    const receipts1=bus.receipts.length;
    const nodes1=document.querySelectorAll('[data-lab-graph] g[data-node]').length;
    try{bus.execute('labs.author',{op:'connect',edge:{id:'X',from:'TASK-1',to:'TASK-1'}});out.selfEdge={returned:true}}
    catch(e){out.selfEdge={returned:false,message:String(e.message).slice(0,160)}}
    const receipts2=bus.receipts.length;
    const invalid=bus.execute('labs.author',{tasks:[{id:'TASK-1',title:'Observe',validation:'UNBOUND',expectedSignal:''}]});
    out.invalidAuthor={ok:invalid?.ok??null,snapshotLifecycle:invalid?.snapshot?.lifecycle??null};
    const av=bus.availability('labs.publish',{});
    out.publishAvailability=av;
    const pub=bus.execute('labs.publish',{});
    out.publishExecute={ok:pub?.ok??null,code:pub?.code??null,errors:(pub?.errors||av?.errors||[]).slice(0,6)};
    out.receiptsDelta=bus.receipts.length-receipts0;
    out.nodesDelta=[nodes0,nodes1,document.querySelectorAll('[data-lab-graph] g[data-node]').length];
    out.receiptsAfterThrows=[receipts0,receipts1,receipts2];
    return out;
  })()`);
  const exactId = (n2.publishExecute?.errors || []).some((e) => /TASK-1:(validation-required|expected-signal-required)/.test(e));
  check('N2.invalid-input-explicit-error-no-false-receipt',
    n2.outOfScope.returned === false && /LAB_FIELD_OUT_OF_SCOPE/.test(n2.outOfScope.message || '')
    && n2.selfEdge.returned === false && /LAB_EDGE_ENDPOINTS_INVALID/.test(n2.selfEdge.message || '')
    && n2.receiptsAfterThrows[0] === n2.receiptsAfterThrows[1] && n2.receiptsAfterThrows[1] === n2.receiptsAfterThrows[2]
    && n2.publishExecute?.ok === false && exactId && n2.publishExecute?.code === 'LAB_VALIDATION_REQUIRED_BEFORE_PUBLISH',
    {oracle: 'out-of-scope field and invalid dependency fail loudly without mutating; invalid task reports the exact task id; publish refuses instead of faking a receipt',
      ...n2, exactTaskIdReported: exactId});
  await ctx.close();
}

/* ------------------------------- N2-fs · capture instrument boundary (label traversal refusal) */
{
  const evidenceRoot = path.join(root, 'writer-output/W03-LABS/evidence');
  const target = path.join(root, 'writer-output/W03-LABS/n2-escape-probe');
  /* what an unsanitised label would have resolved to — computed, never written */
  const preGuardPath = path.resolve(evidenceRoot, '../n2-escape-probe');
  const preGuardEscapes = !preGuardPath.startsWith(evidenceRoot + path.sep);
  const run = spawnSync(process.execPath, [path.join(root, 'writer-output/W03-LABS/capture.mjs'),
    '--label', '../n2-escape-probe', '--viewports', '640x480', '--locales', 'en'],
    {cwd: root, encoding: 'utf8', timeout: 180000});
  const output = String(run.stdout || '') + String(run.stderr || '');
  const refused = run.status === 2 && /LABEL_REFUSED/.test(output);
  const escaped = require('node:fs').existsSync(target);
  check('N2.capture-label-traversal-refused', preGuardEscapes && refused && !escaped, {
    oracle: 'an out-of-boundary capture label must be refused before anything is created — no write outside evidence/, no false receipt',
    preGuardResolution: {label: '../n2-escape-probe', resolvesTo: preGuardPath, escapesEvidenceRoot: preGuardEscapes},
    attempt: {exitCode: run.status, refused, message: output.split('\n').filter((l) => l.includes('LABEL_REFUSED')).join(' ').slice(0, 200)},
    artifactsOutsideEvidenceRoot: escaped ? [path.relative(root, target)] : []});
}

/* --------------------------------------------------------------- DONOR · supporting check */
{
  const {ctx, page} = await boot(browser, port, 'en', {width: 1505, height: 1045});
  const d = await page.evaluate(() => {
    const vis = (el) => {if (!el) return false; const r = el.getBoundingClientRect(); const c = getComputedStyle(el);
      return !el.hidden && r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'};
    const q = (s) => {const el = document.querySelector(s); return {present: !!el, visible: vis(el)}};
    return {structurewrap: q('.structurewrap'), kuList: q('#kuList'), editorDocument: q('#editorDocument'),
      m0DomainNav: q('#leftPane .pbody .m0-domain-nav'),
      rightSiblings: [...document.querySelectorAll('#rightPane .pbody > :not(#domainContext)')].filter(vis).length,
      leftSiblings: [...document.querySelectorAll('#leftPane .pbody > :not(#domainLeftRegion)')].filter(vis).length};
  });
  const visibleDonors = ['structurewrap', 'kuList', 'editorDocument', 'm0DomainNav'].filter((k) => d[k].visible);
  check('DONOR.no-visible-donor-leak', visibleDonors.length === 0 && d.rightSiblings === 0 && d.leftSiblings === 0,
    {...d, visibleDonors});
  await ctx.close();
}

await browser.close();
server.kill();

const git = (c) => {try {return spawnSync('git', [c.split(' ')[0], ...c.split(' ').slice(1)], {cwd: root, encoding: 'utf8'}).stdout.trim()} catch {return 'UNKNOWN'}};
const commit = spawnSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).stdout.trim();
const labDiff = spawnSync('git', ['status', '--porcelain', '--', 'stack/native-typescript/surfaces/labs', 'stack/native-typescript/adapters/labs'], {cwd: root, encoding: 'utf8'}).stdout.trim();
const passed = checks.filter((c) => c.pass).length;
const report = {
  proof: 'W03-LABS-POSTFIX-PROOF', lane: 'LAB-1', classification: 'CANDIDATE_ONLY_NOT_OWNER_ACCEPTED',
  siteRoot, commit, writableRootDiff: labDiff, node: process.version,
  startedAt, ranAt: new Date().toISOString(),
  total: checks.length, passed, failed: checks.length - passed,
  failures: checks.filter((c) => !c.pass).map((c) => c.id),
  checks,
};
await writeFile(path.join(root, 'writer-output/W03-LABS/POSTFIX_PROOF.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({total: report.total, passed, failed: report.failed, failures: report.failures}, null, 2));
process.exit(report.failed === 0 ? 0 : 1);
