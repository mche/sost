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
        $ctrl.data['расчеты'] = (resp.data.shift() || []).map(function(row){
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
        $scope.CategoryParam = {"стиль":'справа', disabled000: true, "не добавлять новые позиции": true, };//'не добавлять новые позиции' "не добавлять новые позиции": true,
        
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

$ctrl.CatClass = function(row){
  //~ console.log("CatClass", row);
  return 'cat-'+row['категории'][row['категории'].length-1];
  
};

$ctrl.InitPayRow = function(row){
  var catId = row["категория/id"] || row.category.id;
  if(!row.category) row.category = {topParent: {id:3}, selectedItem: {"id": catId}};
  else if (row.category.id === 0) row.categoryParam = {"стиль":'справа', disabled: false, "не добавлять новые позиции": true, };
  
  if (!row.category.selectedItem) row.category.selectedItem = {"id": catId};
  if (!row.category.selectedItem.id) row.category.selectedItem.id = catId;
  if (!row['начислить'] && !row['удержать']) {
    var val = $ctrl.PrevCatValue(catId);///
    if (val) {
      if (val['начислить']) row['начислить'] = val['начислить'];
      if (val['удержать']) row['удержать'] =  val['удержать'];
      $ctrl.Save(row, 0);
    }
  }
};

$ctrl.PrevCatValue = function(catId){
  var tr = $('.cat-'+catId, $element[0]).parent();
  var plus = $('.sum-plus', tr).eq(0).text();
  if (plus) return {'начислить': parseFloat(Util.numeric(plus))};
  var minus =  $('.sum-minus', tr).eq(0).text();
  if (minus) return {'удержать': parseFloat(Util.numeric(minus))};
  if (catId == 70755) return {'начислить': 1537};
  if (catId == 60927) return {'удержать': 3477};
};

$ctrl.onSelectCategory = function(item, row){
  //~ console.log("onSelectCategory", item, row);
  //~ if (!item || !item.id ) {// удаление строки
  row.category.selectedItem = item;
  if(!item || !item.id) row['начислить'] = row['удержать'] = undefined;
  else {
    var val = $ctrl.PrevCatValue(item.id) || {};
    if (val['начислить']) row['начислить'] = val['начислить'];
    if (val['удержать']) row['удержать'] =  val['удержать'];
  }
  $ctrl.Save(row, 0);
  //~ }
};

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
  
  row['поле статьи'] = undefined;$ctrl.Total
  row['профиль'] = $ctrl.param['профиль/id'] || $ctrl.param['профиль'].id;
  row['дата'] = $ctrl.param['месяц'];
  //~ row['примечание'] = [row['заголовок'], row['коммент']];
  
  if (timeout === 0) return $ctrl._Save(row);
  if (saveTimeout) $timeout.cancel(saveTimeout);
  saveTimeout = $timeout(function(){ 
    return $ctrl._Save(row);
  }, timeout || 600);
  return saveTimeout;
  
};

$ctrl._Save = function(row){
  return $http.post(appRoutes.url_for('расчеты выплаты ЗП/сохранить'), row)
    .then(function(resp){
      saveTimeout = undefined;
      if (resp.data.hasOwnProperty('error')) {
        $ctrl.error = resp.data.error;
        Materialize.toast('Ошибка сохранения', 1000, 'red');
      } else if (resp.data.hasOwnProperty('remove') && resp.data.remove.id) {
        //~ var idx = $ctrl.data['расчеты'].indexOf(row);
        //~ $ctrl.data['расчеты'].splice(idx, 1);
        Materialize.toast('Удалено успешно', 1000, 'green');
      } else {
        Materialize.toast('Сохранено успешно', 1000, 'green');
        //~ if(!row.id) $ctrl.data['расчеты'].push({});
        row.id = resp.data.id;
      }
      $ctrl.Total();
    });

};

$ctrl.Total = function(){
  //~ console.log("Total", $ctrl.param['профили']);
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
  var month = dateFns.format($ctrl.param['месяц'], 'MMMM YYYY', {locale: dateFns.locale_ru});
  var fio = $ctrl.param['профили'][0].names.join(' ');
  //~ var a2o = [[$ctrl.param['профиль'].id+'/'+fio+'/расчетЗП/'+month, -sum]];// для Util.Pairs2Object
  var send = {};
  send[fio+'(#'+$ctrl.param['профиль'].id +')'+' расчет ЗП за '+month]  = -sum;
  if (/*$ctrl.data['начислено']['дополнительно к расчетуЗП'] && */!$ctrl.data['закрыть']['коммент']) send[fio+'(#'+$ctrl.param['профиль'].id +')'+' доп начисления за '+month] = $ctrl.data['начислено']['дополнительно к расчетуЗП'];///  a2o.unshift( [$ctrl.param['профиль'].id+'/'+fio+'/всего доп начислений/'+month, $ctrl.data['начислено']['дополнительно к расчетуЗП']] );
  $timeout(function(){
    $rootScope.$broadcast('Баланс дополнить', send);///Util.Pairs2Object(a2o));
    //~ console.log("Событие Баланс дополнить запустил", send);
  });
  
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
          if ($ctrl.onClosePay) $ctrl.onClosePay({"item": $ctrl.data['закрыть']});
          if (total) $rootScope.$broadcast('Расчет ЗП/закрыт расчет', $ctrl.data);
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
  $ctrl.Save(row, 0);
  
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
