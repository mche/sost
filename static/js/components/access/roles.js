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
    
    if ($ctrl.level === undefined) $ctrl.level = 0;
    if ($ctrl.parent === undefined) $ctrl.parent = {"id": null};//!!!
    
    if (!$ctrl.data) $ctrl.LoadData().then(function(){
      $ctrl.ready = true;
      
    });
    else $timeout(function() {$ctrl.ready = true;});
    
  };
  
  
  $ctrl.LoadData = function (){
    
    return $http.get(appRoutes.url_for('список ролей'))
      .then(function(resp){
        $ctrl.data = resp.data;
      });
    
  };
  
  $ctrl.filterParent = function(item){
    var len = item.parents_id.length;
    if (!len) return false;
    return item.parents_id[len-1] === $ctrl.parent.id;
    
  };
  
  $ctrl.ToggleSelect = function(item, $event){
    
    
  };
  
  $ctrl.ExpandIf = function(item){
    return true;
    
  };
  
  
};

/*=====================================================================*/

module

.component('rolesList', {
  templateUrl: "roles/list",
  //~ scope: {},
  bindings: {
    param: '<', // 
    data: '<', //
    level: '<', // текущий уровень дерева 0,1,2.... по умочанию верний - нулевой
    parent: '<', 

  },
  controller: Controll
})

;

}());