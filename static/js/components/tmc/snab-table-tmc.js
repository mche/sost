(function () {'use strict';
/*
  
*/

var moduleName = "ТМЦ таблица позиций";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, /*$q,*/ $timeout, /*$http, $element, appRoutes,*/ Util) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.ready = true;
    
    //~ if($ctrl.onAcceptChb) console.log("onAcceptChb", $ctrl.onAcceptChb);
  };
  
  $ctrl.FilterData = function(row){
    var filter = $ctrl.param['фильтр тмц']/* || $ctrl.param['фильтр']*/;
    if(!filter) return !0;
    return filter(row);
    
  };
  
  $ctrl.InitRow = function(row){
    //~ console.log("InitRow", row);
    if($ctrl.param['ТМЦ/крыжик позиций/событие'] && !row.hasOwnProperty('крыжик количества')) row['крыжик количества'] = !!row['количество/принято'];
    
  };
  
  $ctrl.FilterDataAccepted = function(row){///подсчет крыжиков принято
    return !!row['количество/принято'];
    
  }
  
  $ctrl.OnAccept = function(row){/// принятие входящего количества
    var ev = $ctrl.param['ТМЦ/крыжик позиций/событие'];
    if (!ev) return;
    if (!row['крыжик количества'])  row['количество/принято'] = null;
    else if (row['количество/принято'] === undefined || row['количество/принято'] === null) row['количество/принято'] = row['количество'];
    
    $rootScope.$broadcast(ev, row);
    
  };
  
};

/*=============================================================*/

module

.component('tmcSnabTableTmc', {
  templateUrl: "tmc/snab/table/tmc",
  //~ scope: {},
  bindings: {
    data: '<', //массив
    param: '<',
    //~ onAcceptChb: '&', // по крыжику принять 

  },
  controller: Component
})

;

}());