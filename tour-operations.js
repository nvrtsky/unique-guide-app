(function () {
  'use strict';

  var root = document.getElementById('app');
  var groupCounter = 20;
  var toastTimer = null;

  var cities = [
    { id: 'beijing', name: 'Пекин', dates: '14–17 сен', arrival: '2026-09-14', departure: '2026-09-17' },
    { id: 'xian', name: 'Сиань', dates: '17–20 сен', arrival: '2026-09-17', departure: '2026-09-20' },
    { id: 'shanghai', name: 'Шанхай', dates: '20–24 сен', arrival: '2026-09-20', departure: '2026-09-24' },
    { id: 'beijing-return', name: 'Пекин', label: 'Пекин (2)', dates: '24–25 сен', arrival: '2026-09-24', departure: '2026-09-25' }
  ];

  var tourists = [
    { id: 't1', name: 'Анна Соколова', initials: 'АС', lead: 'Лид Соколовы', leadId: 'lead-1042', groupId: 'family-sokolov', route: ['beijing', 'xian', 'shanghai'], type: 'Взрослый', passport: '72 3456789', balance: 2600 },
    { id: 't2', name: 'Илья Соколов', initials: 'ИС', lead: 'Лид Соколовы', leadId: 'lead-1042', groupId: 'family-sokolov', route: ['beijing', 'xian', 'shanghai'], type: 'Взрослый', passport: '72 1122334', balance: 2600 },
    { id: 't3', name: 'Марина Орлова', initials: 'МО', lead: 'Лид Орлова', leadId: 'lead-1048', groupId: null, route: ['beijing', 'xian', 'shanghai', 'beijing-return'], type: 'Взрослый', passport: '72 9988776', balance: 4100 },
    { id: 't4', name: 'Денис Волков', initials: 'ДВ', lead: 'Лид Волков', leadId: 'lead-1051', groupId: null, route: ['beijing', 'shanghai'], type: 'Взрослый', passport: 'Не заполнен', balance: 3900 }
  ];

  var groupNames = {
    'family-sokolov': 'Соколовы'
  };

  var records = {
    beijing: {
      arrival: {
        t1: { date: '2026-09-14', time: '07:25', transport: 'plane', number: 'CZ 342', point: 'Дасин', transfer: 'Минивэн', groupId: 'arr-a' },
        t2: { date: '2026-09-14', time: '10:10', transport: 'plane', number: 'SU 204', point: 'Шоуду', transfer: 'Автобус', groupId: 'arr-b' },
        t3: { date: '2026-09-14', time: '10:10', transport: 'plane', number: 'SU 204', point: 'Шоуду', transfer: 'Автобус', groupId: 'arr-c' }
      },
      hotel: {
        t1: { name: 'Beijing Palace', room: 'Double', groupId: 'hotel-a' },
        t2: { name: 'Beijing Palace', room: 'Twin', groupId: 'hotel-b' },
        t3: { name: 'Hutong Garden', room: 'Single', groupId: 'hotel-c' }
      },
      departure: {
        t1: { date: '2026-09-17', time: '08:40', transport: 'train', number: 'G89', point: 'Beijing West', transfer: 'Минивэн', groupId: 'dep-a' },
        t2: { date: '2026-09-17', time: '08:40', transport: 'train', number: 'G89', point: 'Beijing West', transfer: 'Минивэн', groupId: 'dep-a' },
        t3: { date: '2026-09-17', time: '08:40', transport: 'train', number: 'G89', point: 'Beijing West', transfer: 'Минивэн', groupId: 'dep-c' }
      }
    },
    xian: {
      arrival: {
        t1: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Xi’an North', transfer: 'Автобус', groupId: 'arr-x1' },
        t2: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Xi’an North', transfer: 'Автобус', groupId: 'arr-x1' },
        t3: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Xi’an North', transfer: 'Автобус', groupId: 'arr-x2' }
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
    },
    'beijing-return': {
      arrival: {},
      hotel: {},
      departure: {}
    }
  };

  var operationGroups = {};
  Object.keys(records).forEach(function (cityId) {
    operationGroups[cityId] = { arrival: {}, hotel: {}, departure: {} };
    ['arrival', 'hotel', 'departure'].forEach(function (stage) {
      Object.keys(records[cityId][stage]).forEach(function (touristId) {
        var record = records[cityId][stage][touristId];
        var groupId = record.groupId;
        if (groupId) {
          if (!operationGroups[cityId][stage][groupId]) operationGroups[cityId][stage][groupId] = { id: groupId, masterId: touristId, members: [] };
          operationGroups[cityId][stage][groupId].members.push(touristId);
        }
        delete record.groupId;
      });
      Object.keys(operationGroups[cityId][stage]).forEach(function (groupId) {
        var group = operationGroups[cityId][stage][groupId];
        if (group.members.length < 2) {
          delete operationGroups[cityId][stage][groupId];
        } else {
          group.record = Object.assign({}, records[cityId][stage][group.masterId]);
          group.sourceId = group.masterId;
        }
      });
    });
  });

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

  var tours = [
    { id: 'china', name: 'Гранд-тур по Китаю', dates: '14–25 сен 2026', status: 'active', color: '#2f6bd8', tourists: 4, capacity: 12, price: '4 100 USD', route: 'Пекин → Сиань → Шанхай → Пекин', guides: 'Ли Вэй, Анна Ким', site: 'unique-travel.ru/china-grand' },
    { id: 'japan', name: 'Япония: сезон момидзи', dates: '8–18 ноя 2026', status: 'draft', color: '#7a5af0', tourists: 7, capacity: 10, price: '5 600 USD', route: 'Токио → Киото → Осака', guides: 'Юки Танака', site: 'unique-travel.ru/japan' },
    { id: 'italy', name: 'Италия для своих', dates: '4–12 июн 2026', status: 'archive', color: '#c98a1e', tourists: 9, capacity: 9, price: '3 800 EUR', route: 'Рим → Флоренция → Венеция', guides: 'Марко Росси', site: 'unique-travel.ru/italy' }
  ];

  var programDays = [
    { date: '14 сен', city: 'Пекин', title: 'Прилёт и знакомство', text: 'Встреча в аэропорту, размещение, вечерняя прогулка по хутунам.' },
    { date: '15 сен', city: 'Пекин', title: 'Императорский Пекин', text: 'Запретный город, парк Цзиншань и чайная церемония.' },
    { date: '16 сен', city: 'Пекин', title: 'Великая Китайская стена', text: 'Участок Мутяньюй, обед и свободный вечер.' }
  ];

  var expenses = [
    { id: 'e1', category: 'Транспорт', title: 'Минивэн из аэропорта', city: 'Пекин', amount: 240, currency: 'USD', scope: 'Общий' },
    { id: 'e2', category: 'Программа', title: 'Билеты в Запретный город', city: 'Пекин', amount: 960, currency: 'CNY', scope: '4 туриста' },
    { id: 'e3', category: 'Отель', title: 'Grand Noble Xi’an', city: 'Сиань', amount: 1380, currency: 'USD', scope: 'Общий' }
  ];

  var tourTasks = [
    { id: 'task1', title: 'Подтвердить минивэн в Пекине', date: '12 сен', done: false },
    { id: 'task2', title: 'Отправить гиду список паспортов', date: '13 сен', done: false },
    { id: 'task3', title: 'Проверить билеты G89', date: 'Готово', done: true }
  ];

  var state = {
    view: 'operations',
    summaryMode: 'groups',
    cityIndex: 0,
    stage: 'arrival',
    overlay: null,
    draft: null,
    toast: null,
    scopeLead: new URLSearchParams(window.location.search).get('lead') || null,
    tourFilter: 'active',
    tourQuery: '',
    expenseFilter: 'all',
    ocrDraft: null,
    selectedTourId: 'china'
  };

  function h(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (symbol) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[symbol];
    });
  }

  function csvCell(value) {
    return '"' + String(value == null ? '' : value).replace(/"/g, '""') + '"';
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
      leads: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
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

  function cityLabel(city) {
    return city.label || city.name;
  }

  function selectedTour() {
    return tours.find(function (tour) { return tour.id === state.selectedTourId; }) || tours[0];
  }

  function scopedTourists(includeUnavailable) {
    return tourists.filter(function (tourist) {
      var inScope = !state.scopeLead || tourist.leadId === state.scopeLead;
      var inRoute = includeUnavailable || tourist.route.indexOf(currentCity().id) !== -1;
      return inScope && inRoute;
    });
  }

  function stageRecords(stage) {
    return records[currentCity().id][stage];
  }

  function stageGroups(stage) {
    return operationGroups[currentCity().id][stage];
  }

  function operationGroupForAt(cityId, stage, touristId) {
    var groups = operationGroups[cityId][stage];
    var id = Object.keys(groups).find(function (groupId) { return groups[groupId].members.indexOf(touristId) !== -1; });
    return id ? groups[id] : null;
  }

  function operationGroupFor(stage, touristId) {
    return operationGroupForAt(currentCity().id, stage, touristId);
  }

  function effectiveRecord(stage, touristId) {
    return effectiveRecordAt(currentCity().id, stage, touristId);
  }

  function effectiveRecordAt(cityId, stage, touristId) {
    var group = operationGroupForAt(cityId, stage, touristId);
    return group ? group.record : records[cityId][stage][touristId];
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
      var group = operationGroupFor(stage, id);
      var sourceId = group ? group.sourceId : id;
      var record = group ? group.record : stageRecords(stage)[id];
      if (!hasData(record, stage)) return;
      var key = recordKey(record, stage);
      if (!seen[key]) {
        seen[key] = true;
        result.push(sourceId);
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
      '<div class="tour-row"><span class="tour-mark"></span><button type="button" class="tour-title tour-select" data-action="open-tours"><strong>' + h(title) + '</strong><span>' + h(subtitle) + '</span></button>' +
      '<button type="button" class="icon-button" data-action="tour-menu" aria-label="Настройки тура">' + icon('more') + '</button></div></div>';
  }

  function workspaceTabs() {
    var tabs = [
      { id: 'operations', label: 'Сводная' },
      { id: 'program', label: 'Программа' },
      { id: 'tour-info', label: 'О туре' },
      { id: 'tour-tasks', label: 'Задачи тура' }
    ];
    return '<div class="workspace-tabs">' + tabs.map(function (tab) {
      return '<button type="button" class="' + (state.view === tab.id ? 'active' : '') + '" data-action="workspace" data-view="' + tab.id + '">' + tab.label + '</button>';
    }).join('') + '</div>';
  }

  function cityStrip() {
    return '<div class="city-strip" aria-label="Города тура">' + cities.map(function (city, index) {
      var chip = '<button type="button" class="city-chip ' + (state.cityIndex === index ? 'active' : '') + '" data-action="city" data-index="' + index + '">' +
        h(cityLabel(city)) + '<small>' + h(city.dates) + '</small></button>';
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
    return '<div class="member member-link" role="button" tabindex="0" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar">' + h(tourist.initials) + '</span><div class="member-copy"><strong>' + h(tourist.name) +
      '</strong><span>' + h(note || tourist.lead) + '</span></div><span class="lead-pill">' + h(globalGroupLabel(tourist)) + '</span></div>';
  }

  function groupStageRecords(stage) {
    var grouped = {};
    var free = [];
    scopedTourists(false).forEach(function (tourist) {
      var group = operationGroupFor(stage, tourist.id);
      var record = effectiveRecord(stage, tourist.id);
      if (!hasData(record, stage)) {
        free.push(tourist);
        return;
      }
      var groupId = group ? group.id : 'solo-' + tourist.id;
      if (!grouped[groupId]) grouped[groupId] = { id: groupId, record: record, members: [], shared: Boolean(group) };
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
    var manageLabel = group.shared ? 'Состав · ' + group.members.length : 'Объединить';
    return '<article class="operation-card" style="--group-color:' + ['#2f6bd8', '#6f52d9', '#1f8a50', '#a46c13'][index % 4] + '">' +
      '<div class="card-head"><div class="time-block"><strong>' + h(leftMain) + '</strong><span>' + h(leftSub) + '</span></div>' +
      '<div class="operation-main"><strong>' + icon(iconName) + h(primary) + '</strong><span>' + h(secondary || 'Детали не указаны') + '</span></div>' +
      '<span class="count-pill">' + group.members.length + '</span></div><div class="divider"></div>' + members +
      '<div class="card-actions"><button type="button" class="secondary-button" data-action="edit-operation" data-members="' + ids + '" data-group="' + h(group.id) + '">Изменить</button>' +
      '<button type="button" class="secondary-button" data-action="manage-operation" data-members="' + ids + '" data-group="' + h(group.id) + '">' + manageLabel + '</button></div></article>';
  }

  function operationsView() {
    if (state.summaryMode === 'matrix') return matrixSummaryView();
    var grouped = groupStageRecords(state.stage);
    var available = scopedTourists(false);
    var filled = available.length - grouped.free.length;
    var cards = grouped.groups.map(operationCard).join('');
    if (!cards) {
      cards = '<div class="empty-state">' + icon(state.stage === 'hotel' ? 'hotel' : 'plane') + '<strong>' + stageMeta[state.stage].empty +
        '</strong><span>Выберите туристов и заполните общую запись.</span></div>';
    }
    var free = '';
    if (grouped.free.length) {
      free = '<section class="free-card"><div class="section-row"><div class="section-copy"><strong>Без данных</strong><span>' +
        grouped.free.length + ' из ' + available.length + ' туристов</span></div><button type="button" class="text-button" data-action="add-stage">Заполнить</button></div>' +
        '<div class="free-list">' + grouped.free.map(function (tourist) { return memberRow(tourist, 'Нет записи для города'); }).join('') + '</div></section>';
    }
    return statusBar() + topBar('Гранд-тур по Китаю', '14–25 сентября · 4 туриста') + workspaceTabs() + cityStrip() + stageSwitch() +
      '<main class="scroll">' + summaryTools() + '<div class="section-row"><div class="section-copy"><strong>' + stageMeta[state.stage].heading + '</strong><span>' +
      h(cityLabel(currentCity())) + ' · ' + h(currentCity().dates) + '</span></div><button type="button" class="add-button" data-action="add-stage">' +
      icon('plus') + stageMeta[state.stage].add + '</button></div><div class="progress-card"><span>Заполнено для туристов</span><strong>' +
      filled + ' / ' + available.length + '</strong></div>' + cards + free + '</main>';
  }

  function summaryTools() {
    var scopeName = state.scopeLead ? (tourists.find(function (tourist) { return tourist.leadId === state.scopeLead; }) || {}).lead : 'Фильтр по лиду';
    return '<div class="summary-tools"><div class="mini-switch"><button class="' + (state.summaryMode === 'groups' ? 'active' : '') + '" data-action="summary-mode" data-mode="groups">Общие записи</button><button class="' + (state.summaryMode === 'matrix' ? 'active' : '') + '" data-action="summary-mode" data-mode="matrix">Все туристы</button></div>' +
      '<button type="button" class="scope-chip ' + (state.scopeLead ? 'active' : '') + '" data-action="toggle-scope">' + h(scopeName || 'Этот лид') + '</button></div>';
  }

  function coverageCell(tourist, city, cityIndex, stage) {
    if (tourist.route.indexOf(city.id) === -1) return '<span class="coverage-cell unavailable">—</span>';
    var record = effectiveRecordAt(city.id, stage, tourist.id);
    var filled = hasData(record, stage);
    return '<button type="button" class="coverage-cell ' + (filled ? 'filled' : 'empty') + '" data-action="jump-cell" data-city="' + cityIndex + '" data-stage="' + stage + '" data-tourist="' + tourist.id + '" aria-label="' + h(cityLabel(city) + ' ' + stageMeta[stage].tab) + '">' + (filled ? '✓' : '+') + '</button>';
  }

  function matrixSummaryView() {
    var visible = state.scopeLead ? tourists.filter(function (tourist) { return tourist.leadId === state.scopeLead; }) : tourists;
    var rows = visible.map(function (tourist) {
      var cityRows = cities.map(function (city, cityIndex) {
        return '<div class="coverage-city"><span><strong>' + h(cityLabel(city)) + '</strong><small>' + h(city.dates) + '</small></span><div class="coverage-cells">' +
          coverageCell(tourist, city, cityIndex, 'arrival') + coverageCell(tourist, city, cityIndex, 'hotel') + coverageCell(tourist, city, cityIndex, 'departure') + '</div></div>';
      }).join('');
      return '<article class="coverage-card"><button type="button" class="coverage-person" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(tourist.lead + ' · ' + globalGroupLabel(tourist)) + '</small></span><b>›</b></button><div class="coverage-head"><span>Город</span><div><i>Рейс</i><i>Отель</i><i>Отъезд</i></div></div>' + cityRows + '</article>';
    }).join('');
    return statusBar() + topBar('Гранд-тур по Китаю', '14–25 сентября · 4 туриста') + workspaceTabs() +
      '<main class="scroll">' + summaryTools() + '<div class="tour-stats"><div><span>Мест</span><strong>4 / 12</strong></div><div><span>Подтверждено</span><strong>2</strong></div><div><span>Выручка</span><strong>16 300 $</strong></div></div><div class="section-row"><div class="section-copy"><strong>Сводная по туристам</strong><span>Три операции для каждого города</span></div><button type="button" class="text-button" data-action="export-summary">Excel</button></div>' + rows + '</main>';
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
    return statusBar() + topBar('Гранд-тур по Китаю', 'Туристы · 4 человека') + workspaceTabs() +
      '<main class="scroll"><div class="tourists-toolbar"><h2>Туристы и группы</h2><button type="button" class="add-button" data-action="start-tourist-group">' +
      icon('users') + 'Объединить</button></div><div class="tourist-actions"><button type="button" data-action="add-tourist">+ Турист</button><button type="button" data-action="export-summary">Excel</button><button type="button" data-action="bulk-tourists">Массово</button></div><div class="form-note">Группа туристов действует на весь тур. Общие записи рейса, отеля и отъезда создаются отдельно для каждого города.</div>' +
      groupCards + freeCard + '</main>';
  }

  function programView() {
    var days = programDays.map(function (day, index) {
      return '<article class="day-card"><div class="day-date"><strong>' + h(day.date) + '</strong><span>' + h(day.city) + '</span></div><div class="day-copy"><strong>' + h(day.title) + '</strong><p>' + h(day.text) + '</p></div><button type="button" class="inline-action" data-action="edit-program" data-index="' + index + '">Изменить</button></article>';
    }).join('');
    return statusBar() + topBar('Гранд-тур по Китаю', 'Программа · ' + programDays.length + ' дня заполнено') + workspaceTabs() +
      '<main class="scroll"><div class="section-row"><div class="section-copy"><strong>Программа тура</strong><span>По дням и городам маршрута</span></div><button type="button" class="add-button" data-action="add-program">' + icon('plus') + 'День</button></div><div class="tool-grid"><button data-action="generate-program"><strong>Сформировать</strong><span>Из шаблона маршрута</span></button><button data-action="regenerate-program"><strong>Обновить</strong><span>Сохранить ручные правки</span></button><button class="danger-tool" data-action="clear-program"><strong>Очистить</strong><span>Все дни программы</span></button></div>' + days + '</main>';
  }

  function financeView() {
    var participantRows = tourists.map(function (tourist) {
      return '<button type="button" class="finance-person" data-action="tourist-finance" data-id="' + tourist.id + '"><span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>Стоимость 4 100 USD · аванс ' + (4100 - tourist.balance) + ' USD</small></span><b>' + tourist.balance.toLocaleString('ru-RU') + ' $</b></button>';
    }).join('');
    var filteredExpenses = expenses.filter(function (expense) {
      if (state.expenseFilter === 'common') return expense.scope === 'Общий';
      if (state.expenseFilter === 'participant') return expense.scope.indexOf('турист') !== -1;
      if (state.expenseFilter === 'city') return expense.city && expense.scope !== 'Общий';
      return true;
    });
    var expenseRows = filteredExpenses.map(function (expense) {
      return '<button type="button" class="expense-row" data-action="edit-expense" data-id="' + expense.id + '"><span class="expense-icon">' + h(expense.category.slice(0, 1)) + '</span><span><strong>' + h(expense.title) + '</strong><small>' + h(expense.city + ' · ' + expense.scope) + '</small></span><b>' + h(expense.amount + ' ' + expense.currency) + '</b></button>';
    }).join('');
    return statusBar() + topBar('Гранд-тур по Китаю', 'Финансы · USD / CNY') + workspaceTabs() +
      '<main class="scroll"><div class="finance-hero"><span>Плановая прибыль</span><strong>8 940 USD</strong><div><span>Выручка <b>16 300</b></span><span>Расходы <b>7 360</b></span></div></div><div class="section-row"><div class="section-copy"><strong>Оплаты туристов</strong><span>Стоимость, аванс и остаток</span></div></div><section class="info-card finance-list">' + participantRows + '</section><div class="section-row"><div class="section-copy"><strong>Расходы тура</strong><span>Общие, по городу и участнику</span></div><button type="button" class="add-button" data-action="add-expense">' + icon('plus') + 'Расход</button></div><div class="expense-filters">' + [['all','Все'],['city','По городу'],['common','Общие'],['participant','Участник']].map(function (item) { return '<button class="' + (state.expenseFilter === item[0] ? 'active' : '') + '" data-action="expense-filter" data-filter="' + item[0] + '">' + item[1] + '</button>'; }).join('') + '</div><section class="info-card finance-list">' + (expenseRows || '<div class="empty-state"><strong>Расходов нет</strong><span>Измените фильтр.</span></div>') + '</section></main>';
  }

  function tourInfoView() {
    var tour = selectedTour();
    var statusLabel = { active: 'АКТИВНЫЙ ТУР', draft: 'ЧЕРНОВИК', archive: 'АРХИВ' }[tour.status] || 'ТУР';
    var description = tour.id === 'china' ? 'Авторский маршрут с четырьмя городскими остановками и повторным Пекином.' : 'Карточка тура открыта из общего мобильного списка. Сводная с демонстрационными данными заполнена для тура по Китаю.';
    return statusBar() + topBar(tour.name, 'Параметры и управление туром') + workspaceTabs() +
      '<main class="scroll"><div class="tour-cover" style="--tour-color:' + h(tour.color) + '"><span>' + h(statusLabel) + '</span><strong>' + h(tour.name) + '</strong><small>' + h(tour.dates) + '</small></div><section class="info-card details-card"><div><span>Маршрут</span><strong>' + h(tour.route) + '</strong></div><div><span>Гиды и сопровождающие</span><strong>' + h(tour.guides || 'Не назначены') + '</strong></div><div class="detail-pair"><span><small>Мест</small><strong>' + tour.tourists + ' / ' + tour.capacity + '</strong></span><span><small>Цена</small><strong>' + h(tour.price || 'Не указана') + '</strong></span></div><div><span>Администраторы чата</span><strong>Елена Воронова, Игорь Лебедев</strong></div><div><span>Страница тура</span><strong>' + h(tour.site || 'Не указана') + '</strong></div><div><span>Описание</span><strong>' + h(description) + '</strong></div></section><div class="management-grid"><button data-action="edit-tour"><strong>Изменить</strong><span>Маршрут, даты и команда</span></button><button data-action="copy-tour"><strong>Копировать</strong><span>Создать новый тур</span></button><button data-action="archive-tour"><strong>Архивировать</strong><span>Скрыть из активных</span></button><button class="danger-tool" data-action="cancel-tour"><strong>Отменить тур</strong><span>Нужна причина</span></button></div></main>';
  }

  function tourTasksView() {
    var rows = tourTasks.map(function (task, index) {
      return '<button type="button" class="tour-task ' + (task.done ? 'done' : '') + '" data-action="toggle-tour-task" data-index="' + index + '"><span class="task-check">' + (task.done ? icon('check') : '') + '</span><span><strong>' + h(task.title) + '</strong><small>' + h(task.date) + '</small></span></button>';
    }).join('');
    return statusBar() + topBar('Гранд-тур по Китаю', 'Задачи текущего тура') + workspaceTabs() +
      '<main class="scroll"><div class="section-row"><div class="section-copy"><strong>Задачи тура</strong><span>Не заменяют общий раздел CRM-задач</span></div><button type="button" class="add-button" data-action="add-tour-task">' + icon('plus') + 'Задача</button></div><div class="form-note">Здесь показаны только задачи выбранного тура. Полноценный общий раздел задач зафиксирован в бэклоге.</div><section class="info-card task-list">' + rows + '</section></main>';
  }

  function bottomNav() {
    var items = [
      { id: 'operations', label: 'Задачи', icon: 'tours' },
      { id: 'tourists', label: 'Туристы', icon: 'users' },
      { id: 'finance', label: 'Финансы', icon: 'wallet' },
      { id: 'leads', label: 'Лиды', icon: 'leads' }
    ];
    return '<nav class="bottom-nav" aria-label="Основная навигация">' + items.map(function (item) {
      var taskViews = ['operations', 'program', 'tour-info', 'tour-tasks'];
      var active = (item.id === 'operations' && taskViews.indexOf(state.view) !== -1) || item.id === state.view;
      var action = item.id === 'leads' ? 'open-leads' : 'nav';
      return '<button type="button" class="nav-item ' + (active ? 'active' : '') + '" data-action="' + action + '" data-view="' + item.id + '">' +
        icon(item.icon) + '<span>' + item.label + '</span></button>';
    }).join('') + '</nav>';
  }

  function screenHeader(title, subtitle) {
    return '<header class="screen-header"><button type="button" class="back-button" data-action="close-overlay" aria-label="Назад">' + icon('back') +
      '</button><div class="screen-title"><strong>' + h(title) + '</strong><span>' + h(subtitle) + '</span></div></header>';
  }

  function selectionRow(tourist, selected, note, disabled) {
    return '<button type="button" class="select-row ' + (selected ? 'selected' : '') + (disabled ? ' disabled' : '') + '" data-action="toggle-tourist" data-id="' + tourist.id + '" ' + (disabled ? 'disabled' : '') + '>' +
      '<span class="check">' + icon('check') + '</span><span class="avatar">' + h(tourist.initials) + '</span><span class="select-copy"><strong>' +
      h(tourist.name) + '</strong><span>' + h(note) + '</span></span></button>';
  }

  function operationSelectionScreen(overlay) {
    var selected = overlay.selected;
    var rows = scopedTourists(true).map(function (tourist) {
      var record = effectiveRecord(overlay.stage, tourist.id);
      var unavailable = tourist.route.indexOf(currentCity().id) === -1;
      var note = unavailable ? 'Город не входит в маршрут туриста' : recordSummary(record, overlay.stage) + ' · ' + globalGroupLabel(tourist);
      return selectionRow(tourist, selected.has(tourist.id), note, unavailable);
    }).join('');
    return '<section class="screen">' + screenHeader('Выберите туристов', cityLabel(currentCity()) + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="selection-head"><strong>Туристы тура</strong><button type="button" class="text-button" data-action="select-all">Выбрать всех</button></div>' +
      '<div class="form-note">Сначала выберите людей одной группы туристов. На следующем шаге заполните одну запись для всех выбранных.</div>' + (overlay.error ? '<div class="error-note">' + h(overlay.error) + '</div>' : '') + rows + '</div>' +
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
      var note = globalSplit ? tourist.lead : recordSummary(effectiveRecord(overlay.stage, tourist.id), overlay.stage);
      return selectionRow(tourist, overlay.selected.has(tourist.id), note);
    }).join('');
    var action = globalSplit ? 'apply-global-split' : 'apply-operation-split';
    var allSelected = candidates.length > 0 && overlay.selected.size === candidates.length;
    var buttonLabel = globalSplit ? (allSelected ? 'Расформировать группу' : 'Убрать из группы') : (allSelected ? 'Расформировать запись' : 'Отделить от записи');
    return '<section class="screen">' + screenHeader(buttonLabel, globalSplit ? (groupNames[overlay.groupId] || 'Группа туристов') :
      cityLabel(currentCity()) + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="selection-head"><strong>Кого отделить</strong><span>' + overlay.selected.size + ' выбрано</span></div>' +
      '<div class="warning">' + (globalSplit ? 'Турист станет самостоятельным во всём туре. Его логистические данные сохранятся.' :
        'Запись будет разъединена только в этом городе и разделе. Индивидуальные данные снова станут видимыми.') + '</div>' + rows + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button>' +
      '<button type="button" class="danger-button" data-action="' + action + '" ' + (!overlay.selected.size ? 'disabled' : '') + '>' +
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
            '</strong><span>' + h(recordSummary(effectiveRecord(overlay.stage, id), overlay.stage)) + '</span></span></button>';
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
      h(title) + '</strong><span>' + overlay.members.length + ' туриста · ' + h(cityLabel(currentCity())) + '</span></div>' +
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
        values[(effectiveRecord(overlay.stage, id) || {})[field.key] || 'Не указано'] = true;
      });
      return Object.keys(values).length > 1;
    });
    var sourceCards = overlay.sources.map(function (id) {
      var tourist = touristById(id);
      var active = overlay.sourceId === id;
      return '<button type="button" class="source-card ' + (active ? 'active' : '') + '" data-action="pick-conflict-source" data-id="' + id + '">' +
        '<span class="radio"></span><span class="avatar">' + h(tourist.initials) + '</span><span class="member-copy"><strong>' + h(tourist.name) +
        '</strong><span>' + h(recordSummary(effectiveRecord(overlay.stage, id), overlay.stage)) + '</span></span></button>';
    }).join('');
    var comparisons = differing.map(function (field) {
      return '<div class="conflict-field"><strong>' + h(field.label) + '</strong>' + overlay.sources.map(function (id) {
        var tourist = touristById(id);
        var value = (effectiveRecord(overlay.stage, id) || {})[field.key] || 'Не указано';
        if (field.key === 'transport') value = transportLabel(value);
        return '<div class="conflict-value"><span>' + h(value) + '</span><span>' + h(tourist.name) + '</span></div>';
      }).join('') + '</div>';
    }).join('');
    return '<section class="screen">' + screenHeader('Сверка данных', cityLabel(currentCity()) + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="conflict-summary"><strong>Найдены разные записи</strong><span>Выберите туриста, чьи данные станут основными для всей новой группы.</span></div>' +
      '<div class="selection-head"><strong>Основная запись</strong><span>обязательно</span></div>' + sourceCards +
      '<div class="selection-head"><strong>Что отличается</strong><span>' + differing.length + ' поля</span></div>' + comparisons + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="back-to-form">Назад</button>' +
      '<button type="button" class="primary-button blue" data-action="apply-conflict" ' + (overlay.sourceId ? '' : 'disabled') + '>Применить ко всем</button></footer></section>';
  }

  function toursScreen(overlay) {
    var labels = { active: 'Активные', draft: 'Черновики', archive: 'Архив' };
    var query = state.tourQuery.trim().toLowerCase();
    var filtered = tours.filter(function (tour) { return tour.status === state.tourFilter && (!query || [tour.name, tour.route, tour.guides].join(' ').toLowerCase().indexOf(query) !== -1); });
    var cards = filtered.map(function (tour) {
      return '<article class="tour-list-card" style="--tour-color:' + h(tour.color) + '"><button type="button" data-action="select-tour" data-id="' + tour.id + '"><span class="tour-list-state">' + h(labels[tour.status]) + '</span><strong>' + h(tour.name) + '</strong><small>' + h(tour.dates + ' · ' + tour.route) + '</small><div><span>' + tour.tourists + ' / ' + tour.capacity + ' мест</span><span>' + h(tour.price) + '</span></div></button><button type="button" class="card-more" data-action="tour-card-menu" data-id="' + tour.id + '">' + icon('more') + '</button></article>';
    }).join('');
    return '<section class="screen">' + screenHeader('Туры', 'Список, создание и архив') + '<div class="screen-scroll"><div class="filter-tabs">' + Object.keys(labels).map(function (status) {
      return '<button type="button" class="' + (state.tourFilter === status ? 'active' : '') + '" data-action="tour-filter" data-filter="' + status + '">' + labels[status] + '</button>';
    }).join('') + '</div><label class="search-box"><span>⌕</span><input data-tour-search value="' + h(state.tourQuery) + '" placeholder="Название, город или гид"></label><div class="tour-stats compact-stats"><div><span>Туров</span><strong>' + filtered.length + '</strong></div><div><span>Туристов</span><strong>' + filtered.reduce(function (sum, tour) { return sum + tour.tourists; }, 0) + '</strong></div><div><span>Свободно</span><strong>' + filtered.reduce(function (sum, tour) { return sum + tour.capacity - tour.tourists; }, 0) + '</strong></div></div>' + (cards || '<div class="empty-state"><strong>Туров нет</strong><span>Измените фильтр или создайте новый.</span></div>') + '</div><footer class="screen-actions single"><button type="button" class="primary-button" data-action="new-tour">+ Создать тур</button></footer></section>';
  }

  function tourMenuScreen(overlay) {
    var tour = tours.find(function (item) { return item.id === (overlay.tourId || state.selectedTourId); }) || tours[0];
    return '<section class="screen">' + screenHeader('Действия с туром', tour.name) + '<div class="screen-scroll"><div class="action-menu"><button data-action="edit-tour"><span>✎</span><div><strong>Изменить тур</strong><small>Маршрут, даты, команда и цена</small></div><b>›</b></button><button data-action="copy-tour"><span>⧉</span><div><strong>Копировать</strong><small>Создать тур с теми же настройками</small></div><b>›</b></button><button data-action="archive-tour"><span>□</span><div><strong>Архивировать</strong><small>Скрыть из активных туров</small></div><b>›</b></button><button class="danger-row" data-action="cancel-tour"><span>×</span><div><strong>Отменить тур</strong><small>Сохранить данные и указать причину</small></div><b>›</b></button></div></div></section>';
  }

  function touristDetailScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    var routeNames = cities.filter(function (city) { return tourist.route.indexOf(city.id) !== -1; }).map(cityLabel).join(' → ');
    return '<section class="screen">' + screenHeader(tourist.name, tourist.lead) + '<div class="screen-scroll"><div class="person-hero"><span class="avatar dark">' + h(tourist.initials) + '</span><div><strong>' + h(tourist.name) + '</strong><span>' + h(tourist.type + ' · ' + globalGroupLabel(tourist)) + '</span></div></div><section class="info-card details-card"><div><span>Загранпаспорт</span><strong>' + h(tourist.passport) + '</strong></div><div><span>Маршрут туриста</span><strong>' + h(routeNames) + '</strong></div><div><span>Исходный лид</span><strong>' + h(tourist.lead) + '</strong></div><div><span>Остаток оплаты</span><strong>' + tourist.balance.toLocaleString('ru-RU') + ' USD</strong></div></section><button type="button" class="scan-card" data-action="scan-tourist-passport"><span>▣</span><div><strong>Сканировать паспорт</strong><small>Mock OCR заполнит номер документа</small></div><b>›</b></button><div class="management-grid"><button data-action="edit-tourist" data-id="' + tourist.id + '"><strong>Изменить</strong><span>Данные и маршрут</span></button><button data-action="open-source-lead" data-id="' + tourist.leadId + '"><strong>Открыть лид</strong><span>' + h(tourist.lead) + '</span></button><button class="danger-tool" data-action="delete-tourist"><strong>Удалить</strong><span>Только администратор</span></button></div></div></section>';
  }

  function bulkTouristsScreen(overlay) {
    var rows = tourists.map(function (tourist) {
      return selectionRow(tourist, overlay.selected.has(tourist.id), tourist.lead + ' · ' + globalGroupLabel(tourist));
    }).join('');
    return '<section class="screen">' + screenHeader('Массовые действия', 'Туристы текущего тура') + '<div class="screen-scroll"><div class="selection-head"><strong>Выбрано ' + overlay.selected.size + '</strong><button type="button" class="text-button" data-action="select-all">Выбрать всех</button></div>' + rows + '<div class="warning">Массовое удаление доступно только администратору. Экспорт и создание группы доступны менеджеру.</div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="export-summary">Экспорт</button><button type="button" class="primary-button blue" data-action="bulk-group" ' + (overlay.selected.size > 1 ? '' : 'disabled') + '>Создать группу</button></footer></section>';
  }

  function scopeSelectScreen() {
    var seen = {};
    var options = tourists.filter(function (tourist) {
      if (seen[tourist.leadId]) return false;
      seen[tourist.leadId] = true;
      return true;
    }).map(function (tourist) {
      var count = tourists.filter(function (item) { return item.leadId === tourist.leadId; }).length;
      return '<button type="button" class="source-card" data-action="select-scope" data-id="' + tourist.leadId + '"><span class="avatar">' + h(tourist.initials) + '</span><span class="member-copy"><strong>' + h(tourist.lead) + '</strong><span>' + count + ' туриста в туре</span></span><b>›</b></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Фильтр по лиду', 'Сводная останется общей для тура') + '<div class="screen-scroll"><div class="form-note">Выберите лид, участников которого нужно показать. Кнопка «Весь тур» вернёт полный состав.</div>' + options + '</div></section>';
  }

  function clearProgramScreen() {
    return '<section class="screen">' + screenHeader('Очистить программу', 'Необратимое действие в прототипе') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Удалить все дни программы?</strong><span>Маршрут, туристы и логистика не изменятся. Отмена закроет экран без изменений.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="danger-button" data-action="confirm-clear-program">Очистить</button></footer></section>';
  }

  function cancelTourScreen(overlay) {
    var tour = tours.find(function (item) { return item.id === overlay.tourId; }) || selectedTour();
    return '<section class="screen"><form id="cancel-tour-form" class="screen-form" data-id="' + h(tour.id) + '">' + screenHeader('Отменить тур', tour.name) + '<div class="screen-scroll"><div class="conflict-summary"><strong>Тур будет перенесён в архив</strong><span>Данные туристов, платежей и логистики сохранятся.</span></div><label class="field"><span>Причина отмены *</span><textarea name="reason" rows="5" required placeholder="Укажите причину для истории изменений"></textarea></label></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Назад</button><button type="submit" class="danger-button">Подтвердить отмену</button></footer></form></section>';
  }

  function simpleField(label, name, value, type, placeholder) {
    return '<label class="field"><span>' + h(label) + '</span><input name="' + h(name) + '" type="' + h(type || 'text') + '" value="' + h(value || '') + '" placeholder="' + h(placeholder || '') + '"></label>';
  }

  function programFormScreen(overlay) {
    var day = overlay.index == null ? { date: '26 сен', city: 'Пекин (2)', title: '', text: '' } : programDays[overlay.index];
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><form id="program-form" class="sheet" data-index="' + (overlay.index == null ? '' : overlay.index) + '"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>' + (overlay.index == null ? 'Новый день' : 'Изменить день') + '</strong><span>Программа тура</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll"><div class="field-grid">' + simpleField('Дата', 'date', day.date) + simpleField('Город', 'city', day.city) + '</div>' + simpleField('Название', 'title', day.title, 'text', 'Событие дня') + '<label class="field"><span>Описание</span><textarea name="text" rows="5">' + h(day.text) + '</textarea></label></div><footer class="sheet-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></div>';
  }

  function expenseFormScreen(overlay) {
    var expense = expenses.find(function (item) { return item.id === overlay.expenseId; }) || { category: 'Транспорт', title: '', city: cityLabel(currentCity()), amount: '', currency: 'USD', scope: 'Общий' };
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><form id="expense-form" class="sheet" data-id="' + h(expense.id || '') + '"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>' + (expense.id ? 'Изменить расход' : 'Новый расход') + '</strong><span>Общий, по городу или участнику</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll"><label class="field"><span>Категория</span><select name="category"><option>Транспорт</option><option>Отель</option><option>Программа</option><option>Другое</option></select></label>' + simpleField('Название', 'title', expense.title, 'text', 'Описание расхода') + '<div class="field-grid">' + simpleField('Город', 'city', expense.city) + simpleField('Область', 'scope', expense.scope) + '</div><div class="field-grid">' + simpleField('Сумма', 'amount', expense.amount, 'number') + simpleField('Валюта', 'currency', expense.currency) + '</div>' + simpleField('Комментарий', 'comment', expense.comment || '') + '</div><footer class="sheet-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></div>';
  }

  function tourFormScreen(overlay) {
    var tour = overlay.tourId ? tours.find(function (item) { return item.id === overlay.tourId; }) : null;
    var item = tour || { name: '', dates: '', route: '', guides: '', capacity: 12, price: '', color: '#2f6bd8', site: '' };
    return '<section class="screen"><form id="tour-form" class="screen-form" data-id="' + h(tour ? tour.id : '') + '">' + screenHeader(tour ? 'Изменить тур' : 'Новый тур', 'Все поля desktop-карточки') + '<div class="screen-scroll">' + simpleField('Название', 'name', item.name) + '<div class="field-grid">' + simpleField('Даты', 'dates', item.dates) + simpleField('Мест', 'capacity', item.capacity, 'number') + '</div>' + simpleField('Маршрут и порядок городов', 'route', item.route) + simpleField('Гиды и сопровождающие', 'guides', item.guides) + '<div class="field-grid">' + simpleField('Цена и валюта', 'price', item.price) + simpleField('Цвет', 'color', item.color, 'color') + '</div>' + simpleField('Страница тура', 'site', item.site) + '<label class="field"><span>Описание</span><textarea name="description" rows="4">Авторский тур UNIQUE</textarea></label><div class="form-note">Администраторы чата, порядок маршрута и доступы сохраняются вместе с туром.</div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
  }

  function touristFormScreen(overlay) {
    var tourist = overlay.touristId ? touristById(overlay.touristId) : null;
    var base = tourist || { name: '', passport: '', type: 'Взрослый', lead: 'Новый лид', route: cities.map(function (city) { return city.id; }) };
    var item = Object.assign({}, base, state.ocrDraft || {});
    var route = cities.filter(function (city) { return item.route.indexOf(city.id) !== -1; }).map(cityLabel).join(', ');
    return '<section class="screen"><form id="tourist-data-form" class="screen-form" data-id="' + h(tourist ? tourist.id : '') + '">' + screenHeader(tourist ? 'Изменить туриста' : 'Новый турист', 'Данные участника тура') + '<div class="screen-scroll">' + simpleField('Фамилия и имя', 'name', item.name) + '<div class="field-grid">' + simpleField('Тип', 'type', item.type) + simpleField('Загранпаспорт', 'passport', item.passport) + '</div>' + simpleField('Исходный лид', 'lead', item.lead) + simpleField('Города маршрута', 'route', route) + '<button type="button" class="scan-card" data-action="scan-form-passport"><span>▣</span><div><strong>Распознать паспорт</strong><small>Заполнить номер и проверить вручную</small></div><b>›</b></button><label class="field"><span>Примечание</span><textarea name="note" rows="4"></textarea></label></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
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
    if (overlay.kind === 'tours') return toursScreen(overlay);
    if (overlay.kind === 'tour-menu') return tourMenuScreen(overlay);
    if (overlay.kind === 'tourist-detail') return touristDetailScreen(overlay);
    if (overlay.kind === 'bulk-tourists') return bulkTouristsScreen(overlay);
    if (overlay.kind === 'scope-select') return scopeSelectScreen();
    if (overlay.kind === 'clear-program') return clearProgramScreen();
    if (overlay.kind === 'cancel-tour') return cancelTourScreen(overlay);
    if (overlay.kind === 'program-form') return programFormScreen(overlay);
    if (overlay.kind === 'expense-form') return expenseFormScreen(overlay);
    if (overlay.kind === 'tour-form') return tourFormScreen(overlay);
    if (overlay.kind === 'tourist-form') return touristFormScreen(overlay);
    return '';
  }

  function render() {
    var views = {
      operations: operationsView,
      tourists: touristsView,
      program: programView,
      finance: financeView,
      'tour-info': tourInfoView,
      'tour-tasks': tourTasksView
    };
    var view = views[state.view] || operationsView;
    root.innerHTML = '<div class="app">' + view() +
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
    var sourceRecord = sourceId === 'blank' ? blankRecord(state.stage) : effectiveRecord(state.stage, sourceId);
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

  function detachMembersFromStage(stage, memberIds) {
    var groups = stageGroups(stage);
    Object.keys(groups).forEach(function (groupId) {
      var group = groups[groupId];
      group.members = group.members.filter(function (id) { return memberIds.indexOf(id) === -1; });
      if (group.members.length < 2) {
        delete groups[groupId];
      } else if (group.members.indexOf(group.masterId) === -1) {
        group.masterId = group.members[0];
      }
    });
  }

  function detachMembersFromAllOperations(memberIds) {
    Object.keys(operationGroups).forEach(function (cityId) {
      ['arrival', 'hotel', 'departure'].forEach(function (stage) {
        var groups = operationGroups[cityId][stage];
        Object.keys(groups).forEach(function (groupId) {
          var group = groups[groupId];
          group.members = group.members.filter(function (id) { return memberIds.indexOf(id) === -1; });
          if (group.members.length < 2) delete groups[groupId];
          else if (group.members.indexOf(group.masterId) === -1) group.masterId = group.members[0];
        });
      });
    });
  }

  function applyStageRecord(memberIds, stage, values, existingGroupId, requestedMasterId) {
    var target = stageRecords(stage);
    var groups = stageGroups(stage);
    var existingGroup = existingGroupId ? groups[existingGroupId] : null;
    var appliedMembers = memberIds.slice();
    if (existingGroup) {
      existingGroup.record = cleanRecord(values, stage);
      appliedMembers = existingGroup.members.slice();
    } else if (memberIds.length === 1) {
      detachMembersFromStage(stage, memberIds);
      target[memberIds[0]] = cleanRecord(values, stage);
    } else {
      detachMembersFromStage(stage, memberIds);
      var masterId = memberIds.indexOf(requestedMasterId) !== -1 ? requestedMasterId : memberIds[0];
      var groupId = newGroupId(stage);
      groups[groupId] = { id: groupId, masterId: masterId, sourceId: masterId, members: memberIds.slice(), record: cleanRecord(values, stage) };
    }
    state.autofilledNext = false;
    if (stage === 'departure' && state.cityIndex < cities.length - 1) {
      var nextCity = cities[state.cityIndex + 1];
      appliedMembers.forEach(function (id) {
        var tourist = touristById(id);
        if (tourist.route.indexOf(nextCity.id) === -1) return;
        var arrival = records[nextCity.id].arrival[id] || {};
        ['date', 'time', 'transport', 'number', 'point', 'transfer'].forEach(function (key) {
          if (!arrival[key] && values[key]) arrival[key] = values[key];
        });
        records[nextCity.id].arrival[id] = arrival;
        state.autofilledNext = true;
      });
    }
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
    if (event.target.dataset.tourSearch !== undefined) {
      state.tourQuery = event.target.value;
      render();
      var search = root.querySelector('[data-tour-search]');
      if (search) { search.focus(); search.setSelectionRange(state.tourQuery.length, state.tourQuery.length); }
      return;
    }
    if (!state.overlay || state.overlay.kind !== 'form' || !event.target.dataset.field) return;
    state.draft[event.target.dataset.field] = event.target.value;
  });

  root.addEventListener('change', function (event) {
    if (!state.overlay || state.overlay.kind !== 'form' || !event.target.dataset.field) return;
    state.draft[event.target.dataset.field] = event.target.value;
  });

  root.addEventListener('submit', function (event) {
    event.preventDefault();
    var form = event.target;
    var data = Object.fromEntries(new FormData(form).entries());
    if (form.id === 'program-form') {
      var day = { date: data.date, city: data.city, title: data.title || 'Новый день программы', text: data.text || 'Описание будет добавлено позже.' };
      if (form.dataset.index === '') programDays.push(day); else programDays[Number(form.dataset.index)] = day;
      state.overlay = null;
      showToast('День программы сохранён');
      return;
    }
    if (form.id === 'expense-form') {
      var existing = expenses.find(function (item) { return item.id === form.dataset.id; });
      var values = { category: data.category, title: data.title || 'Новый расход', city: data.city, scope: data.scope, amount: Number(data.amount || 0), currency: data.currency || 'USD', comment: data.comment };
      if (existing) Object.assign(existing, values); else expenses.push(Object.assign({ id: 'expense-' + Date.now() }, values));
      state.overlay = null;
      state.view = 'finance';
      showToast('Расход сохранён');
      return;
    }
    if (form.id === 'cancel-tour-form') {
      var cancelledTour = tours.find(function (item) { return item.id === form.dataset.id; }) || selectedTour();
      cancelledTour.status = 'archive';
      cancelledTour.cancelReason = data.reason;
      state.tourFilter = 'archive';
      state.overlay = { kind: 'tours' };
      showToast('Тур отменён и перенесён в архив');
      return;
    }
    if (form.id === 'tour-form') {
      var tour = tours.find(function (item) { return item.id === form.dataset.id; });
      var tourValues = { name: data.name || 'Новый тур', dates: data.dates, route: data.route, guides: data.guides, capacity: Number(data.capacity || 0), price: data.price, color: data.color, site: data.site };
      if (tour) Object.assign(tour, tourValues); else tours.push(Object.assign({ id: 'tour-' + Date.now(), status: 'draft', tourists: 0 }, tourValues));
      state.overlay = { kind: 'tours' };
      state.tourFilter = tour ? tour.status : 'draft';
      showToast(tour ? 'Тур сохранён' : 'Черновик тура создан');
      return;
    }
    if (form.id === 'tourist-data-form') {
      var tourist = touristById(form.dataset.id);
      var routeTokens = String(data.route).split(',').map(function (value) { return value.trim(); });
      var routeIds = cities.filter(function (city) { return routeTokens.indexOf(cityLabel(city)) !== -1; }).map(function (city) { return city.id; });
      if (tourist) Object.assign(tourist, { name: data.name, initials: data.name.split(' ').map(function (part) { return part[0]; }).join('').slice(0, 2).toUpperCase(), passport: data.passport, type: data.type, lead: data.lead, route: routeIds.length ? routeIds : tourist.route });
      else tourists.push({ id: 'tourist-' + Date.now(), name: data.name || 'Новый турист', initials: 'НТ', passport: data.passport || 'Не заполнен', type: data.type || 'Взрослый', lead: data.lead || 'Новый лид', leadId: 'new-lead', groupId: null, route: routeIds.length ? routeIds : cities.map(function (city) { return city.id; }), balance: 0 });
      state.overlay = null;
      state.view = 'tourists';
      state.ocrDraft = null;
      showToast(tourist ? 'Турист сохранён' : 'Турист добавлен');
    }
  });

  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    var action = button.dataset.action;

    if (action === 'workspace') {
      state.view = button.dataset.view;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'summary-mode') {
      state.summaryMode = button.dataset.mode;
      render();
      return;
    }
    if (action === 'toggle-scope') {
      if (state.scopeLead) state.scopeLead = null;
      else state.overlay = { kind: 'scope-select' };
      render();
      return;
    }
    if (action === 'select-scope') {
      state.scopeLead = button.dataset.id;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'jump-cell') {
      state.cityIndex = Number(button.dataset.city);
      state.stage = button.dataset.stage;
      state.summaryMode = 'groups';
      var focusedGroup = operationGroupFor(state.stage, button.dataset.tourist);
      var focusedRecord = effectiveRecord(state.stage, button.dataset.tourist);
      if (hasData(focusedRecord, state.stage)) openForm(focusedGroup ? focusedGroup.members : [button.dataset.tourist], true, focusedGroup ? focusedGroup.id : null);
      else openForm([button.dataset.tourist], false, null);
      return;
    }
    if (action === 'open-tours') {
      state.overlay = { kind: 'tours' };
      render();
      return;
    }
    if (action === 'tour-menu') {
      state.overlay = { kind: 'tour-menu', tourId: state.selectedTourId };
      render();
      return;
    }
    if (action === 'tour-filter') {
      state.tourFilter = button.dataset.filter;
      render();
      return;
    }
    if (action === 'select-tour') {
      state.selectedTourId = button.dataset.id;
      state.overlay = null;
      state.view = button.dataset.id === 'china' ? 'operations' : 'tour-info';
      render();
      return;
    }
    if (action === 'tour-card-menu') {
      state.overlay = { kind: 'tour-menu', tourId: button.dataset.id };
      render();
      return;
    }
    if (action === 'new-tour') {
      state.overlay = { kind: 'tour-form', tourId: null };
      render();
      return;
    }
    if (action === 'view-tour-info') {
      state.overlay = null;
      state.view = 'tour-info';
      render();
      return;
    }
    if (action === 'tourist-detail') {
      state.overlay = { kind: 'tourist-detail', touristId: button.dataset.id };
      render();
      return;
    }
    if (action === 'bulk-tourists') {
      state.overlay = { kind: 'bulk-tourists', selected: new Set() };
      render();
      return;
    }
    if (action === 'add-tourist') {
      state.ocrDraft = null;
      state.overlay = { kind: 'tourist-form', touristId: null };
      render();
      return;
    }
    if (action === 'edit-tourist') {
      state.ocrDraft = null;
      state.overlay = { kind: 'tourist-form', touristId: button.dataset.id };
      render();
      return;
    }
    if (action === 'add-program' || action === 'edit-program') {
      state.overlay = { kind: 'program-form', index: action === 'edit-program' ? Number(button.dataset.index) : null };
      render();
      return;
    }
    if (action === 'generate-program') {
      if (programDays.length < 5) programDays.push({ date: '17 сен', city: 'Сиань', title: 'Переезд в Сиань', text: 'Поезд G89, размещение и вечерняя прогулка по городской стене.' });
      showToast('Программа сформирована из маршрута');
      return;
    }
    if (action === 'regenerate-program') {
      showToast('Программа обновлена, ручные правки сохранены');
      return;
    }
    if (action === 'clear-program') {
      state.overlay = { kind: 'clear-program' };
      render();
      return;
    }
    if (action === 'confirm-clear-program') {
      programDays.splice(0, programDays.length);
      state.overlay = null;
      showToast('Программа очищена');
      return;
    }
    if (action === 'add-expense' || action === 'edit-expense') {
      state.overlay = { kind: 'expense-form', expenseId: button.dataset.id || null };
      render();
      return;
    }
    if (action === 'expense-filter') {
      state.expenseFilter = button.dataset.filter;
      render();
      return;
    }
    if (action === 'tourist-finance') {
      state.overlay = { kind: 'tourist-detail', touristId: button.dataset.id };
      render();
      return;
    }
    if (action === 'edit-tour') {
      state.overlay = { kind: 'tour-form', tourId: (state.overlay && state.overlay.tourId) || state.selectedTourId };
      render();
      return;
    }
    if (action === 'copy-tour') {
      var copySourceId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var originalTour = tours.find(function (tour) { return tour.id === copySourceId; }) || tours[0];
      tours.push(Object.assign({}, originalTour, { id: 'copy-' + Date.now(), name: originalTour.name + ' · копия', status: 'draft', tourists: 0 }));
      state.tourFilter = 'draft';
      state.overlay = { kind: 'tours' };
      showToast('Копия тура создана в черновиках');
      return;
    }
    if (action === 'archive-tour') {
      var archiveSourceId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var archiveTour = tours.find(function (tour) { return tour.id === archiveSourceId; }) || tours[0];
      archiveTour.status = 'archive';
      state.overlay = null;
      showToast('Тур перемещён в архив');
      return;
    }
    if (action === 'cancel-tour') {
      state.overlay = { kind: 'cancel-tour', tourId: (state.overlay && state.overlay.tourId) || state.selectedTourId };
      render();
      return;
    }
    if (action === 'toggle-tour-task') {
      tourTasks[Number(button.dataset.index)].done = !tourTasks[Number(button.dataset.index)].done;
      render();
      return;
    }
    if (action === 'add-tour-task') {
      tourTasks.unshift({ id: 'task-' + Date.now(), title: 'Новая задача по туру', date: 'Сегодня', done: false });
      showToast('Задача тура добавлена');
      return;
    }
    if (action === 'open-leads') {
      window.location.href = './mobile-leads.html';
      return;
    }
    if (action === 'export-summary') {
      var logisticsHeaders = [];
      cities.forEach(function (city) {
        ['arrival', 'hotel', 'departure'].forEach(function (stage) { logisticsHeaders.push(cityLabel(city) + ' · ' + stageMeta[stage].tab); });
      });
      var csv = [['Турист', 'Лид', 'Группа', 'Остаток'].concat(logisticsHeaders).map(csvCell).join(',')].concat(tourists.map(function (tourist) {
        var logistics = [];
        cities.forEach(function (city) {
          ['arrival', 'hotel', 'departure'].forEach(function (stage) {
            logistics.push(tourist.route.indexOf(city.id) === -1 ? 'Не входит в маршрут' : recordSummary(effectiveRecordAt(city.id, stage, tourist.id), stage));
          });
        });
        return [tourist.name, tourist.lead, globalGroupLabel(tourist), tourist.balance].concat(logistics).map(csvCell).join(',');
      })).join('\n');
      var link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      link.download = 'unique-tour-summary.csv';
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('Сводная выгружена без сетевого запроса');
      return;
    }
    if (action === 'scan-tourist-passport') {
      touristById(state.overlay.touristId).passport = '72 4567890';
      showToast('Паспорт распознан. Проверьте номер');
      return;
    }
    if (action === 'scan-form-passport') {
      state.ocrDraft = { passport: '72 4567890' };
      showToast('Поля заполнены из mock OCR');
      return;
    }
    if (action === 'open-source-lead') {
      window.location.href = './mobile-leads.html?lead=' + encodeURIComponent(button.dataset.id);
      return;
    }
    if (action === 'delete-tourist') {
      showToast('Удаление доступно только администратору');
      return;
    }
    if (action === 'bulk-group') {
      state.overlay = { kind: 'tourist-group-select', selected: new Set(state.overlay.selected), error: null };
      render();
      return;
    }

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
      var selectable = state.overlay.kind === 'operation-select' ? scopedTourists(false) : tourists;
      selectable.forEach(function (tourist) { state.overlay.selected.add(tourist.id); });
      render();
      return;
    }
    if (action === 'next-operation') {
      var selectedForOperation = Array.from(state.overlay.selected).map(touristById);
      var groupingKeys = Array.from(new Set(selectedForOperation.map(function (tourist) { return tourist.groupId || 'free-' + tourist.id; })));
      if (selectedForOperation.length > 1 && groupingKeys.length > 1) {
        state.overlay.error = 'Общую запись можно создать только внутри одной группы туристов. Сначала объедините выбранных в разделе «Туристы».';
        render();
        return;
      }
      openForm(Array.from(state.overlay.selected), false, null);
      return;
    }
    if (action === 'pick-source') {
      state.overlay.sourceId = button.dataset.id;
      state.draft = button.dataset.id === 'blank' ? blankRecord(state.overlay.stage) :
        cleanRecord(effectiveRecord(state.overlay.stage, button.dataset.id), state.overlay.stage);
      render();
      return;
    }
    if (action === 'save-form') {
      var formOverlay = state.overlay;
      if (formOverlay.editing) {
        applyStageRecord(formOverlay.members, formOverlay.stage, state.draft, formOverlay.groupId, formOverlay.sourceId);
        state.overlay = null;
        showToast('Общая запись обновлена' + (state.autofilledNext ? '. Прибытие следующего города дополнено' : ''));
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
      applyStageRecord(formOverlay.members, formOverlay.stage, state.draft, null, formOverlay.sourceId);
      state.overlay = null;
      showToast(stageMeta[formOverlay.stage].saved + (state.autofilledNext ? '. Прибытие следующего города дополнено' : ''));
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
      var source = effectiveRecord(conflictOverlay.stage, conflictOverlay.sourceId);
      var mergedValues = Object.assign({}, cleanRecord(source, conflictOverlay.stage));
      Object.keys(conflictOverlay.previousDraft || {}).forEach(function (key) {
        if (String(conflictOverlay.previousDraft[key] || '').trim()) mergedValues[key] = conflictOverlay.previousDraft[key];
      });
      applyStageRecord(conflictOverlay.members, conflictOverlay.stage, mergedValues, null, conflictOverlay.sourceId);
      state.overlay = null;
      showToast('Основная запись применена ко всем туристам' + (state.autofilledNext ? '. Следующий город дополнен' : ''));
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
      var splitAll = splitOverlay.selected.size === splitOverlay.members.length;
      detachMembersFromStage(splitOverlay.stage, Array.from(splitOverlay.selected));
      state.overlay = null;
      showToast(splitAll ? 'Общая запись расформирована, индивидуальные данные восстановлены' : 'Туристы отделены, индивидуальные данные восстановлены');
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
      var globallyDetached = Array.from(globalOverlay.selected);
      globallyDetached.forEach(function (touristId) {
        touristById(touristId).groupId = null;
      });
      var remaining = tourists.filter(function (tourist) { return tourist.groupId === globalOverlay.groupId; });
      if (remaining.length < 2) remaining.forEach(function (tourist) { tourist.groupId = null; globallyDetached.push(tourist.id); });
      detachMembersFromAllOperations(globallyDetached);
      state.overlay = null;
      showToast('Туристы разъединены, логистика сохранена');
    }
  });

  render();
}());
