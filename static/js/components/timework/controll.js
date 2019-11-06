(function () {'use strict';
/*
  Табель рабочего времени
*/
var moduleName = "TimeWork";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache',  'appRoutes', 'TimeWorkForm']);//'ngSanitize',

var Controll = function($scope, TemplateCache, appRoutes){
  var ctrl = this;
  
  var tCache = TemplateCache.config('debug', false).split(appRoutes.url_for('assets', 'timework/form.html'), 1);
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    
    tCache.then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

/*=====================================================================*/

module

.controller('Controll', Controll)

;

}());