(function () {'use strict';
/*
*/

var moduleName = "MoneyTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'WalletItem', 'DateBetween', /* 'Объект или адрес',*/]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $q, $timeout, $http, $element, appRoutes, WalletData,Util) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  $ctrl.broadcastBalance = {};// ключи/значения из разных компонентов
  $ctrl.broadcastBalanceQ = []; ///очередь
  $scope.$on('Баланс дополнить', function(event, data) {
    //~ console.log("принял Баланс дополнить", data);
    $ctrl.broadcastBalanceQ.push(data);
    
    if ($ctrl.broadcastBalanceTimeOut) $timeout.cancel($ctrl.broadcastBalanceTimeOut);
    $ctrl.broadcastBalanceTimeOut = $timeout(function(){
      $ctrl.broadcastBalanceTimeOut = undefined;
      while (data = $ctrl.broadcastBalanceQ.shift()) {
        Object.keys(data).map(function(key){
          $ctrl.broadcastBalance[key] = parseFloat(Util.numeric(data[key])) || 0;
        });
      }
      var balance =  $ctrl['баланс'];
      $ctrl['баланс'] = undefined;
      $ctrl.balanceTotal = 0;
      $timeout(function(){
        $ctrl['баланс'] = balance;
        
      });
    }, 100);
  });
  
  var filterDeleted = function(item){
    return item.id == this.id;
  };
  $scope.$on('Движение ДС/удалено', function(event, data) {
    var del = $ctrl.data.filter(filterDeleted, data).pop();
    if (del) $ctrl.data.splice($ctrl.data.indexOf(del), 1);
  });
  
  $ctrl.balanceTotal = 0;
  $ctrl.BalanceTotal = function(set){
    if (set !== undefined) $ctrl.balanceTotal += parseFloat(Util.numeric(set));
    return $ctrl.balanceTotal;
  };
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      //~ if(!$ctrl.param) $ctrl.param={};
      //~ if(!$ctrl.param.table) 
    var d1 = dateFns.startOfMonth(new Date());
    var d2 = dateFns.endOfMonth(new Date());
    if ( ((new Date())-d1)/1000/3600/24 < 12 ) d1 = dateFns.subMonths(d1, 1);

    
      var param = $.extend( true, {"table": {"дата":{"values":[dateFns.format(d1, 'YYYY-MM-DD'), dateFns.format(d2, 'YYYY-MM-DD')], "ready": true}, "сумма":{"values":[]}, "контрагент":{}, "кошелек":{"проект": $ctrl.param['проект'].id || $ctrl.param['проект']}, "профиль":{}, "объект": {}, "категория": {topParent:{id:3}}}},  $ctrl.param || {});// фильтры
      $.extend( true, $ctrl.param, param);
      //~ console.log("MoneyTable $onInit", $ctrl.param);
      $scope.param = $ctrl.param;
      //~ $scope.wallet2 = ($ctrl.param.move || 0) && ($ctrl.param.move.id == 2 ? 1 : 0);// внутренние дела и перемещения
      //~ console.log(moduleName, "$onInit", $ctrl.param.table);
      
      var async = [];
      
      async.push($ctrl.LoadData());
      async.push(WalletData.Load().then(function(resp){
        $ctrl['кошельки'] = WalletData.$Data();///resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
      }));
      $q.all(async).then(function(){
        
        $scope.CategoryData = $http.get(appRoutes.url_for('категории/список', 3));/*.then(function(resp){ Array.prototype.push.apply($scope.CategoryData, resp.data); })*/
        
      });
      
      $ctrl.ready = true;
      $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '5%',
            //~ noOverlay: true,
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              //~ console.log("modal ready", modal, trigger);
              $ctrl.modal_trigger = trigger;
            },
          });
        });
      
    //~ });
    
  };
  
  $ctrl.LoadData = function(append){//param
    //~ param = param || {};
    //~ if($scope.wallet2) param.wallet2 = $scope.wallet2;
    
    //~ if (param) Object.values(param).filter(function(data){ return data._ready}) angular.forEach(, function(){}).unshift();
    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.reject();
    $ctrl.cancelerHttp = $q.defer();
    
    var url_for;
    if($ctrl.param.move.id == 3) url_for = 'движение ДС/расчеты по профилю';// по профилям!
    else url_for = 'список движения ДС';
    
    $ctrl['баланс'] = undefined;
    if($ctrl.param.table['профиль'] && $ctrl.param.table['профиль'].ready) {// один или несколько профилей (для двойников)
      $http.post(appRoutes.url_for('движение ДС/баланс по профилю'), {"профиль": $ctrl.param.table['профиль'], "профили": $ctrl.param.table['профили'],})//"месяц": row["месяц"],
        .then(function(resp){
        $ctrl['баланс']  = parseFloat(Util.numeric(resp.data['баланс'] || 0));
      });
    } 
    
    return $http.post(appRoutes.url_for(url_for, $ctrl.param['проект'].id || $ctrl.param['проект']), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        $ctrl.cancelerHttp = undefined;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };
  
  $ctrl.InitRow = function(it) {//
    if(!it['сумма']) return '';
    var sum = parseFloat(it['сумма']);
    delete it["приход"];
    delete it["расход"];
    
    if(sum > 0) it["приход"] = Util.money(it['сумма']);//$ctrl.FormatMoney(it['сумма']);
    else it["расход"] = Util.money(it['сумма'].replace(/-/g, ""));//$ctrl.FormatMoney(it['сумма'].replace(/-/g, ""));
    
    if (it['кошелек/id']) it['$кошелек'] = $ctrl['кошельки'][it['кошелек/id']];
    if (it['кошелек2/id']) it['$кошелек2'] = $ctrl['кошельки'][it['кошелек2/id']];
  };
  //~ $ctrl.FormatMoney = function(val){
    //~ if(val === undefined || val === null ) return '';
    //~ return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  //~ };
  
  $ctrl.Edit = function(it){
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    $ctrl.param.id = it.id;
    delete $ctrl.param.newX;
    $ctrl.param.edit = undefined;
    $timeout(function(){$ctrl.param.edit = it;});
    //~ $ctrl.param.edit._init=true;
    
  };
  
  $ctrl.Delete = function(){
    var it = $ctrl.param.delete;
    delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $ctrl.AppendNew = function(){
    //~ console.log("AppendNew");
    var n = $ctrl.param.newX;
    //~ delete $ctrl.param.newX;
    delete n._append;
    n._new = true;
    //~ if (!$ctrl.data.length) return $window.location.reload();
    $ctrl.data.unshift(n);
    //~ $timeout(function(){
    //~ $ctrl['обновить'] = true;
    //~ $ctrl.ready = false;
    
    //~ $timeout(function(){
      //~ $('html, body').animate({
        //~ scrollTop: $("table tbody tr:first-child", $($element[0])).offset().top
      //~ }, 1500);
    //~ });
    
  };
  
  $ctrl.FilterObj  = function(item){/// по проекту
    if (!$ctrl.param["проект"].id) return true;
    return item.$проект.id == $ctrl.param["проект"].id;
    
  };
  
  $ctrl.OpenFilter = function(name){
    $('#'+name).modal('open');
    
  };
  
  $ctrl.Total = function(){
    var sum = [0.0, 0.0];
    $ctrl.data.map(function(it){
      var s = parseFloat(Util.numeric(it['сумма']));
      if (s > 0) sum[0] += s;
      else        sum[1] += s;
    });
    return sum;
  };

  
  $ctrl.Cancel = function(name){
    if(!$ctrl.param.table[name].ready) return;
    $ctrl.param.table[name].ready = 0;
    //~ $ctrl.ready = false;
    $ctrl.LoadData().then(function(){ $ctrl.ready = true; });//$ctrl.param.table
  };
  
  $ctrl.Send = function(name){
    if (name == 'сумма') {
      var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      $ctrl.param.table['сумма'].sign = abs;
    }
    $ctrl.param.table[name].ready = 1;
    //~ $ctrl.ready = false;
    $ctrl.LoadData().then(function(){ $ctrl.ready = true; });//$ctrl.param.table
    
  };
  

  
  $scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit)  return;
    if (newVal.newX && newVal.newX._append) return $ctrl.AppendNew();
    if (newVal.delete) return $ctrl.Delete();
}, true);
  
};


/*=============================================================*/

module

.component('moneyTable', {
  templateUrl: "money/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());