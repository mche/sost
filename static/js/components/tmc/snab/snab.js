(function () {'use strict';
/*
  Модуль снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ снабжение";
try {angular.module(moduleName); return;} catch(e) { }
//~ try {angular.module('ТМЦ форма закупки');} catch(e) {  angular.module('ТМЦ снабжение форма', []);}// тупая заглушка
try {angular.module('ТМЦ снабжение списки');} catch(e) {  angular.module('ТМЦ снабжение списки', []);}// тупая заглушка
var module = angular.module(moduleName, ['Util', 'appRoutes', 'Объекты', /*'ТМЦ форма закупки',*/ 'ТМЦ снабжение списки']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, TemplateCache, appRoutes) {///$http, 
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    TemplateCache.split(appRoutes.url_for('assets', 'tmc/snab.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
    
  };
  
  ctrl.OnSelectObj = function(obj){
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
      //~ $scope.param.table['объект'] = obj;
      //~ $ctrl.LoadData();
    });
    
  };
};
/******************************************************/

/*=============================================================*/

module

//~ .factory('TMCSnabData', Data)
//~ .factory('TMCSnab', Data)

.controller('Controll', Controll)

;

}());