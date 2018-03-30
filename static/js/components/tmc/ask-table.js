(function () {'use strict';
/*
  без транспорта
*/

var moduleName = "ТМЦ список заявок";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util',  'appRoutes', 'DateBetween', 'ТМЦ форма заявки']);//'ngSanitize',, 'dndLists''AppTplCache',

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util) {//TMCAskTableData
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  
  /*$ctrl.tabs = [
    //~ {title:"Все", filter: function(tab, item){ return true; }, },
    {title:"Новые", filter: function(item, tab){ return !item['транспорт/заявки/id']; }, },
    {title:"В работе", filter: function(item, tab){ return !!item['транспорт/заявки/id']; }, },
    //~ {title:"В работе*", filter: function(tab, item){ return !!item['транспорт/id'] && !item['дата2']; }, },
    //~ {title:"завершенные", filter: function(tab, item){ return !!item['транспорт/id'] && !!item['дата2']; }, },
  
  ];*/
  
  $scope.$on('Сохранена заявка ТМЦ', function(event, ask){
    var $ask;
    //~ console.log('Сохранена заявка ТМЦ', ask);
    if(ask._new) return $ctrl.Append(ask);// новая строка
    // старая строка
    var idx = $ctrl.data.indexOf(ask);
    if (idx != -1) $ask = $ctrl.data[idx];
    if(!$ask) $ask = $ctrl.data.filter(function(it) { return it.id == ask.id; }).pop();
    //~ console.log('Сохранена заявка ТМЦ', $ask);
    if($ask) angular.forEach(ask, function(val, key){$ask[key]=val;});
    //~ $ask._init = false;
    //~ $ctrl.InitAsk($ask);

  });
  $scope.$on('Удалена заявка ТМЦ', function(event, ask){
    var $ask;
    var idx = $ctrl.data.indexOf(ask);
    if (idx != -1) $ask = $ctrl.data[idx];
    if(!$ask) $ask = $ctrl.data.filter(function(it) { return it.id == ask.id; }).pop();
    $ctrl.Delete($ask);
  });
  
  /*$scope.$watch('param', function(newVal, oldVal){
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
  }, true);*/
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      
      if($ctrl.data) $ctrl.Show();
      else  $ctrl.LoadData().then(function(){
        $ctrl.Show();        
      });
    
    });
  };
  
  $ctrl.Show = function(){
    $ctrl.ready = true;
    $timeout(function(){
      $('.show-on-ready', $($element[0])).slideToggle( /*"slow"*/ );
      
      $('.modal', $($element[0])).modal({
          endingTop: '0%',
          ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $ctrl.modal_trigger = trigger;
          },
        });
        
        //~ $ctrl.tab = $ctrl.tabs[0]; 
        //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'orange',});
        //~ $ctrl.tabsReady = true;
      });
    
  };
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    //$http.post(appRoutes.url_for('тмц/список заявок'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //
    return TMCAskTableData($ctrl.param)
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else Array.prototype.push.apply($ctrl.data, resp.data);
      });
    
  };
  
  /*$ctrl.SelectTab = function(t, init){
    $ctrl.tab = t;
    //~ if (init) $timeout(function(){ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',}); });
  };*/
  
  $ctrl.FilterData = function(it){
    //~ var tab = this || $ctrl.tab;
    //~ if(!tab) return false;
    //~ return tab.filter(it, tab);
    var filter = $ctrl.param['фильтр тмц'];
    if(!filter) return !0;
    return filter(it);
  };
  $ctrl.OrderByData = function(it){// для необработанной таблицы
    return it["дата1"]+'-'+it.id;//["объект/id"];
  };
  
  /*$ctrl.InitAsk = function(it){
    if(it._init) return;
    it['$дата1'] = JSON.parse(it['$дата1']);
    it._init = true;
  };*/

  //~ $ctrl.FormatMoney = function(val){
    //~ if(val === undefined || val === null ) return '';
    //~ return (val+'').replace(/\./, ',').replace(/\s*руб/, '') + (/\.|,/.test(val+'') ? '' : ',00');
  //~ };
  
  $ctrl.Edit = function(it){// клик на строке
    if(!it.id) return; // приходы-начисления  табеля не из этой таблицы
    if(it["транспорт/заявки/id"]) return;
    //~ $ctrl.param.edit = it;
    $timeout(function(){ $rootScope.$broadcast('Редактировать заявку ТМЦ', it); });// $rootScope.$on && $scope.$on
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
    delete it._new;
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

/******************************************************/
/***var Data  = function($http, appRoutes){
  var  $this = {
    Load: function(param){ return $http.post(appRoutes.url_for('тмц/список заявок'), param); },
  };
  return $this;
  
};***/


/*=============================================================*/

module
//~ .factory("TMCAskTableData", Data)
.component('tmcAskTable', {
  templateUrl: "tmc/ask/table",
  //~ scope: {},
  bindings: {
    param: '<',
    data: '<',

  },
  controller: Component
})

;

}());