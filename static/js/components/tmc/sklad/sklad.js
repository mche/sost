(function () {'use strict';
/*
  Модуль ТМЦ для склада
  еще отдельно модуль для объектов
*/

/***
///возможные заглушки модулей
var stubs = ['ContragentItem', 'Контрагенты'];
var stubFact = function(){ return stubFact; };
stubs.map(function(stub){
  try {angular.module(stub);}
  catch(e) {
    console.log("Заглушка модуля", stub, e);
    var mod = angular.module(stub, []);
    if (stub == 'Контрагенты') mod.factory('$Контрагенты', stubFact);
  }
});***/

var moduleName = "Склад ТМЦ";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['TemplateCache', 'Util', 'appRoutes', 'Объекты', 'ТМЦ склад списки']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, TemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    $scope.paramObj = {/*"фильтр объектов": ctrl.ParamFilterObj, */"placeholder": 'Указать склад', /*"без проекта": true,*/ };
    TemplateCache.split(appRoutes.url_for('assets', 'tmc/sklad.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
    
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
/*var Data  = function($http, appRoutes, Util){
  return {
    "Базы/id": [90152, 4169, 3406, ],
    "InitForm": function(data) {// новая заявка - нет данных, изменить заявку - data
      if(!data) data = {};
      return data;
    },
  };
  
};
*/

/*=============================================================*/

module

//~ .factory(moduleName+'Data', Data)

.controller('Controll', Controll)

;

}());