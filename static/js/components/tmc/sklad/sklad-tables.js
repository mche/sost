(function () {'use strict';
/*
  Табы
*/

var moduleName = "ТМЦ склад списки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ список заявок', 'ТМЦ форма инвентаризации', 'ТМЦ форма перемещения', 'ТМЦ список инвентаризаций', 'ТМЦ обработка снабжением',
  'ТМЦ текущие остатки', 'Контрагенты', 'TMCTablesLib']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, $Контрагенты, TMCTablesLib, $Список /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $ctrl.tabs = [
    {// строка
      "title": '',
      "childs":[
        {
          "title":'Заявки ТМЦ',
          "data": 'заявки',
          "фильтр": function(it){ return true; },
          "liClass": 'orange lighten-4',
          "tbodyClass": 'orange lighten-5',
          "aClass": 'orange-text text-darken-3 ',
          "aClassActive": ' before-orange-darken-3',
          "svgClass":'orange-fill fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
        },
        {
          "title":'Инвентаризации',
          "data": 'инвентаризации',
          "фильтр": function(it){ return true; },
          "liClass": 'blue lighten-3',
          "tbodyClass": 'orange lighten-5',
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',
        },
        {//таб
          "title": 'Остатки',
          "len-000":function(tab){ return $ctrl.data['остатки'] && $ctrl.data['остатки'].length; },
          "liClass": 'purple lighten-4',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'purple-text text-darken-3 ',
          "aClassActive": ' before-purple-darken-3',
          svgClass: ' purple-fill fill-darken-1 ',
        },
      ],
    },
    {///строка
      title: 'Движение',
      childs: [
        {
        title: 'Входящие',
        "descr": 'в транспортировке',
        "data": 'снаб',
        "фильтр":  function(it){
          var tab = this || $ctrl.tab;
          var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && (!it['на объект/id'] || it['на объект/id'] == $ctrl.param['объект'].id) && it['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) it['статус'] = "входящие";
          return t;
        },
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['на объект/id'] == $ctrl.param['объект'].id) && !tmc['количество/принято']; },
        "liClass": 'teal lighten-3',
        "aClass": 'teal-text text-darken-3 ',
        "aClassActive": ' before-teal-darken-3',
        "svgClass": 'teal-fill fill-darken-3',
        },
        {
        title: 'Перемещения',
        "descr": 'на другой объект',
        "data": 'снаб',
        "фильтр": function(it){
           var tab = this || $ctrl.tab;
          var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && it['с объекта/id'] == $ctrl.param['объект'].id && it['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) it['статус'] = "перемещение";
          return t;
        },
        "фильтр тмц": function(tmc){ return !tmc['количество/принято'];},
        "liClass": 'red lighten-3',
        "aClass": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
        "svgClass": 'red-fill fill-darken-3 ',
        },
      ],
      "liClass": 'teal-000-lighten-2 teal-text text-darken-3',
      "svgClass":'teal-fill fill-darken-3',
      
    },
    {///строка
      title: 'Завершено',
      "liClass": 'teal-000-lighten-2 teal-text text-darken-3',
      "svgClass":'teal-fill fill-darken-3',
      childs: [
        {
         title: 'Поступило',
        "descr": 'в приход этого объекта',
        "data": 'снаб',
        "фильтр": function(it){
          var tab = this || $ctrl.tab;
          var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && (!it['на объект/id'] || it['на объект/id'] == $ctrl.param['объект'].id) && it['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) it['статус'] = "поступило";
          return t;
        },
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $ctrl.param['объект'].id || tmc['на объект/id'] == $ctrl.param['объект'].id) && !!tmc['количество/принято']; },
        "liClass": 'green lighten-3',//
        "aClass": 'green-text text-darken-3 ',
        "aClassActive": ' before-green-darken-3',
        
        },
        {
        title: 'Перемещено',
        "descr": 'на другой объект',
        "data": 'снаб',
        "фильтр": function(it){
          var tab = this || $ctrl.tab;
          var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && it['с объекта/id'] == $ctrl.param['объект'].id && it['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) it['статус'] = "отгружено";
          return t;
        },
        "фильтр тмц": function(tmc){ return !!tmc['количество/принято'];},
        "liClass": 'red lighten-3',//orange 
        "aClass": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
        },
      ],
      
    },
  ];
  
  new TMCTablesLib($ctrl, $scope, $element);
    
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.data = {};
      //~ $ctrl.tab = $ctrl.tabs[0];
      
      var async = [];

      //~ async.push($Контрагенты.Load());
      //~ async.push($ctrl.LoadDataAsk());//.then()
      $ctrl.LoadDataAsk();
      //~ async.push($ctrl.LoadDataSnab());
      $ctrl.LoadDataOst();
      $ctrl.LoadDataSnab();
      
      //~ $q.all(async).then(function(){
        $ctrl.ready = true;
        
        //~ $ctrl.LoadDataSnab();
        $ctrl.LoadDataInv();
        
          $timeout(function(){
            $('.modal', $($element[0])).modal({
              endingTop: '0%',
              ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                $ctrl.modal_trigger = trigger;
              },
            });
            
            ///if ($ctrl.data['заявки'].length) $ctrl.SelectTab(undefined, '', 'Заявки ТМЦ');
          });
      //~ });
  };
  
  $ctrl.LoadDataAsk = function(){//param
    
    $ctrl.data['заявки'] = new $Список(appRoutes.url_for('тмц/склад/список заявок'), $ctrl, $scope, $element);
    return $ctrl.data['заявки'].Load({"объект": $ctrl.param['объект']}).then(function(){
      if (!$ctrl.data.$заявки) $ctrl.data.$заявки = {};
      $ctrl.data['заявки'].$Data($ctrl.data.$заявки);
      if (!$ctrl.tab && $ctrl.data['заявки'].Data().length) $ctrl.SelectTab(undefined, '', 'Заявки ТМЦ');
    });
  };
  
  $ctrl.LoadDataInv = function(){//param
    
    $ctrl.data['инвентаризации'] = new $Список(appRoutes.url_for('тмц/склад/список инвентаризаций'), $ctrl, $scope, $element);
    return $ctrl.data['инвентаризации'].Load({"объект": $ctrl.param['объект']}).then(function(){
      if (!$ctrl.data.$инвентаризации) $ctrl.data.$инвентаризации = {};
      $ctrl.data['инвентаризации'].$Data($ctrl.data.$инвентаризации);
    });
    
  };
  
  $ctrl.LoadDataSnab = function(append){//для Входящих, Завершенных и Перемещений
    if (!$ctrl.data['снаб']) $ctrl.data['снаб']=[];
    if (append === undefined) {
      $ctrl.data['снаб'].length = 0;
    }
    var offset=$ctrl.data['снаб'].length;
    
    return $http.post(appRoutes.url_for('тмц/склад/списки'), {"объект": $ctrl.param['объект'], "offset": offset})
      .then(function(resp){
        if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red');
        ///else
        var data = resp.data;///.shift();
        Array.prototype.push.apply($ctrl.data['снаб'], data);
        
        if (!$ctrl.data.$снаб) $ctrl.data.$снаб = {};
        
        var ka = $Контрагенты.$Data();
        data.reduce(function(result, item, index, array) {
          item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
          result[item.id] = item;
          if (item['на объект/id']) item['@позиции тмц'].map(function(row){ row['через базу/id'] = item['на объект/id']; });///для приема ТМЦ на эту базу
          return result;
          
        }, $ctrl.data.$снаб);
        
        var tab = $ctrl.TabByName('Движение', 'Входящие');
        
        if (!$ctrl.tab && tab && $ctrl.TabLen(tab)) $ctrl.SelectTab(tab);
      }
      //~ function(resp){  }
    );
    
  };
  
  
};


/*=============================================================*/

module

.component('tmcSkladTables', {
  templateUrl: "tmc/sklad/tables",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());