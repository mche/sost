(function () {'use strict';
/*
  Управление доступом
*/
var moduleName = "Access";

var module = angular.module(moduleName, ['AppTplCache', 'loadTemplateCache',  'appRoutes', 'Users', 'Roles', 'Routes']);//'ngSanitize',

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'admin/access.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  ctrl.ShowRoutes = function(){
    $scope.showRoutes = !$scope.showRoutes;
  }
  
  
};

/*=====================================================================*/

module

.controller('Controll', Controll)

;

}());