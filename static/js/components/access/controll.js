(function () {'use strict';
/*
  Управление доступом
*/
var moduleName = "Access";

var module = angular.module(moduleName, ['AppTplCache', 'loadTemplateCache',  'appRoutes', 'Users', 'Roles', 'Routes']);//'ngSanitize',

var Controll = function($scope, $timeout, loadTemplateCache, appRoutes){
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
    //~ if($scope.showRoutes) $timeout(function() {
      //~ var list = $('ul.routes');
      //~ var top = list.offset().top+5;
      //~ list.css("height", 'calc(100vh - '+top+'px)');
    //~ });
  }
  
  
};

/*=====================================================================*/

module

.controller('Controll', Controll)

;

}());