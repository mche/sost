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
  
  //~ "поиск категории": 'js/c/category/search.json',
  //~ "дерево категорий": 'js/c/category/tree.json',
  "категории/дерево и поиск":'/category/data',
  "список кошельков": '/wallet/data/:project',
  "список контрагентов": '/contragent/data',
  "список проектов": '/project/list',
  "сохранить проект": '/project/save',
  
  "сохранить движение ДС":'/waltex/money/save',
  "строка движения ДС":'/waltex/money/data/:id',
  "удалить запись движения ДС":'/waltex/money/delete/:id',
  "список движения ДС": '/waltex/money/list/:project',
  
  "данные отчета ДС": '/waltex/report/data',
  "строка отчета ДС": '/waltex/report/row',
  
  //~ "данные отчета ДС/все кошельки": '/waltex/report/data/wallets',
  //~ "строка отчета ДС/все кошельки": '/waltex/report/row/wallets',
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