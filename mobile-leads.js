(() => {
  "use strict";

  const app = document.querySelector("#app");
  const stages = {
    new: ["Новый", "new"],
    work: ["В работе", "work"],
    confirmed: ["Подтверждён", "confirmed"],
    postponed: ["Отложен", "postponed"],
    lost: ["Потерян", "lost"],
  };
  const typeLabels = { arrival: "Рейс", hotel: "Отель", departure: "Отъезд" };
  const icons = {
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6"/><path d="M16 13h4"/></svg>',
    leads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
  };

  let state = {
    screen: "list",
    activeLeadId: null,
    editingTouristId: null,
    query: "",
    toast: "",
    logistics: { type: "arrival", cityIdx: 0, scope: "lead", selected: [], conflict: null },
    leads: [
      {
        id: "lead-1", firstName: "Анна", lastName: "Соколова", phone: "+7 916 441-22-18", email: "anna@example.ru",
        stage: "confirmed", source: "Рекомендация", eventId: "china", tour: "Гранд-тур по Китаю", destination: "Пекин", cities: ["Пекин", "Сиань", "Шанхай"], updated: "сегодня, 09:12",
        tourists: [
          { id: "t1", firstName: "Анна", lastName: "Соколова", phone: "+7 916 441-22-18", logistics: { arrival: { date: "2026-09-14", time: "07:25", transport: "Самолёт", number: "CZ342", point: "Дасин", transfer: "Групповой" }, hotel: { name: "Beijing Palace", room: "Double" }, departure: {} }, groups: {} },
          { id: "t2", firstName: "Илья", lastName: "Соколов", phone: "+7 916 441-22-19", logistics: { arrival: { date: "2026-09-14", time: "07:25", transport: "Самолёт", number: "CZ342", point: "Дасин", transfer: "Групповой" }, hotel: { name: "Beijing Palace", room: "Double" }, departure: {} }, groups: {} },
        ],
      },
      {
        id: "lead-2", firstName: "Марина", lastName: "Орлова", phone: "+7 903 118-04-90", email: "orlova@example.ru",
        stage: "confirmed", source: "Сайт", eventId: "china", tour: "Гранд-тур по Китаю", destination: "Пекин", cities: ["Пекин", "Сиань", "Шанхай"], updated: "вчера, 18:40",
        tourists: [
          { id: "t3", firstName: "Марина", lastName: "Орлова", phone: "+7 903 118-04-90", logistics: { arrival: { date: "2026-09-14", time: "10:10", transport: "Самолёт", number: "SU204", point: "Шоуду", transfer: "Индивидуальный" }, hotel: { name: "Beijing Garden", room: "Single" }, departure: {} }, groups: {} },
        ],
      },
      {
        id: "lead-3", firstName: "Денис", lastName: "Волков", phone: "+7 985 710-33-20", email: "volkov@example.ru",
        stage: "work", source: "Telegram", eventId: "china", tour: "Гранд-тур по Китаю", destination: "Пекин", cities: ["Пекин", "Сиань", "Шанхай"], updated: "сегодня, 08:34",
        tourists: [{ id: "t4", firstName: "Денис", lastName: "Волков", phone: "+7 985 710-33-20", logistics: { arrival: {}, hotel: {}, departure: {} }, groups: {} }],
      },
    ],
  };
  let nextMockGroupId = 1;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  const initials = (person) => ((person.firstName?.[0] || "") + (person.lastName?.[0] || "")).toUpperCase();
  const activeLead = () => state.leads.find(lead => lead.id === state.activeLeadId);
  const fieldValue = (form, name) => String(new FormData(form).get(name) || "").trim();
  const showToast = (text) => { state.toast = text; render(); window.setTimeout(() => { state.toast = ""; render(); }, 2200); };
  const allConfirmedTourists = (lead) => state.leads.filter(item => item.eventId === lead.eventId && item.stage === "confirmed").flatMap(item => item.tourists.map(tourist => ({ lead: item, tourist })));
  const scopedTourists = (lead) => state.logistics.scope === "tour" ? allConfirmedTourists(lead) : lead.tourists.map(tourist => ({ lead, tourist }));
  const selectedTourists = (lead) => scopedTourists(lead).filter(item => state.logistics.selected.includes(item.tourist.id));
  const valuesOf = (tourist, type) => tourist.logistics[type] || {};
  const summarize = (values, type) => {
    if (type === "hotel") return [values.name, values.room].filter(Boolean).join(" · ") || "Не заполнено";
    return [values.date, values.time, values.number, values.point].filter(Boolean).join(" · ") || "Не заполнено";
  };
  const renderStatus = (stage) => '<span class="badge ' + stages[stage][1] + '">' + stages[stage][0] + "</span>";

  function chrome(content, options = {}) {
    return '<div class="status-bar"><span>9:41</span><span>▰</span></div>' +
      '<div class="app-top"><div class="top-row"><span class="user-label">Алексей · менеджер</span><span class="role-badge">Менеджер</span></div>' +
      (options.header || "") + "</div>" + content +
      (options.nav === false ? "" : '<nav class="bottom-nav"><button class="nav-item">' + icons.list + '<span>Задачи</span></button><button class="nav-item">' + icons.people + '<span>Туристы</span></button><button class="nav-item">' + icons.wallet + '<span>Финансы</span></button><button class="nav-item active">' + icons.leads + '<span>Лиды</span></button></nav>') +
      (state.toast ? '<div class="toast" role="status">' + esc(state.toast) + "</div>" : "");
  }

  function leadList() {
    const visible = state.leads.filter(lead => (lead.firstName + " " + lead.lastName + " " + lead.phone).toLowerCase().includes(state.query.toLowerCase()));
    const cards = visible.map(lead => '<button class="lead-card" data-open-lead="' + lead.id + '"><div class="card-row"><span class="avatar">' + initials(lead) + '</span><span class="lead-main"><span class="lead-name">' + esc(lead.lastName + " " + lead.firstName) + '</span><span class="lead-meta">' + esc(lead.tour) + " · " + lead.tourists.length + ' чел.</span></span>' + renderStatus(lead.stage) + '</div><div class="card-bottom"><span>' + esc(lead.source) + '</span><span>' + esc(lead.updated) + "</span></div></button>").join("");
    return chrome('<div class="scroll">' + (cards || '<div class="empty"><h3>Лиды не найдены</h3><p>Измените запрос или создайте новую заявку.</p></div>') + '</div><button class="fab" data-action="new-lead">+ Создать лид</button>', {
      header: '<div class="section-head"><h2>Лиды</h2><small>' + state.leads.length + " лидов</small></div>" +
        '<div class="toolbar"><input class="search" id="lead-search" value="' + esc(state.query) + '" placeholder="Поиск по лидам" aria-label="Поиск по лидам"><button class="icon-btn" data-action="clear-search" aria-label="Очистить поиск">×</button></div>' +
        '<div class="sync">Mock-данные · production API отключён</div>',
    });
  }

  function leadDetail(lead) {
    const people = lead.tourists.map(tourist => '<div class="person-card"><span class="avatar">' + initials(tourist) + '</span><span class="lead-main"><span class="lead-name">' + esc(tourist.lastName + " " + tourist.firstName) + '</span><span class="lead-meta">' + esc(tourist.phone || "Нет телефона") + '</span></span><button class="secondary" data-edit-tourist="' + tourist.id + '">Изменить</button></div>').join("");
    const stageButtons = Object.entries(stages).map(([key, meta]) => '<button class="stage ' + (lead.stage === key ? "active" : "") + '" data-stage="' + key + '" style="color:' + (key === "confirmed" ? "var(--green)" : key === "lost" ? "var(--red)" : "var(--blue)") + ";background:" + (lead.stage === key ? (key === "confirmed" ? "var(--green)" : key === "lost" ? "var(--red)" : "var(--blue)") : "var(--blue-soft)") + '">' + meta[0] + "</button>").join("");
    const logistics = lead.stage === "confirmed"
      ? '<button class="primary blue wide" data-action="open-logistics">Открыть логистику</button>'
      : '<div class="lock">Логистика появится после подтверждения лида. Выберите статус «Подтверждён».</div>';
    return chrome('<section class="sheet"><div class="sheet-head"><button class="back-btn" data-action="back-list" aria-label="Назад">‹</button><span class="avatar dark">' + initials(lead) + '</span><div class="sheet-title"><h2>' + esc(lead.lastName + " " + lead.firstName) + '</h2><p>' + esc(lead.tour) + '</p></div></div><div class="sheet-scroll">' +
      '<div class="block"><h3>СТАТУС</h3><div class="stage-row">' + stageButtons + "</div></div>" +
      '<div class="block"><h3>ЗАЯВКА</h3><div class="info-grid"><div class="info"><span>Тур</span><strong>' + esc(lead.tour) + '</strong></div><div class="info"><span>Направление</span><strong>' + esc(lead.destination) + '</strong></div><div class="info"><span>Телефон</span><strong>' + esc(lead.phone) + '</strong></div><div class="info"><span>Email</span><strong>' + esc(lead.email) + '</strong></div></div><button class="secondary wide" data-action="edit-lead" style="margin-top:12px">Изменить лид</button></div>' +
      '<div class="block"><h3>ТУРИСТЫ · ' + lead.tourists.length + '</h3>' + people + '<button class="secondary wide" data-action="add-tourist">+ Добавить туриста</button></div>' +
      '<div class="block"><h3>ЛОГИСТИКА</h3>' + logistics + "</div></div></section>", { nav: false });
  }

  function leadForm(lead) {
    const editing = Boolean(lead);
    return chrome('<section class="sheet"><form id="lead-form" class="sheet" data-editing="' + (editing ? lead.id : "") + '"><div class="sheet-head"><button type="button" class="back-btn" data-action="' + (editing ? "back-detail" : "back-list") + '" aria-label="Закрыть">×</button><div class="sheet-title"><h2>' + (editing ? "Изменить лид" : "Новый лид") + '</h2><p>Контакт и параметры заявки</p></div></div><div class="sheet-scroll"><div id="form-error"></div>' +
      '<div class="two"><div class="field"><label for="lastName">Фамилия *</label><input id="lastName" name="lastName" required value="' + esc(lead?.lastName || "") + '"></div><div class="field"><label for="firstName">Имя *</label><input id="firstName" name="firstName" required value="' + esc(lead?.firstName || "") + '"></div></div>' +
      '<div class="field"><label for="phone">Телефон *</label><input id="phone" name="phone" type="tel" required value="' + esc(lead?.phone || "") + '"></div>' +
      '<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" value="' + esc(lead?.email || "") + '"></div>' +
      '<div class="field"><label for="tour">Тур</label><select id="tour" name="tour"><option>Гранд-тур по Китаю</option><option>Япония: Токио и Киото</option></select></div>' +
      '<div class="field"><label for="source">Источник</label><select id="source" name="source"><option>Сайт</option><option>Рекомендация</option><option>Telegram</option><option>Звонок</option></select></div>' +
      (!editing ? '<div class="block"><h3>ДОПОЛНИТЕЛЬНЫЕ ТУРИСТЫ</h3><div id="draft-tourists"></div><button type="button" class="secondary wide" data-action="add-draft-tourist">+ Добавить туриста</button></div>' : "") +
      '</div><div class="sheet-actions"><button type="button" class="secondary" data-action="' + (editing ? "back-detail" : "back-list") + '">Отмена</button><button class="primary" type="submit">Сохранить</button></div></form></section>', { nav: false });
  }

  function touristForm(lead, tourist) {
    return chrome('<section class="sheet"><form id="tourist-form" class="sheet" data-tourist="' + (tourist?.id || "") + '"><div class="sheet-head"><button type="button" class="back-btn" data-action="back-detail" aria-label="Закрыть">×</button><div class="sheet-title"><h2>' + (tourist ? "Изменить туриста" : "Новый турист") + '</h2><p>' + esc(lead.lastName + " " + lead.firstName) + '</p></div></div><div class="sheet-scroll"><div id="form-error"></div><div class="two"><div class="field"><label for="tLast">Фамилия *</label><input id="tLast" name="lastName" required value="' + esc(tourist?.lastName || lead.lastName) + '"></div><div class="field"><label for="tFirst">Имя *</label><input id="tFirst" name="firstName" required value="' + esc(tourist?.firstName || "") + '"></div></div><div class="field"><label for="tPhone">Телефон</label><input id="tPhone" name="phone" type="tel" value="' + esc(tourist?.phone || "") + '"></div></div><div class="sheet-actions"><button type="button" class="secondary" data-action="back-detail">Отмена</button><button class="primary" type="submit">Сохранить</button></div></form></section>', { nav: false });
  }

  function logistics(lead) {
    const log = state.logistics;
    const pool = scopedTourists(lead);
    const selected = selectedTourists(lead);
    const rows = pool.map(({ lead: owner, tourist }) => '<label class="select-row"><input type="checkbox" data-select-tourist="' + tourist.id + '" ' + (log.selected.includes(tourist.id) ? "checked" : "") + '><span class="avatar">' + initials(tourist) + '</span><span class="lead-main"><span class="lead-name">' + esc(tourist.lastName + " " + tourist.firstName) + '</span><span class="lead-meta">' + (log.scope === "tour" ? esc(owner.lastName + " · ") : "") + esc(summarize(valuesOf(tourist, log.type), log.type)) + '</span></span>' + (tourist.groups[log.type] ? '<span class="badge group">Группа</span>' : "") + "</label>").join("");
    const cityButtons = lead.cities.map((city, index) => '<button class="city-chip ' + (log.cityIdx === index ? "active" : "") + '" data-city="' + index + '">' + esc(city) + "</button>").join("");
    const fields = log.type === "hotel"
      ? '<div class="field"><label for="hotel-name">Отель</label><input id="hotel-name" name="name" placeholder="Название отеля"></div><div class="field"><label for="room">Тип номера</label><select id="room" name="room"><option value="">Не выбран</option><option>Single</option><option>Double</option><option>Twin</option></select></div>'
      : '<div class="two"><div class="field"><label for="date">Дата</label><input id="date" name="date" type="date"></div><div class="field"><label for="time">Время</label><input id="time" name="time" type="time"></div></div><div class="field"><label for="transport">Транспорт</label><select id="transport" name="transport"><option>Самолёт</option><option>Поезд</option><option>Автобус</option></select></div><div class="field"><label for="number">Рейс или поезд</label><input id="number" name="number" placeholder="CZ342"></div><div class="field"><label for="point">Аэропорт или вокзал</label><input id="point" name="point"></div><div class="field"><label for="transfer">Трансфер</label><select id="transfer" name="transfer"><option>Групповой</option><option>Индивидуальный</option><option>Самостоятельно</option></select></div>';
    return chrome('<section class="sheet"><form id="logistics-form" class="sheet"><div class="sheet-head"><button type="button" class="back-btn" data-action="back-detail" aria-label="Назад">‹</button><div class="sheet-title"><h2>Логистика</h2><p>' + esc(lead.tour) + '</p></div></div><div class="sheet-scroll"><div class="chip-row" style="margin-bottom:11px">' + cityButtons + '</div><div class="segment three">' + Object.entries(typeLabels).map(([key, label]) => '<button type="button" class="' + (log.type === key ? "active" : "") + '" data-log-type="' + key + '">' + label + "</button>").join("") + '</div><div class="segment"><button type="button" class="' + (log.scope === "lead" ? "active" : "") + '" data-scope="lead">Этот лид</button><button type="button" class="' + (log.scope === "tour" ? "active" : "") + '" data-scope="tour">Весь тур</button></div><div class="block"><h3>ТУРИСТЫ · ВЫБРАНО ' + selected.length + '</h3>' + rows + '</div><div class="block"><h3>' + typeLabels[log.type].toUpperCase() + '</h3>' + fields + '</div><button type="button" class="secondary wide" data-action="ungroup" ' + (selected.length ? "" : "disabled") + '>Разъединить выбранных</button></div><div class="sheet-actions"><button type="button" class="secondary" data-action="back-detail">Назад</button><button class="primary blue" type="submit">Проверить и применить</button></div></form></section>', { nav: false }) + (log.conflict ? conflictSheet(lead) : "");
  }

  function conflictSheet(lead) {
    const selected = selectedTourists(lead);
    const options = selected.map(({ tourist }) => '<label><input type="radio" name="source" value="' + tourist.id + '" ' + (state.logistics.conflict.source === tourist.id ? "checked" : "") + '><span><strong>' + esc(tourist.lastName + " " + tourist.firstName) + '</strong><br>' + esc(summarize(valuesOf(tourist, state.logistics.type), state.logistics.type)) + "</span></label>").join("");
    return '<section class="sheet" style="z-index:30"><div class="sheet-head"><button class="back-btn" data-action="close-conflict" aria-label="Назад">‹</button><div class="sheet-title"><h2>Сверка данных</h2><p>У туристов разные значения</p></div></div><div class="sheet-scroll"><div class="conflict"><strong>Выберите основную запись</strong>' + options + '</div><div class="lock">Новые значения из формы имеют приоритет. Пустые поля будут взяты из выбранной записи.</div></div><div class="sheet-actions"><button class="secondary" data-action="close-conflict">Отмена</button><button class="primary" data-action="apply-conflict">Объединить</button></div></section>';
  }

  function render() {
    const lead = activeLead();
    if (state.screen === "detail" && lead) app.innerHTML = leadDetail(lead);
    else if (state.screen === "lead-form") app.innerHTML = leadForm(lead && state.activeLeadId ? lead : null);
    else if (state.screen === "tourist-form" && lead) app.innerHTML = touristForm(lead, lead.tourists.find(item => item.id === state.editingTouristId));
    else if (state.screen === "logistics" && lead) app.innerHTML = logistics(lead);
    else app.innerHTML = leadList();
  }

  function applyLogistics(form, sourceId) {
    const lead = activeLead();
    const type = state.logistics.type;
    const selected = selectedTourists(lead);
    const source = selected.find(item => item.tourist.id === sourceId)?.tourist;
    const base = source ? { ...valuesOf(source, type) } : {};
    const data = Object.fromEntries(new FormData(form).entries());
    Object.entries(data).forEach(([key, value]) => { if (String(value).trim()) base[key] = String(value).trim(); });
    const existingGroups = [...new Set(selected.map(({ tourist }) => tourist.groups[type]).filter(Boolean))];
    const groupId = existingGroups.length === 1 && selected.every(({ tourist }) => tourist.groups[type] === existingGroups[0])
      ? existingGroups[0]
      : "mock-" + type + "-" + state.logistics.cityIdx + "-" + nextMockGroupId++;
    selected.forEach(({ tourist }) => {
      tourist.logistics[type] = { ...base };
      tourist.groups[type] = groupId;
    });
    state.logistics.conflict = null;
    state.logistics.selected = [];
    showToast(typeLabels[type] + ": данные применены к " + selected.length + " туристам");
  }

  app.addEventListener("input", event => {
    if (event.target.id === "lead-search") {
      state.query = event.target.value;
      render();
      document.querySelector("#lead-search")?.focus();
    }
  });

  app.addEventListener("change", event => {
    const id = event.target.dataset.selectTourist;
    if (id) {
      state.logistics.selected = event.target.checked ? [...new Set([...state.logistics.selected, id])] : state.logistics.selected.filter(item => item !== id);
      render();
    }
    if (event.target.name === "source" && state.logistics.conflict) state.logistics.conflict.source = event.target.value;
  });

  app.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.target;
    if (form.id === "lead-form") {
      const lastName = fieldValue(form, "lastName");
      const firstName = fieldValue(form, "firstName");
      const phone = fieldValue(form, "phone");
      if (!lastName || !firstName || !phone) return;
      const editingId = form.dataset.editing;
      if (editingId) {
        const lead = state.leads.find(item => item.id === editingId);
        Object.assign(lead, { lastName, firstName, phone, email: fieldValue(form, "email"), tour: fieldValue(form, "tour"), source: fieldValue(form, "source"), updated: "только что" });
        state.screen = "detail";
        showToast("Лид сохранён");
      } else {
        const id = "lead-" + Date.now();
        const lead = { id, lastName, firstName, phone, email: fieldValue(form, "email"), tour: fieldValue(form, "tour"), source: fieldValue(form, "source"), stage: "new", eventId: "china", destination: "Пекин", cities: ["Пекин", "Сиань", "Шанхай"], updated: "только что", tourists: [{ id: "t-" + Date.now(), lastName, firstName, phone, logistics: { arrival: {}, hotel: {}, departure: {} }, groups: {} }] };
        document.querySelectorAll("[data-draft-row]").forEach((row, index) => {
          const draftFirst = row.querySelector('[name="draftFirst"]')?.value.trim();
          const draftLast = row.querySelector('[name="draftLast"]')?.value.trim();
          if (draftFirst && draftLast) lead.tourists.push({ id: "t-" + Date.now() + "-" + index, firstName: draftFirst, lastName: draftLast, phone: "", logistics: { arrival: {}, hotel: {}, departure: {} }, groups: {} });
        });
        state.leads.unshift(lead);
        state.activeLeadId = id;
        state.screen = "detail";
        showToast("Лид создан");
      }
    }
    if (form.id === "tourist-form") {
      const lead = activeLead();
      const current = lead.tourists.find(item => item.id === form.dataset.tourist);
      const values = { lastName: fieldValue(form, "lastName"), firstName: fieldValue(form, "firstName"), phone: fieldValue(form, "phone") };
      if (current) Object.assign(current, values);
      else lead.tourists.push({ id: "t-" + Date.now(), ...values, logistics: { arrival: {}, hotel: {}, departure: {} }, groups: {} });
      state.screen = "detail";
      state.editingTouristId = null;
      showToast(current ? "Турист сохранён" : "Турист добавлен");
    }
    if (form.id === "logistics-form") {
      const selected = selectedTourists(activeLead());
      if (!selected.length) return showToast("Выберите хотя бы одного туриста");
      const signatures = new Set(selected.map(item => JSON.stringify(valuesOf(item.tourist, state.logistics.type))));
      if (signatures.size > 1) {
        state.logistics.conflict = { source: selected[0].tourist.id };
        render();
      } else {
        applyLogistics(form, selected[0].tourist.id);
      }
    }
  });

  app.addEventListener("click", event => {
    const target = event.target.closest("[data-action],[data-open-lead],[data-edit-tourist],[data-stage],[data-log-type],[data-scope],[data-city]");
    if (!target) return;
    if (target.dataset.openLead) { state.activeLeadId = target.dataset.openLead; state.screen = "detail"; }
    if (target.dataset.editTourist) { state.editingTouristId = target.dataset.editTourist; state.screen = "tourist-form"; }
    if (target.dataset.stage) { activeLead().stage = target.dataset.stage; showToast("Статус изменён"); }
    if (target.dataset.logType) { state.logistics.type = target.dataset.logType; state.logistics.selected = []; }
    if (target.dataset.scope) { state.logistics.scope = target.dataset.scope; state.logistics.selected = []; }
    if (target.dataset.city) { state.logistics.cityIdx = Number(target.dataset.city); state.logistics.selected = []; }
    const action = target.dataset.action;
    if (action === "new-lead") { state.activeLeadId = null; state.screen = "lead-form"; }
    if (action === "edit-lead") state.screen = "lead-form";
    if (action === "back-list") { state.screen = "list"; state.activeLeadId = null; }
    if (action === "back-detail") state.screen = "detail";
    if (action === "add-tourist") { state.editingTouristId = null; state.screen = "tourist-form"; }
    if (action === "open-logistics") { state.screen = "logistics"; state.logistics.selected = []; }
    if (action === "clear-search") state.query = "";
    if (action === "add-draft-tourist") {
      const holder = document.querySelector("#draft-tourists");
      const row = document.createElement("div");
      row.dataset.draftRow = "true";
      row.className = "two";
      row.innerHTML = '<div class="field"><label>Фамилия</label><input name="draftLast"></div><div class="field"><label>Имя</label><input name="draftFirst"></div>';
      holder.appendChild(row);
      return;
    }
    if (action === "close-conflict") state.logistics.conflict = null;
    if (action === "apply-conflict") {
      const form = document.querySelector("#logistics-form");
      const source = document.querySelector('input[name="source"]:checked')?.value;
      if (form && source) applyLogistics(form, source);
      return;
    }
    if (action === "ungroup") {
      const selected = selectedTourists(activeLead());
      selected.forEach(({ tourist }) => { tourist.groups[state.logistics.type] = null; });
      state.logistics.selected = [];
      showToast("Туристы разъединены, значения сохранены");
      return;
    }
    render();
  });

  render();
})();
