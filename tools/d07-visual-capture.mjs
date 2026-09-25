// D07 Today visual proof capture — TEST_ONLY harness + NORMAL_PRODUCT_TRUTH.
// Evidence-only tool; never mutates Product source. Screenshots prove Presentation only.
import {chromium} from 'playwright';
import {mkdir, writeFile} from 'node:fs/promises';

const ROOT = 'D:/projects/Enterprise-Projects/CEP_LOCAL_EVIDENCE/WAVE2_RESUME_D05_D07_D10_D06_CURRENT_RUN';
const OUT = `${ROOT}/04_D07_POPULATED_PRESENTATION`;
const NORMAL_OUT = `${ROOT}/03_D07_NORMAL_PRODUCT`;
// Repo-root static server (serves /tools/... and /dist/...) started by the caller on 4175.
const BASE = 'http://127.0.0.1:4175';
await mkdir(OUT, {recursive: true});
await mkdir(NORMAL_OUT, {recursive: true});

const HARNESS_URL = `${BASE}/tools/d07-today-visual-harness.html`;
const NORMAL_URL = `${BASE}/tools/d07-normal-product-probe.tmp.html`;
const RTL_URL = `${BASE}/tools/d07-rtl-probe.tmp.html`;

const browser = await chromium.launch();
const rows = [];
const record = (id, status, detail) => rows.push({id, status, detail});

for (const vp of [{name: '1440x1000', width: 1440, height: 1000}, {name: '1024x900', width: 1024, height: 900}]) {
  const page = await browser.newPage({viewport: {width: vp.width, height: vp.height}});
  await page.goto(HARNESS_URL, {waitUntil: 'networkidle'});
  await page.waitForTimeout(600);
  const truth = await page.evaluate(() => ({
    harness: document.documentElement.dataset.harnessTruth || null,
    hasProof: !!window.D07_PRESENTATION_PROOF,
    state: window.D07_PRESENTATION_PROOF?.projection?.state || null,
    items: window.D07_PRESENTATION_PROOF?.projection?.items?.length ?? null,
    normalTruth: window.D07_PRESENTATION_PROOF?.normalProductProviderTruth || null
  }));
  await page.screenshot({path: `${OUT}/d07_populated_full_${vp.name}.png`, fullPage: true});
  const crop = async (selector, name) => {
    const el = await page.$(selector);
    if (el) await el.screenshot({path: `${OUT}/d07_crop_${name}_${vp.name}.png`});
    return !!el;
  };
  const crops = {
    greeting: await crop('.today-greeting-row', 'greeting-day-context'),
    hero: await crop('.today-session-card', 'continue-session-hero'),
    attention: await crop('#todayAttentionSidebar', 'attention-rail'),
    recent: await crop('#todayRecentCard', 'recent-progress')
  };
  record(`d07.visual.populated.${vp.name}`, truth.state === 'AVAILABLE_DATA' ? 'PASS' : 'FAIL', {truth, crops, viewport: vp});
  await page.close();

  const np = await browser.newPage({viewport: {width: vp.width, height: vp.height}});
  await np.goto(NORMAL_URL, {waitUntil: 'networkidle'});
  await np.waitForTimeout(400);
  const normalTruth = await np.evaluate(() => ({
    state: window.D07_NORMAL_TRUTH?.projection?.state,
    reason: window.D07_NORMAL_TRUTH?.projection?.sources?.[0]?.reason,
    items: window.D07_NORMAL_TRUTH?.projection?.items?.length,
    canonicalWrites: window.D07_NORMAL_TRUTH?.receipt?.canonicalWrites
  }));
  await np.screenshot({path: `${NORMAL_OUT}/d07_normal_product_unavailable_${vp.name}.png`, fullPage: true});
  record(`d07.visual.normal-product.${vp.name}`, normalTruth.state === 'UNAVAILABLE' ? 'PASS' : 'FAIL', normalTruth);
  await np.close();
}

// RTL spatial ordering probe: attention rail must sit on the physical right in RTL logical layout
const rtlPage = await browser.newPage({viewport: {width: 1440, height: 1000}});
await rtlPage.goto(RTL_URL, {waitUntil: 'networkidle'});
await rtlPage.waitForTimeout(500);
const rtl = await rtlPage.evaluate(() => {
  const layout = document.querySelector('.today-layout');
  const attention = document.querySelector('#todayAttentionSidebar');
  const main = document.querySelector('.today-main');
  const cs = layout ? getComputedStyle(layout) : null;
  const ar = attention?.getBoundingClientRect(), mr = main?.getBoundingClientRect();
  return {gridAreas: cs?.gridTemplateAreas || null, direction: cs?.direction || null,
    attentionRight: ar && mr ? ar.right >= mr.right : null,
    attentionX: ar?.x ?? null, mainX: mr?.x ?? null};
});
await rtlPage.screenshot({path: `${OUT}/d07_rtl_spatial_1440x1000.png`, fullPage: true});
record('d07.visual.rtl-spatial-order', rtl.attentionRight === true ? 'PASS' : 'FAIL', rtl);
await rtlPage.close();

await browser.close();
const fail = rows.filter(r => r.status === 'FAIL').length;
const receipt = {suite: 'D07_VISUAL_CAPTURE', classification: 'TEST_ONLY_PRESENTATION_HARNESS__NOT_PRODUCT_PROVIDER_TRUTH', pass: rows.length - fail, fail, rows};
await writeFile(`${OUT}/d07_visual_capture_receipt.json`, JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
if (fail) process.exitCode = 1;

