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

//~ const computed = {

//~ Questions(){
  //~ return this.inputFilter ? this.questions.filter(this.FilterQuestions) : this.questions;
//~ },
  
//~ };

const methods = {

MapQuestions(q){
  q._filter =`[${ q['код'] }]`+/*такая хрень с пробелом*/` ${ q['вопрос'] }\n`+q['ответы'].join('\n');
  q._filter = q._filter.toLowerCase();
  return q;
},
  
FilterQuestions(q){
  return this.inputFilter ? q._filter.indexOf(this.inputFilter.toLowerCase()) >= 0 : true;
},
  
ChangeChb(q){
  var vm = this;
   //~ console.log("ChangeChb", q);
  vm.$emit('on-checkbox', q);
},

InputFilter(){
  var vm = this;
  if (!vm.questions || !vm.questions.length) return;
  if (!vm.questions[0]._filter) vm.questions.map(vm.MapQuestions);///один разок
  //~ else console.log(vm.inputFilter, vm.questions);
  if (vm.inputFilter) vm.questionsFiltered = [...vm.questions.filter(vm.FilterQuestions/*, {"query": vm.inputFilter}*/)];
  else  vm.questionsFiltered = [...vm.questions];
},

ItemTitle(q){
  return q['ответы'].map((a,i)=>{ return (i ? '-- ' : '+ ')+a; }).join("\r\n");
},

};

const data = function(){
  var vm = this;
  vm.inputFilter = '';
  return {
    "questionsFiltered":vm.questions,
  };
  
};

const created = function(){
  this.InputFilter = debounce(this.InputFilter, 550);
  
};

var $Компонент = {
  props,
  data,
  methods,
  //~ computed,
  created,
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