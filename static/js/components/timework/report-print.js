(function () {'use strict';
/*
  Отчет на основе отчета сводки-начисления ЗП
  квитки начислений из табеля
*/
var moduleName = "TimeWorkReportPrint";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'Кэш шаблонов', 'appRoutes']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, TemplateCache, appRoutes, Util){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    var param = Util.paramFromLocation();
    $scope.param = {"месяц": ((param.month && param.month[0]) || dateFns.format(new Date, 'YYYY-MM'))+'-01', "объект": {id: (param.object && param.object[0]) || 0}};
    
    TemplateCache.split(appRoutes.url_for('assets', 'timework/report-print.html'), 1)
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
    //~ $ctrl['крыжик начислено'] = true;
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    //~ $ctrl.param['общий список'] = true;
    $ctrl.data = {};
    $ctrl['все крыжики'] = true;
    
    $ctrl.LoadData().then(function(){$ctrl.ready = true;});
    
  };
  
  $ctrl.LoadData = function(){
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель/квитки начислено/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        $ctrl.data= resp.data;
      });
    
  };
  
  $ctrl.FilterProfile = function(item){
    //~ if (!$ctrl['крыжик начислено']) return true;
    return item['начислено'].some(function(n){ return !!n;});
  };
  var filter_true = function(){return true};
  $ctrl.FilterObj = function(data){
    //~ if (!$ctrl['крыжик начислено']) return filter_true;
    return function(obj, index){// this - запись по профилю
      return !!data['начислено'][index];
    };
    
  };
  
  $ctrl.InitProfile = function(data){
    data['печать']  = !!data['печать'];
    
  };
  
  $ctrl.InitRow = function(row, data){
    //~ row.style1 = data['объекты'].length == 1 ? {'height':'3rem'} : {};
  };
  
  $ctrl.Sum = function(arr){
    var s = 0;
    arr.map(function(val){ s += parseFloat(val); });
    return s.toLocaleString('ru-RU');
  };
  
  $ctrl.FormatSm = function(data){
    var r = 'смен';
    if(/1[1234]$/.test(data)) return r;
    if(/1$/.test(data)) return r+'а';
    if(/[234]$/.test(data)) return r+'ы';
    
    return r;
    
  };
  
  $ctrl.TogglePrintAll = function(item){
    item['печать'] = $ctrl['все крыжики'];
    
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