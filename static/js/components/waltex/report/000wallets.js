(function () {'use strict';
/*
*/

var moduleName = "ReportTableWallets";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  
  $scope.parseInt = parseInt;
  
  $ctrl.$onInit = function(){
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      $timeout(function(){$('.modal', $($element[0])).modal();});
    });
    
  };
  
  $ctrl.LoadData = function(){
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('данные отчета ДС/все кошельки'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          return;
        }
        $ctrl.data = resp.data;
        
      });
    
  };
  
};

/*=============================================================*/

module

.component('reportTableWallets', {
  templateUrl: "report/table/wallets",
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());