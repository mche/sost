(function () {'use strict';
/*
  табы
*/

var moduleName = "ТМЦ на объектах/табы";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween', /*'Объект или адрес', 'TMCSnab',*/
  'ТМЦ форма заявки', 'ТМЦ форма перемещения', 'ТМЦ список заявок', 'ТМЦ таблица',  'ТМЦ текущие остатки',
  'Контрагенты', 'TMCTabsLib',
]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, $Контрагенты, $TMCTabsLib, $Список /*Util,*/  /*, AutoJSON*/ /*TMCSnab,ObjectAddrData*/) {//TMCAskTableData
  var $c = this;
  $scope.parseFloat = parseFloat;
  
  $c.tabs = [
    {// строка
      "title": '',
      "childs":[
        {
          "title":'Заявки ТМЦ',
          "data": 'заявки',
          "фильтр": function(it){ return !it['номенклатура/id'] && /*it['количество']>((it['тмц/количество'] || 0)+(it['простая поставка/количество'] || 0))*/ !it['простая поставка/количество']; /*!it['@тмц/строки простой поставки'] || !it['@тмц/строки простой поставки'].length;*/ },
          "liClass": 'orange lighten-4',
          //~ "tbodyClass": 'orange lighten-5',
          "aClass": 'orange-text text-darken-4 ',
          "aClassActive": ' before-orange-darken-4',
          "svgClass":'orange-fill fill-darken-4',
          //~ "liStyle":{"margin-right": '1rem'},
        },
        
        {
          "title": 'В обработке',
          "data": 'заявки',
          "descr": 'с номенклатурой',
          "фильтр": function(it){ return !!it['номенклатура/id'] && !it['простая поставка/количество']; },
          "liClass": 'orange lighten-4',
          //~ "tbodyClass": 'orange lighten-5',
          "aClass": 'orange-text text-darken-4 ',
          "aClassActive": ' before-orange-darken-4',
          "svgClass": ' rotate90right orange-fill fill-darken-4',
        },
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
            return !ask['с объекта/id'];/// || !!ask['на объект/id'];
          },
          "liClass": 'green  lighten-3',
          "aClass": 'green-text text-darken-4 ',
          "aClassActive": ' before-green-darken-4',
          "svgClass":'green-fill fill-darken-4',
        },
        
        {//tab
          "title": 'Перемещения',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['с объекта/id'];/// && !ask['на объект/id'];
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
      /*    {
          "title":'Простые закупки',
          "data": 'простые закупки',
          "фильтр": function(it){ return it['простая поставка/количество'];},///!!it['@тмц/строки простой поставки'] && !!it['@тмц/строки простой поставки'].length;
          "liClass": 'maroon lighten-4',
          "tbodyClass": 'maroon lighten-5',
          "aClass": 'maroon-text text-darken-3 ',
          "aClassActive": ' before-maroon-darken-3',
          ///"svgClass":'maroon-fill fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
        },*/
        
        /*{
          "title":'Инвентаризации',
          "data": 'инвентаризации',
          "фильтр": function(it){ return true; },
          "liClass": 'blue lighten-3',
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',
        },*/
        
        {//таб
          "title": 'Наличие ТМЦ',
          "descr": 'текущие остатки',
          "data": 'остатки',
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
    
  ];
  
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
        $c.LoadDataAskDone();
        
      });
      
        $c.ready = true;
        
        $timeout(function(){
          
          $c.SelectTab(undefined, '', 'Наличие ТМЦ');
          
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