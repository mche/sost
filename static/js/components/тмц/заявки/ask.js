(function () {'use strict';
/*
  Модуль заявок ТМЦ
*/

var moduleName = "ТМЦ заявки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'Объекты', 'ТМЦ форма заявки', 'ТМЦ список заявок']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $http, TemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'тмц/заявки.html'), 1);
  
  ctrl.$onInit = function(){
    $scope.param = {"table":{}};
    tCache.then(function(proms){ ctrl.ready= true; });// массив
    
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