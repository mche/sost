(function () {'use strict';
/*
  Табы
*/

var moduleName = "ТМЦ склад списки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ список заявок', 'ТМЦ форма инвентаризации', 'ТМЦ список инвентаризаций', /*'ТМЦ обработка снабжением',*/
  'ТМЦ текущие остатки', 'ContragentData', 'TMCTablesLib']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, ContragentData, TMCTablesLib /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
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
            return $ctrl.data['заявки'].filter(tab['фильтр'], tab).length;
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
      ],
    },

  
  ];
  
  new TMCTablesLib($ctrl, $scope, $element);
  
  $scope.$on('Сохранена инвентаризация ТМЦ', function(event, save){
    var item = $ctrl.data.$инвентаризации[save.id];
    if (item) Object.keys(save).map(function(key){ item[key] = save[key]; });
    else {
      $ctrl.data['инвентаризации'].unshift(save);
      item = $ctrl.data.$инвентаризации[save.id] = save;
    }
    if ($ctrl.LoadDataOst) $ctrl.LoadDataOst();
    $ctrl.RefreshTab();
    //~ });
    
  });
    
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.data = {};
      //~ $ctrl.tab = $ctrl.tabs[0];
      
      var async = [];

      //~ async.push(ContragentData.Load());
      async.push($ctrl.LoadDataAsk());//.then()
      //~ async.push($ctrl.LoadDataSnab());
      $ctrl.LoadDataOst();
      
      $q.all(async).then(function(){
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
            
            //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'orange',});
            //~ $ctrl.tabsReady = true;
            if ($ctrl.data['заявки'].length) $ctrl.SelectTab(undefined, '', 'Заявки ТМЦ');
          });
        //~ });
        
      });
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