import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const executablePath = 'C:\\Users\\User\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';
const evidenceDir = 'D:\\projects\\Enterprise-Projects\\CEP_LOCAL_EVIDENCE\\PR01_D03A_D03B_CURRENT_RUN';
const parentEvidenceDir = path.join(evidenceDir, '02_PR01_PARENT');

async function probeLibrary() {
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }
  });

  const page = await context.newPage();

  const syncXhrs = [];
  const networkRequests = [];
  let documentRequests = 0;

  page.on('request', req => {
    networkRequests.push({ url: req.url(), method: req.method(), type: req.resourceType() });
    if (req.resourceType() === 'document') documentRequests++;
  });

  await page.addInitScript(() => {
    window.__syncXhrLog = [];
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
      this.__isSync = (async === false);
      this.__url = String(url);
      this.__method = method;
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function(body) {
      if (this.__isSync) {
        window.__syncXhrLog.push({ url: this.__url, method: this.__method, timestamp: Date.now() });
      }
      return origSend.apply(this, arguments);
    };
  });

  console.log('Navigating to http://127.0.0.1:4173/?surface=library ...');
  const t0 = Date.now();
  await page.goto('http://127.0.0.1:4173/?surface=library', { waitUntil: 'load' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', { timeout: 10000 });
  const loadTimeMs = Date.now() - t0;

  const capturedSyncXhrs = await page.evaluate(() => window.__syncXhrLog);

  // Take screenshot of settled library
  const settledLibraryPath = path.join(parentEvidenceDir, 'parent_library_settled.png');
  await page.screenshot({ path: settledLibraryPath });

  // Test in-app navigation: click on W01 (Today)
  console.log('Testing in-app navigation to W01 (Today)...');
  const docReqBefore = documentRequests;
  const navPromise = page.waitForNavigation({ waitUntil: 'load' });
  await page.click('[data-shell-area="W01"]');
  await navPromise;
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', { timeout: 10000 });
  const docReqAfter = documentRequests;
  const inAppDocReloads = docReqAfter - docReqBefore;

  const report = {
    testTime: new Date().toISOString(),
    loadTimeMs,
    totalNetworkRequests: networkRequests.length,
    initialDocumentRequests: docReqBefore,
    inAppNavigationDocumentReloads: inAppDocReloads,
    syncXhrCount: capturedSyncXhrs.length,
    syncXhrs: capturedSyncXhrs,
    inputDirectionRequests: networkRequests.filter(r => r.url.includes('/v1/platform/input-direction')).length,
    allNetworkRequests: networkRequests
  };

  console.log('Parent Library Probe Report:\n', JSON.stringify(report, null, 2));

  fs.writeFileSync(path.join(parentEvidenceDir, 'parent_baseline_measurements.json'), JSON.stringify(report, null, 2));

  await browser.close();
  return report;
}

probeLibrary().catch(err => {
  console.error('PROBE ERROR:', err);
  process.exit(1);
});
