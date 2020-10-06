(function () {'use strict';
/*
*/

//~ var moduleNameS = ['Контрагенты'];///Контрагенты
//~ var moduleName = moduleNameS.filter(function(name){
  //~ try{ if (angular.module(name)) return false; } // имя занято
  //~ catch(err) { /* нет такого модуля */ return true; } // свободно
//~ });
//~ if (!moduleName.length) return;// все имена заняты

var moduleName = 'Контрагенты';
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'EventBus',]);//'ngSanitize',, 'dndLists'


/*var Data1  = function($http,  appRoutes){////*$timeout,
  const SortData = (a, b) => {
    if (!!a['проект/id'] && !b['проект/id']) { return -1; }
    if (!a['проект/id'] && !!b['проект/id']) { return 1; }
    if (a.title.toLowerCase() > b.title.toLowerCase()) { return 1; }
    if (a.title.toLowerCase() < b.title.toLowerCase()) { return -1; }
    return 0;
  };
  var then, $data = {}, data = [],///хэш и массив
    //~ addr = {},//кэш по адресам
    $this = {
    "Load": function() {return then;},
    "RefreshData": function(param={}){
      then = undefined;
      data.splice(0, data.length);
      for (var prop in $data) { if ($data.hasOwnProperty(prop)) { delete $data[prop]; } }///только такая очистка хэша
      //~ $timeout(function(){
        then = $http.get(param.url || appRoutes.urlFor('список контрагентов')).then(function(resp){
          //~ Array.prototype.push.apply(data, resp.data);
          data.push(...resp.data.sort(SortData));
          return data;
      });
      return $this;
    },
    "$Data": function(){///хэш
      if (Object.keys($data).length === 0 ) data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $data);
      return $data;
    },
    "Data": function(){///массив
      return data;
    },
  };
  return $this.RefreshData();
  
};
*/
var Data  = function(/*$http, $timeout,*/ appRoutes, $Список, $EventBus){
  let loader = new $Список(appRoutes.urlFor('список контрагентов'));
  
  const re_OOO = /(^|\s)(?:ип|ооо|зао|оао)($|\s)/gi; /// \b не работает
  //~ const re2 = /[^ \-\w\u0400-\u04FF]/gi;
  const re_trash = /[^ \.\-\w\u0400-\u04FF]/gi;
  const re_space2 = / {2,}/g;
  
  loader.OnLoadSort = (a, b) => {
    if (!a._match) a._match = a.title.toLowerCase().replace(re_trash, '').replace(re_OOO, '').replace(re_space2, ' ').trim()+' '+(a['АТИ']||'');
    if (!b._match) b._match = b.title.toLowerCase().replace(re_trash, '').replace(re_OOO, '').replace(re_space2, ' ').trim()+' '+(b['АТИ']||'');
    
    if (!!a['проект/id'] && !b['проект/id']) { return -1; }
    if (!a['проект/id'] && !!b['проект/id']) { return 1; }
    if (a._match > b._match) { return 1; }
    if (a._match < b._match) { return -1; }
    return 0;
  };
  
  loader.RefreshData = function(){
    loader.Clear().Load();
  };
  loader.Load();
  
  $EventBus.$on('Дайте список контрагентов', function(cb){/// этому компоненту эти данные не нужны, но он корневой
    cb(loader);
  });
  
  $EventBus.$on('Обновите список контрагентов', function(){/// этому компоненту эти данные не нужны, но он корневой
    loader.Clear().Load();
  });
  
  return loader;
};

/*=============================================================*/

module
.factory("$Контрагенты", Data)

;

//~ moduleName.map(function(name){
    //~ var mod = angular.module(name, ['appRoutes']);
    //~ moduleNameS.map(function(n){ mod.factory(n, Data); });// все комбинации сервисов
  
//~ });

}());