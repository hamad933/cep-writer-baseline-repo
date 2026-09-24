import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const executablePath = 'C:\\Users\\User\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';
const evidenceDir = 'D:\\projects\\Enterprise-Projects\\CEP_LOCAL_EVIDENCE\\PR01_D03A_D03B_CURRENT_RUN';
const parentEvidenceDir = path.join(evidenceDir, '02_PR01_PARENT');

async function probe() {
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }
  });

  const page = await context.newPage();

  const requests = [];
  const consoleMessages = [];
  let documentRequests = 0;

  // Track all requests
  page.on('request', req => {
    requests.push({ url: req.url(), resourceType: req.resourceType(), method: req.method() });
    if (req.resourceType() === 'document') {
      documentRequests++;
    }
  });

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  // Inject early script to detect sync XHR and observe first paint / DOM mutations
  await page.addInitScript(() => {
    window.__cepEarlyMetrics = {
      firstVisibleElements: null,
      firstVisibleDonorBanner: false,
      firstVisibleDonorEditor: false,
      firstVisibleFoundationShell: false,
      syncXhrCount: 0,
      syncXhrUrls: []
    };

    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
      if (async === false) {
        window.__cepEarlyMetrics.syncXhrCount++;
        window.__cepEarlyMetrics.syncXhrUrls.push(String(url));
        console.warn('PARENT_PROBE_SYNC_XHR_DETECTED:' + url);
      }
      return origOpen.apply(this, arguments);
    };

    document.addEventListener('DOMContentLoaded', () => {
      window.__cepEarlyMetrics.firstVisibleDonorBanner = Boolean(document.querySelector('#topBanner'));
      window.__cepEarlyMetrics.firstVisibleDonorEditor = Boolean(document.querySelector('#editorDocument'));
      window.__cepEarlyMetrics.firstVisibleFoundationShell = Boolean(document.querySelector('.foundation-shell'));
    });
  });

  console.log('Navigating to http://127.0.0.1:4173/?surface=today ...');
  const navStart = Date.now();
  await page.goto('http://127.0.0.1:4173/?surface=today', { waitUntil: 'domcontentloaded' });

  // Take screenshot at earliest commit / DOMContentLoaded
  const earlyScreenshotPath = path.join(parentEvidenceDir, 'parent_today_early_frame.png');
  await page.screenshot({ path: earlyScreenshotPath });
  console.log('Captured early frame:', earlyScreenshotPath);

  // Wait for settled state
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', { timeout: 10000 });
  const settledNavMs = Date.now() - navStart;

  const settledScreenshotPath = path.join(parentEvidenceDir, 'parent_today_settled.png');
  await page.screenshot({ path: settledScreenshotPath });
  console.log('Captured settled frame:', settledScreenshotPath);

  const metrics = await page.evaluate(() => window.__cepEarlyMetrics);

  // Now test in-app navigation document reload: click on Visualize link in global shell
  console.log('Testing in-app navigation from Today to Visualize...');
  const docReqsBeforeNav = documentRequests;

  const navPromise = page.waitForNavigation({ waitUntil: 'load' }).catch(() => null);
  await page.click('[data-shell-destination="visualize"]');
  await navPromise;

  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'visualize', { timeout: 10000 });
  const docReqsAfterNav = documentRequests;
  const newDocumentLoads = docReqsAfterNav - docReqsBeforeNav;

  const parentReport = {
    testTime: new Date().toISOString(),
    startupToSettledMs: settledNavMs,
    initialDocumentRequests: docReqsBeforeNav,
    inAppNavigationDocumentLoads: newDocumentLoads,
    syncXhrCount: metrics.syncXhrCount,
    syncXhrUrls: metrics.syncXhrUrls,
    firstVisibleDonorBanner: metrics.firstVisibleDonorBanner,
    firstVisibleDonorEditor: metrics.firstVisibleDonorEditor,
    firstVisibleFoundationShell: metrics.firstVisibleFoundationShell,
    inputDirectionRequests: requests.filter(r => r.url.includes('/v1/platform/input-direction')).length,
    requestsSummary: requests.map(r => `${r.method} ${r.resourceType} ${r.url}`)
  };

  console.log('Parent Probe Results:\n', JSON.stringify(parentReport, null, 2));

  fs.writeFileSync(path.join(parentEvidenceDir, 'parent_probe_results.json'), JSON.stringify(parentReport, null, 2));

  await browser.close();
  return parentReport;
}

probe().catch(err => {
  console.error('PROBE ERROR:', err);
  process.exit(1);
});
