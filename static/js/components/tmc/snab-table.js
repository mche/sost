(function () {'use strict';
/*
*/

var moduleName = "ТМЦ снабжение список";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween',
   'ТМЦ список заявок',
  'ТМЦ обработка снабжением','ТМЦ текущие остатки', ]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
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
          "фильтр": function(it){ return !it['@тмц/строки простой поставки'] || !it['@тмц/строки простой поставки'].length; },
          "liClass": 'orange lighten-3',
          "tbodyClass": 'orange lighten-5',
          "aClass": 'orange-text text-darken-3 ',
          "aClassActive": ' before-orange-darken-3',
          "svgClass":'orange-fill fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
        },
        
        {
          "title":'Простые поставки',
          "len":function(tab){
            //~ return !item["транспорт/заявки/id"];
            return $ctrl.data['заявки'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(it){ return !!it['@тмц/строки простой поставки'] && !!it['@тмц/строки простой поставки'].length; },
          "liClass": 'maroon lighten-4',
          "tbodyClass": 'maroon lighten-5',
          "aClass": 'maroon-text text-darken-3 ',
          "aClassActive": ' before-maroon-darken-3',
          "svgClass":'maroon- fill-darken-3',
          //~ "liStyle":{"margin-right": '1rem'},
        },
        
        {//таб
          "title": 'Остатки ТМЦ',
          "len":function(tab){ return $ctrl.data['остатки'] && $ctrl.data['остатки'].length; },
          "liClass": 'purple lighten-4',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'purple-text text-darken-3 ',
          "aClassActive": ' before-purple-darken-3',
        },
      
      ],
      "liClass": '',//orange lighten-3
    },
    
    {// строка
      "title":'Закупка',
      "childs": [
        {// tab
          "title": 'все',
          "len":function(tab){
            //~ return !!item["транспорт/заявки/id"];
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
          "len":function(tab){
            //~ return !!item["транспорт/заявки/id"];
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
          "len":function(tab){
            //~ return !!item["транспорт/заявки/id"];
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(ask){
            return !(ask['с объекта/id'] || ask['на объект/id']) && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
          },
          "liClass": 'teal lighten-3',
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          "svgClass":'teal-fill fill-darken-3',
        },
        {//tab
          "title":'завершено',
          "len":function(tab){
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(ask){
            return  !(ask['с объекта/id'] || ask['на объект/id']) && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['$позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
          },
          "liClass": 'teal lighten-3',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'teal-text text-darken-3 ',
          "aClassActive": ' before-teal-darken-3',
          "svgClass":'teal-fill fill-darken-3',//'circle teal grey-fill darken-3',
        },
      
      ],
      
      "liClass": 'teal lighten-3 teal-text text-darken-3',
      "svgClass":'teal-fill fill-darken-3',
    },
    
    
    {// строка
      "title":'Через базу',
      "childs": [
        {//tab
          "title": 'все',
          "len":function(tab){
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
          "len":function(tab){
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
          "len":function(tab){
            //~ return !!item["транспорт/заявки/id"];
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(ask){
            return !!ask['на объект/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
          },
          "liClass": 'blue lighten-3',
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',
        },
        {//таб
          "title":'завершено',
          "len":function(tab){
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(ask){
            return !!ask['на объект/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['$позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
          },
          "liClass": 'blue lighten-3',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'blue-text text-darken-3 ',
          "aClassActive": ' before-blue-darken-3',
          "svgClass":'blue-fill fill-darken-3',//'circle blue grey-fill darken-3',
        },
      
      ],
      "liClass": 'blue lighten-3 blue-text text-darken-3',
      "svgClass":'blue-fill fill-darken-3',
    },
    
    {// строка
      "title":'Перемещение',
      "childs": [
        {//tab
          "title": 'все',
          "len":function(tab){
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
          "len":function(tab){
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
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
          "len":function(tab){
            //~ return !!item["транспорт/заявки/id"];
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(ask){
            return !!ask['с объекта/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта'])  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
          },
          "liClass": 'red lighten-3',
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3 ',
          "svgClass":'red-fill fill-darken-3',
        },
        {//таб
          "title":'завершено',
          "len":function(tab){
            return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
          },
          "фильтр": function(ask){
            return !!ask['с объекта/id'] && (!!ask['транспорт/id'] || !!ask['без транспорта']) && ask['$позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
          },
          "liClass": 'red lighten-3',
          //~ "liStyle":{"margin-right": '1rem'},
          "aClass": 'red-text text-darken-3 ',
          "aClassActive": ' before-red-darken-3 ',
          "svgClass":'red-fill fill-darken-3',//'circle blue grey-fill darken-3',
        },
      
      ],
      "liClass": 'red lighten-3 red-text text-darken-3',
      "svgClass":' red-fill fill-darken-3',
    },
  ];
  
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

      async.push($ctrl.LoadDataAsk());//.then()
      async.push($ctrl.LoadDataSnab());
      $ctrl.LoadDataOst();
      
      $q.all(async).then(function(){
        $ctrl.ready = true;
        //~ if(!$ctrl.data['заявки'].length) $ctrl.tab = $ctrl.tabs[1];
        
        
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
        
      });
      
      $scope.$on('Сохранено поставка/перемещение ТМЦ', function(event, save){
        if ($ctrl.data['_снаб'][save.id]) Object.keys(save).map(function(key){ $ctrl.data['_снаб'][save.id][key] = save[key]; });
        else {
          $ctrl.data['снаб'].unshift(save);
          $ctrl.data['_снаб'][save.id] = save;
        }
        var tab = $ctrl.tab;
        $ctrl.tab = undefined;
        $ctrl.LoadDataAsk().then(function(){
          $ctrl.tab = tab;
        });
        //~ $timeout(function(){
          
        //~ });
        
      });
      
      $scope.$on('Сохранено/простая поставка ТМЦ', function(event, save){
        var ask = $ctrl.data['_заявки'][save.id];
        Object.keys(save).map(function(key){ ask[key] = save[key]; });
        ask._hide = true;
        $timeout(function(){ ask._hide = undefined ;});
      });
      
    
  };
  
  $ctrl.LoadDataAsk = function(append){//param

    if (!$ctrl.data['заявки']) $ctrl.data['заявки']=[];
    if (append === undefined) $ctrl.data['заявки'].length = 0;
    
    //~ $ctrl.param.offset=$ctrl.data['заявки'].length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/снаб/список заявок'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          //~ console.log("данные два списка: ", resp.data);
          Array.prototype.push.apply($ctrl.data['заявки'], resp.data);// первый список - позиции тмц(необработанные и обработанные)
          $ctrl.data['_заявки'] = $ctrl.data['заявки'].reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        }
        
      });
    
  };
  
  $ctrl.LoadDataSnab = function(append){//param
    
    if (!$ctrl.data['снаб']) $ctrl.data['снаб']=[];
    if (append === undefined) $ctrl.data['снаб'].length = 0;
    
    //~ $ctrl.param.offset=$ctrl.data['заявки'].length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/снаб/список поставок'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          Array.prototype.push.apply($ctrl.data['снаб'], resp.data);// второй - обраб снаб
          $ctrl.data['_снаб'] = $ctrl.data['снаб'].reduce(function(result, item, index, array) {  result[item.id] = item; return result; }, {});
        }
        
      });
    
  };
  
  /*** остатки **/
  $ctrl.LoadDataOst = function(append){

    if (!$ctrl.data['остатки']) $ctrl.data['остатки']=[];
    if (append === undefined) $ctrl.data['остатки'].length = 0;
    
    //~ return $http.post(appRoutes.url_for('тмц/текущие остатки'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      //~ .then(function(resp){
        //~ if(resp.data.error) $scope.error = resp.data.error;
        //~ else {
          //~ Array.prototype.push.apply($ctrl.data['остатки'], resp.data);//
        //~ }
      //~ });
    
  };
  
  $ctrl.OrderByTab1 = function(tab, idx){
    if (!$ctrl.tab) return idx;
    if (tab.childs.some(function(t2){ return t2 === $ctrl.tab; })) return idx;
    else return 1000;
  };
  
  $ctrl.SelectTab = function(tab, n1, n2){
    if (!tab) tab = $ctrl.tabs.map(function(t1){ return t1.title == n1 && t1.childs.filter(function(t2){ t2._parent=t1; return t2.title == n2;}).pop(); }).filter(function(t){ return !!t; }).pop();
    
    $ctrl.tab = undefined;
    $timeout(function(){
      $ctrl.tab = tab;
    });
    
  };
  $ctrl.TabLiClass = function(tab) {
    var c = tab.liClass || '';
    if(tab === $ctrl.tab) c += ' active';
    return c;
  }
  $ctrl.TabAClass = function(tab) {
    var c = tab.aClass || '';
    if(tab === $ctrl.tab) c += ' active bold '+(tab.aClassActive || '');
    return c;
  }
  
  //~ $ctrl.FilterSnab = function(ask){
    //~ var filter = $ctrl.tab.filter;
    //~ if(!filter) return true;
    //~ return filter(ask);
    
  //~ };
  
  /***$ctrl.OrderByData = function(item){// для необработанных заявок
    return item['дата1']+'/'+item.id;
  };***/
  
  
  $ctrl.EditSnabAsk = function(ask){
    if (ask['транспорт/id']) return;// не редактировать после траспортного отдела
    var edit = angular.copy(ask);
    $rootScope.$broadcast('Редактировать заявку ТМЦ снабжения', edit);
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

.component('tmcSnabTable', {
  templateUrl: "tmc/snab/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());