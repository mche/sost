(function () {'use strict';
/*
  Модуль 
*/

var moduleName = "Отпуск";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'Util', 'Компонент::Сотрудники', 'Компонент::Отпуск::Календарь', /*'EventBus', */ ]);

module.controller('Controll', function  (/*$scope, $q,$timeout, */ $element, appRoutes,  /*$http ,*/ TemplateCache,  Util, $EventBus, $КомпонентСотрудники, $КомпонентОтпускКалендарь /**/) {
  var ctrl = this;
  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'отпуск.html'), 1);
  
  ctrl.$onInit = function(){
    tCache.then(function(){
      ctrl.ready = true;
      ctrl.Vue();
    });
    
  };
  
  var urlParam = Util.paramFromLocation();
  
  $EventBus.$on("Выбран сотрудник"/*+(select ? '' : ' снята')*/, function(profile){
    //~ console.log("Выбран сотрудник", profile);
    ctrl.vue.selectedProfile = profile;
    
  });
  
  const data = function(){
    var vm = this;
    return {
      "ready": true,
      "param": {},
      "selectedProfile": undefined,
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
        'rest-calendar': new $КомпонентОтпускКалендарь(),
      },
    });
    
  };
  
});

}());