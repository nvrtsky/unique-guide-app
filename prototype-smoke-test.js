const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

function loadPrototype(file, appSelector, search) {
  const listeners = {};
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
  const windowObject = {
    location: { search: search || '', href: '' },
    setTimeout() { return 1; },
    clearTimeout() {},
  };
  const context = {
    Blob,
    URL,
    URLSearchParams,
    console,
    document,
    window: windowObject,
    setTimeout: windowObject.setTimeout,
    clearTimeout: windowObject.clearTimeout,
  };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { filename: file });

  function click(dataset) {
    const button = { dataset, disabled: false };
    (listeners.click || []).forEach((handler) => handler({ target: { closest: () => button } }));
  }

  return { root, click };
}

const leads = loadPrototype('mobile-leads.js', '#app');
assert.match(leads.root.innerHTML, /Лиды/);
assert.match(leads.root.innerHTML, /Канбан/);
leads.click({ openLead: 'lead-1042' });
assert.match(leads.root.innerHTML, /Сводная по туру/);
leads.click({ detailTab: 'tourists' });
assert.match(leads.root.innerHTML, /Соколова Анна/);
leads.click({ editTourist: 't1' });
leads.click({ action: 'scan-passport' });
assert.match(leads.root.innerHTML, /72 4567890/, 'mock OCR value survives rerender');
leads.click({ action: 'back-list' });
leads.click({ action: 'filters' });
assert.match(leads.root.innerHTML, /Фильтры лидов/);

const linkedLead = loadPrototype('mobile-leads.js', '#app', '?lead=lead-1042');
assert.match(linkedLead.root.innerHTML, /Соколова Анна Игоревна/, 'lead deep-link opens its detail');

const tours = loadPrototype('tour-operations.js', '#app');
assert.match(tours.root.innerHTML, /Общие записи/);
tours.click({ action: 'add-stage' });
assert.match(tours.root.innerHTML, /Выберите туристов/);
tours.click({ action: 'toggle-tourist', id: 't1' });
tours.click({ action: 'toggle-tourist', id: 't2' });
tours.click({ action: 'next-operation' });
assert.match(tours.root.innerHTML, /Данные записи/);
tours.click({ action: 'save-form' });
assert.match(tours.root.innerHTML, /Сверка данных/);
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

tours.click({ action: 'toggle-scope' });
assert.match(tours.root.innerHTML, /Фильтр по лиду/);
tours.click({ action: 'select-scope', id: 'lead-1042' });
assert.match(tours.root.innerHTML, /Лид Соколовы/);
tours.click({ action: 'summary-mode', mode: 'matrix' });
assert.match(tours.root.innerHTML, /Сводная по туристам/);
tours.click({ action: 'toggle-scope' });
assert.match(tours.root.innerHTML, /Денис Волков/);
assert.match(tours.root.innerHTML, /coverage-cell unavailable/, 'restricted city is non-editable');
tours.click({ action: 'workspace', view: 'program' });
assert.match(tours.root.innerHTML, /Программа тура/);
tours.click({ action: 'clear-program' });
assert.match(tours.root.innerHTML, /Удалить все дни программы/);
tours.click({ action: 'close-overlay' });
tours.click({ action: 'nav', view: 'finance' });
assert.match(tours.root.innerHTML, /Плановая прибыль/);
tours.click({ action: 'open-tours' });
assert.match(tours.root.innerHTML, /Список, создание и архив/);
tours.click({ action: 'tour-filter', filter: 'draft' });
tours.click({ action: 'select-tour', id: 'japan' });
assert.match(tours.root.innerHTML, /Япония: сезон момидзи/);
assert.match(tours.root.innerHTML, /ЧЕРНОВИК/);

console.log('Prototype smoke test passed');
