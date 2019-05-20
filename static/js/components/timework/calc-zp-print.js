(function () {'use strict';
/*
  квитки расчета
*/
var moduleName = "Квитки расчет";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'TemplateCache', 'appRoutes']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, TemplateCache, appRoutes, Util){
  var ctrl = this;

  ctrl.$onInit = function() {
    var param = Util.paramFromLocation();
    //~ console.log("Квитки расчет", param);
    $scope.param = {"месяц": ((param.month && param.month[0]) || dateFns.format(new Date, 'YYYY-MM'))+'-01', "офис": (param['офис'] && param['офис'][0])};
    
    TemplateCache.split(appRoutes.url_for('assets', 'timework/calc-zp-print.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

var Comp = function($scope, $http, $q, $timeout, $element, appRoutes, Util){
  var $c = this;
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $c.$onInit = function() {
    if(!$c.param) $c.param = {};
    //~ $c['крыжик начислено'] = true;
    if(!$c.param['месяц']) $c.param['месяц'] = dateFns.format(new Date(), 'YYYY-MM-DD');
    //~ $c.param['общий список'] = true;
    //~ $c.data = {};
    $c['все крыжики'] = true;
    $c.LoadData().then(function(){$c.ready = true;});
    
  };
  
  $c.LoadData = function(){
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель/квитки расчет/данные'), $c.param, {timeout: $c.cancelerHttp.promise})
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        $c.data= resp.data;
      });
    
  };
  
  /*$c.FilterData = function(item){
    //~ return true;
    return item['начислено'].some(function(n){ return !!n;});
  };*/
  //~ var filter_true = function(){return true};
  /*$c.FilterObj = function(data){
    if (!$c['крыжик начислено']) return filter_true;
    return function(obj, index){// this - запись по профилю
      return !!data['начислено'][index];
    };
    
  };*/
  
  $c.InitProfile = function(data){
    data['печать']  = !data['печать'];
    //~ data['начислено сумма'] = $c.Sum(data['начислено']);
    //~ data['показать расчет'] = parseFloat(data['РасчетЗП']).toLocaleString('ru-RU') != data['начислено сумма'];
    
  };
  
  $c.InitRowObj = function(row, data, index){// строка объекта в таблице объектов(по твбелю)
    //~ if(row._show === undefined) return true;
    if(!data['Начислено'][index])  // в запрос сводки попадают объекты без начисления, но с часами
      ['объекты/name', 'всего смен', 'всего часов', 'КТУ1', 'КТУ2', 'Ставка', 'Примечание', 'Начислено', 'объекты'].map(function(key){ data[key].splice(index, 1); });

    //~ row.style1 = data['объекты'].length == 1 ? {'height':'3rem'} : {};
  };
  
  $c.SumTabel = function(data, name){///сумма по табельным строкам
    var s = 0;
    if(data[name]) data[name].map(function(val){ s += parseFloat(val); });
    if (name == 'Начислено') {
      s += parseFloat(data['Суточные/начислено'] || 0) + parseFloat(data['Переработка/начислено'] || 0) + parseFloat(data['Отпускные/начислено'] || 0);
      if (data['Доп. часы замстрой/начислено']) data['Доп. часы замстрой/начислено'].filter($c.isVal).map(function(val){ s += val; });
    }
    return s;//.toLocaleString('ru-RU');
  };
  
  $c.FormatSm = function(data){
    var r = 'смен';
    if(/1[1234]$/.test(data)) return r;
    if(/1$/.test(data)) return r+'а';
    if(/[234]$/.test(data)) return r+'ы';
    
    return r;
    
  };
  
  $c.InitRowCalc = function(row){
    //~ var row = JSON.parse(rStr);
    row.sum = parseFloat(Util.numeric(row['сумма']));
    //~ console.log("InitRowCalc", row);
    return row;
    
    
  };
  
    ///сумма ручная или по ставке и КТУ
  $c.IsHandSum = function(row, index){
    if (!row['Ставка'][index]) return false;
    return (parseFloat(Util.numeric(row['КТУ2'][index] || row['КТУ1'][index]) || 1)
      * parseFloat(Util.numeric(row['Ставка'][index] || 0))
      * parseFloat(Util.numeric(row['всего часов'][index] || 0)))
        != parseFloat(Util.numeric(row['Начислено'][index]) || -1);
    
  };
  
  $c.TogglePrintAll = function(item){
    item['печать'] = $c['все крыжики'];
    
  };
  
  $c.RowSpanObj = function(data){
    return data['объекты'].length+1+ (data['Суточные/начислено'] ? 1 : 0) + (data['Переработка/начислено'] ? 1 : 0) + (data['Доп. часы замстрой/начислено'] && data['Доп. часы замстрой/начислено'].some($c.isVal) ? 1 : 0);
  };
  
  $c.isVal = function(val){ return !!val; };
  

  
};


/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeworkCalcZpPrint', {
  controllerAs: '$c',
  templateUrl: "квитки/расчет",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})

;

}());