import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const executablePath = 'C:\\Users\\User\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';
const evidenceDir = 'D:\\projects\\Enterprise-Projects\\CEP_LOCAL_EVIDENCE\\PR01_D03A_D03B_CURRENT_RUN';
const candidateEvidenceDir = path.join(evidenceDir, '03_PR01_CANDIDATE');

if (!fs.existsSync(candidateEvidenceDir)) {
  fs.mkdirSync(candidateEvidenceDir, { recursive: true });
}

async function runCandidateProbe() {
  console.log('=== PR01 CANDIDATE BROWSER VERIFICATION PROBE ===');

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Step 1: Capture pure HTML first paint (no JS)
  console.log('Step 1: Capturing candidate pure HTML first paint (no JS)...');
  const noJsContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    javaScriptEnabled: false
  });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto('http://127.0.0.1:4173/?surface=library', { waitUntil: 'load' });
  const pureHtmlPath = path.join(candidateEvidenceDir, 'candidate_first_paint_pure_html_no_js.png');
  await noJsPage.screenshot({ path: pureHtmlPath });
  console.log('  -> Captured:', pureHtmlPath);
  await noJsContext.close();

  // Step 2: Normal load with JS enabled
  console.log('Step 2: Loading Library surface with JS enabled...');
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

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

  const t0 = Date.now();
  await page.goto('http://127.0.0.1:4173/?surface=library', { waitUntil: 'load' });
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', { timeout: 5000 });
  const loadTimeMs = Date.now() - t0;

  // Wait for initial network burst to settle
  await page.waitForTimeout(1000);

  const capturedSyncXhrs = await page.evaluate(() => window.__syncXhrLog || []);
  const initialDocRequests = documentRequests;
  const initialInputDirectionRequests = networkRequests.filter(r => r.url.includes('/v1/platform/input-direction')).length;

  console.log(`  -> Initial load time: ${loadTimeMs}ms`);
  console.log(`  -> Initial document requests: ${initialDocRequests}`);
  console.log(`  -> Captured synchronous XHRs: ${capturedSyncXhrs.length}`);
  console.log(`  -> Input direction requests: ${initialInputDirectionRequests}`);

  // Screenshot of settled library
  const libraryScreenshotPath = path.join(candidateEvidenceDir, 'candidate_library_settled.png');
  await page.screenshot({ path: libraryScreenshotPath });
  console.log('  -> Captured library settled:', libraryScreenshotPath);

  // Step 3: Test SPA In-App Navigation to Today (W01)
  console.log('Step 3: Clicking on W01 (Today) for SPA in-app navigation...');
  const docReqBeforeNav = documentRequests;

  await page.click('[data-shell-area="W01"]');
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', { timeout: 10000 });
  await page.waitForTimeout(500);

  const docReqAfterNav = documentRequests;
  const inAppDocReloads = docReqAfterNav - docReqBeforeNav;
  console.log(`  -> Document reloads during in-app navigation: ${inAppDocReloads}`);

  // Screenshot of settled today
  const todayScreenshotPath = path.join(candidateEvidenceDir, 'candidate_today_settled.png');
  await page.screenshot({ path: todayScreenshotPath });
  console.log('  -> Captured today settled:', todayScreenshotPath);

  // Step 4: Test Back/Forward History Traversal
  console.log('Step 4: Testing history back traversal...');
  const docReqBeforeBack = documentRequests;
  await page.goBack();
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'library', { timeout: 10000 });
  await page.waitForTimeout(500);
  const docReqAfterBack = documentRequests;
  const backReloads = docReqAfterBack - docReqBeforeBack;
  console.log(`  -> Document reloads on back: ${backReloads}`);

  console.log('Step 5: Testing history forward traversal...');
  const docReqBeforeFwd = documentRequests;
  await page.goForward();
  await page.waitForFunction(() => window.CEPFoundation?.consumer === 'today', { timeout: 10000 });
  await page.waitForTimeout(500);
  const docReqAfterFwd = documentRequests;
  const fwdReloads = docReqAfterFwd - docReqBeforeFwd;
  console.log(`  -> Document reloads on forward: ${fwdReloads}`);

  const report = {
    testTime: new Date().toISOString(),
    loadTimeMs,
    totalNetworkRequests: networkRequests.length,
    initialDocumentRequests: initialDocRequests,
    inAppNavigationDocumentReloads: inAppDocReloads,
    backNavigationDocumentReloads: backReloads,
    forwardNavigationDocumentReloads: fwdReloads,
    syncXhrCount: capturedSyncXhrs.length,
    syncXhrs: capturedSyncXhrs,
    inputDirectionRequests: initialInputDirectionRequests,
    assertions: {
      syncXhrCountZero: capturedSyncXhrs.length === 0,
      inputDirectionDeduplicated: initialInputDirectionRequests <= 1,
      inAppNavigationDocumentReloadsZero: inAppDocReloads === 0,
      backForwardReloadsZero: backReloads === 0 && fwdReloads === 0
    },
    allNetworkRequests: networkRequests
  };

  const reportPath = path.join(candidateEvidenceDir, 'candidate_measurements.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('  -> Measurements saved to:', reportPath);

  await browser.close();

  console.log('\n=== CANDIDATE PROBE SUMMARY ===');
  console.log('syncXhrCountZero:', report.assertions.syncXhrCountZero ? 'PASS (0)' : `FAIL (${capturedSyncXhrs.length})`);
  console.log('inputDirectionDeduplicated:', report.assertions.inputDirectionDeduplicated ? `PASS (${initialInputDirectionRequests})` : `FAIL (${initialInputDirectionRequests})`);
  console.log('inAppNavigationDocumentReloadsZero:', report.assertions.inAppNavigationDocumentReloadsZero ? 'PASS (0)' : `FAIL (${inAppDocReloads})`);
  console.log('backForwardReloadsZero:', report.assertions.backForwardReloadsZero ? 'PASS (0)' : 'FAIL');

  if (!report.assertions.syncXhrCountZero ||
      !report.assertions.inputDirectionDeduplicated ||
      !report.assertions.inAppNavigationDocumentReloadsZero ||
      !report.assertions.backForwardReloadsZero) {
    console.error('CRITICAL: One or more assertions failed!');
    process.exit(1);
  }

  console.log('ALL PR01 CANDIDATE CHECKS PASSED PERFECTLY!');
}

runCandidateProbe().catch(err => {
  console.error('Candidate probe error:', err);
  process.exit(1);
});
