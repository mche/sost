(function () {'use strict';
/*
  Модуль 
*/

var moduleName = "Отпуск";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Util', 'Компонент::Сотрудники'/*'EventBus', */ ]);

module.controller('Controll', function  (/*$scope, $q,$timeout, */ $element, appRoutes,  /*$http ,*/ TemplateCache,  Util, $КомпонентСотрудники /*$EventBus,*/) {
  var ctrl = this;
  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'отпуск.html'), 1);
  
  ctrl.$onInit = function(){
    tCache.then(function(){
      ctrl.ready = true;
      ctrl.Vue();
    });
    
  };
  
  var urlParam = Util.paramFromLocation();
  
  const data = function(){
    var vm = this;
    return {
      "ready": true,
      "param": {},
    };
  };
  
  const mounted = function(){
    var vm = this;
    
  };
  
  const methods = {
    ToggleDate(){
      
    },
  };
  
  ctrl.Vue = function(){
    var el = $element[0];
    ctrl.vue = new Vue({
      el,
      data,
      methods,
      mounted,
      "components": {
        'v-profiles': new $КомпонентСотрудники(),
      },
    });
    
  };
  
});

}());