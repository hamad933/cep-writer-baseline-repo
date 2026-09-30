/**
 * W02-RESEARCH-QUALITY view/state sweep: measures every surface-owned view (5 centre views,
 * 5 context tabs), a collapsed-pane state and a keyboard-focus state.
 * Same measured method as analyze.mjs (DOM geometry + contrast + overflow); image bytes are
 * hash-bound but NOT visually read, because the session image-return channel is stale.
 */
import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
const unitDir = path.join(root, 'writer-output/W02-RESEARCH-QUALITY');
const outDir = path.join(unitDir, 'analysis');

const parseColor = str => {
  str = String(str || '');
  const rgb = str.match(/rgba?\(([^)]+)\)/);
  if (rgb) { const n = rgb[1].split(/[\s,/]+/).map(Number); return [n[0] || 0, n[1] || 0, n[2] || 0, n.length > 3 && !Number.isNaN(n[3]) ? n[3] : 1]; }
  const s = str.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
  if (s) return [Number(s[1]) * 255, Number(s[2]) * 255, Number(s[3]) * 255, s[4] !== undefined ? Number(s[4]) : 1];
  return null;
};

const COLLECT = label => {
  const parseColor = str => {
    str = String(str || '');
    const rgb = str.match(/rgba?\(([^)]+)\)/);
    if (rgb) { const n = rgb[1].split(/[\s,/]+/).map(Number); return [n[0] || 0, n[1] || 0, n[2] || 0, n.length > 3 && !Number.isNaN(n[3]) ? n[3] : 1]; }
    const s = str.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/);
    if (s) return [Number(s[1]) * 255, Number(s[2]) * 255, Number(s[3]) * 255, s[4] !== undefined ? Number(s[4]) : 1];
    return null;
  };
  const offenders = [];
  document.querySelectorAll('#foundationStage *, #domainLeftRegion *, #domainContext *, #domainBottomRegion *, #domainToolbar *').forEach(el => {
    if (el.closest('.sr') || el.classList.contains('sr') || el.getAttribute('aria-hidden') === 'true') return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const overX = el.scrollWidth - el.clientWidth, overY = el.scrollHeight - el.clientHeight;
    const cs = getComputedStyle(el);
    if ((overX > 2 && cs.overflowX !== 'auto' && cs.overflowX !== 'scroll') || (overY > 2 && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll')) {
      offenders.push({ cls: String(el.className).slice(0, 50), overX, overY, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50) });
    }
  });
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = el => { const chain = []; let n = el; while (n) { const c = parseColor(getComputedStyle(n).backgroundColor); if (c) chain.push(c); n = n.parentElement; } let base = [6, 16, 26, 1]; for (let i = chain.length - 1; i >= 0; i--) { const [r, g, b, a] = chain[i]; base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a), 1]; } return base; };
  const contrast = [];
  document.querySelectorAll('#foundationStage *, #domainLeftRegion *, #domainContext *, #domainBottomRegion *').forEach(el => {
    if (!el.textContent?.trim()) return;
    if (el.children.length && ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const cs = getComputedStyle(el);
    const fg = parseColor(cs.color); if (!fg) return;
    const bg = bgOf(el.parentElement || el);
    const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
    const size = parseFloat(cs.fontSize);
    const large = size >= 18 || (size >= 14 && parseInt(cs.fontWeight, 10) >= 700);
    const need = large ? 3 : 4.5;
    if (ratio < need) contrast.push({ cls: String(el.className).slice(0, 50), ratio: Math.round(ratio * 100) / 100, size: `${size}px`, need, text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50) });
  });
  const stage = document.querySelector('#foundationStage');
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  const active = document.activeElement;
  return {
    label,
    offenders,
    contrastFails: contrast.slice(0, 20),
    stageScroll: stage ? stage.scrollHeight - stage.clientHeight : null,
    stageChildren: stage ? stage.firstElementChild?.children.length : null,
    active: active ? `${active.tagName}.${String(active.className).split(' ')[0]}[${active.getAttribute('data-rq-action') || active.getAttribute('data-foundation-command') || active.getAttribute('data-rq-command') || ''}]` : null,
    textLen: (document.body.innerText || '').length
  };
};

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const results = [];

const VIEWS = ['compare', 'claims', 'provenance', 'revision', 'history'];
const TABS = ['overview', 'attributes', 'marks', 'order', 'history'];

for (const dir of ['rtl', 'ltr']) {
  const ctx = await browser.newContext({ viewport: { width: 1505, height: 1045 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e)));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('ERR_CONNECTION_REFUSED')) errors.push(m.text()); });
  await page.addInitScript(({ locale, chromeDirection }) => {
    try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale, chromeDirection, contentDirection: chromeDirection } } })); } catch {}
  }, { locale: dir === 'rtl' ? 'ar' : 'en', chromeDirection: dir });
  await page.goto(`http://localhost:4173/?surface=rq&sweep=${Date.now()}`, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  for (const view of VIEWS) {
    await page.click(`#domainToolbar [data-foundation-command="rq.view.${view}"]`);
    await page.waitForTimeout(350);
    results.push({ direction: dir, kind: 'view', id: view, ...await page.evaluate(COLLECT, `view:${view}`) });
    const shot = await page.screenshot({ path: path.join(outDir, `view-${view}-${dir}.png`) });
    results[results.length - 1].image = { path: `writer-output/W02-RESEARCH-QUALITY/analysis/view-${view}-${dir}.png`, sha256: createHash('sha256').update(shot).digest('hex'), bytes: shot.length };
  }

  // action-chip behaviour: select a claim that has a single source, then use two chips
  await page.click('#domainToolbar [data-foundation-command="rq.view.compare"]');
  await page.waitForTimeout(250);
  await page.click('#foundationStage [data-rq-action="select-claim"][data-claim="C-033"]');
  await page.waitForTimeout(250);
  const chipsBefore = await page.evaluate(() => [...document.querySelectorAll('#foundationStage .rq-chip')].map(b => ({ t: b.textContent.trim(), disabled: b.disabled, title: b.getAttribute('title') })));
  await page.click('#foundationStage .rq-chip[data-rq-command="rq.action.requestSource"]');
  await page.waitForTimeout(300);
  await page.click('#foundationStage .rq-chip[data-rq-command="rq.action.conflict"]');
  await page.waitForTimeout(300);
  const afterAction = await page.evaluate(() => ({
    chips: [...document.querySelectorAll('#foundationStage .rq-chip')].map(b => ({ t: b.textContent.trim(), disabled: b.disabled })),
    claimRow: (() => { const r = document.querySelector('#foundationStage tr[data-rq-claim="C-033"]'); return r ? { selected: r.getAttribute('aria-selected'), status: r.querySelector('.rq-pill')?.textContent.trim() } : null; })(),
    bottomSummary: document.querySelector('#bottomSummary')?.textContent,
    status: document.querySelector('#foundationStatus')?.textContent
  }));
  results.push({ direction: dir, kind: 'action', id: 'requestSource+conflict', chipsBefore, afterAction });

  for (const tab of TABS) {
    await page.click(`#domainContext [data-rq-action="context-tab"][data-tab="${tab}"]`).catch(() => {});
    await page.waitForTimeout(300);
    results.push({ direction: dir, kind: 'contextTab', id: tab, ...await page.evaluate(COLLECT, `tab:${tab}`) });
  }

  // keyboard: focus a view tab and press Enter, then verify focus survived the re-render
  await page.evaluate(() => document.querySelector('#domainToolbar [data-foundation-command="rq.view.provenance"]')?.focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  results.push({ direction: dir, kind: 'keyboard', id: 'view-tab-enter', ...await page.evaluate(COLLECT, 'keyboard') });
  await page.evaluate(() => document.querySelector('#foundationStage .rq-radio')?.focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  results.push({ direction: dir, kind: 'keyboard', id: 'claim-radio-enter', ...await page.evaluate(COLLECT, 'keyboard-radio') });

  // collapsed panes (deliberate collapse comparison)
  await page.evaluate(() => { window.CEPFoundation?.api?.togglePane?.('left'); window.CEPFoundation?.api?.togglePane?.('right'); });
  await page.waitForTimeout(400);
  results.push({ direction: dir, kind: 'collapsed', id: 'both-panes-collapsed', ...await page.evaluate(COLLECT, 'collapsed'), shell: await page.evaluate(() => ({ left: document.getElementById('leftPane')?.dataset.state, right: document.getElementById('rightPane')?.dataset.state, hScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth })) });
  const shot = await page.screenshot({ path: path.join(outDir, `collapsed-${dir}.png`) });
  results[results.length - 1].image = { path: `writer-output/W02-RESEARCH-QUALITY/analysis/collapsed-${dir}.png`, sha256: createHash('sha256').update(shot).digest('hex'), bytes: shot.length };

  if (errors.length) results.push({ direction: dir, kind: 'errors', id: 'console', errors });
  await ctx.close();
}
await browser.close();

const report = { schemaVersion: 1, unit: 'W02-RESEARCH-QUALITY', surface: 'rq', generatedAt: new Date().toISOString(), note: 'image bytes are hash-bound evidence; the session image-return channel is stale, so visual judgement used measured DOM/pixel metrics', results };
await writeFile(path.join(outDir, 'AUDIT_VIEWS.json'), JSON.stringify(report, null, 2));

let problems = 0;
for (const r of results) {
  if (r.kind === 'errors') { console.log('CONSOLE ERRORS', r.direction, JSON.stringify(r.errors)); problems += r.errors.length; continue; }
  if (r.kind === 'action') { console.log('ACTION', r.direction, JSON.stringify(r.afterAction)); continue; }
  const bad = (r.offenders?.length || 0) + (r.contrastFails?.length || 0);
  if (bad) problems += bad;
  console.log(`${r.kind.padEnd(11)} ${r.id.padEnd(22)} ${r.direction} offenders=${r.offenders?.length ?? '-'} contrast=${r.contrastFails?.length ?? '-'} scroll=${r.stageScroll ?? '-'} active=${r.active ?? '-'}`,
    bad ? JSON.stringify({ off: r.offenders?.slice(0, 3), con: r.contrastFails?.slice(0, 3) }) : '');
}
console.log('TOTAL_PROBLEMS', problems);
