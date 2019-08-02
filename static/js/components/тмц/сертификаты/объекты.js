(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентТМЦСертификатыОбъекты({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "ТМЦ::Сертификаты::Объекты";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

const Factory = function($templateCache,  /*$timeout, $http, $rootScope, /**$compile,*/ appRoutes, Util) {// factory
  
let meth = {/*методы*/};
meth.Ready = function(){/// метод
  var vm = this;
  vm.ready = true;
  //~ $timeout(function(){
  //~ });
};
meth.SelectObject = function(obj){
  this.selectedObject = obj;
  this.$emit('select-object', obj);
};

var $Компонент = {
  "props": ['pData'],
  "data"() {
    //~ console.log("on data item", this.item);
    let vm = this;
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
      "ready": false,
      "selectedObject": undefined,
      };
    //);
  },
  "computed":{
    //~ "data"(){
      //~ return this.data;
    //~ },
  },
  "methods": meth,
  "created"() {
  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Ready();
  },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('тмц/сертификаты/объекты');

  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентТМЦСертификатыОбъекты', Factory);

}());