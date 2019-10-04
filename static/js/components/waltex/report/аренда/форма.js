(function () {'use strict';
/*
*/
var moduleName = "Отчет::Аренда/Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'DateBetween',]);//'ngSanitize',

const Component = function  (/*$scope,*/ $timeout/*, $element*/) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    
    if (!$ctrl.param) $ctrl.param = {};
    $timeout(()=>{$ctrl.ready = true;});
    
  };
  
  $ctrl.Refresh = function(){
    if($ctrl.onRefresh) $ctrl.onRefresh();
    
  };

};

/*=====================================================================*/

module

.component('reportForm', {
  templateUrl: "отчет/аренда/форма",
  bindings: {
    param: '<',
    onRefresh: '&',
  },
  controller: Component
})

;

})();