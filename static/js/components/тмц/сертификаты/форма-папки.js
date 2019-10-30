(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентТМЦСертификатыФормаПапки({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "ТМЦ::Сертификаты::Папка::Форма";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module
.factory('$КомпонентТМЦСертификатыПапкаФорма', function($templateCache, $http, $timeout, appRoutes) {// factory

const props = {
  "item": {
    type: Object,
    default: function () {
      return {};
    },
  },
  "parents": Array,///массив
};
  
const methods = {/*методы*/

Save(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('тмц/сертификаты/сохранить папку'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      //~ resp.data.success.parent = (vm.item.parent && vm.item.parent.id) || vm.item.parent;
      
      Object.assign(vm.item, resp.data.success);
      //~ if (vm.item.parent) vm.item.parent = vm.item.parent.id || vm.item.parent;
      vm.$emit('on-save-node', vm.item);
    });
},

Valid(){
  return this.form.title && this.form.title.length ;
},

CancelBtn(){
  this.$emit('on-save-node', this.item);///.id ? {"id": this.item.id} : undefined);
  
},
};/// конец методы

const data = function() {
  let vm = this;
  var form = angular.copy(vm.item);
  //~ form['наименование'] = form['наименование'] || vm.item.title;
  var parent = vm.parents[ vm.parents.length -1];
  form.parent = parent ? parent.id : null;
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "cancelerHttp": undefined,
    "form": form,
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
  //~ "created"() {  },
  mounted,
  //~ "components": {
    //~ 'v-tree': new $КомпонентДеревоСписок(),
  //~ },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('тмц/сертификаты/форма папки');
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

}// конец Factory
/**********************************************************************/
);

}());