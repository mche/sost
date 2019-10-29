(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентМедколТестФорма({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Медкол::Форма::Теста";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module
.factory('$КомпонентМедколФормаТеста', function($templateCache, $http, $timeout, $КомпонентМедколФормаТестаКрыжикиВопросов/*тут ниже*/ /*, appRoutes*/) {// factory

const props = {
  "item": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "parents": Array,///массив
};

const util = {
/*FilterQuestions(q){/// вопросы этого теста
  return !!q._checked;/// у родительского несвязанного вопроса q['$родительский вопрос/json']
},

FilterQuestionsParent(q){/// вопросы родительского теста
  return !q._checked;///
},

MapQuestions(q){
  if (q.id) q._checked = true;
  if (q['$родительский вопрос/json'] && !q.$parent) q.$parent = JSON.parse(q['$родительский вопрос/json']);
  return q;
},*/

MapTextarea(q){
  return `[${ q['код'] }] ${ q['вопрос'] }\n`+q['ответы'].join('\n');
},
  
};
  
const methods = {/*методы*/

LoadQuestions(){
  var vm = this;
  if (!vm.item.id) return;
  vm.cancelerHttp =  $http.get(location.pathname+'/вопросы-теста/'+vm.item.id)
    .then(function(resp){///прилетает два списка
      vm.cancelerHttp = undefined;
      //~ vm.questions = [...resp.data/*.map(util.MapQuestions)*/];
      vm.myQuestions.push(...resp.data.shift());
      vm.parentQuestions.push(...resp.data.shift());
      //~ vm.form.data = vm.questions.filter(util.FilterQuestions).map(util.MapTextarea).join('\n\n');
      //~ vm.questions.map(vm.MapQuestions);
      vm.form.data = vm.myQuestions.map(util.MapTextarea).join('\n\n');
    });
},

/*MapQuestions(q){
  var vm = this;
  if (q.id && q._checked === undefined) q._checked = true;
  if (q['$родительский вопрос/json'] && !q.$parent) q.$parent = JSON.parse(q['$родительский вопрос/json']);
  if (q._checked) vm.myQuestions.push(q);
  else if (q.$parent) vm.parentQuestions.push(q.$parent);
  else console.error("Странный вопрос", q);
},*/

Save(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(location.pathname+'/сохранить-тест', vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      //~ resp.data.success.parent = (vm.item.parent && vm.item.parent.id) || vm.item.parent;
      //~ vm.$emit('on-save-node', resp.data.success);
      Object.assign(vm.item, resp.data.success);
      //~ if (vm.item.parent) vm.item.parent = vm.item.parent.id || vm.item.parent;
      vm.$emit('on-save-node', vm.item);
    });
},

Valid(){
  return this.form['название'] && this.form['название'].length ;
},

CancelBtn(){
  this.$emit('on-save-node', this.item);///.id ? {"id": this.item.id} : undefined);
  
},

ChangeChb(q){
  var vm = this;
   //~ 
  q._http = $http.post(location.pathname+'/сохранить-вопрос', {"id1":vm.form.id, "id2": q.id})
    .then(function(resp){
      vm.$set(q, '_http', false);
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      var idx = vm.myQuestions.indexOf(q);
      if (idx == -1) {
        vm.myQuestions.push(q);
        vm.parentQuestions.removeOf(q);
      }
      else if (!q._checked) {///
        //~ console.log("ChangeChb", q['ид списка'], vm.form.id);
        if (q['ид списка'] != vm.form.id) {
          vm.myQuestions.removeOf(q);
          vm.parentQuestions.push(q);
        } else {/// свой список
          vm.myQuestions.splice(idx, 1, q); /// передернуть в списке для реактивности
        }
      }
      else vm.myQuestions.splice(idx, 1, q); /// передернуть в списке для реактивности
    },
    function(resp){
      Materialize.toast("Ошибка сохранения крыжика", 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
    );
},
};/// конец методы

/*const computed = {

MyQuestions(){
  return this.questions.filter(util.FilterQuestions);
},

ParentQuestions(){
  return this.questions.filter(util.FilterQuestionsParent)///.map(util.MapQuestions, {"parent": true,});
},
  
};/*конец computed*/

const data = function() {
  let vm = this;
  var form = angular.copy(vm.item);
  form['наименование'] = form['наименование'] || vm.item.title;
  var parent = vm.parents[ vm.parents.length -1];
  form.parent = parent ? parent.id : null;
  if (vm.item.id)  vm.LoadQuestions();
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
    "myQuestions": [],
    "parentQuestions": [],
    };
  //);
};

const mounted = function() {
  var vm = this;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
  });
};

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  data,
  methods,
  //~ computed,
  //~ "created"() {  },
  mounted,
  "components": {},
    //~ 'v-tree': new $КомпонентДеревоСписок(),
  //~ },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('медкол/форма-теста');
  $Компонент.components['q-list'] = new $КомпонентМедколФормаТестаКрыжикиВопросов();
  return $Компонент;
};

return $Конструктор;

}// конец Factory
/**********************************************************************/
)

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
})
;

}());