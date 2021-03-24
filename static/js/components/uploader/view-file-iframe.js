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
var moduleName = "Файлы::Просмотр";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, []);

module.factory('$КомпонентПросмотрФайла', function(appRoutes) {// factory
  
const props = {
  "файл": {
    type: Object,
  },
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
};/// конец props

const methods = {
  
ViewIframe(file){/// 
  var vm = this;
  //~ console.log('ViewIframe', file);
  vm.iframe = {"src": file.src || appRoutes.urlFor('файл-инлайн', [file.sha1]), "height": parseInt(window.innerHeight*0.8)/*modal max-height:90%;*/, "width": window.innerWidth, "content_type": file.content_type, "timeouts":[]};
  //~ if (vm.file) {
    //~ vm.file = undefined;
    //~ setTimeout(function(){ vm.file = iframe; });
  //~ } else   
  //~ vm.file = iframe;
  
  vm.iframe.timeouts.push(setTimeout(vm.CallbackWaitIframeLoad, 100));
},

CallbackWaitIframeLoad(){/// из
  var vm = this;
  //~ vm.modal.modal('open');
  var iframe = vm.$el.getElementsByTagName('iframe')[0];
  if (!iframe) {
    vm.modal.modal('close');
    return console.log("CallbackWaitIframeLoad просмотр закрыт");
  }
  
  try {
    if (!!iframe.contentWindow.document.body && !!iframe.contentWindow.document.body.childElementCount) 
      return vm.modal.modal('open');
  } catch (e) {
    return vm.modal.modal('open');
  }
  

  if (vm.iframe.timeouts.length < 30 /* 30*100 мсек = 3000 сек общее ожидание вызова просмотра*/)
    return vm.iframe.timeouts.push(setTimeout(vm.CallbackWaitIframeLoad, 100));///return vm.modal.modal('close');
    //~ return console.log("CallbackWaitIframeLoad: нет просмотра по timeouts", Materialize.toast("Файл не просматривается, он скачался ", 3000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast'));///, vm.modal.modal('close'))
   
  
  //~ if (!iframe.contentDocument || iframe.contentDocument.URL/*contentWindow.document.URL*/ != 'about:blank') {
  
  console.log("CallbackWaitIframeLoad: нет просмотра по timeouts", Materialize.toast("Файл не просматривается, он скачался ", 3000, 'orange-text text-darken-3 orange lighten-4 fw500 border animated flash fast'));
  //~ vm.modal.modal('close');
  //~ vm.iframe = undefined;

    
    
  //~ 
},

ViewIframeClose(){
  /*** ничего @click.stop!!! ***/
  this.$emit('on-complete');
  this.iframe = undefined;
  //~ console.log('ViewIframeClose');
},

};/// end methods

const data = function() {
  let vm = this;
  
  return {
    ready: false,
    iframe: undefined, //this['файл'],
    //~ modal: undefined,
  };
};///  конец data

const mounted = function(){
  var vm = this;
  vm.$nextTick(() => {
    //~ setTimeout(()=>{
    vm.modal =     $(vm.$el).modal();///{"complete": vm.ViewIframeClose, }
    //~ vm.modal.modal('open');
    vm.ViewIframe(vm['файл']);
    //~ console.log("View file mounted", vm.modal);
    //~ });
  });
};/// конец mounted

let template = parcelRequire('js/c/uploader/view-file-iframe.vue.html');

var $Компонент = {
  props,
  data,
  methods,
  //~ computed,
  //~ created,
  mounted,
  //~ components: {},
  render:template.render,
  staticRenderFns: template.staticRenderFns,
};

const $Конструктор = function (ext/*data, $c, $scope*/){
  let $this = this;
  return $Компонент;
};

return $Конструктор;

});// end factory

}());