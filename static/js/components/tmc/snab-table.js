(function () {'use strict';
/*
*/

var moduleName = "ТМЦ снабжение список";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween', 'ТМЦ обработка снабжением','ТМЦ текущие остатки',]);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $ctrl.tabs = [
    {"title":'Требования',
      "len":function(tab){
        //~ return !item["транспорт/заявки/id"];
        return $ctrl.data['заявки'].length;
      },
      "liClass": 'orange lighten-3',
      "liStyle":{"margin-right": '1rem'},
      "aClass": 'orange-text text-darken-3 before-orange-darken-3',
      "svgClass":'orange-fill fill-darken-3',
    },
    
    {"title":'В работе',
      "len":function(tab){
        //~ return !!item["транспорт/заявки/id"];
        return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
      },
      "фильтр": function(ask){
        return (!ask['базы/id'] || !ask['базы/id'][1] && !ask['базы/id'][0]) && !ask['транспорт/id']  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
      },
      "liClass": 'teal lighten-3',
      "aClass": 'teal-text text-darken-3 before-teal-darken-3',
      "svgClass":'teal-fill fill-darken-3',
    },
    {"title":'Везут',
      "len":function(tab){
        //~ return !!item["транспорт/заявки/id"];
        return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
      },
      "фильтр": function(ask){
        return (!ask['базы/id'] || !ask['базы/id'][1] && !ask['базы/id'][0]) && !!ask['транспорт/id']  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
      },
      "liClass": 'teal lighten-3',
      "aClass": 'teal-text text-darken-3 before-teal-darken-3',
      "svgClass":'teal-fill fill-darken-3',
    },
    {"title":'Завершено',
      "len":function(tab){
        return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
      },
      "фильтр": function(ask){
        return (!ask['базы/id'] || !ask['базы/id'][1] && !ask['базы/id'][0])  && ask['$позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
      },
      "liClass": 'teal lighten-3',
      "liStyle":{"margin-right": '1rem'},
      "aClass": 'teal-text text-darken-3 before-teal-darken-3',
      "svgClass":'teal-fill fill-darken-3',//'circle teal grey-fill darken-3',
    },
    
    {"title":'Через базу',
      "len":function(tab){
        return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
      },
      "фильтр": function(ask){
        return !!ask['базы/id'] && !!(ask['базы/id'][1] || ask['базы/id'][0])  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
      },
      "liClass": 'blue lighten-3',
      "aClass": 'blue-text text-darken-3 before-blue-darken-3',
      "svgClass":'blue-fill fill-darken-3',
    },
    {"title":'Завершено',
      "len":function(tab){
        return $ctrl.data['снаб'].filter(tab['фильтр'], tab).length;
      },
      "фильтр": function(ask){
        return !!ask['базы/id'] && !!(ask['базы/id'][1] || ask['базы/id'][0]) && ask['$позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
      },
      "liClass": 'blue lighten-3',
      "liStyle":{"margin-right": '1rem'},
      "aClass": 'blue-text text-darken-3 before-blue-darken-3',
      "svgClass":'blue-fill fill-darken-3',//'circle blue grey-fill darken-3',
    },
    
    {"title": 'Остатки',
      "len":function(tab){ return $ctrl.data['остатки'] && $ctrl.data['остатки'].length; },
      "liClass": 'purple lighten-3',
      //~ "liStyle":{"margin-right": '1rem'},
      "aClass": 'purple-text text-darken-3 before-purple-darken-3',
      
    },
  
  ];
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.data = {};
      $ctrl.tab = $ctrl.tabs[0];
      
      var async = [];
      //~ async.push(ObjectAddrData.Objects().then(function(resp){
        //~ $ctrl.dataObjects  = resp.data;
      //~ }));

      async.push($ctrl.LoadData());//.then()
      $ctrl.LoadDataOst();
      
      $q.all(async).then(function(){
        $ctrl.ready = true;
        if(!$ctrl.data['заявки'].length) $ctrl.tab = $ctrl.tabs[1];
        
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
          
          //~ $('ul.tabs', $($element[0])).tabs({"indicatorClass":'orange',});
          $ctrl.tabsReady = true;
        });
        
      });
      
    });
    
  };
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data['заявки']) $ctrl.data['заявки']=[];
    if (append === undefined) $ctrl.data['заявки'].length = 0;
    
    if (!$ctrl.data['снаб']) $ctrl.data['снаб']=[];
    if (append === undefined) $ctrl.data['снаб'].length = 0;
    
    $ctrl.param.offset=$ctrl.data['заявки'].length;
    
    //~ if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    //~ $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/снаб/список заявок'), $ctrl.param/*, {"timeout": $ctrl.cancelerHttp.promise}*/) //'список движения ДС'
      .then(function(resp){
        //~ $ctrl.cancelerHttp.resolve();
        //~ delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          //~ console.log("данные два списка: ", resp.data);
          Array.prototype.push.apply($ctrl.data['заявки'], resp.data.shift());// первый список - позиции тмц(необработанные и обработанные)
          Array.prototype.push.apply($ctrl.data['снаб'], resp.data.shift());// второй - обраб снаб
          
          //~ $ctrl.data['снаб'] = resp.data.shift();//.map(function(ask){ return $ctrl.InitSnabAsk(ask); }) || []; // второй список - обработанные заявки
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
  
  $ctrl.SelectTab = function(idx){
    idx = idx || 0;
    $ctrl.tab = undefined;
    $timeout(function(){
      $ctrl.tab = $ctrl.tabs[idx];
    });
    
  };
  
  $ctrl.TabAClass = function(tab) {
    var c = tab.aClass || '';
    if(tab === $ctrl.tab) c += ' active bold';
    return c;
    
  }
  
  //~ $ctrl.FilterSnab = function(ask){
    //~ var filter = $ctrl.tab.filter;
    //~ if(!filter) return true;
    //~ return filter(ask);
    
  //~ };
  
  $ctrl.InitRow = function(it){//необработанные позиции тмц
    if(it['$дата1'] && angular.isString(it['$дата1'])) it['$дата1'] = JSON.parse(it['$дата1']);
    
  };
  
  /**** постановка/снятие позиции в обработку ****/
  $ctrl.Checked = function(it, bLabel){// bLabel boolean click label
    if(bLabel) it['обработка'] = !it['обработка'];
    $rootScope.$broadcast('Добавить/убрать позицию ТМЦ в заявку снабжения', it);
  };
  
  
  
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