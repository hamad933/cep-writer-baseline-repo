/**
 * W05-BACKUP lane capture harness — BKP-1 continuation.
 *
 * Why this file exists alongside evidence/harness/capture.mjs (salvage, left untouched):
 *   the salvaged harness hardcodes root '/workspaces/cep-writer-baseline-repo/' (the main
 *   worktree). This lane works in an isolated worktree and must never write another worktree,
 *   so the lane harness derives its root from its own location and binds every capture to the
 *   lane's exact HEAD/tree + canonical source identity.
 *
 * Method: cep-writer/references/WRITER_LOCAL_VISUAL_CAPTURE_AND_RENDERING_METHOD.md (L1-L4).
 * Lifecycle: fresh local runtime (lane-owned root, never another unit's) + dist static server +
 *            playwright chromium headless, matched viewport, full lineage on every capture.
 *
 * Usage:
 *   node writer-output/W05-BACKUP/evidence/harness/lane-capture.mjs \
 *     --label=lane1a-en-1440 --lang=en --w=1440 --h=1000 \
 *     [--drill] [--seed] [--crops] [--scroll] [--responsive] [--collapse]
 *
 * Evidence contract: every capture records branch/commit/HEAD-tree/canonical-source-sha +
 *                    surface source sha256 + dist bundle sha256 + viewport + lang/dir +
 *                    image identity (path/sha256/dims/bytes).
 */
import {spawn, execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, existsSync} from 'node:fs';
import {mkdir, readFile, writeFile, appendFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {canonicalSourceIdentity} from '../../../../tools/source-tree-identity.mjs';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const require = createRequire(path.join(root, 'package.json'));
const {chromium} = require('playwright');

const OUT = path.join(root, 'writer-output/W05-BACKUP/evidence');
const LANE_RUNTIME = path.join(root, 'writer-output/W05-BACKUP/.runtime/lane');
await mkdir(OUT, {recursive: true});

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = argv.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};
const has = name => argv.includes(`--${name}`);
const LABEL = arg('label', 'lane-capture');
const LANG = arg('lang', 'en');
const W = Number(arg('w', '1440'));
const H = Number(arg('h', '1000'));
const RUNTIME_ROOT = path.join(LANE_RUNTIME, LABEL);

const git = cmd => { try { return String(execSync(cmd, {cwd: root, encoding: 'utf8'})).trim(); } catch { return ''; } };
const sha = buf => createHash('sha256').update(buf).digest('hex');
const shaFile = file => sha(readFileSync(file));

const SURFACE_FILES = ['index.ts', 'style.ts', 'i18n.ts', 'icons.ts'];
const surfaceSourceSha256 = (() => {
  const h = createHash('sha256');
  for (const f of SURFACE_FILES) h.update(readFileSync(path.join(root, 'stack/native-typescript/surfaces/backup', f)));
  h.update(readFileSync(path.join(root, 'stack/native-typescript/adapters/backup-runtime.ts')));
  return h.digest('hex');
})();
const distBundle = ['surfaces/backup/index.js', 'surfaces/backup/style.js', 'surfaces/backup/i18n.js', 'surfaces/backup/icons.js', 'adapters/backup-runtime.js']
  .map(rel => ({file: `dist/${rel}`, sha256: existsSync(path.join(root, 'dist', rel)) ? shaFile(path.join(root, 'dist', rel)) : null}));

const identity = await canonicalSourceIdentity(new URL('../../../../', import.meta.url));
const commit = git('git rev-parse HEAD');
const sourceDirty = git(`git status --porcelain -- stack/native-typescript/surfaces/backup stack/native-typescript/adapters/backup-runtime.ts`);

const lineage = {
  lane: 'BKP-1',
  branch: git('git branch --show-current'),
  commit,
  headTree: git('git rev-parse HEAD^{tree}'),
  stackTree: git('git rev-parse HEAD:stack/native-typescript'),
  canonicalSourceSha256: identity.sha256,
  canonicalSourceFiles: identity.files,
  surfaceSourceSha256,
  surfaceSourceMatchesSalvageBaseline: surfaceSourceSha256 === 'b50f5592a885688f793b166efed49eba04df529508bda453313eaaccb900a10b',
  writableSourceCleanVsHead: sourceDirty === '',
  writableSourceStatus: sourceDirty === '' ? 'CLEAN_MATCHES_HEAD' : sourceDirty,
  distBundle,
  candidate: `W05-BACKUP:${commit}:${identity.sha256.slice(0, 16)}`,
  capturedAt: new Date().toISOString(),
  viewport: `${W}x${H}`,
  lang: LANG,
  label: LABEL,
  runtime: 'playwright-chromium-headless',
  harness: 'writer-output/W05-BACKUP/evidence/harness/lane-capture.mjs',
  harnessNote: 'lane root derived from module location; writes only writer-output/W05-BACKUP/'
};

/* ---------------------------------------------------------------- runtime */
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const port = await freePort(), runtimePort = await freePort();
const workRoot = RUNTIME_ROOT;
await mkdir(path.join(workRoot, 'staging'), {recursive: true});
await mkdir(path.join(workRoot, 'root'), {recursive: true});
const DB = path.join(workRoot, 'cep.sqlite');

const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: ['ignore', 'pipe', 'pipe']});
let serverLog = ''; server.stdout.on('data', d => { serverLog += String(d); }); server.stderr.on('data', d => { serverLog += String(d); });
const runtime = spawn(process.execPath, [path.join(root, 'stack/local-runtime/server.mjs')], {
  cwd: root,
  env: {...process.env, CEP_LOCAL_RUNTIME_PORT: String(runtimePort), CEP_SQLITE_PATH: DB, CEP_STAGING_ROOT: path.join(workRoot, 'staging'), CEP_LOCAL_RUNTIME_ROOT: path.join(workRoot, 'root')},
  stdio: ['ignore', 'pipe', 'pipe']
});
let runtimeLog = ''; runtime.stdout.on('data', d => { runtimeLog += String(d); }); runtime.stderr.on('data', d => { runtimeLog += String(d); });
const waitUp = async url => { for (let i = 0; i < 150; i++) { try { if ((await fetch(url)).ok) return true; } catch { /* retry */ } await new Promise(r => setTimeout(r, 100)); } return false; };
const serveOk = await waitUp(`http://127.0.0.1:${port}/`);
const runtimeOk = await waitUp(`http://127.0.0.1:${runtimePort}/v1/capabilities`);
const runtimeListener = runtimeOk ? `127.0.0.1:${runtimePort}` : null;

/* ---------------------------------------------------------------- page */
const records = [];
const record = async (file, kind, extra = {}) => {
  const b = await readFile(file);
  const rec = {kind, file: path.relative(root, file), sha256: sha(b), bytes: b.length, dims: `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`, ...lineage, ...extra};
  records.push(rec);
  return rec;
};

const out = {lineage, checks: [], captures: [], geometry: {}, probes: {}, notes: []};
const push = (id, ok, detail) => out.checks.push({id, status: ok ? 'PASS' : 'FAIL', detail: typeof detail === 'string' ? detail : JSON.stringify(detail)});

const browser = await chromium.launch({headless: true});
try {
  const context = await browser.newContext({viewport: {width: W, height: H}, reducedMotion: 'reduce', locale: LANG === 'ar' ? 'ar' : 'en'});
  await context.addInitScript(({lang}) => {
    try {
      localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: lang}}}));
    } catch { /* ignore */ }
  }, {lang: LANG});
  const page = await context.newPage();
  const pageErrors = [], consoleErrors = [], failedRequests = [];
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('requestfailed', r => failedRequests.push({url: r.url(), error: r.failure()?.errorText || null}));

  /* optional real-content fixture so density/readback come from real provider state */
  if (has('seed')) {
    const doc = {
      id: `bk-lane-${LABEL}`, revision: 'r1',
      title: LANG === 'ar' ? 'إثبات استعادة النسخ الاحتياطي' : 'Backup restore drill proof document',
      blocks: [{id: 'b1', type: 'paragraph', html: 'العربية + English + <bdi dir="ltr">CVE-2026-0001</bdi>'},
               {id: 'b2', type: 'paragraph', html: 'Restore drill fixture — schema v1, isolated target, true-empty required.'}]
    };
    const res = await fetch(`http://127.0.0.1:${runtimePort}/v1/persistence/bootstrap`, {
      method: 'POST', headers: {'content-type': 'application/json'},
      body: JSON.stringify({document: doc, domainKind: 'backup', surface: 'backup'})
    });
    out.probes.seed = {status: res.status, documentId: doc.id};
    push('fixture.seed', res.status === 200, `POST /v1/persistence/bootstrap -> ${res.status}`);
  }

  await page.goto(`http://127.0.0.1:${port}/?surface=backup&persistencePort=${runtimePort}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'backup', undefined, {timeout: 30000});
  await page.waitForTimeout(2000);

  const state = () => page.evaluate(() => {
    const adapter = window.CEPFoundation?.m0Composition?.adapter;
    const snap = adapter?.snapshot ? adapter.snapshot() : null;
    if (!snap) return null;
    const selected = snap.packages.find(row => row.packageId === snap.selectedPackageId) || snap.packages.at(-1) || null;
    return {
      packages: snap.packages.length, packageStatus: selected?.status || null, plan: !!snap.plan, preview: !!snap.preview, stage: !!snap.stage,
      drill: snap.lastDrill?.status || null, liveRestored: snap.lastDrill?.liveRestored ?? null,
      activation: snap.lastActivation?.status || null, productionDatabaseMutated: snap.lastActivation?.productionDatabaseMutated ?? null,
      attempts: (snap.durableAttempts || snap.attemptHistory || []).length,
      lang: document.documentElement.lang, dir: document.documentElement.dir
    };
  });

  /* N3: prerequisite-less truth BEFORE any command */
  out.probes.prerequisiteTruth = await page.evaluate(() => {
    const a = window.CEPFoundation?.m0Composition?.adapter;
    if (!a) return null;
    const ids = ['backup.plan', 'backup.preview', 'backup.stage', 'backup.drill', 'backup.activationRequest'];
    const availability = {};
    for (const id of ids) availability[id] = a.availability ? a.availability(id) : null;
    const truth = a.truth ? a.truth() : null;
    const pill = document.querySelector('[data-bk-drill-status]')?.getAttribute('data-bk-drill-status') || null;
    const notRunBlock = Boolean(document.querySelector('.bk-nostrun'));
    const unavailableCells = [...document.querySelectorAll('.bk-root .bk-val, .bkr .bk-x')].filter(n => /not available|unavailable|غير متاح/i.test(n.textContent)).length;
    return {availability, truth, renderedDrillStatus: pill, notRunBlockPresent: notRunBlock, unavailableCellCount: unavailableCells};
  });
  out.geometry.initialState = await state();

  /* ---------------------------------------------------------------- lifecycle */
  if (has('drill')) {
    const run = async (id, predicate) => {
      /* the action strip re-renders after each command; wait for the button to be present AND
       * enabled instead of sampling it once (a single sample races the post-command render) */
      let clicked = 'absent', availability = null;
      const startedAt = Date.now();
      while (Date.now() - startedAt < 20000) {
        const outcome = await page.evaluate(cmd => {
          const el = [...document.querySelectorAll('[data-foundation-command]')].find(b => b.dataset.foundationCommand === cmd);
          if (!el) return 'absent';
          if (el.disabled) return 'disabled';
          el.click();
          return 'clicked';
        }, id);
        if (outcome === 'clicked') { clicked = 'clicked'; break; }
        clicked = outcome;
        availability = await page.evaluate(cmd => {
          const a = window.CEPFoundation?.m0Composition?.adapter;
          return a?.availability ? a.availability(cmd) : null;
        }, id);
        await page.waitForTimeout(250);
      }
      if (clicked !== 'clicked') { push(`command.${id}`, false, `button ${clicked} for 20s · availability=${JSON.stringify(availability)} · state=${JSON.stringify(await state())}`); return false; }
      for (let i = 0; i < 72; i++) {
        await page.waitForTimeout(250);
        const s = await state();
        if (predicate(s)) { push(`command.${id}`, true, s); return true; }
      }
      push(`command.${id}`, false, `timeout waiting for state after ${id} · ${JSON.stringify(await state())}`);
      return false;
    };
    await run('backup.package', s => s.packages > 0);
    await run('backup.plan', s => s.plan);
    await run('backup.preview', s => s.preview);
    await run('backup.stage', s => s.stage);
    await run('backup.drill', s => s.drill);
    await run('backup.activationRequest', s => !!s.activation);
    await page.waitForTimeout(700);
  }
  out.geometry.finalState = await state();
  out.probes.truthAfterLifecycle = await page.evaluate(() => {
    const a = window.CEPFoundation?.m0Composition?.adapter;
    return a?.truth ? a.truth() : null;
  });
  out.probes.descriptor = await page.evaluate(() => {
    const a = window.CEPFoundation?.m0Composition?.adapter;
    return a?.descriptor ? a.descriptor() : null;
  });

  /* ---------------------------------------------------------------- shots */
  const shot = async (name, opts = {}) => {
    const file = path.join(OUT, `${LABEL}-${name}.png`);
    await page.screenshot({path: file, fullPage: false, ...opts});
    out.captures.push(await record(file, 'viewport'));
  };
  const elShot = async (selector, name) => {
    const el = await page.$(selector);
    if (!el) { out.notes.push(`missing element ${selector} for ${name}`); return null; }
    try {
      if (!(await el.isVisible())) { out.notes.push(`element ${selector} not visible at ${W}x${H} — collapsed/hidden by the shared shell; recorded, no capture`); return null; }
      const file = path.join(OUT, `${LABEL}-${name}.png`);
      await el.screenshot({path: file, timeout: 10000});
      out.captures.push(await record(file, 'element'));
    } catch (error) { out.notes.push(`element shot skipped for ${selector}: ${String(error?.message || error).split('\n')[0]}`); }
  };

  await shot('full');
  if (has('crops')) {
    await elShot('.bk-eyebrow', 'eyebrow');
    await elShot('#leftPane', 'left');
    await elShot('#foundationStage', 'center');
    await elShot('#rightPane', 'right');
    await elShot('#bottomShelf', 'bottom');
  }
  if (has('scroll')) {
    await page.evaluate(() => { const s = document.querySelector('#foundationStage'); if (s) s.scrollTop = s.scrollHeight; });
    await page.waitForTimeout(500);
    await shot('scrolled');
    await page.evaluate(() => { const s = document.querySelector('#foundationStage'); if (s) s.scrollTop = 0; });
    await page.waitForTimeout(300);
  }

  /* ---------------------------------------------------------------- structural probe */
  const probe = () => page.evaluate(() => {
    const rect = sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; };
    const cols = sel => { const e = document.querySelector(sel); if (!e) return null; const g = getComputedStyle(e).gridTemplateColumns; return g && g !== 'none' ? g.split(' ').filter(Boolean).length : null; };
    const style = (sel, props) => { const e = document.querySelector(sel); if (!e) return null; const c = getComputedStyle(e); const o = {}; for (const p of props) o[p] = c[p]; return o; };
    const stage = document.querySelector('#foundationStage');
    const rootEl = document.querySelector('.bk-root');
    const text = rootEl ? rootEl.innerText : '';
    const arabic = (text.match(/[؀-ۿ]/g) || []).length;
    return {
      viewport: {w: innerWidth, h: innerHeight},
      regions: {banner: rect('#topBanner'), toolbar: rect('#domainToolbar'), left: rect('#leftPane'), stage: rect('#foundationStage'), right: rect('#rightPane'), bottom: rect('#bottomShelf')},
      regionVisibility: Object.fromEntries(['#topBanner', '#domainToolbar', '#leftPane', '#foundationStage', '#rightPane', '#bottomShelf'].map(sel => {
        const e = document.querySelector(sel);
        const visible = Boolean(e) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden';
        return [sel, visible ? 'VISIBLE' : (e ? 'COLLAPSED_OR_HIDDEN' : 'ABSENT')];
      })),
      centerChildren: [...(stage?.querySelector('[data-w05-surface]')?.children || [])].map(c => ({cls: String(c.className), ...rect(`[data-w05-surface] > .${String(c.className).split(' ')[0]}`)})),
      counts: {
        steps: document.querySelectorAll('.bk-step').length,
        checks: document.querySelectorAll('.bk-check').length,
        metrics: document.querySelectorAll('.bk-metric').length,
        leftItems: document.querySelectorAll('#domainLeftRegion li').length,
        rightBlocks: document.querySelectorAll('#domainContext section').length,
        ledgerRows: document.querySelectorAll('.bkb-table tbody tr').length
      },
      responsive: {
        containerInlineSize: rootEl ? Math.round(rootEl.getBoundingClientRect().width) : null,
        containerType: rootEl ? getComputedStyle(rootEl).containerType : null,
        metricColumns: cols('.bk-metrics'),
        pipelineColumns: cols('.bk-pipe'),
        checkColumns: cols('.bk-checks'),
        pipelineConnector: (() => { const e = document.querySelector('.bk-pipe'); if (!e) return null; const b = getComputedStyle(e, '::before'); return b ? b.display : null; })(),
        expectedBand: (() => {
          const w = rootEl ? rootEl.getBoundingClientRect().width : 0;
          if (w <= 430) return '<=430: metrics1/checks1/pipe2';
          if (w <= 560) return '<=560: metrics2/checks2/pipe4';
          if (w <= 660) return '<=660: pipe4 no-connector';
          if (w <= 700) return '<=700: metrics3';
          return '>700: metrics6/checks3/pipe8';
        })()
      },
      direction: {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        searchInput: style('.bkl-search input', ['paddingLeft', 'paddingRight', 'paddingInlineStart', 'paddingInlineEnd']),
        titleSub: style('.bk-title .bk-sub', ['borderLeftWidth', 'borderRightWidth', 'borderInlineStartWidth', 'borderInlineEndWidth']),
        firstMetaCell: style('.bk-meta div', ['paddingLeft', 'paddingRight']),
        actionsRect: rect('.bk-act'),
        identityRect: rect('.bk-id'),
        paneGeometry: {left: rect('#leftPane'), right: rect('#rightPane')},
        arabicGlyphCount: arabic,
        hasArabic: arabic > 0
      },
      overflow: {
        docH: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        stageScroll: stage?.scrollHeight,
        stageClient: stage?.clientHeight,
        stageScrollable: (stage?.scrollHeight || 0) >= (stage?.clientHeight || 0),
        clippedBlocks: [...document.querySelectorAll('.bk-root *')].filter(e => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'visible' && e.clientWidth > 0).length
      },
      h1: style('.bk-root h1', ['fontSize', 'fontWeight', 'lineHeight']),
      truthChips: [...document.querySelectorAll('.bk-truth bdi')].map(n => n.textContent),
      eyebrow: (() => { const e = document.querySelector('.bk-eyebrow'); if (!e) return null; const t = e.innerText; return {text: t, codes: [...t].map(c => c.codePointAt(0).toString(16)).join(' ')}; })(),
      /* §7 language audit: leaf nodes carrying the other-script glyphs, owner-attributed */
      languageAudit: (() => {
        const arabic = /[؀-ۿ]/;
        const lang = document.documentElement.lang;
        const hit = el => lang === 'ar' ? /[A-Za-z]{3,}/.test(el.textContent || '') && !el.closest('bdi') && !el.closest('pre') : arabic.test(el.textContent || '');
        const rows = [...document.querySelectorAll('body *')].filter(el => !el.children.length && hit(el)).slice(0, 60);
        return rows.map(el => ({
          owner: el.closest('[data-w05-surface]') ? 'W05-BACKUP(surface)' : (el.id ? `#${el.id}` : (el.className ? `.${String(el.className).split(' ')[0]}` : el.tagName)),
          tag: el.tagName,
          text: String(el.textContent || '').trim().slice(0, 60),
          inSurface: Boolean(el.closest('[data-w05-surface]'))
        }));
      })()
    };
  });
  out.geometry.probe = await probe();

  /* language assertions bound to the active preference */
  const p = out.geometry.probe;
  const px = value => parseFloat(String(value ?? '0')) || 0;
  if (LANG === 'ar') {
    push('rtl.document-dir', p.direction.dir === 'rtl', `document.dir=${p.direction.dir}`);
    push('rtl.surface-has-arabic', p.direction.hasArabic, `arabic glyph count=${p.direction.arabicGlyphCount}`);
    push('rtl.search-padding-mirrored', px(p.direction.searchInput?.paddingRight) > px(p.direction.searchInput?.paddingLeft),
      `paddingLeft=${p.direction.searchInput?.paddingLeft} paddingRight=${p.direction.searchInput?.paddingRight} (logical padding-inline-start=28px must land on the right in RTL)`);
    push('rtl.title-rule-mirrored', px(p.direction.titleSub?.borderRightWidth) > 0 && px(p.direction.titleSub?.borderLeftWidth) === 0,
      `borderLeft=${p.direction.titleSub?.borderLeftWidth} borderRight=${p.direction.titleSub?.borderRightWidth} (border-inline-start)`);
  } else {
    push('ltr.document-dir', p.direction.dir === 'ltr', `document.dir=${p.direction.dir}`);
    push('ltr.no-arabic-in-surface', !p.direction.hasArabic, `arabic glyph count=${p.direction.arabicGlyphCount}`);
    push('ltr.search-padding-logical', px(p.direction.searchInput?.paddingLeft) > px(p.direction.searchInput?.paddingRight),
      `paddingLeft=${p.direction.searchInput?.paddingLeft} paddingRight=${p.direction.searchInput?.paddingRight}`);
    push('ltr.title-rule-logical', px(p.direction.titleSub?.borderLeftWidth) > 0 && px(p.direction.titleSub?.borderRightWidth) === 0,
      `borderLeft=${p.direction.titleSub?.borderLeftWidth} borderRight=${p.direction.titleSub?.borderRightWidth}`);
  }
  push('structure.counts', p.counts.steps === 8 && p.counts.checks === 9 && p.counts.metrics === 6 && p.counts.rightBlocks === 9,
    {steps: p.counts.steps, checks: p.counts.checks, metrics: p.counts.metrics, rightBlocks: p.counts.rightBlocks});
  push('overflow.no-document-h-scroll', !p.overflow.docH, `docH=${p.overflow.docH} clippedBlocks=${p.overflow.clippedBlocks}`);
  if (has('drill')) {
    push('lifecycle.truth-ceilings-held',
      out.probes.truthAfterLifecycle?.stagedVerifiedIsLiveRestored === false
      && out.probes.truthAfterLifecycle?.drillLiveRestored === false
      && out.probes.truthAfterLifecycle?.productionDatabaseMutated === false
      && out.probes.truthAfterLifecycle?.persistenceOwnerMutated === false,
      out.probes.truthAfterLifecycle);
    push('lifecycle.activation-stays-pending', out.geometry.finalState?.activation === 'AUTHORITY_PENDING'
      && out.geometry.finalState?.productionDatabaseMutated === false,
      {activation: out.geometry.finalState?.activation, productionDatabaseMutated: out.geometry.finalState?.productionDatabaseMutated});
  }

  /* ---------------------------------------------------------------- responsive sweep */
  if (has('responsive')) {
    const vps = [[1440, 1000], [1280, 860], [1024, 900], [960, 900], [820, 900]];
    out.geometry.responsive = {};
    for (const [w, h] of vps) {
      await page.setViewportSize({width: w, height: h});
      await page.waitForTimeout(600);
      const probeNow = await probe();
      out.geometry.responsive[`${w}x${h}`] = {
        containerInlineSize: probeNow.responsive.containerInlineSize,
        metricColumns: probeNow.responsive.metricColumns,
        pipelineColumns: probeNow.responsive.pipelineColumns,
        checkColumns: probeNow.responsive.checkColumns,
        pipelineConnector: probeNow.responsive.pipelineConnector,
        expectedBand: probeNow.responsive.expectedBand,
        regionVisibility: probeNow.regionVisibility,
        regions: probeNow.regions,
        docHScroll: probeNow.overflow.docH,
        clippedBlocks: probeNow.overflow.clippedBlocks,
        stage: probeNow.regions.stage
      };
      await shot(`vp-${w}x${h}`);
    }
    await page.setViewportSize({width: W, height: H});
    await page.waitForTimeout(500);
    const expected = cw => cw <= 430 ? {metrics: 1, checks: 1, pipe: 2, connector: 'none'}
      : cw <= 560 ? {metrics: 2, checks: 2, pipe: 4, connector: 'none'}
      : cw <= 660 ? {metrics: 3, checks: 3, pipe: 4, connector: 'none'}
      : cw <= 700 ? {metrics: 3, checks: 3, pipe: 8, connector: 'block'}
      : {metrics: 6, checks: 3, pipe: 8, connector: 'block'};
    for (const [key, r] of Object.entries(out.geometry.responsive)) {
      const exp = expected(r.containerInlineSize);
      const matched = r.metricColumns === exp.metrics && r.checkColumns === exp.checks && r.pipelineColumns === exp.pipe && r.pipelineConnector === exp.connector;
      push(`responsive.${key}.container-band`, matched,
        `container=${r.containerInlineSize}px observed metrics=${r.metricColumns} checks=${r.checkColumns} pipe=${r.pipelineColumns} connector=${r.pipelineConnector} · expected metrics=${exp.metrics} checks=${exp.checks} pipe=${exp.pipe} connector=${exp.connector}`);
      push(`responsive.${key}.no-document-h-scroll`, !r.docHScroll && r.clippedBlocks === 0,
        `docHScroll=${r.docHScroll} clippedBlocks=${r.clippedBlocks} regions=${JSON.stringify(r.regionVisibility)}`);
    }
  }

  /* ---------------------------------------------------------------- collapsed-state probe */
  if (has('collapse')) {
    const commands = await page.evaluate(() => [...document.querySelectorAll('[data-foundation-command]')].map(b => b.dataset.foundationCommand));
    out.probes.registeredDomCommands = commands;
    const before = await probe();
    const toggles = commands.filter(c => /(^|\.)left$|(^|\.)right$|pane|collapse|shelf/i.test(c));
    out.probes.paneToggleCandidates = toggles;
    const attempts = [];
    for (const cmd of toggles.slice(0, 3)) {
      const clicked = await page.evaluate(c => {
        const el = [...document.querySelectorAll('[data-foundation-command]')].find(b => b.dataset.foundationCommand === c && !b.disabled);
        if (el) { el.click(); return true; }
        return false;
      }, cmd);
      if (!clicked) { attempts.push({cmd, clicked: false}); continue; }
      await page.waitForTimeout(600);
      const after = await probe();
      const changed = JSON.stringify(before.regions) !== JSON.stringify(after.regions);
      attempts.push({cmd, clicked: true, paneGeometryChanged: changed, leftW: after.regions.left?.w, rightW: after.regions.right?.w});
      await shot(`toggle-${cmd.replace(/\./g, '-')}`);
      if (changed) { out.geometry.collapsedState = after.regions; break; }
    }
    out.probes.collapseAttempts = attempts;
    push('responsive.collapse-probe', true,
      attempts.some(a => a.paneGeometryChanged)
        ? `pane geometry changed by ${attempts.find(a => a.paneGeometryChanged)?.cmd}`
        : 'no surface-visible pane collapse command changed pane geometry — recorded truthfully (shared shell owns pane reveal/collapse controls)');
  }

  out.pageErrors = pageErrors;
  out.consoleErrors = consoleErrors.slice(0, 20);
  out.failedRequests = failedRequests.slice(0, 20).map(r => ({
    ...r,
    targetsProofInfrastructure: r.url.includes(`127.0.0.1:${port}`) || r.url.includes(`127.0.0.1:${runtimePort}`)
  }));
  out.serveOk = serveOk;
  out.runtimeOk = runtimeOk;
  out.runtimeListener = runtimeListener;
  push('runtime.reachable', runtimeOk, runtimeOk ? `GET 127.0.0.1:${runtimePort}/v1/capabilities ok` : runtimeLog.slice(0, 400));
  push('page.errors', pageErrors.length === 0, pageErrors.join(' | ') || 'no page errors');
} catch (error) {
  out.fatal = String(error?.stack || error);
} finally {
  try { await browser.close(); } catch { /* bounded */ }
  runtime.kill('SIGTERM');
  server.kill('SIGTERM');
}

out.captures = records;
const outFile = path.join(OUT, `${LABEL}.json`);
await writeFile(outFile, JSON.stringify(out, null, 2));
await appendFile(path.join(OUT, 'lane-captures.jsonl'), records.map(r => JSON.stringify(r)).join('\n') + '\n');
console.log(JSON.stringify({
  outFile: path.relative(root, outFile),
  checks: out.checks,
  captures: records.map(r => `${r.file} ${r.sha256.slice(0, 16)} ${r.dims}`),
  fatal: out.fatal || null
}, null, 2));
if (out.fatal) process.exitCode = 1;
