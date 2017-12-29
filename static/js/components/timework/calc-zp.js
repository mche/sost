(function () {'use strict';
/*
  дополнительные начисления/удержания по ЗП
*/
var moduleName = "Расчет ЗП";
try {angular.module(moduleName); return;} catch(e) { } 
//~ console.log("module Components", angular.module('Components'));

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'TemplateCache', 'appRoutes', 'WaltexMoney', 'Util', 'SVGCache', 'TimeWorkPayForm', 'TimeWorkReportLib']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {
    
    $scope.param = {};
    
    TemplateCache.split(appRoutes.url_for('assets', 'timework/calc-zp.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

/*------------------------------------------*/
var Comp = function  ($scope, $http, $q, $timeout, $element, $window, $compile,       appRoutes, Util, TimeWorkReportLib) {  //function Comp
  var $ctrl = this;
  //~ Comp.__super__.constructor.apply($ctrl);// [2].concat(args)
  //~ console.log("ctrl obj ", $ctrl);
  $scope.dateFns = dateFns;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  new TimeWorkReportLib($ctrl, $scope, $timeout, $element, $http, $compile, appRoutes);
  
  $ctrl.$onInit = function() {
    if(!$ctrl.param) $ctrl.param = {};
    if(!$ctrl.param['месяц']) $ctrl.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    $ctrl.data = {};
    
    var async = [];
    //~ async.push();
    async.push($ctrl.LoadProfiles());
    async.push($ctrl.LoadData());
    $q.all(async).then(function(){
      $ctrl.ready= true;
      
      $timeout(function(){
        $('.modal', $($element[0])).modal({"dismissible": false,});
      });
      
    });
    
  };
  
  $ctrl.LoadData = function(){
    $ctrl.data['данные'] = undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/данные расчета ЗП'), $ctrl.param, {timeout: $ctrl.cancelerHttp.promise})//appRoutes.url_for('табель рабочего времени/отчет/данные')
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        $ctrl.data['данные'] = resp.data;
        $ctrl.data['данные/профили']=undefined; // для фильтации по одному ФИО
      }
      
      );
    
  };
  

  /*логика фильтрации строк*/
  $ctrl.dataFilter = function() {// вернуть фильтующую функцию
    //~ console.log("dataFilter", obj);
    if($ctrl.filterProfile) return $ctrl.FilterProfile;
    if ($ctrl['фильровать без расчета ЗП']) return $ctrl.FilterCalcZP;
    return $ctrl.FilterTrue;
  };
  
  $ctrl.InitRow = function(row, index){
    row._index = index;
    var profile = $ctrl.RowProfile(row);
    var fio = profile.names.join(' ');
    if (!$ctrl.data['данные/профили']) $ctrl.data['данные/профили'] = {};
    if(!$ctrl.data['данные/профили'][fio]) $ctrl.data['данные/профили'][fio] = profile;
    
    //~ row._object = $ctrl.Obj(row);
    row['месяц'] = $ctrl.param['месяц'];
    //~ row['пересчитать сумму'] = true;
    
    /*перевести цифры начисления в true!!!! для крыжика*/
    if (row['Начислено'] && !angular.isArray(row['Начислено'])) {
      row['Сумма'] = row['Начислено'];
      //~ row['Начислено'] = true;
    }
    else if (row['Начислено'] && angular.isArray(row['Начислено'])) row['Начислено'].map(function(val, idx){
      if(val) {
        row['Сумма'][idx] = row['Начислено'][idx];
        //~ row['Начислено'][idx] = true;
        }
      
    });
    
    if (row['Сумма'] && !angular.isArray(row['Сумма'])) row['Сумма'] = parseFloat(Util.numeric(row['Сумма'])).toLocaleString('ru-RU');//row['Сумма'].replace(text2numRE, '').replace(/,/, '.')
    else if (row['Сумма'] && angular.isArray(row['Сумма'])) row['Сумма'].map(function(val, idx){
      if(!val) return;
      row['Сумма'][idx] = parseFloat(Util.numeric(val)).toLocaleString('ru-RU');//val.replace(text2numRE, '').replace(/,/, '.')
      //~ else row['Сумма'][idx] = val.toLocaleString('ru-RU');
    });
    //~ else /*нет суммы*/  $ctrl.DataSumIf(row); будет в шаблоне
    
    /*if (angular.isArray(row['Суточные/сумма']))  row['показать суточные'] = row['Суточные/сумма'].some(function(it){ return !!it; });
    else row['показать суточные'] = !!row['Суточные/сумма'];*/
    
    row['стиль строки объекта'] = {"height": '2rem', "padding": '0.25rem 0rem'};
    //~ if(!row['Суточные/смены']) row['Суточные/смены'] = $ctrl.DataSumTotal('всего смен', row, 'Суточные').toLocaleString('ru-RU');
    
    if (row['Суточные/начислено']) row['Суточные/сумма'] = parseFloat(Util.numeric(row['Суточные/начислено'])).toLocaleString('ru-RU');
    if (row['Суточные/сумма']) row['показать суточные'] = true;
    
    if (row['Отпускные/начислено']) row['Отпускные/сумма'] = parseFloat(Util.numeric(row['Отпускные/начислено'])).toLocaleString('ru-RU');
    if (row['Отпускные/сумма']) row['показать отпускные'] = true;
    
    //~ if(row['показать суточные'] && !row['Суточные/сумма']) $ctrl.SumSut(row);
    //~ if(!row['Сумма']) row['Сумма'] = $ctrl.DataSum(row);
    
  };
  
  /*************Детально по профилю*************/
  $ctrl.ShowDetail = function(row){// показать по сотруднику модально детализацию
    if(row ) $ctrl.showDetail = row;
    else row = $ctrl.showDetail;
    
    row['параметры расчетов'] = undefined;
    return $timeout(function(){
      row['параметры расчетов'] = $ctrl.ParamDetail(row);//{"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, }, "move":{"id": 3}, "сумма": -row["РасчетЗП"], }; // параметры для компонента waltex/money/table+form
      //~ row['данные формы ДС'] = {'профиль/id': row["профиль"], 'категория/id': 569};
    });
    
  };
  
  
};

/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeworkCalcZp', {
  templateUrl: "расчет ЗП",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})
;

}());