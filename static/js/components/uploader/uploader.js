(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $Uploader({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "Uploader";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['UploaderCommon', 'UploaderBtn', 'UploaderDrop', 'UploaderList', 'UploaderFiles', 'UploaderFile',]);

module.factory('$Uploader', function($templateCache, $UploaderUtil, $UploaderBtn, $UploaderDrop, $UploaderList, $UploaderFiles, $UploaderFile) {// factory

const FILE_ADDED_EVENT = 'fileAdded';
const FILES_ADDED_EVENT = 'filesAdded';
const UPLOAD_START_EVENT = 'uploadStart';
const  provide = function () {
  return {
    uploader: this,
  };
};
const props = {
  options: {
    type: Object,
    default () {
      return {};
    },
  },
  autoStart: {
    type: Boolean,
    default: true,
  },
  fileStatusText: {
    type: [Object, Function],
    default () {
      return {
        success: 'success',
        error: 'error',
        uploading: 'uploading',
        paused: 'paused',
        waiting: 'waiting',
      };
    }
  },
};/// конец props


const methods = {/*методы*/
  uploadStart () {
    this.started = true;
  },
  fileAdded (file) {
    this.$emit($UploaderUtil.kebabCase(FILE_ADDED_EVENT), file);
    if (file.ignored) {
      // is ignored, filter it
      return false;
    }
  },
  filesAdded (files, fileList) {
    this.$emit($UploaderUtil.kebabCase(FILES_ADDED_EVENT), files, fileList);
    if (files.ignored || fileList.ignored) {
      // is ignored, filter it
      return false;
    }
  },
  fileRemoved (file) {
    this.files = this.uploader.files;
    this.fileList = this.uploader.fileList;
  },
  filesSubmitted (files, fileList) {
    this.files = this.uploader.files;
    this.fileList = this.uploader.fileList;
    if (this.autoStart) {
      this.uploader.upload();
    }
  },
  allEvent (...args) {
    const name = args[0];
    //~ debugger;
    const EVENTSMAP = {
      [FILE_ADDED_EVENT]: true,
      [FILES_ADDED_EVENT]: true,
      [UPLOAD_START_EVENT]: 'uploadStart',
    };
    const handler = EVENTSMAP[name];
    if (handler) {
      if (handler === true) {
        return;
      }
      this[handler].apply(this, args.slice(1));
    }
    args[0] = $UploaderUtil.kebabCase(name);
    this.$emit.apply(this, args);
  },
}; ///конец методы

const data = function() {
  let vm = this;
  return {
    started: false,
    files: [],
    fileList: [],
  };
};///  конец data

const     created = function () {
  this.options.initialPaused = !this.autoStart;
  const uploader = new Uploader(this.options);
  this.uploader = uploader;
  this.uploader.fileStatusText = this.fileStatusText;
  uploader.on('catchAll', this.allEvent);
  uploader.on(FILE_ADDED_EVENT, this.fileAdded);
  uploader.on(FILES_ADDED_EVENT, this.filesAdded);
  uploader.on('fileRemoved', this.fileRemoved);
  uploader.on('filesSubmitted', this.filesSubmitted);
};

const     destroyed = function () {
  const uploader = this.uploader;
  uploader.off('catchAll', this.allEvent);
  uploader.off(FILE_ADDED_EVENT, this.fileAdded);
  uploader.off(FILES_ADDED_EVENT, this.filesAdded);
  uploader.off('fileRemoved', this.fileRemoved);
  uploader.off('filesSubmitted', this.filesSubmitted);
  this.uploader = null;
};
const mounted = function(){

};/// конец mounted

let template = parcelRequire('js/c/uploader/uploader.vue.html');

var $Компонент = {
  provide,
  props,
  data,
  methods,
  created,
  destroyed,
  //~ computed,
  //~ created,
  mounted,
  components: {},
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ $Компонент.template = $templateCache.get('uploader');
  $Компонент.components['uploader-btn'] = new $UploaderBtn();
  $Компонент.components['uploader-drop'] = new $UploaderDrop();
  $Компонент.components['uploader-list'] = new $UploaderList();
  $Компонент.components['uploader-files'] = new $UploaderFiles();
  $Компонент.components['uploader-file'] = new $UploaderFile();
  return $Компонент;
};

return $Конструктор;

});// end factory

}());