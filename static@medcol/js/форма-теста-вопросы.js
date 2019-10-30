(function () {'use strict';
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
var moduleName = "Медкол::Форма::Теста::Вопросы";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module
.factory('$КомпонентМедколФормаТестаКрыжикиВопросов', function($templateCache /*, appRoutes*/) {// factory

const props = {
  "questions": Array,
  
};

const computed = {

Questions(){
  return this.questions;
},
  
};

const methods = {

ChangeChb(q){
  var vm = this;
   //~ console.log("ChangeChb", q);
  vm.$emit('on-checkbox', q);
},

};

const data = function(){
  var vm = this;
  return {
    //~ "list": [...vm.questions],
  };
  
};

var $Компонент = {
  props,
  data,
  methods,
  computed,
  //~ "created"() {  },
  //~ mounted,
  //~ "components": {},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('медкол/форма-теста/крыжики вопросов');
  return $Компонент;
};

return $Конструктор;
});

}());