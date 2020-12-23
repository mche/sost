(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $UploaderBtn({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "UploaderBtn";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['UploaderCommon']);

module.factory('$UploaderBtn', function($templateCache, $UploaderMixins) {// factory

const props = {
  directory: {
    type: Boolean,
    default: false
  },
  single: {
    type: Boolean,
    default: false
  },
  attrs: {
    type: Object,
    default () {
      return {}
    }
  }
};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/
Click(){
  /*** ничего @click.stop!!! ***/
}
}; ///конец методы

const data = function() {
  let vm = this;

};///  конец data

const mounted = function(){
  this.$nextTick(() => {
    this.uploader.uploader.assignBrowse(this.$refs.btn, this.directory, this.single, this.attrs)
  });
};/// конец mounted

let template = parcelRequire('js/c/uploader/btn.vue.html');

var $Компонент = {
  props,
  //~ data,
  mixins: [$UploaderMixins.uploader, $UploaderMixins.support],
  methods,
  //~ computed,
  //~ created,
  mounted,
  //~ components,
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  //~ $Компонент.template = $templateCache.get('uploader/btn');
  
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});// end factory

}());