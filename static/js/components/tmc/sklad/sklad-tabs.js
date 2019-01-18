(function () {'use strict';
/*
  Табы
*/

var moduleName = "ТМЦ склад списки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ список заявок', 'ТМЦ форма инвентаризации', 'ТМЦ форма перемещения', 'ТМЦ список инвентаризаций', 'ТМЦ обработка снабжением',
  'ТМЦ текущие остатки', 'Контрагенты', 'TMCTabsLib']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, $Контрагенты, $TMCTabsLib, $Список /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $c.tabs = [
    {// строка
      "title": '',
      "childs":[
        {
          "title":'Запросы остатков',
          "data": 'резервы остатков',
          "фильтр": function(it){ return true; },
          "liClass": 'navy lighten-5',
          "tbodyClass": 'navy lighten-5',
          "aClass": 'navy-text ',
          "aClassActive": ' before-navy',
          "svgClass":'navy-fill fill-darken-1',
          //~ "liStyle":{"margin-right": '1rem'},
        },
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
          "len-000":function(tab){ return $c.data['остатки'] && $c.data['остатки'].length; },
          "liClass": 'teal lighten-4',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'teal-text text-darken-4 ',
          "aClassActive": ' before-teal-darken-4',
          svgClass: ' teal-fill fill-darken-4 ',
        },
      ],
    },
    {///строка
      title: '',
      childs: [
        {
        title: 'Закупки',
        "descr": '',///в транспортировке
        "data": 'снаб',
        "фильтр":  function(it){
          var tab = this || $c.tab;
          //~ var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && !it['с объекта/id'] && (!it['на объект/id'] || it['на объект/id'] == $c.param['объект'].id) /*&& it['@позиции тмц'].some(tab['фильтр тмц'])*/;
          var t = !it['с объекта/id'];
          if (t) it['статус'] = "закупка";///входящие
          return t;
        },
        //~ "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $c.param['объект'].id || tmc['на объект/id'] == $c.param['объект'].id) && !tmc['количество/принято']; },
        "liClass": 'green lighten-3',
        "aClass": 'green-text text-darken-4 ',
        "aClassActive": ' before-green-darken-4',
        "svgClass": 'green-fill fill-darken-4',
        },
        
        {//tab
          "title": 'Через склад',
          "data": 'снаб',
          "фильтр": function(it){
            return !!it['на объект/id'];/// && !it['с объекта/id'];
          },
          "liClass": 'navy lighten-5',
          "aClass": 'navy-text ',
          "aClassActive": ' before-navy',
          "svgClass":'navy-fill',
        },
        
        {
        title: 'Перемещения',
        "descr": 'на другой объект',
        "data": 'снаб',
        "фильтр": function(it){
           var tab = this || $c.tab;
          //~ var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && (it['с объекта/id'] == $c.param['объект'].id || !!it['с объекта/id'] &&   it['@позиции тмц'].some(tab['фильтр тмц']));
          var t = !!it['с объекта/id'];
          if (t) it['статус'] = "перемещение";
          return t;
        },
        //~ "фильтр тмц": function(tmc){ return !tmc['количество/принято'];},
        //~ "фильтр тмц": function(tmc){ return tmc['объект/id'] ==  $c.param['объект'].id;},
        "liClass": 'red lighten-3',
        "aClass": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
        "svgClass": 'red-fill fill-darken-3 ',
        },
      ],
      //~ "liClass": ' teal-text text-darken-3',
      //~ "svgClass":'teal-fill fill-darken-3',
      
    },
/*    {///строка
      title: 'Завершено',
      "liClass": 'teal-000-lighten-2 teal-text text-darken-3',
      "svgClass":'teal-fill fill-darken-3',
      childs: [
        {
         title: 'Поступило',
        "descr": 'в приход этого объекта',
        "data": 'снаб',
        "фильтр": function(it){
          var tab = this || $c.tab;
          var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && (!it['на объект/id'] || it['на объект/id'] == $c.param['объект'].id) && it['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) it['статус'] = "поступило";
          return t;
        },
        "фильтр тмц": function(tmc){ return (tmc['объект/id'] == $c.param['объект'].id || tmc['на объект/id'] == $c.param['объект'].id) && !!tmc['количество/принято']; },
        "liClass": 'green lighten-3',//
        "aClass": 'green-text text-darken-3 ',
        "aClassActive": ' before-green-darken-3',
        
        },
        {
        title: 'Перемещено',
        "descr": 'на другой объект',
        "data": 'снаб',
        "фильтр": function(it){
          var tab = this || $c.tab;
          var t = tab && (!!it['транспорт/id'] || !!it['без транспорта']) && it['с объекта/id'] == $c.param['объект'].id && it['@позиции тмц'].some(tab['фильтр тмц']);
          if (t) it['статус'] = "отгружено";
          return t;
        },
        "фильтр тмц": function(tmc){ return !!tmc['количество/принято'];},
        "liClass": 'red lighten-3',//orange 
        "aClass": 'red-text text-darken-3 ',
        "aClassActive": ' before-red-darken-3',
        },
      ],
      
    },*/
  ];
  
  new $TMCTabsLib($c, $scope, $element);
    
  $c.$onInit = function(){
    //~ $timeout(function(){
      if(!$c.param.table) $c.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $c.param;
      $c.data = {};
      //~ $c.tab = $c.tabs[0];
      
      var async = [];

      //~ async.push($Контрагенты.Load());
      //~ async.push($c.LoadDataAsk());//.then()
      async.push($c.LoadDataReqOst());
      async.push($c.LoadDataAsk());
      //~ async.push($c.LoadDataSnab());
      $c.LoadDataOst();
      $c.LoadDataSnab();
      
      $q.all(async).then(function(){
        if (!$c.tab /*&& $c.data['заявки'].Data().length*/) $c.SelectTab(undefined, '', 'Заявки ТМЦ');
      });
        $c.ready = true;
        
        //~ $c.LoadDataSnab();
        $c.LoadDataInv();
        
          $timeout(function(){
            $('.modal', $($element[0])).modal({
              endingTop: '0%',
              ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                $c.modal_trigger = trigger;
              },
            });
            
            ///if ($c.data['заявки'].length) $c.SelectTab(undefined, '', 'Заявки ТМЦ');
          });
      //~ });
  };
  
  $c.LoadDataAsk = function(){//param
    
    $c.data['заявки'] = new $Список(appRoutes.url_for('тмц/склад/список заявок'), $c, $scope, $element);
    return $c.data['заявки'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$заявки) $c.data.$заявки = {};
      $c.data['заявки'].$Data($c.data.$заявки);
      //~ if (!$c.tab && $c.data['заявки'].Data().length) $c.SelectTab(undefined, '', 'Заявки ТМЦ');
    });
  };
  
  
  $c.LoadDataReqOst = function(){//param
    
    $c.data['резервы остатков'] = new $Список(appRoutes.url_for('тмц/склад/резервы остатков'), $c, $scope, $element);
    return $c.data['резервы остатков'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$резервыОстатков) $c.data.$резервыОстатков = {};
      $c.data['резервы остатков'].$Data($c.data.$резервыОстатков);
      if (!$c.tab && $c.data['резервы остатков'].Data().length) $c.SelectTab(undefined, '', 'Запросы остатков');
    });
  };
  
  $c.LoadDataInv = function(){//param
    
    $c.data['инвентаризации'] = new $Список(appRoutes.url_for('тмц/склад/список инвентаризаций'), $c, $scope, $element);
    return $c.data['инвентаризации'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$инвентаризации) $c.data.$инвентаризации = {};
      $c.data['инвентаризации'].$Data($c.data.$инвентаризации);
    });
    
  };
  
  $c.LoadDataSnab = function(append){//для Входящих, Завершенных и Перемещений
    
    $c.data['снаб'] = new $Список(appRoutes.url_for('тмц/склад/списки'), $c, $scope);
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
    
    /*
    if (!$c.data['снаб']) $c.data['снаб']=[];
    if (append === undefined) {
      $c.data['снаб'].length = 0;
    }
    var offset=$c.data['снаб'].length;
    
    return $http.post(appRoutes.url_for('тмц/склад/списки'), {"объект": $c.param['объект'], "offset": offset})
      .then(function(resp){
        if(resp.data.error) return Materialize.toast(resp.data.error, 5000, 'red');
        ///else
        var data = resp.data;///.shift();
        Array.prototype.push.apply($c.data['снаб'], data);
        
        if (!$c.data.$снаб) $c.data.$снаб = {};
        
        var ka = $Контрагенты.$Data();
        data.reduce(function(result, item, index, array) {
          item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
          result[item.id] = item;
          if (item['на объект/id']) item['@позиции тмц'].map(function(row){ row['через базу/id'] = item['на объект/id']; });///для приема ТМЦ на эту базу
          return result;
          
        }, $c.data.$снаб);
        
        var tab = $c.TabByName('Движение', 'Входящие');
        
        if (!$c.tab && tab && $c.TabLen(tab)) $c.SelectTab(tab);
      }
      //~ function(resp){  }
    );
    */
  };
  
  
};


/*=============================================================*/

module

.component('tmcSkladTabs', {
  controllerAs: '$c',
  templateUrl: "tmc/sklad/tabs",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());