(function () {'use strict'; try {
/***
  Доброго всем
  Маршруты приложения
***/

var moduleNameS = ["appRoutes", "AppRoutes"];

var moduleName = moduleNameS.filter(function(name){
  try{ if (angular.module(name)) return false; } // имя занято
  catch(err) { /* нет такого модуля */ return true; } // свободно
});

if (!moduleName.length) return;// все имена заняты

var routes = {
  'assets': '/assets/*topic',// не трогай
  
  "вход": '/profile',
  "обычная авторизация/регистрация": '/profile/sign',
  "home": '/',
  "начало": '/',
  "конфиг":'/config',
  "выгрузить файл": '/выгрузить+файл',///uploader#выгрузить_файл
  "файлы": '/файлы/:id1',///uploader#файлы
  "файл-прикрепление": '/файл-прикрепление/:sha1',///uploader#файл_прикрепление
  "файл-инлайн": '/файл-инлайн/:sha1',///uploader#файл_инлайн
  "удалить файлы": '/файлы+удалить',///uploader#удалить_файлы
  
  //~ "поиск категории": 'js/c/category/search.json',
  //~ "дерево категорий": 'js/c/category/tree.json',
  "категории/список":'/category/data/:root',
  //~ "категории/дерево и поиск":'/category/data',/// почикать этот маршрут
  "список кошельков": '/wallet/data/:project',
  "список контрагентов": '/contragent/data',
  "список проектов": '/project/list',
  "сохранить проект": '/project/save',
  "доступные объекты":'/доступные+объекты',
  "объекты и проекты":'/объекты+проекты/список',
  "объекты без проектов": '/объекты+без+проектов',///Object#объекты_без_проектов
  "доступные объекты без проектов": '/доступные+объекты+без+проектов',///Object#доступные_объекты_без_проектов
  "водители":'/водители',
  "объекты":'/объекты',// без доступа
  
  "сохранить движение ДС":'/waltex/money/save',
  "строка движения ДС":'/waltex/money/data/:id',
  "удалить запись движения ДС":'/waltex/money/delete/:id',
  "список движения ДС": '/waltex/money/list/:project',
  "список профилей": '/профили/список',
  "движение ДС/расчеты по профилю":'/waltex/money/расчеты+профиль',// для табельного отчета
  "движение ДС/баланс по профилю": '/waltex/money/баланс+профиль',
  
  "данные отчета ДС": '/waltex/report/data',
  "строка отчета ДС": '/waltex/report/row',
  
  "деньги/таблица/по кошелькам": '/деньги/таблица/по+кошелькам',///Waltex::Report::Wallets#data
  
  //~ "данные отчета ДС/все кошельки": '/waltex/report/data/wallets',
  //~ "строка отчета ДС/все кошельки": '/waltex/report/row/wallets',
  
  "доступ/список пользователей": '/админка/доступ/список/пользователи',
  "доступ/список ролей": '/админка/доступ/список/роли',
  "доступ/список маршрутов": '/админка/доступ/список/маршруты',
  
  "доступ/сохранить пользователя": '/админка/доступ/сохранить+пользователя',
  "доступ/сохранить роль": '/админка/доступ/сохранить+роль',
  "доступ/сохранить маршрут": '/админка/доступ/сохранить+маршрут',
  "доступ/пользователи роли": '/админка/доступ/пользователи+роли/:role',
  "доступ/маршруты роли": '/админка/доступ/маршруты+роли/:role',
  "доступ/маршруты пользователя": '/админка/доступ/маршруты+пользователя/:user',
  "доступ/роли пользователя": '/админка/доступ/роли+пользователя/:user',
  "доступ/роли маршрута": '/админка/доступ/роли+маршрута/:route',
  "доступ/пользователи маршрута": '/админка/доступ/пользователи+маршрута/:route',
  "админка/доступ/сохранить связь": '/админка/доступ/сохранить+связь/:id1/:id2',
  "админка/доступ/загрузить маршруты": '/админка/доступ/загрузить+маршруты',
  "админка/доступ/выгрузить маршруты": '/админка/доступ/выгрузить+маршруты',
  "админка/доступ/загрузить пользователей": '/админка/доступ/загрузить+пользователей',
  "админка/доступ/выгрузить пользователей": '/админка/доступ/выгрузить+пользователей',
  "доступ/доп. сотрудники": '/админка/доступ/доп+сотрудники',///Access#users2
  
  "кадры/сотрудники/роли":'/кадры/сотрудники/роли',
  "кадры/сохранить профиль": '/кадры/сохранить+профиль',
  "кадры/профили": '/кадры/профили',
  "кадры/сохранить связь": '/кадры/сохранить+связь/:id1/:id2',
  "кадры/сотрудники/сохранить группу": '/кадры/сотрудники/сохранить+группу',///Staff#сохранить_группу
  "кадры/роли профиля": '/кадры/роли+профиля/:profile',
  "кадры/сотрудники/фото": '/кадры/сотрудники/сохранить+фото',
  "кадры/сотрудники/профили роли": '/кадры/сотрудники/профили+роли/:role',///Staff#профили_роли
  
  "табель рабочего времени/бригады": '/табель/рабочего/времени/бригады',
  "табель рабочего времени/данные":'/табель/рабочего/времени/данные',
  "табель рабочего времени/профили":'/табель/рабочего/времени/профили',
  "табель рабочего времени/сохранить":'/табель/рабочего/времени/сохранить',
  
  "табель рабочего времени/отчет/данные":'/табель/рабочего/времени/отчет/данные',
  "табель рабочего времени/объекты":'/табель/рабочего/времени/объекты',
  "табель рабочего времени/сохранить значение":'/табель/рабочего/времени/сохранить+значение',
  "табель рабочего времени/отчет/детально": '/табель/рабочего/времени/отчет/детально',
  
  "табель рабочего времени/сотрудники на объектах":'/табель/рабочего/времени/отчет/сотрудники/объекты',
  "табель рабочего времени/сотрудники на объектах/данные":'/табель/рабочего/времени/отчет/сотрудники/объекты/данные',
  "табель/квитки начислено":'/табель/рабочего/времени/квитки/начислено',
  "табель/квитки начислено/данные":'/табель/рабочего/времени/квитки/начислено/данные',
  "табель/квитки расчет":'/табель/рабочего/времени/квитки/расчет',
  "табель/квитки расчет/данные":'/табель/рабочего/времени/квитки/расчет/данные',
  
  "табель рабочего времени/данные расчета ЗП": '/табель/рабочего/времени/данные+расчета+ЗП',
  "табель рабочего времени/открыть месяц": '/табель/рабочего/времени/открыть+месяц',
  
  "расчеты выплаты ЗП":'/зп/расчеты+выплаты/:profile/:month',
  "расчеты выплаты ЗП/другие месяцы": '/зп/расчеты/другие+месяцы',///TimeWork#расчеты_других_месяцев
  "расчеты выплаты ЗП/сохранить": '/зп/расчеты+выплаты/сохранить',
  "расчеты выплаты ЗП/завершить": '/зп/расчеты+выплаты/завершить',
  
  "тмц/сохранить заявку":'/тмц/заявка/сохранить',
  "тмц/удалить заявку": '/тмц/заявка/удалить',
  "тмц/заявки/завершенные": '/тмц/заявки/завершенные',///TMC#список_завершенных_заявок
  "тмц/объекты/список заявок": '/тмц/объекты/список+заявок',///TMC#объекты_список_заявок
  "тмц/объекты/список простые поставки": '/тмц/объекты/список+простые+поставки',///TMC#объекты_список_простые_поставки
  "тмц/объекты/список снаб": '/тмц/объекты/список+снаб',///TMC#объекты_список_снаб
  //~ "тмц/объекты/списки": '/тмц/на+объектах/списки',///TMC#списки_на_объектах разделил на 3 отдельных списка выше
  "тмц/снаб/список заявок":'/тмц/снаб/заявки',
  "тмц/снаб/список простые закупки": '/тмц/снаб/простые+закупки',///TMC#снаб_простые_закупки
  "тмц/снаб/сохранить номенклатуру заявки": '/тмц/снаб/сохранить+номенклатуру+заявки',///TMC#сохранить_номенклатуру_заявки
  "тмц/снаб/запрос резерва остатка": '/тмц/снаб/запрос+резерва+остатка',///TMC#запрос_резерва_остатка
  "тмц/снаб/список поставок": '/тмц/снаб/поставки',///TMC#список_поставок
  "тмц/снаб/сохранить заявку":'/тмц/снаб/сохранить+заявку',
  "тмц/снаб/закрыть заявку": '/тмц/снаб/закрыть+заявку',///TMC#закрыть_заявку
  "тмц/снаб/удалить": '/тмц/снаб/удалить',///TMC#удалить_снаб
  "тмц/снабжение/сохранить простую поставку": '/тмц/снабжение/сохранить+простую+поставку',///TMC#сохранить_простую_поставку
  "тмц/снаб/адреса отгрузки":'/тмц/снаб/адреса+отгрузки/:contragent_id',
  "тмц/сохранить поступление":'/тмц/сохранить+поступление',
  "тмц/сохранить перемещение": '/тмц/сохранить+перемещение',
  "тмц/удалить перемещение": '/тмц/удалить+перемещение',
  "тмц/текущие остатки":'/тмц/текущие+остатки',
///  "тмц/текущие остатки/docx": '/тмц/текущие+остатки/docx',///TMC#текущие_остатки_docx
  "тмц/остатки на дату.docx": '/тмц/остатки+на+дату.docx',///TMC#остатки_docx
  "тмц/остатки на дату/#docx": '/тмц/остатки+на+дату/#docx',///TMC#остатки_docx
  "тмц/движение": '/тмц/движение',
  "тмц/движение/приходы": '/тмц/движение/приходы',///TMC#приходы_тмц
  ///склад
  "тмц/склад/список инвентаризаций": '/тмц/склад/список+инвентаризаций',///TMC#список_инвентаризаций
  "тмц/склад/список заявок": '/тмц/склад/список+заявок',///TMC#склад_заявки
  "тмц/склад/резервы остатков": '/тмц/склад/резервы+остатков',///TMC#склад_резервы_остатков
  "тмц/склад/сохранить инвентаризацию": '/тмц/склад/сохранить+инвентаризацию',///TMC#сохранить_инвентаризацию
  "тмц/склад/сохранить позицию инвентаризации": '/тмц/склад/сохранить+позицию+инвентаризации',///TMC#сохранить_позицию_инвентаризации
  "тмц/склад/удалить позицию инвентаризации": '/тмц/склад/удалить+позицию+инвентаризации',///TMC#удалить_позицию_инвентаризации
  "тмц/склад/удалить инвентаризацию": '/тмц/склад/удалить+инвентаризацию',///TMC#удалить_инвентаризацию
  "тмц/склад/списки": '/тмц/склад/списки',///TMC#списки_склад
  "тмц/склад/подтвердить резерв остатка": '/тмц/склад/подтвердить+резерв+остатка',///TMC#подтвердить_резерв_остатка
  "тмц/склад/сохранить номенклатуру закупки": '/тмц/склад/сохранить+номенклатуру+закупки',///TMC#сохранить_номенклатуру_закупки
  "тмц/накладная.docx": '/тмц/накладная/:id',///TMC#накладная_docx
  "тмц/списание/сохранить": '/тмц/списание/сохранить',///TMC#сохранить_списание
  "тмц/сохранить принятие списания": '/тмц/сохранить+принятие+списания',///TMC#сохранить_принятие_списания
  "тмц/список списаний": '/тмц/список+списаний',///TMC#список_списаний
  "тмц/списание/удалить": '/тмц/списание/удалить',///TMC#удалить_списание
  
  "тмц/сертификаты/закупки": '/тмц/сертификаты/закупки',///TMC::Cert#закупки
  "тмц/сертификаты/папки": '/тмц/сертификаты/папки',///TMC::Cert#папки
  "тмц/сертификаты/сохранить папку": '/тмц/сертификаты/сохранить+папку',///TMC::Cert#сохранить_папку
  
  "список транспорта":'/transport/list/:category/:contragent',
  "транспорт/сохранить заявку":'/транспорт/заявка/сохранить',
  "транспорт/список заявок":'/транспорт/заявки/список',
  "транспорт/заявки/адреса":'/транспорт/заявки/адреса-:id',// ид заказчик или проект
  "транспорт/заявки/контакты": '/транспорт/заявки/контакты/:contact/:id',// водители, контактные лица заказчика и перевозчика
  "транспорт/заявки/список/интервал":'/транспорт/заявки/список/интервал',// шахматка
  "наш транспорт": '/транспорт/наш',
  "транспорт/черновик заявки": '/транспорт/заявки/черновик',
  "транспорт/заявка.docx":'/транспорт/заявка-:id/docx',
  //~ "контроль заявок": '/транспорт/заявки/контроль'
  
  "зп/конверты/данные": '/зп/конверты/данные',///Waltex::ZP#конверты_данные
  "зп/конверт/сохранить": '/зп/конверт/сохранить',///Waltex::ZP#конверт_сохранить

  "номенклатура/список": '/номенклатура/список/:root',
  "номенклатура/список без потомков": '/номенклатура/список+без+потомков-:root',// не надо
  "номенклатура/переместить позицию": '/номенклатура/переместить+позицию',///Nomen#переместить_позицию
  "номенклатура/изменить название": '/номенклатура/изменить+название',///Nomen#изменить_название
  "номенклатура/повторы на концах": 'номенклатура/повторы+на+концах',///Nomen#повторы_на_концах
  "номенклатура/удалить концы": 'номенклатура/удалить+концы',///Nomen#удалить_концы
  
  ///переделал"спецодежда/сотрудники": '/спецодежда/сотрудники',///GuardWare#profiles
  "сотрудники/список": '/сотрудники/список',///Profile#сотрудники
  "спецодежда/список": '/спецодежда/список',///GuardWare#список_спецодежды
  //~ "спецодежда сотрудника": '/спецодежда/сотрудника',///GuardWare#спецодежда_сотрудника
  "спецодежда/сохранить": '/спецодежда/сохранить',///GuardWare#сохранить
  "удалить спецодежду": '/спецодежда/удалить',///GuardWare#удалить
  "спецодежда/связь": '/спецодежда/связь',///GuardWare#связь
  
  ///аренда
  "аренда/объекты/список": '/аренда/объекты/список',///Rent#объекты_список
  "аренда/объекты-ук": '/аренда/объекты-ук',///Rent#объекты_ук
  "аренда/договоры/список": '/аренда/договоры/список',///Rent#договоры_список
  "аренда/сохранить объект": '/аренда/сохранить+объект',///Rent#сохранить_объект
  "аренда/удалить объект": '/аренда/удалить+объект',///Rent#удалить_объект
  "аренда/сохранить договор": '/аренда/сохранить+договор',///Rent#сохранить_договор
  "аренда/данные отчета ДС": '/аренда/данные+отчета+ДС',///Waltex::Report::Rent#data
  "аренда/строка отчета ДС": '/аренда/строка+отчета+ДС',///Waltex::Report::Rent#row
  "аренда/счет#docx": '/аренда/счет:docx',///Rent#счет_оплата_docx
  "аренда/реестр актов.xlsx": '/аренда/реестр+актов.xlsx/:month',///Rent#реестр_актов
  "аренда/расходы#docx": '/аренда/расходы#docx',///Rent#счет_расходы_docx
  
  "аренда/расходы/список": '/аренда/расходы/список',///Rent#расходы_список
  "аренда/расходы/категории": '/аренда/расходы/категории',///Rent#расходы_категории
  "аренда/сохранить расход": '/аренда/сохранить+расход',///Rent#сохранить_расход
  
  /// справочник
  "заменить контрагента": '/контрагенты/заменить',///Contragent#заменить_контрагента
  
  ///
  "химия/сырье/таблица": '/химия/сырье+таблица',///Chem#сырье_таблица
  "химия/сырье/остатки": '/химия/сырье+остатки',///Chem#сырье_остатки
  "химия/номенклатура": '/химия/номенклатура',///Chem#номенклатура
  "химия/контрагенты": '/химия/контрагенты',///Chem#контрагенты
  "химия/сохранить сырье": 'химия/сохранить+сырье',///Chem#сохранить_сырье
  "химия/продукция/таблица": '/химия/продукция+таблица',///Chem#продукция_таблица
  "химия/сохранить продукцию": 'химия/сохранить+продукцию',///Chem#сохранить_продукцию
  "химия/отгрузка/сводка": '/химия/отгрузка+сводка',///Chem#отгрузка_сводка
  "химия/отгрузка": '/химия/отгрузка',///Chem#отгрузка
  "химия/сохранить отгрузку": '/химия/сохранить+отгрузку',///Chem#сохранить_отгрузку
  "химия/продукция/остатки": '/химия/продукция+остатки',///Chem#продукция_остатки
  "химия/движение сырья": '/химия/движение+сырья',///Chem#движение_сырья
  "химия/движение продукции": '/химия/движение+продукции',///Chem#движение_продукции
  
  "отпуск сотрудника": '/табель/отпуск+сотрудника',///TimeRest#отпуск
  
},
  placeholder_re = new RegExp('[:#*]\\w+', 'g'),
  _baseURL = '';

const baseURL = function  (base) {// set/get base URL prefix
  if (base === undefined) return _baseURL;
  _baseURL = base;
  return base;
  
};

//~ var isType = function(type, data) {
  //~ if (arguments.length == 1) data = this;
  //~ return Object.prototype.toString.call(data).toLowerCase() == '[object '+type.toLowerCase()+']';
//~ };
//~ var isSomeType = function(types, data) { return types.some(isType, data);  };

const url_for = function (route_name, captures, param) {
  var pattern = routes[route_name];
  if (!pattern) {
    console.error("[angular.appRoutes] None route for: "+route_name);
    //~ return baseURL()+route_name;
    return undefined;
  }

  if ( captures === undefined ) captures = [];
  else if ( !angular.isObject(captures) ) captures = [captures];
  //~ if (angular.isArray(captures) /*isType('array', captures)*/ ) {
    const replacer = function (placeholder) {
      //~ console.log("replacer", arguments, this);
      var c = angular.isArray(captures) ? captures.shift() : captures[placeholder];
      if (c === undefined) {
        console.error("[angular.appRoutes] Route placeholder ["+placeholder+"] without value");
        c = '__route_placeholder['+placeholder+']_without_value__';
      }
      return c;
    }; 
    pattern = pattern.replace(placeholder_re, replacer);
  //~ } else {// object
    //~ angular.forEach(captures, function(value, placeholder) {
      //~ var re = new RegExp(/*'[:#*]' + */placeholder, 'g');///аргумент flags не работает в ядре v8 (движок JavaScript в Chrome и NodeJs)
      //~ pattern = pattern.replace(re, value);
    //~ });
    //~ pattern = pattern.replace(/[:#*][^/.]+/g, ''); // Clean not replaces placeholders
  //~ }
  
  if ( param === undefined ) return baseURL()+pattern;
  if ( !angular.isObject(param) /*!isSomeType(["object", "array"], param)*/ ) return baseURL()+pattern + '?' + param;
  var query = [];
  angular.forEach(param, function(value, name) {
    if ( angular.isArray(value) /*isType("array", value)*/ ) { angular.forEach(value, function(val) {query.push(name+'='+val);}); }
    else { query.push(name+'='+value); }
  });
  if (!query.length) return baseURL()+pattern;
  return baseURL()+pattern + '?' + query.join('&');
};


var factory = {
  routes: routes,
  baseURL: baseURL,// set/get
  url_for: url_for,
  urlFor: url_for,
  UrlFor: url_for,
};


moduleName.map(function(name){
    var mod = angular.module(name, []);
    mod.run(function ($window) {
      $window['angular.'+name] = factory;
    });
    moduleNameS.map(function(n){ mod.factory(n, function () {
      return factory;
    }); });// все комбинации
  
});

} catch(err) {console.log("Ошибка компиляции маршрутов"+err.stack);}
}());