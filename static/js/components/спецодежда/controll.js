(function () {'use strict';
/*
  
*/
var moduleName = "Спецодежда";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Спецодежда::Сотрудники']);//'ngSanitize',

const Controll = function($scope, $timeout, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    TemplateCache.split(appRoutes.url_for('assets', 'спецодежда.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };

  
  
};

/*=====================================================================*/

module
  .controller('Controll', Controll)

;

}());