(() => {
  "use strict";

  const app = document.querySelector("#app");
  const stages = {
    new: ["Новый", "new"],
    contacted: ["Связались", "work"],
    qualified: ["Квалифицирован", "qualified"],
    confirmed: ["Подтверждён", "confirmed"],
    lost: ["Потерян", "lost"],
  };
  const stageOrder = Object.keys(stages);
  const icons = {
    tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6"/><path d="M16 13h4"/></svg>',
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
      finance: { currency: "USD", total: "8 200", advance: "3 000", balance: "5 200" },
      accommodation: { hotel: "Beijing Palace", room: "Double / Twin" },
      note: "Семья, нужен русскоязычный сопровождающий. День рождения Анны во время тура.",
      tourists: [
        { id: "t1", lastName: "Соколова", firstName: "Анна", middleName: "Игоревна", birthDate: "1988-09-18", citizenship: "Россия", type: "adult", phone: "+7 916 441-22-18", domesticPassport: "45 12 345678", foreignPassport: "72 3456789", address: "Москва, ул. Тверская, 12", primary: true, note: "Без глютена", scans: 2 },
        { id: "t2", lastName: "Соколов", firstName: "Илья", middleName: "Андреевич", birthDate: "1986-04-11", citizenship: "Россия", type: "adult", phone: "+7 916 441-22-19", domesticPassport: "45 10 112233", foreignPassport: "72 1122334", address: "Москва, ул. Тверская, 12", primary: false, note: "", scans: 1 },
      ],
      messages: [
        { author: "Анна", text: "Подтверждаем тур. Пришлю паспорта вечером.", time: "09:04" },
        { author: "Елена", text: "Спасибо. Бронь и договор уже в документах.", time: "09:12", own: true },
      ],
      documents: ["Договор L-1042.pdf", "Бронирование China.pdf"],
      tasks: [
        { text: "Проверить сканы паспортов", date: "Сегодня", done: false },
        { text: "Получить остаток оплаты", date: "15 авг", done: false },
      ],
    },
    {
      id: "lead-1048", code: "L-1048", firstName: "Марина", lastName: "Орлова", middleName: "Сергеевна",
      phone: "+7 903 120-44-90", email: "marina@example.ru", telegram: "@marina_orlova",
      stage: "qualified", source: "Сайт", category: "Семья", manager: "Елена Воронова", color: "#7a5af0",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"],
      updated: "вчера, 18:40", created: "31.07.2026", archived: false,
      finance: { currency: "USD", total: "4 100", advance: "0", balance: "4 100" },
      accommodation: { hotel: "", room: "Single" }, note: "Просит номер без соседей.",
      tourists: [
        { id: "t3", lastName: "Орлова", firstName: "Марина", middleName: "Сергеевна", birthDate: "1991-02-02", citizenship: "Россия", type: "adult", phone: "+7 903 120-44-90", domesticPassport: "", foreignPassport: "72 9988776", address: "Санкт-Петербург", primary: true, note: "", scans: 1 },
      ],
      messages: [], documents: ["Предложение China.pdf"], tasks: [{ text: "Позвонить после 18:00", date: "Сегодня", done: false }],
    },
    {
      id: "lead-1051", code: "L-1051", firstName: "Денис", lastName: "Волков", middleName: "Олегович",
      phone: "+7 985 600-71-04", email: "denis@example.ru", telegram: "",
      stage: "contacted", source: "Telegram", category: "Индивидуальный", manager: "Игорь Лебедев", color: "#1f8a50",
      eventId: "china", tour: "Гранд-тур по Китаю", destination: "Китай",
      cities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], routeCities: ["Пекин", "Шанхай"],
      updated: "1 авг, 14:25", created: "01.08.2026", archived: false,
      finance: { currency: "USD", total: "3 900", advance: "0", balance: "3 900" },
      accommodation: { hotel: "", room: "Single" }, note: "Сокращённый маршрут без Сианя.",
      tourists: [{ id: "t4", lastName: "Волков", firstName: "Денис", middleName: "Олегович", birthDate: "1984-06-20", citizenship: "Россия", type: "adult", phone: "+7 985 600-71-04", domesticPassport: "", foreignPassport: "", address: "Казань", primary: true, note: "", scans: 0 }],
      messages: [], documents: [], tasks: [],
    },
    {
      id: "lead-1033", code: "L-1033", firstName: "Олег", lastName: "Морозов", middleName: "",
      phone: "+7 926 774-30-10", email: "oleg@example.ru", telegram: "",
      stage: "lost", outcome: "postponed", outcomeDate: "2027-02-01", outcomeReason: "Перенёс поездку на следующий сезон",
      source: "Повторный клиент", category: "Пара", manager: "Елена Воронова", color: "#c98a1e",
      eventId: null, tour: "Не выбран", destination: "Япония", cities: [], routeCities: [],
      updated: "29 июл, 11:02", created: "20.07.2026", archived: true,
      finance: { currency: "USD", total: "0", advance: "0", balance: "0" }, accommodation: { hotel: "", room: "" },
      note: "Вернуться к заявке в феврале.", tourists: [{ id: "t5", lastName: "Морозов", firstName: "Олег", middleName: "", birthDate: "", citizenship: "Россия", type: "adult", phone: "+7 926 774-30-10", domesticPassport: "", foreignPassport: "", address: "", primary: true, note: "", scans: 0 }],
      messages: [], documents: [], tasks: [{ text: "Вернуться к заявке", date: "1 фев", done: false }],
    },
  ];

  const linkedLeadId = new URLSearchParams(window.location.search).get("lead");
  const hasLinkedLead = leads.some(lead => lead.id === linkedLeadId);
  const state = {
    screen: hasLinkedLead ? "detail" : "list", listMode: "list", activeLeadId: hasLinkedLead ? linkedLeadId : null, editingTouristId: null, detailTab: "overview",
    query: "", showArchive: false, toast: "", pendingLead: null, duplicateIds: [], mergeTargetId: null, ocrDraft: null,
    filters: { statuses: [], source: "all", category: "all", tour: "all", outcome: "all", date: "all" },
  };

  const esc = value => String(value ?? "").replace(/[&<>"']/g, symbol => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[symbol]);
  const activeLead = () => leads.find(lead => lead.id === state.activeLeadId);
  const fullName = person => [person.lastName, person.firstName, person.middleName].filter(Boolean).join(" ");
  const initials = person => ((person.firstName || "?")[0] + (person.lastName || "?")[0]).toUpperCase();
  const stageBadge = stage => '<span class="badge ' + stages[stage][1] + '">' + stages[stage][0] + "</span>";
  const unique = key => [...new Set(leads.map(lead => lead[key]).filter(Boolean))];

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
      ["tasks", "Задачи", icons.tasks], ["tourists", "Туристы", icons.people],
      ["finance", "Финансы", icons.wallet], ["leads", "Лиды", icons.leads],
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
    return '<header class="app-top"><div class="top-row"><span class="user-label">Мобильное приложение</span><span class="role-badge">Менеджер</span></div>' +
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
    return chrome('<div class="scroll lead-workspace-scroll">' + statusFilters + stats + toolbar + view + content + '</div><button class="fab" data-action="new-lead"><span class="fab-plus">+</span><span class="fab-label">Создать лид</span></button>', {
      header: appHeader("Лиды", state.showArchive ? "Архивные заявки" : "CRM · " + leads.filter(lead => !lead.archived).length + " активных"),
    });
  }

  function detailHeader(lead, subtitle) {
    return '<div class="sheet-head"><button class="back-btn" data-action="back-list" aria-label="Назад">‹</button><span class="avatar dark">' + initials(lead) + '</span><div class="sheet-title"><h2>' + esc(fullName(lead)) + '</h2><p>' + esc(subtitle || lead.code + " · " + lead.tour) + '</p></div><button class="icon-btn" data-action="lead-menu" aria-label="Действия">•••</button></div>';
  }

  function leadOverview(lead) {
    const outcome = lead.stage === "lost" ? '<div class="notice warning"><strong>' + (lead.outcome === "postponed" ? "Отложен" : "Не состоялся") + '</strong><span>' + esc(lead.outcomeReason || "Причина не указана") + (lead.outcomeDate ? " · " + lead.outcomeDate : "") + "</span></div>" : "";
    const summaryAction = lead.eventId
      ? '<a class="primary blue wide button-link" href="./tour-operations.html?lead=' + encodeURIComponent(lead.id) + '">Открыть сводную тура</a><p class="helper">Откроется весь тур с фильтром по этому лиду. Логистика хранится в сводной, а не внутри карточки заявки.</p>'
      : '<div class="notice"><strong>Тур не выбран</strong><span>Назначьте тур, чтобы туристы появились в сводной.</span></div>';
    return outcome + '<section class="block"><div class="block-title"><h3>ЗАЯВКА</h3><button data-action="edit-lead">Изменить</button></div><div class="info-grid">' +
      info("Тур", lead.tour) + info("Маршрут", lead.routeCities.join(" → ") || "Не выбран") + info("Менеджер", lead.manager) + info("Категория", lead.category) + info("Источник", lead.source) + info("Цвет", '<i class="color-dot" style="background:' + lead.color + '"></i> ' + lead.color, true) +
      "</div></section>" +
      '<section class="block"><h3>КОНТАКТ</h3><div class="info-grid">' + info("Телефон", lead.phone) + info("Email", lead.email) + info("Telegram", lead.telegram || "Не указан") + info("Создан", lead.created) + "</div></section>" +
      '<section class="block"><h3>ФИНАНСЫ И РАЗМЕЩЕНИЕ</h3><div class="metric-row"><div><span>Стоимость</span><strong>' + esc(lead.finance.total + " " + lead.finance.currency) + '</strong></div><div><span>Аванс</span><strong>' + esc(lead.finance.advance) + '</strong></div><div><span>Остаток</span><strong>' + esc(lead.finance.balance) + '</strong></div></div><div class="info-grid compact-info">' + info("Отель", lead.accommodation.hotel || "Не выбран") + info("Номер", lead.accommodation.room || "Не выбран") + "</div></section>" +
      '<section class="block"><h3>ПРИМЕЧАНИЕ</h3><p class="body-copy">' + esc(lead.note || "Нет примечания") + "</p></section>" +
      '<section class="block summary-card"><div class="summary-head"><span class="summary-icon">▦</span><div><strong>Сводная по туру</strong><span>' + lead.tourists.length + ' туриста · рейсы, отели и отъезды</span></div></div>' + summaryAction + "</section>";
  }

  function info(label, value, raw = false) {
    return '<div class="info"><span>' + esc(label) + '</span><strong>' + (raw ? value : esc(value)) + "</strong></div>";
  }

  function touristCard(tourist) {
    return '<button class="person-card person-button" data-edit-tourist="' + tourist.id + '"><span class="avatar">' + initials(tourist) + '</span><span class="lead-main"><span class="lead-name">' + esc(fullName(tourist)) + '</span><span class="lead-meta">' + esc(({ adult: "Взрослый", child: "Ребёнок", infant: "Младенец" })[tourist.type] + " · " + (tourist.foreignPassport || "паспорт не заполнен")) + '</span></span>' + (tourist.primary ? '<span class="badge confirmed">Основной</span>' : '<span class="chevron">›</span>') + "</button>";
  }

  function touristsTab(lead) {
    return '<section class="block"><div class="block-title"><h3>ТУРИСТЫ · ' + lead.tourists.length + '</h3><button data-action="add-tourist">+ Добавить</button></div><p class="helper top-helper">Карточки синхронизируются с участниками выбранного тура.</p>' + lead.tourists.map(touristCard).join("") + "</section>";
  }

  function chatTab(lead) {
    const messages = lead.messages.length ? lead.messages.map(message => '<div class="message ' + (message.own ? "own" : "") + '"><strong>' + esc(message.author) + '</strong><p>' + esc(message.text) + '</p><span>' + esc(message.time) + "</span></div>").join("") : '<div class="empty compact-empty"><h3>Сообщений нет</h3><p>Начните диалог с клиентом.</p></div>';
    return '<section class="chat-thread">' + messages + '</section><form id="chat-form" class="composer"><input name="message" placeholder="Сообщение клиенту" required><button aria-label="Отправить">↑</button></form>';
  }

  function docsTab(lead) {
    const docs = lead.documents.map((doc, index) => '<button class="action-row" data-action="download-doc" data-index="' + index + '"><span class="file-icon">PDF</span><span><strong>' + esc(doc) + '</strong><small>Готов к скачиванию</small></span><b>↓</b></button>').join("");
    return '<section class="block"><div class="block-title"><h3>ДОКУМЕНТЫ</h3><button data-action="generate-doc">+ Создать</button></div>' + (docs || '<div class="empty compact-empty"><p>Документов пока нет.</p></div>') + '<button class="secondary wide" data-action="reconcile">Сверить договор и бронирование</button></section>';
  }

  function tasksTab(lead) {
    return '<section class="block"><div class="block-title"><h3>ЗАДАЧИ</h3><button data-action="add-task">+ Добавить</button></div>' + (lead.tasks.map((task, index) => '<button class="task-row ' + (task.done ? "done" : "") + '" data-action="toggle-task" data-index="' + index + '"><span class="task-check">' + (task.done ? "✓" : "") + '</span><span><strong>' + esc(task.text) + '</strong><small>' + esc(task.date) + "</small></span></button>").join("") || '<div class="empty compact-empty"><p>Нет активных задач.</p></div>') + "</section>";
  }

  function leadDetail(lead) {
    const tabs = [["overview", "Детали"], ["tourists", "Туристы"], ["chat", "Чат"], ["docs", "Документы"], ["tasks", "Задачи"]];
    let body = leadOverview(lead);
    if (state.detailTab === "tourists") body = touristsTab(lead);
    if (state.detailTab === "chat") body = chatTab(lead);
    if (state.detailTab === "docs") body = docsTab(lead);
    if (state.detailTab === "tasks") body = tasksTab(lead);
    return chrome('<section class="sheet">' + detailHeader(lead) + '<div class="stage-row status-row">' + stageOrder.map(stage => '<button class="stage ' + stages[stage][1] + " " + (lead.stage === stage ? "active" : "") + '" data-stage="' + stage + '">' + stages[stage][0] + "</button>").join("") + '</div><div class="detail-tabs">' + tabs.map(([id, label]) => '<button class="' + (state.detailTab === id ? "active" : "") + '" data-detail-tab="' + id + '">' + label + "</button>").join("") + '</div><div class="sheet-scroll detail-scroll">' + body + "</div></section>", { nav: false });
  }

  function optionList(values, selected) {
    return values.map(value => '<option ' + (value === selected ? "selected" : "") + '>' + esc(value) + "</option>").join("");
  }

  function leadForm(lead) {
    const editing = Boolean(lead);
    const item = lead || { firstName: "", lastName: "", middleName: "", phone: "", email: "", telegram: "", source: "Сайт", category: "Индивидуальный", manager: "Елена Воронова", tour: "Гранд-тур по Китаю", routeCities: ["Пекин", "Сиань", "Шанхай", "Пекин (2)"], color: "#2f6bd8", finance: { currency: "USD", total: "", advance: "" }, accommodation: { hotel: "", room: "" }, note: "" };
    return chrome('<section class="sheet"><form id="lead-form" class="sheet" data-editing="' + (editing ? lead.id : "") + '">' +
      '<div class="sheet-head"><button type="button" class="back-btn" data-action="' + (editing ? "back-detail" : "back-list") + '" aria-label="Закрыть">×</button><div class="sheet-title"><h2>' + (editing ? "Изменить лид" : "Новый лид") + '</h2><p>Поля веб-карточки в мобильной форме</p></div></div><div class="sheet-scroll form-scroll">' +
      '<section class="block"><h3>КОНТАКТ</h3><div class="two">' + field("Фамилия *", "lastName", item.lastName, true) + field("Имя *", "firstName", item.firstName, true) + '</div>' + field("Отчество", "middleName", item.middleName) + '<div class="two">' + field("Телефон *", "phone", item.phone, true, "tel") + field("Email", "email", item.email, false, "email") + '</div>' + field("Telegram", "telegram", item.telegram, false, "text", "@username") + "</section>" +
      '<section class="block"><h3>ЗАЯВКА</h3><div class="two"><label class="field"><span>Источник</span><select name="source">' + optionList(["Сайт", "Рекомендация", "Telegram", "Повторный клиент"], item.source) + '</select></label><label class="field"><span>Категория</span><select name="category">' + optionList(["Индивидуальный", "Пара", "Семья", "VIP"], item.category) + '</select></label></div><label class="field"><span>Тур</span><select name="tour">' + optionList(["Гранд-тур по Китаю", "Япония: сакура", "Не выбран"], item.tour) + '</select></label><label class="field"><span>Менеджер</span><select name="manager">' + optionList(["Елена Воронова", "Игорь Лебедев"], item.manager) + '</select></label><label class="field"><span>Города маршрута</span><input name="routeCities" value="' + esc(item.routeCities.join(", ")) + '"></label><div class="two">' + field("Цвет", "color", item.color, false, "color") + field("Валюта", "currency", item.finance.currency) + "</div></section>" +
      '<section class="block"><h3>ФИНАНСЫ И РАЗМЕЩЕНИЕ</h3><div class="two">' + field("Стоимость", "total", item.finance.total) + field("Аванс", "advance", item.finance.advance) + '</div><div class="two">' + field("Отель", "hotel", item.accommodation.hotel) + field("Номер", "room", item.accommodation.room) + "</div></section>" +
      '<section class="block"><h3>ПРИМЕЧАНИЕ</h3><label class="field"><textarea name="note" placeholder="Пожелания клиента">' + esc(item.note) + "</textarea></label></section>" +
      (!editing ? '<section class="block"><h3>ТУРИСТЫ</h3><p class="helper top-helper">Основной турист создаётся из контакта. Добавьте попутчиков сразу или позже.</p><div class="two">' + field("Фамилия попутчика", "companionLast1", "") + field("Имя попутчика", "companionFirst1", "") + '</div><div class="two">' + field("Фамилия попутчика", "companionLast2", "") + field("Имя попутчика", "companionFirst2", "") + '</div></section>' : "") +
      '</div><div class="sheet-actions"><button type="button" class="secondary" data-action="' + (editing ? "back-detail" : "back-list") + '">Отмена</button><button class="primary" type="submit">Сохранить</button></div></form></section>', { nav: false });
  }

  function field(label, name, value, required = false, type = "text", placeholder = "") {
    return '<label class="field"><span>' + esc(label) + '</span><input name="' + name + '" type="' + type + '" value="' + esc(value || "") + '" placeholder="' + esc(placeholder) + '" ' + (required ? "required" : "") + "></label>";
  }

  function touristForm(lead, tourist) {
    const base = tourist || { lastName: lead.lastName, firstName: "", middleName: "", birthDate: "", citizenship: "Россия", type: "adult", phone: "", domesticPassport: "", foreignPassport: "", address: "", primary: false, note: "", scans: 0 };
    const item = { ...base, ...(state.ocrDraft || {}) };
    return chrome('<section class="sheet"><form id="tourist-form" class="sheet" data-tourist="' + (tourist?.id || "") + '"><div class="sheet-head"><button type="button" class="back-btn" data-action="back-detail" aria-label="Закрыть">×</button><div class="sheet-title"><h2>' + (tourist ? "Карточка туриста" : "Новый турист") + '</h2><p>' + esc(lead.code + " · " + fullName(lead)) + '</p></div></div><div class="sheet-scroll form-scroll">' +
      '<section class="block"><h3>ЛИЧНЫЕ ДАННЫЕ</h3><div class="two">' + field("Фамилия *", "lastName", item.lastName, true) + field("Имя *", "firstName", item.firstName, true) + '</div>' + field("Отчество", "middleName", item.middleName) + '<div class="two">' + field("Дата рождения", "birthDate", item.birthDate, false, "date") + '<label class="field"><span>Тип</span><select name="type">' + optionList(["adult", "child", "infant"], item.type) + '</select></label></div>' + field("Гражданство", "citizenship", item.citizenship) + field("Телефон", "phone", item.phone, false, "tel") + "</section>" +
      '<section class="block"><div class="block-title"><h3>ПАСПОРТА И OCR</h3><button type="button" data-action="scan-passport">Сканировать</button></div>' + field("Внутренний паспорт", "domesticPassport", item.domesticPassport) + field("Загранпаспорт", "foreignPassport", item.foreignPassport) + '<div class="upload-card"><span>▣</span><div><strong>Сканы документов</strong><small>' + item.scans + ' файла · распознавание mock</small></div><button type="button" data-action="scan-passport">+ Добавить</button></div></section>' +
      '<section class="block"><h3>ДОПОЛНИТЕЛЬНО</h3>' + field("Адрес", "address", item.address) + '<label class="field"><span>Примечание</span><textarea name="note">' + esc(item.note) + '</textarea></label><label class="toggle-row"><input type="checkbox" name="primary" ' + (item.primary ? "checked" : "") + '><span><strong>Основной турист</strong><small>Контакт для документов и оплаты</small></span></label></section>' +
      '</div><div class="sheet-actions"><button type="button" class="secondary" data-action="back-detail">Отмена</button><button class="primary" type="submit">Сохранить</button></div></form></section>', { nav: false });
  }

  function filtersScreen() {
    return chrome('<section class="sheet"><form id="filters-form" class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="back-list">×</button><div class="sheet-title"><h2>Фильтры лидов</h2><p>Поля доступны в веб-версии</p></div><button type="button" class="text-action" data-action="reset-filters">Сбросить</button></div><div class="sheet-scroll form-scroll">' +
      '<section class="block"><h3>СТАТУСЫ</h3><div class="check-grid">' + stageOrder.map(stage => '<label class="check-card"><input type="checkbox" name="statuses" value="' + stage + '" ' + (state.filters.statuses.includes(stage) ? "checked" : "") + '><span>' + stages[stage][0] + "</span></label>").join("") + "</div></section>" +
      '<section class="block"><h3>ПАРАМЕТРЫ</h3>' + selectField("Источник", "source", ["all", ...unique("source")], state.filters.source) + selectField("Категория", "category", ["all", ...unique("category")], state.filters.category) + selectField("Тур", "tour", ["all", ...unique("tour")], state.filters.tour) + selectField("Результат потери", "outcome", ["all", "postponed", "failed"], state.filters.outcome) + selectField("Дата создания", "date", ["all", "today", "week", "month"], state.filters.date) + "</section>" +
      '<section class="block"><h3>СОСТОЯНИЕ</h3><label class="toggle-row"><input type="checkbox" name="archive" ' + (state.showArchive ? "checked" : "") + '><span><strong>Показывать архив</strong><small>Вместо активных лидов</small></span></label></section>' +
      '</div><div class="sheet-actions"><button type="button" class="secondary" data-action="back-list">Отмена</button><button class="primary blue" type="submit">Показать лиды</button></div></form></section>', { nav: false });
  }

  function selectField(label, name, values, selected) {
    const labels = { all: "Все", postponed: "Отложен", failed: "Не состоялся", today: "Сегодня", week: "Неделя", month: "Месяц" };
    return '<label class="field"><span>' + esc(label) + '</span><select name="' + name + '">' + values.map(value => '<option value="' + esc(value) + '" ' + (value === selected ? "selected" : "") + '>' + esc(labels[value] || value) + "</option>").join("") + "</select></label>";
  }

  function lostScreen(lead) {
    return chrome('<section class="sheet"><form id="lost-form" class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="back-detail">‹</button><div class="sheet-title"><h2>Результат потери</h2><p>' + esc(fullName(lead)) + '</p></div></div><div class="sheet-scroll form-scroll"><div class="notice warning"><strong>Статус «Потерян»</strong><span>Укажите, вернуться ли к заявке позже.</span></div><section class="block"><label class="radio-card"><input type="radio" name="outcome" value="postponed" checked><span><strong>Отложен</strong><small>Создать дату возврата к заявке</small></span></label><label class="radio-card"><input type="radio" name="outcome" value="failed"><span><strong>Не состоялся</strong><small>Закрыть без даты возврата</small></span></label>' + field("Вернуться", "outcomeDate", lead.outcomeDate || "2026-09-01", false, "date") + '<label class="field"><span>Причина *</span><textarea name="outcomeReason" required placeholder="Что произошло">' + esc(lead.outcomeReason || "") + '</textarea></label></section></div><div class="sheet-actions"><button type="button" class="secondary" data-action="back-detail">Отмена</button><button class="danger" type="submit">Сохранить потерю</button></div></form></section>', { nav: false });
  }

  function menuScreen(lead) {
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-detail">×</button><div class="sheet-title"><h2>Действия с лидом</h2><p>' + esc(lead.code) + '</p></div></div><div class="sheet-scroll"><section class="action-list"><button class="action-row" data-action="edit-lead"><span class="action-icon">✎</span><span><strong>Изменить лид</strong><small>Контакт, тур, финансы и маршрут</small></span><b>›</b></button><button class="action-row" data-action="merge-lead"><span class="action-icon">⇆</span><span><strong>Объединить лиды</strong><small>Перенести туристов и историю</small></span><b>›</b></button><button class="action-row" data-action="archive-lead"><span class="action-icon">□</span><span><strong>' + (lead.archived ? "Вернуть из архива" : "Архивировать") + '</strong><small>Данные останутся доступны</small></span><b>›</b></button><button class="action-row danger-row" data-action="delete-placeholder"><span class="action-icon">×</span><span><strong>Удалить лид</strong><small>Доступно только администратору</small></span><b>›</b></button></section></div></section>', { nav: false });
  }

  function mergeScreen(lead) {
    const candidates = leads.filter(item => item.id !== lead.id && !item.archived && item.eventId === lead.eventId);
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-detail">‹</button><div class="sheet-title"><h2>Объединить лиды</h2><p>Основным останется ' + esc(lead.code) + '</p></div></div><div class="sheet-scroll"><div class="notice"><strong>Что будет перенесено</strong><span>Туристы, сообщения, документы и задачи. Финансы сохраняются у основной заявки.</span></div><section class="block"><h3>ВЫБЕРИТЕ ВТОРОЙ ЛИД</h3>' + candidates.map(item => '<label class="merge-card"><input type="radio" name="mergeTarget" value="' + item.id + '" ' + (state.mergeTargetId === item.id ? "checked" : "") + '><span class="avatar">' + initials(item) + '</span><span class="lead-main"><strong>' + esc(fullName(item)) + '</strong><small>' + esc(item.code + " · " + item.tourists.length + " турист") + "</small></span></label>").join("") + '</section></div><div class="sheet-actions"><button class="secondary" data-action="back-detail">Отмена</button><button class="primary blue" data-action="apply-merge" ' + (state.mergeTargetId ? "" : "disabled") + '>Объединить</button></div></section>', { nav: false });
  }

  function duplicateScreen() {
    const matches = state.duplicateIds.map(id => leads.find(lead => lead.id === id)).filter(Boolean);
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="cancel-duplicate">‹</button><div class="sheet-title"><h2>Возможный дубль</h2><p>Совпали телефон или email</p></div></div><div class="sheet-scroll"><div class="notice warning"><strong>Проверьте существующие лиды</strong><span>Можно открыть карточку, объединить данные или создать отдельный лид.</span></div>' + matches.map(leadCard).join("") + '</div><div class="sheet-actions three-actions"><button class="secondary" data-action="cancel-duplicate">Назад</button><button class="secondary" data-action="open-duplicate" data-id="' + matches[0].id + '">Открыть</button><button class="primary" data-action="create-anyway">Создать отдельно</button></div></section>', { nav: false });
  }

  function render() {
    const lead = activeLead();
    if (state.screen === "detail" && lead) app.innerHTML = leadDetail(lead);
    else if (state.screen === "lead-form") app.innerHTML = leadForm(lead && state.activeLeadId ? lead : null);
    else if (state.screen === "tourist-form" && lead) app.innerHTML = touristForm(lead, lead.tourists.find(item => item.id === state.editingTouristId));
    else if (state.screen === "filters") app.innerHTML = filtersScreen();
    else if (state.screen === "lost" && lead) app.innerHTML = lostScreen(lead);
    else if (state.screen === "menu" && lead) app.innerHTML = menuScreen(lead);
    else if (state.screen === "merge" && lead) app.innerHTML = mergeScreen(lead);
    else if (state.screen === "duplicate") app.innerHTML = duplicateScreen();
    else app.innerHTML = leadList();
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
      category: values.category, manager: values.manager, color: values.color || "#2f6bd8", eventId: values.tour === "Не выбран" ? null : "china",
      tour: values.tour, destination: values.tour.includes("Кита") ? "Китай" : "Япония", cities: routeCities, routeCities,
      updated: "только что", created: "03.08.2026", archived: false,
      finance: { currency: values.currency || "USD", total: values.total || "0", advance: values.advance || "0", balance: values.total || "0" },
      accommodation: { hotel: values.hotel, room: values.room }, note: values.note,
      tourists: [{ id: "tourist-proto-" + sequence, lastName: values.lastName, firstName: values.firstName, middleName: values.middleName, birthDate: "", citizenship: "Россия", type: "adult", phone: values.phone, domesticPassport: "", foreignPassport: "", address: "", primary: true, note: "", scans: 0 }],
      messages: [], documents: [], tasks: [],
    };
    [1, 2].forEach(index => {
      if (values["companionLast" + index] && values["companionFirst" + index]) created.tourists.push({ id: "tourist-proto-" + sequence + "-" + index, lastName: values["companionLast" + index], firstName: values["companionFirst" + index], middleName: "", birthDate: "", citizenship: "Россия", type: "adult", phone: "", domesticPassport: "", foreignPassport: "", address: "", primary: false, note: "", scans: 0 });
    });
    return created;
  }

  function commitPendingLead() {
    leads.unshift(state.pendingLead);
    state.activeLeadId = state.pendingLead.id;
    state.pendingLead = null;
    state.duplicateIds = [];
    state.screen = "detail";
    state.detailTab = "overview";
    showToast("Лид создан");
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
        Object.assign(lead, { firstName: values.firstName, lastName: values.lastName, middleName: values.middleName, phone: values.phone, email: values.email, telegram: values.telegram, source: values.source, category: values.category, manager: values.manager, color: values.color, tour: values.tour, eventId: values.tour === "Не выбран" ? null : "china", routeCities: values.routeCities.split(",").map(item => item.trim()).filter(Boolean), finance: { currency: values.currency, total: values.total, advance: values.advance, balance: values.total }, accommodation: { hotel: values.hotel, room: values.room }, note: values.note, updated: "только что" });
        state.screen = "detail";
        showToast("Лид сохранён");
      } else {
        const pending = buildLead(values);
        const duplicateIds = leads.filter(lead => lead.phone.replace(/\D/g, "") === pending.phone.replace(/\D/g, "") || (pending.email && lead.email.toLowerCase() === pending.email.toLowerCase())).map(lead => lead.id);
        state.pendingLead = pending;
        state.duplicateIds = duplicateIds;
        if (duplicateIds.length) state.screen = "duplicate"; else commitPendingLead();
      }
    }
    if (form.id === "tourist-form") {
      const lead = activeLead();
      const values = formData(form);
      values.primary = new FormData(form).has("primary");
      const tourist = lead.tourists.find(item => item.id === form.dataset.tourist);
      if (values.primary) lead.tourists.forEach(item => { item.primary = false; });
      if (tourist) Object.assign(tourist, values, { scans: tourist.scans });
      else lead.tourists.push({ id: "tourist-proto-" + Date.now(), ...values, scans: 0 });
      state.screen = "detail";
      state.detailTab = "tourists";
      state.ocrDraft = null;
      showToast(tourist ? "Турист сохранён" : "Турист добавлен");
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
      Object.assign(lead, { stage: "lost", outcome: values.outcome, outcomeDate: values.outcome === "postponed" ? values.outcomeDate : "", outcomeReason: values.outcomeReason, updated: "только что" });
      state.screen = "detail";
      showToast("Результат потери сохранён");
    }
    if (form.id === "chat-form") {
      const message = formData(form).message.trim();
      if (message) activeLead().messages.push({ author: "Елена", text: message, time: "сейчас", own: true });
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
      state.editingTouristId = target.dataset.editTourist;
      state.ocrDraft = null;
      state.screen = "tourist-form";
      render();
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
      if (target.dataset.stage === "lost") state.screen = "lost";
      else { activeLead().stage = target.dataset.stage; activeLead().updated = "только что"; showToast("Статус изменён: " + stages[target.dataset.stage][0]); }
      render();
      return;
    }
    const action = target.dataset.action;
    if (action === "new-lead") { state.activeLeadId = null; state.screen = "lead-form"; }
    if (action === "edit-lead") state.screen = "lead-form";
    if (action === "back-list") { state.screen = "list"; state.activeLeadId = null; state.editingTouristId = null; }
    if (action === "back-detail") state.screen = "detail";
    if (action === "filters") state.screen = "filters";
    if (action === "toggle-archive") state.showArchive = !state.showArchive;
    if (action === "add-tourist") { state.editingTouristId = null; state.ocrDraft = null; state.screen = "tourist-form"; }
    if (action === "lead-menu") state.screen = "menu";
    if (action === "merge-lead") { state.mergeTargetId = null; state.screen = "merge"; }
    if (action === "archive-lead") { activeLead().archived = !activeLead().archived; showToast(activeLead().archived ? "Лид перемещён в архив" : "Лид восстановлен"); state.screen = "detail"; }
    if (action === "reset-filters") { state.filters = { statuses: [], source: "all", category: "all", tour: "all", outcome: "all", date: "all" }; state.showArchive = false; render(); return; }
    if (action === "apply-merge" && state.mergeTargetId) {
      const main = activeLead();
      const secondary = leads.find(lead => lead.id === state.mergeTargetId);
      main.tourists.push(...secondary.tourists.map(tourist => ({ ...tourist, id: tourist.id + "-merged" })));
      main.messages.push(...secondary.messages);
      main.documents.push(...secondary.documents);
      main.tasks.push(...secondary.tasks);
      secondary.archived = true;
      secondary.note = "Объединён с " + main.code;
      state.mergeTargetId = null;
      state.screen = "detail";
      state.detailTab = "tourists";
      showToast("Лиды объединены, второй лид помещён в архив");
      return;
    }
    if (action === "cancel-duplicate") { state.pendingLead = null; state.duplicateIds = []; state.screen = "lead-form"; }
    if (action === "create-anyway") { commitPendingLead(); return; }
    if (action === "open-duplicate") { state.pendingLead = null; state.duplicateIds = []; state.activeLeadId = target.dataset.id; state.screen = "detail"; }
    if (action === "scan-passport") {
      state.ocrDraft = { foreignPassport: "72 4567890", citizenship: "Россия", birthDate: "1990-05-14", scans: 1 };
      showToast("Паспорт распознан. Проверьте поля");
      return;
    }
    if (action === "download-doc") showToast("Документ подготовлен к скачиванию");
    if (action === "generate-doc") { activeLead().documents.push("Новый договор " + activeLead().code + ".pdf"); showToast("Договор создан"); return; }
    if (action === "reconcile") showToast("Сверка: расхождений не найдено");
    if (action === "add-task") { activeLead().tasks.push({ text: "Новая задача по лиду", date: "Сегодня", done: false }); showToast("Задача добавлена"); return; }
    if (action === "toggle-task") { const task = activeLead().tasks[Number(target.dataset.index)]; task.done = !task.done; }
    if (action === "delete-placeholder") { showToast("Удаление доступно только администратору"); return; }
    if (action === "nav-placeholder") { if (target.dataset.nav === "leads") return; showToast("Раздел уже есть в текущей мобильной версии"); return; }
    render();
  });

  render();
})();
