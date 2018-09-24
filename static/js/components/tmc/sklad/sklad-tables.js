(function () {'use strict';
/*
  Табы
*/

var moduleName = "ТМЦ склад списки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ список заявок', 'ТМЦ форма инвентаризации', 'ТМЦ список инвентаризаций', 'ТМЦ обработка снабжением',
  'ТМЦ текущие остатки', 'Контрагенты', 'TMCTablesLib']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, Контрагенты, TMCTablesLib /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
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
          "len":function(tab){
            //~ return !item["транспорт/заявки/id"];
            return $ctrl.data['заявки'] && $ctrl.data['заявки'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(it){ return true; },
          "liClass": 'orange lighten-3',
          "tbodyClass": 'orange lighten-5',
          "aClass": 'orange-text text-darken-3 ',
          "aClassActive": ' before-orange-darken-3',
          "svgClass":'orange-fill fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
        },
        {
          "title":'Инвентаризации',
          "len":function(tab){
            //~ return !item["транспорт/заявки/id"];
            return $ctrl.data['инвентаризации'] && $ctrl.data['инвентаризации'].filter(tab['фильтр'], tab).length;
          },
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
          "len":function(tab){
             return $ctrl.data['снаб'] && $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
            
          },
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
        "len":function(tab){
             return $ctrl.data['снаб'] && $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
         "len":function(tab){
             return $ctrl.data['снаб'] && $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
        "len":function(tab){
             return $ctrl.data['снаб'] && $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
  
  var save_inv = function(event, save){
    var item = $ctrl.data.$инвентаризации[save.id];
    if (item && save['_удалено']) {
      var idx = $ctrl.data['инвентаризации'].indexOf(item);
      $ctrl.data['инвентаризации'].splice(idx, 1);
      delete $ctrl.data.$инвентаризации[save.id];
    }
    if (item) Object.keys(save).map(function(key){ item[key] = save[key]; });
    else {
      $ctrl.data['инвентаризации'].unshift(save);
      item = $ctrl.data.$инвентаризации[save.id] = save;
    }
    if ($ctrl.LoadDataOst) $ctrl.LoadDataOst();
    $ctrl.RefreshTab();
    //~ });
    
  };
  $scope.$on('Сохранена инвентаризация ТМЦ', save_inv);
  
  $scope.$on('Удалена инвентаризация ТМЦ', function(event, remove){
    remove['_удалено'] = true;
    save_inv(undefined, remove);
  });
    
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.data = {};
      //~ $ctrl.tab = $ctrl.tabs[0];
      
      var async = [];

      //~ async.push(Контрагенты.Load());
      //~ async.push($ctrl.LoadDataAsk());//.then()
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
  
  $ctrl.LoadDataAsk = function(append){//param

    if (!$ctrl.data['заявки']) $ctrl.data['заявки']=[];
    //~ if (!$ctrl.data['простые поставки']) $ctrl.data['простые поставки'] = [];
    if (append === undefined) {
      $ctrl.data['заявки'].length = 0;
      //~ $ctrl.data['простые поставки'].length = 0;
    }
    
    if (!$ctrl.data.$заявки) $ctrl.data.$заявки = {};
    //~ $ctrl.param.offset=$ctrl.data['заявки'].length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttpAsk = 1;
    
    if (!$ctrl.param.offset) $ctrl.param.offset = {};
    $ctrl.param.offset['заявки'] = $ctrl.data['заявки'].length;
    //~ $ctrl.param.offset['простые поставки'] = $ctrl.data['простые поставки'].length;
    
    return $http.post(appRoutes.url_for('тмц/склад/список заявок'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        $ctrl.cancelerHttpAsk=undefined;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          //~ console.log("данные два списка: ", resp.data);
          var data =  resp.data.shift();
          Array.prototype.push.apply($ctrl.data['заявки'], data);// первый список - позиции тмц(необработанные и обработанные)
          data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $ctrl.data.$заявки);
          //~ data =  resp.data.shift();
          //~ Array.prototype.push.apply($ctrl.data['простые поставки'], data);
          //~ data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $ctrl.data.$заявки);
        }
        
      });
    
  };
  
  $ctrl.LoadDataInv = function(append){//param

    if (!$ctrl.data['инвентаризации']) $ctrl.data['инвентаризации']=[];
    //~ if (!$ctrl.data['простые поставки']) $ctrl.data['простые поставки'] = [];
    if (append === undefined) {
      $ctrl.data['инвентаризации'].length = 0;
      //~ $ctrl.data['простые поставки'].length = 0;
    }
    if (!$ctrl.data.$инвентаризации) $ctrl.data.$инвентаризации = {};
    $ctrl.cancelerHttpInv = 1;
    
    return $http.post(appRoutes.url_for('тмц/склад/список инвентаризаций'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        $ctrl.cancelerHttpInv=undefined;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          //~ console.log("данные два списка: ", resp.data);
          //~ var data =  resp.data.shift();
          Array.prototype.push.apply($ctrl.data['инвентаризации'], resp.data);// первый список - позиции тмц(необработанные и обработанные)
          resp.data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $ctrl.data.$инвентаризации);
          //~ data =  resp.data.shift();
          //~ Array.prototype.push.apply($ctrl.data['простые поставки'], data);
          //~ data.reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, $ctrl.data.$заявки);
        }
        
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
        
        var ka = Контрагенты.$Data();
        data.reduce(function(result, item, index, array) {
          item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
          result[item.id] = item;
          if (item['на объект/id']) item['@позиции тмц'].map(function(row){ row['через базу/id'] = item['на объект/id']; });///для приема ТМЦ на эту базу
          return result;
          
        }, $ctrl.data.$снаб);
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