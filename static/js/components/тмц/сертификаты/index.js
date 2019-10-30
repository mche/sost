(function () {'use strict';
/*
  Модуль ТМЦ сертификатов
*/

var moduleName = "Серификаты ТМЦ";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'ТМЦ::Сертификаты::Объекты', 'ТМЦ::Сертификаты::Закупки', 'ТМЦ::Сертификаты::Папки', 'EventBus']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $q, $timeout, $element, $http, TemplateCache, appRoutes, $КомпонентТМЦСертификатыОбъекты, $КомпонентТМЦСертификатыЗакупки, $КомпонентТМЦСертификатыПапки, $EventBus) {
  var ctrl = this;
  var meth = {/*методы Vue*/};
  
  meth.Mounted = function(){
    var vm = this;
    //~ $EventBus.$on(vm.paramFolder.selectItemEventName, function(data){
      //~ console.log('Выбрана папка спецификаций', data);
      //~ vm.selectedFolder = data;
    //~ });
    
  };
  
  ctrl.$onInit = function(){
    ctrl.param = {};
    var async  = [];
    async.push(TemplateCache.split(appRoutes.url_for('assets', 'тмц/сертификаты.html')));
    async.push(ctrl.LoadData());
    $q.all(async)
      .then(function(proms){
        ctrl.ready= true;
        $timeout(function(){ ctrl.Vue(); });
      });
    
  };
  
  ctrl.LoadData = function(){
    return $http.get(appRoutes.urlFor('тмц/сертификаты/закупки'))
      .then(function(resp){
        ctrl.data = resp.data;
      });
  };
  
  ctrl.Vue = function(){
    //~ console.log(new $КомпонентТМЦСертификатыПапки());
    ctrl.vue = new Vue({
      "el":  $element[0], //.childNodes[0],
      //~ "delimiters": ['{%', '%}'],
      "data"() {
        return {
          "ready": true,
          "paramFolder": {},//"selectItemEventName": 'Выбрана папка спецификаций', "новый узел": {}, addNodeBtn: 'Добавить папку'},
          "selectedObject": undefined,
          "selectedFolder": undefined,
        };
      },
      "computed":{
        "data"(){
          return ctrl.data;
        },
        
      },
      "methods": meth,
      "mounted"(){
        var vm = this;
        vm.Mounted();
      },
      "components": {
        'v-left-objects': new $КомпонентТМЦСертификатыОбъекты(),/// {/*"param": $c.param*/}, $c
        'v-center-zakup': new $КомпонентТМЦСертификатыЗакупки(),
        'v-right-folders': new $КомпонентТМЦСертификатыПапки(),
      },
    });
  };
  
  meth.SelectObject = function(obj){
    //~ console.log("SelectObject", ctrl.data.indexOf(obj));
    this.selectedObject = obj;
  };
  meth.SelectZakupRow = function(row){
    
  };
  
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());