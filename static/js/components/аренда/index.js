(function () {'use strict';
/*
  Модуль аренды
*/

var moduleName = "Аренда";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'Аренда::Объекты::Таблица', 'Аренда::Договоры::Таблица',  'EventBus']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $q, $timeout, $element, /*$http ,*/ appRoutes, TemplateCache,  $КомпонентАрендаОбъектыТаблица, $КомпонентАрендаДоговорыТаблица, $EventBus) {
  var ctrl = this;
  var meth = {/*методы Vue*/};
  
  meth.Mounted = function(){
    var vm = this;
    //~ $EventBus.$on(vm.paramFolder.selectItemEventName, function(data){
      //~ vm.selectedFolder = data;
    //~ });
    
  };
  
  ctrl.$onInit = function(){
    ctrl.param = {};
    TemplateCache.split(appRoutes.url_for('assets', 'аренда.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        $timeout(function(){ ctrl.Vue(); });
      });
    
  };
  
  
  ctrl.Vue = function(){
    ctrl.vue = new Vue({
      "el":  $element[0], //.childNodes[0],
      //~ "delimiters": ['{%', '%}'],
      "data"() {
        return {
          "ready": true,
          "selectedObject": undefined,
          //~ "selected": undefined,
        };
      },
      //~ "computed": comp,
      "methods": meth,
      "mounted"(){
        var vm = this;
        vm.Mounted();
      },
      "components": {
        'v-left-object-table': new $КомпонентАрендаОбъектыТаблица(),/// {/*"param": $c.param*/}, $c
        'v-right-contract-table': new $КомпонентАрендаДоговорыТаблица(),
      },
    });
  };
  
  meth.SelectObject = function(obj){
    //~ console.log("SelectObject", ctrl.data.indexOf(obj));
    this.selectedObject = obj;
  };
  
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());