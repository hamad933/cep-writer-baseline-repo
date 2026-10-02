/**
 * PRC-1 CSS rule probe — proves F1 (dropped `.p-head h1` rule) and F2 (unscoped
 * `[data-tone]` rules) with a real CSS parser (Chromium CSSStyleSheet), comparing
 * BASELINE adapter bytes (exact parent fe1bb98) against CANDIDATE bytes (working tree).
 *
 * Read-only against the repo. Output: writer-output/W05-PROCESSING/evidence/CSS_RULE_PROBE.json
 */
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const REL = 'stack/native-typescript/adapters/processing-runtime.ts';
const BASELINE_COMMIT = 'fe1bb98ded51adc71a5f5fd14142a2c0880c11bc';

const sha = text => createHash('sha256').update(text).digest('hex');
const stylesOf = source => [...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m => m[1]);

const baseline = execSync(`git show ${BASELINE_COMMIT}:${REL}`, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 24 });
const candidate = await readFile(path.join(root, REL), 'utf8');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

/** Returns the list of parsed rules (selectorText or full cssText) for one stylesheet. */
const parse = async css => page.evaluate(text => {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(text);
  return [...sheet.cssRules].map(rule => ({
    kind: rule.constructor.name,
    selector: rule.selectorText || null,
    text: rule.cssText
  }));
}, css);

const report = { schemaVersion: 1, probe: 'PRC1_CSS_RULE_PROBE', parsedWith: `Chromium ${await browser.version()} CSSStyleSheet`, baseline: {}, candidate: {}, findings: [] };

for (const [key, source] of [['baseline', baseline], ['candidate', candidate]]) {
  const blocks = stylesOf(source);
  const parsed = [];
  for (const css of blocks) parsed.push(...await parse(css));
  report[key] = {
    commit: key === 'baseline' ? BASELINE_COMMIT : 'WORKING_TREE',
    sourceSha256: sha(source),
    styleBlocks: blocks.length,
    parsedRuleCount: parsed.length,
    selectors: parsed.map(r => r.selector).filter(Boolean)
  };
}

const has = (key, selector) => report[key].selectors.includes(selector);
const startsWith = (key, prefix) => report[key].selectors.filter(s => s && s.startsWith(prefix));

report.findings.push({
  id: 'F1.dropped-p-head-h1-rule',
  baselineHasRule: has('baseline', '.p-head h1'),
  candidateHasRule: has('candidate', '.p-head h1'),
  baselineSelectorsWithPHead: startsWith('baseline', '.p-head'),
  candidateSelectorsWithPHead: startsWith('candidate', '.p-head'),
  proven: has('baseline', '.p-head h1') === false && has('candidate', '.p-head h1') === true,
  explanation: 'Baseline selector `;margin-block-start:26px.p-head h1` is not a valid selector, so the CSS parser discards the whole qualified rule (.p-head h1{...} never applies) and `margin-block-start:26px` never reaches any element.'
});
report.findings.push({
  id: 'F2.unscoped-data-tone-rules',
  baselineGlobalToneSelectors: startsWith('baseline', '[data-tone'),
  candidateGlobalToneSelectors: startsWith('candidate', '[data-tone'),
  proven: startsWith('baseline', '[data-tone').length > 0 && startsWith('candidate', '[data-tone').length === 0,
  explanation: 'Baseline mount injected document-global `[data-tone=...]` color rules (other surfaces also render data-tone markup); candidate scopes every tone rule under processing-owned roots only.'
});

report.allProven = report.findings.every(f => f.proven === true);

const outDir = path.join(here, 'evidence');
await mkdir(outDir, { recursive: true });
const outPath = path.join(outDir, 'CSS_RULE_PROBE.json');
await writeFile(outPath, JSON.stringify(report, null, 2) + '\n');
await browser.close();
console.log(JSON.stringify({ outPath, allProven: report.allProven, baselineRules: report.baseline.parsedRuleCount, candidateRules: report.candidate.parsedRuleCount, findings: report.findings.map(f => ({ id: f.id, proven: f.proven })) }, null, 2));
if (!report.allProven) process.exitCode = 1;
