(function () {'use strict';
/*
  Модуль 
*/

var moduleName = "Медкол::АдминкаТестов";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Компонент::Дерево::Список', 'Медкол::Тест::Форма']);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, /*$http ,*/ TemplateCache, $КомпонентДеревоСписок, $КомпонентМедколТестФорма /*$EventBus*/) {
var ctrl = this;

ctrl.$onInit = function(){
  
  TemplateCache.split('/assets/medcol/форма-тестов.html', 1)
    .then(function(proms){
      //~ ctrl.Vue(); 
    });
  
};
  
const methods = {/*методы*/

SubmitDown(){
  $(this.$el).submit();
  
},

};/* конец methods*/
  
const data = function() {
  return {
  };
};

const components = {
  'v-tree': new $КомпонентДеревоСписок(new $КомпонентМедколТестФорма()),
};

ctrl.Vue = function(){
  ctrl.vue = new Vue({
    "el":  $element[0],
    data,
    methods,
    //~ mounted,
    components,
  });
  //~ new Vue(Object.assign(new $КомпонентАрендаОбъектыТаблица(), {"el": document.getElementById('тут компонент объекты'),}));
  //~ new Vue(Object.assign(new $КомпонентАрендаДоговорыТаблица(), {"el": document.getElementById('тут компонент договоры'),}));
};
  
})
/*=============================================================*/
;

}());