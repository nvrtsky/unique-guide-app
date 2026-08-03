const assert = require('node:assert');
const crypto = require('node:crypto');
const fs = require('node:fs');
const vm = require('node:vm');

const networkCalls = [];

function blockNetwork(kind, target) {
  networkCalls.push({ kind, target: String(target || '') });
  throw new Error(`Network is disabled in prototype smoke test: ${kind}`);
}

function dataAttribute(key) {
  return 'data-' + key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formEntries(values) {
  return Object.entries(values || {}).flatMap(([key, value]) => Array.isArray(value) ? value.map((item) => [key, item]) : [[key, value]]);
}

function loadPrototype(file, appSelector, search = '', sharedStorage = new Map()) {
  const listeners = {};
  let scrollTop = 0;
  const root = {
    html: '',
    set innerHTML(value) { this.html = value; },
    get innerHTML() { return this.html; },
    addEventListener(type, handler) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    },
    querySelector(selector) {
      if ((selector === '.scroll' && /class="[^"]*\bscroll\b/.test(this.html)) ||
          ((selector === '.detail-scroll' || selector === '.lead-workspace-scroll') && this.html.includes(selector.slice(1)))) {
        return {
          get scrollTop() { return scrollTop; },
          set scrollTop(value) { scrollTop = Number(value || 0); },
        };
      }
      return null;
    },
  };

  const document = {
    querySelector(selector) { return selector === appSelector ? root : null; },
    getElementById(id) { return id === appSelector.replace('#', '') ? root : null; },
    createElement() {
      return {
        click() {},
        set href(value) { this._href = value; },
        get href() { return this._href; },
        download: '',
      };
    },
  };

  const localStorage = {
    getItem(key) { return sharedStorage.has(key) ? sharedStorage.get(key) : null; },
    setItem(key, value) { sharedStorage.set(key, String(value)); },
    removeItem(key) { sharedStorage.delete(key); },
  };

  class MockFormData {
    constructor(form) { this.values = form._values || {}; }
    entries() { return formEntries(this.values)[Symbol.iterator](); }
    get(name) { return this.values[name] == null ? null : (Array.isArray(this.values[name]) ? this.values[name][0] : this.values[name]); }
    getAll(name) { return this.values[name] == null ? [] : (Array.isArray(this.values[name]) ? this.values[name] : [this.values[name]]); }
    has(name) { return this.values[name] != null && this.values[name] !== false; }
  }

  class MockXMLHttpRequest {
    open(method, url) { blockNetwork('XMLHttpRequest', `${method} ${url}`); }
  }
  class MockWebSocket {
    constructor(url) { blockNetwork('WebSocket', url); }
  }
  class MockEventSource {
    constructor(url) { blockNetwork('EventSource', url); }
  }

  const windowObject = {
    location: { search, href: '' },
    localStorage,
    setTimeout() { return 1; },
    clearTimeout() {},
    fetch(url) { return blockNetwork('fetch', url); },
    XMLHttpRequest: MockXMLHttpRequest,
    WebSocket: MockWebSocket,
    EventSource: MockEventSource,
    navigator: { sendBeacon(url) { return blockNetwork('sendBeacon', url); } },
  };

  const context = {
    Blob,
    FormData: MockFormData,
    URL,
    URLSearchParams,
    console,
    document,
    fetch: windowObject.fetch,
    XMLHttpRequest: MockXMLHttpRequest,
    WebSocket: MockWebSocket,
    EventSource: MockEventSource,
    navigator: windowObject.navigator,
    window: windowObject,
    setTimeout: windowObject.setTimeout,
    clearTimeout: windowObject.clearTimeout,
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });

  function findTagByAttribute(attribute, value) {
    const tags = root.html.match(/<[^>]+>/g) || [];
    const tag = tags.find((candidate) => new RegExp(`\\s${escapeRegExp(attribute)}="${escapeRegExp(value)}"`).test(candidate));
    assert.ok(tag, `element [${attribute}="${value}"] must exist before interaction`);
    return tag;
  }

  function findElement(dataset) {
    const tags = root.html.match(/<[^>]+>/g) || [];
    const match = tags.find((tag) => Object.entries(dataset).every(([key, value]) => {
      const attribute = dataAttribute(key);
      if (value === '') return new RegExp(`\\s${escapeRegExp(attribute)}(?:\\s|=|>)`).test(tag);
      return new RegExp(`\\s${escapeRegExp(attribute)}="${escapeRegExp(value)}"`).test(tag);
    }));
    assert.ok(match, `actual element ${JSON.stringify(dataset)} must exist before interaction`);
    return match;
  }

  function actualElement(dataset) {
    const match = findElement(dataset);
    assert.doesNotMatch(match, /\sdisabled(?:[\s>]|="")/, `element ${JSON.stringify(dataset)} must be enabled`);
    return match;
  }

  function assertDisabled(dataset) {
    assert.match(findElement(dataset), /\sdisabled(?:[\s>]|="")/, `element ${JSON.stringify(dataset)} must be disabled`);
  }

  function click(dataset) {
    actualElement(dataset);
    const button = { dataset, disabled: false };
    (listeners.click || []).forEach((handler) => handler({ target: { closest: () => button } }));
  }

  function dispatch(dataset) {
    const button = { dataset, disabled: false };
    (listeners.click || []).forEach((handler) => handler({ target: { closest: () => button } }));
  }

  function input(dataset, value, type = 'input') {
    actualElement(dataset);
    const target = { dataset, value };
    (listeners[type] || []).forEach((handler) => handler({ target }));
  }

  function inputId(id, value, type = 'input') {
    assert.match(root.html, new RegExp(`\\sid="${escapeRegExp(id)}"`), `element #${id} must exist before interaction`);
    const target = { id, dataset: {}, value, selectionStart: String(value).length };
    (listeners[type] || []).forEach((handler) => handler({ target }));
  }

  function field(name, value, type = 'input') {
    findTagByAttribute('name', name);
    const target = { name, value, dataset: {} };
    (listeners[type] || []).forEach((handler) => handler({ target }));
  }

  function submit(formId, values, dataset = {}) {
    assert.match(root.html, new RegExp(`<form[^>]+id="${escapeRegExp(formId)}"`), `form ${formId} must be rendered before submit`);
    const form = { id: formId, dataset, _values: values };
    (listeners.submit || []).forEach((handler) => handler({ preventDefault() {}, target: form }));
  }

  return {
    root,
    click,
    dispatch,
    input,
    inputId,
    field,
    submit,
    storage: sharedStorage,
    window: windowObject,
    snapshot() { return windowObject.__prototypeDebug.snapshot(); },
    assertDisabled,
    setScrollTop(value) { scrollTop = Number(value || 0); },
    getScrollTop() { return scrollTop; },
  };
}

function selectCity(prototype, index) {
  prototype.click({ action: 'open-city-picker' });
  prototype.click({ action: 'select-city', index: String(index) });
}

function selectRole(prototype, role) {
  prototype.click({ action: 'role-menu' });
  prototype.click({ action: 'select-role', role });
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Navigation remains split into Tours, Tourists and Leads.
const leads = loadPrototype('mobile-leads.js', '#app');
['Туры', 'Туристы', 'Лиды'].forEach((label) => assert.match(leads.root.innerHTML, new RegExp(label)));
assert.match(leads.root.innerHTML, /Канбан/);
assert.doesNotMatch(leads.root.innerHTML, /ФИНАНС|Стоимость|Аванс|Остаток/i);
leads.click({ openLead: 'lead-1042' });
assert.match(leads.root.innerHTML, /Сводная по туру/);
leads.click({ detailTab: 'tourists' });
assert.match(leads.root.innerHTML, /Соколова Анна/);
leads.click({ action: 'open-unified-tourist', tourist: 't1' });
assert.match(leads.window.location.href, /tour-operations\.html\?view=tourists&tourist=t1&returnLead=lead-1042/);

const linkedLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042');
assert.match(linkedLead.root.innerHTML, /Соколова Анна Игоревна/, 'lead deep-link opens its detail');

// The mobile coverage view exposes every tourist and stable route stop without a horizontal table.
const coverage = loadPrototype('tour-operations.js', '#app');
coverage.click({ action: 'summary-mode', mode: 'coverage' });
assert.match(coverage.root.innerHTML, /Покрытие по туристам/);
['Соколова Анна', 'Соколов Илья', 'Орлова Марина', 'Волков Денис'].forEach((name) => assert.match(coverage.root.innerHTML, new RegExp(name)));
['Пекин · остановка 1', 'Сиань', 'Шанхай', 'Пекин · остановка 2'].forEach((city) => assert.match(coverage.root.innerHTML, new RegExp(city)));
assert.match(coverage.root.innerHTML, /data-action="jump-cell"/);
coverage.click({ action: 'summary-mode', mode: 'groups' });
assert.match(coverage.root.innerHTML, /По операциям/);

// Lead mutations use the same capability contract, including forged clicks and offline mode.
const unassignedLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1051');
const unassignedBefore = deepClone(unassignedLead.snapshot());
assert.match(unassignedLead.root.innerHTML, /Этот лид не назначен текущему менеджеру/);
assert.doesNotMatch(unassignedLead.root.innerHTML, /denis@example\.ru/);
unassignedLead.dispatch({ action: 'edit-lead' });
unassignedLead.dispatch({ stage: 'confirmed' });
unassignedLead.dispatch({ action: 'add-tourist' });
unassignedLead.dispatch({ action: 'merge-lead' });
assert.equal(unassignedLead.snapshot().screen, 'detail');
assert.deepEqual(unassignedLead.snapshot().leads, unassignedBefore.leads);
assert.deepEqual(unassignedLead.snapshot().tourists, unassignedBefore.tourists);

const guideLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&role=guide');
assert.match(guideLead.root.innerHTML, /Только просмотр/);
assert.doesNotMatch(guideLead.root.innerHTML, /anna@example\.ru|Примечание|data-action="edit-lead"/);
const guideLeadBefore = deepClone(guideLead.snapshot());
guideLead.dispatch({ action: 'generate-doc' });
guideLead.dispatch({ action: 'add-task' });
guideLead.dispatch({ stage: 'lost' });
assert.deepEqual(guideLead.snapshot().leads, guideLeadBefore.leads);

const offlineLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&offline=1');
const offlineLeadBefore = deepClone(offlineLead.snapshot());
assert.match(offlineLead.root.innerHTML, /Нет подключения/);
offlineLead.dispatch({ action: 'add-tourist' });
offlineLead.dispatch({ action: 'archive-lead' });
offlineLead.dispatch({ stage: 'lost' });
assert.deepEqual(offlineLead.snapshot().leads, offlineLeadBefore.leads);
assert.deepEqual(offlineLead.snapshot().tourists, offlineLeadBefore.tourists);

// Cross-screen navigation preserves role, offline mode, lead and canonical tour context.
const crossScreenStorage = new Map();
const guideOfflineLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&role=guide&offline=1', crossScreenStorage);
guideOfflineLead.click({ detailTab: 'tourists' });
guideOfflineLead.click({ action: 'open-unified-tourist', tourist: 't1' });
const guideTourUrl = new URL(guideOfflineLead.window.location.href, 'https://prototype.test/');
assert.equal(guideTourUrl.searchParams.get('returnLead'), 'lead-1042');
assert.equal(guideTourUrl.searchParams.get('tourId'), 'china');
assert.equal(guideTourUrl.searchParams.get('role'), 'guide');
assert.equal(guideTourUrl.searchParams.get('offline'), '1');
const guideOfflineTour = loadPrototype('tour-operations.js', '#app', guideTourUrl.search, crossScreenStorage);
assert.equal(guideOfflineTour.snapshot().role, 'guide');
assert.equal(guideOfflineTour.snapshot().offline, true);
assert.equal(guideOfflineTour.snapshot().selectedTourId, 'china');
const guideOfflineRecordsBefore = deepClone(guideOfflineTour.snapshot().records);
guideOfflineTour.dispatch({ action: 'add-stage' });
assert.deepEqual(guideOfflineTour.snapshot().records, guideOfflineRecordsBefore);
guideOfflineTour.click({ action: 'close-overlay' });
const restoredLeadUrl = new URL(guideOfflineTour.window.location.href, 'https://prototype.test/');
assert.equal(restoredLeadUrl.searchParams.get('lead'), 'lead-1042');
assert.equal(restoredLeadUrl.searchParams.get('tourId'), 'china');
assert.equal(restoredLeadUrl.searchParams.get('role'), 'guide');
assert.equal(restoredLeadUrl.searchParams.get('offline'), '1');

// The real Lead → Summary CTA preserves list state and returns from the bottom navigation.
const summaryContextStorage = new Map();
const summaryLead = loadPrototype('mobile-leads.js', '#app', '?role=manager', summaryContextStorage);
summaryLead.inputId('lead-search', 'Анна');
summaryLead.click({ quickStatus: 'confirmed' });
summaryLead.click({ listMode: 'board' });
summaryLead.click({ openLead: 'lead-1042' });
summaryLead.setScrollTop(275);
summaryLead.click({ action: 'open-tour-summary' });
const summaryTourUrl = new URL(summaryLead.window.location.href, 'https://prototype.test/');
assert.equal(summaryTourUrl.searchParams.get('lead'), 'lead-1042');
assert.equal(summaryTourUrl.searchParams.get('returnLead'), 'lead-1042');
assert.equal(summaryTourUrl.searchParams.get('returnTab'), 'overview');
const savedSummaryContext = JSON.parse(summaryContextStorage.get('unique-guide-mobile-leads-return-v1'));
assert.equal(savedSummaryContext.query, 'Анна');
assert.deepEqual(savedSummaryContext.filters.statuses, ['confirmed']);
assert.equal(savedSummaryContext.listMode, 'board');
assert.equal(savedSummaryContext.scrollTop, 275);
const summaryTour = loadPrototype('tour-operations.js', '#app', summaryTourUrl.search, summaryContextStorage);
assert.equal(summaryTour.snapshot().scopeLead, 'lead-1042');
summaryTour.click({ action: 'open-leads' });
const summaryReturnUrl = new URL(summaryTour.window.location.href, 'https://prototype.test/');
assert.equal(summaryReturnUrl.searchParams.get('lead'), 'lead-1042');
assert.equal(summaryReturnUrl.searchParams.get('tab'), 'overview');
const restoredSummaryLead = loadPrototype('mobile-leads.js', '#app', summaryReturnUrl.search, summaryContextStorage);
assert.equal(restoredSummaryLead.snapshot().activeLeadId, 'lead-1042');
assert.equal(restoredSummaryLead.snapshot().detailTab, 'overview');
assert.equal(restoredSummaryLead.snapshot().query, 'Анна');
assert.deepEqual(restoredSummaryLead.snapshot().filters.statuses, ['confirmed']);
assert.equal(restoredSummaryLead.snapshot().listMode, 'board');
assert.equal(restoredSummaryLead.getScrollTop(), 275);

const reverseNavigation = loadPrototype('tour-operations.js', '#app', '?tourId=china&role=escort&offline=1');
reverseNavigation.click({ action: 'open-leads' });
const reverseLeadUrl = new URL(reverseNavigation.window.location.href, 'https://prototype.test/');
assert.equal(reverseLeadUrl.searchParams.get('tourId'), 'china');
assert.equal(reverseLeadUrl.searchParams.get('role'), 'escort');
assert.equal(reverseLeadUrl.searchParams.get('offline'), '1');

// Read-only roles receive a capability-driven interface, not disabled manager controls.
const guideTourUi = loadPrototype('tour-operations.js', '#app', '?tourId=china&role=guide');
assert.match(guideTourUi.root.innerHTML, /Режим просмотра/);
assert.doesNotMatch(guideTourUi.root.innerHTML, /data-action="add-stage"|data-action="jump-cell"|data-action="export-summary"/);
guideTourUi.click({ action: 'summary-mode', mode: 'coverage' });
assert.match(guideTourUi.root.innerHTML, /Покрытие по туристам/);
assert.match(guideTourUi.root.innerHTML, /Пекин · остановка 1|Сиань/);
assert.doesNotMatch(guideTourUi.root.innerHTML, /Шанхай|Пекин · остановка 2|data-action="jump-cell"|data-action="export-summary"/);
guideTourUi.click({ action: 'summary-mode', mode: 'groups' });
guideTourUi.click({ action: 'tour-menu' });
assert.match(guideTourUi.root.innerHTML, /Управляющие действия для этого тура недоступны/);
assert.match(guideTourUi.root.innerHTML, /data-action="open-directory"/);
assert.doesNotMatch(guideTourUi.root.innerHTML, /data-action="(?:edit-tour|copy-tour|archive-tour|cancel-tour)"/);
guideTourUi.click({ action: 'open-directory' });
assert.match(guideTourUi.root.innerHTML, /Изменение справочника доступно только администратору/);
assert.doesNotMatch(guideTourUi.root.innerHTML, /data-action="(?:new-directory-city|edit-directory-city|new-directory-point|edit-directory-point|toggle-directory|delete-directory)\b/);
guideTourUi.click({ action: 'close-overlay' });
guideTourUi.click({ action: 'open-tours' });
assert.match(guideTourUi.root.innerHTML, /Список туров · просмотр/);
assert.doesNotMatch(guideTourUi.root.innerHTML, /data-action="new-tour"/);
assert.match(guideTourUi.root.innerHTML, /Гранд-тур по Китаю/);
guideTourUi.click({ action: 'tour-filter', filter: 'draft' });
assert.doesNotMatch(guideTourUi.root.innerHTML, /Япония: сезон момидзи|Токио → Киото → Осака|Юки Танака/);
guideTourUi.dispatch({ action: 'select-tour', id: 'japan' });
assert.equal(guideTourUi.snapshot().selectedTourId, 'china');
guideTourUi.dispatch({ action: 'tour-card-menu', id: 'japan' });
assert.doesNotMatch(guideTourUi.root.innerHTML, /Япония: сезон момидзи|Токио → Киото → Осака|Юки Танака/);
guideTourUi.click({ action: 'tour-filter', filter: 'archive' });
assert.doesNotMatch(guideTourUi.root.innerHTML, /Италия для своих|Рим → Флоренция → Венеция|Марко Росси/);
guideTourUi.click({ action: 'close-overlay' });
guideTourUi.click({ action: 'workspace', view: 'program' });
assert.match(guideTourUi.root.innerHTML, /Изменять программу могут менеджер и администратор тура/);
assert.doesNotMatch(guideTourUi.root.innerHTML, /data-action="(?:add-program|edit-program|generate-program|regenerate-program|clear-program)"/);
guideTourUi.click({ action: 'tour-menu' });
guideTourUi.click({ action: 'view-tour-tasks' });
assert.match(guideTourUi.root.innerHTML, /Изменять задачи могут менеджер и администратор тура/);
assert.doesNotMatch(guideTourUi.root.innerHTML, /data-action="(?:add-tour-task|toggle-tour-task|export-summary)"/);

// Tour selection keeps a stable canonical tourId instead of assigning every lead to China.
const japanLead = loadPrototype('mobile-leads.js', '#app', '?role=admin');
japanLead.click({ action: 'new-lead' });
japanLead.submit('lead-form', {
  firstName: 'Акира', lastName: 'Сато', middleName: '', phone: '+81 90 1234 5678', email: 'akira@example.jp', telegram: '',
  source: 'Сайт', category: 'Индивидуальный', tour: 'Япония: сезон момидзи', manager: 'Елена Воронова', routeCities: 'Токио, Киото',
  color: '#2f6bd8', hotel: '', room: '', note: '', companionLast1: '', companionFirst1: '', companionLast2: '', companionFirst2: '',
});
const createdJapanLead = japanLead.snapshot().leads.find((lead) => lead.firstName === 'Акира');
assert.equal(createdJapanLead.eventId, 'japan');
assert.equal(createdJapanLead.tour, 'Япония: сезон момидзи');
const createdJapanTourist = japanLead.snapshot().tourists.find((tourist) => tourist.leadId === createdJapanLead.id);
assert.equal(createdJapanTourist.tourId, 'japan');
assert.match(japanLead.root.innerHTML, new RegExp(`tour-operations\\.html\\?lead=${escapeRegExp(createdJapanLead.id)}&tourId=japan`));
japanLead.click({ detailTab: 'tourists' });
japanLead.click({ action: 'open-unified-tourist', tourist: createdJapanTourist.id });
const japanProfileUrl = new URL(japanLead.window.location.href, 'https://prototype.test/');
assert.equal(japanProfileUrl.searchParams.get('tourId'), 'japan');
const japanFallback = loadPrototype('tour-operations.js', '#app', japanProfileUrl.search, japanLead.storage);
assert.equal(japanFallback.snapshot().selectedTourId, 'japan');
assert.match(japanFallback.root.innerHTML, /Сводная тура ещё не подготовлена в MVP/);
assert.match(japanFallback.root.innerHTML, /Сато Акира/);
assert.doesNotMatch(japanFallback.root.innerHTML, /CZ 342|Пекин · остановка 1|data-action="add-stage"/);
const japanRecordsBefore = deepClone(japanFallback.snapshot().records);
japanFallback.dispatch({ action: 'add-stage' });
japanFallback.dispatch({ action: 'start-tourist-group' });
assert.deepEqual(japanFallback.snapshot().records, japanRecordsBefore);

const assignedJapanManagerParams = new URLSearchParams(japanProfileUrl.search);
assignedJapanManagerParams.set('role', 'manager');
const assignedJapanManager = loadPrototype('tour-operations.js', '#app', `?${assignedJapanManagerParams.toString()}`, japanLead.storage);
assert.match(assignedJapanManager.root.innerHTML, /Сводная тура ещё не подготовлена в MVP/);
assert.match(assignedJapanManager.root.innerHTML, /Сато Акира/);
assert.match(assignedJapanManager.root.innerHTML, /Япония: сезон момидзи/);
assignedJapanManager.click({ action: 'toggle-profile-section', section: 'personal' });
assert.match(assignedJapanManager.root.innerHTML, /akira@example\.jp/);
assert.match(assignedJapanManager.root.innerHTML, /data-action="edit-profile-section"/);

for (const restrictedRole of ['guide', 'escort']) {
  const restrictedParams = new URLSearchParams(japanProfileUrl.search);
  restrictedParams.set('role', restrictedRole);
  const restrictedJapan = loadPrototype('tour-operations.js', '#app', `?${restrictedParams.toString()}`, japanLead.storage);
  assert.match(restrictedJapan.root.innerHTML, /Тур не назначен текущей роли/);
  assert.doesNotMatch(restrictedJapan.root.innerHTML, /Сато Акира|Загранпаспорт|data-action="tourist-detail"/);
  restrictedJapan.dispatch({ action: 'tourist-detail', id: createdJapanTourist.id });
  assert.doesNotMatch(restrictedJapan.root.innerHTML, /Сато Акира|Загранпаспорт/);
}

japanFallback.click({ action: 'close-overlay' });
const returnedJapanLeadUrl = new URL(japanFallback.window.location.href, 'https://prototype.test/');
const returnedJapanLead = loadPrototype('mobile-leads.js', '#app', returnedJapanLeadUrl.search, japanLead.storage);
assert.equal(returnedJapanLead.snapshot().activeLeadId, createdJapanLead.id);
assert.equal(returnedJapanLead.snapshot().leads.find((lead) => lead.id === createdJapanLead.id).eventId, 'japan');
assert.equal(returnedJapanLead.snapshot().tourists.find((tourist) => tourist.id === createdJapanTourist.id).tourId, 'japan');

// Generated lead IDs, codes and tourist IDs remain unique after a full reload.
const identityStorage = new Map();
const identityFirst = loadPrototype('mobile-leads.js', '#app', '?role=admin', identityStorage);
identityFirst.click({ action: 'new-lead' });
identityFirst.submit('lead-form', {
  firstName: 'Первый', lastName: 'Тестовый', middleName: 'Лид', phone: '+7 900 000-00-61', email: 'first-identity@example.test', telegram: '',
  source: 'Сайт', category: 'Семья', tour: 'Гранд-тур по Китаю', manager: 'Елена Воронова', routeCities: 'Пекин, Сиань',
  color: '#2f6bd8', hotel: '', room: '', note: '', companionLast1: 'Первый', companionFirst1: 'Попутчик', companionLast2: 'Второй', companionFirst2: 'Попутчик',
});
const firstGeneratedLead = identityFirst.snapshot().leads.find((lead) => lead.email === 'first-identity@example.test');
const identityReload = loadPrototype('mobile-leads.js', '#app', '?role=admin', identityStorage);
identityReload.click({ action: 'new-lead' });
identityReload.submit('lead-form', {
  firstName: 'Второй', lastName: 'Тестовый', middleName: 'Лид', phone: '+7 900 000-00-62', email: 'second-identity@example.test', telegram: '',
  source: 'Рекомендация', category: 'Индивидуальный', tour: 'Гранд-тур по Китаю', manager: 'Елена Воронова', routeCities: 'Пекин',
  color: '#7a5af0', hotel: '', room: '', note: '', companionLast1: '', companionFirst1: '', companionLast2: '', companionFirst2: '',
});
const identitySnapshot = identityReload.snapshot();
const secondGeneratedLead = identitySnapshot.leads.find((lead) => lead.email === 'second-identity@example.test');
assert.notEqual(firstGeneratedLead.id, secondGeneratedLead.id);
assert.notEqual(firstGeneratedLead.code, secondGeneratedLead.code);
assert.equal(new Set(identitySnapshot.leads.map((lead) => lead.id)).size, identitySnapshot.leads.length);
assert.equal(new Set(identitySnapshot.leads.map((lead) => lead.code)).size, identitySnapshot.leads.length);
assert.equal(new Set(identitySnapshot.tourists.map((tourist) => tourist.id)).size, identitySnapshot.tourists.length);
const identityDeepLink = loadPrototype('mobile-leads.js', '#app', `?lead=${encodeURIComponent(secondGeneratedLead.id)}&role=admin`, identityStorage);
assert.equal(identityDeepLink.snapshot().activeLeadId, secondGeneratedLead.id);
assert.match(identityDeepLink.root.innerHTML, /Тестовый Второй Лид/);

// Editing a seeded lead to another tour persists across a full reload and cannot be reverted by seed hydration.
const editedTourStorage = new Map();
const editedTourLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&role=admin', editedTourStorage);
editedTourLead.click({ action: 'edit-lead' });
editedTourLead.submit('lead-form', {
  firstName: 'Анна', lastName: 'Соколова', middleName: 'Игоревна', phone: '+7 916 441-22-18', email: 'anna@example.ru', telegram: '@anna_sokolova',
  source: 'Рекомендация', category: 'VIP', tour: 'Япония: сезон момидзи', manager: 'Елена Воронова', routeCities: 'Токио, Киото',
  color: '#2f6bd8', hotel: 'Tokyo Garden', room: 'Double', note: 'Перенесено в тур по Японии', companionLast1: '', companionFirst1: '', companionLast2: '', companionFirst2: '',
}, { editing: 'lead-1042' });
const editedTourReload = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&role=admin', editedTourStorage);
assert.equal(editedTourReload.snapshot().leads.find((lead) => lead.id === 'lead-1042').eventId, 'japan');
assert.equal(editedTourReload.snapshot().tourists.find((tourist) => tourist.id === 't1').tourId, 'japan');
editedTourReload.click({ detailTab: 'tourists' });
editedTourReload.click({ action: 'open-unified-tourist', tourist: 't1' });
const editedTourUrl = new URL(editedTourReload.window.location.href, 'https://prototype.test/');
assert.equal(editedTourUrl.searchParams.get('tourId'), 'japan');
const editedTourFallback = loadPrototype('tour-operations.js', '#app', editedTourUrl.search, editedTourStorage);
assert.equal(editedTourFallback.snapshot().selectedTourId, 'japan');
assert.match(editedTourFallback.root.innerHTML, /Сводная тура ещё не подготовлена в MVP/);

// A tourist created from a Lead immediately opens and persists in the same canonical receiver.
const newTouristStorage = new Map();
const leadCreate = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042', newTouristStorage);
leadCreate.click({ detailTab: 'tourists' });
leadCreate.setScrollTop(146);
leadCreate.click({ action: 'add-tourist' });
const newTouristUrl = new URL(leadCreate.window.location.href, 'https://prototype.test/');
const newTouristId = newTouristUrl.searchParams.get('tourist');
assert.ok(newTouristId && newTouristId.startsWith('tourist-proto-'));
const newTouristProfile = loadPrototype('tour-operations.js', '#app', newTouristUrl.search, newTouristStorage);
assert.doesNotMatch(newTouristProfile.root.innerHTML, /Турист не найден/);
assert.equal(newTouristProfile.snapshot().tourists.filter((tourist) => tourist.id === newTouristId).length, 1);
newTouristProfile.click({ action: 'close-overlay' });
const restoredLeadAfterProfile = loadPrototype('mobile-leads.js', '#app', new URL(newTouristProfile.window.location.href, 'https://prototype.test/').search, newTouristStorage);
assert.match(restoredLeadAfterProfile.root.innerHTML, /ТУРИСТЫ/);
assert.equal(restoredLeadAfterProfile.getScrollTop(), 146);
assert.doesNotMatch(fs.readFileSync('mobile-leads.js', 'utf8'), /-merged/);

// A profile edited from the unified card is reused when the Lead page is reopened.
const sharedProfiles = new Map();
const profile = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t1&returnLead=lead-1042', sharedProfiles);
['Личные данные', 'Паспорт РФ', 'Загранпаспорт и сканы', 'Маршрут и логистика', 'Связи и группы', 'Комментарии'].forEach((section) => assert.match(profile.root.innerHTML, new RegExp(section)));
profile.click({ action: 'toggle-profile-section', section: 'personal' });
assert.match(profile.root.innerHTML, /Дата рождения/);
assert.match(profile.root.innerHTML, /Гражданство/);
profile.click({ action: 'edit-profile-section', id: 't1', section: 'personal' });
profile.submit('profile-section-form', {
  lastName: 'Соколова-Тест', firstName: 'Анна', middleName: 'Игоревна', birthDate: '1988-09-18',
  citizenship: 'Россия', phone: '+7 916 441-22-18', email: 'anna@example.ru', type: 'Взрослый',
}, { id: 't1', section: 'personal' });
assert.equal(profile.snapshot().tourists.find((tourist) => tourist.id === 't1').lastName, 'Соколова-Тест');
profile.click({ action: 'toggle-profile-section', section: 'foreign' });
profile.click({ action: 'open-ocr-review', id: 't1' });
assert.match(profile.root.innerHTML, /Распознанные значения не меняют карточку автоматически/);
profile.assertDisabled({ action: 'apply-ocr' });
profile.click({ action: 'toggle-ocr-field', field: 'passport' });
profile.click({ action: 'apply-ocr' });
assert.equal(profile.snapshot().tourists.find((tourist) => tourist.id === 't1').passport, '72 4567890');

const hydratedLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042', sharedProfiles);
hydratedLead.click({ detailTab: 'tourists' });
assert.match(hydratedLead.root.innerHTML, /Соколова-Тест Анна/);
assert.doesNotMatch(hydratedLead.root.innerHTML, /72 4567890/, 'passport number is not exposed in the lead tourist list');
const hydratedTour = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t1', sharedProfiles);
assert.equal(hydratedTour.snapshot().tourists.find((tourist) => tourist.id === 't1').lastName, 'Соколова-Тест');

// Dirty profile forms require an explicit discard decision.
const dirtyProfile = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t1');
dirtyProfile.click({ action: 'toggle-profile-section', section: 'personal' });
dirtyProfile.click({ action: 'edit-profile-section', id: 't1', section: 'personal' });
dirtyProfile.field('lastName', 'Изменённая фамилия');
dirtyProfile.click({ action: 'close-overlay' });
assert.match(dirtyProfile.root.innerHTML, /Закрыть без сохранения/);
dirtyProfile.click({ action: 'continue-profile-edit' });
assert.match(dirtyProfile.root.innerHTML, /Личные данные/);

const requiredProfile = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t1');
requiredProfile.click({ action: 'toggle-profile-section', section: 'foreign' });
requiredProfile.click({ action: 'edit-profile-section', id: 't1', section: 'foreign' });
const passportBeforeInvalidSubmit = requiredProfile.snapshot().tourists.find((tourist) => tourist.id === 't1').passport;
requiredProfile.submit('profile-section-form', { latinName: '', passport: '', passportExpiry: '' }, { id: 't1', section: 'foreign' });
assert.match(requiredProfile.root.innerHTML, /Заполните обязательные данные загранпаспорта/);
assert.match(requiredProfile.root.innerHTML, /aria-invalid="true"/);
assert.equal(requiredProfile.snapshot().tourists.find((tourist) => tourist.id === 't1').passport, passportBeforeInvalidSubmit);

// A limited route opens its stable routeCityId, not the index of the filtered list.
const limitedRouteProfile = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t4');
limitedRouteProfile.click({ action: 'toggle-profile-section', section: 'logistics' });
limitedRouteProfile.click({ action: 'jump-profile-operation', id: 't4', routeCityId: 'route-shanghai-1', stage: 'arrival' });
assert.equal(limitedRouteProfile.snapshot().routeCityId, 'route-shanghai-1');
assert.equal(limitedRouteProfile.snapshot().cityIndex, 2);

// A non-source group member can edit hidden ownValues without changing the shared source or effective record.
const personalOperation = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t2');
const personalGroupBefore = deepClone(personalOperation.snapshot().operationGroups['route-xian-1'].arrival['arr-x1']);
const personalSourceBefore = deepClone(personalOperation.snapshot().records['route-xian-1'].arrival.t1);
personalOperation.click({ action: 'toggle-profile-section', section: 'logistics' });
personalOperation.click({ action: 'edit-own-operation', id: 't2', routeCityId: 'route-xian-1', stage: 'arrival' });
assert.match(personalOperation.root.innerHTML, /Личная запись/);
personalOperation.input({ field: 'time' }, '14:14');
personalOperation.click({ action: 'save-form' });
const personalSnapshot = personalOperation.snapshot();
assert.equal(personalSnapshot.records['route-xian-1'].arrival.t2.time, '14:14');
assert.deepEqual(personalSnapshot.records['route-xian-1'].arrival.t1, personalSourceBefore);
assert.deepEqual(personalSnapshot.operationGroups['route-xian-1'].arrival['arr-x1'], personalGroupBefore);
const personalVisit = personalSnapshot.visits.find((visit) => visit.visitId === 'china:t2:route-xian-1:arrival');
assert.equal(personalVisit.ownValues.time, '14:14');
assert.equal(personalVisit.effectiveValues.time, personalSourceBefore.time);

// Guide sees a read-only card without private fields or mutation actions.
const roles = loadPrototype('tour-operations.js', '#app');
selectRole(roles, 'guide');
roles.click({ action: 'summary-section', view: 'tourists' });
roles.click({ action: 'tourist-detail', id: 't1' });
assert.match(roles.root.innerHTML, /Режим просмотра/);
assert.doesNotMatch(roles.root.innerHTML, /Паспорт РФ/);
roles.click({ action: 'toggle-profile-section', section: 'personal' });
assert.doesNotMatch(roles.root.innerHTML, /anna@example\.ru/);
assert.doesNotMatch(roles.root.innerHTML, /data-action="edit-profile-section"/);
roles.click({ action: 'toggle-profile-section', section: 'foreign' });
assert.match(roles.root.innerHTML, /passport-anna\.jpg/);
assert.doesNotMatch(roles.root.innerHTML, /data-action="open-ocr-review"/);

// A manager cannot see private fields of a tourist from an unassigned lead in the same tour.
const privateLeadStorage = new Map([['unique-guide-tourists-v2', JSON.stringify([{
  id: 'lead-tourist-1051', tourId: 'china', leadId: 'lead-1051', lead: 'Лид Волков', leadStatus: 'Связались',
  firstName: 'Денис', lastName: 'Волков', route: ['route-beijing-1'], type: 'Взрослый', scans: [],
  email: 'private-denis@example.ru', domesticPassport: '92 00 123456',
  domesticIssuedBy: 'Скрытое подразделение', internalNote: 'Скрытая внутренняя заметка',
}])]]);
const unassignedProfile = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=lead-tourist-1051&tourId=china&role=manager', privateLeadStorage);
assert.match(unassignedProfile.root.innerHTML, /Режим просмотра/);
assert.doesNotMatch(unassignedProfile.root.innerHTML, /data-section="domestic"|92 00 123456|Скрытое подразделение/);
unassignedProfile.click({ action: 'toggle-profile-section', section: 'personal' });
assert.doesNotMatch(unassignedProfile.root.innerHTML, /private-denis@example\.ru/);
unassignedProfile.click({ action: 'toggle-profile-section', section: 'comments' });
assert.doesNotMatch(unassignedProfile.root.innerHTML, /Скрытая внутренняя заметка/);

// Persisted manager assignments are authoritative for both grant and revoke.
const revokedLeadStorage = new Map([['unique-guide-leads-v1', JSON.stringify([
  { id: 'lead-1042', eventId: 'china', manager: 'Игорь Лебедев' },
  { id: 'lead-1048', eventId: 'china', manager: 'Елена Воронова' },
])]]);
const revokedLeadProfile = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t1&tourId=china&role=manager', revokedLeadStorage);
assert.match(revokedLeadProfile.root.innerHTML, /Режим просмотра/);
revokedLeadProfile.click({ action: 'toggle-profile-section', section: 'personal' });
assert.doesNotMatch(revokedLeadProfile.root.innerHTML, /anna\.sokolova@example\.com|data-action="edit-profile-section"/);
const fullyRevokedStorage = new Map([['unique-guide-leads-v1', JSON.stringify([
  { id: 'lead-1042', eventId: 'china', manager: 'Игорь Лебедев' },
  { id: 'lead-1048', eventId: 'china', manager: 'Игорь Лебедев' },
])]]);
const fullyRevokedTour = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t1&tourId=china&role=manager', fullyRevokedStorage);
assert.match(fullyRevokedTour.root.innerHTML, /Тур не назначен текущей роли/);
assert.doesNotMatch(fullyRevokedTour.root.innerHTML, /Соколова Анна|Загранпаспорт|Паспорт РФ/);

// Capabilities also block forged clicks, and guides edit statuses only in assigned cities.
const forgedGuide = loadPrototype('tour-operations.js', '#app');
selectRole(forgedGuide, 'guide');
forgedGuide.click({ action: 'open-city-picker' });
assert.doesNotMatch(forgedGuide.root.innerHTML, /data-action="select-city" data-index="2"/);
forgedGuide.click({ action: 'close-overlay' });
const guideStatusBefore = forgedGuide.snapshot().tourists.find((tourist) => tourist.id === 't1').statusByCity['route-shanghai-1'].arrival;
forgedGuide.dispatch({ action: 'select-city', index: '2' });
assert.equal(forgedGuide.snapshot().routeCityId, 'route-beijing-1');
assert.equal(forgedGuide.snapshot().tourists.find((tourist) => tourist.id === 't1').statusByCity['route-shanghai-1'].arrival, guideStatusBefore);
forgedGuide.click({ action: 'workspace', view: 'work' });
forgedGuide.click({ action: 'change-status', id: 't1', stage: 'arrival' });
forgedGuide.click({ action: 'apply-status', status: 'arrived' });
assert.equal(forgedGuide.snapshot().tourists.find((tourist) => tourist.id === 't1').statusByCity['route-beijing-1'].arrival, 'arrived');
const guideGroupBefore = forgedGuide.snapshot().tourists.find((tourist) => tourist.id === 't1').groupId;
forgedGuide.dispatch({ action: 'split-tourist-group', group: guideGroupBefore });
forgedGuide.dispatch({ action: 'apply-global-split' });
assert.equal(forgedGuide.snapshot().tourists.find((tourist) => tourist.id === 't1').groupId, guideGroupBefore);

// Bulk status guards validate every member against the selected tour and route, even for forged IDs.
const outOfRouteStatus = loadPrototype('tour-operations.js', '#app');
selectRole(outOfRouteStatus, 'guide');
selectCity(outOfRouteStatus, 1);
const t4StatusesBefore = deepClone(outOfRouteStatus.snapshot().tourists.find((tourist) => tourist.id === 't4').statusByCity);
outOfRouteStatus.dispatch({ action: 'status-bulk', members: 't4', stage: 'arrival' });
outOfRouteStatus.dispatch({ action: 'apply-status', status: 'arrived' });
assert.deepEqual(outOfRouteStatus.snapshot().tourists.find((tourist) => tourist.id === 't4').statusByCity, t4StatusesBefore);

const foreignTourStorage = new Map([['unique-guide-tourists-v2', JSON.stringify([{
  id: 'japan-forged', tourId: 'japan', leadId: 'lead-japan', lead: 'Лид Япония', leadStatus: 'Подтверждён',
  firstName: 'Юки', lastName: 'Танака', phone: '+81 90 9999 0000', email: 'private-yuki@example.jp', passport: 'JP-PRIVATE-77',
  internalNote: 'Скрытая заметка Японии', route: ['route-beijing-1'], type: 'Взрослый', scans: [{ id: 'scan-private', name: 'japan-private-passport.jpg' }], statusByCity: {},
}])]]);
const foreignTourStatus = loadPrototype('tour-operations.js', '#app', '?tourist=japan-forged&tourId=china', foreignTourStorage);
assert.match(foreignTourStatus.root.innerHTML, /Карточка недоступна/);
assert.doesNotMatch(foreignTourStatus.root.innerHTML, /Танака Юки|JP-PRIVATE-77|private-yuki|japan-private-passport|\+81 90/);
foreignTourStatus.dispatch({ action: 'tourist-detail', id: 'japan-forged' });
foreignTourStatus.dispatch({ action: 'call-tourist', id: 'japan-forged' });
foreignTourStatus.dispatch({ action: 'view-scan', id: 'japan-forged', scan: 'scan-private' });
assert.doesNotMatch(foreignTourStatus.root.innerHTML, /Танака Юки|JP-PRIVATE-77|private-yuki|japan-private-passport|\+81 90/);
selectRole(foreignTourStatus, 'guide');
const foreignStatusBefore = deepClone(foreignTourStatus.snapshot().tourists.find((tourist) => tourist.id === 'japan-forged').statusByCity);
foreignTourStatus.dispatch({ action: 'status-bulk', members: 'japan-forged', stage: 'arrival' });
foreignTourStatus.dispatch({ action: 'apply-status', status: 'arrived' });
assert.deepEqual(foreignTourStatus.snapshot().tourists.find((tourist) => tourist.id === 'japan-forged').statusByCity, foreignStatusBefore);

// Admin can delete one of several lead tourists but cannot delete the last one.
const admin = loadPrototype('tour-operations.js', '#app', '?view=tourists&tourist=t3');
selectRole(admin, 'admin');
admin.click({ action: 'tourist-detail', id: 't3' });
admin.click({ action: 'delete-tourist', id: 't3' });
assert.match(admin.root.innerHTML, /Удалить туриста/);
admin.click({ action: 'confirm-delete-tourist', id: 't3' });
assert.equal(admin.snapshot().tourists.some((tourist) => tourist.id === 't3'), false);
admin.click({ action: 'tourist-detail', id: 't4' });
admin.click({ action: 'delete-tourist', id: 't4' });
assert.match(admin.root.innerHTML, /Последнего туриста лида удалить нельзя/);

// Documents, city picker, work statuses and explicit UI states are clickable.
const modes = loadPrototype('tour-operations.js', '#app');
assert.match(modes.root.innerHTML, /Операции/);
assert.match(modes.root.innerHTML, /Пекин · остановка 1/);
modes.click({ action: 'summary-section', view: 'documents' });
assert.match(modes.root.innerHTML, /Не заполнено/);
assert.match(modes.root.innerHTML, /Виза, страховка и анкета остаются в бэклоге/);
assert.match(modes.root.innerHTML, /Соколов Илья/, 'a missing scan keeps the tourist in the missing queue even when the passport expires soon');
modes.click({ action: 'document-filter', filter: 'expiring' });
assert.doesNotMatch(modes.root.innerHTML, /Соколов Илья/);
modes.click({ action: 'workspace', view: 'work' });
assert.match(modes.root.innerHTML, /Циклическое переключение отключено/);
modes.click({ action: 'change-status', id: 't2', stage: 'arrival' });
modes.click({ action: 'apply-status', status: 'arrived' });
assert.equal(modes.snapshot().tourists.find((tourist) => tourist.id === 't2').statusByCity['route-beijing-1'].arrival, 'arrived');
selectCity(modes, 3);
assert.match(modes.root.innerHTML, /Пекин · остановка 2/);

// Closing the canonical card restores the exact tour/list context by routeCityId.
const contextRestore = loadPrototype('tour-operations.js', '#app');
selectCity(contextRestore, 3);
contextRestore.click({ action: 'stage', stage: 'departure' });
contextRestore.click({ action: 'nav', view: 'tourists' });
contextRestore.click({ action: 'tourist-list-mode', mode: 'groups' });
contextRestore.click({ action: 'tourist-filters' });
contextRestore.click({ action: 'toggle-tourist-filter', filter: 'limitedRoute' });
contextRestore.click({ action: 'close-overlay' });
contextRestore.click({ action: 'toggle-scope' });
contextRestore.click({ action: 'select-scope', id: 'lead-1042' });
contextRestore.input({ touristSearch: '' }, 'Соколов');
contextRestore.setScrollTop(237);
contextRestore.click({ action: 'tourist-detail', id: 't2' });
const capturedContext = contextRestore.snapshot().returnContext;
assert.equal(capturedContext.routeCityId, 'route-beijing-2');
assert.equal(capturedContext.operation, 'departure');
assert.equal(capturedContext.scopeLeadId, 'lead-1042');
assert.equal(capturedContext.listMode, 'groups');
assert.equal(capturedContext.query, 'Соколов');
assert.equal(capturedContext.scrollTop, 237);
assert.doesNotMatch(JSON.stringify(capturedContext), /passport|72 1122334|\+7 916/i);
contextRestore.click({ action: 'close-overlay' });
const restoredContext = contextRestore.snapshot();
assert.equal(restoredContext.routeCityId, 'route-beijing-2');
assert.equal(restoredContext.stage, 'departure');
assert.equal(restoredContext.scopeLead, 'lead-1042');
assert.equal(restoredContext.touristListMode, 'groups');
assert.equal(restoredContext.touristQuery, 'Соколов');
assert.equal(restoredContext.touristFilters.limitedRoute, true);
assert.equal(contextRestore.getScrollTop(), 237);

const touristFilters = loadPrototype('tour-operations.js', '#app');
touristFilters.click({ action: 'nav', view: 'tourists' });
touristFilters.click({ action: 'tourist-filters' });
assert.match(touristFilters.root.innerHTML, /Ограниченный маршрут/);
assert.match(touristFilters.root.innerHTML, /Статус · Прибытие/);
touristFilters.click({ action: 'set-status-filter', status: 'arrived' });
touristFilters.click({ action: 'close-overlay' });
assert.match(touristFilters.root.innerHTML, /Соколова Анна/);
assert.doesNotMatch(touristFilters.root.innerHTML, /Соколов Илья/);

for (const state of ['loading', 'error', 'empty']) {
  const preview = loadPrototype('tour-operations.js', '#app');
  preview.click({ action: 'role-menu' });
  preview.click({ action: 'open-ui-states' });
  preview.click({ action: 'set-ui-state', state });
  if (state === 'loading') assert.match(preview.root.innerHTML, /skeleton-card/);
  if (state === 'error') assert.match(preview.root.innerHTML, /Не удалось загрузить сводную/);
  if (state === 'empty') assert.match(preview.root.innerHTML, /В туре пока нет туристов/);
}

const offline = loadPrototype('tour-operations.js', '#app');
const beforeOffline = deepClone(offline.snapshot());
offline.click({ action: 'role-menu' });
offline.click({ action: 'toggle-offline' });
assert.match(offline.root.innerHTML, /Нет подключения/);
offline.dispatch({ action: 'add-stage' });
assert.match(offline.root.innerHTML, /Подключитесь к интернету/);
assert.deepEqual(offline.snapshot().records, beforeOffline.records);
selectRole(offline, 'admin');
const scansBeforeOfflineDelete = deepClone(offline.snapshot().tourists.find((tourist) => tourist.id === 't1').scans);
offline.dispatch({ action: 'delete-scan', id: 't1', scan: 'scan-t1-1' });
assert.deepEqual(offline.snapshot().tourists.find((tourist) => tourist.id === 't1').scans, scansBeforeOfflineDelete);

// Conflict resolution stores an explicit source and preserves hidden own values.
const tours = loadPrototype('tour-operations.js', '#app');
const t2OwnBefore = deepClone(tours.snapshot().records['route-beijing-1'].arrival.t2);
tours.click({ action: 'add-stage' });
['t1', 't2'].forEach((id) => tours.click({ action: 'toggle-tourist', id }));
tours.click({ action: 'next-operation' });
tours.click({ action: 'save-form' });
assert.match(tours.root.innerHTML, /Сверка данных/);
tours.assertDisabled({ action: 'apply-conflict' });
tours.click({ action: 'pick-conflict-source', id: 't1' });
tours.click({ action: 'apply-conflict' });
const arrivalGroup = Object.values(tours.snapshot().operationGroups['route-beijing-1'].arrival).find((group) => group.members.join(',') === 't1,t2');
assert.ok(arrivalGroup, 'a common arrival record is created');
assert.equal(arrivalGroup.sourceId, 't1');
assert.equal(arrivalGroup.subgroupId, arrivalGroup.id);
assert.equal(arrivalGroup.tourId, 'china');
assert.equal(arrivalGroup.routeCityId, 'route-beijing-1');
assert.equal(arrivalGroup.operation, 'arrival');
assert.equal(arrivalGroup.sourceVisitId, 'china:t1:route-beijing-1:arrival');
assert.deepEqual(arrivalGroup.memberVisitIds, ['china:t1:route-beijing-1:arrival', 'china:t2:route-beijing-1:arrival']);
assert.equal(Object.hasOwn(arrivalGroup, 'touristGroupId'), false);
assert.deepEqual(tours.snapshot().records['route-beijing-1'].arrival.t2, t2OwnBefore, 'grouping does not copy source values into t2');
const groupedT2Visit = tours.snapshot().visits.find((visit) => visit.visitId === 'china:t2:route-beijing-1:arrival');
assert.deepEqual(groupedT2Visit.ownValues, t2OwnBefore);
assert.deepEqual(groupedT2Visit.effectiveValues, tours.snapshot().records['route-beijing-1'].arrival.t1);

// Repeating the same apply upserts the same subgroup instead of creating a duplicate.
const subgroupCountBeforeRetry = Object.keys(tours.snapshot().operationGroups['route-beijing-1'].arrival).length;
tours.click({ action: 'add-stage' });
['t1', 't2'].forEach((id) => tours.click({ action: 'toggle-tourist', id }));
tours.click({ action: 'next-operation' });
tours.click({ action: 'save-form' });
const retriedArrivalGroups = tours.snapshot().operationGroups['route-beijing-1'].arrival;
assert.equal(Object.keys(retriedArrivalGroups).length, subgroupCountBeforeRetry);
assert.ok(retriedArrivalGroups[arrivalGroup.id]);

// Splitting an operation does not change the tour group.
const groupIdsBeforeOperationSplit = tours.snapshot().tourists.filter((tourist) => ['t1', 't2'].includes(tourist.id)).map((tourist) => tourist.groupId);
tours.click({ action: 'manage-operation', members: 't1,t2', group: arrivalGroup.id });
tours.click({ action: 'split-operation-members' });
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'apply-operation-split' });
assert.deepEqual(tours.snapshot().tourists.filter((tourist) => ['t1', 't2'].includes(tourist.id)).map((tourist) => tourist.groupId), groupIdsBeforeOperationSplit);
assert.match(tours.root.innerHTML, /CZ 342/);
assert.match(tours.root.innerHTML, /SU 204/);

// An operation subgroup is independent from the tour group and accepts additional tour members.
const operationAdd = loadPrototype('tour-operations.js', '#app');
const t4OwnArrivalBeforeAdd = deepClone(operationAdd.snapshot().records['route-beijing-1'].arrival.t4 || {});
operationAdd.click({ action: 'add-stage' });
['t1', 't3'].forEach((id) => operationAdd.click({ action: 'toggle-tourist', id }));
operationAdd.click({ action: 'next-operation' });
operationAdd.click({ action: 'save-form' });
operationAdd.click({ action: 'pick-conflict-source', id: 't1' });
operationAdd.click({ action: 'apply-conflict' });
const independentGroup = Object.values(operationAdd.snapshot().operationGroups['route-beijing-1'].arrival).find((group) => group.members.slice().sort().join(',') === 't1,t3');
assert.ok(independentGroup);
operationAdd.click({ action: 'manage-operation', members: independentGroup.members.join(','), group: independentGroup.id });
assert.match(operationAdd.root.innerHTML, /Добавить туристов/);
operationAdd.click({ action: 'add-operation-members' });
operationAdd.click({ action: 'toggle-tourist', id: 't4' });
operationAdd.click({ action: 'next-operation' });
operationAdd.click({ action: 'save-form' });
assert.deepEqual(operationAdd.snapshot().operationGroups['route-beijing-1'].arrival[independentGroup.id].members.slice().sort(), ['t1', 't3', 't4']);
assert.deepEqual(operationAdd.snapshot().records['route-beijing-1'].arrival.t4 || {}, t4OwnArrivalBeforeAdd);

const crossTourStorage = new Map([['unique-guide-tourists-v2', JSON.stringify([{
  id: 'japan-1', tourId: 'japan', leadId: 'lead-japan', lead: 'Лид Япония', leadStatus: 'Подтверждён',
  firstName: 'Юки', lastName: 'Танака', route: ['route-beijing-1'], type: 'Взрослый', scans: [],
}, {
  id: 'china-unconfirmed', tourId: 'china', leadId: 'lead-new', lead: 'Новый лид', leadStatus: 'В работе',
  firstName: 'Пётр', lastName: 'Новиков', route: ['route-beijing-1'], type: 'Взрослый', scans: [],
}])]]);
const crossTour = loadPrototype('tour-operations.js', '#app', '', crossTourStorage);
crossTour.click({ action: 'add-stage' });
assert.doesNotMatch(crossTour.root.innerHTML, /data-id="japan-1"/);
assert.match(crossTour.root.innerHTML, /Логистика доступна после подтверждения лида/);
crossTour.dispatch({ action: 'toggle-tourist', id: 'japan-1' });
crossTour.dispatch({ action: 'toggle-tourist', id: 'china-unconfirmed' });
assert.match(crossTour.root.innerHTML, /Далее · 0/);

// Four tourists from exactly two leads become one tour group.
tours.click({ action: 'nav', view: 'tourists' });
tours.click({ action: 'start-tourist-group' });
['t1', 't2', 't3', 't4'].forEach((id) => tours.click({ action: 'toggle-tourist', id }));
tours.click({ action: 'apply-tourist-group' });
const four = tours.snapshot().tourists.filter((tourist) => ['t1', 't2', 't3', 't4'].includes(tourist.id));
assert.equal(new Set(four.map((tourist) => tourist.groupId)).size, 1);
assert.equal(new Set(four.map((tourist) => tourist.leadId)).size, 2);

// One hotel for four.
tours.click({ action: 'nav', view: 'operations' });
tours.click({ action: 'stage', stage: 'hotel' });
tours.click({ action: 'add-stage' });
tours.click({ action: 'select-all' });
tours.click({ action: 'next-operation' });
tours.click({ action: 'save-form' });
assert.match(tours.root.innerHTML, /Сверка данных/);
tours.click({ action: 'pick-conflict-source', id: 't1' });
tours.click({ action: 'apply-conflict' });
const hotelGroup = Object.values(tours.snapshot().operationGroups['route-beijing-1'].hotel).find((group) => group.members.length === 4);
assert.ok(hotelGroup, 'common hotel covers all four tourists');

// Independent arrival subgroups 2+2.
tours.click({ action: 'stage', stage: 'arrival' });
for (const pair of [['t1', 't2'], ['t3', 't4']]) {
  tours.click({ action: 'add-stage' });
  pair.forEach((id) => tours.click({ action: 'toggle-tourist', id }));
  tours.click({ action: 'next-operation' });
  tours.click({ action: 'save-form' });
  if (tours.root.innerHTML.includes('Сверка данных')) {
    tours.click({ action: 'pick-conflict-source', id: pair[0] });
    tours.click({ action: 'apply-conflict' });
  }
}
const arrivalMembers = Object.values(tours.snapshot().operationGroups['route-beijing-1'].arrival).map((group) => group.members.slice().sort().join(',')).sort();
assert.deepEqual(arrivalMembers, ['t1,t2', 't3,t4']);

// Departures stay different and a hotel split does not affect arrival subgroups.
tours.click({ action: 'stage', stage: 'departure' });
const departureGroup = Object.values(tours.snapshot().operationGroups['route-beijing-1'].departure).find((group) => group.members.includes('t1'));
assert.ok(departureGroup);
tours.click({ action: 'manage-operation', members: departureGroup.members.join(','), group: departureGroup.id });
tours.click({ action: 'split-operation-members' });
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'apply-operation-split' });
['G89', 'G91', 'Лобби Hutong Garden', 'K12'].forEach((value) => assert.match(tours.root.innerHTML, new RegExp(value)));
tours.click({ action: 'stage', stage: 'hotel' });
const hotelBeforeSplit = deepClone(tours.snapshot().operationGroups['route-beijing-1'].hotel[hotelGroup.id]);
tours.click({ action: 'manage-operation', members: hotelBeforeSplit.members.join(','), group: hotelBeforeSplit.id });
tours.click({ action: 'split-operation-members' });
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'apply-operation-split' });
assert.match(tours.root.innerHTML, /Основная запись после отделения/);
tours.click({ action: 'pick-split-source', id: 't2' });
tours.click({ action: 'confirm-operation-split' });
assert.deepEqual(Object.values(tours.snapshot().operationGroups['route-beijing-1'].arrival).map((group) => group.members.slice().sort().join(',')).sort(), ['t1,t2', 't3,t4']);
assert.deepEqual(tours.snapshot().operationGroups['route-beijing-1'].hotel[hotelGroup.id].members.slice().sort(), ['t2', 't3', 't4']);

// Two existing tour groups cannot be merged automatically.
const groupingGuard = loadPrototype('tour-operations.js', '#app');
groupingGuard.click({ action: 'nav', view: 'tourists' });
groupingGuard.click({ action: 'start-tourist-group' });
['t3', 't4'].forEach((id) => groupingGuard.click({ action: 'toggle-tourist', id }));
groupingGuard.click({ action: 'apply-tourist-group' });
const guardBefore = deepClone(groupingGuard.snapshot().tourists);
groupingGuard.click({ action: 'start-tourist-group' });
['t1', 't3'].forEach((id) => groupingGuard.click({ action: 'toggle-tourist', id }));
groupingGuard.click({ action: 'apply-tourist-group' });
assert.match(groupingGuard.root.innerHTML, /двух существующих групп/);
assert.deepEqual(groupingGuard.snapshot().tourists, guardBefore);

// Dissolving the tour group preserves every operation subgroup.
const fullDissolve = loadPrototype('tour-operations.js', '#app');
fullDissolve.click({ action: 'nav', view: 'tourists' });
fullDissolve.click({ action: 'start-tourist-group' });
['t1', 't2', 't3', 't4'].forEach((id) => fullDissolve.click({ action: 'toggle-tourist', id }));
fullDissolve.click({ action: 'apply-tourist-group' });
const operationsBeforeDissolve = deepClone(fullDissolve.snapshot().operationGroups);
const commonGroupId = fullDissolve.snapshot().tourists.find((tourist) => tourist.id === 't1').groupId;
fullDissolve.click({ action: 'tourist-list-mode', mode: 'groups' });
fullDissolve.click({ action: 'split-tourist-group', group: commonGroupId });
['t1', 't2', 't3', 't4'].forEach((id) => fullDissolve.click({ action: 'toggle-tourist', id }));
fullDissolve.click({ action: 'apply-global-split' });
assert.ok(fullDissolve.snapshot().tourists.every((tourist) => !tourist.groupId));
assert.deepEqual(fullDissolve.snapshot().operationGroups, operationsBeforeDissolve);

// Directory CRUD and persistence.
const directoryStorage = new Map();
const directory = loadPrototype('tour-operations.js', '#app', '', directoryStorage);
selectRole(directory, 'admin');
directory.click({ action: 'tour-menu' });
directory.click({ action: 'open-directory' });
directory.click({ action: 'open-directory-city', id: 'city-beijing' });
directory.click({ action: 'toggle-directory-point', id: 'point-pkx' });
assert.equal(JSON.parse(directoryStorage.get('unique-guide-directory-v1')).points.find((point) => point.id === 'point-pkx').active, false);
directory.click({ action: 'close-overlay' });
directory.click({ action: 'new-directory-city' });
directory.submit('directory-city-form', { name: 'Тестоград', country: 'Тестландия', aliases: 'Test City', active: 'true' }, { id: '' });
assert.match(directory.root.innerHTML, /Тестоград/);

const directoryReload = loadPrototype('tour-operations.js', '#app', '', directoryStorage);
directoryReload.click({ action: 'tour-menu' });
directoryReload.click({ action: 'open-directory' });
assert.match(directoryReload.root.innerHTML, /Тестоград/);
directoryReload.click({ action: 'open-directory-city', id: 'city-beijing' });
assert.match(directoryReload.root.innerHTML, /Дасин/);
assert.match(directoryReload.root.innerHTML, /архив/i);

// 0, 1 and multiple transport-point rules.
const multiplePoints = loadPrototype('tour-operations.js', '#app');
multiplePoints.click({ action: 'add-stage' });
multiplePoints.click({ action: 'toggle-tourist', id: 't4' });
multiplePoints.click({ action: 'next-operation' });
multiplePoints.input({ field: 'transport' }, 'plane', 'change');
assert.match(multiplePoints.root.innerHTML, /Доступно в городе: 2 · Аэропорт/);
multiplePoints.click({ action: 'open-point-picker' });
assert.match(multiplePoints.root.innerHTML, /Дасин/);
assert.match(multiplePoints.root.innerHTML, /Шоуду/);

const onePoint = loadPrototype('tour-operations.js', '#app');
selectCity(onePoint, 1);
onePoint.click({ action: 'stage', stage: 'departure' });
onePoint.click({ action: 'add-stage' });
onePoint.click({ action: 'toggle-tourist', id: 't1' });
onePoint.click({ action: 'next-operation' });
onePoint.input({ field: 'transport' }, 'train', 'change');
assert.match(onePoint.root.innerHTML, /Сиань Северный/);
assert.match(onePoint.root.innerHTML, /Подставлено из справочника/);

const noPoints = loadPrototype('tour-operations.js', '#app');
selectCity(noPoints, 2);
noPoints.click({ action: 'stage', stage: 'departure' });
noPoints.click({ action: 'add-stage' });
noPoints.click({ action: 'toggle-tourist', id: 't1' });
noPoints.click({ action: 'next-operation' });
noPoints.input({ field: 'transport' }, 'bus', 'change');
assert.match(noPoints.root.innerHTML, /Указать вручную/);
assert.match(noPoints.root.innerHTML, /Не из справочника/);

// Operation drafts also require an explicit discard decision.
const dirtyOperation = loadPrototype('tour-operations.js', '#app');
dirtyOperation.click({ action: 'add-stage' });
dirtyOperation.click({ action: 'toggle-tourist', id: 't4' });
dirtyOperation.click({ action: 'next-operation' });
dirtyOperation.input({ field: 'time' }, '18:45');
dirtyOperation.click({ action: 'close-overlay' });
assert.match(dirtyOperation.root.innerHTML, /Закрыть без сохранения/);
dirtyOperation.click({ action: 'continue-editing' });
assert.match(dirtyOperation.root.innerHTML, /value="18:45"/);

// Static isolation and canonical spec checks.
const activeFiles = [
  'mobile-leads.html', 'mobile-leads.css', 'mobile-leads.js',
  'tour-operations.html', 'tour-operations.css', 'tour-operations.js',
  'mobile-leads-tz.html', 'mobile-leads-tz.css',
];
const activeSource = activeFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const activeJs = fs.readFileSync('mobile-leads.js', 'utf8') + fs.readFileSync('tour-operations.js', 'utf8');
assert.doesNotMatch(activeSource, /@import\s+url\(|url\(["']?https?:|<script[^>]+https?:|<link[^>]+https?:/i);
assert.doesNotMatch(activeJs, /(?:fetch\s*\(|new\s+XMLHttpRequest|new\s+WebSocket|new\s+EventSource|sendBeacon\s*\(|\/api\/)/);
assert.doesNotMatch(fs.readFileSync('mobile-leads.js', 'utf8') + fs.readFileSync('tour-operations.js', 'utf8') + fs.readFileSync('tour-operations.html', 'utf8'), /ФИНАНС|Стоимость|Аванс|Остаток|\bfinance\b|\bbalance\b/i);

const specMarkdown = fs.readFileSync('mobile-leads-tz.md', 'utf8');
const specHtml = fs.readFileSync('mobile-leads-tz.html', 'utf8');
const specImages = [
  '01-lead-to-summary.png',
  '02-tour-summary.png',
  '03-tour-coverage.png',
  '04-tourist-group-selection.png',
  '05-conflict-review.png',
  '06-tourist-logistics.png',
  '07-city-directory.png',
  '08-split-operation.png',
  '09-guide-readonly.png',
  '10-work-status.png',
  '11-offline.png',
  '12-point-picker.png',
  '13-error-state.png',
  '14-empty-state.png',
  '15-summary-375.png',
];
specImages.forEach((image) => {
  const path = `assets/spec/${image}`;
  assert.ok(fs.statSync(path).size > 10_000, `${path} must contain a real interface screenshot`);
  assert.equal(specHtml.split(path).length - 1, 2, `${path} must be linked and rendered once in the visual spec`);
  assert.match(specMarkdown, new RegExp(`\\(${escapeRegExp(path)}\\)`), `${path} must be documented in Markdown`);
});
const idPattern = /\b(?:SCOPE|MVP|FLOW|MODEL|IA|LEAD|TOUR|CARD|READY|STATUS|OPS|GROUP|LIST|DOC|ROLE|DIR|STATE|VIS|API|AC|NG|BL)-\d+\b/g;
const markdownIds = [...new Set(specMarkdown.match(idPattern) || [])].sort();
const htmlIds = [...new Set(specHtml.match(idPattern) || [])].sort();
assert.deepEqual(htmlIds, markdownIds);
assert.ok(markdownIds.length >= 100, 'the canonical spec must retain the full requirement set');
const requirementRows = specMarkdown.split('\n').map((line) => line.match(/^- \*\*([A-Z]+-\d{2})\.\*\* (.+)$/)).filter(Boolean);
const renderRequirementText = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
assert.equal(requirementRows.length, markdownIds.length, 'each requirement ID must have one canonical Markdown row');
requirementRows.forEach(([, id, text]) => {
  const exactRow = `<li class="req"><strong>${id}.</strong> ${renderRequirementText(text)}</li>`;
  assert.equal(specHtml.split(exactRow).length - 1, 1, `${id} must have the exact canonical meaning in HTML`);
});
const markdownHash = crypto.createHash('sha256').update(specMarkdown).digest('hex');
assert.match(specHtml, new RegExp(`<meta name="spec-sha256" content="${markdownHash}">`));

assert.equal(networkCalls.length, 0, `prototype made network calls: ${JSON.stringify(networkCalls)}`);

console.log(`Prototype smoke test passed (${markdownIds.length} requirement IDs)`);
