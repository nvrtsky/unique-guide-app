(function () {
  'use strict';

  var root = document.getElementById('app');
  var groupCounter = 20;
  var toastTimer = null;
  var requestedParams = new URLSearchParams(window.location.search);
  var requestedTouristId = requestedParams.get('tourist');
  var requestedTourId = requestedParams.get('tourId');
  var sharedMock = window.UNIQUE_MOCK_DATA || { tours: [], supplementalLeads: [], supplementalTourists: [], financeByLeadId: {} };

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
      notes: 'Вегетарианское меню. Плательщик по заявке.', guideComment: 'Встречать у выхода B.', preferredChannel: 'WhatsApp'
    },
    {
      id: 't2', leadTouristId: 'lt-1042-2', contactId: 'contact-202', dealId: 'deal-502', tourId: 'china',
      name: 'Соколов Илья Максимович', firstName: 'Илья', lastName: 'Соколов', middleName: 'Максимович', initials: 'СИ',
      birthDate: '2012-11-03', phone: '+7 916 555-12-35', email: 'ilya.sokolov@example.com', citizenship: 'Россия',
      domesticPassport: '', domesticIssuedBy: '', registrationAddress: 'Москва, ул. Тверская, 12',
      latinName: 'ILIA SOKOLOV', passport: '72 1122334', passportExpiry: '2026-11-18', scans: [],
      lead: 'Лид Соколовы', leadId: 'lead-1042', leadStatus: 'Подтверждён', tourStatus: 'Подтверждён', groupId: 'family-sokolov', groupRepresentative: false,
      route: ['route-beijing-1', 'route-xian-1', 'route-shanghai-1'], type: 'Ребёнок', isPrimary: false,
      notes: '', guideComment: 'Аллергия на арахис.', preferredChannel: 'Telegram'
    },
    {
      id: 't3', leadTouristId: 'lt-1048-1', contactId: 'contact-203', dealId: 'deal-503', tourId: 'china',
      name: 'Орлова Марина Сергеевна', firstName: 'Марина', lastName: 'Орлова', middleName: 'Сергеевна', initials: 'ОМ',
      birthDate: '1991-07-22', phone: '+7 701 222-41-90', email: 'marina.orlova@example.kz', citizenship: 'Казахстан',
      domesticPassport: '', domesticIssuedBy: '', registrationAddress: '',
      latinName: 'MARINA ORLOVA', passport: 'N12345678', passportExpiry: '2030-02-10', scans: [{ id: 'scan-t3-1', name: 'passport-marina.pdf', status: 'ready' }],
      lead: 'Лид Орлова', leadId: 'lead-1048', leadStatus: 'Подтверждён', tourStatus: 'Ожидает', groupId: null, groupRepresentative: false,
      route: ['route-beijing-1', 'route-xian-1', 'route-shanghai-1', 'route-beijing-2'], type: 'Взрослый', isPrimary: true,
      notes: 'Связь после 10:00 по Москве.', guideComment: 'Говорит по-английски.', preferredChannel: 'Telegram'
    },
    {
      id: 't4', leadTouristId: 'lt-1048-2', contactId: null, dealId: 'deal-504', tourId: 'china',
      name: 'Волков Денис Андреевич', firstName: 'Денис', lastName: 'Волков', middleName: 'Андреевич', initials: 'ВД',
      birthDate: '2024-01-16', phone: '', email: '', citizenship: 'Россия',
      domesticPassport: '', domesticIssuedBy: '', registrationAddress: '',
      latinName: '', passport: '', passportExpiry: '', scans: [],
      lead: 'Лид Орлова', leadId: 'lead-1048', leadStatus: 'Подтверждён', tourStatus: 'Ожидает', groupId: null, groupRepresentative: false,
      route: ['route-beijing-1', 'route-shanghai-1'], type: 'Младенец', isPrimary: false,
      notes: 'Контакт через основного туриста.', guideComment: 'Нужна детская кроватка.', preferredChannel: ''
    },
    {
      id: 't5', leadTouristId: 'lt-1033-1', contactId: 'contact-206', dealId: 'deal-506', tourId: null,
      name: 'Морозов Олег', firstName: 'Олег', lastName: 'Морозов', middleName: '', initials: 'МО',
      birthDate: '', phone: '+7 926 774-30-10', email: 'oleg@example.ru', citizenship: 'Россия',
      domesticPassport: '', domesticIssuedBy: '', registrationAddress: '', latinName: '', passport: '', passportExpiry: '', scans: [],
      lead: 'Лид Морозов', leadId: 'lead-1033', leadStatus: 'Потерян', tourStatus: 'Не участвует', groupId: null, groupRepresentative: false,
      route: [], type: 'Взрослый', isPrimary: true, notes: '', guideComment: '', preferredChannel: ''
    }
  ];

  sharedMock.supplementalTourists.forEach(function (seed) {
    if (!tourists.some(function (tourist) { return tourist.id === seed.id; })) tourists.push(JSON.parse(JSON.stringify(seed)));
  });

  var TOURIST_STORAGE_KEY = 'unique-guide-tourists-v3';
  var LEGACY_TOURIST_STORAGE_KEY = 'unique-guide-tourists-v2';
  var LEGACY_TOURIST_MIGRATION_STORAGE_KEY = 'unique-guide-tourists-v2-mobile-migrated';
  var TOURIST_MIGRATION_STORAGE_KEY = 'unique-guide-tourists-v3-mobile-migrated';
  var canonicalTouristSeeds = tourists.map(function (tourist) { return JSON.parse(JSON.stringify(tourist)); });
  var canonicalTouristStore = [];

  function normalizeCanonicalTourist(tourist) {
    if (tourist.notes == null && tourist.internalNote != null) tourist.notes = tourist.internalNote;
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
      var currentRaw = window.localStorage.getItem(TOURIST_STORAGE_KEY);
      var legacyRaw = currentRaw == null ? window.localStorage.getItem(LEGACY_TOURIST_STORAGE_KEY) : null;
      var raw = currentRaw == null ? legacyRaw : currentRaw;
      if (raw == null) {
        canonicalTouristStore = tourists.slice();
        return;
      }
      var saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      var migrated = saved.filter(function (savedTourist) { return savedTourist && savedTourist.id; }).map(function (savedTourist) {
        var seed = canonicalTouristSeeds.find(function (candidate) { return candidate.id === savedTourist.id; });
        return normalizeCanonicalTourist(Object.assign({}, seed || {}, savedTourist));
      });
      if (currentRaw == null) {
        var migratedIds = {};
        var legacySeedIds = { t1: true, t2: true, t3: true, t4: true };
        if (window.localStorage.getItem(LEGACY_TOURIST_MIGRATION_STORAGE_KEY) === '1') {
          legacySeedIds.t5 = true;
          legacySeedIds['lead-tourist-1051'] = true;
        }
        migrated.forEach(function (tourist) { migratedIds[tourist.id] = true; });
        canonicalTouristSeeds.forEach(function (seed) {
          if (!legacySeedIds[seed.id] && !migratedIds[seed.id]) migrated.push(normalizeCanonicalTourist(Object.assign({}, seed)));
        });
      }
      tourists.splice.apply(tourists, [0, tourists.length].concat(migrated));
      canonicalTouristStore = tourists.slice();
      if (currentRaw == null) {
        window.localStorage.setItem(TOURIST_STORAGE_KEY, JSON.stringify(canonicalTouristStore));
        window.localStorage.setItem(TOURIST_MIGRATION_STORAGE_KEY, '1');
      }
    } catch (error) {
      console.warn('Tourist profile storage is unavailable', error);
    }
  }

  function saveCanonicalTourists() {
    try {
      canonicalTouristStore = tourists;
      if (window.localStorage) {
        window.localStorage.setItem(TOURIST_STORAGE_KEY, JSON.stringify(tourists));
        window.localStorage.setItem(TOURIST_MIGRATION_STORAGE_KEY, '1');
      }
    } catch (error) {
      console.warn('Tourist profile changes remain in memory', error);
    }
  }

  tourists.forEach(normalizeCanonicalTourist);
  hydrateCanonicalTourists();
  canonicalTouristStore = tourists;
  window.UNIQUE_PROTOTYPE_STORE = window.UNIQUE_PROTOTYPE_STORE || {};
  window.UNIQUE_PROTOTYPE_STORE.tourists = tourists;

  // Production calls this role `viewer`; keep the user-facing CRM label "Гид".
  // The legacy `?role=guide` deep link is normalized below and never enters state.
  var roleLabels = { admin: 'Администратор', manager: 'Менеджер', escort: 'Сопровождающий', viewer: 'Гид', forbidden: 'Пользователь' };
  var managerTourIds = sharedMock.tours.length ? sharedMock.tours.map(function (tour) { return tour.id; }) : ['china'];
  var managerLeadIds = ['lead-1042', 'lead-1048'].concat(sharedMock.supplementalLeads.filter(function (lead) { return lead.manager === 'Елена Воронова'; }).map(function (lead) { return lead.id; }));
  var escortTourIds = ['china', 'morocco'];
  var viewerTourIds = ['china', 'morocco'];
  var viewerCityIds = ['route-beijing-1', 'route-xian-1'];
  var LEAD_STORAGE_KEY = 'unique-guide-leads-v2';
  var LEGACY_LEAD_STORAGE_KEY = 'unique-guide-leads-v1';
  var userDirectory = [
    { id: 'user-guide-li-wei', name: 'Ли Вэй', roles: ['viewer'] },
    { id: 'user-guide-anna-kim', name: 'Анна Ким', roles: ['viewer', 'escort'] },
    { id: 'user-guide-yuki-tanaka', name: 'Юки Танака', roles: ['viewer'] },
    { id: 'user-guide-marco-rossi', name: 'Марко Росси', roles: ['viewer'] },
    { id: 'user-escort-maria-belova', name: 'Мария Белова', roles: ['escort'] },
    { id: 'user-manager-elena', name: 'Елена Воронова', roles: ['manager', 'chat_admin'] },
    { id: 'user-manager-igor', name: 'Игорь Лебедев', roles: ['manager', 'chat_admin'] }
  ];
  var leadArchiveMocks = {};

  function initialLeadStorageSeeds() {
    var seeds = [
      { id: 'lead-1042', eventId: 'china', manager: 'Елена Воронова', assignedUserId: 'manager-elena', archived: false, remainingPayment: '148000', remainingPaymentCurrency: 'CNY', remainingPaymentCollected: false },
      { id: 'lead-1048', eventId: 'china', manager: 'Елена Воронова', assignedUserId: 'manager-elena', archived: false, remainingPayment: '85000', remainingPaymentCurrency: 'RUB', remainingPaymentCollected: false },
      { id: 'lead-1051', eventId: 'china', manager: 'Игорь Лебедев', assignedUserId: 'manager-igor', archived: false, remainingPayment: '0', remainingPaymentCurrency: 'RUB', remainingPaymentCollected: false },
      { id: 'lead-1033', eventId: null, manager: 'Елена Воронова', assignedUserId: 'manager-elena', archived: true }
    ];
    sharedMock.supplementalLeads.forEach(function (lead) { seeds.push(JSON.parse(JSON.stringify(lead))); });
    return seeds;
  }

  function migrateLeadStorage() {
    try {
      if (!window.localStorage || window.localStorage.getItem(LEAD_STORAGE_KEY) != null) return;
      var legacyRaw = window.localStorage.getItem(LEGACY_LEAD_STORAGE_KEY);
      if (legacyRaw == null) {
        window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(initialLeadStorageSeeds()));
        return;
      }
      var legacyLeads = JSON.parse(legacyRaw);
      if (!Array.isArray(legacyLeads)) return;
      var migrated = legacyLeads.filter(function (lead) { return lead && lead.id; });
      var migratedIds = {};
      migrated.forEach(function (lead) { migratedIds[lead.id] = true; });
      if (legacyLeads.length > 0 && !legacyLeads.some(function (lead) { return lead && lead.code; })) {
        initialLeadStorageSeeds().slice(0, 4).forEach(function (lead) {
          if (!migratedIds[lead.id]) migrated.push(lead);
        });
      }
      sharedMock.supplementalLeads.forEach(function (lead) {
        if (!migratedIds[lead.id]) migrated.push(JSON.parse(JSON.stringify(lead)));
      });
      window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(migrated));
    } catch (error) {
      console.warn('Lead storage migration is unavailable', error);
    }
  }

  migrateLeadStorage();

  function directoryUser(userId) {
    return userDirectory.find(function (user) { return user.id === userId; }) || null;
  }

  function directoryUserName(userId) {
    var user = directoryUser(userId);
    return user ? user.name : 'Не назначен';
  }

  function userOptions(role, selectedId) {
    return '<option value="">Не назначен</option>' + userDirectory.filter(function (user) {
      return user.roles.indexOf(role) !== -1;
    }).map(function (user) {
      return '<option value="' + h(user.id) + '" ' + (user.id === selectedId ? 'selected' : '') + '>' + h(user.name) + '</option>';
    }).join('');
  }

  function hydrateManagerAssignments() {
    try {
      var rawStoredLeads = window.localStorage && window.localStorage.getItem(LEAD_STORAGE_KEY);
      if (rawStoredLeads == null) return;
      managerLeadIds = [];
      managerTourIds = [];
      var storedLeads = JSON.parse(rawStoredLeads);
      if (!Array.isArray(storedLeads)) return;
      storedLeads.forEach(function (lead) {
        if (!lead || lead.manager !== 'Елена Воронова') return;
        if (lead.id && managerLeadIds.indexOf(lead.id) === -1) managerLeadIds.push(lead.id);
        if (lead.eventId && managerTourIds.indexOf(lead.eventId) === -1) managerTourIds.push(lead.eventId);
      });
    } catch (error) {
      managerLeadIds = [];
      managerTourIds = [];
      console.warn('Lead assignments are unavailable', error);
    }
  }

  hydrateManagerAssignments();
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
        t3: { date: '2026-09-17', time: '11:00', transport: 'bus', number: 'K8', point: 'Люличао', pointId: 'point-beijing-bus', transfer: 'Такси', groupId: 'dep-c' },
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

  // Web EventSummary creates every tourist group with a shared hotel and
  // individual arrival/departure. Operation groups below are presentation
  // links only: individual visit records stay untouched.
  var tourGroupSettings = {
    'family-sokolov': { sharedHotel: true, sharedArrival: false, sharedDeparture: false }
  };

  function ensureDefaultSharedHotel(groupId) {
    var conflicts = [];
    if (!groupId || !tourGroupSettings[groupId] || !tourGroupSettings[groupId].sharedHotel) return conflicts;
    cities.forEach(function (city) {
      var members = tourists.filter(function (tourist) {
        return tourist.tourId === state.selectedTourId && tourist.groupId === groupId && tourist.route.indexOf(city.id) !== -1;
      }).map(function (tourist) { return tourist.id; });
      var groups = operationGroups[city.id].hotel;
      var defaultId = 'hotel-default-' + groupId + '-' + city.id;
      if (members.length < 2) {
        delete groups[defaultId];
        return;
      }
      var matchingGroupId = Object.keys(groups).find(function (candidateId) {
        var candidate = groups[candidateId];
        return candidate.createdFromGroupId === groupId || candidate.members.slice().sort().join(',') === members.slice().sort().join(',');
      });
      var existing = matchingGroupId ? groups[matchingGroupId] : groups[defaultId];
      var alreadyConfirmed = existing && existing.members.slice().sort().join(',') === members.slice().sort().join(',');
      var sourceKeys = {};
      var sources = [];
      var candidateMembers = members.slice();
      if (existing && !alreadyConfirmed) {
        candidateMembers = members.filter(function (touristId) { return existing.members.indexOf(touristId) === -1; });
        if (members.indexOf(existing.sourceId) !== -1) candidateMembers.unshift(existing.sourceId);
      }
      candidateMembers.forEach(function (touristId) {
        var ownHotel = records[city.id].hotel[touristId];
        if (!hasData(ownHotel, 'hotel')) return;
        var key = recordKey(ownHotel, 'hotel');
        if (sourceKeys[key]) return;
        sourceKeys[key] = touristId;
        sources.push(touristId);
      });
      if (!alreadyConfirmed && sources.length > 1) {
        conflicts.push({
          routeCityId: city.id,
          members: members.slice(),
          sources: sources,
          groupId: existing ? existing.id : null
        });
        return;
      }
      if (matchingGroupId && matchingGroupId !== defaultId) delete groups[defaultId];
      var sourceId = existing && members.indexOf(existing.sourceId) !== -1 ? existing.sourceId : (sources[0] || members[0]);
      var resolvedId = matchingGroupId || defaultId;
      groups[resolvedId] = syncOperationGroup({
        id: resolvedId,
        subgroupId: resolvedId,
        sourceId: sourceId,
        masterId: sourceId,
        createdFromGroupId: groupId,
        members: members,
        idempotencyKey: [state.selectedTourId, city.id, 'hotel', members.slice().sort().join(',')].join('|')
      }, city.id, 'hotel');
    });
    return conflicts;
  }

  function previewDefaultSharedHotelConflicts(pendingGroup) {
    var conflicts = [];
    if (!pendingGroup || !pendingGroup.settings.sharedHotel) return conflicts;
    cities.forEach(function (city) {
      var members = pendingGroup.allMemberIds.filter(function (touristId) {
        var tourist = touristById(touristId);
        return tourist && tourist.route.indexOf(city.id) !== -1;
      });
      if (members.length < 2) return;
      var groups = operationGroups[city.id].hotel;
      var matchingGroupId = Object.keys(groups).find(function (candidateId) {
        var candidate = groups[candidateId];
        return candidate.createdFromGroupId === pendingGroup.groupId || candidate.members.slice().sort().join(',') === members.slice().sort().join(',');
      });
      var existing = matchingGroupId ? groups[matchingGroupId] : null;
      var alreadyConfirmed = existing && existing.members.slice().sort().join(',') === members.slice().sort().join(',');
      var candidateMembers = members.slice();
      if (existing && !alreadyConfirmed) {
        candidateMembers = members.filter(function (touristId) { return existing.members.indexOf(touristId) === -1; });
        if (members.indexOf(existing.sourceId) !== -1) candidateMembers.unshift(existing.sourceId);
      }
      var sourceKeys = {};
      var sources = [];
      candidateMembers.forEach(function (touristId) {
        var ownHotel = records[city.id].hotel[touristId];
        if (!hasData(ownHotel, 'hotel')) return;
        var key = recordKey(ownHotel, 'hotel');
        if (sourceKeys[key]) return;
        sourceKeys[key] = touristId;
        sources.push(touristId);
      });
      if (!alreadyConfirmed && sources.length > 1) conflicts.push({
        routeCityId: city.id,
        members: members,
        sources: sources,
        groupId: existing ? existing.id : null
      });
    });
    return conflicts;
  }

  function openDefaultHotelConflict(pendingGroup, conflicts) {
    var conflict = conflicts[0];
    if (!conflict) return false;
    var cityIndex = cities.findIndex(function (city) { return city.id === conflict.routeCityId; });
    if (cityIndex >= 0) state.cityIndex = cityIndex;
    var firstSource = conflict.sources[0];
    state.draft = cleanRecord(records[conflict.routeCityId].hotel[firstSource] || blankRecord('hotel'), 'hotel');
    state.overlay = {
      kind: 'conflict',
      stage: 'hotel',
      members: conflict.members.slice(),
      sources: conflict.sources.slice(),
      sourceId: null,
      previousDraft: Object.assign({}, state.draft),
      dirtyFields: new Set(),
      groupId: conflict.groupId || null,
      routeCityId: conflict.routeCityId,
      tourId: state.selectedTourId,
      pendingTouristGroup: pendingGroup,
      remainingDefaultHotelConflicts: conflicts.slice(1)
    };
    render();
    return true;
  }

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
    {
      id: 'china', name: 'Гранд-тур по Китаю', country: 'Китай', cities: ['Пекин', 'Сиань', 'Шанхай', 'Пекин'],
      startDate: '2026-09-14', endDate: '2026-09-25', dates: '14–25 сен 2026', status: 'active', isArchived: false,
      tourType: 'group', tourTypeLabel: 'Групповой', color: '#2f6bd8', tourists: 4, bookedCount: 4, capacity: 12,
      price: '189000', priceCurrency: 'RUB', availableSpots: 8, logisticsCompleteness: 63,
      statusCounts: { confirmed: 2, pending: 2, cancelled: 0 },
      route: 'Пекин → Сиань → Шанхай → Пекин', guides: 'Ли Вэй, Анна Ким', escort: 'Мария Белова',
      cityGuides: { 'route-beijing-1': 'user-guide-li-wei', 'route-xian-1': 'user-guide-anna-kim', 'route-shanghai-1': 'user-guide-li-wei', 'route-beijing-2': 'user-guide-anna-kim' },
      financeGuideCityId: 'route-xian-1', escortUserId: 'user-escort-maria-belova', chatAdminIds: ['user-manager-elena', 'user-manager-igor'],
      chatAdmins: ['Елена Воронова', 'Игорь Лебедев'], site: 'https://unique-travel.ru/china-grand',
      description: 'Авторский маршрут с четырьмя городскими остановками и повторным Пекином.'
    },
    {
      id: 'japan', name: 'Япония: сезон момидзи', country: 'Япония', cities: ['Токио', 'Киото', 'Осака'],
      startDate: '2026-11-08', endDate: '2026-11-18', dates: '8–18 ноя 2026', status: 'draft', isArchived: false,
      tourType: 'group', tourTypeLabel: 'Групповой', color: '#7a5af0', tourists: 7, bookedCount: 7, capacity: 10,
      price: '245000', priceCurrency: 'RUB', availableSpots: 3, logisticsCompleteness: 18,
      statusCounts: { confirmed: 4, pending: 3, cancelled: 0 }, route: 'Токио → Киото → Осака',
      guides: 'Юки Танака', cityGuides: {}, financeGuideCityId: null, escortUserId: '', escort: 'Не назначен', chatAdminIds: ['user-manager-elena'], chatAdmins: ['Елена Воронова'], site: 'https://unique-travel.ru/japan',
      description: 'Осенний маршрут по Японии в сезон красных клёнов.'
    },
    {
      id: 'italy', name: 'Италия для своих', country: 'Италия', cities: ['Рим', 'Флоренция', 'Венеция'],
      startDate: '2026-06-04', endDate: '2026-06-12', dates: '4–12 июн 2026', status: 'archive', isArchived: true,
      tourType: 'individual', tourTypeLabel: 'Индивидуальный', color: '#c98a1e', tourists: 9, bookedCount: 9, capacity: 9,
      price: '275000', priceCurrency: 'RUB', availableSpots: 0, logisticsCompleteness: 100,
      statusCounts: { confirmed: 9, pending: 0, cancelled: 0 }, route: 'Рим → Флоренция → Венеция',
      guides: 'Марко Росси', cityGuides: {}, financeGuideCityId: null, escortUserId: 'user-guide-anna-kim', escort: 'Анна Ким', chatAdminIds: ['user-manager-igor'], chatAdmins: ['Игорь Лебедев'], site: 'https://unique-travel.ru/italy',
      description: 'Завершённый камерный тур по трём городам Италии.'
    }
  ];

  sharedMock.tours.forEach(function (seed) {
    var existing = tours.find(function (tour) { return tour.id === seed.id; });
    var values = {
      id: seed.id, name: seed.title, country: seed.country, cities: seed.cities.slice(),
      startDate: seed.startDate, endDate: seed.endDate, dates: seed.dates, status: seed.status,
      isArchived: Boolean(seed.isArchived || seed.status === 'archive'), tourType: seed.tourType,
      tourTypeLabel: seed.tourTypeLabel, color: seed.color, tourists: 10, bookedCount: 10,
      capacity: seed.capacity, price: seed.price, priceCurrency: seed.priceCurrency,
      availableSpots: Math.max(0, Number(seed.capacity || 10) - 10), logisticsCompleteness: seed.logisticsCompleteness,
      statusCounts: { confirmed: 6, pending: 4, cancelled: 0 }, route: seed.cities.join(' → '),
      guides: seed.guides || 'Не назначены', cityGuides: existing && existing.cityGuides || {},
      financeGuideCityId: seed.financeGuideCityId || null,
      escortUserId: existing && existing.escortUserId || '', escort: existing && existing.escort || 'Не назначен',
      chatAdminIds: existing && existing.chatAdminIds || ['user-manager-elena'],
      chatAdmins: existing && existing.chatAdmins || ['Елена Воронова'],
      site: existing && existing.site || '', description: seed.description
    };
    if (existing) Object.assign(existing, values); else tours.push(values);
  });

  // The first guide edition must remain usable for every tour assigned to a
  // guide or escort. China keeps the full summary mock above; this small
  // task model supplies the same guide shell for Morocco without copying China
  // records into another route. Status changes stay in local prototype memory.
  var guideOperationalMocks = {
    morocco: {
      route: {
        'route-casablanca-1': {
          dates: '3–6 окт',
          arrival: [
            { id: 'at-221', time: '09:40', date: '3 окт', title: 'AT 221', detail: 'Самолёт · Мохаммед V (CMN) · групповой трансфер', memberIndexes: [0, 1, 2, 3, 4, 5] },
            { id: 'af-1496', time: '14:15', date: '3 окт', title: 'AF 1496', detail: 'Самолёт · Мохаммед V (CMN) · минивэн', memberIndexes: [6, 7, 8, 9] }
          ],
          hotel: [
            { id: 'odyssee-center', time: '•', date: '3–6 окт', title: 'Odyssee Center Hotel', detail: 'Размещение · Double и Twin · завтрак', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
          ],
          departure: [
            { id: 'ctm-104', time: '08:30', date: '6 окт', title: 'CTM 104', detail: 'Автобус · CTM Casablanca · багаж 1 место', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7] },
            { id: 'private-casa-marrakesh', time: '10:00', date: '6 окт', title: 'Минивэн 2', detail: 'Авто · холл отеля · детское кресло', memberIndexes: [8, 9] }
          ]
        },
        'route-marrakesh-1': {
          dates: '6–9 окт',
          arrival: [
            { id: 'arrival-marrakesh', time: '12:10', date: '6 окт', title: 'Прибытие из Касабланки', detail: 'Автобус и минивэн · встреча у входа в риад', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
          ],
          hotel: [
            { id: 'riad-kniza', time: '•', date: '6–9 окт', title: 'Riad Kniza', detail: 'Размещение · 5 номеров · ужин 6 октября', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
          ],
          departure: [
            { id: 'marrakesh-ouarzazate', time: '08:00', date: '9 окт', title: 'Автобус в Уарзазат', detail: 'Автобус · вход в риад · остановка на перевале', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
          ]
        },
        'route-ouarzazate-1': {
          dates: '9–13 окт',
          arrival: [
            { id: 'arrival-ouarzazate', time: '13:30', date: '9 окт', title: 'Прибытие в Уарзазат', detail: 'Автобус · площадь аль-Мувахидин · обед', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
          ],
          hotel: [
            { id: 'berbere-palace', time: '•', date: '9–13 окт', title: 'Le Berbère Palace', detail: 'Размещение · Double и Twin · завтрак', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
          ],
          departure: [
            { id: 'at-412', time: '17:50', date: '13 окт', title: 'AT 412', detail: 'Самолёт · Уарзазат (OZZ) · трансфер из отеля', memberIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] }
          ]
        }
      },
      program: [
        { day: 1, date: '3 октября', city: 'Касабланка', description: 'Встреча в аэропорту, трансфер и заселение.' },
        { day: 2, date: '4 октября', city: 'Касабланка', description: 'Мечеть Хасана II, набережная и медина.' },
        { day: 4, date: '6 октября', city: 'Марракеш', description: 'Переезд, заселение в риад и вечер на площади Джемаа-эль-Фна.' },
        { day: 7, date: '9 октября', city: 'Уарзазат', description: 'Переезд через Тизи-н-Тичка и заселение.' },
        { day: 11, date: '13 октября', city: 'Уарзазат', description: 'Выезд из отеля, трансфер в аэропорт.' }
      ]
    }
  };
  var guideOperationalStatuses = {};

  var programSeedDescriptions = {
    '2026-09-14': 'Встреча в аэропорту, размещение, вечерняя прогулка по хутунам.',
    '2026-09-15': 'Запретный город, парк Цзиншань и чайная церемония.',
    '2026-09-16': 'Участок Мутяньюй, обед и свободный вечер.'
  };
  var programDays = buildProgramDays(tours[0], [], programSeedDescriptions);

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
    { id: 'task1', title: 'Подтвердить минивэн в Пекине', description: 'Связаться с принимающей стороной и подтвердить вместимость.', priority: 'urgent', status: 'todo', dueDate: '2026-09-12' },
    { id: 'task2', title: 'Отправить гиду список паспортов', description: 'Только после финальной проверки документов.', priority: 'high', status: 'in_progress', dueDate: '2026-09-13' },
    { id: 'task3', title: 'Проверить билеты G89', description: '', priority: 'medium', status: 'done', dueDate: '2026-09-10' }
  ];

  var initialParams = requestedParams;
  var initialTouristId = initialParams.get('tourist');
  var initialRouteCityId = initialParams.get('routeCityId');
  var initialCityIndex = cities.findIndex(function (city) { return city.id === initialRouteCityId; });
  var tourSectionMap = { overview: 'tour-info', summary: 'operations', statuses: 'work', program: 'program', team: 'tour-team', tasks: 'tour-tasks', actions: 'tour-actions', finance: 'finance' };
  var requestedTourSection = initialParams.get('tourSection');
  var requestedLeadsView = initialParams.get('view') === 'leads';
  var summarySectionMap = { operations: 'operations', tourists: 'tourists', documents: 'documents', statuses: 'work' };
  var requestedSummarySection = summarySectionMap[initialParams.get('summarySection')];
  var requestedLegacyView = initialParams.get('view') === 'statuses' ? 'work' : initialParams.get('view');
  var initialView = requestedSummarySection && (!requestedTourSection || requestedTourSection === 'summary') ? requestedSummarySection :
    (tourSectionMap[requestedTourSection] || (['operations', 'tourists', 'documents', 'work', 'program', 'tour-info', 'tour-team', 'tour-tasks', 'tour-actions', 'finance', 'chats'].indexOf(requestedLegacyView) !== -1 ? requestedLegacyView : 'tour-info'));
  var initialStage = ['arrival', 'hotel', 'departure'].indexOf(initialParams.get('operation')) !== -1 ? initialParams.get('operation') : 'arrival';
  var rawRequestedRole = initialParams.get('role');
  var requestedRole = rawRequestedRole === 'guide' ? 'viewer' : rawRequestedRole;
  // Keep the authoring demo default, but fail closed for every explicit unknown role.
  var initialRole = !rawRequestedRole ? 'manager' : (['admin', 'manager', 'escort', 'viewer'].indexOf(requestedRole) !== -1 ? requestedRole : 'forbidden');
  var roleAwareInitialView = initialView;
  if (!requestedTourSection && (!requestedLegacyView || requestedLeadsView || (requestedLegacyView === 'chats' && !initialParams.get('chat'))) && (initialRole === 'viewer' || initialRole === 'escort')) roleAwareInitialView = 'operations';
  var initialOffline = initialParams.get('offline') === '1';
  var initialTourist = tourists.find(function (tourist) { return tourist.id === initialTouristId; });
  var initialSelectedTourId = initialParams.get('tourId') || (initialTourist && initialTourist.tourId) || 'china';
  var requestedReturnLead = initialParams.get('returnLead');
  var initialReturnLead = requestedReturnLead && (initialRole === 'admin' || (initialRole === 'manager' && managerLeadIds.indexOf(requestedReturnLead) !== -1)) ? requestedReturnLead : null;
  var requestedReturnTab = initialParams.get('returnTab');
  var initialReturnTab = ['details', 'chat', 'documents', 'tasks'].indexOf(requestedReturnTab) !== -1 ? requestedReturnTab : 'details';
  var state = {
    view: roleAwareInitialView,
    summaryMode: 'groups',
    touristListMode: initialParams.get('listMode') === 'groups' ? 'groups' : 'list',
    touristQuery: (initialRole === 'admin' || initialRole === 'manager') ? (initialParams.get('query') || '') : '',
    touristFilters: { needsData: false, documentIssue: false, limitedRoute: false, debt: false, type: 'all', group: 'all', status: 'all' },
    guideTouristFilter: ['attention', 'completed'].indexOf(initialParams.get('guideTouristFilter')) !== -1 ? initialParams.get('guideTouristFilter') : 'all',
    documentFilter: ['attention', 'expiring', 'ready'].indexOf(initialParams.get('documentFilter')) !== -1 ? initialParams.get('documentFilter') : 'attention',
    cityIndex: initialCityIndex >= 0 ? initialCityIndex : 0,
    stage: initialStage,
    overlay: initialTouristId ? { kind: 'tourist-detail', touristId: initialTouristId, expanded: new Set(['personal', 'citizenship', 'domestic', 'foreign', 'settings', 'tour-context', 'logistics'].indexOf(initialParams.get('expand')) !== -1 ? [initialParams.get('expand')] : []), detailTab: initialParams.get('touristSection') === 'tour' ? 'tour' : 'profile' } : (initialParams.get('editTour') === '1' ? { kind: 'tour-form', tourId: initialSelectedTourId } : null),
    draft: null,
    toast: null,
    toastKind: 'success',
    scopeLead: (initialRole === 'viewer' || initialRole === 'escort' || (initialRole === 'manager' && managerLeadIds.indexOf(initialParams.get('lead')) === -1)) ? null : (initialParams.get('lead') || null),
    returnLead: initialReturnLead,
    returnTab: initialReturnTab,
    returnContext: null,
    pendingScrollTop: null,
    tourFilter: ['all', 'active', 'draft', 'archive'].indexOf(initialParams.get('tourFilter')) !== -1 ? initialParams.get('tourFilter') : 'active',
    tourQuery: '',
    directoryQuery: '',
    selectedTourId: initialSelectedTourId,
    financeRouteCityId: initialRouteCityId || null,
    guideRouteCityId: initialRouteCityId || null,
    pointPickerReturn: null,
    role: initialRole,
    offline: initialOffline,
    uiPreview: 'ready',
    saveErrorSnapshot: null
  };
  if (!state.overlay && initialParams.get('showTours') === '1') state.overlay = { kind: 'tours' };

  normalizeAllTourGroupRepresentatives();
  Object.keys(tourGroupSettings).forEach(ensureDefaultSharedHotel);

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
    state.touristFilters = Object.assign({ needsData: false, documentIssue: false, limitedRoute: false, debt: false, type: 'all', group: 'all', status: 'all' }, context.filters || {});
    state.documentFilter = context.documentFilter || 'attention';
    state.summaryMode = context.summaryMode || 'groups';
    state.pendingScrollTop = Number(context.scrollTop || 0);
  }

  var leadsOriginContext = null;
  var tourDebugApi = null;

  function setLeadsStylesEnabled(enabled) {
    var stylesheet = document.getElementById && document.getElementById('mobile-leads-workspace-styles');
    if (stylesheet) stylesheet.disabled = !enabled;
  }

  function syncPrototypeUrl(view, extra) {
    if (!window.history || typeof window.history.replaceState !== 'function') return;
    var params = new URLSearchParams();
    params.set('tourId', state.selectedTourId);
    params.set('role', state.role);
    params.set('offline', state.offline ? '1' : '0');
    if (view === 'leads') params.set('view', 'leads');
    else if (view === 'finance' || view === 'tourists' || view === 'chats') params.set('view', view);
    else if (view === 'operations') params.set('tourSection', 'summary');
    if (view !== 'leads' && currentCity()) params.set('routeCityId', currentCity().id);
    if (view === 'operations') params.set('operation', state.stage);
    Object.keys(extra || {}).forEach(function (key) {
      if (extra[key] != null && extra[key] !== '') params.set(key, extra[key]);
    });
    window.history.replaceState({}, '', 'tour-operations.html?' + params.toString());
  }

  function activateLeadsWorkspace(options) {
    options = options || {};
    if (state.role !== 'admin' && state.role !== 'manager') {
      showToast('Раздел «Лиды» недоступен для этой роли', 'error');
      return;
    }
    if (!leadsOriginContext) leadsOriginContext = captureTourContext();
    state.overlay = null;
    setLeadsStylesEnabled(true);
    syncPrototypeUrl('leads', options.leadId ? { lead: options.leadId, tab: options.detailTab || 'details' } : {});
    if (window.UNIQUE_MOBILE_LEADS && typeof window.UNIQUE_MOBILE_LEADS.activate === 'function') {
      window.UNIQUE_MOBILE_LEADS.activate({
        role: state.role,
        offline: state.offline,
        leadId: options.leadId || null,
        detailTab: options.detailTab || 'details',
        newLead: Boolean(options.newLead)
      });
    } else {
      window.UNIQUE_TOUR_HOST.pendingLeads = options;
    }
  }

  function leaveLeadsWorkspace(destination) {
    if (window.UNIQUE_MOBILE_LEADS) window.UNIQUE_MOBILE_LEADS.deactivate();
    setLeadsStylesEnabled(false);
    if (leadsOriginContext) restoreTourContext(leadsOriginContext);
    else state.view = 'tour-info';
    leadsOriginContext = null;
    state.overlay = null;
    if (destination === 'tourists') state.view = 'tourists';
    if (destination === 'finance' && canViewFinance()) state.view = 'finance';
    if (destination === 'chats' && (state.role === 'admin' || state.role === 'manager')) state.view = 'chats';
    if ((state.role === 'viewer' || state.role === 'escort') && destination === 'tours') state.view = 'operations';
    if (tourDebugApi) window.__prototypeDebug = tourDebugApi;
    syncPrototypeUrl(state.view);
    render();
  }

  window.UNIQUE_TOUR_HOST = {
    pendingLeads: requestedLeadsView ? {
      leadId: initialParams.get('lead'),
      detailTab: initialParams.get('tab') || 'details',
      newLead: initialParams.get('newLead') === '1'
    } : null,
    activatePendingLeads: function () {
      if (!this.pendingLeads) return;
      var pending = this.pendingLeads;
      this.pendingLeads = null;
      activateLeadsWorkspace(pending);
    },
    openLeads: function (options) {
      activateLeadsWorkspace(options || {});
    },
    navigateFromLeads: function (destination) {
      leaveLeadsWorkspace(destination || 'tours');
    },
    updateSession: function (session) {
      if (session && roleLabels[session.role]) state.role = session.role;
      if (session && typeof session.offline === 'boolean') state.offline = session.offline;
    },
    openSummaryFromLeads: function (context) {
      if (!context || !canViewTourId(context.tourId)) return;
      if (window.UNIQUE_MOBILE_LEADS) window.UNIQUE_MOBILE_LEADS.deactivate();
      setLeadsStylesEnabled(false);
      leadsOriginContext = null;
      state.selectedTourId = context.tourId;
      state.view = 'operations';
      state.scopeLead = context.leadId || null;
      state.returnLead = context.leadId || null;
      state.returnTab = context.detailTab || 'details';
      state.overlay = null;
      if (tourDebugApi) window.__prototypeDebug = tourDebugApi;
      syncPrototypeUrl('operations', { lead: state.scopeLead });
      render();
    },
    openTouristFromLeads: function (context) {
      var tourist = context && touristById(context.touristId);
      if (!tourist || !canViewTourId(context.tourId) || tourist.tourId !== context.tourId) return;
      if (window.UNIQUE_MOBILE_LEADS) window.UNIQUE_MOBILE_LEADS.deactivate();
      setLeadsStylesEnabled(false);
      leadsOriginContext = null;
      state.selectedTourId = context.tourId;
      state.view = 'tourists';
      state.returnLead = context.leadId || null;
      state.returnTab = context.detailTab || 'details';
      state.overlay = { kind: 'tourist-detail', touristId: context.touristId, expanded: new Set(), detailTab: 'profile' };
      if (tourDebugApi) window.__prototypeDebug = tourDebugApi;
      syncPrototypeUrl('tourists', { tourist: context.touristId, returnLead: state.returnLead });
      render();
    }
  };

  function overlaySnapshot(overlay) {
    if (!overlay) return null;
    var snapshot = {};
    Object.keys(overlay).forEach(function (key) {
      var value = overlay[key];
      if (value instanceof Set) snapshot[key] = { __set: Array.from(value) };
      else snapshot[key] = value == null ? value : clone(value);
    });
    return snapshot;
  }

  function restoreOverlaySnapshot(snapshot) {
    if (!snapshot) return null;
    var overlay = {};
    Object.keys(snapshot).forEach(function (key) {
      var value = snapshot[key];
      overlay[key] = value && Array.isArray(value.__set) ? new Set(value.__set) : (value == null ? value : clone(value));
    });
    return overlay;
  }

  function captureSaveErrorSnapshot(sourceOverlay) {
    var savedOverlay = sourceOverlay && sourceOverlay.kind !== 'ui-states' ? sourceOverlay : null;
    var savedDraft = state.draft ? clone(state.draft) : null;
    if (!savedOverlay || ['form', 'operation-select', 'conflict'].indexOf(savedOverlay.kind) === -1) {
      var candidates = scopedTourists(false).filter(leadConfirmed).slice(0, 2);
      var candidateIds = candidates.map(function (tourist) { return tourist.id; });
      var sourceId = candidateIds[0] || null;
      var operationGroup = sourceId ? operationGroupFor(state.stage, sourceId) : null;
      savedDraft = sourceId ? cleanRecord(effectiveRecord(state.stage, sourceId), state.stage) : blankRecord(state.stage);
      savedOverlay = {
        kind: 'form',
        stage: state.stage,
        members: candidateIds,
        editing: Boolean(operationGroup),
        groupId: operationGroup ? operationGroup.id : null,
        sourceId: operationGroup ? operationGroup.sourceId : sourceId,
        editMode: operationGroup ? 'shared' : 'create',
        routeCityId: currentCity().id,
        tourId: state.selectedTourId,
        dirtyFields: new Set(Object.keys(savedDraft).filter(function (key) { return Boolean(savedDraft[key]); }))
      };
    }
    state.saveErrorSnapshot = {
      overlay: overlaySnapshot(savedOverlay),
      draft: clone(savedDraft || {}),
      view: state.view,
      cityIndex: state.cityIndex,
      stage: state.stage,
      scopeLead: state.scopeLead
    };
  }

  function restoreSaveErrorSnapshot() {
    var snapshot = state.saveErrorSnapshot;
    if (!snapshot) return false;
    state.view = snapshot.view;
    state.cityIndex = snapshot.cityIndex;
    state.stage = snapshot.stage;
    state.scopeLead = snapshot.scopeLead;
    state.draft = clone(snapshot.draft || {});
    state.overlay = restoreOverlaySnapshot(snapshot.overlay);
    state.uiPreview = 'ready';
    return Boolean(state.overlay);
  }

  function mobileLeadsHref(leadId, tab) {
    var params = new URLSearchParams();
    var safeLeadId = canOpenSourceLead(leadId) ? leadId : null;
    var safeTab = ['details', 'chat', 'documents', 'tasks'].indexOf(tab) !== -1 ? tab : null;
    if (safeLeadId) params.set('lead', safeLeadId);
    if (safeLeadId && safeTab) params.set('tab', safeTab);
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
      tasks: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/>',
      finance: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.7-.7-1.8-1.1-3.1-1.1-1.8 0-3 .8-3 2 0 3.2 6.2 1.2 6.2 4.4 0 1.2-1.2 2.1-3.2 2.1-1.5 0-2.8-.5-3.7-1.4M12 5.5v13"/>',
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
    if (!canViewSelectedTour()) return false;
    if (state.role !== 'viewer') return true;
    return viewerTourIds.indexOf(state.selectedTourId) !== -1 && viewerCityIds.indexOf(routeCityId) !== -1;
  }

  function visibleRouteCities() {
    return cities.filter(function (city) { return canViewRouteCity(city.id); });
  }

  function allRouteCitiesForTour(tour) {
    if (!tour) return [];
    if (tourHasOperationalModel(tour.id)) return cities;
    var seed = sharedMock.tours.find(function (candidate) { return candidate.id === tour.id; });
    if (seed && Array.isArray(seed.route) && seed.route.length) {
      return seed.route.map(function (routeCity, index) {
        return {
          id: routeCity.id,
          catalogCityId: routeCity.catalogCityId || 'catalog-' + tour.id + '-' + index,
          name: routeCity.name,
          dates: routeCity.dates || '',
          routeIndex: index
        };
      });
    }
    return (tour.cities || []).map(function (name, index) {
      return { id: 'route-' + tour.id + '-' + index, catalogCityId: 'catalog-' + tour.id + '-' + index, name: name, dates: '', routeIndex: index };
    });
  }

  function guideOperationalMock() {
    return guideOperationalMocks[state.selectedTourId] || null;
  }

  function usesGuideOperationalMock() {
    return Boolean(guideOperationalMock()) && (state.role === 'viewer' || state.role === 'escort') && canViewSelectedTour();
  }

  function guideOperationalRouteCities() {
    var mock = guideOperationalMock();
    return allRouteCitiesForTour(selectedTour()).map(function (city) {
      var routeMock = mock && mock.route[city.id];
      return Object.assign({}, city, { dates: routeMock && routeMock.dates || city.dates || selectedTour().dates });
    });
  }

  function currentGuideOperationalCity() {
    var route = guideOperationalRouteCities();
    return route.find(function (city) { return city.id === state.guideRouteCityId; }) || route[0] || null;
  }

  function normalizeGuideOperationalCity() {
    if (!usesGuideOperationalMock()) return;
    var city = currentGuideOperationalCity();
    state.guideRouteCityId = city ? city.id : null;
  }

  function guideOperationStatusKey(cityId, stage, operationId) {
    return [state.selectedTourId, cityId, stage, operationId].join('|');
  }

  function guideOperationStatus(cityId, stage, operationId) {
    var initial = { arrival: 'expected', hotel: 'pending', departure: 'pending' }[stage];
    return guideOperationalStatuses[guideOperationStatusKey(cityId, stage, operationId)] || initial;
  }

  function routeCitiesForRole(tour) {
    if (!tour) return [];
    if (!tourHasOperationalModel(tour.id)) return allRouteCitiesForTour(tour);
    if (state.role !== 'viewer' || tour.id !== state.selectedTourId) return allRouteCitiesForTour(tour);
    return visibleRouteCities();
  }

  function tourRoutePresentation(tour) {
    if (!tour || state.role !== 'viewer' || !tourHasOperationalModel(tour.id)) {
      return { cityNames: (tour && tour.cities) || [], dates: tour && tour.dates };
    }
    var assignedCities = cities.filter(function (city) {
      return viewerTourIds.indexOf(tour.id) !== -1 && viewerCityIds.indexOf(city.id) !== -1;
    });
    return {
      cityNames: assignedCities.map(cityLabel),
      dates: assignedCities.map(function (city) { return city.dates; }).join(' · ')
    };
  }

  function linkedLeadIdsForTour(tourId) {
    return Array.from(new Set(tourists.filter(function (tourist) {
      return tourist.tourId === tourId && tourist.leadId;
    }).map(function (tourist) { return tourist.leadId; })));
  }

  function syncLinkedLeadArchive(tourId, archived) {
    var linkedIds = linkedLeadIdsForTour(tourId);
    linkedIds.forEach(function (leadId) { leadArchiveMocks[leadId] = Boolean(archived); });
    try {
      if (!window.localStorage) return;
      var raw = window.localStorage.getItem(LEAD_STORAGE_KEY);
      var savedLeads = raw == null ? [] : JSON.parse(raw);
      if (!Array.isArray(savedLeads)) savedLeads = [];
      var byId = {};
      savedLeads.forEach(function (lead) { if (lead && lead.id) byId[lead.id] = lead; });
      linkedIds.forEach(function (leadId) {
        var lead = byId[leadId] || { id: leadId, eventId: tourId, manager: 'Елена Воронова', assignedUserId: 'manager-elena' };
        lead.eventId = lead.eventId || tourId;
        lead.archived = Boolean(archived);
        byId[leadId] = lead;
      });
      window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(Object.keys(byId).map(function (id) { return byId[id]; })));
    } catch (error) {
      console.warn('Linked lead archive state remains in memory', error);
    }
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

  function selectedTourName() {
    return selectedTour().name;
  }

  function formatMoney(value, currency) {
    var symbols = { RUB: '₽', USD: '$', EUR: '€', CNY: '¥' };
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Number(value || 0)) + ' ' + (symbols[currency] || currency || '₽');
  }

  var financeOverrides = {};
  var financeActionCounter = 0;
  var financeActionRegistry = {};

  function isMoroccoTour(tour) {
    return /марокко|morocco/i.test(((tour && tour.country) || '') + ' ' + ((tour && tour.name) || ''));
  }

  function canViewFinance() {
    if (!canViewSelectedTour()) return false;
    if (state.role === 'admin' || state.role === 'manager') return true;
    if (isMoroccoTour(selectedTour()) && (state.role === 'viewer' || state.role === 'escort')) return true;
    if (state.role !== 'viewer') return false;
    var financeCityId = selectedTour().financeGuideCityId;
    return Boolean(financeCityId && viewerTourIds.indexOf(state.selectedTourId) !== -1 && viewerCityIds.indexOf(financeCityId) !== -1);
  }

  function financeRouteCities() {
    return routeCitiesForRole(selectedTour());
  }

  function currentFinanceCity() {
    var route = financeRouteCities();
    var selected = route.find(function (city) { return city.id === state.financeRouteCityId; });
    if (!selected && tourHasOperationalModel(state.selectedTourId)) {
      selected = route.find(function (city) { return currentCity() && city.id === currentCity().id; });
    }
    return selected || route[0] || null;
  }

  function normalizeFinanceRouteCity() {
    var city = currentFinanceCity();
    state.financeRouteCityId = city ? city.id : null;
    if (city && tourHasOperationalModel(state.selectedTourId)) {
      var cityIndex = cities.findIndex(function (candidate) { return candidate.id === city.id; });
      if (cityIndex >= 0) state.cityIndex = cityIndex;
    }
    return city;
  }

  function financeCityLabel(city) {
    if (!city) return 'Маршрут не указан';
    if (tourHasOperationalModel(state.selectedTourId)) return cityLabel(city);
    return city.name;
  }

  function financeLeadData(leadId) {
    var base = Object.assign({}, sharedMock.financeByLeadId[leadId] || {}, financeOverrides[leadId] || {});
    try {
      var stored = JSON.parse(window.localStorage && window.localStorage.getItem(LEAD_STORAGE_KEY) || '[]');
      if (Array.isArray(stored)) {
        var lead = stored.find(function (item) { return item && item.id === leadId; });
        if (lead) base = Object.assign(base, lead);
      }
    } catch (error) {
      console.warn('Finance lead storage is unavailable', error);
    }
    return base;
  }

  function financeParticipantPool() {
    var members = currentTourists();
    var activeCity = currentFinanceCity();
    if (!activeCity) return [];
    members = members.filter(function (tourist) { return tourist.route.indexOf(activeCity.id) !== -1; });
    return members;
  }

  function buildFinanceRows() {
    var grouped = {};
    financeParticipantPool().forEach(function (tourist) {
      var key = tourist.leadId || tourist.contactLeadId || tourist.groupId || tourist.dealId || tourist.id;
      if (!grouped[key]) grouped[key] = { id: key, leadId: tourist.leadId || null, members: [], representative: tourist };
      grouped[key].members.push(tourist);
      var currentRank = grouped[key].representative.isPrimary ? 2 : (grouped[key].representative.groupRepresentative ? 1 : 0);
      var nextRank = tourist.isPrimary ? 2 : (tourist.groupRepresentative ? 1 : 0);
      if (nextRank > currentRank) grouped[key].representative = tourist;
    });
    return Object.keys(grouped).map(function (key) {
      var group = grouped[key];
      var lead = group.leadId ? financeLeadData(group.leadId) : {};
      var amount = Number.parseFloat(String(lead.remainingPayment == null ? '' : lead.remainingPayment));
      var currency = lead.remainingPaymentCurrency || 'RUB';
      var symbols = { RUB: '₽', USD: '$', EUR: '€', CNY: '¥' };
      var collected = Boolean(lead.remainingPaymentCollected);
      var balance = !collected && Number.isFinite(amount) && amount > 0 ? { amount: amount, formatted: new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(amount), symbol: symbols[currency] || currency, currency: currency } : null;
      return Object.assign(group, { balance: balance, collected: collected, payerId: group.representative.id });
    });
  }

  function financeRowForTourist(tourist) {
    return buildFinanceRows().find(function (row) { return row.members.some(function (member) { return member.id === tourist.id; }); }) || null;
  }

  function paymentPresentation(tourist) {
    var row = financeRowForTourist(tourist);
    if (!row) return { kind: 'unknown', list: 'Нет данных', detail: 'Нет данных', color: '#8a929c' };
    if (tourist.id !== row.payerId) return { kind: 'included', list: 'Оплатит ' + row.representative.name, detail: 'Оплатит ' + row.representative.name, color: '#5a626c' };
    if (row.balance) return { kind: 'due', list: row.balance.formatted + ' ' + row.balance.symbol, detail: row.balance.formatted + ' ' + row.balance.symbol, color: '#c98a1e' };
    return { kind: 'paid', list: 'Оплачено', detail: 'Полностью оплачено', color: '#1f9d5b' };
  }

  function saveFinanceCollection(leadId, collected) {
    financeOverrides[leadId] = Object.assign({}, financeOverrides[leadId] || {}, { remainingPaymentCollected: Boolean(collected) });
    try {
      var stored = JSON.parse(window.localStorage && window.localStorage.getItem(LEAD_STORAGE_KEY) || '[]');
      if (!Array.isArray(stored)) stored = [];
      var index = stored.findIndex(function (lead) { return lead && lead.id === leadId; });
      var seed = sharedMock.supplementalLeads.find(function (lead) { return lead.id === leadId; }) || { id: leadId };
      var next = Object.assign({}, index >= 0 ? stored[index] : seed, financeLeadData(leadId), { id: leadId, remainingPaymentCollected: Boolean(collected) });
      if (index >= 0) stored[index] = next; else stored.push(next);
      if (window.localStorage) window.localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      console.warn('Finance collection remains in memory', error);
    }
  }

  function canViewTourId(tourId) {
    if (state.role === 'admin') return true;
    if (state.role === 'manager') return managerTourIds.indexOf(tourId) !== -1;
    if (state.role === 'escort') return escortTourIds.indexOf(tourId) !== -1;
    return state.role === 'viewer' && viewerTourIds.indexOf(tourId) !== -1;
  }

  function canViewSelectedTour() {
    return canViewTourId(state.selectedTourId);
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

  function normalizeTourGroupRepresentative(groupId, preferredId) {
    if (!groupId) return null;
    var members = tourists.filter(function (tourist) { return tourist.groupId === groupId; });
    if (!members.length) return null;
    var representative = preferredId && members.find(function (tourist) { return tourist.id === preferredId; });
    representative = representative || members.find(function (tourist) { return tourist.groupRepresentative; }) || members[0];
    members.forEach(function (tourist) { tourist.groupRepresentative = tourist.id === representative.id; });
    return representative.id;
  }

  function normalizeAllTourGroupRepresentatives() {
    Array.from(new Set(tourists.map(function (tourist) { return tourist.groupId; }).filter(Boolean))).forEach(function (groupId) {
      normalizeTourGroupRepresentative(groupId);
    });
  }

  function bookedCountForTour(tour) {
    if (!tour) return 0;
    var canonicalCount = tourists.filter(function (tourist) { return tourist.tourId === tour.id; }).length;
    return canonicalCount || Number(tour.bookedCount != null ? tour.bookedCount : tour.tourists) || 0;
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
    var groups = operationGroups[cityId] && operationGroups[cityId][stage];
    if (!groups) return null;
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
    return sourceMatchesTuple ? ownRecordAt(cityId, stage, sourceId) : ownRecordAt(cityId, stage, touristId);
  }

  function touristById(id) {
    return tourists.find(function (tourist) { return tourist.id === id; });
  }

  function canViewTouristForSelectedTour(tourist) {
    return Boolean(tourist) && canViewSelectedTour() && tourist.tourId === state.selectedTourId;
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
    var archivedSelection = selectedPoint && !selectedPoint.active;

    // Historical/manual values are never silently destroyed when transport changes.
    // An active incompatible directory point can be safely cleared and selected again.
    if (selectedPoint && !compatible && !archivedSelection) {
      state.draft.pointId = '';
      state.draft.point = '';
      state.draft.pointManual = false;
    }

    var options = activePointsFor(currentCity(), state.draft.transport);
    if (!state.draft.point && !state.draft.pointId && options.length === 1) {
      state.draft.pointId = options[0].id;
      state.draft.point = pointDisplay(options[0]);
      state.draft.pointManual = false;
      state.draft.pointAutofilled = true;
    } else if (!type && !archivedSelection) {
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
    return { plane: 'Самолёт', train: 'Поезд', bus: 'Автобус' }[value] || 'Транспорт';
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
    var viewerTour = viewerTourIds.indexOf(state.selectedTourId) !== -1;
    var viewerCity = viewerCityIds.indexOf(currentCity().id) !== -1;
    var operationalModel = tourHasOperationalModel(state.selectedTourId);
    return {
      canEditProfile: role === 'admin' || (role === 'manager' && managerTour),
      canEditLogistics: operationalModel && (role === 'admin' || (role === 'manager' && managerTour)),
      canGroup: operationalModel && (role === 'admin' || (role === 'manager' && managerTour)),
      canManageDocuments: role === 'admin' || (role === 'manager' && managerTour),
      canDelete: role === 'admin',
      canEditStatuses: operationalModel && (role === 'admin' || (role === 'manager' && managerTour) || (role === 'escort' && escortTour) || (role === 'viewer' && viewerTour && viewerCity)),
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
    if (!canViewTouristForSelectedTour(tourist) || !capabilities().canEditProfile) return false;
    return state.role === 'admin' || managerLeadIds.indexOf(tourist.leadId) !== -1;
  }

  function canSeePrivateFor(tourist) {
    if (!canViewTouristForSelectedTour(tourist)) return false;
    return state.role === 'admin' || (state.role === 'manager' && managerTourIds.indexOf(tourist.tourId) !== -1 && managerLeadIds.indexOf(tourist.leadId) !== -1);
  }

  function canSeeSourceLeadFor(tourist) {
    if (!canViewTouristForSelectedTour(tourist)) return false;
    return state.role === 'admin' || (state.role === 'manager' && managerLeadIds.indexOf(tourist.leadId) !== -1);
  }

  function hasRestrictedTouristPrivacy(tourist) {
    return hasLimitedTouristPrivacy() || (state.role === 'manager' && !canSeeSourceLeadFor(tourist));
  }

  function canViewDocumentsFor(tourist) {
    if (!canViewTouristForSelectedTour(tourist)) return false;
    return state.role === 'admin' || state.role === 'viewer' || state.role === 'escort' ||
      (state.role === 'manager' && managerLeadIds.indexOf(tourist.leadId) !== -1);
  }

  function canViewContactFor(tourist) {
    if (!canViewTouristForSelectedTour(tourist)) return false;
    return state.role === 'admin' || state.role === 'viewer' || state.role === 'escort' ||
      (state.role === 'manager' && managerLeadIds.indexOf(tourist.leadId) !== -1);
  }

  function canOpenSourceLead(leadId) {
    if (!leadId || !tourists.some(function (tourist) { return tourist.leadId === leadId; })) return false;
    return state.role === 'admin' || (state.role === 'manager' && managerLeadIds.indexOf(leadId) !== -1);
  }

  function hasLimitedTouristPrivacy() {
    return state.role === 'viewer' || state.role === 'escort';
  }

  function canManageDocumentsFor(tourist) {
    if (!canViewTouristForSelectedTour(tourist) || !capabilities().canManageDocuments) return false;
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
    return state.role === 'viewer' && viewerTourIds.indexOf(tourist.tourId) !== -1 && viewerCityIds.indexOf(routeCityId) !== -1;
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
    if (tourist.isPrimary) required = required.concat([
      ['middleName', 'отчество'],
      ['email', 'email'],
      ['phone', 'телефон']
    ]);
    var missing = required.filter(function (field) { return !String(tourist[field[0]] || '').trim(); }).map(function (field) { return field[1]; });
    return {
      ready: missing.length === 0,
      missing: missing,
      label: missing.length ? 'Не заполнено: ' + missing.join(', ') : 'Личные данные заполнены'
    };
  }

  function domesticPassportReadiness(tourist) {
    if (tourist.citizenship !== 'Россия') return { ready: true, category: 'not-required', label: 'Не требуется', issue: '' };
    var hasAny = Boolean(tourist.domesticPassport || tourist.domesticIssuedBy || tourist.registrationAddress);
    if (!hasAny && !tourist.isPrimary) return { ready: true, category: 'not-required', label: 'Не требуется', issue: '' };
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
    var hasAny = Boolean(tourist.latinName || tourist.passport || tourist.passportExpiry || (tourist.scans && tourist.scans.length));
    if (!hasAny) return {
      ready: false,
      category: 'missing',
      missing: ['ФИО латиницей', 'номер загранпаспорта', 'срок действия', 'скан'],
      expiring: false,
      issue: 'Не заполнено: ФИО латиницей, номер загранпаспорта, срок действия, скан',
      label: 'Нужно дозаполнить'
    };
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
    var chatUnread = window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.unreadForTour === 'function' ? window.UNIQUE_MOBILE_CHATS.unreadForTour(state.selectedTourId) : 0;
    var chatButton = state.role === 'forbidden' ? '' : '<button type="button" class="icon-button header-chat-button" data-action="open-tour-chat" aria-label="Открыть чат тура">' + icon('chat') + (chatUnread ? '<span class="nav-badge">' + h(chatUnread > 99 ? '99+' : chatUnread) + '</span>' : '') + '</button>';
    return '<div class="app-top"><div class="user-row"><span class="user-label">UNIQUE · мобильная CRM</span><button type="button" class="role-badge" data-action="role-menu">' + h(roleLabels[state.role]) + '</button></div>' +
      '<div class="tour-row"><span class="tour-mark"></span><button type="button" class="tour-title tour-select" data-action="open-tours"><strong>' + h(title) + '</strong><span>' + h(subtitle) + '</span></button>' +
      chatButton + '<button type="button" class="icon-button" data-action="tour-menu" aria-label="Настройки тура">' + icon('more') + '</button></div></div>';
  }

  function workspaceTabs() {
    var tabs = [
      { id: 'tour-info', section: 'overview', label: 'Обзор' },
      { id: 'operations', section: 'summary', label: 'Сводная' },
      { id: 'program', section: 'program', label: 'Программа' },
      { id: 'tour-team', section: 'team', label: 'Команда' },
      { id: 'tour-tasks', section: 'tasks', label: 'Задачи' },
      { id: 'tour-actions', section: 'actions', label: 'Действия' }
    ];
    return '<div class="workspace-tabs">' + tabs.map(function (tab) {
      var summaryView = ['operations', 'tourists', 'documents', 'work'].indexOf(state.view) !== -1;
      var active = tab.id === 'operations' ? summaryView : state.view === tab.id;
      return '<button type="button" class="' + (active ? 'active' : '') + '" data-action="workspace" data-view="' + tab.id + '" data-tour-section="' + tab.section + '">' + tab.label + '</button>';
    }).join('') + '</div>';
  }

  function summaryTabs() {
    var tabs = [
      { id: 'operations', label: 'Операции' },
      { id: 'tourists', label: 'Туристы' },
      { id: 'documents', label: 'Документы' },
      { id: 'work', label: 'Статусы' }
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

  function financeCityPickerButton() {
    var city = normalizeFinanceRouteCity();
    if (!city) return '<div class="finance-route-note">Позиции маршрута не указаны</div>';
    var route = financeRouteCities();
    var participants = financeParticipantPool();
    var applications = buildFinanceRows().length;
    var routeIndex = Math.max(0, route.findIndex(function (candidate) { return candidate.id === city.id; }));
    return '<div class="city-picker-wrap"><button type="button" class="city-picker-trigger" data-action="open-finance-city-picker"><span class="city-picker-index">' +
      (routeIndex + 1) + '</span><span><strong>' + h(financeCityLabel(city)) + '</strong><small>' + touristCount(participants.length) + ' · ' + applications + ' ' +
      (applications === 1 ? 'заявка' : (applications >= 2 && applications <= 4 ? 'заявки' : 'заявок')) + '</small></span><b>›</b></button></div>';
  }

  function stageSwitch() {
    if (state.role === 'viewer' || state.role === 'escort') {
      var guideStages = [
        { id: 'arrival', label: 'Встреча' },
        { id: 'hotel', label: 'Отель' },
        { id: 'departure', label: 'Отъезд' },
        { id: 'program', label: 'Программа' }
      ];
      return '<div class="stage-wrap guide-stage-wrap"><div class="segmented guide-stage-switch" role="tablist" aria-label="Задачи гида">' +
        guideStages.map(function (item) {
          var active = item.id === 'program' ? state.view === 'program' : state.view === 'operations' && state.stage === item.id;
          return '<button type="button" role="tab" aria-selected="' + active + '" class="' + (active ? 'active' : '') +
            '" data-action="guide-stage" data-stage="' + item.id + '">' + item.label + '</button>';
        }).join('') + '</div></div>';
    }
    return '<div class="stage-wrap"><div class="segmented" role="tablist" aria-label="Логистика по городу">' +
      Object.keys(stageMeta).map(function (stage) {
        return '<button type="button" role="tab" aria-selected="' + (state.stage === stage) + '" class="' + (state.stage === stage ? 'active' : '') +
          '" data-action="stage" data-stage="' + stage + '">' + stageMeta[stage].tab + '</button>';
      }).join('') + '</div></div>';
  }

  function guideOperationalCityButton() {
    var city = currentGuideOperationalCity();
    var route = guideOperationalRouteCities();
    if (!city) return '';
    var routePosition = route.findIndex(function (candidate) { return candidate.id === city.id; });
    return '<div class="city-picker-wrap"><button type="button" class="city-picker-trigger" data-action="open-guide-city-picker"><span class="city-picker-index">' + (routePosition + 1) + '</span><span><strong>' + h(city.name) + '</strong><small>' + h(city.dates) + ' · ' + route.length + ' позиции маршрута</small></span><b>›</b></button></div>';
  }

  function guideOperationalCityMembers(city) {
    if (!city) return [];
    return currentTourists().filter(function (tourist) { return tourist.route.indexOf(city.id) !== -1; });
  }

  function guideOperationalMembers(operation, city) {
    var members = currentTourists();
    var routeCity = city || currentGuideOperationalCity();
    return (operation.memberIndexes || []).map(function (index) { return members[index]; }).filter(function (tourist) {
      return Boolean(tourist) && Boolean(routeCity) && tourist.route.indexOf(routeCity.id) !== -1;
    });
  }

  function guideTouristOperations(tourist, city, stage) {
    var routeMock = city && guideOperationalMock() && guideOperationalMock().route[city.id];
    return (routeMock && routeMock[stage] || []).filter(function (operation) {
      return guideOperationalMembers(operation, city).some(function (member) { return member.id === tourist.id; });
    });
  }

  function guideTouristStageState(tourist, city, stage) {
    var operations = guideTouristOperations(tourist, city, stage);
    var completedStatus = { arrival: 'arrived', hotel: 'checked_in', departure: 'departed' }[stage];
    var initialStatus = { arrival: 'expected', hotel: 'pending', departure: 'pending' }[stage];
    var completed = operations.length > 0 && operations.every(function (operation) {
      return guideOperationStatus(city.id, stage, operation.id) === completedStatus;
    });
    return {
      completed: completed,
      label: operations.length ? statusLabels[stage][completed ? completedStatus : initialStatus] : 'Нет задачи',
      summary: operations.length ? operations.map(function (operation) { return operation.title; }).join(' · ') : 'Операция не назначена'
    };
  }

  function guideTouristCompleted(tourist, city) {
    return ['arrival', 'hotel', 'departure'].every(function (stage) { return guideTouristStageState(tourist, city, stage).completed; });
  }

  function guideOperationalTouristRoute(tourist) {
    return guideOperationalRouteCities().filter(function (city) { return tourist.route.indexOf(city.id) !== -1; });
  }

  function canViewGuideOperationalTourist(tourist) {
    var city = currentGuideOperationalCity();
    return !usesGuideOperationalMock() || Boolean(tourist && city && tourist.route.indexOf(city.id) !== -1);
  }

  function guideOperationalCard(operation, index, city) {
    var stage = state.stage;
    var members = guideOperationalMembers(operation, city);
    var status = guideOperationStatus(city.id, stage, operation.id);
    var labels = statusLabels[stage] || {};
    var completedStatus = { arrival: 'arrived', hotel: 'checked_in', departure: 'departed' }[stage];
    var initialStatus = { arrival: 'expected', hotel: 'pending', departure: 'pending' }[stage];
    var completed = status === completedStatus;
    var visibleMembers = members.slice(0, 2).map(function (tourist) {
      return memberRow(tourist, tourist.type);
    }).join('');
    if (members.length > 2) visibleMembers += '<div class="more-members more-members-static">Ещё ' + (members.length - 2) + '</div>';
    var action = state.offline ? '<div class="readonly-card-note">Нет подключения. Статус доступен для чтения.</div>' :
      '<div class="card-actions guide-operation-actions"><button type="button" class="secondary-button" data-action="guide-operation-status" data-city="' + h(city.id) + '" data-stage="' + h(stage) + '" data-operation="' + h(operation.id) + '" data-status="' + h(completed ? initialStatus : completedStatus) + '">' +
      (completed ? 'Вернуть: ' + h(labels[initialStatus]) : 'Отметить: ' + h(labels[completedStatus])) + '</button></div>';
    return '<article class="operation-card guide-operation-card" style="--group-color:' + ['#2f6bd8', '#6f52d9', '#1f8a50', '#a46c13'][index % 4] + '"><div class="card-head"><div class="time-block"><strong>' + h(operation.time) + '</strong><span>' + h(operation.date) + '</span></div>' +
      '<div class="operation-main"><strong>' + icon(stage === 'hotel' ? 'hotel' : 'plane') + h(operation.title) + '</strong><span class="operation-level">' + h(stage === 'arrival' ? 'Встреча' : stageMeta[stage].tab) + ' · задача гида</span><span>' + h(operation.detail) + '</span></div><span class="count-pill">' + touristCount(members.length) + '</span></div>' +
      '<div class="operation-meta"><span>' + h(city.name) + ' · ' + h(city.dates) + '</span><span>Статус: ' + h(labels[status]) + '</span></div><div class="divider"></div>' + visibleMembers + action + '</article>';
  }

  function guideOperationalView() {
    var city = currentGuideOperationalCity();
    var mock = guideOperationalMock();
    var routeMock = city && mock && mock.route[city.id];
    var operations = routeMock && routeMock[state.stage] || [];
    var cards = operations.map(function (operation, index) { return guideOperationalCard(operation, index, city); }).join('');
    if (!cards) cards = '<div class="empty-state">' + icon(state.stage === 'hotel' ? 'hotel' : 'plane') + '<strong>' + h(stageMeta[state.stage].empty) + '</strong><span>Менеджер ещё не добавил записи для этой остановки.</span></div>';
    return statusBar() + topBar(selectedTourName(), selectedTour().dates + ' · ' + touristCount(currentTourists().length)) + roleBanner() + guideOperationalCityButton() + stageSwitch() +
      '<main class="scroll"><div class="operation-toolbar"><div class="section-copy"><strong>' + h(state.stage === 'arrival' ? 'Встреча и прибытие' : stageMeta[state.stage].heading) + '</strong><span>' + h(city ? city.name : 'Маршрут не задан') + ' · ' + operations.length + ' ' + (operations.length === 1 ? 'запись' : 'записи') + '</span></div></div>' + cards + '</main>';
  }

  function guideOperationalProgramView() {
    var mock = guideOperationalMock();
    var days = mock && mock.program || [];
    var cards = days.map(function (day) {
      return '<article class="day-card"><div class="day-date"><strong>' + h(day.day) + '</strong><span>день</span></div><div class="day-copy"><strong>' + h(day.date) + '</strong><span>' + icon('pin') + h(day.city) + '</span><p>' + h(day.description) + '</p></div></article>';
    }).join('');
    return statusBar() + topBar(selectedTourName(), 'Программа · ' + days.length + ' опорных дней') + roleBanner() + stageSwitch() +
      '<main class="scroll"><div class="section-row"><div class="section-copy"><strong>Программа тура</strong><span>Гид видит дату, город и план дня</span></div></div>' + (cards || '<div class="empty-state"><strong>Программа ещё не заполнена</strong></div>') + '</main>';
  }

  function guideTouristStatusGrid(tourist, city) {
    var labels = { arrival: 'Встреча', hotel: 'Отель', departure: 'Отъезд' };
    return '<div class="status-grid guide-tourist-statuses">' + ['arrival', 'hotel', 'departure'].map(function (stage) {
      var status = guideTouristStageState(tourist, city, stage);
      return '<div><span>' + labels[stage] + '</span><strong class="' + (status.completed ? 'completed' : 'attention') + '">' + h(status.label) + '</strong></div>';
    }).join('') + '</div>';
  }

  function guideTouristCard(tourist, city) {
    var contactActions = canViewContactFor(tourist) ? '<div class="card-actions"><button type="button" class="secondary-button" data-action="call-tourist" data-id="' + tourist.id + '">' + icon('phone') + 'Позвонить</button><button type="button" class="secondary-button" data-action="message-tourist" data-id="' + tourist.id + '">' + icon('chat') + 'Написать</button></div>' : '';
    return '<article class="tourist-card guide-tourist-card"><button type="button" class="tourist-card-main" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar dark">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(tourist.type) + ' · ' + h(globalGroupLabel(tourist)) + '</small><em>' + h(city.name) + ' · участник остановки</em></span><b>›</b></button>' + guideTouristStatusGrid(tourist, city) + contactActions + '</article>';
  }

  function filteredGuideOperationalTourists(city) {
    var query = state.touristQuery.trim().toLowerCase();
    return guideOperationalCityMembers(city).filter(function (tourist) {
      var searchable = [tourist.name, tourist.phone, tourist.type, globalGroupLabel(tourist)].join(' ').toLowerCase();
      if (query && searchable.indexOf(query) === -1) return false;
      var completed = guideTouristCompleted(tourist, city);
      if (state.guideTouristFilter === 'completed' && !completed) return false;
      if (state.guideTouristFilter === 'attention' && completed) return false;
      return true;
    });
  }

  function guideOperationalTouristsView() {
    var city = currentGuideOperationalCity();
    var members = guideOperationalCityMembers(city);
    var counts = { all: members.length, attention: 0, completed: 0 };
    members.forEach(function (tourist) {
      if (guideTouristCompleted(tourist, city)) counts.completed += 1;
      else counts.attention += 1;
    });
    var visible = filteredGuideOperationalTourists(city);
    var cards = visible.map(function (tourist) { return guideTouristCard(tourist, city); }).join('');
    if (!cards) cards = '<div class="empty-state">' + icon('search') + '<strong>Туристы не найдены</strong><span>Измените запрос или покажите всех участников остановки.</span><button type="button" class="secondary-button empty-state-action" data-action="guide-tourist-filter" data-filter="all">Показать всех</button></div>';
    var filters = [
      { id: 'all', label: 'Все' },
      { id: 'attention', label: 'Требуют внимания' },
      { id: 'completed', label: 'Завершены' }
    ];
    return statusBar() + topBar(selectedTourName(), 'Туристы · ' + touristCount(members.length) + ' на остановке') + roleBanner() + guideOperationalCityButton() +
      '<main class="scroll"><div class="tourist-search-row guide-tourist-search"><label class="search-box">' + icon('search') + '<input data-tourist-search value="' + h(state.touristQuery) + '" placeholder="ФИО, телефон, тип или группа"></label></div><div class="filter-tabs guide-tourist-filter-tabs" role="tablist" aria-label="Фильтр туристов остановки">' + filters.map(function (filter) {
        return '<button type="button" role="tab" aria-selected="' + (state.guideTouristFilter === filter.id) + '" class="' + (state.guideTouristFilter === filter.id ? 'active' : '') + '" data-action="guide-tourist-filter" data-filter="' + filter.id + '">' + filter.label + ' · ' + counts[filter.id] + '</button>';
      }).join('') + '</div><div class="section-row"><div class="section-copy"><strong>Участники остановки</strong><span>' + h(city ? city.name : 'Маршрут не задан') + ' · показано ' + visible.length + ' из ' + members.length + '</span></div></div>' + cards + '</main>';
  }

  function memberRow(tourist, note) {
    var visibleNote = hasRestrictedTouristPrivacy(tourist) ? tourist.type : (note || tourist.lead);
    return '<div class="member member-link" role="button" tabindex="0" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar">' + h(tourist.initials) + '</span><div class="member-copy"><strong>' + h(tourist.name) +
      '</strong><span>' + h(visibleNote) + '</span></div><span class="lead-pill">Тур · ' + h(globalGroupLabel(tourist)) + '</span></div>';
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
    if (state.uiPreview === 'saving') {
      return '<main class="scroll"><div class="empty-state save-state">' + icon('more') + '<strong>Сохраняем изменения</strong><span>Черновик и выбранные туристы остаются на экране до ответа.</span><button type="button" class="primary-button blue empty-state-action" disabled aria-busy="true">Сохраняем…</button></div></main>';
    }
    if (state.uiPreview === 'save-error') {
      return '<main class="scroll"><div class="empty-state error-state">' + icon('alert') + '<strong>Не удалось сохранить</strong><span>Черновик и выбранные туристы сохранены. Можно повторить или вернуться к редактированию.</span><div class="empty-state-controls"><button type="button" class="secondary-button" data-action="return-draft-state">Вернуться к черновику</button><button type="button" class="primary-button blue" data-action="retry-save-state">Повторить</button></div></div></main>';
    }
    return '';
  }

  function operationsView() {
    var guideShell = state.role === 'viewer' || state.role === 'escort';
    if (!guideShell && state.summaryMode === 'coverage') return matrixSummaryView();
    var grouped = groupStageRecords(state.stage);
    var available = scopedTourists(false);
    var filled = available.length - grouped.free.length;
    var cards = grouped.groups.map(operationCard).join('');
    if (!cards) {
      var emptyOperationHint = capabilities().canEditLogistics && !state.offline ? 'Выберите туристов и заполните общую запись.' : 'Для выбранной операции пока нет данных. Доступен режим просмотра.';
      cards = '<div class="empty-state">' + icon(state.stage === 'hotel' ? 'hotel' : 'plane') + '<strong>' + stageMeta[state.stage].empty +
        '</strong><span>' + h(emptyOperationHint) + '</span></div>';
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
    var shell = statusBar() + topBar(selectedTourName(), selectedTour().dates + ' · ' + touristCount(currentTourists().length)) + roleBanner() +
      (guideShell ? cityPickerButton() + stageSwitch() : workspaceTabs() + summaryTabs() + cityPickerButton() + stageSwitch());
    var preview = statePreview();
    if (preview) return shell + preview;
    var selectedScopeTourist = state.scopeLead ? currentTourists().find(function (tourist) { return tourist.leadId === state.scopeLead && canSeeSourceLeadFor(tourist); }) : null;
    var selectedScope = selectedScopeTourist ? selectedScopeTourist.lead : null;
    var scopeName = selectedScope ? selectedScope.replace(/^Лид\s+/, 'Лид: ') : 'Весь тур';
    var scopeControl = hasLimitedTouristPrivacy() ? '' : '<button type="button" class="scope-chip ' + (state.scopeLead ? 'active' : '') + '" data-action="toggle-scope">' + h(scopeName) + '</button>';
    var canAdd = capabilities().canEditLogistics && !state.offline && available.some(leadConfirmed);
    var addAction = canAdd ? '<button type="button" class="add-button compact-add" data-action="add-stage" aria-label="' + h(stageMeta[state.stage].add) + '">' + icon('plus') + '</button>' : '';
    return shell + '<main class="scroll">' + (guideShell ? '' : summaryModeSwitch()) + '<div class="operation-toolbar"><div class="section-copy"><strong>' + stageMeta[state.stage].heading + '</strong><span>' +
      h(cityLabel(currentCity())) + ' · заполнено ' + filled + ' из ' + available.length + '</span></div>' + scopeControl + addAction + '</div>' + cards + free + '</main>';
  }

  function summaryModeSwitch() {
    return '<div class="summary-tools"><div class="mini-switch"><button type="button" class="' + (state.summaryMode === 'groups' ? 'active' : '') + '" data-action="summary-mode" data-mode="groups">По операциям</button><button type="button" class="' + (state.summaryMode === 'coverage' ? 'active' : '') + '" data-action="summary-mode" data-mode="coverage">Покрытие</button></div></div>';
  }

  function summaryTools() {
    var selectedScopeTourist = state.scopeLead ? currentTourists().find(function (tourist) { return tourist.leadId === state.scopeLead && canSeeSourceLeadFor(tourist); }) : null;
    var selectedScope = selectedScopeTourist ? selectedScopeTourist.lead : null;
    var scopeName = selectedScope ? selectedScope.replace(/^Лид\s+/, 'Лид: ') : 'Весь тур';
    return '<div class="summary-tools"><span class="summary-context">' + h(stageMeta[state.stage].tab) + ' · ' + h(cityLabel(currentCity())) + '</span>' +
      (hasLimitedTouristPrivacy() ? '' : '<button type="button" class="scope-chip ' + (state.scopeLead ? 'active' : '') + '" data-action="toggle-scope">' + h(scopeName) + '</button>') + '</div>';
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
      var coverageSubtitle = hasRestrictedTouristPrivacy(tourist) ? tourist.type + ' · ' + globalGroupLabel(tourist) : tourist.lead + ' · ' + globalGroupLabel(tourist);
      return '<article class="coverage-card"><button type="button" class="coverage-person" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(coverageSubtitle) + '</small></span><b>›</b></button><div class="coverage-head"><span>Город</span><div><i>Рейс</i><i>Отель</i><i>Отъезд</i></div></div>' + cityRows + '</article>';
    }).join('');
    var exportAction = capabilities().canExport && !state.offline ? '<button type="button" class="text-button" data-action="export-summary">Excel</button>' : '';
    return statusBar() + topBar(selectedTourName(), selectedTour().dates + ' · ' + touristCount(currentTourists().length)) + roleBanner() + workspaceTabs() + summaryTabs() +
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
      var restricted = hasRestrictedTouristPrivacy(tourist);
      var searchable = restricted ? [tourist.name, tourist.type, globalGroupLabel(tourist)] : [tourist.name, tourist.phone, tourist.lead, globalGroupLabel(tourist)];
      if (hasLimitedTouristPrivacy()) searchable.push(tourist.phone);
      if (query && searchable.join(' ').toLowerCase().indexOf(query) === -1) return false;
      if (restricted && !hasLimitedTouristPrivacy() && (state.touristFilters.needsData || state.touristFilters.documentIssue)) return false;
      if (state.touristFilters.needsData && personalReadiness(tourist).ready) return false;
      if (state.touristFilters.documentIssue) {
        var documentState = documentReadiness(tourist);
        if (hasLimitedTouristPrivacy() ? documentState.foreign.ready : documentState.ready) return false;
      }
      if (state.touristFilters.limitedRoute && tourist.route.length >= cities.length) return false;
      if (state.touristFilters.debt && (!canViewFinance() || paymentPresentation(tourist).kind !== 'due')) return false;
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
    var limitedPrivacy = hasLimitedTouristPrivacy();
    var restricted = hasRestrictedTouristPrivacy(tourist);
    var operationalOnly = state.role === 'manager' && restricted;
    var visibleDocuments = limitedPrivacy ? { ready: documents.foreign.ready, expiring: documents.foreign.expiring, label: documents.foreign.label } : documents;
    var filled = filledOperationsForCity(tourist, currentCity());
    var primary = !restricted && tourist.isPrimary ? '<span class="group-pill">Основной в заявке</span>' : '';
    var subtitle = restricted ? tourist.type + ' · ' + globalGroupLabel(tourist) : tourist.type + ' · ' + tourist.lead;
    var readinessBadges = operationalOnly ? '<span class="group-pill">Участие · ' + h(tourist.tourStatus) + '</span>' : '<span class="readiness-pill ' + readinessClass(personal.ready) + '">' + h(personal.ready ? 'Данные готовы' : 'Дозаполнить данные') + '</span><span class="readiness-pill ' + readinessClass(visibleDocuments.ready, visibleDocuments.expiring) + '">' + h(visibleDocuments.label) + '</span>';
    var contactActions = canViewContactFor(tourist) ? '<div class="card-actions"><button type="button" class="secondary-button" data-action="call-tourist" data-id="' + tourist.id + '">' + icon('phone') + 'Позвонить</button><button type="button" class="secondary-button" data-action="message-tourist" data-id="' + tourist.id + '">' + icon('chat') + 'Написать</button></div>' : '';
    var payment = canViewFinance() ? paymentPresentation(tourist) : null;
    var paymentLine = payment ? '<div class="tourist-payment"><span>Оплата</span><strong style="color:' + h(payment.color) + '">' + h(payment.list) + '</strong></div>' : '';
    return '<article class="tourist-card"><button type="button" class="tourist-card-main" data-action="tourist-detail" data-id="' + tourist.id + '"><span class="avatar dark">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(subtitle) + '</small><em>Группа тура · ' + h(globalGroupLabel(tourist)) + '</em></span><b>›</b></button><div class="tourist-card-badges">' + primary + readinessBadges + '</div>' + paymentLine + '<div class="tourist-next"><span><strong>' + h(cityLabel(currentCity())) + '</strong><small>Логистика · ' + filled + ' из 3</small></span><span class="status-chip">' + h(statusLabel(tourist, currentCity().id, state.stage)) + '</span></div>' + contactActions + '</article>';
  }

  function touristFilterChips() {
    var chips = [];
    if (state.touristFilters.needsData) chips.push('<button data-action="quick-filter" data-filter="needsData">Не заполнены данные ×</button>');
    if (state.touristFilters.documentIssue) chips.push('<button data-action="quick-filter" data-filter="documentIssue">Проблемы с документами ×</button>');
    if (state.touristFilters.limitedRoute) chips.push('<button data-action="quick-filter" data-filter="limitedRoute">Ограниченный маршрут ×</button>');
    if (state.touristFilters.debt) chips.push('<button data-action="quick-filter" data-filter="debt">С долгом ×</button>');
    if (state.touristFilters.type !== 'all') chips.push('<button data-action="clear-type-filter">' + h(state.touristFilters.type) + ' ×</button>');
    if (state.touristFilters.group !== 'all') chips.push('<button data-action="clear-group-filter">' + (state.touristFilters.group === 'grouped' ? 'В группе' : 'Без группы') + ' ×</button>');
    if (state.touristFilters.status !== 'all') chips.push('<button data-action="clear-status-filter">' + h(statusLabels[state.stage][state.touristFilters.status]) + ' ×</button>');
    return chips.length ? '<div class="filter-chips">' + chips.join('') + '</div>' : '';
  }

  function touristsView() {
    var visible = filteredTourists();
    var limitedPrivacy = hasLimitedTouristPrivacy();
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
    var scopeControl = limitedPrivacy ? '' : '<button type="button" class="scope-chip ' + (state.scopeLead ? 'active' : '') + '" data-action="toggle-scope">' + (state.scopeLead ? 'Этот лид' : 'Весь тур') + '</button>';
    var searchPlaceholder = limitedPrivacy ? 'ФИО, телефон, тип или группа' : 'ФИО, телефон, лид или группа';
    var guideShell = state.role === 'viewer' || state.role === 'escort';
    return statusBar() + topBar(selectedTourName(), 'Туристы · ' + touristCount(currentTourists().length)) + roleBanner() + (guideShell ? cityPickerButton() : workspaceTabs() + summaryTabs() + cityPickerButton()) +
      '<main class="scroll"><div class="tourist-search-row"><label class="search-box">' + icon('search') + '<input data-tourist-search value="' + h(state.touristQuery) + '" placeholder="' + h(searchPlaceholder) + '"></label><button type="button" class="filter-button" data-action="tourist-filters" aria-label="Фильтры">' + icon('filter') + '</button></div>' + touristFilterChips() + '<div class="summary-tools"><div class="mini-switch"><button class="' + (state.touristListMode === 'list' ? 'active' : '') + '" data-action="tourist-list-mode" data-mode="list">Список</button><button class="' + (state.touristListMode === 'groups' ? 'active' : '') + '" data-action="tourist-list-mode" data-mode="groups">По группам</button></div>' + scopeControl + '</div><div class="section-row"><div class="section-copy"><strong>Участники тура</strong><span>' + touristCount(visible.length) + ' найдено</span></div>' + (capabilities().canGroup && !state.offline ? '<button type="button" class="add-button" data-action="start-tourist-group">' + icon('users') + 'Группа</button>' : '') + '</div>' + cards + '</main>';
  }

  function documentsView() {
    var scoped = currentTourists().filter(function (tourist) {
      return canViewDocumentsFor(tourist) && (!state.scopeLead || tourist.leadId === state.scopeLead);
    });
    var limitedPrivacy = hasLimitedTouristPrivacy();
    function visibleReadiness(tourist) {
      var documents = documentReadiness(tourist);
      if (!limitedPrivacy) return documents;
      var foreign = documents.foreign;
      return {
        ready: foreign.ready,
        category: foreign.category === 'empty' ? 'ready' : foreign.category,
        expiring: foreign.expiring,
        label: foreign.label,
        issue: foreign.issue
      };
    }
    var counts = { attention: 0, expiring: 0, ready: 0 };
    scoped.forEach(function (tourist) {
      var readiness = visibleReadiness(tourist);
      if (readiness.category === 'ready') counts.ready += 1;
      else if (readiness.category === 'expiring') counts.expiring += 1;
      else counts.attention += 1;
    });
    var visible = scoped.filter(function (tourist) {
      var readiness = visibleReadiness(tourist);
      if (state.documentFilter === 'ready') return readiness.category === 'ready';
      if (state.documentFilter === 'expiring') return readiness.category === 'expiring';
      return readiness.category === 'missing';
    });
    var cards = visible.map(function (tourist) {
      var readiness = visibleReadiness(tourist);
      return '<article class="document-card"><div class="document-card-head"><span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(limitedPrivacy ? tourist.type : tourist.lead) + '</small></span><span class="readiness-pill ' + readinessClass(readiness.ready, readiness.expiring) + '">' + h(readiness.label) + '</span></div><div class="document-issue">' + icon(readiness.ready ? 'success' : 'alert') + '<span>' + h(readiness.issue) + '</span></div><button type="button" class="secondary-button full-button" data-action="open-tourist-documents" data-id="' + tourist.id + '">Открыть документы</button></article>';
    }).join('');
    if (!cards) cards = '<div class="empty-state">' + icon('document') + '<strong>' + (state.documentFilter === 'ready' ? 'Нет готовых комплектов' : 'Все документы готовы') + '</strong><span>В выбранной очереди нет туристов.</span></div>';
    return statusBar() + topBar(selectedTourName(), 'Документы туристов') + roleBanner() + workspaceTabs() + summaryTabs() +
      '<main class="scroll"><div class="document-stats"><button class="' + (state.documentFilter === 'attention' ? 'active' : '') + '" data-action="document-filter" data-filter="attention"><span>Не заполнено</span><strong>' + counts.attention + '</strong></button><button class="' + (state.documentFilter === 'expiring' ? 'active' : '') + '" data-action="document-filter" data-filter="expiring"><span>Истекает</span><strong>' + counts.expiring + '</strong></button><button class="' + (state.documentFilter === 'ready' ? 'active' : '') + '" data-action="document-filter" data-filter="ready"><span>Готово</span><strong>' + counts.ready + '</strong></button></div><div class="form-note">' + (limitedPrivacy ? 'Для этой роли доступны только загранпаспорт и его сканы.' : 'В очереди только реальные данные: паспорт РФ, загранпаспорт и сканы. Виза, страховка и анкета остаются в бэклоге.') + '</div>' + cards + '</main>';
  }

  function workView() {
    var cards = ['arrival', 'hotel', 'departure'].map(function (stage) {
      var rows = scopedTourists(false).map(function (tourist) {
        var content = '<span class="avatar">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(recordSummary(effectiveRecord(stage, tourist.id), stage)) + '</small></span><span class="status-chip">' + h(statusLabel(tourist, currentCity().id, stage)) + '</span>';
        return capabilities().canEditStatuses && !state.offline ? '<button type="button" class="work-person" data-action="change-status" data-id="' + tourist.id + '" data-stage="' + stage + '">' + content + '</button>' : '<div class="work-person readonly-work">' + content + '</div>';
      }).join('');
      return '<section class="work-card"><div class="work-card-head"><span>' + icon(stage === 'hotel' ? 'hotel' : 'plane') + '</span><div><strong>' + h(stageMeta[stage].tab) + '</strong><small>Операционный статус · данные не изменяются</small></div></div>' + rows + '</section>';
    }).join('');
    return statusBar() + topBar(selectedTourName(), 'Статусы на маршруте') + roleBanner() + workspaceTabs() + summaryTabs() + cityPickerButton() + '<main class="scroll"><div class="form-note">Выберите конкретный статус. Циклическое переключение отключено.</div>' + cards + '</main>';
  }

  function isoDateValue(date) {
    return date.getUTCFullYear() + '-' + String(date.getUTCMonth() + 1).padStart(2, '0') + '-' + String(date.getUTCDate()).padStart(2, '0');
  }

  function dateFromIso(value) {
    var parts = String(value || '').split('-').map(Number);
    return parts.length === 3 && parts.every(Number.isFinite) ? new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])) : null;
  }

  function formatProgramDate(value) {
    var date = dateFromIso(value);
    if (!date) return value || 'Дата не указана';
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date).replace('.', '');
  }

  function programCityIndexForDate(dateValue) {
    var matchedIndex = 0;
    cities.forEach(function (city, index) {
      if ((!city.arrival || dateValue >= city.arrival) && (!city.departure || dateValue <= city.departure)) matchedIndex = index;
    });
    return matchedIndex;
  }

  function buildProgramDays(tour, existingDays, seedDescriptions) {
    var start = dateFromIso(tour && tour.startDate);
    var end = dateFromIso(tour && tour.endDate);
    if (!start || !end || start > end) return [];
    var previous = {};
    (existingDays || []).forEach(function (day) {
      previous[day.date + '|' + day.cityIdx] = day.description || day.text || '';
    });
    var days = [];
    for (var cursor = new Date(start.getTime()), dayNumber = 1; cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1), dayNumber += 1) {
      var date = isoDateValue(cursor);
      var cityIdx = programCityIndexForDate(date);
      var routeCity = cities[cityIdx] || { name: '' };
      var description = previous[date + '|' + cityIdx] || (seedDescriptions && seedDescriptions[date]) ||
        (dayNumber === 1 ? 'Встреча, трансфер и размещение.' : 'Программа в городе ' + routeCity.name + '.');
      days.push({ dayNumber: dayNumber, date: date, city: routeCity.name, cityIdx: cityIdx, description: description });
    }
    return days;
  }

  function programView() {
    var canManage = capabilities().canManageProgram && !state.offline;
    var guideShell = state.role === 'viewer' || state.role === 'escort';
    var programShell = statusBar() + topBar(selectedTourName(), 'Программа тура') + (guideShell ? roleBanner() + stageSwitch() : workspaceTabs());
    var visibleProgramDays = state.role === 'viewer' ? programDays.filter(function (day) {
      return cities[day.cityIdx] && canViewRouteCity(cities[day.cityIdx].id);
    }) : programDays;
    if (!visibleProgramDays.length) {
      return programShell + '<main class="scroll"><div class="empty-state">' + icon('tours') + '<strong>Программа ещё не сформирована</strong><span>Дни создаются автоматически из дат тура. Вручную добавлять и удалять отдельные дни нельзя.</span>' + (canManage ? '<button type="button" class="primary-button empty-state-action" data-action="generate-program">Сформировать программу</button>' : '') + '</div></main>';
    }
    var days = visibleProgramDays.map(function (day) {
      var index = programDays.indexOf(day);
      return '<article class="day-card"><div class="day-date"><strong>' + h(day.dayNumber) + '</strong><span>день</span></div><div class="day-copy"><strong>' + h(formatProgramDate(day.date)) + '</strong><span>' + icon('pin') + h(day.city || 'Город не указан') + ' · cityIdx ' + h(day.cityIdx) + '</span><p>' + h(day.description || 'Описание не заполнено') + '</p></div>' + (canManage ? '<button type="button" class="inline-action" data-action="edit-program" data-index="' + index + '">Изменить</button>' : '') + '</article>';
    }).join('');
    var programActions = canManage ? '<div class="section-row"><div class="section-copy"><strong>Программа тура</strong><span>Даты заданы туром; редактируются город и описание</span></div></div><div class="tool-grid two-tools"><button data-action="regenerate-program"><strong>Пересоздать</strong><span>Сформировать заново по датам</span></button><button class="danger-tool" data-action="clear-program"><strong>Очистить</strong><span>Удалить всю программу</span></button></div>' :
      '<div class="section-row"><div class="section-copy"><strong>Программа тура</strong><span>По дням и городам маршрута</span></div></div><div class="form-note">Режим просмотра. Изменять программу могут менеджер и администратор тура.</div>';
    return (guideShell ? statusBar() + topBar(selectedTourName(), 'Программа · ' + visibleProgramDays.length + ' дней') + roleBanner() + stageSwitch() : statusBar() + topBar(selectedTourName(), 'Программа · ' + visibleProgramDays.length + ' дней') + workspaceTabs()) +
      '<main class="scroll">' + programActions + days + '</main>';
  }

  function tourInfoView() {
    var tour = selectedTour();
    var routePresentation = tourRoutePresentation(tour);
    var overviewRouteCities = routeCitiesForRole(tour);
    var visibleGuideNames = overviewRouteCities.map(function (city) { return directoryUserName((tour.cityGuides || {})[city.id]); }).filter(function (name) { return name !== 'Не назначен'; });
    var hideFinancials = state.role === 'viewer' || state.role === 'escort';
    var liveTourists = tourHasOperationalModel(tour.id) ? currentTourists() : null;
    var bookedCount = liveTourists ? liveTourists.length : bookedCountForTour(tour);
    var statusCounts = liveTourists ? liveTourists.reduce(function (counts, tourist) {
      if (tourist.tourStatus === 'Подтверждён') counts.confirmed += 1;
      else if (tourist.tourStatus === 'Отменён') counts.cancelled += 1;
      else counts.pending += 1;
      return counts;
    }, { confirmed: 0, pending: 0, cancelled: 0 }) : tour.statusCounts;
    var availableSpots = Math.max(Number(tour.capacity || 0) - bookedCount, 0);
    var statusBadges = (statusCounts.confirmed ? '<span class="state-pill">Подтв. ' + statusCounts.confirmed + '</span>' : '') + (statusCounts.pending ? '<span class="warning-pill">Ожид. ' + statusCounts.pending + '</span>' : '') + (statusCounts.cancelled ? '<span class="danger-pill">Отм. ' + statusCounts.cancelled + '</span>' : '');
    var headerBadges = '<span class="battery-pill">' + tour.logisticsCompleteness + '%</span><span class="group-pill">' + h(tour.tourTypeLabel) + '</span>' + (tour.isArchived ? '<span class="lead-pill">Архив</span>' : '') + (tour.status === 'cancelled' ? '<span class="danger-pill">Отменён</span>' : '');
    var manageActions = capabilities().canManageTour && !state.offline ? '<button type="button" class="icon-button" data-action="copy-tour" aria-label="Копировать тур">' + icon('tours') + '</button><button type="button" class="icon-button" data-action="edit-tour" aria-label="Изменить тур">' + icon('edit') + '</button>' + (state.role === 'admin' ? '<button type="button" class="icon-button danger-icon" data-action="delete-tour" aria-label="Удалить тур">' + icon('trash') + '</button>' : '') : '';
    var viewerGuideLine = state.role === 'viewer' ? '<div class="event-line">' + icon('users') + '<span><em>Назначенные гиды:</em> ' + h(visibleGuideNames.join(', ') || 'Не назначены') + '</span></div>' : '';
    var summaryHref = './tour-operations.html?' + new URLSearchParams({ tourId: tour.id, tourSection: 'summary', role: state.role, offline: state.offline ? '1' : '0' }).toString();
    return statusBar() + topBar(tour.name, 'Карточка тура') + workspaceTabs() + '<main class="scroll"><article class="event-card" style="--tour-color:' + h(tour.color) + '"><div class="event-card-title"><span class="event-color"></span><strong>' + h(tour.name) + '</strong><div>' + headerBadges + '</div></div><div class="event-line">' + icon('pin') + '<span><em>' + h(tour.country) + ':</em> ' + h(routePresentation.cityNames.join(', ')) + '</span></div><div class="event-line split-line">' + icon('tours') + '<span>' + h(routePresentation.dates) + '</span>' + (hideFinancials ? '' : '<strong>' + h(formatMoney(tour.price, tour.priceCurrency)) + '</strong>') + '</div>' + viewerGuideLine + '<div class="event-line event-participants">' + icon('users') + '<span>' + bookedCount + ' из ' + tour.capacity + ' участников</span>' + statusBadges + (availableSpots === 0 ? '<span class="state-pill">Мест нет</span>' : '') + '</div><p class="event-description">' + h(tour.description) + '</p>' + (tour.site && !hideFinancials ? '<button type="button" class="event-site" data-action="preview-tour-site">' + icon('success') + 'Открыть на сайте</button>' : '') + '<div class="event-actions"><button type="button" class="secondary-button event-summary-button" data-action="workspace" data-view="operations">Сводная таблица <b>→</b></button><a class="icon-button" href="' + h(summaryHref) + '" target="_blank" rel="noopener" aria-label="Открыть сводную в новой вкладке">' + icon('success') + '</a>' + manageActions + '</div></article><div class="overview-stats"><div><span>Логистика</span><strong>' + tour.logisticsCompleteness + '%</strong></div><div><span>Свободно</span><strong>' + availableSpots + '</strong></div><div><span>Маршрут</span><strong>' + overviewRouteCities.length + '</strong></div></div></main>';
  }

  function tourTeamView() {
    var tour = selectedTour();
    var teamCities = routeCitiesForRole(tour);
    var guideRows = teamCities.map(function (city) {
      var routeIndex = city.routeIndex == null ? cities.indexOf(city) : city.routeIndex;
      var guideId = (tour.cityGuides || {})[city.id];
      return '<div class="team-row"><span class="route-stop-index">' + (routeIndex + 1) + '</span><span><strong>' + h(cityLabel(city)) + '</strong><small>Гид города</small></span><b>' + h(directoryUserName(guideId)) + '</b>' + (tour.financeGuideCityId === city.id ? '<em>Сбор оплаты</em>' : '') + '</div>';
    }).join('');
    var edit = capabilities().canManageTour && !state.offline ? '<button type="button" class="add-button" data-action="edit-tour">' + icon('edit') + 'Изменить</button>' : '';
    var teamDetails = state.role === 'viewer' ? '<div class="form-note">Показаны только гиды назначенных вам позиций маршрута.</div>' : '<section class="info-card details-card"><div><span>Сопровождающий</span><strong>' + h(directoryUserName(tour.escortUserId)) + '</strong></div><div><span>Администраторы чата</span><strong>' + h((tour.chatAdminIds || []).map(directoryUserName).join(', ') || 'Не назначены') + '</strong></div></section>';
    var tourChatUnread = window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.unreadForTour === 'function' ? window.UNIQUE_MOBILE_CHATS.unreadForTour(tour.id) : 0;
    var tourChatCard = '<button type="button" class="tour-chat-entry" data-action="open-tour-chat"><span class="tour-chat-entry-icon">' + icon('chat') + '</span><span><strong>Общий чат с туристами</strong><small>Сообщения видят участники этого тура</small></span>' + (tourChatUnread ? '<em>' + h(tourChatUnread) + '</em>' : '') + '<b>›</b></button>';
    return statusBar() + topBar(tour.name, 'Команда и доступы') + workspaceTabs() + '<main class="scroll"><div class="section-row"><div class="section-copy"><strong>Гиды по городам</strong><span>Назначение привязано к позиции маршрута</span></div>' + edit + '</div><section class="info-card team-list">' + guideRows + '</section>' + teamDetails + tourChatCard + '</main>';
  }

  function tourTasksView() {
    var canManage = capabilities().canManageTasks && !state.offline;
    var statuses = { todo: 'К выполнению', in_progress: 'В работе', done: 'Готово' };
    var priorities = { low: 'Низкий', medium: 'Средний', high: 'Высокий', urgent: 'Срочный' };
    var order = { todo: 0, in_progress: 1, done: 2 };
    var rows = tourTasks.slice().sort(function (a, b) { return order[a.status] - order[b.status]; }).map(function (task) {
      var overdue = task.status !== 'done' && task.dueDate && task.dueDate < '2026-09-14';
      var content = '<span class="task-check ' + h(task.status) + '">' + (task.status === 'done' ? icon('check') : (task.status === 'in_progress' ? '◷' : '○')) + '</span><span><strong class="' + (task.status === 'done' ? 'done-title' : '') + '">' + h(task.title) + '</strong><small>' + h(task.description || 'Без описания') + '</small><em>' + h(statuses[task.status]) + ' · срок: ' + h(task.dueDate || 'не указан') + '</em></span><span class="task-meta"><b class="priority-' + h(task.priority) + '">' + h(priorities[task.priority]) + '</b>' + (overdue ? '<b class="overdue">Просрочено</b>' : '') + '</span>';
      return canManage ? '<button type="button" class="tour-task" data-action="edit-tour-task" data-id="' + h(task.id) + '">' + content + '</button>' : '<div class="tour-task">' + content + '</div>';
    }).join('');
    var counts = ['todo', 'in_progress', 'done'].map(function (status) { var count = tourTasks.filter(function (task) { return task.status === status; }).length; return count ? '<span>' + count + ' · ' + statuses[status] + '</span>' : ''; }).join('');
    return statusBar() + topBar(selectedTourName(), 'Задачи текущего тура') + workspaceTabs() + '<main class="scroll"><div class="section-row"><div class="section-copy"><strong>Задачи</strong><div class="task-counters">' + counts + '</div></div>' + (canManage ? '<button type="button" class="add-button" data-action="add-tour-task">' + icon('plus') + 'Добавить</button>' : '') + '</div>' + (rows || '<div class="empty-state"><strong>Задач нет</strong><span>Добавьте первую задачу по туру.</span></div>') + '</main>';
  }

  function tourActionsView() {
    var tour = selectedTour();
    var canManage = capabilities().canManageTour && !state.offline;
    var rows = '<button data-action="open-directory"><span>' + icon('pin') + '</span><div><strong>Города и точки</strong><small>Справочник аэропортов и вокзалов</small></div><b>›</b></button>';
    if (canManage) {
      rows = '<button data-action="edit-tour"><span>' + icon('edit') + '</span><div><strong>Изменить тур</strong><small>Поля в порядке веб-формы</small></div><b>›</b></button><button data-action="copy-tour"><span>' + icon('tours') + '</span><div><strong>Копировать</strong><small>Создать черновик с теми же настройками</small></div><b>›</b></button><button class="danger-row" data-action="' + (tour.status === 'cancelled' ? 'reopen-tour' : 'cancel-tour') + '"><span>' + icon('close') + '</span><div><strong>' + (tour.status === 'cancelled' ? 'Открыть тур снова' : 'Закрыть тур с отказом') + '</strong><small>Доступно менеджеру и администратору</small></div><b>›</b></button>' + (state.role === 'admin' ? '<button class="danger-row" data-action="archive-tour"><span>' + icon('archive') + '</span><div><strong>' + (tour.isArchived ? 'Вернуть из архива' : 'Архивировать') + '</strong><small>Только администратор</small></div><b>›</b></button><button class="danger-row" data-action="delete-tour"><span>' + icon('trash') + '</span><div><strong>Удалить тур</strong><small>Только администратор</small></div><b>›</b></button>' : '') + rows;
    }
    return statusBar() + topBar(tour.name, 'Действия с туром') + workspaceTabs() + '<main class="scroll">' + (canManage ? '' : '<div class="form-note">Режим просмотра. Изменять тур могут менеджер и администратор.</div>') + '<div class="action-menu">' + rows + '</div></main>';
  }

  function financeView() {
    normalizeFinanceRouteCity();
    var rows = buildFinanceRows();
    var activeFinanceCity = currentFinanceCity();
    financeActionRegistry = {};
    var totals = ['₽', '¥', '€', '$'].map(function (symbol) {
      var amount = rows.reduce(function (sum, row) { return sum + (row.balance && row.balance.symbol === symbol ? row.balance.amount : 0); }, 0);
      if (!amount) return '';
      return '<article class="finance-total"><span>Остаток по оплате</span><strong>− ' + h(new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(amount)) + ' ' + h(symbol) + '</strong></article>';
    }).join('');
    var cards = rows.map(function (row, rowIndex) {
      var paid = row.collected || !row.balance;
      var members = row.members.map(function (member) {
        return '<div class="finance-member"><span class="avatar">' + h(member.initials) + '</span><strong>' + h(member.name) + '</strong>' + (member.id === row.payerId ? '<em>Плательщик</em>' : '') + '</div>';
      }).join('');
      var action = '';
      if (row.leadId && !state.offline) {
        var targetCollection = row.collected ? 'false' : (row.balance ? 'true' : null);
        if (targetCollection) {
          financeActionCounter += 1;
          var financeActionKey = 'finance-action-' + financeActionCounter;
          financeActionRegistry[financeActionKey] = {
            tourId: state.selectedTourId,
            routeCityId: activeFinanceCity && activeFinanceCity.id,
            leadId: row.leadId,
            collected: targetCollection
          };
          action = row.collected ? '<button type="button" class="secondary-button full-button" data-action="finance-collection" data-finance-action="' + financeActionKey + '" data-collected="false">Отменить действие</button>' :
            '<button type="button" class="primary-button full-button" data-action="finance-collection" data-finance-action="' + financeActionKey + '" data-collected="true">Оплачен</button>';
        }
      }
      return '<article class="finance-card"><div class="finance-card-head"><span><strong>Заявка</strong><small>' + touristCount(row.members.length) + '</small></span><span><small>Остаток по оплате</small><strong class="' + (paid ? 'paid' : 'due') + '">' + (paid ? 'Полностью оплачено' : '− ' + h(row.balance.formatted) + ' ' + h(row.balance.symbol)) + '</strong></span></div><div class="finance-members">' + members + '</div>' + action + '</article>';
    }).join('');
    var cityContext = financeCityPickerButton();
    var note = state.offline ? '<div class="system-banner offline"><span><strong>Нет подключения</strong><small>Остатки доступны для чтения; отметка оплаты заблокирована.</small></span></div>' :
      '<div class="form-note">Один остаток относится ко всей заявке. Плательщик выбирается из основного туриста лида; остальные участники показаны внутри той же карточки.</div>';
    return statusBar() + topBar(selectedTourName(), 'Финансы · остатки по оплате') + roleBanner() + cityContext + '<main class="scroll finance-scroll"><div class="section-row"><div class="section-copy"><strong>Финансы</strong><span>Остаток по оплате</span></div></div>' + note + (totals ? '<div class="finance-totals">' + totals + '</div>' : '') + (cards || '<div class="empty-state"><strong>Нет данных по остаткам оплаты</strong><span>Для выбранной позиции маршрута нет заявок.</span></div>') + '</main>';
  }

  function chatEnvironment() {
    return {
      role: state.role,
      offline: state.offline,
      selectedTourId: state.selectedTourId,
      selectedTourName: selectedTourName(),
      render: render,
      showToast: showToast,
      openLead: function (leadId) { activateLeadsWorkspace({ leadId: leadId, detailTab: 'chat' }); },
      openTourist: function (touristId) {
        var tourist = touristById(touristId);
        if (!tourist) return;
        state.view = 'tourists';
        state.overlay = { kind: 'tourist-detail', touristId: tourist.id, expanded: new Set(), detailTab: 'profile' };
        render();
      },
      openTour: function (tourId) {
        if (!canViewTourId(tourId)) return;
        state.selectedTourId = tourId;
        state.view = state.role === 'viewer' || state.role === 'escort' ? 'operations' : 'tour-info';
        state.overlay = null;
        render();
      },
      closeContext: function (returnView) {
        state.view = returnView || (state.role === 'viewer' || state.role === 'escort' ? 'operations' : 'chats');
        syncPrototypeUrl(state.view);
        render();
      }
    };
  }

  function chatsView() {
    if (!window.UNIQUE_MOBILE_CHATS || typeof window.UNIQUE_MOBILE_CHATS.renderHub !== 'function') {
      return statusBar() + '<main class="scroll"><div class="empty-state">' + icon('alert') + '<strong>Чаты не загружены</strong><span>Обновите страницу прототипа.</span></div></main>';
    }
    return statusBar() + window.UNIQUE_MOBILE_CHATS.renderHub(chatEnvironment());
  }

  function unsupportedTourView() {
    var tour = selectedTour();
    var members = currentTourists().map(function (tourist) {
      var memberSubtitle = (tourist.type || 'Турист') + (!hasRestrictedTouristPrivacy(tourist) && tourist.lead ? ' · ' + tourist.lead : '');
      return '<button type="button" class="tourist-card-main" data-action="tourist-detail" data-id="' + h(tourist.id) + '"><span class="avatar dark">' + h(tourist.initials) + '</span><span><strong>' + h(tourist.name) + '</strong><small>' + h(memberSubtitle) + '</small><em>Открыть карточку туриста</em></span><b>›</b></button>';
    }).join('');
    var memberSection = members ? '<section class="info-card"><div class="section-row"><div class="section-copy"><strong>Туристы</strong><span>' + touristCount(currentTourists().length) + ' в сохранённых данных</span></div></div>' + members + '</section>' : '<div class="form-note">В локальных данных пока нет туристов этого тура.</div>';
    return statusBar() + topBar(tour.name, 'Сводная · режим просмотра') +
      '<main class="scroll"><div class="empty-state">' + icon('alert') + '<strong>Сводная тура ещё не подготовлена</strong><span>Маршрут и операции этого тура не загружены. Китайские mock-данные не используются и изменения недоступны.</span><button type="button" class="secondary-button empty-state-action" data-action="open-tours">Вернуться к списку туров</button></div>' + memberSection + '</main>';
  }

  function unauthorizedTourView() {
    return statusBar() + '<div class="app-top"><div class="user-row"><span class="user-label">UNIQUE · мобильная CRM</span><button type="button" class="role-badge" data-action="role-menu">' + h(roleLabels[state.role]) + '</button></div>' +
      '<div class="tour-row"><span class="tour-mark"></span><div class="tour-title"><strong>Недоступный тур</strong><span>Доступ к туру ограничен</span></div></div></div>' +
      '<main class="scroll"><div class="empty-state error-state">' + icon('alert') + '<strong>Тур не назначен текущей роли</strong><span>Персональные данные и операции скрыты. Выберите доступный тур или смените роль в mock-сценарии.</span><button type="button" class="secondary-button empty-state-action" data-action="open-tours">Выбрать доступный тур</button></div></main>';
  }

  function bottomNav() {
    var guideShell = state.role === 'viewer' || state.role === 'escort';
    var items = [
      guideShell ? { id: 'operations', label: 'Задачи', icon: 'tasks' } : { id: 'tour-info', label: 'Туры', icon: 'tours' },
      { id: 'tourists', label: 'Туристы', icon: 'users' }
    ];
    if (canViewFinance()) items.push({ id: 'finance', label: 'Финансы', icon: 'finance' });
    if (state.role === 'admin' || state.role === 'manager') items.push({ id: 'leads', label: 'Лиды', icon: 'leads' });
    if (state.role === 'admin' || state.role === 'manager') items.push({ id: 'chats', label: 'Чаты', icon: 'chat' });
    var chatUnread = window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.unreadTotal === 'function' ? window.UNIQUE_MOBILE_CHATS.unreadTotal() : 0;
    return '<nav class="bottom-nav" aria-label="Основная навигация">' + items.map(function (item) {
      var tourViews = ['operations', 'documents', 'work', 'program', 'tour-info', 'tour-team', 'tour-tasks', 'tour-actions'];
      var active = (item.id === 'tour-info' && tourViews.indexOf(state.view) !== -1) ||
        (item.id === 'operations' && ['operations', 'work', 'program'].indexOf(state.view) !== -1) || item.id === state.view;
      var action = item.id === 'leads' ? 'open-leads' : 'nav';
      return '<button type="button" class="nav-item ' + (active ? 'active' : '') + '" data-action="' + action + '" data-view="' + item.id + '">' +
        icon(item.icon) + '<span>' + item.label + '</span>' + (item.id === 'chats' && chatUnread ? '<em class="nav-badge">' + h(chatUnread > 99 ? '99+' : chatUnread) + '</em>' : '') + '</button>';
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
    var selectedTourists = Array.from(selected).map(touristById).filter(Boolean);
    var selectedGroupId = existingGroup ? existingGroup.createdFromGroupId : ((selectedTourists[0] || {}).groupId || null);
    var selectedFreeId = !selectedGroupId && selectedTourists.length ? selectedTourists[0].id : null;
    var rows = scopedTourists(true).map(function (tourist) {
      var record = effectiveRecord(overlay.stage, tourist.id);
      var outsideRoute = tourist.route.indexOf(currentCity().id) === -1;
      var unconfirmed = !leadConfirmed(tourist);
      var alreadyIncluded = initialMembers.indexOf(tourist.id) !== -1;
      var wrongGroup = Boolean(selectedGroupId && tourist.groupId !== selectedGroupId) || Boolean(selectedFreeId && tourist.id !== selectedFreeId);
      var unavailable = outsideRoute || unconfirmed || alreadyIncluded || wrongGroup;
      var note = alreadyIncluded ? 'Уже входит в эту общую запись' : (outsideRoute ? 'Город не входит в маршрут туриста' : (unconfirmed ? 'Логистика доступна после подтверждения лида' : (wrongGroup ? 'Общая операция доступна только внутри одной группы тура' : recordSummary(record, overlay.stage) + ' · ' + globalGroupLabel(tourist))));
      return selectionRow(tourist, selected.has(tourist.id), note, unavailable);
    }).join('');
    var canContinue = existingGroup ? selected.size > initialMembers.length : selected.size > 0;
    return '<section class="screen">' + screenHeader('Выберите туристов', cityLabel(currentCity()) + ' · ' + stageMeta[overlay.stage].tab) +
      '<div class="screen-scroll"><div class="selection-head"><strong>Туристы тура</strong><button type="button" class="text-button" data-action="select-all">Выбрать всех</button></div>' +
      '<div class="form-note">Индивидуальную запись можно создать для любого туриста. Общая запись объединяет только участников с одним непустым groupId; личные значения сохраняются.</div>' + (overlay.error ? '<div class="error-note">' + h(overlay.error) + '</div>' : '') + rows + '</div>' +
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
      return selectionRow(tourist, selected.has(tourist.id), globalGroupLabel(tourist) + (hasRestrictedTouristPrivacy(tourist) ? ' · ' + tourist.type : ' · ' + tourist.lead));
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
      var note = globalSplit ? (hasRestrictedTouristPrivacy(tourist) ? tourist.type : tourist.lead) : recordSummary(effectiveRecord(overlay.stage, tourist.id), overlay.stage);
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
    var emptyDirectoryHint = canManageDirectory ? 'Измените поиск или добавьте город.' : 'Измените строку поиска. Добавление городов доступно администратору.';
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
      (cityCards || '<div class="empty-state">' + icon('pin') + '<strong>Города не найдены</strong><span>' + h(emptyDirectoryHint) + '</span></div>') +
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
        ['plane', 'train', 'bus'].map(function (valueOption) {
          return '<option value="' + valueOption + '" ' + (value === valueOption ? 'selected' : '') + '>' + transportLabel(valueOption) + '</option>';
        }).join('') + '</select></label>';
    }
    if (field.type === 'point') {
      var type = pointTypeForTransport(state.draft.transport);
      var options = activePointsFor(currentCity(), state.draft.transport);
      var selectedPoint = directoryPointById(state.draft.pointId);
      var helper = '';
      if (selectedPoint && !selectedPoint.active) {
        return '<div class="field"><span>' + h(field.label) + '</span><button type="button" class="point-selector selected archived-selection" data-action="open-point-picker"><span>' + icon('archive') + '</span><span><strong>' + h(pointDisplay(selectedPoint)) + '</strong><small>Архивная точка сохранена в записи</small></span><b>›</b></button><small class="field-help warning-help">Историческое значение не перезаписывается автоматически. Выберите активную точку, только если нужно заменить её.</small></div>';
      }
      if (!type) return '<label class="field"><span>' + h(field.label) + '</span><input data-field="point" type="text" value="' + h(value) + '" placeholder="Сначала выберите транспорт"><small class="field-help">Доступны самолёт, поезд и автобус.</small></label>';
      if (options.length === 0 || state.draft.pointManual) {
        helper = '<small class="field-help warning-help">Не из справочника' + (options.length ? ' · активные точки не подставляются вместо ручного значения.' : ' · нет подходящей точки типа «' + h(pointTypeLabel(type, false)) + '».') + '</small>';
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
      '<button type="button" class="primary-button blue" data-action="apply-conflict" ' + (overlay.sourceId ? '' : 'disabled') + '>' + (overlay.groupId ? 'Применить к общей записи' : 'Создать общую запись') + '</button></footer></section>';
  }

  function toursScreen(overlay) {
    var labels = { all: 'Все', active: 'Активные', draft: 'Черновики', archive: 'Архив' };
    var query = state.tourQuery.trim().toLowerCase();
    var filtered = tours.filter(function (tour) {
      var matchesStatus = state.tourFilter === 'all' ? true : state.tourFilter === 'archive' ? (tour.isArchived || tour.status === 'archive' || tour.status === 'cancelled') :
        (!tour.isArchived && tour.status === state.tourFilter);
      return canViewTourId(tour.id) && matchesStatus && (!query || [tour.name, tour.route, tour.guides].join(' ').toLowerCase().indexOf(query) !== -1);
    });
    var cards = filtered.map(function (tour) {
      var routePresentation = tourRoutePresentation(tour);
      var hideFinancials = state.role === 'viewer' || state.role === 'escort';
      var liveTourists = tourHasOperationalModel(tour.id) ? tourists.filter(function (tourist) { return tourist.tourId === tour.id; }) : null;
      var bookedCount = bookedCountForTour(tour);
      var statusCounts = liveTourists ? liveTourists.reduce(function (counts, tourist) {
        if (tourist.tourStatus === 'Подтверждён') counts.confirmed += 1;
        else if (tourist.tourStatus === 'Отменён') counts.cancelled += 1;
        else counts.pending += 1;
        return counts;
      }, { confirmed: 0, pending: 0, cancelled: 0 }) : (tour.statusCounts || { confirmed: 0, pending: 0, cancelled: 0 });
      var availableSpots = Math.max(Number(tour.capacity || 0) - bookedCount, 0);
      var statusBadges = (statusCounts.confirmed ? '<span class="state-pill">Подтв. ' + statusCounts.confirmed + '</span>' : '') + (statusCounts.pending ? '<span class="warning-pill">Ожид. ' + statusCounts.pending + '</span>' : '') + (statusCounts.cancelled ? '<span class="danger-pill">Отм. ' + statusCounts.cancelled + '</span>' : '');
      var headerBadges = '<span class="battery-pill">' + tour.logisticsCompleteness + '%</span><span class="group-pill">' + h(tour.tourTypeLabel) + '</span>' + (tour.isArchived ? '<span class="lead-pill">Архив</span>' : '') + (tour.status === 'cancelled' ? '<span class="danger-pill">Отменён</span>' : '');
      var manageActions = canManageTourId(tour.id) && !state.offline ? '<button type="button" class="icon-button" data-action="copy-tour" data-id="' + h(tour.id) + '" aria-label="Копировать тур">' + icon('tours') + '</button><button type="button" class="icon-button" data-action="edit-tour" data-id="' + h(tour.id) + '" aria-label="Изменить тур">' + icon('edit') + '</button>' + (state.role === 'admin' ? '<button type="button" class="icon-button danger-icon" data-action="delete-tour" data-id="' + h(tour.id) + '" aria-label="Удалить тур">' + icon('trash') + '</button>' : '') : '';
      var summaryHref = './tour-operations.html?' + new URLSearchParams({ tourId: tour.id, tourSection: 'summary', role: state.role, offline: state.offline ? '1' : '0' }).toString();
      return '<article class="event-card tour-list-card" style="--tour-color:' + h(tour.color) + '"><div class="event-card-title"><span class="event-color"></span><strong>' + h(tour.name) + '</strong><div>' + headerBadges + '</div></div><div class="event-line">' + icon('pin') + '<span><em>' + h(tour.country) + ':</em> ' + h(routePresentation.cityNames.join(', ')) + '</span></div><div class="event-line split-line">' + icon('tours') + '<span>' + h(routePresentation.dates) + '</span>' + (hideFinancials ? '' : '<strong>' + h(formatMoney(tour.price, tour.priceCurrency)) + '</strong>') + '</div><div class="event-line event-participants">' + icon('users') + '<span>' + bookedCount + ' из ' + tour.capacity + ' участников</span>' + statusBadges + (availableSpots === 0 ? '<span class="state-pill">Мест нет</span>' : '') + '</div><p class="event-description">' + h(tour.description) + '</p>' + (tour.site && !hideFinancials ? '<button type="button" class="event-site" data-action="preview-tour-site">' + icon('success') + 'Открыть на сайте</button>' : '') + '<div class="event-actions"><button type="button" class="secondary-button event-summary-button" data-action="select-tour" data-id="' + h(tour.id) + '">Сводная таблица <b>→</b></button><a class="icon-button" href="' + h(summaryHref) + '" target="_blank" rel="noopener" aria-label="Открыть сводную в новой вкладке">' + icon('success') + '</a>' + manageActions + '</div></article>';
    }).join('');
    var emptyToursHint = capabilities().canManageTour && !state.offline ? 'Измените фильтр или создайте новый тур.' : 'Измените фильтр. Создание тура недоступно в текущем режиме.';
    var createAction = capabilities().canManageTour && !state.offline ? '<footer class="screen-actions single"><button type="button" class="primary-button" data-action="new-tour">' + icon('plus') + 'Создать тур</button></footer>' : '';
    var readOnlyNote = state.offline ? '<div class="form-note">Нет подключения. Список туров доступен без создания и изменений.</div>' :
      (capabilities().canManageTour ? '' : '<div class="form-note">Режим просмотра. Создание и управление турами недоступно для роли «' + h(roleLabels[state.role]) + '».</div>');
    var totalBooked = filtered.reduce(function (sum, tour) { return sum + bookedCountForTour(tour); }, 0);
    var totalAvailable = filtered.reduce(function (sum, tour) { return sum + Math.max(Number(tour.capacity || 0) - bookedCountForTour(tour), 0); }, 0);
    return '<section class="screen">' + screenHeader('Туры', capabilities().canManageTour ? 'Список, создание и архив' : 'Список туров · просмотр') + '<div class="screen-scroll">' + readOnlyNote + '<div class="filter-tabs">' + Object.keys(labels).map(function (status) {
      return '<button type="button" class="' + (state.tourFilter === status ? 'active' : '') + '" data-action="tour-filter" data-filter="' + status + '">' + labels[status] + '</button>';
    }).join('') + '</div><label class="search-box">' + icon('search') + '<input data-tour-search value="' + h(state.tourQuery) + '" placeholder="Название, город или гид"></label><div class="tour-stats compact-stats"><div><span>Туров</span><strong>' + filtered.length + '</strong></div><div><span>Туристов</span><strong>' + totalBooked + '</strong></div><div><span>Свободно</span><strong>' + totalAvailable + '</strong></div></div>' + (cards || '<div class="empty-state"><strong>Туров нет</strong><span>' + h(emptyToursHint) + '</span></div>') + '</div>' + createAction + '</section>';
  }

  function tourMenuScreen(overlay) {
    var tourId = overlay.tourId || state.selectedTourId;
    if (!canViewTourId(tourId)) return '<section class="screen">' + screenHeader('Тур недоступен', 'Доступ ограничен') + '<div class="screen-scroll"><div class="empty-state error-state">' + icon('alert') + '<strong>Нет доступа к этому туру</strong><span>Метаданные и действия скрыты для текущей роли.</span></div></div></section>';
    var tour = tours.find(function (item) { return item.id === tourId; }) || (tourId === state.selectedTourId ? selectedTour() : null);
    var title = tour ? tour.name : 'Выбранный тур';
    var viewActions = '<button data-action="view-tour-info"><span>' + icon('tours') + '</span><div><strong>О туре</strong><small>Маршрут, команда и параметры</small></div><b>›</b></button>' +
      (tourHasOperationalModel(tourId) ? '<button data-action="view-tour-tasks"><span>' + icon('check') + '</span><div><strong>Задачи тура</strong><small>Операционные задачи выбранного тура</small></div><b>›</b></button>' : '');
    var manageActions = canManageTourId(tourId) && tour && !state.offline ? '<button data-action="edit-tour"><span>' + icon('settings') + '</span><div><strong>Изменить тур</strong><small>Маршрут, даты и команда</small></div><b>›</b></button><button data-action="copy-tour"><span>' + icon('tours') + '</span><div><strong>Копировать</strong><small>Создать тур с теми же настройками</small></div><b>›</b></button>' + (state.role === 'admin' ? '<button class="danger-row" data-action="archive-tour"><span>' + icon('archive') + '</span><div><strong>' + (tour.isArchived ? 'Вернуть из архива' : 'Архивировать') + '</strong><small>Только администратор</small></div><b>›</b></button>' : '') + '<button class="danger-row" data-action="' + (tour.status === 'cancelled' ? 'reopen-tour' : 'cancel-tour') + '"><span>' + icon('close') + '</span><div><strong>' + (tour.status === 'cancelled' ? 'Открыть тур снова' : 'Отменить тур') + '</strong><small>Сохранить данные и синхронизировать лиды</small></div><b>›</b></button>' : '';
    var directoryAction = '<button data-action="open-directory"><span>' + icon('pin') + '</span><div><strong>Города и точки</strong><small>' +
      (capabilities().canManageDirectory && !state.offline ? 'Аэропорты, ж/д и автовокзалы' : 'Просмотр справочника') + '</small></div><b>›</b></button>';
    var uiStatesAction = tourHasOperationalModel(tourId) ? '<button type="button" data-action="open-ui-states"><span>' + icon('alert') + '</span><div><strong>Состояния экрана</strong><small>Загрузка, сохранение, ошибка и пустой список</small></div><b>›</b></button>' : '';
    var readOnlyNote = manageActions ? '' : '<div class="form-note">' + (state.offline ? 'Нет подключения. Управляющие действия временно недоступны.' : 'Режим просмотра. Управляющие действия для этого тура недоступны.') + '</div>';
    return '<section class="screen">' + screenHeader('Действия с туром', title) + '<div class="screen-scroll">' + readOnlyNote + '<div class="action-menu">' + viewActions + manageActions + directoryAction + uiStatesAction + '</div></div></section>';
  }

  function unavailableTouristScreen() {
    return '<section class="screen">' + screenHeader('Карточка недоступна', 'Доступ ограничен') + '<div class="screen-scroll"><div class="empty-state error-state">' + icon('alert') + '<strong>Не удалось открыть туриста</strong><span>Турист не относится к выбранному доступному туру. Персональные данные скрыты.</span></div></div></section>';
  }

  function touristDetailScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    if (!canViewTouristForSelectedTour(tourist) || !canViewGuideOperationalTourist(tourist)) return unavailableTouristScreen();
    var personal = personalReadiness(tourist);
    var documents = documentReadiness(tourist);
    var domestic = documents.domestic;
    var foreign = documents.foreign;
    var expanded = overlay.expanded || new Set();
    var capability = capabilities();
    var canSeePrivate = canSeePrivateFor(tourist);
    var limitedPrivacy = state.role === 'viewer' || state.role === 'escort';
    var operationalOnly = state.role === 'manager' && !canSeePrivate;
    var restrictedContext = limitedPrivacy || operationalOnly;
    var detailTab = overlay.detailTab || 'profile';

    function profileValue(label, value, privateField) {
      if (privateField && !canSeePrivate) return '';
      return '<div class="profile-value"><span>' + h(label) + '</span><strong>' + h(value || 'Не заполнено') + '</strong></div>';
    }

    function section(id, title, status, content, editable) {
      var open = expanded.has(id);
      return '<article class="profile-section ' + (open ? 'open' : '') + '"><button type="button" class="profile-section-head" data-action="toggle-profile-section" data-section="' + id + '"><span><strong>' + h(title) + '</strong><small>' + h(status) + '</small></span><b>⌄</b></button>' + (open ? '<div class="profile-section-body">' + content + (editable && canEditProfileFor(tourist) && !state.offline ? '<button type="button" class="secondary-button full-button" data-action="edit-profile-section" data-id="' + tourist.id + '" data-section="' + id + '">' + icon('edit') + 'Изменить раздел</button>' : '') + '</div>' : '') + '</article>';
    }

    var personalContent = limitedPrivacy ?
      profileValue('Имя для отображения', tourist.name) + profileValue('Дата рождения', tourist.birthDate) + profileValue('Телефон', tourist.phone) :
      profileValue('Фамилия', tourist.lastName) + profileValue('Имя', tourist.firstName) + profileValue('Отчество', tourist.middleName) + profileValue('Дата рождения', tourist.birthDate) + profileValue('Email', tourist.email, true) + profileValue('Телефон', tourist.phone);
    var citizenshipContent = profileValue('Гражданство', tourist.citizenship);
    var domesticContent = tourist.citizenship !== 'Россия' ? '<div class="form-note">Для гражданина другой страны блок паспорта РФ не применяется. Ранее сохранённые значения прототип не удаляет.</div>' : profileValue('Серия и номер', tourist.domesticPassport) + profileValue('Кем выдан', tourist.domesticIssuedBy) + profileValue('Адрес регистрации', tourist.registrationAddress);
    var scans = (tourist.scans || []).map(function (scan) {
      return '<div class="scan-row"><span>' + icon('document') + '</span><span><strong>' + h(scan.name) + '</strong><small>Скан загранпаспорта · mock</small></span><button type="button" data-action="view-scan" data-id="' + tourist.id + '" data-scan="' + scan.id + '" aria-label="Посмотреть скан">' + icon('eye') + '</button></div>';
    }).join('');
    var documentActions = canManageDocumentsFor(tourist) && !state.offline ? '<div class="document-actions"><button type="button" data-action="add-scan" data-id="' + tourist.id + '">' + icon('camera') + '<span>Сфотографировать</span></button><button type="button" data-action="upload-scan" data-id="' + tourist.id + '">' + icon('upload') + '<span>Выбрать файл</span></button><button type="button" data-action="open-ocr-review" data-id="' + tourist.id + '">' + icon('document') + '<span>Запустить OCR</span></button></div>' : '';
    var foreignContent = profileValue('ФИО латиницей', tourist.latinName) + profileValue('Номер', tourist.passport) + profileValue('Годен до', tourist.passportExpiry) + (scans || '<div class="empty-inline">Сканы не загружены</div>') + documentActions;
    var guideMockDetail = usesGuideOperationalMock();
    var allowedRouteCities = guideMockDetail ? guideOperationalTouristRoute(tourist) : (limitedPrivacy ? visibleRouteCities() : cities).filter(function (city) { return tourist.route.indexOf(city.id) !== -1; });
    var logisticsContent = allowedRouteCities.map(function (city, allowedIndex) {
      var routePosition = guideMockDetail ? guideOperationalRouteCities().indexOf(city) : cities.indexOf(city);
      var rows = ['arrival', 'hotel', 'departure'].map(function (stage) {
        if (guideMockDetail) {
          var guideStatus = guideTouristStageState(tourist, city, stage);
          var guideStageLabel = stage === 'arrival' ? 'Встреча' : stageMeta[stage].tab;
          return '<div class="profile-operation guide-profile-operation"><span><strong>' + h(guideStageLabel) + '</strong><small>' + h(guideStatus.summary) + '</small></span><span><em>Задача гида</em><small>' + h(guideStatus.label) + '</small></span><b>' + (guideStatus.completed ? '✓' : '•') + '</b></div>';
        }
        var own = ownRecordAt(city.id, stage, tourist.id);
        var effective = effectiveRecordAt(city.id, stage, tourist.id);
        var origin = operationOriginAt(city.id, stage, tourist.id);
        var ownDiffers = origin.kind === 'shared' && recordSummary(own, stage) !== recordSummary(effective, stage);
        var canEditOwn = origin.kind === 'shared' && origin.source && origin.source.id !== tourist.id && canEditLogisticsForAt(tourist, city.id) && !state.offline;
        var ownAction = canEditOwn ? '<button type="button" class="text-button" data-action="edit-own-operation" data-id="' + tourist.id + '" data-route-city-id="' + city.id + '" data-stage="' + stage + '">Изменить личную запись</button>' : '';
        return '<button type="button" class="profile-operation" data-action="jump-profile-operation" data-id="' + tourist.id + '" data-route-city-id="' + city.id + '" data-stage="' + stage + '"><span><strong>' + h(stageMeta[stage].tab) + '</strong><small>' + h(recordSummary(effective, stage)) + '</small></span><span><em>' + h(origin.label) + '</em>' + (ownDiffers ? '<small>Личная: ' + h(recordSummary(own, stage)) + '</small>' : '') + '</span><b>›</b></button>' + ownAction;
      }).join('');
      return '<section class="route-city-card"><div><strong>' + h(guideMockDetail ? city.name : cityLabel(city)) + '</strong><span>' + h(city.dates) + ' · остановка ' + (routePosition >= 0 ? routePosition + 1 : allowedIndex + 1) + '</span></div>' + rows + '</section>';
    }).join('');
    var settingsContent = limitedPrivacy ? profileValue('Тип туриста', tourist.type) :
      profileValue('Тип туриста', tourist.type) + profileValue('Основной турист в лиде', tourist.isPrimary ? 'Да' : 'Нет') + profileValue('Примечание', tourist.notes, true);
    var routeContextLabel = allowedRouteCities.map(function (city) { return guideMockDetail ? city.name : cityLabel(city); }).join(' → ') || 'Нет доступных остановок';
    var tourContextContent = profileValue('Комментарий для гида', tourist.guideComment) +
      (restrictedContext ? '' : profileValue('Исходный лид', tourist.lead) + profileValue('Статус лида', tourist.leadStatus)) +
      profileValue('Выбранный тур', selectedTourName()) +
      profileValue('Статус участия', tourist.tourStatus) +
      profileValue('Группа туристов', globalGroupLabel(tourist)) +
      (restrictedContext ? '' : profileValue('Представитель группы', tourist.groupRepresentative ? 'Да' : 'Нет') + profileValue('Основной турист заявки', tourist.isPrimary ? 'Да' : 'Нет')) +
      profileValue('Ограниченный маршрут', routeContextLabel) +
      (canSeeSourceLeadFor(tourist) ? '<button type="button" class="secondary-button full-button" data-action="open-source-lead" data-id="' + tourist.leadId + '">Открыть исходный лид</button>' : '');
    var attentionCount = Number(!personal.ready) + Number(!limitedPrivacy && domestic.category === 'missing') + Number(foreign.category !== 'ready');
    var editButton = canEditProfileFor(tourist) && !state.offline ? '<button type="button" class="icon-button" data-action="edit-profile-section" data-id="' + tourist.id + '" data-section="personal" aria-label="Изменить личные данные">' + icon('edit') + '</button>' : '';
    var deleteButton = capability.canDelete && !state.offline ? '<button type="button" class="danger-button full-button" data-action="delete-tourist" data-id="' + tourist.id + '">Удалить туриста</button>' : '';

    var guideDetailCity = guideMockDetail ? currentGuideOperationalCity() : null;
    var statusSummary = guideMockDetail && guideDetailCity ? '<div class="selection-head"><strong>Фактические статусы</strong><span>' + h(guideDetailCity.name) + '</span></div>' + guideTouristStatusGrid(tourist, guideDetailCity) :
      (tourHasOperationalModel(state.selectedTourId) ? '<div class="selection-head"><strong>Фактические статусы</strong><span>' + h(cityLabel(currentCity())) + '</span></div><div class="status-grid"><div><span>Прибытие</span><strong>' + h(statusLabel(tourist, currentCity().id, 'arrival')) + '</strong></div><div><span>Заселение</span><strong>' + h(statusLabel(tourist, currentCity().id, 'hotel')) + '</strong></div><div><span>Отъезд</span><strong>' + h(statusLabel(tourist, currentCity().id, 'departure')) + '</strong></div></div>' : '<div class="form-note">Операционные статусы этого тура ещё не загружены.</div>');
    var detailTabs = '<div class="profile-tabs"><button type="button" class="' + (detailTab === 'profile' ? 'active' : '') + '" data-action="tourist-detail-tab" data-tab="profile">Профиль</button><button type="button" class="' + (detailTab === 'tour' ? 'active' : '') + '" data-action="tourist-detail-tab" data-tab="tour">В туре</button></div>';
    var profileSections = section('personal', 'Личные данные', personal.label, personalContent, true) +
      (limitedPrivacy ? '' : section('citizenship', 'Гражданство', tourist.citizenship || 'Не заполнено', citizenshipContent, true)) +
      (canSeePrivate ? section('domestic', 'Паспорт РФ', domestic.label, domesticContent, true) : '') +
      section('foreign', 'Загранпаспорт', foreign.label, foreignContent, true) +
      section('settings', 'Тип и настройки', tourist.type || 'Не заполнено', settingsContent, true);
    var tourSections = section('tour-context', 'Данные в туре', selectedTourName(), tourContextContent, true) + statusSummary + section('logistics', 'Маршрут и логистика', allowedRouteCities.length + ' остановки · личные и общие записи', logisticsContent, false);

    var identitySubtitle = restrictedContext ? 'Турист тура' : tourist.lead;
    var heroSubtitle = tourist.type + ' · Группа тура: ' + globalGroupLabel(tourist);
    var profileBadges = restrictedContext ? '' : '<div class="profile-badges"><span class="state-pill">Лид · ' + h(tourist.leadStatus) + '</span><span class="group-pill">Участие · ' + h(tourist.tourStatus) + '</span>' + (tourist.isPrimary ? '<span class="count-pill">Основной в лиде</span>' : '') + (tourist.groupRepresentative ? '<span class="count-pill">Основной в группе</span>' : '') + '</div>';
    var attentionDetails = [!limitedPrivacy && domestic.category === 'missing' ? domestic.label : '', foreign.category === 'missing' ? foreign.issue : ''].filter(Boolean).join(' · ');
    var profileBody = operationalOnly ? '<div class="empty-state error-state">' + icon('alert') + '<strong>Профиль недоступен</strong><span>Исходный лид не назначен текущему менеджеру. Вкладка «В туре» сохраняет доступ к операционным данным без раскрытия контактов и документов.</span></div>' :
      ((attentionCount ? '<div class="attention-card">' + icon('alert') + '<span><strong>Есть незаполненные необязательные данные</strong><small>' + h(attentionDetails) + '</small></span></div>' : '<div class="success-note">Обязательные поля профиля заполнены.</div>') + '<div class="quick-actions"><button type="button" data-action="call-tourist" data-id="' + tourist.id + '">' + icon('phone') + '<span>Позвонить</span></button><button type="button" data-action="message-tourist" data-id="' + tourist.id + '">' + icon('chat') + '<span>Написать</span></button><button type="button" data-action="copy-tourist-contact" data-id="' + tourist.id + '">' + icon('document') + '<span>Копировать</span></button></div>' + profileSections);
    var payment = canViewFinance() ? paymentPresentation(tourist) : null;
    var financeDetail = payment ? '<article class="tourist-finance-detail"><span><small>' + (payment.kind === 'due' || payment.kind === 'paid' ? 'Остаток оплаты' : 'Оплата') + '</small><strong style="color:' + h(payment.color) + '">' + h(payment.detail) + '</strong></span><em>' + h(tourist.leadStatus) + '</em></article>' : '';

    return '<section class="screen"><header class="screen-header"><button type="button" class="back-button" data-action="close-overlay" aria-label="Назад">' + icon('back') + '</button><div class="screen-title"><strong>' + h(tourist.name) + '</strong><span>' + h(identitySubtitle) + '</span></div>' + editButton + '</header>' + detailTabs + '<div class="screen-scroll profile-scroll">' + (canEditProfileFor(tourist) ? '' : roleBanner(tourist)) + '<div class="person-hero profile-hero"><span class="avatar dark">' + h(tourist.initials) + '</span><div><strong>' + h(tourist.name) + '</strong><span>' + h(heroSubtitle) + '</span></div></div>' + profileBadges + (detailTab === 'profile' ? profileBody : tourSections) + financeDetail + deleteButton + '</div></section>';
  }

  function profileEditScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    if (!canEditProfileFor(tourist)) return unavailableTouristScreen();
    var section = overlay.section;
    var title = { personal: 'Личные данные', citizenship: 'Гражданство', domestic: 'Паспорт РФ', foreign: 'Загранпаспорт', settings: 'Тип и настройки', 'tour-context': 'Данные в туре' }[section] || 'Данные туриста';
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
      controls = profileInput('Фамилия', 'lastName', tourist.lastName, 'text', true) + profileInput('Имя', 'firstName', tourist.firstName, 'text', true) + profileInput('Отчество', 'middleName', tourist.middleName) + profileInput('Дата рождения', 'birthDate', tourist.birthDate, 'date') + (canSeePrivateFor(tourist) ? profileInput('Email', 'email', tourist.email, 'email') : '') + profileInput('Телефон', 'phone', tourist.phone, 'tel');
    } else if (section === 'citizenship') {
      controls = profileSelect('Гражданство', 'citizenship', [['', 'Не указано'], 'Россия', 'Казахстан'], tourist.citizenship, false);
    } else if (section === 'domestic') {
      controls = tourist.citizenship !== 'Россия' ? '<div class="form-note">Для гражданина другой страны паспорт РФ не требуется. Сохранённые значения не удаляются.</div>' : profileInput('Серия и номер', 'domesticPassport', tourist.domesticPassport) + profileInput('Кем выдан', 'domesticIssuedBy', tourist.domesticIssuedBy) + profileInput('Адрес регистрации', 'registrationAddress', tourist.registrationAddress);
    } else if (section === 'foreign') {
      controls = profileInput('ФИО латиницей', 'latinName', tourist.latinName) + profileInput('Номер загранпаспорта', 'passport', tourist.passport) + profileInput('Годен до', 'passportExpiry', tourist.passportExpiry, 'date') + '<div class="form-note">Сканы и OCR доступны в карточке раздела. Распознанные значения применяются только после сверки.</div>';
    } else if (section === 'settings') {
      controls = profileSelect('Тип туриста', 'type', [['', 'Не указан'], 'Взрослый','Ребёнок','Младенец'], tourist.type, false) + '<label class="field"><span>Основной турист в лиде</span><select name="isPrimary"><option value="true" ' + (tourist.isPrimary ? 'selected' : '') + '>Да</option><option value="false" ' + (!tourist.isPrimary ? 'selected' : '') + '>Нет</option></select><small class="field-help">Это leadTourist.isPrimary, не основной участник группы тура.</small></label>' + (canSeePrivateFor(tourist) ? '<label class="field"><span>Примечание</span><textarea name="notes" rows="4">' + h(tourist.notes) + '</textarea></label>' : '');
    } else if (section === 'tour-context') {
      controls = '<label class="field"><span>Комментарий для гида</span><textarea name="guideComment" rows="4">' + h(tourist.guideComment) + '</textarea></label><label class="field"><span>Основной в группе тура</span><select name="groupRepresentative"><option value="true" ' + (tourist.groupRepresentative ? 'selected' : '') + '>Да</option><option value="false" ' + (!tourist.groupRepresentative ? 'selected' : '') + '>Нет</option></select><small class="field-help">Это deal.isPrimaryInGroup; флаг основного туриста в лиде не меняется.</small></label>';
    }
    return '<section class="screen"><form id="profile-section-form" class="screen-form" data-id="' + tourist.id + '" data-section="' + section + '" novalidate>' + screenHeader(title, tourist.name) + '<div class="screen-scroll"><div class="form-note">Изменения сохраняются в канонической mock-карточке туриста и видны во всех разделах прототипа.</div>' + (overlay.error ? '<div class="error-note" role="alert">' + h(overlay.error) + '</div>' : '') + controls + '</div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
  }

  function ocrReviewScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    if (!canManageDocumentsFor(tourist)) return unavailableTouristScreen();
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
    if (!canViewDocumentsFor(tourist)) return unavailableTouristScreen();
    var scan = (tourist.scans || []).find(function (item) { return item.id === overlay.scanId; });
    return '<section class="screen">' + screenHeader(scan ? scan.name : 'Скан паспорта', tourist.name) + '<div class="screen-scroll"><div class="document-preview">' + icon('document') + '<strong>Предпросмотр mock-файла</strong><span>В прототипе файл не отправляется на сервер.</span></div>' + (canManageDocumentsFor(tourist) && !state.offline ? '<button type="button" class="danger-button full-button" data-action="delete-scan" data-id="' + tourist.id + '" data-scan="' + h(overlay.scanId) + '">Удалить скан</button>' : '') + '</div></section>';
  }

  function discardProfileScreen(overlay) {
    return '<section class="screen">' + screenHeader('Закрыть без сохранения?', 'Изменения в разделе не сохранены') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Внесённые значения будут потеряны</strong><span>Вернитесь к форме или подтвердите выход.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="continue-profile-edit">Продолжить</button><button type="button" class="danger-button" data-action="discard-profile-edit">Не сохранять</button></footer></section>';
  }

  function deleteTouristScreen(overlay) {
    var tourist = touristById(overlay.touristId);
    if (!canViewTouristForSelectedTour(tourist)) return unavailableTouristScreen();
    return '<section class="screen">' + screenHeader('Удалить туриста?', tourist ? tourist.name : 'Турист') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Карточка будет удалена из mock-тура</strong><span>Операционные связи этого туриста будут сняты. Действие доступно только администратору.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="danger-button" data-action="confirm-delete-tourist" data-id="' + h(overlay.touristId) + '">Удалить</button></footer></section>';
  }

  function bulkTouristsScreen(overlay) {
    var rows = currentTourists().map(function (tourist) {
      return selectionRow(tourist, overlay.selected.has(tourist.id), (hasRestrictedTouristPrivacy(tourist) ? tourist.type : tourist.lead) + ' · ' + globalGroupLabel(tourist));
    }).join('');
    var bulkActions = [];
    if (capabilities().canExport && !state.offline) bulkActions.push('<button type="button" class="secondary-button" data-action="export-summary">Экспорт</button>');
    if (capabilities().canGroup && !state.offline) bulkActions.push('<button type="button" class="primary-button blue" data-action="bulk-group" ' + (overlay.selected.size > 1 ? '' : 'disabled') + '>Создать группу</button>');
    var footer = bulkActions.length ? '<footer class="screen-actions">' + bulkActions.join('') + '</footer>' : '';
    var note = bulkActions.length ? '<div class="warning">Доступные действия зависят от роли в выбранном туре.</div>' : '<div class="form-note">Режим просмотра. Экспорт и создание групп недоступны для этой роли.</div>';
    return '<section class="screen">' + screenHeader('Массовые действия', 'Туристы текущего тура') + '<div class="screen-scroll"><div class="selection-head"><strong>Выбрано ' + overlay.selected.size + '</strong><button type="button" class="text-button" data-action="select-all">Выбрать всех</button></div>' + rows + note + '</div>' + footer + '</section>';
  }

  function scopeSelectScreen() {
    if (hasLimitedTouristPrivacy()) return '<section class="screen">' + screenHeader('Фильтр недоступен', 'Исходные лиды скрыты') + '<div class="screen-scroll"><div class="empty-state error-state">' + icon('alert') + '<strong>Нет доступа к лидам</strong><span>Вернитесь к полному составу тура.</span></div></div></section>';
    var seen = {};
    var tourMembers = currentTourists().filter(canSeeSourceLeadFor);
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

  function guideOperationalCityPickerScreen() {
    var current = currentGuideOperationalCity();
    var mock = guideOperationalMock();
    var rows = guideOperationalRouteCities().map(function (city, index) {
      var routeMock = mock && mock.route[city.id];
      var counts = ['arrival', 'hotel', 'departure'].map(function (stage) {
        return (stage === 'arrival' ? 'Встреча' : stageMeta[stage].tab) + ' ' + ((routeMock && routeMock[stage] || []).length);
      }).join(' · ');
      return '<button type="button" class="route-stop ' + (current && current.id === city.id ? 'active' : '') + '" data-action="select-guide-city" data-city="' + h(city.id) + '"><span class="route-stop-index">' + (index + 1) + '</span><span><strong>' + h(city.name) + '</strong><small>' + h(city.dates) + '</small><em>' + h(counts) + '</em></span><b>' + (current && current.id === city.id ? icon('check') : '›') + '</b></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Выберите город', 'Задачи гида по маршруту') + '<div class="screen-scroll"><div class="form-note">Каждая остановка хранит свои встречи, размещение и отъезд.</div>' + rows + '</div></section>';
  }

  function financeCityPickerScreen() {
    var activeCity = normalizeFinanceRouteCity();
    var rows = financeRouteCities().map(function (city, index) {
      var members = currentTourists().filter(function (tourist) { return tourist.route.indexOf(city.id) !== -1; });
      var applications = new Set(members.map(function (tourist) {
        return tourist.leadId || tourist.contactLeadId || tourist.groupId || tourist.dealId || tourist.id;
      })).size;
      var active = activeCity && activeCity.id === city.id;
      var detail = touristCount(members.length) + ' · ' + applications + ' ' + (applications === 1 ? 'заявка' : (applications >= 2 && applications <= 4 ? 'заявки' : 'заявок'));
      return '<button type="button" class="route-stop ' + (active ? 'active' : '') + '" data-action="select-finance-city" data-route-city-id="' + h(city.id) + '"><span class="route-stop-index">' +
        (index + 1) + '</span><span><strong>' + h(financeCityLabel(city)) + '</strong><small>' + h(city.dates || selectedTour().dates || '') + '</small><em>' + h(detail) + '</em></span><b>' +
        (active ? icon('check') : '›') + '</b></button>';
    }).join('');
    return '<section class="screen">' + screenHeader('Выберите город', 'Финансы выбранной позиции маршрута') + '<div class="screen-scroll"><div class="form-note">Суммы и заявки пересчитываются только по туристам, которые едут через выбранную позицию маршрута.</div>' +
      (rows || '<div class="empty-state"><strong>Маршрут не указан</strong><span>Добавьте позиции маршрута в карточке тура.</span></div>') + '</div></section>';
  }

  function roleMenuScreen() {
    var rows = ['admin', 'manager', 'escort', 'viewer'].map(function (role) {
      return '<button type="button" class="source-card ' + (state.role === role ? 'active' : '') + '" data-action="select-role" data-role="' + role + '"><span class="radio"></span><span class="member-copy"><strong>' + h(roleLabels[role]) + '</strong><span>' + h(role === 'admin' ? 'Все действия и удаление' : role === 'manager' ? 'Профиль, логистика и группы' : role === 'escort' ? 'Read-only профиль, статусы всего тура' : 'Read-only профиль, статусы назначенных городов') + '</span></span></button>';
    }).join('');
    var uiStatesAction = tourHasOperationalModel(state.selectedTourId) ? '<button type="button" data-action="open-ui-states">' + icon('alert') + '<span><strong>Состояния экрана</strong><small>Loading, saving, error и empty</small></span></button>' : '';
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay" aria-label="Закрыть"></button><section class="sheet"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>Роль просмотра</strong><span>Mock capability-сценарий</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll">' + rows + '<div class="system-tools"><button type="button" data-action="toggle-offline">' + icon('wifiOff') + '<span><strong>' + (state.offline ? 'Вернуть подключение' : 'Показать offline') + '</strong><small>Проверить запрет записи</small></span></button>' + uiStatesAction + '</div></div></section></div>';
  }

  function touristFiltersScreen() {
    var types = ['all', 'Взрослый', 'Ребёнок', 'Младенец'];
    var groups = [['all','Все'],['grouped','В группе'],['free','Без группы']];
    var statuses = [['all', 'Все']].concat(Object.keys(statusLabels[state.stage]).map(function (status) { return [status, statusLabels[state.stage][status]]; }));
    var debtFilter = canViewFinance() ? '<button type="button" class="' + (state.touristFilters.debt ? 'active' : '') + '" data-action="toggle-tourist-filter" data-filter="debt"><span class="check">' + icon('check') + '</span><span><strong>С долгом</strong><small>Показывает плательщиков с непогашенным остатком</small></span></button>' : '';
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><section class="sheet"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>Фильтры туристов</strong><span>Текущий тур · ' + h(cityLabel(currentCity())) + '</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll"><div class="filter-toggle-list"><button type="button" class="' + (state.touristFilters.needsData ? 'active' : '') + '" data-action="toggle-tourist-filter" data-filter="needsData"><span class="check">' + icon('check') + '</span><span><strong>Не заполнены данные</strong><small>ФИО, дата рождения и обязательные контакты</small></span></button><button type="button" class="' + (state.touristFilters.documentIssue ? 'active' : '') + '" data-action="toggle-tourist-filter" data-filter="documentIssue"><span class="check">' + icon('check') + '</span><span><strong>Проблема с документами</strong><small>Не заполнено или скоро истекает</small></span></button><button type="button" class="' + (state.touristFilters.limitedRoute ? 'active' : '') + '" data-action="toggle-tourist-filter" data-filter="limitedRoute"><span class="check">' + icon('check') + '</span><span><strong>Ограниченный маршрут</strong><small>Турист едет не по всем остановкам тура</small></span></button>' + debtFilter + '</div><div class="selection-head"><strong>Тип туриста</strong></div><div class="choice-chips">' + types.map(function (type) { return '<button type="button" class="' + (state.touristFilters.type === type ? 'active' : '') + '" data-action="set-type-filter" data-type="' + type + '">' + (type === 'all' ? 'Все' : type) + '</button>'; }).join('') + '</div><div class="selection-head"><strong>Группа тура</strong></div><div class="choice-chips">' + groups.map(function (group) { return '<button type="button" class="' + (state.touristFilters.group === group[0] ? 'active' : '') + '" data-action="set-group-filter" data-group="' + group[0] + '">' + group[1] + '</button>'; }).join('') + '</div><div class="selection-head"><strong>Статус · ' + h(stageMeta[state.stage].tab) + '</strong></div><div class="choice-chips">' + statuses.map(function (status) { return '<button type="button" class="' + (state.touristFilters.status === status[0] ? 'active' : '') + '" data-action="set-status-filter" data-status="' + status[0] + '">' + h(status[1]) + '</button>'; }).join('') + '</div></div><footer class="sheet-actions"><button type="button" class="secondary-button" data-action="reset-tourist-filters">Сбросить</button><button type="button" class="primary-button blue" data-action="close-overlay">Показать</button></footer></section></div>';
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
    return '<section class="screen">' + screenHeader('Состояния интерфейса', 'Проверка без production API') + '<div class="screen-scroll"><div class="action-menu"><button data-action="set-ui-state" data-state="loading"><span>' + icon('more') + '</span><div><strong>Загрузка</strong><small>Секционные skeleton-карточки</small></div><b>›</b></button><button data-action="set-ui-state" data-state="error"><span>' + icon('alert') + '</span><div><strong>Ошибка загрузки</strong><small>Сообщение и действие «Повторить»</small></div><b>›</b></button><button data-action="set-ui-state" data-state="saving"><span>' + icon('more') + '</span><div><strong>Сохранение</strong><small>Наглядная блокировка повторной отправки</small></div><b>›</b></button><button data-action="set-ui-state" data-state="save-error"><span>' + icon('alert') + '</span><div><strong>Ошибка сохранения</strong><small>Черновик и выбор не теряются</small></div><b>›</b></button><button data-action="set-ui-state" data-state="empty"><span>' + icon('users') + '</span><div><strong>Пустой тур</strong><small>Объяснение и следующий шаг</small></div><b>›</b></button><button data-action="set-ui-state" data-state="ready"><span>' + icon('success') + '</span><div><strong>Рабочее состояние</strong><small>Вернуть mock-данные</small></div><b>›</b></button></div></div></section>';
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
    var day = programDays[overlay.index];
    if (!day) return '';
    var cityOptions = cities.map(function (city, index) {
      return '<option value="' + index + '" ' + (Number(day.cityIdx) === index ? 'selected' : '') + '>' + h(cityLabel(city)) + '</option>';
    }).join('');
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><form id="program-form" class="sheet" data-index="' + overlay.index + '"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>День ' + h(day.dayNumber) + '</strong><span>День и дата заданы границами тура</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll"><div class="readonly-field"><span>Номер дня</span><strong>' + h(day.dayNumber) + '</strong></div><div class="readonly-field"><span>Дата</span><strong>' + h(formatProgramDate(day.date)) + '</strong></div><label class="field"><span>Город маршрута</span><select name="cityIdx">' + cityOptions + '</select><small class="field-help">Сохраняется cityIdx конкретной позиции, а не только название.</small></label><label class="field"><span>Описание</span><textarea name="description" rows="7" placeholder="Программа дня">' + h(day.description) + '</textarea></label><div class="template-actions"><button type="button" class="secondary-button" data-action="apply-program-template">Подставить шаблон</button><button type="button" class="secondary-button" data-action="save-program-template">Сохранить как шаблон</button></div><div class="form-note">Шаблон меняет только описание. День и дата не создаются и не удаляются вручную.</div></div><footer class="sheet-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></div>';
  }

  function regenerateProgramScreen() {
    return '<section class="screen">' + screenHeader('Пересоздать программу?', 'Каркас будет сверен с датами и маршрутом') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Обновить дни по туру</strong><span>Сохранённые описания останутся у тех же дат и cityIdx. Новые дни получат понятный шаблон.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="primary-button blue" data-action="confirm-regenerate-program">Пересоздать</button></footer></section>';
  }

  function tourFormScreen(overlay) {
    var tour = overlay.tourId ? tours.find(function (item) { return item.id === overlay.tourId; }) : null;
    var item = tour || { name: '', description: '', site: '', country: 'Китай', tourType: 'group', startDate: '', endDate: '', capacity: 12, price: '0', priceCurrency: 'RUB', color: '#2f6bd8', escortUserId: '', chatAdminIds: [''], cityGuides: {}, financeGuideCityId: null };
    if (!overlay.routeDraft) overlay.routeDraft = tour && tour.id === 'china' ? cities.map(function (city) { return { id: city.id, name: city.name }; }) : (item.cities || ['']).map(function (name, index) { return { id: 'route-draft-' + index, name: name }; });
    if (!overlay.routeGuideIds) overlay.routeGuideIds = Object.assign({}, item.cityGuides || {});
    if (overlay.financeGuideCityId === undefined) overlay.financeGuideCityId = item.financeGuideCityId || null;
    if (!overlay.chatAdminIds) overlay.chatAdminIds = (item.chatAdminIds || ['']).slice();
    var selectedEscortId = item.escortUserId || ((userDirectory.find(function (user) {
      return user.name === item.escort && user.roles.indexOf('escort') !== -1;
    }) || {}).id || '');
    var routeRows = overlay.routeDraft.map(function (routeCity, index) {
      return '<div class="route-form-row"><input type="hidden" name="routeCityId" value="' + h(routeCity.id) + '"><input name="routeCityName" data-route-index="' + index + '" value="' + h(routeCity.name) + '" placeholder="Город ' + (index + 1) + '"><div><button type="button" data-action="route-up" data-index="' + index + '" ' + (index === 0 ? 'disabled' : '') + '>↑</button><button type="button" data-action="route-down" data-index="' + index + '" ' + (index === overlay.routeDraft.length - 1 ? 'disabled' : '') + '>↓</button><button type="button" data-action="route-remove" data-index="' + index + '" ' + (overlay.routeDraft.length === 1 ? 'disabled' : '') + '>×</button></div></div>';
    }).join('');
    var guideRows = overlay.routeDraft.map(function (routeCity, index) {
      var selectedGuideId = overlay.routeGuideIds[routeCity.id] || '';
      return '<div class="guide-form-row"><span><strong>' + h(routeCity.name || 'Город ' + (index + 1)) + '</strong><small>Гид города · routeCityId</small></span><input type="search" data-user-search="guide-' + h(routeCity.id) + '" placeholder="Найти гида…" aria-label="Поиск гида"><select id="guide-' + h(routeCity.id) + '" name="cityGuide" data-route-guide-id="' + h(routeCity.id) + '">' + userOptions('viewer', selectedGuideId) + '</select><label><input type="radio" name="financeGuideCityId" value="' + h(routeCity.id) + '" ' + (overlay.financeGuideCityId === routeCity.id ? 'checked' : '') + '> Сбор оплаты</label></div>';
    }).join('');
    var chatRows = overlay.chatAdminIds.map(function (adminId, index) {
      return '<div class="chat-admin-row"><div><input type="search" data-user-search="chat-admin-' + index + '" placeholder="Найти администра…" aria-label="Поиск администра"><select id="chat-admin-' + index + '" name="chatAdmin" data-chat-index="' + index + '">' + userOptions('chat_admin', adminId) + '</select></div><button type="button" data-action="remove-chat-admin" data-index="' + index + '" ' + (overlay.chatAdminIds.length === 1 ? 'disabled' : '') + '>×</button></div>';
    }).join('');
    var lifecycle = tour ? '<div class="tour-lifecycle">' + ((state.role === 'admin' || state.role === 'manager') ? '<button type="button" class="danger-button" data-action="' + (tour.status === 'cancelled' ? 'reopen-tour' : 'cancel-tour') + '">' + (tour.status === 'cancelled' ? 'Открыть снова' : 'Закрыть тур') + '</button>' : '') + (state.role === 'admin' && tour.status !== 'cancelled' ? '<button type="button" class="secondary-button" data-action="archive-tour">' + (tour.isArchived ? 'Вернуть из архива' : 'Архивировать') + '</button>' : '') + '</div>' : '';
    return '<section class="screen"><form id="tour-form" class="screen-form" data-id="' + h(tour ? tour.id : '') + '">' + screenHeader(tour ? 'Изменить тур' : 'Новый тур', 'Порядок полей совпадает с веб-версией') + '<div class="screen-scroll">' + simpleField('Название *', 'name', item.name) + '<label class="field"><span>Описание</span><textarea name="description" rows="4">' + h(item.description || '') + '</textarea></label>' + simpleField('Страница тура', 'site', item.site, 'url', 'https://example.com/tour/...') + '<div class="field-grid"><label class="field"><span>Страна *</span><select name="country"><option ' + (item.country === 'Китай' ? 'selected' : '') + '>Китай</option><option ' + (item.country === 'Япония' ? 'selected' : '') + '>Япония</option><option ' + (item.country === 'Италия' ? 'selected' : '') + '>Италия</option></select></label><label class="field"><span>Тип тура *</span><select name="tourType"><option value="group" ' + (item.tourType === 'group' ? 'selected' : '') + '>Групповой</option><option value="individual" ' + (item.tourType === 'individual' ? 'selected' : '') + '>Индивидуальный</option><option value="excursion">Экскурсия</option><option value="transfer">Трансфер</option></select></label></div><div class="field"><span>Города маршрута *</span><div class="route-form-list">' + routeRows + '</div><button type="button" class="secondary-button full-button" data-action="route-add">' + icon('plus') + 'Добавить город</button><small class="field-help">Порядок сохраняет отдельный routeCityId, в том числе для повторяющихся городов.</small></div><div class="field"><span>Назначение гидов по городам</span><div class="guide-form-list">' + guideRows + '</div></div><label class="field"><span>Сопровождающий</span><input type="search" data-user-search="escort-user" placeholder="Найти сопровождающего…" aria-label="Поиск сопровождающего"><select id="escort-user" name="escort">' + userOptions('escort', selectedEscortId) + '</select></label><div class="field"><span>Администраторы чата</span>' + chatRows + '<button type="button" class="secondary-button" data-action="add-chat-admin">' + icon('plus') + 'Добавить администратора</button></div><div class="field-grid">' + simpleField('Дата начала *', 'startDate', item.startDate, 'date') + simpleField('Дата окончания *', 'endDate', item.endDate, 'date') + '</div><div class="field-grid">' + simpleField('Лимит участников *', 'capacity', item.capacity, 'number') + '<div class="field"><span>Базовая цена *</span><div class="price-row"><input name="price" type="number" value="' + h(item.price || '0') + '"><select name="priceCurrency"><option ' + (item.priceCurrency === 'RUB' ? 'selected' : '') + '>RUB</option><option>USD</option><option>EUR</option><option>CNY</option></select></div></div></div>' + simpleField('Цвет', 'color', item.color, 'color') + lifecycle + '</div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">Сохранить</button></footer></form></section>';
  }

  function taskFormScreen(overlay) {
    var task = overlay.taskId ? tourTasks.find(function (item) { return item.id === overlay.taskId; }) : null;
    var item = task || { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };
    return '<div class="sheet-layer"><button type="button" class="scrim" data-action="close-overlay"></button><form id="tour-task-form" class="sheet" data-id="' + h(task ? task.id : '') + '"><span class="sheet-handle"></span><header class="sheet-head"><div class="screen-title"><strong>' + (task ? 'Изменить задачу' : 'Новая задача') + '</strong><span>' + h(selectedTourName()) + '</span></div><button type="button" class="close-button" data-action="close-overlay">' + icon('close') + '</button></header><div class="sheet-scroll">' + simpleField('Название *', 'title', item.title, 'text', 'Что нужно сделать') + '<label class="field"><span>Описание</span><textarea name="description" rows="4">' + h(item.description) + '</textarea></label><div class="field-grid"><label class="field"><span>Приоритет</span><select name="priority"><option value="low" ' + (item.priority === 'low' ? 'selected' : '') + '>Низкий</option><option value="medium" ' + (item.priority === 'medium' ? 'selected' : '') + '>Средний</option><option value="high" ' + (item.priority === 'high' ? 'selected' : '') + '>Высокий</option><option value="urgent" ' + (item.priority === 'urgent' ? 'selected' : '') + '>Срочный</option></select></label>' + (task ? '<label class="field"><span>Статус</span><select name="status"><option value="todo" ' + (item.status === 'todo' ? 'selected' : '') + '>К выполнению</option><option value="in_progress" ' + (item.status === 'in_progress' ? 'selected' : '') + '>В работе</option><option value="done" ' + (item.status === 'done' ? 'selected' : '') + '>Готово</option></select></label>' : '') + '</div>' + simpleField('Срок', 'dueDate', item.dueDate, 'date') + (task ? '<button type="button" class="danger-button full-button" data-action="delete-tour-task" data-id="' + h(task.id) + '">Удалить задачу</button>' : '') + '</div><footer class="sheet-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="submit" class="primary-button blue">' + (task ? 'Сохранить' : 'Создать задачу') + '</button></footer></form></div>';
  }

  function taskDeleteScreen(overlay) {
    var task = tourTasks.find(function (item) { return item.id === overlay.taskId; });
    return '<section class="screen">' + screenHeader('Удалить задачу', task ? task.title : 'Задача') + '<div class="screen-scroll"><div class="conflict-summary"><strong>Удалить задачу?</strong><span>Это действие нельзя отменить в mock-сценарии.</span></div></div><footer class="screen-actions"><button type="button" class="secondary-button" data-action="close-overlay">Отмена</button><button type="button" class="danger-button" data-action="confirm-delete-tour-task" data-id="' + h(overlay.taskId) + '">Удалить</button></footer></section>';
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
    if (overlay.kind === 'guide-city-picker') return guideOperationalCityPickerScreen();
    if (overlay.kind === 'finance-city-picker') return financeCityPickerScreen();
    if (overlay.kind === 'role-menu') return roleMenuScreen();
    if (overlay.kind === 'tourist-filters') return touristFiltersScreen();
    if (overlay.kind === 'status-menu') return statusMenuScreen(overlay);
    if (overlay.kind === 'ui-states') return uiStatesScreen();
    if (overlay.kind === 'clear-program') return clearProgramScreen();
    if (overlay.kind === 'regenerate-program') return regenerateProgramScreen();
    if (overlay.kind === 'cancel-tour') return cancelTourScreen(overlay);
    if (overlay.kind === 'program-form') return programFormScreen(overlay);
    if (overlay.kind === 'tour-form') return tourFormScreen(overlay);
    if (overlay.kind === 'task-form') return taskFormScreen(overlay);
    if (overlay.kind === 'task-delete') return taskDeleteScreen(overlay);
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
    normalizeGuideOperationalCity();
    if (state.view === 'finance' && !canViewFinance()) state.view = (state.role === 'viewer' || state.role === 'escort') ? 'operations' : 'tour-info';
    var views = {
      operations: operationsView,
      tourists: touristsView,
      documents: documentsView,
      work: workView,
      program: programView,
      'tour-info': tourInfoView,
      'tour-team': tourTeamView,
      'tour-tasks': tourTasksView,
      'tour-actions': tourActionsView,
      finance: financeView,
      chats: chatsView
    };
    var tourVisible = canViewSelectedTour();
    var nonOperationalViews = ['tour-info', 'tour-team', 'tour-actions', 'finance'];
    var guideMockViews = { operations: guideOperationalView, program: guideOperationalProgramView, tourists: guideOperationalTouristsView };
    var guideMockView = guideMockViews[state.view];
    var view = state.view === 'chats' ? chatsView : (!tourVisible ? unauthorizedTourView : (tourHasOperationalModel(state.selectedTourId) ? (views[state.view] || tourInfoView) :
      (usesGuideOperationalMock() && guideMockView ? guideMockView :
        (nonOperationalViews.indexOf(state.view) !== -1 ? (views[state.view] || tourInfoView) : unsupportedTourView))));
    var overlaySafeWithoutTour = state.overlay && ['role-menu', 'tours'].indexOf(state.overlay.kind) !== -1;
    root.innerHTML = '<div class="app">' + view() +
      bottomNav() + (tourVisible || overlaySafeWithoutTour ? renderOverlay() : '') + (state.toast ? '<div class="toast ' + h(state.toastKind) + '" role="status" aria-live="polite">' + icon(state.toastKind === 'error' ? 'alert' : 'success') + '<span>' + h(state.toast) + '</span></div>' : '') + '</div>';
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
    var priorTourGroupId = tourist.groupId;
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
    canonicalTouristStore = tourists;
    normalizeTourGroupRepresentative(priorTourGroupId);
    if (tourist.isPrimary) {
      var replacement = tourists.find(function (item) { return item.leadId === tourist.leadId; });
      if (replacement) replacement.isPrimary = true;
    }
    saveCanonicalTourists();
  }

  function sameNonEmptyTourGroup(memberIds) {
    var ids = Array.from(new Set(memberIds || []));
    if (ids.length < 2) return null;
    var first = touristById(ids[0]);
    var groupId = first && first.groupId;
    if (!groupId) return null;
    return ids.every(function (id) {
      var tourist = touristById(id);
      return tourist && tourist.tourId === state.selectedTourId && tourist.groupId === groupId;
    }) ? groupId : null;
  }

  function copyDepartureToNextArrival(touristId, routeCityId) {
    var tourist = touristById(touristId);
    if (!tourist) return;
    var touristRouteIndex = tourist.route.indexOf(routeCityId);
    var nextRouteCityId = touristRouteIndex >= 0 ? tourist.route[touristRouteIndex + 1] : null;
    var nextCity = cities.find(function (city) { return city.id === nextRouteCityId; });
    if (!nextCity) return;
    var departure = records[routeCityId].departure[touristId];
    if (!departure) return;
    var arrival = records[nextCity.id].arrival[touristId] || {};
    var map = { date: 'date', time: 'time', transport: 'transport', number: 'number', point: 'point', transfer: 'transfer' };
    Object.keys(map).forEach(function (departureKey) {
      var arrivalKey = map[departureKey];
      if (!arrival[arrivalKey] && departure[departureKey]) arrival[arrivalKey] = departure[departureKey];
    });
    if (!arrival.pointId && departure.point) {
      // Directory points belong to one city. Preserve the copied web string,
      // but do not retain an incompatible foreign-city reference.
      arrival.pointId = '';
      arrival.pointManual = true;
    }
    records[nextCity.id].arrival[touristId] = cleanRecord(arrival, 'arrival');
  }

  function applyStageRecord(memberIds, stage, values, existingGroupId, requestedMasterId) {
    memberIds = Array.from(new Set(memberIds));
    if (!canMutateLogisticsFor(memberIds)) return false;
    var parentGroupId = memberIds.length > 1 ? sameNonEmptyTourGroup(memberIds) : null;
    if (memberIds.length > 1 && !parentGroupId) {
      showToast('Общая операция возможна только внутри одной группы туристов', 'error');
      return false;
    }
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
      existingGroup.createdFromGroupId = parentGroupId;
      // Selecting an existing individual record as the shared source must not
      // rewrite it just to normalize optional metadata (for example,
      // `pointManual: false`). Persist only an actual field-level change.
      if (!target[existingSourceId] || recordKey(target[existingSourceId], stage) !== recordKey(values, stage)) {
        target[existingSourceId] = cleanRecord(values, stage);
      }
      syncOperationGroup(existingGroup, currentCity().id, stage);
      if (stage === 'departure') copyDepartureToNextArrival(existingSourceId, currentCity().id);
    } else if (memberIds.length === 1) {
      detachMembersFromStage(stage, memberIds);
      target[memberIds[0]] = cleanRecord(values, stage);
      if (stage === 'departure') copyDepartureToNextArrival(memberIds[0], currentCity().id);
    } else {
      detachMembersFromStage(stage, memberIds);
      var masterId = memberIds.indexOf(requestedMasterId) !== -1 ? requestedMasterId : memberIds[0];
      var groupId = newGroupId(stage);
      if (!target[masterId] || recordKey(target[masterId], stage) !== recordKey(values, stage)) {
        target[masterId] = cleanRecord(values, stage);
      }
      groups[groupId] = syncOperationGroup({ id: groupId, subgroupId: groupId, masterId: masterId, sourceId: masterId, createdFromGroupId: parentGroupId, idempotencyKey: idempotencyKey, members: memberIds.slice() }, currentCity().id, stage);
      if (stage === 'departure') copyDepartureToNextArrival(masterId, currentCity().id);
    }
    return true;
  }

  function commitTouristGrouping(pendingGroup) {
    var memberIds = pendingGroup.allMemberIds.slice();
    var members = memberIds.map(touristById);
    if (members.some(function (tourist) { return !tourist || tourist.tourId !== state.selectedTourId; })) return false;
    var snapshot = {
      touristGroups: currentTourists().map(function (tourist) { return { id: tourist.id, groupId: tourist.groupId, groupRepresentative: tourist.groupRepresentative }; }),
      records: clone(records),
      operationGroups: clone(operationGroups),
      groupNames: clone(groupNames),
      tourGroupSettings: clone(tourGroupSettings),
      cityIndex: state.cityIndex
    };
    try {
      pendingGroup.selectedIds.map(touristById).forEach(function (tourist) { tourist.groupId = pendingGroup.groupId; });
      currentTourists().filter(function (tourist) { return tourist.groupId === pendingGroup.groupId; }).forEach(function (tourist) {
        tourist.groupRepresentative = tourist.id === pendingGroup.representativeId;
      });
      normalizeTourGroupRepresentative(pendingGroup.groupId, pendingGroup.representativeId);
      groupNames[pendingGroup.groupId] = pendingGroup.groupName;
      tourGroupSettings[pendingGroup.groupId] = Object.assign({}, pendingGroup.settings);
      pendingGroup.hotelChoices.forEach(function (choice) {
        var cityIndex = cities.findIndex(function (city) { return city.id === choice.routeCityId; });
        if (cityIndex < 0) throw new Error('Unknown route city');
        state.cityIndex = cityIndex;
        if (!applyStageRecord(choice.members, 'hotel', choice.values, choice.groupId || null, choice.sourceId)) throw new Error('Hotel choice was rejected');
      });
      var unresolved = ensureDefaultSharedHotel(pendingGroup.groupId);
      if (unresolved.length) throw new Error('Hotel conflict remained unresolved');
      state.cityIndex = pendingGroup.returnCityIndex;
      return true;
    } catch (error) {
      snapshot.touristGroups.forEach(function (saved) {
        var tourist = touristById(saved.id);
        if (tourist) {
          tourist.groupId = saved.groupId;
          tourist.groupRepresentative = saved.groupRepresentative;
        }
      });
      records = snapshot.records;
      operationGroups = snapshot.operationGroups;
      groupNames = snapshot.groupNames;
      tourGroupSettings = snapshot.tourGroupSettings;
      state.cityIndex = snapshot.cityIndex;
      console.warn('Tourist group transaction rolled back', error);
      return false;
    }
  }

  function applyPendingTouristGroupHotelChoice(pendingGroup, overlay, values, sourceId) {
    pendingGroup.hotelChoices = pendingGroup.hotelChoices.filter(function (choice) { return choice.routeCityId !== overlay.routeCityId; });
    pendingGroup.hotelChoices.push({
      routeCityId: overlay.routeCityId,
      members: overlay.members.slice(),
      groupId: overlay.groupId || null,
      sourceId: sourceId,
      values: cleanRecord(values, 'hotel')
    });
    if (overlay.remainingDefaultHotelConflicts && overlay.remainingDefaultHotelConflicts.length) {
      openDefaultHotelConflict(pendingGroup, overlay.remainingDefaultHotelConflicts);
      return;
    }
    if (!commitTouristGrouping(pendingGroup)) {
      state.overlay = null;
      showToast('Не удалось атомарно создать группу. Исходные данные сохранены.', 'error');
      return;
    }
    saveCanonicalTourists();
    state.overlay = null;
    state.view = 'tourists';
    showToast('Туристы объединены, источники отелей подтверждены');
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
    var existingMembers = existingIds.length ? currentTourists().filter(function (tourist) { return tourist.groupId === groupId; }) : [];
    var allMemberIds = Array.from(new Set(existingMembers.map(function (tourist) { return tourist.id; }).concat(selectedIds)));
    var allGroupMembers = allMemberIds.map(touristById);
    var surnames = Array.from(new Set(allGroupMembers.map(function (tourist) { return tourist.lastName || tourist.name.split(' ')[0]; }).filter(Boolean)));
    var representative = existingIds.length ? existingMembers.find(function (tourist) { return tourist.groupRepresentative; }) : selectedTourists[0];
    representative = representative || allGroupMembers[0];
    var pendingGroup = {
      groupId: groupId,
      selectedIds: selectedIds.slice(),
      allMemberIds: allMemberIds,
      representativeId: representative.id,
      groupName: groupNames[groupId] || surnames.slice(0, 2).join(' + '),
      settings: Object.assign({}, tourGroupSettings[groupId] || { sharedHotel: true, sharedArrival: false, sharedDeparture: false }),
      hotelChoices: [],
      returnCityIndex: state.cityIndex
    };
    var hotelConflicts = previewDefaultSharedHotelConflicts(pendingGroup);
    if (hotelConflicts.length) {
      state.view = 'tourists';
      openDefaultHotelConflict(pendingGroup, hotelConflicts);
      return false;
    }
    if (!commitTouristGrouping(pendingGroup)) {
      state.overlay.error = 'Не удалось атомарно создать группу. Повторите.';
      render();
      return false;
    }
    state.overlay = null;
    state.view = 'tourists';
    showToast('Туристы объединены в группу');
    return true;
  }

  function detachTourGroupLinks(groupId, memberIds) {
    cities.forEach(function (city) {
      ['arrival', 'hotel', 'departure'].forEach(function (stage) {
        var groups = operationGroups[city.id][stage];
        Object.keys(groups).forEach(function (operationGroupId) {
          var group = groups[operationGroupId];
          if (group.createdFromGroupId !== groupId) return;
          group.members = group.members.filter(function (id) { return memberIds.indexOf(id) === -1; });
          if (group.members.length < 2) delete groups[operationGroupId];
          else {
            if (group.members.indexOf(group.sourceId) === -1) group.sourceId = group.members[0];
            group.masterId = group.sourceId;
            syncOperationGroup(group, city.id, stage);
          }
        });
      });
    });
  }

  root.addEventListener('input', function (event) {
    if (window.UNIQUE_MOBILE_LEADS && window.UNIQUE_MOBILE_LEADS.isActive()) return;
    var chatInput = event.target && event.target.matches && event.target.matches('[data-chat-search], [data-chat-composer], [data-chat-create-title], [data-chat-create-members]');
    if (chatInput && window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.handleInput === 'function') {
      window.UNIQUE_MOBILE_CHATS.handleInput(event.target, chatEnvironment());
      return;
    }
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
    if (event.target.dataset.userSearch !== undefined && state.overlay && state.overlay.kind === 'tour-form') {
      var userSelect = document.getElementById(event.target.dataset.userSearch);
      var userQuery = event.target.value.trim().toLowerCase();
      if (userSelect) Array.from(userSelect.options).forEach(function (option) {
        option.hidden = Boolean(userQuery && option.value && option.textContent.toLowerCase().indexOf(userQuery) === -1);
      });
      return;
    }
    if (state.overlay && state.overlay.kind === 'tour-form' && event.target.name === 'routeCityName') {
      var routeDraftItem = state.overlay.routeDraft[Number(event.target.dataset.routeIndex)];
      if (routeDraftItem) routeDraftItem.name = event.target.value;
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
    if (window.UNIQUE_MOBILE_LEADS && window.UNIQUE_MOBILE_LEADS.isActive()) return;
    if (state.overlay && state.overlay.kind === 'tour-form') {
      if (event.target.dataset.routeGuideId !== undefined) state.overlay.routeGuideIds[event.target.dataset.routeGuideId] = event.target.value;
      if (event.target.name === 'chatAdmin') state.overlay.chatAdminIds[Number(event.target.dataset.chatIndex)] = event.target.value;
      if (event.target.name === 'financeGuideCityId') state.overlay.financeGuideCityId = event.target.value;
    }
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
    if (window.UNIQUE_MOBILE_LEADS && window.UNIQUE_MOBILE_LEADS.isActive()) return;
    if (event.target && event.target.matches && event.target.matches('[data-chat-form]') && window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.handleSubmit === 'function') {
      event.preventDefault();
      window.UNIQUE_MOBILE_CHATS.handleSubmit(event.target, chatEnvironment());
      return;
    }
    event.preventDefault();
    var form = event.target;
    var formData = new FormData(form);
    var data = Object.fromEntries(formData.entries());
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
        if (Object.keys(personalErrors).length) {
          showProfileValidation(personalErrors, 'Фамилия и имя обязательны.');
          return;
        }
        Object.assign(profileTourist, { lastName: data.lastName, firstName: data.firstName, middleName: data.middleName, birthDate: data.birthDate, phone: data.phone, email: data.email == null ? profileTourist.email : data.email });
        profileTourist.name = [profileTourist.lastName, profileTourist.firstName, profileTourist.middleName].filter(Boolean).join(' ');
        profileTourist.initials = [profileTourist.lastName, profileTourist.firstName].map(function (part) { return part.charAt(0); }).join('').toUpperCase();
      } else if (profileSection === 'citizenship') {
        profileTourist.citizenship = data.citizenship || '';
      } else if (profileSection === 'domestic' && profileTourist.citizenship === 'Россия') {
        Object.assign(profileTourist, { domesticPassport: data.domesticPassport, domesticIssuedBy: data.domesticIssuedBy, registrationAddress: data.registrationAddress });
      } else if (profileSection === 'foreign') {
        Object.assign(profileTourist, { latinName: data.latinName, passport: data.passport, passportExpiry: data.passportExpiry });
      } else if (profileSection === 'settings') {
        var wantsPrimary = data.isPrimary === 'true';
        if (!wantsPrimary && profileTourist.isPrimary && !tourists.some(function (tourist) { return tourist.id !== profileTourist.id && tourist.leadId === profileTourist.leadId && tourist.isPrimary; })) {
          state.overlay.error = 'Сначала назначьте другого основного туриста этого лида.';
          render();
          return;
        }
        if (wantsPrimary) tourists.filter(function (tourist) { return tourist.leadId === profileTourist.leadId; }).forEach(function (tourist) { tourist.isPrimary = tourist.id === profileTourist.id; });
        else profileTourist.isPrimary = false;
        profileTourist.type = data.type || '';
        if (data.notes != null) profileTourist.notes = data.notes;
      } else if (profileSection === 'tour-context') {
        profileTourist.guideComment = data.guideComment;
        var wantsGroupRepresentative = data.groupRepresentative === 'true';
        if (!profileTourist.groupId) profileTourist.groupRepresentative = false;
        else if (wantsGroupRepresentative) normalizeTourGroupRepresentative(profileTourist.groupId, profileTourist.id);
        else {
          profileTourist.groupRepresentative = false;
          var replacementRepresentative = tourists.find(function (tourist) {
            return tourist.groupId === profileTourist.groupId && tourist.id !== profileTourist.id;
          });
          normalizeTourGroupRepresentative(profileTourist.groupId, replacementRepresentative && replacementRepresentative.id);
        }
      }
      saveCanonicalTourists();
      state.overlay = { kind: 'tourist-detail', touristId: profileTourist.id, expanded: new Set([profileSection]), detailTab: profileSection === 'tour-context' ? 'tour' : 'profile' };
      showToast('Раздел туриста сохранён');
      return;
    }
    if (form.id === 'program-form') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      var programIndex = Number(form.dataset.index);
      if (!programDays[programIndex]) return;
      var selectedProgramCityIdx = Number(data.cityIdx);
      if (!cities[selectedProgramCityIdx]) selectedProgramCityIdx = programDays[programIndex].cityIdx;
      programDays[programIndex].cityIdx = selectedProgramCityIdx;
      programDays[programIndex].city = (cities[selectedProgramCityIdx] || {}).name || '';
      programDays[programIndex].description = data.description || '';
      state.overlay = null;
      showToast('День программы сохранён');
      return;
    }
    if (form.id === 'tour-task-form') {
      if (mutationBlocked(capabilities().canManageTasks, 'Изменение задач недоступно для этой роли')) return;
      if (!String(data.title || '').trim()) { showToast('Укажите название задачи', 'error'); return; }
      var editedTask = form.dataset.id ? tourTasks.find(function (task) { return task.id === form.dataset.id; }) : null;
      var taskValues = { title: String(data.title).trim(), description: String(data.description || ''), priority: data.priority || 'medium', status: editedTask ? (data.status || editedTask.status) : 'todo', dueDate: data.dueDate || '' };
      if (editedTask) Object.assign(editedTask, taskValues); else tourTasks.unshift(Object.assign({ id: 'task-' + Date.now() }, taskValues));
      state.overlay = null;
      showToast(editedTask ? 'Задача обновлена' : 'Задача создана');
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
      cancelledTour.statusBeforeCancel = cancelledTour.status === 'cancelled' ? (cancelledTour.statusBeforeCancel || 'active') : cancelledTour.status;
      cancelledTour.status = 'cancelled';
      cancelledTour.isArchived = false;
      cancelledTour.cancelReason = data.reason;
      syncLinkedLeadArchive(cancelledTour.id, true);
      state.overlay = null;
      state.view = 'tour-actions';
      state.tourFilter = 'archive';
      showToast('Тур закрыт с указанием причины');
      return;
    }
    if (form.id === 'tour-form') {
      var tour = tours.find(function (item) { return item.id === form.dataset.id; });
      var canSaveTour = form.dataset.id ? (Boolean(tour) && canManageTourId(form.dataset.id)) : capabilities().canManageTour;
      if (mutationBlocked(canSaveTour, 'Изменение тура недоступно для этой роли')) return;
      var rawRouteNames = formData.getAll('routeCityName');
      var rawRouteIds = formData.getAll('routeCityId').map(String);
      var rawCityGuideIds = formData.getAll('cityGuide').map(String);
      var routeEntries = rawRouteNames.map(function (value, index) {
        return { name: String(value).trim(), id: rawRouteIds[index] || '', guideId: rawCityGuideIds[index] || '' };
      }).filter(function (entry) { return Boolean(entry.name); });
      var routeNames = routeEntries.map(function (entry) { return entry.name; });
      var routeIds = routeEntries.map(function (entry) { return entry.id; });
      if (!String(data.name || '').trim() || !routeNames.length || !data.startDate || !data.endDate) { showToast('Заполните название, маршрут и даты тура', 'error'); return; }
      var cityGuideIds = routeEntries.map(function (entry) { return entry.guideId; });
      var chatAdminIds = formData.getAll('chatAdmin').map(String).filter(Boolean);
      var escortUserId = String(data.escort || '');
      if (escortUserId && !directoryUser(escortUserId)) {
        var escortByName = userDirectory.find(function (user) { return user.name === escortUserId && user.roles.indexOf('escort') !== -1; });
        escortUserId = escortByName ? escortByName.id : '';
      }
      var tourTypeLabels = { group: 'Групповой', individual: 'Индивидуальный', excursion: 'Экскурсия', transfer: 'Трансфер' };
      var tourValues = {
        name: String(data.name).trim(), description: String(data.description || ''), site: String(data.site || ''), country: data.country,
        tourType: data.tourType, tourTypeLabel: tourTypeLabels[data.tourType] || data.tourType, cities: routeNames,
        route: routeNames.join(' → '), cityGuides: routeEntries.reduce(function (result, entry) { if (entry.guideId && directoryUser(entry.guideId)) result[entry.id] = entry.guideId; return result; }, {}),
        financeGuideCityId: routeIds.indexOf(String(data.financeGuideCityId || '')) !== -1 ? String(data.financeGuideCityId) : null, guides: Array.from(new Set(cityGuideIds.filter(Boolean).map(directoryUserName))).join(', '),
        escortUserId: escortUserId, escort: directoryUserName(escortUserId), chatAdminIds: chatAdminIds, chatAdmins: chatAdminIds.map(directoryUserName), startDate: data.startDate, endDate: data.endDate,
        dates: data.startDate + ' — ' + data.endDate, capacity: Number(data.capacity || 0), price: String(data.price || '0'), priceCurrency: data.priceCurrency || 'RUB', color: data.color
      };
      if (tour) Object.assign(tour, tourValues); else tours.push(Object.assign({ id: 'tour-' + Date.now(), status: 'draft', tourists: 0 }, tourValues));
      if (tour && tour.id === 'china') {
        var priorCitiesById = {};
        cities.forEach(function (city) { priorCitiesById[city.id] = city; });
        var nextCities = routeEntries.map(function (entry, index) {
          var routeId = entry.id || 'route-' + Date.now() + '-' + index;
          var routeCity = priorCitiesById[routeId] || { id: routeId, catalogCityId: null, dates: '', arrival: '', departure: '' };
          routeCity.name = entry.name;
          if (!records[routeId]) records[routeId] = { arrival: {}, hotel: {}, departure: {} };
          if (!operationGroups[routeId]) operationGroups[routeId] = { arrival: {}, hotel: {}, departure: {} };
          return routeCity;
        });
        cities.splice.apply(cities, [0, cities.length].concat(nextCities));
      }
      state.overlay = { kind: 'tours' };
      state.tourFilter = tour ? tour.status : 'draft';
      showToast(tour ? 'Тур сохранён' : 'Черновик тура создан');
      return;
    }
  });

  root.addEventListener('click', function (event) {
    if (window.UNIQUE_MOBILE_LEADS && window.UNIQUE_MOBILE_LEADS.isActive()) return;
    var chatButton = event.target.closest('[data-chat-action]');
    if (chatButton && chatButton.dataset && chatButton.dataset.chatAction && window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.handleAction === 'function') {
      window.UNIQUE_MOBILE_CHATS.handleAction(chatButton.dataset.chatAction, chatButton, chatEnvironment());
      return;
    }
    var button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    var action = button.dataset.action;

    if (action === 'open-tour-chat') {
      if (!window.UNIQUE_MOBILE_CHATS || typeof window.UNIQUE_MOBILE_CHATS.openContext !== 'function') return;
      var returnTourChatView = state.view;
      window.UNIQUE_MOBILE_CHATS.openContext({ contour: 'client', kind: 'tour', tourId: state.selectedTourId, returnView: returnTourChatView });
      state.view = 'chats';
      syncPrototypeUrl('chats', { chat: 'client-tour-' + state.selectedTourId });
      render();
      return;
    }

    if (action === 'route-up' || action === 'route-down' || action === 'route-remove' || action === 'route-add') {
      if (!state.overlay || state.overlay.kind !== 'tour-form') return;
      var routeIndex = Number(button.dataset.index);
      if (action === 'route-up' && routeIndex > 0) state.overlay.routeDraft.splice(routeIndex - 1, 0, state.overlay.routeDraft.splice(routeIndex, 1)[0]);
      if (action === 'route-down' && routeIndex < state.overlay.routeDraft.length - 1) state.overlay.routeDraft.splice(routeIndex + 1, 0, state.overlay.routeDraft.splice(routeIndex, 1)[0]);
      if (action === 'route-remove' && state.overlay.routeDraft.length > 1) state.overlay.routeDraft.splice(routeIndex, 1);
      if (action === 'route-add') state.overlay.routeDraft.push({ id: 'route-draft-' + Date.now(), name: '' });
      render();
      return;
    }
    if (action === 'add-chat-admin' || action === 'remove-chat-admin') {
      if (!state.overlay || state.overlay.kind !== 'tour-form') return;
      if (action === 'add-chat-admin') state.overlay.chatAdminIds.push('');
      else if (state.overlay.chatAdminIds.length > 1) state.overlay.chatAdminIds.splice(Number(button.dataset.index), 1);
      render();
      return;
    }
    if (action === 'apply-program-template') {
      var programTextarea = root.querySelector && root.querySelector('#program-form textarea[name="description"]');
      if (programTextarea) programTextarea.value = 'Экскурсионная программа, обед в локальном ресторане и свободное время.';
      showToast('Шаблон добавлен в описание');
      return;
    }
    if (action === 'save-program-template') {
      showToast('Шаблон дня сохранён на mock-данных');
      return;
    }

    if (action === 'summary-section') {
      state.view = button.dataset.view;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'guide-stage') {
      var guideStage = button.dataset.stage;
      if (guideStage === 'program') {
        state.view = 'program';
      } else if (['arrival', 'hotel', 'departure'].indexOf(guideStage) !== -1) {
        state.stage = guideStage;
        state.view = 'operations';
      }
      state.overlay = null;
      render();
      return;
    }
    if (action === 'guide-tourist-filter') {
      if (!usesGuideOperationalMock() || ['all', 'attention', 'completed'].indexOf(button.dataset.filter) === -1) return;
      state.guideTouristFilter = button.dataset.filter;
      render();
      return;
    }
    if (action === 'open-guide-city-picker') {
      if (!usesGuideOperationalMock()) { showToast('Задачи этого тура недоступны', 'error'); return; }
      state.overlay = { kind: 'guide-city-picker' };
      render();
      return;
    }
    if (action === 'select-guide-city') {
      var guideCity = guideOperationalRouteCities().find(function (city) { return city.id === button.dataset.city; });
      if (!usesGuideOperationalMock() || !guideCity) { showToast('Эта позиция маршрута недоступна', 'error'); return; }
      state.guideRouteCityId = guideCity.id;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'guide-operation-status') {
      if (!usesGuideOperationalMock()) { showToast('Статус недоступен для этого тура', 'error'); return; }
      if (state.offline) { showToast('Нет подключения: статус не изменён', 'error'); return; }
      var activeGuideCity = currentGuideOperationalCity();
      var routeMock = activeGuideCity && guideOperationalMock().route[activeGuideCity.id];
      var validOperation = routeMock && (routeMock[button.dataset.stage] || []).some(function (operation) { return operation.id === button.dataset.operation; });
      var validStatus = statusLabels[button.dataset.stage] && statusLabels[button.dataset.stage][button.dataset.status];
      if (!validOperation || !validStatus || button.dataset.city !== activeGuideCity.id || button.dataset.stage !== state.stage) {
        showToast('Задача изменилась. Обновите статус ещё раз.', 'error');
        return;
      }
      guideOperationalStatuses[guideOperationStatusKey(button.dataset.city, button.dataset.stage, button.dataset.operation)] = button.dataset.status;
      showToast('Статус: ' + statusLabels[button.dataset.stage][button.dataset.status]);
      return;
    }
    if (action === 'open-city-picker') {
      state.overlay = { kind: 'city-picker' };
      render();
      return;
    }
    if (action === 'open-finance-city-picker') {
      if (!canViewFinance()) { showToast('Финансы недоступны для этой роли', 'error'); return; }
      state.overlay = { kind: 'finance-city-picker' };
      render();
      return;
    }
    if (action === 'select-finance-city') {
      var financeRouteCityId = button.dataset.routeCityId;
      var financeCity = financeRouteCities().find(function (city) { return city.id === financeRouteCityId; });
      if (!financeCity) { showToast('Эта позиция маршрута недоступна', 'error'); return; }
      state.financeRouteCityId = financeCity.id;
      if (tourHasOperationalModel(state.selectedTourId)) {
        var financeCityIndex = cities.findIndex(function (city) { return city.id === financeCity.id; });
        if (financeCityIndex >= 0) state.cityIndex = financeCityIndex;
      }
      state.overlay = null;
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
      var selectedRole = button.dataset.role === 'guide' ? 'viewer' : button.dataset.role;
      if (['admin', 'manager', 'escort', 'viewer'].indexOf(selectedRole) === -1) selectedRole = 'forbidden';
      state.role = selectedRole;
      if (state.view === 'finance' && !canViewFinance()) state.view = 'tour-info';
      if (state.view === 'chats' && state.role !== 'admin' && state.role !== 'manager') state.view = 'operations';
      if ((state.role === 'viewer' || state.role === 'escort') && state.view === 'tour-info') state.view = 'operations';
      var scopedLeadTouristAfterRoleChange = state.scopeLead && currentTourists().find(function (tourist) { return tourist.leadId === state.scopeLead; });
      if (!canSeeSourceLeadFor(scopedLeadTouristAfterRoleChange)) state.scopeLead = null;
      if (!canOpenSourceLead(state.returnLead)) state.returnLead = null;
      state.touristQuery = '';
      state.touristFilters = { needsData: false, documentIssue: false, limitedRoute: false, debt: false, type: 'all', group: 'all', status: 'all' };
      state.guideTouristFilter = 'all';
      state.returnContext = null;
      state.saveErrorSnapshot = null;
      state.draft = null;
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
      captureSaveErrorSnapshot(state.overlay);
      state.overlay = { kind: 'ui-states' };
      render();
      return;
    }
    if (action === 'set-ui-state') {
      if (button.dataset.state === 'save-error' && (!state.saveErrorSnapshot || (state.overlay && ['form', 'operation-select', 'conflict'].indexOf(state.overlay.kind) !== -1))) captureSaveErrorSnapshot(state.overlay);
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
    if (action === 'retry-save-state') {
      state.uiPreview = 'saving';
      render();
      return;
    }
    if (action === 'return-draft-state') {
      if (!restoreSaveErrorSnapshot()) state.uiPreview = 'ready';
      showToast('Черновик, выбор и источник восстановлены');
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
      state.touristFilters = { needsData: false, documentIssue: false, limitedRoute: false, debt: false, type: 'all', group: 'all', status: 'all' };
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
      var documentTourist = touristById(button.dataset.id);
      if (!canViewDocumentsFor(documentTourist)) {
        showToast('Документы туриста недоступны для этой роли', 'error');
        return;
      }
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
      if (!canViewContactFor(contactTourist)) {
        showToast('Контакт туриста недоступен для этой роли', 'error');
        return;
      }
      var contactValue = contactTourist && contactTourist.phone ? contactTourist.phone : 'номер не заполнен';
      if (action === 'message-tourist' && window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.openContext === 'function') {
        var returnPersonalChatView = state.view;
        window.UNIQUE_MOBILE_CHATS.openContext({ contour: 'client', kind: 'tourist', touristId: contactTourist.id, contactId: contactTourist.contactId, tourId: contactTourist.tourId, returnView: returnPersonalChatView });
        state.view = 'chats';
        syncPrototypeUrl('chats', { chat: 'client-tourist-' + contactTourist.id });
        render();
        return;
      }
      showToast(action === 'call-tourist' ? 'Звонок: ' + contactValue : (action === 'message-tourist' ? 'Чат: ' + contactValue : 'Контакт скопирован: ' + contactValue));
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
      var previewTourist = touristById(button.dataset.id);
      if (!canViewDocumentsFor(previewTourist)) {
        showToast('Скан туриста недоступен для этой роли', 'error');
        return;
      }
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
      // Recheck at the final destructive boundary: the point could have become
      // referenced after the confirmation screen was opened.
      if (pointIsUsed(pointToDelete.id)) {
        pointToDelete.active = false;
        saveDirectory();
        state.overlay = { kind: 'directory-city', cityId: pointToDelete.cityId, previous: { kind: 'directory' } };
        showToast('Точка уже используется: она архивирована, история сохранена');
        return;
      }
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
      var cityNowInRoute = cities.some(function (city) { return city.catalogCityId === confirmedCity.id; });
      var cityNowHasPoints = directory.points.some(function (point) { return point.cityId === confirmedCity.id; });
      if (cityNowInRoute || cityNowHasPoints) {
        showToast('Город больше нельзя удалить: появилась связь с маршрутом или точками', 'error');
        return;
      }
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
      if (hasLimitedTouristPrivacy()) {
        state.scopeLead = null;
        showToast('Фильтр по исходному лиду недоступен для этой роли', 'error');
        return;
      }
      if (state.scopeLead) state.scopeLead = null;
      else state.overlay = { kind: 'scope-select' };
      render();
      return;
    }
    if (action === 'select-scope') {
      if (hasLimitedTouristPrivacy()) {
        state.scopeLead = null;
        showToast('Фильтр по исходному лиду недоступен для этой роли', 'error');
        return;
      }
      var scopedLeadTourist = currentTourists().find(function (tourist) { return tourist.leadId === button.dataset.id; });
      if (!canSeeSourceLeadFor(scopedLeadTourist)) {
        state.scopeLead = null;
        showToast('Этот лид не назначен текущему менеджеру', 'error');
        return;
      }
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
    if (action === 'preview-tour-site') {
      showToast('В рабочей версии откроется сайт тура');
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
      if (!canViewTourId(button.dataset.id)) {
        showToast('Тур не назначен текущей роли', 'error');
        return;
      }
      state.selectedTourId = button.dataset.id;
      state.guideRouteCityId = null;
      state.touristQuery = '';
      state.guideTouristFilter = 'all';
      state.overlay = null;
      state.view = button.dataset.id === 'china' || usesGuideOperationalMock() ? 'operations' : 'tour-info';
      render();
      return;
    }
    if (action === 'tour-card-menu') {
      if (!canViewTourId(button.dataset.id)) {
        showToast('Тур не назначен текущей роли', 'error');
        return;
      }
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
      var infoTourId = state.overlay && state.overlay.tourId ? state.overlay.tourId : state.selectedTourId;
      if (!canViewTourId(infoTourId)) {
        showToast('Тур не назначен текущей роли', 'error');
        return;
      }
      state.selectedTourId = infoTourId;
      state.overlay = null;
      state.view = 'tour-info';
      render();
      return;
    }
    if (action === 'view-tour-tasks') {
      var taskTourId = state.overlay && state.overlay.tourId ? state.overlay.tourId : state.selectedTourId;
      if (!canViewTourId(taskTourId)) {
        showToast('Тур не назначен текущей роли', 'error');
        return;
      }
      state.selectedTourId = taskTourId;
      if (!tourHasOperationalModel(state.selectedTourId)) {
        state.overlay = null;
        showToast('Задачи этого тура ещё не подготовлены');
        return;
      }
      state.overlay = null;
      state.view = 'tour-tasks';
      render();
      return;
    }
    if (action === 'tourist-detail') {
      var detailTourist = touristById(button.dataset.id);
      if (!canViewTouristForSelectedTour(detailTourist) || !canViewGuideOperationalTourist(detailTourist)) {
        showToast('Карточка туриста недоступна в выбранном туре', 'error');
        return;
      }
      state.returnContext = captureTourContext();
      state.overlay = { kind: 'tourist-detail', touristId: button.dataset.id, expanded: new Set(), detailTab: 'profile' };
      render();
      return;
    }
    if (action === 'tourist-detail-tab') {
      if (!state.overlay || state.overlay.kind !== 'tourist-detail') return;
      state.overlay.detailTab = button.dataset.tab === 'tour' ? 'tour' : 'profile';
      state.overlay.expanded = new Set();
      render();
      return;
    }
    if (action === 'bulk-tourists') {
      state.overlay = { kind: 'bulk-tourists', selected: new Set() };
      render();
      return;
    }
    if (action === 'edit-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      state.overlay = { kind: 'program-form', index: Number(button.dataset.index) };
      render();
      return;
    }
    if (action === 'generate-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      if (!programDays.length) programDays.splice.apply(programDays, [0, 0].concat(buildProgramDays(selectedTour(), [], programSeedDescriptions)));
      showToast('Программа сформирована из маршрута');
      return;
    }
    if (action === 'regenerate-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      state.overlay = { kind: 'regenerate-program' };
      render();
      return;
    }
    if (action === 'confirm-regenerate-program') {
      if (mutationBlocked(capabilities().canManageProgram, 'Изменение программы недоступно для этой роли')) return;
      var regeneratedDays = buildProgramDays(selectedTour(), programDays, programSeedDescriptions);
      programDays.splice.apply(programDays, [0, programDays.length].concat(regeneratedDays));
      state.overlay = null;
      showToast('Программа обновлена по датам и маршруту');
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
      var editTourId = button.dataset.id || (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var editableTour = tours.find(function (tour) { return tour.id === editTourId; });
      if (mutationBlocked(Boolean(editableTour) && canManageTourId(editTourId), 'Изменение тура недоступно для этой роли')) return;
      state.overlay = { kind: 'tour-form', tourId: editTourId };
      render();
      return;
    }
    if (action === 'copy-tour') {
      var copySourceId = button.dataset.id || (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var originalTour = tours.find(function (tour) { return tour.id === copySourceId; });
      if (mutationBlocked(Boolean(originalTour) && canManageTourId(copySourceId), 'Копирование тура недоступно для этой роли')) return;
      tours.push(Object.assign({}, originalTour, { id: 'copy-' + Date.now(), name: originalTour.name + ' · копия', status: 'draft', isArchived: false, cancelReason: '', statusBeforeArchive: null, statusBeforeCancel: null, tourists: 0, bookedCount: 0, statusCounts: { confirmed: 0, pending: 0, cancelled: 0 } }));
      state.tourFilter = 'draft';
      state.overlay = { kind: 'tours' };
      showToast('Копия тура создана в черновиках');
      return;
    }
    if (action === 'archive-tour') {
      var archiveSourceId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var archiveTour = tours.find(function (tour) { return tour.id === archiveSourceId; });
      if (mutationBlocked(Boolean(archiveTour) && state.role === 'admin', 'Архивирование доступно только администратору')) return;
      if (!archiveTour.isArchived) {
        archiveTour.statusBeforeArchive = archiveTour.status === 'archive' ? 'active' : archiveTour.status;
        archiveTour.isArchived = true;
        archiveTour.status = 'archive';
      } else {
        archiveTour.isArchived = false;
        archiveTour.status = archiveTour.statusBeforeArchive || 'active';
        archiveTour.statusBeforeArchive = null;
      }
      syncLinkedLeadArchive(archiveTour.id, archiveTour.isArchived);
      state.tourFilter = archiveTour.isArchived ? 'archive' : archiveTour.status;
      state.overlay = null;
      showToast(archiveTour.isArchived ? 'Тур перемещён в архив' : 'Тур возвращён из архива');
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
    if (action === 'reopen-tour') {
      var reopenTourId = (state.overlay && state.overlay.tourId) || state.selectedTourId;
      var reopenedTour = tours.find(function (tour) { return tour.id === reopenTourId; });
      if (mutationBlocked(Boolean(reopenedTour) && reopenedTour.status === 'cancelled' && canManageTourId(reopenTourId), 'Повторно открыть можно только отменённый доступный тур')) return;
      reopenedTour.status = reopenedTour.statusBeforeCancel || 'active';
      reopenedTour.isArchived = false;
      reopenedTour.cancelReason = '';
      reopenedTour.statusBeforeCancel = null;
      syncLinkedLeadArchive(reopenedTour.id, false);
      state.tourFilter = reopenedTour.status;
      state.overlay = null;
      showToast('Тур открыт снова');
      return;
    }
    if (action === 'delete-tour') {
      if (mutationBlocked(state.role === 'admin', 'Удаление тура доступно только администратору')) return;
      showToast('В прототипе удаление показано как защищённое действие; данные mock-тура сохранены');
      return;
    }
    if (action === 'add-tour-task') {
      if (mutationBlocked(capabilities().canManageTasks, 'Изменение задач недоступно для этой роли')) return;
      state.overlay = { kind: 'task-form', taskId: null };
      render();
      return;
    }
    if (action === 'edit-tour-task') {
      if (mutationBlocked(capabilities().canManageTasks, 'Изменение задач недоступно для этой роли')) return;
      state.overlay = { kind: 'task-form', taskId: button.dataset.id };
      render();
      return;
    }
    if (action === 'delete-tour-task') {
      if (mutationBlocked(capabilities().canManageTasks, 'Удаление задач недоступно для этой роли')) return;
      state.overlay = { kind: 'task-delete', taskId: button.dataset.id };
      render();
      return;
    }
    if (action === 'confirm-delete-tour-task') {
      if (mutationBlocked(capabilities().canManageTasks, 'Удаление задач недоступно для этой роли')) return;
      tourTasks = tourTasks.filter(function (task) { return task.id !== button.dataset.id; });
      state.overlay = null;
      showToast('Задача удалена');
      return;
    }
    if (action === 'open-leads') {
      if (state.role !== 'admin' && state.role !== 'manager') {
        showToast('Раздел «Лиды» недоступен для этой роли', 'error');
        return;
      }
      window.UNIQUE_TOUR_HOST.openLeads({ leadId: state.returnLead, detailTab: state.returnLead ? state.returnTab : 'details' });
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
        return [tourist.name, hasRestrictedTouristPrivacy(tourist) ? 'Недоступен' : tourist.lead, globalGroupLabel(tourist)].concat(logistics).map(csvCell).join(',');
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
      if (!canOpenSourceLead(button.dataset.id)) {
        showToast('Исходный лид недоступен для этой роли', 'error');
        return;
      }
      window.UNIQUE_TOUR_HOST.openLeads({ leadId: button.dataset.id, detailTab: 'details' });
      return;
    }
    if (action === 'delete-tourist') {
      if (mutationBlocked(capabilities().canDelete, 'Удаление доступно только администратору')) return;
      var deleteCandidate = touristById(button.dataset.id);
      if (!canViewTouristForSelectedTour(deleteCandidate)) {
        showToast('Турист не относится к выбранному туру', 'error');
        return;
      }
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
      if (!canViewTouristForSelectedTour(touristById(button.dataset.id))) {
        showToast('Турист не относится к выбранному туру', 'error');
        return;
      }
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
      if (button.dataset.view === 'finance' && !canViewFinance()) {
        showToast('Финансы недоступны для этой роли', 'error');
        return;
      }
      if (button.dataset.view === 'chats' && state.role !== 'admin' && state.role !== 'manager') {
        showToast('Раздел «Чаты» доступен менеджеру и администратору', 'error');
        return;
      }
      state.view = button.dataset.view;
      state.overlay = null;
      render();
      return;
    }
    if (action === 'finance-collection') {
      if (!canViewFinance()) { showToast('Финансы недоступны для этой роли', 'error'); return; }
      if (state.offline) { showToast('Нет подключения: отметка оплаты не сохранена', 'error'); return; }
      var financeActionKey = button.dataset.financeAction;
      var financeAction = financeActionKey && financeActionRegistry[financeActionKey];
      var requestedCollection = button.dataset.collected;
      var activeFinanceCity = currentFinanceCity();
      var financeRow = financeAction && buildFinanceRows().find(function (row) { return row.leadId === financeAction.leadId; });
      if (!financeAction || !financeRow || !financeRow.leadId || financeAction.tourId !== state.selectedTourId ||
          financeAction.routeCityId !== (activeFinanceCity && activeFinanceCity.id) || financeAction.collected !== requestedCollection ||
          ['true', 'false'].indexOf(requestedCollection) === -1) {
        showToast('Заявка не относится к выбранной позиции маршрута', 'error');
        return;
      }
      delete financeActionRegistry[financeActionKey];
      saveFinanceCollection(financeRow.leadId, requestedCollection === 'true');
      showToast(requestedCollection === 'true' ? 'Остаток отмечен как полученный' : 'Отметка оплаты отменена');
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
      if (state.overlay && state.overlay.kind === 'tourist-detail' && state.returnLead && canOpenSourceLead(state.returnLead)) {
        var sourceLeadId = state.returnLead;
        var sourceLeadTab = state.returnTab;
        state.overlay = null;
        window.UNIQUE_TOUR_HOST.openLeads({ leadId: sourceLeadId, detailTab: sourceLeadTab });
        return;
      }
      if (state.overlay && state.overlay.kind === 'tourist-detail' && state.returnLead && !canOpenSourceLead(state.returnLead)) state.returnLead = null;
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
        var selectedOperationTourists = Array.from(selected).map(touristById).filter(Boolean);
        var anchorTourist = selectedOperationTourists[0] || null;
        var anchorGroupId = selectionGroup ? selectionGroup.createdFromGroupId : (anchorTourist && anchorTourist.groupId);
        if (selected.has(id)) {
          selected.delete(id);
          if (state.overlay.error) state.overlay.error = null;
          render();
          return;
        }
        if ((anchorGroupId && selectedTourist.groupId !== anchorGroupId) || (anchorTourist && !anchorGroupId && selectedTourist.id !== anchorTourist.id)) {
          state.overlay.error = 'Общая операция объединяет только туристов одной существующей группы.';
          render();
          return;
        }
      }
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      if (state.overlay.error) state.overlay.error = null;
      render();
      return;
    }
    if (action === 'select-all') {
      var selectable = state.overlay.kind === 'operation-select' ? scopedTourists(false).filter(leadConfirmed) : currentTourists();
      if (state.overlay.kind === 'operation-select') {
        var managedOperationGroup = state.overlay.groupId ? stageGroups(state.overlay.stage)[state.overlay.groupId] : null;
        var firstSelectedTourist = touristById(Array.from(state.overlay.selected)[0]);
        var selectableGroupId = managedOperationGroup ? managedOperationGroup.createdFromGroupId : (firstSelectedTourist && firstSelectedTourist.groupId);
        if (!selectableGroupId) selectableGroupId = (selectable.find(function (tourist) { return Boolean(tourist.groupId); }) || {}).groupId;
        selectable = selectable.filter(function (tourist) { return selectableGroupId && tourist.groupId === selectableGroupId; });
      }
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
      if (selectedForOperation.length > 1 && !sameNonEmptyTourGroup(selectedForOperation.map(function (tourist) { return tourist.id; }))) {
        state.overlay.error = 'Для общей записи выберите туристов одной существующей группы.';
        render();
        return;
      }
      // Adding members is a preview/apply flow even when the common record
      // already exists; conflicts must never be bypassed as a plain edit.
      openForm(Array.from(state.overlay.selected), false, selectedOperationGroupId);
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
        if (formOverlay.stage === 'departure') copyDepartureToNextArrival(ownTouristId, formOverlay.routeCityId);
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
          dirtyFields: new Set(formOverlay.dirtyFields || []),
          groupId: formOverlay.groupId || null,
          routeCityId: formOverlay.routeCityId,
          tourId: formOverlay.tourId,
          pendingTouristGroup: formOverlay.pendingTouristGroup || null,
          remainingDefaultHotelConflicts: (formOverlay.remainingDefaultHotelConflicts || []).slice()
        };
        render();
        return;
      }
      if (formOverlay.pendingTouristGroup) {
        applyPendingTouristGroupHotelChoice(
          formOverlay.pendingTouristGroup,
          formOverlay,
          state.draft,
          formOverlay.sourceId === 'blank' ? formOverlay.members[0] : formOverlay.sourceId
        );
        return;
      }
      if (!applyStageRecord(formOverlay.members, formOverlay.stage, state.draft, formOverlay.groupId || null, formOverlay.sourceId)) return;
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
        groupId: conflict.groupId || null,
        sourceId: conflict.sourceId || 'blank',
        editMode: 'create',
        routeCityId: conflict.routeCityId || currentCity().id,
        tourId: conflict.tourId || state.selectedTourId,
        pendingTouristGroup: conflict.pendingTouristGroup || null,
        remainingDefaultHotelConflicts: (conflict.remainingDefaultHotelConflicts || []).slice(),
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
      if (conflictOverlay.pendingTouristGroup) {
        applyPendingTouristGroupHotelChoice(
          conflictOverlay.pendingTouristGroup,
          conflictOverlay,
          mergedValues,
          conflictOverlay.sourceId
        );
        return;
      }
      if (!applyStageRecord(conflictOverlay.members, conflictOverlay.stage, mergedValues, conflictOverlay.groupId || null, conflictOverlay.sourceId)) return;
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
        var detachedTourist = touristById(touristId);
        detachedTourist.groupId = null;
        detachedTourist.groupRepresentative = false;
      });
      var remaining = currentTourists().filter(function (tourist) { return tourist.groupId === globalOverlay.groupId; });
      if (remaining.length < 2) remaining.forEach(function (tourist) { tourist.groupId = null; tourist.groupRepresentative = false; globallyDetached.push(tourist.id); });
      else {
        var remainingRepresentative = remaining.find(function (tourist) { return tourist.groupRepresentative; }) || remaining[0];
        remaining.forEach(function (tourist) { tourist.groupRepresentative = tourist.id === remainingRepresentative.id; });
      }
      detachTourGroupLinks(globalOverlay.groupId, globallyDetached);
      if (!currentTourists().some(function (tourist) { return tourist.groupId === globalOverlay.groupId; })) delete tourGroupSettings[globalOverlay.groupId];
      saveCanonicalTourists();
      state.overlay = null;
      showToast('Группа изменена: зависимые общие связи сняты, личные данные сохранены');
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

  tourDebugApi = {
    snapshot: function () {
      return clone({
        tourists: tourists,
        visits: operationVisitSnapshot(),
        records: records,
        operationGroups: operationGroups,
        tourGroupSettings: tourGroupSettings,
        tours: tours,
        userDirectory: userDirectory,
        leadArchiveMocks: leadArchiveMocks,
        programDays: programDays,
        tourTasks: tourTasks,
        directory: directory,
        role: state.role,
        selectedTourId: state.selectedTourId,
        view: state.view,
        cityIndex: state.cityIndex,
        routeCityId: currentCity().id,
        guideRouteCityId: currentGuideOperationalCity() ? currentGuideOperationalCity().id : null,
        guideOperationalStatuses: guideOperationalStatuses,
        guideTouristFilter: state.guideTouristFilter,
        guideTouristMemberIds: usesGuideOperationalMock() ? guideOperationalCityMembers(currentGuideOperationalCity()).map(function (tourist) { return tourist.id; }) : [],
        guideTouristVisibleIds: usesGuideOperationalMock() ? filteredGuideOperationalTourists(currentGuideOperationalCity()).map(function (tourist) { return tourist.id; }) : [],
        financeRouteCityId: currentFinanceCity() ? currentFinanceCity().id : null,
        financeRows: canViewFinance() ? buildFinanceRows().map(function (row) {
          return {
            id: row.id,
            leadId: row.leadId,
            memberIds: row.members.map(function (member) { return member.id; }),
            payerId: row.payerId,
            collected: row.collected,
            balance: row.balance
          };
        }) : [],
        stage: state.stage,
        touristListMode: state.touristListMode,
        touristQuery: state.touristQuery,
        touristFilters: state.touristFilters,
        documentFilter: state.documentFilter,
        returnContext: state.returnContext,
        scopeLead: state.scopeLead,
        offline: state.offline,
        uiPreview: state.uiPreview,
        saveErrorSnapshot: state.saveErrorSnapshot
      });
    }
  };
  window.__prototypeDebug = tourDebugApi;

  if (state.view === 'chats' && window.UNIQUE_MOBILE_CHATS && typeof window.UNIQUE_MOBILE_CHATS.openContext === 'function') {
    var requestedChatId = initialParams.get('chat');
    var requestedChatScope = initialParams.get('chatScope');
    window.UNIQUE_MOBILE_CHATS.openContext({
      threadId: requestedChatId || null,
      contour: requestedChatScope || null,
      returnView: requestedChatId ? ((state.role === 'admin' || state.role === 'manager') ? 'chats' : 'operations') : null
    });
  }

  render();
}());
