(function () {'use strict';
/*
  
*/
var moduleName = "Конверты ЗП";
try {angular.module(moduleName); return;} catch(e) { } 
//~ console.log("module Components", angular.module('Components'));

var module = angular.module(moduleName, ['TemplateCache', 'appRoutes', 'Форма раздачи конвертов ЗП' /*'', 'Объекты', 'Util', */]); 

var Controll = function($scope, $timeout, $element, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {

    $scope.param = {};
    

    
    TemplateCache.split(appRoutes.url_for('assets', 'waltex/zp.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        

        
      });
    
  };
  

  
  
};

module.controller('Controll', Controll);

}());