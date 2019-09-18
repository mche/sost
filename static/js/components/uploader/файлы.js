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
var moduleName = "Uploader::Файлы";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Uploader']);

module.factory('$КомпонентФайлы', function($templateCache, appRoutes, $Uploader) {// factory

const props = {
  "uploads": {
    type: Array,
    default: [],
  },
  "parentId": {
    type: Number,
  },
};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/
InitUploader(){
  var vm = this;
  vm.uploader = {
    "options": {
      //~ target: '//localhost:3000/upload', // '//jsonplaceholder.typicode.com/posts/',
      "target": appRoutes.urlFor('выгрузить файл'),
      testChunks: false,
      "chunkSize": 10*1024*1024, ///The size in bytes of each uploaded chunk of data. The last uploaded chunk will be at least this size and up to two the size, see Issue #51 for details and reasons. (Default: 1*1024*1024
      "generateUniqueIdentifier": function(){ return Math.random().toString().match(/(\d{2,})/)[0]; },
      "processParams": function (params, file) {/// патчил simple-uploader.js вызов с двумя параметрами
        //~ params.identifier
        //~ console.log('processParams', arguments);///, vm._uploader.files.find(function(f){ return f.uniqueIdentifier == params.identifier; })
        //~ params.foo = 'bar';
        params.lastModified = file.file.lastModified;
        if (vm.parentId) params.parentId = vm.parentId;
        return params;
      },
    },
    //~ attrs: {
      //~ accept: 'image/*',
    //~ },
    statusText: {
      success: 'Успешно сохранено',
      error: 'Ошибка загрузки',
      uploading: 'Загружается...',
      paused: 'Остановлено',
      waiting: 'Ожидание',
    },
  };
},
//~ UploaderComplete () {
  //~ console.log('complete', arguments);
//~ },
//~ FileComplete () {
  //~ console.log('file complete', arguments);
//~ },
FileAdded(file){
  //~ this._uploader = this._uploader || file.uploader;
  //~ console.log('file added', file);
},
FileSuccess (rootFile, file, message, chunk) {
/***
https://github.com/simple-uploader/Uploader#events
.fileSuccess(rootFile, file, message, chunk) A specific file was completed. First argument rootFile is the root Uploader.File instance which contains or equal the completed file, second argument file argument is instance of Uploader.File too, it's the current completed file object, third argument message contains server response. Response is always a string. Fourth argument chunk is instance of Uploader.Chunk. You can get response status by accessing xhr object chunk.xhr.status.
***/
  var vm = this;
    console.log('file success: ', /*file.uploader.fileList.indexOf(file), никогда*/ file.uploader.files.indexOf(file), file.uploader.fileList.indexOf(rootFile) /*file.uploader.files.indexOf(rootFile) никогда*/, rootFile === file || rootFile/*.files.indexOf(file) */, file.uploader);
  //если удалять из завершенного прогреса
  var isSingleFile = rootFile === file; /*один файл, а нет - папка*/
  file.uploader.files.removeOf(file); ///только один файл
  file.uploader.fileList.removeOf(rootFile); ///если была вся папка (когда все файлы загрузятся)
  
  var resp = JSON.parse(message);
  if (resp.success) {
    //~ resp.success['размер'] = Uploader.utils.formatSize(resp.success.size).replace(/bytes/, 'Б').replace(/KB/, 'КБ').replace(/MB/, 'МБ').replace(/GB/, 'ГБ');
    resp.success._file = file;/// типа признак свежей загрузки
    if (resp.success['$last_modified/json']) resp.success.$last_modified = JSON.parse(resp.success['$last_modified/json']);
    delete resp.success['$last_modified/json'];
    vm.expandUploads = true;
    setTimeout(function(){
      $('.uploader-drop', $(vm.$el)).get(0).scrollIntoView();
      vm.uploads.push(resp.success);///props
      vm.dataUploads.push(resp.success);
    });
    Materialize.toast("Сохранено успешно", 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp fast');
    
  }
  
},
Size(file){
  return Uploader.utils.formatSize(file.size).replace(/bytes/, 'б').replace(/KB/, 'Кб').replace(/MB/, 'Мб').replace(/GB/, 'Гб');
},
ConfirmRemove(file){
  var vm = this;
  vm.confirmFile = file;
  $('#modal-confirm-remove', $(vm.$el)).modal('open');
},
Remove(file){
  var vm = this;
  console.log("Remove", file);
  vm.confirmFile = undefined;
  
},
}; ///конец методы

const data = function() {
  let vm = this;
  vm.InitUploader();
  return {
    dataUploads: [...vm.uploads],
    expandUploads: false,
    confirmFile: undefined,
  };
};///  конец data

const mounted = function(){
  var vm = this;
  this.$nextTick(() => {
    //~ window.uploader = this.$refs.uploader.uploader;
    console.log('$nextTick', $('.modal', $(vm.$el)).modal());
  });
};/// конец mounted

var $Компонент = {
  props,
  data,
  methods,
  //~ computed,
  //~ created,
  mounted,
  components: {},
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  $Компонент.template = $templateCache.get('uploader/файлы');
  $Компонент.components['v-uploader'] = new $Uploader();
  return $Компонент;
};

return $Конструктор;

});// end factory

}());