(function () {
  'use strict';

  var root = document.getElementById('app');
  var groupCounter = 20;
  var toastTimer = null;
  var requestedParams = new URLSearchParams(window.location.search);
  var requestedTouristId = requestedParams.get('tourist');
  var requestedTourId = requestedParams.get('tourId');

  var cities = [
    { id: 'route-beijing-1', catalogCityId: 'city-beijing', name: 'Пекин', dates: '14–17 сен', arrival: '2026-09-14', departure: '2026-09-17' },
    { id: 'route-xian-1', catalogCityId: 'city-xian', name: 'Сиань', dates: '17–20 сен', arrival: '2026-09-17', departure: '2026-09-20' },
    { id: 'route-shanghai-1', catalogCityId: 'city-shanghai', name: 'Шанхай', dates: '20–24 сен', arrival: '2026-09-20', departure: '2026-09-24' },
    { id: 'route-beijing-2', catalogCityId: 'city-beijing', name: 'Пекин', label: 'Пекин · остановка 2', dates: '24–25 сен', arrival: '2026-09-24', departure: '2026-09-25' }
  ];

  var tourists = [
    {
      id: 't1', leadTouristId: 'lt-1042-1', contactId: 'contact-201', dealId: 'deal-501', tourId: 'china',
      name: 'Соколова Анна Игоревна', firstName: 'Анна', lastName: 'Соколова', middleName: 'Игоревна', initials: 'СА',
      birthDate: '1989-04-18', phone: '+7 916 555-12-34', email: 'anna.sokolova@example.com', citizenship: 'Россия',
      domesticPassport: '45 18 456789', domesticIssuedBy: 'ГУ МВД России по г. Москве', registrationAddress: 'Москва, ул. Тверская, 12',
      latinName: 'ANNA SOKOLOVA', passport: '72 3456789', passportExpiry: '2031-05-21', scans: [{ id: 'scan-t1-1', name: 'passport-anna.jpg', status: 'ready' }],
      lead: 'Лид Соколовы', leadId: 'lead-1042', leadStatus: 'Подтверждён', tourStatus: 'Подтверждён', groupId: 'family-sokolov', groupRepresentative: true,
      route: ['route-beijing-1', 'route-xian-1', 'route-shanghai-1'], type: 'Взрослый', isPrimary: true,
      internalNote: 'Вегетарианское меню. Плательщик по заявке.', guideComment: 'Встречать у выхода B.', preferredChannel: 'WhatsApp'
    },
    {
      id: 't2', leadTouristId: 'lt-1042-2', contactId: 'contact-202', dealId: 'deal-502', tourId: 'china',
      name: 'Соколов Илья Максимович', firstName: 'Илья', lastName: 'Соколов', middleName: 'Максимович', initials: 'СИ',
      birthDate: '2012-11-03', phone: '+7 916 555-12-35', email: 'ilya.sokolov@example.com', citizenship: 'Россия',
      domesticPassport: '', domesticIssuedBy: '', registrationAddress: 'Москва, ул. Тверская, 12',
      latinName: 'ILIA SOKOLOV', passport: '72 1122334', passportExpiry: '2026-11-18', scans: [],
      lead: 'Лид Соколовы', leadId: 'lead-1042', leadStatus: 'Подтверждён', tourStatus: 'Подтверждён', groupId: 'family-sokolov', groupRepresentative: false,
      route: ['route-beijing-1', 'route-xian-1', 'route-shanghai-1'], type: 'Ребёнок', isPrimary: false,
      internalNote: '', guideComment: 'Аллергия на арахис.', preferredChannel: 'Telegram'
    },
    {
      id: 't3', leadTouristId: 'lt-1048-1', contactId: 'contact-203', dealId: 'deal-503', tourId: 'china',
      name: 'Орлова Марина Сергеевна', firstName: 'Марина', lastName: 'Орлова', middleName: 'Сергеевна', initials: 'ОМ',
      birthDate: '1991-07-22', phone: '+7 701 222-41-90', email: 'marina.orlova@example.kz', citizenship: 'Казахстан',
      domesticPassport: '', domesticIssuedBy: '', registrationAddress: '',
      latinName: 'MARINA ORLOVA', passport: 'N12345678', passportExpiry: '2030-02-10', scans: [{ id: 'scan-t3-1', name: 'passport-marina.pdf', status: 'ready' }],
      lead: 'Лид Орлова', leadId: 'lead-1048', leadStatus: 'Подтверждён', tourStatus: 'Ожидает', groupId: null, groupRepresentative: false,
      route: ['route-beijing-1', 'route-xian-1', 'route-shanghai-1', 'route-beijing-2'], type: 'Взрослый', isPrimary: true,
      internalNote: 'Связь после 10:00 по Москве.', guideComment: 'Говорит по-английски.', preferredChannel: 'Telegram'
    },
    {
      id: 't4', leadTouristId: 'lt-1048-2', contactId: null, dealId: 'deal-504', tourId: 'china',
      name: 'Волков Денис Андреевич', firstName: 'Денис', lastName: 'Волков', middleName: 'Андреевич', initials: 'ВД',
      birthDate: '2024-01-16', phone: '', email: '', citizenship: 'Россия',
      domesticPassport: '', domesticIssuedBy: '', registrationAddress: '',
      latinName: '', passport: '', passportExpiry: '', scans: [],
      lead: 'Лид Орлова', leadId: 'lead-1048', leadStatus: 'Подтверждён', tourStatus: 'Ожидает', groupId: null, groupRepresentative: false,
      route: ['route-beijing-1', 'route-shanghai-1'], type: 'Младенец', isPrimary: false,
      internalNote: 'Контакт через основного туриста.', guideComment: 'Нужна детская кроватка.', preferredChannel: ''
    }
  ];

  var TOURIST_STORAGE_KEY = 'unique-guide-tourists-v2';
  var canonicalTouristStore = [];

  function normalizeCanonicalTourist(tourist) {
    tourist.tourId = tourist.tourId || (tourist.route && tourist.route.length ? 'china' : null);
    tourist.route = Array.isArray(tourist.route) ? tourist.route : [];
    tourist.scans = Array.isArray(tourist.scans) ? tourist.scans : [];
    tourist.statusByCity = tourist.statusByCity || {};
    tourist.name = [tourist.lastName, tourist.firstName, tourist.middleName].filter(Boolean).join(' ');
    tourist.initials = [tourist.lastName, tourist.firstName].filter(Boolean).map(function (part) { return part.charAt(0); }).join('').toUpperCase() || '?';
    return tourist;
  }

  function hydrateCanonicalTourists() {
    try {
      if (!window.localStorage) return;
      var saved = JSON.parse(window.localStorage.getItem(TOURIST_STORAGE_KEY) || '[]');
      if (!Array.isArray(saved)) return;
      canonicalTouristStore = saved.slice();
      var requestedStoredTourist = saved.find(function (savedTourist) { return savedTourist.id === requestedTouristId; });
      var hydrationTourId = requestedTourId || (requestedStoredTourist && requestedStoredTourist.tourId) || 'china';
      saved.forEach(function (savedTourist) {
        var current = tourists.find(function (tourist) { return tourist.id === savedTourist.id; });
        if (current) normalizeCanonicalTourist(Object.assign(current, savedTourist));
        else if (savedTourist.id === requestedTouristId || savedTourist.tourId === hydrationTourId) tourists.push(normalizeCanonicalTourist(Object.assign({}, savedTourist)));
      });
    } catch (error) {
      console.warn('Tourist profile storage is unavailable', error);
    }
  }

  function saveCanonicalTourists() {
    try {
      var byId = {};
      canonicalTouristStore.forEach(function (tourist) { if (tourist && tourist.id) byId[tourist.id] = tourist; });
      tourists.forEach(function (tourist) { if (tourist && tourist.id) byId[tourist.id] = tourist; });
      canonicalTouristStore = Object.keys(byId).map(function (id) { return byId[id]; });
      if (window.localStorage) window.localStorage.setItem(TOURIST_STORAGE_KEY, JSON.stringify(canonicalTouristStore));
    } catch (error) {
      console.warn('Tourist profile changes remain in memory', error);
    }
  }

  tourists.forEach(normalizeCanonicalTourist);
  hydrateCanonicalTourists();

  var roleLabels = { admin: 'Администратор', manager: 'Менеджер', escort: 'Сопровождающий', guide: 'Гид' };
  var managerTourIds = ['china'];
  var managerLeadIds = ['lead-1042', 'lead-1048'];
  var escortTourIds = ['china'];
  var guideTourIds = ['china'];
  var guideCityIds = ['route-beijing-1', 'route-xian-1'];
  var documentExpiryWarningDate = '2027-03-01';
  var statusLabels = {
    arrival: { expected: 'Ожидается', arrived: 'Прибыл' },
    hotel: { pending: 'Ожидает заселения', checked_in: 'Заселён' },
    departure: { pending: 'Ожидает отъезда', departed: 'Уехал' }
  };

  tourists.forEach(function (tourist, index) {
    tourist.statusByCity = tourist.statusByCity || {};
    tourist.route.forEach(function (routeCityId, cityIndex) {
      if (tourist.statusByCity[routeCityId]) return;
      tourist.statusByCity[routeCityId] = {
        arrival: index === 0 && cityIndex === 0 ? 'arrived' : 'expected',
        hotel: index === 0 && cityIndex === 0 ? 'checked_in' : 'pending',
        departure: 'pending'
      };
    });
  });

  var groupNames = {
    'family-sokolov': 'Соколовы'
  };

  var records = {
    'route-beijing-1': {
      arrival: {
        t1: { date: '2026-09-14', time: '07:25', transport: 'plane', number: 'CZ 342', point: 'Дасин (PKX)', pointId: 'point-pkx', transfer: 'Минивэн', groupId: 'arr-a' },
        t2: { date: '2026-09-14', time: '10:10', transport: 'plane', number: 'SU 204', point: 'Шоуду (PEK)', pointId: 'point-pek', transfer: 'Автобус', groupId: 'arr-b' },
        t3: { date: '2026-09-14', time: '10:10', transport: 'plane', number: 'SU 204', point: 'Шоуду (PEK)', pointId: 'point-pek', transfer: 'Автобус', groupId: 'arr-c' }
      },
      hotel: {
        t1: { name: 'Beijing Palace', room: 'Double', groupId: 'hotel-a' },
        t2: { name: 'Beijing Palace', room: 'Twin', groupId: 'hotel-b' },
        t3: { name: 'Hutong Garden', room: 'Single', groupId: 'hotel-c' }
      },
      departure: {
        t1: { date: '2026-09-17', time: '08:40', transport: 'train', number: 'G89', point: 'Пекин Западный', pointId: 'point-beijing-west', transfer: 'Минивэн', groupId: 'dep-a' },
        t2: { date: '2026-09-17', time: '09:15', transport: 'train', number: 'G91', point: 'Пекин Южный', pointManual: true, transfer: 'Такси', groupId: 'dep-a' },
        t3: { date: '2026-09-17', time: '11:00', transport: 'car', number: '', point: 'Лобби Hutong Garden', pointManual: true, transfer: 'Такси', groupId: 'dep-c' },
        t4: { date: '2026-09-17', time: '12:30', transport: 'bus', number: 'K12', point: 'Люличао', pointId: 'point-beijing-bus', transfer: 'Самостоятельно', groupId: 'dep-d' }
      }
    },
    'route-xian-1': {
      arrival: {
        t1: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Сиань Северный', pointId: 'point-xian-north', transfer: 'Автобус', groupId: 'arr-x1' },
        t2: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Сиань Северный', pointId: 'point-xian-north', transfer: 'Автобус', groupId: 'arr-x1' },
        t3: { date: '2026-09-17', time: '13:06', transport: 'train', number: 'G89', point: 'Сиань Северный', pointId: 'point-xian-north', transfer: 'Автобус', groupId: 'arr-x2' }
      },
      hotel: {
        t1: { name: 'Grand Noble Xi’an', room: 'Double', groupId: 'hotel-x1' },
        t2: { name: 'Grand Noble Xi’an', room: 'Double', groupId: 'hotel-x1' },
        t3: { name: 'Grand Noble Xi’an', room: 'Single', groupId: 'hotel-x2' }
      },
      departure: {}
    },
    'route-shanghai-1': {
      arrival: {},
      hotel: {},
      departure: {}
    },
    'route-beijing-2': {
      arrival: {},
      hotel: {},
      departure: {}
    }
  };

  function visitIdFor(cityId, stage, touristId) {
    var tourist = touristById(touristId);
    return [(tourist && tourist.tourId) || 'china', touristId, cityId, stage].join(':');
  }

  function syncOperationGroup(group, cityId, stage) {
    if (!group) return group;
    group.id = group.subgroupId || group.id;
    group.subgroupId = group.id;
    group.routeCityId = cityId;
    group.stage = stage;
    group.operation = stage;
    group.tourId = ((touristById(group.members[0]) || {}).tourId) || 'china';
    if (group.members.indexOf(group.sourceId || group.masterId) === -1) group.sourceId = group.members[0];
    group.masterId = group.sourceId || group.masterId || group.members[0];
    group.sourceId = group.masterId;
    group.sourceVisitId = visitIdFor(cityId, stage, group.sourceId);
    group.memberVisitIds = group.members.map(function (touristId) { return visitIdFor(cityId, stage, touristId); });
    group.idempotencyKey = group.idempotencyKey || [group.tourId, cityId, stage, group.members.slice().sort().join(',')].join('|');
    return group;
  }

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
          group.sourceId = group.masterId;
          group.createdFromGroupId = (tourists.find(function (tourist) { return tourist.id === group.masterId; }) || {}).groupId || null;
          syncOperationGroup(group, cityId, stage);
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
      { key: 'point', label: 'Транспортная точка', type: 'point', placeholder: 'Место прибытия' },
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
      { key: 'point', label: 'Транспортная точка', type: 'point', placeholder: 'Место отправления' },
      { key: 'transfer', label: 'Трансфер', type: 'text', placeholder: 'Машина, автобус или проводы' }
    ]
  };

  var tours = [
    { id: 'china', name: 'Гранд-тур по Китаю', dates: '14–25 сен 2026', status: 'active', color: '#2f6bd8', tourists: 4, capacity: 12, route: 'Пекин → Сиань → Шанхай → Пекин', guides: 'Ли Вэй, Анна Ким', site: 'unique-travel.ru/china-grand' },
    { id: 'japan', name: 'Япония: сезон момидзи', dates: '8–18 ноя 2026', status: 'draft', color: '#7a5af0', tourists: 7, capacity: 10, route: 'Токио → Киото → Осака', guides: 'Юки Танака', site: 'unique-travel.ru/japan' },
    { id: 'italy', name: 'Италия для своих', dates: '4–12 июн 2026', status: 'archive', color: '#c98a1e', tourists: 9, capacity: 9, route: 'Рим → Флоренция → Венеция', guides: 'Марко Росси', site: 'unique-travel.ru/italy' }
  ];

  var programDays = [
    { date: '14 сен', city: 'Пекин', title: 'Прилёт и знакомство', text: 'Встреча в аэропорту, размещение, вечерняя прогулка по хутунам.' },
    { date: '15 сен', city: 'Пекин', title: 'Императорский Пекин', text: 'Запретный город, парк Цзиншань и чайная церемония.' },
    { date: '16 сен', city: 'Пекин', title: 'Великая Китайская стена', text: 'Участок Мутяньюй, обед и свободный вечер.' }
  ];

  var DIRECTORY_STORAGE_KEY = 'unique-guide-directory-v1';
  var defaultDirectory = {
    cities: [
      { id: 'city-beijing', name: 'Пекин', country: 'Китай', aliases: 'Beijing, 北京', active: true },
      { id: 'city-xian', name: 'Сиань', country: 'Китай', aliases: "Xi'an, 西安", active: true },
      { id: 'city-shanghai', name: 'Шанхай', country: 'Китай', aliases: 'Shanghai, 上海', active: true },
      { id: 'city-demo-empty', name: 'Демо без точек', country: 'Китай', aliases: '', active: true }
    ],
    points: [
      { id: 'point-pkx', cityId: 'city-beijing', type: 'airport', name: 'Дасин', code: 'PKX', active: true },
      { id: 'point-pek', cityId: 'city-beijing', type: 'airport', name: 'Шоуду', code: 'PEK', active: true },
      { id: 'point-beijing-west', cityId: 'city-beijing', type: 'railway_station', name: 'Пекин Западный', code: '', active: true },
      { id: 'point-beijing-bus', cityId: 'city-beijing', type: 'bus_station', name: 'Люличао', code: '', active: true },
      { id: 'point-beijing-bus-east', cityId: 'city-beijing', type: 'bus_station', name: 'Восточный автовокзал', code: '', active: true },
      { id: 'point-xiy', cityId: 'city-xian', type: 'airport', name: 'Сяньян', code: 'XIY', active: true },
      { id: 'point-xian-north', cityId: 'city-xian', type: 'railway_station', name: 'Сиань Северный', code: '', active: true },
      { id: 'point-xian-bus', cityId: 'city-xian', type: 'bus_station', name: 'Саньфувань', code: '', active: true },
      { id: 'point-pvg', cityId: 'city-shanghai', type: 'airport', name: 'Пудун', code: 'PVG', active: true },
      { id: 'point-sha', cityId: 'city-shanghai', type: 'airport', name: 'Хунцяо', code: 'SHA', active: true },
      { id: 'point-shanghai-rail', cityId: 'city-shanghai', type: 'railway_station', name: 'Шанхай Хунцяо', code: '', active: true }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadDirectory() {
    try {
      if (window.localStorage) {
        var saved = window.localStorage.getItem(DIRECTORY_STORAGE_KEY);
        if (saved) {
          var parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.cities) && Array.isArray(parsed.points)) return parsed;
        }
      }
    } catch (error) {
      console.warn('Directory storage is unavailable', error);
    }
    return clone(defaultDirectory);
  }

  var directory = loadDirectory();

  function saveDirectory() {
    try {
      if (window.localStorage) window.localStorage.setItem(DIRECTORY_STORAGE_KEY, JSON.stringify(directory));
    } catch (error) {
      console.warn('Directory changes remain in memory', error);
    }
  }

  var tourTasks = [
    { id: 'task1', title: 'Подтвердить минивэн в Пекине', date: '12 сен', done: false },
    { id: 'task2', title: 'Отправить гиду список паспортов', date: '13 сен', done: false },
    { id: 'task3', title: 'Проверить билеты G89', date: 'Готово', done: true }
  ];

  var initialParams = requestedParams;
  var initialTouristId = initialParams.get('tourist');
  var initialRouteCityId = initialParams.get('routeCityId');
  var initialCityIndex = cities.findIndex(function (city) { return city.id === initialRouteCityId; });
  var initialView = ['operations', 'tourists', 'documents', 'work', 'program'].indexOf(initialParams.get('view')) !== -1 ? initialParams.get('view') : 'operations';
  var initialStage = ['arrival', 'hotel', 'departure'].indexOf(initialParams.get('operation')) !== -1 ? initialParams.get('operation') : 'arrival';
  var initialRole = roleLabels[initialParams.get('role')] ? initialParams.get('role') : 'manager';
  var initialOffline = initialParams.get('offline') === '1';
  var initialTourist = tourists.find(function (tourist) { return tourist.id === initialTouristId; });
  var initialSelectedTourId = initialParams.get('tourId') || (initialTourist && initialTourist.tourId) || 'china';
  var state = {
    view: initialView,
    summaryMode: 'groups',
    touristListMode: initialParams.get('listMode') === 'groups' ? 'groups' : 'list',
    touristQuery: initialParams.get('query') || '',
    touristFilters: { needsData: false, documentIssue: false, limitedRoute: false, type: 'all', group: 'all', status: 'all' },
    documentFilter: ['attention', 'expiring', 'ready'].indexOf(initialParams.get('documentFilter')) !== -1 ? initialParams.get('documentFilter') : 'attention',
    cityIndex: initialCityIndex >= 0 ? initialCityIndex : 0,
    stage: initialStage,
    overlay: initialTouristId ? { kind: 'tourist-detail', touristId: initialTouristId, expanded: new Set() } : null,
    draft: null,
    toast: null,
    toastKind: 'success',
    scopeLead: initialParams.get('lead') || null,
    returnLead: initialParams.get('returnLead') || null,
    returnTab: initialParams.get('returnTab') || 'tourists',
    returnContext: null,
    pendingScrollTop: null,
    tourFilter: 'active',
    tourQuery: '',
    directoryQuery: '',
    selectedTourId: initialSelectedTourId,
    pointPickerReturn: null,
    role: initialRole,
    offline: initialOffline,
    uiPreview: 'ready'
  };

  function captureTourContext() {
    var scroller = root.querySelector && root.querySelector('.scroll');
    return {
      tourId: state.selectedTourId,
      view: state.view,
      routeCityId: currentCity().id,
      operation: state.stage,
      scopeLeadId: state.scopeLead,
      listMode: state.touristListMode,
      query: state.touristQuery,
      filters: JSON.parse(JSON.stringify(state.touristFilters)),
      documentFilter: state.documentFilter,
      summaryMode: state.summaryMode,
      scrollTop: scroller ? scroller.scrollTop : 0
    };
  }

  function restoreTourContext(context) {
    if (!context) return;
    state.selectedTourId = context.tourId || state.selectedTourId;
    state.view = context.view || state.view;
    var cityIndex = cities.findIndex(function (city) { return city.id === context.routeCityId; });
    if (cityIndex >= 0) state.cityIndex = cityIndex;
    state.stage = context.operation || state.stage;
    state.scopeLead = context.scopeLeadId || null;
    state.touristListMode = context.listMode || 'list';
    state.touristQuery = context.query || '';
    state.touristFilters = Object.assign({ needsData: false, documentIssue: false, limitedRoute: false, type: 'all', group: 'all', status: 'all' }, context.filters || {});
    state.documentFilter = context.documentFilter || 'attention';
    state.summaryMode = context.summaryMode || 'groups';
    state.pendingScrollTop = Number(context.scrollTop || 0);
  }

  function mobileLeadsHref(leadId, tab) {
    var params = new URLSearchParams();
    if (leadId) params.set('lead', leadId);
    if (tab) params.set('tab', tab);
    if (state.selectedTourId) params.set('tourId', state.selectedTourId);
    params.set('role', state.role);
    params.set('offline', state.offline ? '1' : '0');
    return './mobile-leads.html?' + params.toString();
  }

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
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3v-4h.09A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3.09V3h4v.09A1.7 1.7 0 0 0 15.06 4.6a1.7 1.7 0 0 0 1.88-.34L17 4.2 19.83 7l-.06.06A1.7 1.7 0 0 0 19.4 9c.13.6.6 1.04 1.2 1H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/>',
      pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
      archive: '<path d="M3 6h18M5 6v14h14V6M9 10h6M4 3h16v3H4z"/>',
      trash: '<path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"/>',
      search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      chat: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
      phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z"/>',
      document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
      camera: '<path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z"/><circle cx="12" cy="13" r="3"/>',
      upload: '<path d="M12 16V4m0 0L7 9m5-5 5 5M4 16v4h16v-4"/>',
      eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
      edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
      filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
      alert: '<path d="M12 3 2.5 20h19Z"/><path d="M12 9v4m0 3h.01"/>',
      wifiOff: '<path d="m2 2 20 20M8.5 8.5A8.6 8.6 0 0 1 19 10M5 10a12 12 0 0 1 2.1-1.4M9 14a4.3 4.3 0 0 1 6 0M12 18h.01"/>',
      more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
      unlink: '<path d="m18 13 3 3-5 5-3-3M11 15l4-4M6 11l-3-3 5-5 3 3M13 9 9 13"/>',
      success: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>'
    };
    return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.more) + '</svg>';
  }

  function currentCity() {
    return cities[state.cityIndex];
  }

  function canViewRouteCity(routeCityId) {
    if (state.role !== 'guide') return true;
    return guideTourIds.indexOf(state.selectedTourId) !== -1 && guideCityIds.indexOf(routeCityId) !== -1;
  }

  function visibleRouteCities() {
    return cities.filter(function (city) { return canViewRouteCity(city.id); });
  }

  function normalizeCityForRole() {
    if (canViewRouteCity(currentCity().id)) return;
    var firstVisibleIndex = cities.findIndex(function (city) { return canViewRouteCity(city.id); });
    if (firstVisibleIndex >= 0) state.cityIndex = firstVisibleIndex;
  }

  function cityLabel(city) {
    var duplicates = cities.filter(function (candidate) { return candidate.catalogCityId === city.catalogCityId; });
    if (duplicates.length < 2) return city.name;
    return city.name + ' · остановка ' + (duplicates.indexOf(city) + 1);
  }

  function selectedTour() {
    var tour = tours.find(function (candidate) { return candidate.id === state.selectedTourId; });
    if (tour) return tour;
    return {
      id: state.selectedTourId,
      name: 'Выбранный тур',
      dates: 'Даты не указаны',
      status: 'active',
      color: '#6b7280',
      tourists: currentTourists().length,
      capacity: currentTourists().length,
      route: 'Маршрут не загружен',
      guides: '',
      site: ''
    };
  }

  function tourHasOperationalModel(tourId) {
    return tourId === 'china';
  }

  function canManageTourId(tourId) {
    return state.role === 'admin' || (state.role === 'manager' && managerTourIds.indexOf(tourId) !== -1);
  }

  function currentTourists() {
    return tourists.filter(function (tourist) { return tourist.tourId === state.selectedTourId; });
  }

  function scopedTourists(includeUnavailable) {
    return currentTourists().filter(function (tourist) {
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
    var expectedVisitId = visitIdFor(cityId, stage, touristId);
    var id = Object.keys(groups).find(function (groupId) {
      var group = groups[groupId];
      return group.routeCityId === cityId && group.operation === stage && group.members.indexOf(touristId) !== -1 && group.memberVisitIds.indexOf(expectedVisitId) !== -1;
    });
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
    var sourceId = group && (group.sourceId || group.masterId);
    var sourceMatchesTuple = group && group.sourceVisitId === visitIdFor(cityId, stage, sourceId) && group.tourId === ((touristById(touristId) || {}).tourId || 'china');
    return sourceMatchesTuple ? records[cityId][stage][sourceId] : records[cityId][stage][touristId];
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
    if (stage !== 'hotel') {
      clean.pointId = record && record.pointId ? String(record.pointId) : '';
      clean.pointManual = Boolean(record && record.pointManual);
    }
    return clean;
  }

  function pointTypeForTransport(transport) {
    return { plane: 'airport', train: 'railway_station', bus: 'bus_station' }[transport] || null;
  }

  function pointTypeLabel(type, plural) {
    var labels = {
      airport: plural ? 'аэропорты' : 'Аэропорт',
      railway_station: plural ? 'ж/д вокзалы' : 'Ж/д вокзал',
      bus_station: plural ? 'автовокзалы' : 'Автовокзал'
    };
    return labels[type] || (plural ? 'точки' : 'Точка');
  }

  function touristCount(value) {
    var mod10 = value % 10;
    var mod100 = value % 100;
    var noun = mod10 === 1 && mod100 !== 11 ? 'турист' : (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20) ? 'туриста' : 'туристов');
    return value + ' ' + noun;
  }

  function pointCountLabel(value, type) {
    var forms = {
      airport: ['аэропорт', 'аэропорта', 'аэропортов'],
      railway_station: ['ж/д вокзал', 'ж/д вокзала', 'ж/д вокзалов'],
      bus_station: ['автовокзал', 'автовокзала', 'автовокзалов']
    }[type] || ['точка', 'точки', 'точек'];
    var mod10 = value % 10;
    var mod100 = value % 100;
    var form = mod10 === 1 && mod100 !== 11 ? forms[0] : (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20) ? forms[1] : forms[2]);
    return value + ' ' + form;
  }

  function pointDisplay(point) {
    return point.name + (point.code ? ' (' + point.code + ')' : '');
  }

  function directoryCityById(id) {
    return directory.cities.find(function (city) { return city.id === id; });
  }

  function directoryPointById(id) {
    return directory.points.find(function (point) { return point.id === id; });
  }

  function activePointsFor(city, transport) {
    var type = pointTypeForTransport(transport);
    if (!type || !city) return [];
    var catalogCity = directoryCityById(city.catalogCityId);
    if (!catalogCity || !catalogCity.active) return [];
    return directory.points.filter(function (point) {
      return point.active && point.cityId === city.catalogCityId && point.type === type;
    }).sort(function (left, right) {
      return pointDisplay(left).localeCompare(pointDisplay(right), 'ru');
    });
  }

  function syncDraftPoint(previousTransport) {
    if (!state.draft) return;
    var type = pointTypeForTransport(state.draft.transport);
    var selectedPoint = directoryPointById(state.draft.pointId);
    var compatible = selectedPoint && selectedPoint.cityId === currentCity().catalogCityId && selectedPoint.type === type;

    if (selectedPoint && !compatible) {
      state.draft.pointId = '';
      state.draft.point = '';
      state.draft.pointManual = false;
    } else if (previousTransport && previousTransport !== state.draft.transport && state.draft.pointManual) {
      state.draft.point = '';
      state.draft.pointManual = false;
    }

    var options = activePointsFor(currentCity(), state.draft.transport);
    if (!state.draft.point && !state.draft.pointId && options.length === 1) {
      state.draft.pointId = options[0].id;
      state.draft.point = pointDisplay(options[0]);
      state.draft.pointManual = false;
      state.draft.pointAutofilled = true;
    } else if (!type) {
      state.draft.pointId = '';
      state.draft.pointAutofilled = false;
    }
  }

  function pointIsUsed(pointId) {
    return Object.keys(records).some(function (cityId) {
      return ['arrival', 'departure'].some(function (stage) {
        return Object.keys(records[cityId][stage]).some(function (touristId) {
          return records[cityId][stage][touristId].pointId === pointId;
        });
      });
    });
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
      var record = group ? effectiveRecord(stage, id) : stageRecords(stage)[id];
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

  function capabilities() {
    var role = state.role;
    var managerTour = managerTourIds.indexOf(state.selectedTourId) !== -1;
    var escortTour = escortTourIds.indexOf(state.selectedTourId) !== -1;
    var guideTour = guideTourIds.indexOf(state.selectedTourId) !== -1;
    var guideCity = guideCityIds.indexOf(currentCity().id) !== -1;
    var operationalModel = tourHasOperationalModel(state.selectedTourId);
    return {
      canEditProfile: role === 'admin' || (role === 'manager' && managerTour),
      canEditLogistics: operationalModel && (role === 'admin' || (role === 'manager' && managerTour)),
      canGroup: operationalModel && (role === 'admin' || (role === 'manager' && managerTour)),
      canManageDocuments: role === 'admin' || (role === 'manager' && managerTour),
      canDelete: role === 'admin',
      canEditStatuses: operationalModel && (role === 'admin' || (role === 'manager' && managerTour) || (role === 'escort' && escortTour) || (role === 'guide' && guideTour && guideCity)),
      canManageTour: canManageTourId(state.selectedTourId),
      canManageProgram: operationalModel && (role === 'admin' || (role === 'manager' && managerTour)),
      canManageTasks: operationalModel && (role === 'admin' || (role === 'manager' && managerTour)),
      canManageDirectory: role === 'admin',
      canExport: operationalModel && (role === 'admin' || (role === 'manager' && managerTour))
    };
  }

  function leadConfirmed(tourist) {
    return Boolean(tourist) && tourist.leadStatus === 'Подтверждён';
  }

  function canEditProfileFor(tourist) {
    if (!tourist || !capabilities().canEditProfile) return false;
    return state.role === 'admin' || managerLeadIds.indexOf(tourist.leadId) !== -1;
  }

  function canSeePrivateFor(tourist) {
    if (!tourist || tourist.tourId !== state.selectedTourId) return false;
    return state.role === 'admin' || (state.role === 'manager' && managerTourIds.indexOf(tourist.tourId) !== -1 && managerLeadIds.indexOf(tourist.leadId) !== -1);
  }

  function canManageDocumentsFor(tourist) {
    if (!tourist || !capabilities().canManageDocuments) return false;
    return state.role === 'admin' || managerLeadIds.indexOf(tourist.leadId) !== -1;
  }

  function canMutateLogisticsFor(memberIds) {
    if (!tourHasOperationalModel(state.selectedTourId) || !capabilities().canEditLogistics || state.offline || !memberIds || !memberIds.length) return false;
    var members = memberIds.map(touristById);
    return members.every(function (tourist) {
      return tourist && tourist.tourId === state.selectedTourId && leadConfirmed(tourist) && tourist.route.indexOf(currentCity().id) !== -1;
    });
  }

  function canEditLogisticsForAt(tourist, routeCityId) {
    return tourHasOperationalModel(state.selectedTourId) && Boolean(tourist) && capabilities().canEditLogistics && tourist.tourId === state.selectedTourId &&
      leadConfirmed(tourist) && tourist.route.indexOf(routeCityId) !== -1;
  }

  function canEditStatusFor(tourist, routeCityId) {
    if (!tourHasOperationalModel(state.selectedTourId) || !tourist || tourist.tourId !== state.selectedTourId || tourist.route.indexOf(routeCityId) === -1) return false;
    if (state.role === 'admin') return true;
    if (state.role === 'manager') return managerTourIds.indexOf(tourist.tourId) !== -1;
    if (state.role === 'escort') return escortTourIds.indexOf(tourist.tourId) !== -1;
    return state.role === 'guide' && guideTourIds.indexOf(tourist.tourId) !== -1 && guideCityIds.indexOf(routeCityId) !== -1;
  }

  function canEditStatusesFor(memberIds, routeCityId) {
    return Boolean(memberIds && memberIds.length) && memberIds.every(function (touristId) {
      return canEditStatusFor(touristById(touristId), routeCityId);
    });
  }

  function mutationBlocked(allowed, deniedMessage, offlineMessage) {
    if (state.offline) {
      showToast(offlineMessage || 'Подключитесь к интернету, чтобы сохранить изменения', 'error');
      return true;
    }
    if (!allowed) {
      showToast(deniedMessage || 'Недостаточно прав для этого действия', 'error');
      return true;
    }
    return false;
  }

  function showProfileValidation(errors, summary) {
    state.overlay.fieldErrors = errors;
    state.overlay.error = summary || 'Проверьте отмеченные поля.';
    render();
    var firstName = Object.keys(errors)[0];
    var firstInvalid = firstName && root.querySelector('[name="' + firstName + '"]');
    if (firstInvalid && firstInvalid.focus) firstInvalid.focus();
  }

  function personalReadiness(tourist) {
    var required = [
      ['lastName', 'фамилия'],
      ['firstName', 'имя'],
      ['birthDate', 'дата рождения']
    ];
    if (tourist.isPrimary) {
      required = required.concat([
        ['middleName', 'отчество'],
        ['email', 'email'],
        ['phone', 'телефон']
      ]);
    }
    var missing = required.filter(function (field) { return !String(tourist[field[0]] || '').trim(); }).map(function (field) { return field[1]; });
    return {
      ready: missing.length === 0,
      missing: missing,
      label: missing.length ? 'Не заполнено: ' + missing.join(', ') : 'Личные данные заполнены'
    };
  }

  function domesticPassportReadiness(tourist) {
    if (tourist.citizenship !== 'Россия') return { ready: true, category: 'not-required', label: 'Не требуется', issue: '' };
    var hasAny = Boolean(tourist.domesticPassport || tourist.domesticIssuedBy);
    if (!tourist.isPrimary && !hasAny) return { ready: true, category: 'not-required', label: 'Не требуется', issue: '' };
    var missing = [];
    if (!tourist.domesticPassport) missing.push('серия и номер паспорта РФ');
    if (!tourist.domesticIssuedBy) missing.push('орган выдачи паспорта РФ');
    return {
      ready: missing.length === 0,
      category: missing.length ? 'missing' : 'ready',
      missing: missing,
      label: missing.length ? 'Паспорт РФ не заполнен' : 'Паспорт РФ заполнен',
      issue: missing.join(', ')
    };
  }

  function foreignPassportReadiness(tourist) {
    var missing = [];
    if (!tourist.latinName) missing.push('ФИО латиницей');
    if (!tourist.passport) missing.push('номер загранпаспорта');
    if (!tourist.passportExpiry) missing.push('срок действия');
    if (!tourist.scans || !tourist.scans.length) missing.push('скан');
    var expiring = missing.length === 0 && tourist.passportExpiry <= documentExpiryWarningDate;
    return {
      ready: missing.length === 0 && !expiring,
      category: missing.length ? 'missing' : (expiring ? 'expiring' : 'ready'),
      missing: missing,
      expiring: Boolean(expiring),
      issue: missing.length ? 'Не заполнено: ' + missing.join(', ') : (expiring ? 'Загранпаспорт скоро истекает' : 'Документы готовы'),
      label: missing.length ? 'Нужно дозаполнить' : (expiring ? 'Требует внимания' : 'Готово')
    };
  }

  function documentReadiness(tourist) {
    var domestic = domesticPassportReadiness(tourist);
    var foreign = foreignPassportReadiness(tourist);
    var missing = (domestic.missing || []).concat(foreign.missing || []);
    var category = missing.length ? 'missing' : (foreign.expiring ? 'expiring' : 'ready');
    return {
      ready: category === 'ready',
      category: category,
      expiring: category === 'expiring',
      domestic: domestic,
      foreign: foreign,
      issue: missing.length ? 'Не заполнено: ' + missing.join(', ') : foreign.issue,
      label: category === 'missing' ? 'Нужно дозаполнить' : (category === 'expiring' ? 'Требует внимания' : 'Готово')
    };
  }

  function readinessClass(ready, warning) {
    return ready ? 'ready' : (warning ? 'warning-state' : 'missing');
  }

  function statusFor(tourist, cityId, stage) {
    var cityStatus = tourist.statusByCity[cityId] || {};
    return cityStatus[stage] || (stage === 'arrival' ? 'expected' : 'pending');
  }

  function statusLabel(tourist, cityId, stage) {
    return statusLabels[stage][statusFor(tourist, cityId, stage)];
  }

  function ownRecordAt(cityId, stage, touristId) {
    return records[cityId] && records[cityId][stage] ? records[cityId][stage][touristId] : null;
  }

  function operationOriginAt(cityId, stage, touristId) {
    var group = operationGroupForAt(cityId, stage, touristId);
    if (!group) return { kind: 'own', label: 'Индивидуальная запись', group: null, source: touristById(touristId) };
    return { kind: 'shared', label: 'Общая запись · ' + touristCount(group.members.length), group: group, source: touristById(group.sourceId || group.masterId) };
  }

  function filledOperationsForCity(tourist, city) {
    return ['arrival', 'hotel', 'departure'].filter(function (stage) {
      return hasData(effectiveRecordAt(city.id, stage, tourist.id), stage);
    }).length;
  }

  function roleBanner(tourist) {
    var canEditProfile = tourist ? canEditProfileFor(tourist) : capabilities().canEditProfile;
    if (canEditProfile && !state.offline) return '';
    if (state.offline) return '<div class="system-banner offline">' + icon('wifiOff') + '<span><strong>Нет подключения</strong><small>Показаны сохранённые mock-данные. Сохранение недоступно.</small></span><button data-action="toggle-offline">Повторить</button></div>';
    var note = tourist && state.role === 'manager' ? 'Турист относится к лиду, не назначенному текущему менеджеру.' : 'Персональные данные и группировка доступны менеджеру.';
    return '<div class="system-banner readonly"><span><strong>Режим просмотра</strong><small>' + h(note) + '</small></span></div>';
  }

  function statusBar() {
    return '<div class="status-bar"><span>9:41</span><span class="status-icons">' +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 12h2V9H2zm4 0h2V6H6zm4 0h2V3h-2z" fill="currentColor"/></svg>' +
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6.5a9 9 0 0 1 12 0M4.5 9a5.3 5.3 0 0 1 7 0M7 11.5a1.5 1.5 0 0 1 2 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '<svg viewBox="0 0 20 10" aria-hidden="true"><rect x=".7" y=".7" width="16" height="8.6" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="2.5" y="2.5" width="11" height="5" rx="1" fill="currentColor"/><path d="M18 3.2v3.6" stroke="currentColor" stroke-width="1.5"/></svg>' +
      '</span></div>';
  }

  function topBar(title, subtitle) {
    return '<div class="app-top"><div class="user-row"><span class="user-label">MVP · мобильная CRM</span><button type="button" class="role-badge" data-action="role-menu">' + h(roleLabels[state.role]) + '</button></div>' +
      '<div class="tour-row"><span class="tour-mark"></span><button type="button" class="tour-title tour-select" data-action="open-tours"><strong>' + h(title) + '</strong><span>' + h(subtitle) + '</span></button>' +
      '<button type="button" class="icon-button" data-action="tour-menu" aria-label="Настройки тура">' + icon('more') + '</button></div></div>';
  }

  function workspaceTabs() {
    var tabs = [
      { id: 'operations', label: 'Сводная' },
      { id: 'work', label: 'Работа' },
      { id: 'program', label: 'Программа' }
    ];
    return '<div class="workspace-tabs">' + tabs.map(function (tab) {
      var summaryView = ['operations', 'tourists', 'documents'].indexOf(state.view) !== -1;
      var active = tab.id === 'operations' ? summaryView : state.view === tab.id;
      return '<button type="button" class="' + (active ? 'active' : '') + '" data-action="workspace" data-view="' + tab.id + '">' + tab.label + '</button>';
    }).join('') + '</div>';
  }

  function summaryTabs() {
    var tabs = [
      { id: 'operations', label: 'Операции' },
      { id: 'tourists', label: 'Туристы' },
      { id: 'documents', label: 'Документы' }
    ];
    return '<div class="summary-tabs" role="tablist" aria-label="Разделы сводной">' + tabs.map(function (tab) {
      return '<button type="button" role="tab" aria-selected="' + (state.view === tab.id) + '" class="' + (state.view === tab.id ? 'active' : '') + '" data-action="summary-section" data-view="' + tab.id + '">' + tab.label + '</button>';
    }).join('') + '</div>';
  }

  function cityPickerButton() {
    var city = currentCity();
    var filled = scopedTourists(false).reduce(function (sum, tourist) { return sum + filledOperationsForCity(tourist, city); }, 0);
    var total = scopedTourists(false).length * 3;
    return '<div class="city-picker-wrap"><button type="button" class="city-picker-trigger" data-action="open-city-picker"><span class="city-picker-index">' + (state.cityIndex + 1) + '</span><span><strong>' + h(cityLabel(city)) + '</strong><small>' + h(city.dates) + ' · заполнено ' + filled + ' из ' + total + '</small></span><b>›</b></button></div>';
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
      '</strong><span>' + h(note || tourist.lead) + '</span></div><span class="lead-pill">Тур · ' + h(globalGroupLabel(tourist)) + '</span></div>';
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
      [transportLabel(record.transport), record.point, record.pointManual ? 'Не из справочника' : '', record.transfer].filter(Boolean).join(' · ');
    var operationLevel = stageMeta[stage].tab + ' · ' + (group.shared ? 'общая запись' : 'индивидуально');
    var members = group.members.slice(0, 2).map(function (tourist) {
      return memberRow(tourist, tourist.lead);
    }).join('');
    if (group.members.length > 2) {
      members += capabilities().canEditLogistics && !state.offline && group.members.every(leadConfirmed) ? '<button type="button" class="more-members" data-action="manage-operation" data-members="' + group.members.map(function (tourist) { return tourist.id; }).join(',') + '" data-group="' + h(group.id) + '">Ещё ' + (group.members.length - 2) + '</button>' : '<div class="more-members more-members-static">Ещё ' + (group.members.length - 2) + '</div>';
    }
    var ids = group.members.map(function (tourist) { return tourist.id; }).join(',');
    var manageLabel = group.shared ? 'Состав · ' + group.members.length : 'Объединить';
    var source = group.shared ? touristById((stageGroups(stage)[group.id] || {}).sourceId) : group.members[0];
    var tourGroupNames = Array.from(new Set(group.members.map(globalGroupLabel))).join(', ');
    var cardActions = [];
    if (capabilities().canEditLogistics && !state.offline && group.members.every(leadConfirmed)) {
      cardActions.push('<button type="button" class="secondary-button" data-action="edit-operation" data-members="' + ids + '" data-group="' + h(group.id) + '">' + (group.shared ? 'Общая запись' : 'Изменить') + '</button>');
      cardActions.push('<button type="button" class="secondary-button" data-action="manage-operation" data-members="' + ids + '" data-group="' + h(group.id) + '">' + (group.shared ? manageLabel : 'Общая запись') + '</button>');
    }
    if (!state.offline && canEditStatusesFor(group.members.map(function (tourist) { return tourist.id; }), currentCity().id)) {
      cardActions.push('<button type="button" class="secondary-button" data-action="status-bulk" data-members="' + ids + '" data-stage="' + stage + '">Изменить статус</button>');
    }
    var actionsMarkup = cardActions.length ? '<div class="card-actions ' + (cardActions.length === 3 ? 'three-actions' : '') + '">' + cardActions.join('') + '</div>' : '<div class="readonly-card-note">Только просмотр</div>';
    return '<article class="operation-card" style="--group-color:' + ['#2f6bd8', '#6f52d9', '#1f8a50', '#a46c13'][index % 4] + '">' +
      '<div class="card-head"><div class="time-block"><strong>' + h(leftMain) + '</strong><span>' + h(leftSub) + '</span></div>' +
      '<div class="operation-main"><strong>' + icon(iconName) + h(primary) + '</strong><span class="operation-level">' + h(operationLevel) + '</span><span>' + h(secondary || 'Детали не указаны') + '</span></div>' +
      '<span class="count-pill">' + touristCount(group.members.length) + '</span></div><div class="operation-meta"><span>Группа тура · ' + h(tourGroupNames) + '</span><span>' + (group.shared ? 'Источник · ' + h(source ? source.name : 'не выбран') : 'Личная запись туриста') + '</span></div><div class="divider"></div>' + members +
      actionsMarkup + '</article>';
  }

  function statePreview() {
    if (state.uiPreview === 'loading') {
      return '<main class="scroll"><div class="skeleton-card"></div><div class="skeleton-card short"></div><div class="skeleton-card"></div></main>';
    }
    if (state.uiPreview === 'error') {
      return '<main class="scroll"><div class="empty-state error-state">' + icon('alert') + '<strong>Не удалось загрузить сводную</strong><span>Проверьте подключение и повторите.</span><button type="button" class="primary-button blue empty-state-action" data-action="reset-ui-state">Повторить</button></div></main>';
    }
    if (state.uiPreview === 'empty') {
      return '<main class="scroll"><div class="empty-state">' + icon('users') + '<strong>В туре пока нет туристов</strong><span>Добавьте участников или измените выбранный тур.</span><button type="button" class="secondary-button empty-state-action" data-action="reset-ui-state">Вернуть mock-данные</button></div></main>';
    }
    return '';
  }

  function operationsView() {
    if (state.summaryMode === 'coverage') return matrixSummaryView();
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
      var freeAction = capabilities().canEditLogistics && !state.offline && grouped.free.some(leadConfirmed) ?
        '<button type="button" class="text-button" data-action="add-stage">Заполнить</button>' :
        '<span class="readonly-inline">Только просмотр</span>';
      free = '<section class="free-card"><div class="section-row"><div class="section-copy"><strong>Без данных</strong><span>' +
        grouped.free.length + ' из ' + available.length + ' туристов</span></div>' + freeAction + '</div>' +
        '<div class="free-list">' + grouped.free.map(function (tourist) { return memberRow(tourist, 'Нет записи для города'); }).join('') + '</div></section>';
    }
    var shell = statusBar() + topBar('Гранд-тур по Китаю', '14–25 сентября · ' + touristCount(currentTourists().length)) + roleBanner() + workspaceTabs() + summaryTabs() + cityPickerButton() + stageSwitch();
    var preview = statePreview();
    if (preview) return shell + preview;
    var selectedScope = state.scopeLead ? (currentTourists().find(function (tourist) { return tourist.leadId === state.scopeLead; }) || {}).lead : null;
    var scopeName = selectedScope ? selectedScope.replace(/^Лид\s+/, 'Лид: ') : 'Весь тур';
    var canAdd = capabilities().canEditLogistics && !state.offline && available.some(leadConfirmed);
    var addAction = canAdd ? '<button type="button" class="add-button compact-add" data-action="add-stage" aria-label="' + h(stageMeta[state.stage].add) + '">' + icon('plus') + '</button>' : '';
    return shell + '<main class="scroll">' + summaryModeSwitch() + '<div class="operation-toolbar"><div class="section-copy"><strong>' + stageMeta[state.stage].heading + '</strong><span>' +
      h(cityLabel(currentCity())) + ' · заполнено ' + filled + ' из ' + available.length + '</span></div><button type="button" class="scope-chip ' + (state.scopeLead ? 'active' : '') + '" data-action="toggle-scope">' + h(scopeName) + '</button>' + addAction + '</div>' + cards + free + '</main>';
  }

  function summaryModeSwitch() {
    return '<div class="summary-tools"><div class="mini-switch"><button type="button" class="' + (state.summaryMode === 'groups' ? 'active' : '') + '" data-action="summary-mode" data-mode="groups">По операциям</button><button type="button" class="' + (state.summaryMode === 'coverage' ? 'active' : '') + '" data-action="summary-mode" data-mode="coverage">Покрытие</button></div></div>';
  }

  function summaryTools() {
    var selectedScope = state.scopeLead ? (currentTourists().find(function (tourist) { return tourist.leadId === state.scopeLead; }) || {}).lead : null;
    var scopeName = selectedScope ? selectedScope.replace(/^Лид\s+/, 'Лид: ') : 'Весь тур';
    return '<div class="summary-tools"><span class="summary-context">' + h(stageMeta[state.stage].tab) + ' · ' + h(cityLabel(currentCity())) + '</span>' +
      '<button type="button" class="scope-chip ' + (state.scopeLead ? 'active' : '') + '" data-action="toggle-scope">' + h(scopeName) + '</button></div>';
  }

  function coverageCell(tourist, city, cityIndex, stage) {
    if (tourist.route.indexOf(city.id) === -1) return '<span class="coverage-cell unavailable">—</span>';
    var record = effectiveRecordAt(city.id, stage, tourist.id);
    var filled = hasData(record, stage);
    if (!canEditLogisticsForAt(tourist, city.id) || state.offline) {
      return '<span class="coverage-cell ' + (filled ? 'filled' : 'empty') + ' readonly" aria-label="' + h(cityLabel(city) + ' ' + stageMeta[stage].tab + ' · только просмотр') + '">' + (filled ? '✓' : '—') + '</span>';
    }
    return '<button type="button" class="coverage-cell ' + (filled ? 'filled' : 'empty') + '" data-action="jump-cell" data-city="' + cityIndex + '" data-stage="' + stage + '" data-tourist="' + tourist.id + '" aria-label="' + h(cityLabel(city) + ' ' + stageMeta[stage].tab) + '">' + (filled ? '✓' : '+') + '</button>';
  }

  function matrixSummaryView() {
    var tourMembers = currentTourists();
    var visible = state.scopeLead ? tourMembers.filter(function (tourist) { return tourist.leadId === state.scopeLead; }) : tourMembers;
    var rows = visible.map(function (tourist) {
      var cityRows = visibleRouteCities().map(function (city) {
        var cityIndex = cities.indexOf(city);
        return '<div class="coverage-city"><span><strong>' + h(cityLabel(city)) + '</strong><small>' + h(city.dates) + '</small></span><div class="coverage-cells">' +
          coverageCell(tourist, city, cityIndex, 'arrival') + coverageCell(tourist, city, cityIndex, 'hotel') + coverageCell(tourist, city, cityIndex, 'departure') + '</div></div>';
      }).join('');
      return '<article class="coverage-card"><button type="button" class="coverage-person" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(tourist.lead + ' · ' + globalGroupLabel(tourist)) + '</small></span><b>›</b></button><div class="coverage-head"><span>Город</span><div><i>Рейс</i><i>Отель</i><i>Отъезд</i></div></div>' + cityRows + '</article>';
    }).join('');
    var exportAction = capabilities().canExport && !state.offline ? '<button type="button" class="text-button" data-action="export-summary">Excel</button>' : '';
    return statusBar() + topBar('Гранд-тур по Китаю', '14–25 сентября · ' + touristCount(currentTourists().length)) + roleBanner() + workspaceTabs() + summaryTabs() +
      '<main class="scroll">' + summaryModeSwitch() + summaryTools() + '<div class="tour-stats"><div><span>Мест</span><strong>' + currentTourists().length + ' / 12</strong></div><div><span>Подтверждено</span><strong>' + currentTourists().filter(leadConfirmed).length + '</strong></div><div><span>Групп</span><strong>' + Object.keys(touristGroups().groups).length + '</strong></div></div><div class="section-row"><div class="section-copy"><strong>Покрытие по туристам</strong><span>Прибытие, отель и отъезд для каждой доступной остановки</span></div>' + exportAction + '</div>' + rows + '</main>';
  }

  function touristGroups() {
    var map = {};
    var free = [];
    currentTourists().forEach(function (tourist) {
      if (!tourist.groupId) {
        free.push(tourist);
        return;
      }
      if (!map[tourist.groupId]) map[tourist.groupId] = [];
      map[tourist.groupId].push(tourist);
    });
    return { groups: map, free: free };
  }

  function filteredTourists() {
    var query = state.touristQuery.trim().toLowerCase();
    return currentTourists().filter(function (tourist) {
      if (state.scopeLead && tourist.leadId !== state.scopeLead) return false;
      if (query && [tourist.name, tourist.phone, tourist.lead, globalGroupLabel(tourist)].join(' ').toLowerCase().indexOf(query) === -1) return false;
      if (state.touristFilters.needsData && personalReadiness(tourist).ready) return false;
      if (state.touristFilters.documentIssue && documentReadiness(tourist).ready) return false;
      if (state.touristFilters.limitedRoute && tourist.route.length >= cities.length) return false;
      if (state.touristFilters.type !== 'all' && tourist.type !== state.touristFilters.type) return false;
      if (state.touristFilters.group === 'grouped' && !tourist.groupId) return false;
      if (state.touristFilters.group === 'free' && tourist.groupId) return false;
      if (state.touristFilters.status !== 'all' && statusFor(tourist, currentCity().id, state.stage) !== state.touristFilters.status) return false;
      return true;
    });
  }

  function touristListCard(tourist) {
    var personal = personalReadiness(tourist);
    var documents = documentReadiness(tourist);
    var filled = filledOperationsForCity(tourist, currentCity());
    var primary = tourist.isPrimary ? '<span class="group-pill">Основной в заявке</span>' : '';
    return '<article class="tourist-card"><button type="button" class="tourist-card-main" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar dark">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(tourist.type + ' · ' + tourist.lead) + '</small><em>Группа тура · ' + h(globalGroupLabel(tourist)) + '</em></span><b>›</b></button><div class="tourist-card-badges">' + primary + '<span class="readiness-pill ' + readinessClass(personal.ready) + '">' + h(personal.ready ? 'Данные готовы' : 'Дозаполнить данные') + '</span><span class="readiness-pill ' + readinessClass(documents.ready, documents.expiring) + '">' + h(documents.label) + '</span></div><div class="tourist-next"><span><strong>' + h(cityLabel(currentCity())) + '</strong><small>Логистика · ' + filled + ' из 3</small></span><span class="status-chip">' + h(statusLabel(tourist, currentCity().id, state.stage)) + '</span></div><div class="card-actions"><button type="button" class="secondary-button" data-action="call-tourist" data-id="' + tourist.id + '">' + icon('phone') + 'Позвонить</button><button type="button" class="secondary-button" data-action="message-tourist" data-id="' + tourist.id + '">' + icon('chat') + 'Написать</button></div></article>';
  }

  function touristFilterChips() {
    var chips = [];
    if (state.touristFilters.needsData) chips.push('<button data-action="quick-filter" data-filter="needsData">Не заполнены данные ×</button>');
    if (state.touristFilters.documentIssue) chips.push('<button data-action="quick-filter" data-filter="documentIssue">Проблемы с документами ×</button>');
    if (state.touristFilters.limitedRoute) chips.push('<button data-action="quick-filter" data-filter="limitedRoute">Ограниченный маршрут ×</button>');
    if (state.touristFilters.type !== 'all') chips.push('<button data-action="clear-type-filter">' + h(state.touristFilters.type) + ' ×</button>');
    if (state.touristFilters.group !== 'all') chips.push('<button data-action="clear-group-filter">' + (state.touristFilters.group === 'grouped' ? 'В группе' : 'Без группы') + ' ×</button>');
    if (state.touristFilters.status !== 'all') chips.push('<button data-action="clear-status-filter">' + h(statusLabels[state.stage][state.touristFilters.status]) + ' ×</button>');
    return chips.length ? '<div class="filter-chips">' + chips.join('') + '</div>' : '';
  }

  function touristsView() {
    var visible = filteredTourists();
    var cards = '';
    if (state.touristListMode === 'groups') {
      var groupOrder = [];
      var grouped = {};
      visible.forEach(function (tourist) {
        var groupId = tourist.groupId || 'free';
        if (!grouped[groupId]) { grouped[groupId] = []; groupOrder.push(groupId); }
        grouped[groupId].push(tourist);
      });
      cards = groupOrder.map(function (groupId, index) {
        var members = grouped[groupId];
        return '<section class="tourist-group" style="--group-color:' + ['#6f52d9', '#2f6bd8', '#1f8a50'][index % 3] + '"><div class="tourist-group-head"><span class="group-stripe"></span><div><strong>' + h(groupId === 'free' ? 'Без группы тура' : groupNames[groupId]) + '</strong><span>' + touristCount(members.length) + '</span></div>' + (groupId !== 'free' && capabilities().canGroup && !state.offline ? '<button type="button" class="inline-action" data-action="split-tourist-group" data-group="' + h(groupId) + '">Управлять</button>' : '') + '</div>' + members.map(touristListCard).join('') + '</section>';
      }).join('');
    } else {
      cards = visible.map(touristListCard).join('');
    }
    if (!cards) cards = '<div class="empty-state">' + icon('search') + '<strong>Ничего не найдено</strong><span>Измените запрос или сбросьте фильтры.</span><button type="button" class="secondary-button empty-state-action" data-action="reset-tourist-filters">Сбросить фильтры</button></div>';
    return statusBar() + topBar('Гранд-тур по Китаю', 'Туристы · ' + touristCount(currentTourists().length)) + roleBanner() + workspaceTabs() + summaryTabs() + cityPickerButton() +
      '<main class="scroll"><div class="tourist-search-row"><label class="search-box">' + icon('search') + '<input data-tourist-search value="' + h(state.touristQuery) + '" placeholder="ФИО, телефон, лид или группа"></label><button type="button" class="filter-button" data-action="tourist-filters" aria-label="Фильтры">' + icon('filter') + '</button></div>' + touristFilterChips() + '<div class="summary-tools"><div class="mini-switch"><button class="' + (state.touristListMode === 'list' ? 'active' : '') + '" data-action="tourist-list-mode" data-mode="list">Список</button><button class="' + (state.touristListMode === 'groups' ? 'active' : '') + '" data-action="tourist-list-mode" data-mode="groups">По группам</button></div><button type="button" class="scope-chip ' + (state.scopeLead ? 'active' : '') + '" data-action="toggle-scope">' + (state.scopeLead ? 'Этот лид' : 'Весь тур') + '</button></div><div class="section-row"><div class="section-copy"><strong>Участники тура</strong><span>' + touristCount(visible.length) + ' найдено</span></div>' + (capabilities().canGroup && !state.offline ? '<button type="button" class="add-button" data-action="start-tourist-group">' + icon('users') + 'Группа</button>' : '') + '</div>' + cards + '</main>';
  }

  function documentsView() {
    var scoped = currentTourists().filter(function (tourist) { return !state.scopeLead || tourist.leadId === state.scopeLead; });
    var counts = { attention: 0, expiring: 0, ready: 0 };
    scoped.forEach(function (tourist) {
      var readiness = documentReadiness(tourist);
      if (readiness.category === 'ready') counts.ready += 1;
      else if (readiness.category === 'expiring') counts.expiring += 1;
      else counts.attention += 1;
    });
    var visible = scoped.filter(function (tourist) {
      var readiness = documentReadiness(tourist);
      if (state.documentFilter === 'ready') return readiness.category === 'ready';
      if (state.documentFilter === 'expiring') return readiness.category === 'expiring';
      return readiness.category === 'missing';
    });
    var cards = visible.map(function (tourist) {
      var readiness = documentReadiness(tourist);
      return '<article class="document-card"><div class="document-card-head"><span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(tourist.lead) + '</small></span><span class="readiness-pill ' + readinessClass(readiness.ready, readiness.expiring) + '">' + h(readiness.label) + '</span></div><div class="document-issue">' + icon(readiness.ready ? 'success' : 'alert') + '<span>' + h(readiness.issue) + '</span></div><button type="button" class="secondary-button full-button" data-action="open-tourist-documents" data-id="' + tourist.id + '">Открыть документы</button></article>';
    }).join('');
    if (!cards) cards = '<div class="empty-state">' + icon('document') + '<strong>' + (state.documentFilter === 'ready' ? 'Нет готовых комплектов' : 'Все документы готовы') + '</strong><span>В выбранной очереди нет туристов.</span></div>';
    return statusBar() + topBar('Гранд-тур по Китаю', 'Документы туристов') + roleBanner() + workspaceTabs() + summaryTabs() +
      '<main class="scroll"><div class="document-stats"><button class="' + (state.documentFilter === 'attention' ? 'active' : '') + '" data-action="document-filter" data-filter="attention"><span>Не заполнено</span><strong>' + counts.attention + '</strong></button><button class="' + (state.documentFilter === 'expiring' ? 'active' : '') + '" data-action="document-filter" data-filter="expiring"><span>Истекает</span><strong>' + counts.expiring + '</strong></button><button class="' + (state.documentFilter === 'ready' ? 'active' : '') + '" data-action="document-filter" data-filter="ready"><span>Готово</span><strong>' + counts.ready + '</strong></button></div><div class="form-note">В очереди только реальные данные: паспорт РФ, загранпаспорт и сканы. Виза, страховка и анкета остаются в бэклоге.</div>' + cards + '</main>';
  }

  function workView() {
    var cards = ['arrival', 'hotel', 'departure'].map(function (stage) {
      var rows = scopedTourists(false).map(function (tourist) {
        var content = '<span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(recordSummary(effectiveRecord(stage, tourist.id), stage)) + '</small></span><span class="status-chip">' + h(statusLabel(tourist, currentCity().id, stage)) + '</span>';
        return capabilities().canEditStatuses && !state.offline ? '<button type="button" class="work-person" data-action="change-status" data-id="' + tourist.id + '" data-stage="' + stage + '">' + content + '</button>' : '<div class="work-person readonly-work">' + content + '</div>';
      }).join('');
      return '<section class="work-card"><div class="work-card-head"><span>' + icon(stage === 'hotel' ? 'hotel' : 'plane') + '</span><div><strong>' + h(stageMeta[stage].tab) + '</strong><small>Операционный статус · данные не изменяются</small></div></div>' + rows + '</section>';
    }).join('');
    return statusBar() + topBar('Гранд-тур по Китаю', 'Работа на маршруте') + roleBanner() + workspaceTabs() + cityPickerButton() + '<main class="scroll"><div class="form-note">Выберите конкретный статус. Циклическое переключение отключено.</div>' + cards + '</main>';
  }

  function programView() {
    var canManage = capabilities().canManageProgram && !state.offline;
    var days = programDays.map(function (day, index) {
      return '<article class="day-card"><div class="day-date"><strong>' + h(day.date) + '</strong><span>' + h(day.city) + '</span></div><div class="day-copy"><strong>' + h(day.title) + '</strong><p>' + h(day.text) + '</p></div>' + (canManage ? '<button type="button" class="inline-action" data-action="edit-program" data-index="' + index + '">Изменить</button>' : '') + '</article>';
    }).join('');
    var programActions = canManage ? '<div class="section-row"><div class="section-copy"><strong>Программа тура</strong><span>По дням и городам маршрута</span></div><button type="button" class="add-button" data-action="add-program">' + icon('plus') + 'День</button></div><div class="tool-grid"><button data-action="generate-program"><strong>Сформировать</strong><span>Из шаблона маршрута</span></button><button data-action="regenerate-program"><strong>Обновить</strong><span>Сохранить ручные правки</span></button><button class="danger-tool" data-action="clear-program"><strong>Очистить</strong><span>Все дни программы</span></button></div>' :
      '<div class="section-row"><div class="section-copy"><strong>Программа тура</strong><span>По дням и городам маршрута</span></div></div><div class="form-note">Режим просмотра. Изменять программу могут менеджер и администратор тура.</div>';
    return statusBar() + topBar('Гранд-тур по Китаю', 'Программа · ' + programDays.length + ' дня заполнено') + workspaceTabs() +
      '<main class="scroll">' + programActions + days + '</main>';
  }

  function tourInfoView() {
    var tour = selectedTour();
    var statusLabel = { active: 'АКТИВНЫЙ ТУР', draft: 'ЧЕРНОВИК', archive: 'АРХИВ' }[tour.status] || 'ТУР';
    var description = tour.id === 'china' ? 'Авторский маршрут с четырьмя городскими остановками и повторным Пекином.' : 'Карточка тура открыта из общего мобильного списка. Сводная с демонстрационными данными заполнена для тура по Китаю.';
    var management = capabilities().canManageTour && !state.offline ? '<div class="management-grid"><button data-action="edit-tour"><strong>Изменить</strong><span>Маршрут, даты и команда</span></button><button data-action="copy-tour"><strong>Копировать</strong><span>Создать новый тур</span></button><button data-action="archive-tour"><strong>Архивировать</strong><span>Скрыть из активных</span></button><button class="danger-tool" data-action="cancel-tour"><strong>Отменить тур</strong><span>Нужна причина</span></button></div>' : '<div class="form-note">Режим просмотра. Управление параметрами тура доступно менеджеру и администратору.</div>';
    return statusBar() + topBar(tour.name, capabilities().canManageTour ? 'Параметры и управление туром' : 'Параметры тура · просмотр') + workspaceTabs() +
      '<main class="scroll"><div class="tour-cover" style="--tour-color:' + h(tour.color) + '"><span>' + h(statusLabel) + '</span><strong>' + h(tour.name) + '</strong><small>' + h(tour.dates) + '</small></div><section class="info-card details-card"><div><span>Маршрут</span><strong>' + h(tour.route) + '</strong></div><div><span>Гиды и сопровождающие</span><strong>' + h(tour.guides || 'Не назначены') + '</strong></div><div><span>Участники</span><strong>' + tour.tourists + ' из ' + tour.capacity + ' мест</strong></div><div><span>Администраторы чата</span><strong>Елена Воронова, Игорь Лебедев</strong></div><div><span>Страница тура</span><strong>' + h(tour.site || 'Не указана') + '</strong></div><div><span>Описание</span><strong>' + h(description) + '</strong></div></section>' + management + '</main>';
  }

  function tourTasksView() {
    var canManage = capabilities().canManageTasks && !state.offline;
    var rows = tourTasks.map(function (task, index) {
      var tag = canManage ? 'button' : 'div';
      var action = canManage ? ' data-action="toggle-tour-task" data-index="' + index + '"' : '';
      return '<' + tag + ' class="tour-task ' + (task.done ? 'done' : '') + '"' + action + '><span class="task-check">' + (task.done ? icon('check') : '') + '</span><span><strong>' + h(task.title) + '</strong><small>' + h(task.date) + '</small></span></' + tag + '>';
    }).join('');
    return statusBar() + topBar('Гранд-тур по Китаю', 'Задачи текущего тура') + workspaceTabs() +
      '<main class="scroll"><div class="section-row"><div class="section-copy"><strong>Задачи тура</strong><span>Не заменяют общий раздел CRM-задач</span></div>' + (canManage ? '<button type="button" class="add-button" data-action="add-tour-task">' + icon('plus') + 'Задача</button>' : '') + '</div><div class="form-note">' + (canManage ? 'Здесь показаны только задачи выбранного тура. Полноценный общий раздел задач зафиксирован в бэклоге.' : 'Режим просмотра. Изменять задачи могут менеджер и администратор тура.') + '</div><section class="info-card task-list">' + rows + '</section></main>';
  }

  function unsupportedTourView() {
    var tour = selectedTour();
    var members = currentTourists().map(function (tourist) {
      return '<button type="button" class="tourist-card-main" data-action="tourist-detail" data-id="' + h(tourist.id) + '"><span class="avatar dark">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h((tourist.type || 'Турист') + (tourist.lead ? ' · ' + tourist.lead : '')) + '</small><em>Открыть карточку туриста</em></span><b>›</b></button>';
    }).join('');
    var memberSection = members ? '<section class="info-card"><div class="section-row"><div class="section-copy"><strong>Туристы</strong><span>' + touristCount(currentTourists().length) + ' в сохранённых данных</span></div></div>' + members + '</section>' : '<div class="form-note">В локальных данных пока нет туристов этого тура.</div>';
    return statusBar() + topBar(tour.name, 'Сводная · режим просмотра') +
      '<main class="scroll"><div class="empty-state">' + icon('alert') + '<strong>Сводная тура ещё не подготовлена в MVP</strong><span>Маршрут и операции этого тура не загружены. Китайские mock-данные не используются и изменения недоступны.</span><button type="button" class="secondary-button empty-state-action" data-action="open-tours">Вернуться к списку туров</button></div>' + memberSection + '</main>';
  }

  function bottomNav() {
    var items = [
      { id: 'operations', label: 'Туры', icon: 'tours' },
      { id: 'tourists', label: 'Туристы', icon: 'users' },
      { id: 'leads', label: 'Лиды', icon: 'leads' }
    ];
    return '<nav class="bottom-nav" aria-label="Основная навигация">' + items.map(function (item) {
      var taskViews = ['operations', 'documents', 'work', 'program', 'tour-info', 'tour-tasks'];
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
    var existingGroup = overlay.groupId ? stageGroups(overlay.stage)[overlay.groupId] : null;
    var initialMembers = existingGroup ? existingGroup.members : [];
    var rows = scopedTourists(true).map(function (tourist) {
      var record = effectiveRecord(overlay.stage, tourist.id);
      var outsideRoute = tourist.route.indexOf(currentCity().id) === -1;
      var unconfirmed = !leadConfirmed(tourist);
      var alreadyIncluded = initialMembers.indexOf(tourist.id) !== -1;
      var unavailable = outsideRoute || unconfirmed || alreadyIncluded;
      var note = alreadyIncluded ? 'Уже входит в эту общую запись' : (outsideRoute ? 'Город не входит в маршрут туриста' : (unconfirmed ? 'Логистика доступна после подтверждения лида' : recordSummary(record, overlay.stage) + ' · ' + globalGroupLabel(tourist)));
      return selectionRow(tourist, selected.has(tourist.id), note, unavailable);
    }).join('');
    var canContinue = existingGroup ? selected.size > initialMembers.length : selected.size > 0;
    return '<section class="screen">' + screenHeader('Выберите туристов', cityLabel(currentCity()) + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="selection-head"><strong>Туристы тура</strong><button type="button" class="text-button" data-action="select-all">Выбрать всех</button></div>' +
      '<div class="form-note">Общая запись операции независима от группы тура. Можно выбрать любых участников этого тура и остановки; их личные значения сохранятся.</div>' + (overlay.error ? '<div class="error-note">' + h(overlay.error) + '</div>' : '') + rows + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button>' +
      '<button type="button" class="primary-button blue" data-action="next-operation" ' + (canContinue ? '' : 'disabled') + '>' + (existingGroup ? 'Добавить' : 'Далее') + ' · ' + selected.size + '</button></footer></section>';
  }

  function operationManageScreen(overlay) {
    var group = stageGroups(overlay.stage)[overlay.groupId];
    if (!group) return '<section class="screen">' + screenHeader('Общая запись', 'Связь уже расформирована') + '<div class="screen-scroll"><div class="empty-state"><strong>Группа не найдена</strong><span>Вернитесь в сводную и обновите состав.</span></div></div></section>';
    var rows = group.members.map(function (touristId) {
      var tourist = touristById(touristId);
      return memberRow(tourist, touristId === group.sourceId ? 'Источник общей записи' : 'Индивидуальные данные сохранены');
    }).join('');
    var actions = capabilities().canEditLogistics && !state.offline ? '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="split-operation-members">Отделить</button><button type="button" class="primary-button blue" data-action="add-operation-members">Добавить туристов</button></footer>' : '<footer class="screen-actions single"><button type="button" class="secondary-button" data-action="close-overlay">Закрыть</button></footer>';
    return '<section class="screen">' + screenHeader('Состав общей записи', stageMeta[overlay.stage].tab + ' · ' + cityLabel(currentCity())) + '<div class="screen-scroll"><div class="form-note">subgroupId: ' + h(group.subgroupId) + ' · источник выбран явно. Группа тура не меняется.</div>' + rows + '</div>' + actions + '</section>';
  }

  function touristGroupSelectionScreen(overlay) {
    var selected = overlay.selected;
    var rows = currentTourists().map(function (tourist) {
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
    var candidates = globalSplit ? currentTourists().filter(function (tourist) { return tourist.groupId === overlay.groupId; }) :
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

  function splitSourceScreen(overlay) {
    var candidates = overlay.remaining.filter(function (id) { return hasData(stageRecords(overlay.stage)[id], overlay.stage); });
    var rows = candidates.map(function (id) {
      var tourist = touristById(id);
      var active = overlay.sourceId === id;
      return '<button type="button" class="source-card ' + (active ? 'active' : '') + '" data-action="pick-split-source" data-id="' + h(id) + '"><span class="radio"></span><span class="avatar">' + h(tourist.initials) +
        '</span><span class="member-copy"><strong>' + h(tourist.name) + '</strong><span>' + h(recordSummary(stageRecords(overlay.stage)[id], overlay.stage)) + '</span></span></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Основная запись после отделения', cityLabel(currentCity()) + ' · ' + stageMeta[overlay.stage].tab) + '<div class="screen-scroll"><div class="warning">Отделяемый турист был источником общей записи. Выберите, чьи индивидуальные данные будут показываться оставшимся участникам.</div>' +
      rows + '</div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="back-to-operation-split">Назад</button><button type="button" class="primary-button blue" data-action="confirm-operation-split" ' + (overlay.sourceId ? '' : 'disabled') + '>Отделить</button></footer></section>';
  }

  function pointPickerScreen(overlay) {
    var query = String(overlay.query || '').trim().toLowerCase();
    var type = pointTypeForTransport(state.draft && state.draft.transport);
    var options = activePointsFor(currentCity(), state.draft && state.draft.transport).filter(function (point) {
      return !query || [point.name, point.code].join(' ').toLowerCase().indexOf(query) !== -1;
    });
    var rows = options.map(function (point) {
      var selected = state.draft && state.draft.pointId === point.id;
      return '<button type="button" class="directory-option ' + (selected ? 'selected' : '') + '" data-action="select-point" data-id="' + h(point.id) + '">' +
        '<span class="directory-option-icon">' + icon('pin') + '</span><span><strong>' + h(point.name) + '</strong><small>' +
        h(pointTypeLabel(point.type, false) + ' · ' + currentCity().name) + '</small></span><b>' + h(point.code || '›') + '</b></button>';
    }).join('');
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay" aria-label="Закрыть выбор точки"></button><section class="sheet" aria-label="Выбор транспортной точки"><span class="sheet-handle"></span>' +
      '<header class="sheet-head"><div class="screen-title"><strong>Транспортная точка</strong><span>' + h(cityLabel(currentCity()) + ' · ' + pointTypeLabel(type, true)) + '</span></div>' +
      '<button type="button" class="close-button" data-action="close-overlay" aria-label="Закрыть">' + icon('close') + '</button></header><div class="sheet-scroll">' +
      '<label class="search-box directory-search">' + icon('search') + '<input data-point-search value="' + h(overlay.query || '') + '" placeholder="Название или код"></label>' +
      (rows || '<div class="empty-state">' + icon('pin') + '<strong>Ничего не найдено</strong><span>Измените запрос или укажите значение вручную.</span><button type="button" class="secondary-button empty-state-action" data-action="use-manual-point">Указать вручную</button></div>') + '</div></section></div>';
  }

  function directoryScreen() {
    var canManageDirectory = capabilities().canManageDirectory && !state.offline;
    var directoryNote = state.offline ? 'Нет подключения. Справочник доступен только для просмотра, изменения не сохраняются.' :
      (canManageDirectory ? 'Изменения сохраняются только в этом браузере и сразу доступны в мобильной сводной.' : 'Режим просмотра. Изменение справочника доступно только администратору.');
    var query = state.directoryQuery.trim().toLowerCase();
    var cityCards = directory.cities.filter(function (city) {
      return !query || [city.name, city.country, city.aliases].join(' ').toLowerCase().indexOf(query) !== -1;
    }).map(function (city) {
      var points = directory.points.filter(function (point) { return point.cityId === city.id && point.active; });
      var airports = points.filter(function (point) { return point.type === 'airport'; }).length;
      var rail = points.filter(function (point) { return point.type === 'railway_station'; }).length;
      var bus = points.filter(function (point) { return point.type === 'bus_station'; }).length;
      return '<button type="button" class="directory-city-card ' + (city.active ? '' : 'inactive') + '" data-action="open-directory-city" data-id="' + h(city.id) + '"><span class="directory-option-icon">' +
        icon('pin') + '</span><span><strong>' + h(city.name) + '</strong><small>' + h(city.country + ' · ' + pointCountLabel(airports, 'airport') + ' · ' + pointCountLabel(rail, 'railway_station') + ' · ' + pointCountLabel(bus, 'bus_station')) +
        '</small></span><b>' + (city.active ? '›' : 'Архив') + '</b></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Города и точки', 'Настройки CRM · mock-справочник') + '<div class="screen-scroll"><div class="form-note">' +
      directoryNote + '</div>' +
      '<label class="search-box directory-search">' + icon('search') + '<input data-directory-search value="' + h(state.directoryQuery) + '" placeholder="Найти город"></label>' +
      (cityCards || '<div class="empty-state">' + icon('pin') + '<strong>Города не найдены</strong><span>Измените поиск или добавьте город.</span></div>') +
      '</div>' + (canManageDirectory ? '<footer class="screen-actions single"><button type="button" class="primary-button blue" data-action="new-directory-city">' + icon('plus') + 'Добавить город</button></footer>' : '') + '</section>';
  }

  function directoryCityScreen(overlay) {
    var city = directoryCityById(overlay.cityId);
    if (!city) return directoryScreen();
    var canManageDirectory = capabilities().canManageDirectory && !state.offline;
    var points = directory.points.filter(function (point) { return point.cityId === city.id; }).sort(function (left, right) {
      return pointDisplay(left).localeCompare(pointDisplay(right), 'ru');
    });
    var rows = points.map(function (point) {
      var used = pointIsUsed(point.id);
      var pointSummary = '<span class="directory-option-icon">' + icon('pin') + '</span><span><strong>' + h(point.name) + '</strong><small>' +
        h(pointTypeLabel(point.type, false) + (used ? ' · используется' : '') + (point.active ? '' : ' · архив')) + '</small></span><b>' + h(point.code || '›') + '</b>';
      if (!canManageDirectory) return '<article class="directory-point-card ' + (point.active ? '' : 'inactive') + '"><div class="directory-point-summary">' + pointSummary + '</div></article>';
      return '<article class="directory-point-card ' + (point.active ? '' : 'inactive') + '"><button type="button" data-action="edit-directory-point" data-id="' + h(point.id) + '">' + pointSummary + '</button><div><button type="button" class="inline-action" data-action="toggle-directory-point" data-id="' + h(point.id) + '">' +
        (point.active ? 'Архивировать' : 'Восстановить') + '</button>' + (used ? '' : '<button type="button" class="inline-action danger-text" data-action="delete-directory-point" data-id="' + h(point.id) + '">Удалить</button>') + '</div></article>';
    }).join('');
    var linkedToRoute = cities.some(function (routeCity) { return routeCity.catalogCityId === city.id; });
    var hasPoints = directory.points.some(function (point) { return point.cityId === city.id; });
    var cityActions = canManageDirectory ? '<div class="directory-city-actions"><button type="button" class="secondary-button" data-action="toggle-directory-city" data-id="' + h(city.id) + '">' +
      (city.active ? 'Архивировать город' : 'Восстановить город') + '</button>' + ((!linkedToRoute && !hasPoints) ? '<button type="button" class="danger-button" data-action="delete-directory-city" data-id="' + h(city.id) + '">Удалить город</button>' : '') + '</div>' : '';
    var directoryToolbar = canManageDirectory ? '<div class="directory-toolbar"><button type="button" class="secondary-button" data-action="edit-directory-city" data-id="' +
      h(city.id) + '">Изменить город</button><button type="button" class="primary-button blue" data-action="new-directory-point" data-city="' + h(city.id) + '">' + icon('plus') + 'Добавить точку</button></div>' :
      '<div class="form-note">' + (state.offline ? 'Нет подключения. Город и транспортные точки доступны только для просмотра.' : 'Режим просмотра. Изменение города и транспортных точек доступно только администратору.') + '</div>';
    return '<section class="screen">' + screenHeader(city.name, city.country + (city.active ? '' : ' · архив')) + '<div class="screen-scroll"><section class="info-card details-card"><div><span>Альтернативные названия</span><strong>' +
      h(city.aliases || 'Не указаны') + '</strong></div><div><span>Статус</span><strong>' + (city.active ? 'Активен' : 'В архиве') + '</strong></div></section>' + directoryToolbar + cityActions +
      '<div class="section-row"><div class="section-copy"><strong>Транспортные точки</strong><span>Аэропорты, ж/д и автовокзалы</span></div></div>' +
      (rows || '<div class="empty-state">' + icon('pin') + '<strong>Точек пока нет</strong><span>В мобильной форме будет доступен ручной ввод.</span></div>') +
      '</div></section>';
  }

  function directoryCityFormScreen(overlay) {
    var city = overlay.cityId ? directoryCityById(overlay.cityId) : null;
    var item = city || { name: '', country: '', aliases: '', active: true };
    return '<section class="screen"><form id="directory-city-form" class="screen-form" data-id="' + h(city ? city.id : '') + '">' +
      screenHeader(city ? 'Изменить город' : 'Новый город', 'Справочник UNIQUE') + '<div class="screen-scroll">' +
      simpleField('Название *', 'name', item.name, 'text', 'Например, Пекин') + simpleField('Страна *', 'country', item.country, 'text', 'Китай') +
      simpleField('Альтернативные названия', 'aliases', item.aliases, 'text', 'Beijing, 北京') + '<label class="field"><span>Статус</span><select name="active"><option value="true" ' +
      (item.active ? 'selected' : '') + '>Активен</option><option value="false" ' + (!item.active ? 'selected' : '') + '>Архив</option></select></label></div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
  }

  function directoryPointFormScreen(overlay) {
    var point = overlay.pointId ? directoryPointById(overlay.pointId) : null;
    var cityId = point ? point.cityId : overlay.cityId;
    var item = point || { name: '', code: '', type: 'airport', active: true };
    var city = directoryCityById(cityId);
    return '<section class="screen"><form id="directory-point-form" class="screen-form" data-id="' + h(point ? point.id : '') + '" data-city="' + h(cityId) + '">' +
      screenHeader(point ? 'Изменить точку' : 'Новая точка', city ? city.name : 'Город') + '<div class="screen-scroll"><label class="field"><span>Тип *</span><select name="type">' +
      [['airport','Аэропорт'],['railway_station','Ж/д вокзал'],['bus_station','Автовокзал']].map(function (option) { return '<option value="' + option[0] + '" ' + (item.type === option[0] ? 'selected' : '') + '>' + option[1] + '</option>'; }).join('') +
      '</select></label>' + simpleField('Название *', 'name', item.name, 'text', 'Название точки') + simpleField('Код', 'code', item.code, 'text', 'Например, PEK') +
      '<label class="field"><span>Статус</span><select name="active"><option value="true" ' + (item.active ? 'selected' : '') + '>Активна</option><option value="false" ' + (!item.active ? 'selected' : '') + '>Архив</option></select></label></div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
  }

  function deleteDirectoryPointScreen(overlay) {
    var point = directoryPointById(overlay.pointId);
    return '<section class="screen">' + screenHeader('Удалить точку', point ? point.name : 'Транспортная точка') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Удалить без возможности восстановления?</strong><span>Удаление доступно только для неиспользуемой точки. Исторические записи не изменятся.</span></div></div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="danger-button" data-action="confirm-delete-directory-point" data-id="' + h(overlay.pointId) + '">Удалить</button></footer></section>';
  }

  function deleteDirectoryCityScreen(overlay) {
    var city = directoryCityById(overlay.cityId);
    return '<section class="screen">' + screenHeader('Удалить город', city ? city.name : 'Город') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Удалить город без возможности восстановления?</strong><span>Действие доступно только для города без маршрутов и транспортных точек.</span></div></div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="danger-button" data-action="confirm-delete-directory-city" data-id="' + h(overlay.cityId) + '">Удалить</button></footer></section>';
  }

  function discardFormScreen(overlay) {
    return '<section class="screen"><header class="screen-header"><button type="button" class="back-button" data-action="continue-editing" aria-label="Вернуться к форме">' + icon('back') + '</button><div class="screen-title"><strong>Закрыть без сохранения?</strong><span>Черновик общей записи изменён</span></div></header>' +
      '<div class="screen-scroll"><div class="conflict-summary"><strong>Внесённые изменения будут потеряны</strong><span>Вернитесь к форме или подтвердите выход без сохранения.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="continue-editing">Продолжить</button><button type="button" class="danger-button" data-action="discard-form">Не сохранять</button></footer></section>';
  }

  function fieldControl(field, value) {
    if (field.type === 'select') {
      return '<label class="field"><span>' + h(field.label) + '</span><select data-field="' + field.key + '">' +
        '<option value="">Не выбран</option>' +
        ['plane', 'train', 'bus', 'car'].map(function (valueOption) {
          return '<option value="' + valueOption + '" ' + (value === valueOption ? 'selected' : '') + '>' + transportLabel(valueOption) + '</option>';
        }).join('') + '</select></label>';
    }
    if (field.type === 'point') {
      var type = pointTypeForTransport(state.draft.transport);
      var options = activePointsFor(currentCity(), state.draft.transport);
      var selectedPoint = directoryPointById(state.draft.pointId);
      var helper = '';
      if (!type) {
        return '<label class="field"><span>' + h(field.label) + '</span><input data-field="point" type="text" value="' + h(value) + '" placeholder="Укажите место вручную"><small class="field-help">Для автомобиля используется ручной ввод.</small></label>';
      }
      if (options.length === 0 || state.draft.pointManual) {
        helper = '<small class="field-help warning-help">Не из справочника · нет подходящей точки типа «' + h(pointTypeLabel(type, false)) + '». Значение не будет добавлено автоматически.</small>';
        return '<label class="field"><span>' + h(field.label) + '</span><input data-field="point" data-manual-point="true" type="text" value="' + h(value) + '" placeholder="Указать вручную">' + helper + '</label>';
      }
      if (state.draft.pointAutofilled && selectedPoint) helper = '<small class="field-help success-help">Подставлено из справочника · можно изменить</small>';
      else helper = '<small class="field-help">Доступно в городе: ' + options.length + ' · ' + h(pointTypeLabel(type, false)) + '</small>';
      return '<div class="field"><span>' + h(field.label) + '</span><button type="button" class="point-selector ' + (selectedPoint ? 'selected' : '') + '" data-action="open-point-picker"><span>' + icon('pin') + '</span><span><strong>' +
        h(selectedPoint ? pointDisplay(selectedPoint) : 'Выбрать точку') + '</strong><small>' + h(selectedPoint ? pointTypeLabel(selectedPoint.type, false) + ' · ' + currentCity().name : 'Только для выбранного города') + '</small></span><b>›</b></button>' + helper + '</div>';
    }
    return '<label class="field"><span>' + h(field.label) + '</span><input data-field="' + field.key + '" type="' + field.type +
      '" value="' + h(value) + '" placeholder="' + h(field.placeholder || '') + '"></label>';
  }

  function formSheet(overlay) {
    syncDraftPoint();
    var sourceIds = distinctSources(overlay.members, overlay.stage);
    var personalEdit = overlay.editMode === 'own';
    var sharedEdit = overlay.editMode === 'shared';
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
    var title = personalEdit ? 'Личная запись' : (sharedEdit ? 'Общая запись' : stageMeta[overlay.stage].add);
    var warning = sourceIds.length > 1 ? '<div class="warning">У выбранных туристов разные данные. Перед сохранением покажем экран сверки.</div>' : '';
    var editNote = personalEdit ? '<div class="form-note">Изменения сохранятся только в личных данных туриста. Пока турист входит в общую запись, в сводной продолжат отображаться общие данные.</div>' :
      (sharedEdit ? '<div class="form-note">Изменяется общая запись и её источник. Личные данные участников сохранятся без изменений.</div>' :
        '<div class="form-note">Изменения применятся только к разделу «' + stageMeta[overlay.stage].tab + '» выбранного города.</div>');
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay" aria-label="Закрыть форму"></button>' +
      '<section class="sheet" aria-label="' + h(title) + '"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>' +
      h(title) + '</strong><span>' + touristCount(overlay.members.length) + ' · ' + h(cityLabel(currentCity())) + '</span></div>' +
      '<button type="button" class="close-button" data-action="close-overlay" aria-label="Закрыть">' + icon('close') + '</button></header>' +
      '<div class="sheet-scroll">' + editNote + warning + sources + '<div class="selection-head"><strong>Данные записи</strong></div>' + controls + '</div>' +
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
      '<div class="screen-scroll"><div class="conflict-summary"><strong>Найдены разные записи</strong><span>Выберите индивидуальную запись, которую будет показывать новая общая запись. Исходные данные остальных туристов сохранятся.</span></div>' +
      '<div class="selection-head"><strong>Основная запись</strong><span>обязательно</span></div>' + sourceCards +
      '<div class="selection-head"><strong>Что отличается</strong><span>' + differing.length + ' поля</span></div>' + comparisons + '</div>' +
      '<footer class="screen-actions"><button type="button" class="secondary-button" data-action="back-to-form">Назад</button>' +
      '<button type="button" class="primary-button blue" data-action="apply-conflict" ' + (overlay.sourceId ? '' : 'disabled') + '>Создать общую запись</button></footer></section>';
  }

  function toursScreen(overlay) {
    var labels = { active: 'Активные', draft: 'Черновики', archive: 'Архив' };
    var query = state.tourQuery.trim().toLowerCase();
    var filtered = tours.filter(function (tour) { return tour.status === state.tourFilter && (!query || [tour.name, tour.route, tour.guides].join(' ').toLowerCase().indexOf(query) !== -1); });
    var cards = filtered.map(function (tour) {
      return '<article class="tour-list-card" style="--tour-color:' + h(tour.color) + '"><button type="button" data-action="select-tour" data-id="' + tour.id + '"><span class="tour-list-state">' + h(labels[tour.status]) + '</span><strong>' + h(tour.name) + '</strong><small>' + h(tour.dates + ' · ' + tour.route) + '</small><div><span>' + tour.tourists + ' / ' + tour.capacity + ' мест</span><span>' + h(tour.guides || 'Гид не назначен') + '</span></div></button><button type="button" class="card-more" data-action="tour-card-menu" data-id="' + tour.id + '">' + icon('more') + '</button></article>';
    }).join('');
    var createAction = capabilities().canManageTour && !state.offline ? '<footer class="screen-actions single"><button type="button" class="primary-button" data-action="new-tour">' + icon('plus') + 'Создать тур</button></footer>' : '';
    var readOnlyNote = state.offline ? '<div class="form-note">Нет подключения. Список туров доступен без создания и изменений.</div>' :
      (capabilities().canManageTour ? '' : '<div class="form-note">Режим просмотра. Создание и управление турами недоступно для роли «' + h(roleLabels[state.role]) + '».</div>');
    return '<section class="screen">' + screenHeader('Туры', capabilities().canManageTour ? 'Список, создание и архив' : 'Список туров · просмотр') + '<div class="screen-scroll">' + readOnlyNote + '<div class="filter-tabs">' + Object.keys(labels).map(function (status) {
      return '<button type="button" class="' + (state.tourFilter === status ? 'active' : '') + '" data-action="tour-filter" data-filter="' + status + '">' + labels[status] + '</button>';
    }).join('') + '</div><label class="search-box">' + icon('search') + '<input data-tour-search value="' + h(state.tourQuery) + '" placeholder="Название, город или гид"></label><div class="tour-stats compact-stats"><div><span>Туров</span><strong>' + filtered.length + '</strong></div><div><span>Туристов</span><strong>' + filtered.reduce(function (sum, tour) { return sum + tour.tourists; }, 0) + '</strong></div><div><span>Свободно</span><strong>' + filtered.reduce(function (sum, tour) { return sum + tour.capacity - tour.tourists; }, 0) + '</strong></div></div>' + (cards || '<div class="empty-state"><strong>Туров нет</strong><span>Измените фильтр или создайте новый.</span></div>') + '</div>' + createAction + '</section>';
  }

  function tourMenuScreen(overlay) {
    var tourId = overlay.tourId || state.selectedTourId;
    var tour = tours.find(function (item) { return item.id === tourId; }) || (tourId === state.selectedTourId ? selectedTour() : null);
    var title = tour ? tour.name : 'Выбранный тур';
    var viewActions = '<button data-action="view-tour-info"><span>' + icon('tours') + '</span><div><strong>О туре</strong><small>Маршрут, команда и параметры</small></div><b>›</b></button>' +
      (tourHasOperationalModel(tourId) ? '<button data-action="view-tour-tasks"><span>' + icon('check') + '</span><div><strong>Задачи тура</strong><small>Операционные задачи выбранного тура</small></div><b>›</b></button>' : '');
    var manageActions = canManageTourId(tourId) && tour && !state.offline ? '<button data-action="edit-tour"><span>' + icon('settings') + '</span><div><strong>Изменить тур</strong><small>Маршрут, даты и команда</small></div><b>›</b></button><button data-action="copy-tour"><span>' + icon('tours') + '</span><div><strong>Копировать</strong><small>Создать тур с теми же настройками</small></div><b>›</b></button><button class="danger-row" data-action="archive-tour"><span>' + icon('archive') + '</span><div><strong>Архивировать</strong><small>Скрыть из активных туров</small></div><b>›</b></button><button class="danger-row" data-action="cancel-tour"><span>' + icon('close') + '</span><div><strong>Отменить тур</strong><small>Сохранить данные и указать причину</small></div><b>›</b></button>' : '';
    var directoryAction = '<button data-action="open-directory"><span>' + icon('pin') + '</span><div><strong>Города и точки</strong><small>' +
      (capabilities().canManageDirectory && !state.offline ? 'Аэропорты, ж/д и автовокзалы' : 'Просмотр справочника') + '</small></div><b>›</b></button>';
    var readOnlyNote = manageActions ? '' : '<div class="form-note">Режим просмотра. Управляющие действия для этого тура недоступны.</div>';
    return '<section class="screen">' + screenHeader('Действия с туром', title) + '<div class="screen-scroll">' + readOnlyNote + '<div class="action-menu">' + viewActions + manageActions + directoryAction + '</div></div></section>';
  }

  function touristDetailScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    if (!tourist) return '<section class="screen">' + screenHeader('Турист не найден', 'Данные могли измениться') + '<div class="screen-scroll"><div class="empty-state error-state">' + icon('alert') + '<strong>Не удалось открыть карточку</strong><span>Вернитесь к сводной и повторите.</span></div></div></section>';
    var personal = personalReadiness(tourist);
    var documents = documentReadiness(tourist);
    var domestic = documents.domestic;
    var foreign = documents.foreign;
    var expanded = overlay.expanded || new Set();
    var capability = capabilities();
    var canSeePrivate = canSeePrivateFor(tourist);

    function profileValue(label, value, privateField) {
      if (privateField && !canSeePrivate) return '';
      return '<div class="profile-value"><span>' + h(label) + '</span><strong>' + h(value || 'Не заполнено') + '</strong></div>';
    }

    function section(id, title, status, content, editable) {
      var open = expanded.has(id);
      return '<article class="profile-section ' + (open ? 'open' : '') + '"><button type="button" class="profile-section-head" data-action="toggle-profile-section" data-section="' + id + '"><span><strong>' + h(title) + '</strong><small>' + h(status) + '</small></span><b>⌄</b></button>' + (open ? '<div class="profile-section-body">' + content + (editable && canEditProfileFor(tourist) && !state.offline ? '<button type="button" class="secondary-button full-button" data-action="edit-profile-section" data-id="' + tourist.id + '" data-section="' + id + '">' + icon('edit') + 'Изменить раздел</button>' : '') + '</div>' : '') + '</article>';
    }

    var personalContent = profileValue('Фамилия', tourist.lastName) + profileValue('Имя', tourist.firstName) + profileValue('Отчество', tourist.middleName) + profileValue('Дата рождения', tourist.birthDate) + profileValue('Гражданство', tourist.citizenship) + profileValue('Телефон', tourist.phone) + profileValue('Email', tourist.email, true) + profileValue('Тип туриста', tourist.type);
    var domesticContent = tourist.citizenship !== 'Россия' ? '<div class="form-note">Для гражданина другой страны блок паспорта РФ не применяется. Ранее сохранённые значения прототип не удаляет.</div>' : profileValue('Серия и номер', tourist.domesticPassport) + profileValue('Кем выдан', tourist.domesticIssuedBy) + profileValue('Адрес регистрации', tourist.registrationAddress);
    var scans = (tourist.scans || []).map(function (scan) {
      return '<div class="scan-row"><span>' + icon('document') + '</span><span><strong>' + h(scan.name) + '</strong><small>Скан загранпаспорта · mock</small></span><button type="button" data-action="view-scan" data-id="' + tourist.id + '" data-scan="' + scan.id + '" aria-label="Посмотреть скан">' + icon('eye') + '</button></div>';
    }).join('');
    var documentActions = canManageDocumentsFor(tourist) && !state.offline ? '<div class="document-actions"><button type="button" data-action="add-scan" data-id="' + tourist.id + '">' + icon('camera') + '<span>Сфотографировать</span></button><button type="button" data-action="upload-scan" data-id="' + tourist.id + '">' + icon('upload') + '<span>Выбрать файл</span></button><button type="button" data-action="open-ocr-review" data-id="' + tourist.id + '">' + icon('document') + '<span>Запустить OCR</span></button></div>' : '';
    var foreignContent = profileValue('ФИО латиницей', tourist.latinName) + profileValue('Номер', tourist.passport) + profileValue('Годен до', tourist.passportExpiry) + (scans || '<div class="empty-inline">Сканы не загружены</div>') + documentActions;
    var logisticsContent = visibleRouteCities().filter(function (city) { return tourist.route.indexOf(city.id) !== -1; }).map(function (city) {
      var routePosition = cities.indexOf(city);
      var rows = ['arrival', 'hotel', 'departure'].map(function (stage) {
        var own = ownRecordAt(city.id, stage, tourist.id);
        var effective = effectiveRecordAt(city.id, stage, tourist.id);
        var origin = operationOriginAt(city.id, stage, tourist.id);
        var ownDiffers = origin.kind === 'shared' && recordSummary(own, stage) !== recordSummary(effective, stage);
        var canEditOwn = origin.kind === 'shared' && origin.source && origin.source.id !== tourist.id && canEditLogisticsForAt(tourist, city.id) && !state.offline;
        var ownAction = canEditOwn ? '<button type="button" class="text-button" data-action="edit-own-operation" data-id="' + tourist.id + '" data-route-city-id="' + city.id + '" data-stage="' + stage + '">Изменить личную запись</button>' : '';
        return '<button type="button" class="profile-operation" data-action="jump-profile-operation" data-id="' + tourist.id + '" data-route-city-id="' + city.id + '" data-stage="' + stage + '"><span><strong>' + h(stageMeta[stage].tab) + '</strong><small>' + h(recordSummary(effective, stage)) + '</small></span><span><em>' + h(origin.label) + '</em>' + (ownDiffers ? '<small>Личная: ' + h(recordSummary(own, stage)) + '</small>' : '') + '</span><b>›</b></button>' + ownAction;
      }).join('');
      return '<section class="route-city-card"><div><strong>' + h(cityLabel(city)) + '</strong><span>' + h(city.dates) + ' · остановка ' + (routePosition + 1) + '</span></div>' + rows + '</section>';
    }).join('');
    var linksContent = profileValue('Исходный лид', tourist.lead + ' · ' + tourist.leadStatus) + profileValue('Статус участия', tourist.tourStatus) + profileValue('Группа тура', globalGroupLabel(tourist)) + profileValue('Представитель группы', tourist.groupRepresentative ? 'Да' : 'Нет') + profileValue('Основной турист заявки', tourist.isPrimary ? 'Да' : 'Нет') + '<button type="button" class="secondary-button full-button" data-action="open-source-lead" data-id="' + tourist.leadId + '">Открыть исходный лид</button>';
    var commentsContent = profileValue('Комментарий для гида', tourist.guideComment) + profileValue('Внутренняя заметка', tourist.internalNote, true);
    var attentionCount = Number(!personal.ready) + Number(domestic.category === 'missing') + Number(foreign.category !== 'ready');
    var editButton = canEditProfileFor(tourist) && !state.offline ? '<button type="button" class="icon-button" data-action="edit-profile-section" data-id="' + tourist.id + '" data-section="personal" aria-label="Изменить личные данные">' + icon('edit') + '</button>' : '';
    var deleteButton = capability.canDelete && !state.offline ? '<button type="button" class="danger-button full-button" data-action="delete-tourist" data-id="' + tourist.id + '">Удалить туриста</button>' : '';

    var statusSummary = tourHasOperationalModel(state.selectedTourId) ? '<div class="status-grid"><div><span>Прибытие</span><strong>' + h(statusLabel(tourist, currentCity().id, 'arrival')) + '</strong></div><div><span>Отель</span><strong>' + h(statusLabel(tourist, currentCity().id, 'hotel')) + '</strong></div><div><span>Отъезд</span><strong>' + h(statusLabel(tourist, currentCity().id, 'departure')) + '</strong></div></div>' : '<div class="form-note">Операционные статусы этого тура ещё не загружены в MVP.</div>';

    return '<section class="screen"><header class="screen-header"><button type="button" class="back-button" data-action="close-overlay" aria-label="Назад">' + icon('back') + '</button><div class="screen-title"><strong>' + h(tourist.name) + '</strong><span>' + h(tourist.lead) + '</span></div>' + editButton + '</header><div class="screen-scroll profile-scroll">' + (canEditProfileFor(tourist) ? '' : roleBanner(tourist)) + '<div class="person-hero profile-hero"><span class="avatar dark">' + h(tourist.initials) + '</span><div><strong>' + h(tourist.name) + '</strong><span>' + h(tourist.type + ' · Группа тура: ' + globalGroupLabel(tourist)) + '</span></div></div><div class="profile-badges"><span class="state-pill">Лид · ' + h(tourist.leadStatus) + '</span><span class="group-pill">Участие · ' + h(tourist.tourStatus) + '</span>' + (tourist.isPrimary ? '<span class="count-pill">Основной в заявке</span>' : '') + '</div>' + (attentionCount ? '<div class="attention-card">' + icon('alert') + '<span><strong>Нужно проверить ' + attentionCount + ' ' + (attentionCount === 1 ? 'раздел' : 'раздела') + '</strong><small>' + h([!personal.ready ? personal.label : '', domestic.category === 'missing' ? domestic.label : '', foreign.category !== 'ready' ? foreign.issue : ''].filter(Boolean).join(' · ')) + '</small></span></div>' : '<div class="success-note">Профиль и документы готовы к поездке.</div>') + '<div class="quick-actions"><button type="button" data-action="call-tourist" data-id="' + tourist.id + '">' + icon('phone') + '<span>Позвонить</span></button><button type="button" data-action="message-tourist" data-id="' + tourist.id + '">' + icon('chat') + '<span>Написать</span></button><button type="button" data-action="copy-tourist-contact" data-id="' + tourist.id + '">' + icon('document') + '<span>Копировать</span></button></div>' + statusSummary +
      section('personal', 'Личные данные', personal.label, personalContent, true) +
      (canSeePrivate ? section('domestic', 'Паспорт РФ', domestic.label, domesticContent, domestic.category !== 'not-required') : '') +
      section('foreign', 'Загранпаспорт и сканы', foreign.label, foreignContent, true) +
      section('logistics', 'Маршрут и логистика', tourist.route.length + ' остановки · own / effective', logisticsContent, false) +
      section('links', 'Связи и группы', globalGroupLabel(tourist), linksContent, true) +
      section('comments', 'Комментарии', tourist.guideComment ? 'Комментарий для гида заполнен' : 'Не заполнено', commentsContent, true) + deleteButton + '</div></section>';
  }

  function profileEditScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    var section = overlay.section;
    var title = { personal: 'Личные данные', domestic: 'Паспорт РФ', foreign: 'Загранпаспорт', links: 'Связи и группы', comments: 'Комментарии' }[section] || 'Данные туриста';
    var fieldErrors = overlay.fieldErrors || {};
    function fieldError(name) {
      return fieldErrors[name] ? '<small class="field-error" id="error-' + h(name) + '" role="alert">' + h(fieldErrors[name]) + '</small>' : '';
    }
    function profileInput(label, name, value, type, required) {
      var describedBy = fieldErrors[name] ? ' aria-describedby="error-' + h(name) + '" aria-invalid="true"' : '';
      return '<label class="field"><span>' + h(label) + (required ? ' *' : '') + '</span><input name="' + h(name) + '" type="' + h(type || 'text') + '" value="' + h(value || '') + '" ' + (required ? 'required ' : '') + describedBy + '>' + fieldError(name) + '</label>';
    }
    function profileSelect(label, name, options, current, required) {
      var describedBy = fieldErrors[name] ? ' aria-describedby="error-' + h(name) + '" aria-invalid="true"' : '';
      return '<label class="field"><span>' + h(label) + (required ? ' *' : '') + '</span><select name="' + h(name) + '" ' + (required ? 'required ' : '') + describedBy + '>' + options.map(function (option) {
        var value = Array.isArray(option) ? option[0] : option;
        var optionLabel = Array.isArray(option) ? option[1] : option;
        return '<option value="' + h(value) + '" ' + (String(current) === String(value) ? 'selected' : '') + '>' + h(optionLabel) + '</option>';
      }).join('') + '</select>' + fieldError(name) + '</label>';
    }
    var controls = '';
    if (section === 'personal') {
      controls = profileInput('Фамилия', 'lastName', tourist.lastName, 'text', true) + profileInput('Имя', 'firstName', tourist.firstName, 'text', true) + profileInput('Отчество', 'middleName', tourist.middleName, 'text', tourist.isPrimary) + profileInput('Дата рождения', 'birthDate', tourist.birthDate, 'date', true) + profileSelect('Гражданство', 'citizenship', ['Россия', 'Казахстан'], tourist.citizenship, true) + profileInput('Телефон', 'phone', tourist.phone, 'tel', tourist.isPrimary) + (canSeePrivateFor(tourist) ? profileInput('Email', 'email', tourist.email, 'email', tourist.isPrimary) : '') + profileSelect('Тип туриста', 'type', ['Взрослый','Ребёнок','Младенец'], tourist.type, false);
    } else if (section === 'domestic') {
      controls = tourist.citizenship !== 'Россия' ? '<div class="form-note">Для гражданина другой страны паспорт РФ не требуется. Сохранённые значения не удаляются.</div>' : profileInput('Серия и номер', 'domesticPassport', tourist.domesticPassport, 'text', tourist.isPrimary) + profileInput('Кем выдан', 'domesticIssuedBy', tourist.domesticIssuedBy, 'text', tourist.isPrimary) + profileInput('Адрес регистрации', 'registrationAddress', tourist.registrationAddress, 'text', false);
    } else if (section === 'foreign') {
      controls = profileInput('ФИО латиницей', 'latinName', tourist.latinName, 'text', true) + profileInput('Номер загранпаспорта', 'passport', tourist.passport, 'text', true) + profileInput('Годен до', 'passportExpiry', tourist.passportExpiry, 'date', true) + '<div class="form-note">Сканы и OCR доступны в карточке раздела. Распознанные значения применяются только после сверки.</div>';
    } else if (section === 'links') {
      controls = '<label class="field"><span>Основной турист заявки</span><select name="isPrimary"><option value="true" ' + (tourist.isPrimary ? 'selected' : '') + '>Да</option><option value="false" ' + (!tourist.isPrimary ? 'selected' : '') + '>Нет</option></select><small class="field-help">Единственного основного туриста нельзя снять без выбора замены.</small></label><label class="field"><span>Представитель группы тура</span><select name="groupRepresentative"><option value="true" ' + (tourist.groupRepresentative ? 'selected' : '') + '>Да</option><option value="false" ' + (!tourist.groupRepresentative ? 'selected' : '') + '>Нет</option></select></label>';
    } else if (section === 'comments') {
      controls = '<label class="field"><span>Комментарий для гида</span><textarea name="guideComment" rows="4">' + h(tourist.guideComment) + '</textarea></label>' + (canSeePrivateFor(tourist) ? '<label class="field"><span>Внутренняя заметка</span><textarea name="internalNote" rows="4">' + h(tourist.internalNote) + '</textarea></label>' : '');
    }
    return '<section class="screen"><form id="profile-section-form" class="screen-form" data-id="' + tourist.id + '" data-section="' + section + '" novalidate>' + screenHeader(title, tourist.name) + '<div class="screen-scroll"><div class="form-note">Изменения сохраняются в канонической mock-карточке туриста и видны во всех разделах прототипа.</div>' + (overlay.error ? '<div class="error-note" role="alert">' + h(overlay.error) + '</div>' : '') + controls + '</div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
  }

  function ocrReviewScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    var recognized = { latinName: 'ANNA SOKOLOVA', passport: '72 4567890', passportExpiry: '2031-05-21' };
    var labels = { latinName: 'ФИО латиницей', passport: 'Номер', passportExpiry: 'Годен до' };
    var rows = Object.keys(recognized).map(function (key) {
      var selected = overlay.selected.has(key);
      return '<button type="button" class="ocr-compare ' + (selected ? 'selected' : '') + '" data-action="toggle-ocr-field" data-field="' + key + '"><span class="check">' + icon('check') + '</span><span><strong>' + h(labels[key]) + '</strong><small>Сейчас: ' + h(tourist[key] || 'не заполнено') + '</small><em>Распознано: ' + h(recognized[key]) + '</em></span></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Сверка OCR', tourist.name) + '<div class="screen-scroll"><div class="warning">Распознанные значения не меняют карточку автоматически. Выберите поля и примените их вручную.</div>' + rows + '</div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="primary-button blue" data-action="apply-ocr" ' + (overlay.selected.size ? '' : 'disabled') + '>Применить · ' + overlay.selected.size + '</button></footer></section>';
  }

  function documentPreviewScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    var scan = (tourist.scans || []).find(function (item) { return item.id === overlay.scanId; });
    return '<section class="screen">' + screenHeader(scan ? scan.name : 'Скан паспорта', tourist.name) + '<div class="screen-scroll"><div class="document-preview">' + icon('document') + '<strong>Предпросмотр mock-файла</strong><span>В прототипе файл не отправляется на сервер.</span></div>' + (canManageDocumentsFor(tourist) && !state.offline ? '<button type="button" class="danger-button full-button" data-action="delete-scan" data-id="' + tourist.id + '" data-scan="' + h(overlay.scanId) + '">Удалить скан</button>' : '') + '</div></section>';
  }

  function discardProfileScreen(overlay) {
    return '<section class="screen">' + screenHeader('Закрыть без сохранения?', 'Изменения в разделе не сохранены') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Внесённые значения будут потеряны</strong><span>Вернитесь к форме или подтвердите выход.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="continue-profile-edit">Продолжить</button><button type="button" class="danger-button" data-action="discard-profile-edit">Не сохранять</button></footer></section>';
  }

  function deleteTouristScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    return '<section class="screen">' + screenHeader('Удалить туриста?', tourist ? tourist.name : 'Турист') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Карточка будет удалена из mock-тура</strong><span>Операционные связи этого туриста будут сняты. Действие доступно только администратору.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="danger-button" data-action="confirm-delete-tourist" data-id="' + h(overlay.touristId) + '">Удалить</button></footer></section>';
  }

  function bulkTouristsScreen(overlay) {
    var rows = currentTourists().map(function (tourist) {
      return selectionRow(tourist, overlay.selected.has(tourist.id), tourist.lead + ' · ' + globalGroupLabel(tourist));
    }).join('');
    var bulkActions = [];
    if (capabilities().canExport && !state.offline) bulkActions.push('<button type="button" class="secondary-button" data-action="export-summary">Экспорт</button>');
    if (capabilities().canGroup && !state.offline) bulkActions.push('<button type="button" class="primary-button blue" data-action="bulk-group" ' + (overlay.selected.size > 1 ? '' : 'disabled') + '>Создать группу</button>');
    var footer = bulkActions.length ? '<footer class="screen-actions">' + bulkActions.join('') + '</footer>' : '';
    var note = bulkActions.length ? '<div class="warning">Доступные действия зависят от роли в выбранном туре.</div>' : '<div class="form-note">Режим просмотра. Экспорт и создание групп недоступны для этой роли.</div>';
    return '<section class="screen">' + screenHeader('Массовые действия', 'Туристы текущего тура') + '<div class="screen-scroll"><div class="selection-head"><strong>Выбрано ' + overlay.selected.size + '</strong><button type="button" class="text-button" data-action="select-all">Выбрать всех</button></div>' + rows + note + '</div>' + footer + '</section>';
  }

  function scopeSelectScreen() {
    var seen = {};
    var tourMembers = currentTourists();
    var options = tourMembers.filter(function (tourist) {
      if (seen[tourist.leadId]) return false;
      seen[tourist.leadId] = true;
      return true;
    }).map(function (tourist) {
      var count = tourMembers.filter(function (item) { return item.leadId === tourist.leadId; }).length;
      return '<button type="button" class="source-card" data-action="select-scope" data-id="' + tourist.leadId + '"><span class="avatar">' + h(tourist.initials) + '</span><span class="member-copy"><strong>' + h(tourist.lead) + '</strong><span>' + touristCount(count) + ' в туре</span></span><b>›</b></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Фильтр по лиду', 'Сводная останется общей для тура') + '<div class="screen-scroll"><div class="form-note">Выберите лид, участников которого нужно показать. Кнопка «Весь тур» вернёт полный состав.</div>' + options + '</div></section>';
  }

  function cityPickerScreen() {
    var rows = visibleRouteCities().map(function (city) {
      var index = cities.indexOf(city);
      var available = currentTourists().filter(function (tourist) { return tourist.route.indexOf(city.id) !== -1; });
      var stageCounts = ['arrival', 'hotel', 'departure'].map(function (stage) {
        var filled = available.filter(function (tourist) { return hasData(effectiveRecordAt(city.id, stage, tourist.id), stage); }).length;
        return stageMeta[stage].tab + ' ' + filled + '/' + available.length;
      }).join(' · ');
      return '<button type="button" class="route-stop ' + (state.cityIndex === index ? 'active' : '') + '" data-action="select-city" data-index="' + index + '"><span class="route-stop-index">' + (index + 1) + '</span><span><strong>' + h(cityLabel(city)) + '</strong><small>' + h(city.dates) + '</small><em>' + h(stageCounts) + '</em></span><b>' + (state.cityIndex === index ? icon('check') : '›') + '</b></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Выберите город', 'Позиции маршрута не объединяются по названию') + '<div class="screen-scroll"><div class="form-note">Повторяющийся город сохраняет отдельный routeCityId и собственные операции.</div>' + rows + '</div></section>';
  }

  function roleMenuScreen() {
    var rows = Object.keys(roleLabels).map(function (role) {
      return '<button type="button" class="source-card ' + (state.role === role ? 'active' : '') + '" data-action="select-role" data-role="' + role + '"><span class="radio"></span><span class="member-copy"><strong>' + h(roleLabels[role]) + '</strong><span>' + h(role === 'admin' ? 'Все действия и удаление' : role === 'manager' ? 'Профиль, логистика и группы' : role === 'escort' ? 'Read-only профиль, статусы всего тура' : 'Read-only профиль, статусы назначенных городов') + '</span></span></button>';
    }).join('');
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay" aria-label="Закрыть"></button><section class="sheet"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>Роль просмотра</strong><span>Mock capability-сценарий</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll">' + rows + '<div class="system-tools"><button type="button" data-action="toggle-offline">' + icon('wifiOff') + '<span><strong>' + (state.offline ? 'Вернуть подключение' : 'Показать offline') + '</strong><small>Проверить запрет записи</small></span></button><button type="button" data-action="open-ui-states">' + icon('alert') + '<span><strong>Состояния экрана</strong><small>Loading, error и empty</small></span></button></div></div></section></div>';
  }

  function touristFiltersScreen() {
    var types = ['all', 'Взрослый', 'Ребёнок', 'Младенец'];
    var groups = [['all','Все'],['grouped','В группе'],['free','Без группы']];
    var statuses = [['all', 'Все']].concat(Object.keys(statusLabels[state.stage]).map(function (status) { return [status, statusLabels[state.stage][status]]; }));
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><section class="sheet"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>Фильтры туристов</strong><span>Текущий тур · ' + h(cityLabel(currentCity())) + '</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll"><div class="filter-toggle-list"><button type="button" class="' + (state.touristFilters.needsData ? 'active' : '') + '" data-action="toggle-tourist-filter" data-filter="needsData"><span class="check">' + icon('check') + '</span><span><strong>Не заполнены данные</strong><small>ФИО, дата рождения и обязательные контакты</small></span></button><button type="button" class="' + (state.touristFilters.documentIssue ? 'active' : '') + '" data-action="toggle-tourist-filter" data-filter="documentIssue"><span class="check">' + icon('check') + '</span><span><strong>Проблема с документами</strong><small>Не заполнено или скоро истекает</small></span></button><button type="button" class="' + (state.touristFilters.limitedRoute ? 'active' : '') + '" data-action="toggle-tourist-filter" data-filter="limitedRoute"><span class="check">' + icon('check') + '</span><span><strong>Ограниченный маршрут</strong><small>Турист едет не по всем остановкам тура</small></span></button></div><div class="selection-head"><strong>Тип туриста</strong></div><div class="choice-chips">' + types.map(function (type) { return '<button type="button" class="' + (state.touristFilters.type === type ? 'active' : '') + '" data-action="set-type-filter" data-type="' + type + '">' + (type === 'all' ? 'Все' : type) + '</button>'; }).join('') + '</div><div class="selection-head"><strong>Группа тура</strong></div><div class="choice-chips">' + groups.map(function (group) { return '<button type="button" class="' + (state.touristFilters.group === group[0] ? 'active' : '') + '" data-action="set-group-filter" data-group="' + group[0] + '">' + group[1] + '</button>'; }).join('') + '</div><div class="selection-head"><strong>Статус · ' + h(stageMeta[state.stage].tab) + '</strong></div><div class="choice-chips">' + statuses.map(function (status) { return '<button type="button" class="' + (state.touristFilters.status === status[0] ? 'active' : '') + '" data-action="set-status-filter" data-status="' + status[0] + '">' + h(status[1]) + '</button>'; }).join('') + '</div></div><footer class="sheet-actions"><button type="button" class="secondary-button" data-action="reset-tourist-filters">Сбросить</button><button type="button" class="primary-button blue" data-action="close-overlay">Показать</button></footer></section></div>';
  }

  function statusMenuScreen(overlay) {
    var members = overlay.members.map(touristById).filter(Boolean);
    var routeCity = cities.find(function (city) { return city.id === overlay.routeCityId; }) || currentCity();
    var options = Object.keys(statusLabels[overlay.stage]).map(function (value) {
      var allActive = members.every(function (tourist) { return statusFor(tourist, routeCity.id, overlay.stage) === value; });
      return '<button type="button" class="source-card ' + (allActive ? 'active' : '') + '" data-action="apply-status" data-status="' + value + '"><span class="radio"></span><span class="member-copy"><strong>' + h(statusLabels[overlay.stage][value]) + '</strong><span>' + h(stageMeta[overlay.stage].tab + ' · ' + touristCount(members.length)) + '</span></span></button>';
    }).join('');
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><section class="sheet"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>Изменить статус</strong><span>' + h(cityLabel(routeCity) + ' · ' + stageMeta[overlay.stage].tab) + '</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll"><div class="form-note">Статус меняется явно. Данные рейса, отеля или отъезда останутся прежними.</div>' + options + '</div></section></div>';
  }

  function uiStatesScreen() {
    return '<section class="screen">' + screenHeader('Состояния интерфейса', 'Проверка без production API') + '<div class="screen-scroll"><div class="action-menu"><button data-action="set-ui-state" data-state="loading"><span>' + icon('more') + '</span><div><strong>Загрузка</strong><small>Секционные skeleton-карточки</small></div><b>›</b></button><button data-action="set-ui-state" data-state="error"><span>' + icon('alert') + '</span><div><strong>Ошибка</strong><small>Сообщение и действие «Повторить»</small></div><b>›</b></button><button data-action="set-ui-state" data-state="empty"><span>' + icon('users') + '</span><div><strong>Пустой тур</strong><small>Объяснение и следующий шаг</small></div><b>›</b></button><button data-action="set-ui-state" data-state="ready"><span>' + icon('success') + '</span><div><strong>Рабочее состояние</strong><small>Вернуть mock-данные</small></div><b>›</b></button></div></div></section>';
  }

  function clearProgramScreen() {
    return '<section class="screen">' + screenHeader('Очистить программу', 'Необратимое действие в прототипе') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Удалить все дни программы?</strong><span>Маршрут, туристы и логистика не изменятся. Отмена закроет экран без изменений.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="danger-button" data-action="confirm-clear-program">Очистить</button></footer></section>';
  }

  function cancelTourScreen(overlay) {
    var tour = tours.find(function (item) { return item.id === overlay.tourId; }) || selectedTour();
    return '<section class="screen"><form id="cancel-tour-form" class="screen-form" data-id="' + h(tour.id) + '">' + screenHeader('Отменить тур', tour.name) + '<div class="screen-scroll"><div class="conflict-summary"><strong>Тур будет перенесён в архив</strong><span>Данные туристов, документов и логистики сохранятся.</span></div><label class="field"><span>Причина отмены *</span><textarea name="reason" rows="5" required placeholder="Укажите причину для истории изменений"></textarea></label></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Назад</button><button type="submit" class="danger-button">Подтвердить отмену</button></footer></form></section>';
  }

  function simpleField(label, name, value, type, placeholder) {
    return '<label class="field"><span>' + h(label) + '</span><input name="' + h(name) + '" type="' + h(type || 'text') + '" value="' + h(value || '') + '" placeholder="' + h(placeholder || '') + '"></label>';
  }

  function programFormScreen(overlay) {
    var day = overlay.index == null ? { date: '26 сен', city: 'Пекин (2)', title: '', text: '' } : programDays[overlay.index];
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><form id="program-form" class="sheet" data-index="' + (overlay.index == null ? '' : overlay.index) + '"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>' + (overlay.index == null ? 'Новый день' : 'Изменить день') + '</strong><span>Программа тура</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll"><div class="field-grid">' + simpleField('Дата', 'date', day.date) + simpleField('Город', 'city', day.city) + '</div>' + simpleField('Название', 'title', day.title, 'text', 'Событие дня') + '<label class="field"><span>Описание</span><textarea name="text" rows="5">' + h(day.text) + '</textarea></label></div><footer class="sheet-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></div>';
  }

  function tourFormScreen(overlay) {
    var tour = overlay.tourId ? tours.find(function (item) { return item.id === overlay.tourId; }) : null;
    var item = tour || { name: '', dates: '', route: '', guides: '', capacity: 12, color: '#2f6bd8', site: '' };
    return '<section class="screen"><form id="tour-form" class="screen-form" data-id="' + h(tour ? tour.id : '') + '">' + screenHeader(tour ? 'Изменить тур' : 'Новый тур', 'Поля карточки тура') + '<div class="screen-scroll">' + simpleField('Название', 'name', item.name) + '<div class="field-grid">' + simpleField('Даты', 'dates', item.dates) + simpleField('Мест', 'capacity', item.capacity, 'number') + '</div>' + simpleField('Маршрут и порядок городов', 'route', item.route) + simpleField('Гиды и сопровождающие', 'guides', item.guides) + simpleField('Цвет', 'color', item.color, 'color') + simpleField('Страница тура', 'site', item.site) + '<label class="field"><span>Описание</span><textarea name="description" rows="4">Авторский тур UNIQUE</textarea></label><div class="form-note">Администраторы чата, порядок маршрута и доступы сохраняются вместе с туром.</div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
  }

  function renderOverlay() {
    var overlay = state.overlay;
    if (!overlay) return '';
    if (overlay.kind === 'operation-select') return operationSelectionScreen(overlay);
    if (overlay.kind === 'operation-manage') return operationManageScreen(overlay);
    if (overlay.kind === 'tourist-group-select') return touristGroupSelectionScreen(overlay);
    if (overlay.kind === 'operation-split') return splitSelectionScreen(overlay, false);
    if (overlay.kind === 'split-source') return splitSourceScreen(overlay);
    if (overlay.kind === 'global-split') return splitSelectionScreen(overlay, true);
    if (overlay.kind === 'form') return formSheet(overlay);
    if (overlay.kind === 'conflict') return conflictScreen(overlay);
    if (overlay.kind === 'tours') return toursScreen(overlay);
    if (overlay.kind === 'tour-menu') return tourMenuScreen(overlay);
    if (overlay.kind === 'tourist-detail') return touristDetailScreen(overlay);
    if (overlay.kind === 'profile-edit') return profileEditScreen(overlay);
    if (overlay.kind === 'ocr-review') return ocrReviewScreen(overlay);
    if (overlay.kind === 'document-preview') return documentPreviewScreen(overlay);
    if (overlay.kind === 'discard-profile') return discardProfileScreen(overlay);
    if (overlay.kind === 'delete-tourist') return deleteTouristScreen(overlay);
    if (overlay.kind === 'bulk-tourists') return bulkTouristsScreen(overlay);
    if (overlay.kind === 'scope-select') return scopeSelectScreen();
    if (overlay.kind === 'city-picker') return cityPickerScreen();
    if (overlay.kind === 'role-menu') return roleMenuScreen();
    if (overlay.kind === 'tourist-filters') return touristFiltersScreen();
    if (overlay.kind === 'status-menu') return statusMenuScreen(overlay);
    if (overlay.kind === 'ui-states') return uiStatesScreen();
    if (overlay.kind === 'clear-program') return clearProgramScreen();
    if (overlay.kind === 'cancel-tour') return cancelTourScreen(overlay);
    if (overlay.kind === 'program-form') return programFormScreen(overlay);
    if (overlay.kind === 'tour-form') return tourFormScreen(overlay);
    if (overlay.kind === 'point-picker') return pointPickerScreen(overlay);
    if (overlay.kind === 'directory') return directoryScreen();
    if (overlay.kind === 'directory-city') return directoryCityScreen(overlay);
    if (overlay.kind === 'directory-city-form') return directoryCityFormScreen(overlay);
    if (overlay.kind === 'directory-point-form') return directoryPointFormScreen(overlay);
    if (overlay.kind === 'directory-point-delete') return deleteDirectoryPointScreen(overlay);
    if (overlay.kind === 'directory-city-delete') return deleteDirectoryCityScreen(overlay);
    if (overlay.kind === 'discard-form') return discardFormScreen(overlay);
    return '';
  }

  function render() {
    normalizeCityForRole();
    var views = {
      operations: operationsView,
      tourists: touristsView,
      documents: documentsView,
      work: workView,
      program: programView,
      'tour-info': tourInfoView,
      'tour-tasks': tourTasksView
    };
    var view = tourHasOperationalModel(state.selectedTourId) ? (views[state.view] || operationsView) : (state.view === 'tour-info' ? tourInfoView : unsupportedTourView);
    root.innerHTML = '<div class="app">' + view() +
      bottomNav() + renderOverlay() + (state.toast ? '<div class="toast ' + h(state.toastKind) + '" role="status" aria-live="polite">' + icon(state.toastKind === 'error' ? 'alert' : 'success') + '<span>' + h(state.toast) + '</span></div>' : '') + '</div>';
    if (state.pendingScrollTop != null && root.querySelector) {
      var scroller = root.querySelector('.scroll');
      if (scroller) scroller.scrollTop = state.pendingScrollTop;
      state.pendingScrollTop = null;
    }
  }

  function showToast(message, kind) {
    state.toast = message;
    state.toastKind = kind || 'success';
    render();
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      state.toast = null;
      state.toastKind = 'success';
      render();
    }, 2500);
  }

  function openOperationSelection(preselected, groupId) {
    state.overlay = {
      kind: 'operation-select',
      stage: state.stage,
      selected: new Set(preselected || []),
      groupId: groupId || null
    };
    render();
  }

  function openForm(memberIds, editing, groupId) {
    var sourceIds = distinctSources(memberIds, state.stage);
    var existingGroup = groupId ? stageGroups(state.stage)[groupId] : null;
    var editMode = editing ? (existingGroup ? 'shared' : 'own') : 'create';
    var sourceId = editMode === 'shared' ? (existingGroup.sourceId || existingGroup.masterId) :
      (editMode === 'own' ? memberIds[0] : (sourceIds[0] || 'blank'));
    var sourceRecord = sourceId === 'blank' ? blankRecord(state.stage) :
      ((editMode === 'shared' || editMode === 'own') ? ownRecordAt(currentCity().id, state.stage, sourceId) : effectiveRecord(state.stage, sourceId));
    state.draft = cleanRecord(sourceRecord, state.stage);
    state.overlay = {
      kind: 'form',
      stage: state.stage,
      members: memberIds.slice(),
      editing: Boolean(editing),
      groupId: groupId || null,
      sourceId: sourceId,
      editMode: editMode,
      routeCityId: currentCity().id,
      tourId: state.selectedTourId,
      dirtyFields: new Set()
    };
    render();
  }

  function openOwnForm(touristId) {
    var tourist = touristById(touristId);
    if (!canEditLogisticsForAt(tourist, currentCity().id) || state.offline) return false;
    var own = ownRecordAt(currentCity().id, state.stage, touristId);
    state.draft = cleanRecord(own || blankRecord(state.stage), state.stage);
    state.overlay = {
      kind: 'form',
      stage: state.stage,
      members: [touristId],
      editing: true,
      editMode: 'own',
      groupId: (operationGroupFor(state.stage, touristId) || {}).id || null,
      sourceId: touristId,
      routeCityId: currentCity().id,
      tourId: state.selectedTourId,
      dirtyFields: new Set()
    };
    render();
    return true;
  }

  function detachMembersFromStage(stage, memberIds, exceptGroupId) {
    var groups = stageGroups(stage);
    Object.keys(groups).forEach(function (groupId) {
      if (groupId === exceptGroupId) return;
      var group = groups[groupId];
      group.members = group.members.filter(function (id) { return memberIds.indexOf(id) === -1; });
      if (group.members.length < 2) {
        delete groups[groupId];
      } else {
        if (group.members.indexOf(group.sourceId) === -1) group.sourceId = group.members[0];
        group.masterId = group.sourceId;
        syncOperationGroup(group, currentCity().id, stage);
      }
    });
  }

  function removeTouristFromModel(touristId) {
    var tourist = touristById(touristId);
    if (!tourist) return;
    cities.forEach(function (city) {
      ['arrival', 'hotel', 'departure'].forEach(function (stage) {
        delete records[city.id][stage][touristId];
        var groups = operationGroups[city.id][stage];
        Object.keys(groups).forEach(function (groupId) {
          var group = groups[groupId];
          group.members = group.members.filter(function (id) { return id !== touristId; });
          if (group.members.length < 2) delete groups[groupId];
          else {
            if (group.sourceId === touristId || group.masterId === touristId) group.sourceId = group.members[0];
            group.masterId = group.sourceId;
            syncOperationGroup(group, city.id, stage);
          }
        });
      });
    });
    var index = tourists.findIndex(function (item) { return item.id === touristId; });
    tourists.splice(index, 1);
    canonicalTouristStore = canonicalTouristStore.filter(function (item) { return item.id !== touristId; });
    if (tourist.isPrimary) {
      var replacement = tourists.find(function (item) { return item.leadId === tourist.leadId; });
      if (replacement) replacement.isPrimary = true;
    }
    saveCanonicalTourists();
  }

  function applyStageRecord(memberIds, stage, values, existingGroupId, requestedMasterId) {
    memberIds = Array.from(new Set(memberIds));
    if (!canMutateLogisticsFor(memberIds)) return false;
    var target = stageRecords(stage);
    var groups = stageGroups(stage);
    var existingGroup = existingGroupId ? groups[existingGroupId] : null;
    var idempotencyKey = [state.selectedTourId, currentCity().id, stage, memberIds.slice().sort().join(',')].join('|');
    if (!existingGroup && memberIds.length > 1) {
      var repeatedGroupId = Object.keys(groups).find(function (groupId) {
        var group = groups[groupId];
        return group.idempotencyKey === idempotencyKey || group.members.slice().sort().join(',') === memberIds.slice().sort().join(',');
      });
      if (repeatedGroupId) existingGroup = groups[repeatedGroupId];
    }
    if (existingGroup) {
      detachMembersFromStage(stage, memberIds, existingGroup.id);
      existingGroup.members = memberIds.slice();
      var existingSourceId = memberIds.indexOf(requestedMasterId) !== -1 ? requestedMasterId : (memberIds.indexOf(existingGroup.sourceId) !== -1 ? existingGroup.sourceId : memberIds[0]);
      existingGroup.sourceId = existingSourceId;
      existingGroup.masterId = existingSourceId;
      existingGroup.idempotencyKey = idempotencyKey;
      target[existingSourceId] = cleanRecord(values, stage);
      syncOperationGroup(existingGroup, currentCity().id, stage);
    } else if (memberIds.length === 1) {
      detachMembersFromStage(stage, memberIds);
      target[memberIds[0]] = cleanRecord(values, stage);
    } else {
      detachMembersFromStage(stage, memberIds);
      var masterId = memberIds.indexOf(requestedMasterId) !== -1 ? requestedMasterId : memberIds[0];
      var groupId = newGroupId(stage);
      var parentGroupId = (touristById(masterId) || {}).groupId || null;
      target[masterId] = cleanRecord(values, stage);
      groups[groupId] = syncOperationGroup({ id: groupId, subgroupId: groupId, masterId: masterId, sourceId: masterId, createdFromGroupId: parentGroupId, idempotencyKey: idempotencyKey, members: memberIds.slice() }, currentCity().id, stage);
    }
    return true;
  }

  function applyTouristGrouping() {
    if (mutationBlocked(capabilities().canGroup, 'Группировка недоступна для этой роли')) return false;
    var selectedIds = Array.from(state.overlay.selected);
    var selectedTourists = selectedIds.map(touristById);
    if (selectedTourists.length < 2 || selectedTourists.some(function (tourist) { return !tourist || tourist.tourId !== state.selectedTourId; })) {
      state.overlay.error = 'Можно объединять только двух или более участников одного тура.';
      render();
      return false;
    }
    var existingIds = Array.from(new Set(selectedTourists.map(function (tourist) { return tourist.groupId; }).filter(Boolean)));
    if (existingIds.length > 1) {
      state.overlay.error = 'Выбраны туристы из двух существующих групп. Сначала разъедините одну из них.';
      render();
      return false;
    }
    if (existingIds.length === 1 && selectedTourists.every(function (tourist) { return tourist.groupId === existingIds[0]; })) {
      state.overlay = null;
      showToast('Эти туристы уже находятся в одной группе');
      return false;
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
    return true;
  }

  root.addEventListener('input', function (event) {
    if (event.target.dataset.touristSearch !== undefined) {
      state.touristQuery = event.target.value;
      render();
      var touristSearch = root.querySelector('[data-tourist-search]');
      if (touristSearch) { touristSearch.focus(); touristSearch.setSelectionRange(state.touristQuery.length, state.touristQuery.length); }
      return;
    }
    if (event.target.dataset.tourSearch !== undefined) {
      state.tourQuery = event.target.value;
      render();
      var search = root.querySelector('[data-tour-search]');
      if (search) { search.focus(); search.setSelectionRange(state.tourQuery.length, state.tourQuery.length); }
      return;
    }
    if (event.target.dataset.directorySearch !== undefined) {
      state.directoryQuery = event.target.value;
      render();
      var directorySearch = root.querySelector('[data-directory-search]');
      if (directorySearch) { directorySearch.focus(); directorySearch.setSelectionRange(state.directoryQuery.length, state.directoryQuery.length); }
      return;
    }
    if (event.target.dataset.pointSearch !== undefined && state.overlay && state.overlay.kind === 'point-picker') {
      state.overlay.query = event.target.value;
      render();
      var pointSearch = root.querySelector('[data-point-search]');
      if (pointSearch) { pointSearch.focus(); pointSearch.setSelectionRange(state.overlay.query.length, state.overlay.query.length); }
      return;
    }
    if (state.overlay && state.overlay.kind === 'profile-edit' && event.target.name) {
      state.overlay.dirty = true;
      if (state.overlay.fieldErrors) delete state.overlay.fieldErrors[event.target.name];
      if (state.overlay.error && (!state.overlay.fieldErrors || !Object.keys(state.overlay.fieldErrors).length)) state.overlay.error = null;
      return;
    }
    if (!state.overlay || state.overlay.kind !== 'form' || !event.target.dataset.field) return;
    state.draft[event.target.dataset.field] = event.target.value;
    state.overlay.dirtyFields.add(event.target.dataset.field);
    if (event.target.dataset.manualPoint !== undefined) {
      state.draft.pointId = '';
      state.draft.pointManual = true;
      state.draft.pointAutofilled = false;
      state.overlay.dirtyFields.add('pointId');
    }
  });

  root.addEventListener('change', function (event) {
    if (state.overlay && state.overlay.kind === 'profile-edit' && event.target.name) {
      state.overlay.dirty = true;
      if (state.overlay.fieldErrors) delete state.overlay.fieldErrors[event.target.name];
      if (state.overlay.error && (!state.overlay.fieldErrors || !Object.keys(state.overlay.fieldErrors).length)) state.overlay.error = null;
      return;
    }
    if (!state.overlay || state.overlay.kind !== 'form' || !event.target.dataset.field) return;
    var previousTransport = state.draft.transport;
    state.draft[event.target.dataset.field] = event.target.value;
    state.overlay.dirtyFields.add(event.target.dataset.field);
    if (event.target.dataset.field === 'transport') {
      state.overlay.dirtyFields.add('point');
      state.overlay.dirtyFields.add('pointId');
      syncDraftPoint(previousTransport);
      render();
    }
  });

  root.addEventListener('submit', function (event) {
    event.preventDefault();
    var form = event.target;
    var data = Object.fromEntries(new FormData(form).entries());
    if (form.id === 'profile-section-form') {
      var profileTourist = touristById(form.dataset.id);
      var profileSection = form.dataset.section;
      if (!profileTourist || !canEditProfileFor(profileTourist) || state.offline) {
        state.overlay.error = state.offline ? 'Подключитесь к интернету, чтобы сохранить изменения.' : 'Недостаточно прав для редактирования.';
        render();
        return;
      }
      if (profileSection === 'personal') {
        var personalErrors = {};
        if (!String(data.lastName || '').trim()) personalErrors.lastName = 'Укажите фамилию.';
        if (!String(data.firstName || '').trim()) personalErrors.firstName = 'Укажите имя.';
        if (!data.birthDate) personalErrors.birthDate = 'Укажите дату рождения.';
        if (!data.citizenship) personalErrors.citizenship = 'Выберите гражданство.';
        if (profileTourist.isPrimary && !String(data.middleName || '').trim()) personalErrors.middleName = 'Для основного туриста требуется отчество.';
        if (profileTourist.isPrimary && !String(data.phone || '').trim()) personalErrors.phone = 'Для основного туриста требуется телефон.';
        if (profileTourist.isPrimary && canSeePrivateFor(profileTourist) && !String(data.email || '').trim()) personalErrors.email = 'Для основного туриста требуется email.';
        if (Object.keys(personalErrors).length) {
          showProfileValidation(personalErrors, 'Заполните обязательные личные данные.');
          return;
        }
        Object.assign(profileTourist, { lastName: data.lastName, firstName: data.firstName, middleName: data.middleName, birthDate: data.birthDate, citizenship: data.citizenship, phone: data.phone, email: data.email == null ? profileTourist.email : data.email, type: data.type });
        profileTourist.name = [profileTourist.lastName, profileTourist.firstName, profileTourist.middleName].filter(Boolean).join(' ');
        profileTourist.initials = [profileTourist.lastName, profileTourist.firstName].map(function (part) { return part.charAt(0); }).join('').toUpperCase();
      } else if (profileSection === 'domestic' && profileTourist.citizenship === 'Россия') {
        var domesticErrors = {};
        if (profileTourist.isPrimary && !String(data.domesticPassport || '').trim()) domesticErrors.domesticPassport = 'Укажите серию и номер паспорта РФ.';
        if (profileTourist.isPrimary && !String(data.domesticIssuedBy || '').trim()) domesticErrors.domesticIssuedBy = 'Укажите орган выдачи паспорта РФ.';
        if (Object.keys(domesticErrors).length) {
          showProfileValidation(domesticErrors, 'Заполните обязательные данные паспорта РФ.');
          return;
        }
        Object.assign(profileTourist, { domesticPassport: data.domesticPassport, domesticIssuedBy: data.domesticIssuedBy, registrationAddress: data.registrationAddress });
      } else if (profileSection === 'foreign') {
        var foreignErrors = {};
        if (!String(data.latinName || '').trim()) foreignErrors.latinName = 'Укажите ФИО латиницей.';
        if (!String(data.passport || '').trim()) foreignErrors.passport = 'Укажите номер загранпаспорта.';
        if (!data.passportExpiry) foreignErrors.passportExpiry = 'Укажите срок действия загранпаспорта.';
        if (Object.keys(foreignErrors).length) {
          showProfileValidation(foreignErrors, 'Заполните обязательные данные загранпаспорта.');
          return;
        }
        Object.assign(profileTourist, { latinName: data.latinName, passport: data.passport, passportExpiry: data.passportExpiry });
      } else if (profileSection === 'links') {
        var wantsPrimary = data.isPrimary === 'true';
        if (!wantsPrimary && profileTourist.isPrimary && !tourists.some(function (tourist) { return tourist.id !== profileTourist.id && tourist.leadId === profileTourist.leadId && tourist.isPrimary; })) {
          state.overlay.error = 'Сначала назначьте другого основного туриста этого лида.';
          render();
          return;
        }
        if (wantsPrimary) tourists.filter(function (tourist) { return tourist.leadId === profileTourist.leadId; }).forEach(function (tourist) { tourist.isPrimary = tourist.id === profileTourist.id; });
        else profileTourist.isPrimary = false;
        profileTourist.groupRepresentative = data.groupRepresentative === 'true';
      } else if (profileSection === 'comments') {
        profileTourist.guideComment = data.guideComment;
        if (data.internalNote != null) profileTourist.internalNote = data.internalNote;
      }
      saveCanonicalTourists();
      state.overlay = { kind: 'tourist-detail', touristId: profileTourist.id, expanded: new Set([profileSection]) };
      showToast('Раздел туриста сохранён');
      return;
    }
    if (form.id === 'program-form') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      var day = { date: data.date, city: data.city, title: data.title || 'Новый день программы', text: data.text || 'Описание будет добавлено позже.' };
      if (form.dataset.index === '') programDays.push(day); else programDays[Number(form.dataset.index)] = day;
      state.overlay = null;
      showToast('День программы сохранён');
      return;
    }
    if (form.id === 'directory-city-form') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      if (!String(data.name || '').trim() || !String(data.country || '').trim()) {
        showToast('Заполните название и страну');
        return;
      }
      var directoryCity = form.dataset.id ? directoryCityById(form.dataset.id) : null;
      var cityValues = { name: String(data.name).trim(), country: String(data.country).trim(), aliases: String(data.aliases || '').trim(), active: data.active === 'true' };
      if (directoryCity) Object.assign(directoryCity, cityValues);
      else {
        directoryCity = Object.assign({ id: 'city-' + Date.now() }, cityValues);
        directory.cities.push(directoryCity);
      }
      saveDirectory();
      state.overlay = { kind: 'directory-city', cityId: directoryCity.id, previous: { kind: 'directory' } };
      showToast(form.dataset.id ? 'Город обновлён' : 'Город добавлен');
      return;
    }
    if (form.id === 'directory-point-form') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      if (!String(data.name || '').trim()) {
        showToast('Заполните название точки');
        return;
      }
      var directoryPoint = form.dataset.id ? directoryPointById(form.dataset.id) : null;
      var pointValues = { cityId: form.dataset.city, type: data.type, name: String(data.name).trim(), code: String(data.code || '').trim().toUpperCase(), active: data.active === 'true' };
      if (directoryPoint) Object.assign(directoryPoint, pointValues);
      else {
        directoryPoint = Object.assign({ id: 'point-' + Date.now() }, pointValues);
        directory.points.push(directoryPoint);
      }
      saveDirectory();
      state.overlay = { kind: 'directory-city', cityId: form.dataset.city, previous: { kind: 'directory' } };
      showToast(form.dataset.id ? 'Точка обновлена' : 'Точка добавлена');
      return;
    }
    if (form.id === 'cancel-tour-form') {
      var cancelledTour = tours.find(function (item) { return item.id === form.dataset.id; });
      if (mutationBlocked(Boolean(cancelledTour) && canManageTourId(form.dataset.id), 'Изменение тура недоступно для этой роли')) return;
      cancelledTour.status = 'archive';
      cancelledTour.cancelReason = data.reason;
      state.tourFilter = 'archive';
      state.overlay = { kind: 'tours' };
      showToast('Тур отменён и перенесён в архив');
      return;
    }
    if (form.id === 'tour-form') {
      var tour = tours.find(function (item) { return item.id === form.dataset.id; });
      var canSaveTour = form.dataset.id ? (Boolean(tour) && canManageTourId(form.dataset.id)) : capabilities().canManageTour;
      if (mutationBlocked(canSaveTour, 'Изменение тура недоступно для этой роли')) return;
      var tourValues = { name: data.name || 'Новый тур', dates: data.dates, route: data.route, guides: data.guides, capacity: Number(data.capacity || 0), color: data.color, site: data.site };
      if (tour) Object.assign(tour, tourValues); else tours.push(Object.assign({ id: 'tour-' + Date.now(), status: 'draft', tourists: 0 }, tourValues));
      state.overlay = { kind: 'tours' };
      state.tourFilter = tour ? tour.status : 'draft';
      showToast(tour ? 'Тур сохранён' : 'Черновик тура создан');
      return;
    }
  });

  root.addEventListener('click', function (event) {
    var button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    var action = button.dataset.action;

    if (action === 'summary-section') {
      state.view = button.dataset.view;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'open-city-picker') {
      state.overlay = { kind: 'city-picker' };
      render();
      return;
    }
    if (action === 'select-city') {
      var selectedCityIndex = Number(button.dataset.index);
      var selectedCity = cities[selectedCityIndex];
      if (!selectedCity || !canViewRouteCity(selectedCity.id)) {
        showToast('Этот город не назначен текущей роли');
        return;
      }
      state.cityIndex = selectedCityIndex;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'role-menu') {
      state.overlay = { kind: 'role-menu' };
      render();
      return;
    }
    if (action === 'select-role') {
      state.role = button.dataset.role;
      state.overlay = null;
      showToast('Роль: ' + roleLabels[state.role]);
      return;
    }
    if (action === 'toggle-offline') {
      state.offline = !state.offline;
      state.overlay = null;
      showToast(state.offline ? 'Включён offline-сценарий' : 'Подключение восстановлено');
      return;
    }
    if (action === 'open-ui-states') {
      state.overlay = { kind: 'ui-states' };
      render();
      return;
    }
    if (action === 'set-ui-state') {
      state.uiPreview = button.dataset.state;
      state.view = 'operations';
      state.overlay = null;
      render();
      return;
    }
    if (action === 'reset-ui-state') {
      state.uiPreview = 'ready';
      render();
      return;
    }
    if (action === 'tourist-list-mode') {
      state.touristListMode = button.dataset.mode;
      render();
      return;
    }
    if (action === 'tourist-filters') {
      state.overlay = { kind: 'tourist-filters' };
      render();
      return;
    }
    if (action === 'toggle-tourist-filter' || action === 'quick-filter') {
      var filterKey = button.dataset.filter;
      state.touristFilters[filterKey] = !state.touristFilters[filterKey];
      render();
      return;
    }
    if (action === 'set-type-filter') {
      state.touristFilters.type = button.dataset.type;
      render();
      return;
    }
    if (action === 'set-group-filter') {
      state.touristFilters.group = button.dataset.group;
      render();
      return;
    }
    if (action === 'set-status-filter') {
      state.touristFilters.status = button.dataset.status;
      render();
      return;
    }
    if (action === 'clear-type-filter') {
      state.touristFilters.type = 'all';
      render();
      return;
    }
    if (action === 'clear-group-filter') {
      state.touristFilters.group = 'all';
      render();
      return;
    }
    if (action === 'clear-status-filter') {
      state.touristFilters.status = 'all';
      render();
      return;
    }
    if (action === 'reset-tourist-filters') {
      state.touristQuery = '';
      state.touristFilters = { needsData: false, documentIssue: false, limitedRoute: false, type: 'all', group: 'all', status: 'all' };
      state.overlay = null;
      render();
      return;
    }
    if (action === 'document-filter') {
      state.documentFilter = button.dataset.filter;
      render();
      return;
    }
    if (action === 'open-tourist-documents') {
      state.returnContext = captureTourContext();
      state.overlay = { kind: 'tourist-detail', touristId: button.dataset.id, expanded: new Set(['foreign']) };
      render();
      return;
    }
    if (action === 'toggle-profile-section') {
      var profileExpanded = state.overlay.expanded || new Set();
      if (profileExpanded.has(button.dataset.section)) profileExpanded.delete(button.dataset.section); else profileExpanded.add(button.dataset.section);
      state.overlay.expanded = profileExpanded;
      render();
      return;
    }
    if (action === 'edit-profile-section') {
      var editTouristId = button.dataset.id || (state.overlay && state.overlay.touristId);
      var editProfileTourist = touristById(editTouristId);
      if (!canEditProfileFor(editProfileTourist) || state.offline) {
        showToast(state.offline ? 'Подключитесь к интернету для редактирования' : 'Редактирование недоступно для этой роли');
        return;
      }
      var currentDetail = state.overlay && state.overlay.kind === 'tourist-detail' ? state.overlay : { kind: 'tourist-detail', touristId: editTouristId, expanded: new Set([button.dataset.section]) };
      state.overlay = { kind: 'profile-edit', touristId: editTouristId, section: button.dataset.section, previous: currentDetail, dirty: false, error: null, fieldErrors: {} };
      render();
      return;
    }
    if (action === 'call-tourist' || action === 'message-tourist' || action === 'copy-tourist-contact') {
      var contactTourist = touristById(button.dataset.id);
      var contactValue = contactTourist && contactTourist.phone ? contactTourist.phone : 'номер не заполнен';
      showToast(action === 'call-tourist' ? 'Звонок: ' + contactValue : action === 'message-tourist' ? ((contactTourist && contactTourist.preferredChannel) || 'Чат') + ': ' + contactValue : 'Контакт скопирован: ' + contactValue);
      return;
    }
    if (action === 'jump-profile-operation') {
      var profileRouteCityId = button.dataset.routeCityId;
      var profileRouteCityIndex = cities.findIndex(function (city) { return city.id === profileRouteCityId; });
      var profileRouteTourist = touristById(button.dataset.id);
      if (profileRouteCityIndex < 0 || !canViewRouteCity(profileRouteCityId) || !profileRouteTourist || profileRouteTourist.tourId !== state.selectedTourId || profileRouteTourist.route.indexOf(profileRouteCityId) === -1) {
        showToast('Эта остановка недоступна туристу');
        return;
      }
      state.cityIndex = profileRouteCityIndex;
      state.stage = button.dataset.stage;
      state.view = 'operations';
      state.overlay = null;
      showToast('Открыта операция туриста');
      return;
    }
    if (action === 'edit-own-operation') {
      var ownRouteCityId = button.dataset.routeCityId;
      var ownRouteCityIndex = cities.findIndex(function (city) { return city.id === ownRouteCityId; });
      var ownRouteTourist = touristById(button.dataset.id);
      if (ownRouteCityIndex < 0 || mutationBlocked(canEditLogisticsForAt(ownRouteTourist, ownRouteCityId), 'Личная запись недоступна для этого туриста')) return;
      state.cityIndex = ownRouteCityIndex;
      state.stage = button.dataset.stage;
      state.view = 'operations';
      openOwnForm(ownRouteTourist.id);
      return;
    }
    if (action === 'add-scan' || action === 'upload-scan') {
      var scanTourist = touristById(button.dataset.id);
      if (!canManageDocumentsFor(scanTourist) || state.offline) {
        showToast(state.offline ? 'Подключитесь к интернету для загрузки' : 'Документы доступны только для просмотра');
        return;
      }
      scanTourist.scans.push({ id: 'scan-' + Date.now(), name: action === 'add-scan' ? 'passport-camera.jpg' : 'passport-upload.pdf', status: 'ready' });
      saveCanonicalTourists();
      showToast(action === 'add-scan' ? 'Mock-фото добавлено' : 'Mock-файл добавлен');
      return;
    }
    if (action === 'view-scan') {
      state.overlay = { kind: 'document-preview', touristId: button.dataset.id, scanId: button.dataset.scan, previous: state.overlay };
      render();
      return;
    }
    if (action === 'delete-scan') {
      var deleteScanTourist = touristById(button.dataset.id);
      if (mutationBlocked(canManageDocumentsFor(deleteScanTourist), 'Удаление недоступно для этой роли', 'Подключитесь к интернету для удаления')) return;
      deleteScanTourist.scans = deleteScanTourist.scans.filter(function (scan) { return scan.id !== button.dataset.scan; });
      saveCanonicalTourists();
      state.overlay = { kind: 'tourist-detail', touristId: deleteScanTourist.id, expanded: new Set(['foreign']) };
      showToast('Скан удалён из mock-данных');
      return;
    }
    if (action === 'open-ocr-review') {
      if (mutationBlocked(canManageDocumentsFor(touristById(button.dataset.id)), 'OCR недоступен для этой роли', 'Подключитесь к интернету для OCR')) return;
      state.overlay = { kind: 'ocr-review', touristId: button.dataset.id, selected: new Set(), previous: state.overlay };
      render();
      return;
    }
    if (action === 'toggle-ocr-field') {
      if (state.overlay.selected.has(button.dataset.field)) state.overlay.selected.delete(button.dataset.field); else state.overlay.selected.add(button.dataset.field);
      render();
      return;
    }
    if (action === 'apply-ocr') {
      var ocrTourist = touristById(state.overlay.touristId);
      if (mutationBlocked(canManageDocumentsFor(ocrTourist), 'OCR недоступен для этой роли', 'Подключитесь к интернету для применения OCR')) return;
      var ocrValues = { latinName: 'ANNA SOKOLOVA', passport: '72 4567890', passportExpiry: '2031-05-21' };
      state.overlay.selected.forEach(function (field) { ocrTourist[field] = ocrValues[field]; });
      saveCanonicalTourists();
      state.overlay = { kind: 'tourist-detail', touristId: ocrTourist.id, expanded: new Set(['foreign']) };
      showToast('Выбранные поля OCR применены');
      return;
    }
    if (action === 'change-status') {
      var statusMemberIds = [button.dataset.id];
      var statusRouteCityId = currentCity().id;
      if (mutationBlocked(canEditStatusesFor(statusMemberIds, statusRouteCityId), 'Статусы недоступны для выбранного города или тура')) return;
      state.overlay = { kind: 'status-menu', stage: button.dataset.stage, members: statusMemberIds, routeCityId: statusRouteCityId, tourId: state.selectedTourId };
      render();
      return;
    }
    if (action === 'status-bulk') {
      var bulkStatusMemberIds = button.dataset.members.split(',');
      var bulkStatusRouteCityId = currentCity().id;
      if (mutationBlocked(canEditStatusesFor(bulkStatusMemberIds, bulkStatusRouteCityId), 'Статусы недоступны для выбранного города или тура')) return;
      state.overlay = { kind: 'status-menu', stage: button.dataset.stage, members: bulkStatusMemberIds, routeCityId: bulkStatusRouteCityId, tourId: state.selectedTourId };
      render();
      return;
    }
    if (action === 'apply-status') {
      var statusOverlay = state.overlay;
      var statusIsKnown = statusOverlay && statusLabels[statusOverlay.stage] && statusLabels[statusOverlay.stage][button.dataset.status];
      var statusContextValid = statusOverlay && statusOverlay.tourId === state.selectedTourId && cities.some(function (city) { return city.id === statusOverlay.routeCityId; });
      if (!statusIsKnown || !statusContextValid || mutationBlocked(canEditStatusesFor(statusOverlay.members, statusOverlay.routeCityId), 'Статусы недоступны для выбранного города или тура')) return;
      statusOverlay.members.map(touristById).forEach(function (tourist) {
        if (!tourist.statusByCity[statusOverlay.routeCityId]) tourist.statusByCity[statusOverlay.routeCityId] = {};
        tourist.statusByCity[statusOverlay.routeCityId][statusOverlay.stage] = button.dataset.status;
      });
      saveCanonicalTourists();
      state.overlay = null;
      showToast('Операционный статус сохранён');
      return;
    }
    if (action === 'permission-note') {
      showToast('Действие недоступно для роли «' + roleLabels[state.role] + '»');
      return;
    }
    if (action === 'workspace') {
      state.view = button.dataset.view;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'open-directory') {
      state.overlay = { kind: 'directory' };
      state.directoryQuery = '';
      render();
      return;
    }
    if (action === 'open-directory-city') {
      state.overlay = { kind: 'directory-city', cityId: button.dataset.id, previous: { kind: 'directory' } };
      render();
      return;
    }
    if (action === 'new-directory-city' || action === 'edit-directory-city') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var returnCityId = button.dataset.id || null;
      state.overlay = { kind: 'directory-city-form', cityId: returnCityId, previous: returnCityId ? { kind: 'directory-city', cityId: returnCityId, previous: { kind: 'directory' } } : { kind: 'directory' } };
      render();
      return;
    }
    if (action === 'new-directory-point' || action === 'edit-directory-point') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var editedPoint = button.dataset.id ? directoryPointById(button.dataset.id) : null;
      var pointCityId = editedPoint ? editedPoint.cityId : button.dataset.city;
      state.overlay = { kind: 'directory-point-form', cityId: pointCityId, pointId: editedPoint ? editedPoint.id : null, previous: { kind: 'directory-city', cityId: pointCityId, previous: { kind: 'directory' } } };
      render();
      return;
    }
    if (action === 'toggle-directory-point') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var toggledPoint = directoryPointById(button.dataset.id);
      if (toggledPoint) {
        toggledPoint.active = !toggledPoint.active;
        saveDirectory();
        showToast(toggledPoint.active ? 'Точка восстановлена' : 'Точка перемещена в архив');
      }
      return;
    }
    if (action === 'delete-directory-point') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var deletedPoint = directoryPointById(button.dataset.id);
      if (!deletedPoint) return;
      if (pointIsUsed(deletedPoint.id)) {
        deletedPoint.active = false;
        saveDirectory();
        showToast('Используемая точка архивирована, история сохранена');
      } else {
        state.overlay = { kind: 'directory-point-delete', pointId: deletedPoint.id, previous: { kind: 'directory-city', cityId: deletedPoint.cityId, previous: { kind: 'directory' } } };
        render();
      }
      return;
    }
    if (action === 'confirm-delete-directory-point') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var pointToDelete = directoryPointById(button.dataset.id);
      if (!pointToDelete) return;
      directory.points = directory.points.filter(function (point) { return point.id !== pointToDelete.id; });
      saveDirectory();
      state.overlay = { kind: 'directory-city', cityId: pointToDelete.cityId, previous: { kind: 'directory' } };
      showToast('Точка удалена');
      return;
    }
    if (action === 'delete-directory-city') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var cityToDelete = directoryCityById(button.dataset.id);
      if (!cityToDelete) return;
      var linkedToRoute = cities.some(function (city) { return city.catalogCityId === cityToDelete.id; });
      var hasPoints = directory.points.some(function (point) { return point.cityId === cityToDelete.id; });
      if (linkedToRoute || hasPoints) {
        showToast('Сначала удалите точки; город маршрута можно только архивировать');
        return;
      }
      state.overlay = { kind: 'directory-city-delete', cityId: cityToDelete.id, previous: { kind: 'directory-city', cityId: cityToDelete.id, previous: { kind: 'directory' } } };
      render();
      return;
    }
    if (action === 'confirm-delete-directory-city') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var confirmedCity = directoryCityById(button.dataset.id);
      if (!confirmedCity) return;
      directory.cities = directory.cities.filter(function (city) { return city.id !== confirmedCity.id; });
      saveDirectory();
      state.overlay = { kind: 'directory' };
      showToast('Город удалён');
      return;
    }
    if (action === 'toggle-directory-city') {
      if (mutationBlocked(capabilities().canManageDirectory, 'Справочник может изменять только администратор')) return;
      var toggledCity = directoryCityById(button.dataset.id);
      if (!toggledCity) return;
      toggledCity.active = !toggledCity.active;
      saveDirectory();
      showToast(toggledCity.active ? 'Город восстановлен' : 'Город перемещён в архив');
      return;
    }
    if (action === 'summary-mode') {
      state.summaryMode = ['groups', 'coverage'].indexOf(button.dataset.mode) !== -1 ? button.dataset.mode : 'groups';
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
      var jumpCityIndex = Number(button.dataset.city);
      var jumpCity = cities[jumpCityIndex];
      if (!jumpCity || !canViewRouteCity(jumpCity.id)) {
        showToast('Этот город не назначен текущей роли');
        return;
      }
      state.cityIndex = jumpCityIndex;
      state.stage = button.dataset.stage;
      state.summaryMode = 'groups';
      var focusedGroup = operationGroupFor(state.stage, button.dataset.tourist);
      var focusedRecord = effectiveRecord(state.stage, button.dataset.tourist);
      var focusedMembers = focusedGroup ? focusedGroup.members : [button.dataset.tourist];
      if (mutationBlocked(canMutateLogisticsFor(focusedMembers), leadConfirmed(touristById(button.dataset.tourist)) ? 'Логистика недоступна для этой роли' : 'Логистика доступна после подтверждения лида')) return;
      if (hasData(focusedRecord, state.stage)) openForm(focusedMembers, true, focusedGroup ? focusedGroup.id : null);
      else openForm(focusedMembers, false, null);
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
      if (mutationBlocked(capabilities().canManageTour, 'Создание тура недоступно для этой роли')) return;
      state.overlay = { kind: 'tour-form', tourId: null };
      render();
      return;
    }
    if (action === 'view-tour-info') {
      if (state.overlay && state.overlay.tourId) state.selectedTourId = state.overlay.tourId;
      state.overlay = null;
      state.view = 'tour-info';
      render();
      return;
    }
    if (action === 'view-tour-tasks') {
      if (state.overlay && state.overlay.tourId) state.selectedTourId = state.overlay.tourId;
      if (!tourHasOperationalModel(state.selectedTourId)) {
        state.overlay = null;
        showToast('Задачи этого тура ещё не подготовлены в MVP');
        return;
      }
      state.overlay = null;
      state.view = 'tour-tasks';
      render();
      return;
    }
    if (action === 'tourist-detail') {
      state.returnContext = captureTourContext();
      state.overlay = { kind: 'tourist-detail', touristId: button.dataset.id };
      render();
      return;
    }
    if (action === 'bulk-tourists') {
      state.overlay = { kind: 'bulk-tourists', selected: new Set() };
      render();
      return;
    }
    if (action === 'add-program' || action === 'edit-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      state.overlay = { kind: 'program-form', index: action === 'edit-program' ? Number(button.dataset.index) : null };
      render();
      return;
    }
    if (action === 'generate-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      if (programDays.length < 5) programDays.push({ date: '17 сен', city: 'Сиань', title: 'Переезд в Сиань', text: 'Поезд G89, размещение и вечерняя прогулка по городской стене.' });
      showToast('Программа сформирована из маршрута');
      return;
    }
    if (action === 'regenerate-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      showToast('Программа обновлена, ручные правки сохранены');
      return;
    }
    if (action === 'clear-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      state.overlay = { kind: 'clear-program' };
      render();
      return;
    }
    if (action === 'confirm-clear-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      programDays.splice(0, programDays.length);
      state.overlay = null;
      showToast('Программа очищена');
      return;
    }
    if (action === 'edit-tour') {
      var editTourId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var editableTour = tours.find(function (tour) { return tour.id === editTourId; });
      if (mutationBlocked(Boolean(editableTour) && canManageTourId(editTourId), 'Изменение тура недоступно для этой роли')) return;
      state.overlay = { kind: 'tour-form', tourId: editTourId };
      render();
      return;
    }
    if (action === 'copy-tour') {
      var copySourceId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var originalTour = tours.find(function (tour) { return tour.id === copySourceId; });
      if (mutationBlocked(Boolean(originalTour) && canManageTourId(copySourceId), 'Копирование тура недоступно для этой роли')) return;
      tours.push(Object.assign({}, originalTour, { id: 'copy-' + Date.now(), name: originalTour.name + ' · копия', status: 'draft', tourists: 0 }));
      state.tourFilter = 'draft';
      state.overlay = { kind: 'tours' };
      showToast('Копия тура создана в черновиках');
      return;
    }
    if (action === 'archive-tour') {
      var archiveSourceId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var archiveTour = tours.find(function (tour) { return tour.id === archiveSourceId; });
      if (mutationBlocked(Boolean(archiveTour) && canManageTourId(archiveSourceId), 'Архивирование тура недоступно для этой роли')) return;
      archiveTour.status = 'archive';
      state.overlay = null;
      showToast('Тур перемещён в архив');
      return;
    }
    if (action === 'cancel-tour') {
      var cancelTourId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var cancellableTour = tours.find(function (tour) { return tour.id === cancelTourId; });
      if (mutationBlocked(Boolean(cancellableTour) && canManageTourId(cancelTourId), 'Отмена тура недоступна для этой роли')) return;
      state.overlay = { kind: 'cancel-tour', tourId: cancelTourId };
      render();
      return;
    }
    if (action === 'toggle-tour-task') {
      if (mutationBlocked(capabilities().canManageTasks, 'Изменение задач недоступно для этой роли')) return;
      tourTasks[Number(button.dataset.index)].done = !tourTasks[Number(button.dataset.index)].done;
      render();
      return;
    }
    if (action === 'add-tour-task') {
      if (mutationBlocked(capabilities().canManageTasks, 'Создание задач недоступно для этой роли')) return;
      tourTasks.unshift({ id: 'task-' + Date.now(), title: 'Новая задача по туру', date: 'Сегодня', done: false });
      showToast('Задача тура добавлена');
      return;
    }
    if (action === 'open-leads') {
      window.location.href = mobileLeadsHref();
      return;
    }
    if (action === 'export-summary') {
      if (!capabilities().canExport) { showToast('Экспорт недоступен для этой роли'); return; }
      var logisticsHeaders = [];
      cities.forEach(function (city) {
        ['arrival', 'hotel', 'departure'].forEach(function (stage) { logisticsHeaders.push(cityLabel(city) + ' · ' + stageMeta[stage].tab); });
      });
      var csv = [['Турист', 'Лид', 'Группа тура'].concat(logisticsHeaders).map(csvCell).join(',')].concat(currentTourists().map(function (tourist) {
        var logistics = [];
        cities.forEach(function (city) {
          ['arrival', 'hotel', 'departure'].forEach(function (stage) {
            logistics.push(tourist.route.indexOf(city.id) === -1 ? 'Не входит в маршрут' : recordSummary(effectiveRecordAt(city.id, stage, tourist.id), stage));
          });
        });
        return [tourist.name, tourist.lead, globalGroupLabel(tourist)].concat(logistics).map(csvCell).join(',');
      })).join('\n');
      var link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      link.download = 'unique-tour-summary.csv';
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('Сводная выгружена без сетевого запроса');
      return;
    }
    if (action === 'open-source-lead') {
      window.location.href = mobileLeadsHref(button.dataset.id, 'overview');
      return;
    }
    if (action === 'delete-tourist') {
      if (mutationBlocked(capabilities().canDelete, 'Удаление доступно только администратору')) return;
      var deleteCandidate = touristById(button.dataset.id);
      var leadTouristCount = tourists.filter(function (tourist) { return deleteCandidate && tourist.leadId === deleteCandidate.leadId; }).length;
      if (leadTouristCount < 2) {
        showToast('Последнего туриста лида удалить нельзя');
        return;
      }
      state.overlay = { kind: 'delete-tourist', touristId: button.dataset.id, previous: state.overlay };
      render();
      return;
    }
    if (action === 'confirm-delete-tourist') {
      if (mutationBlocked(capabilities().canDelete, 'Удаление доступно только администратору')) return;
      removeTouristFromModel(button.dataset.id);
      state.overlay = null;
      state.view = 'tourists';
      showToast('Турист удалён из mock-тура');
      return;
    }
    if (action === 'bulk-group') {
      if (mutationBlocked(capabilities().canGroup, 'Группировка недоступна для этой роли')) return;
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
      if (mutationBlocked(capabilities().canEditLogistics, 'Логистика доступна менеджеру и администратору')) return;
      if (!scopedTourists(false).some(leadConfirmed)) { showToast('Логистика доступна после подтверждения лида'); return; }
      openOperationSelection([]);
      return;
    }
    if (action === 'continue-editing') {
      state.overlay = state.overlay.previousForm;
      render();
      return;
    }
    if (action === 'continue-profile-edit') {
      state.overlay = state.overlay.previousForm;
      render();
      return;
    }
    if (action === 'discard-profile-edit') {
      state.overlay = state.overlay.previousForm.previous || null;
      render();
      return;
    }
    if (action === 'discard-form') {
      state.overlay = null;
      state.draft = null;
      render();
      return;
    }
    if (action === 'close-overlay') {
      if (state.overlay && state.overlay.kind === 'profile-edit' && state.overlay.dirty) {
        state.overlay = { kind: 'discard-profile', previousForm: state.overlay };
        render();
        return;
      }
      if (state.overlay && state.overlay.kind === 'form' && state.overlay.dirtyFields && state.overlay.dirtyFields.size) {
        state.overlay = { kind: 'discard-form', previousForm: state.overlay };
        render();
        return;
      }
      if (state.overlay && state.overlay.kind === 'point-picker' && state.pointPickerReturn) {
        state.overlay = state.pointPickerReturn;
        state.pointPickerReturn = null;
        render();
        return;
      }
      if (state.overlay && state.overlay.previous) {
        state.overlay = state.overlay.previous;
        render();
        return;
      }
      if (state.overlay && state.overlay.kind === 'tourist-detail' && state.returnLead) {
        window.location.href = mobileLeadsHref(state.returnLead, state.returnTab);
        return;
      }
      if (state.overlay && state.overlay.kind === 'tourist-detail' && state.returnContext) {
        var returnContext = state.returnContext;
        state.returnContext = null;
        state.overlay = null;
        restoreTourContext(returnContext);
        render();
        return;
      }
      state.overlay = null;
      state.draft = null;
      render();
      return;
    }
    if (action === 'open-point-picker') {
      state.pointPickerReturn = state.overlay;
      state.overlay = { kind: 'point-picker', query: '' };
      render();
      return;
    }
    if (action === 'select-point') {
      var selectedPoint = directoryPointById(button.dataset.id);
      if (selectedPoint && state.draft) {
        state.draft.pointId = selectedPoint.id;
        state.draft.point = pointDisplay(selectedPoint);
        state.draft.pointManual = false;
        state.draft.pointAutofilled = false;
        if (state.pointPickerReturn && state.pointPickerReturn.dirtyFields) {
          state.pointPickerReturn.dirtyFields.add('point');
          state.pointPickerReturn.dirtyFields.add('pointId');
        }
      }
      state.overlay = state.pointPickerReturn;
      state.pointPickerReturn = null;
      render();
      return;
    }
    if (action === 'use-manual-point') {
      if (state.draft) {
        state.draft.pointId = '';
        state.draft.point = '';
        state.draft.pointManual = true;
        state.draft.pointAutofilled = false;
        if (state.pointPickerReturn && state.pointPickerReturn.dirtyFields) {
          state.pointPickerReturn.dirtyFields.add('point');
          state.pointPickerReturn.dirtyFields.add('pointId');
        }
      }
      state.overlay = state.pointPickerReturn;
      state.pointPickerReturn = null;
      render();
      return;
    }
    if (action === 'toggle-tourist') {
      if (!state.overlay || !state.overlay.selected) return;
      var selected = state.overlay.selected;
      var id = button.dataset.id;
      var selectedTourist = touristById(id);
      if (!selectedTourist || selectedTourist.tourId !== state.selectedTourId) return;
      if (state.overlay.kind === 'operation-select') {
        var selectionGroup = state.overlay.groupId ? stageGroups(state.overlay.stage)[state.overlay.groupId] : null;
        if (!leadConfirmed(selectedTourist) || selectedTourist.route.indexOf(currentCity().id) === -1 || (selectionGroup && selectionGroup.members.indexOf(id) !== -1)) return;
      }
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      if (state.overlay.error) state.overlay.error = null;
      render();
      return;
    }
    if (action === 'select-all') {
      var selectable = state.overlay.kind === 'operation-select' ? scopedTourists(false).filter(leadConfirmed) : currentTourists();
      selectable.forEach(function (tourist) { state.overlay.selected.add(tourist.id); });
      render();
      return;
    }
    if (action === 'next-operation') {
      var selectedOperationGroupId = state.overlay.groupId || null;
      var selectedForOperation = Array.from(state.overlay.selected).map(touristById);
      if (!selectedForOperation.every(leadConfirmed)) {
        state.overlay.error = 'Логистика доступна только после подтверждения лида.';
        render();
        return;
      }
      if (mutationBlocked(canMutateLogisticsFor(selectedForOperation.map(function (tourist) { return tourist.id; })), 'Логистика недоступна для выбранных туристов')) return;
      openForm(Array.from(state.overlay.selected), Boolean(selectedOperationGroupId), selectedOperationGroupId);
      return;
    }
    if (action === 'pick-source') {
      state.overlay.sourceId = button.dataset.id;
      state.draft = button.dataset.id === 'blank' ? blankRecord(state.overlay.stage) :
        cleanRecord(effectiveRecord(state.overlay.stage, button.dataset.id), state.overlay.stage);
      state.overlay.dirtyFields = new Set();
      syncDraftPoint();
      render();
      return;
    }
    if (action === 'save-form') {
      var formOverlay = state.overlay;
      if (formOverlay.editMode === 'own') {
        var ownTouristId = formOverlay.members[0];
        var ownTourist = touristById(ownTouristId);
        var ownContextValid = formOverlay.tourId === state.selectedTourId && currentCity().id === formOverlay.routeCityId;
        if (!ownContextValid || mutationBlocked(canEditLogisticsForAt(ownTourist, formOverlay.routeCityId), 'Личная запись недоступна для этого туриста')) return;
        records[formOverlay.routeCityId][formOverlay.stage][ownTouristId] = cleanRecord(state.draft, formOverlay.stage);
        state.overlay = null;
        showToast('Личная запись сохранена');
        return;
      }
      if (mutationBlocked(canMutateLogisticsFor(formOverlay.members), 'Логистика недоступна для выбранных туристов')) return;
      if (formOverlay.editing) {
        if (!applyStageRecord(formOverlay.members, formOverlay.stage, state.draft, formOverlay.groupId, formOverlay.sourceId)) return;
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
          sourceId: null,
          previousDraft: Object.assign({}, state.draft),
          dirtyFields: new Set(formOverlay.dirtyFields || [])
        };
        render();
        return;
      }
      if (!applyStageRecord(formOverlay.members, formOverlay.stage, state.draft, null, formOverlay.sourceId)) return;
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
        sourceId: conflict.sourceId || 'blank',
        dirtyFields: new Set(conflict.dirtyFields || [])
      };
      render();
      return;
    }
    if (action === 'apply-conflict') {
      var conflictOverlay = state.overlay;
      if (!conflictOverlay.sourceId) return;
      if (mutationBlocked(canMutateLogisticsFor(conflictOverlay.members), 'Логистика недоступна для выбранных туристов')) return;
      var source = effectiveRecord(conflictOverlay.stage, conflictOverlay.sourceId);
      var mergedValues = Object.assign({}, cleanRecord(source, conflictOverlay.stage));
      Array.from(conflictOverlay.dirtyFields || []).forEach(function (key) {
        mergedValues[key] = conflictOverlay.previousDraft[key];
      });
      if (!applyStageRecord(conflictOverlay.members, conflictOverlay.stage, mergedValues, null, conflictOverlay.sourceId)) return;
      state.overlay = null;
      showToast('Общая запись создана без изменения индивидуальных данных');
      return;
    }
    if (action === 'edit-operation') {
      var editOperationMembers = button.dataset.members.split(',');
      if (mutationBlocked(canMutateLogisticsFor(editOperationMembers), 'Изменение логистики недоступно')) return;
      var editOperationGroup = stageGroups(state.stage)[button.dataset.group];
      if (editOperationGroup) openForm(editOperationMembers, true, editOperationGroup.id);
      else if (editOperationMembers.length === 1) openOwnForm(editOperationMembers[0]);
      return;
    }
    if (action === 'manage-operation') {
      var memberIds = button.dataset.members.split(',');
      if (memberIds.length === 1) {
        if (mutationBlocked(canMutateLogisticsFor(memberIds), 'Создание общей записи недоступно')) return;
        openOperationSelection(memberIds);
      } else {
        state.overlay = { kind: 'operation-manage', stage: state.stage, groupId: button.dataset.group };
        render();
      }
      return;
    }
    if (action === 'add-operation-members') {
      var managedGroup = stageGroups(state.overlay.stage)[state.overlay.groupId];
      if (!managedGroup || mutationBlocked(canMutateLogisticsFor(managedGroup.members), 'Изменение состава недоступно')) return;
      openOperationSelection(managedGroup.members, managedGroup.id);
      return;
    }
    if (action === 'split-operation-members') {
      var splitManagedGroup = stageGroups(state.overlay.stage)[state.overlay.groupId];
      if (!splitManagedGroup || mutationBlocked(canMutateLogisticsFor(splitManagedGroup.members), 'Разъединение операции недоступно')) return;
      state.overlay = { kind: 'operation-split', stage: state.stage, groupId: splitManagedGroup.id, members: splitManagedGroup.members.slice(), selected: new Set() };
      render();
      return;
    }
    if (action === 'apply-operation-split') {
      var splitOverlay = state.overlay;
      if (mutationBlocked(canMutateLogisticsFor(splitOverlay.members), 'Разъединение операции недоступно')) return;
      var splitAll = splitOverlay.selected.size === splitOverlay.members.length;
      var detachedForSplit = Array.from(splitOverlay.selected);
      var splitGroup = stageGroups(splitOverlay.stage)[splitOverlay.groupId];
      var remainingAfterSplit = splitOverlay.members.filter(function (id) { return detachedForSplit.indexOf(id) === -1; });
      if (!splitAll && splitGroup && detachedForSplit.indexOf(splitGroup.sourceId) !== -1 && remainingAfterSplit.length >= 2) {
        state.overlay = {
          kind: 'split-source',
          stage: splitOverlay.stage,
          groupId: splitOverlay.groupId,
          detached: detachedForSplit,
          remaining: remainingAfterSplit,
          sourceId: null,
          previousSplit: splitOverlay
        };
        render();
        return;
      }
      detachMembersFromStage(splitOverlay.stage, detachedForSplit);
      state.overlay = null;
      showToast(splitAll ? 'Общая запись расформирована, индивидуальные данные восстановлены' : 'Туристы отделены, индивидуальные данные восстановлены');
      return;
    }
    if (action === 'pick-split-source') {
      state.overlay.sourceId = button.dataset.id;
      render();
      return;
    }
    if (action === 'back-to-operation-split') {
      state.overlay = state.overlay.previousSplit;
      render();
      return;
    }
    if (action === 'confirm-operation-split') {
      var splitSourceOverlay = state.overlay;
      if (mutationBlocked(canMutateLogisticsFor(splitSourceOverlay.remaining.concat(splitSourceOverlay.detached)), 'Разъединение операции недоступно')) return;
      var groupAfterChoice = stageGroups(splitSourceOverlay.stage)[splitSourceOverlay.groupId];
      if (groupAfterChoice) {
        groupAfterChoice.sourceId = splitSourceOverlay.sourceId;
        groupAfterChoice.masterId = splitSourceOverlay.sourceId;
      }
      detachMembersFromStage(splitSourceOverlay.stage, splitSourceOverlay.detached);
      state.overlay = null;
      showToast('Туристы отделены, основная запись выбрана явно');
      return;
    }
    if (action === 'start-tourist-group') {
      if (!capabilities().canGroup || state.offline) {
        showToast(state.offline ? 'Подключитесь к интернету для группировки' : 'Группировка недоступна для этой роли');
        return;
      }
      state.overlay = { kind: 'tourist-group-select', selected: new Set(), error: null };
      render();
      return;
    }
    if (action === 'apply-tourist-group') {
      if (applyTouristGrouping()) saveCanonicalTourists();
      return;
    }
    if (action === 'split-tourist-group') {
      if (mutationBlocked(capabilities().canGroup, 'Управление группой недоступно для этой роли')) return;
      state.overlay = { kind: 'global-split', groupId: button.dataset.group, selected: new Set() };
      render();
      return;
    }
    if (action === 'apply-global-split') {
      if (mutationBlocked(capabilities().canGroup, 'Управление группой недоступно для этой роли')) return;
      var globalOverlay = state.overlay;
      var globallyDetached = Array.from(globalOverlay.selected);
      globallyDetached.forEach(function (touristId) {
        touristById(touristId).groupId = null;
      });
      var remaining = currentTourists().filter(function (tourist) { return tourist.groupId === globalOverlay.groupId; });
      if (remaining.length < 2) remaining.forEach(function (tourist) { tourist.groupId = null; globallyDetached.push(tourist.id); });
      saveCanonicalTourists();
      state.overlay = null;
      showToast('Группа тура изменена, общие записи операций сохранены');
    }
  });

  function operationVisitSnapshot() {
    var visits = [];
    currentTourists().forEach(function (tourist) {
      tourist.route.forEach(function (routeCityId) {
        ['arrival', 'hotel', 'departure'].forEach(function (operation) {
          var group = operationGroupForAt(routeCityId, operation, tourist.id);
          visits.push({
            visitId: visitIdFor(routeCityId, operation, tourist.id),
            touristId: tourist.id,
            tourId: tourist.tourId,
            routeCityId: routeCityId,
            operation: operation,
            ownValues: ownRecordAt(routeCityId, operation, tourist.id) || {},
            effectiveValues: effectiveRecordAt(routeCityId, operation, tourist.id) || {},
            subgroupId: group ? group.subgroupId : null,
            sourceVisitId: group ? group.sourceVisitId : null
          });
        });
      });
    });
    return visits;
  }

  window.__prototypeDebug = {
    snapshot: function () {
      return clone({
        tourists: tourists,
        visits: operationVisitSnapshot(),
        records: records,
        operationGroups: operationGroups,
        directory: directory,
        role: state.role,
        selectedTourId: state.selectedTourId,
        view: state.view,
        cityIndex: state.cityIndex,
        routeCityId: currentCity().id,
        stage: state.stage,
        touristListMode: state.touristListMode,
        touristQuery: state.touristQuery,
        touristFilters: state.touristFilters,
        documentFilter: state.documentFilter,
        returnContext: state.returnContext,
        scopeLead: state.scopeLead,
        offline: state.offline,
        uiPreview: state.uiPreview
      });
    }
  };

  render();
}());
