(function () {'use strict';
/*
*/

var moduleName = "ТМЦ на объектах";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', /*'Util',*/ 'appRoutes', 'DateBetween', /*'Объект или адрес', 'TMCSnab',*/
  'ТМЦ форма перемещения', 'ТМЦ список заявок'/*, 'AuthTimer'*/, 'ТМЦ обработка снабжением',  'ТМЦ текущие остатки',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, /*Util,*/  /*, AutoJSON*/ /*TMCSnab,ObjectAddrData*/) {//TMCAskTableData
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
  /*$ctrl.TabFilterTransport = function(ask){
    var tab = this || $ctrl.tab;
    return tab && !!ask['транспорт/id'] && (!ask['на объект/id'] || ask['на объект/id'] == $ctrl.param['объект'].id) && ask['$позиции тмц'].some(tab['фильтр тмц']);
  };*/
  $ctrl.tabs = {
    'Заявки':{
      'Новые': {
        "data":'заявки',
        "фильтр": function(tmc){ return true /*|| !tmc['транспорт/заявки/id']*/; },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 ',
        "aClassActive": ' before-orange-darken-4',
      },
      'В обработке': {
        "data":'снаб',
        "фильтр": function(ask){ return  (!ask['транспорт/id'] && !ask['без транспорта']) && !ask['с объекта/id']/* && !tmc['с объекта'] && !tmc['на объект']*/; },
        "li_class": 'orange lighten-3',
        "li_style":  {'margin-right': '1rem'},
        "a_class": 'orange-text text-darken-4 ',
        "aClassActive": ' before-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },
      /***'Входящие': {// с этого объекта (в обработке!)
        "data":'перемещение',
        "фильтр": function(ask){
           var tab = this || $ctrl.tab;
          return tab && ask['на объект/id'] && ask['на объект/id'] == $ctrl.param['объект'].id;
        },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 before-000-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },***/
      'Исходящие': {// с этого объекта
        "data":'снаб',
        "фильтр": function(ask){
           var tab = this || $ctrl.tab;
          var t = tab && (!ask['транспорт/id'] && !ask['без транспорта']) && ask['с объекта/id'] && ask['с объекта/id'] == $ctrl.param['объект'].id /*&& ask['$позиции тмц'].some(tab['фильтр тмц'])*/;
          if (t) ask['статус'] = "перемещение без транспорта";
          return t;
        },
        //~ "фильтр тмц": function(tmc){ return !!tmc['транспорт/заявки/id'] && tmc['через базы/id'][0] != $ctrl.param['объект'].id; },
        "li_class": 'orange lighten-3',
        "a_class": 'orange-text text-darken-4 ',
        "aClassActive": ' before-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },
      
    },
    'Движение': {
      'Входящие':{
        "data":'снаб',
        "descr": 'заявки на приход',
        "фильтр":  function(ask){
          var tab = this || $ctrl.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && (!ask['на объект/id'] || ask['на объект/id'] == $ctrl.param['объект'].id) && ask['$позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "входящие";
          return t;
        },
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['на объект/id'] == $ctrl.param['объект'].id) && !tmc['количество/принято']; },
        "li_class": 'teal lighten-3',
        "a_class": 'teal-text text-darken-4 ',
        "aClassActive": ' before-teal-darken-4',
        "svg_class": 'teal-fill fill-darken-4',
      },
      'Исходящие':{
        "data":'снаб',
        "descr": 'перемещение на другой объект',
        "фильтр": function(ask){
           var tab = this || $ctrl.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['с объекта/id'] == $ctrl.param['объект'].id && ask['$позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "перемещение с транспортом";
          return t;
        },
        "фильтр тмц": function(tmc){ return !tmc['количество/принято'];},
        "li_class": 'teal lighten-3',
        "a_class": 'teal-text text-darken-4 ',
        "aClassActive": ' before-teal-darken-4',
        "svg_class": 'teal-fill fill-darken-4',
      },
    },
    'Завершено': {
      'Поступило':{
        "data":'снаб',
        "фильтр": function(ask){
          var tab = this || $ctrl.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && (!ask['на объект/id'] || ask['на объект/id'] == $ctrl.param['объект'].id) && ask['$позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "поступило";
          return t;
        },
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['на объект/id'] == $ctrl.param['объект'].id) && !!tmc['количество/принято']; },
        "li_class": 'green lighten-3',//
        "a_class": 'green-text text-darken-3 ',
        "aClassActive": ' before-green-darken-3',
        
      },
      'Отгружено':{
        "data":'снаб',
        "descr": 'перемещено на другой объект',
        "фильтр": function(ask){
          var tab = this || $ctrl.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['с объекта/id'] == $ctrl.param['объект'].id && ask['$позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "отгружено";
          return t;
        },
        "фильтр тмц": function(tmc){ return !!tmc['количество/принято'];},
        "li_class": 'red lighten-3',//orange 
        "a_class": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
      },
      'Остатки':{
        "data":'остатки',
        "descr": '',
        "фильтр": function(ask){
          return true;
          //~ return !!ask['базы'] && !!ask['базы'][0];
        },
        "li_class": 'purple lighten-4',
        "a_class": 'purple-text text-darken-3 ',
        "aClassActive": ' before-purple-darken-3',
      },
    },
  };
    
  $scope.$on('ТМЦ/крыжик позиций/событие', function(event, pos){// позиция тмц
    //~ console.log('ТМЦ/крыжик позиций/событие', angular.copy(pos));
    //~ $rootScope.$broadcast('Перемещение ТМЦ/форма/позиция', pos);
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
        //~ console.log("Сохранил", resp.data);
      });
  });
  
  $scope.$on('Сохранена заявка ТМЦ', function(event, ask){
    $ctrl.TabLenRefresh();
  });
  $scope.$on('Удалена заявка ТМЦ', function(event, ask){
    $ctrl.TabLenRefresh();
  });
  
  $scope.$on('ТМЦ/сменился статус', function(event, id, status) {/// id---ид снаб-заявки; для фиксации момента обработки промежуточной базы, автоматическое создание перемещения на конечный объект
    var ask = $ctrl.data['по ИДам'][id];
    if ( ask && status == 'входящие' && ask['$позиции тмц'] && ask['$позиции тмц'].some(function(pos){ return !!pos['количество/принято'] && pos['объект/id'] != $ctrl.param['объект'].id; })) $rootScope.$broadcast('ТМЦ в перемещение/открыть или добавить в форму', ask);
    else /**if (status == 'входящие')*/ $timeout(function(){
      $ctrl.data['остатки'].length = 0;
      $ctrl.LoadDataOst();
      $ctrl.tab = undefined;
      $timeout(function(){
        $ctrl.tab = $ctrl.tabs['Завершено']['Остатки'];
      }, 1000);///пока костыль, не успевает сохранить поступление до обновления остатков
      
    });
    //~ console.log('ТМЦ/сменился статус', ask, $ctrl.param);
  });
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      if(!$ctrl.data) $ctrl.data = {};
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;

      //~ var async = [];
      //~ async.push($ctrl.LoadDataAsk());
      //~ async.push($ctrl.LoadDataSnab());
      //~ async.push($ctrl.LoadDataTransport());
      //~ async.push($ctrl.LoadDataMove());
      $ctrl.LoadDataOst();
      //~ $q.all(async).
      $ctrl.LoadData().then(function(){
        $ctrl.TabLenRefresh();
        
        if(!$ctrl.tab) {
          var tab = $ctrl.tabs['Движение']['Входящие'];
          if ($ctrl.data['снаб'].filter(tab['фильтр'], tab).length) $ctrl.SelectTab(tab);
          else if ( (tab = $ctrl.tabs['Заявки']['В обработке']) && $ctrl.data['снаб'].filter(tab['фильтр'], tab).length) $ctrl.SelectTab(tab);
          else $ctrl.SelectTab($ctrl.tabs['Заявки']['Новые']);
          //~ else /*if ($ctrl.data['заявки'].length)*/ $ctrl.SelectTab('Заявки', 'Новые');
        }
        
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
        
        
  };
  
  $ctrl.TabLiClass = function(tab){
    var c = tab.li_class  || '';
    if (tab === $ctrl.tab) c += ' active ';
    return c;
    
  };
  $ctrl.TabAClass = function(tab){
    var c = tab.a_class  || '';
    if (tab === $ctrl.tab) c += ' active '+(tab.aClassActive || '');
    return c;
    
  };
  
  $ctrl.LoadData = function(append){//для всех табов кроме заявок и остатков
    var offset=$ctrl.data['заявки'] ? $ctrl.data['заявки'].length : 0;
    //~ return TMCAskTableData.Load({'объект': $ctrl.param['объект'], /*'фильтр тмц': $ctrl.tab['фильтр тмц'],*/})
    return $http.post(appRoutes.url_for('тмц/объекты/списки'), {"объект": $ctrl.param['объект'], "offset": offset})
      .then(function(resp){
        if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red');
        else {
          if(!$ctrl.data['заявки']) $ctrl.data['заявки'] = [];
          if (!append) $ctrl.data['заявки'].length = 0;
          Array.prototype.push.apply($ctrl.data['заявки'], resp.data.shift());
          
          if(!$ctrl.data['снаб']) $ctrl.data['снаб'] = [];
          if (!append) $ctrl.data['снаб'].length = 0;
          Array.prototype.push.apply($ctrl.data['снаб'], resp.data.shift());
          
          $ctrl.data['по ИДам'] = $ctrl.data['снаб'].reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        }
      },
      function(resp){
        if ( resp.status == '404' ) $ctrl['нет доступа к заявкам'] = true;
        $ctrl.data['заявки'] = [];
      }
    );
    
  };
  
  /***$ctrl.LoadDataSnab = function(append){// вкладка обработка
    $ctrl.param.offset=$ctrl.data['снабжение'] ? $ctrl.data['снабжение'].length : 0;
    return $http.post(appRoutes.url_for('тмц/заявки с обработкой снабжения'), {'объект': $ctrl.param['объект'],})
      .then(function(resp){
        if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red');
        else {
          if(!$ctrl.data['снабжение']) $ctrl.data['снабжение'] = [];
          if (!append) $ctrl.data['снабжение'].length = 0;
          Array.prototype.push.apply($ctrl.data['снабжение'], resp.data);
        }
      },
      function(resp){
        if ( resp.status == '404' ) $ctrl['нет доступа к заявкам'] = true;
        $ctrl.data['заявки'] = [];
      }
    );
    
  };***/
  
  /****$ctrl.LoadDataTransport = function(append){//данные для вкладок Движения и Завершено (есть транспорт)
    $ctrl.param.offset=$ctrl.data['с транспортом'] ? $ctrl.data['с транспортом'].length : 0;
    
    return $http.post(appRoutes.url_for('тмц/заявки с транспортом'), $ctrl.param) //'список движения ДС'
      .then(function(resp){
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          if (!$ctrl.data['с транспортом']) $ctrl.data['с транспортом']=[];
          if (append === undefined) $ctrl.data['с транспортом'].length = 0;
          Array.prototype.push.apply($ctrl.data['с транспортом'], resp.data);
        }
        
      });
    
  };****/
  
  /****$ctrl.LoadDataMove = function(append){//данные для перемещения (нет транспорта)
    
    $ctrl.param.offset=$ctrl.data['перемещение'] ? $ctrl.data['перемещение'].length : 0;
    
    return $http.post(appRoutes.url_for('тмц/заявки/перемещение'), $ctrl.param) //'список движения ДС'
      .then(function(resp){
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          if (!$ctrl.data['перемещение']) $ctrl.data['перемещение']=[];
          if (append === undefined) $ctrl.data['перемещение'].length = 0;
          Array.prototype.push.apply($ctrl.data['перемещение'], resp.data);
        }
        
      });
    
  };***/
  
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
  
  $ctrl.SelectTab = function(tab, n1, n2){/// Требуется Новые
    if (!tab) {
      if (!n1) n1 = 'Заявки';
      if (!n2)  n2 = $ctrl.tabs[n1][Object.keys($ctrl.tabs[n1])[0] || ''];// перый подуровень
      tab = $ctrl.tabs[n1][n2];
    }
    //~ if(idx === undefined) idx = 0;
    //~ $ctrl.tab = undefined;
    $timeout(function(){ $ctrl.tab = tab; });
    
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