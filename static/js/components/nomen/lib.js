(function () {'use strict';
/*
*/

var moduleName = "Номенклатура";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes',]);//'ngSanitize',, 'dndLists'

/******************************************************/
var Data  = function($http, appRoutes){
  var cache = {}, data = [], $data = {}, then, $this = {
    "Load": function(){ return then;/*$http.get(appRoutes.url_for('номенклатура/список', param || 0)); */ },
    "Refresh": function(param){
      then = $http.get(appRoutes.url_for('номенклатура/список', param || 0)).then(function(resp){
        data.splice(0, data.length);
        for (var prop in $data) { if ($data.hasOwnProperty(prop)) { delete $data[prop]; } }///только такая очистка хэша
         Array.prototype.push.apply(data, resp.data);
        return data;
      });
      return $this;
    },
    "Data": function(){///массив
      return data;
    },
    "$Data": function(){///из массива хэш
      if (Object.keys($data).length === 0 ) data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $data);
      //~ console.log("Nomen $Data", )
      return $data;
    },
    //~ Load: function(param){ 
      //~ var url = appRoutes.url_for('номенклатура/список', param || 0);
      //~ if (!cache[url]) cache[url] = $http.get(url);
      //~ return cache[url];
    //~ },
    
    "@Список без потомков": [],///по идее функция возвращает список
    "Список без потомков/загружено": function(){ return $this['_Список без потомков/загружено']; },///then
    "Список без потомков/обновить": function(param){
      $this['_Список без потомков/загружено'] = $http.get(appRoutes.url_for('номенклатура/список без потомков', param || 0)).then(function(resp){
        $this['@Список без потомков'].splice(0, $this['@Список без потомков'].length);
        Array.prototype.push.apply($this['@Список без потомков'], resp.data);
        return resp.data;
      });
      return $this;
    },
  };
  return $this.Refresh(0);
  
};

/*=============================================================*/

module

.factory('$Номенклатура', Data)
//~ .factory(moduleName, Data)//нельзя разные объекты

;

}());