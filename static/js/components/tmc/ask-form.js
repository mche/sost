(function () {'use strict';
/*
*/

var moduleName = "TMC-Ask-Form";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'NomenItem']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  $ctrl.$onInit = function(){
    if(!$ctrl.param) $ctrl.param = {};
    $ctrl.ready = true;
    
  };
  $ctrl.New = function(){
    //~ delete $ctrl.ask;
    //~ $timeout(function(){ 
      $ctrl.ask = {"позиции":[{"номенклатура":{}}, {"номенклатура":{}}]}; //});
    
  };
  $ctrl.Cancel = function(){
     delete $ctrl.ask;
    
  };
  
  $ctrl.Save = function(ask){
    if(!ask) return $ctrl.ask["позиции"].filter(function(row){ return (row["номенклатура"] && row["номенклатура"].selectedItem && row["номенклатура"].selectedItem.id) && row["количество"]; }).length;
    console.log("Save", ask);
  };

  
};

/*=============================================================*/

module

.component('tmcAskForm', {
  templateUrl: "tmc/ask/form",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());