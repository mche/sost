(function () {'use strict';
/*
  табы
*/

var moduleName = "ТМЦ снабжение списки";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'appRoutes', 'DateBetween',
   'ТМЦ список заявок',
  'ТМЦ обработка снабжением','ТМЦ текущие остатки', 'Контрагенты', 'TMCTabsLib', 'ТМЦ список инвентаризаций', 'ТМЦ форма инвентаризации',]);//'ngSanitize',, 'dndLists'

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
            return !(ask['с объекта/id'] || ask['на объект/id']);
          },
          "liClass": 'teal lighten-3',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          "svgClass":'teal-fill fill-darken-3',
        },
        
        {//tab
          "title": 'Перемещения',
          "data": 'снаб',
          "фильтр": function(ask){
            return !!ask['с объекта/id'];
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
        {
          "title":'Простые закупки',
          "data": 'простые закупки',
          "фильтр": function(it){ return it['простая поставка/количество']; /*!!it['@тмц/строки простой поставки'] && !!it['@тмц/строки простой поставки'].length;*/ },
          "liClass": 'maroon lighten-4',
          "tbodyClass": 'maroon lighten-5',
          "aClass": 'maroon-text text-darken-3 ',
          "aClassActive": ' before-maroon-darken-3',
          ///"svgClass":'maroon-fill fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
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
          "title": 'Остатки ТМЦ',
          "len-000":function(tab){ return $c.data['остатки'] && $c.data['остатки'].length; },
          "liClass": 'purple lighten-4',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'purple-text text-darken-3 ',
          "aClassActive": ' before-purple-darken-3',
          "svgClass":'purple-fill fill-darken-3',
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
          "liClass": 'teal lighten-3',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          "svgClass":'teal-fill fill-darken-3',
        },
        {// tab
          "title": 'в работе',
          "data": 'снаб',
          "фильтр": function(ask){
            return !(ask['с объекта/id'] || ask['на объект/id']) && (!ask['транспорт/id'] && !ask['без транспорта']);// без транспорта
          },
          "liClass": 'teal lighten-3',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          "svgClass":'teal-fill fill-darken-3',
        },
        {// tab
          "title": 'в перевозке',
          "data": 'снаб',
          "фильтр": function(ask){
            return !(ask['с объекта/id'] || ask['на объект/id']) && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['@позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
          },
          "liClass": 'teal lighten-3',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          "svgClass":'teal-fill fill-darken-3',
        },
        {//tab
          "title":'завершено',
          "data": 'снаб',
          "фильтр": function(ask){
            return  !(ask['с объекта/id'] || ask['на объект/id']) && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['@позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
          },
          "liClass": 'teal lighten-3',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          "svgClass":'teal-fill fill-darken-3',//'circle teal grey-fill darken-3',
        },
      
      ],
      
      "liClass": ' teal-text text-darken-3 fw500 ',
      "svgClass":'teal-fill fill-darken-3',
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
      $c.LoadDataEasy();
      $c.LoadDataInv();
      
      $q.all(async).then(function(){
        $c.ready = true;
        
        $c.LoadDataSnab();
        
        
          $timeout(function(){
            $('.modal', $($element[0])).modal({
              endingTop: '0%',
              ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                $c.modal_trigger = trigger;
              },
            });
            
            if ($c.data['заявки'].DataLen()) $c.SelectTab(undefined, '', 'Заявки ТМЦ');
          });
        
      });
  };
  
  $c.LoadDataAsk = function(){//param

    //~ if (!$c.data['заявки']) $c.data['заявки']=[];
    //~ if (!$c.data['простые закупки']) $c.data['простые закупки'] = [];
    //~ if (append === undefined) {
      //~ $c.data['заявки'].length = 0;
      //~ $c.data['простые закупки'].length = 0;
    //~ }
    
    $c.data['заявки'] = new $Список(appRoutes.url_for('тмц/снаб/список заявок'), $c, $scope);
    return $c.data['заявки'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$заявки) $c.data.$заявки = {};
      $c.data['заявки'].$Data($c.data.$заявки);
    });
    
    
  };
  
  $c.LoadDataEasy = function(){//param

    //~ if (!$c.data['простые закупки']) $c.data['простые закупки'] = [];
    //~ if (append === undefined) {
      //~ $c.data['простые закупки'].splice(0, $c.data['простые закупки'].length);
    //~ }
    
    $c.data['простые закупки'] = new $Список(appRoutes.url_for('тмц/снаб/список простые закупки'), $c, $scope);
    return $c.data['простые закупки'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$заявки) $c.data.$заявки = {};
      $c.data['простые закупки'].$Data($c.data.$заявки);
    });
    
  };
  
  $c.LoadDataSnab = function(){//param
    
    /*if (!$c.data['снаб']) $c.data['снаб']=[];
    if (append === undefined) $c.data['снаб'].length = 0;
    */
    
    $c.data['снаб'] = new $Список(appRoutes.url_for('тмц/снаб/список поставок'), $c, $scope);
    $c.data['снаб'].OnLoad = function(data){
      //~ console.log('снаб OnLoad', this);
      var ka = $Контрагенты.$Data();
      data.map(function(item){
        item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
      });
    };
    return $c.data['снаб'].Load({"объект": $c.param['объект']}).then(function(data){///массив
      if (!$c.data.$снаб) $c.data.$снаб = {};
      $c.data['снаб'].$Data($c.data.$снаб);
    });
    
    //~ $c.param.offset=$c.data['заявки'].length;
    
    //~ if ($c.cancelerHttp) $c.cancelerHttp.resolve();
    //~ $c.cancelerHttp = $q.defer();
    
    
    
    /*return $http.post(appRoutes.url_for('тмц/снаб/список поставок'), $c.param) // {"timeout": $c.cancelerHttp.promise}
      .then(function(resp){
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          Array.prototype.push.apply($c.data['снаб'], resp.data);// второй - обраб снаб
          var ka = $Контрагенты.$Data();
          $c.data.$снаб = $c.data['снаб'].reduce(function(result, item, index, array) {
            item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
            result[item.id] = item;
            return result;
            
          }, {});
        }
        
      });*/
    
  };
  
  $c.LoadDataInv = function(){//param
    
    $c.data['инвентаризации'] = new $Список(appRoutes.url_for('тмц/склад/список инвентаризаций'), $c, $scope, $element);
    return $c.data['инвентаризации'].Load({"объект": $c.param['объект']}).then(function(){
      if (!$c.data.$инвентаризации) $c.data.$инвентаризации = {};
      $c.data['инвентаризации'].$Data($c.data.$инвентаризации);
    });
    
  };
  

  


  
  //~ $c.FilterSnab = function(ask){
    //~ var filter = $c.tab.filter;
    //~ if(!filter) return true;
    //~ return filter(ask);
    
  //~ };
  
  /***$c.OrderByData = function(item){// для необработанных заявок
    return item['дата1']+'/'+item.id;
  };***/
  
  $c.SnabFormParam = function(key, val){/// строка если перемещение
    var param = angular.copy($c.param);
    param[key] = val;
    return param;
  };
  
  $c.EditSnabAsk = function(ask){
    if (ask['транспорт/id']) return;// не редактировать после траспортного отдела
    var edit = angular.copy(ask);
    edit['перемещение'] = !!ask['$с объекта'];
    var param = {'объект': $c.param['объект'], 'перемещение': !!ask['$с объекта']};
    $rootScope.$broadcast('Редактировать заявку ТМЦ снабжения', edit, param);
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