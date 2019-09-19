(function () {'use strict';
/*
  Модуль аренды
*/

var moduleName = "Аренда";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'Аренда::Объекты::Таблица', 'Аренда::Договоры::Таблица',  /*'EventBus'*/]);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $q, $timeout, $element, /*$http ,*/ appRoutes, TemplateCache,  $КомпонентАрендаОбъектыТаблица, $КомпонентАрендаДоговорыТаблица, /*$EventBus*/) {
  var ctrl = this;

  
  ctrl.$onInit = function(){
    ctrl.param = {};
    TemplateCache.split(appRoutes.urlFor('assets', 'аренда.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        $timeout(function(){ ctrl.Vue(); });
      });
    
  };
  
  const methods = {/*методы Vue*/
    Ready(){
      var vm = this;
      //~ $EventBus.$on(vm.paramFolder.selectItemEventName, function(data){
        //~ vm.selectedFolder = data;
      //~ });
      
    },
    SelectObject(obj){
      this.selectedObject = obj;
    },
/***
три режима двух колонок:
1 - только левая
2 - обе 
3 - только правая
***/
    ToggleColumn1(){/// колонка объектов
      var vm = this;
      if (vm.param.colMode == 1) console.log('на две колонки', vm.param.colMode++);
      else if (vm.param.colMode == 2) console.log('только левая колонка', vm.param.colMode--);
      else if (vm.param.colMode == 3) console.log('на две колонки', vm.param.colMode--);
      
    },
    ToggleColumn2(){/// колонка договоров
      var vm = this;
      if (vm.param.colMode == 1) vm.param.colMode++;
      else if (vm.param.colMode == 2) vm.param.colMode++;
      else if (vm.param.colMode == 3) vm.param.colMode--;
      
    },
  };
  
  ctrl.Vue = function(){
    ctrl.vue = new Vue({
      "el":  $element[0], //.childNodes[0],
      //~ "delimiters": ['{%', '%}'],
      "data"() {
        return {
          "ready": true,
          "selectedObject": undefined,
          "param":{
            "colMode":2,/// отображение колонок
          },
          //~ "selected": undefined,
        };
      },
      //~ "computed": comp,
      methods,
      "mounted"(){
        var vm = this;
        vm.Ready();
      },
      "components": {
        'v-left-object-table': new $КомпонентАрендаОбъектыТаблица(),/// {/*"param": $c.param*/}, $c
        'v-right-contract-table': new $КомпонентАрендаДоговорыТаблица(),
      },
    });
  };
  

  
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());