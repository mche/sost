(function () {'use strict';
/*
  Модуль ТМЦ сертификатов
*/

var moduleName = "Серификаты ТМЦ";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'ТМЦ::Сертификаты::Объекты', 'ТМЦ::Сертификаты::Закупки', 'ТМЦ::Сертификаты::Папки']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $element, TemplateCache, appRoutes, $КомпонентТМЦСертификатыОбъекты, $КомпонентТМЦСертификатыЗакупки, $КомпонентТМЦСертификатыПапки) {
  var ctrl = this;
  var meth = {/*методы Vue*/};
  
  ctrl.$onInit = function(){
    TemplateCache.split(appRoutes.url_for('assets', 'тмц/сертификаты.html'), 1)
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
          };
        },
        "methods": meth,
        "mounted"(){
          var vm = this;
        },
        "components": {
          'v-left-objects': new $КомпонентТМЦСертификатыОбъекты(),/// {/*"param": $c.param*/}, $c
          'v-center-zakup': new $КомпонентТМЦСертификатыЗакупки(),
          'v-right-folders': new $КомпонентТМЦСертификатыПапки(),
        },
      });
    
  };
  
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());