(function () {'use strict';
/*
  Форма табеля рабочего времени
*/

var moduleName = "TimeWorkForm";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);

var Component = function($scope,  $element, $timeout, $http, $q, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    $ctrl.LoadData()
      .then(function(){
        $ctrl.ready=true;
        
      });
    
    
  };
  
  $ctrl.LoadData = function(){
    return $http.get(appRoutes.url_for('табель рабочего времени/объекты и сотрудники'))
      .then(function(resp){
        $ctrl.data = resp.data;
        
      });
    
  };
  
};

/*==========================================================*/
module

.component('timeWorkForm', {
  templateUrl: "time/work/form",
  bindings: {
    data: '<',
    param: '<', 
  },
  controller: Component
})

;

}());