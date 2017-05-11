(function () {'use strict';
/*
*/

var moduleName = "ReportTable";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'ReportTableRow']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
    
    //~ });
    $ctrl.LoadData().then(function(){$ctrl.ready = true;});
    
  };
  
  $ctrl.LoadData = function(){
    return $http.post(appRoutes.url_for('данные отчета ДС', $ctrl.param['проект'].id), $ctrl.param).then(function(resp){
      if(resp.data.error) {
        $ctrl.error = resp.data.error;
        return;
      }
      $ctrl.data = resp.data;
      
    });
    
  };
  
  $ctrl.ToggleExpand = function(sign) {
    
    
  };
  
};

/*=============================================================*/

module

.component('reportTable', {
  templateUrl: "report/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());