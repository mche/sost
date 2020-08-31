!(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $Компонент...({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Проекты::Список";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module
.factory('$КомпонентПроектыСписок', function($templateCache, $ПроектыДанные) {// factory

const props = {
  //~ "project":Object,
  //~ "param": {
    //~ type: Object,
    //~ default: function () {
      //~ return {};
    //~ },
  //~ },
  
};

const methods = {
LoadData(){
  let vm = this;
  $ПроектыДанные.Load().then(()=>{
    vm.data.push(...$ПроектыДанные.Data());
    if (vm.project && vm.project.id) vm.project = vm.data.filter((it)=>vm.project.id == it.id)[0];
    vm.ready = true;
  });
  
},

SelectProject(p){
  if (this.project === p) return;
  this.project = p;
  this.$emit('on-select-project', this.project);
},
  
};///конец methods

const  data = function(){
  this.LoadData();
  return {
    "ready": false,
    "data": [],
    "project": undefined, /// тек проект/таб
    //~ "selectedProject": undefined,
    };
};///конец data

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  //~ store,
  methods,
  //~ computed,
  //~ "created"() {  },
  //~ mounted,
  "components": { },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('проекты/список');
  //~ $Компонент.components['v-contragent'] =  new $КомпонентКонтрагент();
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end Factory
/**********************************************************************/

/******************************************************/
module.factory("$ПроектыДанные", function($Список, appRoutes){
  //~ var data = $http.get();
  return new $Список(appRoutes.url_for('список проектов'));
});

}());