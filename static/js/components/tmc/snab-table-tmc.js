(function () {'use strict';
/*
  
*/

var moduleName = "ТМЦ таблица позиций";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, /*$rootScope, $q,*/ $timeout, /*$http, $element, appRoutes,*/ Util) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $ctrl.$onInit = function(){
    $ctrl.ready = true;
    //~ if($ctrl.onAcceptChb) console.log("onAcceptChb", $ctrl.onAcceptChb);
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