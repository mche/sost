(function () {'use strict';
/*
  
*/
var moduleName = "Спецодежда";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Спецодежда::Сотрудники', 'Спецодежда::Таблица']);//'ngSanitize',

const Controll = function($scope, $element, $timeout, TemplateCache, appRoutes, $КомпонентСпецодеждаСотрудники, $КомпонентСпецодеждаТаблица){
  var ctrl = this;
  var meth = {/*методы Vue*/};
  
  ctrl.$onInit = function() {
    
    TemplateCache.split(appRoutes.url_for('assets', 'спецодежда.html'), 1)
      .then(function(proms){
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
        "methods": meth,
        "mounted"(){ },
        "components": {
          'v-profiles-list': new $КомпонентСпецодеждаСотрудники(),
          'v-guard-ware': new $КомпонентСпецодеждаТаблица(),
        },
      });
    
  };

  
  
};

/*=====================================================================*/

module
  .controller('Controll', Controll)

;

}());