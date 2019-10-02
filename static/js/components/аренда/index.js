(function () {'use strict';
/*
  Модуль аренды
*/

var moduleName = "Аренда";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'Аренда::Объекты::Таблица', 'Аренда::Договоры::Таблица',  'EventBus']);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  ($scope, $q, $timeout, $element, /*$http ,*/ appRoutes, TemplateCache,  $КомпонентАрендаОбъектыТаблица, $КомпонентАрендаДоговорыТаблица, $EventBus) {
  var ctrl = this;

  const mounted = function(){
    var vm = this;
    $EventBus.$on('$КомпонентАрендаОбъектыТаблица - готов', function(){
      vm.$set(vm.ready, '$КомпонентАрендаОбъектыТаблица', true);
    });
    $EventBus.$on('$КомпонентАрендаДоговорыТаблица - готов', function(){
      vm.$set(vm.ready, '$КомпонентАрендаДоговорыТаблица', true);
    });
  };

  
  ctrl.$onInit = function(){
    ctrl.param = {};
    TemplateCache.split(appRoutes.urlFor('assets', 'аренда.html'), 1)
      .then(function(proms){
        //~ ctrl.ready= true;
        $timeout(function(){ ctrl.Vue(); });
      });
    
  };
  
  const methods = {/*методы Vue*/
    SelectObject(obj){
      this.selectedObject = obj;
    },
/***
три режима двух колонок:
1 - только левая
2 - обе 
3 - только правая
***/
    ToggleColumn1(name){/// левая колонка
      var vm = this;
      //~ if (vm.param.colMode == 1) vm.param.colMode++;
      //~ else if (vm.param.colMode == 2) vm.param.colMode--;
      //~ else if (vm.param.colMode == 3) vm.param.colMode--;
      if (vm.param.col1 == name && vm.param.col2) {
        vm.param._col2 = vm.param.col2;
        vm.param.col2 = '';
      }
      else if (vm.param.col1 == name) vm.param.col2 = vm.param._col2;
      vm.param.col1 = name;
    },
    ToggleColumn2(name){/// правая колонка
      var vm = this;
      //~ if (vm.param.colMode == 1) vm.param.colMode++;
      //~ else if (vm.param.colMode == 2) vm.param.colMode++;
      //~ else if (vm.param.colMode == 3) vm.param.colMode--;
      if (vm.param.col2 == name && vm.param.col1) {
        vm.param._col1 = vm.param.col1;
        vm.param.col1 = '';
      }
      else if (vm.param.col2  == name) vm.param.col1 = vm.param._col1;
      vm.param.col2 = name;
    },
  };
  
  const data = function() {
    return {
      "ready": {},
      "selectedObject": undefined,
      "param":{
        "col1": 'объекты',/// отображение колонок
        "col2": 'договоры',/// отображение колонок
      },
      //~ "selected": undefined,
    };
  };
  
  ctrl.Vue = function(){
    ctrl.vue = new Vue({
      "el":  $element[0], //.childNodes[0],
      //~ "delimiters": ['{%', '%}'],
      data,
      //~ "computed": comp,
      methods,
      mounted,

      "components": {
        'v-left-object-table': new $КомпонентАрендаОбъектыТаблица(),/// {/*"param": $c.param*/}, $c
        'v-right-contract-table': new $КомпонентАрендаДоговорыТаблица(),
      },
    });
  };
  

  
}

/*=============================================================*/

)

;

}());