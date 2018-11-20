(function () {'use strict';
/*
  Универсальная таблица позиций ТМЦ
*/

var moduleName = "ТМЦ таблица позиций";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, /*$q,*/ $timeout, /*$http, $element, appRoutes,*/ Util) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $c.$onInit = function(){
    if(!$c.param) $c.param = {};
    $c.ready = true;
    
    //~ if($c.onAcceptChb) console.log("onAcceptChb", $c.onAcceptChb);
  };
  
  $c.InitTable = function(){
    $c.dataFiltered = $c.data.filter($c.FilterData);
    
  };
  
  $c.FilterData = function(row){
    var filter = $c.param['фильтр тмц']/* || $c.param['фильтр']*/;
    if(!filter) return !0;
    return filter(row);
    
  };
  
  $c.InitRow = function(row){
    //~ console.log("InitRow", row);
    if($c.param['ТМЦ/крыжик позиций/событие'] && !row.hasOwnProperty('крыжик количества')) row['крыжик количества'] = !!row['количество/принято'];
    
  };
  
  $c.FilterDataAccepted = function(row){///подсчет крыжиков принято
    return !!row['количество/принято'];
    
  };
  
  $c.OnAccept = function(row){/// принятие входящего количества
    var ev = $c.param['ТМЦ/крыжик позиций/событие'];
    if (!ev) return;
    if (!row['крыжик количества'])  row['количество/принято'] = null;
    else if (row['количество/принято'] === undefined || row['количество/принято'] === null) row['количество/принято'] = row['количество'];
    
    $rootScope.$broadcast(ev, row);
    
  };
  
};

/*=============================================================*/

module

.component('tmcSnabTableTmc', {
  controllerAs: '$c',
  templateUrl: "tmc/snab/table/tmc",
  //~ scope: {},
  bindings: {
    data: '<', ///массив
    doc: '<', /// шапка
    param: '<',
    //~ onAcceptChb: '&', // по крыжику принять 

  },
  controller: Component
})

;

}());