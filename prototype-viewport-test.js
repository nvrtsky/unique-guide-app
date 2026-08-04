import assert from 'node:assert';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const browserCandidates = [
  process.env.PROTOTYPE_BROWSER,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const CHROME = browserCandidates.find((candidate) => fs.existsSync(candidate));
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
];
const ROUTES = [
  { path: '/tour-operations.html?tourId=china&tourSection=overview', expect: ['Гранд-тур по Китаю', 'Обзор'] },
  { path: '/tour-operations.html?tourId=china&tourSection=summary', expect: ['Прибытие', 'Отель', 'Отъезд'] },
  { path: '/tour-operations.html?tourId=china&tourSection=summary&summarySection=tourists', expect: ['Участники тура', 'Туристы'] },
  { path: '/tour-operations.html?tourId=china&tourSection=summary&summarySection=documents', expect: ['Документы туристов', 'Документы'] },
  { path: '/tour-operations.html?tourId=china&tourSection=summary&summarySection=statuses', expect: ['Статусы на маршруте', 'Статусы'] },
  { path: '/tour-operations.html?tourId=china&view=statuses&routeCityId=route-xian-1', expect: ['Статусы на маршруте', 'Сиань', 'Статусы'] },
  { path: '/tour-operations.html?tourId=china&tourSection=program', expect: ['Гранд-тур по Китаю', 'Программа'] },
  { path: '/tour-operations.html?tourId=china&tourSection=team', expect: ['Гранд-тур по Китаю', 'Команда'] },
  { path: '/tour-operations.html?tourId=china&tourSection=team&role=viewer', expect: ['Гранд-тур по Китаю', 'Гиды по городам', 'Пекин', 'Сиань'], reject: ['Шанхай', 'Сопровождающий', 'Администраторы чата'] },
  { path: '/tour-operations.html?tourId=china&tourSection=summary&routeCityId=route-shanghai-1&role=viewer', expect: ['Пекин · остановка 1', 'Гид'], reject: ['Шанхай', 'Пекин · остановка 2'] },
  { path: '/tour-operations.html?tourId=china&tourSection=tasks', expect: ['Гранд-тур по Китаю', 'Задачи'] },
  { path: '/tour-operations.html?tourId=china&tourSection=actions', expect: ['Гранд-тур по Китаю', 'Действия'] },
  { path: '/tour-operations.html?tourId=china&tourSection=actions&role=admin', expect: ['Закрыть тур', 'Архивировать', 'Удалить'], reject: [] },
  { path: '/tour-operations.html?tourId=china&tourSection=actions&role=manager', expect: ['Закрыть тур'], reject: ['Архивировать', 'Удалить тур'] },
  { path: '/tour-operations.html?tourId=china&view=tourists&tourist=t1&touristSection=profile', expect: ['Соколова', 'Личные данные'] },
  { path: '/tour-operations.html?tourId=china&view=tourists&tourist=t1&touristSection=tour&expand=tour-context', expect: ['Соколова', 'В туре', 'Комментарий для гида', 'Выбранный тур', 'Основной турист заявки', 'Ограниченный маршрут'] },
  { path: '/tour-operations.html?tourId=china&view=tourists&tourist=t1&touristSection=profile&role=viewer', expect: ['Соколова', 'Гид', 'Личные данные', 'Загранпаспорт'], reject: ['Паспорт РФ', 'Исходный лид'] },
  { path: '/tour-operations.html?tourId=china&view=tourists&tourist=t1&touristSection=profile&role=guide', expect: ['Соколова', 'Гид', 'Личные данные', 'Загранпаспорт'], reject: ['Паспорт РФ', 'Исходный лид'] },
  { path: '/tour-operations.html?tourId=china&tourSection=overview&role=superadmin', expect: ['Тур не назначен текущей роли', 'Персональные данные и операции скрыты'], reject: ['Соколова', 'anna.sokolova@example.com', '189 000'], minTargets: 3 },
  { path: '/mobile-leads.html?lead=lead-1042', expect: ['Соколова Анна', 'Редактировать', 'Чат', 'Документы', 'Задачи'] },
  { path: '/mobile-leads.html?lead=lead-1042&role=admin', expect: ['Соколова Анна', 'Удалить лид', 'Обновить'] },
  { path: '/mobile-leads.html?lead=lead-1042&role=manager', expect: ['Соколова Анна', 'Обновить'], reject: ['Удалить лид'] },
  { path: '/mobile-leads.html?newLead=1', expect: ['Создать новый лид', 'ЛИЧНЫЕ ДАННЫЕ'] },
  { path: '/mobile-leads.html?lead=lead-1042&edit=1', expect: ['Редактировать лид', 'ЛИЧНЫЕ ДАННЫЕ'] },
  { path: '/mobile-leads.html?lead=lead-1042&role=viewer', expect: ['Нет доступа к лидам', 'Данные не загружены'], reject: ['Соколова', 'anna@example.ru'], minTargets: 3 },
  { path: '/mobile-leads.html?lead=lead-1042&role=escort', expect: ['Нет доступа к лидам', 'Данные не загружены'], reject: ['Соколова', 'anna@example.ru'], minTargets: 3 },
  { path: '/mobile-leads.html?lead=lead-1042&role=superadmin', expect: ['Нет доступа к лидам', 'Данные не загружены'], reject: ['Соколова', 'anna@example.ru'], minTargets: 3 },
  { path: '/mobile-leads.html?lead=lead-1051&role=manager', expect: ['Нет доступа к лидам', 'Данные не загружены'], reject: ['Волков', 'denis@example.ru'], minTargets: 4 },
  { path: '/mobile-leads-tz.html', expect: ['ТЗ MVP', 'Финальный результат', 'Финальные экраны прототипа'], minTargets: 12 },
];

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function startServer() {
  const server = http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    const relativePath = requestPath === '/' ? 'tour-operations.html' : requestPath.replace(/^\/+/, '');
    const target = path.resolve(ROOT, relativePath);
    if (!target.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(target).pipe(response);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function readDevToolsPort(profileDir) {
  const file = path.join(profileDir, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (fs.existsSync(file)) {
      try {
        const [portValue, browserPath] = fs.readFileSync(file, 'utf8').trim().split('\n');
        const port = Number(portValue);
        if (Number.isInteger(port) && port > 0 && /^\/devtools\/browser\/[A-Za-z0-9-]+$/.test(browserPath || '')) {
          return { port, browserPath };
        }
      } catch (_) {
        // Chrome may expose the file between its two writes. Retry until both
        // the port and the browser websocket path are complete.
      }
    }
    await delay(50);
  }
  throw new Error('Chrome did not publish DevToolsActivePort');
}

class CdpClient {
  constructor(url) {
    this.nextId = 0;
    this.pending = new Map();
    this.events = [];
    this.socket = new WebSocket(url);
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result || {});
        return;
      }
      this.events.push(message);
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify(payload));
    });
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(client, sessionId, expression) {
  const result = await client.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  return result.result.value;
}

async function waitUntilReady(client, sessionId) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(client, sessionId, 'document.readyState === "complete"')) {
      await delay(80);
      return;
    }
    await delay(50);
  }
  throw new Error('Prototype page did not become ready');
}

async function inspectRoute(client, sessionId, origin, route, viewport) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  }, sessionId);

  const eventStart = client.events.length;
  await client.send('Page.navigate', { url: `${origin}${route.path}` }, sessionId);
  await waitUntilReady(client, sessionId);

  const result = await evaluate(client, sessionId, `(() => {
    const visible = (node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const targetSelector = 'button, a, input, select, textarea, [role="button"], [role="tab"]';
    const targets = [...document.querySelectorAll(targetSelector)].filter(visible).map((node) => {
      const labelledControl = node.matches('input[type="checkbox"], input[type="radio"]') ? node.closest('label') : null;
      const hitTarget = labelledControl || node;
      const rect = hitTarget.getBoundingClientRect();
      return { label: (hitTarget.textContent || node.getAttribute('aria-label') || '').trim(), width: rect.width, height: rect.height };
    });
    const strongOverflow = [...document.querySelectorAll('.info strong')].filter(visible).some((node) => {
      const phone = node.closest('.phone-shell, .app-shell, body');
      return phone && node.getBoundingClientRect().right > phone.getBoundingClientRect().right + 1;
    });
    return {
      text: document.body.innerText,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      targetCount: targets.length,
      undersized: targets.filter((target) => target.width < 43.9 || target.height < 43.9),
      strongOverflow,
    };
  })()`);

  route.expect.forEach((text) => assert.ok(result.text.includes(text), `${route.path} must render “${text}”`));
  (route.reject || []).forEach((text) => assert.ok(!result.text.includes(text), `${route.path} must hide “${text}”`));
  const minimumTargets = route.minTargets || 5;
  assert.ok(result.targetCount >= minimumTargets, `${route.path} must expose at least ${minimumTargets} meaningful touch targets`);
  assert.equal(
    result.undersized.length,
    0,
    `${route.path} has touch targets smaller than 44×44: ${JSON.stringify(result.undersized)}`,
  );
  assert.ok(result.documentWidth <= result.viewportWidth + 1, `${route.path} must not horizontally overflow at ${viewport.width}px`);
  assert.equal(result.strongOverflow, false, `${route.path} has card text outside the phone shell`);

  const external = client.events.slice(eventStart).filter((event) => {
    if (event.sessionId !== sessionId || event.method !== 'Network.requestWillBeSent') return false;
    const requestUrl = event.params.request.url;
    return !requestUrl.startsWith(origin) && !/^(?:data|blob|about):/.test(requestUrl);
  });
  assert.deepEqual(external.map((event) => event.params.request.url), [], `${route.path} must not make external requests`);
}

async function main() {
  assert.ok(CHROME, `Chrome/Chromium executable not found; checked: ${browserCandidates.join(', ')}`);
  const server = await startServer();
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unique-guide-viewport-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ], { stdio: 'ignore' });

  let client;
  try {
    const { port, browserPath } = await readDevToolsPort(profileDir);
    client = new CdpClient(`ws://127.0.0.1:${port}${browserPath}`);
    await client.open();
    const { targetId } = await client.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await client.send('Target.attachToTarget', { targetId, flatten: true });
    await client.send('Page.enable', {}, sessionId);
    await client.send('Runtime.enable', {}, sessionId);
    await client.send('Network.enable', {}, sessionId);
    const failures = [];
    for (const viewport of VIEWPORTS) {
      for (const route of ROUTES) {
        try {
          await inspectRoute(client, sessionId, origin, route, viewport);
        } catch (error) {
          failures.push(`${viewport.width}×${viewport.height} ${error.message}`);
        }
      }
    }
    assert.equal(failures.length, 0, `Mobile viewport failures:\n${failures.join('\n')}`);
    console.log(`Prototype viewport test passed (${ROUTES.length} deep links × ${VIEWPORTS.length} viewports)`);
  } finally {
    if (client) client.close();
    chrome.kill('SIGTERM');
    server.close();
    try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch {}
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
