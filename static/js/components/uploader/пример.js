(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $UploaderFile({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Uploader пример";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Uploader']);

module.factory('$КомпонентФайлов', function($templateCache, $Uploader) {// factory

const props = {

};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/
  Complete () {
    console.log('complete', arguments);
  },
  FileComplete () {
    console.log('file complete', arguments);
  },
}; ///конец методы

const data = function() {
  let vm = this;
  return {
    options: {
      target: '//localhost:3000/upload', // '//jsonplaceholder.typicode.com/posts/',
      testChunks: false
    },
    attrs: {
      accept: 'image/*'
    },
    statusText: {
      success: 'Успешно сохранено',
      error: 'Ошибка загрузки',
      uploading: 'Загружается...',
      paused: 'Остановлено',
      waiting: 'Ожидание'
    }
  };
};///  конец data

const mounted = function(){
  this.$nextTick(() => {
    window.uploader = this.$refs.uploader.uploader;
  });
};/// конец mounted

var $Компонент = {
  //~ props,
  data,
  methods,
  //~ computed,
  //~ created,
  mounted,
  components: {},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('uploader/пример');
  $Компонент.components['v-uploader'] = new $Uploader();
  return $Компонент;
};

return $Конструктор;

});// end factory

}());