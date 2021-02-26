(function () {'use strict';
/*
*/

var moduleName = "MoneyTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'WalletItem', 'DateBetween', 'Категории', 'Аренда::Договоры::Выбор', /* 'Объект или адрес',*/]);//'ngSanitize',, 'dndLists'

const Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, $WalletData, $АрендаДоговорыДанные, Util, $Категории) {
  var $c = this;
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.currYear = (new Date()).getYear()+1900;
  
  $c.broadcastBalance = {};// ключи/значения из разных компонентов
  $c.broadcastBalanceQ = []; ///очередь
  $scope.$on('Баланс дополнить', function(event, data) {
    //~ console.log("принял Баланс дополнить", data);
    $c.broadcastBalanceQ.push(data);
    
    if ($c.broadcastBalanceTimeOut) $timeout.cancel($c.broadcastBalanceTimeOut);
    $c.broadcastBalanceTimeOut = $timeout(function(){
      $c.broadcastBalanceTimeOut = undefined;
      var mapFunc = function(key){ $c.broadcastBalance[key] = parseFloat(Util.numeric(data[key])) || 0;  };
      while (data = $c.broadcastBalanceQ.shift()) {
        Object.keys(data).map(mapFunc);
      }
      var balance =  $c['баланс'];
      $c['баланс'] = undefined;
      $c.balanceTotal = 0;
      $timeout(function(){
        $c['баланс'] = balance;
        
      });
    }, 100);
  });
  
  var FilterByID = function(item){
      return item.id == this.id;
  };
  
  $scope.$on('Движение ДС/запись сохранена', function(event, data) {
    var row = $c.data.filter(FilterByID, data).pop();
    //~ console.log("Движение ДС/запись сохранена", row);
    if (row) {/// редакт
      let idx = $c.data.indexOf(row);
      $c.data.splice(idx, 1);
      Object.keys(data).map(function(key){ row[key] = data[key]; });
      //~ row['обновить'] = true;///передернуть
      $c.InitRow(row);
      $timeout(() => {
        $c.data.splice(idx, 0, row);
      });
    } else {///новая
      data._new = true;
      $c.data.unshift(data);
    }
  });
  
  $scope.$on('Движение ДС/удалено', function(event, data) {
    var del = $c.data.filter(FilterByID, data).pop();
    if (del) $c.data.splice($c.data.indexOf(del), 1);
  });
  
  $c.balanceTotal = 0;
  $c.BalanceTotal = function(set){
    if (set !== undefined) $c.balanceTotal += parseFloat(Util.numeric(set));
    return $c.balanceTotal;
  };
  
  $c.$onInit = function(){
    //~ $timeout(function(){
      //~ if(!$c.param) $c.param={};
    if(!$c.param.table) $c.param.table = {};
    $c.param.table['кошелек'] = {};
    var d1 = dateFns.startOfMonth(new Date());
    var d2 = dateFns.endOfMonth(new Date());
    if ( ((new Date())-d1)/1000/3600/24 < 12 ) d1 = dateFns.subMonths(d1, 1);

    
      var param = $.extend( true, {"table": {"дата":{"values":[dateFns.format(d1, 'YYYY-MM-DD'), dateFns.format(d2, 'YYYY-MM-DD')], "ready": true}, "сумма":{"values":[]}, "контрагент":{}, "кошелек":{"проект": $c.param['проект'].id || $c.param['проект']}, "профиль":{}, "объект": {}, "категория": {topParent:{id:3}}, "примечание": {title:''},}},  $c.param || {});// фильтры
      $.extend( true, $c.param, param);
      //~ console.log("MoneyTable $onInit", $c.param);
      $scope.param = $c.param;
      //~ $scope.wallet2 = ($c.param.move || 0) && ($c.param.move.id == 2 ? 1 : 0);// внутренние дела и перемещения
      //~ console.log(moduleName, "$onInit", $c.param.table);
      
      var async = [];
      
      async.push($c.LoadData());
      async.push($WalletData.Load().then(function(resp){
        $c['кошельки'] = $WalletData.$Data();///resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
      }));
      async.push($АрендаДоговорыДанные.Load().then(function(){
        $c['договоры аренды'] = $АрендаДоговорыДанные.$Data();///resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
      }));
      $q.all(async).then(function(){
        
        $scope.CategoryData = $Категории;//$http.get(appRoutes.url_for('категории/список', 3));/*.then(function(resp){ Array.prototype.push.apply($scope.CategoryData, resp.data); })*/
        
      //~ });
      
      $c.ready = true;
      $timeout(function(){
        //~ $('table', $($element[0])).removeClass('animated zoomInUp slow show-on-ready').addClass('animated zoomInUp slow');
        
          $('.modal', $($element[0])).modal({
            endingTop: '5%',
            //~ noOverlay: true,
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              //~ console.log("modal ready", modal, trigger);
              $c.modal_trigger = trigger;
            },
          });
        });
      
    });
    
  };
  
  $c.LoadData = function(append){//param
    //~ param = param || {};
    //~ if($scope.wallet2) param.wallet2 = $scope.wallet2;
    
    //~ if (param) Object.values(param).filter(function(data){ return data._ready}) angular.forEach(, function(){}).unshift();
    if (!$c.data) $c.data=[];
    if (append === undefined) $c.data.length = 0;
    $c.param.offset=$c.data.length;
    
    if ($c.cancelerHttp) $c.cancelerHttp.reject();
    $c.cancelerHttp = $q.defer();
    
    var url_for;
    if($c.param.move.id == 3) url_for = 'движение ДС/расчеты по профилю';// по профилям!
    else url_for = 'список движения ДС';
    
    $c['баланс'] = undefined;
    $c.balanceTotal = 0;
    if($c.param.table['профиль'] && $c.param.table['профиль'].ready) {// один или несколько профилей (для двойников)
      $http.post(appRoutes.url_for('движение ДС/баланс по профилю'), {"профиль": $c.param.table['профиль'], "профили": $c.param.table['профили'],})//"месяц": row["месяц"],
        .then(function(resp){
        $c['баланс']  = parseFloat(Util.numeric(resp.data['баланс'] || 0));
      });
    } 
    
    return $http.post(appRoutes.url_for(url_for, $c.param['проект'].id || $c.param['проект']), $c.param, {"timeout": $c.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $c.cancelerHttp.resolve();
        //~ delete $c.cancelerHttp;
        $c.cancelerHttp = undefined;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($c.data, resp.data);
      });
    
  };
  
  //~ $c.FilterData = function(it) {
    //~ return !it['обновить'];
  //~ };
  
  //~ var SplitKop = function(sum){ 
    //~ return (sum+'').split(/[,.]/);
  //~ };
  $c.InitRow = function(it) {//
    if(!it['сумма']) return '';
    var sum = parseFloat(it['сумма']);
    delete it["приход"];
    delete it["расход"];
    
    if (it['проект/id'] != ($c.param['проект'].id || $c.param['проект'])) {/// внутренние перемещения
      let w1 = it['кошелек/id'],
          w2 = it['кошелек2/id'];
      it['кошелек/id'] = w2;
      it['кошелек2/id'] = w1;
      
      //наоборот сумма
      if(sum > 0) it["расход"] = Util.money(it['сумма']);//$c.FormatMoney(it['сумма']);
      else it["приход"] = Util.money(it['сумма'].replace(/-/g, ""));//$c.FormatMoney(it['сумма'].replace(/-/g, ""));
      
    } else {
      if(sum > 0) it["приход"] = Util.money(it['сумма']);//$c.FormatMoney(it['сумма']);
      else it["расход"] = Util.money(it['сумма'].replace(/-/g, ""));//$c.FormatMoney(it['сумма'].replace(/-/g, ""));
      
    }
    
    
    
    if (it["приход"]) it["приход"] = it["приход"].split(/[,.]/);
    if (it["расход"]) it["расход"] = it["расход"].split(/[,.]/);
    
    if (it['кошелек/id']) it['$кошелек'] = $c['кошельки'][it['кошелек/id']];
    else it['$кошелек'] = undefined;
    
    if (it['кошелек2/id']) it['$кошелек2'] = $c['кошельки'][it['кошелек2/id']];
    else it['$кошелек2'] = undefined;
    
    if (it['договор аренды/id']) it['договор аренды']= $c['договоры аренды'][it['договор аренды/id']];
    else  it['договор аренды']= undefined;
   };
  //~ $c.FormatMoney = function(val){
    //~ if(val === undefined || val === null ) return '';
    //~ return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  //~ };
  
  $c.Edit = function(it){
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    $c.param.id = it.id;
    //~ delete $c.param.newX;
    //~ $c.param.edit = undefined;
    //~ $timeout(function(){$c.param.edit = it;});
    //~ $c.param.edit._init=true;
    $rootScope.$broadcast('Движение ДС/редактировать запись', angular.copy(it));
    
  };
  
  $c.Delete = function(){
    var it = $c.param.delete;
    delete $c.param.delete;
    var idx = $c.data.indexOf(it);
    $c.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  /***$c.AppendNew = function(){
    //~ console.log("AppendNew");
    var n = $c.param.newX;
    //~ delete $c.param.newX;
    delete n._append;
    n._new = true;
    //~ if (!$c.data.length) return $window.location.reload();
    $c.data.unshift(n);
    //~ $timeout(function(){
    //~ $c['обновить'] = true;
    //~ $c.ready = false;
    
    //~ $timeout(function(){
      //~ $('html, body').animate({
        //~ scrollTop: $("table tbody tr:first-child", $($element[0])).offset().top
      //~ }, 1500);
    //~ });
    
  };*/
  
  $c.FilterObj  = function(item){/// по проекту
    if (!$c.param["проект"].id) return true;
    return !item.$проект || item.$проект.id == $c.param["проект"].id;
    
  };
  
  $c.OpenFilter = function(name){
    $('#'+name).modal('open');
    
  };
  
  $c.Total = function(){
    var sum = [0.0, 0.0];
    $c.data.map(function(it){
      var s = parseFloat(Util.numeric(it['сумма']));
      if (s > 0) sum[0] += s;
      else        sum[1] += s;
    });
    return sum;
  };
  
  $c.Cancel = function(name){
    if(!$c.param.table[name].ready) return;
    $c.param.table[name].ready = 0;
    //~ $c.ready = false;
    $c.LoadData().then(function(){ $c.ready = true; });//$c.param.table
  };
  
  $c.Send = function(name){
    if (name == 'сумма') {
      var abs = parseInt($c.modal_trigger.attr('data-abs'));
      $c.param.table['сумма'].sign = abs;
    }
    $c.param.table[name].ready = 1;
    //~ $c.ready = false;
    $c.LoadData().then(function(){ $c.ready = true; });//$c.param.table
    
  };
  
};


/*=============================================================*/

module

.component('moneyTable', {
  controllerAs: '$c',
  templateUrl: "money/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());