(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентАрендаДоговорыТаблица({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Аренда::Объекты::Таблица";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Аренда::Объект::Форма' ]);

const Factory = function($templateCache, $http, appRoutes /*$timeout, $rootScope, /**$compile, , Util*/, $КомпонентАрендаОбъектФорма ) {// factory
  
let meth = {/*методы*/};
let comp = {/* computed */};

meth.Ready = function(){/// метод
  var vm = this;
  vm.LoadData().then(function(){
    vm.ready = true;
  });
};
meth.LoadData = function(){
  var vm = this;
  return $http.get(appRoutes.urlFor('аренда/объекты/список'))
    .then(function(resp){
      vm.data = resp.data;
    });
};
meth.SelectObject = function(obj){
  this.selectedObject = obj;
  this.$emit('select-object', obj);
};

comp.FilteredData = function(){
  return this.data;
  
};

var $Компонент = {
  //~ "props": [''],
  "data"() {
    //~ console.log("on data item", this.item);
    let vm = this;
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "data": undefined,
      "newObject": undefined,
      "selectedObject": undefined,
      };
    //);
  },
  "methods": meth,
  "computed":comp,
  //~ "created"() {  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Ready();
  },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('аренда/объекты/таблица');
  $Компонент.components = {'v-rent-object-form': new $КомпонентАрендаОбъектФорма(), };

  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентАрендаОбъектыТаблица"', Factory);

}());