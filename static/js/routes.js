(function () {'use strict'; try {
/*
*/

var moduleName = "appRoutes";

try {
  if (angular.module(moduleName)) return;
} catch(err) { /* ok */ }


var module = angular.module(moduleName, []);

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
  
  "номенклатура/список": '/номенклатура/список/:root',
  "тмц/сохранить заявку":'/тмц/заявка/сохранить',
  "тмц/удалить заявку": '/тмц/заявка/удалить',
  "тмц/список заявок":'/тмц/заявки-список-:obj',
  "тмц/снаб/список заявок":'/тмц/снаб/заявки-список/:obj',
  "тмц/снаб/сохранить заявку":'/тмц/снаб/сохранить+заявку',
  "тмц/снаб/адреса отгрузки":'/тмц/снаб/адреса+отгрузки/:contragent_id',
  //~ "тмц/новая заявка":'/тмц/заявка/новая',убрал
  
},
  arr_re = new RegExp('[:*]\\w+', 'g'),
  _baseURL = '';

var baseURL = function  (base) {// set/get base URL prefix
  if (base === undefined) return _baseURL;
  _baseURL = base;
  return base;
  
};

var url_for = function (route_name, captures, param) {
  var pattern = routes[route_name];
  if(!pattern) {
    //~ console.log("[angular.appRoutes] Has none route for the name: "+route_name);
    //~ return baseURL()+route_name;
    return undefined;
  }

  if ( captures === undefined ) captures = [];
  if ( !angular.isObject(captures) ) captures = [captures];
  if ( angular.isArray(captures) ) {
    var replacer = function () {
      var c =  captures.shift();
      if(c === undefined) c='';
      return c;
    }; 
    pattern = pattern.replace(arr_re, replacer);
  } else {
    angular.forEach(captures, function(value, placeholder) {
      var re = new RegExp('[:*]' + placeholder, 'g');
      pattern = pattern.replace(re, value);
    });
    pattern = pattern.replace(/[:*][^/.]+/g, ''); // Clean not replaces placeholders
  }
  
  if ( param === undefined ) return baseURL()+pattern;
  if ( !angular.isObject(param) ) return baseURL()+pattern + '?' + param;
  var query = [];
  angular.forEach(param, function(value, name) {
    if ( angular.isArray(value) ) { angular.forEach(value, function(val) {query.push(name+'='+val);}); }
    else { query.push(name+'='+value); }
  });
  if (!query.length) return baseURL()+pattern;
  return baseURL()+pattern + '?' + query.join('&');
};


var factory = {
  routes: routes,
  baseURL: baseURL,// set/get
  url_for: url_for
};

module

.run(function ($window) {
  $window['angular.'+moduleName] = factory;
})

.factory(moduleName, function () {
  return factory;
})

;

} catch(err) {console.log("Ошибка компиляции маршрутов"+err.stack);}
}());