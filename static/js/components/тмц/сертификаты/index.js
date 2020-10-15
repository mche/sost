(function () {'use strict';
/*
  Модуль ТМЦ сертификатов
*/

var moduleName = "Серификаты ТМЦ";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'Util', 'ТМЦ::Сертификаты::Объекты', 'ТМЦ::Сертификаты::Закупки', 'ТМЦ::Сертификаты::Папки', 'EventBus']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $q, $timeout, $element, $http, TemplateCache, appRoutes, $КомпонентТМЦСертификатыОбъекты, $КомпонентТМЦСертификатыЗакупки, $КомпонентТМЦСертификатыПапки, $EventBus) {
  var ctrl = this;

var tCache = TemplateCache.split(appRoutes.url_for('assets', 'тмц/сертификаты.html'), 1);
  
ctrl.$onInit = function(){
  ctrl.param = {};
  var async  = [];
  async.push(tCache);
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

const methods = {
SelectObject(obj){
  //~ console.log("SelectObject", ctrl.data.indexOf(obj));
  this.selectedObject = obj;
  $EventBus.$emit('Выбрана строка ТМЦ', undefined);
},
SelectZakupRow(row){
  //~ console.log("Выбрана строка ТМЦ", row);
  $EventBus.$emit('Выбрана строка ТМЦ', row);
},
};/*методы Vue*/
  
const mounted = function(){
  var vm = this;
  //~ $EventBus.$on(vm.paramFolder.selectItemEventName, function(data){
    //~ console.log('Выбрана папка спецификаций', data);
    //~ vm.selectedFolder = data;
  //~ });
  
};

const computed = {
data(){
  return ctrl.data;
},
  
};

const data = function(){
  
  return {
    "ready": true,
    "param": {},//"selectItemEventName": 'Выбрана папка спецификаций', "новый узел": {}, addNodeBtn: 'Добавить папку'},
    "selectedObject": undefined,
    "selectedFolder": undefined,
  };
};
  
ctrl.Vue = function(){
  //~ console.log(new $КомпонентТМЦСертификатыПапки());
  ctrl.vue = new Vue({
    "el":  $element[0], //.childNodes[0],
    data,
    computed,
    methods,
    mounted,
    "components": {
      'v-left-objects': new $КомпонентТМЦСертификатыОбъекты(),/// {/*"param": $c.param*/}, $c
      'v-center-zakup': new $КомпонентТМЦСертификатыЗакупки(),
      'v-right-folders': new $КомпонентТМЦСертификатыПапки(),
    },
  });
};
  

  
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());