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

module
.factory('$КомпонентТМЦСертификатыОбъекты', function($templateCache,  /*$timeout, $http, $rootScope, /**$compile, appRoutes, Util*/ ) {// factory

const props = ['pData'];

const data = function() {
  //~ console.log("on data item", this.item);
  let vm = this;
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "selectedObject": undefined,
    };
  //);
};
  
const methods = {
SelectObject(obj){
  if (this.selectedObject === obj) this.selectedObject = undefined;
  else this.selectedObject = obj;
  this.$emit('select-object', this.selectedObject);
},
  
};/*методы*/

const mounted = function(){
  var vm = this;
  vm.ready = true;
  //~ $timeout(function(){
  //~ });
  
};

var $Компонент = {
  props,
  data,
  //~ computed,
 methods,
  //~ "created"() {  },
  mounted,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  if (!$Компонент.template) $Компонент.template = $templateCache.get('тмц/сертификаты/объекты');
  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());