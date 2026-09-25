import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const executablePath = 'C:\\Users\\User\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';
const evidenceDir = 'D:\\projects\\Enterprise-Projects\\CEP_LOCAL_EVIDENCE\\D08_D06_D09_OWNER_GROUP_CURRENT_RUN\\15_D09_BROWSER_VISUAL';

fs.mkdirSync(evidenceDir, { recursive: true });

const server = http.createServer((req, res) => {
  const safePath = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(process.cwd(), safePath === '/' ? 'index.html' : safePath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4182, async () => {
  try {
    const browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 }
    });

    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4182/tools/d09-w03-studios-harness.html');
    await page.waitForTimeout(600);

    const screenshotPath = path.join(evidenceDir, 'd09_results_historical_analysis_studio.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const proof = await page.evaluate(() => window.D09_STUDIOS_PROOF);
    const proofPath = path.join(evidenceDir, 'd09_w03_studios_receipt.json');
    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));

    console.log('D09 visual captured successfully:', screenshotPath);
    console.log('D09 proof receipt saved:', proofPath);

    await browser.close();
  } catch (err) {
    console.error('Error during D09 capture:', err);
  } finally {
    server.close();
  }
});
