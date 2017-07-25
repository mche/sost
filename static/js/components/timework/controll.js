(function () {'use strict';
/*
  Табель рабочего времени
*/
var moduleName = "TimeWork";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'loadTemplateCache',  'appRoutes', 'TimeWorkForm']);//'ngSanitize',

var Controll = function($scope, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'timework/form.html'), 1)
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