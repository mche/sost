(function () {'use strict';
/*
*/

var moduleName = "MoneyTable";

var module = angular.module(moduleName, ['AuthTimer', 'AppTplCache', 'Util', 'appRoutes', 'DateBetween']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $q, $timeout, $http, $element, appRoutes, Util) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      //~ if(!$ctrl.param) $ctrl.param={};
      //~ if(!$ctrl.param.table) 
      var param = $.extend( true, {"table": {"дата":{"values":[]}, "сумма":{"values":[]}, "контрагент":{}, "кошелек":{"проект": $ctrl.param['проект'].id || $ctrl.param['проект']}, "профиль":{}}},  $ctrl.param || {});// фильтры
      $.extend( true, $ctrl.param, param);
      //~ console.log("MoneyTable $onInit", $ctrl.param);
      $scope.param = $ctrl.param;
      //~ $scope.wallet2 = ($ctrl.param.move || 0) && ($ctrl.param.move.id == 2 ? 1 : 0);// внутренние дела и перемещения
      //~ console.log(moduleName, "$onInit", $ctrl.param.table);
      
      $ctrl.LoadData().then(function(){
        $ctrl.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
        });
        
      });
    });
    
  };
  
  $ctrl.LoadData = function(append){//param
    //~ param = param || {};
    //~ if($scope.wallet2) param.wallet2 = $scope.wallet2;
    
    //~ if (param) Object.values(param).filter(function(data){ return data._ready}) angular.forEach(, function(){}).unshift();
    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    var url_for;
    if($ctrl.param.move.id == 3) url_for = 'движение ДС/расчеты по профилю';// по профилям!
    else url_for = 'список движения ДС';
    
    $ctrl['баланс'] = undefined;
    if($ctrl.param.table['профиль'] && $ctrl.param.table['профиль'].ready) {// один или несколько профилей (для двойников)
      $http.post(appRoutes.url_for('движение ДС/баланс по профилю'), {"профиль": $ctrl.param.table['профиль'], "профили": $ctrl.param.table['профили'],})//"месяц": row["месяц"],
        .then(function(resp){
        $ctrl['баланс']  = resp.data;
      });
    } 
    
    return $http.post(appRoutes.url_for(url_for, $ctrl.param['проект'].id || $ctrl.param['проект']), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };
  
  $ctrl.parseSum = function(it) {//
    if(!it['сумма']) return '';
    var sum = parseFloat(it['сумма']);
    delete it["приход"];
    delete it["расход"];
    
    if(sum > 0) it["приход"] = Util.money(it['сумма']);//$ctrl.FormatMoney(it['сумма']);
    else it["расход"] = Util.money(it['сумма'].replace(/-/g, ""));//$ctrl.FormatMoney(it['сумма'].replace(/-/g, ""));
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

  
  $ctrl.Cancel = function(name){
    if(!$ctrl.param.table[name].ready) return;
    $ctrl.param.table[name].ready = 0;
    $ctrl.LoadData();//$ctrl.param.table
  };
  
  $ctrl.Send = function(name){
    if (name == 'сумма') {
      var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      $ctrl.param.table['сумма'].sign = abs;
    }
    $ctrl.param.table[name].ready = 1;
    $ctrl.LoadData();//$ctrl.param.table
    
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