(function () {'use strict';
/*
*/

var moduleName = "TMC-Ask";

var module = angular.module(moduleName, ['AppTplCache', 'appRoutes', 'ObjectMy', 'TMC-Ask-Form']);//'ngSanitize',, 'dndLists'

var Controll = function  ($scope, $timeout, $http, loadTemplateCache, appRoutes) {
  var ctrl = this;
  //~ $scope.$timeout = $timeout;
  
  ctrl.$onInit = function(){
    $scope.param = {};
    loadTemplateCache.split(appRoutes.url_for('assets', 'tmc/ask.html'), 1)
      .then(function(proms){ ctrl.ready= true; });// массив
    
  };
  
  ctrl.OnSelectObj = function(obj){
    delete $scope.param['объект'];
    $timeout(function(){
      $scope.param['объект'] = obj;
      //~ $ctrl.LoadData();
    });
    
  };
};

/*=============================================================*/

module

.controller('Controll', Controll)

;

}());