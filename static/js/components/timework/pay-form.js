(function () {'use strict';
/*
  Квиток выплаты ЗП после начисления
*/
var moduleName = "TimeWorkPayForm";
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'Util']); //

var Comp = function  ($scope, $http, $q, $timeout, $element, $window,  appRoutes, Util) {  //function Comp
var $ctrl = this;
$scope.dateFns = dateFns;
$scope.parseFloat = parseFloat;
$scope.Util = Util;

$ctrl.$onInit = function() {
  $ctrl.data = {};
  $ctrl.LoadData().then(function(){
    $ctrl.ready = true;
    
  });
};

/*
первая строка - баланс на конец указ месяца
вторая строка - общее начисление на указ месяц
последующие строки - расчеты
*/
$ctrl.LoadData = function() {
  return $http.get(appRoutes.url_for('расчеты выплаты ЗП', [$ctrl.param['профиль/id'] || $ctrl.param['профиль'].id, $ctrl.param['месяц']]))
    .then(function(resp){
      if(resp.data.error) $ctrl.error = resp.data.error;
      else {
        $ctrl.data['баланс'] = resp.data.shift();
        $ctrl.data['начислено'] = resp.data.shift();
        $ctrl.data['расчеты'] = resp.data;
        $ctrl.data['расчеты'].push({"заголовок":'', "начислить":null, "удержать": null, "коммент":null});
      }
      
    });
  
};

$ctrl.FormatNum = function(num){
  if(!num) return;
  num = parseFloat(Util.numeric(num));
  return num;
};

};

/*==========================================================*/
module

//~ .factory(moduleName+"Data", Data)

.component('timeworkPayForm', {
  templateUrl: "time/work/pay/form",
  bindings: {
    param: '<', 
  },
  controller: Comp
})

;

}());
