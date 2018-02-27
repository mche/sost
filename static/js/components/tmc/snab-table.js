(function () {'use strict';
/*
*/

var moduleName = "ТМЦ снабжение список";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween', 'ТМЦ обработка снабжением']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $rootScope, $q, $timeout, $http, $element, appRoutes, Util, /*TMCSnab, ObjectAddrData, $filter, $sce*/) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $ctrl.tabs = [
    {"title":'Требования',
      "length":function(tab){
        //~ return !item["транспорт/заявки/id"];
        return $ctrl.data.length;
      },
      "liClass": 'orange lighten-3',
      "liStyle":{"margin-right": '1rem'},
      "aClass": 'orange-text text-darken-3 before-orange-darken-3',
    },
    
    {"title":'В работе',
      "length":function(tab){
        //~ return !!item["транспорт/заявки/id"];
        return $ctrl['заявки снаб'].filter(tab.filter).length;
      },
      "filter": function(ask){
        return (!ask['базы/id'] || !ask['базы/id'][1] && !ask['базы/id'][0])  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
      },
      "liClass": 'teal lighten-3',
      "aClass": 'teal-text text-darken-3 before-teal-darken-3',
    },
    {"title":'Завершено',
      "length":function(tab){
        return $ctrl['заявки снаб'].filter(tab.filter).length;
      },
      "filter": function(ask){
        return (!ask['базы/id'] || !ask['базы/id'][1] && !ask['базы/id'][0])  && ask['$позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
      },
      "liClass": 'teal lighten-3',
      "liStyle":{"margin-right": '1rem'},
      "aClass": 'teal-text text-darken-3 before-teal-darken-3',
    },
    
    {"title":'Через базу',
      "length":function(tab){
        return $ctrl['заявки снаб'].filter(tab.filter).length;
      },
      "filter": function(ask){
        return !!ask['базы/id'] && !!(ask['базы/id'][1] || ask['базы/id'][0])  && ask['$позиции тмц'].some(function(tmc){ return !tmc['количество/принято']; });
      },
      "liClass": 'blue lighten-3',
      "aClass": 'blue-text text-darken-3 before-blue-darken-3',
    },
    {"title":'Завершено',
      "length":function(tab){
        return $ctrl['заявки снаб'].filter(tab.filter).length;
      },
      "filter": function(ask){
        return !!ask['базы/id'] && !!(ask['базы/id'][1] || ask['базы/id'][0]) && ask['$позиции тмц'].some(function(tmc){ return !!tmc['количество/принято']; });
      },
      "liClass": 'blue lighten-3',
      "liStyle":{"margin-right": '1rem'},
      "aClass": 'blue-text text-darken-3 before-blue-darken-3',
    },
    
    {"title": 'Остатки',
      "length":function(tab){ return 0;},
      "liClass": 'purple lighten-3',
      //~ "liStyle":{"margin-right": '1rem'},
      "aClass": 'purple-text text-darken-3 before-purple-darken-3',
      
    },
  
  ];
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      $ctrl.tab = $ctrl.tabs[0];
      
      var async = [];
      //~ async.push(ObjectAddrData.Objects().then(function(resp){
        //~ $ctrl.dataObjects  = resp.data;
      //~ }));

      async.push($ctrl.LoadData());//.then()
      
      $q.all(async).then(function(){
        $ctrl.ready = true;
        if(!$ctrl.data.length) $ctrl.tab = $ctrl.tabs[1];
        
        
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
      
      //~ $scope.$on('ТМЦ/снаб сохранена заявка', function(event, ask) {
        //~ console.log('ТМЦ/снаб сохранена заявка', ask);
      //~ });
      /*$scope.$watch(// тоже как и форма следит за редактированием/ждем сохранения
        //~ function(scope) { return $ctrl.param.edit; },
        'param',
        function(newValue, oldValue) {
          console.log("table watch edit newValue", newValue);
          if (newValue && newValue._success_save) {
            console.log("table watch edit newValue", newValue);
          }
        }
      );*/
      
    });
    
  };
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data) $ctrl.data=[];
    if (append === undefined) $ctrl.data.length = 0;
    $ctrl.param.offset=$ctrl.data.length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/снаб/список заявок'), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          //~ console.log("данные два списка: ", resp.data);
          Array.prototype.push.apply($ctrl.data, resp.data.shift());// первый список - позиции тмц(необработанные и обработанные)
          $ctrl['заявки снаб'] = resp.data.shift();//.map(function(ask){ return $ctrl.InitSnabAsk(ask); }) || []; // второй список - обработанные заявки
        }
        
      });
    
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
    /*
    if(!$ctrl.param.edit) {
      $ctrl.param.edit = TMCSnabData.InitAskForm();//{"позиции": []};
      $ctrl.param.edit["позиции"].length=0;
    }
    $ctrl.param.edit._success_save  = false;
    //~ if(it['обработка']) 
    var idx = $ctrl.param.edit['позиции'].indexOf(it);
    //~ console.log("Checked", idx, it);
    if(idx >= 0) $ctrl.param.edit['позиции'].splice(idx, 1);
    else $ctrl.param.edit['позиции'].push(it);
    //~ if(!$ctrl.param.edit["дата отгрузки"]) $ctrl.param.edit["дата отгрузки"]=Util.dateISO(1);
    */
  };
  
  
  //~ $ctrl.InitSnabAsk = function(ask){// обработанные снабжением
    //~ TMCSnab.InitAsk(ask);
    //~ return ask;
  //~ };
  
  //~ $ctrl.ObjectOrAddress = function(adr){
    //~ return TMCSnab.ObjectOrAddress(adr, $ctrl.dataObjects);
  //~ };
  
  $ctrl.EditSnabAsk = function(ask){
    var edit = angular.copy(ask);
    //~ if(!edit['позиции тмц'].length) edit['позиции тмц'].push({});
    
    /*$ctrl.param.edit = undefined;
    $timeout(function(){
      $ctrl.param.edit = edit;
      
    });*/
    $rootScope.$broadcast('Редактировать заявку ТМЦ снабжения', edit);
  };
  
  /*$ctrl.Delete = function(){
    var it = $ctrl.param.delete;
    delete $ctrl.param.delete;
    var idx = $ctrl.data.indexOf(it);
    $ctrl.data.splice(idx, 1);
    //~ delete it['удалить'];
    
    
  };*/
  

  
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