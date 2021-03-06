(function () {'use strict';
/*
  Модуль аренды
*/

var moduleName = "Аренда";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'Аренда::Объекты::Таблица', 'Аренда::Договоры::Таблица',  'EventBus', 'Отчет::Аренда/Форма','ReportTable', 'ProjectList']);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, /*$http ,*/ appRoutes, TemplateCache,  $КомпонентАрендаОбъектыТаблица, $КомпонентАрендаДоговорыТаблица, $EventBus) {
  var ctrl = this;

  //~ const mounted = function(){
    //~ var vm = this;
    
  //~ };
  
  $EventBus.$on('$КомпонентАрендаОбъектыТаблица - готов', function(){
    //~ vm.$set(vm.ready, '$КомпонентАрендаОбъектыТаблица', true);
    ctrl.ready[ '$КомпонентАрендаОбъектыТаблица'] = true;
  });
  $EventBus.$on('$КомпонентАрендаДоговорыТаблица - готов', function(){
    //~ vm.$set(vm.ready, '$КомпонентАрендаДоговорыТаблица', true);
    ctrl.ready['$КомпонентАрендаДоговорыТаблица'] = true;
  });

  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'аренда.html'), 1);
  
  tCache.then(function(proms){
    //~ $timeout(function(){ ctrl.Vue(); });
    ctrl.Vue(); 
    ctrl.ready  = {};
    ctrl.ready['АрендаОтчет'] = true;
  });
  
  ctrl.$onInit = function(){
    ctrl.col1 = 'объекты';/// отображение колонок
    ctrl.col2 = 'договоры';/// отображение колонок
    ctrl.param = {
      /// параметры формы отчета
      "дата": {"values":[dateFns.startOfMonth(new Date()), dateFns.endOfMonth(new Date())], "margin":"0"},
      "интервал": 'YYYYmm/TMMon YY',
      "ready": false,
      /// параметры таблицы отчета
      "urlFor":{
        "данные отчета ДС": 'аренда/данные отчета ДС',
        "строка отчета ДС": 'аренда/строка отчета ДС',
      },
      "проект":{"id":0},"кошелек":{"без сохранения":true,"проект":{"id":0,"ready":true},"title":""},"кошелек2":{"без сохранения":true,"title":""},"контрагент":{"без сохранения":true},"профиль":{},"объект":{"проект":{"id":0,"ready":true}},"все проекты":true,"место интервалов":"столбцы","все контрагенты":true,"все кошельки":false,"все кошельки2":false,"все профили":false,"все объекты":false,"все пустое движение":false,
    };
    
  };
  
const methods = {/*методы*/
Vue(){
  new Vue(Object.assign(new $КомпонентАрендаОбъектыТаблица(), {"el": document.getElementById('тут компонент объекты'),}));
  new Vue(Object.assign(new $КомпонентАрендаДоговорыТаблица(), {"el": document.getElementById('тут компонент договоры'),}));
},
  
/***
три режима двух колонок:
1 - только левая
2 - обе 
3 - только правая
***/
ToggleColumn1(name){/// левая колонка
  //~ var vm = this;
  //~ console.log("ToggleColumn1", this);
  if ((ctrl.col1 == name && ctrl.col2) || name == 'отчет') {
    ctrl._col2 = ctrl.col2;
    ctrl.col2 = '';
  }
  else if (ctrl.col1 == name) ctrl.col2 = ctrl._col2;
  ctrl.col1 = name;
},
ToggleColumn2(name){/// правая колонка
  //~ var ctrl = this;
  if (ctrl.col2 == name && ctrl.col1) {
    ctrl._col1 = ctrl.col1;
    ctrl.col1 = '';
  }
  else if (ctrl.col2  == name) ctrl.col1 = ctrl._col1;
  ctrl.col2 = name;
},

SelectProject(p){
  
  //~ ctrl.param["проект"] = undefined;
  //~ ['кошелек', /*'объект'*/].map(function(name){
    //~ $scope.param[name]["проект"].ready = false;
    //~ $scope.param[name].id = undefined;
    //~ $scope.param[name].title = '';
    
    $timeout(function(){
      //~ ctrl.param["проект"] = p || 0; // 0 - все проекты
      if (p) ctrl.param['проект'].id = p.id;
      else ctrl.param['проект'].id = 0;
      ctrl.param['проект'].ready = true;
    });
  //~ });
  
  //~ if(!p) return;
  
},

RefreshReport(){
  ctrl.param.ready = false;
  $timeout(function(){
    ctrl.param.ready = true;
  });
  
},
};/* конец methods*/
  
  Object.assign(ctrl, methods);
  
}

/*=============================================================*/

)

;

}());