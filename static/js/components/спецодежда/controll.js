(function () {'use strict';
/*
  
*/
var moduleName = "Спецодежда";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Компонент::Сотрудники', 'Спецодежда::Таблица']);//'ngSanitize',

module
  .controller('Controll', function($scope, $element, $timeout, TemplateCache, appRoutes, $КомпонентСотрудники, $КомпонентСпецодеждаТаблица){
  var ctrl = this;
  //~ var meth = {/*методы Vue*/};
  
  var tCache = TemplateCache.split(appRoutes.url_for('assets', 'спецодежда.html'), 1);
  
  ctrl.$onInit = function() {
    
    tCache.then(function(proms){
        ctrl.ready= true;
        ctrl.Vue();
      });
    
  };
  
  ctrl.Vue = function(){
    ctrl.vue = new Vue({
      "el":  $element[0], //.childNodes[0],
      //~ "delimiters": ['{%', '%}'],
      "data"() {
          return {
            "ready": true,
            "param": {},
          };
        },
        //~ "methods": meth,
        //~ "mounted"(){ },
        "components": {
          'v-profiles': new $КомпонентСотрудники(),
          'v-guard-ware': new $КомпонентСпецодеждаТаблица(),
        },
      });
    
  };

  
  
});


}());