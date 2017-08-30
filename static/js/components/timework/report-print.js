(function () {'use strict';
/*
  Отчет на основе отчета сводки-начисления ЗП
  Для спец-та по тендерам
*/
var moduleName = "TimeWorkReportPrint";

var module = angular.module(moduleName, ['AuthTimer', 'Util', 'AppTplCache', 'loadTemplateCache', 'appRoutes']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, loadTemplateCache, appRoutes, Util){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    var param = Util.paramFromLocation();
    $scope.param = {"месяц": ((param.month && param.month[0]) || dateFns.format(new Date, 'YYYY-MM'))+'-01', "объект": {id: (param.object && param.object[0]) || 0}};
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'timework/report-print.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

var Comp = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $ctrl = this;
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    //~ $ctrl.param['общий список'] = true;
    $ctrl.data = {};
    
    $ctrl.LoadData().then(function(){$ctrl.ready = true;});
    
  };
  
  $ctrl.LoadData = function(){
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель/печать квитков/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        $ctrl.data= resp.data;
      });
    
  };
  
  $ctrl.FormatSm = function(data){
    var r = 'смен';
    if(/1[1234]$/.test(data)) return r;
    if(/1$/.test(data)) return r+'а';
    if(/[234]$/.test(data)) return r+'ы';
    
    return r;
    
  };
  

  
};


/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeworkReportPrint', {
  templateUrl: "timework/report/print",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})

;

}());