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
          "len-000":function(tab){ return $ctrl.data['остатки'] && $ctrl.data['остатки'].length; },
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
    
  new $TMCTabsLib($ctrl, $scope, $element);
  
  $scope.$on('Сохранено/простая поставка ТМЦ', function(event, save){
    /***var ask = $ctrl.data.$заявки[save.id];
    Object.keys(save).map(function(key){ ask[key] = save[key]; });
    ask._hide = true;
    $timeout(function(){ ask._hide = undefined; });
    ***/
    $ctrl.LoadDataAsk().then();
  });
  
  $ctrl.$onInit = function(){
    //~ $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.data = {};
      //~ $ctrl.tab = $ctrl.tabs[0];
      
      var async = [];
      //~ async.push(ObjectAddrData.Objects().then(function(resp){
        //~ $ctrl.dataObjects  = resp.data;
      //~ }));

      async.push($Контрагенты.Load());
      async.push($ctrl.LoadDataAsk());//.then()
      //~ async.push($ctrl.LoadDataSnab());
      
      $ctrl.LoadDataOst();
      $ctrl.LoadDataEasy();
      $ctrl.LoadDataInv();
      
      $q.all(async).then(function(){
        $ctrl.ready = true;
        
        $ctrl.LoadDataSnab();
        
        
          $timeout(function(){
            $('.modal', $($element[0])).modal({
              endingTop: '0%',
              ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                $ctrl.modal_trigger = trigger;
              },
            });
            
            if ($ctrl.data['заявки'].DataLen()) $ctrl.SelectTab(undefined, '', 'Заявки ТМЦ');
          });
        
      });
  };
  
  $ctrl.LoadDataAsk = function(){//param

    //~ if (!$ctrl.data['заявки']) $ctrl.data['заявки']=[];
    //~ if (!$ctrl.data['простые закупки']) $ctrl.data['простые закупки'] = [];
    //~ if (append === undefined) {
      //~ $ctrl.data['заявки'].length = 0;
      //~ $ctrl.data['простые закупки'].length = 0;
    //~ }
    
    $ctrl.data['заявки'] = new $Список(appRoutes.url_for('тмц/снаб/список заявок'), $ctrl, $scope);
    return $ctrl.data['заявки'].Load({"объект": $ctrl.param['объект']}).then(function(){
      if (!$ctrl.data.$заявки) $ctrl.data.$заявки = {};
      $ctrl.data['заявки'].$Data($ctrl.data.$заявки);
    });
    
    
  };
  
  $ctrl.LoadDataEasy = function(){//param

    //~ if (!$ctrl.data['простые закупки']) $ctrl.data['простые закупки'] = [];
    //~ if (append === undefined) {
      //~ $ctrl.data['простые закупки'].splice(0, $ctrl.data['простые закупки'].length);
    //~ }
    
    $ctrl.data['простые закупки'] = new $Список(appRoutes.url_for('тмц/снаб/список простые закупки'), $ctrl, $scope);
    return $ctrl.data['простые закупки'].Load({"объект": $ctrl.param['объект']}).then(function(){
      if (!$ctrl.data.$заявки) $ctrl.data.$заявки = {};
      $ctrl.data['простые закупки'].$Data($ctrl.data.$заявки);
    });
    
  };
  
  $ctrl.LoadDataSnab = function(){//param
    
    /*if (!$ctrl.data['снаб']) $ctrl.data['снаб']=[];
    if (append === undefined) $ctrl.data['снаб'].length = 0;
    */
    
    $ctrl.data['снаб'] = new $Список(appRoutes.url_for('тмц/снаб/список поставок'), $ctrl, $scope);
    $ctrl.data['снаб'].OnLoad = function(data){
      //~ console.log('снаб OnLoad', this);
      var ka = $Контрагенты.$Data();
      data.map(function(item){
        item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
      });
    };
    return $ctrl.data['снаб'].Load({"объект": $ctrl.param['объект']}).then(function(data){///массив
      if (!$ctrl.data.$снаб) $ctrl.data.$снаб = {};
      $ctrl.data['снаб'].$Data($ctrl.data.$снаб);
    });
    
    //~ $ctrl.param.offset=$ctrl.data['заявки'].length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    
    
    
    /*return $http.post(appRoutes.url_for('тмц/снаб/список поставок'), $ctrl.param) // {"timeout": $ctrl.cancelerHttp.promise}
      .then(function(resp){
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          Array.prototype.push.apply($ctrl.data['снаб'], resp.data);// второй - обраб снаб
          var ka = $Контрагенты.$Data();
          $ctrl.data.$снаб = $ctrl.data['снаб'].reduce(function(result, item, index, array) {
            item['@грузоотправители'] = item['@грузоотправители/id'].map(function(kid){ return ka[kid] || {}; });
            result[item.id] = item;
            return result;
            
          }, {});
        }
        
      });*/
    
  };
  
  $ctrl.LoadDataInv = function(){//param
    
    $ctrl.data['инвентаризации'] = new $Список(appRoutes.url_for('тмц/склад/список инвентаризаций'), $ctrl, $scope, $element);
    return $ctrl.data['инвентаризации'].Load({"объект": $ctrl.param['объект']}).then(function(){
      if (!$ctrl.data.$инвентаризации) $ctrl.data.$инвентаризации = {};
      $ctrl.data['инвентаризации'].$Data($ctrl.data.$инвентаризации);
    });
    
  };
  

  


  
  //~ $ctrl.FilterSnab = function(ask){
    //~ var filter = $ctrl.tab.filter;
    //~ if(!filter) return true;
    //~ return filter(ask);
    
  //~ };
  
  /***$ctrl.OrderByData = function(item){// для необработанных заявок
    return item['дата1']+'/'+item.id;
  };***/
  
  $ctrl.SnabFormParam = function(key, val){/// строка если перемещение
    var param = angular.copy($ctrl.param);
    param[key] = val;
    return param;
  };
  
  $ctrl.EditSnabAsk = function(ask){
    if (ask['транспорт/id']) return;// не редактировать после траспортного отдела
    var edit = angular.copy(ask);
    edit['перемещение'] = !!ask['$с объекта'];
    var param = {'объект': $ctrl.param['объект'], 'перемещение': !!ask['$с объекта']};
    $rootScope.$broadcast('Редактировать заявку ТМЦ снабжения', edit, param);
  };
  
  

  
  $ctrl.Cancel = function(name){
    if(!$ctrl.param.table[name].ready) return;
    $ctrl.param.table[name].ready = 0;
    $ctrl.LoadData();//$ctrl.param.table
  };
  
  $ctrl.Send = function(name){
    //~ if (name == 'сумма') {
      //~ var abs = parseInt($ctrl.modal_trigger.attr('data-abs'));
      //~ $ctrl.param.table['сумма'].sign = abs;
    //~ }
    $ctrl.param.table[name].ready = 1;
    $ctrl.LoadData();//$ctrl.param.table
    
  };

  
};


/*=============================================================*/

module

.component('tmcSnabTabs', {
  templateUrl: "tmc/snab/tabs",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());