(function () {'use strict';
/*
  Компонент Vue
  USAGE:
  new Vue({
    ...
    "components": {
      'comp-aaa-111': new $КомпонентТМЦСертификатыПапки({<данные в компонент>}),
      ...
    }
  })
  
*/
var moduleName = "ТМЦ::Сертификаты::Папки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, [ 'Компонент::Дерево::Список', 'ТМЦ::Сертификаты::Форма::Папки']);

const Factory = function($templateCache, $КомпонентДеревоСписок, $Список, appRoutes, $КомпонентТМЦСертификатыФормаПапки) {// factory

let meth = {/*методы*/};
meth.Ready = function(){/// метод
  var vm = this;
  vm.folders.Load().then(function(){
    vm.folders = vm.folders.Data();
    vm.ready = true;
  });
};

var folders = new $Список(appRoutes.urlFor('номенклатура/список', 0));
folders.Load();

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'), //ниже/!!
  "props": {
      "param": {
        type: Object,
        default: function () {
          return {};
        },
      },
    },
  "data"() {
    let vm = this;
    
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
        "ready": false,
        "folders": folders,
        "selectedFolder": {},
        //~ "param": ,
      };
    //);
  },
  "methods": meth,
  /*"computed": {
    "edit": function(){
      return this.InitItem(angular.copy(this.item));
    }
  },*/
  "created"() {
  },
  "mounted"() {
    //~ console.log('mounted', this);
    this.Ready();
  },
  //~ "components": {
    //~ 'v-tree': new $КомпонентДеревоСписок(),
  //~ },
};

const $Конструктор = function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};
  $Компонент.template = $templateCache.get('тмц/сертификаты/папки');
  $Компонент.components = {'v-tree': new $КомпонентДеревоСписок(new $КомпонентТМЦСертификатыФормаПапки()),};
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентТМЦСертификатыПапки', Factory);

}());