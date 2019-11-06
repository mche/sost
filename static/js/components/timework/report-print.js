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
  
  var tCache = TemplateCache.split(appRoutes.urlFor('assets', 'timework/report-print.html'), 1);
  
  ctrl.$onInit = function() {
    
    var param = Util.paramFromLocation();
    $scope.param = {"месяц": ((param.month && param.month[0]) || dateFns.format(new Date, 'YYYY-MM'))+'-01', "объект": {id: (param.object && param.object[0]) || 0}};
    
    
    tCache.then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

var Comp = function($scope, $http, $q, $timeout, $element, appRoutes){
  var $c = this;
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  
  $c.$onInit = function() {
    if(!$c.param) $c.param = {};
    //~ $c['крыжик начислено'] = true;
    if(!$c.param['месяц']) $c.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    //~ $c.param['общий список'] = true;
    $c.data = {};
    $c['все крыжики'] = true;
    
    $c.LoadData().then(function(){$c.ready = true;});
    
  };
  
  $c.LoadData = function(){
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель/квитки начислено/данные'), $c.param, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        $c.data= resp.data;
      });
    
  };
  
  $c.FilterProfile = function(item){
    //~ if (!$c['крыжик начислено']) return true;
    return item['начислено'].some(function(n){ return !!n;});
  };
  //~ var filter_true = function(){return true; };
  $c.FilterObj = function(data){
    //~ if (!$c['крыжик начислено']) return filter_true;
    return function(obj, index){// this - запись по профилю
      return !!data['начислено'][index];
    };
    
  };
  
  $c.InitProfile = function(data){
    data['печать']  = !!data['печать'];
    
  };
  
  $c.InitRow = function(row, data){
    //~ row.style1 = data['объекты'].length == 1 ? {'height':'3rem'} : {};
  };
  
  $c.Sum = function(arr){
    var s = 0;
    arr.map(function(val){ s += parseFloat(val); });
    return s.toLocaleString('ru-RU');
  };
  
  $c.FormatSm = function(data){
    var r = 'смен';
    if(/1[1234]$/.test(data)) return r;
    if(/1$/.test(data)) return r+'а';
    if(/[234]$/.test(data)) return r+'ы';
    
    return r;
    
  };
  
  $c.TogglePrintAll = function(item){
    item['печать'] = $c['все крыжики'];
    
  };

  
};


/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeworkReportPrint', {
  controllerAs: '$c',
  templateUrl: "timework/report/print",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})

;

}());