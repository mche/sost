(function () {
'use strict';
/*
*/
  
var moduleName = "States";
var module = angular.module(moduleName);

module
.component('statesIcon', {
  templateUrl: "states/icon",
  bindings: {
    code:'<'//код состояния
  },
  controller: function($scope, States){
    var $ctrl = this;
    $scope.States = States;
    
    $ctrl.$onInit = function(){
      $ctrl.ready = true;
      
    };
    
  }
})
;
}());