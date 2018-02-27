(function () {'use strict';
/*
*/

var moduleName = "ТМЦ на объектах";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', /*'Util',*/ 'appRoutes', 'DateBetween', /*'Объект или адрес', 'TMCSnab',*/
  'ТМЦ обработка снабжением', 'ТМЦ список заявок'/*, 'AuthTimer'*/]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, /*$rootScope,*/ $q, $timeout, $http, $element, appRoutes, /*Util,*/ TMCAskTableData /*, AutoJSON*/ /*TMCSnab,ObjectAddrData*/) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  //~ $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $ctrl.TabLen = function(name, filter, tab){
    if (!$ctrl.data[name] || !$ctrl.data[name].length) return;
    if(!filter) return;
    return $ctrl.data[name].filter(filter, tab).length;
  };
  $ctrl.TabLenRefresh = function(){
    $scope.tabLen = !1;
    $timeout(function(){ $scope.tabLen = !0; });
  };
  $ctrl.TabLenAsk = function(tab){
    return $ctrl.TabLen('заявки', tab['фильтр тмц'], tab);
  };
  $ctrl.TabLenTransport = function(tab){
    return $ctrl.TabLen('с транспортом', tab['фильтр'], tab);
  };
  $ctrl.TabFilterTransport = function(ask){
    var tab = this || $ctrl.tab;
    return tab && (!ask['на объект/id'] || ask['на объект/id'] == $ctrl.param['объект'].id) && ask['$позиции тмц'].some(tab['фильтр тмц']);
  };
  $ctrl.tabs = {
    'Заявки':{
      'Новые': {
        "len": $ctrl.TabLenAsk,
        "фильтр тмц": function(tmc){ return !tmc['транспорт/заявки/id']; },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 before-orange-darken-4',
      },
      'В обработке': {
        "len": $ctrl.TabLenAsk,
        "фильтр тмц": function(tmc){ return !!tmc['транспорт/заявки/id']; },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 before-orange-darken-4',
      },
    },
    'Движение': {
      'Входящие':{
        "descr": 'заявки на приход',
        "len": $ctrl.TabLenTransport,
        "фильтр":  $ctrl.TabFilterTransport,
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['через базы/id'][1] == $ctrl.param['объект'].id) && !tmc['количество/принято']; },
        "li_class": 'teal lighten-3',
        "a_class": 'teal-text text-darken-4',
      },
      'Исходящие':{
        "descr": 'перемещение на другой объект',
        "len": function(tab){
          return $ctrl.data['с транспортом'].filter(tab['фильтр'], tab).length;
        },
        "фильтр": function(ask){
           var tab = this || $ctrl.tab;
          return tab && ask['с объекта/id'] == $ctrl.param['объект'].id && ask['$позиции тмц'].some(tab['фильтр тмц']);
        },
        "фильтр тмц": function(tmc){ return !tmc['количество/принято'];},
        "li_class": 'teal lighten-3',
        "a_class": 'teal-text text-darken-4',
      },
    },
    'Завершено': {
      'Поступило':{
        "len": $ctrl.TabLenTransport,
        "фильтр": $ctrl.TabFilterTransport,
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['через базы/id'][1] == $ctrl.param['объект'].id) && !!tmc['количество/принято']; },
        "li_class": 'green lighten-3',//
        "a_class": 'green-text text-darken-3 before-green-darken-3',
        
      },
      'Отгружено':{
        "descr": 'перемещено на другой объект',
        "len": function(tab){ return $ctrl.data['с транспортом'].filter(tab['фильтр'], tab).length; },
        "фильтр": function(ask){
          var tab = this || $ctrl.tab;
          return tab && ask['с объекта/id'] == $ctrl.param['объект'].id && ask['$позиции тмц'].some(tab['фильтр тмц']);
        },
        "фильтр тмц": function(tmc){ return !!tmc['количество/принято'];},
        "li_class": 'red lighten-3',//orange 
        "a_class": 'red-text text-darken-3 before-red-darken-3',
      },
      'Остатки':{
        "descr": '',
        "len":function(tab){  },
        "filter": function(ask){
          //~ return !!ask['базы'] && !!ask['базы'][0];
        },
        "li_class": 'purple lighten-4',
        "a_class": 'purple-text text-darken-3 before-purple-darken-3',
      },
    },
  };
    
  $scope.$on('ТМЦ/крыжик позиций/событие', function(event, pos){// позиция тмц
    //~ console.log('ТМЦ/крыжик позиций/событие', angular.copy(pos));    
    $http.post(appRoutes.url_for('тмц/сохранить поступление'), pos/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        /*$ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;*/
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 2000, 'red');
          pos['крыжик количества'] = !pos['крыжик количества'];
          if (!pos['крыжик количества'])  row['количество/принято'] = null;
          else if (pos['количество/принято'] === undefined || pos['количество/принято'] === null) pos['количество/принято'] = pos['количество'];
        }
        else if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 1000, 'green');
          //~ $timeout(function(){
          Object.keys(resp.data.success).map(function(key){ pos[key]=resp.data.success[key]; });
          //~ }, 300);
          $ctrl.TabLenRefresh();
        }
        console.log("Сохранил", resp.data);
      });
  });
  
  $scope.$on('Сохранена заявка ТМЦ', function(event, ask){
    $ctrl.TabLenRefresh();
  });
  $scope.$on('Удалена заявка ТМЦ', function(event, ask){
    $ctrl.TabLenRefresh();
  });
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      if(!$ctrl.data) $ctrl.data = {};
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      var async = [];
      
      if(!$ctrl.data['заявки']) $ctrl.data['заявки'] = [];
      async.push(TMCAskTableData.Load({'объект': $ctrl.param['объект'], /*'фильтр тмц': $ctrl.tab['фильтр тмц'],*/})
        .then(function(resp){
          if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red');
          else Array.prototype.push.apply($ctrl.data['заявки'], resp.data);
        },
        function(resp){
          if ( resp.status == '404' ) $ctrl['нет доступа к заявкам'] = true;
        })
      );
        
      async.push($ctrl.LoadDataTransport());
        
      $q.all(async).then(function(){
        $ctrl.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
        });
        $ctrl.TabLenRefresh();
          
          //~ if($ctrl.data['с транспортом'].length) $ctrl.tab = $ctrl.tabs[0];
          //~ else $ctrl.tab = $ctrl.tabs[$ctrl.tabs.length-1];
          //~ $timeout(function(){
            //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',});
          //~ });
          
          
        
        
        
      });
        
        
        
    
    
  };
  
  $ctrl.TabAClass = function(tab){
    var c = tab.a_class  || '';
    if (tab === $ctrl.tab) c += ' active bold000 ';
    return c;
    
  };
  
  $ctrl.LoadDataTransport = function(append){//данные для вкладок Движения и Завершено (есть транспорт)

    if (!$ctrl.data['с транспортом']) $ctrl.data['с транспортом']=[];
    if (append === undefined) $ctrl.data['с транспортом'].length = 0;
    $ctrl.param.offset=$ctrl.data['с транспортом'].length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/заявки с транспортом', $ctrl.param['объект'].id), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          //~ console.log("с транспортом", resp.data);
          Array.prototype.push.apply($ctrl.data['с транспортом'], resp.data);///*.map(function(item){ item['позиции тмц'] = item['позиции тмц'].map(function(tmc){ return JSON.parse(tmc); }); return item; })*/);//
          //~ $ctrl = resp.data.shift().map(function(ask){ return $ctrl.InitAsk(ask); }) || []; //
          
        }
        
      });
    
  };
  
  $ctrl.SelectTab = function(n1, n2){/// Требуется Новые
    if (!n1) n1 = 'Заявки';
    if (!n2)  n2 = $ctrl.tabs[n1][Object.keys($ctrl.tabs[n1])[0] || ''];// перый подуровень
    //~ if(idx === undefined) idx = 0;
    $ctrl.tab = undefined;
    $timeout(function(){ $ctrl.tab = $ctrl.tabs[n1][n2]; });
  };
  
  /*$ctrl.AskParam = function(){///данные для компонента заявок
    $ctrl.
    var filter = $ctrl.tab["фильтр тмц"];
    if(!filter) return !1;
    return $ctrl.data['заявки'].filter(filter);
    
  };*/
  
  
};
/*=============================================================*/

module

.component('tmcBazaTable', {
  templateUrl: "tmc/baza/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());