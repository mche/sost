(function () {'use strict';
/*
*/

var moduleName = "Номенклатура";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes',]);//'ngSanitize',, 'dndLists'

/******************************************************/
var Data  = function($http, appRoutes){
  var cache = {};
  var $this = {
    Load: function(param){ return $http.get(appRoutes.url_for('номенклатура/список', param || 0)); /*return $this;*/ },
    //~ Load: function(param){ 
      //~ var url = appRoutes.url_for('номенклатура/список', param || 0);
      //~ if (!cache[url]) cache[url] = $http.get(url);
      //~ return cache[url];
    //~ },
    "Список без потомков": function(param){ return $http.get(appRoutes.url_for('номенклатура/список без потомков', param || 0)); /*return $this;*/ },
  };
  return $this;//.RefreshObjects();
  
};

/*=============================================================*/

module

.factory('NomenData', Data)

;

}());