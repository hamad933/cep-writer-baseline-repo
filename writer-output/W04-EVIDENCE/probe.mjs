#!/usr/bin/env node
/** W04-EVIDENCE read-only DOM/geometry probe (no writes besides stdout). */
import { chromium } from 'playwright';
const [wArg = '1505', hArg = '1045', lang = 'ar'] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: Number(wArg), height: Number(hArg) } });
await ctx.addInitScript(({ lang }) => { try { localStorage.setItem('cep-foundation.preferences.v1', JSON.stringify({ schemaVersion: 1, kind: 'cep-foundation-preferences', overrides: { global: { locale: lang, chromeDirection: lang === 'ar' ? 'rtl' : 'ltr' } } })); } catch {} }, { lang });
const page = await ctx.newPage();
await page.goto('http://localhost:4173/?surface=evidence', { waitUntil: 'load' });
await page.waitForFunction(() => window.CEPFoundation?.consumer === 'evidence', null, { timeout: 20000 });
await page.evaluate(() => {
  const d = window.CEPFoundation.m0Composition.group.evidence.domain;
  d.importEvidence({ id: 'pr-1', revisionId: 'pr-1-r1', title: 'Probe candidate', subject: 'probe', evidenceClaim: 'probe claim', criterionRefs: ['criteria:v4#integrity'], governedPurpose: 'probe', sourceId: 'SRC-1', sourceRevision: 'r1' });
  window.CEPFoundation.m0Composition.mounted.render();
});
await page.waitForTimeout(500);
const out = await page.evaluate(() => {
  const rect = sel => { const n = document.querySelector(sel); if (!n) return null; const r = n.getBoundingClientRect(); const cs = getComputedStyle(n); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, overflow: cs.overflow, padding: cs.padding }; };
  const q = sel => { const n = document.querySelector(sel); return n ? { html: n.outerHTML.slice(0, 2400), rect: rect(sel) } : null; };
  return {
    rects: Object.fromEntries(['#topRegion', '#domainToolbar', '#leftPane', '#centerPane', '#rightPane', '#bottomShelf', '#foundationStage', '#foundationStage .m0-studio-head', '#foundationStage .m0-workbench', '#domainLeftRegion', '#domainContext', '#leftPane .pbody', '#rightPane .pbody'].map(s => [s, rect(s)])),
    leftHTML: q('#domainLeftRegion'),
    rightHTML: q('#domainContext'),
    studioHeadHTML: q('#foundationStage .m0-studio-head'),
    toolbarHTML: q('#domainToolbar'),
    regionHeadHTML: q('#leftPane .phead') || q('#leftPane header'),
    bottomHTML: q('#bottomShelf'),
    workbenchChildren: [...document.querySelectorAll('#foundationStage .m0-workbench > *')].map(n => ({ tag: n.tagName, cls: n.className, h: Math.round(n.getBoundingClientRect().height) })),
    fonts: getComputedStyle(document.body).fontFamily
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
