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
  "folders": {///   предустановленные папки, если их нет - добавление папок откл, если пустой массив - можно созд, порядок массива сохраняется без пересортировки
    type: Array,
    //~ default: [],
  },
  "parent": {
    type: Object,
  },
  "param": {
    type: Object,
    default: function () {
      return {};
    },
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
      vm['перемещение'].splice(0);
      vm.TopFolders();
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
        //~ console.log("processParams", file);
        params.lastModified = file.file.lastModified;
        if (vm.parent.id) params.parent_id = vm.parent.id;
        //~ if (vm.topFolder) /*params.topFolder*/ file.relativePath = vm.topFolder.name+'/'+file.relativePath; тут не катит
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
  //~ console.log('FileAdded', file);
  if (this.topFolder) /*params.topFolder*/ file.relativePath = this.topFolder.name+'/'+file.relativePath;
},
FileSuccess(rootFile, file, message, chunk) {
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
    //~ vm.expandUploads = true;
    setTimeout(()=>{
      vm.uploads.push(resp.success);///props
      vm.TopFolders();
      if (resp.success.names && resp.success.names.length > 1) vm.topFolder = vm.topFolders.find((fd)=>fd.name == resp.success.names[0]);
      //~ vm.$el.querySelector(`#file-${resp.success.id}`).scrollIntoView({ "block": 'start', "behavior": 'smooth', });
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
          //~ vm.TopFolders();
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

TopFolders(){ 
  if (!this.folders) return;
  let folders = this.folders.reduce((a, name)=>{
    a[name] = 0;
    return a;
  }, {});
  
  this.uploads.reduce((a, file)=>{
    if (file.names.length == 1) return a;
    if (!a[file.names[0]]) a[file.names[0]] = 0;
    a[file.names[0]]++;//.push(file);
    return a;
  }, folders);
  //~ console.log("Folders", folders, Object.keys(folders).sort().map((name)=>{return {name, /*"files":folders[name]*/};}));
  this.topFolders.splice(0);
  //~ for (let f in folders) console.log("Folders", f);
  this.topFolders.push(...Object.keys(folders)/*.sort()*/.map((name)=>{return {name, "файлов": folders[name],};}));
},

AddFolder(){
  let f = {'_edit':'', '_new':true};
  this.topFolders.unshift(f);
  this.TabFolder(f);
  this.FocusEditFolder();
},

TabFolder(f){
  if (!!this['перемещение'] && this['перемещение'].length)
    return this.SaveFolder({"edit": this.topFolder === f ? '' : f.name, "@id":this['перемещение'].map(f=>f.id)}).then(function(data){
      Materialize.toast('Успешно перемещены файл(ы): '+data.length, 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
      
    });
  if (this.topFolder === f) return this.topFolder = undefined;
  this.topFolder = f;
},

BlurEditFolder(f){///переименование
  let vm = this;
  if (!!f._name && !!f._edit && f._name != f._edit && !!f['файлов']) {///редакт
    vm.SaveFolder({"name":f._name, "edit":f._edit, "parent_id":vm.parent.id}).then(function(data){
      //~ console.log("then SaveFolder", data.length);
      Materialize.toast('Успешно переименована папка', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
    });
  }
  else if (!!f._edit) vm.$set(f, 'name', f._edit);
  else if (!f._name) /* if (!f._edit || f._edit.length === 0) return*/ {
    vm.topFolders.removeOf(f);
    vm.topFolder = undefined;
  }
  else vm.$set(f, 'name', f._name);
  Vue.delete(f, '_edit');
  Vue.delete(f, '_name');
  //~ this.TabFolder(f);
  
},

SaveFolder(param){/// переименование папки и перемещение в папку
  let vm = this;
  return $http.post(appRoutes.urlFor('файлы/переименовать'), param).then(
    function(resp){
      if (resp.data.success) {
        vm.ready = false;
        vm.Uploads().then(function(){
          vm.topFolder = vm.topFolders.find((fd)=>fd.name == param.edit);
        });/// обновить
        return resp.data.success;
      }
    },
    function(){
      Materialize.toast('Ошибка сохранения папки', 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
  );
},

EditFolder(f){
  this.$set(f, '_edit', f.name);
  f._name = f.name;
  f.name = undefined;
  this.FocusEditFolder();
},

FocusEditFolder(){
  setTimeout(_=>{
    this.$el.querySelector('input[name="edit-folder"]').focus();
  });
},

ToggleMove(file){
  let idx = this['перемещение'].indexOf(file);
  if (idx == -1) {///вкл
    this.$set(file, '_move', true);
    this['перемещение'].push(file); 
  }
  else {///выкл
    this.$set(file, '_move', false);
    this['перемещение'].splice(idx, 1);
  }
},

SortUploads(a,b){
  return a.names.join('').localeCompare(b.names.join(''));
},

EditFile(file){
  let name = file.names[file.names.length-1].split(/\./);
  this.$set(file, '_edit', name.slice(0, name.length-1).join('.'));
  this.$set(file, '_ext', name[name.length-1]);
  this.FocusEditFile(file);
},

BlurEditFile(file){
  let edit = file._edit+'.'+file._ext;
  if (file.names[file.names.length-1] != edit) {
    file.names[file.names.length-1] = edit;
    this.SaveFile(file);
  }
  Vue.delete(file, '_edit');
  Vue.delete(file, '_ext');
  
},

FocusEditFile(file){
  setTimeout(_=>{
    this.$el.querySelector(`#file-${file.id} input[type=text]`).focus();
  });
},

SaveFile(file){/// переименование папки и перемещение в папку
  let vm = this;
  return $http.post(appRoutes.urlFor('файлы/переименовать'), {"id":file.id, "names":file.names}).then(
    function(resp){
      if (resp.data.success) {
        Materialize.toast('Успешно переименован файл', 3000, 'green-text text-darken-3 green lighten-3 fw500 border animated zoomInUp slow');
        //~ });/// обновить
        //~ return resp.data.success;
      }
    },
    function(){
      Materialize.toast('Ошибка сохранения папки', 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
    }
  );
},

}; ///конец методы

const computed = {

UploadsLen(){
  return this.uploads.length;
},

UploadsFiltered(){
  if (this.topFolder === undefined) return this.uploads.sort(this.SortUploads);
  return this.uploads.reduce((a, file)=>{
    if (file.names.length > 1 && file.names[0] == (this.topFolder.name || this.topFolder._name)) a.push(file);
    return a;
  }, []).sort(this.SortUploads);
},

UploadsFilteredLen(){
  return this.UploadsFiltered.length;
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
    "topFolders":[],
    "topFolder": undefined,/// выбрана папка
    uploads: vm.parent._uploads,
    expandUploads: false,
    confirmFile: undefined,
    iframeFile: undefined,
    "перемещение":[], /// как крыжики иконки свг
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