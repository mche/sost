(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $UploaderFiles({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "UploaderFiles";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['UploaderFile', 'UploaderCommon']);

module.factory('$UploaderFiles', function($templateCache, $UploaderFile, $UploaderMixins) {// factory

const props = {

};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/

}; ///конец методы

const data = function() {
  let vm = this;

};///  конец data

const mounted = function(){

};/// конец mounted

const computed = {
  files () {
    return this.uploader.files;
  }
};

let template = parcelRequire('js/c/uploader/files.vue.html');

var $Компонент = {
  //~ props,
  //~ data,
  //~ methods,
  mixins: [$UploaderMixins.uploader],
  computed,
  //~ created,
  //~ mounted,
  "components": {},
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ $Компонент.template = $templateCache.get('uploader/files');
  $Компонент.components['uploader-file'] = new $UploaderFile();
  return $Компонент;
};

return $Конструктор;

});// end factory

}());