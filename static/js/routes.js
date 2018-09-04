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


//~ var module = angular.module(moduleName, []);

var routes = {
  'assets': '/assets/*topic',// не трогай
  
  "вход": '/profile',
  "обычная авторизация/регистрация": '/profile/sign',
  "home": '/',
  "начало": '/',
  "конфиг":'/config',
  
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
  "расчеты выплаты ЗП/сохранить": '/зп/расчеты+выплаты/сохранить',
  "расчеты выплаты ЗП/завершить": '/зп/расчеты+выплаты/завершить',
  
  "номенклатура/список": '/номенклатура/список/:root',
  "номенклатура/список без потомков": '/номенклатура/список+без+потомков-:root',// не надо
  
  "тмц/сохранить заявку":'/тмц/заявка/сохранить',
  "тмц/удалить заявку": '/тмц/заявка/удалить',
  "тмц/объекты/списки": '/тмц/на+объектах/списки',///TMC#списки_на_объектах
  "тмц/снаб/список заявок":'/тмц/снаб/заявки',
  "тмц/снаб/список поставок": '/тмц/снаб/поставки',///TMC#список_поставок
  "тмц/снаб/сохранить заявку":'/тмц/снаб/сохранить+заявку',
  "тмц/снаб/удалить": '/тмц/снаб/удалить',///TMC#удалить_снаб
  "тмц/снабжение/сохранить простую поставку": '/тмц/снабжение/сохранить+простую+поставку',///TMC#сохранить_простую_поставку
  "тмц/снаб/адреса отгрузки":'/тмц/снаб/адреса+отгрузки/:contragent_id',
  "тмц/сохранить поступление":'/тмц/сохранить+поступление',
  "тмц/сохранить перемещение": '/тмц/сохранить+перемещение',
  "тмц/удалить перемещение": '/тмц/удалить+перемещение',
  "тмц/текущие остатки":'/тмц/текущие+остатки',
  "тмц/движение": '/тмц/движение',
  
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
  
},
  arr_re = new RegExp('[:*]\\w+', 'g'),
  _baseURL = '';

var baseURL = function  (base) {// set/get base URL prefix
  if (base === undefined) return _baseURL;
  _baseURL = base;
  return base;
  
};

//~ var isType = function(type, data) {
  //~ if (arguments.length == 1) data = this;
  //~ return Object.prototype.toString.call(data).toLowerCase() == '[object '+type.toLowerCase()+']';
//~ };
//~ var isSomeType = function(types, data) { return types.some(isType, data);  };

var url_for = function (route_name, captures, param) {
  var pattern = routes[route_name];
  if(!pattern) {
    //~ console.log("[angular.appRoutes] Has none route for the name: "+route_name);
    //~ return baseURL()+route_name;
    return undefined;
  }

  if ( captures === undefined ) captures = [];
  if ( !angular.isObject(captures) /*!isSomeType(["object", "array"], captures)*/ ) captures = [captures];
  if ( angular.isArray(captures) /*isType('array', captures)*/ ) {
    var replacer = function () {
      var c =  captures.shift();
      if(c === undefined) c='';
      return c;
    }; 
    pattern = pattern.replace(arr_re, replacer);
  } else {// object
    angular.forEach(captures, function(value, placeholder) {
      var re = new RegExp('[:*]' + placeholder, 'g');
      pattern = pattern.replace(re, value);
    });
    pattern = pattern.replace(/[:*][^/.]+/g, ''); // Clean not replaces placeholders
  }
  
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
};

//~ module

//~ .run(function ($window) {
  //~ $window['angular.'+moduleName] = factory;
//~ })

//~ .factory(moduleName, )

//~ ;

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