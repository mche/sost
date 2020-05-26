(function () {'use strict';
/*
  Управление доступом
*/
var moduleName = "Access";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache',  'Users', 'Roles', 'Routes']);//'ngSanitize', 'appRoutes',

const Controll = function($scope, $timeout, TemplateCache, appRoutes){
  var ctrl = this;
  
  var tCache = TemplateCache.split(appRoutes.url_for('assets', 'admin/access.html'), 1);
  
  ctrl.$onInit = function() {
    
    $scope.param = {
      "URLs": {
        "доп. сотрудники": 'доступ/доп. сотрудники',
        "SQL": 'админка/выполнить SQL',
      },
      
    };
    
    
    tCache.then(function(proms){
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