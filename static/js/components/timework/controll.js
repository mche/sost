(function () {'use strict';
/*
  Табель рабочего времени
*/
var moduleName = "TimeWork";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'TemplateCache',  'appRoutes', 'TimeWorkForm']);//'ngSanitize',

var Controll = function($scope, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    TemplateCache.config('debug', false).split(appRoutes.url_for('assets', 'timework/form.html'), 1)
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