(function () {
  'use strict';

  var tours = [
    {
      id: 'china', title: 'Гранд-тур по Китаю', country: 'Китай', destination: 'Китай',
      startDate: '2026-09-14', endDate: '2026-09-25', dates: '14–25 сен 2026', dateOption: '12.09.2026 — 26.09.2026',
      cities: ['Пекин', 'Сиань', 'Шанхай', 'Пекин (2)'], route: [
        { id: 'route-beijing-1', name: 'Пекин' }, { id: 'route-xian-1', name: 'Сиань' },
        { id: 'route-shanghai-1', name: 'Шанхай' }, { id: 'route-beijing-2', name: 'Пекин (2)' }
      ], color: '#2f6bd8', status: 'active', tourType: 'group', tourTypeLabel: 'Групповой', capacity: 12,
      price: '189000', priceCurrency: 'RUB', logisticsCompleteness: 63, guides: 'Ли Вэй, Анна Ким',
      financeGuideCityId: 'route-xian-1', description: 'Авторский маршрут с четырьмя городскими остановками и повторным Пекином.'
    },
    {
      id: 'japan', title: 'Япония: сезон момидзи', country: 'Япония', destination: 'Япония',
      startDate: '2026-11-08', endDate: '2026-11-18', dates: '8–18 ноя 2026', dateOption: '07.11.2026 — 18.11.2026',
      cities: ['Токио', 'Киото', 'Осака'], route: [
        { id: 'route-tokyo-1', name: 'Токио' }, { id: 'route-kyoto-1', name: 'Киото' }, { id: 'route-osaka-1', name: 'Осака' }
      ], color: '#7a5af0', status: 'draft', tourType: 'group', tourTypeLabel: 'Групповой', capacity: 14,
      price: '245000', priceCurrency: 'RUB', logisticsCompleteness: 38, guides: 'Юки Танака', financeGuideCityId: null,
      description: 'Осенний маршрут по Японии в сезон красных клёнов.'
    },
    {
      id: 'italy', title: 'Италия для своих', country: 'Италия', destination: 'Италия',
      startDate: '2026-06-04', endDate: '2026-06-12', dates: '4–12 июн 2026', dateOption: '04.06.2026 — 12.06.2026',
      cities: ['Рим', 'Флоренция', 'Венеция'], route: [
        { id: 'route-rome-1', name: 'Рим' }, { id: 'route-florence-1', name: 'Флоренция' }, { id: 'route-venice-1', name: 'Венеция' }
      ], color: '#c98a1e', status: 'archive', isArchived: true, tourType: 'individual', tourTypeLabel: 'Индивидуальный', capacity: 10,
      price: '275000', priceCurrency: 'RUB', logisticsCompleteness: 100, guides: 'Марко Росси', financeGuideCityId: null,
      description: 'Завершённый камерный тур по трём городам Италии.'
    },
    {
      id: 'morocco', title: 'Марокко: города и пустыня', country: 'Марокко', destination: 'Марокко',
      startDate: '2026-10-03', endDate: '2026-10-13', dates: '3–13 окт 2026', dateOption: '03.10.2026 — 13.10.2026',
      cities: ['Касабланка', 'Марракеш', 'Уарзазат'], route: [
        { id: 'route-casablanca-1', name: 'Касабланка' }, { id: 'route-marrakesh-1', name: 'Марракеш' }, { id: 'route-ouarzazate-1', name: 'Уарзазат' }
      ], color: '#d65f3c', status: 'active', tourType: 'group', tourTypeLabel: 'Групповой', capacity: 16,
      price: '210000', priceCurrency: 'RUB', logisticsCompleteness: 51, guides: 'Самира Бенали', financeGuideCityId: null,
      description: 'Маршрут через атлантическое побережье, медину и ворота Сахары.'
    },
    {
      id: 'turkey', title: 'Стамбул и Каппадокия', country: 'Турция', destination: 'Турция',
      startDate: '2027-04-18', endDate: '2027-04-27', dates: '18–27 апр 2027', dateOption: '18.04.2027 — 27.04.2027',
      cities: ['Стамбул', 'Гёреме', 'Стамбул (2)'], route: [
        { id: 'route-istanbul-1', name: 'Стамбул' }, { id: 'route-goreme-1', name: 'Гёреме' }, { id: 'route-istanbul-2', name: 'Стамбул (2)' }
      ], color: '#1f8a6a', status: 'draft', tourType: 'group', tourTypeLabel: 'Групповой', capacity: 12,
      price: '174000', priceCurrency: 'RUB', logisticsCompleteness: 22, guides: 'Айше Демир', financeGuideCityId: null,
      description: 'Весенний маршрут с двумя независимыми остановками в Стамбуле.'
    }
  ];

  var plans = [
    { id: 'lead-china-04', code: 'L-1101', tourId: 'china', surname: 'Кузнецова', names: ['Ольга', 'Павел', 'София'], manager: 'Елена Воронова' },
    { id: 'lead-china-05', code: 'L-1102', tourId: 'china', surname: 'Романова', names: ['Дарья', 'Алексей'], manager: 'Елена Воронова' },
    { id: 'lead-japan-01', code: 'L-1201', tourId: 'japan', surname: 'Петрова', names: ['Ирина', 'Сергей', 'Артём'], manager: 'Елена Воронова' },
    { id: 'lead-japan-02', code: 'L-1202', tourId: 'japan', surname: 'Смирнова', names: ['Наталья', 'Андрей', 'Ева'], manager: 'Елена Воронова' },
    { id: 'lead-japan-03', code: 'L-1203', tourId: 'japan', surname: 'Ким', names: ['Виктор', 'Алёна'], manager: 'Игорь Лебедев' },
    { id: 'lead-japan-04', code: 'L-1204', tourId: 'japan', surname: 'Фёдорова', names: ['Юлия', 'Михаил'], manager: 'Елена Воронова' },
    { id: 'lead-italy-01', code: 'L-1301', tourId: 'italy', surname: 'Беляева', names: ['Вероника', 'Роман', 'Кирилл', 'Лидия'], manager: 'Елена Воронова' },
    { id: 'lead-italy-02', code: 'L-1302', tourId: 'italy', surname: 'Новикова', names: ['Татьяна', 'Олег', 'Майя'], manager: 'Елена Воронова' },
    { id: 'lead-italy-03', code: 'L-1303', tourId: 'italy', surname: 'Ларионова', names: ['Алина', 'Степан', 'Марк'], manager: 'Игорь Лебедев' },
    { id: 'lead-morocco-01', code: 'L-1401', tourId: 'morocco', surname: 'Ахметова', names: ['Лейла', 'Тимур'], manager: 'Елена Воронова' },
    { id: 'lead-morocco-02', code: 'L-1402', tourId: 'morocco', surname: 'Захарова', names: ['Полина', 'Глеб'], manager: 'Елена Воронова' },
    { id: 'lead-morocco-03', code: 'L-1403', tourId: 'morocco', surname: 'Громова', names: ['Оксана', 'Никита'], manager: 'Елена Воронова' },
    { id: 'lead-morocco-04', code: 'L-1404', tourId: 'morocco', surname: 'Осипова', names: ['Мария', 'Пётр'], manager: 'Игорь Лебедев' },
    { id: 'lead-morocco-05', code: 'L-1405', tourId: 'morocco', surname: 'Власова', names: ['Светлана', 'Лев'], manager: 'Елена Воронова' },
    { id: 'lead-turkey-01', code: 'L-1501', tourId: 'turkey', surname: 'Егорова', names: ['Ксения', 'Иван', 'Мирон'], manager: 'Елена Воронова' },
    { id: 'lead-turkey-02', code: 'L-1502', tourId: 'turkey', surname: 'Макарова', names: ['Инна', 'Арсений', 'Вера'], manager: 'Елена Воронова' },
    { id: 'lead-turkey-03', code: 'L-1503', tourId: 'turkey', surname: 'Павлова', names: ['Людмила', 'Вадим'], manager: 'Игорь Лебедев' },
    { id: 'lead-turkey-04', code: 'L-1504', tourId: 'turkey', surname: 'Сафронова', names: ['Елена', 'Максим'], manager: 'Елена Воронова' }
  ];

  var currencies = ['RUB', 'CNY', 'EUR', 'USD'];
  var stages = ['converted', 'converted', 'qualified', 'contacted'];
  var touristSequence = { china: 6, japan: 1, italy: 1, morocco: 1, turkey: 1 };

  function tourById(id) {
    return tours.find(function (tour) { return tour.id === id; });
  }

  function initials(lastName, firstName) {
    return (String(lastName).charAt(0) + String(firstName).charAt(0)).toUpperCase();
  }

  function makeLead(plan, index) {
    var tour = tourById(plan.tourId);
    var currency = currencies[index % currencies.length];
    var collected = index % 6 === 4;
    var noBalance = index % 6 === 5;
    var remaining = noBalance ? '0' : String(42000 + index * 6500);
    return {
      id: plan.id, code: plan.code, firstName: plan.names[0], lastName: plan.surname, middleName: 'Александровна',
      phone: '+7 900 ' + String(310 + index).padStart(3, '0') + '-' + String(20 + index).padStart(2, '0') + '-' + String(40 + index).padStart(2, '0'),
      email: plan.id + '@example.test', telegram: '@' + plan.id.replace(/-/g, '_'), telegramUserId: String(700000000 + index),
      stage: stages[index % stages.length], source: ['form', 'referral', 'telegram', 'direct'][index % 4], category: index % 5 === 0 ? 'vip' : 'category_ab',
      manager: plan.manager, assignedUserId: plan.manager === 'Елена Воронова' ? 'manager-elena' : 'manager-igor', color: tour.color,
      eventId: tour.id, tour: tour.title, destination: tour.destination, cities: tour.cities.slice(), routeCities: tour.cities.slice(),
      selectedCityIds: tour.route.map(function (city) { return city.id; }), updated: index % 2 ? 'сегодня, 11:20' : 'вчера, 17:45', created: '02.08.2026', archived: false,
      accommodation: { hotel: '', room: index % 3 === 0 ? 'Double' : 'Twin' }, roomType: [index % 3 === 0 ? 'Double' : 'Twin'], hotelCategory: ['4*'], transfers: ['group'], meals: ['BB'],
      tourCost: String(180000 + index * 5000), tourCostCurrency: 'RUB', advancePayment: String(60000 + index * 2500), advancePaymentCurrency: 'RUB',
      remainingPayment: remaining, remainingPaymentCurrency: currency, remainingPaymentCollected: collected,
      paymentStatus: collected || noBalance ? 'paid' : 'partial', paymentMethod: index % 2 ? 'bank_transfer' : 'card', bookingId: 'BK-' + plan.code.slice(2),
      note: 'Тестовая заявка для проверки мобильного MVP.', touristIds: [], messages: [], tasks: []
    };
  }

  function makeTourist(plan, lead, personIndex) {
    var tour = tourById(plan.tourId);
    var sequence = touristSequence[plan.tourId]++;
    var id = 'tourist-' + plan.tourId + '-' + String(sequence).padStart(2, '0');
    var firstName = plan.names[personIndex];
    var groupId = plan.names.length > 1 ? 'group-' + plan.id : null;
    var route = tour.route.map(function (city) { return city.id; });
    // Morocco is the finance parity fixture: later leads leave the route earlier,
    // so its three cities contain 10, 8 and 4 participants and different balances.
    if (plan.tourId === 'morocco' && sequence >= 9) route = route.slice(0, 1);
    else if (plan.tourId === 'morocco' && ((sequence >= 3 && sequence <= 4) || (sequence >= 7 && sequence <= 8))) route = route.slice(0, 2);
    return {
      id: id, leadTouristId: 'lt-' + plan.code.slice(2) + '-' + (personIndex + 1), contactId: 'contact-' + plan.tourId + '-' + String(sequence).padStart(2, '0'),
      dealId: 'deal-' + plan.tourId + '-' + String(sequence).padStart(2, '0'), leadId: plan.id, tourId: plan.tourId,
      lead: 'Лид ' + plan.surname.replace(/[ая]$/, 'ы'), firstName: firstName, lastName: plan.surname, middleName: personIndex === 0 ? 'Александровна' : '',
      name: plan.surname + ' ' + firstName + (personIndex === 0 ? ' Александровна' : ''), initials: initials(plan.surname, firstName),
      birthDate: personIndex === 2 ? '2014-05-12' : '1988-0' + ((sequence % 8) + 1) + '-1' + (sequence % 9),
      phone: personIndex === 0 ? lead.phone : '', email: personIndex === 0 ? lead.email : '', citizenship: 'Россия',
      domesticPassport: personIndex === 0 ? '45 20 ' + String(560000 + sequence) : '', domesticIssuedBy: personIndex === 0 ? 'ГУ МВД России' : '', registrationAddress: 'Москва',
      latinName: (firstName + ' ' + plan.surname).toUpperCase(), passport: '75 ' + String(7100000 + sequence), passportExpiry: '2031-08-20', scans: [],
      leadStatus: lead.stage === 'converted' ? 'Подтверждён' : (lead.stage === 'qualified' ? 'Забронирован' : 'Квалифицирован'),
      tourStatus: lead.stage === 'converted' ? 'Подтверждён' : 'Ожидает', groupId: groupId, groupRepresentative: personIndex === 0 && Boolean(groupId),
      route: route, type: personIndex === 2 ? 'Ребёнок' : 'Взрослый', isPrimary: personIndex === 0,
      notes: personIndex === 0 ? 'Основной турист тестовой заявки.' : '', guideComment: personIndex === 2 ? 'Проверить детское меню.' : '', preferredChannel: personIndex === 0 ? 'Telegram' : '', statusByCity: {}
    };
  }

  var supplementalLeads = [];
  var supplementalTourists = [];
  plans.forEach(function (plan, index) {
    var lead = makeLead(plan, index);
    plan.names.forEach(function (_name, personIndex) {
      var tourist = makeTourist(plan, lead, personIndex);
      lead.touristIds.push(tourist.id);
      supplementalTourists.push(tourist);
    });
    supplementalLeads.push(lead);
  });

  var bridgeTourist = {
    id: 'lead-tourist-1051', leadTouristId: 'lt-1051-1', contactId: 'contact-205', dealId: 'deal-505', leadId: 'lead-1051', tourId: 'china', lead: 'Лид Волков',
    firstName: 'Денис', lastName: 'Волков', middleName: 'Олегович', name: 'Волков Денис Олегович', initials: 'ВД', birthDate: '1984-06-20',
    phone: '+7 985 600-71-04', email: 'denis@example.ru', citizenship: 'Россия', domesticPassport: '', domesticIssuedBy: '', registrationAddress: 'Казань',
    latinName: 'DENIS VOLKOV', passport: '73 4567812', passportExpiry: '2030-06-20', scans: [], leadStatus: 'Квалифицирован', tourStatus: 'Ожидает',
    groupId: null, groupRepresentative: false, route: ['route-beijing-1', 'route-shanghai-1'], type: 'Взрослый', isPrimary: true, notes: '', guideComment: '', preferredChannel: 'Telegram', statusByCity: {}
  };

  var financeByLeadId = {
    'lead-1042': { remainingPayment: '148000', remainingPaymentCurrency: 'CNY', remainingPaymentCollected: false },
    'lead-1048': { remainingPayment: '85000', remainingPaymentCurrency: 'RUB', remainingPaymentCollected: false },
    'lead-1051': { remainingPayment: '0', remainingPaymentCurrency: 'RUB', remainingPaymentCollected: false }
  };
  supplementalLeads.forEach(function (lead) {
    financeByLeadId[lead.id] = {
      remainingPayment: lead.remainingPayment,
      remainingPaymentCurrency: lead.remainingPaymentCurrency,
      remainingPaymentCollected: lead.remainingPaymentCollected
    };
  });

  window.UNIQUE_MOCK_DATA = {
    version: 3,
    tours: tours,
    supplementalLeads: supplementalLeads,
    supplementalTourists: [bridgeTourist].concat(supplementalTourists),
    financeByLeadId: financeByLeadId
  };
}());
