(function () {'use strict';
/*
*/

var moduleName = "TMCBazaTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween', /*'Объект или адрес', 'TMCSnab',*/ 'ТМЦ обработка снабжением']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, /*$rootScope,*/ $q, $timeout, $http, $element, appRoutes, Util, /*TMCSnab,ObjectAddrData*/) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $ctrl.tabs = [
    {"title":'Новые', "length":function(tab){
        return $ctrl.data['заявки снаб'].length;
      },
      "filter": function(ask){ return !ask["количество/принято"]; },
      "li_class": 'teal lighten-2',
    },
    {"title":'Пришло',  "length000":function(){
      },
      "li_class": 'green lighten-2',
      "a_class": 'green-text text-darken-4',
    },
    {"title":'Ушло', "length000":function(tab){
      },
      "filter": function(ask){
        //~ return !!ask['базы'] && !!ask['базы'][0];
      },
      "li_class": 'orange lighten-2',
      "a_class": 'orange-text text-darken-4',
    },
    {"title":'Остатки', "length000":function(tab){
      },
      "filter": function(ask){
        //~ return !!ask['базы'] && !!ask['базы'][0];
      },
      "li_class": '',
      "a_class": 'black-text',
    },
  ];
    
  $scope.$on('ТМЦ/крыжик позиций/событие', function(event, pos){// позиция тмц
    //~ console.log('ТМЦ/крыжик позиций/событие', angular.copy(pos));    
    $http.post(appRoutes.url_for('тмц/сохранить поступление'), pos/*, {timeout: $ctrl.cancelerHttp.promise}*/)
      .then(function(resp){
        /*$ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;*/
        if(resp.data.error) {
          $ctrl.error = resp.data.error;
          Materialize.toast(resp.data.error, 2000, 'red');
          pos['крыжик количества'] = !pos['крыжик количества'];
        }
        else if(resp.data.success) {
          Materialize.toast('Сохранено успешно', 1000, 'green');
          Object.keys(resp.data.success).map(function(key){ pos[key]=resp.data.success[key]; });
          pos['$дата1'] = JSON.parse(pos['$дата1']);
          pos['$дата/принято'] = JSON.parse(pos['$дата/принято'] || '{}');
        }
        console.log("Сохранил", resp.data);
      });
  });
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      $ctrl.data = {};
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      //~ $ctrl.tab = $ctrl.tabs[0];
      
      
      var async = [];
      //~ async.push(ObjectAddrData.Objects().then(function(resp){
        //~ $ctrl.dataObjects  = resp.data;
        
      //~ }));

      async.push($ctrl.LoadData());//.then()
      
        
      $q.all(async).then(function(){
        //~ $ctrl.tabsReady = true;
        $ctrl.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
          
          
          if($ctrl.data['заявки снаб'].length) $ctrl.tab = $ctrl.tabs[0];
          else $ctrl.tab = $ctrl.tabs[1];
          $timeout(function(){
            $('ul.tabs', $($element[0])).tabs({"indicatorClass":'red',});
          });
          
          
        });
        
        
      });
        
        
        
    });
    
  };
  
  $ctrl.TabAClass = function(tab){
    var c = tab.a_class  || '';
    if (tab === $ctrl.tab) c += ' active bold ';
    return c;
    
  };
  
  $ctrl.LoadData = function(append){//param

    if (!$ctrl.data['заявки снаб']) $ctrl.data['заявки снаб']=[];
    if (append === undefined) $ctrl.data['заявки снаб'].length = 0;
    $ctrl.param.offset=$ctrl.data['заявки снаб'].length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/база/заявки', $ctrl.param['объект'].id), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          Array.prototype.push.apply($ctrl.data['заявки снаб'], resp.data);//
          //~ $ctrl = resp.data.shift().map(function(ask){ return $ctrl.InitAsk(ask); }) || []; //
          
        }
        
      });
    
  };
  
  //~ $ctrl.FilterSnab = function(ask){
    //~ var tab = $ctrl.tab;
    //~ if(!tab) return !1;
    //~ var filter = tab.filter;
    //~ if(!filter) return !1;
    //~ return filter(ask);
    
  //~ };
  
  //~ $ctrl.InitSnabAsk = function(ask){// обработанные снабжением
    //~ TMCSnab.InitAsk(ask);
    //~ return ask;
  //~ };
  
  //~ $ctrl.ObjectOrAddress = function(adr){
    //~ return TMCSnab.ObjectOrAddress(adr, $ctrl.dataObjects);
  //~ };
  
  //~ $ctrl.KolCheck = function(row){//строка ТМЦ
    //~ console.log("KolCheck", row);
    
  //~ };
  
  //~ $ctrl.Save = function(ask){
    
    
  //~ };
  
  
};
/*=============================================================*/

module

.component('tmcBazaTable', {
  templateUrl: "tmc/baza/table",
  //~ scope: {},
  bindings: {
    param: '<',

  },
  controller: Component
})

;

}());