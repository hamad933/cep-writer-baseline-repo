/**
 * CLOSURE-T3 proof probes — R-02 (HS-REL-1-03 live locale flip), R-05 (D-04/D-06/D-08/F-SH1-02/B-4).
 * Method: free-port dist server (tools/serve.mjs) + cached Playwright Chromium; plus Node-side unit
 * rendering of dist/foundation/spatial/presentation.js (pure module). Read-only: no product mutation
 * beyond in-page UI interaction; canonical store untouched by these probes.
 *   node writer-output/_coordinator/closure-T3/t3-probes.mjs
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const rows = [];
const run = async (id, fn) => {
  try { const detail = await fn(); rows.push({ id, status: 'PASS', detail: detail ?? true }); }
  catch (error) { rows.push({ id, status: 'FAIL', error: String(error?.stack || error).slice(0, 900) }); }
};

/* ============================================================ unit renders (D-04 / D-06) */
const { renderSpatialNode, spatialShellMarkup } = await import(
  new URL(`file://${path.join(repo, 'dist/foundation/spatial/presentation.js')}`).href);

await run('D-04.unit.status-chip-owns-second-baseline', () => {
  const html = renderSpatialNode({
    node: { id: 'KU-2026-VERY-LONG-IDENTIFIER-FOR-COLLISION', label: 'Some node label', x: 0, y: 0, status: 'UP' }
  });
  const statusChip = html.match(/<g class="node-status-chip"[^>]*>[\s\S]*?<\/g>/);
  assert(statusChip, 'status chip missing for short status');
  assert(/<text x="40" y="46"/.test(statusChip[0]), 'status text must sit on the second baseline (y=46)');
  assert(/cy="42\.5"/.test(statusChip[0]), 'status dot must sit on the second baseline row');
  assert(!/y="21"/.test(statusChip[0]), 'status chip must not share the id baseline (y=21)');
  const card = html.slice(html.indexOf('<g class="spatial-node-card'));
  const y21 = card.match(/y="21"/g) || [];
  // row y=21 hosts exactly the icon glyph (x=18) and the id chip (x=31) — never a third anchor
  assert.equal(y21.length, 2, `expected exactly two y=21 anchors (icon glyph + id chip), got ${y21.length}`);
  const idChip = card.match(/<text class="node-id-chip"[^>]*y="21"/);
  assert(idChip, 'id chip must remain on row y=21');
  return { idChipY: 21, statusChipY: 46, y21Anchors: y21.length };
});

await run('D-04.unit.id-chip-ellipsized-with-full-tooltip', () => {
  const full = 'KU-2026-VERY-LONG-IDENTIFIER-FOR-COLLISION';
  const html = renderSpatialNode({ node: { id: full, label: 'x', x: 0, y: 0 } });
  const idText = html.match(/<text class="node-id-chip"[\s\S]*?<\/text>/)[0];
  const visible = idText.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<[^>]+>/g, '');
  assert(!visible.includes(full), 'long id must be ellipsized in the visible text');
  assert(visible.includes('…'), 'ellipsized id must carry …');
  assert(idText.includes(`<title>${full}</title>`), 'full id tooltip missing');
  assert(visible.length <= 19, `id chip glyphs ${visible.length} > 19 budget`);
  return { glyphs: visible.length, tooltip: true };
});

await run('D-06.unit.node-title-ellipsis-plus-full-value-tooltip', () => {
  const full = 'A very long node title that certainly exceeds the ninety six pixel budget for the card';
  const html = renderSpatialNode({ node: { id: 'N1', label: full, x: 0, y: 0 } });
  const title = html.match(/<text class="node-title"[^>]*>([\s\S]*?)<\/text>/)[1];
  assert(title.endsWith('…'), 'title must be ellipsized');
  assert(title.length <= 14, `title glyphs ${title.length} > 14 budget`);
  assert(html.includes(`<title>${full}</title>`) || html.includes(`<title>${full.replace(/&/g, '&amp;')}</title>`), 'full-value <title> tooltip missing');
  const short = renderSpatialNode({ node: { id: 'N2', label: 'Short title', x: 0, y: 0 } });
  assert(short.includes('>Short title</text>'), 'short title must stay intact');
  assert(!short.includes('<title>Short title</title>'), 'no tooltip for non-truncated title');
  return { truncatedGlyphs: title.length, tooltip: true, shortIntact: true };
});

await run('D-04.unit.subtitle-case.chip-suppressed-status-carried-in-aria', () => {
  const html = renderSpatialNode({ node: { id: 'N3', label: 'L', x: 0, y: 0, status: 'UP', subtitle: 'Type: Web Application' } });
  assert(!html.includes('node-status-chip'), 'chip must be suppressed when subtitle owns row 46');
  assert(html.includes('aria-label="L UP"'), 'status must remain carried in the card aria-label');
  assert(html.includes('Type: Web Application'), 'subtitle must render on row 46');
  return { chip: false, ariaCarriesStatus: true, subtitleRendered: true };
});

await run('D-08.unit.readout-anchor-and-no-baked-direction-in-spatial-diff', async () => {
  const { execSync } = await import('node:child_process');
  const diff = execSync('git diff -- stack/native-typescript/foundation/spatial', { cwd: repo, encoding: 'utf8' });
  const added = diff.split('\n')
    .filter(l => l.startsWith('+') && !l.startsWith('+++'))
    .map(l => l.replace(/\/\*[\s\S]*?\*\//g, ''))          // strip added comments (prose may cite the defect)
    .filter(l => l.trim());
  const badDir = added.filter(l => /direction:\s*(ltr|rtl)\b|setAttribute\('dir','(ltr|rtl)'\)/.test(l));
  assert.equal(badDir.length, 0, `baked direction added: ${badDir.join(' | ')}`);
  assert(added.some(l => /direction:inherit/.test(l)), 'readout must inherit container direction');
  const shell = spatialShellMarkup('x');
  assert(shell.includes('data-spatial-readout'), 'readout must carry the override anchor attribute');
  return { bakedDirectionAdds: 0, inheritAdded: true, readoutAnchor: true };
});

/* ============================================================ live product probes */
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort();
const server = spawn(process.execPath, [path.join(repo, 'tools/serve.mjs'), '--port', String(port)], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
const base = `http://127.0.0.1:${port}`;
for (let i = 0; i < 120; i++) { try { if ((await fetch(base + '/')).ok) break; } catch {} ; await new Promise(r => setTimeout(r, 100)); }

const browser = await chromium.launch({ headless: true });
mkdirSync(here, { recursive: true });

const newPage = async viewport => {
  const ctx = await browser.newContext({ viewport });
  return { ctx, page: await ctx.newPage() };
};
const waitReady = async (page, surface) => {
  await page.goto(`${base}/index.html?surface=${surface}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForFunction(() => !!window.CEPFoundation?.workspace, null, { timeout: 20000 });
  await page.waitForTimeout(900);
};
const timeOrigin = page => page.evaluate(() => performance.timeOrigin);
const openSettings = async page => {
  await page.evaluate(() => document.querySelector('[data-foundation-command="foundation.settings"]')?.click());
  // stable wait: the panel re-renders on open; require BOTH locale buttons present and steady
  const deadline = Date.now() + 8000;
  let count = -1;
  while (Date.now() < deadline) {
    count = await page.evaluate(() => document.querySelectorAll('[data-settings-preference="locale"]').length);
    if (count === 2) { await page.waitForTimeout(250);
      const again = await page.evaluate(() => document.querySelectorAll('[data-settings-preference="locale"]').length);
      if (again === 2) return; }
    await page.waitForTimeout(150);
  }
  const dump = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    buttons: [...document.querySelectorAll('[data-settings-preference="locale"]')].length,
    panel: (document.querySelector('.settings-center') || document.querySelector('[data-settings-host]') || {}).outerHTML?.slice(0, 600) || null
  }));
  throw new Error('settings locale controls did not stabilise: ' + JSON.stringify(dump));
};
const setLocale = async (page, value) => {
  let last = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    last = await page.evaluate(v => {
      const btns = [...document.querySelectorAll('[data-settings-preference="locale"]')];
      const btn = btns.find(b => b.getAttribute('data-settings-value') === v);
      if (!btn) return { found: false, available: btns.map(b => b.getAttribute('data-settings-value')) };
      btn.click();
      return { found: true };
    }, value);
    if (last.found) { await page.waitForTimeout(550); return; }
    await page.waitForTimeout(300);
  }
  assert.fail(`locale option missing: ${value} — ${JSON.stringify(last)}`);
};
const closeSettings = async page => { await page.keyboard.press('Escape'); await page.waitForTimeout(400); };
const readShelf = page => page.evaluate(() => ({
  lang: document.documentElement.lang,
  dir: document.documentElement.dir,
  summary: (document.querySelector('#bottomSummary') || {}).textContent || null,
  title: (document.querySelector('#bottomShelf .bottomtitle') || {}).textContent || null,
  paneLabel: (document.querySelector('[data-pane-toggle-label]') || {}).textContent || null,
  paneToggle: document.querySelector('[data-pane-toggle="left"]')?.getAttribute('aria-label') || null
}));

const AR = s => s && /[؀-ۿ]/.test(s);
const EN = s => s && !/[؀-ۿ]/.test(s) && /[A-Za-z]/.test(s);

await run('R-02.HS-REL-1-03.live-locale-flip-updates-mounted-shelf-without-reload', async () => {
  const { ctx, page } = await newPage({ width: 1440, height: 1000 });
  await waitReady(page, 'library');
  const origin0 = await timeOrigin(page);
  const ws0 = await page.evaluate(() => JSON.stringify(Object.keys(window.CEPFoundation.workspace)));
  const initial = await readShelf(page);
  await openSettings(page);
  await setLocale(page, initial.lang === 'ar' ? 'en' : 'ar');
  const afterA = await readShelf(page);
  // product behaviour: the settings panel closes itself after a locale change (observed) — reopen for the flip back
  const reopened = await page.evaluate(() => document.querySelectorAll('[data-settings-preference="locale"]').length);
  if (reopened < 2) await openSettings(page);
  await setLocale(page, initial.lang === 'ar' ? 'ar' : 'en');
  const afterB = await readShelf(page);
  await closeSettings(page);
  const origin1 = await timeOrigin(page);
  const ws1 = await page.evaluate(() => JSON.stringify(Object.keys(window.CEPFoundation.workspace)));
  assert.equal(origin0, origin1, 'page reloaded during flip (timeOrigin changed)');
  assert.equal(ws0, ws1, 'workspace identity changed => reload');
  const flippedTo = initial.lang === 'ar' ? 'en' : 'ar';
  const panelSelfClosedAfterLocaleChange = reopened < 2;
  assert.equal(afterA.lang, flippedTo, `lang not flipped live: ${afterA.lang}`);
  assert.equal(afterB.lang, initial.lang, `lang not flipped back: ${afterB.lang}`);
  const expect = (snap, lang, tag) => {
    if (lang === 'en') {
      assert(EN(snap.summary), `${tag} summary not EN: ${snap.summary}`);
      assert(EN(snap.title), `${tag} title not EN: ${snap.title}`);
      assert(EN(snap.paneLabel), `${tag} pane label not EN: ${snap.paneLabel}`);
      assert(EN(snap.paneToggle) || (snap.paneToggle || '').includes('structure'), `${tag} pane toggle aria not EN: ${snap.paneToggle}`);
    } else {
      assert(AR(snap.summary), `${tag} summary not AR: ${snap.summary}`);
      assert(AR(snap.title), `${tag} title not AR: ${snap.title}`);
      assert(AR(snap.paneLabel), `${tag} pane label not AR: ${snap.paneLabel}`);
      assert(AR(snap.paneToggle), `${tag} pane toggle aria not AR: ${snap.paneToggle}`);
    }
  };
  expect(afterA, flippedTo, 'flip-A');
  expect(afterB, initial.lang, 'flip-B');
  await page.screenshot({ path: path.join(here, 'flip-after.png') });
  await ctx.close();
  return { initial, afterA, afterB, reload: false, panelSelfClosedAfterLocaleChange };
});

await run('R-05.D-08.readout-follows-direction.no-baked-ltr', async () => {
  const { ctx, page } = await newPage({ width: 1440, height: 1000 });
  await waitReady(page, 'enterprise');
  const readout = () => page.evaluate(() => {
    const el = document.querySelector('.spatial-readout');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const host = el.parentElement.getBoundingClientRect();
    return { docDir: document.documentElement.dir, direction: cs.direction, inlineStart: cs.insetInlineStart,
      gapLeft: Math.round(r.left - host.left), gapRight: Math.round(host.right - r.right) };
  });
  const en = await readout();
  assert(en, 'readout not found on enterprise');
  assert.equal(en.direction, 'ltr', `EN readout direction ${en.direction}`);
  assert.equal(en.inlineStart, '14px', `EN inline-start ${en.inlineStart}`);
  assert(en.gapLeft < en.gapRight, `EN must anchor to inline-start(left): ${JSON.stringify(en)}`);
  await openSettings(page);
  const lang0 = await page.evaluate(() => document.documentElement.lang);
  await setLocale(page, lang0 === 'ar' ? 'en' : 'ar');
  const ar = await readout();
  assert.equal(ar.docDir, 'rtl', 'AR flip must set document dir rtl');
  assert.equal(ar.direction, 'rtl', `AR readout must follow container direction, got ${ar.direction} (baked ltr?)`);
  assert.equal(ar.inlineStart, '14px', `AR inline-start ${ar.inlineStart}`);
  assert(ar.gapRight < ar.gapLeft, `AR must mirror to inline-start(right): ${JSON.stringify(ar)}`);
  await closeSettings(page);
  await page.screenshot({ path: path.join(here, 'd08-ar.png') });
  await ctx.close();
  return { en, ar };
});

await run('R-05.D-06.DOM.node-title-measured-within-card-budget', async () => {
  const { ctx, page } = await newPage({ width: 1440, height: 1000 });
  await waitReady(page, 'enterprise');
  const titles = await page.evaluate(() => [...document.querySelectorAll('.spatial-node-card .node-title')].map(t => ({
    text: t.textContent,
    px: Math.round(t.getComputedTextLength ? t.getComputedTextLength() : -1),
    tooltip: t.closest('[data-node]')?.querySelector(':scope > title')?.textContent || null
  })));
  assert(titles.length > 0, 'no node titles on enterprise');
  const budget = 132 - 31 - 4; // card 132 minus title x 31 minus padding
  const over = titles.filter(t => t.px > budget);
  assert.equal(over.length, 0, `titles over budget: ${JSON.stringify(over.slice(0, 3))}`);
  const truncated = titles.filter(t => t.text.endsWith('…'));
  const tooltipsOk = truncated.every(t => t.tooltip && t.tooltip.length > t.text.length);
  assert(tooltipsOk, `truncated titles must carry full-value tooltip: ${JSON.stringify(truncated.filter(t => !(t.tooltip && t.tooltip.length > t.text.length)).slice(0,2))}`);
  await ctx.close();
  return { count: titles.length, budgetPx: budget, truncated: truncated.length, maxPx: Math.max(...titles.map(t => t.px)) };
});

await run('R-05.D-04.DOM.status-chips-do-not-overlap-id', async () => {
  const { ctx, page } = await newPage({ width: 1440, height: 1000 });
  const surfaces = ['enterprise', 'visualize', 'labs', 'scenarios'];
  const report = {};
  for (const s of surfaces) {
    await waitReady(page, s);
    report[s] = await page.evaluate(() => {
      const overlaps = [];
      let chips = 0;
      for (const card of document.querySelectorAll('.spatial-node-card')) {
        const id = card.querySelector('.node-id-chip');
        const status = card.querySelector('.node-status-chip');
        if (!id || !status) continue;
        chips++;
        const a = id.getBoundingClientRect(), b = status.getBoundingClientRect();
        const hit = !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
        if (hit) overlaps.push({ id: id.textContent.slice(0, 24), status: status.textContent.slice(0, 24) });
      }
      return { chips, overlaps };
    });
    assert.equal(report[s].overlaps.length, 0, `${s} id/status overlap: ${JSON.stringify(report[s].overlaps)}`);
  }
  await ctx.close();
  return report;
});

await run('R-05.F-SH1-02.real-dblclick-on-covered-label-opens-composer@1024', async () => {
  const { ctx, page } = await newPage({ width: 1024, height: 900 });
  // SH-1's own capture surface: enterprise (shared re-hosted SpatialView keeps central callbacks.relation)
  let surface = null;
  for (const s of ['enterprise', 'visualize', 'shell', 'library']) {
    await waitReady(page, s);
    const n = await page.evaluate(() => document.querySelectorAll('.relation-label').length);
    if (n > 0) { surface = s; break; }
  }
  assert(surface, 'no surface with relation labels found');
  const labels = await page.evaluate(() => [...document.querySelectorAll('.relation-label')]
    .map((el, i) => { const r = el.getBoundingClientRect();
      return { i, visible: r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden', x: r.x + r.width / 2, y: r.y + r.height / 2, text: (el.textContent || '').slice(0, 40) }; })
    .filter(l => l.visible));
  assert(labels.length > 0, `no visible relation labels at 1024x900 on ${surface}`);
  const attempts = [];
  for (const label of labels.slice(0, 4)) {
    const covered = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return { topClass: el?.getAttribute?.('class') || el?.tagName, isLabel: !!el?.closest?.('[data-relation-label]') };
    }, label);
    await page.mouse.dblclick(label.x, label.y);
    await page.waitForTimeout(450);
    const composerOpen = await page.evaluate(() => {
      // shared RelationInteraction composer (section.relation-composer) OR enterprise form[data-relation-composer]
      const shared = document.querySelector('.relation-composer');
      const sharedOpen = !!shared && !shared.hidden && getComputedStyle(shared).display !== 'none';
      const form = document.querySelector('form[data-relation-composer]');
      const formOpen = !!form && form.isConnected;
      return sharedOpen || formOpen;
    });
    attempts.push({ text: label.text, covered, composerOpen });
    if (composerOpen) { await page.screenshot({ path: path.join(here, 'fsh102-composer.png') }); break; }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
  }
  const ok = attempts.some(a => a.composerOpen);
  assert(ok, `no composer opened: ${JSON.stringify(attempts)}`);
  await ctx.close();
  return { surface, labelCount: labels.length, attempts };
});

await run('R-05.B-4.trace-structure-row-does-not-feed-spatial-kernel-out-of-root', async () => {
  const { ctx, page } = await newPage({ width: 1440, height: 1000 });
  await waitReady(page, 'enterprise');
  const before = await page.evaluate(() => (document.querySelector('.spatial-readout') || {}).textContent || null);
  const row = await page.evaluate(() => {
    const btn = document.querySelector('[data-object]');
    if (!btn) return null;
    btn.click();
    return btn.dataset.object;
  });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => ({
    readout: (document.querySelector('.spatial-readout') || {}).textContent || null,
    context: (document.querySelector('[data-enterprise-status]') || document.querySelector('.ent-context') || {}).textContent || null
  }));
  await ctx.close();
  assert(row, 'no enterprise structure row found');
  const readoutChanged = after.readout !== before;
  return {
    structureRow: row, readoutBefore: before, readoutAfter: after.readout, contextAfter: (after.context || '').slice(0, 120),
    readoutChanged,
    verdict: readoutChanged ? 'SYNC_ALREADY_PRESENT' : 'OUT_OF_ROOT_STOP__surfaces/enterprise/presentation.ts:613 enterprise.inspect does not call spatial.model.select; readout source foundation/spatial.ts:34,40'
  };
});

await browser.close();
server.kill('SIGTERM');

const receipt = {
  schema: 'CLOSURE-T3_PROBES@1',
  classification: 'CANDIDATE_ONLY__NOT_OWNER_ACCEPTANCE',
  command: 'node writer-output/_coordinator/closure-T3/t3-probes.mjs',
  generatedAt: new Date().toISOString(),
  rows,
  summary: { total: rows.length, pass: rows.filter(r => r.status === 'PASS').length, fail: rows.filter(r => r.status === 'FAIL').length }
};
writeFileSync(path.join(here, 'T3_PROBE_RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ summary: receipt.summary, failed: rows.filter(r => r.status !== 'PASS') }, null, 1));
if (receipt.summary.fail) process.exitCode = 1;
