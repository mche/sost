(function () {'use strict';
/*
  дополнительные начисления/удержания по ЗП
*/
var moduleName = "Расчет ЗП";
try {angular.module(moduleName); return;} catch(e) { } 
//~ console.log("module Components", angular.module('Components'));

var module = angular.module(moduleName, ['TemplateCache', 'appRoutes', 'WaltexMoney', 'Объекты', 'Util', 'SVGCache', 'TimeWorkPayForm', 'TimeWorkReportLib']); // 'CategoryItem', 'WalletItem',  'ProfileItem', 'MoneyTable'

var Controll = function($scope, TemplateCache, appRoutes){
  var ctrl = this;
  
  ctrl.$onInit = function() {

    $scope.param = {}
    
    TemplateCache.split(appRoutes.url_for('assets', 'timework/calc-zp.html'), 1)
      .then(function(proms){
        ctrl.ready= true;
        
      });
    
  };
  
  
};

/*------------------------------------------*/
var Comp = function  ($scope, $http, $q, $timeout, $element, $window, $compile,       appRoutes, Util, TimeWorkReportLib) {  //function Comp
  var $c = this;
  var $ctrl = this;
  //~ Comp.__super__.constructor.apply($c);// [2].concat(args)
  //~ console.log("ctrl obj ", $c);
  
  new TimeWorkReportLib($c, $scope, /*$timeout,*/ $element/*, $http, $compile, appRoutes*/);
  
  $c.$onInit = function() {
    if(!$c.param) $c.param = {};
    if(!$c.param['фильтры']) $c.param['фильтры'] = {};
    if(!$c.param['месяц']) $c.param['месяц'] = dateFns.format(dateFns.addMonths(new Date(), -1), 'YYYY-MM-DD');
    $c.data = {};
    
    var async = [];
    //~ async.push();
    async.push($c.LoadProfiles());
    async.push($c.LoadObjects());
    async.push($c.LoadBrigs());
    //~ async.push($c.LoadData());
    $q.all(async).then(function(){

      $c.param['общий список'] = true;
      
      $c.LoadData().then(function(){
        $c.ready= true;
        $timeout(function(){
          $('.modal', $($element[0])).modal({"dismissible": false,});
        });
      });

    });
    
  };
  
  $c.LoadData = function(){
    //~ $c.data['данные'] = undefined;
    if(!$c.param['объект'] && !$c.param['общий список'] && !$c.param['бригада'] && !$c.param['общий список бригад']) return;//$q.defer().resolve();
    if (!$c.data['данные']) $c.data['данные'] = [];
    $c.data['данные'].length = 0;
    
    if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    $c.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('табель рабочего времени/данные расчета ЗП'), $c.param, {timeout: $c.cancelerHttp.promise})//appRoutes.url_for('табель рабочего времени/отчет/данные')
      .then(function(resp){
        $c.cancelerHttp.resolve();
        delete $c.cancelerHttp;
        //~ $c.data['объекты'] = {};
        //~ resp.data.shift().map(function(item){ item['проект'] = JSON.parse(item['проект/json'] || '{}'); $c.data['объекты'][item.id] = item; });
        //~ $c.data['данные'] = resp.data;
        Array.prototype.push.apply($c.data['данные'], resp.data);
        $c.data['данные/профили']=undefined; // для фильтации по одному ФИО
      }
      
      );
    
  };
  
  $c.SelectBrig = function(obj){
    $c.param['бригада'] = undefined;
    //~ $c.param['объект'] = undefined;
    $timeout(function(){
      $c.param['бригада'] = obj;
      //~ $c.LoadData();//.then(function(){});
    });
    
  };

  /***логика фильтрации строк***/
  $c.FilterData = function(row, idx) {// вернуть фильтующую функцию
    //~ return (!$c.filterProfile || $c.FilterProfile(row, idx)) && (!$c['фильтровать без расчета ЗП'] || !$c.FilterCalcZP(row, idx));
    var obj = this;
    
    return ($c.FilterObjects(row, idx, obj) || $c.FilterBrigs(row, idx, obj))
      && (!$c.param['фильтры']['профили'] || $c.FilterProfile(row, idx))
      && ($c.param['фильтры']['расчет ЗП'] === undefined || ($c.param['фильтры']['расчет ЗП'] ? $c.FilterCalcZP(row, idx) : !$c.FilterCalcZP(row, idx)))
     && ($c.param['фильтры']['офис'] === undefined || ($c.param['фильтры']['офис'] ? $c.FilterOfis(row, idx) : !$c.FilterOfis(row, idx)))
    ;
  };
  
  $c.FilterNach =  function(oName, idx){// фильтр начисления
    var row = this;
    return !!row['Начислено'] && row['Начислено'].some(function(n){ return !!n; });
  };
  
  $c.InitRow = function(row, index){
    row._index = index;
    var profile = $c.RowProfile(row);
    row._profile = profile;
    var fio = profile.names.join(' ');
    if (!$c.data['данные/профили']) $c.data['данные/профили'] = {};
    if(!$c.data['данные/профили'][fio]) $c.data['данные/профили'][fio] = profile;
    
    //~ row._object = $c.Obj(row);
    row['месяц'] = $c.param['месяц'];
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
    
    
    if (row['Доп. часы замстрой/начислено']) row['Доп. часы замстрой/начислено'].map(function(val, idx){ row['Доп. часы замстрой/начислено'][idx] = parseFloat(Util.numeric(val)).toLocaleString('ru-RU'); });
    
    /*if (angular.isArray(row['Суточные/сумма']))  row['показать суточные'] = row['Суточные/сумма'].some(function(it){ return !!it; });
    else row['показать суточные'] = !!row['Суточные/сумма'];*/
    
    row['стиль строки объекта'] = {"height": '2rem', "padding": '0.25rem 0rem'};
    //~ if(!row['Суточные/смены']) row['Суточные/смены'] = $c.DataSumTotal('всего смен', row, 'Суточные').toLocaleString('ru-RU');
    
    if (row['Суточные/начислено']) row['Суточные/сумма'] = parseFloat(Util.numeric(row['Суточные/начислено'])).toLocaleString('ru-RU');
    if (row['Суточные/сумма']) row['показать суточные'] = true;
    
    if (row['Отпускные/начислено']) row['Отпускные/сумма'] = parseFloat(Util.numeric(row['Отпускные/начислено'])).toLocaleString('ru-RU');
    if (row['Отпускные/сумма']) row['показать отпускные'] = true;
    
    //~ $c.InitRowOverTime(row);// переработка
    if (row['Переработка/начислено']) row['Переработка/сумма'] = parseFloat(Util.numeric(row['Переработка/начислено'])).toLocaleString('ru-RU');
    //~ if(row['показать суточные'] && !row['Суточные/сумма']) $c.SumSut(row);
    //~ if(!row['Сумма']) row['Сумма'] = $c.DataSum(row);
    
  };
  
  /*************Детально по профилю*************/
  $c.ShowDetail = function(row){// показать по сотруднику модально детализацию
    if(row ) $c.showDetail = row;
    else row = $c.showDetail;
    
    row['параметры расчетов'] = undefined;
    return $timeout(function(){
      row['параметры расчетов'] = $c.ParamDetail(row);//{"проект": {"id": 0}, "профиль":{"id": row["профиль"]}, "категория":{id:569}, "месяц": row["месяц"], "table":{"профиль":{"id": row["профиль"], "ready": true,}, }, "move":{"id": 3}, "сумма": -row["РасчетЗП"], }; // параметры для компонента waltex/money/table+form
      //~ row['данные формы ДС'] = {'профиль/id': row["профиль"], 'категория/id': 569};
    });
    
  };
  
  
};

/**********************************************************************/
module

.controller('Controll', Controll)

.component('timeworkCalcZp', {
  controllerAs: '$c',
  templateUrl: "расчет ЗП",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Comp
})
;

}());