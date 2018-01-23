(function () {'use strict';
/*
  квитки расчета
*/
var moduleName = "Квитки расчет";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AuthTimer', 'Util', 'AppTplCache', 'loadTemplateCache', 'appRoutes']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, loadTemplateCache, appRoutes, Util){
  var ctrl = this;

  ctrl.$onInit = function() {
    var param = Util.paramFromLocation();
    $scope.param = {"месяц": ((param.month && param.month[0]) || dateFns.format(new Date, 'YYYY-MM'))+'-01',};
    
    loadTemplateCache.split(appRoutes.url_for('assets', 'timework/calc-zp-print.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

var Comp = function($scope, $http, $q, $timeout, $element, appRoutes, Util){
  var $ctrl = this;
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    //~ $ctrl['крыжик начислено'] = true;
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    //~ $ctrl.param['общий список'] = true;
    //~ $ctrl.data = {};
    $ctrl['все крыжики'] = true;
    $ctrl.LoadData().then(function(){$ctrl.ready = true;});
    
  };
  
  $ctrl.LoadData = function(){
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель/квитки расчет/данные'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        $ctrl.data= resp.data;
      });
    
  };
  
  /*$ctrl.FilterData = function(item){
    //~ return true;
    return item['начислено'].some(function(n){ return !!n;});
  };*/
  //~ var filter_true = function(){return true};
  /*$ctrl.FilterObj = function(data){
    if (!$ctrl['крыжик начислено']) return filter_true;
    return function(obj, index){// this - запись по профилю
      return !!data['начислено'][index];
    };
    
  };*/
  
  $ctrl.InitProfile = function(data){
    data['печать']  = !data['печать'];
    //~ data['начислено сумма'] = $ctrl.Sum(data['начислено']);
    //~ data['показать расчет'] = parseFloat(data['РасчетЗП']).toLocaleString('ru-RU') != data['начислено сумма'];
    
  };
  
  $ctrl.InitRow = function(row, data, index){
    //~ if(row._show === undefined) return true;
    if(!data['Начислено'][index])  // в запрос сводки попадают объекты без начисления, но с часами
      ['объекты/name', 'всего смен', 'всего часов', 'КТУ1', 'КТУ2', 'Ставка', 'Примечание', 'Начислено', 'объекты'].map(function(key){ data[key].splice(index, 1); });

    //~ row.style1 = data['объекты'].length == 1 ? {'height':'3rem'} : {};
  };
  
  $ctrl.Sum = function(data, name){
    var s = 0;
    if(data[name]) data[name].map(function(val){ s += parseFloat(val); });
    if (name == 'Начислено' && data['Суточные/начислено']) s += parseFloat(data['Суточные/начислено']);
    return s.toLocaleString('ru-RU');
  };
  
  $ctrl.FormatSm = function(data){
    var r = 'смен';
    if(/1[1234]$/.test(data)) return r;
    if(/1$/.test(data)) return r+'а';
    if(/[234]$/.test(data)) return r+'ы';
    
    return r;
    
  };
  
  $ctrl.InitRowCalc = function(rStr){
    var row = JSON.parse(rStr);
    row.sum = parseFloat(Util.numeric(row['сумма']));
    //~ console.log("InitRowCalc", row);
    return row;
    
    
  };
  
  $ctrl.TogglePrintAll = function(item){
    item['печать'] = $ctrl['все крыжики'];
    
  };
  

  
};


/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeworkCalcZpPrint', {
  templateUrl: "квитки/расчет",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})

;

}());