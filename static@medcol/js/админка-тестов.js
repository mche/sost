(function () {'use strict';
/*
  Модуль 
*/

var moduleName = "Медкол::АдминкаТестов";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Компонент::Дерево::Список', 'Медкол::Форма::Теста']);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, $http , TemplateCache, $КомпонентДеревоСписок, $КомпонентМедколФормаТеста, $EventBus) {
var ctrl = this;

$EventBus.$on('Выбрана позиция', function(item){
  //~ console.log("Выбрана позиция", item)
  
});
  
ctrl.$onInit = function(){
  
  TemplateCache.split('/assets/medcol/форма-тестов.html', 1)
    .then(function(proms){
      ctrl.Vue(); 
    });
  
};
  
const methods = {/*методы*/

LoadData(){
  var vm = this;
  return $http.get('/тесты/структура').then(function(resp){
    vm['тесты'] = [...resp.data];
    
    
  },
  
  )
  
},

SubmitDown(){
  $(this.$el).submit();
  
},

};/* конец methods*/
  
const data = function() {
  return {
    "ready": false,
  };
};

const mounted = function(){
  var vm = this;
  vm.LoadData().then(function(){
    vm.ready = true;
  });
  
};


ctrl.Vue = function(){
  ctrl.vue = new Vue({
    "el":  $element[0],
    data,
    methods,
    mounted,
    components:  {
      'v-tree-list': new $КомпонентДеревоСписок(new $КомпонентМедколФормаТеста()),
    },
  });
};
  
})
/*=============================================================*/
;

}());