(function () {'use strict';
/*
  Квиток выплаты ЗП после начисления
*/
var moduleName = "TimeWorkPayForm";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['appRoutes', 'Util', 'TreeItem', 'Категории']); //

const Comp = function  ($scope, $rootScope, $http, $q, $timeout, $element, $window,  appRoutes, Util, $Категории) {  //function Comp
var $c = this;
$scope.dateFns = dateFns;
$scope.parseFloat = parseFloat;
$scope.Util = Util;
  $scope.JSON = JSON;
//~ $scope.$timeout = $timeout;

$c.$onInit = function() {
  $c.data = {};
  $c.LoadData().then(function(){
    $c.ready = true;
    $c.LoadDataClosedMonths();
    $scope.addCategory = Object.keys($c.addCategory);
    
  });
};

/*

первая строка - 
вторая строка - 
...
*/
$c.LoadData = function() {
  return $http.get(appRoutes.url_for('расчеты выплаты ЗП', [$c.param['профиль/id'] || $c.param['профиль'].id, $c.param['месяц']]))
    .then(function(resp){
      if(resp.data.error) $c.error = resp.data.error;
      else {
        $c.data['баланс на начало месяца'] = resp.data.shift() || {"баланс":0};
        $c.data['баланс на конец месяца'] = resp.data.shift() || {"баланс":0};
        $c.data['начислено'] = resp.data.shift() || {"начислено": 0};
        $c.data['выплачено'] = resp.data.shift() || {"выплачено": 0};
        $c.data['закрыть'] = resp.data.shift() || {};
        //~ $c.data['расчеты в других закрытых месяцах'] = resp.data.shift() || [];
        //~ $c.data['статьи'] = resp.data.shift() || [];
        $c.data['расчеты'] = (resp.data.shift() || []).map(function(row){
          //~ var split = (row['примечание'] +'').split(/\n/, 1);
          //~ row['заголовок'] = split[0];
          //~ row['коммент'] = split[1];
          var sum = $c.FormatNum(row['сумма']);
          row['сумма'] = undefined;
          if (sum > 0 ) row['начислить'] = sum;
          if (sum < 0 ) row['удержать'] = -sum;
          return row;
        });
        
        $scope.CategoryData = $Категории.Data(3).Load();///$http.get(appRoutes.url_for('категории/список', 3));
        $scope.CategoryParam = {"стиль":'справа', disabled000: true, "не добавлять новые позиции": false, };//'не добавлять новые позиции' "не добавлять новые позиции": true,
        
        if($c.data['закрыть']['коммент']) {
          $c.total = parseFloat(Util.numeric($c.data['закрыть']['коммент']));
          //~ $c.SendEventBalance($c.total);
          $scope.CategoryParam.disabled = true;
          
        } else {
          //~ $c.data['расчеты'].push({});//"заголовок":'', "начислить":null, "удержать": null, "примечание":null
          //~ $c.Total();
        }
        $c.Total();
        
      }
      
    });
  
};

$c.LoadDataClosedMonths = function(){
  return $http.post(appRoutes.url_for('расчеты выплаты ЗП/другие месяцы'), {"профиль": $c.param['профиль/id'] || $c.param['профиль'].id, "месяц": $c.param['месяц']})
    .then(function(resp){
      if (!resp.data) return;
      if(resp.data.error) {
        $c.error = resp.data.error;
        Materialize.toast('Ошибка получения данных: '+resp.data.error, 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp');
        return;
      }
      if (!$c.data['расчеты в других закрытых месяцах']) $c.data['расчеты в других закрытых месяцах'] = [];
      Array.prototype.push.apply($c.data['расчеты в других закрытых месяцах'], resp.data);
    },
    function(){
      Materialize.toast('Ошибка получения данных', 7000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp');
      
    }
  );
  
};

$c.CatClass = function(row){
  //~ console.log("CatClass", row);
  return 'cat-'+row['категории'][row['категории'].length-1];
  
};

$c.InitPayRow = function(row){
  var catId = row["категория/id"] || row.category.id;
  if(!row.category) row.category = {topParent: {id:3}, selectedItem: {"id": catId}};
  else if (row.category.id === 0) row.categoryParam = {"стиль":'справа', disabled: false, "не добавлять новые позиции": false, };
  
  if (!row.category.selectedItem) row.category.selectedItem = {"id": catId};
  if (!row.category.selectedItem.id) row.category.selectedItem.id = catId;
  if (!row['начислить'] && !row['удержать']) {
    var val = $c.PrevCatValue(catId);///
    if (val) {
      if (val['начислить']) row['начислить'] = val['начислить'];
      if (val['удержать']) row['удержать'] =  val['удержать'];
      $c.Save(row, 0);
    }
  }
};

$c.PrevCatValue = function(catId){
  var tr = $('.cat-'+catId, $element[0]).parent();
  var plus = $('.sum-plus', tr).eq(0).text();
  if (plus) return {'начислить': parseFloat(Util.numeric(plus))};
  var minus =  $('.sum-minus', tr).eq(0).text();
  if (minus) return {'удержать': parseFloat(Util.numeric(minus))};
  if (catId == 70755) return {'начислить': 1250};/// компенсация 1537
  if (catId == 60927) return {'удержать': 3650}; /// патент 3477
};

$c.onSelectCategory = function(item, param, row){
  //~ console.log("onSelectCategory", item, arguments);
  //~ var row=param['строка расчетов'];
  //~ if (!item || !item.id ) {// удаление строки
  row.category.selectedItem = item;
  if(!item || !item.id) row['начислить'] = row['удержать'] = undefined;
  else {
    var val = $c.PrevCatValue(item.id) || {};
    if (val['начислить']) row['начислить'] = val['начислить'];
    if (val['удержать']) row['удержать'] =  val['удержать'];
  }
  $c.Save(row, 0);
  //~ }
};

$c.FormatNum = function(num){
  if(!num) return;
  num = parseFloat(Util.numeric(num));
  return num;
};
$c.Save = function(row, timeout){
  if (!!$c.data['закрыть']['коммент']) return;// закрыт
  var catOK = (row.category.selectedItem && row.category.selectedItem.id) || (row.category.newItems && row.category.newItems.some(function(it){ return !!it.title; }));
  var deleteOK = !!row.id && !catOK && !row['начислить'] && !row['удержать'];
  //~ console.log(row.category, !catOK, deleteOK);
  if (!deleteOK && !(!!catOK && (!!row.id || !!row['начислить'] || !!row['удержать']) )) return;
  
  row['поле статьи'] = undefined;
  row['профиль'] = $c.param['профиль/id'] || $c.param['профиль'].id;
  row['дата'] = $c.param['месяц'];
  //~ row['примечание'] = [row['заголовок'], row['коммент']];
  
  if (timeout === 0) return $c._Save(row);
  if ($c.saveTimeout) $timeout.cancel($c.saveTimeout);
  $c.saveTimeout = $timeout(function(){ 
    return $c._Save(row);
  }, timeout || 600);
  return $c.saveTimeout;
  
};

$c._Save = function(row){
  if (row.category.selectedItem.id === 0) delete row.category.selectedItem.id;///костыль откуда 0
  return $http.post(appRoutes.url_for('расчеты выплаты ЗП/сохранить'), row)
    .then(function(resp){
      $c.saveTimeout = undefined;
      if (resp.data.hasOwnProperty('error')) {
        $c.error = resp.data.error;
        Materialize.toast('Ошибка сохранения: '+resp.data.error, 3000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp');
      } else if (resp.data.hasOwnProperty('remove') && resp.data.remove.id) {
        //~ var idx = $c.data['расчеты'].indexOf(row);
        //~ $c.data['расчеты'].splice(idx, 1);
        Materialize.toast('Удалено успешно', 1000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp');
      } else {
        Materialize.toast('Сохранено успешно', 1000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp');
        //~ if(!row.id) $c.data['расчеты'].push({});
        row.id = resp.data.id;
        if ((row.category.newItems && row.category.newItems.some(function(it){ return !!it.title; }))) {
          //~ $scope.CategoryData = undefined;
          row.category = undefined;
          $timeout(function(){
            row.category = {topParent: {id:3}, selectedItem: {"id": resp.data['связь/категория'].id1}};
            //~ $scope.CategoryData = $http.get(appRoutes.url_for('категории/список', 3));
            $scope.CategoryData = $Категории.Clear(3).Data(3).Load();
          });
          
        }
      }
      $c.Total();
    }, function(){
          Materialize.toast('Ошибка сохранения. Проверьте работу сети', 10000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        });

};

$c.Total = function(){
  //~ console.log("Total", $c.param['профили']);
  var sum = 0;
  $c.data['начислено']['дополнительно к расчетуЗП'] = 0; //сумма всех доп начислений в этом мес
  $c.data['расчеты'].map(function(row){
    if (row['начислить']) {
      var v = parseFloat(Util.numeric(row['начислить']));
      sum += v;
      $c.data['начислено']['дополнительно к расчетуЗП'] += v;
    }
    if (row['удержать']) sum -= parseFloat(Util.numeric(row['удержать']));
    
  });
  $c.total =  parseFloat(Util.numeric($c.data['начислено']['начислено'])) + sum;//parseFloat(Util.numeric($c.data['баланс']['баланс'])) + 
  
  $c.SendEventBalance($c.total);
  
  return sum;
};

$c.SendEventBalance = function(sum) {
/*
  $rootScope.$emit запустит событие только для слушателей, подписанных через $rootScope.$on
  $rootScope.$broadcast уведомит как все $rootScope.$on, так и $scope.$on
*/
  sum = sum || $c.total;
  var month = dateFns.format($c.param['месяц'], 'MMMM YYYY', {locale: dateFns.locale_ru});
  var fio = $c.param['профили'][0].names.join(' ');
  //~ var a2o = [[$c.param['профиль'].id+'/'+fio+'/расчетЗП/'+month, -sum]];// для Util.Pairs2Object
  var send = {};
  send[fio+'(#'+$c.param['профиль'].id +')'+' расчет ЗП за '+month]  = -sum;
  if (/*$c.data['начислено']['дополнительно к расчетуЗП'] && */!$c.data['закрыть']['коммент']) send[fio+'(#'+$c.param['профиль'].id +')'+' доп начисления за '+month] = $c.data['начислено']['дополнительно к расчетуЗП'];///  a2o.unshift( [$c.param['профиль'].id+'/'+fio+'/всего доп начислений/'+month, $c.data['начислено']['дополнительно к расчетуЗП']] );
  $timeout(function(){
    $rootScope.$broadcast('Баланс дополнить', send);///Util.Pairs2Object(a2o));
    //~ console.log("Событие Баланс дополнить запустил", send);
  });
  
};

$c.Commit = function(total){//закрыть/сбросить закрытие(null) расчет
  if ($c.cancelerHttp) return;
  if (total === undefined) total = $c.total;
  
  $c.data['закрыть']["профиль"] =  $c.param['профиль/id'] || $c.param['профиль'].id;
  $c.data['закрыть']["дата"] = dateFns.format(dateFns.startOfMonth($c.param['месяц']), 'YYYY-MM-DD');
  var prev_total = $c.data['закрыть']['коммент'];
  $c.data['закрыть']['коммент'] = total;
  
  $c.cancelerHttp = true;
  
  $http.post(appRoutes.url_for('расчеты выплаты ЗП/завершить'), $c.data['закрыть'])
      .then(function(resp){
        $c.cancelerHttp = undefined;
        if (resp.data.error) {
          $c.error = resp.data.error;
          $c.data['закрыть']['коммент'] = prev_total;
        }
        else {
          Materialize.toast('Сохранено успешно', 1000, 'green-text text-darken-4 green lighten-4 fw500 border animated zoomInUp');
          $c.data['закрыть'].id = resp.data.id;
          if ($c.onClosePay) $c.onClosePay({"item": $c.data['закрыть']});
          if (total) $rootScope.$broadcast('Расчет ЗП/закрыт расчет', $c.data);
        }
      }, function(){
          Materialize.toast('Ошибка сохранения. Проверьте работу сети', 10000, 'red-text text-darken-3 red lighten-3 fw500 border animated flash fast');
        });
  
};

$c.addCategory = {
  'НДФЛ': function(){
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 60927}} );
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 70755}} );
  
  },//{topParent: {id:3}, selectedItem: {"id": row["категория/id"]}}
  'Документы':function(){
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 71498}} );
  },
  'Штраф':function(){
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 74315}} );
  },
  'Карта':function(){
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 75970}} );
  },
   'Аванс':function(){
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 76919}} );
  },
  'Алименты':function(){
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 76836}} );
  },
  '...':function(){
    $c.data['расчеты'].push( {"category": {"topParent": {id:3}, id: 0, "selectedItem":{}}} );
  },
};
$c.AddRowsCategory = function(name){//добавление готовых наборов строк
  var last_idx = $c.data['расчеты'].length-1,
    last = $c.data['расчеты'][last_idx];
  if(   !(last && last.category && last.category.selectedItem && last.category.selectedItem.id) ) $c.data['расчеты'].pop();
  if ($c.addCategory[name]) $c.addCategory[name]();
  
};

$c.RemoveRow = function(row, idx) {
  //~ console.log("RemoveRow", row);
  if(!row.id) return $c.data['расчеты'].splice(idx, 1);
  row['начислить'] = row['удержать'] = undefined;
    //~ row.category.selectedItem = item;
  $c.Save(row, 0);
  
};

};

/*==========================================================*/
module

//~ .factory(moduleName+"Data", Data)

.component('timeworkPayForm', {
  controllerAs: '$c',
  templateUrl: "time/work/pay/form",
  bindings: {
    param: '<',
    onClosePay:'&', // момент закрытия расчета
  },
  controller: Comp
})

;

}());
