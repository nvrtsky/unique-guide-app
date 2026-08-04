import assert from 'node:assert';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';

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

function assertMarkupOrder(markup, needles, context) {
  let cursor = -1;
  needles.forEach((needle) => {
    const next = markup.indexOf(needle, cursor + 1);
    assert.ok(next >= 0, `${context}: “${needle}” must be rendered`);
    assert.ok(next > cursor, `${context}: “${needle}” must follow the previous canonical item`);
    cursor = next;
  });
}

function assertExactlyOneRepresentativePerGroup(snapshot, context) {
  const grouped = snapshot.tourists.reduce((result, tourist) => {
    if (!tourist.groupId) {
      assert.equal(tourist.groupRepresentative, false, `${context}: a free tourist cannot represent a group`);
      return result;
    }
    (result[tourist.groupId] ||= []).push(tourist);
    return result;
  }, {});
  Object.entries(grouped).forEach(([groupId, members]) => {
    assert.equal(
      members.filter((tourist) => tourist.groupRepresentative).length,
      1,
      `${context}: ${groupId} must have exactly one representative`,
    );
  });
}

function formEntries(values) {
  return Object.entries(values || {}).flatMap(([key, value]) => Array.isArray(value) ? value.map((item) => [key, item]) : [[key, value]]);
}

function loadPrototype(file, appSelector, search = '', sharedStorage = new Map()) {
  const sourceFiles = Array.isArray(file) ? file : [file];
  const listeners = {};
  let scrollTop = 0;
  let focusedSelector = null;
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
      const leadSection = selector.match(/\[data-lead-section=["']([^"']+)["']\]/);
      if (leadSection && this.html.includes(`data-lead-section="${leadSection[1]}"`)) {
        return {
          focus() { focusedSelector = selector; },
          setSelectionRange() {},
          value: '',
        };
      }
      return null;
    },
  };

  const workspaceStyles = { disabled: true };
  const document = {
    currentScript: null,
    querySelector(selector) { return selector === appSelector ? root : root.querySelector(selector); },
    getElementById(id) {
      if (id === appSelector.replace('#', '')) return root;
      if (id === 'mobile-leads-workspace-styles') return workspaceStyles;
      return null;
    },
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
  if (!sourceFiles.includes('mock-crm-data.js') && fs.existsSync('mock-crm-data.js')) {
    vm.runInNewContext(fs.readFileSync('mock-crm-data.js', 'utf8'), context, { filename: 'mock-crm-data.js' });
  }
  sourceFiles.forEach((sourceFile) => {
    document.currentScript = { dataset: { embeddedLeads: sourceFiles.length > 1 && sourceFile === 'mobile-leads.js' ? 'true' : 'false' } };
    vm.runInNewContext(fs.readFileSync(sourceFile, 'utf8'), context, { filename: sourceFile });
  });
  document.currentScript = null;

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
    let defaultPrevented = false;
    (listeners.click || []).forEach((handler) => handler({ preventDefault() { defaultPrevented = true; }, target: { closest: () => button } }));
    return { defaultPrevented };
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
    getFocusedSelector() { return focusedSelector; },
    setScrollTop(value) { scrollTop = Number(value || 0); },
    getScrollTop() { return scrollTop; },
    workspaceStyles,
  };
}

function selectCity(prototype, index) {
  prototype.click({ action: 'open-city-picker' });
  prototype.click({ action: 'select-city', index: String(index) });
}

function selectFinanceCity(prototype, routeCityId) {
  prototype.click({ action: 'open-finance-city-picker' });
  prototype.click({ action: 'select-finance-city', routeCityId });
}

function financeCollectionAction(prototype, collected) {
  const match = prototype.root.innerHTML.match(new RegExp(`data-action="finance-collection"[^>]*data-finance-action="([^"]+)"[^>]*data-collected="${collected}"`));
  assert.ok(match, `Finance ${collected === 'true' ? 'pay' : 'unpay'} action must exist`);
  return { action: 'finance-collection', financeAction: match[1], collected };
}

function selectRole(prototype, role) {
  prototype.click({ action: 'role-menu' });
  prototype.click({ action: 'select-role', role });
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function leadFormValues(overrides = {}) {
  return {
    firstName: 'Иван', lastName: 'Тестов', middleName: '', phone: '+7 900 777-66-55', telegram: '@ivan_test', email: 'ivan-prototype@example.test',
    dateOfBirth: '1990-04-12', passportSeries: '45 12 987654', passportIssuedBy: 'ОВД Тестовый', registrationAddress: 'Москва',
    foreignPassportName: 'TESTOV IVAN', foreignPassportNumber: '75 7654321', foreignPassportValidUntil: '2032-04-12',
    tourSearch: 'Гранд-тур по Китаю', eventId: 'china', selectedCityIds: ['route-beijing-1', 'route-xian-1'],
    tourCost: '100000', tourCostCurrency: 'RUB', advancePayment: '30000', advancePaymentCurrency: 'RUB', remainingPayment: '70000', remainingPaymentCurrency: 'RUB',
    roomType: ['Twin'], hotelCategory: ['4*'], transfers: ['group'], meals: ['BB'], category: 'category_ab', status: 'new', source: 'direct',
    manager: 'Елена Воронова', color: '#2f6bd8', note: 'Smoke-test lead',
    ...overrides,
  };
}

// The technical Lead surface remains linked into one public CRM entry point.
const leadList = loadPrototype('mobile-leads.js', '#app');
['Туры', 'Туристы', 'Лиды'].forEach((label) => assert.match(leadList.root.innerHTML, new RegExp(label)));

// The clean mock contract is intentionally large enough to exercise lists, filters and finance aggregation.
const datasetAdmin = loadPrototype('mobile-leads.js', '#app', '?role=admin').snapshot();
const datasetTours = loadPrototype('tour-operations.js', '#app', '?tourId=china&role=admin').snapshot().tours;
const expectedDataset = { china: 5, japan: 4, italy: 3, morocco: 5, turkey: 4 };
assert.equal(datasetTours.length, 5, 'clean data contains exactly five tours');
assert.equal(new Set(datasetAdmin.tourists.map((tourist) => tourist.id)).size, datasetAdmin.tourists.length, 'tourist IDs are unique');
assert.equal(new Set(datasetAdmin.leads.map((leadItem) => leadItem.id)).size, datasetAdmin.leads.length, 'lead IDs are unique');
Object.entries(expectedDataset).forEach(([tourId, expectedLeadCount]) => {
  const tourMembers = datasetAdmin.tourists.filter((tourist) => tourist.tourId === tourId);
  assert.equal(tourMembers.length, 10, `${tourId} contains exactly ten tourists`);
  assert.equal(new Set(tourMembers.map((tourist) => tourist.leadId)).size, expectedLeadCount, `${tourId} contains the planned number of leads`);
  tourMembers.forEach((tourist) => {
    assert.ok(tourist.leadId, `${tourist.id} belongs to a lead`);
    assert.ok(datasetAdmin.leads.some((leadItem) => leadItem.id === tourist.leadId && leadItem.eventId === tourId), `${tourist.id} belongs to a lead from the same tour`);
  });
});
assert.equal(datasetAdmin.tourists.filter((tourist) => Object.hasOwn(expectedDataset, tourist.tourId)).length, 50, 'five tours contain exactly fifty tourists');

// Storage upgrades preserve legacy edits, add only the new v3 mock rows and keep legacy deletions deleted.
const legacyTourist = deepClone(datasetAdmin.tourists.find((tourist) => tourist.id === 't1'));
legacyTourist.phone = '+7 900 000-11-22';
legacyTourist.notes = 'Правка туриста из v2 должна сохраниться.';
const touristMigrationStorage = new Map([
  ['unique-guide-tourists-v2', JSON.stringify([legacyTourist])],
]);
const touristMigration = loadPrototype('mobile-leads.js', '#app', '?role=admin', touristMigrationStorage);
const migratedTourist = touristMigration.snapshot().tourists.find((tourist) => tourist.id === 't1');
assert.equal(migratedTourist.phone, '+7 900 000-11-22');
assert.equal(migratedTourist.notes, 'Правка туриста из v2 должна сохраниться.');
assert.ok(touristMigration.snapshot().tourists.some((tourist) => tourist.id === 'tourist-japan-01'), 'v2 → v3 adds the new supplemental dataset once');
assert.ok(touristMigration.snapshot().tourists.some((tourist) => tourist.id === 'lead-tourist-1051'), 'an unfinished v2 mobile migration receives its prior schema additions');
assert.ok(touristMigration.snapshot().tourists.some((tourist) => tourist.id === 't5'));
assert.ok(!touristMigration.snapshot().tourists.some((tourist) => tourist.id === 't2'), 'a legacy seed missing from v2 remains deleted');
assert.equal(touristMigrationStorage.get('unique-guide-tourists-v3-mobile-migrated'), '1');
const storedMigratedTourists = JSON.parse(touristMigrationStorage.get('unique-guide-tourists-v3'));
assert.equal(storedMigratedTourists.find((tourist) => tourist.id === 't1').phone, '+7 900 000-11-22');
assert.ok(!storedMigratedTourists.some((tourist) => tourist.id === 't2'));
const tourFirstMigrationStorage = new Map([
  ['unique-guide-tourists-v2', JSON.stringify([legacyTourist])],
]);
const tourFirstMigration = loadPrototype('tour-operations.js', '#app', '?tourId=china&role=admin', tourFirstMigrationStorage);
assert.equal(tourFirstMigration.snapshot().tourists.find((tourist) => tourist.id === 't1').notes, 'Правка туриста из v2 должна сохраниться.');
assert.ok(tourFirstMigration.snapshot().tourists.some((tourist) => tourist.id === 'tourist-japan-01'));
assert.ok(!tourFirstMigration.snapshot().tourists.some((tourist) => tourist.id === 't2'));
const leadsAfterTourFirstMigration = loadPrototype('mobile-leads.js', '#app', '?role=admin', tourFirstMigrationStorage);
assert.equal(leadsAfterTourFirstMigration.snapshot().tourists.find((tourist) => tourist.id === 't1').phone, '+7 900 000-11-22');
assert.ok(!leadsAfterTourFirstMigration.snapshot().tourists.some((tourist) => tourist.id === 't2'));
const completedLegacyTouristStorage = new Map([
  ['unique-guide-tourists-v2', JSON.stringify([legacyTourist])],
  ['unique-guide-tourists-v2-mobile-migrated', '1'],
]);
const completedLegacyTourists = loadPrototype('mobile-leads.js', '#app', '?role=admin', completedLegacyTouristStorage).snapshot().tourists;
assert.ok(!completedLegacyTourists.some((tourist) => tourist.id === 'lead-tourist-1051'), 'completed v2 snapshots keep deletions of prior schema additions');
assert.ok(!completedLegacyTourists.some((tourist) => tourist.id === 't5'));

// The Tours surface can perform the lead v1 → v2 upgrade before Leads opens.
const legacyLead = deepClone(datasetAdmin.leads.find((leadItem) => leadItem.id === 'lead-1042'));
legacyLead.phone = '+7 900 333-44-55';
legacyLead.note = 'Правка лида из v1 должна сохраниться.';
const leadMigrationStorage = new Map([
  ['unique-guide-leads-v1', JSON.stringify([legacyLead])],
]);
loadPrototype('tour-operations.js', '#app', '?tourId=china&role=admin', leadMigrationStorage);
const storedMigratedLeads = JSON.parse(leadMigrationStorage.get('unique-guide-leads-v2'));
assert.equal(storedMigratedLeads.find((leadItem) => leadItem.id === 'lead-1042').phone, '+7 900 333-44-55');
assert.ok(storedMigratedLeads.some((leadItem) => leadItem.id === 'lead-japan-01'), 'v1 → v2 adds the new supplemental leads once');
assert.ok(!storedMigratedLeads.some((leadItem) => leadItem.id === 'lead-1048'), 'a legacy lead missing from v1 remains deleted');
const migratedLeadSurface = loadPrototype('mobile-leads.js', '#app', '?role=admin', leadMigrationStorage);
assert.equal(migratedLeadSurface.snapshot().leads.find((leadItem) => leadItem.id === 'lead-1042').note, 'Правка лида из v1 должна сохраниться.');
assert.ok(!migratedLeadSurface.snapshot().leads.some((leadItem) => leadItem.id === 'lead-1048'));
const partialLegacyLeadStorage = new Map([
  ['unique-guide-leads-v1', JSON.stringify([{ id: 'lead-1042', eventId: 'china', manager: 'Елена Воронова', remainingPayment: '77777' }])],
]);
loadPrototype('tour-operations.js', '#app', '?tourId=china&role=admin', partialLegacyLeadStorage);
const partialMigratedLeads = JSON.parse(partialLegacyLeadStorage.get('unique-guide-leads-v2'));
assert.equal(partialMigratedLeads.find((leadItem) => leadItem.id === 'lead-1042').remainingPayment, '77777');
assert.ok(partialMigratedLeads.some((leadItem) => leadItem.id === 'lead-1048'), 'a partial v1 write from Tours is completed before becoming authoritative');
const partialLeadSurface = loadPrototype('mobile-leads.js', '#app', '?role=admin', partialLegacyLeadStorage);
assert.equal(partialLeadSurface.snapshot().leads.find((leadItem) => leadItem.id === 'lead-1042').remainingPayment, '77777');
const oldBaseLeadIds = new Set(['lead-1042', 'lead-1048', 'lead-1051', 'lead-1033']);
const emptyLegacyToursFirstStorage = new Map([['unique-guide-leads-v1', '[]']]);
loadPrototype('tour-operations.js', '#app', '?tourId=china&role=admin', emptyLegacyToursFirstStorage);
const emptyToursFirstV2 = JSON.parse(emptyLegacyToursFirstStorage.get('unique-guide-leads-v2'));
assert.ok(!emptyToursFirstV2.some((leadItem) => oldBaseLeadIds.has(leadItem.id)), 'Tours-first migration treats an empty full v1 snapshot as authoritative');
assert.ok(emptyToursFirstV2.some((leadItem) => leadItem.id === 'lead-japan-01'), 'new v2 supplemental leads may be added to an empty legacy snapshot');
const emptyToursFirstLeads = loadPrototype('mobile-leads.js', '#app', '?role=admin', emptyLegacyToursFirstStorage).snapshot().leads;
assert.ok(!emptyToursFirstLeads.some((leadItem) => oldBaseLeadIds.has(leadItem.id)));

const emptyLegacyLeadsFirstStorage = new Map([['unique-guide-leads-v1', '[]']]);
const emptyLeadsFirst = loadPrototype('mobile-leads.js', '#app', '?role=admin', emptyLegacyLeadsFirstStorage).snapshot().leads;
assert.ok(!emptyLeadsFirst.some((leadItem) => oldBaseLeadIds.has(leadItem.id)), 'Leads-first migration keeps all four deleted old base leads deleted');
assert.ok(emptyLeadsFirst.some((leadItem) => leadItem.id === 'lead-japan-01'));
const emptyLeadsFirstTours = loadPrototype('tour-operations.js', '#app', '?tourId=japan&role=admin', emptyLegacyLeadsFirstStorage).snapshot();
assert.ok(!JSON.parse(emptyLegacyLeadsFirstStorage.get('unique-guide-leads-v2')).some((leadItem) => oldBaseLeadIds.has(leadItem.id)), 'Tours reload does not resurrect old base leads after Leads-first migration');
assert.ok(emptyLeadsFirstTours.tours.some((tour) => tour.id === 'japan'));

// v3 is authoritative across both surfaces: deleting in the Summary cannot be undone by a Leads reload.
const deletionStorage = new Map();
loadPrototype('mobile-leads.js', '#app', '?role=admin', deletionStorage);
deletionStorage.delete('unique-guide-tourists-v3-mobile-migrated');
const deletingTourist = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=t2&role=admin', deletionStorage);
deletingTourist.click({ action: 'delete-tourist', id: 't2' });
deletingTourist.click({ action: 'confirm-delete-tourist', id: 't2' });
assert.ok(!deletingTourist.snapshot().tourists.some((tourist) => tourist.id === 't2'));
assert.equal(deletionStorage.get('unique-guide-tourists-v3-mobile-migrated'), '1');
assert.ok(!JSON.parse(deletionStorage.get('unique-guide-tourists-v3')).some((tourist) => tourist.id === 't2'));
const leadsAfterTouristDelete = loadPrototype('mobile-leads.js', '#app', '?role=admin', deletionStorage);
assert.ok(!leadsAfterTouristDelete.snapshot().tourists.some((tourist) => tourist.id === 't2'), 'Leads reload does not resurrect a Summary deletion');
const summaryAfterTouristDelete = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&role=admin', deletionStorage);
assert.ok(!summaryAfterTouristDelete.snapshot().tourists.some((tourist) => tourist.id === 't2'), 'Summary reload keeps the authoritative deletion');

const lead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042');
const leadTabs = [...lead.root.innerHTML.matchAll(/data-detail-tab="([^"]+)"[^>]*>([^<]+)/g)].map((match) => match[2].trim());
assert.deepEqual(leadTabs, ['Редактировать', 'Чат', 'Документы', 'Задачи']);
assert.match(lead.root.innerHTML, /Соколова Анна Игоревна/, 'lead deep link opens the requested card');
assert.match(lead.root.innerHTML, />\s*Финансы\s*</i, 'manager navigation stays identical inside a lead card');
assert.doesNotMatch(lead.root.innerHTML, />\s*Расходы\s*</i);

// Lead Read is the canonical web form projected as ordered mobile cards; edit opens the same form at the chosen block.
assertMarkupOrder(lead.root.innerHTML, [
  'ПРОВЕРИТЬ СВЯЗИ ЛИД-ТУР',
  'РУЧНОЕ ОБЪЕДИНЕНИЕ ЛИДОВ',
  'ЛИЧНЫЕ ДАННЫЕ',
  'ТУР И ОПЛАТА',
  'НАСТРОЙКИ',
  'UTM-ТРЕКИНГ',
  'ПРИМЕЧАНИЕ',
  'ТУРИСТЫ',
  'ДЕЙСТВИЯ',
  'Сводная по туру',
], 'Lead Read canonical order');
assertMarkupOrder(lead.root.innerHTML, [
  'Фамилия', 'Имя', 'Отчество', 'Телефон', 'Telegram username', 'Email', 'Telegram User ID',
], 'Lead Read personal field order');
lead.setScrollTop(317);
lead.click({ action: 'edit-lead-section', section: 'tour-payment' });
assert.equal(lead.snapshot().screen, 'lead-form');
assert.match(lead.root.innerHTML, /Редактировать лид/);
assertMarkupOrder(lead.root.innerHTML, [
  'data-lead-section="personal"',
  'data-lead-section="tour-payment"',
  'data-lead-section="settings"',
  'data-lead-section="notes"',
], 'Lead editor canonical block order');
assert.match(lead.getFocusedSelector() || '', /data-lead-section=["']tour-payment["']/);
lead.click({ action: 'back-detail' });
assert.equal(lead.snapshot().screen, 'detail');
assert.equal(lead.getScrollTop(), 317, 'closing the editor restores the Lead Read scroll position');

// Production uses viewer; legacy guide is only a normalized URL alias. Neither viewer nor escort can load Leads/PII.
for (const [requestedRole, canonicalRole] of [['viewer', 'viewer'], ['guide', 'viewer'], ['escort', 'escort']]) {
  const restrictedLeads = loadPrototype('mobile-leads.js', '#app', `?lead=lead-1042&role=${requestedRole}`);
  const restrictedSnapshot = restrictedLeads.snapshot();
  assert.equal(restrictedSnapshot.role, canonicalRole);
  assert.equal(restrictedSnapshot.screen, 'forbidden');
  assert.deepEqual(restrictedSnapshot.leads, []);
  assert.deepEqual(restrictedSnapshot.tourists, []);
  assert.match(restrictedLeads.root.innerHTML, /Нет доступа к лидам/);
  assert.doesNotMatch(restrictedLeads.root.innerHTML, /Соколова|anna@example\.ru|\+7 916|L-1042|lead-1042/);
  const restrictedLeadNav = (restrictedLeads.root.innerHTML.match(/<nav class="[^"]*\bbottom-nav\b[^"]*"[^>]*>([\s\S]*?)<\/nav>/) || [])[1] || '';
  const restrictedLeadNavLabels = [...restrictedLeadNav.matchAll(/<span>([^<]+)<\/span>/g)].map((match) => match[1].trim());
  assert.deepEqual(restrictedLeadNavLabels, ['Туры', 'Туристы']);
  const restrictedBefore = deepClone(restrictedSnapshot);
  restrictedLeads.dispatch({ action: 'edit-lead' });
  restrictedLeads.dispatch({ action: 'add-task' });
  restrictedLeads.dispatch({ stage: 'lost' });
  assert.deepEqual(restrictedLeads.snapshot(), restrictedBefore);
}

const unknownLeadRole = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&role=superadmin');
assert.ok(!['admin', 'manager'].includes(unknownLeadRole.snapshot().role));
assert.equal(unknownLeadRole.snapshot().screen, 'forbidden');
assert.deepEqual(unknownLeadRole.snapshot().leads, []);
assert.deepEqual(unknownLeadRole.snapshot().tourists, []);
assert.match(unknownLeadRole.root.innerHTML, /Нет доступа к лидам/);
assert.doesNotMatch(unknownLeadRole.root.innerHTML, /Соколова|anna@example\.ru|\+7 916|L-1042|lead-1042/);

// A manager sees only assigned leads in lists and receives a hard refusal for a foreign direct link.
const managerLeadList = loadPrototype('mobile-leads.js', '#app', '?role=manager');
const visibleManagerLeadIds = managerLeadList.snapshot().leads.map((item) => item.id).sort();
assert.ok(visibleManagerLeadIds.includes('lead-1042') && visibleManagerLeadIds.includes('lead-turkey-04'));
assert.equal(visibleManagerLeadIds.length, 16, 'manager sees all active mock leads assigned to Elena');
assert.match(managerLeadList.root.innerHTML, /Соколова|Орлова/);
assert.doesNotMatch(managerLeadList.root.innerHTML, /Волков Денис|lead-1051|denis@example\.ru/);
const foreignManagerLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1051&role=manager');
assert.equal(foreignManagerLead.snapshot().screen, 'forbidden');
assert.equal(foreignManagerLead.snapshot().activeLeadId, null);
assert.match(foreignManagerLead.root.innerHTML, /Нет доступа к лидам/);
assert.doesNotMatch(foreignManagerLead.root.innerHTML, /Волков|Денис|denis@example\.ru|\+7 985|L-1051|lead-1051/);

// Delete is an explicit admin-only confirmation flow; cancel is lossless and manager never receives the control.
assert.doesNotMatch(managerLeadList.root.innerHTML, /data-action="(?:request|confirm)-delete-lead"/);
const deleteLeadStorage = new Map();
const adminDeleteLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&role=admin', deleteLeadStorage);
const adminLeadCountBeforeDelete = adminDeleteLead.snapshot().leads.length;
adminDeleteLead.click({ action: 'request-delete-lead' });
assert.match(adminDeleteLead.root.innerHTML, /Удалить лид/);
assert.match(adminDeleteLead.root.innerHTML, /data-action="confirm-delete-lead"/);
assert.equal(adminDeleteLead.snapshot().leads.length, adminLeadCountBeforeDelete);
adminDeleteLead.click({ action: 'cancel-delete-lead' });
assert.ok(adminDeleteLead.snapshot().leads.some((item) => item.id === 'lead-1042'));
adminDeleteLead.click({ action: 'request-delete-lead' });
adminDeleteLead.click({ action: 'confirm-delete-lead' });
assert.equal(adminDeleteLead.snapshot().leads.length, adminLeadCountBeforeDelete - 1);
assert.ok(!adminDeleteLead.snapshot().leads.some((item) => item.id === 'lead-1042'));

// The tourist list is a section of Editing, not a fifth Lead tab, and links to one canonical card.
assert.match(lead.root.innerHTML, /ТУРИСТЫ/);
lead.click({ action: 'open-unified-tourist', tourist: 't1' });
const touristUrl = new URL(lead.window.location.href, 'https://prototype.test/');
assert.equal(touristUrl.searchParams.get('tourist'), 't1');
assert.equal(touristUrl.searchParams.get('tourId'), 'china');
assert.equal(touristUrl.searchParams.get('returnLead'), 'lead-1042');

// Tour navigation has the same six sections and order as the web card.
const overview = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=overview');
const workspaceMarkup = (overview.root.innerHTML.match(/<div class="workspace-tabs">([\s\S]*?)<\/div>/) || [])[1] || '';
const tourTabs = [...workspaceMarkup.matchAll(/data-action="workspace" data-view="(?:tour-info|operations|program|tour-team|tour-tasks|tour-actions)"[^>]*>([^<]+)/g)]
  .map((match) => match[1].trim());
assert.deepEqual(tourTabs, ['Обзор', 'Сводная', 'Программа', 'Команда', 'Задачи', 'Действия']);
assert.equal(overview.snapshot().selectedTourId, 'china');
assert.match(overview.root.innerHTML, /Гранд-тур по Китаю/);

for (const requestedRole of ['viewer', 'guide']) {
  const viewerTour = loadPrototype('tour-operations.js', '#app', `?tourId=china&tourSection=overview&role=${requestedRole}`);
  assert.equal(viewerTour.snapshot().role, 'viewer');
  assert.match(viewerTour.root.innerHTML, /Гид/);
  const restrictedNav = (viewerTour.root.innerHTML.match(/<nav class="[^"]*\bbottom-nav\b[^"]*"[^>]*>([\s\S]*?)<\/nav>/) || [])[1] || '';
  const restrictedNavLabels = [...restrictedNav.matchAll(/<span>([^<]+)<\/span>/g)].map((match) => match[1].trim());
  assert.deepEqual(restrictedNavLabels, ['Задачи', 'Туристы', 'Финансы'], 'assigned collection guide keeps the first-edition areas and receives only the permitted Finance tab');
  assert.doesNotMatch(viewerTour.root.innerHTML, /189[\s\u00a0]*000|Открыть на сайте/);
  assert.doesNotMatch(viewerTour.root.innerHTML, /Шанхай|Пекин · остановка 2/, 'viewer Overview is limited to assigned route positions');
}

// Without an explicit deep link, Guide opens the unchanged first-edition Tasks workspace.
const guideHome = loadPrototype('tour-operations.js', '#app', '?tourId=china&role=viewer');
assert.equal(guideHome.snapshot().view, 'operations');

// Leads are an in-app workspace of the same prototype shell, not a hard-navigation application.
const unifiedWorkspace = loadPrototype(['tour-operations.js', 'mobile-leads.js'], '#app', '?tourId=china&tourSection=summary&routeCityId=route-xian-1&operation=hotel&role=manager');
const unifiedTourBeforeLeads = deepClone(unifiedWorkspace.snapshot());
unifiedWorkspace.click({ action: 'open-leads' });
assert.equal(unifiedWorkspace.window.location.href, '');
assert.equal(unifiedWorkspace.workspaceStyles.disabled, false);
assert.match(unifiedWorkspace.root.innerHTML, /class="status-icons"/);
assert.match(unifiedWorkspace.root.innerHTML, /class="user-row"/);
assert.match(unifiedWorkspace.root.innerHTML, /data-action="role-menu"[^>]*>Менеджер<\/button>/);
const unifiedLeadNav = (unifiedWorkspace.root.innerHTML.match(/<nav class="[^"]*\bbottom-nav\b[^"]*"[^>]*>([\s\S]*?)<\/nav>/) || [])[1] || '';
assert.deepEqual([...unifiedLeadNav.matchAll(/<span>([^<]+)<\/span>/g)].map((match) => match[1]), ['Туры', 'Туристы', 'Финансы', 'Лиды']);
assert.match(unifiedLeadNav, /class="nav-item active"[^>]*data-action="nav" data-view="leads"/);
assert.doesNotMatch(unifiedWorkspace.root.innerHTML, /● ● ▰|data-action="nav-placeholder"/);
unifiedWorkspace.click({ action: 'nav', view: 'tours' });
const unifiedTourAfterReturn = unifiedWorkspace.snapshot();
assert.equal(unifiedWorkspace.workspaceStyles.disabled, true);
assert.equal(unifiedTourAfterReturn.selectedTourId, unifiedTourBeforeLeads.selectedTourId);
assert.equal(unifiedTourAfterReturn.routeCityId, unifiedTourBeforeLeads.routeCityId);
assert.equal(unifiedTourAfterReturn.stage, unifiedTourBeforeLeads.stage);
assert.equal(unifiedTourAfterReturn.view, unifiedTourBeforeLeads.view);

unifiedWorkspace.click({ action: 'open-leads' });
unifiedWorkspace.click({ openLead: 'lead-1042' });
const summaryLinkClick = unifiedWorkspace.click({ action: 'open-tour-summary' });
assert.equal(summaryLinkClick.defaultPrevented, true, 'the in-app summary link must cancel its browser navigation');
const summaryFromLead = unifiedWorkspace.snapshot();
assert.equal(summaryFromLead.selectedTourId, 'china');
assert.equal(summaryFromLead.view, 'operations');
assert.equal(summaryFromLead.scopeLead, 'lead-1042');
assert.equal(unifiedWorkspace.window.location.href, '');

const guideSwitchFromLeads = loadPrototype(['tour-operations.js', 'mobile-leads.js'], '#app', '?tourId=china&tourSection=summary&routeCityId=route-xian-1&operation=hotel&role=manager');
guideSwitchFromLeads.click({ action: 'open-leads' });
guideSwitchFromLeads.click({ action: 'role-menu' });
guideSwitchFromLeads.click({ action: 'set-role', role: 'viewer' });
assert.equal(guideSwitchFromLeads.snapshot().role, 'viewer');
assert.equal(guideSwitchFromLeads.snapshot().view, 'operations');
assert.match(guideSwitchFromLeads.root.innerHTML, /Задачи/);
assert.doesNotMatch(guideSwitchFromLeads.root.innerHTML, />\s*Лиды\s*</);
guideSwitchFromLeads.click({ action: 'role-menu' });
guideSwitchFromLeads.click({ action: 'select-role', role: 'manager' });
guideSwitchFromLeads.click({ action: 'open-leads' });
assert.match(guideSwitchFromLeads.root.innerHTML, /CRM · \d+ активных/);
assert.doesNotMatch(guideSwitchFromLeads.root.innerHTML, /<h2>Роль просмотра<\/h2>/);

// Both embedded workspaces share one canonical tourist array, so a later lead save cannot overwrite a tour-profile edit.
const sharedTouristFlow = loadPrototype(['tour-operations.js', 'mobile-leads.js'], '#app', '?tourId=china&view=tourists&tourist=t1&touristSection=profile&role=manager');
sharedTouristFlow.click({ action: 'toggle-profile-section', section: 'personal' });
sharedTouristFlow.click({ action: 'edit-profile-section', id: 't1', section: 'personal' });
sharedTouristFlow.submit('profile-section-form', {
  lastName: 'Соколова', firstName: 'Анна', middleName: 'Игоревна', birthDate: '1989-04-18',
  phone: '+7 999 111-22-33', email: 'anna.sokolova@example.com',
}, { id: 't1', section: 'personal' });
sharedTouristFlow.click({ action: 'open-leads' });
sharedTouristFlow.click({ openLead: 'lead-1042' });
sharedTouristFlow.click({ action: 'add-from-lead' });
assert.equal(sharedTouristFlow.snapshot().tourists.find((tourist) => tourist.id === 't1').phone, '+7 999 111-22-33');
assert.equal(JSON.parse(sharedTouristFlow.storage.get('unique-guide-tourists-v3')).find((tourist) => tourist.id === 't1').phone, '+7 999 111-22-33');
assert.match(guideHome.root.innerHTML, /Задачи/);
const guideStageMarkup = (guideHome.root.innerHTML.match(/aria-label="Задачи гида"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
const guideStageLabels = [...guideStageMarkup.matchAll(/data-action="guide-stage"[^>]*>([^<]+)/g)].map((match) => match[1].trim());
assert.deepEqual(guideStageLabels, ['Встреча', 'Отель', 'Отъезд', 'Программа']);
assert.doesNotMatch(guideHome.root.innerHTML, /class="workspace-tabs"|aria-label="Разделы сводной"/, 'manager summary navigation must not leak into the first-edition guide shell');
guideHome.click({ action: 'guide-stage', stage: 'program' });
assert.equal(guideHome.snapshot().view, 'program');
assert.match(guideHome.root.innerHTML, /Программа тура/);
guideHome.click({ action: 'guide-stage', stage: 'arrival' });
assert.equal(guideHome.snapshot().view, 'operations');
assert.equal(guideHome.snapshot().stage, 'arrival');

// Morocco uses the same first-edition guide task shell with its own route and
// local mock operations. China records must never appear in this tour.
for (const role of ['viewer', 'escort']) {
  const moroccoGuide = loadPrototype('tour-operations.js', '#app', `?tourId=morocco&role=${role}`);
  assert.equal(moroccoGuide.snapshot().view, 'operations');
  assert.equal(moroccoGuide.snapshot().guideRouteCityId, 'route-casablanca-1');
  assert.match(moroccoGuide.root.innerHTML, /Марокко: города и пустыня/);
  assert.match(moroccoGuide.root.innerHTML, /Касабланка|AT 221/);
  assert.doesNotMatch(moroccoGuide.root.innerHTML, /Сводная тура ещё не подготовлена|Пекин|CZ 342/);
  moroccoGuide.click({ action: 'guide-stage', stage: 'hotel' });
  assert.equal(moroccoGuide.snapshot().stage, 'hotel');
  assert.match(moroccoGuide.root.innerHTML, /Odyssee Center Hotel/);
  moroccoGuide.click({ action: 'open-guide-city-picker' });
  assert.match(moroccoGuide.root.innerHTML, /Марракеш/);
  moroccoGuide.click({ action: 'select-guide-city', city: 'route-marrakesh-1' });
  assert.equal(moroccoGuide.snapshot().guideRouteCityId, 'route-marrakesh-1');
  assert.match(moroccoGuide.root.innerHTML, /Riad Kniza[^]*?8 туристов/);
  moroccoGuide.click({ action: 'guide-stage', stage: 'departure' });
  moroccoGuide.click({ action: 'guide-operation-status', city: 'route-marrakesh-1', stage: 'departure', operation: 'marrakesh-ouarzazate', status: 'departed' });
  assert.equal(moroccoGuide.snapshot().guideOperationalStatuses['morocco|route-marrakesh-1|departure|marrakesh-ouarzazate'], 'departed');
  assert.match(moroccoGuide.root.innerHTML, /Статус: Уехал/);
  moroccoGuide.click({ action: 'guide-stage', stage: 'program' });
  assert.equal(moroccoGuide.snapshot().view, 'program');
  assert.match(moroccoGuide.root.innerHTML, /Программа тура/);
  assert.match(moroccoGuide.root.innerHTML, /Касабланка|Уарзазат/);
}
const moroccoGuideDeepLink = loadPrototype('tour-operations.js', '#app', '?tourId=morocco&role=viewer&routeCityId=route-ouarzazate-1&operation=departure');
assert.equal(moroccoGuideDeepLink.snapshot().guideRouteCityId, 'route-ouarzazate-1');
assert.match(moroccoGuideDeepLink.root.innerHTML, /AT 412/);
assert.match(moroccoGuideDeepLink.root.innerHTML, /AT 412[^]*?4 туриста/);
const guideTourSwitch = loadPrototype('tour-operations.js', '#app', '?tourId=china&role=viewer');
guideTourSwitch.click({ action: 'open-tours' });
guideTourSwitch.click({ action: 'select-tour', id: 'morocco' });
assert.equal(guideTourSwitch.snapshot().selectedTourId, 'morocco');
assert.equal(guideTourSwitch.snapshot().view, 'operations');
assert.match(guideTourSwitch.root.innerHTML, /AT 221/);
assert.doesNotMatch(guideTourSwitch.root.innerHTML, /Сводная тура ещё не подготовлена/);
const offlineMoroccoGuide = loadPrototype('tour-operations.js', '#app', '?tourId=morocco&role=escort&offline=1');
const offlineGuideBefore = deepClone(offlineMoroccoGuide.snapshot().guideOperationalStatuses);
offlineMoroccoGuide.dispatch({ action: 'guide-operation-status', city: 'route-casablanca-1', stage: 'arrival', operation: 'at-221', status: 'arrived' });
assert.deepEqual(offlineMoroccoGuide.snapshot().guideOperationalStatuses, offlineGuideBefore);
assert.match(offlineMoroccoGuide.root.innerHTML, /Нет подключения/);

// Guide and escort keep the first-edition Tourists workspace on Morocco, scoped to the active route position.
for (const role of ['viewer', 'escort']) {
  const guideTourists = loadPrototype('tour-operations.js', '#app', `?tourId=morocco&role=${role}&view=tourists`);
  assert.equal(guideTourists.snapshot().view, 'tourists');
  assert.equal(guideTourists.snapshot().guideRouteCityId, 'route-casablanca-1');
  assert.equal(guideTourists.snapshot().guideTouristMemberIds.length, 10);
  assert.equal(guideTourists.snapshot().guideTouristVisibleIds.length, 10);
  assert.match(guideTourists.root.innerHTML, /city-picker-index">1</);
  assert.match(guideTourists.root.innerHTML, /Участники остановки/);
  ['Встреча', 'Отель', 'Отъезд'].forEach((label) => assert.match(guideTourists.root.innerHTML, new RegExp(label)));
  assert.doesNotMatch(guideTourists.root.innerHTML, /Сводная тура ещё не подготовлена|Пекин|CZ 342/);

  guideTourists.input({ touristSearch: '' }, 'Ахметова');
  assert.equal(guideTourists.snapshot().guideTouristVisibleIds.length, 2);
  assert.match(guideTourists.root.innerHTML, /Ахметова/);
  assert.doesNotMatch(guideTourists.root.innerHTML, /Захарова/);
  guideTourists.input({ touristSearch: '' }, '');
  guideTourists.click({ action: 'guide-tourist-filter', filter: 'completed' });
  assert.equal(guideTourists.snapshot().guideTouristVisibleIds.length, 0);
  assert.match(guideTourists.root.innerHTML, /Туристы не найдены/);
  guideTourists.click({ action: 'guide-tourist-filter', filter: 'attention' });
  assert.equal(guideTourists.snapshot().guideTouristVisibleIds.length, 10);
  guideTourists.click({ action: 'guide-tourist-filter', filter: 'all' });

  guideTourists.click({ action: 'open-guide-city-picker' });
  guideTourists.click({ action: 'select-guide-city', city: 'route-marrakesh-1' });
  assert.equal(guideTourists.snapshot().guideTouristMemberIds.length, 8);
  assert.match(guideTourists.root.innerHTML, /city-picker-index">2</);
  assert.match(guideTourists.root.innerHTML, /Марракеш[^]*?показано 8 из 8/);
  guideTourists.click({ action: 'open-guide-city-picker' });
  guideTourists.click({ action: 'select-guide-city', city: 'route-ouarzazate-1' });
  assert.equal(guideTourists.snapshot().guideTouristMemberIds.length, 4);
  assert.match(guideTourists.root.innerHTML, /city-picker-index">3</);
  assert.deepEqual(guideTourists.snapshot().guideTouristMemberIds, ['tourist-morocco-01', 'tourist-morocco-02', 'tourist-morocco-05', 'tourist-morocco-06']);

  guideTourists.click({ action: 'tourist-detail', id: 'tourist-morocco-01' });
  assert.match(guideTourists.root.innerHTML, /Профиль[^]*?В туре/);
  guideTourists.click({ action: 'tourist-detail-tab', tab: 'tour' });
  guideTourists.click({ action: 'toggle-profile-section', section: 'tour-context' });
  guideTourists.click({ action: 'toggle-profile-section', section: 'logistics' });
  assert.match(guideTourists.root.innerHTML, /Касабланка → Марракеш → Уарзазат/);
  assert.match(guideTourists.root.innerHTML, /AT 221[^]*?Riad Kniza[^]*?AT 412/);
  assert.match(guideTourists.root.innerHTML, /Фактические статусы[^]*?Уарзазат/);
  assert.doesNotMatch(guideTourists.root.innerHTML, /Пекин|Сиань|Шанхай|CZ 342/);
  guideTourists.click({ action: 'close-overlay' });

  guideTourists.click({ action: 'open-guide-city-picker' });
  guideTourists.click({ action: 'select-guide-city', city: 'route-marrakesh-1' });
  guideTourists.click({ action: 'nav', view: 'operations' });
  guideTourists.click({ action: 'guide-stage', stage: 'arrival' });
  guideTourists.click({ action: 'guide-operation-status', city: 'route-marrakesh-1', stage: 'arrival', operation: 'arrival-marrakesh', status: 'arrived' });
  guideTourists.click({ action: 'guide-stage', stage: 'hotel' });
  guideTourists.click({ action: 'guide-operation-status', city: 'route-marrakesh-1', stage: 'hotel', operation: 'riad-kniza', status: 'checked_in' });
  guideTourists.click({ action: 'guide-stage', stage: 'departure' });
  guideTourists.click({ action: 'guide-operation-status', city: 'route-marrakesh-1', stage: 'departure', operation: 'marrakesh-ouarzazate', status: 'departed' });
  guideTourists.click({ action: 'nav', view: 'tourists' });
  guideTourists.click({ action: 'guide-tourist-filter', filter: 'completed' });
  assert.equal(guideTourists.snapshot().guideTouristVisibleIds.length, 8);
  assert.match(guideTourists.root.innerHTML, /Завершены · 8/);
  guideTourists.click({ action: 'guide-tourist-filter', filter: 'attention' });
  assert.equal(guideTourists.snapshot().guideTouristVisibleIds.length, 0);
}

const forbiddenMoroccoStopTourist = loadPrototype('tour-operations.js', '#app', '?tourId=morocco&role=viewer&view=tourists&routeCityId=route-ouarzazate-1&tourist=tourist-morocco-03');
assert.match(forbiddenMoroccoStopTourist.root.innerHTML, /Карточка недоступна/);
assert.doesNotMatch(forbiddenMoroccoStopTourist.root.innerHTML, /Захарова Полина/);

// Finance reproduces the working application's per-lead balance and role rules.
const financeStorage = new Map();
const managerFinance = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=finance&role=manager', financeStorage);
assert.equal(managerFinance.snapshot().view, 'finance');
assert.match(managerFinance.root.innerHTML, /Финансы · остатки по оплате/);
assert.match(managerFinance.root.innerHTML, /148[\s\u00a0]*000[^<]*¥/);
assert.match(managerFinance.root.innerHTML, /Соколова Анна Игоревна[^]*?Плательщик/);
assert.equal(managerFinance.snapshot().financeRouteCityId, 'route-beijing-1');
assert.equal(managerFinance.snapshot().financeRows.reduce((sum, row) => sum + row.memberIds.length, 0), 10, 'Beijing Finance includes only its ten route participants');
selectFinanceCity(managerFinance, 'route-xian-1');
assert.equal(managerFinance.snapshot().financeRouteCityId, 'route-xian-1');
assert.equal(managerFinance.snapshot().financeRows.reduce((sum, row) => sum + row.memberIds.length, 0), 8, 'changing the active route position recalculates the China finance participant pool');
managerFinance.click(financeCollectionAction(managerFinance, 'true'));
let storedFinanceLeads = JSON.parse(financeStorage.get('unique-guide-leads-v2'));
assert.equal(storedFinanceLeads.find((item) => item.id === 'lead-1042').remainingPaymentCollected, true);
assert.match(managerFinance.root.innerHTML, /Отменить действие/);
managerFinance.click(financeCollectionAction(managerFinance, 'false'));
storedFinanceLeads = JSON.parse(financeStorage.get('unique-guide-leads-v2'));
assert.equal(storedFinanceLeads.find((item) => item.id === 'lead-1042').remainingPaymentCollected, false, 'pay/unpay updates the same lead instead of duplicating it');
assert.equal(storedFinanceLeads.filter((item) => item.id === 'lead-1042').length, 1);
const leadsAfterDirectTourWrite = loadPrototype('mobile-leads.js', '#app', '?role=admin', financeStorage);
assert.equal(leadsAfterDirectTourWrite.snapshot().leads.length, datasetAdmin.leads.length, 'a first write from Tours creates a complete lead snapshot');
assert.ok(leadsAfterDirectTourWrite.snapshot().leads.some((item) => item.id === 'lead-1048'));
assert.ok(leadsAfterDirectTourWrite.snapshot().leads.some((item) => item.id === 'lead-turkey-04'));

const offlineFinance = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=finance&role=manager&offline=1');
assert.match(offlineFinance.root.innerHTML, /Остатки доступны для чтения; отметка оплаты заблокирована/);
assert.doesNotMatch(offlineFinance.root.innerHTML, /data-action="finance-collection"/);

const guideFinance = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=finance&role=viewer');
assert.equal(guideFinance.snapshot().view, 'finance', 'guide assigned to financeGuideCityId can open Finance');
assert.match(guideFinance.root.innerHTML, /Финансы · остатки по оплате/);

const escortChinaFinance = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=finance&role=escort');
assert.equal(escortChinaFinance.snapshot().view, 'operations', 'ordinary escort is returned to first-edition Tasks');
assert.doesNotMatch(escortChinaFinance.root.innerHTML, /Финансы · остатки по оплате|148[\s\u00a0]*000/);

for (const role of ['viewer', 'escort']) {
  const moroccoFinanceStorage = new Map();
  const moroccoFinance = loadPrototype('tour-operations.js', '#app', `?tourId=morocco&view=finance&role=${role}`, moroccoFinanceStorage);
  assert.equal(moroccoFinance.snapshot().view, 'finance', `Morocco exception grants Finance to ${role}`);
  assert.match(moroccoFinance.root.innerHTML, /Финансы · остатки по оплате/);
  assert.doesNotMatch(moroccoFinance.root.innerHTML, /data-lead-id|lead-morocco-/i, `Finance DOM must not expose leadId to ${role}`);
  moroccoFinance.click(financeCollectionAction(moroccoFinance, 'true'));
  const storedMoroccoFinanceLeads = JSON.parse(moroccoFinanceStorage.get('unique-guide-leads-v2'));
  assert.equal(storedMoroccoFinanceLeads.find((item) => item.id === 'lead-morocco-01').remainingPaymentCollected, true, `${role} can still mark the current route-scoped application`);
  assert.doesNotMatch(moroccoFinance.root.innerHTML, /data-lead-id|lead-morocco-/i, `rerendered Finance DOM must keep leadId private for ${role}`);
  assert.equal(moroccoFinance.snapshot().financeRouteCityId, 'route-casablanca-1');
  selectFinanceCity(moroccoFinance, 'route-ouarzazate-1');
  assert.equal(moroccoFinance.snapshot().financeRouteCityId, 'route-ouarzazate-1');
  assert.equal(moroccoFinance.snapshot().financeRows.length, 2, `Morocco exception still scopes ${role} to the active route city`);
  assert.equal(moroccoFinance.snapshot().financeRows.reduce((sum, row) => sum + row.memberIds.length, 0), 4);
}

const staleMoroccoFinanceStorage = new Map();
const staleMoroccoFinance = loadPrototype('tour-operations.js', '#app', '?tourId=morocco&view=finance&role=viewer', staleMoroccoFinanceStorage);
const staleFinanceAction = financeCollectionAction(staleMoroccoFinance, 'true');
selectFinanceCity(staleMoroccoFinance, 'route-ouarzazate-1');
const financeRowsBeforeStaleReplay = deepClone(staleMoroccoFinance.snapshot().financeRows);
staleMoroccoFinance.dispatch(staleFinanceAction);
const staleMoroccoLeads = JSON.parse(staleMoroccoFinanceStorage.get('unique-guide-leads-v2') || '[]');
assert.ok(!staleMoroccoLeads.find((item) => item.id === 'lead-morocco-01') || staleMoroccoLeads.find((item) => item.id === 'lead-morocco-01').remainingPaymentCollected !== true, 'a stale Finance action cannot mutate a row after routeCityId changes');
assert.deepEqual(staleMoroccoFinance.snapshot().financeRows, financeRowsBeforeStaleReplay, 'stale replay cannot mutate whichever application now occupies the former visual position');
assert.match(staleMoroccoFinance.root.innerHTML, /Заявка не относится к выбранной позиции маршрута/);

const moroccoFinanceByCity = loadPrototype('tour-operations.js', '#app', '?tourId=morocco&view=finance&role=manager');
assert.equal(moroccoFinanceByCity.snapshot().financeRows.length, 5);
assert.equal(moroccoFinanceByCity.snapshot().financeRows.reduce((sum, row) => sum + row.memberIds.length, 0), 10);
assert.match(moroccoFinanceByCity.root.innerHTML, /120[\s\u00a0]*000[^<]*₽/);
assert.match(moroccoFinanceByCity.root.innerHTML, /227[\s\u00a0]*000[^<]*¥/);
moroccoFinanceByCity.click({ action: 'open-finance-city-picker' });
['Касабланка', 'Марракеш', 'Уарзазат', '10 туристов · 5 заявок', '8 туристов · 4 заявки', '4 туриста · 2 заявки'].forEach((label) => {
  assert.match(moroccoFinanceByCity.root.innerHTML, new RegExp(label));
});
moroccoFinanceByCity.click({ action: 'select-finance-city', routeCityId: 'route-marrakesh-1' });
assert.equal(moroccoFinanceByCity.snapshot().financeRows.length, 4);
assert.equal(moroccoFinanceByCity.snapshot().financeRows.reduce((sum, row) => sum + row.memberIds.length, 0), 8);
assert.match(moroccoFinanceByCity.root.innerHTML, /120[\s\u00a0]*000[^<]*₽/);
assert.match(moroccoFinanceByCity.root.innerHTML, /100[\s\u00a0]*500[^<]*¥/);
assert.doesNotMatch(moroccoFinanceByCity.root.innerHTML, /Власова/);
selectFinanceCity(moroccoFinanceByCity, 'route-ouarzazate-1');
assert.equal(moroccoFinanceByCity.snapshot().financeRows.length, 2);
assert.equal(moroccoFinanceByCity.snapshot().financeRows.reduce((sum, row) => sum + row.memberIds.length, 0), 4);
assert.match(moroccoFinanceByCity.root.innerHTML, /100[\s\u00a0]*500[^<]*¥/);
assert.doesNotMatch(moroccoFinanceByCity.root.innerHTML, /120[\s\u00a0]*000[^<]*₽|Захарова|Осипова|Власова/);

const japanFinanceByCity = loadPrototype('tour-operations.js', '#app', '?tourId=japan&view=finance&role=manager&routeCityId=route-kyoto-1');
assert.equal(japanFinanceByCity.snapshot().financeRouteCityId, 'route-kyoto-1', 'non-China Finance honors a stable routeCityId deep link');
assert.match(japanFinanceByCity.root.innerHTML, /Киото/);
selectFinanceCity(japanFinanceByCity, 'route-osaka-1');
assert.equal(japanFinanceByCity.snapshot().financeRouteCityId, 'route-osaka-1');
assert.equal(japanFinanceByCity.snapshot().financeRows.reduce((sum, row) => sum + row.memberIds.length, 0), 10);

const viewerJapanFinance = loadPrototype('tour-operations.js', '#app', '?tourId=japan&view=finance&role=viewer');
assert.notEqual(viewerJapanFinance.snapshot().view, 'finance');
assert.doesNotMatch(viewerJapanFinance.root.innerHTML, /Финансы · остатки по оплате/);

const managerDebtFilter = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&role=manager');
managerDebtFilter.click({ action: 'tourist-filters' });
assert.match(managerDebtFilter.root.innerHTML, /С долгом/);
managerDebtFilter.click({ action: 'toggle-tourist-filter', filter: 'debt' });
assert.equal(managerDebtFilter.snapshot().touristFilters.debt, true);
selectRole(managerDebtFilter, 'escort');
assert.equal(managerDebtFilter.snapshot().touristFilters.debt, false, 'losing Finance access clears the debt filter');
managerDebtFilter.click({ action: 'tourist-filters' });
assert.doesNotMatch(managerDebtFilter.root.innerHTML, /С долгом/);

const viewerDisallowedCity = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&routeCityId=route-shanghai-1&role=viewer');
assert.equal(viewerDisallowedCity.snapshot().routeCityId, 'route-beijing-1', 'a forbidden city deep link is normalized before render');
viewerDisallowedCity.click({ action: 'open-city-picker' });
assert.match(viewerDisallowedCity.root.innerHTML, /Пекин · остановка 1/);
assert.match(viewerDisallowedCity.root.innerHTML, /Сиань/);
assert.doesNotMatch(viewerDisallowedCity.root.innerHTML, /Шанхай|Пекин · остановка 2|route-shanghai-1|route-beijing-2/);

const viewerTeam = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=team&role=viewer');
assert.match(viewerTeam.root.innerHTML, /Гиды по городам/);
assert.match(viewerTeam.root.innerHTML, /Пекин · остановка 1/);
assert.match(viewerTeam.root.innerHTML, /Сиань/);
assert.match(viewerTeam.root.innerHTML, /Ли Вэй|Анна Ким/);
assert.doesNotMatch(viewerTeam.root.innerHTML, /Шанхай|Пекин · остановка 2|Сопровождающий|Администраторы чата|Мария Белова|Елена Воронова|Игорь Лебедев/);

const unknownTourRole = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=overview&role=superadmin');
assert.ok(!['admin', 'manager'].includes(unknownTourRole.snapshot().role));
assert.match(unknownTourRole.root.innerHTML, /Тур не назначен текущей роли|Нет доступа к туру/);
assert.doesNotMatch(unknownTourRole.root.innerHTML, /Соколова|anna\.sokolova@example\.com|\+7 916|lead-1042|deal-501|189[\s\u00a0]*000/);
const unknownTourRecordsBefore = deepClone(unknownTourRole.snapshot().records);
unknownTourRole.dispatch({ action: 'add-stage' });
assert.deepEqual(unknownTourRole.snapshot().records, unknownTourRecordsBefore);

const summary = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
['Прибытие', 'Отель', 'Отъезд'].forEach((label) => assert.match(summary.root.innerHTML, new RegExp(label)));
assertExactlyOneRepresentativePerGroup(summary.snapshot(), 'initial tour groups');
const summaryTabsMarkup = (summary.root.innerHTML.match(/<div class="summary-tabs"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
const summaryTabs = [...summaryTabsMarkup.matchAll(/data-action="summary-section" data-view="([^"]+)"[^>]*>([^<]+)/g)]
  .map((match) => [match[1], match[2].trim()]);
assert.deepEqual(summaryTabs, [['operations', 'Операции'], ['tourists', 'Туристы'], ['documents', 'Документы'], ['work', 'Статусы']]);
for (const [summarySection, expectedView, heading] of [
  ['operations', 'operations', 'Прибытие'],
  ['tourists', 'tourists', 'Участники тура'],
  ['documents', 'documents', 'Документы туристов'],
  ['statuses', 'work', 'Статусы на маршруте'],
]) {
  const deepLinkedSummary = loadPrototype('tour-operations.js', '#app', `?tourId=china&tourSection=summary&summarySection=${summarySection}`);
  assert.equal(deepLinkedSummary.snapshot().view, expectedView);
  assert.match(deepLinkedSummary.root.innerHTML, new RegExp(heading));
}
const legacyStatusesDeepLink = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=statuses&routeCityId=route-xian-1&role=manager');
assert.equal(legacyStatusesDeepLink.snapshot().view, 'work');
assert.equal(legacyStatusesDeepLink.snapshot().routeCityId, 'route-xian-1');
assert.match(legacyStatusesDeepLink.root.innerHTML, /Статусы на маршруте/);
assert.match(legacyStatusesDeepLink.root.innerHTML, /data-action="summary-section" data-view="work"[^>]*>Статусы<\/button>/);
summary.click({ action: 'open-city-picker' });
['Пекин · остановка 1', 'Сиань', 'Шанхай', 'Пекин · остановка 2'].forEach((city) => assert.match(summary.root.innerHTML, new RegExp(city)));
summary.click({ action: 'close-overlay' });
['route-beijing-1', 'route-xian-1', 'route-shanghai-1', 'route-beijing-2'].forEach((routeCityId, index) => {
  summary.click({ action: 'open-city-picker' });
  summary.click({ action: 'select-city', index: String(index) });
  assert.equal(summary.snapshot().routeCityId, routeCityId);
});

// Tourist Profile has five web-parity blocks; tour membership and logistics live in a separate context.
const profile = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=t1&touristSection=profile');
assert.match(profile.root.innerHTML, /Профиль/);
assert.match(profile.root.innerHTML, /В туре/);
const profileSections = [...profile.root.innerHTML.matchAll(/class="profile-section-head"[^>]*data-section="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(profileSections, ['personal', 'citizenship', 'domestic', 'foreign', 'settings']);
['Личные данные', 'Гражданство', 'Паспорт РФ', 'Загранпаспорт', 'Тип и настройки'].forEach((label) => assert.match(profile.root.innerHTML, new RegExp(label)));
assert.doesNotMatch(profile.root.innerHTML, /Маршрут и логистика/);

const tourContext = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=t1&touristSection=tour');
assert.match(tourContext.root.innerHTML, /В туре/);
tourContext.click({ action: 'toggle-profile-section', section: 'tour-context' });
assertMarkupOrder(tourContext.root.innerHTML, [
  'Комментарий для гида',
  'Исходный лид',
  'Статус лида',
  'Выбранный тур',
  'Статус участия',
  'Группа туристов',
  'Представитель группы',
  'Основной турист заявки',
  'Ограниченный маршрут',
  'Прибытие',
  'Заселение',
  'Отъезд',
  'Маршрут и логистика',
], 'Tourist tour-context canonical order');
assert.match(tourContext.root.innerHTML, /Гранд-тур по Китаю/);
assert.match(tourContext.root.innerHTML, /Лид Соколовы/);

// Viewer gets the closed privacy allowlist and cannot forge a transition to the source Lead.
const viewerTourists = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&summarySection=tourists&role=viewer');
assert.match(viewerTourists.root.innerHTML, /Соколова Анна Игоревна/);
assert.doesNotMatch(viewerTourists.root.innerHTML, /Лид Соколовы|lead-1042|deal-501|anna\.sokolova@example\.com|45 18 456789|Вегетарианское меню/);
const viewerProfile = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=t1&touristSection=profile&role=viewer');
assert.equal(viewerProfile.snapshot().role, 'viewer');
viewerProfile.click({ action: 'toggle-profile-section', section: 'personal' });
assert.match(viewerProfile.root.innerHTML, /Имя для отображения/);
assert.match(viewerProfile.root.innerHTML, /18\.04\.1989|1989-04-18/);
assert.match(viewerProfile.root.innerHTML, /\+7 916 555-12-34/);
assert.doesNotMatch(viewerProfile.root.innerHTML, /<span>(?:Фамилия|Имя|Отчество|Email)<\/span>|anna\.sokolova@example\.com/);
assert.doesNotMatch(viewerProfile.root.innerHTML, /Паспорт РФ|45 18 456789|ГУ МВД|Тверская, 12/);
viewerProfile.click({ action: 'toggle-profile-section', section: 'foreign' });
assert.match(viewerProfile.root.innerHTML, /ANNA SOKOLOVA/);
assert.match(viewerProfile.root.innerHTML, /72 3456789/);
assert.match(viewerProfile.root.innerHTML, /2031-05-21/);
viewerProfile.click({ action: 'tourist-detail-tab', tab: 'tour' });
viewerProfile.click({ action: 'toggle-profile-section', section: 'tour-context' });
assert.match(viewerProfile.root.innerHTML, /Встречать у выхода B/);
assertMarkupOrder(viewerProfile.root.innerHTML, [
  'Комментарий для гида',
  'Выбранный тур',
  'Статус участия',
  'Группа туристов',
  'Ограниченный маршрут',
  'Прибытие',
  'Заселение',
  'Отъезд',
  'Маршрут и логистика',
], 'Viewer tour-context allowlist order');
assert.doesNotMatch(viewerProfile.root.innerHTML, /Представитель группы|Основной турист заявки/);
assert.doesNotMatch(viewerProfile.root.innerHTML, /Шанхай|route-shanghai-1/, 'viewer logistics is limited to assigned route positions');
assert.doesNotMatch(viewerProfile.root.innerHTML, /Исходный лид|ID лида|ID сделки|lead-1042|deal-501|data-action="open-source-lead"/);
const viewerHrefBeforeForgery = viewerProfile.window.location.href;
viewerProfile.dispatch({ action: 'open-source-lead', id: 'lead-1042' });
assert.equal(viewerProfile.window.location.href, viewerHrefBeforeForgery);

// Viewer and escort use the generic local message action; the CRM channel preference is never disclosed.
[
  { role: 'viewer', touristId: 't1', preferredChannel: 'WhatsApp' },
  { role: 'escort', touristId: 't2', preferredChannel: 'Telegram' },
].forEach(({ role, touristId, preferredChannel }) => {
  const readonlyMessaging = loadPrototype('tour-operations.js', '#app', `?tourId=china&tourSection=summary&summarySection=tourists&role=${role}`);
  readonlyMessaging.click({ action: 'message-tourist', id: touristId });
  assert.match(readonlyMessaging.root.innerHTML, /Чат: \+7/);
  assert.doesNotMatch(readonlyMessaging.root.innerHTML, new RegExp(preferredChannel, 'i'));
});

// A manager assigned to the tour still sees an unassigned tourist operationally, without Lead PII or documents.
const managerPrivacyStorage = new Map();
loadPrototype('mobile-leads.js', '#app', '?role=admin', managerPrivacyStorage);
const privacyTourists = JSON.parse(managerPrivacyStorage.get('unique-guide-tourists-v3'));
const privacyTourist = privacyTourists.find((tourist) => tourist.id === 'lead-tourist-1051');
Object.assign(privacyTourist, {
  lead: 'Лид Секретный-1051',
  phone: '+7 999 111-22-33',
  email: 'restricted-denis@example.test',
  domesticPassport: 'PRIVATE-RF-987654',
  domesticIssuedBy: 'PRIVATE AUTHORITY',
  registrationAddress: 'PRIVATE ADDRESS',
  latinName: 'DENIS PRIVATE VOLKOV',
  passport: 'PRIVATE-FOREIGN-7654321',
  scans: [{ id: 'private-scan', name: 'private-passport-scan.pdf' }],
});
managerPrivacyStorage.set('unique-guide-tourists-v3', JSON.stringify(privacyTourists));
const managerPrivacy = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&summarySection=tourists&role=manager', managerPrivacyStorage);
const privateTokens = /Лид Секретный-1051|lead-1051|\+7 999 111-22-33|restricted-denis@example\.test|PRIVATE-RF-987654|PRIVATE AUTHORITY|PRIVATE ADDRESS|DENIS PRIVATE VOLKOV|PRIVATE-FOREIGN-7654321|private-passport-scan\.pdf/;
assert.match(managerPrivacy.root.innerHTML, /Волков Денис Олегович/);
assert.doesNotMatch(managerPrivacy.root.innerHTML, privateTokens);
const managerTouristCard = managerPrivacy.root.innerHTML.split('<article class="tourist-card">').slice(1).find((card) => card.includes('Волков Денис Олегович'));
assert.ok(managerTouristCard, 'the unassigned tourist must have an operational card');
assert.doesNotMatch(managerTouristCard.split('</article>')[0], /data-action="(?:call-tourist|message-tourist)"|Основной в заявке/);
managerPrivacy.click({ action: 'tourist-detail', id: 'lead-tourist-1051' });
assert.match(managerPrivacy.root.innerHTML, /Профиль недоступен/);
assert.match(managerPrivacy.root.innerHTML, /Вкладка «В туре» сохраняет доступ к операционным данным/);
assert.doesNotMatch(managerPrivacy.root.innerHTML, privateTokens);
managerPrivacy.click({ action: 'tourist-detail-tab', tab: 'tour' });
managerPrivacy.click({ action: 'toggle-profile-section', section: 'tour-context' });
assert.match(managerPrivacy.root.innerHTML, /Статус участия|Маршрут и логистика/);
assert.doesNotMatch(managerPrivacy.root.innerHTML, privateTokens);
assert.doesNotMatch(managerPrivacy.root.innerHTML, /Исходный лид|Представитель группы|Основной турист заявки|data-action="open-source-lead"/);
managerPrivacy.dispatch({ action: 'call-tourist', id: 'lead-tourist-1051' });
assert.match(managerPrivacy.root.innerHTML, /Контакт туриста недоступен для этой роли/);
assert.doesNotMatch(managerPrivacy.root.innerHTML, privateTokens);
managerPrivacy.dispatch({ action: 'open-tourist-documents', id: 'lead-tourist-1051' });
assert.match(managerPrivacy.root.innerHTML, /Документы туриста недоступны для этой роли/);
assert.doesNotMatch(managerPrivacy.root.innerHTML, privateTokens);
managerPrivacy.click({ action: 'close-overlay' });
managerPrivacy.click({ action: 'summary-section', view: 'documents' });
assert.doesNotMatch(managerPrivacy.root.innerHTML, /Волков Денис Олегович/);
assert.doesNotMatch(managerPrivacy.root.innerHTML, privateTokens);
managerPrivacy.click({ action: 'summary-section', view: 'tourists' });
managerPrivacy.click({ action: 'toggle-scope' });
assert.doesNotMatch(managerPrivacy.root.innerHTML, /Лид Секретный-1051|data-action="select-scope" data-id="lead-1051"/);
managerPrivacy.click({ action: 'close-overlay' });
['+7 999 111-22-33', 'restricted-denis@example.test', 'PRIVATE-FOREIGN-7654321', 'Лид Секретный-1051'].forEach((query) => {
  managerPrivacy.input({ touristSearch: '' }, query);
  assert.match(managerPrivacy.root.innerHTML, /Ничего не найдено/);
  assert.doesNotMatch(managerPrivacy.root.innerHTML, /Волков Денис Олегович/);
});
managerPrivacy.input({ touristSearch: '' }, 'Волков Денис');
assert.match(managerPrivacy.root.innerHTML, /Волков Денис Олегович/);

// returnLead and sensitive search state cannot survive a forged deep link or a role downgrade.
const forgedViewerReturn = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=t1&role=viewer&returnLead=lead-1042&returnTab=chat&query=Лид%20Соколовы');
forgedViewerReturn.click({ action: 'close-overlay' });
assert.equal(forgedViewerReturn.window.location.href, '');
assert.doesNotMatch(forgedViewerReturn.root.innerHTML, /Лид Соколовы|lead-1042/);

const downgradedManager = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=lead-tourist-1051&role=admin&returnLead=lead-1051&returnTab=documents&query=restricted-denis%40example.test', managerPrivacyStorage);
downgradedManager.dispatch({ action: 'select-role', role: 'manager' });
assert.equal(downgradedManager.snapshot().role, 'manager');
assert.equal(downgradedManager.snapshot().touristQuery, '');
assert.equal(downgradedManager.snapshot().scopeLead, null);
assert.doesNotMatch(downgradedManager.root.innerHTML, privateTokens);
downgradedManager.dispatch({ action: 'open-leads' });
const downgradedLeadHref = new URL(downgradedManager.window.location.href, 'https://prototype.test/');
assert.equal(downgradedLeadHref.searchParams.get('lead'), null);
assert.equal(downgradedLeadHref.searchParams.get('tab'), null);

// Only name and surname are mandatory. Passport and birth-date fields remain nullable.
profile.click({ action: 'toggle-profile-section', section: 'personal' });
profile.click({ action: 'edit-profile-section', id: 't1', section: 'personal' });
const requiredNames = [...profile.root.innerHTML.matchAll(/<[^>]+name="([^"]+)"[^>]*\srequired(?:\s|>)/g)].map((match) => match[1]).sort();
assert.deepEqual(requiredNames, ['firstName', 'lastName']);
const nullableProfile = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=t1&touristSection=profile');
nullableProfile.click({ action: 'toggle-profile-section', section: 'foreign' });
nullableProfile.click({ action: 'edit-profile-section', id: 't1', section: 'foreign' });
nullableProfile.submit('profile-section-form', { latinName: '', passport: '', passportExpiry: '' }, { id: 't1', section: 'foreign' });
assert.doesNotMatch(nullableProfile.root.innerHTML, /Заполните обязательные данные загранпаспорта|aria-invalid="true"/);

// READY-01..03 are indicators, not save blockers, and follow the web primary/non-primary distinction exactly.
const readinessBaseline = deepClone(profile.snapshot().tourists);
function readinessStorage(mutate) {
  const stored = deepClone(readinessBaseline);
  mutate(stored);
  return new Map([['unique-guide-tourists-v3', JSON.stringify(stored)]]);
}

const missingPrimaryPersonal = loadPrototype(
  'tour-operations.js',
  '#app',
  '?tourId=china&view=tourists&tourist=t1&touristSection=profile',
  readinessStorage((items) => Object.assign(items.find((item) => item.id === 't1'), { birthDate: '', middleName: '', email: '', phone: '' })),
);
assert.match(missingPrimaryPersonal.root.innerHTML, /Не заполнено[^<]*(?:дата рождения|Дата рождения)/i);
['отчество', 'email', 'телефон'].forEach((fieldLabel) => assert.match(missingPrimaryPersonal.root.innerHTML, new RegExp(fieldLabel, 'i')));

const nonPrimaryPersonal = loadPrototype('tour-operations.js', '#app', '?tourId=china&view=tourists&tourist=t4&touristSection=profile');
assert.match(nonPrimaryPersonal.root.innerHTML, /Личные данные заполнены|Данные готовы/);

const missingPrimaryDomestic = loadPrototype(
  'tour-operations.js',
  '#app',
  '?tourId=china&view=tourists&tourist=t1&touristSection=profile',
  readinessStorage((items) => Object.assign(items.find((item) => item.id === 't1'), { domesticPassport: '', domesticIssuedBy: '', registrationAddress: '' })),
);
assert.match(missingPrimaryDomestic.root.innerHTML, /Паспорт РФ не заполнен|Нужно дозаполнить/);
assert.doesNotMatch(missingPrimaryDomestic.root.innerHTML, /Паспорт РФ[^<]*Не требуется/);
assert.match(nonPrimaryPersonal.root.innerHTML, /Не требуется/, 'an empty domestic passport is not required for a non-primary tourist');

const missingForeignScan = loadPrototype(
  'tour-operations.js',
  '#app',
  '?tourId=china&view=tourists&tourist=t1&touristSection=profile',
  readinessStorage((items) => { items.find((item) => item.id === 't1').scans = []; }),
);
assert.match(missingForeignScan.root.innerHTML, /(?:Не заполнено|Нужно дозаполнить)[^<]*скан/i);
assert.doesNotMatch(missingForeignScan.root.innerHTML, /<span class="profile-section-summary">Готово<\/span>[\s\S]*data-section="foreign"/);
assert.match(nonPrimaryPersonal.root.innerHTML, /Загранпаспорт[^]*?(?:Не заполнено|Нужно дозаполнить)/i, 'an empty foreign passport is never ready');
assert.match(nonPrimaryPersonal.root.innerHTML, /Нужно дозаполнить[\s\S]*?(?:ФИО латиницей|номер загранпаспорта|скан)/i);

// TaskWidget uses the web lifecycle only: todo, in_progress and done.
lead.click({ detailTab: 'tasks' });
['К выполнению', 'В работе'].forEach((status) => assert.match(lead.root.innerHTML, new RegExp(status)));
lead.click({ action: 'edit-task', index: '0' });
assert.match(lead.root.innerHTML, /<option value="todo"[^>]*>К выполнению<\/option>/);
assert.match(lead.root.innerHTML, /<option value="in_progress"[^>]*>В работе<\/option>/);
assert.match(lead.root.innerHTML, /<option value="done"[^>]*>Готово<\/option>/);
lead.click({ action: 'cancel-task' });
assert.doesNotMatch(lead.root.innerHTML, /cancelled|Отменена/);
const taskStatuses = lead.snapshot().leads.flatMap((item) => item.tasks || []).map((task) => task.status);
assert.ok(taskStatuses.length > 0);
assert.ok(taskStatuses.every((status) => ['todo', 'in_progress', 'done'].includes(status)));

// Lead create/edit keeps web fields and creates exactly one primary tourist from the contact.
const leadCrudStorage = new Map();
const createLead = loadPrototype('mobile-leads.js', '#app', '?newLead=1&role=admin', leadCrudStorage);
assert.match(createLead.root.innerHTML, /Создать новый лид/);
['ЛИЧНЫЕ ДАННЫЕ', 'ДАТА РОЖДЕНИЯ', 'ПАСПОРТ РФ', 'ЗАГРАНПАСПОРТ', 'ТУР И ОПЛАТА', 'НАСТРОЙКИ', 'ПРИМЕЧАНИЕ'].forEach((section) => assert.match(createLead.root.innerHTML, new RegExp(section)));
createLead.submit('lead-form', leadFormValues(), { editing: '' });
const createdLead = createLead.snapshot().leads.find((item) => item.email === 'ivan-prototype@example.test');
assert.ok(createdLead);
const createdPrimary = createLead.snapshot().tourists.find((tourist) => tourist.leadId === createdLead.id && tourist.isPrimary);
assert.ok(createdPrimary);
assert.equal(createLead.snapshot().tourists.filter((tourist) => tourist.leadId === createdLead.id).length, 1);
assert.equal(createdPrimary.birthDate, '1990-04-12');
assert.equal(createdPrimary.domesticPassport, '45 12 987654');
assert.equal(createdPrimary.passport, '75 7654321');

// EventCard and the Tours list derive participant counts from the same live tourist store.
const dynamicTourCount = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=overview&role=manager', leadCrudStorage);
const dynamicChinaCount = dynamicTourCount.snapshot().tourists.filter((tourist) => tourist.tourId === 'china').length;
assert.equal(dynamicChinaCount, 11);
assert.match(dynamicTourCount.root.innerHTML, new RegExp(`${dynamicChinaCount} из 12 участников`));
assert.match(dynamicTourCount.root.innerHTML, new RegExp(`<span>Свободно<\\/span><strong>${12 - dynamicChinaCount}<\\/strong>`));
dynamicTourCount.click({ action: 'open-tours' });
assert.match(dynamicTourCount.root.innerHTML, new RegExp(`${dynamicChinaCount} из 12 участников`));
assert.doesNotMatch(dynamicTourCount.root.innerHTML, /4 из 12 участников/);

// Team assignments are a projection of the same stable user IDs used by EditEventDialog.
const tourAssignmentForm = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=overview&role=manager');
assert.match(tourAssignmentForm.root.innerHTML, /target="_blank"[^>]*aria-label="Открыть сводную в новой вкладке"/);
assert.match(tourAssignmentForm.root.innerHTML, /<button[^>]*data-action="preview-tour-site"[^>]*>[^]*Открыть на сайте<\/button>/);
assert.doesNotMatch(tourAssignmentForm.root.innerHTML, /<a[^>]*href="https?:\/\/[^>]*>[^]*Открыть на сайте<\/a>/i);
const tourSiteHrefBefore = tourAssignmentForm.window.location.href;
tourAssignmentForm.click({ action: 'preview-tour-site' });
assert.equal(tourAssignmentForm.window.location.href, tourSiteHrefBefore);
assert.match(tourAssignmentForm.root.innerHTML, /В рабочей версии откроется сайт тура/);
tourAssignmentForm.click({ action: 'edit-tour' });
assert.match(tourAssignmentForm.root.innerHTML, /data-route-guide-id="route-beijing-1"/);
assert.match(tourAssignmentForm.root.innerHTML, /value="user-guide-li-wei"[^>]*selected/);
assert.match(tourAssignmentForm.root.innerHTML, /name="financeGuideCityId" value="route-xian-1"[^>]*checked/);
assert.match(tourAssignmentForm.root.innerHTML, /data-user-search="escort-user"/);
assert.match(tourAssignmentForm.root.innerHTML, /id="escort-user" name="escort"/);
assert.match(tourAssignmentForm.root.innerHTML, /value="user-escort-maria-belova"[^>]*selected/);
assert.match(tourAssignmentForm.root.innerHTML, /<select[^>]*name="chatAdmin"[^>]*>[\s\S]*?<option value="user-manager-elena"[^>]*selected/);

// Blank route rows are discarded as complete entries, without shifting later routeCityId/guide pairs.
const routePreservation = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=overview&role=manager');
routePreservation.click({ action: 'edit-tour' });
routePreservation.submit('tour-form', {
  name: 'Гранд-тур по Китаю',
  description: 'Маршрут после удаления пустой строки',
  site: 'https://unique-travel.ru/china-grand',
  country: 'Китай',
  tourType: 'group',
  routeCityId: ['route-beijing-1', 'route-xian-1', 'route-shanghai-1', 'route-beijing-2'],
  routeCityName: ['Пекин', '', 'Шанхай', 'Пекин'],
  cityGuide: ['user-guide-li-wei', 'user-guide-anna-kim', 'user-guide-li-wei', 'user-guide-anna-kim'],
  financeGuideCityId: 'route-shanghai-1',
  escort: 'user-escort-maria-belova',
  chatAdmin: ['user-manager-elena', 'user-manager-igor'],
  startDate: '2026-09-14', endDate: '2026-09-25',
  capacity: '12', price: '189000', priceCurrency: 'RUB', color: '#2f6bd8',
}, { id: 'china' });
const preservedRouteTour = routePreservation.snapshot().tours.find((tour) => tour.id === 'china');
assert.deepEqual(preservedRouteTour.cities, ['Пекин', 'Шанхай', 'Пекин']);
assert.equal(preservedRouteTour.cityGuides['route-beijing-1'], 'user-guide-li-wei');
assert.equal(preservedRouteTour.cityGuides['route-shanghai-1'], 'user-guide-li-wei');
assert.equal(preservedRouteTour.cityGuides['route-beijing-2'], 'user-guide-anna-kim');
assert.equal(preservedRouteTour.cityGuides['route-xian-1'], undefined);
assert.equal(preservedRouteTour.financeGuideCityId, 'route-shanghai-1');
routePreservation.click({ action: 'edit-tour', id: 'china' });
assert.match(routePreservation.root.innerHTML, /name="routeCityId" value="route-shanghai-1"/);
assert.match(routePreservation.root.innerHTML, /name="routeCityId" value="route-beijing-2"/);
assert.match(routePreservation.root.innerHTML, /data-route-guide-id="route-shanghai-1"[\s\S]*?<option value="user-guide-li-wei"[^>]*selected/);
assert.match(routePreservation.root.innerHTML, /data-route-guide-id="route-beijing-2"[\s\S]*?<option value="user-guide-anna-kim"[^>]*selected/);

const editLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&edit=1&role=admin', leadCrudStorage);
assert.match(editLead.root.innerHTML, /Редактировать лид/);
editLead.submit('lead-form', leadFormValues({ firstName: 'Анна', lastName: 'Соколова-Тест', middleName: 'Игоревна', phone: '+7 916 441-22-18', telegram: '@anna_sokolova', email: 'anna@example.ru', status: 'converted', note: 'Обновлено в smoke' }), { editing: 'lead-1042' });
assert.equal(editLead.snapshot().leads.find((item) => item.id === 'lead-1042').lastName, 'Соколова-Тест');
assert.equal(editLead.snapshot().tourists.find((tourist) => tourist.id === 't1').lastName, 'Соколова-Тест');

// Loss/postponement is a deliberate second step after editing status.
const outcomeLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&edit=1&role=admin', leadCrudStorage);
outcomeLead.submit('lead-form', leadFormValues({ firstName: 'Анна', lastName: 'Соколова-Тест', middleName: 'Игоревна', phone: '+7 916 441-22-18', email: 'anna@example.ru', status: 'lost' }), { editing: 'lead-1042' });
assert.match(outcomeLead.root.innerHTML, /Отложить\/потерять/);
assert.match(outcomeLead.root.innerHTML, /name="outcome" value="postponed"/);
assert.match(outcomeLead.root.innerHTML, /name="outcome" value="failed"/);
['outcomeDate', 'postponeReason', 'failureReason'].forEach((name) => assert.match(outcomeLead.root.innerHTML, new RegExp(`name="${name}"`)));
outcomeLead.submit('lost-form', { outcome: 'postponed', outcomeDate: '2027-02-01', postponeReason: 'thinking', failureReason: '' });
const postponedLead = outcomeLead.snapshot().leads.find((item) => item.id === 'lead-1042');
assert.equal(postponedLead.stage, 'lost');
assert.equal(postponedLead.outcome, 'postponed');
assert.equal(postponedLead.outcomeDate, '2027-02-01');

// All seven Wazzup states are reachable by deep link without a network request.
const wazzupStates = {
  'settings-loading': 'Проверяем настройки Wazzup24',
  'not-configured': 'Wazzup24 не настроен',
  'no-contact': 'Контактные данные не указаны',
  loading: 'Загрузка чата',
  error: 'Ошибка загрузки чата',
  'not-loaded': 'Чат не загружен',
  loaded: 'Чат',
};
Object.entries(wazzupStates).forEach(([state, copy]) => {
  const wazzup = loadPrototype('mobile-leads.js', '#app', `?lead=lead-1042&tab=chat&wazzup=${state}`);
  assert.match(wazzup.root.innerHTML, new RegExp(copy));
});

const leadDocuments = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&tab=documents');
assert.match(leadDocuments.root.innerHTML, /Договор/);
assert.match(leadDocuments.root.innerHTML, /Лист бронирования/);
leadDocuments.click({ action: 'download-doc', doc: 'contract' });
assert.match(leadDocuments.root.innerHTML, /Документ подготовлен к скачиванию/);

// Task create and edit use the same model as TaskWidget, including an explicit urgent priority.
const leadTasks = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042&tab=tasks');
const taskCountBeforeCreate = leadTasks.snapshot().leads.find((item) => item.id === 'lead-1042').tasks.length;
leadTasks.click({ action: 'add-task' });
leadTasks.submit('task-form', { title: 'Срочная проверка', description: 'Проверить документы', priority: 'urgent', dueDate: '2026-08-05' }, { index: '' });
let savedTasks = leadTasks.snapshot().leads.find((item) => item.id === 'lead-1042').tasks;
assert.equal(savedTasks.length, taskCountBeforeCreate + 1);
assert.equal(savedTasks.at(-1).status, 'todo');
assert.equal(savedTasks.at(-1).priority, 'urgent');
leadTasks.click({ action: 'edit-task', index: String(savedTasks.length - 1) });
leadTasks.submit('task-form', { title: 'Срочная проверка', description: 'Выполнено', priority: 'urgent', status: 'done', dueDate: '2026-08-05' }, { index: String(savedTasks.length - 1) });
savedTasks = leadTasks.snapshot().leads.find((item) => item.id === 'lead-1042').tasks;
assert.equal(savedTasks.at(-1).status, 'done');

leadTasks.click({ action: 'add-task' });
leadTasks.submit('task-form', { title: 'Просроченная проверка', description: 'Проверить маркировку', priority: 'high', dueDate: '2020-01-02' }, { index: '' });
savedTasks = leadTasks.snapshot().leads.find((item) => item.id === 'lead-1042').tasks;
const overdueIndex = savedTasks.length - 1;
assert.match(leadTasks.root.innerHTML, /task-card[^>]*overdue/);
assert.match(leadTasks.root.innerHTML, /Просрочено · (?:2020-01-02|02\.01\.2020)/);
leadTasks.click({ action: 'edit-task', index: String(overdueIndex) });
leadTasks.click({ action: 'request-delete-task', index: String(overdueIndex) });
assert.match(leadTasks.root.innerHTML, /Удалить задачу/);
assert.match(leadTasks.root.innerHTML, /data-action="confirm-delete-task"/);
assert.equal(leadTasks.snapshot().leads.find((item) => item.id === 'lead-1042').tasks.length, savedTasks.length);
leadTasks.click({ action: 'cancel-delete-task' });
assert.equal(leadTasks.snapshot().leads.find((item) => item.id === 'lead-1042').tasks.length, savedTasks.length);
leadTasks.click({ action: 'request-delete-task', index: String(overdueIndex) });
leadTasks.click({ action: 'confirm-delete-task', index: String(overdueIndex) });
assert.equal(leadTasks.snapshot().leads.find((item) => item.id === 'lead-1042').tasks.length, savedTasks.length - 1);

const tourTasks = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=tasks');
tourTasks.click({ action: 'edit-tour-task', id: 'task1' });
assert.match(tourTasks.root.innerHTML, /<option value="todo"[^>]*>К выполнению<\/option>/);
assert.match(tourTasks.root.innerHTML, /<option value="in_progress"[^>]*>В работе<\/option>/);
assert.match(tourTasks.root.innerHTML, /<option value="done"[^>]*>Готово<\/option>/);
tourTasks.click({ action: 'close-overlay' });
assert.doesNotMatch(tourTasks.root.innerHTML, /cancelled|Отменена/);

// Program keeps the web shape and regenerates from tour dates without silently discarding a meaningful description.
const program = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=program&role=manager');
const initialProgram = program.snapshot().programDays;
assert.ok(initialProgram.length > 0);
initialProgram.forEach((day, index) => {
  assert.deepEqual(Object.keys(day), ['dayNumber', 'date', 'city', 'cityIdx', 'description']);
  assert.equal(day.dayNumber, index + 1);
  assert.match(day.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(typeof day.cityIdx, 'number');
});
assert.doesNotMatch(program.root.innerHTML, /data-action="(?:add-program|remove-program)"|name="title"/);
program.click({ action: 'edit-program', index: '0' });
assert.match(program.root.innerHTML, /Номер дня/);
assert.match(program.root.innerHTML, /Дата/);
assert.match(program.root.innerHTML, /name="cityIdx"/);
assert.match(program.root.innerHTML, /name="description"/);
assert.doesNotMatch(program.root.innerHTML, /name="(?:dayNumber|date|title)"/);
const firstProgramDay = initialProgram[0];
program.submit('program-form', { cityIdx: String(firstProgramDay.cityIdx), description: 'Ручное описание сохраняется после пересоздания.' }, { index: '0' });
const manuallyEditedDay = deepClone(program.snapshot().programDays[0]);
assert.equal(manuallyEditedDay.description, 'Ручное описание сохраняется после пересоздания.');
program.click({ action: 'regenerate-program' });
assert.match(program.root.innerHTML, /Пересоздать программу/);
assert.deepEqual(program.snapshot().programDays[0], manuallyEditedDay, 'regeneration preview must not mutate the program');
program.click({ action: 'confirm-regenerate-program' });
const regeneratedProgram = program.snapshot().programDays;
assert.equal(regeneratedProgram.length, 12, '14–25 September produces twelve calendar days');
regeneratedProgram.forEach((day, index) => {
  assert.deepEqual(Object.keys(day), ['dayNumber', 'date', 'city', 'cityIdx', 'description']);
  assert.equal(day.dayNumber, index + 1);
});
assert.equal(regeneratedProgram[0].date, '2026-09-14');
assert.equal(regeneratedProgram.at(-1).date, '2026-09-25');
assert.equal(
  regeneratedProgram.find((day) => day.date === manuallyEditedDay.date && day.cityIdx === manuallyEditedDay.cityIdx).description,
  manuallyEditedDay.description,
);

// A common operation may only be created inside one existing tourist group.
const groupGuard = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
const operationsBeforeGuard = deepClone(groupGuard.snapshot().operationGroups);
groupGuard.click({ action: 'add-stage' });
groupGuard.click({ action: 'toggle-tourist', id: 't1' });
groupGuard.assertDisabled({ action: 'toggle-tourist', id: 't3' });
groupGuard.dispatch({ action: 'toggle-tourist', id: 't3' });
assert.match(groupGuard.root.innerHTML, /Далее · 1/);
assert.deepEqual(groupGuard.snapshot().operationGroups, operationsBeforeGuard);

const sameGroup = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
const t2ArrivalOwn = deepClone(sameGroup.snapshot().records['route-beijing-1'].arrival.t2);
sameGroup.click({ action: 'add-stage' });
['t1', 't2'].forEach((id) => sameGroup.click({ action: 'toggle-tourist', id }));
sameGroup.click({ action: 'next-operation' });
sameGroup.click({ action: 'save-form' });
if (sameGroup.root.innerHTML.includes('Сверка данных')) {
  sameGroup.click({ action: 'pick-conflict-source', id: 't1' });
  sameGroup.click({ action: 'apply-conflict' });
}
const sharedArrival = Object.values(sameGroup.snapshot().operationGroups['route-beijing-1'].arrival)
  .find((operation) => operation.members.slice().sort().join(',') === 't1,t2');
assert.ok(sharedArrival);
assert.equal(sharedArrival.sourceId, 't1');
assert.deepEqual(sameGroup.snapshot().records['route-beijing-1'].arrival.t2, t2ArrivalOwn, 'preview/apply keeps hidden ownValues');

// Applying the same members and operation again upserts the same link.
const arrivalGroupCount = Object.keys(sameGroup.snapshot().operationGroups['route-beijing-1'].arrival).length;
sameGroup.click({ action: 'add-stage' });
['t1', 't2'].forEach((id) => sameGroup.click({ action: 'toggle-tourist', id }));
sameGroup.click({ action: 'next-operation' });
sameGroup.click({ action: 'save-form' });
assert.equal(Object.keys(sameGroup.snapshot().operationGroups['route-beijing-1'].arrival).length, arrivalGroupCount);
assert.ok(sameGroup.snapshot().operationGroups['route-beijing-1'].arrival[sharedArrival.id]);

// Splitting one operation reveals ownValues and does not alter the tourist group or other operation links.
const hotelLinksBeforeArrivalSplit = deepClone(sameGroup.snapshot().operationGroups['route-beijing-1'].hotel);
const departureLinksBeforeArrivalSplit = deepClone(sameGroup.snapshot().operationGroups['route-beijing-1'].departure);
const touristGroupIdsBeforeArrivalSplit = sameGroup.snapshot().tourists.filter((tourist) => ['t1', 't2'].includes(tourist.id)).map((tourist) => tourist.groupId);
sameGroup.click({ action: 'manage-operation', members: 't1,t2', group: sharedArrival.id });
sameGroup.click({ action: 'split-operation-members' });
sameGroup.click({ action: 'toggle-tourist', id: 't2' });
sameGroup.click({ action: 'apply-operation-split' });
assert.deepEqual(sameGroup.snapshot().records['route-beijing-1'].arrival.t2, t2ArrivalOwn);
assert.deepEqual(sameGroup.snapshot().operationGroups['route-beijing-1'].hotel, hotelLinksBeforeArrivalSplit);
assert.deepEqual(sameGroup.snapshot().operationGroups['route-beijing-1'].departure, departureLinksBeforeArrivalSplit);
assert.deepEqual(sameGroup.snapshot().tourists.filter((tourist) => ['t1', 't2'].includes(tourist.id)).map((tourist) => tourist.groupId), touristGroupIdsBeforeArrivalSplit);

// Default sharedHotel is transactional: conflicting own hotel values require source preview before group creation.
const hotelConflict = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
hotelConflict.click({ action: 'summary-section', view: 'tourists' });
hotelConflict.click({ action: 'tourist-list-mode', mode: 'groups' });
hotelConflict.click({ action: 'split-tourist-group', group: 'family-sokolov' });
['t1', 't2'].forEach((id) => hotelConflict.click({ action: 'toggle-tourist', id }));
hotelConflict.click({ action: 'apply-global-split' });
const beforeHotelPreview = hotelConflict.snapshot();
hotelConflict.click({ action: 'start-tourist-group' });
['t1', 't2'].forEach((id) => hotelConflict.click({ action: 'toggle-tourist', id }));
hotelConflict.click({ action: 'apply-tourist-group' });
assert.match(hotelConflict.root.innerHTML, /Сверка данных/);
assert.match(hotelConflict.root.innerHTML, /Отель/);
assert.deepEqual(hotelConflict.snapshot().tourists, beforeHotelPreview.tourists);
assert.deepEqual(hotelConflict.snapshot().records, beforeHotelPreview.records);
assert.deepEqual(hotelConflict.snapshot().operationGroups, beforeHotelPreview.operationGroups);
assert.deepEqual(hotelConflict.snapshot().tourGroupSettings, beforeHotelPreview.tourGroupSettings);
hotelConflict.click({ action: 'pick-conflict-source', id: 't2' });
assert.deepEqual(hotelConflict.snapshot().tourists, beforeHotelPreview.tourists);
assert.deepEqual(hotelConflict.snapshot().records, beforeHotelPreview.records);
assert.deepEqual(hotelConflict.snapshot().tourGroupSettings, beforeHotelPreview.tourGroupSettings);
hotelConflict.click({ action: 'apply-conflict' });
const hotelConflictApplied = hotelConflict.snapshot();
assertExactlyOneRepresentativePerGroup(hotelConflictApplied, 'group creation after hotel conflict');
const regroupedId = hotelConflictApplied.tourists.find((tourist) => tourist.id === 't1').groupId;
assert.ok(regroupedId);
assert.equal(hotelConflictApplied.tourists.find((tourist) => tourist.id === 't2').groupId, regroupedId);
assert.equal(hotelConflictApplied.tourists.find((tourist) => tourist.id === 't1').groupRepresentative, true);
assert.equal(hotelConflictApplied.tourists.find((tourist) => tourist.id === 't2').groupRepresentative, false);
assert.deepEqual(hotelConflictApplied.records, beforeHotelPreview.records, 'shared hotel never overwrites ownValues');
const regroupedHotel = Object.values(hotelConflictApplied.operationGroups['route-beijing-1'].hotel)
  .find((operation) => operation.members.slice().sort().join(',') === 't1,t2');
assert.ok(regroupedHotel);
assert.equal(regroupedHotel.sourceId, 't2');
hotelConflict.click({ action: 'tourist-list-mode', mode: 'groups' });
assert.match(hotelConflict.root.innerHTML, /Соколова \+ Соколов/);

// Adding a member with different ownValues previews first and upserts the existing subgroup instead of duplicating it.
const addOperationMember = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
addOperationMember.click({ action: 'summary-section', view: 'tourists' });
addOperationMember.click({ action: 'tourist-list-mode', mode: 'groups' });
addOperationMember.click({ action: 'split-tourist-group', group: 'family-sokolov' });
['t1', 't2'].forEach((id) => addOperationMember.click({ action: 'toggle-tourist', id }));
addOperationMember.click({ action: 'apply-global-split' });
addOperationMember.click({ action: 'start-tourist-group' });
['t1', 't2', 't3'].forEach((id) => addOperationMember.click({ action: 'toggle-tourist', id }));
addOperationMember.click({ action: 'apply-tourist-group' });
let groupConflictGuard = 0;
while (addOperationMember.root.innerHTML.includes('Сверка данных')) {
  addOperationMember.click({ action: 'pick-conflict-source', id: 't1' });
  addOperationMember.click({ action: 'apply-conflict' });
  groupConflictGuard += 1;
  assert.ok(groupConflictGuard < 8, 'hotel conflict queue must terminate');
}
const expandedTourGroupId = addOperationMember.snapshot().tourists.find((tourist) => tourist.id === 't1').groupId;
assert.ok(expandedTourGroupId);
assert.ok(addOperationMember.snapshot().tourists.filter((tourist) => ['t1', 't2', 't3'].includes(tourist.id)).every((tourist) => tourist.groupId === expandedTourGroupId));
addOperationMember.click({ action: 'summary-section', view: 'operations' });
addOperationMember.click({ action: 'add-stage' });
['t1', 't2'].forEach((id) => addOperationMember.click({ action: 'toggle-tourist', id }));
addOperationMember.click({ action: 'next-operation' });
addOperationMember.click({ action: 'save-form' });
if (addOperationMember.root.innerHTML.includes('Сверка данных')) {
  addOperationMember.click({ action: 'pick-conflict-source', id: 't1' });
  addOperationMember.click({ action: 'apply-conflict' });
}
const existingArrival = Object.values(addOperationMember.snapshot().operationGroups['route-beijing-1'].arrival)
  .find((operation) => operation.members.slice().sort().join(',') === 't1,t2');
assert.ok(existingArrival);
const beforeMemberPreview = addOperationMember.snapshot();
const arrivalGroupCountBeforeMember = Object.keys(beforeMemberPreview.operationGroups['route-beijing-1'].arrival).length;
addOperationMember.click({ action: 'manage-operation', members: 't1,t2', group: existingArrival.id });
addOperationMember.click({ action: 'add-operation-members' });
addOperationMember.click({ action: 'toggle-tourist', id: 't3' });
addOperationMember.click({ action: 'next-operation' });
addOperationMember.click({ action: 'save-form' });
assert.match(addOperationMember.root.innerHTML, /Сверка данных/);
assert.deepEqual(addOperationMember.snapshot().tourists, beforeMemberPreview.tourists);
assert.deepEqual(addOperationMember.snapshot().records, beforeMemberPreview.records);
assert.deepEqual(addOperationMember.snapshot().operationGroups, beforeMemberPreview.operationGroups);
addOperationMember.click({ action: 'pick-conflict-source', id: 't3' });
assert.deepEqual(addOperationMember.snapshot().tourists, beforeMemberPreview.tourists);
assert.deepEqual(addOperationMember.snapshot().operationGroups, beforeMemberPreview.operationGroups);
addOperationMember.click({ action: 'apply-conflict' });
const afterMemberApply = addOperationMember.snapshot();
assertExactlyOneRepresentativePerGroup(afterMemberApply, 'adding a free tourist to an existing group');
assert.equal(Object.keys(afterMemberApply.operationGroups['route-beijing-1'].arrival).length, arrivalGroupCountBeforeMember);
assert.ok(afterMemberApply.operationGroups['route-beijing-1'].arrival[existingArrival.id]);
assert.deepEqual(afterMemberApply.operationGroups['route-beijing-1'].arrival[existingArrival.id].members.slice().sort(), ['t1', 't2', 't3']);
assert.equal(afterMemberApply.operationGroups['route-beijing-1'].arrival[existingArrival.id].sourceId, 't3');
assert.deepEqual(afterMemberApply.records, beforeMemberPreview.records);

// Creating a tourist group immediately shares its hotel, but not arrivals or departures.
const grouping = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
grouping.click({ action: 'summary-section', view: 'tourists' });
grouping.click({ action: 'start-tourist-group' });
['t3', 't4'].forEach((id) => grouping.click({ action: 'toggle-tourist', id }));
grouping.click({ action: 'apply-tourist-group' });
const createdGroupId = grouping.snapshot().tourists.find((tourist) => tourist.id === 't3').groupId;
assertExactlyOneRepresentativePerGroup(grouping.snapshot(), 'new tourist group');
assert.ok(createdGroupId);
assert.equal(grouping.snapshot().tourists.find((tourist) => tourist.id === 't4').groupId, createdGroupId);
assert.equal(grouping.snapshot().tourists.find((tourist) => tourist.id === 't3').groupRepresentative, true);
assert.equal(grouping.snapshot().tourists.find((tourist) => tourist.id === 't4').groupRepresentative, false);
const createdHotel = Object.values(grouping.snapshot().operationGroups['route-beijing-1'].hotel)
  .find((operation) => operation.members.slice().sort().join(',') === 't3,t4');
assert.ok(createdHotel, 'new tourist group must receive one shared hotel record');
for (const operation of ['arrival', 'departure']) {
  assert.equal(Object.values(grouping.snapshot().operationGroups['route-beijing-1'][operation])
    .some((item) => item.members.includes('t3') && item.members.includes('t4')), false);
}

// Two existing tourist groups never merge implicitly.
const touristsBeforeRejectedMerge = deepClone(grouping.snapshot().tourists);
grouping.click({ action: 'start-tourist-group' });
['t1', 't3'].forEach((id) => grouping.click({ action: 'toggle-tourist', id }));
grouping.click({ action: 'apply-tourist-group' });
assert.match(grouping.root.innerHTML, /двух существующих групп/);
assert.deepEqual(grouping.snapshot().tourists, touristsBeforeRejectedMerge);
assertExactlyOneRepresentativePerGroup(grouping.snapshot(), 'rejected group merge');
grouping.click({ action: 'close-overlay' });

// Full dissolution removes links owned by that group but preserves every individual record.
const individualRecordsBeforeDissolve = deepClone(grouping.snapshot().records);
grouping.click({ action: 'tourist-list-mode', mode: 'groups' });
grouping.click({ action: 'split-tourist-group', group: createdGroupId });
['t3', 't4'].forEach((id) => grouping.click({ action: 'toggle-tourist', id }));
grouping.click({ action: 'apply-global-split' });
assert.ok(grouping.snapshot().tourists.filter((tourist) => ['t3', 't4'].includes(tourist.id)).every((tourist) => !tourist.groupId));
assertExactlyOneRepresentativePerGroup(grouping.snapshot(), 'tourist group dissolution');
assert.deepEqual(grouping.snapshot().records, individualRecordsBeforeDissolve);
Object.values(grouping.snapshot().operationGroups).forEach((cityOperations) => {
  Object.values(cityOperations).forEach((operationLinks) => {
    assert.equal(Object.values(operationLinks).some((link) => link.createdFromGroupId === createdGroupId), false);
  });
});

// Saving a departure pre-fills only the empty arrival at the tourist's next route stop.
const transfer = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
transfer.click({ action: 'stage', stage: 'departure' });
transfer.click({ action: 'add-stage' });
transfer.click({ action: 'toggle-tourist', id: 't4' });
transfer.click({ action: 'next-operation' });
transfer.input({ field: 'date' }, '2026-09-17');
transfer.input({ field: 'time' }, '12:45');
transfer.input({ field: 'transport' }, 'bus', 'change');
transfer.input({ field: 'number' }, 'K12');
transfer.click({ action: 'save-form' });
const nextArrival = transfer.snapshot().records['route-shanghai-1'].arrival.t4;
assert.equal(nextArrival.date, '2026-09-17');
assert.equal(nextArrival.time, '12:45');
assert.equal(nextArrival.transport, 'bus');
assert.equal(nextArrival.number, 'K12');

// Directory rules cover multiple, one and zero compatible points, including manual fallback and persistence.
const directoryStorage = new Map();
const directory = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary', directoryStorage);
selectRole(directory, 'admin');
directory.click({ action: 'tour-menu' });
directory.click({ action: 'open-directory' });
directory.click({ action: 'open-directory-city', id: 'city-beijing' });
directory.click({ action: 'toggle-directory-point', id: 'point-pkx' });
assert.equal(JSON.parse(directoryStorage.get('unique-guide-directory-v1')).points.find((point) => point.id === 'point-pkx').active, false);
const directoryReload = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary', directoryStorage);
selectRole(directoryReload, 'admin');
directoryReload.click({ action: 'tour-menu' });
directoryReload.click({ action: 'open-directory' });
directoryReload.click({ action: 'open-directory-city', id: 'city-beijing' });
assert.match(directoryReload.root.innerHTML, /Дасин/);
assert.match(directoryReload.root.innerHTML, /архив/i);

const multiplePoints = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
multiplePoints.click({ action: 'add-stage' });
multiplePoints.click({ action: 'toggle-tourist', id: 't4' });
multiplePoints.click({ action: 'next-operation' });
multiplePoints.input({ field: 'transport' }, 'plane', 'change');
assert.match(multiplePoints.root.innerHTML, /Доступно в городе: 2 · Аэропорт/);
multiplePoints.click({ action: 'open-point-picker' });
assert.match(multiplePoints.root.innerHTML, /Дасин/);
assert.match(multiplePoints.root.innerHTML, /Шоуду/);

const onePoint = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
selectCity(onePoint, 1);
onePoint.click({ action: 'stage', stage: 'departure' });
onePoint.click({ action: 'add-stage' });
onePoint.click({ action: 'toggle-tourist', id: 't1' });
onePoint.click({ action: 'next-operation' });
onePoint.input({ field: 'transport' }, 'train', 'change');
assert.match(onePoint.root.innerHTML, /Сиань Северный/);
assert.match(onePoint.root.innerHTML, /Подставлено из справочника/);

const noPoints = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary');
selectCity(noPoints, 2);
noPoints.click({ action: 'stage', stage: 'departure' });
noPoints.click({ action: 'add-stage' });
noPoints.click({ action: 'toggle-tourist', id: 't1' });
noPoints.click({ action: 'next-operation' });
noPoints.input({ field: 'transport' }, 'bus', 'change');
assert.match(noPoints.root.innerHTML, /Указать вручную/);
assert.match(noPoints.root.innerHTML, /Не из справочника/);
noPoints.input({ field: 'point', manualPoint: '' }, 'Площадь у отеля');
noPoints.input({ field: 'transport' }, 'plane', 'change');
assert.match(noPoints.root.innerHTML, /value="Площадь у отеля"/);
assert.match(noPoints.root.innerHTML, /Не из справочника/);
noPoints.click({ action: 'save-form' });
assert.equal(noPoints.snapshot().records['route-shanghai-1'].departure.t1.point, 'Площадь у отеля');
assert.equal(noPoints.snapshot().records['route-shanghai-1'].departure.t1.pointManual, true);

// Confirmation repeats the usage check: a forged/stale delete cannot remove a point that became referenced after preview.
const directoryToctou = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&role=admin');
const recordsBeforeToctou = deepClone(directoryToctou.snapshot().records);
assert.equal(directoryToctou.snapshot().directory.points.find((point) => point.id === 'point-pkx').active, true);
directoryToctou.dispatch({ action: 'confirm-delete-directory-point', id: 'point-pkx' });
const protectedUsedPoint = directoryToctou.snapshot().directory.points.find((point) => point.id === 'point-pkx');
assert.ok(protectedUsedPoint, 'a used point must survive a stale confirmation');
assert.equal(protectedUsedPoint.active, false, 'a used point is archived instead of hard-deleted');
assert.deepEqual(directoryToctou.snapshot().records, recordsBeforeToctou);

// Roles are enforced in both rendering and forged event handlers.
const managerActions = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=actions&role=manager');
assert.match(managerActions.root.innerHTML, /data-action="(?:cancel-tour|close-tour)"/);
assert.doesNotMatch(managerActions.root.innerHTML, /data-action="(?:archive-tour|delete-tour)"/);
const adminActions = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=actions&role=admin');
assert.match(adminActions.root.innerHTML, /data-action="archive-tour"/);
assert.match(adminActions.root.innerHTML, /data-action="delete-tour"/);
for (const readonlyRole of ['escort', 'viewer']) {
  const readonlyActions = loadPrototype('tour-operations.js', '#app', `?tourId=china&tourSection=actions&role=${readonlyRole}`);
  assert.doesNotMatch(readonlyActions.root.innerHTML, /data-action="(?:cancel-tour|reopen-tour|archive-tour|delete-tour)"/);
  const readonlyToursBefore = deepClone(readonlyActions.snapshot().tours);
  ['cancel-tour', 'reopen-tour', 'archive-tour', 'delete-tour'].forEach((action) => readonlyActions.dispatch({ action }));
  assert.deepEqual(readonlyActions.snapshot().tours, readonlyToursBefore);
}

// Reopen is a state transition from cancelled only; forged clicks cannot mutate active or draft tours.
const forgedActiveReopen = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=actions&role=manager');
const activeToursBeforeReopen = deepClone(forgedActiveReopen.snapshot().tours);
const activeLeadArchiveBeforeReopen = deepClone(forgedActiveReopen.snapshot().leadArchiveMocks);
forgedActiveReopen.dispatch({ action: 'reopen-tour' });
assert.deepEqual(forgedActiveReopen.snapshot().tours, activeToursBeforeReopen);
assert.deepEqual(forgedActiveReopen.snapshot().leadArchiveMocks, activeLeadArchiveBeforeReopen);
assert.match(forgedActiveReopen.root.innerHTML, /Повторно открыть можно только отменённый доступный тур/);

const forgedDraftReopen = loadPrototype('tour-operations.js', '#app', '?tourId=japan&tourSection=actions&role=admin');
const draftToursBeforeReopen = deepClone(forgedDraftReopen.snapshot().tours);
forgedDraftReopen.dispatch({ action: 'reopen-tour' });
assert.deepEqual(forgedDraftReopen.snapshot().tours, draftToursBeforeReopen);
assert.equal(forgedDraftReopen.snapshot().tours.find((tour) => tour.id === 'japan').status, 'draft');

function lifecycleStorage() {
  const storage = new Map();
  const leadSeed = loadPrototype('mobile-leads.js', '#app', '?role=admin', storage);
  storage.set('unique-guide-leads-v2', JSON.stringify(leadSeed.snapshot().leads));
  return storage;
}
function linkedLeads(storage, tourSnapshot, tourId) {
  const linkedLeadIds = new Set(tourSnapshot.tourists.filter((tourist) => tourist.tourId === tourId).map((tourist) => tourist.leadId));
  return JSON.parse(storage.get('unique-guide-leads-v2')).filter((item) => linkedLeadIds.has(item.id));
}

// AC-46: cancel/archive preserve tour data while linked Leads follow the lifecycle; reopen/unarchive restores them.
const cancelLifecycleStorage = lifecycleStorage();
const cancelLifecycle = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=actions&role=manager', cancelLifecycleStorage);
const cancelDataBefore = { tourists: deepClone(cancelLifecycle.snapshot().tourists), records: deepClone(cancelLifecycle.snapshot().records) };
cancelLifecycle.click({ action: 'cancel-tour' });
cancelLifecycle.submit('cancel-tour-form', { reason: 'Contract smoke cancellation' }, { id: 'china' });
assert.equal(cancelLifecycle.snapshot().tours.find((tour) => tour.id === 'china').status, 'cancelled');
assert.ok(linkedLeads(cancelLifecycleStorage, cancelLifecycle.snapshot(), 'china').every((leadItem) => leadItem.archived));
assert.deepEqual(cancelLifecycle.snapshot().tourists, cancelDataBefore.tourists);
assert.deepEqual(cancelLifecycle.snapshot().records, cancelDataBefore.records);
cancelLifecycle.click({ action: 'open-tours' });
assert.match(cancelLifecycle.root.innerHTML, /Гранд-тур по Китаю/);
assert.match(cancelLifecycle.root.innerHTML, /Отменён/);
assert.match(cancelLifecycle.root.innerHTML, /data-action="tour-filter" data-filter="archive"/);
cancelLifecycle.click({ action: 'select-tour', id: 'china' });
cancelLifecycle.click({ action: 'workspace', view: 'tour-actions' });
cancelLifecycle.click({ action: 'reopen-tour' });
assert.equal(cancelLifecycle.snapshot().tours.find((tour) => tour.id === 'china').status, 'active');
assert.ok(linkedLeads(cancelLifecycleStorage, cancelLifecycle.snapshot(), 'china').every((leadItem) => !leadItem.archived));

const archiveLifecycleStorage = lifecycleStorage();
const archiveLifecycle = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=actions&role=admin', archiveLifecycleStorage);
const archiveDataBefore = { tourists: deepClone(archiveLifecycle.snapshot().tourists), records: deepClone(archiveLifecycle.snapshot().records) };
archiveLifecycle.click({ action: 'archive-tour' });
assert.equal(archiveLifecycle.snapshot().tours.find((tour) => tour.id === 'china').isArchived, true);
assert.ok(linkedLeads(archiveLifecycleStorage, archiveLifecycle.snapshot(), 'china').every((leadItem) => leadItem.archived));
assert.deepEqual(archiveLifecycle.snapshot().tourists, archiveDataBefore.tourists);
assert.deepEqual(archiveLifecycle.snapshot().records, archiveDataBefore.records);
archiveLifecycle.click({ action: 'archive-tour' });
assert.equal(archiveLifecycle.snapshot().tours.find((tour) => tour.id === 'china').isArchived, false);
assert.ok(linkedLeads(archiveLifecycleStorage, archiveLifecycle.snapshot(), 'china').every((leadItem) => !leadItem.archived));

// Archiving a draft restores its draft lifecycle, not a generic active status.
const draftLifecycle = loadPrototype('tour-operations.js', '#app', '?tourId=japan&tourSection=actions&role=admin');
assert.equal(draftLifecycle.snapshot().tours.find((tour) => tour.id === 'japan').status, 'draft');
draftLifecycle.click({ action: 'archive-tour' });
assert.equal(draftLifecycle.snapshot().tours.find((tour) => tour.id === 'japan').status, 'archive');
assert.equal(draftLifecycle.snapshot().tours.find((tour) => tour.id === 'japan').isArchived, true);
draftLifecycle.click({ action: 'archive-tour' });
assert.equal(draftLifecycle.snapshot().tours.find((tour) => tour.id === 'japan').status, 'draft');
assert.equal(draftLifecycle.snapshot().tours.find((tour) => tour.id === 'japan').isArchived, false);

// Copies of archived and cancelled tours always start as clean, empty drafts.
const archivedCopy = loadPrototype('tour-operations.js', '#app', '?tourId=italy&tourSection=actions&role=admin');
archivedCopy.click({ action: 'copy-tour' });
const archivedDraftCopy = archivedCopy.snapshot().tours.find((tour) => tour.name === 'Италия для своих · копия');
assert.ok(archivedDraftCopy);
assert.equal(archivedDraftCopy.status, 'draft');
assert.equal(archivedDraftCopy.isArchived, false);
assert.equal(archivedDraftCopy.cancelReason, '');
assert.equal(archivedDraftCopy.statusBeforeArchive, null);
assert.equal(archivedDraftCopy.statusBeforeCancel, null);
assert.equal(archivedDraftCopy.bookedCount, 0);
assert.deepEqual(archivedDraftCopy.statusCounts, { confirmed: 0, pending: 0, cancelled: 0 });

const cancelledCopyStorage = lifecycleStorage();
const cancelledCopy = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=actions&role=admin', cancelledCopyStorage);
cancelledCopy.click({ action: 'cancel-tour' });
cancelledCopy.submit('cancel-tour-form', { reason: 'Copy lifecycle smoke' }, { id: 'china' });
cancelledCopy.click({ action: 'copy-tour' });
const cancelledDraftCopy = cancelledCopy.snapshot().tours.find((tour) => tour.name === 'Гранд-тур по Китаю · копия');
assert.ok(cancelledDraftCopy);
assert.equal(cancelledDraftCopy.status, 'draft');
assert.equal(cancelledDraftCopy.isArchived, false);
assert.equal(cancelledDraftCopy.cancelReason, '');
assert.equal(cancelledDraftCopy.statusBeforeArchive, null);
assert.equal(cancelledDraftCopy.statusBeforeCancel, null);
assert.equal(cancelledDraftCopy.bookedCount, 0);
assert.deepEqual(cancelledDraftCopy.statusCounts, { confirmed: 0, pending: 0, cancelled: 0 });
const guideSummary = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&role=guide');
const guideRecordsBefore = deepClone(guideSummary.snapshot().records);
assert.match(guideSummary.root.innerHTML, /Режим просмотра/);
assert.doesNotMatch(guideSummary.root.innerHTML, /data-action="add-stage"/);
guideSummary.dispatch({ action: 'add-stage' });
assert.deepEqual(guideSummary.snapshot().records, guideRecordsBefore);

// Saving and save-error are explicit, non-network UI states with retry and draft-return actions.
const savingState = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&role=manager');
savingState.click({ action: 'role-menu' });
savingState.click({ action: 'open-ui-states' });
savingState.click({ action: 'set-ui-state', state: 'saving' });
assert.equal(savingState.snapshot().uiPreview, 'saving');
assert.match(savingState.root.innerHTML, /Сохраняем изменения/);
assert.match(savingState.root.innerHTML, /disabled aria-busy="true">Сохраняем…/);

const saveErrorState = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&role=manager');
saveErrorState.click({ action: 'role-menu' });
saveErrorState.click({ action: 'open-ui-states' });
saveErrorState.click({ action: 'set-ui-state', state: 'save-error' });
assert.equal(saveErrorState.snapshot().uiPreview, 'save-error');
assert.match(saveErrorState.root.innerHTML, /Не удалось сохранить/);
assert.match(saveErrorState.root.innerHTML, /Черновик и выбранные туристы сохранены/);
assert.match(saveErrorState.root.innerHTML, /data-action="return-draft-state"/);
assert.match(saveErrorState.root.innerHTML, /data-action="retry-save-state"/);
saveErrorState.click({ action: 'retry-save-state' });
assert.equal(saveErrorState.snapshot().uiPreview, 'saving');
assert.match(saveErrorState.root.innerHTML, /Сохраняем изменения/);

const returnDraftState = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&role=manager');
returnDraftState.click({ action: 'role-menu' });
returnDraftState.click({ action: 'open-ui-states' });
returnDraftState.click({ action: 'set-ui-state', state: 'save-error' });
returnDraftState.click({ action: 'return-draft-state' });
assert.equal(returnDraftState.snapshot().uiPreview, 'ready');

// Save-error restores the actual operation draft, selected member and navigation context, not only a success toast.
const operationDraftState = loadPrototype('tour-operations.js', '#app', '?tourId=china&tourSection=summary&role=manager');
selectCity(operationDraftState, 1);
operationDraftState.click({ action: 'stage', stage: 'departure' });
operationDraftState.click({ action: 'add-stage' });
operationDraftState.click({ action: 'toggle-tourist', id: 't1' });
operationDraftState.click({ action: 'next-operation' });
operationDraftState.input({ field: 'date' }, '2026-10-04');
operationDraftState.input({ field: 'time' }, '09:17');
operationDraftState.input({ field: 'transport' }, 'train', 'change');
operationDraftState.input({ field: 'number' }, 'G-910');
operationDraftState.dispatch({ action: 'set-ui-state', state: 'save-error' });
assert.equal(operationDraftState.snapshot().uiPreview, 'save-error');
assert.ok(operationDraftState.snapshot().saveErrorSnapshot, 'save-error must retain a structured draft snapshot');
operationDraftState.click({ action: 'return-draft-state' });
const restoredOperationDraft = operationDraftState.snapshot();
assert.equal(restoredOperationDraft.uiPreview, 'ready');
assert.equal(restoredOperationDraft.routeCityId, 'route-xian-1');
assert.equal(restoredOperationDraft.stage, 'departure');
assert.match(operationDraftState.root.innerHTML, /Соколов Илья Максимович|Соколова Анна Игоревна/);
assert.match(operationDraftState.root.innerHTML, /value="2026-10-04"/);
assert.match(operationDraftState.root.innerHTML, /value="09:17"/);
assert.match(operationDraftState.root.innerHTML, /value="G-910"/);
assert.match(operationDraftState.root.innerHTML, /<option value="train"[^>]*selected/);

// Static isolation: the prototype is mock/localStorage-only and has no production integration.
const activeFiles = [
  'mock-crm-data.js',
  'mobile-leads.html', 'mobile-leads.css', 'mobile-leads.js',
  'tour-operations.html', 'tour-operations.css', 'tour-operations.js',
  'mobile-leads-tz.html', 'mobile-leads-tz.css',
];
const activeSource = activeFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const activeJs = fs.readFileSync('mock-crm-data.js', 'utf8') + fs.readFileSync('mobile-leads.js', 'utf8') + fs.readFileSync('tour-operations.js', 'utf8');
assert.doesNotMatch(activeSource, /@import\s+url\(|url\(["']?https?:|<script[^>]+https?:|<link[^>]+https?:/i);
assert.doesNotMatch(activeJs, /(?:fetch\s*\(|new\s+XMLHttpRequest|new\s+WebSocket|new\s+EventSource|sendBeacon\s*\(|\/api\/)/);
assert.match(fs.readFileSync('tour-operations.js', 'utf8'), /label: 'Финансы'/, 'the unified prototype must include the working-app Finance entry point');
assert.doesNotMatch(activeSource, />\s*Расходы\s*</i, 'the prototype does not invent a separate Expenses module');

// Delivery companion pages are complete, local-only documents rather than broken navigation targets.
const commercialHtml = fs.readFileSync('commercial-proposal.html', 'utf8');
const commercialCss = fs.readFileSync('commercial-proposal.css', 'utf8');
assert.ok(fs.existsSync('.nojekyll'), 'GitHub Pages must serve the static branch without Jekyll processing');
assert.match(fs.readFileSync('index.html', 'utf8'), /tour-operations\.html/);
assert.equal((commercialHtml.match(/<article class="work-card /g) || []).length, 6, 'commercial proposal contains six priced deliverables');
assert.equal((commercialHtml.match(/<b>[^<]*&nbsp;₽<\/b><\/li>/g) || []).length, 32, 'commercial proposal decomposes the six blocks into thirty-two priced tasks');
const commercialTaskAmounts = [...commercialHtml.matchAll(/<b>([\d]+(?:&nbsp;[\d]+)*)&nbsp;₽<\/b><\/li>/g)]
  .map((match) => Number(match[1].replaceAll('&nbsp;', '')));
assert.equal(commercialTaskAmounts.reduce((sum, amount) => sum + amount, 0), 390_000, 'priced tasks add up to the fixed current-development price');
assert.match(commercialHtml, /390&nbsp;000&nbsp;₽/);
assert.match(commercialHtml, /прототип и последующая рабочая реализация/);
['240&nbsp;000&nbsp;₽', '1&nbsp;488&nbsp;000&nbsp;₽', '223&nbsp;200&nbsp;₽', '1&nbsp;711&nbsp;200&nbsp;₽', '1&nbsp;951&nbsp;200&nbsp;₽', '6,20'].forEach((staleValue) => assert.doesNotMatch(commercialHtml, new RegExp(escapeRegExp(staleValue))));
[
  'https://appfox.ru/research/razrabotka-mob-prilozhenii/',
  'https://antaltalent.ru/wp-content/uploads/2025/10/RUS_Job_market_25-26.pdf',
  'https://clutch.co/directory/mobile-application-developers/pricing',
  'https://twenty.com/pricing',
  'https://www.salesforce.com/service/field-service-management/pricing/',
].forEach((sourceUrl) => assert.match(commercialHtml, new RegExp(escapeRegExp(sourceUrl))));
assert.doesNotMatch(commercialHtml, /<script\b|<link[^>]+https?:/i);
assert.doesNotMatch(commercialCss, /@import\s+url\(|url\(["']?https?:/i);

// Markdown is the canonical specification and the visual HTML is a generated, hashed view of it.
const specMarkdown = fs.readFileSync('mobile-leads-tz.md', 'utf8');
const specHtml = fs.readFileSync('mobile-leads-tz.html', 'utf8');
assert.match(specMarkdown, /390 000 ₽ за оба шага/);
const specImages = [
  '16-lead-final.png', '17-tour-final.png', '18-tourist-profile-final.png',
  '19-tourist-tour-final.png', '20-summary-final.png', '21-team-final.png', '22-statuses-final.png',
  '23-finance-final.png', '24-tours-data-final.png', '25-guide-final.png',
  '11-offline.png', '13-error-state.png', '14-empty-state.png', '15-summary-375.png',
];
specImages.forEach((image) => {
  const assetPath = `assets/spec/${image}`;
  assert.ok(fs.statSync(assetPath).size > 10_000, `${assetPath} must contain a real prototype screenshot`);
  assert.match(specMarkdown, new RegExp(escapeRegExp(assetPath)), `${assetPath} must be documented in Markdown`);
  assert.match(specHtml, new RegExp(`src="${escapeRegExp(assetPath)}"`), `${assetPath} must be rendered in HTML`);
});
assert.equal((specHtml.match(/aria-hidden="true" class="marker/g) || []).length, 40);
assert.match(specHtml, /class="requirements-drawer" id="technical-appendix"/);
assert.match(specHtml, /class="grouping-diagram"/);
const requirementIds = [...new Set(specMarkdown.match(/\b(?:AC|NG|BL)-\d+\b/g) || [])];
assert.ok(requirementIds.length >= 60, 'the canonical spec must retain acceptance criteria, non-goals and backlog');
const markdownHash = crypto.createHash('sha256').update(specMarkdown).digest('hex');
assert.match(specHtml, new RegExp(`<meta name="spec-sha256" content="${markdownHash}">`));

assert.equal(networkCalls.length, 0, `prototype made network calls: ${JSON.stringify(networkCalls)}`);
console.log(`Prototype smoke test passed (${requirementIds.length} canonical IDs)`);
