import { chromium } from 'playwright';
import path from 'node:path';

const executablePath = 'C:\\Users\\User\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';
const evidenceDir = 'D:\\projects\\Enterprise-Projects\\CEP_LOCAL_EVIDENCE\\PR01_D03A_D03B_CURRENT_RUN';
const parentEvidenceDir = path.join(evidenceDir, '02_PR01_PARENT');

async function capturePureHtml() {
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    javaScriptEnabled: false
  });

  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/?surface=today');
  const pureHtmlPath = path.join(parentEvidenceDir, 'parent_first_paint_pure_html_no_js.png');
  await page.screenshot({ path: pureHtmlPath });
  console.log('Captured first paint pure HTML (no JS):', pureHtmlPath);

  await browser.close();
}

capturePureHtml().catch(console.error);
