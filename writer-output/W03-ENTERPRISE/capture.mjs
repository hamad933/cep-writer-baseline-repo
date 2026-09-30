/**
 * W03-ENTERPRISE visual capture (self-owned evidence tool).
 *
 * Usage:
 *   node writer-output/W03-ENTERPRISE/capture.mjs --label before
 *   node writer-output/W03-ENTERPRISE/capture.mjs --label after
 *   node writer-output/W03-ENTERPRISE/capture.mjs --compare before after
 *
 * Writes: writer-output/W03-ENTERPRISE/evidence/<label>/*.png + receipt-<label>.json
 * Every PNG is bound to: candidate/commit/tree, viewport, dir/locale, timestamp,
 * and image identity (path + sha256 + width + height + byte size).
 * Grounding law: all claims come from file bytes or live DOM text.
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');

const root = fileURLToPath(new URL('../../', import.meta.url));
const outRoot = path.join(root, 'writer-output/W03-ENTERPRISE/evidence');
const args = process.argv.slice(2);
const argValue = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const label = argValue('--label') || 'baseline';

const CASES = [
  {id: 'ltr-1503', w: 1503, h: 1046, locale: 'en', dir: 'ltr', states: ['topology', 'selected', 'composer', 'twins', 'revisions', 'baselines', 'state']},
  {id: 'rtl-1503', w: 1503, h: 1046, locale: 'ar', dir: 'rtl', states: ['topology', 'revisions']},
  {id: 'ltr-1024', w: 1024, h: 900, locale: 'en', dir: 'ltr', states: ['topology']},
  {id: 'ltr-820', w: 820, h: 900, locale: 'en', dir: 'ltr', states: ['topology', 'revisions']}
];

const freePort = () => new Promise(res => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); });
});

const pngDims = buf => ({width: buf.readUInt32BE(16), height: buf.readUInt32BE(20)});

const probe = () => {
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const text = s => (q(s)?.innerText || '').replace(/[ \t]+/g, ' ').trim();
  const words = t => t.split(/\s+/).filter(Boolean).length;
  const visible = n => n.offsetParent !== null || n.getClientRects().length > 0;
  const clipped = qa('.enterprise-studio *,#domainLeftRegion *,#domainContext *').filter(n => visible(n) && n.scrollWidth > n.clientWidth + 2 && getComputedStyle(n).overflowX !== 'auto' && getComputedStyle(n).overflowX !== 'scroll')
    .map(n => `${n.tagName}.${(n.className || '').toString().slice(0, 40)}:${(n.innerText || n.textContent || '').trim().slice(0, 30)}`).slice(0, 25);
  const vertClip = qa('.enterprise-studio *,#domainLeftRegion *,#domainContext *').filter(n => visible(n) && n.scrollHeight > n.clientHeight + 2 && getComputedStyle(n).overflowY !== 'auto' && getComputedStyle(n).overflowY !== 'scroll')
    .map(n => `${n.tagName}.${(n.className || '').toString().slice(0, 40)}`).slice(0, 25);
  const region = sel => {
    const n = q(sel); if (!n) return null;
    const r = n.getBoundingClientRect();
    return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), words: words(n.innerText || ''), buttons: qa(`${sel} button`).filter(visible).length, bg: getComputedStyle(n).backgroundColor, color: getComputedStyle(n).color, font: getComputedStyle(n).fontFamily.slice(0, 40)};
  };
  const stage = q('.enterprise-studio');
  return {
    consumer: document.body.dataset.consumer || window.CEPFoundation?.consumer || null,
    dir: document.documentElement.dir,
    lang: document.documentElement.lang,
    preferenceLocale: (() => { try { return window.CEPFoundation?.preferences?.resolve?.('locale')?.preferredValue; } catch { return null; } })(),
    stagePresent: !!stage,
    stageDirection: stage ? getComputedStyle(stage).direction : null,
    headerOrder: stage ? [...stage.querySelectorAll('.ent-id,.ent-actions,.enterprise-modebar')].map(n => `${n.className.split(' ')[0]}@${Math.round(n.getBoundingClientRect().x)}`) : [],
    rect: stage ? {w: Math.round(stage.getBoundingClientRect().width), h: Math.round(stage.getBoundingClientRect().height)} : null,
    panes: {
      leftState: q('#leftPane')?.dataset.state || null,
      rightState: q('#rightPane')?.dataset.state || null,
      bottomState: q('#bottomShelf')?.dataset.state || null,
      leftRegionOwned: !!q('#domainLeftRegion .ent-structure'),
      rightRegionOwned: !!q('#domainContext .ent-context'),
      bottomRegionOwned: !!q('#domainBottomRegion .ent-deep-body'),
      hiddenLeftSiblings: qa('#leftPane .pbody > *').filter(n => n.hidden).length,
      hiddenRightSiblings: qa('#rightPane .pbody > *').filter(n => n.hidden).length,
      visibleRightSiblings: qa('#rightPane .pbody > *').filter(n => !n.hidden).map(n => n.id || n.tagName)
    },
    regions: {top: region('[data-region=TOP]'), left: region('#domainLeftRegion') || region('[data-region=LEFT]'), center: region('[data-region=CENTER]'), right: region('#domainContext') || region('[data-region=RIGHT]'), bottom: region('#domainBottomRegion') || region('[data-region=BOTTOM]')},
    words: {left: words(text('#domainLeftRegion')), center: words(text('[data-region=CENTER]')), right: words(text('#domainContext')), top: words(text('[data-region=TOP]')), bottom: words(text('#domainBottomRegion')), total: words(text('#domainLeftRegion') + text('[data-region=CENTER]') + text('#domainContext') + text('[data-region=TOP]') + text('#domainBottomRegion'))},
    counts: {
      topLevelButtons: qa('[data-region=TOP] button').filter(visible).length,
      topLabels: qa('[data-region=TOP] button').filter(visible).map(n => n.textContent.trim()),
      shellToolbarLabels: qa('.toolbar [data-foundation-command],.toolbar button').filter(visible).map(n => n.textContent.trim()),
      leftButtons: qa('#domainLeftRegion button').filter(visible).length,
      leftSections: qa('#domainLeftRegion h3').map(n => n.textContent.trim()),
      modeButtons: qa('.enterprise-modebar [data-mode]').map(n => n.textContent.trim()),
      centerButtons: qa('[data-region=CENTER] button').filter(visible).length,
      rightBlocks: qa('#domainContext h3').map(n => n.textContent.trim()),
      spatialNodes: qa('[data-region=CENTER] .spatial-host svg g[data-node], [data-region=CENTER] svg g[data-node], [data-region=CENTER] .spatial-node').length,
      spatialEdges: qa('[data-region=CENTER] .spatial-host svg [data-edge]').length,
      stateTokens: qa('.state-token').map(n => n.textContent.replace(/\s+/g, ' ').trim()),
      chips: qa('.ent-chip').length,
      tables: qa('[data-region=CENTER] table').length,
      tableRows: qa('[data-region=CENTER] table tbody tr').length,
      listItems: qa('[data-region=CENTER] .ent-list li').length,
      nodeTextOverlaps: (() => {
        const hits = [];
        qa('[data-region=CENTER] .spatial-node-card').forEach(card => {
          const texts = [...card.querySelectorAll('text')].filter(t => (t.textContent || '').trim() && t.getBoundingClientRect().width > 0);
          for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
            const a = texts[i].getBoundingClientRect(), b = texts[j].getBoundingClientRect();
            if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2)
              hits.push(`${(card.dataset.node || '').slice(0, 12)}:${texts[i].textContent.trim().slice(0, 16)}~${texts[j].textContent.trim().slice(0, 16)}`);
          }
        });
        return hits;
      })()
    },
    clipped, vertClip,
    emptyRegions: ['[data-region=TOP]', '[data-region=CENTER]'].concat(q('#domainLeftRegion') ? ['#domainLeftRegion'] : []).filter(s => words(text(s)) === 0)
  };
};

const enact = state => {
  const qa = s => [...document.querySelectorAll(s)];
  if (state === 'topology') return {ok: true, noop: true};
  if (state === 'selected') {
    const btn = document.querySelector('#domainLeftRegion [data-object]') || document.querySelector('[data-region=LEFT] [data-object]') || qa('[data-region=LEFT] [data-object]')[0];
    if (!btn) return {ok: false, reason: 'no data-object in structure region'};
    btn.click();
    return {ok: true, picked: btn.dataset.object};
  }
  if (state === 'composer') {
    const btn = document.querySelector('#foundationStage [data-command="enterprise.edit"]');
    if (!btn) return {ok: false, reason: 'no in-stage relation composer affordance'};
    if (btn.disabled) return {ok: false, reason: 'relation composer disabled: ' + (btn.title || '')};
    btn.click();
    const form = document.querySelector('#foundationStage [data-relation-composer]');
    return {ok: !!form, picked: btn.dataset.command, form: !!form};
  }
  const b = [...document.querySelectorAll('.enterprise-modebar [data-mode]')].find(n => n.dataset.mode === state);
  if (!b) return {ok: false, reason: `no [data-mode=${state}]`};
  b.click();
  return {ok: true, mode: state};
};

const capture = async () => {
  const dir = path.join(outRoot, label);
  await mkdir(dir, {recursive: true});
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(root, 'tools/serve.mjs'), '--port', String(port)], {cwd: root, stdio: 'ignore'});
  const browser = await chromium.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-color-profile=srgb', '--font-render-hinting=none']});
  const frames = [];
  const git = (() => { try { return execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root}).toString().trim(); } catch { return 'unknown'; } })();
  const dirty = (() => { try { return execFileSync('git', ['status', '--porcelain', '--', 'stack/native-typescript/surfaces/enterprise', 'stack/native-typescript/adapters/enterprise'], {cwd: root}).toString().trim(); } catch { return ''; } })();
  try {
    for (const c of CASES) {
      for (const state of c.states) {
        const context = await browser.newContext({viewport: {width: c.w, height: c.h}, reducedMotion: 'reduce', deviceScaleFactor: 1, locale: c.locale === 'ar' ? 'ar' : 'en-US'});
        await context.addInitScript(o => {
          try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: {global: {locale: o.locale, chromeDirection: o.dir}}})); } catch {}
        }, {locale: c.locale, dir: c.dir});
        const page = await context.newPage();
        const pageErrors = [];
        page.on('pageerror', e => pageErrors.push(String(e.message)));
        await page.goto(`http://127.0.0.1:${port}/?surface=enterprise`, {waitUntil: 'networkidle'});
        await page.waitForFunction(() => window.CEPFoundation?.consumer === 'enterprise', null, {timeout: 30000});
        await page.waitForTimeout(500);
        let action = {ok: true, noop: true};
        if (state !== 'topology') { action = await page.evaluate(enact, state); await page.waitForTimeout(450); }
        const p = await page.evaluate(probe);
        const file = `${c.id}-${state}.png`;
        const full = path.join(dir, file);
        await page.screenshot({path: full, fullPage: false});
        const bytes = await readFile(full);
        const {width, height} = pngDims(bytes);
        const identity = {path: path.relative(root, full), sha256: createHash('sha256').update(bytes).digest('hex'), width, height, bytes: bytes.length};
        frames.push({case: c.id, viewport: `${c.w}x${c.h}`, dir: c.dir, locale: c.locale, state, action, pageErrors, probe: p, image: identity, capturedAt: new Date().toISOString()});
        await context.close();
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }
  const receipt = {schemaVersion: 1, unit: 'W03-ENTERPRISE', surface: 'enterprise', label, candidate: {branch: 'writer/mi-serial', commit: git, worktreeDirtyEnterpriseFiles: dirty, build: 'tools/writer-serial.sh npm run build:runtime'}, capturedAt: new Date().toISOString(), frames};
  await writeFile(path.join(outRoot, `receipt-${label}.json`), JSON.stringify(receipt, null, 2));
  console.log(`captured ${frames.length} frames -> ${dir}`);
  for (const f of frames) console.log(`  ${f.image.path} ${f.image.width}x${f.image.height} sha=${f.image.sha256.slice(0, 12)} words=${f.probe.words.total} clipped=${f.probe.clipped.length} err=${f.pageErrors.length}`);
};

const compare = async (a, b) => {
  const ra = JSON.parse(await readFile(path.join(outRoot, `receipt-${a}.json`), 'utf8'));
  const rb = JSON.parse(await readFile(path.join(outRoot, `receipt-${b}.json`), 'utf8'));
  const rows = [];
  for (const fa of ra.frames) {
    const fb = rb.frames.find(x => x.case === fa.case && x.state === fa.state);
    if (!fb) continue;
    rows.push({case: fa.case, state: fa.state, sameBytes: fa.image.sha256 === fb.image.sha256, wordsA: fa.probe.words.total, wordsB: fb.probe.words.total, clippedA: fa.probe.clipped.length, clippedB: fb.probe.clipped.length, shaA: fa.image.sha256.slice(0, 10), shaB: fb.image.sha256.slice(0, 10)});
  }
  await writeFile(path.join(outRoot, `comparison-${a}-vs-${b}.json`), JSON.stringify({a, b, rows}, null, 2));
  console.table(rows);
};

if (args.includes('--compare')) await compare(args[args.indexOf('--compare') + 1], args[args.indexOf('--compare') + 2]);
else await capture();
