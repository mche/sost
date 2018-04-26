(function () {'use strict';
/*
  Контроллер модуля Staff/Сотрудники
*/
var moduleName = "Staff::Сотрудники";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'loadTemplateCache',  'appRoutes', 'Users', 'Roles',]);//'ngSanitize',

var Controll = function($scope, $timeout, loadTemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {
      "URLs": {
        "roles": 'кадры/сотрудники/роли',
        "saveRole": null,
        "removeRole": null,
        "profiles": 'кадры/профили',
        "profileRoles": 'кадры/роли профиля',
        "profileRoutes": null,
        "uploadProfiles": null,
        "saveProfile": 'кадры/сохранить профиль',
        "saveRef": 'кадры/сохранить связь',
      },
      
    };
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'staff/emp.html'), 1)///'assets', 'staff/сотрудники.html'
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