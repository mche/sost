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
var moduleName = "название модуля";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module.factory('$Компонент....', function($templateCache) {// factory

const props = {

};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/

}; ///конец методы

const computed = {/*     */

}; ///конец computed

const data = function() {
  let vm = this;

};///  конец data

const mounted = function(){

};/// конец mounted

var $Компонент = {
  props,
  data,
  methods,
  computed,
  //~ created,
  mounted,
  components: {},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('название шаблона');
  return $Компонент;
};

return $Конструктор;

});// конец factory

}());