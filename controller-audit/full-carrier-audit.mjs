import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const outDir = new URL('../controller-audit-output/', import.meta.url);
await mkdir(outDir, { recursive: true });
await mkdir(new URL('screenshots/', outDir), { recursive: true });

const checkpoint = 'da007840363d92cdadd9f7c5180449a49e6f1d19';
const surfaces = ['shell','today','library','learn','rq','visualize','enterprise','scenarios','labs','runs','results','evidence','reviews','mastery','portfolio','health','processing','validation','manual_ai','backup','audit','releases','configuration'];
const viewports = [{width:1440,height:1000},{width:1024,height:900}];
const port = 43179;
const base = 'http://127.0.0.1:' + port;
const server = spawn(process.execPath, [new URL('../tools/serve.mjs', import.meta.url).pathname, '--port', String(port)], {
  cwd: new URL('../', import.meta.url), stdio: ['ignore','pipe','pipe']
});
let serverStdout = '', serverStderr = '';
server.stdout.on('data', d => serverStdout += d);
server.stderr.on('data', d => serverStderr += d);

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitServer() {
  for (let i = 0; i < 100; i += 1) {
    try { const r = await fetch(base); if (r.ok) return true; } catch {}
    await sleep(100);
  }
  return false;
}

const pat1 = /(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g;
const pat2 = /import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;
const sources = new Map(), deps = new Map();

async function collect(rel) {
  if (sources.has(rel)) return;
  const source = await readFile(new URL('../dist/' + rel, import.meta.url), 'utf8');
  sources.set(rel, source);
  const arr = [];
  const specs = new Set(
    [...source.matchAll(pat1)].map(m => m[1]).concat([...source.matchAll(pat2)].map(m => m[1]))
  );
  for (const sp of specs) {
    const rr = path.posix.normalize(path.posix.join(path.posix.dirname(rel), sp));
    arr.push([sp, rr]);
    await collect(rr);
  }
  deps.set(rel, arr);
}
await collect('main.js');

const order = [], seen = new Set();
function visit(r) {
  if (seen.has(r)) return;
  seen.add(r);
  for (const pair of (deps.get(r) || [])) visit(pair[1]);
  order.push(r);
}
visit('main.js');
const mods = order.map(rel => ({ rel, source: sources.get(rel), deps: deps.get(rel) }));
let xtermSource = '';
try { xtermSource = await readFile(new URL('../dist/vendor/xterm/xterm.mjs', import.meta.url), 'utf8'); } catch {}

const bootstrapScript =
  '(async()=>{' +
  'const mods=' + JSON.stringify(mods) + ';' +
  'const xtermSource=' + JSON.stringify(xtermSource) + ';' +
  'const urls={};let xtermUrl="";' +
  'if(xtermSource)xtermUrl=URL.createObjectURL(new Blob([xtermSource],{type:"text/javascript"}));' +
  'for(const m of mods){let s=m.source;for(const pair of m.deps){const sp=pair[0],d=pair[1];s=s.split(sp).join(urls[d]);}' +
  'if(xtermUrl)s=s.split("/vendor/xterm/xterm.mjs").join(xtermUrl);urls[m.rel]=URL.createObjectURL(new Blob([s],{type:"text/javascript"}));}' +
  'await import(urls["main.js"]);return {modules:Object.keys(urls).length,consumer:globalThis.CEPFoundation?.consumer||null};' +
  '})()';

const rawHtml = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const donorCss = await readFile(new URL('../dist/foundation/donor.css', import.meta.url), 'utf8');
const extensionCss = await readFile(new URL('../dist/foundation/extensions.css', import.meta.url), 'utf8');
const inlinedHtml = rawHtml
  .replace(/<link rel="stylesheet" href="foundation\/donor\.css">/i, '<style data-controller-inline="donor">' + donorCss + '</style>')
  .replace(/<link rel="stylesheet" href="foundation\/extensions\.css">/i, '<style data-controller-inline="extensions">' + extensionCss + '</style>')
  .replace(/<script type="module" src="main\.js"><\/script>/i, '');

async function loadInMemory(page, surface) {
  await page.setContent(inlinedHtml, { waitUntil: 'domcontentloaded' });
  await page.evaluate(value => {
    try { delete globalThis.CEPFoundation; } catch {}
    history.replaceState({}, '', 'about:blank?surface=' + encodeURIComponent(value));
  }, surface);
  await page.evaluate(bootstrapScript);
  await page.waitForFunction(s => globalThis.CEPFoundation?.consumer === s, surface, { timeout: 15000 });
}

function profileNeeds(value) {
  if (value == null) return false;
  const s = String(value).trim().toLowerCase();
  return !!s && !['n/a','na','none','not applicable','not_applicable'].some(x => s === x || s.includes(x));
}

async function inspectSurface(browser, surface, viewport, routeAvailable) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const pageErrors = [], consoleErrors = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  let transport = 'GENUINE_LOCALHOST_ROUTE', routeError = null;
  try {
    if (!routeAvailable) throw Error('SERVER_UNAVAILABLE');
    await page.goto(base + '/?surface=' + encodeURIComponent(surface), { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForFunction(s => globalThis.CEPFoundation?.consumer === s, surface, { timeout: 15000 });
  } catch (error) {
    routeError = String(error?.message || error);
    transport = 'IN_MEMORY_EXACT_CANDIDATE_RENDER__NOT_GENUINE_ROUTE';
    await loadInMemory(page, surface);
  }
  await page.waitForTimeout(150);

  let profile = {};
  try {
    profile = JSON.parse(await readFile(new URL('../cep-writer/references/surface-profiles/' + surface + '.json', import.meta.url), 'utf8'));
  } catch {}

  const dom = await page.evaluate(() => {
    const visible = el => {
      if (!el) return false;
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity || 1) > 0 && r.width > 0 && r.height > 0;
    };
    const text = sel => (document.querySelector(sel)?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1200);
    const reg = globalThis.CEPFoundation?.registry?.commands;
    const commands = reg && typeof reg.entries === 'function'
      ? [...reg.entries()].map(([id, v]) => ({ id, owner: v?.owner || null, label: v?.label || null }))
      : [];
    const toolbarButtons = [...document.querySelectorAll('.toolbar button,.toolbar [role="button"]')].map(el => ({
      text: (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
      action: el.getAttribute('data-action'),
      foundationCommand: el.getAttribute('data-foundation-command'),
      value: el.getAttribute('data-value'),
      visible: visible(el),
      disabled: !!el.disabled
    }));
    const donor = {
      readEditVisible: [...document.querySelectorAll('[data-action="set-mode"]')].filter(visible).map(el => el.getAttribute('data-value')),
      explicitSaveVisible: [...document.querySelectorAll('[data-action="explicit-save"]')].some(visible),
      toolbarKuVisible: visible(document.querySelector('#toolbarKuId')) ? document.querySelector('#toolbarKuId')?.textContent?.trim() : null,
      editorDocumentVisible: visible(document.querySelector('#editorDocument'))
    };
    const region = sel => {
      const el = document.querySelector(sel);
      return {
        exists: !!el,
        visible: visible(el),
        state: el?.getAttribute('data-state') || null,
        component: el?.getAttribute('data-component') || null,
        text: (el?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1800),
        childIds: el ? [...el.querySelectorAll(':scope > *, :scope > * > *')].map(x => x.id).filter(Boolean).slice(0, 30) : [],
        hasFoundationStage: !!el?.querySelector('#foundationStage'),
        hasDomainNav: !!el?.querySelector('.m0-domain-nav,[data-m0-domain-nav]'),
        hasWorkbench: !!el?.querySelector('[data-r6-workbench],.m0-workbench,.today-workbench,.rq-workbench')
      };
    };
    return {
      consumer: globalThis.CEPFoundation?.consumer || null,
      bodyConsumer: document.body?.dataset?.consumer || null,
      direction: getComputedStyle(document.documentElement).direction,
      title: document.title,
      banner: text('#topBanner'),
      toolbarButtons,
      commands,
      donor,
      regions: {
        TOP: region('#topBanner'),
        TOOLBAR: region('.toolbar'),
        LEFT: region('#leftPane'),
        CENTER: region('#centerPane'),
        RIGHT: region('#rightPane'),
        BOTTOM: region('#bottomShelf')
      },
      foundationKeys: Object.keys(globalThis.CEPFoundation || {}).sort(),
      simulationDescriptor: globalThis.CEPFoundation?.simulation?.descriptor?.() || null,
      operationalProvider: globalThis.CEPFoundation?.operational?.providerDescriptor || null,
      overflow: { doc: document.documentElement.scrollWidth, body: document.body.scrollWidth, inner: innerWidth }
    };
  });

  const slots = profile.slots || {};
  const requiredRegions = Object.fromEntries(Object.entries(slots).map(([k, v]) => [k, profileNeeds(v)]));
  const nonLibraryStructured = !['library','learn'].includes(surface);
  const findings = [];
  if (dom.consumer !== surface) findings.push({ code: 'CONSUMER_IDENTITY_MISMATCH', severity: 'BLOCKING' });
  if (pageErrors.length) findings.push({ code: 'PAGE_ERROR', severity: 'BLOCKING', detail: pageErrors });
  if (dom.overflow.doc > viewport.width + 2 || dom.overflow.body > viewport.width + 2) findings.push({ code: 'HORIZONTAL_OVERFLOW', severity: 'MATERIAL', detail: dom.overflow });
  if (nonLibraryStructured && dom.donor.readEditVisible.length) findings.push({ code: 'FOREIGN_LIBRARY_READ_EDIT_VISIBLE', severity: 'BLOCKING', detail: dom.donor.readEditVisible });
  if (nonLibraryStructured && dom.donor.explicitSaveVisible) findings.push({ code: 'FOREIGN_LIBRARY_EXPLICIT_SAVE_VISIBLE', severity: 'BLOCKING' });
  if (nonLibraryStructured && /سياق المستند|document context/i.test(dom.regions.RIGHT.text || '')) findings.push({ code: 'FOREIGN_LIBRARY_CONTEXT_VISIBLE', severity: 'BLOCKING' });
  for (const key of ['LEFT','RIGHT','BOTTOM']) {
    if (requiredRegions[key] && !dom.regions[key]?.visible) findings.push({ code: 'PROFILE_' + key + '_REGION_NOT_VISIBLE', severity: 'BLOCKING' });
  }
  if (requiredRegions.LEFT && dom.regions.LEFT?.visible && !dom.regions.LEFT.hasDomainNav && nonLibraryStructured && /وحدات المعرفة|knowledge units|البنية والتنقل/i.test(dom.regions.LEFT.text || '')) {
    findings.push({ code: 'PROFILE_LEFT_APPEARS_DONOR_LIBRARY_BOUND', severity: 'BLOCKING' });
  }

  const shotName = surface + '-' + viewport.width + 'x' + viewport.height + '.png';
  const shotUrl = new URL('screenshots/' + shotName, outDir);
  await page.screenshot({ path: shotUrl.pathname, fullPage: false });
  const bytes = await readFile(shotUrl);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  await context.close();

  return {
    surface, viewport, transport, routeError,
    profile: {
      workspace: profile.workspace || null,
      title: profile.title || null,
      slots,
      domain_commands: profile.domain_commands || [],
      family_engines: profile.family_engines || [],
      domain_implementation: profile.domain_implementation || null,
      proof_consumer: profile.proof_consumer ?? null
    },
    requiredRegions, dom, pageErrors, consoleErrors: consoleErrors.slice(0, 20), findings,
    screenshot: { filename: shotName, bytes: bytes.length, sha256 }
  };
}

const routeAvailable = await waitServer();
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
const results = [];
for (const surface of surfaces) {
  for (const viewport of viewports) {
    try {
      results.push(await inspectSurface(browser, surface, viewport, routeAvailable));
    } catch (error) {
      results.push({
        surface, viewport, transport: 'FAILED', error: String(error?.stack || error),
        findings: [{ code: 'SURFACE_CAPTURE_FAILED', severity: 'BLOCKING' }]
      });
    }
  }
}
await browser.close();
server.kill('SIGTERM');

const uniqueFindingCounts = {};
for (const r of results) for (const f of (r.findings || [])) uniqueFindingCounts[f.code] = (uniqueFindingCounts[f.code] || 0) + 1;

const matrix = surfaces.map(surface => {
  const rows = results.filter(r => r.surface === surface);
  return {
    surface,
    transports: [...new Set(rows.map(r => r.transport))],
    findings: [...new Set(rows.flatMap(r => (r.findings || []).map(f => f.code)))],
    donorReadEditVisible: rows.map(r => ({ viewport: r.viewport, values: r.dom?.donor?.readEditVisible || [] })),
    donorSaveVisible: rows.map(r => ({ viewport: r.viewport, visible: r.dom?.donor?.explicitSaveVisible || false })),
    regionText: rows.map(r => ({
      viewport: r.viewport,
      left: r.dom?.regions?.LEFT?.text?.slice(0, 280) || '',
      right: r.dom?.regions?.RIGHT?.text?.slice(0, 280) || '',
      bottom: r.dom?.regions?.BOTTOM?.text?.slice(0, 280) || ''
    }))
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  checkpoint,
  auditBranch: 'controller/corr02-full-carrier-audit-da007840',
  classification: 'CONTROLLER_READ_ONLY_PRODUCT_AUDIT__HARNESS_ONLY_BRANCH__NO_PRODUCT_MUTATION',
  routeAvailable,
  server: { stdout: serverStdout, stderr: serverStderr },
  surfaces: surfaces.length,
  viewports: viewports.length,
  captures: results.length,
  screenshotCount: results.filter(r => r.screenshot).length,
  uniqueFindingCounts,
  results
};

await writeFile(new URL('full-carrier-audit.json', outDir), JSON.stringify(report, null, 2) + '\n');
await writeFile(new URL('surface-summary.json', outDir), JSON.stringify(matrix, null, 2) + '\n');
await writeFile(new URL('README.txt', outDir), [
  'CEP CORR02 Controller full-carrier audit',
  'Exact Product checkpoint: ' + checkpoint,
  'Audit branch changes are harness/workflow only.',
  'GENUINE_LOCALHOST_ROUTE is preferred. If unavailable, in-memory exact-candidate rendering is classified NOT_GENUINE_ROUTE.',
  'Screenshots are fresh exact-current audit evidence and require Controller visual inspection before any acceptance claim.',
  'This audit never promotes or accepts Product state.'
].join('\n') + '\n');

console.log(JSON.stringify({
  routeAvailable,
  captures: results.length,
  screenshots: report.screenshotCount,
  uniqueFindingCounts
}, null, 2));
