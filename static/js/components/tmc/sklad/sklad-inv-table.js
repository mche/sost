(function () {'use strict';
/*
  Таблица инвентаризаций
*/

var moduleName = "ТМЦ список инвентаризаций";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'ТМЦ таблица позиций', 'Номенклатура']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $attrs, $rootScope, /*$q,*/ $timeout, $element, /*$http, appRoutes,*/ Util, $Номенклатура) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$attr = $attrs;
  $scope.extend = angular.extend;
  

  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param = {};
    //~ if(!$ctrl.param['фильтр тмц']) $ctrl.param['фильтр тмц'] = function(){ return !0;};
    
    $ctrl.ready = true;
    
    $timeout(function(){
      $('.show-on-ready', $element[0]).slideDown();
      
    });
    
  };
  
  $ctrl.FilterData = function(item){
    var filter = $ctrl.param['фильтр'];
    if(!filter) return !item._hide;
    return filter(item);
    
  };
  
  $ctrl.OrderByData = function(item){
    return item['дата1'];
  };
  
  var MapTMC = function(row){
    var nomen = this;
    if (!row['номенклатура']) row['номенклатура'] = nomen[row['номенклатура/id']];
    
  };
  $ctrl.InitRow = function(item){
    item['@позиции тмц'].map(MapTMC,  $Номенклатура.$Data());
  };
  
  $ctrl.Edit = function(item){
    //~ if ($ctrl.onEdit) $ctrl.onEdit({item:item});
    $rootScope.$broadcast('Редактировать инвентаризацию ТМЦ', angular.copy(item));
    
  };
  
};
/*********************************************/

module

.component('tmcSkladInvTable', {
  templateUrl: "tmc/sklad/inv/table",
  //~ scope: {},
  bindings: {
    data: '<', //массив
    param: '<',
    onEdit: '&',

  },
  controller: Component
})

;

}());