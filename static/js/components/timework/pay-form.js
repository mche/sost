(function () {'use strict';
/*
  Квиток выплаты ЗП после начисления
*/
var moduleName = "TimeWorkPayForm";
var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'appRoutes', 'Util']); //

var Comp = function  ($scope, $http, $q, $timeout, $element, $window,  appRoutes, Util) {  //function Comp
var $ctrl = this;
$scope.dateFns = dateFns;
$scope.parseFloat = parseFloat;
$scope.Util = Util;
//~ $scope.$timeout = $timeout;

$ctrl.$onInit = function() {
  $ctrl.data = {};
  $ctrl.LoadData().then(function(){
    $ctrl.ready = true;
    
  });
};

/*
первая строка - баланс на конец указ месяца
вторая строка - общее начисление на указ месяц
последующие строки - расчеты
*/
$ctrl.LoadData = function() {
  return $http.get(appRoutes.url_for('расчеты выплаты ЗП', [$ctrl.param['профиль/id'] || $ctrl.param['профиль'].id, $ctrl.param['месяц']]))
    .then(function(resp){
      if(resp.data.error) $ctrl.error = resp.data.error;
      else {
        $ctrl.data['баланс'] = resp.data.shift() || {"баланс":0};
        $ctrl.data['начислено'] = resp.data.shift() || {"начислено": 0};
        $ctrl.data['закрыть'] = resp.data.shift() || {};
        $ctrl.data['статьи'] = resp.data.shift() || [];
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
        
        if(!$ctrl.data['закрыть']['коммент']) $ctrl.data['расчеты'].push({});//"заголовок":'', "начислить":null, "удержать": null, "примечание":null
        $ctrl.Total();
      }
      
    });
  
};

var event_hide_ac = function(event){
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
};

$ctrl.FormatNum = function(num){
  if(!num) return;
  num = parseFloat(Util.numeric(num));
  return num;
};
var saveTimeout = undefined;
$ctrl.Save = function(row, timeout){
  if(!(row['заголовок'] && (row.id || row['начислить'] || row['удержать']) )) return;
  if (!!$ctrl.data['закрыть']['коммент']) return;// закрыт
  
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
        } else {
          Materialize.toast('Сохранено успешно', 1000, 'green');
          if(!row.id) $ctrl.data['расчеты'].push({});
          row.id = resp.data.id;
          $ctrl.Total();
        }
        
      });
  }, timeout || 600);
  
};

$ctrl.Total = function(){
  var sum = 0;
  $ctrl.data['расчеты'].map(function(row){
    if (row['начислить']) sum += parseFloat(Util.numeric(row['начислить']));
    if (row['удержать']) sum -= parseFloat(Util.numeric(row['удержать']));
    
  });
  $ctrl.total =  parseFloat(Util.numeric($ctrl.data['начислено']['начислено'])) + sum;//parseFloat(Util.numeric($ctrl.data['баланс']['баланс'])) + 
  return sum;
};

$ctrl.Commit = function(total){
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
