(function () {
  'use strict';

  var root = document.getElementById('app');
  var groupCounter = 20;
  var toastTimer = null;

  var cities = [
    { id: 'beijing', name: 'Пекин', dates: '14–17 сен', arrival: '2026-09-14', departure: '2026-09-17' },
    { id: 'xian', name: 'Сиань', dates: '17–20 сен', arrival: '2026-09-17', departure: '2026-09-20' },
    { id: 'shanghai', name: 'Шанхай', dates: '20–24 сен', arrival: '2026-09-20', departure: '2026-09-24' }
  ];

  var tourists = [
    { id: 't1', name: 'Анна Соколова', initials: 'АС', lead: 'Лид Соколовы', groupId: 'family-sokolov' },
    { id: 't2', name: 'Илья Соколов', initials: 'ИС', lead: 'Лид Соколовы', groupId: 'family-sokolov' },
    { id: 't3', name: 'Марина Орлова', initials: 'МО', lead: 'Лид Орлова', groupId: null },
    { id: 't4', name: 'Денис Волков', initials: 'ДВ', lead: 'Лид Волков', groupId: null }
  ];

  var groupNames = {
    'family-sokolov': 'Соколовы'
  };

  var records = {
    beijing: {
      arrival: {
        t1: { date: '2026-09-14', time: '07:25', transport: 'plane', number: 'CZ 342', point: 'Дасин', transfer: 'Минивэн', groupId: 'arr-a' },
        t2: { date: '2026-09-14', time: '10:10', transport: 'plane', number: 'SU 204', point: 'Шоуду', transfer: 'Автобус', groupId: 'arr-b' },
        t3: { date: '2026-09-14', time: '10:10', transport: 'plane', number: 'SU 204', point: 'Шоуду', transfer: 'Автобус', groupId: 'arr-b' }
      },
      hotel: {
        t1: { name: 'Beijing Palace', room: 'Double', groupId: 'hotel-a' },
        t2: { name: 'Beijing Palace', room: 'Twin', groupId: 'hotel-b' },
        t3: { name: 'Hutong Garden', room: 'Single', groupId: 'hotel-c' }
      },
      departure: {
        t1: { date: '2026-09-17', time: '08:40', transport: 'train', number: 'G89', point: 'Beijing West', transfer: 'Минивэн', groupId: 'dep-a' },
        t2: { date: '2026-09-17', time: '08:40', transport: 'train', number: 'G89', point: 'Beijing West', transfer: 'Минивэн', groupId: 'dep-a' },
        t3: { date: '2026-09-17', time: '08:40', transport: 'train', number: 'G89', point: 'Beijing West', transfer: 'Минивэн', groupId: 'dep-a' }
      }
    },
    xian: {
      arrival: {
        t1: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Xi’an North', transfer: 'Автобус', groupId: 'arr-x1' },
        t2: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Xi’an North', transfer: 'Автобус', groupId: 'arr-x1' },
        t3: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Xi’an North', transfer: 'Автобус', groupId: 'arr-x1' }
      },
      hotel: {
        t1: { name: 'Grand Noble Xi’an', room: 'Double', groupId: 'hotel-x1' },
        t2: { name: 'Grand Noble Xi’an', room: 'Double', groupId: 'hotel-x1' },
        t3: { name: 'Grand Noble Xi’an', room: 'Single', groupId: 'hotel-x2' }
      },
      departure: {}
    },
    shanghai: {
      arrival: {},
      hotel: {},
      departure: {}
    }
  };

  var stageMeta = {
    arrival: {
      tab: 'Прибытие',
      heading: 'Рейсы прибытия',
      add: 'Добавить рейс',
      empty: 'Рейсы ещё не заполнены',
      saved: 'Рейс назначен туристам'
    },
    hotel: {
      tab: 'Отель',
      heading: 'Размещение',
      add: 'Добавить отель',
      empty: 'Отели ещё не заполнены',
      saved: 'Отель назначен туристам'
    },
    departure: {
      tab: 'Отъезд',
      heading: 'Рейсы и трансферы',
      add: 'Добавить отъезд',
      empty: 'Отъезды ещё не заполнены',
      saved: 'Отъезд назначен туристам'
    }
  };

  var fields = {
    arrival: [
      { key: 'date', label: 'Дата', type: 'date' },
      { key: 'time', label: 'Время', type: 'time' },
      { key: 'transport', label: 'Транспорт', type: 'select' },
      { key: 'number', label: 'Номер рейса / поезда', type: 'text', placeholder: 'Например, SU 204' },
      { key: 'point', label: 'Аэропорт / вокзал', type: 'text', placeholder: 'Место прибытия' },
      { key: 'transfer', label: 'Трансфер', type: 'text', placeholder: 'Машина, автобус или встреча' }
    ],
    hotel: [
      { key: 'name', label: 'Отель', type: 'text', placeholder: 'Название отеля' },
      { key: 'room', label: 'Тип номера', type: 'text', placeholder: 'Double, Twin, Single' }
    ],
    departure: [
      { key: 'date', label: 'Дата', type: 'date' },
      { key: 'time', label: 'Время', type: 'time' },
      { key: 'transport', label: 'Транспорт', type: 'select' },
      { key: 'number', label: 'Номер рейса / поезда', type: 'text', placeholder: 'Например, G89' },
      { key: 'point', label: 'Аэропорт / вокзал', type: 'text', placeholder: 'Место отправления' },
      { key: 'transfer', label: 'Трансфер', type: 'text', placeholder: 'Машина, автобус или проводы' }
    ]
  };

  var state = {
    view: 'operations',
    cityIndex: 0,
    stage: 'arrival',
    overlay: null,
    draft: null,
    toast: null
  };

  function h(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (symbol) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[symbol];
    });
  }

  function icon(name) {
    var paths = {
      back: '<path d="m15 18-6-6 6-6"/>',
      close: '<path d="M18 6 6 18M6 6l12 12"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      plane: '<path d="M22 2 9.4 14.6 4 13l-2 2 7 3 3 7 2-2-1.6-5.4L25 5z" transform="scale(.8)"/>',
      hotel: '<path d="M4 18V6a2 2 0 0 1 2-2h5v14M11 9h7a2 2 0 0 1 2 2v7M2 18h20M7 8h1M7 12h1"/>',
      train: '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M8 21l2-3m6 0 2 3M8 12h8M8 7h8"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      tours: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
      wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6M16 13h2"/>',
      chat: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
      more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      unlink: '<path d="m18 13 3 3-5 5-3-3M11 15l4-4M6 11l-3-3 5-5 3 3M13 9 9 13"/>',
      success: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>'
    };
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.more) + '</svg>';
  }

  function currentCity() {
    return cities[state.cityIndex];
  }

  function stageRecords(stage) {
    return records[currentCity().id][stage];
  }

  function touristById(id) {
    return tourists.find(function (tourist) { return tourist.id === id; });
  }

  function newGroupId(prefix) {
    groupCounter += 1;
    return prefix + '-' + groupCounter;
  }

  function blankRecord(stage) {
    var record = {};
    fields[stage].forEach(function (field) { record[field.key] = ''; });
    if (stage === 'arrival') record.date = currentCity().arrival;
    if (stage === 'departure') record.date = currentCity().departure;
    return record;
  }

  function cleanRecord(record, stage) {
    var clean = {};
    fields[stage].forEach(function (field) {
      clean[field.key] = record && record[field.key] ? String(record[field.key]) : '';
    });
    return clean;
  }

  function hasData(record, stage) {
    if (!record) return false;
    return fields[stage].some(function (field) { return Boolean(record[field.key]); });
  }

  function recordKey(record, stage) {
    return JSON.stringify(cleanRecord(record, stage));
  }

  function distinctSources(ids, stage) {
    var seen = {};
    var result = [];
    ids.forEach(function (id) {
      var record = stageRecords(stage)[id];
      if (!hasData(record, stage)) return;
      var key = recordKey(record, stage);
      if (!seen[key]) {
        seen[key] = true;
        result.push(id);
      }
    });
    return result;
  }

  function transportLabel(value) {
    return { plane: 'Самолёт', train: 'Поезд', bus: 'Автобус', car: 'Автомобиль' }[value] || 'Транспорт';
  }

  function shortDate(value) {
    if (!value) return 'Дата';
    var parts = value.split('-');
    var months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    return Number(parts[2]) + ' ' + months[Number(parts[1]) - 1];
  }

  function recordSummary(record, stage) {
    if (!hasData(record, stage)) return 'Не заполнено';
    if (stage === 'hotel') return (record.name || 'Отель') + (record.room ? ' · ' + record.room : '');
    return [record.number || transportLabel(record.transport), record.time, record.point].filter(Boolean).join(' · ');
  }

  function globalGroupLabel(tourist) {
    return tourist.groupId ? (groupNames[tourist.groupId] || 'Группа туристов') : 'Без группы';
  }

  function statusBar() {
    return '<div class="status-bar"><span>9:41</span><span class="status-icons">' +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 12h2V9H2zm4 0h2V6H6zm4 0h2V3h-2z" fill="currentColor"/></svg>' +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6.5a9 9 0 0 1 12 0M4.5 9a5.3 5.3 0 0 1 7 0M7 11.5a1.5 1.5 0 0 1 2 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<svg viewBox="0 0 20 10" aria-hidden="true"><rect x=".7" y=".7" width="16" height="8.6" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2.5" y="2.5" width="11" height="5" rx="1" fill="currentColor"/><path d="M18 3.2v3.6" stroke="currentColor" stroke-width="1.5"/></svg>' +
      '</span></div>';
  }

  function topBar(title, subtitle) {
    return '<div class="app-top"><div class="user-row"><span class="user-label">Мобильное приложение</span><span class="role-badge">Менеджер</span></div>' +
      '<div class="tour-row"><span class="tour-mark"></span><div class="tour-title"><strong>' + h(title) + '</strong><span>' + h(subtitle) + '</span></div>' +
      '<button type="button" class="icon-button" data-action="inert" aria-label="Дополнительные действия">' + icon('more') + '</button></div></div>';
  }

  function cityStrip() {
    return '<div class="city-strip" aria-label="Города тура">' + cities.map(function (city, index) {
      var chip = '<button type="button" class="city-chip ' + (state.cityIndex === index ? 'active' : '') + '" data-action="city" data-index="' + index + '">' +
        h(city.name) + '<small>' + h(city.dates) + '</small></button>';
      return chip + (index < cities.length - 1 ? '<span class="city-arrow"></span>' : '');
    }).join('') + '</div>';
  }

  function stageSwitch() {
    return '<div class="stage-wrap"><div class="segmented" role="tablist" aria-label="Логистика по городу">' +
      Object.keys(stageMeta).map(function (stage) {
        return '<button type="button" role="tab" aria-selected="' + (state.stage === stage) + '" class="' + (state.stage === stage ? 'active' : '') +
          '" data-action="stage" data-stage="' + stage + '">' + stageMeta[stage].tab + '</button>';
      }).join('') + '</div></div>';
  }

  function memberRow(tourist, note) {
    return '<div class="member"><span class="avatar">' + h(tourist.initials) + '</span><div class="member-copy"><strong>' + h(tourist.name) +
      '</strong><span>' + h(note || tourist.lead) + '</span></div><span class="lead-pill">' + h(globalGroupLabel(tourist)) + '</span></div>';
  }

  function groupStageRecords(stage) {
    var grouped = {};
    var free = [];
    tourists.forEach(function (tourist) {
      var record = stageRecords(stage)[tourist.id];
      if (!hasData(record, stage)) {
        free.push(tourist);
        return;
      }
      var groupId = record.groupId || 'solo-' + tourist.id;
      if (!grouped[groupId]) grouped[groupId] = { id: groupId, record: record, members: [] };
      grouped[groupId].members.push(tourist);
    });
    return { groups: Object.keys(grouped).map(function (id) { return grouped[id]; }), free: free };
  }

  function operationCard(group, index) {
    var record = group.record;
    var stage = state.stage;
    var isHotel = stage === 'hotel';
    var iconName = isHotel ? 'hotel' : (record.transport === 'train' ? 'train' : 'plane');
    var leftMain = isHotel ? '•' : (record.time || '—:—');
    var leftSub = isHotel ? (record.room || 'Номер') : shortDate(record.date);
    var primary = isHotel ? (record.name || 'Отель') : (record.number || transportLabel(record.transport));
    var secondary = isHotel ? 'Размещение · ' + (record.room || 'тип номера не указан') :
      [transportLabel(record.transport), record.point, record.transfer].filter(Boolean).join(' · ');
    var members = group.members.map(function (tourist) {
      return memberRow(tourist, tourist.lead);
    }).join('');
    var ids = group.members.map(function (tourist) { return tourist.id; }).join(',');
    var manageLabel = group.members.length > 1 ? 'Состав · ' + group.members.length : 'Объединить';
    return '<article class="operation-card" style="--group-color:' + ['#2f6bd8', '#6f52d9', '#1f8a50', '#a46c13'][index % 4] + '">' +
      '<div class="card-head"><div class="time-block"><strong>' + h(leftMain) + '</strong><span>' + h(leftSub) + '</span></div>' +
      '<div class="operation-main"><strong>' + icon(iconName) + h(primary) + '</strong><span>' + h(secondary || 'Детали не указаны') + '</span></div>' +
      '<span class="count-pill">' + group.members.length + '</span></div><div class="divider"></div>' + members +
      '<div class="card-actions"><button type="button" class="secondary-button" data-action="edit-operation" data-members="' + ids + '" data-group="' + h(group.id) + '">Изменить</button>' +
      '<button type="button" class="secondary-button" data-action="manage-operation" data-members="' + ids + '" data-group="' + h(group.id) + '">' + manageLabel + '</button></div></article>';
  }

  function operationsView() {
    var grouped = groupStageRecords(state.stage);
    var filled = tourists.length - grouped.free.length;
    var cards = grouped.groups.map(operationCard).join('');
    if (!cards) {
      cards = '<div class="empty-state">' + icon(state.stage === 'hotel' ? 'hotel' : 'plane') + '<strong>' + stageMeta[state.stage].empty +
        '</strong><span>Выберите туристов и заполните общую запись.</span></div>';
    }
    var free = '';
    if (grouped.free.length) {
      free = '<section class="free-card"><div class="section-row"><div class="section-copy"><strong>Без данных</strong><span>' +
        grouped.free.length + ' из ' + tourists.length + ' туристов</span></div><button type="button" class="text-button" data-action="add-stage">Заполнить</button></div>' +
        '<div class="free-list">' + grouped.free.map(function (tourist) { return memberRow(tourist, 'Нет записи для города'); }).join('') + '</div></section>';
    }
    return statusBar() + topBar('Гранд-тур по Китаю', '14–24 сентября · 4 туриста') + cityStrip() + stageSwitch() +
      '<main class="scroll"><div class="section-row"><div class="section-copy"><strong>' + stageMeta[state.stage].heading + '</strong><span>' +
      h(currentCity().name) + ' · ' + h(currentCity().dates) + '</span></div><button type="button" class="add-button" data-action="add-stage">' +
      icon('plus') + stageMeta[state.stage].add + '</button></div><div class="progress-card"><span>Заполнено для туристов</span><strong>' +
      filled + ' / ' + tourists.length + '</strong></div>' + cards + free + '</main>';
  }

  function touristGroups() {
    var map = {};
    var free = [];
    tourists.forEach(function (tourist) {
      if (!tourist.groupId) {
        free.push(tourist);
        return;
      }
      if (!map[tourist.groupId]) map[tourist.groupId] = [];
      map[tourist.groupId].push(tourist);
    });
    return { groups: map, free: free };
  }

  function touristsView() {
    var model = touristGroups();
    var groupCards = Object.keys(model.groups).map(function (groupId, index) {
      var members = model.groups[groupId];
      return '<article class="tourist-group" style="--group-color:' + ['#6f52d9', '#2f6bd8', '#1f8a50'][index % 3] + '">' +
        '<div class="tourist-group-head"><span class="group-stripe"></span><div><strong>' + h(groupNames[groupId] || 'Группа туристов') +
        '</strong><span>' + members.length + ' туриста · общие ячейки доступны в туре</span></div>' +
        '<button type="button" class="inline-action" data-action="split-tourist-group" data-group="' + h(groupId) + '">Разъединить</button></div>' +
        '<div class="divider"></div>' + members.map(function (tourist) { return memberRow(tourist, tourist.lead); }).join('') + '</article>';
    }).join('');
    var freeCard = '<section class="tourist-group"><div class="tourist-group-head"><span class="group-stripe" style="--group-color:#aab1ba"></span>' +
      '<div><strong>Без группы</strong><span>' + model.free.length + ' туриста</span></div></div><div class="divider"></div>' +
      (model.free.length ? model.free.map(function (tourist) { return memberRow(tourist, tourist.lead); }).join('') :
        '<div class="empty-state"><strong>Все туристы объединены</strong></div>') + '</section>';
    return statusBar() + topBar('Туристы', 'Гранд-тур по Китаю · 4 человека') +
      '<main class="scroll"><div class="tourists-toolbar"><h2>Группы туристов</h2><button type="button" class="add-button" data-action="start-tourist-group">' +
      icon('users') + 'Объединить</button></div><div class="form-note">Группа туристов общая для всего тура. Рейсы, отели и отъезды объединяются отдельно по каждому городу.</div>' +
      groupCards + freeCard + '</main>';
  }

  function bottomNav() {
    var items = [
      { id: 'operations', label: 'Туры', icon: 'tours' },
      { id: 'tourists', label: 'Туристы', icon: 'users' },
      { id: 'finance', label: 'Финансы', icon: 'wallet' },
      { id: 'chat', label: 'Чат', icon: 'chat' }
    ];
    return '<nav class="bottom-nav" aria-label="Основная навигация">' + items.map(function (item) {
      var active = (item.id === 'operations' && state.view === 'operations') || (item.id === 'tourists' && state.view === 'tourists');
      var action = item.id === 'operations' || item.id === 'tourists' ? 'nav' : 'inert';
      return '<button type="button" class="nav-item ' + (active ? 'active' : '') + '" data-action="' + action + '" data-view="' + item.id + '">' +
        icon(item.icon) + '<span>' + item.label + '</span></button>';
    }).join('') + '</nav>';
  }

  function screenHeader(title, subtitle) {
    return '<header class="screen-header"><button type="button" class="back-button" data-action="close-overlay" aria-label="Назад">' + icon('back') +
      '</button><div class="screen-title"><strong>' + h(title) + '</strong><span>' + h(subtitle) + '</span></div></header>';
  }

  function selectionRow(tourist, selected, note) {
    return '<button type="button" class="select-row ' + (selected ? 'selected' : '') + '" data-action="toggle-tourist" data-id="' + tourist.id + '">' +
      '<span class="check">' + icon('check') + '</span><span class="avatar">' + h(tourist.initials) + '</span><span class="select-copy"><strong>' +
      h(tourist.name) + '</strong><span>' + h(note) + '</span></span></button>';
  }

  function operationSelectionScreen(overlay) {
    var selected = overlay.selected;
    var rows = tourists.map(function (tourist) {
      var record = stageRecords(overlay.stage)[tourist.id];
      return selectionRow(tourist, selected.has(tourist.id), recordSummary(record, overlay.stage) + ' · ' + globalGroupLabel(tourist));
    }).join('');
    return '<section class="screen">' + screenHeader('Выберите туристов', currentCity().name + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="selection-head"><strong>Туристы тура</strong><button type="button" class="text-button" data-action="select-all">Выбрать всех</button></div>' +
      '<div class="form-note">Сначала выберите людей. На следующем шаге заполните одну запись для всех выбранных.</div>' + rows + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button>' +
      '<button type="button" class="primary-button blue" data-action="next-operation" ' + (selected.size ? '' : 'disabled') + '>Далее · ' + selected.size + '</button></footer></section>';
  }

  function touristGroupSelectionScreen(overlay) {
    var selected = overlay.selected;
    var rows = tourists.map(function (tourist) {
      return selectionRow(tourist, selected.has(tourist.id), globalGroupLabel(tourist) + ' · ' + tourist.lead);
    }).join('');
    return '<section class="screen">' + screenHeader('Объединить туристов', 'Одна группа на весь тур') +
      '<div class="screen-scroll"><div class="selection-head"><strong>Выберите минимум двоих</strong><span>' + selected.size + ' выбрано</span></div>' +
      '<div class="form-note">Можно создать новую группу или добавить свободных туристов в существующую. Две существующие группы не сливаются автоматически.</div>' +
      (overlay.error ? '<div class="error-note">' + h(overlay.error) + '</div>' : '') + rows + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button>' +
      '<button type="button" class="primary-button blue" data-action="apply-tourist-group" ' + (selected.size >= 2 ? '' : 'disabled') + '>Объединить · ' + selected.size + '</button></footer></section>';
  }

  function splitSelectionScreen(overlay, globalSplit) {
    var candidates = globalSplit ? tourists.filter(function (tourist) { return tourist.groupId === overlay.groupId; }) :
      overlay.members.map(touristById);
    var rows = candidates.map(function (tourist) {
      var note = globalSplit ? tourist.lead : recordSummary(stageRecords(overlay.stage)[tourist.id], overlay.stage);
      return selectionRow(tourist, overlay.selected.has(tourist.id), note);
    }).join('');
    var invalidAll = !globalSplit && overlay.selected.size >= candidates.length;
    var action = globalSplit ? 'apply-global-split' : 'apply-operation-split';
    var buttonLabel = globalSplit ? 'Убрать из группы' : 'Отделить от записи';
    return '<section class="screen">' + screenHeader(buttonLabel, globalSplit ? (groupNames[overlay.groupId] || 'Группа туристов') :
      currentCity().name + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="selection-head"><strong>Кого отделить</strong><span>' + overlay.selected.size + ' выбрано</span></div>' +
      '<div class="warning">' + (globalSplit ? 'Турист станет самостоятельным во всём туре. Его логистические данные сохранятся.' :
        'Запись будет разъединена только в этом городе и разделе. Заполненные данные сохранятся.') + '</div>' + rows +
      (invalidAll ? '<div class="error-note">Оставьте в исходной записи хотя бы одного туриста.</div>' : '') + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button>' +
      '<button type="button" class="danger-button" data-action="' + action + '" ' + (!overlay.selected.size || invalidAll ? 'disabled' : '') + '>' +
      buttonLabel + '</button></footer></section>';
  }

  function fieldControl(field, value) {
    if (field.type === 'select') {
      return '<label class="field"><span>' + h(field.label) + '</span><select data-field="' + field.key + '">' +
        '<option value="">Не выбран</option>' +
        ['plane', 'train', 'bus', 'car'].map(function (valueOption) {
          return '<option value="' + valueOption + '" ' + (value === valueOption ? 'selected' : '') + '>' + transportLabel(valueOption) + '</option>';
        }).join('') + '</select></label>';
    }
    return '<label class="field"><span>' + h(field.label) + '</span><input data-field="' + field.key + '" type="' + field.type +
      '" value="' + h(value) + '" placeholder="' + h(field.placeholder || '') + '"></label>';
  }

  function formSheet(overlay) {
    var sourceIds = distinctSources(overlay.members, overlay.stage);
    var sources = '';
    if (!overlay.editing && sourceIds.length) {
      sources = '<div class="selection-head"><strong>Взять данные за основу</strong><span>' + sourceIds.length + ' варианта</span></div>' +
        sourceIds.map(function (id) {
          var tourist = touristById(id);
          var active = overlay.sourceId === id;
          return '<button type="button" class="source-card ' + (active ? 'active' : '') + '" data-action="pick-source" data-id="' + id + '">' +
            '<span class="radio"></span><span class="avatar">' + h(tourist.initials) + '</span><span class="member-copy"><strong>' + h(tourist.name) +
            '</strong><span>' + h(recordSummary(stageRecords(overlay.stage)[id], overlay.stage)) + '</span></span></button>';
        }).join('') +
        '<button type="button" class="source-card ' + (overlay.sourceId === 'blank' ? 'active' : '') + '" data-action="pick-source" data-id="blank">' +
        '<span class="radio"></span><span class="avatar">+</span><span class="member-copy"><strong>Новая запись</strong><span>Заполнить с нуля</span></span></button>';
    }
    var controls = fields[overlay.stage].map(function (field) {
      return fieldControl(field, state.draft[field.key] || '');
    }).join('');
    var title = overlay.editing ? 'Изменить общую запись' : stageMeta[overlay.stage].add;
    var warning = sourceIds.length > 1 ? '<div class="warning">У выбранных туристов разные данные. Перед сохранением покажем экран сверки.</div>' : '';
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay" aria-label="Закрыть форму"></button>' +
      '<section class="sheet" aria-label="' + h(title) + '"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>' +
      h(title) + '</strong><span>' + overlay.members.length + ' туриста · ' + h(currentCity().name) + '</span></div>' +
      '<button type="button" class="close-button" data-action="close-overlay" aria-label="Закрыть">' + icon('close') + '</button></header>' +
      '<div class="sheet-scroll"><div class="form-note">Изменения применятся только к разделу «' + stageMeta[overlay.stage].tab +
      '» выбранного города.</div>' + warning + sources + '<div class="selection-head"><strong>Данные записи</strong></div>' + controls + '</div>' +
      '<footer class="sheet-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button>' +
      '<button type="button" class="primary-button blue" data-action="save-form">' + (sourceIds.length > 1 && !overlay.editing ? 'Проверить' : 'Сохранить') +
      '</button></footer></section></div>';
  }

  function conflictScreen(overlay) {
    var differing = fields[overlay.stage].filter(function (field) {
      var values = {};
      overlay.sources.forEach(function (id) {
        values[(stageRecords(overlay.stage)[id] || {})[field.key] || 'Не указано'] = true;
      });
      return Object.keys(values).length > 1;
    });
    var sourceCards = overlay.sources.map(function (id) {
      var tourist = touristById(id);
      var active = overlay.sourceId === id;
      return '<button type="button" class="source-card ' + (active ? 'active' : '') + '" data-action="pick-conflict-source" data-id="' + id + '">' +
        '<span class="radio"></span><span class="avatar">' + h(tourist.initials) + '</span><span class="member-copy"><strong>' + h(tourist.name) +
        '</strong><span>' + h(recordSummary(stageRecords(overlay.stage)[id], overlay.stage)) + '</span></span></button>';
    }).join('');
    var comparisons = differing.map(function (field) {
      return '<div class="conflict-field"><strong>' + h(field.label) + '</strong>' + overlay.sources.map(function (id) {
        var tourist = touristById(id);
        var value = (stageRecords(overlay.stage)[id] || {})[field.key] || 'Не указано';
        if (field.key === 'transport') value = transportLabel(value);
        return '<div class="conflict-value"><span>' + h(value) + '</span><span>' + h(tourist.name) + '</span></div>';
      }).join('') + '</div>';
    }).join('');
    return '<section class="screen">' + screenHeader('Сверка данных', currentCity().name + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="conflict-summary"><strong>Найдены разные записи</strong><span>Выберите туриста, чьи данные станут основными для всей новой группы.</span></div>' +
      '<div class="selection-head"><strong>Основная запись</strong><span>обязательно</span></div>' + sourceCards +
      '<div class="selection-head"><strong>Что отличается</strong><span>' + differing.length + ' поля</span></div>' + comparisons + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="back-to-form">Назад</button>' +
      '<button type="button" class="primary-button blue" data-action="apply-conflict" ' + (overlay.sourceId ? '' : 'disabled') + '>Применить ко всем</button></footer></section>';
  }

  function renderOverlay() {
    var overlay = state.overlay;
    if (!overlay) return '';
    if (overlay.kind === 'operation-select') return operationSelectionScreen(overlay);
    if (overlay.kind === 'tourist-group-select') return touristGroupSelectionScreen(overlay);
    if (overlay.kind === 'operation-split') return splitSelectionScreen(overlay, false);
    if (overlay.kind === 'global-split') return splitSelectionScreen(overlay, true);
    if (overlay.kind === 'form') return formSheet(overlay);
    if (overlay.kind === 'conflict') return conflictScreen(overlay);
    return '';
  }

  function render() {
    root.innerHTML = '<div class="app">' + (state.view === 'operations' ? operationsView() : touristsView()) +
      bottomNav() + renderOverlay() + (state.toast ? '<div class="toast">' + icon('success') + '<span>' + h(state.toast) + '</span></div>' : '') + '</div>';
  }

  function showToast(message) {
    state.toast = message;
    render();
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      state.toast = null;
      render();
    }, 2500);
  }

  function openOperationSelection(preselected) {
    state.overlay = {
      kind: 'operation-select',
      stage: state.stage,
      selected: new Set(preselected || [])
    };
    render();
  }

  function openForm(memberIds, editing, groupId) {
    var sourceIds = distinctSources(memberIds, state.stage);
    var sourceId = sourceIds[0] || 'blank';
    var sourceRecord = sourceId === 'blank' ? blankRecord(state.stage) : stageRecords(state.stage)[sourceId];
    state.draft = cleanRecord(sourceRecord, state.stage);
    state.overlay = {
      kind: 'form',
      stage: state.stage,
      members: memberIds.slice(),
      editing: Boolean(editing),
      groupId: groupId || null,
      sourceId: sourceId
    };
    render();
  }

  function applyStageRecord(memberIds, stage, values, existingGroupId) {
    var target = stageRecords(stage);
    var groupId = existingGroupId || newGroupId(stage);
    memberIds.forEach(function (id) {
      target[id] = Object.assign({}, cleanRecord(values, stage), { groupId: groupId });
    });
  }

  function applyTouristGrouping() {
    var selectedIds = Array.from(state.overlay.selected);
    var selectedTourists = selectedIds.map(touristById);
    var existingIds = Array.from(new Set(selectedTourists.map(function (tourist) { return tourist.groupId; }).filter(Boolean)));
    if (existingIds.length > 1) {
      state.overlay.error = 'Выбраны туристы из двух существующих групп. Сначала разъедините одну из них.';
      render();
      return;
    }
    if (existingIds.length === 1 && selectedTourists.every(function (tourist) { return tourist.groupId === existingIds[0]; })) {
      state.overlay = null;
      showToast('Эти туристы уже находятся в одной группе');
      return;
    }
    var groupId = existingIds[0] || newGroupId('tourists');
    if (!groupNames[groupId]) {
      var surnames = selectedTourists.map(function (tourist) { return tourist.name.split(' ').slice(-1)[0]; });
      groupNames[groupId] = surnames.slice(0, 2).join(' + ');
    }
    selectedTourists.forEach(function (tourist) { tourist.groupId = groupId; });
    state.overlay = null;
    state.view = 'tourists';
    showToast('Туристы объединены в группу');
  }

  root.addEventListener('input', function (event) {
    if (!state.overlay || state.overlay.kind !== 'form' || !event.target.dataset.field) return;
    state.draft[event.target.dataset.field] = event.target.value;
  });

  root.addEventListener('change', function (event) {
    if (!state.overlay || state.overlay.kind !== 'form' || !event.target.dataset.field) return;
    state.draft[event.target.dataset.field] = event.target.value;
  });

  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    var action = button.dataset.action;

    if (action === 'city') {
      state.cityIndex = Number(button.dataset.index);
      state.overlay = null;
      render();
      return;
    }
    if (action === 'stage') {
      state.stage = button.dataset.stage;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'nav') {
      state.view = button.dataset.view;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'inert') {
      showToast('Этот раздел не меняется в текущем прототипе');
      return;
    }
    if (action === 'add-stage') {
      openOperationSelection([]);
      return;
    }
    if (action === 'close-overlay') {
      state.overlay = null;
      state.draft = null;
      render();
      return;
    }
    if (action === 'toggle-tourist') {
      var selected = state.overlay.selected;
      var id = button.dataset.id;
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      if (state.overlay.error) state.overlay.error = null;
      render();
      return;
    }
    if (action === 'select-all') {
      tourists.forEach(function (tourist) { state.overlay.selected.add(tourist.id); });
      render();
      return;
    }
    if (action === 'next-operation') {
      openForm(Array.from(state.overlay.selected), false, null);
      return;
    }
    if (action === 'pick-source') {
      state.overlay.sourceId = button.dataset.id;
      state.draft = button.dataset.id === 'blank' ? blankRecord(state.overlay.stage) :
        cleanRecord(stageRecords(state.overlay.stage)[button.dataset.id], state.overlay.stage);
      render();
      return;
    }
    if (action === 'save-form') {
      var formOverlay = state.overlay;
      if (formOverlay.editing) {
        applyStageRecord(formOverlay.members, formOverlay.stage, state.draft, formOverlay.groupId);
        state.overlay = null;
        showToast('Общая запись обновлена');
        return;
      }
      var sources = distinctSources(formOverlay.members, formOverlay.stage);
      if (sources.length > 1) {
        state.overlay = {
          kind: 'conflict',
          stage: formOverlay.stage,
          members: formOverlay.members.slice(),
          sources: sources,
          sourceId: formOverlay.sourceId !== 'blank' ? formOverlay.sourceId : null,
          previousDraft: Object.assign({}, state.draft)
        };
        render();
        return;
      }
      applyStageRecord(formOverlay.members, formOverlay.stage, state.draft, null);
      state.overlay = null;
      showToast(stageMeta[formOverlay.stage].saved);
      return;
    }
    if (action === 'pick-conflict-source') {
      state.overlay.sourceId = button.dataset.id;
      render();
      return;
    }
    if (action === 'back-to-form') {
      var conflict = state.overlay;
      state.draft = Object.assign({}, conflict.previousDraft);
      state.overlay = {
        kind: 'form',
        stage: conflict.stage,
        members: conflict.members.slice(),
        editing: false,
        groupId: null,
        sourceId: conflict.sourceId || 'blank'
      };
      render();
      return;
    }
    if (action === 'apply-conflict') {
      var conflictOverlay = state.overlay;
      var source = stageRecords(conflictOverlay.stage)[conflictOverlay.sourceId];
      applyStageRecord(conflictOverlay.members, conflictOverlay.stage, source, null);
      state.overlay = null;
      showToast('Основная запись применена ко всем туристам');
      return;
    }
    if (action === 'edit-operation') {
      openForm(button.dataset.members.split(','), true, button.dataset.group);
      return;
    }
    if (action === 'manage-operation') {
      var memberIds = button.dataset.members.split(',');
      if (memberIds.length === 1) {
        openOperationSelection(memberIds);
      } else {
        state.overlay = {
          kind: 'operation-split',
          stage: state.stage,
          groupId: button.dataset.group,
          members: memberIds,
          selected: new Set()
        };
        render();
      }
      return;
    }
    if (action === 'apply-operation-split') {
      var splitOverlay = state.overlay;
      Array.from(splitOverlay.selected).forEach(function (touristId) {
        var existing = stageRecords(splitOverlay.stage)[touristId];
        stageRecords(splitOverlay.stage)[touristId] = Object.assign({}, existing, { groupId: newGroupId('solo') });
      });
      state.overlay = null;
      showToast('Туристы отделены, данные сохранены');
      return;
    }
    if (action === 'start-tourist-group') {
      state.overlay = { kind: 'tourist-group-select', selected: new Set(), error: null };
      render();
      return;
    }
    if (action === 'apply-tourist-group') {
      applyTouristGrouping();
      return;
    }
    if (action === 'split-tourist-group') {
      state.overlay = { kind: 'global-split', groupId: button.dataset.group, selected: new Set() };
      render();
      return;
    }
    if (action === 'apply-global-split') {
      var globalOverlay = state.overlay;
      Array.from(globalOverlay.selected).forEach(function (touristId) {
        touristById(touristId).groupId = null;
      });
      var remaining = tourists.filter(function (tourist) { return tourist.groupId === globalOverlay.groupId; });
      if (remaining.length < 2) remaining.forEach(function (tourist) { tourist.groupId = null; });
      state.overlay = null;
      showToast('Туристы разъединены, логистика сохранена');
    }
  });

  render();
}());
