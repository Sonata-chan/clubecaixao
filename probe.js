const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');

async function run() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url.split('?')[0]);
    if (filePath.endsWith('/')) filePath += 'index.html';
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
    };
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  server.listen(8000, '127.0.0.1');

  const browser = await chromium.launch({
    args: ['--use-gl=swiftshader', '--no-sandbox', '--disable-software-rasterizer', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`PAGE ${msg.type().toUpperCase()}:`, msg.text());
  });
  page.on('pageerror', err => console.log('PAGE UNCAUGHT ERROR:', err.message));

  try {
    console.log('Navigating...');
    await page.goto('http://127.0.0.1:8000/index.html?testMode=1&testCase=boot');
    console.log('Waiting 15 seconds...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    const snapshot = await page.evaluate(() => {
      const data = window.__CLUBECAIXAO_TEST__ || {};
      const scene = (window.SceneManager && window.SceneManager._scene) ? window.SceneManager._scene.constructor.name : 'Unknown';
      return { data, scene };
    });
    
    console.log('FINAL_RESULT_START');
    console.log(JSON.stringify(snapshot, null, 2));
    console.log('FINAL_RESULT_END');

  } catch (err) {
    console.error('Probe failed:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
}

run();
