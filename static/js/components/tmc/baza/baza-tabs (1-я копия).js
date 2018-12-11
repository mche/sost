(function () {'use strict';
/*
  табы
*/

var moduleName = "ТМЦ на объектах";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween', /*'Объект или адрес', 'TMCSnab',*/
  'ТМЦ форма заявки', 'ТМЦ форма перемещения', 'ТМЦ список заявок', 'ТМЦ обработка снабжением',  'ТМЦ текущие остатки',
  'Контрагенты', 'TMCTabsLib',
]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, $Контрагенты, $TMCTabsLib, $Список /*Util,*/  /*, AutoJSON*/ /*TMCSnab,ObjectAddrData*/) {//TMCAskTableData
  var $c = this;
  $scope.parseFloat = parseFloat;
  //~ $scope.Util = Util;
  //~ $scope.$sce = $sce;
  //~ $c.TabLen = function(name, filter, tab){
    //~ if (!$c.data[name] || !$c.data[name].length) return;
    //~ if(!filter) return;
    //~ return $c.data[name].filter(filter, tab).length;
  //~ };
  //~ $c.TabLenRefresh = function(){
    //~ $scope.tabLen = !1;
    //~ $timeout(function(){ $scope.tabLen = !0; });
  //~ };
  $c.tabs = {
    'Заявки':{
      'Новые': {
        "data":'заявки',
        "фильтр": function(ask){ return !ask['номенклатура/id'] /*|| !tmc['транспорт/заявки/id']*/; },
        "liClass": 'orange lighten-4',
        "aClass": 'orange-text text-darken-4 ',
        "aClassActive": ' before-orange-darken-4',
      },
      'В обработке': {
        "data":'заявки',
        "descr": '',
        "фильтр": function(ask){ return !!ask['номенклатура/id'] /* (!ask['транспорт/id'] && !ask['без транспорта']) && !ask['с объекта/id']/* && !tmc['с объекта'] && !tmc['на объект']*/; },
        "liClass": 'orange lighten-4',
        //~ "li_style":  {'margin-right': '1rem'},
        "aClass": 'orange-text text-darken-4 ',
        "aClassActive": ' before-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },
      /***'Входящие': {// с этого объекта (в обработке!)
        "data":'перемещение',
        "фильтр": function(ask){
           var tab = this || $c.tab;
          return tab && ask['на объект/id'] && ask['на объект/id'] == $c.param['объект'].id;
        },
        "liClass": 'orange lighten-3',
        "aClass": 'orange-text text-darken-4 before-000-orange-darken-4',
        "svg_class": 'orange-fill fill-darken-4',
      },***/
      /*'Перемещение': {// с этого объекта
        "data":'снаб',
        "descr": 'перемещение на другой объект (еще без транспорта)',
        "фильтр": function(ask){
           var tab = this || $c.tab;
          var t = tab && (!ask['транспорт/id'] && !ask['без транспорта']) && ask['с объекта/id'] && ask['с объекта/id'] == $c.param['объект'].id ///&& ask['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "перемещение без транспорта";
          return t;
        },
        //~ "фильтр тмц": function(tmc){ return !!tmc['транспорт/заявки/id'] && tmc['через базы/id'][0] != $c.param['объект'].id; },
        "liClass": 'red lighten-3',
        "aClass": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
        "svg_class": 'red-fill fill-darken-3 ',
      },*/
      
    },
    'Движение': {
      'Входящие':{
        "data":'снаб',
        "descr": 'транспорт на подходе',
        "фильтр":  function(ask){
          var tab = this || $c.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && (!ask['на объект/id'] || ask['на объект/id'] == $c.param['объект'].id) && ask['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "входящие";
          return t;
        },
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $c.param['объект'].id || tmc['на объект/id'] == $c.param['объект'].id) && !tmc['количество/принято']; },
        "liClass": 'teal lighten-3',
        "aClass": 'teal-text text-darken-4 ',
        "aClassActive": ' before-teal-darken-4',
        "svg_class": 'teal-fill fill-darken-4',
      },
      'Перемещение':{
        "data":'снаб',
        "descr": 'перемещение на другой объект (с транспортом)',
        "фильтр": function(ask){
           var tab = this || $c.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['с объекта/id'] == $c.param['объект'].id && ask['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "перемещение с транспортом";
          return t;
        },
        "фильтр тмц": function(tmc){ return !tmc['количество/принято'];},
        "liClass": 'red lighten-3',
        "aClass": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
        "svg_class": 'red-fill fill-darken-3 ',
      },
    },
    'Завершено': {
      'Поступило':{
        "data":'снаб',
        "descr": 'получено в приход этого объекта',
        "фильтр": function(ask){
          var tab = this || $c.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && (!ask['на объект/id'] || ask['на объект/id'] == $c.param['объект'].id) && ask['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "поступило";
          return t;
        },
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $c.param['объект'].id || tmc['на объект/id'] == $c.param['объект'].id) && !!tmc['количество/принято']; },
        "liClass": 'green lighten-3',//
        "aClass": 'green-text text-darken-3 ',
        "aClassActive": ' before-green-darken-3',
        
      },
      'Перемещено':{
        "data":'снаб',
        "descr": 'перемещено и списано на другой объект',
        "фильтр": function(ask){
          var tab = this || $c.tab;
          var t = tab && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['с объекта/id'] == $c.param['объект'].id && ask['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) ask['статус'] = "отгружено";
          return t;
        },
        "фильтр тмц": function(tmc){ return !!tmc['количество/принято'];},
        "liClass": 'red lighten-3',//orange 
        "aClass": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
      },
      'Списано': {
        "data":'простые поставки',
        "descr": 'постая поставка по заявке без принятия на приход',
        "фильтр": function(it){ return true /*|| !tmc['транспорт/заявки/id']*/; },
        "liClass": 'maroon lighten-4',
        "tbodyClass": 'maroon lighten-5',
        "aClass": 'maroon-text text-darken-3 ',
        "aClassActive": ' before-maroon-darken-3',
      },
      'Остатки':{
        "data":'остатки',
        "descr": 'текущее наличие',
        "фильтр-000": function(ask){
          return true;
          //~ return !!ask['базы'] && !!ask['базы'][0];
        },
        "liClass": 'purple lighten-4',
        "aClass": 'purple-text text-darken-3 ',
        "aClassActive": ' before-purple-darken-3',
      },
    },
  };
  
  new $TMCTabsLib($c, $scope, $element);
  
  $scope.$on('Сохранена заявка ТМЦ', function(event, ask){
    $c.RefreshTab();
  });
  $scope.$on('Удалена заявка ТМЦ', function(event, ask){
    $c.RefreshTab();
  });
  

  
  $c.$onInit = function(){
      if(!$c.data) $c.data = {};
      if(!$c.param.table) $c.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $c.param;

      var async = [];
      async.push($c.LoadDataAsk());
      //~ async.push($c.LoadDataEasy());
      //~ async.push($c.LoadDataSnab());
      async.push($Контрагенты.Load());
      $c.LoadDataOst();
      $c.LoadDataEasy();
      $q.all(async).then(function(){
        
        $c.LoadDataSnab().then(function(){
          //~ $c.RefreshTab();
          
          /*if(!$c.tab) {
            var tab = $c.tabs['Движение']['Входящие'];
            if ($c.data['снаб'].filter(tab['фильтр'], tab).length) $c.SelectTab(tab);
            else if ( (tab = $c.tabs['Заявки']['В обработке']) && $c.data['снаб'].filter(tab['фильтр'], tab).length) $c.SelectTab(tab);
            else $c.SelectTab($c.tabs['Заявки']['Новые']);
            //~ else /*if ($c.data['заявки'].length)// $c.SelectTab('Заявки', 'Новые');
          }*/
          
        });
        
      });
      
        $c.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $c.modal_trigger = trigger;
            },
          });
        });
        
        
  };
  
  $c.LoadDataAsk = function(){//
    $c.data['заявки'] = new $Список(appRoutes.url_for('тмц/объекты/список заявок'), $c, $scope, $element);
    return $c.data['заявки'].Load({"объект": $c.param['объект']});
  };
  
  $c.LoadDataEasy = function(){//
    $c.data['простые поставки'] = new $Список(appRoutes.url_for('тмц/объекты/список простые поставки'), $c, $scope, $element);
    return $c.data['простые поставки'].Load({"объект": $c.param['объект']});
  };
  
  $c.LoadDataSnab = function(append){//для всех табов кроме заявок и остатков
    
    $c.data['снаб'] = new $Список(appRoutes.url_for('тмц/объекты/список снаб'), $c, $scope);
    $c.data['снаб'].OnLoad = function(data){
      //~ console.log('снаб OnLoad', this);
      var ka = $Контрагенты.$Data();
      data.map(function(item){
        item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
        //~ if (item['на объект/id']) item['@позиции тмц'].map(function(row){ row['через базу/id'] = item['на объект/id']; });///для приема ТМЦ на эту базу
      });
    };
    return $c.data['снаб'].Load({"объект": $c.param['объект']}).then(function(data){///массив
      if (!$c.data.$снаб) $c.data.$снаб = {};
      $c.data['снаб'].$Data($c.data.$снаб);
    });
    
    /*return $http.post(appRoutes.url_for('тмц/объекты/список снаб'), {"объект": $c.param['объект']})
      .then(function(resp){
        if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red-text text-darken-3 red lighten-3 fw500 border animated zoomInUp slow');
        
          if(!$c.data['снаб']) $c.data['снаб'] = [];
          if (!append) $c.data['снаб'].splice(0, $c.data['снаб'].length);
        
          Array.prototype.push.apply($c.data['снаб'], resp.data);
          
          var ka = $Контрагенты.$Data();
          $c.data.$снаб = $c.data['снаб'].reduce(function(result, item, index, array) {
            item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
            result[item.id] = item;
            if (item['на объект/id']) item['@позиции тмц'].map(function(row){ row['через базу/id'] = item['на объект/id']; });///для приема ТМЦ на эту базу
            return result;
            
          }, {});
        //~ }
      }
      //~ function(resp){
        //~ if ( resp.status == '404' ) $c['нет доступа к заявкам'] = true;
        //~ $c.data['заявки'] = [];
      //~ }
    );*/
    
  };
  
  $c.SelectTab = function(tab, n1, n2){/// Требуется Новые
    if (!tab) {
      if (!n1) n1 = 'Заявки';
      if (!n2)  n2 = $c.tabs[n1][Object.keys($c.tabs[n1])[0] || ''];// перый подуровень
      tab = $c.tabs[n1][n2];
    }
    //~ if(idx === undefined) idx = 0;
    $c.tab = undefined;
    $timeout(function(){ $c.tab = tab; });
    
  };
  
  
  
};
/*=============================================================*/

module

.component('tmcBazaTabs', {
  controllerAs: '$c',
  templateUrl: "tmc/baza/tabs",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());