(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентФайлы({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Uploader::Файлы";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Uploader']);

module.factory('$КомпонентФайлы', function($http, $templateCache, $window, appRoutes, $AppUser, $Uploader) {// factory

const props = {
  //~ "uploads": {
    //~ type: Array,
    //~ default: [],
  //~ },
  "parent": {
    type: Object,
  },
};/// конец props

const util = {/*разное*/

}; ///конец util

const methods = {/*методы*/

Uploads(){///список сохраненных файлов
  var vm = this;
  return $http.get(appRoutes.urlFor('файлы', [vm.parent.id])).then(
    function(resp){
      vm.uploads.splice(0);
      vm.uploads.push(...resp.data);
      //~ vm.parent._uploads.splice(0);
      //~ vm.parent._uploads.push(...resp.data);
      vm.ready = true;
    },
    function(){
      Materialize.toast('Ошибка получения файлов', 10000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
  );
},
  
InitUploader(){
  var vm = this;
  vm.uploader = {
    "options": {/*** https://github.com/simple-uploader/vue-uploader#props ***/
      //~ target: '//localhost:3000/upload', // '//jsonplaceholder.typicode.com/posts/',
      "target": appRoutes.urlFor('выгрузить файл'),
      testChunks: false,
      "simultaneousUploads": 1, //// default 3
      "chunkSize": 5*1024*1024, ///The size in bytes of each uploaded chunk of data. The last uploaded chunk will be at least this size and up to two the size, see Issue #51 for details and reasons. (Default: 1*1024*1024
      "generateUniqueIdentifier": function(){ return Math.random().toString().match(/(\d{2,})/)[0]; },
      "processParams": function (params, file) {/// патчил simple-uploader.js вызов с двумя параметрами
        //~ params.identifier
        //~ console.log('processParams', arguments);///, vm._uploader.files.find(function(f){ return f.uniqueIdentifier == params.identifier; })
        //~ params.foo = 'bar';
        params.lastModified = file.file.lastModified;
        if (vm.parent.id) params.parent_id = vm.parent.id;
        return params;
      },
      "parseTimeRemaining": function (timeRemaining, parsedTimeRemaining) {
        return parsedTimeRemaining
          .replace(/\syears?/, 'л.')
          .replace(/\days?/, 'дн.')
          .replace(/\shours?/, 'час.')
          .replace(/\sminutes?/, 'мин.')
          .replace(/\sseconds?/, 'сек.');
      }
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
    if (resp.success['$ts/json']) resp.success.$ts = JSON.parse(resp.success['$ts/json']);
    delete resp.success['$last_modified/json'];
    vm.expandUploads = true;
    setTimeout(function(){
      $('.uploader-drop', $(vm.$el)).get(0).scrollIntoView({ "block": 'start', "behavior": 'smooth', });
      vm.uploads.push(resp.success);///props
      //~ vm.parent._uploads.push(resp.success);
      console.log("Save file", resp.success);
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
  //~ console.log("Remove", file);
  vm.cancelerHttp = $http.post(appRoutes.urlFor('удалить файлы'), [file.id]).then(
    function(resp){
      vm.cancelerHttp = undefined;
      if (resp.data.error) return Materialize.toast(resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      resp.data.map(function(r){
        if (r.error) return Materialize.toast(r.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        else {
          Materialize.toast('Удалено успешно', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
          vm.uploads.removeOf(file);///props
          //~ vm.parent._uploads.removeOf(file);
        }
      });
      //~ vm.$emit('on-', resp.data.success);
    },
    function(resp){
      //~ console.log("Ошибка сохранения", resp);
      Materialize.toast("Ошибка удаления файла "+resp.status+" - "+ resp.statusText, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
      vm.cancelerHttp = undefined;
    }
  
  );
  vm.confirmFile = undefined;
  
},

FileAttachment(file){///скачивание файла
  $window.location.href = appRoutes.url_for('файл-прикрепление', file.sha1);
},

ViewIframe(file){///посмотр тут
  var vm = this;
  var iframe = {"src": appRoutes.urlFor('файл-инлайн', [file.sha1]), "height": parseInt(window.innerHeight*0.8)/*modal max-height:90%;*/, "width": window.innerWidth, "content_type": file.content_type, "timeouts":[]};
  if (vm.iframeFile) {
    vm.iframeFile = undefined;
    setTimeout(function(){ vm.iframeFile = iframe; });
  } else 
    vm.iframeFile = iframe;

  iframe.timeouts.push(setTimeout(vm.CallbackWaitIframeLoad, 100));
    
    //~ setTimeout(function(){
      //~ var iframe = vm.$el.getElementsByTagName('iframe')[0];
      //~ iframe.onload = function() {
        //~ console.log( "iframe onload", iframe.contentWindow.document.URL );
      //~ };
      //~ iframe.contentWindow.onload = function() {
        //~ console.log( "iframe contentWindow onload", iframe.contentWindow.document.URL );
      //~ };
    //~ });
    
  //~ });
},

CallbackWaitIframeLoad(){
  var vm = this;
  var iframe = vm.$el.getElementsByTagName('iframe')[0];
  if (!iframe) return console.log("CallbackWaitIframeLoad просмотр закрыт");
  if (vm.iframeFile.timeouts.length > 30 /* 30*100 мсек = 300 сек общее ожидание вызова просмотра*/) return console.log("CallbackWaitIframeLoad нет просмотра по timeouts");
  if (!iframe.contentDocument || iframe.contentDocument.URL/*contentWindow.document.URL*/ != 'about:blank') return $('#modal-view-in-iframe', $(vm.$el)).modal('open');
  //~ console.log("CallbackWaitIframeLoad следующий timeout", 
  vm.iframeFile.timeouts.push(setTimeout(vm.CallbackWaitIframeLoad, 100));
  //~ console.log("CallbackWaitIframeLoad", iframe.contentDocument.URL == 'about:blank', iframe.contentWindow.document);
  //~ $('#modal-view-in-iframe', $(vm.$el)).modal('open');
},

//~ IframeLoad(){
  //~ console.log('IframeLoad');
//~ },

ModalComplete(){
  //~ console.log("ModalClose", this);
  this.confirmFile = undefined;
  this.iframeFile = undefined;
  
},

ClickStop(){
  /*** ничего @click.stop!!! ***/
},

}; ///конец методы

const computed = {

UploadsLen(){
  return this.uploads.length;
  
},
  
};

const data = function() {
  let vm = this;
  if (!vm.parent._uploads) vm.parent._uploads = [];
  //~ if (!vm.parent._uploads.length)
  vm.Uploads();///загрузить
  vm.InitUploader();
  vm.$AppUser = $AppUser;
  return {
    //~ dataUploads: [...vm.uploads],
    ready: /*vm.parent._uploads.length ? true : */false,
    uploads: vm.parent._uploads,
    expandUploads: false,
    confirmFile: undefined,
    iframeFile: undefined,
  };
};///  конец data

const mounted = function(){
  var vm = this;
  vm.$nextTick(() => {
    $('.modal', $(vm.$el)).modal({"complete": vm.ModalComplete} );// Callback for Modal close}
    //~ console.log("mounted", vm.$el);
  });
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

const $Конструктор = function (ext/*data, $c, $scope*/){
  let $this = this;
  if (!$Компонент.template) $Компонент.template = $templateCache.get('uploader/файлы');
  $Компонент.components['v-uploader'] = new $Uploader();
  if (ext) return jQuery.extend(true, {}, $Компонент, ext);/// глубокое наложение
  return $Компонент;
};

return $Конструктор;

});// end factory

}());