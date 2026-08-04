import * as childProcess from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const outputDirectory = path.join(root, 'assets', 'spec');
const captures = [
  ['16-lead-final.png', 'mobile-leads.html?lead=lead-1042&tab=edit&role=manager'],
  ['17-tour-final.png', 'tour-operations.html?tourId=china&tourSection=overview&role=manager'],
  ['18-tourist-profile-final.png', 'tour-operations.html?tourId=china&tourist=t1&touristSection=profile&role=manager'],
  ['19-tourist-tour-final.png', 'tour-operations.html?tourId=china&tourist=t1&touristSection=tour&expand=tour-context&role=manager'],
  ['20-summary-final.png', 'tour-operations.html?tourId=china&tourSection=summary&role=manager'],
  ['21-team-final.png', 'tour-operations.html?tourId=china&tourSection=team&role=manager'],
  ['22-statuses-final.png', 'tour-operations.html?tourId=china&view=statuses&role=manager'],
];

function browserPath() {
  const candidates = [
    process.env.PROTOTYPE_BROWSER,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function serveFile(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1/').pathname);
  const requested = pathname === '/' ? 'tour-operations.html' : pathname.slice(1);
  const resolved = path.resolve(root, requested);
  if (!resolved.startsWith(`${root}${path.sep}`) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    response.writeHead(404).end('Not found');
    return;
  }
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };
  response.writeHead(200, { 'Content-Type': types[path.extname(resolved)] || 'application/octet-stream' });
  fs.createReadStream(resolved).pipe(response);
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForJson(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (_) {}
    await delay(100);
  }
  throw new Error(`Chrome DevTools did not start at ${url}`);
}

async function main() {
  if (typeof WebSocket !== 'function') throw new Error('Node.js with global WebSocket support is required');
  const executable = browserPath();
  if (!executable) throw new Error('Chrome/Chromium not found; set PROTOTYPE_BROWSER');

  fs.mkdirSync(outputDirectory, { recursive: true });
  const server = http.createServer(serveFile);
  const port = await listen(server);
  const debugServer = http.createServer();
  const debugPort = await listen(debugServer);
  await close(debugServer);
  const profileDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'unique-guide-captures-'));
  const browser = childProcess.spawn(executable, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-background-networking',
    '--disable-default-apps', '--disable-extensions', '--disable-sync', '--no-first-run',
    `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDirectory}`, 'about:blank',
  ], { stdio: 'ignore' });

  try {
    const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
    const target = targets.find((item) => item.type === 'page');
    if (!target) throw new Error('Chrome did not expose a page target');
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });

    let nextId = 0;
    const pending = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callback.reject(new Error(JSON.stringify(message.error)));
      else callback.resolve(message.result);
    });
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });

    await call('Page.enable');
    await call('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, screenWidth: 390, screenHeight: 844, deviceScaleFactor: 2, mobile: true,
    });
    for (const [filename, page] of captures) {
      await call('Page.navigate', { url: `http://127.0.0.1:${port}/${page}` });
      await delay(450);
      const screenshot = await call('Page.captureScreenshot', {
        format: 'png', fromSurface: true, captureBeyondViewport: false,
      });
      fs.writeFileSync(path.join(outputDirectory, filename), Buffer.from(screenshot.data, 'base64'));
      console.log(`Captured ${filename}`);
    }
    socket.close();
  } finally {
    browser.kill('SIGTERM');
    await close(server);
    fs.rmSync(profileDirectory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
