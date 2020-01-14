(function () {'use strict';
/*
  Модуль 
*/

var moduleName = "Медкол::Результаты::Цепочки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Компонент::Дерево::Список', 'Util']);//'ngSanitize',, 'dndLists'

module.controller('Controll', function  (/*$scope, $q,*/ $timeout, $element, $http, TemplateCache, $КомпонентДеревоСписок, Util, $EventBus) {
var ctrl = this;

$EventBus.$on('Выбрана позиция', function(items){
  //~ console.log("Выбрана позиция", items);
  var vm = ctrl.vue;
  var test = items[items.length-1];
  vm['тест'] = test ? test.id : undefined;
});

var tCache = TemplateCache.split('/assets/medcol/результаты-цепочки.html', 1);

ctrl.$onInit = function(){
  
  
  tCache.then(function(proms){
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
    "тест": undefined,
    //~ "selected": [],
  };
};

//~ const findTestID  = function(t){return this.id == t.id;};

const mounted = function(){
  var vm = this;
  var urlParam = Util.paramFromLocation();
  vm.LoadData().then(function(){
    
    var test_id = urlParam['тест'] && urlParam['тест'][0];
    //~ var test = test_id && vm['тесты'].find(findTestID, {"id": test_id});
    //~ if (test) {
      //~ vm.expanded.unshift(test);
      //~ test.parents_id.map((id) => { vm.expanded.unshift( vm['тесты'].find( findTestID, {"id": id} )); });
    //~ }
    if (test_id) vm['тест'] = test_id;
    
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
      'v-tree-list': new $КомпонентДеревоСписок(/*new $КомпонентМедколФормаТеста()*/),
    },
  });
};
  
})
/*=============================================================*/
;

}());