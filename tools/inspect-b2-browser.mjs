import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = new URL('../', import.meta.url);

const pat1 = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g;
const pat2 = /import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;

const sources = new Map();
const deps = new Map();

async function collect(rel) {
  if (sources.has(rel)) return;
  const source = await readFile(new URL(`dist/${rel}`, root), 'utf8');
  sources.set(rel, source);
  const arr = [];
  const specifiers = new Set([
    ...[...source.matchAll(pat1)].map(m => m[1]),
    ...[...source.matchAll(pat2)].map(m => m[1])
  ]);
  for (const sp of specifiers) {
    const rr = path.posix.normalize(path.posix.join(path.posix.dirname(rel), sp));
    arr.push([sp, rr]);
    await collect(rr);
  }
  deps.set(rel, arr);
}

await collect('main.js');

const order = [];
const seen = new Set();
function visit(r) {
  if (seen.has(r)) return;
  seen.add(r);
  for (const [, d] of (deps.get(r) || [])) {
    visit(d);
  }
  order.push(r);
}
visit('main.js');

const mods = order.map(r => ({ rel: r, source: sources.get(r), deps: deps.get(r) }));
const xtermSource = await readFile(new URL('dist/vendor/xterm/xterm.mjs', root), 'utf8');

const bootstrapScript = `(async () => {
  const mods = ${JSON.stringify(mods)};
  const xtermSource = ${JSON.stringify(xtermSource)};
  const xtermUrl = URL.createObjectURL(new Blob([xtermSource], { type: 'text/javascript' }));
  const urls = {};
  for (const m of mods) {
    let s = m.source;
    for (const [sp, d] of m.deps) {
      s = s.split(sp).join(urls[d]);
    }
    s = s.split('/vendor/xterm/xterm.mjs').join(xtermUrl);
    urls[m.rel] = URL.createObjectURL(new Blob([s], { type: 'text/javascript' }));
  }
  await import(urls['main.js']);
  return { modules: Object.keys(urls).length, consumer: globalThis.CEPFoundation?.consumer || null, xtermInjected: true };
})()`;

const rawHtml = await readFile(new URL('dist/index.html', root), 'utf8');
const donorCss = await readFile(new URL('dist/foundation/donor.css', root), 'utf8');
const extensionCss = await readFile(new URL('dist/foundation/extensions.css', root), 'utf8');

const inlinedHtml = rawHtml
  .replace(/<link rel="stylesheet" href="foundation\/donor\.css">/i, `<style data-browser-inline="donor">${donorCss}</style>`)
  .replace(/<link rel="stylesheet" href="foundation\/extensions\.css">/i, `<style data-browser-inline="extensions">${extensionCss}</style>`)
  .replace(/<script type="module" src="main\.js"><\/script>/i, '');

async function inspect(surface, width = 1440, height = 1000) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(String(err)));

  await page.setContent(inlinedHtml, { waitUntil: 'domcontentloaded' });
  await page.evaluate(val => {
    try { delete globalThis.CEPFoundation; } catch {}
    history.replaceState({}, '', `about:blank?surface=${encodeURIComponent(val)}`);
  }, surface);

  await page.evaluate(bootstrapScript);
  await page.waitForFunction(s => window.CEPFoundation?.consumer === s, surface, { timeout: 10000 });

  const shotPath = new URL(`assurance/R6_OD057_BROWSER/${surface}-${width}x${height}.png`, root);
  await page.screenshot({ path: shotPath.pathname, fullPage: false });

  const info = await page.evaluate(() => {
    const f = window.CEPFoundation || {};
    return {
      consumer: f.consumer,
      title: document.title,
      topBannerText: document.querySelector('#topBanner')?.innerText?.replace(/\s+/g, ' ').slice(0, 150),
      editorDocExists: !!document.querySelector('#editorDocument'),
      blockCount: document.querySelectorAll('#blockList [data-block-id]').length,
      leftPaneText: document.querySelector('#leftPane')?.innerText?.replace(/\s+/g, ' ').slice(0, 150),
      rightPaneText: document.querySelector('#rightPane')?.innerText?.replace(/\s+/g, ' ').slice(0, 150),
      toolbarButtons: [...document.querySelectorAll('.toolbar button, .toolbar .btn')].map(b => (b.innerText || b.getAttribute('aria-label') || b.id || '').trim()).filter(Boolean),
      activeKu: document.querySelector('#bannerKuId')?.textContent || document.querySelector('#toolbarKuId')?.textContent,
      overflow: {
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth
      }
    };
  });
  console.log(`=== ${surface} (${width}x${height}) ===`);
  console.log(JSON.stringify(info, null, 2));
  if (errors.length) console.log('ERRORS:', errors);
  await browser.close();
}

console.log('Inspecting library and learn with in-browser blob URLs...');
await inspect('library', 1440, 1000);
await inspect('library', 1024, 900);
await inspect('learn', 1440, 1000);
await inspect('learn', 1024, 900);
