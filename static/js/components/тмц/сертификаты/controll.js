(function () {'use strict';
/*
  Модуль ТМЦ сертификатов
*/

var moduleName = "Серификаты ТМЦ";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/]);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $element, TemplateCache, appRoutes) {
  var ctrl = this;
  var meth = {/*методы Vue*/};
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    //~ $scope.paramObj = {/*"фильтр объектов": ctrl.ParamFilterObj, */"placeholder": 'Указать склад', /*"без проекта": true,*/ };
    TemplateCache.split(appRoutes.url_for('assets', 'тмц/сертификаты.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        $c.vue = new Vue({
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
            //~ 'guard-ware-form': new $КомпонентСпецодеждаФорма(),/// {/*"param": $c.param*/}, $c
          },
        });
      });
    
  };
  
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());