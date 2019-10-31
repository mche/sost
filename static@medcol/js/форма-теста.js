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
var moduleName = "Медкол::Форма::Теста";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Медкол::Форма::Теста::Вопросы']);

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

MapTextarea(q){
  return `[${ q['код'] }]`+/*такая хрень с пробелом*/` ${ q['вопрос'] }\n`+q['ответы'].join('\n');
},

FilterCheckedQuestion(q){
  return !!q._checked;
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
      //~ vm.textQuestions = vm.myQuestions.map(util.MapTextarea).join('\n\n');
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
    },
    function(resp){
      Materialize.toast("Ошибка сохранения: "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
    );
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
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
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
      Materialize.toast("Ошибка сохранения крыжика: "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
    );
},

CopyQuestions(){
  var vm = this;
  var copy = copyTextToClipboard(vm.myQuestions.map(util.MapTextarea).join('\n\n'));
  var success = function(msg){
    Materialize.toast('Скопировано! ', 2000, 'left green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
  };
  if (copy.then) copy.then(success);
  if (copy == 'success') success(copy);
  console.log('CopyQuestions', copy);
},
};/// конец методы

const computed = {

//~ MyQuestions(){
  //~ return this.questions.filter(util.FilterQuestions);
//~ },

//~ ParentQuestions(){
  //~ return this.questions.filter(util.FilterQuestionsParent)///.map(util.MapQuestions, {"parent": true,});
//~ },

TextQuestions(){
  return this.myQuestions.filter(util.FilterCheckedQuestion).map(util.MapTextarea).join('\n\n');
},
  
};/*конец computed*/

const data = function() {
  let vm = this;
  var form = angular.copy(vm.item);
  form['наименование'] = form['наименование'] || vm.item.title;
  var parent = vm.parents[ vm.parents.length -1];
  form.parent = parent ? parent.id : null;
  form.data = '';
  if (vm.item.id)  vm.LoadQuestions();
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
    "myQuestions": [],
    "parentQuestions": [],
    //~ "textQuestions": '',
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
  computed,
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
);

}());