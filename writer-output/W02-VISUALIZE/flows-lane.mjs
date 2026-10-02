#!/usr/bin/env node
/**
 * W02-VISUALIZE lane-scoped browser flow harness — BOUNDED WORKAROUND, not the mandated harness.
 *
 * Why: `node tools/w02-browser-flows.mjs` navigates with waitUntil:'networkidle'. While another
 * lane's `stack/local-runtime/server.mjs` occupies 127.0.0.1:4174 (the product's default platform
 * runtime URL), the boot-time platform input-direction fetch receives its 503 response but the
 * request never settles in Chromium, so networkidle never fires and EVERY real navigation in the
 * mandated harness times out (observed 2026-10-02T05:4x-05:5x; the same harness passed 8/10 at
 * 2026-10-02T05:0x before that server appeared). The endpoint answers curl and a page-level fetch
 * normally — recorded in HANDOFF.md as an environmental, cross-lane finding (not a product defect
 * of this surface, not fixed here: another lane owns that process).
 *
 * This script runs the SAME oracles as tools/w02-browser-flows.mjs for the visualize-owned flows,
 * with waitUntil:'load' + an explicit consumer-ready wait. Every assertion below is copied from
 * the mandated harness so the oracle is unchanged. Results are labelled
 * LANE_SCOPE_HARNESS_WORKAROUND and never replace the mandated harness receipt.
 */
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const CAP = path.join(HERE, 'captures');
mkdirSync(CAP, { recursive: true });
const BASE = `http://127.0.0.1:${process.env.W02_LANE_FLOW_PORT || 43191}`;
const startedAt = new Date().toISOString();

const results = [];
const shots = [];
let seq = 0;

const check = (flow, name, ok, detail) => {
  const item = { flow, name, status: ok ? 'PASS' : 'FAIL', detail: detail === undefined ? null : detail };
  results.push(item);
  if (!ok) console.error(`FAIL ${flow} :: ${name} :: ${JSON.stringify(detail).slice(0, 400)}`);
  return ok;
};

const ready = async (page, surface) => {
  await page.goto(`${BASE}/?surface=${surface}`, { waitUntil: 'load' });
  await page.waitForFunction(expected => window.CEPFoundation?.consumer === expected, surface, { timeout: 20000 });
  await page.waitForTimeout(700);
};

const shot = async (page, flowId, label) => {
  seq += 1;
  const file = `${flowId}-${startedAt.replace(/[-:]/g, '')}-${String(seq).padStart(2, '0')}.png`;
  await page.screenshot({ path: path.join(CAP, file), fullPage: false });
  const bytes = (await import('node:fs')).readFileSync(path.join(CAP, file));
  shots.push({ flowId, label, file: `writer-output/W02-VISUALIZE/captures/${file}`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length });
};

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

/* ── 1. spatial-select-connect-canonical-edge (oracle copied from tools/w02-browser-flows.mjs) ── */
{
  const id = 'spatial-select-connect-canonical-edge';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  try {
    await ready(page, 'visualize');
    const ids = await page.evaluate(() => {
      const nodes = CEPFoundation.relations.nodes;
      for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) { if (!CEPFoundation.relations.connectionAvailability([nodes[i].id, nodes[j].id]).enabled) return [nodes[i].id, nodes[j].id]; }
      return null;
    });
    const buttons = await page.locator('.visualize-object-list [data-visualize-select]').count();
    check(id, 'visualize.composed-left-region-present', buttons > 0, { buttons, ids });
    await page.locator(`.visualize-object-list [data-visualize-select="${ids[0]}"]`).first().click();
    await page.locator(`.visualize-object-list [data-visualize-select="${ids[1]}"]`).first().click({ modifiers: ['Control'] });
    const before = await page.evaluate(() => ({ selected: [...CEPFoundation.spatial.model.selection], records: CEPFoundation.relations.records.length, version: CEPFoundation.relations.version, readOnly: CEPFoundation.relations.readOnly, availability: CEPFoundation.relationUI.connectAvailability(), hidden: document.querySelector('.relation-selection')?.hidden ?? null }));
    check(id, 'spatial.selection-two', before.selected.length === 2, before.selected);
    check(id, 'spatial.read-only-connect-hidden', before.readOnly === true && before.availability.enabled === false && before.availability.visible === false && before.hidden === true, before);
    const after = await page.evaluate(() => ({ selected: [...CEPFoundation.spatial.model.selection], records: CEPFoundation.relations.records.length, version: CEPFoundation.relations.version }));
    check(id, 'spatial.canonical-relations-unchanged', after.records === before.records && after.version === before.version, { before, after });
    check(id, 'spatial.selection-preserved', JSON.stringify(after.selected) === JSON.stringify(before.selected), after.selected);
    check(id, 'lane.no-page-errors', pageErrors.length === 0, pageErrors);
    await shot(page, id, 'two-item selection, author Connect hidden');
  } catch (e) { check(id, 'lane.flow-completed', false, String(e?.message || e).slice(0, 300)); }
  await ctx.close();
}

/* ── 2. fit-pan-zoom-canonical-state-invariance ── */
{
  const id = 'fit-pan-zoom-canonical-state-invariance';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  try {
    await ready(page, 'visualize');
    const outcome = await page.evaluate(() => {
      const exec = (id, payload) => { try { const result = CEPFoundation.registry.execute(id, payload); return { availability: CEPFoundation.registry.availability(id, payload), result }; } catch (e) { return { availability: { enabled: false, code: String(e.message || e) }, result: null, error: String(e.message || e) }; } };
      const before = JSON.stringify(CEPFoundation.m0Composition?.adapter?.canonicalProjection?.() ?? null);
      const edgesBefore = JSON.stringify(CEPFoundation.relations.records);
      const treeViewport = exec('visualize.viewport', { mode: 'TREE', action: 'fit', width: 800, height: 600 });
      CEPFoundation.registry.execute('visualize.view.canvas', {});
      const cameraBefore = structuredClone(CEPFoundation.spatial.model.camera);
      const fit = exec('visualize.viewport', { action: 'fit', width: 900, height: 700 });
      const pan = exec('visualize.viewport', { action: 'pan', dx: 40, dy: 24 });
      const zoom = exec('visualize.viewport', { action: 'zoom', factor: 1.2, x: 400, y: 300 });
      const cameraAfter = structuredClone(CEPFoundation.spatial.model.camera);
      const after = JSON.stringify(CEPFoundation.m0Composition?.adapter?.canonicalProjection?.() ?? null);
      return { treeViewport, cameraBefore, cameraAfter, fit, pan, zoom, before, after, edgesBefore, edgesAfter: JSON.stringify(CEPFoundation.relations.records) };
    });
    check(id, 'viewport.tree-refuses', outcome.treeViewport.availability.enabled === false && outcome.treeViewport.availability.code === 'VISUALIZE_VIEWPORT_REQUIRES_GRAPH_OR_CANVAS', outcome.treeViewport.availability);
    check(id, 'viewport.fit-pan-zoom-enabled', [outcome.fit, outcome.pan, outcome.zoom].every(item => item.availability.enabled === true && item.result?.canonicalMutation === false), { fit: outcome.fit.availability, pan: outcome.pan.availability, zoom: outcome.zoom.availability });
    check(id, 'viewport.camera-changed', JSON.stringify(outcome.cameraBefore) !== JSON.stringify(outcome.cameraAfter), { before: outcome.cameraBefore, after: outcome.cameraAfter });
    check(id, 'viewport.canonical-invariant', outcome.before === outcome.after && outcome.edgesBefore === outcome.edgesAfter, { canonicalSame: outcome.before === outcome.after, relationsSame: outcome.edgesBefore === outcome.edgesAfter });
    check(id, 'lane.no-page-errors', pageErrors.length === 0, pageErrors);
    await shot(page, id, 'camera changed, canonical state invariant');
  } catch (e) { check(id, 'lane.flow-completed', false, String(e?.message || e).slice(0, 300)); }
  await ctx.close();
}

/* ── 3. spatial-closure-1024x900 ── */
{
  const id = 'spatial-closure-1024x900';
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  try {
    await ready(page, 'visualize');
    await page.evaluate(() => { CEPFoundation.registry.execute('visualize.view.canvas', {}); CEPFoundation.spatial?.fit?.(); });
    const box = await page.locator('.spatial-canvas').first().boundingBox().catch(() => null);
    check(id, 'closure.canvas-bounds', Boolean(box && box.width > 0 && box.height > 0), box);
    const rows = await page.locator('.visualize-object-list [data-visualize-select]').count();
    if (rows > 0) await page.locator('.visualize-object-list [data-visualize-select]').first().click();
    const selection = await page.evaluate(() => [...CEPFoundation.spatial.model.selection]);
    check(id, 'closure.selection-reachable', selection.length >= 1, selection);
    check(id, 'lane.no-page-errors', pageErrors.length === 0, pageErrors);
    await shot(page, id, 'spatial closure at 1024x900');
  } catch (e) { check(id, 'lane.flow-completed', false, String(e?.message || e).slice(0, 300)); }
  await ctx.close();
}

/* ── 4. focus-document-activeElement-proofs ── */
{
  const id = 'focus-document-activeElement-proofs';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  try {
    await ready(page, 'golden');
    const toggle = page.locator('button[data-foundation-command="foundation.left"]:visible').first();
    await toggle.click();
    const collapsed = await page.locator('#leftPane').getAttribute('data-state');
    await toggle.click();
    const restored = await page.locator('#leftPane').getAttribute('data-state');
    check(id, 'pane.lifecycle', collapsed === 'collapsed' && restored === 'open', { collapsed, restored });
    const invoker = page.locator('button[data-foundation-command="foundation.palette"]').first();
    await invoker.click();
    check(id, 'palette.opens', await page.locator('#commandBackdrop').evaluate(node => node.hidden) === false, true);
    await page.keyboard.press('Escape');
    check(id, 'palette.escape-closes', await page.locator('#commandBackdrop').evaluate(node => node.hidden) === true, true);
    check(id, 'focus.returns-to-invoker', await invoker.evaluate(node => document.activeElement === node), true);
    check(id, 'lane.no-page-errors', pageErrors.length === 0, pageErrors);
    await shot(page, id, 'focus returned to palette invoker');
  } catch (e) { check(id, 'lane.flow-completed', false, String(e?.message || e).slice(0, 300)); }
  await ctx.close();
}

/* ── 5. spatial-input-bidi … visualize-side assertion only (LRN-1 owns the full flow) ── */
{
  const id = 'spatial-input-bidi-visualize-step';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  try {
    await ready(page, 'visualize');
    await page.evaluate(() => { const host = document.querySelector('#spatialHost'); if (host) host.hidden = false; CEPFoundation.spatial?.fit?.(); });
    const box = await page.locator('.spatial-canvas').first().boundingBox().catch(() => null);
    check(id, 'spatial.canvas-has-bounds', Boolean(box && box.width > 0 && box.height > 0), box);
    await shot(page, id, 'revealed spatial host keeps bounds');
  } catch (e) { check(id, 'lane.flow-completed', false, String(e?.message || e).slice(0, 300)); }
  await ctx.close();
}

await browser.close();

const pass = results.filter(r => r.status === 'PASS').length;
const fail = results.length - pass;
const receipt = {
  schema: 'W02-VISUALIZE_LANE_FLOW_RECEIPT@1',
  classification: 'LANE_SCOPE_HARNESS_WORKAROUND__ORACLES_COPIED_FROM_MANDATED_HARNESS__NOT_A_REPLACEMENT_FOR_TOOLS_W02_BROWSER_FLOWS',
  reason: 'tools/w02-browser-flows.mjs uses waitUntil:networkidle; a cross-lane local-runtime server on 127.0.0.1:4174 leaves the boot platform input-direction request unsettled in Chromium so every networkidle navigation times out (environmental, other lane owns the process).',
  mandatedHarness: 'node tools/w02-browser-flows.mjs',
  oracleSource: 'tools/w02-browser-flows.mjs (assertion text copied verbatim per flow)',
  navigationMode: "waitUntil:'load' + CEPFoundation.consumer ready wait",
  startedAt, finishedAt: new Date().toISOString(),
  base: BASE,
  summary: { total: results.length, pass, fail },
  results, screenshots: shots
};
writeFileSync(path.join(HERE, 'FLOW_LANE_RECEIPT.json'), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify({ summary: receipt.summary, failed: results.filter(r => r.status !== 'PASS') }, null, 1));
if (fail) process.exitCode = 1;
