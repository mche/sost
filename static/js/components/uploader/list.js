(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $UploaderList({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "UploaderList";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['UploaderFile', 'UploaderCommon']);

module.factory('$UploaderList', function(/*$templateCache,*/ $UploaderFile, $UploaderMixins) {// factory

const props = {

};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/

}; ///конец методы

const data = function() {
  let vm = this;

};///  конец data

const computed = {
  fileList () {
    return this.uploader.fileList;
  }
};/// конец computed

let template = parcelRequire('js/c/uploader/list.vue.html');

var $Компонент = {
  //~ props,
  //~ data,
  mixins: [$UploaderMixins.uploader],
  //~ methods,
  computed,
  //~ created,
  //~ mounted,
  components: {},
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ $Компонент.template = $templateCache.get('uploader/list');
  $Компонент.components['uploader-file'] = new $UploaderFile();
  return $Компонент;
};

return $Конструктор;

});// end factory

}());