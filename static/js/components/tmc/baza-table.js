(function () {'use strict';
/*
*/

var moduleName = "ТМЦ на объектах";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', /*'Util',*/ 'appRoutes', 'DateBetween', /*'Объект или адрес', 'TMCSnab',*/
  'ТМЦ обработка снабжением', 'ТМЦ список заявок'/*, 'AuthTimer'*/, 'ТМЦ форма перемещения', 'ТМЦ текущие остатки',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, /*Util,*/ TMCAskTableData /*, AutoJSON*/ /*TMCSnab,ObjectAddrData*/) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  //~ $scope.Util = Util;
  //~ $scope.$sce = $sce;
  //~ $ctrl.TabLen = function(name, filter, tab){
    //~ if (!$ctrl.data[name] || !$ctrl.data[name].length) return;
    //~ if(!filter) return;
    //~ return $ctrl.data[name].filter(filter, tab).length;
  //~ };
  $ctrl.TabLenRefresh = function(){
    $scope.tabLen = !1;
    $timeout(function(){ $scope.tabLen = !0; });
  };
  $ctrl.TabLen = function(tab){
    return $ctrl.data[tab.data] && $ctrl.data[tab.data].filter(tab['фильтр'], tab).length;
  };
  //~ $ctrl.TabLenTransport = function(tab){
    //~ return $ctrl.data['с транспортом'].filter(tab['фильтр'], tab).length;
  //~ };
  $ctrl.TabFilterTransport = function(ask){
    var tab = this || $ctrl.tab;
    return tab && (!ask['на объект/id'] || ask['на объект/id'] == $ctrl.param['объект'].id) && ask['$позиции тмц'].some(tab['фильтр тмц']);
  };
  $ctrl.tabs = {
    'Заявки':{
      'Новые': {
        "data":'заявки',
        "фильтр": function(tmc){ return true || !tmc['транспорт/заявки/id']; },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 before-orange-darken-4',
      },
      'В обработке': {
        "data":'заявки',
        "фильтр": function(tmc){ return !!tmc['транспорт/заявки/id']/* && !tmc['с объекта'] && !tmc['на объект']*/; },
        "li_class": 'orange lighten-3',
        "li_style":  {'margin-right': '1rem'},
        "a_class": 'orange-text text-darken-4 before-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },
      /***'Входящие': {// с этого объекта (в обработке!)
        "data":'перемещение',
        "фильтр": function(ask){
           var tab = this || $ctrl.tab;
          return tab && ask['на объект/id'] && ask['на объект/id'] == $ctrl.param['объект'].id;
        },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 before-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },***/
      'Исходящие': {// с этого объекта
        "data":'перемещение',
        "фильтр": function(ask){
           var tab = this || $ctrl.tab;
          return tab && ask['с объекта/id'] && ask['с объекта/id'] == $ctrl.param['объект'].id /*&& ask['$позиции тмц'].some(tab['фильтр тмц'])*/;
        },
        //~ "фильтр тмц": function(tmc){ return !!tmc['транспорт/заявки/id'] && tmc['через базы/id'][0] != $ctrl.param['объект'].id; },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 before-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },
      
    },
    'Движение': {
      'Входящие':{
        "data":'с транспортом',
        "descr": 'заявки на приход',
        "фильтр":  $ctrl.TabFilterTransport,
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['через базы/id'][1] == $ctrl.param['объект'].id) && !tmc['количество/принято']; },
        "li_class": 'teal lighten-3',
        "a_class": 'teal-text text-darken-4',
        "svg_class": 'teal-fill fill-darken-4',
      },
      'Исходящие':{
        "data":'с транспортом',
        "descr": 'перемещение на другой объект',
        "фильтр": function(ask){
           var tab = this || $ctrl.tab;
          return tab && ask['с объекта/id'] == $ctrl.param['объект'].id && ask['$позиции тмц'].some(tab['фильтр тмц']);
        },
        "фильтр тмц": function(tmc){ return !tmc['количество/принято'];},
        "li_class": 'teal lighten-3',
        "a_class": 'teal-text text-darken-4',
        "svg_class": 'teal-fill fill-darken-4',
      },
    },
    'Завершено': {
      'Поступило':{
        "data":'с транспортом',
        "фильтр": $ctrl.TabFilterTransport,
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['через базы/id'][1] == $ctrl.param['объект'].id) && !!tmc['количество/принято']; },
        "li_class": 'green lighten-3',//
        "a_class": 'green-text text-darken-3 before-green-darken-3',
        
      },
      'Отгружено':{
        "data":'с транспортом',
        "descr": 'перемещено на другой объект',
        "фильтр": function(ask){
          var tab = this || $ctrl.tab;
          return tab && ask['с объекта/id'] == $ctrl.param['объект'].id && ask['$позиции тмц'].some(tab['фильтр тмц']);
        },
        "фильтр тмц": function(tmc){ return !!tmc['количество/принято'];},
        "li_class": 'red lighten-3',//orange 
        "a_class": 'red-text text-darken-3 before-red-darken-3',
      },
      'Остатки':{
        "data":'остатки',
        "descr": '',
        "фильтр": function(ask){
          return true;
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
      async.push($ctrl.LoadDataAsk());
      async.push($ctrl.LoadDataTransport());
      async.push($ctrl.LoadDataMove());
      $ctrl.LoadDataOst();
      $q.all(async).then(function(){
        $ctrl.TabLenRefresh();
      });
      
        $ctrl.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
        });
          
          //~ if($ctrl.data['с транспортом'].length) $ctrl.tab = $ctrl.tabs[0];
          //~ else $ctrl.tab = $ctrl.tabs[$ctrl.tabs.length-1];
          //~ $timeout(function(){
            //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',});
          //~ });
        
      //~ });
  };
  
  $ctrl.TabLiClass = function(tab){
    var c = tab.li_class  || '';
    if (tab === $ctrl.tab) c += ' active ';
    return c;
    
  };
  $ctrl.TabAClass = function(tab){
    var c = tab.a_class  || '';
    if (tab === $ctrl.tab) c += ' active ';
    return c;
    
  };
  
  $ctrl.LoadDataAsk = function(append){
    $ctrl.param.offset=$ctrl.data['заявки'] ? $ctrl.data['заявки'].length : 0;
    return TMCAskTableData.Load({'объект': $ctrl.param['объект'], /*'фильтр тмц': $ctrl.tab['фильтр тмц'],*/})
      .then(function(resp){
        if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red');
        else {
          if(!$ctrl.data['заявки']) $ctrl.data['заявки'] = [];
          if (append === undefined) $ctrl.data['заявки'].length = 0;
          Array.prototype.push.apply($ctrl.data['заявки'], resp.data);
        }
      },
      function(resp){
        if ( resp.status == '404' ) $ctrl['нет доступа к заявкам'] = true;
        $ctrl.data['заявки'] = [];
      }
    );
    
  };
  
  $ctrl.LoadDataTransport = function(append){//данные для вкладок Движения и Завершено (есть транспорт)
    $ctrl.param.offset=$ctrl.data['с транспортом'] ? $ctrl.data['с транспортом'].length : 0;
    
    return $http.post(appRoutes.url_for('тмц/заявки с транспортом'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          if (!$ctrl.data['с транспортом']) $ctrl.data['с транспортом']=[];
          if (append === undefined) $ctrl.data['с транспортом'].length = 0;
          Array.prototype.push.apply($ctrl.data['с транспортом'], resp.data);
        }
        
      });
    
  };
  
  $ctrl.LoadDataMove = function(append){//данные для перемещения (нет транспорта)
    $ctrl.param.offset=$ctrl.data['перемещение'] ? $ctrl.data['перемещение'].length : 0;
    
    return $http.post(appRoutes.url_for('тмц/заявки/перемещение'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          if (!$ctrl.data['перемещение']) $ctrl.data['перемещение']=[];
          if (append === undefined) $ctrl.data['перемещение'].length = 0;
          Array.prototype.push.apply($ctrl.data['перемещение'], resp.data);
        }
        
      });
    
  };
  
  $ctrl.LoadDataOst = function( append) {//данные для остатков
    if (!$ctrl.data['остатки']) $ctrl.data['остатки']=[];
    //~ $ctrl.param.offset=$ctrl.data['остатки'] ? $ctrl.data['остатки'].length : 0;
    
    //~ return $http.post(appRoutes.url_for('тмц/остатки'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      //~ .then(function(resp){
        //~ if(resp.data.error) $scope.error = resp.data.error;
        //~ else {
          //~ if (!$ctrl.data['остатки']) $ctrl.data['остатки']=[];
          //~ if (append === undefined) $ctrl.data['остатки'].length = 0;
          //~ Array.prototype.push.apply($ctrl.data['остатки'], resp.data);
        //~ }
        
      //~ });
    
    
  };
  
  $ctrl.SelectTab = function(n1, n2){/// Требуется Новые
    if (!n1) n1 = 'Заявки';
    if (!n2)  n2 = $ctrl.tabs[n1][Object.keys($ctrl.tabs[n1])[0] || ''];// перый подуровень
    //~ if(idx === undefined) idx = 0;
    $ctrl.tab = undefined;
    $timeout(function(){ $ctrl.tab = $ctrl.tabs[n1][n2]; });
  };
  
  $ctrl.EditMove = function(ask){//редактирование исходящего перемещения
    //~ console.log("EditMove", ask);
    $rootScope.$broadcast('Редактировать перемещение ТМЦ', ask);
    
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