(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $UploaderDrop({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "UploaderDrop";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['UploaderCommon']);

module.factory('$UploaderDrop', function($templateCache, $UploaderMixins) {// factory

const props = {
};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/
onDragEnter () {
  this.dropClass = 'uploader-dragover';
},
onDragLeave () {
  this.dropClass = '';
},
onDrop () {
  this.dropClass = 'uploader-droped';
},
}; ///конец методы

const data = function() {
  let vm = this;
  return {
    dropClass: '',
  };
};///  конец data

const mounted = function(){
  this.$nextTick(() => {
    const dropEle = this.$refs.drop;
    const uploader = this.uploader.uploader;
    uploader.assignDrop(dropEle);
    uploader.on('dragenter', this.onDragEnter);
    uploader.on('dragleave', this.onDragLeave);
    uploader.on('drop', this.onDrop);
  });
};/// конец mounted

const beforeDestroy = function() {
  const dropEle = this.$refs.drop;
  const uploader = this.uploader.uploader;
  uploader.off('dragenter', this.onDragEnter);
  uploader.off('dragleave', this.onDragLeave);
  uploader.off('drop', this.onDrop);
  uploader.unAssignDrop(dropEle);
};

let template = parcelRequire('js/c/uploader/drop.vue.html');

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  props,
  mixins: [$UploaderMixins.uploader, $UploaderMixins.support],
  data,
  methods,
  /*"computed": {
    "edit": function(){
      return this.InitItem(angular.copy(this.item));
    }
  },*/
  //~ "created"() {  },
  mounted,
  beforeDestroy,
  //~ "components": {},
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  //~ $Компонент.template = $templateCache.get('uploader/drop');
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

});
/**********************************************************************/


}());