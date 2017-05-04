(function () {'use strict';
/*
*/

var moduleName = "MoneyWork";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'CategoryItem', 'WalletItem', 'MoneyTable', 'ProjectList']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, $window, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    $ctrl.ready= true;
  };
  
};

/*=============================================================*/

module

.component('moneyWork', {
  templateUrl: "money/work",
  //~ scope: {},
  bindings: {
    param: '<',
  },
  controller: Component
})

;

}());