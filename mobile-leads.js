(() => {
  "use strict";

  const app = document.querySelector("#app");
  const pageParams = new URLSearchParams(window.location.search);
  const stages = {
    new: ["Новый", "new"],
    contacted: ["Квалифицирован", "work"],
    qualified: ["Забронирован", "qualified"],
    converted: ["Подтверждён", "confirmed"],
    lost: ["Отложен", "lost"],
  };
  const sharedMock = window.UNIQUE_MOCK_DATA || { tours: [], supplementalLeads: [], supplementalTourists: [] };
  const stageOrder = Object.keys(stages);
  const roleLabels = { admin: "Администратор", manager: "Менеджер", escort: "Сопровождающий", viewer: "Гид" };
  const managerAssignedLeadIds = new Set(["lead-1042", "lead-1048"]);
  const tourIdsByTitle = {
    "Гранд-тур по Китаю": "china",
    "Япония: сезон момидзи": "japan",
    "Не выбран": null,
  };
  sharedMock.tours.forEach(tour => { tourIdsByTitle[tour.title] = tour.id; });
  const tourOptions = sharedMock.tours.length
    ? sharedMock.tours.map(tour => ({ id: tour.id, title: tour.title, dates: tour.dateOption || tour.dates, route: tour.route.map(city => ({ ...city })) }))
    : [
      { id: "china", title: "Гранд-тур по Китаю", dates: "12.09.2026 — 26.09.2026", route: [
        { id: "route-beijing-1", name: "Пекин" }, { id: "route-xian-1", name: "Сиань" },
        { id: "route-shanghai-1", name: "Шанхай" }, { id: "route-beijing-2", name: "Пекин (2)" },
      ] },
    ];
  const fieldOptions = {
    roomType: [["Single", "Single"], ["Twin", "Twin"], ["Double", "Double"]],
    hotelCategory: [["3*", "3*"], ["4*", "4*"], ["5*", "5*"]],
    transfers: [["group", "Групповой"], ["individual", "Индивидуальный"], ["self", "Самостоятельно"], ["none", "Без трансфера"]],
    meals: [["RO", "RO (без питания)"], ["BB", "BB (завтрак)"], ["HB", "HB (полупансион)"], ["FB", "FB (полный пансион)"], ["AI", "AI (всё включено)"]],
    clientCategory: [["category_ab", "Категория A и B (даты и бюджет)"], ["category_c", "Категория C (не определились)"], ["category_d", "Категория D (нет бюджета)"], ["vip", "VIP"], ["not_segmented", "Не сегментированный"], ["travel_agent", "Турагент"], ["tariff_standard", "Тариф стандарт"], ["tariff_economy", "Тариф эконом"], ["tariff_vip", "Тариф VIP"]],
    source: [["form", "Веб-форма"], ["referral", "Рекомендация"], ["direct", "Прямое обращение"], ["advertisement", "Реклама"], ["other", "Другое"], ["telegram", "Telegram"], ["whatsapp", "WhatsApp"], ["instagram", "Instagram"], ["max", "MAX"]],
  };
  const icons = {
    tours: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    leads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
  };

  let sequence = 60;
  let toastTimer;
  const leads = [
    {
      id: "lead-1042", code: "L-1042", firstName: "Анна", lastName: "Соколова", middleName: "Игоревна",
      phone: "+7 916 441-22-18", email: "anna@example.ru", telegram: "@anna_sokolova", telegramUserId: "518247913",
      stage: "converted", source: "referral", category: "vip", manager: "Елена Воронова", assignedUserId: "manager-elena", color: "#2f6bd8",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Сиань", "Шанхай"],
      updated: "сегодня, 09:12", created: "28.07.2026", archived: false,
      accommodation: { hotel: "Beijing Palace", room: "Double / Twin" }, roomType: ["Double", "Twin"], hotelCategory: ["5*"], transfers: ["group"], meals: ["BB"],
      tourCost: "248000", tourCostCurrency: "CNY", advancePayment: "520000", advancePaymentCurrency: "RUB", remainingPayment: "148000", remainingPaymentCurrency: "CNY",
      paymentStatus: "partial", paymentMethod: "bank_transfer", bookingId: "BK-CH-1042",
      utmSource: "yandex", utmMedium: "cpc", utmCampaign: "china_autumn", utmTerm: "тур в китай", utmContent: "mobile", pageUrl: "https://example.ru/china",
      note: "Семья, нужен русскоязычный сопровождающий. День рождения Анны во время тура.",
      touristIds: ["t1", "t2"],
      messages: [
        { author: "Анна", text: "Подтверждаем тур. Пришлю паспорта вечером.", time: "09:04" },
        { author: "Елена", text: "Спасибо. Бронь и договор уже в документах.", time: "09:12", own: true },
      ],
      tasks: [
        { title: "Проверить сканы паспортов", description: "Сверить ФИО и сроки действия", priority: "urgent", status: "todo", dueDate: "2026-08-03" },
        { title: "Подтвердить размещение", description: "Получить подтверждение Twin", priority: "high", status: "in_progress", dueDate: "2026-08-15" },
      ],
    },
    {
      id: "lead-1048", code: "L-1048", firstName: "Марина", lastName: "Орлова", middleName: "Сергеевна",
      phone: "+7 903 120-44-90", email: "marina@example.ru", telegram: "@marina_orlova",
      stage: "converted", source: "form", category: "category_ab", manager: "Елена Воронова", assignedUserId: "manager-elena", color: "#7a5af0",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"],
      updated: "вчера, 18:40", created: "31.07.2026", archived: false,
      accommodation: { hotel: "", room: "Single" }, roomType: ["Single"], hotelCategory: ["4*"], transfers: ["individual"], meals: ["BB"], note: "Просит номер без соседей.",
      touristIds: ["t3", "t4"],
      messages: [], tasks: [{ title: "Позвонить после 18:00", description: "Уточнить категорию номера", priority: "medium", status: "todo", dueDate: "2026-08-04" }],
    },
    {
      id: "lead-1051", code: "L-1051", firstName: "Денис", lastName: "Волков", middleName: "Олегович",
      phone: "+7 985 600-71-04", email: "denis@example.ru", telegram: "",
      stage: "contacted", source: "telegram", category: "not_segmented", manager: "Игорь Лебедев", assignedUserId: "manager-igor", color: "#1f8a50",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Шанхай"],
      updated: "1 авг, 14:25", created: "01.08.2026", archived: false,
      accommodation: { hotel: "", room: "Single" }, note: "Сокращённый маршрут без Сианя.",
      touristIds: ["lead-tourist-1051"],
      messages: [], tasks: [],
    },
    {
      id: "lead-1033", code: "L-1033", firstName: "Олег", lastName: "Морозов", middleName: "",
      phone: "+7 926 774-30-10", email: "oleg@example.ru", telegram: "",
      stage: "lost", outcome: "postponed", outcomeDate: "2027-02-01", outcomeReason: "Перенёс поездку на следующий сезон",
      source: "direct", category: "category_c", manager: "Елена Воронова", assignedUserId: "manager-elena", color: "#c98a1e",
      eventId: null, tour: "Не выбран", destination: "Япония", cities: [], routeCities: [],
      updated: "29 июл, 11:02", created: "20.07.2026", archived: true,
      accommodation: { hotel: "", room: "" },
      note: "Вернуться к заявке в феврале.", touristIds: ["t5"],
      messages: [], tasks: [{ title: "Вернуться к заявке", description: "Связаться перед новым сезоном", priority: "low", status: "todo", dueDate: "2027-02-01" }],
    },
  ];

  sharedMock.supplementalLeads.forEach(seed => {
    if (!leads.some(lead => lead.id === seed.id)) leads.push(JSON.parse(JSON.stringify(seed)));
  });
  leads.forEach(lead => {
    if (lead.manager === "Елена Воронова" && !lead.archived) managerAssignedLeadIds.add(lead.id);
  });

  const canonicalTouristStorageKey = "unique-guide-tourists-v3";
  const legacyCanonicalTouristStorageKey = "unique-guide-tourists-v2";
  const legacyCanonicalMigrationStorageKey = "unique-guide-tourists-v2-mobile-migrated";
  const canonicalMigrationStorageKey = "unique-guide-tourists-v3-mobile-migrated";
  const returnContextStorageKey = "unique-guide-mobile-leads-return-v1";
  const leadStorageKey = "unique-guide-leads-v2";
  const legacyLeadStorageKey = "unique-guide-leads-v1";
  const routeCityIds = {
    "Пекин": "route-beijing-1",
    "Сиань": "route-xian-1",
    "Шанхай": "route-shanghai-1",
    "Пекин (2)": "route-beijing-2",
  };
  tourOptions.forEach(tour => tour.route.forEach(city => { routeCityIds[city.name] = city.id; }));

  function canonicalTourist(values) {
    const tourist = {
      id: "", leadTouristId: "", contactId: null, dealId: "", leadId: "", tourId: null, lead: "", leadStatus: "Новый", tourStatus: "Ожидает",
      firstName: "", lastName: "", middleName: "", birthDate: "", phone: "", email: "", citizenship: "Россия",
      domesticPassport: "", domesticIssuedBy: "", registrationAddress: "", latinName: "", passport: "", passportExpiry: "",
      scans: [], groupId: null, groupRepresentative: false, route: [], type: "Взрослый", isPrimary: false,
      notes: "", guideComment: "", preferredChannel: "", statusByCity: {},
      ...values,
    };
    if (!tourist.notes && tourist.internalNote) tourist.notes = tourist.internalNote;
    delete tourist.internalNote;
    tourist.name = [tourist.lastName, tourist.firstName, tourist.middleName].filter(Boolean).join(" ");
    tourist.initials = [tourist.lastName, tourist.firstName].map(part => part.charAt(0)).join("").toUpperCase();
    tourist.scans = Array.isArray(tourist.scans) ? tourist.scans : [];
    return tourist;
  }

  const canonicalSeedTourists = [
    canonicalTourist({
      id: "t1", leadTouristId: "lt-1042-1", contactId: "contact-201", dealId: "deal-501", leadId: "lead-1042", tourId: "china", lead: "Лид Соколовы",
      firstName: "Анна", lastName: "Соколова", middleName: "Игоревна", birthDate: "1989-04-18", phone: "+7 916 555-12-34", email: "anna.sokolova@example.com",
      domesticPassport: "45 18 456789", domesticIssuedBy: "ГУ МВД России по г. Москве", registrationAddress: "Москва, ул. Тверская, 12",
      latinName: "ANNA SOKOLOVA", passport: "72 3456789", passportExpiry: "2031-05-21", scans: [{ id: "scan-t1-1", name: "passport-anna.jpg", status: "ready" }],
      leadStatus: "Подтверждён", tourStatus: "Подтверждён", groupId: "family-sokolov", groupRepresentative: true,
      route: ["route-beijing-1", "route-xian-1", "route-shanghai-1"], isPrimary: true,
      notes: "Вегетарианское меню. Плательщик по заявке.", guideComment: "Встречать у выхода B.", preferredChannel: "WhatsApp",
    }),
    canonicalTourist({
      id: "t2", leadTouristId: "lt-1042-2", contactId: "contact-202", dealId: "deal-502", leadId: "lead-1042", tourId: "china", lead: "Лид Соколовы",
      firstName: "Илья", lastName: "Соколов", middleName: "Максимович", birthDate: "2012-11-03", phone: "+7 916 555-12-35", email: "ilya.sokolov@example.com",
      registrationAddress: "Москва, ул. Тверская, 12", latinName: "ILIA SOKOLOV", passport: "72 1122334", passportExpiry: "2026-11-18",
      leadStatus: "Подтверждён", tourStatus: "Подтверждён", groupId: "family-sokolov", type: "Ребёнок",
      route: ["route-beijing-1", "route-xian-1", "route-shanghai-1"], guideComment: "Аллергия на арахис.", preferredChannel: "Telegram",
    }),
    canonicalTourist({
      id: "t3", leadTouristId: "lt-1048-1", contactId: "contact-203", dealId: "deal-503", leadId: "lead-1048", tourId: "china", lead: "Лид Орлова",
      firstName: "Марина", lastName: "Орлова", middleName: "Сергеевна", birthDate: "1991-07-22", phone: "+7 701 222-41-90", email: "marina.orlova@example.kz", citizenship: "Казахстан",
      latinName: "MARINA ORLOVA", passport: "N12345678", passportExpiry: "2030-02-10", scans: [{ id: "scan-t3-1", name: "passport-marina.pdf", status: "ready" }],
      leadStatus: "Подтверждён", route: ["route-beijing-1", "route-xian-1", "route-shanghai-1", "route-beijing-2"], isPrimary: true,
      notes: "Связь после 10:00 по Москве.", guideComment: "Говорит по-английски.", preferredChannel: "Telegram",
    }),
    canonicalTourist({
      id: "t4", leadTouristId: "lt-1048-2", dealId: "deal-504", leadId: "lead-1048", tourId: "china", lead: "Лид Орлова",
      firstName: "Денис", lastName: "Волков", middleName: "Андреевич", birthDate: "2024-01-16", type: "Младенец", leadStatus: "Подтверждён",
      route: ["route-beijing-1", "route-shanghai-1"], notes: "Контакт через основного туриста.", guideComment: "Нужна детская кроватка.",
    }),
    canonicalTourist({
      id: "lead-tourist-1051", leadTouristId: "lt-1051-1", contactId: "contact-205", dealId: "deal-505", leadId: "lead-1051", tourId: "china", lead: "Лид Волков",
      firstName: "Денис", lastName: "Волков", middleName: "Олегович", birthDate: "1984-06-20", phone: "+7 985 600-71-04", email: "denis@example.ru",
      registrationAddress: "Казань", leadStatus: "Связались", route: ["route-beijing-1", "route-shanghai-1"], isPrimary: true,
    }),
    canonicalTourist({
      id: "t5", leadTouristId: "lt-1033-1", contactId: "contact-206", dealId: "deal-506", leadId: "lead-1033", lead: "Лид Морозов",
      firstName: "Олег", lastName: "Морозов", phone: "+7 926 774-30-10", email: "oleg@example.ru", leadStatus: "Потерян", tourStatus: "Не участвует", isPrimary: true,
    }),
  ];

  sharedMock.supplementalTourists.forEach(seed => {
    if (!canonicalSeedTourists.some(tourist => tourist.id === seed.id)) canonicalSeedTourists.push(canonicalTourist(JSON.parse(JSON.stringify(seed))));
  });

  function loadCanonicalTourists() {
    try {
      const currentRaw = window.localStorage?.getItem(canonicalTouristStorageKey);
      if (currentRaw != null) {
        const current = JSON.parse(currentRaw);
        if (!Array.isArray(current)) return [];
        return current.filter(item => item?.id).map(item => {
          const seed = canonicalSeedTourists.find(candidate => candidate.id === item.id);
          return canonicalTourist({ ...(seed || {}), ...item });
        });
      }

      const legacyRaw = window.localStorage?.getItem(legacyCanonicalTouristStorageKey);
      if (legacyRaw == null) return canonicalSeedTourists.map(canonicalTourist);
      const legacy = JSON.parse(legacyRaw);
      if (!Array.isArray(legacy)) return canonicalSeedTourists.map(canonicalTourist);

      const migrated = legacy.filter(item => item?.id).map(item => {
        const seed = canonicalSeedTourists.find(candidate => candidate.id === item.id);
        return canonicalTourist({ ...(seed || {}), ...item });
      });
      const migratedIds = new Set(migrated.map(tourist => tourist.id));
      const legacySeedIds = new Set(["t1", "t2", "t3", "t4"]);
      if (window.localStorage?.getItem(legacyCanonicalMigrationStorageKey) === "1") {
        legacySeedIds.add("t5");
        legacySeedIds.add("lead-tourist-1051");
      }
      canonicalSeedTourists.forEach(seed => {
        if (!legacySeedIds.has(seed.id) && !migratedIds.has(seed.id)) migrated.push(canonicalTourist(seed));
      });
      window.localStorage?.setItem(canonicalTouristStorageKey, JSON.stringify(migrated));
      window.localStorage?.setItem(canonicalMigrationStorageKey, "1");
      return migrated;
    } catch (error) {
      console.warn("Canonical tourist storage is unavailable", error);
      return canonicalSeedTourists.map(canonicalTourist);
    }
  }

  const canonicalTourists = loadCanonicalTourists();

  function saveCanonicalTourists() {
    try {
      window.localStorage?.setItem(canonicalTouristStorageKey, JSON.stringify(canonicalTourists));
      window.localStorage?.setItem(canonicalMigrationStorageKey, "1");
    } catch (error) {
      console.warn("Canonical tourist storage is unavailable", error);
    }
  }

  function leadForStorage(lead) {
    const stored = { ...lead };
    delete stored.tourists;
    return stored;
  }

  function normalizeTask(task, index = 0) {
    if (task?.title) return {
      title: task.title,
      description: task.description || "",
      priority: ["low", "medium", "high", "urgent"].includes(task.priority) ? task.priority : "medium",
      status: ["todo", "in_progress", "done"].includes(task.status) ? task.status : "todo",
      dueDate: task.dueDate || "",
    };
    return {
      title: task?.text || "Задача " + (index + 1),
      description: "",
      priority: "medium",
      status: task?.done ? "done" : "todo",
      dueDate: task?.date && /^\d{4}-\d{2}-\d{2}$/.test(task.date) ? task.date : "",
    };
  }

  function normalizeLead(lead) {
    if (lead.stage === "confirmed") lead.stage = "converted";
    if (!stageOrder.includes(lead.stage)) lead.stage = "new";
    lead.source = ({ "Сайт": "form", "Рекомендация": "referral", "Telegram": "telegram", "Повторный клиент": "direct" })[lead.source] || lead.source || "direct";
    lead.category = ({ "Индивидуальный": "not_segmented", "Пара": "category_ab", "Семья": "category_ab", "VIP": "vip" })[lead.category] || lead.category || "not_segmented";
    lead.roomType = Array.isArray(lead.roomType) ? lead.roomType : (lead.accommodation?.room ? [lead.accommodation.room] : []);
    lead.hotelCategory = Array.isArray(lead.hotelCategory) ? lead.hotelCategory : [];
    lead.transfers = Array.isArray(lead.transfers) ? lead.transfers : [];
    lead.meals = Array.isArray(lead.meals) ? lead.meals : [];
    if (!lead.note && lead.notes) lead.note = lead.notes;
    lead.tasks = (lead.tasks || []).map(normalizeTask);
    lead.selectedCityIds = Array.isArray(lead.selectedCityIds)
      ? lead.selectedCityIds
      : (lead.routeCities || []).map(city => routeCityIds[city]).filter(Boolean);
    return lead;
  }

  function loadStoredLeads() {
    try {
      const currentRaw = window.localStorage?.getItem(leadStorageKey);
      const legacyRaw = currentRaw == null ? window.localStorage?.getItem(legacyLeadStorageKey) : null;
      const raw = currentRaw == null ? legacyRaw : currentRaw;
      if (raw == null) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      const seeds = new Map(leads.map(lead => [lead.id, lead]));
      const restored = saved.filter(lead => lead?.id).map(lead => normalizeLead({
        messages: [], documents: [], tasks: [], touristIds: [], accommodation: { hotel: "", room: "" },
        ...(seeds.get(lead.id) || {}),
        ...lead,
        tourists: [],
      }));
      const restoredIds = new Set(restored.map(lead => lead.id));
      if (currentRaw == null) {
        const isCompleteLegacySnapshot = saved.length === 0 || saved.some(lead => lead?.code);
        if (!isCompleteLegacySnapshot) {
          ["lead-1042", "lead-1048", "lead-1051", "lead-1033"].forEach(id => {
            const seed = seeds.get(id);
            if (seed && !restoredIds.has(id)) restored.push(normalizeLead(JSON.parse(JSON.stringify(seed))));
          });
        }
        sharedMock.supplementalLeads.forEach(seed => {
          if (!restoredIds.has(seed.id)) restored.push(normalizeLead(JSON.parse(JSON.stringify(seed))));
        });
      }
      leads.splice(0, leads.length, ...restored);
      managerAssignedLeadIds.clear();
      leads.forEach(lead => { if (lead.manager === "Елена Воронова" && !lead.archived) managerAssignedLeadIds.add(lead.id); });
      if (currentRaw == null) saveLeads();
    } catch (error) {
      console.warn("Lead storage is unavailable", error);
    }
  }

  function saveLeads() {
    try {
      window.localStorage?.setItem(leadStorageKey, JSON.stringify(leads.map(leadForStorage)));
    } catch (error) {
      console.warn("Lead storage is unavailable", error);
    }
  }

  function savePrototypeData() {
    saveCanonicalTourists();
    saveLeads();
  }

  loadStoredLeads();
  leads.forEach(normalizeLead);

  function restorePrototypeSequence() {
    const values = [];
    leads.forEach(lead => {
      const idMatch = String(lead.id || "").match(/^lead-proto-(\d+)$/);
      const codeMatch = String(lead.code || "").match(/^L-10(\d+)$/);
      if (idMatch) values.push(Number(idMatch[1]));
      if (codeMatch) values.push(Number(codeMatch[1]));
    });
    canonicalTourists.forEach(tourist => {
      const touristMatch = String(tourist.id || "").match(/^tourist-proto-(\d+)-/);
      if (touristMatch) values.push(Number(touristMatch[1]));
    });
    sequence = Math.max(sequence, ...values.filter(Number.isFinite));
  }

  restorePrototypeSequence();

  function leadTourists(lead) {
    return canonicalTourists.filter(tourist => tourist.leadId === lead.id);
  }

  function leadLabel(lead) {
    return "Лид " + (lead.lastName || lead.code);
  }

  function stageLabel(stage) {
    return stages[stage]?.[0] || stage;
  }

  function routeForLead(lead) {
    if (lead.eventId !== "china") return [];
    return (lead.routeCities || []).map(city => routeCityIds[city]).filter(Boolean);
  }

  function syncLeadTouristContext(lead) {
    const linked = leadTourists(lead);
    linked.forEach(tourist => {
      tourist.lead = leadLabel(lead);
      tourist.leadStatus = stageLabel(lead.stage);
      tourist.tourId = lead.eventId;
    });
    const primary = linked.find(tourist => tourist.isPrimary) || linked[0];
    if (primary) {
      Object.assign(lead, {
        firstName: primary.firstName,
        lastName: primary.lastName,
        middleName: primary.middleName,
        phone: primary.phone,
        email: primary.email,
      });
    }
    lead.tourists = linked;
    lead.touristIds = linked.map(tourist => tourist.id);
  }

  leads.forEach(syncLeadTouristContext);

  function readReturnContext() {
    try {
      const value = JSON.parse(window.localStorage?.getItem(returnContextStorageKey) || "null");
      window.localStorage?.removeItem(returnContextStorageKey);
      return value;
    } catch (error) {
      return null;
    }
  }

  const linkedParams = pageParams;
  const linkedLeadId = linkedParams.get("lead");
  const hasLinkedLead = leads.some(lead => lead.id === linkedLeadId);
  const returnContext = readReturnContext();
  const canRestoreContext = hasLinkedLead && returnContext?.leadId === linkedLeadId;
  const linkedRole = linkedParams.get("role") === "guide" ? "viewer" : linkedParams.get("role");
  const restoredRole = returnContext?.role === "guide" ? "viewer" : returnContext?.role;
  const initialRole = linkedRole != null
    ? (roleLabels[linkedRole] ? linkedRole : "viewer")
    : restoredRole != null
      ? (roleLabels[restoredRole] ? restoredRole : "viewer")
      : "manager";
  const initialOffline = linkedParams.has("offline") ? linkedParams.get("offline") === "1" : Boolean(returnContext?.offline);
  const requestedEdit = hasLinkedLead && linkedParams.get("edit") === "1";
  const requestedCreate = linkedParams.get("newLead") === "1";
  const linkedLead = leads.find(lead => lead.id === linkedLeadId);
  const requestedTab = linkedParams.get("tab");
  const normalizedRequestedTab = requestedTab === "edit" || requestedTab === "overview" || requestedTab === "tourists" ? "details" : requestedTab;
  const canOpenRequestedEdit = requestedEdit && !initialOffline && (initialRole === "admin" || (initialRole === "manager" && managerAssignedLeadIds.has(linkedLeadId)));
  const canOpenRequestedCreate = requestedCreate && !initialOffline && (initialRole === "admin" || initialRole === "manager");
  const state = {
    screen: canOpenRequestedEdit || canOpenRequestedCreate ? "lead-form" : (hasLinkedLead ? "detail" : "list"), listMode: canRestoreContext ? returnContext.listMode || "list" : "list", activeLeadId: hasLinkedLead ? linkedLeadId : null,
    detailTab: canRestoreContext ? (returnContext.detailTab === "edit" || returnContext.detailTab === "overview" || returnContext.detailTab === "tourists" ? "details" : returnContext.detailTab || "details") : normalizedRequestedTab || "details",
    query: canRestoreContext ? returnContext.query || "" : "", showArchive: canRestoreContext ? Boolean(returnContext.showArchive) : false, toast: "", pendingLead: null, pendingEditValues: null, duplicateIds: [], mergeTargetId: null, mergeSearch: "", reconcileReport: null,
    filters: canRestoreContext ? { statuses: [], source: "all", category: "all", tour: "all", outcome: "all", date: "all", ...(returnContext.filters || {}) } : { statuses: [], source: "all", category: "all", tour: "all", outcome: "all", date: "all" },
    pendingScrollTop: canRestoreContext ? Number(returnContext.scrollTop || 0) : null,
    role: initialRole,
    offline: initialOffline,
    accessReturnScreen: hasLinkedLead ? "detail" : "list",
    wazzupState: ["settings-loading", "not-configured", "no-contact", "loading", "error", "not-loaded", "loaded"].includes(linkedParams.get("wazzup")) ? linkedParams.get("wazzup") : "loaded",
    taskEditor: null,
    taskDeletePendingIndex: null,
    editLeadSection: null,
    leadReadScrollTop: null,
    deleteLeadReturnScreen: null,
  };
  if (!state.offline) savePrototypeData();

  const esc = value => String(value ?? "").replace(/[&<>"']/g, symbol => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[symbol]);
  const activeLead = () => leads.find(lead => lead.id === state.activeLeadId);
  const isLeadRole = () => state.role === "admin" || state.role === "manager";
  const canAccessLead = lead => Boolean(lead && (state.role === "admin" || (state.role === "manager" && managerAssignedLeadIds.has(lead.id))));
  const accessibleLeads = () => state.role === "admin" ? leads : state.role === "manager" ? leads.filter(lead => managerAssignedLeadIds.has(lead.id)) : [];
  const fullName = person => [person.lastName, person.firstName, person.middleName].filter(Boolean).join(" ");
  const initials = person => ((person.firstName || "?")[0] + (person.lastName || "?")[0]).toUpperCase();
  const stageBadge = stage => '<span class="badge ' + stages[stage][1] + '">' + stages[stage][0] + "</span>";
  const unique = key => [...new Set(accessibleLeads().map(lead => lead[key]).filter(Boolean))];

  function tourIdForTitle(title) {
    return Object.prototype.hasOwnProperty.call(tourIdsByTitle, title) ? tourIdsByTitle[title] : null;
  }

  function tourById(id) {
    return tourOptions.find(tour => tour.id === id) || null;
  }

  function optionLabel(group, value) {
    const match = (fieldOptions[group] || []).find(option => option[0] === value || option[1] === value);
    return match ? match[1] : value || "Не выбрано";
  }

  function listLabel(group, values) {
    const list = Array.isArray(values) ? values : (values ? [values] : []);
    return list.length ? list.map(value => optionLabel(group, value)).join(", ") : "Не выбрано";
  }

  function currencyField(label, name, value, currencyName, currency, currencyLabel) {
    return '<div class="currency-field"><label class="field"><span>' + esc(label) + '</span><input name="' + esc(name) + '" inputmode="decimal" value="' + esc(value || "") + '" placeholder="0,00"></label><label class="field currency-select"><span>' + esc(currencyLabel || "Валюта") + '</span><select name="' + esc(currencyName) + '">' + ["RUB", "USD", "CNY", "EUR"].map(item => '<option value="' + item + '" ' + (item === currency ? "selected" : "") + '>' + item + '</option>').join("") + '</select></label></div>';
  }

  function checkboxOptions(name, options, selected) {
    const selectedValues = Array.isArray(selected) ? selected : (selected ? [selected] : []);
    return '<div class="choice-grid">' + options.map(([value, label]) => '<label class="choice-card"><input type="checkbox" name="' + esc(name) + '" value="' + esc(value) + '" ' + (selectedValues.includes(value) || selectedValues.includes(label) ? "checked" : "") + '><span>' + esc(label) + '</span></label>').join("") + '</div>';
  }

  function capabilitiesForLead(lead) {
    const isAdmin = state.role === "admin";
    const isAssignedManager = state.role === "manager" && Boolean(lead && managerAssignedLeadIds.has(lead.id));
    const canWrite = !state.offline && (isAdmin || isAssignedManager);
    return {
      canSeePrivate: isAdmin || isAssignedManager,
      canEdit: canWrite,
      canChangeStatus: canWrite,
      canAddTourist: canWrite,
      canMerge: canWrite,
      canArchive: canWrite,
      canDelete: !state.offline && isAdmin,
      canMutateMessages: canWrite,
      canMutateDocuments: canWrite,
      canMutateTasks: canWrite,
    };
  }

  function globalCapabilities() {
    return {
      canCreateLead: !state.offline && (state.role === "admin" || state.role === "manager"),
    };
  }

  function denialMessage(lead, adminOnly = false) {
    if (state.offline) return "Подключитесь к интернету, чтобы изменить данные";
    if (adminOnly) return "Действие доступно только администратору";
    if (state.role === "manager" && lead && !managerAssignedLeadIds.has(lead.id)) return "Лид не назначен текущему менеджеру";
    return "Роль «" + roleLabels[state.role] + "» работает только в режиме просмотра";
  }

  function requireLeadCapability(lead, capability, adminOnly = false) {
    if (lead && capabilitiesForLead(lead)[capability]) return true;
    showToast(denialMessage(lead, adminOnly));
    return false;
  }

  function requireCreateCapability() {
    if (globalCapabilities().canCreateLead) return true;
    showToast(denialMessage(null));
    return false;
  }

  function accessBanner(lead) {
    if (state.offline) return '<div class="notice warning"><strong>Нет подключения</strong><span>Сохранённые данные доступны, любые изменения заблокированы.</span></div>';
    if (lead && state.role === "manager" && !managerAssignedLeadIds.has(lead.id)) return '<div class="notice"><strong>Только просмотр</strong><span>Этот лид не назначен текущему менеджеру.</span></div>';
    if (state.role === "viewer" || state.role === "escort") return '<div class="notice"><strong>Раздел недоступен</strong><span>Роль «' + esc(roleLabels[state.role]) + '» не имеет доступа к лидам.</span></div>';
    return "";
  }

  function rememberReturnContext(leadId, detailTab = "details") {
    try {
      const scroller = app.querySelector?.(".detail-scroll") || app.querySelector?.(".lead-workspace-scroll");
      window.localStorage?.setItem(returnContextStorageKey, JSON.stringify({
        leadId,
        detailTab,
        listMode: state.listMode,
        query: state.query,
        filters: state.filters,
        showArchive: state.showArchive,
        scrollTop: scroller?.scrollTop || 0,
        role: state.role,
        offline: state.offline,
      }));
    } catch (error) {
      console.warn("Return context storage is unavailable", error);
    }
  }

  function openCanonicalTourist(touristId, leadId, detailTab = "details") {
    const tourist = canonicalTourists.find(item => item.id === touristId);
    const lead = leads.find(item => item.id === leadId);
    if (!canAccessLead(lead) || !tourist || tourist.leadId !== leadId) {
      showToast("Нет доступа к туристу этого лида");
      return;
    }
    rememberReturnContext(leadId, detailTab);
    const tourId = tourist?.tourId || lead?.eventId || null;
    const params = new URLSearchParams({
      view: "tourists",
      tourist: touristId,
      returnLead: leadId,
      returnTab: detailTab,
      origin: "mobile-leads",
      role: state.role,
      offline: state.offline ? "1" : "0",
    });
    if (tourId) params.set("tourId", tourId);
    window.location.href = "./tour-operations.html?" + params.toString();
  }

  function openTourSummary(lead, detailTab = "details") {
    if (!canAccessLead(lead) || !lead.eventId) {
      showToast("Нет доступа к сводной этого лида");
      return;
    }
    rememberReturnContext(lead.id, detailTab);
    const params = new URLSearchParams({
      lead: lead.id,
      tourId: lead.eventId,
      returnLead: lead.id,
      returnTab: detailTab,
      origin: "mobile-leads",
      role: state.role,
      offline: state.offline ? "1" : "0",
    });
    window.location.href = "./tour-operations.html?" + params.toString();
  }

  function createCanonicalTouristForLead(lead, values = {}) {
    sequence += 1;
    const id = values.id || "tourist-proto-" + sequence + "-" + Date.now();
    return canonicalTourist({
      id,
      leadTouristId: values.leadTouristId || "lt-" + id,
      contactId: values.contactId || null,
      dealId: values.dealId || "deal-" + id,
      leadId: lead.id,
      tourId: lead.eventId,
      lead: leadLabel(lead),
      leadStatus: stageLabel(lead.stage),
      tourStatus: lead.eventId ? "Ожидает" : "Не участвует",
      route: routeForLead(lead),
      firstName: values.firstName || "",
      lastName: values.lastName || lead.lastName || "",
      middleName: values.middleName || "",
      birthDate: values.birthDate || "",
      phone: values.phone || "",
      email: values.email || "",
      citizenship: values.citizenship || "Россия",
      type: values.type || "Взрослый",
      isPrimary: Boolean(values.isPrimary),
      guideComment: values.guideComment || "",
      notes: values.notes || values.internalNote || "",
    });
  }

  function showToast(message) {
    state.toast = message;
    render();
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { state.toast = ""; render(); }, 2300);
  }

  function statusBar() {
    return '<div class="status-bar"><span>9:41</span><span>● ● ▰</span></div>';
  }

  function bottomNav() {
    const leadAccess = isLeadRole();
    const items = leadAccess
      ? [["tours", "Туры", icons.tours], ["tourists", "Туристы", icons.people], ["leads", "Лиды", icons.leads]]
      : [["tours", "Туры", icons.tours], ["tourists", "Туристы", icons.people]];
    return '<nav class="bottom-nav nav-count-' + items.length + (leadAccess ? "" : " restricted-nav") + '" aria-label="Основная навигация">' + items.map(([id, label, icon]) =>
      '<button class="nav-item ' + (leadAccess && id === "leads" ? "active" : "") + '" data-action="nav-placeholder" data-nav="' + id + '">' + icon + '<span>' + label + "</span></button>"
    ).join("") + "</nav>";
  }

  function chrome(content, options = {}) {
    return statusBar() + (options.header || "") + content + (options.nav === false ? "" : bottomNav()) +
      (state.toast ? '<div class="toast">' + esc(state.toast) + "</div>" : "");
  }

  function appHeader(title, subtitle, trailing = "") {
    return '<header class="app-top"><div class="top-row"><span class="user-label">MVP · мобильная CRM</span><button type="button" class="role-badge" data-action="open-access">' + esc(roleLabels[state.role]) + (state.offline ? " · Offline" : "") + '</button></div>' +
      '<div class="section-head"><div><h2>' + esc(title) + '</h2><small>' + esc(subtitle) + '</small></div>' + trailing + "</div></header>";
  }

  function filterCount() {
    return state.filters.statuses.length + Object.entries(state.filters).filter(([key, value]) => key !== "statuses" && value !== "all").length + (state.showArchive ? 1 : 0);
  }

  function visibleLeads() {
    const query = state.query.trim().toLowerCase();
    return accessibleLeads().filter(lead => {
      if (lead.archived !== state.showArchive) return false;
      if (query && ![fullName(lead), lead.phone, lead.email, lead.code, lead.tour].join(" ").toLowerCase().includes(query)) return false;
      if (state.filters.statuses.length && !state.filters.statuses.includes(lead.stage)) return false;
      if (state.filters.source !== "all" && lead.source !== state.filters.source) return false;
      if (state.filters.category !== "all" && lead.category !== state.filters.category) return false;
      if (state.filters.tour !== "all" && lead.tour !== state.filters.tour) return false;
      if (state.filters.outcome !== "all" && lead.outcome !== state.filters.outcome) return false;
      if (state.filters.date === "today" && !/сегодня|только что/.test(lead.updated)) return false;
      if (state.filters.date === "week" && !["28.07.2026", "31.07.2026", "01.08.2026", "03.08.2026"].includes(lead.created)) return false;
      if (state.filters.date === "month" && !/\.(07|08)\.2026$/.test(lead.created)) return false;
      return true;
    });
  }

  function leadCard(lead, compact = false) {
    const route = lead.eventId ? lead.tour : "Тур не выбран";
    return '<article class="lead-card ' + (compact ? "compact" : "") + '" data-open-lead="' + lead.id + '">' +
      '<button class="card-hit" data-open-lead="' + lead.id + '" aria-label="Открыть ' + esc(fullName(lead)) + '"></button>' +
      '<div class="card-row"><span class="avatar" style="--avatar-color:' + esc(lead.color) + '">' + initials(lead) + '</span><span class="lead-main"><span class="lead-name">' + esc(fullName(lead)) + '</span><span class="lead-meta">' + esc(lead.code + " · " + route) + '</span></span>' + stageBadge(lead.stage) + "</div>" +
      (compact ? "" : '<div class="lead-tags"><span>' + esc(optionLabel("clientCategory", lead.category)) + '</span><span>' + lead.tourists.length + ' турист' + (lead.tourists.length > 1 ? "а" : "") + '</span><span>' + esc(lead.manager.split(" ")[0]) + "</span></div>") +
      '<div class="card-bottom"><span>' + esc(optionLabel("source", lead.source)) + '</span><span>' + esc(lead.updated) + "</span></div></article>";
  }

  function leadList() {
    const visible = visibleLeads();
    const available = accessibleLeads();
    const counts = Object.fromEntries(stageOrder.map(stage => [stage, available.filter(lead => !lead.archived && lead.stage === stage).length]));
    const statusFilters = '<div class="quick-filters">' + stageOrder.map(stage =>
      '<button class="quick-filter ' + (state.filters.statuses.includes(stage) ? "active" : "") + '" data-quick-status="' + stage + '"><span>' + stages[stage][0] + '</span><b>' + counts[stage] + "</b></button>"
    ).join("") + "</div>";
    const stats = '<div class="stats-grid"><div><span>Активные</span><strong>' + available.filter(lead => !lead.archived && lead.stage !== "lost").length + '</strong></div><div><span>Подтверждены</span><strong>' + counts.converted + '</strong></div><div><span>Туристов</span><strong>' + available.filter(lead => !lead.archived).reduce((sum, lead) => sum + lead.tourists.length, 0) + "</strong></div></div>";
    const toolbar = '<div class="toolbar"><label class="search-wrap"><span>⌕</span><input class="search" id="lead-search" value="' + esc(state.query) + '" placeholder="Имя, телефон, номер" aria-label="Поиск по лидам"></label><button class="icon-btn filter-btn ' + (filterCount() ? "active" : "") + '" data-action="filters" aria-label="Фильтры">☷' + (filterCount() ? '<i>' + filterCount() + "</i>" : "") + "</button></div>";
    const view = '<div class="list-controls"><div class="view-switch"><button class="' + (state.listMode === "list" ? "active" : "") + '" data-list-mode="list">Список</button><button class="' + (state.listMode === "board" ? "active" : "") + '" data-list-mode="board">Канбан</button></div><button class="archive-toggle ' + (state.showArchive ? "active" : "") + '" data-action="toggle-archive">' + (state.showArchive ? "Активные" : "Архив") + "</button></div>";
    let content;
    if (state.listMode === "board" && !state.showArchive) {
      content = '<div class="kanban" aria-label="Канбан лидов">' + stageOrder.map(stage => {
        const cards = visible.filter(lead => lead.stage === stage);
        return '<section class="kanban-column"><div class="kanban-head"><strong>' + stages[stage][0] + '</strong><span>' + cards.length + '</span></div>' + (cards.map(lead => leadCard(lead, true)).join("") || '<div class="kanban-empty">Нет лидов</div>') + "</section>";
      }).join("") + "</div>";
    } else {
      content = '<div class="lead-cards">' + (visible.map(lead => leadCard(lead)).join("") || '<div class="empty"><h3>Лиды не найдены</h3><p>Измените фильтры или создайте новую заявку.</p></div>') + "</div>";
    }
    const createAction = globalCapabilities().canCreateLead ? '<button class="fab" data-action="new-lead"><span class="fab-plus">+</span><span class="fab-label">Создать лид</span></button>' : "";
    return chrome('<div class="scroll lead-workspace-scroll">' + accessBanner(null) + statusFilters + stats + toolbar + view + content + '</div>' + createAction, {
      header: appHeader("Лиды", state.showArchive ? "Архивные заявки" : "CRM · " + available.filter(lead => !lead.archived).length + " активных"),
    });
  }

  function detailHeader(lead, subtitle) {
    const actions = capabilitiesForLead(lead).canEdit ? '<button class="icon-btn" data-action="lead-menu" aria-label="Действия">•••</button>' : "";
    return '<div class="sheet-head"><button class="back-btn" data-action="back-list" aria-label="Назад">‹</button><span class="avatar dark">' + initials(lead) + '</span><div class="sheet-title"><h2>' + esc(fullName(lead)) + '</h2><p>' + esc(subtitle || lead.code + " · " + lead.tour) + '</p></div><button type="button" class="role-badge" data-action="open-access">' + esc(roleLabels[state.role]) + '</button>' + actions + '</div>';
  }

  function paymentStatusLabel(value) {
    return ({ paid: "💰 Оплачено", pending: "⏳ Ожидается оплата", expired: "⚠️ Оплата просрочена", partial: "Частично оплачено" })[value] || value || "Не указано";
  }

  function paymentMethodLabel(value) {
    return ({ card: "Карта", tbank: "Т-Банк", cash: "Наличные", bank_transfer: "Банковский перевод" })[value] || value || "Не указано";
  }

  function outcomeLabel(lead) {
    const postponed = { next_year: "В следующем году", thinking: "Ещё думает", other_country: "Выбрал другую страну", waiting_passport: "Ожидает паспорт" };
    const failed = { missing_contact: "Не удалось связаться", expensive: "Слишком дорого", competitor: "Выбрал конкурента", not_target: "Нецелевой лид" };
    if (lead.outcome === "failed") return "Потерян · " + (failed[lead.outcomeReason] || lead.outcomeReason || "причина не указана");
    return "Отложен" + (lead.outcomeDate ? " до " + lead.outcomeDate : "") + " · " + (postponed[lead.outcomeReason] || lead.outcomeReason || "причина не указана");
  }

  function inlineMergeCandidates(lead) {
    const query = state.mergeSearch.trim().toLowerCase();
    if (!query) return "";
    const candidates = accessibleLeads().filter(item => item.id !== lead.id && !item.archived).filter(item =>
      [item.firstName, item.lastName, item.middleName, item.phone, item.email, item.telegram].filter(Boolean).some(value => String(value).toLowerCase().includes(query))
    ).slice(0, 8);
    if (!candidates.length) return '<p class="helper">Подходящие лиды не найдены.</p>';
    return '<div class="merge-results">' + candidates.map(item => '<button type="button" class="merge-result ' + (state.mergeTargetId === item.id ? "selected" : "") + '" data-action="select-merge-target" data-id="' + item.id + '"><strong>' + esc(fullName(item)) + '</strong><span>' + esc([item.phone, item.email, item.telegram].filter(Boolean).join(" • ") || "Нет контактов") + '</span></button>').join("") + '</div>';
  }

  function summaryCard(lead) {
    let action;
    if (!lead.eventId) action = '<div class="notice"><strong>Тур не выбран</strong><span>Выберите тур, чтобы открыть сводную.</span></div>';
    else if (lead.stage !== "converted") action = '<div class="notice warning"><strong>Логистика пока недоступна</strong><span>Сводная рейсов, отелей и отъездов откроется после подтверждения лида.</span></div>';
    else action = '<a class="primary blue wide button-link" data-action="open-tour-summary" href="./tour-operations.html?lead=' + encodeURIComponent(lead.id) + '&tourId=' + encodeURIComponent(lead.eventId) + '&returnLead=' + encodeURIComponent(lead.id) + '&returnTab=details&origin=mobile-leads&role=' + encodeURIComponent(state.role) + '&offline=' + (state.offline ? "1" : "0") + '">Открыть сводную тура</a><p class="helper">Откроется весь тур с фильтром по этому лиду.</p>';
    return '<section class="block summary-card"><div class="summary-head"><span class="summary-icon">▦</span><div><strong>Сводная по туру</strong><span>' + lead.tourists.length + ' туриста · рейсы, отели и отъезды</span></div></div>' + action + '</section>';
  }

  function leadReadHeading(title, section, canEdit) {
    const edit = canEdit ? '<button type="button" data-action="edit-lead-section" data-section="' + esc(section) + '">Изменить</button>' : "";
    return '<div class="block-title"><h3>' + esc(title) + '</h3>' + edit + '</div>';
  }

  function routePositionsLabel(lead) {
    const selectedTour = tourById(lead.eventId);
    const selectedIds = Array.isArray(lead.selectedCityIds) ? lead.selectedCityIds : [];
    if (!selectedTour || !selectedIds.length) return "Не выбраны";
    return selectedIds.map(id => {
      const city = selectedTour.route.find(item => item.id === id);
      return city ? city.name + " · " + city.id : id;
    }).join(" → ");
  }

  function leadOverview(lead) {
    const capability = capabilitiesForLead(lead);
    const reconcile = (state.role === "admin" || state.role === "manager") && lead.eventId
      ? '<section class="block dashed-block"><h3>ПРОВЕРИТЬ СВЯЗИ ЛИД-ТУР</h3><p class="helper top-helper">Проверяет цепочку contact → deal → city visits для каждого туриста.</p>' + (state.reconcileReport ? '<div class="notice"><strong>Все связи корректны</strong><span>Контакты: 0 · Связи: 0 · Сделки: 0 · Визиты: 0</span></div>' : "") + '<button type="button" class="secondary wide" data-action="reconcile">Проверить связи</button></section>'
      : "";
    const merge = capability.canMerge
      ? '<section class="block dashed-block"><h3>РУЧНОЕ ОБЪЕДИНЕНИЕ ЛИДОВ</h3><label class="field"><span>Поиск по имени, телефону, email или Telegram username</span><input id="merge-inline-search" value="' + esc(state.mergeSearch) + '" placeholder="Найдите лид для объединения"></label>' + inlineMergeCandidates(lead) + '<button type="button" class="secondary wide" data-action="confirm-merge" ' + (state.mergeTargetId ? "" : "disabled") + '>Объединить текущий лид</button></section>'
      : "";
    const privatePersonal = capability.canSeePrivate ? info("Телефон", lead.phone || "Не указан") + info("Telegram username", lead.telegram || "Не указано") + info("Email", lead.email || "Не указан") + (lead.telegramUserId ? info("Telegram User ID", lead.telegramUserId) : "") : "";
    const personal = '<section class="block" data-read-section="personal">' + leadReadHeading("ЛИЧНЫЕ ДАННЫЕ", "personal", capability.canEdit) + '<div class="info-grid">' +
      info("Фамилия *", lead.lastName) + info("Имя *", lead.firstName) + info("Отчество", lead.middleName || "Не указано") + privatePersonal + '</div></section>';
    const privatePayment = capability.canSeePrivate
      ? info("Стоимость тура", lead.tourCost || "0") + info("Валюта стоимости", lead.tourCostCurrency || "CNY") +
        info("Аванс", lead.advancePayment || "0") + info("Валюта аванса", lead.advancePaymentCurrency || "RUB") +
        info("Остаток", lead.remainingPayment || "0") + info("Валюта остатка", lead.remainingPaymentCurrency || "CNY") +
        info("Статус оплаты", paymentStatusLabel(lead.paymentStatus)) + info("Способ оплаты", paymentMethodLabel(lead.paymentMethod)) + info("Booking ID", lead.bookingId || "Не указан")
      : "";
    const tourPayment = '<section class="block" data-read-section="tour-payment">' + leadReadHeading("ТУР И ОПЛАТА", "tour-payment", capability.canEdit) + '<div class="info-grid">' + info("Тур", lead.tour || "Не выбран") + info("Позиции маршрута", routePositionsLabel(lead)) + privatePayment + info("Тип номера", listLabel("roomType", lead.roomType)) +
      info("Категория отелей", listLabel("hotelCategory", lead.hotelCategory)) + info("Трансферы", listLabel("transfers", lead.transfers)) + info("Питание", listLabel("meals", lead.meals)) + '</div></section>';
    const settings = '<section class="block" data-read-section="settings">' + leadReadHeading("НАСТРОЙКИ", "settings", capability.canEdit) + '<div class="info-grid">' + info("Категория клиента", optionLabel("clientCategory", lead.category)) + info("Статус *", stageLabel(lead.stage)) + info("Источник *", optionLabel("source", lead.source)) + info("Ответственный", lead.manager || "Не назначен") + info("Цветовая индикация", '<i class="color-dot" style="background:' + esc(lead.color) + '"></i> ' + esc(lead.color), true) + '</div></section>';
    const utmValues = [["utmSource", lead.utmSource], ["utmMedium", lead.utmMedium], ["utmCampaign", lead.utmCampaign], ["utmTerm", lead.utmTerm], ["utmContent", lead.utmContent], ["pageUrl", lead.pageUrl]].filter(item => item[1]);
    const utm = capability.canSeePrivate && utmValues.length ? '<section class="block"><h3>UTM-ТРЕКИНГ</h3><div class="info-grid">' + utmValues.map(item => info(item[0], item[1])).join("") + '</div></section>' : "";
    const notes = capability.canSeePrivate ? '<section class="block" data-read-section="notes">' + leadReadHeading("ПРИМЕЧАНИЕ", "notes", capability.canEdit) + '<p class="body-copy">' + esc(lead.note || "Нет примечания") + '</p></section>' : "";
    const outcome = lead.stage === "lost" ? '<div class="notice warning"><strong>Исход лида</strong><span>' + esc(outcomeLabel(lead)) + '</span></div>' : "";
    const deleteAction = state.role === "admin" ? '<button type="button" class="danger" data-action="request-delete-lead" ' + (capability.canDelete ? "" : "disabled") + '>Удалить лид</button>' : "";
    const updateAction = '<button type="button" class="primary" data-action="edit-lead" ' + (capability.canEdit ? "" : "disabled") + '>Обновить</button>';
    const actions = '<section class="block lead-form-action-row"><h3>ДЕЙСТВИЯ</h3><div class="inline-actions exact-lead-actions">' + deleteAction + updateAction + '</div></section>';
    return outcome + reconcile + merge + personal + tourPayment + settings + utm + notes + touristsTab(lead) + actions + summaryCard(lead);
  }

  function info(label, value, raw = false) {
    return '<div class="info"><span>' + esc(label) + '</span><strong>' + (raw ? value : esc(value)) + "</strong></div>";
  }

  function touristCard(tourist) {
    return '<button class="person-card person-button" data-action="open-unified-tourist" data-tourist="' + tourist.id + '"><span class="avatar">' + initials(tourist) + '</span><span class="lead-main"><span class="lead-name">' + esc(fullName(tourist)) + '</span><span class="lead-meta">' + esc(tourist.type + " · " + (tourist.birthDate || "дата рождения не заполнена")) + '</span></span>' + (tourist.isPrimary ? '<span class="badge confirmed">Основной</span>' : '<span class="chevron">›</span>') + "</button>";
  }

  function touristsTab(lead) {
    const actions = capabilitiesForLead(lead).canAddTourist ? '<div class="inline-actions"><button type="button" data-action="add-from-lead">Добавить из лида</button><button type="button" data-action="add-tourist">Добавить туриста</button></div>' : "";
    return '<section class="block"><div class="block-title stacked-title"><h3>ТУРИСТЫ · ' + lead.tourists.length + '</h3>' + actions + '</div><p class="helper top-helper">Основной турист показан первым. Карточка открывается в едином разделе «Туристы».</p>' + lead.tourists.slice().sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)).map(touristCard).join("") + "</section>";
  }

  function chatTab(lead) {
    if (!capabilitiesForLead(lead).canSeePrivate) return '<section class="state-card"><strong>Чат недоступен</strong><p>Контактные данные скрыты для текущей роли или неназначенного менеджера.</p></section>';
    const requestedState = state.offline ? "error" : ((!lead.phone && !lead.telegramUserId) ? "no-contact" : state.wazzupState);
    if (requestedState === "settings-loading") return '<section class="state-card"><span class="loader"></span><p>Проверяем настройки Wazzup24…</p></section>';
    if (requestedState === "not-configured") return '<section class="state-card"><strong>Wazzup24 не настроен</strong><p>Чтобы использовать WhatsApp-чат, настройте интеграцию Wazzup24.</p><button type="button" class="secondary" data-action="wazzup-settings">Перейти в настройки</button></section>';
    if (requestedState === "no-contact") return '<section class="state-card"><strong>Контактные данные не указаны</strong><p>Для чата нужен телефон или Telegram ID. Заполните телефон во вкладке «Редактировать» и сохраните.</p></section>';
    if (requestedState === "loading") return '<section class="state-card"><span class="loader"></span><p>Загрузка чата…</p></section>';
    if (requestedState === "error") return '<section class="state-card error-card"><strong>Ошибка загрузки чата</strong><p>' + (state.offline ? "Нет подключения к интернету" : "Не удалось получить ссылку на чат") + '</p><button type="button" class="secondary" data-action="refresh-chat">Повторить</button></section>';
    if (requestedState === "not-loaded") return '<section class="state-card"><strong>Чат не загружен</strong><button type="button" class="secondary" data-action="load-chat">Загрузить чат</button></section>';
    const messages = lead.messages.length ? lead.messages.map(message => '<div class="message ' + (message.own ? "own" : "") + '"><strong>' + esc(message.author) + '</strong><p>' + esc(message.text) + '</p><span>' + esc(message.time) + "</span></div>").join("") : '<div class="empty compact-empty"><h3>Сообщений нет</h3><p>Начните диалог с клиентом.</p></div>';
    const composer = capabilitiesForLead(lead).canMutateMessages ? '<form id="chat-form" class="composer"><input name="message" placeholder="Сообщение клиенту" required><button aria-label="Отправить">↑</button></form>' : "";
    return '<div class="chat-caption"><span>Чат ' + esc(optionLabel("source", lead.source) || "WhatsApp") + ' с ' + esc([lead.lastName, lead.firstName].filter(Boolean).join(" ")) + '</span><button type="button" data-action="refresh-chat" aria-label="Обновить чат">↻</button></div><section class="chat-thread">' + messages + "</section>" + composer;
  }

  function docsTab(lead) {
    if (!capabilitiesForLead(lead).canSeePrivate) return '<section class="state-card"><strong>Документы недоступны</strong><p>Скачивание документов доступно администратору и назначенному менеджеру.</p></section>';
    return '<p class="helper docs-intro">Генерация документов для лида. Договор и лист бронирования доступны для скачивания в формате DOCX.</p><section class="document-card"><span class="file-icon">DOCX</span><div><strong>Договор</strong><p>Договор бронирования услуг по организации отдыха с полными условиями.</p></div><button type="button" class="secondary wide" data-action="download-doc" data-doc="contract">Скачать договор</button></section><section class="document-card"><span class="file-icon">DOCX</span><div><strong>Лист бронирования</strong><p>Краткая сводка бронирования для туристов.</p></div><button type="button" class="secondary wide" data-action="download-doc" data-doc="booking-sheet">Скачать лист бронирования</button></section>';
  }

  function localDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function taskIsOverdue(task) {
    return Boolean(task.dueDate && task.status !== "done" && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) && task.dueDate < localDateKey());
  }

  function displayTaskDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? match[3] + "." + match[2] + "." + match[1] : value;
  }

  function tasksTab(lead) {
    const canMutate = capabilitiesForLead(lead).canMutateTasks;
    const statusLabels = { todo: "К выполнению", in_progress: "В работе", done: "Готово" };
    const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий", urgent: "Срочный" };
    if (state.taskDeletePendingIndex !== null) {
      const task = lead.tasks[state.taskDeletePendingIndex];
      if (!task) state.taskDeletePendingIndex = null;
      else return '<section class="block task-delete-confirm"><h3>УДАЛИТЬ ЗАДАЧУ?</h3><div class="notice warning"><strong>' + esc(task.title) + '</strong><span>Задача будет удалена из лида. Это действие нельзя отменить.</span></div><div class="task-form-actions"><button type="button" class="secondary" data-action="cancel-delete-task">Отмена</button><button type="button" class="danger" data-action="confirm-delete-task" data-index="' + state.taskDeletePendingIndex + '">Удалить задачу</button></div></section>';
    }
    if (state.taskEditor) {
      const editing = state.taskEditor.index !== null;
      const task = editing ? lead.tasks[state.taskEditor.index] : { title: "", description: "", priority: "medium", status: "todo", dueDate: "" };
      return '<form id="task-form" data-index="' + (editing ? state.taskEditor.index : "") + '"><section class="block"><h3>' + (editing ? "РЕДАКТИРОВАТЬ ЗАДАЧУ" : "НОВАЯ ЗАДАЧА") + '</h3>' + field("Название *", "title", task.title, true, "text", "Что нужно сделать?") + '<label class="field"><span>Описание</span><textarea name="description" placeholder="Детали задачи…">' + esc(task.description || "") + '</textarea></label><label class="field"><span>Приоритет</span><select name="priority">' + Object.entries(priorityLabels).map(([value, label]) => '<option value="' + value + '" ' + (task.priority === value ? "selected" : "") + '>' + label + '</option>').join("") + '</select></label>' + (editing ? '<label class="field"><span>Статус</span><select name="status">' + Object.entries(statusLabels).map(([value, label]) => '<option value="' + value + '" ' + (task.status === value ? "selected" : "") + '>' + label + '</option>').join("") + '</select></label>' : "") + field("Дедлайн", "dueDate", task.dueDate, false, "date") + '<div class="task-form-actions">' + (editing ? '<button type="button" class="danger" data-action="request-delete-task" data-index="' + state.taskEditor.index + '">Удалить</button>' : "") + '<button type="button" class="secondary" data-action="cancel-task">Отмена</button><button type="submit" class="primary">' + (editing ? "Сохранить" : "Создать задачу") + '</button></div></section></form>';
    }
    const counts = { todo: 0, in_progress: 0, done: 0 };
    lead.tasks.forEach(task => { counts[task.status] = (counts[task.status] || 0) + 1; });
    const rows = ["todo", "in_progress", "done"].flatMap(status => lead.tasks.map((task, index) => ({ task, index })).filter(item => item.task.status === status)).map(({ task, index }) => {
      const overdue = taskIsOverdue(task);
      const due = task.dueDate ? (overdue ? ' · <em class="task-overdue">Просрочено · ' + esc(displayTaskDate(task.dueDate)) + '</em>' : ' · Дедлайн: ' + esc(displayTaskDate(task.dueDate))) : "";
      return '<article class="task-card ' + (task.status === "done" ? "done" : "") + (overdue ? " overdue" : "") + '"><button type="button" class="task-cycle" data-action="cycle-task" data-index="' + index + '" aria-label="Сменить статус" ' + (canMutate ? "" : "disabled") + '>' + ({ todo: "○", in_progress: "◷", done: "✓" })[task.status] + '</button><button type="button" class="task-content" data-action="edit-task" data-index="' + index + '" ' + (canMutate ? "" : "disabled") + '><span><strong>' + esc(task.title) + '</strong><small>' + esc(statusLabels[task.status]) + ' · ' + esc(priorityLabels[task.priority]) + due + '</small></span></button></article>';
    });
    return '<section class="block"><div class="block-title"><h3>ЗАДАЧИ</h3>' + (canMutate ? '<button type="button" data-action="add-task">+ Добавить</button>' : "") + '</div><div class="task-badges"><span>' + counts.todo + ' к выполнению</span><span>' + counts.in_progress + ' в работе</span><span>' + counts.done + ' готово</span></div>' + (rows.join("") || '<div class="empty compact-empty"><p>Нет задач. Нажмите «Добавить», чтобы создать первую.</p></div>') + '</section>';
  }

  function leadDetail(lead) {
    const tabs = [["details", "Редактировать"], ["chat", "Чат"], ["documents", "Документы"], ["tasks", "Задачи"]];
    const visibleTab = tabs.some(tab => tab[0] === state.detailTab) ? state.detailTab : "details";
    let body = leadOverview(lead);
    if (visibleTab === "chat") body = chatTab(lead);
    if (visibleTab === "documents") body = docsTab(lead);
    if (visibleTab === "tasks") body = tasksTab(lead);
    return chrome('<section class="sheet">' + detailHeader(lead) + '<div class="detail-tabs lead-exact-tabs">' + tabs.map(([id, label]) => '<button class="' + (visibleTab === id ? "active" : "") + '" data-detail-tab="' + id + '">' + label + "</button>").join("") + '</div><div class="sheet-scroll detail-scroll">' + accessBanner(lead) + body + "</div></section>", { nav: false });
  }

  function optionList(values, selected) {
    return values.map(value => '<option ' + (value === selected ? "selected" : "") + '>' + esc(value) + "</option>").join("");
  }

  function leadForm(lead) {
    const editing = Boolean(lead);
    const item = lead || { firstName: "", lastName: "", middleName: "", phone: "", email: "", telegram: "", source: "direct", category: "not_segmented", manager: "Елена Воронова", assignedUserId: "manager-elena", stage: "new", eventId: null, tour: "", selectedCityIds: [], routeCities: [], color: "#2f6bd8", roomType: [], hotelCategory: [], transfers: [], meals: [], note: "" };
    const selectedTour = tourById(item.eventId);
    const paymentInfo = editing ? '<div class="readonly-panel"><strong>Информация об оплате · только чтение</strong><div class="info-grid">' + info("Статус оплаты", paymentStatusLabel(item.paymentStatus)) + info("Способ оплаты", paymentMethodLabel(item.paymentMethod)) + info("Booking ID", item.bookingId || "Не указан") + '</div></div>' : "";
    const telegramReadonly = editing && item.telegramUserId ? '<div class="readonly-panel telegram-panel"><strong>Telegram · только чтение</strong><div class="info-grid">' + info("Telegram User ID", item.telegramUserId) + '</div></div>' : "";
    const createPrimaryFields = !editing ? '<section class="block"><h3>ДАТА РОЖДЕНИЯ</h3>' + field("Дата рождения", "dateOfBirth", "", false, "date") + '</section><section class="block"><h3>ПАСПОРТ РФ</h3>' + field("Серия и номер паспорта", "passportSeries", "", false, "text", "45 12 123456") + field("Кем выдан", "passportIssuedBy", "", false, "text", "Отделом УФМС…") + field("Адрес регистрации", "registrationAddress", "", false, "text", "г. Москва, ул. …") + '</section><section class="block"><h3>ЗАГРАНПАСПОРТ</h3>' + field("ФИО в загранпаспорте", "foreignPassportName", "", false, "text", "IVANOV IVAN") + field("Номер загранпаспорта", "foreignPassportNumber", "", false, "text", "75 1234567") + field("Действителен до", "foreignPassportValidUntil", "", false, "date") + '</section>' : "";
    const routeChoices = selectedTour ? '<div id="lead-route-cities" class="route-choice-list"><strong>Позиции маршрута:</strong>' + selectedTour.route.map(city => '<label class="select-row"><input type="checkbox" name="selectedCityIds" value="' + city.id + '" ' + ((item.selectedCityIds || []).includes(city.id) ? "checked" : "") + '><span class="lead-main"><b>' + esc(city.name) + '</b><small>' + esc(city.id) + '</small></span></label>').join("") + '</div>' : '<div id="lead-route-cities" class="helper">Сначала выберите тур.</div>';
    const utmValues = editing ? [["utmSource", item.utmSource], ["utmMedium", item.utmMedium], ["utmCampaign", item.utmCampaign], ["utmTerm", item.utmTerm], ["utmContent", item.utmContent], ["pageUrl", item.pageUrl]].filter(entry => entry[1]) : [];
    const utm = utmValues.length ? '<section class="block" data-lead-section="utm"><h3>UTM-ТРЕКИНГ</h3><div class="info-grid">' + utmValues.map(entry => info(entry[0], entry[1])).join("") + '</div></section>' : "";
    const tourists = editing ? touristsTab(item) : "";
    const editorReconcile = editing && item.eventId
      ? '<section class="block dashed-block"><h3>ПРОВЕРИТЬ СВЯЗИ ЛИД-ТУР</h3><p class="helper top-helper">Проверяет цепочку contact → deal → city visits для каждого туриста.</p>' + (state.reconcileReport ? '<div class="notice"><strong>Все связи корректны</strong><span>Контакты: 0 · Связи: 0 · Сделки: 0 · Визиты: 0</span></div>' : "") + '<button type="button" class="secondary wide" data-action="reconcile">Проверить связи</button></section>'
      : "";
    const editorMerge = editing
      ? '<section class="block dashed-block"><h3>РУЧНОЕ ОБЪЕДИНЕНИЕ ЛИДОВ</h3><label class="field"><span>Поиск по имени, телефону, email или Telegram username</span><input id="merge-inline-search" value="' + esc(state.mergeSearch) + '" placeholder="Найдите лид для объединения"></label>' + inlineMergeCandidates(item) + '<button type="button" class="secondary wide" data-action="confirm-merge" ' + (state.mergeTargetId ? "" : "disabled") + '>Объединить текущий лид</button></section>'
      : "";
    const footer = editing
      ? (state.role === "admin" ? '<button type="button" class="danger" data-action="request-delete-lead">Удалить лид</button>' : "") + '<button class="primary" type="submit">Обновить</button>'
      : '<button class="primary" type="submit">Создать</button>';
    return chrome('<section class="sheet"><form id="lead-form" class="sheet" data-editing="' + (editing ? lead.id : "") + '">' +
      '<div class="sheet-head"><button type="button" class="back-btn" data-action="' + (editing ? "back-detail" : "back-list") + '" aria-label="Закрыть">×</button><div class="sheet-title"><h2>' + (editing ? "Редактировать лид" : "Создать новый лид") + '</h2><p>' + (editing ? "Обновите информацию о лиде" : "Введите данные для создания нового лида") + '</p></div></div><div class="sheet-scroll form-scroll">' +
      editorReconcile + editorMerge + '<section class="block" data-lead-section="personal"><h3>ЛИЧНЫЕ ДАННЫЕ</h3><div class="two">' + field("Фамилия *", "lastName", item.lastName, true) + field("Имя *", "firstName", item.firstName, true) + '</div>' + field("Отчество", "middleName", item.middleName) + '<div class="two">' + field("Телефон", "phone", item.phone, false, "tel") + field("Telegram username", "telegram", item.telegram, false, "text", "@username") + '</div>' + field("Email", "email", item.email, false, "email") + telegramReadonly + '</section>' + createPrimaryFields +
      '<section class="block" data-lead-section="tour-payment"><h3>ТУР И ОПЛАТА</h3><label class="field"><span>Тур</span><input id="tour-search" name="tourSearch" list="tour-options" value="' + esc(item.tour || "") + '" placeholder="Поиск тура…" autocomplete="off"><input id="event-id" type="hidden" name="eventId" value="' + esc(item.eventId || "") + '"><datalist id="tour-options">' + tourOptions.map(tour => '<option value="' + esc(tour.title) + '">' + esc(tour.dates) + '</option>').join("") + '</datalist></label>' + routeChoices + currencyField("Стоимость тура", "tourCost", item.tourCost, "tourCostCurrency", item.tourCostCurrency || "CNY", "Валюта стоимости") + currencyField("Аванс", "advancePayment", item.advancePayment, "advancePaymentCurrency", item.advancePaymentCurrency || "RUB", "Валюта аванса") + currencyField("Остаток", "remainingPayment", item.remainingPayment, "remainingPaymentCurrency", item.remainingPaymentCurrency || "CNY", "Валюта остатка") + paymentInfo + '<div class="field"><span>Тип номера</span>' + checkboxOptions("roomType", fieldOptions.roomType, item.roomType) + '</div><div class="field"><span>Категория отелей</span>' + checkboxOptions("hotelCategory", fieldOptions.hotelCategory, item.hotelCategory) + '</div><div class="field"><span>Трансферы</span>' + checkboxOptions("transfers", fieldOptions.transfers, item.transfers) + '</div><div class="field"><span>Питание</span>' + checkboxOptions("meals", fieldOptions.meals, item.meals) + '</div></section>' +
      '<section class="block" data-lead-section="settings"><h3>НАСТРОЙКИ</h3><label class="field"><span>Категория клиента</span><select name="category">' + fieldOptions.clientCategory.map(([value, label]) => '<option value="' + value + '" ' + (value === item.category || label === item.category ? "selected" : "") + '>' + esc(label) + '</option>').join("") + '</select></label><label class="field"><span>Статус *</span><select name="status" required>' + stageOrder.map(value => '<option value="' + value + '" ' + (value === item.stage ? "selected" : "") + '>' + stages[value][0] + '</option>').join("") + '</select></label><label class="field"><span>Источник *</span><select name="source" required>' + fieldOptions.source.map(([value, label]) => '<option value="' + value + '" ' + (value === item.source || label === item.source ? "selected" : "") + '>' + esc(label) + '</option>').join("") + '</select></label><label class="field"><span>Ответственный</span><select name="manager"><option value="Елена Воронова" ' + (item.manager === "Елена Воронова" ? "selected" : "") + '>Елена Воронова (Менеджер)</option><option value="Игорь Лебедев" ' + (item.manager === "Игорь Лебедев" ? "selected" : "") + '>Игорь Лебедев (Менеджер)</option><option value="Александр Навроцкий" ' + (item.manager === "Александр Навроцкий" ? "selected" : "") + '>Александр Навроцкий (Админ)</option></select></label>' + field("Цветовая индикация", "color", item.color, false, "color") + '</section>' + utm +
      '<section class="block" data-lead-section="notes"><h3>ПРИМЕЧАНИЕ</h3><label class="field"><textarea name="notes" placeholder="Дополнительная информация…">' + esc(item.note || "") + '</textarea></label></section>' + tourists +
      '</div><div class="sheet-actions exact-lead-footer">' + footer + '</div></form></section>', { nav: false });
  }

  function field(label, name, value, required = false, type = "text", placeholder = "") {
    return '<label class="field"><span>' + esc(label) + '</span><input name="' + name + '" type="' + type + '" value="' + esc(value || "") + '" placeholder="' + esc(placeholder) + '" ' + (required ? "required" : "") + "></label>";
  }

  function filtersScreen() {
    return chrome('<section class="sheet"><form id="filters-form" class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="back-list">×</button><div class="sheet-title"><h2>Фильтры лидов</h2><p>Поля доступны в веб-версии</p></div><button type="button" class="text-action" data-action="reset-filters">Сбросить</button></div><div class="sheet-scroll form-scroll">' +
      '<section class="block"><h3>СТАТУСЫ</h3><div class="check-grid">' + stageOrder.map(stage => '<label class="check-card"><input type="checkbox" name="statuses" value="' + stage + '" ' + (state.filters.statuses.includes(stage) ? "checked" : "") + '><span>' + stages[stage][0] + "</span></label>").join("") + "</div></section>" +
      '<section class="block"><h3>ПАРАМЕТРЫ</h3>' + selectField("Источник", "source", ["all", ...unique("source")], state.filters.source) + selectField("Категория", "category", ["all", ...unique("category")], state.filters.category) + selectField("Тур", "tour", ["all", ...unique("tour")], state.filters.tour) + selectField("Результат потери", "outcome", ["all", "postponed", "failed"], state.filters.outcome) + selectField("Дата создания", "date", ["all", "today", "week", "month"], state.filters.date) + "</section>" +
      '<section class="block"><h3>СОСТОЯНИЕ</h3><label class="toggle-row"><input type="checkbox" name="archive" ' + (state.showArchive ? "checked" : "") + '><span><strong>Показывать архив</strong><small>Вместо активных лидов</small></span></label></section>' +
      '</div><div class="sheet-actions"><button type="button" class="secondary" data-action="back-list">Отмена</button><button class="primary blue" type="submit">Показать лиды</button></div></form></section>', { nav: false });
  }

  function accessScreen() {
    return chrome('<section class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="close-access" aria-label="Назад">‹</button><div class="sheet-title"><h2>Роль и доступ</h2><p>Роль получена из серверной сессии</p></div></div><div class="sheet-scroll"><div class="notice"><strong>Текущая роль: ' + esc(roleLabels[state.role]) + '</strong><span>' + (state.offline ? "Offline: любые записи запрещены." : "Права повторно проверяются перед каждой записью.") + '</span></div><section class="block"><h3>ДОСТУП</h3><p class="body-copy">Роль нельзя изменить из мобильного интерфейса. Менеджер видит только назначенные ему лиды; администратор — все лиды.</p></section><section class="block"><button type="button" class="action-row" data-action="toggle-offline"><span class="action-icon">' + (state.offline ? "✓" : "○") + '</span><span><strong>Offline</strong><small>Показывать сохранённые разрешённые данные без возможности записи</small></span><b>›</b></button></section></div></section>', { nav: false });
  }

  function forbiddenScreen() {
    const params = new URLSearchParams({ role: state.role, offline: state.offline ? "1" : "0" });
    return chrome('<section class="sheet forbidden-sheet"><div class="sheet-head"><span class="forbidden-icon">!</span><div class="sheet-title"><h2>Нет доступа к лидам</h2><p>Данные не загружены</p></div></div><div class="sheet-scroll"><section class="state-card"><strong>Раздел недоступен</strong><p>Это не режим «Только просмотр»: роль «' + esc(roleLabels[state.role] || "Пользователь") + '» не может просматривать лиды вообще. Менеджеру доступны только назначенные ему заявки.</p><a class="primary blue button-link wide" href="./tour-operations.html?' + esc(params.toString()) + '">Вернуться к турам</a></section></div></section>');
  }

  function selectField(label, name, values, selected) {
    const labels = { all: "Все", postponed: "Отложен", failed: "Потерян", today: "Сегодня", week: "Неделя", month: "Месяц" };
    return '<label class="field"><span>' + esc(label) + '</span><select name="' + name + '">' + values.map(value => '<option value="' + esc(value) + '" ' + (value === selected ? "selected" : "") + '>' + esc(labels[value] || value) + "</option>").join("") + "</select></label>";
  }

  function lostScreen(lead) {
    return chrome('<section class="sheet"><form id="lost-form" class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="cancel-outcome">‹</button><div class="sheet-title"><h2>Отложить/потерять</h2><p>Лид: ' + esc(fullName(lead)) + '</p></div></div><div class="sheet-scroll form-scroll"><section class="block"><h3>ИСХОД</h3><label class="radio-card"><input type="radio" name="outcome" value="postponed" checked><span><strong>Отложен</strong><small>Вернуться к лиду позже</small></span></label><label class="radio-card"><input type="radio" name="outcome" value="failed"><span><strong>Потерян</strong><small>Зафиксировать причину потери</small></span></label><div data-outcome-panel="postponed">' + field("Отложен до *", "outcomeDate", lead.outcomeDate || "2026-09-01", true, "date") + '<label class="field"><span>Причина *</span><select name="postponeReason" required><option value="">Выберите причину</option><option value="next_year">Следующий год</option><option value="thinking">Думает</option><option value="other_country">Едет в другую страну</option><option value="waiting_passport">Ждёт паспорт</option></select></label></div><div data-outcome-panel="failed" hidden><label class="field"><span>Причина потери *</span><select name="failureReason" disabled required><option value="">Выберите причину потери</option><option value="missing_contact">Не выходит на связь</option><option value="expensive">Слишком дорого</option><option value="competitor">Ушёл к конкуренту</option><option value="not_target">Не наша целевая аудитория</option></select></label></div></section></div><div class="sheet-actions"><button type="button" class="secondary" data-action="cancel-outcome">Отмена</button><button class="danger" type="submit">Отложить</button></div></form></section>', { nav: false });
  }

  function deleteLeadScreen(lead) {
    return chrome('<section class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="cancel-delete-lead" aria-label="Назад">‹</button><div class="sheet-title"><h2>Удалить лид?</h2><p>' + esc(lead.code + " · " + fullName(lead)) + '</p></div></div><div class="sheet-scroll"><div class="notice warning"><strong>Подтвердите удаление</strong><span>Лид и его связи будут удалены из mock-данных. В рабочей CRM право и связи повторно проверятся на сервере.</span></div></div><div class="sheet-actions"><button type="button" class="secondary" data-action="cancel-delete-lead">Отмена</button><button type="button" class="danger" data-action="confirm-delete-lead">Удалить лид</button></div></section>', { nav: false });
  }

  function menuScreen(lead) {
    const deleteAction = capabilitiesForLead(lead).canDelete ? '<button class="action-row danger-row" data-action="request-delete-lead"><span class="action-icon">×</span><span><strong>Удалить лид</strong><small>После отдельного подтверждения</small></span><b>›</b></button>' : "";
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-detail">×</button><div class="sheet-title"><h2>Действия с лидом</h2><p>' + esc(lead.code) + '</p></div></div><div class="sheet-scroll"><section class="action-list"><button class="action-row" data-action="edit-lead"><span class="action-icon">✎</span><span><strong>Изменить лид</strong><small>Контакт, тур и маршрут</small></span><b>›</b></button><button class="action-row" data-action="merge-lead"><span class="action-icon">⇆</span><span><strong>Объединить лиды</strong><small>Перенести туристов и историю</small></span><b>›</b></button><button class="action-row" data-action="archive-lead"><span class="action-icon">□</span><span><strong>' + (lead.archived ? "Вернуть из архива" : "Архивировать") + '</strong><small>Данные останутся доступны</small></span><b>›</b></button>' + deleteAction + '</section></div></section>', { nav: false });
  }

  function mergeScreen(lead) {
    const selected = accessibleLeads().find(item => item.id === state.mergeTargetId);
    if (!selected) return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-detail">‹</button><div class="sheet-title"><h2>Подтвердить объединение лидов</h2></div></div><div class="sheet-scroll"><div class="notice warning"><strong>Лид не выбран</strong><span>Вернитесь и найдите лид для объединения.</span></div></div></section>', { nav: false });
    const currentMessenger = ["telegram", "whatsapp", "instagram", "max"].includes(String(lead.source || "").toLowerCase());
    const selectedMessenger = ["telegram", "whatsapp", "instagram", "max"].includes(String(selected.source || "").toLowerCase());
    const source = currentMessenger !== selectedMessenger ? (currentMessenger ? lead : selected) : lead;
    const target = source.id === lead.id ? selected : lead;
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-detail">‹</button><div class="sheet-title"><h2>Подтвердить объединение лидов</h2><p>Действие необратимо</p></div></div><div class="sheet-scroll"><div class="notice warning"><strong>' + esc(fullName(source)) + ' будет архивирован</strong><span>Его данные объединятся с лидом «' + esc(fullName(target)) + '». Messenger-лид всегда становится источником, чтобы сохранить основной CRM-лид.</span></div><section class="block"><h3>БУДЕТ ПЕРЕНЕСЕНО</h3><p class="body-copy">Туристы, сообщения и задачи. История останется у целевого лида.</p></section></div><div class="sheet-actions"><button class="secondary" data-action="back-detail">Отмена</button><button class="primary blue" data-action="apply-merge">Объединить</button></div></section>', { nav: false });
  }

  function duplicateScreen() {
    const matches = state.duplicateIds.map(id => leads.find(lead => lead.id === id)).filter(Boolean);
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="cancel-duplicate">‹</button><div class="sheet-title"><h2>Возможный дубль</h2><p>Совпали телефон или email</p></div></div><div class="sheet-scroll"><div class="notice warning"><strong>Проверьте существующие лиды</strong><span>Можно открыть карточку, объединить данные или создать отдельный лид.</span></div>' + matches.map(leadCard).join("") + '</div><div class="sheet-actions three-actions"><button class="secondary" data-action="cancel-duplicate">Назад</button><button class="secondary" data-action="open-duplicate" data-id="' + matches[0].id + '">Открыть</button><button class="primary" data-action="create-anyway">Создать отдельно</button></div></section>', { nav: false });
  }

  function render() {
    const lead = activeLead();
    const invalidLinkedLead = linkedParams.has("lead") && !hasLinkedLead;
    if (!isLeadRole() || invalidLinkedLead || (state.activeLeadId && !canAccessLead(lead))) app.innerHTML = forbiddenScreen();
    else if (state.screen === "access") app.innerHTML = accessScreen();
    else if (state.screen === "detail" && lead) app.innerHTML = leadDetail(lead);
    else if (state.screen === "lead-form") app.innerHTML = leadForm(lead && state.activeLeadId ? lead : null);
    else if (state.screen === "filters") app.innerHTML = filtersScreen();
    else if (state.screen === "lost" && lead) app.innerHTML = lostScreen(lead);
    else if (state.screen === "delete-lead" && lead) app.innerHTML = deleteLeadScreen(lead);
    else if (state.screen === "menu" && lead) app.innerHTML = menuScreen(lead);
    else if (state.screen === "merge" && lead) app.innerHTML = mergeScreen(lead);
    else if (state.screen === "duplicate") app.innerHTML = duplicateScreen();
    else app.innerHTML = leadList();
    if (state.screen === "lead-form" && state.editLeadSection) {
      const sectionSelector = '[data-lead-section="' + state.editLeadSection + '"]';
      const section = document.querySelector(sectionSelector);
      section?.scrollIntoView?.({ block: "start", behavior: "auto" });
      const control = document.querySelector(sectionSelector + ' input:not([type="hidden"]), ' + sectionSelector + " select, " + sectionSelector + " textarea");
      control?.focus?.({ preventScroll: true });
      state.editLeadSection = null;
    }
    if (state.pendingScrollTop != null) {
      const scroller = app.querySelector?.(".detail-scroll") || app.querySelector?.(".lead-workspace-scroll");
      if (scroller) scroller.scrollTop = state.pendingScrollTop;
      state.pendingScrollTop = null;
    }
  }

  function formData(form) {
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());
    ["selectedCityIds", "roomType", "hotelCategory", "transfers", "meals"].forEach(name => { values[name] = data.getAll(name); });
    return values;
  }

  function normalizedLeadValues(values) {
    const selectedTour = tourById(values.eventId) || tourOptions.find(tour => tour.title === values.tourSearch) || null;
    const selectedCityIds = Array.isArray(values.selectedCityIds) ? values.selectedCityIds : [];
    const routeCities = selectedTour ? selectedTour.route.filter(city => selectedCityIds.includes(city.id)).map(city => city.name) : [];
    return { ...values, eventId: selectedTour?.id || null, tour: selectedTour?.title || "Не выбран", selectedCityIds, routeCities };
  }

  function applyLeadValues(lead, rawValues) {
    const values = normalizedLeadValues(rawValues);
    Object.assign(lead, {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName,
      phone: values.phone,
      email: values.email,
      telegram: values.telegram,
      source: values.source,
      category: values.category,
      manager: values.manager,
      color: values.color || "#2f6bd8",
      stage: values.status || lead.stage,
      eventId: values.eventId,
      tour: values.tour,
      selectedCityIds: values.selectedCityIds,
      routeCities: values.routeCities,
      cities: values.routeCities,
      tourCost: values.tourCost,
      tourCostCurrency: values.tourCostCurrency,
      advancePayment: values.advancePayment,
      advancePaymentCurrency: values.advancePaymentCurrency,
      remainingPayment: values.remainingPayment,
      remainingPaymentCurrency: values.remainingPaymentCurrency,
      roomType: values.roomType,
      hotelCategory: values.hotelCategory,
      transfers: values.transfers,
      meals: values.meals,
      note: values.notes ?? values.note,
      updated: "только что",
    });
    const primary = lead.tourists.find(tourist => tourist.isPrimary) || lead.tourists[0];
    if (primary) {
      Object.assign(primary, { firstName: lead.firstName, lastName: lead.lastName, middleName: lead.middleName, phone: lead.phone, email: lead.email });
      primary.name = fullName(primary);
      primary.initials = initials(primary);
    }
    lead.tourists.forEach(tourist => {
      tourist.lead = leadLabel(lead);
      tourist.leadStatus = stageLabel(lead.stage);
      tourist.tourId = lead.eventId;
      tourist.route = lead.selectedCityIds.slice();
    });
    if (lead.manager === "Елена Воронова") managerAssignedLeadIds.add(lead.id); else managerAssignedLeadIds.delete(lead.id);
    return lead;
  }

  function buildLead(rawValues) {
    sequence += 1;
    const values = normalizedLeadValues(rawValues);
    const id = "lead-proto-" + sequence;
    const created = {
      id, code: "L-10" + sequence, firstName: values.firstName, lastName: values.lastName, middleName: values.middleName,
      phone: values.phone, email: values.email, telegram: values.telegram, stage: values.status || "new", source: values.source,
      category: values.category, manager: values.manager, color: values.color || "#2f6bd8", eventId: values.eventId,
      tour: values.tour, destination: values.tour.includes("Кита") ? "Китай" : values.tour.includes("Япони") ? "Япония" : "", cities: values.routeCities, routeCities: values.routeCities, selectedCityIds: values.selectedCityIds,
      updated: "только что", created: "03.08.2026", archived: false,
      accommodation: { hotel: "", room: "" }, tourCost: values.tourCost, tourCostCurrency: values.tourCostCurrency, advancePayment: values.advancePayment, advancePaymentCurrency: values.advancePaymentCurrency, remainingPayment: values.remainingPayment, remainingPaymentCurrency: values.remainingPaymentCurrency,
      roomType: values.roomType, hotelCategory: values.hotelCategory, transfers: values.transfers, meals: values.meals, note: values.notes ?? values.note, tourists: [], touristIds: [],
      messages: [], tasks: [],
    };
    created.tourists.push(createCanonicalTouristForLead(created, {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName,
      phone: values.phone,
      email: values.email,
      birthDate: values.dateOfBirth,
      isPrimary: true,
    }));
    Object.assign(created.tourists[0], {
      domesticPassport: values.passportSeries || "",
      domesticIssuedBy: values.passportIssuedBy || "",
      registrationAddress: values.registrationAddress || "",
      latinName: values.foreignPassportName || "",
      passport: values.foreignPassportNumber || "",
      passportExpiry: values.foreignPassportValidUntil || "",
    });
    created.touristIds = created.tourists.map(tourist => tourist.id);
    return created;
  }

  function commitPendingLead() {
    const pending = state.pendingLead;
    if (!pending || !requireCreateCapability()) return false;
    pending.tourists.forEach(tourist => {
      if (!canonicalTourists.some(item => item.id === tourist.id)) canonicalTourists.push(tourist);
    });
    syncLeadTouristContext(pending);
    leads.unshift(pending);
    if (pending.manager === "Елена Воронова") managerAssignedLeadIds.add(pending.id);
    savePrototypeData();
    state.activeLeadId = pending.id;
    state.pendingLead = null;
    state.duplicateIds = [];
    state.screen = "detail";
    state.detailTab = "details";
    showToast("Лид создан");
    return true;
  }

  app.addEventListener("input", event => {
    if (event.target.id === "lead-search") {
      const position = event.target.selectionStart;
      state.query = event.target.value;
      render();
      const input = document.querySelector("#lead-search");
      input?.focus();
      input?.setSelectionRange(position, position);
    }
    if (event.target.id === "merge-inline-search") {
      const position = event.target.selectionStart;
      state.mergeSearch = event.target.value;
      state.mergeTargetId = null;
      render();
      const input = document.querySelector("#merge-inline-search");
      input?.focus();
      input?.setSelectionRange(position, position);
    }
  });

  app.addEventListener("change", event => {
    if (event.target.name === "mergeTarget") {
      state.mergeTargetId = event.target.value;
      render();
    }
    if (event.target.id === "tour-search") {
      const selected = tourOptions.find(tour => tour.title === event.target.value) || null;
      const idInput = document.querySelector("#event-id");
      const routeContainer = document.querySelector("#lead-route-cities");
      if (idInput) idInput.value = selected?.id || "";
      if (routeContainer) {
        routeContainer.innerHTML = selected
          ? '<strong>Позиции маршрута:</strong>' + selected.route.map(city => '<label class="select-row"><input type="checkbox" name="selectedCityIds" value="' + city.id + '" checked><span class="lead-main"><b>' + esc(city.name) + '</b><small>' + esc(city.id) + '</small></span></label>').join("")
          : "Сначала выберите тур из результатов поиска.";
      }
    }
    if (event.target.name === "outcome") {
      document.querySelectorAll("[data-outcome-panel]").forEach(panel => {
        const active = panel.dataset.outcomePanel === event.target.value;
        panel.hidden = !active;
        panel.querySelectorAll("input,select,textarea").forEach(control => { control.disabled = !active; });
      });
      const submit = document.querySelector("#lost-form button[type='submit']");
      if (submit) submit.textContent = event.target.value === "postponed" ? "Отложить" : "Отметить потерянным";
    }
  });

  app.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    if (form.id === "lead-form") {
      const values = formData(form);
      if (form.dataset.editing) {
        const lead = activeLead();
        if (!requireLeadCapability(lead, "canEdit")) return;
        if (values.status === "lost" && lead.stage !== "lost") {
          state.pendingEditValues = values;
          state.screen = "lost";
          render();
          return;
        }
        applyLeadValues(lead, values);
        savePrototypeData();
        if (state.leadReadScrollTop !== null) state.pendingScrollTop = state.leadReadScrollTop;
        state.leadReadScrollTop = null;
        state.editLeadSection = null;
        state.screen = "detail";
        state.detailTab = "details";
        showToast("Лид обновлён");
      } else {
        if (!requireCreateCapability()) return;
        const pending = buildLead(values);
        const pendingPhone = String(pending.phone || "").replace(/\D/g, "");
        const pendingEmail = String(pending.email || "").trim().toLowerCase();
        const duplicateIds = accessibleLeads().filter(lead => (pendingPhone && String(lead.phone || "").replace(/\D/g, "") === pendingPhone) || (pendingEmail && String(lead.email || "").trim().toLowerCase() === pendingEmail)).map(lead => lead.id);
        state.pendingLead = pending;
        state.duplicateIds = duplicateIds;
        if (duplicateIds.length) state.screen = "duplicate"; else commitPendingLead();
      }
    }
    if (form.id === "filters-form") {
      const data = new FormData(form);
      state.filters.statuses = data.getAll("statuses");
      ["source", "category", "tour", "outcome", "date"].forEach(key => { state.filters[key] = data.get(key); });
      state.showArchive = data.has("archive");
      state.screen = "list";
      render();
    }
    if (form.id === "lost-form") {
      const values = formData(form);
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canChangeStatus")) return;
      if (state.pendingEditValues) applyLeadValues(lead, state.pendingEditValues);
      Object.assign(lead, { stage: "lost", outcome: values.outcome, outcomeDate: values.outcome === "postponed" ? values.outcomeDate : "", outcomeReason: values.outcome === "postponed" ? values.postponeReason : values.failureReason, updated: "только что" });
      lead.tourists.forEach(tourist => { tourist.leadStatus = stageLabel(lead.stage); });
      state.pendingEditValues = null;
      savePrototypeData();
      if (state.leadReadScrollTop !== null) state.pendingScrollTop = state.leadReadScrollTop;
      state.leadReadScrollTop = null;
      state.editLeadSection = null;
      state.screen = "detail";
      state.detailTab = "details";
      showToast(values.outcome === "postponed" ? "Лид отложен" : "Лид отмечен потерянным");
    }
    if (form.id === "chat-form") {
      if (!requireLeadCapability(activeLead(), "canMutateMessages")) return;
      const message = formData(form).message.trim();
      if (message) {
        activeLead().messages.push({ author: "Елена", text: message, time: "сейчас", own: true });
        saveLeads();
      }
      render();
    }
    if (form.id === "task-form") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      const values = formData(form);
      const index = form.dataset.index === "" ? null : Number(form.dataset.index);
      const task = {
        title: values.title,
        description: values.description || "",
        priority: values.priority || "medium",
        status: index === null ? "todo" : values.status || "todo",
        dueDate: values.dueDate || "",
      };
      if (index === null) lead.tasks.push(task); else lead.tasks[index] = task;
      state.taskEditor = null;
      state.taskDeletePendingIndex = null;
      saveLeads();
      showToast(index === null ? "Задача создана" : "Задача обновлена");
    }
  });

  app.addEventListener("click", event => {
    const target = event.target.closest("[data-action],[data-open-lead],[data-edit-tourist],[data-stage],[data-detail-tab],[data-quick-status],[data-list-mode]");
    if (!target || target.disabled) return;
    if (target.dataset.openLead) {
      const requestedLead = leads.find(lead => lead.id === target.dataset.openLead);
      if (!canAccessLead(requestedLead)) {
        showToast("Нет доступа к этому лиду");
        return;
      }
      state.activeLeadId = requestedLead.id;
      state.detailTab = "details";
      state.screen = "detail";
      render();
      return;
    }
    if (target.dataset.editTourist) {
      openCanonicalTourist(target.dataset.editTourist, state.activeLeadId || "", state.detailTab);
      return;
    }
    if (target.dataset.detailTab) {
      state.detailTab = target.dataset.detailTab;
      state.taskEditor = null;
      state.taskDeletePendingIndex = null;
      render();
      return;
    }
    if (target.dataset.quickStatus) {
      const status = target.dataset.quickStatus;
      state.filters.statuses = state.filters.statuses.includes(status) ? state.filters.statuses.filter(item => item !== status) : [...state.filters.statuses, status];
      render();
      return;
    }
    if (target.dataset.listMode) {
      state.listMode = target.dataset.listMode;
      render();
      return;
    }
    if (target.dataset.stage) {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canChangeStatus")) return;
      if (target.dataset.stage === "lost") state.screen = "lost";
      else {
        lead.stage = target.dataset.stage;
        lead.updated = "только что";
        lead.tourists.forEach(tourist => { tourist.leadStatus = stageLabel(lead.stage); });
        savePrototypeData();
        showToast("Статус изменён: " + stages[target.dataset.stage][0]);
      }
      render();
      return;
    }
    const action = target.dataset.action;
    if (action === "open-access") {
      state.accessReturnScreen = state.screen === "detail" ? "detail" : "list";
      state.screen = "access";
      render();
      return;
    }
    if (action === "close-access") {
      state.screen = state.accessReturnScreen || (activeLead() ? "detail" : "list");
      render();
      return;
    }
    if (action === "select-role") {
      showToast("Роль задаётся серверной сессией и не меняется в интерфейсе");
      return;
    }
    if (action === "toggle-offline") {
      state.offline = !state.offline;
      if (!state.offline) savePrototypeData();
      render();
      return;
    }
    if (action === "open-unified-tourist") {
      openCanonicalTourist(target.dataset.tourist, state.activeLeadId || "", state.detailTab);
      return;
    }
    if (action === "open-tour-summary") {
      const lead = activeLead();
      if (lead?.stage !== "converted") {
        showToast("Логистика доступна после подтверждения лида");
        return;
      }
      openTourSummary(lead, state.detailTab);
      return;
    }
    if (action === "new-lead") {
      if (!requireCreateCapability()) return;
      state.activeLeadId = null;
      state.screen = "lead-form";
    }
    if (action === "edit-lead") {
      if (!requireLeadCapability(activeLead(), "canEdit")) return;
      const scroller = app.querySelector?.(".detail-scroll");
      state.leadReadScrollTop = scroller?.scrollTop ?? null;
      state.editLeadSection = null;
      state.screen = "lead-form";
    }
    if (action === "edit-lead-section") {
      if (!requireLeadCapability(activeLead(), "canEdit")) return;
      const allowedSections = ["personal", "tour-payment", "settings", "notes"];
      if (!allowedSections.includes(target.dataset.section)) return;
      const scroller = app.querySelector?.(".detail-scroll");
      state.leadReadScrollTop = scroller?.scrollTop ?? 0;
      state.editLeadSection = target.dataset.section;
      state.screen = "lead-form";
    }
    if (action === "back-list") { state.screen = "list"; state.activeLeadId = null; }
    if (action === "back-detail") {
      if (state.leadReadScrollTop !== null) state.pendingScrollTop = state.leadReadScrollTop;
      state.leadReadScrollTop = null;
      state.editLeadSection = null;
      state.screen = "detail";
    }
    if (action === "filters") state.screen = "filters";
    if (action === "toggle-archive") state.showArchive = !state.showArchive;
    if (action === "add-tourist") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canAddTourist")) return;
      const tourist = createCanonicalTouristForLead(lead);
      canonicalTourists.push(tourist);
      syncLeadTouristContext(lead);
      savePrototypeData();
      openCanonicalTourist(tourist.id, lead.id, "details");
      return;
    }
    if (action === "add-from-lead") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canAddTourist")) return;
      const tourist = createCanonicalTouristForLead(lead, {
        lastName: lead.lastName,
        firstName: lead.firstName,
        middleName: lead.middleName,
        phone: lead.phone,
        email: lead.email,
        isPrimary: lead.tourists.length === 0,
      });
      canonicalTourists.push(tourist);
      syncLeadTouristContext(lead);
      savePrototypeData();
      openCanonicalTourist(tourist.id, lead.id, "details");
      return;
    }
    if (action === "lead-menu") {
      if (!requireLeadCapability(activeLead(), "canEdit")) return;
      state.screen = "menu";
    }
    if (action === "merge-lead") {
      if (!requireLeadCapability(activeLead(), "canMerge")) return;
      state.mergeTargetId = null;
      state.mergeSearch = "";
      state.screen = "merge";
    }
    if (action === "select-merge-target") {
      const mergeTarget = leads.find(lead => lead.id === target.dataset.id);
      if (!canAccessLead(mergeTarget)) {
        showToast("Нет доступа к этому лиду");
        return;
      }
      state.mergeTargetId = mergeTarget.id;
      render();
      return;
    }
    if (action === "confirm-merge") {
      if (!requireLeadCapability(activeLead(), "canMerge") || !state.mergeTargetId) return;
      state.screen = "merge";
      render();
      return;
    }
    if (action === "archive-lead") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canArchive")) return;
      lead.archived = !lead.archived;
      saveLeads();
      showToast(lead.archived ? "Лид перемещён в архив" : "Лид восстановлен");
      state.screen = "detail";
    }
    if (action === "reset-filters") { state.filters = { statuses: [], source: "all", category: "all", tour: "all", outcome: "all", date: "all" }; state.showArchive = false; render(); return; }
    if (action === "apply-merge" && state.mergeTargetId) {
      const currentLead = activeLead();
      const selectedLead = leads.find(lead => lead.id === state.mergeTargetId);
      if (!requireLeadCapability(currentLead, "canMerge") || !canAccessLead(selectedLead)) {
        showToast("Нет доступа к лиду для объединения");
        return;
      }
      const currentMessenger = ["telegram", "whatsapp", "instagram", "max"].includes(String(currentLead.source || "").toLowerCase());
      const selectedMessenger = ["telegram", "whatsapp", "instagram", "max"].includes(String(selectedLead.source || "").toLowerCase());
      const sourceLead = currentMessenger !== selectedMessenger ? (currentMessenger ? currentLead : selectedLead) : currentLead;
      const targetLead = sourceLead.id === currentLead.id ? selectedLead : currentLead;
      sourceLead.tourists.forEach(tourist => {
        tourist.leadId = targetLead.id;
        tourist.lead = leadLabel(targetLead);
        tourist.leadStatus = stageLabel(targetLead.stage);
      });
      targetLead.messages.push(...sourceLead.messages);
      targetLead.tasks.push(...sourceLead.tasks.map(normalizeTask));
      sourceLead.archived = true;
      sourceLead.note = "Объединён с " + targetLead.code;
      syncLeadTouristContext(targetLead);
      syncLeadTouristContext(sourceLead);
      savePrototypeData();
      state.activeLeadId = targetLead.id;
      state.mergeTargetId = null;
      state.mergeSearch = "";
      state.screen = "detail";
      state.detailTab = "details";
      showToast("Лиды объединены, исходный лид помещён в архив");
      return;
    }
    if (action === "cancel-duplicate") { state.pendingLead = null; state.duplicateIds = []; state.screen = "lead-form"; }
    if (action === "create-anyway") { commitPendingLead(); return; }
    if (action === "open-duplicate") {
      const duplicateLead = leads.find(lead => lead.id === target.dataset.id);
      if (!canAccessLead(duplicateLead)) {
        showToast("Нет доступа к этому лиду");
        return;
      }
      state.pendingLead = null;
      state.duplicateIds = [];
      state.activeLeadId = duplicateLead.id;
      state.screen = "detail";
    }
    if (action === "download-doc") showToast("Документ подготовлен к скачиванию");
    if (action === "reconcile") {
      if (!requireLeadCapability(activeLead(), "canEdit")) return;
      state.reconcileReport = { contacts: 0, links: 0, deals: 0, visits: 0 };
      showToast("Проверка завершена: все связи корректны");
      return;
    }
    if (action === "add-task") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      state.taskDeletePendingIndex = null;
      state.taskEditor = { index: null };
      render();
      return;
    }
    if (action === "edit-task") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      state.taskDeletePendingIndex = null;
      state.taskEditor = { index: Number(target.dataset.index) };
      render();
      return;
    }
    if (action === "cycle-task") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      const task = lead.tasks[Number(target.dataset.index)];
      if (task) {
        task.status = ({ todo: "in_progress", in_progress: "done", done: "todo" })[task.status] || "todo";
        saveLeads();
        render();
      }
      return;
    }
    if (action === "cancel-task") {
      state.taskEditor = null;
      state.taskDeletePendingIndex = null;
      render();
      return;
    }
    if (action === "request-delete-task") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      const index = Number(target.dataset.index);
      if (!Number.isInteger(index) || !lead.tasks[index] || state.taskEditor?.index !== index) return;
      state.taskDeletePendingIndex = index;
      render();
      return;
    }
    if (action === "cancel-delete-task") {
      state.taskDeletePendingIndex = null;
      render();
      return;
    }
    if (action === "confirm-delete-task") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      const index = Number(target.dataset.index);
      if (!Number.isInteger(index) || state.taskDeletePendingIndex !== index || !lead.tasks[index]) return;
      lead.tasks.splice(index, 1);
      state.taskEditor = null;
      state.taskDeletePendingIndex = null;
      saveLeads();
      showToast("Задача удалена");
      return;
    }
    if (action === "load-chat" || action === "refresh-chat") {
      if (state.offline) {
        showToast("Нет подключения к интернету");
        return;
      }
      state.wazzupState = "loading";
      render();
      window.setTimeout(() => { state.wazzupState = "loaded"; render(); }, 350);
      return;
    }
    if (action === "wazzup-settings") {
      showToast("В рабочей версии откроются настройки Wazzup24");
      return;
    }
    if (action === "cancel-outcome") {
      state.pendingEditValues = null;
      if (state.leadReadScrollTop !== null) state.pendingScrollTop = state.leadReadScrollTop;
      state.leadReadScrollTop = null;
      state.editLeadSection = null;
      state.screen = "detail";
      state.detailTab = "details";
      render();
      return;
    }
    if (action === "request-delete-lead") {
      if (!requireLeadCapability(activeLead(), "canDelete", true)) return;
      state.deleteLeadReturnScreen = state.screen;
      state.screen = "delete-lead";
      render();
      return;
    }
    if (action === "cancel-delete-lead") {
      state.screen = state.deleteLeadReturnScreen === "lead-form" ? "lead-form" : state.deleteLeadReturnScreen === "menu" ? "menu" : "detail";
      state.deleteLeadReturnScreen = null;
      render();
      return;
    }
    if (action === "confirm-delete-lead") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canDelete", true) || state.screen !== "delete-lead") return;
      const leadIndex = leads.findIndex(item => item.id === lead.id);
      if (leadIndex < 0) return;
      for (let index = canonicalTourists.length - 1; index >= 0; index -= 1) {
        if (canonicalTourists[index].leadId === lead.id) canonicalTourists.splice(index, 1);
      }
      leads.splice(leadIndex, 1);
      managerAssignedLeadIds.delete(lead.id);
      savePrototypeData();
      state.activeLeadId = null;
      state.deleteLeadReturnScreen = null;
      state.leadReadScrollTop = null;
      state.screen = "list";
      state.detailTab = "details";
      showToast("Лид удалён из mock-данных");
      return;
    }
    if (action === "nav-placeholder") {
      if (target.dataset.nav === "leads") return;
      const params = new URLSearchParams({ role: state.role, offline: state.offline ? "1" : "0" });
      const currentLead = activeLead();
      const contextTourId = canAccessLead(currentLead) ? currentLead.eventId : pageParams.get("tourId");
      if (contextTourId) params.set("tourId", contextTourId);
      if (target.dataset.nav === "tourists") params.set("view", "tourists");
      window.location.href = "./tour-operations.html?" + params.toString();
      return;
    }
    render();
  });

  window.__prototypeDebug = {
    snapshot() {
      const lead = activeLead();
      const visibleLeadRecords = accessibleLeads();
      const visibleLeadIds = new Set(visibleLeadRecords.map(item => item.id));
      return JSON.parse(JSON.stringify({
        leads: visibleLeadRecords,
        tourists: canonicalTourists.filter(tourist => visibleLeadIds.has(tourist.leadId)),
        role: state.role,
        offline: state.offline,
        activeLeadId: canAccessLead(lead) ? state.activeLeadId : null,
        screen: !isLeadRole() || (state.activeLeadId && !canAccessLead(lead)) ? "forbidden" : state.screen,
        detailTab: state.detailTab,
        listMode: state.listMode,
        query: state.query,
        filters: state.filters,
        showArchive: state.showArchive,
        assignedLeadIds: state.role === "admin" || state.role === "manager" ? Array.from(managerAssignedLeadIds) : [],
        capabilities: canAccessLead(lead) ? capabilitiesForLead(lead) : globalCapabilities(),
      }));
    },
  };

  render();
})();
