(function () {
'use strict';
/*
По таблице "показ телефонов"
*/
  
var moduleName = "tel-show-list";

var Controll = function ($scope, States) {
  var $ctrl = this; 
  //~ $ctrl.$attrs = $attrs;
  $scope.States = States;
  
  $ctrl.$onInit = function () {
    $ctrl.param = $ctrl.param || {};
    $ctrl.ready = true;
    
  };
  
  //~ $ctrl.SplitIconClass = function(it){
    //~ return States.SplitIconClass(it.result);
    
  //~ };
  
};


angular.module(moduleName, ['States'])

.component('telShowList', {
  templateUrl: "tel/show-list",
  bindings: {
    data: '<',// массив списка показов телефонов
    param: '<', // skipTel: true - не показывать номер тел (когда он один и уже указан)
  },
  controller: Controll
})
;

}());