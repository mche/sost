(function () {'use strict';
/*
*/

var moduleName = "ReportTableRow";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
    
    //~ });
    $ctrl.LoadData().then(function(){$ctrl.ready = true;});
    
  };
  
  $ctrl.LoadData = function(){
    return $http.post(appRoutes.url_for('строка отчета ДС'), $ctrl.param).then(function(resp){
      if(resp.data.error) {
        $ctrl.error = resp.data.error;
        return;
      }
      $ctrl.data = resp.data;
      
    });
    
  };
  
  $ctrl.Expand = function(sign) {
    
    
  };
  
};

/*=============================================================*/

module

.component('reportRow', {
  templateUrl: "report/row",
  //~ scope: {},
  bindings: {
    param: '<',
    //~ level: '<',

  },
  controller: Component
})

;

}());