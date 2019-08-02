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
var moduleName = "ТМЦ::Сертификаты::Форма::Папки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

const Factory = function($templateCache, $http, $timeout, appRoutes) {// factory

let meth = {/*методы*/};
meth.Ready = function(){/// метод
  var vm = this;

  vm.ready = true;
  $timeout(function(){
    $('input[type="text"]', $(vm.$el)).first().focus();
  });
};

meth.Save = function(){
  var vm = this;
  
  vm.cancelerHttp =  $http.post(appRoutes.urlFor('тмц/сертификаты/сохранить папку'), vm.form)
    .then(function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      Materialize.toast('Сохранено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      resp.data.success.parent = (vm.item.parent && vm.item.parent.id) || vm.item.parent;
      vm.$emit('on-save-node', resp.data.success);
    });
};

meth.Valid = function(){
  
  return this.form['наименование'] && this.form['наименование'].length ;
};

meth.CancelBtn = function(){
  this.$emit('on-save-node', this.item.id ? {"id": this.item.id} : undefined);
  
};


var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  "props": {
      "item": {
        type: Object,
        default: function () {
          return {};
        },
      },
    },
  "data"() {
    let vm = this;
    var form = angular.copy(vm.item);
    form['наименование'] = form['наименование'] || vm.item.title;
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "cancelerHttp": undefined,
      "form": form,
      };
    //);
  },
  "methods": meth,
  /*"computed": {
    "edit": function(){
      return this.InitItem(angular.copy(this.item));
    }
  },*/
  "created"() {
  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Ready();
  },
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

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентТМЦСертификатыФормаПапки', Factory);

}());