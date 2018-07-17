(function () {'use strict';
/*
  Модуль заявок снабжения ТМЦ для участков
*/

var moduleName = "TMC-Ask";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'ObjectMy', 'TMC-Ask-Form', 'TMC-Ask-Table']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $http, loadTemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    loadTemplateCache.split(appRoutes.url_for('assets', 'tmc/ask.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
    
  };
  
  ctrl.OnSelectObj = function(obj){
    delete $scope.param['объект'];
    delete $scope.param.edit;
    $timeout(function(){
      $scope.param['объект'] = obj;
      //~ $scope.param.table['объект'] = obj;
      //~ $ctrl.LoadData();
    });
    
  };
};
/******************************************************/
var Data  = function($http, appRoutes){
  //~ var fresh  = function(){return };
  //~ var data = $http.get(appRoutes.url_for('тмц/новая заявка'));
  return {
    NewAsk: function() {// новая заявка - форма
      var d = new Date();
      return {"дата1": (new Date(d.setDate(d.getDate()+2))).toISOString().replace(/T.+/, ''), "номенклатура":{}, "_new": true,};
    },
  };
  //~ f.get = function (){
  //~ };
  
};

/*=============================================================*/

module

.factory('TMCAskData', Data)

.controller('Controll', Controll)

;

}());