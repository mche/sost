(function () {'use strict';
/*
  Модуль ТМЦ для склада
  отдельно вынес вкладку наличие ТМЦ
*/

var moduleName = "Наличие ТМЦ";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', /*'Util', 'appRoutes',*/ 'Объекты',  'Номенклатура', "ТМЦ текущие остатки"]);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, TemplateCache, appRoutes, $Номенклатура) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  var tCache = TemplateCache.split(appRoutes.url_for('assets', 'тмц/наличие.html'), 1);
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    //~ $scope.paramObj = {/*"фильтр объектов": ctrl.ParamFilterObj, */"placeholder": 'Указать склад', /*"без проекта": true,*/ };
    
    tCache.then(function(proms){
        ctrl.ready= true;
        $Номенклатура.Load();
        });// массив
    
  };
  
  ctrl.OnSelectObj = function(obj){
    //~ console.log("OnSelectObj", obj);
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
    });
    
  };
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());