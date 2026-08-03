const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

let networkCalls = 0;

function dataAttribute(key) {
  return 'data-' + key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadPrototype(file, appSelector, search) {
  const listeners = {};
  const storage = new Map();
  const root = {
    html: '',
    set innerHTML(value) { this.html = value; },
    get innerHTML() { return this.html; },
    addEventListener(type, handler) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(handler);
    },
    querySelector() { return null; },
  };
  const document = {
    querySelector(selector) { return selector === appSelector ? root : null; },
    getElementById(id) { return id === appSelector.replace('#', '') ? root : null; },
    createElement() { return { click() {}, set href(value) { this._href = value; }, get href() { return this._href; } }; },
  };
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  class MockFormData {
    constructor(form) { this.values = form._values || {}; }
    entries() { return Object.entries(this.values)[Symbol.iterator](); }
  }
  const windowObject = {
    location: { search: search || '', href: '' },
    localStorage,
    setTimeout() { return 1; },
    clearTimeout() {},
  };
  const context = {
    Blob,
    FormData: MockFormData,
    URL,
    URLSearchParams,
    console,
    document,
    fetch() { networkCalls += 1; return Promise.reject(new Error('Network is disabled in prototype smoke test')); },
    window: windowObject,
    setTimeout: windowObject.setTimeout,
    clearTimeout: windowObject.clearTimeout,
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });

  function findElement(dataset) {
    const tags = root.html.match(/<[^>]+>/g) || [];
    const match = tags.find((tag) => Object.entries(dataset).every(([key, value]) => {
      const attribute = dataAttribute(key);
      if (value === '') return new RegExp('\\s' + escapeRegExp(attribute) + '(?:\\s|=|>)').test(tag);
      return new RegExp('\\s' + escapeRegExp(attribute) + '="' + escapeRegExp(value) + '"').test(tag);
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

  function input(dataset, value, type = 'input') {
    actualElement(dataset);
    const target = { dataset, value };
    (listeners[type] || []).forEach((handler) => handler({ target }));
  }

  function submit(formId, values, dataset = {}) {
    assert.match(root.html, new RegExp('<form[^>]+id="' + escapeRegExp(formId) + '"'), `form ${formId} must be rendered before submit`);
    const form = { id: formId, dataset, _values: values };
    (listeners.submit || []).forEach((handler) => handler({ preventDefault() {}, target: form }));
  }

  return { root, click, input, submit, storage, assertDisabled };
}

// Existing mobile Leads remain a separate navigation section.
const leads = loadPrototype('mobile-leads.js', '#app');
assert.match(leads.root.innerHTML, /Лиды/);
assert.match(leads.root.innerHTML, /Канбан/);
['Туры', 'Туристы', 'Лиды'].forEach((label) => assert.match(leads.root.innerHTML, new RegExp(label)));
assert.equal(leads.root.innerHTML.includes('data-nav="' + ['fin', 'ance'].join('') + '"'), false);
leads.click({ openLead: 'lead-1042' });
assert.match(leads.root.innerHTML, /Сводная по туру/);
leads.click({ detailTab: 'tourists' });
assert.match(leads.root.innerHTML, /Соколова Анна/);
leads.click({ editTourist: 't1' });
leads.click({ action: 'scan-passport' });
assert.match(leads.root.innerHTML, /72 4567890/, 'mock OCR value survives rerender');
leads.click({ action: 'back-detail' });
leads.click({ action: 'back-list' });
leads.click({ action: 'filters' });
assert.match(leads.root.innerHTML, /Фильтры лидов/);

const linkedLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042');
assert.match(linkedLead.root.innerHTML, /Соколова Анна Игоревна/, 'lead deep-link opens its detail');

// Conflict resolution uses a source record and split restores individual values.
const tours = loadPrototype('tour-operations.js', '#app');
assert.match(tours.root.innerHTML, /По операциям/);
assert.match(tours.root.innerHTML, /Пекин · остановка 1/);
tours.click({ action: 'add-stage' });
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'toggle-tourist', id: 't2' });
tours.click({ action: 'next-operation' });
assert.match(tours.root.innerHTML, /Данные записи/);
tours.click({ action: 'save-form' });
assert.match(tours.root.innerHTML, /Сверка данных/);
tours.assertDisabled({ action: 'apply-conflict' });
tours.click({ action: 'pick-conflict-source', id: 't1' });
tours.click({ action: 'apply-conflict' });
assert.match(tours.root.innerHTML, /Состав · 2/, 'conflict resolution creates one common record');

const commonRecord = tours.root.innerHTML.match(/data-action="manage-operation" data-members="t1,t2" data-group="([^"]+)"/);
assert.ok(commonRecord, 'created common record can be managed');
tours.click({ action: 'manage-operation', members: 't1,t2', group: commonRecord[1] });
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'apply-operation-split' });
assert.match(tours.root.innerHTML, /CZ 342/, 'first individual value is restored after split');
assert.match(tours.root.innerHTML, /SU 204/, 'second individual value is restored after split');

// Four tourists from different leads become one tour-level group.
tours.click({ action: 'nav', view: 'tourists' });
tours.click({ action: 'start-tourist-group' });
['t1', 't2', 't3', 't4'].forEach((id) => tours.click({ action: 'toggle-tourist', id }));
tours.click({ action: 'apply-tourist-group' });
assert.match(tours.root.innerHTML, /4 туриста/);
assert.match(tours.root.innerHTML, /Марина Орлова/);
assert.match(tours.root.innerHTML, /Денис Волков/);
assert.doesNotMatch(tours.root.innerHTML, /Лид Волков/, 'four-tourist scenario uses exactly two leads');

// One common hotel for four, then a split affects hotel only.
tours.click({ action: 'nav', view: 'operations' });
tours.click({ action: 'stage', stage: 'hotel' });
tours.click({ action: 'add-stage' });
tours.click({ action: 'select-all' });
tours.click({ action: 'next-operation' });
tours.click({ action: 'save-form' });
assert.match(tours.root.innerHTML, /Сверка данных/);
tours.click({ action: 'pick-conflict-source', id: 't1' });
tours.click({ action: 'apply-conflict' });
const hotelGroup = tours.root.innerHTML.match(/data-action="manage-operation" data-members="t1,t2,t3,t4" data-group="([^"]+)"/);
assert.ok(hotelGroup, 'common hotel covers all four tourists');

// Independent arrival subgroups 2+2.
tours.click({ action: 'stage', stage: 'arrival' });
tours.click({ action: 'add-stage' });
['t1', 't2'].forEach((id) => tours.click({ action: 'toggle-tourist', id }));
tours.click({ action: 'next-operation' });
tours.click({ action: 'save-form' });
tours.click({ action: 'pick-conflict-source', id: 't1' });
tours.click({ action: 'apply-conflict' });
tours.click({ action: 'add-stage' });
['t3', 't4'].forEach((id) => tours.click({ action: 'toggle-tourist', id }));
tours.click({ action: 'next-operation' });
tours.click({ action: 'save-form' });
assert.match(tours.root.innerHTML, /data-members="t1,t2"/);
assert.match(tours.root.innerHTML, /data-members="t3,t4"/);
tours.click({ action: 'add-stage' });
['t1', 't2'].forEach((id) => tours.click({ action: 'toggle-tourist', id }));
tours.click({ action: 'next-operation' });
tours.click({ action: 'save-form' });
assert.equal((tours.root.innerHTML.match(/data-action="manage-operation" data-members="t1,t2"/g) || []).length, 1, 'repeated grouping does not create a duplicate card');

// Departures can stay individual; splitting an old subgroup does not affect arrivals.
tours.click({ action: 'stage', stage: 'departure' });
const departureGroup = tours.root.innerHTML.match(/data-action="manage-operation" data-members="t1,t2" data-group="([^"]+)"/);
assert.ok(departureGroup, 'seed contains a departure subgroup to split');
tours.click({ action: 'manage-operation', members: 't1,t2', group: departureGroup[1] });
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'apply-operation-split' });
assert.doesNotMatch(tours.root.innerHTML, /data-action="manage-operation" data-members="t1,t2"/, 'departure subgroup is split');
['G89', 'G91', 'Лобби Hutong Garden', 'K12'].forEach((value) => assert.match(tours.root.innerHTML, new RegExp(value), `individual departure ${value} remains visible`));
['t1', 't2', 't3', 't4'].forEach((id) => assert.match(tours.root.innerHTML, new RegExp('data-action="manage-operation" data-members="' + id + '"'), `departure for ${id} is individual`));
tours.click({ action: 'stage', stage: 'hotel' });
const hotelAfterOtherOperations = tours.root.innerHTML.match(/data-action="manage-operation" data-members="t1,t2,t3,t4" data-group="([^"]+)"/);
assert.ok(hotelAfterOtherOperations, 'hotel group survives arrival and departure changes');
tours.click({ action: 'manage-operation', members: 't1,t2,t3,t4', group: hotelAfterOtherOperations[1] });
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'apply-operation-split' });
assert.match(tours.root.innerHTML, /Основная запись после отделения/);
tours.click({ action: 'pick-split-source', id: 't2' });
tours.click({ action: 'confirm-operation-split' });
assert.match(tours.root.innerHTML, /Beijing Palace/);
assert.match(tours.root.innerHTML, /Twin/, 'new source is chosen explicitly when the old source leaves');
assert.match(tours.root.innerHTML, /data-members="t2,t3,t4"/, 'hotel now covers the remaining three');
tours.click({ action: 'stage', stage: 'arrival' });
assert.match(tours.root.innerHTML, /data-members="t1,t2"/, 'arrival 2+2 survives hotel split');
assert.match(tours.root.innerHTML, /data-members="t3,t4"/, 'second arrival subgroup survives hotel split');

// Scope, matrix and repeated route city retain their established behavior.
tours.click({ action: 'toggle-scope' });
assert.match(tours.root.innerHTML, /Фильтр по лиду/);
tours.click({ action: 'select-scope', id: 'lead-1042' });
assert.match(tours.root.innerHTML, /Лид: Соколовы/);
tours.click({ action: 'summary-mode', mode: 'matrix' });
assert.match(tours.root.innerHTML, /Сводная по туристам/);
tours.click({ action: 'toggle-scope' });
assert.match(tours.root.innerHTML, /Денис Волков/);
assert.match(tours.root.innerHTML, /coverage-cell unavailable/, 'restricted city is non-editable');
tours.click({ action: 'summary-mode', mode: 'groups' });
tours.click({ action: 'city', index: '3' });
assert.match(tours.root.innerHTML, /Пекин · остановка 2/);

// A second existing tourist group cannot be merged with the first one automatically.
const groupingGuard = loadPrototype('tour-operations.js', '#app');
groupingGuard.click({ action: 'nav', view: 'tourists' });
groupingGuard.click({ action: 'start-tourist-group' });
['t3', 't4'].forEach((id) => groupingGuard.click({ action: 'toggle-tourist', id }));
groupingGuard.click({ action: 'apply-tourist-group' });
groupingGuard.click({ action: 'start-tourist-group' });
['t1', 't3'].forEach((id) => groupingGuard.click({ action: 'toggle-tourist', id }));
groupingGuard.click({ action: 'apply-tourist-group' });
assert.match(groupingGuard.root.innerHTML, /двух существующих групп/);

// Full group dissolution removes dependent links but preserves individual records.
const fullDissolve = loadPrototype('tour-operations.js', '#app');
fullDissolve.click({ action: 'nav', view: 'tourists' });
fullDissolve.click({ action: 'start-tourist-group' });
['t1', 't2', 't3', 't4'].forEach((id) => fullDissolve.click({ action: 'toggle-tourist', id }));
fullDissolve.click({ action: 'apply-tourist-group' });
fullDissolve.click({ action: 'split-tourist-group', group: 'family-sokolov' });
['t1', 't2', 't3', 't4'].forEach((id) => fullDissolve.click({ action: 'toggle-tourist', id }));
fullDissolve.click({ action: 'apply-global-split' });
assert.match(fullDissolve.root.innerHTML, /Без группы/);
assert.match(fullDissolve.root.innerHTML, /4 туриста/);
fullDissolve.click({ action: 'nav', view: 'operations' });
assert.match(fullDissolve.root.innerHTML, /CZ 342/);
assert.match(fullDissolve.root.innerHTML, /SU 204/);
assert.doesNotMatch(fullDissolve.root.innerHTML, /Состав · 2/);

// Directory CRUD persists in localStorage; a used point can only be archived.
const directory = loadPrototype('tour-operations.js', '#app');
directory.click({ action: 'tour-menu' });
directory.click({ action: 'open-directory' });
assert.match(directory.root.innerHTML, /Города и точки/);
directory.click({ action: 'open-directory-city', id: 'city-beijing' });
directory.click({ action: 'toggle-directory-point', id: 'point-pkx' });
assert.match(directory.root.innerHTML, /Точка перемещена в архив/);
const savedAfterArchive = JSON.parse(directory.storage.get('unique-guide-directory-v1'));
assert.equal(savedAfterArchive.points.find((point) => point.id === 'point-pkx').active, false);
directory.click({ action: 'delete-directory-point', id: 'point-beijing-bus-east' });
assert.match(directory.root.innerHTML, /Удалить без возможности восстановления/);
directory.click({ action: 'confirm-delete-directory-point', id: 'point-beijing-bus-east' });
const savedAfterDelete = JSON.parse(directory.storage.get('unique-guide-directory-v1'));
assert.equal(savedAfterDelete.points.some((point) => point.id === 'point-beijing-bus-east'), false);
directory.click({ action: 'close-overlay' });
directory.click({ action: 'new-directory-city' });
directory.submit('directory-city-form', { name: 'Тестоград', country: 'Тестландия', aliases: 'Test City', active: 'true' }, { id: '' });
assert.match(directory.root.innerHTML, /Тестоград/);
const createdCityId = directory.root.innerHTML.match(/data-action="edit-directory-city" data-id="([^"]+)"/)[1];
directory.click({ action: 'edit-directory-city', id: createdCityId });
directory.submit('directory-city-form', { name: 'Тестоград', country: 'Тестландия', aliases: 'Test City, ТГ', active: 'true' }, { id: createdCityId });
assert.match(directory.root.innerHTML, /Test City, ТГ/);
directory.click({ action: 'toggle-directory-city', id: createdCityId });
assert.match(directory.root.innerHTML, /Город перемещён в архив/);
directory.click({ action: 'toggle-directory-city', id: createdCityId });
directory.click({ action: 'delete-directory-city', id: createdCityId });
assert.match(directory.root.innerHTML, /Удалить город без возможности восстановления/);
directory.click({ action: 'confirm-delete-directory-city', id: createdCityId });
assert.doesNotMatch(directory.root.innerHTML, /Тестоград/);

const archivedValue = loadPrototype('tour-operations.js', '#app');
archivedValue.click({ action: 'tour-menu' });
archivedValue.click({ action: 'open-directory' });
archivedValue.click({ action: 'open-directory-city', id: 'city-beijing' });
archivedValue.click({ action: 'toggle-directory-point', id: 'point-pkx' });
archivedValue.click({ action: 'close-overlay' });
archivedValue.click({ action: 'close-overlay' });
archivedValue.click({ action: 'edit-operation', members: 't1', group: 'solo-t1' });
assert.match(archivedValue.root.innerHTML, /Дасин \(PKX\)/, 'archived existing point is preserved and not overwritten');

// 0/1/multiple point rules and transport incompatibility.
const multiplePoints = loadPrototype('tour-operations.js', '#app');
multiplePoints.click({ action: 'add-stage' });
multiplePoints.click({ action: 'toggle-tourist', id: 't4' });
multiplePoints.click({ action: 'next-operation' });
multiplePoints.input({ field: 'transport' }, 'plane', 'change');
assert.match(multiplePoints.root.innerHTML, /Доступно в городе: 2 · Аэропорт/);
multiplePoints.click({ action: 'open-point-picker' });
assert.match(multiplePoints.root.innerHTML, /class="sheet-layer"/);
assert.match(multiplePoints.root.innerHTML, /Дасин/);
assert.match(multiplePoints.root.innerHTML, /Шоуду/);
multiplePoints.input({ pointSearch: '' }, 'ZZZ');
assert.match(multiplePoints.root.innerHTML, /Указать вручную/);
multiplePoints.click({ action: 'use-manual-point' });
assert.match(multiplePoints.root.innerHTML, /data-manual-point="true"/);

const onePoint = loadPrototype('tour-operations.js', '#app');
onePoint.click({ action: 'city', index: '1' });
onePoint.click({ action: 'stage', stage: 'departure' });
onePoint.click({ action: 'add-stage' });
onePoint.click({ action: 'toggle-tourist', id: 't1' });
onePoint.click({ action: 'next-operation' });
onePoint.input({ field: 'transport' }, 'train', 'change');
assert.match(onePoint.root.innerHTML, /Сиань Северный/);
assert.match(onePoint.root.innerHTML, /Подставлено из справочника/);

const noPoints = loadPrototype('tour-operations.js', '#app');
noPoints.click({ action: 'city', index: '2' });
noPoints.click({ action: 'stage', stage: 'departure' });
noPoints.click({ action: 'add-stage' });
noPoints.click({ action: 'toggle-tourist', id: 't1' });
noPoints.click({ action: 'next-operation' });
noPoints.input({ field: 'transport' }, 'bus', 'change');
assert.match(noPoints.root.innerHTML, /Указать вручную/);
assert.match(noPoints.root.innerHTML, /Не из справочника/);
noPoints.input({ field: 'point', manualPoint: 'true' }, 'Шанхайский автовокзал');
noPoints.click({ action: 'save-form' });
assert.match(noPoints.root.innerHTML, /Шанхайский автовокзал/);

const incompatiblePoint = loadPrototype('tour-operations.js', '#app');
incompatiblePoint.click({ action: 'edit-operation', members: 't1', group: 'solo-t1' });
assert.match(incompatiblePoint.root.innerHTML, /Дасин \(PKX\)/);
incompatiblePoint.input({ field: 'transport' }, 'train', 'change');
const changedPointForm = incompatiblePoint.root.innerHTML.slice(incompatiblePoint.root.innerHTML.indexOf('<div class="sheet-layer">'));
assert.doesNotMatch(changedPointForm, /Дасин \(PKX\)/);
assert.match(changedPointForm, /Пекин Западный/);

// A changed operation draft requires explicit discard confirmation.
const dirtyForm = loadPrototype('tour-operations.js', '#app');
dirtyForm.click({ action: 'add-stage' });
dirtyForm.click({ action: 'toggle-tourist', id: 't4' });
dirtyForm.click({ action: 'next-operation' });
dirtyForm.input({ field: 'time' }, '18:45');
dirtyForm.click({ action: 'close-overlay' });
assert.match(dirtyForm.root.innerHTML, /Закрыть без сохранения/);
dirtyForm.click({ action: 'continue-editing' });
assert.match(dirtyForm.root.innerHTML, /value="18:45"/);
dirtyForm.click({ action: 'close-overlay' });
dirtyForm.click({ action: 'discard-form' });
assert.doesNotMatch(dirtyForm.root.innerHTML, /Закрыть без сохранения/);

// The removed prototype section and all related requirement IDs are absent.
const forbiddenLabel = ['Фин', 'ансы'].join('');
const forbiddenId = ['FIN', '-'].join('');
const prototypeSource = fs.readFileSync('tour-operations.js', 'utf8') + fs.readFileSync('tour-operations.html', 'utf8');
const specMarkdown = fs.readFileSync('mobile-leads-tz.md', 'utf8');
const specHtml = fs.readFileSync('mobile-leads-tz.html', 'utf8');
assert.equal(prototypeSource.includes(forbiddenLabel), false);
assert.equal(prototypeSource.toLowerCase().includes('data-view="' + ['fin', 'ance'].join('') + '"'), false);
assert.equal(prototypeSource.includes("leadId: 'lead-1051'"), false, 'acceptance fixture contains exactly two lead IDs');
assert.equal(specMarkdown.includes(forbiddenId), false);
assert.equal(specHtml.includes(forbiddenId), false);

// Published HTML mirrors all canonical requirement and acceptance IDs.
const idPattern = /\b(?:IA|SUM|GROUP|DIR|API|AC|NG|BL)-\d+\b/g;
const markdownIds = [...new Set(specMarkdown.match(idPattern) || [])].sort();
const htmlIds = [...new Set(specHtml.match(idPattern) || [])].sort();
assert.deepEqual(htmlIds, markdownIds);
assert.equal(networkCalls, 0, 'full prototype scenario performs no network requests');

console.log('Prototype smoke test passed');
