(function () {'use strict';
/*
*/

var moduleName = "Номенклатура";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes',]);//'ngSanitize',, 'dndLists'

/******************************************************/
var Data  = function($http, appRoutes){
  var cache = {}, data = [], then, $this = {
    Load: function(param){ return then;/*$http.get(appRoutes.url_for('номенклатура/список', param || 0)); */ },
    Refresh: function(param){
      then = $http.get(appRoutes.url_for('номенклатура/список', param || 0)).then(function(resp){
        data.splice(0, data.length);
         Array.prototype.push.apply(data, resp.data);
        return data;
      });
      return $this;
    },
    //~ Load: function(param){ 
      //~ var url = appRoutes.url_for('номенклатура/список', param || 0);
      //~ if (!cache[url]) cache[url] = $http.get(url);
      //~ return cache[url];
    //~ },
    "Список без потомков": function(param){ return $http.get(appRoutes.url_for('номенклатура/список без потомков', param || 0)); /*return $this;*/ },
  };
  return $this.Refresh(0);
  
};

/*=============================================================*/

module

.factory('NomenData', Data)

;

}());