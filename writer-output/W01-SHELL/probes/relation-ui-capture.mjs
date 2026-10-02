/**
 * SH-1 relation-UI capture probe (evidence tooling, not product code).
 *
 * Captures the Enterprise relation UI at 1440x1000 and 1024x900 in AR/RTL and EN/LTR,
 * in two interaction states each:
 *   (a) visible endpoint selection drives central availability (Connect visible + enabled),
 *   (b) authorized label route opens the shared RelationInteractionOwner composer.
 * Writes a hash-bound manifest next to the images.
 *
 * Usage: STATE=before|after node relation-ui-capture.mjs
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { canonicalSourceIdentity } = require('../../../tools/source-tree-identity.mjs');

const root = new URL('../../../', import.meta.url);
const state = (process.env.STATE || 'after').toLowerCase();
const outDir = new URL(`evidence/${state}/`, new URL('../', import.meta.url));
const port = Number(process.env.SH1_PROBE_PORT || 43240);
const base = `http://127.0.0.1:${port}`;

const server = spawn(process.execPath, [new URL('tools/serve.mjs', root).pathname, '--port', String(port)], { cwd: new URL('.', root).pathname, stdio: ['ignore', 'pipe', 'pipe'] });
for (let i = 0; i < 80; i += 1) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }

const { sha256: sourceTreeSha256, files: canonicalSourceFileCount } = await canonicalSourceIdentity(root);
const commit = await (await import('node:child_process')).execSync('git rev-parse HEAD', { cwd: new URL('.', root).pathname }).toString().trim();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e)));

const viewports = [{ width: 1440, height: 1000 }, { width: 1024, height: 900 }];
const locales = ['ar', 'en'];
const shots = [];

await mkdir(outDir, { recursive: true });

const ready = async () => {
  await page.goto(`${base}/?surface=enterprise`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise', null, { timeout: 20000 });
  await page.waitForTimeout(500);
};

const applyLocale = async locale => {
  await page.evaluate(value => {
    CEPFoundation.preferences.set('locale', value, CEPFoundation.workspace.scope);
    CEPFoundation.workspace.applyPreferences();
    CEPFoundation.m0Composition?.refresh?.();
  }, locale);
  await page.waitForTimeout(400);
};

const shoot = async (name, meta) => {
  const file = new URL(name, outDir);
  await page.screenshot({ path: file.pathname, fullPage: false });
  const bytes = await readFile(file);
  shots.push({ filename: `${state}/${name}`, ...meta, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), viewport: page.viewportSize() });
};

const pickPair = async () => page.evaluate(() => {
  const nodes = CEPFoundation.relations.nodes;
  for (let i = 0; i < nodes.length; i += 1) for (let j = i + 1; j < nodes.length; j += 1) {
    if (CEPFoundation.relations.connectionAvailability([nodes[i].id, nodes[j].id]).enabled) return [nodes[i].id, nodes[j].id];
  }
  return null;
});

for (const viewport of viewports) {
  await page.setViewportSize(viewport);
  for (const locale of locales) {
    await ready();
    await applyLocale(locale);

    /* (a) selection drives central availability */
    const pair = await pickPair();
    const first = page.locator(`.spatial-canvas [data-node="${pair[0]}"]`).filter({ visible: true }).first();
    const second = page.locator(`.spatial-canvas [data-node="${pair[1]}"]`).filter({ visible: true }).first();
    await first.click();
    await second.click({ modifiers: ['Control'] });
    await page.waitForTimeout(300);
    const selectionState = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      selectionCount: CEPFoundation.relationUI.selectionDescriptor().selectionCount,
      availability: CEPFoundation.relationUI.connectAvailability(),
      sharesPublishedSpatial: CEPFoundation.relationUI.spatial === CEPFoundation.spatial,
      relationSelectionSurfaceVisible: !document.querySelector('.relation-selection')?.hidden,
      liveSpatialCanvasCount: document.querySelectorAll('.spatial-canvas').length
    }));
    await shoot(`relation-selection-${locale}-${viewport.width}x${viewport.height}.png`, { state, locale, viewport: `${viewport.width}x${viewport.height}`, kind: 'selection-drives-central-availability', selectionState });

    /* (b) authorized label route opens the shared relation composer */
    const label = page.locator('.spatial-canvas [data-relation-label]').filter({ visible: true }).first();
    let clickRoute = 'pointer-dblclick';
    try {
      await label.dblclick({ timeout: 4000 });
    } catch {
      clickRoute = 'forced-pointer-dblclick';
      await label.dblclick({ force: true, timeout: 4000 }).catch(() => {});
    }
    if (await page.evaluate(() => document.querySelector('.relation-composer')?.hidden !== false)) {
      clickRoute = 'dispatched-dblclick-event';
      await label.dispatchEvent('dblclick').catch(() => {});
    }
    await page.waitForTimeout(300);
    const composerState = await page.evaluate(() => ({
      composerOpen: !document.querySelector('.relation-composer')?.hidden,
      composerOwner: document.querySelector('.relation-composer')?.dataset.owner ?? null,
      policyRevision: document.querySelector('.relation-composer')?.dataset.policyRevision ?? null,
      relationEditReceipts: CEPFoundation.registry.receipts.filter(r => r.id === 'relation.edit').map(r => r.owner),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir
    }));
    composerState.clickRoute = clickRoute;
    await shoot(`relation-composer-${locale}-${viewport.width}x${viewport.height}.png`, { state, locale, viewport: `${viewport.width}x${viewport.height}`, kind: 'label-route-opens-shared-composer', composerState });
    await page.locator('.relation-composer [data-relation-close]').first().click().catch(() => {});
  }
}

const manifest = {
  kind: 'SH1_RELATION_UI_CAPTURE',
  classification: 'CANDIDATE_EVIDENCE__NOT_ACCEPTANCE',
  state,
  commit,
  sourceTreeSha256,
  canonicalSourceFileCount,
  capturedAt: new Date().toISOString(),
  browser: `chromium ${browser.version()}`,
  transport: 'localhost-http',
  pageErrors,
  shots
};
await writeFile(new URL('manifest.json', outDir), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ state, commit, sourceTreeSha256, shots: shots.length, pageErrors: pageErrors.length, dir: outDir.pathname }, null, 2));

await browser.close();
server.kill();
