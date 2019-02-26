(function () {'use strict';
/*
  Модуль ТМЦ для нач объектов
  еще склад отдельно модуль
*/

var moduleName = "ТМЦ на объектах";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'Объекты', 'ТМЦ на объектах/табы', 'Номенклатура', 'Контрагенты']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, TemplateCache, appRoutes, $Номенклатура, $Контрагенты) {
  var ctrl = this;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    $scope.paramObj = {/*"фильтр объектов": ctrl.ParamFilterObj, */"placeholder": 'Указать объект, базу', /*"без проекта": true,*/ };
    TemplateCache.split(appRoutes.url_for('assets', 'тмц/объекты.html'), 1)
      .then(function(proms){
        ctrl.ready= true; 
        $Номенклатура/*.Refresh(0)*/.Load(0);
        $Контрагенты.Load();/*заранее подгрузить*/
      });
    
  };
  
  ctrl.OnSelectObj = function(obj){
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
    });
    
  };
  
  /*
  ctrl.ParamFilterObj =  function(item){// в компонент object-select
    //~ console.log("ParamFilterObj", item);
    //~ return item['parents/name'].some(function(name){ name == 'Стройка' });
    return TMCBazaData['Базы/id'].some(function(id){ return item.id == id; });
    
  };*/
};
/******************************************************/

module
.controller('Controll', Controll)

;

}());