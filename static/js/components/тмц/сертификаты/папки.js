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
var module = angular.module(moduleName, [  ]);

const Factory = function($templateCache, $timeout,  /*$http, $rootScope, /**$compile,*/ appRoutes, Util) {// factory

let meth = {/*методы*/};
meth.Ready = function(){/// метод
  var vm = this;
  vm.ready = true;
  //~ $timeout(function(){
  //~ });
};

return /*конструктор*/function (/*data, $c, $scope*/){
  let $this = this;
  //~ data = data || {};

  return {
    "template": $templateCache.get('тмц/сертификаты/папки'),
    "props": [],
    "data"() {
      //~ console.log("on data item", this.item);
      let vm = this;
      return {//angular.extend(// return dst
        //data,// dst
        //{/// src
          "ready": false,
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
  };
};

};// end Factory
/**********************************************************************/
module
.factory('$КомпонентТМЦСертификатыПапки', Factory);

}());