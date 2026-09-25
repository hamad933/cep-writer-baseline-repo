import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';

const executablePath = 'C:\\Users\\User\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';
const evidenceDir = 'D:\\projects\\Enterprise-Projects\\CEP_LOCAL_EVIDENCE\\D08_D06_D09_OWNER_GROUP_CURRENT_RUN\\03_D08_BROWSER_VISUAL';

fs.mkdirSync(evidenceDir, { recursive: true });

// Simple static server for repo root
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

server.listen(4180, async () => {
  try {
    const browser = await chromium.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });

    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4180/tools/d08-visualize-parity-harness.html');
    await page.waitForTimeout(500);

    const screenshotPath = path.join(evidenceDir, 'd08_visualize_parity_canvas_harness.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const proof = await page.evaluate(() => window.D08_PARITY_PROOF);
    const proofPath = path.join(evidenceDir, 'd08_visualize_parity_receipt.json');
    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));

    console.log('D08 visual captured successfully:', screenshotPath);
    console.log('D08 proof receipt saved:', proofPath);

    await browser.close();
  } catch (err) {
    console.error('Error during D08 capture:', err);
  } finally {
    server.close();
  }
});
