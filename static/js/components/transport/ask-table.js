(function () {'use strict';
/*
*/

var moduleName = "TransportAskTable";

var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween',  'ContragentItem', 'TransportAskWork']);//'ngSanitize',, 'dndLists''AppTplCache',

var Component = function  ($scope, $q, $timeout, $http, $element, appRoutes, Util, TransportAskData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.appRoutes = appRoutes;
  $scope.payType = TransportAskData.payType();
  $ctrl.tabs = [
    {title:"Все"},
    {title:"Новые"},
    {title:"В работе"},
    {title:"Завершенные"},
  
  ];
  $scope.$watch('param', function(newVal, oldVal){
    //~ console.log('Watch changed', newVal);
    if(!newVal) return;
    if (newVal.edit)  return;
    if (newVal.append) {
      $ctrl.Append(newVal.append);
      delete newVal.append;
      return;
    }
    if (newVal.remove) {
      $ctrl.Delete(newVal.remove);
      delete newVal.remove;
      return;
    }
  }, true);
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "дата2":{"values":[]}, "перевозчик":{}, "заказчик":{}};// фильтры
      $scope.param = $ctrl.param;

      $ctrl.LoadData().then(function(){
        $ctrl.SelectTab($ctrl.tabs[1]);
        $ctrl.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
          
          //~ $ctrl['ссылка контроля заявок'] = $('header ul.menu-nav li a[data-url-for="контроль заявок"]');
          
        });
        
      });
    });
    
  };
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    $ctrl.param.tab = $ctrl.tab ? $ctrl.tabs.indexOf($ctrl.tab) : undefined;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('транспорт/список заявок'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };
  $ctrl.OrderByData = function(it){// для необработанной таблицы
    if ($ctrl.tab === $ctrl.tabs[3]) return it["дата1"]+'-'+it.id;//для обратного порядка завершенных заявок
    var s = dateFns.differenceInDays(dateFns.addDays(new Date(), 365),  it["дата1"])+'-'+1/it.id;
    console.log("OrderByData", it, s );
    return s;
  };
  
  $ctrl.SelectTab = function(t){
    $ctrl.tab = t;
  };
  
  $ctrl.FilterData = function(item){
    //~ console.log("FilterData", this);
    var tab = this || $ctrl.tab;
    if (tab === $ctrl.tabs[0]) return true;
    if (tab === $ctrl.tabs[1] && !item['транспорт/id']) return true;
    if (tab === $ctrl.tabs[2] && !!item['транспорт/id'] && !item['дата2']) return true;
    if (tab === $ctrl.tabs[3] && !!item['транспорт/id'] && !!item['дата2']) return true;
    return false;
  };
  
  $ctrl.InitRow = function(it){
    //~ if(it["тмц/снаб/id"]) it["коммент"] = "\n"
    
  };

  //~ $ctrl.FormatMoney = function(val){
    //~ if(val === undefined || val === null ) return '';
    //~ return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  //~ };
  
  $ctrl.Edit = function(it){// клик на строке
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    //~ $ctrl.param.id = it.id;
    //~ delete $ctrl.param.newX;
    $ctrl.param.edit = it;
    //~ $ctrl.param.edit._init=true;
    //~ $timeout(function(){$ctrl.param.form= true;});
    
  };
  
  $ctrl.Delete = function(it){
    //~ var it = $ctrl.param.delete;
    //~ delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };
  
  $ctrl.Append = function(it){// из watch новая позиция
    //~ console.log("AppendNew");
    //~ var n = $ctrl.param.newX;
    //~ delete $ctrl.param.newX;
    //~ delete n._append;
    //~ n._new = true;
    //~ if (!$ctrl.data.length) return $window.location.reload();
    $ctrl.data.unshift(it);
    //~ $timeout(function(){
    //~ $ctrl['обновить'] = true;
    //~ $ctrl.ready = false;
    
  };

  
  $ctrl.Cancel = function(name){
    if(!$ctrl.param.table[name].ready) return;
    $ctrl.param.table[name].ready = 0;
    $ctrl.LoadData();//$ctrl.param.table
  };
  
  $ctrl.Send = function(name){
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      //~ $ctrl.param.table['сумма'].sign = abs;
    //~ }
    $ctrl.param.table[name].ready = 1;
    $ctrl.LoadData();//$ctrl.param.table
    
  };

  
};


/*=============================================================*/

module

.component('transportAskTable', {
  templateUrl: "transport/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());