(function () {'use strict';
/*
*/

var moduleName = "ContragentData";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes',]);//'ngSanitize',, 'dndLists'


var Data  = function($http, /*$timeout,*/ appRoutes){
  var then, $data = {}, data = [],///хэш и массив
    //~ addr = {},//кэш по адресам
    $this = {
    "Load": function() {return then;},
    "RefreshData": function(){
      then = undefined;
      //~ $timeout(function(){
        then = $http.get(appRoutes.url_for('список контрагентов')).then(function(resp){
          data.splice(0, data.length);
          //~ $data = {};
          for (var prop in $data) { if ($data.hasOwnProperty(prop)) { delete $data[prop]; } }///только такая очистка хэша
          Array.prototype.push.apply(data, resp.data);
          //~ resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $data);
        //~ });
        
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

.factory("ContragentData", Data)

;

}());