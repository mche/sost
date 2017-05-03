(function () {'use strict';
/*
*/

var moduleName = "ProjectList";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $timeout, $http, $element, appRoutes) {
  var $ctrl = this;
  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param={};
    
    $http.get(appRoutes.url_for('список проектов').then(function(resp){
      if(resp.data.error) $scope.error = resp.data.error;
      else $ctrl.data= resp.data;
      $ctrl.ready = true;
      
    });
    
  };
  
  $ctrl.SelectProject = function(p){
    if($ctrl.onSelectProject) $ctrl.onSelectProject({"p":p});
    
    
  };
  
  $ctrl.NewProject = function(){
    //~ $scope.param["проект/id"] = undefined;
    
  };
  
};

/*=============================================================*/

module

.component('projectList', {
  templateUrl: "project/list",
  scope: {},
  bindings: {
    param: '<',
    onSelectProject: '&',

  },
  controller: Component
})

;

}());