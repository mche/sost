(function () {'use strict';
/*
  табы
*/

var moduleName = "ТМЦ снабжение списки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ список заявок', 'ТМЦ форма перемещения', 'ТМЦ форма закупки',
  'ТМЦ таблица','ТМЦ текущие остатки', 'Контрагенты', /*'TMCTableLib',*/ 'TMCTabsLib', 'ТМЦ список инвентаризаций'/*, 'ТМЦ форма инвентаризации',*/]);//'ngSanitize',, 'dndLists'

const Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, $Контрагенты, $TMCTabsLib, $Список /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
  var $c = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $c.tabs = [
    {// строка
      "title": '',
      "childs":[
        {
          "title":'Заявки ТМЦ',
          "data": 'заявки',
          //~ "фильтр": function(it){ return !it['номенклатура/id'] && /*it['количество']>((it['тмц/количество'] || 0)+(it['простая поставка/количество'] || 0))*/ !it['простая поставка/количество']; /*!it['@тмц/строки простой поставки'] || !it['@тмц/строки простой поставки'].length;*/ },
          "liClass": 'orange lighten-4',
          //~ "tbodyClass": 'orange lighten-5',
          "aClass": 'orange-text text-darken-4 ',
          "aClassActive": ' before-orange-darken-4',
          "svgClass":'orange-fill fill-darken-4',
          //~ "liStyle":{"margin-right": '1rem'},
        },
        
        /*{
          "title": 'В обработке',
          "data": 'заявки',
          "descr": 'с номенклатурой',
          "фильтр": function(it){ return !!it['номенклатура/id'] && !it['простая поставка/количество']; },
          "liClass": 'orange lighten-4',
          //~ "tbodyClass": 'orange lighten-5',
          "aClass": 'orange-text text-darken-4 ',
          "aClassActive": ' before-orange-darken-4',
          "svgClass": ' rotate90right orange-fill fill-darken-4',
        },*/
        
        {
          "title": 'Завершено',
          "data": 'завершенные заявки',
          "descr": 'заявки',
          "фильтр": function(it){ return true; },
          "liClass": 'orange lighten-4',
          "aClass": 'orange-text text-darken-4 ',
          "aClassActive": ' before-orange-darken-4',
          "svgClass": ' orange-fill fill-darken-4',
        },
      
      ],
      "liClass": '',//orange lighten-3
    },
    
    {// строка
      "title":'',
      "childs": [
        {// tab
          "title": 'Закупки',
          "data": 'снаб',
          "фильтр": function(ask){
            return !ask['с объекта/id'] && !ask['на объект/id'];
          },
          "liClass": 'green lighten-3',
          "aClass": 'green-text text-darken-4 ',
          "aClassActive": ' before-green-darken-4',
          "svgClass":'green-fill fill-darken-4',
        },
        
        {//tab
          "title": 'Через склад',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['на объект/id'] /*&& !ask['с объекта/id']*/;
          },
          "liClass": 'navy lighten-4',
          "aClass": 'navy-text text-darken-1 ',
          "aClassActive": ' before-navy',
          "svgClass":'navy-fill-darken-1',
        },
        
        {//tab
          "title": 'Перемещения',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['с объекта/id'] /*&& !ask['на объект/id']*/;
          },
          "liClass": 'red lighten-3',
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3 ',
          "svgClass":'red-fill fill-darken-3',
        },

        
      ],
      "liClass": '',
    },
    
        {// строка
      "title": '',
      "childs":[
        /*{
          "title":'Простые закупки',
          "data": 'простые закупки',
          "фильтр": function(it){ return it['простая поставка/количество']; ///!!it['@тмц/строки простой поставки'] && !!it['@тмц/строки простой поставки'].length;/// },
          "liClass": 'maroon lighten-4',
          "tbodyClass": 'maroon lighten-5',
          "aClass": 'maroon-text text-darken-3 ',
          "aClassActive": ' before-maroon-darken-3',
          ///"svgClass":'maroon-fill fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
        },*/
        
        {
          "title":'Списания ТМЦ',
          "data": 'списания',
          "фильтр": function(it){ return true; },
          "liClass": 'yellow lighten-5',
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3',
          "svgClass":'red-fill fill-darken-3',
        },
        
        {
          "title":'Инвентаризации',
          "data": 'инвентаризации',
          "фильтр": function(it){ return true; },
          "liClass": 'blue lighten-3',
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',
        },
        
        {//таб
          "title": 'Наличие ТМЦ',
          "len-000":function(tab){ return $c.data['остатки'] && $c.data['остатки'].length; },
          "liClass": 'teal lighten-4',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'teal-text text-darken-4 ',
          "aClassActive": ' before-teal-darken-4',
          "svgClass":'teal-fill fill-darken-4',
        },
      
      ],
      "liClass": '',//orange lighten-3
    },
    
    /***{// строка
      "title":'Закупки',
      "childs": [
        {// tab
          "title": 'все',
          "data": 'снаб',
          "фильтр": function(ask){
            return !(ask['с объекта/id'] || ask['на объект/id']);
          },
          "liClass": 'green lighten-3',
          "aClass": 'green-text text-darken-3 ',
          "aClassActive": ' before-green-darken-3',
          "svgClass":'green-fill fill-darken-3',
        },
        {// tab
          "title": 'в работе',
          "data": 'снаб',
          "фильтр": function(ask){
            return !(ask['с объекта/id'] || ask['на объект/id']) && (!ask['транспорт/id'] && !ask['без транспорта']);// без транспорта
          },
          "liClass": 'green lighten-3',
          "aClass": 'green-text text-darken-3 ',
          "aClassActive": ' before-green-darken-3',
          "svgClass":'green-fill fill-darken-3',
        },
        {// tab
          "title": 'в перевозке',
          "data": 'снаб',
          "фильтр": function(ask){
            return !(ask['с объекта/id'] || ask['на объект/id']) && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['@позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
          },
          "liClass": 'green lighten-3',
          "aClass": 'green-text text-darken-3 ',
          "aClassActive": ' before-green-darken-3',
          "svgClass":'green-fill fill-darken-3',
        },
        {//tab
          "title":'завершено',
          "data": 'снаб',
          "фильтр": function(ask){
            return  !(ask['с объекта/id'] || ask['на объект/id']) && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['@позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
          },
          "liClass": 'green lighten-3',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'green-text text-darken-3 ',
          "aClassActive": ' before-green-darken-3',
          "svgClass":'green-fill fill-darken-3',//'circle green grey-fill darken-3',
        },
      
      ],
      
      "liClass": ' green-text text-darken-3 fw500 ',
      "svgClass":'green-fill fill-darken-3',
    },
    
    
    {// строка
      "title":'Через базу',
      "childs": [
        {//tab
          "title": 'все',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['на объект/id'];
          },
          "liClass": 'blue lighten-3',
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',
        },
        {//tab
          "title": 'в работе',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['на объект/id'] && (!ask['транспорт/id'] && !ask['без транспорта']);
          },
          "liClass": 'blue lighten-3',
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',
        },
        {//таб
          "title":'в перевозке',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['на объект/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['@позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
          },
          "liClass": 'blue lighten-3',
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',
        },
        {//таб
          "title":'завершено',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['на объект/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['@позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
          },
          "liClass": 'blue lighten-3',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',//'circle blue grey-fill darken-3',
        },
      
      ],
      "liClass": ' blue-text text-darken-3 fw500',
      "svgClass":'blue-fill fill-darken-3',
    },
    
    {// строка
      "title":'Перемещения',
      "childs": [
        {//tab
          "title": 'все',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['с объекта/id'];
          },
          "liClass": 'red lighten-3',
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3 ',
          "svgClass":'red-fill fill-darken-3',
        },
        {//tab
          "title": 'в работе',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['с объекта/id'] && (!ask['транспорт/id'] && !ask['без транспорта']);
          },
          "liClass": 'red lighten-3',
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3 ',
          "svgClass":'red-fill fill-darken-3',
        },
        {//таб
          "title":'в перевозке',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['с объекта/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['@позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
          },
          "liClass": 'red lighten-3',
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3 ',
          "svgClass":'red-fill fill-darken-3',
        },
        {//таб
          "title":'завершено',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['с объекта/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['@позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
          },
          "liClass": 'red lighten-3',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3 ',
          "svgClass":'red-fill fill-darken-3',//'circle blue grey-fill darken-3',
        },
      
      ],
      "liClass": ' red-text text-darken-3 fw500 ',
      "svgClass":' red-fill fill-darken-3',
    },***/
  ];
    
  new $TMCTabsLib($c, $scope, $element);
  
  $scope.$on('Сохранено/простая поставка ТМЦ', function(event, save){
    /***var ask = $c.data.$заявки[save.id];
    Object.keys(save).map(function(key){ ask[key] = save[key]; });
    ask._hide = true;
    $timeout(function(){ ask._hide = undefined; });
    ***/
    $c.LoadDataAsk().then();
  });
  
  ///потому что форма не активна
  $scope.$on('Редактировать списание ТМЦ', function(event, data, param){
    $c['списание'] = data;
    $timeout(function(){ $scope.paramSpis = {'объект': $c.param['объект'],}; });
    
  });
  
  $c.$onInit = function(){
    //~ $timeout(function(){
      if(!$c.param.table) $c.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $c.param;
      $c.data = {};
      //~ $c.tab = $c.tabs[0];
      
      var async = [];
      //~ async.push(ObjectAddrData.Objects().then(function(resp){
        //~ $c.dataObjects  = resp.data;
      //~ }));

      async.push($Контрагенты.Load());
      async.push($c.LoadDataAsk());//.then()
      //~ async.push($c.LoadDataSnab());
      
      $c.LoadDataOst();
      //~ $c.LoadDataEasy();
      $c.LoadDataInv();
      
      $q.all(async).then(function(){
        $c.ready = true;
        
        $c.LoadDataSnab();
        $c.LoadDataSpis();
        $c.LoadDataAskDone();
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $c.modal_trigger = trigger;
            },
          });
          
          if (!$c.tab/*$c.data['заявки'].DataLen()*/) $c.SelectTab(undefined, '', 'Заявки ТМЦ');
        });
        
      });
  };
  
  $c.LoadDataAsk = function(){//param

    $c.data['заявки'] = new $Список(appRoutes.url_for('тмц/снаб/список заявок'), $c, $scope);
    return $c.data['заявки'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$заявки) $c.data.$заявки = {};
      $c.data['заявки'].$Data($c.data.$заявки);
    });
  };
  

  /*** убрал
  $c.LoadDataEasy = function(){//param

    $c.data['простые закупки'] = new $Список(appRoutes.url_for('тмц/снаб/список простые закупки'), $c, $scope);
    return $c.data['простые закупки'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$заявки) $c.data.$заявки = {};
      $c.data['простые закупки'].$Data($c.data.$заявки);
    });
    
  };***/
  
  $c.LoadDataSnab = function(){//param
    
    $c.data['снаб'] = new $Список(appRoutes.url_for('тмц/снаб/список поставок'), $c, $scope);
    $c.data['снаб'].OnLoad = function(data){
      //~ console.log('снаб OnLoad', this);
      var ka = $Контрагенты.$Data();
      data.map(function(item){
        if (!item['@грузоотправители/id']) console.log("НЕТ @грузоотправители/id", item);
        item['@грузоотправители'] = (item['@грузоотправители/id'] || []).map(function(kid){ return ka[kid] || {}; });
      });
    };
    return $c.data['снаб'].Load({"объект": $c.param['объект']}).then(function(data){///массив
      if (!$c.data.$снаб) $c.data.$снаб = {};
      $c.data['снаб'].$Data($c.data.$снаб);
    });
    
  };
  
  $c.LoadDataInv = function(){//param
    
    $c.data['инвентаризации'] = new $Список(appRoutes.url_for('тмц/склад/список инвентаризаций'), $c, $scope, $element);
    return $c.data['инвентаризации'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$инвентаризации) $c.data.$инвентаризации = {};
      $c.data['инвентаризации'].$Data($c.data.$инвентаризации);
    });
    
  };
  
  $c.LoadDataSpis = function(){//param
    
    $c.data['списания'] = new $Список(appRoutes.url_for('тмц/список списаний'), $c, $scope, $element);
    return $c.data['списания'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$списания) $c.data.$списания = {};
      $c.data['списания'].$Data($c.data.$списания);
    });
    
  };
  
  

  
  $c.Cancel = function(name){
    if(!$c.param.table[name].ready) return;
    $c.param.table[name].ready = 0;
    $c.LoadData();//$c.param.table
  };
  
  $c.Send = function(name){
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($c.modal_trigger.attr('data-abs'));
      //~ $c.param.table['сумма'].sign = abs;
    //~ }
    $c.param.table[name].ready = 1;
    $c.LoadData();//$c.param.table
    
  };
  
  $c.CloseFormSpis = function(data){
    $scope.paramSpis = undefined;
    
  };

  
};


/*=============================================================*/

module

.component('tmcSnabTabs', {
  controllerAs: '$c',
  templateUrl: "tmc/snab/tabs",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());