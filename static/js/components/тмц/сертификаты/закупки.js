(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентТМЦСертификатыЗакупки({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "ТМЦ::Сертификаты::Закупки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [  ]);

module
.factory('$КомпонентТМЦСертификатыЗакупки', function($templateCache, $timeout,  /*$http, $rootScope, /**$compile, appRoutes, Util*/) {// factory

const props = {
  "selectedObject": Object, 
  "param": {
    type: Object,
    default: function () {
      return {};
    },
  },
};

const data = function() {
  //~ console.log("on data item", this.item);
  let vm = this;
  return {//angular.extend(// return dst
    //data,// dst
    //{/// src
    "ready": false,
    "selectedRow": undefined,
  };
  //);
};
  
const methods = {
SelectRow(row){
  this.selectedRow = row;
  this.$emit('select-row', row);
},
  
};/*методы*/


const mounted = function(){/// 
  var vm = this;
  vm.ready = true;
  $timeout(function(){
    var list = vm.$el.getElementsByTagName('table')[0].parentNode;//$('ul.roles', $($element[0]));
      //~ var top = list.offset().top+5;
      //~ list.css("height", 'calc(100vh - '+top+'px)');
    list.style.height = 'calc(100vh - '+list.offsetTop+'px)';
    //~ console.log(list);
  });
};

var $Компонент = {
  props,
  data,
  methods,
  mounted,
};

const $Конструктор = function  (){
  let $this = this;
  if (!$Компонент.template) $Компонент.template = $templateCache.get('тмц/сертификаты/закупки');
  return $Компонент;
};

return $Конструктор;

}// end Factory
/**********************************************************************/
);

}());