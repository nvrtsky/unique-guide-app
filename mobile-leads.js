(() => {
  "use strict";

  const app = document.querySelector("#app");
  const pageParams = new URLSearchParams(window.location.search);
  const stages = {
    new: ["Новый", "new"],
    contacted: ["Связались", "work"],
    qualified: ["Квалифицирован", "qualified"],
    confirmed: ["Подтверждён", "confirmed"],
    lost: ["Потерян", "lost"],
  };
  const stageOrder = Object.keys(stages);
  const roleLabels = { admin: "Администратор", manager: "Менеджер", escort: "Сопровождающий", guide: "Гид" };
  const managerAssignedLeadIds = new Set(["lead-1042", "lead-1048"]);
  const tourIdsByTitle = {
    "Гранд-тур по Китаю": "china",
    "Япония: сакура": "japan",
    "Не выбран": null,
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
      phone: "+7 916 441-22-18", email: "anna@example.ru", telegram: "@anna_sokolova",
      stage: "confirmed", source: "Рекомендация", category: "VIP", manager: "Елена Воронова", color: "#2f6bd8",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Сиань", "Шанхай"],
      updated: "сегодня, 09:12", created: "28.07.2026", archived: false,
      accommodation: { hotel: "Beijing Palace", room: "Double / Twin" },
      note: "Семья, нужен русскоязычный сопровождающий. День рождения Анны во время тура.",
      touristIds: ["t1", "t2"],
      messages: [
        { author: "Анна", text: "Подтверждаем тур. Пришлю паспорта вечером.", time: "09:04" },
        { author: "Елена", text: "Спасибо. Бронь и договор уже в документах.", time: "09:12", own: true },
      ],
      documents: ["Договор L-1042.pdf", "Бронирование China.pdf"],
      tasks: [
        { text: "Проверить сканы паспортов", date: "Сегодня", done: false },
        { text: "Подтвердить размещение", date: "15 авг", done: false },
      ],
    },
    {
      id: "lead-1048", code: "L-1048", firstName: "Марина", lastName: "Орлова", middleName: "Сергеевна",
      phone: "+7 903 120-44-90", email: "marina@example.ru", telegram: "@marina_orlova",
      stage: "confirmed", source: "Сайт", category: "Семья", manager: "Елена Воронова", color: "#7a5af0",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"],
      updated: "вчера, 18:40", created: "31.07.2026", archived: false,
      accommodation: { hotel: "", room: "Single" }, note: "Просит номер без соседей.",
      touristIds: ["t3", "t4"],
      messages: [], documents: ["Предложение China.pdf"], tasks: [{ text: "Позвонить после 18:00", date: "Сегодня", done: false }],
    },
    {
      id: "lead-1051", code: "L-1051", firstName: "Денис", lastName: "Волков", middleName: "Олегович",
      phone: "+7 985 600-71-04", email: "denis@example.ru", telegram: "",
      stage: "contacted", source: "Telegram", category: "Индивидуальный", manager: "Игорь Лебедев", color: "#1f8a50",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Шанхай"],
      updated: "1 авг, 14:25", created: "01.08.2026", archived: false,
      accommodation: { hotel: "", room: "Single" }, note: "Сокращённый маршрут без Сианя.",
      touristIds: ["lead-tourist-1051"],
      messages: [], documents: [], tasks: [],
    },
    {
      id: "lead-1033", code: "L-1033", firstName: "Олег", lastName: "Морозов", middleName: "",
      phone: "+7 926 774-30-10", email: "oleg@example.ru", telegram: "",
      stage: "lost", outcome: "postponed", outcomeDate: "2027-02-01", outcomeReason: "Перенёс поездку на следующий сезон",
      source: "Повторный клиент", category: "Пара", manager: "Елена Воронова", color: "#c98a1e",
      eventId: null, tour: "Не выбран", destination: "Япония", cities: [], routeCities: [],
      updated: "29 июл, 11:02", created: "20.07.2026", archived: true,
      accommodation: { hotel: "", room: "" },
      note: "Вернуться к заявке в феврале.", touristIds: ["t5"],
      messages: [], documents: [], tasks: [{ text: "Вернуться к заявке", date: "1 фев", done: false }],
    },
  ];

  const canonicalTouristStorageKey = "unique-guide-tourists-v2";
  const canonicalMigrationStorageKey = "unique-guide-tourists-v2-mobile-migrated";
  const returnContextStorageKey = "unique-guide-mobile-leads-return-v1";
  const leadStorageKey = "unique-guide-leads-v1";
  const routeCityIds = {
    "Пекин": "route-beijing-1",
    "Сиань": "route-xian-1",
    "Шанхай": "route-shanghai-1",
    "Пекин (2)": "route-beijing-2",
  };

  function canonicalTourist(values) {
    const tourist = {
      id: "", leadTouristId: "", contactId: null, dealId: "", leadId: "", tourId: null, lead: "", leadStatus: "Новый", tourStatus: "Ожидает",
      firstName: "", lastName: "", middleName: "", birthDate: "", phone: "", email: "", citizenship: "Россия",
      domesticPassport: "", domesticIssuedBy: "", registrationAddress: "", latinName: "", passport: "", passportExpiry: "",
      scans: [], groupId: null, groupRepresentative: false, route: [], type: "Взрослый", isPrimary: false,
      internalNote: "", guideComment: "", preferredChannel: "", statusByCity: {},
      ...values,
    };
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
      internalNote: "Вегетарианское меню. Плательщик по заявке.", guideComment: "Встречать у выхода B.", preferredChannel: "WhatsApp",
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
      internalNote: "Связь после 10:00 по Москве.", guideComment: "Говорит по-английски.", preferredChannel: "Telegram",
    }),
    canonicalTourist({
      id: "t4", leadTouristId: "lt-1048-2", dealId: "deal-504", leadId: "lead-1048", tourId: "china", lead: "Лид Орлова",
      firstName: "Денис", lastName: "Волков", middleName: "Андреевич", birthDate: "2024-01-16", type: "Младенец", leadStatus: "Подтверждён",
      route: ["route-beijing-1", "route-shanghai-1"], internalNote: "Контакт через основного туриста.", guideComment: "Нужна детская кроватка.",
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

  function loadCanonicalTourists() {
    let saved = [];
    let hasStoredCanonical = false;
    let mobileMigrationComplete = false;
    try {
      const raw = window.localStorage?.getItem(canonicalTouristStorageKey);
      hasStoredCanonical = raw != null;
      mobileMigrationComplete = window.localStorage?.getItem(canonicalMigrationStorageKey) === "1";
      saved = JSON.parse(raw || "[]");
      if (!Array.isArray(saved)) saved = [];
    } catch (error) {
      console.warn("Canonical tourist storage is unavailable", error);
    }
    if (!hasStoredCanonical) return canonicalSeedTourists.map(canonicalTourist);
    const normalized = saved.filter(item => item?.id).map(canonicalTourist);
    if (mobileMigrationComplete) return normalized;
    const savedIds = new Set(normalized.map(tourist => tourist.id));
    ["lead-tourist-1051", "t5"].forEach(id => {
      const seed = canonicalSeedTourists.find(tourist => tourist.id === id);
      if (seed && !savedIds.has(id)) normalized.push(canonicalTourist(seed));
    });
    return normalized;
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

  function loadStoredLeads() {
    try {
      const raw = window.localStorage?.getItem(leadStorageKey);
      if (raw == null) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      const seeds = new Map(leads.map(lead => [lead.id, lead]));
      const restored = saved.filter(lead => lead?.id).map(lead => ({
        messages: [], documents: [], tasks: [], touristIds: [], accommodation: { hotel: "", room: "" },
        ...(seeds.get(lead.id) || {}),
        ...lead,
        tourists: [],
      }));
      const restoredIds = new Set(restored.map(lead => lead.id));
      leads.forEach(lead => { if (!restoredIds.has(lead.id)) restored.push(lead); });
      leads.splice(0, leads.length, ...restored);
      managerAssignedLeadIds.clear();
      leads.forEach(lead => { if (lead.manager === "Елена Воронова") managerAssignedLeadIds.add(lead.id); });
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
  const linkedRole = linkedParams.get("role");
  const state = {
    screen: hasLinkedLead ? "detail" : "list", listMode: canRestoreContext ? returnContext.listMode || "list" : "list", activeLeadId: hasLinkedLead ? linkedLeadId : null,
    detailTab: canRestoreContext ? returnContext.detailTab || "tourists" : linkedParams.get("tab") || "overview",
    query: canRestoreContext ? returnContext.query || "" : "", showArchive: canRestoreContext ? Boolean(returnContext.showArchive) : false, toast: "", pendingLead: null, duplicateIds: [], mergeTargetId: null,
    filters: canRestoreContext ? { statuses: [], source: "all", category: "all", tour: "all", outcome: "all", date: "all", ...(returnContext.filters || {}) } : { statuses: [], source: "all", category: "all", tour: "all", outcome: "all", date: "all" },
    pendingScrollTop: canRestoreContext ? Number(returnContext.scrollTop || 0) : null,
    role: roleLabels[linkedRole] ? linkedRole : (roleLabels[returnContext?.role] ? returnContext.role : "manager"),
    offline: linkedParams.has("offline") ? linkedParams.get("offline") === "1" : Boolean(returnContext?.offline),
    accessReturnScreen: hasLinkedLead ? "detail" : "list",
  };
  if (!state.offline) savePrototypeData();

  const esc = value => String(value ?? "").replace(/[&<>"']/g, symbol => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[symbol]);
  const activeLead = () => leads.find(lead => lead.id === state.activeLeadId);
  const fullName = person => [person.lastName, person.firstName, person.middleName].filter(Boolean).join(" ");
  const initials = person => ((person.firstName || "?")[0] + (person.lastName || "?")[0]).toUpperCase();
  const stageBadge = stage => '<span class="badge ' + stages[stage][1] + '">' + stages[stage][0] + "</span>";
  const unique = key => [...new Set(leads.map(lead => lead[key]).filter(Boolean))];

  function tourIdForTitle(title) {
    return Object.prototype.hasOwnProperty.call(tourIdsByTitle, title) ? tourIdsByTitle[title] : null;
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
    if (state.role === "guide" || state.role === "escort") return '<div class="notice"><strong>Только просмотр</strong><span>Чувствительные поля и действия изменения скрыты для роли «' + esc(roleLabels[state.role]) + '».</span></div>';
    return "";
  }

  function rememberReturnContext(leadId, detailTab = "tourists") {
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

  function openCanonicalTourist(touristId, leadId, detailTab = "tourists") {
    rememberReturnContext(leadId, detailTab);
    const tourist = canonicalTourists.find(item => item.id === touristId);
    const lead = leads.find(item => item.id === leadId);
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
      internalNote: values.internalNote || "",
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
    const items = [
      ["tours", "Туры", icons.tours], ["tourists", "Туристы", icons.people], ["leads", "Лиды", icons.leads],
    ];
    return '<nav class="bottom-nav" aria-label="Основная навигация">' + items.map(([id, label, icon]) =>
      '<button class="nav-item ' + (id === "leads" ? "active" : "") + '" data-action="nav-placeholder" data-nav="' + id + '">' + icon + '<span>' + label + "</span></button>"
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
    return leads.filter(lead => {
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
      (compact ? "" : '<div class="lead-tags"><span>' + esc(lead.category) + '</span><span>' + lead.tourists.length + ' турист' + (lead.tourists.length > 1 ? "а" : "") + '</span><span>' + esc(lead.manager.split(" ")[0]) + "</span></div>") +
      '<div class="card-bottom"><span>' + esc(lead.source) + '</span><span>' + esc(lead.updated) + "</span></div></article>";
  }

  function leadList() {
    const visible = visibleLeads();
    const counts = Object.fromEntries(stageOrder.map(stage => [stage, leads.filter(lead => !lead.archived && lead.stage === stage).length]));
    const statusFilters = '<div class="quick-filters">' + stageOrder.map(stage =>
      '<button class="quick-filter ' + (state.filters.statuses.includes(stage) ? "active" : "") + '" data-quick-status="' + stage + '"><span>' + stages[stage][0] + '</span><b>' + counts[stage] + "</b></button>"
    ).join("") + "</div>";
    const stats = '<div class="stats-grid"><div><span>Активные</span><strong>' + leads.filter(lead => !lead.archived && lead.stage !== "lost").length + '</strong></div><div><span>Подтверждены</span><strong>' + counts.confirmed + '</strong></div><div><span>Туристов</span><strong>' + leads.filter(lead => !lead.archived).reduce((sum, lead) => sum + lead.tourists.length, 0) + "</strong></div></div>";
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
      header: appHeader("Лиды", state.showArchive ? "Архивные заявки" : "CRM · " + leads.filter(lead => !lead.archived).length + " активных"),
    });
  }

  function detailHeader(lead, subtitle) {
    const actions = capabilitiesForLead(lead).canEdit ? '<button class="icon-btn" data-action="lead-menu" aria-label="Действия">•••</button>' : "";
    return '<div class="sheet-head"><button class="back-btn" data-action="back-list" aria-label="Назад">‹</button><span class="avatar dark">' + initials(lead) + '</span><div class="sheet-title"><h2>' + esc(fullName(lead)) + '</h2><p>' + esc(subtitle || lead.code + " · " + lead.tour) + '</p></div><button type="button" class="role-badge" data-action="open-access">' + esc(roleLabels[state.role]) + '</button>' + actions + '</div>';
  }

  function leadOverview(lead) {
    const capability = capabilitiesForLead(lead);
    const outcome = lead.stage === "lost" && capability.canSeePrivate ? '<div class="notice warning"><strong>' + (lead.outcome === "postponed" ? "Отложен" : "Не состоялся") + '</strong><span>' + esc(lead.outcomeReason || "Причина не указана") + (lead.outcomeDate ? " · " + lead.outcomeDate : "") + "</span></div>" : "";
    const summaryAction = lead.eventId
      ? '<a class="primary blue wide button-link" href="./tour-operations.html?lead=' + encodeURIComponent(lead.id) + '&tourId=' + encodeURIComponent(lead.eventId) + '&role=' + encodeURIComponent(state.role) + '&offline=' + (state.offline ? "1" : "0") + '">Открыть сводную тура</a><p class="helper">Откроется весь тур с фильтром по этому лиду. Логистика хранится в сводной, а не внутри карточки заявки.</p>'
      : '<div class="notice"><strong>Тур не выбран</strong><span>Назначьте тур, чтобы туристы появились в сводной.</span></div>';
    const editAction = capability.canEdit ? '<button data-action="edit-lead">Изменить</button>' : "";
    const privateContact = capability.canSeePrivate ? info("Email", lead.email) + info("Telegram", lead.telegram || "Не указан") : "";
    const privateNote = capability.canSeePrivate ? '<section class="block"><h3>ПРИМЕЧАНИЕ</h3><p class="body-copy">' + esc(lead.note || "Нет примечания") + "</p></section>" : "";
    return outcome + '<section class="block"><div class="block-title"><h3>ЗАЯВКА</h3>' + editAction + '</div><div class="info-grid">' +
      info("Тур", lead.tour) + info("Маршрут", lead.routeCities.join(" → ") || "Не выбран") + info("Менеджер", lead.manager) + info("Категория", lead.category) + info("Источник", lead.source) + info("Цвет", '<i class="color-dot" style="background:' + lead.color + '"></i> ' + lead.color, true) +
      "</div></section>" +
      '<section class="block"><h3>КОНТАКТ</h3><div class="info-grid">' + info("Телефон", lead.phone) + privateContact + info("Создан", lead.created) + "</div></section>" +
      '<section class="block"><h3>РАЗМЕЩЕНИЕ</h3><div class="info-grid compact-info">' + info("Отель", lead.accommodation.hotel || "Не выбран") + info("Номер", lead.accommodation.room || "Не выбран") + "</div></section>" +
      privateNote +
      '<section class="block summary-card"><div class="summary-head"><span class="summary-icon">▦</span><div><strong>Сводная по туру</strong><span>' + lead.tourists.length + ' туриста · рейсы, отели и отъезды</span></div></div>' + summaryAction + "</section>";
  }

  function info(label, value, raw = false) {
    return '<div class="info"><span>' + esc(label) + '</span><strong>' + (raw ? value : esc(value)) + "</strong></div>";
  }

  function touristCard(tourist) {
    return '<button class="person-card person-button" data-action="open-unified-tourist" data-tourist="' + tourist.id + '"><span class="avatar">' + initials(tourist) + '</span><span class="lead-main"><span class="lead-name">' + esc(fullName(tourist)) + '</span><span class="lead-meta">' + esc(tourist.type + " · " + (tourist.birthDate || "дата рождения не заполнена")) + '</span></span>' + (tourist.isPrimary ? '<span class="badge confirmed">Основной</span>' : '<span class="chevron">›</span>') + "</button>";
  }

  function touristsTab(lead) {
    const addAction = capabilitiesForLead(lead).canAddTourist ? '<button data-action="add-tourist">+ Добавить</button>' : "";
    return '<section class="block"><div class="block-title"><h3>ТУРИСТЫ · ' + lead.tourists.length + '</h3>' + addAction + '</div><p class="helper top-helper">Карточки синхронизируются с участниками выбранного тура.</p>' + lead.tourists.map(touristCard).join("") + "</section>";
  }

  function chatTab(lead) {
    const messages = lead.messages.length ? lead.messages.map(message => '<div class="message ' + (message.own ? "own" : "") + '"><strong>' + esc(message.author) + '</strong><p>' + esc(message.text) + '</p><span>' + esc(message.time) + "</span></div>").join("") : '<div class="empty compact-empty"><h3>Сообщений нет</h3><p>Начните диалог с клиентом.</p></div>';
    const composer = capabilitiesForLead(lead).canMutateMessages ? '<form id="chat-form" class="composer"><input name="message" placeholder="Сообщение клиенту" required><button aria-label="Отправить">↑</button></form>' : "";
    return '<section class="chat-thread">' + messages + "</section>" + composer;
  }

  function docsTab(lead) {
    const docs = lead.documents.map((doc, index) => '<button class="action-row" data-action="download-doc" data-index="' + index + '"><span class="file-icon">PDF</span><span><strong>' + esc(doc) + '</strong><small>Готов к скачиванию</small></span><b>↓</b></button>').join("");
    const createAction = capabilitiesForLead(lead).canMutateDocuments ? '<button data-action="generate-doc">+ Создать</button>' : "";
    return '<section class="block"><div class="block-title"><h3>ДОКУМЕНТЫ</h3>' + createAction + '</div>' + (docs || '<div class="empty compact-empty"><p>Документов пока нет.</p></div>') + '<button class="secondary wide" data-action="reconcile">Сверить договор и бронирование</button></section>';
  }

  function tasksTab(lead) {
    const canMutate = capabilitiesForLead(lead).canMutateTasks;
    const addAction = canMutate ? '<button data-action="add-task">+ Добавить</button>' : "";
    const rows = lead.tasks.map((task, index) => {
      const tag = canMutate ? "button" : "div";
      const action = canMutate ? ' data-action="toggle-task" data-index="' + index + '"' : "";
      return '<' + tag + ' class="task-row ' + (task.done ? "done" : "") + '"' + action + '><span class="task-check">' + (task.done ? "✓" : "") + '</span><span><strong>' + esc(task.text) + '</strong><small>' + esc(task.date) + "</small></span></" + tag + ">";
    });
    return '<section class="block"><div class="block-title"><h3>ЗАДАЧИ</h3>' + addAction + "</div>" + (rows.join("") || '<div class="empty compact-empty"><p>Нет активных задач.</p></div>') + "</section>";
  }

  function leadDetail(lead) {
    const capability = capabilitiesForLead(lead);
    const tabs = [["overview", "Детали"], ["tourists", "Туристы"], ["tasks", "Задачи"]];
    if (capability.canSeePrivate) tabs.splice(2, 0, ["chat", "Чат"], ["docs", "Документы"]);
    const visibleTab = tabs.some(tab => tab[0] === state.detailTab) ? state.detailTab : "overview";
    let body = leadOverview(lead);
    if (visibleTab === "tourists") body = touristsTab(lead);
    if (visibleTab === "chat") body = chatTab(lead);
    if (visibleTab === "docs") body = docsTab(lead);
    if (visibleTab === "tasks") body = tasksTab(lead);
    const statuses = stageOrder.map(stage => capability.canChangeStatus ? '<button class="stage ' + stages[stage][1] + " " + (lead.stage === stage ? "active" : "") + '" data-stage="' + stage + '">' + stages[stage][0] + "</button>" : '<span class="stage ' + stages[stage][1] + " " + (lead.stage === stage ? "active" : "") + '">' + stages[stage][0] + "</span>").join("");
    return chrome('<section class="sheet">' + detailHeader(lead) + '<div class="stage-row status-row">' + statuses + '</div><div class="detail-tabs">' + tabs.map(([id, label]) => '<button class="' + (visibleTab === id ? "active" : "") + '" data-detail-tab="' + id + '">' + label + "</button>").join("") + '</div><div class="sheet-scroll detail-scroll">' + accessBanner(lead) + body + "</div></section>", { nav: false });
  }

  function optionList(values, selected) {
    return values.map(value => '<option ' + (value === selected ? "selected" : "") + '>' + esc(value) + "</option>").join("");
  }

  function leadForm(lead) {
    const editing = Boolean(lead);
    const item = lead || { firstName: "", lastName: "", middleName: "", phone: "", email: "", telegram: "", source: "Сайт", category: "Индивидуальный", manager: "Елена Воронова", tour: "Гранд-тур по Китаю", routeCities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], color: "#2f6bd8", accommodation: { hotel: "", room: "" }, note: "" };
    return chrome('<section class="sheet"><form id="lead-form" class="sheet" data-editing="' + (editing ? lead.id : "") + '">' +
      '<div class="sheet-head"><button type="button" class="back-btn" data-action="' + (editing ? "back-detail" : "back-list") + '" aria-label="Закрыть">×</button><div class="sheet-title"><h2>' + (editing ? "Изменить лид" : "Новый лид") + '</h2><p>Поля веб-карточки в мобильной форме</p></div></div><div class="sheet-scroll form-scroll">' +
      '<section class="block"><h3>КОНТАКТ</h3><div class="two">' + field("Фамилия *", "lastName", item.lastName, true) + field("Имя *", "firstName", item.firstName, true) + '</div>' + field("Отчество", "middleName", item.middleName) + '<div class="two">' + field("Телефон *", "phone", item.phone, true, "tel") + field("Email", "email", item.email, false, "email") + '</div>' + field("Telegram", "telegram", item.telegram, false, "text", "@username") + "</section>" +
      '<section class="block"><h3>ЗАЯВКА</h3><div class="two"><label class="field"><span>Источник</span><select name="source">' + optionList(["Сайт", "Рекомендация", "Telegram", "Повторный клиент"], item.source) + '</select></label><label class="field"><span>Категория</span><select name="category">' + optionList(["Индивидуальный", "Пара", "Семья", "VIP"], item.category) + '</select></label></div><label class="field"><span>Тур</span><select name="tour">' + optionList(["Гранд-тур по Китаю", "Япония: сакура", "Не выбран"], item.tour) + '</select></label><label class="field"><span>Менеджер</span><select name="manager">' + optionList(["Елена Воронова", "Игорь Лебедев"], item.manager) + '</select></label><label class="field"><span>Города маршрута</span><input name="routeCities" value="' + esc(item.routeCities.join(", ")) + '"></label>' + field("Цвет", "color", item.color, false, "color") + "</section>" +
      '<section class="block"><h3>РАЗМЕЩЕНИЕ</h3><div class="two">' + field("Отель", "hotel", item.accommodation.hotel) + field("Номер", "room", item.accommodation.room) + "</div></section>" +
      '<section class="block"><h3>ПРИМЕЧАНИЕ</h3><label class="field"><textarea name="note" placeholder="Пожелания клиента">' + esc(item.note) + "</textarea></label></section>" +
      (!editing ? '<section class="block"><h3>ТУРИСТЫ</h3><p class="helper top-helper">Основной турист создаётся из контакта. Добавьте попутчиков сразу или позже.</p><div class="two">' + field("Фамилия попутчика", "companionLast1", "") + field("Имя попутчика", "companionFirst1", "") + '</div><div class="two">' + field("Фамилия попутчика", "companionLast2", "") + field("Имя попутчика", "companionFirst2", "") + '</div></section>' : "") +
      '</div><div class="sheet-actions"><button type="button" class="secondary" data-action="' + (editing ? "back-detail" : "back-list") + '">Отмена</button><button class="primary" type="submit">Сохранить</button></div></form></section>', { nav: false });
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
    const roles = Object.keys(roleLabels).map(role => '<button type="button" class="action-row" data-action="select-role" data-role="' + role + '"><span class="action-icon">' + (state.role === role ? "✓" : "○") + '</span><span><strong>' + esc(roleLabels[role]) + '</strong><small>' + esc(role === "admin" ? "Все лиды и административные действия" : role === "manager" ? "Назначенные лиды L-1042 и L-1048" : "Read-only и ограниченные поля") + '</small></span><b>›</b></button>').join("");
    return chrome('<section class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="close-access" aria-label="Назад">‹</button><div class="sheet-title"><h2>Роль и доступ</h2><p>Mock capabilities · без обхода через click</p></div></div><div class="sheet-scroll"><div class="notice"><strong>Текущая роль: ' + esc(roleLabels[state.role]) + '</strong><span>' + (state.offline ? "Offline: любые записи запрещены." : "Права проверяются повторно перед каждой записью.") + '</span></div><section class="block"><h3>РОЛЬ</h3><div class="action-list">' + roles + '</div></section><section class="block"><button type="button" class="action-row" data-action="toggle-offline"><span class="action-icon">' + (state.offline ? "✓" : "○") + '</span><span><strong>Offline</strong><small>Показывать сохранённые данные без возможности записи</small></span><b>›</b></button></section></div></section>', { nav: false });
  }

  function selectField(label, name, values, selected) {
    const labels = { all: "Все", postponed: "Отложен", failed: "Не состоялся", today: "Сегодня", week: "Неделя", month: "Месяц" };
    return '<label class="field"><span>' + esc(label) + '</span><select name="' + name + '">' + values.map(value => '<option value="' + esc(value) + '" ' + (value === selected ? "selected" : "") + '>' + esc(labels[value] || value) + "</option>").join("") + "</select></label>";
  }

  function lostScreen(lead) {
    return chrome('<section class="sheet"><form id="lost-form" class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="back-detail">‹</button><div class="sheet-title"><h2>Результат потери</h2><p>' + esc(fullName(lead)) + '</p></div></div><div class="sheet-scroll form-scroll"><div class="notice warning"><strong>Статус «Потерян»</strong><span>Укажите, вернуться ли к заявке позже.</span></div><section class="block"><label class="radio-card"><input type="radio" name="outcome" value="postponed" checked><span><strong>Отложен</strong><small>Создать дату возврата к заявке</small></span></label><label class="radio-card"><input type="radio" name="outcome" value="failed"><span><strong>Не состоялся</strong><small>Закрыть без даты возврата</small></span></label>' + field("Вернуться", "outcomeDate", lead.outcomeDate || "2026-09-01", false, "date") + '<label class="field"><span>Причина *</span><textarea name="outcomeReason" required placeholder="Что произошло">' + esc(lead.outcomeReason || "") + '</textarea></label></section></div><div class="sheet-actions"><button type="button" class="secondary" data-action="back-detail">Отмена</button><button class="danger" type="submit">Сохранить потерю</button></div></form></section>', { nav: false });
  }

  function menuScreen(lead) {
    const deleteAction = capabilitiesForLead(lead).canDelete ? '<button class="action-row danger-row" data-action="delete-placeholder"><span class="action-icon">×</span><span><strong>Удалить лид</strong><small>Административное действие</small></span><b>›</b></button>' : "";
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-detail">×</button><div class="sheet-title"><h2>Действия с лидом</h2><p>' + esc(lead.code) + '</p></div></div><div class="sheet-scroll"><section class="action-list"><button class="action-row" data-action="edit-lead"><span class="action-icon">✎</span><span><strong>Изменить лид</strong><small>Контакт, тур и маршрут</small></span><b>›</b></button><button class="action-row" data-action="merge-lead"><span class="action-icon">⇆</span><span><strong>Объединить лиды</strong><small>Перенести туристов и историю</small></span><b>›</b></button><button class="action-row" data-action="archive-lead"><span class="action-icon">□</span><span><strong>' + (lead.archived ? "Вернуть из архива" : "Архивировать") + '</strong><small>Данные останутся доступны</small></span><b>›</b></button>' + deleteAction + '</section></div></section>', { nav: false });
  }

  function mergeScreen(lead) {
    const candidates = leads.filter(item => item.id !== lead.id && !item.archived && item.eventId === lead.eventId && capabilitiesForLead(item).canMerge);
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-detail">‹</button><div class="sheet-title"><h2>Объединить лиды</h2><p>Основным останется ' + esc(lead.code) + '</p></div></div><div class="sheet-scroll"><div class="notice"><strong>Что будет перенесено</strong><span>Туристы, сообщения, документы и задачи. История сохраняется у основной заявки.</span></div><section class="block"><h3>ВЫБЕРИТЕ ВТОРОЙ ЛИД</h3>' + candidates.map(item => '<label class="merge-card"><input type="radio" name="mergeTarget" value="' + item.id + '" ' + (state.mergeTargetId === item.id ? "checked" : "") + '><span class="avatar">' + initials(item) + '</span><span class="lead-main"><strong>' + esc(fullName(item)) + '</strong><small>' + esc(item.code + " · " + item.tourists.length + " турист") + "</small></span></label>").join("") + '</section></div><div class="sheet-actions"><button class="secondary" data-action="back-detail">Отмена</button><button class="primary blue" data-action="apply-merge" ' + (state.mergeTargetId ? "" : "disabled") + '>Объединить</button></div></section>', { nav: false });
  }

  function duplicateScreen() {
    const matches = state.duplicateIds.map(id => leads.find(lead => lead.id === id)).filter(Boolean);
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="cancel-duplicate">‹</button><div class="sheet-title"><h2>Возможный дубль</h2><p>Совпали телефон или email</p></div></div><div class="sheet-scroll"><div class="notice warning"><strong>Проверьте существующие лиды</strong><span>Можно открыть карточку, объединить данные или создать отдельный лид.</span></div>' + matches.map(leadCard).join("") + '</div><div class="sheet-actions three-actions"><button class="secondary" data-action="cancel-duplicate">Назад</button><button class="secondary" data-action="open-duplicate" data-id="' + matches[0].id + '">Открыть</button><button class="primary" data-action="create-anyway">Создать отдельно</button></div></section>', { nav: false });
  }

  function render() {
    const lead = activeLead();
    if (state.screen === "access") app.innerHTML = accessScreen();
    else if (state.screen === "detail" && lead) app.innerHTML = leadDetail(lead);
    else if (state.screen === "lead-form") app.innerHTML = leadForm(lead && state.activeLeadId ? lead : null);
    else if (state.screen === "filters") app.innerHTML = filtersScreen();
    else if (state.screen === "lost" && lead) app.innerHTML = lostScreen(lead);
    else if (state.screen === "menu" && lead) app.innerHTML = menuScreen(lead);
    else if (state.screen === "merge" && lead) app.innerHTML = mergeScreen(lead);
    else if (state.screen === "duplicate") app.innerHTML = duplicateScreen();
    else app.innerHTML = leadList();
    if (state.pendingScrollTop != null) {
      const scroller = app.querySelector?.(".detail-scroll") || app.querySelector?.(".lead-workspace-scroll");
      if (scroller) scroller.scrollTop = state.pendingScrollTop;
      state.pendingScrollTop = null;
    }
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function buildLead(values) {
    sequence += 1;
    const routeCities = values.routeCities.split(",").map(item => item.trim()).filter(Boolean);
    const id = "lead-proto-" + sequence;
    const created = {
      id, code: "L-10" + sequence, firstName: values.firstName, lastName: values.lastName, middleName: values.middleName,
      phone: values.phone, email: values.email, telegram: values.telegram, stage: "new", source: values.source,
      category: values.category, manager: values.manager, color: values.color || "#2f6bd8", eventId: tourIdForTitle(values.tour),
      tour: values.tour, destination: values.tour.includes("Кита") ? "Китай" : "Япония", cities: routeCities, routeCities,
      updated: "только что", created: "03.08.2026", archived: false,
      accommodation: { hotel: values.hotel, room: values.room }, note: values.note, tourists: [], touristIds: [],
      messages: [], documents: [], tasks: [],
    };
    created.tourists.push(createCanonicalTouristForLead(created, {
      firstName: values.firstName,
      lastName: values.lastName,
      middleName: values.middleName,
      phone: values.phone,
      email: values.email,
      isPrimary: true,
    }));
    [1, 2].forEach(index => {
      if (values["companionLast" + index] && values["companionFirst" + index]) {
        created.tourists.push(createCanonicalTouristForLead(created, {
          lastName: values["companionLast" + index],
          firstName: values["companionFirst" + index],
        }));
      }
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
    state.detailTab = "overview";
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
  });

  app.addEventListener("change", event => {
    if (event.target.name === "mergeTarget") {
      state.mergeTargetId = event.target.value;
      render();
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
        const primary = lead.tourists.find(tourist => tourist.isPrimary) || lead.tourists[0];
        Object.assign(lead, { firstName: values.firstName, lastName: values.lastName, middleName: values.middleName, phone: values.phone, email: values.email, telegram: values.telegram, source: values.source, category: values.category, manager: values.manager, color: values.color, tour: values.tour, eventId: tourIdForTitle(values.tour), routeCities: values.routeCities.split(",").map(item => item.trim()).filter(Boolean), accommodation: { hotel: values.hotel, room: values.room }, note: values.note, updated: "только что" });
        if (primary) {
          Object.assign(primary, { firstName: values.firstName, lastName: values.lastName, middleName: values.middleName, phone: values.phone, email: values.email });
          primary.name = fullName(primary);
          primary.initials = initials(primary);
        }
        lead.tourists.forEach(tourist => {
          tourist.lead = leadLabel(lead);
          tourist.leadStatus = stageLabel(lead.stage);
          tourist.tourId = lead.eventId;
        });
        if (lead.manager === "Елена Воронова") managerAssignedLeadIds.add(lead.id); else managerAssignedLeadIds.delete(lead.id);
        savePrototypeData();
        state.screen = "detail";
        showToast("Лид сохранён");
      } else {
        if (!requireCreateCapability()) return;
        const pending = buildLead(values);
        const duplicateIds = leads.filter(lead => lead.phone.replace(/\D/g, "") === pending.phone.replace(/\D/g, "") || (pending.email && lead.email.toLowerCase() === pending.email.toLowerCase())).map(lead => lead.id);
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
      Object.assign(lead, { stage: "lost", outcome: values.outcome, outcomeDate: values.outcome === "postponed" ? values.outcomeDate : "", outcomeReason: values.outcomeReason, updated: "только что" });
      lead.tourists.forEach(tourist => { tourist.leadStatus = stageLabel(lead.stage); });
      savePrototypeData();
      state.screen = "detail";
      showToast("Результат потери сохранён");
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
  });

  app.addEventListener("click", event => {
    const target = event.target.closest("[data-action],[data-open-lead],[data-edit-tourist],[data-stage],[data-detail-tab],[data-quick-status],[data-list-mode]");
    if (!target || target.disabled) return;
    if (target.dataset.openLead) {
      state.activeLeadId = target.dataset.openLead;
      state.detailTab = "overview";
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
      if (roleLabels[target.dataset.role]) state.role = target.dataset.role;
      render();
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
    if (action === "new-lead") {
      if (!requireCreateCapability()) return;
      state.activeLeadId = null;
      state.screen = "lead-form";
    }
    if (action === "edit-lead") {
      if (!requireLeadCapability(activeLead(), "canEdit")) return;
      state.screen = "lead-form";
    }
    if (action === "back-list") { state.screen = "list"; state.activeLeadId = null; }
    if (action === "back-detail") state.screen = "detail";
    if (action === "filters") state.screen = "filters";
    if (action === "toggle-archive") state.showArchive = !state.showArchive;
    if (action === "add-tourist") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canAddTourist")) return;
      const tourist = createCanonicalTouristForLead(lead, { lastName: lead.lastName });
      canonicalTourists.push(tourist);
      syncLeadTouristContext(lead);
      savePrototypeData();
      openCanonicalTourist(tourist.id, lead.id, "tourists");
      return;
    }
    if (action === "lead-menu") {
      if (!requireLeadCapability(activeLead(), "canEdit")) return;
      state.screen = "menu";
    }
    if (action === "merge-lead") {
      if (!requireLeadCapability(activeLead(), "canMerge")) return;
      state.mergeTargetId = null;
      state.screen = "merge";
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
      const main = activeLead();
      const secondary = leads.find(lead => lead.id === state.mergeTargetId);
      if (!requireLeadCapability(main, "canMerge") || !requireLeadCapability(secondary, "canMerge")) return;
      if (!secondary || main.eventId !== secondary.eventId) {
        showToast("Объединение доступно только внутри одного тура");
        return;
      }
      secondary.tourists.forEach(tourist => {
        tourist.leadId = main.id;
        tourist.lead = leadLabel(main);
        tourist.leadStatus = stageLabel(main.stage);
      });
      main.messages.push(...secondary.messages);
      main.documents.push(...secondary.documents);
      main.tasks.push(...secondary.tasks);
      secondary.archived = true;
      secondary.note = "Объединён с " + main.code;
      syncLeadTouristContext(main);
      syncLeadTouristContext(secondary);
      savePrototypeData();
      state.mergeTargetId = null;
      state.screen = "detail";
      state.detailTab = "tourists";
      showToast("Лиды объединены, второй лид помещён в архив");
      return;
    }
    if (action === "cancel-duplicate") { state.pendingLead = null; state.duplicateIds = []; state.screen = "lead-form"; }
    if (action === "create-anyway") { commitPendingLead(); return; }
    if (action === "open-duplicate") { state.pendingLead = null; state.duplicateIds = []; state.activeLeadId = target.dataset.id; state.screen = "detail"; }
    if (action === "download-doc") showToast("Документ подготовлен к скачиванию");
    if (action === "generate-doc") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateDocuments")) return;
      lead.documents.push("Новый договор " + lead.code + ".pdf");
      saveLeads();
      showToast("Договор создан");
      return;
    }
    if (action === "reconcile") showToast("Сверка: расхождений не найдено");
    if (action === "add-task") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      lead.tasks.push({ text: "Новая задача по лиду", date: "Сегодня", done: false });
      saveLeads();
      showToast("Задача добавлена");
      return;
    }
    if (action === "toggle-task") {
      const lead = activeLead();
      if (!requireLeadCapability(lead, "canMutateTasks")) return;
      const task = lead.tasks[Number(target.dataset.index)];
      if (task) {
        task.done = !task.done;
        saveLeads();
      }
    }
    if (action === "delete-placeholder") {
      if (!requireLeadCapability(activeLead(), "canDelete", true)) return;
      showToast("Удаление лида подтверждается администратором в рабочей версии");
      return;
    }
    if (action === "nav-placeholder") {
      if (target.dataset.nav === "leads") return;
      const params = new URLSearchParams({ role: state.role, offline: state.offline ? "1" : "0" });
      const contextTourId = activeLead()?.eventId || pageParams.get("tourId");
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
      return JSON.parse(JSON.stringify({
        leads,
        tourists: canonicalTourists,
        role: state.role,
        offline: state.offline,
        activeLeadId: state.activeLeadId,
        screen: state.screen,
        assignedLeadIds: Array.from(managerAssignedLeadIds),
        capabilities: lead ? capabilitiesForLead(lead) : globalCapabilities(),
      }));
    },
  };

  render();
})();
