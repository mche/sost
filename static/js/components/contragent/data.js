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
var module = angular.module(moduleName, ['appRoutes',]);//'ngSanitize',, 'dndLists'


var Data  = function($http, /*$timeout,*/ appRoutes){
  var then, $data = {}, data = [],///хэш и массив
    //~ addr = {},//кэш по адресам
    $this = {
    "Load": function() {return then;},
    "RefreshData": function(){
      then = undefined;
      data.splice(0, data.length);
      for (var prop in $data) { if ($data.hasOwnProperty(prop)) { delete $data[prop]; } }///только такая очистка хэша
      //~ $timeout(function(){
        then = $http.get(appRoutes.url_for('список контрагентов')).then(function(resp){
          Array.prototype.push.apply(data, resp.data);
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

/*=============================================================*/

module
.factory("$Контрагенты", Data)

;

//~ moduleName.map(function(name){
    //~ var mod = angular.module(name, ['appRoutes']);
    //~ moduleNameS.map(function(n){ mod.factory(n, Data); });// все комбинации сервисов
  
//~ });

}());