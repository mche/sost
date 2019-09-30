(function () {'use strict';
/*
*/
var moduleName = "Отчет::Управляющая компания/Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'DateBetween',]);//'ngSanitize',

const Component = function  ($scope, $timeout, $element) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    $ctrl.ready = true;
  };
  
  $ctrl.Refresh = function(){
    if($ctrl.onRefresh) $ctrl.onRefresh();
    
  };

};

/*=====================================================================*/

module

.component('reportFormUk', {
  templateUrl: "отчет упр компания",
  bindings: {
    param: '<',
    onRefresh: '&',
  },
  controller: Component
})

;

})();