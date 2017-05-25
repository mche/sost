(function () {'use strict';
/*
  Роли для доступа
  Список
  Выбор позиции
  Добавление
  Изменение
  Удаление
*/
var moduleName = "Roles";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',

var Controll = function($scope, $http, $timeout, appRoutes){
  var $ctrl = this;
  
  $ctrl.$onInit = function() {
    
    $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      
    });
    
  };
  
  
  $ctrl.LoadData = function (){
    
    return $http.get(appRoutes.url_for('список ролей'))
      .then(function(resp){
        $ctrl.data = resp.data;
      });
    
  };
  
  
};

/*=====================================================================*/

module

.component('rolesList', {
  templateUrl: "roles/list",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Controll
})

;

}());