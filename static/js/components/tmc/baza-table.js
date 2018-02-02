(function () {'use strict';
/*
*/

var moduleName = "TMCBazaTable";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['AppTplCache', 'Util', 'appRoutes', 'DateBetween', 'Объект или адрес']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, /*$rootScope,*/ $q, $timeout, $http, $element, appRoutes, Util, ObjectAddrData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  //~ $scope.$sce = $sce;
  $ctrl.tabs = [
    {"title":'Новые', "length":function(tab){
        return $ctrl.data['заявки'].length;
      },
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
  
  $ctrl.$onInit = function(){
    $timeout(function(){
      $ctrl.data = {};
      if(!$ctrl.param.table) $ctrl.param.table={"дата1":{"values":[]}, "контрагент":{}};// фильтры
      $scope.param = $ctrl.param;
      //~ $ctrl.tab = $ctrl.tabs[0];
      
        
        
      $ctrl.LoadData().then(function(){
        //~ $ctrl.tabsReady = true;
        $ctrl.ready = true;
        
        $timeout(function(){
          $('.modal', $($element[0])).modal({
            endingTop: '0%',
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
              $ctrl.modal_trigger = trigger;
            },
          });
          
          
          if($ctrl.data['заявки'].length) $ctrl.tab = $ctrl.tabs[0];
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

    if (!$ctrl.data['заявки']) $ctrl.data['заявки']=[];
    if (append === undefined) $ctrl.data['заявки'].length = 0;
    $ctrl.param.offset=$ctrl.data['заявки'].length;
    
    if ($ctrl.cancelerHttp) $ctrl.cancelerHttp.resolve();
    $ctrl.cancelerHttp = $q.defer();
    
    return $http.post(appRoutes.url_for('тмц/база/заявки', $ctrl.param['объект'].id), $ctrl.param, {"timeout": $ctrl.cancelerHttp.promise}) //'список движения ДС'
      .then(function(resp){
        $ctrl.cancelerHttp.resolve();
        delete $ctrl.cancelerHttp;
        if(resp.data.error) $scope.error = resp.data.error;
        else {
          Array.prototype.push.apply($ctrl.data['заявки'], resp.data);//
          //~ $ctrl = resp.data.shift().map(function(ask){ return $ctrl.InitAsk(ask); }) || []; //
          
        }
        
      });
    
  };
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