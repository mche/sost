(function () {'use strict';
/*
  Квиток выплаты ЗП после начисления
*/
var moduleName = "TimeWorkPayForm";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'Util', 'SVGCache', 'TreeItem']); //

var Comp = function  ($scope, $rootScope, $http, $q, $timeout, $element, $window,  appRoutes, Util) {  //function Comp
var $ctrl = this;
$scope.dateFns = dateFns;
$scope.parseFloat = parseFloat;
$scope.Util = Util;
  $scope.JSON = JSON;
//~ $scope.$timeout = $timeout;

$ctrl.$onInit = function() {
  $ctrl.data = {};
  $ctrl.LoadData().then(function(){
    $ctrl.ready = true;
    
    $scope.addCategory = Object.keys($ctrl.addCategory);
    
  });
};

/*

первая строка - 
вторая строка - 
...
*/
$ctrl.LoadData = function() {
  return $http.get(appRoutes.url_for('расчеты выплаты ЗП', [$ctrl.param['профиль/id'] || $ctrl.param['профиль'].id, $ctrl.param['месяц']]))
    .then(function(resp){
      if(resp.data.error) $ctrl.error = resp.data.error;
      else {
        $ctrl.data['баланс на начало месяца'] = resp.data.shift() || {"баланс":0};
        $ctrl.data['баланс на конец месяца'] = resp.data.shift() || {"баланс":0};
        $ctrl.data['начислено'] = resp.data.shift() || {"начислено": 0};
        $ctrl.data['выплачено'] = resp.data.shift() || {"выплачено": 0};
        $ctrl.data['закрыть'] = resp.data.shift() || {};
        $ctrl.data['расчеты в других закрытых месяцах'] = resp.data.shift() || [];
        //~ $ctrl.data['статьи'] = resp.data.shift() || [];
        $ctrl.data['расчеты'] = resp.data.map(function(row){
          //~ var split = (row['примечание'] +'').split(/\n/, 1);
          //~ row['заголовок'] = split[0];
          //~ row['коммент'] = split[1];
          var sum = $ctrl.FormatNum(row['сумма']);
          row['сумма'] = undefined;
          if (sum > 0 ) row['начислить'] = sum;
          if (sum < 0 ) row['удержать'] = -sum;
          return row;
        });
        
        $scope.CategoryData = $http.get(appRoutes.url_for('категории/список', 3));
        $scope.CategoryParam = {"стиль":'справа', disabled: true,};//'не добавлять новые позиции' "не добавлять новые позиции": true,
        
        if($ctrl.data['закрыть']['коммент']) {
          $ctrl.total = parseFloat(Util.numeric($ctrl.data['закрыть']['коммент']));
          //~ $ctrl.SendEventBalance($ctrl.total);
          $scope.CategoryParam.disabled = true;
          
        } else {
          //~ $ctrl.data['расчеты'].push({});//"заголовок":'', "начислить":null, "удержать": null, "примечание":null
          //~ $ctrl.Total();
        }
        $ctrl.Total();
        
      }
      
    });
  
};

$ctrl.InitPayRow = function(row){
  if(!row.category) row.category = {topParent: {id:3}, selectedItem: {"id": row["категория/id"]}};
  else if (row.category.id === 0) row.categoryParam = {"стиль":'справа', disabled: false,};
  
};

$ctrl.onSelectCategory = function(item, row){
  console.log("onSelectCategory", item, row);
  //~ if (!item || !item.id ) {// удаление строки
  if(!item || !item.id) row['начислить'] = row['удержать'] = undefined;
    row.category.selectedItem = item;
    $ctrl.Save(row);
  //~ }
};

/*var event_hide_ac = function(event){
  var field = event.data;
    var list = $(event.target).closest('.autocomplete-content').eq(0);
    if(list.length) return;
    var ac = field.autocomplete();
    if(ac) ac.hide();
    $timeout(function(){$(document).off('click', event_hide_ac);});
    return false;
  };
$ctrl.AutoComplete = function(row, toggle){ // статья
  $timeout(function(){
  if( !row['поле статьи'] ) row['поле статьи'] = $('input[name="заголовок"]', $('#строка-расчета-'+(row.id || 0)));//$('input', $(event.target).parent());
  var ac = row['поле статьи'].autocomplete();
  if (ac) {
    if(toggle) {
      ac.toggleAll();
      $timeout(function(){$(document).on('click', row['поле статьи'], event_hide_ac);});
    }
    return;
  }
  //~ console.log("AutoComplete", row['поле статьи'], $ctrl.data['статьи']);
  
  ac = row['поле статьи'].autocomplete({
    lookup: $ctrl.data['статьи'].map(function(val){ return {value: val}; }),
    appendTo: row['поле статьи'].parent(),
    suggestionClass: "autocomplete-suggestion right-align",
    onSelect: function (suggestion) {
       $timeout(function(){ row['заголовок'] = suggestion.value; $ctrl.Save(row);});//$ctrl.Save(row);
    },
    
  });
  
  //~ $timeout(function(){ row['поле статьи'].autocomplete().toggleAll(); });
  });
};*/

$ctrl.FormatNum = function(num){
  if(!num) return;
  num = parseFloat(Util.numeric(num));
  return num;
};
var saveTimeout = undefined;
$ctrl.Save = function(row, timeout){
  if (!!$ctrl.data['закрыть']['коммент']) return;// закрыт
  var catOK = (row.category.selectedItem && row.category.selectedItem.id) || (row.category.newItems && row.category.newItems.some(function(it){ return !!it.title; }));
  var deleteOK = !!row.id && !catOK && !row['начислить'] && !row['удержать'];
  //~ console.log(row.category, !catOK, deleteOK);
  if (!deleteOK && !(!!catOK && (!!row.id || !!row['начислить'] || !!row['удержать']) )) return;
  
  row['поле статьи'] = undefined;
  row['профиль'] = $ctrl.param['профиль/id'] || $ctrl.param['профиль'].id;
  row['дата'] = $ctrl.param['месяц'];
  //~ row['примечание'] = [row['заголовок'], row['коммент']];
  
  if (saveTimeout) $timeout.cancel(saveTimeout);
  saveTimeout = $timeout(function(){
    $http.post(appRoutes.url_for('расчеты выплаты ЗП/сохранить'), row)
      .then(function(resp){
        saveTimeout = undefined;
        if (resp.data.hasOwnProperty('error')) {
          $ctrl.error = resp.data.error;
          Materialize.toast('Ошибка сохранения', 1000, 'red');
        } else if (resp.data.hasOwnProperty('remove') && resp.data.remove.id) {
          var idx = $ctrl.data['расчеты'].indexOf(row);
          $ctrl.data['расчеты'].splice(idx, 1);
          Materialize.toast('Удалено успешно', 1000, 'green');
        } else {
          Materialize.toast('Сохранено успешно', 1000, 'green');
          //~ if(!row.id) $ctrl.data['расчеты'].push({});
          row.id = resp.data.id;
        }
        $ctrl.Total();
      });
  }, timeout || 600);
  
};

$ctrl.Total = function(){
  var sum = 0;
  $ctrl.data['начислено']['дополнительно к расчетуЗП'] = 0; //сумма всех доп начислений в этом мес
  $ctrl.data['расчеты'].map(function(row){
    if (row['начислить']) {
      var v = parseFloat(Util.numeric(row['начислить']));
      sum += v;
      $ctrl.data['начислено']['дополнительно к расчетуЗП'] += v;
    }
    if (row['удержать']) sum -= parseFloat(Util.numeric(row['удержать']));
    
  });
  $ctrl.total =  parseFloat(Util.numeric($ctrl.data['начислено']['начислено'])) + sum;//parseFloat(Util.numeric($ctrl.data['баланс']['баланс'])) + 
  
  $ctrl.SendEventBalance($ctrl.total);
  
  return sum;
};

$ctrl.SendEventBalance = function(sum) {
/*
  $rootScope.$emit запустит событие только для слушателей, подписанных через $rootScope.$on
  $rootScope.$broadcast уведомит как все $rootScope.$on, так и $scope.$on
*/
  sum = sum || $ctrl.total;
  var a2o = [[$ctrl.param['профиль'].id+'/расчетЗП/'+$ctrl.param['профили'][0].names.join(' '), -sum]];// для Util.Pairs2Object
  if ($ctrl.data['начислено']['дополнительно к расчетуЗП'] && !$ctrl.data['закрыть']['коммент']) a2o.unshift( [$ctrl.param['профиль'].id+'/всего доп начислений/'+$ctrl.param['профили'][0].names.join(' '), $ctrl.data['начислено']['дополнительно к расчетуЗП']] );
  $timeout(function(){
    $rootScope.$broadcast('Баланс дополнить', Util.Pairs2Object(a2o));
    //~ console.log("Событие Баланс дополнить запустил", sum);
  }, 500);
  
};

$ctrl.Commit = function(total){//закрыть/сбросить закрытие(null) расчет
  if(total === undefined) total = $ctrl.total;
  
  $ctrl.data['закрыть']["профиль"] =  $ctrl.param['профиль/id'] || $ctrl.param['профиль'].id;
  $ctrl.data['закрыть']["дата"] = dateFns.format(dateFns.startOfMonth($ctrl.param['месяц']), 'YYYY-MM-DD');
  var prev_total = $ctrl.data['закрыть']['коммент'];
  $ctrl.data['закрыть']['коммент'] = total;
  
  $http.post(appRoutes.url_for('расчеты выплаты ЗП/завершить'), $ctrl.data['закрыть'])
      .then(function(resp){
        if (resp.data.error) {
          $ctrl.error = resp.data.error;
          $ctrl.data['закрыть']['коммент'] = prev_total;
        }
        else {
          Materialize.toast('Сохранено успешно', 1000, 'green');
          $ctrl.data['закрыть'].id = resp.data.id;
          if($ctrl.onClosePay) $ctrl.onClosePay({"item": $ctrl.data['закрыть']});
        }
      });
  
};

$ctrl.addCategory = {
  'НДФЛ': function(){
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 60927}} );
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 70755}} );
  
  },//{topParent: {id:3}, selectedItem: {"id": row["категория/id"]}}
  'Документы':function(){
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 71498}} );
  },
  'Штраф':function(){
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 74315}} );
  },
  'Карта':function(){
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 75970}} );
  },
   'Аванс':function(){
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 76919}} );
  },
  'Алименты':function(){
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 76836}} );
  },
  '...':function(){
    $ctrl.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 0, "selectedItem":{}}} );
  },
};
$ctrl.AddRowsCategory = function(name){//добавление готовых наборов строк
  var last_idx = $ctrl.data['расчеты'].length-1,
    last = $ctrl.data['расчеты'][last_idx];
  if(   !(last && last.category && last.category.selectedItem && last.category.selectedItem.id) ) $ctrl.data['расчеты'].pop();
  if ($ctrl.addCategory[name]) $ctrl.addCategory[name]();
  
};

$ctrl.RemoveRow = function(row, idx) {
  //~ console.log("RemoveRow", row);
  if(!row.id) return $ctrl.data['расчеты'].splice(idx, 1);
  row['начислить'] = row['удержать'] = undefined;
    //~ row.category.selectedItem = item;
  $ctrl.Save(row);
  
};

};

/*==========================================================*/
module

//~ .factory(moduleName+"Data", Data)

.component('timeworkPayForm', {
  templateUrl: "time/work/pay/form",
  bindings: {
    param: '<',
    onClosePay:'&', // момент закрытия расчета
  },
  controller: Comp
})

;

}());
