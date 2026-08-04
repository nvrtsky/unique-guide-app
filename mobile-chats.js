(function () {
  'use strict';

  var currentUser = { id: 'user-manager-elena', name: 'Елена Воронова', initials: 'ЕВ' };
  var activeEnv = {};
  var messageCounter = 100;
  var roomCounter = 20;

  var icons = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    lead: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    tour: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
    attach: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.6-9.6a4 4 0 1 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8l8.9-8.9"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    checks: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 12 4 4L16 6M9 15l2 2L22 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/></svg>',
    wifiOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 2 20 20M8.5 8.5A10 10 0 0 1 21 10M5 10a10 10 0 0 1 1.3-1.5M8.5 13.5A5 5 0 0 1 16 14M12 18h.01"/></svg>',
    alert: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></svg>',
    empty: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  };

  var threads = [
    {
      id: 'staff-general', contour: 'staff', kind: 'general', title: 'Общий чат команды', subtitle: 'Все сотрудники · 12 участников', initials: 'ОБ', unread: 3, updatedAt: '09:42', contextLabel: 'Внутренний чат',
      participants: ['Елена Воронова', 'Игорь Лебедев', 'Мария Белова', 'Ли Вэй'],
      messages: [
        msg('m1', 'user-manager-igor', 'Игорь Лебедев', 'Проверил документы по завтрашнему вылету.', '09:18'),
        msg('m2', 'user-escort-maria', 'Мария Белова', 'Спасибо. По двум паспортам оставила комментарии в карточках туристов.', '09:24'),
        msg('m3', 'user-guide-li', 'Ли Вэй', 'Трансфер в Пекине подтверждён, водитель будет у выхода B.', '09:42')
      ]
    },
    {
      id: 'staff-direct-igor', contour: 'staff', kind: 'direct', title: 'Игорь Лебедев', subtitle: 'Личный чат · был в сети 5 минут назад', initials: 'ИЛ', unread: 0, updatedAt: 'Вчера', contextLabel: 'Только вы и Игорь',
      participants: ['Елена Воронова', 'Игорь Лебедев'],
      messages: [
        msg('m4', currentUser.id, currentUser.name, 'Возьми, пожалуйста, лид Орловой на контроль.', 'Вчера, 17:31', 'read'),
        msg('m5', 'user-manager-igor', 'Игорь Лебедев', 'Принял. Вернусь с ответом до обеда.', 'Вчера, 17:36')
      ]
    },
    {
      id: 'staff-group-china', contour: 'staff', kind: 'group', title: 'Китай · команда тура', subtitle: 'Групповой чат · 7 участников', initials: 'КТ', unread: 1, updatedAt: '08:55', contextLabel: 'Рабочая группа', tourId: 'china',
      participants: ['Елена Воронова', 'Мария Белова', 'Ли Вэй', 'Анна Ким'],
      messages: [
        msg('m6', 'user-escort-maria', 'Мария Белова', 'Гиды по всем городам добавлены. Проверьте расписание встреч.', '08:55')
      ]
    },
    {
      id: 'staff-lead-1042', contour: 'staff', kind: 'lead', title: 'Лид Соколовы', subtitle: 'Обсуждение лида · 4 сотрудника', initials: 'ЛС', unread: 2, updatedAt: '10:06', contextLabel: 'Привязан к лиду', leadId: 'lead-1042',
      participants: ['Елена Воронова', 'Игорь Лебедев', 'Мария Белова'],
      messages: [
        msg('m7', 'user-manager-igor', 'Игорь Лебедев', 'Клиент прислал новый паспорт ребёнка через WhatsApp.', '09:58'),
        msg('m8', 'user-escort-maria', 'Мария Белова', 'Загружу в карточку туриста и отмечу задачу выполненной.', '10:06')
      ]
    },
    {
      id: 'staff-tour-china', contour: 'staff', kind: 'tour', title: 'Гранд-тур по Китаю', subtitle: 'Обсуждение тура · менеджеры и гиды', initials: 'КИ', unread: 0, updatedAt: 'Пн', contextLabel: 'Привязан к туру', tourId: 'china',
      participants: ['Елена Воронова', 'Игорь Лебедев', 'Мария Белова', 'Ли Вэй'],
      messages: [msg('m9', currentUser.id, currentUser.name, 'Зафиксировала финальный список группы — 50 туристов.', 'Пн, 16:10', 'read')]
    },
    {
      id: 'client-tourist-t1', contour: 'client', kind: 'tourist', title: 'Анна Соколова', subtitle: 'Личный чат с туристом', initials: 'АС', unread: 1, updatedAt: '10:12', contextLabel: 'Клиентский чат в приложении', touristId: 't1', leadId: 'lead-1042', tourId: 'china',
      participants: ['Елена Воронова', 'Анна Соколова'],
      messages: [
        msg('m10', 'tourist-t1', 'Анна Соколова', 'Подскажите, нужна ли распечатанная страховка?', '10:08'),
        msg('m11', currentUser.id, currentUser.name, 'Электронной версии достаточно. Она уже есть в разделе «Документы».', '10:12', 'read')
      ]
    },
    {
      id: 'client-tourist-t3', contour: 'client', kind: 'tourist', title: 'Марина Орлова', subtitle: 'Личный чат с туристом', initials: 'МО', unread: 0, updatedAt: 'Вчера', contextLabel: 'Клиентский чат в приложении', touristId: 't3', leadId: 'lead-1048', tourId: 'china',
      participants: ['Елена Воронова', 'Марина Орлова'],
      messages: [msg('m12', currentUser.id, currentUser.name, 'Марина, программа тура обновлена в приложении.', 'Вчера, 13:40', 'delivered')]
    },
    {
      id: 'client-tour-china', contour: 'client', kind: 'tour', title: 'Гранд-тур по Китаю', subtitle: 'Общий чат клиентов тура · 50 участников', initials: '50', unread: 4, updatedAt: '11:20', contextLabel: 'Общий клиентский чат тура', tourId: 'china',
      participants: ['Команда UNIQUE', 'Туристы тура'],
      messages: [
        msg('m13', currentUser.id, currentUser.name, 'Добро пожаловать! Здесь будут организационные сообщения по туру.', 'Вчера, 12:00', 'read'),
        msg('m14', 'tourist-t8', 'Николай Петров', 'Во сколько встречаемся в аэропорту?', '11:20')
      ]
    },
    {
      id: 'wazzup-lead-1042-wa', contour: 'wazzup', kind: 'lead', channel: 'WhatsApp', channelKey: 'whatsapp', title: 'Анна Соколова', subtitle: 'WhatsApp · Лид Соколовы', initials: 'АС', unread: 2, updatedAt: '11:34', contextLabel: 'Wazzup · WhatsApp', integrationState: 'connected', leadId: 'lead-1042', touristId: 't1', tourId: 'china',
      participants: ['Елена Воронова', 'Анна Соколова'],
      messages: [
        msg('m15', 'external-t1', 'Анна Соколова', 'Отправила новый скан паспорта Ильи.', '11:31'),
        msg('m16', currentUser.id, currentUser.name, 'Получили, спасибо! Документ проверим сегодня.', '11:34', 'read')
      ]
    },
    {
      id: 'wazzup-lead-1048-tg', contour: 'wazzup', kind: 'lead', channel: 'Telegram', channelKey: 'telegram', title: 'Марина Орлова', subtitle: 'Telegram · Лид Орлова', initials: 'МО', unread: 0, updatedAt: '09:15', contextLabel: 'Wazzup · Telegram', integrationState: 'syncing', leadId: 'lead-1048', touristId: 't3', tourId: 'china',
      participants: ['Елена Воронова', 'Марина Орлова'],
      messages: [msg('m17', currentUser.id, currentUser.name, 'Марина, получили ваше подтверждение.', '09:15', 'delivered')]
    },
    {
      id: 'wazzup-lead-1051-max', contour: 'wazzup', kind: 'lead', channel: 'MAX', channelKey: 'max', title: 'Алексей Крылов', subtitle: 'MAX · Лид Крыловы', initials: 'АК', unread: 0, updatedAt: '2 авг', contextLabel: 'Wazzup · MAX', integrationState: 'error', leadId: 'lead-1051', touristId: 'tourist-1051', tourId: 'china',
      participants: ['Игорь Лебедев', 'Алексей Крылов'],
      messages: [msg('m18', 'external-t5', 'Алексей Крылов', 'Буду ждать договор.', '2 авг, 18:45')]
    }
  ];

  var state = {
    activeTab: 'staff',
    screen: 'list',
    activeThreadId: null,
    query: '',
    offline: false,
    listStates: { staff: 'ready', client: 'ready', wazzup: 'ready' },
    drafts: {},
    editingMessageId: null,
    messageMenuId: null,
    createType: 'direct',
    createTitle: '',
    createMembers: '',
    contextReturnView: null,
    contextMode: false
  };

  function msg(id, authorId, authorName, text, time, status, attachment) {
    return { id: id, authorId: authorId, authorName: authorName, text: text, time: time, status: status || null, attachment: attachment || null };
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function nowTime() {
    return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  }

  function activeThread() {
    return threads.find(function (thread) { return thread.id === state.activeThreadId; }) || null;
  }

  function totalUnread(contour) {
    return threads.filter(function (thread) { return thread.contour === contour; })
      .reduce(function (sum, thread) { return sum + Number(thread.unread || 0); }, 0);
  }

  function unreadTotal() {
    return threads.filter(function (thread) { return thread.contour !== 'wazzup'; })
      .reduce(function (sum, thread) { return sum + Number(thread.unread || 0); }, 0);
  }

  function unreadForTour(tourId) {
    if (!tourId) return 0;
    return threads.filter(function (thread) { return thread.tourId === tourId && thread.contour === 'client' && thread.kind === 'tour'; })
      .reduce(function (sum, thread) { return sum + Number(thread.unread || 0); }, 0);
  }

  function contourLabel(contour) {
    return contour === 'staff' ? 'Команда' : contour === 'client' ? 'Клиенты' : 'Wazzup';
  }

  function contourDescription(contour) {
    if (contour === 'staff') return 'Личные, групповые и контекстные рабочие чаты';
    if (contour === 'client') return 'Общение внутри приложения: лично и со всем туром';
    return 'Внешние диалоги открываются в карточке соответствующего лида';
  }

  function kindIcon(thread) {
    if (thread.kind === 'direct' || thread.kind === 'tourist') return icons.user;
    if (thread.kind === 'lead') return icons.lead;
    if (thread.kind === 'tour') return icons.tour;
    return icons.users;
  }

  function statusBadge(thread) {
    if (thread.contour !== 'wazzup') return '';
    var stateLabel = thread.integrationState === 'connected' ? 'Канал активен' : thread.integrationState === 'syncing' ? 'Канал загружается' : 'Ошибка канала';
    return '<span class="chat-integration-state is-' + escapeHtml(thread.integrationState) + '">' + escapeHtml(stateLabel) + '</span>';
  }

  function renderTabs() {
    return '<div class="chat-tabs" role="tablist" aria-label="Тип чата">' + ['staff', 'client', 'wazzup'].map(function (tab) {
      var unread = tab === 'wazzup' ? 0 : totalUnread(tab);
      return '<button type="button" role="tab" aria-selected="' + (state.activeTab === tab) + '" class="chat-tab ' + (state.activeTab === tab ? 'active' : '') + '" data-chat-action="tab" data-chat-tab="' + tab + '">' +
        '<span>' + contourLabel(tab) + '</span>' + (unread ? '<b aria-label="' + unread + ' непрочитанных">' + unread + '</b>' : '') + '</button>';
    }).join('') + '</div>';
  }

  function renderStateCard(kind) {
    if (state.offline) {
      return '<div class="chat-state-card is-offline">' + icons.wifiOff + '<strong>Нет подключения</strong><span>История доступна, но новые сообщения и файлы пока не отправятся.</span><button type="button" data-chat-action="set-online">Повторить</button></div>';
    }
    if (kind === 'error') {
      return '<div class="chat-state-card is-error">' + icons.alert + '<strong>Не удалось загрузить чаты</strong><span>Тестовое состояние ошибки. Данные других разделов не затронуты.</span><button type="button" data-chat-action="retry">Повторить</button></div>';
    }
    if (kind === 'empty') {
      return '<div class="chat-state-card">' + icons.empty + '<strong>Здесь пока нет чатов</strong><span>Новый диалог появится после первого сообщения или создания рабочей комнаты.</span>' + (state.activeTab === 'staff' ? '<button type="button" data-chat-action="new-room">Создать чат</button>' : '') + '</div>';
    }
    return '';
  }

  function filteredThreads() {
    var query = state.query.trim().toLocaleLowerCase('ru');
    return threads.filter(function (thread) {
      if (thread.contour !== state.activeTab) return false;
      if (!query) return true;
      return [thread.title, thread.subtitle, thread.contextLabel, thread.channel].filter(Boolean).join(' ').toLocaleLowerCase('ru').indexOf(query) !== -1;
    });
  }

  function lastMessage(thread) {
    return thread.messages.length ? thread.messages[thread.messages.length - 1] : null;
  }

  function renderThreadCard(thread) {
    var last = lastMessage(thread);
    var channelClass = thread.channelKey ? ' channel-' + thread.channelKey : '';
    return '<button type="button" class="chat-thread-card' + channelClass + '" data-chat-action="open-thread" data-chat-thread-id="' + escapeHtml(thread.id) + '">' +
      '<span class="chat-avatar">' + (thread.contour === 'wazzup' ? '<i>' + escapeHtml(thread.channel === 'WhatsApp' ? 'WA' : thread.channel === 'Telegram' ? 'TG' : 'M') + '</i>' : kindIcon(thread)) + '</span>' +
      '<span class="chat-thread-copy"><span class="chat-thread-title"><strong>' + escapeHtml(thread.title) + '</strong><time>' + escapeHtml(thread.updatedAt) + '</time></span>' +
      '<small>' + escapeHtml(thread.subtitle) + '</small><span class="chat-preview">' + escapeHtml(last ? ((last.authorId === currentUser.id ? 'Вы: ' : '') + (last.text || last.attachment || 'Вложение')) : 'Сообщений пока нет') + '</span>' + statusBadge(thread) + '</span>' +
      (thread.contour !== 'wazzup' && thread.unread ? '<b class="chat-unread" aria-label="' + thread.unread + ' непрочитанных">' + thread.unread + '</b>' : '') + '</button>';
  }

  function renderList() {
    var listState = state.listStates[state.activeTab];
    var visible = filteredThreads();
    var stateCard = renderStateCard(listState);
    return '<section class="mobile-chats" data-chat-view="list">' +
      '<header class="chat-hub-header"><div><span>Мобильная CRM</span><h2>Чаты</h2></div><button type="button" class="chat-icon-button" data-chat-action="new-room" aria-label="Создать чат" ' + (state.activeTab !== 'staff' ? 'disabled' : '') + '>' + icons.plus + '</button></header>' +
      renderTabs() +
      '<div class="chat-hub-copy"><strong>' + contourLabel(state.activeTab) + '</strong><span>' + contourDescription(state.activeTab) + '</span></div>' +
      '<label class="chat-search"><span class="sr-only">Поиск чатов</span>' + icons.search + '<input type="search" inputmode="search" autocomplete="off" placeholder="Поиск по чатам" value="' + escapeHtml(state.query) + '" data-chat-search></label>' +
      (state.activeTab === 'wazzup' ? '<div class="chat-wazzup-summary"><strong>Внешняя переписка не смешивается с чатами UNIQUE</strong><span>Карточка открывает Wazzup внутри лида. Историю, доставку и прочтение показывает сам Wazzup.</span></div>' : '') +
      '<div class="chat-list" aria-live="polite">' + stateCard +
      ((!state.offline && listState === 'ready') ? (visible.length ? visible.map(renderThreadCard).join('') : renderStateCard('empty')) : '') + '</div>' +
      '<div class="chat-demo-controls" aria-label="Тестовые состояния"><span>Показать:</span><button type="button" data-chat-action="demo-empty">пусто</button><button type="button" data-chat-action="demo-error">ошибку</button><button type="button" data-chat-action="demo-offline">офлайн</button></div>' +
      '</section>';
  }

  function deliveryIcon(message) {
    if (message.authorId !== currentUser.id) return '';
    if (message.status === 'read') return '<span class="chat-delivery is-read" aria-label="Прочитано">' + icons.checks + '</span>';
    if (message.status === 'delivered') return '<span class="chat-delivery" aria-label="Доставлено">' + icons.checks + '</span>';
    return '<span class="chat-delivery" aria-label="Отправлено">' + icons.check + '</span>';
  }

  function renderMessage(message) {
    var own = message.authorId === currentUser.id;
    var menu = own && state.messageMenuId === message.id;
    var editing = own && state.editingMessageId === message.id;
    return '<article class="chat-message ' + (own ? 'is-own' : 'is-incoming') + '" data-message-id="' + escapeHtml(message.id) + '">' +
      (!own ? '<span class="chat-message-author">' + escapeHtml(message.authorName) + '</span>' : '') +
      (editing ? '<form class="chat-edit-form" data-chat-form="edit-message" data-message-id="' + escapeHtml(message.id) + '"><textarea name="message" rows="2" aria-label="Текст сообщения">' + escapeHtml(message.text) + '</textarea><div><button type="button" data-chat-action="cancel-edit">Отмена</button><button type="submit">Сохранить</button></div></form>' :
        '<div class="chat-bubble">' + (message.attachment ? '<span class="chat-attachment">' + icons.attach + '<b>' + escapeHtml(message.attachment) + '</b><small>Тестовое вложение</small></span>' : '') + (message.text ? '<p>' + escapeHtml(message.text) + '</p>' : '') +
          '<span class="chat-message-meta"><time>' + escapeHtml(message.time) + '</time>' + deliveryIcon(message) + (own ? '<button type="button" data-chat-action="message-menu" data-message-id="' + escapeHtml(message.id) + '" aria-label="Действия с сообщением">' + icons.more + '</button>' : '') + '</span></div>') +
      (menu ? '<div class="chat-message-menu"><button type="button" data-chat-action="edit-message" data-message-id="' + escapeHtml(message.id) + '">' + icons.edit + 'Изменить</button><button type="button" data-chat-action="delete-message" data-message-id="' + escapeHtml(message.id) + '">' + icons.trash + 'Удалить</button></div>' : '') + '</article>';
  }

  function renderContextLinks(thread) {
    var links = [];
    if (thread.leadId) links.push('<button type="button" data-chat-action="open-lead" data-lead-id="' + escapeHtml(thread.leadId) + '">' + icons.lead + 'Лид</button>');
    if (thread.touristId) links.push('<button type="button" data-chat-action="open-tourist" data-tourist-id="' + escapeHtml(thread.touristId) + '">' + icons.user + 'Турист</button>');
    if (thread.tourId) links.push('<button type="button" data-chat-action="open-tour" data-tour-id="' + escapeHtml(thread.tourId) + '">' + icons.tour + 'Тур</button>');
    return links.length ? '<div class="chat-context-links">' + links.join('') + '</div>' : '';
  }

  function renderThread() {
    var thread = activeThread();
    if (!thread) {
      state.screen = 'list';
      return renderList();
    }
    var warning = thread.contour === 'staff'
      ? '<div class="chat-privacy-note">Внутренний чат. Клиенты не видят сообщения.</div>'
      : thread.contour === 'client'
        ? '<div class="chat-privacy-note is-client">' + (thread.kind === 'tourist' ? 'Сообщения видят ' + escapeHtml(thread.title) + ' и сотрудники с доступом.' : 'Сообщения видят участники тура и сотрудники с доступом.') + '</div>'
        : '<div class="chat-privacy-note is-wazzup">Переписка с клиентом через ' + escapeHtml(thread.channel) + '. История связана с лидом.</div>';
    var integrationWarning = thread.contour === 'wazzup' && thread.integrationState === 'error'
      ? '<div class="chat-thread-alert">' + icons.alert + '<span><strong>Канал требует проверки</strong>Новые сообщения временно не отправляются.</span><button type="button" data-chat-action="repair-channel">Проверить</button></div>' : '';
    var draft = state.drafts[thread.id] || '';
    var composerDisabled = state.offline || (thread.contour === 'wazzup' && thread.integrationState === 'error');
    return '<section class="mobile-chats chat-thread-screen" data-chat-view="thread" data-chat-thread-id="' + escapeHtml(thread.id) + '">' +
      '<header class="chat-thread-header"><button type="button" class="chat-icon-button" data-chat-action="close-thread" aria-label="Назад">' + icons.back + '</button><span class="chat-avatar is-small">' + (thread.contour === 'wazzup' ? '<i>' + escapeHtml(thread.channel === 'WhatsApp' ? 'WA' : thread.channel === 'Telegram' ? 'TG' : 'M') + '</i>' : kindIcon(thread)) + '</span><div><strong>' + escapeHtml(thread.title) + '</strong><span>' + escapeHtml(thread.contextLabel) + '</span></div><button type="button" class="chat-icon-button" data-chat-action="thread-info" aria-label="Информация о чате">' + icons.more + '</button></header>' +
      warning + renderContextLinks(thread) + integrationWarning + (state.offline ? renderStateCard('offline') : '') +
      '<div class="chat-messages" role="log" aria-live="polite"><div class="chat-day">Сегодня</div>' + (thread.messages.length ? thread.messages.map(renderMessage).join('') : '<div class="chat-empty-thread">' + icons.empty + '<strong>Начните диалог</strong><span>Первое сообщение появится здесь.</span></div>') + '</div>' +
      '<form class="chat-composer" data-chat-form="send-message"><button type="button" data-chat-action="attach" aria-label="Прикрепить файл" ' + (composerDisabled ? 'disabled' : '') + '>' + icons.attach + '</button><textarea name="message" rows="1" maxlength="1000" placeholder="Сообщение" aria-label="Сообщение" data-chat-composer ' + (composerDisabled ? 'disabled' : '') + '>' + escapeHtml(draft) + '</textarea><button type="submit" class="is-send" aria-label="Отправить" ' + (composerDisabled ? 'disabled' : '') + '>' + icons.send + '</button></form>' +
      '</section>';
  }

  function renderCreate() {
    return '<section class="mobile-chats chat-create-screen" data-chat-view="create">' +
      '<header class="chat-thread-header"><button type="button" class="chat-icon-button" data-chat-action="cancel-create" aria-label="Назад">' + icons.back + '</button><div><strong>Новый рабочий чат</strong><span>Только для сотрудников</span></div></header>' +
      '<form class="chat-create-form" data-chat-form="create-room"><div class="chat-create-switch"><button type="button" data-chat-action="room-type" data-room-type="direct" class="' + (state.createType === 'direct' ? 'active' : '') + '">Личный</button><button type="button" data-chat-action="room-type" data-room-type="group" class="' + (state.createType === 'group' ? 'active' : '') + '">Группа</button></div>' +
      '<label><span>' + (state.createType === 'direct' ? 'Сотрудник' : 'Название группы') + '</span><input name="title" autocomplete="off" required placeholder="' + (state.createType === 'direct' ? 'Например, Анна Ким' : 'Например, Команда Марокко') + '" value="' + escapeHtml(state.createTitle) + '" data-chat-create-title></label>' +
      (state.createType === 'group' ? '<label><span>Участники</span><input name="members" autocomplete="off" required placeholder="Имена через запятую" value="' + escapeHtml(state.createMembers) + '" data-chat-create-members><small>В прототипе участники добавляются на mock-данных.</small></label>' : '') +
      '<div class="chat-create-note">' + icons.users + '<span><strong>Клиенты сюда не попадут</strong>Личные и групповые комнаты сотрудников отделены от клиентских каналов.</span></div>' +
      '<button type="submit" class="chat-primary-button">Создать чат</button></form></section>';
  }

  function renderHub(env) {
    if (env) activeEnv = Object.assign({}, activeEnv, env);
    if (env && typeof env.offline === 'boolean') state.offline = env.offline;
    return state.screen === 'thread' ? renderThread() : state.screen === 'create' ? renderCreate() : renderList();
  }

  function toast(message, tone, env) {
    var targetEnv = env || activeEnv;
    if (targetEnv && typeof targetEnv.showToast === 'function') targetEnv.showToast(message, tone || 'success');
  }

  function rerender(env) {
    if (env) activeEnv = Object.assign({}, activeEnv, env);
    if (typeof activeEnv.render === 'function') {
      activeEnv.render();
      return snapshot();
    }
    return renderHub(activeEnv);
  }

  function handleInput(target) {
    if (!target) return snapshot();
    if (target.matches && target.matches('[data-chat-search]')) {
      state.query = target.value || '';
      rerender();
    } else if (target.matches && target.matches('[data-chat-composer]')) {
      var thread = activeThread();
      if (thread) state.drafts[thread.id] = target.value || '';
    } else if (target.matches && target.matches('[data-chat-create-title]')) {
      state.createTitle = target.value || '';
    } else if (target.matches && target.matches('[data-chat-create-members]')) {
      state.createMembers = target.value || '';
    }
    return snapshot();
  }

  function formValue(form, name) {
    if (!form || !form.elements || !form.elements[name]) return '';
    return String(form.elements[name].value || '').trim();
  }

  function sendMessage(form, env) {
    var thread = activeThread();
    if (!thread) return;
    if (state.offline) {
      toast('Нет подключения. Сообщение осталось в черновике.', 'error', env);
      return;
    }
    if (thread.contour === 'wazzup' && thread.integrationState === 'error') {
      toast('Сначала проверьте подключение канала.', 'error', env);
      return;
    }
    var text = formValue(form, 'message') || (state.drafts[thread.id] || '').trim();
    if (!text) {
      toast('Введите сообщение', 'error', env);
      return;
    }
    messageCounter += 1;
    thread.messages.push(msg('mock-message-' + messageCounter, currentUser.id, currentUser.name, text, nowTime(), thread.contour === 'staff' ? 'read' : 'delivered'));
    thread.updatedAt = nowTime();
    state.drafts[thread.id] = '';
    state.messageMenuId = null;
    toast('Сообщение добавлено в прототип', 'success', env);
    rerender(env);
  }

  function editMessage(form, env) {
    var thread = activeThread();
    var messageId = (form && form.dataset && form.dataset.messageId) || state.editingMessageId;
    var message = thread && thread.messages.find(function (item) { return item.id === messageId; });
    if (!message || message.authorId !== currentUser.id) return;
    var text = formValue(form, 'message');
    if (!text) {
      toast('Сообщение не может быть пустым', 'error', env);
      return;
    }
    message.text = text;
    message.edited = true;
    state.editingMessageId = null;
    state.messageMenuId = null;
    toast('Сообщение изменено', 'success', env);
    rerender(env);
  }

  function createRoom(form, env) {
    var title = formValue(form, 'title') || state.createTitle.trim();
    var membersValue = formValue(form, 'members') || state.createMembers.trim();
    if (!title || (state.createType === 'group' && !membersValue)) {
      toast('Заполните обязательные поля', 'error', env);
      return;
    }
    roomCounter += 1;
    var members = state.createType === 'group' ? membersValue.split(',').map(function (name) { return name.trim(); }).filter(Boolean) : [title];
    var room = {
      id: 'staff-mock-' + roomCounter,
      contour: 'staff', kind: state.createType, title: title,
      subtitle: state.createType === 'group' ? 'Групповой чат · ' + (members.length + 1) + ' участника' : 'Личный чат',
      initials: title.split(/\s+/).map(function (part) { return part.charAt(0); }).join('').slice(0, 2).toUpperCase(),
      unread: 0, updatedAt: 'Сейчас', contextLabel: state.createType === 'group' ? 'Рабочая группа' : 'Только вы и сотрудник',
      participants: [currentUser.name].concat(members), messages: []
    };
    threads.unshift(room);
    state.activeTab = 'staff';
    state.activeThreadId = room.id;
    state.screen = 'thread';
    state.createTitle = '';
    state.createMembers = '';
    toast('Рабочий чат создан', 'success', env);
    rerender(env);
  }

  function handleSubmit(form, env) {
    var kind = form && form.dataset ? form.dataset.chatForm : '';
    if (kind === 'send-message') sendMessage(form, env);
    else if (kind === 'edit-message') editMessage(form, env);
    else if (kind === 'create-room') createRoom(form, env);
    return snapshot();
  }

  function targetData(target, key) {
    return target && target.dataset ? target.dataset[key] : null;
  }

  function closeThread(env) {
    var returnView = state.contextReturnView;
    var wasContext = state.contextMode;
    state.screen = 'list';
    state.activeThreadId = null;
    state.editingMessageId = null;
    state.messageMenuId = null;
    state.contextMode = false;
    state.contextReturnView = null;
    if (wasContext && returnView != null) {
      var callbackEnv = env || activeEnv;
      if (callbackEnv && typeof callbackEnv.closeContext === 'function') callbackEnv.closeContext(returnView);
      else if (callbackEnv && typeof callbackEnv.onCloseContext === 'function') callbackEnv.onCloseContext(returnView);
      return;
    }
    rerender(env);
  }

  function handleAction(action, target, env) {
    action = action || targetData(target, 'chatAction');
    if (!action) return snapshot();
    if (action === 'tab') {
      state.activeTab = targetData(target, 'chatTab') || 'staff';
      state.query = '';
      state.listStates[state.activeTab] = 'ready';
      state.screen = 'list';
      rerender(env);
    } else if (action === 'open-thread') {
      var threadId = targetData(target, 'chatThreadId');
      var thread = threads.find(function (item) { return item.id === threadId; });
      if (thread) {
        if (thread.contour === 'wazzup' && thread.leadId) {
          var linkEnv = env || activeEnv;
          if (linkEnv && typeof linkEnv.openLead === 'function') linkEnv.openLead(thread.leadId);
          return snapshot();
        }
        state.activeThreadId = thread.id;
        state.activeTab = thread.contour;
        state.screen = 'thread';
        thread.unread = 0;
        rerender(env);
      }
    } else if (action === 'close-thread' || action === 'back-list') {
      closeThread(env);
    } else if (action === 'new-room') {
      if (state.activeTab !== 'staff') return snapshot();
      state.screen = 'create';
      rerender(env);
    } else if (action === 'cancel-create') {
      state.screen = 'list';
      rerender(env);
    } else if (action === 'room-type') {
      state.createType = targetData(target, 'roomType') === 'group' ? 'group' : 'direct';
      rerender(env);
    } else if (action === 'attach') {
      var active = activeThread();
      if (!active || state.offline || (active.contour === 'wazzup' && active.integrationState === 'error')) {
        toast('Файл нельзя отправить в текущем состоянии', 'error', env);
      } else {
        messageCounter += 1;
        active.messages.push(msg('mock-message-' + messageCounter, currentUser.id, currentUser.name, '', nowTime(), active.contour === 'staff' ? 'read' : 'delivered', 'Маршрут_тура.pdf'));
        active.updatedAt = nowTime();
        toast('Тестовый файл прикреплён', 'success', env);
        rerender(env);
      }
    } else if (action === 'message-menu') {
      var menuId = targetData(target, 'messageId');
      state.messageMenuId = state.messageMenuId === menuId ? null : menuId;
      rerender(env);
    } else if (action === 'edit-message') {
      state.editingMessageId = targetData(target, 'messageId');
      state.messageMenuId = null;
      rerender(env);
    } else if (action === 'cancel-edit') {
      state.editingMessageId = null;
      state.messageMenuId = null;
      rerender(env);
    } else if (action === 'delete-message') {
      var threadForDelete = activeThread();
      var deleteId = targetData(target, 'messageId');
      var deleteIndex = threadForDelete ? threadForDelete.messages.findIndex(function (message) { return message.id === deleteId && message.authorId === currentUser.id; }) : -1;
      if (deleteIndex >= 0) {
        threadForDelete.messages.splice(deleteIndex, 1);
        state.messageMenuId = null;
        toast('Ваше сообщение удалено', 'success', env);
        rerender(env);
      }
    } else if (action === 'open-lead') {
      if (env && typeof env.openLead === 'function') env.openLead(targetData(target, 'leadId'));
      else if (typeof activeEnv.openLead === 'function') activeEnv.openLead(targetData(target, 'leadId'));
    } else if (action === 'open-tourist') {
      if (env && typeof env.openTourist === 'function') env.openTourist(targetData(target, 'touristId'));
      else if (typeof activeEnv.openTourist === 'function') activeEnv.openTourist(targetData(target, 'touristId'));
    } else if (action === 'open-tour') {
      if (env && typeof env.openTour === 'function') env.openTour(targetData(target, 'tourId'));
      else if (typeof activeEnv.openTour === 'function') activeEnv.openTour(targetData(target, 'tourId'));
    } else if (action === 'demo-empty') {
      state.offline = false;
      state.listStates[state.activeTab] = 'empty';
      rerender(env);
    } else if (action === 'demo-error') {
      state.offline = false;
      state.listStates[state.activeTab] = 'error';
      rerender(env);
    } else if (action === 'demo-offline') {
      state.offline = true;
      rerender(env);
    } else if (action === 'set-online' || action === 'retry') {
      state.offline = false;
      state.listStates[state.activeTab] = 'ready';
      rerender(env);
    } else if (action === 'repair-channel') {
      var repairThread = activeThread();
      if (repairThread && repairThread.contour === 'wazzup') repairThread.integrationState = 'connected';
      toast('Тестовый канал снова подключён', 'success', env);
      rerender(env);
    } else if (action === 'thread-info') {
      var infoThread = activeThread();
      toast(infoThread ? infoThread.participants.join(' · ') : 'Нет участников', 'success', env);
    }
    return snapshot();
  }

  function findContextThread(options) {
    if (options.threadId) return threads.find(function (thread) { return thread.id === options.threadId; });
    var contour = options.contour || options.channel || options.tab;
    if (!options.leadId && !options.touristId && !options.tourId && !options.kind) return null;
    return threads.find(function (thread) {
      if (contour && thread.contour !== contour) return false;
      if (options.kind && thread.kind !== options.kind) return false;
      if (options.leadId && thread.leadId !== options.leadId) return false;
      if (options.touristId && thread.touristId !== options.touristId) return false;
      if (options.tourId && thread.tourId !== options.tourId) return false;
      return Boolean(options.leadId || options.touristId || options.tourId || options.kind || contour);
    });
  }

  function openContext(options) {
    options = options || {};
    if (options.env) activeEnv = Object.assign({}, activeEnv, options.env);
    if (typeof options.offline === 'boolean') state.offline = options.offline;
    var thread = findContextThread(options);
    if (thread) {
      state.activeThreadId = thread.id;
      state.activeTab = thread.contour;
      state.screen = 'thread';
      state.contextMode = true;
      state.contextReturnView = options.returnView == null ? null : options.returnView;
      thread.unread = 0;
    } else {
      state.activeTab = ['staff', 'client', 'wazzup'].indexOf(options.contour || options.tab) >= 0 ? (options.contour || options.tab) : state.activeTab;
      state.screen = 'list';
      state.activeThreadId = null;
      state.contextMode = false;
      state.contextReturnView = null;
    }
    rerender();
    return snapshot();
  }

  function snapshot() {
    var safeThreads = threads.map(function (thread) {
      return Object.assign({}, thread, { messages: thread.messages.map(function (message) { return Object.assign({}, message); }), participants: thread.participants.slice() });
    });
    var scopes = ['staff', 'client', 'wazzup'].map(function (contour) {
      var scopeThreads = safeThreads.filter(function (thread) { return thread.contour === contour; });
      return {
        id: contour,
        label: contourLabel(contour),
        unread: totalUnread(contour),
        threadIds: scopeThreads.map(function (thread) { return thread.id; })
      };
    });
    var messages = [];
    safeThreads.forEach(function (thread) {
      thread.messages.forEach(function (message) {
        messages.push(Object.assign({ threadId: thread.id, contour: thread.contour }, message));
      });
    });
    return JSON.parse(JSON.stringify({
      activeTab: state.activeTab,
      screen: state.screen,
      activeThreadId: state.activeThreadId,
      query: state.query,
      offline: state.offline,
      listStates: state.listStates,
      drafts: state.drafts,
      editingMessageId: state.editingMessageId,
      contextMode: state.contextMode,
      contextReturnView: state.contextReturnView,
      unread: { staff: totalUnread('staff'), client: totalUnread('client'), wazzup: totalUnread('wazzup') },
      unreadTotal: unreadTotal(),
      scopes: scopes,
      threads: safeThreads,
      messages: messages
    }));
  }

  window.UNIQUE_MOBILE_CHATS = {
    renderHub: renderHub,
    handleInput: handleInput,
    handleSubmit: handleSubmit,
    handleAction: handleAction,
    openContext: openContext,
    snapshot: snapshot,
    unreadTotal: unreadTotal,
    unreadForTour: unreadForTour
  };
}());
