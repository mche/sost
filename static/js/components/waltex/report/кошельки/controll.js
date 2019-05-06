(function () {'use strict';
/*
  Отчет по кошелькам
*/

//~ try {angular.module('MoneyTable');} catch(e) {  /*angular.injector(['Console']).get('$Console')*/console.log("Заглушка модуля 'MoneyTable' ", angular.module('MoneyTable', []));}// тупая заглушка
  
var moduleName = "Отчет по кошелькам";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'TemplateCache', 'ProjectList',]); ///'TreeItem', 'WalletItem', 'ContragentItem', 'Контрагенты', 'Объект или адрес', 'ProfileItem', 'MoneyTable', 'Категории'

const Controll = function($scope, $attrs, $element, $timeout, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    $scope.param = {};

    TemplateCache.split(appRoutes.url_for('assets', 'деньги/отчет/кошельки.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });// массив
  };
  
  ctrl.SelectProject = function(p){
    //~ console.log("SelectProject");
    $scope.param["проект"] = undefined;
    if(!p) return;
    $timeout(function(){
      $scope.param["проект"] = p;
    });
  };
  
};

module
.controller('Controll', Controll)
;

}());