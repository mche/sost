(function () {'use strict';
/*
  Модуль снабжения ТМЦ для снабженца
*/

var moduleName = "ТМЦ снабжение";
try {angular.module(moduleName); return;} catch(e) { }
//~ try {angular.module('ТМЦ форма закупки');} catch(e) {  angular.module('ТМЦ снабжение форма', []);}// тупая заглушка
try {angular.module('ТМЦ снабжение списки');} catch(e) {  angular.injector(['Console']).get('$Console').log("Заглушка модуля 'ТМЦ снабжение списки' ", angular.module('ТМЦ снабжение списки', []));}// тупая заглушка

var module = angular.module(moduleName, ['Util', 'appRoutes', 'TemplateCache', 'Объекты', /*'ТМЦ форма закупки',*/ 'ТМЦ снабжение списки',  'Номенклатура', 'Контрагенты']);//'ngSanitize',, 'dndLists'

const Controll = function  ($scope, $timeout, TemplateCache, appRoutes, $Номенклатура, $Контрагенты) {///$http, 
  var ctrl = this;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    TemplateCache.split(appRoutes.url_for('assets', 'тмц/снабжение.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        $Номенклатура/*.Refresh(0)*/.Load(0);
        $Контрагенты.Load();
      });// массив
    
  };
  
  ctrl.OnSelectObj = function(obj){
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
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