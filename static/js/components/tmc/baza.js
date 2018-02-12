(function () {'use strict';
/*
  Модуль ТМЦ для нач баз
*/

var moduleName = "TMCBaza";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'Util', 'appRoutes', 'TMCBazaTable', 'ObjectMy']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $http, TemplateCache, appRoutes, TMCBazaData) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    $scope.paramObj = {"фильтр объектов": ctrl.ParamFilterObj, "placeholder": 'Указать базу', "без проекта": true, };
    TemplateCache.split(appRoutes.url_for('assets', 'tmc/baza.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
    
  };
  
  ctrl.OnSelectObj = function(obj){
    $scope.param['объект'] = undefined;
    $timeout(function(){
      $scope.param['объект'] = obj;
    });
    
  };
  
  ctrl.ParamFilterObj =  function(item){// в компонент object-my
    return TMCBazaData['Базы/id'].some(function(id){ return item.id == id; });
    
  };
};
/******************************************************/
var Data  = function($http, appRoutes, Util){
  return {
    "Базы/id": [90152, 4169],
    "InitForm": function(data) {// новая заявка - нет данных, изменить заявку - data
      if(!data) data = {};
      return data;
    },
  };
  
};

/*=============================================================*/

module

.factory(moduleName+'Data', Data)

.controller('Controll', Controll)

;

}());