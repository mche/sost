(function () {'use strict';
/*
  
*/

var moduleName = "ТМЦ обработка снабжением";
try {angular.module(moduleName); return;} catch(e) { } 
var module = angular.module(moduleName, ['Util', 'Объект или адрес', 'ТМЦ таблица позиций']);//'ngSanitize',, 'dndLists'

var Component = function  ($scope, $attrs, /*$rootScope, $q,*/ $timeout, /*$http, $element, appRoutes,*/ Util, ObjectAddrData) {
  var $ctrl = this;
  $scope.parseFloat = parseFloat;
  $scope.Util = Util;
  $scope.$attr = $attrs;
  
  $ctrl.$onInit = function(){
    
    if(!$ctrl.param) $ctrl.param = {};
    //~ if(!$ctrl.param['фильтр тмц']) $ctrl.param['фильтр тмц'] = function(){ return !0;};
    
    ObjectAddrData.Objects().then(function(resp){
        $ctrl.objects  = resp.data;
        $ctrl.ready = true;
      })

    //~ $timeout(function(){ console.log("attrs", $attrs) });
  };
  
  $ctrl.FilterData = function(ask){
    var filter = $ctrl.param['фильтр'];
    //~ var tab = $ctrl.tab;
    //~ if(!tab) return !1;
    //~ var filter = tab.filter;
    if(!filter) return !0;
    return filter(ask);
    
  };
  
  $ctrl.InitAsk = function(ask){// обработанные снабжением
    if(ask._init) return;
    if(ask['позиции тмц']) ask['позиции тмц'].map(function(row){ /*var r = angular.isString(row) ? JSON.parse(row) : row; /*r['$дата/принято'] = JSON.parse(r['$дата/принято'] || '{}');*/ if($ctrl.param['ТМЦ/крыжик позиций/событие'] && !row.hasOwnProperty('крыжик количества')) {row['крыжик количества'] = !!row['количество/принято'];} return row; });
    //~ if(ask['@дата1']) ask['@дата1'] = JSON.parse(ask['@дата1']);
    //~ ask['грузоотправители'] = ask['грузоотправители/json'].map(function(it){ return JSON.parse(it); });
    ask.driver = {"id": ask['водитель-профиль/id'], "title": (ask['водитель-профиль'] && ask['водитель-профиль'].join(' ')) || ask['водитель'] && ask['водитель'][0], "phone": ask['водитель-профиль/телефон'] || ask['водитель'] && ask['водитель'][1],  "doc": ask['водитель-профиль/док'] || ask['водитель'] && ask['водитель'][2]};
    //~ ask.addr1= JSON.parse(ask['откуда'] || '[[]]');
    //~ ask.addr2= JSON.parse(ask['куда'] || '[[]]');
   
    //~ ask['с объекта'] = JSON.parse(ask['с объекта/json'] || '{}');//.map(function(js){ return JSON.parse(js || '[]'); });
    //~ ask['на объект'] =  JSON.parse(ask['на объект/json'] || '{}');
    //~ console.log("InitSnabAsk", ask);
    
    ask._init = true;
    return ask;
  };
  $ctrl.ObjectOrAddress =  function(adr){// adr - строка адреса, objs - объекты
    var id = (/^#(\d+)$/.exec(adr) || [])[1];
    if (!id) return {name: adr};
    var ob = $ctrl.objects.filter(function(it){ return it.id == id; }).pop();
    if (!ob) return {name: "???"};
    if (!/^\s*★/.test(ob.name)) ob.name = ' ★ '+ob.name;
    return ob;
  };
  
  $ctrl.EditAsk = function(ask){
    if(!ask) return !!$attrs.onEditAsk;
    if($attrs.onEditAsk) return $ctrl.onEditAsk({ask: ask});
  };
  
  /*$ctrl.SaveAsk = function(ask){
    if($ctrl.param['ТМЦ заявки транспорт/событие сохранения']) $rootScope.$broadcast($ctrl.param['ТМЦ заявки транспорт/событие сохранения'], ask);
    
  };*/
  
};

/*=============================================================*/

module

.component('tmcSnabTransport', {
  templateUrl: "tmc/snab/transport",
  //~ scope: {},
  bindings: {
    data: '<', //массив заявок
    param: '<',
    onEditAsk: '&',

  },
  controller: Component
})

;

}());