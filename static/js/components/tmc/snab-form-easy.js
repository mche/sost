(function () {'use strict';
/*
  Форма простой обработки снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ/простая форма снабжения";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'TreeItem',  'Util', 'Номенклатура',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $timeout, $http, $element, $q, appRoutes, Util, NomenData) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    if (!$ctrl.param) $ctrl.param = {};
    
    $ctrl.ready = true;
  };
  
};

/*=============================================================*/

module

.component('tmcSnabFormEasy', {
  templateUrl: "tmc/snab/form-easy",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',

  },
  controller: Component
})

;

}());