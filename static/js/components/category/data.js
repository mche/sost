(function () {'use strict';
/*
*/

var moduleName = "Категории";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'Util']);//'ngSanitize',, 'dndLists'

/******************************************************/
const Data  = function($Список, appRoutes){
  var data = {};
  return {
    "Data": function(parentId){
      //~ console.log("$Категории", data);
      if (!data[parentId]) data[parentId] =  new $Список(appRoutes.url_for('категории/список', parentId));
      return data[parentId];
     
    },
    "Clear": function(parentId){
      delete data[parentId];
    },
  };
};

/*=============================================================*/

module

.factory('$Категории', Data)
//~ .factory(moduleName, Data)//нельзя разные объекты

;

}());