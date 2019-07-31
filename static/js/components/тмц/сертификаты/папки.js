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
var module = angular.module(moduleName, [ 'Компонент::Дерево::Список', 'Номенклатура' ]);

const Factory = function($templateCache, $timeout,  /*$http, $rootScope, /**$compile, appRoutes, Util*/ $КомпонентДеревоСписок, $Номенклатура) {// factory

let meth = {/*методы*/};
meth.Ready = function(){/// метод
  var vm = this;
  $Номенклатура.Load().then(function(){
    vm.folders = $Номенклатура.Data();
    vm.ready = true;
  });
  
  //~ $timeout(function(){
  //~ });
};

var $Компонент = {
  //~ "template": $templateCache.get('тмц/сертификаты/папки'),
  "props": [],
  "data"() {
    //~ console.log("on data ", $КомпонентДеревоСписок);
    let vm = this;
    return {//angular.extend(// return dst
      //data,// dst
      //{/// src
        "ready": false,
        "folders": undefined,
        "selectedFolder": {},
        "param": {},
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
  $Компонент.components = {'v-tree': new $КомпонентДеревоСписок(),};
  //~ console.log($Компонент);
  return $Компонент;
};

return $Конструктор;

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентТМЦСертификатыПапки', Factory);

}());